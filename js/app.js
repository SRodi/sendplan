import { renderApp } from "./ui.js";

let program;
let selectedPhase = 1;
      document.querySelector("#workout-strip").scrollLeft = 0;
let selectedWorkoutId;
const phaseFor = (workout) => Number(workout.name.match(/Wk\s*(\d+)/i)?.[1]) <= 4 ? 1 : 2;

function render() {
  const workouts = program.workouts.filter((workout) => phaseFor(workout) === selectedPhase);
  if (!workouts.length) throw new Error(`No workouts found for phase ${selectedPhase}`);
  if (!workouts.some((workout) => workout.id === selectedWorkoutId)) selectedWorkoutId = workouts[0].id;

  renderApp(program, workouts, selectedPhase, selectedWorkoutId, {
    selectPhase(phase) {
      selectedPhase = phase;
      render();
      document.querySelector("#workout-strip").scrollLeft = 0;
    },
    selectWorkout(id) {
      selectedWorkoutId = id;
      render();
      scrollTo({ top: 0, behavior: "smooth" });
    },
  });
}

try {
  const response = await fetch("./data.json");
  if (!response.ok) throw new Error(`Training data request failed: ${response.status}`);
  program = await response.json();
  if (!program?.name || !Array.isArray(program.workouts)) throw new Error("Invalid training data");
  render();
} catch {
  document.querySelector("#workout-view").innerHTML = "<p class=load-error>Training data could not be loaded.</p>";
} finally {
  document.body.classList.add("ready");
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");