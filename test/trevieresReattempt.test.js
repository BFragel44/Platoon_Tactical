import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,endTurn,prepareReattempt,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {scoreMission} from '../src/sim/company/missionFeatures.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('Trévières reattempt state',()=>{
 it('uses the original contact value when a counterattack marker sorts first',()=>{
  const s=createMission(candidate,'original-contact-value');
  s.contacts.pc_r1c1.resolved=true;
  s.contacts.pc_counterattack={id:'pc_counterattack',location:'r1c1',type:'A',resolved:true,counterattack:true};
  scoreMission(s,{final:true});
  expect(s.achievements.find(a=>a.key==='clear_r1c1').points).toBe(1);
 });
 it('never rewards clearing the same location again via a replacement contact',()=>{
  const s=createMission(candidate,'location-reward');
  s.contacts.pc_r1c1.resolved=true;scoreMission(s,{final:true});
  const points=s.achievements.reduce((n,a)=>n+a.points,0);
  s.contacts.replacement={id:'replacement',location:'r1c1',type:'A',resolved:true,counterattack:true};
  s.attempt_number=2;scoreMission(s,{final:true});
  expect(s.achievements.reduce((n,a)=>n+a.points,0)).toBe(points);
  expect(s.achievements.filter(a=>a.key==='clear_r1c1')).toHaveLength(1);
 });
 it('rejects more than sixteen friendly steps on a non-staging reattempt card',()=>{
  const s=createMission(candidate,'reattempt-stack');s.status='DEFEAT';
  s.units.s11.location='r1c1';s.contacts.pc_r1c1.resolved=true;
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length).map(u=>[u.id,'r1c1']));
  expect(()=>prepareReattempt(s,{positions})).toThrow('16-step limit');
 });
 it('retains identities, discovered terrain, and awards while resetting tactical state',()=>{
  let s=createMission(candidate,'reattempt');
  for(let turn=0;turn<10&&s.status==='ACTIVE';turn++)s=endTurn(s).state;
  expect(s.status).toBe('DEFEAT');
  const originalSteps=s.units.s11.steps.map(step=>step.id);
  const firstRecord=structuredClone(s.attempt_records[0]);
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
  const next=prepareReattempt(s,{positions}).state;
  expect(next.status).toBe('ACTIVE');expect(next.attempt_number).toBe(2);expect(next.turn).toBe(1);
  expect(next.units.s11.steps.map(step=>step.id)).toEqual(originalSteps);
  expect(next.locations.r1c1.terrain_card).toBe(s.locations.r1c1.terrain_card);
  expect(next.achievements).toEqual(s.achievements);
  expect(next.attempt_records[0]).toEqual(firstRecord);
  expect(next.attempt_records[1].mission_run_id).toBe(firstRecord.mission_run_id);
  expect(next.attempt_records[1].attempt_id).not.toBe(firstRecord.attempt_id);
  expect(next.attempt_records[1].starting_state.turn).toBe(1);
  expect(replayMission(candidate,exportReplay(next)).units.s11.steps).toEqual(next.units.s11.steps);
  const altered=exportReplay(next);altered.attempt_records[0].starting_state.turn=99;
  expect(()=>replayMission(candidate,altered)).toThrow('starting record mismatch');
  expect(()=>prepareReattempt(next,{positions})).toThrow('No mission reattempt');
 },20000);
 it('repositions existing phone lines without duplicating the four-line pool',()=>{
  const s=createMission(candidate,'phone-reattempt',{command_network:'phones'});
  s.status='DEFEAT';s.phone_lines.push({id:'line_fixture',owner:'co',location:'r1c1',cut:true});
  s.locations.r0c2.covers.push({id:'secured_foxholes',type:'Foxholes',discovered:true,capacity:3});
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
  const next=prepareReattempt(s,{positions,covers:{co:'secured_foxholes'},phone_lines:{line_fixture:'r0c2'}}).state;
  expect(next.phone_lines[0]).toMatchObject({location:'r0c2',cut:false});
  expect(next.units.co.assets.phone_line).toBe(3);
  expect(next.units.co.cover).toBe('secured_foxholes');
  expect(()=>prepareReattempt(s,{positions,phone_lines:{line_fixture:'r3c2'}})).toThrow('secured cards');
 });
 it('returns a surviving dispatched runner before requiring on-map placements',()=>{
  const s=createMission(candidate,'runner-reattempt');s.status='DEFEAT';
  const step=s.units.s11.steps.pop();
  s.runners=[{id:'runner_fixture',step,status:'DISPATCHED',target:'hq1'}];
  s.units.runner_fixture={...structuredClone(s.units.s11),id:'runner_fixture',kind:'RUNNER',steps:[step],location:'r2c2'};
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.id!=='runner_fixture').map(u=>[u.id,'r0c2']));
  const next=prepareReattempt(s,{positions}).state;
  expect(next.runners[0]).toMatchObject({status:'BOX',target:null,step:{id:step.id}});
  expect(next.units.runner_fixture).toBeUndefined();
  expect(next.attempt_records[1].starting_state.runners[0].status).toBe('BOX');
 });
 it('replenishes finite enemy support and clears first-attempt HQ restrictions',()=>{
  const s=createMission(candidate,'support-reattempt');s.status='DEFEAT';
  s.units.spotter_fixture={...structuredClone(s.units.artyfo),id:'spotter_fixture',kind:'SPOTTER',faction:'enemy',location:'r2c2',missions_remaining:0,calls_made:2,initial_resources:{radios:[],assets:{},ammo:{},missions:2}};
  s.units.visitor={...structuredClone(s.units.co),id:'visitor',command_role:'higher_hq'};
  s.forward_row_blocked=1;s.higher_hq_on_map=true;s.hq_events=[{code:'ADVANCE',turn:2}];
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.id!=='visitor').map(u=>[u.id,'r0c2']));
  const next=prepareReattempt(s,{positions}).state;
  expect(next.units.spotter_fixture).toMatchObject({missions_remaining:2,calls_made:0});
  expect(next.units.visitor).toBeUndefined();
  expect(next.hq_events).toEqual([]);expect(next.forward_row_blocked).toBeNull();
  expect(next.higher_hq_on_map).toBe(false);
 });
 it('treats a donated LAT as Green and allows a paid one-level promotion',()=>{
  const s=createMission(candidate,'donor-promotion');s.status='DEFEAT';
  const step=s.units.s11.steps.pop();step.experience='Line';
  s.units.lat_fixture={...structuredClone(s.units.s11),id:'lat_fixture',name:'Donor LAT',kind:'LAT',steps:[step],max_steps:1,cohesion:'F',experience:'Line',removed:null};
  s.achievements=[{id:'earned',points:1}];
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
  const next=prepareReattempt(s,{positions,reconstitute:{s11:['lat_fixture']},promote:{[step.id]:'Line'}}).state;
  expect(next.units.s11.steps.find(v=>v.id===step.id).experience).toBe('Line');
  expect(next.attempt_points_spent).toBe(1);
  expect(()=>prepareReattempt(s,{positions,promote:{[step.id]:'Veteran'}})).toThrow('cannot be promoted');
 });
});
