import {values,live,friendly,visible,good,emit,draw,randomNumber,pick} from './core.js';
import {occupants,los,distance,spot,refresh,coverOf} from './battlefield.js';

export function discoveredCover(s,l,known=true,enemy=false) {
 let type='Cover',value=1;
 if(s.mission_rules?.coverTable&&l.building){
  const roll=randomNumber(s,4,`${l.name}: building cover`,!known);
  value=({village:[3,3,2,1],farm:[3,2,1,1],church:[3,3,3,1],cemetery:[3,2,1,1]})[l.terrain][roll-1];
  type=value===3?'Strong Building':value===2?'Light Building':'Cover';
 }
 const c={id:`cover_${s.next_id++}`,type,value,known,discovered:!enemy};l.covers.push(c);
 if(value>1&&(l.multi_story||l.tower))l.covers.push({id:`cover_${s.next_id++}`,type:l.tower?'Church Tower':'Upper Story',value,known,parent:c.id,elevation:1,capacity:l.tower?1:null});
 return c;
}
export function checkMines(s,u){
 if(!s.locations[u.location].mines||!live(u))return;
 const hit=draw(s,3,`${visible(s,u)?u.name:'Enemy'}: mine check`,!visible(s,u)).some(c=>c.burst||c.short);
 if(hit){u.mine_hit=true;s.markers.push({type:'MINES',location:u.location,target:u.id,value:-4});}
 emit(s,'MINE_CHECK',`${visible(s,u)?u.name:'Enemy'} ${hit?'triggered mines; cannot move again this turn':'avoided the mines'}.`,{actor:visible(s,u)?u.id:null,location:u.location,hit},!visible(s,u));
}
export function secureStatus(s,id){const units=occupants(s,id),cleared=!values(s.contacts).some(c=>c.location===id&&!c.resolved)&&!units.some(u=>!friendly(u));return {cleared,secured:cleared&&units.some(friendly)};}
export function scoreMission(s,{final=false}={}){
 if(!s.objectives)return;
 const add=(key,points,text)=>{if(!s.achievements.some(a=>a.key===key)){s.achievements.push({key,points,text,turn:s.turn});emit(s,'ACHIEVEMENT',`${text}: +${points} points.`,{key,points});}};
 for(const e of s.hq_events.filter(e=>e.side==='friendly'&&e.turn===s.turn)){
  if(s.phase==='CLEANUP'){
   const advanced=s.events.some(v=>v.turn===s.turn&&v.type==='UNIT_MOVED'&&s.units[v.actor]?.faction==='friendly'&&s.locations[v.target]?.row>e.lead);
   if(e.code==='ADVANCE'&&e.lead<(s.boundaries?.rows??Math.max(...values(s.locations).map(l=>l.row))))e.completed=advanced;
   if(e.code==='HOLD')e.completed=!advanced;
  }
  if(e.completed)add(`event_${e.turn}_${e.code}`,1,'Higher HQ obligation completed');
 }
 if(final){
  for(const [key,points]of [['primary',5],['secondary',4],['attack',3]])if(secureStatus(s,s.objectives[key]).secured)add(key,points,`${key} objective secured`);
  const positions=['primary','secondary','attack'].map(key=>s.objectives[key]);
  for(const pc of values(s.contacts))if(!positions.includes(pc.location)&&pc.resolved&&secureStatus(s,pc.location).cleared)add(`clear_${pc.id}`,pc.type==='A'?2:1,`${s.locations[pc.location].name} cleared`);
 }
 for(const e of s.events){
  if(e.type==='CASUALTY_EVACUATED')add(`evac_${e.step_id}`,1,'Friendly casualty evacuated');
  if(e.type==='GRENADE_ATTEMPT'&&e.success&&e.point_blank&&s.units[e.actor]?.faction==='friendly')add(`grenade_${e.id}`,1,'Successful point-blank grenade attack');
  if(e.type==='UNIT_CAPTURED'&&e.faction==='enemy')for(const id of e.step_ids??[])add(`prisoner_${id}`,2,'Enemy prisoner captured');
  if(e.type==='ENEMY_CASUALTY_CAPTURED')add(`enemy_casualty_${e.step_id}`,1,'Enemy casualty captured');
 }
 if(final)for(const l of values(s.locations))for(const c of l.covers.filter(c=>c.known&&c.enemy_original&&['Bunker','Pillbox'].includes(c.type)))if(!occupants(s,l.id).some(u=>!friendly(u)&&u.cover===c.id))add(`fort_${c.id}`,c.type==='Pillbox'?2:1,`${c.type} cleared`);
}
const FRIENDLY=[['COMM','COMM','COMM','ADVANCE','ADVANCE','ADVANCE','HOLD','NO_MORTAR','NO_MORTAR','NO_ARTY'],['SITREP','SITREP','COMM','ADVANCE','ADVANCE','HOLD','AMMO','NO_MORTAR','NO_ARTY','NO_ARTY'],['SITREP','SITREP','COMM','ADVANCE','HOLD','AMMO','AMMO','AMMO','NO_MORTAR','NO_ARTY']];
const ENEMY=[['REINFORCE','UNPIN','UNPIN','UNPIN','UNPIN','UNPIN','RECOVER','RECOVER','RECOVER','BREAK'],['EVAC','EVAC','REINFORCE','REINFORCE','UNPIN','UNPIN','RECOVER','AMMO','AMMO','BREAK'],['EVAC','EVAC','REINFORCE','REINFORCE','UNPIN','RECOVER','AMMO','AMMO','BREAK','SURRENDER']];
export function higherEvent(s,side){
 if(!s.mission_rules?.events||s.turn===1)return;
 if(!draw(s,1,`${side} higher HQ event check`)[0].hq){emit(s,'HQ_EVENT_NONE',`${side}: no higher HQ event.`);return;}
 const table=(side==='friendly'?FRIENDLY:ENEMY)[s.turn<5?0:s.turn<8?1:2],code=table[randomNumber(s,10,`${side} higher HQ event`)-1];
 const effect={side,code,turn:s.turn,lead:Math.max(0,...values(s.units).filter(u=>friendly(u)&&live(u)).map(u=>s.locations[u.location].row)),completed:false};s.hq_events.push(effect);
 const units=values(s.units).filter(u=>live(u)&&u.faction===side);
 if(code==='COMM')s.bn_blocked=true;
 if(['COMM','SITREP'].includes(code))s.command_obligation=3;
 if(code==='NO_MORTAR')s.support_unavailable.push('mortar');if(code==='NO_ARTY')s.support_unavailable.push('artillery');
 if(code==='AMMO')for(const u of units.filter(u=>['MG','LMG','HMG'].includes(u.kind))){u.out_of_ammo=!u.out_of_ammo;if(side==='enemy')u.event_acted=s.turn;}
 if(code==='REINFORCE')for(const pc of values(s.contacts).filter(c=>!c.resolved))pc.type='A';
 for(const u of units){
  if(code==='UNPIN'&&u.pinned){u.pinned=false;u.event_acted=s.turn;}
  if(code==='RECOVER'&&['P','L'].includes(u.cohesion)){u.cohesion='F';u.experience='Green';u.event_acted=s.turn;}
  if(code==='BREAK'&&u.cohesion==='P'){u.removed='WITHDRAWN';u.event_acted=s.turn;}
  else if(code==='BREAK'&&u.cohesion==='L'){u.cohesion='P';u.event_acted=s.turn;}
  if(code==='SURRENDER'&&occupants(s,u.location).some(friendly)){spot(s,u);s.prisoners.push({guard:null,prisoners:structuredClone(u.steps)});u.removed='CAPTURED';u.event_acted=s.turn;emit(s,'UNIT_CAPTURED','Enemy formation surrendered without requiring guards.',{actor:u.id,location:u.location,faction:'enemy',step_ids:u.steps.map(step=>step.id)});}
 }
 if(code==='EVAC')s.casualties=s.casualties.filter(c=>occupants(s,c.location).some(friendly));
 const descriptions={COMM:'Communications trouble: no BN activation; first 3 Company HQ commands restore communications.',SITREP:'SITREP: Company HQ must spend its first 3 commands reporting.',ADVANCE:'Advance a unit beyond the leading row this turn for an achievement.',HOLD:'Do not advance beyond the leading row this turn.',AMMO:'Machine-gun ammunition status toggled.',NO_MORTAR:'Battalion mortar support unavailable this turn.',NO_ARTY:'Artillery support unavailable this turn.',REINFORCE:'Remaining B/C contacts upgraded to A.',UNPIN:'Enemy pins removed.',RECOVER:'Enemy Paralyzed/Litter Teams become Fire Teams.',BREAK:'Enemy Paralyzed Teams withdraw; Litter Teams become Paralyzed.',EVAC:'Casualties on cards without U.S. troops evacuated.',SURRENDER:'Enemies sharing U.S. cards surrender.'};
 emit(s,'HQ_EVENT',`${side} HQ: ${descriptions[code]}`,{side,code});refresh(s);
}
export function shortRoundDestination(s,u,target,hidden=false){
 const a=s.locations[u.location],b=s.locations[target];
 if(a.id===b.id)return pick(s,values(s.locations).filter(l=>!l.staging&&distance(l,a)===1),'Short round destination',hidden).id;
 return `r${b.row-Math.sign(b.row-a.row)}c${b.col-Math.sign(b.col-a.col)}`;
}
export function supportRequest(s,u,agencyId,ammo,target){
 const agency=s.support_agencies[agencyId],base=agency.draws[u.agency_role??u.id],registered=s.registered_targets[agencyId]===target?1:0;
 const batch=draw(s,Math.max(1,base+registered+({Green:-1,Line:0,Veteran:1}[u.experience])),`${u.name}: ${agency.name} ${ammo}`);
 let destination=target;const short=batch.some(c=>c.short),success=short||batch.some(c=>c.burst);
 if(short)destination=shortRoundDestination(s,u,target);
 if(success){s.support.push({id:`support_${s.next_id++}`,location:destination,status:'PENDING',value:agency[ammo],source:u.id,agency:agencyId,ammo});s.registered_targets[agencyId]=destination;}
 emit(s,'SUPPORT_REQUEST',`${agency.name} ${ammo}: ${success?`${short?'short round; ':''}pending at ${s.locations[destination].name}`:'request failed'}.`,{actor:u.id,location:destination,success,agency:agencyId,ammo});
}
