import { state } from './session.js?v=20261030e';
import { render } from './render.js?v=20261030e';
import { toast } from './dom.js?v=20261030e';
// Soft chimes synthesised with Web Audio, so there are no sound files to download.
let audioContext;
export function sound(kind = 'soft') {
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
