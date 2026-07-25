function cleanList(items) {
  return [...new Set((items || []).map(v => String(v || '').trim()).filter(Boolean))]
}

function unwrapLesson(ex) {
  const lesson = ex?.lesson || ex?.anatomy_teaching || ex?.teaching || null
  return lesson && typeof lesson === 'object' ? lesson : null
}

function flattenLessonJointActions(value) {
  if (!value) return []
  if (Array.isArray(value)) return cleanList(value)
  if (typeof value !== 'object') return cleanList([value])
  const lines = []
  for (const [joint, jointData] of Object.entries(value)) {
    if (jointData && typeof jointData === 'object' && !Array.isArray(jointData)) {
      for (const phase of ['eccentric', 'concentric', 'stabilization']) {
        const items = cleanList(jointData[phase] || [])
        if (items.length) lines.push(`${joint} ${phase}: ${items.join(', ')}`)
      }
    } else {
      lines.push(`${joint}: ${String(jointData)}`)
    }
  }
  return cleanList(lines)
}

function lowerText(ex) {
  return `${ex?.name || ''} ${ex?.category || ''}`.toLowerCase()
}

function inferMovement(ex) {
  const lesson = unwrapLesson(ex)
  if (lesson) {
    const pattern = lesson.movement_pattern
    const primary = typeof pattern === 'string' ? pattern : pattern?.primary || ''
    const learningGoal = lesson.learning_goal || {}
    const trainer = lesson.trainer_explanation || {}
    const quizItem = Array.isArray(lesson.quiz) ? lesson.quiz[0] : lesson.quiz
    return {
      title: lesson.title || 'Anatomie-Lektion',
      pattern: primary || 'Bewegungsmuster',
      lesson: learningGoal.detailed || trainer.technical || trainer.simple || '',
      jointActions: flattenLessonJointActions(lesson.joint_actions),
      feel: cleanList(lesson.feel_cues || [trainer.client_friendly || trainer.simple || ''])[0] || '',
      cues: cleanList(lesson.coaching_cues || []),
      errors: cleanList(lesson.common_errors || []).map(err => ({
        error: err.error || 'Fehler',
        reason: err.anatomical_reason || '',
        fix: err.correction || err.coaching_cue || '',
      })),
      quiz: quizItem?.question || 'Was lehrt diese Übung?',
    }
  }

  const text = lowerText(ex)
  const has = (...parts) => parts.some(p => text.includes(p))

  if (has('dip', 'press', 'bench', 'fly', 'push-up', 'push up', 'incline', 'incline dumbbell')) {
    return {
      title: 'Drueckmuster',
      pattern: 'Horizontales oder schraeges Druecken',
      lesson: 'Die Schulter erzeugt Druck nach vorne/oben, der Trizeps streckt den Ellenbogen und die Schulterblattkontrolle haelt den Druck stabil.',
      jointActions: ['Schulter: horizontale Adduktion oder Flexion', 'Ellenbogen: Extension', 'Scapula: Stabilisierung unter Last'],
      feel: 'Last ruhig und kontrolliert ablassen, dann kraftvoll und ohne Schulterhochziehen pressen.',
      cues: ['Rippen unten halten', 'Ellbogen nicht komplett ausfalten lassen', 'Schulterblaetter kontrolliert setzen'],
      errors: [
        { error: 'Schultern ziehen hoch', reason: 'Fehlende Scapula-Kontrolle oder zu viel Last', fix: 'Last reduzieren und Brustkorb stabil halten' },
        { error: 'Ellbogen flaren unkontrolliert', reason: 'Hebel wird fuer die Schulter unguenstig', fix: 'Ellbogenbahn leicht vor dem Oberkoerper fuehren' },
      ],
      quiz: 'Warum spuerst du Bankdruecken oft nicht nur in der Brust?'
    }
  }

  if (has('pull up', 'pull-up', 'lat', 'row', 'pulldown', 'pull')) {
    return {
      title: 'Zugmuster',
      pattern: 'Vertikales oder horizontales Ziehen',
      lesson: 'Rueckenmuskeln ziehen den Oberarm oder den Schulterguertel, waehrend der Armbeuger und die Rumpfspannung die Linie stabilisieren.',
      jointActions: ['Schulter: Adduktion, Extension oder Depressionskontrolle', 'Ellenbogen: Flexion', 'Scapula: Depression und Retraktion'],
      feel: 'Zieh die Ellbogen Richtung Rippen oder Huefte, statt mit den Haenden zu rucken.',
      cues: ['Schultern weg von den Ohren', 'Brust ruhig anheben', 'Ellbogen statt Handgriffe ziehen'],
      errors: [
        { error: 'Mit den Armen wackeln statt dem Ruecken zu ziehen', reason: 'Rumpf und Scapula verlieren Spannung', fix: 'Tempo senken und Schulterblattbewegung fuehlen' },
        { error: 'Schultern hochziehen', reason: 'Depression fehlt', fix: 'Nacken lang machen und Last sauber fuehren' },
      ],
      quiz: 'Woran merkst du, dass der Lat die Arbeit uebernimmt?'
    }
  }

  if (has('squat', 'lunge', 'leg press', 'split squat', 'step-up')) {
    return {
      title: 'Knie-dominantes Beinmuster',
      pattern: 'Kniebeugung und -streckung mit Hueftstabilitaet',
      lesson: 'Quadrizeps streckt das Knie, Gesaess und Adduktoren stabilisieren Huefte und Beinachse.',
      jointActions: ['Huefte: Flexion und Extension', 'Knie: Flexion und Extension', 'Sprunggelenk: Dorsalflexion unter Last'],
      feel: 'Druck ueber Fussmitte und ruhige Beinachse nach unten/oben.',
      cues: ['Knie folgt den Zehen', 'Fuss dreipunktig belasten', 'Torso stabil halten'],
      errors: [
        { error: 'Knie kippen nach innen', reason: 'Hueft- und Fusskontrolle ist zu schwach', fix: 'Becken stabilisieren und Schrittlage anpassen' },
        { error: 'Oberkoerper bricht ein', reason: 'Core oder Lastverteilung stimmt nicht', fix: 'Last reduzieren und Spannung vor dem Absenken setzen' },
      ],
      quiz: 'Warum ist Beinachse bei Ausfallschritten so wichtig?'
    }
  }

  if (has('deadlift', 'hinge', 'rdl', 'romanian', 'good morning', 'hip thrust')) {
    return {
      title: 'Hueftdominantes Beinmuster',
      pattern: 'Hinge und Streckarbeit aus Huefte und Rueckenlinie',
      lesson: 'Gesaess und hintere Kette erzeugen die Arbeit, waehrend Core und Lat die Position sichern.',
      jointActions: ['Huefte: Flexion und Extension', 'Knie: leicht gebeugt oder stabilisiert', 'Wirbelsaeule: isometrische Rumpfspannung'],
      feel: 'Die Huefte schiebt nach hinten und die Kraft kommt aus der Rueckseite der Beine.',
      cues: ['Ruecken lang halten', 'Huefte nach hinten schieben', 'Last nah am Koerper fuehren'],
      errors: [
        { error: 'Runder Ruecken unter Last', reason: 'Spannung oder Mobility passt nicht', fix: 'Last verkleinern und Hinge sauber aufbauen' },
        { error: 'Zu viel Kniebeugung', reason: 'Bewegung wird zu squat-lastig', fix: 'Huefte klar nach hinten schicken' },
      ],
      quiz: 'Was unterscheidet einen Hinge von einer Kniebeuge?'
    }
  }

  if (has('curl', 'biceps', 'bizeps')) {
    return {
      title: 'Armbeugung',
      pattern: 'Ellenbogenflexion mit stabiler Schulterposition',
      lesson: 'Bizeps und Mitspieler beugen den Ellenbogen, waehrend die Schulter ruhig bleibt.',
      jointActions: ['Ellenbogen: Flexion', 'Schulter: Stabilisierung', 'Unterarm: Griffkontrolle'],
      feel: 'Die Arbeit bleibt sauber im Arm, nicht im Schwung des ganzen Koerpers.',
      cues: ['Ellbogen ruhig halten', 'Keine Ruecklage', 'Bewegung kontrolliert beenden'],
      errors: [
        { error: 'Schwung aus dem Oberkoerper', reason: 'Zu viel Last oder zu wenig Kontrolle', fix: 'Satzgewicht reduzieren und Tempo straffen' },
      ],
      quiz: 'Warum bleibt der Ellbogen beim Curl moeglichst ruhig?'
    }
  }

  if (has('extension', 'trizeps', 'triceps', 'pushdown', 'kickback', 'skullcrusher', 'french press')) {
    return {
      title: 'Armstreckung',
      pattern: 'Ellenbogenextension gegen Widerstand',
      lesson: 'Trizeps streckt den Ellenbogen, waehrend Schulter und Oberarm die Ausgangsposition halten.',
      jointActions: ['Ellenbogen: Extension', 'Schulter: Stabilisierung', 'Handgelenk: neutrale Fuehrung'],
      feel: 'Der Oberarm bleibt fixiert, nur der Unterarm bewegt sich kontrolliert nach unten und oben.',
      cues: ['Oberarm ruhig halten', 'Ellbogen nicht ueberstrecken', 'Tempo im Rueckweg bewusst bremsen'],
      errors: [
        { error: 'Oberarm wandert mit', reason: 'Zu viel Last oder fehlende Fixierung', fix: 'Gewicht reduzieren und Oberarm bewusst am Koerper/Kopf fixieren' },
      ],
      quiz: 'Warum bleibt der Oberarm bei Trizeps-Extensions fixiert?'
    }
  }

  if (has('lateral raise', 'seitheben', 'front raise', 'frontheben', 'rear delt', 'reverse fly', 'face pull', 'delt fly', 'y-raise', 'arm raises')) {
    return {
      title: 'Schulter-Isolation',
      pattern: 'Abduktion oder Rotation im Schultergelenk',
      lesson: 'Die Deltamuskulatur hebt oder rotiert den Arm im Schultergelenk, waehrend Scapula und Rumpf die Ausgangsstellung sichern.',
      jointActions: ['Schulter: Abduktion, Flexion oder horizontale Extension', 'Scapula: Stabilisierung', 'Ellenbogen: leicht gebeugt fixiert'],
      feel: 'Der Impuls kommt aus der Schulter, nicht aus Schwung von Huefte oder Ruecken.',
      cues: ['Kein Schwung aus dem Koerper', 'Schultern unten lassen', 'Leichte Ellbogenbeugung halten'],
      errors: [
        { error: 'Schwung durch Koerperrotation', reason: 'Last ist fuer die reine Schulterarbeit zu hoch', fix: 'Gewicht reduzieren und Tempo kontrollieren' },
        { error: 'Trapezius uebernimmt', reason: 'Schulter zieht bei zu viel Last nach oben', fix: 'Schulterblatt tief und stabil halten' },
      ],
      quiz: 'Warum uebernimmt bei Seitheben schnell der Trapezius?'
    }
  }

  if (has('shrug', 'schulterheben')) {
    return {
      title: 'Schultergürtel-Elevation',
      pattern: 'Scapula-Elevation',
      lesson: 'Der obere Trapezius hebt den Schultergueretl direkt nach oben, ohne Rotation im Ellenbogen oder Schulterhauptgelenk.',
      jointActions: ['Scapula: Elevation', 'Schulter: minimale Bewegung', 'Wirbelsaeule: neutral stabilisiert'],
      feel: 'Die Schultern ziehen senkrecht Richtung Ohren und senken sich wieder kontrolliert.',
      cues: ['Keine Rollbewegung', 'Nacken lang lassen', 'Oben kurz halten'],
      errors: [
        { error: 'Schultern rollen nach vorne/hinten', reason: 'Bewegung wird statt rein vertikal kreisend ausgefuehrt', fix: 'Bewegung auf reine Elevation ohne Rotation reduzieren' },
      ],
      quiz: 'Welcher Muskel hebt beim Shrug den Schultergueretl?'
    }
  }

  if (has('calf raise', 'wadenheben', 'calf')) {
    return {
      title: 'Sprunggelenk-Streckung',
      pattern: 'Plantarflexion im Sprunggelenk',
      lesson: 'Wadenmuskulatur (Gastrocnemius/Soleus) hebt die Ferse durch Plantarflexion, Rumpf und Bein bleiben stabil.',
      jointActions: ['Sprunggelenk: Plantarflexion', 'Knie: je nach Variante gestreckt oder gebeugt', 'Huefte: Stabilisierung'],
      feel: 'Der Druck kommt aus dem Vorfuss, die Ferse hebt kontrolliert bis zur vollen Streckung.',
      cues: ['Volle Bewegungsamplitude nutzen', 'Kontrolliert absenken', 'Kein Wippen aus dem Knie'],
      errors: [
        { error: 'Nur kleine Teilbewegung', reason: 'Last zu hoch fuer sauberen Bewegungsradius', fix: 'Last reduzieren und volle Amplitude fahren' },
      ],
      quiz: 'Welche zwei Muskeln bilden die Wade?'
    }
  }

  if (has('crunch', 'sit-up', 'sit up', 'plank', 'plank', 'core', 'bauch', 'rollout', 'ab wheel', 'draw-in', 'hollow', 'dead bug', 'russian twist')) {
    return {
      title: 'Rumpfstabilisation',
      pattern: 'Flexion, Rotation oder isometrische Stabilisierung des Rumpfes',
      lesson: 'Die Bauchmuskulatur beugt die Wirbelsaeule oder haelt sie isometrisch gegen Kippmomente stabil.',
      jointActions: ['Wirbelsaeule: Flexion oder isometrische Stabilisierung', 'Becken: neutrale Kontrolle', 'Huefte: je nach Variante beteiligt'],
      feel: 'Die Spannung kommt aus der Bauchmitte, der untere Ruecken bleibt ruhig am Boden oder in Linie.',
      cues: ['Rippen Richtung Becken ziehen', 'Kein Zug am Nacken', 'Atmung nicht anhalten'],
      errors: [
        { error: 'Zug am Nacken statt Bauchspannung', reason: 'Bauchmuskulatur wird umgangen', fix: 'Haende locker halten, Bewegung aus dem Rumpf einleiten' },
        { error: 'Hohlkreuz unter Last', reason: 'Rumpfstabilitaet fehlt', fix: 'Bewegungsradius verkleinern und Becken neutral fixieren' },
      ],
      quiz: 'Warum sollte beim Crunch kein Zug am Nacken entstehen?'
    }
  }

  if (has('rotation', 'external rotation', 'internal rotation', 'rotator cuff', 'aussenrotation', 'innenrotation')) {
    return {
      title: 'Rotatorenmanschette / Gelenkrotation',
      pattern: 'Innen- oder Aussenrotation im Schultergelenk',
      lesson: 'Die kleinen Rotatorenmanschetten-Muskeln (u.a. Infraspinatus, Teres minor, Subscapularis) zentrieren den Oberarmkopf und drehen ihn kontrolliert.',
      jointActions: ['Schulter: Innen- oder Aussenrotation', 'Ellenbogen: meist 90° fixiert', 'Scapula: Stabilisierung'],
      feel: 'Die Bewegung bleibt klein und praezise, der Oberarm liegt ruhig am Koerper an.',
      cues: ['Ellbogen am Koerper fixieren', 'Leichtes Gewicht, saubere Bahn', 'Kein Schwung aus der Schulter'],
      errors: [
        { error: 'Oberarm loest sich vom Koerper', reason: 'Last zu hoch fuer die kleinen Stabilisatoren', fix: 'Gewicht deutlich reduzieren' },
      ],
      quiz: 'Warum arbeitet man bei Rotatorenmanschetten-Uebungen mit sehr leichtem Gewicht?'
    }
  }

  const primary = cleanList(ex?.primaryMuscles)
  if (primary.length) {
    return {
      title: 'Isolations- oder Zusatzuebung',
      pattern: `Gezielte Beanspruchung von ${primary.slice(0, 2).join(', ')}`,
      lesson: `Diese Uebung beansprucht gezielt ${primary.join(', ')}${cleanList(ex?.secondaryMuscles).length ? ` (unterstuetzt von ${cleanList(ex.secondaryMuscles).slice(0, 2).join(', ')})` : ''} — Fokus liegt auf sauberer, isolierter Ausfuehrung statt auf einem grossen Kraftdreikampf-Bewegungsmuster.`,
      jointActions: ['Bewegung isoliert auf den Zielmuskel fokussiert', 'Nachbargelenke stabilisieren mit'],
      feel: `Die Spannung sollte klar in ${primary[0]} spuerbar sein, nicht in Ausweichmuskulatur.`,
      cues: ['Zielmuskel bewusst anspannen', 'Kontrolliertes Tempo', 'Volle Bewegungsamplitude nutzen'],
      errors: [
        { error: 'Ausweichbewegung uebernimmt', reason: 'Last zu hoch fuer saubere Isolation', fix: 'Gewicht reduzieren und Zielmuskel bewusst fuehren' },
      ],
      quiz: `Woran merkst du, dass ${primary[0]} bei dieser Uebung wirklich arbeitet?`
    }
  }

  return {
    title: 'Ganzkoerper- oder Stabilisationsmuster',
    pattern: 'Allgemeine Kraft- und Kontrollarbeit',
    lesson: 'Die Uebung schult eine Mischung aus Kraft, Koordination und Koerperkontrolle.',
    jointActions: ['Mehrere Gelenke arbeiten gemeinsam', 'Rumpf stabilisiert', 'Bewegung bleibt sauber und reproduzierbar'],
    feel: 'Saubere Spannung, klare Linie, keine Ausweichbewegung.',
    cues: ['Kontrolliert bewegen', 'Spannung vor Wiederholung setzen', 'Technik vor Last'],
    errors: [
      { error: 'Bewegung wird unsauber', reason: 'Last oder Tempo sind zu hoch', fix: 'Satz vereinfachen und sauber wiederholen' },
    ],
    quiz: 'Welche Gelenke muessen hier am meisten stabilisieren?'
  }
}

