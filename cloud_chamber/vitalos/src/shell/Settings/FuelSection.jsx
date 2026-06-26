import { Flame } from "lucide-react";
import { useSettings } from "@fuel/store.js";

const inputCls = "w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none transition-colors";

export default function FuelSection() {
  const { kcal_goal, protein_goal, water_goal, setSetting } = useSettings();

  return (
    <section className="card p-8 space-y-8 border-t-4 border-t-orange-400 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
          <Flame size={20} className="text-orange-400" />
        </div>
        <h3 className="text-xl font-black text-fit-ink">Ernährungsziele</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Kalorien</div>
          <input
            type="number" value={kcal_goal} min={500} max={6000}
            onChange={e => setSetting("kcal_goal", Number(e.target.value))}
            className={inputCls}
          />
          <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">kcal / Tag</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Protein</div>
          <input
            type="number" value={protein_goal} min={30} max={400}
            onChange={e => setSetting("protein_goal", Number(e.target.value))}
            className={inputCls}
          />
          <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">g / Tag</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Wasser</div>
          <input
            type="number" value={water_goal} min={500} max={6000} step={250}
            onChange={e => setSetting("water_goal", Number(e.target.value))}
            className={inputCls}
          />
          <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">ml / Tag</div>
        </div>
      </div>
    </section>
  );
}
