import { whereabouts } from '../core/index.js?v=20261030d';
import { state, worldNow } from './session.js?v=20261030d';
import { $ } from './dom.js?v=20261030d';
let reactionTimeout = null, sleepEffectInterval = null;
const EATING = ['breakfast', 'lunch', 'tea', 'dinner'];
// The sprite class she rests in between reactions: asleep, eating, or idle.
export function restingPose(now = worldNow()) {
  const where = whereabouts(state, now);
  if (where.asleep) return 'sprite sleeping';
  if (EATING.includes(where.activity)) return 'sprite pose-eat';
  return 'sprite';
}
export function effect(kind = 'heart', count = 5, point) {
  const room = $('#stage');
  for (let i = 0; i < count; i++) {
    const node = document.createElement('span'); node.className = `effect ${kind}`;
    node.textContent = { heart: '♡', star: '✦', sleep: 'z', flower: '✿', bubble: '' }[kind];
    const x = point?.x ?? room.clientWidth * .5, y = point?.y ?? room.clientHeight * .5;
    node.style.left = `${x + (Math.random() - .5) * 150}px`;
    node.style.top = `${y + (Math.random() - .5) * 90}px`;
    node.style.animationDelay = `${i * .1}s`;
    $('#effects').append(node); setTimeout(() => node.remove(), 2400);
  }
}
// Briefly switches the sprite pose, then returns to how she was resting.
export function react(type, duration = 2100) {
  clearTimeout(reactionTimeout);
  $('#sprite').className = `sprite ${type}`;
  reactionTimeout = setTimeout(() => { reactionTimeout = null; $('#sprite').className = restingPose(); }, duration);
}
// Drops any pending pose and shows the resting sprite right away.
export function resetPose() {
  clearTimeout(reactionTimeout); reactionTimeout = null;
  $('#sprite').className = restingPose();
}
// Keeps the resting pose current as her schedule moves on, without cutting a reaction short.
export function settlePose() { if (!reactionTimeout) $('#sprite').className = restingPose(); }
export function syncSleepEffect() {
  const asleep = whereabouts(state, worldNow()).asleep;
  if (asleep && sleepEffectInterval) return;
  clearInterval(sleepEffectInterval); sleepEffectInterval = null;
  if (asleep) sleepEffectInterval = setInterval(() => { if (!document.hidden && !$('#character').hidden) effect('sleep', 2); }, 2400);
}
