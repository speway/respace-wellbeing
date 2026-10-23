import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceStory,getStoryView,rewindStory,type StoryState} from '../src/story-model.ts';
import {initialExperience,validateExperience} from '../src/experience-model.ts';

test('a missing story starts at the original first choice, without inventing a route',()=>{
  const view=getStoryView();
  assert.deepEqual(view.options,['Спросить в киоске','Зайти в мастерскую','Проверить список жителей']);
  assert.equal(view.route,undefined);
  assert.equal(view.guest,undefined);
  assert.equal(view.ending,undefined);
  assert.ok(view.text.length>0);
});

test('legacy second-stop choices keep their meanings and expose the first route',()=>{
  const view=getStoryView({stage:1,choices:[1]});
  assert.equal(view.route?.mark,'gear');
  assert.deepEqual(view.options,['Дождаться робота','Разложить кружки','Позвать механика']);
  assert.ok(view.route && view.text.includes(view.route.detail));
  assert.equal(view.guest,undefined);
});

test('legacy stage 2 [0,2] resumes with the kiosk mark and mechanic, not a new story',()=>{
  const view=getStoryView({stage:2,choices:[0,2]});
  assert.equal(view.route?.mark,'cup');
  assert.equal(view.guest?.kind,'mechanic');
  assert.deepEqual(view.options,['Оставить чайный уголок','Выпить по чашке и продолжить день','Забрать запасную кружку в каюту']);
  assert.ok(view.route && view.text.includes(view.route.detail));
  assert.ok(view.guest && view.text.includes(view.guest.text));
});

for(const first of [0,1,2])for(const second of [0,1,2])for(const last of [0,1,2]){
  test(`route ${first}/${second}/${last} has three choices, visible consequences and a compatible saved ending`,()=>{
    let state:StoryState={stage:0,choices:[]};
    for(const choice of [first,second,last]){
      assert.equal(getStoryView(state).options.length,3);
      state=advanceStory(state,choice);
      const data=initialExperience();
      data.story=state;
      const restored=validateExperience(JSON.parse(JSON.stringify(data))).story;
      assert.deepEqual(restored,state);
      assert.deepEqual(getStoryView(restored),getStoryView(state));
    }
    const view=getStoryView(state);
    assert.equal(view.route?.mark,['cup','gear','book'][first]);
    assert.equal(view.guest?.kind,['robot','cup','mechanic'][second]);
    assert.equal(view.ending?.place,['shelf','table','cabin'][last]);
    assert.deepEqual(view.options,[]);
    assert.ok(view.route && view.text.includes(view.route.detail));
    assert.ok(view.guest && view.text.includes(view.guest.text));
    assert.ok(view.ending && view.ending.detail.includes(view.route!.detail));
    assert.ok(view.ending && view.ending.detail.includes(view.guest!.text));
    assert.throws(()=>advanceStory(state,0));
  });
}

test('earlier choices leave nine distinct results even when the final decision stays the same',()=>{
  const descriptions=new Set<string>();
  for(const first of [0,1,2])for(const second of [0,1,2]){
    descriptions.add(getStoryView({stage:3,choices:[first,second,0]}).ending!.detail);
  }
  assert.equal(descriptions.size,9);
});

test('advance and rewind preserve their input and isolate returned choice arrays',()=>{
  const state:StoryState={stage:1,choices:[0]};
  Object.freeze(state.choices);
  Object.freeze(state);
  const advanced=advanceStory(state,2);
  const rewound=rewindStory(advanced);
  assert.deepEqual(state,{stage:1,choices:[0]});
  assert.deepEqual(advanced,{stage:2,choices:[0,2]});
  assert.deepEqual(rewound,state);
  assert.notEqual(rewound.choices,state.choices);
  rewound.choices[0]=1;
  assert.deepEqual(advanced.choices,[0,2]);
  assert.deepEqual(state.choices,[0]);
});

test('rewind at the beginning leaves the story unchanged; an ending returns to its final decision',()=>{
  const beginning:StoryState={stage:0,choices:[]};
  assert.deepEqual(rewindStory(beginning),beginning);
  assert.deepEqual(rewindStory({stage:3,choices:[2,0,1]}),{stage:2,choices:[2,0]});
});

test('all model entry points reject corrupt saved stages and choices',()=>{
  const invalid:unknown[]=[null,{},
    {stage:-1,choices:[]},{stage:4,choices:[0,1,2,0]},
    {stage:1.5,choices:[0]},{stage:NaN,choices:[]},
    {stage:1,choices:[]},{stage:0,choices:[0]},
    {stage:1,choices:[3]},{stage:1,choices:[-1]},
    {stage:1,choices:[0.5]},{stage:1,choices:[NaN]},
    {stage:1,choices:['0']},{stage:1,choices:Array(1)},
  ];
  for(const value of invalid){
    const state=value as StoryState;
    assert.throws(()=>getStoryView(state));
    assert.throws(()=>advanceStory(state,0));
    assert.throws(()=>rewindStory(state));
  }
});

test('advance rejects invalid incoming choices without changing the saved route',()=>{
  const state:StoryState={stage:1,choices:[2]};
  for(const value of [-1,3,0.5,NaN,Infinity,'0',null,undefined]){
    assert.throws(()=>advanceStory(state,value as number));
    assert.deepEqual(state,{stage:1,choices:[2]});
  }
});
