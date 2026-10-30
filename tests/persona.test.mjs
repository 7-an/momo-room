import assert from 'node:assert/strict';
import { persona, validatePersona, preferenceOf, activityAt, discoverables, discover, matchDiscoveries, minutesOf, SHELVES } from '../src/persona/index.js';
import { freshState } from '../src/core/index.js';
import { places } from '../src/content/town.js';

assert.deepEqual(validatePersona(), [], '当前人设数据必须通过校验');
const ids = discoverables().map(item => item.id);
assert.equal(new Set(ids).size, ids.length, '图鉴条目 id 不重复');
assert.deepEqual(SHELVES.map(s => s.key), ['likes', 'dislikes', 'opinions', 'phrases']);
for (const block of persona.routine) {
  assert.ok(places.some(place => place.id === block.place), `作息地点 ${block.place} 必须是小镇里的地点`);
  if (block.alt) assert.ok(places.some(place => place.id === block.alt.place));
}

// Validation catches the mistakes most likely when hand-editing the data.
const broken = structuredClone(persona);
broken.status = 'done';
broken.likes.push({ id: 'Strawberry Cake', category: 'food', label: '', quote: '', hint: 'x', weight: 5, tags: ['OK'], found: { on: 'dance' } });
broken.dislikes.push({ ...broken.likes[0] });
broken.phrases.push({ id: 'p-stage', label: 'x', quote: 'x', hint: 'x', found: { on: 'stage', stage: 9 } });
broken.routine = [{ from: '9:00', activity: 'a', label: 'b', place: 'home' }, { from: '08:00', activity: 'a', label: 'b', place: 'home' }, { from: '07:00', activity: 'a', label: 'b', place: 'home' }];
const errors = validatePersona(broken).join('\n');
for (const fragment of ['status', '只能用小写', 'label 不能为空', 'quote 不能为空', 'weight', 'tags', '重复', 'found.on', 'found.stage', 'HH:MM', '从早到晚']) assert.match(errors, new RegExp(fragment), `校验应报出：${fragment}`);
assert.match(validatePersona({ status: 'draft', likes: [], dislikes: [], opinions: [], phrases: [], routine: [] }).join(), /至少要有一段/);

// Preferences match by id or tag; a dislike outweighs a weaker or equal like.
assert.equal(preferenceOf('strawberry').kind, 'like');
assert.equal(preferenceOf('cake').entry.id, 'strawberry');
assert.equal(preferenceOf('broccoli').kind, 'neutral');
const mixed = { likes: [{ id: 'bath', tags: ['wash'], weight: 2 }], dislikes: [{ id: 'cold', tags: ['wash'], weight: 2 }] };
assert.equal(preferenceOf('wash', mixed).kind, 'dislike');
mixed.likes[0].weight = 3; assert.equal(preferenceOf('wash', mixed).kind, 'like');

// The routine follows local time and wraps past midnight.
const at = (h, m = 0) => new Date(2026, 9, 29, h, m).getTime();
assert.equal(activityAt(at(7, 30)).activity, 'wake');
assert.equal(activityAt(at(15, 10)).activity, 'tea');
assert.equal(activityAt(at(0, 30)).activity, 'stars', '午夜后仍是前一晚最后一段');
assert.equal(activityAt(at(3)).activity, 'sleep');
assert.equal(minutesOf('13:30'), 810);

// Discovery rules: action, chat topic and choice, her activity, stage and level gates.
assert.deepEqual(matchDiscoveries({ on: 'feed', level: 3 }), ['strawberry']);
assert.deepEqual(matchDiscoveries({ on: 'greet', level: 2, topic: 'quiet', choice: 'window' }), ['afternoon-light']);
assert.deepEqual(matchDiscoveries({ on: 'greet', level: 2, topic: 'stars', choice: 'win' }), ['winning'], '只写 topic 的规则匹配任何选项');
assert.deepEqual(matchDiscoveries({ on: 'greet', level: 1, activity: 'tea' }), [], 'minLevel 未到不发现');
assert.deepEqual(matchDiscoveries({ on: 'greet', level: 2, activity: 'tea' }), ['warm-tea']);
assert.deepEqual(matchDiscoveries({ on: 'gift', level: 3 }), ['flowers']);
assert.deepEqual(matchDiscoveries({ on: 'gift', level: 4 }).sort(), ['flowers', 'phrase-passable']);
assert.deepEqual(matchDiscoveries({ on: null, level: 4, stages: [4] }).sort(), ['phrase-hmph', 'sudden-touch']);
assert.deepEqual(matchDiscoveries({ on: 'greet', level: 1 }), []);
assert.deepEqual(matchDiscoveries({ on: 'pet', level: 4, patience: 'comfy' }), ['phrase-fine'], '正常摸摸不会发现「讨厌一直摸」');
assert.deepEqual(matchDiscoveries({ on: 'pet', level: 4, patience: 'over' }).sort(), ['phrase-fine', 'too-much-touch']);
// Every entry can actually be found by some event.
const events = ['greet', 'play', 'feed', 'gift', 'sleep', 'pet', 'wash'];
for (const item of discoverables()) {
  const rule = item.found;
  const event = rule.on === 'stage' ? { on: null, level: 5, stages: [rule.stage] } : { on: rule.on, level: 5, topic: rule.topic, choice: rule.choice ?? 'stay', activity: rule.activity, patience: rule.patience };
  if (rule.topic && !rule.choice) event.choice = 'win';
  assert.ok(events.includes(rule.on) || rule.on === 'stage');
  assert.ok(matchDiscoveries(event).includes(item.id), `${item.id} 必须能被发现`);
}

// Discoveries are recorded once, with a time, and only for known entries.
const state = freshState();
assert.equal(discover(state, 'strawberry', 1000), true);
assert.equal(discover(state, 'strawberry', 2000), false);
assert.equal(discover(state, 'not-a-fact'), false);
assert.deepEqual(state.discoveries, [{ id: 'strawberry', at: 1000 }]);
console.log('人设数据校验、喜好匹配、作息时段、发现规则与发现记录检查通过。');
