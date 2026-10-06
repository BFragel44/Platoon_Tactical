import fs from 'node:fs';import assert from 'node:assert/strict';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,selectHQ,advancePhase,resolveCombat,abortMission,prepareReattempt,declineReattempt,replayMission,exportReplay,getAfterActionReport} from '../src/sim/company/engine.js';
import {applyMissionDebrief} from '../src/sim/company/campaignRoster.js';
import {secureStatus} from '../src/sim/company/missionFeatures.js';
const folder=process.argv[2]??'reference/playtest_replays',suffix=process.argv[3]??'10_5';
const read=name=>JSON.parse(fs.readFileSync(`${folder}/${name}_${suffix}.json`,'utf8'));
const replay=read('company-company-1-replay'),aar=read('company-company-1-aar'),roster=read('normandy-company-roster');
const json=value=>JSON.parse(JSON.stringify(value));
let state=createMission(trevieres,replay.seed,replay.setup,{mission_instance_id:replay.mission_instance_id,roster:{schema:1,...replay.roster_snapshot,applied_missions:{}}},{mission_instance_id:replay.mission_instance_id});
const dispatch=(s,op)=>({submitCommand:()=>submitCommand(s,op.command),selectHQ:()=>selectHQ(s,op.id),advancePhase:()=>advancePhase(s,op.options),resolveCombat:()=>resolveCombat(s,op.id),abortMission:()=>abortMission(s),reattempt:()=>prepareReattempt(s,op.choices),declineReattempt:()=>declineReattempt(s)})[op.op]();
for(const [index,op] of replay.operations.entries()){
 const result=dispatch(state,op);assert.notEqual(result.accepted,false,`operation ${index+1}`);assert.ok(!result.reason, result.reason);assert.notEqual(result.state,state);state=result.state;
 const steps=Object.values(state.units).flatMap(u=>u.steps.map(step=>step.id));assert.equal(new Set(steps).size,steps.length,`duplicate deployed step at ${index+1}`);
 for(const u of Object.values(state.units))for(const quantity of Object.values(u.ammo??{}))assert.ok(Number.isInteger(quantity)&&quantity>=0,`invalid ammunition at ${index+1}`);
 for(const inventory of Object.values(state.support_inventory))for(const quantity of Object.values(inventory))assert.ok(Number.isInteger(quantity)&&quantity>=0);
 for(const letter of ['A','B','C'])assert.ok(Object.values(state.contacts).filter(c=>!c.resolved&&c.type===letter).length<=16);
 assert.equal(new Set(state.achievements.map(a=>a.key)).size,state.achievements.length);
}
assert.deepEqual(json(exportReplay(state)),replay);assert.deepEqual(json(getAfterActionReport(state)),aar);assert.deepEqual(state,replayMission(trevieres,replay));
assert.equal(state.status,'SUCCESS');assert.equal(state.turn,10);assert.ok(secureStatus(state,state.objectives.primary).secured);assert.ok(secureStatus(state,state.objectives.secondary).secured);
for(const row of state.objectives.clear_rows)for(const location of Object.values(state.locations).filter(l=>l.row===row&&l.col>=1&&l.col<=4))assert.ok(secureStatus(state,location.id).cleared);
const updated=applyMissionDebrief({schema:1,...replay.roster_snapshot,applied_missions:{}},state);assert.deepEqual(updated,roster);assert.throws(()=>applyMissionDebrief(updated,state),/already applied/);
assert.deepEqual(Object.keys(updated.people).sort(),Object.keys(replay.roster_snapshot.people).sort());
assert.ok(Object.values(updated.people).every(p=>['ACTIVE','CASUALTY_UNRESOLVED','EVACUATED_UNRESOLVED','PRISONER_UNRESOLVED'].includes(p.disposition)));
console.log(JSON.stringify({operations:replay.operations.length,outcome:aar.outcome,turns:aar.turns,orders:aar.orders.length,score:aar.score,attempts:replay.attempt_records.length,exactReplay:true,exactAAR:true,exactRoster:true,perOperationInvariants:true,artilleryRemaining:state.support_inventory.artillery},null,2));
