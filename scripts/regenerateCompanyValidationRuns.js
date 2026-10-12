import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {hill192} from '../src/scenarios/hill192.js';
import {stGermain} from '../src/scenarios/stGermain.js';
import {createMission,replayOperation,exportReplay,replayMission,RULES_VERSION} from '../src/sim/company/engine.js';
// Execute old validation order sequences as NEW runs; never import or relabel old saves.
for(const scenario of [hill192,stGermain]){
 const name=scenario.id==='normandy_4'?'hill192':'st-germain';
 const source=`output/${name}-playtests-v2-r33`,target=`output/${name}-playtests-v2-r${RULES_VERSION}`;
 mkdirSync(target,{recursive:true});
 for(const file of readdirSync(source).filter(f=>f.endsWith('.json'))){
  const raw=readFileSync(`${source}/${file}`,'utf8'),old=JSON.parse(raw),record=old.replay;
  let state=createMission(scenario,record.seed,record.setup,{mission_instance_id:record.mission_instance_id,roster:{schema:1,...record.roster_snapshot,applied_missions:{}}});
  for(const [i,operation] of record.operations.entries()){
   const result=replayOperation(state,operation);
   assert.ok(result.state!==state&&!result.reason&&result.accepted!==false,`Order ${i+1} rejected in ${file}: ${result.reason}`);state=result.state;
  }
  const replay=exportReplay(state);assert.deepEqual(replayMission(scenario,replay),state);
  assert.equal(state.status,old.summary.outcome);assert.equal(readFileSync(`${source}/${file}`,'utf8'),raw);
  writeFileSync(`${target}/${file}`,JSON.stringify({summary:{...old.summary,validation_rules: RULES_VERSION},validation_source:{path:`${source}/${file}`,rules:record.rules_version,method:'new execution of recorded legal orders'},replay},null,2));
  console.log(`${file}: ${state.status}, exact current replay`);
 }
}
