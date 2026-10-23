import type {RoomItem} from './experience-model';

export interface RoomActivity {available:boolean;pose:'read'|'calm'|'rest';slot:number;note:string;}
export function getRoomActivity(room:{items:RoomItem[];activity?:'read'|'tea'|'rest'}):RoomActivity {
  const chair=room.items.find(item=>item.kind==='chair');
  if(room.activity==='read'){
    const books=room.items.find(item=>item.kind==='books');
    return books
      ?{available:true,pose:'read',slot:chair?.slot??books.slot,note:'Ри открывает книгу. Закладкой сегодня работает билет с орбитального трамвая.'}
      :{available:false,pose:'calm',slot:4,note:'Ри ищет книгу. Поставьте книги в комнату, чтобы открыть одну вместе.'};
  }
  if(room.activity==='tea'){
    const cup=room.items.find(item=>item.kind==='cup');
    return cup
      ?{available:true,pose:'calm',slot:chair?.slot??cup.slot,note:'Ри устраивается с кружкой. Чайный пар рисует крошечную орбиту.'}
      :{available:false,pose:'calm',slot:4,note:'Для чая нужна кружка. Её можно поставить из набора вещей.'};
  }
  if(room.activity==='rest'){
    const blanket=room.items.find(item=>item.kind==='blanket');
    return {available:true,pose:'rest',slot:chair?.slot??blanket?.slot??4,note:'Ри устраивается поудобнее и смотрит в окно. Проходящие спутники не требуют ответа.'};
  }
  return {available:true,pose:'calm',slot:4,note:'Ри осматривается. Можно открыть книгу, налить чай или устроиться у окна.'};
}

// Undirected BFS follows the player's lines; it never adds missing connections.
export function findSkyRoute(edges:[number,number][],start:number,end:number,pointCount:number):number[]|null {
  const validPoint=(point:unknown):point is number=>typeof point==='number'&&Number.isSafeInteger(point)&&point>=0&&point<pointCount;
  if(!Number.isSafeInteger(pointCount)||pointCount<0||!validPoint(start)||!validPoint(end)){
    throw new Error('Выбери две существующие звезды.');
  }
  if(!Array.isArray(edges))throw new Error('Некорректные линии неба.');
  const neighbors=new Map<number,number[]>();
  for(const edge of edges){
    if(!Array.isArray(edge)||edge.length!==2||!validPoint(edge[0])||!validPoint(edge[1])){
      throw new Error('Линия должна соединять существующие звезды.');
    }
    const [a,b]=edge;
    if(!neighbors.has(a))neighbors.set(a,[]);
    if(!neighbors.has(b))neighbors.set(b,[]);
    neighbors.get(a)!.push(b);
    neighbors.get(b)!.push(a);
  }
  if(start===end)return [start];
  const previous=new Map<number,number|null>([[start,null]]);
  const queue=[start];
  for(let cursor=0;cursor<queue.length;cursor++){
    const point=queue[cursor];
    for(const next of neighbors.get(point)??[]){
      if(previous.has(next))continue;
      previous.set(next,point);
      if(next===end){
        const route:number[]=[];
        let current:number|null=end;
        while(current!==null){
          route.push(current);
          current=previous.get(current)!;
        }
        return route.reverse();
      }
      queue.push(next);
    }
  }
  return null;
}
