// What she says when you find her, by what she's doing. [still a stranger (Lv. 1–2), familiar (Lv. 3+)].
export const arrivalLines = {
  sleep: ['（她睡着了，呼吸很轻。）', '（她睡着了。被子踢开了一角。）'],
  wake: ['……早。头发还没梳，请先别看。', '……这么早？头发还没梳，先别盯着看。'],
  breakfast: ['在吃早饭。你吃过了吗？', '早饭还剩一片吐司。……给你留的，不吃算了。'],
  read: ['（她抬头看了你一眼，小声说）你好。这里要安静一点。', '嘘……坐这边。这一章快看完了。'],
  lunch: ['在吃午饭。……你也来买面包吗？', '这家的面包很好吃。要不要分你一半？'],
  nap: ['（她靠在椅子上睡着了。）', '（她在打盹，手里还捏着书签。）'],
  tea: ['在喝下午茶。你要坐的话，那边有椅子。', '茶刚泡好。……多泡了一杯，你要不要？'],
  dinner: ['在吃晚饭。今天过得怎么样？', '吃过了吗？锅里还有汤。'],
  walk: ['在散步。湖边的风很舒服。', '来得正好。陪我走一圈吧。'],
  evening: ['晚上好。今天也辛苦了。', '这么晚还来？……坐吧，灯给你留着。'],
  stars: ['……你也来看星星？', '你看那颗，最亮的那颗。……没什么，就是想让你看。']
};
export function arrivalLine(activity, level) {
  const lines = arrivalLines[activity] ?? arrivalLines.evening;
  return lines[level >= 3 ? 1 : 0];
}
// A quiet word while she's asleep on her own schedule.
export const sleepyLines = ['……嗯？……晚安。', '（她迷迷糊糊地翻了个身）……明天再说……', '……是你啊……（又睡着了）'];
export const phaseNames = { morning: '清晨', day: '白天', dusk: '傍晚', night: '夜晚' };
