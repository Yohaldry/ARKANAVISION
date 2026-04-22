import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  IoSyncOutline, IoExpandOutline, IoCloseOutline, 
  IoAnalyticsOutline, IoColorWandOutline, IoShieldCheckmarkOutline,
  IoFingerPrintOutline, IoArrowBackOutline
} from "react-icons/io5";

const FaceDetection = ({ photos, onReset, landmarks }) => {
  const [activeModal, setActiveModal] = useState(null);

 const metrics = useMemo(() => {
    if (!landmarks || landmarks.length === 0) return null;

    // 1. EXTRACCIÓN DE PUNTOS CLAVE (Coordenadas Normalizadas 0-1)
    const hairLine = landmarks[10];      // L1: Trichion (Inicio cabello)
    const eyebrowLine = landmarks[105];  // L2: Glabela (Cejas)
    const noseLine = landmarks[2];       // L3: Subnasal (Base nariz)
    const chinLine = landmarks[152];     // L4: Menton (Mentón)
    
    // Puntos de referencia para escala (Distancia Pupilar)
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const noseCenter = landmarks[1];

    // 2. LOGICA DE ESCALA (Conversión a CM reales)
    // Calculamos la distancia euclidiana entre ojos en la malla
    const pixelDistPupilar = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );
    // Usamos 6.3cm como estándar clínico de distancia pupilar
    const cmPerPixel = 6.3 / (pixelDistPupilar || 1);

    // 3. CÁLCULO DE DISTANCIAS AXIALES (Tercios en CM)
    // Multiplicamos la diferencia de 'y' por cmPerPixel para obtener medidas reales
    const dist1 = Math.abs(eyebrowLine.y - hairLine.y) * cmPerPixel * 100;
    const dist2 = Math.abs(noseLine.y - eyebrowLine.y) * cmPerPixel * 100;
    const dist3 = Math.abs(chinLine.y - noseLine.y) * cmPerPixel * 100;

    // 4. CÁLCULO DE SIMETRÍA (Basado en la proporción de los tercios)
    // Comparamos qué tan similares son las distancias de los tercios entre sí
    const avgTercio = (dist1 + dist2 + dist3) / 3;
    const desviacion = (Math.abs(dist1 - avgTercio) + Math.abs(dist2 - avgTercio) + Math.abs(dist3 - avgTercio)) / avgTercio;
    const symmetry = (100 - (desviacion * 100)).toFixed(1);

    return { 
      symmetry, 
      upperThird: dist1.toFixed(1), 
      middleThird: dist2.toFixed(1), 
      lowerThird: dist3.toFixed(1),
      lines: {
        // Establecemos los puntos exactos de la malla para las líneas CSS (0% a 100%)
        h1: (hairLine.y * 100),
        h2: (eyebrowLine.y * 100),
        h3: (noseLine.y * 100),
        h4: (chinLine.y * 100)
      }
    };
  }, [landmarks]);

  const closeModal = () => setActiveModal(null);

  return (
    <Container>
      {/* SECCIÓN PRINCIPAL: DETECCIÓN DE ROSTROS */}
      <MainCard onClick={() => photos.front && setActiveModal('faces')}>
        <Header>
          <div className="title-group">
            <IoFingerPrintOutline className="icon-main" />
            <h3>DETECCIÓN DE ROSTROS</h3>
          </div>
          <ResetBtn onClick={(e) => { e.stopPropagation(); onReset(); }}>
            <IoSyncOutline /> <span>REINICIAR</span>
          </ResetBtn>
        </Header>
        
        <PhotosDisplay>
          <div className="photo-wrapper">
             {photos.front ? <img src={photos.front} alt="Front" /> : <div className="empty">SIN DATOS</div>}
             <div className="scan-overlay" />
             <PhotoLabel>FRONTAL</PhotoLabel>
          </div>
          <div className="photo-wrapper">
             {photos.profile ? <img src={photos.profile} alt="Profile" /> : <div className="empty">SIN DATOS</div>}
             <PhotoLabel>PERFIL</PhotoLabel>
          </div>
        </PhotosDisplay>
        <ActionHint color="#00f7ff">:: CLIC PARA ANÁLISIS AXIAL</ActionHint>
      </MainCard>

      {/* GRID DE RESULTADOS */}
      <SecondaryGrid>
        <SubCard accent="#ff9800" onClick={() => setActiveModal('skin')}>
          <div className="card-content">
            <IoColorWandOutline className="card-icon" />
            <div className="card-info">
              <h4>ESTADO DE PIEL</h4>
              <p>Mixta / Zona T Grasa</p>
            </div>
            <div className="gauge">
              <span className="percentage">64%</span>
              <span className="label">H2O</span>
            </div>
          </div>
          <CardFooter color="#ff9800">VER DERMOGRAMA COMPLETO</CardFooter>
        </SubCard>

        <SubCard accent="#4caf50" onClick={() => setActiveModal('advice')}>
          <div className="card-content">
            <IoShieldCheckmarkOutline className="card-icon" />
            <div className="card-info">
              <h4>RECOMENDACIONES</h4>
              <p>Perfilado Técnico</p>
            </div>
            <IoExpandOutline className="expand-icon" />
          </div>
          <CardFooter color="#4caf50">VER PLAN TÉCNICO</CardFooter>
        </SubCard>
      </SecondaryGrid>

      {/* --- MODAL: ANÁLISIS FACIAL CON MEDIDAS CM --- */}
      {activeModal === 'faces' && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalNav>
              <CloseBtn onClick={closeModal}>
                <IoArrowBackOutline /> <span>VOLVER AL DASHBOARD</span>
              </CloseBtn>
            </ModalNav>
            <ModalBody>
              <ModalGrid>
                <div className="visual-section">
                  <img src={photos.front} alt="Analysis" />
                  {/* Líneas Horizontales de Referencia */}
                  {metrics?.lines && (
                    <>
                      <RefLine style={{ top: `${metrics.lines.h1}%` }} label="L1: CABELLO" />
                      <RefLine style={{ top: `${metrics.lines.h2}%` }} label="L2: CEJAS" />
                      <RefLine style={{ top: `${metrics.lines.h3}%` }} label="L3: NARIZ" />
                      <RefLine style={{ top: `${metrics.lines.h4}%` }} label="L4: MENTÓN" />
                    </>
                  )}
                  <ScanningLine />
                </div>
                <div className="data-section">
                  <header>
                    <IoAnalyticsOutline className="main-icon" />
                    <div><h4>DOSSIER AXIAL</h4><p>DISTANCIAS MÉTRICAS (CM)</p></div>
                  </header>
                  
                  <MetricBox>
                    <label>SIMETRÍA FACIAL TOTAL</label>
                    <div className="bar"><div className="fill" style={{ width: `${metrics?.symmetry}%` }} /></div>
                    <span className="val">{metrics?.symmetry || "--"}%</span>
                  </MetricBox>

                  <MiniStats>
                    <div className="stat">
                      <label>TERCIO SUPERIOR (L1-L2)</label>
                      <span>{metrics?.upperThird} cm</span>
                    </div>
                    <div className="stat">
                      <label>TERCIO MEDIO (L2-L3)</label>
                      <span>{metrics?.middleThird} cm</span>
                    </div>
                    <div className="stat" style={{ gridColumn: 'span 2' }}>
                      <label>TERCIO INFERIOR (L3-L4)</label>
                      <span>{metrics?.lowerThird} cm</span>
                    </div>
                  </MiniStats>
                </div>
              </ModalGrid>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODALES SKIN Y ADVICE SE MANTIENEN IGUAL SEGÚN TU SOLICITUD */}
      {activeModal === 'skin' && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalNav><CloseBtn onClick={closeModal}><IoArrowBackOutline /> <span>VOLVER</span></CloseBtn></ModalNav>
            <ModalBody>
              <ModalTitle><IoColorWandOutline /> DERMOGRAMA DETALLADO</ModalTitle>
              <DetailGrid>
                <DetailItem><strong>TIPO DE PIEL:</strong> Mixta con tendencia grasa en zona T</DetailItem>
                <DetailItem><strong>HIDRATACIÓN:</strong> 64% - Nivel óptimo.</DetailItem>
                <DetailItem><strong>POROSIDAD:</strong> Alta en zona malar y nasal.</DetailItem>
                <DetailItem><strong>HALLAZGOS:</strong> Detección de poros dilatados y leve deshidratación.</DetailItem>
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {activeModal === 'advice' && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalNav><CloseBtn onClick={closeModal}><IoArrowBackOutline /> <span>VOLVER</span></CloseBtn></ModalNav>
            <ModalBody>
              <ModalTitle><IoShieldCheckmarkOutline /> PLAN TÉCNICO SUGERIDO</ModalTitle>
              <DetailGrid>
                <DetailItem><strong>TÉCNICA:</strong> Perfilado con navaja de alta precisión.</DetailItem>
                <DetailItem><strong>PRODUCTOS:</strong> Shaving gel transparente.</DetailItem>
                <DetailItem><strong>POST-SERVICIO:</strong> After-shave balsámico y tónico frío.</DetailItem>
              </DetailGrid>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// --- ESTILOS ---
const slideUp = keyframes` from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } `;
const fadeIn = keyframes` from { opacity: 0; } to { opacity: 1; } `;

const Container = styled.div` display: flex; flex-direction: column; gap: 15px; width: 100%; padding: 5px; `;

const MainCard = styled.div`
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 16px; cursor: pointer; backdrop-filter: blur(10px);
`;

const SecondaryGrid = styled.div`
  display: grid; grid-template-columns: 1fr; gap: 12px;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const SubCard = styled.div`
  background: rgba(255, 255, 255, 0.03); border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08); padding: 16px; cursor: pointer;
  .card-content { display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    .card-icon { font-size: 22px; color: ${props => props.accent}; }
    .card-info { flex: 1; h4 { font-size: 10px; margin: 0; opacity: 0.6; letter-spacing: 1px; } p { font-size: 12px; margin: 3px 0 0; font-weight: bold; } }
    .gauge { text-align: right; .percentage { color: #00f7ff; font-weight: bold; font-size: 14px; } .label { font-size: 8px; opacity: 0.5; display: block; } }
  }
`;

const CardFooter = styled.div`
  font-size: 9px; font-weight: bold; color: ${props => props.color};
  letter-spacing: 1px; border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 10px; display: flex; align-items: center; gap: 6px;
  &::before { content: '::'; opacity: 0.5; }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
  .title-group { display: flex; align-items: center; gap: 8px; h3 { font-size: 10px; margin: 0; letter-spacing: 1.5px; } .icon-main { color: #00f7ff; font-size: 18px; } }
`;

const PhotosDisplay = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  .photo-wrapper { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 1; background: #000; border: 1px solid rgba(255,255,255,0.05);
    img { width: 100%; height: 100%; object-fit: cover; }
    .scan-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,247,255,0.1), transparent); }
    .empty { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #444; }
  }
`;

const PhotoLabel = styled.span`
  position: absolute; top: 8px; left: 8px; font-size: 7px; background: rgba(0,0,0,0.8); color: #00f7ff;
  padding: 3px 6px; font-weight: 900; border-radius: 4px; border: 1px solid rgba(0,247,255,0.2);
`;

const ActionHint = styled.div` font-size: 8px; color: #00f7ff; margin-top: 15px; font-weight: bold; letter-spacing: 1px; text-align: center; opacity: 0.8; `;

const ResetBtn = styled.button`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;
  font-size: 8px; padding: 5px 10px; border-radius: 20px; display: flex; align-items: center; gap: 5px; cursor: pointer;
`;

/* --- MODAL STYLES --- */
const ModalOverlay = styled.div` position: fixed; inset: 0; background: #0a0e12; z-index: 10000; animation: ${fadeIn} 0.3s ease; display: flex; flex-direction: column; `;
const ModalContent = styled.div` width: 100%; height: 100%; display: flex; flex-direction: column; animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1); `;
const ModalNav = styled.div` padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(10,14,18,0.8); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 10; `;
const ModalBody = styled.div` flex: 1; overflow-y: auto; padding: 20px 20px 60px; `;
const CloseBtn = styled.button` 
  background: rgba(0, 247, 255, 0.1); border: 1px solid rgba(0,247,255,0.2); color: #00f7ff; 
  padding: 10px 16px; border-radius: 30px; font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 8px; cursor: pointer;
`;
const ModalTitle = styled.h2` font-size: 18px; margin: 10px 0 25px; display: flex; align-items: center; gap: 12px; color: #fff; `;
const DetailGrid = styled.div` display: flex; flex-direction: column; gap: 12px; `;
const DetailItem = styled.div` 
  background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; font-size: 13px; color: #ccc; border: 1px solid rgba(255,255,255,0.02);
  strong { display: block; color: #00f7ff; font-size: 9px; margin-bottom: 6px; letter-spacing: 1px; text-transform: uppercase; }
`;

const ModalGrid = styled.div` 
  .visual-section { position: relative; margin-bottom: 30px; img { width: 100%; border-radius: 16px; border: 1px solid #222; } } 
  .data-section { header { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; .main-icon { color: #00f7ff; font-size: 28px; } h4 { margin: 0; font-size: 14px; } p { margin: 0; font-size: 9px; color: #00f7ff; } } } 
`;

const RefLine = styled.div`
  position: absolute; width: 100%; height: 1px; background: rgba(0, 247, 255, 0.4);
  left: 0; z-index: 5;
  &::after {
    content: "${props => props.label}"; position: absolute; right: 10px; top: -12px;
    font-size: 7px; color: #00f7ff; font-weight: bold; background: rgba(0,0,0,0.5); padding: 2px 4px; border-radius: 3px;
  }
`;

const ScanningLine = styled.div` position: absolute; width: 100%; height: 2px; background: #00f7ff; box-shadow: 0 0 15px #00f7ff; animation: scan 3s infinite linear; @keyframes scan { 0% { top:0 } 100% { top:100% } } `;

const MetricBox = styled.div` background: rgba(0,247,255,0.05); padding: 20px; border-radius: 16px; .bar { width: 100%; height: 4px; background: #222; margin: 12px 0; border-radius: 10px; .fill { height: 100%; background: #00f7ff; box-shadow: 0 0 8px #00f7ff; } } .val { font-size: 26px; font-weight: bold; } `;

const MiniStats = styled.div` 
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; 
  .stat { 
    background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; text-align: center; 
    label { font-size: 7px; color: #666; display: block; margin-bottom: 4px; letter-spacing: 0.5px; } 
    span { font-size: 16px; font-weight: bold; color: #00f7ff; } 
  } 
`;

export default FaceDetection;