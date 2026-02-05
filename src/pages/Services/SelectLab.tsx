import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const SelectLab: React.FC = () => {
  const location = useLocation();
  const selectedTests = location.state?.selectedTests || [];
  const navigate = useNavigate();

  const [dcPincode, setDcPincode] = React.useState('');
  const [dcArea, setDcArea] = React.useState('');
  const [dcName, setDcName] = React.useState('');

  return (
    <div style={{ margin: '32px 0', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Pincode"
          value={dcPincode}
          onChange={e => setDcPincode(e.target.value)}
          style={{ flex: 1, minWidth: 180, background: '#fff4f4', border: '1px solid #f8bfbf', borderRadius: 24, padding: '12px 18px', fontSize: '1rem', outline: 'none' }}
        />
        <input
          type="text"
          placeholder="DC Search By Area"
          value={dcArea}
          onChange={e => setDcArea(e.target.value)}
          style={{ flex: 2, minWidth: 220, background: '#fff4f4', border: '1px solid #f8bfbf', borderRadius: 24, padding: '12px 18px', fontSize: '1rem', outline: 'none' }}
        />
        <input
          type="text"
          placeholder="DC Search By Name"
          value={dcName}
          onChange={e => setDcName(e.target.value)}
          style={{ flex: 2, minWidth: 220, background: '#fff4f4', border: '1px solid #f8bfbf', borderRadius: 24, padding: '12px 18px', fontSize: '1rem', outline: 'none' }}
        />
      </div>
      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <button style={{ background: '#fff4f4', border: '1px solid #f8bfbf', borderRadius: 24, padding: '10px 28px', fontWeight: 500, color: '#b48b8b', fontSize: '1rem', cursor: 'pointer' }}>Sort by price</button>
        <button style={{ background: '#fff4f4', border: '1px solid #f8bfbf', borderRadius: 24, padding: '10px 28px', fontWeight: 500, color: '#b48b8b', fontSize: '1rem', cursor: 'pointer' }}>Search by visit type</button>
      </div>
      {/* Selected Test Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {selectedTests.map((test: string, idx: number) => (
          <span
            key={test}
            style={{
              background: '#fff',
              border: '1.5px solid #e0e0e0',
              borderRadius: 20,
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 500,
              color: '#1976d2',
              fontSize: '1rem'
            }}
          >
            {test}
          </span>
        ))}
      </div>
      {/* ADD MORE TESTS/PACKAGES */}
      <div
        style={{
          color: '#ff6b1c',
          fontWeight: 600,
          textAlign: 'right',
          cursor: 'pointer',
          marginBottom: 16
        }}
      >
        ADD MORE TESTS/PACKAGES
      </div>
      {/* Lab Card(s) */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Orange Health Lab - Bengaluru <span style={{ color: '#1976d2', fontWeight: 500, fontSize: '0.95rem' }}>(Home Visit)</span></div>
        <div style={{ color: '#888', marginBottom: 6 }}><FontAwesomeIcon icon={faMapMarkerAlt} /> Bangalore/Bengaluru, Vinayaka Circle</div>
        <div style={{ color: '#888', marginBottom: 6 }}>NA</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ textDecoration: 'line-through', color: '#b0b0b0', fontSize: '0.95rem' }}>Rs 1000.00</div>
            <div style={{ color: '#e65100', fontWeight: 700, fontSize: '1.1rem' }}>Rs 950.00</div>
          </div>
          <Button
            onClick={() => navigate('/select-lab', { state: { selectedTests } })}
            style={{ background: '#ff6b1c', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600 }}
          >
            Select Diagnostic Center
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectLab; 