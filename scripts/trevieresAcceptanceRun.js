import {isDeepStrictEqual} from 'node:util';
import {mkdirSync,writeFileSync} from 'node:fs';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,getPlayerView,selectHQ,submitCommand,advancePhase,resolveCombat,exportReplay,replayMission,prepareReattempt} from '../src/sim/company/engine.js';
const candidate={...trevieres,readiness:{playable:true}};
function choose(v){
 const loc=id=>v.locations.find(l=>l.id===id),distance=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
 const objectives=[v.objectives.primary.location,v.objectives.secondary.location];
 const goals=[...v.contacts.filter(c=>!c.resolved&&(loc(c.location).row<=2||objectives.includes(c.location))).map(c=>c.location),...v.enemies.filter(u=>u.steps&&!u.removed&&(loc(u.location).row<=2||objectives.includes(u.location))).map(u=>u.location),...objectives.filter(id=>!v.units.some(u=>u.steps&&!u.removed&&u.location===id))];
 const options=[],issuer=v.impulse.hq==='general'?'co':v.impulse.hq;
 for(const u of v.units.filter(u=>u.steps&&!u.removed))for(const o of u.options.filter(o=>o.available))for(const t of o.targets.filter(t=>!t.reason)){
  let score=-1;
  if(o.type==='ACTIVATE')score=150;
  if(o.type==='RALLY')score=100;
  if(o.type==='RECOVER')score=90;
  if(o.type==='GRENADE')score=120;
  if(o.type==='SPOT')score=110;
  if(o.type==='CALL_ARTILLERY')score=80;
  if(o.type==='CONCENTRATE')score=50;
  if(['MOVE','INFILTRATE'].includes(o.type)&&goals.length){
   const here=loc(u.location),to=loc(t.id),nearest=l=>Math.min(...goals.map(id=>distance(l,loc(id))));
   const aloneOnObjective=objectives.includes(u.location)&&v.units.filter(other=>other.steps&&!other.removed&&other.location===u.location).length===1;
   if(!aloneOnObjective&&nearest(to)<nearest(here))score=40+(nearest(here)-nearest(to))*10;
   if(!aloneOnObjective&&goals.includes(t.id))score=60;
   if(score>0){score-=v.units.filter(other=>other.steps&&!other.removed&&other.location===t.id).length*15;if(['HQ','STAFF','FO','MORTAR'].includes(u.kind))score-=25;if(o.type==='INFILTRATE')score+=3;}
  }
  if(score>0){const skill=o.skills?.find(p=>p.type!=='EXTRA_DRAW'||!['RALLY','RECOVER'].includes(o.type)||u.incoming?.length);options.push({score,command:{type:o.type,unit_id:u.id,issuer_id:issuer,target_id:t.id,...(skill?{skill_id:skill.id}:{})}});}
 }
 return options.sort((a,b)=>b.score-a.score)[0]?.command;
}
function play(s){let guard=0;
 while(s.status==='ACTIVE'&&guard++<5000){const v=getPlayerView(s);
  if(v.combat_resolution?.status==='PENDING')s=resolveCombat(s,v.combat_resolution.id).state;
  else if(!v.impulse&&v.eligible_hqs.length)s=selectHQ(s,v.eligible_hqs[0]).state;
  else{const c=v.impulse&&choose(v);if(c){const r=submitCommand(s,c);if(!r.accepted)throw new Error(r.reason);s=r.state;}else s=advancePhase(s,s.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;}
 }if(s.status==='ACTIVE')throw new Error('Acceptance policy did not terminate.');return s;
}
for(const seed of process.argv.slice(2).length?process.argv.slice(2):['trev-accept-1']){
 let s=play(createMission(candidate,seed));
 const first=s.status;
 if(s.status==='DEFEAT'){
  const view=getPlayerView(s),secured=view.locations.filter(l=>view.units.some(u=>u.steps&&!u.removed&&u.location===l.id)&&!view.enemies.some(u=>u.steps&&!u.removed&&u.location===l.id)&&!view.contacts.some(c=>!c.resolved&&c.location===l.id)).sort((a,b)=>b.row-a.row);
  if(secured.length){
   const load={},positions={},promote={},skills=[];let points=s.achievements.reduce((n,a)=>n+a.points,0);
   const units=view.units.filter(u=>u.steps&&!u.removed&&u.kind!=='RUNNER'&&u.command_role!=='higher_hq');
   for(const u of units){const card=secured.find(l=>l.staging||(load[l.id]??0)+u.steps<=16);positions[u.id]=card.id;load[card.id]=(load[card.id]??0)+u.steps;}
   for(const u of Object.values(s.units).filter(u=>units.some(v=>v.id===u.id)&&['HQ','STAFF'].includes(u.kind)&&u.experience==='Green'))if(points){promote[u.steps[0].id]='Line';points--;}
   for(const u of units.filter(u=>u.kind==='HQ'&&u.platoon!==null).slice(0,2))if(points){skills.push({holder:u.id,type:'AUTO_SPOT'});points--;}
   s=play(prepareReattempt(s,{positions,promote,skills}).state);
  }
 }
 if(!isDeepStrictEqual(s,replayMission(candidate,exportReplay(s))))throw new Error('Acceptance replay diverged.');
 const summary={seed,first,outcome:s.status,attempt:s.attempt_number,orders:s.events.filter(e=>e.type==='COMMAND_ISSUED').length,contacts:s.events.filter(e=>e.type==='CONTACT_EVALUATED').length,enemies:Object.values(s.units).filter(u=>u.faction==='enemy').length,objective_check:s.events.findLast(e=>e.type==='OBJECTIVE_CHECK'),exact_replay:true};
 const output='output/company-playtests';mkdirSync(output,{recursive:true});
 writeFileSync(`${output}/${seed.replace(/[^a-z0-9_-]/gi,'_')}-normandy.json`,JSON.stringify({summary,replay:exportReplay(s),events:s.events.filter(e=>!e.hidden)},null,2));
 console.log(summary);
}
