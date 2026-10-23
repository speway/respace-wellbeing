import {validateMail,type MailState} from './mail-model.ts';

export interface RoomItem { kind: string; slot: number; rotation: number; }
export interface ExperienceData {
  lessons: { id: string; step: number; completed: boolean }[];
  favorites: string[];
  room: { theme: number; palette: number; items: RoomItem[]; activity?: 'read'|'tea'|'rest' };
  stars: { shape: number; edges: [number, number][]; title: string; points?: [number, number][]; color?: string };
  story?: {stage:number; choices:number[]};
  museum?: {kind:'memory'|'attention'|'choice';stage:1|2;selected:number[]};
  mail?: MailState;
}
export const ROOM_KINDS = ['chair','desk','lamp','cup','plant','books','rug','picture','controller','headphones','robot','blanket'];
export const STAR_SHAPES: [number, number][][] = [[[28,28],[70,28],[70,43],[85,43],[85,60],[70,60],[65,76],[34,76],[28,48]],[[24,65],[30,28],[44,42],[61,42],[73,28],[78,65],[66,79],[37,79]],[[22,76],[43,28],[65,16],[79,36],[59,70],[35,62]],[[16,28],[36,21],[56,26],[78,18],[21,46],[43,43],[63,49],[83,42],[15,69],[37,72],[58,66],[79,73],[23,87],[47,85],[68,89],[89,85]]];
export const STAR_COLORS = ['#b9d0d6', '#e5c1ee', '#f2d28c', '#a9dfc2'];
export function starPoints(stars: ExperienceData['stars']): [number, number][] {
  return stars.shape === 3 && stars.points ? stars.points : STAR_SHAPES[stars.shape];
}
export function initialExperience(): ExperienceData {
  return { lessons: [], favorites: [], room: {theme:0,palette:0,items:[{kind:'chair',slot:4,rotation:0},{kind:'plant',slot:6,rotation:0},{kind:'lamp',slot:2,rotation:0}]}, stars:{shape:0,edges:[],title:''} };
}
function integer(n: unknown,min:number,max:number): n is number {return typeof n==='number'&&Number.isInteger(n)&&n>=min&&n<=max;}
export function validateExperience(value: unknown): ExperienceData {
  const v=value as ExperienceData;
  if(!v||!Array.isArray(v.lessons)||v.lessons.length>12||!Array.isArray(v.favorites)||v.favorites.length>10||!v.room||!v.stars)throw new Error('Некорректные данные пространства.');
  const lessons=v.lessons.map(l=>{if(!l||!/^l(?:[1-9]|1[0-2])$/.test(l.id)||!integer(l.step,0,5)||typeof l.completed!=='boolean')throw new Error('Некорректный прогресс урока.');return {id:l.id,step:l.step,completed:l.completed};});
  if(new Set(lessons.map(l=>l.id)).size!==lessons.length)throw new Error('Повторяющийся урок.');
  if(!v.favorites.every(f=>typeof f==='string'&&/^fact(?:[1-9]|10)$/.test(f)))throw new Error('Некорректное избранное.');
  const r=v.room;
  if(r.activity!==undefined&&!['read','tea','rest'].includes(r.activity))throw new Error('Некорректное занятие в комнате.');
  if(!integer(r.theme,0,2)||!integer(r.palette,0,3)||!Array.isArray(r.items)||r.items.length>12)throw new Error('Некорректная комната.');
  const items=r.items.map(i=>{if(!i||!ROOM_KINDS.includes(i.kind)||!integer(i.slot,0,8)||!integer(i.rotation,0,3))throw new Error('Некорректный предмет комнаты.');return {kind:i.kind,slot:i.slot,rotation:i.rotation};});
  if(new Set(items.map(i=>i.kind)).size!==items.length||new Set(items.map(i=>i.slot)).size!==items.length)throw new Error('Предметы комнаты пересекаются.');
  const s=v.stars;
  if(!integer(s.shape,0,3)||typeof s.title!=='string'||s.title.length>80||!Array.isArray(s.edges)||s.edges.length>120)throw new Error('Некорректное созвездие.');
  if(s.points!==undefined && (s.shape!==3 || !Array.isArray(s.points) || s.points.length>16 || !s.points.every(p=>Array.isArray(p)&&p.length===2&&integer(p[0],5,95)&&integer(p[1],5,95))))throw new Error('Некорректные точки неба.');
  if(s.color!==undefined && !STAR_COLORS.includes(s.color))throw new Error('Некорректный цвет неба.');
  const pointCount=starPoints(s).length;
  const edges=s.edges.map(e=>{if(!Array.isArray(e)||e.length!==2||!integer(e[0],0,15)||!integer(e[1],0,15)||e[0]===e[1])throw new Error('Некорректная линия созвездия.');return [Math.min(...e),Math.max(...e)] as [number,number];});
  if(new Set(edges.map(e=>e.join('-'))).size!==edges.length)throw new Error('Повторяющиеся линии созвездия.');
  if(edges.some(e=>e.some(i=>i>=pointCount)))throw new Error('Линия ссылается на отсутствующую звезду.');
  if(v.story!==undefined&&(!v.story||!integer(v.story.stage,0,3)||!Array.isArray(v.story.choices)||v.story.choices.length!==v.story.stage||!v.story.choices.every(c=>integer(c,0,2))))throw new Error('Некорректная история.');
  const m=v.museum;
  if(m!==undefined){
    if(!m||!['memory','attention','choice'].includes(m.kind)||!integer(m.stage,1,2)||!Array.isArray(m.selected))throw new Error('Некорректное сохранение музея.');
    const max=m.kind==='memory'?1:m.kind==='attention'?5:m.stage===1?2:8;
    if(m.selected.length>(m.kind==='attention'?6:1)||!m.selected.every(n=>integer(n,0,max))||new Set(m.selected).size!==m.selected.length)throw new Error('Некорректный выбор экспоната.');
  }
  const mail=v.mail===undefined?undefined:validateMail(v.mail);
  return {lessons,favorites:[...new Set(v.favorites)],room:{theme:r.theme,palette:r.palette,items,...(r.activity!==undefined?{activity:r.activity}:{})},stars:{shape:s.shape,edges,title:s.title,...(s.points!==undefined?{points:s.points.map(p=>[...p] as [number,number])}:{}),...(s.color!==undefined?{color:s.color}:{})},...(v.story?{story:{stage:v.story.stage,choices:[...v.story.choices]}}:{}),...(m?{museum:{kind:m.kind,stage:m.stage,selected:[...m.selected]}}:{}),...(mail?{mail}:{})};
}
export function connectStars(edges: [number,number][],a:number,b:number): [number,number][] {
  if(a===b)return edges;
  const edge:[number,number]=[Math.min(a,b),Math.max(a,b)];
  return edges.some(e=>e[0]===edge[0]&&e[1]===edge[1])?edges:[...edges,edge];
}
export function placeRoomItem(items:RoomItem[],kind:string,slot:number):RoomItem[] {
  const previous=items.find(i=>i.kind===kind);
  return [...items.filter(i=>i.kind!==kind&&i.slot!==slot),{kind,slot,rotation:previous?.rotation??0}];
}
