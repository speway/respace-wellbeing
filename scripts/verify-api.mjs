import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {initialData} from '../src/domain.ts';
import {initialExperience} from '../src/experience-model.ts';
import {cloudPayload} from '../src/cloud-model.ts';
const base=process.argv[2]||'http://127.0.0.1:5173';
const cookies=res=>res.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');
const call=async(path,method='GET',body,cookie='',origin=true)=>{
  const r=await fetch(base+path,{method,headers:{...(origin?{Origin:base}:{}),...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,data:await r.json(),cookie:cookies(r)};
};
assert.equal((await call('/api/auth/ok')).data.ok,true);
assert.equal((await call('/api/progress')).status,401);
const accounts=[];
try {
for(let i=0;i<2;i++){
  const creds={email:`qa-${Date.now()}-${i}@example.invalid`,password:randomBytes(24).toString('base64url'),name:'Проверка прототипа'};
  const result=await call('/api/auth/sign-up/email','POST',creds);assert.equal(result.status,200,JSON.stringify(result.data));assert.ok(result.cookie);
  accounts.push({...creds,cookie:result.cookie});
}
const [a,b]=accounts;
const d=initialData();d.space=initialExperience();d.space.lessons=[{id:'l1',step:0,completed:true}];d.entries=[];d.goal='PRIVATE-QA-MARKER';
d.space.room.items.push({kind:'books',slot:1,rotation:0});d.space.room.activity='read';
d.space.museum={kind:'choice',stage:2,selected:[8]};d.space.mail={task:0,order:[2,0,1]};
const payload=cloudPayload(d,false);
let result=await call('/api/progress','PUT',{revision:0,progress:payload},a.cookie);assert.equal(result.status,200);assert.equal(result.data.revision,1);
assert.equal((await call('/api/progress','PUT',{revision:0,progress:payload},a.cookie)).status,409);
assert.equal((await call('/api/progress','PUT',{revision:1,progress:payload},a.cookie,false)).status,403);
let retrieved=await call('/api/progress','GET',undefined,a.cookie);assert.equal(retrieved.data.progress.space.lessons[0].completed,true);assert.equal('personal' in retrieved.data.progress,false);
assert.equal(retrieved.data.progress.space.room.activity,'read');
assert.deepEqual(retrieved.data.progress.space.museum,d.space.museum);assert.deepEqual(retrieved.data.progress.space.mail,d.space.mail);
assert.equal((await call('/api/progress','GET',undefined,b.cookie)).data.progress,null);
assert.equal((await call('/api/progress','PUT',{revision:1,progress:{space:{}}},a.cookie)).status,400);
result=await call('/api/progress','PUT',{revision:1,progress:cloudPayload(d,true)},a.cookie);assert.equal(result.status,200);assert.equal((await call('/api/progress','GET',undefined,a.cookie)).data.progress.personal.goal,'PRIVATE-QA-MARKER');
result=await call('/api/progress','PUT',{revision:2,progress:payload},a.cookie);assert.equal(result.status,200);assert.equal('personal' in (await call('/api/progress','GET',undefined,a.cookie)).data.progress,false);
const signout=await call('/api/auth/sign-out','POST',{},a.cookie);assert.equal(signout.status,200);assert.equal((await call('/api/progress','GET',undefined,a.cookie)).status,401);
const login=await call('/api/auth/sign-in/email','POST',{email:a.email,password:a.password});assert.equal(login.status,200);a.cookie=login.cookie;
assert.equal((await call('/api/progress','GET',undefined,a.cookie)).data.revision,3);
console.log('API verified: sessions, account isolation, game saves, conflict, CSRF and personal-data opt-in.');
} finally {
  for(const account of accounts)assert.equal((await call('/api/auth/delete-user','POST',{password:account.password},account.cookie)).status,200);
  console.log('Synthetic QA accounts removed.');
}
