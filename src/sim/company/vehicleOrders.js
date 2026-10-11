import {attempt,emit,good} from './core.js';
import {hasFire,canFire,seesCard,refresh} from './battlefield.js';
import {vehicleHQRecord,vehicleCommandAuthority} from './vehicleCommand.js';
import {vehicleFireSource} from './vehicleFire.js';
import {atProfile} from './vehicleCombat.js';
const phases=['CO_ACTIVATION','SUBORDINATE_ACTIVATION','CO_INITIATIVE','PLATOON_INITIATIVE','STAFF_INITIATIVE','GENERAL_INITIATIVE'];
export function issueVehicleOrder(s,op){
 const v=s.vire_runtime.vehicles[op.vehicle],i=s.impulse,issuer=s.units[i?.hq]??vehicleHQRecord(s,i?.hq);
 if(s.status!=='ACTIVE'||!phases.includes(s.phase)||s.vire_runtime.coordinator||!i||i.commands<1||i.hq!=='general'&&i.spent>=4||v?.status!=='ACTIVE'||v.faction!=='friendly'||atProfile(v.profile).target_type!=='V')throw Error('Vehicle command unavailable.');
 if(i.hq!=='general'&&(!good(issuer)||!vehicleCommandAuthority(s,issuer,v)))throw Error('No authorized vehicle radio command link.');
 const orders=v.command_orders??[];if(orders.some(o=>o.impulse===i.id&&o.type===op.type))throw Error('This vehicle already performed that order in this impulse.');
 const source=vehicleFireSource(v),origin=i.hq==='general'?{...v,cohesion:'GOOD',steps:v.crew}:issuer;
 if(op.type==='VEHICLE_RALLY'){
  if(!v.pinned)throw Error('Vehicle is not pinned.');
  const success=!hasFire(s,v.location)||attempt(s,origin,2,'rally',`${v.name}: remove vehicle pin`,false)>0;
  if(success)v.pinned=false;
  emit(s,'VEHICLE_RALLY',`${v.name}: ${success?'pin removed':'rally failed'}.`,{actor:v.id,success});
 }else{
  if(!source||!v.fire)throw Error('Vehicle is not maintaining basic fire.');
  const shift=op.type==='VEHICLE_SHIFT_FIRE',target=op.location;
  if(shift&&(!s.locations[target]||s.locations[target].staging||!seesCard(s,origin,target)||!canFire(s,source,target)||Object.values(s.units).some(u=>u.faction==='enemy'&&u.steps.length&&!u.removed&&u.location===target&&!s.knowledge.spotted[u.id])))throw Error('Choose an eligible visible card in the originator and weapon LOS.');
  const affected=[...Object.values(s.units),...Object.values(s.vire_runtime.vehicles)].filter(u=>u.faction==='friendly'&&u.location===v.location);
  for(const u of affected){u.fire=shift?target:null;u.fire_direction=null;u.indirect=null;delete u.temporary_pdf;}
  emit(s,'VEHICLE_FIRE_ORDER',`${shift?'Shift':'Cease'} fire order passed to friendly occupants of ${s.locations[v.location].name}.`,{actor:v.id,location:v.location,target:shift?target:null});
 }
 v.command_orders=[...orders,{impulse:i.id,type:op.type}];i.commands--;i.spent++;refresh(s);
}
