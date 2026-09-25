import {cards} from '../src/sim/company/core.js';
import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,getPlayerView,submitCommand} from '../src/sim/company/engine.js';
import {los,unitLos,seesCard,canFire,coverAvailable} from '../src/sim/company/battlefield.js';
import {eligibleTargets,spottingBaseDraws,move,orderReason} from '../src/sim/company/actions.js';
import {revealTerrain} from '../src/sim/company/missionKnowledge.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'buildings');
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',building:false,borders:borders(DIRECTIONS),elevation:1,covers:[],known:true});
 s.locations.r2c2.borders=borders();s.units.s11.location='r1c2';
 s.locations.r1c2.covers.push({id:'upper',type:'Upper Story',elevation:1,value:3,known:true});
 return s;
};
describe('Buildings and cover areas',()=>{
 it('uses occupied upper-story elevation with reciprocal LOS and spotting modifiers',()=>{
  const s=fresh(),u=s.units.s11,t={...structuredClone(s.units.s12),id:'enemy',faction:'enemy',location:'r3c2'};s.units.enemy=t;
  expect(los(s,u.location,t.location)).toBe(false);expect(unitLos(s,u,t)).toBe(false);
  const base=spottingBaseDraws(s,u,t);u.cover='upper';
  expect(unitLos(s,u,t)).toBe(true);expect(unitLos(s,t,u)).toBe(true);
  expect(spottingBaseDraws(s,u,t)).toBe(base+1);
 });
 it('shows reciprocal fire access to a known elevated unit without revealing an unknown one',()=>{
  const s=fresh(),u=s.units.s11;u.location='r3c2';
  const t={...structuredClone(s.units.s12),id:'hidden',faction:'enemy',location:'r1c2',cover:'upper'};s.units.hidden=t;
  expect(seesCard(s,u,t.location)).toBe(false);expect(canFire(s,u,t.location)).toBe(false);
  s.knowledge.spotted.hidden={id:'hidden'};
  expect(seesCard(s,u,t.location)).toBe(true);expect(canFire(s,u,t.location)).toBe(true);
  expect(getPlayerView(s).units.find(v=>v.id===u.id).los_explanations[t.location].reason).toContain('upper story');
 });
 it('uses elevation for terrain revelation without changing printed terrain elevation',()=>{
  const s=fresh(),u=s.units.s11;s.locations.r3c2.known=false;u.cover='upper';revealTerrain(s);
  expect(s.locations.r3c2.known).toBe(true);expect(s.locations.r1c2.elevation).toBe(1);
 });
 it('enforces one-step tower capacity for orders and automatic cover entry',()=>{
  const s=fresh(),u=s.units.s11,c={id:'tower',type:'Church Tower',capacity:1,elevation:1,known:true};s.locations.r1c2.covers.push(c);
  expect(coverAvailable(s,u,c)).toBe(false);expect(eligibleTargets(s,u,'ENTER_COVER')).not.toContain('tower');
  const observer=s.units.artyfo;observer.location=u.location;
  expect(eligibleTargets(s,observer,'ENTER_COVER')).toContain('tower');observer.cover='tower';
  s.units.mtrfo.location=u.location;expect(eligibleTargets(s,s.units.mtrfo,'ENTER_COVER')).not.toContain('tower');
  s.locations.r1c1.covers=[{...c,id:'other_tower'}];move(s,u,'r1c1');expect(u.cover).toBeNull();
 });
 it('limits bunker fire to its arc without limiting observation or reciprocal attacks',()=>{
  const s=fresh(),u=s.units.s11;s.locations.r1c2.covers.push({id:'bunker',type:'Bunker',capacity:3,arc:[1,0],known:true});u.cover='bunker';
  expect(canFire(s,u,'r2c2')).toBe(true);expect(canFire(s,u,'r2c3')).toBe(false);expect(canFire(s,u,u.location)).toBe(false);
  expect(unitLos(s,u,'r2c3')).toBe(true);
  const attacker={...structuredClone(s.units.s12),id:'attacker',faction:'enemy',location:u.location};s.units.attacker=attacker;
  expect(canFire(s,attacker,u.location)).toBe(true);
 });
 it('rejects rifle grenades from buildings before accepting the order',()=>{
  const s=fresh(),u=s.units.s11;u.assets.rifle_grenade=1;u.cover='upper';
  const t={...structuredClone(s.units.s12),id:'enemy',faction:'enemy',location:'r2c2'};s.units.enemy=t;s.knowledge.spotted.enemy={id:t.id};
  s.impulse={id:'test',hq:'general',commands:3,spent:0};
  expect(orderReason(s,{type:'RIFLE_GRENADE',unit_id:u.id,issuer_id:'general',target_id:t.id})).toContain('cannot fire from building');
  u.cover=null;expect(orderReason(s,{type:'RIFLE_GRENADE',unit_id:u.id,issuer_id:'general',target_id:t.id})).toBeNull();
 });
});

describe('Direct upper-story discovery, rule 5.2.2B',()=>{
 const setup=()=>{const s=fresh(),l=s.locations.r1c2;l.covers=[];Object.assign(l,{terrain:'village',building:true,multi_story:true,tower:false,cover_draw:1,cover_limit:2});s.impulse={id:'upper',hq:'general',commands:3,spent:0};return s;};
 const force=(s,building=true)=>{const cover=Object.values(cards).find(c=>c.word.toLowerCase()==='cover'),roll=Object.values(cards).find(c=>c.id!==cover.id&&c.random[2]===(building?1:4));s.deck.order=[cover.id,roll.id,...s.deck.order.filter(id=>![cover.id,roll.id].includes(id))];};
 const command={type:'SEEK_COVER_UPPER',unit_id:'s11',issuer_id:'general'};
 it('enters a discovered upper story in the same order and preserves exposure',()=>{
  const s=setup();force(s);const r=submitCommand(s,command);expect(r.accepted).toBe(true);
  const u=r.state.units.s11,l=r.state.locations[u.location];expect(l.covers.find(c=>c.id===u.cover).type).toBe('Upper Story');expect(u.exposed).toBe(true);
  expect(r.state.events.find(e=>e.type==='COVER_ATTEMPT'&&e.actor==='s11').upper_story).toBe(true);
  expect(r.state).toEqual(submitCommand(structuredClone(s),command).state);
 });
 it('occupies ordinary cover when no building is discovered',()=>{
  const s=setup();force(s,false);const r=submitCommand(s,command);expect(r.accepted).toBe(true);
  expect(r.state.locations.r1c2.covers.find(c=>c.id===r.state.units.s11.cover).type).toBe('Cover');
 });
 it('rejects oversized tower seekers before spending and shares the ordinary seek allowance',()=>{
  const s=setup();s.locations.r1c2.tower=true;const before=structuredClone(s);expect(submitCommand(s,command).accepted).toBe(false);expect(s).toEqual(before);
  s.locations.r1c2.tower=false;s.units.s11.used=['upper:SEEK_COVER'];expect(orderReason(s,command)).toContain('already attempted');
 });
});
