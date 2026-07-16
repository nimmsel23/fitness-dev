import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, Inbox, Search, Activity, CheckCircle, Trash2, 
  ChevronRight, RefreshCw, Calendar, TrendingUp, Sparkles, 
  AlertTriangle, User, ExternalLink, FileText, Award, Info, Plus, ChevronDown
} from 'lucide-react';
import Model from 'react-body-highlighter';
import './index.css';

// Same-origin in Prod (api.py served dist/), Vite-Proxy in Dev — kein Prefix nötig.
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Muscle ID → visualization slug (react-body-highlighter)
const RBH_SLUGS = {
  // chest
  'chest': 'chest', 'pecs': 'chest', 'pectoralis': 'chest', 'pectoralis major': 'chest', 'pectoralis_major': 'chest', 'pectoralis minor': 'chest', 'pectoralis_minor': 'chest', 'serratus': 'serratus-anterior', 'serratus_anterior': 'serratus-anterior',
  // back
  'back': 'upper-back', 'lats': 'latissimus', 'latissimus': 'latissimus', 'latissimus dorsi': 'latissimus', 'latissimus_dorsi': 'latissimus',
  'traps': 'traps', 'trapezius': 'traps', 'rhomboids': 'rhomboids',
  'lower-back': 'lower-back', 'erector spinae': 'lower-back', 'erector_spinae': 'lower-back',
  // shoulders
  'shoulders': 'front-deltoids', 'delts': 'front-deltoids', 'deltoid': 'front-deltoids', 'front-deltoids': 'front-deltoids', 'anterior_deltoid': 'front-deltoids', 'lateral_deltoid': 'front-deltoids',
  'rear-deltoids': 'back-deltoids', 'posterior_deltoid': 'back-deltoids', 'back-deltoids': 'back-deltoids',
  // arms
  'biceps': 'biceps', 'biceps brachii': 'biceps', 'biceps_brachii': 'biceps', 'brachialis': 'biceps',
  'triceps': 'triceps', 'triceps brachii': 'triceps', 'triceps_brachii': 'triceps',
  'forearm': 'forearm', 'forearms': 'forearm', 'brachioradialis': 'forearm',
  // core
  'abs': 'abs', 'core': 'abs', 'rectus abdominis': 'abs', 'rectus_abdominis': 'abs',
  'obliques': 'obliques', 'obliquus': 'obliques', 'obliquus_externus': 'obliques',
  // legs
  'glutes': 'gluteal', 'gluteus': 'gluteal', 'gluteus maximus': 'gluteal', 'gluteus_maximus': 'gluteal', 'gluteus_medius': 'gluteal',
  'quads': 'quadriceps', 'quadriceps': 'quadriceps', 'rectus femoris': 'quadriceps', 'rectus_femoris': 'quadriceps', 'vastus_lateralis': 'quadriceps', 'vastus_medialis': 'quadriceps',
  'hamstrings': 'hamstring', 'hamstring': 'hamstring', 'biceps femoris': 'hamstring', 'biceps_femoris': 'hamstring', 'semitendinosus': 'hamstring',
  'calves': 'calves', 'gastrocnemius': 'calves', 'soleus': 'calves',
};

