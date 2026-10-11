import {describe,it,expect} from 'vitest';
import {vire} from '../src/scenarios/vire.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {vireContent} from '../src/scenarios/vireContent.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {previewVireSetup,vireVehicleDeployments} from '../src/sim/company/vireSetup.js';
import {createMission} from '../src/sim/company/engine.js';
import {validateNormandyContent} from '../src/sim/company/normandyContent.js';
describe('gated materialized Vire setup',()=>{
 it('authors twenty cards plus staging and seeded concealed A/B contacts',()=>{
  const s=materializeScenario(vire,'vire-map');expect(s.locations).toHaveLength(24);expect(s.contacts).toHaveLength(20);
  for(const c of s.contacts){const row=s.locations.find(l=>l.id===c.location).row;expect(row<=2?c.type==='C':row===3?c.type==='B':['A','B'].includes(c.type)).toBe(true);expect(c.question_side).toBe(row>=4);}
  expect(materializeScenario(vire,'vire-map')).toEqual(s);expect(s.objectives.clear_rows).toEqual([1,2,3]);expect(s.rules.tactics).toBe('delay_defense');
  expect(s.rules.hill192).toBeUndefined();expect(s.rules.patrols).toBeUndefined();
 });
 it('previews both observers, two HMGs, engineers and exactly five initial Shermans',()=>{
  const p=previewVireSetup('vire-preview');expect(p.playable).toBe(false);
  for(const id of ['artyfo','mtrfo','hmg1','hmg2','engineers'])expect(p.units.some(u=>u.id===id)).toBe(true);
  expect(p.vehicles).toHaveLength(5);expect(p.vehicles.every(v=>v.profile==='M4_SHERMAN75'&&v.ammo===5&&v.crew.length===2&&v.ambushSusceptible)).toBe(true);
  expect(p.vehicles.filter(v=>v.command_role==='vehicle_platoon_hq')).toHaveLength(1);
  expect(p.vehicles.every(v=>v.command_hq==='sherman_hq')).toBe(true);expect(p.vehicles[0].radios).toEqual(['BN']);
  expect(p.vehicles.some(v=>v.profile==='M5_LIGHT37')).toBe(false);expect(p.locations.filter(l=>l.row>=4).every(l=>!('contact_type' in l)&&!('contacts' in l))).toBe(true);expect(()=>createMission(vire,'still-gated')).toThrow(/not playable/);
 });
 it('keeps attachments and published enemy equipment mission-specific',()=>{
  validateNormandyContent(vire);expect(vire.enemy_counters.filter(u=>u.kind==='SQUAD')).toHaveLength(6);
  expect(vire.enemy_counters.filter(u=>u.kind==='MORTAR').every(u=>u.steps===1&&u.ammo.MTR===3)).toBe(true);
  expect(vire.enemy_counters.filter(u=>u.kind==='SQUAD').every(u=>u.assets.panzerfaust===1)).toBe(true);
  expect(vire.enemy_counters.filter(u=>u.kind==='SQUAD'&&u.vof==='A').every(u=>u.ammo.MG===4)).toBe(true);
  expect(vire.enemy_counters.filter(u=>u.kind==='LEADER').every(u=>u.assets.rifle_grenade===1)).toBe(true);
  expect(vire.enemy_counters.filter(u=>u.kind==='SPOTTER').every(u=>u.missions===2&&u.subsequent_draws===3)).toBe(true);
  expect(cerisy.enemy_counters.find(u=>u.kind==='SQUAD').assets.panzerfaust).toBe(2);
  expect(vire.rules.rosterKey).not.toBe(cerisy.rules.rosterKey);expect(vire.units.find(u=>u.id==='hmg1').ammo).toEqual({MG:6});
  const p=previewVireSetup('attach',{assignments:{engineers:{platoon:2},hmg1:{platoon:1}}});expect(p.units.find(u=>u.id==='engineers').platoon).toBe(2);
 });
 it('supports objectives, mortar teams and staging positions while rejecting incompatible setup',()=>{
  const p=previewVireSetup('choices',{objectives:{primary:'r5c1',secondary:'r5c4',attack:'r4c1'},mortar_mode:'teams',positions:{engineers:'r0c4'}},{sherman_hq:'r0c4'});
  expect(p.units.find(u=>u.id==='engineers').location).toBe('r0c4');expect(p.units.some(u=>u.id==='mortar_section')).toBe(false);expect(p.units.filter(u=>/^mortar[1-3]$/.test(u.id))).toHaveLength(3);expect(p.vehicles[0].location).toBe('r0c4');
  const phones=previewVireSetup('phones',{command_network:'phones'});expect(phones.units.find(u=>u.id==='co').radios).toContain('CO_PHONE');expect(phones.vehicles[0].radios).toEqual(['BN']);
  expect(()=>previewVireSetup('bad',{positions:{engineers:'r1c1'}})).toThrow(/staging/);
  expect(()=>previewVireSetup('bad',{objectives:{primary:'r4c1'}})).toThrow(/final row/);
  expect(()=>previewVireSetup('bad',{battlefield:{}})).toThrow();
  expect(()=>previewVireSetup('bad',{}, {sherman_hq:'r1c1'})).toThrow(/staging/);
  expect(()=>previewVireSetup('bad',{}, {m5_hq:'r0c1'})).toThrow(/Unknown/);
 });
 it('authors the M5 event force separately with Row-1-only entry and unique crew identities',()=>{
  const initial=vireVehicleDeployments(),event=vireVehicleDeployments('event',{m5_hq:'r1c4'});
  expect(event).toHaveLength(5);expect(event.every(v=>v.profile==='M5_LIGHT37'&&v.crew.length===1&&v.ammo===5&&v.ambushSusceptible)).toBe(true);
  expect(new Set([...initial,...event].flatMap(v=>v.crew.map(c=>c.id))).size).toBe(15);
  expect(()=>vireVehicleDeployments('event',{m5_hq:'r2c1'})).toThrow(/Row 1/);expect(()=>vireVehicleDeployments('bogus')).toThrow();
 });
 it('returns isolated setup records without altering source definitions or a previous preview',()=>{
  const before=structuredClone(vire),p=previewVireSetup('isolated'),copy=structuredClone(p);p.vehicles[0].crew[0].id='tampered';p.units[0].radios.length=0;
  expect(previewVireSetup('isolated')).toEqual(copy);expect(vire).toEqual(before);expect(vireContent.attachments.find(u=>u.role==='artillery_observer').id).toBe('artyfo');
 });
});
