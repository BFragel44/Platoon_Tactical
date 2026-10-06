import {describe,it,expect} from 'vitest';
import {latActivityTable} from '../src/sim/company/enemyHierarchy.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission} from '../src/sim/company/engine.js';
import {enemyActivity,selectEnemyCover} from '../src/sim/company/combat.js';
import {attempt,cards} from '../src/sim/company/core.js';
import {refresh,basicValue,vofOf} from '../src/sim/company/battlefield.js';
const fresh=()=>createMission({...trevieres,readiness:{playable:true}},'enemy-hierarchy');
const table=options=>latActivityTable({cohesion:'P',pinned:false,same:false,covered:false,leader:false,teams:0,localCasualty:false,seenCasualties:0,...options});
describe('Normandy enemy hierarchy source cases',()=>{
 it('chooses defensive cover by protection against the actual targeted effect',()=>{
  const s=fresh(),u={...structuredClone(s.units.s11),id:'enemy_protection',faction:'enemy',location:'r2c2',steps:[s.units.s11.steps[0]]};s.units[u.id]=u;
  s.locations.r2c2.covers=[{id:'targeted',type:'Trench',value:2,capacity:6},{id:'safe',type:'Foxholes',value:1,capacity:6}];
  s.markers=[{type:'GRENADE',location:'r2c2',origin:'r1c2',source:'co',cover:'targeted',value:-4}];
  expect(selectEnemyCover(s,u)?.id).toBe('safe');
 });

 it('advances into usable cover instead of a stronger bunker facing away',()=>{
  const s=fresh(),u={...structuredClone(s.units.s11),id:'enemy_cover',faction:'enemy',location:'r2c2',vof:'S',steps:[s.units.s11.steps[0]],mission_weapon:true};s.units[u.id]=u;s.units.s11.location='r1c2';
  s.locations.r2c2.covers=[{id:'wrong_arc',type:'Bunker',value:3,capacity:3,arc:[1,0]},{id:'usable',type:'Trench',value:2,capacity:6}];
  expect(selectEnemyCover(s,u,u.location,true)?.id).toBe('usable');
 });

 it('checks pinned/LAT, good-order units, then a Fire Team leader, once each',()=>{
  const s=fresh();
  for(const [id,kind,cohesion,pinned]of [['z_lat','LAT','F',true],['m_good','SQUAD','GOOD',false],['a_leader','LEADER','F',false]]){
   s.units[id]={...structuredClone(s.units.s11),id,name:id,kind,cohesion,pinned,faction:'enemy',location:'r2c2',named:kind==='LEADER',steps:[{id:`${id}-step`,personnel:[]}],max_steps:1,fire:null,cover:null,used:[]};
  }
  enemyActivity(s);
  expect(s.events.filter(e=>e.type==='ENEMY_ACTIVITY').map(e=>e.actor)).toEqual(['z_lat','m_good','a_leader']);
 });

 it('uses Grenadier two-step firepower and the leader command side without a VOF',()=>{
  const profile=trevieres.enemy_counters.find(c=>c.id==='gr1');
  const u={...profile,steps:[{},{}],cohesion:'GOOD',faction:'enemy'};
  expect(vofOf(u)).toBe('A');expect(basicValue(u,1)).toBe(-1);expect(basicValue(u,0)).toBe(-1);
  expect(trevieres.enemy_counters.find(c=>c.kind==='LEADER').vof).toBeNull();
 });
 it('flips only a lone enemy mortar confronted by a combat unit at point blank',()=>{
  const s=fresh();s.units.s11.location='r1c1';
  const u={...structuredClone(s.units.mortar_section),id:'mortar_enemy',faction:'enemy',location:'r1c1',vof:'G',max_steps:1,steps:[s.units.mortar_section.steps[0]]};s.units[u.id]=u;
  refresh(s);expect(u.cohesion).toBe('F');expect(u.experience).toBe('Green');expect(vofOf(u)).toBe('S');
 });
 it('uses the four printed pinned With Leader rows',()=>{
  expect(table({pinned:true,leader:true,same:true})).toEqual(['COVER','COVER','RALLY','FALL_BACK']);
  expect(table({pinned:true,leader:true,same:true,covered:true})).toEqual(['NONE','RALLY','RALLY']);
  expect(table({pinned:true,leader:true})).toEqual(['NONE','COVER','RALLY']);
  expect(table({pinned:true,leader:true,covered:true})).toEqual(['RALLY']);
 });
 it('prioritizes reconstitution over Assault/Fire activity only with a leader',()=>{
  expect(table({leader:true,cohesion:'A',teams:2})).toEqual(['RECONSTITUTE']);
  expect(table({leader:false,cohesion:'A',teams:2})).toEqual(['NONE','INFILTRATE']);
  expect(table({leader:true,cohesion:'A',teams:2,same:true})).toEqual(['ATTACK']);
 });
 it('uses leader recovery and casualty priorities',()=>{
  expect(table({leader:true,cohesion:'F',kind:'LEADER',named:true})).toEqual(['RECOVER']);
  expect(table({leader:false,cohesion:'F',kind:'LEADER',named:true})).toEqual(['NONE','RECOVER','RECOVER']);
  expect(table({leader:true,cohesion:'L',localCasualty:true})).toEqual(['EVACUATE']);
  expect(table({leader:true,cohesion:'L',seenCasualties:1})).toEqual(['NONE','SEEK_CASUALTY']);
  expect(table({leader:true,cohesion:'P'})).toEqual(['NONE','RECOVER']);
  expect(table({leader:false,cohesion:'P'})).toEqual(['NONE']);
 });
 it('requires the same card area for leader draw bonuses',()=>{
  const s=fresh(),u={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r2c2',cover:null};
  s.units.enemy=u;s.units.leader={...structuredClone(u),id:'leader',kind:'LEADER',steps:[u.steps[0]],cover:'other_area'};
  let before=s.deck.draws;attempt(s,u,2,'spot','separate cover');expect(s.deck.draws-before).toBe(2);
  s.units.leader.cover=null;before=s.deck.draws;attempt(s,u,2,'spot','same area');expect(s.deck.draws-before).toBe(3);
 });
 for(const [roll,expected] of [[4,'straight advance'],[2,'infiltration falls back to straight advance']])it(expected,()=>{
  const s=fresh();for(const id of Object.keys(s.units))if(id!=='s11')delete s.units[id];
  s.units.s11.location='r1c3';
  for(const l of Object.values(s.locations)){l.terrain='open';l.building=false;l.borders={N:'light',S:'light',E:'light',W:'light'};l.elevation=0;l.known=true;l.covers=[];}
  s.units.enemy={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r3c2',cohesion:'GOOD',exposed:false,pinned:false,fire:null};
  s.enemy_tactics='offensive_assault';
  const card=Object.values(cards).find(c=>c.id!==51&&c.random[2]===roll).id;
  s.deck.order=[card,...s.deck.order];enemyActivity(s);
  expect(s.units.enemy.location).toBe('r2c2');expect(s.units.enemy.exposed).toBe(true);
 });
 it('flips a lone good-order leader to its Fire Team side',()=>{
  const s=fresh();s.units.leader={...structuredClone(s.units.s11),id:'leader',kind:'LEADER',faction:'enemy',location:'r2c2',steps:[s.units.s11.steps[0]],named:true,cover:null};
  enemyActivity(s);expect(s.events.some(e=>e.type==='COHESION_CHANGED'&&e.actor==='leader'&&e.to==='F')).toBe(true);
 });
});
