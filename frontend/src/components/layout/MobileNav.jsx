import { useState } from 'react';
import { MoreHorizontal, ChevronLeft } from 'lucide-react';

// Training (session) ist der mit Abstand meistgenutzte Tab und startet
// standardmäßig offen — deshalb erscheinen seine Subtabs (Heute/Timer/
// Skills/Plan/History) direkt als primäre Reihe in der Bottom Nav statt
// eines einzigen "Training"-Icons unter Gleichen. Alles andere (Review/
// Lernen/Anamnese-Fokus/Setup) wandert hinter "•••" ganz rechts — ein Tap
// tauscht die Icons derselben Zeile gegen die bisherigen Nav-Items aus
// (keine zweite Zeile/kein Sheet), der Button wird dann zum "Zurück".
export default function MobileNav({ tab, subTab, navigate, navigateSub, swipeHint, navItems }) {
  const [showMore, setShowMore] = useState(false);

  const sessionItem = navItems.find((i) => i.id === 'session');
  const primaryItems = sessionItem?.sub || [];
  const isOnSession = tab === 'session';
  const isOnOtherTab = !isOnSession;

  function openPrimary(subId) {
    setShowMore(false);
    if (!isOnSession) navigate('session');
    navigateSub(subId);
  }

  function openOther(id) {
    setShowMore(false);
    navigate(id);
  }

  const rowItems = showMore
    ? navItems.map(({ id, label, Icon }) => ({
        id, label, Icon,
        isActive: tab === id,
        onClick: () => openOther(id),
      }))
    : primaryItems.map(({ id, label, Icon }) => ({
        id, label, Icon,
        isActive: isOnSession && (subTab === id || (!subTab && id === 'today')),
        onClick: () => openPrimary(id),
      }));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-fit-card/90 backdrop-blur-2xl border-t border-fit-line/40">
      {/* Swipe direction indicator — thin accent line at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-200 ${
        swipeHint === 'left'
          ? 'bg-gradient-to-l from-fit-accent via-[var(--accent)]/40 to-transparent opacity-80'
          : swipeHint === 'right'
            ? 'bg-gradient-to-r from-fit-accent via-[var(--accent)]/40 to-transparent opacity-80'
            : 'opacity-0'
      }`} />

      <div
        className="px-2 pt-2"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-end justify-around">
          {rowItems.map(({ id, label, Icon, isActive, onClick }) => (
            <button
              key={id}
              onClick={onClick}
              className="flex flex-col items-center gap-[5px] px-1 active:scale-90 transition-transform duration-150 min-w-[40px]"
            >
              <div className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-fit-accent w-12 h-8 shadow-lg shadow-fit-accent/30' : 'w-10 h-8'
              }`}>
                <Icon size={isActive ? 17 : 19} className={isActive ? 'text-black stroke-[2.5]' : 'text-fit-dim stroke-[1.8]'} />
              </div>
              <span className={`text-[7.5px] font-black uppercase tracking-wide leading-none transition-all duration-300 ${
                isActive ? 'text-fit-accent opacity-100' : 'text-fit-dim opacity-50'
              }`}>
                {label}
              </span>
            </button>
          ))}

          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex flex-col items-center gap-[5px] px-1 active:scale-90 transition-transform duration-150 min-w-[40px]"
          >
            <div className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${
              showMore || isOnOtherTab ? 'bg-fit-accent w-12 h-8 shadow-lg shadow-fit-accent/30' : 'w-10 h-8'
            }`}>
              {showMore
                ? <ChevronLeft size={17} className="text-black stroke-[2.5]" />
                : <MoreHorizontal size={isOnOtherTab ? 17 : 19} className={isOnOtherTab ? 'text-black stroke-[2.5]' : 'text-fit-dim stroke-[1.8]'} />}
            </div>
            <span className={`text-[7.5px] font-black uppercase tracking-wide leading-none transition-all duration-300 ${
              showMore || isOnOtherTab ? 'text-fit-accent opacity-100' : 'text-fit-dim opacity-50'
            }`}>
              {showMore ? 'Zurück' : 'Mehr'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
