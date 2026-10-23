import {escapeHtml as esc, type AppData} from './domain';
import {lessons} from './curriculum';
import {ri,art} from './visuals';
import {neighbors} from './neighbors';

export const homeIntents = [
  {id:'after',label:'После игры',icon:'Sprout',title:'Немного пространства между делами',text:'Без задания на результат. Ри предлагает короткую паузу — а ты выбираешь, чем её наполнить.',action:'break-modal',button:'Выбрать паузу',lesson:'l7'},
  {id:'duty',label:'Давит «надо»',icon:'Coffee',title:'Чего ты сам хочешь от игры?',text:'Дейлики, команда, рейтинг. Можно разобрать одну ситуацию и отделить свою цель от чужих ожиданий.',action:'situation',button:'Разобрать ситуацию',lesson:'l2'},
  {id:'fomo',label:'Боюсь пропустить',icon:'CloudSun',title:'Событие закончится. Выбор остаётся.',text:'Разберём, что известно о событии, что только кажется обязательным и какой план подходит тебе.',action:'situation',button:'Посмотреть варианты',lesson:'l4'},
  {id:'free',label:'Просто отдых',icon:'Armchair',title:'Можно сделать короткую паузу',text:'Вода, окно или несколько шагов — выбери, что подходит сейчас. Игровые пространства временно на переработке.',action:'break-modal',button:'Выбрать паузу',lesson:'l8'},
] as const;
export type HomeIntent=typeof homeIntents[number]['id'];

export function home(data:AppData,icon:(name:string)=>string,intent:HomeIntent='after'):string {
  const chosen=homeIntents.find(item=>item.id===intent)??homeIntents[0];
  const lesson=lessons.find(item=>item.id===chosen.lesson)!;
  const unfinished=data.space?.lessons.find(item=>!item.completed&&item.step>0);
  const continued=unfinished?lessons.find(item=>item.id===unfinished.id):undefined;
  return `<section class="home-title"><h1>После игры есть куда прийти</h1><p>Зайди на минуту, выбери свой ритм и останься ровно настолько, насколько хочется.</p></section>
    <div class="intent-switch" role="group" aria-label="С чего начать">${homeIntents.map(item=>`<button data-action="home-intent" data-id="${item.id}" aria-pressed="${chosen.id===item.id}">${icon(item.icon)}${item.label}</button>`).join('')}</div>
    <div class="home-stage-grid">
      <section class="balcony-scene" aria-labelledby="home-scene-title" data-intent="${chosen.id}"><img src="/art/ri-balcony-v3.png" alt="" width="1774" height="887" fetchpriority="high"/><div class="balcony-copy"><h2 id="home-scene-title">${chosen.title}</h2><p>${chosen.text}</p><button class="btn" data-action="${chosen.action}" data-id="${chosen.id}">${chosen.button}${icon('ArrowRight')}</button><button class="text-button" data-action="checkin">${icon('Pencil')}Записать пару слов</button></div></section>
      <aside class="station-invitation"><h2>Тихая станция</h2><img class="station-thumbnail" src="/art/station.png" alt="Иллюстрация тихой станции Респейса" width="1536" height="1024"/><p>Игровые пространства временно на переработке. Сохранённые результаты останутся в твоих данных.</p><a href="#play" data-nav="play" class="btn secondary">Подробнее о переработке${icon('ArrowRight')}</a></aside>
    </div>
    <section class="today-picks" aria-labelledby="today-picks-title"><h2 id="today-picks-title">На сегодня можно выбрать</h2>
      <article class="pick-row"><div class="pick-art">${art('course')}</div><div><h3>${continued?'Продолжить начатую тему':'Разобраться в одной ситуации'}</h3><p>${esc(continued?.title??lesson.title)}</p><span>Короткая история, выбор и объяснение. 2–4 минуты.</span></div><button class="btn secondary" data-space="lesson" data-id="${continued?.id??lesson.id}">${continued?'Продолжить':'Открыть тему'}${icon('ArrowRight')}</button></article>
      <article class="pick-row"><div class="pick-art">${art('science')}</div><div><h3>Заглянуть в музей</h3><p>Одних часов игры мало для вывода</p><span>Исследование и границы его результатов.</span></div><button class="btn secondary" data-space="fact" data-id="fact6">Почитать${icon('ArrowRight')}</button></article>
      <article class="pick-row"><div class="pick-art">${art('room')}</div><div><h3>Оставить след</h3><p>Мой ориентир и заметки</p><span>То, к чему хочется вернуться.</span></div><a href="#path" data-nav="path" class="btn secondary">Открыть Моё${icon('ArrowRight')}</a></article>
    </section>${neighbors()}<div class="home-goodbye">${ri('rest',true)}<p>На сегодня можно закончить здесь.</p><a href="#about" data-nav="about" class="text-button">О Респейсе</a></div>`;
}
