import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {missionCatalog} from '../src/scenarios/missions.js';
import {previewMissionSetup,createMission,checkObjective} from '../src/sim/company/engine.js';
import {companyCommander,isCompanyCommander,canCommandCompany,successionPriority} from '../src/sim/company/commandRoles.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';

describe('Trévières authored source data',()=>{
 it('retains command and support capabilities when company HQ identities change',()=>{
  const s=createMission({...trevieres,readiness:{playable:true}},'renamed-command');
  const co=s.units.co;delete s.units.co;co.id='company-hq-stable';s.units[co.id]=co;
  expect(companyCommander(s)).toBe(co);expect(isCompanyCommander(co)).toBe(true);
  expect(canCommandCompany(co)).toBe(true);
  const xo=s.units.xo;delete s.units.xo;xo.id='executive-stable';s.units[xo.id]=xo;
  expect(successionPriority(xo)).toBe(-1);
  const draws=s.deck.draws;supportRequest(s,co,'artillery','HE','r1c2');
  expect(s.deck.draws-draws).toBe(1); // Printed one-card CO allowance; Green stays at the one-card minimum.
 });
 it('requires both objectives and all original row 1–2 cards, excluding expanded cards',()=>{
  const s=createMission({...trevieres,readiness:{playable:true}},'objective-boundaries');
  s.turn=10;for(const pc of Object.values(s.contacts))pc.resolved=true;
  s.units.s11.location=s.objectives.primary;s.units.s12.location=s.objectives.secondary;
  s.locations.r1c5={...structuredClone(s.locations.r1c4),id:'r1c5',col:5};
  s.contacts.expanded={id:'expanded',location:'r1c5',type:'A',resolved:false};
  const blocked=structuredClone(s);blocked.contacts.pc_r2c1.resolved=false;
  checkObjective(blocked);expect(blocked.status).toBe('DEFEAT');
  const unheld=structuredClone(s);unheld.units.s12.location='r0c2';
  checkObjective(unheld);expect(unheld.status).toBe('DEFEAT');
  checkObjective(s);expect(s.status).toBe('SUCCESS');
 });
 it('has the published map, objective rows, contact distribution, and finite artillery',()=>{
  expect(trevieres.map).toMatchObject({columns:4,rows:3});
  expect(trevieres.turn_limit).toBe(10);
  expect(trevieres.contact_rows).toEqual({1:'C',2:'A',3:'B'});
  expect(trevieres.package_tables).toEqual({
   A:[3,5,5,6,7,7,8,10,11,11],
   B:[2,2,4,5,5,5,6,6,9,10],
   C:[1,1,2,2,2,2,3,4,5,5],
  });
  expect(Object.keys(trevieres.packages).map(Number)).toEqual(Array.from({length:12},(_,i)=>i+1));
  expect(trevieres.support_agencies.artillery.inventory).toEqual({HE:4,WP:1});
  expect(trevieres.support_agencies.mortar).toBeUndefined();
  const preview=previewMissionSetup(trevieres,'source-review');
  expect(preview.locations.filter(l=>!l.staging)).toHaveLength(12);
  expect(preview.objectives.primary.location).toMatch(/^r3c/);
  expect(preview.objectives.attack.location).toMatch(/^r2c/);
  const teams=previewMissionSetup(trevieres,'source-review',{mortar_mode:'teams'});
  expect(teams.units.filter(u=>u.kind==='MORTAR')).toHaveLength(3);
  expect(teams.units.some(u=>u.id==='mortar_section')).toBe(false);
  expect(teams.units.find(u=>u.id==='staff').radios).toContain('CO');
  const reassigned=previewMissionSetup(trevieres,'source-review',{mortar_mode:'teams',mortar_radio_recipient:'s11',command_network:'phones'});
  expect(reassigned.units.find(u=>u.id==='s11').radios).toContain('CO_PHONE');
 });
 it('shows the authored candidate while rejecting a playable launch',()=>{
  expect(missionCatalog.find(m=>m.id==='normandy_1').scenario).toBe(trevieres);
  expect(()=>createMission(trevieres,'blocked')).toThrow('not playable');
 });
 it('rejects an unsupported package profile before a mission starts',()=>{
  const invalid=structuredClone(trevieres);invalid.packages[9].units[0].kind='UNAUTHORED_GUN';
  expect(()=>previewMissionSetup(invalid,'bad-profile')).toThrow('Unsupported Normandy package 9');
 });
 it('rejects unknown firepower and unsupported ammunition instead of silently treating them as rifles',()=>{
  for(const change of [c=>c.vof='LASER',c=>c.ammo={UNKNOWN:4},c=>c.range=99]){
   const invalid=structuredClone(trevieres);change(invalid.enemy_counters[0]);
   expect(()=>previewMissionSetup(invalid,'invalid-counter')).toThrow('Unsupported Normandy enemy profile');
  }
 });
});
