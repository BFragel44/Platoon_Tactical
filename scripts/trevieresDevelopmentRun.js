import {isDeepStrictEqual} from 'node:util';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,getPlayerView,selectHQ,submitCommand,advancePhase,resolveCombat,exportReplay,replayMission,prepareReattempt} from '../src/sim/company/engine.js';

// Development harness only: the public mission remains gated pending acceptance.
const candidate={...trevieres,readiness:{playable:true}};
function run(seed){
 let s=createMission(candidate,seed),operations=0;
 while(s.status==='ACTIVE'&&operations++<5000){
  const view=getPlayerView(s);
  if(view.combat_resolution?.status==='PENDING'){s=resolveCombat(s,view.combat_resolution.id).state;continue;}
  if(!view.impulse&&view.eligible_hqs.length){s=selectHQ(s,view.eligible_hqs[0]).state;continue;}
  const issuer=view.impulse?.hq==='general'?'co':view.impulse?.hq;
  let command=null;
  if(view.impulse)for(const unit of view.units.filter(u=>u.steps&&!u.removed)){
   const action=unit.options.find(o=>o.type==='MOVE'&&o.available&&o.targets.some(t=>!t.reason&&view.locations.find(l=>l.id===t.id)?.row>view.locations.find(l=>l.id===unit.location)?.row));
   const target=action?.targets.find(t=>!t.reason&&view.locations.find(l=>l.id===t.id)?.row>view.locations.find(l=>l.id===unit.location)?.row);
   if(target){command={type:'MOVE',unit_id:unit.id,issuer_id:issuer,target_id:target.id};break;}
  }
  if(command){const result=submitCommand(s,command);if(!result.accepted)throw new Error(result.reason);s=result.state;}
  else s=advancePhase(s,s.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;
 }
 if(s.status==='ACTIVE')throw new Error(`Mission did not terminate after ${operations} operations (turn ${s.turn}, phase ${s.phase}).`);
 if(!isDeepStrictEqual(s,replayMission(candidate,exportReplay(s))))throw new Error('First-attempt replay diverged.');
 if(s.status==='DEFEAT'){
  const secured=Object.values(s.locations).find(l=>l.staging&&Object.values(s.units).some(u=>u.faction==='friendly'&&!u.removed&&u.steps.length&&u.location===l.id));
  if(secured){const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&!u.removed&&u.steps.length).map(u=>[u.id,secured.id]));
   s=prepareReattempt(s,{positions}).state;
   for(let turn=0;turn<10&&s.status==='ACTIVE';turn++){
    let guard=0,current=s.turn;
    while(s.status==='ACTIVE'&&s.turn===current&&guard++<100){const view=getPlayerView(s);if(view.combat_resolution?.status==='PENDING')s=resolveCombat(s,view.combat_resolution.id).state;else if(!view.impulse&&view.eligible_hqs.length)s=selectHQ(s,view.eligible_hqs[0]).state;else s=advancePhase(s,s.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;}
   }
   if(!isDeepStrictEqual(s,replayMission(candidate,exportReplay(s))))throw new Error('Second-attempt replay diverged.');
  }
 }
 return {seed,operations,outcome:s.status,attempt:s.attempt_number,turn:s.turn,contact_checks:s.events.filter(e=>e.type==='CONTACT_EVALUATED').length,enemy_placed:Object.values(s.units).filter(u=>u.faction==='enemy').length,casualties:s.events.filter(e=>e.type==='CASUALTY').length};
}
for(const seed of process.argv.slice(2).length?process.argv.slice(2):['trev-dev-1','trev-dev-2'])console.log(run(seed));
