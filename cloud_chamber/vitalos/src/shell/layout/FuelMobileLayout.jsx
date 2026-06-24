import { motion, AnimatePresence } from 'framer-motion'
import { NAV_ITEMS } from '@shell/NavigationItems'

const today = () => {
  const d = new Date()
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function FuelMobileLayout({ tab, navigate, children }) {
  return (
    <div className="lg:hidden flex flex-col min-h-[100dvh] bg-fit-bg text-fit-ink">

      {/* Header card — pushes pills into thumb zone */}
      <div className="mx-3 mt-3 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg px-5 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-fit-dim">VitalOS</p>
            <p className="text-sm font-semibold text-fit-ink mt-0.5">{today()}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-fit-accent/20 flex items-center justify-center">
            {(() => { const item = NAV_ITEMS.find(i => i.id === tab); return item ? <item.Icon size={15} className="text-fit-accent" /> : null })()}
          </div>
        </div>

        {/* Pill tabs — thumb zone */}
        <nav className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <motion.button
              key={id}
              onClick={() => navigate(id)}
              whileTap={{ scale: 0.93 }}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                tab === id
                  ? 'border-fit-accent/40 bg-fit-accent text-black'
                  : 'border-white/10 bg-white/5 text-fit-dim'
              }`}
            >
              <Icon size={11} />
              {label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
