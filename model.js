export const STORAGE_KEY = 'momo-room-v1';
export const clamp = (n, low = 0, high = 100) => Math.min(high, Math.max(low, n));
export const dayKey = (now = Date.now()) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const number = (value, fallback, max = 100) => typeof value === 'number' && Number.isFinite(value) ? clamp(value, 0, max) : fallback;
export function freshState(now = Date.now()) {
  return { version: 1, name: '小糯', food: 75, joy: 80, energy: 90, xp: 0, coins: 0, sleeping: false, night: false, sound: false, createdAt: now, updatedAt: now, daily: { day: dayKey(now), pet: 0, feed: 0, play: 0, claimed: false } };
}
export function restoreState(raw, now = Date.now()) {
  const state = freshState(now);
  if (!raw || raw.version !== 1) return state;
  for (const key of ['food', 'joy', 'energy']) state[key] = number(raw[key], state[key]);
  for (const key of ['xp', 'coins']) state[key] = number(raw[key], 0, 1e7);
  for (const key of ['sleeping', 'night', 'sound']) state[key] = raw[key] === true;
  if (typeof raw.name === 'string' && raw.name.trim()) state.name = Array.from(raw.name.trim()).slice(0, 12).join('');
  for (const key of ['createdAt', 'updatedAt']) state[key] = number(raw[key], now, now) || now;
  if (raw.daily?.day === dayKey(now)) {
    for (const key of ['pet', 'feed', 'play']) state.daily[key] = number(raw.daily[key], 0, 999);
    state.daily.claimed = raw.daily.claimed === true;
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
  if (state.daily.day !== dayKey(now)) state.daily = { day: dayKey(now), pet: 0, feed: 0, play: 0, claimed: false };
  return state;
}
export function friendship(xp) {
  let level = 1, remaining = Math.floor(xp), needed = 60;
  while (remaining >= needed) { remaining -= needed; level++; needed = 60 + (level - 1) * 30; }
  const titles = ['初见的小伙伴', '熟悉的小伙伴', '亲密的好朋友', '默契的好朋友', '最喜欢的你'];
  return { level, remaining, needed, title: titles[Math.min(level - 1, titles.length - 1)] };
}
export function care(state, action, score = 0) {
  if (state.sleeping && action !== 'sleep') return { ok: false, message: '她正在做梦呢，先轻轻叫醒她吧。' };
  if (action === 'feed' && state.food >= 97) return { ok: false, message: '肚子已经饱饱的啦，晚一点再吃吧。' };
  if (action === 'gift' && state.coins < 10) return { ok: false, message: '还差一点星星糖，陪她玩一会儿就有啦。' };
  if (action === 'play' && state.energy < 30) return { ok: false, message: '有点困啦，先睡一小会儿再玩吧。' };
  const beforeLevel = friendship(state.xp).level;
  const delta = { pet: [0, 5, 0, 4, 1], feed: [20, 4, 0, 8, 2], wash: [0, 8, -2, 6, 2], gift: [0, 12, 0, 10, -10], play: [-3, 12, -10, 5 + score * 2, score] }[action];
  if (action === 'sleep') state.sleeping = !state.sleeping;
  else if (delta) {
    ['food', 'joy', 'energy'].forEach((key, i) => state[key] = clamp(state[key] + delta[i]));
    state.xp += delta[3]; state.coins += delta[4];
    if (['pet', 'feed', 'play'].includes(action)) state.daily[action]++;
  } else return { ok: false, message: '这个动作暂时还没有准备好。' };
  const completed = state.daily.pet >= 5 && state.daily.feed >= 1 && state.daily.play >= 1;
  let dailyReward = false;
  if (completed && !state.daily.claimed) { state.daily.claimed = true; state.coins += 20; dailyReward = true; }
  return { ok: true, dailyReward, levelUp: friendship(state.xp).level > beforeLevel };
}
