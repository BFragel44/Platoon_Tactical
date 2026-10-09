import {borders} from './terrain.js';
import {emit} from './core.js';
// New terrain is drawn only on the direction being considered. Feasibility callers
// use a private clone, so previews cannot spend terrain or alter history.
export function expandContactRay(s,origin,dc,range){
 if(!s.mission_rules?.contactExpansion)return;
 for(let step=1;step<=range;step++){
  const row=origin.row+step,col=origin.col+dc*step,id=`r${row}c${col}`;
  if(s.locations[id])continue;
  const drawn=[];let card,elevation=1;
  do {card=s.terrain_deck.pop();if(!card){s.terrain_deck.push(...drawn.reverse());return;}drawn.push(card);if(card.terrain==='hill')elevation++;}while(card.terrain==='hill');
  s.locations[id]={...structuredClone(card),id,row,col,name:`${row}.${col} ${card.name}${elevation>1?' / Hill':''}`,terrain_card:card.id,
   hills:drawn.slice(0,-1).map(c=>c.id),elevation,borders:elevation>1?borders():structuredClone(card.borders),staging:false,known:true,
   outside_boundary:true,covers:[],smoke:false};
  emit(s,'MAP_EXPANDED',`Terrain revealed beyond the mission boundary: ${s.locations[id].name}.`,{location:id,terrain_card:card.id});
 }
}
