import { auth,pool } from './auth.ts';
import { validateCloud } from '../src/cloud-model.ts';

const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handle(request:Request):Promise<Response> {
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/auth/')){
    const r=await auth.handler(request);r.headers.set('Cache-Control','no-store');return r;
  }
  if(url.pathname!=='/api/progress')return response({error:'Не найдено.'},404);
  if(!['GET','PUT','DELETE'].includes(request.method))return response({error:'Метод не поддерживается.'},405);
  if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)return response({error:'Недопустимый источник запроса.'},403);
  try {
    const session=await auth.api.getSession({headers:request.headers});
    if(!session)return response({error:'Войдите в аккаунт.'},401);
    const id=session.user.id;
    if(request.method==='GET'){
      const rows=await pool.query('SELECT payload, revision, updated_at FROM respace_progress WHERE user_id=$1',[id]);
      const row=rows.rows[0];return response(row?{progress:validateCloud(row.payload),revision:row.revision,updatedAt:row.updated_at}:{progress:null,revision:0});
    }
    if(request.method==='DELETE'){
      await pool.query('DELETE FROM respace_progress WHERE user_id=$1',[id]);return response({deleted:true});
    }
    if(!request.headers.get('content-type')?.startsWith('application/json'))return response({error:'Нужен JSON.'},415);
    const raw=await request.text();if(raw.length>2_000_000)return response({error:'Сохранение превышает 2 МБ. Скачайте локальную копию.'},413);
    let body: {progress:unknown;revision:number};let clean;
    try{body=JSON.parse(raw);if(!Number.isSafeInteger(body.revision)||body.revision<0)throw new Error('Некорректная версия.');clean=validateCloud(body.progress);}catch{return response({error:'Некорректное сохранение.'},400);}
    const saved=body.revision===0
      ? await pool.query('INSERT INTO respace_progress(user_id,payload,revision) VALUES($1,$2,1) ON CONFLICT(user_id) DO NOTHING RETURNING revision,updated_at',[id,JSON.stringify(clean)])
      : await pool.query('UPDATE respace_progress SET payload=$2,revision=revision+1,updated_at=now() WHERE user_id=$1 AND revision=$3 RETURNING revision,updated_at',[id,JSON.stringify(clean),body.revision]);
    if(!saved.rowCount)return response({error:'На другом устройстве есть более новое сохранение. Выберите, как объединить прогресс.'},409);
    return response({revision:saved.rows[0].revision,updatedAt:saved.rows[0].updated_at});
  }catch{return response({error:'Облако временно недоступно. Локальное сохранение остаётся на устройстве.'},503);}
}
