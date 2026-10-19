import {it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {communication,spot,followsExistingPdf} from '../src/sim/company/battlefield.js';
import {orderReason} from '../src/sim/company/actions.js';
import {rangedWeaponTarget} from '../src/sim/company/rangedWeapons.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
function fresh(){
 const s=createMission(trevieres,'observer-ranged');s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations))Object.assign(l,{terrain:'fields',elevation:1,borders:borders(DIRECTIONS)});
 s.units.co.location='r2c2';s.units.co.cover=null;return s;
}
it.each(['CO','CO_PHONE'])('recovered %s equipment does not grant an FO command-net access',net=>{
 let s=fresh();const fo=s.units.artyfo;fo.location='r2c1';fo.cover=null;
 if(net==='CO_PHONE'){s.mission_rules.communications='phones';s.units.co.radios=['BN','CO_PHONE'];}
 s.assets.push({id:'recovered',type:'RADIO',net,location:fo.location,cover:null,faction:'friendly'});
 const pickup=submitCommand(s,{type:'PICKUP_RADIO',unit_id:fo.id,target_id:'recovered'});expect(pickup.accepted,pickup.reason).toBe(true);s=pickup.state;
 expect(s.units.artyfo.radios).toContain(net);expect(communication(s,s.units.co,s.units.artyfo)).toBeNull();
 expect(communication(s,s.units.artyfo,s.units.co)).toBeNull();
 s.impulse={id:'co-test',hq:'co',commands:6,spent:0};const before=structuredClone(s);
 const rejected=submitCommand(s,{type:'CALL_ARTILLERY_WP',unit_id:'artyfo',issuer_id:'co',target_id:'r3c1'});
 expect(rejected.accepted).toBe(false);expect(rejected.state).toEqual(before);
 // Normal units still use the same command network.
 Object.assign(s.units.hq1,{location:'r2c1',cover:null,radios:[net]});expect(communication(s,s.units.co,s.units.hq1)).toBeTruthy();
 // Voice contact and the observer's own FD net remain legal.
 s.units.artyfo.location=s.units.co.location;expect(communication(s,s.units.co,s.units.artyfo)).toBe('Visual / verbal');
 expect(orderReason(s,{type:'CALL_ARTILLERY_WP',unit_id:'artyfo',issuer_id:'co',target_id:'r3c1'})).toBeNull();
 s.units.artyfo.location='r2c1';s.impulse.hq='general';expect(orderReason(s,{type:'CALL_ARTILLERY_WP',unit_id:'artyfo',target_id:'r3c1'})).toBeNull();
 s.units.artyfo.radios=[net];expect(orderReason(s,{type:'CALL_ARTILLERY_WP',unit_id:'artyfo',target_id:'r3c1'})).toMatch(/ARTY/);
});
function ranged(){
 const s=fresh(),u={...structuredClone(s.units.at1),id:'gun',faction:'enemy',location:'r2c1',cover:null,fire:null,range:3,basic_range:3,grenade_range:3,grenade_ammo:'GUN',ammo:{GUN:6},rocket:false};
 s.units.co.location='r1c4';s.units.gun=u;const t=s.units.s11;t.location='r2c2';t.cover=null;spot(s,t);return {s,u,t};
}
it('accepts enemy ranged targets at different distances along the same PDF',()=>{
 const {s,u,t}=ranged();expect(rangedWeaponTarget(s,u,t)).toBe(true);
 u.fire='r2c3';expect(rangedWeaponTarget(s,u,t)).toBe(true);
 t.location='r2c4';u.fire='r2c2';expect(rangedWeaponTarget(s,u,t)).toBe(true);
 u.fire='r3c1';expect(rangedWeaponTarget(s,u,t)).toBe(false);
});
it('honors another unit’s valid PDF and ignores stale or same-card weapon state',()=>{
 const {s,u,t}=ranged(),ally={...structuredClone(u),id:'ally',grenade_ammo:null,range:3,fire:'r2c3'};s.units.ally=ally;
 expect(rangedWeaponTarget(s,u,t)).toBe(true);ally.fire='r3c1';expect(rangedWeaponTarget(s,u,t)).toBe(false);
 ally.range=ally.basic_range=0;expect(rangedWeaponTarget(s,u,t)).toBe(true);
 ally.fire=u.location;expect(rangedWeaponTarget(s,u,t)).toBe(true);
 ally.fire=null;ally.temporary_pdf={origin:u.location,target:'r2c3'};expect(rangedWeaponTarget(s,u,t)).toBe(true);
 ally.temporary_pdf.target='r3c1';expect(rangedWeaponTarget(s,u,t)).toBe(false);
});
it.each(['point blank','intervening friend','intervening enemy','empty ammo','pinned','Fire Team','range','enclosed rocket'])('keeps enemy ranged restriction: %s',kind=>{
 const {s,u,t}=ranged();t.location='r2c3';
 if(kind==='point blank')s.units.s12.location=u.location;
 if(kind.startsWith('intervening')){const v=s.units.s12;v.location='r2c2';v.faction=kind.endsWith('friend')?'enemy':'friendly';}
 if(kind==='empty ammo')u.ammo.GUN=0;if(kind==='pinned')u.pinned=true;if(kind==='Fire Team')u.cohesion='F';if(kind==='range')u.grenade_range=1;
 if(kind==='enclosed rocket'){u.rocket=true;u.cover='building';s.locations[u.location].covers.push({id:'building',type:'Building',value:2});}
 expect(rangedWeaponTarget(s,u,t)).toBe(false);
});
it('uses the same directional decision for friendly and enemy ranged checks',()=>{
 const {s,u,t}=ranged();u.fire='r2c4';expect(followsExistingPdf(s,u,t.location)).toBe(true);
 expect(rangedWeaponTarget(s,u,t)).toBe(true);
 u.faction='friendly';t.faction='enemy';spot(s,t);
 expect(orderReason(s,{type:'GRENADE',unit_id:u.id,target_id:t.id})).toBeNull();
 u.fire='r3c1';expect(followsExistingPdf(s,u,t.location)).toBe(false);
 expect(orderReason(s,{type:'GRENADE',unit_id:u.id,target_id:t.id})).toMatch(/existing direction/);
});
