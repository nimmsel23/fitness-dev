import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

// Training (session) ist der mit Abstand meistgenutzte Tab und startet
// standardmäßig offen — deshalb erscheinen seine Subtabs (Heute/Timer/
// Skills/Plan/History) direkt als primäre Reihe in der Bottom Nav statt
// eines einzigen "Training"-Icons unter Gleichen. Alles andere (Review/
// Lernen/Anamnese-Fokus/Setup) wandert hinter "•••" ganz rechts — dahinter
// öffnet sich exakt die bisherige Nav-Bar-Zeile (gleiches Layout/Styling
// wie vorher), nur als Sheet statt permanent sichtbar.
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

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Swipe direction indicator — thin accent line at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-200 ${
        swipeHint === 'left'
          ? 'bg-gradient-to-l from-fit-accent via-[var(--accent)]/40 to-transparent opacity-80'
          : swipeHint === 'right'
            ? 'bg-gradient-to-r from-fit-accent via-[var(--accent)]/40 to-transparent opacity-80'
            : 'opacity-0'
      }`} />

      {showMore && (
        <div className="absolute bottom-full left-0 right-0 mb-1 px-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-fit-card/95 backdrop-blur-2xl border border-fit-line/40 rounded-2xl px-2 pt-2 pb-2 shadow-2xl">
            <div className="flex items-end justify-around">
              {navItems.map(({ id, label, Icon }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => openOther(id)}
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
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-fit-card/90 backdrop-blur-2xl border-t border-fit-line/40 px-2 pt-2 pb-3">
        <div className="flex items-end justify-around">
          {primaryItems.map(({ id: subId, label, Icon }) => {
            const isActive = isOnSession && (subTab === subId || (!subTab && subId === 'today'));
            return (
              <button
                key={subId}
                onClick={() => openPrimary(subId)}
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
            );
          })}

          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex flex-col items-center gap-[5px] px-1 active:scale-90 transition-transform duration-150 min-w-[40px]"
          >
            <div className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${
              showMore || isOnOtherTab ? 'bg-fit-accent w-12 h-8 shadow-lg shadow-fit-accent/30' : 'w-10 h-8'
            }`}>
              <MoreHorizontal size={isOnOtherTab || showMore ? 17 : 19} className={showMore || isOnOtherTab ? 'text-black stroke-[2.5]' : 'text-fit-dim stroke-[1.8]'} />
            </div>
            <span className={`text-[7.5px] font-black uppercase tracking-wide leading-none transition-all duration-300 ${
              showMore || isOnOtherTab ? 'text-fit-accent opacity-100' : 'text-fit-dim opacity-50'
            }`}>
              Mehr
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
