import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {hill192} from '../src/scenarios/hill192.js';
import {stGermain} from '../src/scenarios/stGermain.js';
import {replayMission,exportReplay,RULES_VERSION} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
for(const [scenario,path,attempts] of [
 [trevieres,'output/company-playtests/normal-card-pull-38-normandy.json',2],
 [hill192,'output/hill192-playtests-v2-r38/hill-route-1-hill192.json',2],
 [stGermain,'output/st-germain-playtests-v2-r38/st-germain-short-1.json',3],
// These immutable rules38 recordings include the retired empty-card search command.
// Preserve them as archival evidence rather than migrate their order sequences.
])it.skipIf(RULES_VERSION!==38)(`${scenario.id}: archived rules38 card-pull lifecycle`,()=>{
 const bytes=readFileSync(path,'utf8'),record=JSON.parse(bytes).replay;
 expect(record.rules_version).toBe(RULES_VERSION);expect(record.combat_resolver).toBe('action-deck-v1');
 const s=replayMission(scenario,record);
 expect(s.status).toBe('DEFEAT');expect(s.attempt_records).toHaveLength(attempts);
 expect(exportReplay(s)).toEqual(record);expect(resumeCheckpoint(scenario,checkpoint(s)).state).toEqual(s);
 const combat=s.events.filter(e=>e.type==='COMBAT_RESOLVED');expect(combat.length).toBeGreaterThan(0);
 expect(combat.every(e=>e.resolver==='action-deck-v1'&&Number.isInteger(e.card_id)&&e.roll===null)).toBe(true);
 expect(s.events.filter(e=>e.type==='HIT_EFFECT_RESOLVED').every(e=>Number.isInteger(e.card_id)&&e.roll===null)).toBe(true);
 expect(record.operations.filter(o=>o.op==='reattempt'||o.op==='preparePatrol')).toHaveLength(attempts-1);
 expect(readFileSync(path,'utf8')).toBe(bytes);
},120000);
it.skipIf(RULES_VERSION!==39)('rules39 normal M1: failed attempt, successful reattempt and exact recovery',()=>{
 const path='output/company-playtests/spot-correction-39-normandy.json',bytes=readFileSync(path,'utf8'),fixture=JSON.parse(bytes),record=fixture.replay;
 expect(fixture.summary).toMatchObject({first:'DEFEAT',outcome:'SUCCESS',attempt:2,exact_replay:true});
 const s=replayMission(trevieres,record);expect(s.status).toBe('SUCCESS');expect(s.attempt_records).toHaveLength(2);
 expect(exportReplay(s)).toEqual(record);expect(resumeCheckpoint(trevieres,checkpoint(s)).state).toEqual(s);
 expect(s.events.findLast(e=>e.type==='OBJECTIVE_CHECK')).toMatchObject({objectives_held:true,rows_clear:true});
 expect(readFileSync(path,'utf8')).toBe(bytes);
},120000);
