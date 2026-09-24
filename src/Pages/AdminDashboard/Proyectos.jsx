import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Search, Clock, Building2, Globe, Smartphone, FileText, CheckCircle2, UserCheck, SlidersHorizontal, X, Zap, Palette, Check } from 'lucide-react';
import { db } from '../../components/firebase'; // Asegúrate de ajustar esta ruta a tu configuración de Firebase
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function Proyectos() {
  const [search, setSearch] = useState(''), [statusFilter, setStatusFilter] = useState('todos');
  const [isOpenModal, setIsOpenModal] = useState(false), [step, setStep] = useState(0);
  const [newModWeb, setNewModWeb] = useState(''), [newModApp, setNewModApp] = useState('');
  const [projects, setProjects] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  const palettes = [
    { name: 'Cian Neón / Oscuro', colors: ['#020617', '#06b6d4', '#38bdf8'] },
    { name: 'Esmeralda / Corporativo', colors: ['#0f172a', '#10b981', '#34d399'] },
    { name: 'Violeta / Futurista', colors: ['#09090b', '#a855f7', '#c084fc'] },
    { name: 'Ámbar / Minimalista Claro', colors: ['#ffffff', '#f59e0b', '#fbbf24'] },
  ];

  const initialForm = {
    title: '', client: '', cat: 'Mobile & Web', status: 'inicio',
    budget: '', date: '2026-12-31', colors: ['#020617', '#06b6d4', '#38bdf8'],
    styleDesc: '', detailsReq: '', platformType: 'Web y App', modsWeb: ['Panel Admin', 'Landing Page', 'SEO'],
    modsApp: ['Citas Push', 'Perfil de Usuario', 'Pasarela de Pagos'],
    email: '', phone: '', documentId: ''
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    getDocs(collection(db, 'clientes'))
      .then(res => setProjects(res.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
      .catch(err => console.error("Error al cargar clientes desde Firebase:", err));
  }, []);

  const addMod = (type) => {
    const val = type === 'web' ? newModWeb.trim() : newModApp.trim();
    if (!val || form[type === 'web' ? 'modsWeb' : 'modsApp'].includes(val)) return;
    setForm(f => ({ ...f, [type === 'web' ? 'modsWeb' : 'modsApp']: [...f[type === 'web' ? 'modsWeb' : 'modsApp'], val] }));
    type === 'web' ? setNewModWeb('') : setNewModApp('');
  };

  // Validador de campos por paso
  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim() || !form.client.trim() || !form.cat.trim()) {
        alert('Por favor completa todos los campos del Paso 1.');
        return false;
      }
    } else if (step === 1) {
      if (!form.styleDesc.trim()) {
        alert('Por favor describe los estilos y efectos visuales.');
        return false;
      }
    } else if (step === 2) {
      if (!form.detailsReq.trim()) {
        alert('Por favor especifica los detalles y requerimientos.');
        return false;
      }
    } else if (step === 3) {
      if (form.platformType === 'Web' && form.modsWeb.length === 0) {
        alert('Agrega al menos un módulo web.');
        return false;
      }
      if (form.platformType === 'App' && form.modsApp.length === 0) {
        alert('Agrega al menos un módulo para la App.');
        return false;
      }
      if (form.platformType === 'Web y App' && (form.modsWeb.length === 0 || form.modsApp.length === 0)) {
        alert('Agrega módulos tanto para Web como para App.');
        return false;
      }
    } else if (step === 4) {
      if (!form.email.trim() || !form.phone.trim() || !form.documentId.trim()) {
        alert('Por favor completa todos los datos de contacto y documento.');
        return false;
      }
    } else if (step === 5) {
      if (!form.budget.trim() || !form.date.trim()) {
        alert('Por favor ingresa el presupuesto y la fecha de entrega.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

 const handleSave = async () => {
    if (!validateStep()) return;
    setIsSaving(true);

    // Creamos una promesa con timeout de 6 segundos para evitar que se quede pensando infinitamente
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado. Firebase no responde (revisa tu conexión o las reglas de Firestore).")), 6000)
    );

    try {
      const projectData = {
        title: form.title.trim(),
        client: form.client.trim(),
        cat: form.cat.trim(),
        status: form.status,
        budget: form.budget.trim(),
        date: form.date,
        colors: form.colors,
        styleDesc: form.styleDesc.trim(),
        detailsReq: form.detailsReq.trim(),
        platformType: form.platformType,
        modsWeb: form.modsWeb,
        modsApp: form.modsApp,
        email: form.email.trim(),
        phone: form.phone.trim(),
        documentId: form.documentId.trim(),
        createdAt: new Date().toISOString()
      };

      console.log("Intentando guardar en Firebase colección 'clientes' con datos:", projectData);

      // Ejecutamos addDoc compitiendo con el timeout
      const docRef = await Promise.race([
        addDoc(collection(db, 'clientes'), projectData),
        timeoutPromise
      ]);

      console.log("¡Guardado con éxito! ID generado:", docRef.id);

      setProjects(p => [{ id: docRef.id, ...projectData }, ...p]);
      setIsOpenModal(false);
      setStep(0);
      setForm(initialForm);

      setSuccessAlert(true);
      setTimeout(() => setSuccessAlert(false), 3500);

    } catch (error) {
      console.error("ERROR CRÍTICO AL GUARDAR EN FIREBASE:", error);
      alert("No se pudo guardar: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = projects.filter(p => 
    (p.title?.toLowerCase().includes(search.toLowerCase()) || p.client?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'todos' || p.status?.toLowerCase() === statusFilter.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col gap-5 p-8 bg-slate-100 text-slate-800 font-sans overflow-y-auto selection:bg-cyan-500 selection:text-white text-xs relative">
      
      {/* ALERTA ESTILO ARKANA DE ÉXITO */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 border border-cyan-500/50 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl shadow-cyan-500/20 flex items-center gap-3.5 animate-bounce">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
            <Check size={18} className="stroke-[3]" />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-400 font-mono">Arkana System</h4>
            <p className="text-[10px] text-slate-300 font-medium">¡Proyecto guardado exitosamente en la base de datos!</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600"><FolderKanban size={18} /></div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">Proyectos Activos</h1>
            <p className="text-[10px] text-slate-400">Control de avance, diseño visual y arquitectura multiplataforma.</p>
          </div>
        </div>
        <button onClick={() => setIsOpenModal(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase text-[10px] shadow-md shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"><Plus size={14} /> Nuevo Proyecto</button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar proyecto o cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-cyan-500 focus:bg-white outline-none" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <SlidersHorizontal size={13} className="text-slate-400 mr-1" />
          {['todos', 'inicio', 'En Desarrollo', 'Fase Final', 'Pruebas', 'Planificación'].map(st => (
            <button key={st} onClick={() => setStatusFilter(st)} className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[9px] cursor-pointer whitespace-nowrap transition-all ${statusFilter === st ? 'bg-slate-900 text-cyan-400 shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>{st}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 italic">No hay proyectos encontrados.</div> :
          filtered.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-cyan-400 transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-cyan-600 font-bold uppercase tracking-wider">{p.cat}</span>
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase">{p.platformType || 'Web y App'}</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                      {p.colors?.map((c, i) => <span key={i} className="w-2.5 h-2.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }}></span>)}
                    </div>
                  </div>
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-cyan-600 transition-colors mt-0.5">{p.title}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Building2 size={12} className="text-slate-400" /> <strong className="text-slate-700">{p.client}</strong></p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase border bg-cyan-50 text-cyan-700 border-cyan-200">{p.status}</span>
              </div>

              {(p.email || p.phone || p.documentId) && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[9px]">
                  <div><span className="text-slate-400 block font-bold">Correo:</span> <span className="text-slate-700 font-medium truncate block">{p.email || 'N/A'}</span></div>
                  <div><span className="text-slate-400 block font-bold">Teléfono:</span> <span className="text-slate-700 font-medium truncate block">{p.phone || 'N/A'}</span></div>
                  <div><span className="text-slate-400 block font-bold">Documento:</span> <span className="text-slate-700 font-medium truncate block">{p.documentId || 'N/A'}</span></div>
                </div>
              )}

              {p.styleDesc && <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">🎨 "{p.styleDesc}"</p>}
              {p.detailsReq && <p className="text-[10px] text-slate-600 bg-cyan-50/50 p-2.5 rounded-xl border border-cyan-100">📋 <strong>Requerimientos:</strong> {p.detailsReq}</p>}

              <div className="flex flex-col gap-2 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                {(p.platformType === 'Web' || p.platformType === 'Web y App') && p.modsWeb?.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-cyan-600 font-bold flex items-center gap-1"><Globe size={11} /> Módulos Web:</span>
                    <div className="flex flex-wrap gap-1">{p.modsWeb.map((m, i) => <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[9px]">{m}</span>)}</div>
                  </div>
                )}
                {(p.platformType === 'App' || p.platformType === 'Web y App') && p.modsApp?.length > 0 && (
                  <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60">
                    <span className="text-[9px] font-mono text-blue-600 font-bold flex items-center gap-1"><Smartphone size={11} /> Módulos App:</span>
                    <div className="flex flex-wrap gap-1">{p.modsApp.map((m, i) => <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[9px]">{m}</span>)}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
                <span className="text-slate-500 flex items-center gap-1"><Clock size={11} className="text-slate-400" /> {p.date}</span>
                <span className="font-black font-mono text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">{p.budget}</span>
              </div>
            </div>
          ))
        }
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600"><Zap size={14} /></div>
                <h2 className="text-xs font-black uppercase text-slate-900">Nuevo Proyecto Técnico</h2>
              </div>
              <button onClick={() => setIsOpenModal(false)} className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"><X size={14} /></button>
            </div>

            <div className="py-5 min-h-[300px]">
              {step === 0 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase text-slate-500">1. Información General (Obligatorio)</label>
                  <input type="text" placeholder="Nombre de la empresa *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500" required />
                  <input type="text" placeholder="Nombre y apellido del representante *" value={form.client} onChange={e => setForm({...form, client: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500" required />
                  <input type="text" placeholder="¿De dónde conoció a Arkanavision? *" value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500" required />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><Palette size={13} className="text-cyan-600" /> 2. Selección de Paleta y Estilos Visuales</label>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-400 font-medium">Paletas predefinidas (haz clic para cargar):</span>
                    <div className="grid grid-cols-4 gap-2">
                      {palettes.map((pal, idx) => (
                        <div key={idx} onClick={() => setForm({...form, colors: pal.colors})} className="p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-cyan-400 flex flex-col gap-1 items-center">
                          <div className="flex gap-1">{pal.colors.map((c, i) => <span key={i} className="w-3 h-3 rounded-full border border-white" style={{backgroundColor: c}}></span>)}</div>
                          <span className="text-[8px] text-slate-600 text-center truncate w-full">{pal.name.split('/')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-400 font-medium">O elige tus 3 colores personalizados:</span>
                    <div className="flex gap-2">
                      {form.colors.map((color, i) => (
                        <div key={i} className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <input type="color" value={color} onChange={e => { const nc = [...form.colors]; nc[i] = e.target.value; setForm({...form, colors: nc}); }} className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-none" />
                          <span className="text-[10px] font-mono text-slate-700">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <textarea placeholder="Describe los estilos, transiciones y efectos visuales *..." value={form.styleDesc} onChange={e => setForm({...form, styleDesc: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-cyan-500 h-16 resize-none" required></textarea>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><FileText size={13} className="text-cyan-600" /> 3. Detalles y Funciones Requeridas</label>
                  <textarea placeholder="Ej. Sistema de autenticación JWT *" value={form.detailsReq} onChange={e => setForm({...form, detailsReq: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs outline-none focus:border-cyan-500 h-28 resize-none" required></textarea>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase text-slate-500">4. Tipo de Plataforma y Módulos</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Web', 'App', 'Web y App'].map(pt => (
                      <button key={pt} type="button" onClick={() => setForm({...form, platformType: pt})} className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase cursor-pointer transition-all ${form.platformType === pt ? 'bg-slate-900 text-cyan-400 border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{pt}</button>
                    ))}
                  </div>

                  {(form.platformType === 'Web' || form.platformType === 'Web y App') && (
                    <div className="flex flex-col gap-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-bold text-cyan-600 flex items-center gap-1"><Globe size={11} /> Módulos Web (Obligatorio al menos 1)</span>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Añadir módulo web..." value={newModWeb} onChange={e => setNewModWeb(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMod('web')} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-cyan-500" />
                        <button type="button" onClick={() => addMod('web')} className="px-3 py-1.5 bg-slate-900 text-cyan-400 font-bold rounded-xl text-xs cursor-pointer">+</button>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {form.modsWeb.map((m, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[9px] flex items-center gap-1">
                            {m} <button onClick={() => setForm({...form, modsWeb: form.modsWeb.filter(x => x !== m)})} className="text-red-400 hover:text-red-600">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(form.platformType === 'App' || form.platformType === 'Web y App') && (
                    <div className="flex flex-col gap-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-bold text-blue-600 flex items-center gap-1"><Smartphone size={11} /> Módulos App Móvil (Obligatorio al menos 1)</span>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Añadir módulo app..." value={newModApp} onChange={e => setNewModApp(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMod('app')} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-cyan-500" />
                        <button type="button" onClick={() => addMod('app')} className="px-3 py-1.5 bg-slate-900 text-cyan-400 font-bold rounded-xl text-xs cursor-pointer">+</button>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {form.modsApp.map((m, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-[9px] flex items-center gap-1">
                            {m} <button onClick={() => setForm({...form, modsApp: form.modsApp.filter(x => x !== m)})} className="text-red-400 hover:text-red-600">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><UserCheck size={13} className="text-cyan-600" /> 5. Datos de Contacto y Documento (Obligatorio)</label>
                  <div className="flex flex-col gap-2 pt-1">
                    <input type="email" placeholder="Correo electrónico *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500" required />
                    <input type="tel" placeholder="Número de teléfono *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500" required />
                    <input type="text" placeholder="Documento de Identidad (C.C. / NIT) *" value={form.documentId} onChange={e => setForm({...form, documentId: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500" required />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5"><CheckCircle2 size={13} className="text-cyan-600" /> 6. Roadmap, Presupuesto y Estado</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <div>
                        <span className="text-[9px] font-mono text-cyan-600 font-bold uppercase">{form.cat}</span>
                        <h4 className="text-xs font-black text-slate-900">{form.title}</h4>
                        <span className="text-[10px] text-slate-500">Cliente: <strong className="text-slate-800">{form.client}</strong></span>
                      </div>
                      <span className="bg-slate-900 text-cyan-400 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase">{form.platformType}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500">Estado</span>
                      <input type="text" value="inicio" disabled className="bg-slate-100 border border-slate-200 rounded-xl px-2 py-2 text-[10px] text-slate-500 cursor-not-allowed outline-none font-medium" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500">Presupuesto *</span>
                      <input type="text" placeholder="Ej. 3.5M COP" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] outline-none focus:border-cyan-500" required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500">Entrega *</span>
                      <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] outline-none focus:border-cyan-500 cursor-pointer" required />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 disabled:opacity-30 cursor-pointer">Anterior</button>
              <span className="text-[10px] font-mono text-slate-400">Paso {step + 1} de 6</span>
              {step < 5 ? <button onClick={handleNext} className="px-4 py-2 rounded-xl bg-slate-900 text-cyan-400 font-bold cursor-pointer">Siguiente</button> :
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:scale-100">
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Proyecto</span>
                  )}
                </button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}