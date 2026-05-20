import { useState } from "react";
import { LayoutDashboard, Dumbbell, BookOpen, Activity, Brain, BarChart2 } from "lucide-react";
import Dashboard from "./views/Dashboard.jsx";
import Session from "./views/Session.jsx";
import Journal from "./views/Journal.jsx";
import Muscles from "./views/Muscles.jsx";
import Learn from "./views/Learn.jsx";
import WeeklyReview from "./views/WeeklyReview.jsx";

const VIEWS = [
  { id: "dashboard", label: "Heute",    icon: LayoutDashboard, component: Dashboard },
  { id: "session",   label: "Training", icon: Dumbbell,        component: Session },
  { id: "journal",   label: "Journal",  icon: BookOpen,        component: Journal },
  { id: "muscles",   label: "Muskeln",  icon: Activity,        component: Muscles },
  { id: "learn",     label: "Lernen",   icon: Brain,           component: Learn },
  { id: "weekly",    label: "Woche",    icon: BarChart2,        component: WeeklyReview },
];

export default function App() {
  const [view, setView] = useState("dashboard");
  const Active = VIEWS.find((v) => v.id === view)?.component ?? Dashboard;

  return (
    <>
      <main>
        <Active onNavigate={setView} />
      </main>
      <nav>
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
