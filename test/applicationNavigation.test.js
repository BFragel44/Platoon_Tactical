import {it,expect} from 'vitest';
import {decodeRecovery} from '../src/ui/recoveryEncoding.js';
import {savedApplications,applicationMarkup,campaignResumeReason,recoveryKey} from '../src/ui/applicationNavigation.js';
import {missionCatalog} from '../src/scenarios/missions.js';
import {createMission,exportReplay} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {saveRecovery,SAVE_KEY,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {saveVireRecovery,resumeVireCheckpoint} from '../src/ui/vireRecovery.js';
import {saveTinchebrayRecovery,resumeTinchebrayCheckpoint} from '../src/ui/tinchebrayRecovery.js';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {newCompanyCampaign,saveCompanyPreparation,PREPARATION_KEY} from '../src/sim/company/campaignPreparation.js';
const storage=()=>{const data=new Map();return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
it('renders fresh Home without creating a company or tactical save',()=>{
 const store=storage(),saves=savedApplications(store,missionCatalog),html=applicationMarkup({screen:'home',catalog:missionCatalog,saves});
 expect(store.data.size).toBe(0);expect(saves.standalone).toEqual([]);expect(html).toContain('Start Normandy campaign');expect(html).toContain('Choose a mission');expect(html).not.toContain('data-return');expect(html).toContain('later connected launches remain gated');
});
it('lists actual mission names and dispatches all independent recovery slots without writing',()=>{
 const store=storage(),infantry=createMission(companyAssault,'navigation'),vire=createVireDevelopmentMission('navigation'),m7=createTinchebrayDevelopmentMission('navigation');
 saveRecovery(store,infantry,{showHistorical:true});saveVireRecovery(store,vire,{selectedVehicle:'sherman_hq'});saveTinchebrayRecovery(store,m7,{});
 const before=[...store.data],saves=savedApplications(store,missionCatalog);expect(saves.standalone.map(e=>e.id)).toEqual(['infantry','normandy_6','normandy_7']);
 for(const entry of saves.standalone){expect(entry.error).toBeFalsy();expect(entry.key).toBe(recoveryKey(entry.id));expect(entry.name).toBe(missionCatalog.find(s=>s.id===entry.saved.bundle.latest.replay.scenario).name);}
 expect(recoveryKey('campaign')).toBe('connected-'+SAVE_KEY);expect(()=>recoveryKey('unknown')).toThrow('Unknown');
 expect(resumeCheckpoint(companyAssault,saves.standalone[0].saved.bundle.latest).presentation.showHistorical).toBe(true);
 expect(exportReplay(resumeVireCheckpoint(saves.standalone[1].saved.bundle.latest).state)).toEqual(exportReplay(vire));expect(exportReplay(resumeTinchebrayCheckpoint(saves.standalone[2].saved.bundle.latest).state)).toEqual(exportReplay(m7));
 expect([...store.data]).toEqual(before);
});
it('retains corrupt and incompatible originals and disables resume',()=>{
 const store=storage();store.setItem(SAVE_KEY,'broken');let saves=savedApplications(store,missionCatalog);expect(saves.standalone[0].saved.raw).toBe('broken');expect(saves.standalone[0].error).toContain('Cannot read');
 saveRecovery(store,createMission(companyAssault,'old'),{},{replace:true});let bundle=JSON.parse(decodeRecovery(store.getItem(SAVE_KEY)));bundle.latest.replay.rules_version=1;store.setItem(SAVE_KEY,JSON.stringify(bundle));saves=savedApplications(store,missionCatalog);
 expect(saves.standalone[0].error).toContain('Incompatible');const html=applicationMarkup({screen:'home',catalog:missionCatalog,saves});expect(html).toMatch(/data-resume-save="infantry" disabled/);expect(html).toMatch(/data-export-save="infantry" >Export original save/);expect(store.getItem(SAVE_KEY+'-previous')).toBe('broken');
 bundle.latest.replay.rules_version=bundle.turnStart.replay.rules_version;bundle.turnStart.replay.seed='other-run';store.setItem(SAVE_KEY,JSON.stringify(bundle));expect(savedApplications(store,missionCatalog).standalone[0].error).toContain('different missions');
});
it('separates campaign company, its mission and standalone records, rejecting a mismatched company',()=>{
 const store=storage(),company=newCompanyCampaign(trevieres,'navigation-campaign');saveCompanyPreparation(store,company);
 const connected={getItem:key=>store.getItem('connected-'+key),setItem:(key,v)=>store.setItem('connected-'+key,v)};
 saveRecovery(connected,createMission(trevieres,'campaign',{}, {mission_instance_id:'navigation-mission',roster:company.roster}));
 const saves=savedApplications(store,missionCatalog);expect(saves.standalone).toEqual([]);expect(saves.campaign.error).toBeFalsy();expect(campaignResumeReason(company,saves.campaign.saved,trevieres)).toBeNull();
 expect(campaignResumeReason(null,saves.campaign.saved,trevieres)).toContain('different or unavailable');
 saveRecovery(store,createMission(companyAssault,'independent'));
 store.setItem(PREPARATION_KEY,'broken company');const broken=savedApplications(store,missionCatalog);expect(broken.companyRaw).toBe('broken company');expect(broken.companyError).toBeTruthy();expect(broken.campaign.error).toContain('different or unavailable');expect(broken.standalone[0].error).toBeFalsy();expect(resumeCheckpoint(companyAssault,broken.standalone[0].saved.bundle.latest).state.seed).toBe('independent');
});
it('navigation markup exposes explicit selection and return without tactical mutations',()=>{
 const store=storage(),saves=savedApplications(store,missionCatalog),html=applicationMarkup({screen:'missions',catalog:missionCatalog,saves,current:'Current mission'});
 expect(html).toContain('data-return');expect(html).toContain('id="restart" disabled');expect(html).toContain('id="preview-setup" disabled');expect(html).toContain('Saved standalone missions');expect(store.data.size).toBe(0);
});
