import test from 'node:test';
import assert from 'node:assert/strict';
import {GAMES_ENABLED,isPausedGameAction} from '../src/game-availability.ts';

test('the public game gate is off and blocks every current game entry action',()=>{
  assert.equal(GAMES_ENABLED,false);
  for(const action of ['room','stars','nori','mail','story','museum','room-save','star-save','mail-save','story-choice','museum-start']){
    assert.equal(isPausedGameAction(action),true,action);
  }
  assert.equal(isPausedGameAction('lesson'),false);
  assert.equal(isPausedGameAction('fact'),false);
  assert.equal(isPausedGameAction('three-view-turn'),false);
});
