import { applyElapsed, friendship, care, chat } from '../core/index.js?v=20261029a';
import { stageFor, greeting, petLines, actionLines, unlockNotes } from '../content/dialogue.js?v=20261029a';
import { state, cooldowns, save } from './session.js?v=20261029a';
import { render } from './render.js?v=20261029a';
import { toast, speak } from './dom.js?v=20261029a';
import { sound } from './audio.js?v=20261029a';
import { effect, react, resetPose, syncSleepEffect } from './effects.js?v=20261029a';
import { queueStories } from './stories.js?v=20261029a';

const waits = { greet: 3000, pet: 650, feed: 2400, wash: 2200, gift: 1500, sleep: 450 };
// Runs one interaction through the rules, then plays its feedback. Returns null when nothing happened.
export function act(action, point, gameScore = 0, selection = null) {
  const wait = waits[action] || 0;
  const now = Date.now();
  if (now - (cooldowns.get(action) || 0) < wait) { if (action === 'greet') toast('让啵啵把上一句话说完，再继续聊吧。'); return null; }
  applyElapsed(state, now);
  const result = selection ? chat(state, selection.topic, selection.choice, now) : care(state, action, gameScore, now);
  if (!result.ok) { speak(result.message); toast(result.message); return null; }
  cooldowns.set(action, now);
  if (action === 'greet') setTimeout(render, wait + 10);
  const level = friendship(state.xp).level;
  switch (action) {
    case 'greet': react('greeting', 850); speak(result.reply || greeting(level, state.name)); break;
    case 'pet': react('happy', 1300); effect('heart', 5, point); speak(petLines[Math.floor(Math.random() * petLines.length)]); break;
    case 'feed': react('eating', 2500); effect('star', 4); speak(actionLines.feed(level)); break;
    case 'wash': react('washing', 2200); effect('bubble', 16); speak(actionLines.wash(level)); break;
    case 'gift': react('gifting'); effect('flower', 8); speak(actionLines.gift(level)); break;
    case 'play': react('happy'); effect('star', 8); speak(actionLines.play(level, gameScore)); break;
    case 'sleep': resetPose(); syncSleepEffect(); speak(actionLines.sleep(level, state.sleeping)); break;
  }
  sound(action === 'sleep' ? 'sleep' : 'soft');
  render(); save();
  if (result.levelUp) {
    if (!selection) speak(stageFor(level).opening);
    toast(`关系变成「${friendship(state.xp).title}」。${unlockNotes[level] || '又熟悉了一点。'}`);
  }
  queueStories(result.storyStages);
  if (result.dailyReward) setTimeout(() => toast('今天的小心愿完成啦！收下 20 颗星星糖。'), result.levelUp ? 3400 : 400);
  return result;
}
