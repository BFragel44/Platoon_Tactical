import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {contactPlacements,resolveMissionContact,packageAvailable} from '../src/sim/company/missionContacts.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {cards} from '../src/sim/company/core.js';
import {spot,unitLos,coverAvailable} from '../src/sim/company/battlefield.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'placement-acceptance');s.mission_rules.contactExpansion=false;
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',building:false,multi_story:false,tower:false,elevation:1,borders:borders(DIRECTIONS),covers:[],known:true});
 s.units.s11.location='r1c2';s.activity='NO_CONTACT';s.contacts.pc_r1c2.type='A';
 s.locations.r2c2.borders=borders();Object.assign(s.locations.r3c2,{terrain:'church',building:true,tower:true});return s;
};
function force(s,number,building){
 s.mission_contacts.tables.A=Array(10).fill(number);const ids=[];
 const take=fn=>{const c=Object.values(cards).find(c=>!ids.includes(c.id)&&fn(c));ids.push(c.id);};
 take(()=>true);take(c=>c.random[1]===2);take(c=>c.random[2]===(building?1:4));
 s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];
}
describe('Critical published contact placements',()=>{
 it('places an unspotted sniper in a distant tower, with real fire and no hidden-cover leak',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2;s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='sniper1');force(s,2,true);
  const before=structuredClone(s),profile=s.mission_contacts.counters[0];
  expect(contactPlacements(s,pc,profile,[],2,false,false,'Cover').map(l=>l.id)).toContain('r3c2');expect(s).toEqual(before);
  resolveMissionContact(s,pc);const u=Object.values(s.units).find(u=>u.faction==='enemy');
  expect(u.location).toBe('r3c2');expect(s.locations[u.location].covers.find(c=>c.id===u.cover)).toMatchObject({type:'Church Tower',capacity:1});
  expect(unitLos(s,u,s.units.s11)).toBe(true);expect(s.fire.some(f=>f.source===u.id&&f.target==='r1c2')).toBe(true);
  expect(getPlayerView(s).locations.find(l=>l.id===u.location).covers).toEqual([]);expect(getPlayerView(s).enemies).toEqual([]);
  spot(s,u);expect(getPlayerView(s).locations.find(l=>l.id===u.location).covers).toHaveLength(2);
  const again=structuredClone(before);resolveMissionContact(again,again.contacts[pc.id]);spot(again,again.units[u.id]);expect(s).toEqual(again);
 });
 it('uses a nearer legal position after a ruins roll, without rerolling the distant building',()=>{
  const s=fresh();s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='sniper1');force(s,2,false);
  const before=s.deck.draws;resolveMissionContact(s,s.contacts.pc_r1c2);
  expect(Object.values(s.units).find(u=>u.faction==='enemy').location).toBe('r2c2');expect(s.locations.r3c2.covers).toEqual([]);
  expect(s.deck.draws-before).toBe(3);expect(s.events.filter(e=>e.type==='CONTACT_POSITION_REJECTED')).toHaveLength(1);
 });
 it('uses tower LOS for an incoming-fire spotter without giving it basic fire',()=>{
  const s=fresh();s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='spotter1');force(s,3,true);
  s.locations.r4c2.borders=borders(); // Level ground beyond the tower remains blocked by r2c2.
  resolveMissionContact(s,s.contacts.pc_r1c2);const u=Object.values(s.units).find(u=>u.faction==='enemy');
  expect(u.location).toBe('r3c2');expect(s.support).toContainEqual(expect.objectContaining({source:u.id,location:'r1c2',status:'ACTIVE'}));expect(s.fire.some(f=>f.source===u.id)).toBe(false);
 });
 it('does not exhaust marker supply, but does enforce HMG counters and printed capacity',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2;s.locations.r2c2.borders=borders(DIRECTIONS);s.locations.r3c2.building=false;
  for(let i=0;i<20;i++)s.locations.r2c1.covers.push({id:`old${i}`,type:'Pillbox',capacity:2,value:4});
  expect(packageAvailable(s,pc,s.mission_contacts.packages[8])).toBe(true);
  for(const c of s.mission_contacts.counters.filter(c=>c.kind==='HMG'))s.units[c.id]={...structuredClone(s.units.mg1),id:c.id,counter_id:c.id,faction:'enemy',location:'r4c4'};
  expect(packageAvailable(s,pc,s.mission_contacts.packages[8])).toBe(false);
  s.units.hmg1.removed='BROKEN';expect(packageAvailable(s,pc,s.mission_contacts.packages[8])).toBe(true);
  expect(coverAvailable(s,s.units.s11,s.locations.r2c1.covers[0],'r2c1')).toBe(false);
 });
});
