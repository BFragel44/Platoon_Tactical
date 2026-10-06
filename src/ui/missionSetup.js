import {signalOrderLabel} from './turnNotice.js';
import {equipmentAllocation,equipmentSummaryMarkup} from './setupEquipment.js';
import {previewMissionSetup} from '../sim/company/engine.js';
import {SIGNAL_KEYS,SIGNAL_ORDERS} from '../sim/company/missionSetup.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function setupMarkup(preview,canStart=false){
 const select=(name,choices,value)=>`<select name="${name}">${choices.map(([id,label])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select>`;
 const locations=preview.locations;
 const lastRow=Math.max(...locations.map(l=>l.row));
 const options=ls=>ls.map(l=>[l.id,l.name]);
 return `<section class="mission-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="setup-title"><form id="mission-setup-form"><h2 id="setup-title">Mission setup preview</h2><p>Seed: ${esc(preview.seed)} · content version ${preview.mission_version}. Previewing never changes the active mission or its save.</p>
 ${preview.assumptions?.length?`<p>Validation assumptions: ${preview.assumptions.map(esc).join(' ')}</p>`:''}
 ${!preview.playable?`<p class="storage-warning">Not playable yet. Required work:</p><ul>${preview.missing.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
 ${preview.setup_options?.mortar_mode?`<label>60mm mortars ${select('mortar-mode',[['section','Three-step section'],['teams','Three individual teams']],preview.setup.mortar_mode??'section')}</label>`:''}
 ${preview.setup.mortar_mode==='teams'?`<label>Section CO TAC radio/phone recipient ${select('mortar-radio-recipient',preview.units.map(u=>[u.id,u.name]),preview.setup.mortar_radio_recipient??'staff')}</label>`:''}
 ${preview.setup_options?.command_network?`<label>CO TAC network ${select('command-network',[['radio','SCR536 radios'],['phones','EE8 field phones']],preview.setup.command_network??'radio')}</label>`:''}
 ${preview.phase_lines?`<fieldset><legend>Phase lines for signal orders</legend>${[1,2].map(k=>`<label>PL ${k} ${select(`phase-line-${k}`,Array.from({length:lastRow},(_,i)=>[i+1,`Row ${i+1}`]),preview.phase_lines[k])}</label>`).join('')}</fieldset>`:''}
 ${preview.objectives?`<fieldset><legend>Tactical controls</legend>${['primary','secondary','attack','ccp'].map(k=>`<label>${esc(k)} ${select(`objective-${k}`,options(locations.filter(l=>k==='ccp'?l.known||l.staging:l.row===(k==='attack'?lastRow-1:lastRow))),preview.objectives[k].location)}</label>`).join('')}</fieldset>`:''}
 <details open><summary>Revealed terrain</summary><div class="setup-terrain">${locations.filter(l=>!l.staging).map(l=>`<span>${esc(l.name)}${l.known===false?'':` · level ${l.elevation}`}</span>`).join('')}</div></details>
 <details><summary>Company assignments and equipment</summary><div class="setup-equipment-layout"><div class="setup-roster"><table><thead><tr><th>Formation</th><th>Platoon</th><th>Staging</th><th>HC</th><th>WP</th><th>Rifle grenade</th>${preview.setup.command_network==='phones'?'<th>Phone lines</th>':''}</tr></thead><tbody>${preview.units.map(u=>`<tr><th>${esc(u.name)} · ${u.steps} step(s)</th><td>${['MG','HMG','MORTAR','AT','FO'].includes(u.kind)?select(`platoon-${u.id}`,[...(u.kind==='FO'||preview.setup_options?.mortar_mode?[[0,'Company']]:[]),[1,'1'],[2,'2'],[3,'3']],u.platoon??0):esc(u.platoon??'Company')}</td><td>${select(`position-${u.id}`,options(locations.filter(l=>l.staging)),u.location)}</td>${['smoke','wp','rifle_grenade'].map(k=>`<td><input type="number" name="asset-${u.id}-${k}" min="0" max="4" value="${u.assets[k]??0}" aria-label="${esc(u.name)} ${k}"></td>`).join('')}${preview.setup.command_network==='phones'?`<td><input type="number" name="phone-${u.id}" min="0" max="4" value="${u.assets.phone_line??0}" aria-label="${esc(u.name)} phone lines"></td>`:''}</tr>`).join('')}</tbody></table></div><aside id="setup-equipment-summary" class="setup-equipment-summary" aria-label="Equipment allocation summary">${equipmentSummaryMarkup(equipmentAllocation(preview.units))}</aside></div></details>
 ${preview.signal_plan?`<details><summary>Pyrotechnic signal orders</summary><p>Assign each one-use device to one offensive order before starting.</p><table><thead><tr><th>Device</th><th>Carrier</th><th>Order</th></tr></thead><tbody>${SIGNAL_KEYS.map(key=>`<tr><th>${esc(key.replaceAll('_',' '))}</th><td>${select(`signal-carrier-${key}`,preview.units.map(u=>[u.id,u.name]),preview.setup.signals?.[key]?.carrier??preview.units.find(u=>u.assets[key])?.id)}</td><td>${select(`signal-order-${key}`,SIGNAL_ORDERS.map(order=>[order,signalOrderLabel(order)]),preview.signal_plan[key])}</td></tr>`).join('')}</tbody></table></details>`:''}
 <p id="setup-error" role="alert"></p><button type="submit">Validate / update preview</button>${canStart&&preview.playable?'<button type="submit" name="start-mission" value="start">Start mission with this setup</button>':''}<button type="button" id="setup-close">Close preview</button></form></section>`;
}
export function openMissionSetup(root,definition,seed,onStart=null){
 const previous=document.activeElement;let preview;
 try{preview=previewMissionSetup(definition,seed);}catch(e){return {error:e.message};}
 const close=()=>{root.querySelector('.mission-setup-dialog')?.remove();document.removeEventListener('keydown',keyboard);(previous?.isConnected&&previous.getClientRects().length?previous:root.querySelector('#menu-file'))?.focus();};
 const keyboard=e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...root.querySelectorAll('.mission-setup-dialog button,.mission-setup-dialog select,.mission-setup-dialog input,.mission-setup-dialog summary')].filter(e=>e.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}}};
 const paint=()=>{root.querySelector('.mission-setup-dialog')?.remove();root.insertAdjacentHTML('beforeend',setupMarkup(preview,!!onStart));root.querySelector('#setup-close').onclick=close;const form=root.querySelector('#mission-setup-form');
 const updateEquipment=()=>{const data=new FormData(form),panel=root.querySelector('#setup-equipment-summary'),closed=[...panel.querySelectorAll('details:not([open])')].map(d=>d.dataset.equipmentGroup);panel.innerHTML=equipmentSummaryMarkup(equipmentAllocation(preview.units,name=>data.has(name)?data.get(name):undefined));for(const key of closed)panel.querySelector(`[data-equipment-group="${key}"]`).open=false;};
 form.addEventListener('input',updateEquipment);form.addEventListener('change',updateEquipment);
 form.onsubmit=e=>{
  e.preventDefault();const data=new FormData(form),setup={objectives:{},positions:{},assignments:{},assets:{}};
  if(data.has('mortar-mode'))setup.mortar_mode=data.get('mortar-mode');
  if(setup.mortar_mode==='teams'&&data.has('mortar-radio-recipient'))setup.mortar_radio_recipient=data.get('mortar-radio-recipient');
  if(data.has('command-network'))setup.command_network=data.get('command-network');
  if(preview.phase_lines)setup.phase_lines=Object.fromEntries([1,2].map(k=>[k,Number(data.get(`phase-line-${k}`))]));
  for(const k of ['primary','secondary','attack','ccp'])if(data.has(`objective-${k}`))setup.objectives[k]=data.get(`objective-${k}`);
  for(const u of preview.units){setup.positions[u.id]=data.get(`position-${u.id}`);if(data.has(`platoon-${u.id}`))setup.assignments[u.id]={platoon:Number(data.get(`platoon-${u.id}`))};setup.assets[u.id]=Object.fromEntries(['smoke','wp','rifle_grenade'].map(k=>[k,Number(data.get(`asset-${u.id}-${k}`))]));}
  if(setup.command_network==='phones'&&data.has(`phone-${preview.units[0].id}`))setup.phone_lines=Object.fromEntries(preview.units.map(u=>[u.id,Number(data.get(`phone-${u.id}`))]));
  if(preview.signal_plan)setup.signals=Object.fromEntries(SIGNAL_KEYS.map(key=>[key,{carrier:data.get(`signal-carrier-${key}`),order:data.get(`signal-order-${key}`)}]));
  try{preview=previewMissionSetup(definition,seed,setup);if(e.submitter?.name==='start-mission'&&preview.playable&&onStart){onStart(setup);close();}else paint();}catch(error){root.querySelector('#setup-error').textContent=error.message;}
 };root.querySelector('#setup-close').focus();};
 paint();document.addEventListener('keydown',keyboard);return {close};
}
