import {ILLUMINATION_PROFILES} from './visibility.js';
const REQUIRED_KINDS=['SQUAD','LMG','HMG','SNIPER','SPOTTER','LEADER','MORTAR','FLAK88'];
const COVERS=new Set([null,'Cover','Foxholes','Trench','Bunker','Pillbox','Deep Bunker']);
const VOFS=new Set([null,'S','A','A/S','H','G','S!']);
export function validateNormandyContent(definition){
 if(definition.rules?.enemyActivity!=='normandy')return;
 const kinds=definition.rules.required_enemy_kinds??REQUIRED_KINDS;
 const counters=definition.enemy_counters??[],packages=definition.packages??{};
 if(new Set(counters.map(c=>c.id)).size!==counters.length)throw new Error('Duplicate Normandy enemy counter ID.');
 for(const kind of kinds)if(!counters.some(c=>c.kind===kind))throw new Error(`Missing Normandy enemy profile: ${kind}.`);
 for(const c of counters)if(!kinds.includes(c.kind)||!Number.isInteger(c.steps)||c.steps<1||c.steps>3||!Number.isInteger(c.range)||c.range<0||c.range>3||!VOFS.has(c.vof)||!c.id||Object.entries(c.ammo??{}).some(([key,n])=>!['MG','MTR','GUN'].includes(key)||!Number.isInteger(n)||n<0)||Object.entries(c.vof_by_steps??{}).some(([steps,vof])=>!['1','2','3'].includes(steps)||!VOFS.has(vof)))throw new Error(`Unsupported Normandy enemy profile: ${c.id??c.kind}.`);
 for(let number=1;number<=(definition.rules.package_count??12);number++){
  const entry=packages[number];if(entry?.illumination&&(!definition.rules.patrols||!ILLUMINATION_PROFILES[entry.illumination]))throw new Error(`Unsupported Normandy package ${number} illumination.`);if(!entry)throw new Error(`Missing Normandy package ${number}.`);
  const variants=entry.alternatives??[entry];
  for(const variant of variants){
   for(const spec of [...(variant.units??[]),...(variant.optional?.units??[])])if(!kinds.includes(spec.kind)||!counters.some(c=>c.kind===spec.kind)||!COVERS.has(spec.cover??null))throw new Error(`Unsupported Normandy package ${number} profile or cover: ${spec.kind}.`);
  }
 }
 for(const row of ['A','B','C'])if(definition.package_tables?.[row]?.length!==10||definition.package_tables[row].some(number=>!packages[number]))throw new Error(`Invalid Normandy ${row} contact table.`);
}
