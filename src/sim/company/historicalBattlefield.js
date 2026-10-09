import {replayMission,stGeorges} from './compat/stGeorgesRules27.js';
import {exportScoutedBattlefield,validateScoutedBattlefield} from './battlefieldCarryover.js';
// Read-only execution of the accepted original engine; never migrate recovery or rewrite versions.
export function historicalM3Battlefield(record){
 const original=structuredClone(record);
 if(original?.scenario!=='normandy_3'||original.ruleset!=='company-v1'||original.version!==1||original.rules_version!==27)throw new Error('Unsupported historical M3 replay version. Preserve the original export.');
 return exportScoutedBattlefield(replayMission(stGeorges,original));
}
export function readBattlefieldFile(text){
 const parsed=JSON.parse(text);
 return parsed?.schema===1?validateScoutedBattlefield(parsed):historicalM3Battlefield(parsed);
}
