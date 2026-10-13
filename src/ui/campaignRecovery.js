import {readRecovery,SAVE_KEY} from './localRecovery.js';
import {campaignCheckpoint} from '../sim/company/campaignProgression.js';
import {writeRecoveryBundle} from './recoveryEncoding.js';
export const CAMPAIGN_SAVE_KEY='connected-'+SAVE_KEY;
export function readCampaignRecovery(storage){return readRecovery({getItem:key=>storage.getItem('connected-'+key)});}
export function saveCampaignRecovery(storage,state,presentation={},options={}){
 const previous=readCampaignRecovery(storage),latest=campaignCheckpoint(state,presentation);
 if(previous.error&&!options.replace)throw new Error(previous.error+' Export the original record.');
 if(previous.bundle&&!options.replace&&previous.bundle.latest.replay.mission_instance_id!==state.mission_instance_id)throw new Error('A different campaign deployment occupies tactical recovery.');
 const bundle={schema:1,latest,turnStart:options.turnStart??(options.replace?latest:previous.bundle?.turnStart??latest)};
 writeRecoveryBundle(storage,CAMPAIGN_SAVE_KEY,bundle,options.replace?previous.raw:null);return bundle;
}
