import {vireContent} from './vireContent.js';
import {cerisy} from './cerisy.js';
import {trevieres} from './trevieres.js';
import {stGeorges} from './stGeorges.js';
import {hill192Weapons} from './hill192Weapons.js';
const content=vireContent;
const units=structuredClone(cerisy.units);
units.push(...structuredClone(stGeorges.units.filter(u=>['hmg1','hmg2'].includes(u.id))).map(u=>({...u,location:'r0c2'})));
units.push({id:'engineers',name:'Combat Engineers',kind:'SQUAD',platoon:null,steps:3,vof:'S',range:1,experience:'Line',radios:[],location:'r0c2',faction:'friendly',capabilities:{engineer:true}});
for(const u of units)if(['artyfo','mtrfo','hmg1','hmg2','engineers'].includes(u.id))u.attachment=true;
const enemyCounters=structuredClone(cerisy.enemy_counters.filter(u=>u.kind!=='MORTAR')).map(u=>{
 if(u.kind==='SQUAD'){u.assets.panzerfaust=1;if(u.vof==='A')u.ammo.MG=4;}
 if(u.kind==='LMG')u.ammo.MG=4;
 if(u.kind==='HMG')u.ammo.MG=6;
 if(u.kind==='SPOTTER'){u.missions=2;u.subsequent_draws=3;}
 if(u.kind==='LEADER')u.assets.rifle_grenade=1;
 return u;
});
enemyCounters.push(...structuredClone(trevieres.enemy_counters.filter(u=>u.kind==='MORTAR')).map(u=>({...u,ammo:{MTR:3}})),
 ...structuredClone(hill192Weapons).map(u=>({...u,...(u.kind==='PAK40'?{range:3,basic_range:1}:{}),ammo:{[u.ammo_key]:4}})),
 ...Array.from({length:2},(_,i)=>({...structuredClone(trevieres.enemy_counters.find(u=>u.kind==='FLAK88')),id:`flak88_${i+1}`,name:`${i+1}/88mm FLAK 36`,ammo:{GUN:4}})));
// Explicit development execution is available; normal selection remains gated.
export const vire={
 ...structuredClone(cerisy),id:content.id,name:content.name,version:content.version,units,
 readiness:{playable:false,stage:'explicit-phase playtest candidate',missing:['explicit-phase user acceptance']},
 map:{...structuredClone(cerisy.map),...content.map},
 objectives:{type:'secure_and_clear',primary:'r5c2',secondary:'r5c3',attack:'r4c2',ccp:'r0c2',clear_rows:[1,2,3]},
 contact_rows:structuredClone(content.contact_rows),packages:structuredClone(content.packages),package_tables:structuredClone(content.package_tables),enemy_counters:enemyCounters,
 rules:{...structuredClone(cerisy.rules),tactics:content.enemy_tactics,enemyExperience:content.enemy_experience,required_enemy_kinds:structuredClone(content.required_enemy_kinds),package_count:12,engineerAttachments:true,vire:true,
  baselineCompanyId:'normandy_vire_standalone_company',rosterKey:'platoon-normandy-vire-standalone',enemy_late_start:content.enemy_late_start,
  enemy_spotters:structuredClone(content.enemy_spotters),friendly_event_tables:structuredClone(content.friendly_event_tables),enemy_event_tables:structuredClone(content.enemy_event_tables),counterattack_table:structuredClone(content.counterattack_table)},
 support_agencies:Object.fromEntries(Object.entries(content.support).map(([id,a])=>[id,{...structuredClone(cerisy.support_agencies[id]),...structuredClone(a)}])),
 briefing:'Secure both Row 5 objectives and clear original Rows 1–3 within ten daylight turns. The initial Sherman platoon supports the fresh standalone company. One reattempt is permitted.',
 special_rules:structuredClone(content.special_rules),mission_content:{source:content.source,reattempts:1,standalone:true},
};
export function validateVireContent(content=vireContent,{supportedEnemyKinds=[],supportedVehicleProfiles=[]}={}){
 const fail=message=>{throw new Error(`Invalid Vire content: ${message}.`);};
 const distribution=(sides,groups,label)=>{
  const values=groups.flat();
  if(values.length!==sides||new Set(values).size!==sides||values.some(n=>!Number.isInteger(n)||n<1||n>sides))fail(label);
 };
 if(content.map.columns!==4||content.map.rows!==5||content.map.staging!==true)fail('map');
 if(content.enemy_tactics!=='delay_defense'||content.phase_sequence!=='offensive')fail('tactics or phase sequence');
 for(const letter of ['A','B','C'])if(content.package_tables[letter]?.length!==10||content.package_tables[letter].some(n=>!content.packages[n]))fail(`${letter} table`);
 if(content.counterattack_table?.length!==10||content.counterattack_table.some(n=>!content.packages[n]))fail('counterattack table');
 distribution(content.placement.sides,[content.placement.front,content.placement.left_front,content.placement.right_front],'placement');
 for(let n=1;n<=12;n++){
  const entry=content.packages[n];if(!entry)fail(`package ${n}`);
  const variants=entry.mine_followup?entry.mine_followup.branches:entry.alternatives??[entry];
  if(entry.mine_followup)distribution(entry.mine_followup.sides,entry.mine_followup.branches.map(b=>b.numbers),`package ${n} follow-up`);
  for(const variant of variants)for(const unit of [...(variant.units??[]),...(variant.optional?.units??[])]){
   if(!supportedEnemyKinds.includes(unit.kind))fail(`unsupported enemy profile ${unit.kind}`);
   if(unit.ammo!==undefined&&(!Number.isInteger(unit.ammo)||unit.ammo<0))fail(`package ${n} ammunition`);
  }
 }
 for(const platoon of Object.values(content.vehicle_platoons))if(!supportedVehicleProfiles.includes(platoon.profile))fail(`unsupported vehicle profile ${platoon.profile}`);
 for(const side of ['friendly','enemy'])for(const period of ['early','late'])if(content[`${side}_event_tables`][period]?.length!==10)fail(`${side} ${period} events`);
 return content;
}
