// Distance softens gradually; physical affection only appears after it is unlocked.
export const stages = [
  { heading: '你好，先认识一下', caption: '第一次见面，从一句你好开始。', opening: '你好。请问有什么事吗？', note: '我们还不认识。先打个招呼就好。', next: 'Lv. 2：可以聊天、一起接星星。' },
  { heading: '好像，又见面了', caption: '聊一点日常，慢慢记住彼此。', opening: '又见面了。今天也路过这里吗？', note: '见过几次了。聊一会儿也可以。', next: 'Lv. 3：可以喂食、陪伴睡觉，也可以送小礼物。' },
  { heading: '今天，也可以坐坐', caption: '已经不陌生了，一些小心意可以收下。', opening: '是你啊。进来坐会儿吧。', note: '点心可以留下。其他的，慢慢来。', next: 'Lv. 4：可以轻轻摸摸。' },
  { heading: '来了，就多待一会儿', caption: '熟悉之后，才有一点藏不住的偏心。', opening: '哼，来了就坐一会儿吧。', note: '熟一点了。下次来，就坐这边吧。', next: 'Lv. 5：可以帮忙洗香香。' },
  { heading: '这个位置，留给你', caption: '不急着说出口，也会记得你来过。', opening: '你来了啊。这边的位置还空着。', note: '靠近一点也没关系。这个位置留着呢。', next: '洗香香也开放了。水温要刚刚好。' }
];
export const greetLines = [
  ['你好。', '嗯，你好。今天有什么事吗？', '我们还不认识。先这样打个招呼就好。', '我叫啵啵。你好。'],
  ['又见面了。今天还顺利吗？', '可以坐这边。不用那么拘谨。', '聊一会儿也行，我刚好有空。'],
  ['今天来得挺准时。', '坐那么远做什么？又不是不认识。', '你可以慢慢说，我在听。'],
  ['今天居然有空来看我？坐吧。', '又站在门口。那把椅子是摆着好看的吗？', '过来一点。声音那么小，谁听得见。'],
  ['我刚好多留了一个位置。你坐吧。', '今天过得怎么样？慢慢说。', '来了就别急着走，茶还没凉呢。']
];
export const petLines = ['只准摸一下……刚才那下不算。', '手别停呀。……我是说，头发还没理好。', '哼，手法还算过关。', '再摸一会儿也行，反正我现在不忙。', '靠近一点，够不着啦。'];
export function stageFor(level) { return stages[Math.min(4, Math.max(0, level - 1))]; }
export function greeting(level, name) {
  const lines = greetLines[Math.min(4, level - 1)];
  return lines[Math.floor(Math.random() * lines.length)].replace('我叫啵啵', `我叫${name}`);
}
