import assert from 'node:assert/strict';
import { freshState, whereabouts, canMeet, visit, phaseOf, weatherOf, moodOf, awaySummary, clockOf, placeOpen, care } from '../src/core/index.js';
const at = (h, m = 0, day = 30) => new Date(2026, 9, day, h, m).getTime();
const withLevel = (xp, place = 'home') => { const s = freshState(at(9)); s.xp = xp; s.world.place = place; return s; };

// Time of day and weather.
assert.equal(clockOf(at(7, 5)), '07:05');
assert.deepEqual([at(6), at(12), at(18), at(22), at(3)].map(phaseOf), ['morning', 'day', 'dusk', 'night', 'night']);
assert.deepEqual(weatherOf(at(8)), weatherOf(at(20)), '同一天天气不变');
const kinds = new Set(Array.from({ length: 60 }, (_, i) => weatherOf(new Date(2026, 0, 1 + i * 3).getTime()).kind));
assert.ok(kinds.has('sunny') && kinds.size >= 3, '不同日子天气会变化');
assert.equal(weatherOf(at(12, 0, 1)).season, '秋');
assert.ok(!Array.from({ length: 40 }, (_, i) => weatherOf(new Date(2026, 6, 1 + i).getTime()).kind).includes('snow'), '夏天不下雪');

// Where she is follows her routine, but never somewhere the player can't go yet.
const stranger = withLevel(0);
assert.equal(whereabouts(stranger, at(10, 30)).place, 'home', '书店未开放时她在家看书');
assert.equal(whereabouts(stranger, at(10, 30)).label, '在窗边看书');
assert.equal(whereabouts(stranger, at(12, 30)).place, 'bakery', '面包坊 Lv. 1 就开放');
assert.equal(whereabouts(withLevel(18), at(10, 30)).place, 'books');
assert.equal(whereabouts(withLevel(18), at(19, 45)).place, 'park');
assert.equal(whereabouts(withLevel(66), at(21, 30)).place, 'home', '观星台 Lv. 5 才开放');
assert.equal(whereabouts(withLevel(90), at(21, 30)).place, 'hill');
assert.equal(whereabouts(stranger, at(3)).asleep, true);
assert.equal(whereabouts(stranger, at(14)).asleep, true, '午睡时间');
const napper = withLevel(42); napper.sleeping = true;
assert.deepEqual([whereabouts(napper, at(10, 30)).place, whereabouts(napper, at(10, 30)).napping], ['home', true], '被哄睡的午觉在家');
assert.equal(placeOpen(stranger, 'books'), false); assert.equal(placeOpen(withLevel(18), 'books'), true);

// Meeting her: same place, an action the place allows, awake enough.
assert.equal(canMeet(stranger, 'greet', at(9)).ok, true);
const away = canMeet(stranger, 'greet', at(12, 30));
assert.equal(away.ok, false); assert.equal(away.away, true); assert.match(away.message, /面包坊/);
assert.equal(canMeet(withLevel(42, 'bakery'), 'feed', at(12, 30)).ok, true, '面包坊能送点心');
assert.equal(canMeet(withLevel(90, 'bakery'), 'wash', at(12, 30)).ok, false, '洗香香只能回家');
assert.equal(canMeet(withLevel(18, 'books'), 'play', at(10, 30)).ok, false, '书店不能玩游戏');
assert.equal(canMeet(stranger, 'greet', at(3)).ok, true, '她睡着时还能小声说话');
assert.equal(canMeet(withLevel(42), 'feed', at(3)).ok, false, '睡着时不能喂食');
assert.equal(canMeet(napper, 'sleep', at(10, 30)).ok, true, '午觉可以叫醒');

// visit(): the meeting rules come first and a refusal changes nothing.
const lonely = withLevel(0); const before = JSON.stringify(lonely);
assert.equal(visit(lonely, 'greet', { now: at(12, 30) }).ok, false);
assert.equal(JSON.stringify(lonely), before, '她不在时打招呼不改变状态');
const greeted = visit(withLevel(0), 'greet', { now: at(9) });
assert.equal(greeted.ok, true); assert.equal(greeted.where.activity, 'breakfast'); assert.deepEqual(greeted.discovered, []);
// Reaching Lv. 2 reveals her opinion on taking it slow, once.
const climber = withLevel(12); const lv2 = visit(climber, 'greet', { now: at(9) });
assert.equal(lv2.levelUp, true); assert.deepEqual(lv2.discovered, ['take-it-slow']);
assert.deepEqual(climber.discoveries, [{ id: 'take-it-slow', at: at(9) }]);
// Feeding at home reveals strawberries; a second time reveals nothing new.
const feeder = withLevel(42);
assert.deepEqual(visit(feeder, 'feed', { now: at(9) }).discovered, ['strawberry']);
feeder.food = 50; assert.deepEqual(visit(feeder, 'feed', { now: at(9, 5) }).discovered, []);
// A chat during tea time.
const teaTime = withLevel(18); const chatted = visit(teaTime, 'greet', { now: at(15, 30), topic: 'quiet', choice: 'stay' });
assert.equal(chatted.ok, true); assert.deepEqual(chatted.discovered.sort(), ['quiet-company', 'warm-tea']);
// A preview clock shifts where she is, but save timestamps use the real time.
const preview = withLevel(18);
const shifted = visit(preview, 'greet', { now: at(9), worldNow: at(15, 30), topic: 'day', choice: 'tired' });
assert.equal(shifted.where.activity, 'tea'); assert.equal(preview.journey.memories.at(-1).at, at(9));
// A finished game still pays out after her schedule moved on.
const gamer = withLevel(18); const played = visit(gamer, 'play', { now: at(10, 30), score: 5, checkMeet: false });
assert.equal(played.ok, true); assert.deepEqual(played.discovered, ['catching-stars']);
// The relationship rules still apply in the right place.
assert.equal(visit(withLevel(0), 'pet', { now: at(9) }).ok, false);
assert.equal(care(withLevel(0), 'pet').ok, false);

// Mood and the 「你不在的时候」 summary.
const happy = withLevel(0); happy.joy = 100; happy.food = 100; happy.energy = 100;
assert.ok(['great', 'good'].includes(moodOf(happy, at(9)).key));
const hungry = withLevel(0); hungry.food = 20; hungry.joy = 30; hungry.energy = 30;
assert.equal(moodOf(hungry, at(9)).key, 'low'); assert.equal(moodOf(hungry, at(9)).why, '有点饿了');
assert.equal(moodOf(withLevel(0), at(3)).why, '睡得正香');
assert.equal(awaySummary(stranger, at(9), at(9, 40)), null, '不到一小时不提');
const summary = awaySummary(withLevel(18), at(8), at(16));
assert.equal(summary.hours, 8);
assert.deepEqual(summary.did, ['去书店看了书', '在面包坊吃了午饭', '睡了个午觉']);
assert.ok(!summary.did.includes('喝了下午茶'), '正在做的事不算「你不在的时候」');
assert.equal(awaySummary(withLevel(0), at(8), at(16)).did[0], '在窗边看了书', '未开放的地方用替代说法');
console.log('时间与天气、她的位置与作息、见面规则、互动发现、心情与离开总结检查通过。');
