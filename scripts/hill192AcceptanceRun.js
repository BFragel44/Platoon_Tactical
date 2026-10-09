import {secureStatus} from '../src/sim/company/missionFeatures.js';
import {isDeepStrictEqual} from 'node:util';
import {mkdirSync,writeFileSync} from 'node:fs';
import {hill192} from '../src/scenarios/hill192.js';
import {createMission,getPlayerView,selectHQ,submitCommand,advancePhase,resolveCombat,resolveSupportChoice,exportReplay,replayMission,prepareReattempt} from '../src/sim/company/engine.js';
import assert from 'node:assert/strict';
import {createCampaignRoster,applyMissionDebrief,saveCampaign,readCampaign} from '../src/sim/company/campaignRoster.js';
import {hill192DeploymentDefinition} from '../src/sim/company/hill192Setup.js';
import {historicalM3Battlefield} from '../src/sim/company/historicalBattlefield.js';
import {readFileSync} from 'node:fs';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const candidate={...hill192,readiness:{playable:true}};
function choose(v){
 const loc=id=>v.locations.find(l=>l.id===id),distance=(a,b)=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
 const objectives=[v.objectives.primary.location,v.objectives.secondary.location];
 const goals=[...v.contacts.filter(c=>!c.resolved&&!v.units.some(u=>u.steps&&!u.removed&&u.location===c.location)&&(loc(c.location).row<=3||objectives.includes(c.location))).map(c=>c.location),...objectives.filter(id=>!v.units.some(u=>u.steps&&!u.removed&&u.location===id))];
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
   if(!aloneOnObjective&&goals.includes(t.id))score=145;
   const unheld=objectives.filter(id=>!v.units.some(other=>other.steps&&!other.removed&&other.location===id));
   if(!aloneOnObjective&&unheld.length&&Math.min(...unheld.map(id=>distance(to,loc(id))))<Math.min(...unheld.map(id=>distance(here,loc(id)))))score=115;
   if(score>0){score-=v.units.filter(other=>other.steps&&!other.removed&&other.location===t.id).length*15;if(['HQ','STAFF','FO','MORTAR'].includes(u.kind))score-=u.kind==='HQ'?0:25;if(o.type.includes('INFILTRATE'))score+=3;if(o.type.startsWith('PLATOON_'))score+=25+(t.moving_unit_ids?.length??0)*8;}
  }
  if(score>0){const skill=o.skills?.find(p=>p.type!=='EXTRA_DRAW'||!['RALLY','RECOVER'].includes(o.type)||u.incoming?.length);options.push({score,command:{type:o.type,unit_id:u.id,issuer_id:issuer,target_id:t.id,...(skill?{skill_id:skill.id}:{})}});}
 }
 return options.sort((a,b)=>b.score-a.score)[0]?.command;
}
function play(s){let guard=0,lastTurn=0;
 while(s.status==='ACTIVE'&&guard++<5000){if(lastTurn!==s.turn){lastTurn=s.turn;console.log(`${s.seed}: attempt ${s.attempt_number}, turn ${s.turn}`);}const v=getPlayerView(s);
  if(v.pending_support)s=resolveSupportChoice(s,{locations:[]}).state;
  else if(v.combat_resolution?.status==='PENDING')s=resolveCombat(s,v.combat_resolution.id).state;
  else if(!v.impulse&&v.eligible_hqs.length)s=selectHQ(s,v.eligible_hqs[0]).state;
  else{const c=v.impulse&&choose(v);if(c){const r=submitCommand(s,c);if(!r.accepted)throw new Error(r.reason);s=r.state;}else s=advancePhase(s,s.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;}
 }if(s.status==='ACTIVE')throw new Error('Acceptance policy did not terminate.');return s;
}
for(const seed of process.argv.slice(2).length?process.argv.slice(2):['hill192-accept-1']){
 const setup=process.env.HILL_SCOUTED?{battlefield:historicalM3Battlefield(JSON.parse(readFileSync(process.env.HILL_SCOUTED,'utf8')).replay)}:{};
 if(process.env.HILL_FORWARD){setup.forward_defense='r2c2';setup.positions=Object.fromEntries(candidate.units.filter(u=>u.platoon===1).map(u=>[u.id,'r2c2']));}
 let s=play(createMission(candidate,seed,setup));
 const first=s.status;assert.deepEqual(resumeCheckpoint(candidate,checkpoint(s)).state,s);const firstRecord=structuredClone(s.attempt_records[0]);
 if(s.status==='DEFEAT'){
  const view=getPlayerView(s),secured=view.locations.filter(l=>secureStatus(s,l.id).secured).sort((a,b)=>b.row-a.row);
  if(secured.length){
   const load={},positions={},promote={},skills=[],reconstitute={};
   const donors=Object.values(s.units).filter(u=>u.faction==='friendly'&&u.kind==='LAT'&&u.steps.length===1&&!u.removed);
   for(const target of Object.values(s.units).filter(u=>u.faction==='friendly'&&!u.attachment&&u.removed!=='RESERVE'&&['SQUAD','HQ','STAFF','MG','HMG','AT','MORTAR'].includes(u.kind)&&u.steps.length<u.max_steps)){const selected=donors.splice(0,target.max_steps-target.steps.length);if(selected.length)reconstitute[target.id]=selected.map(u=>u.id);}let points=s.achievements.reduce((n,a)=>n+a.points,0);
   const units=view.units.filter(u=>(u.steps||(reconstitute[u.id]?.length??0))&&(!u.removed||reconstitute[u.id])&&u.location&&u.location!=='RESERVE'&&u.kind!=='RUNNER'&&!Object.values(reconstitute).flat().includes(u.id)&&u.command_role!=='higher_hq');
   for(const u of units){const card=secured.find(l=>l.staging||(load[l.id]??0)+u.steps+(reconstitute[u.id]?.length??0)<=16);if(!card)throw new Error('Insufficient secured-card deployment capacity');positions[u.id]=card.id;load[card.id]=(load[card.id]??0)+u.steps+(reconstitute[u.id]?.length??0);}
   for(const u of Object.values(s.units).filter(u=>units.some(v=>v.id===u.id)&&['HQ','STAFF'].includes(u.kind)&&u.experience==='Green'))if(points&&!reconstitute[u.id]){promote[u.steps[0].id]='Line';points--;}
   for(const u of units.filter(u=>u.kind==='HQ'&&u.platoon!==null).slice(0,2))if(points){skills.push({holder:u.id,type:'AUTO_SPOT'});points--;}
   s=play(prepareReattempt(s,{positions,promote,skills,reconstitute}).state);
  }
 }
 assert.deepEqual(s.attempt_records[0],firstRecord);
 if(!isDeepStrictEqual(s,replayMission(candidate,exportReplay(s))))throw new Error('Acceptance replay diverged.');
 assert.deepEqual(resumeCheckpoint(candidate,checkpoint(s)).state,s);
 const initial=createCampaignRoster(s.roster_snapshot.company_id,hill192DeploymentDefinition(hill192,setup)),snapshot=structuredClone(s.roster_snapshot);
 let duplicate_debrief_rejected=false;
 if(s.status==='SUCCESS'||s.attempt_number===2){const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},key=hill192.rules.rosterKey;saveCampaign(storage,initial,key);const next=applyMissionDebrief(initial,s);saveCampaign(storage,next,key,initial.revision);assert.deepEqual(readCampaign(storage,key).record,next);assert.throws(()=>applyMissionDebrief(readCampaign(storage,key).record,s),/already applied/);assert.throws(()=>applyMissionDebrief({...initial,revision:initial.revision+1},s),/revision/);const persisted=storage.getItem(key);const failStorage={getItem:storage.getItem,setItem:()=>{throw new Error('quota');}};assert.throws(()=>saveCampaign(failStorage,{...next,revision:next.revision+1},key,next.revision),/quota/);assert.equal(storage.getItem(key),persisted);const deployed=createMission(candidate,seed+'-redeploy',setup,{mission_instance_id:s.mission_instance_id+'-redeploy',roster:next});assert.deepEqual(deployed.roster_snapshot.people,next.people);assert.deepEqual(s.roster_snapshot,snapshot);duplicate_debrief_rejected=true;}
 const summary={seed,scouted:!!setup.battlefield,first,save_reload:true,duplicate_debrief_rejected,outcome:s.status,attempt:s.attempt_number,orders:s.events.filter(e=>e.type==='COMMAND_ISSUED').length,contacts:s.events.filter(e=>e.type==='CONTACT_EVALUATED').length,enemies:Object.values(s.units).filter(u=>u.faction==='enemy').length,objective_check:s.events.findLast(e=>e.type==='OBJECTIVE_CHECK'),exact_replay:true,attempt_records_immutable:true,reconstitution:s.attempt_records[1]?.choices?.reconstitute??null,experience_spent:s.attempt_points_spent??0};
 const output=process.env.HILL_OUTPUT??`output/hill192-playtests-v${candidate.version}-r${s.rules_version}`;mkdirSync(output,{recursive:true});
 writeFileSync(`${output}/${seed.replace(/[^a-z0-9_-]/gi,'_')}-hill192.json`,JSON.stringify({summary,replay:exportReplay(s),events:s.events.filter(e=>!e.hidden)},null,2));
 console.log(summary);
}
