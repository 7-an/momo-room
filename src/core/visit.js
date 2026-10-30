import { friendship } from './relationship.js?v=20261030d';
import { care, chat } from './care.js?v=20261030d';
import { canMeet, whereabouts } from './world.js?v=20261030d';
import { discover, matchDiscoveries } from '../persona/index.js?v=20261030d';

// One interaction in the world: she has to be here and awake enough, then the usual rules apply,
// then anything she revealed about herself goes into the guide.
// `options`: { now, worldNow, score, topic, choice, checkMeet }.
// `now` stamps the save; `worldNow` is the town clock (the same unless a preview shifts it).
// A chat passes topic and choice. A finished game skips the meeting check: she was there when it began.
export function visit(state, action, { now = Date.now(), worldNow = now, score = 0, topic, choice, checkMeet = true } = {}) {
  const meeting = checkMeet ? canMeet(state, action, worldNow) : { ok: true, where: whereabouts(state, worldNow) };
  if (!meeting.ok) return meeting;
  const before = friendship(state.xp).level;
  const result = topic ? chat(state, topic, choice, now) : care(state, action, score, now);
  if (!result.ok) return result;
  const after = friendship(state.xp).level, stages = [];
  for (let stage = before + 1; stage <= Math.min(5, after); stage++) stages.push(stage);
  // Waking her from a nap reveals nothing new.
  const on = action === 'sleep' && !state.sleeping ? null : action;
  const ids = matchDiscoveries({ on, level: after, topic, choice, activity: meeting.where.activity, patience: result.patience, stages });
  const discovered = ids.filter(id => discover(state, id, now));
  return { ...result, where: meeting.where, discovered };
}
