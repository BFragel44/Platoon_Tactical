import {trevieres} from './trevieres.js';
const force=(kind,cover=null,extra={})=>({kind,cover,...extra});
const units=structuredClone(trevieres.units);
units.push({id:'mtrfo',name:'81mm Mortar Forward Observer',kind:'FO',platoon:null,steps:1,vof:null,range:0,experience:'Line',radios:['MTR'],location:'r0c2',faction:'friendly',agency_role:'mortar_observer',capabilities:{succession_priority:1}});
const common=trevieres.enemy_counters.filter(c=>['LMG','HMG','SNIPER','SPOTTER','LEADER'].includes(c.kind)).map(c=>({...structuredClone(c),...(c.kind==='SPOTTER'?{missions:3,subsequent_draws:3}:{}),...(c.kind==='LEADER'?{assets:{rifle_grenade:2}}:{})}));
const squads=Array.from({length:6},(_,i)=>({id:`fj${i+1}`,kind:'SQUAD',name:`${i+1}/Fallschirmjäger`,steps:3,vof:i<3?'A':i===3?'S':'A/S',vof_by_steps:i<3?{3:'A',2:'A'}:i===3?{3:'S',2:'S'}:{3:'A/S',2:'A/S'},range:2,ammo:i<3?{MG:6}:{},last_step_vof:i<3?'A':'S',breakdown:i<3?'fallschirmjager_a':i===3?'fallschirmjager_s':'fallschirmjager_as',assets:{panzerfaust:2}}));
const mortar={id:'mortar_section81',kind:'MORTAR',name:'81mm Mortar Section',steps:3,vof:'H',range:3,ammo:{MTR:6},fire_team_vof:'S',breakdown:'german_mortar_section'};
const early=['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK','COUNTER_ATTACK'];
const late=['EVAC','EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK'];
const agency=(name,HE,WP,draws,inventory,battalion=false)=>({name,HE,WP,draws,inventory,battalion,networks:{company_commander:'BN',artillery_observer:'ARTY',mortar_observer:'MTR'}});
export const cerisy={
 ...structuredClone(trevieres),id:'normandy_2',name:'Normandy 2 — Cerisy Offensive',version:1,
 readiness:{playable:true,stage:'accepted standalone',missing:[]},
 map:{...structuredClone(trevieres.map),rows:5},units,
 objectives:{type:'secure_and_clear',primary:'r5c2',secondary:'r5c3',attack:'r4c2',ccp:'r0c2',clear_rows:[1,2,3,4]},
 contact_rows:{1:'C',2:'C',3:'B',4:'B',5:'A'},
 rules:{...structuredClone(trevieres.rules),tactics:'hasty_defense',counterattack_table:[1,1,1,9,9,9,9,11,11,11],enemy_event_tables:{early,late},friendly_event_tables:{early:['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','ADVANCE_PC','RESUPPLY','RESUPPLY'],late:['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','RESUPPLY','RESUPPLY','RESUPPLY']},required_enemy_kinds:['SQUAD','LMG','HMG','SNIPER','SPOTTER','LEADER','MORTAR'],package_count:11,missionIdentity:true,standaloneRoster:true,rosterKey:'platoon-normandy-cerisy-standalone'},
 package_tables:{A:[3,3,3,4,5,6,7,8,9,10],B:[1,1,1,2,3,3,3,3,9,9],C:[1,1,1,2,2,3,3,3,9,9]},
 packages:{
  1:{alternatives:[{incoming:-4,incoming_agency:'enemy_artillery',units:[]},{incoming:-3,incoming_agency:'enemy_mortar',units:[force('SPOTTER','Foxholes')]}]},
  2:{units:[force('SNIPER','Cover')]},
  3:{alternatives:[{units:[force('LMG','Foxholes',{ammo:6})],placement_draw:{sides:10,point_blank:[1,2],max:[3,4,5,6,7,8]}},{units:[force('HMG','Foxholes',{ammo:8})],spotted:true}]},
  4:{units:[force('SQUAD','Foxholes'),force('SQUAD','Foxholes')],close_chance:'2/10'},
  5:{units:[force('SQUAD','Trench'),force('SQUAD','Trench'),force('HMG','Bunker',{ammo:8,same_as_any:true})]},
  6:{units:[force('SQUAD','Foxholes'),force('SQUAD','Foxholes')],close_chance:'2/10',optional:{if_available:true,units:[force('LEADER','Foxholes',{same_as_previous:true})]}},
  7:{units:[force('SQUAD','Deep Bunker',{steps:2}),force('LEADER','Deep Bunker',{same_as_previous:true})],no_fire:true,spotted:true,placement_draw:{sides:5,point_blank:[1,2,3],close:[4,5]}},
  8:{units:[force('LMG','Foxholes',{ammo:6}),force('MORTAR','Foxholes',{ammo:6,same_as_previous:true})]},
  9:{units:[force('SQUAD',null)],no_fire:true,spotted:true,infiltration:true},
  10:{units:[force('HMG','Pillbox',{ammo:8})],point_blank_chance:'2/10',outflanked:true},
  11:{units:[force('LMG',null,{ammo:6})],spotted:true},
 },enemy_counters:[...squads,...common,mortar],
 support_agencies:{artillery:agency('15th Field Artillery Battalion',-5,-4,{artillery_observer:3,mortar_observer:2,company_commander:2},{HE:4,WP:1},true),mortar:agency('Battalion Mortar Platoon',-3,-3,{artillery_observer:2,mortar_observer:3,company_commander:2},{HE:3,WP:1}),cannon:agency('Regimental Cannon Company',-4,-4,{artillery_observer:3,mortar_observer:3,company_commander:2},{HE:3,WP:1})},
 briefing:'Clear the Cerisy forest and maintain contact. Secure both Row 5 objectives and clear original Rows 1–4 within ten daylight turns. One reattempt is permitted.',
 special_rules:[
  'Secure both Row 5 objectives and clear original Rows 1–4 within ten daylight turns. One reattempt is permitted after first-attempt failure.',
  'Fresh standalone company: no carryover from Mission 1. Radios and the mortar section are the defaults; field phones and individual mortar teams remain selectable.',
  'Artillery: four HE / one WP; battalion mortar and regimental cannon: three HE / one WP each. Caller draws follow the Mission 2 support table. Artillery may expand a successful three-burst call into a battalion mission.',
  'Enemy tactics begin at Hasty Defense. Counterattacks place question-side contacts on US-occupied battlefield cards and apply Offensive Assault for three turns including the trigger, then restore Hasty Defense. The offensive phase sequence stays unchanged.',
  'Counterattack PC A uses packages 1 (3/10), 9 (4/10), or 11 (3/10). Overlapping markers reveal and retain the highest letter (A, then B, then C).',
  'Deep Bunker occupants exert no VOF and cannot spot, deploy signals or make grenade attacks until they leave. Point-blank pillboxes are spotted, face randomly, and do not fire immediately.',
  'Fallschirmjäger squads use their own breakdown chart. Leaders have two rifle grenades. Panzerfausts are vehicle-only equipment and remain inactive in this infantry mission.',
 ],mission_content:{source:'FoF Deluxe Normandy Campaign pp. 12–15, 20–23, 47–48',reattempts:1,standalone:true},
};
