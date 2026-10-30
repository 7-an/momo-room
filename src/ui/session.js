import { STORAGE_KEY, freshState, restoreState } from '../core/index.js?v=20261030e';
import { $ } from './dom.js?v=20261030e';
// The one live game state for this page. Other modules read it through this binding.
export let state, storageAvailable = true;
// When the player was last here, read before restoring moves `updatedAt` to now.
export let lastVisitAt = null;
// Per-action cooldowns live in memory only, so a refresh resets them.
export const cooldowns = new Map();
export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(raw?.updatedAt)) lastVisitAt = raw.updatedAt;
    state = restoreState(raw);
  }
  catch { state = freshState(); }
}
export function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#save-status').textContent = storageAvailable ? '进度已保存' : '本次进度暂不能保存';
}
export const GREET_COOLDOWN = 3000;
export const greetCoolingDown = (now = Date.now()) => now - (cooldowns.get('greet') || 0) < GREET_COOLDOWN;

// The town's clock. On a local preview, `?time=15:00` jumps the world to that time of day
// without touching save timestamps; the published site always follows the real clock.
const timeOffset = (() => {
  if (typeof location === 'undefined' || !['localhost', '127.0.0.1'].includes(location.hostname)) return 0;
  const match = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(location.search).get('time') ?? '');
  if (!match) return 0;
  const target = new Date(); target.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return target.getTime() - Date.now();
})();
export const worldNow = () => Date.now() + timeOffset;
