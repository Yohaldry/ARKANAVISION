import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import styled from 'styled-components';

import ResultsScanner from './ResultsScanner';

import FaceDetection, {
  drawTechnicalGuides
} from './RaizAlgoritmica/FaceDetection';

import {
  calculateFaceShape,
  calculateSymmetry,
  calculateProfileType,
  detectSkinCondition,
  generateHairType
} from './utils/biometricEngine';

import {
  IoPersonCircleOutline,
  IoCutOutline,
  IoBodyOutline,
  IoColorPaletteOutline,
  IoSparklesOutline,
  IoCheckmark
} from "react-icons/io5";

/* ==========================================================================
   STYLED COMPONENTS: ESTRUCTURA INTERNA ULTRA-COMPACTA PARA MODALES
   ========================================================================== */

const ResponsiveScannerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #02050a;
  box-sizing: border-box;
  padding: 12px;
  gap: 12px;
  overflow: hidden;
`;

const ResponsiveCameraChassis = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  aspect-ratio: 3 / 4;
  max-height: 68%;
  margin: 0 auto;
  border-radius: 24px;
  border: 1px solid ${props => props.detected ? '#00f7ff' : 'rgba(255, 255, 255, 0.05)'};
  background: #000000;
  box-shadow: ${props => props.detected ? '0 0 25px rgba(0, 247, 255, 0.15)' : 'none'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const VideoWrapperRelative = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ScanningLine = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00f7ff, transparent);
  box-shadow: 0 0 15px #00f7ff;
  z-index: 15;
  top: 0;
  animation: scanMove 2.5s ease-in-out infinite;
  @keyframes scanMove { 
    0% { top: 0%; } 
    50% { top: 100%; } 
    100% { top: 0%; } 
  }
`;

const PositionGuideHUD = styled.div`
  width: 100%;
  text-align: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${props => props.invalid ? 'rgba(255, 59, 59, 0.08)' : 'rgba(0, 255, 136, 0.08)'};
  border: 1px solid ${props => props.invalid ? 'rgba(255, 59, 59, 0.3)' : 'rgba(0, 255, 136, 0.3)'};
  color: ${props => props.invalid ? '#ff3b3b' : '#00ff88'};
  font-family: 'Space Grotesk', monospace;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
  opacity: ${props => props.complete ? 0 : 1};
  transition: opacity 0.3s ease, all 0.2s ease;
  box-sizing: border-box;
`;

const ProgressBarHUD = styled.div`
  width: 100%;
  background: rgba(6, 11, 20, 0.85);
  border: 1px solid rgba(0, 247, 255, 0.15);
  border-radius: 16px;
  padding: 12px;
  backdrop-filter: blur(8px);
  opacity: ${props => props.complete ? 0 : 1};
  transition: opacity 0.3s ease;
  box-sizing: border-box;
`;

const HUDIconSmall = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${props => props.active ? '#00ff88' : 'rgba(0, 247, 255, 0.2)'};
  flex: 1;
  transition: color 0.3s;

  .icon-circle-mini {
    width: 26px; 
    height: 26px; 
    border-radius: 50%;
    border: 1px solid ${props => props.active ? '#00ff88' : 'rgba(0, 247, 255, 0.15)'};
    display: flex; 
    align-items: center; 
    justify-content: center;
    background: rgba(0, 0, 0, 0.5); 
    font-size: 13px;
    box-shadow: ${props => props.active ? '0 0 8px rgba(0, 255, 136, 0.3)' : 'none'};
  }
  span { 
    font-family: 'Space Grotesk', monospace;
    font-size: 8px; 
    font-weight: 700; 
    letter-spacing: 0.5px; 
    text-transform: uppercase; 
  }
`;

const FloatingFooterActionButton = styled.button`
  width: 100%;
  height: 48px;
  background: ${props => props.isComplete ? 'linear-gradient(90deg, #00E5FF 0%, #8A2BE2 100%)' : 'rgba(0, 0, 0, 0.4)'};
  border: 1px solid ${props => props.isComplete ? '#00E5FF' : 'rgba(0, 247, 255, 0.25)'};
  color: #ffffff;
  border-radius: 14px;
  font-family: 'Space Grotesk', monospace;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: ${props => props.isComplete ? 'pointer' : 'default'};
  transition: all 0.2s;
  box-shadow: ${props => props.isComplete ? '0 0 15px rgba(0, 229, 255, 0.4)' : 'none'};
  box-sizing: border-box;

  &:active {
    transform: ${props => props.isComplete ? 'scale(0.98)' : 'none'};
  }
`;

const PrintingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: #02050a;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border-radius: 16px;
  
  .printing-text {
    font-family: 'Sora', sans-serif;
    color: #00f7ff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    animation: pulseText 1.5s infinite ease-in-out;
  }
  
  .sub-text {
    font-family: 'Space Grotesk', monospace;
    color: rgba(255, 255, 255, 0.35);
    font-size: 9px;
    letter-spacing: 1px;
  }

  @keyframes pulseText {
    0%, 100% { opacity: 0.6; text-shadow: 0 0 5px rgba(0,247,255,0.2); }
    50% { opacity: 1; text-shadow: 0 0 15px rgba(0,247,255,0.6); }
  }
`;

