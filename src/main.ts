import { createIcons, Bookmark, BookmarkCheck, Gamepad2, Telescope, Lightbulb, UserRound, Armchair, ArrowRight, ArrowUpRight, BookOpen, ChartNoAxesCombined, Check, Clock3, CloudSun, Coffee, Compass, Download, FlaskConical, Frown, Heart, HeartHandshake, House, Info, Leaf, Meh, MessagesSquare, NotebookPen, Pause, Pencil, Play, Plus, RotateCcw, Route, ScanEye, Settings2, ShieldCheck, Smartphone, Smile, Sparkles, Sprout, Table2, Trash2, Upload, X } from 'lucide';
import { Capacitor } from '@capacitor/core';
import './style.css';
import { STORAGE_KEY, initialData, validateData, escapeHtml as esc, dayKey, toggleHabit, filteredEntries, dailyAverages, csvExport, demoEntries, type AppData, type Entry, type Moment, type Context } from './domain';
import { practices, sources } from './content';
import { createAccount } from './account';
import { createSpace } from './space';
import { lessons } from './curriculum';
import { initialExperience } from './experience-model';
import {situations} from './home';
import {home,homeIntents,type HomeIntent} from './home-view';
import {renderSavedShelf} from './product-view';
import {disposeThreeView} from './three-scene-loader';
import {ri} from './visuals';
import '@fontsource/nunito/cyrillic-400.css';
import '@fontsource/nunito/cyrillic-700.css';
import '@fontsource/nunito/cyrillic-900.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-900.css';
import './design.css';
import './world.css';
import { initNative } from './native';
import { createMotion } from './motion';
import { createSound } from './sound';
import './motion.css';
import './product.css';
import './redesign.css';

