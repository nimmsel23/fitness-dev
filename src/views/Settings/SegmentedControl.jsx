export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div>
      {label && (
        <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">{label}</div>
      )}
      <div className="flex gap-1 p-1 bg-fit-bg2 rounded-xl border border-fit-line">
        {options.map(({ id, label }) => (
          <button
            key={String(id)}
            onClick={() => onChange(id)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              value === id ? 'bg-fit-card shadow-md text-fit-accent' : 'text-fit-dim hover:text-fit-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
