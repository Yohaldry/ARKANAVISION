import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import formAudioFile from '../../assets/AUDIO/Form/audio1.mp3';
import { 
  FormPageWrapper, FormCard, QuestionTitle, StyledInput, 
  NavButtons, ActionButton, StepIndicator,
  ExternalHeader, RobotSupervisorHUD, MiniFaceChassis, 
  MiniFacePlate, MiniEyesRow, MiniCameraEye, MiniLens, MiniMouthRing
} from './UI/Biometricform.styles';

const QUESTIONS = [
  { id: 'nombre', label: 'Nombre y Apellido', placeholder: 'Ingrese identidad...', type: 'text' },
  { id: 'edad', label: 'Edad Cronológica', placeholder: '00', type: 'number' },
  { id: 'ocupacion', label: 'Actividad Profesional', placeholder: 'Ej: Desarrollador...', type: 'text' },
  { id: 'tipoCraneo', label: 'Morfología Craneal', placeholder: 'Ej: Mesocéfalo...', type: 'text' },
  { id: 'email', label: 'Enlace de Red (Email)', placeholder: 'usuario@arka.com', type: 'email' },
  { id: 'telefono', label: 'Canal de Contacto (Tel)', placeholder: '+57...', type: 'tel' }
];

const Biometricform = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const navigate = useNavigate();
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  // PROTOCOLO ARKA: CARGA Y REPRODUCCIÓN POR BUFFER
  const startArkaProtocol = async (e) => {
    // Evita que el evento "atraviese" la capa y toque el fondo (previene doble audio)
    if (e) e.stopPropagation();

    // BLOQUEO CRÍTICO: Si ya existe un contexto o el audio está sonando, abortar
    if (audioContextRef.current || isSpeaking || hasStarted) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // 1. Cargar el archivo como datos binarios
      const response = await fetch(formAudioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // 2. Configurar Analizador
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      // 3. Configurar Fuente
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      sourceRef.current = source;

      // 4. Conectar: Fuente -> Analizador -> Altavoces
      source.connect(analyser);
      analyser.connect(ctx.destination);

      // 5. Iniciar
      source.start(0);
      setIsSpeaking(true);
      setHasStarted(true);

      // 6. Loop de mímica
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current || !sourceRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        // Promedio de frecuencias para la boca
        const volume = (dataArray[5] + dataArray[10] + dataArray[15]) / 3;
        setVoiceLevel(volume);
        animationRef.current = requestAnimationFrame(update);
      };
      update();

      source.onended = () => {
        setIsSpeaking(false);
        setVoiceLevel(0);
        cancelAnimationFrame(animationRef.current);
      };

    } catch (err) {
      console.error("Error en el sistema de audio:", err);
      // Si falla, permitimos reintentar reseteando el contexto
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      // Limpieza total al desmontar el componente
      if (sourceRef.current) try { sourceRef.current.stop(); } catch(e){}
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/FaceScanner');
    }
  };

  return (
    // onClick aquí es el respaldo por si el usuario no toca la capa de inicio
    <FormPageWrapper onClick={startArkaProtocol}>
      
      {/* CAPA DE INICIO (Solo aparece una vez) */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={startArkaProtocol} 
            onTouchStart={startArkaProtocol}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              zIndex: 999, background: 'rgba(0,0,0,0.9)', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(8px)'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], borderColor: ['#00f3ff', '#0055ff', '#00f3ff'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ 
                width: '100px', height: '100px', border: '2px solid #00f3ff', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)'
              }}
            >
              <div style={{ color: '#00f3ff', fontSize: '28px', fontWeight: 'bold' }}>タップ</div>
            </motion.div>
            <p style={{ color: '#00f3ff', marginTop: '25px', letterSpacing: '4px', fontSize: '11px', fontWeight: '300' }}>
              INICIAR SISTEMA ARKA
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ExternalHeader>
        <img 
          src="https://res.cloudinary.com/dtkirmtfq/image/upload/q_auto/f_auto/v1772575819/ARKA/vmv69ssa1bkixfcyh0aw.png" 
          alt="Logo Arka" 
          style={{ width: '120px', height: '120px' }} 
        />
        <RobotSupervisorHUD>
          <MiniFaceChassis><MiniFacePlate /></MiniFaceChassis>
          <MiniEyesRow>
            <MiniCameraEye><MiniLens /></MiniCameraEye>
            <MiniCameraEye><MiniLens /></MiniCameraEye>
          </MiniEyesRow>
          {/* El robot recibe la amplitud del audio en tiempo real */}
          <MiniMouthRing speaking={isSpeaking} amplitude={voiceLevel} />
        </RobotSupervisorHUD>
      </ExternalHeader>

      <AnimatePresence mode="wait">
        <FormCard
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onClick={(e) => e.stopPropagation()} // Evita que tocar el form reinicie el audio
        >
          <StepIndicator>DATA_SCAN // 0{currentStep + 1}</StepIndicator>
          <QuestionTitle><span>ANALYZING:</span> <br/>{QUESTIONS[currentStep].label}</QuestionTitle>
          <StyledInput 
            autoFocus
            type={QUESTIONS[currentStep].type}
            placeholder={QUESTIONS[currentStep].placeholder}
            value={formData[QUESTIONS[currentStep].id] || ''}
            onChange={(e) => setFormData({...formData, [QUESTIONS[currentStep].id]: e.target.value})}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
          />
          <NavButtons>
            {currentStep > 0 && <ActionButton onClick={() => setCurrentStep(currentStep - 1)}>Back</ActionButton>}
            <ActionButton primary onClick={handleNext} disabled={!formData[QUESTIONS[currentStep].id]}>
              {currentStep === QUESTIONS.length - 1 ? 'Finalize' : 'Confirm'}
            </ActionButton>
          </NavButtons>
        </FormCard>
      </AnimatePresence>
    </FormPageWrapper>
  );
};

export default Biometricform;