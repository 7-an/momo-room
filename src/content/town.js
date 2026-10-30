// The little town. Places open with the relationship, like the actions do.
// `actions`: what you can do with her here. Napping and baths only happen at home.
// `x`, `y`: position on the town map in percent of its width and height; `walls`, `roof`: its little house.
export const TOWN_NAME = '糖霜小镇';
export const places = [
  { id: 'home', walls: '#FBE9CF', roof: '#E88B6B', name: '她的家', short: '家', sub: '小镇东街 · 3 号', level: 1, x: 12, y: 58, actions: ['greet', 'play', 'feed', 'gift', 'sleep', 'pet', 'wash'], desc: '窗台上总摆着花。早上、下午茶和夜里，她多半在家。' },
  { id: 'bakery', walls: '#FFF1D6', roof: '#E7A86A', name: '转角面包坊', short: '面包坊', sub: '东街转角', level: 1, x: 28, y: 30, actions: ['greet', 'feed', 'gift', 'pet'], desc: '刚出炉的草莓蛋糕要早点来买。中午她常在靠窗的位置吃午饭。' },
  { id: 'books', walls: '#F3E6F7', roof: '#9C86C9', name: '星星书店', short: '书店', sub: '钟楼旁', level: 2, x: 50, y: 17, actions: ['greet', 'gift', 'pet'], desc: '靠窗那个位置是她的。上午她常来这里看书，说话要小声。' },
  { id: 'park', walls: '#E3F2DF', roof: '#7FB89A', name: '湖边公园', short: '公园', sub: '镇中心的小湖', level: 2, x: 38, y: 66, actions: ['greet', 'play', 'gift', 'pet'], desc: '晚上湖面能映出星星。天气好的傍晚，她会来散步。' },
  { id: 'flowers', walls: '#FFE6E0', roof: '#F08FA0', name: '小雏菊花店', short: '花店', sub: '河边', level: 3, x: 66, y: 48, actions: ['greet', 'gift', 'pet'], desc: '店主会悄悄告诉你，她最近多看了哪种花。' },
  { id: 'hill', walls: '#E3EEFA', roof: '#6C8FC7', name: '山坡观星台', short: '观星台', sub: '镇北的山坡', level: 5, x: 74, y: 9, actions: ['greet', 'pet'], desc: '要很熟很熟以后，她才愿意带你上去。夜里九点以后，她会在这里看星星。' }
];
export const placeById = id => places.find(place => place.id === id);
