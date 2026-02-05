import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const PharmacyUpload: React.FC = () => {
  const navigate = useNavigate();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const ePrescriptionInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleEPrescriptionClick = () => {
    ePrescriptionInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, source: string) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Uploaded from ${source}:`, file.name);
      // TODO: Upload logic here
    }
  };
  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Upload Prescription</h2>

      <div style={styles.grid}>
        {/* Left Box: Upload Area */}
        <div style={styles.box}>
          <div style={styles.illustration}></div>
          <p>Uploaded Prescriptions will be shown here</p>
          <div style={styles.buttonGroup}>
            <button style={styles.orangeButton} onClick={handleGalleryClick}>Choose from Gallery</button>
            <button style={styles.orangeButton} onClick={handleEPrescriptionClick}>Select from E-Prescription</button>
          </div>

          {/* Hidden file inputs */}
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={galleryInputRef}
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e, "Gallery")}
          />
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={ePrescriptionInputRef}
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e, "E-Prescription")}
          />
        </div>
       {/* Middle Box: Instructions */}
        <div style={styles.box}>
          <h4>Make sure the prescription you upload contains:</h4>
          <ul style={styles.instructionList}>
            <li>👨‍⚕️ Doctor Details</li>
            <li>📅 Date of Prescription</li>
            <li>👤 Patient Details</li>
            <li>💊 Medicine Details</li>
            <li>✍️ Doctor’s Sign and Seal</li>
          </ul>
          <p style={styles.warningBox}>
            ❗ Only genuine prescriptions that comply with all legal
            requirements will be filled by our pharmacist.
          </p>
        </div>

        {/* Right Box: Sample Rx */}
        <div style={styles.box}>
          <h4>View Sample Prescription below</h4>
          <img
            src="https://via.placeholder.com/300x200.png?text=Sample+Prescription"
            alt="Sample Prescription"
            style={styles.sampleImage}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={styles.footerButtons}>
      <button style={styles.orangeButton} onClick={() => navigate("/pharmacy")}>
          Back
        </button>
        <button style={styles.orangeButton}>Continue</button>
      </div>
    </div>
  );
};


const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    padding: "40px 20px",
    background: "#f4f6f9",
    maxWidth: 1200,
    margin: "auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  grid: {
    display: "flex",
    gap: 24,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  box: {
    flex: 1,
    minWidth: 300,
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center" as const,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  illustration: {
    height: 150,
    background:
      "url('https://cdn-icons-png.flaticon.com/512/1828/1828911.png') no-repeat center/contain",
    marginBottom: 15,
  },
  buttonGroup: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  orangeButton: {
    backgroundColor: "#ff6f00",
    color: "#fff",
    padding: "10px 22px",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  instructionList: {
    textAlign: "left" as const,
    marginTop: 15,
    lineHeight: 1.8,
    color: "#444",
    paddingLeft: 16,
  },
  warningBox: {
    background: "#fff6f0",
    color: "#d84315",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    fontWeight: 500,
    fontSize: 14,
  },
  sampleImage: {
    width: "100%",
    marginTop: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
  },
  footerButtons: {
    marginTop: 40,
    display: "flex",
    justifyContent: "center",
    gap: 20,
  },
};



export default PharmacyUpload;
