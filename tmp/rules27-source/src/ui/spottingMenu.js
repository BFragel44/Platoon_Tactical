import {terrainProtection} from '../sim/company/terrain.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Accept only the player projection: never inspect concealed formations for a preview.
export function spottingPreview(view,unit,target) {
  const origin=view.locations.find(l=>l.id===unit.location),card=view.locations.find(l=>l.id===target);
  const modifiers=[{label:`Spotter experience: ${unit.experience}`,value:({Green:-1,Line:0,Veteran:1})[unit.experience]}];
  if(card?.known!==false&&card&&origin){const protection=terrainProtection(card,origin);modifiers.push({label:'Target terrain protection',value:protection>=3?-1:protection===0?1:0});}
  if(unit.location===target)modifiers.push({label:'Same card',value:1});
  return {base:2,modifiers,target:card?.name??target};
}
export function openSpottingMenu(root,{view,unit,target,cost,issuer,confirm}) {
  const p=spottingPreview(view,unit,target),dialog=document.createElement('dialog'),returnFocus=document.activeElement;
  dialog.className='tactical-dialog spotting-dialog';dialog.setAttribute('aria-labelledby','spotting-title');
  dialog.innerHTML=`<h2 id="spotting-title">Spot position</h2><p>${esc(issuer)} → ${esc(unit.name)} → ${esc(p.target)} · ${cost} command(s)</p><p>Base draw: 2 cards; minimum final draw: 1.</p><ul>${p.modifiers.map(m=>`<li>${esc(m.label)}: ${m.value>=0?'+':''}${m.value}</li>`).join('')}</ul><p>Concealed target adjustments: higher spotter elevation +1; target under cover −1; exposed +2; Veteran −1 / Green +1; Sniper or observer −1; A-rated weapon +1 / H or G! +2. Only applicable adjustments are used. Target details and the final total remain concealed.</p><p>A crosshairs result spots all enemies on the card. Confirm spends the command and draws once; Cancel spends nothing.</p><button data-cancel>Cancel</button><button data-confirm class="primary">Confirm spotting · ${cost} command(s)</button>`;
  const close=()=>{dialog.close();dialog.remove();returnFocus?.focus();};
  dialog.oncancel=e=>{e.preventDefault();close();};dialog.querySelector('[data-cancel]').onclick=close;
  dialog.querySelector('[data-confirm]').onclick=()=>{close();confirm();};root.append(dialog);dialog.showModal();
}
