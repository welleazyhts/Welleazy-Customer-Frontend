import React, { useState } from 'react';
import './TeleConsultationModal.css';

interface TeleConsultationModalProps {
  onClose: () => void;
}

const TeleConsultationModal: React.FC<TeleConsultationModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="tele-modal">
        <div className="modal-header">
          <h3>Book Appointment</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="radio-group">
          <label><input type="radio" name="type" defaultChecked /> Self</label>
          <label><input type="radio" name="type" /> Dependant</label>
        </div>

        <div className="modal-body">
          <input type="text" placeholder="Patient Name" defaultValue="Firoz Khan Ummer" />
          <input type="text" placeholder="Doctor's Name" defaultValue="Dr Ankit Kumar Saha" />
          <input type="text" placeholder="Doctor's Speciality" defaultValue="General Physician, Ayurvedic Doctor" />
          <input type="text" placeholder="City" defaultValue="Bangalore/Bengaluru" disabled />
          <input type="text" placeholder="Please add your symptoms (Limit 1000 Characters)" />

          <div className="appointment-mode">
            <button className="video-button">Video</button>
            <button className="tele-button active">Tele</button>
          </div>

          <div className="calendar-time-section">
            <div className="calendar">
              <input type="date" defaultValue="2025-07-16" />
            </div>
            <div className="time-slots">
              <button>🌅</button>
              <button>🌞</button>
              <button>🌤️</button>
              <button>🌙</button>
            </div>
          </div>

          <div className="upload-section">
            <button className="upload-btn">📥 Upload Reference Report/Document</button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="confirm-btn">Confirm Appointment</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TeleConsultationModal;
