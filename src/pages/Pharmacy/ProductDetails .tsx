import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './ProductDetails.css';
import { PharmacyAPI } from '../../api/Pharmacy';
import { 
  ProductDetailsData, 
  StoredProductDetails, 
  CartItem,
  PillowMedicine 
} from '../../types/Pharmacy';

const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState<string>('');
  const [productData, setProductData] = useState<ProductDetailsData | null>(null);
  const [pilloProductData, setPilloProductData] = useState<any>(null);
  const [storedProductDetails, setStoredProductDetails] = useState<StoredProductDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [isMedicineInCart, setIsMedicineInCart] = useState<boolean>(false);
  const [existingCartQuantity, setExistingCartQuantity] = useState<number>(0);
  const [vendor, setVendor] = useState<'1mg' | 'pillo'>('1mg');

  useEffect(() => {
    const storedProductId = localStorage.getItem('selectedProductId');
    const storedDetails = localStorage.getItem('selectedProductDetails');    
    
    if (!storedProductId) {
      setError('Product ID not found. Please go back and select a product.');
      setLoading(false);
      return;
    }
    
    setProductId(storedProductId);
    
    if (storedDetails) {
      try {
        const parsedDetails: StoredProductDetails & { vendor?: '1mg' | 'pillo', isPillo?: boolean } = JSON.parse(storedDetails);
        setStoredProductDetails(parsedDetails);
        
        // Determine vendor
        if (parsedDetails.vendor === 'pillo' || parsedDetails.isPillo) {
          setVendor('pillo');
        } else {
          setVendor('1mg');
        }
        
        if (parsedDetails.image) {
          setSelectedImage(parsedDetails.image);
        }
      } catch (error) {
        console.error('Error parsing stored product details:', error);
      }
    }
    
    fetchProductDetails(storedProductId);
  }, []);

  // Check if medicine is already in cart
  const checkIfMedicineInCart = (productId: string, productName: string) => {
    try {
      const cartKey = localStorage.getItem('LoginRefId') 
        ? `pharmacyCart_${localStorage.getItem('LoginRefId')}` 
        : 'pharmacyCart_guest';
      
      const existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      const existingItem = existingCart.find((item: CartItem) => 
        item.OneMGSearchAllResultDetailsId === productId
      );
      
      if (existingItem) {
        setIsMedicineInCart(true);
        setExistingCartQuantity(existingItem.quantity || 0);
        return true;
      }
      
      setIsMedicineInCart(false);
      setExistingCartQuantity(0);
      return false;
    } catch (error) {
      console.error('Error checking cart:', error);
      return false;
    }
  };

  const fetchProductDetails = async (id: string) => {
    try {
      setLoading(true);
      
      const storedDetails = JSON.parse(localStorage.getItem('selectedProductDetails') || '{}');
      const isPillo = storedDetails.vendor === 'pillo' || storedDetails.isPillo;
      
      if (isPillo) {
        // Fetch Pillo product details
        const data = await PharmacyAPI.Pillowmedicinesview(id);
        
        if (data.status_code === "1" && data.data) {
          setPilloProductData(data.data);
          setVendor('pillo');
          
          if (data.data.medicine_image && data.data.medicine_image.includes('http')) {
            setSelectedImage(data.data.medicine_image);
          } else if (data.data.image && data.data.image.includes('http')) {
            setSelectedImage(data.data.image);
          }
          
          // Check if this medicine is already in cart
          checkIfMedicineInCart(id, data.data.medicine_name);
        } else {
          throw new Error('Invalid Pillo product data');
        }
      } else {
        // Fetch 1mg product details
        const data = await PharmacyAPI.DrugStatic({
          sku_id: id,
          client: "app",
          locale: "en"
        });

        if (data.is_success && data.data) {
          setProductData(data.data);
          setVendor('1mg');
          
          if (!selectedImage && data.data.sku.images && data.data.sku.images.length > 0) {
            setSelectedImage(data.data.sku.images[0].medium);
          }
          
          // Check if this medicine is already in cart
          checkIfMedicineInCart(id, data.data.sku.name);
        } else {
          throw new Error('Invalid 1mg product data');
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(vendor === 'pillo' ? 'Failed to load Pillo product details' : 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const getDisplayPrice = () => {
    if (storedProductDetails) {
      return {
        mrp: storedProductDetails.mrp || 0,
        discountedPrice: storedProductDetails.discountedPrice || 0,
        discount: storedProductDetails.discount || 0
      };
    }
    
    // If no stored details, get from API data
    if (vendor === 'pillo' && pilloProductData) {
      return {
        mrp: pilloProductData.mrp || 0,
        discountedPrice: pilloProductData.price || 0,
        discount: pilloProductData.discount_percentage || 0
      };
    }
    
    return { mrp: 0, discountedPrice: 0, discount: 0 };
  };

  const { mrp, discountedPrice, discount } = getDisplayPrice();

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const getUserCartKey = () => {
    const loginRefId = localStorage.getItem("LoginRefId");
    return loginRefId ? `pharmacyCart_${loginRefId}` : 'pharmacyCart_guest';
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      const cartKey = getUserCartKey();
      const existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      let productToAdd: CartItem;
      
      if (vendor === 'pillo' && pilloProductData) {
        // Add Pillo product to cart
        productToAdd = {
          OneMGSearchAllResultDetailsId: pilloProductData.id,
          name: pilloProductData.medicine_name,
          img: selectedImage || '/pillo-medicine-placeholder.png',
          MRP: pilloProductData.mrp?.toString() || '0',
          DiscountedPrice: pilloProductData.price?.toString() || '0',
          Discount: pilloProductData.discount_percentage ? `${pilloProductData.discount_percentage}%` : '',
          Available: pilloProductData.in_stock !== false,
          quantity: quantity,
          price: pilloProductData.price || 0,
          inventoryData: null,
          vendor: 'pillo',
          packSize: pilloProductData.pack_size,
          manufacturer: pilloProductData.manufacturer_name,
          brandName: pilloProductData.medicine_name,
          dosageType: pilloProductData.dosage_type,
          isRxRequired: pilloProductData.is_rx_required === 1
        };
      } else if (vendor === '1mg' && storedProductDetails) {
        // Add 1mg product to cart
        productToAdd = {
          OneMGSearchAllResultDetailsId: productId,
          name: storedProductDetails.name,
          img: selectedImage || '/default-medicine.png',
          MRP: mrp.toString(),
          DiscountedPrice: discountedPrice.toString(),
          Discount: discount.toString(),
          Available: true,
          quantity: quantity,
          price: discountedPrice,
          inventoryData: null,
          vendor: '1mg'
        };
      } else {
        throw new Error('Invalid product data');
      }

      // Find existing product in cart
      const existingProductIndex = existingCart.findIndex((item: CartItem) => 
        item.OneMGSearchAllResultDetailsId === productToAdd.OneMGSearchAllResultDetailsId
      );

      if (existingProductIndex >= 0) {
        // Update existing item
        existingCart[existingProductIndex].quantity += quantity;
      } else {
        // Add new item
        existingCart.push(productToAdd);
      }
      
      // Save updated cart
      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      
      // Update state to show medicine is in cart
      const newQuantity = existingCart.find(item => item.OneMGSearchAllResultDetailsId === productToAdd.OneMGSearchAllResultDetailsId)?.quantity || quantity;
      setIsMedicineInCart(true);
      setExistingCartQuantity(newQuantity);
      
      // Show success message
      alert(`Medicine added to cart! Total quantity: ${newQuantity}`);
      
      // Reset quantity to 1
      setQuantity(1);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGoToCart = () => {
    navigate('/pharmacy/cart');
  };

  const handleContinueShopping = () => {
    setIsMedicineInCart(false);
    setExistingCartQuantity(0);
  };

  const renderTabContent = () => {
    if (vendor === 'pillo' && pilloProductData) {
      return renderPilloTabContent();
    } else if (vendor === '1mg' && productData) {
      return render1mgTabContent();
    }
    return null;
  };

  const render1mgTabContent = () => {
    if (!productData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {productData.composition?.introduction && (
              <section className="detail-section">
                <h3>Product Introduction</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.introduction.display_text }}
                />
              </section>
            )}

            {productData.composition?.uses && (
              <section className="detail-section">
                <h3>Uses</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.uses.display_text }}
                />
              </section>
            )}

            {productData.composition?.benefits && (
              <section className="detail-section">
                <h3>Benefits</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.benefits.display_text }}
                />
              </section>
            )}
          </div>
        );

      case 'how-to-use':
        return (
          <div className="tab-content">
            {productData.composition?.how_to_take && (
              <section className="detail-section">
                <h3>How to Use</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.how_to_take.display_text }}
                />
              </section>
            )}

            {productData.composition?.mechanism_of_action && (
              <section className="detail-section">
                <h3>How It Works</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.mechanism_of_action.display_text }}
                />
              </section>
            )}

            {productData.composition?.expert_advice && (
              <section className="detail-section">
                <h3>Expert Advice</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.expert_advice.display_text }}
                />
              </section>
            )}
          </div>
        );

      case 'safety':
        return (
          <div className="tab-content">
            {productData.safety_advice && productData.safety_advice.data.length > 0 && (
              <section className="detail-section">
                <h3>Safety Advice</h3>
                <div className="safety-advice-grid">
                  {productData.safety_advice.data.map((advice, index) => (
                    <div key={index} className="safety-item">
                      <span 
                        className="safety-tag"
                        style={{ backgroundColor: advice.tag.bg_color }}
                      >
                        {advice.tag.text}
                      </span>
                      <strong>{advice.display_text}: </strong>
                      <span dangerouslySetInnerHTML={{ __html: advice.description }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {productData.medicine_interaction && productData.medicine_interaction.values.length > 0 && (
              <section className="detail-section">
                <h3>Drug Interactions</h3>
                <div className="interactions-list">
                  {productData.medicine_interaction.values.slice(0, 5).map((interaction, index) => (
                    <div key={index} className="interaction-item">
                      <span className={`interaction-severity ${interaction.severity.toLowerCase()}`}>
                        {interaction.severity}
                      </span>
                      <strong>{interaction.drug.name}: </strong>
                      <span>{interaction.custom_experience}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      case 'side-effects':
        return (
          <div className="tab-content">
            {productData.composition?.side_effects && (
              <section className="detail-section">
                <h3>Side Effects</h3>
                <div 
                  className="detail-content"
                  dangerouslySetInnerHTML={{ __html: productData.composition.side_effects.display_text }}
                />
              </section>
            )}
          </div>
        );

      case 'faq':
        return (
          <div className="tab-content">
            {productData.composition?.faqs && productData.composition.faqs.data.length > 0 && (
              <section className="detail-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                  {productData.composition.faqs.data.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h4>Q: {faq.question}</h4>
                      <p>A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderPilloTabContent = () => {
    if (!pilloProductData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {pilloProductData.content && (
              <section className="detail-section">
                <h3>Composition</h3>
                <div className="detail-content">
                  {pilloProductData.content}
                </div>
              </section>
            )}

            {pilloProductData.description && (
              <section className="detail-section">
                <h3>Description</h3>
                <div className="detail-content">
                  {pilloProductData.description}
                </div>
              </section>
            )}

            {pilloProductData.medicine_uses && (
              <section className="detail-section">
                <h3>Uses</h3>
                <div className="detail-content">
                  {pilloProductData.medicine_uses}
                </div>
              </section>
            )}
          </div>
        );

      case 'how-to-use':
        return (
          <div className="tab-content">
            {pilloProductData.how_to_use && (
              <section className="detail-section">
                <h3>How to Use</h3>
                <div className="detail-content">
                  {pilloProductData.how_to_use}
                </div>
              </section>
            )}

            {pilloProductData.how_medicine_works && (
              <section className="detail-section">
                <h3>How It Works</h3>
                <div className="detail-content">
                  {pilloProductData.how_medicine_works}
                </div>
              </section>
            )}

            {pilloProductData.if_miss && (
              <section className="detail-section">
                <h3>If You Miss a Dose</h3>
                <div className="detail-content">
                  {pilloProductData.if_miss}
                </div>
              </section>
            )}
          </div>
        );

      case 'safety':
        return (
          <div className="tab-content">
            <section className="detail-section">
              <h3>Safety Information</h3>
              <div className="safety-advice-grid">
                {pilloProductData.alcohol && (
                  <div className="safety-item">
                    <span className="safety-tag" style={{ backgroundColor: '#ffebee' }}>
                      Alcohol
                    </span>
                    <div className="detail-content">
                      {pilloProductData.alcohol}
                    </div>
                  </div>
                )}

                {pilloProductData.pregnancy && (
                  <div className="safety-item">
                    <span className="safety-tag" style={{ backgroundColor: '#e3f2fd' }}>
                      Pregnancy
                    </span>
                    <div className="detail-content">
                      {pilloProductData.pregnancy}
                    </div>
                  </div>
                )}

                {pilloProductData.lactation && (
                  <div className="safety-item">
                    <span className="safety-tag" style={{ backgroundColor: '#f3e5f5' }}>
                      Lactation
                    </span>
                    <div className="detail-content">
                      {pilloProductData.lactation}
                    </div>
                  </div>
                )}

                {pilloProductData.driving && (
                  <div className="safety-item">
                    <span className="safety-tag" style={{ backgroundColor: '#e8f5e8' }}>
                      Driving
                    </span>
                    <div className="detail-content">
                      {pilloProductData.driving}
                    </div>
                  </div>
                )}

                {pilloProductData.kidney && (
                  <div className="safety-item">
                    <span className="safety-tag" style={{ backgroundColor: '#fff3e0' }}>
                      Kidney
                    </span>
                    <div className="detail-content">
                      {pilloProductData.kidney}
                    </div>
                  </div>
                )}

                {pilloProductData.liver && (
                  <div className="safety-item">
                    <span className="safety-tag" style={{ backgroundColor: '#e0f7fa' }}>
                      Liver
                    </span>
                    <div className="detail-content">
                      {pilloProductData.liver}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {pilloProductData.interaction && (
              <section className="detail-section">
                <h3>Drug Interactions</h3>
                <div className="detail-content">
                  {pilloProductData.interaction}
                </div>
              </section>
            )}
          </div>
        );

      case 'side-effects':
        return (
          <div className="tab-content">
            {pilloProductData.side_effects && (
              <section className="detail-section">
                <h3>Side Effects</h3>
                <div className="detail-content">
                  {pilloProductData.side_effects}
                </div>
              </section>
            )}
          </div>
        );

      case 'faq':
        return (
          <div className="tab-content">
            <section className="detail-section">
              <h3>Product Information</h3>
              <div className="info-grid">
                {pilloProductData.manufacturer_name && (
                  <div className="info-item">
                    <strong>Manufacturer:</strong> {pilloProductData.manufacturer_name}
                  </div>
                )}
                
                {pilloProductData.dosage_type && (
                  <div className="info-item">
                    <strong>Dosage Type:</strong> {pilloProductData.dosage_type}
                  </div>
                )}
                
                {pilloProductData.pack_size && (
                  <div className="info-item">
                    <strong>Pack Size:</strong> {pilloProductData.pack_size}
                  </div>
                )}
                
                {pilloProductData.storage_condition && (
                  <div className="info-item">
                    <strong>Storage:</strong> {pilloProductData.storage_condition}
                  </div>
                )}
                
                {pilloProductData.is_rx_required !== undefined && (
                  <div className="info-item">
                    <strong>Prescription Required:</strong> {pilloProductData.is_rx_required === 1 ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  const getProductName = () => {
    if (vendor === 'pillo' && pilloProductData) {
      return pilloProductData.medicine_name;
    } else if (vendor === '1mg' && productData) {
      return productData.sku.name;
    } else if (storedProductDetails) {
      return storedProductDetails.name;
    }
    return 'Product Details';
  };

  const getManufacturer = () => {
    if (vendor === 'pillo' && pilloProductData) {
      return pilloProductData.manufacturer_name;
    } else if (vendor === '1mg' && productData && productData.sku.marketer) {
      return productData.sku.marketer.name;
    }
    return '';
  };

  const getComposition = () => {
    if (vendor === 'pillo' && pilloProductData) {
      return pilloProductData.content;
    } else if (vendor === '1mg' && productData && productData.composition) {
      return `${productData.composition.name} ${productData.composition.strength?.display_text || ''}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || (!productData && !pilloProductData)) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <p>{error || 'Product not found'}</p>
          <button onClick={handleBackClick} className="back-btn">
            Go Back to Pharmacy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Container>
        <div className="product-details-header">
          <button onClick={handleBackClick} className="back-button">
            <span className="back-arrow">←</span>
            Back to Pharmacy
          </button>
          <div className="vendor-badge">
            <span className={`vendor-tag ${vendor}`}>{vendor.toUpperCase()}</span>
          </div>
        </div>

        <div className="product-details-layout">
          <div className="product-images-section">
            
            <div className="main-image-container">
  {selectedImage && selectedImage.includes('http') && !selectedImage.includes('default.jpg') ? (
    <img 
      src={selectedImage} 
      alt={getProductName()}
      className="main-product-image"
      onError={(e) => {
        (e.target as HTMLImageElement).src = vendor === 'pillo' ? '/pillo.png' : '/default-medicine.png';
      }}
    />
  ) : vendor === 'pillo' ? (
    <div className="pillo-main-image-placeholder">
      <img 
        src="/pillo.png" 
        alt="Pillo" 
        className="pillo-main-logo"
      />
      <div className="vendor-placeholder-label">Pillo Medicine</div>
    </div>
  ) : (
    <img 
      src="/default-medicine.png" 
      alt={getProductName()}
      className="main-product-image"
    />
  )}
</div>
            
            {vendor === '1mg' && productData?.sku.images && productData.sku.images.length > 1 && (
              <div className="image-thumbnails">
                {productData.sku.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail-item ${selectedImage === image.medium ? 'active' : ''}`}
                    onClick={() => setSelectedImage(image.medium)}
                  >
                    <img 
                      src={image.thumbnail} 
                      alt={`${getProductName()} view ${index + 1}`}
                      className="thumbnail-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-medicine.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="pricing-section">
              <div className="price-display">
                {discountedPrice > 0 && discountedPrice < mrp ? (
                  <>
                    <div className="discounted-price">₹{discountedPrice}</div>
                    <div className="original-price">₹{mrp}</div>
                    <div className="discount-badge">{discount}% OFF</div>
                  </>
                ) : mrp > 0 ? (
                  <div className="normal-price">₹{mrp}</div>
                ) : (
                  <div className="price-not-available">Price not available</div>
                )}
              </div>
            </div>
            
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button 
                  type="button" 
                  className="quantity-btn decrement"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  className="quantity-input"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                />
                <button 
                  type="button" 
                  className="quantity-btn increment"
                  onClick={incrementQuantity}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Medicine Already in Cart Message */}
            {isMedicineInCart && (
              <div className="medicine-in-cart-alert">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <strong>This medicine is already in your cart!</strong>
                  <p>Current quantity in cart: {existingCartQuantity}</p>
                  <div className="alert-actions">
                    <button 
                      className="go-to-cart-btn"
                      onClick={handleGoToCart}
                    >
                      View Cart
                    </button>
                    <button 
                      className="continue-shopping-btn"
                      onClick={handleContinueShopping}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              className={`add-to-cart-btn ${addingToCart ? 'loading' : ''} ${isMedicineInCart ? 'already-in-cart' : ''}`} 
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? 'Adding...' : 
               isMedicineInCart ? 'Add More to Cart' : 
               `Add to Cart (${quantity})`}
            </button>
          </div>
          
          <div className="product-info-section">
            <div className="product-basic-info">
              <h1>{getProductName()}</h1>
              {getManufacturer() && (
                <p className="manufacturer">by {getManufacturer()}</p>
              )}
              
              <div className="product-meta">
                {getComposition() && (
                  <div className="composition">
                    <strong>Composition: </strong>
                    {getComposition()}
                  </div>
                )}
                
                {vendor === '1mg' && productData?.sku.therapeutic_class && (
                  <div className="therapeutic-class">
                    <strong>Therapeutic Class: </strong>
                    {productData.sku.therapeutic_class}
                  </div>
                )}
                
                {vendor === '1mg' && productData?.sku.storage_condition && (
                  <div className="storage">
                    <strong>Storage: </strong>
                    {productData.sku.storage_condition.display_text}
                  </div>
                )}
              </div>
            </div>
            
            <div className="product-tabs">
              <div className="tab-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'how-to-use' ? 'active' : ''}`}
                  onClick={() => setActiveTab('how-to-use')}
                >
                  How to Use
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
                  onClick={() => setActiveTab('safety')}
                >
                  Safety Info
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'side-effects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('side-effects')}
                >
                  Side Effects
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faq')}
                >
                  Info
                </button>
              </div>
              
              <div className="tab-content-container">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetails;