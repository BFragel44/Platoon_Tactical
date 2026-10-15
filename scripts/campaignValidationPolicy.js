// Public-view policy shared with the Cerisy acceptance run; no hidden target selection.
import {getPlayerView,selectHQ,submitCommand,advancePhase,resolveCombat,resolveSupportChoice} from '../src/sim/company/engine.js';
function choose(v){
 const loc=id=>v.locations.find(l=>l.id===id),distance=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
 const objectives=[v.objectives.primary.location,v.objectives.secondary.location];
 const goals=[...v.contacts.filter(c=>!c.resolved&&(loc(c.location).row<=4||objectives.includes(c.location))).map(c=>c.location),...objectives.filter(id=>!v.units.some(u=>u.steps&&!u.removed&&u.location===id))];
 const options=[],issuer=v.impulse.hq==='general'?'co':v.impulse.hq;
 for(const u of v.units.filter(u=>u.steps&&!u.removed))for(const o of u.options.filter(o=>o.available))for(const t of o.targets.filter(t=>!t.reason)){
  let score=-1;
  if(o.type==='ACTIVATE')score=150;
  if(o.type==='RALLY')score=u.kind==='HQ'?160:100;
  if(o.type==='SEEK_COVER'&&u.incoming?.length&&!u.cover)score=130;
  if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(o.type)&&u.incoming?.length&&!u.cover&&t.id!=='open')score=140;
  if(o.type==='RECOVER')score=u.kind==='HQ'?155:90;
  if(o.type==='GRENADE')score=120;
  if(o.type==='SPOT')score=110;
  if(['CALL_ARTILLERY','CALL_MORTAR','CALL_CANNON'].includes(o.type))score=80;
  if(o.type==='CONCENTRATE')score=30;
  if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(o.type)&&goals.length){
   const here=loc(u.location),to=loc(t.id),nearest=l=>Math.min(...goals.map(id=>distance(l,loc(id))));
   const aloneOnObjective=objectives.includes(u.location)&&v.units.filter(other=>other.steps&&!other.removed&&other.location===u.location).length===1;
   if(!aloneOnObjective&&nearest(to)<nearest(here))score=40+(nearest(here)-nearest(to))*10;
   if(!aloneOnObjective&&goals.includes(t.id))score=60;
   const unheld=objectives.filter(id=>!v.units.some(other=>other.steps&&!other.removed&&other.location===id));
   if(!aloneOnObjective&&unheld.length&&Math.min(...unheld.map(id=>distance(to,loc(id))))<Math.min(...unheld.map(id=>distance(here,loc(id)))))score=115;
   if(score>0){score-=v.units.filter(other=>other.steps&&!other.removed&&other.location===t.id).length*15;if(['HQ','STAFF','FO','MORTAR'].includes(u.kind))score-=u.kind==='HQ'?0:25;if(o.type.includes('INFILTRATE'))score+=3;if(o.type.startsWith('PLATOON_'))score+=25+(t.moving_unit_ids?.length??0)*8;}
  }
  if(score>0){const skill=o.skills?.find(p=>p.type!=='EXTRA_DRAW'||!['RALLY','RECOVER'].includes(o.type)||u.incoming?.length);options.push({score,command:{type:o.type,unit_id:u.id,issuer_id:issuer,target_id:t.id,...(skill?{skill_id:skill.id}:{})}});}
 }
 return options.sort((a,b)=>b.score-a.score)[0]?.command;
}
export function playCerisy(s){let guard=0;
 while(s.status==='ACTIVE'&&guard++<5000){const v=getPlayerView(s);
  if(v.pending_support)s=resolveSupportChoice(s,{locations:[]}).state;
  else if(v.combat_resolution?.status==='PENDING')s=resolveCombat(s,v.combat_resolution.id).state;
  else if(!v.impulse&&v.eligible_hqs.length)s=selectHQ(s,v.eligible_hqs[0]).state;
  else{const c=v.impulse&&choose(v);if(c){const r=submitCommand(s,c);if(!r.accepted)throw new Error(r.reason);s=r.state;}else s=advancePhase(s,s.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;}
 }if(s.status==='ACTIVE')throw new Error('Acceptance policy did not terminate.');return s;
}
