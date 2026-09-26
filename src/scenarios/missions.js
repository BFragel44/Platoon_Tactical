import {companyAssault} from './companyAssault.js';
import {keepUpTheFire} from './keepUpTheFire.js';
export const missionCatalog=[{id:companyAssault.id,name:'Company Assault — regression course',scenario:companyAssault},{id:keepUpTheFire.id,name:'Keep Up the Fire — human acceptance',scenario:keepUpTheFire,unavailable:keepUpTheFire.readiness.playable?null:keepUpTheFire.readiness.missing.join('; ')},
 {id:'normandy_1',name:'Normandy 1 — Trévières',unavailable:'Requires ammunition, counterattacks, expanded communications and completion of Keep Up the Fire human acceptance.'}];
export const missionById=id=>missionCatalog.find(m=>m.id===id)?.scenario;
export function playableMissionById(id){
 const entry=missionCatalog.find(m=>m.id===id);
 if(!entry)throw new Error('Unknown mission.');
 if(entry.unavailable)throw new Error(`${entry.name} is unavailable: ${entry.unavailable}`);
 return entry.scenario;
}
