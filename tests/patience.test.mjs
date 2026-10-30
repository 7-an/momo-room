import assert from 'node:assert/strict';
import { freshState, restoreState, care, chat, visit, friendship, patienceFor, moodOf, PATIENCE } from '../src/core/index.js';
const at = (h, m = 0, s = 0) => new Date(2026, 9, 30, h, m, s).getTime();
const friend = (xp = 70) => { const s = freshState(at(9)); s.xp = xp; s.joy = 60; return s; };

// Petting: six count fully, three more give nothing, after that it costs affection.
const petted = friend(100);
const xps = [];
for (let i = 0; i < 12; i++) { const before = petted.xp; const result = care(petted, 'pet', 0, at(9, 0, i * 10)); xps.push([result.patience, petted.xp - before]); }
assert.deepEqual(xps.slice(0, 6).map(x => x[0]), Array(6).fill('comfy'));
assert.ok(xps.slice(0, 6).every(x => x[1] === 4), '前 6 次正常加好感');
assert.deepEqual(xps.slice(6, 9), [['enough', 0], ['enough', 0], ['enough', 0]], '摸够了不再加好感');
assert.deepEqual(xps.slice(9).map(x => x[0]), ['over', 'over', 'over']);
assert.ok(xps.slice(9).every(x => x[1] === -3), '摸太多扣好感');
assert.ok(petted.joy < 100 && petted.recent.annoyedAt === at(9, 1, 50));
assert.equal(moodOf(petted, at(9, 2)).why, '刚才被烦到了，有点不高兴');
assert.notEqual(moodOf(petted, at(9, 40)).why, '刚才被烦到了，有点不高兴', '半小时后不再生气');
// Patience comes back once the window has passed.
assert.equal(patienceFor(petted, 'pet', at(9, 31, 50)).tier, 'comfy');
assert.equal(care(petted, 'pet', 0, at(9, 35)).patience, 'comfy');

// Losing affection never drops a stage that was reached.
const edge = friend(67); // Lv. 4 starts at 66
edge.recent.pet = Array.from({ length: 9 }, (_, i) => at(9, 55, i)); // patience already used up
for (let i = 0; i < 20; i++) care(edge, 'pet', 0, at(10, 0, i));
assert.equal(friendship(edge.xp).level, 4, '扣好感不会掉阶段');
assert.equal(edge.xp, 66);

// Chatting stays generous: twelve in an hour keep the usual pace, then it tapers off.
const talker = freshState(at(9));
const chats = [];
let levelAfter12 = 0;
for (let i = 0; i < 20; i++) { chats.push(care(talker, 'greet', 0, at(9, i)).patience); if (i === 11) levelAfter12 = friendship(talker.xp).level; }
assert.equal(chats.slice(0, 12).filter(t => t === 'comfy').length, 12, '一小时 12 次聊天照常升级');
assert.equal(levelAfter12, 5, '原来的升级节奏不变：12 次聊到 Lv. 5');
assert.deepEqual(chats.slice(12, 18), Array(6).fill('enough'));
assert.equal(chats[18], 'over');
const before = talker.xp; care(talker, 'greet', 0, at(9, 21)); assert.equal(talker.xp, before, '聊太多不加也不扣');
const chatted = chat(friend(), 'day', 'good', at(11)); assert.equal(chatted.patience, 'comfy');

// Gifts: two a day count fully, two more count half, then she turns them down without taking candy.
const giver = friend(); giver.coins = 100;
const gifts = [0, 1, 2, 3].map(i => { const xp = giver.xp; const r = care(giver, 'gift', 0, at(12, i)); return [r.patience, giver.xp - xp]; });
assert.deepEqual(gifts, [['comfy', 10], ['comfy', 10], ['enough', 5], ['enough', 5]]);
const coins = giver.coins, refused = care(giver, 'gift', 0, at(12, 5));
assert.equal(refused.ok, false); assert.equal(giver.coins, coins, '拒收不扣星星糖');
assert.equal(care(giver, 'gift', 0, at(12, 5) + 24 * 3600000).ok, true, '第二天又可以送');

// Baths: once in three hours is lovely, twice is annoying.
const bather = friend(95);
assert.equal(care(bather, 'wash', 0, at(14)).patience, 'comfy');
const xp = bather.xp, again = care(bather, 'wash', 0, at(14, 30));
assert.equal(again.patience, 'over'); assert.equal(bather.xp - xp, -2);
assert.equal(care(bather, 'wash', 0, at(17, 31)).patience, 'comfy');

// Feeding and playing keep their own limits (fullness, energy) and have no patience rule.
assert.equal(PATIENCE.feed, undefined); assert.equal(PATIENCE.play, undefined);

// Patience survives a save and reload, and old timestamps are dropped.
const saved = restoreState(JSON.parse(JSON.stringify(petted)), at(9, 36));
assert.equal(saved.recent.pet.length, petted.recent.pet.filter(t => t > at(9, 6)).length);
assert.equal(patienceFor(saved, 'pet', at(9, 36)).tier, patienceFor(petted, 'pet', at(9, 36)).tier);
const junk = restoreState({ ...freshState(at(9)), recent: { pet: ['x', -1, at(9) + 1e9, at(8, 50)], annoyedAt: 'no' } }, at(9));
assert.deepEqual(junk.recent.pet, [at(8, 50)]); assert.equal(junk.recent.annoyedAt, 0);

// Pushing past her patience with petting reveals that she dislikes it, once.
const reveal = friend(); reveal.world.place = 'home';
let found = [];
for (let i = 0; i < 10; i++) found = found.concat(visit(reveal, 'pet', { now: at(16, 0, i * 5) }).discovered);
assert.ok(found.includes('too-much-touch'));
assert.equal(found.filter(id => id === 'too-much-touch').length, 1);
console.log('摸摸、聊天、送礼、洗澡的耐心上限与扣分、不掉阶段、恢复、存档与图鉴联动检查通过。');
