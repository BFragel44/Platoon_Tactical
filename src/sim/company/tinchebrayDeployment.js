import {tinchebray} from '../../scenarios/tinchebray.js';
import {tinchebrayContent} from '../../scenarios/tinchebrayContent.js';
import {missionVehicleDeployments} from './vireDeployment.js';
import {createCampaignRoster} from './campaignRoster.js';
export function tinchebrayVehicleDeployments(force='initial',positions={}){
 return missionVehicleDeployments(tinchebrayContent,force,positions);
}
export function createTinchebrayRoster(){
 const vehicles=['initial','event'].flatMap(force=>tinchebrayVehicleDeployments(force)).map(v=>({id:v.id,name:v.name,kind:'VEHICLE',steps:v.crew.length,experience:v.experience}));
 return createCampaignRoster(tinchebray.rules.baselineCompanyId,{...tinchebray,units:[...tinchebray.units,...vehicles]});
}
