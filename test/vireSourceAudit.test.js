import {it,expect} from 'vitest';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {previewVireSetup} from '../src/sim/company/vireSetup.js';
import {vire} from '../src/scenarios/vire.js';
import {cards} from '../src/sim/company/core.js';
import {placePackage,availableCounters,contactDirection,packageAvailable} from '../src/sim/company/missionContacts.js';
import {supportRequest,applySupportChoice} from '../src/sim/company/missionFeatures.js';
import {specialActivity} from '../src/sim/company/specialEnemies.js';
import {orderReason} from '../src/sim/company/actions.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
const fresh=()=>{
 const s=createVireDevelopmentMission('vire-source-audit',{}, {},{mission_instance_id:'source-audit'});
 for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,revealed:true,known:true,elevation:0,protection:0,burst:0,covers:[],borders:Object.fromEntries(['N','S','E','W','NE','NW','SE','SW'].map(k=>[k,'white']))});
 s.units.s11.location='r1c2';return s;
};
const numbered=(s,sides,n)=>{const first=Object.values(cards).find(c=>c.id!==51&&c.random[sides-2]===n),rest=Object.values(cards).find(c=>c.id!==51&&c.random[6]<=4&&!c.short);s.deck.order=[first.id,...Array(250).fill(rest.id)];};
for(let n=1;n<=9;n++)it(`executes the printed mine follow-up R#9=${n}`,()=>{
 const s=fresh();numbered(s,9,n);expect(placePackage(s,s.contacts.pc_r1c2,vire.packages[1])).toBe(true);
 const enemies=Object.values(s.units).filter(u=>u.faction==='enemy');expect(enemies.map(u=>u.kind)).toEqual(n<=3?[]:n<=6?['HMG']:['SNIPER']);expect(s.locations.r1c2.mines).toBe(true);
 if(n>=4&&n<=6)expect(enemies[0].ammo.MG).toBe(6); // Same mission HMG counter load as printed package 5.
});
for(let n=1;n<=10;n++)it(`executes close/point-blank placement boundary R#10=${n}`,()=>{
 for(const [number,p,kind] of [[4,vire.packages[4],'LMG'],[9,vire.packages[9].alternatives[0],'SQUAD']]){
  const s=fresh();numbered(s,10,n);expect(placePackage(s,s.contacts.pc_r1c2,p)).toBe(true);const u=Object.values(s.units).find(u=>u.kind===kind&&u.faction==='enemy');
  const l=s.locations[u.location];expect(Math.max(Math.abs(l.row-1),Math.abs(l.col-2))).toBe(n<=2?(number===4?0:1):u.range);
 }
});
for(let n=1;n<=8;n++)it(`uses the published contact-direction R#8=${n}`,()=>{const s=fresh();numbered(s,8,n);expect(contactDirection(s,s.locations.r1c2)).toBe(n<=4?0:n<=6?-1:1);});
it('rejects exhausted force stock without spending cards and returns removed counters to stock',()=>{
 const s=fresh(),pool=availableCounters(s,'HMG');for(const c of pool)s.units[`held_${c.id}`]={id:`held_${c.id}`,counter_id:c.id,kind:c.kind,location:'r0c1',faction:'enemy',steps:[{id:c.id}],removed:null};
 const before=structuredClone(s);expect(packageAvailable(s,s.contacts.pc_r1c2,vire.packages[5])).toBe(false);expect(s).toEqual(before);
 s.units[`held_${pool[0].id}`].removed='WITHDRAWN';expect(packageAvailable(s,s.contacts.pc_r1c2,vire.packages[5])).toBe(true);
});
it('validates mounted Jeep choices during preview, including observer-only capacity',()=>{
 expect(()=>previewVireSetup('jeep-invalid',{}, {},{use:true,arty_radio:true,passengers:['co']})).toThrow(/observer/);
 expect(()=>previewVireSetup('jeep-invalid',{}, {},{use:true,location:'r1c2'})).toThrow(/staging/);
 expect(previewVireSetup('jeep-valid',{}, {},{use:true,arty_radio:true,passengers:['artyfo']}).jeep_setup.use).toBe(true);
});
it('uses every agency/ammunition/caller allowance, registration bonus and finite support inventory',()=>{
 for(const [id,agency] of Object.entries(vire.support_agencies))for(const ammo of Object.keys(agency.inventory))for(const caller of ['co','artyfo','mtrfo']){
  const s=fresh(),u=s.units[caller];u.experience='Line';u.location='r1c2';const hit=Object.values(cards).find(c=>c.burst&&!c.multi&&!c.short&&c.id!==51);s.deck.order=Array(200).fill(hit.id);
  const count=(agency.ammo_draws?.[ammo]??agency.draws)[u.agency_role],before=s.deck.draws;supportRequest(s,u,id,ammo,'r2c2');expect(s.deck.draws-before).toBe(count);expect(s.support_inventory[id][ammo]).toBe(agency.inventory[ammo]-1);
  const next=s.deck.draws;if(s.support_inventory[id][ammo]){supportRequest(s,u,id,ammo,'r2c2');expect(s.deck.draws-next).toBe(count+1);}
  s.support_inventory[id][ammo]=0;const saved=structuredClone(s);expect(()=>supportRequest(s,u,id,ammo,'r2c2')).toThrow(/remaining/);expect(s).toEqual(saved);
 }
});
it('resolves a battalion choice without a further draw, inventory debit or command',()=>{
 for(const adjacent of [false,true]){
  const s=fresh(),u=s.units.artyfo;u.location='r1c2';u.experience='Line';const hit=Object.values(cards).find(c=>c.multi&&!c.short&&c.id!==51);s.deck.order=Array(30).fill(hit.id);supportRequest(s,u,'artillery','HE','r2c2');expect(s.pending_support).toBeTruthy();
  const before={draws:s.deck.draws,inventory:s.support_inventory.artillery.HE},locations=adjacent?s.pending_support.adjacent.slice(0,2):[];applySupportChoice(s,{locations});expect(s.support).toHaveLength(adjacent?3:1);expect({draws:s.deck.draws,inventory:s.support_inventory.artillery.HE}).toEqual(before);
 }
});
it('permits actual artillery calls only while the mounted observer is aboard',()=>{
 const s=createVireDevelopmentMission('mounted-call',{}, {},{jeep:{use:true,arty_radio:true,passengers:['artyfo']},mission_instance_id:'mounted-call'});s.phase='GENERAL_INITIATIVE';s.impulse={id:'general',hq:'general',commands:1,spent:0};s.units.artyfo.location='r1c2';s.vire_runtime.vehicles.company_jeep.location='r1c2';
 const c={type:'CALL_ARTILLERY_WP',unit_id:'artyfo',issuer_id:'general',target_id:'r1c2'};expect(orderReason(s,c)).toBeNull();s.units.artyfo.embarked_on=null;expect(orderReason(s,c)).toMatch(/ARTY radio/);
});
it('consumes a spotter placement mission, uses its three-card subsequent allowance and withdraws at exhaustion',()=>{
 const s=fresh();expect(placePackage(s,s.contacts.pc_r1c2,vire.packages[2].alternatives[1])).toBe(true);const u=Object.values(s.units).find(u=>u.kind==='SPOTTER');expect(u.missions_remaining).toBe(1);expect(u.calls_made).toBe(1);s.turn++;
 s.registered_targets.enemy_mortar=null;const hit=Object.values(cards).find(c=>c.burst&&!c.short&&c.id!==51);s.deck.order=Array(100).fill(hit.id);const before=s.deck.draws;specialActivity(s,u,()=>{});expect(s.deck.draws-before).toBe(3);expect(u.missions_remaining).toBe(0);specialActivity(s,u,()=>{});expect(u.removed).toBe('WITHDRAWN');
});

for(const code of ['EVAC','DISPLACE_HMG','DISPLACE_LEADER','DISPLACE_MORTAR'])it(`respects tank-only US occupation for ${code}`,()=>{
 for(const occupied of [false,true]){
  const s=fresh();s.units.s11.location='r0c1';if(occupied)s.vire_runtime.vehicles.sherman_hq.location='r2c2';
  const enemy={...structuredClone(s.units.s11),id:'held_enemy',faction:'enemy',location:'r2c2',kind:code.slice(9),cohesion:'GOOD'};s.units[enemy.id]=enemy;
  s.casualties=[{id:'held_casualty',faction:'enemy',location:'r2c2'}];s.pending_event={side:'enemy',code,turn:s.turn};s.hq_events.push({...s.pending_event,lead:0,completed:false});resolveNormandyEvent(s,'enemy');
  if(code==='EVAC')expect(s.casualties).toHaveLength(occupied?1:0);else expect(!!enemy.removed).toBe(!occupied);
 }
});
