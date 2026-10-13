import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {replayMission,compareReplay,createMission,replayOperation,getPlayerView,exportReplay} from '../src/sim/company/engine.js';
import {trevieresCardPull} from '../src/scenarios/trevieresCardPull.js';
import {replayMission as historicalReplay,exportReplay as historicalExport,trevieresCardPull as historicalScenario} from '../src/sim/company/compat/rules36.js';
it('preserves the original turn-nine record and exposes the missing position in a current-rules diagnostic',()=>{
 const original=JSON.parse(readFileSync('output/ccp-objective-audit/original-rules36-replay.json','utf8'));
 const old=historicalReplay(historicalScenario,original);
 expect(JSON.parse(JSON.stringify(historicalExport(old)))).toEqual(original);
 expect(old.knowledge.suspected[old.objectives.secondary]).toBeFalsy();
 expect(()=>replayMission(trevieresCardPull,original)).toThrow(/version mismatch/);
 const diagnostic=compareReplay(trevieresCardPull,original);
 expect(diagnostic.rejected).toBe(0);
 let current=createMission(trevieresCardPull,original.seed,original.setup,{mission_instance_id:original.mission_instance_id,roster:{schema:1,...original.roster_snapshot,applied_missions:{}}});
 for(const op of original.operations)current=replayOperation(current,op).state;
 expect(getPlayerView(current).suspected).toContain(current.objectives.secondary);
 expect(replayMission(trevieresCardPull,exportReplay(current))).toEqual(current);
});
