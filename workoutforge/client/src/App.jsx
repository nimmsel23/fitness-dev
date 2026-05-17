import { useState } from "react";
import WorkoutList from "./views/WorkoutList.jsx";
import WorkoutBuilder from "./views/WorkoutBuilder.jsx";

export default function App() {
  // route: { view: "list" | "builder", workoutId?: string }
  const [route, setRoute] = useState({ view: "list" });

  function openBuilder(workoutId) {
    setRoute({ view: "builder", workoutId });
  }

  function goHome() {
    setRoute({ view: "list" });
  }

  return (
    <div className="min-h-screen bg-forge-bg text-forge-ink">
      {route.view === "list" && (
        <WorkoutList onOpen={openBuilder} />
      )}
      {route.view === "builder" && (
        <WorkoutBuilder workoutId={route.workoutId} onBack={goHome} />
      )}
    </div>
  );
}
