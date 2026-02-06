import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import './PharmacyCart.css';
import { PharmacyAPI } from '../../api/Pharmacy';
import { CartSummary, PharmacyAddress } from '../../types/Pharmacy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus, faMapMarkerAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const PharmacyCart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(() => {
    const saved = localStorage.getItem('pharmacy_cart');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);

  // Address State
  const [addresses, setAddresses] = useState<PharmacyAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  // Order State
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  useEffect(() => {
    loadRequisites();
  }, []);

  const loadRequisites = async () => {
    setLoading(true);
    try {
      const [cartData, addressData] = await Promise.all([
        PharmacyAPI.getCart(),
        PharmacyAPI.getAddresses()
      ]);
      if (cartData && !cartData.items) cartData.items = [];
      setCart(cartData);
      if (cartData) {
        localStorage.setItem('pharmacy_cart', JSON.stringify(cartData));
      }
      setAddresses(addressData || []);

      // Auto-select default address if exists
      const defaultAddr = addressData.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressData.length > 0) setSelectedAddressId(addressData[0].id);

    } catch (error) {
      console.error("Failed to load cart/addresses:", error);
      // toast.error("Failed to load cart details");
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    try {
      const updatedCart = await PharmacyAPI.getCart();
      setCart(updatedCart);
      localStorage.setItem('pharmacy_cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  };

  const handleQuantityChange = async (itemId: number, change: number) => {
    try {
      if (change > 0) {
        await PharmacyAPI.increaseQuantity(itemId);
      } else {
        await PharmacyAPI.decreaseQuantity(itemId);
      }
      refreshCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await PharmacyAPI.removeFromCart(itemId);
      toast.success("Item removed");
      refreshCart();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await PharmacyAPI.applyCoupon(couponCode);
      toast.success("Coupon applied successfully");
      setCouponCode('');
      refreshCart();
    } catch (error) {
      toast.error("Invalid Coupon Code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await PharmacyAPI.removeCoupon();
      toast.success("Coupon removed");
      refreshCart();
    } catch (error) {
      toast.error("Failed to remove coupon");
    }
  };

  const handleSelectAddress = async (addressId: number) => {
    try {
      await PharmacyAPI.selectAddress(addressId);
      setSelectedAddressId(addressId);
      setShowAddressModal(false);
      toast.success("Delivery address updated");
    } catch (error) {
      toast.error("Failed to select address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      setShowAddressModal(true);
      return;
    }

    setPlacingOrder(true);
    try {
      // First ensure address is selected on backend if needed, 
      // but we do it on selection so likely fine. 
      // Just in case double check or assume it is set in session/cart context on backend.
      await PharmacyAPI.selectAddress(selectedAddressId);

      const response = await PharmacyAPI.createOrder();
      if (response.status === 'success' || response.message) {
        toast.success("Order placed successfully!");
        navigate('/order-confirmation', { state: { orderId: response.order_id } });
      } else {
        throw new Error(response.message || "Order failed");
      }
    } catch (error: any) {
      console.error("Place order failed:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h3>Your Cart is Empty</h3>
        <Button variant="primary" onClick={() => navigate('/pharmacy')} className="mt-3">
          Continue Shopping
        </Button>
      </Container>
    );
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <Container className="py-4 pharmacy-cart-page">
      <h2 className="mb-4">Shopping Cart ({cart.items.length} Items)</h2>
      <Row>
        <Col lg={8}>
          {/* Cart Items */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              {cart.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-3 cart-item-row">
                  <div className="cart-item-img me-3">
                    <img
                      src={item.medicine.image || '/default-medicine.png'}
                      alt={item.medicine.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{item.medicine.name}</h5>
                    <p className="text-muted small mb-0">{item.medicine.manufacturer}</p>
                    <div className="fw-bold mt-1">₹{item.medicine.price}</div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="light" size="sm"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="px-2 py-1 border border-secondary"
                      style={{ color: '#000', minWidth: '32px' }}
                    >
                      <FontAwesomeIcon icon={faMinus} size="sm" />
                    </Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="light" size="sm"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="px-2 py-1 border border-secondary"
                      style={{ color: '#000', minWidth: '32px' }}
                    >
                      <FontAwesomeIcon icon={faPlus} size="sm" />
                    </Button>
                  </div>
                  <div className="ms-4 text-end" style={{ minWidth: '100px' }}>
                    <div className="fw-bold">₹{item.total_price}</div>
                  </div>
                  <Button
                    variant="link"
                    className="text-danger ms-2"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Address Selection Preview */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
              <span><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" /> Delivery Address</span>
              <Button variant="link" size="sm" onClick={() => setShowAddressModal(true)}>
                {selectedAddress ? 'Change' : 'Select Address'}
              </Button>
            </Card.Header>
            <Card.Body>
              {selectedAddress ? (
                <div>
                  <div className="fw-bold">{selectedAddress.name} <span className="badge bg-light text-dark border ms-2">{selectedAddress.type}</span></div>
                  <div className="text-muted small mt-1">
                    {selectedAddress.address_line1}, {selectedAddress.address_line2 && `${selectedAddress.address_line2}, `}
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </div>
                  <div className="text-muted small">Mobile: {selectedAddress.mobile}</div>
                </div>
              ) : (
                <div className="text-danger">Please select a delivery address</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Checkout Summary */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Order Summary</h5>

              {/* Coupon Section */}
              <div className="mb-3">
                {cart.coupon_code ? (
                  <Alert variant="success" className="d-flex justify-content-between align-items-center py-2 px-3 small">
                    <span>Coupon <strong>{cart.coupon_code}</strong> applied</span>
                    <Button variant="close" size="sm" onClick={handleRemoveCoupon}></Button>
                  </Alert>
                ) : (
                  <div className="d-flex mb-2">
                    <Form.Control
                      placeholder="Enter Coupon Code"
                      size="sm"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button
                      variant="dark" size="sm" className="ms-2"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Cart Total</span>
                <span>₹{cart.total_amount}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Discount</span>
                <span>- ₹{cart.discount_amount}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span>Delivery Charges</span>
                <span>₹{cart.delivery_charges}</span>
              </div>
              <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                <span>Total Payable</span>
                <span>₹{cart.final_amount}</span>
              </div>

              <Button
                variant="primary"
                className="w-100 py-2"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? <Spinner animation="border" size="sm" /> : 'Place Order'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Delivery Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addresses.length === 0 ? (
            <div className="text-center py-4">
              <p>No saved addresses found. Please add a new address in your profile.</p>
              <Button variant="outline-primary" onClick={() => navigate('/my-address')}>Add New Address</Button>
            </div>
          ) : (
            <Row xs={1} md={2} className="g-3">
              {addresses.map(address => (
                <Col key={address.id}>
                  <Card
                    className={`h-100 cursor-pointer ${selectedAddressId === address.id ? 'border-primary bg-light' : ''}`}
                    onClick={() => handleSelectAddress(address.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="badge bg-secondary">{address.type}</span>
                        {selectedAddressId === address.id && <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />}
                      </div>
                      <div className="fw-bold">{address.name}</div>
                      <div className="small text-muted mt-1">
                        {address.address_line1}, {address.address_line2}
                        <br />
                        {address.city}, {address.state} - {address.pincode}
                      </div>
                      <div className="small text-muted mt-1">
                        {address.mobile}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PharmacyCart;