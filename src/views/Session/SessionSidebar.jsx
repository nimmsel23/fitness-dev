import { Download, Zap, MapPin, Clock, Activity, Target, FileText, Info, X } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { blockColor } from './utils';

export default function SessionSidebar({
  location, setLocation, duration, setDuration,
  hasActivity, setHasActivity, block, setBlock,
  effort, setEffort, notes, setNotes, onDownload,
  onExportObsidian, onShowMap, onClose
}) {
  return (
    <aside className="space-y-6">
      {onClose && (
        <div className="flex items-center justify-between px-6 pt-2 pb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dim/40">Session Details</span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-bg2 flex items-center justify-center text-dim hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
      <section className="card p-6 shadow-xl border-line/50 rounded-[32px]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Info size={16} strokeWidth={3} />
          </div>
          <SectionHeader>Details</SectionHeader>
        </div>
        
        <div className="space-y-5">
          <div className="group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim/40 mb-2 block ml-1 flex items-center gap-2">
              <MapPin size={12} /> Location
            </label>
            <input type="text" value={location} placeholder="z.B. Home Gym" onChange={e => setLocation(e.target.value)}
              className="w-full p-4 rounded-2xl border text-sm font-bold bg-bg2 border-line text-ink focus:border-accent focus:bg-card outline-none transition-all" />
          </div>
          
          <div className="relative group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim/40 mb-2 block ml-1 flex items-center gap-2">
              <Clock size={12} /> Dauer
            </label>
            <div className="relative">
              <input type="number" value={duration} placeholder="Minuten" onChange={e => setDuration(e.target.value)}
                className="w-full p-4 pr-14 rounded-2xl border text-sm font-bold bg-bg2 border-line text-ink focus:border-accent focus:bg-card outline-none transition-all" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-dim/30 uppercase tracking-widest">MIN</span>
            </div>
          </div>
          
          <div className="pt-2">
            <button onClick={() => setHasActivity(!hasActivity)} 
              className={`w-full p-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm flex items-center justify-center gap-3 ${
                hasActivity ? 'border-orange bg-orange/5 text-orange shadow-lg shadow-orange/10' : 'border-line bg-bg2 text-dim'
              }`}>
              <Activity size={16} />
              {hasActivity ? 'Activity aktiv' : 'Activity hinzufügen'}
            </button>
          </div>
        </div>
      </section>

      <section className="card p-6 shadow-xl border-line/50 rounded-[32px]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Target size={16} strokeWidth={3} />
          </div>
          <SectionHeader>Training Split</SectionHeader>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full'].map(l => {
            const color = blockColor(l);
            const isActive = block === l;
            return (
              <button key={l} onClick={() => setBlock(l)}
                className={`px-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${
                  isActive 
                  ? 'shadow-xl' 
                  : 'border-line bg-bg2 text-dim hover:text-ink hover:border-line-hover'
                }`}
                style={{
                  borderColor: isActive ? color : undefined,
                  backgroundColor: isActive ? color : undefined,
                  color: isActive ? '#000' : undefined,
                  boxShadow: isActive ? `0 10px 25px -5px ${color}44` : undefined
                }}>
                {l}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <button onClick={onShowMap} className="w-full p-6 rounded-[32px] border flex items-center justify-between bg-card border-line hover:border-accent/30 transition-all shadow-xl group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="text-left relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1 group-hover:translate-x-1 transition-transform">Anatomie Check</div>
            <div className="text-[11px] font-bold opacity-30">Visualisiere deine Abdeckung</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-all relative z-10">
            <Zap size={22} fill="currentColor" />
          </div>
        </button>
      </section>

      <section className="card p-6 shadow-xl border-line/50 rounded-[32px]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Activity size={16} strokeWidth={3} />
          </div>
          <SectionHeader>Qualität & Fokus</SectionHeader>
        </div>
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dim/40">Effort (RPE)</span>
              <span className="text-2xl font-black text-accent">{effort}</span>
            </div>
            <input type="range" min={1} max={10} value={effort} onChange={e => setEffort(Number(e.target.value))} className="w-full accent-accent h-1.5 bg-bg2 rounded-full appearance-none cursor-pointer" />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[8px] font-black text-dim/20 uppercase">Leicht</span>
              <span className="text-[8px] font-black text-dim/20 uppercase">Maximal</span>
            </div>
          </div>
          
          <div className="group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dim/40 mb-2 block ml-1 flex items-center gap-2">
              <FileText size={12} /> Notizen
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Wie war der Fokus?"
              className="w-full p-4 rounded-2xl border text-sm font-medium bg-bg2 border-line text-ink focus:border-accent focus:bg-card outline-none resize-none leading-relaxed transition-all" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <button onClick={onExportObsidian} className="w-full p-6 rounded-[32px] border flex items-center justify-between bg-accent/5 border-accent/20 hover:border-accent/40 transition-all shadow-xl group">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1 group-hover:translate-x-1 transition-transform">Obsidian Sync</div>
            <div className="text-[11px] font-bold opacity-30">In Vault speichern</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-all">
            <Download size={20} />
          </div>
        </button>
        
        <button onClick={onDownload} className="w-full p-6 rounded-[32px] border flex items-center justify-between bg-card border-line hover:border-accent/30 transition-all shadow-sm group">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-dim/40 mb-1 group-hover:translate-x-1 transition-transform">Download MD</div>
            <div className="text-[11px] font-bold opacity-30">Lokale Datei</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-bg2 flex items-center justify-center text-dim group-hover:text-ink transition-colors">
            <Download size={20} />
          </div>
        </button>
      </section>
    </aside>
  );
}
