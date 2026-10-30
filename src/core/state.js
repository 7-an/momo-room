import { friendship } from './relationship.js?v=20261030c';
import { freshJourney, restoreJourney } from './journey.js?v=20261030c';
import { placeById } from '../content/town.js?v=20261030c';
export const STORAGE_KEY = 'momo-room-v1';
export const DEFAULT_NAME = '啵啵';
// `version` stays 1 so the previous release can still read this save after a rollback.
// Structural changes are tracked by `schema` and upgraded step by step in `migrate()`.
export const SAVE_VERSION = 1;
export const SAVE_SCHEMA = 2;
export const clamp = (n, low = 0, high = 100) => Math.min(high, Math.max(low, n));
export const dayKey = (now = Date.now()) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const number = (value, fallback, max = 100) => typeof value === 'number' && Number.isFinite(value) ? clamp(value, 0, max) : fallback;
const DISCOVERY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function freshState(now = Date.now()) {
  return { version: SAVE_VERSION, schema: SAVE_SCHEMA, name: DEFAULT_NAME, food: 75, joy: 80, energy: 90, xp: 0, coins: 0, sleeping: false, night: false, sound: false, createdAt: now, updatedAt: now, journey: freshJourney(), discoveries: [], world: { place: 'home', seen: 0 }, daily: { day: dayKey(now), stage: 1, greet: 0, pet: 0, feed: 0, play: 0, claimed: false } };
}
// Each step upgrades one schema to the next without touching fields it doesn't own.
const migrations = {
  // Schema 2 adds the persona facts the player has discovered and where in town the player is.
  // Nothing to backfill: an older save starts at her home with an empty guide.
  1: raw => ({ ...raw, schema: 2, discoveries: [], world: { place: 'home', seen: 0 } })
};
export function migrate(raw) {
  let data = raw, schema = Number.isInteger(raw.schema) && raw.schema >= 1 ? raw.schema : 1;
  while (schema < SAVE_SCHEMA) { data = migrations[schema](data); schema++; }
  return data;
}
export function restoreDiscoveries(raw, now = Date.now()) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set(), out = [];
  for (const item of raw) {
    // Early schema-2 builds stored bare ids; read them as discovered "now".
    const entry = typeof item === 'string' ? { id: item, at: now } : item;
    if (!entry || typeof entry.id !== 'string' || entry.id.length > 48 || !DISCOVERY_ID.test(entry.id) || seen.has(entry.id)) continue;
    if (!Number.isFinite(entry.at) || entry.at <= 0 || entry.at > now) continue;
    // Keep ids the current persona doesn't know yet, so editing persona data never erases progress.
    seen.add(entry.id); out.push({ id: entry.id, at: entry.at });
  }
  return out.slice(0, 300);
}
// `place`: where in town the player is. `seen`: how many discoveries the player has already looked at.
export function restoreWorld(raw) {
  const place = typeof raw?.place === 'string' && placeById(raw.place) ? raw.place : 'home';
  return { place, seen: Math.floor(number(raw?.seen, 0, 300)) };
}
export function restoreState(input, now = Date.now()) {
  const state = freshState(now);
  if (!input || typeof input !== 'object' || input.version !== SAVE_VERSION) return state;
  const raw = migrate(input);
  for (const key of ['food', 'joy', 'energy']) state[key] = number(raw[key], state[key]);
  for (const key of ['xp', 'coins']) state[key] = number(raw[key], 0, 1e7);
  for (const key of ['sleeping', 'night', 'sound']) state[key] = raw[key] === true;
  if (typeof raw.name === 'string' && raw.name.trim()) state.name = Array.from(raw.name.trim()).slice(0, 12).join('');
  // Upgrade the original default name without resetting progress or custom names.
  if (state.name === '小糯') state.name = DEFAULT_NAME;
  state.journey = restoreJourney(raw.journey, now);
  state.discoveries = restoreDiscoveries(raw.discoveries, now);
  state.world = restoreWorld(raw.world);
  // A place that isn't open at this relationship (an edited save, say) sends the player home.
  if ((placeById(state.world.place)?.level ?? 99) > friendship(state.xp).level) state.world.place = 'home';
  for (const key of ['createdAt', 'updatedAt']) state[key] = number(raw[key], now, now) || now;
  state.daily.stage = Math.min(5, friendship(state.xp).level);
  if (raw.daily?.day === dayKey(now)) {
    for (const key of ['greet', 'pet', 'feed', 'play']) state.daily[key] = number(raw.daily[key], 0, 999);
    state.daily.claimed = raw.daily.claimed === true;
    state.daily.stage = Math.max(1, Math.floor(number(raw.daily.stage, raw.daily.claimed ? 4 : friendship(state.xp).level, 5)));
  }
  applyElapsed(state, now);
  return state;
}
export function applyElapsed(state, now = Date.now()) {
  const minutes = clamp((now - state.updatedAt) / 60000, 0, 720);
  state.food = clamp(state.food - Math.min(minutes / 3, 24), 20, 100);
  state.joy = clamp(state.joy - Math.min(minutes / 5, 18), 25, 100);
  state.energy = state.sleeping ? clamp(state.energy + minutes * 4) : clamp(state.energy - Math.min(minutes / 4, 20), 20, 100);
  state.updatedAt = now;
  if (state.daily.day !== dayKey(now)) state.daily = { day: dayKey(now), stage: Math.min(5, friendship(state.xp).level), greet: 0, pet: 0, feed: 0, play: 0, claimed: false };
  return state;
}
