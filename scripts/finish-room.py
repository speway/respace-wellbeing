from pathlib import Path
p=Path('src/space.ts');s=p.read_text(encoding='utf-8')
s=s.replace("import {renderMuseumExperiment}","import {roomScene} from './room-scene';\nimport {renderMuseumExperiment}")
s=s.replace("let room=structuredClone", "let roomPage=0;let roomTea='';\n  let room=structuredClone",1)
s=s.replace("function showRoom(){const activity=getRoomActivity(room);replaceModal", "function showRoom(){const activity=getRoomActivity(room);const dialog=document.querySelector<HTMLDialogElement>('#modal');const scroll=dialog?.scrollTop??0;const active=document.activeElement as HTMLElement|null;const keep=active?.dataset.space;const keepValue=active?.dataset.value;replaceModal")
s=s.replace('<div class="room-bottom"><span class="small-text muted">${roomDirty?', '${room.activity&&activity.available?roomScene(room.activity,roomPage,roomTea):\'\'}<div class="room-bottom"><span class="small-text muted">${roomDirty?',1)
s=s.replace("Сохранить комнату</button></div>`,true);}", "Сохранить комнату</button></div>`,true);if(keep?.startsWith('room-')){document.querySelector<HTMLElement>(`[data-space=\"${keep}\"]${keepValue!==undefined?`[data-value=\"${keepValue}\"]`:''}`)?.focus({preventScroll:true});if(dialog)dialog.scrollTop=scroll;}}",1)
s=s.replace("case 'room':room=", "case 'room':roomPage=0;roomTea='';room=")
s=s.replace("case 'room-activity':roomSnapshot();", "case 'room-page':roomPage=Math.min(2,Math.max(0,roomPage+Number(value)));showRoom();break;\n      case 'room-tea':roomTea=value;showRoom();break;\n      case 'room-activity':roomPage=0;roomTea='';roomSnapshot();")
# A close gesture should offer save/discard/continue for actual unsaved artwork.
a=s.index("  root.addEventListener('change'")
s=s[:a]+'''  function unsavedArtifact(): 'room'|'stars'|null {
    const dialog=document.querySelector<HTMLDialogElement>('#modal');if(!dialog?.open)return null;
    if((dialog.querySelector('.room-canvas')||dialog.querySelector('[data-artifact="room"]'))&&roomDirty)return 'room';
    if(dialog.querySelector('.star-canvas')||dialog.querySelector('[data-artifact="stars"]')){captureStar();if(JSON.stringify(stars)!==JSON.stringify(getSpace().stars))return 'stars';}
    return null;
  }
  function offerSave(kind:'room'|'stars'){replaceModal(`<div data-artifact="${kind}"><h2 id="modal-title">Сохранить перед уходом?</h2><p>${kind==='room'?'В комнате':'В небе'} остались изменения. Можно сохранить их, продолжить или оставить предыдущее сохранение.</p><div class="modal-actions"><button class="btn" data-space="artifact-save-close" data-value="${kind}">Сохранить и выйти</button><button class="btn secondary" data-space="artifact-return" data-value="${kind}">Продолжить</button><button class="text-button" data-space="artifact-discard" data-value="${kind}">Выйти без сохранения</button></div></div>`);}
  root.addEventListener('click',e=>{const el=e.target as HTMLElement;const dialog=el.closest<HTMLDialogElement>('#modal');if(!dialog)return;const r=dialog.getBoundingClientRect();const outside=el===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);if(el.closest('[data-action="close"]')||outside){const dirty=unsavedArtifact();if(dirty){e.preventDefault();e.stopImmediatePropagation();offerSave(dirty);}}},true);
  root.addEventListener('cancel',e=>{const dirty=unsavedArtifact();if(dirty){e.preventDefault();offerSave(dirty);}},true);
  window.addEventListener('beforeunload',e=>{if(unsavedArtifact()){e.preventDefault();e.returnValue='';}});
''' +s[a:]
s=s.replace("      case 'lesson':openLesson", "      case 'artifact-return':if(value==='room')showRoom();else showStars();break;\n      case 'artifact-discard':roomDirty=false;stars=structuredClone(getSpace().stars);host.close();break;\n      case 'artifact-save-close':if(saveSpace(s=>{if(value==='room')s.room=structuredClone(room);else s.stars=structuredClone(stars);})){roomDirty=false;refreshStation();host.close();host.toast('Сохранено на устройстве.');}break;\n      case 'lesson':openLesson",1)
p.write_text(s,encoding='utf-8')
p=Path('src/world.css');s=p.read_text(encoding='utf-8');s+='''
.room-small-scene{margin:18px 0;padding:18px 22px;background:#f5f7ff;border-radius:18px;color:#334864}.room-small-scene h3{font-size:18px;margin:0 0 8px}.room-small-scene p{line-height:1.7;font-size:15px}.room-small-scene>div{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.room-small-scene button[aria-pressed=true]{background:#dcefe9;border-color:#62a494}.room-small-scene .small-text{font-size:12px}dialog{overscroll-behavior:contain}.station-door,.room-activities button,.museum-experiment button{touch-action:manipulation}.story-dialogue,.station-caption{overflow-wrap:anywhere}
''';p.write_text(s,encoding='utf-8')
