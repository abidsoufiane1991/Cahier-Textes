import React, { useState, useEffect, useRef } from 'react';
import { 
  INITIAL_HEADER, 
  INITIAL_SESSIONS, 
  MODULES_BY_LEVEL, 
  APS_BY_FAMILY,
  COMMON_OBSERVATIONS,
  VOLLEYBALL_SESSIONS_BY_LEVEL,
  HANDBALL_SESSIONS_BY_LEVEL,
  BASKETBALL_SESSIONS_BY_LEVEL,
  FOOTBALL_SESSIONS_BY_LEVEL,
  RUGBY_SESSIONS_BY_LEVEL,
  ULTIMATE_FRISBEE_SESSIONS_BY_LEVEL,
  ATHLETISME_SESSIONS_BY_LEVEL,
  GYMNASTIQUE_SESSIONS_BY_LEVEL,
  STRATEGIE_SESSIONS_BY_LEVEL,
  RACKET_SESSIONS_BY_LEVEL
} from './constants';
import { HeaderInfo, Session } from './types';
import { BookOpen, Plus, Printer, Trash2, Database, WifiOff, HardDrive, CloudOff, RefreshCw, CheckCircle, Circle, Edit3, X, Save, Download, Upload, Calendar, Clock, Target, ListChecks, User, Building, BadgeCheck } from 'lucide-react';
import { supabase } from './lib/supabase';

function BilanInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          autoResize(e);
        }}
        onFocus={(e) => {
          setShowSuggestions(true);
          autoResize(e as any);
        }}
        className="w-full bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1 -ml-2 text-slate-700 min-h-[60px] overflow-hidden leading-relaxed"
        placeholder="Bilan de la séance..."
        rows={1}
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {COMMON_OBSERVATIONS.map((obs, idx) => (
            <div
              key={idx}
              className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer"
              onClick={() => {
                const newValue = value ? `${value}\n${obs}` : obs;
                onChange(newValue);
                setShowSuggestions(false);
              }}
            >
              {obs}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>(INITIAL_HEADER);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<'synced' | 'saving' | 'idle' | 'error'>('idle');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'local'>('checking');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get('id');

        if (!supabase) {
          setDbStatus('local');
          const savedHeader = localStorage.getItem('cahier_header');
          const savedSessions = localStorage.getItem('cahier_sessions');
          if (savedHeader) setHeaderInfo(JSON.parse(savedHeader));
          if (savedSessions) setSessions(JSON.parse(savedSessions));
          return;
        }

        if (docId) {
          const { data, error } = await supabase
            .from('cahier_documents')
            .select('*')
            .eq('id', docId)
            .single();

          if (error) throw error;

          if (data) {
            setHeaderInfo(data.header_info);
            setSessions(data.sessions);
            setDbStatus('connected');
          }
        } else {
          setDbStatus('connected');
          const savedHeader = localStorage.getItem('cahier_header');
          const savedSessions = localStorage.getItem('cahier_sessions');
          if (savedHeader) setHeaderInfo(JSON.parse(savedHeader));
          if (savedSessions) setSessions(JSON.parse(savedSessions));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setDbStatus('error');
        const savedHeader = localStorage.getItem('cahier_header');
        const savedSessions = localStorage.getItem('cahier_sessions');
        if (savedHeader) setHeaderInfo(JSON.parse(savedHeader));
        if (savedSessions) setSessions(JSON.parse(savedSessions));
      }
    };

    loadData();
  }, []);

  // Auto-save
  useEffect(() => {
    const saveData = async () => {
      if (dbStatus === 'checking') return;

      setSyncState('saving');
      
      try {
        localStorage.setItem('cahier_header', JSON.stringify(headerInfo));
        localStorage.setItem('cahier_sessions', JSON.stringify(sessions));

        if (supabase && dbStatus !== 'local') {
          const urlParams = new URLSearchParams(window.location.search);
          const docId = urlParams.get('id');

          if (docId) {
            const { error } = await supabase
              .from('cahier_documents')
              .update({ header_info: headerInfo, sessions: sessions })
              .eq('id', docId);
            if (error) throw error;
          } else {
            const { data, error } = await supabase
              .from('cahier_documents')
              .insert([{ header_info: headerInfo, sessions: sessions }])
              .select()
              .single();
            
            if (error) throw error;
            if (data) {
              window.history.replaceState({}, '', `?id=${data.id}`);
            }
          }
          setDbStatus('connected');
        }
        setSyncState('synced');
      } catch (error) {
        console.error('Error saving data:', error);
        setSyncState('error');
        if (supabase) setDbStatus('error');
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [headerInfo, sessions, dbStatus]);

  const updateSessionsForAPS = (aps: string, level: string) => {
    let newSessionsData: Omit<Session, 'id' | 'date' | 'bilan' | 'completed'>[] = [];
    
    if (aps === 'Volleyball') newSessionsData = VOLLEYBALL_SESSIONS_BY_LEVEL[level] || [];
    else if (aps === 'Handball') newSessionsData = HANDBALL_SESSIONS_BY_LEVEL[level] || [];
    else if (aps === 'Basketball') newSessionsData = BASKETBALL_SESSIONS_BY_LEVEL[level] || [];
    else if (aps === 'Football') newSessionsData = FOOTBALL_SESSIONS_BY_LEVEL[level] || [];
    else if (aps === 'Rugby') newSessionsData = RUGBY_SESSIONS_BY_LEVEL[level] || [];
    else if (aps === 'Ultimate Frisbee') newSessionsData = ULTIMATE_FRISBEE_SESSIONS_BY_LEVEL[level] || [];
    else if (['Tennis', 'Tennis de table', 'Badminton'].includes(aps)) newSessionsData = RACKET_SESSIONS_BY_LEVEL[level] || [];
    else if (['Course de vitesse', 'Course de demi-fond', 'Course de haies', 'Course de relais', 'Saut en longueur', 'Saut en hauteur', 'Triple saut'].includes(aps)) newSessionsData = ATHLETISME_SESSIONS_BY_LEVEL[level] || [];
    else if (['Gym au sol', 'Acrogym'].includes(aps)) newSessionsData = GYMNASTIQUE_SESSIONS_BY_LEVEL[level] || [];
    else if (aps === 'Échecs') newSessionsData = STRATEGIE_SESSIONS_BY_LEVEL[level] || [];

    if (newSessionsData.length > 0) {
      const newSessions: Session[] = newSessionsData.map((data, index) => ({
        id: crypto.randomUUID(),
        ...data,
        date: '',
        bilan: '',
        completed: false
      }));
      setSessions(newSessions);
    }
  };

  const handleHeaderChange = (field: keyof HeaderInfo, value: string) => {
    const newHeaderInfo = { ...headerInfo, [field]: value };
    
    if (field === 'niveauScolaire') {
      const firstModule = MODULES_BY_LEVEL[value]?.[0] || "";
      newHeaderInfo.moduleEnseignement = firstModule;
      updateSessionsForAPS(newHeaderInfo.apsSupport, value);
    } else if (field === 'familleAPS') {
      const firstAPS = APS_BY_FAMILY[value]?.[0] || "";
      newHeaderInfo.apsSupport = firstAPS;
      updateSessionsForAPS(firstAPS, newHeaderInfo.niveauScolaire);
    } else if (field === 'apsSupport') {
      updateSessionsForAPS(value, newHeaderInfo.niveauScolaire);
    }
    
    setHeaderInfo(newHeaderInfo);
  };

  const addSession = (isNewSequence: boolean = false) => {
    const lastSequence = sessions.length > 0 ? sessions[sessions.length - 1].sequence : '';
    const newSession: Session = {
      id: crypto.randomUUID(),
      sequence: isNewSequence ? 'NOUVELLE SÉQUENCE' : lastSequence,
      seanceNumber: sessions.length + 1,
      objectif: '',
      date: '',
      duree: '1h',
      bilan: '',
      completed: false
    };
    setSessions([...sessions, newSession]);
  };

  const updateSequenceBlock = (startIndex: number, oldSequence: string, newSequence: string) => {
    const newSessions = [...sessions];
    for (let i = startIndex; i < newSessions.length; i++) {
      if (newSessions[i].sequence === oldSequence) {
        newSessions[i].sequence = newSequence;
      } else {
        break;
      }
    }
    setSessions(newSessions);
  };

  const updateSession = (id: string, field: keyof Session, value: any) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar */}
      <div className="bg-[#1e1b4b] text-white px-6 py-3 flex items-center justify-between shadow-md print:hidden sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/30 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-300" />
          </div>
          <h1 className="font-semibold text-lg tracking-wide">Cahier de Textes EPS Pro</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
            {dbStatus === 'checking' && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Vérification...
              </span>
            )}
            {dbStatus === 'connected' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Database className="w-3.5 h-3.5" />
                Supabase Connecté
              </span>
            )}
            {dbStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-400">
                <WifiOff className="w-3.5 h-3.5" />
                Erreur Connexion
              </span>
            )}
            {dbStatus === 'local' && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <HardDrive className="w-3.5 h-3.5" />
                Mode Local
              </span>
            )}
            
            <div className="w-px h-3 bg-white/20 mx-1"></div>
            
            {syncState === 'saving' && (
              <span className="flex items-center gap-1.5 text-blue-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Enregistrement...
              </span>
            )}
            {syncState === 'synced' && (
              <span className="flex items-center gap-1.5 text-slate-300">
                Sauvegardé
              </span>
            )}
            {syncState === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-400">
                <CloudOff className="w-3.5 h-3.5" />
                Erreur
              </span>
            )}
          </div>

          <button 
            onClick={() => setIsEditingHeader(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Modifier l'en-tête
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-8 print:p-0 print:max-w-none">
        {/* Header Section */}
        <div className="bg-white mb-6 print:mb-4">
          <div className="flex justify-between items-center mb-6 print:mb-4">
            <div className="text-right font-bold text-slate-500 text-sm w-1/2" dir="rtl">
              {headerInfo.schoolName}
            </div>
            <div className="text-left font-bold text-slate-500 text-sm w-1/2" dir="rtl">
              {headerInfo.directorateName}
            </div>
          </div>
          
          <div className="flex justify-between items-end border-b border-slate-200 pb-2 px-2">
            <div className="w-1/4">
              <p className="text-xs text-slate-800 font-bold mb-2">Niveau scolaire</p>
              <p className="text-sm font-bold text-blue-900">{headerInfo.niveauScolaire}</p>
            </div>
            <div className="text-center w-1/2 px-4">
              <p className="text-xs text-slate-800 font-bold mb-2">Module d'enseignement</p>
              <p className="text-sm font-bold text-blue-900">{headerInfo.moduleEnseignement}</p>
            </div>
            <div className="text-right w-1/8 pr-8">
              <p className="text-xs text-slate-800 font-bold mb-2">APS support</p>
              <p className="text-sm font-bold text-blue-900">{headerInfo.apsSupport}</p>
            </div>
            <div className="text-right w-1/8">
              <p className="text-xs text-slate-800 font-bold mb-2">Classe</p>
              <p className="text-sm font-bold text-blue-900">{headerInfo.classe || '.........'}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-700 text-white text-xs uppercase tracking-wider font-bold print:bg-slate-100 print:text-slate-800 print:border-y-2 print:border-slate-800 print:text-[10px]">
                  <th className="px-2 py-2 text-center border-r border-blue-600 print:border-slate-800 w-40">SÉQUENCES</th>
                  <th className="px-1 py-2 text-center border-r border-blue-600 print:border-slate-800 w-8">N°</th>
                  <th className="px-2 py-2 text-center border-r border-blue-600 print:border-slate-800">OBJECTIFS</th>
                  <th className="px-2 py-2 text-center border-r border-blue-600 print:border-slate-800 w-24">DATE</th>
                  <th className="px-2 py-2 text-center border-r border-blue-600 print:border-slate-800 w-40">BILAN</th>
                </tr>
              </thead>
              <tbody className="border-b border-slate-200 print:border-slate-800 print:text-[11px]">
                {sessions.map((session, index) => {
                  const isFirstOfSequence = index === 0 || session.sequence !== sessions[index - 1].sequence;
                  
                  let rowSpan = 1;
                  if (isFirstOfSequence) {
                    for (let i = index + 1; i < sessions.length; i++) {
                      if (sessions[i].sequence === session.sequence) {
                        rowSpan++;
                      } else {
                        break;
                      }
                    }
                  }
                  
                  return (
                    <tr key={session.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors group print:border-slate-800 relative">
                      {isFirstOfSequence && (
                        <td 
                          rowSpan={rowSpan} 
                          className="px-2 py-2 align-middle text-center border-r border-slate-200 bg-blue-50/30 print:border-slate-800 print:bg-transparent"
                        >
                          <textarea
                            value={session.sequence}
                            onChange={(e) => updateSequenceBlock(index, session.sequence, e.target.value)}
                            className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded p-1 text-blue-900 font-semibold text-sm text-center resize-none print:text-slate-800 print:text-[11px]"
                            placeholder="Séquence..."
                            rows={2}
                          />
                        </td>
                      )}
                      <td className="px-1 py-2 align-middle text-center border-r border-slate-200 font-bold text-blue-700 print:border-slate-800 print:text-slate-800 relative">
                        {session.seanceNumber}
                        <button
                          onClick={() => setSessionToDelete(session.id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 print:hidden"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-2 py-2 align-middle border-r border-slate-200 print:border-slate-800">
                        <textarea
                          value={session.objectif}
                          onChange={(e) => {
                            updateSession(session.id, 'objectif', e.target.value);
                            autoResize(e);
                          }}
                          onFocus={autoResize}
                          className="w-full bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded p-1 text-slate-700 text-sm min-h-[30px] overflow-hidden leading-relaxed print:text-[11px] print:min-h-[20px]"
                          placeholder="Objectif de la séance..."
                          rows={1}
                        />
                      </td>
                      <td className="px-2 py-2 align-middle border-r border-slate-200 print:border-slate-800">
                        <input
                          type="date"
                          value={session.date}
                          onChange={(e) => updateSession(session.id, 'date', e.target.value)}
                          className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded p-1 text-slate-700 text-sm print:hidden text-center"
                        />
                        <span className="hidden print:block text-slate-700 text-[11px] text-center">
                          {session.date ? new Date(session.date).toLocaleDateString('fr-FR') : ''}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-middle border-r border-slate-200 print:border-slate-800">
                        <BilanInput
                          value={session.bilan}
                          onChange={(val) => updateSession(session.id, 'bilan', val)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Add row buttons at the bottom of the table */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 print:hidden flex gap-3">
            <button
              onClick={() => addSession(false)}
              className="flex-1 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter une séance
            </button>
            <button
              onClick={() => addSession(true)}
              className="flex-1 py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-500 font-medium hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle séquence
            </button>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="mt-8 flex justify-between px-8 print:mt-4 print:px-4">
          <div className="flex flex-col items-center w-48">
            <div className="bg-slate-50 border border-slate-200 px-6 py-1.5 mb-4 print:bg-slate-100">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">L'ENSEIGNANT</span>
            </div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2">{headerInfo.teacher}</span>
            <div className="w-full border-b-2 border-dotted border-slate-400"></div>
          </div>
          <div className="flex flex-col items-center w-48">
            <div className="bg-slate-50 border border-slate-200 px-6 py-1.5 mb-8 print:bg-slate-100">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">LA DIRECTION</span>
            </div>
            <div className="w-full border-b-2 border-dotted border-slate-400"></div>
          </div>
          <div className="flex flex-col items-center w-48">
            <div className="bg-slate-50 border border-slate-200 px-6 py-1.5 mb-8 print:bg-slate-100">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">L'INSPECTEUR</span>
            </div>
            <div className="w-full border-b-2 border-dotted border-slate-400"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center print:mt-4">
          <p className="text-[10px] text-slate-400 font-medium">{headerInfo.schoolYear}</p>
        </div>
      </div>

      {/* Header Edit Modal */}
      {isEditingHeader && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Modifier l'en-tête</h2>
              <button 
                onClick={() => setIsEditingHeader(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Enseignant</label>
                <input
                  type="text"
                  value={headerInfo.teacher}
                  onChange={(e) => handleHeaderChange('teacher', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Classe</label>
                <input
                  type="text"
                  value={headerInfo.classe}
                  onChange={(e) => handleHeaderChange('classe', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Ex: Tronc Commun 1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Établissement</label>
                <input
                  type="text"
                  value={headerInfo.schoolName}
                  onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Direction</label>
                <input
                  type="text"
                  value={headerInfo.directorateName}
                  onChange={(e) => handleHeaderChange('directorateName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Année Scolaire</label>
                <input
                  type="text"
                  value={headerInfo.schoolYear}
                  onChange={(e) => handleHeaderChange('schoolYear', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Niveau Scolaire</label>
                <select
                  value={headerInfo.niveauScolaire}
                  onChange={(e) => handleHeaderChange('niveauScolaire', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {Object.keys(MODULES_BY_LEVEL).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Module d'enseignement</label>
                <select
                  value={headerInfo.moduleEnseignement}
                  onChange={(e) => handleHeaderChange('moduleEnseignement', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {MODULES_BY_LEVEL[headerInfo.niveauScolaire]?.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Famille APS</label>
                <select
                  value={headerInfo.familleAPS}
                  onChange={(e) => handleHeaderChange('familleAPS', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {Object.keys(APS_BY_FAMILY).map(famille => (
                    <option key={famille} value={famille}>{famille}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">APS Support</label>
                <select
                  value={headerInfo.apsSupport}
                  onChange={(e) => handleHeaderChange('apsSupport', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {APS_BY_FAMILY[headerInfo.familleAPS]?.map(aps => (
                    <option key={aps} value={aps}>{aps}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsEditingHeader(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Supprimer la séance ?</h3>
            <p className="text-slate-600 mb-6">Êtes-vous sûr de vouloir supprimer cette séance ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  removeSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
