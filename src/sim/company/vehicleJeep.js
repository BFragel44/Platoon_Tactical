import {createVehicle} from './vehicleState.js';
import {live} from './core.js';

// Normandy TO&E p.12 supplies one company Jeep, without a separate crew.
export function deployCompanyJeep(s,choice={}){
 if(!choice||Object.keys(choice).some(k=>!['use','location','platoon','arty_radio','passengers'].includes(k)))throw Error('Invalid company Jeep setup.');
 if(!choice.use)return;
 const location=choice.location??'r0c2',platoon=Number(choice.platoon)||null;
 if(!s.locations[location]?.staging||platoon&&!['hq1','hq2','hq3'].some(id=>s.units[id]?.platoon===platoon))throw Error('Jeep must start in staging with a legal platoon assignment.');
 const v={...createVehicle({id:'company_jeep',profile:'JEEP',faction:'friendly',location,crew:[]}),name:choice.arty_radio?'Artillery Jeep':'Company Jeep',radios:[],command_hq:platoon?`hq${platoon}`:null,experience:'Line',mounted_arty_radio:!!choice.arty_radio,capacity:choice.arty_radio?1:2,initial_resources:{ammo:0,radios:[]}};
 if(choice.arty_radio){const fo=s.units.artyfo;if(!fo?.radios.includes('ARTY'))throw Error('Artillery observer radio unavailable.');fo.radios=fo.radios.filter(r=>r!=='ARTY');fo.mounted_radio='company_jeep';}
 s.vire_runtime.vehicles[v.id]=v;
 return v;
}
export function synchronizeJeepPassengers(s){
 for(const v of Object.values(s.vire_runtime?.vehicles??{}).filter(v=>v.profile==='JEEP')){
  if(v.status!=='ACTIVE')continue;
  const units=Object.values(s.units).filter(u=>u.embarked_on===v.id&&live(u));
  v.passengers=units.flatMap(u=>u.steps.map(step=>({...structuredClone(step),origin_formation:u.id,location:v.location,exposed:u.exposed,experience:u.experience,cohesion:u.cohesion})));
  for(const u of units){u.location=v.location;u.cover=null;s.vire_runtime.embarked_formations??={};s.vire_runtime.embarked_formations[u.id]??={vehicle:v.id,formation:structuredClone(u)};}
  const driver=units[0];v.experience=driver?.experience??'Line';
  if(v.mounted_arty_radio&&units.some(u=>u.id==='artyfo'))v.activated=true;
 }
}
export function effectiveRadios(s,u){
 const v=s.vire_runtime?.vehicles[u.embarked_on];
 return u.mounted_radio&&v?.id===u.mounted_radio&&v.status==='ACTIVE'?[...u.radios,'ARTY']:u.radios;
}
