import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {historicalM3Battlefield} from '../src/sim/company/historicalBattlefield.js';
const [input,output]=process.argv.slice(2);
if(!input||!output||resolve(input)===resolve(output))throw new Error('Usage: node scripts/exportHistoricalM3Battlefield.js original-replay.json new-battlefield.json');
const parsed=JSON.parse(readFileSync(input,'utf8'));
// Acceptance fixture envelopes are supported by this CLI only; game import takes a raw replay.
const battlefield=historicalM3Battlefield(parsed.replay??parsed);
writeFileSync(output,JSON.stringify(battlefield,null,2),{flag:'wx'});
console.log(`Exported ${battlefield.locations.length} cards; original rules ${battlefield.source.rules_version}, ${battlefield.source.seed}.`);
