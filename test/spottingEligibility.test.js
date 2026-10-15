import {it,expect} from 'vitest';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {getPlayerView,exportReplay,replayMission,createMission,endTurn} from '../src/sim/company/engine.js';
import {eligibleTargets,submitCommand,splitTeam} from '../src/sim/company/actions.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {cards} from '../src/sim/company/core.js';
it('does not offer Spot to any of four assault teams occupying Row-1 potential contacts',()=>{
 const s=createVireDevelopmentMission('pc-only');s.phase='GENERAL_INITIATIVE';s.impulse={id:'fixture',hq:'general',commands:4,spent:0};
 for(const [i,id] of ['s11','s12','s13','s21'].entries()){
  const parent=s.units[id],team=splitTeam(s,parent,'A',parent.steps.pop());team.location=`r1c${i+1}`;
  expect(s.contacts[`pc_${team.location}`].resolved).toBe(false);
  expect(eligibleTargets(s,team,'SPOT')).toEqual([]);
  expect(getPlayerView(s).units.find(u=>u.id===team.id).options.find(o=>o.type==='SPOT').available).toBe(false);
  const before=structuredClone(s.deck),r=submitCommand(s,{type:'SPOT',unit_id:team.id,issuer_id:team.id,target_id:team.location});
  expect(r.accepted).toBe(false);expect(r.state.impulse.commands).toBe(4);expect(r.state.deck).toEqual(before);
 }
});
it('requires a current unspotted position, excludes spotted/removed units and respects LOS and staging',()=>{
 const s=createMission(trevieres,'spot-eligibility'),u=s.units.s11;u.location='r1c1';
 const enemy={...structuredClone(u),id:'enemy',faction:'enemy',unspotted_position_public:true};s.units.enemy=enemy;
 expect(eligibleTargets(s,u,'SPOT')).toContain(u.location);
 s.knowledge.spotted.enemy={id:'enemy'};expect(eligibleTargets(s,u,'SPOT')).toEqual([]);delete s.knowledge.spotted.enemy;
 enemy.removed='WITHDRAWN';expect(eligibleTargets(s,u,'SPOT')).toEqual([]);enemy.removed=null;
 s.locations.r5c9={...s.locations.r1c1,id:'r5c9',row:5,col:9};enemy.location='r5c9';expect(eligibleTargets(s,u,'SPOT')).toEqual([]);
 u.location='r0c1';enemy.location='r1c1';expect(eligibleTargets(s,u,'SPOT')).toEqual([]);
});
it('retains exact current replay with no empty-card spotting orders',()=>{
 const s=endTurn(createMission(trevieres,'restricted-spot')).state;
 expect(replayMission(trevieres,exportReplay(s))).toEqual(s);
});
it('spots a real unspotted enemy without evaluating the potential contact on that card',()=>{
 const s=createMission(trevieres,'spot-not-pc'),u=s.units.s11;u.location='r1c1';s.phase='GENERAL_INITIATIVE';s.impulse={id:'fixture',hq:'general',commands:4,spent:0};
 s.units.enemy={...structuredClone(u),id:'enemy',faction:'enemy',kind:'SPOTTER',vof:null,fire:null,unspotted_position_public:true};
 const before=structuredClone(s.contacts.pc_r1c1),crosshairs=Object.values(cards).find(c=>c.id!==51&&c.spot);
 s.deck.order=[crosshairs.id,crosshairs.id,crosshairs.id,...s.deck.order];
 const r=submitCommand(s,{type:'SPOT',unit_id:u.id,issuer_id:u.id,target_id:u.location});
 expect(r.accepted).toBe(true);expect(r.state.knowledge.spotted.enemy).toBeTruthy();expect(r.state.contacts.pc_r1c1).toEqual(before);
});
