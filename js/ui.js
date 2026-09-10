const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);
const icon = (name, size = 18) => `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
const weekFor = (workout) => Number(workout.name.match(/Wk\s*(\d+)/i)?.[1]);

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
    <div class="exercise-heading"><div><p class="eyebrow">${exercise.sets.length} sets</p><h3>${escapeHtml(exercise.name)}</h3></div></div>
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
  $("#phase-tabs").innerHTML = [1, 2].map((number) => `
    <button class="phase-button ${number === phase ? "active" : ""}" data-phase="${number}">Phase ${number}</button>`).join("");
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
