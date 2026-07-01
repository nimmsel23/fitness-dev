import Model from "react-body-highlighter";

// yuhonas + wger muscle names → react-body-highlighter IDs
const TO_RBH = {
  // yuhonas
  chest:           "chest",
  shoulders:       "front-deltoids",
  triceps:         "triceps",
  lats:            "upper-back",
  "middle back":   "upper-back",
  "lower back":    "lower-back",
  traps:           "trapezius",
  biceps:          "biceps",
  forearms:        "forearm",
  quadriceps:      "quadriceps",
  hamstrings:      "hamstring",
  glutes:          "gluteal",
  calves:          "calves",
  abdominals:      "abs",
  neck:            "neck",
  adductors:       "adductor",
  abductors:       "abductors",
  // wger (name_en)
  "Biceps brachii":              "biceps",
  "Anterior deltoid":            "front-deltoids",
  "Posterior deltoid":           "back-deltoids",
  "Lateral deltoid":             "front-deltoids",
  "Serratus anterior":           "chest",
  "Pectoralis major":            "chest",
  "Pectoralis minor":            "chest",
  "Triceps brachii":             "triceps",
  "Rectus abdominis":            "abs",
  "Obliquus externus abdominis": "obliques",
  "Gastrocnemius":               "calves",
  "Soleus":                      "calves",
  "Gluteus maximus":             "gluteal",
  "Gluteus medius":              "gluteal",
  "Trapezius":                   "trapezius",
  "Quadriceps femoris":          "quadriceps",
  "Biceps femoris":              "hamstring",
  "Semitendinosus":              "hamstring",
  "Semimembranosus":             "hamstring",
  "Latissimus dorsi":            "upper-back",
  "Rhomboids":                   "upper-back",
  "Brachialis":                  "biceps",
  "Erector spinae":              "lower-back",
  "Rectus femoris":              "quadriceps",
  "Vastus lateralis":            "quadriceps",
  "Vastus medialis":             "quadriceps",
};

function normalize(name) {
  return TO_RBH[name] || TO_RBH[name?.toLowerCase()] || null;
}

// Converts workout exercises → react-body-highlighter data format
export function exercisesToRbhData(exercises) {
  const map = new Map();

  for (const ex of exercises) {
    const sets  = Number(ex.sets) || 1;
    const pm    = ex.primaryMuscles   || ex.primary_muscles   || [];
    const sm    = ex.secondaryMuscles || ex.secondary_muscles || [];

    for (const m of pm) {
      const id = normalize(m);
      if (!id) continue;
      const cur = map.get(id) || { name: id, muscles: [id], frequency: 0 };
      cur.frequency += sets;
      map.set(id, cur);
    }
    for (const m of sm) {
      const id = normalize(m);
      if (!id) continue;
      const cur = map.get(id) || { name: id, muscles: [id], frequency: 0 };
      cur.frequency += sets * 0.4;
      map.set(id, cur);
    }
  }

  return Array.from(map.values()).map(d => ({
    ...d,
    frequency: Math.round(d.frequency),
  }));
}

export default function BodyMap({ exercises = [], style = {} }) {
  const data = exercisesToRbhData(exercises);
  if (data.length === 0) return null;

  const modelStyle = { width: "100%", maxWidth: 180, ...style };

  return (
    <div className="flex justify-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-forge-muted">Vorne</span>
        <Model
          data={data}
          style={modelStyle}
          highlightedColors={["#3b82f6", "#1d4ed8"]}
          bodyColor="#1e293b"
          type="anterior"
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-forge-muted">Hinten</span>
        <Model
          data={data}
          style={modelStyle}
          highlightedColors={["#3b82f6", "#1d4ed8"]}
          bodyColor="#1e293b"
          type="posterior"
        />
      </div>
    </div>
  );
}
