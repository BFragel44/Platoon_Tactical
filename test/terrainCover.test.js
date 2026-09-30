import {describe,it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {combatExposure,canFire} from '../src/sim/company/battlefield.js';
import {orderReason} from '../src/sim/company/actions.js';
import {terrainInformation,formationCover,coverPositions} from '../src/ui/terrainPresentation.js';
import {terrainProjection} from '../src/sim/company/missionKnowledge.js';
import manifest from '../src/ui/coverManifest.json';
const fresh=()=>createMission(companyAssault,'terrain-cover');
describe('Terrain and cover audit',()=>{
 it('uses the crossed border for targeted direct attacks, retaining the firing origin after movement',()=>{
  const s=fresh(),u=s.units.s11;u.location='r2c1';
  s.units.s21.location='r2c2';
  s.markers=[{type:'GRENADE',source:'s21',origin:'r1c1',location:u.location,target:u.id,value:-4}];
  expect(combatExposure(s,u).parts.terrain).toBe(2);
  s.markers[0].origin='r2c2';expect(combatExposure(s,u).parts.terrain).toBe(1);
  s.markers[0].origin=u.location;expect(combatExposure(s,u).parts.terrain).toBe(1);
 });
 it('rejects mortar direct and indirect lay from every building floor, but permits ordinary cover',()=>{
  const s=fresh(),u=Object.values(s.units).find(u=>u.kind==='MORTAR');u.location='r1c1';u.exposed=false;
  s.locations[u.location].covers=[{id:'c',known:true,value:2,type:'Cover'}];u.cover='c';
  s.units.co.location=u.location;s.units.co.cover='c';
  s.impulse={id:'cover-check',hq:'co',commands:5,spent:0};
  const t={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r1c2'};s.units.enemy=t;s.knowledge.spotted.enemy={id:t.id};
  const c={type:'INDIRECT',issuer_id:'co',unit_id:u.id,target_id:t.location};
  expect(canFire(s,u,t.location)).toBe(true);expect(orderReason(s,c)).toBeNull();
  for(const type of ['Light Building','Strong Building','Upper Story','Church Tower']){
   s.locations[u.location].covers[0].type=type;
   expect(canFire(s,u,t.location)).toBe(false);expect(orderReason(s,c)).toContain('enclosed cover');
  }
 });
 it('applies the best smoke benefit, with exceptions for grenades and Incoming; keeps indirect mortar burst',()=>{
  const s=fresh(),u=s.units.s11;u.location='r2c1';const l=s.locations[u.location];l.smoke=true;l.smoke_value=2;l.burst=-1;
  s.fire=[{source:'s21',origin:'r2c2',target:u.location,value:-3,indirect:true}];
  expect(combatExposure(s,u).parts).toMatchObject({smoke:2,burst:-1,terrain:1});
  s.fire=[];s.support=[{status:'ACTIVE',location:u.location,value:-4,ammo:'WP'}];
  expect(combatExposure(s,u).parts).toMatchObject({smoke:0,burst:-1});
  s.support=[];s.markers=[{type:'GRENADE',location:u.location,target:u.id,value:-4}];
  expect(combatExposure(s,u).parts.smoke).toBe(0);
 });
 it('matches position labels on units to cover areas and counts discovered buildings without upper stories or fortifications',()=>{
  const l={id:'test',known:true,elevation:2,hills:['hill'],protection:3,cover_draw:4,cover_limit:2,multi_story:true,building:true,covers:[
   {id:'b',type:'Strong Building',value:3,known:true,discovered:true},
   {id:'u',type:'Upper Story',value:3,known:true,parent:'b',elevation:1},
   {id:'p',type:'Pillbox',value:4,known:true,capacity:2},
   {id:'secret',type:'Bunker',value:3,known:false}]};
  expect(terrainInformation(l)).toContain('1/2');expect(terrainInformation(l)).toContain('1 hill');
  expect(coverPositions(l)).toContain('C2 · Upper Story +3');expect(coverPositions(l)).toContain('above C1');
  expect(formationCover(l,{cover:'u',exposed:true})).toContain('C2 · Upper Story');expect(formationCover(l,{cover:'u'})).toContain('level 3');
  expect(formationCover(l,{})).toContain('Terrain only');expect(coverPositions(l)).not.toContain('Bunker');
  const hidden=terrainProjection({...l,known:false,row:3,col:2});
  expect(terrainInformation(hidden)).toBe('<p class="terrain-meta">Terrain not yet revealed.</p>');expect(coverPositions(hidden)).toBe('');
  expect(formationCover(hidden,{cover:'u'})).toBe('');
 });
 it('keeps artwork reproducible and presentation pure, and rejects revision 13',()=>{
  for(const sheet of Object.values(manifest.sheets))expect(existsSync(`public${sheet.file}`)).toBe(true);
  for(const entry of Object.values(manifest.counters)){
   const sheet=manifest.sheets[entry.sheet],[x,y,w,h]=entry.rect;expect(x+w).toBeLessThanOrEqual(sheet.width);expect(y+h).toBeLessThanOrEqual(sheet.height);
  }
  const s=fresh(),before=structuredClone(s);for(const l of Object.values(s.locations)){terrainInformation(l);coverPositions(l);}expect(s).toEqual(before);
  const replay=exportReplay(s);expect(replayMission(companyAssault,replay)).toEqual(s);
  expect(()=>replayMission(companyAssault,{...replay,rules_version:13})).toThrow('version mismatch');
 });
});
