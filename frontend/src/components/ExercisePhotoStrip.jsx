import { useState } from "react";
import { yuhonasImageUrls } from "../lib/yuhonasImage.js";

// Start-/Endposition nebeneinander statt einem einzelnen Vorschau-Thumbnail —
// zeigt die Bewegung, nicht nur eine Pose (yuhonas liefert dafür genau 2 Frames/Übung).
export default function ExercisePhotoStrip({ ex, className = "h-28" }) {
  const frames = yuhonasImageUrls(ex);
  const [broken, setBroken] = useState(() => new Set());

  if (frames.length === 0) return null;
  const visible = frames.filter((_, i) => !broken.has(i));
  if (visible.length === 0) return null;

  function markBroken(i) {
    setBroken((prev) => new Set(prev).add(i));
  }

  return (
    <div className={`grid ${visible.length === 2 ? "grid-cols-2" : "grid-cols-1"} gap-0.5 rounded-xl overflow-hidden bg-fit-bg2 ${className}`}>
      {frames.map((src, i) =>
        broken.has(i) ? null : (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => markBroken(i)}
          />
        )
      )}
    </div>
  );
}
