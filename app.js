// Entry point: load the save, wire up the page, keep the town ticking while visible.
import { applyElapsed } from './src/core/index.js?v=20261030d';
import { state, storageAvailable, lastVisitAt, load, save } from './src/ui/session.js?v=20261030d';
import { render } from './src/ui/render.js?v=20261030d';
import { toast, speak } from './src/ui/dom.js?v=20261030d';
import { resetPose } from './src/ui/effects.js?v=20261030d';
import { initStories } from './src/ui/stories.js?v=20261030d';
import { initChat } from './src/ui/chat.js?v=20261030d';
import { initRoom } from './src/ui/room.js?v=20261030d';
import { initPlay, abandonGame } from './src/ui/play.js?v=20261030d';
import { initMap } from './src/ui/map.js?v=20261030d';
import { initGuide } from './src/ui/guide.js?v=20261030d';
import { initWorld, greetScene, watchSchedule, showAway } from './src/ui/world.js?v=20261030d';
import { validatePersona } from './src/persona/index.js?v=20261030d';

load();
// Persona data is edited by hand; surface mistakes in the console instead of failing quietly.
const personaErrors = validatePersona();
if (personaErrors.length) console.warn('persona.js 数据有问题：\n' + personaErrors.join('\n'));
initChat(); initStories(); initRoom(); initPlay(); initMap(); initGuide(); initWorld();

let hiddenAt = null;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); abandonGame(); save(); return; }
  applyElapsed(state); render();
  if (hiddenAt && Date.now() - hiddenAt > 3600000) showAway(hiddenAt);
  hiddenAt = null;
  watchSchedule();
  save();
});
window.addEventListener('pagehide', save);
setInterval(() => { if (document.hidden) return; applyElapsed(state); render(); watchSchedule(); save(); }, 5000);

render(); resetPose(); showAway(lastVisitAt); greetScene({ first: true }); save();
if (!storageAvailable) toast('浏览器暂时不能保存进度。当前页面仍然可以玩。');
const checkImage = new Image(); checkImage.src = './assets/character.webp';
checkImage.onerror = () => { speak('角色图片暂时没加载好，刷新一下再见面吧。'); toast('角色素材加载失败，请检查网络后刷新。'); };
