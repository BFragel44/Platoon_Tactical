import {signalOrderLabel} from './turnNotice.js';
import {equipmentAllocation,equipmentSummaryMarkup} from './setupEquipment.js';
import {previewMissionSetup} from '../sim/company/engine.js';
import {SIGNAL_KEYS,SIGNAL_ORDERS} from '../sim/company/missionSetup.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Setup defaults only; explicit fixed-defender choices remain legal and replayed.
export function patrolDeploymentDefault(unit,platoon){
 return unit.platoon===platoon||!unit.platoon&&['HQ','FO'].includes(unit.kind)
  ?`r1c${unit.platoon??2}`:'RESERVE';
}
export function bindPatrolDeployment(form,units,assignmentPrefix='platoon',locations=[]){
 const patrol=form.querySelector('[name="patrol-platoon"]');if(!patrol)return;
 const update=unit=>{const assignment=form.querySelector(`[name="${assignmentPrefix}-${unit.id}"]`),position=form.querySelector(`[name="position-${unit.id}"]`);
  if(!position)return;const selected={...unit,platoon:assignment?Number(assignment.value)||null:unit.platoon};
  position.value=patrolDeploymentDefault(selected,Number(patrol.value));
  const cover=form.querySelector(`[name="cover-${unit.id}"]`);if(cover)cover.value='';
 };
 const cop=form.querySelector('[name="patrol-cop"]');
 if(cop)cop.addEventListener('change',()=>{for(const unit of units){const position=form.querySelector(`[name="position-${unit.id}"]`);if(!position)continue;const previous=position.value;
 position.innerHTML=locations.filter(l=>l.row===1||l.id===cop.value).map(l=>`<option value="${esc(l.id)}">${esc(l.name)}${l.id===cop.value?' - OUTPOST':''}</option>`).join('')+'<option value="RESERVE">Reserve · unavailable this patrol</option>';
 position.value=[...position.options].some(o=>o.value===previous)?previous:'RESERVE';}});
 patrol.addEventListener('change',()=>units.forEach(update));
 for(const unit of units)form.querySelector(`[name="${assignmentPrefix}-${unit.id}"]`)?.addEventListener('change',()=>update(unit));
}
export function patrolControlsMarkup(plan,locations,platoons=[1,2,3],initial=true){
 const select=(name,choices,value)=>`<select name="patrol-${name}" aria-label="${esc(({platoon:'Patrolling platoon',primary:'Primary objective',cop:'Combat Outpost',ccp:'Casualty collection point',concentration:'Artillery concentration'})[name]??`Route point ${Number(name.split('-')[1])+1}`)}">${choices.map(([id,label])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select>`;
 const options=filter=>locations.filter(filter).map(l=>[l.id,l.name]);
 return `<fieldset><legend>Patrol plan</legend><label>Patrolling platoon ${select('platoon',platoons.map(p=>[p,`Platoon ${p}`]),plan.platoon)}</label><label>Primary objective ${select('primary',options(l=>l.row===4),plan.primary)}</label>${initial?`<label>Combat Outpost ${select('cop',options(l=>l.row===2),plan.cop)}</label>`:`<p>Combat Outpost remains at ${esc(locations.find(l=>l.id===plan.cop)?.name??plan.cop)}.</p>`}<label>Casualty collection point ${select('ccp',options(l=>l.row===1),plan.ccp)}</label><label>Artillery concentration ${select('concentration',options(l=>!l.staging),plan.concentration)}</label>${plan.route.map((id,i)=>`<label>Route point ${i+1} ${select(`route-${i}`,options(l=>[2,3,4].includes(l.row)),id)}</label>`).join('')}<p>Choose four different route cards. Visit them in order, pass through the primary objective and finally return across the MLR from Row 2 to Row 1.</p></fieldset>`;
}
export function patrolControlsData(data,previous){return {...previous,platoon:Number(data.get('patrol-platoon')),primary:data.get('patrol-primary'),cop:data.get('patrol-cop')??previous.cop,ccp:data.get('patrol-ccp'),concentration:data.get('patrol-concentration'),route:[0,1,2,3].map(i=>data.get(`patrol-route-${i}`))};}
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
 ${preview.setup_options?.command_network?`<label>CO TAC network ${select('command-network',preview.patrol?[['radio','SCR536 radios']]:[['radio','SCR536 radios'],['phones','EE8 field phones']],preview.setup.command_network??'radio')}</label>`:''}
 ${preview.phase_lines?`<fieldset><legend>Phase lines for signal orders</legend>${[1,2].map(k=>`<label>PL ${k} ${select(`phase-line-${k}`,Array.from({length:lastRow},(_,i)=>[i+1,`Row ${i+1}`]),preview.phase_lines[k])}</label>`).join('')}</fieldset>`:''}
 ${preview.patrol?patrolControlsMarkup(preview.patrol,locations):preview.objectives?`<fieldset><legend>Tactical controls</legend>${['primary','secondary','attack','ccp'].map(k=>`<label>${esc(k)} ${select(`objective-${k}`,options(locations.filter(l=>k==='ccp'?l.known||l.staging:l.row===(k==='attack'?lastRow-1:lastRow))),preview.objectives[k].location)}</label>`).join('')}</fieldset>`:''}
 <details open><summary>Revealed terrain</summary><div class="setup-terrain">${locations.filter(l=>!l.staging).map(l=>`<span>${esc(l.name)}${l.known===false?'':` · level ${l.elevation}`}</span>`).join('')}</div></details>
 <details><summary>Company assignments and equipment</summary>${preview.patrol?'<p>The selected platoon deploys on Row 1. Other platoons and unattached weapons/staff default to off-map reserve and receive no impulses. Assign an attachment to the patrol to deploy it. You may explicitly deploy fixed defenders on Row 1 or the COP.</p>':''}<div class="setup-equipment-layout"><div class="setup-roster"><table><thead><tr><th>Formation</th><th>Platoon</th><th>${preview.patrol?'Deployment':'Staging'}</th><th>HC</th><th>WP</th><th>Rifle grenade</th>${preview.patrol?'<th>Handheld illum</th>':''}${preview.setup.command_network==='phones'?'<th>Phone lines</th>':''}</tr></thead><tbody>${preview.units.map(u=>`<tr><th>${esc(u.name)} · ${u.steps} step(s)</th><td>${(['MG','HMG','MORTAR','AT','FO'].includes(u.kind)||preview.patrol&&u.kind==='STAFF')?select(`platoon-${u.id}`,[...(u.kind==='FO'||preview.setup_options?.mortar_mode?[[0,'Company']]:[]),[1,'1'],[2,'2'],[3,'3']],u.platoon??0):esc(u.platoon??'Company')}</td><td>${select(`position-${u.id}`,preview.patrol?[...locations.filter(l=>l.row===1||l.id===preview.patrol.cop).map(l=>[l.id,l.name+(l.id===preview.patrol.cop?' - OUTPOST':'')]),['RESERVE','Reserve · unavailable this patrol']]:options(locations.filter(l=>l.staging)),preview.setup.positions?.[u.id]??u.location)}</td>${['smoke','wp','rifle_grenade',...(preview.patrol?['illum']:[])].map(k=>`<td><input type="number" name="asset-${u.id}-${k}" min="0" max="4" value="${u.assets[k]??0}" aria-label="${esc(u.name)} ${k}"></td>`).join('')}${preview.setup.command_network==='phones'?`<td><input type="number" name="phone-${u.id}" min="0" max="4" value="${u.assets.phone_line??0}" aria-label="${esc(u.name)} phone lines"></td>`:''}</tr>`).join('')}</tbody></table></div><aside id="setup-equipment-summary" class="setup-equipment-summary" aria-label="Equipment allocation summary">${equipmentSummaryMarkup(equipmentAllocation(preview.units))}</aside></div></details>
 ${preview.signal_plan?`<details><summary>Pyrotechnic signal orders</summary><p>Assign each one-use device to one offensive order before starting.</p><table><thead><tr><th>Device</th><th>Carrier</th><th>Order</th></tr></thead><tbody>${SIGNAL_KEYS.map(key=>`<tr><th>${esc(key.replaceAll('_',' '))}</th><td>${select(`signal-carrier-${key}`,preview.units.map(u=>[u.id,u.name]),preview.setup.signals?.[key]?.carrier??preview.units.find(u=>u.assets[key])?.id)}</td><td>${select(`signal-order-${key}`,SIGNAL_ORDERS.map(order=>[order,signalOrderLabel(order)]),preview.signal_plan[key])}</td></tr>`).join('')}</tbody></table></details>`:''}
 <p id="setup-error" role="alert"></p><button type="submit">Validate / update preview</button>${canStart&&preview.playable?'<button type="submit" name="start-mission" value="start">Start mission with this setup</button>':''}<button type="button" id="setup-close">Close preview</button></form></section>`;
}
export function openMissionSetup(root,definition,seed,onStart=null){
 const previous=document.activeElement;let preview;
 try{preview=previewMissionSetup(definition,seed);if(preview.patrol)preview=previewMissionSetup(definition,seed,{positions:Object.fromEntries(preview.units.map(u=>[u.id,patrolDeploymentDefault(u,preview.patrol.platoon)]))});}catch(e){return {error:e.message};}
 const close=()=>{root.querySelector('.mission-setup-dialog')?.remove();document.removeEventListener('keydown',keyboard);(previous?.isConnected&&previous.getClientRects().length?previous:root.querySelector('#menu-file'))?.focus();};
 const keyboard=e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...root.querySelectorAll('.mission-setup-dialog button,.mission-setup-dialog select,.mission-setup-dialog input,.mission-setup-dialog summary')].filter(e=>e.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}}};
 const paint=()=>{root.querySelector('.mission-setup-dialog')?.remove();root.insertAdjacentHTML('beforeend',setupMarkup(preview,!!onStart));root.querySelector('#setup-close').onclick=close;const form=root.querySelector('#mission-setup-form');bindPatrolDeployment(form,preview.units,'platoon',preview.locations);
 const updateEquipment=()=>{const data=new FormData(form),panel=root.querySelector('#setup-equipment-summary'),closed=[...panel.querySelectorAll('details:not([open])')].map(d=>d.dataset.equipmentGroup);panel.innerHTML=equipmentSummaryMarkup(equipmentAllocation(preview.units,name=>data.has(name)?data.get(name):undefined));for(const key of closed)panel.querySelector(`[data-equipment-group="${key}"]`).open=false;};
 form.addEventListener('input',updateEquipment);form.addEventListener('change',updateEquipment);
 form.onsubmit=e=>{
  e.preventDefault();const data=new FormData(form),setup={objectives:{},positions:{},assignments:{},assets:{}};
  if(preview.patrol){delete setup.objectives;setup.patrol=patrolControlsData(data,preview.patrol);}
  if(data.has('mortar-mode'))setup.mortar_mode=data.get('mortar-mode');
  if(setup.mortar_mode==='teams'&&data.has('mortar-radio-recipient'))setup.mortar_radio_recipient=data.get('mortar-radio-recipient');
  if(data.has('command-network'))setup.command_network=data.get('command-network');
  if(preview.phase_lines)setup.phase_lines=Object.fromEntries([1,2].map(k=>[k,Number(data.get(`phase-line-${k}`))]));
  for(const k of ['primary','secondary','attack','ccp'])if(data.has(`objective-${k}`))setup.objectives[k]=data.get(`objective-${k}`);
  for(const u of preview.units){setup.positions[u.id]=data.get(`position-${u.id}`);if(data.has(`platoon-${u.id}`))setup.assignments[u.id]={platoon:Number(data.get(`platoon-${u.id}`))};setup.assets[u.id]=Object.fromEntries(['smoke','wp','rifle_grenade',...(preview.patrol?['illum']:[])].map(k=>[k,Number(data.get(`asset-${u.id}-${k}`))]));}
  if(setup.command_network==='phones'&&data.has(`phone-${preview.units[0].id}`))setup.phone_lines=Object.fromEntries(preview.units.map(u=>[u.id,Number(data.get(`phone-${u.id}`))]));
  if(preview.signal_plan)setup.signals=Object.fromEntries(SIGNAL_KEYS.map(key=>[key,{carrier:data.get(`signal-carrier-${key}`),order:data.get(`signal-order-${key}`)}]));
  try{preview=previewMissionSetup(definition,seed,setup);if(e.submitter?.name==='start-mission'&&preview.playable&&onStart){onStart(setup);close();}else paint();}catch(error){root.querySelector('#setup-error').textContent=error.message;}
 };root.querySelector('#setup-close').focus();};
 paint();document.addEventListener('keydown',keyboard);return {close};
}
