// Fire-only records: never insert vehicle crews into the infantry target roster.
import {emit} from './core.js';
import {atProfile} from './vehicleCombat.js';
export function vehicleFireSource(v){
 const p=atProfile(v.profile);
 if(v.status!=='ACTIVE'||!p.vof||v.ammo<=0||p.group==='TANK'&&(v.passengers.length||v.transported_casualties.length))return null;
 return {...v,name:v.name??v.id,kind:'VEHICLE',steps:v.crew,removed:null,cohesion:'GOOD',cover:null,vof:p.vof,range:v.basic_range??3,radios:v.radios??[],assets:{},used:[],exposed:false};
}
export function vehicleFireSources(s){return s.vire_runtime?.basic_fire_enabled?Object.values(s.vire_runtime.vehicles).map(vehicleFireSource).filter(Boolean):[];}
export function storeVehicleFire(s,sources){
 for(const source of sources){const v=s.vire_runtime.vehicles[source.id];for(const key of ['fire','fire_direction','fire_effect'])v[key]=structuredClone(source[key]??null);}
 for(const v of Object.values(s.vire_runtime?.vehicles??{}))if(!sources.some(u=>u.id===v.id)){v.fire=null;v.fire_direction=null;v.fire_effect=null;}
}

export function withdrawEmptyTank(s,v){
 if(v.status==='ACTIVE'&&atProfile(v.profile).group==='TANK'&&v.ammo===0){v.status='RETREATED';v.removal_reason='AMMO_EXHAUSTED';v.fire=null;emit(s,'VEHICLE_AMMO_EXHAUSTED','Tank ammunition exhausted; vehicle withdraws.',{actor:v.id,location:v.location},v.faction==='enemy'&&!s.knowledge.spotted[v.id]);}
}

export function vehicleBasicTargets(s,u){
 if(!s.vire_runtime?.basic_fire_enabled)return [];
 const vehicles=Object.values(s.vire_runtime.vehicles).filter(v=>v.status==='ACTIVE'&&atProfile(v.profile).target_type==='V');
 const riders=vehicles.flatMap(v=>[...new Set(v.passengers.map(step=>step.origin_formation))].filter(id=>id&&s.units[id]?.removed==='EMBARKED').map(id=>({...s.vire_runtime.embarked_formations[id].formation,location:v.location,cover:null,removed:null,exposed:true,embarked_on:v.id,steps:v.passengers.filter(step=>step.origin_formation===id)})));
 return riders.concat((['A','H'].includes(u.vof)&&(u.kind==='VEHICLE'||u.at_profile||u.kind==='FLAK88'))?[]:vehicles.map(v=>({...v,steps:v.crew.length?v.crew:v.passengers,removed:null,cover:null,cohesion:'GOOD'})));
}

export function vehicleOnlyBasicBlocked(s,u,location){
 return !!s.vire_runtime?.basic_fire_enabled&&['A','H'].includes(u.vof)&&(u.kind==='VEHICLE'||u.at_profile||u.kind==='FLAK88')&&![...Object.values(s.units),...vehicleBasicTargets(s,u)].some(t=>t.steps.length&&!t.removed&&t.location===location&&t.faction!==u.faction&&(u.faction==='enemy'||s.knowledge.spotted[t.id]));
}
