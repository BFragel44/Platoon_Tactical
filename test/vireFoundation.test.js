import {describe,it,expect} from 'vitest';
import {vireContent as c} from '../src/scenarios/vireContent.js';
import {vire,validateVireContent} from '../src/scenarios/vire.js';
import {missionCatalog} from '../src/scenarios/missions.js';
import {createMission,RULES_VERSION} from '../src/sim/company/engine.js';
import {delayActivityTable} from '../src/sim/company/enemyHierarchy.js';
const capabilities={supportedEnemyKinds:c.required_enemy_kinds,supportedVehicleProfiles:['M4_SHERMAN75','M5_LIGHT37']};
describe('Vire source-backed authored foundation',()=>{
 it('enters normal selection while requiring the complete vehicle factory',()=>{
  expect(vire.readiness.playable).toBe(true);
  expect(missionCatalog.some(m=>m.id===vire.id)).toBe(true);
  expect(()=>createMission(vire,'no-bypass')).toThrow();
  expect(RULES_VERSION).toBe(39);
  expect(missionCatalog.filter(m=>/^normandy_[1-5]$/.test(m.id))).toHaveLength(5);
 });
 it('validates authored distributions only against explicitly supplied profile capabilities',()=>{
  expect(()=>validateVireContent()).toThrow(/unsupported enemy profile/);
  expect(()=>validateVireContent(c,{...capabilities,supportedVehicleProfiles:[]})).toThrow(/unsupported vehicle profile/);
  expect(validateVireContent(c,capabilities)).toBe(c);
  const bad=structuredClone(c);bad.package_tables.C[9]=13;
  expect(()=>validateVireContent(bad,capabilities)).toThrow(/C table/);
  bad.package_tables.C[9]=6;bad.placement.right_front=[6,8];
  expect(()=>validateVireContent(bad,capabilities)).toThrow(/placement/);
 });
 it('keeps Vire objective clearing, daylight and fresh battlefield distinct from M5',()=>{
  expect(c.map).toEqual({columns:4,rows:5,staging:true});
  expect(c.objectives).toEqual({primary_row:5,secondary_row:5,attack_row:4,clear_rows:[1,2,3]});
  expect(c.contact_rows).toEqual({1:'C',2:'C',3:'B',4:['A','B'],5:['A','B']});
  expect(c.battlefield_carryover).toBe(false);expect(c.reattempts).toBe(1);
  expect(c.visibility).toEqual({light:0,weather:0});
 });
 it('preserves printed package odds and counterattack-only base of fire',()=>{
  expect(c.package_tables.A).toEqual([4,4,5,7,8,9,9,10,11,11]);
  expect(c.package_tables.B).toEqual([1,2,2,3,3,4,4,7,8,8]);
  expect(c.package_tables.C).toEqual([1,1,1,2,2,3,4,4,4,6]);
  expect(c.counterattack_table).toEqual([2,2,2,10,10,10,10,12,12,12]);
  expect(c.packages[2].alternatives[0].units).toEqual([]);
  expect(c.packages[7].units[0]).toMatchObject({kind:'MORTAR',ammo:3});
  expect(c.packages[9].alternatives[0].optional).toBeUndefined();
  expect(c.packages[9].alternatives[1].optional.if_available).toBe(true);
  expect(c.packages[12]).toMatchObject({spotted:true,units:[{kind:'LMG',cover:null,ammo:4}]});
 });
 it('authors tanks, AT equipment, support and late-event boundaries without infantry substitutes',()=>{
  for(const p of Object.values(c.vehicle_platoons))expect(p).toMatchObject({vehicles:5,hq_included:true,ammo_each:5,at_ambush:true});
  expect(c.vehicle_activation_order).toEqual(['TANK','JEEP','AT']);
  expect(c.enemy_equipment).toEqual({a_squad_mg_ammo:4,panzerfaust_each:1,leader_rifle_grenades:1});
  expect(c.enemy_spotters.mortar).toEqual({missions:2,subsequent_draws:3});
  expect(c.support.artillery.inventory).toEqual({HE:4,WP:1,TOT:1});
  expect(c.support.artillery.ammo_draws.TOT.company_commander).toBe(1);
  expect(c.enemy_late_start).toBe(7);
  expect(c.friendly_event_tables.early[3]).toBe('TANK_SUPPORT');
  expect(c.friendly_event_tables.late[2]).toBe('TANK_SUPPORT');
  expect(c.enemy_event_tables.late[2]).toBe('DISPLACE_MORTAR');
  expect(c.counterattack.adjacent_unrevealed_pc_or_row).toBe(5);
 });
});
describe('Delay Defense printed hierarchy foundation',()=>{
 const cases=[
  [{same:true,covered:false},['NONE','COVER','FALL_BACK','FALL_BACK','ATTACK']],
  [{same:true,covered:true},['NONE','FALL_BACK','FALL_BACK','ATTACK']],
  [{outOfAmmo:true},['FALL_BACK']],
  [{noLOS:true},['HIDE']],
  [{validPDF:true},['NONE','NONE','ATTACK']],
  [{under:true},['NONE','COVER','FALL_BACK','FALL_BACK','ATTACK']],
  [{under:true,covered:true,differentDirection:true},['NONE','ATTACK','SHIFT','FALL_BACK','FALL_BACK']],
  [{under:true,covered:true,heavy:true,validPDF:true},['NONE','NONE','ATTACK']],
  [{under:true,covered:true,trading:true,stronger:true},['NONE','NONE','ATTACK']],
  [{under:true,covered:true,trading:true},['NONE','ATTACK','FALL_BACK']],
  [{under:true,covered:true},['NONE']],
 ];
 it.each(cases)('maps first matching situation %j to its printed outcomes',(state,expected)=>expect(delayActivityTable(state)).toEqual(expected));
 it('same-card priority precedes depletion; depletion precedes hiding',()=>{
  expect(delayActivityTable({same:true,covered:true,outOfAmmo:true})).toHaveLength(4);
  expect(delayActivityTable({outOfAmmo:true,noLOS:true})).toEqual(['FALL_BACK']);
 });
});
