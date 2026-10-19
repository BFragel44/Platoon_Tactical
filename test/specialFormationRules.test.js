import {it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {spot,refresh,mortarCommunication,communication,vofOf} from '../src/sim/company/battlefield.js';
import {expendAmmunition,pickUpAmmunition} from '../src/sim/company/ammunition.js';
import {concentrate,orderReason} from '../src/sim/company/actions.js';
import {prepareCombat} from '../src/sim/company/combat.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {cards} from '../src/sim/company/core.js';

function fresh(setup={}){
 const s=createMission(trevieres,'special-formation-fixes',setup);s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations)){l.terrain='fields';l.elevation=1;l.borders=borders(DIRECTIONS);}
 s.units.co.location='r2c2';s.units.co.cover=null;return s;
}
function enemy(s,location='r2c3'){
 const e={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location,cover:null,fire:null};s.units[e.id]=e;spot(s,e);return e;
}
function supply(s,u,key,quantity=2){const a={id:'supply',type:'AMMO',key,quantity,faction:'friendly',location:u.location,cover:u.cover};s.assets.push(a);return a;}
it.each([['hmg50','MG'],['at1','RKT'],['mortar1','MTR']])('resupplies %s and restores its named weapon side with the same personnel', (id,key)=>{
 const s=fresh({mortar_mode:'teams'}),u=s.units[id];u.location='r1c1';u.ammo[key]=1;const steps=structuredClone(u.steps);
 expendAmmunition(s,u,key);expect(u.cohesion).toBe('F');supply(s,u,key);
 const r=submitCommand(s,{type:'PICKUP_RADIO',unit_id:id,target_id:'supply'});expect(r.accepted).toBe(true);
 expect(r.state.units[id]).toMatchObject({cohesion:'GOOD',out_of_ammo:false,exposed:true,experience:u.original_experience});
 expect(r.state.units[id].steps).toEqual(steps);
});
it('restores a named weapon through direct ammunition transfer without consuming or restoring the donor',()=>{
 const s=fresh(),u=s.units.hmg50,donor=s.units.s11;u.location=donor.location='r1c1';u.ammo.MG=1;expendAmmunition(s,u,'MG');donor.ammo={MG:2};
 const r=submitCommand(s,{type:'TRANSFER_EQUIPMENT',unit_id:u.id,target_id:`transfer:${donor.id}:AMMO:MG`,quantity:1});
 expect(r.accepted).toBe(true);expect(r.state.units[u.id].cohesion).toBe('GOOD');expect(r.state.units[u.id].ammo.MG).toBe(1);
 expect(r.state.units[donor.id].ammo.MG).toBe(1);expect(r.state.units[donor.id].steps).toEqual(donor.steps);
});
it('does not restore command sides, generic teams or a weapon supplied with the wrong ammunition',()=>{
 for(const kind of ['HQ','LAT','wrong weapon']){
  const s=fresh(),u=s.units.hmg50;u.location='r1c1';u.ammo.MG=0;u.out_of_ammo=true;u.cohesion='F';
  if(kind!=='wrong weapon')u.kind=kind;if(kind==='LAT')u.named=false;
  const key=kind==='wrong weapon'?'MTR':'MG';pickUpAmmunition(s,u,supply(s,u,key));expect(u.cohesion).toBe('F');
  if(kind==='wrong weapon')expect(u.out_of_ammo).toBe(true);
 }
});
it('permits an empty named mortar Fire Team to use hand grenades without consuming mortar stock',()=>{
 const s=fresh({mortar_mode:'teams'}),u=s.units.mortar1;u.location='r1c1';u.ammo.MTR=1;expendAmmunition(s,u,'MTR');const e=enemy(s,u.location);
 const r=submitCommand(s,{type:'GRENADE',unit_id:u.id,target_id:e.id});expect(r.accepted).toBe(true);expect(r.state.units[u.id].ammo.MTR).toBe(0);
 expect(r.state.events.some(e=>e.type==='GRENADE_ATTEMPT')).toBe(true);
});
it('permits hand grenades from Building cover but still blocks ranged bazooka fire and bunker close assault',()=>{
 const s=fresh(),u=s.units.at1;u.location='r1c1';u.cover='cover';s.locations[u.location].covers=[{id:'cover',type:'Building',value:2,known:true}];const e=enemy(s,u.location);
 const c={type:'GRENADE',unit_id:u.id,target_id:e.id};expect(orderReason(s,c)).toBeNull();
 e.location='r1c2';expect(orderReason(s,c)).toMatch(/building or fortification/);
 e.location=u.location;s.locations[u.location].covers[0].type='Bunker';expect(orderReason(s,c)).toMatch(/Leave the fortification/);
});
it('does not let a Good Order mortar fire at point blank or an empty mortar fire ranged grenades',()=>{
 const s=fresh({mortar_mode:'teams'}),u=s.units.mortar1;u.location='r1c1';const e=enemy(s,u.location),c={type:'GRENADE',unit_id:u.id,target_id:e.id};
 expect(orderReason(s,c)).toMatch(/at point blank/);u.ammo.MTR=0;e.location='r1c2';expect(orderReason(s,c)).toMatch(/ammunition/);
});
it('does not retain the bazooka launcher range on its named Fire Team side',()=>{
 const s=fresh(),u=s.units.at1;u.location='r1c1';u.cohesion='F';const e=enemy(s,'r1c2');
 const c={type:'GRENADE',unit_id:u.id,target_id:e.id};expect(orderReason(s,c)).toMatch(/Good Order weapon side/);
 e.location=u.location;expect(orderReason(s,c)).toBeNull();
});
it.each([['hmg50','MG'],['mortar_section','MTR']])('reserves base firing ammunition for %s, including enemy procedures', (id,key)=>{
 const s=fresh(),u=s.units[id];u.location='r2c2';u.ammo[key]=1;const e=enemy(s);u.fire=e.location;refresh(s);
 expect(orderReason(s,{type:'CONCENTRATE',unit_id:id,target_id:e.id})).toMatch(/two ammunition points/);
 const before=structuredClone(s);concentrate(s,u,e);expect(s).toEqual(before);
 u.faction='enemy';e.faction='friendly';const beforeEnemy=structuredClone(s);concentrate(s,u,e);expect(s).toEqual(beforeEnemy);
});
it('spends concentration ammunition only on success and keeps the last point for the normal volley',()=>{
 const s=fresh(),u=s.units.hmg50;u.location='r2c2';u.ammo.MG=2;const e=enemy(s);u.fire=e.location;refresh(s);
 const hit=Object.values(cards).find(c=>c.spot&&!c.jam);s.deck.order=Array(12).fill(hit.id);
 concentrate(s,u,e);expect(u.ammo.MG).toBe(1);expect(s.markers.some(m=>m.type==='CONCENTRATE')).toBe(true);
 const before=structuredClone(s);concentrate(s,u,e);expect(s).toEqual(before);
 const exposure=prepareCombat(s).find(r=>r.target_id===e.id);expect(exposure.sources.some(f=>f.source_id===u.id&&f.vof===-3)).toBe(true);expect(u.ammo.MG).toBe(0);
 const failed=fresh(),gun=failed.units.hmg50;gun.location='r2c2';gun.ammo.MG=2;const target=enemy(failed);gun.fire=target.location;refresh(failed);
 const miss=Object.values(cards).find(c=>!c.spot&&!c.jam);failed.deck.order=Array(12).fill(miss.id);concentrate(failed,gun,target);expect(gun.ammo.MG).toBe(2);
});
it('still lets an out-of-ammo weapon concentrate its untracked personal small-arms fire',()=>{
 const s=fresh(),u=s.units.hmg50;u.location='r2c2';u.ammo.MG=0;u.out_of_ammo=true;u.cohesion='F';const e=enemy(s);u.fire=e.location;refresh(s);
 expect(vofOf(u)).toBe('S');expect(orderReason(s,{type:'CONCENTRATE',unit_id:u.id,target_id:e.id})).toBeNull();
});
it('relays only mortar indirect orders through an eligible radio HQ in the same area',()=>{
 const s=fresh(),u=s.units.mortar_section,relay=s.units.hq2;u.location=relay.location='r1c1';u.radios=[];u.platoon=1;relay.radios=['CO'];const e=enemy(s);
 expect(communication(s,s.units.co,u)).toBeNull();expect(mortarCommunication(s,s.units.co,u)).toContain('relay');
 const c={type:'INDIRECT',issuer_id:'co',unit_id:u.id,target_id:e.location};expect(submitCommand(s,c).accepted).toBe(true);
 s.impulse.hq='co';s.phase='CO_ACTIVATION';expect(submitCommand(s,c).accepted).toBe(true);
 expect(submitCommand(s,{type:'SPOT',issuer_id:'co',unit_id:u.id,target_id:e.location}).accepted).toBe(false);
 for(const change of ['pinned','different cover','different card','removed','no radio']){
  const copy=structuredClone(s),r=copy.units[relay.id];if(change==='pinned')r.pinned=true;if(change==='different cover')r.cover='other';if(change==='different card')r.location='r1c2';if(change==='removed')r.removed='ELIMINATED';if(change==='no radio')r.radios=[];
  expect(mortarCommunication(copy,copy.units.co,copy.units[u.id])).toBeNull();
 }
});
it('allows an intact phone relay and loses it when the intervening wire is cut',()=>{
 const s=fresh({command_network:'phones'}),u=s.units.mortar_section,relay=s.units.hq2;
 s.units.co.location='r1c1';s.units.co.radios=['CO_PHONE'];u.location=relay.location='r3c1';u.radios=[];relay.radios=['CO_PHONE'];
 s.phone_lines=[{id:'wire',location:'r2c1',cut:false}];
 expect(mortarCommunication(s,s.units.co,u)).toContain('relay');s.phone_lines[0].cut=true;expect(mortarCommunication(s,s.units.co,u)).toBeNull();
});
