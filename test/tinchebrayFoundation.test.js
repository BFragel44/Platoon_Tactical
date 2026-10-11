import {describe,it,expect} from 'vitest';
import {tinchebray,validateTinchebrayContent} from '../src/scenarios/tinchebray.js';
import {tinchebrayContent as content} from '../src/scenarios/tinchebrayContent.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {validateNormandyContent} from '../src/sim/company/normandyContent.js';
import {atProfile} from '../src/sim/company/vehicleCombat.js';
describe('Tinchebray gated foundation',()=>{
 it('rejects inherited counterattacks and wrong mission capabilities before execution',()=>{
  expect(validateTinchebrayContent()).toBe(tinchebray);
  for(const mutate of [s=>s.rules.vire=true,s=>s.rules.reattempts=1,s=>s.contact_rows[6]=['A','B'],s=>s.rules.enemy_event_tables.late[9]='COUNTER_ATTACK']){
   const bad=structuredClone(tinchebray);mutate(bad);expect(()=>validateTinchebrayContent(bad)).toThrow();
  }
 });
 it('authors the printed map and letter-side contacts without changing the definition',()=>{
  const before=JSON.stringify(tinchebray),s=materializeScenario(tinchebray,'tinchebray-foundation');
  expect(s.locations).toHaveLength(28);expect(s.contacts).toHaveLength(24);
  for(const letter of ['A','B','C'])expect(s.contacts.filter(c=>c.type===letter)).toHaveLength(8);
  expect(s.contacts.every(c=>!c.question_side)).toBe(true);
  expect(JSON.stringify(tinchebray)).toBe(before);expect(tinchebray.readiness.playable).toBe(false);
 });
 it('requires the primary on six, secondary on five, and attack adjacent to secondary on four',()=>{
  expect(()=>materializeScenario(tinchebray,'rows',{objectives:{primary:'r5c2'}})).toThrow();
  expect(()=>materializeScenario(tinchebray,'rows',{objectives:{secondary:'r6c3'}})).toThrow();
  expect(()=>materializeScenario(tinchebray,'rows',{objectives:{primary:'r6c1',secondary:'r5c4',attack:'r4c1'}})).toThrow();
  expect(materializeScenario(tinchebray,'rows',{objectives:{primary:'r6c1',secondary:'r5c4',attack:'r4c3'}}).objectives.attack).toBe('r4c3');
 });
 it('does not inherit Vire counterattacks or persistence identity',()=>{
  expect(tinchebray.rules.vire).toBeUndefined();expect(content.counterattack_table).toBeUndefined();
  expect(tinchebray.rules.counterattack_table).toBeUndefined();
  expect(content.enemy_event_tables.early.concat(content.enemy_event_tables.late)).not.toContain('COUNTER_ATTACK');
  expect(tinchebray.rules.rosterKey).toBe('platoon-normandy-tinchebray-standalone');
  expect(tinchebray.rules.reattempts).toBe(2);expect(tinchebray.rules.enemyExperience).toBe('Green');
 });
 it('retains all eleven published packages and rejects unsupported profiles',()=>{
  expect(Object.keys(content.packages)).toHaveLength(11);expect(()=>validateNormandyContent(tinchebray)).not.toThrow();
  const invalid=structuredClone(tinchebray);invalid.packages[11].units[0].kind='FLAK88';
  expect(()=>validateNormandyContent(invalid)).toThrow();
  expect(content.packages[3].additional_mines).toEqual({sides:3,numbers:[1]});
  expect(content.packages[2].alternatives).toBeUndefined();
  expect(content.friendly_event_tables.early[8]).toBe('NO_ARTY');
  expect(content.enemy_event_tables.late).not.toContain('DISPLACE_MORTAR');
 });
 it('uses the distinct published M10 profile and eight initial crew steps',()=>{
  const p=atProfile(content.vehicle_platoons.initial.profile);
  expect(p.gunnery).toEqual([-5,-3,-1,0]);expect(p.defense).toBe(-1);
  expect(p.crew_steps*content.vehicle_platoons.initial.vehicles).toBe(8);
  expect(p).toMatchObject({vof:'H',capacity:4,move_fire:2,quick_shot:true,grenade_check:false});
  expect(content.vehicle_platoons.event.vehicles).toBe(5);
 });
});
