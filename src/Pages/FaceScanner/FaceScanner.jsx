import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { 
  ScannerContainer, DataSidebar, CameraChassis, 
  VideoContainer, CanvasOverlay, ActionButton 
} from './FaceScanner.styles';

import FaceDetection from './RaizAlgoritmica/FaceDetection';
import SkinAnalysis from './RaizAlgoritmica/SkinAnalysis';
import Recommendations from './RaizAlgoritmica/Recommendations';
import { runProfessionalAnalysis } from './RaizAlgoritmica/dossierAlgorithm';

import { 
  IoShieldCheckmarkSharp, 
  IoPersonOutline,
  IoWalkOutline,
  IoWarningOutline
} from "react-icons/io5";

const FaceScanner = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessing = useRef(false);
  const currentStep = useRef(1);
  const cameraRef = useRef(null); 

  const [stepState, setStepState] = useState(1);
  const [countdown, setCountdown] = useState(null);
  const [photos, setPhotos] = useState({ front: null, profile: null });
  const [flash, setFlash] = useState(false);
  const [msg, setMsg] = useState("BUSCANDO ROSTRO...");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState(null);
  const [isInvalidPos, setIsInvalidPos] = useState(false);

  const analysisResult = runProfessionalAnalysis(photos);
  const isComplete = msg === "ANÁLISIS COMPLETO";
  const isMobile = window.innerWidth <= 768;

  // Inyectamos los Keyframes para el parpadeo intermitente
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes blink-glow {
        0% { opacity: 1; box-shadow: 0 0 5px rgba(0, 247, 255, 0.2); }
        50% { opacity: 0.7; box-shadow: 0 0 20px rgba(0, 247, 255, 0.6); }
        100% { opacity: 1; box-shadow: 0 0 5px rgba(0, 247, 255, 0.2); }
      }
      .lords-status-bar {
        animation: blink-glow 2s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const resetScanner = () => {
    currentStep.current = 1;
    isProcessing.current = false;
    setStepState(1);
    setCountdown(null);
    setPhotos({ front: null, profile: null });
    setMsg("BUSCANDO ROSTRO...");
    setIsPanelOpen(false);
    if (cameraRef.current) cameraRef.current.start();
    speak("Reiniciando sistema biométrico");
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-MX';
    u.rate = 1.1;
    window.speechSynthesis.speak(u);
  };

  const captureHighQualityCrop = () => {
    if (!webcamRef.current?.video || !canvasRef.current) return null;
    const video = webcamRef.current.video;
    const canvasOverlay = canvasRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;
    const sourceSize = video.videoHeight;
    const sourceX = (video.videoWidth - sourceSize) / 2;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sourceX, 0, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasOverlay, sourceX, 0, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    return canvas.toDataURL('image/webp', 0.95);
  };

  const takePhoto = () => {
    const croppedImage = captureHighQualityCrop();
    setFlash(true);
    speak("Capturado");
    setTimeout(() => setFlash(false), 300);

    if (currentStep.current === 1) {
      setPhotos(prev => ({ ...prev, front: croppedImage }));
      setMsg("FRONTAL REGISTRADA");
      currentStep.current = 2;
      setTimeout(() => {
        setStepState(2);
        isProcessing.current = false;
        setCountdown(null);
        setMsg("AHORA: DE PERFIL");
        speak("Gire de perfil a la derecha");
      }, 2000);
    } else {
      setPhotos(prev => ({ ...prev, profile: croppedImage }));
      currentStep.current = 3;
      setStepState(3);
      setMsg("ANÁLISIS COMPLETO");
      speak("Proceso finalizado");
      if (cameraRef.current) cameraRef.current.stop();
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        speak(countdown.toString());
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      takePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  const onResults = (results) => {
    if (!results.image || !canvasRef.current || isComplete) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = results.image.width;
    canvasRef.current.height = results.image.height;
    
    ctx.save();
    ctx.translate(canvasRef.current.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      setCurrentLandmarks(landmarks);

      const nose = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      
      let isValidPosition = false;

      if (currentStep.current === 1) {
        const isCentered = nose.x > 0.35 && nose.x < 0.65;
        const isTilted = Math.abs(leftEye.y - rightEye.y) > 0.05;
        const ratio = Math.abs(nose.x - leftEye.x) / Math.abs(nose.x - rightEye.x);
        isValidPosition = isCentered && !isTilted && (ratio > 0.7 && ratio < 1.4);
      } else if (currentStep.current === 2) {
        const ratio = Math.abs(nose.x - leftEye.x) / Math.abs(nose.x - rightEye.x);
        const isProfileRight = ratio < 0.22; 
        const isLevel = Math.abs(leftEye.y - rightEye.y) < 0.12; 
        isValidPosition = isProfileRight && isLevel;
      }

      setIsInvalidPos(!isValidPosition);

      const meshColor = isValidPosition ? '#00f7ff' : '#ff0000';
      const meshOpacity = isValidPosition ? 'rgba(0, 247, 255, 0.2)' : 'rgba(255, 0, 0, 0.4)';

      if (window.drawConnectors) {
        window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, { color: meshOpacity, lineWidth: 0.5 });
        window.drawConnectors(ctx, landmarks, window.FACEMESH_FACE_OVAL, { color: meshColor, lineWidth: 1.5 });
        window.drawConnectors(ctx, landmarks, window.FACEMESH_LIPS, { color: meshColor, lineWidth: 2.5 });
      }

      if (isValidPosition && !isProcessing.current && currentStep.current < 3) {
        isProcessing.current = true;
        setCountdown(3); 
      } 
      
      if (!isValidPosition) {
        isProcessing.current = false;
        setCountdown(null);
      }
    } else {
      setIsInvalidPos(false);
      setCountdown(null);
      isProcessing.current = false;
    }
    ctx.restore();
  }; 

  useEffect(() => {
    let camera = null;
    const init = async () => {
      if (window.FaceMesh && window.Camera && webcamRef.current) {
        const faceMesh = new window.FaceMesh({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.6 });
        faceMesh.onResults(onResults);
        
        camera = new window.Camera(webcamRef.current.video, {
          onFrame: async () => { 
            if (webcamRef.current?.video) {
              await faceMesh.send({ image: webcamRef.current.video }); 
            }
          },
          width: 1280, height: 720
        });
        cameraRef.current = camera; 
        camera.start();
      }
    };
    init();
    return () => {
      if (camera) camera.stop();
      cameraRef.current = null;
    };
  }, [stepState]);

  return (
    <ScannerContainer>
      <div style={{ position: 'fixed', inset: 0, zIndex: 4000, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#00f7ff', opacity: flash ? 0.8 : 0, transition: 'opacity 0.2s' }} />

        {isInvalidPos && !isComplete && (
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(220, 0, 0, 0.9)', color: '#fff', padding: '25px 60px', 
            border: '2px solid #fff', borderRadius: '4px', textAlign: 'center',
            boxShadow: '0 0 60px rgba(255,0,0,0.6)'
          }}>
            <IoWarningOutline fontSize="50px" style={{ marginBottom: '10px' }} />
            <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '4px', fontWeight: 'bold' }}>MEJORAR POSTURA</h2>
            <span style={{ fontSize: '10px', opacity: 0.8, marginTop: '5px', letterSpacing: '2px' }}>SISTEMA BIOMÉTRICO LORDS</span>
          </div>
        )}

        {!isInvalidPos && countdown !== null && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <h1 style={{ color: '#00f7ff', fontSize: '180px', margin: 0, fontWeight: '900', textShadow: '0 0 50px rgba(0, 247, 255, 0.8)' }}>
              {countdown}
            </h1>
          </div>
        )}
      </div>

      {/* BARRA SUPERIOR CON CLASE DE ANIMACIÓN INTERMITENTE */}
      <div style={{ position: 'absolute', top: '30px', width: '100%', textAlign: 'center', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
        <div className="lords-status-bar" style={{ 
          background: 'rgba(0,0,0,0.85)', 
          border: `1px solid ${isComplete ? '#00ff44' : '#00f7ff'}`, 
          padding: '12px 35px', 
          borderRadius: '2px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <IoShieldCheckmarkSharp style={{ color: isComplete ? '#00ff44' : '#00f7ff' }} />
          <p style={{ color: '#fff', fontSize: '12px', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>{msg}</p>
        </div>
      </div>

      <ActionButton isComplete={stepState === 3} onClick={() => stepState === 3 && setIsPanelOpen(true)}>
        {stepState === 3 ? "ABRIR DOSSIER ARKA" : "SISTEMA BIOMÉTRICO"}
      </ActionButton>

      <DataSidebar isOpen={isPanelOpen}>
        <FaceDetection photos={photos} onReset={resetScanner} landmarks={currentLandmarks} />
      </DataSidebar>

      <CameraChassis detected={true}>
        <VideoContainer detected={true}>
          {isComplete && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0, 20, 10, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                <IoShieldCheckmarkSharp style={{ color: '#00ff44', fontSize: '60px', marginBottom: '20px' }} />
                <button onClick={resetScanner} style={{ background: 'transparent', border: '1px solid #00ff44', color: '#00ff44', padding: '15px 30px', cursor: 'pointer', fontWeight: 'bold' }}>REINICIAR</button>
            </div>
          )}
          <CanvasOverlay ref={canvasRef} style={{ zIndex: 2 }} />
          <Webcam ref={webcamRef} mirrored={true} screenshotFormat="image/webp" style={{ opacity: isComplete ? 0 : 1, width: '100%', height: '100%', objectFit: 'cover' }} />
        </VideoContainer>
      </CameraChassis>

      {!isComplete && (
        <div style={{ position: 'absolute', zIndex: 1000, display: 'flex', bottom: isMobile ? '120px' : 'auto', right: '30px', top: isMobile ? 'auto' : '50%', transform: isMobile ? 'none' : 'translateY(-50%)', flexDirection: isMobile ? 'row' : 'column', gap: '25px' }}>
          <div style={{ opacity: currentStep.current === 1 ? 1 : 0.7, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${photos.front ? '#00ff44' : '#00f7ff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 15, 25, 0.8)' }}>
               <IoPersonOutline style={{ color: photos.front ? '#00ff44' : '#00f7ff', fontSize: '24px' }} />
             </div>
             <span style={{ color: '#fff', fontSize: '9px', marginTop: '5px' }}>FRONTAL</span>
          </div>
          <div style={{ opacity: currentStep.current === 2 ? 1 : 0.7, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${photos.profile ? '#00ff44' : '#00f7ff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 15, 25, 0.8)' }}>
               <IoWalkOutline style={{ color: photos.profile ? '#00ff44' : '#00f7ff', fontSize: '24px' }} />
             </div>
             <span style={{ color: '#fff', fontSize: '9px', marginTop: '5px' }}>PERFIL</span>
          </div>
        </div>
      )}
    </ScannerContainer>
  );
};

export default FaceScanner;