import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {trevieres} from '../src/scenarios/trevieres.js';
import {replayMission} from '../src/sim/company/engine.js';
import {readRecovery,resumeCheckpoint,SAVE_KEY} from '../src/ui/localRecovery.js';
it('retains original accepted M1 rules-25 bytes and rejects current-engine resume',()=>{
 const path='reference/playtest_replays/company-company-1-replay_10_5.json',raw=readFileSync(path,'utf8'),replay=JSON.parse(raw);
 expect(replay.rules_version).toBe(25);expect(()=>replayMission(trevieres,replay)).toThrow(/version mismatch/);
 const cp={replay,turn:10,phase:'CLEANUP',presentation:{}};const original=JSON.stringify({schema:1,latest:cp,turnStart:cp});
 const storage={getItem:key=>key===SAVE_KEY?original:null};const saved=readRecovery(storage);
 expect(saved.raw).toBe(original);expect(()=>resumeCheckpoint(trevieres,saved.bundle.latest)).toThrow(/version mismatch/);expect(storage.getItem(SAVE_KEY)).toBe(original);expect(readFileSync(path,'utf8')).toBe(raw);
});
