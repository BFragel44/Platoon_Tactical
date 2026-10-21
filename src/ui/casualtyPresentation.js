export function equipmentAreaLabel(view,asset){
 if(!asset.cover)return 'Out of cover';
 const covers=(view.locations.find(l=>l.id===asset.location)?.covers??[]).filter(c=>c.known!==false);
 const index=covers.findIndex(c=>c.id===asset.cover);
 return index>=0?`C${index+1} - ${covers[index].type}`:'Under cover';
}
export function casualtyEvacuationStatus(view,casualty){
 if(casualty.evacuated)return 'Evacuated';
 if(casualty.carrier_name)return 'Carried by '+casualty.carrier_name;
 if(casualty.location===(view.objectives?.ccp?.location??view.objectives?.ccp))return casualty.transported?'At CCP · awaiting cleanup evacuation':'At CCP · transport and drop-off still required';
 return 'Awaiting pickup';
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function enemyCasualtyStatus(casualty){
 if(casualty.evacuated)return 'Removed from battlefield';
 if(casualty.last_known)return 'Last observed here · current position unconfirmed';
 if(casualty.carrier_name)return `Carried by ${casualty.carrier_name}`;
 return 'Uncaptured · checked during Mutual capture';
}
export function enemyCasualtyMarkers(view,location){
 return (view.enemy_casualties??[]).filter(c=>c.location===location.id&&!c.evacuated).map(c=>`<div class="casualty-marker enemy-casualty-marker" role="group" aria-label="Enemy casualty" title="Capture is checked during Mutual capture. The card must have no remaining enemy units and be friendly-occupied or have no unresolved Potential Contact."><b>✚ ${esc(c.label)}</b><small>${esc(enemyCasualtyStatus(c))} · ${esc(c.cover?location.covers.find(x=>x.id===c.cover)?.type??'cover':c.last_known?'Last known card':'Out of cover')}</small></div>`).join('');
}
