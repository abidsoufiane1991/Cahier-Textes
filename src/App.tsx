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
import { Printer, Save, Plus, Trash2, Edit2, FileDown, FileUp, CheckCircle, Download, User, GraduationCap, Calendar, Cloud, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';

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
        className="w-full bg-transparent resize-none focus:outline-none text-sm text-slate-700 min-h-[24px] h-[24px] bilan-textarea"
        rows={1}
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
      
      if (docId && import.meta.env.VITE_SUPABASE_URL) {
        try {
          const { data, error } = await supabase
            .from('cahier_documents')
            .select('*')
            .eq('id', docId)
            .single();
            
          if (data) {
            setHeaderInfo(data.header_info);
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
      if (savedHeader) setHeaderInfo(JSON.parse(savedHeader));
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
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
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
                  <strong className="text-slate-700">Support :</strong> {headerInfo.apsSupport || '-'}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Sessions List Section */}
        <section className="space-y-12 print:space-y-6">
          {sessions.map((session, index) => {
            const showSequence = index === 0 || session.sequence !== sessions[index - 1].sequence;
            
            return (
            <div key={session.id} className="group relative flex gap-4 print:gap-4">
              {/* Timeline Column */}
              <div className="flex flex-col items-end w-14 shrink-0 text-[11px] font-semibold text-slate-600 relative pt-1.5 print:pt-1">
                <input 
                  type="time" 
                  lang="fr-FR"
                  value={session.heure}
                  onChange={(e) => handleSessionChange(session.id, 'heure', e.target.value)}
                  className="w-full text-right bg-transparent border-none p-0 focus:ring-0 cursor-pointer print:text-[10px]"
                />
                <div className="absolute top-7 bottom-6 right-1 w-px bg-slate-200 print:bg-slate-300"></div>
                <span className="mt-auto text-slate-400 print:text-[10px]">
                  {session.heure ? `${String(parseInt(session.heure.split(':')[0]) + parseInt(session.duree || '1')).padStart(2, '0')}h${session.heure.split(':')[1] || '00'}` : '--h--'}
                </span>
              </div>

              {/* Content Column */}
              <div className="flex-1 pb-6 print:pb-4">
                {showSequence && (
                  <div className="mb-4 print:mb-2">
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

                <div className="mb-4 print:mb-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="text-[11px] font-bold text-[#0B1021] uppercase tracking-wider">Objectif :</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-md print:bg-transparent print:border print:border-indigo-200">
                      Séance {session.seanceNumber}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md print:bg-transparent print:p-0 print:text-[10px]">
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
                    className="w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-slate-700 print:text-[11px]"
                    placeholder="Objectif de la séance..."
                    rows={2}
                  />
                </div>

                <div className="border border-slate-200 rounded-xl p-5 relative mt-6 print:mt-3 print:p-3">
                  <div className="absolute -top-3 left-5 bg-[#FFF4B0] px-3 py-0.5 rounded-md text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm border border-[#FFE55C]">
                    <Edit2 size={12} />
                    Bilan
                  </div>
                  
                  <BilanInput 
                    value={session.bilan}
                    onChange={(val) => handleSessionChange(session.id, 'bilan', val)}
                    allSessions={sessions}
                  />
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
                  onClick={() => deleteSession(session.id)}
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

      </main>
    </div>
  );
}
