import {tinchebray} from '../../scenarios/tinchebray.js';
import {previewMissionSetup} from './engine.js';
import {tinchebrayVehicleDeployments} from './tinchebrayDeployment.js';
import {createTinchebrayDevelopmentMission} from './tinchebrayMission.js';
export function previewTinchebraySetup(seed,setup={},vehiclePositions={},jeep={}){
 const view=previewMissionSetup(tinchebray,seed,setup),vehicles=tinchebrayVehicleDeployments('initial',vehiclePositions);
 if(jeep.use)createTinchebrayDevelopmentMission(seed,setup,vehiclePositions,{jeep,mission_instance_id:'tinchebray-setup-validation'});
 return {...view,objective_rows:structuredClone(tinchebray.rules.objective_rows),vehicles,jeep_setup:{use:false,location:'r0c2',platoon:0,arty_radio:false,passengers:[],...jeep},vehicle_setup:{positions:Object.fromEntries(vehicles.map(v=>[v.id,v.location])),event_force:{profile:'M5_LIGHT37',vehicles:5,entry_row:1}},assumptions:[...view.assumptions,'Fresh standalone M7 company; no previous company or battlefield import.','Development candidate; normal mission selection remains gated.'],deferred_setup:[]};
}
