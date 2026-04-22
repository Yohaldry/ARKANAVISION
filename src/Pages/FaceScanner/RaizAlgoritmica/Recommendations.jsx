import React from 'react';

const Recommendations = ({ list }) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ color: '#00ff44', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        <span style={{ width: '4px', height: '18px', background: '#00ff44', display: 'inline-block' }} />
        Recomendaciones
      </h2>
      <div style={{ marginTop: '15px', padding: '20px', border: '1px solid #00ff44', background: 'rgba(0, 255, 68, 0.05)' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {list.map((item, index) => (
            <li key={index} style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#00ff44' }}>✓</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;