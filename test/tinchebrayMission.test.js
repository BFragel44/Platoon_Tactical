import {it,expect} from 'vitest';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {createMission,advancePhase,exportReplay,prepareReattempt} from '../src/sim/company/engine.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {saveTinchebrayRecovery,readTinchebrayRecovery,resumeTinchebrayCheckpoint} from '../src/ui/tinchebrayRecovery.js';
import {deployVireTankSupport} from '../src/sim/company/vireDeployment.js';
import {tinchebrayVehicleDeployments} from '../src/sim/company/tinchebrayDeployment.js';
import {eligibleContacts} from '../src/sim/company/combat.js';
import {revealTerrain} from '../src/sim/company/missionKnowledge.js';
import {synchronizeVireATUnits} from '../src/sim/company/vireUnits.js';
const fresh=()=>createTinchebrayDevelopmentMission('m7-runtime',{}, {},{mission_instance_id:'m7-runtime'});
it('gates normal creation but deploys a fresh live M7 with exact replay',()=>{
 expect(()=>createMission(tinchebray,'gated')).toThrow();
 let s=fresh();expect(s.scenario_id).toBe('normandy_7');expect(s.mission_rules.vire).toBeUndefined();
 expect(Object.values(s.vire_runtime.vehicles).filter(v=>v.profile==='M10_TD76')).toHaveLength(4);
 expect(s.roster_snapshot.company_id).toBe('normandy_tinchebray_standalone_company');
 s=advancePhase(s).state;const record=JSON.parse(JSON.stringify(exportReplay(s)));
 expect(record.format).toBe('tinchebray-integration');expect(importVireAdapterReplay(record)).toEqual(s);
 const wrong=structuredClone(record);wrong.scenario_version++;expect(()=>importVireAdapterReplay(wrong)).toThrow(/Incompatible/);
});
it('uses a separate recovery slot and retains exact state and presentation',()=>{
 const data=new Map([['platoon-vire-integration','M6 untouched']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const s=fresh();saveTinchebrayRecovery(storage,s,{zoom:80});
 const read=readTinchebrayRecovery(storage);expect(read.error).toBeNull();
 expect(resumeTinchebrayCheckpoint(read.bundle.latest)).toEqual({state:s,presentation:{zoom:80}});
 expect(data.get('platoon-vire-integration')).toBe('M6 untouched');
});
it('permits exactly two reattempts, preserving battlefield, identities and immutable records',()=>{
 let s=fresh();for(const pc of Object.values(s.contacts))pc.resolved=true;
 s.locations.r1c2.mines=true;s.knowledge.spotted.retained_enemy=true;
 const crew=s.vire_runtime.vehicles.m10_hq.crew.map(step=>step.id),terrain=s.locations.r1c2.terrain_card;
 const first=structuredClone(s.attempt_records[0]);
 for(let attempt=2;attempt<=3;attempt++){
  s.status='DEFEAT';s.vire_runtime.vehicles.m10_hq.ammo=0;
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&!u.removed&&u.steps.length).map(u=>[u.id,u.location]));
  const vehicle_positions=Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&v.profile==='M10_TD76').map(v=>[v.id,v.location]));
  s=prepareReattempt(s,{positions,vehicle_positions}).state;
  expect(s.attempt_number).toBe(attempt);expect(s.attempt_records).toHaveLength(attempt);
  expect(s.vire_runtime.vehicles.m10_hq.ammo).toBe(5);expect(s.vire_runtime.vehicles.m10_hq.crew.map(step=>step.id)).toEqual(crew);
  expect(s.locations.r1c2.mines).toBe(true);expect(s.locations.r1c2.terrain_card).toBe(terrain);expect(s.knowledge.spotted.retained_enemy).toBe(true);
  expect(s.attempt_records[0]).toEqual(first);expect(s.enemy_tactics).toBe('delay_defense');
 }
 s.status='DEFEAT';expect(()=>prepareReattempt(s,{positions:{},vehicle_positions:{}})).toThrow(/reattempt/);
});
it('cannot spend the same location experience on both reattempts',()=>{
 let s=fresh();for(const pc of Object.values(s.contacts))pc.resolved=true;
 s.achievements=[{id:'one-location',points:3}];
 const choices=state=>({positions:Object.fromEntries(Object.values(state.units).filter(u=>u.faction==='friendly'&&!u.removed&&u.steps.length).map(u=>[u.id,u.location])),vehicle_positions:Object.fromEntries(Object.values(state.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&v.profile==='M10_TD76').map(v=>[v.id,v.location]))});
 s.status='DEFEAT';const step=s.units.s11.steps[0].id;
 s=prepareReattempt(s,{...choices(s),promote:{[step]:'Veteran'}}).state;
 expect(s.attempt_points_spent_total).toBe(3);s.status='DEFEAT';
 const other=s.units.s21.steps[0].id;
 expect(()=>prepareReattempt(s,{...choices(s),promote:{[other]:'Veteran'}})).toThrow(/Not enough/);
});
it('preserves finite M5 entry, actual M10 losses and wreck cover across both reattempts',()=>{
 let s=fresh();for(const pc of Object.values(s.contacts))pc.resolved=true;
 deployVireTankSupport(s,Object.fromEntries(tinchebrayVehicleDeployments('event').map(v=>[v.id,v.location])));
 s.vire_runtime.vehicles.m10_1.status='KNOCKED_OUT';s.vire_runtime.vehicles.m10_2.status='RETREATED';
 s.locations.r1c1.covers.push({id:'old-wreck',type:'Wreck',value:1,known:true,discovered:true});
 for(const attempt of [2,3]){
  s.status='DEFEAT';const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&!u.removed&&u.steps.length).map(u=>[u.id,u.location]));
  const vehicle_positions=Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&['M10_TD76','M5_LIGHT37'].includes(v.profile)).map(v=>[v.id,v.location]));
  s=prepareReattempt(s,{positions,vehicle_positions}).state;expect(s.attempt_number).toBe(attempt);
  expect(s.vire_runtime.vehicles.m10_1.status).toBe('KNOCKED_OUT');expect(s.vire_runtime.vehicles.m10_2.status).toBe('RETREATED');expect(s.vire_runtime.tank_support_used).toBe(true);
  expect(()=>deployVireTankSupport(s,{})).toThrow(/already entered/);expect(s.locations.r1c1.covers.some(c=>c.id==='old-wreck')).toBe(true);
 }
});
it('evaluates vehicle-only contacts, reveals their terrain and creates shared-ammunition AT entries',()=>{
 const s=fresh();s.vire_runtime.vehicles.m10_hq.location='r2c1';s.locations.r2c1.known=false;
 expect(eligibleContacts(s).map(c=>c.id)).toContain('pc_r2c1');revealTerrain(s);expect(s.locations.r2c1.known).toBe(true);
 expect(Object.values(s.vire_runtime.vehicles).some(v=>v.profile==='BAZOOKA'&&v.source_unit)).toBe(true);
 const u=s.units[Object.values(s.vire_runtime.vehicles).find(v=>v.profile==='BAZOOKA').source_unit];u.ammo.RKT=0;synchronizeVireATUnits(s);
 expect(Object.values(s.vire_runtime.vehicles).find(v=>v.source_unit===u.id&&v.profile==='BAZOOKA').ammo).toBe(0);
});
it('rejects the earlier incomplete M7 replay version while preserving its export payload',()=>{
 for(const version of [1,2]){const old=exportReplay(fresh());old.version=version;const before=JSON.stringify(old);
  expect(()=>importVireAdapterReplay(old)).toThrow(/Incompatible/);expect(JSON.stringify(old)).toBe(before);
 }
});
