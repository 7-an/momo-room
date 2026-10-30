import assert from 'node:assert/strict';
import { freshState, restoreState, migrate, care, SAVE_SCHEMA, SAVE_VERSION } from '../src/core/index.js';
const now = new Date(2026, 9, 29, 12).getTime();

// A save written by the 2026-10-05 release: version 1, no schema, no discoveries.
const legacy = { version: 1, name: '奶糖', food: 60, joy: 70, energy: 50, xp: 70, coins: 33, sleeping: false, night: true, sound: true, createdAt: now - 5 * 86400000, updatedAt: now, journey: { memories: [{ id: 'hello', at: now - 5 * 86400000 }, { id: 'stage-2', at: now - 4 * 86400000 }], lastChat: { topic: 'day', choice: 'good', at: now - 86400000 }, followupDay: '' }, daily: { day: '2026-10-29', stage: 4, greet: 2, pet: 1, feed: 0, play: 0, claimed: false } };
const upgraded = restoreState(JSON.parse(JSON.stringify(legacy)), now);
assert.equal(upgraded.version, SAVE_VERSION, '存档键和 version 保持 1，旧版本仍能读取');
assert.equal(upgraded.schema, SAVE_SCHEMA);
assert.deepEqual(upgraded.discoveries, []);
assert.deepEqual(upgraded.world, { place: 'home', seen: 0 }, '旧存档从她家开始');
for (const key of ['name', 'food', 'joy', 'energy', 'xp', 'coins', 'night', 'sound', 'createdAt']) assert.equal(upgraded[key], legacy[key], `迁移保留 ${key}`);
assert.deepEqual(upgraded.journey, legacy.journey, '迁移保留回忆和续聊');
assert.deepEqual(upgraded.daily, legacy.daily, '迁移保留当天心愿进度');
assert.equal(migrate(legacy).schema, 2); assert.equal(legacy.schema, undefined, 'migrate 不修改传入对象');

// The new fields survive a save/load round trip, and bad entries are dropped.
upgraded.discoveries.push({ id: 'strawberry', at: now - 1000 }, { id: 'future-fact', at: now - 500 });
upgraded.world = { place: 'bakery', seen: 1 };
const again = restoreState(JSON.parse(JSON.stringify(upgraded)), now);
assert.deepEqual(again.discoveries.map(d => d.id), ['strawberry', 'future-fact'], '人设里暂时没有的 id 也保留，修改人设不清进度');
assert.equal(again.discoveries[0].at, now - 1000);
assert.deepEqual(again.world, { place: 'bakery', seen: 1 });
const dirty = restoreState({ ...freshState(now), discoveries: [{ id: 'ok-id', at: now }, { id: 'ok-id', at: now }, { id: 'Bad Id', at: now }, { id: 'later', at: now + 1 }, { id: 'no-time' }, 42, null, '<x>', 'x'.repeat(49)] }, now);
assert.deepEqual(dirty.discoveries, [{ id: 'ok-id', at: now }], '只留合法 id、有效时间、不重复');
assert.deepEqual(restoreState({ ...freshState(now), discoveries: ['bare-id'] }, now).discoveries, [{ id: 'bare-id', at: now }], '早期只存 id 的写法也能读');
assert.deepEqual(restoreState({ ...freshState(now), discoveries: 'nope' }, now).discoveries, []);

// A save from a later schema is read by its known fields instead of being reset.
const future = restoreState({ ...freshState(now), schema: 9, xp: 50, wardrobe: ['hat'] }, now);
assert.equal(future.xp, 50); assert.equal(future.schema, SAVE_SCHEMA);
// Unknown or missing versions still start fresh, as before.
assert.equal(restoreState({ version: 2, xp: 99 }, now).xp, 0);
assert.equal(restoreState(null, now).xp, 0);
assert.equal(restoreState('text', now).xp, 0);
// A location that doesn't exist, or isn't open at this level, sends the player home.
assert.equal(restoreState({ ...freshState(now), world: { place: 'moon' } }, now).world.place, 'home');
assert.equal(restoreState({ ...freshState(now), xp: 0, world: { place: 'books' } }, now).world.place, 'home');
assert.equal(restoreState({ ...freshState(now), xp: 18, world: { place: 'books', seen: 'x' } }, now).world.seen, 0);

// What the previous release's restoreState checks: version 1 and the same core fields.
const written = JSON.parse(JSON.stringify(again));
assert.equal(written.version, 1);
for (const key of ['food', 'joy', 'energy', 'xp', 'coins', 'name', 'daily', 'journey']) assert.ok(key in written, `回滚后旧版本仍能读取 ${key}`);

// Gameplay is unchanged by the migration.
const player = restoreState(JSON.parse(JSON.stringify(legacy)), now);
assert.equal(care(player, 'pet', 0, now).ok, true);
console.log('存档 schema 2 迁移、旧存档保留、发现记录与所在地点清洗、高版本容错与回滚兼容检查通过。');
