// Mission diagram, tables and MSRs visually verified against Normandy pp.36–40.
// Authored content: live mission creation remains gated.
import {hill192Content} from './hill192Content.js';
const force=(kind,cover=null,extra={})=>({kind,cover,...extra});
export const vireContent={
 id:'normandy_6',name:'Normandy 6 — Vire Offensive',version:1,
 source:'FoF Deluxe Normandy Campaign pp.36–40; CSR 7 pp.14–15',
 map:{columns:4,rows:5,staging:true},turn_limit:10,reattempts:1,
 visibility:{light:0,weather:0},phase_sequence:'offensive',enemy_tactics:'delay_defense',enemy_experience:'Line',
 objectives:{primary_row:5,secondary_row:5,attack_row:4,clear_rows:[1,2,3]},
 contact_rows:{1:'C',2:'C',3:'B',4:['A','B'],5:['A','B']},question_side_rows:[4,5],battlefield_carryover:false,
 required_enemy_kinds:structuredClone(hill192Content.required_enemy_kinds),
 attachments:[
  {id:'artyfo',role:'artillery_observer',experience:'Line',steps:1,radios:['ARTY'],optional_radio_mount:'arty_jeep'},
  {id:'mtrfo',role:'mortar_observer',experience:'Line',steps:1,radios:['MTR']},
  ...['hmg1','hmg2'].map(id=>({id,kind:'HMG',experience:'Line',steps:1,ammo:{MG:6}})),
  {id:'engineers',kind:'SQUAD',experience:'Line',steps:3,vof:'S',capabilities:{engineer:true}},
 ],
 vehicle_platoons:{initial:{id:'sherman',profile:'M4_SHERMAN75',vehicles:5,hq_included:true,experience:'Line',ammo_each:5,at_ambush:true},event:{id:'m5',profile:'M5_LIGHT37',vehicles:5,hq_included:true,experience:'Line',ammo_each:5,at_ambush:true,entry_row:1}},
 vehicle_activation_order:['TANK','JEEP','AT'],
 package_tables:{A:[4,4,5,7,8,9,9,10,11,11],B:[1,2,2,3,3,4,4,7,8,8],C:[1,1,1,2,2,3,4,4,4,6]},
 counterattack_table:[2,2,2,10,10,10,10,12,12,12],
 counterattack:{letter:'A',duration:3,include_trigger:true,occupied_only:true,adjacent_unrevealed_pc_or_row:5,sequence_unchanged:true},
 placement:{sides:8,front:[1,2,3,4],left_front:[5,6],right_front:[7,8]},
 packages:{
  1:structuredClone(hill192Content.packages[1]),
  2:{alternatives:[{incoming:-4,incoming_agency:'enemy_artillery',units:[]},{incoming:-3,incoming_agency:'enemy_mortar',units:[force('SPOTTER','Foxholes',{agency:'mortar'})]}]},
  3:{units:[force('SNIPER','Cover')]},
  4:{units:[force('LMG','Foxholes',{ammo:4})],point_blank_chance:'2/10'},
  5:{units:[force('HMG','Foxholes',{ammo:6})],spotted:true},
  6:{units:[force('SQUAD',null)],exposed:true,no_fire:true,spotted:true},
  7:{units:[force('MORTAR','Foxholes',{ammo:3})]},
  8:{alternatives:[{units:[force('PANZERSCHRECK','Foxholes',{ammo:4})]},{units:[force('PAK40','Foxholes',{ammo:4})]}]},
  9:{alternatives:[{units:[force('SQUAD','Foxholes')],close_chance:'2/10'},{units:[force('SQUAD','Foxholes')],close_chance:'2/10',optional:{if_available:true,units:[force('LEADER','Foxholes',{same_as_previous:true})]}}]},
  10:{units:[force('SQUAD',null)],no_fire:true,spotted:true,infiltration:true},
  11:{alternatives:[{units:[force('INFANTRY_GUN75','Foxholes',{ammo:4})],spotted:true},{units:[force('FLAK88','Foxholes',{ammo:4})],spotted:true}]},
  12:{units:[force('LMG',null,{ammo:4})],spotted:true},
 },
 friendly_event_tables:{early:['SITREP','SITREP','COMM','TANK_SUPPORT','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','NO_CANNON','NO_MORTAR'],late:['SITREP','COMM','TANK_SUPPORT','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','NO_CANNON','NO_MORTAR','RESUPPLY']},
 enemy_event_tables:{early:['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK','COUNTER_ATTACK'],late:['EVAC','EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK']},
 enemy_late_start:7,support:structuredClone(hill192Content.support),
 enemy_spotters:{mortar:{missions:2,subsequent_draws:3}},enemy_equipment:{a_squad_mg_ammo:4,panzerfaust_each:1,leader_rifle_grenades:1},
 special_rules:[
  'Secure both Row 5 objectives and clear original Rows 1–3 within ten daylight turns. One reattempt is permitted.',
  'Counterattacks place question-side PC A on US-occupied Row 5 cards or occupied cards adjacent to an unrevealed contact. Offensive Assault lasts three turns including the trigger, then restores Delay Defense. The offensive phase sequence does not change.',
  'Vehicle actions complete in groups: tanks, then jeeps, then AT guns and AT-capable infantry. Reaction Fire remains possible throughout.',
  'Both M4 and M5 platoons are susceptible to Anti-Tank Ambush. Panzerfausts are vehicle-only weapons and are active in this mission.',
 ],
};
