import React from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faDownload, faChevronLeft, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import "./AppointmentVoucher.css";



const AppointmentVoucher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const { voucherData } = location.state || {};

  // Use the data passed from CheckOut component (which includes API response)
  const data = voucherData || {
    appointmentId: "#48688",
    consultationId: "", // From API response
    patientName: "Chitranshi Jaiswal",
    consultationType: "Tele Consultation",
    doctorName: "Dr. Rajveer Singh Rathore",
    doctorSpeciality: "General Physician",
    doctorCity: "New Delhi",
    districtName: "", // From API response
    city: "", // From API response
    appointmentDate: "23-12-2025",
    appointmentTime: "11:30 AM",
    amountPaid: "",
    paymentStatus: "Free",
    paymentMethod: "free",
    termsConditions: `Service Scope: Welleazy Healthtech Solutions offers tele/video consultations to provide remote access to licensed medical professionals for preliminary assessment, general guidance, and follow-ups.
Informed Consent: By initiating a teleconsultation, users consent to receive medical advice virtually, acknowledge limitations inherent to remote diagnostics, and agree to share health information digitally.
Clinical Limitations: Teleconsultation does not replace an in-person medical examination. If necessary, the attending practitioner may recommend a physical visit or further investigations.
Privacy & Data Protection: All virtual interactions are encrypted and comply with data privacy standards under Indian IT Act, PDPB, and applicable healthcare regulations. Welleazy is committed to maintaining confidentiality and secure storage of health records.
Emergency Exclusion: These services are not intended for life-threatening, emergency, or critical care scenarios. Users must approach the nearest hospital or call emergency services for urgent medical attention.
Availability & Connectivity: Consultations are subject to clinician availability and stable internet connectivity. Welleazy is not liable for disruptions caused by third-party networks or devices.`,
    disclaimer: "Disclaimer : That confirmation will be shared in sometime"
  };

  // Use the consultationId from API response as appointment ID
  // If available, use the ConsultationCaseAppointmentDetailsId from API
  const displayAppointmentId = data.consultationId
    ? `#${data.consultationId}`
    : data.appointmentId;

  // Use districtName from API response, fallback to city, then doctorCity
  const displayCity = data.districtName || data.city || data.doctorCity;

  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Download functionality to be implemented");
  };

  const renderSafeValue = (value: any): string => {
    if (!value) return "";
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="appointment-voucher-page">
      <Container>
        <div className="appointment-voucher-header">
          <button className="appointment-voucher-back-btn" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <h1>
            <FontAwesomeIcon icon={faFileAlt} className="me-3" />
            Appointment Voucher
          </h1>
        </div>

        <Card className="appointment-voucher-card">
          <Card.Header className="appointment-voucher-header-card">
            <h3 className="mb-0">Service Voucher Details</h3>
          </Card.Header>
          <Card.Body>
            <Row className="appointment-voucher-details">
              <Col md={12}>
                <div className="appointment-voucher-detail-row mb-4">
                  <span className="appointment-voucher-detail-label">Patient Name:</span>
                  <span className="appointment-voucher-detail-value" style={{ fontWeight: 'bold' }}>{data.patientName}</span>
                </div>
                <div className="appointment-voucher-detail-row">
                  <span className="appointment-voucher-detail-label">Appointment ID :</span>
                  <span className="appointment-voucher-detail-value" style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {displayAppointmentId}
                  </span>
                </div>

                <hr />
                <h5 className="mb-3 mt-4">Booking Details</h5>

                {data.items && data.items.length > 0 ? (
                  data.items.map((item: any, idx: number) => (
                    <div key={idx} className="mb-4 p-3" style={{ border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                      <Row>
                        <Col md={6}>
                          <div className="appointment-voucher-detail-row">
                            <span className="appointment-voucher-detail-label">Service:</span>
                            <span className="appointment-voucher-detail-value">{item.name}</span>
                          </div>
                          <div className="appointment-voucher-detail-row">
                            <span className="appointment-voucher-detail-label">Practitioner/Lab:</span>
                            <span className="appointment-voucher-detail-value">{item.doctorName || item.center_name || 'N/A'}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="appointment-info-item mb-1">
                            <span className="appointment-voucher-detail-label">Date & Time:</span>
                            <span className="appointment-voucher-detail-value">
                              {renderSafeValue(item.appointmentDate)} {renderSafeValue(item.appointmentTime)}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))
                ) : (
                  <Row>
                    <Col md={6}>
                      <div className="appointment-voucher-detail-row">
                        <span className="appointment-voucher-detail-label">Consultation Type:</span>
                        <span className="appointment-voucher-detail-value">{data.consultationType}</span>
                      </div>
                      <div className="appointment-voucher-detail-row">
                        <span className="appointment-voucher-detail-label">Doctor Name:</span>
                        <span className="appointment-voucher-detail-value">{data.doctorName}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="appointment-voucher-detail-row">
                        <span className="appointment-voucher-detail-label">Date & Time:</span>
                        <span className="appointment-voucher-detail-value">{renderSafeValue(data.appointmentDate)} {renderSafeValue(data.appointmentTime)}</span>
                      </div>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>

            <div className="">
              <div style={{ textAlign: 'center', margin: '20px ' }}>
                <button
                  type="button"
                  title="MY APPOINTMENT"
                  className="appointment-voucher-my-appointment-btn"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/my-bookings')}
                >
                  MY APPOINTMENT
                </button>

              </div>

              <p className="appointment-voucher-disclaimer-text" style={{ textAlign: 'center' }}>
                *{data.disclaimer}
              </p>
            </div>

            <div className="appointment-voucher-terms-section">
              <h5 className="appointment-voucher-section-title">Terms and Conditions</h5>
              <div className="appointment-voucher-terms-content">
                {data.termsConditions.split('\n').map((term: string, index: number) => (
                  <p key={index} className="appointment-voucher-term-item">
                    {term.trim()}
                  </p>
                ))}
              </div>
            </div>


          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AppointmentVoucher;