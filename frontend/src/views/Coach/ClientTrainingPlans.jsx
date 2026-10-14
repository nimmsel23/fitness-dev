import { useEffect, useState } from 'react';
import { getClientRoutinesProgress } from '@db';
import TrainingPlans from '../Plan/TrainingPlans.jsx';

// Dünner Lade-Wrapper: TrainingPlans.jsx braucht templates+workouts als
// Props (im Self-Service lädt WorkoutList.jsx die), für den Coach-Fall
// holen wir sie hier über den bestehenden Coach-Read-Pfad. Die eigentliche
// Trainingsplan-Logik (Bündelung, Ziel pro Template, "Heute dran") lebt nur
// in TrainingPlans.jsx — kein zweiter Nachbau.
export default function ClientTrainingPlans({ clientUid }) {
  const [data, setData] = useState(null);

  async function load() {
    setData(await getClientRoutinesProgress(clientUid));
  }
  useEffect(() => { load(); }, [clientUid]);

  if (!data) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  const templates = data.routines.filter((r) => r.category !== 'calisthenics-skill');
  return <TrainingPlans clientUid={clientUid} templates={templates} workouts={data.workouts} onChanged={load} />;
}
