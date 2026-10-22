import {getVirePublicState} from '../sim/company/vireIntegration.js';
import {counterReadiness} from './formationGrid.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function vehicleCounterLabel(vehicle){
 if(vehicle.profile==='JEEP')return 'Jeep';
 const model=({M4_SHERMAN75:'M4',M10_TD76:'M10',M5_LIGHT37:'M5'})[vehicle.profile];
 if(model){
  if(/(?:^|[_\s])hq(?:$|[_\s])/i.test(vehicle.id)||/\bHQ\b/i.test(vehicle.name??''))return `${model} HQ`;
  const number=vehicle.id.match(/(?:_|-)(\d+)$/)?.[1]??vehicle.name?.match(/^(\d+)\//)?.[1];
  return number?`${model} ${number}`:model;
 }
 return (vehicle.name??vehicle.id).replaceAll('_',' ');
}
export function vehicleAmmoMarkup(vehicle,startingAmmo=vehicle.ammo){
 if(vehicle.profile==='JEEP'||!Number.isSafeInteger(vehicle.ammo)||vehicle.ammo<0)return '';
 return counterReadiness({steps:0,max_steps:0,ammo:{vehicle:vehicle.ammo},initial_resources:{ammo:{vehicle:startingAmmo}}}).ammo;
}
export function vehicleCounters(state,location){
 if(!state.vire_runtime)return '';
 const v=getVirePublicState(state);
 return `<div class="vehicle-counter-grid">${v.vehicles.filter(t=>t.target_type==='V'&&t.location===location&&!['RETREATED','UNAVAILABLE'].includes(t.status)).map(t=>`<button type="button" class="vehicle-map-counter" data-vehicle="${esc(t.id)}" title="${esc(`${t.name??vehicleCounterLabel(t)}${t.ammo!==null&&t.profile!=='JEEP'?` - ${t.ammo} ammo remaining`: ''}`)}" aria-label="${esc(`${t.name??vehicleCounterLabel(t)} · ${t.status}${t.ammo!==null?` · ${t.ammo} ammo`:''}${t.pinned?' · pinned':''}`)}"><b style="font-size:${Math.min(16,80/(vehicleCounterLabel(t).length*.65))}px">${esc(vehicleCounterLabel(t))}</b><span>${esc(t.status==='ACTIVE'?t.profile==='JEEP'?'Jeep':t.profile==='M4_SHERMAN75'?'Sherman':t.profile==='M10_TD76'?'M10 tank destroyer':'M5 light tank':t.status.replaceAll('_',' '))}</span>${vehicleAmmoMarkup(t,state.vire_runtime.vehicles[t.id]?.initial_resources?.ammo??t.ammo)}<small>${t.pinned?'PIN · ':''}${t.moved_fired?'Moved/Fired':t.activated?'Activated':''}</small></button>`).join('')}</div>`;
}
