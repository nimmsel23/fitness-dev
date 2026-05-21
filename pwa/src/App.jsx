import { useState, Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, color: "#ff6584" }}>
        <strong>Fehler:</strong> {this.state.error.message}
        <br />
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 12, padding: "6px 14px", borderRadius: 8, border: "1px solid #ff6584", background: "transparent", color: "#ff6584", cursor: "pointer" }}>
          Zurück
        </button>
      </div>
    );
    return this.props.children;
  }
}
import { Dumbbell, BookOpen, Activity, Brain, BarChart2 } from "lucide-react";
import Session from "./views/Session.jsx";
import Journal from "./views/Journal.jsx";
import Muscles from "./views/Muscles.jsx";
import Learn from "./views/Learn.jsx";
import WeeklyReview from "./views/WeeklyReview.jsx";

const VIEWS = [
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
        <ErrorBoundary key={view}>
          <Active onNavigate={setView} />
        </ErrorBoundary>
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
