import { friendship, canInteract, dailyPlan } from '../core/index.js?v=20261029a';
import { stageFor } from '../content/dialogue.js?v=20261029a';
import { memoryDefinitions } from '../content/journey.js?v=20261029a';
import { state, greetCoolingDown } from './session.js?v=20261029a';
import { $ } from './dom.js?v=20261029a';

// Draws the whole page from state. Safe to call any time; it never changes state.
export function render() {
  for (const key of ['food', 'joy', 'energy']) {
    const value = Math.round(state[key]);
    $(`#${key}-value`).textContent = `${value}%`;
    $(`#${key}-meter`).setAttribute('aria-valuenow', value);
    $(`#${key}-meter i`).style.width = `${value}%`;
  }
  const friend = friendship(state.xp);
  const stage = stageFor(friend.level);
  $('#intro-title').firstChild.textContent = stage.heading;
  $('#intro-caption').textContent = stage.caption;
  $('#friend-note').textContent = stage.note;
  $('#boundary-note').textContent = stage.next;
  $('#side-note').textContent = friend.level < 3 ? '不着急，先慢慢认识。' : '熟悉一点，再靠近一点。';
  $('#footer-note').textContent = friend.level < 3 ? '从一句你好开始。' : '慢慢熟悉，也是一件小事。';
  const greetingCoolingDown = greetCoolingDown();
  $('#greet-label').textContent = greetingCoolingDown ? '听啵啵说完' : friend.level === 1 ? '打招呼' : '聊聊天';
  const actionHints = { pet: '只准摸一下', feed: friend.level === 3 ? '带一份点心' : '草莓挑得不错', play: friend.level < 4 ? '一起接星星' : '来比一局', wash: '水温刚刚好' };
  document.querySelectorAll('[data-action]').forEach(button => {
    const action = button.dataset.action, access = canInteract(state, action);
    button.disabled = !access.ok || (state.sleeping && action !== 'sleep') || (action === 'greet' && greetingCoolingDown);
    button.classList.toggle('locked', !access.ok);
    button.title = access.ok ? '' : `${access.message} Lv. ${access.requiredLevel} 解锁。`;
    if (actionHints[action]) button.querySelector('small').textContent = access.ok ? actionHints[action] : `Lv. ${access.requiredLevel} 解锁`;
  });
  const giftAccess = canInteract(state, 'gift');
  $('#gift-button').disabled = !giftAccess.ok || state.sleeping;
  $('#gift-hint').textContent = giftAccess.ok ? '10 颗星星糖换一束花' : '逐渐熟悉后 · Lv. 3 解锁';
  const touchAllowed = canInteract(state, 'pet').ok;
  $('#character').classList.toggle('can-pet', touchAllowed);
  $('.room-card').classList.toggle('night', state.night);
  $('#room-label').textContent = state.night ? '莓莓晚风' : '奶油日光';
  $('#room-toggle').setAttribute('aria-label', `当前${state.night ? '莓莓晚风' : '奶油日光'}，点击切换房间`);
  document.querySelectorAll('.pet-name').forEach(el => el.textContent = state.name);
  $('#character').setAttribute('aria-label', touchAllowed ? `摸摸${state.name}，可以点击或滑动抚摸` : `向${state.name}${friend.level === 1 ? '打招呼' : '聊聊天'}，目前不能抚摸`);
  $('#sprite').setAttribute('aria-label', `浅金卷发、蝴蝶结和蕾丝裙的3D风格${state.name}`);
  $('#level-label').textContent = `Lv. ${friend.level}`;
  $('#friend-title').textContent = friend.title;
  $('#xp-label').textContent = `${friend.remaining} / ${friend.needed}`;
  $('#xp-fill').style.width = `${friend.remaining / friend.needed * 100}%`;
  $('#coin-count').textContent = state.coins;
  $('#sleep-label').textContent = state.sleeping ? '叫醒' : '睡觉';
  $('#sleep-hint').textContent = state.sleeping ? '元气慢慢恢复中' : canInteract(state, 'sleep').ok ? '休息一小会儿' : 'Lv. 3 解锁';
  $('#touch-hint').textContent = state.sleeping ? '小声一点，先让啵啵打个盹' : touchAllowed ? '现在可以轻轻摸摸头了' : friend.level === 1 ? '还不熟，点一下打个招呼吧' : '点一下聊聊天，摸摸还要再熟悉一点';
  $('#sound-button').classList.toggle('sound-on', state.sound);
  $('#sound-button').setAttribute('aria-pressed', String(state.sound));
  $('#sound-button').setAttribute('aria-label', state.sound ? '关闭音效' : '开启音效');
  const first = new Date(state.createdAt); first.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $('#day-label').textContent = `陪伴的第 ${Math.max(1, Math.round((today - first) / 86400000) + 1)} 天`;
  const plan = dailyPlan(state);
  let complete = 0;
  $('#wish-list').replaceChildren();
  for (const { key, target, label } of plan) {
    const row = document.createElement('li'), done = state.daily[key] >= target;
    const check = document.createElement('span'); check.className = 'wish-check';
    const description = document.createElement('span'); description.textContent = label;
    const count = document.createElement('small'); count.textContent = `${Math.min(target, state.daily[key])}/${target}`;
    row.append(check, description, count);
    row.classList.toggle('done', done);
    $('#wish-list').append(row);
    if (done) complete++;
  }
  $('#wish-count').textContent = `${complete} / ${plan.length}`;
  $('#wish-reward').textContent = state.daily.claimed ? '今天的 20 颗星星糖，已经收好啦' : '完成心愿 · 获得 20 颗星星糖';
  $('#sprite').classList.toggle('sleeping', state.sleeping);
  const memories = state.journey.memories;
  $('#album-count').textContent = memories.length;
  $('#album-summary').textContent = memories.length ? `最近记下：${memoryDefinitions[memories.at(-1).id].title}` : '从今天开始，慢慢记下。';
}
