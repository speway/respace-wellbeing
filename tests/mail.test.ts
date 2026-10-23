import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialMail,swapMail,getMailFeedback,validateMail,MAIL_TASKS} from '../src/mail-model.ts';
import {initialData,validateData} from '../src/domain.ts';
import {initialExperience,validateExperience} from '../src/experience-model.ts';
import {cloudPayload,fromCloud,mergeProgress} from '../src/cloud-model.ts';

const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const solutions=[[2,0,1],[0,1,2],[1,2,0]];

test('all three postal tasks are available and start in different unsolved arrangements',()=>{
  assert.equal(MAIL_TASKS.length,3);
  const starts=MAIL_TASKS.map((task,index)=>{
    assert.ok(task.title.length>0);
    assert.equal(task.clues.length,2);
    const state=initialMail(index);
    assert.equal(state.task,index);
    assert.equal(getMailFeedback(state).done,false);
    return state.order.join(',');
  });
  assert.equal(new Set(starts).size,3);
  assert.deepEqual(initialMail(),initialMail(0));
});

for(let task=0;task<3;task++)test(`task ${task} checks both clues across every parcel permutation`,()=>{
  for(const order of permutations){
    const feedback=getMailFeedback({task,order});
    assert.equal(feedback.done,order.join(',')===solutions[task].join(','));
    assert.ok(feedback.text.length>0);
  }
});

test('swapping two shelves exchanges only their parcels and supports undo by swapping again',()=>{
  const before=initialMail(2),original=structuredClone(before);
  Object.freeze(before.order);Object.freeze(before);
  const next=swapMail(before,0,2);
  assert.deepEqual(next,{task:2,order:[1,0,2]});
  assert.deepEqual(before,original);
  assert.deepEqual(swapMail(next,0,2),original);
  const same=swapMail(before,1,1);
  assert.deepEqual(same,before);
  assert.notEqual(same,before);
  assert.notEqual(same.order,before.order);
});

test('postal model rejects invalid tasks, slots, duplicates, missing parcels, and sparse arrays',()=>{
  for(const task of [-1,3,0.5,NaN,'0',null])assert.throws(()=>initialMail(task as number));
  const state=initialMail();
  for(const slot of [-1,3,0.5,NaN,'0',null]){
    assert.throws(()=>swapMail(state,slot as number,0));
    assert.throws(()=>swapMail(state,0,slot as number));
  }
  for(const bad of [null,{}, {task:3,order:[0,1,2]}, {task:0,order:[0,0,2]}, {task:0,order:[0,1]}, {task:0,order:[0,1,3]}, {task:0,order:[0,1,'2']}, {task:0,order:[0,,2]}, {task:0,order:[]}, {task:0,order:'012'}]){
    assert.throws(()=>validateMail(bad));
    assert.throws(()=>getMailFeedback(bad as never));
  }
});

test('validation copies only game state and does not retain caller-owned order arrays',()=>{
  const raw={task:1,order:[2,1,0],score:90,diagnosis:'private'};
  const clean=validateMail(raw);
  assert.deepEqual(clean,{task:1,order:[2,1,0]});
  clean.order[0]=0;
  assert.deepEqual(raw.order,[2,1,0]);
});

test('old guest saves stay unchanged and postal arrangements survive local and cloud roundtrips',()=>{
  const old=initialExperience();assert.deepEqual(validateExperience(old),old);
  const data=initialData();data.space=initialExperience();data.space.mail={task:2,order:[1,2,0]};
  data.goal='local private goal';
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(data))),data);
  const cloud=cloudPayload(data,false);
  assert.equal(cloud.personal,undefined);
  assert.equal(JSON.stringify(cloud).includes('local private goal'),false);
  assert.deepEqual(cloud.space.mail,data.space.mail);
  assert.deepEqual(fromCloud(cloud).space?.mail,data.space.mail);
  cloud.space.mail!.order[0]=0;
  assert.deepEqual(data.space.mail.order,[1,2,0]);
});

test('cloud merge follows the chosen artwork and falls back to the only postal arrangement',()=>{
  const remote=initialData();remote.space=initialExperience();remote.space.mail={task:0,order:[2,0,1]};
  const local=initialData();local.space=initialExperience();local.space.mail={task:2,order:[1,2,0]};
  const cloud=cloudPayload(remote,false);
  assert.deepEqual(mergeProgress(cloud,local,true,false).space?.mail,local.space.mail);
  assert.deepEqual(mergeProgress(cloud,local,false,false).space?.mail,remote.space.mail);
  delete local.space.mail;
  assert.deepEqual(mergeProgress(cloud,local,true,false).space?.mail,remote.space.mail);
  delete remote.space.mail;local.space.mail={task:1,order:[0,1,2]};
  assert.deepEqual(mergeProgress(cloudPayload(remote,false),local,false,false).space?.mail,local.space.mail);
});

test('experience validation rejects corrupt mail instead of silently accepting it',()=>{
  for(const mail of [null,{task:0,order:[0,1,1]},{task:5,order:[0,1,2]},{task:1,order:[0,,2]}]){
    assert.throws(()=>validateExperience({...initialExperience(),mail}),/почт/);
  }
});
