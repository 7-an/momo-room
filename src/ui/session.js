import { STORAGE_KEY, freshState, restoreState } from '../core/index.js?v=20261029a';
import { $ } from './dom.js?v=20261029a';
// The one live game state for this page. Other modules read it through this binding.
export let state, storageAvailable = true;
// Per-action cooldowns live in memory only, so a refresh resets them.
export const cooldowns = new Map();
export function load() {
  try { state = restoreState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { state = freshState(); }
}
export function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#save-status').textContent = storageAvailable ? '进度已保存' : '本次进度暂不能保存';
}
export const GREET_COOLDOWN = 3000;
export const greetCoolingDown = (now = Date.now()) => now - (cooldowns.get('greet') || 0) < GREET_COOLDOWN;
