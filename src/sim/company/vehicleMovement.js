import {atProfile} from './vehicleCombat.js';
import {vehicleLoadReason} from './vehicleCargo.js';
// A serializable per-card move continuation. Integrating callers must resolve
// each VOF and reaction window before acknowledging it; this module never draws.
export function beginVehicleMove(vehicle,locations,path){
 const p=atProfile(vehicle.profile);
 const loadReason=vehicleLoadReason(vehicle);if(loadReason)throw new Error(loadReason);
 if(vehicle.status!=='ACTIVE'||!vehicle.activated||vehicle.moved_fired||!p.mobile||!Array.isArray(path)||!path.length)throw new Error('Vehicle cannot begin this move.');
 let previous=locations[vehicle.location];
 if(!previous)throw new Error('Unknown vehicle origin.');
 for(let i=0;i<path.length;i++){
  const next=locations[path[i]];
  if(!next||Math.max(Math.abs(next.row-previous.row),Math.abs(next.col-previous.col))!==1||next.trafficability==='NO')throw new Error('Illegal vehicle movement path.');
  if(next.trafficability==='SLOW'&&i<path.length-1)throw new Error('Vehicle must stop on SLOW terrain.');
  previous=next;
 }
 return {vehicle:structuredClone(vehicle),path:[...path],index:0,stage:'VOF_ORIGIN',entered:[],complete:false};
}
export function stepVehicleMove(state,acknowledgedStage){
 if(state.complete||state.stage!==acknowledgedStage)throw new Error('Invalid vehicle movement continuation.');
 const s=structuredClone(state);
 if(s.stage==='VOF_ORIGIN')s.stage='ENTER';
 else if(s.stage==='ENTER'){
  s.vehicle.location=s.path[s.index];s.entered.push(s.vehicle.location);
  for(const passenger of s.vehicle.passengers)passenger.location=s.vehicle.location;
  s.stage='VOF_DESTINATION';
 }else if(s.stage==='VOF_DESTINATION')s.stage='REACTION';
 else if(s.stage==='REACTION'){
  if(++s.index<s.path.length)s.stage='VOF_ORIGIN';
  else{s.stage='COMPLETE';s.complete=true;s.vehicle.moved_fired=true;}
 }else throw new Error('Unsupported vehicle movement stage.');
 return s;
}
export function stopVehicleMove(state){
 if(state.complete||state.stage!=='REACTION')throw new Error('Stop only after entering a card and resolving its VOF.');
 const s=structuredClone(state);s.path=s.path.slice(0,s.index+1);return s;
}
