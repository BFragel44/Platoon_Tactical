import {stGeorges} from './stGeorges.js';
import {cerisy} from './cerisy.js';
import {companyAssault} from './companyAssault.js';
import {keepUpTheFire} from './keepUpTheFire.js';
import {trevieres} from './trevieres.js';
// Keep the development URL compatible; accepted missions use the normal catalog.
const normandyDevelopment=!trevieres.readiness.playable&&typeof location!=='undefined'&&new URLSearchParams(location.search).get('normandyDev')==='1';
const trevieresCandidate=normandyDevelopment?{...trevieres,readiness:{...trevieres.readiness,playable:true,stage:'development playtest'}}:trevieres;
const cerisyDevelopment=!cerisy.readiness.playable&&typeof location!=='undefined'&&new URLSearchParams(location.search).get('cerisyDev')==='1';
const cerisyCandidate=cerisyDevelopment?{...cerisy,readiness:{...cerisy.readiness,playable:true,stage:'development playtest'}}:cerisy;
const stGeorgesDevelopment=!stGeorges.readiness.playable&&stGeorges.readiness.development_validated&&typeof location!=='undefined'&&new URLSearchParams(location.search).get('stGeorgesDev')==='1';
const stGeorgesCandidate=stGeorgesDevelopment?{...stGeorges,readiness:{...stGeorges.readiness,playable:true,stage:'development playtest'}}:stGeorges;
export const missionCatalog=[{id:companyAssault.id,name:'Company Assault — regression course',scenario:companyAssault},{id:keepUpTheFire.id,name:'Keep Up the Fire — standalone',scenario:keepUpTheFire,unavailable:keepUpTheFire.readiness.playable?null:keepUpTheFire.readiness.missing.join('; ')},
 {id:trevieres.id,name:normandyDevelopment?`${trevieres.name} · development playtest`:trevieres.name,scenario:trevieresCandidate,unavailable:normandyDevelopment||trevieres.readiness.playable?null:trevieres.readiness.missing.join('; ')},
 {id:cerisy.id,name:cerisyDevelopment?`${cerisy.name} · development playtest`:cerisy.name,scenario:cerisyCandidate,unavailable:cerisyDevelopment||cerisy.readiness.playable?null:cerisy.readiness.missing.join('; ')},
 {id:stGeorges.id,name:stGeorgesDevelopment?`${stGeorges.name} · development playtest`:stGeorges.readiness.playable?stGeorges.name:`${stGeorges.name} · setup preview only`,scenario:stGeorgesCandidate,unavailable:stGeorgesDevelopment||stGeorges.readiness.playable?null:stGeorges.readiness.missing.join('; ')}];
export const missionById=id=>missionCatalog.find(m=>m.id===id)?.scenario;
export function playableMissionById(id){
 const entry=missionCatalog.find(m=>m.id===id);
 if(!entry)throw new Error('Unknown mission.');
 if(entry.unavailable)throw new Error(`${entry.name} is unavailable: ${entry.unavailable}`);
 return entry.scenario;
}
