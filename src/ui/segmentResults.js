const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {hqEventTitle} from './hqEventPresentation.js';
const meaningful=new Set(['HQ_EVENT','HQ_EVENT_NONE','HQ_EVENT_FORMATION','AUTOMATIC_RECOVERY','UNIT_CAPTURED','ENEMY_CASUALTY_CAPTURED','UNIT_MOVED','UNIT_WITHDREW','ASSETS_DROPPED']);
const transitions=new Set(['PATROL_PREPARED','MISSION_REATTEMPTED']);
export function currentAttemptEvents(events){
 const index=events.findLastIndex(e=>transitions.has(e.type));
 return index<0?events:events.slice(index);
}

// Recaps consume the already-filtered historical stream, never current hidden state.
export function previousSegment(events,phases) {
  events=currentAttemptEvents(events);
  const entries=events.filter(e=>e.type==='PHASE_ENTERED');
  const end=entries.at(-1),start=entries.at(-2);
  if(!start||!end)return null;
  return {id:`recap:${start.id}`,turn:start.turn,phase:start.phase,label:phases.find(p=>p[0]===start.phase)?.[1]??start.phase,events:events.filter(e=>e.sequence>start.sequence&&e.sequence<end.sequence&&!['DECK_SHUFFLED','COMMAND_RESOLVED'].includes(e.type))};
}

// Input is exclusively getVisibleEvents output. Retain locations from that time.
export function segmentReviews(events) {
  return events.filter(e=>e.type==='SEGMENT_COMPLETED').flatMap(end=>{
    const start=events.findLast(e=>transitions.has(e.type)&&e.sequence<=end.sequence);
    const batch=events.filter(e=>e.turn===end.turn&&e.phase===end.phase&&e.sequence<=end.sequence&&(!start||e.sequence>=start.sequence));
    if(batch.some(e=>e.type==='PHASE_SKIPPED'))return [];
    const attemptLabel=events.some(e=>transitions.has(e.type))?`${events.some(e=>e.type==='PATROL_PREPARED')?'Patrol':'Attempt'} ${start?.attempt??1}`:null;
    return [{id:end.id,turn:end.turn,label:end.label,phase:end.phase,attemptLabel,events:batch.filter(e=>meaningful.has(e.type))}];
  });
}
export function segmentResultMarkup(review,name) {
  const headquarters=review.events.find(e=>e.type==='HQ_EVENT');
  if(headquarters){
    const description=headquarters.text??'',split=description.match(/^(.+?[.!?])(?:\s+([\s\S]*))?$/),brief=split?.[1]??description,details=split?.[2];
    const results=review.events.filter(e=>!['HQ_EVENT','HQ_EVENT_NONE'].includes(e.type));
    const resultText=results.length?results.map(e=>`<p>${esc(e.text)}</p>`).join(''):`<p>${esc(headquarters.condition??(headquarters.side==='enemy'?'Event resolved. Concealed enemy results remain hidden.':'Event is in effect.'))}</p>`;
    return `<dialog class="tactical-dialog hq-event-dialog" id="segment-result" aria-labelledby="segment-result-title"><header><h2 id="segment-result-title">${headquarters.side==='enemy'?'Enemy':'Friendly'} Higher HQ Events</h2><p class="hq-event-context">${review.attemptLabel?esc(review.attemptLabel)+' · ':''}Turn ${review.turn}</p></header><h3 class="hq-event-title">${esc(hqEventTitle(headquarters))}</h3><p class="hq-event-description">${esc(brief)}</p><section class="hq-event-result" aria-label="Event result"><h4>Result</h4>${resultText}</section>${details||headquarters.expires?`<details class="hq-event-details"><summary>Event details</summary>${details?`<p>${esc(details)}</p>`:''}${headquarters.expires?`<p>${esc(headquarters.expires)}.</p>`:''}</details>`:''}<footer><button id="dismiss-segment">Continue</button></footer></dialog>`;
  }
  return `<dialog class="tactical-dialog" id="segment-result" aria-labelledby="segment-result-title"><h2 id="segment-result-title">${esc(review.label)}</h2><p>${review.attemptLabel?esc(review.attemptLabel)+' · ':''}Turn ${review.turn} · resolved segment</p>${review.events.length?review.events.map(e=>`<p>${e.faction?`<b>${e.faction==='friendly'?'U.S.':'German'}</b> · `:''}${esc(e.text)}${e.location?` <span>At ${esc(name(e.location))}.</span>`:''}${e.from?` <span>${esc(name(e.from))} → ${esc(name(e.target))}.</span>`:''}${e.condition?` <strong>${esc(e.condition)}</strong>`:''}${e.expires?` <span>${esc(e.expires)}.</span>`:''}</p>`).join(''):'<p>No visible changes.</p>'}<button id="dismiss-segment">Continue</button></dialog>`;
}
export function inventoryMarkup(unit) {
  const inventory=unit.inventory??{equipment:[],radios:[],casualties:[]};
  const items=[...inventory.equipment.map(a=>`${a.label} × ${a.quantity}`),...inventory.radios.map(r=>`${r} radio`),...inventory.casualties.map(c=>c.label)];
  const status=[unit.transition_description,unit.pinned?'Pinned':null,unit.exposed?'Exposed':null,({GOOD:'Good order',P:'Paralyzed',L:'Litter team',F:'Fire Team',A:'Assault Team'})[unit.cohesion]??unit.cohesion,unit.out_of_ammo?'Out of ammo':null].filter(Boolean);
  return `<dialog class="tactical-dialog" id="inventory" aria-labelledby="inventory-title"><h2 id="inventory-title">${esc(unit.name)} · inventory</h2><p>${unit.steps} steps · ${esc(unit.experience)} experience</p><p>${status.map(esc).join(' · ')}</p>${items.length?`<ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:'<p>No carried equipment or casualties.</p>'}${unit.options.filter(o=>['DROP_LOAD','DROP_CASUALTY'].includes(o.type)).map(o=>`<p><button data-unload="${o.type}" ${o.available?'':'disabled'}>${esc(o.label)}</button>${o.available?(o.cost===0?' · Free action':` · ${o.cost} command`):` · ${esc(o.reason)}`}</p>`).join('')}<button id="close-inventory">Close inventory</button></dialog>`;
}
