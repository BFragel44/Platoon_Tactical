import {readFileSync} from 'node:fs';
import * as engine from '../src/sim/company/engine.js';
import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,advancePhase,getPlayerView} from '../src/sim/company/engine.js';
import {createRunner,dispatchRunner,deliverRunners} from '../src/sim/company/runners.js';
import {rally} from '../src/sim/company/actions.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('Normandy runners',()=>{
 it('reaches the reported turn-five command from the supplied playtest and rejects implicit HQ donation',()=>{
  const record=JSON.parse(readFileSync(new URL('./fixtures/normandyRunnerPlaytest.json',import.meta.url),'utf8'));
  let s=createMission(candidate,record.seed,record.setup,record.roster_snapshot?{mission_instance_id:record.mission_instance_id,roster:{schema:1,...record.roster_snapshot,applied_missions:{}}}:null,{mission_instance_id:record.mission_instance_id});
  const index=record.operations.findIndex(op=>op.op==='submitCommand'&&op.command.type==='CREATE_RUNNER');expect(index).toBe(224);
  for(const op of record.operations.slice(0,index)){
   const argument=op.op==='submitCommand'?op.command:['selectHQ','resolveCombat'].includes(op.op)?op.id:op.options;
   const r=engine[op.op](s,argument);expect(r.accepted).not.toBe(false);expect(r.reason).toBeUndefined();s=r.state;
  }
  expect(s.turn).toBe(5);expect(s.phase).toBe('CO_ACTIVATION');expect(s.units.co.location).toBe('r1c3');
  const before=structuredClone(s),r=submitCommand(s,record.operations[index].command);
  expect(r.accepted).toBe(false);expect(r.state).toEqual(before);expect(s.runners).toHaveLength(0);
  const donor=Object.values(s.units).find(u=>u.id!=='co'&&getPlayerView(s).units.find(v=>v.id==='co').options.find(o=>o.type==='CREATE_RUNNER').targets.some(t=>t.id===u.id&&!t.reason));
  expect(donor).toBeDefined();const fixed=submitCommand(s,{...record.operations[index].command,target_id:donor.id});expect(fixed.accepted).toBe(true);
  expect(engine.replayMission(candidate,engine.exportReplay(fixed.state))).toEqual(fixed.state);
 },60000);

 it('rejects the playtest CO-as-implicit-donor command without consuming the HQ or its load',()=>{
  const s=createMission(candidate,'runner-playtest');s.turn=5;s.phase='CO_ACTIVATION';s.impulse={id:'t5-fixture',hq:'co',commands:4,spent:0};
  const r=submitCommand(s,{type:'CREATE_RUNNER',unit_id:'co',issuer_id:'co',target_id:null});
  expect(r.accepted).toBe(false);expect(r.state).toEqual(s);expect(r.reason).toContain('donating');
 });
 it('creates through CO using an explicit squad donor and keeps CO equipment and identity',()=>{
  let s=createMission(candidate,'runner-donor');s.turn=5;s.phase='CO_ACTIVATION';s.impulse={id:'t5-donor',hq:'co',commands:4,spent:0};s.units.s11.location=s.units.co.location;
  const co=structuredClone(s.units.co),step=s.units.s11.steps.at(-1).id;
  const r=submitCommand(s,{type:'CREATE_RUNNER',unit_id:'co',issuer_id:'co',target_id:'s11'});expect(r.accepted).toBe(true);s=r.state;
  expect(s.units.co.steps).toEqual(co.steps);expect(s.units.co.radios).toEqual(co.radios);expect(s.units.co.assets).toEqual(co.assets);
  expect(s.units.s11.steps).toHaveLength(2);expect(s.runners[0]).toMatchObject({status:'BOX',origin:'s11',step:{id:step}});
  expect(submitCommand(s,{type:'DISPATCH_RUNNER',unit_id:'co',issuer_id:'co',target_id:'hq1'}).accepted).toBe(true);
 });

 it('can deliver to a pinned command-side HQ',()=>{
  const s=createMission(candidate,'pinned-receiver');createRunner(s,s.units.s11);dispatchRunner(s,s.units.hq1);
  s.units.hq1.pinned=true;s.turn=2;deliverRunners(s);
  expect(s.activated).toContain('hq1');expect(s.runners[0].status).toBe('BOX');
 });
 it('waits on the Fire Team side and returns after recovery',()=>{
  const s=createMission(candidate,'runner-recovery');createRunner(s,s.units.s11);dispatchRunner(s,s.units.hq1);
  const runner=s.units[s.runners[0].id];runner.cohesion='F';s.turn=2;
  deliverRunners(s);expect(s.runners[0].status).toBe('DISPATCHED');
  rally(s,runner,runner,true);expect(runner.cohesion).toBe('GOOD');
  deliverRunners(s);expect(s.runners[0].status).toBe('BOX');
 });
 it('creates from an existing step, dispatches to an HQ, and activates it the next turn',()=>{
  let s=createMission(candidate,'runner-fixture');
  s.units.s11.location=s.units.co.location;
  s.phase='CO_ACTIVATION';s.activated=['co'];s.impulse={id:'fixture',hq:'co',commands:6,spent:0};
  const donorStep=s.units.s11.steps.at(-1).id;
  let r=submitCommand(s,{type:'CREATE_RUNNER',unit_id:'s11',issuer_id:'co'});
  expect(r.accepted).toBe(true);s=r.state;
  expect(s.units.s11.steps).toHaveLength(2);
  expect(s.runners[0].step.id).toBe(donorStep);
  expect(getPlayerView(s).units.find(u=>u.id==='co').options.find(o=>o.type==='DISPATCH_RUNNER').available).toBe(true);
  r=submitCommand(s,{type:'DISPATCH_RUNNER',unit_id:'co',issuer_id:'co',target_id:'hq1'});
  expect(r.accepted).toBe(true);s=r.state;
  expect(s.units[s.runners[0].id].exposed).toBe(true);
  s.turn=2;s.phase='BN_ACTIVATION';s.impulse=null;s.activated=[];s.completed=[];
  s=advancePhase(s).state;
  expect(s.activated).toContain('hq1');
  expect(s.runners[0].status).toBe('BOX');
  expect(s.units[s.runners[0].id]).toBeUndefined();
 });
});
