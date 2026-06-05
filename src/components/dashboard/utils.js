import { Footprints, Bike, Waves, Activity } from "lucide-react";

export const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
  hiking: "#48c87a", running: "#e05060", cycling: "#38bdf8", swimming: "#5294e2", yoga: "#bd93f9"
};

export const ACTIVITY_LABELS = {
  hiking: "Wandern",
  running: "Laufen",
  cycling: "Radfahren",
  swimming: "Schwimmen",
  yoga: "Yoga"
};

export const ACTIVITY_ICONS = {
  hiking: Footprints,
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
  yoga: Activity
};

export function blockColor(block, activity) {
  if (activity?.type && BLOCK_COLORS[activity.type]) return BLOCK_COLORS[activity.type];
  if (!block) return "var(--accent)";
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}

export function getRolling10Days() {
  const dates = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
