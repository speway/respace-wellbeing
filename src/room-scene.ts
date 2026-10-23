export function roomScene(activity:'read'|'tea'|'rest',page:number,tea:string):string {
  if(activity==='read'){
    const pages=[
      'Смотритель маяка каждый вечер пересчитывал огни на орбите. Однажды один огонёк не появился. Он достал блокнот и записал: «Сегодня не все звёзды на работе».',
      'Утром в дверь постучал почтальон. Пропавший огонёк оказался его фонарём: вчера он остановился у друзей и вернулся домой другой тропинкой.',
      'Смотритель убрал таблицу огней в ящик. Маяк продолжал светить. Теперь иногда он просто смотрел в окно, даже если ничего не требовалось пересчитывать.',
    ];
    return `<section class="room-small-scene"><h3>Из записок смотрителя маяка</h3><p class="small-text muted">Страница ${page+1} из 3</p><p role="status">${pages[page]}</p><div>${page?'<button class="text-button" data-space="room-page" data-value="-1">Предыдущая страница</button>':''}${page<2?'<button class="btn secondary small" data-space="room-page" data-value="1">Перевернуть страницу</button>':'<span class="small-text">Конец.</span>'}</div></section>`;
  }
  if(activity==='tea'){
    const detail=tea==='mint'?'Ри кладёт в кружку лист мяты. Пар пахнет садом, хотя за окном сейчас космос.':tea==='ginger'?'Ри добавляет кусочек имбиря. В пару будто появляются крошечные золотые искры.':tea==='plain'?'Ри оставляет чай как есть. За окном проплывает облако, похожее на заварочный чайник.':'На полке есть мята и имбирь. Можно добавить что-нибудь или оставить чай как есть.';
    return `<section class="room-small-scene"><h3>Что положим в чай?</h3><p role="status">${detail}</p><div role="group" aria-label="Чай для Ри">${[['mint','Лист мяты'],['ginger','Немного имбиря'],['plain','Только чай']].map(([id,label])=>`<button class="btn secondary small" data-space="room-tea" data-value="${id}" aria-pressed="${tea===id}">${label}</button>`).join('')}</div></section>`;
  }
  return '<section class="room-small-scene"><h3>Вечер у окна</h3><p>По орбите идёт трамвай. В одном окне кто-то читает, в другом отражается луна. Ри оставляет для него немного света.</p><p class="small-text muted">Вид за окном меняется в «Обстановке».</p></section>';
}
