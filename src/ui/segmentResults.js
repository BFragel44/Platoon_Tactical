const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meaningful=new Set(['HQ_EVENT','HQ_EVENT_NONE','HQ_EVENT_FORMATION','AUTOMATIC_RECOVERY','UNIT_CAPTURED','ENEMY_CASUALTY_CAPTURED','UNIT_MOVED','UNIT_WITHDREW','ASSETS_DROPPED']);

// Input is exclusively getVisibleEvents output. Retain locations from that time.
export function segmentReviews(events) {
  return events.filter(e=>e.type==='SEGMENT_COMPLETED').flatMap(end=>{
    const batch=events.filter(e=>e.turn===end.turn&&e.phase===end.phase&&e.sequence<=end.sequence);
    if(batch.some(e=>e.type==='PHASE_SKIPPED'))return [];
    return [{id:end.id,turn:end.turn,label:end.label,phase:end.phase,events:batch.filter(e=>meaningful.has(e.type))}];
  });
}
export function segmentResultMarkup(review,name) {
  return `<dialog class="tactical-dialog" id="segment-result" aria-labelledby="segment-result-title"><h2 id="segment-result-title">${esc(review.label)}</h2><p>Turn ${review.turn} · resolved segment</p>${review.events.length?review.events.map(e=>`<p>${e.faction?`<b>${e.faction==='friendly'?'U.S.':'German'}</b> · `:''}${esc(e.text)}${e.location?` <span>At ${esc(name(e.location))}.</span>`:''}${e.from?` <span>${esc(name(e.from))} → ${esc(name(e.target))}.</span>`:''}${e.condition?` <strong>${esc(e.condition)}</strong>`:''}${e.expires?` <span>${esc(e.expires)}.</span>`:''}</p>`).join(''):'<p>No visible changes.</p>'}<button id="dismiss-segment">Continue</button></dialog>`;
}
export function inventoryMarkup(unit) {
  const inventory=unit.inventory??{equipment:[],radios:[],casualties:[]};
  const items=[...inventory.equipment.map(a=>`${a.label} × ${a.quantity}`),...inventory.radios.map(r=>`${r} radio`),...inventory.casualties.map(c=>c.label)];
  const status=[unit.transition_description,unit.pinned?'Pinned':null,unit.exposed?'Exposed':null,({GOOD:'Good order',P:'Paralyzed',L:'Litter team',F:'Fire Team',A:'Assault Team'})[unit.cohesion]??unit.cohesion,unit.out_of_ammo?'Out of ammo':null].filter(Boolean);
  return `<dialog class="tactical-dialog" id="inventory" aria-labelledby="inventory-title"><h2 id="inventory-title">${esc(unit.name)} · inventory</h2><p>${unit.steps} steps · ${esc(unit.experience)} experience</p><p>${status.map(esc).join(' · ')}</p>${items.length?`<ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:'<p>No carried equipment or casualties.</p>'}${unit.options.filter(o=>['DROP_LOAD','DROP_CASUALTY'].includes(o.type)).map(o=>`<p><button data-unload="${o.type}" ${o.available?'':'disabled'}>${esc(o.label)}</button>${o.available?(o.cost===0?' · Free action':` · ${o.cost} command`):` · ${esc(o.reason)}`}</p>`).join('')}<button id="close-inventory">Close inventory</button></dialog>`;
}
