import {deviceText} from './deviceLabels.js';
// Display names are derived only from discovered cover in the player view.
export function coverLabel(view,id) {
  for(const l of view.locations){
    const cover=l.covers.find(c=>c.id===id);if(!cover)continue;
    const title=c=>{const peers=l.covers.filter(v=>v.type===c.type);return `${c.type}${peers.length>1?' '+(peers.findIndex(v=>v.id===c.id)+1):''}`;};
    const parent=l.covers.find(c=>c.id===cover.parent);
    return `C${l.covers.findIndex(c=>c.id===cover.id)+1} · ${title(cover)}${parent?' above '+title(parent):''} · +${cover.value} protection${cover.capacity?' · '+cover.capacity+'-step capacity':''}`;
  }
}
export function movingFormationIds(option,target,enabled=true) {
  if(!enabled||!['PLATOON_MOVE','PLATOON_INFILTRATE'].includes(option?.type))return [];
  const selected=option.targets.find(t=>t.id===target);
  return selected&&!selected.reason?selected.moving_unit_ids??[]:[];
}
export function movementSpace(view,unit,option,target){
 if(option?.reason||option?.targets?.find(t=>t.id===target)?.reason)return null;
 if(!['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(option?.type))return null;
 const location=view.locations.find(l=>l.id===target);if(!location)return null;
 const friendly=view.units.filter(u=>u.faction==='friendly'&&u.steps&&!u.removed);
 const ids=['PLATOON_MOVE','PLATOON_INFILTRATE'].includes(option.type)?option.targets.find(t=>t.id===target)?.moving_unit_ids??[]:[unit.id];
 const incoming=friendly.filter(u=>ids.includes(u.id)&&u.location!==target).reduce((n,u)=>n+u.steps,0);
 const occupied=friendly.filter(u=>u.location===target).reduce((n,u)=>n+u.steps,0);
 return {name:location.name,occupied,incoming,total:occupied+incoming,limit:location.staging?null:16};
}
export const tacticalText=(view,text)=>deviceText(text).replace('Commander aborted the company assault.',`Commander aborted ${view.mission_name??'the mission'}.`).replace(/\bcover_\w+\b/g,id=>coverLabel(view,id)??'cover position');
