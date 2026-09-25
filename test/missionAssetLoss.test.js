import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,getVisibleEvents} from '../src/sim/company/engine.js';
import {vofOf,rangeOf} from '../src/sim/company/battlefield.js';
import {applyHit} from '../src/sim/company/combat.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'asset-loss');
 const u=s.units.s11;u.location='r1c1';u.assets={wp:2,rifle_grenade:1};u.radios=['BN'];
 s.casualties.push({id:'carried',carrier:u.id,location:u.location,faction:'friendly',evacuated:false});return s;
};
describe('Mission breakdown transport, rule 5.1.6E',()=>{
 it.each(['FF','CF','FC','PP','LL'])('passes all carried items to the final surviving team after %s',effect=>{
  const s=fresh(),u=s.units.s11;u.steps=u.steps.slice(0,2);applyHit(s,u,effect);
  const event=s.events.find(e=>e.type==='ASSETS_TRANSFERRED');expect(event).toBeDefined();
  const recipient=Object.values(s.units).find(v=>v.id!==u.id&&v.assets.wp===2);
  expect(recipient).toBeDefined();expect(recipient.radios).toEqual(['BN']);expect(recipient.assets.rifle_grenade).toBe(1);
  expect(s.casualties.find(c=>c.id==='carried').carrier).toBe(recipient.id);
  expect(u.assets).toEqual({});expect(u.radios).toEqual([]);expect(s.assets.filter(a=>a.type==='EQUIPMENT')).toEqual([]);
 });
 it('drops equipment and transported casualties when no step survives',()=>{
  const s=fresh(),u=s.units.s11;u.steps=u.steps.slice(0,2);applyHit(s,u,'CC');
  expect(s.assets.filter(a=>a.type==='EQUIPMENT')).toEqual(expect.arrayContaining([
   expect.objectContaining({key:'wp',quantity:2,location:'r1c1'}),expect.objectContaining({key:'rifle_grenade',quantity:1,location:'r1c1'})]));
  expect(s.casualties.find(c=>c.id==='carried').carrier).toBeNull();expect(u.assets).toEqual({});
 });
 it('keeps equipment on a surviving original formation',()=>{
  const s=fresh(),u=s.units.s11;applyHit(s,u,'F');expect(u.steps).toHaveLength(2);expect(u.assets.wp).toBe(2);
  expect(s.casualties.find(c=>c.id==='carried').carrier).toBe(u.id);
 });
 it('does not reveal unobserved enemy equipment losses',()=>{
  const s=fresh(),u=s.units.s11;u.faction='enemy';u.steps=u.steps.slice(0,1);applyHit(s,u,'C');
  expect(getVisibleEvents(s).some(e=>e.type==='ASSETS_DROPPED')).toBe(false);
 });
});

describe('Published infantry breakdown profiles',()=>{
 it.each(['S','A'])('preserves the %s-rated Grenadier final-step Fire Team',rating=>{
  const s=fresh(),u=s.units.s11;u.last_step_vof=rating;u.faction='enemy';applyHit(s,u,'FF');
  const teams=Object.values(s.units).filter(v=>v.kind==='LAT');expect(teams).toHaveLength(3);
  expect(teams.map(vofOf)).toEqual(['S','S',rating]);expect(teams.map(rangeOf)).toEqual([1,1,1]);
 });
 it.each(['co','xo','staff','artyfo','mtrfo','at1','mortar1','mg1'])('keeps %s on its named Fire Team for A and F hits',id=>{
  for(const effect of ['A','F']){
   const s=fresh(),u=s.units[id];applyHit(s,u,effect);
   expect(u.steps).toHaveLength(1);expect(u.removed).toBeNull();expect(u.cohesion).toBe('F');expect(u.pinned).toBe(true);
   expect(vofOf(u)).toBe(id==='mg1'?'A':'S');expect(rangeOf(u)).toBe(1);
  }
 });
});
