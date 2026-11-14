import { useSettingsStore } from '@learn/store/index.js'
import { signOut } from '@db'

export default function LearnSettings({ user }) {
  const { muscleLanguage, setMuscleLanguage } = useSettingsStore()
  return <section className="max-w-xl mx-auto p-4 space-y-4">
    <h1 className="text-2xl font-bold">Learn · Einstellungen</h1>
    <label className="block">Muskelnamen<select className="block bg-fit-card border border-fit-line rounded p-3" value={muscleLanguage} onChange={e => setMuscleLanguage(e.target.value)}><option value="de">Deutsch</option><option value="en">English</option><option value="lat">Latein</option></select></label>
    <p>{user?.displayName || user?.email}</p>
    <button onClick={() => signOut()}>Abmelden</button>
  </section>
}
