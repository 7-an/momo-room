import { memoryDefinitions, chatReply } from '../content/journey.js?v=20261030e';
// Keepsake memories: fixed ids, deduplicated, never backfilled for older saves.
export function freshJourney() { return { memories: [], lastChat: null, followupDay: '' }; }
export function restoreJourney(raw, now) {
  const journey = freshJourney();
  if (!raw || typeof raw !== 'object') return journey;
  const used = new Set();
  if (Array.isArray(raw.memories)) for (const item of raw.memories) {
    if (!item || !Object.hasOwn(memoryDefinitions, item.id) || used.has(item.id) || !Number.isFinite(item.at) || item.at <= 0 || item.at > now) continue;
    used.add(item.id); journey.memories.push({ id: item.id, at: item.at });
  }
  journey.memories.sort((a, b) => a.at - b.at);
  const chat = raw.lastChat;
  if (chat && chatReply(2, chat.topic, chat.choice) && Number.isFinite(chat.at) && chat.at > 0 && chat.at <= now) journey.lastChat = { topic: chat.topic, choice: chat.choice, at: chat.at };
  if (typeof raw.followupDay === 'string' && /^\d{4}-\d{1,2}-\d{1,2}$/.test(raw.followupDay)) journey.followupDay = raw.followupDay;
  return journey;
}
export function remember(state, id, now = Date.now()) {
  if (!Object.hasOwn(memoryDefinitions, id) || state.journey.memories.some(m => m.id === id)) return false;
  state.journey.memories.push({ id, at: now }); return true;
}
export function rememberAction(state, action, beforeLevel, afterLevel, now) {
  const storyStages = [], added = [];
  const id = action === 'greet' ? 'hello' : action;
  // An older save has no evidence of earlier first meetings. Don't backfill it.
  if (action !== 'greet' || beforeLevel === 1) {
    if (remember(state, id, now)) { added.push(id); if (id === 'hello') storyStages.push(1); }
  }
  for (let stage = beforeLevel + 1; stage <= Math.min(5, afterLevel); stage++) {
    if (remember(state, `stage-${stage}`, now)) { added.push(`stage-${stage}`); storyStages.push(stage); }
  }
  return { storyStages, added };
}
export function rememberChat(state, topic, choice, now) {
  state.journey.lastChat = { topic, choice, at: now };
  return remember(state, `chat-${topic}`, now);
}
