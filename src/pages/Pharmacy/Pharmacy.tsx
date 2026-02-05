import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './Pharmacy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSearch, faMinus, faPlus, faTrash, faShoppingCart, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { PharmacyAPI } from '../../api/Pharmacy';
import { 
  PharmacyProductList, 
  CartItem, 
  OneMGPharmacyAddToCartDetailsRequest, 
  PilloProduct,
  PillowMedicine 
} from '../../types/Pharmacy';
import { useAuth } from '../../context/AuthContext';

const Pharmacy: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const getUserCartKey = () => {
    if (user && user.loginRefId) {
      return `pharmacyCart_${user.loginRefId}`;
    }
    return `pharmacyCart_guest`;
  };

  // Vendor states
  const [selectedVendors, setSelectedVendors] = useState<{
    '1mg': boolean;
    pillo: boolean;
    apollo: boolean;
  }>({
    '1mg': true,
    pillo: false,
    apollo: false
  });
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Relevance');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPillo, setLoadingPillo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<PharmacyProductList[]>([]);
  const [pilloProducts, setPilloProducts] = useState<PillowMedicine[]>([]);
  const [suggestions, setSuggestions] = useState<(PharmacyProductList | PillowMedicine)[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [searchApplied, setSearchApplied] = useState<boolean>(false);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showViewCart, setShowViewCart] = useState<boolean>(false);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(8);
  
  // Add loading state for add button
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Load cart items
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const cartKey = getUserCartKey();
        const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        setCartItems(existingCart);
        setShowViewCart(existingCart.length > 0);
      } catch (error) {
        setCartItems([]);
      }
    };

    loadCartItems();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getUserCartKey()) {
        loadCartItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Load initial products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productList = await PharmacyAPI.LoadPharmacyProductList();
        const sortedProducts = productList.sort((a, b) => 
          a.Name.localeCompare(b.Name)
        );
        setProducts(sortedProducts.map(p => ({ ...p, vendor: '1mg' as const })));
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Handle vendor selection change
  const handleVendorChange = async (vendor: '1mg' | 'pillo' | 'apollo', checked: boolean) => {
    const newSelectedVendors = {
      ...selectedVendors,
      [vendor]: checked
    };
    
    setSelectedVendors(newSelectedVendors);
    setCurrentPage(1);
    
    // If pillo is selected, load pillo products
    if (vendor === 'pillo' && checked) {
      await loadPilloProducts();
    } else if (vendor === 'pillo' && !checked) {
      setPilloProducts([]);
    }
  };

  // Load pillo products
  const loadPilloProducts = async (searchTerm?: string) => {
    try {
      setLoadingPillo(true);
      const response = await PharmacyAPI.PillowSearchMedicnemsearch(searchTerm || 'medicine');
      
      if (response.status_code === "1" && response.data?.result) {
        setPilloProducts(response.data.result);
      }
    } catch (error) {
      console.error('Error loading Pillo products:', error);
      setPilloProducts([]);
    } finally {
      setLoadingPillo(false);
    }
  };

  // Search suggestions
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim() === '') {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const allSuggestions: (PharmacyProductList | PillowMedicine)[] = [];
        
        // Include 1mg products if selected
        if (selectedVendors['1mg']) {
          const filtered1mgSuggestions = products.filter(product => {
            const searchTermClean = searchTerm.toLowerCase().replace(/\s+/g, '');
            const productNameClean = product.Name.toLowerCase().replace(/\s+/g, '');
            return productNameClean.includes(searchTermClean);
          });
          allSuggestions.push(...filtered1mgSuggestions);
        }
        
        // Include pillo products if selected
        if (selectedVendors.pillo && pilloProducts.length > 0) {
          const filteredPilloSuggestions = pilloProducts.filter(product => {
            const searchTermClean = searchTerm.toLowerCase().replace(/\s+/g, '');
            const productNameClean = product.medicine_name.toLowerCase().replace(/\s+/g, '');
            return productNameClean.includes(searchTermClean);
          });
          allSuggestions.push(...filteredPilloSuggestions);
        }
        
        setSuggestions(allSuggestions);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, products, pilloProducts, selectedVendors]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0].name);
    }
  };

  const handleTalkToSpecialist = () => {
    navigate('/consultation');
  };

  const getProductQuantity = (productId: string): number => {
    const cartItem = cartItems.find(item => item.OneMGSearchAllResultDetailsId === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddClick = async (product: PharmacyProductList | PillowMedicine) => {
    const isPilloProduct = 'medicine_id' in product;
    const productId = isPilloProduct ? product.medicine_id : product.OneMGSearchAllResultDetailsId.toString();
    
    setAddingProductId(productId);
    
    try {
      if (isPilloProduct) {
        // Handle Pillo product addition
        await handleAddPilloProduct(product as PillowMedicine);
      } else {
        // Handle 1mg product addition
        await handleAdd1mgProduct(product as PharmacyProductList);
      }
    } catch (error) {
      console.error("Error in handleAddClick:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleAdd1mgProduct = async (product: PharmacyProductList) => {
    const productId = product.OneMGSearchAllResultDetailsId.toString();
    
    try {
      const cartKey = getUserCartKey();
      let existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');

      const existingProductIndex = existingCart.findIndex(
        (item: CartItem) =>
          item.OneMGSearchAllResultDetailsId === productId
      );

      let newQuantity = 1;

      // 🔑 Determine PharmacyCartDetailsId to send
      let pharmacyCartDetailsIdToSend = 0;
      if (existingCart.length > 0) {
        const firstItemWithCartId = existingCart.find(
          item => item.PharmacyCartDetailsId && item.PharmacyCartDetailsId > 0
        );
        if (firstItemWithCartId) {
          pharmacyCartDetailsIdToSend = firstItemWithCartId.PharmacyCartDetailsId!;
        }
      }

      // Prepare API data for 1mg
      const employeeRefId = localStorage.getItem("EmployeeRefId");
      const loginRefId = localStorage.getItem("LoginRefId");

      if (!employeeRefId || !loginRefId) {
        console.warn("User session missing");
        return;
      }

      const cartData: OneMGPharmacyAddToCartDetailsRequest = {
        MedicineName: product.Name,
        SKUID: product.SKUId || product.OneMGSearchAllResultDetailsId.toString(),
        SKUIdQuantity: 1,
        EmployeeRefId: Number(employeeRefId),
        LoginRefId: Number(loginRefId),
        PharmacyCartDetailsId: pharmacyCartDetailsIdToSend
      };

      console.log("Sending to 1mg server:", cartData);

      // Make API call to 1mg
      const response = await PharmacyAPI.OneMGPharmacyAddToCartDetails(cartData);
      console.log("1mg API Response:", response);

      // Extract PharmacyCartDetailsId from response
      let pharmacyCartDetailsId =
        response?.PharmacyCartDetailsId
          ? Number(response.PharmacyCartDetailsId)
          : pharmacyCartDetailsIdToSend;

      // Now update the cart item with the PharmacyCartDetailsId
      if (existingProductIndex >= 0) {
        existingCart[existingProductIndex].quantity += 1;
        newQuantity = existingCart[existingProductIndex].quantity;
        if (
          pharmacyCartDetailsId > 0 &&
          (!existingCart[existingProductIndex].PharmacyCartDetailsId ||
            existingCart[existingProductIndex].PharmacyCartDetailsId === 0)
        ) {
          existingCart[existingProductIndex].PharmacyCartDetailsId = pharmacyCartDetailsId;
        }
      } else {
        const price = parseFloat(product.DiscountedPrice?.replace("?", "") || "0") || 0;

        const newItem: CartItem = {
          OneMGSearchAllResultDetailsId: product.OneMGSearchAllResultDetailsId.toString(),
          name: product.Name,
          img: product.Image || "/default-medicine.png",
          MRP: product.MRP || "0",
          DiscountedPrice: product.DiscountedPrice || "0",
          Discount: product.Discount || "0",
          Available: product.Available !== undefined ? product.Available : true,
          quantity: 1,
          price: price,
          inventoryData: null,
          PharmacyCartDetailsId: pharmacyCartDetailsId,
          vendor: '1mg',
          packSize: product.PackSize,
          manufacturer: product.Manufacturer,
          brandName: product.Name
        };

        existingCart.push(newItem);
      }

      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      setCartItems(existingCart);
      setShowViewCart(true);

    } catch (error) {
      console.error("Error in handleAdd1mgProduct:", error);
    }
  };

  const handleAddPilloProduct = async (product: PillowMedicine) => {
    const cartKey = getUserCartKey();
    let existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    const existingProductIndex = existingCart.findIndex(
      (item: CartItem) => item.OneMGSearchAllResultDetailsId === product.medicine_id
    );

    if (existingProductIndex >= 0) {
      existingCart[existingProductIndex].quantity += 1;
    } else {
      const newItem: CartItem = {
        OneMGSearchAllResultDetailsId: product.medicine_id,
        name: product.medicine_name,
        img: '/pillo-medicine-placeholder.png',
        MRP: `₹${product.mrp}`,
        DiscountedPrice: `₹${product.price}`,
        Discount: product.mrp > product.price ? 
          `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF` : '',
        Available: product.discontinued === 'no' && product.is_approved === 'yes',
        quantity: 1,
        price: product.price,
        inventoryData: null,
        PharmacyCartDetailsId: 0, // Pillo products will have different cart logic
        vendor: 'pillo',
        packSize: product.pack_size,
        manufacturer: product.manufacturer_name,
        brandName: product.brand_name,
        dosageType: product.dosage_type,
        isRxRequired: product.is_rx_required === 1
      };
      
      existingCart.push(newItem);
    }

    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    setCartItems(existingCart);
    setShowViewCart(true);
  };

  const handleIncrement = async (product: PharmacyProductList | PillowMedicine) => {
    try {
      const cartKey = getUserCartKey();
      const existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      const isPilloProduct = 'medicine_id' in product;
      const productId = isPilloProduct ? product.medicine_id : product.OneMGSearchAllResultDetailsId.toString();
      
      const existingProductIndex = existingCart.findIndex((item: CartItem) => 
        item.OneMGSearchAllResultDetailsId === productId
      );

      if (existingProductIndex >= 0) {
        existingCart[existingProductIndex].quantity += 1;
        localStorage.setItem(cartKey, JSON.stringify(existingCart));
        setCartItems(existingCart);

        // For 1mg products, update server cart
        if (!isPilloProduct) {
          const cartItem = existingCart[existingProductIndex];
          const employeeRefId = localStorage.getItem("EmployeeRefId");
          const loginRefId = localStorage.getItem("LoginRefId");
          
          if (employeeRefId && loginRefId && cartItem.PharmacyCartDetailsId) {
            const cartData: OneMGPharmacyAddToCartDetailsRequest = {
              MedicineName: cartItem.name,
              SKUID: cartItem.OneMGSearchAllResultDetailsId,
              SKUIdQuantity: cartItem.quantity,
              EmployeeRefId: parseInt(employeeRefId),
              LoginRefId: parseInt(loginRefId),
              PharmacyCartDetailsId: cartItem.PharmacyCartDetailsId
            };
            
            console.log('Incrementing 1mg quantity - Sending data:', cartData);
            await PharmacyAPI.OneMGPharmacyAddToCartDetails(cartData);
          }
        }
        // For Pillo products, just update local storage
      }
    } catch (error) {
      console.error('Error in handleIncrement:', error);
    }
  };

  const handleDecrement = async (product: PharmacyProductList | PillowMedicine) => {
    try {
      const cartKey = getUserCartKey();
      const existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      const isPilloProduct = 'medicine_id' in product;
      const productId = isPilloProduct ? product.medicine_id : product.OneMGSearchAllResultDetailsId.toString();
      
      const existingProductIndex = existingCart.findIndex((item: CartItem) => 
        item.OneMGSearchAllResultDetailsId === productId
      );

      if (existingProductIndex >= 0) {
        if (existingCart[existingProductIndex].quantity > 1) {
          existingCart[existingProductIndex].quantity -= 1;
        } else {
          existingCart.splice(existingProductIndex, 1);
        }
        
        localStorage.setItem(cartKey, JSON.stringify(existingCart));
        setCartItems(existingCart);
        setShowViewCart(existingCart.length > 0);
      }
    } catch (error) {
      console.error('Error in handleDecrement:', error);
    }
  };

  const handleRemove = async (product: PharmacyProductList | PillowMedicine) => {
    try {
      const cartKey = getUserCartKey();
      const existingCart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      const isPilloProduct = 'medicine_id' in product;
      const productId = isPilloProduct ? product.medicine_id : product.OneMGSearchAllResultDetailsId.toString();
      
      const updatedCart = existingCart.filter((item: CartItem) => 
        item.OneMGSearchAllResultDetailsId !== productId
      );

      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      setShowViewCart(updatedCart.length > 0);
    } catch (error) {
      console.error('Error in handleRemove:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setSearchApplied(false);
  };

  const handleSearchSubmit = async () => {
    setSearchApplied(true);
    setShowSuggestions(false);
    setCurrentPage(1);
    
    // If pillo is selected and we have a search term, search pillo products
    if (selectedVendors.pillo && searchTerm.trim()) {
      await loadPilloProducts(searchTerm);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setCurrentPage(1); 
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(displayedProducts.length / productsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewCart = () => {
    navigate('/pharmacy/cart');
  };

  const handleContinueShopping = () => {
    setShowViewCart(false);
  };

  const handleCloseCartBanner = () => {
    setShowViewCart(false);
  };

  const handleApolloRedirect = () => {
    navigate('/pharmacy/offline-medicine');
  };

  const locationData = [
    { name: 'New Delhi', img: '/DELHI-8.png' },
    { name: 'Chandigarh', img: '/Chandigarh.png' },
    { name: 'Srinagar', img: '/srinagr.png' },
    { name: 'Cochin', img: '/kochi.png' },
    { name: 'Bangalore', img: '/BANGALORE-8.png' },
    { name: 'Mumbai', img: '/mumbai.png' },
    { name: 'Kolkata', img: '/KOLKATA-8.png' },
    { name: 'Ahmedabad', img: '/AHEMDABAD-8.png' },
    { name: 'Jaipur', img: '/JAIPUR-8.png' },
    { name: 'Lucknow', img: '/LUCKNOW-8.png' },
  ];

  const LOCATIONS_VISIBLE = 4;
  const [locationCarouselIndex, setLocationCarouselIndex] = React.useState(0);

  const handleLocationPrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };

  const handleLocationNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationCarouselIndex(prev =>
        prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };

  const healthConcerns = [
    { label: 'Diabetic Care', img: '/Diabetic Care.png' },
    { label: 'Cough & Cold', img: '/cough & cold.png' },
    { label: 'Pain Relief', img: '/Pain Relief.png' },
    { label: 'Ortho Care', img: '/Ortho Care.png' },
    { label: 'Cardiac Care', img: '/Cardiac care.png' },
    { label: 'Stomach Care', img: '/Stomach care.png' },
    { label: 'Covid Essentials', img: '/Covid Essentials.png' },
  ];

  const pharmacyCategories = [
    { label: 'Covid Essentials', img: '/Covid Essentials.png' },
    { label: 'Devices', img: '/Devices.png' },
    { label: 'Diabetic Care', img: '/Diabetic Care.png' },
    { label: 'Health Food and Drinks', img: '/Health Food and Drinks.png' },
    { label: 'Home Care', img: '/Home Care.png' },
    { label: 'Lifestyle Ailments', img: '/Lifestyle Ailments.png' },
    { label: 'Milk & Dairy', img: '/Milk & Dairy.png' },
  ];

  // Combine and filter products from selected vendors
  const displayedProducts = useMemo(() => {
    let allProducts: (PharmacyProductList | PillowMedicine)[] = [];
    
    // Add 1mg products if selected
    if (selectedVendors['1mg']) {
      allProducts = [...allProducts, ...products];
    }
    
    // Add pillo products if selected
    if (selectedVendors.pillo) {
      allProducts = [...allProducts, ...pilloProducts];
    }
    
    if (allProducts.length === 0) return [];
    
    let currentProducts = [...allProducts];
    
    // Apply search filter if active
    if (searchApplied && searchTerm) {
      currentProducts = currentProducts.filter(product => {
        const searchTermClean = searchTerm.toLowerCase().replace(/\s+/g, '');
        let productNameClean = '';
        
        if ('Name' in product) {
          // 1mg product
          productNameClean = product.Name.toLowerCase().replace(/\s+/g, '');
        } else if ('medicine_name' in product) {
          // Pillo product
          productNameClean = product.medicine_name.toLowerCase().replace(/\s+/g, '');
        }
        
        return productNameClean.includes(searchTermClean);
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'Price: Low to High':
        currentProducts.sort((a, b) => {
          const priceA = 'SortMRP' in a ? a.SortMRP || 0 : ('mrp' in a ? a.mrp : 0);
          const priceB = 'SortMRP' in b ? b.SortMRP || 0 : ('mrp' in b ? b.mrp : 0);
          return priceA - priceB;
        });
        break;
      case 'Price: High to Low':
        currentProducts.sort((a, b) => {
          const priceA = 'SortMRP' in a ? a.SortMRP || 0 : ('mrp' in a ? a.mrp : 0);
          const priceB = 'SortMRP' in b ? b.SortMRP || 0 : ('mrp' in b ? b.mrp : 0);
          return priceB - priceA;
        });
        break;
      case 'Relevance':
      default:
        break;
    }

    return currentProducts;
  }, [products, pilloProducts, searchTerm, sortBy, searchApplied, selectedVendors]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = displayedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(displayedProducts.length / productsPerPage);

  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 4) {
        endPage = 5;
      }
      
      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      }
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const formatPrice = (price: string) => {
    if (!price) return '₹0';
    if (price.startsWith('₹')) return price;
    return price.replace('?', '₹');
  };

const handleProductImageClick = (productId: string, productData: any) => {
  try {
    // Store the product ID
    localStorage.setItem('selectedProductId', productId);
    
    const parsePrice = (price: string): number => {
      if (!price) return 0;
      const cleanedPrice = price.replace(/[^0-9.]/g, '');
      return parseFloat(cleanedPrice) || 0;
    };

    const parseDiscount = (discountText: string): number => {
      if (!discountText) return 0;
      const match = discountText.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    };

    const productDetails = {
      id: productId,
      name: productData.name || 'Unknown Product',
      mrp: parsePrice(productData.mrp || '0'),
      discountedPrice: parsePrice(productData.discountedPrice || '0'),
      discount: parseDiscount(productData.discount || '0'),
      image: productData.image || '/default-medicine.png',
      available: productData.available !== undefined ? productData.available : true,
      // Add vendor information
      vendor: productData.vendor || '1mg',
      isPillo: productData.isPillo || false,
      // Store vendor-specific IDs
      skuId: productData.vendor === '1mg' ? productId : undefined,
      medicineId: productData.vendor === 'pillo' ? productId : undefined
    };

    if (!productDetails.discount && productDetails.mrp > 0 && productDetails.discountedPrice > 0 && productDetails.discountedPrice < productDetails.mrp) {
      productDetails.discount = Math.round(((productDetails.mrp - productDetails.discountedPrice) / productDetails.mrp) * 100);
    }

    localStorage.setItem('selectedProductDetails', JSON.stringify(productDetails));
    navigate('/pharmacy/product');
  } catch (error) {
    console.error('Error navigating to product details:', error);
    alert('Error navigating to product details');
  }
};

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getTotalCartValue = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const renderProductCard = (product: PharmacyProductList | PillowMedicine) => {
    const isPilloProduct = 'medicine_id' in product;
    const productId = isPilloProduct ? product.medicine_id : product.OneMGSearchAllResultDetailsId.toString();
    const quantityInCart = getProductQuantity(productId);
    const isInCart = quantityInCart > 0;
    const isAdding = addingProductId === productId;
    
    // Format price based on vendor
    const formatPriceForVendor = () => {
      if (isPilloProduct) {
        return {
          discountedPrice: `₹${product.price || 0}`,
          mrp: `₹${product.mrp || 0}`,
          discount: product.mrp > product.price ? 
            `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF` : ''
        };
      } else {
        const pharmacyProduct = product as PharmacyProductList;
        return {
          discountedPrice: pharmacyProduct.DiscountedPrice ? pharmacyProduct.DiscountedPrice.replace('?', '₹') : '₹0',
          mrp: pharmacyProduct.MRP ? `₹${pharmacyProduct.MRP}` : '',
          discount: pharmacyProduct.Discount || ''
        };
      }
    };

    const prices = formatPriceForVendor();
    const productName = isPilloProduct ? product.medicine_name : product.Name;
    const productLabel = isPilloProduct ? product.content : product.Label;
    const productImage = isPilloProduct ? '/pillo-medicine-placeholder.png' : (product.Image || '/default-medicine.png');
    const packSize = isPilloProduct ? product.pack_size : (product as PharmacyProductList).PackSize;
    const available = isPilloProduct ? (product.discontinued === 'no' && product.is_approved === 'yes') : product.Available;

    return (
      <div className="pharmacy-product-card" key={productId}>
        {prices.discount && (
          <div className="pharmacy-product-discount">{prices.discount}</div>
        )}
        
        {/* Vendor Logo */}
        {/* <div className="pharmacy-vendor-logo">
          <img 
            src={isPilloProduct ? "/pillo.png" : "/Tata_1mg.png"} 
            alt={isPilloProduct ? "Pillo" : "Tata 1mg"} 
            className="vendor-logo-small" 
          />
        </div> */}

        {/* Vendor Logo with separate classes */}
<div className={`pharmacy-vendor-logo ${isPilloProduct ? 'pillo-logo' : 'tata-logo'}`}>
  <img 
    src={isPilloProduct ? "/pillo.png" : "/Tata_1mg.png"} 
    alt={isPilloProduct ? "Pillo" : "Tata 1mg"} 
    className={`vendor-logo-small ${isPilloProduct ? 'pillo-img' : 'tata-img'}`} 
  />
</div>
        
        {/* Product Image */}
        {/* <div 
          className="pharmacy-product-img pharmacy-product-img-placeholder"
          onClick={() => handleProductImageClick(productId, {
            name: productName,
            mrp: isPilloProduct ? `₹${product.mrp}
            ` : product.MRP,
            discountedPrice: isPilloProduct ? `₹${product.price}` : product.DiscountedPrice,
            discount: prices.discount,
            image: productImage,
            available: available,
            vendor: isPilloProduct ? 'pillo' : '1mg',
            isPillo: isPilloProduct
          })}
          style={{ cursor: 'pointer' }}
        >
          {productImage && !productImage.includes('placeholder') ? (
            <img 
              src={productImage} 
              alt={productName} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            'No Image'
          )}
        </div> */}

       <div 
  className="pharmacy-product-img pharmacy-product-img-placeholder"
  onClick={() => {
    // For 1mg: Must use SKUId specifically
    // For Pillo: Use medicine_id
    const productId = isPilloProduct 
      ? product.medicine_id 
      : (product as PharmacyProductList).SKUId;
    
    if (!productId) {
      console.error('Product ID not found for:', productName);
      return;
    }
    
    handleProductImageClick(productId, {
      name: productName,
      mrp: isPilloProduct ? `₹${product.mrp}` : (product as PharmacyProductList).MRP,
      discountedPrice: isPilloProduct ? `₹${product.price}` : (product as PharmacyProductList).DiscountedPrice,
      discount: prices.discount,
      image: productImage,
      available: available,
      vendor: isPilloProduct ? 'pillo' : '1mg',
      isPillo: isPilloProduct,
      // Pass the appropriate ID type for each vendor
      skuId: !isPilloProduct ? productId : undefined, // Only for 1mg
      medicineId: isPilloProduct ? productId : undefined // Only for Pillo
    })
  }}
  style={{ cursor: 'pointer' }}
>
  {productImage && !productImage.includes('placeholder') ? (
    <img 
      src={productImage} 
      alt={productName} 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  ) : (
    isPilloProduct ? (
      <div className="pillo-logo-placeholder">
        <img 
          src="/pillo.png" 
          alt="Pillo" 
          className="pillo-placeholder-img"
        />
        <span className="vendor-label">Pillo</span>
      </div>
    ) : (
      'No Image'
    )
  )}
</div>
        
        <div className="pharmacy-product-title">{productName}</div>
        <div className="pharmacy-product-details">{productLabel}</div>
        {packSize && (
          <div className="pharmacy-product-packsize">{packSize}</div>
        )}
        
        <div className="pharmacy-product-prices">
          <span className="pharmacy-product-price">{prices.discountedPrice}</span>
          {prices.mrp && prices.mrp !== '₹0' && prices.mrp !== prices.discountedPrice && (
            <span className="pharmacy-product-oldprice">{prices.mrp}</span>
          )}
        </div>
        
        {/* Add to Cart controls */}
        {isInCart ? (
          <div className="quantity-controls-container">
            <div className="quantity-controls">
              <button 
                className="quantity-btn decrement"
                onClick={() => handleDecrement(product)}
                title="Decrease quantity"
              >
                {quantityInCart === 1 ? (
                  <FontAwesomeIcon icon={faTrash} />
                ) : (
                  <FontAwesomeIcon icon={faMinus} />
                )}
              </button>
              
              <span className="quantity-display">{quantityInCart}</span>
              
              <button 
                className="quantity-btn increment"
                onClick={() => handleIncrement(product)}
                disabled={!available}
                title="Increase quantity"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            
            {quantityInCart === 1 && (
              <button 
                className="remove-btn"
                onClick={() => handleRemove(product)}
                title="Remove from cart"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <button 
            className={`pharmacy-product-add ${!available ? 'disabled' : ''} ${isAdding ? 'loading' : ''}`}
            onClick={() => handleAddClick(product)}
            disabled={!available || isAdding}
          >
            {isAdding ? (
              <span className="button-loading">
                <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner-small" />
                Adding...
              </span>
            ) : (
              available ? 'Add' : 'Out of Stock'
            )}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pharmacy-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pharmacy-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className='pharmacy-page'>
      {showViewCart && (
        <div className="modern-cart-banner">
          <div className="modern-cart-content">
            <div className="modern-cart-header">
              <div className="modern-cart-info">
                <div className="modern-cart-icon">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span className="modern-cart-badge">{getTotalCartItems()}</span>
                </div>
                <div className="modern-cart-details">
                  <h4 className="modern-cart-title">Items added to your cart</h4>
                  <p className="modern-cart-subtitle">{getTotalCartItems()} item{getTotalCartItems() !== 1 ? 's' : ''} • ₹{getTotalCartValue().toFixed(2)}</p>
                </div>
              </div>
              <button className="modern-cart-close" onClick={handleCloseCartBanner}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modern-cart-actions">
              <button className="modern-view-cart" onClick={handleViewCart}>
                View Cart & Checkout
                <FontAwesomeIcon icon={faChevronRight} className="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pharmacy-banner-row">
        <div className="pharmacy-banner">
          <img src="/top-banner.png" alt="Rybelsus Banner" className="pharmacy-banner-img" />
          <div className="pharmacy-banner-content">
            {/* ... banner content ... */}
          </div>
        </div>

        <div className="upload-prescription-section">
          <div className="upload-box">
            {!selectedFile && (
              <div className="upload-note">Need Prescription to order medicine ?</div>
            )}
            <button className="talk-specialist-btn" onClick={handleTalkToSpecialist}>TALK TO A SPECIALIST</button>
          </div>
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="pharmacy-search-sort-row">
        <div className="pharmacy-search-bar">
          <div className="search-suggestions-container">
            <input
              type="text"
              placeholder="Search your medicine"
              className="pharmacy-search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <button 
              className="pharmacy-search-btn"
              onClick={handleSearchSubmit}
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((product, index) => {
                  const isPillo = 'medicine_id' in product;
                  const productId = isPillo ? product.medicine_id : product.OneMGSearchAllResultDetailsId.toString();
                  const productName = isPillo ? product.medicine_name : product.Name;
                  
                  return (
                    <div
                      key={`${productId}-${index}`}
                      className="suggestion-item"
                      onMouseDown={(e) => e.preventDefault()} 
                      onClick={() => {
                        setSearchTerm(productName);
                        setShowSuggestions(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faSearch} className="suggestion-icon" />
                      <div className="suggestion-content">
                        <div className="suggestion-name">{productName}</div>
                        <div className="suggestion-vendor">
                          {/* <img 
                            src={isPillo ? "/pillo.png" : "/Tata_1mg.png"} 
                            alt={isPillo ? "Pillo" : "1mg"} 
                            className="suggestion-vendor-logo" 
                          /> */}
                          {/* <span>{isPillo ? 'Pillo' : '1mg'}</span> */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pharmacy-sort-bar">
          <span className="pharmacy-sort-label">Sort by</span>
          <select className="pharmacy-sort-select" value={sortBy} onChange={handleSortChange}>
            <option value="Relevance">Relevance</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="pharmacy-content-wrapper">
        <div className="pharmacy-filters-sidebar">
          <div className="filter-header">
            <h3>Filters</h3>
          </div>
          
          <div className="Pharmacy-filter-section">
            <div className="filter-section-title">Online Medicine Vendors</div>
            <div className="filter-options">
              {/* 1mg Vendor */}
              <div className="filter-option-row">
                <label className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={selectedVendors['1mg']}
                    onChange={(e) => handleVendorChange('1mg', e.target.checked)}
                  />
                  <img src="/Tata_1mg.png" alt="1mg" className="vendor-logo" />
                  1mg
                </label>
              </div>

              {/* Pillo Vendor */}
              <div className="filter-option-row">
                <label className="filter-option">
                  <input 
                    type="checkbox"
                    checked={selectedVendors.pillo}
                    onChange={(e) => handleVendorChange('pillo', e.target.checked)}
                  />
                  <img src="/pillo.png" alt="pillo" className="vendor-logo" />
                  pillo
                  {loadingPillo && (
                    <FontAwesomeIcon icon={faSpinner} spin className="loading-spinner-small" />
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="Pharmacy-filter-section">
            <div className="filter-section-title">Offline Medicine Vendors</div>
            <div className="filter-options">
              <div className="filter-option-row">
                <label 
                  className="filter-option clickable" 
                  onClick={handleApolloRedirect}
                  style={{ cursor: 'pointer' }}
                >
                  <input 
                    type="checkbox"
                    checked={selectedVendors.apollo}
                    onChange={(e) => handleVendorChange('apollo', e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img src="apolloLogo.png" alt="Apollo" className="vendor-logo" />
                  Apollo 
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pharmacy-products-container">
          <div className="pharmacy-products">
            {currentProducts.length > 0 ? (
              currentProducts.map((product, index) => renderProductCard(product))
            ) : (
              <div className="no-results-message">
                {displayedProducts.length === 0 && searchApplied ? 'No medicines found matching your search.' : 'No products available. Select at least one vendor.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {displayedProducts.length > 0 && totalPages > 1 && (
        <div className="pharmacy-pagination-bar">
          <button 
            className="pharmacy-pagination-btn" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="pagination-numbers">
            {getPaginationNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageClick(page as number)}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button 
            className="pharmacy-pagination-btn" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div className="pharmacy-category-section">
        <div className="pharmacy-category-header">
          <div></div>
          <div className="pharmacy-category-spacer"></div>
          <a href="#" className="pharmacy-category-viewall">View All Products</a>
        </div>
        <div className="pharmacy-category-grid">
          {pharmacyCategories.map((cat, idx) => (
            <div className="pharmacy-category-card" key={idx}>
              <div className="pharmacy-category-icon">
                {cat.img && <img src={cat.img} alt={cat.label} className="pharmacy-category-img" />}
              </div>
              <div className="pharmacy-category-label">{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pharmacy-health-concern-section">
        <div className="pharmacy-health-concern-title">Health Concern</div>
        <div className="pharmacy-category-grid">
          {healthConcerns.map((cat, idx) => (
            <div className="pharmacy-category-card" key={idx}>
              <div className="pharmacy-category-icon">
                {cat.img && <img src={cat.img} alt={cat.label} className="pharmacy-category-img" />}
              </div>
              <div className="pharmacy-category-label">{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pharmacy-app-promo-section">
        <div className="pharmacy-app-promo-left">
          <div className="pharmacy-app-promo-title">Download Our App & Get Consultation from anywhere.</div>
          <div className="pharmacy-app-promo-qr-row">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=googleplay" alt="Google Play QR" className="pharmacy-app-promo-qr" />
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=appstore" alt="App Store QR" className="pharmacy-app-promo-qr" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="pharmacy-app-promo-badge" />
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="pharmacy-app-promo-badge" />
          </div>
        </div>
        <div className="pharmacy-app-promo-right">
          <img src="/mobile-pic.png" alt="Mobile App" className="pharmacy-app-promo-phone" />
        </div>
      </div>
</div>
     

      <Container>
        <section className="our-location-sections" style={{ marginBottom: '48px'}}>
          <h2 className="our-location-headings">Our Locations</h2>
          <div className="location-carousel-wrappers">
            <button className="carousel-arrow left" onClick={handleLocationPrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img src={loc.img} alt={loc.name} className="location-img large-location-img" />
                  <div className="location-name large-location-name">{loc.name}</div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={handleLocationNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </Container>
 </div>
  );
};

export default Pharmacy;