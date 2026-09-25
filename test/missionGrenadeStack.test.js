import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission} from '../src/sim/company/engine.js';
import {combatExposure} from '../src/sim/company/battlefield.js';
const fresh=()=>{const s=createMission({...keepUpTheFire,readiness:{playable:true}},'grenades');s.units.s11.location='r1c1';s.markers=[];return s;};
const mark=(s,type,value,extra={})=>s.markers.push({type,value,location:'r1c1',target:'s11',...extra});
describe('Cumulative grenade effects, 7.10.2',()=>{
 it('adds grenade values before selecting the strongest fire category',()=>{
  const s=fresh();mark(s,'GRENADE',-4);mark(s,'GRENADE',-4);mark(s,'SNIPER',-3);mark(s,'MINES',-4);
  const e=combatExposure(s,s.units.s11);expect(e.parts.fire).toBe(-8);expect(e.strongest.label).toBe('Combined grenade effects');
  expect(e.sources.filter(v=>v.kind==='GRENADE')).toHaveLength(1);expect(e.sources.find(v=>v.kind==='MINES').value).toBe(-4);
 });
 it('preserves critical cover loss and excludes attacks on a different target',()=>{
  const s=fresh();s.units.s11.cover='b';s.locations.r1c1.covers=[{id:'b',value:3,type:'Strong Building'}];
  mark(s,'GRENADE',-4,{critical:true});mark(s,'GRENADE',-4);mark(s,'GRENADE',-4,{target:'other'});
  const e=combatExposure(s,s.units.s11);expect(e.parts.fire).toBe(-8);expect(e.parts.cover).toBe(0);
 });
 it('does not add smoke protection to combined grenade effects',()=>{
  const s=fresh();mark(s,'GRENADE',-4);mark(s,'GRENADE',-4);s.locations.r1c1.smoke=true;
  expect(combatExposure(s,s.units.s11).parts.fire).toBe(-8);
 });
});
