import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {hill192} from '../src/scenarios/hill192.js';
import {replayMission,replayOperation,exportReplay,getAfterActionReport} from '../src/sim/company/engine.js';
import {applyMissionDebrief} from '../src/sim/company/campaignRoster.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

// Run only after the manual runs finish. Output deliberately excludes hidden events.
const directory=process.argv[2]??'reference/playtest_replays/manual_followup_2026_10_12';
const read=name=>JSON.parse(readFileSync(join(directory,name),'utf8'));
const json=value=>JSON.parse(JSON.stringify(value));
const results=[];
for(const [scenario,stem,aar,roster] of [
 [stGeorges,'M3_three_patrols_success_replay','M3_three_patrols_success_aar','M3_terminal_roster'],
 [hill192,'M4_reattempt_success_replay','M4_reattempt_success_aar','M4_terminal_roster'],
]){
 const record=read(stem+'.json'),original=structuredClone(record),state=replayMission(scenario,record);
 assert.deepEqual(json(exportReplay(state)),record,'Replay round trip');
 assert.deepEqual(json(getAfterActionReport(state)),read(aar+'.json'),'Public AAR');
 assert.deepEqual(resumeCheckpoint(scenario,checkpoint(state)).state,state,'Recovery');
 assert.deepEqual(record,original,'Input immutability');
 const initial={schema:1,...structuredClone(record.roster_snapshot),applied_missions:{}};
 const committed=applyMissionDebrief(initial,state);
 assert.deepEqual(json(committed),read(roster+'.json'),'Browser debrief');
 assert.deepEqual(Object.keys(committed.people).sort(),Object.keys(initial.people).sort(),'Person identities retained');
 assert.throws(()=>applyMissionDebrief(committed,state),/already applied/);
 assert.throws(()=>applyMissionDebrief({...initial,revision:initial.revision+1},state),/revision/);
 const history=record.scenario==='normandy_3'?
  ['M3_patrol1_success_replay','M3_patrol2_success_replay']:['M4_attempt1_defeat_replay'];
 for(const file of history){
  const earlier=read(file+'.json'),earlierState=replayMission(scenario,earlier);
  assert.deepEqual(record.operations.slice(0,earlier.operations.length),earlier.operations,'Operation history prefix');
  assert.deepEqual(record.attempt_records.slice(0,earlier.attempt_records.length),earlier.attempt_records,'Immutable earlier starts');
  assert.deepEqual(json(exportReplay(earlierState)),earlier,'Earlier replay round trip');
 }
 const transitions=[];
 for(const [index,op] of record.operations.entries())if(['preparePatrol','reattempt'].includes(op.op)){
  const prefix={...record,operations:record.operations.slice(0,index),attempt_records:record.attempt_records.slice(0,1+record.operations.slice(0,index).filter(o=>['preparePatrol','reattempt'].includes(o.op)).length)};
  const before=replayMission(scenario,prefix),after=replayOperation(before,op).state;
  assert.deepEqual(after.attempt_records.slice(0,-1),before.attempt_records,'Prior attempt starts');
  for(const [id,location] of Object.entries(before.locations)){
   for(const field of ['name','row','col','terrain','terrain_card','elevation','hills','borders','protection','cover_limit','cover_draw','burst','known','building','covers','trafficability','mines'])assert.deepEqual(after.locations[id][field],location[field],`Retained ${field} at ${id}`);
  }
  for(const [id,contact] of Object.entries(before.contacts))assert.deepEqual(after.contacts[id],contact,'Existing contacts retained');
  // §3.9 unpins surviving enemies and removes P/L teams. Spotting identity
  // and position persist; the refreshed public status need not stay frozen.
  for(const [id,known] of Object.entries(before.knowledge.spotted)){
   assert.ok(after.knowledge.spotted[id],'Enemy remains known');
   for(const field of ['id','name','kind','location','cover'])assert.deepEqual(after.knowledge.spotted[id][field],known[field],'Known enemy identity/position retained');
  }
  const awards=list=>list.map(({spent,...award})=>award);
  assert.deepEqual(awards(after.achievements),awards(before.achievements),'Previously awarded rewards retained');
  if(op.op==='preparePatrol')assert.ok(after.achievements.filter(a=>a.platoon===before.patrol.plan.platoon).every(a=>a.spent),'Prior patrol points expire');
  assert.equal(after.enemy_tactics,after.mission_rules.tactics,'Baseline tactics restored');
  transitions.push({operation:op.op,attempt:after.attempt_number,battlefield_retained:true,spotting_retained:true,rewards_retained:true});
 }
 assert.equal(new Set(state.achievements.map(a=>a.key)).size,state.achievements.length,'No duplicate reward keys');
 results.push({scenario:scenario.id,outcome:state.status,turn:state.turn,attempts:record.attempt_records.length,orders:getAfterActionReport(state).orders.length,casualty_steps:getAfterActionReport(state).casualties.reduce((n,e)=>n+(e.steps??1),0),exact_replay:true,exact_public_aar:true,save_reload:true,immutable_starts:true,browser_debrief_exact:true,duplicate_and_stale_rejected:true,transitions});
}
assert.deepEqual(read('M4_reattempt_success_replay.json').setup.battlefield,read('M3_scouted_battlefield.json'),'Actual exported M3 battlefield imported');
assert.notEqual(read('M3_terminal_roster.json').company_id,read('M4_terminal_roster.json').company_id,'Standalone company isolation');
writeFileSync(join(directory,'validation_summary.json'),JSON.stringify({runs:results,actual_m3_battlefield_import:true,separate_companies:true},null,2));
console.log(JSON.stringify(results,null,2));