function getRbhSlug(muscleName) {
  if (!muscleName) return null;
  const clean = muscleName.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
  
  if (RBH_SLUGS[clean]) return RBH_SLUGS[clean];
  
  const standardSlugs = ['chest', 'upper-back', 'lower-back', 'biceps', 'triceps', 'forearm', 'abs', 'obliques', 'gluteal', 'hamstring', 'quadriceps', 'calves', 'front-deltoids', 'back-deltoids', 'traps', 'rhomboids', 'adductors', 'latissimus'];
  for (const s of standardSlugs) {
    if (clean.includes(s)) return s;
  }
  
  if (clean.includes('pectoralis') || clean.includes('brust')) return 'chest';
  if (clean.includes('deltoid') || clean.includes('shoulder') || clean.includes('schulter')) {
    if (clean.includes('post') || clean.includes('rear') || clean.includes('hinter')) return 'back-deltoids';
    return 'front-deltoids';
  }
  if (clean.includes('lat') || clean.includes('rücken') || clean.includes('back')) return 'upper-back';
  if (clean.includes('glute')) return 'gluteal';
  if (clean.includes('quad') || clean.includes('oberschenkel')) return 'quadriceps';
  if (clean.includes('hamstring') || clean.includes('beinbeuger')) return 'hamstring';
  if (clean.includes('calf') || clean.includes('calves') || clean.includes('wade')) return 'calves';
  if (clean.includes('bicep')) return 'biceps';
  if (clean.includes('tricep')) return 'triceps';
  if (clean.includes('core') || clean.includes('abdominis')) return 'abs';
  
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [health, setHealth] = useState(null);
  const [selectedExId, setSelectedExId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Health-Check
  const checkHealth = useCallback(() => {
    api('/health')
      .then(() => setHealth(true))
      .catch(() => setHealth(false));
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Zeigt eine kurze Benachrichtigung an
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectExercise = (id) => {
    setSelectedExId(id);
    setActiveTab('browser');
  };

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-success/20 border-success/30 text-success' 
            : 'bg-danger/20 border-danger/30 text-danger'
        }`}>
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="font-mono text-sm">{notification.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 glass-panel m-4 flex flex-col rounded-2xl border-white/5 bg-surface/40">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-mono font-bold flex items-center gap-2 text-primary">
            <Database className="w-5 h-5" />
            Catalog UI
          </h1>
          <p className="text-[10px] text-muted font-mono mt-1 opacity-70">
            AlphaOS Fitness command center
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<Inbox />} label="Inbox" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
          <NavItem icon={<Search />} label="Browser" active={activeTab === 'browser'} onClick={() => setActiveTab('browser')} />
          <NavItem icon={<Calendar />} label="Plan Builder" active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
          <NavItem icon={<TrendingUp />} label="Weekly Review" active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} />
          <NavItem icon={<Activity />} label="Coverage" active={activeTab === 'coverage'} onClick={() => setActiveTab('coverage')} />
        </nav>

        <div className="p-4 border-t border-white/5 text-[11px] text-muted font-mono flex flex-col gap-1 bg-surface/20 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <span>Stack API:</span>
            <span className="text-primary">:9150</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Client:</span>
            <span className="text-success">:9160</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pl-0 flex flex-col overflow-hidden">
        <header className="glass-panel mb-4 p-4 px-6 flex items-center justify-between rounded-2xl border-white/5 bg-surface/40 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono capitalize tracking-wide text-text/90">{activeTab.replace('-', ' ')}</h2>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-muted">Dev-Server</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={checkHealth} 
              className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 text-muted transition-all active:scale-95"
              title="Verbindung prüfen"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className={`w-2 h-2 rounded-full ${health === null ? 'bg-muted animate-pulse' : health ? 'bg-success shadow-lg shadow-success/40' : 'bg-danger shadow-lg shadow-danger/40'}`}></span>
              <span className="text-xs text-muted font-mono">
                {health === null ? 'Prüfe Backend…' : health ? 'Backend verbunden' : 'Backend offline'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 glass-panel p-6 rounded-2xl border-white/5 bg-surface/20 overflow-hidden relative">
          {activeTab === 'inbox' && <InboxTab showToast={showToast} />}
          {activeTab === 'browser' && <BrowserTab selectedExId={selectedExId} setSelectedExId={setSelectedExId} showToast={showToast} />}
          {activeTab === 'plan' && <PlanTab onSelectExercise={handleSelectExercise} showToast={showToast} />}
          {activeTab === 'weekly' && <WeeklyTab showToast={showToast} />}
          {activeTab === 'coverage' && <CoverageTab />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-primary/20 text-primary border border-primary/30 shadow-inner shadow-primary/10 font-bold' 
          : 'text-muted border border-transparent hover:bg-white/5 hover:text-text'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5 shrink-0' })}
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );
}

// ── Visual Muscle Highlighter (using react-body-highlighter Model) ──
function VisualMuscleMap({ primaryMuscles = [], secondaryMuscles = [] }) {
  const [side, setSide] = useState('anterior'); // 'anterior' or 'posterior'

  // Map muscles to RBH format
  const rbhData = [];
  
  const primarySlugs = primaryMuscles.map(m => getRbhSlug(m)).filter(Boolean);
  const secondarySlugs = secondaryMuscles.map(m => getRbhSlug(m)).filter(Boolean);

  primarySlugs.forEach(slug => {
    rbhData.push({ name: slug, muscles: [slug], frequency: 2 });
  });

  secondarySlugs.forEach(slug => {
    if (!primarySlugs.includes(slug)) {
      rbhData.push({ name: slug, muscles: [slug], frequency: 1 });
    }
  });

  return (
    <div className="flex flex-col items-center p-4 bg-surface/50 border border-white/5 rounded-2xl shadow-inner">
      <div className="flex gap-1 p-1 bg-surface border border-white/10 rounded-xl mb-4 shrink-0 shadow-lg">
        <button
          onClick={() => setSide('anterior')}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all font-bold ${
            side === 'anterior' ? 'bg-primary text-text shadow-sm shadow-primary/45' : 'text-muted hover:text-text'
          }`}
        >
          Anterior
        </button>
        <button
          onClick={() => setSide('posterior')}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all font-bold ${
            side === 'posterior' ? 'bg-primary text-text shadow-sm shadow-primary/45' : 'text-muted hover:text-text'
          }`}
        >
          Posterior
        </button>
      </div>

      <div className="w-full flex justify-center py-2 min-h-[220px]">
        <Model
          type={side}
          data={rbhData}
          highlightedColors={['#fbbf24', '#f43f5e']} // index 0 is frequency 1 (Amber), index 1 is frequency 2 (Rose)
          bodyColor="#374151" // slate-700
          style={{ width: '130px', height: '220px' }}
        />
      </div>

      <div className="flex justify-center gap-4 mt-3 text-[10px] font-mono border-t border-white/5 pt-3 w-full shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e]"></span>
          <span className="text-muted font-bold">Primär</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#fbbf24]"></span>
          <span className="text-muted font-bold">Sekundär</span>
        </div>
      </div>
    </div>
  );
}

// ── Inbox: List & Review detail panel ──
function InboxTab({ showToast }) {
  const [items, setItems] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api('/fitness/inbox')
      .then((d) => {
        const list = d.items || [];
        setItems(list);
        if (list.length > 0) {
          // Keep selection if exists, else select first
          setSelectedItem(prev => list.find(it => it.id === prev?.id) || list[0]);
        } else {
          setSelectedItem(null);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = (id) => {
    api(`/fitness/inbox/${id}/approve`, { method: 'POST' })
      .then(() => {
        showToast('Eintrag erfolgreich freigegeben!', 'success');
        load();
      })
      .catch(err => showToast(`Fehler beim Freigeben: ${err.message}`, 'error'));
  };

  const remove = (id) => {
    if (!confirm('Eintrag wirklich löschen?')) return;
    api(`/fitness/inbox/${id}`, { method: 'DELETE' })
      .then(() => {
        showToast('Eintrag gelöscht', 'success');
        load();
      })
      .catch(err => showToast(`Fehler beim Löschen: ${err.message}`, 'error'));
  };

  if (error) return <ErrorBox msg={error} />;
  if (items === null && loading) return <Loading />;
  if (items && items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 border border-primary/20">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold font-mono">Inbox leer</h3>
        <p className="text-muted max-w-sm font-mono text-sm leading-relaxed">
          Keine offenen Katalog-Entwürfe. Neue unreviewed Exercises landen hier zur biomechanischen Freigabe.
        </p>
        <button 
          onClick={load}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Aktualisieren
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Left List */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-muted uppercase tracking-wider font-bold">
            Drafts ({items?.length || 0})
          </div>
          <button 
            onClick={load}
            disabled={loading}
            className="p-1 rounded hover:bg-white/5 text-muted transition-all active:scale-90"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {items?.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelectedItem(it)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                selectedItem?.id === it.id 
                  ? 'bg-primary/10 border-primary/30 shadow-md shadow-primary/5' 
                  : 'bg-surface/30 border-white/5 hover:border-white/10 hover:bg-surface/50'
              }`}
            >
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold truncate text-text/90">
                  {it.name || it.query || it.id}
                </div>
                <div className="text-[10px] text-muted font-mono truncate mt-1">
                  {it.file}{it.queued_at ? ` · ${it.queued_at.slice(0, 16).replace('T', ' ')}` : ''}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedItem?.id === it.id ? 'text-primary translate-x-1' : 'text-muted'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Right Details Panel */}
      {selectedItem && (
        <div className="w-[420px] bg-surface/30 border border-white/5 rounded-2xl p-6 flex flex-col h-full overflow-hidden shadow-2xl relative">
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            <div>
              <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary text-[9px] font-mono font-bold tracking-wider uppercase inline-block mb-2">
                {selectedItem.status || 'Draft'}
              </div>
              <h3 className="text-xl font-bold font-mono text-primary truncate" title={selectedItem.name || selectedItem.query}>
                {selectedItem.name || selectedItem.query}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-y border-white/5 py-4">
              <div>
                <span className="text-muted block font-mono text-[10px] uppercase font-bold">Muskelgruppe</span>
                <span className="font-mono text-text/80">{selectedItem.category || '—'}</span>
              </div>
              <div>
                <span className="text-muted block font-mono text-[10px] uppercase font-bold">Pattern</span>
                <span className="font-mono text-text/80">{selectedItem.movement_pattern || '—'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Primäre Muskeln</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedItem.primaryMuscles || selectedItem.primary_muscles) ? (
                    (selectedItem.primaryMuscles || selectedItem.primary_muscles).map((m, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs">
                        {m}
                      </span>
                    ))
                  ) : <span className="text-muted text-xs font-mono">—</span>}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Sekundäre Muskeln</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedItem.secondaryMuscles || selectedItem.secondary_muscles) ? (
                    (selectedItem.secondaryMuscles || selectedItem.secondary_muscles).map((m, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs">
                        {m}
                      </span>
                    ))
                  ) : <span className="text-muted text-xs font-mono">—</span>}
                </div>
              </div>
            </div>

            {selectedItem.coaching_notes && (
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-1.5">Coaching Notes</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-text/70 font-mono leading-relaxed">
                  {Array.isArray(selectedItem.coaching_notes) 
                    ? selectedItem.coaching_notes.map((n, idx) => <li key={idx}>{n}</li>)
                    : <li>{String(selectedItem.coaching_notes)}</li>
                  }
                </ul>
              </div>
            )}

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-1">Rohdaten (YAML/JSON)</h4>
              <pre className="text-[10px] font-mono bg-black/30 border border-white/5 rounded-xl p-3 text-muted overflow-x-auto whitespace-pre">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex gap-3 shrink-0">
            {selectedItem.status !== 'approved' && (
              <button
                onClick={() => approve(selectedItem.id)}
                className="flex-1 bg-success/20 border border-success/30 hover:bg-success/30 text-success py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" /> Freigeben
              </button>
            )}
            <button
              onClick={() => remove(selectedItem.id)}
              className="bg-danger/20 border border-danger/30 hover:bg-danger/30 text-danger px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Browser: Exercise Search & Details side panel ──
