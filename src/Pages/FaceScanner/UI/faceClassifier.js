// Índices clave de MediaPipe Facemesh
const POINTS = {
  TOP: 10,         // Parte superior de la frente
  BOTTOM: 152,     // Mentón
  LEFT_CHEEK: 234, // Pómulo izquierdo
  RIGHT_CHEEK: 454,// Pómulo derecho
  LEFT_JAW: 58,    // Mandíbula izquierda
  RIGHT_JAW: 288   // Mandíbula derecha
};

export const classifyFace = (landmarks) => {
  if (!landmarks) return "Analizando...";

  // 1. Calcular distancias (usamos Pitágoras para precisión)
  const getDistance = (p1, p2) => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    );
  };

  const faceHeight = getDistance(landmarks[POINTS.TOP], landmarks[POINTS.BOTTOM]);
  const faceWidth = getDistance(landmarks[POINTS.LEFT_CHEEK], landmarks[POINTS.RIGHT_CHEEK]);
  const jawWidth = getDistance(landmarks[POINTS.LEFT_JAW], landmarks[POINTS.RIGHT_JAW]);

  // 2. Lógica de Ratios
  const ratioHeightWidth = faceHeight / faceWidth;

  // 3. Clasificación básica
  if (ratioHeightWidth > 1.25) return "ALARGADO / OVALADO";
  if (ratioHeightWidth < 1.1) return "REDONDO";
  if (jawWidth > faceWidth * 0.85) return "CUADRADO";
  
  return "DIAMANTE / OVALADO";
};