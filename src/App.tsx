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
  ULTIMATE_FRISBEE_SESSIONS_BY_LEVEL
} from './constants';
import { HeaderInfo, Session } from './types';
import { Printer, Save, Plus, Trash2, Edit2, FileDown, FileUp, CheckCircle, XCircle, Download, ChevronDown, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';

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
      seanceNumber: sessions.length > 0 ? Math.max(...sessions.map((s, i) => s.seanceNumber || (i + 1))) + 1 : 1,
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
      setSessions(sessions.filter(s => s.id !== id));
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation - No Print */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 no-print shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-blue-600 text-white p-1.5 rounded-md">
            <CheckCircle size={20} />
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
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center no-print">
            <h2 className="text-lg font-semibold text-slate-800">Informations Générales</h2>
            <button 
              onClick={() => setIsEditingHeader(!isEditingHeader)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Edit2 size={16} />
              {isEditingHeader ? 'Terminer l\'édition' : 'Modifier'}
            </button>
          </div>

          <div className="hidden print:block text-center py-2 text-lg font-bold border-b border-slate-200 mb-2">
            Cahier de Textes - {headerInfo.teacher}
          </div>

          <div className="p-6 print:p-2">
            {isEditingHeader ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nom du Professeur</label>
                  <input
                    type="text"
                    name="teacher"
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
                    value={headerInfo.classe}
                    onChange={handleHeaderChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 print:gap-y-2 print:gap-x-2">
                <div className="col-span-2 md:col-span-3 text-center mb-4 no-print">
                  <h3 className="text-xl font-bold text-slate-800">{headerInfo.teacher}</h3>
                </div>
                
                <div className="flex flex-col border-l-4 border-blue-500 pl-3 print:border-l-2 print:pl-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-[10px]">Niveau scolaire</span>
                  <span className="text-base font-medium text-slate-900 print:text-sm">{headerInfo.niveauScolaire || '-'}</span>
                </div>
                <div className="flex flex-col border-l-4 border-blue-500 pl-3 print:border-l-2 print:pl-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-[10px]">Module d'enseignement</span>
                  <span className="text-base font-medium text-slate-900 print:text-sm">{headerInfo.moduleEnseignement || '-'}</span>
                </div>
                <div className="flex flex-col border-l-4 border-blue-500 pl-3 print:border-l-2 print:pl-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-[10px]">Famille d'APS</span>
                  <span className="text-base font-medium text-slate-900 print:text-sm">{headerInfo.familleAPS || '-'}</span>
                </div>
                <div className="flex flex-col border-l-4 border-blue-500 pl-3 print:border-l-2 print:pl-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-[10px]">APS support</span>
                  <span className="text-base font-medium text-slate-900 print:text-sm">{headerInfo.apsSupport || '-'}</span>
                </div>
                <div className="flex flex-col border-l-4 border-blue-500 pl-3 print:border-l-2 print:pl-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-[10px]">Classe</span>
                  <span className="text-base font-medium text-slate-900 print:text-sm">{headerInfo.classe || '-'}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sessions Table Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center no-print">
            <h2 className="text-lg font-semibold text-slate-800">Planification des Séances</h2>
            <button 
              onClick={addSession}
              className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              <Plus size={16} />
              Ajouter une séance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-blue-500 text-white text-sm print:text-[10px]">
                  <th className="px-4 py-3 print:px-1 print:py-1 font-semibold border border-blue-600 w-[15%]">Séquences</th>
                  <th className="px-4 py-3 print:px-1 print:py-1 font-semibold border border-blue-600 w-10 text-center">N°</th>
                  <th className="px-4 py-3 print:px-1 print:py-1 font-semibold border border-blue-600 w-[45%]">Objectifs</th>
                  <th className="px-4 py-3 print:px-1 print:py-1 font-semibold border border-blue-600 w-32">Date & Heure</th>
                  <th className="px-4 py-3 print:px-1 print:py-1 font-semibold border border-blue-600 w-[15%]">Bilan / Observations</th>
                  <th className="px-4 py-3 print:px-1 print:py-1 font-semibold border border-blue-600 w-16 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sessions.map((session, index) => {
                  // Check if previous session has same sequence to visually group them
                  const isSameSequenceAsPrev = index > 0 && sessions[index - 1].sequence === session.sequence;
                  
                  return (
                    <tr key={session.id} className={`hover:bg-slate-50 transition-colors ${session.completed ? 'bg-emerald-50/30' : ''}`}>
                      <td className={`px-4 py-3 print:px-1 print:py-1 border border-slate-200 align-top ${isSameSequenceAsPrev ? 'text-transparent border-t-transparent' : 'font-medium text-slate-800'}`}>
                        <textarea 
                          value={session.sequence}
                          onChange={(e) => handleSessionChange(session.id, 'sequence', e.target.value)}
                          className={`w-full bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 print:p-0 text-xs leading-tight ${isSameSequenceAsPrev ? 'text-transparent' : 'text-slate-800'}`}
                          rows={3}
                        />
                      </td>
                      <td className="px-4 py-3 print:px-1 print:py-1 border border-slate-200 text-center align-top font-medium text-slate-600">
                        <input 
                          type="number" 
                          value={session.seanceNumber || (index + 1)}
                          onChange={(e) => handleSessionChange(session.id, 'seanceNumber', parseInt(e.target.value) || 0)}
                          className="w-full text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 print:p-0"
                        />
                      </td>
                      <td className="px-4 py-3 print:px-1 print:py-1 border border-slate-200 align-top">
                        <textarea 
                          value={session.objectif}
                          onChange={(e) => handleSessionChange(session.id, 'objectif', e.target.value)}
                          className="w-full bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 print:p-0 min-h-[60px] text-xs leading-relaxed"
                        />
                      </td>
                      <td className="px-4 py-3 print:px-1 print:py-1 border border-slate-200 align-top space-y-2 print:space-y-1">
                        <input 
                          type="date" 
                          value={session.date}
                          onChange={(e) => handleSessionChange(session.id, 'date', e.target.value)}
                          className="w-full bg-transparent border border-slate-200 print:border-none rounded p-1 text-[10px] print:text-[8px] focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex flex-col gap-1">
                          <input 
                            type="time" 
                            value={session.heure}
                            onChange={(e) => handleSessionChange(session.id, 'heure', e.target.value)}
                            className="w-full bg-transparent border border-slate-200 print:border-none rounded p-1 text-[10px] print:text-[8px] focus:outline-none focus:border-blue-500"
                          />
                          <input 
                            type="text" 
                            placeholder="Durée"
                            value={session.duree}
                            onChange={(e) => handleSessionChange(session.id, 'duree', e.target.value)}
                            className="w-full bg-transparent border border-slate-200 print:border-none rounded p-1 text-[10px] print:text-[8px] focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 print:px-1 print:py-1 border border-slate-200 align-top">
                        <textarea 
                          placeholder="Observations..."
                          value={session.bilan}
                          onChange={(e) => handleSessionChange(session.id, 'bilan', e.target.value)}
                          className="w-full bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 print:p-0 min-h-[40px] text-[10px] leading-tight"
                        />
                      </td>
                      <td className="px-4 py-3 border border-slate-200 align-middle text-center no-print">
                        <div className="flex flex-col items-center gap-2">
                          <button 
                            onClick={() => handleSessionChange(session.id, 'completed', !session.completed)}
                            className={`p-1.5 rounded-md transition-colors ${session.completed ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                            title={session.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => deleteSession(session.id)}
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                            title="Supprimer la séance"
                          >
                            <Trash2 size={16} />
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
        <section className="mt-12 hidden print:grid grid-cols-3 gap-8 text-center text-sm font-medium text-slate-600">
          <div className="space-y-12">
            <p>Signature et observations de l'Inspecteur :</p>
            <div className="border-b border-dotted border-slate-400"></div>
            <div className="border-b border-dotted border-slate-400"></div>
          </div>
          <div className="space-y-12">
            <p>Signature et observations du Directeur :</p>
            <div className="border-b border-dotted border-slate-400"></div>
            <div className="border-b border-dotted border-slate-400"></div>
          </div>
          <div className="space-y-12">
            <p>Signature et observations du Professeur :</p>
            <div className="border-b border-dotted border-slate-400"></div>
            <div className="border-b border-dotted border-slate-400"></div>
          </div>
        </section>

      </main>
    </div>
  );
}
