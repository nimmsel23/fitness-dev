const GROUP_LAYOUTS = {
  chest: { x: 152, y: 145, w: 106, h: 56, shape: "ellipse", maxCols: 2 },
  back: { x: 154, y: 145, w: 102, h: 78, shape: "rect", maxCols: 2 },
  shoulders: { x: 114, y: 132, w: 178, h: 44, shape: "ellipse", maxCols: 4 },
  arms: { x: 104, y: 186, w: 198, h: 114, shape: "ellipse", maxCols: 4 },
  core: { x: 174, y: 210, w: 62, h: 90, shape: "rect", maxCols: 2 },
  glutes: { x: 156, y: 304, w: 98, h: 52, shape: "ellipse", maxCols: 2 },
  quads: { x: 154, y: 350, w: 102, h: 156, shape: "ellipse", maxCols: 2 },
  hamstrings: { x: 144, y: 356, w: 122, h: 150, shape: "ellipse", maxCols: 2 },
  calves: { x: 162, y: 516, w: 86, h: 90, shape: "ellipse", maxCols: 2 },
};

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function attrsToString(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(" ");
}

function muscleCoverageColor(level) {
  const alpha = 0.12 + level * 0.84;
  return `rgba(57,255,20,${alpha.toFixed(3)})`;
}

function buildMuscleShapes(groupId, muscles) {
  const layout = GROUP_LAYOUTS[groupId];
  if (!layout || !muscles.length) return [];

  const cols = Math.min(layout.maxCols || 3, Math.max(1, Math.ceil(Math.sqrt(muscles.length))));
  const rows = Math.max(1, Math.ceil(muscles.length / cols));
  const cellW = layout.w / cols;
  const cellH = layout.h / rows;

  return muscles.map((muscle, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cx = layout.x + cellW * (col + 0.5);
    const cy = layout.y + cellH * (row + 0.5);
    const rx = Math.max(7, cellW * 0.38);
    const ry = Math.max(8, cellH * 0.38);

    if (layout.shape === "rect") {
      return {
        muscle,
        tag: "rect",
        attrs: {
          x: Number((cx - rx).toFixed(1)),
          y: Number((cy - ry).toFixed(1)),
          width: Number((rx * 2).toFixed(1)),
          height: Number((ry * 2).toFixed(1)),
          rx: Number(Math.max(6, Math.min(rx, ry) * 0.44).toFixed(1)),
        },
      };
    }

    return {
      muscle,
      tag: "ellipse",
      attrs: {
        cx: Number(cx.toFixed(1)),
        cy: Number(cy.toFixed(1)),
        rx: Number(rx.toFixed(1)),
        ry: Number(ry.toFixed(1)),
      },
    };
  });
}

export function renderSkeleton({
  root,
  anatomy,
  coverageByMuscle,
  onMuscleClick,
}) {
  if (!root) return;

  const groups = Array.isArray(anatomy?.muscle_groups) ? anatomy.muscle_groups : [];
  const muscles = Array.isArray(anatomy?.muscles) ? anatomy.muscles : [];

  const groupToMuscles = new Map();
  muscles.forEach((muscle) => {
    const groupId = muscle?.group;
    if (!groupId) return;
    if (!groupToMuscles.has(groupId)) groupToMuscles.set(groupId, []);
    groupToMuscles.get(groupId).push(muscle);
  });

  const musclesMarkup = groups
    .map((group) => {
      const groupId = group?.id;
      const shapes = buildMuscleShapes(groupId, groupToMuscles.get(groupId) || []);
      return shapes
        .map(({ muscle, tag, attrs }) => {
          const muscleId = muscle.id || "unknown-muscle";
          const deName = muscle?.names?.de || muscle?.names?.en || muscleId;
          const laName = muscle?.names?.la || "";
          const level = clamp01(coverageByMuscle?.[muscleId] ?? 0);
          const fillColor = muscleCoverageColor(level);
          const className = `skeleton-zone muscle-node${level >= 0.8 ? " is-hot" : ""}`;
          const title = `${deName}${laName ? ` (${laName})` : ""} - ${Math.round(level * 100)}%`;
          return `
            <g id="muscle-${muscleId}" class="${className}" data-muscle-id="${muscleId}" data-group-id="${groupId}" style="opacity:${(0.24 + level * 0.76).toFixed(3)};cursor:pointer;">
              <title>${title}</title>
              <${tag} ${attrsToString(attrs)} fill="${fillColor}" stroke="rgba(57,255,20,0.35)" stroke-width="1.4" />
            </g>
          `;
        })
        .join("\n");
    })
    .join("\n");

  root.innerHTML = `
    <svg viewBox="0 0 410 640" role="img" aria-label="2D fitness skeleton" class="w-full h-auto">
      <g opacity="0.3" stroke="#4b5563" fill="none" stroke-width="16" stroke-linecap="round">
        <circle cx="205" cy="86" r="42"></circle>
        <path d="M205 130 L205 560"></path>
        <path d="M132 162 Q205 210 278 162"></path>
        <path d="M147 270 L114 372"></path>
        <path d="M262 270 L294 372"></path>
        <path d="M205 315 L163 424"></path>
        <path d="M205 315 L247 424"></path>
        <path d="M163 424 L176 596"></path>
        <path d="M247 424 L234 596"></path>
      </g>
      <g id="muscle-overlays">
        ${musclesMarkup}
      </g>
    </svg>
  `;

  root.querySelectorAll("[data-muscle-id]").forEach((node) => {
    node.addEventListener("click", () => {
      const muscleId = node.getAttribute("data-muscle-id");
      const groupId = node.getAttribute("data-group-id");
      if (muscleId && typeof onMuscleClick === "function") {
        onMuscleClick({ muscleId, groupId: groupId || "" });
      }
    });
  });
}
