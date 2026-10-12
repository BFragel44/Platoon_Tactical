import {vire,validateVireContent} from '../../scenarios/vire.js';
import {vireContent} from '../../scenarios/vireContent.js';
import {previewMissionSetup} from './engine.js';
import {atProfile} from './vehicleCombat.js';
import {vireVehicleDeployments} from './vireDeployment.js';
import {createVireDevelopmentMission} from './vireMission.js';
export {vireVehicleDeployments};
export function previewVireSetup(seed,setup={},vehiclePositions={},jeep={}){
 validateVireContent(vireContent,{supportedEnemyKinds:vire.enemy_counters.map(u=>u.kind),supportedVehicleProfiles:Object.values(vireContent.vehicle_platoons).map(p=>{atProfile(p.profile);return p.profile;})});
 const view=previewMissionSetup(vire,seed,setup),vehicles=vireVehicleDeployments('initial',vehiclePositions);
 if(jeep.use)createVireDevelopmentMission(seed,setup,vehiclePositions,{jeep,mission_instance_id:'vire-setup-validation'});
 return {...view,vehicles,jeep_setup:{use:false,location:'r0c2',platoon:0,arty_radio:false,passengers:[],...jeep},vehicle_setup:{positions:Object.fromEntries(vehicles.map(v=>[v.id,v.location])),event_force:{profile:vireContent.vehicle_platoons.event.profile,vehicles:vireContent.vehicle_platoons.event.vehicles,entry_row:1}},
  assumptions:[...view.assumptions,'Fresh standalone company; no M5 battlefield or company import.','Accepted standalone Vire mission. Connected campaign carryover remains deferred.'],
  deferred_setup:[]};
}
