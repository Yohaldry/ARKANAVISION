import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoScanOutline, 
  IoChevronForwardOutline, 
  IoHeartOutline, 
  IoDiamondOutline, 
  IoGridOutline, 
  IoTimeOutline, 
  IoSettingsOutline,
  IoCameraOutline,
  IoShieldCheckmarkOutline,
  IoPencilOutline,
  IoCloseOutline,
  IoCloudUploadOutline,
  IoLogOutOutline,
  IoWarningOutline
} from "react-icons/io5";

import { obtenerPerfilProfesional, actualizarPerfilProfesional } from '../../../firebase/authService';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; 

// Componentes del Ecosistema de Escaneo
import BiometricForm from './BiometricForm'; 
import FaceScanner from './FaceScanner';

/* ==========================================================================
   STYLED COMPONENTS - VISARKA PREMIUM UI (PANEL)
   ========================================================================== */

const PanelContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #050912; 
  color: #FFFFFF;
  padding: 16px;
  padding-bottom: 90px; 
  box-sizing: border-box;
  font-family: 'Inter', 'Manrope', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px;
    padding-bottom: 32px;
    gap: 24px;
  }
`;

const HeaderHUD = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  .brand-logo {
    font-family: 'Sora', 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 6px;
    background: linear-gradient(90deg, #00E5FF, #1677FF, #8E3DEE);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
  }

  .isotipo-mini {
    width: 40px;
    height: 40px;
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 19, 34, 0.6);
    color: #f87171; 
    box-shadow: 0 0 10px rgba(248, 113, 113, 0.15);
    transition: all 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      background: rgba(248, 113, 113, 0.1);
      border-color: #f87171;
      box-shadow: 0 0 15px rgba(248, 113, 113, 0.3);
    }
  }
`;

