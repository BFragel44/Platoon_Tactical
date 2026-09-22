import {movementFireWarning,markerSummary,finalFireMessage} from './firePresentation.js';
import '../style.css';
import './company.css';
import { createMission, submitCommand, advancePhase, resolveCombat, abortMission, endTurn, getPlayerView, getVisibleEvents, getAfterActionReport, selectHQ, exportReplay } from '../sim/index.js';
import { companyAssault } from '../scenarios/companyAssault.js';
import { resultingFormationText } from './combatPlayback.js';
import {readRecovery,saveRecovery,resumeCheckpoint,checkpoint,SAVE_KEY} from './localRecovery.js';
import {fireMarkers,pdfDirections} from './fireMarkers.js';
import {selectedOrder,completeCombatStage,combatArt,supportContext} from './orderPresentation.js';
import { PHASES } from '../sim/company/engine.js';

const app=document.querySelector('#app');
let seed='company-1',mission=createMission(companyAssault,seed),selected=null,action='ACTIVATE',target='',generalIssuer='co';
let combatId=null,combatStage='pre',combatOpen=true,contactAcknowledged=null;
let recovery={raw:null,bundle:null,error:null},storageError='',recoveryPending=false,turnStart=checkpoint(mission);
try{recovery=readRecovery(localStorage);recoveryPending=recovery.raw!==null;}catch(e){storageError=`Local storage unavailable: ${e.message}. Export replays manually.`;}
const presentation=()=>({selected,action,target,generalIssuer,combatId,combatStage,combatOpen,contactAcknowledged,feedback});
function persist(previous=null,replace=false){
  if(recoveryPending&&!replace)return;
  if(replace||previous&&mission.turn!==previous.turn)turnStart=checkpoint(mission,presentation());
  try{saveRecovery(localStorage,mission,presentation(),{turnStart,replace});recovery=readRecovery(localStorage);storageError='';recoveryPending=false;}
  catch(e){storageError=`Save failed: ${e.message} Manual replay export remains available.`;}
}
function resume(which){
  try{const restored=resumeCheckpoint(companyAssault,recovery.bundle?.[which]);mission=restored.state;seed=mission.seed;
    const p=restored.presentation;selected=p.selected??null;action=p.action??'MOVE';target=p.target??'';generalIssuer=p.generalIssuer??'co';combatId=p.combatId??null;combatStage=completeCombatStage(p.combatStage??'pre');combatOpen=p.combatOpen??true;contactAcknowledged=p.contactAcknowledged??null;
    turnStart=recovery.bundle.turnStart;recoveryPending=false;feedback=`Restored turn ${mission.turn}, ${PHASES.find(p=>p[0]===mission.phase)[1]}.`;persist();
  }catch(e){storageError=`Cannot resume: ${e.message} The saved record is unchanged and can be exported.`;}
  render();
}
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
function render(){
  const issuer=mission.impulse?.hq==='general'?generalIssuer:mission.impulse?.hq;
  const v=getPlayerView(mission,'friendly',issuer),events=getVisibleEvents(mission),aar=getAfterActionReport(mission);
  const unit=v.units.find(u=>u.id===selected)??v.units[0];
  const name=id=>v.locations.find(l=>l.id===id)?.name??v.units.find(u=>u.id===id)?.name??v.enemies.find(u=>u.id===id)?.name??v.casualties.find(c=>c.id===id)?.label??(id==='open'?'Out of cover':id==='general'?'General initiative':id);
  unit.options.sort((a,b)=>Number(b.available)-Number(a.available));
  const {option:opt,reason}=selectedOrder(unit.options,action,target);
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
  app.innerHTML=`<div class="command-ribbon"><header class="topbar"><div><div class="eyebrow">COMPANY ASSAULT / VALIDATION MISSION</div><h1>Platoon Tactical</h1><small>${v.contacts.filter(c=>!c.resolved).length} contacts left · clear all defenders by turn 10</small></div>
    <div class="turn-stat">TURN <strong>${v.turn}</strong><small>/ ${v.turn_limit}</small></div><div class="command-stat"><strong>${v.impulse?.commands??'—'}</strong> commands<small>${v.impulse?esc(name(v.impulse.hq))+' · '+v.impulse.spent+'/6 spent':'No active command impulse'}</small></div>
    <button id="advance" class="primary" ${locked||combatBlocked||(!v.impulse&&v.eligible_hqs.length)?'disabled':''}>${advanceLabel}</button></header><div class="ribbon-segment"><b>${esc(v.phase_label)}</b><span>${esc(progress?"Review resolved results before continuing.":v.phase_description)}</span><small>Next: ${esc(progress?.remaining?'Next contact card':PHASES[(phaseIndex+1)%PHASES.length][1])}</small></div></div>
    ${aar?`<section class="mission-result" role="status"><h2>Mission ${esc(aar.outcome)}</h2><p>${esc(finalFireMessage)}</p><p>${esc(aar.objectives.at(-1)?.text)}</p><button id="result-replay">Export replay</button><button id="result-aar">Export AAR (report)</button><a href="#aar">Review after-action report ↓</a></section>`:''}
    ${storageError||recovery.error?`<p class="storage-warning" role="alert">${esc(storageError||recovery.error)}</p>`:''}
    ${recoveryPending?'<p class="recovery-prompt">A saved mission is available. Resume it, restore its turn start, or start a new mission.</p>':''}
    <details class="mission-drawer" ${recoveryPending?'open':''}><summary>Mission · briefing, recovery and exports</summary>
      <p>${esc(v.briefing)}</p><div class="setup"><label>Replay seed<input id="seed" value="${esc(seed)}"></label><button id="restart">Start new mission</button><button id="export">Export current replay</button></div>
      <div class="recovery-controls"><button id="resume" ${!recovery.bundle?'disabled':''}>Resume latest</button><button id="restore" ${!recovery.bundle?'disabled':''}>Restore turn start</button><button id="save-export" ${!recovery.raw?'disabled':''}>Export saved record</button><button id="previous-export">Export prior replacement backup</button></div>
      <p>${recovery.bundle?`Latest: turn ${recovery.bundle.latest.turn} · ${esc(recovery.bundle.latest.phase)} · ${esc(recovery.bundle.latest.timestamp)}. Turn start: ${recovery.bundle.turnStart.turn} · ${esc(recovery.bundle.turnStart.phase)} · ${esc(recovery.bundle.turnStart.timestamp)}.`:'No readable recovery record.'}</p>
      <details><summary>Sequence of play</summary><ol class="sequence">${PHASES.map(([id,label])=>`<li ${id===v.phase?'aria-current="step"':''}>${esc(label)}</li>`).join('')}</ol></details>
    </details>
    <section class="command-mat" aria-label="HQ command display">${v.units.filter(u=>['HQ','STAFF'].includes(u.kind)).map(u=>`<div class="${v.impulse?.hq===u.id?'current-hq':''}"><b>${esc(u.name)}</b>${u.activated?`<small class="activation-status">${u.impulse_completed?'Activated · impulse completed':v.impulse?.hq===u.id?'Activated · spending commands':'Activated · commands available in 3.3.1c'}</small>`:''}<span>${v.impulse?.hq===u.id?`${v.impulse.commands} available · ${v.impulse.spent}/6 spent`:`${u.saved} saved`}</span><small title="${esc(u.communication_reason)}">${esc(u.communication??(v.impulse?'No communication link':'No active issuer'))}</small>${v.eligible_hqs.includes(u.id)?`<button data-hq="${u.id}" ${v.impulse||locked?'disabled':''}>Select HQ</button>`:''}</div>`).join('')}</section>
    <p class="feedback" role="status">${esc(feedback)}</p>
    ${progress&&progress.phase!=='CONTACTS'?`<details class="segment-review" ${progress.phase==='CONTACTS'?'open':''}><summary>${progress.phase==='CONTACTS'?'Contact review':'Combat results'} · ${esc(v.phase_label)}</summary>${reviewEvents.length?reviewEvents.map(e=>`<p>${esc(e.text)}</p>`).join(''):'<p>No resolved combat effects yet.</p>'}${progress.phase==='COMBAT_EFFECTS'&&combat?'<button id="reopen-combat">Open current combat</button>':''}<p>Next: ${progress.phase==='CONTACTS'&&progress.remaining?`${progress.remaining} occupied contact card(s) remain; activity is updated.`:esc(PHASES[(phaseIndex+1)%PHASES.length][1])}</p></details>`:''}
    ${contact?`<section class="contact-review panel" aria-label="Contact resolution"><h2>${contact.resolved?'Contact result':'Potential contact'} · ${esc(name(contact.location)??'No occupied contact')}</h2><p>${contact.resolved?'Review this result, then Continue using the segment control.':'Resolve this terrain card using the segment control. Only one contact is evaluated.'}</p>${contact.events.map(e=>`<p>${esc(e.text)}</p>`).join('')}<p>${contactLocations.size>1?`Focused locations: ${[...contactLocations].filter(Boolean).map(id=>esc(name(id))).join(' · ')}`:''}</p></section>`:''}
    ${combat&&combatOpen?combatScreen(combat,v,name):''}
    <div class="company-workspace"><section><div class="map-heading"><h2>Assault course</h2><button id="clear-selection">Clear selection / Show all terrain</button><span>${esc(v.activity.replaceAll('_',' '))} · ${v.contacts.filter(c=>!c.resolved).length} contacts to clear</span></div>
    <div class="map-layer"><div class="company-map">${[...v.locations].sort((a,b)=>b.row-a.row||a.col-b.col).map(l=>{
      const own=v.units.filter(u=>active(u)&&u.location===l.id),enemy=v.enemies.filter(u=>!u.removed&&u.steps&&u.location===l.id),pc=v.contacts.find(c=>c.location===l.id&&!c.resolved),fire=v.fire.filter(f=>f.target===l.id),support=v.support.filter(f=>f.location===l.id);
      return `<article data-location="${l.id}" class="terrain-card ${!selected||l.id===unit.location||unit.los.includes(l.id)?'in-los':'outside-los'} ${combat?.target_location===l.id||contactLocations.has(l.id)?'combat-focus':''} ${l.staging?'staging':''} ${fire.length||support.length?'incoming':''}"><div class="terrain-header"><h3>${esc(l.name)}</h3>${l.staging?'':`<span class="protection">+${l.protection}</span>`}</div>
      <p class="terrain-meta">${l.staging?'Safe staging / casualty evacuation':`Elevation ${l.elevation} · cover draw ${l.cover_draw} · ${l.covers.filter(c=>c.type==='Cover').length}/${l.cover_limit} discovered`}</p>
      ${pc?`<span class="contact-badge">? Potential contact ${pc.type}</span>`:''}${l.smoke?'<span class="contact-badge">Screening smoke</span>':''}
      <div class="fire-markers">${fireMarkers(v,l).map(m=>`<details class="counter-marker"><summary title="${esc(m.label)}">${markerSummary(m)}</summary><p>${esc(m.detail)}</p></details>`).join('')}</div>
      ${pdfDirections(v,l).map(d=>`<span class="pdf-badge ${d.side}" style="--x:${50+d.dc*45}%;--y:${50-d.dr*45}%;--angle:${d.angle}deg" title="${esc(d.label)}" aria-label="${esc(d.label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 22 13H15V22H9V13H2Z"/></svg>PDF</span>`).join('')}
      <div class="card-units">${own.map(u=>`<button data-unit="${u.id}" class="unit-counter ${u.id===selected?'selected':''} ${u.pinned?'pinned':''} ${u.options.some(o=>o.available)?'order-ready':'inspect-only'}"><b>${esc(u.name)}</b><small>${esc(stateText(u))}</small>${u.pinned?'<span class="status-badge pin">PIN</span>':''}${u.exposed?'<span class="status-badge exposure">EXPOSED</span>':''}<small>${u.options.some(o=>o.available)?'Orders available':'Inspect · no available orders'}${u.attempted.length?' · '+u.attempted.length+' attempted this impulse':''}</small>${u.cover?'<small>Under '+esc(l.covers.find(c=>c.id===u.cover)?.type??'cover')+'</small>':''}</button>`).join('')}
      ${enemy.map(u=>`<div class="enemy-counter"><b>${esc(u.name)}</b><small>${esc(stateText(u))}</small>${u.pinned?'<span class="status-badge pin">PIN</span>':''}${u.exposed?'<span class="status-badge exposure">EXPOSED</span>':''}</div>`).join('')}</div>
      ${v.casualties.filter(c=>c.location===l.id&&!c.evacuated).map(c=>`<div class="casualty-marker"><b>✚ ${esc(c.label)}</b><small>${c.carrier_name?'Carried by '+esc(c.carrier_name):'Awaiting pickup'} · ${esc(c.cover?l.covers.find(x=>x.id===c.cover)?.type??'cover':'Out of cover')}</small></div>`).join('')}
      ${v.historical_losses.filter(e=>e.location===l.id).map(e=>`<div class="loss-silhouette"><span aria-hidden="true">♟</span><b>${esc(e.name)}</b><small>Turn ${e.turn} · Historical loss — no tactical effect</small></div>`).join('')}
      ${v.suspected.includes(l.id)&&!enemy.length?'<p class="suspected">Current unspotted position</p>':v.historical_reports.includes(l.id)&&!enemy.length?'<p class="historical">Historical firing report · not a current spotting target</p>':''}
      ${fire.length?`<p class="fire-label">Fire affecting card: ${fire.map(f=>`${f.friendly?'Friendly':f.source?'Enemy':'Unidentified'} from ${esc(name(f.origin))}`).join('; ')}</p>`:''}
      ${support.map(f=>`<p class="fire-label">${f.status==='PENDING'?'Pending':'Active'} indirect fire (${f.value})</p>`).join('')}
      </article>`;
    }).join('')}</div></div><p class="map-legend">Selected formation LOS: bright cards. Edge PDF badges: green friendly · red enemy · amber unidentified. VOF counters mark affected cards; same-card fire has no outward PDF. Inspect counters for effects. PIN and EXPOSED badges belong to formations.</p>
    <details class="panel fire-report"><summary>Fire details and continuing fire</summary><p>Friendly formations do not automatically open fire into a card containing both friendly and enemy units. Established fire can continue after the enemy leaves or is captured. Cease/Shift Fire changes it; new eligible targets may trigger automatic fire again.</p>${v.fire.length?v.fire.map(f=>`<p><b>${esc(f.source?name(f.source):'Unidentified attacker')}</b>: ${esc(name(f.origin))} → ${esc(name(f.target))} · ${f.value===2?'Pinned fire +2':f.value===0?'Small arms 0':f.value===-1?'Automatic −1':'Heavy −3'} · ${esc(f.reason==='CONTINUING_AT_CLEARED_POSITION'?'Continuing at a cleared position; Cease/Shift Fire to change it':f.reason==='INTERCEPTED_OR_FOLLOWING'?'VOF moved along the established direction to intervening or moving occupants':f.reason?.startsWith('BLOCKED')?'Fire relocated by smoke or incoming fire':'Established engagement')}</p>`).join(''):'<p>No automatic fire established. Units will open fire when a valid spotted target is in range.</p>'}</details>
    <details class="panel history"><summary>Tactical record · previous results</summary><ol>${meaningful.slice(-45).reverse().map(e=>`<li><span class="event-turn">T${e.turn}</span><span>${esc(e.text)}</span></li>`).join('')}</ol></details></section>
    <aside class="company-orders panel ${selected?'':'no-selection'}"><p class="selection-hint">Select a formation to inspect its LOS and orders.</p><div class="eyebrow">FORMATION ORDERS</div><label class="field">Selected formation<select id="unit"><option value="" ${selected?'':'selected'}>Show all terrain</option>${[...v.units].sort((a,b)=>Number(b.options.some(o=>o.available))-Number(a.options.some(o=>o.available))).map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${esc(u.name)}${u.options.some(o=>o.available)?' · orders available':' · inspect only'}</option>`).join('')}</select></label>
    <h2>${esc(unit.name)}</h2><p>${esc(stateText(unit))}</p><p class="muted">${esc(name(unit.location))} · ${esc(unit.experience)} experience${unit.radios.length?' · '+esc(unit.radios.join(' / '))+' radio':''}</p>
    <p class="communication">${esc(v.impulse?.hq==='general'?'General initiative permits individual actions; HQ-only actions still require communication.':unit.communication??unit.communication_reason)}</p><p class="muted">Attempted this impulse: ${unit.attempted.length?unit.attempted.map(k=>esc(k.startsWith('ACTIVATE_')?'Activate '+name(k.slice(9)):unit.options.find(o=>o.type===k)?.label??k.replaceAll('_',' '))).join(', '):'none'}. ${unit.exposed?'Exposed until cleanup; seeking cover does not remove exposure.':''}</p>
    ${v.impulse?.hq==='general'?`<label class="field">HQ for HQ-only actions<select id="issuer">${v.units.filter(u=>active(u)&&['HQ','STAFF'].includes(u.kind)).map(u=>`<option value="${u.id}" ${u.id===generalIssuer?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>`:''}
    <p class="danger">${unit.combat?`Under fire. Current net modifier ${unit.combat.ncm>=0?'+':''}${unit.combat.ncm}; ${unit.exposed?'exposure increases danger by 2.':'moving normally adds an exposure penalty of 2.'}`:'No effective incoming fire. Holding and continuing fire cost no commands.'}</p>
    ${opt?`<label class="field">Order<select id="action">${unit.options.map(o=>`<option value="${o.type}" ${o.type===action?'selected':''} ${o.available?'':'disabled'} title="${esc(o.reason)}">${o.available?'●':'○'} ${esc(o.label)} (${o.cost})</option>`).join('')}</select></label>
      ${opt.targeted?`<label class="field">Target<select id="target"><option value="" ${target?'':'selected'}>Choose target</option>${!opt.targets.some(t=>t.id===target)&&target?`<option value="${esc(target)}" selected disabled>${esc(name(target))} · unavailable</option>`:''}${[...opt.targets].sort((a,b)=>Number(!!a.reason)-Number(!!b.reason)).map(t=>`<option value="${esc(t.id)}" ${t.id===target?'selected':''} ${t.reason?'disabled':''} title="${esc(t.reason)}">${esc(name(t.id))}${t.reason?(action==='ACTIVATE'&&v.units.find(u=>u.id===t.id)?.activated?' · already activated':' · unavailable'):''}</option>`).join('')}</select></label>`:''}
      ${movementWarning?`<p class="danger" role="alert">${esc(movementWarning)}</p>`:''}
      <p class="command-preview"><b>Command:</b> ${esc(name(issuer)??'No issuer')} → ${esc(unit.name)} · ${esc(opt.label)}${opt.targeted?' → '+esc(target?name(target):'Choose target'):''} · ${opt.cost} command${opt.cost===1?'':'s'}</p>
      <button id="order" class="primary" ${reason||locked||!selected?'disabled':''}>Issue order · ${opt.cost} command${opt.cost===2?'s':''}</button>
      <p class="reason">${esc(reason??'Resolves immediately. Review the outcome before your next order.')}</p>`:'<p>This formation is no longer available.</p>'}
    <details><summary>All order eligibility</summary>${unit.options.map(o=>`<p><b>${esc(o.label)}</b>: ${o.available?'Available':esc(o.reason)}</p>`).join('')}</details>
    <details><summary>Named personnel</summary><ul class="personnel">${v.personnel.filter(p=>p.origin===unit.id||unit.personnel.includes(p.id)).map(p=>`<li>${esc(p.name)} · ${esc(p.status)}</li>`).join('')}</ul></details>
    <details><summary>Casualty evacuation</summary>${v.casualties.length?v.casualties.map(c=>`<p>${esc(c.label)} · ${c.evacuated?'Evacuated':c.carrier_name?'Carried by '+esc(c.carrier_name):'Awaiting pickup'} · ${esc(name(c.location))}</p>`).join(''):'<p>No friendly casualty steps recorded.</p>'}</details>
    <details><summary>Turn summary</summary><p>${previousTurn.filter(e=>e.type==='COMMAND_ISSUED').length} orders · ${previousTurn.filter(e=>e.type==='CASUALTY').length} observed casualty steps · ${previousTurn.filter(e=>e.type==='FORMATION_CHANGED').length} observed formation changes.</p></details>
    <details><summary>Diagnostics and card draws</summary><button id="fast-forward" ${locked?'disabled':''}>Skip remaining orders and finish turn</button><pre>${esc(JSON.stringify({phase:v.phase,impulse:v.impulse,combat:unit.combat,draws:events.filter(e=>e.type==='CARDS_DRAWN').slice(-20)},null,2))}</pre></details>
    <button class="abort" id="abort" ${locked?'disabled':''}>Abort mission</button></aside></div>
    ${aar?`<section id="aar" class="panel aar"><div class="eyebrow">AFTER-ACTION REPORT · PLAYER PERSPECTIVE</div><h2>${esc(aar.outcome)}</h2><p>${aar.orders.length} orders · ${aar.casualties.length} observed casualty steps · ${aar.formations.length} formation changes.</p><button id="aar-export">Export AAR (report)</button><h3>Objective</h3><p>${esc(aar.objectives.at(-1)?.text)}</p><details open><summary>Casualties and formation history</summary><ul>${[...aar.casualties,...aar.formations].sort((a,b)=>a.sequence-b.sequence).map(e=>`<li>T${e.turn}: ${esc(e.text)}</li>`).join('')}</ul></details><details><summary>Orders issued</summary><ol>${aar.orders.map(e=>`<li>T${e.turn}: ${esc(e.text)}</li>`).join('')}</ol></details></section>`:''}`;
  app.querySelector('#advance').onclick=()=>{if(contact?.resolved&&contact.next_location&&contactAcknowledged!==contactKey){contactAcknowledged=contactKey;persist();render();return;}const previous=PHASES.find(p=>p[0]===mission.phase);const before=mission;const r=advancePhase(mission);mission=r.state;feedback=r.reason??`${mission.phase===previous[0]?'Current segment result':'Previous segment'} — ${previous[1]}: ${r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','PHASE_ENTERED'].includes(e.type)).at(-1)?.text??'Complete.'}`;if(mission.impulse?.hq!=='general'&&mission.impulse?.hq)selected=mission.impulse.hq;if(mission!==before)persist(before);render();};
  app.querySelectorAll('[data-hq]').forEach(b=>b.onclick=()=>{const before=mission;const r=selectHQ(mission,b.dataset.hq);mission=r.state;selected=b.dataset.hq;feedback=r.events.at(-1)?.text??r.reason;if(mission!==before)persist(before);render();});
  app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{selected=b.dataset.unit;persist();render();});
  const resolveButton=app.querySelector('#combat-resolve');if(resolveButton)resolveButton.onclick=()=>{const before=mission,r=resolveCombat(mission,combat.id);mission=r.state;combatStage='result';feedback=r.reason??`Combat resolved: ${getPlayerView(mission).combat_resolution?.result}.`;if(mission!==before)persist(before);render();};

  const nextCombat=app.querySelector('#combat-next');if(nextCombat)nextCombat.onclick=()=>{const before=mission,r=advancePhase(mission);mission=r.state;combatId=null;combatStage='pre';combatOpen=true;feedback=r.reason??'Proceeding to the next frozen combat exposure.';if(mission!==before)persist(before);render();};
  const closeCombat=app.querySelector('#combat-close');if(closeCombat)closeCombat.onclick=()=>{combatOpen=false;persist();render();};
  if(aar){app.querySelector('#result-replay').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));app.querySelector('#result-aar').onclick=()=>download(`company-${seed}-aar.json`,aar);}
  app.querySelector('#clear-selection').onclick=()=>{selected=null;persist();render();};
  app.querySelector('.map-layer').onclick=e=>{if(!e.target.closest('button,details,.pdf-badge')){selected=null;persist();render();}};
  app.querySelector('#resume').onclick=()=>resume('latest');app.querySelector('#restore').onclick=()=>resume('turnStart');
  app.querySelector('#save-export').onclick=()=>download('company-recovery.json',recovery.raw);
  app.querySelector('#previous-export').onclick=()=>{try{const raw=localStorage.getItem(`${SAVE_KEY}-previous`);if(raw)download('company-prior-save.json',raw);else{feedback='No prior replacement backup.';render();}}catch(e){storageError=e.message;render();}};
  const reopen=app.querySelector('#reopen-combat');if(reopen)reopen.onclick=()=>{combatOpen=true;persist();render();};
  app.querySelector('#unit').onchange=e=>{selected=e.target.value||null;persist();render();};
  if(opt){app.querySelector('#action').onchange=e=>{action=e.target.value;target='';persist();render();};const t=app.querySelector('#target');if(t)t.onchange=e=>{target=e.target.value;persist();render();};
    app.querySelector('#order').onclick=()=>{const before=mission;const r=submitCommand(mission,{type:action,unit_id:selected,issuer_id:issuer,target_id:target||null});mission=r.state;feedback=r.reason??r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','COMMAND_RESOLVED'].includes(e.type)).map(e=>e.text).join(' ');if(mission!==before)persist(before);render();};}
  const gi=app.querySelector('#issuer');if(gi)gi.onchange=e=>{generalIssuer=e.target.value;render();};
  app.querySelector('#restart').onclick=()=>{seed=app.querySelector('#seed').value.trim()||'company-1';mission=createMission(companyAssault,seed);combatId=null;combatStage='pre';combatOpen=true;contactAcknowledged=null;selected='co';feedback='Mission started with seed '+seed+'.';recoveryPending=false;persist(null,true);render();};
  app.querySelector('#export').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));
  app.querySelector('#abort').onclick=()=>{const before=mission;combatId=null;mission=abortMission(mission).state;feedback='Mission aborted. Review the AAR below.';persist(before);render();};
  app.querySelector('#fast-forward').onclick=()=>{const before=mission;mission=endTurn(mission).state;feedback='Diagnostic fast-forward complete; unused orders were skipped.';persist(before);render();};
  const ae=app.querySelector('#aar-export');if(ae)ae.onclick=()=>download(`company-${seed}-aar.json`,aar);
}
render();
