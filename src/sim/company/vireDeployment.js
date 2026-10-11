import {vireContent} from '../../scenarios/vireContent.js';
import {tinchebrayContent} from '../../scenarios/tinchebrayContent.js';
import {atProfile} from './vehicleCombat.js';
import {createVehicle} from './vehicleState.js';
export function vireVehicleDeployments(force='initial',positions={}){
 return missionVehicleDeployments(vireContent,force,positions);
}
export function missionVehicleDeployments(content,force='initial',positions={}){
 const platoon=content.vehicle_platoons[force];
 if(!['initial','event'].includes(force)||!platoon||!positions||Array.isArray(positions)||typeof positions!=='object')throw new Error('Invalid Vire vehicle setup.');
 const ids=[`${platoon.id}_hq`,...Array.from({length:platoon.vehicles-1},(_,i)=>`${platoon.id}_${i+1}`)];
 if(Object.keys(positions).some(id=>!ids.includes(id)))throw new Error('Unknown Vire vehicle placement.');
 const p=atProfile(platoon.profile),row=force==='initial'?0:platoon.entry_row;
 return ids.map((id,i)=>{
  const location=positions[id]??`r${row}c${i%content.map.columns+1}`;
  if(!Array.from({length:content.map.columns},(_,c)=>`r${row}c${c+1}`).includes(location))throw new Error(force==='initial'?'Initial tanks must deploy in staging.':'Tank support must enter on Row 1.');
  const crew=Array.from({length:p.crew_steps},(_,n)=>({id:`${id}_crew_step${n+1}`,personnel:[],experience:platoon.experience,cohesion:'GOOD'}));
  // Validate against the same strict crew/profile contract used by execution.
  createVehicle({id,profile:platoon.profile,faction:'friendly',location,crew,ammo:platoon.ammo_each,ambushSusceptible:platoon.at_ambush});
  const label=platoon.profile==='M10_TD76'?'M10':force==='initial'?'Sherman':'M5';
  return {id,name:i===0?`${label} Platoon HQ`:`${i}/${label}`,profile:platoon.profile,faction:'friendly',location,crew,ammo:platoon.ammo_each,ambushSusceptible:platoon.at_ambush,
   experience:platoon.experience,command_role:i===0?'vehicle_platoon_hq':null,command_hq:ids[0],radios:i===0?['BN']:[]};
 });
}

export function rosterVehicleDeployment(s,deployment){
 const formation=s.roster_snapshot?.formations[deployment.id];
 if(!formation||formation.kind!=='VEHICLE'||formation.step_ids.length!==atProfile(deployment.profile).crew_steps)throw new Error('Missing vehicle crew deployment roster.');
 const crew=formation.step_ids.map(id=>{
  const step=s.roster_snapshot.steps[id];if(!step||step.formation_id!==deployment.id||step.disposition!=='ACTIVE')throw new Error('Vehicle crew is not available.');
  for(const person of step.person_ids)s.personnel[person]={...structuredClone(s.roster_snapshot.people[person]),status:'ACTIVE'};
  return {id,personnel:structuredClone(step.person_ids),experience:step.experience,cohesion:'GOOD'};
 });
 return {...deployment,crew,experience:formation.experience};
}
export function deployVireTankSupport(s,positions){
 if(!(s.mission_rules?.vire||s.mission_rules?.tinchebray)||!s.vire_runtime)throw new Error('Tank Support requires a vehicle mission runtime.');
 if(s.vire_runtime.tank_support_used)throw new Error('The M5 support platoon has already entered this mission.');
 const ids=vireVehicleDeployments('event').map(v=>v.id);
 if(!positions||Object.keys(positions).length!==ids.length||ids.some(id=>!Object.hasOwn(positions,id)))throw new Error('Choose a Row 1 entry card for all five M5 tanks.');
 const deployments=missionVehicleDeployments(s.mission_rules.tinchebray?tinchebrayContent:vireContent,'event',positions).map(d=>rosterVehicleDeployment(s,d));
 for(const location of new Set(deployments.map(d=>d.location))){const existing=Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&atProfile(v.profile).target_type==='V'&&v.location===location).length;if(existing+deployments.filter(d=>d.location===location).length>4)throw new Error('Tank Support exceeds the four-vehicle card limit.');}
 if(deployments.some(d=>s.vire_runtime.vehicles[d.id]))throw new Error('Tank Support identities already deployed.');
 for(const d of deployments)s.vire_runtime.vehicles[d.id]={...createVehicle(d),name:d.name,experience:d.experience,command_role:d.command_role,command_hq:d.command_hq,radios:d.radios,saved:0,initial_resources:{ammo:d.ammo,radios:structuredClone(d.radios)}};
 s.vire_runtime.tank_support_used=true;
 return Object.fromEntries(deployments.map(v=>[v.id,v.location]));
}
