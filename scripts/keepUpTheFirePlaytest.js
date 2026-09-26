import { mkdirSync,writeFileSync } from 'node:fs';
import { createMission,advancePhase,resolveCombat,selectHQ,submitCommand,getPlayerView,exportReplay,replayMission } from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
// Exercise the public mission definition, including its readiness check.
const companyAssault=keepUpTheFire;
import { isDeepStrictEqual } from 'node:util';

// These policies use only the player projection. They do not inspect hidden units/deck.
function choose(v,policy){
  const issuer=v.impulse.hq==='general'?'co':v.impulse.hq;
  const legal=[];
  for(const u of v.units.filter(u=>u.steps&&!u.removed))for(const o of u.options.filter(o=>o.available))for(const t of o.targets.filter(t=>!t.reason)){
    let score=-1000;const here=v.locations.find(l=>l.id===u.location),dest=v.locations.find(l=>l.id===t.id);
    if(o.type==='ACTIVATE')score=100;
    if(o.type==='RALLY')score=policy==='recovery'?95:75;
    if(o.type==='RECOVER')score=policy==='recovery'?90:55;
    if(o.type==='SPOT')score=policy==='direct'?45:85;
    if(o.type==='GRENADE')score=90;
    if(o.type.startsWith('CALL_'))score=policy==='direct'?30:88;
    if(o.type==='CONCENTRATE')score=policy==='direct'?25:65;
    if(o.type==='SEEK_COVER'&&u.incoming.length)score=policy==='recovery'?80:policy==='support'?55:15;
    if(o.type==='MOVE'||o.type==='INFILTRATE'||o.type==='PLATOON_MOVE'){
      const goals=v.contacts.filter(c=>!c.resolved).map(c=>v.locations.find(l=>l.id===c.location));
      goals.push(...['primary','secondary'].map(k=>v.locations.find(l=>l.id===v.objectives?.[k]?.location)).filter(Boolean));
      goals.push(...v.enemies.filter(e=>!e.removed&&e.steps).map(e=>v.locations.find(l=>l.id===e.location)));
      const d=l=>goals.length?Math.min(...goals.map(g=>Math.max(Math.abs(g.row-l.row),Math.abs(g.col-l.col)))):0;
      if(goals.length&&(d(dest)<d(here)||goals.some(g=>g.id===dest.id)))score=40+(d(here)-d(dest))*10+(o.type==='PLATOON_MOVE'?12:0);
      if(policy!=='direct'&&u.kind==='MG'&&u.fire)score=-1000;
      if(policy!=='direct'&&score>0)score+=(dest.protection??0)*3+(o.type==='INFILTRATE'?8:0);
      if(['HQ','STAFF','FO'].includes(u.kind)&&o.type==='MOVE'&&score>0)score-=12;
    }
    if(score>0)legal.push({score,command:{type:o.type,unit_id:u.id,issuer_id:issuer,target_id:t.id}});
  }
  return legal.sort((a,b)=>b.score-a.score)[0]?.command;
}
export function run(seed,policy){
  let s=createMission(companyAssault,seed),guard=0;
  while(s.status==='ACTIVE'&&guard++<2000){
    const v=getPlayerView(s,'friendly',s.impulse?.hq==='general'?'co':s.impulse?.hq);
    if(v.combat_resolution?.status==='PENDING'){s=resolveCombat(s,v.combat_resolution.id).state;continue;}
    if(!v.impulse&&v.eligible_hqs.length){s=selectHQ(s,v.eligible_hqs[0]).state;continue;}
    const c=v.impulse?choose(v,policy):null;
    if(c){const r=submitCommand(s,c);if(!r.accepted)throw new Error(r.reason);s=r.state;}else s=advancePhase(s).state;
  }
  if(s.status==='ACTIVE')throw new Error('Policy did not terminate');
  const record=exportReplay(s);
  if(!isDeepStrictEqual(s,replayMission(companyAssault,record)))throw new Error('Replay diverged');
  return {s,record,summary:{seed,policy,outcome:s.status,turn:s.turn,orders:s.events.filter(e=>e.type==='COMMAND_ISSUED').length,
    casualty_steps:s.casualties.filter(c=>c.faction==='friendly').length,contacts_remaining:Object.values(s.contacts).filter(c=>!c.resolved).length}};
}
const output=`output/keep-up-the-fire-integration-v${companyAssault.version}`;mkdirSync(output,{recursive:true});
const results=[];
const requestedSeed=process.argv[2],requestedPolicy=process.argv[3];
if(requestedSeed&&!['kut-1','kut-2'].includes(requestedSeed)||requestedPolicy&&!['direct','support','recovery'].includes(requestedPolicy))throw new Error('Use kut-1 or kut-2 and direct, support or recovery.');
for(const seed of requestedSeed?[requestedSeed]:['kut-1','kut-2'])for(const policy of requestedPolicy?[requestedPolicy]:['direct','support','recovery']){
  const {s,record,summary}=run(seed,policy);results.push(summary);
  writeFileSync(`${output}/${seed}-${policy}.json`,JSON.stringify({summary,replay:record,events:s.events.filter(e=>!e.hidden)},null,2));
}
writeFileSync(`${output}/summary${requestedSeed?`-${requestedSeed}-${requestedPolicy??'all'}`:''}.json`,JSON.stringify(results,null,2));console.table(results);
