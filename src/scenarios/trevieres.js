import {keepUpTheFire} from './keepUpTheFire.js';
import {normandyTerrain} from './normandyTerrain.js';

const units=[];
const add=(id,name,kind,platoon,steps,vof,range,experience,radios=[],extra={})=>units.push({id,name,kind,platoon,steps,vof,range,experience,radios,location:`r0c${platoon??2}`,faction:'friendly',...extra});
add('co','Company HQ','HQ',null,1,null,0,'Green',['BN','CO'],{command_role:'company_commander',agency_role:'company_commander',capabilities:{activate_subordinates:true,company_orders:true}});
add('xo','Company Executive Officer','STAFF',null,1,null,0,'Green',['CO'],{command_role:'company_executive',capabilities:{company_orders:true,succession_priority:-1}});
add('staff','Company First Sergeant','STAFF',null,1,null,0,'Veteran',[],{command_role:'company_staff',capabilities:{company_orders:true,succession_priority:2,cannot_order_roles:['company_executive']}});
for(let p=1;p<=3;p++){
 add(`hq${p}`,`${p} Platoon HQ`,'HQ',p,1,null,0,'Green',['CO'],{command_role:'platoon_commander',capabilities:{succession_priority:0}});
 for(let q=1;q<=3;q++)add(`s${p}${q}`,`${q}/${p} Rifle Squad`,'SQUAD',p,3,'S',2,'Line');
}
add('mortar_section','60mm Mortar Section','MORTAR',null,3,'H',2,'Line',['CO'],{ammo:{MTR:4}});
add('hmg50','.50 cal HMG','HMG',null,1,'H',3,'Line',[],{ammo:{MG:4},tripod:true,tripod_good_only:true,fire_team_vof:'S'});
for(let p=1;p<=2;p++)add(`mg${p}`,`${p}/LMG`,'MG',null,1,'A',2,'Line',[],{ammo:{MG:4},fire_team_vof:'A'});
for(let p=1;p<=3;p++)add(`at${p}`,`${p}/Bazooka`,'AT',null,1,'S',1,'Line',[],{ammo:{RKT:3},grenade_range:1,fire_team_vof:'S'});
add('artyfo','Artillery Forward Observer','FO',null,1,null,0,'Line',['ARTY'],{agency_role:'artillery_observer',capabilities:{succession_priority:1}});
const mortarTeams=Array.from({length:3},(_,i)=>({id:`mortar${i+1}`,name:`${i+1}/60mm Mortar`,kind:'MORTAR',platoon:null,steps:1,vof:'G',range:2,experience:'Line',radios:[],location:'r0c2',faction:'friendly',ammo:{MTR:4},fire_team_vof:'S'}));

