import { friendship, whereabouts, awaySummary, dayKey } from '../core/index.js?v=20261030c';
import { stageFor } from '../content/dialogue.js?v=20261030c';
import { followup } from '../content/journey.js?v=20261030c';
import { arrivalLine } from '../content/world.js?v=20261030c';
import { placeById } from '../content/town.js?v=20261030c';
import { state, save, worldNow } from './session.js?v=20261030c';
import { render } from './render.js?v=20261030c';
import { $, toast, speak } from './dom.js?v=20261030c';
import { resetPose } from './effects.js?v=20261030c';

// What the player last saw her doing, so a change in her schedule gets a fresh line.
let lastScene = '';
const sceneKey = () => { const where = whereabouts(state, worldNow()); return `${state.world.place}|${where.place}|${where.activity}|${where.asleep}`; };

// Says the right first thing for the current scene: yesterday's follow-up, a stage opening, or what she's doing.
export function greetScene({ first = false } = {}) {
  lastScene = sceneKey();
  const where = whereabouts(state, worldNow());
  if (where.place !== state.world.place) return;
  const level = friendship(state.xp).level;
  if (state.sleeping) { speak('我在打盹。醒了再聊吧。'); return; }
  if (!where.asleep) {
    const continued = followup(state, level, dayKey());
    if (continued) { speak(continued); state.journey.followupDay = dayKey(); save(); return; }
  }
  // A brand-new player at home still gets the original first line.
  speak(first && level === 1 && !state.journey.memories.length && !where.asleep && where.place === 'home' ? stageFor(1).opening : arrivalLine(where.activity, level));
}
// Called on every tick: when her schedule moves on, the scene updates and she says something new.
export function watchSchedule() {
  if (sceneKey() === lastScene) return;
  render(); resetPose(); greetScene();
}

export function travel(id) {
  const place = placeById(id);
  if (!place || place.level > friendship(state.xp).level) return;
  state.world.place = id;
  render(); save(); resetPose(); greetScene();
  const where = whereabouts(state, worldNow());
  toast(where.place === id ? `来到了${place.name}。她在这里。` : `来到了${place.name}。她现在在${placeById(where.place).name}。`);
}
export const findHer = () => travel(whereabouts(state, worldNow()).place);

// The 「你不在的时候」card, from her routine between two visits.
export function showAway(from) {
  const summary = from ? awaySummary(state, from, worldNow()) : null;
  $('#away-card').hidden = !summary;
  if (summary) $('#away-text').textContent = `你不在的 ${summary.hours} 小时里，她${summary.did.join('、')}。`;
}
export function initWorld() {
  $('#absent-go').addEventListener('click', findHer);
}
