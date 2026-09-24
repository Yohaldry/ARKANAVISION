import React from 'react';
import styled from 'styled-components';
import { IoSparklesOutline } from "react-icons/io5";

const SkinAnalysis = () => {
  return (
    <div style={{ margin: '20px 15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(0,247,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00f7ff' }}>
        <IoSparklesOutline />
        <span style={{ fontSize: '10px', fontWeight: '900' }}>ANÁLISIS DE PIEL (PRÓXIMAMENTE)</span>
      </div>
    </div>
  );
};

export default SkinAnalysis;