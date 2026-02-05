import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faPrint, 
  faArrowLeft, 
  faCheckCircle, 
  faEye,
  faTooth,
  faMapMarkerAlt,
  faUser,
  faCalendarAlt,
  faStethoscope,
  faHospital
} from '@fortawesome/free-solid-svg-icons';
import './EyeVoucher.css';
import html2pdf from 'html2pdf.js';

interface VoucherData {
  requestId: string;
  name: string;
  vendorName: string;
  centerAddress: string;
  serviceName: string;
  treatmentName: string;
  contactNumber: string;
  email: string;
  caseDetailsId: string;
}

const EyeVoucher: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { voucherData } = location.state as { 
    voucherData: VoucherData; 
    serviceType: 'eye' | 'dental' 
  };
const [isDownloading, setIsDownloading] = React.useState(false);

  // Determine service type and set appropriate values
  const isDental = voucherData?.serviceName?.toLowerCase().includes('dental') ?? false;
  const serviceTitle = isDental ? 'Dental Care Voucher' : 'Eye Care Voucher';
  const serviceIcon = isDental ? faTooth : faEye;
  const serviceColor = isDental ? '#dc3545' : '#0d6efd';
  const serviceSubtitle = isDental ? 'Professional Dental Treatment Service' : 'Professional Eye Treatment Service';

  if (!voucherData) {
    return (
      <Container className="voucher-container">
        <div className="text-center py-5">
          <h3>No voucher data found</h3>
          <Button onClick={() => navigate('/eye-care-dental-care')} className="mt-3">
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  // Generate current date and time
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

// const handleDownload = () => {
//   const element = document.getElementById('voucher-content');
//   if (!element) return;

//   const downloadBtn = element.querySelector('.header-download-btn') as HTMLElement;
//   const previousDisplay = downloadBtn?.style.display;
//   if (downloadBtn) {
//     downloadBtn.style.display = 'none';
//   }

//   html2pdf()
//     .set({
//       margin: 10,
//       filename: `${isDental ? 'dental' : 'eye'}-care-voucher-${voucherData.requestId}.pdf`,
//       image: {
//         type: 'jpeg' as const,
//         quality: 0.98
//       },
//       html2canvas: {
//         scale: 2,
//         useCORS: true
//       },
//       jsPDF: {
//         unit: 'mm',
//         format: 'a4',
//         orientation: 'portrait'
//       }
//     })
//     .from(element)
//     .save()
//     .finally(() => {
    
//       if (downloadBtn) {
//         downloadBtn.style.display = previousDisplay || '';
//       }
//     });
// };
const handleDownload = async () => {
  const element = document.getElementById('voucher-content');
  if (!element) return;

  element.classList.add('pdf-mode');
  element.getBoundingClientRect(); // force reflow

  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  const yPosition = imgHeight > pdfHeight
    ? (pdfHeight - imgHeight) / 2
    : 0;

  pdf.addImage(
    imgData,
    'JPEG',
    0,
    yPosition,
    imgWidth,
    imgHeight
  );

  pdf.save(`${isDental ? 'dental' : 'eye'}-care-voucher-${voucherData.requestId}.pdf`);

  element.classList.remove('pdf-mode');
};




  return (
    <Container className="voucher-container">
      {/* Header with Actions */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <Button 
              variant="light" 
              onClick={() => navigate('/eye-care-dental-care')}
              className="back-btn"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Services
            </Button>
            {/* <div className="d-flex action-buttons">
              <Button variant="outline-primary" onClick={handlePrint} className="me-2 print-btn">
                <FontAwesomeIcon icon={faPrint} className="me-2" />
                Print
              </Button>
              <Button variant="primary" onClick={handleDownload} className="download-btn">
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Download
              </Button>
            </div> */}
          </div>
        </Col>
      </Row>

      {/* Main Voucher Card */}
      <Row className="justify-content-center">
        <Col lg={8} md={10} sm={12}>
          <Card className="voucher-card premium-card" id="voucher-content">
            {/* Voucher Header with Dynamic Gradient */}
            <div 
  className="voucher-header-gradient"
  style={{
    background: isDental 
      ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' 
      : 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)'
  }}
>
  <div className="voucher-header-content">
    <div className="header-left">
      <div className="header-icon" style={{color:'white'}}>
        <FontAwesomeIcon icon={serviceIcon} />
      </div>
      <div className="header-text">
        <h1 className="voucher-main-title">{serviceTitle}</h1>
        <p className="voucher-subtitle">{serviceSubtitle}</p>
      </div>
    </div>
    
    <div className="header-right">
  {!isDownloading && (
    <Button
      variant="light"
      onClick={handleDownload}
      className="header-download-btn hide-in-pdf"
      size="sm"
    >
      <FontAwesomeIcon icon={faDownload} className="me-2" />
      Download
    </Button>
  )}
</div>

  </div>
</div>

            <Card.Body className="p-0">
              {/* Success Confirmation */}
              <div className="success-section text-center py-3">
                <FontAwesomeIcon 
                  icon={faCheckCircle} 
                  className="success-icon mb-2" 
                  style={{ color: serviceColor }}
                />
                <h2 className="success-title">Appointment Confirmed!</h2>
                <p className="success-message">
                  Your {isDental ? 'dental care' : 'eye care'} appointment has been successfully scheduled
                </p>
                <div className="appointment-date">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Generated on {currentDate} at {currentTime}
                </div>
              </div>

              {/* Voucher Details Grid */}
              <div className="voucher-details-grid">
                <Row className="g-3">
                  {/* Patient Information */}
                  <Col md={6}>
                    <div 
                      className="detail-card patient-card"
                      style={{ borderLeft: `4px solid ${serviceColor}` }}
                    >
                      <div className="detail-card-header">
                        <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: serviceColor }} />
                        <h5>Patient Information</h5>
                      </div>
                      <div className="detail-card-body">
                        <div className="detail-item">
                          <span className="detail-label">Full Name:</span>
                          <span className="detail-value">{voucherData.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Contact Number:</span>
                          <span className="detail-value">{voucherData.contactNumber}</span>
                        </div>
                        {/* <div className="detail-item">
                          <span className="detail-label">Email Address:</span>
                          <span className="detail-value" >{voucherData.email}</span>
                        </div> */}
                        <div
  className="detail-item"
  style={{ display: "flex", gap: "6px" }}
>
  <span className="detail-label">Email Address:</span>
  <span
    className="detail-value"
    style={{
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      wordBreak: "break-all",
      maxWidth: "250px"
    }}
  >
    {voucherData.email}
  </span>
</div>

                        <div className="detail-item">
                          <span className="detail-label">Request ID:</span>
                          <span className="detail-value highlight" style={{ color: serviceColor }}>
                            #{voucherData.requestId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Service Information */}
                  <Col md={6}>
                    <div 
                      className="detail-card service-card"
                      style={{ borderLeft: `4px solid ${serviceColor}` }}
                    >
                      <div className="detail-card-header">
                        <FontAwesomeIcon icon={faStethoscope} className="me-2" style={{ color: serviceColor }} />
                        <h5>Service Details</h5>
                      </div>
                      <div className="detail-card-body">
                        <div className="detail-item">
                          <span className="detail-label">Service Type:</span>
                          <span className="detail-value">{voucherData.serviceName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Treatment:</span>
                          <span className="detail-value treatment-name" style={{ color: serviceColor }}>
                            {voucherData.treatmentName}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className="status-badge-small" style={{ backgroundColor: serviceColor }}>
                            Approved
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Appointment Center */}
                  <Col md={12}>
                    <div 
                      className="detail-card vendor-card"
                      style={{ 
                        borderLeft: `4px solid ${serviceColor}`,
                        background: isDental 
                          ? 'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)' 
                          : 'linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)'
                      }}
                    >
                      <div className="detail-card-header">
                        <FontAwesomeIcon icon={faHospital} className="me-2" style={{ color: serviceColor }} />
                        <h5>Appointment Center</h5>
                      </div>
                     <div className="detail-card-body">
  <div className="vendor-info-grid">
    <div className="vendor-info-item">
      <div className="info-label">Vendor Name:</div>
      <div className="info-value">{voucherData.vendorName}</div>
    </div>
    <div className="vendor-info-item">
      <div className="info-label">Center Address:</div>
      <div className="info-value">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: serviceColor }} />
        {voucherData.centerAddress}
      </div>
    </div>
  </div>