const SpinnerRing = styled.div`
  width: 44px;
  height: 44px;
  border: 2px solid rgba(0, 247, 255, 0.05);
  border-top: 2px solid #00f7ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */
const FaceScanner = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const currentStep = useRef(1);
  const lastLandmarks = useRef(null);
  const progressRef = useRef(0);

  const [currentView, setCurrentView] = useState('scanner'); 
  const [isPrinting, setIsPrinting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isInvalidPos, setIsInvalidPos] = useState(true);
  const [flash, setFlash] = useState(false);
  const [stepState, setStepState] = useState(1); 
  const [progress, setProgressState] = useState(0);
  const [photos, setPhotos] = useState({ front: null, profile: null });
  const [analysisData, setAnalysisData] = useState(null);

  const isComplete = stepState === 3;

  const setProgress = (value) => {
    progressRef.current = value;
    setProgressState(value);
  };

  const validateFrontFace = (landmarks) => {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeLevel = Math.abs(leftEye.y - rightEye.y);
    return nose.x > 0.35 && nose.x < 0.65 && eyeLevel < 0.04;
  };

  const validateRightProfile = (landmarks) => {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    return nose.x < 0.38 && eyeDistance < 0.12;
  };

  const resetScanner = () => {
    currentStep.current = 1;
    lastLandmarks.current = null;
    setPhotos({ front: null, profile: null });
    setAnalysisData(null);
    setProgress(0);
    setIsInvalidPos(true);
    setIsScanning(false);
    setStepState(1);
    setCurrentView('scanner');
  };

  const triggerPrintingLayout = async () => {
    setIsPrinting(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/arkana-scanner-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageFront: photos.front,     
          imageProfile: photos.profile  
        })
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor biométrico");
      }

      const comprehensiveReport = await response.json();

      setAnalysisData(comprehensiveReport);
      
      setIsPrinting(false);
      setCurrentView('results');

    } catch (error) {
      console.error("Error al conectar con Arkana Core IA en Localhost:", error);
      setIsPrinting(false);
      
      alert("Error de conexión con Arkana AI o API corrupta. Verificando consola de Node.");
      setCurrentView('results');
    }
  };

  const capturePhoto = () => { 
    if (!webcamRef.current) return;
    
    const video = webcamRef.current.video;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = video.videoWidth;
    outCanvas.height = video.videoHeight;
    const ctx = outCanvas.getContext('2d');
    
    ctx.translate(outCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    const snapshotDataURL = outCanvas.toDataURL('image/jpeg', 0.85);
    
    const fullBase64String = snapshotDataURL;

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (currentStep.current === 1) {
      setPhotos(prev => ({ ...prev, front: fullBase64String }));
      currentStep.current = 2;
      setStepState(2);
      setProgress(80); 
      setIsScanning(false); 
    } else if (currentStep.current === 2) {
      currentStep.current = 3; 
      setPhotos(prev => ({ ...prev, profile: fullBase64String }));
      
      if (video && lastLandmarks.current) {
        const landmarks = lastLandmarks.current;
        const skin = detectSkinCondition(video) || { skinType: 'Normal' };
        const faceShape = calculateFaceShape(landmarks) || 'Ovalado';
        const symmetry = calculateSymmetry(landmarks) || '95%';
        const profileType = calculateProfileType(landmarks) || 'Recto';
        const hairType = generateHairType(landmarks) || 'Intermedio'; 
        
        setAnalysisData(prev => ({
          ...prev,
          faceShape, 
          symmetry, 
          profileType, 
          hairType,
          skinType: skin.skinType
        }));
      }

      setStepState(3);
      setProgress(100);
      setIsScanning(false);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    }
  };

  const onResults = (results, canvasElement) => {
    if (!canvasElement || currentView === 'results' || stepState === 3) return;
    const video = webcamRef.current?.video;
    if (!video) return;

    const landmarks = results?.multiFaceLandmarks?.[0];
    const canvasCtx = canvasElement.getContext('2d');

    if (canvasElement.width !== video.videoWidth || canvasElement.height !== video.videoHeight) {
      canvasElement.width = video.videoWidth;
      canvasElement.height = video.videoHeight;
    }

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (landmarks) {
      lastLandmarks.current = landmarks;
      
      const isValid = currentStep.current === 1 
        ? validateFrontFace(landmarks) 
        : validateRightProfile(landmarks);

      setIsInvalidPos(!isValid);
      setIsScanning(isValid);

      canvasCtx.save();
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);

      if (window.drawConnectors) {
        const color = isValid ? '#00f7ff' : '#ff3b3b';
        const dpr = window.devicePixelRatio || 1;
        const lineWidthMesh = dpr > 1.5 ? 0.45 : 0.8;
        const lineWidthOval = dpr > 1.5 ? 1.10 : 1.4;

        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, { 
          color: `${color}25`, 
          lineWidth: lineWidthMesh 
        });
        
        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_FACE_OVAL, { 
          color: color, 
          lineWidth: lineWidthOval 
        });
        
        drawTechnicalGuides(canvasCtx, landmarks, currentStep.current, color);
      }
      canvasCtx.restore();
    } else {
      setIsInvalidPos(true);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (stepState === 3 || currentView === 'results') return;
    if (webcamRef.current?.video) {
      const { camera } = FaceDetection.init(webcamRef.current.video, canvasRef, onResults);
      cameraRef.current = camera;
    }
    return () => cameraRef.current?.stop();
  }, [stepState, currentView]);

  useEffect(() => {
    let interval;
    if (isScanning && stepState !== 3) {
      interval = setInterval(() => {
        const nextProgress = progressRef.current + 1;

        if (currentStep.current === 1 && nextProgress >= 80) {
          clearInterval(interval);
          setProgress(80);
          capturePhoto();
          return;
        }

        if (currentStep.current === 2 && nextProgress >= 100) {
          clearInterval(interval);
          setProgress(100);
          capturePhoto();
          return;
        }

        setProgress(nextProgress);
      }, 40);
    } else if (!isScanning && stepState !== 3) {
      clearInterval(interval);
      if (currentStep.current === 1) {
        setProgress(0);
      } else if (currentStep.current === 2) {
        setProgress(80);
      }
    }
    return () => clearInterval(interval);
  }, [isScanning, stepState]);

  if (currentView === 'results') {
    return (
      <ResultsScanner 
        analysisData={analysisData}
        photos={photos}
        onBack={() => setCurrentView('scanner')}
        onReset={resetScanner}
      />
    );
  }

  return (
    <ResponsiveScannerWrapper>
      {isPrinting && (
        <PrintingOverlay>
          <SpinnerRing />
          <div className="printing-text">GENERANDO ANÁLISIS...</div>
          <div className="sub-text">PROCESANDO DIAGNÓSTICO BIOMÉTRICO EN ARKANA AI</div>
        </PrintingOverlay>
      )}

      <PositionGuideHUD invalid={isInvalidPos} complete={isComplete}>
        {currentStep.current === 1 
          ? (isInvalidPos ? 'COLOCA TU ROSTRO DE FRENTE' : 'POSICIÓN FRONTAL CORRECTA') 
          : (isInvalidPos ? 'GIRA HACIA LA DERECHA (PERFIL)' : 'PERFIL DERECHO CORRECTO')
        }
      </PositionGuideHUD>

      <ResponsiveCameraChassis detected={!isInvalidPos}>
        <VideoWrapperRelative>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash ? 0.8 : 0, zIndex: 50, transition: 'opacity 0.2s', pointerEvents: 'none' }} />
          {isScanning && <ScanningLine />}
          <canvas 
            ref={canvasRef} 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              zIndex: 5, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              imageRendering: 'auto',
              WebkitFontSmoothing: 'antialiased'
            }} 
          />
          <Webcam ref={webcamRef} mirrored={true} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </VideoWrapperRelative>
      </ResponsiveCameraChassis>

      <ProgressBarHUD complete={isComplete}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <HUDIconSmall active={progress >= 20}><div className="icon-circle-mini">{progress >= 20 ? <IoCheckmark/> : <IoPersonCircleOutline/>}</div><span>Rostro</span></HUDIconSmall>
          <HUDIconSmall active={progress >= 40}><div className="icon-circle-mini">{progress >= 40 ? <IoCheckmark/> : <IoCutOutline/>}</div><span>Cabello</span></HUDIconSmall>
          <HUDIconSmall active={progress >= 60}><div className="icon-circle-mini">{progress >= 60 ? <IoCheckmark/> : <IoColorPaletteOutline/>}</div><span>Piel</span></HUDIconSmall>
          <HUDIconSmall active={progress >= 80}><div className="icon-circle-mini">{progress >= 80 ? <IoCheckmark/> : <IoSparklesOutline/>}</div><span>IA</span></HUDIconSmall>
          <HUDIconSmall active={progress >= 100}><div className="icon-circle-mini">{progress >= 100 ? <IoCheckmark/> : <IoBodyOutline/>}</div><span>Perfil</span></HUDIconSmall>
        </div>
        
        <div style={{ display: 'flex', gap: '3px', height: '5px' }}>
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                borderRadius: '1px', 
                background: progress > (i * 5) ? '#00f7ff' : 'rgba(255,255,255,0.08)', 
                boxShadow: progress > (i * 5) ? '0 0 6px #00f7ff' : 'none',
                transition: 'all 0.1s ease'
              }} 
            />
          ))}
        </div>
      </ProgressBarHUD>

      <FloatingFooterActionButton isComplete={isComplete} onClick={() => isComplete && triggerPrintingLayout()}>
        {isComplete ? 'VER INFORME GENERADO' : `ESCÁNER FASE ${currentStep.current}/2`}
      </FloatingFooterActionButton>
    </ResponsiveScannerWrapper>
  );
};

export default FaceScanner;