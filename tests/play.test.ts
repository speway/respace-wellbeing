import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findSkyRoute,getRoomActivity} from '../src/play-model.ts';
import type {RoomItem} from '../src/experience-model.ts';

const item=(kind:string,slot:number):RoomItem=>({kind,slot,rotation:0});

test('an ordinary room without an activity offers an invitation, not a forced activity',()=>{
  const result=getRoomActivity({items:[item('chair',7),item('books',0)]});
  assert.equal(result.available,true);
  assert.equal(result.pose,'calm');
  assert.equal(result.slot,4);
  assert.ok(result.note.length>0);
});

test('reading requires books; an unrelated chair does not pretend that reading happened',()=>{
  const result=getRoomActivity({items:[item('chair',8)],activity:'read'});
  assert.equal(result.available,false);
  assert.equal(result.pose,'calm');
  assert.equal(result.slot,4);
  assert.ok(result.note.length>0);
});

test('reading happens at the chair or at the actual books when a chair is absent',()=>{
  assert.equal(getRoomActivity({items:[item('books',0),item('chair',6)],activity:'read'}).slot,6);
  const standing=getRoomActivity({items:[item('books',8)],activity:'read'});
  assert.equal(standing.available,true);
  assert.equal(standing.pose,'read');
  assert.equal(standing.slot,8);
});

test('tea requires a cup and uses its real position unless a chair is available',()=>{
  assert.equal(getRoomActivity({items:[item('books',0),item('chair',8)],activity:'tea'}).available,false);
  const result=getRoomActivity({items:[item('cup',2)],activity:'tea'});
  assert.equal(result.available,true);
  assert.equal(result.pose,'calm');
  assert.equal(result.slot,2);
  assert.equal(getRoomActivity({items:[item('cup',2),item('chair',7)],activity:'tea'}).slot,7);
});

test('rest needs no object and prefers a chair, then a blanket, then the center',()=>{
  const empty=getRoomActivity({items:[],activity:'rest'});
  assert.equal(empty.available,true);
  assert.equal(empty.pose,'rest');
  assert.equal(empty.slot,4);
  assert.equal(getRoomActivity({items:[item('blanket',1)],activity:'rest'}).slot,1);
  assert.equal(getRoomActivity({items:[item('blanket',1),item('chair',8)],activity:'rest'}).slot,8);
});

test('moving a required object moves the activity focus without altering the room',()=>{
  const room={items:[item('books',0)],activity:'read' as const};
  const before=structuredClone(room);
  assert.equal(getRoomActivity(room).slot,0);
  assert.deepEqual(room,before);
  assert.equal(getRoomActivity({...room,items:[item('books',5)]}).slot,5);
});

test('a sky route follows actual lines in either direction',()=>{
  assert.deepEqual(findSkyRoute([[1,0],[1,2]],0,2,3),[0,1,2]);
  assert.deepEqual(findSkyRoute([[0,1],[1,2]],2,0,3),[2,1,0]);
});

test('a shortest route wins even when the longer detour is listed first',()=>{
  const edges:[number,number][]=[[0,1],[1,2],[2,3],[0,4],[4,3]];
  assert.deepEqual(findSkyRoute(edges,0,3,5),[0,4,3]);
});

test('disconnected points have no route; the same existing point is a complete one-point route',()=>{
  assert.equal(findSkyRoute([[0,1],[2,3]],0,3,4),null);
  assert.equal(findSkyRoute([],0,1,2),null);
  assert.deepEqual(findSkyRoute([],1,1,2),[1]);
});

test('cycles and duplicate lines do not repeat points or change the edge array',()=>{
  const edges:[number,number][]=[[1,0],[1,2],[2,0],[2,3],[1,0]];
  const before=structuredClone(edges);
  for(const edge of edges)Object.freeze(edge);
  Object.freeze(edges);
  assert.deepEqual(findSkyRoute(edges,0,3,4),[0,2,3]);
  assert.deepEqual(edges,before);
});

test('route endpoints must be integers referring to existing points',()=>{
  for(const endpoint of [-1,3,0.5,NaN,Infinity,'0',null]){
    assert.throws(()=>findSkyRoute([],endpoint as number,0,3));
    assert.throws(()=>findSkyRoute([],0,endpoint as number,3));
  }
  for(const count of [-1,0.5,NaN,Infinity,'3'])assert.throws(()=>findSkyRoute([],0,0,count as number));
  assert.throws(()=>findSkyRoute([],0,0,0));
});

test('corrupt lines are rejected even when the requested start already equals the finish',()=>{
  for(const edges of [[[0,3]],[[0,-1]],[[0,1.5]],[[0,NaN]],[[0,'1']],[[0]],Array(1)]){
    assert.throws(()=>findSkyRoute(edges as [number,number][],0,0,3));
  }
});
