import { clamp } from './state.js?v=20261029a';
import { friendship, canInteract } from './relationship.js?v=20261029a';
import { rememberAction, rememberChat } from './journey.js?v=20261029a';
import { chatReply } from '../content/journey.js?v=20261029a';

export function dailyPlan(state) {
  const stage = state.daily.stage;
  if (stage === 1) return [{ key: 'greet', target: 3, label: '打 3 次招呼' }];
  if (stage === 2) return [{ key: 'greet', target: 3, label: '聊 3 次天' }, { key: 'play', target: 1, label: '一起接一次星星' }];
  if (stage === 3) return [{ key: 'greet', target: 3, label: '聊 3 次天' }, { key: 'feed', target: 1, label: '带一份小点心' }, { key: 'play', target: 1, label: '一起接一次星星' }];
  return [{ key: 'pet', target: 5, label: '收到 5 次摸摸' }, { key: 'feed', target: 1, label: '吃一份小点心' }, { key: 'play', target: 1, label: '一起接一次星星' }];
}
export function care(state, action, score = 0, now = Date.now()) {
  const access = canInteract(state, action);
  if (!access.ok) return access;
  if (state.sleeping && action !== 'sleep') return { ok: false, message: '嘘，我才刚睡着。等醒了再陪你。' };
  if (action === 'feed' && state.food >= 97) return { ok: false, message: '已经饱啦。这份先留着，待会儿再给我。' };
  if (action === 'gift' && state.coins < 10) return { ok: false, message: '星星糖还不够呢。陪我接几颗再说。' };
  if (action === 'play' && state.energy < 30) return { ok: false, message: '先让我打个盹。醒了再比，免得你占便宜。' };
  const beforeLevel = friendship(state.xp).level;
  // [food, joy, energy, xp, coins]
  const delta = { greet: [0, 2, 0, beforeLevel === 1 ? 6 : 8, 0], pet: [0, 5, 0, 4, 1], feed: [20, 4, 0, 8, 2], wash: [0, 8, -2, 6, 2], gift: [0, 12, 0, 10, -10], play: [-3, 12, -10, 5 + score * 2, score] }[action];
  if (action === 'sleep') state.sleeping = !state.sleeping;
  else if (delta) {
    ['food', 'joy', 'energy'].forEach((key, i) => state[key] = clamp(state[key] + delta[i]));
    state.xp += delta[3]; state.coins += delta[4];
    if (['greet', 'pet', 'feed', 'play'].includes(action)) state.daily[action]++;
  } else return { ok: false, message: '这个动作暂时还没有准备好。' };
  const completed = dailyPlan(state).every(({ key, target }) => state.daily[key] >= target);
  let dailyReward = false;
  if (completed && !state.daily.claimed) { state.daily.claimed = true; state.coins += 20; dailyReward = true; }
  const afterLevel = friendship(state.xp).level;
  // Waking up isn't a new sleep memory.
  const memories = action === 'sleep' && !state.sleeping ? { storyStages: [], added: [] } : rememberAction(state, action, beforeLevel, afterLevel, now);
  return { ok: true, dailyReward, levelUp: afterLevel > beforeLevel, ...memories };
}
export function chat(state, topic, choice, now = Date.now()) {
  const reply = chatReply(friendship(state.xp).level, topic, choice);
  if (!reply) return { ok: false, message: '先打个招呼，熟悉一点再聊吧。' };
  const result = care(state, 'greet', 0, now);
  if (!result.ok) return result;
  if (rememberChat(state, topic, choice, now)) result.added.push(`chat-${topic}`);
  return { ...result, reply };
}
