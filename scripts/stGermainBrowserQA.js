// Isolated actual-renderer QA; no production mission gate or accepted origin is changed.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {stGermain} from '../src/scenarios/stGermain.js';
import {createMission,replayMission,getPlayerView,submitCommand,selectHQ,advancePhase} from '../src/sim/company/engine.js';
import {checkpoint,SAVE_KEY} from '../src/ui/localRecovery.js';
const candidate={...stGermain,readiness:{playable:true}},cases={initial:checkpoint(createMission(candidate,'st-germain-browser'))};
const files=readdirSync('output/st-germain-playtests-v2-r32').filter(f=>f.endsWith('.json'));
if(files.length){
 const record=JSON.parse(readFileSync(`output/st-germain-playtests-v2-r32/${files[0]}`,'utf8')).replay;
 const prefix=i=>replayMission(candidate,{...record,operations:record.operations.slice(0,i),attempt_records:record.attempt_records.slice(0,1+record.operations.slice(0,i).filter(o=>o.op==='preparePatrol').length)});
 for(const [key,op]of [['combat','resolveCombat'],['support','resolveSupportChoice'],['preparation','preparePatrol']]){const i=record.operations.findIndex(o=>o.op===op);if(i>=0)cases[key]=checkpoint(prefix(i));}
 cases.finish=checkpoint(replayMission(candidate,record));
}
if(!cases.support)for(let n=0;n<40&&!cases.support;n++){
 let s=createMission(candidate,'st-germain-support-browser-'+n,{assignments:{artyfo:{platoon:1}},positions:{artyfo:'r1c1'}});
 for(let k=0;k<25&&s.status==='ACTIVE'&&!cases.support;k++){
  const v=getPlayerView(s);
  if(v.impulse)for(const u of v.units){
   const o=u.options.find(o=>o.type==='CALL_ARTILLERY_WP'&&o.available),t=o?.targets.find(t=>!t.reason);if(!t)continue;
   const result=submitCommand(s,{type:o.type,unit_id:u.id,issuer_id:v.impulse.hq==='general'?'co':v.impulse.hq,target_id:t.id});
   if(result.accepted&&result.state.pending_support){cases.support=checkpoint(result.state);break;}
  }
  if(!cases.support)s=!v.impulse&&v.eligible_hqs.length?selectHQ(s,v.eligible_hqs[0]).state:advancePhase(s).state;
 }
}
writeFileSync('tmp/st-germain-browser-cases.json',JSON.stringify(cases));
writeFileSync('tmp/st-germain-qa-missions.js',`import {missionCatalog as normal} from '/src/scenarios/missions.js';import {stGermain} from '/src/scenarios/stGermain.js';export const missionCatalog=[...normal,{id:stGermain.id,name:stGermain.name+' · isolated QA',scenario:{...stGermain,readiness:{playable:true}}}];export const missionById=id=>missionCatalog.find(m=>m.id===id)?.scenario;export const playableMissionById=missionById;`);
const rewrite=s=>s.replaceAll("from './","from '/src/ui/").replaceAll("import './","import '/src/ui/").replaceAll("from '../","from '/src/").replaceAll("import '../","import '/src/").replace("'/src/scenarios/missions.js'","'/tmp/st-germain-qa-missions.js'");
writeFileSync('tmp/st-germain-company-qa.js',rewrite(readFileSync('src/ui/companyMain.js','utf8')).replace("'/src/ui/commandHeader.js'","'/tmp/st-germain-header-qa.js'"));
writeFileSync('tmp/st-germain-header-qa.js',rewrite(readFileSync('src/ui/commandHeader.js','utf8')));
writeFileSync('tmp/st-germain-browser-qa.html',`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>St. Germain isolated browser QA</title></head><body><div id="app"></div><script type="module">
import cases from './st-germain-browser-cases.json';
const key=new URLSearchParams(location.search).get('case')||'initial';
if(sessionStorage.getItem('m5-qa-case')!==key){const cp=cases[key];if(!cp)throw Error('Unavailable case '+key);localStorage.setItem('${SAVE_KEY}',JSON.stringify({schema:1,latest:cp,turnStart:cp}));localStorage.setItem('platoon-normandy-st-germain-standalone',JSON.stringify({schema:1,...cp.replay.roster_snapshot,applied_missions:{}}));sessionStorage.setItem('m5-qa-case',key);}
await import('./st-germain-company-qa.js');</script></body></html>`);
console.log('Mission 5 browser cases:',Object.keys(cases));
