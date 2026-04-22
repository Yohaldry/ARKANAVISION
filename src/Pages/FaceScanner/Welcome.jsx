import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos el hook de navegación
import { motion, AnimatePresence } from 'framer-motion';
import welcomeAudioFile from '../../assets/AUDIO/WELCOME.mp3';
import { 
  WelcomeContainer, 
  LogoContainer, 
  LogoText,
  MainTitle, 
  StartButton,
  RobotFaceContainer, 
  FaceChassis, 
  FacePlate, 
  EyesRow, 
  CameraEye, 
  Lens, 
  MouthRing, 
  FooterInfo 
} from './UI/Welcome.styles';

const Welcome = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const navigate = useNavigate(); // Inicializamos la navegación
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  const handleStart = () => {
    setIsPlaying(true);
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.4;
    analyserRef.current = analyser;
    audioContextRef.current = ctx;

    audioRef.current.play();

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateMimic = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = (dataArray[5] + dataArray[10] + dataArray[15]) / 3;
      setVoiceLevel(average || 0);
      animationRef.current = requestAnimationFrame(updateMimic);
    };
    updateMimic();

    // --- REDIRECCIÓN AUTOMÁTICA AL TERMINAR ---
    audioRef.current.onended = () => {
      cancelAnimationFrame(animationRef.current);
      setTimeout(() => { 
        // Usamos el path exacto que tienes en tu App.js
        navigate('/biometricform'); 
      }, 800);
    };
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <WelcomeContainer>
      <audio ref={audioRef} src={welcomeAudioFile} />
      
      <LogoContainer>
        <img 
          src="https://res.cloudinary.com/dtkirmtfq/image/upload/q_auto/f_auto/v1772575819/ARKA/vmv69ssa1bkixfcyh0aw.png" 
          alt="Logo Arka" 
          style={{ width: '120px', marginBottom: '15px' }} 
        />
        <LogoText>
          <div className="brand">ARKA<span>SYSTEMS</span></div>
          <div className="slogan">Next-Gen Biometric Core</div>
        </LogoText>
      </LogoContainer>

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div 
            key="initial-ui"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ textAlign: 'center', zIndex: 10 }}
          >
            <MainTitle>BIOMETRIC <span>ANALYSIS</span></MainTitle>
            <StartButton onClick={handleStart}>INITIALIZE SYSTEM</StartButton>
          </motion.div>
        ) : (
          <motion.div
            key="robot-ui"
            initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <RobotFaceContainer>
              <FaceChassis><FacePlate /></FaceChassis>
              <EyesRow>
                <CameraEye><Lens /></CameraEye>
                <CameraEye><Lens /></CameraEye>
              </EyesRow>
              <MouthRing amplitude={voiceLevel} />
            </RobotFaceContainer>
          </motion.div>
        )}
      </AnimatePresence>

      <FooterInfo>ARKASYSTEMS v1.2 // LORDS BOGOTÁ DIV.</FooterInfo>
    </WelcomeContainer>
  );
};

export default Welcome;