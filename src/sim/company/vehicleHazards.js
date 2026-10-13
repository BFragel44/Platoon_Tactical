import {draw,emit} from './core.js';
export function checkVehicleMines(s,v){
 if(v.status!=='ACTIVE'||!s.locations[v.location]?.mines)return;
 const cards=draw(s,3,'Vehicle mine check',v.faction==='enemy'&&!s.knowledge.spotted[v.id],{actor:v.faction==='friendly'?v.id:null,field:{kind:'icons',keys:['burst','short']}});
 const hit=cards.some(c=>c.burst||c.multi||c.short);
 if(hit)s.markers.push({type:'MINES',target:v.id,location:v.location,value:-4});
 emit(s,'VEHICLE_MINE_CHECK','Vehicle checked for mines.',{actor:v.id,location:v.location,hit,card_ids:cards.map(c=>c.id)},v.faction==='enemy'&&!s.knowledge.spotted[v.id]);
}
export const vehicleSmoke=(s,location)=>s.locations[location]?.smoke?(s.locations[location].smoke_value??2):0;
