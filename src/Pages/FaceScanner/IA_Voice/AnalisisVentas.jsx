import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import FaceScanner from '../FaceScanner';

// --- ANIMACIONES DE ALTO IMPACTO ---
const pulseGlow = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 247, 255, 0.2); }
  50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(0, 247, 255, 0.5); }
  100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 247, 255, 0.2); }
`;

const MainContainer = styled.div`
  background: #000; height: 100vh; width: 100vw; display: flex; 
  flex-direction: column; align-items: center; justify-content: center;
`;

const CoreAI = styled.div`
  width: 280px; height: 280px; border-radius: 50%;
  border: 1px solid #00f7ff; display: flex; align-items: center; justify-content: center;
  position: relative; animation: ${pulseGlow} 3s infinite ease-in-out;
  &::before {
    content: ''; position: absolute; inset: -10px; border: 1px dashed rgba(0, 247, 255, 0.3);
    border-radius: 50%; animation: rotate 20s linear infinite;
  }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const AnalisisVentas = () => {
  const [fase, setFase] = useState('INICIO'); // INICIO, DATOS, TEST, SCANNER
  const [isListening, setIsListening] = useState(false);
  const [userData, setUserData] = useState({ nombre: '', edad: '', frecuencia: '', temperamento: '' });
  const [puntosTemp, setPuntosTemp] = useState({ colerico: 0, sanguineo: 0, melancolico: 0 });

  const hablar = (texto, onEnd) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.onend = () => onEnd && onEnd();
    synth.speak(utterance);
  };

  const escuchar = (callback) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setIsListening(false);
      callback(transcript);
    };
    recognition.start();
  };

  const iniciarProtocolo = () => {
    setFase('DATOS');
    hablar("Bienvenido a Arkana Vision. Iniciando protocolo de consultoría. Dime tu nombre y apellido completo.");
  };

  // --- FLUJO DE PREGUNTAS ENRIQUECIDO ---
  useEffect(() => {
    if (fase === 'DATOS' && !userData.nombre) {
      escuchar((res) => {
        setUserData(prev => ({ ...prev, nombre: res }));
        hablar(`Entendido. ¿Qué edad tienes?`, () => {
          escuchar((edad) => {
            setUserData(prev => ({ ...prev, edad: edad }));
            hablar(`¿Cada cuánto tiempo sueles visitar la barbería?`, () => {
              escuchar((frec) => {
                setUserData(prev => ({ ...prev, frecuencia: frec }));
                iniciarTestTemperamento();
              });
            });
          });
        });
      });
    }
  }, [fase, userData]);

  const iniciarTestTemperamento = () => {
    setFase('TEST');
    // Pregunta 1: Ambición (Colérico vs Flemático)
    hablar("Para definir tu estilo, dime: ¿Prefieres que tu corte proyecte el éxito y mando de un líder, o la tranquilidad de un perfil relajado?");
  };

  const procesarRespuestaTemp = (texto, paso) => {
    // Lógica de puntuación interna
    let nuevosPuntos = { ...puntosTemp };
    if (texto.includes("líder") || texto.includes("éxito") || texto.includes("mando")) nuevosPuntos.colerico++;
    if (texto.includes("tendencia") || texto.includes("social") || texto.includes("llamar la atención")) nuevosPuntos.sanguineo++;
    if (texto.includes("perfección") || texto.includes("detalle") || texto.includes("clásico")) nuevosPuntos.melancolico++;
    setPuntosTemp(nuevosPuntos);

    if (paso === 1) {
      hablar("Interesante. ¿Eres de los que prefiere seguir las últimas tendencias para destacar en redes sociales o prefieres un estilo único que sea técnicamente perfecto?");
    } else {
      finalizarTest(nuevosPuntos);
    }
  };

  const finalizarTest = (puntos) => {
    let finalTemp = "Flematico";
    if (puntos.colerico >= puntos.sanguineo && puntos.colerico >= puntos.melancolico) finalTemp = "Colerico";
    else if (puntos.sanguineo >= puntos.melancolico) finalTemp = "Sanguineo";
    else if (puntos.melancolico > 0) finalTemp = "Melancolico";

    setUserData(prev => ({ ...prev, temperamento: finalTemp }));
    hablar(`Análisis psicográfico completado. Perfil ${finalTemp} detectado. Iniciando scanner biométrico.`);
    setTimeout(() => setFase('SCANNER'), 3000);
  };

  return (
    <MainContainer>
      {fase !== 'SCANNER' && (
        <>
          <CoreAI>
            <div style={{ color: '#00f7ff', fontSize: '20px', textAlign: 'center' }}>
              {isListening ? "ESCUCHANDO..." : "ARKANA AI"}
            </div>
          </CoreAI>
          <div style={{ marginTop: '30px', color: '#fff', textAlign: 'center', opacity: 0.6 }}>
            {userData.nombre && <p>IDENTIFICADO: {userData.nombre.toUpperCase()}</p>}
            {fase === 'INICIO' && <button onClick={iniciarProtocolo}>ACTIVAR SISTEMA</button>}
          </div>
        </>
      )}
      {fase === 'SCANNER' && <FaceScanner personalData={userData} />}
    </MainContainer>
  );
};

export default AnalisisVentas;