function BrowserTab({ selectedExId, setSelectedExId, showToast }) {
  const [all, setAll] = useState(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(null); // 'sheet' or 'lesson'

  // Alle Exercises laden
  useEffect(() => {
    api('/fitness/exercises/all')
      .then((d) => setAll(d.exercises || []))
      .catch((e) => setError(e.message));
  }, []);

  // Externe Suche (lokal + wger)
  useEffect(() => {
    if (q.length < 2) { setResults(null); return; }
    const t = setTimeout(() => {
      setLoading(true);
      api(`/exercises/search?q=${encodeURIComponent(q)}`)
        .then((d) => setResults(d.results || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Wenn von anderem Tab ein Exercise ID übergeben wurde
  useEffect(() => {
    if (selectedExId) {
      openDetail(selectedExId);
      setSelectedExId(null); // reset
    }
  }, [selectedExId]);

  const openDetail = (id) => {
    setDetail({ loading: true });
    api(`/exercise/${encodeURIComponent(id)}`)
      .then((d) => setDetail(d.exercise))
      .catch((e) => setDetail({ error: e.message }));
  };

  const handleExport = (id, type) => {
    setExportLoading(type);
    const endpoint = type === 'sheet' ? 'exercise_sheet' : 'exercise_lesson';
    const body = type === 'sheet' ? { query: id } : { exercise_id: id };
    
    api(`/fitness/export/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) {
          showToast(`Erfolgreich nach Obsidian exportiert! (${res.path.split('/').pop()})`, 'success');
        } else {
          showToast(`Fehler beim Export: ${res.detail || 'Fehler'}`, 'error');
        }
      })
      .catch((err) => showToast(`Verbindungsfehler: ${err.message}`, 'error'))
      .finally(() => setExportLoading(null));
  };

  if (error) return <ErrorBox msg={error} />;
  if (all === null) return <Loading />;

  const list = results ?? all;

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Left List */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="relative mb-4 shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Suche in ${all.length} Übungen… (lokal + wger fallback)`}
            className="w-full bg-surface/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-primary shadow-inner focus:ring-1 focus:ring-primary/30 transition-all text-text"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <RefreshCw className="w-3.5 h-3.5 text-muted animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {list.map((ex) => (
            <button
              key={ex.id || ex.canonical_id}
              onClick={() => openDetail(ex.id || ex.canonical_id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-left transition-all border ${
                detail?.id === (ex.id || ex.canonical_id)
                  ? 'bg-primary/10 border-primary/20 text-text font-medium'
                  : 'border-transparent text-text/80'
              }`}
            >
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold truncate">{ex.name || ex.display_name}</div>
                <div className="text-[11px] text-muted truncate mt-1">
                  {Array.isArray(ex.primaryMuscles || ex.primary_muscles) 
                    ? (ex.primaryMuscles || ex.primary_muscles).join(', ') 
                    : (ex.primaryMuscles || '')}
                  {ex.source ? ` · ${ex.source}` : ''}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted shrink-0 transition-transform ${detail?.id === (ex.id || ex.canonical_id) ? 'text-primary translate-x-1' : ''}`} />
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-muted font-mono text-sm p-4 text-center bg-white/5 rounded-xl border border-white/5">
              Keine Treffer in der Datenbank.
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Panel */}
      {detail && (
        <div className="w-[420px] bg-surface/30 border border-white/5 rounded-2xl p-6 overflow-y-auto shrink-0 flex flex-col h-full shadow-2xl space-y-5">
          {detail.loading ? (
            <Loading />
          ) : detail.error ? (
            <ErrorBox msg={detail.error} />
          ) : (
            <>
              <div>
                <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary text-[9px] font-mono font-bold tracking-wider uppercase inline-block mb-2">
                  {detail.source_file ? detail.source_file.replace('.yml', '') : 'Catalog'}
                </span>
                <h3 className="text-xl font-bold font-mono text-primary leading-tight">{detail.name}</h3>
              </div>

              {/* Visual BodyMap */}
              <VisualMuscleMap 
                primaryMuscles={detail.primaryMuscles || detail.primary_muscles || []} 
                secondaryMuscles={detail.secondaryMuscles || detail.secondary_muscles || []} 
              />

              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
                <Field label="ID" value={detail.id || detail.canonical_id} />
                <Field label="Pattern" value={detail.movement_pattern || '—'} />
                <Field label="Ausrüstung" value={Array.isArray(detail.equipment) ? detail.equipment.join(', ') : detail.equipment} />
                <Field label="Primär Muskeln" value={Array.isArray(detail.primaryMuscles || detail.primary_muscles) ? (detail.primaryMuscles || detail.primary_muscles).join(', ') : ''} />
                <Field label="Sekundär Muskeln" value={Array.isArray(detail.secondaryMuscles || detail.secondary_muscles) ? (detail.secondaryMuscles || detail.secondary_muscles).join(', ') : ''} />
              </div>

              {/* Action Buttons for Export */}
              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                <button
                  disabled={exportLoading !== null}
                  onClick={() => handleExport(detail.id || detail.canonical_id, 'sheet')}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-text py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {exportLoading === 'sheet' ? 'Exporte…' : 'Coach Sheet'}
                </button>
                <button
                  disabled={exportLoading !== null}
                  onClick={() => handleExport(detail.id || detail.canonical_id, 'lesson')}
                  className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Award className="w-3.5 h-3.5" />
                  {exportLoading === 'lesson' ? 'Exporte…' : 'Anatomy Lesson'}
                </button>
              </div>

              {detail.lesson && (
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Anatomie-Lesson (Enriched)
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-mono text-text/80 bg-black/20 p-3 rounded-xl border border-white/5 max-h-60 overflow-y-auto leading-relaxed">
                    {typeof detail.lesson === 'string' ? detail.lesson : JSON.stringify(detail.lesson, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Plan Builder Tab ──
function PlanTab({ onSelectExercise, showToast }) {
  const [template, setTemplate] = useState('push_day');
  const [goal, setGoal] = useState('hypertrophy');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const generatePlan = () => {
    setLoading(true);
    // Request an POST /fitness/plan
    api('/fitness/plan', {
      method: 'POST',
      body: JSON.stringify({ template, goal }),
    })
      .then(res => {
        if (res.ok && res.plan) {
          setPlan(res.plan);
          showToast('Plan erfolgreich generiert!', 'success');
        } else {
          showToast('Plan konnte nicht generiert werden.', 'error');
        }
      })
      .catch(err => showToast(`Fehler: ${err.message}`, 'error'))
      .finally(() => setLoading(false));
  };

  const handleExportPlan = () => {
    if (!plan) return;
    setExporting(true);
    api('/fitness/export/plan', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
      .then(res => {
        if (res.ok) {
          showToast(`Erfolgreich nach Obsidian exportiert! (${res.path.split('/').pop()})`, 'success');
        } else {
          showToast('Export fehlgeschlagen.', 'error');
        }
      })
      .catch(err => showToast(`Fehler: ${err.message}`, 'error'))
      .finally(() => setExporting(false));
  };

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Options Panel (Left) */}
      <div className="w-80 bg-surface/30 border border-white/5 rounded-2xl p-6 flex flex-col gap-5 shrink-0">
        <div>
          <h3 className="text-md font-bold font-mono text-primary uppercase tracking-wide">Optionen</h3>
          <p className="text-xs text-muted font-mono mt-0.5">Parameter für Plan-Generator</p>
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-text cursor-pointer"
            >
              <option value="push_day">Push Day</option>
              <option value="pull_day">Pull Day</option>
              <option value="legs_day">Legs Day</option>
              <option value="upper_day">Upper Day</option>
              <option value="lower_day">Lower Day</option>
              <option value="full_body">Full Body</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Ziel</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary text-text cursor-pointer"
            >
              <option value="hypertrophy">Hypertrophie (Muskelaufbau)</option>
              <option value="strength">Maximalkraft (Strength)</option>
              <option value="endurance">Kraftausdauer (Endurance)</option>
              <option value="hybrid">Hybrid (Strength & Size)</option>
            </select>
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full bg-primary text-text py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Plan generieren
        </button>
      </div>

      {/* Plan Details (Right) */}
      <div className="flex-1 bg-surface/30 border border-white/5 rounded-2xl p-6 flex flex-col h-full overflow-hidden shadow-2xl">
        {plan ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
              <div>
                <h3 className="text-lg font-bold font-mono text-primary">{plan.template || template}</h3>
                <span className="text-xs text-muted font-mono capitalize">Ziel: {plan.goal || goal}</span>
              </div>
              <button
                disabled={exporting}
                onClick={handleExportPlan}
                className="px-4 py-2 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                {exporting ? 'Speichert…' : 'In Obsidian speichern'}
              </button>
            </div>

            {/* Coverage Summary Metrics */}
            {plan.coverage_summary && (
              <div className="grid grid-cols-3 gap-4 py-4 border-b border-white/5 bg-black/10 px-4 -mx-6 shrink-0">
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono font-bold">Gesamtsätze</span>
                  <span className="block text-xl font-bold font-mono text-primary mt-0.5">
                    {plan.coverage_summary.sets || '0'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono font-bold">Durchschnitts-RPE</span>
                  <span className="block text-xl font-bold font-mono text-success mt-0.5">
                    {plan.coverage_summary.rpe || '—'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-muted uppercase font-mono font-bold">Übungen</span>
                  <span className="block text-xl font-bold font-mono text-text mt-0.5">
                    {plan.slots ? plan.slots.length : '0'}
                  </span>
                </div>
              </div>
            )}

            {/* Plan Slots List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-1">Übungen</h4>
              {plan.slots && plan.slots.map((slot, idx) => (
                <div key={idx} className="p-4 bg-surface/50 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-muted font-bold">
                      Slot: {slot.name}
                    </span>
                    <div className="font-mono text-sm font-bold text-text mt-1.5">
                      {slot.selected_exercise || 'Keine Übung ausgewählt'}
                    </div>
                  </div>
                  {slot.selected_exercise && (
                    <button
                      onClick={() => onSelectExercise(slot.selected_exercise)}
                      className="px-2.5 py-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-mono text-muted hover:text-text transition-all active:scale-95 shrink-0"
                    >
                      Ansehen
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <Calendar className="w-12 h-12 text-muted/40" />
            <h3 className="text-xl font-bold font-mono">Kein Plan geladen</h3>
            <p className="text-muted max-w-xs font-mono text-xs">
              Wähle links ein Template und ein Ziel und klicke auf "Plan generieren", um die Übungsauswahl zu berechnen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Weekly Review Tab ──
function WeeklyTab({ showToast }) {
  const [week, setWeek] = useState('current');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api(`/fitness/weekly?week=${week}`)
      .then(res => {
        if (res.ok) {
          setData(res);
          setError(null);
        } else {
          setError('Wochendaten konnten nicht geladen werden.');
        }
      })
      .catch(err => setError(`Netzwerkfehler: ${err.message}`))
      .finally(() => setLoading(false));
  }, [week]);

  useEffect(() => { load(); }, [load]);

  const handleExportWeekly = () => {
    setExporting(true);
    api('/fitness/export/weekly', {
      method: 'POST',
      body: JSON.stringify({ week_selector: week }),
    })
      .then(res => {
        if (res.ok) {
          showToast(`Erfolgreich nach Obsidian exportiert! (${res.path.split('/').pop()})`, 'success');
        } else {
          showToast('Export fehlgeschlagen.', 'error');
        }
      })
      .catch(err => showToast(`Fehler: ${err.message}`, 'error'))
      .finally(() => setExporting(false));
  };

  if (error) return <ErrorBox msg={error} />;
  if (data === null && loading) return <Loading />;

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Left Column (Stats & Regions) */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <select
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="bg-surface border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-primary text-text cursor-pointer"
            >
              <option value="current">Diese Woche (Current)</option>
              <option value="last">Letzte Woche (Last)</option>
              <option value="2_weeks_ago">Vor 2 Wochen</option>
              <option value="3_weeks_ago">Vor 3 Wochen</option>
            </select>
            {data && (
              <span className="text-xs text-muted font-mono">
                Sessions: <strong className="text-primary">{data.entries_count}</strong>
              </span>
            )}
          </div>
          {data && (
            <button
              disabled={exporting}
              onClick={handleExportWeekly}
              className="px-3 py-1.5 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              {exporting ? 'Speichert…' : 'Bericht exportieren'}
            </button>
          )}
        </div>

        {data ? (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* Muscle Region Progress Bars */}
            {data.body_region_scores && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
                  Belastungs-Intensität pro Region
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(data.body_region_scores).map(([region, score]) => {
                    const pct = Math.min(100, (score / 10) * 100); // map score to percentage
                    let color = 'bg-muted';
                    if (score > 6) color = 'bg-rose-500 shadow-md shadow-rose-500/25';
                    else if (score > 2) color = 'bg-success shadow-md shadow-success/25';
                    else if (score > 0) color = 'bg-amber-500 shadow-md shadow-amber-500/25';
                    
                    return (
                      <div key={region} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="capitalize text-text/80">{region}</span>
                          <span className="font-bold text-text">{score}</span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categorization Badges */}
            <div className="grid grid-cols-3 gap-4">
              <BadgeBox title="Hoch Belastet" items={data.high_regions} badgeClass="bg-rose-500/10 border-rose-500/20 text-rose-400" />
              <BadgeBox title="Gering Belastet" items={data.low_regions} badgeClass="bg-amber-500/10 border-amber-500/20 text-amber-400" />
              <BadgeBox title="Keine Belastung" items={data.missing_regions} badgeClass="bg-white/5 border-white/10 text-muted" />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <Loading />
          </div>
        )}
      </div>

      {/* Right Column (Coach Recommendations) */}
      <div className="w-[380px] bg-surface/30 border border-white/5 rounded-2xl p-6 flex flex-col h-full overflow-hidden shrink-0 shadow-2xl">
        <div className="mb-4 flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-md font-bold font-mono text-primary uppercase tracking-wide">Coach Feedback</h3>
        </div>
        
        {data && data.recommendations && data.recommendations.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {data.recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary rounded-r-xl rounded-l-sm text-xs font-mono leading-relaxed text-text/90"
              >
                {rec}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-2 text-muted">
            <Info className="w-8 h-8 opacity-40" />
            <span className="font-mono text-xs">Keine Empfehlungen für diese Woche.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeBox({ title, items = [], badgeClass }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
      <span className="text-[10px] text-muted uppercase font-mono font-bold block mb-2">{title}</span>
      <div className="flex flex-wrap gap-1">
        {items.length > 0 ? (
          items.map((it, idx) => (
            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-mono ${badgeClass}`}>
              {it}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-muted/50 font-mono">—</span>
        )}
      </div>
    </div>
  );
}

// ── Coverage Analysis Tab ──
function CoverageTab() {
  const [gaps, setGaps] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [days, setDays] = useState(7);
  const [subTab, setSubTab] = useState('gaps'); // 'gaps' or 'detailed'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api(`/coverage/gaps?days=${days}`).catch(() => ({ gaps: [] })),
      api(`/coverage/detailed?days=${days}`).catch(() => ({ muscles: [] }))
    ])
      .then(([gapsData, detailedData]) => {
        setGaps(gapsData.gaps || gapsData.items || []);
        setDetailed(detailedData.muscles || []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorBox msg={error} />;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex gap-2 p-1 bg-surface border border-white/10 rounded-xl shadow-lg">
          <button
            onClick={() => setSubTab('gaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              subTab === 'gaps' ? 'bg-primary text-text shadow-sm shadow-primary/45' : 'text-muted hover:text-text'
            }`}
          >
            Lücken
          </button>
          <button
            onClick={() => setSubTab('detailed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              subTab === 'detailed' ? 'bg-primary text-text shadow-sm shadow-primary/45' : 'text-muted hover:text-text'
            }`}
          >
            Details
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-muted">
            <span>Tage:</span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent focus:outline-none text-text font-bold cursor-pointer"
            >
              <option value="7">Letzte 7 Tage</option>
              <option value="14">Letzte 14 Tage</option>
              <option value="30">Letzte 30 Tage</option>
              <option value="90">Letzte 90 Tage</option>
            </select>
          </div>
          <button 
            onClick={load} 
            disabled={loading}
            className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-muted rounded-xl transition-all active:scale-95"
            title="Neu laden"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <Loading />
        ) : subTab === 'gaps' ? (
          gaps && gaps.length === 0 ? (
            <div className="text-muted text-sm p-4 font-mono text-center bg-white/5 rounded-xl border border-white/5">
              Keine Lücken gemeldet. Alle Muskelgruppen sind ausreichend abgedeckt!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {gaps?.map((g, i) => (
                <div key={i} className="bg-surface/50 border border-white/5 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-bold text-rose-400 capitalize">{g.name_de || g.name_en || g.id}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-mono font-bold uppercase">
                      Lücke
                    </span>
                  </div>
                  <div className="text-[10px] text-muted font-mono leading-relaxed mt-1">
                    Katalog ID: {g.id} <br />
                    Score in {days} Tagen: {g.totalScore || 0}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          detailed && (
            <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-muted uppercase font-bold text-[10px]">
                    <th className="p-4">Muskel (DE)</th>
                    <th className="p-4">Muskel (EN)</th>
                    <th className="p-4">Katalog ID</th>
                    <th className="p-4 text-right">Coverage Score ({days}d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {detailed.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-all">
                      <td className="p-4 font-bold text-text/95">{m.name_de}</td>
                      <td className="p-4 text-text/80">{m.name_en}</td>
                      <td className="p-4 text-muted text-[11px]">{m.id}</td>
                      <td className="p-4 text-right">
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          m.totalScore > 2 ? 'bg-success/10 text-success' :
                          m.totalScore > 0 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {m.totalScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-b-0 gap-4">
      <span className="text-muted font-mono text-[10px] uppercase font-bold shrink-0">{label}</span>
      <span className="font-mono text-text/90 text-right break-all">{value}</span>
    </div>
  );
}

function Loading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-muted font-mono text-sm flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
        Lade Daten…
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="h-full flex items-center justify-center p-6 text-center">
      <div className="bg-danger/10 border border-danger/20 text-danger p-6 rounded-2xl max-w-md shadow-2xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-danger" />
        <h4 className="font-mono font-bold text-md">Fehler aufgetreten</h4>
        <p className="text-xs font-mono text-danger/80 mt-1">{msg}</p>
      </div>
    </div>
  );
}

export default App;