function inferRegionLabels(ex) {
  const lesson = unwrapLesson(ex)
  if (lesson?.body_highlighter_regions) {
    const regions = lesson.body_highlighter_regions
    const labels = []
    const add = (value) => {
      for (const item of cleanList(Array.isArray(value) ? value : [value])) {
        if (!labels.includes(item)) labels.push(item)
      }
    }
    if (Array.isArray(regions)) {
      add(regions)
    } else if (typeof regions === 'object') {
      add(regions.primary || [])
      add(regions.secondary || [])
      add(regions.light || [])
    }
    if (labels.length) return labels
  }

  const muscles = cleanList([...(ex?.primaryMuscles || []), ...(ex?.secondaryMuscles || [])]).join(' | ').toLowerCase()
  const labels = []
  const add = (label) => { if (!labels.includes(label)) labels.push(label) }

  if (/chest|pec|pectoral/.test(muscles)) add('Brust vorne')
  if (/lat|back|trapezius|rhomboid/.test(muscles)) add('Ruecken')
  if (/shoulder|deltoid/.test(muscles)) add('Schulter')
  if (/triceps/.test(muscles)) add('Oberarm hinten')
  if (/biceps/.test(muscles)) add('Oberarm vorne')
  if (/quad|quadriceps/.test(muscles)) add('Oberschenkel vorne')
  if (/hamstring|biceps femoris/.test(muscles)) add('Oberschenkel hinten')
  if (/glute/.test(muscles)) add('Gesaess')
  if (/core|abs|abdom/.test(muscles)) add('Core')
  if (/calf|gastrocnemius|soleus/.test(muscles)) add('Waden')

  if (!labels.length) {
    const movement = inferMovement(ex).title
    if (movement.includes('Drueck')) add('Brust / Schulter / Trizeps')
    else if (movement.includes('Zug')) add('Ruecken / Arme')
    else if (movement.includes('Bein')) add('Beine / Gesaess')
    else add('Ganzkoerper')
  }

  return labels
}

