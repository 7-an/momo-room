import { whereabouts, placeOpen } from '../core/index.js?v=20261030e';
import { places, placeById, TOWN_NAME } from '../content/town.js?v=20261030e';
import { state, worldNow } from './session.js?v=20261030e';
import { $, el } from './dom.js?v=20261030e';
import { travel } from './world.js?v=20261030e';

const ACTION_NAMES = { greet: '聊天', play: '一起玩', feed: '送点心', gift: '送礼物', sleep: '陪她休息', pet: '摸摸', wash: '洗香香' };
let selected = null;
function drawMap() {
  const where = whereabouts(state, worldNow());
  selected ??= where.place;
  $('#map-title').textContent = TOWN_NAME;
  $('#map-places').replaceChildren(...places.map(place => {
    const open = placeOpen(state, place.id), here = where.place === place.id, you = state.world.place === place.id;
    return el('button', {
      class: `map-place${open ? '' : ' locked'}`, style: `left:${place.x}%;top:${place.y}%`,
      'aria-pressed': String(place.id === selected),
      'aria-label': `${place.name}${open ? '' : `，Lv. ${place.level} 开放`}${here ? '，她在这里' : ''}${you ? '，你在这里' : ''}`,
      onClick: () => { selected = place.id; drawMap(); }
    },
    here ? el('span', { class: 'map-her', 'aria-hidden': 'true' }) : null,
    el('span', { class: 'map-house', style: `--walls:${place.walls};--roof:${place.roof}`, 'aria-hidden': 'true' }),
    el('strong', { text: place.short }),
    you ? el('span', { class: 'map-you', text: '你在这里' }) : !open ? el('small', { text: `Lv. ${place.level} 开放` }) : here ? el('small', { text: where.label }) : null);
  }));
  drawDetail(where);
}
function drawDetail(where) {
  const place = placeById(selected), open = placeOpen(state, place.id), here = where.place === place.id, you = state.world.place === place.id;
  const go = el('button', { class: 'primary-button', disabled: !open || you, onClick: () => { $('#map-dialog').close(); travel(place.id); } });
  go.textContent = !open ? `Lv. ${place.level} 开放` : you ? '你已经在这里' : here ? '去找她' : '去这里';
  $('#map-detail').replaceChildren(
    el('div', {}, el('span', { class: 'muted', text: place.sub }), el('h3', { text: place.name })),
    el('p', { text: place.desc }),
    el('div', { class: `who${here ? ' here' : ''}` },
      here ? el('span', { class: 'who-face', 'aria-hidden': 'true' }) : null,
      el('div', {}, el('span', { text: '她在这里吗' }), el('strong', { text: here ? `在 · ${where.label}` : `不在，她在${placeById(where.place).short} · ${where.label}` }))),
    el('div', {}, el('span', { class: 'muted', text: '在这里可以' }), el('div', { class: 'chips', style: 'margin-top:8px' }, ...place.actions.map(action => el('span', { text: ACTION_NAMES[action] })))),
    go);
}
export function openMap() {
  selected = null;
  drawMap();
  $('#map-dialog').showModal();
}
export function initMap() {
  $('#map-close').addEventListener('click', () => $('#map-dialog').close());
}
