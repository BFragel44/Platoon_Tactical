import {basicValue,rangeOf} from '../src/sim/company/battlefield.js';
import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,advancePhase,getPlayerView} from '../src/sim/company/engine.js';
import {higherEvent,scoreMission} from '../src/sim/company/missionFeatures.js';
import {cards} from '../src/sim/company/core.js';
import {enemyActivity} from '../src/sim/company/combat.js';
const fresh=()=>createMission({...keepUpTheFire,readiness:{playable:true}},'events');
function forceEvent(s,side,number){
 const roll=Object.values(cards).find(c=>c.random[8]===number);
 const check=Object.values(cards).find(c=>c.hq&&c.id!==roll.id);
 s.deck.order=[check.id,roll.id,...s.deck.order.filter(id=>id!==check.id&&id!==roll.id)];
 higherEvent(s,side);
}
const enemy=(s,id,cohesion='GOOD')=>s.units[id]={...structuredClone(s.units.s11),id,name:'Enemy',kind:'LMG',faction:'enemy',location:'r1c1',cohesion,pinned:true,steps:[{id:`${id}_step`,personnel:[]}],fire:null};
describe('Published higher-HQ event tables',()=>{
 // Keep Up the Fire p.8, columns 2–4 / 5–7 / 8–10, R# 1–10.
 const tables={friendly:[
  ['COMM','COMM','COMM','ADVANCE','ADVANCE','ADVANCE','HOLD','NO_MORTAR','NO_MORTAR','NO_ARTY'],
  ['SITREP','SITREP','COMM','ADVANCE','ADVANCE','HOLD','AMMO','NO_MORTAR','NO_ARTY','NO_ARTY'],
  ['SITREP','SITREP','COMM','ADVANCE','HOLD','AMMO','AMMO','AMMO','NO_MORTAR','NO_ARTY']],enemy:[
  ['REINFORCE','UNPIN','UNPIN','UNPIN','UNPIN','UNPIN','RECOVER','RECOVER','RECOVER','BREAK'],
  ['EVAC','EVAC','REINFORCE','REINFORCE','UNPIN','UNPIN','RECOVER','AMMO','AMMO','BREAK'],
  ['EVAC','EVAC','REINFORCE','REINFORCE','UNPIN','RECOVER','AMMO','AMMO','BREAK','SURRENDER']]};
 for(const side of ['friendly','enemy'])for(const turn of [2,4,5,7,8,10])it(`${side} turn ${turn}: every R# matches the printed table`,()=>{
  for(let n=1;n<=10;n++){const s=fresh();s.turn=turn;forceEvent(s,side,n);expect(s.hq_events.at(-1).code).toBe(tables[side][turn<5?0:turn<8?1:2][n-1]);}
 });
 it('blocks BN activation, pays the first three commands and ends outages at cleanup',()=>{
  let s=fresh();s.turn=2;forceEvent(s,'friendly',1);s.units.co.saved=3;s.phase='BN_ACTIVATION';
  s=advancePhase(s).state;expect(s.activated).not.toContain('co');
  s.phase='SUBORDINATE_ACTIVATION';s.impulse=null;s=advancePhase(s).state;
  expect(s.phase).toBe('CO_INITIATIVE');expect(s.impulse.spent).toBe(3);expect(s.command_obligation).toBe(0);
  expect(s.hq_events.at(-1).completed).toBe(true);
  s.impulse=null;s.phase='CLEANUP';s.support_unavailable=['artillery'];s=advancePhase(s).state;
  expect(s.bn_blocked).toBe(false);expect(s.support_unavailable).toEqual([]);
  expect(s.achievements).toContainEqual(expect.objectContaining({key:'event_2_COMM',points:1}));
 });
 it('prevents a rallied enemy from acting again in the same activity segment',()=>{
  const s=fresh();s.turn=2;const u=enemy(s,'rallied');forceEvent(s,'enemy',2);
  expect(u.pinned).toBe(false);expect(u.event_acted).toBe(2);
  const before=s.deck.draws;enemyActivity(s);expect(s.deck.draws).toBe(before);
 });
 it('surrender records prisoners without spending a U.S. guard step and scores once',()=>{
  const s=fresh();s.turn=8;s.units.s11.location='r1c1';const u=enemy(s,'surrendered');const count=s.units.s11.steps.length;
  forceEvent(s,'enemy',10);expect(u.removed).toBe('CAPTURED');expect(s.units.s11.steps).toHaveLength(count);
  expect(s.prisoners.at(-1)).toMatchObject({guard:null,prisoners:[{id:'surrendered_step'}]});
  scoreMission(s);scoreMission(s);expect(s.achievements.filter(a=>a.key==='prisoner_surrendered_step')).toHaveLength(1);
 });
 it('describes actual mission events instead of the course skipped-phase text',()=>{
  const s=fresh();expect(getPlayerView(s).phase_description).toContain('turn 1');s.turn=2;
  expect(getPlayerView(s).phase_description).toContain('higher-HQ event');
 });
});

describe('Mission event-driven ammunition',()=>{
 it('reduces and restores friendly MG fire without affecting rifle squads',()=>{
  const s=fresh();s.turn=5;const u=s.units.mg1;u.location='r1c1';
  forceEvent(s,'friendly',7);expect(u.out_of_ammo).toBe(true);expect(basicValue(u,1)).toBe(0);expect(rangeOf(u)).toBe(1);
  expect(s.units.s11.out_of_ammo).toBeFalsy();
  forceEvent(s,'friendly',7);expect(u.out_of_ammo).toBe(false);expect(basicValue(u,1)).toBe(-1);expect(rangeOf(u)).toBe(2);
 });
 it('marks affected enemy MGs as acted and restores their ammunition on repetition',()=>{
  const s=fresh();s.turn=5;const u=enemy(s,'mg');u.pinned=false;u.vof='A';
  forceEvent(s,'enemy',8);expect(u.out_of_ammo).toBe(true);expect(u.event_acted).toBe(5);
  const before=s.deck.draws;enemyActivity(s);expect(s.deck.draws).toBe(before);
  forceEvent(s,'enemy',8);expect(u.out_of_ammo).toBe(false);
 });
});
