import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialExperience,validateExperience,starPoints} from '../src/experience-model.ts';

test('custom sky survives export and import, including empty sky and color',()=>{
  const data=initialExperience();
  data.stars={shape:3,points:[[20,30],[70,60]],edges:[[0,1]],title:'Мой кот',color:'#e5c1ee'};
  const restored=validateExperience(JSON.parse(JSON.stringify(data)));
  assert.deepEqual(restored,data);
  assert.deepEqual(starPoints(restored.stars),[[20,30],[70,60]]);
  data.stars={shape:3,points:[],edges:[],title:''};
  assert.deepEqual(starPoints(validateExperience(data).stars),[]);
});
test('invalid coordinates, missing endpoints and untrusted colors are rejected',()=>{
  const data=initialExperience();
  for(const stars of [
    {shape:3,points:[[0,60]],edges:[],title:''},
    {shape:3,points:[[NaN,60]],edges:[],title:''},
    {shape:3,points:[[20,30]],edges:[[0,1]],title:''},
    {shape:0,points:[[20,30]],edges:[],title:''},
    {shape:3,points:[],edges:[],title:'',color:'url(example)'},
  ]) assert.throws(()=>validateExperience({...data,stars}));
});
test('legacy skies retain their original points',()=>{
  const legacy=initialExperience();
  assert.deepEqual(validateExperience(legacy),legacy);
  assert.equal(starPoints(legacy.stars).length,9);
});
