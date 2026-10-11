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

const escapeOrderText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function availableOrderMenu(options,action,label=o=>o.label){
 const available=options.filter(o=>o.available),selected=available.some(o=>o.type===action);
 return `${selected?'':`<option value="" selected disabled>${available.length?'Choose an available order':'No orders available'}</option>`}${available.map(o=>`<option value="${escapeOrderText(o.type)}" ${o.type===action?'selected':''}>${escapeOrderText(label(o))} (${o.cost})</option>`).join('')}`;
}
export function unavailableOrderReference(options,label=o=>o.label){
 const unavailable=options.filter(o=>!o.available);
 return unavailable.length?`<details class="unavailable-orders"><summary>Unavailable commands (${unavailable.length})</summary><dl>${unavailable.map(o=>`<dt>${escapeOrderText(label(o))}</dt><dd>${escapeOrderText(o.reason??'No eligible target.')}</dd>`).join('')}</dl></details>`:'';
}
