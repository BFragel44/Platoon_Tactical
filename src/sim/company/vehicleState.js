import {atProfile} from './vehicleCombat.js';
import {vehicleLoadReason} from './vehicleCargo.js';

// Gated vehicle domain. Infantry adapters must consume pending HITs with the
// existing combat procedure before a live phase can continue.
export function createVehicle({id,profile,faction,location,area=null,crew=[],ammo=0,ambushSusceptible=false}){
 const p=atProfile(profile);
 if(!id||!location||!['friendly','enemy'].includes(faction)||p.target_type!=='V'||crew.length!==p.crew_steps||!Number.isInteger(ammo)||ammo<0||crew.some(step=>!step.id)||new Set(crew.map(s=>s.id)).size!==crew.length)throw new Error('Invalid vehicle deployment/crew.');
 return {id,profile,faction,location,area,crew:structuredClone(crew),ammo,ambush_susceptible:ambushSusceptible,status:'ACTIVE',pinned:false,attacked:false,activated:false,moved_fired:false,passengers:[],cargo:[],transported_casualties:[],applied_results:[]};
}
export function embarkVehicle(vehicle,steps){
 const p=atProfile(vehicle.profile);
 const aboard=[...vehicle.crew,...vehicle.passengers,...vehicle.transported_casualties];
 if(vehicle.status!=='ACTIVE'||!Array.isArray(steps)||!steps.length||vehicle.passengers.length+vehicle.transported_casualties.length+steps.length>p.capacity||steps.some(s=>!s.id||s.location!==vehicle.location||(s.area??null)!==(vehicle.area??null))||new Set([...aboard,...steps].map(s=>s.id)).size!==aboard.length+steps.length)throw new Error('Invalid vehicle embarkation/capacity.');
 const v=structuredClone(vehicle);v.passengers.push(...steps.map(s=>({...structuredClone(s),exposed:true,embarked_on:v.id})));const reason=vehicleLoadReason(v);if(reason)throw new Error(reason);return v;
}
export function disembarkVehicle(vehicle,stepIds,{cover=null}={}){
 if(vehicle.status!=='ACTIVE'||!Array.isArray(stepIds)||!stepIds.length||new Set(stepIds).size!==stepIds.length||stepIds.some(id=>!vehicle.passengers.some(s=>s.id===id)))throw new Error('Invalid passenger disembarkation.');
 const v=structuredClone(vehicle),steps=v.passengers.filter(s=>stepIds.includes(s.id)).map(s=>({...s,location:v.location,area:v.area??null,cover,exposed:true,embarked_on:null}));
 v.passengers=v.passengers.filter(s=>!stepIds.includes(s.id));return {vehicle:v,steps};
}
export function applyVehicleResult(vehicle,{id,result}){
 if(!id||!['BREWED_UP','KNOCKED_OUT','RETREAT','PINNED','MISSED'].includes(result))throw new Error('Invalid vehicle result.');
 if(vehicle.status!=='ACTIVE'||vehicle.applied_results.includes(id))throw new Error('Vehicle result already applied or vehicle unavailable.');
 const v=structuredClone(vehicle),out={vehicle:v,casualties:[],fire_teams:[],pending_hits:[],dropped_assets:[],dropped_casualties:[],lost_items:[],wreck:null,removed_steps:[]};
 v.applied_results.push(id);v.attacked=true;
 const placed=step=>({...structuredClone(step),location:v.location,embarked_on:null,exposed:true});
 const tankRiders=atProfile(v.profile).group==='TANK'&&['BREWED_UP','KNOCKED_OUT','PINNED'].includes(result)?v.passengers:[];
 const steps=[...v.crew,...(tankRiders.length?[]:v.passengers)];
 if(result==='BREWED_UP'){
  v.status='BREWED_UP';out.wreck={id:`wreck_${v.id}`,location:v.location,type:'Burning Wreck',provides_cover:false};
  out.casualties=steps.map(s=>({...placed(s),status:'CASUALTY',disposition:'UNRESOLVED'}));
  out.lost_items=[...v.cargo,...v.transported_casualties];
 }else if(result==='KNOCKED_OUT'){
  v.status='KNOCKED_OUT';out.wreck={id:`wreck_${v.id}`,location:v.location,type:'Wreck',provides_cover:true};
  out.fire_teams=steps.map(s=>({...placed(s),cohesion:'F',cover:out.wreck.id}));
  out.pending_hits=steps.map(s=>({id:`${id}:hit:${s.id}`,step_id:s.id,location:v.location,reason:'KNOCKED_OUT'}));
  out.dropped_assets=v.cargo.filter(a=>a.type!=='AMMO');out.lost_items=v.cargo.filter(a=>a.type==='AMMO');
  out.dropped_casualties=v.transported_casualties.map(placed);
 }else if(result==='RETREAT'){
  v.status='RETREATED';out.removed_steps=steps.map(s=>({...structuredClone(s),status:'UNAVAILABLE',reason:'VEHICLE_RETREAT'}));
 }else if(result==='PINNED'){
  v.pinned=true;
 }
 // §10.8.2 overrides generic passenger destruction/Fire Team conversion.
 // Riders retain their current unit state and immediately take a HIT outside
 // the vehicle, even when its crew become casualties or generic Fire Teams.
 if(tankRiders.length){
  out.fire_teams.push(...tankRiders.map(placed));
  out.pending_hits.push(...tankRiders.map(s=>({id:`${id}:hit:${s.id}`,step_id:s.id,location:v.location,reason:`TANK_RIDER_${result}`})));
  v.passengers=[];
 }
 if(['BREWED_UP','KNOCKED_OUT'].includes(result)){v.crew=[];v.passengers=[];v.cargo=[];v.transported_casualties=[];v.ammo=0;}
 // Retreat removes the complete vehicle load from play without fabricating losses.
 return out;
}
export function finishVehicleCombatPhase(vehicle){
 const v=structuredClone(vehicle);if(v.status==='ACTIVE'&&!v.attacked)v.pinned=false;v.attacked=false;return v;
}
export function cleanupVehicleActivation(vehicle){const v=structuredClone(vehicle);v.activated=false;v.moved_fired=false;return v;}
