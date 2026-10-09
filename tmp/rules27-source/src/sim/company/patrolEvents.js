import {values,live,friendly,emit,pick,randomNumber} from './core.js';
import {patrolParticipant} from './patrols.js';
import {borders} from './terrain.js';
const directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
const distance=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
const stock=(s,letters)=>letters.flatMap(type=>Array(Math.max(0,16-values(s.contacts).filter(pc=>!pc.resolved&&pc.type===type).length)).fill(type));
export function addPatrolContact(s,location,{questionSide=false,letters}={}){
 const available=stock(s,letters??(location.row>=4?['A']:location.row>=2?['B','C']:[]));
 if(!available.length)return null;
 const type=pick(s,available,'Patrol remaining contact marker',true),id=`pc_patrol_${s.next_id++}`;
 const contact={id,location:location.id,type,resolved:false,question_side:questionSide||location.row===2||location.row===3,revealed:false};s.contacts[id]=contact;return contact;
}
export function expandPatrolCard(s,row,col){
 const id=`r${row}c${col}`;if(s.locations[id])return s.locations[id];
 const drawn=[];let card,elevation=1;
 do{card=s.terrain_deck.pop();if(!card){s.terrain_deck.push(...drawn.reverse());return null;}drawn.push(card);if(card.terrain==='hill')elevation++;}while(card.terrain==='hill');
 const l={...structuredClone(card),id,row,col,name:`${row}.${col} ${card.name}${elevation>1?' / Hill':''}`,terrain_card:card.id,hills:drawn.slice(0,-1).map(c=>c.id),elevation,borders:elevation>1?borders():structuredClone(card.borders),staging:false,known:true,outside_boundary:true,covers:[],smoke:false};
 s.locations[id]=l;addPatrolContact(s,l);emit(s,'MAP_EXPANDED',`Lost patrol revealed terrain beyond the boundary: ${l.name}.`,{location:id,terrain_card:card.id});return l;
}
export function patrolHoldReason(s,target){
 if(!s.patrol_hold)return null;
 // PC markers count for "not unoccupied" (§1.2.6). Unknown enemy positions must
 // never make a command preview available that otherwise would be unavailable.
 const knownUnit=values(s.units).some(u=>live(u)&&u.location===target&&(friendly(u)||s.knowledge.spotted[u.id]));
 const contact=values(s.contacts).some(pc=>pc.location===target&&!pc.resolved);
 return knownUnit||contact?null:'Hold up!: choose a card containing a known unit or an unresolved contact marker this turn.';
}
export function applyPatrolEvent(s,side,code,event){
 if(!s.patrol)return;
 if(side==='friendly'){
  if(code==='LOST'){
   const eligible=values(s.units).filter(u=>live(u)&&patrolParticipant(s.patrol,u));
   if(eligible.length){const u=pick(s,eligible,'Lost patrol formation'),from=u.location,origin=s.locations[from],[dr,dc]=directions[randomNumber(s,8,'Lost patrol direction')-1];
    const target=s.locations[`r${origin.row+dr}c${origin.col+dc}`]??expandPatrolCard(s,origin.row+dr,origin.col+dc);
    if(target){u.location=target.id;u.cover=null;u.fire=null;u.fire_direction=null;u.fire_effect=null;u.indirect=null;u.exposed=true;
     emit(s,'UNIT_MOVED',`${u.name} lost its way and moved to ${target.name}; exposed until cleanup.`,{actor:u.id,from,target:target.id,exposed:true,faction:'friendly',forced:true});}
    else emit(s,'PATROL_EVENT_UNAVAILABLE','Lost in the Dark: no terrain card remains for expansion.');
   }else emit(s,'PATROL_EVENT_UNAVAILABLE','Lost in the Dark: no patrol formation remains.');
  }
  if(code==='HOLD_PATROL')s.patrol_hold=true;
  if(code==='RAIN'){s.visibility.weather+=2;s.patrol_rain=(s.patrol_rain??0)+2;}
  if(code==='NO_MORTAR')s.support_unavailable.push('mortar');
  if(code==='ADVANCE_ROUTE'){event.waypoint=s.patrol.plan.route[s.patrol.visited.length]??null;event.ignored=!event.waypoint;}
 }else if(code==='SHIFTING_LINES'){
  const previous=values(s.contacts).filter(pc=>!pc.resolved&&s.locations[pc.location].row===4);
  for(const pc of previous){pc.resolved=true;pc.removed_by_event=true;}
  // Return every removed marker before drawing replacements from physical stock.
  for(const pc of previous)addPatrolContact(s,s.locations[pc.location],{questionSide:true,letters:['A','B','C']});
 }
}
export function finishPatrolEvents(s){
 if(!s.patrol)return;
 for(const event of s.hq_events.filter(e=>e.side==='friendly'&&e.turn===s.turn)){
  if(event.code==='ADVANCE_ROUTE'&&event.waypoint)event.completed=s.events.some(e=>e.turn===s.turn&&e.type==='UNIT_MOVED'&&patrolParticipant(s.patrol,s.units[e.actor])&&s.locations[e.from]&&s.locations[e.target]&&distance(s.locations[e.target],s.locations[event.waypoint])<distance(s.locations[e.from],s.locations[event.waypoint]));
  if(event.completed&&['ADVANCE_ROUTE','COMM'].includes(event.code)){
   const key=`patrol_${s.attempt_number}_${s.turn}_${event.code}`;
   if(!s.achievements.some(a=>a.key===key)){s.achievements.push({key,points:1,text:'Patrol higher HQ obligation completed',turn:s.turn,platoon:s.patrol.plan.platoon});emit(s,'ACHIEVEMENT','Patrol higher HQ obligation completed: +1 point.',{key,points:1,platoon:s.patrol.plan.platoon});}
  }
 }
 if(s.patrol_rain)s.visibility.weather=Math.max(0,s.visibility.weather-s.patrol_rain);
 s.patrol_rain=0;s.patrol_hold=false;
}
