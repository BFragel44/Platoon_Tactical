import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {historicalM3Battlefield,readBattlefieldFile} from '../src/sim/company/historicalBattlefield.js';
const fixture=JSON.parse(readFileSync('output/st-georges-playtests/st-georges-attached-1.json','utf8'));
describe('original accepted M3 reader',()=>{
 it('executes original rules 27 and preserves expanded terrain and input',()=>{
  const replay=structuredClone(fixture.replay),before=structuredClone(replay);
  const b=historicalM3Battlefield(replay);
  expect(b.locations).toHaveLength(26);expect(b.source.rules_version).toBe(27);
  expect(b.source.patrols).toHaveLength(3);expect(replay).toEqual(before);
  expect(readBattlefieldFile(JSON.stringify(b))).toEqual(b);
 },30000);
 it('rejects changed immutable attempt records',()=>{const changed=structuredClone(fixture.replay);changed.attempt_records[0].starting_state.turn=99;expect(()=>historicalM3Battlefield(changed)).toThrow(/starting record mismatch/);},30000);
 it('rejects unsupported records and unfinished patrols',()=>{
  expect(()=>historicalM3Battlefield({...fixture.replay,rules_version:28})).toThrow(/Unsupported/);
  expect(()=>historicalM3Battlefield({...fixture.replay,operations:[],attempt_records:undefined})).toThrow();
 });
});
