import {escapeHtml as esc,type AppData} from './domain';
import {initialExperience} from './experience-model';
import {lessons,zones} from './curriculum';
import {facts,type Fact} from './facts';
import {ri,art} from './visuals';
type Icon=(name:string)=>string;

export function courseZone():number|null {
  const raw=new URLSearchParams(location.search).get('topic');
  return raw!==null&&/^[0-3]$/.test(raw)?Number(raw):null;
}
export function renderCourse(data:AppData,I:Icon):string {
  const progress=data.space?.lessons??[];
  const done=lessons.filter(l=>progress.some(p=>p.id===l.id&&p.completed));
  const started=lessons.find(l=>progress.some(p=>p.id===l.id&&!p.completed&&p.step>0));
  const next=started??lessons.find(l=>!done.some(p=>p.id===l.id))??lessons[0];
  const selected=courseZone();
  return `<div class="page-heading"><div><h1>Разобраться в своём опыте</h1><p>Одна ситуация за раз. Любую тему можно открыть или повторить.</p></div></div>
    <div class="learning-layout"><aside class="learning-guide"><div class="guide-character">${ri('read')}</div><h2>${started?'Продолжим эту историю?':'С чего хочется начать?'}</h2><p>${esc(next.title)}</p><button class="btn" data-space="lesson" data-id="${next.id}">${started?'Продолжить':'Открыть тему'} ${I('ArrowRight')}</button><div class="guide-history"><strong>${done.length} из ${lessons.length}</strong><span>тем просмотрено</span><div class="guide-dots" aria-hidden="true">${lessons.map(l=>`<span class="${done.some(p=>p.id===l.id)?'done':''}"></span>`).join('')}</div></div><p class="guide-note">Темы открыты сразу. Отметки остаются, даже если долго сюда не заходить.</p><a href="#today" data-nav="today" class="text-button">Сделать короткую паузу ${I('ArrowRight')}</a></aside>
    <section class="topic-browser" aria-labelledby="topic-browser-title"><h2 id="topic-browser-title">Что хочется понять?</h2><div class="topic-filters" role="group" aria-label="Направления тем"><button data-space="course-filter" data-value="all" aria-pressed="${selected===null}">Все темы</button>${zones.map((z,i)=>`<button data-space="course-filter" data-value="${i}" aria-pressed="${selected===i}">${z.title}</button>`).join('')}</div><div class="topic-groups">${zones.filter((_,i)=>selected===null||i===selected).map(z=>{const index=zones.indexOf(z);return `<section class="topic-group ${z.color}"><div class="topic-group-title"><span class="icon-circle ${z.color}">${I(z.icon)}</span><div><h3>${z.title}</h3><p>${z.subtitle}</p></div></div>${lessons.filter(l=>l.zone===index).map(l=>{const saved=progress.find(p=>p.id===l.id);return `<button class="topic-row" data-space="lesson" data-id="${l.id}"><span class="topic-index ${saved?.completed?'done':''}">${saved?.completed?I('Check'):String(l.number).padStart(2,'0')}</span><span><strong>${esc(l.title)}</strong><small>${saved?.completed?'Просмотрено · можно повторить':saved?.step?'Есть начатая история':l.subtitle}</small></span>${I('ArrowRight')}</button>`;}).join('')}</section>`;}).join('')}</div></section></div>
    <section class="route-visual"><div class="route-orbit-tools"><button class="text-button" data-space="route-orbit-open" aria-expanded="false" aria-controls="route-orbit-panel">${I('Compass')} Посмотреть маршрут в объёме</button></div><section class="route-orbit-panel" id="route-orbit-panel" hidden aria-label="Объёмный маршрут тем"><div class="three-scene-controls"><button class="btn secondary" data-space="three-view-turn" data-value="-1" aria-label="Повернуть маршрут влево">↶</button><button class="btn secondary" data-space="three-view-turn" data-value="1" aria-label="Повернуть маршрут вправо">↷</button><button class="text-button" data-space="route-orbit-close">Вернуться к темам</button></div><div class="three-scene-stage route-three-stage" id="route-three-stage" role="img" aria-label="Объёмная карта тем Респейса"></div><p id="route-three-status" class="three-scene-status" role="status" aria-live="polite"></p></section></section>`;
}

