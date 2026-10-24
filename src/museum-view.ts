import './museum-view.css';

const navy = '#151b46';
const mint = '#34c6aa';
const lilac = '#b7aefa';

const postcards = [
  {name: 'Луна над причалом', caption: 'Последний кораблик уже привязан. Луна осталась дежурить у воды.'},
  {name: 'Сад в чашке', caption: 'Кто-то посадил росток в чашку. Теперь чайная полка понемногу становится садом.'},
  {name: 'Чай у окна', caption: 'За окном проходят облака. Чай сегодня никуда не торопится.'},
  {name: 'Тихий берег', caption: 'Волна принесла гладкий камень. Следующая оставила его на месте.'},
  {name: 'Цветок на крыше', caption: 'Цветок вырос рядом с антенной. Соседи договорились делить солнечное место.'},
  {name: 'Окно на орбиту', caption: 'В иллюминаторе проплывает планета. На подоконнике стоит земной кактус.'},
  {name: 'Лист в письме', caption: 'В конверте оказался лист. Короткое письмо из места, где сейчас осень.'},
  {name: 'Светлячки у тропинки', caption: 'Тропинка погасла, а светлячки остались. У каждого свой маленький фонарь.'},
  {name: 'Дом на холме', caption: 'В доме включили свет. На крыльце оставили место для ещё одной пары ботинок.'},
] as const;

function svg(contents: string): string {
  return `<svg viewBox="0 0 320 210" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${contents}</svg>`;
}

function boat(x: number, fill: string): string {
  return `<g transform="translate(${x} 83)"><path d="M0 36h88l-15 24H18Z" fill="${fill}" stroke="${navy}" stroke-width="3" stroke-linejoin="round"/><path d="M43 0v36" stroke="${navy}" stroke-width="3" stroke-linecap="round"/><path d="M39 4 9 30h30Z" fill="#fff"/><path d="m47 8 24 22H47Z" fill="#e4f9fc"/><circle cx="25" cy="47" r="3" fill="${navy}"/><circle cx="63" cy="47" r="3" fill="${navy}"/></g>`;
}

function boats(): string {
  return svg(`<rect width="320" height="210" rx="14" fill="#e4f9fc"/><circle cx="257" cy="40" r="19" fill="#fff0df"/><path d="M0 139q40-12 80 0t80 0t80 0t80 0v71H0Z" fill="#bbece6"/><path d="M22 164h32m94 8h34m46-9h53M70 191h39m93 0h31" stroke="#188f7d" stroke-width="3" stroke-linecap="round"/><path d="M13 89h37v11H13Zm9 11v42m22-42v42" fill="#c4a5a0" stroke="${navy}" stroke-width="3" stroke-linejoin="round"/>${boat(66, mint)}${boat(155, lilac)}`);
}

