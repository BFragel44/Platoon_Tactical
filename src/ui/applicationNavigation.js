import {readRecovery,SAVE_KEY} from './localRecovery.js';
import {readVireRecovery,VIRE_SAVE_KEY} from './vireRecovery.js';
import {readTinchebrayRecovery,TINCHEBRAY_SAVE_KEY} from './tinchebrayRecovery.js';
import {readCompanyPreparation,PREPARATION_KEY} from '../sim/company/campaignPreparation.js';
import {RULES_VERSION} from '../sim/company/engine.js';
import {campaignReplayCompatible,NORMANDY_SEQUENCE} from '../sim/company/campaignProgression.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function recoveryKey(id){
 const key={infantry:SAVE_KEY,card_pull:'card-pull-'+SAVE_KEY,campaign:'connected-'+SAVE_KEY,normandy_6:VIRE_SAVE_KEY,normandy_7:TINCHEBRAY_SAVE_KEY}[id];
 if(!key)throw new Error('Unknown mission recovery slot.');
 return key;
}
export function campaignResumeReason(company,saved,scenario){
 const replay=saved?.bundle?.latest?.replay;
 if(saved?.error)return saved.error;
 if(!replay)return 'No campaign mission has been saved yet.';
 if(!company||(replay.roster_snapshot??replay.initial_state?.roster_snapshot)?.company_id!==company.roster.company_id)return 'Campaign save belongs to a different or unavailable company.';
 if(company.active_deployment&&replay.mission_instance_id!==company.active_deployment.mission_id)return 'Saved tactical mission differs from the committed deployment. Recover its committed start or export the original save.';
 if(!scenario||!campaignReplayCompatible(replay,scenario))return 'Incompatible campaign mission rules. Export the original save.';
 return null;
}
export function savedApplications(storage,catalog){
 const entries=[];
 if(catalog.some(e=>e.id==='normandy_1_card_pull')){
  const saved=readRecovery({getItem:k=>storage.getItem('card-pull-'+k)});
  if(saved.raw||saved.error){const replay=saved.bundle?.latest?.replay,definition=catalog.find(e=>e.id==='normandy_1_card_pull').scenario;
   const start=saved.bundle?.turnStart?.replay;
   const mismatch=['scenario','version','rules_version','ruleset','combat_resolver','mission_instance_id','seed'].some(k=>start?.[k]!==replay?.[k]);
   const error=saved.error||(mismatch||replay?.scenario!==definition.id||replay?.version!==definition.version||replay?.rules_version!==RULES_VERSION||replay?.ruleset!==definition.ruleset||replay?.combat_resolver!==definition.rules.combatResolver?'Incompatible card-pull comparison. Export its original record.':null);
   entries.push({id:'card_pull',key:recoveryKey('card_pull'),saved,name:definition.name,error,turn:saved.bundle?.latest.turn,phase:saved.bundle?.latest.phase});
  }
 }
 for(const [id,key,read,label] of [['infantry',SAVE_KEY,readRecovery,'Infantry mission save'],['normandy_6',VIRE_SAVE_KEY,readVireRecovery,'Vire save'],['normandy_7',TINCHEBRAY_SAVE_KEY,readTinchebrayRecovery,'Tinchebray save'],['campaign','connected-'+SAVE_KEY,s=>readRecovery({getItem:k=>s.getItem('connected-'+k)}),'Campaign M1 save']]){
  let saved;try{saved=read(storage);}catch(e){saved={raw:null,error:e.message};}
  if(!saved.raw&&!saved.error)continue;
  const replay=saved.bundle?.latest?.replay,scenarioId=replay?.scenario,entry=catalog.find(e=>e.id===scenarioId);
  let error=saved.error;
  if(!error&&(!entry||entry.unavailable))error=entry?.unavailable??'Unrecognized mission.';
  if(!error&&id==='infantry'&&(replay.rules_version!==RULES_VERSION||replay.version!==entry.scenario.version||replay.ruleset!==entry.scenario.ruleset))error='Incompatible mission rules. Export the original record.';
  if(!error&&id==='campaign'&&(!NORMANDY_SEQUENCE.some(s=>s.id===scenarioId)||!campaignReplayCompatible(replay,entry.scenario)))error='Incompatible campaign mission. Export the original record.';
  if(!error&&id.startsWith('normandy_')&&scenarioId!==id)error='Saved mission does not match this slot.';
  if(!error){
   const start=saved.bundle.turnStart.replay;
   const identityKeys=['scenario','ruleset','rules_version','version','base_rules_version','scenario_version','format','mission_instance_id','seed'];
   const company=r=>(r.roster_snapshot??r.initial_state?.roster_snapshot)?.company_id;
   if(identityKeys.some(key=>replay[key]!==start[key])||company(replay)!==company(start))error='Recovery checkpoints belong to different missions or versions. Export the original record.';
  }
  entries.push({id,key,saved,name:entry?.name??label,error,turn:saved.bundle?.latest?.turn,phase:saved.bundle?.latest?.phase});
 }
 let company=null,companyError='';try{company=readCompanyPreparation(storage);}catch(e){companyError=e.message;}
 const campaign=entries.find(e=>e.id==='campaign');
 if(campaign&&!campaign.error)campaign.error=campaignResumeReason(company,campaign.saved,catalog.find(e=>e.id===campaign.saved.bundle.latest.replay.scenario)?.scenario);
 let companyRaw=null;try{companyRaw=storage.getItem(PREPARATION_KEY);}catch(e){companyError=e.message;}
 return {standalone:entries.filter(e=>e.id!=='campaign'),campaign,company,companyError,companyRaw};
}
const savedMarkup=entries=>entries.length?`<ul class="saved-runs">${entries.map(e=>`<li><b>${esc(e.name)}</b>${e.turn?` · Turn ${e.turn}`:''}${e.error?`<p role="status">${esc(e.error)}</p>`:''}<div><button data-resume-save="${e.id}" ${e.error?'disabled':''}>Resume ${esc(e.name)}</button><button data-export-save="${e.id}" ${!e.saved.raw?'disabled':''}>Export original save</button></div></li>`).join('')}</ul>`:'<p>No saved missions.</p>';
export function applicationMarkup({screen,catalog,saves,current,selectedMission='',seed='company-1',error='',connectedCandidate=false}){
 const nav=`<nav aria-label="Application navigation"><button data-screen="home">Home</button><button data-screen="missions">Missions</button><button data-campaign>Campaign</button>${current?'<button data-return>Return to current mission</button>':''}</nav>`;
 const campaignResume=saves.company?.stage==='PREPARATION'?'Resume preparation':saves.company?.stage==='PREPARED'?'Review prepared company':saves.company?'Continue campaign company':'Start Normandy campaign';
 const resumableStandalones=saves.standalone.filter(entry=>!entry.error);
 const content=screen==='home'?`<h1>Platoon Tactical</h1><p>Command your company through uncertain battlefields.</p><div class="application-cards"><section><h2>Campaign</h2><p>A fresh Normandy company, persistent people and guided between-mission preparation. ${connectedCandidate?'Connected Standard campaign development candidate: ordered missions and same-company battlefield carryover.':'Campaign play currently includes M1 and its preparation; later connected launches remain gated.'}</p><button data-campaign>${campaignResume}</button>${saves.campaign?savedMarkup([saves.campaign]):''}${saves.companyError?`<p role="status">${esc(saves.companyError)}</p>`:''}${(saves.companyRaw||saves.campaign)?'<button data-export-company>Export campaign record</button><button data-new-campaign>Start new campaign</button><button data-delete-campaign>Delete saved campaign</button>':''}</section><section><h2>Missions</h2><p>Play individual missions with separate standalone companies. Company Assault, Keep Up the Fire and all seven Normandy missions are available here.</p><button data-screen="missions">Choose a mission</button>${resumableStandalones.length?savedMarkup(resumableStandalones):''}</section></div>`:
 `<h1>Missions</h1><p>Standalone runs. Starting one does not advance or import a campaign company.</p><div class="application-mission-setup"><label>Mission<select id="mission-select" aria-label="Mission"><option value="" ${!selectedMission?'selected':''}>Choose a mission</option>${catalog.map(e=>`<option value="${esc(e.id)}" ${selectedMission===e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select></label><label>Replay seed<input aria-label="Replay seed" id="seed" value="${esc(seed)}"></label><p id="mission-availability" role="status"></p><button id="preview-setup" disabled>Preview setup</button><button id="restart" disabled>Start mission</button></div><h2>Saved standalone missions</h2>${savedMarkup(saves.standalone)}`;
 return `<div class="application-screen">${nav}${error?`<p role="alert">${esc(error)}</p>`:''}${content}</div>`;
}
