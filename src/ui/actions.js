import { applyElapsed, friendship, visit } from '../core/index.js?v=20261030c';
import { stageFor, greeting, petLines, actionLines, unlockNotes } from '../content/dialogue.js?v=20261030c';
import { sleepyLines } from '../content/world.js?v=20261030c';
import { discoverables, SHELVES } from '../persona/index.js?v=20261030c';
import { state, cooldowns, save, worldNow } from './session.js?v=20261030c';
import { render } from './render.js?v=20261030c';
import { toast, speak } from './dom.js?v=20261030c';
import { sound } from './audio.js?v=20261030c';
import { effect, react, resetPose } from './effects.js?v=20261030c';
import { queueStories } from './stories.js?v=20261030c';

const waits = { greet: 3000, pet: 650, feed: 2400, wash: 2200, gift: 1500, sleep: 450 };
const shelfLabel = Object.fromEntries(SHELVES.map(shelf => [shelf.kind, shelf.label]));
// Runs one interaction through the rules, then plays its feedback. Returns null when nothing happened.
// `options`: { point, score, selection: { topic, choice }, checkMeet }.
export function act(action, { point, score = 0, selection = null, checkMeet = true } = {}) {
  const wait = waits[action] || 0;
  const now = Date.now();
  if (now - (cooldowns.get(action) || 0) < wait) { if (action === 'greet') toast('让她把上一句话说完，再继续聊吧。'); return null; }
  applyElapsed(state, now);
  const result = visit(state, action, { now, worldNow: worldNow(), score, topic: selection?.topic, choice: selection?.choice, checkMeet });
  if (!result.ok) { if (!result.away) speak(result.message); toast(result.message); render(); return null; }
  cooldowns.set(action, now);
  if (action === 'greet') setTimeout(render, wait + 10);
  const level = friendship(state.xp).level;
  // Asleep on her own schedule, a hello only gets a mumble.
  const drowsy = result.where.asleep && !result.where.napping;
  switch (action) {
    case 'greet':
      react(drowsy ? 'sleeping' : 'greeting', 850);
      speak(drowsy ? sleepyLines[Math.floor(Math.random() * sleepyLines.length)] : result.reply || greeting(level, state.name));
      break;
    case 'pet': react('happy', 1300); effect('heart', 5, point); speak(petLines[Math.floor(Math.random() * petLines.length)]); break;
    case 'feed': react('eating', 2500); effect('star', 4); speak(actionLines.feed(level)); break;
    case 'wash': react('washing', 2200); effect('bubble', 16); speak(actionLines.wash(level)); break;
    case 'gift': react('gifting'); effect('flower', 8); speak(actionLines.gift(level)); break;
    case 'play': react('happy'); effect('star', 8); speak(actionLines.play(level, score)); break;
    case 'sleep': resetPose(); speak(actionLines.sleep(level, state.sleeping)); break;
  }
  sound(action === 'sleep' ? 'sleep' : 'soft');
  render(); save();
  if (result.levelUp) {
    if (!selection && !drowsy) speak(stageFor(level).opening);
    toast(`关系变成「${friendship(state.xp).title}」。${unlockNotes[level] || '又熟悉了一点。'}`);
  }
  if (result.dailyReward) toast('今天的小心愿完成啦！收下 20 颗星星糖。');
  const known = discoverables();
  for (const id of result.discovered) {
    const entry = known.find(item => item.id === id);
    toast(`发现了她的${shelfLabel[entry.kind]}：${entry.label}。收进图鉴了。`);
  }
  queueStories(result.storyStages);
  return result;
}
