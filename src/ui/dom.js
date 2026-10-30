export const $ = (selector) => document.querySelector(selector);
// Toasts queue up, so a level-up, a reward and a discovery each get read.
const toasts = [];
let toastTimeout = null;
export function toast(message) {
  if (toasts.at(-1) === message || ($('#toast').textContent === message && toastTimeout)) return;
  toasts.push(message);
  if (!toastTimeout) nextToast();
}
function nextToast() {
  const message = toasts.shift();
  if (!message) { $('#toast').classList.remove('visible'); toastTimeout = null; return; }
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimeout = setTimeout(nextToast, toasts.length ? 2600 : 3200);
}
export function speak(message) { $('#speech').textContent = message; }
export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`); svg.append(use); svg.setAttribute('aria-hidden', 'true'); return svg;
}
// Small helper for building DOM from data without innerHTML.
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'style') node.setAttribute('style', value);
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.flat().filter(child => child !== null && child !== undefined && child !== false));
  return node;
}
