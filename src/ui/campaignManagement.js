import {PREPARATION_KEY,newCompanyCampaign,saveCompanyPreparation} from '../sim/company/campaignPreparation.js';
import {CAMPAIGN_SAVE_KEY} from './campaignRecovery.js';

// Only connected campaign records belong to this action. Standalone saves stay separate.
export function replaceSavedCampaign(storage,scenario=null,id=null){
 const keys=[PREPARATION_KEY,PREPARATION_KEY+'-previous',CAMPAIGN_SAVE_KEY,CAMPAIGN_SAVE_KEY+'-previous'];
 const marker='platoon-active-vehicle-mission';
 if(storage.getItem(marker)==='campaign_m1')keys.push(marker);
 const previous=keys.map(key=>[key,storage.getItem(key)]);
 try{
  for(const key of keys)storage.removeItem(key);
  if(scenario)return saveCompanyPreparation(storage,newCompanyCampaign(scenario,id));
  return null;
 }catch(error){
  for(const [key,value] of previous){if(value===null)storage.removeItem(key);else storage.setItem(key,value);}
  throw error;
 }
}
