import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PharmacyCouponSuccess.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


interface CouponData {
  couponCode: string;
  skuCode: string;
  apolloId: number;
  generatedAt: string;
  beneficiaryName: string;
  beneficiaryType: string;
  medicineNames: string[];
  hasPrescription: boolean;
  email: string;
  state: string;
  city: string;
  address: string;
}

const PharmacyCouponSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);


const generatePDF = async () => {
  const page = document.querySelector('.pharmacy-coupon-success') as HTMLElement;
  const actionButtons = document.querySelector('.action-buttons') as HTMLElement;

  if (!page) return;

  const originalActionButtonsDisplay = actionButtons?.style.display;

  // 🔴 Enable PDF mode → ALL FAQ OPEN
  setIsGeneratingPDF(true);

  // 🔴 Hide buttons
  if (actionButtons) actionButtons.style.display = 'none';

  // Wait for React to re-render FAQ
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Pharmacy_Coupon_${couponData?.couponCode || 'Coupon'}.pdf`);
  } catch (error) {
    console.error('PDF generation failed', error);
  } finally {
    // 🟢 Restore UI
    if (actionButtons)
      actionButtons.style.display = originalActionButtonsDisplay || '';

    setIsGeneratingPDF(false);
  }
};




  useEffect(() => {
    const loadCouponData = () => {
      try {
        // Try to get data from localStorage first
        const storedCoupon = localStorage.getItem('medicineCoupon');
        if (storedCoupon) {
          const parsedData = JSON.parse(storedCoupon);
          setCouponData(parsedData);
        } else {
          // If no data in localStorage, redirect back to form
          navigate('/pharmacy/offline-medicine');
        }
      } catch (error) {
        console.error('Error loading coupon data:', error);
        navigate('/pharmacy/offline-medicine');
      } finally {
        setLoading(false);
      }
    };

    loadCouponData();
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewCoupon = () => {
    localStorage.removeItem('medicineCoupon');
    navigate('/pharmacy/offline-medicine');
  };

  const handleBackToPharmacy = () => {
    navigate('/pharmacy');
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="coupon-loading">
        <div className="loading-spinner"></div>
        <p>Loading coupon details...</p>
      </div>
    );
  }

  if (!couponData) {
    return (
      <div className="coupon-error">
        <h2>No Coupon Data Found</h2>
        <p>Please generate a new coupon</p>
        <button onClick={handleNewCoupon} className="primary-button">
          Generate New Coupon
        </button>
      </div>
    );
  }

  const faqItems = [
    {
      question: "How can I place a medicine order on Welleazy?",
      answer: `You can order medicines directly through the Welleazy App or Web Portal:
• Log in using your registered mobile number.
• Go to the Pharmacy section.
• Search or upload your prescription.
• Select the required medicines and add them to your cart.
• Confirm your delivery address and complete the payment.
• Once the order is placed, our partner pharmacy team will verify and process it for delivery.

Offline Medicine Order
• Select the pharmacy order type as Offline Medicine Order.
• Fill in the required details in the available form.
• Upload your prescription and enter the medicine names.
• Submit the form.
• A coupon code will be generated against the placed order.
• Visit the nearest store of the selected vendor and show the coupon code to avail the medicine discount.`
    },
    {
      question: "Do I need a prescription to order medicines?",
      answer: `Prescription Required: For all prescription-based medicines (Schedule H/H1/X).
No Prescription Needed: For OTC items such as supplements, protein powders, and general wellness products.
You can upload a valid doctor's prescription in JPG, PNG, or PDF format during checkout.`
    },
    {
      question: "How can I upload my prescription?",
      answer: `After adding medicines to your cart, you'll get an option to Upload Prescription. You can take a photo using your phone camera or upload an existing file. Our licensed pharmacist verifies every order before dispatch to ensure safety and compliance.`
    },
    {
      question: "Can I track my order status?",
      answer: `Yes. You can track your order live in the "My Orders" section, including:
• Order confirmation
• Out for delivery / Delivered
You'll also receive SMS and in-app notifications at every stage.`
    },
    {
      question: "What payment modes are available?",
      answer: `You can make payments using:
• UPI (Google Pay, PhonePe, Paytm, etc.)
• Debit / Credit Cards
• Net Banking`
    },
    {
      question: "What is the estimated delivery time?",
      answer: `Metro Cities: 24–48 hours
Other Locations: 2–5 working days
Delivery timelines depend on your PIN code and product availability.
Expected delivery dates will be shown before confirming your order.`
    },
    {
      question: "Can I cancel my order?",
      answer: `Cancellation: Allowed before the order is packed or dispatched. To raise a cancellation request, please contact our support team within 24 hours of placing the order.`
    },
    {
      question: "What happens if my medicine is unavailable?",
      answer: `If any medicine is out of stock, our pharmacy partner will inform you.
You may:
• Approve an alternative brand (with doctor's consent), or
• Receive a refund for the unavailable item.`
    },
    {
      question: "Do you deliver across all locations?",
      answer: `Yes, Welleazy delivers medicines across most major cities and towns in India.
You can check service availability by entering your PIN code at checkout.`
    },
    {
      question: "Can I reorder my regular medicines?",
      answer: `Yes. Go to the "My Orders" section → select a previous order → tap Reorder.
This feature is ideal for regular prescriptions or monthly refill needs.`
    },
    {
      question: "Who can I contact for help or order-related issues?",
      answer: `Our dedicated support team is happy to assist you.`
    }
  ];

  return (
    <div className="pharmacy-coupon-success">
      {/* Header */}
      <div className="coupon-header">
        <button 
          className="back-button"
          onClick={handleBackToPharmacy}
        >
          ← Back to Pharmacy
        </button>
        <h1>Pharmacy Coupon Details</h1>
       
      </div>

      <div className="coupon-container">
        {/* Success Message */}
        {/* <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Coupon Generated Successfully!</h2>
          <p>Your medicine coupon has been generated and is ready for use at Apollo Pharmacy</p>
        </div> */}

      
     {/* Coupon Details Card */}
       <div className="action-buttons">
          <button  className="print-action-button download-button"  onClick={generatePDF}>
  <span className="icon">⬇️</span> Download
</button>
          <button onClick={handleNewCoupon} className="new-coupon-button">
            ✨ Generate New Coupon
          </button>
          <button onClick={handleBackToPharmacy} className="back-to-pharmacy-button">
            🏥 Back to Pharmacy
          </button>
        </div>
<div className="coupon-details-card">
  <div className="coupon-header-section">
    <h3>Coupon Information</h3>
    <div className="coupon-badge">Active</div>
  </div>

  <div className="coupon-details-grid">
    {/* Left Column */}
    <div className="details-left-column">
      <div className="detail-row">
        <span className="detail-label">Order ID:</span>
        <span className="detail-value">#{couponData.skuCode || 'PA67'}</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Name:</span>
        <span className="detail-value">{couponData.beneficiaryName || 'Kiran Kumar S'}</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">City:</span>
        <span className="detail-value">{couponData.city || 'Bangalore'}</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Beneficiary Type:</span>
        <span className="detail-value">
          {couponData.beneficiaryType === 'self' ? 'Self' : 'Dependant'}
        </span>
      </div>
    </div>

    {/* Right Column */}
    <div className="details-right-column">
      <div className="detail-row">
        <span className="detail-label">Coupon Code:</span>
        <span className="detail-value coupon-code">{couponData.couponCode || 'Ki700376'}</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Vendor:</span>
        <span className="detail-value vendor">Apollo Pharmacy</span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Generated On:</span>
        <span className="detail-value">
          {new Date(couponData.generatedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Status:</span>
        <span className="">Active</span>
      </div>
    </div>
  </div>

  {/* Medicine Names - Full width row */}
  <div className="medicine-row">
    <span className="detail-label">Medicine Names:</span>
    <span className="detail-value medicine-names">
      {(() => {
        if (!couponData.medicineNames || couponData.medicineNames.length === 0) {
          return 'No medicines specified';
        }
        
        const medicineNames = couponData.medicineNames.map(medicine => {
          if (typeof medicine === 'string') {
            return medicine;
          } else if (medicine && typeof medicine === 'object') {
            // return medicine.name || 'Unknown Medicine';
          }
          return 'Unknown Medicine';
        });
        
        return medicineNames.join(', ');
      })()}
    </span>
  </div>

  {/* Prescription Status - Full width row */}
  {/* {couponData.hasPrescription && (
    <div className="prescription-row">
      <span className="detail-label">Prescription:</span>
      <span className="detail-value prescription-status">Uploaded ✅</span>
    </div>
  )} */}
</div>

        {/* Instructions Card */}
        <div className="instructions-card">
          <h3>How to Use This Coupon</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Visit Apollo Pharmacy</h4>
                <p>Take this coupon to your nearest Apollo Pharmacy store</p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Show the Coupon</h4>
                <p>Show this coupon code to the pharmacy staff: <strong>{couponData.couponCode}</strong></p>
              </div>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Get Your Medicines</h4>
                <p>Collect your prescribed medicines with the discount applied</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3>💊 Welleazy – Online Medicine Order FAQ</h3>
          <div className="faq-list">
            {faqItems.map((faq, index) => (
              <div key={index} className="faq-item">
                <div 
                  className="faq-question" 
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </div>
                {(isGeneratingPDF || activeFaq === index) && (
                  <div className="faq-answer">
                    {faq.answer.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                    {index === faqItems.length - 1 && (
                      <div className="note-section">
                        <p>
                          <strong>📝 Note:</strong> For certain pharmacy orders, the vendor may directly contact you for additional communication or to collect any information required to process your order. Welleazy acts solely as a digital platform facilitating the connection between buyers and licensed pharmacy vendors. The respective vendor and buyer are solely responsible for all transactions, deliveries, and concerns related to pharmacy orders.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
      
      </div>
    </div>
  );
};

export default PharmacyCouponSuccess;