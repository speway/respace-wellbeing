import test from 'node:test';
import assert from 'node:assert/strict';
import {initialExperience,validateExperience} from '../src/experience-model.ts';
import {initialData} from '../src/domain.ts';
import {cloudPayload,fromCloud,mergeProgress} from '../src/cloud-model.ts';
test('museum saves restore the selected exhibit without personal data',()=>{
  const data=initialData();data.space=initialExperience();
  data.space.museum={kind:'choice',stage:2,selected:[8]};
  const cloud=cloudPayload(data,false);
  assert.equal(cloud.personal,undefined);
  assert.deepEqual(fromCloud(cloud).space?.museum,data.space.museum);
  const local=initialData();local.space=initialExperience();local.space.museum={kind:'attention',stage:2,selected:[0,3]};
  assert.deepEqual(mergeProgress(cloud,local,true,false).space?.museum,local.space.museum);
  assert.deepEqual(mergeProgress(cloud,local,false,false).space?.museum,data.space.museum);
});
test('museum validation rejects out of bounds selections and duplicate marks',()=>{
  const cases=[{kind:'memory',stage:1,selected:[2]},{kind:'attention',stage:2,selected:[6]},{kind:'choice',stage:1,selected:[3]},{kind:'choice',stage:2,selected:[9]},{kind:'memory',stage:1,selected:[0,0]},{kind:'diagnosis',stage:1,selected:[]}];
  for(const museum of cases)assert.throws(()=>validateExperience({...initialExperience(),museum}));
});
