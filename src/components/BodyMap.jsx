const GROUP_COLORS = {
  chest:      '#ef4444',
  back:       '#3b82f6',
  shoulders:  '#f59e0b',
  arms:       '#a78bfa',
  core:       '#22c55e',
  glutes:     '#ec4899',
  quads:      '#f97316',
  hamstrings: '#06b6d4',
  calves:     '#8b5cf6',
}

const GROUP_LABELS = {
  chest:'Brust', back:'Rücken', shoulders:'Schultern', arms:'Arme',
  core:'Core', glutes:'Gesäß', quads:'Oberschenkel v.', hamstrings:'Oberschenkel h.', calves:'Waden',
}

// opacity: 0=untrained, 1-4 = hit levels
function hitLevel(score) {
  if (score >= 3) return 4
  if (score >= 2) return 3
  if (score >= 1) return 2
  if (score > 0)  return 1
  return 0
}

function zoneOpacity(level) {
  return [0.18, 0.4, 0.58, 0.75, 0.92][level]
}

export default function BodyMap({ groupScores = {}, onGroupClick }) {
  function zoneProps(groupId) {
    const gs = groupScores[groupId]
    const score = gs?.avg || 0
    const lvl = hitLevel(score)
    return {
      fill: GROUP_COLORS[groupId] || '#888',
      opacity: zoneOpacity(lvl),
      style: { cursor: 'pointer', transition: 'opacity 300ms' },
      onClick: () => onGroupClick && onGroupClick(groupId),
      onMouseEnter: e => { e.target.style.opacity = Math.min(zoneOpacity(lvl) + 0.2, 1) },
      onMouseLeave: e => { e.target.style.opacity = zoneOpacity(lvl) },
    }
  }

  return (
    <svg viewBox="0 0 200 440" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: '200px', width: '100%' }}>
      {/* Body outline */}
      <path d="M100 10 C115 10 125 20 125 35 C125 50 115 58 100 58 C85 58 75 50 75 35 C75 20 85 10 100 10Z"
        fill="var(--line)" opacity="0.3"/>
      <rect x="92" y="58" width="16" height="14" rx="4" fill="var(--line)" opacity="0.2"/>
      <path d="M68 72 L58 82 L52 130 L54 195 L72 210 L128 210 L146 195 L148 130 L142 82 L132 72Z"
        fill="var(--line)" opacity="0.12"/>
      <path d="M72 210 L65 300 L60 380 L55 420 L80 420 L82 380 L88 300 L93 240"
        fill="var(--line)" opacity="0.10"/>
      <path d="M128 210 L135 300 L140 380 L145 420 L120 420 L118 380 L112 300 L107 240"
        fill="var(--line)" opacity="0.10"/>

      {/* Muscle zones */}
      <ellipse data-group="chest"     cx="83"  cy="100" rx="18" ry="16" {...zoneProps('chest')} />
      <ellipse data-group="chest"     cx="117" cy="100" rx="18" ry="16" {...zoneProps('chest')} />
      <ellipse data-group="shoulders" cx="60"  cy="82"  rx="11" ry="14" {...zoneProps('shoulders')} />
      <ellipse data-group="shoulders" cx="140" cy="82"  rx="11" ry="14" {...zoneProps('shoulders')} />
      <ellipse data-group="arms"      cx="48"  cy="120" rx="8"  ry="22" transform="rotate(-10 48 120)" {...zoneProps('arms')} />
      <ellipse data-group="arms"      cx="152" cy="120" rx="8"  ry="22" transform="rotate(10 152 120)"  {...zoneProps('arms')} />
      <rect   data-group="core"       x="82"   y="120"  width="36" height="50" rx="6" {...zoneProps('core')} />
      <rect   data-group="back"       x="70"   y="82"   width="10" height="40" rx="4" {...zoneProps('back')} />
      <rect   data-group="back"       x="120"  y="82"   width="10" height="40" rx="4" {...zoneProps('back')} />
      <ellipse data-group="glutes"    cx="85"  cy="210" rx="16" ry="12" {...zoneProps('glutes')} />
      <ellipse data-group="glutes"    cx="115" cy="210" rx="16" ry="12" {...zoneProps('glutes')} />
      <ellipse data-group="quads"     cx="82"  cy="268" rx="14" ry="38" {...zoneProps('quads')} />
      <ellipse data-group="quads"     cx="118" cy="268" rx="14" ry="38" {...zoneProps('quads')} />
      <ellipse data-group="hamstrings" cx="75" cy="275" rx="7"  ry="32" {...zoneProps('hamstrings')} />
      <ellipse data-group="hamstrings" cx="125" cy="275" rx="7" ry="32" {...zoneProps('hamstrings')} />
      <ellipse data-group="calves"    cx="72"  cy="360" rx="10" ry="28" {...zoneProps('calves')} />
      <ellipse data-group="calves"    cx="128" cy="360" rx="10" ry="28" {...zoneProps('calves')} />
    </svg>
  )
}

export { GROUP_COLORS, GROUP_LABELS }
