// She has limited patience for the same thing over and over. Each action looks back over its own window:
// the first `comfy` times count fully, the next `enough` times count for `rate` of the gain,
// and beyond that she's had too much: `over` costs her affection, or `refuse` turns it down outright.
// Windows roll, so patience comes back on its own as time passes.
export const PATIENCE = {
  pet: { window: 30, comfy: 3, enough: 2, rate: 0, over: { xp: -3, joy: -6 } },
  greet: { window: 60, comfy: 12, enough: 6, rate: .5, over: { xp: 0, joy: 0 } },
  gift: { window: 24 * 60, comfy: 2, enough: 2, rate: .5, refuse: '今天已经收了好多了。心意我知道，留着下次吧。' },
  wash: { window: 180, comfy: 1, enough: 0, rate: 0, over: { xp: -2, joy: -5 } }
};
const MINUTE = 60000;

export function freshRecent() { return { pet: [], greet: [], gift: [], wash: [], annoyedAt: 0 }; }
export function restoreRecent(raw, now = Date.now()) {
  const recent = freshRecent();
  if (!raw || typeof raw !== 'object') return recent;
  for (const action of Object.keys(PATIENCE)) {
    if (!Array.isArray(raw[action])) continue;
    const since = now - PATIENCE[action].window * MINUTE;
    recent[action] = raw[action].filter(t => Number.isFinite(t) && t > since && t <= now).sort((a, b) => a - b).slice(-30);
  }
  if (Number.isFinite(raw.annoyedAt) && raw.annoyedAt > 0 && raw.annoyedAt <= now) recent.annoyedAt = raw.annoyedAt;
  return recent;
}
// How she'd take one more of this action right now: 'comfy', 'enough' or 'over'.
export function patienceFor(state, action, now = Date.now()) {
  const rule = PATIENCE[action];
  if (!rule) return { tier: 'comfy', count: 0 };
  const since = now - rule.window * MINUTE;
  const count = (state.recent?.[action] ?? []).filter(t => t > since && t <= now).length;
  const tier = count < rule.comfy ? 'comfy' : count < rule.comfy + rule.enough ? 'enough' : 'over';
  return { tier, count, rule, left: Math.max(0, rule.comfy - count) };
}
export function recordPatience(state, action, now = Date.now()) {
  const rule = PATIENCE[action];
  if (!rule) return;
  const since = now - rule.window * MINUTE;
  state.recent[action] = [...state.recent[action].filter(t => t > since && t <= now), now].slice(-30);
}
// Recently pushed past her patience; it colours her mood for half an hour.
export const annoyedNow = (state, now = Date.now()) => now - (state.recent?.annoyedAt ?? 0) < 30 * MINUTE;
