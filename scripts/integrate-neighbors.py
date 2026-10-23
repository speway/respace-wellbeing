from pathlib import Path
p=Path('src/neighbors.ts');s=p.read_text(encoding='utf-8');s="import './neighbors.css';\n"+s;p.write_text(s,encoding='utf-8')
p=Path('src/home.ts');s=p.read_text(encoding='utf-8').replace("import {ri}","import {neighbors} from './neighbors';\nimport {ri}",1).replace('${stationMap(data,icon)}','${stationMap(data,icon)}${neighbors()}',1);p.write_text(s,encoding='utf-8')
p=Path('src/space.ts');s=p.read_text(encoding='utf-8');s=s.replace("import {roomScene}","import {neighbors,neighborSprite} from './neighbors';\nimport {initialMail,swapMail,getMailFeedback,type MailState} from './mail-model';\nimport {renderMail} from './mail-view';\nimport {roomScene}",1)
s=s.replace("let skyFrom=0;", "let skyGuest=false;let mail=initialMail();let mailSelected:number|null=null;let mailChecked=false;let mailHistory:MailState[]=[];\n  let skyFrom=0;",1)
s=s.replace('<p class="eyebrow">${label}</p>','')
a=s.index('  function playPage()');b=s.index('  function refreshStation()',a)
s=s[:a]+'''  function playPage(){return `<div class="station-welcome"><h1>Занятия на станции</h1></div>${stationMap(host.get(),I)}${neighbors()}`;}
''' +s[b:]
s=s.replace('<p class="eyebrow">МАЛЕНЬКОЕ НЕБО ДЛЯ СЕБЯ</p><h2 id="modal-title">Дорога для светлячка</h2><p class="muted">Светлячок ходит только по твоим линиям. Соедини звёзды и проведи его от одной до другой. Можно оставить небо просто рисунком.</p>', '<h2 id="modal-title">${skyGuest?\'Переправа Нори\':\'Дорога для светлячка\'}</h2>${skyGuest?`<div class="neighbor-line">${neighborSprite(\'nori\',1)}<p>Соедини две дорожки. Светлячку нужно от звезды 1 к звезде 4.</p></div>`:\'<p class="muted">Соединяй звёзды, затем выбери начало и конец пути.</p>\'}')
s=s.replace('<select id="star-shape">','<select id="star-shape" ${skyGuest?\'disabled\':\'\'}>')
s=s.replace("${free?`<p class=\"small-text muted\">Соединяйте", "${free&&!skyGuest?`<p class=\"small-text muted\">Соединяй",1)
s=s.replace("${free?'data-custom-sky=\"true\"':''}","${free&&!skyGuest?'data-custom-sky=\"true\"':''}")
s=s.replace("${free?`<div class=\"sky-tools\">", "${free&&!skyGuest?`<div class=\"sky-tools\">",1)
s=s.replace('${points.length?\'\':\'disabled\'}>${points.map', '${points.length&&!skyGuest?\'\':\'disabled\'}>${points.map',1)
s=s.replace("Светлячок добрался. Эту дорогу можно сохранить вместе с небом.","Светлячок добрался.")
s=s.replace("Между этими звёздами пока нет дороги. Добавь соединение или выбери другую пару.","Путь оборван. Соедини участки линией.")
s=s.replace("Выбери начало и конец. Путь будет идти по уже нарисованным линиям.","Нажми «Найти путь», когда линии будут соединены.")
s=s.replace("Сохранить созвездие</button></div>`,true);", "${skyGuest?'Сохранить это небо':'Сохранить небо'}</button></div>${skyGuest?'<button class=\"text-button guest-return\" data-space=\"stars\">Открыть своё небо</button>':''}`,true);",1)
# Give the story its new recurring postal robot; old numeric save meanings stay unchanged.
s=s.replace("`<div class=\"story-guest guest-robot\">${roomObject('robot')}</div>`", "`<div class=\"story-guest guest-robot\">${neighborSprite('bip',1)}</div>`")
s=s.replace("Остановка сохранена на устройстве.","Сохранено.")
s=s.replace("Не получилось сохранить остановку. Выбор не изменён. Проверьте хранилище в настройках и попробуйте ещё раз.","Не удалось сохранить выбор. Проверь хранилище в настройках и попробуй ещё раз.")
s=s.replace("Любопытно, как мы устроены","Музей наблюдений").replace("Память, внимание, эмоции и видеоигры. Короткие карточки с источниками.","Короткие наблюдения о памяти, внимании и играх.")
s=s.replace("Любопытство — уже хороший повод","Что здесь происходит?").replace("Открой один факт или загляни в музей идей. Здесь нет экзамена.","Открой карточку или проверь идею на экспонате.")
s=s.replace("Небольшие иллюстрации научных идей. Можно просто посмотреть объяснение.","Выбери экспонат.")
s=s.replace('<p class="eyebrow">ЛЮБОПЫТНАЯ ИЛЛЮСТРАЦИЯ · НЕ ТЕСТ</p>','')
s=s.replace('<p class="practice-source">Мы не измеряем вашу память, внимание или психологический профиль. Это иллюстрация, а не воспроизведение исследования.</p>','')
a=s.index("  function unsavedArtifact()")
intro='''  function showNeighborIntro(kind:'bip'|'nori'){
    const mailIntro=kind==='bip';replaceModal(`<div class="neighbor-intro">${neighborSprite(kind,1)}<h2 id="modal-title">${mailIntro?'Почта Бипа':'Переправа Нори'}</h2><p>${mailIntro?'Три посылки и две подсказки. Поменяй посылки местами, чтобы собрать отправку.':'Светлячок застрял на короткой дорожке. Соедини её со второй и проведи его до конца.'}</p><button class="btn" data-space="${mailIntro?'mail-start':'nori-start'}">${mailIntro&&getSpace().mail?'Продолжить отправку':mailIntro?'Разложить посылки':'Построить переправу'}</button><button class="text-button" data-action="close">На станцию</button></div>`);
  }
  function showMail(){
    const dialog=document.querySelector<HTMLDialogElement>('#modal');const scroll=dialog?.scrollTop??0;
    const active=document.activeElement as HTMLElement|null;const keep=active?.dataset.space;const value=active?.dataset.value;
    replaceModal(`<h2 id="modal-title" class="sr-only">Почта Бипа</h2>${renderMail(mail,mailSelected,mailChecked,mailHistory.length>0)}<p class="mail-save-status" role="status">${JSON.stringify(mail)===JSON.stringify(getSpace().mail)?'Полка сохранена.':''}</p>`,true);
    if(keep?.startsWith('mail-')){document.querySelector<HTMLElement>(`[data-space="${keep}"]${value!==undefined?`[data-value="${value}"]`:''}`)?.focus({preventScroll:true});if(dialog)dialog.scrollTop=scroll;}
  }
  function mailSnapshot(){mailHistory.push(structuredClone(mail));if(mailHistory.length>20)mailHistory.shift();mailChecked=false;}
'''
s=s[:a]+intro+s[a:]
s=s.replace("'room'|'stars'|null", "'room'|'stars'|'mail'|null")
s=s.replace("    return null;\n  }\n  function offerSave", "    if(dialog.querySelector('.mail-game')||dialog.querySelector('[data-artifact=\"mail\"]')){if(JSON.stringify(mail)!==JSON.stringify(getSpace().mail??initialMail()))return 'mail';}\n    return null;\n  }\n  function offerSave",1)
s=s.replace("function offerSave(kind:'room'|'stars')", "function offerSave(kind:'room'|'stars'|'mail')")
s=s.replace("${kind==='room'?'В комнате':'В небе'}", "${kind==='room'?'В комнате':kind==='stars'?'В небе':'На почтовой полке'}")
s=s.replace("if(input.hasAttribute('data-match-row'))", "if(input.id==='mail-task'){mailSnapshot();mail=initialMail(Number(input.value));mailSelected=null;showMail();}if(input.hasAttribute('data-match-row'))",1)
s=s.replace("case 'artifact-return':if(value==='room')showRoom();else showStars();", "case 'artifact-return':if(value==='room')showRoom();else if(value==='stars')showStars();else showMail();")
s=s.replace("case 'artifact-discard':roomDirty=false;stars=", "case 'artifact-discard':mail=structuredClone(getSpace().mail??initialMail());roomDirty=false;stars=")
s=s.replace("else s.stars=structuredClone(stars);", "else if(value==='stars')s.stars=structuredClone(stars);else s.mail=structuredClone(mail);",1)
s=s.replace("      case 'lesson':openLesson", "      case 'mail':showNeighborIntro('bip');break;\n      case 'mail-start':mail=structuredClone(getSpace().mail??initialMail());mailSelected=null;mailChecked=getMailFeedback(mail).done;mailHistory=[];showMail();break;\n      case 'mail-slot':if(mailSelected===null)mailSelected=Number(value);else{mailSnapshot();mail=swapMail(mail,mailSelected,Number(value));mailSelected=null;}showMail();break;\n      case 'mail-check':mailChecked=true;showMail();break;\n      case 'mail-save':if(saveSpace(s=>{s.mail=structuredClone(mail);})){showMail();host.toast('Полка сохранена.');}break;\n      case 'mail-undo':{const before=mailHistory.pop();if(before){mail=before;mailSelected=null;mailChecked=false;showMail();}break;}\n      case 'nori':showNeighborIntro('nori');break;\n      case 'nori-start':skyGuest=true;stars={shape:3,points:[[15,72],[38,33],[62,68],[85,28]],edges:[[0,1],[2,3]],title:''};skyFrom=0;skyTo=3;skyRoute=null;skyStep=0;skyAttempted=false;skyTopology='';starHistory=[];starFuture=[];starSelected=null;showStars();break;\n      case 'lesson':openLesson",1)
s=s.replace("case 'stars':skyRoute", "case 'stars':skyGuest=false;skyRoute",1)
s=s.replace("  return {homeTiles,coursePage,playPage,sciencePage};", "  function requestClose(){const dirty=unsavedArtifact();if(dirty)offerSave(dirty);else host.close();}\n  return {homeTiles,coursePage,playPage,sciencePage,requestClose};")
p.write_text(s,encoding='utf-8')
p=Path('src/station.ts');s=p.read_text(encoding='utf-8');s=s.replace('<p class="station-caption">То, что ты сохранишь в комнате и небе, останется на станции. Можно продолжить в другой раз.</p>','');p.write_text(s,encoding='utf-8')
p=Path('vite.config.ts');s=p.read_text(encoding='utf-8').replace("'/art/firefly.png'", "'/art/neighbors.png', '/art/firefly.png'");p.write_text(s,encoding='utf-8')
p=Path('src/main.ts');s=p.read_text(encoding='utf-8').replace("import { createMotion }", "import { initNative } from './native';\nimport { createMotion }",1).replace('render();\nvoid account.init();',"render();\nvoid initNative(()=>{if(document.querySelector<HTMLDialogElement>('#modal')?.open){space.requestClose();return true;}if(page!=='today'){page='today';history.pushState(null,'','#today');render();return true;}return false;}).catch(()=>toast('Не удалось запустить часть функций приложения.'));\nvoid account.init();",1);p.write_text(s,encoding='utf-8')
