import {hill192DeploymentDefinition} from '../sim/company/hill192Setup.js';
import {exportScoutedBattlefield,saveBattlefield} from '../sim/company/battlefieldCarryover.js';
import {drawCommandLinks,commandLegend} from './commandPanel.js';
import {hqEventExplanation} from './hqEventPresentation.js';
import {formationGrid,bindUnitTooltips} from './formationGrid.js';
import {terrainMarkers} from './terrainMarkers.js';
import {resolveDisplayedExchange} from './combatExchange.js';
import {combatScreen} from './combatScreen.js';
import {terrainInformation,terrainFooter,hillStack,coverPositions,formationCover} from './terrainPresentation.js';
import {coverLabel,movingFormationIds,tacticalText} from './battlefieldPresentation.js';
import {openSpottingMenu} from './spottingMenu.js';
import {segmentReviews,segmentResultMarkup,previousSegment} from './segmentResults.js';
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
import {selectedOrder,completeCombatStage} from './orderPresentation.js';
import {signalOrderLabel,turnNoticeMarkup} from './turnNotice.js';
import { PHASES } from '../sim/company/engine.js';

const app=document.querySelector('#app');
let seed='company-1',mission=createMission(companyAssault,seed),selected=null,action='ACTIVATE',target='',generalIssuer='co',contributors=[];
let combatId=null,combatStage='pre',combatOpen=true,contactAcknowledged=null;
let recoveryResult=null,reviewId=null,turnNotice=false;
let commandLinks=false;
let selectedPdf=null,cleanupMap=null,camera=normalizeCamera(),ordersScroll=0,ordersSaveTimer=null;
let recovery={raw:null,bundle:null,error:null},storageError='',recoveryPending=false,turnStart=checkpoint(mission);
try{recovery=readRecovery(localStorage);recoveryPending=recovery.raw!==null;}catch(e){storageError=`Local storage unavailable: ${e.message}. Export replays manually.`;}
const presentation=()=>({commandLinks,camera,ordersScroll,selected,action,target,generalIssuer,contributors,selectedPdf,combatId,combatStage,combatOpen,contactAcknowledged,recoveryResult,reviewId,turnNotice,feedback,feedbackKind});
function persist(previous=null,replace=false){
  if(recoveryPending&&!replace)return;
  if(mission.status==='ACTIVE'&&(replace||previous&&(mission.turn!==previous.turn||mission.attempt_number!==previous.attempt_number)))turnNotice=true;
  if(replace||previous&&(mission.turn!==previous.turn||mission.attempt_number!==previous.attempt_number))turnStart=checkpoint(mission,presentation());
  try{saveRecovery(localStorage,mission,presentation(),{turnStart,replace});recovery=readRecovery(localStorage);storageError='';recoveryPending=false;}
  catch(e){storageError=`Save failed: ${e.message} Manual replay export remains available.`;}
}
function resume(which){
  try{const restored=resumeCheckpoint(playableMissionById(recovery.bundle?.[which]?.replay?.scenario),recovery.bundle?.[which]);mission=restored.state;seed=mission.seed;
    const p=restored.presentation;commandLinks=p.commandLinks===true;camera=normalizeCamera(p.camera);ordersScroll=Number.isFinite(p.ordersScroll)?Math.max(0,p.ordersScroll):0;selected=p.selected??null;action=p.action??'MOVE';target=p.target??'';generalIssuer=p.generalIssuer??'co';contributors=p.contributors??[];selectedPdf=p.selectedPdf??null;combatId=p.combatId??null;combatStage=completeCombatStage(p.combatStage??'pre');combatOpen=p.combatOpen??true;contactAcknowledged=p.contactAcknowledged??null;
    turnNotice=p.turnNotice??false;reviewId=p.reviewId??null;recoveryResult=p.recoveryResult??null;turnStart=recovery.bundle.turnStart;recoveryPending=false;feedbackKind='Recovery';feedback=`Restored turn ${mission.turn}, ${PHASES.find(p=>p[0]===mission.phase)[1]}.`;persist();
  }catch(e){storageError=`Cannot resume: ${e.message} The saved record is unchanged and can be exported.`;}
  render();
}
let cleanupTooltips=null,cleanupHeader=null,feedbackKind='Status';
let feedback='Advance through the opening segments to Company HQ’s activation impulse.';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const stateText=u=>`${u.steps} step${u.steps===1?'':'s'} · ${u.pinned?'PINNED · ':''}${({GOOD:u.pinned?'Original side':['HQ','STAFF'].includes(u.kind)?'Command side · no basic fire':u.kind==='FO'?'Observer side · no basic fire':'Good order',P:'Paralyzed',L:'Litter team',F:['HQ','STAFF'].includes(u.kind)?'Named Fire Team · command side unavailable':u.kind==='FO'?'Named Fire Team · observer capability unavailable':'Fire team',A:'Assault team'})[u.cohesion]??u.cohesion}${u.exposed?' · Exposed':''}`;
const active=u=>u.steps&&!u.removed;
function download(name,value){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
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
function render(){
  const mapObjectives=mission.patrol?{primary:{location:mission.patrol.plan.primary},ccp:{location:mission.patrol.plan.ccp},cop:{location:mission.patrol.plan.cop},concentration:{location:mission.patrol.plan.concentration},...Object.fromEntries(mission.patrol.plan.route.map((location,i)=>[`route ${i+1}`,{location,completed:i<mission.patrol.visited.length}]))}:null;
  const issuer=mission.impulse?.hq==='general'?generalIssuer:mission.impulse?.hq;
  const v=getPlayerView(mission,'friendly',issuer),events=getVisibleEvents(mission).map(e=>e.type==='HQ_EVENT'||e.type==='HQ_EVENT_CHOICE_REQUIRED'?{...e,text:hqEventExplanation({...e,final_row:mission.boundaries?.rows,hill192:!!mission.mission_rules.hill192},id=>v.locations.find(l=>l.id===id)?.name??id)}:e),aar=getAfterActionReport(mission);
  const unit=v.units.find(u=>u.id===selected)??v.units[0];
  const orderLabel=o=>o.type.startsWith('PYRO_')?`${o.label} — ${signalOrderLabel(mission.signal_plan?.[o.type.slice(5).toLowerCase()])}`:o.label;
  const name=id=>v.locations.find(l=>l.id===id)?.name??v.units.find(u=>u.id===id)?.name??v.enemies.find(u=>u.id===id)?.name??v.casualties.find(c=>c.id===id)?.label??v.assets.find(a=>a.id===id)?.label??coverLabel(v,id)??(id==='open'?'Out of cover':id==='general'?'General initiative':id);
  unit.options.sort((a,b)=>Number(b.available)-Number(a.available));
  const {option:opt,reason:orderReason}=selectedOrder(unit.options,action,target);
  const reconstitution=action==='RECONSTITUTE';
  const reconstitutionDonor=u=>u.kind==='LAT'||mission.mission_rules?.missionIdentity&&u.steps===1;
  const otherTeams=reconstitution?v.units.filter(u=>u.id!==unit.id&&u.steps===1&&!u.removed&&reconstitutionDonor(u)&&['A','F'].includes(u.cohesion)&&!u.pinned&&u.location===unit.location&&u.cover===unit.cover):[];
  const chosenTeams=otherTeams.filter(u=>contributors.includes(u.id));
  const restored=v.units.find(u=>u.id===target);
  const reason=reconstitution?(orderReason&&!orderReason.startsWith('Every contributor')?orderReason:!restored?'Choose a previously eliminated squad.':!unit.steps||!reconstitutionDonor(unit)||unit.pinned||!['A','F'].includes(unit.cohesion)?'Select an unpinned Fire or Assault Team.':chosenTeams.length<1?'Choose at least one additional team.':chosenTeams.length+1>(restored.max_steps??0)?`${restored.name} can hold at most ${restored.max_steps} steps.`:null):orderReason;
  const meaningful=events.filter(e=>!['CARDS_DRAWN','DECK_SHUFFLED','COMMAND_RESOLVED'].includes(e.type));
  const movementWarning=movementFireWarning(v,action,target);
  const previousTurn=events.filter(e=>e.turn===Math.max(1,v.turn-1));
  const combat=v.combat_resolution;
  if(combat&&combat.id!==combatId){combatId=combat.id;combatStage=combat.status==='RESOLVED'?'result':'pre';combatOpen=true;}
  if(!combat)combatId=null;
  const phaseIndex=PHASES.findIndex(p=>p[0]===v.phase);
  const recap=previousSegment(events,PHASES);
  const reviews=segmentReviews(events),review=reviews.find(r=>r.id===reviewId)??(recap?.id===reviewId?recap:null);
  const locked=recoveryPending||v.status!=='ACTIVE'||!!review||!!v.pending_support;
  const progress=v.segment_progress;
  const contact=v.contact_review?structuredClone(v.contact_review):null;
  const contactKey=contact?.resolved?`${v.turn}:${progress?.events_after}`:null;
  if(contact&&contactAcknowledged===contactKey&&contact.next_location){contact.location=contact.next_location;contact.resolved=false;contact.events=[];}
  const contactLocations=new Set(contact?[contact.location,...contact.events.flatMap(e=>[e.location,e.origin,e.target].filter(id=>v.locations.some(l=>l.id===id)))]:[]);
  const combatBlocked=progress?.phase==='COMBAT_EFFECTS'&&['awaiting_resolution','reviewing_result'].includes(progress.status)&&!!combat;
  const reviewCombat=!!combat&&!combatOpen&&!review;
  const advanceLabel=reviewCombat?'Review combat →':v.impulse?'Complete impulse →':progress?.phase==='COMBAT_EFFECTS'?(progress.status==='reviewing'?'Continue to cleanup →':combat?'Combat resolution open':'Resolve hidden effects →'):contact?(contact.resolved?(contact.next_location?'Continue to next contact →':'Continue to pinned recovery →'):'Resolve contact →'):'Resolve segment →';
  const reviewEvents=progress?events.filter(e=>e.sequence>progress.events_after&&!['PHASE_ENTERED','DECK_SHUFFLED'].includes(e.type)):[];
  const selectedPath=pdfPaths(v).find(p=>p.id===selectedPdf);
  const combatFocus=new Set([combat?.target_location,...(combat?.sources??[]).map(s=>s.origin),...(recoveryResult?.phase===v.phase?recoveryResult.locations:[])].filter(Boolean));
  cleanupTooltips?.();cleanupHeader?.();cleanupMap?.();clearTimeout(ordersSaveTimer);
  const movingIds=new Set(movingFormationIds(opt,target,!!selected&&!reason&&!locked));
  app.innerHTML=`${commandHeader({v,name,seed,recap,recovery,recoveryPending,locked,combatBlocked,reviewCombat,advanceLabel,phaseIndex,progress,feedback:tacticalText(v,feedback),feedbackKind})}
    ${aar?`<section class="mission-result" role="status"><h2>${mission.status==='PATROL_COMPLETE'?`Patrol ${mission.patrol_history.length} ${esc(mission.patrol_history.at(-1).outcome)}`:`Mission ${esc(aar.outcome)}`}</h2><p>${esc(finalFireMessage)}</p><p>${esc(aar.objectives.at(-1)?.text)}</p><button id="result-replay">Export replay</button><button id="result-aar">Export AAR (report)</button>${mission.mission_rules?.reattempts&&mission.mission_rules?.missionIdentity&&mission.status==='DEFEAT'&&mission.attempt_number===1&&!mission.reattempt_declined?'<button id="result-reattempt">Prepare second attempt</button><button id="result-decline-reattempt">End mission here</button>':''}${mission.status==='PATROL_COMPLETE'?'<button id="result-patrol">Prepare next patrol</button>':''}${mission.mission_rules?.missionIdentity?'<button id="campaign-export">Export company roster</button>':''}${mission.mission_rules?.missionIdentity&&mission.status!=='PATROL_COMPLETE'&&(!mission.mission_rules.reattempts||mission.status!=='DEFEAT'||mission.attempt_number===2||mission.reattempt_declined)?'<button id="result-debrief">Apply mission to company</button>':''}<a href="#aar">Review after-action report ↓</a></section>`:''}
    ${v.pending_support?`<section class="segment-review" aria-label="Battalion fire choice"><b>Three-burst artillery call: choose ordinary or battalion fire.</b><p>One mission has been expended. No additional command or draw is required.</p><button id="ordinary-support">Ordinary fire</button><label>Adjacent card 1<select id="support-adjacent-1">${v.pending_support.adjacent.map(id=>`<option value="${esc(id)}">${esc(name(id))}</option>`).join('')}</select></label><label>Adjacent card 2<select id="support-adjacent-2">${v.pending_support.adjacent.map((id,i)=>`<option value="${esc(id)}" ${i===1?'selected':''}>${esc(name(id))}</option>`).join('')}</select></label><button id="battalion-support">Add both cards</button></section>`:''}
    ${v.pending_event?.code==='RESUPPLY'?`<section class="segment-review" role="group" aria-label="Higher headquarters resupply"><b>Choose ammunition resupply</b><label>Type <select id="event-ammo-type"><option value="MG">Machine gun</option><option value="MTR">Mortar</option><option value="RKT">Rocket</option></select></label><label>Row 1 card <select id="event-ammo-location">${v.locations.filter(l=>l.row===1).map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></label></section>`:''}
    ${v.patrol?`<section class="segment-review" aria-label="Patrol progress"><b>Patrol ${v.patrol_history.length+(v.status==='ACTIVE'?1:0)} / 3 · Platoon ${v.patrol.plan.platoon}</b> · Route ${v.patrol.visited.length}/4 · Primary ${v.patrol.objective_visited?'visited':'pending'} · MLR return ${v.patrol.returned?'complete':'pending'}.<ol class="patrol-route-checklist" aria-label="Route point progress">${v.patrol.plan.route.map((id,i)=>`<li class="${i<v.patrol.visited.length?'complete':''}">${i<v.patrol.visited.length?'✓':'○'} Route ${i+1} · ${esc(name(id))} · ${i<v.patrol.visited.length?'Reached':i===v.patrol.visited.length?'Next':'Pending'}</li>`).join('')}</ol></section>`:''}
    ${mission.mission_rules?.missionIdentity?`<section class="segment-review" aria-label="Normandy mission status">${Object.entries(v.support_inventory).map(([agency,stock])=>`<b>${esc(agency)} remaining:</b> HE ${stock.HE??0} · WP ${stock.WP??0}${stock.TOT!==undefined?` · TOT ${stock.TOT}`:''}${stock.ILLUM!==undefined?` · Illum ${stock.ILLUM}`:''}.`).join(' ')} <b>Runners:</b> ${(v.runners??[]).filter(r=>r.status==='BOX').length} ready · ${(v.runners??[]).filter(r=>r.status==='DISPATCHED').length} dispatched. ${(v.phone_lines??[]).length?`<b>Phone lines:</b> ${v.phone_lines.filter(line=>!line.cut).length} intact · ${v.phone_lines.filter(line=>line.cut).length} cut. `:''}<b>Enemy tactics:</b> ${esc(v.enemy_tactics?.replaceAll('_',' ')??'Deliberate Defense')}${v.counterattack_ends_after?` · counterattack through turn ${v.counterattack_ends_after}`:''}.</section>`:''}
    ${storageError||recovery.error?`<p class="storage-warning" role="alert">${esc(storageError||recovery.error)}</p>`:''}
    ${recoveryPending?'<p class="recovery-prompt">A saved mission is available. Resume it, restore its turn start, or start a new mission.</p>':''}
    ${progress&&progress.phase!=='CONTACTS'?`<details class="segment-review"><summary>Combat results · ${esc(v.phase_label)} · ${progress.visible_resolved??0}/${progress.visible_total??0} visible</summary>${reviewEvents.length?reviewEvents.map(e=>`<p>${esc(tacticalText(v,e.text))}</p>`).join(''):'<p>No resolved combat effects yet.</p>'}${progress.phase==='COMBAT_EFFECTS'&&combat?'<button id="reopen-combat">Open current combat</button>':''}<p>Next: ${esc(PHASES[(phaseIndex+1)%PHASES.length][1])}</p></details>`:''}
    ${combat&&combatOpen&&!review?combatScreen(combat,v,name,combatStage):''}
    <div class="company-workspace"><section class="battlefield-column" aria-label="Battlefield">
    ${selectedPath?`<p class="selected-fire-path" role="status">PDF trace: ${esc(selectedPath.label)} Path: ${selectedPath.cards.map(name).map(esc).join(' → ')}. ${esc(v.fire.filter(f=>`${f.origin}|${f.target}|${f.friendly?'friendly':f.source?'enemy':'unknown'}`===selectedPdf).map(f=>fireExplanation(v,f)).join(' '))}</p>`:''}
    <div class="battlefield-stage"><div class="map-viewport" tabindex="0" aria-label="Scrollable battlefield"><div class="map-canvas"><div class="map-layer"><svg id="fire-overlay" aria-hidden="true"></svg><svg id="command-link-overlay" aria-label="Friendly command network"></svg><div class="company-map" style="grid-template-columns:repeat(${Math.max(...v.locations.map(l=>l.col))-Math.min(...v.locations.map(l=>l.col))+1},minmax(0,1fr))">${[...v.locations].sort((a,b)=>b.row-a.row||a.col-b.col).map(l=>{
      const own=v.units.filter(u=>active(u)&&u.location===l.id),enemy=v.enemies.filter(u=>!u.removed&&u.steps&&u.location===l.id),pc=v.contacts.filter(c=>c.location===l.id&&!c.resolved),fire=v.fire.filter(f=>f.target===l.id),support=v.support.filter(f=>f.location===l.id);
      return `${v.patrol&&l.row===1&&l.col===Math.min(...v.locations.map(t=>t.col))?`<div class="mlr-boundary" role="separator" aria-label="Main Line of Resistance between Rows 1 and 2" style="grid-column:1 / -1;grid-row:${Math.max(...v.locations.map(t=>t.row))}"><span>MLR · Main Line of Resistance · cross from Row 2 to Row 1 to return</span></div>`:''}<div class="terrain-stack ${!selected||l.id===unit.location||unit.los.includes(l.id)?'':'stack-outside-los'}" style="${v.patrol||v.locations.some(t=>t.outside_boundary)?`grid-column:${l.col-Math.min(...v.locations.map(t=>t.col))+1};grid-row:${Math.max(...v.locations.map(t=>t.row))-l.row+1+(v.patrol&&l.row<=1?1:0)}`:''}" ><article data-location="${l.id}" class="terrain-card ${!selected||l.id===unit.location||unit.los.includes(l.id)?'in-los':'outside-los'} ${combatFocus.has(l.id)||contactLocations.has(l.id)?'combat-focus':''} ${combat?.target_location===l.id?'combat-target':''} ${selectedPath?.cards.includes(l.id)?'selected-pdf-card':''} ${l.staging?'staging':''} ${fire.length||support.length?'incoming':''}">${terrainBorders(l)}<div class="terrain-header"><h3>${esc(l.name)}</h3>${l.staging||l.known===false?'':`<span class="protection">+${l.protection}</span>`}</div>
      ${terrainInformation(l,selected&&l.known!==false?unit.los_explanations[l.id].reason:'')}
      ${terrainMarkers(l,pc,mapObjectives??v.objectives)}${v.markers.filter(m=>m.type==='ILLUMINATION'&&m.location===l.id).map(m=>`<span class="contact-badge">${esc(m.delivery)} illumination −${m.center}${m.adjacent?` / adjacent −${m.adjacent}`:''}</span>`).join('')}${l.smoke?'<span class="contact-badge">Screening smoke</span>':''}
      ${contact?.location===l.id?`<section class="card-contact" aria-label="Contact resolution"><h4>${contact.resolved?'Contact result':'Evaluate potential contact'}</h4>${contact.events.map(e=>`<p>${esc(tacticalText(v,e.text))}</p>`).join('')}<button data-contact-progress ${locked?'disabled':''}>${esc(advanceLabel)}</button></section>`:contact&&pc.length&&contact.eligible_locations.includes(l.id)?'<small>Queued this segment</small>':''}
      <div class="fire-markers">${fireMarkers(v,l).map(m=>`<details class="counter-marker"><summary title="${esc(m.label)}">${markerSummary(m)}</summary><p>${esc(m.detail)}</p></details>`).join('')}</div>
      ${pdfDirections(v,l).map(d=>`<button type="button" class="pdf-badge ${d.side}" data-pdf-path="${esc(`${d.paths[0].origin}|${d.paths[0].target}|${d.paths[0].side}`)}" style="--x:${50+d.dc*45}%;--y:${50-d.dr*45}%;--angle:${d.angle}deg" title="${esc(d.label)}" aria-label="${esc(d.label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 13H15V22H9V13H2Z"/></svg>PDF</button>`).join('')}
      ${formationGrid(l,own,enemy,{selected,movingIds,infiltrating:action==='PLATOON_INFILTRATE'})}
      ${v.casualties.filter(c=>c.location===l.id&&!c.evacuated).map(c=>`<div class="casualty-marker"><b>✚ ${esc(c.label)}</b><small>${c.carrier_name?'Carried by '+esc(c.carrier_name):'Awaiting pickup'} · ${esc(c.cover?l.covers.find(x=>x.id===c.cover)?.type??'cover':'Out of cover')}</small></div>`).join('')}
      ${v.assets.filter(a=>a.location===l.id).map(a=>`<div class="equipment-marker"><b>▣ ${esc(a.label)}</b><small>${a.carrier_name?'Carried by '+esc(a.carrier_name):'Dropped here · recoverable'}</small></div>`).join('')}
      ${v.historical_losses.filter(e=>e.location===l.id).map(e=>`<div class="loss-silhouette"><span aria-hidden="true">♟</span><b>${esc(e.name)}</b><small>Turn ${e.turn} · Historical loss — no tactical effect</small></div>`).join('')}
      ${v.suspected.includes(l.id)&&!enemy.length?'<p class="suspected">Current unspotted position</p>':v.historical_reports.includes(l.id)&&!enemy.length?'<p class="historical">Historical firing report · not a current spotting target</p>':''}
      ${fire.length||support.length||pdfDirections(v,l).length?`<details class="card-fire-details"><summary>Fire details</summary>${pdfDirections(v,l).map(d=>`<p>${[...new Set(d.sources)].map(esc).join('<br>')}</p>`).join('')}${fire.length?`<p class="fire-label">Fire affecting card: ${fire.map(f=>`${f.friendly?'Friendly':f.source?'Enemy':'Unidentified'} from ${esc(name(f.origin))}${!([...(f.friendly?v.enemies:v.units)].some(u=>u.location===l.id&&u.steps&&!u.removed))?' · no known opposing recipient':''}`).join('; ')}. Same-card fire affects opposing formations only.</p>`:''}
      ${support.map(f=>`<p class="fire-label">${f.status==='PENDING'?'Pending':'Active'} indirect fire (${f.value})</p>`).join('')}</details>`:''}
      ${terrainFooter(l)}</article>${hillStack(l)}</div>`;
    }).join('')}</div></div></div></div>${mapControls()}${commandLinks?commandLegend:''}</div><details class="map-reference"><summary>Map key · LOS, fire and status markers</summary><p class="map-legend">LOS borders: white permits tracing through; dark green blocks tracing through at the same elevation. Adjacent cards remain visible unless smoke or other restrictions apply. Hills may overlook lower borders. Selected formation LOS: bright cards. Select an edge PDF badge to emphasize its path through terrain cards: green friendly · red enemy · amber unidentified. VOF counters mark affected cards; same-card fire has no outward PDF. Inspect counters for effects. PIN and EXPOSED badges belong to formations.</p></details>
    <details class="panel fire-report"><summary>Fire details and continuing fire</summary><p>Friendly formations do not automatically open fire into a card containing both friendly and enemy units. Established fire can continue after the enemy leaves or is captured. Cease/Shift Fire changes it; new eligible targets may trigger automatic fire again.</p>${v.fire.length?v.fire.map(f=>`<p>${esc(fireExplanation(v,f))} ${f.pdf_only?'No basic VOF':f.value===2?'Pinned fire +2':f.value===0?'Small arms 0':f.value===-1?'Automatic −1':'Heavy −3'}${f.origin!==f.target&&!f.indirect?` <button type="button" data-pdf-path="${esc(`${f.origin}|${f.target}|${f.friendly?'friendly':f.source?'enemy':'unknown'}`)}">Trace path</button>`:''}</p>`).join(''):'<p>No automatic fire established. Units will open fire when a valid spotted target is in range.</p>'}</details>
    <details class="panel history"><summary>Tactical record · previous results</summary><ol>${meaningful.slice(-45).reverse().map(e=>`<li><span class="event-turn">T${e.turn}</span><span>${esc(tacticalText(v,e.text))}</span></li>`).join('')}</ol></details></section>
    <aside class="company-orders panel ${selected?'':'no-selection'}"><button class="back-to-map" id="back-to-map">↑ Battlefield</button><p class="selection-hint">Select a formation to inspect its LOS and orders.</p><div class="eyebrow">FORMATION ORDERS</div><label class="field">Selected formation<select id="unit"><option value="" ${selected?'':'selected'}>Show all terrain</option>${[...v.units].sort((a,b)=>Number(b.tactical_ready)-Number(a.tactical_ready)).map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${esc(u.name)}${u.tactical_ready?' · orders available':' · inspect only'}</option>`).join('')}</select></label>
    <div class="selected-unit-heading">${formationCounter(unit)}<div><h2>${esc(unit.name)}</h2><p>${esc(unit.transition_description??stateText(unit))}</p></div></div><p class="muted">${esc(name(unit.location))} · ${esc(unit.experience)} experience${unit.radios.length?' · '+esc(unit.radios.join(' / '))+' radio':''}</p>

    ${v.impulse?.hq==='general'?`<label class="field">HQ for HQ-only actions<select id="issuer">${v.units.filter(u=>active(u)&&['HQ','STAFF'].includes(u.kind)).map(u=>`<option value="${u.id}" ${u.id===generalIssuer?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>`:''}
    ${unit.skills?.length?`<p>Unused skills: ${unit.skills.map(p=>esc(p.label)).join(', ')}</p>`:''}
    ${unit.automatic_skill?`<p>${esc(unit.automatic_skill)}.</p>`:''}
    ${unit.combat?`<p class="danger">Under fire · NCM ${unit.combat.ncm>=0?'+':''}${unit.combat.ncm}${unit.exposed?' · exposed':''}</p>`:''}
    ${opt?`<label class="field">Order<select id="action">${unit.options.map(o=>`<option value="${o.type}" ${o.type===action?'selected':''} ${o.available?'':'disabled'} title="${esc(o.reason)}">${o.available?'●':'○'} ${esc(orderLabel(o))} (${o.cost})</option>`).join('')}</select></label>
      ${opt.targeted?`<label class="field">${action==='CREATE_RUNNER'?'Donor (loses one step)':reconstitution?'Restore eliminated squad':'Target'}<select id="target"><option value="" ${target?'':'selected'}>Choose target</option>${!opt.targets.some(t=>t.id===target)&&target?`<option value="${esc(target)}" selected disabled>${esc(name(target))} · unavailable</option>`:''}${[...opt.targets].sort((a,b)=>Number(!!a.reason)-Number(!!b.reason)).map(t=>`<option value="${esc(t.id)}" ${t.id===target?'selected':''} ${t.reason?'disabled':''} title="${esc(t.reason)}">${esc(name(t.id))}${action==='CREATE_RUNNER'?` · ${v.units.find(u=>u.id===t.id)?.steps??0} step(s)${v.units.find(u=>u.id===t.id)?.steps===1?' · final step: unit removed, equipment dropped':''}`:''}${t.reason?(action==='ACTIVATE'&&v.units.find(u=>u.id===t.id)?.activated?' · already activated':' · unavailable'):''}</option>`).join('')}</select></label>`:''}
      ${reconstitution?`<fieldset class="reconstitution-teams"><legend>Contributing teams · same area</legend><p>Selected: ${esc(unit.name)}</p>${otherTeams.map(u=>`<label><input type="checkbox" data-contributor="${esc(u.id)}" ${contributors.includes(u.id)?'checked':''}> ${esc(u.name)}</label>`).join('')||'<p>No other eligible teams here.</p>'}<small>Choose 2–4 teams total, within the restored counter’s ${restored?.max_steps??'selected'}-step capacity.</small></fieldset>`:''}
      ${opt.skills?.length?`<label class="field">One-use skill<select id="order-skill">${action.startsWith('SKILL_')?'':'<option value="">Use no skill</option>'}${opt.skills.map(skill=>`<option value="${esc(skill.id)}">${esc(skill.label)} · ${esc(name(skill.holder))}</option>`).join('')}</select></label>`:''}
      ${movementWarning?`<p class="danger" role="alert">${esc(movementWarning)}</p>`:''}
      ${action==='CREATE_RUNNER'?`<p>A runner takes one existing step from the chosen donor and waits in the off-map CO HQ runner box. Dispatch it in a separate order. ${target===selected&&unit.steps===1?'This consumes the selected unit’s final step.':''}</p>`:''}
      <p class="command-preview"><b>Command:</b> ${esc(name(issuer)??'No issuer')} → ${esc(unit.name)} · ${esc(orderLabel(opt))}${opt.targeted?' → '+esc(target?name(target):'Choose target'):''}${reconstitution?` · Contributors: ${esc([unit.name,...chosenTeams.map(u=>u.name)].join(', '))}`:''} · ${opt.cost} command${opt.cost===1?'':'s'}</p>
      <button id="order" class="primary" ${reason||locked||!selected?'disabled':''}>${action==='SPOT'?'Open Spotting Menu':`Issue order · ${opt.cost} command${opt.cost===2?'s':''}`}</button>
      <p class="reason">${esc(reason??'Resolves immediately. Review the outcome before your next order.')}</p>`:'<p>This formation is no longer available.</p>'}
    <details class="order-feedback"><summary>${esc(feedbackKind)}</summary><p role="status">${esc(tacticalText(v,feedback))}</p></details>
    ${inlineInventory(unit,{locked})}
    <details id="order-eligibility"><summary>All order eligibility</summary>${unit.options.map(o=>`<p><b>${esc(orderLabel(o))}</b>: ${o.available?'Available':esc(o.reason)}</p>`).join('')}</details>
    <details id="named-personnel"><summary>Named personnel</summary><ul class="personnel">${v.personnel.filter(p=>p.origin===unit.id||unit.personnel.includes(p.id)).map(p=>`<li>${esc(p.name)} · ${esc(p.status)}</li>`).join('')}</ul></details>
    <details id="casualty-evacuation"><summary>Casualty evacuation</summary>${v.casualties.length?v.casualties.map(c=>`<p>${esc(c.label)} · ${c.evacuated?'Evacuated':c.carrier_name?'Carried by '+esc(c.carrier_name):'Awaiting pickup'} · ${esc(name(c.location))}</p>`).join(''):'<p>No friendly casualty steps recorded.</p>'}</details>
    <details id="turn-summary"><summary>Turn summary</summary><p>${previousTurn.filter(e=>e.type==='COMMAND_ISSUED').length} orders · ${previousTurn.filter(e=>e.type==='CASUALTY').length} observed casualty steps · ${previousTurn.filter(e=>e.type==='FORMATION_CHANGED').length} observed formation changes.</p></details>
    <details id="diagnostic-details"><summary>Diagnostics and card draws</summary><button id="fast-forward" ${locked?'disabled':''}>Skip remaining orders and finish turn</button><pre>${esc(JSON.stringify({phase:v.phase,impulse:v.impulse,combat:unit.combat,draws:events.filter(e=>e.type==='CARDS_DRAWN').slice(-20)},null,2))}</pre></details>
    <button class="abort" id="abort" ${locked?'disabled':''}>Abort mission</button></aside></div>
    ${aar?`<section id="aar" class="panel aar"><div class="eyebrow">AFTER-ACTION REPORT · PLAYER PERSPECTIVE</div><h2>${esc(aar.outcome)}</h2><p>${aar.orders.length} orders · ${aar.casualties.length} observed casualty steps · ${aar.formations.length} formation changes.</p><button id="aar-export">Export AAR (report)</button><h3>Objective</h3><p>${esc(aar.objectives.at(-1)?.text)}</p><details open><summary>Casualties and formation history</summary><ul>${[...aar.casualties,...aar.formations].sort((a,b)=>a.sequence-b.sequence).map(e=>`<li>T${e.turn}: ${esc(tacticalText(v,e.text))}</li>`).join('')}</ul></details><details><summary>Orders issued</summary><ol>${aar.orders.map(e=>`<li>T${e.turn}: ${esc(tacticalText(v,e.text))}</li>`).join('')}</ol></details></section>`:''}`;
  if(contact)app.querySelector('.battlefield-stage').insertAdjacentHTML('beforebegin',`<p class="contact-map-order">Pending contacts (map order): ${v.locations.filter(l=>contact.eligible_locations.includes(l.id)).sort((a,b)=>a.row-b.row||a.col-b.col).map(l=>esc(l.name)).join(' · ')||'None'}. Evaluation follows contact letters; random within each letter.</p>`);
  app.insertAdjacentHTML('beforeend',`${reviews.length?`<details class="segment-history"><summary>Segment result history</summary>${reviews.map(r=>`<button data-review="${r.id}">Turn ${r.turn} · ${esc(r.label)}</button>`).join('')}</details>`:''}${review?segmentResultMarkup(review,name):''}`);
  for(const [destination,selectors] of [
    ['#panel-mission',['#casualty-evacuation','#turn-summary','#abort','[aria-label="Normandy mission status"]']],
    ['#panel-roster',['#named-personnel']],
    ['#debug-content',['#order-eligibility','.map-reference','.fire-report','.history','.segment-history','.segment-review:not([aria-label="Battalion fire choice"]):not([aria-label="Higher headquarters resupply"]):not([aria-label="Normandy mission status"])','#diagnostic-details']]
  ])for(const selector of selectors){const element=app.querySelector(selector);if(element)app.querySelector(destination).append(element);}
  if(feedbackKind!=='Last order')app.querySelector('#debug-content').append(app.querySelector('.order-feedback'));
  const ordersPanel=app.querySelector('.company-orders');ordersPanel.scrollTop=ordersScroll;ordersPanel.onscroll=()=>{ordersScroll=ordersPanel.scrollTop;clearTimeout(ordersSaveTimer);ordersSaveTimer=setTimeout(()=>{persist();if(storageError&&!app.querySelector('.storage-warning'))render();},250);};
  cleanupTooltips=bindUnitTooltips(app);
  cleanupHeader=bindCommandHeader(app,{openFile:recoveryPending});
  cleanupMap=bindMapViewport(app,{camera,columns:Math.max(...v.locations.map(l=>l.col))-Math.min(...v.locations.map(l=>l.col))+1,selectedLocation:selected?unit.location:null,selectedUnit:selected,onChange:(value,save)=>{camera=value;if(save){persist();if(storageError&&!app.querySelector('.storage-warning'))render();}},onLayout:()=>drawFirePaths(v)});
  const commandToggle=app.querySelector('#command-links');commandToggle.checked=commandLinks;commandToggle.onchange=()=>{commandLinks=commandToggle.checked;persist();render();};
  app.querySelectorAll('[data-inline-unload]').forEach(b=>b.onclick=()=>{if(locked||!selected)return;const before=mission,r=submitCommand(mission,{type:b.dataset.inlineUnload,unit_id:selected,issuer_id:issuer});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();});
  app.querySelectorAll('[data-pdf-path]').forEach(button=>button.onclick=()=>{selectedPdf=button.dataset.pdfPath===selectedPdf?null:button.dataset.pdfPath;persist();render();});
  for(const [id,expanded]of [['ordinary-support',false],['battalion-support',true]]){const button=app.querySelector('#'+id);if(button)button.onclick=()=>{const before=mission,r=resolveSupportChoice(mission,{locations:expanded?[app.querySelector('#support-adjacent-1').value,app.querySelector('#support-adjacent-2').value]:[]});mission=r.state;feedback=r.reason??'Fire mission choice recorded.';if(mission!==before)persist(before);render();};}
  app.querySelector('#advance').onclick=()=>{if(reviewCombat){combatOpen=true;persist();render();return;}if(contact?.resolved&&contact.next_location&&contactAcknowledged!==contactKey){contactAcknowledged=contactKey;persist();render();return;}const previous=PHASES.find(p=>p[0]===mission.phase);const before=mission;const phaseOptions=mission.phase==='CAPTURE'?{friendlyRemainder:app.querySelector('#guard-remainder').value}:v.pending_event?{eventChoice:{ammo_type:app.querySelector('#event-ammo-type').value,location:app.querySelector('#event-ammo-location').value}}:{};const r=advancePhase(mission,phaseOptions);mission=r.state;const completed=segmentReviews(getVisibleEvents(mission).map(e=>e.type==='HQ_EVENT'||e.type==='HQ_EVENT_CHOICE_REQUIRED'?{...e,text:hqEventExplanation({...e,final_row:mission.boundaries?.rows,hill192:!!mission.mission_rules.hill192},id=>v.locations.find(l=>l.id===id)?.name??id)}:e)).findLast(e=>!events.some(old=>old.id===e.id));if(completed)reviewId=completed.id;recoveryResult=previous[0]==='PINNED_RECOVERY'?{phase:mission.phase,units:r.events.filter(e=>e.type==='AUTOMATIC_RECOVERY'&&!e.hidden).map(e=>before.units[e.actor]?.name).filter(Boolean),locations:r.events.filter(e=>e.type==='AUTOMATIC_RECOVERY'&&!e.hidden).map(e=>before.units[e.actor]?.location).filter(Boolean)}:null;feedbackKind=mission.phase===previous[0]?'Current segment result':'Previous segment';feedback=r.reason??`${previous[1]}: ${r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','PHASE_ENTERED'].includes(e.type)).at(-1)?.text??'Complete.'}`;if(previous[0]==='FIRE_MISSIONS'&&r.events.some(e=>e.type==='FIRE_ESTABLISHED'&&!e.hidden))feedback+=` Incoming markers updated; an established fire path may reopen or change its affected card.`;if(mission.impulse?.hq!=='general'&&mission.impulse?.hq)selected=mission.impulse.hq;if(mission!==before)persist(before);render();};
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
  app.querySelectorAll('[data-hq]').forEach(b=>b.onclick=()=>{const before=mission;const r=selectHQ(mission,b.dataset.hq);mission=r.state;selected=b.dataset.hq;ordersScroll=0;feedbackKind='HQ selection';feedback=r.events.at(-1)?.text??r.reason;if(mission!==before)persist(before);render();});
  app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{selected=b.dataset.unit;ordersScroll=0;persist();render();});
  const resolveButton=app.querySelector('#combat-resolve');if(resolveButton)resolveButton.onclick=()=>{const before=mission,r=resolveDisplayedExchange(mission,(previous,next)=>{mission=next;persist(previous);});mission=r.state;combatStage='result';feedbackKind='Combat result';feedback=r.reason??`Combat resolved: ${getPlayerView(mission).combat_resolution?.result}.`;if(mission!==before)persist(before);render();};

  const nextCombat=app.querySelector('#combat-next');if(nextCombat)nextCombat.onclick=()=>{const before=mission,r=advancePhase(mission);mission=r.state;combatId=null;combatStage='pre';combatOpen=true;feedbackKind='Combat review';feedback=r.reason??'Proceeding to the next frozen combat exposure.';if(mission!==before)persist(before);render();};
  const closeCombat=app.querySelector('#combat-close');if(closeCombat)closeCombat.onclick=()=>{combatOpen=false;persist();render();};
  if(aar){app.querySelector('#result-replay').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));app.querySelector('#result-aar').onclick=()=>download(`company-${seed}-aar.json`,aar);}
  app.querySelector('#back-to-map').onclick=()=>{app.querySelector('.battlefield-stage').scrollIntoView({block:'start'});app.querySelector('.map-viewport').focus({preventScroll:true});};
  app.querySelector('#clear-selection').onclick=()=>{selected=null;selectedPdf=null;ordersScroll=0;persist();render();};
  app.querySelector('.map-layer').onclick=e=>{if(!e.target.closest('button,details,.pdf-badge,.command-link')){selected=null;persist();render();}};
  app.querySelector('#resume').onclick=()=>resume('latest');app.querySelector('#restore').onclick=()=>resume('turnStart');
  app.querySelector('#save-export').onclick=()=>download('company-recovery.json',recovery.raw);
  app.querySelector('#previous-export').onclick=()=>{try{const raw=localStorage.getItem(`${SAVE_KEY}-previous`);if(raw)download('company-prior-save.json',raw);else{feedbackKind='File';feedback='No prior replacement backup.';render();}}catch(e){storageError=e.message;render();}};
  const reopen=app.querySelector('#reopen-combat');if(reopen)reopen.onclick=()=>{combatOpen=true;persist();render();};
  app.querySelectorAll('[data-roster-unit]').forEach(b=>b.onclick=()=>{selected=b.dataset.rosterUnit;ordersScroll=0;persist();render();app.querySelector('#unit')?.focus();});
  app.querySelector('#unit').onchange=e=>{selected=e.target.value||null;ordersScroll=0;persist();render();};
  if(opt){app.querySelector('#action').onchange=e=>{action=e.target.value;target='';contributors=[];persist();render();};const t=app.querySelector('#target');if(t)t.onchange=e=>{target=e.target.value;persist();render();};
    app.querySelectorAll('[data-contributor]').forEach(box=>box.onchange=e=>{contributors=e.target.checked?[...contributors,e.target.dataset.contributor]:contributors.filter(id=>id!==e.target.dataset.contributor);persist();render();});
    const issueOrder=()=>{const before=mission;const r=submitCommand(mission,{type:action,unit_id:selected,issuer_id:issuer,target_id:target||null,...(app.querySelector('#order-skill')?.value?{skill_id:app.querySelector('#order-skill').value}:{}),...(reconstitution?{contributor_ids:[selected,...chosenTeams.map(u=>u.id)]}:{})});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','COMMAND_RESOLVED'].includes(e.type)).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();};
    app.querySelector('#order').onclick=()=>action==='SPOT'?openSpottingMenu(app,{view:v,unit,target,cost:opt.cost,issuer:name(issuer),confirm:issueOrder}):issueOrder();}
  const gi=app.querySelector('#issuer');if(gi)gi.onchange=e=>{generalIssuer=e.target.value;render();};
  const missionSelect=app.querySelector('#mission-select');
  const availability=()=>{const entry=missionCatalog.find(m=>m.id===missionSelect.value);app.querySelector('#restart').disabled=!!entry?.unavailable;app.querySelector('#preview-setup').disabled=!entry?.scenario?.map;app.querySelector('#mission-availability').textContent=entry?.unavailable?'Unavailable: '+entry.unavailable:'';};
  missionSelect.onchange=availability;availability();
  const startMission=(definition,nextSeed,setup={})=>{
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
    mission=next;seed=nextSeed;commandLinks=false;camera=normalizeCamera();ordersScroll=0;combatId=null;combatStage='pre';combatOpen=true;contactAcknowledged=null;selected='co';action='ACTIVATE';target='';contributors=[];selectedPdf=null;recoveryResult=null;reviewId=null;
    feedbackKind='Status';feedback=`${mission.mission_name} started with seed ${seed}.`;recoveryPending=false;persist(null,true);render();
  };
  const setupMission=()=>{
    const definition=missionById(missionSelect.value),nextSeed=app.querySelector('#seed').value.trim()||seed;
    const result=openMissionSetup(app,definition,nextSeed,definition.readiness?.playable!==false?setup=>startMission(definition,nextSeed,setup):null);
    if(result.error)app.querySelector('#mission-availability').textContent=result.error;
  };
  app.querySelector('#preview-setup').onclick=setupMission;
  app.querySelector('#restart').onclick=()=>{const definition=playableMissionById(missionSelect.value);if(definition.map){setupMission();return;}startMission(definition,app.querySelector('#seed').value.trim()||'company-1');};
  const battlefieldExport=app.querySelector('#battlefield-export');if(battlefieldExport)battlefieldExport.onclick=()=>{try{const record=exportScoutedBattlefield(mission);saveBattlefield(localStorage,record);download(`st-georges-${seed}-battlefield.json`,record);feedbackKind='Scouted terrain';feedback='Battlefield saved separately for Hill 192; source mission and roster unchanged.';render();}catch(error){storageError=error.message+' The original mission replay remains exportable.';render();}};
  app.querySelector('#export').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));
  app.querySelector('#abort').onclick=()=>{const before=mission;combatId=null;mission=abortMission(mission).state;feedbackKind='Mission outcome';feedback='Mission aborted. Review the AAR below.';persist(before);render();};
  app.querySelector('#fast-forward').onclick=()=>{const before=mission;mission=endTurn(mission).state;feedbackKind='Previous segment';feedback='Diagnostic fast-forward complete; unused orders were skipped.';persist(before);render();};
  const ae=app.querySelector('#aar-export');if(ae)ae.onclick=()=>download(`company-${seed}-aar.json`,aar);
  const patrol=app.querySelector('#result-patrol');if(patrol)patrol.onclick=()=>openPatrolSetup(app,mission,next=>{const previous=mission;mission=next;selected=`hq${next.patrol.plan.platoon}`;feedbackKind='Patrol preparation';feedback='Next patrol prepared. Continue explicit phase stepping.';persist(previous);render();});
  const reattempt=app.querySelector('#result-reattempt');if(reattempt)reattempt.onclick=()=>openReattemptSetup(app,mission,next=>{const previous=mission;mission=next;selected='co';feedbackKind='Mission reattempt';feedback='Second attempt prepared. Continue explicit phase stepping.';persist(previous);render();});
  const decline=app.querySelector('#result-decline-reattempt');if(decline)decline.onclick=()=>{const before=mission;mission=declineReattempt(mission).state;persist(before);render();};
  const campaignExport=app.querySelector('#campaign-export');if(campaignExport)campaignExport.onclick=()=>{try{const saved=readCampaign(localStorage,mission.mission_rules?.rosterKey);if(saved.error||!saved.record)throw new Error(saved.error??'No company roster is saved.');download(mission.mission_rules?.hill192?'hill-192-standalone-company-roster.json':mission.scenario_id==='normandy_5'?'st-germain-standalone-company-roster.json':mission.scenario_id==='normandy_3'?'st-georges-standalone-company-roster.json':mission.scenario_id==='normandy_2'?'cerisy-standalone-company-roster.json':'normandy-company-roster.json',saved.record);}catch(error){storageError=error.message;render();}};
  const debrief=app.querySelector('#result-debrief');if(debrief)debrief.onclick=()=>{try{debriefAndSave(localStorage,mission,mission.mission_rules.rosterKey);feedbackKind='Company roster';feedback='Mission losses recorded once in the company roster.';render();}catch(error){storageError=error.message;render();}};
}
render();
