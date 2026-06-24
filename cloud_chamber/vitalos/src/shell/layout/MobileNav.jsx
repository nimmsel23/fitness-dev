import { NAV_ITEMS } from '@shell/NavigationItems';

export default function MobileNav({ tab, navigate, swipeHint }) {
  const currentIndex = NAV_ITEMS.findIndex(i => i.id === tab);
  const swipeTargetId =
    swipeHint === 'left'  ? NAV_ITEMS[currentIndex + 1]?.id :
    swipeHint === 'right' ? NAV_ITEMS[currentIndex - 1]?.id : null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
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

      <div className="bg-fit-card/90 backdrop-blur-2xl border-t border-fit-line/40 px-2 pt-2 pb-3">
        <div className="flex items-end justify-around">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = tab === id;
            const isSwipeTarget = id === swipeTargetId;

            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className="flex flex-col items-center gap-[5px] px-1 active:scale-90 transition-transform duration-150 min-w-[40px]"
              >
                <div className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-fit-accent w-12 h-8 shadow-lg shadow-fit-accent/30'
                    : isSwipeTarget
                      ? 'ring-1 ring-fit-accent/60 bg-fit-accent/10 w-10 h-8'
                      : 'w-10 h-8'
                }`}>
                  <Icon
                    size={isActive ? 17 : 19}
                    className={
                      isActive       ? 'text-black stroke-[2.5]' :
                      isSwipeTarget  ? 'text-fit-accent stroke-[2]' :
                                       'text-fit-dim stroke-[1.8]'
                    }
                  />
                </div>
                <span className={`text-[7.5px] font-black uppercase tracking-wide leading-none transition-all duration-300 ${
                  isActive      ? 'text-fit-accent opacity-100' :
                  isSwipeTarget ? 'text-fit-accent/70 opacity-100' :
                                  'text-fit-dim opacity-50'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
