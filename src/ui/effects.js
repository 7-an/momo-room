import { state } from './session.js?v=20261029a';
import { $ } from './dom.js?v=20261029a';
let reactionTimeout, sleepEffectInterval;
export function effect(kind = 'heart', count = 5, point) {
  const room = $('#room');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span'); el.className = `effect ${kind}`;
    el.textContent = { heart: '♡', star: '✦', sleep: 'z', flower: '✿', bubble: '' }[kind];
    const x = point?.x ?? room.clientWidth * .5, y = point?.y ?? room.clientHeight * .44;
    el.style.left = `${x + (Math.random() - .5) * 150}px`;
    el.style.top = `${y + (Math.random() - .5) * 90}px`;
    el.style.animationDelay = `${i * .1}s`;
    $('#effects').append(el); setTimeout(() => el.remove(), 2400);
  }
}
// Briefly switches the sprite pose, then returns to idle (or sleeping).
export function react(type, duration = 2100) {
  clearTimeout(reactionTimeout);
  $('#sprite').className = `sprite ${type}`;
  reactionTimeout = setTimeout(() => $('#sprite').className = `sprite${state.sleeping ? ' sleeping' : ''}`, duration);
}
// Drops any pending pose and shows the resting sprite right away.
export function resetPose() {
  clearTimeout(reactionTimeout);
  $('#sprite').className = `sprite${state.sleeping ? ' sleeping' : ''}`;
}
export function syncSleepEffect() {
  clearInterval(sleepEffectInterval);
  if (state.sleeping) sleepEffectInterval = setInterval(() => { if (!document.hidden) effect('sleep', 2); }, 2400);
}
