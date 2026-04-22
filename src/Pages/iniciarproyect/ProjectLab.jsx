import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, Layers, Globe, Palette, Settings, 
  ChevronLeft, MessageSquare, ShoppingCart, Zap, ShieldCheck, Search, 
  Users, Image as ImageIcon, CheckCircle2, Loader2,
  User, Mail, Phone, Building2, Download, FileText,
  Clock, Heart, Camera, UserCheck, Paintbrush, XCircle, Calendar,
  Code, Megaphone, PenTool, Layout, Monitor, BarChart3, Coffee, Home, Plus, Send,
  ArrowRight
} from 'lucide-react';

const JSPDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const EMAILJS_URL = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";

const ProjectLab = () => {
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_1060je5", 
    TEMPLATE_ID: "template_arka",   
    PUBLIC_KEY: "gJ7hwekEH8jm6kLye" 
  };

  const robotImageUrl = 'https://res.cloudinary.com/dtkirmtfq/image/upload/v1772999626/ARKA/cgqnyjdxd2poi0nlfd1g.png';

  const questions = [
    { id: 'firstName', label: "¿Cuál es tu nombre?", placeholder: "Escribe tu nombre...", icon: User, type: 'text', botTip: "¡Mucho gusto! Empecemos por lo básico." },
    { id: 'lastName', label: "¿Y tu apellido?", placeholder: "Escribe tu apellido...", icon: User, type: 'text', botTip: "Excelente. Un nombre completo genera más confianza." },
    { id: 'email', label: "¿Tu correo electrónico?", placeholder: "ejemplo@correo.com", icon: Mail, type: 'email', botTip: "Aquí te enviaremos la propuesta técnica de tu proyecto." },
    { id: 'phone', label: "¿Un número de contacto?", placeholder: "+1 234 567 890", icon: Phone, type: 'tel', botTip: "Prometo no hacer spam, solo para coordinar detalles." },
    { id: 'userRole', label: "¿Cuál es tu rol en este proyecto?", placeholder: "Ej: Fundador, Director de Marketing...", icon: UserCheck, type: 'text', botTip: "Saber tu cargo nos ayuda a personalizar la comunicación." },
    { id: 'businessName', label: "¿Cómo se llama tu empresa o marca?", placeholder: "Nombre de tu imperio...", icon: Building2, type: 'text', botTip: "¡Un nombre poderoso es el 50% del éxito!" },
    { id: 'niche', label: "¿En qué sector dominas?", placeholder: "Ej: Arquitectura de Lujo, Gaming...", icon: Layers, type: 'text', botTip: "Sé específico para que el diseño sea quirúrgico." },
    { id: 'servicesSummary', label: "¿Qué servicios ofreces al mundo?", icon: Briefcase, type: 'services-checklist', botTip: "Marca todos los que apliquen. Esto define la estructura de navegación." },
    { id: 'location', label: "¿Desde dónde operas?", icon: Globe, type: 'location', botTip: "Configuramos mapas y moneda local según tu sede." },
    { id: 'timeEstimate', label: "¿Tiempo estimado para terminarlo?", icon: Clock, type: 'time-options', botTip: "El tiempo es oro, ajustaremos motores según tu fecha." },
    { id: 'components', label: "¿Qué armas necesitas?", icon: Settings, type: 'checklist', botTip: "Te recomiendo WhatsApp e IA para empezar fuerte." },
    { id: 'colorPalettes', label: "¿Paleta de colores?", icon: Paintbrush, type: 'color-checklist', botTip: "Los colores transmiten emociones, elige los que mejor representen tu marca." },
    { id: 'audiovisualReq', label: "¿Requieres servicios Audiovisuales?", icon: Camera, type: 'boolean', botTip: "Un buen contenido visual eleva el proyecto a otro nivel." },
    { id: 'description', label: "¿Cuál es el ADN visual?", placeholder: "Describe la vibra: minimalista, dark...", icon: Heart, type: 'textarea', botTip: "Imagina que me describes el local de tus sueños." }
  ];

  const serviceOptions = [
    { id: 'arch', label: 'Arquitectura & Diseño', icon: Home },
    { id: 'web', label: 'Desarrollo Web', icon: Code },
    { id: 'branding', label: 'Branding & Identidad', icon: PenTool },
    { id: 'marketing', label: 'Marketing Digital', icon: Megaphone },
    { id: 'consulting', label: 'Consultoría / Mentoria', icon: Users },
    { id: 'interior', label: 'Diseño de Interiores', icon: Layout },
    { id: 'ecommerce', label: 'E-commerce / Ventas', icon: ShoppingCart },
    { id: 'content', label: 'Creador de Contenido', icon: ImageIcon },
    { id: 'events', label: 'Eventos / Workshop', icon: Calendar },
    { id: 'it', label: 'Servicios IT / Software', icon: Monitor },
    { id: 'finance', label: 'Finanzas / Inversión', icon: BarChart3 },
    { id: 'gastronomy', label: 'Gastronomía / Horeca', icon: Coffee },
    { id: 'other', label: 'OTRO / PERSONALIZADO', icon: Plus }
  ];

  const timeOptions = [
    { id: '20-days', label: '20 Días', sub: 'Modo Sprint' },
    { id: '1-month', label: '1 Mes', sub: 'Estándar Arka' },
    { id: '2-months', label: '2 Meses', sub: 'Desarrollo Integral' },
    { id: '3-months', label: '3 Meses', sub: 'Proyecto Robusto' },
    { id: '6-months', label: '6 Meses', sub: 'Escalabilidad Total' },
    { id: 'custom', label: '+6 Meses', sub: 'Ecosistema Completo' }
  ];

  const componentOptions = [
    { id: 'whatsapp', label: 'Botón WhatsApp', icon: MessageSquare },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'ia', label: 'Agente IA', icon: Zap },
    { id: 'security', label: 'SSL', icon: ShieldCheck },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'crm', label: 'Leads', icon: Users },
    { id: 'gallery', label: 'Galería', icon: ImageIcon }
  ];

  const colorPaletteOptions = [
    { id: 'minimal', label: 'Minimalista', colors: ['#FFFFFF', '#F3F4F6', '#1F2937'], description: 'Blanco, Gris y Negro' },
    { id: 'corporate', label: 'Corporativo', colors: ['#1E3A8A', '#3B82F6', '#DBEAFE'], description: 'Azul Navy y Profesional' },
    { id: 'luxury', label: 'Lujo', colors: ['#000000', '#B4975A', '#1A1A1A'], description: 'Negro y Dorado' },
    { id: 'nature', label: 'Naturaleza', colors: ['#064E3B', '#10B981', '#ECFDF5'], description: 'Verdes Esmeralda' },
    { id: 'vibrant', label: 'Vibrante', colors: ['#7C3AED', '#EC4899', '#FDE68A'], description: 'Púrpura y Rosa' },
    { id: 'cyber', label: 'Cyberpunk', colors: ['#0F172A', '#22D3EE', '#F0ABFC'], description: 'Neon y Oscuro' }
  ];

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userRole: '',
    businessName: '',
    niche: '',
    selectedServices: [],
    customService: '',
    country: '',
    city: '',
    timeEstimate: '',
    description: '',
    selectedPalettes: [],
    audiovisualReq: null, 
    selectedComponents: [],
    accentColor: '#3b82f6',
  };

  const [step, setStep] = useState(1); 
  const [formSubStep, setFormSubStep] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState('idle'); 
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  
  const inputRef = useRef(null);
  const currentQuestion = questions[formSubStep];

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formSubStep, step]);

  const resetToHome = () => {
    setStep(1);
    setFormSubStep(0);
    setActionStatus('idle');
    setFormData(initialFormData);
    setShowSuccessModal(false);
  };

  const handleNext = () => {
    const currentVal = formData[currentQuestion.id];
    if (['text', 'email', 'tel', 'textarea'].includes(currentQuestion.type)) {
      if (!currentVal || currentVal.toString().trim() === '') return;
    }
    if (formSubStep < questions.length - 1) {
      setFormSubStep(prev => prev + 1);
    } else {
      setStep(2);
      setIsProcessing(true);
      setTimeout(() => { 
        setIsProcessing(false); 
        setStep(3); 
      }, 3500); 
    }
  };

  const handleBack = () => {
    if (formSubStep > 0) setFormSubStep(prev => prev - 1);
  };

  // Función de carga de scripts corregida
  const loadScripts = async () => {
    const scripts = [
      { id: 'jspdf-script', url: JSPDF_URL },
      { id: 'emailjs-script', url: EMAILJS_URL }
    ];
    
    for (const script of scripts) {
      if (!document.getElementById(script.id)) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.id = script.id;
          s.src = script.url;
          s.async = true;
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s); // Usar document.body para evitar errores de inserción
        });
      }
    }
  };

  const handleFinalAction = async () => {
    if (actionStatus !== 'idle') return;
    setActionStatus('generating');
    
    try {
      await loadScripts();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Fondo y Estilo
      doc.setFillColor(5, 9, 20);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text("ARKA PROJECT LAB", 20, 30);
      doc.setFontSize(10);
      doc.text("MANIFIESTO TÉCNICO DE INGENIERÍA DIGITAL", 20, 38);
      
      let yPos = 60;
      const sectionSpacing = 15;

      const drawSectionTitle = (title) => {
        doc.setTextColor(59, 130, 246);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, 20, yPos);
        yPos += 8;
        doc.setDrawColor(59, 130, 246);
        doc.line(20, yPos - 2, 190, yPos - 2);
        yPos += 5;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
      };

      const addField = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 20, yPos);
        doc.setFont("helvetica", "normal");
        const cleanValue = value || 'N/A';
        const splitText = doc.splitTextToSize(cleanValue.toString(), 140);
        doc.text(splitText, 55, yPos);
        yPos += (splitText.length * 6);
        if (yPos > 270) { 
          doc.addPage(); 
          doc.setFillColor(5, 9, 20); 
          doc.rect(0, 0, 210, 297, 'F'); 
          yPos = 30; 
        }
      };

      drawSectionTitle("INFORMACIÓN DEL CLIENTE");
      addField("Nombre", `${formData.firstName} ${formData.lastName}`);
      addField("Email", formData.email);
      addField("Teléfono", formData.phone);
      addField("Rol", formData.userRole);
      yPos += sectionSpacing;

      drawSectionTitle("DATOS DEL PROYECTO");
      addField("Empresa", formData.businessName);
      addField("Nicho", formData.niche);
      addField("Ubicación", `${formData.city}, ${formData.country}`);
      
      const sNames = formData.selectedServices.map(id => serviceOptions.find(o => o.id === id)?.label).join(', ');
      addField("Servicios", sNames);
      addField("Tiempo", formData.timeEstimate);
      yPos += sectionSpacing;

      drawSectionTitle("PREFERENCIAS TÉCNICAS");
      const cNames = formData.selectedComponents.map(id => componentOptions.find(o => o.id === id)?.label).join(', ');
      addField("Armas Digitales", cNames);
      
      const pNames = formData.selectedPalettes.map(id => colorPaletteOptions.find(o => o.id === id)?.label).join(', ');
      addField("Paletas", pNames);
      addField("Audiovisual", formData.audiovisualReq);
      yPos += sectionSpacing;

      drawSectionTitle("VISIÓN Y ADN");
      addField("Descripción", formData.description);

      // Descarga inmediata
      doc.save(`Arka_Manifiesto_${formData.businessName || 'Proyecto'}.pdf`);

      // Envío EmailJS
      setActionStatus('sending');
      window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const templateParams = {
        to_email: 'yohaldryquintero1995@gmail.com',
        user_name: `${formData.firstName} ${formData.lastName}`,
        user_email: formData.email,
        business_name: formData.businessName,
        message: formData.description,
        content_pdf: pdfBase64 
      };

      await window.emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      setActionStatus('success');
      setTimeout(() => setShowSuccessModal(true), 500);

    } catch (e) {
      console.error("Error en proceso final:", e);
      setActionStatus('idle');
      // No usamos alert, simplemente restablecemos el estado para reintentar
    }
  };

  return (
    <div className="h-screen w-full bg-[#050914] text-white flex flex-col font-sans overflow-hidden relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
      `}</style>

      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-[#0a0f1d] border border-blue-500/30 p-8 md:p-12 rounded-[2.5rem] max-w-lg w-full text-center space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-green-500 rounded-full w-24 h-24 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">¡Proceso <span className="text-green-500">Completado!</span></h2>
              <p className="text-white/60 text-sm leading-relaxed">Tu manifiesto ha sido descargado y enviado. Nos pondremos en contacto pronto.</p>
            </div>
            <button onClick={resetToHome} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all">
              Volver al Inicio <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE PROGRESO */}
      <div className="h-1 w-full bg-white/5">
        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(step === 1 ? (formSubStep + 1) / questions.length : 1) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 lg:p-12 items-center gap-12 overflow-y-auto custom-scrollbar">
          <div key={`question-${formSubStep}`} className="w-full lg:w-3/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-black uppercase text-[10px]">
                <currentQuestion.icon size={14} /> Paso {formSubStep + 1} de {questions.length}
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight">{currentQuestion.label}</h1>
            </div>

            <div className="min-h-[160px] flex items-center">
              {currentQuestion.type === 'location' ? (
                <div className="grid grid-cols-2 gap-4 w-full">
                  <input placeholder="País" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-lg" />
                  <input placeholder="Ciudad" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-lg" />
                </div>
              ) : currentQuestion.type === 'services-checklist' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {serviceOptions.map(opt => (
                    <button key={opt.id} onClick={() => {
                      const cur = formData.selectedServices;
                      setFormData({...formData, selectedServices: cur.includes(opt.id) ? cur.filter(x => x !== opt.id) : [...cur, opt.id]});
                    }} className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.selectedServices.includes(opt.id) ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 opacity-50'}`}>
                      <opt.icon size={18} /> <span className="text-[10px] font-black uppercase">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : currentQuestion.type === 'time-options' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {timeOptions.map(opt => (
                    <button key={opt.id} onClick={() => setFormData({...formData, timeEstimate: opt.label})} className={`p-4 rounded-xl border text-left transition-all ${formData.timeEstimate === opt.label ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/10 opacity-60'}`}>
                      <Calendar size={18} className="mb-2 text-blue-500" />
                      <p className="text-sm font-black uppercase">{opt.label}</p>
                    </button>
                  ))}
                </div>
              ) : currentQuestion.type === 'checklist' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                  {componentOptions.map(opt => (
                    <button key={opt.id} onClick={() => {
                      const cur = formData.selectedComponents;
                      setFormData({...formData, selectedComponents: cur.includes(opt.id) ? cur.filter(x => x !== opt.id) : [...cur, opt.id]});
                    }} className={`p-4 rounded-xl border text-[8px] font-black uppercase flex flex-col items-center gap-2 transition-all ${formData.selectedComponents.includes(opt.id) ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10'}`}>
                      <opt.icon size={16} /> {opt.label}
                    </button>
                  ))}
                </div>
              ) : currentQuestion.type === 'color-checklist' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {colorPaletteOptions.map(opt => (
                    <button key={opt.id} onClick={() => {
                      const cur = formData.selectedPalettes;
                      setFormData({...formData, selectedPalettes: cur.includes(opt.id) ? cur.filter(x => x !== opt.id) : [...cur, opt.id]});
                    }} className={`p-3 rounded-xl border text-left flex flex-col gap-2 ${formData.selectedPalettes.includes(opt.id) ? 'bg-white/10 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex gap-1">{opt.colors.map((c, i) => <div key={i} className="w-full h-4 rounded-sm" style={{ backgroundColor: c }}></div>)}</div>
                      <p className="text-[10px] font-black uppercase">{opt.label}</p>
                    </button>
                  ))}
                </div>
              ) : currentQuestion.type === 'boolean' ? (
                <div className="flex gap-6 w-full max-w-sm">
                  <button onClick={() => setFormData({...formData, audiovisualReq: 'Sí'})} className={`flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3 ${formData.audiovisualReq === 'Sí' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10'}`}><CheckCircle2 size={32} />SÍ</button>
                  <button onClick={() => setFormData({...formData, audiovisualReq: 'No'})} className={`flex-1 py-8 rounded-2xl border-2 flex flex-col items-center gap-3 ${formData.audiovisualReq === 'No' ? 'border-red-500 bg-red-500/10' : 'border-white/10'}`}><XCircle size={32} />NO</button>
                </div>
              ) : currentQuestion.type === 'textarea' ? (
                <textarea ref={inputRef} value={formData[currentQuestion.id] || ''} onChange={(e) => setFormData({...formData, [currentQuestion.id]: e.target.value})} className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-blue-500 text-2xl font-bold min-h-[150px]" />
              ) : (
                <input ref={inputRef} type={currentQuestion.type} value={formData[currentQuestion.id] || ''} onChange={(e) => setFormData({...formData, [currentQuestion.id]: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleNext()} className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-blue-500 text-2xl font-bold" />
              )}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <button onClick={handleBack} disabled={formSubStep === 0} className="text-[10px] font-black uppercase flex items-center gap-2 opacity-50 hover:opacity-100">
                <ChevronLeft size={14} /> Atrás
              </button>
              <button onClick={handleNext} className="px-12 py-4 bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all">
                {formSubStep === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </div>
          <div className="hidden lg:flex w-2/5 flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6 text-sm italic opacity-70 text-center leading-relaxed">"{currentQuestion.botTip}"</div>
            <img src={robotImageUrl} alt="Robot" className="w-auto h-56 animate-bounce duration-[3000ms]" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in">
          <img src={robotImageUrl} alt="Procesando" className="w-40 h-40 animate-pulse" />
          <h2 className="text-3xl font-black italic uppercase">Sincronizando <span className="text-blue-500">ADN...</span></h2>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in zoom-in">
          <img src={robotImageUrl} alt="Final" className="w-32 h-32 mb-4" />
          <h1 className="text-5xl font-black italic uppercase">¡Estructura <span className="text-blue-500">Completa!</span></h1>
          <button 
            onClick={handleFinalAction} 
            disabled={actionStatus !== 'idle'} 
            className="px-16 py-6 bg-white text-black rounded-2xl font-black text-[14px] uppercase tracking-widest flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
          >
            {(actionStatus === 'generating' || actionStatus === 'sending') && <Loader2 className="animate-spin" size={20} />}
            {actionStatus === 'idle' && <Download size={20} />}
            {actionStatus === 'success' && <CheckCircle2 size={20} />}
            {actionStatus === 'generating' ? "Estructurando PDF..." : actionStatus === 'sending' ? "Enviando a Arka..." : actionStatus === 'success' ? "¡Completado!" : "Descargar y Enviar Manifiesto"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectLab;