// generatePrompt.mjs
// Build a Gemini prompt from the user's data fetched from Firestore.
// Expected input shape (simplified):
// {
//   workouts: [{ date: "2026-07-10", exercises: [{ name: "Squat" }, { name: "Bench" }] }],
//   habits: [{ name: "Meditation", completion: true }],
//   healthMetrics: { weight: "75kg", bmi: "23" }
// }

export function buildPrompt(userData) {
  const { workouts = [], habits = [], healthMetrics = {} } = userData;

  const workoutLines = workouts.map(w => {
    const exList = (w.exercises || []).map(e => e.name).join(", ");
    return `- ${w.date}: ${exList}`;
  }).join("\n");

  const habitLines = habits.map(h => `- ${h.name}: ${h.completion ? "✅" : "❌"}`).join("\n");

  const metricsLines = Object.entries(healthMetrics)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return `You are AlphaOS Coach. Summarize the following weekly data for the client:\n\nWorkouts:\n${workoutLines || "(none)"}\n\nHabits:\n${habitLines || "(none)"}\n\nHealth Metrics:\n${metricsLines || "(none)"}\n\nProvide a concise, motivational summary (max 200 words) and two actionable next‑week recommendations.`;
}
