import {phoneWireMarkup,phoneConnectionLosses,createPhoneNotifications} from './phonePresentation.js';
import {arrivalCoverMarkup} from './arrivalCover.js';
import {afterActionMarkup} from './tacticalClarity.js';
import {clearAarNavigation,startingFormation} from './commandDesk.js';
import {campaignProgress,previewCampaignMission,commitCampaignMission,resumeCommittedCampaign,resumeCampaignCheckpoint,campaignCheckpoint} from '../sim/company/campaignProgression.js';
import {saveCampaignRecovery,readCampaignRecovery,recoverAssaultRangeCheckpoint} from './campaignRecovery.js';
import {replaceSavedCampaign} from './campaignManagement.js';
import {experienceAwards,freshExperienceAwards,createExperienceNotifications} from './experienceNotifications.js';
import {cardDrawIdentity,createCardDrawNotifications,publicDrawGroups,recentDrawMarkup} from './cardDraws.js';
import './cardDraws.css';
import {mapBoundaryLayout} from './mapBoundaries.js';
import {casualtyEvacuationStatus} from './casualtyPresentation.js';
import {supportCallPreview,friendlyTargetLabel,supportWarning,battalionChoiceReason} from './supportPresentation.js';
import {applicationMarkup,savedApplications,recoveryKey} from './applicationNavigation.js';
import {capturePresentationDraft,restorePresentationDraft} from './presentationDraft.js';
import {contactAdvanceLabel,commandRecoveryHint,formationInspectionReason} from './phaseGuidance.js';
import {decodeRecovery} from './recoveryEncoding.js';
import {readCompanyPreparation} from '../sim/company/campaignPreparation.js';
import {openCompanyPreparation} from './campaignPreparation.js';
import {trevieres} from '../scenarios/trevieres.js';
import {submitVehicleInteraction,withVehicleHQActivationTargets,companyVehicleActivationOperation} from './vehicleInteraction.js';
import {vire as vireScenario} from '../scenarios/vire.js';
import {tinchebray} from '../scenarios/tinchebray.js';
import {previewTinchebraySetup} from '../sim/company/tinchebraySetup.js';
import {createTinchebrayDevelopmentMission,createTinchebrayMissionRoster} from '../sim/company/tinchebrayMission.js';
import {saveTinchebrayRecovery,resumeTinchebrayCheckpoint,readTinchebrayRecovery,TINCHEBRAY_SAVE_KEY} from './tinchebrayRecovery.js';
import {previewVireSetup as originalPreviewVireSetup} from '../sim/company/vireSetup.js';
import {vehicleCounters} from './virePresentation.js';
import {createVireDevelopmentMission as originalCreateVireDevelopmentMission,createVireRoster as originalCreateVireRoster} from '../sim/company/vireMission.js';
import {saveVireRecovery as originalSaveVireRecovery,resumeVireCheckpoint as originalResumeVireCheckpoint,readVireRecovery as originalReadVireRecovery,VIRE_SAVE_KEY as ORIGINAL_VIRE_SAVE_KEY} from './vireRecovery.js';
import {hill192DeploymentDefinition} from '../sim/company/hill192Setup.js';
import {exportScoutedBattlefield,saveBattlefield} from '../sim/company/battlefieldCarryover.js';
import {drawCommandLinks,commandLegend} from './commandPanel.js';
import {hqEventExplanation} from './hqEventPresentation.js';
import {formationGrid,bindUnitTooltips} from './formationGrid.js';
import {terrainMarkers} from './terrainMarkers.js';
import {resolveDisplayedExchange,resolveNextDisplayedExchange} from './combatExchange.js';
import {combatScreen} from './combatScreen.js';
import {terrainInformation,terrainFooter,hillStack,coverPositions,formationCover} from './terrainPresentation.js';
import {coverLabel,movingFormationIds,tacticalText,movementSpace} from './battlefieldPresentation.js';
import {openSpottingMenu} from './spottingMenu.js';
import {segmentReviews,segmentResultMarkup,previousSegment,currentAttemptEvents} from './segmentResults.js';
import {openMissionSetup} from './missionSetup.js';
import {openReattemptSetup,openPatrolSetup} from './reattemptSetup.js';
import {missionCatalog,missionById,playableMissionById} from '../scenarios/missions.js';
import {commandHeader,bindCommandHeader} from './commandHeader.js';
import {terrainBorders} from './terrainBorders.js';
import {movementFireWarning,markerSummary,finalFireMessage} from './firePresentation.js';
import '../style.css';
import './company.css';
import './workspace.css';
import './combatOverlay.css';
import {normalizeCamera,mapControls,bindMapViewport,mapPoint} from './mapViewport.js';
import {formationCounter,inlineInventory,formationLabel} from './unitDetails.js';
import { createMission, resolveSupportChoice,submitCommand, advancePhase, resolveCombat, abortMission, endTurn, getPlayerView, getVisibleEvents, getAfterActionReport, selectHQ, exportReplay,declineReattempt } from '../sim/index.js';
import {createCampaignRoster,readCampaign,saveCampaign,startStandaloneRoster,debriefAndSave} from '../sim/company/campaignRoster.js';
import { companyAssault } from '../scenarios/companyAssault.js';
import {readRecovery,saveRecovery,resumeCheckpoint,checkpoint,SAVE_KEY} from './localRecovery.js';
import {fireMarkers,pdfDirections,pdfPaths,fireExplanation} from './fireMarkers.js';
import {selectedOrder,completeCombatStage,availableOrderMenu,unavailableOrderReference,retainedGeneralIssuer,unavailableTargetReference,orderConsequences,formationSelectionOptions,groupMovementExclusions} from './orderPresentation.js';
import {turnNoticeMarkup} from './turnNotice.js';
import {signalEffectLabel} from './signalPresentation.js';
import { PHASES,previewMissionSetup } from '../sim/company/engine.js';
import {vireControls,bindVireControls,integrateVehicleControls} from './vireControls.js';
import {applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay} from '../sim/company/vireIntegration.js';

