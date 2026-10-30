import { friendship, canInteract, canMeet, dailyPlan, whereabouts, clockOf, phaseOf, weatherOf, moodOf, patienceFor } from '../core/index.js?v=20261030e';
import { stageFor } from '../content/dialogue.js?v=20261030e';
import { memoryDefinitions } from '../content/journey.js?v=20261030e';
import { placeById } from '../content/town.js?v=20261030e';
import { persona, minutesOf } from '../persona/index.js?v=20261030e';
import { state, greetCoolingDown, worldNow } from './session.js?v=20261030e';
import { $, el } from './dom.js?v=20261030e';
import { settlePose, syncSleepEffect } from './effects.js?v=20261030e';

const hints = { greet: '', play: '来比一局', feed: '草莓挑得不错', gift: '10 颗星星糖', sleep: '休息一小会儿', pet: '只准摸一下', wash: '水温刚刚好' };
// What the button says once she's getting tired of it. `soon`: the last one before that.
const patienceHints = {
  pet: { soon: '快摸够了', enough: '她摸够了', over: '再摸要生气' },
  greet: { enough: '聊得有点多', over: '让她歇会儿' },
  gift: { enough: '今天送过了', over: '明天再送吧' },
  wash: { enough: '刚洗过', over: '刚洗过' }
};
function patienceHint(action, now) {
  const words = patienceHints[action]; if (!words) return null;
  const { tier, left } = patienceFor(state, action, now);
  if (tier === 'comfy') return left === 1 && words.soon ? words.soon : null;
  return words[tier];
}
// Draws the whole page from state and the town clock. Safe to call any time; it never changes state.
export function render() {
  const now = worldNow();
  const friend = friendship(state.xp), stage = stageFor(friend.level);
  const where = whereabouts(state, now), here = placeById(state.world.place);
  const together = where.place === here.id, weather = weatherOf(now);

  // The world
  const app = $('#app');
  app.dataset.phase = phaseOf(now);
  app.dataset.place = here.id;
  app.dataset.weather = weather.kind;
  $('#place-name').textContent = here.id === 'home' ? `${state.name}的房间` : here.name;
  $('#place-sub').textContent = here.sub;
  $('#clock').textContent = clockOf(now);
  $('#weather').textContent = `${weather.label} · ${weather.temp}°C · ${weather.season}`;
  $('#activity').textContent = together ? where.label : `${placeById(where.place).short} · ${where.label}`;
  $('#character').hidden = !together;
  $('#speech').hidden = !together;
  $('#absent').hidden = together;
  if (!together) $('#absent-where').textContent = `${placeById(where.place).name} · ${where.label}`;
  settlePose(); syncSleepEffect();

  // Her
  const mood = moodOf(state, now);
  $('.mood-card').dataset.mood = mood.key;
  $('#mood-label').textContent = mood.label;
  $('#mood-why').textContent = mood.why;
  for (const key of ['food', 'joy', 'energy']) {
    const value = Math.round(state[key]);
    $(`#${key}-value`).textContent = `${value}%`;
    $(`#${key}-meter`).setAttribute('aria-valuenow', value);
    $(`#${key}-meter i`).style.width = `${value}%`;
  }

  // Relationship
  $('#friend-title').textContent = friend.title;
  $('#level-label').textContent = `Lv. ${friend.level}`;
  $('#xp-label').textContent = `${friend.remaining} / ${friend.needed}`;
  $('#xp-fill').style.width = `${friend.remaining / friend.needed * 100}%`;
  $('#boundary-note').textContent = stage.next;
  const first = new Date(state.createdAt); first.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $('#day-label').textContent = `陪伴的第 ${Math.max(1, Math.round((today - first) / 86400000) + 1)} 天`;
  $('#coin-count').textContent = state.coins;

  // Actions: relationship first, then whether she's here and awake enough.
  const cooling = greetCoolingDown();
  const quiet = together && where.asleep && !where.napping;
  $('#greet-label').textContent = cooling ? '听她说完' : quiet ? '小声说话' : friend.level === 1 ? '打招呼' : '聊聊天';
  $('#sleep-label').textContent = state.sleeping ? '叫醒她' : '陪她休息';
  document.querySelectorAll('[data-action]').forEach(button => {
    const action = button.dataset.action, access = canInteract(state, action), meet = canMeet(state, action, now);
    const blocked = !access.ok || !meet.ok || (state.sleeping && action !== 'sleep') || (action === 'greet' && cooling);
    button.disabled = blocked;
    button.classList.toggle('locked', !access.ok);
    button.classList.toggle('weary', access.ok && meet.ok && patienceFor(state, action, Date.now()).tier !== 'comfy');
    button.title = !access.ok ? `${access.message} Lv. ${access.requiredLevel} 解锁。` : !meet.ok ? meet.message : '';
    const hint = !access.ok ? `Lv. ${access.requiredLevel} 解锁` : meet.away ? '她不在这里' : !meet.ok ? (quiet ? '她睡着了' : '这里不方便') : action === 'sleep' && state.sleeping ? '元气恢复中' : patienceHint(action, Date.now()) ?? hints[action];
    button.querySelector('small').textContent = hint;
  });
  const touchAllowed = together && canInteract(state, 'pet').ok && canMeet(state, 'pet', now).ok && !state.sleeping;
  $('#character').classList.toggle('can-pet', touchAllowed);
  $('#character').setAttribute('aria-label', touchAllowed ? `摸摸${state.name}，可以点击或滑动抚摸` : `向${state.name}${friend.level === 1 ? '打招呼' : '聊聊天'}`);
  $('#sprite').setAttribute('aria-label', `浅金卷发、蝴蝶结和蕾丝裙的3D风格${state.name}`);
  $('#touch-hint').textContent = !together ? '' : where.asleep ? '小声一点，她在睡觉' : touchAllowed ? '可以轻轻摸摸头了' : friend.level === 1 ? '还不熟，点一下打个招呼吧' : '';

  // Header tools
  $('#sound-button').classList.toggle('sound-on', state.sound);
  $('#sound-button').setAttribute('aria-pressed', String(state.sound));
  $('#sound-button').setAttribute('aria-label', state.sound ? '关闭音效' : '开启音效');
  const unseen = Math.max(0, state.discoveries.length - state.world.seen);
  for (const id of ['#guide-badge', '#tab-guide-badge']) { $(id).hidden = !unseen; $(id).textContent = unseen; }
  const memories = state.journey.memories;
  $('#album-count').textContent = memories.length;
  $('#album-count').hidden = !memories.length;
  $('#album-open').title = memories.length ? `最近记下：${memoryDefinitions[memories.at(-1).id].title}` : '回忆小册';

  // Her day
  const minutes = new Date(now).getHours() * 60 + new Date(now).getMinutes();
  let currentIndex = persona.routine.length - 1;
  persona.routine.forEach((block, i) => { if (minutesOf(block.from) <= minutes) currentIndex = i; });
  $('#day-list').replaceChildren(...persona.routine.map((block, i) => {
    const shown = i === currentIndex ? where : whereabouts({ ...state, sleeping: false }, new Date(now).setHours(...block.from.split(':').map(Number), 0, 0));
    return el('li', { class: i === currentIndex ? 'now' : i < currentIndex ? 'past' : '' }, el('time', { text: block.from }), el('i'), el('span', { text: i === currentIndex ? `${shown.label} · 现在` : shown.label }));
  }));

  // Today's wishes
  const plan = dailyPlan(state);
  let complete = 0;
  $('#wish-list').replaceChildren(...plan.map(({ key, target, label }) => {
    const done = state.daily[key] >= target; if (done) complete++;
    return el('li', { class: done ? 'done' : '' }, el('span', { class: 'wish-check' }), el('span', { text: label }), el('small', { text: `${Math.min(target, state.daily[key])}/${target}` }));
  }));
  $('#wish-count').textContent = `${complete} / ${plan.length}`;
  $('#wish-reward').textContent = state.daily.claimed ? '今天的 20 颗星星糖，已经收好啦' : '完成心愿 · 获得 20 颗星星糖';
}
