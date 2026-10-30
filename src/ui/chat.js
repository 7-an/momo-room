import { applyElapsed, friendship, canMeet } from '../core/index.js?v=20261030c';
import { topics } from '../content/journey.js?v=20261030c';
import { state, save, greetCoolingDown, worldNow } from './session.js?v=20261030c';
import { render } from './render.js?v=20261030c';
import { $, toast, icon } from './dom.js?v=20261030c';
import { act } from './actions.js?v=20261030c';

let selectedTopic = null;
// Tapping her: a plain hello while strangers or while she sleeps, a chat otherwise.
export function contact() {
  const meet = canMeet(state, 'greet', worldNow());
  if (friendship(state.xp).level === 1 || (meet.ok && meet.where.asleep && !meet.where.napping)) act('greet'); else openChat();
}
export function openChat() {
  applyElapsed(state); render(); save();
  const meet = canMeet(state, 'greet', worldNow());
  if (!meet.ok) { toast(meet.message); return; }
  if (state.sleeping) { toast('等她醒了，再慢慢聊吧。'); return; }
  if (friendship(state.xp).level < 2) { act('greet'); return; }
  if (greetCoolingDown()) { toast('让她把上一句话说完，再继续聊吧。'); return; }
  selectedTopic = null;
  $('#chat-title').textContent = '今天，聊些什么？';
  $('#chat-intro').textContent = '选一个小话题。想好再说也可以。';
  $('#chat-topics').replaceChildren();
  $('#chat-topics').hidden = false; $('#chat-choices').hidden = true; $('#chat-answer').hidden = true;
  for (const topic of topics) {
    const button = document.createElement('button'); button.className = 'topic-button';
    const label = document.createElement('span'); label.textContent = topic.title;
    button.append(icon(topic.icon), label);
    button.addEventListener('click', () => chooseTopic(topic)); $('#chat-topics').append(button);
  }
  $('#chat-dialog').showModal();
}
function chooseTopic(topic) {
  selectedTopic = topic;
  $('#chat-title').textContent = topic.title;
  $('#chat-intro').textContent = topic.prompt;
  $('#chat-topics').hidden = true; $('#chat-choices').hidden = false;
  $('#chat-choices').replaceChildren();
  for (const choice of topic.choices) {
    const button = document.createElement('button'); button.className = 'choice-button'; button.textContent = choice.label;
    button.addEventListener('click', () => {
      if (selectedTopic !== topic || $('#chat-choices').hidden) return;
      const result = act('greet', { selection: { topic: topic.id, choice: choice.id } });
      if (!result) return;
      $('#chat-choices').hidden = true; $('#chat-answer').hidden = false;
      $('#chat-intro').textContent = `你说：${choice.label}`;
      $('#chat-reply').textContent = result.reply;
      $('#chat-saved').textContent = result.added.includes(`chat-${topic.id}`) ? '这段小对话，已经放进回忆小册。' : `这句话，${state.name}记住了。`;
      $('#chat-done').focus();
    }); $('#chat-choices').append(button);
  }
  const back = document.createElement('button'); back.className = 'text-button'; back.textContent = '换个话题';
  back.addEventListener('click', () => { $('#chat-dialog').close(); openChat(); }); $('#chat-choices').append(back);
  $('#chat-choices button').focus();
}
export function initChat() {
  $('#chat-close').addEventListener('click', () => $('#chat-dialog').close());
  $('#chat-done').addEventListener('click', () => $('#chat-dialog').close());
}
