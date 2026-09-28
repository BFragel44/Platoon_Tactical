import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {missionById} from '../src/scenarios/missions.js';
import {dirname} from 'node:path';
import {compareReplay} from '../src/sim/company/engine.js';

const file=process.argv[2]??'reference/playtest_replays/company-company-1-replay.json';
const bytes=readFileSync(file),record=JSON.parse(bytes);
const comparison=compareReplay(missionById(record.scenario),record);
const report={source:file,sha256:createHash('sha256').update(bytes).digest('hex'),
  historical_baseline:file.endsWith('company-company-1-replay.json')?{operations:310,outcome:'SUCCESS',turn:10,empty_spotting_attempts:19}:file.endsWith('company-company-1-replay_KEEPUPFIRE1.json')?{operations:557,outcome:'DEFEAT',turn:10,score:27,visible_events:1436}:null,
  warning:'Diagnostic only: after the first changed/rejected order, draws and phases may diverge. This is not a corrected human playthrough.',...comparison};
const output=process.argv[3]??'output/company-playtests/historical-comparison.json';
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({source:file,sha256:report.sha256,outcome:comparison.outcome,turn:comparison.turn,rejected:comparison.rejected,
  first_rejections:comparison.operations.filter(o=>!o.accepted).slice(0,5)},null,2));
