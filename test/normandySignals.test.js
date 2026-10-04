import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,getPlayerView} from '../src/sim/company/engine.js';
import {materializeScenario,SIGNAL_KEYS} from '../src/sim/company/missionSetup.js';
import {cards} from '../src/sim/company/core.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('Normandy pyrotechnic orders',()=>{
 it('uses the configured phase line and validates its row before issuing a cross-line signal',()=>{
  const s=createMission(candidate,'phase-lines',{phase_lines:{1:2,2:3}});
  s.signal_plan.rsp='XPL1';s.units.s11.location='r1c1';
  s.phase='CO_ACTIVATION';s.activated=['co'];s.impulse={id:'line-impulse',hq:'co',commands:2,spent:0};
  const r=submitCommand(s,{type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location});
  expect(r.accepted).toBe(true);expect(r.state.units.s11.location).toBe('r2c1');
  expect(()=>createMission(candidate,'invalid-lines',{phase_lines:{1:3,2:2}})).toThrow('ordered Phase Lines');
 });
 it('makes one infiltration attempt and moves exposed when that attempt fails',()=>{
  const s=createMission(candidate,'signal-infiltration');
  s.signal_plan.rsp='INFAP2PO';s.units.s11.location=s.objectives.attack;
  s.fire=[{source:'fixture_enemy',target:s.objectives.attack,value:-1}];
  s.phase='CO_ACTIVATION';s.activated=['co'];s.impulse={id:'signal-impulse',hq:'co',commands:3,spent:0};
  const miss=Object.values(cards).find(c=>c.id!==51&&!c.infiltrate&&c.word.toLowerCase()!=='infiltrate').id;
  s.deck.order=[miss,miss,...s.deck.order];
  const result=submitCommand(s,{type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location});
  expect(result.accepted).toBe(true);
  expect(result.state.units.s11.location).toBe(s.objectives.primary);
  expect(result.state.units.s11.exposed).toBe(true);
  const attempts=result.events.filter(e=>e.type==='CARDS_DRAWN'&&e.purpose.includes('infiltration'));
  expect(attempts).toHaveLength(1);expect(attempts[0].card_ids).toHaveLength(2);
 });
 it('requires one carrier and a published offensive order for each printed device',()=>{
  expect(()=>materializeScenario(trevieres,'signals',{signals:{rsp:{carrier:'co',order:'CF'}}})).toThrow('eight signal');
  const scenario=materializeScenario(trevieres,'signals');
  expect(Object.keys(scenario.signal_plan)).toEqual(SIGNAL_KEYS);
  expect(scenario.assets.co.rsp).toBe(1);
 });
 it('spends its one-use device and replays a visible cease-fire signal',()=>{
  let s=createMission(candidate,'signal-command');
  s.phase='CO_ACTIVATION';s.activated=['co'];s.impulse={id:'signal-impulse',hq:'co',commands:3,spent:0};
  s.units.co.fire='r1c2';s.units.hq1.fire='r1c1';
  expect(getPlayerView(s).units.find(u=>u.id==='co').options.find(o=>o.type==='PYRO_RSP').available).toBe(true);
  const result=submitCommand(s,{type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location});
  expect(result.accepted).toBe(true);
  expect(result.state.units.co.assets.rsp).toBe(0);
  expect(result.state.units.hq1.fire).toBeNull();
  expect(result.state.events.at(-2).type).toBe('SIGNAL_DEPLOYED');
 });
});