export function buildExerciseInsights(rawEx) {
  // KB-/Coach-Sheet-Records liefern snake_case (primary_muscles, display_name -
  // aus core/resolver.py::ExerciseRecord), Session-Eintraege camelCase
  // (primaryMuscles, displayName - aus dem Firestore-Session-Schema). Ohne
  // diese Normalisierung liefen alle primaryMuscles-Zugriffe fuer frisch
  // enrichte KB-Exercises leer, und die UI fiel immer auf den generischen
  // "Ganzkoerper"-Fallback zurueck, obwohl echte Muskeldaten vorlagen.
  const ex = {
    ...rawEx,
    primaryMuscles: rawEx?.primaryMuscles || rawEx?.primary_muscles,
    secondaryMuscles: rawEx?.secondaryMuscles || rawEx?.secondary_muscles,
    displayName: rawEx?.displayName || rawEx?.display_name,
  }
  const primary = cleanList(ex?.primaryMuscles)
  const secondary = cleanList(ex?.secondaryMuscles)
  const lesson = unwrapLesson(ex)
  const movement = inferMovement(ex)
  const regions = inferRegionLabels(ex)
  const title = ex?.displayName || ex?.name || 'Uebung'
  const category = ex?.category || 'Unbekannte Kategorie'
  const equipment = Array.isArray(ex?.equipment) ? ex.equipment.join(', ') : (ex?.equipment || 'Unbekannt')

  const coachCues = cleanList([
    ...movement.cues,
    ...(lesson?.coaching_cues || []),
    ...(primary.length ? [`Treiber: ${primary.slice(0, 2).join(', ')}`] : []),
    ...(secondary.length ? [`Mitspieler: ${secondary.slice(0, 2).join(', ')}`] : []),
  ])

  const lessonErrors = Array.isArray(lesson?.common_errors) ? lesson.common_errors : []
  const commonErrors = (lessonErrors.length ? lessonErrors : movement.errors).map(err => ({
    error: err.error || err,
    anatomicalReason: err.anatomical_reason || err.reason || '',
    correction: err.correction || err.fix || '',
    coachingCue: err.coaching_cue || err.fix || '',
  }))

  return {
    title,
    category,
    equipment,
    movement,
    regions,
    primary,
    secondary,
    coachCues,
    commonErrors,
    learningGoal: lesson?.learning_goal?.detailed || movement.lesson,
    detailedMeaning: lesson?.trainer_explanation?.technical || movement.lesson,
    simpleMeaning: movement.pattern,
    feelCues: cleanList([
      movement.feel,
      ...(lesson?.feel_cues || []),
      primary[0] ? `Achte auf ${primary[0]}.` : '',
    ]),
    quiz: [
      {
        question: lesson?.quiz?.question || lesson?.quiz?.[0]?.question || movement.quiz,
        answer: lesson?.quiz?.answer || lesson?.quiz?.[0]?.answer || movement.lesson,
      },
    ],
  }
}

