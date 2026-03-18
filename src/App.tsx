import React, { useState, useEffect } from 'react';
import { 
  INITIAL_HEADER, 
  INITIAL_SESSIONS, 
  MODULES_BY_LEVEL, 
  APS_BY_FAMILY, 
  VOLLEYBALL_SESSIONS_BY_LEVEL, 
  HANDBALL_SESSIONS_BY_LEVEL, 
  BASKETBALL_SESSIONS_BY_LEVEL,
  FOOTBALL_SESSIONS_BY_LEVEL,
  ATHLETISME_SESSIONS_BY_LEVEL,
  GYMNASTIQUE_SESSIONS_BY_LEVEL,
  STRATEGIE_SESSIONS_BY_LEVEL,
  RACKET_SESSIONS_BY_LEVEL,
  RUGBY_SESSIONS_BY_LEVEL,
  ULTIMATE_FRISBEE_SESSIONS_BY_LEVEL,
  COMMON_OBSERVATIONS
} from './constants';
import { HeaderInfo, Session } from './types';
import { Printer, Save, Plus, Trash2, Edit2, FileDown, FileUp, CheckCircle, XCircle, Download, ChevronDown, FileText, User, BookOpen, Layers, Activity, Target, Users, Hash, CalendarClock, MessageSquare, Settings2, ListOrdered } from 'lucide-react';
import { saveAs } from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';

