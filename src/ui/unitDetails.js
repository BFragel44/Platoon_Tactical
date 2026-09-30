import manifest from './counterManifest.json';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=key=>manifest.counters[key]?`<img src="${manifest.counters[key].file}" alt="" aria-hidden="true">`:'';
const symbols={HQ:'HQ',STAFF:'HQ',SQUAD:'INF',LAT:'TEAM',LMG:'MG',HMG:'MG',MORTAR:'MTR',FO:'OBS',BAZOOKA:'AT'};
export function formationLabel(unit) {
  if(unit.id==='xo')return 'XO';
  if(unit.id==='co')return 'CO';
  if(unit.id==='staff')return '1SG';
  if(unit.kind==='HQ')return `${unit.platoon??unit.name.match(/\d+/)?.[0]??''}HQ`;
  if(unit.kind==='FO')return /artillery/i.test(unit.name)?'ART FO':'MTR FO';
  const number=unit.name.match(/^(\d+)\//)?.[1]??'';
  if(unit.kind==='MORTAR')return `${number}MTR`;
  if(['MG','LMG','HMG'].includes(unit.kind))return `${number}${/HMG/.test(unit.name)?'HMG':'LMG'}`;
  if(['AT','BAZOOKA'].includes(unit.kind))return `${number}AT`;
  return unit.name.match(/^\d+\/\d+/)?.[0]??unit.name.replace(/ Rifle Squad$/,'');
}
export function formationCounter(unit) {
  const side=unit.cohesion==='GOOD'?(symbols[unit.kind]??unit.kind):({F:'FIRE',A:'ASLT',L:'LITTER',P:'PARALYZED'})[unit.cohesion]??unit.cohesion;
  const image=unit.cohesion==='GOOD'?({HQ:'hq',STAFF:'hq',SQUAD:'infantry',MG:'mg',LMG:'mg',HMG:'mg',MORTAR:'mortar',AT:'bazooka',BAZOOKA:'bazooka'})[unit.kind]:null;
  return `<span class="formation-counter ${unit.removed||!unit.steps?'inactive':''}" role="img" aria-label="${esc(unit.name)}: ${esc(side)}, ${unit.steps} steps${unit.pinned?', pinned':''}"><b>${esc(side)}</b>${art(image)}<span>${unit.steps} STEP${unit.steps===1?'':'S'}</span>${unit.pinned?'<small>PINNED</small>':''}</span>`;
}
export function inlineInventory(unit,{locked=false}={}) {
  const inventory=unit.inventory??{equipment:[],radios:[],casualties:[]};
  const entries=[...inventory.equipment.map(e=>({label:e.label,quantity:e.quantity,symbol:/smoke/i.test(e.label)?'SMK':/grenade/i.test(e.label)?'RG':'KIT'})),...inventory.radios.map(label=>({label:`${label} radio`,quantity:1,symbol:'RAD'})),...inventory.casualties.map(c=>({label:c.label,quantity:1,symbol:'✚'}))];
  return `<section class="inline-inventory" aria-label="Selected formation inventory"><h3>Carried equipment</h3><div class="inventory-chips">${entries.map(e=>`<div class="inventory-chip"><span aria-hidden="true">${art(e.symbol==='RAD'?'radio':e.symbol==='RG'?'rifle-grenade':e.symbol==='SMK'?(/WP/.test(e.label)?'wp':'smoke'):null)||e.symbol}</span><div>${esc(e.label)}<b>× ${e.quantity}</b></div></div>`).join('')||'<p class="muted">No carried equipment or casualties.</p>'}</div>${unit.options.filter(o=>o.type==='DROP_LOAD'||o.type==='DROP_CASUALTY'&&inventory.casualties.length>0).map(o=>`<button data-inline-unload="${o.type}" ${locked||!o.available?'disabled':''}>${esc(o.label)}${o.cost===0?(/free/i.test(o.label)?'':' · free'):` · ${o.cost} command`}</button>${!o.available?`<small>${esc(o.reason)}</small>`:''}`).join('')}</section>`;
}
