import { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Brain, MessageSquare, Check, Dumbbell, Layers, Users } from 'lucide-react';
import { useInbox } from '../Inbox/useInbox';
import InboxCard from '../Inbox/InboxCard';
import CatalogBrowser from './CatalogBrowser';
import AssignPlan from './AssignPlan';
import ClientManagement from './ClientManagement';
import { getGlobalJournalFeed, getAllUserProfiles, saveCoachFeedback } from '@db';

export default function Coach({ onInspectExercise }) {
  const { exercises, loading, actioning, toast, approve, remove, reenrich } = useInbox({ global: true });
  
  const [activeSubTab, setActiveSubTab] = useState('exercises'); // 'exercises' | 'journals' | 'catalog' | 'plans'
  const [journals, setJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [submittingComment, setSubmittingComment] = useState(null);
  const [commentsText, setCommentsText] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [filterUserId, setFilterUserId] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'workout' | 'habit_journal'

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

  useEffect(() => {
    if (activeSubTab === 'journals') {
      setLoadingJournals(true);
      Promise.all([
        getGlobalJournalFeed(),
        getAllUserProfiles()
      ]).then(([feed, profiles]) => {
        setJournals(feed);
        setUserProfiles(profiles);
        
        // Pre-fill comment inputs with existing feedback
        const initialTexts = {};
        feed.forEach(j => {
          if (j.coachFeedback) {
            initialTexts[j.id] = j.coachFeedback;
          }
        });
        setCommentsText(initialTexts);
      }).catch(() => {
        triggerToast('Fehler beim Laden des Journal-Feeds');
      }).finally(() => {
        setLoadingJournals(false);
      });
    }
  }, [activeSubTab]);

  async function handleCommentSubmit(item) {
    const text = commentsText[item.id] || '';
    if (!text.trim()) return;

    setSubmittingComment(item.id);
    try {
      await saveCoachFeedback(item.userId, item.id, item.type, text, item.habitId || null, item.date || null);
      setJournals(prev => prev.map(j => j.id === item.id ? { ...j, coachFeedback: text } : j));
      triggerToast('Kommentar gespeichert und Push gesendet! ✓');
    } catch (e) {
      console.error(e);
      triggerToast('Fehler beim Speichern des Kommentars');
    } finally {
      setSubmittingComment(null);
    }
  }

  const journalClients = [...new Set(journals.map(j => j.userId).filter(Boolean))]
    .map(uid => {
      const profile = userProfiles[uid] || {};
      return { uid, name: profile.displayName || profile.email || uid };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredJournals = journals.filter(j =>
    (filterUserId === 'all' || j.userId === filterUserId) &&
    (filterType === 'all' || j.type === filterType)
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-fit-ink mb-1">Hidden Chamber</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Coach Administration & Approval</p>
        </div>
        <div className="flex items-center gap-3 bg-fit-accent/10 px-4 py-2 rounded-xl border border-fit-accent/20">
          <Sparkles size={16} className="text-fit-accent" />
          <span className="text-[10px] font-black uppercase text-fit-accent">
            {activeSubTab === 'exercises' ? `${exercises.length} Tasks` : activeSubTab === 'journals' ? `${filteredJournals.length}/${journals.length} Feed Items` : 'Katalog'}
          </span>
        </div>
      </header>

      {/* Sub-Tabs Selector */}
      <div className="flex gap-6 border-b border-fit-line/30 pb-1">
        <button
          onClick={() => setActiveSubTab('exercises')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'exercises' ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
        >
          Übungsanfragen ({exercises.length})
        </button>
        <button
          onClick={() => setActiveSubTab('journals')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'journals' ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
        >
          Klienten-Workouts
        </button>
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1 ${activeSubTab === 'catalog' ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
        >
          <Dumbbell size={14} className="mb-0.5" /> Katalog Browser
        </button>
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1 ${activeSubTab === 'plans' ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
        >
          <Layers size={14} className="mb-0.5" /> Trainingspläne
        </button>
        <button
          onClick={() => setActiveSubTab('clients')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1 ${activeSubTab === 'clients' ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
        >
          <Users size={14} className="mb-0.5" /> Klienten
        </button>
      </div>

      {activeSubTab === 'exercises' ? (
        exercises.length === 0 ? (
          <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
            <CheckCircle2 size={48} className="mb-4 text-fit-green" />
            <h3 className="text-lg font-black">Alles freigegeben</h3>
            <p className="text-xs font-bold uppercase tracking-widest mt-1">Keine offenen Anfragen</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exercises.map(ex => (
              <InboxCard
                key={ex.file_id}
                ex={ex}
                actioning={actioning}
                onApprove={approve}
                onDelete={remove}
                onReenrich={reenrich}
                onInspect={onInspectExercise}
                showUserId
              />
            ))}
          </div>
        )
      ) : activeSubTab === 'catalog' ? (
        <CatalogBrowser onInspectExercise={onInspectExercise} />
      ) : activeSubTab === 'plans' ? (
        <AssignPlan />
      ) : activeSubTab === 'clients' ? (
        <ClientManagement />
      ) : (
        /* Klienten Workouts Feed View */
        loadingJournals ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
          </div>
        ) : journals.length === 0 ? (
          <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
            <Dumbbell size={48} className="mb-4 text-fit-dim" />
            <h3 className="text-lg font-black">Keine Workouts</h3>
            <p className="text-xs font-bold uppercase tracking-widest mt-1">Es wurden noch keine Workouts geloggt</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filter-Leiste */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                className="bg-fit-bg2 border border-fit-line/60 rounded-xl px-3 py-2 text-xs font-bold text-fit-ink outline-none focus:border-fit-accent"
              >
                <option value="all">Alle Klienten ({journals.length})</option>
                {journalClients.map(c => (
                  <option key={c.uid} value={c.uid}>
                    {c.name} ({journals.filter(j => j.userId === c.uid).length})
                  </option>
                ))}
              </select>

              <div className="flex gap-1 p-1 bg-fit-bg2 rounded-xl border border-fit-line/40">
                {[
                  { id: 'all', label: 'Alle' },
                  { id: 'workout', label: 'Workouts' },
                  { id: 'habit_journal', label: 'Habits' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === f.id ? 'bg-fit-accent text-black' : 'text-fit-dim hover:text-fit-ink'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {(filterUserId !== 'all' || filterType !== 'all') && (
                <button
                  onClick={() => { setFilterUserId('all'); setFilterType('all'); }}
                  className="text-[10px] font-black uppercase text-fit-dim hover:text-fit-accent tracking-wider"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>

            {filteredJournals.length === 0 && (
              <div className="card py-12 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
                <p className="text-xs font-bold uppercase tracking-widest">Keine Treffer für diesen Filter</p>
              </div>
            )}

            {filteredJournals.map(item => {
              const profile = userProfiles[item.userId] || {};
              const clientName = profile.displayName || profile.email || item.userId;
              const isWorkout = item.type === 'workout';
              const isHabit = item.type === 'habit_journal';
              
              return (
                <div key={item.id} className="card p-6 hover:border-fit-accent/25 transition-all space-y-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${isWorkout ? 'bg-fit-accent/15 text-fit-accent' : 'bg-blue/15 text-blue'}`}>
                        {isWorkout ? <Dumbbell size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-black text-fit-ink tracking-tight">{clientName}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${isWorkout ? 'bg-fit-accent/10 border-fit-accent/20 text-fit-accent' : 'bg-blue/10 border-blue/20 text-blue'}`}>
                            {isWorkout ? 'Workout' : 'Journal'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-fit-dim block mt-0.5">{item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workout Details (Effort, Mood, Notes) */}
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-fit-dim/80 bg-fit-bg2/25 p-3.5 rounded-2xl border border-fit-line/20">
                    {item.effort && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-fit-dim/50 font-sans">RPE/Effort:</span>
                        <span className="text-fit-accent font-extrabold font-mono bg-fit-accent/10 px-2 py-0.5 rounded-md border border-fit-accent/20">{item.effort} / 10</span>
                      </div>
                    )}
                    {item.mood && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-fit-dim/50 font-sans">Stimmung:</span>
                        <span className="text-fit-ink bg-fit-bg2 px-2 py-0.5 rounded-md border border-fit-line/30 capitalize font-sans">{item.mood}</span>
                      </div>
                    )}
                    {item.notes && (
                      <div className="w-full text-xs leading-relaxed text-fit-ink border-t border-fit-line/10 pt-2 font-medium font-sans">
                        <span className="text-[10px] font-black uppercase text-fit-dim/50 block mb-0.5">Notizen:</span>
                        "{item.notes}"
                      </div>
                    )}
                  </div>

                  {/* Exercises list */}
                  {item.exercises && item.exercises.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase text-fit-dim tracking-wider pl-1">
                        Übungen ({item.exercises.length})
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {item.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="bg-fit-bg2/40 p-3 rounded-2xl border border-fit-line/20 flex flex-col justify-between">
                            <div>
                              <div className="font-extrabold text-xs text-fit-ink mb-1.5 flex items-center justify-between">
                                <span className="truncate max-w-[70%]">{ex.name || 'Unbekannte Übung'}</span>
                                {ex.primaryMuscles && ex.primaryMuscles.length > 0 && (
                                  <span className="text-[8px] font-bold text-fit-dim/60 uppercase font-mono tracking-tighter bg-fit-line/30 px-1.5 py-0.5 rounded shrink-0">
                                    {ex.primaryMuscles[0]}
                                  </span>
                                )}
                              </div>
                              
                              {/* Sets render */}
                              <div className="space-y-1.5 mt-2">
                                {ex.setsArray && ex.setsArray.length > 0 ? (
                                  ex.setsArray.map((set, sIdx) => (
                                    <div key={sIdx} className="text-[11px] font-mono text-fit-dim flex items-center justify-between">
                                      <span className="opacity-45">Satz {sIdx + 1}:</span>
                                      <span className="font-extrabold text-fit-ink">
                                        {set.reps || 0} Reps {set.weight ? `@ ${set.weight} kg` : ''}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-[11px] font-mono text-fit-dim flex items-center justify-between">
                                    <span className="opacity-45">Sets:</span>
                                    <span className="font-extrabold text-fit-ink">
                                      {ex.sets || 0} × {ex.reps || 0} {ex.weight ? `@ ${ex.weight} kg` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {ex.note && (
                              <div className="mt-2.5 text-[10px] italic text-fit-dim/70 border-t border-fit-line/10 pt-1.5">
                                "{ex.note}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-fit-ink bg-fit-bg2/40 p-4 rounded-2xl border border-fit-line/30 whitespace-pre-wrap font-medium">
                      <span className="italic opacity-30">Keine Übungen in diesem Workout eingetragen.</span>
                    </p>
                  )}

                  {/* Feedback Form */}
                  <div className="bg-fit-bg/50 p-4 rounded-2xl border border-fit-line/40 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-fit-dim tracking-wider">
                      <Brain size={12} className="text-fit-accent" />
                      <span>Kommentar / Feedback an Klienten</span>
                    </div>

                    <textarea
                      value={commentsText[item.id] || ''}
                      onChange={(e) => setCommentsText(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Schreibe Feedback für dieses Workout..."
                      className="w-full bg-fit-bg2 border border-fit-line/60 focus:border-fit-accent/50 focus:ring-1 focus:ring-fit-accent/30 rounded-xl p-3 text-xs text-fit-ink placeholder:opacity-40 outline-none transition-all resize-none h-20 font-medium"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCommentSubmit(item)}
                        disabled={submittingComment === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-fit-accent text-black rounded-xl font-black uppercase text-[10px] tracking-wider transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-md shadow-fit-accent/10"
                      >
                        {submittingComment === item.id ? 'Warte…' : (
                          <>
                            <Check size={12} /> Feedback senden
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {(toast || toastMessage) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast || toastMessage}
        </div>
      )}
    </div>
  );
}
