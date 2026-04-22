import React from 'react';
import styled, { keyframes } from 'styled-components';
import { IoFingerPrintOutline, IoLayersOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

// --- Animaciones ---
const pulseEdge = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const scanLine = keyframes`
  0% { top: -5%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 105%; opacity: 0; }
`;

const ArkanaScannerTeaser = () => {
  return (
    <TeaserContainer>
      <GridBackground />
      <Content>
        <StatusBadge>
          <span className="dot" />
          PRÓXIMAMENTE DISPONIBLE
        </StatusBadge>
        
        <TitleGroup>
          <IoFingerPrintOutline className="main-icon" />
          <MainTitle>
            ARKANA <span className="highlight">SCANNER</span>
          </MainTitle>
        </TitleGroup>
        
        <SubTitle>
          La Revolución Visual del Visagismo y Dermografía
        </SubTitle>
        
        <TeaserGrid>
          {/* Lado Izquierdo: Scanner */}
          <PhotoMockup>
            <MockupContent>
              <StaticFaceImage 
                src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1776889916/ARKA/j0kt19btgvrpsipyx3pl.png'} 
                alt="Arkana 3D Face Mesh" 
              />
              <div className="scanning-line" />
              <PhotoLabel>SIMULACIÓN</PhotoLabel>
            </MockupContent>
            <MockupPulse /> 
          </PhotoMockup>
          
          {/* Lado Derecho: Especificaciones */}
          <FeaturesList>
            <FeatureItem>
              <FeatureHeader>
                <IoLayersOutline className="feature-icon" />
                <h4>Análisis de Malla Facial</h4>
              </FeatureHeader>
              <p>Determinación precisa de proporciones faciales en 3D.</p>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureHeader>
                <IoShieldCheckmarkOutline className="feature-icon" />
                <h4>Asistencia Inteligente</h4>
              </FeatureHeader>
              <p>Sugerencias técnicas basadas en geometría volumétrica.</p>
            </FeatureItem>
            
            <ComingSoonCard>
              <p className="card-hint">ARKANA VISION AI</p>
              <h3>Precisión Absoluta</h3>
              <p className="card-body">Software revolucionario de IA.</p>
            </ComingSoonCard>
          </FeaturesList>
        </TeaserGrid>
        
        {/* Botón Centrado Abajo */}
        <CTAButtonGroup>
          <PrimaryButton>
            Acceso Anticipado ›
          </PrimaryButton>
        </CTAButtonGroup>
      </Content>
    </TeaserContainer>
  );
};

// --- STYLED COMPONENTS ---

const TeaserContainer = styled.section`
  position: relative;
  background: #000;
  color: #fff;
  padding: 60px 15px;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const GridBackground = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 9px;
  letter-spacing: 1px;
  margin-bottom: 20px;
  color: #aaa;
  .dot { width: 5px; height: 5px; background: #ff9800; border-radius: 50%; box-shadow: 0 0 8px #ff9800; }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  .main-icon { font-size: 30px; color: #00f7ff; }
`;

const MainTitle = styled.h2`
  font-size: clamp(24px, 6vw, 48px);
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  .highlight { color: #00f7ff; }
`;

const SubTitle = styled.p`
  font-size: clamp(14px, 3vw, 18px);
  color: #888;
  margin-bottom: 40px;
  padding: 0 10px;
`;

const TeaserGrid = styled.div`
  display: grid;
  /* Forzamos las 2 columnas incluso en móvil */
  grid-template-columns: 1.2fr 1fr; 
  gap: 15px;
  align-items: start;
  max-width: 900px;
  margin: 0 auto;

  @media (min-width: 768px) {
    gap: 40px;
    grid-template-columns: 1.1fr 0.9fr;
  }
`;

const PhotoMockup = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 0.8; /* Ajuste vertical para que luzca como en tu foto */
`;

const MockupContent = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.01);
  border: 1.5px solid rgba(0, 247, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .scanning-line {
    position: absolute;
    width: 100%;
    height: 2px;
    background: #00f7ff;
    box-shadow: 0 0 10px #00f7ff;
    animation: ${scanLine} 4s infinite linear;
    z-index: 10; 
  }
`;

const StaticFaceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  mix-blend-mode: lighten;
  z-index: 1;
`;

const MockupPulse = styled.div`
  position: absolute;
  inset: -6px;
  border-radius: 15px;
  border: 1px solid rgba(0, 247, 255, 0.1);
  animation: ${pulseEdge} 2s infinite ease-in-out;
  pointer-events: none;
`;

const PhotoLabel = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 7px;
  background: #000;
  color: #00f7ff;
  padding: 3px 7px;
  font-weight: bold;
  border-radius: 3px;
  border: 1px solid rgba(0,247,255,0.2);
  z-index: 15;
`;

const FeaturesList = styled.div` 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  text-align: left; 
`;

const FeatureItem = styled.div`
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  h4 { font-size: 11px; margin: 0; }
  p { font-size: 10px; color: #888; margin: 4px 0 0; line-height: 1.3; }
`;

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .feature-icon { color: #00f7ff; font-size: 16px; }
`;

const ComingSoonCard = styled.div`
  background: rgba(0, 247, 255, 0.03);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(0, 247, 255, 0.1);
  h3 { font-size: 12px; margin: 5px 0; }
  .card-hint { font-size: 7px; color: #00f7ff; font-weight: 700; text-transform: uppercase; }
  .card-body { font-size: 10px; color: #777; margin: 0; }
`;

const CTAButtonGroup = styled.div` 
  margin-top: 40px; 
  display: flex;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  background: #00f7ff10;
  border: 1px solid #00f7ff50;
  color: #fff;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover { background: #00f7ff; color: #000; }
`;

export default ArkanaScannerTeaser;