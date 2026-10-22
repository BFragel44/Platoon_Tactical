import {vehicleOperationAvailable,vehicleContext,vehicleSpotLocations,vehicleTransportChoices} from './vehicleInteraction.js';
import {vireVehicleDeployments} from '../sim/company/vireDeployment.js';

import {getVirePublicState} from '../sim/company/vireIntegration.js';



const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));



export function vireControls(state){



 const v=getVirePublicState(state);if(!v)return '';



 const own=v.vehicles.filter(u=>u.faction==='friendly'&&u.status==='ACTIVE');



 return `<button id="vire-controls-open" class="vire-controls-open">Vehicle controls</button><section id="vire-controls" class="vehicle-orders" aria-label="Vehicle orders"><h2>Vehicle orders</h2>${v.normal_phase_enabled?'<p>Normal phase stepping owns Combat Effects and Cleanup.</p>':'<button data-vire-op="ENABLE_NORMAL_PHASES">Enable normal phase integration</button>'}${(v.vehicle_hqs??[]).map(h=>`<p>${esc(h.name)} · ${h.saved} saved commands ${h.eligible?`<button data-vire-hq="${esc(h.id)}">Select HQ impulse</button>`:""}</p>`).join('')}${v.group?`<p>Current group: ${esc(v.group)} · eligible friendly units: ${v.eligible.map(esc).join(", ")||"None"}</p>`:v.phase_started?'<p>Ordered actions complete.</p>':'<button data-vire-op="START_AT_PHASE">Start vehicle phase</button>'}${state.pending_event?.code==='TANK_SUPPORT'?`<section aria-label="Tank Support entry"><h3>M5 Tank Support</h3><p>Choose a Row 1 card for each tank. This resolves the original event draw.</p>${vireVehicleDeployments('event').map(t=>`<label>${esc(t.name)}<select data-vire-entry="${esc(t.id)}">${Object.values(state.locations).filter(l=>l.row===1).map(l=>`<option value="${esc(l.id)}" ${l.id===t.location?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label>`).join('')}<button data-vire-support>Confirm Tank Support</button></section>`:''}<ul>${v.vehicles.map(u=>`<li>${esc(u.id)} · ${esc(u.profile)} · ${esc(u.location)} · ${esc(u.status)}${u.pinned?' · PINNED':''}${u.fire?` · Basic VOF → ${esc(u.fire)}`:''}${u.removal_reason==='AMMO_EXHAUSTED'?' · ammunition exhausted':''}${u.ammo===null?'':` · ${u.ammo} ammo`}${u.crew?`<details><summary>Crew / passengers</summary><p>${u.crew.map(step=>`${esc(step.id)}: ${step.names.map(esc).join(', ')}`).join('<br>')||'No separate crew; an embarked formation drives.'}</p><p>${u.passengers.map(p=>`${esc(p.name)} · ${p.steps} step(s)`).join('<br>')||'No passengers'}</p>${u.mounted_arty_radio?'<p>Fixed artillery radio; requires observer aboard.</p>':''}</details>`:''}</li>`).join('')}</ul><label>Selected vehicle<select id="vire-firer">${own.map(u=>`<option value="${esc(u.id)}">${esc(u.name??u.id)}</option>`).join('')}</select></label><label>Known enemy vehicle<select id="vire-target">${v.vehicles.filter(u=>u.faction==='enemy'&&u.status==='ACTIVE'&&u.target_type==='V').map(u=>`<option value="${esc(u.id)}">${esc(u.id)}</option>`).join('')}</select></label><label>Passenger formations (select one or more)<select id="vire-passengers" multiple>${v.passenger_formations.map(u=>`<option value="${esc(u.id)}"${v.disembark?.units.includes(u.id)?' selected':''}>${esc(u.name)} · ${esc(u.location)}${u.embarked_on?` · aboard ${esc(u.embarked_on)}`:''}</option>`).join('')}</select></label><label>Load ground assets<select id="vire-load-assets" multiple>${v.ground_loads.assets.map(a=>`<option value="${esc(a.id)}">${esc(a.key||a.type)} × ${a.quantity} · ${esc(a.location)}</option>`).join('')}</select></label><label>Load ground casualties<select id="vire-load-casualties" multiple>${v.ground_loads.casualties.map(c=>`<option value="${esc(c.id)}">${esc(c.id)} · ${esc(c.location)}</option>`).join('')}</select></label><label>Unload carried assets<select id="vire-unload-assets" multiple>${v.carried_loads.flatMap(v=>v.assets.map(a=>`<option value="${esc(a.id)}">${esc(v.vehicle)} · ${esc(a.key||a.type)} × ${a.quantity}</option>`)).join('')}</select></label><label>Unload carried casualties<select id="vire-unload-casualties" multiple>${v.carried_loads.flatMap(v=>v.casualties.map(c=>`<option value="${esc(c.id)}">${esc(v.vehicle)} · ${esc(c.id)}</option>`)).join('')}</select></label><button data-vire-op="TRANSFER_VEHICLE_LOAD">Load/unload selected cargo and embark selections · 1 command</button><button data-vire-op="EMBARK_INFANTRY">Embark · 1 command</button><label>Disembark cover<select id="vire-disembark-cover"><option value="">Open</option>${Object.values(state.locations??{}).flatMap(l=>(l.covers??[]).filter(c=>c.discovered).map(c=>`<option value="${esc(c.id)}">${esc(l.name)} · ${esc(c.type)}</option>`)).join('')}</select></label><button data-vire-op="PREPARE_DISEMBARK_INFANTRY">Prepare stationary disembark</button><button data-vire-op="DISEMBARK_INFANTRY">Complete disembark</button><button data-vire-op="ACTIVATE_VEHICLE_HQ">Activate selected vehicle HQ · 1 command</button><button data-vire-op="ACTIVATE_VEHICLE">Activate · 1 command</button><button data-vire-op="VEHICLE_RALLY">Remove pin · 1 command</button><button data-vire-op="VEHICLE_CEASE_FIRE">Cease fire · 1 command</button><button data-vire-op="VEHICLE_SHIFT_FIRE">Shift fire to selected card · 1 command</button><button data-vire-op="HOLD_VEHICLE">Hold position</button><button data-vire-op="AT_FIRE">AT fire</button><label>Observe card<select id="vire-spot-card">${Object.values(state.locations??{}).map(l=>`<option value="${esc(l.id)}">${esc(publicLocation(state,l.id))}</option>`).join('')}</select></label><button data-vire-op="VEHICLE_SPOT">Spot</button><button data-vire-op="REFRESH_VEHICLE_FIRE">Enable/refresh automatic vehicle VOF</button><label>Known infantry under vehicle VOF<select id="vire-infantry-target">${(v.concentrate_targets??[]).map(t=>`<option value="${esc(t.id)}">${esc(t.vehicle)} → ${esc(t.name)} · ${esc(t.location)}${t.cover?" · under cover":" · random out-of-cover target"}</option>`).join('')}</select></label><button data-vire-op="VEHICLE_CONCENTRATE">Concentrate Fire</button>${v.quick?'<button data-vire-op="QUICK_SHOT">Continue Quick Shot</button><button data-vire-op="DECLINE_QUICK_SHOT">Decline Quick Shot</button>':''}<button data-vire-op="AUTO_ENEMY_AT_ACTION">Resolve enemy AT action</button><button data-vire-op="AUTO_ENEMY_REACTION">Resolve enemy response</button><button data-vire-op="AUTO_ENEMY_HIT">Resolve enemy crew procedure</button>${v.reaction?.eligible.length?'<button data-vire-op="REACTION_FIRE">Reaction fire</button><button data-vire-op="DECLINE_REACTION">Decline selected reaction</button>':''}${v.pending_hits.map(h=>`<button data-vire-hit="${esc(h.id)}">Resolve crew HIT · ${esc(h.unit_id)}</button>`).join('')}${v.disembark?`<p>Disembark pending for ${esc(v.disembark.vehicle)}. Resolve reactions, then complete disembark.</p>`:''}<label>Movement path (card IDs, separated by spaces)<input id="vire-path" placeholder="r2c1 r3c1"></label><button data-vire-op="PREPARE_VEHICLE_MOVE">Prepare move</button>${v.move&&!v.move.complete?`<p>Movement stage: ${esc(v.move.stage)}</p><button data-vire-op="STEP_VEHICLE_MOVE">Resolve next movement step</button>${v.move.stage==='REACTION'?'<button data-vire-op="STOP_VEHICLE_MOVE">Stop after this card</button><button data-vire-op="MOVE_AT_FIRE">Stop and AT fire</button>':''}`:''}${v.pending_fire?'<p>Pre-action VOF resolved. Resolve crew HITs, then resume AT fire.</p>':''}${v.phase_started&&!v.group&&!v.phase_complete&&!v.phase_finishing?'<button data-vire-op="FINISH_AT_PHASE">Finish vehicle actions</button>':''}${v.end_vof_pending?'<button data-vire-op="STEP_END_VOF">Resolve next end-of-phase VOF</button>':''}${v.phase_complete&&!v.normal_phase_enabled?'<p>Vehicle phase complete.</p><button data-vire-op="CLEANUP_VEHICLES">Clear activation markers · Cleanup phase</button>':''}${v.phase_complete&&!v.normal_phase_enabled?'<button data-vire-op="PREPARE_INFANTRY_COMBAT">Prepare infantry combat · Combat Effects phase</button><button data-vire-op="AUTO_ENEMY_INFANTRY_COMBAT">Resolve enemy infantry combat</button>':''}${(v.normal_phase_enabled?[]:v.infantry_combat).map(r=>`<button data-vire-combat="${esc(r.id)}">Resolve ${esc(r.name)} · NCM ${r.ncm}</button>`).join('')}<button id="vire-export">Export vehicle replay</button><button id="vire-restore-saved">Restore saved vehicle mission</button><button id="vire-export-save">Export original vehicle save</button><button id="vire-controls-close">Close</button><p id="vire-feedback" role="status"></p></section>`;



}



export function bindVireControls(root,{submit,exportReplay,restore,exportSave,restoreSaved}){



 const dialog=root.querySelector('#vire-controls');if(!dialog)return;



 root.querySelector('#vire-controls-open').onclick=()=>{dialog.hidden=false;dialog.querySelector('#vire-firer').focus();};root.querySelector('#vire-controls-close').onclick=()=>{dialog.hidden=true;};



 const run=op=>{try{submit(op);}catch(e){root.querySelector('#vire-feedback').textContent=e.message;}};



 root.querySelectorAll('[data-vire-op]').forEach(b=>b.onclick=()=>run({type:b.dataset.vireOp,location:root.querySelector('#vire-spot-card').value,vehicle:root.querySelector('#vire-firer').value,firer:root.querySelector('#vire-firer').value,target:root.querySelector(b.dataset.vireOp==='VEHICLE_CONCENTRATE'?'#vire-infantry-target':'#vire-target').value,units:Array.from(root.querySelector('#vire-passengers').selectedOptions,o=>o.value),load_assets:Array.from(root.querySelector('#vire-load-assets').selectedOptions,o=>o.value),unload_assets:Array.from(root.querySelector('#vire-unload-assets').selectedOptions,o=>o.value),load_casualties:Array.from(root.querySelector('#vire-load-casualties').selectedOptions,o=>o.value),unload_casualties:Array.from(root.querySelector('#vire-unload-casualties').selectedOptions,o=>o.value),...(root.querySelector('#vire-disembark-cover').value?{covers:Object.fromEntries([...root.querySelector('#vire-passengers').selectedOptions].map(o=>[o.value,root.querySelector('#vire-disembark-cover').value]))}:{}),path:root.querySelector('#vire-path').value.trim().split(/\s+/).filter(Boolean)}));



 root.querySelector('[data-vire-support]')?.addEventListener('click',()=>run({type:'ENGINE_OPERATION',operation:{op:'advancePhase',options:{eventChoice:{vehicle_positions:Object.fromEntries([...root.querySelectorAll('[data-vire-entry]')].map(e=>[e.dataset.vireEntry,e.value]))}}}}));

 root.querySelectorAll('[data-vire-hq]').forEach(b=>b.onclick=()=>run({type:'ENGINE_OPERATION',operation:{op:'selectHQ',id:b.dataset.vireHq}}));

 root.querySelectorAll('[data-vire-combat]').forEach(b=>b.onclick=()=>run({type:'RESOLVE_INFANTRY_COMBAT',resolution:b.dataset.vireCombat}));

 root.querySelectorAll('[data-vire-hit]').forEach(b=>b.onclick=()=>run({type:'RESOLVE_CREW_HIT',hit:b.dataset.vireHit}));root.querySelector('#vire-export').onclick=exportReplay;

 root.querySelector('#vire-export-save').onclick=()=>exportSave?.();root.querySelector('#vire-restore-saved').onclick=()=>{try{restoreSaved?.();}catch(e){root.querySelector('#vire-feedback').textContent=e.message;}};



 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','Restore vehicle integration replay');dialog.append(input);



 input.onchange=async()=>{try{if(input.files?.[0])restore(JSON.parse(await input.files[0].text()));}catch(e){root.querySelector('#vire-feedback').textContent=e.message;}};



}





// Presentation only: retain the operation adapter and its replay validation.
export function showVehicleOrders(state,selectedVehicle){
 return state.phase!=='COMBAT_EFFECTS'&&!!(selectedVehicle||state.phase==='AT_COMBAT'||state.pending_event?.code==='TANK_SUPPORT');
}

export function integrateVehicleControls(root,state,{selectedVehicle,onSelect,route=[],onRoute}){

 const panel=root.querySelector('#vire-controls');if(!panel)return;

 const view=getVirePublicState(state),command=['CO_ACTIVATION','SUBORDINATE_ACTIVATION','CO_INITIATIVE','PLATOON_INITIATIVE','STAFF_INITIATIVE','GENERAL_INITIATIVE'].includes(state.phase),combat=state.phase==='AT_COMBAT';

 const showOrders=showVehicleOrders(state,selectedVehicle);
 const orders=root.querySelector('.company-orders');orders.prepend(panel);orders.querySelector('#unit').closest('label').classList.add('infantry-selector');orders.classList.toggle('vehicle-selected',showOrders);if(showOrders)orders.classList.remove('no-selection');
 for(const child of panel.children)if(child.tagName==='P'&&!['vire-feedback'].includes(child.id))child.hidden=true;

 const picker=panel.querySelector('#vire-firer');

 if([...picker.options].some(o=>o.value===selectedVehicle))picker.value=selectedVehicle;

 picker.onchange=()=>onSelect(picker.value);

 const vehicle=view.vehicles.find(v=>v.id===picker.value);

 const intro=document.createElement('p');intro.className='vehicle-phase-guidance';

 intro.textContent=command?'Activate vehicles during this impulse; movement and combat follow in 3.6.':combat?`Vehicle group: ${view.group??'ordered actions complete'}. Complete each ready vehicle's action, then resolve the segment to continue.`:'Vehicle orders resume during command phases; movement and combat take place in 3.6.';

 panel.querySelector('h2').after(intro);

 const status=document.createElement('p');status.className='command-preview';status.textContent=vehicle?`${vehicle.name??vehicle.id} · ${publicLocation(state,vehicle.location)} · ${vehicle.status}${vehicle.pinned?' · PINNED':''} · ${vehicle.activated?'Activated':'Not activated'}${vehicle.moved_fired?' · action completed':''}${vehicle.ammo===null?'':` · ${vehicle.ammo} ammo`}`:'Select a friendly vehicle.';intro.after(status);

 const context=vehicleContext(state,vehicle?.id,route);
 if(combat&&vehicle?.profile==='JEEP'&&!vehicle.passengers.length&&view.eligible.includes(vehicle.id))intro.textContent='This Jeep has no embarked driver. Hold position this turn; embark a formation during a command impulse before moving.';
 const spotLocations=vehicleSpotLocations(state,vehicle?.id);
 if(combat&&view.eligible.length&&!view.eligible.includes(vehicle?.id)&&!view.move&&!view.quick&&!view.reaction?.eligible.length){const next=document.createElement('button');next.textContent='Select next ready vehicle';next.onclick=()=>onSelect(view.eligible[0]);picker.closest('label').after(next);}
 for(const option of picker.options){const v=view.vehicles.find(v=>v.id===option.value);option.textContent=`${v?.name??option.value}${view.eligible.includes(option.value)?' · ready to act':v?.moved_fired?' · action complete':v?.activated?' · activated':''}`;}
 if(view.quick&&view.quick.firer!==vehicle?.id)intro.textContent=`Quick Shot pending: select ${view.vehicles.find(v=>v.id===view.quick.firer)?.name??view.quick.firer}.`;
 else if(view.reaction?.eligible.length&&!view.reaction.eligible.includes(vehicle?.id))intro.textContent='Friendly reaction pending: select a responding weapon on the map or in the vehicle list.';
 const available=(type,extra={})=>vehicleOperationAvailable(state,{...context.base,type,...extra});
 // Nothing is displayed just because it belongs to this phase: it must be usable.
 const primary=new Set(['ACTIVATE_VEHICLE_HQ','ACTIVATE_VEHICLE','VEHICLE_RALLY','VEHICLE_CEASE_FIRE','VEHICLE_SHIFT_FIRE','PREPARE_VEHICLE_MOVE','VEHICLE_SPOT','VEHICLE_CONCENTRATE','AT_FIRE','REACTION_FIRE','QUICK_SHOT','HOLD_VEHICLE']);
 const reveal=new Set();
 for(const button of panel.querySelectorAll('[data-vire-op]')){
  const type=button.dataset.vireOp;
  let legal=false;
  if(type==='PREPARE_VEHICLE_MOVE')legal=combat&&(route.length?available(type,{path:route}):context.moveDestinations.length>0);
  else if(type==='AT_FIRE')legal=context.fireTargets.length>0;
  else if(type==='REACTION_FIRE')legal=context.reactionTargets.length>0;
  else if(type==='QUICK_SHOT')legal=context.quickTargets.length>0;
  else if(type==='VEHICLE_SPOT')legal=spotLocations.length>0;
  else if(type==='VEHICLE_SHIFT_FIRE')legal=Object.values(state.locations).some(l=>available(type,{location:l.id}));
  else if(type==='VEHICLE_CONCENTRATE')legal=view.concentrate_targets.some(t=>t.vehicle===vehicle?.id&&available(type,{target:t.id}));
  else if(type==='ACTIVATE_VEHICLE_HQ')legal=false;
  else if(type==='EMBARK_INFANTRY'||type==='TRANSFER_VEHICLE_LOAD')legal=false; // Transport is offered separately with selected loads.
  else if(type==='PREPARE_DISEMBARK_INFANTRY')legal=vehicle?.passengers.length>0&&available(type,{units:vehicle.passengers.map(p=>p.id)});
  else if(type==='DISEMBARK_INFANTRY')legal=!!view.disembark&&available(type,{units:view.disembark.units});
  else if(type==='MOVE_AT_FIRE')legal=knownMoveTargets(state,context.base).length>0;
  else if(type==='STOP_VEHICLE_MOVE')legal=available(type)&&state.vire_runtime.move?.path.length>state.vire_runtime.move?.index+1;
  else if(!['REFRESH_VEHICLE_FIRE','CLEANUP_VEHICLES','PREPARE_INFANTRY_COMBAT','AUTO_ENEMY_INFANTRY_COMBAT'].includes(type))legal=available(type);
  button.hidden=!legal;button.disabled=false;if(legal)reveal.add(type);
  if(type==='PREPARE_VEHICLE_MOVE'){button.textContent='Move along selected route';button.disabled=!route.length;}
  if(type==='STEP_VEHICLE_MOVE')button.textContent=view.move?.stage==='REACTION'?'Continue movement':'Resolve movement to next card';
  if(type==='ACTIVATE_VEHICLE_HQ')button.textContent='Activate tank HQ impulse · 1 command';
  if(type==='ACTIVATE_VEHICLE')button.textContent='Activate this vehicle · 1 command';
 }
 const targetType=reveal.has('QUICK_SHOT')?'quickTargets':reveal.has('REACTION_FIRE')?'reactionTargets':'fireTargets';
 const target=panel.querySelector('#vire-target');target.replaceChildren(...(reveal.has('MOVE_AT_FIRE')?knownMoveTargets(state,context.base):context[targetType]).map(t=>new Option(t.name??t.id,t.id)));
 const spot=panel.querySelector('#vire-spot-card');for(const option of [...spot.options])if(reveal.has('VEHICLE_SHIFT_FIRE')?!available('VEHICLE_SHIFT_FIRE',{location:option.value}):!spotLocations.includes(option.value))option.remove();
 const spotField=spot.closest('label'),shift=reveal.has('VEHICLE_SHIFT_FIRE');
 spotField.firstChild.textContent=shift?'Shift fire to':'Spot position';
 const destinationAction=panel.querySelector(`[data-vire-op="${shift?'VEHICLE_SHIFT_FIRE':'VEHICLE_SPOT'}"]`);
 if(destinationAction&&!destinationAction.hidden){destinationAction.before(spotField);if(shift)destinationAction.textContent='Shift fire · 1 command';}
 const infantry=panel.querySelector('#vire-infantry-target');for(const option of [...infantry.options])if(!view.concentrate_targets.some(t=>t.vehicle===vehicle?.id&&t.id===option.value))option.remove();
 const fields={'vire-target':['AT_FIRE','REACTION_FIRE','QUICK_SHOT','MOVE_AT_FIRE'].some(t=>reveal.has(t)),'vire-passengers':reveal.has('PREPARE_DISEMBARK_INFANTRY')||reveal.has('DISEMBARK_INFANTRY'),'vire-load-assets':false,'vire-load-casualties':false,'vire-unload-assets':false,'vire-unload-casualties':false,'vire-disembark-cover':reveal.has('PREPARE_DISEMBARK_INFANTRY')||reveal.has('DISEMBARK_INFANTRY'),'vire-spot-card':reveal.has('VEHICLE_SPOT')||reveal.has('VEHICLE_SHIFT_FIRE'),'vire-infantry-target':reveal.has('VEHICLE_CONCENTRATE'),'vire-path':false};
 for(const [id,visible]of Object.entries(fields))panel.querySelector('#'+id).closest('label').hidden=!visible;
 const passengers=panel.querySelector('#vire-passengers');for(const option of [...passengers.options])if(!vehicle?.passengers.some(p=>p.id===option.value))option.remove();
 for(const option of passengers.options)option.selected=true;
 panel.querySelector('#vire-path').value=route.join(' ');
 const moveButton=panel.querySelector('[data-vire-op="PREPARE_VEHICLE_MOVE"]');
 if(reveal.has('PREPARE_VEHICLE_MOVE')){
  const planner=document.createElement('section');planner.className='vehicle-route';planner.setAttribute('aria-label','Vehicle movement route');
  const note=document.createElement('p');note.textContent=route.length?'Route: '+route.map(id=>publicLocation(state,id)).join(' → '):'Choose adjacent cards on the map to plot a route.';planner.append(note);
  const label=document.createElement('label');label.textContent='Next route card';const select=document.createElement('select');select.id='vehicle-route-card';select.append(new Option('Choose a card…',''));for(const id of context.moveDestinations)select.append(new Option(publicLocation(state,id),id));label.append(select);planner.append(label);
  select.onchange=()=>{if(select.value)onRoute?.([...route,select.value]);};
  if(route.length){const clear=document.createElement('button');clear.textContent='Clear route';clear.onclick=()=>onRoute?.([]);planner.append(clear);}
  moveButton.before(planner);
  for(const id of context.moveDestinations){const card=root.querySelector(`[data-location="${id}"]`);if(!card)continue;card.classList.add('vehicle-route-option');const add=document.createElement('button');add.className='vehicle-route-add';add.dataset.vehicleRoute=id;add.textContent=route.length?'Add route step':'Move here';add.onclick=()=>onRoute?.([...route,id]);card.querySelector('.terrain-header').after(add);}
 }
 const transport=vehicle?.target_type==='V'&&command&&state.impulse&&vehicle.status==='ACTIVE';
 if(transport){
  const details=document.createElement('details');details.className='vehicle-transport';details.innerHTML='<summary>Transport and cargo</summary>';
  const choices=vehicleTransportChoices(state,vehicle.id);
  const cargoFields=[['vire-load-assets',choices.loadAssets],['vire-load-casualties',choices.loadCasualties],['vire-unload-assets',choices.unloadAssets],['vire-unload-casualties',choices.unloadCasualties]];
  const eligible={ 'vire-passengers':choices.passengers,...Object.fromEntries(cargoFields)};
  for(const [id,items]of Object.entries(eligible)){const select=panel.querySelector('#'+id),ids=new Set(items.map(item=>item.id));for(const option of [...select.options])if(!ids.has(option.value))option.remove();const field=select.closest('label');field.hidden=items.length===0;select.size=Math.min(4,Math.max(2,items.length));details.append(field);}
  passengers.replaceChildren(...choices.passengers.map(p=>new Option(p.name,p.id)));
  const hasCargo=cargoFields.some(([,items])=>items.length>0);
  for(const type of ['TRANSFER_VEHICLE_LOAD','EMBARK_INFANTRY']){const button=panel.querySelector(`[data-vire-op="${type}"]`);button.hidden=type==='EMBARK_INFANTRY'?!choices.passengers.length:!hasCargo;button.disabled=true;details.append(button);}
  details.hidden=!hasCargo&&!choices.passengers.length;
  details.addEventListener('change',()=>{const units=[...passengers.selectedOptions].map(o=>o.value);for(const type of ['TRANSFER_VEHICLE_LOAD','EMBARK_INFANTRY']){const extra={units};for(const [key,id]of [['load_assets','vire-load-assets'],['load_casualties','vire-load-casualties'],['unload_assets','vire-unload-assets'],['unload_casualties','vire-unload-casualties']])extra[key]=[...panel.querySelector('#'+id).selectedOptions].map(o=>o.value);details.querySelector(`[data-vire-op="${type}"]`).disabled=!available(type,extra);}});panel.append(details);
 }
 if(![...reveal].some(t=>primary.has(t))&&(!view.move||view.move.complete)&&!view.quick&&!view.reaction?.eligible.length){const note=document.createElement('p');note.className='vehicle-no-action';note.textContent=vehicle?.moved_fired?'This vehicle has completed its action. Select another eligible vehicle on the map.':command&&!state.impulse?'Select an HQ impulse in the command strip.':combat?'This vehicle is not eligible in the current group. Select an eligible vehicle, or resolve the pending procedure.':'No vehicle orders are available in this segment.';panel.querySelector('#vire-firer').closest('label').after(note);}
 panel.querySelector('ul').hidden=true;

 panel.querySelector('#vire-controls-close').hidden=true;

 root.querySelector('#vire-controls-open').hidden=true;
 for(const p of panel.querySelectorAll('p'))if(/Movement stage:|Disembark pending|Pre-action VOF/.test(p.textContent))p.hidden=!combat;

 panel.hidden=!showOrders;

 const archive=document.createElement('details');archive.innerHTML='<summary>Vehicle replay and recovery</summary>';

 for(const id of ['vire-export','vire-restore-saved','vire-export-save','vire-setup']){const element=panel.querySelector('#'+id);if(element)archive.append(element);}

 const input=panel.querySelector('input[type=file]');if(input)archive.append(input);root.querySelector('#panel-file').append(archive);

 for(const hq of view.vehicle_hqs){

  const card=document.createElement('div');card.className=state.impulse?.hq===hq.id?'current-hq':'';

  const title=document.createElement('b');title.textContent=hq.name;card.append(title);

  const info=document.createElement('small');info.textContent=state.impulse?.hq===hq.id?`${state.impulse.commands} commands · ${state.impulse.spent} spent`:state.completed.includes(hq.id)?'Activated · impulse completed':state.activated.includes(hq.id)?'Activated · commands available in subordinate activation':'Not activated';card.append(info);const reserve=document.createElement('small');reserve.textContent=`${hq.saved??0} saved commands`;card.append(reserve);




 const existing=panel.querySelector(`[data-vire-hq="${hq.id}"]`);if(existing){existing.textContent='Select HQ';card.append(existing);}

  root.querySelector('.command-mat').append(card);

 }

 for(const counter of root.querySelectorAll('[data-vehicle]'))counter.classList.toggle('selected-vehicle',counter.dataset.vehicle===selectedVehicle);

}


function publicLocation(state,id){const l=state.locations[id];return l?.known!==false?l.name:`${l?.row}.${l?.col} Unrevealed terrain`;}
function knownMoveTargets(state,base){return getVirePublicState(state).vehicles.filter(t=>t.faction==='enemy'&&t.target_type==='V'&&vehicleOperationAvailable(state,{...base,type:'MOVE_AT_FIRE',target:t.id}));}
