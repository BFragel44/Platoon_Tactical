import {isDeepStrictEqual} from 'node:util';
import {mkdirSync,writeFileSync} from 'node:fs';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {createMission,getPlayerView,selectHQ,submitCommand,advancePhase,resolveCombat,resolveSupportChoice,exportReplay,replayMission,preparePatrol} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {createCampaignRoster,applyMissionDebrief} from '../src/sim/company/campaignRoster.js';
import assert from 'node:assert/strict';
const candidate={...stGeorges,readiness:{playable:true}};
function choose(v){
 const loc=id=>v.locations.find(l=>l.id===id),distance=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
 const objectives=[];
 const goal=v.patrol.plan.route[v.patrol.visited.length]??(!v.patrol.objective_visited?v.patrol.plan.primary:`r1c${v.patrol.plan.platoon}`);
 const goals=[goal];
 const options=[],issuer=v.impulse.hq==='general'?'co':v.impulse.hq;
 for(const u of v.units.filter(u=>u.steps&&!u.removed))for(const o of u.options.filter(o=>o.available))for(const t of o.targets.filter(t=>!t.reason)){
  let score=-1;
  if(o.type==='ACTIVATE')score=t.id===`hq${v.patrol.plan.platoon}`?450:40;
  if(o.type==='RALLY')score=u.platoon===v.patrol.plan.platoon?420:100;
  if(o.type==='SEEK_COVER'&&u.incoming?.length&&!u.cover)score=130;
  if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(o.type)&&u.incoming?.length&&!u.cover&&t.id!=='open')score=140;
  if(o.type==='RECOVER')score=u.platoon===v.patrol.plan.platoon?410:90;
  if(o.type==='GRENADE')score=120;
  if(o.type==='SPOT')score=110;
  if(['CALL_ARTILLERY','CALL_MORTAR','CALL_CANNON'].includes(o.type))score=80;
  if(o.type==='CONCENTRATE')score=30;
  if(o.type==='HANDHELD_ILLUM'&&v.visibility.light>=3&&t.id===goal&&!v.markers.some(m=>m.type==='ILLUMINATION'&&m.location===t.id))score=400;
  if(o.type.endsWith('_ILLUM')&&o.type!=='HANDHELD_ILLUM'&&v.visibility.light>=3&&t.id===goal&&!v.markers.some(m=>m.type==='ILLUMINATION'&&m.location===t.id))score=400;
  if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(o.type)&&goals.length){
   const here=loc(u.location),to=loc(t.id),nearest=l=>Math.min(...goals.map(id=>distance(l,loc(id))));
   const aloneOnObjective=u.platoon!==v.patrol.plan.platoon||objectives.includes(u.location)&&v.units.filter(other=>other.steps&&!other.removed&&other.location===u.location).length===1;
   if(!aloneOnObjective&&nearest(to)<nearest(here))score=180+(nearest(here)-nearest(to))*10;
   if(!aloneOnObjective&&goals.includes(t.id))score=200;
   const unheld=objectives.filter(id=>!v.units.some(other=>other.steps&&!other.removed&&other.location===id));
   if(!aloneOnObjective&&unheld.length&&Math.min(...unheld.map(id=>distance(to,loc(id))))<Math.min(...unheld.map(id=>distance(here,loc(id)))))score=115;
   if(score>0){score-=v.units.filter(other=>other.steps&&!other.removed&&other.location===t.id).length*15;if(['HQ','STAFF','FO','MORTAR'].includes(u.kind))score-=u.kind==='HQ'?0:25;if(o.type.includes('INFILTRATE'))score+=3;if(o.type.startsWith('PLATOON_'))score+=150+(t.moving_unit_ids?.length??0)*8;else if(u.kind==='HQ'&&issuer!==u.id&&v.units.some(other=>other.id!==u.id&&other.platoon===u.platoon&&other.location===u.location&&!other.removed))score=-1;}
  }
  if(score>0){const skill=o.skills?.find(p=>p.type!=='EXTRA_DRAW'||!['RALLY','RECOVER'].includes(o.type)||u.incoming?.length);options.push({score,command:{type:o.type,unit_id:u.id,issuer_id:issuer,target_id:t.id,...(skill?{skill_id:skill.id}:{})}});}
 }
 return options.sort((a,b)=>b.score-a.score)[0]?.command;
}
function play(s){let guard=0;
 while(s.status==='ACTIVE'&&guard++<5000){const v=getPlayerView(s);
  if(v.pending_support)s=resolveSupportChoice(s,{locations:[]}).state;
  else if(v.combat_resolution?.status==='PENDING')s=resolveCombat(s,v.combat_resolution.id).state;
  else if(!v.impulse&&v.eligible_hqs.length)s=selectHQ(s,v.eligible_hqs[0]).state;
  else{const c=v.impulse&&choose(v);if(c){const r=submitCommand(s,c);if(!r.accepted)throw new Error(r.reason);s=r.state;}else s=advancePhase(s,s.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;}
 }if(s.status==='ACTIVE')throw new Error('Acceptance policy did not terminate.');return s;
}

for(const seed of process.argv.slice(2).length?process.argv.slice(2):['st-georges-accept-1']){
 const planFor=p=>({...stGeorges.patrol_plan,platoon:p,primary:`r4c${p}`,route:[`r2c${p}`,`r3c${p}`,`r4c${p}`,`r2c${p===3?2:p+1}`]});const plan=planFor(1);
 const attached=['staff','xo','mg1'];const initialPositions=Object.fromEntries(attached.map(id=>[id,'r1c1']));
 let s=play(createMission(candidate,seed,{patrol:plan,assignments:Object.fromEntries(attached.map(id=>[id,{platoon:1}])),positions:initialPositions}));
 for(const platoon of [2,3]){
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||u.removed==='RESERVE')).map(u=>[u.id,`r1c${attached.includes(u.id)?platoon:u.platoon??(['HQ','STAFF','FO'].includes(u.kind)?2:4)}`]));
  s=play(preparePatrol(s,{patrol:planFor(platoon),positions,assignments:Object.fromEntries(attached.filter(id=>s.units[id]).map(id=>[id,platoon]))}).state);
 }
 assert.ok(isDeepStrictEqual(s,replayMission(candidate,exportReplay(s))),'Replay diverged');
 assert.deepEqual(resumeCheckpoint(candidate,checkpoint(s)).state,s);
 const roster=createCampaignRoster(s.roster_snapshot.company_id,candidate),updated=applyMissionDebrief(roster,s);assert.throws(()=>applyMissionDebrief(updated,s),/already applied/);
 const summary={seed,outcome:s.status,patrols:s.patrol_history,illuminations:s.events.filter(e=>e.type==='ILLUMINATION_DEPLOYED'||e.type==='SUPPORT_REQUEST'&&e.ammo==='ILLUM').length,orders:s.events.filter(e=>e.type==='COMMAND_ISSUED').length,contacts:s.events.filter(e=>e.type==='CONTACT_EVALUATED').length,exact_replay:true,save_reload:true,duplicate_debrief_rejected:true};
 mkdirSync('output/st-georges-playtests',{recursive:true});writeFileSync(`output/st-georges-playtests/${seed.replace(/[^a-z0-9_-]/gi,'_')}.json`,JSON.stringify({summary,replay:exportReplay(s)},null,2));console.log(summary);
}
