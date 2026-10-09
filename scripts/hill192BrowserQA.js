import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {hill192} from '../src/scenarios/hill192.js';
import {createMission,replayMission,RULES_VERSION,advancePhase,getPlayerView,submitCommand,selectHQ} from '../src/sim/company/engine.js';
import {checkpoint,SAVE_KEY} from '../src/ui/localRecovery.js';
import {historicalM3Battlefield} from '../src/sim/company/historicalBattlefield.js';
const candidate={...hill192,readiness:{playable:true}},cases={};
const state=createMission(candidate,'hill-browser-initial');cases.initial=checkpoint(state);
const file=`output/hill192-playtests-v${hill192.version}-r${RULES_VERSION}-final/hill-scouted-2-hill192.json`;
try{
 const {replay:r}=JSON.parse(readFileSync(file,'utf8'));
 const at=(i)=>replayMission(candidate,{...r,operations:r.operations.slice(0,i),attempt_records:r.attempt_records.slice(0,1+r.operations.slice(0,i).filter(o=>o.op==='reattempt').length)});
 for(const [key,op] of [['combat','resolveCombat'],['support','resolveSupportChoice'],['reattempt','reattempt']]){const i=r.operations.findIndex(o=>o.op===op);if(i>=0)cases[key]=checkpoint(at(i));}
 cases.finish=checkpoint(replayMission(candidate,r));
}catch(e){if(e.code!=='ENOENT')throw e;}
const source=historicalM3Battlefield(JSON.parse(readFileSync('output/st-georges-playtests/st-georges-attached-1.json','utf8')).replay);

if(!cases.support)for(let n=0;n<40&&!cases.support;n++){
 let s=createMission(candidate,'hill-support-browser-'+n,{battlefield:source});
 for(let k=0;k<25&&s.status==='ACTIVE'&&!cases.support;k++){
  const v=getPlayerView(s);
  if(v.impulse){
   for(const u of v.units){const order=u.options.find(o=>o.type==='CALL_ARTILLERY_WP'&&o.available),t=order?.targets.find(t=>!t.reason);if(!t)continue;
    const r=submitCommand(s,{type:'CALL_ARTILLERY_WP',unit_id:u.id,issuer_id:v.impulse.hq==='general'?'co':v.impulse.hq,target_id:t.id});
    if(r.accepted&&r.state.pending_support){cases.support=checkpoint(r.state);break;}
   }
  }
  if(!cases.support)s=!v.impulse&&v.eligible_hqs.length?selectHQ(s,v.eligible_hqs[0]).state:advancePhase(s).state;
 }
}

writeFileSync('tmp/hill192-browser-cases.json',JSON.stringify({cases,source}));
let ui=readFileSync('src/ui/companyMain.js','utf8').replaceAll("from './","from '/src/ui/").replaceAll("import './","import '/src/ui/").replaceAll("from '../","from '/src/").replaceAll("import '../","import '/src/").replace("'/src/scenarios/missions.js'","'/tmp/hill192-qa-missions.js'");
ui=ui.replace("'/src/ui/commandHeader.js'","'/tmp/hill192-header-qa.js'");writeFileSync('tmp/hill192-company-qa.js',ui);
let header=readFileSync('src/ui/commandHeader.js','utf8').replaceAll("from './","from '/src/ui/").replaceAll("from '../","from '/src/").replace("'/src/scenarios/missions.js'","'/tmp/hill192-qa-missions.js'");writeFileSync('tmp/hill192-header-qa.js',header);
writeFileSync('tmp/hill192-qa-missions.js',`import {missionCatalog as normal} from '/src/scenarios/missions.js';import {hill192} from '/src/scenarios/hill192.js';export const missionCatalog=[...normal,{id:hill192.id,name:hill192.name+' · isolated QA',scenario:{...hill192,readiness:{playable:true}}}];export const missionById=id=>missionCatalog.find(m=>m.id===id)?.scenario;export const playableMissionById=missionById;`);
writeFileSync('tmp/hill192-browser-qa.html',`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hill 192 isolated browser QA</title></head><body><div id="app"></div><script type="module">
import data from './hill192-browser-cases.json';
const key=new URLSearchParams(location.search).get('case')||'initial';
if(sessionStorage.getItem('hill-qa-case')!==key){const cp=data.cases[key];if(!cp)throw Error('Unavailable QA case '+key);localStorage.setItem('${SAVE_KEY}',JSON.stringify({schema:1,latest:cp,turnStart:cp}));localStorage.setItem('platoon-normandy-battlefields',JSON.stringify({schema:1,entries:{[data.source.source.mission_instance_id]:data.source}}));localStorage.setItem('platoon-normandy-hill-192-standalone',JSON.stringify({schema:1,...cp.replay.roster_snapshot,applied_missions:{}}));sessionStorage.setItem('hill-qa-case',key);}
await import('./hill192-company-qa.js');
</script></body></html>`);
console.log('Browser QA cases:',Object.keys(cases));
