// import React from 'react';
import React, { useState} from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import './Footer.css';
import CreativeFeedback from './CreativeFeedback';


const Footer: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  return (
    <>
      {/* Newsletter Floating Card */}
      <div className="newsletter-floating-card">
        <div className="newsletter-content">
          <div className="newsletter-title-row">
            <span className="newsletter-bold">Subscribe</span> <span className="newsletter-light">Newsletter</span>
          </div>
          <form className="newsletter-form-row" action="https://formspree.io/f/your-form-id" method="POST">
            <input type="email" name="email" className="newsletter-input" placeholder="Email Address" required />
            <button type="submit" className="newsletter-arrow">&rarr;</button>
          </form>
          <div className="newsletter-desc">
            Get all the latest information on our products and services, sign up for newsletter today.
          </div>
        </div>
      </div>
      <footer className="welleazy-footer">
        <div className="footer-main">
          <div className="logo-col">
            <img src="/images/logo.svg" alt="welleazy" className="footer-logo" />
            <div className="footer-desc">
              Welleazy is a prominent healthtech company<br/>
              offering tailor made solutions
              to its corporate customers
              making their health care needs
              accessible and affordable.
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Reach Us</div>
            <div>Phone: +91-90350 52403</div>
            <div>Email: hello@welleazy.com</div>
            <div>Address: No.31, 3rd Floor, 09th Main Road, 6th Sector, HSR Layout, Bangalore-560102</div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Quick Links</div>
            <div className="footer-quicklinks-columns">
              <div className="footer-quicklinks-col">
                <div><a href="/">Home</a></div>
                <div><a href="/about">About Us</a></div>
                <div><a href="/contact">Contact Us</a></div>
                <div><a href="/corporate-wellness">Corporate Wellness Services</a></div>
              </div>
              <div className="footer-quicklinks-col">
                <div><a href="/faq">FAQ's</a></div>
                <div><a href="/blog">Blog</a></div>
                <div><a href="/partner">Partner With Us</a></div>
                <div><a href="/policies">Policies & Terms of use</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            Copyright © welleazy.com © 2022. All Rights Reserved.
          </div>
          <div className="footer-bottom-right">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faTwitter} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>
          </div>
        </div>
        {/* <div className="feedback-btn">Feedback</div> */}
        <div className="feedback-btn" onClick={() => setShowFeedback(true)}>Feedback</div>

      </footer>
    {showFeedback && (
    <div className="feedback-modal-overlay" onClick={() => setShowFeedback(false)}>
    <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
      <CreativeFeedback onClose={() => setShowFeedback(false)} />
      <button className="feedback-close" onClick={() => setShowFeedback(false)}>✕</button>
    </div>
  </div>
)}
 </>
  );
};

export default Footer; 