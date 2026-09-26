import {normandyTerrain} from './normandyTerrain.js';
const units=[];
const add=(id,name,kind,platoon,steps,vof,range,extra={})=>units.push({id,name,kind,platoon,steps,vof,range,location:`r0c${platoon??2}`,faction:'friendly',experience:'Line',radios:[],...extra});
add('co','Company HQ','HQ',null,1,null,0,{radios:['BN']});
add('xo','Executive Officer','STAFF',null,1,null,0);
add('staff','First Sergeant','STAFF',null,1,null,0);
for(let p=1;p<=3;p++){
 add(`hq${p}`,`${p} Platoon HQ`,'HQ',p,1,null,0);
 for(let q=1;q<=3;q++)add(`s${p}${q}`,`${q}/${p} Rifle Squad`,'SQUAD',p,3,'S',2);
 add(`at${p}`,`${p}/Bazooka`,'AT',p,1,'S',1,{grenade_range:1,fire_team_vof:'S'});
 add(`mortar${p}`,`${p}/60mm Mortar`,'MORTAR',p,1,'G',2);
}
for(let p=1;p<=2;p++)add(`mg${p}`,`${p}/LMG`,'MG',p,1,'A',2,{fire_team_vof:'A'});
add('artyfo','Artillery Observer','FO',null,1,null,0,{agency_role:'artyfo',radios:['ARTY']});
add('mtrfo','Mortar Observer','FO',null,1,null,0,{agency_role:'mtrfo',radios:['MTR']});
const force=(kind,cover=null)=>({kind,cover});
export const keepUpTheFire={
 id:'keep_up_the_fire',name:'Keep Up the Fire',ruleset:'company-v1',version:11,turn_limit:10,
 readiness:{playable:true,stage:'human_acceptance',missing:[],assumptions:['Fortification markers are unlimited; printed step capacities and enemy unit counters remain limited.']},
 briefing:'Human-acceptance build. Fortification markers are unlimited; printed capacities and enemy unit limits apply. Secure the Primary and Secondary Objectives on row 4 by turn 10. Achievement points also reward cleared positions, prisoners and casualty evacuation. This standalone mission uses simplified communications and event-driven ammunition; there are no vehicles or pyrotechnic signals.',
 map:{columns:4,rows:4,hidden:true,deck:normandyTerrain},locations:[],units,contacts:[],
 rules:{fortificationSupply:'unlimited_markers',contactExpansion:true,communications:'simplified',events:true,grenade:-4,contactOrder:true,coverTable:true,specialEnemies:true,signals:false,ammo:'events'},
 objectives:{type:'secure',primary:'r4c2',secondary:'r4c3',attack:'r3c2',ccp:'r0c2',clear_rows:[]},
 contact_rows:{1:'C',2:'B',3:'A',4:'B'},
 contact_draws:{NO_CONTACT:{A:0,B:0,C:4},CONTACT:{A:7,B:5,C:3},ENGAGED:{A:5,B:3,C:2},HEAVILY_ENGAGED:{A:3,B:2,C:1}},
 package_tables:{A:[2,3,3,5,6,7,8,9,9,9],B:[1,2,3,3,4,4,6,7,8,9],C:[1,1,2,2,3,3,4,4,5,7]},
 packages:{1:{mines:true},2:{units:[force('SNIPER','Cover')]},3:{incoming:-3,units:[force('SPOTTER','Cover')]},4:{units:[force('LMG','Foxholes')]},5:{units:[force('HMG','Bunker')]},6:{units:[force('SQUAD','Trench'),force('SQUAD','Trench')]},7:{spotted:true,no_fire:true,exposed:true,units:[force('SQUAD')]},8:{units:[force('HMG','Pillbox')]},9:{units:[force('HMG','Bunker'),force('SQUAD','Trench'),force('SQUAD','Trench')]}},
 enemy_counters:[...Array.from({length:4},(_,i)=>({id:`gr${i+1}`,kind:'SQUAD',name:`${i+1}/Gp Grenadier`,steps:3,vof:i<3?'A':'S',range:2,last_step_vof:i<3?'A':'S'})),...Object.entries({LMG:5,HMG:4,SNIPER:3,SPOTTER:3}).flatMap(([kind,count])=>Array.from({length:count},(_,i)=>({id:`${kind.toLowerCase()}${i+1}`,kind,name:`${i+1}/German ${kind==='SPOTTER'?'Mortar Spotter':kind}`,steps:1,vof:({LMG:'A',HMG:'A',SNIPER:'S!',SPOTTER:null})[kind],range:kind==='HMG'?3:2,tripod:kind==='HMG',fire_team_vof:['LMG','HMG'].includes(kind)?'A':'S'})))],
 support_agencies:{artillery:{name:'15th Field Artillery Battalion',HE:-5,WP:-4,draws:{co:2,artyfo:3,mtrfo:1},networks:{co:'BN',artyfo:'ARTY',mtrfo:'MTR'}},mortar:{name:'Battalion Mortar Platoon',HE:-3,WP:-3,draws:{co:2,artyfo:2,mtrfo:3},networks:{co:'BN',artyfo:'ARTY',mtrfo:'MTR'}}},
 assets:{s12:{rifle_grenade:1},s22:{rifle_grenade:1},s32:{rifle_grenade:1},s11:{smoke:1},s21:{smoke:1},s31:{smoke:1},staff:{smoke:1,wp:1},s13:{wp:1},s23:{wp:1},s33:{wp:1}},
};
