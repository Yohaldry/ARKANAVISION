import React, { useState } from 'react';
import styled from 'styled-components';
import { IoChevronForward, IoClose } from "react-icons/io5";

/* ==========================================================================
   ESTILOS DE LOS MODALES DE DETALLE
   ========================================================================== */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(1, 4, 9, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContentCard = styled.div`
  background: linear-gradient(180deg, #040915 0%, #02050c 100%);
  border: 1px solid rgba(0, 247, 255, 0.2);
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 247, 255, 0.1);
  animation: fadeIn 0.25s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const CloseModalBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.15); }
`;

const ModalBigImageFrame = styled.div`
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ModalBodyInfo = styled.div`
  padding: 20px;
  box-sizing: border-box;

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .tag-style {
    font-size: 11px;
    color: #00f7ff;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    margin-bottom: 12px;
    display: inline-block;
  }

  p {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0;
  }
`;

/* ==========================================================================
   CONTENEDOR PRINCIPAL INTEGRADO
   ========================================================================== */
const VisarkaModuleWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: transparent;
  color: #ffffff;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const IntegratedHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px 16px;
  flex-shrink: 0;

  @media (min-width: 750px) {
    padding: 24px 32px 12px 32px;
  }

  .brand-logo {
    font-size: 20px;
    font-weight: 300;
    letter-spacing: 4px;
    background: linear-gradient(90deg, #00f7ff 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (min-width: 750px) {
      font-size: 24px;
      letter-spacing: 6px;
    }
  }

  .mesh-status {
    font-size: 10px;
    color: #00f7ff;
    letter-spacing: 1px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #00f7ff;
      border-radius: 50%;
      box-shadow: 0 0 8px #00f7ff;
    }
  }
`;

const FullModalScrollArea = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 16px 24px 16px;
  box-sizing: border-box;

  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;

  display: grid;
  grid-template-columns: 100%;
  gap: 16px;

  @media (min-width: 750px) {
    grid-template-columns: 1.1fr 1fr; 
    padding: 12px 32px 32px 32px;
    gap: 24px;
    align-items: start;
  }
`;

const DashboardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  @media (min-width: 750px) {
    gap: 20px;
  }
`;

const BiometricHeroGrid = styled.section`
  display: grid;
  grid-template-columns: 1.1fr 1.3fr;
  gap: 10px;
  align-items: stretch;
  width: 100%;

  @media (min-width: 750px) {
    grid-template-columns: 1.1fr 1fr;
    gap: 14px;
  }
`;

const ClientScannerView = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 140px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #020714;

  @media (min-width: 750px) {
    min-height: 180px;
    border-radius: 16px;
  }

  .photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hud-mesh-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(0, 247, 255, 0.08) 0%, transparent 85%);
  }

  .bracket {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1.5px solid #00f7ff;
    @media (min-width: 750px) { width: 12px; height: 12px; }
  }
  .tl { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
  .tr { top: 8px; right: 8px; border-left: 0; border-bottom: 0; }
  .bl { bottom: 8px; left: 8px; border-right: 0; border-top: 0; }
  .br { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
`;

const BioTraitsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: space-between;
  width: 100%;

  @media (min-width: 750px) {
    gap: 8px;
  }
`;

const TraitHUDCard = styled.div`
  background: rgba(4, 9, 21, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  flex: 1;

  @media (min-width: 750px) {
    border-radius: 12px;
    padding: 10px 14px;
    gap: 12px;
  }

  .icon-wrapper {
    font-size: 12px;
    flex-shrink: 0;
    &.cyan { color: #00f7ff; }
    &.purple { color: #a855f7; }
    
    @media (min-width: 750px) { font-size: 15px; }
  }

  .meta {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .label {
      font-size: 7.5px;
      color: #4e5d73;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      @media (min-width: 750px) { font-size: 9px; letter-spacing: 0.6px; margin-bottom: 2px; }
    }
    .value {
      font-size: 11px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      @media (min-width: 750px) { font-size: 13.5px; }
    }
  }
`;

const ReportSectionContainer = styled.div`
  background: rgba(4, 9, 21, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 14px;
  box-sizing: border-box;
  width: 100%;

  @media (min-width: 750px) {
    border-radius: 18px;
    padding: 20px;
  }
`;

const SectionHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .left-headline {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    &.purple-heading { color: #a855f7; }
    &.pink-heading { color: #ec4899; }
    &.cyan-heading { color: #00f7ff; }

    @media (min-width: 750px) { font-size: 13px; gap: 8px; }
  }

  .action-link {
    color: #3b82f6;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    @media (min-width: 750px) { font-size: 12px; }
  }
`;

const MorfoFlexLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 50px;
  gap: 12px;
  align-items: center;

  @media (min-width: 750px) {
    grid-template-columns: 1fr 70px;
    gap: 16px;
  }

  p {
    font-size: 11.5px;
    color: #94a3b8;
    line-height: 1.45;
    margin: 0;
    @media (min-width: 750px) { font-size: 13px; line-height: 1.5; }
  }

  .wireframe-mesh-head {
    width: 50px;
    height: 50px;
    background: url('https://api.iconify.design/solar:user-speak-rounded-linear.svg?color=%23a855f7') no-repeat center;
    background-size: contain;
    opacity: 0.8;
    @media (min-width: 750px) { width: 70px; height: 70px; }
  }
`;

const LooksHorizontalScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;

const LookThumbnailCard = styled.div`
  background: #030612;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px;
  min-width: 110px;
  max-width: 110px;
  position: relative;

  @media (min-width: 750px) {
    border-radius: 16px;
    padding: 10px;
    min-width: 130px;
    max-width: 130px;
  }

  .photo-frame {
    width: 100%;
    height: 100px;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 6px;
    position: relative;
    img { width: 100%; height: 100%; object-fit: cover; }
    @media (min-width: 750px) { height: 120px; margin-bottom: 8px; }
  }

  h4 { font-size: 11.5px; font-weight: 600; margin: 0; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; @media (min-width: 750px) { font-size: 12.5px; } }
  p { font-size: 10px; color: #4e5d73; margin: 2px 0 0 0; @media (min-width: 750px) { font-size: 11px; } }

  .action-circle-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 18px;
    height: 18px;
    border: 1px solid rgba(0, 247, 255, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00f7ff;
    font-size: 9px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: rgba(0, 247, 255, 0.1); }
    @media (min-width: 750px) { bottom: 10px; right: 10px; width: 20px; height: 20px; font-size: 10px; }
  }
`;

const IaBadge = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(2, 5, 12, 0.75);
  border: 1px solid #00f7ff;
  color: #00f7ff;
  font-size: 7px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  backdrop-filter: blur(2px);
`;

const SkinImprovementLayout = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  @media (min-width: 750px) { gap: 16px; }

  .skin-droplet-ring {
    width: 38px;
    height: 38px;
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a855f7;
    background: rgba(168, 85, 247, 0.03);
    font-size: 16px;
    flex-shrink: 0;
    @media (min-width: 750px) { width: 44px; height: 44px; font-size: 18px; }
  }

  .text-box {
    font-size: 11.5px;
    line-height: 1.4;
    color: #94a3b8;
    @media (min-width: 750px) { font-size: 13px; line-height: 1.45; }
    .recommendation-highlight { color: #00f7ff; margin-top: 4px; font-weight: 500; }
  }
`;

const PackageContainer = styled.div`
  border: 1px solid rgba(0, 247, 255, 0.15);
  background: linear-gradient(180deg, rgba(3, 10, 24, 0.85) 0%, rgba(1, 3, 8, 0.98) 100%);
  border-radius: 14px;
  padding: 14px;
  position: relative;
  @media (min-width: 750px) { border-radius: 16px; padding: 18px; }
`;

const HighlyRecommendedBadge = styled.span`
  position: absolute;
  top: -9px;
  right: 12px;
  background: #01040a;
  border: 1px solid rgba(0, 247, 255, 0.3);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 8px;
  font-weight: 700;
  color: #00f7ff;
  letter-spacing: 0.5px;
  @media (min-width: 750px) { top: -10px; right: 16px; font-size: 9px; padding: 3px 12px; }
`;

const PackageFlexBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  
  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const PackageDetails = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;

  .crown-avatar-ring {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(168, 85, 247, 0.35);
    background: rgba(168, 85, 247, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a855f7;
    font-size: 16px;
    flex-shrink: 0;
    @media (min-width: 750px) { width: 42px; height: 42px; font-size: 18px; }
  }

  .pricing-specs {
    flex: 1;
    h3 { font-size: 13.5px; font-weight: 600; margin: 0 0 4px 0; color: #ffffff; @media (min-width: 750px) { font-size: 15px; } }
    .html-description-box { font-size: 11px; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4; @media (min-width: 750px) { font-size: 11.5px; } b { color: #ffffff; font-weight: 600; } }
    
    .price-row {
      display: grid;
      grid-template-columns: 80px 1fr;
      font-size: 11px;
      margin-bottom: 2px;
      @media (min-width: 750px) { grid-template-columns: 85px 1fr; font-size: 12px; }
      .label-price { color: #56677d; }
      .value-price { color: #ffffff; font-weight: 600; }
      &.cyan-row {
        .label-price { color: #00f7ff; font-weight: 500; }
        .value-price { color: #00f7ff; font-weight: 700; }
      }
    }
  }
`;

const BlueCTAButton = styled.button`
  background: linear-gradient(90deg, #0052d4 0%, #4364f7 50%, #6fb1fc 100%);
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  min-width: 110px;
  box-shadow: 0 4px 14px rgba(67, 100, 247, 0.3);
  align-self: stretch;

  @media (min-width: 480px) {
    align-self: center;
    border-radius: 12px;
    padding: 14px 20px;
    font-size: 12px;
  }
  span { font-size: 12px; @media (min-width: 480px) { font-size: 13px; } }
`;

/* ==========================================================================
   COMPONENTE PRINCIPAL BLINDADO CONTRA CAMBIOS DE ESQUEMA EN LA API
   ========================================================================== */
const VisarkaResultadosScreen = ({ analysisData, photos, onBack, onReset }) => {
  const [selectedLook, setSelectedLook] = useState(null);

  // Parsear si llega en formato string JSON
  let coreData = analysisData;
  if (typeof analysisData === 'string') {
    try {
      coreData = JSON.parse(analysisData);
    } catch (e) {
      console.error("Error parseando string en analysisData", e);
    }
  }

  // Desencapsular de capas comunes del backend de forma profunda
  if (coreData?.data) coreData = coreData.data;
  if (coreData?.result) coreData = coreData.result;

  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };
console.log("DATOS COMPLETOS DE LA IA:", coreData);
  // 1. Manejo seguro de la fotografía de entrada
  const userPhoto = coreData?.optimizedUserPhoto 
    ? coreData.optimizedUserPhoto 
    : (photos?.front 
        ? (photos.front.startsWith('data:') ? photos.front : `data:image/jpeg;base64,${photos.front}`)
        : "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=400");

  // 2. HUD Superior (Evita los strings "nulo" o "Analizando" vacíos de las pantallas de carga intermedias)
  const faceShape = coreData?.faceShape && coreData.faceShape !== "nulo" ? coreData.faceShape : 'Analizando...';
  const hairType = coreData?.hairType && coreData.hairType !== "nulo" ? coreData.hairType : 'Analizando...';
  const profileType = coreData?.profileType && coreData.profileType !== "nulo" ? coreData.profileType : 'Analizando...';
  const skinType = coreData?.skinType && coreData.skinType !== "nulo" ? coreData.skinType : 'Analizando...';

  // 3. Bloque Morfopsicológico
  const morphopsychologyText = coreData?.morfopsicologia?.racional 
    ? cleanText(coreData.morfopsicologia.racional) 
    : "Análisis morfológico no disponible de momento.";

  // 4. Mapeo Seguro del Array de Recomendaciones de Cortes
  const backendRecommendations = coreData?.haircutRecommendations;
  const suggestedLooks = (Array.isArray(backendRecommendations) && backendRecommendations.length > 0)
    ? backendRecommendations.map((look) => ({
        title: look.name || "Corte Premium", 
        subtitle: look.description ? look.description.split(" ")[0] : "Estilo Diseñado", 
        img: look.aiImageUrl || userPhoto, 
        description: cleanText(look.description) || "Estilo premium adaptado para balancear la simetría facial."
      }))
    : [
        { title: "Mid Fade Texturizado", subtitle: "Texturizado", img: userPhoto, description: "Estilo equilibrado mapeado sobre tu estructura facial." },
        { title: "Corte Texturizado Orgánico", subtitle: "Desconectado", img: userPhoto, description: "Aporta volumen natural libre de rigidez adaptado a tu perfil." },
        { title: "Low Fade con Contornos", subtitle: "Contornos Marcados", img: userPhoto, description: "Líneas ultra nítidas simuladas sobre tu fisonomía real." }
      ];

  // 5. Diagnóstico Dermo-facial
  const skinDiagnosticsText = coreData?.skincare 
    ? cleanText(coreData.skincare) 
    : "Evaluando estado dermo-facial del rostro...";
    
  const skinRecommendationText = coreData?.routine 
    ? cleanText(coreData.routine) 
    : "Esperando recomendación de tratamiento.";

  // 6. CONTROL ULTRA-ESTRICTO PARA EVITAR DUPLICADOS EN LA SECCIÓN COMERCIAL (Manejando el bug de la captura 214024)
  const rawUpgradeHtml = coreData?.lordsUpgrade || "<b>Opción Recomendada</b>: Tratamiento premium adaptado para ti.";
  
  // Si package.name es igual al inicio de lordsUpgrade, usamos un fallback limpio para que el título no sea redundante
  let packageTitle = coreData?.package?.name || "Paquete Personalizado Lords";
  if (packageTitle.toLowerCase().includes("paquete recomendado") || packageTitle.toLowerCase() === "consultor") {
    packageTitle = "Paquete Personalizado Lords";
  }

  // Precios estables con fallbacks correctos ante respuestas asíncronas caídas
  const priceStandard = coreData?.package?.standardPrice && coreData.package.standardPrice !== "Consultor" 
    ? coreData.package.standardPrice 
    : "$145.000";
  const priceClub = coreData?.package?.clubPrice && coreData.package.clubPrice !== "Consultor" 
    ? coreData.package.clubPrice 
    : "$130.500";

  return (
    <VisarkaModuleWrapper>
      
      <IntegratedHeader>
        <div className="brand-logo" onClick={onBack} style={{ cursor: 'pointer' }}>VISARKA</div>
        <div className="mesh-status">Análisis Activo</div>
      </IntegratedHeader>

      <FullModalScrollArea>
        
        {/* COLUMNA IZQUIERDA: BIOMÉTRICO + ANÁLISIS MORFOPSICOLÓGICO */}
        <DashboardColumn>
          <BiometricHeroGrid>
            <ClientScannerView>
              <img src={userPhoto} className="photo" alt="Escaneo Facial" />
              <div className="hud-mesh-overlay" />
              <div className="bracket tl" />
              <div className="bracket tr" />
              <div className="bracket bl" />
              <div className="bracket br" />
            </ClientScannerView>

            <BioTraitsColumn>
              <TraitHUDCard>
                <div className="icon-wrapper cyan">👤</div>
                <div className="meta">
                  <span className="label">Rostro</span>
                  <span className="value">{faceShape}</span>
                </div>
              </TraitHUDCard>
              
              <TraitHUDCard>
                <div className="icon-wrapper purple">🧬</div>
                <div className="meta">
                  <span className="label">Cabello</span>
                  <span className="value">{hairType}</span>
                </div>
              </TraitHUDCard>

              <TraitHUDCard>
                <div className="icon-wrapper cyan">👤</div>
                <div className="meta">
                  <span className="label">Perfil</span>
                  <span className="value">{profileType}</span>
                </div>
              </TraitHUDCard>

              <TraitHUDCard>
                <div className="icon-wrapper purple">💧</div>
                <div className="meta">
                  <span className="label">Piel</span>
                  <span className="value">{skinType}</span>
                </div>
              </TraitHUDCard>
            </BioTraitsColumn>
          </BiometricHeroGrid>

          <ReportSectionContainer>
            <SectionHeaderRow>
              <div className="left-headline purple-heading">🧠 1. Análisis Morfopsicológico</div>
            </SectionHeaderRow>
            <MorfoFlexLayout>
              <p>{morphopsychologyText}</p>
              <div className="wireframe-mesh-head" />
            </MorfoFlexLayout>
          </ReportSectionContainer>
        </DashboardColumn>

        {/* COLUMNA DERECHA: LOOKS PROPUESTOS + MEJORA DE IMAGEN + EXPERIENCIA */}
        <DashboardColumn>
          <ReportSectionContainer>
            <SectionHeaderRow>
              <div className="left-headline pink-heading">⚡ 2. Propuestas de Look</div>
              <span className="action-link" style={{ cursor: 'pointer' }}>Ver todas <IoChevronForward /></span>
            </SectionHeaderRow>
            
            <LooksHorizontalScroll>
              {suggestedLooks.map((look, index) => (
                <LookThumbnailCard key={index}>
                  <div className="photo-frame">
                    <img src={look.img} alt={look.title} />
                    <IaBadge>IA Preview</IaBadge>
                  </div>
                  <h4>{look.title}</h4>
                  <p>{look.subtitle}</p>
                  <div 
                    className="action-circle-btn" 
                    onClick={() => setSelectedLook(look)}
                  >
                    ❯
                  </div>
                </LookThumbnailCard>
              ))}
            </LooksHorizontalScroll>
          </ReportSectionContainer>

          <ReportSectionContainer>
            <SectionHeaderRow>
              <div className="left-headline purple-heading">✨ 3. Mejora tu Imagen</div>
            </SectionHeaderRow>
            <SkinImprovementLayout>
              <div className="skin-droplet-ring">💧</div>
              <div className="text-box">
                {skinDiagnosticsText}
                <div className="recommendation-highlight">
                  {skinRecommendationText}
                </div>
              </div>
            </SkinImprovementLayout>
          </ReportSectionContainer>

          <ReportSectionContainer>
            <SectionHeaderRow>
              <div className="left-headline cyan-heading">💎 4. Experiencia Recomendada</div>
            </SectionHeaderRow>
            
            <PackageContainer>
              <HighlyRecommendedBadge>MÁS RECOMENDADO</HighlyRecommendedBadge>
              <PackageFlexBody>
                <PackageDetails>
                  <div className="crown-avatar-ring">👑</div>
                  <div className="pricing-specs">
                    <h3>{packageTitle}</h3>
                    
                    {/* Renderizado dinámico de HTML crudo para conservar etiquetas <b> y <br/> del backend */}
                    <div 
                      className="html-description-box" 
                      dangerouslySetInnerHTML={{ __html: rawUpgradeHtml }} 
                    />
                    
                    <div className="price-row">
                      <span className="label-price">V. Estándar</span>
                      <span className="value-price">{priceStandard}</span>
                    </div>
                    <div className="price-row cyan-row">
                      <span className="label-price">V. Club Lords</span>
                      <span className="value-price">{priceClub}</span>
                    </div>
                  </div>
                </PackageDetails>

                <BlueCTAButton onClick={onReset}>
                  VOLVER A <span>ESCANEAR</span> ❯
                </BlueCTAButton>
              </PackageFlexBody>
            </PackageContainer>
          </ReportSectionContainer>
        </DashboardColumn>

      </FullModalScrollArea>

      {/* MODAL DE DETALLE AMPLIADO */}
      {selectedLook && (
        <ModalOverlay onClick={() => setSelectedLook(null)}>
          <ModalContentCard onClick={(e) => e.stopPropagation()}>
            <CloseModalBtn onClick={() => setSelectedLook(null)}>
              <IoClose size={16} />
            </CloseModalBtn>
            
            <ModalBigImageFrame>
              <img src={selectedLook.img} alt={selectedLook.title} />
            </ModalBigImageFrame>
            
            <ModalBodyInfo>
              <span className="tag-style">{selectedLook.subtitle}</span>
              <h3>{selectedLook.title}</h3>
              <p>{selectedLook.description}</p>
            </ModalBodyInfo>
          </ModalContentCard>
        </ModalOverlay>
      )}

    </VisarkaModuleWrapper>
  );
};

export default VisarkaResultadosScreen;