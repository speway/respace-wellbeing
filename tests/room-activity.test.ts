import test from 'node:test';
import assert from 'node:assert/strict';
import {initialExperience,validateExperience} from '../src/experience-model.ts';
import {initialData} from '../src/domain.ts';
import {cloudPayload,fromCloud,mergeProgress} from '../src/cloud-model.ts';

test('old room saves remain byte-equivalent after validation',()=>{
  const old=initialExperience();assert.deepEqual(validateExperience(old),old);
});
test('room activities survive JSON and cloud roundtrips without private records',()=>{
  for(const activity of ['read','tea','rest'] as const){
    const data=initialData();data.space=initialExperience();data.space.room.activity=activity;data.goal='private orient';
    const roundtrip=validateExperience(JSON.parse(JSON.stringify(data.space)));
    assert.equal(roundtrip.room.activity,activity);
    const cloud=cloudPayload(data,false);assert.equal(cloud.space.room.activity,activity);assert.equal(cloud.personal,undefined);
    assert.equal(fromCloud(cloud).space?.room.activity,activity);
    assert.notEqual(fromCloud(cloud).goal,data.goal);
    assert.equal(mergeProgress(cloud,data,true,false).space?.room.activity,activity);
  }
});
test('invalid activity is rejected instead of interpreted as a psychological result',()=>{
  const bad=initialExperience();(bad.room as unknown as {activity:string}).activity='depressed';
  assert.throws(()=>validateExperience(bad),/комнат/);
});
