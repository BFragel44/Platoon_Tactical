import {draw,expMod,pick,live,emit} from './core.js';
import {atProfile} from './vehicleCombat.js';
import {withdrawEmptyTank} from './vehicleFire.js';
export function vehicleConcentrateTargets(s,v){
 return Object.values(s.units).filter(t=>live(t)&&t.faction!==v.faction&&(v.faction==='enemy'||s.knowledge.spotted[t.id])&&s.fire.some(f=>f.source===v.id&&f.target===t.location));
}
export function vehicleConcentrate(s,v,target){
 const hidden=v.faction==='enemy'&&!s.knowledge.spotted[v.id];
 if(!target.cover)target=pick(s,vehicleConcentrateTargets(s,v).filter(t=>t.location===target.location&&!t.cover),'Vehicle concentrated fire: random out-of-cover target',hidden);
 const p=atProfile(v.profile),icon=p.vof?'spot':'grenade';
 const batch=draw(s,Math.max(1,2+expMod(v)),`${v.id}: concentrated fire`,hidden);
 const successes=batch.filter(c=>c[icon]||c.word.toLowerCase()===icon).length;
 if(successes){s.markers.push({type:p.vof?'CONCENTRATE':'GRENADE',location:target.location,origin:v.location,source:v.id,target:target.cover?null:target.id,cover:target.cover,critical:successes>1,value:p.vof?(successes>1&&!target.cover?2:1):-4});v.ammo--;withdrawEmptyTank(s,v);}
 emit(s,'VEHICLE_CONCENTRATED_FIRE','Vehicle concentrated fire attempt completed.',{actor:v.id,target:target.id,location:target.location,success:successes>0,critical:successes>1,card_ids:batch.map(c=>c.id)},hidden);
}
