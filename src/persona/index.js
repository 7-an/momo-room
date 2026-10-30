import { persona } from './persona.js?v=20261030c';
// Read-only queries over persona data. Pass another persona object to test alternatives.
export { persona };
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const STATUSES = ['placeholder', 'draft', 'reviewed'];
export const FOUND_EVENTS = ['greet', 'play', 'feed', 'gift', 'sleep', 'pet', 'wash', 'stage'];
// The guide's four shelves, in display order.
export const SHELVES = [
  { key: 'likes', kind: 'like', label: '喜欢' },
  { key: 'dislikes', kind: 'dislike', label: '不喜欢' },
  { key: 'opinions', kind: 'opinion', label: '观点' },
  { key: 'phrases', kind: 'phrase', label: '口头禅' }
];

export const minutesOf = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export function validatePersona(data = persona) {
  const errors = [], ids = new Set();
  if (!STATUSES.includes(data?.status)) errors.push(`status 必须是 ${STATUSES.join(' / ')}`);
  const checkId = (id, where) => {
    if (typeof id !== 'string' || !ID.test(id) || id.length > 48) errors.push(`${where}：id「${id}」只能用小写字母、数字和连字符`);
    else if (ids.has(id)) errors.push(`${where}：id「${id}」重复`);
    else ids.add(id);
  };
  const text = (value, where) => { if (typeof value !== 'string' || !value.trim()) errors.push(`${where} 不能为空`); };
  const found = (rule, where) => {
    if (!rule || !FOUND_EVENTS.includes(rule.on)) errors.push(`${where}.found.on 必须是 ${FOUND_EVENTS.join(' / ')}`);
    else if (rule.on === 'stage' && ![2, 3, 4, 5].includes(rule.stage)) errors.push(`${where}.found.stage 必须是 2–5`);
  };
  for (const [i, trait] of (data?.traits ?? []).entries()) { checkId(trait.id, `traits[${i}]`); text(trait.label, `traits[${i}].label`); }
  for (const { key } of SHELVES) {
    if (!Array.isArray(data?.[key])) { errors.push(`${key} 必须是数组`); continue; }
    for (const [i, item] of data[key].entries()) {
      const where = `${key}[${i}]`;
      checkId(item.id, where); text(item.label, `${where}.label`); text(item.quote, `${where}.quote`); text(item.hint, `${where}.hint`);
      found(item.found, where);
      if (key === 'likes' || key === 'dislikes') {
        text(item.category, `${where}.category`);
        if (![1, 2, 3].includes(item.weight)) errors.push(`${where}.weight 必须是 1、2 或 3`);
        if (!Array.isArray(item.tags) || item.tags.some(tag => typeof tag !== 'string' || !ID.test(tag))) errors.push(`${where}.tags 必须是小写 id 数组`);
      }
    }
  }
  const routine = data?.routine;
  if (!Array.isArray(routine) || !routine.length) errors.push('routine 至少要有一段');
  else routine.forEach((block, i) => {
    if (!TIME.test(block.from ?? '')) errors.push(`routine[${i}].from 必须是 HH:MM`);
    else if (i && TIME.test(routine[i - 1].from ?? '') && minutesOf(block.from) <= minutesOf(routine[i - 1].from)) errors.push(`routine[${i}] 要按时间从早到晚排列`);
    text(block.activity, `routine[${i}].activity`); text(block.label, `routine[${i}].label`); text(block.place, `routine[${i}].place`);
  });
  return errors;
}

// Like or dislike for an in-game thing, matched by preference id or tag. Dislikes win ties.
export function preferenceOf(key, data = persona) {
  const match = list => list.filter(item => item.id === key || item.tags.includes(key)).sort((a, b) => b.weight - a.weight)[0];
  const dislike = match(data.dislikes), like = match(data.likes);
  if (dislike && (!like || dislike.weight >= like.weight)) return { kind: 'dislike', weight: dislike.weight, entry: dislike };
  if (like) return { kind: 'like', weight: like.weight, entry: like };
  return { kind: 'neutral', weight: 0, entry: null };
}

// The routine block for a local time. Before the first block, the previous night's block continues.
export function activityAt(now = Date.now(), data = persona) {
  const d = new Date(now), minutes = d.getHours() * 60 + d.getMinutes();
  let current = data.routine.at(-1);
  for (const block of data.routine) if (minutesOf(block.from) <= minutes) current = block;
  return current;
}

// Everything the player can collect in the guide, with its shelf.
export function discoverables(data = persona) {
  return SHELVES.flatMap(({ key, kind }) => data[key].map(item => ({ ...item, kind })));
}

// Marks an entry as discovered. Returns true only the first time.
export function discover(state, id, now = Date.now(), data = persona) {
  if (!discoverables(data).some(item => item.id === id) || state.discoveries.some(d => d.id === id)) return false;
  state.discoveries.push({ id, at: now }); return true;
}

// Entries whose `found` rule matches what just happened. `event`: { on, level, topic, choice, activity, stages }.
export function matchDiscoveries(event, data = persona) {
  return discoverables(data).filter(({ found: rule }) => {
    if (rule.minLevel && event.level < rule.minLevel) return false;
    if (rule.on === 'stage') return event.stages?.includes(rule.stage) ?? false;
    if (rule.on !== event.on) return false;
    for (const key of ['topic', 'choice', 'activity']) if (rule[key] && rule[key] !== event[key]) return false;
    return true;
  }).map(item => item.id);
}
