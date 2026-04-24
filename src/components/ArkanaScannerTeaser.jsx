import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { IoFingerPrintOutline, IoLayersOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { X, Terminal, ChevronRight } from 'lucide-react';

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

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const ArkanaScannerTeaser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [displayText, setDisplayText] = useState('');
  
  const fullText = "> inicializando_arkana_scanner.exe...\n> estado: acceso_restringido\n> ingresa_tu_correo_para_acceso_anticipado:";

  // Efecto de escritura para la terminal
  useEffect(() => {
    if (isModalOpen) {
      let i = 0;
      setDisplayText('');
      const interval = setInterval(() => {
        setDisplayText(fullText.substring(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes integrar el envío a tu base de datos o API
    alert(`ACCESO SOLICITADO PARA: ${email}`);
    setIsModalOpen(false);
    setEmail('');
  };

  return (
    <TeaserContainer>
      <GridBackground />
      <Content>
        <StatusBadge>
          <span id="novedades" className="dot" />
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
          <PhotoMockup>
            <MockupContent>
              <StaticFaceImage 
                src={'https://res.cloudinary.com/dtkirmtfq/image/upload/v1776989416/ARKA/ikqlqoeixaysb7i9a3rf.png'} 
                alt="Arkana 3D Face Mesh" 
              />
              <div className="scanning-line" />
              <PhotoLabel>SCANNER ARKANA</PhotoLabel>
            </MockupContent>
            <MockupPulse /> 
          </PhotoMockup>
          
          <FeaturesList>
            <FeatureItem>
              <FeatureHeader>
                <IoLayersOutline className="feature-icon" />
                <h4>Análisis de Malla Facial</h4>
              </FeatureHeader>
              <p>Cálculo automatizado de la Regla de los Tercios y la Quinta Real, permitiendo una armonización facial basada en proporciones áureas.</p>
            </FeatureItem>
            
            <FeatureItem>
              <FeatureHeader>
                <IoShieldCheckmarkOutline className="feature-icon" />
                <h4>Asistencia Inteligente</h4>
              </FeatureHeader>
              <p>Sugerencias técnicas generadas por IA que calculan la angulación ideal de arcos superciliares y ejes mandibulares según el biotipo del usuario.</p>
            </FeatureItem>
            
            <ComingSoonCard>
              <p className="card-hint">ARKANA VISION AI</p>
              <h3>Precisión Absoluta</h3>
              <p className="card-body">Integración de estándares estéticos de clase mundial para potenciar la personalización de cada diseño según la estructura craneal única.</p>
            </ComingSoonCard>
          </FeaturesList>
        </TeaserGrid>
        
        <CTAButtonGroup>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            Acceso Anticipado ›
          </PrimaryButton>
        </CTAButtonGroup>
      </Content>

      {/* --- MODAL TERMINAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContainer
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <TerminalHeader>
                <div className="flex-header">
                  <Terminal size={14} color="#00f7ff" />
                  <span className="terminal-title">ARKANA_AUTH_SYSTEM</span>
                </div>
                <CloseBtn onClick={() => setIsModalOpen(false)}><X size={18} /></CloseBtn>
              </TerminalHeader>

              <TerminalBody>
                <div className="terminal-text">
                  {displayText}
                  <Cursor />
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                  <InputWrapper>
                    <ChevronRight size={16} className="chevron" />
                    <CommandInput 
                      type="email"
                      required
                      placeholder="usuario@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </InputWrapper>
                  
                  <SubmitButton type="submit">
                    EJECUTAR_ACCESO.SH
                  </SubmitButton>
                </form>
              </TerminalBody>
              
              <div className="terminal-footer">
                User: Guest_Access_Bogota_2026
              </div>
            </ModalContainer>
          </Overlay>
        )}
      </AnimatePresence>
    </TeaserContainer>
  );
};

// --- STYLED COMPONENTS (TEASER) ---

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
  .highlight { color: #444368; }
`;

const SubTitle = styled.p`
  font-size: clamp(14px, 3vw, 18px);
  color: #888;
  margin-bottom: 40px;
  padding: 0 10px;
`;

const TeaserGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr; 
  gap: 15px;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;

  @media (min-width: 768px) {
    gap: 40px;
    grid-template-columns: 1fr 1fr;
  }
`;

const PhotoMockup = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 0.8;
  @media (min-width: 1024px) {
    max-width: 320px;
    margin-left: auto;
    margin-right: 0;
  }
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

// --- STYLED COMPONENTS (MODAL TERMINAL) ---

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background: #050505;
  border: 1px solid rgba(0, 247, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  .terminal-footer {
    position: absolute;
    bottom: 10px;
    right: 15px;
    font-family: monospace;
    font-size: 8px;
    color: rgba(255, 255, 255, 0.1);
    text-transform: uppercase;
  }
`;

const TerminalHeader = styled.div`
  background: #111;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  .flex-header { display: flex; align-items: center; gap: 8px; }
  .terminal-title { font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.4); text-decoration: underline; }
`;

const TerminalBody = styled.div`
  padding: 40px 30px;
  .terminal-text {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 13px;
    color: #00f7ff;
    white-space: pre-wrap;
    line-height: 1.6;
    min-height: 90px;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #00f7ff;
  margin-left: 5px;
  animation: ${blink} 1s infinite;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  .chevron { position: absolute; left: 10px; color: #00f7ff; }
`;

const CommandInput = styled.input`
  width: 100%;
  background: rgba(0, 247, 255, 0.03);
  border: 1px solid rgba(0, 247, 255, 0.2);
  padding: 12px 12px 12px 35px;
  font-family: monospace;
  color: #fff;
  border-radius: 4px;
  &:focus { outline: none; border-color: #00f7ff; background: rgba(0, 247, 255, 0.08); }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 15px;
  background: #00f7ff;
  color: #000;
  border: none;
  padding: 14px;
  font-family: monospace;
  font-weight: 900;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s;
  &:hover { background: #fff; box-shadow: 0 0 20px rgba(0, 247, 255, 0.3); }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  &:hover { color: #fff; }
`;

export default ArkanaScannerTeaser;