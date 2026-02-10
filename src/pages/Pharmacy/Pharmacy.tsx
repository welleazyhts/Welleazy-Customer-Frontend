import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Card, Button, Form, InputGroup } from 'react-bootstrap';
import './Pharmacy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faShoppingCart,
  faUpload,
  faMinus,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { PharmacyAPI } from '../../api/Pharmacy';
import { PharmacyMedicine, CartSummary } from '../../types/Pharmacy';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Pharmacy: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState<PharmacyMedicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<CartSummary | null>(() => {
    const saved = localStorage.getItem('pharmacy_cart');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<PharmacyMedicine[]>([]);
  const [sortBy, setSortBy] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load medicines and cart on mount
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medicinesData, cartData] = await Promise.all([
        PharmacyAPI.getMedicines(),
        PharmacyAPI.getCart().catch(() => null)
      ]);
      const meds = Array.isArray(medicinesData) ? medicinesData : (medicinesData as any)?.data || [];
      setMedicines(meds);
      if (user && cartData) {
        if (!cartData.items) cartData.items = [];
        setCart(cartData);
        localStorage.setItem('pharmacy_cart', JSON.stringify(cartData));
      } else if (!user) {
        setCart(null);
        localStorage.removeItem('pharmacy_cart');
      }
    } catch (error) {
      console.error("Error loading pharmacy data:", error);
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchTerm.trim() && !sortBy) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await PharmacyAPI.filterMedicines(searchTerm, sortBy);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
  };

  // Trigger search when sort changes
  useEffect(() => {
    if (sortBy) {
      handleSearch();
    }
  }, [sortBy]);

  // Reactive local filtering by the 'name' field
  const localNameFilteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return medicines;
    return medicines.filter(m =>
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, medicines]);

  // Priority logic with client-side sorting reinforcement
  const displayedMedicines = useMemo(() => {
    let list = [...medicines];

    // Choose base list: results from API search preferred, 
    // then local filtering, then default medicines
    if (searchResults && searchResults.length > 0) {
      list = [...searchResults];
    } else if (searchTerm.trim()) {
      list = [...localNameFilteredMedicines];
    }

    if (!sortBy) return list;

    // Apply sorting locally to ensure immediate UI feedback
    return [...list].sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'discount') return b.discount - a.discount;
      return 0;
    });
  }, [searchResults, localNameFilteredMedicines, medicines, searchTerm, sortBy]);

  const getCartQuantity = (medicineId: number) => {
    if (!cart) return 0;
    const item = cart.items.find(i => i.medicine.id === medicineId);
    return item ? item.quantity : 0;
  };

  const getCartItemId = (medicineId: number) => {
    if (!cart) return null;
    const item = cart.items.find(i => i.medicine.id === medicineId);
    return item ? item.id : null;
  };

  const handleAddToCart = async (medicine: PharmacyMedicine) => {
    if (!user) {
      toast.error("Please login to add to cart");
      // navigate('/login');
      return;
    }

    setLoadingCart(true);
    try {
      await PharmacyAPI.addToCart(medicine.id, 1);
      const updatedCart = await PharmacyAPI.getCart();
      setCart(updatedCart);
      localStorage.setItem('pharmacy_cart', JSON.stringify(updatedCart));
      toast.success("Added to cart");
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error("Failed to add to cart");
    } finally {
      setLoadingCart(false);
    }
  };

  const updateQuantity = async (medicineId: number, change: number) => {
    if (!user || !cart) return;

    const cartItemId = getCartItemId(medicineId);
    if (!cartItemId) return;

    setLoadingCart(true);
    try {
      if (change > 0) {
        await PharmacyAPI.increaseQuantity(cartItemId);
      } else {
        await PharmacyAPI.decreaseQuantity(cartItemId);
      }
      const updatedCart = await PharmacyAPI.getCart();
      setCart(updatedCart);
      localStorage.setItem('pharmacy_cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Update quantity failed:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  const handleUploadPrescription = () => {
    if (!user) {
      toast.error("Please login to upload prescription");
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const loadingToast = toast.loading("Uploading prescription...");
        await PharmacyAPI.uploadPrescription(file);
        toast.dismiss(loadingToast);
        toast.success("Prescription uploaded successfully");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload prescription");
      }
    }
  };

  return (
    <div className="pharmacy-page">
      <Container fluid className="px-lg-5">
        {/* Header with Search and Cart */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div className="d-flex align-items-center gap-3">
            <h2 className="mb-0 fw-bold">Pharmacy</h2>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={handleUploadPrescription}
                className="d-flex align-items-center gap-2"
                style={{ borderRadius: '8px' }}
              >
                <FontAwesomeIcon icon={faUpload} />
                Upload Prescription
              </Button>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={onFileSelected}
                accept="image/*,.pdf"
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 flex-grow-1 justify-content-end">
            <div className="search-section" style={{ maxWidth: '600px', width: '100%' }}>
              <Form onSubmit={handleSearch} className="w-100">
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search for medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 shadow-none border-end-0"
                  />
                  <Button variant="primary" type="submit" style={{ minWidth: '100px' }}>Search</Button>
                </InputGroup>
              </Form>
            </div>

            <div className="position-relative" style={{ cursor: 'pointer' }} onClick={() => navigate('/pharmacy/cart')}>
              <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '45px', height: '45px', border: '1px solid #eee' }}>
                <FontAwesomeIcon icon={faShoppingCart} className="text-primary fs-5" />
              </div>
              {cart && cart.items && cart.items.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                  {cart.items.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sort and Info Bar */}
        <div className="d-flex justify-content-end align-items-center mb-4 gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-bold">SortBy</span>
            <Form.Select
              size="sm"
              style={{ width: '200px', backgroundColor: '#f4f6fa', border: 'none', borderRadius: '8px' }}
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="">Sort by</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="discount">Discount</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center justify-content-center border rounded-circle" style={{ width: '24px', height: '24px', color: '#ff6b1c', borderColor: '#ff6b1c', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            i
          </div>
        </div>

        <div className="pharmacy-content-wrapper">
          {/* Sidebar Filters */}
          <aside className="pharmacy-filters-sidebar">
            <div className="filter-header" style={{ backgroundColor: '#f9a886', margin: '-20px -20px 20px -20px', padding: '12px 20px', borderRadius: '12px 12px 0 0' }}>
              <h3 className="text-white fs-6 mb-0">FILTER</h3>
            </div>

            <div className="Pharmacy-filter-section">
              <h4 className="filter-section-title">Online Medicine Vendors</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  1mg
                </label>
              </div>
            </div>

            <div className="Pharmacy-filter-section">
              <h4 className="filter-section-title">Offline Medicine Vendors</h4>
              <div className="filter-options">
                <label className="filter-option" onClick={() => navigate('/pharmacy/offline-medicine')}>
                  <img src="/apolloLogo.png" alt="Apollo" style={{ width: '20px' }} />
                  Apollo
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content Grid */}
          <div className="pharmacy-products-container">
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : displayedMedicines.length > 0 ? (
              <div className="pharmacy-products">
                {displayedMedicines.map((medicine) => {
                  const quantity = getCartQuantity(medicine.id);

                  return (
                    <div className="pharmacy-product-card" key={medicine.id}>
                      {medicine.discount > 0 && (
                        <div className="pharmacy-product-discount" style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold' }}>
                          {medicine.discount}% off
                        </div>
                      )}

                      <div className="pharmacy-TATAImage">
                        <img src="/Tata_1mg.png" alt="TATA 1mg" className="pharmacy-tata-logo" />
                      </div>

                      <div className="pharmacy-product-img">
                        <img
                          src={medicine.image || '/default-medicine.png'}
                          alt={medicine.name}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      <div className="pharmacy-product-title">{medicine.name}</div>
                      <div className="pharmacy-product-details text-muted small">
                        {medicine.manufacturer || (medicine.pack_size ? `strip of ${medicine.pack_size}` : 'strip of 10 tablets')}
                      </div>

                      <hr className="my-2" style={{ borderTop: '1px solid #eee' }} />

                      <div className="pharmacy-product-prices mt-auto">
                        <div className="d-flex flex-column">
                          <span className="pharmacy-product-price">₹{medicine.price}</span>
                          {medicine.mrp > medicine.price && (
                            <span className="pharmacy-product-oldprice">₹{medicine.mrp}</span>
                          )}
                        </div>

                        <Button
                          variant="warning"
                          className="pharmacy-product-add ms-auto"
                          style={{
                            backgroundColor: '#ff6b1c',
                            borderColor: '#ff6b1c',
                            color: '#fff',
                            width: 'auto',
                            padding: '6px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}
                          onClick={() => handleAddToCart(medicine)}
                          disabled={loadingCart}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 no-results-message">
                <p className="text-muted fs-5">No medicines found</p>
                {searchTerm && (
                  <Button variant="link" onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                  }}>Clear Search</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Pharmacy;