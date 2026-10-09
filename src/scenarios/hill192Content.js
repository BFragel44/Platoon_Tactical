// Visually verified Normandy pp.28–31; execution remains gated until every required profile is implemented.
const force=(kind,cover=null,extra={})=>({kind,cover,...extra});
export const hill192Content={
 id:'normandy_4',name:'Normandy 4 — Hill 192 Offensive',version:2,source:'FoF Deluxe Normandy Campaign pp.28–31; CSR 10 p.15',
 map:{columns:5,rows:4,staging:false},turn_limit:10,phase_sequence:'offensive',enemy_tactics:'deliberate_defense',enemy_experience:'Veteran',visibility:{light:0,weather:0},
 objectives:{primary_row:4,secondary_row:4,attack_row:3,clear_rows:[2,3]},contact_rows:{1:'C',2:'B',3:'A',4:'A'},contacts_on_occupied_cards:true,
 defenses:{row1_foxholes_per_card:2,forward_row:2,forward_platoons_max:1,forward_cards_max:1},reattempts:1,
 required_enemy_kinds:['SQUAD','LMG','HMG','SNIPER','SPOTTER','LEADER','MORTAR','PANZERSCHRECK','PAK40','INFANTRY_GUN75','FLAK88'],
 battlefield_carryover:{source:'normandy_3',retain:['terrain','covers','discovered_mines'],remove_controls:['cop','mlr','route'],engineer_mine_rows:[2,3]},
 package_tables:{A:[4,6,6,7,7,8,9,10,10,11],B:[1,1,1,2,2,2,4,4,6,6],C:[1,1,1,2,2,3,4,4,4,5]},counterattack_table:[2,2,2,5,5,5,5,12,12,12],
 counterattack:{letter:'A',duration:3,include_trigger:true,occupied_only:true,adjacent_unrevealed_pc_or_row:4,sequence_unchanged:true},
 packages:{
  1:{mines:true,mine_followup:{sides:9,branches:[{numbers:[1,2,3],units:[]},{numbers:[4,5,6],units:[force('HMG','Foxholes')]},{numbers:[7,8,9],units:[force('SNIPER','Cover')]}]},units:[]},
  2:{alternatives:[{incoming:-4,incoming_agency:'enemy_artillery',units:[force('SPOTTER','Trench',{agency:'artillery'})]},{incoming:-3,incoming_agency:'enemy_mortar',units:[force('SPOTTER','Trench',{agency:'mortar'})]}]},
  3:{units:[force('SNIPER','Cover')]},
  4:{alternatives:[{units:[force('LMG','Foxholes',{ammo:6})],point_blank_chance:'2/10'},{units:[force('HMG','Foxholes',{ammo:8})],spotted:true}]},
  5:{units:[force('SQUAD',null)],no_fire:true,spotted:true,infiltration:true},
  6:{alternatives:[{units:[force('PANZERSCHRECK','Foxholes',{ammo:4})]},{units:[force('PAK40','Foxholes',{ammo:6})]}]},
  7:{units:[force('SQUAD','Foxholes'),force('SQUAD','Foxholes')],close_chance:'2/10',optional:{if_available:true,units:[force('LEADER','Foxholes',{same_as_previous:true})]}},
  8:{units:[force('SQUAD','Trench'),force('SQUAD','Trench'),force('HMG','Bunker',{ammo:8,same_as_any:true})]},
  9:{units:[force('SQUAD','Deep Bunker',{steps:2}),force('LEADER','Deep Bunker',{same_as_previous:true})],no_fire:true,spotted:true,placement_draw:{sides:5,point_blank:[1,2,3],close:[4,5]}},
  10:{alternatives:[{units:[force('INFANTRY_GUN75','Foxholes',{ammo:6})],spotted:true},{units:[force('FLAK88','Foxholes',{ammo:6})],spotted:true}]},
  11:{units:[force('LMG','Foxholes',{ammo:6}),force('MORTAR','Foxholes',{ammo:6,same_as_previous:true})]},
  12:{units:[force('LMG',null,{ammo:6})],spotted:true},
 },
 friendly_event_tables:{early:['SITREP','SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','NO_CANNON','NO_MORTAR'],late:['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','NO_CANNON','NO_MORTAR','RESUPPLY']},
 enemy_event_tables:{early:['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK','COUNTER_ATTACK'],late:['EVAC','EVAC','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK','COUNTER_ATTACK']},enemy_late_start:6,
 support:{
  artillery:{HE:-5,WP:-4,TOT:-7,draws:{artillery_observer:3,mortar_observer:2,company_commander:2},ammo_draws:{TOT:{artillery_observer:3,mortar_observer:2,company_commander:1}},inventory:{HE:4,WP:1,TOT:1},battalion:true},
  mortar:{HE:-3,WP:-3,draws:{artillery_observer:2,mortar_observer:3,company_commander:2},inventory:{HE:3,WP:1}},
  cannon:{HE:-4,WP:-4,draws:{artillery_observer:3,mortar_observer:3,company_commander:2},inventory:{HE:3,WP:1}},
 },enemy_spotters:{mortar:{missions:3,subsequent_draws:4},artillery:{missions:2,subsequent_draws:2}},
};
