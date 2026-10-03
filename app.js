import { STORAGE_KEY, DEFAULT_NAME, freshState, restoreState, applyElapsed, friendship, care, canInteract, dailyPlan } from './model.js?v=20261003b';
import { stageFor, greeting, petLines } from './dialogue.js?v=20261003b';
const $ = (selector) => document.querySelector(selector);
let state, storageAvailable = true;
try { state = restoreState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
catch { state = freshState(); }
let reactionTimeout, toastTimeout, sleepEffectInterval, playInterval, playClock, gameRunning = false, score = 0, deadline = 0;
const starTimeouts = new Set();
const cooldowns = new Map();
let audioContext;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#save-status').textContent = storageAvailable ? '进度已保存' : '本次进度暂不能保存';
}
function render() {
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
  const greetingCoolingDown = Date.now() - (cooldowns.get('greet') || 0) < 3000;
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
}
function toast(message) {
  clearTimeout(toastTimeout);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function speak(message) { $('#speech').textContent = message; }
function sound(kind = 'soft') {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const start = audioContext.currentTime;
    const notes = kind === 'star' ? [660, 880] : kind === 'sleep' ? [392, 330] : [523, 659, 784];
    notes.forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start + i * .09);
      gain.gain.linearRampToValueAtTime(.035, start + i * .09 + .02);
      gain.gain.exponentialRampToValueAtTime(.001, start + i * .09 + .24);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(start + i * .09); oscillator.stop(start + i * .09 + .26);
    });
  } catch { state.sound = false; render(); toast('这个浏览器暂时不能播放音效，仍可以继续玩。'); }
}
function effect(kind = 'heart', count = 5, point) {
  const room = $('#room');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span'); el.className = `effect ${kind}`;
    el.textContent = { heart: '♡', star: '✦', sleep: 'z', flower: '✿', bubble: '' }[kind];
    const x = point?.x ?? room.clientWidth * .5, y = point?.y ?? room.clientHeight * .44;
    el.style.left = `${x + (Math.random() - .5) * 150}px`;
    el.style.top = `${y + (Math.random() - .5) * 90}px`;
    el.style.animationDelay = `${i * .1}s`;
    $('#effects').append(el); setTimeout(() => el.remove(), 2400);
  }
}
function react(type, duration = 2100) {
  clearTimeout(reactionTimeout);
  $('#sprite').className = `sprite ${type}`;
  reactionTimeout = setTimeout(() => $('#sprite').className = `sprite${state.sleeping ? ' sleeping' : ''}`, duration);
}
function act(action, point, gameScore = 0) {
  const wait = { greet: 3000, pet: 650, feed: 2400, wash: 2200, gift: 1500, sleep: 450 }[action] || 0;
  const now = Date.now();
  if (now - (cooldowns.get(action) || 0) < wait) { if (action === 'greet') toast('让啵啵把上一句话说完，再继续聊吧。'); return; }
  applyElapsed(state, now);
  const result = care(state, action, gameScore);
  if (!result.ok) { speak(result.message); toast(result.message); return; }
  cooldowns.set(action, now);
  if (action === 'greet') setTimeout(render, wait + 10);
  const level = friendship(state.xp).level;
  switch (action) {
    case 'greet': react('greeting', 850); speak(greeting(level, state.name)); break;
    case 'pet': react('happy', 1300); effect('heart', 5, point); speak(petLines[Math.floor(Math.random() * petLines.length)]); break;
    case 'feed': react('eating', 2500); effect('star', 4); speak(level < 4 ? '谢谢，点心我收下了。' : '这块给我的？嗯……草莓挑得还不错。'); break;
    case 'wash': react('washing', 2200); effect('bubble', 16); speak('泡泡别弄进眼睛。水温倒是刚刚好。'); break;
    case 'gift': react('gifting'); effect('flower', 8); speak(level < 4 ? '谢谢。我找个花瓶，把它放好。' : '这花嘛，勉强合格。我去找个花瓶。'); break;
    case 'play': react('happy'); effect('star', 8); speak(level < 4 ? `${gameScore} 颗星星。谢谢你陪我玩这一局。` : `接住了 ${gameScore} 颗？还不错，下次我可不会让着你。`); break;
    case 'sleep':
      clearTimeout(reactionTimeout); clearInterval(sleepEffectInterval);
      $('#sprite').className = `sprite${state.sleeping ? ' sleeping' : ''}`;
      speak(state.sleeping ? (level < 4 ? '我先休息一会儿。下次再聊吧。' : '我只是闭一下眼。你也早点睡。') : (level < 4 ? '我醒了。要聊一会儿吗？' : '我醒了。……你怎么还坐那么远？'));
      if (state.sleeping) sleepEffectInterval = setInterval(() => { if (!document.hidden) effect('sleep', 2); }, 2400);
      break;
  }
  sound(action === 'sleep' ? 'sleep' : 'soft');
  render(); save();
  if (result.levelUp) {
    speak(stageFor(level).opening);
    const unlocked = { 2: '聊天和接星星已开放。', 3: '可以带点心、送礼物和陪伴休息。', 4: '现在可以轻轻摸摸。', 5: '现在可以帮忙洗香香了。' }[level] || '又熟悉了一点。';
    toast(`关系变成「${friendship(state.xp).title}」。${unlocked}`);
  }
  if (result.dailyReward) setTimeout(() => toast('今天的小心愿完成啦！收下 20 颗星星糖。'), result.levelUp ? 3400 : 400);
}

