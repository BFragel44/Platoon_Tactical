import {visible} from './core.js';
// Publish only casualties whose loss was observed. Do not expose casualty
// personnel records, unseen formations, or a hidden carrier's new position.
export function publicEnemyCasualties(s,events){
 const observed=new Map(events.filter(e=>e.type==='CASUALTY'&&e.step_id).map(e=>[e.step_id,e]));
 return s.casualties.filter(c=>c.faction==='enemy'&&observed.has(c.step.id)).map(c=>{
  const event=observed.get(c.step.id),carrier=c.carrier?s.units[c.carrier]:null,knownCarrier=carrier&&visible(s,carrier);
  const confirmed=knownCarrier||!carrier&&c.location===event.location;
  const location=confirmed?c.location:event.location;
  const cover=confirmed&&s.locations[location]?.covers.some(v=>v.id===c.cover&&v.known!==false)?c.cover:null;
  return {id:c.id,faction:'enemy',location,cover,evacuated:!!c.evacuated,last_known:!confirmed,
   label:`${c.origin_name??'Enemy formation'} casualty step`,carrier_name:knownCarrier?carrier.name:null};
 });
}
