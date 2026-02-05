// components/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Changed from required to optional
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ label, required, ...props }) => {
  return (
    <div style={{ marginBottom: '0rem' }}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: 500, color: '#4a4a4a', display: 'block', marginBottom: '4px' }}>
          {label}
          {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      <input
        {...props}
        style={{
          height: '38px',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          outline: 'none',
          fontSize: '14px',
          boxSizing: 'border-box',
          marginTop: label ? '-3px' : '0', // Adjust margin based on label presence
          width: '100%',
        }}
      />
    </div>
  );
};

export default Input;