type Page = 'today' | 'practices' | 'journal' | 'path' | 'settings' | 'about' | 'learn' | 'play' | 'science' | 'account';
const root = document.querySelector<HTMLDivElement>('#app')!;
const motion = createMotion();
const sound = createSound();
let renderedPage: Page | null = null;
let storageIssue = '';
let storageCorrupt = false;
const icons = { Bookmark, BookmarkCheck, Gamepad2, Telescope, Lightbulb, UserRound, Armchair, ArrowRight, ArrowUpRight, BookOpen, ChartNoAxesCombined, Check, Clock3, CloudSun, Coffee, Compass, Download, FlaskConical, Frown, Heart, HeartHandshake, House, Info, Leaf, Meh, MessagesSquare, NotebookPen, Pause, Pencil, Play, Plus, RotateCcw, Route, ScanEye, Settings2, ShieldCheck, Smartphone, Smile, Sparkles, Sprout, Table2, Trash2, Upload, X };
let storageKey=STORAGE_KEY;
try{const cached=JSON.parse(localStorage.getItem('respace-current-user')||'null');if(cached&&typeof cached.id==='string')storageKey=`${STORAGE_KEY}:${cached.id}`;}catch{}
let data = initialData();
try { const raw = localStorage.getItem(storageKey); if (raw) data = validateData(JSON.parse(raw)); }
catch { storageCorrupt = true; storageIssue = 'Не удалось прочитать сохранение. Исходный файл сохранён: скачай его в настройках перед восстановлением.'; }
const pages:Page[]=['today','learn','play','science','path','practices','journal','settings','about','account'];
let page: Page = pages.includes(location.hash.slice(1) as Page)?location.hash.slice(1) as Page:'today';
let demo = false;
let journalDays = 7;
let journalMoment: 'all' | Moment = 'all';
let journalContext: 'all' | Context = 'all';
let practiceFilter = 'all';
let lastFocused: HTMLElement | null = null;
let timer = { remaining: 300, end: 0, running: false, active: false };
let installPrompt: { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> } | null = null;
let toastTimeout: ReturnType<typeof setTimeout>;
const navItems: { id: Page; title: string; icon: string }[] = [
  { id: 'today', title: 'Сейчас', icon: 'House' },
  { id: 'learn', title: 'Разобраться', icon: 'Compass' },
  { id: 'play', title: 'Игры · пауза', icon: 'Gamepad2' },
  { id: 'science', title: 'Любопытно', icon: 'Telescope' },
  { id: 'path', title: 'Моё', icon: 'UserRound' }
];
const momentNames = { before: 'До занятия', after: 'После занятия', day: 'В течение дня' };
const contextNames = { gaming: 'Видеоигра', work: 'Работа или учёба', rest: 'Отдых' };
const icon = (name: string, cls = '') => `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}" aria-hidden="true" class="${cls}"></i>`;
function updateIcons() { createIcons({ icons, attrs: { 'stroke-width': 1.7 } }); }
function toast(message: string) {
  const el = document.querySelector<HTMLDivElement>('#toast')!;
  el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimeout);
  if (/^(Сохранено\.|Практика сохранена|Запись сохранена|Полка сохранена|Тема сохранена|Комната сохранена|Небо сохранено|Экспонат сохранён)/.test(message)) sound.play('saved');
  toastTimeout = setTimeout(() => el.classList.remove('visible'), 4500);
}
function commit(next: AppData, replaceCorrupt = false): boolean {
  if(storageCorrupt && !replaceCorrupt){toast('Скачай исходное сохранение в настройках, затем восстанови JSON или удали повреждённые данные.');return false;}
  try { const clean = validateData(next); localStorage.setItem(storageKey, JSON.stringify(clean)); data = clean; storageIssue = ''; storageCorrupt=false; account?.changed(); return true; }
  catch (e) { storageIssue = 'Сохранение не удалось. Скачай копию в настройках и проверь свободное место или доступ браузера к хранилищу.'; toast(e instanceof Error && e.message.includes('лимит') ? e.message : storageIssue); return false; }
}
function mutate(fn: (d: AppData) => void): boolean { const next = structuredClone(data); fn(next); return commit(next); }
function dateLabel(at: string, time = false) { return new Date(at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) }); }
function moodFace(n: number) { return n <= 3 ? 'Frown' : n <= 6 ? 'Meh' : 'Smile'; }
function render() {
  disposeThreeView();
  const pageChanged = renderedPage !== null && renderedPage !== page;
  renderedPage = page;
  root.innerHTML = `<a class="skip-link" href="#main">Перейти к содержимому</a>
  <header class="station-header" data-page="${page}"><a href="#today" class="brand" data-nav="today">${ri('calm',true)}<span>респейс</span></a><nav class="station-nav" aria-label="Основное меню">${navItems.map(n=>`<a href="#${n.id}" data-nav="${n.id}" class="${page===n.id?'selected':''}" ${page===n.id?'aria-current="page"':''}>${n.title}</a>`).join('')}</nav><a href="#account" class="private-label" data-nav="account">${icon('UserRound')}${account.isSigned()?'Мой кабинет':'Гость'}</a><a href="#settings" class="icon-button station-settings" data-nav="settings" aria-label="Настройки">${icon('Settings2')}</a></header>
  <div class="workspace ${page==='today'||page==='play'?'world-page':''}" data-page="${page}" data-signed="${account.isSigned()?'true':'false'}">
  <main id="main" tabindex="-1">${storageIssue ? `<div class="notice error" role="alert">${esc(storageIssue)} <a href="#settings" data-nav="settings">Открыть настройки</a></div>` : ''}${demo ? `<div class="notice">${icon('FlaskConical')} Пример на вымышленных данных. Твой дневник хранится отдельно.<button data-action="demo-off">Завершить</button></div>` : ''}${!data.accepted ? welcome() : ''}${page === 'today' ? today() : page === 'practices' ? practicePage() : page === 'journal' ? journalPage() : page === 'path' ? pathPage() : page === 'learn' ? space.coursePage() : page === 'play' ? space.playPage() : page === 'science' ? space.sciencePage() : page === 'account' ? accountPage() : page === 'settings' ? settingsPage() : aboutPage()}</main>
  <footer><span>Респейс · дипломный проект · 18+</span><div><a href="#about" data-nav="about">О проекте</a><a href="#settings" data-nav="settings">Настройки и данные</a></div></footer></div>
  <nav class="mobile-nav" aria-label="Мобильное меню">${navItems.map(n => `<a href="#${n.id}" data-nav="${n.id}" class="${page === n.id ? 'selected' : ''}" aria-label="${n.title}" ${page === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.id === 'today' ? 'Сейчас' : n.id === 'path' ? 'Моё' : n.title}</span></a>`).join('')}</nav>
  <dialog id="modal" aria-labelledby="modal-title"></dialog>`;
  updateIcons(); wirePage(); updateTimerView(); motion.rendered(root, pageChanged);
}
function welcome() { return `<section class="welcome notice"><div><strong>Можно начать без аккаунта · 18+</strong><details><summary>Как устроен Респейс и где хранятся данные</summary><p>Гостевое сохранение остаётся в этом браузере. Перенести прогресс в облачный аккаунт можно отдельно; личные записи синхронизируются только по твоему выбору. Респейс — дипломный проект с авторскими темами и играми. Он не ставит диагноз и не заменяет помощь специалиста.</p></details></div><button class="btn small secondary" data-action="accept">Продолжить ${icon('Check')}</button></section>`; }
function today() {const intent=new URLSearchParams(location.search).get('intent');return home(data,icon,homeIntents.some(item=>item.id===intent)?intent as HomeIntent:'after');}
function openSituations(){openModal(`<h2 id="modal-title">Что сейчас ближе?</h2><p class="muted">Выбери, с чего начать. Можно и просто поиграть.</p><div class="lesson-options">${situations.map(s=>`<button class="lesson-option" data-action="situation" data-id="${s.id}">${icon(s.icon)} ${s.label} ${icon('ArrowRight')}</button>`).join('')}</div><div class="route-alternatives"><button class="btn secondary" data-action="leisure">Просто поиграть</button><button class="text-button" data-action="close">Вернуться</button></div>`);}
function openSituation(id:string){const s=situations.find(x=>x.id===id);if(!s)return;openModal(`<h2 id="modal-title">${s.title}</h2><div class="route-intro">${ri(s.id==='rest'?'rest':'think')}<p>${s.text}</p></div><button class="btn" data-space="lesson" data-id="${s.lesson}">Открыть тему ${icon('ArrowRight')}</button><div class="route-alternatives"><button class="text-button" data-action="practice" data-id="${s.practice}">Попробовать короткую практику</button><button class="text-button" data-action="choose-step">Выбрать другую тему</button><button class="text-button" data-action="close">Закрыть</button></div>`);}
function habitList(edit = false) { return data.habits.length ? `<ul class="habit-list">${data.habits.map(h => `<li><button class="habit-toggle ${h.days.includes(dayKey()) ? 'done' : ''}" data-action="habit" data-id="${esc(h.id)}" aria-pressed="${h.days.includes(dayKey())}"><span class="checkbox">${h.days.includes(dayKey()) ? icon('Check') : ''}</span><span>${esc(h.title)}</span></button>${edit ? `<button class="icon-button" data-action="remove-habit" data-id="${esc(h.id)}" aria-label="Удалить привычку ${esc(h.title)}">${icon('Trash2')}</button>` : ''}</li>`).join('')}</ul>` : '<p class="empty-small">Добавь то, что помогает тебе в обычный день.</p>'; }
function timerCard() { return `<div class="timer-card"><div class="timer-display" aria-label="Оставшееся время">${formatTime(timer.remaining)}</div><span class="timer-description">${timer.active ? 'Перерыв для себя' : 'Перерыв на 5 минут'}</span><div class="timer-actions"><button class="btn small secondary" data-action="timer-toggle">${icon(timer.running ? 'Pause' : 'Play')}<span>${timer.running ? 'Приостановить' : timer.active ? 'Продолжить' : 'Начать перерыв'}</span></button><button class="icon-button" data-action="timer-reset" aria-label="Сбросить таймер">${icon('RotateCcw')}</button></div><small>Таймер работает, пока приложение открыто.</small></div>`; }
function formatTime(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function practicePage() {
  const list = practiceFilter === 'all' ? practices : practices.filter(p => practiceFilter === 'fomo' ? p.id === 'fomo' || p.id === 'choice' : practiceFilter === 'rest' ? p.id === 'ground' || p.id === 'rest' : p.id === 'boundary' || p.id === 'plan');
  return `<div class="page-heading"><div><h1>Практики</h1><p>Небольшие упражнения, которые можно пропустить или закрыть в любой момент.</p></div></div><div class="chips" aria-label="Темы практик">${[['all','Все'],['fomo','Страх пропустить'],['rest','Отдых и внимание'],['support','Границы и планы']].map(([v,t])=>`<button class="chip ${practiceFilter===v?'active':''}" data-action="practice-filter" data-value="${v}" aria-pressed="${practiceFilter===v}">${t}</button>`).join('')}</div><div class="practice-grid">${list.map(p=>`<article class="panel practice-card"><span class="icon-circle ${p.color}">${icon(p.icon)}</span><div class="practice-meta"><span>${p.tag}</span><span>${icon('Clock3')}${p.duration}</span></div><h2>${p.title}</h2><p class="muted">${p.subtitle}</p><button class="text-button" data-action="practice" data-id="${p.id}">Открыть ${icon('ArrowUpRight')}</button></article>`).join('')}</div>`;
}
function chart(entries: Entry[]) {
  const points = dailyAverages(entries);
   if (!points.length) return `<div class="chart-empty">${icon('ChartNoAxesCombined')}<h3>Пока пусто</h3><p>Добавь запись, и здесь появится динамика твоих оценок.</p><button class="btn secondary small" data-action="checkin">Сделать запись</button><button class="text-button" data-action="demo-on">Посмотреть пример</button></div>`;
  const x = (i:number) => points.length === 1 ? 310 : 55 + (i / (points.length-1))*515;
  const y = (n:number)=> 205 - n*17;
  const lines = [{key:'energy' as const,label:'Энергия',color:'#557b59'},{key:'pressure' as const,label:'Ощущение «надо»',color:'#b57259'},{key:'fomo' as const,label:'Страх пропустить',color:'#8c81ad'}];
  return `<div class="chart-key">${lines.map(l=>`<span><b style="background:${l.color}"></b>${l.label}</span>`).join('')}<span class="muted">0–10 · среднее за день</span></div><svg class="trend-chart" viewBox="0 0 620 245" role="img" aria-label="График средних дневных оценок энергии, ощущения «надо» и страха пропустить событие. Точные значения — в таблице ниже."><title>Оценки по дням</title>${[0,5,10].map(n=>`<line x1="45" x2="588" y1="${y(n)}" y2="${y(n)}" stroke="#e8e9e1"/><text x="25" y="${y(n)+4}" class="chart-tick">${n}</text>`).join('')}${lines.map(l=>`${points.length>1 ? `<polyline points="${points.map((p,i)=>`${x(i)},${y(p[l.key])}`).join(' ')}" fill="none" stroke="${l.color}" stroke-width="2.8"/>` : ''}${points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p[l.key])}" r="4" fill="${l.color}"><title>${p.day}: ${l.label} ${p[l.key].toFixed(1)}</title></circle>`).join('')}`).join('')}${points.filter((_,i)=>points.length<=8 || i%Math.ceil(points.length/7)===0 || i===points.length-1).map(p=>`<text x="${x(points.indexOf(p))}" y="233" text-anchor="middle" class="chart-tick">${p.day.slice(8)}.${p.day.slice(5,7)}</text>`).join('')}</svg><details class="chart-table"><summary>Значения и число записей</summary><div class="table-wrap"><table><thead><tr><th>Дата</th><th>Энергия</th><th>Ощущение «надо»</th><th>Страх пропустить</th><th>Записей</th></tr></thead><tbody>${points.map(p=>`<tr><td>${p.day}</td><td>${p.energy.toFixed(1)}</td><td>${p.pressure.toFixed(1)}</td><td>${p.fomo.toFixed(1)}</td><td>${p.count}</td></tr>`).join('')}</tbody></table></div></details><p class="chart-note">Показаны только дни с записями. Пустые дни не считаются нулевыми.</p>`;
}
function journalPage() {
  const entries = filteredEntries(demo ? demoEntries() : data.entries, journalDays, journalMoment, journalContext);
  return `<div class="page-heading"><div><h1>Дневник</h1><p>Здесь собраны твои заметки и оценки по дням.</p></div><button class="btn" data-action="checkin">${icon('Plus')} Записать состояние</button></div><div class="filters"><label>Период<select id="journal-days">${[7,14,30,90].map(n=>`<option value="${n}" ${journalDays===n?'selected':''}>${n} дней</option>`).join('')}</select></label><label>Момент<select id="journal-moment"><option value="all">Все моменты</option>${Object.entries(momentNames).map(([v,t])=>`<option value="${v}" ${journalMoment===v?'selected':''}>${t}</option>`).join('')}</select></label><label>Занятие<select id="journal-context"><option value="all">Все занятия</option>${Object.entries(contextNames).map(([v,t])=>`<option value="${v}" ${journalContext===v?'selected':''}>${t}</option>`).join('')}</select></label></div><section class="panel chart-panel"><div class="section-title"><h2>${demo?'Пример динамики':'Мои наблюдения'}</h2><span class="tiny-label">${entries.length} записей ${demo?'· вымышленные данные':''}</span></div>${chart(entries)}</section><section class="entries-section"><div class="section-title"><h2>Записи дневника</h2><button class="text-button" data-action="export-csv">${icon('Download')} Скачать дневник</button></div>${entries.length ? `<div class="entry-list">${[...entries].reverse().map(e=>`<article class="panel entry"><div class="entry-head"><span class="icon-circle sage">${icon(moodFace(e.mood))}</span><div><strong>${contextNames[e.context]} · ${momentNames[e.moment]}</strong><span>${dateLabel(e.at,true)}${e.game?' · '+esc(e.game):''}</span></div>${!demo ? `<button class="icon-button" data-action="delete-entry" data-id="${esc(e.id)}" aria-label="Удалить запись от ${dateLabel(e.at,true)}">${icon('Trash2')}</button>` : ''}</div><div class="entry-metrics"><span>Настроение <b>${e.mood}/10</b></span><span>Энергия <b>${e.energy}/10</b></span><span>Ощущение «надо» <b>${e.pressure}/10</b></span><span>Страх пропустить <b>${e.fomo}/10</b></span></div>${e.experience?`<div class="entry-metrics experience"><span>Удовольствие <b>${e.experience.pleasure}/10</b></span><span>Смысл <b>${e.experience.meaning}/10</b></span><span>Усилие <b>${e.experience.effort}/10</b></span><span>Пустота <b>${e.experience.emptiness}/10</b></span></div>`:''}${e.intention?`<p class="entry-intention">Мой выбор: ${esc(e.intention)}</p>`:''}${e.note?`<p class="entry-note">${esc(e.note)}</p>`:''}</article>`).join('')}</div>`:'<p class="empty-small">За этот период записей нет. Попробуй выбрать другие фильтры.</p>'}</section><p class="muted small-text">Авторские вопросы для дневника. <a href="#about" data-nav="about">Об их ограничениях</a>.</p>`;
}
function useProfile(id:string|null,value?:AppData){
  storageKey=id?`${STORAGE_KEY}:${id}`:STORAGE_KEY;
  if(!id)try{localStorage.removeItem('respace-current-user');}catch{}
  storageIssue='';storageCorrupt=false;
  try { const raw=localStorage.getItem(storageKey);data=value?validateData(value):raw?validateData(JSON.parse(raw)):initialData();if(value)localStorage.setItem(storageKey,JSON.stringify(data)); }
  catch {data=initialData();storageCorrupt=true;storageIssue='Не удалось открыть сохранение профиля. Скачай исходную копию в настройках.';}
}
function accountBanner(){return account.banner();}
function accountPage(){return account.page();}
function pathPage() {
  return `<div class="page-heading"><div><h1>Моё</h1><p>Твои места, находки и несколько слов для себя.</p></div></div>${accountBanner()}${renderSavedShelf(data,icon)}<div class="account-links"><a href="#journal" class="btn secondary" data-nav="journal">${icon('NotebookPen')} Мой дневник</a><a href="#practices" class="btn secondary" data-nav="practices">${icon('Sparkles')} Практики</a><a href="#settings" class="btn secondary" data-nav="settings">${icon('Download')} Сохранения</a></div><section class="intention-panel panel"><span class="icon-circle sage">${icon('Compass')}</span><div><span class="tiny-label">Мой ориентир</span><h2>${esc(data.goal)}</h2></div><button class="text-button" data-action="edit-goal">Изменить ${icon('Pencil')}</button></section><div class="two-column"><section class="panel"><div class="section-title"><h2>Мои опоры</h2><button class="btn small secondary" data-action="add-habit">${icon('Plus')} Добавить</button></div><p class="muted">Можно отметить то, что пригодилось сегодня.</p>${habitList(true)}</section><section class="panel personal-journal"><h2>Пара слов для себя</h2><p>Можно записать впечатление от игры или оставить мысль на потом.</p><button class="text-button" data-action="checkin">Сделать запись ${icon('ArrowRight')}</button><div class="observed-stats"><div><strong>${data.entries.length}</strong><span>записей состояния</span></div><div><strong>${data.practices.length}</strong><span>завершений практик</span></div></div></section></div>${data.practices.length?`<section class="panel"><h2>Мои заметки из практик</h2>${data.practices.slice(-5).reverse().map(r=>`<div class="practice-record"><strong>${esc(practices.find(p=>p.id===r.practiceId)?.title ?? lessons.find(l=>l.id===r.practiceId)?.title ?? 'Практика')}</strong><span>${dateLabel(r.at,true)}</span>${r.note?`<p>${esc(r.note)}</p>`:'<p class="muted">Без заметки</p>'}</div>`).join('')}</section>`:''}`;
}
function settingsPage() {
  return `<div class="page-heading"><div><h1>Настройки</h1><p>Звук, движение и сохранения.</p></div></div><section class="panel settings-panel"><span class="icon-circle sage">${icon('Smartphone')}</span><div><h2>Респейс на телефоне и планшете</h2><p>Android: Chrome → «Установить приложение». iPhone: Safari → «Поделиться» → «На экран Домой».</p><p class="muted">После первой загрузки темы и дневник работают без интернета. Для входа и синхронизации сеть нужна. Сайт и приложение хранят отдельные локальные копии.</p>${!Capacitor.isNativePlatform()?`<button class="btn secondary small" data-action="install">${icon('Download')} ${installPrompt?'Установить приложение':'Как установить'}</button>`:'<span class="pill">Версия для телефона</span>'}</div></section><section class="panel motion-setting"><div><h2>Движение</h2><p class="muted">Небольшие переходы между экранами и отклик на выбор.<span data-motion-note>${motion.systemReduced()?' На устройстве включено уменьшение движения.':''}</span></p></div><button class="btn secondary motion-toggle" data-action="motion-toggle" aria-pressed="${motion.enabled()}">${motion.enabled()?'Включено':'Выключено'}</button></section><section class="panel sound-setting"><div><h2>Звуки действий</h2><p class="muted" data-sound-note>${sound.supported()?sound.enabled()?'Короткие сигналы звучат при выборе и сохранении.':'По умолчанию звук выключен. Его можно включить здесь.':'В этом браузере звуковые сигналы недоступны.'}</p></div><button class="btn secondary sound-toggle" data-action="sound-toggle" aria-pressed="${sound.enabled()}" ${sound.supported()?'':'disabled'}>${sound.enabled()?'Включён':'Выключен'}</button></section><section class="panel"><h2>Резервная копия и перенос</h2><p class="muted">Если очистить данные браузера, гостевое сохранение исчезнет. Скачай JSON, чтобы сохранить его или перенести на другое устройство.</p><div class="action-row"><button class="btn secondary" data-action="export-json">${icon('Download')} Сохранить JSON</button><button class="btn secondary" data-action="export-csv">${icon('Table2')} Дневник CSV</button><button class="btn secondary" data-action="import">${icon('Upload')} Восстановить JSON</button></div><input type="file" id="import-file" accept=".json,application/json" hidden/><p class="small-text muted">CSV содержит записи дневника. JSON — весь профиль, в том числе игровые данные и личные тексты. Перед отправкой проверь файл.</p>${storageIssue?'<button class="text-button" data-action="export-raw">Скачать исходные сохранённые данные</button>':''}</section><section class="panel"><div class="section-title"><h2>Пример дневника</h2><span class="icon-circle lavender">${icon('FlaskConical')}</span></div><p class="muted">Семь примеров придуманы для демонстрации. Они не сохраняются в твоём дневнике и не входят в экспорт.</p><button class="btn secondary small" data-action="demo-on">Открыть пример</button></section><section class="panel danger-panel"><h2>Удалить локальные данные</h2><p class="muted">Удалятся дневник, заметки и игровые сохранения на этом устройстве. Копия в облаке останется. Если захочешь сохранить локальные данные, сначала скачай JSON.</p><button class="btn destructive small" data-action="erase">${icon('Trash2')} Удалить мои данные</button></section>`;
}
function aboutPage() {
  return `<div class="page-heading"><div><h1>О Респейсе</h1><p>Исследовательский веб-прототип ВКР: мотивационная регуляция и переживания в видеоигровом досуге взрослых (18+).</p></div></div><section class="panel about-intro"><h2>Замысел и позиционирование ВКР</h2><p>Игроки по-разному воспринимают ежедневные задания и награды за регулярный вход: в опросе 178 человек одни называли их стимулом, другие — обязанностью или поводом бояться пропустить событие. Это описание опыта участников, а не доказательство вреда для всех игроков. Респейс — исследовательский прототип ВКР по психологии: он предлагает добровольно отмечать причины игры и переживания игрового досуга. Польза таких записей и влияние прототипа на поведение или самочувствие пока не проверены.</p><div class="values-grid"><div>${icon('Compass')}<h3>Автономия</h3><p>Никаких таймеров-блокировщиков. Пользователь сам выбирает свой темп и завершает сессию.</p></div><div>${icon('Heart')}<h3>Без манипуляций</h3><p>В проекте отсутствуют streak-серии, рейтинги, дефицит наград и навязчивые уведомления.</p></div><div>${icon('ShieldCheck')}<h3>Конфиденциальность</h3><p>По умолчанию записи дневника сохраняются на устройстве. Синхронизация и участие в опросах — только по выбору пользователя.</p></div></div></section><section class="panel research-framework" aria-labelledby="about-layers-title"><div class="section-title"><div><span class="eyebrow">Методологический каркас</span><h2 id="about-layers-title">Четыре слоя проекта: не выдаём одно за другое</h2></div></div><div class="research-layers-grid"><article class="research-layer-card layer-clinical"><div><span class="research-layer-badge">1. Клинический слой</span><h3>Диагностические границы</h3><p>ВОЗ описывает нарушение контроля, приоритет игры, продолжение несмотря на последствия и значимое нарушение повседневного функционирования; такой паттерн обычно наблюдается 12 месяцев и более.</p></div><div class="layer-limit">Респейс не лечит, не ставит диагнозов и не заменяет врача или психотерапевта.</div></article><article class="research-layer-card layer-empirical"><div><span class="research-layer-badge">2. Эмпирический слой</span><h3>Академические данные</h3><p>SDT и модель страсти исследуют мотивы игры; ДПД описывает переживания в учебной деятельности.</p></div><div class="layer-limit">Эти данные не устанавливают, что шкалы Респейса пригодны или что прототип меняет благополучие.</div></article><article class="research-layer-card layer-hypotheses"><div><span class="research-layer-badge">3. Проектные гипотезы</span><h3>Решения автора ВКР</h3><p>Шкалы дневника (усилие ≠ усталость), мягкий выход (soft-exit), открытая структура тем.</p></div><div class="layer-limit">Проектные гипотезы для проверки в ВКР; эффективность самого продукта ещё не исследовалась.</div></article><article class="research-layer-card layer-metaphor"><div><span class="research-layer-badge">4. Бытовые метафоры</span><h3>Дидактические образы</h3><p>Образы «орбитальной станции», «комнаты Ри» и «чая у окна» помогают рассказывать о сложных идеях простым языком.</p></div><div class="layer-limit">Иллюстративный язык спокойного отдыха, а не психофизиологический тренажёр.</div></article></div></section><section class="panel"><h2>Целевая аудитория и границы применимости</h2><ul class="prose-list"><li><b>Для кого:</b> Взрослые пользователи (18+), играющие в видеоигры для отдыха, общения или хобби.</li><li><b>Для кого не предназначено:</b> Не подходит для профессионального киберспорта, стримеров и разработки игр (где действуют профессиональные факторы выгорания).</li><li><b>Не является тестом:</b> Вопросы дневника — авторский инструмент для самонаблюдения, а не стандартизированная методика с диагностическими нормами.</li><li><b>Не заменяет помощь:</b> При устойчивых трудностях с учёбой, работой или сном рекомендуется очное обращение к специалисту.</li></ul></section><section class="panel support-panel"><span class="icon-circle peach">${icon('HeartHandshake')}</span><div><h2>Поддержка и безопасность</h2><p>Если из-за игр или стресса страдают сон, работа, учёба или отношения, обратись к клиническому психологу или врачу-психотерапевту. По числу игровых часов диагноз не ставится.</p><p>Если кому-то прямо сейчас угрожает опасность или требуется неотложная помощь, обратись в экстренные службы или к близким людям. Респейс не оказывает кризисную или медицинскую помощь.</p></div></section><section class="sources"><h2>Исследования и официальные материалы ВКР</h2><p class="muted">Ссылки ведут на DOI или страницу первоисточника. Для исследований указаны выборка и границы выводов; для официальных материалов — область применения.</p>${sources.map(s=>`<article class="source-row"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ${icon('ArrowUpRight')}</a><p>${s.note}</p></article>`).join('')}</section>`;
}
function openModal(html: string, wide = false) {
  lastFocused = document.activeElement as HTMLElement;
  const dialog = document.querySelector<HTMLDialogElement>('#modal')!;
  dialog.className = wide ? 'wide' : '';
  dialog.innerHTML = `<button class="icon-button modal-close" data-action="close" aria-label="Закрыть">${icon('X')}</button>${html}`;
  updateIcons(); dialog.showModal();
  dialog.addEventListener('close', () => {
    if(lastFocused?.isConnected)lastFocused.focus();
    else if(lastFocused?.dataset.space)root.querySelector<HTMLElement>(`[data-space="${lastFocused.dataset.space}"]`)?.focus();
  }, {once:true});
  dialog.addEventListener('click', e => { if (e.target === dialog) {const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close();} });
}
function closeModal() { document.querySelector<HTMLDialogElement>('#modal')?.close(); }
function scale(name: string, label: string, low: string, high: string, value = 5) { return `<label class="scale-label" for="${name}">${label}<output id="${name}-output" for="${name}">${value}<span>/10</span></output></label><input type="range" id="${name}" name="${name}" min="0" max="10" step="1" value="${value}"/><div class="scale-ends"><span>${low}</span><span>${high}</span></div>`; }
function openCheckin(mood = 5) {
  if (!data.accepted) { mutate(d=>{d.accepted=true;}); render(); }
  openModal(`<h2 id="modal-title">Записать состояние</h2><p class="muted">Отметь состояние и добавь заметку.</p><form id="checkin-form"><div class="form-columns"><label>Занятие<select name="context" id="checkin-context"><option value="gaming">Игра</option><option value="work">Работа / учёба</option><option value="rest">Отдых</option></select></label><label>Момент<select name="moment"><option value="day">В течение дня</option><option value="before">До занятия</option><option value="after">После занятия</option></select></label></div><label id="game-label">Игра <span class="optional">необязательно</span><input name="game" maxlength="100" placeholder="Название игры"/></label><div class="scales">${scale('mood','Настроение','Очень неприятное','Очень приятное',mood)}${scale('energy','Энергия','Сил совсем нет','Много сил')}${scale('pressure','Чувство «я должен играть / заниматься»','Совсем нет','Очень сильное')}${scale('fomo','Страх что-то упустить','Совсем нет','Очень сильный')}</div><details class="experience-form"><summary>Подробнее о занятии <span class="optional">необязательно</span></summary><label class="check-label"><input type="checkbox" name="include-experience" id="include-experience"/> Добавить эти оценки в запись</label><p class="small-text muted">Усилие — сколько энергии ты вложил, а не насколько устал. Эти вопросы — для дневника, не диагностика.</p><div class="scales">${scale('pleasure','Удовольствие от занятия','Совсем нет','Очень много')}${scale('meaning','Ощущение смысла','Совсем нет','Очень сильное')}${scale('effort','Субъективное усилие','Совсем нет','Очень сильное')}${scale('emptiness','Ощущение пустоты','Совсем нет','Очень сильное')}</div></details><label>Мой выбор сейчас <span class="optional">необязательно</span><input name="intention" maxlength="300" placeholder="Поиграть ради сюжета, отдохнуть, поговорить…"/></label><label>Пара слов для себя <span class="optional">необязательно</span><textarea name="note" maxlength="2000" rows="3" placeholder="Что повлияло на твоё состояние?"></textarea></label><p id="form-error" class="form-error" role="alert"></p><div class="modal-actions"><button type="button" class="btn secondary" data-action="close">Не сейчас</button><button class="btn" type="submit">Сохранить запись ${icon('Check')}</button></div><p class="small-text muted">${account.isSigned()&&account.personal()?'Запись сохранится здесь и в облаке: перенос личных данных включён.':'Запись сохраняется только на этом устройстве.'}</p></form>`, true);
  document.querySelector('#checkin-context')!.addEventListener('change', e => { document.querySelector<HTMLElement>('#game-label')!.hidden = (e.target as HTMLSelectElement).value !== 'gaming'; });
  document.querySelector<HTMLFormElement>('#checkin-form')!.addEventListener('submit', e => {
    e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); const now=new Date();
    const entry: Entry={ id:crypto.randomUUID(), at:now.toISOString(), day:dayKey(now), context:f.get('context') as Context, moment:f.get('moment') as Moment, mood:Number(f.get('mood')),energy:Number(f.get('energy')),pressure:Number(f.get('pressure')),fomo:Number(f.get('fomo')),note:String(f.get('note')||'').trim(),intention:String(f.get('intention')||'').trim() };
    if(entry.context==='gaming')entry.game=String(f.get('game')||'').trim();
    if(f.get('include-experience'))entry.experience={pleasure:Number(f.get('pleasure')),meaning:Number(f.get('meaning')),effort:Number(f.get('effort')),emptiness:Number(f.get('emptiness'))};
    if(mutate(d=>d.entries.push(entry))){closeModal();render();toast('Запись сохранена.');}
    else document.querySelector('#form-error')!.textContent=storageIssue;
  });
}
function openPractice(id: string) {
  const p=practices.find(p=>p.id===id); if(!p)return;
  let step=0; const answers: string[]=p.steps.map(()=> '');
  const show=()=>{
    const s=p.steps[step];
    const html=`<p class="eyebrow">${p.tag} · ${p.duration}</p><h2 id="modal-title">${p.title}</h2><div class="practice-progress" aria-label="Шаг ${step+1} из ${p.steps.length}">${p.steps.map((_,i)=>`<span class="${i<=step?'filled':''}"></span>`).join('')}</div><div class="practice-step"><span class="icon-circle ${p.color}">${icon(p.icon)}</span><span class="tiny-label">Шаг ${step+1} из ${p.steps.length}</span><h3>${s.title}</h3><p>${s.text}</p>${s.prompt?`<label>${s.prompt}<textarea id="practice-answer" maxlength="350" rows="4" placeholder="Твоя заметка">${esc(answers[step])}</textarea></label>`:''}</div><p class="small-text muted">Заметки сохранятся после завершения.</p><div class="modal-actions"><button class="btn secondary" id="practice-back" type="button">${step?'Назад':'Закрыть'}</button><button class="btn" id="practice-next" type="button">${step===p.steps.length-1?'Завершить практику':'Дальше'} ${icon('ArrowRight')}</button></div><p class="practice-source">${p.source}</p>`;
    const dialog=document.querySelector<HTMLDialogElement>('#modal')!;
    if(!dialog.open)openModal(html); else{dialog.innerHTML=`<button class="icon-button modal-close" data-action="close" aria-label="Закрыть">${icon('X')}</button>${html}`;updateIcons();dialog.querySelector<HTMLElement>('#modal-title')?.setAttribute('tabindex','-1');dialog.querySelector<HTMLElement>('#modal-title')?.focus();}
    const capture=()=>{answers[step]=document.querySelector<HTMLTextAreaElement>('#practice-answer')?.value??'';};
    document.querySelector('#practice-back')!.addEventListener('click',()=>{capture();if(step){step--;show();}else closeModal();});
    document.querySelector('#practice-next')!.addEventListener('click',()=>{capture();if(step<p.steps.length-1){step++;show();}else{
      const note=answers.map((a,i)=>a?`${p.steps[i].prompt}\n${a}`:'').filter(Boolean).join('\n\n').slice(0,2000);
      if(mutate(d=>d.practices.push({id:crypto.randomUUID(),practiceId:p.id,at:new Date().toISOString(),note}))){closeModal();render();toast('Практика сохранена в «Моё».');}
    }});
  };show();
}
function textModal(title:string,label:string,value:string,max:number,submit:(value:string)=>boolean) {
  openModal(`<h2 id="modal-title">${title}</h2><form id="text-form"><label>${label}<input name="value" value="${esc(value)}" maxlength="${max}" required autofocus/></label><p class="form-error" role="alert" id="text-error"></p><div class="modal-actions"><button class="btn secondary" type="button" data-action="close">Отмена</button><button class="btn" type="submit">Сохранить</button></div></form>`);
  document.querySelector('#text-form')!.addEventListener('submit',e=>{e.preventDefault();const v=String(new FormData(e.currentTarget as HTMLFormElement).get('value')||'').trim();if(!v){document.querySelector('#text-error')!.textContent='Введи хотя бы несколько слов.';return;}if(submit(v)){closeModal();render();toast('Сохранено.');}});
}
function confirmation(title:string,text:string,button:string,fn:()=>boolean) {
  openModal(`<h2 id="modal-title">${title}</h2><p>${text}</p><div class="modal-actions"><button class="btn secondary" data-action="close">Отмена</button><button class="btn destructive" id="confirm-action">${button}</button></div>`);
  document.querySelector('#confirm-action')!.addEventListener('click',()=>{if(fn()){closeModal();render();toast('Готово.');}});
}
function download(name:string,content:string,type:string) { const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000); }
function wirePage() {
  for(const id of ['journal-days','journal-moment','journal-context'])document.getElementById(id)?.addEventListener('change',e=>{const v=(e.target as HTMLSelectElement).value;if(id==='journal-days')journalDays=Number(v);if(id==='journal-moment')journalMoment=v as typeof journalMoment;if(id==='journal-context')journalContext=v as typeof journalContext;render();document.getElementById(id)?.focus();});
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change',async e=>{
    const input=e.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;
    try{if(file.size>32_000_000)throw new Error('Файл слишком большой. Максимум — 32 МБ.');const imported=validateData(JSON.parse(await file.text()));confirmation('Восстановить копию?',`Заменит данные этого профиля: ${imported.entries.length} записей, ${imported.habits.length} привычек и ${imported.practices.length} практик. Сначала скачай текущий JSON, если нужна копия.`,'Восстановить',()=>{demo=false;return commit(imported,true);});}catch(error){toast(error instanceof Error?error.message:'Не удалось прочитать файл.');}finally{input.value='';}
  });
}
root.addEventListener('input',e=>{const el=e.target as HTMLInputElement;if(el.type==='range'){const output=document.getElementById(el.id+'-output');if(output)output.innerHTML=`${Number(el.value)}<span>/10</span>`;}});
root.addEventListener('click', e => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action],[data-nav],[data-space],.star-canvas');
  if (!target || (target instanceof HTMLButtonElement && target.disabled)) return;
  if (target.dataset.action === 'sound-toggle' || target.matches('#confirm-action,button[type="submit"]') || /(?:^|-)save$|(?:^|-)finish$/.test(target.dataset.space ?? '')) return;
  sound.play('tap');
}, true);
root.addEventListener('click',async e=>{
  const el=(e.target as HTMLElement).closest<HTMLElement>('[data-action],[data-nav]');if(!el)return;
  if(el.dataset.nav){if(el instanceof HTMLAnchorElement&&(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey))return;e.preventDefault();page=el.dataset.nav as Page;history.pushState(null,'','#'+page);render();window.scrollTo({top:0});document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});return;}
  const id=el.dataset.id||'';
  switch(el.dataset.action){
    case 'close':closeModal();break;
    case 'motion-toggle':if(motion.setEnabled(!motion.enabled())){render();root.querySelector<HTMLElement>('[data-action="motion-toggle"]')?.focus();}else toast('Не удалось сохранить настройку движения.');break;
    case 'sound-toggle':{const next=!sound.enabled();if(sound.setEnabled(next)){render();root.querySelector<HTMLElement>('[data-action="sound-toggle"]')?.focus();if(next)sound.play('saved');}else toast('Не удалось сохранить настройку звука.');break;}
    case 'accept':if(mutate(d=>{d.accepted=true;}))render();break;
    case 'home-intent':{if(!homeIntents.some(item=>item.id===id))break;const url=new URL(location.href);url.searchParams.set('intent',id);history.pushState(null,'',url);render();root.querySelector<HTMLElement>(`[data-action="home-intent"][data-id="${id}"]`)?.focus({preventScroll:true});break;}
    case 'choose-step':openSituations();break;
    case 'situation':openSituation(id);break;
    case 'leisure':closeModal();page='play';history.pushState(null,'','#play');render();window.scrollTo({top:0});document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});break;
    case 'checkin':openCheckin();break;
    case 'break-modal':openModal(`<h2 id="modal-title">Перерыв</h2><p class="muted">Вода, окно или несколько шагов — выбери, что удобнее.</p>${timerCard()}<button class="text-button" data-action="close">Закрыть окно</button>`);updateTimerView();break;
    case 'mood':openCheckin(Number(el.dataset.value));break;
    case 'practice':openPractice(id);break;
    case 'practice-filter':practiceFilter=el.dataset.value||'all';render();break;
    case 'habit':if(mutate(d=>{d.habits=d.habits.map(h=>h.id===id?toggleHabit(h,dayKey()):h);}))render();break;
    case 'add-habit':if(data.habits.length>=30){toast('Лимит — 30 привычек. Удали ненужную, чтобы добавить новую.');break;}textModal('Новая привычка','Что ты хочешь отмечать?','',180,v=>mutate(d=>d.habits.push({id:crypto.randomUUID(),title:v,days:[]})));break;
    case 'remove-habit':confirmation('Удалить привычку?','Её отметки тоже будут удалены. Записи дневника останутся.','Удалить',()=>mutate(d=>{d.habits=d.habits.filter(h=>h.id!==id);}));break;
    case 'edit-goal':textModal('Мой ориентир','Что для тебя сейчас важно?',data.goal,180,v=>mutate(d=>{d.goal=v;}));break;
    case 'delete-entry':confirmation('Удалить запись?','Эту запись можно восстановить только из ранее сохранённой копии JSON.','Удалить',()=>mutate(d=>{d.entries=d.entries.filter(x=>x.id!==id);}));break;
    case 'demo-on':demo=true;page='journal';journalMoment='all';journalContext='all';render();window.scrollTo({top:0});break;
    case 'demo-off':demo=false;render();break;
    case 'timer-toggle':if(timer.running){timer.remaining=Math.max(0,Math.ceil((timer.end-Date.now())/1000));timer.running=false;}else{if(!timer.remaining)timer.remaining=300;timer.end=Date.now()+timer.remaining*1000;timer.running=true;timer.active=true;}updateTimerView();break;
    case 'timer-reset':timer={remaining:300,end:0,running:false,active:false};updateTimerView();break;
    case 'export-json':download(`respace-${dayKey()}.json`,JSON.stringify(data,null,2),'application/json');toast('Копия подготовлена. Проверь загрузки браузера.');break;
    case 'export-csv':download(`respace-journal-${dayKey()}.csv`,csvExport(data.entries),'text/csv;charset=utf-8');toast('Дневник подготовлен. Проверь загрузки браузера.');break;
    case 'export-raw':try{download('respace-recovery.txt',localStorage.getItem(storageKey)??'','text/plain');}catch{toast('Хранилище браузера недоступно.');}break;
    case 'import':document.querySelector<HTMLInputElement>('#import-file')?.click();break;
    case 'install':if(installPrompt){await installPrompt.prompt();const result=await installPrompt.userChoice;installPrompt=null;toast(result.outcome==='accepted'?'Запрос установки принят.':'Можно установить позже через меню браузера.');}else openModal('<h2 id="modal-title">Добавить Респейс на телефон</h2><p><strong>Android:</strong> меню Chrome → «Установить приложение» / «Добавить на главный экран».</p><p><strong>iPhone:</strong> открой сайт в Safari → «Поделиться» → «На экран Домой».</p><p class="muted">Установка сайта требует HTTPS или localhost. После первой полной загрузки доступны офлайн-практики и дневник.</p><button class="btn" data-action="close">Понятно</button>');break;
    case 'erase':openModal(`<h2 id="modal-title">Удалить все локальные данные?</h2><p>Удалятся данные текущего профиля на этом устройстве, включая темы, избранное, комнату и созвездие. Облачная копия, если есть, останется. Сначала можно скачать JSON в настройках.</p><form id="erase-form"><label>Введи УДАЛИТЬ<input name="confirm" required autocomplete="off"/></label><p class="form-error" id="erase-error" role="alert"></p><div class="modal-actions"><button type="button" class="btn secondary" data-action="close">Отмена</button><button class="btn destructive" type="submit">Удалить данные</button></div></form>`);document.querySelector('#erase-form')!.addEventListener('submit',ev=>{ev.preventDefault();if(new FormData(ev.currentTarget as HTMLFormElement).get('confirm')!=='УДАЛИТЬ'){document.querySelector('#erase-error')!.textContent='Для подтверждения введи УДАЛИТЬ.';return;}try{account.localCleared();localStorage.removeItem(storageKey);data=initialData();demo=false;storageIssue='';storageCorrupt=false;closeModal();render();toast('Локальные данные удалены.');}catch{document.querySelector('#erase-error')!.textContent='Не удалось удалить данные. Хранилище браузера недоступно.';}});break;
  }
});
function updateTimerView() {
  document.querySelectorAll('.timer-display').forEach(el=>{el.textContent=formatTime(timer.remaining);});
  document.querySelectorAll('[data-action="timer-toggle"]').forEach(el=>{el.innerHTML=`${icon(timer.running?'Pause':'Play')}<span>${timer.running?'Приостановить':timer.active?'Продолжить':'Начать перерыв'}</span>`;});
  document.querySelectorAll('.timer-description').forEach(el=>{el.textContent=timer.remaining===0?'Перерыв завершён':timer.active?'Перерыв для себя':'Перерыв на 5 минут';});updateIcons();
}
setInterval(()=>{if(!timer.running)return;timer.remaining=Math.max(0,Math.ceil((timer.end-Date.now())/1000));if(!timer.remaining){timer.running=false;timer.active=false;toast('Пять минут прошли.');}updateTimerView();},1000);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e as unknown as typeof installPrompt;});
window.addEventListener('storage',e=>{if(e.key===storageKey){try{data=e.newValue?validateData(JSON.parse(e.newValue)):initialData();if(!document.querySelector<HTMLDialogElement>('#modal')?.open)render();else toast('Сохранение обновилось в другой вкладке.');}catch{toast('В другой вкладке появились некорректные данные.');}}});
window.addEventListener('popstate',()=>{const target=location.hash.slice(1) as Page;if(pages.includes(target)){page=target;render();}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!document.querySelector<HTMLDialogElement>('#modal')?.open)render();});
const account=createAccount({get:()=>data,profile:useProfile,render,modal:openModal,close:closeModal,toast,icon,icons:updateIcons},root);
const space=createSpace({get:()=>data,mutate,modal:openModal,close:closeModal,icons:updateIcons,icon,toast,render},root);
render();
void initNative(()=>{if(document.querySelector<HTMLDialogElement>('#modal')?.open){space.requestClose();return true;}if(page!=='today'){page='today';history.pushState(null,'','#today');render();return true;}return false;}).catch(()=>toast('Не удалось запустить часть функций приложения.'));
void account.init();
if('serviceWorker' in navigator && !Capacitor.isNativePlatform() && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(()=>toast('Офлайн-режим пока недоступен. Онлайн-функции продолжают работать.'));
