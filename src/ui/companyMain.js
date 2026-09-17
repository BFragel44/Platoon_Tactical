import '../style.css';
import './company.css';
import { createMission, submitCommand, advancePhase, abortMission, endTurn, getPlayerView, getVisibleEvents, getAfterActionReport, selectHQ, exportReplay } from '../sim/index.js';
import { companyAssault } from '../scenarios/companyAssault.js';
import { PHASES } from '../sim/company/engine.js';

const app=document.querySelector('#app');
let seed='company-1',mission=createMission(companyAssault,seed),selected='co',action='ACTIVATE',target='',generalIssuer='co';
let feedback='Advance through the opening segments to Company HQ’s activation impulse.';
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const stateText=u=>`${u.steps} step${u.steps===1?'':'s'} · ${u.pinned?'PINNED · ':''}${({GOOD:'Good order',P:'Paralyzed',L:'Litter team',F:'Fire team',A:'Assault team'})[u.cohesion]??u.cohesion}${u.exposed?' · Exposed':''}`;
const active=u=>u.steps&&!u.removed;
function download(name,value){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function render(){
  const issuer=mission.impulse?.hq==='general'?generalIssuer:mission.impulse?.hq;
  const v=getPlayerView(mission,'friendly',issuer),events=getVisibleEvents(mission),aar=getAfterActionReport(mission);
  const unit=v.units.find(u=>u.id===selected)??v.units[0];selected=unit.id;
  const name=id=>v.locations.find(l=>l.id===id)?.name??v.units.find(u=>u.id===id)?.name??v.enemies.find(u=>u.id===id)?.name??(id==='open'?'Out of cover':id==='general'?'General initiative':id);
  const opt=unit.options.find(o=>o.type===action)??unit.options[0];
  if(opt){action=opt.type;if(!opt.targets.some(t=>t.id===target))target=opt.targets.find(t=>!t.reason)?.id??opt.targets[0]?.id??'';}
  const selectedTarget=opt?.targets.find(t=>t.id===target);
  const reason=opt?.targeted?(selectedTarget?selectedTarget.reason:'No eligible targets.'):opt?.available?null:opt?.reason;
  const meaningful=events.filter(e=>!['CARDS_DRAWN','DECK_SHUFFLED','COMMAND_RESOLVED'].includes(e.type));
  const previousTurn=events.filter(e=>e.turn===Math.max(1,v.turn-1));
  const phaseIndex=PHASES.findIndex(p=>p[0]===v.phase);
  app.innerHTML=`<header class="topbar"><div><div class="eyebrow">COMPANY ASSAULT / VALIDATION MISSION</div><h1>Platoon Tactical</h1></div>
    <div class="turn-stat">TURN <strong>${v.turn}</strong><small>/ ${v.turn_limit}</small></div><div class="command-stat"><strong>${v.impulse?.commands??'—'}</strong> commands<small>${v.impulse?esc(name(v.impulse.hq))+' · '+v.impulse.spent+'/6 spent':'No active command impulse'}</small></div>
    <button id="advance" class="primary" ${v.status!=='ACTIVE'||(!v.impulse&&v.eligible_hqs.length)?'disabled':''}>${v.impulse?'Complete impulse →':'Resolve segment →'}</button></header>
    <section class="briefing"><div><h2>Clear the company’s front</h2><p>${esc(v.briefing)}</p></div><div class="setup"><label>Replay seed<input id="seed" value="${esc(seed)}"></label><button id="restart">Restart mission</button><button id="export">Export replay</button></div></section>
    <section class="phase-panel"><div><div class="eyebrow">CURRENT SEGMENT · ${phaseIndex+1} / ${PHASES.length}</div><h2>${esc(v.phase_label)}</h2><p>${esc(v.phase_description)}</p></div><div class="phase-next">Next: ${esc(PHASES[(phaseIndex+1)%PHASES.length][1])}</div>
    ${v.eligible_hqs.length?`<div class="hq-choices"><span>Choose the next HQ:</span>${v.eligible_hqs.map(id=>`<button data-hq="${id}" ${v.impulse?'disabled':''}>${esc(name(id))} · ${v.units.find(u=>u.id===id).saved} saved</button>`).join('')}</div>`:''}
    <details><summary>Full sequence of play</summary><ol class="sequence">${PHASES.map(([id,label])=>`<li ${id===v.phase?'aria-current="step"':''}>${esc(label)}</li>`).join('')}</ol></details></section>
    <p class="feedback" role="status">${esc(feedback)}</p>
    <div class="company-workspace"><section><div class="map-heading"><h2>Assault course</h2><span>${esc(v.activity.replaceAll('_',' '))} · ${v.contacts.filter(c=>!c.resolved).length} contacts to clear</span></div>
    <div class="company-map">${[...v.locations].sort((a,b)=>b.row-a.row||a.col-b.col).map(l=>{
      const own=v.units.filter(u=>active(u)&&u.location===l.id),enemy=v.enemies.filter(u=>!u.removed&&u.steps&&u.location===l.id),pc=v.contacts.find(c=>c.location===l.id&&!c.resolved),fire=v.fire.filter(f=>f.target===l.id),support=v.support.filter(f=>f.location===l.id);
      return `<article class="terrain-card ${l.staging?'staging':''} ${fire.length||support.length?'incoming':''}"><div class="terrain-header"><h3>${esc(l.name)}</h3><span class="protection">+${l.protection}</span></div>
      <p class="terrain-meta">${l.staging?'Safe staging / casualty evacuation':`Elevation ${l.elevation} · cover draw ${l.cover_draw} · ${l.covers.filter(c=>c.type==='Cover').length}/${l.cover_limit} discovered`}</p>
      ${pc?`<span class="contact-badge">? Potential contact ${pc.type}</span>`:''}${l.smoke?'<span class="contact-badge">Screening smoke</span>':''}
      <div class="card-units">${own.map(u=>`<button data-unit="${u.id}" class="unit-counter ${u.id===selected?'selected':''} ${u.pinned?'pinned':''}"><b>${esc(u.name)}</b><small>${esc(stateText(u))}</small>${u.cover?'<small>Under '+esc(l.covers.find(c=>c.id===u.cover)?.type??'cover')+'</small>':''}</button>`).join('')}
      ${enemy.map(u=>`<div class="enemy-counter"><b>${esc(u.name)}</b><small>${esc(stateText(u))}</small></div>`).join('')}</div>
      ${v.suspected.includes(l.id)&&!enemy.length?'<p class="suspected">Reported firing position · unspotted</p>':''}
      ${fire.length?`<p class="fire-label">Incoming from ${[...new Set(fire.map(f=>name(f.origin)))].map(esc).join(', ')}</p>`:''}
      ${support.map(f=>`<p class="fire-label">${f.status==='PENDING'?'Pending':'Active'} indirect fire (${f.value})</p>`).join('')}
      </article>`;
    }).join('')}</div>
    <section class="panel fire-report"><h2>Fire directions</h2>${v.fire.length?v.fire.map(f=>`<p><b>${esc(f.source?name(f.source):'Unidentified attacker')}</b>: ${esc(name(f.origin))} → ${esc(name(f.target))} · ${f.value===2?'Pinned fire +2':f.value===0?'Small arms 0':f.value===-1?'Automatic −1':'Heavy −3'}</p>`).join(''):'<p>No automatic fire established. Units will open fire when a valid spotted target is in range.</p>'}</section>
    <section class="panel history"><h2>Tactical record</h2><ol>${meaningful.slice(-45).reverse().map(e=>`<li><span class="event-turn">T${e.turn}</span><span>${esc(e.text)}</span></li>`).join('')}</ol></section></section>
    <aside class="company-orders panel"><div class="eyebrow">FORMATION ORDERS</div><label class="field">Selected formation<select id="unit">${v.units.filter(active).map(u=>`<option value="${u.id}" ${u.id===selected?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>
    <h2>${esc(unit.name)}</h2><p>${esc(stateText(unit))}</p><p class="muted">${esc(name(unit.location))} · ${esc(unit.experience)} experience${unit.radios.length?' · '+esc(unit.radios.join(' / '))+' radio':''}</p>
    ${v.impulse?.hq==='general'?`<label class="field">HQ for HQ-only actions<select id="issuer">${v.units.filter(u=>active(u)&&['HQ','STAFF'].includes(u.kind)).map(u=>`<option value="${u.id}" ${u.id===generalIssuer?'selected':''}>${esc(u.name)}</option>`).join('')}</select></label>`:''}
    <p class="danger">${unit.combat?`Under fire. Current net modifier ${unit.combat.ncm>=0?'+':''}${unit.combat.ncm}; ${unit.exposed?'exposure increases danger by 2.':'moving normally adds an exposure penalty of 2.'}`:'No effective incoming fire. Holding and continuing fire cost no commands.'}</p>
    ${opt?`<label class="field">Order<select id="action">${unit.options.map(o=>`<option value="${o.type}" ${o.type===action?'selected':''}>${o.available?'●':'○'} ${esc(o.label)} (${o.cost})</option>`).join('')}</select></label>
      ${opt.targeted?`<label class="field">Target<select id="target">${opt.targets.map(t=>`<option value="${esc(t.id)}" ${t.id===target?'selected':''}>${esc(name(t.id))}${t.reason?' · unavailable':''}</option>`).join('')}</select></label>`:''}
      <button id="order" class="primary" ${reason||v.status!=='ACTIVE'?'disabled':''}>Issue order · ${opt.cost} command${opt.cost===2?'s':''}</button>
      <p class="reason">${esc(reason??'Resolves immediately. Review the outcome before your next order.')}</p>`:'<p>This formation is no longer available.</p>'}
    <details><summary>All order eligibility</summary>${unit.options.map(o=>`<p><b>${esc(o.label)}</b>: ${o.available?'Available':esc(o.reason)}</p>`).join('')}</details>
    <details><summary>HQ command reserves</summary>${v.units.filter(u=>['HQ','STAFF'].includes(u.kind)).map(u=>`<p>${esc(u.name)}: ${u.saved} saved · ${active(u)?esc(stateText(u)):'unavailable'}</p>`).join('')}</details>
    <details><summary>Named personnel</summary><ul class="personnel">${v.personnel.filter(p=>p.origin===unit.id||unit.personnel.includes(p.id)).map(p=>`<li>${esc(p.name)} · ${esc(p.status)}</li>`).join('')}</ul></details>
    <details><summary>Turn summary</summary><p>${previousTurn.filter(e=>e.type==='COMMAND_ISSUED').length} orders · ${previousTurn.filter(e=>e.type==='CASUALTY').length} observed casualty steps · ${previousTurn.filter(e=>e.type==='FORMATION_CHANGED').length} observed formation changes.</p></details>
    <details><summary>Diagnostics and card draws</summary><button id="fast-forward" ${v.status!=='ACTIVE'?'disabled':''}>Skip remaining orders and finish turn</button><pre>${esc(JSON.stringify({phase:v.phase,impulse:v.impulse,combat:unit.combat,draws:events.filter(e=>e.type==='CARDS_DRAWN').slice(-20)},null,2))}</pre></details>
    <button class="abort" id="abort" ${v.status!=='ACTIVE'?'disabled':''}>Abort mission</button></aside></div>
    ${aar?`<section class="panel aar"><div class="eyebrow">AFTER-ACTION REPORT · PLAYER PERSPECTIVE</div><h2>${esc(aar.outcome)}</h2><p>${aar.orders.length} orders · ${aar.casualties.length} observed casualty steps · ${aar.formations.length} formation changes.</p><button id="aar-export">Export AAR</button><h3>Objective</h3><p>${esc(aar.objectives.at(-1)?.text)}</p><details open><summary>Casualties and formation history</summary><ul>${[...aar.casualties,...aar.formations].sort((a,b)=>a.sequence-b.sequence).map(e=>`<li>T${e.turn}: ${esc(e.text)}</li>`).join('')}</ul></details><details><summary>Orders issued</summary><ol>${aar.orders.map(e=>`<li>T${e.turn}: ${esc(e.text)}</li>`).join('')}</ol></details></section>`:''}`;
  app.querySelector('#advance').onclick=()=>{const r=advancePhase(mission);mission=r.state;feedback=r.reason??r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','PHASE_ENTERED'].includes(e.type)).at(-1)?.text??'Segment complete.';if(mission.impulse?.hq!=='general'&&mission.impulse?.hq)selected=mission.impulse.hq;render();};
  app.querySelectorAll('[data-hq]').forEach(b=>b.onclick=()=>{const r=selectHQ(mission,b.dataset.hq);mission=r.state;selected=b.dataset.hq;feedback=r.events.at(-1)?.text??r.reason;render();});
  app.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{selected=b.dataset.unit;render();});
  app.querySelector('#unit').onchange=e=>{selected=e.target.value;render();};
  if(opt){app.querySelector('#action').onchange=e=>{action=e.target.value;target='';render();};const t=app.querySelector('#target');if(t)t.onchange=e=>{target=e.target.value;render();};
    app.querySelector('#order').onclick=()=>{const r=submitCommand(mission,{type:action,unit_id:selected,issuer_id:issuer,target_id:target||null});mission=r.state;feedback=r.reason??r.events.filter(e=>!e.hidden&&!['CARDS_DRAWN','COMMAND_RESOLVED'].includes(e.type)).map(e=>e.text).join(' ');render();};}
  const gi=app.querySelector('#issuer');if(gi)gi.onchange=e=>{generalIssuer=e.target.value;render();};
  app.querySelector('#restart').onclick=()=>{seed=app.querySelector('#seed').value.trim()||'company-1';mission=createMission(companyAssault,seed);selected='co';feedback='Mission reset with seed '+seed+'.';render();};
  app.querySelector('#export').onclick=()=>download(`company-${seed}-replay.json`,exportReplay(mission));
  app.querySelector('#abort').onclick=()=>{mission=abortMission(mission).state;feedback='Mission aborted. Review the AAR below.';render();};
  app.querySelector('#fast-forward').onclick=()=>{mission=endTurn(mission).state;feedback='Diagnostic fast-forward complete; unused orders were skipped.';render();};
  const ae=app.querySelector('#aar-export');if(ae)ae.onclick=()=>download(`company-${seed}-aar.json`,aar);
}
render();
