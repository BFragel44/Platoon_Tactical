import {readRecovery,SAVE_KEY} from './localRecovery.js';
import {campaignCheckpoint,resumeCampaignCheckpoint} from '../sim/company/campaignProgression.js';
import {writeRecoveryBundle} from './recoveryEncoding.js';
import {NORMANDY_SEQUENCE} from '../sim/company/campaignProgression.js';
import {replayMission} from '../sim/company/engine.js';
export const CAMPAIGN_SAVE_KEY='connected-'+SAVE_KEY;
export function readCampaignRecovery(storage){return readRecovery({getItem:key=>storage.getItem('connected-'+key)});}
// Recover only the known Assault-Team range correction, never arbitrary invalid orders.
export function recoverAssaultRangeCheckpoint(saved,error){
 const match=/^Replay operation (\d+) rejected: Resolve the currently displayed combat exposure once\.$/.exec(error?.message??'');
 const index=match?Number(match[1])-1:-1,record=saved?.replay;
 if(index<0||record?.operations?.[index]?.op!=='resolveCombat')throw error;
 const prefix={...saved,replay:{...record,operations:record.operations.slice(0,index)}};
 // Read the prefix through the regular validator; infer metadata only after deterministic replay.
 const definition=NORMANDY_SEQUENCE.find(d=>d.id===record.scenario);
 if(!definition||record.format)throw error;
 const state=replayMission(definition,prefix.replay);
 if(!Object.values(state.units).some(u=>u.cohesion==='A'&&u.out_of_ammo&&u.steps.length&&!u.removed))throw error;
 const checkpoint=campaignCheckpoint(state,{...saved.presentation,combatId:null,combatStage:'pre',reviewId:null,feedback:'Recovered before combat affected by the Assault Team range correction. The original save is backed up. Resolve the remaining combat again.'});
 resumeCampaignCheckpoint(checkpoint);
 return {state,checkpoint,removedOperations:record.operations.length-index};
}
export function saveCampaignRecovery(storage,state,presentation={},options={}){
 const previous=readCampaignRecovery(storage),latest=campaignCheckpoint(state,presentation);
 if(previous.error&&!options.replace)throw new Error(previous.error+' Export the original record.');
 if(previous.bundle&&!options.replace&&previous.bundle.latest.replay.mission_instance_id!==state.mission_instance_id)throw new Error('A different campaign deployment occupies tactical recovery.');
 const bundle={schema:1,latest,turnStart:options.turnStart??(options.replace?latest:previous.bundle?.turnStart??latest)};
 writeRecoveryBundle(storage,CAMPAIGN_SAVE_KEY,bundle,options.replace?previous.raw:null);return bundle;
}
