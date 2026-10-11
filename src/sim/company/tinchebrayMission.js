import {tinchebray as vire,validateTinchebrayContent} from '../../scenarios/tinchebray.js';
import {createMission} from './engine.js';
import {materializeScenario} from './missionSetup.js';
import {createCampaignRoster,rosterSnapshot} from './campaignRoster.js';
import {initializeVireAdapter} from './vireIntegration.js';
import {rosterVehicleDeployment} from './vireDeployment.js';
import {tinchebrayVehicleDeployments as vireVehicleDeployments} from './tinchebrayDeployment.js';
import {recordAttemptStart} from './attemptRecords.js';
import {refresh} from './battlefield.js';
import {deployCompanyJeep,synchronizeJeepPassengers} from './vehicleJeep.js';
import {embarkInfantry} from './vehicleTransport.js';
export function createTinchebrayMissionRoster(){
 const vehicles=['initial','event'].flatMap(force=>vireVehicleDeployments(force)).map(v=>({id:v.id,name:v.name,kind:'VEHICLE',steps:v.crew.length,experience:v.experience}));
 return createCampaignRoster(vire.rules.baselineCompanyId,{...vire,units:[...vire.units,...vehicles]});
}
// Explicit development entry only. Normal createMission(vire) remains gated.
export function createTinchebrayDevelopmentMission(seed,setup={},vehiclePositions={},options={}){
 validateTinchebrayContent();
 if(Object.keys(options).some(k=>!['mission_instance_id','roster','jeep'].includes(k)))throw new Error('Unknown Tinchebray development choice.');
 const deployments=vireVehicleDeployments('initial',vehiclePositions),roster=options.roster??createTinchebrayMissionRoster();
 materializeScenario(vire,seed,setup);
 const base=createMission(vire,seed,setup,{mission_instance_id:options.mission_instance_id??globalThis.crypto.randomUUID(),roster},{development:'tinchebray'});
 let s=initializeVireAdapter(base,deployments.map(d=>rosterVehicleDeployment(base,d)));
 s.vire_runtime.normal_phase_enabled=true;s.vire_runtime.basic_fire_enabled=true;s.vire_runtime.tank_support_used=false;
 s.vire_runtime.mission_setup={vehicle_positions:Object.fromEntries(deployments.map(v=>[v.id,v.location]))};
 const jeep=deployCompanyJeep(s,options.jeep);
 if(jeep){s.vire_runtime.mission_setup.jeep=structuredClone(options.jeep);if(options.jeep.passengers?.length)s.vire_runtime.vehicles[jeep.id]=embarkInfantry(s,jeep,options.jeep.passengers);synchronizeJeepPassengers(s);}
 s.roster_snapshot=rosterSnapshot(roster);refresh(s);
 s.attempt_records=[];delete s.vire_runtime.initial_state;recordAttemptStart(s);s.vire_runtime.initial_state=structuredClone(s);
 return s;
}
