import {it,expect} from 'vitest';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {cards} from '../src/sim/company/core.js';
import {placePackage,packageAvailable,availableCounters} from '../src/sim/company/missionContacts.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {tinchebrayVehicleDeployments} from '../src/sim/company/tinchebrayDeployment.js';
import {supportRequest,applySupportChoice} from '../src/sim/company/missionFeatures.js';
const fresh=()=>{
 const s=createTinchebrayDevelopmentMission('m7-execution',{}, {},{mission_instance_id:'m7-execution'});
 for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,known:true,revealed:true,elevation:0,protection:0,burst:0,covers:[],borders:Object.fromEntries(['N','S','E','W','NE','NW','SE','SW'].map(k=>[k,'white']))});
 s.units.s11.location='r1c2';return s;
};
for(const [number,p] of Object.entries(tinchebray.packages))for(const [branch,variant] of (p.alternatives??[p]).entries())it(`executes M7 package ${number} branch ${branch}`,()=>{
 const s=fresh(),rest=Object.values(cards).find(c=>c.id!==51&&c.random[6]<=4&&!c.short);s.deck.order=Array(250).fill(rest.id);
 expect(placePackage(s,s.contacts.pc_r1c2,variant)).toBe(true);
 const enemies=Object.values(s.units).filter(u=>u.faction==='enemy');
 for(const u of enemies)expect(u.original_experience).toBe('Green');
 for(const spec of variant.units??[])expect(enemies.some(u=>u.kind===spec.kind)).toBe(true);
 for(const spec of variant.units??[])if(spec.ammo!==undefined)expect(enemies.find(u=>u.kind===spec.kind).initial_resources.ammo[spec.kind==='MORTAR'?'MTR':spec.kind==='PANZERSCHRECK'?'RKT':['PAK40','INFANTRY_GUN75'].includes(spec.kind)?'GUN':'MG']).toBe(spec.ammo);
 if(variant.spotted)for(const u of enemies)expect(s.knowledge.spotted[u.id]).toBeTruthy();
 if(variant.no_fire)for(const u of enemies)expect(u.fire).toBeFalsy();
});
for(let n=1;n<=10;n++)it(`M7 close/point-blank R10 boundary ${n}`,()=>{
 for(const [number,p,kind] of [[4,tinchebray.packages[4],'LMG'],[9,tinchebray.packages[9].alternatives[0],'SQUAD']]){
  const s=fresh(),first=Object.values(cards).find(c=>c.id!==51&&c.random[8]===n),rest=Object.values(cards).find(c=>c.id!==51&&c.random[6]<=4&&!c.short);s.deck.order=[first.id,...Array(250).fill(rest.id)];
  expect(placePackage(s,s.contacts.pc_r1c2,p)).toBe(true);const u=Object.values(s.units).find(u=>u.kind===kind&&u.faction==='enemy'),l=s.locations[u.location];
  expect(Math.max(Math.abs(l.row-1),Math.abs(l.col-2))).toBe(n<=2?(number===4?0:1):u.range);
 }
});
it('rejects exhausted M7 counter stock without spending cards or mutating the battlefield',()=>{
 const s=fresh();for(const c of availableCounters(s,'HMG'))s.units[`held_${c.id}`]={id:`held_${c.id}`,counter_id:c.id,kind:c.kind,location:'r0c1',faction:'enemy',steps:[{id:c.id}],removed:null};
 const before=structuredClone(s);expect(packageAvailable(s,s.contacts.pc_r1c2,tinchebray.packages[5])).toBe(false);expect(s).toEqual(before);
});
it('executes the nested squad-plus-leader alternative, sharing the squad position and cover',()=>{
 const s=fresh(),first=Object.values(cards).find(c=>c.id!==51&&c.random[0]===2),rest=Object.values(cards).find(c=>c.id!==51&&c.random[6]<=4&&!c.short);s.deck.order=[first.id,...Array(250).fill(rest.id)];
 expect(placePackage(s,s.contacts.pc_r1c2,tinchebray.packages[9])).toBe(true);
 const squad=Object.values(s.units).find(u=>u.faction==='enemy'&&u.kind==='SQUAD'),leader=Object.values(s.units).find(u=>u.faction==='enemy'&&u.kind==='LEADER');
 expect(leader).toBeTruthy();expect(leader.location).toBe(squad.location);expect(leader.cover).toBe(squad.cover);expect(leader.assets.rifle_grenade).toBe(1);
});
it('uses printed support caller draws, finite stocks and battalion choices without a second debit',()=>{
 for(const [id,agency] of Object.entries(tinchebray.support_agencies))for(const ammo of Object.keys(agency.inventory))for(const caller of ['co','artyfo','mtrfo']){
  const s=fresh(),u=s.units[caller];u.location='r1c2';u.experience='Line';const hit=Object.values(cards).find(c=>c.burst&&!c.multi&&!c.short&&c.id!==51);s.deck.order=Array(100).fill(hit.id);
  const count=(agency.ammo_draws?.[ammo]??agency.draws)[u.agency_role],draws=s.deck.draws;
  supportRequest(s,u,id,ammo,'r2c2');expect(s.deck.draws-draws).toBe(count);expect(s.support_inventory[id][ammo]).toBe(agency.inventory[ammo]-1);
  s.support_inventory[id][ammo]=0;const before=structuredClone(s);expect(()=>supportRequest(s,u,id,ammo,'r2c2')).toThrow(/remaining/);expect(s).toEqual(before);
 }
 for(const adjacent of [false,true]){
  const s=fresh(),u=s.units.artyfo;u.location='r1c2';const hit=Object.values(cards).find(c=>c.multi&&!c.short&&c.id!==51);s.deck.order=Array(100).fill(hit.id);supportRequest(s,u,'artillery','HE','r2c2');expect(s.pending_support).toBeTruthy();
  const before={draws:s.deck.draws,ammo:s.support_inventory.artillery.HE};applySupportChoice(s,{locations:adjacent?s.pending_support.adjacent.slice(0,2):[]});expect(s.support).toHaveLength(adjacent?3:1);expect({draws:s.deck.draws,ammo:s.support_inventory.artillery.HE}).toEqual(before);
 }
});
for(const side of ['friendly','enemy'])for(const period of ['early','late'])for(const [index,code] of tinchebray.rules[`${side}_event_tables`][period].entries())it(`executes M7 ${side} ${period} slot ${index+1}: ${code}`,()=>{
 const s=fresh();s.turn=period==='early'?2:7;
 const check=Object.values(cards).find(c=>c.hq&&c.id!==51),number=Object.values(cards).find(c=>c.random[8]===index+1&&c.id!==51);
 s.deck.order=[check.id,number.id,...Array(100).fill(number.id)];
 resolveNormandyEvent(s,side);expect(s.hq_events.at(-1).code).toBe(code);
 expect(s.counterattack_ends_after).toBeFalsy();
 if(code==='NO_ARTY'){expect(s.support_unavailable).toContain('artillery');expect(s.support_unavailable).not.toContain('cannon');}
 if(code==='TANK_SUPPORT'){
  expect(s.pending_event.code).toBe(code);const draws=s.deck.draws;
  resolveNormandyEvent(s,side,{vehicle_positions:Object.fromEntries(tinchebrayVehicleDeployments('event').map(v=>[v.id,v.location]))});
  expect(s.deck.draws).toBe(draws);expect(s.vire_runtime.tank_support_used).toBe(true);
  expect(Object.values(s.vire_runtime.vehicles).filter(v=>v.profile==='M5_LIGHT37')).toHaveLength(5);
 }
 if(code==='RESUPPLY'){resolveNormandyEvent(s,side,{ammo_type:'MG',location:'r1c1'});expect(s.assets.at(-1)).toMatchObject({key:'MG',quantity:4,location:'r1c1'});}
});
