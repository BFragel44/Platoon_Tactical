import {describe,it,expect} from 'vitest';
import {stGermainContent as content} from '../src/scenarios/stGermainContent.js';
import {stGermain,validateStGermainContent} from '../src/scenarios/stGermain.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {hill192} from '../src/scenarios/hill192.js';
import {missionCatalog} from '../src/scenarios/missions.js';
import {validateNormandyContent} from '../src/sim/company/normandyContent.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {createMission,previewMissionSetup,RULES_VERSION} from '../src/sim/company/engine.js';
import {validatePatrolPlan} from '../src/sim/company/patrols.js';

describe('St. Germain authored foundation — Normandy pp.32–35',()=>{
 it('remains gated and absent from normal selection while allowing read-only preparation',()=>{
  expect(stGermain.readiness.playable).toBe(false);
  expect(stGermain.readiness.development_validated).toBe(true);
  expect(missionCatalog.some(m=>m.id===stGermain.id)).toBe(false);
  expect(()=>createMission(stGermain,'gate')).toThrow('not playable yet');
  expect(previewMissionSetup(stGermain,'gate').playable).toBe(false);
  expect(RULES_VERSION).toBe(32);
 });
 it('uses the audited content-2 identity and isolated company slot without M4 import',()=>{
  expect(stGermain.id).toBe('normandy_5');expect(stGermain.version).toBe(2);
  expect(stGermain.rules.baselineCompanyId).toBe('normandy_st_germain_standalone_company');
  expect(stGermain.rules.rosterKey).toBe('platoon-normandy-st-germain-standalone');
  expect(stGermain.mission_content.battlefield_carryover).toBe(false);
  expect(stGermain.rules.hill192).toBeUndefined();
  expect(()=>materializeScenario(stGermain,'bad',{battlefield:{}})).toThrow();
 });
 it('materializes 24 original cards, no active staging, twelve Row-1 Foxholes and a separate COP',()=>{
  const s=createMission({...stGermain,readiness:{playable:true}},'six-columns');
  const locations=Object.values(s.locations);
  expect(content.map).toEqual({columns:6,rows:4,staging:false});
  expect(locations).toHaveLength(24);expect(locations.some(l=>l.staging)).toBe(false);
  for(const c of locations.filter(l=>l.row===1))expect(c.covers.filter(c=>c.type==='Foxholes')).toHaveLength(2);
  expect(s.locations[s.patrol.plan.cop].covers.filter(c=>c.type==='Foxholes')).toHaveLength(2);
  expect(content.defenses).toEqual({row1_foxholes_per_card:2,cop_foxholes_max:2,mlr_between:[1,2]});
 });
 it('accepts column-six patrol controls and excludes the COP from question-side contacts',()=>{
  const plan={...stGermain.patrol_plan,primary:'r4c6',route:['r2c6','r3c6','r4c6','r2c5'],cop:'r2c4',ccp:'r1c6',concentration:'r4c6'};
  const s=materializeScenario(stGermain,'six-controls',{patrol:plan});
  expect(validatePatrolPlan(s.locations,plan)).toEqual(plan);
  expect(s.contacts).toHaveLength(17);
  expect(s.contacts.filter(c=>c.type==='A')).toHaveLength(6);
  expect(s.contacts.filter(c=>c.question_side)).toHaveLength(11);
  expect(s.contacts.some(c=>c.location==='r2c4')).toBe(false);
 });
 it('authors three ten-turn moon patrols with Veteran Deliberate Defense and no extra reattempt',()=>{
  expect(content).toMatchObject({patrols:3,turn_limit:10,phase_sequence:'offensive',enemy_tactics:'deliberate_defense',enemy_experience:'Veteran',visibility:{type:'moon',random_light:[2,3,4,5]}});
  expect(stGermain.rules).toMatchObject({patrols:3,reattempts:0,handheldIllumination:8});
  expect(stGermain.objectives.clear_rows).toEqual([]);
 });
 for(const [letter,draws] of Object.entries({A:[3,4,4,5,8,8,9,10,11,12],B:[1,1,2,2,2,5,6,6,7,7],C:[1,1,2,2,2,3,5,5,6,7]}))
  draws.forEach((number,i)=>it(`matches published PC-${letter} draw ${i+1}`,()=>{
   expect(content.package_tables[letter][i]).toBe(number);
   expect(content.packages[number]).toBeDefined();
  }));
 it('replaces the M3 pillbox with a required two-step squad and leader in one Deep Bunker',()=>{
  expect(content.packages[10]).toEqual({units:[{kind:'SQUAD',cover:'Deep Bunker',steps:2},{kind:'LEADER',cover:'Deep Bunker',same_as_previous:true}],no_fire:true,spotted:true,placement_draw:{sides:5,point_blank:[1,2,3],close:[4,5]}});
  expect(content.packages[10].optional).toBeUndefined();
  expect(content.packages[10].outflanked).toBeUndefined();
  expect(stGermain.enemy_counters.filter(c=>c.kind==='SQUAD')).toHaveLength(6);
  expect(stGermain.enemy_counters.filter(c=>c.kind==='SQUAD').every(c=>c.steps===3&&c.vof_by_steps[2]&&c.breakdown.startsWith('fallschirmjager_'))).toBe(true);
 });
 it('keeps single incoming alternatives without spotters and both illumination packages',()=>{
  expect(content.packages[2].alternatives.map(p=>[p.incoming,p.incoming_agency,p.units])).toEqual([[-4,'enemy_artillery',[]],[-3,'enemy_mortar',[]]]);
  for(const n of [6,7])expect(content.packages[n].illumination).toBe('mortar');
  expect(content.packages[12].units).toEqual([{kind:'LMG',cover:'Foxholes',ammo:6},{kind:'MORTAR',cover:'Foxholes',ammo:6,same_as_previous:true}]);
  expect(Object.keys(content.packages)).toHaveLength(12);
  expect(content.placement).toEqual({sides:8,front:[1,2,3,4],left_front:[5,6],right_front:[7,8]});
 });
 it('authors exact early/late tables without a counterattack or M4 Turn-6 switch',()=>{
  expect(content.friendly_event_tables).toEqual({early:['COMM','COMM','LOST','LOST','HOLD_PATROL','HOLD_PATROL','RAIN','NO_MORTAR','ADVANCE_ROUTE','ADVANCE_ROUTE'],late:['COMM','COMM','COMM','LOST','HOLD_PATROL','HOLD_PATROL','RAIN','NO_MORTAR','NO_MORTAR','ADVANCE_ROUTE']});
  expect(content.enemy_event_tables).toEqual({early:['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','SHIFTING_LINES','SHIFTING_LINES'],late:['EVAC','EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','SHIFTING_LINES']});
  expect(stGermain.rules.enemy_late_start).toBeUndefined();
 });
 it('authors published support callers and eight finite resources, without TOT or cannon illumination',()=>{
  expect(content.support).toEqual({
   artillery:{HE:-5,WP:-4,draws:{artillery_observer:3,mortar_observer:2,company_commander:2},inventory:{HE:4,WP:1,ILLUM:6},battalion:true},
   mortar:{HE:-3,WP:-3,draws:{artillery_observer:2,mortar_observer:3,company_commander:2},inventory:{HE:3,WP:1,ILLUM:4}},
   cannon:{HE:-4,WP:-4,draws:{artillery_observer:3,mortar_observer:3,company_commander:2},inventory:{HE:3,WP:1}},
  });
  expect(stGermain.units.filter(u=>u.kind==='FO').map(u=>[u.steps,u.experience,u.radios])).toEqual([[1,'Line',['ARTY']],[1,'Line',['MTR']]]);
  expect(stGermain.units.filter(u=>['hmg1','hmg2'].includes(u.id)).map(u=>[u.steps,u.experience])).toEqual([[1,'Line'],[1,'Line']]);
  expect(stGermain.enemy_counters.filter(u=>u.kind==='LEADER').every(u=>u.assets.rifle_grenade===2)).toBe(true);
 });
 it('passes authored profile validation and rejects unsupported package/counter/table content',()=>{
  expect(()=>validateNormandyContent(stGermain)).not.toThrow();
  for(const change of [s=>s.packages[10].units[0].kind='UNSUPPORTED',s=>s.packages[10].units[0].cover='UNKNOWN',s=>s.enemy_counters[0].vof='UNKNOWN',s=>s.package_tables.B[5]=13]){
   const s=structuredClone(stGermain);change(s);expect(()=>validateNormandyContent(s)).toThrow();
  }
 });
 it('rejects unsupported two-step overrides and incomplete or overlapping placement draws',()=>{
  expect(()=>validateStGermainContent(stGermain)).not.toThrow();
  for(const change of [s=>s.packages[10].units[0].steps=4,s=>s.packages[10].units[0].steps=0,s=>s.enemy_counters.filter(c=>c.kind==='SQUAD').forEach(c=>delete c.vof_by_steps[2]),s=>s.packages[10].placement_draw.close=[3,4],s=>s.packages[10].placement_draw.close=[4]]){
   const s=structuredClone(stGermain);change(s);expect(()=>validateStGermainContent(s)).toThrow();
  }
 });
 it('owns detached data and leaves accepted missions unchanged after preview',()=>{
  const accepted=[structuredClone(stGeorges),structuredClone(hill192)],before=structuredClone(stGermain);
  previewMissionSetup(stGermain,'immutable');
  expect(stGermain).toEqual(before);expect([stGeorges,hill192]).toEqual(accepted);
  const copy=structuredClone(stGermain);copy.packages[10].units[0].steps=1;
  expect(stGeorges.packages[10].units[0].kind).toBe('HMG');
  expect(hill192.packages[9].units[0].steps).toBe(2);
 });
});
