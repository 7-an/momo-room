// Authored fictional dialogue. All personal progress stays in the browser.
export const stories = [
  { title: '门口的一句你好', scene: '窗边的人抬起头，轻轻点了一下。你们还不认识，今天先把名字记住。', quote: '你好。我叫啵啵。', unlock: '先打个招呼。其他的，等熟悉一点再说。', icon: 'sun' },
  { title: '椅子往这边挪了一点', scene: '啵啵把窗边的小椅子挪开一点，给你留出坐下的位置。桌上那颗星星，也推到了你这边。', quote: '既然有空……要不要一起玩一局？', unlock: 'Lv. 2 · 聊天选择和一起接星星开放了。', icon: 'star' },
  { title: '点心盘，多留了一个位置', scene: '小盘子被挪到你这边。啵啵指了指空着的位置，又把另一只杯子放到旁边。', quote: '下次可以带点心来。困了的话，我会自己说。', unlock: 'Lv. 3 · 喂食和睡觉一起开放。', icon: 'food' },
  { title: '只准理一下头发', scene: '一缕卷发翘了起来。啵啵看了你一眼，慢慢靠近了一点，却还装作只是在看窗外。', quote: '头发有点乱……你帮我理一下也行。只一下。', unlock: 'Lv. 4 · 现在可以轻轻摸摸了。', icon: 'heart' },
  { title: '水温要刚刚好', scene: '小毛巾被放到你手边，泡泡在暖光里慢慢散开。啵啵试了试水温，终于放心地把毛巾交给你。', quote: '泡泡别弄进眼睛。……下次也照这个水温。', unlock: 'Lv. 5 · 洗香香开放了，所有互动都可以慢慢来。', icon: 'clean' }
];
export const topics = [
  { id: 'day', title: '说说今天', prompt: '今天过得怎么样？', icon: 'sun', choices: [{ id: 'good', label: '今天有件开心的小事' }, { id: 'tired', label: '今天有点累，想歇一会儿' }] },
  { id: 'stars', title: '聊聊接星星', prompt: '下一局，你打算怎么接？', icon: 'star', choices: [{ id: 'win', label: '下次想接得更多' }, { id: 'try', label: '接多少都行，一起玩就好' }] },
  { id: 'quiet', title: '安静坐一会儿', prompt: '坐在窗边，也不用一直说话。', icon: 'moon', choices: [{ id: 'stay', label: '那我就在这里坐一会儿' }, { id: 'window', label: '窗外的光很好看' }] }
];
const replies = {
  'day:good': ['嗯，那很好。愿意的话，可以说说。', '说来听听。点心还没吃完，不急。', '哦？还知道来告诉我。那我就听一下。', '笑成这样，藏不住了。慢慢讲，我今天有空。'],
  'day:tired': ['那就在这儿歇一会儿吧。不想说也没关系。', '先坐下。杯子放这边，等你缓过来再聊。', '早说嘛。椅子又不是不给你坐。', '今天不用逞强。坐近一点……这边比较暖。'],
  'stars:win': ['那下次一起试试。先不用着急。', '可以。我帮你看左边，你看右边。', '口气倒不小。下次可别漏掉我指的那颗。', '行，给你留一局。输了也别急着走，再来一次就是了。'],
  'stars:try': ['嗯，一起玩一会儿就好。', '也是。漏掉几颗，明天还能再接。', '说得倒轻巧。……不过一起玩确实还行。', '那就慢慢接。反正今天的时间，我留了一点。'],
  'quiet:stay': ['嗯。那边有椅子，你可以坐。', '可以。窗边那把椅子一直空着。', '坐就坐，怎么还问。……别坐那么远。', '那就多坐一会儿。我刚好也不想说话。'],
  'quiet:window': ['嗯，下午的光比较柔和。', '这个时候，窗台会照到一小块太阳。', '你也发现了？我平时就坐这边。', '这边看得更清楚。过来一点，我给你留了位置。']
};
export function chatReply(level, topic, choice) {
  if (level < 2) return null;
  return replies[`${topic}:${choice}`]?.[Math.min(3, level - 2)] ?? null;
}
export const memoryDefinitions = {
  hello: { title: '一句你好', note: '名字记住了。先这样认识，也可以。', icon: 'sun', stage: 1 },
  play: { title: '一起玩的那一局', note: '漏掉的那颗，下次再接就是了。', icon: 'star' },
  feed: { title: '收下的那份点心', note: '草莓挑得不错。盘子先留在这里。', icon: 'food' },
  sleep: { title: '窗边的一小会儿安静', note: '我只是闭一下眼。你也记得休息。', icon: 'moon' },
  pet: { title: '翘起来的卷发', note: '只准理一下……刚才那下不算。', icon: 'heart' },
  wash: { title: '暖光里的小泡泡', note: '这个水温，记住就好。', icon: 'clean' },
  gift: { title: '花瓶里多了一束花', note: '颜色还算合格。我把它放窗边了。', icon: 'gift' },
  'chat-day': { title: '听你说过的一天', note: '你慢慢讲，我听着。', icon: 'sun' },
  'chat-stars': { title: '约好的下一局', note: '下次有空，再接一次星星。', icon: 'star' },
  'chat-quiet': { title: '不用说话也能坐一会儿', note: '椅子在这里。坐吧。', icon: 'moon' }
};
stories.forEach((story, i) => { if (i > 0) memoryDefinitions[`stage-${i + 1}`] = { title: story.title, note: story.quote, icon: story.icon, stage: i + 1 }; });
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
export function followup(state, level, today) {
  const last = state.journey.lastChat;
  if (!last || level < 2 || state.journey.followupDay === today) return null;
  const d = new Date(last.at), previousDay = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  if (previousDay === today) return null;
  const close = level >= 4;
  const lines = {
    'day:good': close ? '上次那件开心的事，后来怎么样了？我只是顺便问问。' : '上次你说有件开心的事。后来还顺利吗？',
    'day:tired': close ? '上次说累，今天缓过来了吗？椅子还给你留着。' : '上次你说有点累。今天好一点了吗？',
    stars: close ? '那局星星还欠着呢。今天有空的话，再来一次？' : '我们上次聊过接星星。今天有空一起玩吗？',
    quiet: close ? '窗边那把椅子还在。今天要坐就坐，不用问。' : '窗边的光又照进来了。今天也可以坐一会儿。'
  };
  return lines[`${last.topic}:${last.choice}`] || lines[last.topic];
}
