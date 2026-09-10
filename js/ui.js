const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);
const icon = (name, size = 18) => `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
const weekFor = (workout) => Number(workout.name.match(/Wk\s*(\d+)/i)?.[1]);
const phaseDetails = {
  1: {
    title: "Strength Foundation & Capacity",
    intent: "Build repeatable finger, pulling, pressing, and lower-body strength while establishing aerobic-power tolerance on the board.",
    effects: "Improved tissue tolerance, movement economy, work capacity, and a broader strength base for later high-intensity loading.",
    science: "Moderate volume at submaximal intensity accumulates useful practice and mechanical tension without excessive neural fatigue. The 15:15 board work develops recovery between hard moves and supports later anaerobic sessions.",
  },
  2: {
    title: "Strength-to-Power Conversion",
    intent: "Increase force-development speed while retaining the strength and capacity established in Phase 1.",
    effects: "Faster recruitment, better explosive pulling and pressing, and improved ability to express force quickly on climbing holds.",
    science: "Explosive intent shifts adaptation toward rate of force development. Moderate loads allow high movement velocity while the remaining aerobic-power work maintains repeat-effort capacity.",
  },
  3: {
    title: "Max Power & Recruitment",
    intent: "Express near-maximal finger and pulling force in two to three crisp reps, then transfer that recruitment to brief near-limit board efforts.",
    effects: "Higher motor-unit recruitment, increased peak force, improved contact strength, and greater power on difficult individual moves.",
    science: "Heavy low-rep work recruits high-threshold motor units with limited metabolic fatigue. Long rests restore phosphocreatine so each set remains a true power exposure rather than endurance work.",
  },
  4: {
    title: "Peaking & Taper",
    intent: "Retain maximal recruitment and climbing specificity while sharply reducing fatigue before the performance window.",
    effects: "Reduced residual fatigue, preserved neural readiness, and improved likelihood of expressing the strength and power built in earlier phases.",
    science: "A taper lowers volume while maintaining intensity, allowing fatigue to dissipate faster than fitness. Brief high-quality primers preserve coordination and recruitment without creating meaningful muscle damage.",
  },
};

function phaseOverviewMarkup(phase) {
  const details = phaseDetails[phase];
  return `<details>
    <summary>Phase ${phase}: ${escapeHtml(details.title)}</summary>
    <p><strong>Intent</strong>${escapeHtml(details.intent)}</p>
    <p><strong>Expected effects</strong>${escapeHtml(details.effects)}</p>
    <p><strong>Why this phase</strong>${escapeHtml(details.science)}</p>
  </details>`;
}

function sessionLabel(workout, workouts) {
  const week = weekFor(workout);
  const aerobic = /aerobic/i.test(workout.name);
  const sameKind = workouts.filter((item) => weekFor(item) === week && /aerobic/i.test(item.name) === aerobic);
  const day = aerobic
    ? sameKind.findIndex((item) => item.id === workout.id) + 1
    : Number(workout.name.match(/Day\s*(\d+)/i)?.[1] || 1);
  return `Week ${week} Day ${day}${aerobic ? " Aerobic" : ""}`;
}

function exerciseMarkup(exercise) {
  const tip = exercise.tips?.trim();
  const headers = exercise.metrics.map((metric) => `<span>${escapeHtml(metric.name)}</span>`).join("");
  const sets = exercise.sets.map((set) => {
    const values = exercise.metrics.map((metric) => {
      const target = set.targets[metric.key];
      if (!target) return "<span class=metric-empty>—</span>";
      const value = target.range?.some(Boolean) ? target.range.filter(Boolean).join("–") : target.value;
      return `<span class="metric-value"><strong>${escapeHtml(value ?? "—")}</strong><small>${escapeHtml(target.unit)}</small></span>`;
    }).join("");
    return `<div class="set-row"><span class="set-number">${set.number}</span>${values}</div>`;
  }).join("");

  return `<article class="exercise">
    <div class="exercise-heading"><div><p class="eyebrow">${exercise.sets.length} set${exercise.sets.length === 1 ? "" : "s"}</p><h3>${escapeHtml(exercise.name)}</h3></div></div>
    ${tip ? `<p class="exercise-tip">${escapeHtml(tip)}</p>` : ""}
    <div class="set-grid" style="--metrics:${exercise.metrics.length}">
      <div class="set-header"><span>Set</span>${headers}</div>${sets}
    </div>
  </article>`;
}

function workoutMarkup(workout, label) {
  const sections = workout.sections.map((section) => {
    const count = section.exercises.length;
    return `<section class="workout-section">
      <div class="section-heading"><span>${escapeHtml(section.name)}</span><span>${count} exercise${count === 1 ? "" : "s"}</span></div>
      ${section.exercises.map(exerciseMarkup).join("")}
    </section>`;
  }).join("");

  return `<div class="workout-hero">
    <p class="eyebrow">${escapeHtml(label)}</p>
    <h2>${escapeHtml(workout.name)}</h2>
    <div class="workout-meta"><span>${icon("timer", 16)} ${escapeHtml(workout.duration)} ${escapeHtml(workout.durationUnit)}</span><span>${icon("gauge", 16)} RPE ${escapeHtml(workout.targetRpe ?? "—")}</span></div>
    ${workout.description ? `<details><summary>Session notes</summary><p>${escapeHtml(workout.description)}</p></details>` : ""}
  </div>${sections}`;
}

export function renderApp(program, workouts, phase, selectedId, actions) {
  const selected = workouts.find((workout) => workout.id === selectedId) || workouts[0];
  $("#program-name").textContent = program.name;
  $("#phase-tabs").innerHTML = [1, 2, 3, 4].map((number) => `
    <button class="phase-button ${number === phase ? "active" : ""}" data-phase="${number}">Phase ${number}</button>`).join("");
  $("#phase-overview").innerHTML = phaseOverviewMarkup(phase);
  $("#workout-strip").innerHTML = workouts.map((workout) => {
    const label = sessionLabel(workout, workouts);
    return `<button class="session-button ${workout.id === selected.id ? "active" : ""}" data-id="${escapeHtml(workout.id)}">${escapeHtml(label)}</button>`;
  }).join("");
  $("#workout-view").innerHTML = workoutMarkup(selected, sessionLabel(selected, workouts));

  $("#phase-tabs").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => actions.selectPhase(Number(button.dataset.phase)));
  });
  $("#workout-strip").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => actions.selectWorkout(button.dataset.id));
  });
  window.lucide?.createIcons({ attrs: { "stroke-width": 2 } });
}
