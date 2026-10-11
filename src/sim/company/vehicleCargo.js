import {atProfile} from './vehicleCombat.js';
const ammoPerCapacity={MG:6,MTR:2,RCL:3,RKT:3,FT:1};
export function vehicleLoadReason(v){
 const capacity=atProfile(v.profile).capacity??0,ammo=v.cargo.filter(a=>a.type==='AMMO'),types=new Set(ammo.map(a=>a.key));
 if(types.size>1||Number(v.passengers.length>0)+Number(v.transported_casualties.length>0)+Number(ammo.length>0)>1)return 'Vehicle can transport passengers, casualties or one ammunition type, not mixed payloads.';
 if(v.passengers.length>capacity||v.transported_casualties.length>capacity)return 'Vehicle passenger/casualty capacity exceeded.';
 if(ammo.some(a=>!ammoPerCapacity[a.key]||!Number.isInteger(a.quantity)||a.quantity<1))return 'Unsupported or invalid transported ammunition.';
 for(const key of types)if(ammo.filter(a=>a.key===key).reduce((n,a)=>n+a.quantity,0)>capacity*ammoPerCapacity[key])return 'Vehicle ammunition capacity exceeded.';
 return null;
}
export function transferVehicleCargo(s,vehicle,{load_assets=[],unload_assets=[],load_casualties=[],unload_casualties=[]}){
 const v=structuredClone(vehicle);
 for(const ids of [load_assets,unload_assets,load_casualties,unload_casualties])if(!Array.isArray(ids)||new Set(ids).size!==ids.length)throw new Error('Select distinct load identities.');
 if(load_assets.some(id=>unload_assets.includes(id))||load_casualties.some(id=>unload_casualties.includes(id)))throw new Error('A load cannot be loaded and unloaded in the same order.');
 for(const id of unload_assets){const a=v.cargo.find(a=>a.id===id);if(!a)throw new Error('Carried asset unavailable.');s.assets.push({...a,location:v.location,area:v.area??null,cover:null,carrier:null});v.cargo=v.cargo.filter(a=>a.id!==id);}
 for(const id of unload_casualties){const c=v.transported_casualties.find(c=>c.id===id),original=s.casualties.find(c=>c.id===id);if(!c||!original||original.carrier!==v.id)throw new Error('Carried casualty unavailable.');Object.assign(original,{location:v.location,area:v.area??null,cover:null,carrier:null});v.transported_casualties=v.transported_casualties.filter(c=>c.id!==id);}
 for(const id of load_assets){const a=s.assets.find(a=>a.id===id);if(!a||a.destroyed||a.carrier||a.location!==v.location||(a.area??null)!==(v.area??null)||!['RADIO','EQUIPMENT','AMMO'].includes(a.type))throw new Error('Ground asset unavailable in vehicle area.');v.cargo.push({...structuredClone(a),carrier:v.id});s.assets=s.assets.filter(a=>a.id!==id);}
 for(const id of load_casualties){const c=s.casualties.find(c=>c.id===id);if(!c||c.evacuated||c.carrier||c.unavailable||c.faction!==v.faction||c.location!==v.location||(c.area??null)!==(v.area??null))throw new Error('Ground casualty unavailable in vehicle area.');v.transported_casualties.push({...structuredClone(c),carrier:v.id});c.carrier=v.id;c.location=null;c.cover=null;}
 const reason=vehicleLoadReason(v);if(reason)throw new Error(reason);return v;
}