export function buildExerciseCoachSheet(ex) {
  const i = buildExerciseInsights(ex)
  return [
    `---`,
    `type: exercise-coach-sheet`,
    `exercise: ${JSON.stringify(i.title)}`,
    `category: ${JSON.stringify(i.category)}`,
    `---`,
    `# ${i.title}`,
    ``,
    `## Was es lehrt`,
    `- ${i.learningGoal}`,
    ``,
    `## Setup`,
    `- Kategorie: ${i.category}`,
    `- Equipment: ${i.equipment}`,
    `- Body Regions: ${i.regions.join(', ')}`,
    ``,
    `## Muskeln`,
    `- Primaer: ${i.primary.length ? i.primary.join(', ') : 'n/a'}`,
    `- Sekundaer: ${i.secondary.length ? i.secondary.join(', ') : 'n/a'}`,
    ``,
    `## Coaching Cues`,
    ...i.coachCues.map(c => `- ${c}`),
    ``,
    `## Fehlerbilder`,
    ...i.commonErrors.map(err => `- ${err.error}: ${err.anatomicalReason} -> ${err.correction}`),
    ``,
    `## Quiz`,
    `- ${i.quiz[0].question}`,
  ].join('\n')
}

export function buildSessionCoachSheet(session) {
  const exercises = session?.exercises || []

  const rows = exercises.map(ex => `| ${ex.name || 'Uebung'} | ${ex.sets ?? ''} | ${ex.reps ?? ''} | ${ex.weight ?? ''} | ${ex.note || ''} |`)

  return [
    `---`,
    `type: training-session`,
    `date: ${JSON.stringify(session?.date || '')}`,
    `block: ${JSON.stringify(session?.block || '')}`,
    `---`,
    `# Session ${session?.date || ''}`,
    ``,
    `## Summary`,
    `- Block: ${session?.block || 'n/a'}`,
    `- Effort: ${session?.effort ?? 'n/a'}`,
    `- Mood: ${session?.mood || 'n/a'}`,
    ``,
    `## Exercises`,
    `| Done | Exercise | Sets | Reps | Weight | Note |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...(rows.length ? rows : [`| - | - | - | - | - | - |`]),
    ``,
    `## Notes`,
    session?.notes ? session.notes : '-',
  ].join('\n')
}
