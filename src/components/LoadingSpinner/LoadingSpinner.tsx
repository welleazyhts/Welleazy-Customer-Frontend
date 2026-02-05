import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-2">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;