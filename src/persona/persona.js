// Who she is, as data. Mechanics read from here instead of hard-coding taste into rules.
//
// Everything in this file is fictional and ships publicly with the site. When real-life
// notes are used as inspiration, rewrite them as fiction first: no verbatim private quotes,
// real names, schools, workplaces, addresses or anything else that identifies a person.
//
// status: 'placeholder' (built from what the game already says) → 'draft' → 'reviewed'.
//
// Every like, dislike, opinion and phrase can be discovered by the player. `found` says how:
//   { on: 'feed' }                         after that action succeeds
//   { on: 'greet', topic, choice }         after a chat answer (choice optional)
//   { on: 'greet', activity: 'tea' }       while she is doing that activity
//   { on: 'stage', stage: 4 }              when the relationship reaches that stage
//   { on: 'pet', patience: 'over' }        only when that action went past her patience
//   minLevel                               optional, on any of the above
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
    { id: 'strawberry', category: 'food', label: '草莓点心', weight: 3, tags: ['strawberry', 'cake'], icon: 'cake', quote: '这块给我的？嗯……草莓挑得还不错。', note: '盘子里有草莓的，她总是先挑那一块，然后假装是随手拿的。', hint: '送点心时，留意她先挑哪一块。', found: { on: 'feed' } },
    { id: 'warm-tea', category: 'drink', label: '温热的茶', weight: 2, tags: ['tea'], icon: 'cup', quote: '来了就别急着走，茶还没凉呢。', note: '茶是她留人的说法。茶还热着，就是想让你多坐会儿。', hint: '下午茶时间去找她说说话。', found: { on: 'greet', activity: 'tea', minLevel: 2 } },
    { id: 'afternoon-light', category: 'weather', label: '下午的阳光', weight: 2, tags: ['sunny', 'afternoon'], icon: 'sun', quote: '这个时候，窗台会照到一小块太阳。', note: '下午窗台会照到一小块太阳，她习惯坐在那里。', hint: '安静坐着的时候，聊聊窗外。', found: { on: 'greet', topic: 'quiet', choice: 'window' } },
    { id: 'flowers', category: 'object', label: '小束鲜花', weight: 2, tags: ['flower'], icon: 'flower', quote: '谢谢。我找个花瓶，把它放好。', note: '送的花会被摆到窗边，过几天还会换一次水。', hint: '带一份小礼物给她。', found: { on: 'gift' } },
    { id: 'catching-stars', category: 'activity', label: '接星星', weight: 1, tags: ['star-game'], icon: 'star', quote: '还不错，下次我可不会让着你。', note: '嘴上说不让着你，其实每局都等你来。', hint: '一起玩的时候，她嘴上说不让着你……', found: { on: 'play' } },
    { id: 'quiet-company', category: 'activity', label: '安静地待着', weight: 2, tags: ['quiet'], icon: 'moon', quote: '那就多坐一会儿。我刚好也不想说话。', note: '不说话一起坐着，她也觉得很好。', hint: '选「安静坐一会儿」，看看她的反应。', found: { on: 'greet', topic: 'quiet', choice: 'stay' } }
  ],
  dislikes: [
    { id: 'sudden-touch', category: 'boundary', label: '还不熟就被碰', weight: 3, tags: ['pet-early'], icon: 'hand', quote: '我们还没那么熟。请先别碰我。', note: '慢热的人需要时间。熟了以后，她会自己靠近一点。', hint: '等你们熟到可以理头发的时候，就明白了。', found: { on: 'stage', stage: 4 } },
    { id: 'bubbles-in-eyes', category: 'care', label: '泡泡进眼睛', weight: 2, tags: ['wash'], icon: 'drop', quote: '泡泡别弄进眼睛。', note: '洗香香时，这是她第一句要叮嘱的。', hint: '帮她洗香香之前，她会先提醒一件事。', found: { on: 'wash' } },
    { id: 'hot-water', category: 'care', label: '太烫的水', weight: 1, tags: ['wash'], icon: 'drop', quote: '水温倒是刚刚好。……下次也照这个水温。', note: '水温要刚刚好，烫一点点她都会皱眉。', hint: '水温要刚刚好。', found: { on: 'wash' } },
    { id: 'too-much-touch', category: 'boundary', label: '没完没了地摸头', weight: 2, tags: ['pet-too-much'], icon: 'hand', quote: '够了！头发都乱了……再摸我真的生气了。', note: '喜欢被摸头，但一直摸就会烦。适可而止，她才会想要下一次。', hint: '摸摸头是好事，可是……一直摸呢？', found: { on: 'pet', patience: 'over' } },
    { id: 'noisy', category: 'environment', label: '吵吵闹闹', weight: 1, tags: ['noise'], icon: 'noise', quote: '嘘……这里要小声一点。', note: '她说话总是小小声的，在书店里更是。', hint: '去书店找她的时候，说话要轻。', found: { on: 'greet', activity: 'read' } }
  ],
  opinions: [
    { id: 'take-it-slow', topic: '相处', label: '慢慢来比较好', icon: 'speech', stance: '慢慢来，比一下子很热络好。', quote: '不着急。来的次数多了，自然就熟了。', note: '比起一下子很热络，她更相信一点点熟起来。', hint: '多来几次，她自己会说。', found: { on: 'stage', stage: 2 } },
    { id: 'winning', topic: '输赢', label: '一起玩比输赢重要', icon: 'speech', stance: '嘴上爱比，其实更在意有人一起玩。', quote: '输了也别急着走，再来一次就是了。', note: '她嘴上爱比，其实更在意有没有人陪她玩。', hint: '和她聊聊接星星。', found: { on: 'greet', topic: 'stars' } },
    { id: 'rest', topic: '累的时候', label: '累了就歇', icon: 'speech', stance: '累了就歇，不用逞强。', quote: '今天不用逞强。坐一会儿再说。', note: '她不会说「辛苦了」，但会把椅子挪给你。', hint: '跟她说你今天有点累。', found: { on: 'greet', topic: 'day', choice: 'tired' } }
  ],
  phrases: [
    { id: 'phrase-passable', label: '「勉强合格」', icon: 'speech', quote: '这花嘛，勉强合格。', note: '她最高的夸奖。说这句的时候，嘴角其实是翘着的。', hint: '熟悉以后再送她一次礼物。', found: { on: 'gift', minLevel: 4 } },
    { id: 'phrase-hmph', label: '「哼」', icon: 'speech', quote: '哼，来了就坐一会儿吧。', note: '熟了以后，她开口前常带这一个字。其实是不好意思。', hint: '熟悉以后，她开口前常带一个字。', found: { on: 'stage', stage: 4 } },
    { id: 'phrase-fine', label: '「也行」', icon: 'speech', quote: '再摸一会儿也行，反正我现在不忙。', note: '「也行」就是「好」，只是她不肯直说。', hint: '摸摸头的时候，听听她怎么说。', found: { on: 'pet' } }
  ],
  speech: {
    fillers: ['嗯', '……'],
    // How she hides caring: say the opposite, then soften it.
    deflections: ['刚才那下不算。', '我是说，头发还没理好。', '又不是不认识。']
  },
  // Each block lasts until the next one starts; the last block wraps past midnight.
  // `place` is a town place id. When that place is still locked for the player, she uses `alt`
  // (or stays home with the same activity), so strangers can always find her.
  // `asleep` blocks keep her in bed: only quiet greetings reach her.
  // `did` is how the block reads in「你不在的时候」.
  routine: [
    { from: '01:00', activity: 'sleep', place: 'home', label: '睡着了', did: '睡了一觉', asleep: true },
    { from: '07:30', activity: 'wake', place: 'home', label: '刚起床，头发还有点乱', did: '起床梳了头' },
    { from: '08:30', activity: 'breakfast', place: 'home', label: '慢慢吃早饭', did: '吃了早饭' },
    { from: '10:00', activity: 'read', place: 'books', label: '在书店窗边看书', did: '去书店看了书', alt: { activity: 'read', place: 'home', label: '在窗边看书', did: '在窗边看了书' } },
    { from: '12:00', activity: 'lunch', place: 'bakery', label: '在面包坊吃午饭', did: '在面包坊吃了午饭' },
    { from: '13:30', activity: 'nap', place: 'home', label: '午后打个盹', did: '睡了个午觉', asleep: true },
    { from: '15:00', activity: 'tea', place: 'home', label: '下午茶时间', did: '喝了下午茶' },
    { from: '18:00', activity: 'dinner', place: 'home', label: '吃晚饭', did: '吃了晚饭' },
    { from: '19:30', activity: 'walk', place: 'park', label: '在湖边散步', did: '去湖边散了步', alt: { activity: 'evening', place: 'home', label: '在窗边看夜景', did: '看了会儿夜景' } },
    { from: '21:00', activity: 'stars', place: 'hill', label: '在观星台看星星', did: '去观星台看了星星', alt: { activity: 'evening', place: 'home', label: '窝着发呆', did: '窝着发了会儿呆' } }
  ]
};
