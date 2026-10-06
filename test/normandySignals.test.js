import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,getPlayerView} from '../src/sim/company/engine.js';
import {materializeScenario,SIGNAL_KEYS} from '../src/sim/company/missionSetup.js';
import {seesCard} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('Normandy pyrotechnic orders',()=>{
 it.each([['RED_SIGNAL','red_signal',false],['RSP','rsp',true]])('respects smoke LOS while %s flare signaling reaches a distant unit', (action,key,aerial)=>{
  const s=createMission(candidate,`signal-los-${key}`);
  for(const l of Object.values(s.locations))if(!l.staging){l.elevation=1;l.smoke=false;l.borders={N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'};}
  s.units.co.location='r1c2';s.units.s11.location='r3c2';s.locations.r2c2.smoke=true;
  s.units.s11.fire='r3c3';s.units.s11.assets={};s.units.co.assets[key]=1;s.signal_plan[key]='CF';
  expect(seesCard(s,s.units.s11,'r1c2')).toBe(false);
  s.phase='CO_ACTIVATION';s.impulse={id:'los-signal',hq:'co',commands:2,spent:0};
  const r=submitCommand(s,{type:`PYRO_${action}`,unit_id:'co',issuer_id:'co',target_id:'r1c2'});
  expect(r.accepted).toBe(true);expect(r.state.units.s11.fire).toBe(aerial?null:'r3c3');
  expect(r.state.locations.r1c2.smoke).toBe(false);
 });

 it('rejects a pinned signal carrier without spending its device or command',()=>{
  const s=createMission(candidate,'pinned-signal');s.units.co.pinned=true;
  s.phase='CO_ACTIVATION';s.impulse={id:'pinned-signal',hq:'co',commands:2,spent:0};
  const r=submitCommand(s,{type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location});
  expect(r.accepted).toBe(false);expect(r.state).toEqual(s);expect(s.units.co.assets.rsp).toBe(1);
 });
 it('does not move a pinned recipient across a phase line into fire',()=>{
  const s=createMission(candidate,'pinned-recipient');s.signal_plan.rsp='XPL1';
  s.units.s11.location='r0c1';s.units.s11.pinned=true;s.units.s12.location='r0c1';
  s.units.fixture_enemy={...structuredClone(s.units.s21),id:'fixture_enemy',faction:'enemy',location:'r2c1',fire:'r1c1'};
  s.fire=[{source:'fixture_enemy',origin:'r2c1',target:'r1c1',value:-1}];
  s.phase='CO_ACTIVATION';s.impulse={id:'pinned-recipient',hq:'co',commands:2,spent:0};
  const r=submitCommand(s,{type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location});
  expect(r.accepted).toBe(true);expect(r.state.units.s11.location).toBe('r0c1');expect(r.state.units.s12.location).toBe('r1c1');
 });
 it('cannot deploy a consumed device again in a later impulse',()=>{
  const s=createMission(candidate,'consumed-signal');s.phase='CO_ACTIVATION';s.impulse={id:'signal-first',hq:'co',commands:2,spent:0};
  const command={type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location};
  const r=submitCommand(s,command);expect(r.accepted).toBe(true);
  r.state.impulse={id:'signal-second',hq:'co',commands:2,spent:0};
  const again=submitCommand(r.state,command);expect(again.accepted).toBe(false);expect(again.state.units.co.assets.rsp).toBe(0);
 });

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
