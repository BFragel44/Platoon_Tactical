import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {campaignCheckpoint,resumeCampaignCheckpoint} from '../src/sim/company/campaignProgression.js';
const cases=[['vire','6','sherman_hq','r0c2'],['tinchebray','7','m10_hq','r0c3']];
const results=[];
for(const [name,n,hq,location] of cases){
 const file=`${process.env.USERPROFILE}/Downloads/${name}-sequence-1_normandy_${n}-replay.json`;
 const replay=JSON.parse(readFileSync(file,'utf8')),state=importVireAdapterReplay(replay);
 const prepared=JSON.parse(readFileSync(`output/connected-campaign/handoffs/m${n}.json`,'utf8')).record;
 assert.equal(state.roster_snapshot.company_id,prepared.roster.company_id);
 assert.equal(state.vire_runtime.vehicles[hq].location,location);
 // Individual mortar views alias the section's people; canonical section
 // strength is the ownership check, not whether those views are populated.
 for(const f of Object.values(prepared.roster.formations).filter(f=>!prepared.support_formations.includes(f.id)&&f.kind!=='VEHICLE'&&!(f.kind==='MORTAR'&&f.capacity===1))){
  assert.deepEqual(state.roster_snapshot.formations[f.id].step_ids,f.step_ids);
  for(const id of f.step_ids)assert.deepEqual(state.roster_snapshot.steps[id].person_ids,prepared.roster.steps[id].person_ids);
 }
 let crewSteps=0;
 for(const v of Object.values(state.vire_runtime.vehicles).filter(v=>v.faction==='friendly'))for(const step of v.crew){
  assert.ok(step.id.startsWith(`${state.mission_instance_id}_support_`));
  const rosterStep=state.roster_snapshot.steps[step.id];assert.ok(rosterStep);
  assert.equal(rosterStep.formation_id,v.id);assert.equal(rosterStep.disposition,'ACTIVE');
  assert.ok(rosterStep.person_ids.length);crewSteps++;
 }
 if(n==='6')assert.ok(state.vire_runtime.vehicles.company_jeep);
 if(n==='7')assert.ok(Object.values(state.roster_snapshot.steps).filter(t=>t.formation_id.startsWith('sherman_')).every(t=>t.disposition!=='ACTIVE'));
 assert.deepEqual(resumeCampaignCheckpoint(campaignCheckpoint(state)).state,state);
 writeFileSync(`output/connected-campaign/m${n}-live-export.json`,JSON.stringify(replay,null,2));
 results.push({mission:n,crew_steps:crewSteps,company_identity:true,persistent_people:true,custom_hq_location:location,exact_recovery:true});
}
writeFileSync('output/connected-campaign/live-vehicle-checks.json',JSON.stringify(results,null,2));console.log(results);
