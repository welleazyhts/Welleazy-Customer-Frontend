
// // src/components/BookAppointmentModal.tsx
import React, { useState, useRef } from 'react';

import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookAppointmentModal.css';


interface BookAppointmentModalProps {
  show: boolean;
  onHide: () => void;
  doctorName: string;
  specialty: string;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  show,
  onHide,
  doctorName,
  specialty,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [session, setSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const handleTeleClick = () => setShowTimeSlots(true);

  const handleCancel = () => {
    setShowTimeSlots(false);
    onHide();
  };

  const timeSlots = {
    morning: ['9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
    afternoon: ['12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'],
    evening: ['4:00 PM', '5:00 PM', '6:00 PM'],
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Book Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div className={`appointment-body ${showTimeSlots ? 'expanded' : ''}`}>
        <Form>
          <div className="d-flex mb-3">
            <Form.Check inline label="Self" name="patientType" type="radio" defaultChecked />
            <Form.Check inline label="Dependant" name="patientType" type="radio" />
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Patient Name</Form.Label>
            <Form.Control value="Firoz Khan Ummer" disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doctor's Name</Form.Label>
            <Form.Control value={doctorName} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doctor's Speciality</Form.Label>
            <Form.Control value={specialty} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control value="Bangalore/Bengaluru" disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Symptoms</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Please add your symptoms (Limit 1000 Characters)"
              maxLength={1000}
            />
          </Form.Group>

          {/* Video & Tele buttons */}
          <div className="d-flex gap-2 mt-3 mb-3">
              <Button variant="outline-primary">Video</Button>
              <Button variant="outline-primary" onClick={handleTeleClick}>Tele</Button>
              <Button variant="warning" className="ms-auto" onClick={handleCancel}>
                Cancel
              </Button>
            </div>

          {/* Show calendar & time slots only if user clicked "Tele" */}
          {showTimeSlots && (
            <div className="tele-appointment-section">
              <div className="d-flex gap-4">
                {/* Calendar */}
              {/* Calendar and Upload Button */}
<div>
  <DatePicker
    selected={selectedDate}
   
    inline
  />
  <div className="mt-3">
  <input
    type="file"
    ref={fileInputRef}
    style={{ display: 'none' }}
    onChange={(e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('Selected file:', file.name); // You can handle the file here
      }
    }}
  />
    </div>
  <Button
    variant="outline-info"
    className="w-100 upload-btn"
    onClick={() => fileInputRef.current?.click()}
  >
    📥 Upload Reference Report/Document
  </Button>
</div>

  


                {/* Time Slot Picker */}
                <div style={{ flex: 1 }}>
                  {/* Session Switch */}
                  <div className="d-flex gap-3 mb-3 justify-content-around">
                    <Button
                      variant={session === 'morning' ? 'primary' : 'light'}
                      onClick={() => setSession('morning')}
                    >
                      🌤
                    </Button>
                    <Button
                      variant={session === 'afternoon' ? 'primary' : 'light'}
                      onClick={() => setSession('afternoon')}
                    >
                      ☀️
                    </Button>
                    <Button
                      variant={session === 'evening' ? 'primary' : 'light'}
                      onClick={() => setSession('evening')}
                    >
                      🌙
                    </Button>
                  </div>

                  {/* Time Slots */}
                  <div className="d-flex flex-wrap gap-2">
                    {timeSlots[session].map((slot, idx) => (
                      <Button key={idx} variant="outline-secondary" size="sm">
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Appointment */}
              <div className="text-end mt-4">
                  <Button variant="warning" className="me-2">Confirm Appointment</Button>
                  {/* <Button variant="secondary" onClick={handleCancel}>Cancel</Button> */}
                  <Button variant="secondary" onClick={() => setShowTimeSlots(false)}>Cancel</Button>

                </div>
            </div>
          )}
        </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BookAppointmentModal;