const MainLayoutGrid = styled.main`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 320px 1fr 360px;
    align-items: start;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CenterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-column: span 2;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProfessionalProfileCard = styled.div`
  background: linear-gradient(135deg, #0A1322 0%, #07111F 100%);
  border: 1px solid rgba(22, 119, 255, 0.15);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;

  @media (min-width: 1024px) {
    flex-direction: column;
    text-align: center;
    padding: 32px 24px;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(142, 61, 238, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00E5FF, #8E3DEE);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    background: #0A1322;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  @media (min-width: 1024px) {
    align-items: center;
  }

  h3 {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #FFFFFF;
    letter-spacing: 0.5px;
  }

  span.email {
    font-size: 13px;
    color: #8B9CB6;
    margin-bottom: 4px;
  }
`;

const EditProfileButton = styled.button`
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: #00E5FF;
  padding: 6px 12px;
  font-size: 11px;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease-in-out;
  margin-top: 4px;

  &:hover {
    background: rgba(0, 229, 255, 0.15);
    border-color: #00E5FF;
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  }
`;

const BadgeLords = styled.div`
  align-self: flex-start;
  background: rgba(0, 229, 255, 0.06);
  border: 1px solid #00E5FF;
  color: #00E5FF;
  font-family: 'Sora', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);

  @media (min-width: 1024px) {
    align-self: center;
  }
`;

const ForwardArrow = styled(IoChevronForwardOutline)`
  color: #00E5FF;
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(3px);
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MottoText = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #8B9CB6;
  font-style: italic;
  max-width: 240px;
  line-height: 1.4;
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #0A1322;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  position: relative;

  @media (max-width: 1023px) {
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  @media (min-width: 1024px) {
    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 16px;
    }
  }

  .icon-box {
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    &.blue { color: #00E5FF; }
    &.pink { color: #8E3DEE; }
    &.cyan { color: #00E5FF; }
  }

  .text-box {
    display: flex;
    flex-direction: column;
    
    .number {
      font-family: 'Sora', sans-serif;
      font-size: 18px;
      font-weight: bold;
      color: #FFFFFF;
    }
    
    .label {
      font-size: 10px;
      color: #8B9CB6;
      line-height: 1.2;
    }
  }
`;

const ScannerWorkspaceCard = styled.div`
  background: radial-gradient(circle at center, #0A1322 0%, #07111F 100%);
  border: 1px solid rgba(0, 229, 255, 0.1);
  border-radius: 24px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 340px;
  flex: 1;
  position: relative;
  box-shadow: inset 0 0 30px rgba(0, 229, 255, 0.02);

  .scanner-placeholder-ui {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 2px dashed rgba(0, 229, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 229, 255, 0.4);
    margin-bottom: 24px;
    position: relative;
    animation: pulse 3s infinite;

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.03); opacity: 1; border-color: #00E5FF; }
      100% { transform: scale(1); opacity: 0.6; }
    }
  }

  h4 {
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 13px;
    color: #8B9CB6;
    max-width: 280px;
    margin: 0 0 24px 0;
    line-height: 1.4;
  }
`;

const PCScannerButton = styled.button`
  background: linear-gradient(90deg, #00E5FF, #1677FF, #8E3DEE);
  border: none;
  border-radius: 30px;
  padding: 14px 32px;
  color: #FFFFFF;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(0, 229, 255, 0.6);
  }
`;

const MenuActionsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MenuRowItem = styled.div`
  background: rgba(10, 19, 34, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.02);
  padding: 16px 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${props => props.isDanger ? 'rgba(248, 113, 113, 0.06)' : 'rgba(22, 119, 255, 0.06)'};
    border-color: ${props => props.isDanger ? 'rgba(248, 113, 113, 0.3)' : 'rgba(0, 229, 255, 0.2)'};
    transform: translateX(2px);
  }

  .left-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .icon-container {
    font-size: 22px;
    display: flex;
    align-items: center;
    color: ${props => props.iconColor || '#FFFFFF'};
  }

  .meta-texts {
    display: flex;
    flex-direction: column;
    gap: 2px;

    span.title {
      font-size: 14px;
      font-weight: 500;
      color: #FFFFFF;
    }

    span.subtitle {
      font-size: 11px;
      color: #8B9CB6;
    }
  }

  .chevron-right {
    color: rgba(255, 255, 255, 0.3);
    font-size: 16px;
  }
`;

const NavigationBarHUD = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background: #07111F;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px 24px 0 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 12px 24px 12px;
  box-sizing: border-box;
  box-shadow: 0 -10px 30px rgba(5, 9, 18, 0.9);

  @media (min-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? '#FFFFFF' : '#8B9CB6'};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  cursor: pointer;

  .nav-icon {
    font-size: 20px;
    color: ${props => props.active ? '#8E3DEE' : 'inherit'};
  }
`;

const CentralScannerTrigger = styled.button`
  position: relative;
  top: -22px; 
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00E5FF, #1677FF);
  border: 4px solid #07111F; 
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2);
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 9px;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  .scan-icon {
    font-size: 24px;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SysLoadingContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #050912;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #00E5FF;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  letter-spacing: 1px;

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(0, 229, 255, 0.1);
    border-top-color: #00E5FF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;

/* ==========================================================================
   DISEÑO EXCLUSIVO DE LA TARJETA FLOTANTE (SCANNER INTEGRADO)
   ========================================================================== */

const WideScannerModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(3, 7, 18, 0.75); 
  backdrop-filter: blur(12px); 
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px; 
  box-sizing: border-box;
`;

const WideScannerContent = styled(motion.div)`
  width: 100%;
  max-width: 968px; 
  height: 80vh; 
  max-height: 99%; 
  background: #050912;
  border: 2px solid rgba(0, 229, 255, 0.25); 
  border-radius: 28px;
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  & > div {
    border-radius: 26px;
  }

  @media(max-width: 480px) {
    height: 78vh;
    border-radius: 24px;
    & > div {
      border-radius: 22px;
    }
  }
`;

const CloseScannerX = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #8B9CB6;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 150;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.4);
  }
`;

/* ==========================================================================
   MODALES DE ASISTENCIA COMPLEMENTARIOS
   ========================================================================== */

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(5, 9, 18, 0.85); backdrop-filter: blur(8px); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #0A1322 0%, #07111F 100%);
  border: 1px solid ${props => props.borderColor || 'rgba(0, 229, 255, 0.3)'};
  box-shadow: 0 0 30px ${props => props.glowColor || 'rgba(0, 229, 255, 0.15)'};
  border-radius: 24px; width: 100%; max-width: 440px; padding: 28px; box-sizing: border-box; position: relative;
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h4 { margin: 0; font-family: 'Sora', sans-serif; font-size: 16px; color: ${props => props.titleColor || '#00E5FF'}; } }
  .danger-body { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; p { font-size: 14px; color: #8B9CB6; margin: 0; strong { color: #FFFFFF; } } }
`;

const CloseButton = styled.button`
  background: none; border: none; color: #8B9CB6; font-size: 24px; cursor: pointer;
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;
  label { font-size: 11px; font-family: 'Sora', sans-serif; color: #8B9CB6; text-transform: uppercase; }
  textarea {
    background: rgba(5, 9, 18, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px; padding: 12px 16px; color: #FFFFFF; font-size: 14px; height: 90px; resize: none;
    &:focus { outline: none; border-color: #00E5FF; }
  }
`;

const MediaUploadZone = styled.label`
  border: 2px dashed rgba(0, 229, 255, 0.25); background: rgba(5, 9, 18, 0.4);
  border-radius: 16px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer;
  input[type="file"] { display: none; }
  .preview-container { width: 75px; height: 75px; border-radius: 50%; overflow: hidden; border: 2px solid #00E5FF; img { width: 100%; height: 100%; object-fit: cover; } }
  .upload-icon-box { color: #00E5FF; font-size: 28px; }
  .upload-texts { display: flex; flex-direction: column; text-align: center; span.main-text { font-size: 13px; color: #FFFFFF; } span.sub-text { font-size: 11px; color: #8B9CB6; } }
`;

const ModalActions = styled.div`
  display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px;
  button { padding: 12px 24px; border-radius: 12px; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; }
  .btn-cancel { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #8B9CB6; }
  .btn-save { background: linear-gradient(90deg, #00E5FF, #1677FF); border: none; color: #FFFFFF; }
  .btn-logout-confirm { background: linear-gradient(90deg, #f87171, #ef4444); border: none; color: #FFFFFF; }
`;

/* ==========================================================================
   COMPONENTE MAIN EXPORT
   ========================================================================== */

const PanelDeControl = () => {
  const [currentTab, setCurrentTab] = useState('perfil');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modales Standard
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // CONTROLADORES DE SCANNER EMBEBIDO (DIRECTO AL FORMULARIO)
  const [isOpenScannerModal, setIsOpenScannerModal] = useState(false);
  const [scannerStep, setScannerStep] = useState(1); // 1: BiometricForm, 2: FaceScanner

  // Form states
  const [inputFoto, setInputFoto] = useState(''); 
  const [inputMotto, setInputMotto] = useState('');
  const [subiendo, setSubiendo] = useState(false); 

  const auth = getAuth();

  useEffect(() => {
    const desescribirAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const resultado = await obtenerPerfilProfesional(user.uid);
        if (resultado.success) {
          setUsuario(resultado.data);
          setInputFoto(resultado.data?.fotoPerfil || '');
          setInputMotto(resultado.data?.motto || 'Tu estilo. Tu imagen. Tu mejor versión.');
          
          if (!searchParams.get('id')) {
            setSearchParams({ id: user.uid }, { replace: true });
          }
        } else {
          setError(resultado.error || 'Fallo de enlace con el Core Central.');
        }
        setLoading(false);
      } else {
        const userIdParam = searchParams.get('id');
        if (userIdParam) {
          const resultado = await obtenerPerfilProfesional(userIdParam);
          if (resultado.success) {
            setUsuario(resultado.data);
            setInputFoto(resultado.data?.fotoPerfil || '');
            setInputMotto(resultado.data?.motto || 'Tu estilo. Tu imagen. Tu mejor versión.');
          } else {
            setError(resultado.error || 'Fallo de enlace con el Core Central.');
          }
          setLoading(false);
        } else {
          setError('Acceso denegado. Sesión expirada o inválida.');
          setLoading(false);
        }
      }
    });

    return () => desescribirAuth();
  }, [auth, searchParams, setSearchParams]);

  const handleMediaCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInputFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // DISPARAR MODAL DIRECTAMENTE AL FORMULARIO
  const openScannerWorkspace = () => {
    setScannerStep(1); // Abre directo en el Paso 1 (Formulario)
    setIsOpenScannerModal(true);
  };

  // CERRAR MODAL
  const closeScannerWorkspace = () => {
    setIsOpenScannerModal(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSubiendo(true);
    const uidActivo = auth.currentUser?.uid || searchParams.get('id');
    const nuevosDatos = { fotoPerfil: inputFoto, motto: inputMotto };
    const resultado = await actualizarPerfilProfesional(uidActivo, nuevosDatos);

    if (resultado.success) {
      setUsuario(prev => ({ ...prev, ...nuevosDatos }));
      setIsOpenModal(false);
    } else {
      alert(`Error al guardar: ${resultado.error}`);
    }
    setSubiendo(false);
  };

  const executeSignOut = async () => {
    try {
      await signOut(auth);
      setShowConfirmModal(false);
      navigate('/', { replace: true });
    } catch (err) {
      alert("Error al desvincular terminal.");
    }
  };

  if (loading) {
    return (
      <SysLoadingContainer>
        <div className="spinner"></div>
        <span>SINCRONIZANDO CON CORE...</span>
      </SysLoadingContainer>
    );
  }

  if (error) {
    return (
      <SysLoadingContainer style={{ color: '#f87171' }}>
        <IoShieldCheckmarkOutline size={38} style={{ opacity: 0.6 }} />
        <span>SISTEMA RESTRINGIDO: {error}</span>
        <button className="btn-retry" onClick={() => navigate('/')}>Regresar</button>
      </SysLoadingContainer>
    );
  }

  return (
    <PanelContainer>
      
      <HeaderHUD>
        <div className="brand-logo">VISARKA</div>
        <div className="isotipo-mini" onClick={() => setShowConfirmModal(true)}>
          <IoLogOutOutline size={20} />
        </div>
      </HeaderHUD>

      <MainLayoutGrid>
        
        <LeftColumn>
          <ProfessionalProfileCard>
            <AvatarWrapper>
              <img 
                src={usuario?.fotoPerfil || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238B9CB6'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>"} 
                alt="Professional Avatar" 
              />
            </AvatarWrapper>
            <ProfileInfo>
              <h3>{`${usuario?.nombre || 'Consultor'} ${usuario?.apellido || ''}`}</h3>
              <span className="email">{usuario?.email || 'anonimo@visarka.com'}</span>
              <BadgeLords>👑 Club Lords</BadgeLords>
              <MottoText>{usuario?.motto || "Tu estilo. Tu imagen. Tu mejor versión."}</MottoText>
              <EditProfileButton onClick={() => setIsOpenModal(true)}>
                <IoPencilOutline size={13} /> Editar Perfil
              </EditProfileButton>
            </ProfileInfo>
            <ForwardArrow />
          </ProfessionalProfileCard>

          <QuickStatsGrid>
            <StatItem>
              <div className="icon-box blue"><IoScanOutline /></div>
              <div className="text-box">
                <span className="number">12</span>
                <span className="label">Análisis realizados</span>
              </div>
            </StatItem>
            <StatItem>
              <div className="icon-box pink"><IoHeartOutline /></div>
              <div className="text-box">
                <span className="number">7</span>
                <span className="label">Looks favoritos</span>
              </div>
            </StatItem>
            <StatItem>
              <div className="icon-box cyan"><IoDiamondOutline /></div>
              <div className="text-box">
                <span className="number">V.</span>
                <span className="label">Nivel de membresía</span>
              </div>
            </StatItem>
          </QuickStatsGrid>
        </LeftColumn>

        <CenterColumn>
          <ScannerWorkspaceCard>
            <div className="scanner-placeholder-ui">
              <IoScanOutline size={56} />
            </div>
            <h4>Módulo de Escaneo Facial</h4>
            <p>Posiciona la cámara de la tablet o PC de frente al cliente para iniciar el mapeo biométrico de facciones.</p>
            <PCScannerButton onClick={openScannerWorkspace}>
              <IoScanOutline size={20} />
              INICIAR SCANNER VISARKA
            </PCScannerButton>
          </ScannerWorkspaceCard>
        </CenterColumn>

        <RightColumn>
          <MenuActionsStack>
            <MenuRowItem iconColor="#8E3DEE">
              <div className="left-content">
                <div className="icon-container"><IoGridOutline /></div>
                <div className="meta-texts"><span className="title">Mi diagnóstico</span><span className="subtitle">Ver tu análisis morfopsicológico</span></div>
              </div>
              <IoChevronForwardOutline className="chevron-right" />
            </MenuRowItem>
            <MenuRowItem iconColor="#00E5FF">
              <div className="left-content">
                <div className="icon-container"><IoTimeOutline /></div>
                <div className="meta-texts"><span className="title">Historial de análisis</span><span className="subtitle">Consulta tus análisis anteriores</span></div>
              </div>
              <IoChevronForwardOutline className="chevron-right" />
            </MenuRowItem>
          </MenuActionsStack>
        </RightColumn>

      </MainLayoutGrid>

      {/* ==========================================================================
         MODAL EMBEBIDO DINÁMICO MULTI-PASO (DIRECTO A FORMULARIO BIOMÉTRICO)
         ========================================================================== */}
      <AnimatePresence>
        {isOpenScannerModal && (
          <WideScannerModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WideScannerContent
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            >
              <CloseScannerX onClick={closeScannerWorkspace}>
                <IoCloseOutline size={24} />
              </CloseScannerX>

              {/* PASO 1: FORMULARIO BIOMÉTRICO */}
              {scannerStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full h-full overflow-y-auto p-6 md:p-10 pt-20"
                  style={{ background: '#050912', scrollbarWidth: 'thin' }}
                >
                  <BiometricForm onNextStep={() => setScannerStep(2)} />
                </motion.div>
              )}

              {/* PASO 2: SCANNER FOTOGRÁFICO DE LA CÁMARA */}
              {scannerStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center p-6 pt-16"
                  style={{ background: '#050912' }}
                >
                  <FaceScanner onScanComplete={closeScannerWorkspace} />
                </motion.div>
              )}

            </WideScannerContent>
          </WideScannerModalOverlay>
        )}
      </AnimatePresence>

      {/* MODAL CONFIG PERFIL */}
      {isOpenModal && (
        <ModalOverlay onClick={() => !subiendo && setIsOpenModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>MODIFICAR TERMINAL DE PERFIL</h4>
              <CloseButton onClick={() => !subiendo && setIsOpenModal(false)}><IoCloseOutline /></CloseButton>
            </div>
            <form onSubmit={handleSaveChanges}>
              <FormGroup>
                <label>Foto de Perfil</label>
                <MediaUploadZone>
                  <input type="file" accept="image/*" onChange={handleMediaCapture} disabled={subiendo} />
                  {inputFoto ? <div className="preview-container"><img src={inputFoto} alt="Preview" /></div> : <div className="upload-icon-box"><IoCloudUploadOutline /></div>}
                  <div className="upload-texts"><span className="main-text">Cambiar captura</span></div>
                </MediaUploadZone>
              </FormGroup>
              <FormGroup>
                <label>Descripción / Motto</label>
                <textarea maxLength={120} value={inputMotto} onChange={(e) => setInputMotto(e.target.value)} disabled={subiendo} />
              </FormGroup>
              <ModalActions>
                <button type="button" className="btn-cancel" onClick={() => setIsOpenModal(false)}>CANCELAR</button>
                <button type="submit" className="btn-save" disabled={subiendo}>{subiendo ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</button>
              </ModalActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL SALIDA */}
      {showConfirmModal && (
        <ModalOverlay onClick={() => setShowConfirmModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} borderColor="rgba(248, 113, 113, 0.4)" titleColor="#f87171">
            <div className="modal-header">
              <h4>CONFIRMAR ALERTA</h4>
              <CloseButton onClick={() => setShowConfirmModal(false)}><IoCloseOutline style={{ color: '#f87171' }} /></CloseButton>
            </div>
            <div className="danger-body">
              <IoWarningOutline size={50} style={{ color: '#f87171' }} />
              <p>¿Está seguro de que desea <strong>cerrar la sesión</strong>?</p>
            </div>
            <ModalActions>
              <button type="button" className="btn-cancel" onClick={() => setShowConfirmModal(false)}>CANCELAR</button>
              <button type="button" className="btn-logout-confirm" onClick={executeSignOut}>DESCONECTAR</button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* NAV BAR INFERIOR (MÓVIL) */}
      <NavigationBarHUD>
        <NavItem active={currentTab === 'resultados'} onClick={() => setCurrentTab('resultados')}>
          <IoGridOutline className="nav-icon" /> Resultados
        </NavItem>
        <NavItem active={currentTab === 'look'} onClick={() => setCurrentTab('look')}>
          <IoCameraOutline className="nav-icon" /> Look
        </NavItem>
        
        <CentralScannerTrigger onClick={openScannerWorkspace}>
          <IoScanOutline className="scan-icon" /> ESCANEAR
        </CentralScannerTrigger>
        
        <NavItem active={currentTab === 'servicios'} onClick={() => setCurrentTab('servicios')}>
          <IoDiamondOutline className="nav-icon" /> Servicios
        </NavItem>
        <NavItem active={currentTab === 'perfil'} onClick={() => setCurrentTab('perfil')}>
          <IoSettingsOutline className="nav-icon" style={{ color: '#8E3DEE' }} /> Perfil
        </NavItem>
      </NavigationBarHUD>

    </PanelContainer>
  );
};

export default PanelDeControl;