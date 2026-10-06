import {values,live,friendly,emit,draw,randomNumber,pick} from './core.js';
import {occupants,refresh} from './battlefield.js';
import {rally} from './actions.js';
import {companyCommander} from './commandRoles.js';

const FRIENDLY_EARLY=['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','ADVANCE_PC','RESUPPLY','RESUPPLY'];
const FRIENDLY_LATE=['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','RESUPPLY','RESUPPLY','RESUPPLY'];
const ENEMY=['EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','RALLY','FALL_BACK','FALL_BACK','COUNTER_ATTACK','COUNTER_ATTACK'];
const leadRow=s=>Math.max(0,...values(s.units).filter(u=>friendly(u)&&live(u)).map(u=>s.locations[u.location].row));
export function resolveNormandyEvent(s,side,choice={}){
 let code,event;
 if(s.pending_event){if(s.pending_event.side!==side)throw new Error('Resolve the pending higher HQ event first.');
  code=s.pending_event.code;event=s.hq_events.findLast(e=>e.turn===s.turn&&e.side===side&&e.code===code);
  if(!choice.ammo_type||!choice.location)throw new Error('Choose ammunition type and Row 1 destination.');
  s.pending_event=null;
 }else{
  if(s.turn===1)return emit(s,'HQ_EVENT_NONE',`${side}: no higher HQ event on turn 1.`);
  if(!draw(s,1,`${side} higher HQ event check`)[0].hq)return emit(s,'HQ_EVENT_NONE',`${side}: no higher HQ event.`);
  const table=side==='friendly'?(s.turn<=6?FRIENDLY_EARLY:FRIENDLY_LATE):ENEMY;
  code=table[randomNumber(s,10,`${side} higher HQ event`)-1];
  event={side,code,turn:s.turn,lead:leadRow(s),completed:false};s.hq_events.push(event);
  if(code==='RESUPPLY'&&!choice.ammo_type){s.pending_event={side,code,turn:s.turn};emit(s,'HQ_EVENT_CHOICE_REQUIRED','Choose one ammunition type and a Row 1 resupply card.',{side,code});return event;}
 }
 if(side==='friendly'){
  if(code==='SITREP')s.command_obligation=3;
  if(code==='COMM'){s.bn_blocked=true;s.command_obligation=2;}
  if(code==='NO_ARTY')s.support_unavailable.push('artillery');
  if(code==='HOLD')s.forward_row_blocked=event.lead+1;
  if(code==='CHECKING_UP'){
   const officers=['REGIMENTAL_STAFF','BATTALION_COMMANDER','BATTALION_STAFF'];
   const profile=pick(s,officers,'Higher HQ visitor');
   const commander=companyCommander(s);
   const id=`higher_${s.next_id++}`;
   s.units[id]={id,name:profile.replaceAll('_',' '),kind:'STAFF',command_role:'higher_hq',capabilities:{higher_priority:officers.indexOf(profile)},faction:'friendly',location:commander.location,platoon:null,cohesion:'GOOD',experience:'Line',steps:[{id:`${id}_step1`,personnel:[]}],radios:[],assets:{},saved:0,used:[],removed:null,pinned:false,exposed:false,cover:commander.cover,vof:null,range:0,expires_turn:s.turn+1};
   s.higher_hq_on_map=true;
  }
  if(code==='RESUPPLY'){
   const key=choice.ammo_type,location=choice.location;
   if(!['MG','MTR','RKT'].includes(key)||s.locations[location]?.row!==1)throw new Error('Choose an ammunition type and a Row 1 destination.');
   s.assets.push({id:`asset_${s.next_id++}`,type:'AMMO',key,quantity:4,location,cover:null,faction:'friendly'});
   event.choice={ammo_type:key,location};
  }
 }else{
  const enemies=values(s.units).filter(u=>!friendly(u)&&live(u));
  if(code==='EVAC')s.casualties=s.casualties.filter(c=>c.faction!=='enemy'||occupants(s,c.location).some(friendly));
  if(code.startsWith('DISPLACE_')){
   const kind=code.slice(9);
   for(const u of enemies.filter(u=>u.kind===kind&&!occupants(s,u.location).some(friendly))){u.removed='DISPLACED';u.fire=null;u.event_acted=s.turn;emit(s,'HQ_EVENT_FORMATION',`${u.name} displaced.`,{actor:u.id,location:u.location,faction:'enemy'},true);}
  }
  if(code==='RALLY')for(const u of enemies){
   const pinned=u.pinned;
   if(pinned)rally(s,u);
   else if(['P','L','F'].includes(u.cohesion))rally(s,u,u,true);
   if(pinned||['P','L','F','A'].includes(u.cohesion))u.event_acted=s.turn;
  }
  if(code==='FALL_BACK')for(const u of enemies.filter(u=>!u.pinned)){
   const l=s.locations[u.location],to=s.locations[`r${l.row+1}c${l.col}`];
   if(to&&!to.staging){u.location=to.id;u.cover=null;u.fire=null;u.event_acted=s.turn;u.exposed=true;}
   else{u.removed='WITHDRAWN';u.event_acted=s.turn;}
  }
  if(code==='COUNTER_ATTACK'){
   const occupied=values(s.locations).filter(l=>!l.staging&&occupants(s,l.id).some(friendly));
   // Sixteen physical markers per letter (§8.2.1); resolved markers return to stock.
   const letters=['A','B','C'].flatMap(type=>Array(Math.max(0,16-values(s.contacts).filter(pc=>!pc.resolved&&pc.type===type).length)).fill(type));
   event.placements=[];
   for(const l of occupied){if(!letters.length)break;const type=pick(s,letters,'Counterattack remaining PC letter',true),index=letters.indexOf(type);letters.splice(index,1);
    const id=`pc_counter_${s.next_id++}`,pc={id,location:l.id,type,resolved:false,counterattack:true,revealed:false};s.contacts[id]=pc;
    const overlaps=values(s.contacts).filter(c=>c.location===l.id&&!c.resolved);
    if(overlaps.length>1){
      for(const c of overlaps)c.revealed=true;
      const keep=overlaps.sort((a,b)=>a.type.localeCompare(b.type)||Number(b.counterattack)-Number(a.counterattack))[0];
      for(const c of overlaps)if(c!==keep){c.resolved=true;c.removed_by_event=true;letters.push(c.type);}
    }
    event.placements.push(l.id);}
   s.enemy_tactics='offensive_assault';s.counterattack_ends_after=s.turn+2;
  }
 }
 emit(s,'HQ_EVENT',`${side} higher HQ: ${code.replaceAll('_',' ').toLowerCase()}.`,{side,code,turn:s.turn,...(event.choice??{}),lead:event.lead,...(event.placements?{placements:event.placements}:{}),counterattack_ends_after:s.counterattack_ends_after??null});
 refresh(s);
 return event;
}
