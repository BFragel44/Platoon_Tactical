import {currentAttemptEvents} from './segmentResults.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={spot:'Spotting',grenade:'Grenade',infiltrate:'Infiltration',burst:'Burst',multi:'Three bursts',short:'Short round',jam:'Jam',hq:'HQ event',activated:'Activation',initiative:'Initiative',at:'AT result'};
export function fieldLabel(f={kind:'card'}){
 return f.kind==='icons'?f.keys.map(k=>labels[k]??k).join(' / '):f.kind==='combat'?`NCM ${f.ncm>=0?'+':''}${f.ncm}`:f.kind==='hit'?`${f.experience} HIT`:f.kind==='random'?`Random 1–${f.sides}`:f.kind==='word'?`Word${f.expected?' · '+f.expected:''}`:labels[f.key]??'Drawn card';
}
export function actionCardMarkup({id,field,value,delay=0,animate=false}){
 const text=Array.isArray(value)?(value.length?value.map(k=>labels[k]??k).join(' + '):'No qualifying symbol'):value===null||value===undefined?'Field unavailable':String(value);
 return `<div class="combat-drawn-card action-drawn-card${animate?' card-draw-reveal':''}" style="--reveal-delay:${delay}ms" role="img" aria-label="Action Card ${esc(id)}, ${esc(fieldLabel(field))}: ${esc(text)}"><small>ACTION CARD ${esc(id)}</small><p>${esc(fieldLabel(field))} → <mark>${esc(text)}</mark></p></div>`;
}
export function publicDrawGroups(events,turn=null){
 const attempt=currentAttemptEvents(events),boundary=attempt[0]?.id;
 const scoped=events.filter(e=>!e.hidden&&(attempt.includes(e)||e.type==='CARDS_DRAWN'&&e.draw_outcomes?.some(o=>o.id===boundary))),groups=new Map();
 for(const e of scoped.filter(e=>e.type==='CARDS_DRAWN'&&(turn===null||e.turn===turn))){
  const id=e.action_group??e.id;
  if(!groups.has(id))groups.set(id,{id,turn:e.turn,batches:[],outcomes:[],combatOnly:true});
  const g=groups.get(id),c=e.draw_context;
  g.batches.push({id:e.id,purpose:e.purpose,actor:c?.actor,allowance:c?.allowance??e.card_ids.length,field:c?.field??{kind:'card'},details:c?.details??[],outcome:c?.outcome,cards:e.card_ids.map((id,i)=>({id,value:c?.values?.[i]??null}))});
  g.combatOnly&&=c?.combat===true;
  for(const outcome of e.draw_outcomes??[])if(!g.outcomes.some(o=>o.id===outcome.id))g.outcomes.push(outcome);
 }
 return [...groups.values()];
}
export function drawGroupMarkup(group,{animate=false}={}){
 let delay=0;
 return `<h3>Card pulls · Turn ${group.turn}</h3>${group.batches.map(b=>{
  const step=Math.min(150,1500/Math.max(1,b.cards.length)),start=delay;delay+=Math.min(1500,b.cards.length*step);
  return `<section class="card-draw-batch"><strong>${esc(b.purpose)}</strong><small>${b.allowance} card${b.allowance===1?'':'s'}</small><div class="card-draw-faces">${b.cards.map((c,i)=>actionCardMarkup({...c,field:b.field,delay:start+i*step,animate})).join('')}</div>${b.outcome?`<p>${esc(b.outcome)}</p>`:''}${b.details.length?`<details><summary>Calculation</summary>${b.details.map(d=>`<p>${esc(d)}</p>`).join('')}</details>`:''}</section>`;
 }).join('')}<div class="card-draw-result${animate?' card-draw-reveal':''}" style="--reveal-delay:${delay}ms">${group.outcomes.map(e=>`<p>${esc(e.text)}</p>`).join('')}</div>`;
}
export function recentDrawMarkup(events,turn){
 const groups=publicDrawGroups(events,turn);
 const automatic=currentAttemptEvents(events).filter(e=>!e.hidden&&e.turn===turn&&e.no_draw_reason);
 return `<details class="recent-card-pulls"><summary>Recent card pulls · Turn ${turn}</summary>${groups.length?groups.map(g=>`<details><summary>${esc(g.batches[0].purpose)}</summary>${drawGroupMarkup(g)}<button data-replay-draw="${esc(g.id)}">Replay reveal</button></details>`).join(''):'<p>No public card pulls recorded this turn.</p>'}${automatic.map(e=>`<p>${esc(e.text)} ${esc(e.no_draw_reason)}</p>`).join('')}</details>`;
}
const resultTypes=new Set(['OBSERVATION','SUPPORT_REQUEST','CONTACT_EVALUATED','HQ_EVENT','HQ_EVENT_NONE','IMPULSE_STARTED','COMBAT_RESOLVED','HIT_EFFECT_RESOLVED','GRENADE_ATTEMPT','CONCENTRATE_ATTEMPT','COVER_ATTEMPT','RALLY_ATTEMPT','WITHIN_CARD_MOVED','COHESION_CHANGED','UNIT_MOVED','WEAPON_JAMMED']);
export const drawResultSummary=group=>group.outcomes.findLast(e=>resultTypes.has(e.type))?.text??group.batches.at(-1)?.outcome??'Draw complete.';
// Receipts use only public sequence numbers. Hidden tail events are not a rewind.
export const cardDrawIdentity=mission=>mission?`${mission.mission_instance_id??mission.scenario_id+':'+mission.seed}:${mission.attempt_number??1}`:null;
export function createDrawReceipts(){
 let identity=null,seen=new Set(),lastSequence=0;
 const prime=(id,events=[])=>{identity=id;seen=new Set(events.filter(e=>!e.hidden&&e.type==='CARDS_DRAWN').map(e=>e.id));lastSequence=events.filter(e=>!e.hidden).at(-1)?.sequence??0;};
 return {prime,collect(id,events){
  const sequence=events.filter(e=>!e.hidden).at(-1)?.sequence??0;
  if(identity!==id||sequence<lastSequence){prime(id,events);return {reset:true,groups:[]};}
  lastSequence=sequence;const groups=publicDrawGroups(events).filter(g=>g.batches.some(b=>!seen.has(b.id)));
  groups.forEach(g=>g.batches.forEach(b=>seen.add(b.id)));return {reset:false,groups};
 }};
}
export function createCardDrawNotifications(){
 const receipts=createDrawReceipts();
 let queue=[],current=null,timer=null,host=null,paused=false,held=false,observer=null,observedRoot=null;
 const clearTimer=()=>clearTimeout(timer);
 const hide=()=>{clearTimer();host?.replaceChildren();document.body.classList.remove('card-draw-active');};
 const bindHold=()=>{const button=host.querySelector('[data-draw-hold]');if(button)button.onclick=()=>{held=!held;clearTimer();button.textContent=held?'Resume timer':'Keep open';if(!held)timer=setTimeout(()=>{hide();current=null;show();},8000);};};
 const paint=()=>{
  if(!host||paused||!current)return;
  host.innerHTML=`<section class="card-draw-panel" aria-label="Public card pulls"><div class="card-draw-scroll">${drawGroupMarkup(current,{animate:true})}</div><footer><button data-draw-replay>Replay reveal</button><button data-draw-hold>${held?'Resume timer':'Keep open'}</button><button data-draw-dismiss>${queue.length?`Next pull (${queue.length} queued)`: 'Dismiss'}</button><small role="status" aria-live="polite">${esc(drawResultSummary(current))}</small></footer></section>`;
  document.body.classList.add('card-draw-active');
  host.querySelector('[data-draw-dismiss]').onclick=()=>{hide();current=null;show();host.querySelector('[data-draw-dismiss]')?.focus({preventScroll:true});};
  host.querySelector('[data-draw-replay]').onclick=()=>{hide();paint();};
  const animation=current.batches.reduce((n,b)=>n+Math.min(1500,b.cards.length*150),0);
  bindHold();
  if(!held)timer=setTimeout(()=>{hide();current=null;show();},8000+(matchMedia('(prefers-reduced-motion: reduce)').matches?0:animation));
 };
 const show=()=>{if(!current&&queue.length)current=queue.shift();paint();};
 const reset=(id,events=[])=>{receipts.prime(id,events);queue=[];current=null;held=false;hide();};
 return {
  prime:reset,
  pause:()=>{paused=true;queue=[];current=null;hide();observer?.disconnect();observedRoot=null;},
  sync:(root,id,events)=>{
   const fresh=receipts.collect(id,events);
   if(fresh.reset){queue=[];current=null;held=false;hide();}
   paused=false;host=root.querySelector('.card-draw-host');if(!host){host=document.createElement('div');host.className='card-draw-host';root.append(host);}
   for(const g of fresh.groups)if(!g.combatOnly)queue.push(g);
   const layout=()=>{const controls=(root.querySelector('.map-controls')?.getBoundingClientRect().height??48)+28;root.style.setProperty('--card-controls-height',`${controls}px`);root.style.setProperty('--card-panel-height',`${Math.max(80,root.getBoundingClientRect().height-controls-12)}px`);};
   if(observedRoot!==root){observer?.disconnect();observedRoot=root;observer=new ResizeObserver(layout);observer.observe(root);if(root.querySelector('.map-controls'))observer.observe(root.querySelector('.map-controls'));}
   layout();
   // Reattach the current display after a tactical render without restarting its animation/timer.
   if(current&&host.firstChild===null){host.innerHTML=`<section class="card-draw-panel" aria-label="Public card pulls"><div class="card-draw-scroll">${drawGroupMarkup(current)}</div><footer><button data-draw-replay>Replay reveal</button><button data-draw-hold>${held?'Resume timer':'Keep open'}</button><button data-draw-dismiss>${queue.length?`Next pull (${queue.length} queued)`: 'Dismiss'}</button><small>${esc(drawResultSummary(current))}</small></footer></section>`;host.querySelector('[data-draw-replay]').onclick=()=>{hide();paint();};host.querySelector('[data-draw-dismiss]').onclick=()=>{hide();current=null;show();host.querySelector('[data-draw-dismiss]')?.focus({preventScroll:true});};}
   const dismiss=host.querySelector('[data-draw-dismiss]');if(dismiss)dismiss.textContent=queue.length?`Next pull (${queue.length} queued)`:'Dismiss';
   bindHold();if(!current)show();
  },
  replay:g=>{if(!g)return;hide();if(current)queue.unshift(current);current=g;paint();},
 };
}
