import {trevieres} from '../../scenarios/trevieres.js';
import {cerisy} from '../../scenarios/cerisy.js';
import {stGeorges} from '../../scenarios/stGeorges.js';
import {hill192} from '../../scenarios/hill192.js';
import {stGermain} from '../../scenarios/stGermain.js';
import {vire} from '../../scenarios/vire.js';
import {tinchebray} from '../../scenarios/tinchebray.js';
import {createMission,exportReplay,replayMission,RULES_VERSION} from './engine.js';
import {createVireDevelopmentMission} from './vireMission.js';
import {createTinchebrayDevelopmentMission} from './tinchebrayMission.js';
import {importVireAdapterReplay,VIRE_ADAPTER_VERSION,TINCHEBRAY_ADAPTER_VERSION} from './vireIntegration.js';
import {preparedCompanyDeployment,commitPreparedCompanyDeployment,saveCompanyPreparation} from './campaignPreparation.js';
import {rosterSnapshot} from './campaignRoster.js';
import {hill192DeploymentDefinition} from './hill192Setup.js';
export const NORMANDY_SEQUENCE=Object.freeze([trevieres,cerisy,stGeorges,hill192,stGermain,vire,tinchebray]);
// Standard campaign, rules §§12.0/12.8. Patrol failures do not end it.
export function campaignProgress(record){
 if(!record)return {destination:trevieres,completed:0,ended:false};
 const history=record.history;
 if(!Array.isArray(history)||history.length>7||history.some((h,i)=>h.replay?.scenario!==NORMANDY_SEQUENCE[i].id||h.snapshot?.company_id!==record.roster.company_id))throw new Error('Campaign history is not an ordered, same-company Normandy sequence. Export the original record.');
 const failure=history.find(h=>h.outcome!=='SUCCESS'&&!(h.outcome==='DEFEAT'&&['normandy_3','normandy_5'].includes(h.replay.scenario)));
 if(failure)return {destination:null,completed:history.length,ended:true,reason:`Standard campaign ended: ${failure.outcome.toLowerCase()} at ${NORMANDY_SEQUENCE.find(s=>s.id===failure.replay.scenario).name}. Combat patrol defeat is the only continuation exception.`};
 if(history.length===7)return {destination:null,completed:7,ended:true,reason:'Normandy campaign complete. All seven missions have terminal history records.'};
 const destination=NORMANDY_SEQUENCE[history.length];
 if(record.active_deployment&&record.active_deployment.scenario!==destination.id)throw new Error('Committed campaign deployment is out of sequence. Export the original record.');
 return {destination,completed:history.length,ended:false};
}
export function campaignCheckpoint(state,presentation={}){
 return {replay:exportReplay(state),presentation:structuredClone(presentation),turn:state.turn,phase:state.phase,timestamp:new Date().toISOString(),...(state.vire_runtime?{attempt:state.attempt_number}:{})};
}
export function resumeCampaignCheckpoint(saved){
 const r=saved?.replay,definition=NORMANDY_SEQUENCE.find(d=>d.id===r?.scenario);
 if(!definition)throw new Error('Unknown campaign mission. Export its original record.');
 const state=r.format?importVireAdapterReplay(r):replayMission(definition,r);
 if(state.turn!==saved.turn||state.phase!==saved.phase||state.vire_runtime&&state.attempt_number!==saved.attempt)throw new Error('Campaign checkpoint metadata does not match its replay.');
 return {state,presentation:structuredClone(saved.presentation??{})};
}
function deployment(record,id,destination,setup){
 if(record.stage==='PREPARED')return preparedCompanyDeployment(record,id,destination,setup);
 if(record.stage!=='DEPLOYMENT'||record.history.length||record.active_deployment)throw new Error('This campaign already has a committed mission; resume it instead.');
 return {mission_instance_id:id,roster:record.roster,setup:structuredClone(setup)};
}
export function previewCampaignMission(record,id,seed,setup={}){
 if(typeof id!=='string'||!id||record.history.some(h=>h.mission_id===id))throw new Error('A unique campaign mission identity is required.');
 const progress=campaignProgress(record);if(!progress.destination)throw new Error(progress.reason);
 const deployed=deployment(record,id,progress.destination,setup),definition=hill192DeploymentDefinition(progress.destination,deployed.setup);
 const {vehicle_positions={},jeep,...infantry}=deployed.setup;
 const state=definition.rules?.vire?createVireDevelopmentMission(seed,infantry,vehicle_positions,{jeep,mission_instance_id:id,roster:deployed.roster}):definition.rules?.tinchebray?createTinchebrayDevelopmentMission(seed,infantry,vehicle_positions,{jeep,mission_instance_id:id,roster:deployed.roster}):createMission(definition,seed,infantry,deployed);
 return {state,deployment:deployed,definition};
}
// The committed start lives in the company record. Tactical recovery is a mirror:
// a failed mirror write cannot leave a half-committed roster or invent a mission.
export function commitCampaignMission(storage,record,id,seed,setup={}){
 const result=previewCampaignMission(record,id,seed,setup);
 const next=record.stage==='PREPARED'?commitPreparedCompanyDeployment(record,id,result.definition,result.deployment.setup).record:{...structuredClone(record),revision:record.revision+1};
 if(JSON.stringify(rosterSnapshot(next.roster))!==JSON.stringify(result.state.roster_snapshot))throw new Error('Prepared company does not match the immutable mission start.');
 next.active_deployment={mission_id:id,scenario:result.state.scenario_id,setup:structuredClone(result.deployment.setup),snapshot:structuredClone(result.state.roster_snapshot),start_checkpoint:campaignCheckpoint(result.state)};
 saveCompanyPreparation(storage,next,record.revision);
 return {...result,record:next};
}
export function resumeCommittedCampaign(record){
 campaignProgress(record);const committed=record.active_deployment;
 if(!committed?.start_checkpoint)throw new Error('No committed mission start is available. Export the original campaign record.');
 const restored=resumeCampaignCheckpoint(committed.start_checkpoint);
 if(restored.state.mission_instance_id!==committed.mission_id||JSON.stringify(restored.state.roster_snapshot)!==JSON.stringify(committed.snapshot)||JSON.stringify(rosterSnapshot(record.roster))!==JSON.stringify(committed.snapshot))throw new Error('Committed campaign start identity mismatch.');
 return restored;
}
export function campaignReplayCompatible(replay,definition){
 return !!replay&&replay.scenario===definition.id&&(replay.format?replay.format===(definition.id==='normandy_7'?'tinchebray-integration':'vire-integration')&&replay.version===(definition.id==='normandy_7'?TINCHEBRAY_ADAPTER_VERSION:VIRE_ADAPTER_VERSION)&&replay.base_rules_version===RULES_VERSION&&replay.scenario_version===definition.version:replay.rules_version===RULES_VERSION&&replay.version===definition.version&&replay.ruleset===definition.ruleset);
}
