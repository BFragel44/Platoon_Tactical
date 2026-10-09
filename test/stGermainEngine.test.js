import {describe,it,expect} from 'vitest';
import {stGermain} from '../src/scenarios/stGermain.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission,getPlayerView,advancePhase,exportReplay,replayMission,checkObjective} from '../src/sim/company/engine.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {orderReason} from '../src/sim/company/actions.js';
import {explainLos,communicationLos,combatExposure} from '../src/sim/company/battlefield.js';
import {emit} from '../src/sim/company/core.js';
import {validateNormandyContent} from '../src/sim/company/normandyContent.js';
const fixture={...stGermain,readiness:{playable:true}};
const fresh=()=>createMission(fixture,'patrol-integration',{},null,{mission_instance_id:'patrol-fixture'});
describe('St. Germain integrated setup and execution boundary',()=>{
 it('preserves the gated scenario and retains explicit rejection for gated definitions',()=>{expect(()=>createMission(stGermain,'gated')).toThrow('not playable');expect(()=>createMission({...stGermain,readiness:{...stGermain.readiness,playable:false,missing:['Acceptance pending']}},'gated')).toThrow('not playable');});
 it('validates all authored profiles without altering accepted Cerisy',()=>{
  const original=structuredClone(cerisy);expect(()=>validateNormandyContent(stGermain)).not.toThrow();
  const bad=structuredClone(stGermain);bad.enemy_counters[0].vof='UNKNOWN';expect(()=>validateNormandyContent(bad)).toThrow('Unsupported');expect(cerisy).toEqual(original);
 });
 it('materializes exactly twenty-four cards with no staging or COP contact',()=>{
  const s=fresh();expect(Object.values(s.locations)).toHaveLength(24);expect(Object.values(s.locations).some(l=>l.staging)).toBe(false);
  expect(Object.values(s.contacts)).toHaveLength(17);expect(Object.values(s.contacts).some(c=>c.location===s.patrol.plan.cop)).toBe(false);
  for(const l of Object.values(s.locations).filter(l=>l.row===1||l.id===s.patrol.plan.cop))expect(l.covers.map(c=>c.type)).toEqual(['Foxholes','Foxholes']);
  expect(s.units.hmg1.ammo.MG).toBe(6);expect(s.units.hmg2.ammo.MG).toBe(6);
 });
 it('deploys reserves with preserved identities and no active presence',()=>{
  const s=createMission(fixture,'reserve',{positions:{s21:'RESERVE'}});expect(s.units.s21.removed).toBe('RESERVE');expect(s.units.s21.steps).toHaveLength(3);
  expect(s.roster_snapshot.formations.s21.step_ids).toHaveLength(3);
 });
 it('places individual mortar teams on the battlefield instead of nonexistent staging',()=>{
  const s=createMission(fixture,'mortar-teams',{mortar_mode:'teams'});expect(s.units.mortar_section).toBeUndefined();
  for(const id of ['mortar1','mortar2','mortar3'])expect(s.locations[s.units[id].location].row).toBe(1);
 });
 it.each([{positions:{s11:'r3c1'}},{patrol:{route:['r2c1','r2c1','r3c1','r4c1']}},{positions:{s21:'r2c3',s31:'r2c3'}},{objectives:{primary:'r4c1'}}])('rejects invalid patrol setup %j',setup=>expect(()=>materializeScenario(stGermain,'invalid',setup)).toThrow());
 it('records moon visibility and the exact patrol plan in immutable start/replay',()=>{
  let s=fresh();expect([2,3,4,5]).toContain(s.visibility.light);const initial=structuredClone(s.attempt_records[0]);
  s=advancePhase(s).state;expect(s.attempt_records[0]).toEqual(initial);expect(replayMission(fixture,exportReplay(s))).toEqual(s);
 });
 it('projects question-side contacts without their B/C letters',()=>{
  const s=fresh(),view=getPlayerView(s);expect(view.contacts.filter(c=>s.locations[c.location].row<4).every(c=>c.type==='?')).toBe(true);
  expect(view.contacts.filter(c=>s.locations[c.location].row===4).every(c=>c.type==='A')).toBe(true);
  expect(view.patrol.plan).toEqual(s.patrol.plan);expect(view.command_limits).toEqual({spend:4,saved:2});
 });
 it('blocks ordered movement by fixed defenders and preserves active-platoon movement',()=>{
  const s=fresh();s.impulse={id:'fixture',hq:'general',commands:10,spent:0};
  expect(orderReason(s,{unit_id:'s21',type:'MOVE',target_id:'r2c2'})).toMatch(/fixed/);
  expect(orderReason(s,{unit_id:'s11',type:'MOVE',target_id:'r2c1'})).toBe(null);
 });
 it('records accepted movement events in route order and ends only the patrol',()=>{
  const s=fresh(),u=s.units.s11;let from=u.location;
  for(const target of [...s.patrol.plan.route,'r1c2']){u.location=target;emit(s,'UNIT_MOVED','fixture',{actor:u.id,from,target,faction:'friendly'});from=target;}
  checkObjective(s);expect(s.status).toBe('PATROL_COMPLETE');expect(s.patrol_history).toEqual([{platoon:1,outcome:'SUCCESS',turns:1}]);
  expect(s.events.some(e=>e.type==='MISSION_ENDED')).toBe(false);
  checkObjective(s);expect(s.patrol_history).toHaveLength(1);
 });
 it('rejects rules-26 replay without changing the original export',()=>{
  const record=exportReplay(fresh());record.rules_version=26;const original=structuredClone(record);
  expect(()=>replayMission(fixture,record)).toThrow('version mismatch');expect(record).toEqual(original);
 });
 it('loses a timed-out patrol even if another platoon survives',()=>{
  const s=fresh();s.turn=10;checkObjective(s);expect(s.status).toBe('PATROL_COMPLETE');expect(s.patrol_history[0].outcome).toBe('DEFEAT');
 });
 it('uses illuminated targets for combat LOS while preserving physical radio LOS',()=>{
  const s=fresh();for(const l of Object.values(s.locations)){l.elevation=1;l.borders={N:'white',NE:'white',E:'white',SE:'white',S:'white',SW:'white',W:'white',NW:'white'};}
  expect(explainLos(s,'r1c1','r3c1').visible).toBe(false);
  s.markers=[{type:'ILLUMINATION',location:'r3c1',center:3}];expect(explainLos(s,'r1c1','r3c1').visible).toBe(true);
  s.visibility.weather=2;expect(explainLos(s,'r1c1','r3c1').visible).toBe(false);
  // Adjacent physical radio trace remains available regardless of light/weather.
  expect(communicationLos(s,'r1c1','r2c1')).toBe(true);s.locations.r2c1.smoke=true;expect(communicationLos(s,'r1c1','r3c1')).toBe(true);
 });
 it('applies visibility before selecting VOF and leaves off-map support exempt',()=>{
  const s=fresh(),u=s.units.s11;s.visibility={light:5,weather:0};s.fire=[{source:'s21',origin:'r1c2',target:u.location,value:-3}];
  s.support=[{status:'ACTIVE',location:u.location,value:-4,agency:'enemy_artillery',ammo:'HE'}];
  const exposure=combatExposure(s,u);expect(exposure.strongest.kind).toBe('OFF_MAP_SUPPORT');expect(exposure.parts.visibility).toBe(0);
  s.support=[];expect(combatExposure(s,u).parts.visibility).toBe(5);
 });
});

it('attaches company staff to the patrol while preserving the required Row 1 start',()=>{
 const s=createMission(fixture,'staff-patrol',{assignments:{staff:{platoon:1}}});expect(s.units.staff.platoon).toBe(1);expect(s.units.staff.cover).toBeNull();
 expect(()=>createMission(fixture,'forward-start',{positions:{s11:'r2c3'}})).toThrow('Start the patrolling platoon');
});

