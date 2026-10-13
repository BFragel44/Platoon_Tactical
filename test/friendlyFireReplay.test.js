import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {compareReplay,replayMission,RULES_VERSION} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {replayMission as replayRules35,exportReplay as exportRules35,trevieres as trevieresRules35} from '../src/sim/company/compat/rules35.js';
it.skip('archived weighted replay: reproduces the error and compares the old order sequence',()=>{
 const original=JSON.parse(readFileSync('output/friendly-fire-audit/original-rules35-replay.json','utf8'));
 const historical=replayRules35(trevieresRules35,original);
 expect(JSON.parse(JSON.stringify(exportRules35(historical)))).toEqual(original);
 expect(historical.phase).toBe('PINNED_RECOVERY');
 for(const id of ['mg2','at2','at3'])expect(historical.units[id].fire).toBe('r2c4');
 expect(()=>replayMission(trevieres,original)).toThrow(/version mismatch/);
 const diagnostic=compareReplay(trevieres,original);
 expect(diagnostic).toMatchObject({diagnostic:true,source_rules_version:35,target_rules_version:RULES_VERSION,rejected:0});
 expect(diagnostic.events.filter(e=>e.turn===3&&e.type==='FIRE_ESTABLISHED'&&['mg2','at2','at3'].includes(e.actor)&&e.target==='r2c4')).toEqual([]);
 expect(diagnostic.events.some(e=>e.turn===3&&e.type==='FIRE_ESTABLISHED'&&e.actor==='hmg50'&&e.target==='r3c5')).toBe(true);
 expect(original.rules_version).toBe(35);
});
