import {it,expect} from 'vitest';
import {replaceSavedCampaign} from '../src/ui/campaignManagement.js';
import {PREPARATION_KEY,readCompanyPreparation} from '../src/sim/company/campaignPreparation.js';
import {CAMPAIGN_SAVE_KEY} from '../src/ui/campaignRecovery.js';
import {trevieres} from '../src/scenarios/trevieres.js';
const store=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
it('deletes corrupt campaign records and backups without changing standalone saves',()=>{
 const s=store();for(const key of [PREPARATION_KEY,PREPARATION_KEY+'-previous',CAMPAIGN_SAVE_KEY,CAMPAIGN_SAVE_KEY+'-previous'])s.setItem(key,'broken');
 s.setItem('platoon-company-recovery','standalone');s.setItem('platoon-active-vehicle-mission','normandy_6');
 replaceSavedCampaign(s);
 expect([...s.data]).toEqual([['platoon-company-recovery','standalone'],['platoon-active-vehicle-mission','normandy_6']]);
});
it('starts a fresh published company even when the previous campaign is active or corrupt',()=>{
 const s=store();s.setItem(PREPARATION_KEY,'broken');s.setItem(CAMPAIGN_SAVE_KEY,'old');
 replaceSavedCampaign(s,trevieres,'fresh');
 expect(readCompanyPreparation(s)).toMatchObject({id:'fresh',stage:'DEPLOYMENT',history:[]});
 expect(s.getItem(CAMPAIGN_SAVE_KEY)).toBeNull();
});
it('restores previous campaign records if fresh-company storage fails',()=>{
 const s=store();s.setItem(PREPARATION_KEY,'old');s.setItem(CAMPAIGN_SAVE_KEY,'tactical');const before=[...s.data];
 let fail=true;const bad={...s,setItem:(k,v)=>{if(fail){fail=false;throw new Error('quota');}s.setItem(k,v);}};
 expect(()=>replaceSavedCampaign(bad,trevieres,'fresh')).toThrow('quota');
 expect([...s.data]).toEqual(before);
});
