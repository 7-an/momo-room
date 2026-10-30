// Five relationship stages. Each action opens only once its stage is reached.
export const ACTION_LEVELS = { greet: 1, play: 2, feed: 3, gift: 3, sleep: 3, pet: 4, wash: 5 };
export const STAGE_TITLES = ['陌生人', '点头之交', '逐渐熟悉', '亲近的朋友', '特别的默契'];
const refusals = { pet: '我们还没那么熟。请先别碰我。', wash: '这个就不用你帮忙了。我们还不熟。', feed: '谢谢，不过我们还不熟。我先不收。', gift: '心意领了。礼物等熟悉一点再说吧。', play: '我们才刚认识。先打个招呼吧。', sleep: '我会自己休息。先慢慢认识吧。' };

export function friendship(xp) {
  let level = 1, remaining = Math.floor(xp), needed = 18;
  while (remaining >= needed) { remaining -= needed; level++; needed = 24; }
  return { level, remaining, needed, title: STAGE_TITLES[Math.min(level - 1, STAGE_TITLES.length - 1)] };
}
export function canInteract(state, action) {
  const requiredLevel = ACTION_LEVELS[action];
  if (!requiredLevel) return { ok: false, message: '这个动作暂时还没有准备好。' };
  if (action === 'sleep' && state.sleeping) return { ok: true, requiredLevel };
  if (friendship(state.xp).level < requiredLevel) return { ok: false, requiredLevel, message: refusals[action] };
  return { ok: true, requiredLevel };
}
