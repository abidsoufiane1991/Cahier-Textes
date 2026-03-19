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
import { Printer, Save, Plus, Trash2, Edit2, FileDown, FileUp, CheckCircle, Download, User, GraduationCap, Calendar, Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from './lib/supabase';

const getContextSuggestions = (objectif: string) => {
  const lowerObj = objectif.toLowerCase();
  const suggestions: string[] = [];
  
  if (lowerObj.includes('passe') || lowerObj.includes('réception')) {
    suggestions.push("Bonne maîtrise des passes, mais la réception reste à améliorer.");
    suggestions.push("Les élèves ont bien assimilé la technique de réception.");
  }
  if (lowerObj.includes('attaque') || lowerObj.includes('tir') || lowerObj.includes('smash')) {
    suggestions.push("L'intention d'attaque est présente, mais manque de précision.");
    suggestions.push("Bons tirs en situation favorable.");
  }
  if (lowerObj.includes('défense') || lowerObj.includes('repli')) {
    suggestions.push("Le repli défensif est trop lent chez la majorité des élèves.");
    suggestions.push("Bonne organisation défensive globale.");
  }
  if (lowerObj.includes('vitesse') || lowerObj.includes('course')) {
    suggestions.push("Bon engagement physique, mais la technique de course est à corriger.");
    suggestions.push("Les temps de réaction au départ sont satisfaisants.");
  }
  if (lowerObj.includes('règle') || lowerObj.includes('arbitrage') || lowerObj.includes('règlement')) {
    suggestions.push("Les règles de base sont comprises et respectées.");
    suggestions.push("Nécessité de revenir sur certaines règles lors de la prochaine séance.");
  }
  if (lowerObj.includes('coopération') || lowerObj.includes('équipe') || lowerObj.includes('collectif')) {
    suggestions.push("Bon esprit d'équipe et entraide entre les élèves.");
    suggestions.push("Le jeu collectif doit être davantage encouragé.");
  }
  
  return suggestions;
};

const BilanInput = ({ 
  value, 
  onChange, 
  allSessions,
  objectif
}: { 
  value: string; 
  onChange: (val: string) => void; 
  allSessions: Session[];
  objectif: string;
}) => {
  const [focused, setFocused] = useState(false);
  
  const contextSuggestions = getContextSuggestions(objectif || '');
  const uniquePrevious = Array.from(new Set(allSessions.map(s => s.bilan).filter(b => b && b.trim() !== '')));
  const allSuggestions = Array.from(new Set([...contextSuggestions, ...COMMON_OBSERVATIONS, ...uniquePrevious]));
  
  const filtered = value.trim() === '' 
    ? allSuggestions.slice(0, 6)
    : allSuggestions.filter(s => s.toLowerCase().includes((value || '').toLowerCase()) && s !== value).slice(0, 6);

  return (
    <div className="flex flex-col w-full relative">
      <textarea 
        dir="auto"
        placeholder=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        className="w-full bg-transparent resize-none focus:outline-none text-sm text-slate-700 min-h-[48px] h-[48px] print:min-h-[24px] print:h-[24px] print:text-[12px] bilan-textarea"
        rows={2}
      />
      {focused && filtered.length > 0 && (
        <div className="absolute top-full left-0 z-20 mt-1 w-full max-w-md bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden no-print flex flex-col py-1">
          {filtered.map((suggestion, idx) => (
            <button 
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion);
                setFocused(false);
              }}
              className="text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-b border-slate-50 last:border-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const getEndTime = (startTime: string, duration: string) => {
  if (!startTime) return '--h--';
  let [hours, minutes] = startTime.split(':').map(Number);
  if (duration === '45min') {
    minutes += 45;
  } else if (duration === '1h') {
    hours += 1;
  }
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`;
};

export default function App() {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>(INITIAL_HEADER);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [syncState, setSyncState] = useState<'synced' | 'saving' | 'idle'>('idle');

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

  // Load from local storage and Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      let docId = localStorage.getItem('cahier-doc-id');
      
      if (docId && supabase) {
        try {
          const { data, error } = await supabase
            .from('cahier_documents')
            .select('*')
            .eq('id', docId)
            .single();
            
          if (data) {
            let loadedHeader = data.header_info;
            if (Array.isArray(loadedHeader.niveauScolaire)) {
              loadedHeader.niveauScolaire = loadedHeader.niveauScolaire[0] || '';
            }
            setHeaderInfo(loadedHeader);
            setSessions(data.sessions);
            return;
          }
        } catch (err) {
          console.error("Supabase load error:", err);
        }
      }
      
      // Fallback to local storage
      const savedHeader = localStorage.getItem('cahier-header');
      const savedSessions = localStorage.getItem('cahier-sessions');
      if (savedHeader) {
        let parsedHeader = JSON.parse(savedHeader);
        if (Array.isArray(parsedHeader.niveauScolaire)) {
          parsedHeader.niveauScolaire = parsedHeader.niveauScolaire[0] || '';
        }
        setHeaderInfo(parsedHeader);
      }
      if (savedSessions) setSessions(JSON.parse(savedSessions));
    };

    loadData();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (syncState === 'idle') {
      setSyncState('synced');
      return;
    }
    
    setSyncState('saving');
    const timer = setTimeout(async () => {
      // Save locally first
      localStorage.setItem('cahier-header', JSON.stringify(headerInfo));
      localStorage.setItem('cahier-sessions', JSON.stringify(sessions));
      
      // Save to Supabase if configured
      if (supabase) {
        try {
          let docId = localStorage.getItem('cahier-doc-id');
          
          if (!docId) {
            const { data, error } = await supabase
              .from('cahier_documents')
              .insert([{ header_info: headerInfo, sessions: sessions }])
              .select()
              .single();
              
            if (data) {
              localStorage.setItem('cahier-doc-id', data.id);
            }
          } else {
            await supabase
              .from('cahier_documents')
              .update({ header_info: headerInfo, sessions: sessions, updated_at: new Date().toISOString() })
              .eq('id', docId);
          }
        } catch (err) {
          console.error("Supabase save error:", err);
        }
      }
      
      setSyncState('synced');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [headerInfo, sessions]);

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

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      const filteredSessions = sessions.filter(s => s.id !== sessionToDelete);
      const renumberedSessions = filteredSessions.map((s, index) => ({
        ...s,
        seanceNumber: index + 1
      }));
      setSessions(renumberedSessions);
      setSessionToDelete(null);
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
          let importedHeader = data.headerInfo;
          if (Array.isArray(importedHeader.niveauScolaire)) {
            importedHeader.niveauScolaire = importedHeader.niveauScolaire[0] || '';
          }
          setHeaderInfo(importedHeader);
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-sm font-medium border border-slate-100">
            {syncState === 'saving' ? (
              <><RefreshCw size={14} className="animate-spin text-indigo-500" /> <span className="hidden sm:inline">Enregistrement...</span></>
            ) : (
              <><Cloud size={14} className="text-emerald-500" /> <span className="hidden sm:inline">Sauvegardé</span></>
            )}
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
            <Printer size={16} />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </nav>

      <main id="document-content" className="max-w-4xl mx-auto p-6 space-y-12 bg-white min-h-screen shadow-sm print:shadow-none">
        
        {/* Header Information Section */}
        <section className="relative">
          {isEditingHeader ? (
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden no-print mb-8">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Informations Générales</h2>
                <button 
                  onClick={() => setIsEditingHeader(false)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow"
                >
                  <Edit2 size={14} />
                  Terminer l'édition
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-12 border-b border-slate-200 pb-6 print:mb-4 print:pb-2 group relative">
              <button 
                onClick={() => setIsEditingHeader(true)}
                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm no-print"
              >
                <Edit2 size={12} />
                Modifier
              </button>
              
              <div className="flex justify-between items-end w-full">
                <h2 className="text-4xl font-display font-bold text-[#0B1021] tracking-tight print:text-2xl">Cahier de textes</h2>
                <div className="flex items-center gap-6 text-xs text-slate-500 print:text-[10px]">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400 print:w-3 print:h-3" />
                    <span><strong className="text-slate-700 font-semibold">Enseignant :</strong> {headerInfo.teacher || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-slate-400 print:w-3 print:h-3" />
                    <span><strong className="text-slate-700 font-semibold">Classe :</strong> {headerInfo.classe || '-'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 print:text-[10px]">
                <span><strong className="text-slate-700">Niveau :</strong> {headerInfo.niveauScolaire || '-'}</span>
                <span><strong className="text-slate-700">Module :</strong> {headerInfo.moduleEnseignement || '-'}</span>
                <span className="flex items-center gap-2">
                  <strong className="text-slate-700">Famille d'APS :</strong> {headerInfo.familleAPS || '-'} 
                  <span className="text-slate-300">|</span> 
                  <strong className="text-slate-700">APS Support :</strong> {headerInfo.apsSupport || '-'}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Sessions List Section */}
        <section className="space-y-12 print:space-y-2">
          {sessions.map((session, index) => {
            const showSequence = index === 0 || session.sequence !== sessions[index - 1].sequence;
            
            return (
            <div key={session.id} className="group relative flex gap-4 print:gap-2">
              {/* Timeline Column */}
              <div className="flex flex-col items-center justify-center w-16 shrink-0 relative pt-1 print:pt-0">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-slate-300 print:bg-slate-300"></div>
                <div className="relative z-10 bg-white py-2 print:py-1 flex flex-col items-center gap-1">
                  <input 
                    type="text" 
                    value={session.heure}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9:]/g, '');
                      if (val.length === 2 && session.heure.length === 1 && !val.includes(':')) {
                        val += ':';
                      }
                      handleSessionChange(session.id, 'heure', val.slice(0, 5));
                    }}
                    placeholder="08:00"
                    maxLength={5}
                    className="w-full text-center bg-transparent border-none p-0 focus:ring-0 cursor-text text-[12px] font-semibold text-[#0B1021] print:text-[10px]"
                  />
                  <select
                    value={session.duree || '1h'}
                    onChange={(e) => handleSessionChange(session.id, 'duree', e.target.value)}
                    className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-1 py-0.5 text-center cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 print:border-slate-300 print:bg-transparent print:appearance-none"
                  >
                    <option value="45min">45min</option>
                    <option value="1h">1h</option>
                  </select>
                  <span className="text-[#0B1021] text-[12px] font-semibold print:text-[10px]">
                    {getEndTime(session.heure, session.duree || '1h')}
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 pb-6 print:pb-1 pl-2">
                {showSequence && (
                  <div className="mb-4 print:mb-1">
                    <h3 className="text-lg font-display font-bold text-[#0B1021] underline decoration-2 underline-offset-4 decoration-indigo-200 w-full print:text-sm">
                      <input 
                        type="text" 
                        value={session.sequence}
                        onChange={(e) => {
                          const oldSeq = session.sequence;
                          const newSessions = sessions.map(s => s.sequence === oldSeq ? { ...s, sequence: e.target.value } : s);
                          setSessions(newSessions);
                        }}
                        className="bg-transparent border-none p-0 focus:ring-0 w-full"
                        placeholder="Nom de la séquence"
                      />
                    </h3>
                  </div>
                )}

                <div className="flex flex-row gap-4 print:gap-2">
                  <div className="flex-1 mb-4 print:mb-1">
                    <div className="flex items-center gap-3 mb-2 print:mb-1 whitespace-nowrap overflow-hidden">
                      <h4 className="text-[13px] font-bold text-[#0B1021] tracking-wide">Activités :</h4>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md print:bg-transparent print:border print:border-indigo-200 shrink-0">
                        Séance {session.seanceNumber}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md print:bg-transparent print:p-0 print:text-[10px] shrink-0">
                        <input 
                          type="date" 
                          lang="fr-FR"
                          value={session.date}
                          onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
                          className="bg-transparent border-none p-0 focus:ring-0 cursor-pointer print:text-[10px]"
                        />
                      </div>
                    </div>
                      <textarea 
                      dir="auto"
                      value={session.objectif}
                      onChange={(e) => handleSessionChange(session.id, 'objectif', e.target.value)}
                      className="w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-slate-700 print:text-[12px] print:leading-tight"
                      placeholder="Objectif de la séance..."
                      rows={2}
                    />
                  </div>

                  <div className="flex-1 border border-slate-200 rounded-xl p-4 relative print:p-2 print:rounded-lg">
                    <div className="absolute -top-3 left-4 bg-[#FFF4B0] px-3 py-0.5 rounded-md text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm border border-[#FFE55C] print:px-2 print:py-0 print:-top-2 print:text-[9px]">
                      <Edit2 size={10} className="print:w-2.5 print:h-2.5" />
                      Bilan
                    </div>
                    
                    <BilanInput 
                      value={session.bilan}
                      onChange={(val) => handleSessionChange(session.id, 'bilan', val)}
                      allSessions={sessions}
                      objectif={session.objectif}
                    />
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print bg-white/90 p-1 rounded-md shadow-sm border border-slate-100">
                <button 
                  onClick={() => handleSessionChange(session.id, 'completed', !session.completed)}
                  className={`p-1.5 rounded-md transition-colors ${session.completed ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                  title={session.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
                >
                  <CheckCircle size={14} />
                </button>
                <button 
                  onClick={() => setSessionToDelete(session.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Supprimer la séance"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            );
          })}

          <div className="pt-4 no-print flex justify-center">
            <button 
              onClick={addSession}
              className="flex items-center gap-2 text-sm bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus size={16} />
              Ajouter une séance
            </button>
          </div>
        </section>

        {/* Signatures Section */}
        <section className="mt-16 grid grid-cols-3 gap-4 text-center print:mt-8 bg-transparent p-0">
          <div className="flex flex-col items-center w-full">
            <span className="font-bold uppercase tracking-widest text-[9px] text-slate-500 mb-6 print:text-slate-800">L'Inspecteur</span>
            <div className="w-full max-w-[10rem] h-px bg-slate-300 print:bg-slate-400"></div>
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="font-bold uppercase tracking-widest text-[9px] text-slate-500 mb-6 print:text-slate-800">Le Directeur</span>
            <div className="w-full max-w-[10rem] h-px bg-slate-300 print:bg-slate-400"></div>
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="font-bold uppercase tracking-widest text-[9px] text-slate-500 mb-6 print:text-slate-800">L'Enseignant</span>
            <div className="w-full max-w-[10rem] h-px bg-slate-300 print:bg-slate-400"></div>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {sessionToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Supprimer la séance ?</h3>
                <p className="text-sm text-slate-500">Cette action est irréversible. Voulez-vous vraiment supprimer cette séance ?</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDeleteSession}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
