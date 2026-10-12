import {writeRecoveryBundle,decodeRecovery} from './recoveryEncoding.js';
import {exportReplay} from '../sim/company/engine.js';
import {importVireAdapterReplay,VIRE_ADAPTER_VERSION,VIRE_ADAPTER_BASE_RULES_VERSION} from '../sim/company/vireIntegration.js';
export const VIRE_SAVE_KEY='platoon-vire-integration';
export const VIRE_SAVE_SCHEMA=1;
export function readVireRecovery(storage){
 const raw=storage.getItem(VIRE_SAVE_KEY);if(raw===null)return {raw:null,bundle:null,error:null};
 try{
  const bundle=JSON.parse(decodeRecovery(raw));
  if(bundle.schema!==VIRE_SAVE_SCHEMA||!bundle.latest?.replay||!bundle.turnStart?.replay)throw new Error('Unsupported vehicle save format.');
  for(const c of [bundle.latest,bundle.turnStart])if(c.replay.format!=='vire-integration'||c.replay.version!==VIRE_ADAPTER_VERSION||c.replay.base_rules_version!==VIRE_ADAPTER_BASE_RULES_VERSION)throw new Error('Incompatible vehicle rules; export the original save.');
  return {raw:decodeRecovery(raw),bundle,error:null};
 }catch(error){return {raw,bundle:null,error:error.message};}
}
export function vireCheckpoint(state,presentation={}){
 if(!state.vire_runtime)throw new Error('Vehicle recovery requires a vehicle mission.');
 return {replay:exportReplay(state),presentation:structuredClone(presentation),turn:state.turn,phase:state.phase,attempt:state.attempt_number};
}
export function resumeVireCheckpoint(saved){
 if(!saved?.replay)throw new Error('Missing vehicle checkpoint.');
 const state=importVireAdapterReplay(saved.replay);
 if(state.turn!==saved.turn||state.phase!==saved.phase||state.attempt_number!==saved.attempt)throw new Error('Vehicle checkpoint metadata does not match replay.');
 return {state,presentation:structuredClone(saved.presentation??{})};
}
export function saveVireRecovery(storage,state,presentation={},options={}){
 const previous=readVireRecovery(storage);
 if(previous.error&&!options.replace)throw new Error(previous.error);
 const latest=vireCheckpoint(state,presentation);
 if(previous.bundle&&!options.replace&&previous.bundle.latest.replay.initial_state.mission_instance_id!==state.mission_instance_id)throw new Error('A different vehicle mission occupies recovery; export it before replacement.');
 const changed=previous.bundle&&(previous.bundle.latest.turn!==state.turn||previous.bundle.latest.attempt!==state.attempt_number);
 const turnStart=options.turnStart??(options.replace||changed?latest:previous.bundle?.turnStart??latest);
 const bundle={schema:VIRE_SAVE_SCHEMA,latest,turnStart};
 writeRecoveryBundle(storage,VIRE_SAVE_KEY,bundle,options.replace?previous.raw:null);return bundle;
}
