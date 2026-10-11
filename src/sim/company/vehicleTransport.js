import {live} from './core.js';
import {atProfile} from './vehicleCombat.js';
import {embarkVehicle,disembarkVehicle} from './vehicleState.js';

// Adapter-only infantry transport. Retain the original formation record while
// its steps are aboard; restore that identity when voluntarily disembarking.
export function embarkInfantry(s,vehicle,unitIds){
 if(!['TANK','JEEP'].includes(atProfile(vehicle.profile).group))throw new Error('Passenger integration unavailable.');
 if(!Array.isArray(unitIds)||!unitIds.length||new Set(unitIds).size!==unitIds.length)throw new Error('Select distinct passenger formations.');
 const units=unitIds.map(id=>s.units[id]);
 if(units.some(u=>!live(u)||u.faction!==vehicle.faction||u.pinned||u.location!==vehicle.location||(u.area??null)!==(vehicle.area??null)||u.embarked_on))throw new Error('Passengers must be unpinned in the vehicle card area.');
 const steps=units.flatMap(u=>u.steps.map(step=>({...structuredClone(step),location:u.location,area:u.area??null,cohesion:u.cohesion,experience:u.experience,origin_formation:u.id})));
 const v=embarkVehicle(vehicle,steps);
 if(vehicle.capacity!==undefined&&v.passengers.length>vehicle.capacity)throw Error('Vehicle passenger capacity exceeded.');
 if(vehicle.mounted_arty_radio&&unitIds.some(id=>id!=='artyfo'))throw Error('Artillery Jeep may only carry its artillery observer.');
 s.vire_runtime.embarked_formations??={};
 for(const u of units){s.vire_runtime.embarked_formations[u.id]={vehicle:v.id,formation:structuredClone(u)};if(v.profile!=='JEEP'){u.steps=[];u.removed='EMBARKED';u.fire=null;}u.embarked_on=v.id;u.cover=null;u.exposed=true;}
 s.fire=s.fire.filter(f=>!unitIds.includes(f.source));
 return v;
}
export function disembarkInfantry(s,vehicle,unitIds,covers={}){
 if(!Array.isArray(unitIds)||!unitIds.length||new Set(unitIds).size!==unitIds.length)throw new Error('Select distinct passenger formations.');
 const records=unitIds.map(id=>s.vire_runtime.embarked_formations?.[id]);
 if(records.some((r,i)=>!r||r.vehicle!==vehicle.id||!(s.units[unitIds[i]]?.removed==='EMBARKED'||vehicle.profile==='JEEP'&&s.units[unitIds[i]]?.embarked_on===vehicle.id)||!vehicle.passengers.some(step=>step.origin_formation===unitIds[i])))throw new Error('Passenger formation unavailable.');
 const stepIds=vehicle.passengers.filter(step=>unitIds.includes(step.origin_formation)).map(step=>step.id);
 if(!covers||Array.isArray(covers)||Object.keys(covers).some(id=>!unitIds.includes(id)))throw new Error('Choose cover only for selected passenger formations.');
 for(const coverId of new Set(Object.values(covers).filter(Boolean))){
  const cover=s.locations[vehicle.location].covers.find(c=>c.id===coverId&&c.discovered);
  const occupants=Object.values(s.units).filter(u=>!unitIds.includes(u.id)&&live(u)&&u.location===vehicle.location&&u.cover===coverId);
  const boarding=vehicle.passengers.filter(step=>covers[step.origin_formation]===coverId).length;
  if(!cover||occupants.some(u=>u.faction!==vehicle.faction)||(cover.capacity??16)<boarding+occupants.reduce((n,u)=>n+u.steps.length,0))throw new Error('No eligible room in discovered cover on the disembark card.');
 }
 const out=disembarkVehicle(vehicle,stepIds);
 for(let i=0;i<unitIds.length;i++){
  const id=unitIds[i],u=structuredClone(vehicle.profile==='JEEP'?s.units[id]:records[i].formation);
  u.steps=out.steps.filter(step=>step.origin_formation===id).map(step=>{const copy=structuredClone(step);delete copy.origin_formation;delete copy.embarked_on;return copy;});
  u.location=vehicle.location;u.area=vehicle.area??null;u.cover=covers[id]??null;u.exposed=true;u.removed=null;u.embarked_on=null;u.fire=null;
  s.units[id]=u;delete s.vire_runtime.embarked_formations[id];
 }
 return out.vehicle;
}

// During the infantry Combat Effects snapshot, tank riders are ordinary
// exposed targets but retain no fire of their own. Keep normal command and
// movement procedures from treating them as dismounted infantry between steps.
export function exposePassengersForCombat(s){
 for(const [id,record] of Object.entries(s.vire_runtime.embarked_formations??{})){
  const v=s.vire_runtime.vehicles[record.vehicle],steps=v?.passengers.filter(step=>step.origin_formation===id)??[];
  if(v?.profile==='JEEP')continue;
  if(v?.status!=='ACTIVE'||!steps.length)continue;
  const u=structuredClone(record.formation);
  u.steps=steps.map(step=>structuredClone(step));u.location=v.location;u.area=v.area??null;u.cover=null;u.exposed=true;u.removed=null;u.embarked_on=v.id;u.fire=null;u.indirect=null;
  s.units[id]=u;
 }
 s.markers=s.markers.filter(m=>!m.passenger_projection);
 for(const m of [...s.markers].filter(m=>m.type==='GRENADE'&&s.vire_runtime.vehicles[m.target]?.status==='ACTIVE')){
  for(const u of Object.values(s.units).filter(u=>live(u)&&u.embarked_on===m.target))s.markers.push({...structuredClone(m),target:u.id,passenger_projection:true});
 }
}
export function storePassengersAfterCombat(s){
 const rt=s.vire_runtime;
 for(const v of Object.values(rt.vehicles).filter(v=>v.status==='ACTIVE'&&atProfile(v.profile).group==='TANK')){
  const units=Object.values(s.units).filter(u=>u.embarked_on===v.id);
  if(!units.length)continue;
  v.passengers=[];
  for(const u of units){
   if(live(u)){
    rt.embarked_formations[u.id]={vehicle:v.id,formation:structuredClone(u)};
    v.passengers.push(...u.steps.map(step=>({...structuredClone(step),location:v.location,area:v.area??null,cohesion:u.cohesion,experience:u.experience,origin_formation:u.id})));
    u.steps=[];u.removed='EMBARKED';u.fire=null;
   }else{delete rt.embarked_formations[u.id];u.embarked_on=null;}
  }
 }
}
