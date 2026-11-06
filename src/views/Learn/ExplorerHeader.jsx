import { Search, Brain, Zap, Dumbbell } from "lucide-react";

export default function ExplorerHeader({ viewMode, setViewMode, onStartQuiz, hasRecent }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
      <div>
        <h1 className="text-xl font-bold text-fit-ink">Anatomie &amp; Übungen</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--dim)', opacity: 0.6 }}>Wissen ist die stärkste Übung</p>
      </div>

      <div className="flex items-center gap-4 text-[13px] font-semibold flex-wrap">
        <button
          onClick={() => setViewMode('library')}
          className="flex items-center gap-1.5 pb-1"
          style={{
            color: viewMode === 'library' ? 'var(--accent)' : 'var(--dim)',
            borderBottom: viewMode === 'library' ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
          <Search size={14} />
          Übungen
        </button>
        <button
          onClick={() => setViewMode('explorer')}
          className="flex items-center gap-1.5 pb-1"
          style={{
            color: viewMode === 'explorer' ? 'var(--accent)' : 'var(--dim)',
            borderBottom: viewMode === 'explorer' ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
          <Brain size={14} />
          Explorer
        </button>
        <button
          onClick={() => setViewMode('strength')}
          className="flex items-center gap-1.5 pb-1"
          style={{
            color: viewMode === 'strength' ? 'var(--accent)' : 'var(--dim)',
            borderBottom: viewMode === 'strength' ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
          <Dumbbell size={14} />
          Stärke
        </button>
        {hasRecent && (
          <button
            onClick={onStartQuiz}
            className="flex items-center gap-1.5 pb-1"
            style={{
              color: viewMode === 'quiz' ? 'var(--accent)' : 'var(--dim)',
              borderBottom: viewMode === 'quiz' ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            <Zap size={14} />
            Quiz
          </button>
        )}
      </div>
    </div>
  );
}
