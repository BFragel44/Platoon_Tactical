import {vire} from './vire.js';
import {tinchebrayContent as content} from './tinchebrayContent.js';
import {validateNormandyContent} from '../sim/company/normandyContent.js';
import {atProfile} from '../sim/company/vehicleCombat.js';
export const tinchebray={
 ...structuredClone(vire),id:content.id,name:content.name,version:content.version,
 readiness:{playable:true,standalone_validated:true,stage:'accepted standalone',missing:[]},
 map:{...structuredClone(vire.map),...content.map},
 objectives:{type:'secure_and_clear',primary:'r6c2',secondary:'r5c3',attack:'r4c3',ccp:'r0c2',clear_rows:[1,2,3,4,5]},
 contact_rows:structuredClone(content.contact_rows),packages:structuredClone(content.packages),package_tables:structuredClone(content.package_tables),
 enemy_counters:structuredClone(vire.enemy_counters.filter(u=>u.kind!=='FLAK88')).map(u=>({...u,experience:'Green',...(u.kind==='LMG'?{ammo:{MG:3}}:{}),...(u.kind==='HMG'?{ammo:{MG:4}}:{})})),
 rules:{...structuredClone(vire.rules),tinchebray:true,enemyExperience:'Green',package_count:11,reattempts:2,
  objective_rows:structuredClone(content.objectives),required_enemy_kinds:structuredClone(content.required_enemy_kinds),
  baselineCompanyId:'normandy_tinchebray_standalone_company',rosterKey:'platoon-normandy-tinchebray-standalone',
  friendly_event_tables:structuredClone(content.friendly_event_tables),enemy_event_tables:structuredClone(content.enemy_event_tables)},
 briefing:content.special_rules[0],special_rules:structuredClone(content.special_rules),
 mission_content:{source:content.source,reattempts:2,standalone:true},
};
delete tinchebray.rules.vire;
delete tinchebray.rules.counterattack_table;
export function validateTinchebrayContent(definition=tinchebray){
 validateNormandyContent(definition);
 const fail=message=>{throw new Error(`Invalid Tinchebray content: ${message}.`);};
 if(definition.id!=='normandy_7'||definition.map.columns!==4||definition.map.rows!==6||!definition.map.staging||definition.rules.vire||definition.rules.counterattack_table||definition.rules.tactics!=='delay_defense'||definition.rules.enemyExperience!=='Green'||definition.rules.reattempts!==2)fail('mission capabilities');
 if(Object.keys(definition.packages).length!==11)fail('package count');
 for(let row=1;row<=6;row++)if(definition.contact_rows[row]!==(['C','C','B','B','A','A'][row-1]))fail('contact rows');
 for(const side of ['friendly','enemy'])for(const period of ['early','late']){
  const table=definition.rules[`${side}_event_tables`]?.[period];
  if(table?.length!==10||table.some(code=>!content[`${side}_event_tables`][period].includes(code)))fail(`${side} ${period} events`);
 }
 for(const force of Object.values(content.vehicle_platoons))atProfile(force.profile);
 return definition;
}
