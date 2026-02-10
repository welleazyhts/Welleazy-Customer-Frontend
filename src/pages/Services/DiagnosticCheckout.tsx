import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, Button, Row, Col,
    Alert, Spinner, Badge,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faRupeeSign,
    faCalendarCheck,
    faChevronLeft,
    faMapMarkerAlt,
    faCalendar,
    faClock,
    faNotesMedical,
} from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './DiagnosticCart.css';
import { labTestsAPI } from '../../api/labtests';
import { gymServiceAPI } from '../../api/GymService';
import { toast } from "react-toastify";
import { CartItem, DiagnosticCenter } from '../../types/labtests';

const DiagnosticCheckout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { singleItem, selectedDC } = location.state as { singleItem: CartItem; selectedDC: DiagnosticCenter } || {};

    const [loading, setLoading] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useEffect(() => {
        if (!singleItem) {
            toast.error("No item selected for checkout");
            navigate('/diagnostic-cart');
        }
    }, [singleItem, navigate]);

    // Load Razorpay script
    useEffect(() => {
        const loadRazorpayScript = () => {
            if ((window as any).Razorpay) {
                setRazorpayLoaded(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => setRazorpayLoaded(true);
            document.body.appendChild(script);
        };
        loadRazorpayScript();
    }, []);

    const handleProceedToPayment = async () => {
        if (!razorpayLoaded) {
            toast.error("Payment gateway loading...");
            return;
        }

        setPaymentProcessing(true);
        try {
            const customerName = localStorage.getItem("DisplayName") || "Customer";
            const customerMobile = localStorage.getItem("customerMobile") || "";
            const totalAmount = subtotal - discount;

            const options = {
                key: "rzp_live_LWNsKcrWzYLuC7",
                amount: totalAmount * 100, // into paise
                currency: "INR",
                name: "Welleazy",
                description: `Booking Fee for ${singleItem.testName}`,
                image: "/logo.png",
                handler: async function (response: any) {
                    toast.success("Payment successful! Your test is booked.");
                    // In a real app, you would send this to your backend here
                    setTimeout(() => {
                        setPaymentProcessing(false);
                        navigate('/my-bookings');
                    }, 2000);
                },
                prefill: {
                    name: customerName,
                    email: localStorage.getItem("customerEmail") || "",
                    contact: customerMobile
                },
                theme: { color: "#0d6efd" },
                modal: {
                    ondismiss: function () {
                        setPaymentProcessing(false);
                        toast.info("Payment cancelled.");
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (paymentResponse: any) {
                setPaymentProcessing(false);
                toast.error(`Payment failed: ${paymentResponse.error.description}`);
            });

        } catch (error) {
            toast.error("Failed to initiate payment");
            setPaymentProcessing(false);
        }
    };

    if (!singleItem) return null;

    const subtotal = singleItem.price * singleItem.quantity;
    const discount = Math.round(subtotal * 0.1); // 10% mock discount
    const total = subtotal - discount;

    return (
        <div className="diagnostic-cart-page">
            <Container>
                <div className="diagnostic-cart-header text-center">
                    <button className="back-btn" onClick={() => navigate(-1)} style={{ position: 'absolute', left: 0, top: '10px' }}>
                        <FontAwesomeIcon icon={faChevronLeft} /> Back
                    </button>
                    <h1>Secure Checkout</h1>
                    <p className="text-muted">Finalize your booking for {singleItem.testName}</p>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="mb-4">
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Selected Item</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1">{singleItem.testName}</h5>
                                        <p className="text-muted mb-1">
                                            For: {singleItem.selectedFor === 'self' ? 'Self' : (singleItem.dependentName || 'Dependent')}
                                        </p>
                                        <p className="mb-1">
                                            <Badge bg="secondary">
                                                {((selectedDC?.VisitType || '').toLowerCase().includes('home')) ? '1 ' : '2 '}
                                                {selectedDC?.VisitType || 'Visit Type'}
                                            </Badge>
                                        </p>
                                        {singleItem.appointmentDate && (
                                            <p className="mb-0 text-primary">
                                                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                                {singleItem.appointmentDate} at {singleItem.appointmentTime}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-end">
                                        <h4 className="text-primary">
                                            <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                                            {subtotal.toFixed(2)}
                                        </h4>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                    </Col>

                    <Col lg={4}>
                        <Card className="sticky-top consultation-order-card" style={{ top: '20px' }}>
                            <Card.Header className="bg-light">
                                <h5 className="mb-0">Order Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="price-breakdown mb-4">
                                    <div className="price-row d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span className="fw-bold">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="price-row d-flex justify-content-between mb-2">
                                        <span>Discount:</span>
                                        <span className="fw-bold text-success">-₹{discount.toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="total-row d-flex justify-content-between mt-3">
                                        <h5>Total:</h5>
                                        <h4>₹{total.toFixed(2)}</h4>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-100 order-btn"
                                    onClick={handleProceedToPayment}
                                    disabled={paymentProcessing}
                                >
                                    {paymentProcessing ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                                            Pay ₹{total.toFixed(2)}
                                        </>
                                    )}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DiagnosticCheckout;
