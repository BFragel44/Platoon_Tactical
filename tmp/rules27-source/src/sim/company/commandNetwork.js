import {values,friendly,live} from './core.js';
import {companyCommander} from './commandRoles.js';
import {communicationChannels,communicationReason} from './battlefield.js';
// Nominal parentage does not change when a commander is pinned or eliminated.
export function commandNetwork(s){
 const units=values(s.units).filter(friendly),co=companyCommander(s);
 const parents=units.map(u=>{
  const platoon=units.find(h=>h.kind==='HQ'&&h.platoon!=null&&h.platoon===u.platoon);
  const parent=u.id===co?.id||u.command_role==='higher_hq'?null:u.kind==='HQ'||u.platoon==null?co:platoon??co;
  const channels=parent?communicationChannels(s,parent,u):[];
  return {unit_id:u.id,parent_id:parent?.id??null,channels,connected:channels.length>0,reason:parent?communicationReason(s,parent,u):'Company command or attached higher headquarters.',active:live(u)};
 });
 return parents;
}
