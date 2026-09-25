import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission} from '../src/sim/company/engine.js';
import {sniperTargetCard} from '../src/sim/company/battlefield.js';
import {prepareSpecialTargets} from '../src/sim/company/specialEnemies.js';
const fresh=()=>{const s=createMission({...keepUpTheFire,readiness:{playable:true}},'sniper');s.units.sniper={...structuredClone(s.units.mg1),id:'sniper',faction:'enemy',kind:'SNIPER',vof:'S!',location:'r3c2',fire:null};return s;};
describe('Sniper priorities, 6.1.1 and 7.15',()=>{
 it('prefers a command card over massed troops, then the closest command card',()=>{
  const s=fresh();s.units.co.location='r1c2';s.units.hq1.location='r2c2';s.units.s11.location='r3c1';
  expect(sniperTargetCard(s,s.units.sniper,[s.units.co,s.units.hq1,s.units.s11])).toBe('r2c2');
 });
 it('prefers strongest projected fire without commanders, then steps',()=>{
  const s=fresh();s.units.mg1.location='r1c1';s.units.mg1.fire='r2c1';s.units.s11.location='r1c2';s.units.s11.fire='r2c2';
  expect(sniperTargetCard(s,s.units.sniper,[s.units.mg1,s.units.s11])).toBe('r1c1');
  s.units.mg1.out_of_ammo=true;expect(sniperTargetCard(s,s.units.sniper,[s.units.mg1,s.units.s11])).toBe('r1c2');
 });
 it('resolves equal-card ties reproducibly',()=>{
  const s=fresh();s.units.co.location='r2c1';s.units.hq1.location='r2c3';const copy=structuredClone(s);
  expect(sniperTargetCard(s,s.units.sniper,[s.units.co,s.units.hq1])).toBe(sniperTargetCard(copy,copy.units.sniper,[copy.units.co,copy.units.hq1]));expect(s.rng).toEqual(copy.rng);expect(s.deck).toEqual(copy.deck);
 });
 it('selects an exposed individual instead of automatically targeting HQ and suppresses the special shot while pinned',()=>{
  const s=fresh();s.units.sniper.fire='r1c2';s.units.co.location='r1c2';s.units.s11.location='r1c2';s.units.s11.exposed=true;
  prepareSpecialTargets(s);expect(s.markers.find(m=>m.type==='SNIPER').target).toBe('s11');
  s.units.sniper.pinned=true;prepareSpecialTargets(s);expect(s.markers.some(m=>m.type==='SNIPER')).toBe(false);
 });
});