const app=document.querySelector('#app');
const urlChoices=new URLSearchParams(location.search);
// The legacy campaignDev URL remains valid; connected Standard play is public.
const connectedCandidate=true;
const directDevelopment=['normandyDev','cerisyDev','stGeorgesDev','hill192Dev','stGermainDev','vireDev','tinchebrayDev'].some(key=>urlChoices.get(key)==='1');
let tinchebrayDevelopment=urlChoices.get('tinchebrayDev')==='1';
const vireDevelopment=tinchebrayDevelopment||urlChoices.get('vireDev')==='1';
let vire=tinchebrayDevelopment?tinchebray:vireScenario;
let previewVireSetup=tinchebrayDevelopment?previewTinchebraySetup:originalPreviewVireSetup;
let createVireDevelopmentMission=tinchebrayDevelopment?createTinchebrayDevelopmentMission:originalCreateVireDevelopmentMission;
let createVireRoster=tinchebrayDevelopment?createTinchebrayMissionRoster:originalCreateVireRoster;
let saveVireRecovery=tinchebrayDevelopment?saveTinchebrayRecovery:originalSaveVireRecovery;
let resumeVireCheckpoint=tinchebrayDevelopment?resumeTinchebrayCheckpoint:originalResumeVireCheckpoint;
let readVireRecovery=tinchebrayDevelopment?readTinchebrayRecovery:originalReadVireRecovery;
let VIRE_SAVE_KEY=tinchebrayDevelopment?TINCHEBRAY_SAVE_KEY:ORIGINAL_VIRE_SAVE_KEY;
function selectVehicleMission(definition){
 tinchebrayDevelopment=definition.id===tinchebray.id;vire=definition;
 previewVireSetup=tinchebrayDevelopment?previewTinchebraySetup:originalPreviewVireSetup;
 createVireDevelopmentMission=tinchebrayDevelopment?createTinchebrayDevelopmentMission:originalCreateVireDevelopmentMission;
 createVireRoster=tinchebrayDevelopment?createTinchebrayMissionRoster:originalCreateVireRoster;
 saveVireRecovery=tinchebrayDevelopment?saveTinchebrayRecovery:originalSaveVireRecovery;
 resumeVireCheckpoint=tinchebrayDevelopment?resumeTinchebrayCheckpoint:originalResumeVireCheckpoint;
 readVireRecovery=tinchebrayDevelopment?readTinchebrayRecovery:originalReadVireRecovery;
 VIRE_SAVE_KEY=tinchebrayDevelopment?TINCHEBRAY_SAVE_KEY:ORIGINAL_VIRE_SAVE_KEY;
}
let vehicleBoot=null,vehicleBootError='';
if(vireDevelopment)try{const saved=readVireRecovery(localStorage);if(saved.error)vehicleBootError=saved.error;else if(saved.bundle){const restored=resumeVireCheckpoint(saved.bundle.latest);if(restored.state.scenario_id!==vire.id)throw new Error('Saved vehicle integration is not a Vire mission.');vehicleBoot=restored;}}catch(e){vehicleBootError=e.message;}
let seed=vehicleBoot?.state.seed??'company-1',mission=vehicleBoot?.state??(vehicleBootError?null:vireDevelopment?createVireDevelopmentMission(seed):directDevelopment?createMission(companyAssault,seed):null),selected=null,action='ACTIVATE',target='',generalIssuer='co',contributors=[];
let currentSlot=vireDevelopment?vire.id:'infantry';
let screen=directDevelopment&&mission?'tactical':'home',launcherMission='',navigationError='',tacticalDraft=null;
let combatId=null,combatStage='pre',combatOpen=true,contactAcknowledged=null;
let recoveryResult=null,reviewId=null,turnNotice=false;
let commandLinks=false,focusStartingForce=false,recapDialogs=true,showHistorical=false;
let selectedVehicle=null,vehicleRoute=[];
let selectedPdf=null,cleanupMap=null,camera=normalizeCamera(),ordersScroll=0,ordersSaveTimer=null;
let recovery={raw:null,bundle:null,error:null},storageError='',recoveryPending=false,turnStart=mission?checkpoint(mission):null;
const experienceNotifications=createExperienceNotifications();let experienceMission=null,experienceSeen=[];
const cardDrawNotifications=createCardDrawNotifications();
const phoneNotifications=createPhoneNotifications();
const drawIdentity=()=>cardDrawIdentity(mission);
try{if(!vireDevelopment){recovery=readRecovery(localStorage);recoveryPending=recovery.raw!==null;}}catch(e){storageError=`Local storage unavailable: ${e.message}. Export replays manually.`;}
const presentation=()=>({experienceSeen,showHistorical,tacticalDraft,recapDialogs,commandLinks,camera,ordersScroll,selectedVehicle,vehicleRoute,selected,action,target,generalIssuer,contributors,selectedPdf,combatId,combatStage,combatOpen,contactAcknowledged,recoveryResult,reviewId,turnNotice,feedback,feedbackKind});
function persist(previous=null,replace=false){
 if(!mission)return;
 if(replace)phoneNotifications.reset();
 if(previous&&!replace){
  const losses=phoneConnectionLosses(getPlayerView(previous),getPlayerView(mission));
  const cuts=getVisibleEvents(mission).filter(e=>e.sequence>previous.events.length&&e.type==='PHONE_LINE_CUT').map(e=>mission.locations[e.location]?.name).filter(Boolean);
  phoneNotifications.push(losses,cuts);
 }
 const identity=mission.mission_instance_id??`${mission.scenario_id}:${mission.seed}`;
 if(experienceMission!==identity){experienceMission=identity;experienceSeen=[];experienceNotifications.reset();}
 const awards=experienceAwards(getPlayerView(mission),getVisibleEvents(mission));
 experienceNotifications.push(freshExperienceAwards(awards,experienceSeen));experienceSeen=awards.map(a=>a.id);
 if(currentSlot==='card_pull'){
  if(mission.status==='ACTIVE'&&(replace||previous&&(mission.turn!==previous.turn||mission.attempt_number!==previous.attempt_number)))turnNotice=true;
  const storage={getItem:k=>localStorage.getItem('card-pull-'+k),setItem:(k,v)=>localStorage.setItem('card-pull-'+k,v),removeItem:k=>localStorage.removeItem('card-pull-'+k)};
  try{if(replace||previous&&(mission.turn!==previous.turn||mission.attempt_number!==previous.attempt_number))turnStart=checkpoint(mission,presentation());saveRecovery(storage,mission,presentation(),{turnStart,replace});recovery=readRecovery(storage);storageError='';recoveryPending=false;}catch(error){storageError=error.message;}return;
 }
  if(mission.status==='ACTIVE'&&(replace||previous&&(mission.turn!==previous.turn||mission.attempt_number!==previous.attempt_number)))turnNotice=true;
  if(replace||previous&&(mission.turn!==previous.turn||mission.attempt_number!==previous.attempt_number))turnStart=campaignCheckpoint(mission,presentation());
 if(currentSlot==='campaign'){
  try{const connected=readCompanyPreparation(localStorage);if(!connected||connected.roster.company_id!==mission.roster_snapshot?.company_id)throw new Error('The campaign company no longer matches this mission. Export the current replay before starting a different company.');const storage={getItem:key=>localStorage.getItem('connected-'+key),setItem:(key,value)=>localStorage.setItem('connected-'+key,value)};saveCampaignRecovery(localStorage,mission,presentation(),{turnStart,replace});localStorage.setItem('platoon-active-vehicle-mission','campaign_m1');recovery=readRecovery(storage);storageError='';}catch(e){storageError=e.message;}return;
 }

  if(mission.vire_runtime){try{selectVehicleMission(missionById(mission.scenario_id));saveVireRecovery(localStorage,mission,presentation(),{replace});localStorage.setItem('platoon-active-vehicle-mission',mission.scenario_id);recovery=readVireRecovery(localStorage);storageError='';}catch(e){storageError=`Vehicle integration save failed: ${e.message}`;}return;}
  if(recoveryPending&&!replace)return;
  try{saveRecovery(localStorage,mission,presentation(),{turnStart,replace});recovery=readRecovery(localStorage);storageError='';recoveryPending=false;}
  catch(e){storageError=`Save failed: ${e.message} Manual replay export remains available.`;}
}
function draftContext(){return mission?JSON.stringify([mission.mission_instance_id??mission.seed,mission.scenario_id,mission.attempt_number,mission.turn,mission.phase,mission.replay.length,mission.vire_runtime?.operations.length??0,selected,action,selectedVehicle]):'';}
function restorePresentation(p={}){
 clearAarNavigation();
 cardDrawNotifications.prime(drawIdentity(),mission?getVisibleEvents(mission):[]);
 phoneNotifications.reset();experienceNotifications.reset();experienceMission=mission?(mission.mission_instance_id??`${mission.scenario_id}:${mission.seed}`):null;
 // A restored checkpoint is history, not a new XP award; this also supports older presentation records.
 experienceSeen=(mission?.achievements??[]).map(a=>a.key);
 showHistorical=p.showHistorical===true;tacticalDraft=p.tacticalDraft??null;commandLinks=p.commandLinks===true;recapDialogs=p.recapDialogs!==false;camera=normalizeCamera(p.camera);ordersScroll=Number.isFinite(p.ordersScroll)?Math.max(0,p.ordersScroll):0;selected=p.selected??null;selectedVehicle=p.selectedVehicle??null;vehicleRoute=p.vehicleRoute??[];action=p.action??'MOVE';target=p.target??'';generalIssuer=p.generalIssuer??'co';contributors=p.contributors??[];selectedPdf=p.selectedPdf??null;combatId=p.combatId??null;combatStage=completeCombatStage(p.combatStage??'pre');combatOpen=p.combatOpen??true;contactAcknowledged=p.contactAcknowledged??null;turnNotice=p.turnNotice??false;reviewId=p.reviewId??null;recoveryResult=p.recoveryResult??null;feedback=p.feedback??'Saved mission restored.';feedbackKind='Recovery';
}
function currentSaveId(){return currentSlot;}
function restoreSavedEntry(entry,which='latest'){
 if(!entry||entry.error||!entry.saved.bundle)throw new Error(entry?.error??'No readable saved mission.');
 const record=entry.saved.bundle[which];
 const restored=entry.id==='campaign'?resumeCampaignCheckpoint(record):entry.id==='normandy_6'?originalResumeVireCheckpoint(record):entry.id==='normandy_7'?resumeTinchebrayCheckpoint(record):resumeCheckpoint(playableMissionById(record?.replay?.scenario),record);
 // All validation happens before touching the current tactical session.
 mission=restored.state;currentSlot=entry.id;seed=mission.seed;screen='tactical';navigationError='';storageError='';recovery=entry.saved;turnStart=entry.saved.bundle.turnStart;recoveryPending=false;
 if(mission.vire_runtime)selectVehicleMission(missionById(mission.scenario_id));
 restorePresentation(restored.presentation);render();
}
function resumeSlot(id,which='latest'){
 try{const saves=savedApplications(localStorage,missionCatalog),entry=id==='campaign'?saves.campaign:saves.standalone.find(e=>e.id===id);
  try{restoreSavedEntry(entry,which);}catch(error){
   if(id!=='campaign'||which!=='latest'||!entry?.saved?.bundle)throw error;
   const recovered=recoverAssaultRangeCheckpoint(entry.saved.bundle.latest,error);
   resumeCampaignCheckpoint(entry.saved.bundle.turnStart);
   // Preserve the original in backup before committing the validated recovery.
   const bundle=saveCampaignRecovery(localStorage,recovered.state,recovered.checkpoint.presentation,{replace:true,turnStart:entry.saved.bundle.turnStart});
   restoreSavedEntry({...entry,saved:{...entry.saved,bundle}},'latest');
  }
 }
 catch(e){navigationError=e.message+' The original save is unchanged.';storageError=navigationError;render();}
}
function resume(which){try{resumeSlot(currentSaveId(),which);}catch(e){storageError=e.message;render();}}
function showScreen(next){
 if(screen==='tactical'&&mission){tacticalDraft=capturePresentationDraft(app,draftContext());persist();}
 screen=next;navigationError='';render();
}
let cleanupTooltips=null,cleanupHeader=null,feedbackKind='Status';
let feedback='Advance through the opening segments to Company HQ’s activation impulse.';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const stateText=u=>`${u.transport?.steps??u.steps} step${(u.transport?.steps??u.steps)===1?'':'s'} · ${u.pinned?'PINNED · ':''}${({GOOD:u.pinned?'Original side':['HQ','STAFF'].includes(u.kind)?'Command side · no basic fire':u.kind==='FO'?'Observer side · no basic fire':'Good order',P:'Paralyzed',L:'Litter team',F:['HQ','STAFF'].includes(u.kind)?'Named Fire Team · command side unavailable':u.kind==='FO'?'Named Fire Team · observer capability unavailable':'Fire team',A:'Assault team'})[u.cohesion]??u.cohesion}${u.exposed?' · Exposed':''}`;
const active=u=>u.steps&&!u.removed;
function download(name,value){if(typeof value==='string'){try{value=decodeRecovery(value);}catch{/* Corrupt originals must remain exportable. */}}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function drawFirePaths(view){
  const layer=app.querySelector('.map-layer'),svg=app.querySelector('#fire-overlay');if(!layer||!svg)return;
  const frame=layer.getBoundingClientRect();svg.setAttribute('width',layer.scrollWidth);svg.setAttribute('height',layer.scrollHeight);svg.setAttribute('viewBox',`0 0 ${layer.scrollWidth} ${layer.scrollHeight}`);
  drawCommandLinks(app,view,{enabled:commandLinks,selected,zoom:camera.zoom,mapPoint});
  const paths=pdfPaths(view);svg.innerHTML='<defs><marker id="pdf-arrow-friendly" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#93d6a3"/></marker><marker id="pdf-arrow-enemy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#f27c77"/></marker><marker id="pdf-arrow-unknown" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#f4cd75"/></marker></defs>'+paths.map(path=>{
    const cards=path.cards.map(id=>layer.querySelector(`[data-location="${id}"]`));if(cards.some(card=>!card))return '';
    const points=cards.map(card=>{const box=card.getBoundingClientRect();return mapPoint(box,frame,camera.zoom).join(',');}).join(' ');
    return `<polyline class="${path.side} ${selectedPdf===path.id?'selected':''}" points="${points}" marker-end="url(#pdf-arrow-${path.side})" aria-label="${esc(path.label)}"/>`;
  }).join('');
}
let launcherSeed=seed;
function openVehicleSetup(definition,nextSeed){
 const m7=definition.id===tinchebray.id,preview=m7?previewTinchebraySetup:originalPreviewVireSetup,factory=m7?createTinchebrayDevelopmentMission:originalCreateVireDevelopmentMission,roster=m7?createTinchebrayMissionRoster:originalCreateVireRoster;
 return openMissionSetup(app,definition,nextSeed,setup=>{
  const {vehicle_positions,jeep,...infantry}=setup;
  const next=factory(nextSeed,infantry,vehicle_positions,{jeep});
  startStandaloneRoster(localStorage,roster(),definition.rules.rosterKey);
  clearAarNavigation();mission=next;currentSlot=definition.id;seed=nextSeed;screen='tactical';tacticalDraft=null;vehicleRoute=[];selectVehicleMission(definition);recoveryPending=false;focusStartingForce=true;commandLinks=false;camera=normalizeCamera();ordersScroll=0;combatId=null;combatStage='pre';combatOpen=true;contactAcknowledged=null;selectedVehicle=null;selected='co';action='ACTIVATE';target='';contributors=[];selectedPdf=null;recoveryResult=null;reviewId=null;persist(null,true);render();
 },{preview:(_definition,nextSeed,setup={})=>{const {vehicle_positions,jeep,...infantry}=setup;return {...preview(nextSeed,infantry,vehicle_positions,jeep),playable:true};}});
}
function startMission(definition,nextSeed,setup={}){
    definition=hill192DeploymentDefinition(definition,setup);
    let campaign=null,deployment=null;
    if(definition.rules?.missionIdentity){
      const saved=readCampaign(localStorage,definition.rules.rosterKey);if(saved.error)throw new Error(saved.error);
      campaign=definition.rules.standaloneRoster?createCampaignRoster(`${definition.rules.baselineCompanyId??'normandy_cerisy_standalone'}_${crypto.randomUUID()}`,definition):saved.record??createCampaignRoster('normandy_9th_infantry_company',definition);
      deployment={mission_instance_id:crypto.randomUUID(),roster:campaign};
    }
    const next=createMission(definition,nextSeed,setup,deployment); // Validate before replacing the active state/save.
    if(campaign&&definition.rules.standaloneRoster)startStandaloneRoster(localStorage,campaign,definition.rules.rosterKey);
    else if(campaign&&!readCampaign(localStorage,definition.rules.rosterKey).record)saveCampaign(localStorage,campaign,definition.rules.rosterKey);
if(definition.id!=='normandy_1_card_pull')localStorage.removeItem('platoon-active-vehicle-mission');screen='tactical';tacticalDraft=null;currentSlot=definition.id==='normandy_1_card_pull'?'card_pull':'infantry';mission=next;seed=nextSeed;selectedVehicle=null;vehicleRoute=[];focusStartingForce=true;commandLinks=false;camera=normalizeCamera();ordersScroll=0;combatId=null;combatStage='pre';combatOpen=true;contactAcknowledged=null;selected='co';action='ACTIVATE';target='';contributors=[];selectedPdf=null;recoveryResult=null;reviewId=null;
    clearAarNavigation();feedbackKind='Status';feedback=`${mission.mission_name} started with seed ${seed}.`;recoveryPending=false;persist(null,true);render();
  }
function beginPreparedAttempt(next,patrol=false){
 const previous=mission;mission=next;tacticalDraft=null;focusStartingForce=true;
 const candidate=patrol?`hq${next.patrol.plan.platoon}`:startingFormation(next);
 restorePresentation({selected:next.units[candidate]?.steps.length&&!next.units[candidate]?.removed?candidate:startingFormation(next),camera:normalizeCamera(),turnNotice:true,showHistorical,recapDialogs});
 feedbackKind=patrol?'Patrol preparation':'Mission reattempt';feedback=`${patrol?'Patrol':'Attempt'} ${next.attempt_number} prepared. The battlefield is retained; review your deployment before continuing.`;
 persist(previous);render();
}
function showAttemptPreparation(patrol){
 const scroll={left:window.scrollX,top:window.scrollY},returnFocus=patrol?'#result-patrol':'#result-reattempt';
 const viewport=app.querySelector('.map-viewport');if(viewport)camera=normalizeCamera({...camera,left:viewport.scrollLeft,top:viewport.scrollTop});
 ordersScroll=app.querySelector('.company-orders')?.scrollTop??ordersScroll;
 tacticalDraft=capturePresentationDraft(app,draftContext());persist();
 cleanupTooltips?.();cleanupHeader?.();cleanupMap?.();cleanupTooltips=cleanupHeader=cleanupMap=null;clearTimeout(ordersSaveTimer);
 phoneNotifications.reset();cardDrawNotifications.pause();experienceNotifications.reset();screen='preparation';document.title=`${patrol?'Patrol preparation':'Mission reattempt'} — ${mission.mission_name}`;app.replaceChildren();window.scrollTo(0,0);
 const back=()=>{screen='tactical';render();window.scrollTo(scroll.left,scroll.top);app.querySelector(returnFocus)?.focus({preventScroll:true});};
 const options={page:true,onClose:started=>{if(!started)back();}};
 try{const start=next=>{screen='tactical';beginPreparedAttempt(next,patrol);};if(patrol)openPatrolSetup(app,mission,start,options);else openReattemptSetup(app,mission,start,false,options);}
 catch(error){document.documentElement.classList.remove('preparation-screen');back();storageError=error.message;render();}
}
function adoptCampaignMission(next,p={}){
 mission=next;currentSlot='campaign';seed=next.seed;screen='tactical';tacticalDraft=null;focusStartingForce=true;selectedPdf=null;contactAcknowledged=null;vehicleRoute=[];recoveryPending=false;
 if(next.vire_runtime)selectVehicleMission(missionById(next.scenario_id));
 restorePresentation({selected:'co',action:'ACTIVATE',turnNotice:true,recapDialogs,...p});persist(null,true);render();
}
function setupCampaign(record){
 const progress=campaignProgress(record);if(!progress.destination)throw new Error(progress.reason);
 const id=crypto.randomUUID(),nextSeed=record.history.length?`${record.history[0].replay.seed}:normandy_${record.history.length+1}`:seed;
 const definition=progress.destination;
 const result=openMissionSetup(app,definition,nextSeed,setup=>{const committed=commitCampaignMission(localStorage,record,id,nextSeed,setup);adoptCampaignMission(committed.state);},{lockBattlefield:!!definition.rules?.hill192,preview:(_definition,seed,setup={})=>{
  const prepared=previewCampaignMission(record,id,seed,setup),{vehicle_positions={},jeep,...infantry}=prepared.deployment.setup;
  const extra=definition.rules?.vire?originalPreviewVireSetup(seed,infantry,vehicle_positions):definition.rules?.tinchebray?previewTinchebraySetup(seed,infantry,vehicle_positions):{};
  const view=previewMissionSetup(prepared.definition,seed,infantry,prepared.deployment);
  return {...extra,...view,...(extra.jeep_setup?{jeep_setup:{...extra.jeep_setup,...jeep}}:{}),assumptions:['Prepared campaign company. Surviving identities, strength, experience and skills are retained; support and supplies follow destination content.'],...(view.hill192?{hill192:{...view.hill192,campaign_owned:true}}:{})};
 }});if(result?.error)throw new Error(result.error);
}
function openCampaign(){
 if(screen==='tactical'&&mission)tacticalDraft=capturePresentationDraft(app,draftContext());
 openCompanyPreparation({scenario:trevieres,mission,download,connectedCandidate,onClose:()=>render(),resume:()=>{const saves=savedApplications(localStorage,missionCatalog);restoreSavedEntry(saves.campaign);},resumeStart:record=>adoptCampaignMission(resumeCommittedCampaign(record).state),start:setupCampaign});
}
function setupSelectedMission(previewOnly=false){
 try{
  const definition=previewOnly?missionById(launcherMission):playableMissionById(launcherMission),nextSeed=launcherSeed.trim()||'company-1';
  if(!definition)throw new Error('Choose a mission.');
  if([vireScenario.id,tinchebray.id].includes(definition.id)){openVehicleSetup(definition,nextSeed);return;}
  if(definition.map){const result=openMissionSetup(app,definition,nextSeed,definition.readiness?.playable!==false?setup=>startMission(definition,nextSeed,setup):null);if(result.error)throw new Error(result.error);}
  else startMission(definition,nextSeed);
 }catch(e){navigationError=e.message;render();}
}
function renderApplication(){
 cleanupTooltips?.();cleanupHeader?.();cleanupMap?.();clearTimeout(ordersSaveTimer);cleanupTooltips=cleanupHeader=cleanupMap=null;
 document.title='Platoon Tactical';
 const saves=savedApplications(localStorage,missionCatalog);
 app.innerHTML=applicationMarkup({screen,catalog:missionCatalog,saves,current:mission?.mission_name,selectedMission:launcherMission,seed:launcherSeed,error:navigationError||storageError||vehicleBootError,connectedCandidate});
 for(const b of app.querySelectorAll('[data-screen]'))b.onclick=()=>showScreen(b.dataset.screen);
 for(const b of app.querySelectorAll('[data-campaign]'))b.onclick=openCampaign;
 for(const b of app.querySelectorAll('[data-new-campaign],[data-delete-campaign]'))b.onclick=()=>{
  const fresh=b.hasAttribute('data-new-campaign');
  if(!confirm(fresh?'Replace the saved campaign and its backups with a fresh Normandy company? Export any history you want to keep first. Standalone missions are unaffected.':'Delete the saved campaign, its tactical recovery and campaign backups? This cannot be undone. Export any history you want to keep first. Standalone missions are unaffected.'))return;
  try{
   replaceSavedCampaign(localStorage,fresh?trevieres:null,fresh?crypto.randomUUID():null);
   if(currentSlot==='campaign'){mission=null;tacticalDraft=null;turnStart=null;currentSlot='infantry';}
   navigationError='';storageError='';render();if(fresh)openCampaign();
  }catch(error){navigationError='Campaign change failed: '+error.message;render();}
 };
 for(const b of app.querySelectorAll('[data-return]'))b.onclick=()=>{screen='tactical';render();};
 for(const b of app.querySelectorAll('[data-resume-save]'))b.onclick=()=>resumeSlot(b.dataset.resumeSave);
 for(const b of app.querySelectorAll('[data-export-save]'))b.onclick=()=>{const e=b.dataset.exportSave==='campaign'?saves.campaign:saves.standalone.find(e=>e.id===b.dataset.exportSave);if(e?.saved.raw)download(`${e.id}-original-save.json`,e.saved.raw);};
 for(const b of app.querySelectorAll('[data-export-company]'))b.onclick=()=>download('normandy-campaign-original.json',saves.companyRaw);
 const select=app.querySelector('#mission-select');
 if(select){const update=()=>{launcherMission=select.value;const entry=missionCatalog.find(e=>e.id===launcherMission);app.querySelector('#restart').disabled=!entry||!!entry.unavailable;app.querySelector('#preview-setup').disabled=!entry?.scenario?.map;app.querySelector('#mission-availability').textContent=entry?.unavailable?'Unavailable: '+entry.unavailable:entry?.scenario?.briefing??'';};select.onchange=update;update();app.querySelector('#seed').oninput=e=>{launcherSeed=e.target.value;};app.querySelector('#preview-setup').onclick=()=>setupSelectedMission(true);app.querySelector('#restart').onclick=()=>setupSelectedMission();}
}
function render(){
 if(screen==='preparation')return;
 if(screen!=='tactical'||!mission){phoneNotifications.reset();cardDrawNotifications.pause();renderApplication();return;}
 document.title=`Platoon Tactical — ${mission.mission_name}`;
 if(mission.vire_runtime)selectVehicleMission(missionById(mission.scenario_id));
  const mapObjectives=mission.patrol?{primary:{location:mission.patrol.plan.primary},ccp:{location:mission.objectives.ccp},cop:{location:mission.patrol.plan.cop},concentration:{location:mission.patrol.plan.concentration},...Object.fromEntries(mission.patrol.plan.route.map((location,i)=>[`route ${i+1}`,{location,completed:i<mission.patrol.visited.length}]))}:null;
  if(mission.impulse?.hq==='general')generalIssuer=retainedGeneralIssuer(Object.values(mission.units).filter(u=>u.faction==='friendly').map(u=>({...u,steps:u.steps.length})),generalIssuer);
  const issuer=action==='BN_RECONSTITUTE_CO'?'offmap_bn':mission.impulse?.hq==='general'?generalIssuer:mission.impulse?.hq;
  const v=getPlayerView(mission,'friendly',issuer),events=getVisibleEvents(mission).map(e=>e.type==='HQ_EVENT'||e.type==='HQ_EVENT_CHOICE_REQUIRED'?{...e,text:hqEventExplanation({...e,final_row:mission.boundaries?.rows,hill192:!!mission.mission_rules.hill192,vire:!!mission.mission_rules.vire},id=>v.locations.find(l=>l.id===id)?.name??id)}:e),aar=getAfterActionReport(mission);
  const boundaryLayout=mapBoundaryLayout(v);
  const unit=v.units.find(u=>u.id===selected)??v.units[0];
  const orderLabel=o=>o.type.startsWith('PYRO_')?`${o.label} — ${signalEffectLabel(v.signal_plan?.[o.type.slice(5).toLowerCase()],v,id=>v.locations.find(l=>l.id===id)?.name??id)}`:o.label;
  const transferName=id=>{const [,donor,kind,key]=id.split(':');return `${v.units.find(u=>u.id===donor)?.name??donor} · ${kind==='RADIO'?'radio/phone':kind==='AMMO'?'ammunition':'equipment'} · ${key}`;};
  const name=id=>id?.startsWith('transfer:')?transferName(id):v.locations.find(l=>l.id===id)?.name??v.units.find(u=>u.id===id)?.name??(mission.vire_runtime?.vehicles[id]?.faction==='friendly'?mission.vire_runtime.vehicles[id].name:null)??v.enemies.find(u=>u.id===id)?.name??v.casualties.find(c=>c.id===id)?.label??v.assets.find(a=>a.id===id)?.label??coverLabel(v,id)??(id==='offmap_bn'?'Off-map Battalion HQ':id==='open'?'Out of cover':id==='general'?'General initiative':id);
  unit.options=withVehicleHQActivationTargets(mission,unit,issuer,unit.options);
  unit.options.sort((a,b)=>Number(b.available)-Number(a.available));
  const {option:chosenOrder,reason:selectionReason}=selectedOrder(unit.options,action,target);
  const opt=chosenOrder??(unit.steps&&!unit.removed?{type:'',label:'Choose an available order',targets:[],available:false,cost:0}:null);
  const orderReason=!chosenOrder&&opt?(unit.options.some(o=>o.available)?'Choose an available order.':'Advance to a command impulse to issue orders.'):opt&&!opt.available&&unit.options.some(o=>o.available)?'Action completed or unavailable. Choose an available order.':selectionReason;
  const targetLabel=id=>name(id)+(action.startsWith('CALL_')&&v.locations.some(l=>l.id===id)?(v.units.some(u=>u.location===id&&active(u))?' · friendly formations present':''):'' );
  const callPreview=supportCallPreview(v,unit,action,target),supportNotice=supportWarning(v,events);
  const arrivalCovers=opt?.targets.find(t=>t.id===target)?.arrival_covers??[];
  const reconstitution=action==='RECONSTITUTE';
  const reconstitutionDonor=u=>u.kind==='LAT'||mission.mission_rules?.missionIdentity&&u.steps===1;
  const otherTeams=reconstitution?v.units.filter(u=>u.id!==unit.id&&u.steps===1&&!u.removed&&reconstitutionDonor(u)&&['A','F'].includes(u.cohesion)&&!u.pinned&&opt.contributor_ids?.includes(u.id)):[];
  const chosenTeams=otherTeams.filter(u=>contributors.includes(u.id));
  const restored=v.units.find(u=>u.id===target);
  const reason=reconstitution?(orderReason&&!orderReason.startsWith('Every contributor')?orderReason:!restored?'Choose a previously eliminated squad.':!unit.steps||!reconstitutionDonor(unit)||unit.pinned||!['A','F'].includes(unit.cohesion)?'Select an unpinned Fire or Assault Team.':chosenTeams.length<1?'Choose at least one additional team.':chosenTeams.length+1>(restored.max_steps??0)?`${restored.name} can hold at most ${restored.max_steps} steps.`:null):orderReason;
  const meaningful=events.filter(e=>!['CARDS_DRAWN','DECK_SHUFFLED','COMMAND_RESOLVED'].includes(e.type));
  const movementWarning=orderReason?null:movementFireWarning(v,action,target),movementCapacity=movementSpace(v,unit,opt,target);
  const previousTurn=currentAttemptEvents(events).filter(e=>e.turn===Math.max(1,v.turn-1));
  const combat=v.combat_resolution;
  if(combat&&combat.id!==combatId){combatId=combat.id;combatStage=combat.status==='RESOLVED'?'result':'pre';combatOpen=true;}
  if(!combat)combatId=null;
  const phaseIndex=PHASES.findIndex(p=>p[0]===v.phase);
  const recap=previousSegment(events,PHASES);
  const reviews=segmentReviews(events),review=reviews.find(r=>r.id===reviewId)??(recap?.id===reviewId?recap:null);
  const locked=recoveryPending||v.status!=='ACTIVE'||!!review||!!v.pending_support;
  const progress=v.segment_progress;
  const contact=v.contact_review?structuredClone(v.contact_review):null;
  const contactLocations=new Set(contact?[contact.location,...contact.events.flatMap(e=>[e.location,e.origin,e.target].filter(id=>v.locations.some(l=>l.id===id)))]:[]);
  const combatBlocked=progress?.phase==='COMBAT_EFFECTS'&&['awaiting_resolution','reviewing_result'].includes(progress.status)&&!!combat;
  const reviewCombat=!!combat&&!combatOpen&&!review;
  const advanceLabel=v.pending_support?'Choose fire option':!v.impulse&&v.eligible_hqs.length?'Select HQ below':reviewCombat?'Review combat →':v.impulse?'Complete impulse →':progress?.phase==='COMBAT_EFFECTS'?(progress.status==='reviewing'?'Continue to cleanup →':combat?'Combat resolution open':'Resolve hidden effects →'):contact?contactAdvanceLabel(contact):'Resolve segment →';
  const reviewEvents=progress?events.filter(e=>e.sequence>progress.events_after&&!['PHASE_ENTERED','DECK_SHUFFLED'].includes(e.type)):[];
  const selectedPath=pdfPaths(v).find(p=>p.id===selectedPdf);
  const combatFocus=new Set([combat?.target_location,...(combat?.sources??[]).map(s=>s.origin),...(recoveryResult?.phase===v.phase?recoveryResult.locations:[])].filter(Boolean));
  cleanupTooltips?.();cleanupHeader?.();cleanupMap?.();clearTimeout(ordersSaveTimer);
  const movingIds=new Set(movingFormationIds(opt,target,!!selected&&!reason&&!locked));
  app.innerHTML=`${commandHeader({v,name,seed,recapDialogs,showHistorical,recap,recovery,recoveryPending,locked,combatBlocked,reviewCombat,advanceLabel,phaseIndex,progress,feedback:tacticalText(v,feedback),feedbackKind})}
    ${v.pending_support?`<section class="segment-review" aria-label="Battalion fire choice"><b>Three-burst artillery call: choose ordinary or battalion fire.</b><p>One mission has been expended. No additional command or draw is required.</p><button id="ordinary-support">Ordinary fire</button><label>Adjacent card 1<select id="support-adjacent-1">${v.pending_support.adjacent.map(id=>`<option value="${esc(id)}">${esc(friendlyTargetLabel(v,id))}</option>`).join('')}</select></label><label>Adjacent card 2<select id="support-adjacent-2">${v.pending_support.adjacent.map((id,i)=>`<option value="${esc(id)}" ${i===1?'selected':''}>${esc(friendlyTargetLabel(v,id))}</option>`).join('')}</select></label><button id="battalion-support">Add both cards</button><p id="support-choice-reason" role="status"></p></section>`:''}
    ${v.pending_event?.code==='RESUPPLY'?`<section class="segment-review" role="group" aria-label="Higher headquarters resupply"><b>Choose ammunition resupply</b><label>Type <select id="event-ammo-type"><option value="MG">Machine gun</option><option value="MTR">Mortar</option><option value="RKT">Rocket</option></select></label><label>Row 1 card <select id="event-ammo-location">${v.locations.filter(l=>l.row===1).map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></label></section>`:''}
    ${v.patrol?`<section class="segment-review" aria-label="Patrol progress"><b>Patrol ${v.patrol_history.length+(v.status==='ACTIVE'?1:0)} / 3 · Platoon ${v.patrol.plan.platoon}</b> · Route ${v.patrol.visited.length}/4 · Primary ${v.patrol.objective_visited?'visited':'pending'} · MLR return ${v.patrol.returned?'complete':'pending'}.<ol class="patrol-route-checklist" aria-label="Route point progress">${v.patrol.plan.route.map((id,i)=>`<li class="${i<v.patrol.visited.length?'complete':''}">${i<v.patrol.visited.length?'✓':'○'} Route ${i+1} · ${esc(name(id))} · ${i<v.patrol.visited.length?'Reached':i===v.patrol.visited.length?'Next':'Pending'}</li>`).join('')}</ol></section>`:''}
    ${mission.mission_rules?.missionIdentity?`<section class="segment-review" aria-label="Normandy mission status">${Object.entries(v.support_inventory).map(([agency,stock])=>`<b>${esc(agency)} remaining:</b> HE ${stock.HE??0} · WP ${stock.WP??0}${stock.TOT!==undefined?` · TOT ${stock.TOT}`:''}${stock.ILLUM!==undefined?` · Illum ${stock.ILLUM}`:''}.`).join(' ')} <b>Runners:</b> ${(v.runners??[]).filter(r=>r.status==='BOX').length} ready · ${(v.runners??[]).filter(r=>r.status==='DISPATCHED').length} dispatched. ${(v.phone_lines??[]).length?`<b>Phone lines:</b> ${v.phone_lines.filter(line=>!line.cut).length} intact · ${v.phone_lines.filter(line=>line.cut).length} cut. `:''}<b>Enemy tactics:</b> ${esc(v.enemy_tactics?.replaceAll('_',' ')??'Deliberate Defense')}${v.counterattack_ends_after?` · counterattack through turn ${v.counterattack_ends_after}`:''}.</section>`:''}
    ${storageError||recovery.error?`<p class="storage-warning" role="alert">${esc(storageError||recovery.error)}</p>`:''}
    ${recoveryPending?'<p class="recovery-prompt">A saved mission is available. Resume it, restore its turn start, or start a new mission.</p>':''}
    ${progress&&progress.phase!=='CONTACTS'?`<details class="segment-review"><summary>Combat results · ${esc(v.phase_label)} · ${progress.visible_resolved??0}/${progress.visible_total??0} visible</summary>${reviewEvents.length?reviewEvents.map(e=>`<p>${esc(tacticalText(v,e.text))}</p>`).join(''):'<p>No resolved combat effects yet.</p>'}${progress.phase==='COMBAT_EFFECTS'&&combat?'<button id="reopen-combat">Open current combat</button>':''}<p>Next: ${esc(PHASES[(phaseIndex+1)%PHASES.length][1])}</p></details>`:''}
    ${combat&&combatOpen&&!review?combatScreen(combat,v,name,combatStage):''}
    <div class="company-workspace"><section class="battlefield-column" aria-label="Battlefield">
${aar?`<section class="mission-result" role="status"><h2>${mission.status==='PATROL_COMPLETE'?`Patrol ${mission.patrol_history.length} ${esc(mission.patrol_history.at(-1).outcome)}`:`Mission ${esc(aar.outcome)}`}</h2><p>${esc(finalFireMessage)}</p><p>${esc(tacticalText(v,aar.objectives.at(-1)?.text))}</p><button id="result-replay">Export replay</button><button id="result-aar">Export AAR (report)</button>${mission.mission_rules?.reattempts&&mission.mission_rules?.missionIdentity&&mission.status==='DEFEAT'&&mission.attempt_number<=mission.mission_rules.reattempts&&!mission.reattempt_declined?'<button id="result-reattempt">Prepare next attempt</button><button id="result-decline-reattempt">Decline reattempt and end mission</button>':''}${mission.status==='PATROL_COMPLETE'?'<button id="result-patrol">Prepare next patrol</button>':''}${mission.mission_rules?.missionIdentity?'<button id="campaign-export">Export company roster</button>':''}${mission.mission_rules?.missionIdentity&&mission.status!=='PATROL_COMPLETE'&&(!mission.mission_rules.reattempts||mission.status!=='DEFEAT'||mission.attempt_number>mission.mission_rules.reattempts||mission.reattempt_declined)?`<button id="result-debrief">${currentSlot==='campaign'?'Review debrief & prepare company':'Record mission in company roster'}</button>`:''}<button type="button" id="review-aar">Review AAR</button></section>`:''}
    ${selectedPath?`<p class="selected-fire-path" role="status">PDF trace: ${esc(selectedPath.label)} Path: ${selectedPath.cards.map(name).map(esc).join(' → ')}. ${esc(v.fire.filter(f=>`${f.origin}|${f.target}|${f.friendly?'friendly':f.source?'enemy':'unknown'}`===selectedPdf).map(f=>fireExplanation(v,f)).join(' '))}</p>`:''}
    <div class="battlefield-stage"><div class="map-viewport" tabindex="0" aria-label="Scrollable battlefield"><div class="map-canvas"><div class="map-layer"><svg id="fire-overlay" aria-hidden="true"></svg><svg id="command-link-overlay" aria-label="Friendly command network"></svg><div class="company-map" style="grid-template-columns:repeat(${Math.max(...v.locations.map(l=>l.col))-Math.min(...v.locations.map(l=>l.col))+1},minmax(0,1fr))">${boundaryLayout.boundaries.map(b=>`<div class="mlr-boundary phase-line-boundary" role="separator" aria-label="${esc(b.label)}" style="grid-column:1 / -1;grid-row:${b.gridRow}"><span>${esc(b.label)}</span></div>`).join('')}${[...v.locations].sort((a,b)=>b.row-a.row||a.col-b.col).map(l=>{
      const own=v.units.filter(u=>active(u)&&u.location===l.id),enemy=v.enemies.filter(u=>!u.removed&&u.steps&&u.location===l.id),pc=v.contacts.filter(c=>c.location===l.id&&!c.resolved),fire=v.fire.filter(f=>f.target===l.id),support=v.support.filter(f=>f.location===l.id);
      return `<div class="terrain-stack ${!selected||l.id===unit.location||unit.los.includes(l.id)?'':'stack-outside-los'}" style="${boundaryLayout.cardStyle(l)}" ><article data-location="${l.id}" class="terrain-card ${!selected||l.id===unit.location||unit.los.includes(l.id)?'in-los':'outside-los'} ${combatFocus.has(l.id)||contactLocations.has(l.id)?'combat-focus':''} ${combat?.target_location===l.id?'combat-target':''} ${selectedPath?.cards.includes(l.id)?'selected-pdf-card':''} ${l.staging?'staging':''} ${fire.length||support.length?'incoming':''}">${terrainBorders(l)}<div class="terrain-header"><h3>${esc(l.name)}</h3>${l.staging||l.known===false?'':`<span class="protection">+${l.protection}</span>`}</div>
      ${terrainInformation(l,selected&&l.known!==false?unit.los_explanations[l.id].reason:'')}
      ${terrainMarkers(l,pc,mapObjectives??v.objectives)}${phoneWireMarkup(v.phone_lines??[],l.id)}${v.markers.filter(m=>m.type==='ILLUMINATION'&&m.location===l.id).map(m=>`<span class="contact-badge">${esc(m.delivery)} illumination −${m.center}${m.adjacent?` / adjacent −${m.adjacent}`:''}</span>`).join('')}${l.smoke?'<span class="contact-badge">Screening smoke</span>':''}
      ${contact?.location===l.id?`<section class="card-contact" aria-label="Contact resolution"><h4>${contact.resolved?'Contact result':'Evaluate potential contact'}</h4>${contact.events.map(e=>`<p>${esc(tacticalText(v,e.text))}</p>`).join('')}<button data-contact-progress ${locked?'disabled':''}>${esc(advanceLabel)}</button></section>`:contact&&pc.length&&contact.eligible_locations.includes(l.id)?'<small>Queued this segment</small>':''}
      <div class="fire-markers">${fireMarkers(v,l).map(m=>`<details class="counter-marker"><summary title="${esc(m.label)}">${markerSummary(m)}${m.annotation?`<span class="marker-annotation">${esc(m.annotation)}</span>`:''}</summary><p>${esc(m.detail)}</p></details>`).join('')}</div>
      ${pdfDirections(v,l).map(d=>`<button type="button" class="pdf-badge ${d.side}" data-pdf-path="${esc(`${d.paths[0].origin}|${d.paths[0].target}|${d.paths[0].side}`)}" style="--x:${50+d.dc*45}%;--y:${50-d.dr*45}%;--angle:${d.angle}deg" title="${esc(d.label)}" aria-label="${esc(d.label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 13H15V22H9V13H2Z"/></svg>PDF</button>`).join('')}
      ${formationGrid(l,own,enemy,{selected,movingIds,infiltrating:action==='PLATOON_INFILTRATE'})}${vehicleCounters(mission,l.id)}
      ${v.casualties.filter(c=>c.location===l.id&&!c.evacuated).map(c=>`<div class="casualty-marker"><b>✚ ${esc(c.label)}</b><small>${esc(casualtyEvacuationStatus(v,c))} · ${esc(c.cover?l.covers.find(x=>x.id===c.cover)?.type??'cover':'Out of cover')}</small></div>`).join('')}
      ${v.assets.filter(a=>a.location===l.id).map(a=>`<div class="equipment-marker"><b>▣ ${esc(a.label)}</b><small>${a.carrier_name?'Carried by '+esc(a.carrier_name):'Dropped here · recoverable'}</small></div>`).join('')}
      ${v.historical_losses.filter(e=>e.location===l.id&&(showHistorical||e.actor===selected)).map(e=>`<div class="loss-silhouette"><span aria-hidden="true">♟</span><b>${esc(e.name)}</b><small>Turn ${e.turn} · Historical loss — no tactical effect</small></div>`).join('')}
      ${v.suspected.includes(l.id)?'<p class="suspected">Current unspotted position</p>':v.historical_reports.includes(l.id)&&!enemy.length?'<p class="historical">Historical firing report · not a current spotting target</p>':''}
      ${fire.length||support.length||pdfDirections(v,l).length?`<details class="card-fire-details"><summary>Fire details</summary>${pdfDirections(v,l).map(d=>`<p>${[...new Set(d.sources)].map(esc).join('<br>')}</p>`).join('')}${fire.length?`<p class="fire-label">Fire affecting card: ${fire.map(f=>`${f.friendly?'Friendly':f.source?'Enemy':'Unidentified'} from ${esc(name(f.origin))}${!([...(f.friendly?v.enemies:v.units)].some(u=>u.location===l.id&&u.steps&&!u.removed))?' · no known opposing recipient':''}`).join('; ')}. Same-card fire affects opposing formations only.</p>`:''}
      ${support.map(f=>`<p class="fire-label">${f.status==='PENDING'?'Pending':'Active'} indirect fire (${f.value})</p>`).join('')}</details>`:''}
      ${terrainFooter(l)}</article>${hillStack(l)}</div>`;
    }).join('')}</div></div></div></div>${mapControls()}${commandLinks?commandLegend:''}</div><details class="map-reference"><summary>Map key · LOS, fire and status markers</summary><p class="map-legend">LOS borders: white permits tracing through; dark green blocks tracing through at the same elevation. Adjacent cards remain visible unless smoke or other restrictions apply. Hills may overlook lower borders. Selected formation LOS: bright cards. Select an edge PDF badge to emphasize its path through terrain cards: green friendly · red enemy · amber unidentified. VOF counters mark affected cards; same-card fire has no outward PDF. Inspect counters for effects. PIN and EXPOSED badges belong to formations. A ✚ CARRYING badge shows the number of casualty steps a friendly formation is transporting; select it for casualty names and drop-off orders.</p></details>
    <details class="panel fire-report"><summary>Fire details and continuing fire</summary><p>Friendly formations do not automatically open fire into a card containing both friendly and enemy units. Established fire can continue after the enemy leaves or is captured. Cease/Shift Fire changes it; new eligible targets may trigger automatic fire again.</p>${v.fire.length?v.fire.map(f=>`<p>${esc(fireExplanation(v,f))} ${f.pdf_only?'No basic VOF':f.value===2?'Pinned fire +2':f.value===0?'Small arms 0':f.value===-1?'Automatic −1':'Heavy −3'}${f.origin!==f.target&&!f.indirect?` <button type="button" data-pdf-path="${esc(`${f.origin}|${f.target}|${f.friendly?'friendly':f.source?'enemy':'unknown'}`)}">Trace path</button>`:''}</p>`).join(''):'<p>No automatic fire established. Units will open fire when a valid spotted target is in range.</p>'}</details>
    <details class="panel history"><summary>Tactical record · previous results</summary><ol>${meaningful.slice(-45).reverse().map(e=>`<li><span class="event-turn">T${e.turn}</span><span>${esc(tacticalText(v,e.text))}</span></li>`).join('')}</ol></details></section>
    <aside class="company-orders panel ${selected?'':'no-selection'}"><button class="back-to-map" id="back-to-map">↑ Battlefield</button><p class="selection-hint">Select a formation to inspect its LOS and orders.</p><div class="eyebrow">FORMATION ORDERS</div><label class="field">Selected formation<select id="unit"><option value="" ${selected?'':'selected'}>Show all terrain</option>${formationSelectionOptions(v.units,selected,showHistorical)}</select></label>
    ${supportNotice?`<p class="danger" role="alert">${esc(supportNotice)}</p>`:''}<div class="selected-unit-heading">${formationCounter(unit.transport?{...unit,steps:unit.transport.steps}:unit)}<div><h2>${esc(unit.name)}</h2><p>${esc(unit.transition_description??stateText(unit))}</p></div></div><p class="muted">${esc(unit.removed==='RESERVE'?'Off map · reserve':name(unit.transport?.location??unit.location))} · ${esc(unit.experience)} experience${unit.radios.length?' · '+esc(unit.radios.join(' / '))+' radio':''}</p>

    ${v.impulse?.hq==='general'?`<label class="field">HQ for HQ-only actions<select id="issuer"><option value="" ${generalIssuer?'':'selected'}>Choose HQ for HQ-only actions</option>${v.units.filter(u=>active(u)&&['HQ','STAFF'].includes(u.kind)).map(u=>`<option value="${u.id}" ${u.id===generalIssuer?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>`:''}
    ${unit.skills?.length?`<p>Unused skills: ${unit.skills.map(p=>esc(p.label)).join(', ')}</p>`:''}
    ${commandRecoveryHint(unit)?`<p class="command-recovery-hint">${esc(commandRecoveryHint(unit))}</p>`:''}
    ${unit.automatic_skill?`<p>${esc(unit.automatic_skill)}.</p>`:''}
    ${unit.combat?`<p class="danger">Under fire · NCM ${unit.combat.ncm>=0?'+':''}${unit.combat.ncm}${unit.exposed?' · exposed':''}</p>`:''}
    ${opt?`<label class="field">Order<select id="action">${availableOrderMenu(unit.options,action,orderLabel)}</select></label>
      ${opt.targeted?`<label class="field">${action==='CREATE_RUNNER'?'Donor (loses one step)':reconstitution?'Restore eliminated squad':'Target'}<select id="target"><option value="" ${target?'':'selected'}>Choose target</option>${!opt.targets.some(t=>t.id===target)&&target?`<option value="${esc(target)}" selected disabled>${esc(name(target))} · unavailable</option>`:''}${[...opt.targets].sort((a,b)=>Number(!!a.reason)-Number(!!b.reason)).map(t=>`<option value="${esc(t.id)}" ${t.id===target?'selected':''} ${t.reason?'disabled':''} title="${esc(t.reason)}">${esc(targetLabel(t.id))}${action==='CREATE_RUNNER'?` · ${v.units.find(u=>u.id===t.id)?.steps??0} step(s)${v.units.find(u=>u.id===t.id)?.steps===1?' · final step: unit removed, equipment dropped':''}`:''}${t.reason?(action==='ACTIVATE'&&v.units.find(u=>u.id===t.id)?.activated?' · already activated':' · unavailable'):''}</option>`).join('')}</select></label>`:''}
      ${arrivalCoverMarkup(arrivalCovers,id=>coverLabel(v,id),action.startsWith('PLATOON_'))}
      ${reconstitution?`<fieldset class="reconstitution-teams"><legend>Contributing teams · same card, in communication</legend><p>Selected: ${esc(unit.name)}</p>${otherTeams.map(u=>`<label><input type="checkbox" data-contributor="${esc(u.id)}" ${contributors.includes(u.id)?'checked':''}> ${esc(u.name)}</label>`).join('')||'<p>No other eligible teams here.</p>'}<small>Choose 2–4 teams total, within the restored counter’s ${restored?.max_steps??'selected'}-step capacity.</small></fieldset>`:''}
      ${['DETACH','DETACH_FIRE_TEAM'].includes(action)?`<fieldset><legend>Equipment for detached team (optional)</legend>${[...new Set(unit.radios??[])].map(net=>`<label><input type="checkbox" data-detach-radio="${esc(net)}"> ${esc(net)} radio/phone</label>`).join('')}${Object.entries(unit.assets??{}).filter(([,n])=>n>0).map(([key,n])=>`<label class="field">${esc(key)} · available ${n}<input type="number" data-detach-asset="${esc(key)}" min="0" max="${n}" value="0"></label>`).join('')}${Object.entries(unit.ammo??{}).filter(([,n])=>n>0).map(([key,n])=>`<label class="field">${esc(key)} ammunition · available ${n}<input type="number" data-detach-ammo="${esc(key)}" min="0" max="${n}" value="0"></label>`).join('')}</fieldset>`:''}
      ${opt.skills?.length?`<label class="field">One-use skill<select id="order-skill">${action.startsWith('SKILL_')?'':'<option value="">Use no skill</option>'}${opt.skills.map(skill=>`<option value="${esc(skill.id)}">${esc(skill.label)} · ${esc(name(skill.holder))}</option>`).join('')}</select></label>`:''}
      ${opt.exhortable?`<label><input id="exhort-order" type="checkbox" ${opt.exhort_reason?'disabled':''}> Exhort once if this attempt fails (1 additional command)</label><small>${esc(opt.exhort_reason??'Optional conditional order: draws one extra card only after a failed attempt; no extra command is spent on success.')}</small>`:''}
      ${action==='TRANSFER_EQUIPMENT'?'<label class="field">Quantity<input id="transfer-quantity" type="number" min="1" step="1" value="1"></label>':''}
      ${callPreview?`<p class="support-call-preview">${esc(callPreview.name)} · ${esc(callPreview.ammo)} · ${callPreview.draws} caller draw(s)${callPreview.registered?' (registered target bonus included)':''} · ${callPreview.remaining===undefined?'Limits: see briefing.':callPreview.remaining+' remaining.'} Requires ${esc(callPreview.network??'working fire-direction')} radio. Before optional skill/exhortation draws.</p>`:''}
      ${groupMovementExclusions(v,unit,opt,target).length?`<details class="group-movement-exclusions"><summary>Formations staying here</summary>${groupMovementExclusions(v,unit,opt,target).map(u=>`<p><b>${esc(u.name)}</b>: ${esc(u.reason)}</p>`).join('')}</details>`:''}
      ${movementCapacity?`<p class="movement-capacity">Destination: ${movementCapacity.occupied} friendly steps; ${movementCapacity.incoming} steps in the selected move.${movementCapacity.limit?` Projected total ${movementCapacity.total}/${movementCapacity.limit}.`: " Staging has no card stacking limit."}</p>`:''}
      ${orderConsequences(v,unit,opt,target,mission.mission_rules?.communications).map(text=>`<p class="order-consequence">${esc(text)}</p>`).join('')}
      ${movementWarning?`<p class="danger" role="alert">${esc(movementWarning)}</p>`:''}
      ${action==='RECONSTITUTE_HQ'?`<p>The selected formation donates one step to the restored HQ, which returns Green on the donor's card. ${unit.steps===1?'The donor is removed and its equipment drops on that card.':''}</p>`:''}
      ${action==='CREATE_RUNNER'?`<p>A runner takes one existing step from the chosen donor and waits in the off-map CO HQ runner box. Dispatch it in a separate order. ${target===selected&&unit.steps===1?'This consumes the selected unit’s final step.':''}</p>`:''}
      <p class="command-preview"><b>Command:</b> ${esc(v.impulse?.hq==='general'&&!issuer?'General initiative':name(issuer)||'No issuer')} → ${esc(unit.name)} · ${esc(orderLabel(opt))}${opt.targeted?' → '+esc(target?name(target):'Choose target'):''}${movingIds.size?` Moving: ${esc([...movingIds].map(name).join(', '))}`:''}${reconstitution?` · Contributors: ${esc([unit.name,...chosenTeams.map(u=>u.name)].join(', '))}`:''} · ${opt.cost} command${opt.cost===1?'':'s'}</p>
      <button id="order" class="primary" ${reason||locked||!selected?'disabled':''}>${action==='SPOT'?'Open Spotting Menu':`Issue order · ${opt.cost} command${opt.cost===2?'s':''}`}</button>
      <p class="reason">${esc(reason??'Resolves immediately. Review the outcome before your next order.')}</p>`:`<p>${esc(formationInspectionReason(unit,v))}</p>`}
    ${unavailableTargetReference(opt,name)}
    ${unavailableOrderReference(unit.options,orderLabel)}
    <details class="order-feedback" ${feedbackKind==='Last order'?'open':''}><summary>${esc(feedbackKind)}</summary><p role="status">${esc(tacticalText(v,feedback))}</p></details>
    ${inlineInventory(unit,{locked})}
    <details id="order-eligibility"><summary>All order eligibility</summary>${unit.options.map(o=>`<p><b>${esc(orderLabel(o))}</b>: ${o.available?'Available':esc(o.reason)}</p>`).join('')}</details>
    <details id="named-personnel"><summary>Named personnel</summary><ul class="personnel">${v.personnel.filter(p=>p.origin===unit.id||unit.personnel.includes(p.id)).map(p=>`<li>${esc(p.name)} · ${esc(p.status)}</li>`).join('')}</ul></details>
<details id="casualty-evacuation"><summary>Casualty evacuation</summary>${v.casualties.length?v.casualties.map(c=>`<p>${esc(c.label)} · ${esc(casualtyEvacuationStatus(v,c))} · ${esc(name(c.location))}</p>`).join(''):'<p>No friendly casualty steps recorded.</p>'}</details>
    <details id="turn-summary"><summary>Turn summary</summary><p>${previousTurn.filter(e=>e.type==='COMMAND_ISSUED').length} orders · ${previousTurn.filter(e=>e.type==='CASUALTY').length} observed casualty steps · ${previousTurn.filter(e=>e.type==='FORMATION_CHANGED').length} observed formation changes.</p></details>
    <details id="diagnostic-details"><summary>Diagnostics and card draws</summary><button id="fast-forward" ${locked?'disabled':''}>Skip remaining orders and finish turn</button><pre>${esc(JSON.stringify({phase:v.phase,impulse:v.impulse,combat:unit.combat,draws:events.filter(e=>e.type==='CARDS_DRAWN').slice(-20)},null,2))}</pre></details>
    <button class="abort" id="abort" ${locked?'disabled':''}>Abort mission</button></aside></div>${vireControls(mission)}
    ${afterActionMarkup(aar,t=>tacticalText(v,t))}`;

  restorePresentationDraft(app,tacticalDraft,draftContext());
  app.insertAdjacentHTML('beforeend',`${reviews.length?`<details class="segment-history"><summary>Segment result history</summary>${reviews.map(r=>`<button data-review="${r.id}">${r.attemptLabel?esc(r.attemptLabel)+' · ':''}Turn ${r.turn} · ${esc(r.label)}</button>`).join('')}</details>`:''}${review?segmentResultMarkup(review,name):''}`);
  for(const [destination,selectors] of [
    ['#panel-mission',['#casualty-evacuation','#turn-summary','#abort','[aria-label="Normandy mission status"]']],
    ['#panel-roster',['#named-personnel']],
    ['#debug-content',['#order-eligibility','.map-reference','.fire-report','.history','.segment-history','.segment-review:not([aria-label="Battalion fire choice"]):not([aria-label="Higher headquarters resupply"]):not([aria-label="Normandy mission status"])','#diagnostic-details']]
  ])for(const selector of selectors){const element=app.querySelector(selector);if(element)app.querySelector(destination).append(element);}
  if(feedbackKind!=='Last order')app.querySelector('#debug-content').append(app.querySelector('.order-feedback'));
  if(opt&&!opt.available){
   const panel=app.querySelector('.company-orders');
   for(const field of panel.querySelectorAll(':scope > .field'))if(!field.querySelector('#action,#unit,#issuer'))field.hidden=true;
   for(const field of panel.querySelectorAll(':scope > fieldset'))field.hidden=true;
   for(const element of panel.querySelectorAll(':scope > .command-preview,#order,#exhort-order,#order-skill')){element.hidden=true;}
   const exhort=panel.querySelector('#exhort-order');if(exhort)exhort.closest('label').hidden=true;
  }
  const ordersPanel=app.querySelector('.company-orders');ordersPanel.scrollTop=ordersScroll;ordersPanel.onscroll=()=>{ordersScroll=ordersPanel.scrollTop;clearTimeout(ordersSaveTimer);ordersSaveTimer=setTimeout(()=>{persist();if(storageError&&!app.querySelector('.storage-warning'))render();},250);};
  cleanupTooltips=bindUnitTooltips(app);
  if(mission.vire_runtime){
   app.querySelectorAll('[data-vehicle]').forEach(b=>b.onclick=()=>{selectedVehicle=b.dataset.vehicle;vehicleRoute=[];selected=null;ordersScroll=0;persist();render();});
   const button=document.createElement('button');button.id='vire-setup';button.textContent=tinchebrayDevelopment?'New Tinchebray setup':'New Vire setup';app.querySelector('#vire-controls').append(button);
   button.onclick=()=>openVehicleSetup(missionById(mission.scenario_id),seed);if(currentSlot==='campaign')button.hidden=true;
  }
  bindVireControls(app,{submit:operation=>{selectedVehicle=operation.type==='ENGINE_OPERATION'&&operation.operation?.op==='selectHQ'?operation.operation.id:app.querySelector('#vire-firer')?.value??selectedVehicle;const next=submitVehicleInteraction(mission,operation);mission=next;if(operation.type==='PREPARE_VEHICLE_MOVE')vehicleRoute=[];persist();render();if(['PREPARE_VEHICLE_MOVE','STEP_VEHICLE_MOVE'].includes(operation.type))app.querySelector('#focus-unit')?.click();},exportSave:()=>download(tinchebrayDevelopment?'tinchebray-recovery-original.json':'vire-recovery-original.json',localStorage.getItem(recoveryKey(currentSlot))??'null'),restoreSaved:()=>{if(currentSlot==='campaign'){resume('latest');return;}const saved=readVireRecovery(localStorage);if(saved.error||!saved.bundle)throw new Error(saved.error??'No vehicle recovery available.');const restored=resumeVireCheckpoint(saved.bundle.latest);mission=restored.state;seed=mission.seed;restorePresentation(restored.presentation);render();},exportReplay:()=>download(tinchebrayDevelopment?'tinchebray-integration-replay.json':'vire-integration-replay.json',exportVireAdapterReplay(mission.vire_runtime.initial_state,mission)),restore:record=>{const restored=record.schema?resumeVireCheckpoint(record.latest):{state:importVireAdapterReplay(record),presentation:{}};if(restored.state.scenario_id!==vire.id)throw new Error('Imported vehicle replay belongs to a different mission.');if(currentSlot==='campaign'&&restored.state.mission_instance_id!==mission.mission_instance_id)throw new Error('Imported replay belongs to a different campaign deployment.');mission=restored.state;seed=mission.seed;restorePresentation(restored.presentation);persist(null,true);render();}});
  integrateVehicleControls(app,mission,{selectedVehicle,route:vehicleRoute,onRoute:route=>{vehicleRoute=route;persist();render();},onSelect:id=>{selectedVehicle=id;vehicleRoute=[];selected=null;ordersScroll=0;persist();render();}});
  cleanupHeader=bindCommandHeader(app,{openFile:recoveryPending});
 app.querySelector('#nav-home').onclick=()=>showScreen('home');app.querySelector('#nav-missions').onclick=()=>showScreen('missions');app.querySelector('#nav-campaign').onclick=()=>openCampaign();
 app.querySelector('#show-historical').onchange=e=>{showHistorical=e.target.checked;persist();render();app.querySelector('#menu-settings').click();app.querySelector('#show-historical').focus();};
 app.querySelector('#recap-dialogs').onchange=e=>{recapDialogs=e.target.checked;persist();render();app.querySelector('#menu-settings').click();app.querySelector('#recap-dialogs').focus();};
  const displayedVehicle=app.querySelector('#vire-controls')&&!app.querySelector('#vire-controls').hidden?app.querySelector('#vire-firer').value:null;
  cleanupMap=bindMapViewport(app,{camera,columns:Math.max(...v.locations.map(l=>l.col))-Math.min(...v.locations.map(l=>l.col))+1,selectedLocation:displayedVehicle?mission.vire_runtime?.vehicles[displayedVehicle]?.location:selected?(unit.transport?.location??unit.location):null,selectedUnit:displayedVehicle??(selected?unit.transport?.id??selected:null),onChange:(value,save)=>{camera=value;if(save){persist();if(storageError&&!app.querySelector('.storage-warning'))render();}},onLayout:()=>drawFirePaths(v)});
  app.querySelector('#panel-mission').insertAdjacentHTML('beforeend',recentDrawMarkup(events,v.turn));
  cardDrawNotifications.sync(app.querySelector('.battlefield-stage'),drawIdentity(),events);
  phoneNotifications.sync(app.querySelector('.battlefield-stage'));
  app.querySelectorAll('[data-replay-draw]').forEach(b=>b.onclick=()=>cardDrawNotifications.replay(publicDrawGroups(events,v.turn).find(g=>g.id===b.dataset.replayDraw)));
 if(focusStartingForce){focusStartingForce=false;app.querySelector('#focus-unit')?.click();}
  const commandToggle=app.querySelector('#command-links');commandToggle.checked=commandLinks;commandToggle.onchange=()=>{commandLinks=commandToggle.checked;persist();render();};
  const dropSelected=app.querySelector('#drop-selected-items');
  if(dropSelected){
    const fields=[...app.querySelectorAll('[data-drop-quantity]')];
    const updateDrop=()=>{dropSelected.disabled=locked||!fields.some(e=>Number(e.value)>0)||fields.some(e=>!e.checkValidity());};
    for(const field of fields)field.oninput=updateDrop;updateDrop();
    dropSelected.onclick=()=>{if(locked||!selected)return;const drop_items=fields.filter(e=>Number(e.value)>0).map(e=>({type:e.dataset.dropType,key:e.dataset.dropKey,quantity:Number(e.value)}));const before=mission,r=submitCommand(mission,{type:'DROP_LOAD',unit_id:selected,issuer_id:issuer,drop_items});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();};
  }
  app.querySelectorAll('[data-inline-unload]').forEach(b=>b.onclick=()=>{if(locked||!selected)return;const before=mission,r=submitCommand(mission,{type:b.dataset.inlineUnload,unit_id:selected,issuer_id:issuer});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();});
  app.querySelectorAll('[data-pdf-path]').forEach(button=>button.onclick=()=>{selectedPdf=button.dataset.pdfPath===selectedPdf?null:button.dataset.pdfPath;persist();render();});
  if(v.pending_support){const updateSupportChoice=()=>{const choiceReason=battalionChoiceReason(v,app.querySelector('#support-adjacent-1').value,app.querySelector('#support-adjacent-2').value);app.querySelector('#battalion-support').disabled=!!choiceReason;app.querySelector('#support-choice-reason').textContent=choiceReason??'All formations on the added cards can be affected. Review friendly occupancy before confirming.';};for(const id of ['support-adjacent-1','support-adjacent-2'])app.querySelector('#'+id).onchange=updateSupportChoice;updateSupportChoice();}
  for(const [id,expanded]of [['ordinary-support',false],['battalion-support',true]]){const button=app.querySelector('#'+id);if(button)button.onclick=()=>{const before=mission,r=resolveSupportChoice(mission,{locations:expanded?[app.querySelector('#support-adjacent-1').value,app.querySelector('#support-adjacent-2').value]:[]});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden).map(e=>e.text).join(' ')??'Fire mission choice recorded.';if(mission!==before)persist(before);render();};}
  app.querySelector('#advance').onclick=()=>{if(reviewCombat){combatOpen=true;persist();render();return;}const previous=PHASES.find(p=>p[0]===mission.phase);const before=mission;const phaseOptions=mission.phase==='CAPTURE'?{friendlyRemainder:app.querySelector('#guard-remainder')?.value??'F'}:v.pending_event?.code==='RESUPPLY'?{eventChoice:{ammo_type:app.querySelector('#event-ammo-type').value,location:app.querySelector('#event-ammo-location').value}}:{};const r=advancePhase(mission,phaseOptions);mission=r.state;const completed=segmentReviews(getVisibleEvents(mission).map(e=>e.type==='HQ_EVENT'||e.type==='HQ_EVENT_CHOICE_REQUIRED'?{...e,text:hqEventExplanation({...e,final_row:mission.boundaries?.rows,hill192:!!mission.mission_rules.hill192,vire:!!mission.mission_rules.vire},id=>v.locations.find(l=>l.id===id)?.name??id)}:e)).findLast(e=>!events.some(old=>old.id===e.id));if(recapDialogs&&completed&&completed.events.some(e=>!['HQ_EVENT_NONE'].includes(e.type)))reviewId=completed.id;recoveryResult=previous[0]==='PINNED_RECOVERY'?{phase:mission.phase,units:r.events.filter(e=>e.type==='AUTOMATIC_RECOVERY'&&!e.hidden).map(e=>before.units[e.actor]?.name).filter(Boolean),locations:r.events.filter(e=>e.type==='AUTOMATIC_RECOVERY'&&!e.hidden).map(e=>before.units[e.actor]?.location).filter(Boolean)}:null;feedbackKind=mission.phase===previous[0]?'Current segment result':'Previous segment';feedback=r.reason??`${previous[1]}: ${r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','PHASE_ENTERED'].includes(e.type)).at(-1)?.text??'Complete.'}`;if(previous[0]==='FIRE_MISSIONS'&&r.events.some(e=>e.type==='FIRE_ESTABLISHED'&&!e.hidden))feedback+=` Incoming markers updated; an established fire path may reopen or change its affected card.`;if(mission.impulse?.hq!=='general'&&mission.impulse?.hq){if(mission.vire_runtime?.vehicles[mission.impulse.hq]){selectedVehicle=mission.impulse.hq;selected=null;}else{selectedVehicle=null;vehicleRoute=[];selected=mission.impulse.hq;}}if(mission!==before)persist(before);render();};
  app.querySelectorAll('[data-contact-progress]').forEach(b=>b.onclick=()=>app.querySelector('#advance').click());

  app.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{reviewId=b.dataset.review;persist();render();});
  if(turnNotice&&!review&&!recoveryPending){
    app.insertAdjacentHTML('beforeend',turnNoticeMarkup(v,name));
    const notice=app.querySelector('#new-turn-notice');notice.showModal();
    const dismiss=()=>{turnNotice=false;persist();render();app.querySelector('#advance')?.focus();};
    notice.oncancel=e=>{e.preventDefault();dismiss();};notice.querySelector('button').onclick=dismiss;
  }
  const dialog=app.querySelector('dialog.tactical-dialog');
  if(dialog){
    dialog.showModal();
    const dismiss=()=>{if(review?.phase==='PINNED_RECOVERY'&&combat)combatOpen=true;reviewId=null;persist();render();app.querySelector('#advance')?.focus();};
    dialog.oncancel=e=>{e.preventDefault();dismiss();};
    (app.querySelector('#dismiss-segment')??app.querySelector('#close-inventory')).onclick=dismiss;

  }
  app.querySelectorAll('[data-hq]').forEach(b=>b.onclick=()=>{const before=mission;const r=selectHQ(mission,b.dataset.hq);mission=r.state;selectedVehicle=null;vehicleRoute=[];selected=b.dataset.hq;action='';target='';contributors=[];ordersScroll=0;feedbackKind='HQ selection';feedback=r.events.at(-1)?.text??r.reason;if(mission.impulse?.commands===0&&!getPlayerView(mission).units.some(u=>u.options.some(o=>o.available&&o.cost===0))){const completed=advancePhase(mission);mission=completed.state;feedback+=' No commands drawn; impulse completed.';}if(mission!==before)persist(before);render();});
  app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{selectedVehicle=null;selected=b.dataset.unit;action='';target='';contributors=[];ordersScroll=0;persist();render();});
  const resolveButton=app.querySelector('#combat-resolve');if(resolveButton)resolveButton.onclick=()=>{const before=mission,r=resolveDisplayedExchange(mission,(previous,next)=>{mission=next;persist(previous);});mission=r.state;combatStage='result';feedbackKind='Combat result';feedback=r.reason??`Combat resolved: ${getPlayerView(mission).combat_resolution?.result}.`;if(mission!==before)persist(before);render();};

  const nextResolve=app.querySelector('#combat-next-resolve');if(nextResolve)nextResolve.onclick=()=>{const before=mission,r=resolveNextDisplayedExchange(mission,(previous,next)=>{mission=next;persist(previous);});mission=r.state;combatStage='result';feedbackKind='Combat result';feedback=r.reason??'Next visible combat resolved.';if(mission!==before)persist(before);render();};
  const nextCombat=app.querySelector('#combat-next');if(nextCombat)nextCombat.onclick=()=>{const before=mission,r=advancePhase(mission);mission=r.state;combatId=null;combatStage='pre';combatOpen=true;feedbackKind='Combat review';feedback=r.reason??'Proceeding to the next frozen combat exposure.';if(mission!==before)persist(before);render();};
  const closeCombat=app.querySelector('#combat-close');if(closeCombat)closeCombat.onclick=()=>{combatOpen=false;persist();render();};
  if(aar){app.querySelector('#review-aar').onclick=()=>{phoneNotifications.reset();cardDrawNotifications.prime(drawIdentity(),getVisibleEvents(mission));const report=app.querySelector('#aar');report.setAttribute('tabindex','-1');report.scrollIntoView({block:'start'});report.focus({preventScroll:true});};app.querySelector('#result-replay').onclick=()=>download(`${mission.mission_rules?.tinchebray?"tinchebray":mission.mission_rules?.vire?"vire":"company"}-${seed}-replay.json`,exportReplay(mission));app.querySelector('#result-aar').onclick=()=>download(`${mission.mission_rules?.tinchebray?"tinchebray":mission.mission_rules?.vire?"vire":"company"}-${seed}-aar.json`,aar);}
  app.querySelector('#back-to-map').onclick=()=>{app.querySelector('.battlefield-stage').scrollIntoView({block:'start'});app.querySelector('.map-viewport').focus({preventScroll:true});};
  app.querySelector('#clear-selection').onclick=()=>{selected=null;selectedPdf=null;ordersScroll=0;persist();render();};
  app.querySelector('.map-layer').onclick=e=>{if(!e.target.closest('button,details,.pdf-badge,.command-link')){selected=null;persist();render();}};
  app.querySelector('#resume').onclick=()=>resume('latest');app.querySelector('#restore').onclick=()=>resume('turnStart');
  app.querySelector('#save-export').onclick=()=>download('company-recovery.json',recovery.raw);
  app.querySelector('#previous-export').onclick=()=>{try{const raw=localStorage.getItem(`${recoveryKey(currentSaveId())}-previous`);if(raw)download('company-prior-save.json',raw);else{feedbackKind='File';feedback='No prior replacement backup.';render();}}catch(e){storageError=e.message;render();}};
  const reopen=app.querySelector('#reopen-combat');if(reopen)reopen.onclick=()=>{combatOpen=true;persist();render();};
  app.querySelectorAll('[data-roster-unit]').forEach(b=>b.onclick=()=>{selected=b.dataset.rosterUnit;ordersScroll=0;persist();render();app.querySelector('#unit')?.focus();});
  app.querySelector('#unit').onchange=e=>{selectedVehicle=null;selected=e.target.value||null;action='';target='';contributors=[];ordersScroll=0;persist();render();};
  if(opt){app.querySelector('#action').onchange=e=>{action=e.target.value;target='';contributors=[];persist();render();};const t=app.querySelector('#target');if(t)t.onchange=e=>{target=e.target.value;persist();render();};
    app.querySelectorAll('[data-contributor]').forEach(box=>box.onchange=e=>{contributors=e.target.checked?[...contributors,e.target.dataset.contributor]:contributors.filter(id=>id!==e.target.dataset.contributor);persist();render();});
    const issueOrder=()=>{const before=mission;const vehicleActivation=companyVehicleActivationOperation(mission,{type:action,unit_id:selected,issuer_id:issuer,target_id:target});if(vehicleActivation){try{mission=submitVehicleInteraction(mission,vehicleActivation);feedbackKind='Last order';feedback=`${name(target)} activated. Complete Company HQ’s impulse, then select its subordinate impulse.`;persist(before);}catch(error){feedbackKind='Last order';feedback=error.message;}render();return;}const detached_load=['DETACH','DETACH_FIRE_TEAM'].includes(action)?{radios:[...app.querySelectorAll('[data-detach-radio]:checked')].map(e=>e.dataset.detachRadio),assets:Object.fromEntries([...app.querySelectorAll('[data-detach-asset]')].filter(e=>Number(e.value)>0).map(e=>[e.dataset.detachAsset,Number(e.value)])),ammo:Object.fromEntries([...app.querySelectorAll('[data-detach-ammo]')].filter(e=>Number(e.value)>0).map(e=>[e.dataset.detachAmmo,Number(e.value)]))}:null;const r=submitCommand(mission,{type:action,unit_id:selected,issuer_id:issuer,target_id:target||null,...(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(action)?{arrival_cover:app.querySelector('#arrival-cover')?.value??'open'}:{}),...(detached_load?{detached_load}:{}),...(app.querySelector('#exhort-order')?.checked?{exhort:true}:{}),...(action==='TRANSFER_EQUIPMENT'?{quantity:Number(app.querySelector('#transfer-quantity').value)}:{}),...(app.querySelector('#order-skill')?.value?{skill_id:app.querySelector('#order-skill').value}:{}),...(reconstitution?{contributor_ids:[selected,...chosenTeams.map(u=>u.id)]}:{})});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','COMMAND_RESOLVED'].includes(e.type)).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();};
    app.querySelector('#order').onclick=()=>action==='SPOT'?openSpottingMenu(app,{view:v,unit,target,cost:opt.cost,issuer:name(issuer),confirm:issueOrder}):issueOrder();}
  const gi=app.querySelector('#issuer');if(gi)gi.onchange=e=>{generalIssuer=e.target.value;render();};
  const battlefieldExport=app.querySelector('#battlefield-export');if(battlefieldExport)battlefieldExport.onclick=()=>{try{const record=exportScoutedBattlefield(mission);saveBattlefield(localStorage,record);download(`st-georges-${seed}-battlefield.json`,record);feedbackKind='Scouted terrain';feedback='Battlefield saved separately for Hill 192; source mission and roster unchanged.';render();}catch(error){storageError=error.message+' The original mission replay remains exportable.';render();}};
  app.querySelector('#export').onclick=()=>download(`${mission.mission_rules?.tinchebray?"tinchebray":mission.mission_rules?.vire?"vire":"company"}-${seed}-replay.json`,exportReplay(mission));
  app.querySelector('#abort').onclick=()=>{const before=mission;combatId=null;mission=abortMission(mission).state;feedbackKind='Mission outcome';feedback='Mission aborted. Review the AAR below.';persist(before);render();};
  app.querySelector('#fast-forward').onclick=()=>{if(mission.vire_runtime){feedbackKind='Explicit phases';feedback='Vehicle missions require explicit phase stepping.';render();return;}const before=mission;mission=endTurn(mission).state;feedbackKind='Previous segment';feedback='Diagnostic fast-forward complete; unused orders were skipped.';persist(before);render();};
  const ae=app.querySelector('#aar-export');if(ae)ae.onclick=()=>download(`${mission.mission_rules?.tinchebray?"tinchebray":mission.mission_rules?.vire?"vire":"company"}-${seed}-aar.json`,aar);
  const patrol=app.querySelector('#result-patrol');if(patrol)patrol.onclick=()=>showAttemptPreparation(true);
  const reattempt=app.querySelector('#result-reattempt');if(reattempt)reattempt.onclick=()=>showAttemptPreparation(false);
  const decline=app.querySelector('#result-decline-reattempt');if(decline)decline.onclick=()=>{const before=mission;mission=declineReattempt(mission).state;persist(before);render();};
  const campaignExport=app.querySelector('#campaign-export');if(campaignExport)campaignExport.onclick=()=>{try{const connected=currentSlot==='campaign'?readCompanyPreparation(localStorage):null;if(connected&&connected.roster.company_id===mission.roster_snapshot?.company_id){download('normandy-connected-company.json',connected);return;}const saved=readCampaign(localStorage,mission.mission_rules?.rosterKey);if(saved.error||!saved.record)throw new Error(saved.error??'No company roster is saved.');download(mission.mission_rules?.tinchebray?'tinchebray-standalone-company-roster.json':mission.mission_rules?.vire?'vire-standalone-company-roster.json':mission.mission_rules?.hill192?'hill-192-standalone-company-roster.json':mission.scenario_id==='normandy_5'?'st-germain-standalone-company-roster.json':mission.scenario_id==='normandy_3'?'st-georges-standalone-company-roster.json':mission.scenario_id==='normandy_2'?'cerisy-standalone-company-roster.json':'normandy-company-roster.json',saved.record);}catch(error){storageError=error.message;render();}};
  const debrief=app.querySelector('#result-debrief');if(debrief)debrief.onclick=()=>{try{if(currentSlot==='campaign'){openCampaign();return;}debriefAndSave(localStorage,mission,mission.mission_rules.rosterKey);feedbackKind='Company roster';feedback='Mission losses recorded once in the company roster.';render();}catch(error){storageError=error.message;render();}};
}
if(vireDevelopment){
 if(vehicleBoot)restorePresentation(vehicleBoot.presentation);
 else if(!vehicleBootError)try{startStandaloneRoster(localStorage,createVireRoster(),mission.mission_rules.rosterKey);saveVireRecovery(localStorage,mission,presentation());}catch(e){vehicleBootError=e.message;}
 try{recovery=readVireRecovery(localStorage);}catch(e){storageError=e.message;}
 if(vehicleBootError)storageError=`Vehicle recovery unavailable: ${vehicleBootError}. Original save export remains available.`;
}
// Capture choices before their handlers redraw. Drafts never issue commands.
for(const type of ['input','change'])app.addEventListener(type,()=>{if(screen==='tactical'&&mission)tacticalDraft=capturePresentationDraft(app,draftContext());},true);
render();
