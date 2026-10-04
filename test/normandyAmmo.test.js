import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission} from '../src/sim/company/engine.js';
import {ammoLoadReason,expendAmmunition,pickUpAmmunition,dropExcessAmmunition} from '../src/sim/company/ammunition.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
import {cards} from '../src/sim/company/core.js';
import {applyHit,prepareCombat} from '../src/sim/company/combat.js';
import {movementReason,basicValue,vofOf,canFire} from '../src/sim/company/battlefield.js';

const candidate={...trevieres,readiness:{playable:true}};
describe('mission scoped Normandy supplies',()=>{
 it('uses the .50 cal tripod restriction only on the good-order weapon side',()=>{
  const s=createMission(candidate,'tripod-side'),u=s.units.hmg50;u.location='r1c1';u.exposed=true;
  expect(canFire(s,u,u.location)).toBe(false);
  u.cohesion='F';expect(canFire(s,u,u.location)).toBe(true);expect(vofOf(u)).toBe('S');
 });
 it('reduces an A-rated Fire Team to small arms on depletion and restores it on resupply',()=>{
  const s=createMission(candidate,'lat-depletion'),u={...structuredClone(s.units.mg1),id:'lat',kind:'LAT',cohesion:'F',ammo:{MG:1},fire_team_vof:'A'};
  expendAmmunition(s,u,'MG');expect(vofOf(u)).toBe('S');expect(basicValue(u)).toBe(0);
  pickUpAmmunition(s,u,{id:'supply',key:'MG',quantity:1});expect(vofOf(u)).toBe('A');expect(basicValue(u)).toBe(-1);
 });
 it('enforces transport limits and allows pickup after expenditure',()=>{
  const s=createMission(candidate,'ammo'),u=s.units.mg1;
  expect(u.ammo.MG).toBe(4);
  expect(ammoLoadReason(s,u,{MG:3})).toMatch(/capacity/);
  for(let i=0;i<4;i++)expect(expendAmmunition(s,u,'MG')).toBe(true);
  expect(u.out_of_ammo).toBe(true);
  expect(expendAmmunition(s,u,'MG')).toBe(false);
  const supply={id:'supply',type:'AMMO',key:'MG',quantity:3,location:u.location,faction:'friendly'};
  s.assets.push(supply);pickUpAmmunition(s,u,supply);
  expect(u.ammo.MG).toBe(3);expect(u.out_of_ammo).toBe(false);
 });
 it('leaves a mortar team’s excess ammunition on its departure card',()=>{
  const s=createMission(candidate,'teams',{mortar_mode:'teams'}),u=s.units.mortar1;
  expect(u.ammo.MTR).toBe(4);expect(ammoLoadReason(s,u)).toBeNull();
  dropExcessAmmunition(s,u);
  expect(u.ammo.MTR).toBe(2);
  expect(s.assets.find(a=>a.type==='AMMO'&&a.key==='MTR')).toMatchObject({quantity:2,location:u.location});
  const supply={id:'supply',type:'AMMO',key:'MTR',quantity:4,location:u.location,faction:'friendly'};
  s.assets.push(supply);u.ammo.MTR=0;
  pickUpAmmunition(s,u,supply);
  expect(u.ammo.MTR).toBe(2);expect(supply.quantity).toBe(2);
 });
 it('does not create a battalion support agency and limits successful artillery missions',()=>{
  const s=createMission(candidate,'support'),fo=s.units.artyfo;
  expect(s.support_agencies.mortar).toBeUndefined();
  const hit=Object.values(cards).find(card=>card.burst&&!card.short).id;
  // The inventory is authored separately from the unlimited KUTF agency.
  expect(s.support_inventory.artillery).toEqual({HE:4,WP:1});
  s.deck.order=[hit,hit,...s.deck.order];
  supportRequest(s,fo,'artillery','WP','r1c1');
  expect(s.support_inventory.artillery.WP).toBe(0);
  s.support_inventory.artillery.WP=0;
  expect(()=>supportRequest(s,fo,'artillery','WP','r1c1')).toThrow('no WP missions');
 });
 it('passes Grenadier machine-gun ammunition only to its final A fire team',()=>{
  const s=createMission(candidate,'breakdown'),profile=trevieres.enemy_counters[0];
  const u={...profile,id:'enemy_fixture',counter_id:profile.id,name:'Grenadier fixture',faction:'enemy',location:'r2c2',steps:[1,2,3].map(n=>({id:`e${n}`,personnel:[]})),max_steps:3,cohesion:'GOOD',experience:'Line',radios:[],assets:{},saved:0,used:[],removed:null,pinned:false,cover:null,fire:null};
  s.units[u.id]=u;
  applyHit(s,u,'F');
  expect(u.ammo.MG).toBe(6);
  expect(Object.values(s.units).filter(v=>v.parent_counter_id===profile.id).every(v=>!v.ammo?.MG)).toBe(true);
  applyHit(s,u,'F');
  const children=Object.values(s.units).filter(v=>v.parent_counter_id===profile.id);
  expect(children.filter(v=>v.ammo?.MG).map(v=>v.ammo.MG)).toEqual([6]);
 });
 it('keeps the section ammunition with a surviving one-step mortar team',()=>{
  const s=createMission(candidate,'mortar-breakdown'),u=s.units.mortar_section;
  applyHit(s,u,'F');expect(u.steps).toHaveLength(2);
  applyHit(s,u,'F');
  const teams=Object.values(s.units).filter(v=>v.id.startsWith('mortar_')&&v.id!=='mortar_section');
  expect(teams).toHaveLength(3);
  expect(teams.map(v=>v.ammo.MTR)).toEqual([4,4,4]);
  expect(teams.map(v=>v.steps[0].id)).toEqual(['mortar_section_step1','mortar_section_step2','mortar_section_step3']);
  expect(teams.map(v=>v.cohesion)).toEqual(['F','F','GOOD']);
  expect(teams.every(v=>v.kind==='MORTAR'&&v.named)).toBe(true);
 });
 it('uses the 88mm gun’s H VOF, prevents good-order movement, and spends a round when firing',()=>{
  const s=createMission(candidate,'gun-ammo'),profile=trevieres.enemy_counters.find(c=>c.kind==='FLAK88');
  expect(profile).toMatchObject({vof:'H',steps:2,range:3,mobile:false});
  const gun={...structuredClone(profile),id:'enemy_gun',faction:'enemy',location:'r2c2',cohesion:'GOOD',steps:[{id:'gun_step',personnel:[]}],radios:[],assets:{},pinned:false,exposed:false,removed:null,cover:null,fire:'r1c2',mission_weapon:true};
  s.units[gun.id]=gun;
  expect(movementReason(s,gun,'r3c2')).toContain('cannot move');
  s.fire=[{source:gun.id,origin:gun.location,target:'r1c2',value:-3}];
  prepareCombat(s);
  expect(gun.ammo.GUN).toBe(5);
 });
});
