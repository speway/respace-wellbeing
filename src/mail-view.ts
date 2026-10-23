import {getMailFeedback,MAIL_TASKS,validateMail,type MailState} from './mail-model';
import {neighborSprite} from './neighbors';
import './mail-view.css';

const parcelNames=['Кружка','Книга','Письмо'];
const positions=['Первая полка','Средняя полка','Последняя полка'];

function stamp(parcel:number):string {
  const drawings=[
    '<path d="M17 20h25v18c0 12-25 12-25 0Z"/><path d="M42 24h5c11 0 11 16-5 16" fill="none"/><path d="M24 10v4m11-4v4" fill="none"/>',
    '<path d="M9 14q13-6 23 1 10-7 23-1v34q-13-6-23 1-10-7-23-1Z"/><path d="M32 15v34m-16-25h8m-8 9h8m16-9h8m-8 9h8" fill="none"/>',
    '<path d="M16 46C6 14 32 11 49 10c1 21-4 44-33 36Z"/><path d="m14 50 27-30m-18 18-1-13m1 13 13-1" fill="none"/>',
  ];
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${drawings[parcel]}</svg>`;
}

export function renderMail(state:MailState,selected:number|null,checked:boolean,undoAvailable:boolean):string {
  const clean=validateMail(state);
  const feedback=getMailFeedback(clean);
  const finished=checked&&feedback.done;
  const picking=selected!==null&&Number.isInteger(selected)&&selected>=0&&selected<3;
  const dialogue=checked?feedback.text:picking?`Выбрана посылка «${parcelNames[clean.order[selected!]]}». Теперь нажми на другую.`:'Я всё разложил… кажется. Проверь подсказки.';
  return `<section class="mail-game" aria-label="Почта Бипа">
    <div class="mail-neighbor">${neighborSprite('bip',finished?2:picking?1:0)}<div class="mail-dialogue"><h2 id="modal-title">Почта Бипа</h2><p id="mail-feedback" role="status" data-motion-feedback>${dialogue}</p></div></div>
    <div class="mail-task-picker"><label for="mail-task">Какую отправку собрать?</label><select id="mail-task" data-space="mail-task">${MAIL_TASKS.map((task,index)=>`<option value="${index}"${clean.task===index?' selected':''}>${task.title}</option>`).join('')}</select></div>
    <ul class="mail-clues" aria-label="Порядок отправки">${MAIL_TASKS[clean.task].clues.map(clue=>`<li>${clue}</li>`).join('')}</ul>
    <p class="mail-instruction" id="mail-instruction">Выбери две посылки по очереди, чтобы поменять их местами.</p>
    <div class="mail-shelves" role="group" aria-label="Три почтовые полки" aria-describedby="mail-instruction">${clean.order.map((parcel,index)=>`<button type="button" class="mail-slot" data-space="mail-slot" data-value="${index}" aria-label="${positions[index]}: ${parcelNames[parcel].toLocaleLowerCase('ru')}" aria-pressed="${selected===index}"><span class="mail-parcel mail-parcel-${parcel}"><span class="mail-parcel-stamp">${stamp(parcel)}</span><span class="mail-parcel-name">${parcelNames[parcel]}</span></span><span class="mail-shelf-name">${index+1}</span></button>`).join('')}</div>
    <div class="mail-actions"><button type="button" class="btn" data-space="mail-check">Проверить порядок</button><button type="button" class="btn secondary" data-space="mail-undo"${undoAvailable?'':' disabled'}>Вернуть ход</button></div>
    <div class="mail-ending"><button type="button" class="btn secondary" data-space="mail-save">Сохранить</button><button type="button" class="btn secondary" data-action="close">${finished?'Закончить':'На станцию'}</button></div>
  </section>`;
}
