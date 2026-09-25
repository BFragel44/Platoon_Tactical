import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,advancePhase,getPlayerView,getVisibleEvents} from '../src/sim/company/engine.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
import {specialActivity} from '../src/sim/company/specialEnemies.js';
import {orderReason} from '../src/sim/company/actions.js';
import {combatExposure,los} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'support');
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',borders:borders(DIRECTIONS),elevation:1,covers:[],known:true});
 s.units.artyfo.location='r1c1';s.units.mtrfo.location='r1c1';s.units.co.location='r1c1';
 s.impulse={id:'test',hq:'general',commands:6,spent:0};return s;
};
function stack(s,list){s.deck.order=[...list,...s.deck.order.filter(id=>!list.includes(id))];}
const hits=n=>Object.values(cards).filter(c=>c.burst&&!c.short).slice(0,n).map(c=>c.id);
const misses=n=>Object.values(cards).filter(c=>!c.burst&&!c.short).slice(0,n).map(c=>c.id);
function spotter(s,id='secret_spotter'){
 const u={...structuredClone(s.units.mtrfo),id,name:'Secret German observer',faction:'enemy',kind:'SPOTTER',location:'r3c1',radios:[],placed_turn:1,vof:null};s.units[id]=u;s.units.s11.location='r1c1';s.turn=2;return u;
}
describe('Keep Up the Fire support',()=>{
 it('requires the caller’s own network even when requesting the other agency',()=>{
  const s=fresh(),command={type:'CALL_MORTAR_WP',unit_id:'artyfo',issuer_id:'general',target_id:'r2c1'};
  expect(orderReason(s,command)).toBeNull();s.units.artyfo.radios=['MTR'];
  expect(orderReason(s,command)).toContain('ARTY radio');
  s.units.artyfo.radios=['ARTY'];s.support_unavailable=['mortar'];expect(orderReason(s,command)).toContain('unavailable');
 });
 it('allows screening an empty card with WP, but requires a spotted target for HE',()=>{
  const s=fresh(),command={unit_id:'artyfo',issuer_id:'general',target_id:'r2c1'};
  expect(orderReason(s,{...command,type:'CALL_ARTILLERY_WP'})).toBeNull();
  expect(orderReason(s,{...command,type:'CALL_ARTILLERY'})).toContain('spotted');
 });
 it('uses every published caller allowance and one registered-target bonus',()=>{
  for(const [agency,counts]of Object.entries({artillery:{co:2,artyfo:3,mtrfo:1},mortar:{co:2,artyfo:2,mtrfo:3}}))for(const [id,count]of Object.entries(counts)){
   const s=fresh();stack(s,hits(count));const before=s.deck.draws;supportRequest(s,s.units[id],agency,'HE','r2c1');
   expect(s.deck.draws-before).toBe(count);stack(s,hits(count+1));const next=s.deck.draws;
   supportRequest(s,s.units[id],agency,'HE','r2c1');expect(s.deck.draws-next).toBe(count+1);
   expect(s.support).toHaveLength(2); // Multiple-burst cards never expand to a battalion mission.
  }
 });
 it('short rounds override successes, finish the batch, and register the actual impact card',()=>{
  const s=fresh(),short=Object.values(cards).find(c=>c.short).id;stack(s,[...hits(2),short]);
  const before=s.deck.draws;supportRequest(s,s.units.artyfo,'artillery','HE','r3c1');
  expect(s.deck.draws-before).toBe(3);expect(s.support.at(-1).location).toBe('r2c1');expect(s.registered_targets.artillery).toBe('r2c1');
 });
 it('does not register a failed request or replace a previous registration',()=>{
  const s=fresh();s.registered_targets.artillery='r3c1';stack(s,misses(3));supportRequest(s,s.units.artyfo,'artillery','HE','r2c1');
  expect(s.support).toEqual([]);expect(s.registered_targets.artillery).toBe('r3c1');
 });
 it('applies the caller experience modifier to the whole attempt',()=>{
  for(const [experience,count]of [['Green',2],['Veteran',4]]){
   const s=fresh();s.units.artyfo.experience=experience;stack(s,hits(count));const before=s.deck.draws;
   supportRequest(s,s.units.artyfo,'artillery','HE','r2c1');expect(s.deck.draws-before).toBe(count);
  }
 });
 it('places a short self-request on a seeded adjacent map card, never in staging',()=>{
  const s=fresh(),short=Object.values(cards).find(c=>c.short).id;stack(s,[...hits(2),short]);const copy=structuredClone(s);
  supportRequest(s,s.units.artyfo,'artillery','HE','r1c1');supportRequest(copy,copy.units.artyfo,'artillery','HE','r1c1');expect(s).toEqual(copy);
  expect(['r1c2','r2c1','r2c2']).toContain(s.support.at(-1).location);
 });
 it('activates pending WP at fire update, screens basic fire, then expires at the next update',()=>{
  let s=fresh();s.units.s11.location='r2c1';stack(s,hits(3));supportRequest(s,s.units.artyfo,'artillery','WP','r2c1');
  expect(los(s,'r2c1','r1c1')).toBe(true);s.phase='FIRE_MISSIONS';s.impulse=null;s=advancePhase(s).state;
  expect(los(s,'r2c1','r1c1')).toBe(false);
  s.fire=[{source:'co',origin:'r1c1',target:'r2c1',value:0}];
  const exposure=combatExposure(s,s.units.s11);
  expect(exposure.sources.find(c=>c.kind==='BASIC_FIRE').value).toBe(1);
  expect(exposure.sources.find(c=>c.kind==='OFF_MAP_SUPPORT').label).toBe('Incoming artillery WP');
  s.phase='FIRE_MISSIONS';s=advancePhase(s).state;expect(s.support).toEqual([]);expect(los(s,'r2c1','r1c1')).toBe(true);
 });
 it('shares one enemy mortar registration, hides spotter identity, and reproduces follow-up calls',()=>{
  const s=fresh(),u=spotter(s);s.registered_targets.enemy_mortar='r1c1';stack(s,hits(3));const copy=structuredClone(s),before=s.deck.draws;
  specialActivity(s,u,()=>{});specialActivity(copy,copy.units[u.id],()=>{});expect(s).toEqual(copy);
  expect(s.deck.draws-before).toBe(3);expect(s.support.at(-1).status).toBe('PENDING');
  const view=getPlayerView(s);expect(view.support[0]).toMatchObject({agency:'mortar',ammo:'HE'});
  expect(JSON.stringify(view.support)).not.toContain(u.id);expect(JSON.stringify(getVisibleEvents(s))).not.toContain(u.name);
 });
 it('removes a mission spotter after a failed request, but not on its placement turn',()=>{
  const s=fresh(),u=spotter(s);u.placed_turn=s.turn;const before=s.deck.draws;specialActivity(s,u,()=>{});expect(s.deck.draws).toBe(before);
  u.placed_turn--;stack(s,misses(2));specialActivity(s,u,()=>{});expect(u.removed).toBe('WITHDRAWN');expect(s.support).toEqual([]);
 });
});
