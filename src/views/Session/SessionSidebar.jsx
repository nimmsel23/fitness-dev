import { Download } from 'lucide-react';
import SectionHeader from './SectionHeader';

export default function SessionSidebar({ 
  location, setLocation, duration, setDuration, 
  hasActivity, setHasActivity, block, setBlock, 
  effort, setEffort, notes, setNotes, onDownload 
}) {
  return (
    <aside className="space-y-6">
      <section className="card p-6 shadow-lg border-line/50">
        <SectionHeader>Details</SectionHeader>
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2 block ml-1">Location</label>
            <input type="text" value={location} placeholder="z.B. Home Gym" onChange={e => setLocation(e.target.value)}
              className="w-full p-3.5 rounded-2xl border text-sm font-bold bg-bg2 border-line text-ink focus:border-accent outline-none" />
          </div>
          <div className="relative">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2 block ml-1">Dauer</label>
            <input type="number" value={duration} placeholder="Minuten" onChange={e => setDuration(e.target.value)}
              className="w-full p-3.5 pr-12 rounded-2xl border text-sm font-bold bg-bg2 border-line text-ink focus:border-accent outline-none" />
            <span className="absolute right-4 bottom-3.5 text-[10px] font-black opacity-20 uppercase">MIN</span>
          </div>
          <div className="pt-2">
            <button onClick={() => setHasActivity(!hasActivity)} 
              className={`w-full p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${hasActivity ? 'border-orange bg-orange/5 text-orange' : 'border-line bg-bg2 text-dim'}`}>
              {hasActivity ? 'Activity aktiv' : 'Activity hinzufügen'}
            </button>
          </div>
        </div>
      </section>

      <section className="card p-6 shadow-lg border-line/50">
        <SectionHeader>Training Split</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          {['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full'].map(l => (
            <button key={l} onClick={() => setBlock(l)}
              className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${block === l ? 'border-accent bg-accent text-black shadow-lg shadow-accent/20' : 'border-line bg-bg2 text-muted hover:text-ink'}`}>
              {l}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6 shadow-lg border-line/50">
        <SectionHeader>Qualität & Fokus</SectionHeader>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Effort (RPE)</span>
              <span className="text-xl font-black text-accent">{effort}</span>
            </div>
            <input type="range" min={1} max={10} value={effort} onChange={e => setEffort(Number(e.target.value))} className="w-full accent-accent" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2 block ml-1">Notizen</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Wie war der Fokus?"
              className="w-full p-4 rounded-2xl border text-sm font-medium bg-bg2 border-line text-ink focus:border-accent outline-none resize-none leading-relaxed" />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <button onClick={onExportObsidian} className="w-full p-5 rounded-3xl border flex items-center justify-between bg-accent/5 border-accent/20 hover:border-accent/40 transition-all shadow-xl group">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1 group-hover:translate-x-1 transition-transform">Obsidian Sync</div>
            <div className="text-[11px] font-bold opacity-30">Direkt in Vault speichern</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Download size={18} />
          </div>
        </button>
        
        <button onClick={onDownload} className="w-full p-5 rounded-3xl border flex items-center justify-between bg-card border-line hover:border-accent/30 transition-all shadow-xl group">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover:translate-x-1 transition-transform">Download MD</div>
            <div className="text-[11px] font-bold opacity-30">Lokale Datei speichern</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-bg2 flex items-center justify-center text-dim">
            <Download size={18} />
          </div>
        </button>
      </section>
    </aside>
  );
}
