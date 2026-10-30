// Entry point: load the save, wire up the page, keep state ticking while visible.
import { applyElapsed, friendship, dayKey } from './src/core/index.js?v=20261029a';
import { stageFor } from './src/content/dialogue.js?v=20261029a';
import { followup } from './src/content/journey.js?v=20261029a';
import { state, storageAvailable, load, save } from './src/ui/session.js?v=20261029a';
import { render } from './src/ui/render.js?v=20261029a';
import { toast, speak } from './src/ui/dom.js?v=20261029a';
import { syncSleepEffect } from './src/ui/effects.js?v=20261029a';
import { initStories } from './src/ui/stories.js?v=20261029a';
import { initChat } from './src/ui/chat.js?v=20261029a';
import { initRoom } from './src/ui/room.js?v=20261029a';
import { initPlay, abandonGame } from './src/ui/play.js?v=20261029a';
import { validatePersona } from './src/persona/index.js?v=20261029a';

load();
// Persona data is edited by hand; surface mistakes in the console instead of failing quietly.
const personaErrors = validatePersona();
if (personaErrors.length) console.warn('persona.js 数据有问题：\n' + personaErrors.join('\n'));
initChat(); initStories(); initRoom(); initPlay();

// A follow-up on yesterday's chat, at most once a day. It gives no XP.
function continueChat() {
  const continued = followup(state, friendship(state.xp).level, dayKey());
  if (continued) { speak(continued); state.journey.followupDay = dayKey(); }
  return continued;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { abandonGame(); save(); }
  else {
    applyElapsed(state); render();
    if (!state.sleeping) continueChat();
    save();
  }
});
window.addEventListener('pagehide', save);
setInterval(() => { if (document.hidden) return; applyElapsed(state); render(); save(); }, 5000);
render(); save();
if (state.sleeping) {
  speak('我还在休息。醒了再聊吧。');
  syncSleepEffect();
} else {
  if (!continueChat()) speak(stageFor(friendship(state.xp).level).opening);
  save();
}
if (!storageAvailable) toast('浏览器暂时不能保存进度。当前页面仍然可以玩。');
const checkImage = new Image(); checkImage.src = './assets/character.webp';
checkImage.onerror = () => { speak('角色图片暂时没加载好，刷新一下再见面吧。'); toast('角色素材加载失败，请检查网络后刷新。'); };
