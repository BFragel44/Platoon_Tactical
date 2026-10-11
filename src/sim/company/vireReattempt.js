import {synchronizeJeepPassengers} from './vehicleJeep.js';
import {secureStatus} from './missionFeatures.js';
import {disembarkInfantry} from './vehicleTransport.js';
import {atProfile} from './vehicleCombat.js';
import {synchronizeVireATUnits} from './vireUnits.js';
export function prepareVireReattemptInput(state,choices){
 if(state.status!=='DEFEAT'||state.attempt_number<1||state.attempt_number>(state.mission_rules.tinchebray?2:1)||state.reattempt_declined)throw new Error('No vehicle mission reattempt is available.');
 if(!choices||!choices.vehicle_positions||Array.isArray(choices.vehicle_positions))throw new Error('Choose secured reattempt positions for surviving vehicles.');
 const vehicles=Object.values(state.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&atProfile(v.profile).target_type==='V');
 const secured=Object.keys(state.locations).filter(id=>secureStatus(state,id).secured);
 if(Object.keys(choices.vehicle_positions).length!==vehicles.length||vehicles.some(v=>!secured.includes(choices.vehicle_positions[v.id]))||Object.keys(choices.vehicle_positions).some(id=>!vehicles.some(v=>v.id===id)))throw new Error('Deploy only surviving vehicles, each on a secured card.');
 for(const location of new Set(Object.values(choices.vehicle_positions)))if(!state.locations[location].staging&&vehicles.filter(v=>choices.vehicle_positions[v.id]===location).length>4)throw new Error('Reattempt exceeds the four-vehicle card limit.');
 const s=structuredClone(state);synchronizeJeepPassengers(s);
 for(const v of vehicles){
  const current=s.vire_runtime.vehicles[v.id],units=[...new Set(current.passengers.map(step=>step.origin_formation))];
  if(units.length)s.vire_runtime.vehicles[v.id]=disembarkInfantry(s,current,units);
 }
 // §3.9(9): wrecks persist and burning wrecks become ordinary discovered cover.
 for(const marker of s.markers.filter(m=>m.type==='BURNING_WRECK'))if(!s.locations[marker.location].covers.some(c=>c.id===marker.id))s.locations[marker.location].covers.push({...marker,type:'Wreck',value:1,known:true,discovered:true,provides_cover:true});
 return s;
}
export function finishVireReattempt(s,choices){
 const rt=s.vire_runtime;
 for(const v of Object.values(rt.vehicles)){
  if(v.status==='ACTIVE'&&atProfile(v.profile).target_type==='V'){
   if(v.faction==='friendly')v.location=choices.vehicle_positions[v.id];
   v.ammo=v.initial_resources.ammo;v.radios=structuredClone(v.initial_resources.radios);v.passengers=[];v.cargo=[];v.transported_casualties=[];
   if(v.mounted_arty_radio&&s.units.artyfo)s.units.artyfo.radios=s.units.artyfo.radios.filter(r=>r!=='ARTY');
  }
  v.pinned=false;v.attacked=false;v.saved=0;v.activated=false;v.moved_fired=false;v.action_taken=false;v.moved_before_fire=false;v.fire=null;v.fire_direction=null;
 }
 for(const key of ['coordinator','move','quick','reaction','end_vof','pending_fire','disembark'])rt[key]=null;
 rt.phase_complete=false;rt.infantry_combat_prepared=false;rt.pending_hits=[];
 // Retreat/KO/Brewed Up statuses and the one M5 platoon's used flag survive.
 synchronizeVireATUnits(s);
}
