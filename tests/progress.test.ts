import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialData,validateData,demoEntries} from '../src/domain.ts';
import {initialExperience,validateExperience,placeRoomItem,connectStars} from '../src/experience-model.ts';
import {cloudPayload,mergeProgress,fromCloud} from '../src/cloud-model.ts';

test('old guest saves stay compatible, new experience round trips',()=>{
  const d=initialData();assert.deepEqual(validateData(d),d);d.space=initialExperience();d.space.lessons=[{id:'l4',step:3,completed:false}];d.space.favorites=['fact10'];d.space.stars.edges=[[0,1]];
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(d))),d);
});
test('bad lesson IDs, overlapping items and duplicate star edges rejected',()=>{
  const v=initialExperience();assert.throws(()=>validateExperience({...v,lessons:[{id:'l13',step:0,completed:false}]}));
  assert.throws(()=>validateExperience({...v,room:{...v.room,items:[{kind:'cup',slot:0,rotation:0},{kind:'plant',slot:0,rotation:0}]}}));
  assert.throws(()=>validateExperience({...v,stars:{...v.stars,edges:[[0,1],[1,0]]}}));
});
test('moving a room item frees previous cell and replaces occupied cell',()=>{
  const items=placeRoomItem(initialExperience().room.items,'plant',4);assert.equal(items.filter(i=>i.slot===4).length,1);assert.equal(items.some(i=>i.kind==='chair'),false);assert.equal(items.some(i=>i.slot===6),false);
});
test('constellation allows neither self edges nor duplicate reversed edges',()=>{
  const a=connectStars([],1,0);assert.deepEqual(a,[[0,1]]);assert.deepEqual(connectStars(a,0,1),a);assert.deepEqual(connectStars(a,2,2),a);
});
test('cloud excludes every private field by default',()=>{
  const d=initialData();d.entries=demoEntries();d.goal='private goal';d.habits[0].title='private habit';d.space=initialExperience();d.space.stars.title='private title';d.practices=[{id:'note',practiceId:'l1',at:new Date().toISOString(),note:'private note'}];
  const cloud=cloudPayload(d,false);assert.equal('personal' in cloud,false);assert.equal(JSON.stringify(cloud).includes('private'),false);assert.deepEqual(cloudPayload(d,true).personal,d);
});
test('guest migration combines viewed lessons but excludes personal data unless chosen',()=>{
  const guest=initialData();guest.space=initialExperience();guest.space.lessons=[{id:'l1',step:2,completed:false}];guest.space.favorites=['fact2'];guest.entries=demoEntries();guest.goal='private guest goal';
  const other=initialData();other.space=initialExperience();other.space.lessons=[{id:'l1',step:0,completed:true},{id:'l2',step:1,completed:false}];other.space.favorites=['fact1'];
  const result=mergeProgress(cloudPayload(other,false),guest,true,false);assert.equal(result.entries.length,0);assert.notEqual(result.goal,guest.goal);assert.equal(result.space!.lessons.find(l=>l.id==='l1')!.completed,true);assert.deepEqual(result.space!.favorites,['fact1','fact2']);
  assert.equal(mergeProgress(cloudPayload(other,false),guest,true,true).entries.length,guest.entries.length);
});
test('loading public cloud preserves local private notes',()=>{
  const d=initialData();d.goal='local only';assert.equal(fromCloud(cloudPayload(initialData(),false),d).goal,'local only');
});
