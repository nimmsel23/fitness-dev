import { Search, Brain, Zap } from "lucide-react";

export default function ExplorerHeader({ viewMode, setViewMode, onStartQuiz, hasRecent }) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
      <div>
        <h1 className="text-3xl font-black text-fit-ink mb-1 tracking-tight">Anatomie & Übungen</h1>
        <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Wissen ist die stärkste Übung</p>
      </div>

      <div className="flex gap-1 p-1 bg-fit-card rounded-2xl border border-fit-line shadow-xl flex-wrap justify-end">
        <button
          onClick={() => setViewMode('library')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'library' ? 'bg-fit-accent text-black shadow-lg shadow-accent/20' : 'text-fit-dim hover:text-ink'}`}>
          <Search size={14} className={viewMode === 'library' ? 'stroke-[3]' : ''} />
          <span className="hidden sm:inline">Übungen</span>
        </button>
<button
          onClick={() => setViewMode('explorer')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'explorer' ? 'bg-fit-accent text-black shadow-lg shadow-accent/20' : 'text-fit-dim hover:text-ink'}`}>
          <Brain size={14} className={viewMode === 'explorer' ? 'stroke-[3]' : ''} />
          <span className="hidden sm:inline">Explorer</span>
        </button>
        {hasRecent && (
          <button
            onClick={onStartQuiz}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'quiz' ? 'bg-fit-accent text-black shadow-lg shadow-accent/20' : 'text-fit-accent bg-fit-accent/10 border border-fit-accent/20 hover:bg-accent/20'}`}>
            <Zap size={14} className={viewMode === 'quiz' ? 'stroke-[3]' : ''} />
            Quiz
          </button>
        )}
      </div>
    </div>
  );
}
