import {escapeHtml as esc, type AppData} from './domain';
import {initialExperience, ROOM_KINDS, starPoints} from './experience-model';

export function roomObject(kind:string):string {
  const n=ROOM_KINDS.indexOf(kind);if(n<0)return '';
  const rows=[[0,420],[420,740],[740,1086]];
  const [top,bottom]=rows[Math.floor(n/4)];const height=bottom-top;
  return `<span class="room-object" style="background-size:400% ${1086/height*100}%;background-position:${n%4*100/3}% ${top/(1086-height)*100}%" aria-hidden="true"></span>`;
}
export function stationMap(data:AppData,icon:(n:string)=>string):string {
  const space=data.space??initialExperience();const stars=space.stars;const points=starPoints(stars);
  const title=data.space?.story?.stage===3?'Сходить на причал':data.space?.story?.stage?'Продолжить историю':'Разобраться с посылкой';
  return `<section class="station-map" aria-label="Места на тихой орбите"><div class="station-landscape"><div class="station-art"><img src="/art/station.png" alt="" width="1536" height="1024" fetchpriority="high"/>
    <div class="station-room-preview" aria-hidden="true">${space.room.items.map(item=>`<span class="station-item" style="left:${(item.slot%3)*29}%;top:${Math.floor(item.slot/3)*24}%;rotate:${item.rotation*15}deg">${roomObject(item.kind)}</span>`).join('')}</div>
    ${stars.edges.length?`<svg class="station-sky-preview" viewBox="0 0 100 100" aria-hidden="true">${stars.edges.map(([a,b])=>`<line x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}"/>`).join('')}${points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</svg>`:''}
    </div><div class="station-entrances"><button class="station-door door-room" data-space="room">${icon('Armchair')}<span>В гости к Ри</span></button><button class="station-door door-stars" data-space="stars">${icon('Sparkles')}<span>Помочь Нори со светлячком</span></button><button class="station-door door-story" data-space="story">${icon('Gamepad2')}<span>${esc(title)}</span></button><button class="station-door door-museum" data-space="museum">${icon('BookOpen')}<span>Зайти в музей наблюдений</span></button></div>
  </div></section>`;
}
