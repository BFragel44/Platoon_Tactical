import {SETUP_ASSET_LIMITS} from '../sim/company/missionSetup.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={smoke:'HC smoke',wp:'WP smoke',rifle_grenade:'Rifle grenades (1 shot)'};
const keys=Object.keys(SETUP_ASSET_LIMITS);

// Read draft form values only: no mission creation, draws or validation side effects.
export function equipmentAllocation(units,read=()=>undefined) {
 const issues=[],totals=Object.fromEntries(keys.map(k=>[k,0]));
 const rows=units.map(u=>{
  const platoon=Number(read(`platoon-${u.id}`)??u.platoon??0);
  const assets=Object.fromEntries(keys.map(k=>{
   const n=Number(read(`asset-${u.id}-${k}`)??u.assets[k]??0);
   if(!Number.isInteger(n)||n<0)issues.push(`${u.name}: ${labels[k]} must be a non-negative whole number.`);
   const count=Number.isFinite(n)&&n>=0?n:0;totals[k]+=count;return [k,count];
  }));
  const capacity=u.steps*6,used=Object.values(assets).reduce((a,b)=>a+b,0)+(u.radios?.length??0);
  if(used>capacity)issues.push(`${u.name}: carrying capacity exceeded by ${used-capacity}; assignment allowed, movement requires unloading.`);
  if(assets.rifle_grenade&&(!platoon||assets.rifle_grenade>1))issues.push(`${u.name}: rifle grenades require a platoon assignment and a maximum of one.`);
  return {id:u.id,name:u.name,platoon,assets,capacity,used,space:Math.max(0,capacity-used)};
 });
 const remaining=Object.fromEntries(keys.map(k=>[k,SETUP_ASSET_LIMITS[k]-totals[k]]));
 for(const k of keys)if(remaining[k]<0)issues.push(`${labels[k]}: ${-remaining[k]} over the mission limit.`);
 const groups=[1,2,3,0].map(platoon=>{
  const members=rows.filter(u=>u.platoon===platoon),allocated=Object.fromEntries(keys.map(k=>[k,members.reduce((n,u)=>n+u.assets[k],0)]));
  const rifleRemaining=platoon?1-allocated.rifle_grenade:0;
  if(rifleRemaining<0)issues.push(`Platoon ${platoon}: only one rifle grenade may be allocated.`);
  const available={smoke:Math.max(0,remaining.smoke),wp:Math.max(0,remaining.wp),rifle_grenade:Math.max(0,Math.min(remaining.rifle_grenade,rifleRemaining))};
  return {platoon,label:platoon?`${platoon} Platoon`:'Company / unassigned',allocated,available,rifleRemaining,units:members.map(u=>({...u,available:Object.fromEntries(keys.map(k=>[k,available[k]]))}))};
 });
 return {totals,remaining,groups,issues};
}
export function equipmentSummaryMarkup(allocation) {
 const {totals,remaining,groups,issues}=allocation;
 return `<h3>Equipment limits & remaining</h3><p class="equipment-live" role="status">${keys.map(k=>`${labels[k]}: ${remaining[k]>=0?`${remaining[k]} left`:`${-remaining[k]} over limit`}`).map(esc).join(' · ')}</p>
 <table class="equipment-totals"><thead><tr><th>Mission supply</th><th>Limit</th><th>Assigned</th><th>Left</th></tr></thead><tbody>${keys.map(k=>`<tr><th>${labels[k]}</th><td>${SETUP_ASSET_LIMITS[k]}${k==='rifle_grenade'?' · 1 per platoon':''}</td><td>${totals[k]}</td><td class="${remaining[k]<0?'equipment-over':''}">${remaining[k]}</td></tr>`).join('')}</tbody></table>
 <p>HC and WP are shared company supplies, not separate platoon allowances. Each platoon receives one rifle grenade. Distribute all supplies before starting.</p>
 <p><b>Assigned / can add</b> shows current equipment and what remains available. “Can add” uses the shared pool, platoon restriction; it is not reserved for that unit. Overloaded assignments are allowed, but the formation cannot move until unloaded.</p>
 ${issues.length?`<ul class="equipment-over">${issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
 ${groups.map(g=>`<details open data-equipment-group="${g.platoon}"><summary>${g.label} · ${g.platoon?`${g.rifleRemaining} rifle grenade(s) left to assign`:'No rifle-grenade allowance'}</summary><table><thead><tr><th>Formation</th><th>HC</th><th>WP</th><th>Rifle grenade</th></tr></thead><tbody><tr class="equipment-group-total"><th>Platoon / group</th>${keys.map(k=>`<td>${g.allocated[k]} / +${g.available[k]}</td>`).join('')}</tr>${g.units.map(u=>`<tr><th>${esc(u.name)}<small>${u.space} carrying slots free (${u.used}/${u.capacity}, including radios)</small></th>${keys.map(k=>`<td>${u.assets[k]} / +${u.available[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`).join('')}`;
}
