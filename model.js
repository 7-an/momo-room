export const STORAGE_KEY = 'momo-room-v1';
export const DEFAULT_NAME = '啵啵';
export const ACTION_LEVELS = { greet: 1, play: 2, feed: 3, gift: 3, sleep: 3, pet: 4, wash: 4 };
export const clamp = (n, low = 0, high = 100) => Math.min(high, Math.max(low, n));
export const dayKey = (now = Date.now()) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const number = (value, fallback, max = 100) => typeof value === 'number' && Number.isFinite(value) ? clamp(value, 0, max) : fallback;
export function freshState(now = Date.now()) {
  return { version: 1, name: DEFAULT_NAME, food: 75, joy: 80, energy: 90, xp: 0, coins: 0, sleeping: false, night: false, sound: false, createdAt: now, updatedAt: now, daily: { day: dayKey(now), stage: 1, greet: 0, pet: 0, feed: 0, play: 0, claimed: false } };
}
export function restoreState(raw, now = Date.now()) {
  const state = freshState(now);
  if (!raw || raw.version !== 1) return state;
  for (const key of ['food', 'joy', 'energy']) state[key] = number(raw[key], state[key]);
  for (const key of ['xp', 'coins']) state[key] = number(raw[key], 0, 1e7);
  for (const key of ['sleeping', 'night', 'sound']) state[key] = raw[key] === true;
  if (typeof raw.name === 'string' && raw.name.trim()) state.name = Array.from(raw.name.trim()).slice(0, 12).join('');
  // Upgrade the original default name without resetting progress or custom names.
  if (state.name === '小糯') state.name = DEFAULT_NAME;
  for (const key of ['createdAt', 'updatedAt']) state[key] = number(raw[key], now, now) || now;
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
export function friendship(xp) {
  let level = 1, remaining = Math.floor(xp), needed = 60;
  while (remaining >= needed) { remaining -= needed; level++; needed = 60 + (level - 1) * 30; }
  const titles = ['陌生人', '点头之交', '逐渐熟悉', '亲近的朋友', '特别的默契'];
  return { level, remaining, needed, title: titles[Math.min(level - 1, titles.length - 1)] };
}
export function canInteract(state, action) {
  const requiredLevel = ACTION_LEVELS[action];
  if (!requiredLevel) return { ok: false, message: '这个动作暂时还没有准备好。' };
  if (action === 'sleep' && state.sleeping) return { ok: true, requiredLevel };
  if (friendship(state.xp).level < requiredLevel) {
    const messages = { pet: '我们还没那么熟。请先别碰我。', wash: '这个就不用你帮忙了。我们还不熟。', feed: '谢谢，不过我们还不熟。我先不收。', gift: '心意领了。礼物等熟悉一点再说吧。', play: '我们才刚认识。先打个招呼吧。', sleep: '我会自己休息。先慢慢认识吧。' };
    return { ok: false, requiredLevel, message: messages[action] };
  }
  return { ok: true, requiredLevel };
}
export function dailyPlan(state) {
  const stage = state.daily.stage;
  if (stage === 1) return [{ key: 'greet', target: 3, label: '打 3 次招呼' }];
  if (stage === 2) return [{ key: 'greet', target: 3, label: '聊 3 次天' }, { key: 'play', target: 1, label: '一起接一次星星' }];
  if (stage === 3) return [{ key: 'greet', target: 3, label: '聊 3 次天' }, { key: 'feed', target: 1, label: '带一份小点心' }, { key: 'play', target: 1, label: '一起接一次星星' }];
  return [{ key: 'pet', target: 5, label: '收到 5 次摸摸' }, { key: 'feed', target: 1, label: '吃一份小点心' }, { key: 'play', target: 1, label: '一起接一次星星' }];
}
export function care(state, action, score = 0) {
  const access = canInteract(state, action);
  if (!access.ok) return access;
  if (state.sleeping && action !== 'sleep') return { ok: false, message: '嘘，我才刚睡着。等醒了再陪你。' };
  if (action === 'feed' && state.food >= 97) return { ok: false, message: '已经饱啦。这份先留着，待会儿再给我。' };
  if (action === 'gift' && state.coins < 10) return { ok: false, message: '星星糖还不够呢。陪我接几颗再说。' };
  if (action === 'play' && state.energy < 30) return { ok: false, message: '先让我打个盹。醒了再比，免得你占便宜。' };
  const beforeLevel = friendship(state.xp).level;
  const delta = { greet: [0, 2, 0, beforeLevel === 1 ? 6 : 8, 0], pet: [0, 5, 0, 4, 1], feed: [20, 4, 0, 8, 2], wash: [0, 8, -2, 6, 2], gift: [0, 12, 0, 10, -10], play: [-3, 12, -10, 5 + score * 2, score] }[action];
  if (action === 'sleep') state.sleeping = !state.sleeping;
  else if (delta) {
    ['food', 'joy', 'energy'].forEach((key, i) => state[key] = clamp(state[key] + delta[i]));
    state.xp += delta[3]; state.coins += delta[4];
    if (['greet', 'pet', 'feed', 'play'].includes(action)) state.daily[action]++;
  } else return { ok: false, message: '这个动作暂时还没有准备好。' };
  const completed = dailyPlan(state).every(({ key, target }) => state.daily[key] >= target);
  let dailyReward = false;
  if (completed && !state.daily.claimed) { state.daily.claimed = true; state.coins += 20; dailyReward = true; }
  return { ok: true, dailyReward, levelUp: friendship(state.xp).level > beforeLevel };
}
