import { useUser } from "../../contexts/UserContext";
import { useState } from "react";
import Anamnese from "../Anamnese/index.jsx";

const metaCls = "text-[10px] font-black uppercase tracking-[0.28em] text-fit-accent";
const labelCls = "text-[10px] font-black uppercase tracking-[0.22em] text-fit-ink/55";
const bodyCls = "text-sm leading-relaxed text-fit-ink whitespace-pre-wrap";
const actionCls = "rounded-2xl border border-fit-line bg-fit-card px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-fit-ink transition-colors hover:border-fit-accent hover:text-fit-accent";

function Block({ label, value }) {
  return (
    <div className="rounded-[18px] border border-fit-line bg-fit-bg2/35 p-4 space-y-2">
      <div className={labelCls}>{label}</div>
      <div className={bodyCls}>{value?.trim() ? value : "—"}</div>
    </div>
  );
}

function HitCard({ title, fact, obstacle, strike, responsibility }) {
  return (
    <section className="rounded-[24px] border border-fit-line bg-fit-card p-5 md:p-6 space-y-4">
      <div className="space-y-1">
        <div className={metaCls}>HIT</div>
        <h3 className="text-2xl font-black text-fit-ink leading-none">{title}</h3>
      </div>
      <Block label="Fact" value={fact} />
      <Block label="Obstacle" value={obstacle} />
      <Block label="Strike" value={strike} />
      <Block label="Responsibility" value={responsibility} />
    </section>
  );
}

export default function Fokus() {
  const [layer, setLayer] = useState("focus");
  const {
    warStackInsights,
    warStackLesson,
    hit1Fact, hit1Obstacle, hit1Strike, hit1Responsibility,
    hit2Fact, hit2Obstacle, hit2Strike, hit2Responsibility,
    hit3Fact, hit3Obstacle, hit3Strike, hit3Responsibility,
    hit4Fact, hit4Obstacle, hit4Strike, hit4Responsibility,
  } = useUser();

  const hits = [
    { title: "Hit 1", fact: hit1Fact, obstacle: hit1Obstacle, strike: hit1Strike, responsibility: hit1Responsibility },
    { title: "Hit 2", fact: hit2Fact, obstacle: hit2Obstacle, strike: hit2Strike, responsibility: hit2Responsibility },
    { title: "Hit 3", fact: hit3Fact, obstacle: hit3Obstacle, strike: hit3Strike, responsibility: hit3Responsibility },
    { title: "Hit 4", fact: hit4Fact, obstacle: hit4Obstacle, strike: hit4Strike, responsibility: hit4Responsibility },
  ].filter((hit) => [hit.fact, hit.obstacle, hit.strike, hit.responsibility].some((value) => value?.trim()));

  if (layer === "anamnese") {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-32">
        <div className="flex justify-start">
          <button type="button" onClick={() => setLayer("focus")} className={actionCls}>
            Zurück zu Fokus
          </button>
        </div>
        <Anamnese />
      </div>
    );
  }

  if (layer === "freedom") {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-32">
        <header className="rounded-[24px] border border-fit-line bg-fit-card p-5 md:p-6 space-y-3">
          <div className={metaCls}>NEXT</div>
          <h2 className="text-3xl md:text-4xl font-black text-fit-ink leading-none">Freedom Map</h2>
        </header>

        <section className="rounded-[24px] border border-fit-line bg-fit-card p-5 md:p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Block label="Current Hits" value={hits.map((hit) => hit.title).join("\n")} />
            <Block label="Direction" value={hits.map((hit) => hit.fact).filter(Boolean).join("\n\n")} />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setLayer("focus")} className={actionCls}>
            Zurück zu Fokus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32">
      <header className="rounded-[24px] border border-fit-line bg-fit-card p-5 md:p-6 space-y-3">
        <div className={metaCls}>FOCUS MAP</div>
        <h2 className="text-3xl md:text-4xl font-black text-fit-ink leading-none">Fokus</h2>
      </header>

      {hits.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {hits.map((hit) => (
            <HitCard key={hit.title} {...hit} />
          ))}
        </div>
      ) : (
        <section className="rounded-[24px] border border-fit-line bg-fit-card p-5 md:p-6">
          <div className={metaCls}>FOCUS MAP</div>
          <p className="mt-3 text-sm text-fit-ink/65">
            Noch keine Hits gesetzt.
          </p>
        </section>
      )}

      <section className="rounded-[24px] border border-fit-line bg-fit-card p-5 md:p-6 space-y-4">
        <div className={metaCls}>REFLECTION</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Block label="Insights" value={warStackInsights} />
          <Block label="Lessons Learned" value={warStackLesson} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setLayer("anamnese")} className={actionCls}>
          Anamnese
        </button>
        <button type="button" onClick={() => setLayer("freedom")} className={actionCls}>
          Freedom Map
        </button>
      </div>
    </div>
  );
}
