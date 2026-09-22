import {exportReplay,replayMission} from '../sim/company/engine.js';

export const SAVE_KEY='platoon-company-recovery';
export const SAVE_SCHEMA=1;
export function checkpoint(state,presentation={},now=new Date().toISOString()) {
  return {replay:exportReplay(state),presentation:structuredClone(presentation),turn:state.turn,phase:state.phase,timestamp:now};
}
export function readRecovery(storage) {
  const raw=storage.getItem(SAVE_KEY);
  if(raw===null)return {raw:null,bundle:null,error:null};
  try {
    const bundle=JSON.parse(raw);
    if(bundle.schema!==SAVE_SCHEMA||!bundle.latest?.replay||!bundle.turnStart?.replay)throw new Error('Unrecognized save format.');
    return {raw,bundle,error:null};
  } catch(error) {return {raw,bundle:null,error:`Cannot read saved mission: ${error.message}`};}
}
export function resumeCheckpoint(scenario,saved) {
  if(!saved?.replay)throw new Error('Missing replay in saved mission.');
  const state=replayMission(scenario,saved.replay);
  if(state.turn!==saved.turn||state.phase!==saved.phase)throw new Error('Saved turn/segment does not match its replay.');
  return {state,presentation:structuredClone(saved.presentation??{})};
}
// One atomic setItem contains both checkpoints. A failed write leaves the previous bundle intact.
export function saveRecovery(storage,state,presentation={},options={}) {
  const previous=readRecovery(storage),latest=checkpoint(state,presentation,options.now);
  if(previous.error&&!options.replace)throw new Error(previous.error+' Export it or explicitly start a new mission.');
  const turnStart=options.turnStart??(options.replace?latest:previous.bundle?.turnStart??latest);
  const bundle={schema:SAVE_SCHEMA,latest,turnStart};
  // Preserve the prior raw record before an explicit replacement, including corrupt/incompatible saves.
  if(options.replace&&previous.raw!==null)storage.setItem(`${SAVE_KEY}-previous`,previous.raw);
  storage.setItem(SAVE_KEY,JSON.stringify(bundle));
  return bundle;
}
