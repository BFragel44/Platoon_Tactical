import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {trevieres} from '../src/scenarios/trevieres.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {newCompanyCampaign,saveCompanyPreparation,readCompanyPreparation,beginCompanyPreparation,prepareCompany} from '../src/sim/company/campaignPreparation.js';
import {commitCampaignMission,resumeCommittedCampaign,campaignCheckpoint,resumeCampaignCheckpoint,campaignProgress} from '../src/sim/company/campaignProgression.js';
import {replayOperation,exportReplay,replayMission,getPlayerView,prepareReattempt} from '../src/sim/company/engine.js';
import {playCerisy} from './campaignValidationPolicy.js';

// Execute recorded legal M1 choices in a NEW published company. Never import the
// standalone roster or alter outcomes, cards, terrain, contacts or random state.
const source=JSON.parse(readFileSync('output/company-playtests/spot-correction-39-normandy.json','utf8')).replay;
const values=new Map([['platoon-company-recovery','standalone sentinel'],['platoon-vire-recovery','vehicle sentinel']]);
const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
let record=newCompanyCampaign(trevieres,'connected-validation-39');
saveCompanyPreparation(storage,record);
const first=commitCampaignMission(storage,record,'connected-validation-m1',source.seed,source.setup);
let state=first.state;
for(const [index,operation] of source.operations.entries()){
 const result=replayOperation(state,operation);
 assert.notEqual(result.accepted,false,`M1 operation ${index+1}: ${result.reason}`);
 assert.notEqual(result.state,state,`M1 operation ${index+1} made no progress`);
 state=result.state;
}
assert.equal(state.status,'SUCCESS');
assert.deepEqual(resumeCampaignCheckpoint(campaignCheckpoint(state)).state,state);
const immutable=structuredClone(state.roster_snapshot);
record=beginCompanyPreparation(first.record,state);
saveCompanyPreparation(storage,record,first.record.revision);
const operations=[];
const apply=op=>{const before=record.revision;record=prepareCompany(record,op);saveCompanyPreparation(storage,record,before);record=readCompanyPreparation(storage);operations.push(op);};
// Restore vacant HQs with surviving unassigned steps before purchasing replacements.
for(const f of Object.values(record.roster.formations).filter(f=>['HQ','STAFF'].includes(f.kind)&&!f.step_ids.length&&record.preparation.fieldable.includes(f.id))){
 const step=record.preparation.available[0];if(step)apply({type:'TRANSFER',step,target:f.id});
}
apply({type:'NEXT'});
for(const f of Object.values(record.roster.formations).filter(f=>record.preparation.fieldable.includes(f.id)&&!record.preparation.attachments.includes(f.id)).sort((a,b)=>Number(['HQ','STAFF'].includes(b.kind))-Number(['HQ','STAFF'].includes(a.kind)))){
 while(record.roster.formations[f.id].step_ids.length<f.capacity&&record.preparation.replacement_slots&&(record.preparation.replacements.veteran||record.preparation.replacements.green)){
  apply({type:'REPLACE',target:f.id,level:record.preparation.replacements.veteran?'veteran':'green'});
 }
}
apply({type:'NEXT'});
for(const f of Object.values(record.roster.formations).filter(f=>f.kind==='HQ'&&f.step_ids.length&&!record.preparation.attachments.includes(f.id)).slice(0,2))if(record.preparation.points)apply({type:'SKILL',purchase:{holder:f.id,type:'AUTO_SPOT'}});
apply({type:'NEXT'});
assert.deepEqual(record.history[0].snapshot,immutable);
const second=commitCampaignMission(storage,record,'connected-validation-m2',process.argv[2]??'cerisy-accept-1');
assert.deepEqual(resumeCommittedCampaign(readCompanyPreparation(storage)).state,second.state);
assert.equal(second.state.roster_snapshot.company_id,immutable.company_id);
// Tactical skill IDs are scoped to the new attempt; printed counter and holder persist.
assert.deepEqual(second.state.skills.map(({id,...skill})=>skill),record.roster.prepared_skills.map(({id,...skill})=>skill));
let m2=playCerisy(second.state);
const firstOutcome=m2.status;
if(m2.status==='DEFEAT'){
 const v=getPlayerView(m2),secured=v.locations.filter(l=>v.units.some(u=>u.steps&&!u.removed&&u.location===l.id)&&!v.enemies.some(u=>u.steps&&!u.removed&&u.location===l.id)&&!v.contacts.some(c=>!c.resolved&&c.location===l.id)).sort((a,b)=>b.row-a.row);
 if(secured.length){
  const load={},positions={};for(const u of v.units.filter(u=>u.steps&&!u.removed&&u.kind!=='RUNNER'&&u.command_role!=='higher_hq')){
   const card=secured.find(l=>l.staging||(load[l.id]??0)+u.steps<=16);assert.ok(card);positions[u.id]=card.id;load[card.id]=(load[card.id]??0)+u.steps;
  }
  const retry=prepareReattempt(m2,{positions});assert.notEqual(retry.accepted,false,retry.reason);m2=playCerisy(retry.state);
 }
}
assert.deepEqual(replayMission(cerisy,exportReplay(m2)),m2);
assert.deepEqual(resumeCampaignCheckpoint(campaignCheckpoint(m2)).state,m2);
const debrief=beginCompanyPreparation(second.record,m2);
assert.deepEqual(debrief.history[0].snapshot,immutable);
assert.equal(storage.getItem('platoon-company-recovery'),'standalone sentinel');
assert.equal(storage.getItem('platoon-vire-recovery'),'vehicle sentinel');
const summary={m1:{outcome:state.status,attempt:state.attempt_number,orders:state.events.filter(e=>e.type==='COMMAND_ISSUED').length},preparation:operations,m2:{seed:m2.seed,first:firstOutcome,outcome:m2.status,attempt:m2.attempt_number,orders:m2.events.filter(e=>e.type==='COMMAND_ISSUED').length},progress:campaignProgress(debrief),exact_replay:true,standalone_isolation:true};
mkdirSync('output/connected-campaign',{recursive:true});
writeFileSync('output/connected-campaign/m1-m2-39.json',JSON.stringify({summary,record:debrief,m1:exportReplay(state),m2:exportReplay(m2)},null,2));
console.log(JSON.stringify(summary,null,2));