const force=(kind,cover=null,extra={})=>({kind,cover,...extra});
const packages={
 1:{mines:true,optional:{chance:'1/2',units:[force('SNIPER','Cover')]}},
 2:{incoming_options:[{agency:'enemy_artillery',value:-4},{agency:'enemy_mortar',value:-3}],units:[force('SPOTTER','Trench')]},
 3:{units:[force('SNIPER','Cover')]},
 4:{mines:true,units:[force('HMG','Foxholes',{ammo:8})],spotted:true},
 5:{alternatives:[{units:[force('LMG','Foxholes',{ammo:6})],point_blank_chance:'2/10'},{units:[force('HMG','Foxholes',{ammo:8})],spotted:true}]},
 6:{units:[force('SQUAD','Trench'),force('SQUAD','Trench')],close_chance:'2/10',optional:{chance:'1/2',units:[force('HMG','Bunker',{ammo:8,same_as_any:true})]}},
 7:{units:[force('SQUAD','Trench'),force('SQUAD','Trench')],close_chance:'2/10',optional:{if_available:true,units:[force('LEADER','Trench',{same_as_previous:true})]}},
 8:{units:[force('HMG','Pillbox',{ammo:8})]},
 9:{units:[force('MORTAR','Foxholes',{ammo:6})]},
 10:{units:[force('FLAK88','Trench',{ammo:6})],spotted:true},
 11:{units:[force('SQUAD',null)],no_fire:true,spotted:true,infiltration:true},
 12:{units:[force('LMG',null,{ammo:6})],spotted:true},
};
const enemy_counters=[
 ...Array.from({length:4},(_,i)=>({id:`gr${i+1}`,kind:'SQUAD',name:`${i+1}/Grenadier`,steps:3,vof:i<3?'A':'S',vof_by_steps:i<3?{3:'A',2:'A'}:{3:'S',2:'S'},range:2,ammo:i<3?{MG:6}:{},last_step_vof:i<3?'A':'S'})),
 ...Array.from({length:5},(_,i)=>({id:`lmg${i+1}`,kind:'LMG',name:`${i+1}/German LMG`,steps:1,vof:'A',range:2,ammo:{MG:6},fire_team_vof:'A'})),
 ...Array.from({length:4},(_,i)=>({id:`hmg${i+1}`,kind:'HMG',name:`${i+1}/German HMG`,steps:1,vof:'H',range:3,ammo:{MG:8},tripod:true,tripod_good_only:true,fire_team_vof:'S'})),
 ...Array.from({length:3},(_,i)=>({id:`sniper${i+1}`,kind:'SNIPER',name:`${i+1}/German Sniper`,steps:1,vof:'S!',range:3})),
 ...Array.from({length:3},(_,i)=>({id:`spotter${i+1}`,kind:'SPOTTER',name:`${i+1}/German Spotter`,steps:1,vof:null,range:3,missions:2})),
 ...Array.from({length:2},(_,i)=>({id:`leader${i+1}`,kind:'LEADER',name:`${i+1}/German Leader`,steps:1,vof:null,fire_team_vof:'S',range:1})),
 ...Array.from({length:3},(_,i)=>({id:`mortar${i+1}`,kind:'MORTAR',name:`${i+1}/81mm Mortar`,steps:1,vof:'G',range:3,ammo:{MTR:6},fire_team_vof:'S'})),
 {id:'flak88',kind:'FLAK88',name:'FLAK 36 88mm Gun',steps:2,vof:'H',range:3,ammo:{GUN:6},mobile:false,fire_team_vof:'S'},
];
export const trevieres={
 id:'normandy_1',name:'Normandy 1 — Trévières Offensive',ruleset:'company-v1',version:5,turn_limit:10,
 readiness:{playable:true,stage:'standalone_validated',missing:[]},
 special_rules:[
  'Secure both Row 3 objectives and clear every original card in Rows 1–2 within ten daylight turns.',
  'Artillery: four HE and one WP missions. Artillery observer draws two cards; Company HQ draws one. No battalion fire missions.',
  'After first-attempt failure, one reattempt is available under §3.9. No Mission 2 progression is offered.',
  'Counterattack: place random remaining PC markers on their question side on every US-occupied battlefield card. Staging areas remain outside combat. Reveal overlapping markers and retain the highest letter (A, then B, then C).',
  'Offensive Assault lasts three turns including the triggering turn; the offensive sequence of play stays unchanged. Counterattack PC A uses packages 2 (2/4), 11 (1/4), or 12 (1/4). Question-side markers are revealed when the contact-evaluation segment begins.',
 ],
 briefing:'Cross the Aure on foot. Secure both Row 3 objectives and clear Rows 1 and 2 within ten turns. One reattempt is permitted after failure.',
 map:{columns:4,rows:3,hidden:true,deck:normandyTerrain},locations:[],units,contacts:[],
 unit_options:{mortar:{default:'section',section_id:'mortar_section',teams:mortarTeams},command_network:{default:'radio',choices:['radio','phones']}},
 rules:{enemyActivity:'normandy',contactExpansion:true,communications:'normandy',events:'normandy',grenade:-4,contactOrder:true,coverTable:'normandy',specialEnemies:true,signals:true,runners:true,ammo:'tracked',leaderBonus:true,tactics:'deliberate_defense',reattempts:1,counterattack_table:[2,2,11,12]},
 objectives:{type:'secure_and_clear',primary:'r3c2',secondary:'r3c3',attack:'r2c2',ccp:'r0c2',clear_rows:[1,2]},
 contact_rows:{1:'C',2:'A',3:'B'},contact_draws:keepUpTheFire.contact_draws,
 package_tables:{A:[3,5,5,6,7,7,8,10,11,11],B:[2,2,4,5,5,5,6,6,9,10],C:[1,1,2,2,2,2,3,4,5,5]},
 packages,enemy_counters,
 support_agencies:{artillery:{name:'15th Field Artillery Battalion',HE:-5,WP:-4,draws:{company_commander:1,artillery_observer:2},networks:{company_commander:'BN',artillery_observer:'ARTY'},inventory:{HE:4,WP:1}}},
 assets:{s11:{smoke:1,rifle_grenade:1},s21:{smoke:1,rifle_grenade:1},s31:{smoke:1,rifle_grenade:1},staff:{smoke:1},xo:{wp:4}},
 signal_assets:{rsp:{carrier:'co',order:'CF'},rsc:{carrier:'co',order:'CF'},gsp:{carrier:'hq1',order:'CF'},gsc:{carrier:'hq1',order:'CF'},red_signal:{carrier:'hq2',order:'CF'},green_signal:{carrier:'hq2',order:'CF'},yellow_signal:{carrier:'hq3',order:'CF'},purple_signal:{carrier:'hq3',order:'CF'}},
 mission_content:{source:'FoF Deluxe Normandy Campaign pp. 12–19',reattempts:1,phase_lines:['LOD','LOA'],counterattack_table:[2,2,11,12]},
};