const BilanInput = ({ 
  value, 
  onChange, 
  allSessions 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  allSessions: Session[];
}) => {
  const [focused, setFocused] = useState(false);
  
  const uniquePrevious = Array.from(new Set(allSessions.map(s => s.bilan).filter(b => b && b.trim() !== '')));
  const allSuggestions = Array.from(new Set([...COMMON_OBSERVATIONS, ...uniquePrevious]));
  
  const filtered = allSuggestions.filter(s => 
    s.toLowerCase().includes((value || '').toLowerCase()) && s !== value
  ).slice(0, 4);

  return (
    <div className="flex flex-col w-full relative">
      <textarea 
        dir="auto"
        placeholder="Observations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        className="w-full bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-md p-2 -ml-2 min-h-[40px] text-[13px] leading-relaxed text-slate-600 placeholder-slate-300 hover:bg-white/60 focus:bg-white transition-all"
      />
      {focused && filtered.length > 0 && (
        <div className="absolute top-full left-0 z-20 mt-1 w-64 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden no-print flex flex-col py-1">
          {filtered.map((suggestion, idx) => (
            <button 
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion);
                setFocused(false);
              }}
              className="text-left px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>(INITIAL_HEADER);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Map of APS support to their respective session data
  const SESSIONS_DATA_MAP: Record<string, Record<string, any[]>> = {
    'Volleyball': VOLLEYBALL_SESSIONS_BY_LEVEL,
    'Handball': HANDBALL_SESSIONS_BY_LEVEL,
    'Basketball': BASKETBALL_SESSIONS_BY_LEVEL,
    'Football': FOOTBALL_SESSIONS_BY_LEVEL,
    'Rugby': RUGBY_SESSIONS_BY_LEVEL,
    'Ultimate Frisbee': ULTIMATE_FRISBEE_SESSIONS_BY_LEVEL,
    'Course de vitesse': ATHLETISME_SESSIONS_BY_LEVEL,
    'Course de demi-fond': ATHLETISME_SESSIONS_BY_LEVEL,
    'Course de haies': ATHLETISME_SESSIONS_BY_LEVEL,
    'Course de relais': ATHLETISME_SESSIONS_BY_LEVEL,
    'Saut en longueur': ATHLETISME_SESSIONS_BY_LEVEL,
    'Saut en hauteur': ATHLETISME_SESSIONS_BY_LEVEL,
    'Triple saut': ATHLETISME_SESSIONS_BY_LEVEL,
    'Gym au sol': GYMNASTIQUE_SESSIONS_BY_LEVEL,
    'Acrogym': GYMNASTIQUE_SESSIONS_BY_LEVEL,
    'Échecs': STRATEGIE_SESSIONS_BY_LEVEL,
    'Tennis': RACKET_SESSIONS_BY_LEVEL,
    'Tennis de table': RACKET_SESSIONS_BY_LEVEL,
    'Badminton': RACKET_SESSIONS_BY_LEVEL,
  };

  const updateSessionsForAPS = (aps: string, level: string) => {
    const sessionData = SESSIONS_DATA_MAP[aps]?.[level];
    if (sessionData) {
      const newSessions = sessionData.map((s, index) => ({
        ...s,
        id: crypto.randomUUID(),
        date: sessions[index]?.date || '',
        heure: sessions[index]?.heure || '',
        bilan: sessions[index]?.bilan || '',
        completed: sessions[index]?.completed || false
      }));
      setSessions(newSessions);
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedHeader = localStorage.getItem('cahier-header');
    const savedSessions = localStorage.getItem('cahier-sessions');
    if (savedHeader) setHeaderInfo(JSON.parse(savedHeader));
    if (savedSessions) setSessions(JSON.parse(savedSessions));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Save to local storage
  const saveToLocal = () => {
    localStorage.setItem('cahier-header', JSON.stringify(headerInfo));
    localStorage.setItem('cahier-sessions', JSON.stringify(sessions));
    alert('Données sauvegardées localement !');
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'niveauScolaire') {
      // When level changes, reset module to the first available for that level
      const firstModule = MODULES_BY_LEVEL[value]?.[0] || '';
      setHeaderInfo({ 
        ...headerInfo, 
        niveauScolaire: value,
        moduleEnseignement: firstModule 
      });

      updateSessionsForAPS(headerInfo.apsSupport, value);

    } else if (name === 'familleAPS') {
      // When family changes, reset support to the first available for that family
      const firstSupport = APS_BY_FAMILY[value]?.[0] || '';
      setHeaderInfo({
        ...headerInfo,
        familleAPS: value,
        apsSupport: firstSupport
      });

      updateSessionsForAPS(firstSupport, headerInfo.niveauScolaire);

    } else if (name === 'apsSupport') {
      setHeaderInfo({ ...headerInfo, [name]: value });
      updateSessionsForAPS(value, headerInfo.niveauScolaire);
    } else {
      setHeaderInfo({ ...headerInfo, [name]: value });
    }
  };

  const handleSessionChange = (id: string, field: keyof Session, value: any) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSession = () => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      sequence: 'Nouvelle séquence',
      seanceNumber: sessions.length + 1,
      objectif: 'Nouvel objectif',
      date: '',
      heure: '',
      duree: '1h',
      bilan: '',
      completed: false
    };
    setSessions([...sessions, newSession]);
  };

  const deleteSession = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette séance ?')) {
      const filteredSessions = sessions.filter(s => s.id !== id);
      const renumberedSessions = filteredSessions.map((s, index) => ({
        ...s,
        seanceNumber: index + 1
      }));
      setSessions(renumberedSessions);
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ headerInfo, sessions }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cahier_de_textes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.headerInfo && data.sessions) {
          setHeaderInfo(data.headerInfo);
          setSessions(data.sessions);
          alert('Données importées avec succès !');
        } else {
          alert('Fichier invalide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier.');
      }
    };
    reader.readAsText(file);
  };

  const downloadPDF = () => {
    // Tailwind v4 uses modern CSS functions (oklch, color-mix) that html2canvas cannot parse.
    // The native browser print dialog is the most reliable way to generate a perfect PDF.
    // On Android/iOS and Desktop, this allows "Save as PDF".
    window.print();
  };

  const downloadDOCX = () => {
    const element = document.getElementById('document-content');
    if (!element) return;

    // Clone the element to modify it for DOCX export
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remove elements that shouldn't be in the DOCX (like buttons)
    const noPrintElements = clone.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // Convert inputs and textareas to text nodes for DOCX
    const inputs = clone.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const value = (input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
      const textNode = document.createTextNode(value || ' ');
      input.parentNode?.replaceChild(textNode, input);
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cahier de Textes</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: left; }
            th { background-color: #f0f0f0; }
            h2, h3 { color: #333; }
            .grid { display: block; }
            .flex { display: block; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          ${clone.innerHTML}
        </body>
      </html>
    `;

    asBlob(html, { orientation: 'landscape', margins: { top: 720, right: 720, bottom: 720, left: 720 } }).then(converted => {
      saveAs(converted as Blob, 'Cahier_de_Textes_EPS.docx');
    }).catch(err => {
      console.error('DOCX generation error', err);
      alert('Erreur lors de la génération du fichier Word.');
    });
  };

  const getSequenceSpans = () => {
    const spans = new Array(sessions.length).fill(1);
    for (let i = 0; i < sessions.length; i++) {
      if (spans[i] === 0) continue;
      let span = 1;
      for (let j = i + 1; j < sessions.length; j++) {
        if (sessions[i].sequence === sessions[j].sequence) {
          span++;
          spans[j] = 0;
        } else {
          break;
        }
      }
      spans[i] = span;
    }
    return spans;
  };

  const sequenceSpans = getSequenceSpans();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation - No Print */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center sticky top-0 z-10 no-print shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
          <span className="bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
            <CheckCircle size={18} strokeWidth={2.5} />
          </span>
          Cahier de Textes EPS
        </h1>
        <div className="flex flex-wrap gap-2 justify-end">
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-colors text-sm font-medium">
              <Download size={16} />
              <span className="hidden sm:inline">Installer l'App</span>
            </button>
          )}
          <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
            <FileUp size={16} />
            <span className="hidden sm:inline">Importer</span>
            <input type="file" accept=".json" className="hidden" onChange={importData} />
          </label>
          <button onClick={exportData} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
            <FileDown size={16} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button onClick={saveToLocal} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors text-sm font-medium">
            <Save size={16} />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm shadow-red-200">
              <Download size={16} />
              <span className="hidden sm:inline">Télécharger</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={downloadPDF} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <FileText size={16} /> Format PDF
              </button>
              <button onClick={downloadDOCX} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <FileText size={16} /> Format Word (DOCX)
              </button>
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm shadow-blue-200">
            <Printer size={16} />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </nav>

      <main id="document-content" className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Information Section */}
        <section className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center no-print">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Informations Générales</h2>
            <button 
              onClick={() => setIsEditingHeader(!isEditingHeader)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow"
            >
              <Edit2 size={14} />
              {isEditingHeader ? 'Terminer l\'édition' : 'Modifier'}
            </button>
          </div>

          <div className="p-8 print:p-2">
            {isEditingHeader ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nom du Professeur</label>
                  <input
                    type="text"
                    name="teacher"
                    dir="auto"
                    value={headerInfo.teacher}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Niveau Scolaire</label>
                  <select
                    name="niveauScolaire"
                    value={headerInfo.niveauScolaire}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {Object.keys(MODULES_BY_LEVEL).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Module d'enseignement</label>
                  <select
                    name="moduleEnseignement"
                    value={headerInfo.moduleEnseignement}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {(MODULES_BY_LEVEL[headerInfo.niveauScolaire] || []).map(module => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Famille d'APS</label>
                  <select
                    name="familleAPS"
                    value={headerInfo.familleAPS}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {Object.keys(APS_BY_FAMILY).map(family => (
                      <option key={family} value={family}>{family}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">APS Support</label>
                  <select
                    name="apsSupport"
                    value={headerInfo.apsSupport}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {(APS_BY_FAMILY[headerInfo.familleAPS] || []).map(support => (
                      <option key={support} value={support}>{support}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Classe</label>
                  <input
                    type="text"
                    name="classe"
                    dir="auto"
                    value={headerInfo.classe}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 print:gap-4">
                <div className="flex justify-between items-start w-full px-2">
                  <div className="flex flex-col items-center flex-1 px-2 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Professeur</span>
                    <span className="text-sm font-semibold text-slate-800">{headerInfo.teacher || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-2 text-center border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Niveau scolaire</span>
                    <span className="text-sm font-semibold text-slate-800">{headerInfo.niveauScolaire || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-2 text-center border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Module d'enseignement</span>
                    <span className="text-sm font-semibold text-slate-800">{headerInfo.moduleEnseignement || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-2 text-center border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Famille d'APS</span>
                    <span className="text-sm font-semibold text-slate-800">{headerInfo.familleAPS || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-2 text-center border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">APS support</span>
                    <span className="text-sm font-semibold text-slate-800">{headerInfo.apsSupport || '-'}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-2 text-center border-l border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Classe</span>
                    <span className="text-sm font-semibold text-slate-800">{headerInfo.classe || '-'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sessions Table Section */}
        <section className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center no-print">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Planification des Séances</h2>
            <button 
              onClick={addSession}
              className="flex items-center gap-2 text-sm bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus size={16} />
              Ajouter une séance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-indigo-50/60 text-indigo-900 text-[10px] font-bold uppercase tracking-widest border-b-2 border-indigo-200 print:bg-indigo-50 print:text-indigo-950 print:border-indigo-300">
                  <th className="py-4 px-4 w-[15%] text-left border-r border-indigo-100/50 print:border-indigo-200">Séquences</th>
                  <th className="py-4 px-2 w-16 text-center border-r border-indigo-100/50 print:border-indigo-200">Séances</th>
                  <th className="py-4 px-4 w-[35%] text-left border-r border-indigo-100/50 print:border-indigo-200">Objectifs</th>
                  <th className="py-4 px-2 w-24 text-left border-r border-indigo-100/50 print:border-indigo-200">Date</th>
                  <th className="py-4 px-2 w-20 text-left border-r border-indigo-100/50 print:border-indigo-200">Heure</th>
                  <th className="py-4 px-4 w-[15%] text-left">Bilan / Observations</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sessions.map((session, index) => {
                  const span = sequenceSpans[index];
                  
                  return (
                    <tr key={session.id} className={`group border-b border-slate-200 print:border-indigo-100 last:border-0 transition-all duration-200 hover:bg-slate-50/50 ${session.completed ? 'bg-emerald-50/10' : ''}`}>
                      {span > 0 && (
                        <td rowSpan={span} className="py-3 px-4 align-top border-r border-slate-200/50 print:border-indigo-100 bg-slate-50/30 print:bg-transparent">
                          <textarea 
                            dir="auto"
                            value={session.sequence}
                            onChange={(e) => {
                              const newSessions = [...sessions];
                              for(let i = index; i < index + span; i++) {
                                newSessions[i].sequence = e.target.value;
                              }
                              setSessions(newSessions);
                            }}
                            className="w-full bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-md p-2 -ml-2 text-[13px] leading-relaxed font-medium text-slate-800 hover:bg-white/60 focus:bg-white transition-all"
                            rows={span > 1 ? span * 3 : 2}
                            placeholder="Nom de la séquence..."
                          />
                        </td>
                      )}
                      <td className="py-3 px-2 text-center align-top pt-5 border-r border-slate-200/50 print:border-indigo-100">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-colors print:bg-transparent print:w-auto print:h-auto ${session.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-indigo-600'}`}>
                          {session.seanceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top border-r border-slate-200/50 print:border-indigo-100">
                        <textarea 
                          dir="auto"
                          value={session.objectif}
                          onChange={(e) => handleSessionChange(session.id, 'objectif', e.target.value)}
                          className="w-full bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-md p-2 -ml-2 min-h-[60px] text-[13px] leading-relaxed text-slate-700 hover:bg-white/60 focus:bg-white transition-all"
                          placeholder="Objectifs de la séance..."
                        />
                      </td>
                      <td className="py-3 px-2 align-top pt-4 border-r border-slate-200/50 print:border-indigo-100">
                        <input 
                          type="date" 
                          value={session.date}
                          onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 rounded-md px-2 py-1.5 text-[12px] print:text-[10px] text-slate-600 cursor-pointer transition-all hover:bg-white/60 focus:bg-white"
                        />
                      </td>
                      <td className="py-3 px-2 align-top pt-4 border-r border-slate-200/50 print:border-indigo-100">
                        <input 
                          type="time" 
                          value={session.heure}
                          onChange={(e) => handleSessionChange(session.id, 'heure', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 rounded-md px-2 py-1.5 text-[12px] print:text-[10px] text-slate-600 cursor-pointer transition-all hover:bg-white/60 focus:bg-white"
                        />
                      </td>
                      <td className="py-3 px-4 align-top relative">
                        <BilanInput 
                          value={session.bilan}
                          onChange={(val) => handleSessionChange(session.id, 'bilan', val)}
                          allSessions={sessions}
                        />
                        <div className="absolute right-2 top-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print bg-white/90 p-1 rounded-md shadow-sm border border-slate-100">
                          <button 
                            onClick={() => handleSessionChange(session.id, 'completed', !session.completed)}
                            className={`p-1.5 rounded-md transition-colors ${session.completed ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            title={session.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            onClick={() => deleteSession(session.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Supprimer la séance"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Signatures Section */}
        <section className="mt-16 grid grid-cols-3 gap-8 text-center print:mt-12 bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100/80 p-8 print:shadow-none print:border-none print:rounded-none print:p-0">
          <div className="flex flex-col items-center w-full">
            <span className="font-bold uppercase tracking-widest text-[11px] text-slate-800 mb-12 print:text-indigo-950">L'Inspecteur</span>
            <div className="w-full max-w-[12rem] h-px bg-slate-300 mb-2 print:bg-indigo-200"></div>
            <span className="text-[10px] text-slate-500 italic print:text-indigo-400">Signature & Cachet</span>
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="font-bold uppercase tracking-widest text-[11px] text-slate-800 mb-12 print:text-indigo-950">Le Directeur</span>
            <div className="w-full max-w-[12rem] h-px bg-slate-300 mb-2 print:bg-indigo-200"></div>
            <span className="text-[10px] text-slate-500 italic print:text-indigo-400">Signature & Cachet</span>
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="font-bold uppercase tracking-widest text-[11px] text-slate-800 mb-12 print:text-indigo-950">Le Professeur</span>
            <div className="w-full max-w-[12rem] h-px bg-slate-300 mb-2 print:bg-indigo-200"></div>
            <span className="text-[10px] text-slate-500 italic print:text-indigo-400">Signature</span>
          </div>
        </section>

      </main>
    </div>
  );
}
