import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,advancePhase,submitCommand} from '../src/sim/company/engine.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {attempt,cards} from '../src/sim/company/core.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('Normandy higher HQ event choices',()=>{
 it('selects the senior command-side visitor even when pinned',()=>{
  const s=createMission(candidate,'senior-visitor');
  for(const [id,priority,pinned]of [['a_junior',2,false],['z_senior',0,true]])s.units[id]={...structuredClone(s.units.co),id,command_role:'higher_hq',capabilities:{higher_priority:priority},pinned};
  s.phase='DEFENSIVE_ACTIVITY';const next=advancePhase(s).state;
  expect(next.impulse).toMatchObject({hq:'z_senior',commands:6});
 });
 it('does not fall back to off-map BN activation while a visitor is on its Fire Team side',()=>{
  const s=createMission(candidate,'visitor-fire');s.units.visitor={...structuredClone(s.units.co),id:'visitor',command_role:'higher_hq',cohesion:'F'};
  s.phase='BN_ACTIVATION';s.impulse=null;
  const next=advancePhase(s).state;expect(next.activated).not.toContain('co');
 });
 it('keeps a visitor for its triggering turn and the next turn only',()=>{
  let s=createMission(candidate,'visitor-expiry');s.turn=2;
  s.units.visitor={...structuredClone(s.units.co),id:'visitor',command_role:'higher_hq',expires_turn:3};
  s.phase='CLEANUP';s.impulse=null;s=advancePhase(s).state;
  expect(s.turn).toBe(3);expect(s.units.visitor.removed).toBeNull();
  s.phase='CLEANUP';s.impulse=null;s=advancePhase(s).state;
  expect(s.turn).toBe(4);expect(s.units.visitor.removed).toBe('DEPARTED');
 });
 it('makes rally attempts under fire and upgrades a Fire LAT to Assault, not a full unit',()=>{
  const s=createMission(candidate,'rally-event');s.turn=2;
  const pinned={...structuredClone(s.units.s11),id:'pinned_enemy',faction:'enemy',location:'r2c2',pinned:true};
  const lat={...structuredClone(pinned),id:'fire_enemy',name:'Fire team',kind:'LAT',named:false,cohesion:'F',experience:'Green',steps:[pinned.steps[0]],location:'r2c3',pinned:false};
  s.units[pinned.id]=pinned;s.units[lat.id]=lat;
  s.fire=[{source:'s11',target:pinned.location,value:-1}];
  const hq=Object.values(cards).find(c=>c.hq).id;
  const roll=Object.values(cards).find(c=>c.random[8]===5).id;
  const miss=Object.values(cards).find(c=>c.id!==51&&c.word!=='Rally').id;
  s.deck.order=[hq,roll,miss,miss,...s.deck.order];
  resolveNormandyEvent(s,'enemy');
  expect(pinned.pinned).toBe(true);
  expect(lat.cohesion).toBe('A');expect(lat.experience).toBe('Line');
  expect(s.events.some(e=>e.type==='RALLY_ATTEMPT'&&e.actor===pinned.id&&!e.success)).toBe(true);
 });
 it('waits for a Row 1 ammunition decision and records the result',()=>{
  const s=createMission(candidate,'hq-event');s.turn=2;
  s.deck.order=[1,41,...s.deck.order];
  resolveNormandyEvent(s,'friendly');
  expect(s.pending_event).toMatchObject({code:'RESUPPLY'});
  expect(s.assets.filter(a=>a.type==='AMMO')).toHaveLength(0);
  resolveNormandyEvent(s,'friendly',{ammo_type:'MTR',location:'r1c3'});
  expect(s.pending_event).toBeNull();
  expect(s.assets.find(a=>a.type==='AMMO')).toMatchObject({key:'MTR',quantity:4,location:'r1c3'});
 });
 it('adds a draw to enemy attempts only with a good-order local leader',()=>{
  const s=createMission(candidate,'leader-attempt');
  const enemy={id:'enemy_fixture',name:'Grenadier',kind:'SQUAD',faction:'enemy',location:'r2c2',experience:'Line',steps:[{}],cohesion:'GOOD'};
  const leader={id:'leader_fixture',name:'German leader',kind:'LEADER',faction:'enemy',location:'r2c2',experience:'Line',steps:[{}],cohesion:'GOOD',pinned:false};
  s.units[enemy.id]=enemy;s.units[leader.id]=leader;
  s.deck.order=[1,2,3,4,5,...s.deck.order];
  const before=s.deck.draws;attempt(s,enemy,2,'burst','led attempt');expect(s.deck.draws-before).toBe(3);
  leader.pinned=true;const after=s.deck.draws;attempt(s,enemy,2,'burst','unled attempt');expect(s.deck.draws-after).toBe(2);
 });
 it('gives an on-map higher HQ six unsaveable BN commands and an explicit CO activation',()=>{
  const s=createMission(candidate,'visitor-commands');
  const co=s.units.co;
  s.units.higher_fixture={...structuredClone(co),id:'higher_fixture',name:'BN Staff',kind:'STAFF',command_role:'higher_hq',radios:[],steps:[{id:'higher_step',personnel:[]}],saved:0};
  s.phase='DEFENSIVE_ACTIVITY';
  const bn=advancePhase(s).state;
  expect(bn.phase).toBe('BN_ACTIVATION');
  expect(bn.impulse).toMatchObject({hq:'higher_fixture',commands:6});
  const order=submitCommand(bn,{type:'ACTIVATE',unit_id:'higher_fixture',issuer_id:'higher_fixture',target_id:'co'});
  expect(order.accepted).toBe(true);
  expect(order.state.activated).toContain('co');
  const coPhase=advancePhase(order.state).state;
  expect(coPhase.phase).toBe('CO_ACTIVATION');
  expect(coPhase.units.higher_fixture.saved).toBe(0);
 });
 it('resolves every printed friendly and enemy HQ event slot',()=>{
  const hq=Object.values(cards).find(c=>c.hq).id;
  const early=['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','ADVANCE_PC','RESUPPLY','RESUPPLY'];
  const late=['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','RESUPPLY','RESUPPLY','RESUPPLY'];
  const enemy=['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK','COUNTER_ATTACK'];
  for(const [side,turn,table] of [['friendly',2,early],['friendly',7,late],['enemy',2,enemy]])for(let roll=1;roll<=10;roll++){
   const s=createMission(candidate,`event-${side}-${turn}-${roll}`);s.turn=turn;
   const card=Object.values(cards).find(c=>c.random[8]===roll);
   expect(card).toBeDefined();s.deck.order=[hq,card.id,...s.deck.order];
   const event=resolveNormandyEvent(s,side);
   expect(event.code).toBe(table[roll-1]);
   if(event.code==='RESUPPLY'){
    expect(s.pending_event).toBeTruthy();
    resolveNormandyEvent(s,side,{ammo_type:'MG',location:'r1c1'});
    expect(s.assets.at(-1)).toMatchObject({type:'AMMO',quantity:4,key:'MG',location:'r1c1'});
   }
   if(event.code==='COUNTER_ATTACK')expect(s.counterattack_ends_after).toBe(turn+2);
  }
 });
});
