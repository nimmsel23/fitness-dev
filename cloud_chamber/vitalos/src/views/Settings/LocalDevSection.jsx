import { RefreshCw, Settings2, Terminal } from "lucide-react";

export default function LocalDevSection({
  firestoreStatus,
  syncing, onSync,
  health, wger,
}) {
  return (
    <section className="card p-8 border-dashed border-fit-accent/20 animate-in fade-in duration-500">
       <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-fit-accent/10 flex items-center justify-center">
            <Terminal size={20} className="text-fit-accent" />
          </div>
          <div>
             <h3 className="text-xl font-black text-fit-ink">Local Dev</h3>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Nur im lokalen Entwicklungsmodus sichtbar</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Firestore Sync */}
          <div className="bg-fit-bg2 p-6 rounded-3xl border border-fit-line">
             <div className="flex items-center gap-3 mb-6">
                <RefreshCw size={18} className={syncing ? 'animate-spin text-fit-accent' : 'text-fit-accent'} />
                <h4 className="text-sm font-black text-fit-ink uppercase tracking-widest">Firestore Sync</h4>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between bg-fit-bg p-3 rounded-xl border border-fit-line">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</span>
                   {firestoreStatus?.ok
                      ? <span className="text-[9px] font-black uppercase bg-green-500/10 text-green-500 px-2 py-1 rounded-md border border-green-500/20">Verbunden</span>
                      : <span className="text-[9px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-1 rounded-md border border-red-500/20">Offline</span>
                   }
                </div>
                <button onClick={onSync} disabled={syncing} className="w-full btn btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-fit-accent/20">
                   {syncing ? 'Synchronisiere...' : 'Jetzt Synchronisieren'}
                </button>
             </div>
          </div>

          {/* Diagnose */}
          <div className="bg-fit-bg2 p-6 rounded-3xl border border-fit-line">
             <div className="flex items-center gap-3 mb-6">
                <Settings2 size={18} className="text-fit-dim" />
                <h4 className="text-sm font-black text-fit-ink uppercase tracking-widest text-fit-dim">Diagnose</h4>
             </div>
             <div className="space-y-3">
                {[
                  ['Node API (Local)', health?.ok ? 'OK' : 'FAIL'],
                  ['wger (Docker)', wger ? 'OK' : 'FAIL'],
                  ['Storage Path', '~/.aos/fitness/']
                ].map(([l, v]) => (
                   <div key={l} className="flex items-center justify-between text-[11px] font-mono bg-fit-bg p-3 rounded-xl border border-fit-line">
                      <span className="opacity-40">{l}</span>
                      <span className={`font-black ${v === 'FAIL' ? 'text-red-500' : 'text-fit-accent'}`}>{v}</span>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </section>
  );
}
