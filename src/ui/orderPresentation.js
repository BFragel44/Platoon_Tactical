import art from '../assets/images/combat-art-manifest.json';

// Selection is player intent, never a suggestion to substitute a legal action.
export function selectedOrder(options,action,target) {
  const option=options.find(o=>o.type===action);
  const choice=option?.targets.find(t=>t.id===target);
  const reason=!option?'This order is unavailable for the selected formation.':!option.available?option.reason:option.targeted?choice?.reason??(!choice?'Choose a target.':null):null;
  return {option,reason};
}
export const completeCombatStage=stage=>stage==='effect'?'result':stage;
export const combatArt=(filename,role)=>({filename,flip:!!art.assets[filename]?.[`${role}_flip`]});
export const supportContext=source=>source&&source.kind!=='BASIC_FIRE';
export function orderConsequences(view,unit,option,target,communications){
 if(!option?.available||option.targets?.find(t=>t.id===target)?.reason)return [];
 if(option.type==='TRANSFER_EQUIPMENT'&&target?.startsWith('transfer:')){
  const donor=view.units.find(u=>u.id===target.split(':')[1]);
  return donor?[`${unit.name} and ${donor.name} become exposed until cleanup. This can prevent further movement in this impulse.`]:[];
 }
 if(communications==='normandy'&&unit.radios?.includes('CO')&&['SEEK_COVER','SEEK_COVER_UPPER','ENTER_COVER','INFILTRATE_WITHIN'].includes(option.type)&&target!=='open'&&(!option.targeted||target))return ['Entering cover disables this formation’s CO radio connection. Same-area voice or a working field phone may still allow orders.'];
 return [];
}
export function retainedGeneralIssuer(units,id){
 return units.some(u=>u.id===id&&u.steps&&!u.removed&&['HQ','STAFF'].includes(u.kind))?id:'';
}
export function unavailableTargetReference(option,label=id=>id){
 if(!['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE','ENTER_COVER','INFILTRATE_WITHIN'].includes(option?.type))return '';
 const blocked=option.targets.filter(t=>t.reason);
 return blocked.length?`<details class="unavailable-targets"><summary>Why targets are unavailable (${blocked.length})</summary><ul>${blocked.map(t=>`<li><b>${escapeOrderText(label(t.id))}</b>: ${escapeOrderText(t.reason)}</li>`).join('')}</ul></details>`:'';
}

const escapeOrderText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function formationSelectionOptions(units,selected,showHistorical=false){
 const visible=u=>u.transport||u.steps&&!u.removed;
 const active=units.filter(visible),inactive=units.filter(u=>!visible(u)&&(showHistorical||u.id===selected));
 const group=(label,list)=>list.length?`<optgroup label="${label}">${[...list].sort((a,b)=>Number(!!b.tactical_ready)-Number(!!a.tactical_ready)).map(u=>`<option value="${escapeOrderText(u.id)}" ${u.id===selected?'selected':''}>${escapeOrderText(u.name)}${u.tactical_ready?' · orders available':' · inspect only'}</option>`).join('')}</optgroup>`:'';
 return group('Active formations',active)+group('Off-map or historical formations',inactive);
}
export function groupMovementExclusions(view,unit,option,target){
 if(!option?.available||!['PLATOON_MOVE','PLATOON_INFILTRATE'].includes(option.type))return [];
 const choice=option.targets.find(t=>t.id===target);if(!choice||choice.reason)return [];
 const moving=new Set(choice.moving_unit_ids??[]);
 return view.units.filter(u=>u.faction==='friendly'&&u.steps&&!u.removed&&u.location===unit.location&&u.platoon===unit.platoon&&!moving.has(u.id)).map(u=>({name:u.name,reason:u.pinned?'Pinned; group movement requires unpinned Good Order units.':u.cohesion!=='GOOD'?'Limited Action Team or command Fire Team side; group movement requires Good Order. Check individual movement orders.':u.exposed?'Already exposed; cannot join this group move.':'Not eligible for this group move. Check communication, previous actions and destination capacity.'}));
}
export function availableOrderMenu(options,action,label=o=>o.label){
 const available=options.filter(o=>o.available),selected=available.some(o=>o.type===action);
 return `${selected?'':`<option value="" selected disabled>${available.length?'Choose an available order':'No orders available'}</option>`}${available.map(o=>`<option value="${escapeOrderText(o.type)}" ${o.type===action?'selected':''}>${escapeOrderText(label(o))} (${o.cost})</option>`).join('')}`;
}
export function unavailableOrderReference(options,label=o=>o.label){
 const unavailable=options.filter(o=>!o.available);
 return unavailable.length?`<details class="unavailable-orders"><summary>Unavailable commands (${unavailable.length})</summary><dl>${unavailable.map(o=>`<dt>${escapeOrderText(label(o))}</dt><dd>${escapeOrderText(o.reason??'No eligible target.')}</dd>`).join('')}</dl></details>`:'';
}
// A successful reconstitution consumes its donor counter. Stored presentation
// can still select that donor even though the replay itself is valid.
export function reconstitutionSelection(view,selection){
 if(selection.action!=='RECONSTITUTE')return selection;
 const donor=view.units.find(u=>u.id===selection.selected),restored=view.units.find(u=>u.id===selection.target);
 const remaining=Array.isArray(restored?.steps)?restored.steps.length:restored?.steps;
 if(donor?.removed!=='RECONSTITUTED'||!remaining||restored.removed)return selection;
 return {...selection,selected:restored.id,action:'',target:'',contributors:[]};
}
