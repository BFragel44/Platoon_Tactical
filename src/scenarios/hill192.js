import {cerisy} from './cerisy.js';
import {trevieres} from './trevieres.js';
import {stGeorges} from './stGeorges.js';
import {hill192Content as content} from './hill192Content.js';
import {hill192Weapons} from './hill192Weapons.js';
const units=structuredClone(cerisy.units).map(u=>({...u,location:`r1c${u.platoon??(['HQ','STAFF','FO'].includes(u.kind)?2:4)}`}));
units.push(...structuredClone(stGeorges.units.filter(u=>['hmg1','hmg2'].includes(u.id))));
export const hill192={
 ...structuredClone(cerisy),id:content.id,name:content.name,version:content.version,units,
 engineer_attachment:{id:'engineers',name:'Combat Engineers',kind:'SQUAD',platoon:null,steps:3,vof:'S',range:1,experience:'Line',radios:[],location:'r1c5',faction:'friendly',capabilities:{engineer:true}},
 readiness:{playable:true,stage:'accepted standalone',missing:[]},
 map:{...structuredClone(cerisy.map),...content.map},
 objectives:{type:'secure_and_clear',primary:'r4c2',secondary:'r4c3',attack:'r3c2',ccp:'r1c2',clear_rows:[2,3]},
 contact_rows:structuredClone(content.contact_rows),packages:structuredClone(content.packages),package_tables:structuredClone(content.package_tables),
 enemy_counters:[...structuredClone(cerisy.enemy_counters),...structuredClone(hill192Weapons),...Array.from({length:2},(_,i)=>({...structuredClone(trevieres.enemy_counters.find(u=>u.kind==='FLAK88')),id:`flak88_${i+1}`,name:`${i+1}/88mm FLAK 36`}))],
 rules:{...structuredClone(cerisy.rules),hill192:true,tactics:content.enemy_tactics,enemyExperience:content.enemy_experience,required_enemy_kinds:content.required_enemy_kinds,package_count:12,
  baselineCompanyId:'normandy_hill_192_standalone_company',rosterKey:'platoon-normandy-hill-192-standalone',enemy_late_start:content.enemy_late_start,
  enemy_spotters:structuredClone(content.enemy_spotters),friendly_event_tables:structuredClone(content.friendly_event_tables),enemy_event_tables:structuredClone(content.enemy_event_tables),counterattack_table:structuredClone(content.counterattack_table)},
 support_agencies:Object.fromEntries(Object.entries(content.support).map(([id,a])=>[id,{...structuredClone(cerisy.support_agencies[id]),...structuredClone(a)}])),
 briefing:'Secure both Row 4 objectives and clear original Rows 2–3 within ten daylight turns. No staging area: undeployed units remain unavailable. One reattempt is permitted.',
 special_rules:[
  'Secure both Row 4 objectives and clear original Rows 2–3. The offensive phase sequence is unchanged.',
  'All deployed units start on Row 1, except units from one platoon may occupy one selected Row 2 defense. There is no staging area; reserves remain unavailable.',
  'A scouted M3 battlefield retains terrain, all cover and discovered mines, including former outpost Foxholes. Patrol controls are removed. A discovered Row 2/3 minefield makes engineers eligible.',
  'Counterattacks place question-side PC A on US-occupied Row 4 cards or cards adjacent to an unrevealed contact. Offensive Assault applies for three turns including the trigger, then restores Deliberate Defense. The phase sequence remains offensive.',
  'Artillery: four HE, one WP and one time-on-target mission; mortar and cannon: three HE and one WP each. The artillery concentration adds one caller draw. Eligible artillery calls may become battalion missions.',
  'Panzerfaust and other vehicle attacks remain inactive. PAK40 crews use Close Range small arms without spending gun ammunition; infantry guns also make ranged grenade attacks using gun ammunition.',
 ],mission_content:{source:content.source,reattempts:1,standalone:true},
};
