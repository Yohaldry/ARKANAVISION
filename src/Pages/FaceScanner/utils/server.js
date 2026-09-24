import express from 'express';
import { OpenAI } from 'openai';
import cors from 'cors';
import 'dotenv/config'; // Asegúrate de tener "dotenv" instalado en tu package.json

const app = express();
app.use(express.json());
app.use(cors()); 

// Inicializamos OpenAI leyendo la variable de entorno de forma segura
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

app.post('/api/arkana-scanner-ai', async (req, res) => {
  const { faceShape, symmetry, profileType, hairType, skinType } = req.body;

  // Validación rápida de seguridad
  if (!faceShape || !profileType || !hairType || !skinType) {
    return res.status(400).json({ error: "Faltan variables biométricas críticas." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Excelente elección por velocidad/costo
      response_format: { type: "json_object" }, 
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Eres el núcleo de Inteligencia Artificial de "ARKANA", un software premium de consultoría de imagen, visajismo avanzado, barbería e ingeniería dermatológica capilar.
          
          Tu tarea es recibir las métricas de un escaneo facial computarizado y generar un diagnóstico hiper-personalizado. Debes responder ESTRICTAMENTE con un objeto JSON plano que contenga exactamente estas cuatro llaves (no agregues texto fuera del JSON):
          
          {
            "haircut": "Nombre del corte recomendado en negrita, seguido de una explicación técnica detallada de por qué favorece su morfología facial y tipo de hebra. Habla de ejes visuales, volúmenes temporales y control de textura.",
            "beard": "Recomendación geométrica nítida para el diseño de barba, candado o afeitado completo que equilibre su perfil.",
            "skincare": "Nombre del protocolo de limpieza facial profunda ideal en la barbería para su tipo de piel, explicando los activos recomendados (ej. carbón activado, ácido salicílico, vapor de ozono).",
            "routine": "Tres pasos secuenciales, directos y profesionales para que el cliente mantenga su piel y cabello óptimos en casa."
          }

          Usa un tono corporativo, futurista, premium y de alta autoridad técnica.`
        },
        {
          role: "user",
          content: `Métricas del escaneo biométrico del cliente actual:
          - Morfología Facial: ${faceShape}
          - Índice de Simetría Craneal: ${symmetry}%
          - Angulación de Perfil: ${profileType}
          - Tipo de Hebra / Cabello: ${hairType}
          - Diagnóstico de Piel (Dermis): ${skinType}`
        }
      ]
    });

    const jsonString = response.choices[0].message.content;
    const cleanJson = JSON.parse(jsonString);

    return res.json(cleanJson);

  } catch (error) {
    console.error("Error en el puente de Arkana AI:", error);
    return res.status(500).json({ error: "Error en los sistemas de cómputo en la nube de Arkana." });
  }
});

// Cambiado a 3001 para que coincida exactamente con lo que pide tu ResultsScanner
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => console.log(`🚀 Motor Arkana AI corriendo en el puerto ${PORT}`));