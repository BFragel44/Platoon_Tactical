// Published mission pages 42–46 and M10 player-aid row visually verified.
// Content foundation only: live execution remains gated pending integration.
import {vireContent} from './vireContent.js';
const force=(kind,cover='Foxholes',extra={})=>({kind,cover,...extra});
export const tinchebrayContent={
 ...structuredClone(vireContent),id:'normandy_7',name:'Normandy 7 — Tinchebray Offensive',version:1,
 source:'FoF Deluxe Normandy Campaign pp.42–46; CSR pp.12–15; breakdowns pp.47–48',
 map:{columns:4,rows:6,staging:true},reattempts:2,enemy_experience:'Green',
 objectives:{primary_row:6,secondary_row:5,attack_row:4,attack_adjacent_to:'secondary',clear_rows:[1,2,3,4,5]},
 contact_rows:{1:'C',2:'C',3:'B',4:'B',5:'A',6:'A'},question_side_rows:[],
 required_enemy_kinds:vireContent.required_enemy_kinds.filter(kind=>kind!=='FLAK88'),
 vehicle_platoons:{initial:{id:'m10',profile:'M10_TD76',vehicles:4,hq_included:true,experience:'Line',ammo_each:5,at_ambush:true},event:structuredClone(vireContent.vehicle_platoons.event)},
 package_tables:{A:[4,5,6,7,8,8,9,9,10,11],B:[1,2,2,3,4,4,4,7,8,8],C:[1,1,2,2,3,3,4,4,6,6]},
 packages:{
  1:{mines:true,mine_followup:{sides:9,branches:[{numbers:[1,2],units:[force('HMG','Foxholes',{ammo:4})]},{numbers:[3,4,5,6,7,8,9],units:[]}] }},
  2:{incoming:-3,incoming_agency:'enemy_mortar',units:[force('SPOTTER','Foxholes',{agency:'mortar'})]},
  3:{units:[force('SNIPER','Cover')],additional_mines:{sides:3,numbers:[1]}},
  4:{units:[force('LMG','Foxholes',{ammo:3})],point_blank_chance:'2/10'},
  5:{units:[force('HMG','Foxholes',{ammo:4})],spotted:true},
  6:{units:[force('SQUAD',null)],exposed:true,no_fire:true,spotted:true},
  7:{units:[force('MORTAR','Foxholes',{ammo:3})]},
  8:structuredClone(vireContent.packages[8]),9:structuredClone(vireContent.packages[9]),
  10:structuredClone(vireContent.packages[10]),
  11:{units:[force('INFANTRY_GUN75','Foxholes',{ammo:4})],spotted:true},
 },
 friendly_event_tables:{early:['SITREP','SITREP','COMM','TANK_SUPPORT','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','NO_ARTY','NO_MORTAR'],late:['SITREP','COMM','TANK_SUPPORT','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','NO_ARTY','NO_MORTAR','RESUPPLY']},
 enemy_event_tables:{early:['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','FALL_BACK','FALL_BACK'],late:['EVAC','EVAC','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','FALL_BACK','FALL_BACK']},
 special_rules:[
  'Secure the Row 6 primary and Row 5 secondary objectives and clear every original Row 1–5 card within ten daylight turns. Two reattempts are permitted.',
  'Complete vehicle actions for both sides in order: tanks and tank destroyers, then Jeeps, then AT guns and AT-capable infantry. Normal reaction opportunities remain available.',
  'The initial four M10 tank destroyers and event-only five M5 tanks are susceptible to Anti-Tank Ambush. Tank ammunition cannot be replenished by infantry resupply.',
 ],
};
// Deliberately remove Vire-only capabilities instead of carrying them forward.
delete tinchebrayContent.counterattack;
delete tinchebrayContent.counterattack_table;
