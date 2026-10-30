import { DEFAULT_NAME, friendship, canInteract, canMeet } from '../core/index.js?v=20261030e';
import { actionLines } from '../content/dialogue.js?v=20261030e';
import { state, save, worldNow } from './session.js?v=20261030e';
import { render } from './render.js?v=20261030e';
import { $, toast, speak } from './dom.js?v=20261030e';
import { sound } from './audio.js?v=20261030e';
import { act } from './actions.js?v=20261030e';
import { contact } from './chat.js?v=20261030e';
import { openPlay } from './play.js?v=20261030e';
import { openMap } from './map.js?v=20261030e';
import { openGuide } from './guide.js?v=20261030e';
import { openAlbum } from './stories.js?v=20261030e';

// Petting needs the relationship, her being here and awake, and the place to allow it.
const canPet = () => canInteract(state, 'pet').ok && canMeet(state, 'pet', worldNow()).ok && !state.sleeping;
// Buttons, the character's touch gestures and the header tools.
export function initRoom() {
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'play') openPlay(); else if (action === 'greet') contact(); else act(action);
  }));
  // A stroke counts once the pointer has travelled far enough; a plain tap greets or pets.
  let pointer = null, travel = 0, stroked = false;
  const pointAt = event => { const bounds = $('#stage').getBoundingClientRect(); return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; };
  $('#character').addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; travel = 0; stroked = false;
    $('#character').setPointerCapture(event.pointerId);
  });
  $('#character').addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId || !canPet()) return;
    travel += Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer.x = event.clientX; pointer.y = event.clientY;
    if (travel > 35) { act('pet', { point: pointAt(event) }); travel = 0; stroked = true; }
  });
  $('#character').addEventListener('pointerup', event => {
    if (pointer?.id !== event.pointerId) return;
    if (!stroked) { if (canPet()) act('pet', { point: pointAt(event) }); else contact(); }
    pointer = null;
  });
  $('#character').addEventListener('pointercancel', () => pointer = null);
  // Keyboard activation arrives as a click with no pointer detail.
  $('#character').addEventListener('click', event => { if (event.detail === 0) { if (canPet()) act('pet'); else contact(); } });

  $('#map-open').addEventListener('click', openMap);
  $('#guide-open').addEventListener('click', openGuide);
  $('#album-open').addEventListener('click', openAlbum);
  $('#tab-room').addEventListener('click', () => { document.querySelector('dialog[open]')?.close(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#tab-map').addEventListener('click', openMap);
  $('#tab-guide').addEventListener('click', openGuide);
  $('#tab-album').addEventListener('click', openAlbum);
  $('#sound-button').addEventListener('click', () => { state.sound = !state.sound; render(); save(); sound(); toast(state.sound ? '轻轻的音效，已开启' : '音效已关闭'); });
  $('#settings-button').addEventListener('click', () => { $('#name-input').value = state.name; $('#settings-dialog').returnValue = 'cancel'; $('#settings-dialog').showModal(); });
  $('#settings-dialog').addEventListener('close', () => {
    if ($('#settings-dialog').returnValue !== 'save') return;
    state.name = Array.from($('#name-input').value.trim()).slice(0, 12).join('') || DEFAULT_NAME;
    render(); save(); speak(actionLines.rename(friendship(state.xp).level, state.name));
  });
  $('#help-button').addEventListener('click', () => { $('#settings-dialog').close('cancel'); $('#help-dialog').showModal(); });
  $('#help-close').addEventListener('click', () => $('#help-dialog').close());
}
