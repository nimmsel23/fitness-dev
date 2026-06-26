/**
 * FuelApp — Federation Shim für VitalOS.
 * Rendert Fuels natives UI (Header + Tabs + Content) ohne SW/createRoot.
 */

import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useApp } from '@fuel/store.js'
import { TAB_CONFIG } from '@fuel/routes.js'
import TabContent from '@fuel/components/TabContent.jsx'
import NutritionHeatmap from '@fuel/components/NutritionHeatmap.jsx'
import { useAppData } from '@fuel/hooks/useAppData.js'
import { sumMetric, formatMetric } from '@fuel-shared/utils/utils.js'
import '@fuel/styles.embedded.css'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
})

function FuelInner() {
  const { activeTab, setActiveTab, activeDate, setActiveDate } = useApp()
  const { nutrition, sup, suppCatalog, suppLog, journal, macroTrend } = useAppData(activeDate)

  const meals = nutrition?.meals || []
  const totalKcal = sumMetric(meals, 'kcal')
  const totalProtein = sumMetric(meals, 'protein')
  const totalCarbs = sumMetric(meals, 'carbs')
  const totalFat = sumMetric(meals, 'fat')

  const ctx = { nutrition, sup, suppCatalog, suppLog, journal, macroTrend, activeDate, setActiveDate, setActiveTab }

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <header className="mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-orange-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Fuel Centre V3
                </p>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Nutrition Journal</h1>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Tagessumme</div>
              <div className="mt-2 text-3xl font-semibold text-orange-300">{formatMetric(totalKcal)} kcal</div>
              <div className="mt-1 flex justify-end gap-3 text-sm text-slate-400">
                <span><span className="text-emerald-300">{formatMetric(totalProtein)}</span> P</span>
                <span><span className="text-sky-300">{formatMetric(totalCarbs)}</span> K</span>
                <span><span className="text-violet-300">{formatMetric(totalFat)}</span> F</span>
              </div>
            </div>
          </div>

          <NutritionHeatmap selectedDate={activeDate} onSelectDate={setActiveDate} />

          <nav className="flex flex-wrap gap-2">
            {TAB_CONFIG.map(({ key, label, Icon }) => (
              <motion.button
                whileTap={{ scale: 0.96 }}
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  activeTab === key
                    ? 'border-orange-400/40 bg-orange-400 text-slate-950'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </motion.button>
            ))}
          </nav>
        </header>

        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-20 text-slate-500 text-sm">Laden…</div>
              }>
                <TabContent activeTab={activeTab} ctx={ctx} />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function FuelApp() {
  return (
    <QueryClientProvider client={qc}>
      <FuelInner />
    </QueryClientProvider>
  )
}
