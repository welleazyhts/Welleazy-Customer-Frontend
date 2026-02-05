    import React from 'react';
import { Container, Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faUser, faDumbbell, faPrint, faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import './GymServices.css';
import jsPDF from 'jspdf';


const GymVoucher: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const voucherData = location.state?.voucherData;

  // If no voucher data, redirect back
  React.useEffect(() => {
    if (!voucherData) {
      navigate('/gym-services');
    }
  }, [voucherData, navigate]);

  if (!voucherData) {
    return null;
  }

  const handlePrintVoucher = () => {
    window.print();
  };

const handleDownloadVoucher = () => {
  const doc = new jsPDF();
  
  // Set PDF properties
  doc.setProperties({
    title: `Gym Voucher - ${voucherData.voucherId}`,
    subject: 'Welleazy Fitness Gym Membership Voucher',
    author: 'Welleazy Fitness',
    keywords: 'gym, membership, voucher, fitness',
    creator: 'Welleazy Fitness'
  });

  // Add background color
  doc.setFillColor(13, 110, 253);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Add header
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('WELLEAZY FITNESS', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Gym Membership Voucher', 105, 30, { align: 'center' });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  
  // Add voucher ID
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`VOUCHER ID: #${voucherData.voucherId}`, 105, 60, { align: 'center' });
  
  // Add success message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Dear User, Thank you for submitting your request for Gym Services with Welleazy.', 20, 75);
  doc.text('We have successfully received your Gym Subscription activation request with our vendor Cul Fit.', 20, 82);
  
  // Add customer details section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER DETAILS', 20, 100);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${voucherData.customerName}`, 20, 110);
  doc.text(`Contact Number: ${voucherData.contactNumber}`, 20, 117);
  doc.text(`Email: ${voucherData.email}`, 20, 124);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PACKAGE DETAILS', 20, 140);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Selected Package: ${voucherData.packageDuration} Months`, 20, 150);
  doc.text(`Amount Paid: ₹${voucherData.packagePrice}`, 20, 157);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GYM CENTER', 20, 173);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Center Name: ${voucherData.gymCenterName}`, 20, 183);
  if (voucherData.gymCenterType) {
    doc.text(`Type: ${voucherData.gymCenterType}`, 20, 190);
  }
  if (voucherData.gymCenterAddress) {
    const splitAddress = doc.splitTextToSize(`Address: ${voucherData.gymCenterAddress}`, 170);
    doc.text(splitAddress, 20, voucherData.gymCenterType ? 197 : 190);
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION DETAILS', 20, 220);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction ID: ${voucherData.transactionId}`, 20, 230);
  doc.text(`Purchase Date: ${voucherData.purchaseDate}`, 20, 237);
  
  doc.setFontSize(10);
  doc.setTextColor(255, 0, 0);
  doc.text('Disclaimer: We will get back to you shortly with the activation code & process flow for your Gym Subscription.', 20, 260, { maxWidth: 170 });
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This is an computer generated voucher. No signature required.', 105, 285, { align: 'center' });
  
  doc.save(`gym-voucher-${voucherData.voucherId}.pdf`);
};

  const handleBackToServices = () => {
    navigate('/GymServices');
  };

  return (
    <Container className="voucher-page-container">
      {/* Success Alert */}
      <Alert variant="success" className="text-center">
        <FontAwesomeIcon icon={faCheckCircle} size="lg" className="me-2" />
        <strong>Thank you for your purchase!</strong> Your gym membership voucher has been generated successfully.
      </Alert>

      <Card className="voucher-card">
        <Card.Header className="voucher-header text-white text-center py-4">
          <FontAwesomeIcon icon={faDumbbell} size="2x" className="mb-3" />
          <h2 className="mb-2">WELLEAZY FITNESS</h2>
          <p className="mb-0">Gym Membership Voucher</p>
        </Card.Header>
        
        <Card.Body className="p-4">
          {/* Main Content */}
          <div className="text-center mb-4">
            <h4 className="text-primary">Gym Voucher Details</h4>
            <p className="text-muted mb-0">
              Dear User, Thank you for submitting your request for Gym Services with Welleazy. 
              We have successfully received your Gym Subscription activation request with our vendor Cul Fit.
            </p>
          </div>

          <hr />

          {/* Voucher ID */}
          <Row className="mb-4">
            <Col>
              <div className="voucher-id-section text-center">
                <h5 className="text-muted">Voucher ID</h5>
                <div className="voucher-number">#{voucherData.voucherId}</div>
              </div>
            </Col>
          </Row>

          {/* Customer Details */}
          <Row className="mb-3">
            <Col md={6}>
              <div className="detail-card">
                <div className="detail-label">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                  Name:
                </div>
                <div className="detail-value">{voucherData.customerName}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="detail-card">
                <div className="detail-label">Contact Number:</div>
                <div className="detail-value">{voucherData.contactNumber}</div>
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <div className="detail-card">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{voucherData.email}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="detail-card">
                <div className="detail-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                  Voucher Date & Time:
                </div>
                <div className="detail-value">{voucherData.purchaseDate}</div>
              </div>
            </Col>
          </Row>

          {/* Package Details */}
          <Row className="mb-3">
            <Col md={6}>
              <div className="detail-card highlight">
                <div className="detail-label">Selected Package:</div>
                <div className="detail-value package-highlight">
                  {voucherData.packageDuration} Months
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="detail-card">
                <div className="detail-label">Amount Paid:</div>
                <div className="detail-value text-success">₹{voucherData.packagePrice}</div>
              </div>
            </Col>
          </Row>

          {/* Gym Center Details */}
          <Row className="mb-4">
            <Col>
              <div className="detail-card gym-center-card">
                <div className="detail-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                  Gym Center:
                </div>
                <div className="detail-value gym-center-name">{voucherData.gymCenterName}</div>
                {voucherData.gymCenterAddress && (
                  <div className="gym-address text-muted">
                    <small>{voucherData.gymCenterAddress}</small>
                  </div>
                )}
                {voucherData.gymCenterType && (
                  <div className="gym-type">
                    <span className="badge bg-info">{voucherData.gymCenterType}</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Transaction Details */}
          <Row className="mb-4">
            <Col>
              <div className="transaction-details">
                <div className="detail-label">Transaction ID:</div>
                <div className="detail-value transaction-id">{voucherData.transactionId}</div>
              </div>
            </Col>
          </Row>

          {/* Disclaimer */}
          <Alert variant="warning" className="disclaimer-alert">
            <strong>Disclaimer:</strong> We will get back to you shortly with the activation code & process flow for your Gym Subscription.
          </Alert>

          {/* Action Buttons */}
       <Row className="mt-4">
  <Col className="text-center">
    <div className="d-flex flex-wrap justify-content-center gap-3">
      <Button 
        variant="outline-primary" 
        onClick={handlePrintVoucher} 
        className="action-btn"
      >
        <FontAwesomeIcon icon={faPrint} className="me-2" />
        Print Voucher
      </Button>
      <Button 
        variant="outline-success" 
        onClick={handleDownloadVoucher} 
        className="action-btn"
      >
        <FontAwesomeIcon icon={faDownload} className="me-2" />
        Download
      </Button>
      <Button 
        variant="primary" 
        onClick={handleBackToServices}
        className="action-btn"
      >
        Back to Gym Services
      </Button>
    </div>
  </Col>
</Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GymVoucher;