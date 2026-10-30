import { applyElapsed, friendship, canInteract, canMeet } from '../core/index.js?v=20261030c';
import { state, save, worldNow } from './session.js?v=20261030c';
import { render } from './render.js?v=20261030c';
import { $, toast, speak } from './dom.js?v=20261030c';
import { sound } from './audio.js?v=20261030c';
import { act } from './actions.js?v=20261030c';

// 15-second star catching. Rewards are settled once, only when the timer runs out.
const starTimeouts = new Set();
let playInterval, playClock, gameRunning = false, score = 0, deadline = 0;
function clearGame() {
  clearInterval(playInterval); clearInterval(playClock);
  for (const timer of starTimeouts) clearTimeout(timer);
  starTimeouts.clear(); gameRunning = false;
  $('#star-field').querySelectorAll('.falling-star').forEach(el => el.remove());
}
export function openPlay() {
  applyElapsed(state); render(); save();
  const access = canInteract(state, 'play');
  if (!access.ok) { speak(access.message); toast(access.message); return; }
  const meet = canMeet(state, 'play', worldNow());
  if (!meet.ok) { toast(meet.message); return; }
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
  // She was there when the game began; a schedule change mid-game doesn't cancel the reward.
  act('play', { score, checkMeet: false });
  const intro = $('#play-intro'); intro.style.display = 'flex';
  intro.innerHTML = `<span>✦</span><h3>不错嘛，${score} 颗星星。</h3><p>获得 ${score} 颗星星糖。先收好，下次再比一局。</p><button class="primary-button" id="play-done">回到小房间</button>`;
  $('#play-done').addEventListener('click', () => $('#play-dialog').close());
  $('#play-done').focus();
}
// Leaving the page mid-game ends it without a reward.
export function abandonGame() { if (gameRunning) $('#play-dialog').close(); }
export function initPlay() {
  $('#play-close').addEventListener('click', () => $('#play-dialog').close());
  $('#play-dialog').addEventListener('close', () => { const cancelled = gameRunning; clearGame(); if (cancelled) toast('这次先休息一下，随时可以再玩。'); });
}
