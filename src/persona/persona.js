// Who she is, as data. Mechanics read from here instead of hard-coding taste into rules.
//
// Everything in this file is fictional and ships publicly with the site. When real-life
// notes are used as inspiration, rewrite them as fiction first: no verbatim private quotes,
// real names, schools, workplaces, addresses or anything else that identifies a person.
//
// status: 'placeholder' (built from what the game already says) → 'draft' → 'reviewed'.
export const persona = {
  status: 'placeholder',
  traits: [
    { id: 'slow-to-warm', label: '慢热', note: '刚认识时客气又有距离，熟了才会多说几句。' },
    { id: 'soft-tsundere', label: '嘴硬心软', note: '关心从不直说，常用「顺便」「勉强」带过。' },
    { id: 'window-seat', label: '爱坐窗边', note: '下午总在窗边那把椅子上。' }
  ],
  // weight: 1 有点喜欢/不喜欢 · 2 喜欢/讨厌 · 3 特别喜欢/最受不了
  // tags: what in-game things count as this preference (foods, gifts, places later on).
  likes: [
    { id: 'strawberry', category: 'food', label: '草莓点心', weight: 3, tags: ['strawberry', 'cake'], hint: '喂点心时，她会挑草莓那块。' },
    { id: 'warm-tea', category: 'drink', label: '温热的茶', weight: 2, tags: ['tea'], hint: '「茶还没凉呢」是她留人的说法。' },
    { id: 'afternoon-light', category: 'weather', label: '下午的阳光', weight: 2, tags: ['sunny', 'afternoon'], hint: '聊起窗外的光，她会多说一句。' },
    { id: 'flowers', category: 'object', label: '小束鲜花', weight: 2, tags: ['flower'], hint: '送的花会被摆到窗边。' },
    { id: 'catching-stars', category: 'activity', label: '接星星', weight: 1, tags: ['star-game'], hint: '嘴上说不让着你，其实每局都等你来。' },
    { id: 'quiet-company', category: 'activity', label: '安静地待着', weight: 2, tags: ['quiet'], hint: '不说话一起坐着，她也觉得很好。' }
  ],
  dislikes: [
    { id: 'sudden-touch', category: 'boundary', label: '还不熟就被碰', weight: 3, tags: ['pet-early'], hint: '没熟之前，请先别碰她。' },
    { id: 'bubbles-in-eyes', category: 'care', label: '泡泡进眼睛', weight: 2, tags: ['wash'], hint: '洗香香时她会先提醒这个。' },
    { id: 'hot-water', category: 'care', label: '太烫的水', weight: 1, tags: ['wash'], hint: '水温要刚刚好。' },
    { id: 'noisy', category: 'environment', label: '吵吵闹闹', weight: 1, tags: ['noise'], hint: '她更喜欢小声说话。' }
  ],
  opinions: [
    { id: 'take-it-slow', topic: '相处', stance: '慢慢来，比一下子很热络好。', line: '不着急。来的次数多了，自然就熟了。' },
    { id: 'winning', topic: '输赢', stance: '嘴上爱比，其实更在意有人一起玩。', line: '输了也别急着走，再来一次就是了。' },
    { id: 'rest', topic: '累的时候', stance: '累了就歇，不用逞强。', line: '今天不用逞强。坐一会儿再说。' }
  ],
  speech: {
    catchphrases: ['哼', '也行', '勉强合格', '我只是顺便问问'],
    fillers: ['嗯', '……'],
    // How she hides caring: say the opposite, then soften it.
    deflections: ['刚才那下不算。', '我是说，头发还没理好。', '又不是不认识。']
  },
  // Each block lasts until the next one starts; the last block wraps past midnight.
  routine: [
    { from: '07:30', activity: 'wake', place: 'room', label: '刚起床，头发还有点乱' },
    { from: '08:30', activity: 'breakfast', place: 'room', label: '慢慢吃早饭' },
    { from: '10:00', activity: 'read', place: 'room', label: '在窗边看书' },
    { from: '12:00', activity: 'lunch', place: 'room', label: '吃午饭' },
    { from: '13:30', activity: 'nap', place: 'room', label: '午后打个盹' },
    { from: '15:00', activity: 'tea', place: 'room', label: '下午茶时间' },
    { from: '18:00', activity: 'dinner', place: 'room', label: '吃晚饭' },
    { from: '20:00', activity: 'evening', place: 'room', label: '窝着发呆' },
    { from: '23:00', activity: 'sleep', place: 'room', label: '睡着了' }
  ]
};