</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Important Instructions */}
              <div className="instructions-section">
                <h5 className="instructions-title">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" style={{ color: serviceColor }} />
                  Important Instructions
                </h5>
                <Row className="g-2">
                  <Col md={3} sm={6}>
                    <div className="instruction-item">
                      <div className="instruction-icon">📋</div>
                      <div className="instruction-text">Carry this voucher</div>
                    </div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="instruction-item">
                      <div className="instruction-icon">⏰</div>
                      <div className="instruction-text">Arrive 15 mins early</div>
                    </div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="instruction-item">
                      <div className="instruction-icon">🆔</div>
                      <div className="instruction-text">Bring ID proof</div>
                    </div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="instruction-item">
                      <div className="instruction-icon">📞</div>
                      <div className="instruction-text">Contact support if needed</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Footer */}
              <div 
                className="voucher-footer"
                style={{
                  background: isDental 
                    ? 'linear-gradient(135deg, #495057 0%, #343a40 100%)' 
                    : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                }}
              >
                <div className="footer-content">
                  <div className="footer-text">
                    <p className="mb-1">Thank you for choosing our {isDental ? 'dental care' : 'eye care'} services.</p>
                    <p className="mb-0">We are committed to your {isDental ? 'dental health' : 'vision health'} and well-being.</p>
                  </div>
                  <div className="footer-logo">
                    <div className="logo-circle" style={{ backgroundColor: serviceColor }}>
                      <FontAwesomeIcon icon={serviceIcon} />
                    </div>
                    <span className="logo-text">
                      {isDental ? 'DentalCare Pro' : 'EyeCare Pro'}
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Footer */}
      <Row className="mt-3">
        <Col className="text-center">
          <div className="quick-actions">
            <Button variant="primary" className="me-2" onClick={() => navigate('/eye-care-dental-care')}>
              Book Another Appointment
            </Button>
           
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EyeVoucher;