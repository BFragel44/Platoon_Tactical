import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,advancePhase,getPlayerView} from '../src/sim/company/engine.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('Normandy runners',()=>{
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
