import {getVirePublicState} from '../sim/company/vireIntegration.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function vehicleCounters(state,location){
 if(!state.vire_runtime)return '';
 const v=getVirePublicState(state);
 return `<div class="vehicle-counter-grid">${v.vehicles.filter(t=>t.target_type==='V'&&t.location===location&&!['RETREATED','UNAVAILABLE'].includes(t.status)).map(t=>`<button type="button" class="vehicle-map-counter" data-vehicle="${esc(t.id)}" aria-label="${esc(`${t.id} · ${t.profile} · ${t.status}${t.ammo!==null?` · ${t.ammo} ammo`:''}${t.pinned?' · pinned':''}`)}"><b>${esc(t.id.replace('sherman','M4').replace('m5','M5'))}</b><span>${esc(t.status==='ACTIVE'?t.profile==='JEEP'?'Jeep':t.profile==='M4_SHERMAN75'?'Sherman':t.profile==='M10_TD76'?'M10 tank destroyer':'M5 light tank':t.status.replaceAll('_',' '))}</span>${t.ammo!==null?`<small>Ammo ${t.ammo}</small>`:''}<small>${t.pinned?'PIN · ':''}${t.moved_fired?'Moved/Fired':t.activated?'Activated':''}</small></button>`).join('')}</div>`;
}
