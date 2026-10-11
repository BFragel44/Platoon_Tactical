import {exportReplay} from '../sim/company/engine.js';
import {importVireAdapterReplay,TINCHEBRAY_ADAPTER_VERSION,VIRE_ADAPTER_BASE_RULES_VERSION} from '../sim/company/vireIntegration.js';
export const TINCHEBRAY_SAVE_KEY='platoon-tinchebray-integration';
export const TINCHEBRAY_SAVE_SCHEMA=1;
export function readTinchebrayRecovery(storage){
 const raw=storage.getItem(TINCHEBRAY_SAVE_KEY);if(raw===null)return {raw:null,bundle:null,error:null};
 try{
  const bundle=JSON.parse(raw);
  if(bundle.schema!==TINCHEBRAY_SAVE_SCHEMA||!bundle.latest?.replay||!bundle.turnStart?.replay)throw new Error('Unsupported vehicle save format.');
  for(const c of [bundle.latest,bundle.turnStart])if(c.replay.format!=='tinchebray-integration'||c.replay.version!==TINCHEBRAY_ADAPTER_VERSION||c.replay.base_rules_version!==VIRE_ADAPTER_BASE_RULES_VERSION)throw new Error('Incompatible vehicle rules; export the original save.');
  return {raw,bundle,error:null};
 }catch(error){return {raw,bundle:null,error:error.message};}
}
export function tinchebrayCheckpoint(state,presentation={}){
 if(!state.vire_runtime||state.scenario_id!=='normandy_7'||!state.mission_rules.tinchebray)throw new Error('Tinchebray recovery requires an M7 mission.');
 return {replay:exportReplay(state),presentation:structuredClone(presentation),turn:state.turn,phase:state.phase,attempt:state.attempt_number};
}
export function resumeTinchebrayCheckpoint(saved){
 if(!saved?.replay)throw new Error('Missing vehicle checkpoint.');
 if(saved.replay.format!=='tinchebray-integration'||saved.replay.scenario!=='normandy_7')throw new Error('Only a Tinchebray checkpoint can enter M7 recovery.');
 const state=importVireAdapterReplay(saved.replay);
 if(state.turn!==saved.turn||state.phase!==saved.phase||state.attempt_number!==saved.attempt)throw new Error('Vehicle checkpoint metadata does not match replay.');
 return {state,presentation:structuredClone(saved.presentation??{})};
}
export function saveTinchebrayRecovery(storage,state,presentation={},options={}){
 const previous=readTinchebrayRecovery(storage);
 if(previous.error&&!options.replace)throw new Error(previous.error);
 const latest=tinchebrayCheckpoint(state,presentation);
 if(previous.bundle&&!options.replace&&previous.bundle.latest.replay.initial_state.mission_instance_id!==state.mission_instance_id)throw new Error('A different vehicle mission occupies recovery; export it before replacement.');
 const changed=previous.bundle&&(previous.bundle.latest.turn!==state.turn||previous.bundle.latest.attempt!==state.attempt_number);
 const turnStart=options.turnStart??(options.replace||changed?latest:previous.bundle?.turnStart??latest);
 const bundle={schema:TINCHEBRAY_SAVE_SCHEMA,latest,turnStart};
 if(options.replace&&previous.raw!==null)storage.setItem(`${TINCHEBRAY_SAVE_KEY}-previous`,previous.raw);
 storage.setItem(TINCHEBRAY_SAVE_KEY,JSON.stringify(bundle));return bundle;
}
