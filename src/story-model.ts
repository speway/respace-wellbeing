export interface StoryState {stage:number; choices:number[];}
export interface StoryView {
  location:string;
  title:string;
  text:string;
  options:string[];
  route?:{title:string;detail:string;mark:'cup'|'gear'|'book'};
  guest?:{name:string;text:string;kind:'robot'|'cup'|'mechanic'};
  ending?:{title:string;detail:string;place:'shelf'|'table'|'cabin'};
}
const routes:NonNullable<StoryView['route']>[]=[
  {title:'Спросить в чайном киоске',mark:'cup',detail:'На коробке нарисована чашка. Продавец киоска ставит такую метку на свои посылки.'},
  {title:'Зайти в мастерскую',mark:'gear',detail:'На коробке бирка с шестерёнкой. Кажется, её оставил механик.'},
  {title:'Проверить список жителей',mark:'book',detail:'В коробке лежит карточка с адресом библиотеки. Получатель любит чай и книги.'},
];
const routeReplies=[
  'Продавец киоска: «Механик опять ждёт чай и спорит с кофемашиной». Он показывает дорогу к библиотеке.',
  'Механик поправляет бирку: «Чай жду я. А посылка для библиотекаря — у него стол свободнее».',
  'В списке жителей есть общая библиотека. Продавец киоска кивает в сторону станции.',
];
const guests:NonNullable<StoryView['guest']>[]=[
  {name:'Бип с книгой',kind:'robot',text:'Бип прячет книгу за спиной: «Да, это я унёс её вместе с почтой. Хорошо, что ты заглянул».'},
  {name:'Ри накрывает на стол',kind:'cup',text:'Ри ставит на стол две кружки: «Одна тебе, если захочешь остаться».'},
  {name:'Механик с кофемашиной',kind:'mechanic',text:'Механик заглядывает в кофемашину: «Кофе кончился. Хорошо, что чайник работает».'},
];
const endings:NonNullable<StoryView['ending']>[]=[
  {title:'Оставить кружки в библиотеке',place:'shelf',detail:'Ты устраиваешь на полке чайный уголок. Рядом появляется записка: «Чай здесь». Посылка нашла место.'},
  {title:'Задержаться за чаем',place:'table',detail:'Ты с библиотекарем выпиваешь по чашке за общим столом. Потом каждый возвращается к своим делам. «Хорошо посидели», — говорит он.'},
  {title:'Взять кружку с собой',place:'cabin',detail:'Остальные кружки остаются в библиотеке, а одну ты ставишь у окна своей каюты. Теперь чай будет рядом.'},
];
const choices=[
  ['Спросить в киоске','Зайти в мастерскую','Проверить список жителей'],
  ['Дождаться робота','Разложить кружки','Позвать механика'],
  ['Оставить чайный уголок','Выпить по чашке и продолжить день','Забрать запасную кружку в каюту'],
];

function validChoice(choice:unknown):choice is number {
  return typeof choice==='number'&&Number.isInteger(choice)&&choice>=0&&choice<=2;
}
function validateState(state:StoryState):void {
  if(!state||!Number.isInteger(state.stage)||state.stage<0||state.stage>3||
    !Array.isArray(state.choices)||state.choices.length!==state.stage){
    throw new Error('Некорректный этап истории.');
  }
  for(const choice of state.choices){
    if(!validChoice(choice))throw new Error('Некорректный выбор в истории.');
  }
}

// Everything in the scene is derived from the existing save; no new inventory or migration.
export function getStoryView(state:StoryState={stage:0,choices:[]}):StoryView {
  validateState(state);
  if(state.stage===0){
    return {location:'Причал тихой орбиты',title:'Посылка на тихую орбиту',
      text:'Ты доставляешь посылку на небольшую станцию. На коробке написано: «Тому, кто сегодня ждёт чай». Адрес размыло, внутри звенят кружки. С чего начнёшь?',
      options:[...choices[0]]};
  }
  const route={...routes[state.choices[0]]};
  if(state.stage===1){
    return {location:'Библиотека станции',title:'Куда поставить посылку?',route,
      text:`${routeReplies[state.choices[0]]} ${route.detail} Библиотекарь оглядывает пустую полку: «Бип снова унёс книгу». Куда отправимся теперь?`,
      options:[...choices[1]]};
  }
  const guest={...guests[state.choices[1]]};
  if(state.stage===2){
    return {location:'Чайный стол в библиотеке',title:'Где оставить кружки?',route,guest,
      text:`${guest.text} ${route.detail} Кружки уже на столе. Выбери, где они пригодятся.`,
      options:[...choices[2]]};
  }
  const selected=endings[state.choices[2]];
  const detail=`${selected.detail} ${route.detail} ${guest.text}`;
  return {location:{shelf:'Чайная полка библиотеки',table:'Общий стол библиотеки',cabin:'Окно твоей каюты'}[selected.place],
    title:selected.title,text:detail,options:[],route,guest,ending:{...selected,detail}};
}

export function advanceStory(state:StoryState,choice:number):StoryState {
  validateState(state);
  if(!validChoice(choice))throw new Error('Выбери один из трёх вариантов.');
  if(state.stage===3)throw new Error('История уже завершена. Можно начать другой маршрут.');
  return {stage:state.stage+1,choices:[...state.choices,choice]};
}

export function rewindStory(state:StoryState):StoryState {
  validateState(state);
  return state.stage===0?state:{stage:state.stage-1,choices:state.choices.slice(0,-1)};
}
