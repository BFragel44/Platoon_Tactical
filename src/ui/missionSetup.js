import {previewMissionSetup} from '../sim/company/engine.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function setupMarkup(preview){
 const select=(name,choices,value)=>`<select name="${name}">${choices.map(([id,label])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select>`;
 const locations=preview.locations;
 const options=ls=>ls.map(l=>[l.id,l.name]);
 return `<section class="mission-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="setup-title"><form id="mission-setup-form"><h2 id="setup-title">Mission setup preview</h2><p>Seed: ${esc(preview.seed)} · content version ${preview.mission_version}. Previewing never changes the active mission or its save.</p>
 ${!preview.playable?`<p class="storage-warning">Not playable yet. Required work:</p><ul>${preview.missing.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
 ${preview.objectives?`<fieldset><legend>Tactical controls</legend>${['primary','secondary','attack','ccp'].map(k=>`<label>${esc(k)} ${select(`objective-${k}`,options(locations.filter(l=>k==='ccp'?l.known||l.staging:l.row===(k==='attack'?3:4))),preview.objectives[k].location)}</label>`).join('')}</fieldset>`:''}
 <details open><summary>Revealed terrain</summary><div class="setup-terrain">${locations.filter(l=>!l.staging).map(l=>`<span>${esc(l.name)}${l.known===false?'':` · level ${l.elevation}`}</span>`).join('')}</div></details>
 <details><summary>Company assignments and equipment</summary><div class="setup-roster"><table><thead><tr><th>Formation</th><th>Platoon</th><th>Staging</th><th>HC</th><th>WP</th><th>Rifle grenade</th></tr></thead><tbody>${preview.units.map(u=>`<tr><th>${esc(u.name)} · ${u.steps} step(s)</th><td>${['MG','MORTAR','AT','FO'].includes(u.kind)?select(`platoon-${u.id}`,[...(u.kind==='FO'?[[0,'Unassigned']]:[]),[1,'1'],[2,'2'],[3,'3']],u.platoon??0):esc(u.platoon??'Company')}</td><td>${select(`position-${u.id}`,options(locations.filter(l=>l.staging)),u.location)}</td>${['smoke','wp','rifle_grenade'].map(k=>`<td><input type="number" name="asset-${u.id}-${k}" min="0" max="4" value="${u.assets[k]??0}" aria-label="${esc(u.name)} ${k}"></td>`).join('')}</tr>`).join('')}</tbody></table></div></details>
 <p id="setup-error" role="alert"></p><button type="submit">Validate / update preview</button><button type="button" id="setup-close">Close preview</button></form></section>`;
}
export function openMissionSetup(root,definition,seed){
 const previous=document.activeElement;let preview;
 try{preview=previewMissionSetup(definition,seed);}catch(e){return {error:e.message};}
 const close=()=>{root.querySelector('.mission-setup-dialog')?.remove();document.removeEventListener('keydown',keyboard);(previous?.isConnected&&previous.getClientRects().length?previous:root.querySelector('#menu-file'))?.focus();};
 const keyboard=e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...root.querySelectorAll('.mission-setup-dialog button,.mission-setup-dialog select,.mission-setup-dialog input,.mission-setup-dialog summary')].filter(e=>e.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}}};
 const paint=()=>{root.querySelector('.mission-setup-dialog')?.remove();root.insertAdjacentHTML('beforeend',setupMarkup(preview));root.querySelector('#setup-close').onclick=close;const form=root.querySelector('#mission-setup-form');form.onsubmit=e=>{
  e.preventDefault();const data=new FormData(form),setup={objectives:{},positions:{},assignments:{},assets:{}};
  for(const k of ['primary','secondary','attack','ccp'])if(data.has(`objective-${k}`))setup.objectives[k]=data.get(`objective-${k}`);
  for(const u of preview.units){setup.positions[u.id]=data.get(`position-${u.id}`);if(data.has(`platoon-${u.id}`))setup.assignments[u.id]={platoon:Number(data.get(`platoon-${u.id}`))};setup.assets[u.id]=Object.fromEntries(['smoke','wp','rifle_grenade'].map(k=>[k,Number(data.get(`asset-${u.id}-${k}`))]));}
  try{preview=previewMissionSetup(definition,seed,setup);paint();}catch(error){root.querySelector('#setup-error').textContent=error.message;}
 };root.querySelector('#setup-close').focus();};
 paint();document.addEventListener('keydown',keyboard);return {close};
}
