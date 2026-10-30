import assert from 'node:assert/strict';
import { persona, validatePersona, preferenceOf, activityAt, discoverables, discover, minutesOf } from '../src/persona/index.js';
import { freshState } from '../src/core/index.js';

assert.deepEqual(validatePersona(), [], '当前人设数据必须通过校验');
const ids = discoverables().map(item => item.id);
assert.equal(new Set(ids).size, ids.length, '喜好与雷点 id 不重复');

// Validation catches the mistakes most likely when hand-editing the data.
const broken = structuredClone(persona);
broken.status = 'done';
broken.likes.push({ id: 'Strawberry Cake', category: 'food', label: '', weight: 5, tags: ['OK'] });
broken.dislikes.push({ ...broken.likes[0] });
broken.routine = [{ from: '9:00', activity: 'a', label: 'b' }, { from: '08:00', activity: 'a', label: 'b' }, { from: '07:00', activity: 'a', label: 'b' }];
const errors = validatePersona(broken).join('\n');
for (const fragment of ['status', '只能用小写', 'label 不能为空', 'weight', 'tags', '重复', 'HH:MM', '从早到晚']) assert.match(errors, new RegExp(fragment), `校验应报出：${fragment}`);
assert.match(validatePersona({ status: 'draft', likes: [], dislikes: [], routine: [] }).join(), /至少要有一段/);

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
assert.equal(activityAt(at(23, 59)).activity, 'sleep');
assert.equal(activityAt(at(3)).activity, 'sleep', '凌晨仍在前一晚的睡眠时段');
assert.equal(minutesOf('13:30'), 810);

// Discoveries are recorded once and only for known preferences.
const state = freshState();
assert.equal(discover(state, 'strawberry'), true);
assert.equal(discover(state, 'strawberry'), false);
assert.equal(discover(state, 'not-a-fact'), false);
assert.deepEqual(state.discoveries, ['strawberry']);
console.log('人设数据校验、喜好匹配、作息时段与发现记录检查通过。');