document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.action;
  if (action === 'play') openPlay(); else act(action);
}));
$('#gift-button').addEventListener('click', () => act('gift'));
let pointer = null, travel = 0, stroked = false;
$('#character').addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; travel = 0; stroked = false;
  $('#character').setPointerCapture(event.pointerId);
});
$('#character').addEventListener('pointermove', event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  if (!canInteract(state, 'pet').ok) return;
  travel += Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
  pointer.x = event.clientX; pointer.y = event.clientY;
  if (travel > 35) {
    const bounds = $('#room').getBoundingClientRect();
    act('pet', { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    travel = 0; stroked = true;
  }
});
$('#character').addEventListener('pointerup', event => {
  if (pointer?.id !== event.pointerId) return;
  if (!stroked) { const bounds = $('#room').getBoundingClientRect(); act(canInteract(state, 'pet').ok ? 'pet' : 'greet', { x: event.clientX - bounds.left, y: event.clientY - bounds.top }); }
  pointer = null;
});
$('#character').addEventListener('pointercancel', () => pointer = null);
$('#character').addEventListener('click', event => { if (event.detail === 0) act(canInteract(state, 'pet').ok ? 'pet' : 'greet'); });
$('#sound-button').addEventListener('click', () => { state.sound = !state.sound; render(); save(); sound(); toast(state.sound ? '轻轻的音效，已开启' : '音效已关闭'); });
$('#room-toggle').addEventListener('click', () => { state.night = !state.night; render(); save(); });
$('#settings-button').addEventListener('click', () => { $('#name-input').value = state.name; $('#settings-dialog').returnValue = 'cancel'; $('#settings-dialog').showModal(); });
$('#settings-dialog').addEventListener('close', () => {
  if ($('#settings-dialog').returnValue !== 'save') return;
  state.name = Array.from($('#name-input').value.trim()).slice(0, 12).join('') || DEFAULT_NAME;
  render(); save(); speak(friendship(state.xp).level < 4 ? `嗯，我叫${state.name}。` : `${state.name}？嗯，记得好好叫我的名字。`);
});
$('#help-button').addEventListener('click', () => { $('#settings-dialog').close('cancel'); $('#help-dialog').showModal(); });
$('#help-close').addEventListener('click', () => $('#help-dialog').close());

function clearGame() {
  clearInterval(playInterval); clearInterval(playClock);
  for (const timer of starTimeouts) clearTimeout(timer);
  starTimeouts.clear(); gameRunning = false;
  $('#star-field').querySelectorAll('.falling-star').forEach(el => el.remove());
}
function openPlay() {
  applyElapsed(state); render(); save();
  const access = canInteract(state, 'play');
  if (!access.ok) { speak(access.message); toast(access.message); return; }
  if (state.sleeping) { const message = '嘘，我才刚睡着。等醒了再陪你。'; speak(message); toast(message); return; }
  if (state.energy < 30) { const message = '先让我打个盹。醒了再比，免得你占便宜。'; speak(message); toast(message); return; }
  clearGame(); score = 0;
  $('#play-score').textContent = '0'; $('#play-time').textContent = '15 秒';
  const closeFriends = friendship(state.xp).level >= 4;
  $('#play-title').textContent = closeFriends ? '来比一局' : '一起接星星';
  $('#play-intro').innerHTML = `<span>✦</span><h3>${closeFriends ? '听说你很会接星星？' : '一起玩一小局接星星？'}</h3><p>${closeFriends ? '给你 15 秒。让我看看你的本事。' : '15 秒，试试能接住多少颗。'}</p><button class="primary-button" id="play-start">开始接星星</button>`;
  $('#play-intro').hidden = false;
  $('#play-intro').style.display = 'flex';
  $('#play-start').addEventListener('click', startGame);
  $('#play-dialog').showModal();
}
function spawnStar() {
  if (!gameRunning) return;
  if (Date.now() >= deadline) { finishGame(); return; }
  const field = $('#star-field'), star = document.createElement('button');
  star.className = 'falling-star'; star.textContent = '✦'; star.setAttribute('aria-label', '接住这颗星星');
  star.style.left = `${12 + Math.random() * Math.max(0, field.clientWidth - 80)}px`;
  star.style.top = `${18 + Math.random() * Math.max(0, field.clientHeight - 105)}px`;
  const expire = setTimeout(() => { star.remove(); starTimeouts.delete(expire); }, 2600); starTimeouts.add(expire);
  star.addEventListener('click', () => {
    if (!gameRunning) return;
    if (Date.now() >= deadline) { finishGame(); return; }
    score++; $('#play-score').textContent = score;
    clearTimeout(expire); starTimeouts.delete(expire); star.remove(); sound('star');
    // Keep keyboard play usable after the focused star disappears.
    field.querySelector('.falling-star')?.focus({ preventScroll: true });
  }, { once: true });
  field.append(star);
}
function startGame() {
  if (gameRunning) return;
  score = 0; gameRunning = true; deadline = Date.now() + 15000;
  $('#play-intro').style.display = 'none';
  spawnStar(); $('#star-field .falling-star')?.focus();
  playInterval = setInterval(spawnStar, 650);
  playClock = setInterval(() => {
    const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    $('#play-time').textContent = `${left} 秒`;
    if (!left) finishGame();
  }, 100);
}
function finishGame() {
  if (!gameRunning) return;
  clearGame(); $('#play-time').textContent = '完成啦';
  act('play', null, score);
  const intro = $('#play-intro'); intro.style.display = 'flex';
  intro.innerHTML = `<span>✦</span><h3>不错嘛，${score} 颗星星。</h3><p>获得 ${score} 颗星星糖。先收好，下次再比一局。</p><button class="primary-button" id="play-done">回到小房间</button>`;
  $('#play-done').addEventListener('click', () => $('#play-dialog').close());
  $('#play-done').focus();
}
$('#play-close').addEventListener('click', () => $('#play-dialog').close());
$('#play-dialog').addEventListener('close', () => { const cancelled = gameRunning; clearGame(); if (cancelled) toast('这次先休息一下，随时可以再玩。'); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (gameRunning) $('#play-dialog').close(); save(); }
  else { applyElapsed(state); render(); save(); }
});
window.addEventListener('pagehide', save);
setInterval(() => { if (document.hidden) return; applyElapsed(state); render(); save(); }, 5000);
render(); save();
if (state.sleeping) {
  speak('我还在休息。醒了再聊吧。');
  sleepEffectInterval = setInterval(() => { if (!document.hidden) effect('sleep', 2); }, 2400);
} else speak(stageFor(friendship(state.xp).level).opening);
if (!storageAvailable) toast('浏览器暂时不能保存进度。当前页面仍然可以玩。');
const checkImage = new Image(); checkImage.src = './assets/character.webp';
checkImage.onerror = () => { speak('角色图片暂时没加载好，刷新一下再见面吧。'); toast('角色素材加载失败，请检查网络后刷新。'); };
