import { DEFAULT_NAME, friendship, canInteract } from '../core/index.js?v=20261029a';
import { actionLines } from '../content/dialogue.js?v=20261029a';
import { state, save } from './session.js?v=20261029a';
import { render } from './render.js?v=20261029a';
import { $, toast, speak } from './dom.js?v=20261029a';
import { sound } from './audio.js?v=20261029a';
import { act } from './actions.js?v=20261029a';
import { contact } from './chat.js?v=20261029a';
import { openPlay } from './play.js?v=20261029a';

// Buttons, the character's touch gestures and the header tools.
export function initRoom() {
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'play') openPlay(); else if (action === 'greet') contact(); else act(action);
  }));
  $('#gift-button').addEventListener('click', () => act('gift'));
  // A stroke counts once the pointer has travelled far enough; a plain tap greets or pets.
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
    if (!stroked) { const bounds = $('#room').getBoundingClientRect(); if (canInteract(state, 'pet').ok) act('pet', { x: event.clientX - bounds.left, y: event.clientY - bounds.top }); else contact(); }
    pointer = null;
  });
  $('#character').addEventListener('pointercancel', () => pointer = null);
  // Keyboard activation arrives as a click with no pointer detail.
  $('#character').addEventListener('click', event => { if (event.detail === 0) { if (canInteract(state, 'pet').ok) act('pet'); else contact(); } });
  $('#sound-button').addEventListener('click', () => { state.sound = !state.sound; render(); save(); sound(); toast(state.sound ? '轻轻的音效，已开启' : '音效已关闭'); });
  $('#room-toggle').addEventListener('click', () => { state.night = !state.night; render(); save(); });
  $('#settings-button').addEventListener('click', () => { $('#name-input').value = state.name; $('#settings-dialog').returnValue = 'cancel'; $('#settings-dialog').showModal(); });
  $('#settings-dialog').addEventListener('close', () => {
    if ($('#settings-dialog').returnValue !== 'save') return;
    state.name = Array.from($('#name-input').value.trim()).slice(0, 12).join('') || DEFAULT_NAME;
    render(); save(); speak(actionLines.rename(friendship(state.xp).level, state.name));
  });
  $('#help-button').addEventListener('click', () => { $('#settings-dialog').close('cancel'); $('#help-dialog').showModal(); });
  $('#help-close').addEventListener('click', () => $('#help-dialog').close());
}