function postcardArt(index: number): string {
  const line = `stroke="${navy}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const scenes = [
    `<rect width="320" height="210" fill="#273657"/><circle cx="241" cy="50" r="25" fill="#fff0df"/><path d="M0 132q80-18 160 0t160 0v78H0Z" fill="#536d8f"/><path d="M23 133h131v12H23Zm15 12v47m99-47v47" fill="#c7b5c6"/><path d="m176 144 69 0-15 23h-39Z" fill="${mint}"/><path d="M210 104v40m-5-35-22 27h22" fill="#fff" stroke="#fff" stroke-width="3"/><path d="M63 44h5m48 27h5m160 22h5" stroke="#fff0df" stroke-width="3" stroke-linecap="round"/>`,
    `<rect width="320" height="210" fill="#e8f8f4"/><ellipse cx="162" cy="173" rx="76" ry="9" fill="#a9d8cc"/><path d="M104 106h98v36q0 27-49 27t-49-27Z" fill="${lilac}" ${line}/><path d="M202 117h13q22 0 22 16t-35 16" fill="none" ${line}/><path d="M153 112V55" fill="none" ${line}/><path d="M153 81q-42 1-42-29 40-3 42 29Zm1-17q0-34 35-36 8 33-35 36Z" fill="${mint}"/><path d="M118 111h70" ${line}/>`,
    `<rect width="320" height="210" fill="#fff0df"/><rect x="97" y="22" width="161" height="111" rx="8" fill="#bceaf0" ${line}/><path d="M177 23v108M98 80h159" ${line}/><path d="M109 52h24m65 54h30" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M22 158h278" ${line}/><path d="M54 119h67v24q0 15-33 15t-34-15Z" fill="${mint}" ${line}/><path d="M121 124h9q13 0 13 10t-22 11" fill="none" ${line}/><path d="M70 104q-7-10 0-21m21 20q7-10 0-21" fill="none" stroke="#8879bd" stroke-width="3" stroke-linecap="round"/>`,
    `<rect width="320" height="210" fill="#e4f9fc"/><circle cx="245" cy="49" r="22" fill="#fff0df"/><path d="M0 111q70-15 140 3t180-3v99H0Z" fill="#92d9d0"/><path d="M0 150q87-25 164 0t156 1v59H0Z" fill="#fff0df"/><path d="M125 179q0-23 27-23t29 23Z" fill="${lilac}" ${line}/><path d="M28 134q22-8 44 0m155-11q22-8 44 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    `<rect width="320" height="210" fill="#eeeaff"/><path d="M26 170h268v40H26Z" fill="#fff0df"/><path d="M76 170v-58h165v58" fill="#fff" ${line}/><path d="M62 111h194" ${line}/><path d="M133 110V70m0 23q-25-2-25-18 24-1 25 18m1-11q27 0 27-16-25-1-27 16" fill="${mint}" ${line}/><g fill="#f2a6ba"><circle cx="133" cy="45" r="12"/><circle cx="114" cy="58" r="12"/><circle cx="122" cy="78" r="12"/><circle cx="144" cy="78" r="12"/><circle cx="152" cy="58" r="12"/></g><circle cx="133" cy="62" r="11" fill="#fff0df"/><path d="M205 110V40m-16 13h32m-25-14h18" ${line}/>`,
    `<rect width="320" height="210" fill="#fff0df"/><circle cx="169" cy="92" r="77" fill="#273657" ${line}/><ellipse cx="183" cy="83" rx="45" ry="14" transform="rotate(-22 183 83)" fill="none" stroke="#b7aefa" stroke-width="7"/><circle cx="183" cy="82" r="27" fill="${lilac}"/><path d="M74 174h189" ${line}/><path d="M102 171v-30m0 11h-13v-15m13 7h14v-13" fill="none" stroke="#188f7d" stroke-width="7" stroke-linecap="round"/><path d="M86 157h32l-5 18H91Z" fill="${mint}"/><circle cx="125" cy="58" r="3" fill="#fff"/><circle cx="225" cy="116" r="3" fill="#fff"/>`,
    `<rect width="320" height="210" fill="#e8f8f4"/><rect x="61" y="61" width="198" height="113" rx="8" fill="#fff" ${line}/><path d="m63 64 97 73 97-73M64 171l67-58m125 58-66-58" fill="none" ${line}/><path d="M155 110q-54-8-45-63 60-5 65 48" fill="#f0bc86" ${line}/><path d="m120 59 59 57m-40-53 1 22m-11-2 25 5" ${line}/>`,
    `<rect width="320" height="210" fill="#273657"/><path d="M0 172q63-25 155-17t165-7v62H0Z" fill="#466763"/><path d="M139 210q54-47 10-67t20-43" fill="none" stroke="#b7aefa" stroke-width="20"/><g fill="#fff0df"><circle cx="67" cy="113" r="5"/><circle cx="115" cy="81" r="5"/><circle cx="217" cy="123" r="5"/><circle cx="248" cy="69" r="5"/><circle cx="194" cy="48" r="5"/></g><path d="M49 158v-15m196 33v-15m-40 23v-16" stroke="${mint}" stroke-width="3" stroke-linecap="round"/>`,
    `<rect width="320" height="210" fill="#e4f9fc"/><circle cx="67" cy="42" r="21" fill="#fff0df"/><path d="M0 172q96-87 198-36t122 21v53H0Z" fill="#97d8c1"/><path d="M128 92h105v70H128Z" fill="#fff0df" ${line}/><path d="m116 93 64-45 65 45Z" fill="${lilac}" ${line}/><rect x="168" y="124" width="24" height="38" rx="3" fill="#273657"/><rect x="139" y="110" width="18" height="23" rx="3" fill="#f1bd8a"/><rect x="204" y="110" width="18" height="23" rx="3" fill="#f1bd8a"/><path d="M180 162q-6 26-39 48" fill="none" stroke="#fff0df" stroke-width="17"/>`,
  ];
  return svg(scenes[index] ?? scenes[0]);
}

function explanationButton(): string {
  return '<button type="button" class="btn secondary" data-space="museum-explain">Что показывает опыт</button>';
}

function memoryView(selected: number[]): string {
  const chosen = selected.slice().reverse().find(value => value === 0 || value === 1);
  const words = ['Соприкоснулись', 'Столкнулись'];
  const sentence = chosen === undefined ? 'Кораблики встретились у причала.' : `Кораблики ${chosen === 0 ? 'соприкоснулись' : 'столкнулись'} у причала.`;
  return `<section class="museum-experiment museum-memory" aria-label="Один эпизод, два описания">
    <p class="museum-instruction">Выбери, как описать эту сцену. Изменится ли впечатление от одного слова?<br><span id="museum-words-kbd" class="museum-kbd-tip small-text muted">Клавиатура: стрелки — выбор слова; Enter или Пробел — применить; Home/End — первое/последнее.</span></p>
    <figure class="museum-boats"><div role="img" aria-label="Два целых кораблика рядом у причала, спокойная вода">${boats()}</div><figcaption>Кораблики на рисунке не меняются.</figcaption></figure>
    <p class="museum-narration" aria-live="polite">«${sentence}»</p>
    <div class="museum-word-options" role="group" aria-label="Глагол для описания" aria-describedby="museum-words-kbd">${words.map((word, i) => `<button type="button" class="museum-word" data-space="museum-word" data-value="${i}" aria-label="Глагол «${word}»${chosen === i ? ' (выбран)' : ''}. Нажми Enter или Пробел, чтобы выбрать" aria-pressed="${chosen === i}">${word}<span class="museum-selection">${chosen === i ? 'Выбрано' : 'Выбрать'}</span></button>`).join('')}</div>
    <p id="museum-feedback" class="museum-feedback" role="status" aria-live="polite">${chosen === undefined ? 'Нажми на оба слова и сравни.' : 'Сцена та же, изменилось только описание. Как теперь звучит эта история?'}</p>
    <div class="museum-actions">${explanationButton()}</div>
    <p class="small-text muted museum-disclaimer">Научно-популярная иллюстрация на вымышленном примере. Не является тестом способностей, оценкой или доказательством эффективности игры.</p>
  </section>`;
}

function attentionView(stage: number, selected: number[]): string {
  const byColor = stage > 1;
  const chosen = selected.filter(value => Number.isInteger(value) && value >= 0 && value < 6);
  const matching = (value: number) => byColor ? value % 3 === 0 : value % 2 === 0;
  const feedback = chosen.length === 0
    ? (byColor ? 'Фигуры те же. Теперь выбирай по цвету.' : 'Нажми на подходящие фигуры. Повторное нажатие отменит выбор.')
    : chosen.every(matching)
      ? `Выбранные фигуры ${byColor ? 'синие' : 'круглые'}. `
      : `В выборе есть ${byColor ? 'персиковая фигура' : 'квадрат'}. Проверь правило ещё раз. Выбор можно отменить.`;
  return `<section class="museum-experiment museum-attention" aria-label="Смена правила">
    <p class="museum-instruction">${byColor ? 'Теперь ищем по цвету.' : 'Сначала выбери по форме.'} Нажми на <strong>${byColor ? 'синие фигуры' : 'круглые фигуры'}</strong>.<br><span id="museum-shapes-kbd" class="museum-kbd-tip small-text muted">Клавиатура: стрелки — переход по фигурам; Enter или Пробел — переключить выбор; Home/End — первая/последняя.</span></p>
    <div class="museum-shapes" role="group" aria-label="Шесть фигур" aria-describedby="museum-shapes-kbd">${Array.from({length: 6}, (_, i) => {
      const picked = selected.includes(i);
      const round = i % 2 === 0;
      const blue = i % 3 === 0;
      return `<button type="button" class="museum-shape shape-${i % 2} color-${blue ? 'blue' : 'peach'}" data-space="museum-shape" data-value="${i}" aria-label="${round ? 'Круг' : 'Квадрат'}, ${blue ? 'синий' : 'персиковый'}, фигура ${i + 1}${picked ? ' (выбрана)' : ''}. Нажми Enter или Пробел, чтобы ${picked ? 'отменить выбор' : 'выбрать'}" aria-pressed="${picked}"><svg viewBox="0 0 100 90" aria-hidden="true" focusable="false">${round ? '<circle cx="50" cy="43" r="28"/>' : '<rect x="23" y="16" width="54" height="54" rx="4"/>'}</svg><span class="museum-shape-name">${round ? 'Круг' : 'Квадрат'} · ${blue ? 'синий' : 'персиковый'}</span><span class="museum-selection">${picked ? 'Выбрано' : 'Выбрать'}</span></button>`;
    }).join('')}</div>
    <p id="museum-feedback" class="museum-feedback" role="status" aria-live="polite">${feedback}</p>
    <div class="museum-actions">${!byColor ? '<button type="button" class="btn" data-space="museum-rule">Теперь выбрать по цвету</button>' : ''}${explanationButton()}</div>
    <p class="small-text muted museum-disclaimer">Научно-популярная иллюстрация на вымышленном примере. Не является тестом способностей, оценкой или доказательством эффективности игры.</p>
  </section>`;
}

function choiceView(stage: number, selected: number[]): string {
  const count = stage > 1 ? 9 : 3;
  const chosen = selected.slice().reverse().find(value => Number.isInteger(value) && value >= 0 && value < count);
  const card = chosen === undefined ? undefined : postcards[chosen];
  return `<section class="museum-experiment museum-choice" aria-label="Выбор открытки">
    <p class="museum-instruction">${stage > 1 ? 'На полке теперь девять открыток. Первые три на прежних местах.' : 'На полке три открытки со станции.'} Выбери одну, чтобы рассмотреть поближе.<br><span id="museum-postcards-kbd" class="museum-kbd-tip small-text muted">Клавиатура: стрелки — выбор открытки; Enter или Пробел — рассмотреть; Home/End — первая/последняя.</span></p>
    <div class="museum-postcards" role="group" aria-label="Открытки со станции" aria-describedby="museum-postcards-kbd">${postcards.slice(0, count).map((postcard, i) => `<button type="button" class="museum-postcard" data-space="museum-postcard" data-value="${i}" aria-label="Открытка ${i + 1} из ${count}: «${postcard.name}»${chosen === i ? ' (выбрана)' : ''}. Нажми Enter или Пробел, чтобы рассмотреть" aria-pressed="${chosen === i}"><span class="museum-postcard-picture">${postcardArt(i)}</span><span class="museum-postcard-name">${postcard.name}</span><span class="museum-selection">${chosen === i ? 'Выбрано' : 'Рассмотреть'}</span></button>`).join('')}</div>
    ${card && chosen !== undefined ? `<figure class="museum-chosen-postcard"><div role="img" aria-label="${card.name}">${postcardArt(chosen)}</div><figcaption><strong>${card.name}</strong><span>${card.caption}</span></figcaption></figure>` : ''}
    <p id="museum-feedback" class="museum-feedback" role="status" aria-live="polite">${card ? `Ты выбрал открытку «${card.name}». ${stage > 1 ? 'Поменялось ли что-нибудь, когда вариантов стало больше?' : 'Можно выбрать другую или добавить открытки.'}` : 'Выбери открытку или посмотри объяснение.'}</p>
    <div class="museum-actions">${stage <= 1 ? '<button type="button" class="btn" data-space="museum-more">Добавить ещё шесть открыток</button>' : ''}${explanationButton()}</div>
    <p class="small-text muted museum-disclaimer">Научно-популярная иллюстрация на вымышленном примере. Не является тестом способностей, оценкой или доказательством эффективности игры.</p>
  </section>`;
}

export function renderMuseumExperiment(kind: 'memory' | 'attention' | 'choice', stage: number, selected: number[]): string {
  if (kind === 'memory') return memoryView(selected);
  if (kind === 'attention') return attentionView(stage, selected);
  return choiceView(stage, selected);
}