export function renderPlay(_data:AppData,I:Icon):string {
  const spaces=[
    {title:'Комната Ри',scene:'room' as const,text:'Вещи, окно и свой ритм.'},
    {title:'Небо Нори',scene:'science' as const,text:'Соединять точки и не спешить.'},
    {title:'Почта Бипа',scene:'course' as const,text:'Разложить письма по местам.'},
    {title:'История',scene:'story' as const,text:'Выбрать, что оставить себе.'},
  ];
  return `<section class="game-pause panel" aria-labelledby="game-pause-title"><div class="game-pause-intro"><div class="game-pause-art">${ri('think')}</div><div class="game-pause-copy"><span class="eyebrow">Тихая станция · пока тише</span><h1 id="game-pause-title">Игровые пространства собираются заново</h1><p>Комната, небо, почта, история и музей сейчас закрыты на переработку. Мы возвращаем их по одному, с понятным действием, добровольным выходом и вниманием к доступности.</p><p class="muted">Сохранённые данные остаются в гостевом профиле, резервной копии и выбранной синхронизации. Новые версии появятся после отдельной проверки.</p><div class="action-row"><a href="#today" data-nav="today" class="btn">На главную ${I('ArrowRight')}</a><a href="#learn" data-nav="learn" class="btn secondary">Открыть темы ${I('Compass')}</a><a href="#science" data-nav="science" class="btn secondary">Почитать исследования ${I('Telescope')}</a></div></div></div><section class="play-archive" aria-labelledby="play-archive-title"><div class="section-title"><div><span class="eyebrow">Сохранённые маршруты</span><h2 id="play-archive-title">Знакомые места останутся здесь</h2></div><span class="tiny-label">Данные не трогаем</span></div><p class="play-archive-note">Можно вернуться к темам и исследованиям уже сейчас. Игровые пространства откроются только после проверки новых сценариев.</p><div class="play-archive-grid">${spaces.map(s=>`<article class="play-archive-item"><div class="play-archive-thumb">${art(s.scene)}</div><div><span class="play-archive-status">На переработке</span><h3>${s.title}</h3><p>${s.text}</p></div></article>`).join('')}</div></section></section>`;
}

