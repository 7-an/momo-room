import { friendship } from '../core/index.js?v=20261030c';
import { stories, memoryDefinitions } from '../content/journey.js?v=20261030c';
import { state } from './session.js?v=20261030c';
import { $, icon } from './dom.js?v=20261030c';

// Stage stories wait here until no other dialog is open, then show one at a time.
const storyQueue = [];
let storyReturnAlbum = false;
export function queueStories(stages) { storyQueue.push(...stages); flushStories(); }
export function showStory(stage, returnAlbum = false) {
  const story = stories[stage - 1]; if (!story) return;
  storyReturnAlbum = returnAlbum;
  $('#story-title').textContent = story.title; $('#story-scene').textContent = story.scene;
  $('#story-quote').textContent = story.quote.replace('我叫啵啵', `我叫${state.name}`);
  $('#story-unlock').textContent = story.unlock; $('#story-number').textContent = String(stage).padStart(2, '0');
  $('#story-icon use').setAttribute('href', `#i-${story.icon}`);
  $('#story-done').textContent = returnAlbum ? '回到回忆小册' : '把这一页收好';
  $('#story-dialog').showModal(); $('#story-done').focus();
}
export function flushStories() {
  if (!storyQueue.length || document.querySelector('dialog[open]')) return;
  showStory(storyQueue.shift());
}
export function openAlbum() {
  const grid = $('#memory-grid'); grid.replaceChildren();
  const memories = [...state.journey.memories].reverse();
  if (!memories.length) {
    const empty = document.createElement('div'); empty.className = 'album-empty';
    const title = document.createElement('h3'); title.textContent = '这一页，等你们来写';
    const note = document.createElement('p'); note.textContent = '打个招呼、聊聊今天，或者一起接一局星星。新的小事会慢慢留下来。';
    empty.append(icon('heart'), title, note); grid.append(empty);
  }
  memories.forEach((memory, i) => {
    const definition = memoryDefinitions[memory.id], card = document.createElement('article'); card.className = 'memory-card';
    const illustration = document.createElement('div'); illustration.className = `memory-art art-${definition.icon}`;
    const number = document.createElement('span'); number.className = 'memory-number'; number.textContent = String(memories.length - i).padStart(2, '0');
    illustration.append(icon(definition.icon), number);
    const date = document.createElement('time'); date.dateTime = new Date(memory.at).toISOString();
    date.textContent = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(memory.at);
    const title = document.createElement('h3'); title.textContent = definition.title;
    const note = document.createElement('p'); note.textContent = definition.note;
    card.append(illustration, date, title, note);
    if (definition.stage) {
      const read = document.createElement('button'); read.className = 'memory-read'; read.textContent = '重读这一页 ↗';
      read.addEventListener('click', () => { $('#album-dialog').close(); showStory(definition.stage, true); }); card.append(read);
    }
    grid.append(card);
  });
  $('#album-dialog').showModal();
}
export function initStories() {
  $('#story-close').addEventListener('click', () => $('#story-dialog').close());
  $('#story-done').addEventListener('click', () => $('#story-dialog').close());
  $('#story-dialog').addEventListener('close', () => {
    const returnToAlbum = storyReturnAlbum; storyReturnAlbum = false;
    if (returnToAlbum) openAlbum(); else flushStories();
  });
  $('#story-open').addEventListener('click', () => showStory(Math.min(5, friendship(state.xp).level)));
  $('#album-close').addEventListener('click', () => $('#album-dialog').close());
  // Any other dialog closing may free the way for a waiting story.
  for (const selector of ['#chat-dialog', '#album-dialog', '#play-dialog', '#settings-dialog', '#help-dialog', '#map-dialog', '#guide-dialog']) {
    $(selector).addEventListener('close', () => queueMicrotask(flushStories));
  }
}
