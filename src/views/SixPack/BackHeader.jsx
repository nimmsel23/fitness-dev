import { ChevronLeft } from 'lucide-react';

export default function BackHeader({ label, onBack, backLabel = 'Home' }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#111' }}>
      <button onClick={onBack} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold">
        <ChevronLeft size={18} /> {backLabel}
      </button>
      <div className="flex-1 text-center text-sm font-black text-fit-ink">{label}</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

