import React, { useState, useEffect } from 'react';
import './AppointmentPage.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Container } from 'react-bootstrap'; // ✅ Add this if you're using react-bootstrap
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';


const AppointmentPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const locationData = [
    { name: 'New Delhi', img: '/DELHI-8.png' },
    { name: 'Chandigarh', img: '/Chandigarh.png' },
    { name: 'Srinagar', img: '/srinagr.png' },
    { name: 'Cochin', img: '/kochi.png' },
    { name: 'Bangalore', img: '/BANGALORE-8.png' },
    { name: 'Mumbai', img: '/mumbai.png' },
    { name: 'Kolkata', img: '/KOLKATA-8.png' },
    { name: 'Ahmedabad', img: '/AHEMDABAD-8.png' },
    { name: 'Jaipur', img: '/JAIPUR-8.png' },
    { name: 'Lucknow', img: '/LUCKNOW-8.png' },
  ];
  const LOCATIONS_VISIBLE = 4;
  const [locationCarouselIndex, setLocationCarouselIndex] = React.useState(0);
  const handleLocationPrev = () => {
    setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
  };
  const handleLocationNext = () => {
    setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
  };
  // Auto-rotate carousel every 2 seconds
useEffect(() => {
  const interval = setInterval(() => {
    setLocationCarouselIndex(prev =>
      prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
    );
  }, 2000); // Rotate every 2 seconds

  return () => clearInterval(interval); // Cleanup on unmount
}, []);
  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };
  const navigate = useNavigate();
  return (
    <div className="appointment-container">
      <header className="appointment-header">
        <h1>CART</h1>
      </header>
      <main className="appointment-main">
        <div className="appointment-card">
          <div className="appointment-item">
            <span className="appointment-name">Firoz Khan Ummer</span>
            <div className="date-picker-container">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Select Date And Time"
                className="modern-datepicker-input"
              />
              <button className="add-button">+</button>
            </div>
          </div>
        </div>
        <div className="appointment-actions">
          {/* <button className="btn back-btn">Back</button> */}
          <button className="btn back-btn" onClick={() => navigate(-1)}>
  Back
</button>
          <button className="btn confirm-btn">Proceed To Confirm</button>
        </div>
      </main>
      <footer className="appointment-footer">
      
      <Container>
        <section className="our-location-section">
          <h2 className="our-location-heading">Our Locations</h2>
          <div className="location-carousel-wrapper">
            <button className="carousel-arrow left" onClick={handleLocationPrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img src={loc.img} alt={loc.name} className="location-img large-location-img" />
                  <div className="location-name large-location-name">{loc.name}</div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={handleLocationNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </Container>
      </footer>
    </div>
  );
};

export default AppointmentPage;
