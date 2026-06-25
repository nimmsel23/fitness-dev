import { Flame } from "lucide-react";
import { useSettings } from "@fuel/store.js";

const inputCls = "w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none transition-colors";

export default function FuelSection() {
  const { kcal_goal, protein_goal, water_goal, age, gender, setSetting } = useSettings();

  return (
    <section className="card p-8 space-y-8 border-t-4 border-t-orange-400 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
          <Flame size={20} className="text-orange-400" />
        </div>
        <h3 className="text-xl font-black text-fit-ink">Ernährungsziele</h3>
      </div>

      <div className="space-y-6">
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

        <div className="border-t border-fit-line/50 pt-6 space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Biometrisches Profil</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-bold opacity-30 mb-2 ml-1">Alter</div>
              <input
                type="number" value={age} min={15} max={99}
                onChange={e => setSetting("age", Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <div className="text-[10px] font-bold opacity-30 mb-2 ml-1">Geschlecht</div>
              <div className="flex gap-1 p-1 bg-fit-bg2 rounded-xl border border-fit-line">
                {[{ id: 'm', label: 'Männlich' }, { id: 'f', label: 'Weiblich' }].map(({ id, label }) => (
                  <button key={id} onClick={() => setSetting("gender", id)}
                    className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === id ? 'bg-fit-card shadow-md text-orange-400' : 'text-fit-dim hover:text-fit-ink'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">Für DACH-Referenzwerte</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
