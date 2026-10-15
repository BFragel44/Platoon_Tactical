import {it,expect} from 'vitest';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {createMission} from '../src/sim/company/engine.js';
import {orderReason,commandOptions,submitCommand} from '../src/sim/company/actions.js';
const devices=[['SMOKE','smoke'],['WP','wp'],['HANDHELD_ILLUM','illum']];
function fixture(cohesion,pinned=false){
 const s=createMission(stGeorges,'lat-pyrotechnics'),u=s.units.s11;
 Object.assign(u,{kind:'LAT',cohesion,pinned,steps:u.steps.slice(0,1),location:'r2c1',cover:null,used:[],assets:{smoke:1,wp:1,illum:1}});
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'pyro',hq:'general',commands:1,spent:0,origin_spent:{}};return s;
}
for(const [type,asset] of devices){
 for(const cohesion of ['A','F'])it(`${cohesion} deploys ${type} on General Initiative without HQ communication or a draw`,()=>{
  const s=fixture(cohesion),before=structuredClone(s),c={type,unit_id:'s11',issuer_id:'general',target_id:'r2c1'};
  expect(orderReason(s,c)).toBeNull();expect(commandOptions(s,s.units.s11,'general').find(o=>o.type===type).available).toBe(true);
  const r=submitCommand(s,c);expect(r.accepted).toBe(true);expect(r.state.units.s11.assets[asset]).toBe(0);expect(r.state.impulse.commands).toBe(0);expect(r.state.deck.draws).toBe(s.deck.draws);expect(s).toEqual(before);
  if(type!=='HANDHELD_ILLUM')expect(r.state.locations.r2c1.smoke).toBe(true);
  else expect(r.state.markers.some(m=>m.type==='ILLUMINATION')).toBe(true);
 });
 for(const [cohesion,pinned] of [['A',true],['F',true],['L',false],['P',false]])it(`rejects ${type} for ${pinned?'pinned ':''}${cohesion}`,()=>{
  const s=fixture(cohesion,pinned),before=structuredClone(s),c={type,unit_id:'s11',issuer_id:'general',target_id:'r2c1'};
  expect(orderReason(s,c)).toBeTruthy();expect(submitCommand(s,c).accepted).toBe(false);expect(s).toEqual(before);
 });
}
