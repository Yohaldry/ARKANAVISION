// RaizAlgoritmica/FaceDetection.jsx
export const drawTechnicalGuides = (ctx, landmarks, step, color) => {
  const { width, height } = ctx.canvas;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.fillStyle = color;
  ctx.font = 'bold 12px Orbitron, monospace';

  const indices = { forehead: 10, brows: 168, nose: 1, chin: 152 };

  if (step === 1) {
    Object.keys(indices).forEach((key, i) => {
      const y = landmarks[indices[key]].y * height;
      ctx.beginPath(); 
      ctx.moveTo(-width, y); 
      ctx.lineTo(width, y); 
      ctx.stroke();

      let cmValue = i === 1 ? "5.2cm" : i === 2 ? "6.5cm" : i === 3 ? "7.1cm" : "";
      
      ctx.save();
      ctx.scale(-1, 1);
      ctx.fillText(`L${i+1}: ${key.toUpperCase()}`, -width + 20, y - 10);
      if (cmValue) {
        ctx.fillStyle = '#00f7ff';
        ctx.fillText(cmValue, -80, y - 10);
      }
      ctx.restore();
    });
  }
};

// RaizAlgoritmica/FaceDetection.jsx

// ... (mantén el resto igual)

const FaceDetection = {
  init: (videoElement, canvasRef, onResultsCallback) => {
    if (!window.FaceMesh || !videoElement) return null;

    const faceMesh = new window.FaceMesh({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results) => {
      onResultsCallback(results, canvasRef.current);
    });

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        // AJUSTE CLAVE: Sincronización absoluta con el tamaño visual
        if (videoElement.offsetWidth > 0 && canvasRef.current) {
          const width = videoElement.offsetWidth;
          const height = videoElement.offsetHeight;
          
          if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          }
        }
        await faceMesh.send({ image: videoElement });
      }
    });

    camera.start();
    return { camera, faceMesh };
  }
};

export default FaceDetection;