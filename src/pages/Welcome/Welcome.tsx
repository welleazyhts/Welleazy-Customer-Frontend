import React, { useState } from 'react';
import './Welcome.css';
import { useNavigate } from "react-router-dom";


const Welcome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
    const Navigate = useNavigate();
  const handleCompleteProfile = () => {
    Navigate('/MangeProfile');
  };
  
  const handleDoItLater = () => {
    Navigate('/home');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="welcome-badge">
            <span className="welcome-badge-icon">✓</span>
            <span className="welcome-badge-text">You Are Logged In</span>
          </div>
          <h1 className="welcome-title">Welcome to Our Platform!</h1>
          <p className="welcome-subtitle">
            Let's get you all set up in the system.
          </p>
        </div>
        
        <div className="welcome-content">
          <div className="welcome-setup-steps">
            <h2 className="welcome-steps-title">Complete Your Setup</h2>
            <p className="welcome-steps-description">
              To get the most out of your experience, please complete your profile setup. 
              This will help us personalize your dashboard and unlock all features.
            </p>
            
            <div className="welcome-steps-list">
              <div className="welcome-step-item">
                <div className="welcome-step-number">1</div>
                <div className="welcome-step-content">
                  <h3>Profile Information</h3>
                  <p>Add your personal details, profile picture, and contact information.</p>
                </div>
              </div>

              <div className="welcome-step-item">
                <div className="welcome-step-number">2</div>
                <div className="welcome-step-content">
                  <h3>Preferences</h3>
                  <p>Tell us about your preferences to customize your experience.</p>
                </div>
              </div>
              
              <div className="welcome-step-item">
                <div className="welcome-step-number">3</div>
                <div className="welcome-step-content">
                  <h3>Security Settings</h3>
                  <p>Set up two-factor authentication and security preferences.</p>
                </div>
              </div>
            </div>
            
            <div className="welcome-benefits-section">
              <h3>Benefits of Completing Your Profile:</h3>
              <ul className="welcome-benefits-list">
                <li>Personalized dashboard and recommendations</li>
                <li>Access to all platform features</li>
                <li>Faster support with verified account</li>
                <li>Custom notifications based on your preferences</li>
              </ul>
            </div>
          </div>
          
          <div className="welcome-action-section">
            <div className="welcome-action-card">
              <div className="welcome-action-icon complete">✓</div>
              <h3 className="welcome-action-title">Complete My Profile</h3>
              <p className="welcome-action-description">
                Recommended for new users. Takes about 5 minutes to complete.
              </p>
              <button 
                className="welcome-btn welcome-btn-primary" 
                onClick={handleCompleteProfile}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Complete My Profile Now'}
              </button>
              <p className="welcome-action-note">
                <strong>What happens:</strong> You'll be guided through a simple step-by-step process.
              </p>
            </div>

            <div className="welcome-action-card">
              <div className="welcome-action-icon later">→</div>
              <h3 className="welcome-action-title">I'll Do It Later</h3>
              <p className="welcome-action-description">
                Skip for now and complete your profile at a more convenient time.
              </p>
              <button 
                className="welcome-btn welcome-btn-secondary" 
                onClick={handleDoItLater}
              >
                Remind Me Later
              </button>
              <p className="welcome-action-note">
                <strong>Note:</strong> Some features may be limited until your profile is complete.
              </p>
            </div>
          </div>
        </div>
        
        {/* <div className="welcome-footer">
          <p className="welcome-footer-text">
            You can always update your profile from <strong>Account Settings</strong> at any time.
          </p>
          <div className="welcome-progress-container">
            <div className="welcome-progress-label">Profile Completion</div>
            <div className="welcome-progress-bar">
              <div className="welcome-progress-fill" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Welcome;