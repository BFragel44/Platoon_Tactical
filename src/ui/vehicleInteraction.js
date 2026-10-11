import {spottingLocations,occupants,unitLos} from '../sim/company/battlefield.js';
import {applyVireOperation,getVirePublicState} from '../sim/company/vireIntegration.js';

// Validate a proposed operation against a disposable copy; no live draws or writes.
export function vehicleOperationAvailable(state,operation){
 try{applyVireOperation(state,{...operation,id:`ui_preview_${state.vire_runtime.operations.length}`});return true;}catch{return false;}
}
export function vehicleMoveDestinations(state,vehicle,path=[]){
 const origin=state.locations[path.at(-1)??state.vire_runtime.vehicles[vehicle]?.location];
 if(!origin)return [];
 return Object.values(state.locations).filter(l=>Math.max(Math.abs(l.row-origin.row),Math.abs(l.col-origin.col))===1&&vehicleOperationAvailable(state,{type:'PREPARE_VEHICLE_MOVE',vehicle,path:[...path,l.id]})).map(l=>l.id);
}
// Acknowledge movement through one card, retaining every operation in the replay.
// Stop for HITs, reactions, Quick Shots, or the next per-card stop/fire decision.
export function submitVehicleInteraction(state,operation){
 let next=applyVireOperation(state,{...operation,id:`vehicle_ui_${state.vire_runtime.operations.length+1}`});
 if(!['PREPARE_VEHICLE_MOVE','STEP_VEHICLE_MOVE'].includes(operation.type))return next;
 for(let i=0;i<8;i++){
  const rt=next.vire_runtime,m=rt.move;
  if(!m||m.complete||rt.quick||rt.reaction?.eligible.length||rt.pending_hits.some(h=>!h.resolved)||m.stage==='REACTION')break;
  next=applyVireOperation(next,{type:'STEP_VEHICLE_MOVE',id:`vehicle_ui_${rt.operations.length+1}`});
 }
 return next;
}
export function vehicleContext(state,vehicle,path=[]){
 const view=getVirePublicState(state),v=view.vehicles.find(v=>v.id===vehicle);
 const base={vehicle,firer:vehicle};
 const knownTargets=view.vehicles.filter(t=>t.faction==='enemy'&&t.status==='ACTIVE'&&t.target_type==='V');
 const targets=type=>knownTargets.filter(t=>vehicleOperationAvailable(state,{...base,type,target:t.id}));
 return {view,vehicle:v,base,moveDestinations:vehicleMoveDestinations(state,vehicle,path),fireTargets:targets('AT_FIRE'),reactionTargets:targets('REACTION_FIRE'),quickTargets:targets('QUICK_SHOT')};
}

// Extend the existing company order menu without changing historical command records.
export function companyVehicleActivationOperation(state,{type,unit_id,issuer_id,target_id}){
 const target=state.vire_runtime?.vehicles[target_id];
 if(type!=='ACTIVATE'||!state.vire_runtime?.normal_phase_enabled||target?.command_role!=='vehicle_platoon_hq'||unit_id!==issuer_id||issuer_id!==state.impulse?.hq||state.units[unit_id]?.command_role!=='company_commander')return null;
 return {type:'ACTIVATE_VEHICLE_HQ',vehicle:target_id};
}
export function withVehicleHQActivationTargets(state,unit,issuer,options){
 if(!state.vire_runtime?.normal_phase_enabled||unit.id!==issuer||state.units[unit.id]?.command_role!=='company_commander')return options;
 const hqs=getVirePublicState(state).vehicle_hqs;
 return options.map(option=>{
  if(option.type!=='ACTIVATE')return option;
  const extra=hqs.map(h=>{let reason=null;try{applyVireOperation(state,{id:`activation_preview_${state.vire_runtime.operations.length}`,type:'ACTIVATE_VEHICLE_HQ',vehicle:h.id});}catch(error){reason=state.activated.includes(h.id)?'Already activated. Complete Company HQ’s impulse, then select this HQ in subordinate activation.':error.message;}return {id:h.id,reason};});
  const targets=[...option.targets,...extra];return {...option,targets,available:targets.some(t=>!t.reason)};
 });
}

export function vehicleSpotLocations(state,vehicle){
 const v=state.vire_runtime?.vehicles[vehicle];if(!v||v.faction!=='friendly')return [];
 const observer={...v,kind:'VEHICLE',cover:null,steps:v.crew.length?v.crew:v.passengers};
 return spottingLocations(state).filter(id=>occupants(state,id).some(t=>t.faction!==v.faction&&!state.knowledge.spotted[t.id]&&unitLos(state,observer,t))&&vehicleOperationAvailable(state,{type:'VEHICLE_SPOT',vehicle,location:id}));
}

export function vehicleTransportChoices(state,vehicle){
 const view=getVirePublicState(state),v=state.vire_runtime?.vehicles[vehicle];
 if(!v||v.faction!=='friendly')return {passengers:[],loadAssets:[],loadCasualties:[],unloadAssets:[],unloadCasualties:[]};
 const sameArea=item=>item?.location===v.location&&(item.area??null)===(v.area??null);
 const carried=view.carried_loads.find(load=>load.vehicle===vehicle);
 return {passengers:view.passenger_formations.filter(p=>!p.embarked_on&&p.location===v.location),loadAssets:view.ground_loads.assets.filter(a=>sameArea(state.assets.find(item=>item.id===a.id))&&['AMMO','RADIO','EQUIPMENT'].includes(a.type)),loadCasualties:view.ground_loads.casualties.filter(c=>sameArea(state.casualties.find(item=>item.id===c.id))),unloadAssets:carried?.assets??[],unloadCasualties:carried?.casualties??[]};
}
