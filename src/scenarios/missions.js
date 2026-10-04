import {companyAssault} from './companyAssault.js';
import {keepUpTheFire} from './keepUpTheFire.js';
import {trevieres} from './trevieres.js';
// Explicit opt-in for manual source review; the normal catalog remains gated.
const normandyDevelopment=typeof location!=='undefined'&&new URLSearchParams(location.search).get('normandyDev')==='1';
const trevieresCandidate=normandyDevelopment?{...trevieres,readiness:{...trevieres.readiness,playable:true,stage:'development playtest'}}:trevieres;
export const missionCatalog=[{id:companyAssault.id,name:'Company Assault — regression course',scenario:companyAssault},{id:keepUpTheFire.id,name:'Keep Up the Fire — standalone',scenario:keepUpTheFire,unavailable:keepUpTheFire.readiness.playable?null:keepUpTheFire.readiness.missing.join('; ')},
 {id:trevieres.id,name:normandyDevelopment?`${trevieres.name} · development playtest`:trevieres.name,scenario:trevieresCandidate,unavailable:normandyDevelopment?null:trevieres.readiness.missing.join('; ')}];
export const missionById=id=>missionCatalog.find(m=>m.id===id)?.scenario;
export function playableMissionById(id){
 const entry=missionCatalog.find(m=>m.id===id);
 if(!entry)throw new Error('Unknown mission.');
 if(entry.unavailable)throw new Error(`${entry.name} is unavailable: ${entry.unavailable}`);
 return entry.scenario;
}