export function renderScience(visible:Fact[],favorites:string[],filter:string,onlyFavorites:boolean,I:Icon):string {
  const featured=visible.find(f=>f.id==='fact6')??visible[0];
  const rest=visible.filter(f=>f.id!==featured?.id);
  const bookmark=(f:Fact)=>`<button class="icon-button" data-space="fact-favorite" data-id="${f.id}" aria-label="${favorites.includes(f.id)?'Убрать из сохранённых':'Сохранить'}: ${esc(f.title)}" aria-pressed="${favorites.includes(f.id)}">${I(favorites.includes(f.id)?'BookmarkCheck':'Bookmark')}</button>`;
  return `<div class="page-heading"><div><h1>Исследования и основания</h1><p>Проверяемые данные о мотивации, досуге и восприятии игр.</p></div></div>
  <section class="panel research-framework" aria-labelledby="framework-title">
    <div class="section-title">
      <div>
        <span class="eyebrow">Исследовательский прототип ВКР</span>
        <h2 id="framework-title">Четыре слоя проекта: научная позиция и границы</h2>
      </div>
    </div>
    <p class="research-lead">Респейс разрабатывается как дипломное исследование мотивации и переживаний в досуговой видеоигровой активности взрослых (18+). Чтобы не подменять факты метафорами, мы строго разделяем четыре слоя:</p>
    <div class="research-layers-grid">
      <article class="research-layer-card layer-clinical">
        <div>
          <span class="research-layer-badge">1. Клинический слой</span>
          <h3>Диагностические границы</h3>
          <p>МКБ-11 описывает игровое расстройство как стойкую утрату контроля и выраженную дезадаптацию (от 12 месяцев).</p>
        </div>
        <div class="layer-limit">Респейс не лечит, не ставит диагнозы и не заменяет психотерапевта.</div>
      </article>
      <article class="research-layer-card layer-empirical">
        <div>
          <span class="research-layer-badge">2. Эмпирический слой</span>
          <h3>Рецензируемые данные</h3>
          <p>Исследования мотивации (SDT) и переживаний (ДПД): автономия и качество вовлечённости важнее числа часов.</p>
        </div>
        <div class="layer-limit">Подтверждают связи в выборках, но не доказывают эффект сторонних приложений.</div>
      </article>
      <article class="research-layer-card layer-hypotheses">
        <div>
          <span class="research-layer-badge">3. Проектные гипотезы</span>
          <h3>Решения автора Респейса</h3>
          <p>Разделение шкал «усилие» и «усталость», мягкий выход (soft-exit), отказ от тайм-лимитов и streak-серий.</p>
        </div>
        <div class="layer-limit">Проектные гипотезы для проверки в ВКР; эффективность самого продукта ещё не исследовалась.</div>
      </article>
      <article class="research-layer-card layer-metaphor">
        <div>
          <span class="research-layer-badge">4. Бытовые метафоры</span>
          <h3>Образы спокойного досуга</h3>
          <p>Метафоры «тихой станции», «комнаты Ри» и «чая» создают бережный дидактический контекст.</p>
        </div>
        <div class="layer-limit">Иллюстративный язык перерыва, а не физиологическое воздействие или методика.</div>
      </article>
    </div>
    <a href="#about" data-nav="about" class="research-more-link">Подробнее о методологии, выборках и ограничениях в «О проекте» ${I('ArrowRight')}</a>
  </section>
  <div class="science-toolbar" role="group" aria-label="Темы научпопа">${['Все','Память','Внимание','Выбор','Эмоции','Видеоигры'].map(t=>`<button class="chip ${filter===t?'active':''}" data-space="fact-filter" data-value="${t}" aria-pressed="${filter===t}">${t}</button>`).join('')}<button class="chip ${onlyFavorites?'active':''}" data-space="favorites" aria-pressed="${onlyFavorites}">${I('Bookmark')} Сохранённое</button></div>
    ${featured?`<div class="science-front"><article class="science-feature"><div class="science-feature-copy"><div class="reading-meta"><span>${featured.tag}</span>${bookmark(featured)}</div><h2>${esc(featured.title)}</h2><p>${esc(featured.text)}</p><button class="btn" data-space="fact" data-id="${featured.id}">Почитать об исследовании ${I('ArrowRight')}</button><span class="source-credit">${esc(featured.citation)}</span></div><div class="science-feature-art">${art('science')}</div></article><aside class="experiment-invitation">${ri('think')}<h2>Игровой музей на переработке</h2><p>Опыты вернутся только после проверки сценариев и доступности.</p><a href="#play" data-nav="play" class="btn secondary">Подробнее ${I('ArrowRight')}</a><small>Научные карточки и источники доступны здесь.</small></aside></div><section class="reading-list" aria-label="Ещё истории">${rest.map(f=>`<article class="reading-row"><span class="reading-symbol">${I(f.tag==='Память'?'BookOpen':f.tag==='Внимание'?'ScanEye':f.tag==='Видеоигры'?'Gamepad2':f.tag==='Выбор'?'Compass':'Heart')}</span><div><span class="reading-tag">${f.tag}</span><h2>${esc(f.title)}</h2><p>${esc(f.text)}</p><button class="text-button" data-space="fact" data-id="${f.id}">Почитать ${I('ArrowRight')}</button></div>${bookmark(f)}</article>`).join('')}</section>`:`<section class="collection-empty">${ri('read')}<h2>Здесь будут сохранённые истории</h2><p>Отметь закладкой карточку, к которой захочешь вернуться.</p><button class="btn secondary" data-space="favorites">Показать подборку</button></section>`}`;
}

export function renderSavedShelf(data:AppData,I:Icon):string {
  const s=data.space??initialExperience();
  return `<section class="saved-shelf game-archive" aria-labelledby="saved-shelf-title"><div class="section-title"><h2 id="saved-shelf-title">Сохранённые игровые пространства</h2></div><p>Комната, небо, история, музей и почта временно недоступны во время переработки. Их данные остаются в твоём профиле и входят в резервную копию, но не открываются и не изменяются.</p><dl class="game-archive-summary"><div><dt>Комната</dt><dd>${s.room.items.length} предметов сохранено</dd></div><div><dt>Небо</dt><dd>${s.stars.edges.length} линий сохранено</dd></div><div><dt>История</dt><dd>${s.story?.stage===3?'маршрут завершён':s.story?.stage?'маршрут начат':'ещё не начата'}</dd></div></dl></section>`;
}
