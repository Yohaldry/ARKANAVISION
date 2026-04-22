import React from 'react';

const SkinAnalysis = ({ data }) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ color: '#ff8800', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        <span style={{ width: '4px', height: '18px', background: '#ff8800', display: 'inline-block' }} />
        Estado de Piel
      </h2>
      <div style={{ marginTop: '15px', padding: '20px', border: '1px solid #ff8800', background: 'rgba(255, 136, 0, 0.05)' }}>
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px', color: '#ccc' }}>
          <p><strong style={{ color: '#fff' }}>TIPO:</strong> {data.type}</p>
          <p><strong style={{ color: '#fff' }}>HIDRATACIÓN:</strong> {data.hydration}%</p>
          <p><strong style={{ color: '#fff' }}>POROSIDAD:</strong> {data.porosity}</p>
          <p><strong style={{ color: '#fff' }}>HALLAZGOS:</strong> {data.findings}</p>
        </div>
      </div>
    </div>
  );
};

export default SkinAnalysis;