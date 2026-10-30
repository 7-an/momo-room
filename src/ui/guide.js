import { STAGE_TITLES } from '../core/index.js?v=20261030c';
import { topics } from '../content/journey.js?v=20261030c';
import { discoverables, SHELVES } from '../persona/index.js?v=20261030c';
import { state, save } from './session.js?v=20261030c';
import { render } from './render.js?v=20261030c';
import { $, el, icon } from './dom.js?v=20261030c';

const ACTIVITY = { tea: '下午茶的时候', read: '在书店的时候' };
const ON = { feed: '送点心时', gift: '送礼物时', play: '一起玩的时候', wash: '洗香香时', pet: '摸摸头时', sleep: '陪她休息时', greet: '聊天时' };
// How the player came to know this, in words.
function howFound(rule) {
  if (rule.on === 'stage') return `关系变成「${STAGE_TITLES[rule.stage - 1]}」时`;
  if (rule.activity) return ACTIVITY[rule.activity] ?? ON[rule.on];
  if (rule.topic) return `聊「${topics.find(topic => topic.id === rule.topic)?.title ?? '天'}」时`;
  return ON[rule.on];
}
const date = at => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(at);
let shelf = 'likes', selected = null;

function draw() {
  const all = discoverables(), found = new Map(state.discoveries.map(d => [d.id, d.at]));
  const known = all.filter(item => found.has(item.id)).length;
  $('#guide-found').textContent = `${known} / ${all.length}`;
  $('#guide-fill').style.width = `${all.length ? known / all.length * 100 : 0}%`;
  $('#guide-tabs').replaceChildren(...SHELVES.map(({ key, kind, label }) => {
    const items = all.filter(item => item.kind === kind);
    return el('button', { class: 'guide-tab', role: 'tab', 'aria-selected': String(key === shelf), onClick: () => { shelf = key; selected = null; draw(); } },
      `${label} · ${items.filter(item => found.has(item.id)).length}/${items.length}`);
  }));
  const kind = SHELVES.find(s => s.key === shelf).kind;
  const items = all.filter(item => item.kind === kind);
  selected ??= items.find(item => found.has(item.id))?.id ?? items[0]?.id;
  $('#guide-grid').replaceChildren(...items.map(item => {
    const isKnown = found.has(item.id), mark = kind === 'dislike' ? '✕' : '♥';
    return el('button', { class: `entry ${kind}${isKnown ? '' : ' unknown'}`, 'aria-pressed': String(item.id === selected), onClick: () => { selected = item.id; draw(); } },
      el('span', { class: 'entry-icon' }, icon(isKnown ? item.icon : 'question')),
      el('strong', { text: isKnown ? item.label : '？？？' }),
      el('span', { text: isKnown ? `${date(found.get(item.id))} · ${howFound(item.found)}发现` : '还没发现' }),
      isKnown && item.weight ? el('span', { class: 'weight', 'aria-label': `程度 ${item.weight}`, text: mark.repeat(item.weight) }) : null);
  }));
  const item = items.find(entry => entry.id === selected);
  if (!item) { $('#guide-detail').replaceChildren(); return; }
  if (!found.has(item.id)) {
    $('#guide-detail').replaceChildren(el('div', { class: 'mystery', 'aria-hidden': 'true', text: '?' }), el('h3', { style: 'text-align:center', text: '还没发现' }), el('span', { class: 'muted', style: 'text-align:center', text: '线索' }), el('p', { class: 'hint-box', text: item.hint }));
    return;
  }
  const label = SHELVES.find(s => s.kind === kind).label;
  $('#guide-detail').replaceChildren(
    el('span', { class: 'kind', text: item.weight ? `${label} · ${(kind === 'dislike' ? '✕' : '♥').repeat(item.weight)}` : label }),
    el('h3', { text: item.label }),
    el('span', { class: 'muted', text: `${date(found.get(item.id))} · ${howFound(item.found)}发现` }),
    el('div', { class: 'quote-box' }, el('span', { class: 'who-face', 'aria-hidden': 'true' }), el('blockquote', { text: item.quote })),
    el('div', {}, el('span', { class: 'muted', text: '她为什么在意' }), el('p', { style: 'margin-top:4px', text: item.note })));
}
export function openGuide() {
  selected = null;
  draw();
  // Opening the guide counts as having seen every discovery so far.
  state.world.seen = state.discoveries.length; save(); render();
  $('#guide-dialog').showModal();
}
export function initGuide() {
  $('#guide-close').addEventListener('click', () => $('#guide-dialog').close());
}
