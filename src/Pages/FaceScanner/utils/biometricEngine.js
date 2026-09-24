export const distance = (p1, p2) => {

  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2)
  );
};

/* =========================
   FACE SHAPE
========================= */

export const calculateFaceShape = (landmarks) => {

  const foreheadWidth =
    distance(landmarks[103], landmarks[332]);

  const cheekboneWidth =
    distance(landmarks[234], landmarks[454]);

  const jawWidth =
    distance(landmarks[172], landmarks[397]);

  const faceHeight =
    distance(landmarks[10], landmarks[152]);

  const heightRatio =
    faceHeight / cheekboneWidth;

  if (
    heightRatio > 1.5 &&
    jawWidth < cheekboneWidth * 0.85
  ) {
    return 'Ovalado';
  }

  if (
    Math.abs(faceHeight - cheekboneWidth) < 0.08
  ) {
    return 'Redondo';
  }

  if (
    jawWidth > cheekboneWidth * 0.95
  ) {
    return 'Cuadrado';
  }

  if (
    cheekboneWidth > foreheadWidth &&
    cheekboneWidth > jawWidth
  ) {
    return 'Diamante';
  }

  return 'Rectangular';
};

/* =========================
   SYMMETRY
========================= */

export const calculateSymmetry = (landmarks) => {

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];

  const leftJaw = landmarks[172];
  const rightJaw = landmarks[397];

  const eyeDiff =
    Math.abs(leftEye.y - rightEye.y);

  const jawDiff =
    Math.abs(leftJaw.y - rightJaw.y);

  const totalAsymmetry =
    (eyeDiff + jawDiff) * 100;

  let symmetry =
    100 - totalAsymmetry;

  symmetry = Math.max(
    70,
    Math.min(99, symmetry)
  );

  return symmetry.toFixed(1);
};

/* =========================
   PROFILE
========================= */

export const calculateProfileType = (
  landmarks
) => {

  const nose = landmarks[1];
  const chin = landmarks[152];

  const noseProjection = nose.z;
  const chinProjection = chin.z;

  if (
    noseProjection <
    chinProjection - 0.03
  ) {
    return 'Perfil Convexo';
  }

  if (
    chinProjection <
    noseProjection - 0.03
  ) {
    return 'Perfil Cóncavo';
  }

  return 'Perfil Recto';
};

/* =========================
   SKIN ANALYSIS
========================= */

export const detectSkinCondition = (
  videoElement
) => {

  if (!videoElement) {

    return {
      skinType: 'Normal',
      recommendation:
        'No fue posible analizar la piel.'
    };
  }

  const canvas =
    document.createElement('canvas');

  canvas.width = 300;
  canvas.height = 300;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    videoElement,
    0,
    0,
    300,
    300
  );

  const imageData =
    ctx.getImageData(0, 0, 300, 300);

  const pixels = imageData.data;

  let brightness = 0;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    brightness +=
      (
        pixels[i] +
        pixels[i + 1] +
        pixels[i + 2]
      ) / 3;
  }

  brightness =
    brightness / (pixels.length / 4);

  if (brightness > 145) {

    return {
      skinType: 'Grasa',
      recommendation:
        'Se detectó acumulación sebácea y brillo elevado. Recomendamos limpieza facial profunda premium.'
    };
  }

  if (brightness < 95) {

    return {
      skinType: 'Seca',
      recommendation:
        'Se detectó baja hidratación superficial. Recomendamos hidratación facial revitalizante.'
    };
  }

  return {
    skinType: 'Mixta',
    recommendation:
      'La piel presenta comportamiento mixto. Recomendamos mantenimiento facial preventivo.'
  };
};

/* =========================
   HAIR TYPE
========================= */

export const generateHairType = (
  landmarks
) => {

  const faceHeight =
    distance(
      landmarks[10],
      landmarks[152]
    );

  if (faceHeight > 0.42) {
    return '3B';
  }

  return '2C';
};

/* =========================
   RECOMMENDATIONS
========================= */

export const generateRecommendations = ({
  faceShape,
  skinType,
  profileType,
  hairType
}) => {

  const recommendations = [];

  if (skinType === 'Grasa') {

    recommendations.push(
      'Limpieza facial profunda'
    );
  }

  if (faceShape === 'Redondo') {

    recommendations.push(
      'Fade alto con volumen superior'
    );
  }

  if (faceShape === 'Cuadrado') {

    recommendations.push(
      'Texturizado lateral premium'
    );
  }

  if (hairType === '3B') {

    recommendations.push(
      'Definición profesional de rizos'
    );
  }

  if (
    profileType === 'Perfil Convexo'
  ) {

    recommendations.push(
      'Perfilado de barba estructural'
    );
  }

  return recommendations;
};

/* =========================
   BEAUTY SCORE
========================= */

export const calculateBeautyScore = ({
  symmetry,
  faceShape
}) => {

  let score = Number(symmetry);

  if (faceShape === 'Ovalado') {
    score += 4;
  }

  if (faceShape === 'Diamante') {
    score += 2;
  }

  return Math.min(99, score);
};