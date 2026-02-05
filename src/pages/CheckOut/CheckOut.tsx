import React, { useEffect, useState } from "react";
import "./CheckOut.css";
import {
  faShoppingCart,
  faCalendarCheck,
  faChevronLeft,
  faTimes,
  faIndianRupeeSign,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { 
  Container, Card, Button, Row, Col, Spinner, Modal
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartItemDetails } from '../../types/CheckOut';
import { CheckOutAPI } from "../../api/CheckOut";
import { toast } from "react-toastify";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckOut: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartUniqueId, employeeRefId } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cartData, setCartData] = useState<CartItemDetails[]>([]);
  const [customerMobile, setCustomerMobile] = useState('+91 9876543210');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [apiResponse, setApiResponse] = useState<{
    Message: string;
    ConsultationCaseAppointmentDetailsId: number;
    DistrictName: string;
  } | null>(null);
  
  useEffect(() => {
    if (!cartUniqueId || !employeeRefId) return;
    const fetchCartDetails = async () => {
      try {
        setLoading(true);
        const data = await CheckOutAPI.CRMGetCustomerCartDetails(
          employeeRefId,
          cartUniqueId
        );
        setCartData(data);
        if (data.length > 0 && data[0].MobileNo) {
          setCustomerMobile(data[0].MobileNo);
        }
        if (data.length > 0 && data[0].PersonName) {
          setPatientName(data[0].PersonName);
        }
      } catch (err) {
        toast.error("Failed to load cart details");
        setCartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cartUniqueId, employeeRefId]);
  
  useEffect(() => {
    const loadRazorpayScript = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      
      script.onerror = () => {
        toast.error("Payment gateway failed to load. Please refresh the page.");
      };
      
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  const calculateSubtotal = () => {
    if (cartData.length === 0) return 0;
    return cartData.reduce((total, item) => total + (item.ItemAmount * item.Quantity), 0);
  };
  
  const calculateTotalInPaise = () => {
    return calculateSubtotal() * 100;
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return dateString;
  };
  
  // Generate appointment ID from CaseRefId or timestamp
  const generateAppointmentId = () => {
    const firstItem = cartData[0];
    
    // If API returns a valid ID, use it
    if (apiResponse?.ConsultationCaseAppointmentDetailsId && apiResponse.ConsultationCaseAppointmentDetailsId > 0) {
      return `#${apiResponse.ConsultationCaseAppointmentDetailsId}`;
    }
    
    // Use CaseRefId if available
    if (firstItem?.CaseRefId) {
      return `#${firstItem.CaseRefId}`;
    }
    
    // Generate from timestamp as fallback
    const timestamp = Date.now().toString().slice(-6);
    return `#AP${timestamp}`;
  };
    
  const redirectToAppointmentVoucher = () => {
    const firstItem = cartData[0];
    
    const voucherData = {
      patientName: firstItem?.PersonName || patientName,
      consultationType: firstItem?.ItemName || 'Tele Consultation',
      doctorName: firstItem?.DoctorName || 'Dr. Rajveer Singh Rathore',
      doctorSpeciality: firstItem?.DoctorSpeciality || 'General Physician',
      appointmentDate: firstItem?.AppointmentDate || '',
      appointmentTime: firstItem?.AppointmentTime || '',
      amountPaid: calculateSubtotal(),
      paymentStatus: calculateSubtotal() === 0 ? 'Free' : 'Paid',
      paymentMethod: calculateSubtotal() === 0 ? 'free' : 'online',
      termsConditions: `1.Service Scope: Welleazy Healthtech Solutions offers tele/video consultations to provide remote access to licensed medical professionals for preliminary assessment, general guidance, and follow-ups.
      \n2.Informed Consent: By initiating a teleconsultation, users consent to receive medical advice virtually, acknowledge limitations inherent to remote diagnostics, and agree to share health information digitally.
      \n3.Clinical Limitations: Teleconsultation does not replace an in-person medical examination. If necessary, the attending practitioner may recommend a physical visit or further investigations.
      \n4.Privacy & Data Protection: All virtual interactions are encrypted and comply with data privacy standards under Indian IT Act, PDPB, and applicable healthcare regulations. Welleazy is committed to maintaining confidentiality and secure storage of health records.
      \n5.Emergency Exclusion: These services are not intended for life-threatening, emergency, or critical care scenarios. Users must approach the nearest hospital or call emergency services for urgent medical attention.
      \n6.Availability & Connectivity: Consultations are subject to clinician availability and stable internet connectivity. Welleazy is not liable for disruptions caused by third-party networks or devices.`,
      disclaimer: 'Disclaimer : That confirmation will be shared in sometime',
      // Add API response data with fallbacks
      consultationId: apiResponse?.ConsultationCaseAppointmentDetailsId || 0,
      districtName: apiResponse?.DistrictName || firstItem?.DoctorCity || '',
      appointmentId: generateAppointmentId(),
      city: apiResponse?.DistrictName || firstItem?.DoctorCity || ''
    };

    console.log("Voucher Data:", voucherData);
    
    navigate("/appointment-voucher", {
      state: { voucherData }
    });
  };

  // Custom Success Modal Component
  const SuccessModal = () => {
    return (
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        backdrop="static"
        keyboard={false}
        dialogClassName="wide-success-modal"
        contentClassName="success-modal-content"
      >
        <Modal.Body className="p-2">
          <div className="d-flex flex-column align-items-center">
            {/* Success Icon */}
            <div className="success-icon mb-3">
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                size="3x" 
                className="text-success"
                style={{ fontSize: '60px' }}
              />
            </div>
            
            {/* Main Title */}
            <h4 className="text-center mb-3" style={{ 
              color: '#2E7D32', 
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              Appointment Request Submitted
            </h4>
            
            {/* Personalized Message */}
            <div className="text-center mb-3" style={{ width: '100%' }}>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.5',
                marginBottom: '0'
              }}>
                Hi <span style={{ fontWeight: 'bold' }}>{patientName}</span>,
              </p>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.5'
              }}>
                Your appointment request has been successfully submitted.
              </p>
            </div>
            
            {/* Appointment Details Box */}
            {/* <div className="appointment-details-box p-3 mb-3" 
                 style={{ 
                   backgroundColor: '#E8F5E9', 
                   borderLeft: '4px solid #4CAF50',
                   borderRadius: '8px',
                   width: '100%'
                 }}>
              <div className="row">
                <div className="col-6">
                  <p className="mb-1" style={{ fontSize: '14px', color: '#388E3C' }}>
                    <strong>Appointment ID:</strong>
                  </p>
                  <p className="mb-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {generateAppointmentId()}
                  </p>
                </div>
                <div className="col-6">
                  <p className="mb-1" style={{ fontSize: '14px', color: '#388E3C' }}>
                    <strong>Status:</strong>
                  </p>
                  <p className="mb-0" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {apiResponse?.Message || 'Submitted'}
                  </p>
                </div>
              </div>
            </div> */}
            
            {/* Disclaimer Box */}
            <div className="disclaimer-box p-3 mb-3" 
                 style={{ 
                   backgroundColor: '#FFF3E0', 
                   borderLeft: '4px solid #FF9800',
                   borderRadius: '8px',
                   width: '100%'
                 }}>
              <p className="mb-0" style={{ 
                fontSize: '14px', 
                color: '#5D4037',
                lineHeight: '1.4'
              }}>
                <strong style={{ color: '#E65100' }}>Disclaimer:</strong> This is a tentative appointment, the time might differ 
                due to pre-booked appointments. Kindly connect with Welleazy customer care for any queries.
              </p>
            </div>
            
            {/* OKAY Button */}
            <Button
              variant="success"
              onClick={() => {
                setShowSuccessModal(false);
                redirectToAppointmentVoucher();
              }}
              style={{
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                fontWeight: 'bold',
                padding: '10px 30px',
                fontSize: '16px',
                borderRadius: '8px',
                minWidth: '180px'
              }}
              className="mt-2"
            >
              VIEW VOUCHER
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };
  
  const handleProceedToPayment = async () => {
    if (cartData.length === 0) {
      toast.error("No items in cart to proceed");
      return;
    }

    const firstItem = cartData[0];
    const totalAmount = calculateSubtotal();

    console.log("Processing payment for:", {
      totalAmount,
      caseRefId: firstItem.CaseRefId,
      cartDetailsId: firstItem.CartDetailsId,
      appointmentDate: firstItem.AppointmentDate,
      appointmentTime: firstItem.AppointmentTime
    });

    if (totalAmount === 0) {
      try {
        setPaymentProcessing(true);

        // Prepare the API payload
        const payload = {
          CaseLeadId: firstItem.CaseRefId || 0,  
          CaseType: 2,                       
          CartUniqueId: cartUniqueId,        
          CartDetailsId: firstItem.CartDetailsId || 0,
          STMId: "",
          CollectionDate: `${firstItem.AppointmentDate || ''} ${firstItem.AppointmentTime || ''}`.trim(),
          DCSelection: ""
        };

        console.log("Sending payload to API:", payload);

        // Call the API
        const result = await CheckOutAPI.CRMCustomerCarStatustUpdation(payload);
        
        console.log("API Result:", result);
        
        // Store the API response (even if values are 0/empty)
        setApiResponse({
          Message: result.Message || "Appointment Details Updated Successfully",
          ConsultationCaseAppointmentDetailsId: result.ConsultationCaseAppointmentDetailsId || 0,
          DistrictName: result.DistrictName || ""
        });

        // Show success modal
        setShowSuccessModal(true);
        setPaymentProcessing(false);

      } catch (error) {
        console.error("API Error:", error);
        toast.error("Failed to confirm booking. Please try again.");
        setPaymentProcessing(false);
      }
      return;
    }

    // Paid flow with Razorpay
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    setPaymentProcessing(true);

    try {
      const paymentAmount = calculateTotalInPaise();
      const customerName = firstItem.PersonName;

      const options = {
        key: "rzp_live_LWNsKcrWzYLuC7",
        amount: paymentAmount,
        currency: "INR",
        name: "Welleazy",
        description: `Consultation Fee - Dr. ${firstItem.DoctorName || "Consultation"}`,
        image: "/logo.png",

        handler: async function (response: any) {
          toast.success("Payment successful! Your consultation is confirmed.");

          // After payment, also call the appointment update API
          try {
            const payload = {
              CaseLeadId: firstItem.CaseRefId || 0,  
              CaseType: 2,                       
              CartUniqueId: cartUniqueId,        
              CartDetailsId: firstItem.CartDetailsId || 0,
              STMId: "",
              CollectionDate: `${firstItem.AppointmentDate || ''} ${firstItem.AppointmentTime || ''}`.trim(),
              DCSelection: ""
            };

            const result = await CheckOutAPI.CRMCustomerCarStatustUpdation(payload);
            setApiResponse({
              Message: result.Message || "Appointment Details Updated Successfully",
              ConsultationCaseAppointmentDetailsId: result.ConsultationCaseAppointmentDetailsId || 0,
              DistrictName: result.DistrictName || ""
            });
          } catch (error) {
            console.error("Failed to update appointment:", error);
          }

          // Navigate to voucher
          const voucherData = {
            patientName: firstItem.PersonName,
            consultationType: firstItem.ItemName,
            doctorName: firstItem.DoctorName,
            doctorSpeciality: firstItem.DoctorSpeciality,
            appointmentDate: firstItem.AppointmentDate,
            appointmentTime: firstItem.AppointmentTime,
            amountPaid: totalAmount,
            paymentStatus: 'Paid',
            paymentMethod: 'online',
            paymentId: response.razorpay_payment_id,
            consultationId: apiResponse?.ConsultationCaseAppointmentDetailsId || 0,
            districtName: apiResponse?.DistrictName || firstItem.DoctorCity || '',
            appointmentId: generateAppointmentId(),
            city: apiResponse?.DistrictName || firstItem.DoctorCity || ''
          };

          navigate("/appointment-voucher", {
            state: { voucherData }
          });

          setPaymentProcessing(false);
        },

        prefill: {
          name: customerName,
          email: firstItem.Emailid || "",
          contact: customerMobile
        },

        theme: { color: "#0d6efd" },

        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
            toast.info("Payment cancelled by user.");
          }
        },

        notes: {
          appointment_type: "consultation",
          doctor_name: firstItem.DoctorName || "",
          patient_name: customerName,
          cart_unique_id: cartUniqueId || "N/A"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        setPaymentProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
      setPaymentProcessing(false);
    }
  };
  
const handleBackClick = () => {
  navigate("/consultation", {
    state: {
      openBookingModal: true,
      selectedDoctor: cartData.length > 0 ? {
        DoctorId: cartData[0].DoctorId,
        DoctorName: cartData[0].DoctorName,
        Specialization: cartData[0].DoctorSpeciality,
      } : null,
      cartData: cartData,
      fromCheckout: true
    }
  });
};
  
  const handleRemoveConsultation = () => {
    toast.warning("Remove functionality to be implemented");
  };

  if (loading) {
    return (
      <div className="diagnostic-cart-page">
        <Container className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading cart details...</p>
        </Container>
      </div>
    );
  }
  
  if (cartData.length === 0) {
    return (
      <div className="diagnostic-cart-page">
        <Container className="py-5">
          <div className="text-center">
            <h3>Cart is Empty</h3>
            <p className="mb-4">Your cart is empty. Please add items to proceed.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        </Container>
      </div>
    );
  }
  
  const firstItem = cartData[0];

  return (
    <div className="diagnostic-cart-page">
      <Container>
        <div className="diagnostic-cart-header">
          <button className="back-btn" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} className="me-3" />
            CHECKOUT
          </h1>
        </div>
        
        <Row>
          <Col lg={8}>
            <Card className="mb-3 border-primary consultation-patient-card">
              <Card.Body className="p-3">
                <div className="row align-items-center">
                  <div className="col-md-7">
                    <div className="appointment-info-item mb-1">
                      <span className="consultation-type-badge" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                       {firstItem.ItemName}
                      </span>
                    </div>
                    
                    <div className="appointment-info-item mb-1">
                      <span style={{ fontSize: '16px' }}>{firstItem.PersonName}</span>
                    </div>
                    
                    <div className="appointment-info-item mb-1">
                      <span style={{ fontSize: '16px' }}>{customerMobile}</span>
                    </div>
                    
                    <div className="appointment-info-item mb-1">
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {firstItem.AppointmentDate && firstItem.AppointmentTime ? 
                          `${formatDate(firstItem.AppointmentDate)} ${firstItem.AppointmentTime}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-md-5">
                    <div className="d-flex align-items-center justify-content-between">
                      <span
                        className="consultation-fee"
                        style={{ fontSize: '16px', fontWeight: 800, marginLeft: '150px' }}
                      >
                        <FontAwesomeIcon icon={faIndianRupeeSign} className="me-1" />
                        {calculateSubtotal().toFixed(2)}
                      </span>
                      
                      <button 
                        className="close-consultation-btn"
                        style={{ width: '24px', height: '24px', fontSize: '12px' }}
                        onClick={handleRemoveConsultation}
                        title="Remove consultation"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-success consultation-doctor-card">
              <Card.Body className="p-3">
                <div className="row">
                  <div className="col-md-12">
                    <div className="appointment-info-item mb-1">
                    ({firstItem.ItemName})
                    </div>
                    
                    <div className="appointment-info-item mb-1">
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{firstItem.DoctorName || 'Doctor Name'}</span>
                    </div>
                    
                    <div className="appointment-info-item mb-0">
                      <span style={{ fontSize: '16px' }}>{firstItem.DoctorSpeciality || 'Specialization'}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="sticky-top consultation-order-card" style={{ top: '-0px' }}>
              <Card.Header className="bg-light">
                <h5 className="mb-0">Place Order</h5>
              </Card.Header>
              <Card.Body style={{ marginTop: '-40px' }}>
                <div className="price-breakdown mb-4">
                  <div className="price-row d-flex justify-content-between">
                    <span style={{ fontSize: '16px' }}>Amount:</span>
                    <span className="fw-bold" style={{ fontSize: '16px' }}>
                      <FontAwesomeIcon icon={faIndianRupeeSign} className="me-1" />
                      {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="price-row d-flex justify-content-between mb-2">
                    <span style={{ fontSize: '16px' }}>Discount:</span>
                    <span className="fw-bold" style={{ fontSize: '16px' }}>
                      <FontAwesomeIcon icon={faIndianRupeeSign} className="me-1" />
                      0.00
                    </span>
                  </div>
                  
                  <hr />
                  
                  <div className="total-row d-flex justify-content-between mt-3">
                    <h5 style={{ fontSize: '18px' }}>Total Amount:</h5>
                    <h4 className="" style={{ fontSize: '18px' }}>
                      <FontAwesomeIcon icon={faIndianRupeeSign} className="me-1" />
                      {calculateSubtotal().toFixed(2)}
                    </h4>
                  </div>
                </div>
                
                <div className="Checkout-action-buttons">
                  <button
                    className="w-100 mb-3 consultation-pay-button"
                    onClick={handleProceedToPayment}
                    disabled={paymentProcessing || !razorpayLoaded}
                  >
                    {paymentProcessing ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        {calculateSubtotal() > 0 ? 'Pay Now' : 'Place Order'}
                      </>
                    )}
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Success Modal */}
      <SuccessModal />
    </div>
  );
};

export default CheckOut;