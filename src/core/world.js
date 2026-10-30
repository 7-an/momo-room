import { dayKey } from './state.js?v=20261030d';
import { friendship } from './relationship.js?v=20261030d';
import { persona, activityAt } from '../persona/index.js?v=20261030d';
import { placeById } from '../content/town.js?v=20261030d';
import { annoyedNow } from './patience.js?v=20261030d';

// The world runs on the player's local clock. Nothing here changes state.
export const clockOf = (now = Date.now()) => {
  const d = new Date(now);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export function phaseOf(now = Date.now()) {
  const hour = new Date(now).getHours();
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}
const SEASONS = ['冬', '冬', '春', '春', '春', '夏', '夏', '夏', '秋', '秋', '秋', '冬'];
const BASE_TEMP = { 春: 17, 夏: 29, 秋: 21, 冬: 6 };
// Same weather all day, different from day to day. No network, no real forecast.
export function weatherOf(now = Date.now()) {
  let hash = 7;
  for (const char of dayKey(now)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 15), 2246822519) >>> 0;
  const season = SEASONS[new Date(now).getMonth()];
  let kind = ['sunny', 'sunny', 'sunny', 'cloudy', 'cloudy', 'rain'][hash % 6];
  if (kind === 'rain' && season === '冬') kind = 'snow';
  const temp = BASE_TEMP[season] + (hash >>> 8) % 5 - 2 - (kind === 'rain' ? 3 : 0);
  return { kind, season, temp, label: { sunny: '晴', cloudy: '多云', rain: '小雨', snow: '小雪' }[kind] };
}

// Where she is and what she's doing. A place the player hasn't opened yet sends her to `alt`
// (or home), so a stranger can always find her.
export function whereabouts(state, now = Date.now(), data = persona) {
  if (state.sleeping) return { activity: 'nap', place: 'home', label: '在打盹', did: '睡了个午觉', asleep: true, napping: true };
  const block = activityAt(now, data), level = friendship(state.xp).level;
  const place = placeById(block.place);
  const chosen = place && place.level <= level ? block : { activity: block.activity, label: block.label, did: block.did, ...block.alt, place: block.alt?.place ?? 'home' };
  return { activity: chosen.activity, place: chosen.place, label: chosen.label, did: chosen.did ?? chosen.label, asleep: block.asleep === true, napping: false };
}
export const placeOpen = (state, id) => (placeById(id)?.level ?? 99) <= friendship(state.xp).level;

const ACTION_NAMES = { greet: '说话', play: '玩游戏', feed: '吃点心', gift: '送礼物', sleep: '休息', pet: '摸摸', wash: '洗香香' };
// Whether this action can happen where the player is, right now. Relationship rules stay in canInteract().
export function canMeet(state, action, now = Date.now()) {
  const where = whereabouts(state, now), here = placeById(state.world.place) ?? placeById('home');
  if (where.place !== here.id) return { ok: false, away: true, where, message: `她现在不在${here.short}。${placeById(where.place).name}那边，${where.label}。` };
  if (!here.actions.includes(action)) return { ok: false, where, message: `在${here.short}不方便${ACTION_NAMES[action] ?? '这样'}。回家再说吧。` };
  // Asleep on her own schedule: a quiet word still reaches her, nothing else.
  if (where.asleep && !where.napping && action !== 'greet') return { ok: false, where, message: '她睡着了。小声说句话还行，别的等她醒了再说。' };
  return { ok: true, where };
}

const MOOD = { great: '很好', good: '不错', okay: '还行', low: '有点低落' };
const WEATHER_MOOD = { sunny: 5, cloudy: 0, rain: -5, snow: 3 };
const WEATHER_WHY = { sunny: '今天的阳光很好', cloudy: '天有点阴', rain: '下雨了，想窝着', snow: '下雪了，有点兴奋' };
// Her mood today: how she's been looked after, nudged by the weather.
export function moodOf(state, now = Date.now()) {
  const where = whereabouts(state, now), weather = weatherOf(now);
  const score = state.joy * 0.5 + state.food * 0.25 + state.energy * 0.25 + WEATHER_MOOD[weather.kind];
  const annoyed = annoyedNow(state, now);
  let key = score >= 80 ? 'great' : score >= 62 ? 'good' : score >= 45 ? 'okay' : 'low';
  // Pushed past her patience recently: at best「还行」, and she says why.
  if (annoyed && (key === 'great' || key === 'good')) key = 'okay';
  const why = annoyed ? '刚才被烦到了，有点不高兴' : where.asleep ? '睡得正香' : state.food < 40 ? '有点饿了' : state.energy < 35 ? '有点累' : state.joy < 45 ? '有点无聊' : where.activity === 'wake' ? '还没完全醒' : WEATHER_WHY[weather.kind];
  return { key, label: MOOD[key], why };
}

// What she did while the player was away, from her routine. Null for short absences.
export function awaySummary(state, from, to = Date.now()) {
  const hours = (to - from) / 3600000;
  if (!Number.isFinite(hours) || hours < 1) return null;
  const start = Math.max(from, to - 24 * 3600000), seen = [], current = whereabouts({ ...state, sleeping: false }, to).did;
  for (let t = start; t < to; t += 15 * 60000) {
    const did = whereabouts({ ...state, sleeping: false }, t).did;
    if (did !== current && !seen.includes(did)) seen.push(did);
  }
  if (!seen.length) return null;
  return { hours: Math.min(24, Math.round(hours)), did: seen.slice(-3) };
}
