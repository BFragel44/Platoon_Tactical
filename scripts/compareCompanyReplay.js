import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {compareReplay} from '../src/sim/company/engine.js';

const file=process.argv[2]??'reference/playtest_replays/company-company-1-replay.json';
const bytes=readFileSync(file),record=JSON.parse(bytes);
const comparison=compareReplay(companyAssault,record);
const report={source:file,sha256:createHash('sha256').update(bytes).digest('hex'),
  historical_baseline:file.endsWith('company-company-1-replay.json')?{operations:310,outcome:'SUCCESS',turn:10,empty_spotting_attempts:19}:null,
  warning:'Diagnostic only: after the first changed/rejected order, draws and phases may diverge. This is not a corrected human playthrough.',...comparison};
mkdirSync('output/company-playtests',{recursive:true});
writeFileSync('output/company-playtests/historical-comparison.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({source:file,sha256:report.sha256,outcome:comparison.outcome,turn:comparison.turn,rejected:comparison.rejected,
  first_rejections:comparison.operations.filter(o=>!o.accepted).slice(0,5)},null,2));
