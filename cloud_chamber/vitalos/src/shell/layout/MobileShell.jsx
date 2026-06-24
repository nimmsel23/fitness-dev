import MobileNav from './MobileNav.jsx'
import FuelMobileLayout from './FuelMobileLayout.jsx'

/**
 * Switcher zwischen klassischem Mobile-Layout (MobileNav bottom bar)
 * und Fuel-inspiriertem Mobile-Layout (glassmorphism header + pill tabs).
 *
 * Nur auf Mobile aktiv (lg:hidden via FuelMobileLayout / MobileNav).
 * Desktop-Layout bleibt unverändert in App.jsx.
 */
export default function MobileShell({ tab, navigate, mobileLayout, swipeHint, children }) {
  if (mobileLayout === 'fuel') {
    return (
      <div className="lg:hidden">
        <FuelMobileLayout tab={tab} navigate={navigate}>
          {children}
        </FuelMobileLayout>
      </div>
    )
  }

  // Classic: Content kommt von App.jsx main, wir rendern nur die Bottom-Nav
  return <MobileNav tab={tab} navigate={navigate} swipeHint={swipeHint} />
}
