import {openMissionSetup} from './missionSetup.js';
import {missionCatalog,missionById,playableMissionById} from '../scenarios/missions.js';
import {commandHeader,bindCommandHeader} from './commandHeader.js';
import {terrainBorders} from './terrainBorders.js';
import {movementFireWarning,markerSummary,finalFireMessage} from './firePresentation.js';
import '../style.css';
import './company.css';
import { createMission, submitCommand, advancePhase, resolveCombat, abortMission, endTurn, getPlayerView, getVisibleEvents, getAfterActionReport, selectHQ, exportReplay } from '../sim/index.js';
import { companyAssault } from '../scenarios/companyAssault.js';
import { resultingFormationText } from './combatPlayback.js';
import {readRecovery,saveRecovery,resumeCheckpoint,checkpoint,SAVE_KEY} from './localRecovery.js';
import {fireMarkers,pdfDirections,pdfPaths,fireExplanation} from './fireMarkers.js';
import {selectedOrder,completeCombatStage,combatArt,supportContext} from './orderPresentation.js';
import { PHASES } from '../sim/company/engine.js';

const app=document.querySelector('#app');
let seed='company-1',mission=createMission(companyAssault,seed),selected=null,action='ACTIVATE',target='',generalIssuer='co',contributors=[];
let combatId=null,combatStage='pre',combatOpen=true,contactAcknowledged=null;
let recoveryResult=null;
let selectedPdf=null,firePathObserver=null;
let recovery={raw:null,bundle:null,error:null},storageError='',recoveryPending=false,turnStart=checkpoint(mission);
try{recovery=readRecovery(localStorage);recoveryPending=recovery.raw!==null;}catch(e){storageError=`Local storage unavailable: ${e.message}. Export replays manually.`;}
const presentation=()=>({selected,action,target,generalIssuer,contributors,selectedPdf,combatId,combatStage,combatOpen,contactAcknowledged,recoveryResult,feedback,feedbackKind});
function persist(previous=null,replace=false){
  if(recoveryPending&&!replace)return;
  if(replace||previous&&mission.turn!==previous.turn)turnStart=checkpoint(mission,presentation());
  try{saveRecovery(localStorage,mission,presentation(),{turnStart,replace});recovery=readRecovery(localStorage);storageError='';recoveryPending=false;}
  catch(e){storageError=`Save failed: ${e.message} Manual replay export remains available.`;}
}
function resume(which){
  try{const restored=resumeCheckpoint(playableMissionById(recovery.bundle?.[which]?.replay?.scenario),recovery.bundle?.[which]);mission=restored.state;seed=mission.seed;
    const p=restored.presentation;selected=p.selected??null;action=p.action??'MOVE';target=p.target??'';generalIssuer=p.generalIssuer??'co';contributors=p.contributors??[];selectedPdf=p.selectedPdf??null;combatId=p.combatId??null;combatStage=completeCombatStage(p.combatStage??'pre');combatOpen=p.combatOpen??true;contactAcknowledged=p.contactAcknowledged??null;
    recoveryResult=p.recoveryResult??null;turnStart=recovery.bundle.turnStart;recoveryPending=false;feedbackKind='Recovery';feedback=`Restored turn ${mission.turn}, ${PHASES.find(p=>p[0]===mission.phase)[1]}.`;persist();
  }catch(e){storageError=`Cannot resume: ${e.message} The saved record is unchanged and can be exported.`;}
  render();
}
let cleanupHeader=null,feedbackKind='Status';
let feedback='Advance through the opening segments to Company HQ’s activation impulse.';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const stateText=u=>`${u.steps} step${u.steps===1?'':'s'} · ${u.pinned?'PINNED · ':''}${({GOOD:u.pinned?'Original side':['HQ','STAFF'].includes(u.kind)?'Command side · no basic fire':u.kind==='FO'?'Observer side · no basic fire':'Good order',P:'Paralyzed',L:'Litter team',F:['HQ','STAFF'].includes(u.kind)?'Named Fire Team · command side unavailable':u.kind==='FO'?'Named Fire Team · observer capability unavailable':'Fire team',A:'Assault team'})[u.cohesion]??u.cohesion}${u.exposed?' · Exposed':''}`;
const active=u=>u.steps&&!u.removed;
const pct=n=>`${Math.round(n*100)}%`;
function combatScreen(c,v,name){
  const source=c.strongest,sourceFaction=source?.faction==='friendly'?'US':'GER',targetFaction=c.target_faction==='friendly'?'US':'GER';
  const sourceImage=source?.known?`${sourceFaction}_COMBAT_PRE.png`:'GER_COMBAT_UNSPOTTED.png';
  const targetImage=`${targetFaction}_COMBAT_${combatStage==='pre'||!c.result?'PRE':c.result}.png`;
  const modifiers=c.modifiers.filter(m=>m.value||['FIRE','TERRAIN'].includes(m.source));
  const extras=c.sources.filter(s=>s.known&&!(s.source_id===source?.source_id&&s.kind===source?.kind&&s.origin===source?.origin)).map(s=>s.label);
  const effect=c.status==='RESOLVED'&&c.result==='HIT';
  const support=supportContext(source);
  return `<section class="combat-resolution" aria-label="Combat resolution"><header><div class="eyebrow">COMBAT RESOLUTION · INCOMING FIRE AGAINST ${esc(c.target_name)}</div><h2>${esc(name(c.target_location))}</h2><p>Stakes were frozen before any result. Fire remains active after resolution.</p></header>
    <div class="combat-split"><article class="combat-side attacker"><div class="combat-unit-head"><div><small>ATTACK CONTEXT</small><h3>${esc(source?.label??'Combat effect')}</h3><p>${esc(source?.origin?name(source.origin):name(c.target_location))}</p></div><span class="combat-state">${esc(support?'SUPPORT EFFECT':source?.known?'ACTIVE FIRE':'UNSPOTTED')}</span></div>
      ${support?`<div class="support-art" role="img" aria-label="${esc(source.label)}"><strong>${esc(source.label)}</strong><p>Support effect · artwork pending</p></div>`:`<img class="combat-art ${combatArt(sourceImage,'attacker').flip?'flip':''}" src="/assets/images/${sourceImage}" alt="${esc(source?.known?source.label:'Unidentified enemy fire')}">`}
      <dl class="combat-context"><div><dt>Effect</dt><dd>${source?.vof>=0?'+':''}${source?.vof??'—'} VOF</dd></div><div><dt>Relationship</dt><dd>Active</dd></div>${extras.length?`<div><dt>Other visible sources</dt><dd>${esc(extras.join(', '))}</dd></div>`:''}</dl></article>
    <article class="combat-side defender"><div class="combat-unit-head"><div><small>RECEIVING FORMATION</small><h3>${esc(c.target_name)}</h3><p>${c.target_steps} step${c.target_steps===1?'':'s'} · ${esc(c.target_experience)}</p></div><span class="combat-state ${c.target_pinned?'danger':''}">${esc(c.target_pinned?'PINNED':c.target_cohesion==='GOOD'?'EFFECTIVE':c.target_cohesion)}</span></div>
      <img class="combat-art ${combatArt(targetImage,'defender').flip?'flip':''}" src="/assets/images/${targetImage}" alt="${esc(c.target_name)} ${esc(c.result??'before resolution')}">
      <div class="modifier-card"><h4>NCM MODIFIERS · RECEIVING FIRE</h4>${modifiers.map(m=>`<p><span>${esc(m.label)}</span><b>${m.value>=0?'+':''}${m.value}</b></p>`).join('')}<p class="ncm-total"><span>NCM${c.total!==c.ncm?` · raw ${c.total>=0?'+':''}${c.total}, bounded`:''}</span><b>${c.ncm>=0?'+':''}${c.ncm}</b></p></div></article></div>
    <div class="probability-panel"><h3>INCOMING FIRE RESULT · NCM ${c.ncm>=0?'+':''}${c.ncm}</h3><div class="probability-bars">${['MISS','PIN','HIT'].map(result=>`<div class="probability ${result.toLowerCase()}"><b>${result}</b><strong>${pct(c.probabilities.probabilities[result])}</strong><span><i style="width:${pct(c.probabilities.probabilities[result])}"></i></span><small>${c.probabilities.counts[result]} / ${c.probabilities.total} deck outcomes</small></div>`).join('')}</div>
      <details><summary>If HIT · ${esc(c.target_experience)} hit-effect stakes</summary><div class="hit-grid">${Object.entries(c.hit_probabilities.probabilities).map(([key,value])=>`<span><b>${esc(key)}</b> ${pct(value)}</span>`).join('')}</div></details></div>
    ${combatStage==='result'&&c.result?`<div class="combat-reveal ${c.result.toLowerCase()}"><h3>${esc(c.result)}</h3><p>${c.result==='MISS'?'No hit; any pin is removed.':c.result==='PIN'?'The receiving formation is pinned.':'A hit occurred. Its complete effect is shown below.'}</p></div>`:''}
    ${effect?`<div class="combat-reveal hit"><h3>HIT EFFECT · ${esc(c.hit_effect)}</h3><p>${esc(resultingFormationText(c))}</p>${c.casualty_steps?`<p>${c.casualty_steps} casualty step${c.casualty_steps===1?'':'s'}.</p>`:''}</div>`:''}
    <footer>${c.status==='PENDING'?'<button id="combat-resolve" class="primary">Resolve</button>':'<button id="combat-next" class="primary">Next combat →</button>'}<button id="combat-close">Close to tactical map</button></footer></section>`;
}
function download(name,value){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function drawFirePaths(view){
  const layer=app.querySelector('.map-layer'),svg=app.querySelector('#fire-overlay');if(!layer||!svg)return;
  const frame=layer.getBoundingClientRect();svg.setAttribute('width',layer.scrollWidth);svg.setAttribute('height',layer.scrollHeight);svg.setAttribute('viewBox',`0 0 ${layer.scrollWidth} ${layer.scrollHeight}`);
  const paths=pdfPaths(view);svg.innerHTML='<defs><marker id="pdf-arrow-friendly" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#93d6a3"/></marker><marker id="pdf-arrow-enemy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#f27c77"/></marker><marker id="pdf-arrow-unknown" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#f4cd75"/></marker></defs>'+paths.map(path=>{
    const cards=path.cards.map(id=>layer.querySelector(`[data-location="${id}"]`));if(cards.some(card=>!card))return '';
    const points=cards.map(card=>{const box=card.getBoundingClientRect();return `${box.left-frame.left+layer.scrollLeft+box.width/2},${box.top-frame.top+layer.scrollTop+box.height/2}`;}).join(' ');
    return `<polyline class="${path.side} ${selectedPdf===path.id?'selected':''}" points="${points}" marker-end="url(#pdf-arrow-${path.side})" aria-label="${esc(path.label)}"/>`;
  }).join('');
}
function render(){
  const issuer=mission.impulse?.hq==='general'?generalIssuer:mission.impulse?.hq;
  const v=getPlayerView(mission,'friendly',issuer),events=getVisibleEvents(mission),aar=getAfterActionReport(mission);
  const unit=v.units.find(u=>u.id===selected)??v.units[0];
  const name=id=>v.locations.find(l=>l.id===id)?.name??v.units.find(u=>u.id===id)?.name??v.enemies.find(u=>u.id===id)?.name??v.casualties.find(c=>c.id===id)?.label??v.assets.find(a=>a.id===id)?.label??(id==='open'?'Out of cover':id==='general'?'General initiative':id);
  unit.options.sort((a,b)=>Number(b.available)-Number(a.available));
  const {option:opt,reason:orderReason}=selectedOrder(unit.options,action,target);
  const reconstitution=action==='RECONSTITUTE';
  const otherTeams=reconstitution?v.units.filter(u=>u.id!==unit.id&&u.steps===1&&!u.removed&&u.kind==='LAT'&&['A','F'].includes(u.cohesion)&&!u.pinned&&u.location===unit.location&&u.cover===unit.cover):[];
  const chosenTeams=otherTeams.filter(u=>contributors.includes(u.id));
  const restored=v.units.find(u=>u.id===target);
  const reason=reconstitution?(orderReason&&!orderReason.startsWith('Every contributor')?orderReason:!restored?'Choose a previously eliminated squad.':!unit.steps||unit.kind!=='LAT'||unit.pinned||!['A','F'].includes(unit.cohesion)?'Select an unpinned Fire or Assault Team.':chosenTeams.length<1?'Choose at least one additional team.':chosenTeams.length+1>(restored.max_steps??0)?`${restored.name} can hold at most ${restored.max_steps} steps.`:null):orderReason;
  const meaningful=events.filter(e=>!['CARDS_DRAWN','DECK_SHUFFLED','COMMAND_RESOLVED'].includes(e.type));
  const movementWarning=movementFireWarning(v,action,target);
  const previousTurn=events.filter(e=>e.turn===Math.max(1,v.turn-1));
  const combat=v.combat_resolution;
  if(combat&&combat.id!==combatId){combatId=combat.id;combatStage=combat.status==='RESOLVED'?'result':'pre';combatOpen=true;}
  if(!combat)combatId=null;
  const phaseIndex=PHASES.findIndex(p=>p[0]===v.phase);
  const locked=recoveryPending||v.status!=='ACTIVE';
  const progress=v.segment_progress;
  const contact=v.contact_review?structuredClone(v.contact_review):null;
  const contactKey=contact?.resolved?`${v.turn}:${progress?.events_after}`:null;
  if(contact&&contactAcknowledged===contactKey&&contact.next_location){contact.location=contact.next_location;contact.resolved=false;contact.events=[];}
  const contactLocations=new Set(contact?[contact.location,...contact.events.flatMap(e=>[e.location,e.origin,e.target].filter(id=>v.locations.some(l=>l.id===id)))]:[]);
  const combatBlocked=progress?.phase==='COMBAT_EFFECTS'&&['awaiting_resolution','reviewing_result'].includes(progress.status)&&!!combat;
  const advanceLabel=v.impulse?'Complete impulse →':progress?.phase==='COMBAT_EFFECTS'?(progress.status==='reviewing'?'Continue to cleanup →':combat?'Combat resolution open':'Resolve hidden effects →'):contact?(contact.resolved?(contact.next_location?'Continue to next contact →':'Continue to pinned recovery →'):'Resolve contact →'):'Resolve segment →';
  const reviewEvents=progress?events.filter(e=>e.sequence>progress.events_after&&!['PHASE_ENTERED','DECK_SHUFFLED'].includes(e.type)):[];
  const selectedPath=pdfPaths(v).find(p=>p.id===selectedPdf);
  const combatFocus=new Set([combat?.target_location,...(combat?.sources??[]).map(s=>s.origin),...(recoveryResult?.phase===v.phase?recoveryResult.locations:[])].filter(Boolean));
  cleanupHeader?.();
  app.innerHTML=`${commandHeader({v,name,seed,recovery,recoveryPending,locked,combatBlocked,advanceLabel,phaseIndex,progress,feedback,feedbackKind})}
    ${aar?`<section class="mission-result" role="status"><h2>Mission ${esc(aar.outcome)}</h2><p>${esc(finalFireMessage)}</p><p>${esc(aar.objectives.at(-1)?.text)}</p><button id="result-replay">Export replay</button><button id="result-aar">Export AAR (report)</button><a href="#aar">Review after-action report ↓</a></section>`:''}
    ${storageError||recovery.error?`<p class="storage-warning" role="alert">${esc(storageError||recovery.error)}</p>`:''}
    ${recoveryPending?'<p class="recovery-prompt">A saved mission is available. Resume it, restore its turn start, or start a new mission.</p>':''}
    ${progress&&progress.phase!=='CONTACTS'?`<details class="segment-review"><summary>Combat results · ${esc(v.phase_label)} · ${progress.visible_resolved??0}/${progress.visible_total??0} visible</summary>${reviewEvents.length?reviewEvents.map(e=>`<p>${esc(e.text)}</p>`).join(''):'<p>No resolved combat effects yet.</p>'}${progress.phase==='COMBAT_EFFECTS'&&combat?'<button id="reopen-combat">Open current combat</button>':''}<p>Next: ${esc(PHASES[(phaseIndex+1)%PHASES.length][1])}</p></details>`:''}
    ${contact?`<section class="contact-review panel" aria-label="Contact resolution"><h2>${contact.resolved?'Contact result':'Potential contact'} · ${esc(name(contact.location)??'No occupied contact')}</h2><p>${contact.resolved?'Review this result, then Continue using the segment control.':'Resolve this terrain card using the segment control. Only one contact is evaluated.'}</p>${contact.events.map(e=>`<p>${esc(e.text)}</p>`).join('')}<p>${contactLocations.size>1?`Focused locations: ${[...contactLocations].filter(Boolean).map(id=>esc(name(id))).join(' · ')}`:''}</p></section>`:''}
    ${recoveryResult?.phase===v.phase?`<section class="segment-review recovery-review" aria-label="Pinned recovery result"><h2>Pinned recovery · previous segment</h2><p>${recoveryResult.units.length?`${recoveryResult.units.map(esc).join(', ')} unpinned outside effective VOF. Highlighted cards show their positions.`:'No pinned formations were eligible to unpin.'}</p></section>`:''}
    ${combat&&combatOpen?`<p class="combat-queue">Receiving formation ${Math.min((progress?.visible_resolved??0)+1,progress?.visible_total??1)} of ${progress?.visible_total??1} visible · source and target highlighted below</p>${combatScreen(combat,v,name)}`:''}
    <div class="company-workspace"><section class="battlefield-column"><div class="map-heading"><h2>Assault course</h2><button id="clear-selection">Clear selection / Show all terrain</button><span>${esc(v.activity.replaceAll('_',' '))} · ${v.contacts.filter(c=>!c.resolved).length} contacts to clear</span></div>
    ${selectedPath?`<p class="selected-fire-path" role="status">PDF trace: ${esc(selectedPath.label)} Path: ${selectedPath.cards.map(name).map(esc).join(' → ')}. ${esc(v.fire.filter(f=>`${f.origin}|${f.target}|${f.friendly?'friendly':f.source?'enemy':'unknown'}`===selectedPdf).map(f=>fireExplanation(v,f)).join(' '))}</p>`:''}
    <div class="map-layer"><svg id="fire-overlay" aria-hidden="true"></svg><div class="company-map">${[...v.locations].sort((a,b)=>b.row-a.row||a.col-b.col).map(l=>{
      const own=v.units.filter(u=>active(u)&&u.location===l.id),enemy=v.enemies.filter(u=>!u.removed&&u.steps&&u.location===l.id),pc=v.contacts.find(c=>c.location===l.id&&!c.resolved),fire=v.fire.filter(f=>f.target===l.id),support=v.support.filter(f=>f.location===l.id);
      return `<article data-location="${l.id}" class="terrain-card ${!selected||l.id===unit.location||unit.los.includes(l.id)?'in-los':'outside-los'} ${combatFocus.has(l.id)||contactLocations.has(l.id)?'combat-focus':''} ${combat?.target_location===l.id?'combat-target':''} ${selectedPath?.cards.includes(l.id)?'selected-pdf-card':''} ${l.staging?'staging':''} ${fire.length||support.length?'incoming':''}">${terrainBorders(l)}<div class="terrain-header"><h3>${esc(l.name)}</h3>${l.staging?'':`<span class="protection">+${l.protection}</span>`}</div>
      <p class="terrain-meta">${l.staging?'Safe staging / casualty evacuation':`Elevation ${l.elevation} · cover draw ${l.cover_draw} · ${l.covers.filter(c=>c.type==='Cover').length}/${l.cover_limit} discovered`}</p>${selected?`<p class="los-explanation">${esc(unit.los_explanations[l.id].reason)}</p>`:''}
      ${pc?`<span class="contact-badge">? Potential contact ${pc.type}</span>`:''}${l.smoke?'<span class="contact-badge">Screening smoke</span>':''}
      <div class="fire-markers">${fireMarkers(v,l).map(m=>`<details class="counter-marker"><summary title="${esc(m.label)}">${markerSummary(m)}</summary><p>${esc(m.detail)}</p></details>`).join('')}</div>
      ${pdfDirections(v,l).map(d=>`<button type="button" class="pdf-badge ${d.side}" data-pdf-path="${esc(`${d.paths[0].origin}|${d.paths[0].target}|${d.paths[0].side}`)}" style="--x:${50+d.dc*45}%;--y:${50-d.dr*45}%;--angle:${d.angle}deg" title="${esc(d.label)}" aria-label="${esc(d.label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 13H15V22H9V13H2Z"/></svg>PDF</button>`).join('')}
      <div class="card-units">${own.map(u=>`<button data-unit="${u.id}" class="unit-counter ${u.id===selected?'selected':''} ${u.pinned?'pinned':''} ${u.options.some(o=>o.available)?'order-ready':'inspect-only'}"><b>${esc(u.name)}</b><small>${esc(stateText(u))}</small>${u.pinned?'<span class="status-badge pin">PIN</span>':''}${u.exposed?'<span class="status-badge exposure">EXPOSED</span>':''}<small>${u.options.some(o=>o.available)?'Orders available':'Inspect · no available orders'}${u.attempted.length?' · '+u.attempted.length+' attempted this impulse':''}</small>${u.cover?'<small>Under '+esc(l.covers.find(c=>c.id===u.cover)?.type??'cover')+'</small>':''}</button>`).join('')}
      ${enemy.map(u=>`<div class="enemy-counter"><b>${esc(u.name)}</b><small>${esc(stateText(u))}</small>${u.pinned?'<span class="status-badge pin">PIN</span>':''}${u.exposed?'<span class="status-badge exposure">EXPOSED</span>':''}</div>`).join('')}</div>
      ${v.casualties.filter(c=>c.location===l.id&&!c.evacuated).map(c=>`<div class="casualty-marker"><b>✚ ${esc(c.label)}</b><small>${c.carrier_name?'Carried by '+esc(c.carrier_name):'Awaiting pickup'} · ${esc(c.cover?l.covers.find(x=>x.id===c.cover)?.type??'cover':'Out of cover')}</small></div>`).join('')}
      ${v.assets.filter(a=>a.location===l.id).map(a=>`<div class="equipment-marker"><b>▣ ${esc(a.label)}</b><small>${a.carrier_name?'Carried by '+esc(a.carrier_name):'Dropped here · recoverable'}</small></div>`).join('')}
      ${v.historical_losses.filter(e=>e.location===l.id).map(e=>`<div class="loss-silhouette"><span aria-hidden="true">♟</span><b>${esc(e.name)}</b><small>Turn ${e.turn} · Historical loss — no tactical effect</small></div>`).join('')}
      ${v.suspected.includes(l.id)&&!enemy.length?'<p class="suspected">Current unspotted position</p>':v.historical_reports.includes(l.id)&&!enemy.length?'<p class="historical">Historical firing report · not a current spotting target</p>':''}
      ${fire.length?`<p class="fire-label">Fire affecting card: ${fire.map(f=>`${f.friendly?'Friendly':f.source?'Enemy':'Unidentified'} from ${esc(name(f.origin))}${!([...(f.friendly?v.enemies:v.units)].some(u=>u.location===l.id&&u.steps&&!u.removed))?' · no known opposing recipient':''}`).join('; ')}. Same-card fire affects opposing formations only.</p>`:''}
      ${support.map(f=>`<p class="fire-label">${f.status==='PENDING'?'Pending':'Active'} indirect fire (${f.value})</p>`).join('')}
      </article>`;
    }).join('')}</div></div><p class="map-legend">LOS borders: white permits tracing through; dark green blocks tracing through at the same elevation. Adjacent cards remain visible unless smoke or other restrictions apply. Hills may overlook lower borders. Selected formation LOS: bright cards. Select an edge PDF badge to emphasize its path through terrain cards: green friendly · red enemy · amber unidentified. VOF counters mark affected cards; same-card fire has no outward PDF. Inspect counters for effects. PIN and EXPOSED badges belong to formations.</p>
    <details class="panel fire-report"><summary>Fire details and continuing fire</summary><p>Friendly formations do not automatically open fire into a card containing both friendly and enemy units. Established fire can continue after the enemy leaves or is captured. Cease/Shift Fire changes it; new eligible targets may trigger automatic fire again.</p>${v.fire.length?v.fire.map(f=>`<p>${esc(fireExplanation(v,f))} ${f.pdf_only?'No basic VOF':f.value===2?'Pinned fire +2':f.value===0?'Small arms 0':f.value===-1?'Automatic −1':'Heavy −3'}${f.origin!==f.target&&!f.indirect?` <button type="button" data-pdf-path="${esc(`${f.origin}|${f.target}|${f.friendly?'friendly':f.source?'enemy':'unknown'}`)}">Trace path</button>`:''}</p>`).join(''):'<p>No automatic fire established. Units will open fire when a valid spotted target is in range.</p>'}</details>
    <details class="panel history"><summary>Tactical record · previous results</summary><ol>${meaningful.slice(-45).reverse().map(e=>`<li><span class="event-turn">T${e.turn}</span><span>${esc(e.text)}</span></li>`).join('')}</ol></details></section>
    <aside class="company-orders panel ${selected?'':'no-selection'}"><p class="selection-hint">Select a formation to inspect its LOS and orders.</p><div class="eyebrow">FORMATION ORDERS</div><label class="field">Selected formation<select id="unit"><option value="" ${selected?'':'selected'}>Show all terrain</option>${[...v.units].sort((a,b)=>Number(b.options.some(o=>o.available))-Number(a.options.some(o=>o.available))).map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${esc(u.name)}${u.options.some(o=>o.available)?' · orders available':' · inspect only'}</option>`).join('')}</select></label>
    <h2>${esc(unit.name)}</h2><p>${esc(stateText(unit))}</p><p class="muted">${esc(name(unit.location))} · ${esc(unit.experience)} experience${unit.radios.length?' · '+esc(unit.radios.join(' / '))+' radio':''}</p>
    <p class="communication">${esc(v.impulse?.hq==='general'?'General initiative permits individual actions; HQ-only actions still require communication.':unit.communication??unit.communication_reason)}</p><p class="muted">Attempted this impulse: ${unit.attempted.length?unit.attempted.map(k=>esc(k.startsWith('ACTIVATE_')?'Activate '+name(k.slice(9)):unit.options.find(o=>o.type===k)?.label??k.replaceAll('_',' '))).join(', '):'none'}. ${unit.exposed?'Exposed until cleanup; seeking cover does not remove exposure.':''}</p>
    ${v.impulse?.hq==='general'?`<label class="field">HQ for HQ-only actions<select id="issuer">${v.units.filter(u=>active(u)&&['HQ','STAFF'].includes(u.kind)).map(u=>`<option value="${u.id}" ${u.id===generalIssuer?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>`:''}
    <p class="danger">${unit.combat?`Under fire. Current net modifier ${unit.combat.ncm>=0?'+':''}${unit.combat.ncm}; ${unit.exposed?'exposure increases danger by 2.':'moving normally adds an exposure penalty of 2.'}`:'No effective incoming fire. Holding and continuing fire cost no commands.'}</p>
    ${opt?`<label class="field">Order<select id="action">${unit.options.map(o=>`<option value="${o.type}" ${o.type===action?'selected':''} ${o.available?'':'disabled'} title="${esc(o.reason)}">${o.available?'●':'○'} ${esc(o.label)} (${o.cost})</option>`).join('')}</select></label>
      ${opt.targeted?`<label class="field">${reconstitution?'Restore eliminated squad':'Target'}<select id="target"><option value="" ${target?'':'selected'}>Choose target</option>${!opt.targets.some(t=>t.id===target)&&target?`<option value="${esc(target)}" selected disabled>${esc(name(target))} · unavailable</option>`:''}${[...opt.targets].sort((a,b)=>Number(!!a.reason)-Number(!!b.reason)).map(t=>`<option value="${esc(t.id)}" ${t.id===target?'selected':''} ${t.reason?'disabled':''} title="${esc(t.reason)}">${esc(name(t.id))}${t.reason?(action==='ACTIVATE'&&v.units.find(u=>u.id===t.id)?.activated?' · already activated':' · unavailable'):''}</option>`).join('')}</select></label>`:''}
      ${reconstitution?`<fieldset class="reconstitution-teams"><legend>Contributing teams · same area</legend><p>Selected: ${esc(unit.name)}</p>${otherTeams.map(u=>`<label><input type="checkbox" data-contributor="${esc(u.id)}" ${contributors.includes(u.id)?'checked':''}> ${esc(u.name)}</label>`).join('')||'<p>No other eligible teams here.</p>'}<small>Choose 2–4 teams total, within the restored counter’s ${restored?.max_steps??'selected'}-step capacity.</small></fieldset>`:''}
      ${movementWarning?`<p class="danger" role="alert">${esc(movementWarning)}</p>`:''}
      <p class="command-preview"><b>Command:</b> ${esc(name(issuer)??'No issuer')} → ${esc(unit.name)} · ${esc(opt.label)}${opt.targeted?' → '+esc(target?name(target):'Choose target'):''}${reconstitution?` · Contributors: ${esc([unit.name,...chosenTeams.map(u=>u.name)].join(', '))}`:''} · ${opt.cost} command${opt.cost===1?'':'s'}</p>
      <button id="order" class="primary" ${reason||locked||!selected?'disabled':''}>Issue order · ${opt.cost} command${opt.cost===2?'s':''}</button>
      <p class="reason">${esc(reason??'Resolves immediately. Review the outcome before your next order.')}</p>`:'<p>This formation is no longer available.</p>'}
    <details><summary>All order eligibility</summary>${unit.options.map(o=>`<p><b>${esc(o.label)}</b>: ${o.available?'Available':esc(o.reason)}</p>`).join('')}</details>
    <details><summary>Named personnel</summary><ul class="personnel">${v.personnel.filter(p=>p.origin===unit.id||unit.personnel.includes(p.id)).map(p=>`<li>${esc(p.name)} · ${esc(p.status)}</li>`).join('')}</ul></details>
    <details><summary>Casualty evacuation</summary>${v.casualties.length?v.casualties.map(c=>`<p>${esc(c.label)} · ${c.evacuated?'Evacuated':c.carrier_name?'Carried by '+esc(c.carrier_name):'Awaiting pickup'} · ${esc(name(c.location))}</p>`).join(''):'<p>No friendly casualty steps recorded.</p>'}</details>
    <details><summary>Turn summary</summary><p>${previousTurn.filter(e=>e.type==='COMMAND_ISSUED').length} orders · ${previousTurn.filter(e=>e.type==='CASUALTY').length} observed casualty steps · ${previousTurn.filter(e=>e.type==='FORMATION_CHANGED').length} observed formation changes.</p></details>
    <details><summary>Diagnostics and card draws</summary><button id="fast-forward" ${locked?'disabled':''}>Skip remaining orders and finish turn</button><pre>${esc(JSON.stringify({phase:v.phase,impulse:v.impulse,combat:unit.combat,draws:events.filter(e=>e.type==='CARDS_DRAWN').slice(-20)},null,2))}</pre></details>
    <button class="abort" id="abort" ${locked?'disabled':''}>Abort mission</button></aside></div>
    ${aar?`<section id="aar" class="panel aar"><div class="eyebrow">AFTER-ACTION REPORT · PLAYER PERSPECTIVE</div><h2>${esc(aar.outcome)}</h2><p>${aar.orders.length} orders · ${aar.casualties.length} observed casualty steps · ${aar.formations.length} formation changes.</p><button id="aar-export">Export AAR (report)</button><h3>Objective</h3><p>${esc(aar.objectives.at(-1)?.text)}</p><details open><summary>Casualties and formation history</summary><ul>${[...aar.casualties,...aar.formations].sort((a,b)=>a.sequence-b.sequence).map(e=>`<li>T${e.turn}: ${esc(e.text)}</li>`).join('')}</ul></details><details><summary>Orders issued</summary><ol>${aar.orders.map(e=>`<li>T${e.turn}: ${esc(e.text)}</li>`).join('')}</ol></details></section>`:''}`;
  cleanupHeader=bindCommandHeader(app,{openFile:recoveryPending});
  firePathObserver?.disconnect();firePathObserver=new ResizeObserver(()=>drawFirePaths(v));firePathObserver.observe(app.querySelector('.company-map'));drawFirePaths(v);
  app.querySelectorAll('[data-pdf-path]').forEach(button=>button.onclick=()=>{selectedPdf=button.dataset.pdfPath===selectedPdf?null:button.dataset.pdfPath;persist();render();});
  app.querySelector('#advance').onclick=()=>{if(contact?.resolved&&contact.next_location&&contactAcknowledged!==contactKey){contactAcknowledged=contactKey;persist();render();return;}const previous=PHASES.find(p=>p[0]===mission.phase);const before=mission;const r=advancePhase(mission);mission=r.state;recoveryResult=previous[0]==='PINNED_RECOVERY'?{phase:mission.phase,units:r.events.filter(e=>e.type==='AUTOMATIC_RECOVERY'&&!e.hidden).map(e=>before.units[e.actor]?.name).filter(Boolean),locations:r.events.filter(e=>e.type==='AUTOMATIC_RECOVERY'&&!e.hidden).map(e=>before.units[e.actor]?.location).filter(Boolean)}:null;feedbackKind=mission.phase===previous[0]?'Current segment result':'Previous segment';feedback=r.reason??`${previous[1]}: ${r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','PHASE_ENTERED'].includes(e.type)).at(-1)?.text??'Complete.'}`;if(previous[0]==='FIRE_MISSIONS'&&r.events.some(e=>e.type==='FIRE_ESTABLISHED'&&!e.hidden))feedback+=` Incoming markers updated; an established fire path may reopen or change its affected card.`;if(mission.impulse?.hq!=='general'&&mission.impulse?.hq)selected=mission.impulse.hq;if(mission!==before)persist(before);render();};
  app.querySelectorAll('[data-hq]').forEach(b=>b.onclick=()=>{const before=mission;const r=selectHQ(mission,b.dataset.hq);mission=r.state;selected=b.dataset.hq;feedbackKind='HQ selection';feedback=r.events.at(-1)?.text??r.reason;if(mission!==before)persist(before);render();});
  app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{selected=b.dataset.unit;persist();render();});
  const resolveButton=app.querySelector('#combat-resolve');if(resolveButton)resolveButton.onclick=()=>{const before=mission,r=resolveCombat(mission,combat.id);mission=r.state;combatStage='result';feedbackKind='Combat result';feedback=r.reason??`Combat resolved: ${getPlayerView(mission).combat_resolution?.result}.`;if(mission!==before)persist(before);render();};

  const nextCombat=app.querySelector('#combat-next');if(nextCombat)nextCombat.onclick=()=>{const before=mission,r=advancePhase(mission);mission=r.state;combatId=null;combatStage='pre';combatOpen=true;feedbackKind='Combat review';feedback=r.reason??'Proceeding to the next frozen combat exposure.';if(mission!==before)persist(before);render();};
  const closeCombat=app.querySelector('#combat-close');if(closeCombat)closeCombat.onclick=()=>{combatOpen=false;persist();render();};
  if(aar){app.querySelector('#result-replay').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));app.querySelector('#result-aar').onclick=()=>download(`company-${seed}-aar.json`,aar);}
  app.querySelector('#clear-selection').onclick=()=>{selected=null;persist();render();};
  app.querySelector('.map-layer').onclick=e=>{if(!e.target.closest('button,details,.pdf-badge')){selected=null;persist();render();}};
  app.querySelector('#resume').onclick=()=>resume('latest');app.querySelector('#restore').onclick=()=>resume('turnStart');
  app.querySelector('#save-export').onclick=()=>download('company-recovery.json',recovery.raw);
  app.querySelector('#previous-export').onclick=()=>{try{const raw=localStorage.getItem(`${SAVE_KEY}-previous`);if(raw)download('company-prior-save.json',raw);else{feedbackKind='File';feedback='No prior replacement backup.';render();}}catch(e){storageError=e.message;render();}};
  const reopen=app.querySelector('#reopen-combat');if(reopen)reopen.onclick=()=>{combatOpen=true;persist();render();};
  app.querySelector('#unit').onchange=e=>{selected=e.target.value||null;persist();render();};
  if(opt){app.querySelector('#action').onchange=e=>{action=e.target.value;target='';contributors=[];persist();render();};const t=app.querySelector('#target');if(t)t.onchange=e=>{target=e.target.value;persist();render();};
    app.querySelectorAll('[data-contributor]').forEach(box=>box.onchange=e=>{contributors=e.target.checked?[...contributors,e.target.dataset.contributor]:contributors.filter(id=>id!==e.target.dataset.contributor);persist();render();});
    app.querySelector('#order').onclick=()=>{const before=mission;const r=submitCommand(mission,{type:action,unit_id:selected,issuer_id:issuer,target_id:target||null,...(reconstitution?{contributor_ids:[selected,...chosenTeams.map(u=>u.id)]}:{})});mission=r.state;feedbackKind='Last order';feedback=r.reason??r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','COMMAND_RESOLVED'].includes(e.type)).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();};}
  const gi=app.querySelector('#issuer');if(gi)gi.onchange=e=>{generalIssuer=e.target.value;render();};
  const missionSelect=app.querySelector('#mission-select');
  const availability=()=>{const entry=missionCatalog.find(m=>m.id===missionSelect.value);app.querySelector('#restart').disabled=!!entry?.unavailable;app.querySelector('#preview-setup').disabled=!entry?.scenario?.map;app.querySelector('#mission-availability').textContent=entry?.unavailable?'Unavailable: '+entry.unavailable:'';};
  missionSelect.onchange=availability;availability();
  app.querySelector('#preview-setup').onclick=()=>{const result=openMissionSetup(app,missionById(missionSelect.value),app.querySelector('#seed').value.trim()||seed);if(result.error)app.querySelector('#mission-availability').textContent=result.error;};
  app.querySelector('#restart').onclick=()=>{seed=app.querySelector('#seed').value.trim()||'company-1';mission=createMission(playableMissionById(app.querySelector('#mission-select').value),seed);combatId=null;combatStage='pre';combatOpen=true;contactAcknowledged=null;selected='co';feedbackKind='Status';feedback='Mission started with seed '+seed+'.';recoveryPending=false;persist(null,true);render();};
  app.querySelector('#export').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));
  app.querySelector('#abort').onclick=()=>{const before=mission;combatId=null;mission=abortMission(mission).state;feedbackKind='Mission outcome';feedback='Mission aborted. Review the AAR below.';persist(before);render();};
  app.querySelector('#fast-forward').onclick=()=>{const before=mission;mission=endTurn(mission).state;feedbackKind='Previous segment';feedback='Diagnostic fast-forward complete; unused orders were skipped.';persist(before);render();};
  const ae=app.querySelector('#aar-export');if(ae)ae.onclick=()=>download(`company-${seed}-aar.json`,aar);
}
render();
