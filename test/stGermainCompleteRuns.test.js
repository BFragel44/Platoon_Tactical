import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {stGermain} from '../src/scenarios/stGermain.js';
import {replayMission,exportReplay,createMission,preparePatrol} from '../src/sim/company/engine.js';
import {createCampaignRoster,startStandaloneRoster,readCampaign,debriefAndSave,applyMissionDebrief} from '../src/sim/company/campaignRoster.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const candidate={...stGermain,readiness:{playable:true}};
const read=seed=>JSON.parse(readFileSync(`output/st-germain-playtests-v2-r32/${seed}.json`,'utf8')).replay;
describe('authentic complete St. Germain patrol runs',()=>{
 for(const [seed,outcomes] of [['st-germain-short-2',['SUCCESS','SUCCESS','SUCCESS']],['st-germain-short-1',['SUCCESS','SUCCESS','DEFEAT']],['st-germain-short-1-defenders',['SUCCESS','SUCCESS','SUCCESS']]])it(`${seed}: three platoons, exact replay, recovery and isolated terminal persistence`,()=>{
  const record=read(seed),original=structuredClone(record),s=replayMission(candidate,record);
  expect(s.patrol_history.map(p=>p.outcome)).toEqual(outcomes);expect(s.patrol_history.map(p=>p.platoon)).toEqual([1,2,3]);
  expect(s.status).toBe(outcomes.includes('DEFEAT')?'DEFEAT':'SUCCESS');expect(s.attempt_records).toHaveLength(3);
  expect(exportReplay(s)).toEqual(record);expect(record).toEqual(original);expect(resumeCheckpoint(candidate,checkpoint(s)).state).toEqual(s);
  expect(s.events.some(e=>e.type==='CONTACT_EVALUATED')).toBe(true);
  const data=new Map([['platoon-normandy-campaign','M1'],['platoon-normandy-cerisy-standalone','M2'],['platoon-normandy-st-georges-standalone','M3'],['platoon-normandy-hill-192-standalone','M4']]);
  const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},key=candidate.rules.rosterKey,roster=createCampaignRoster(record.roster_snapshot.company_id,candidate);
  startStandaloneRoster(storage,roster,key);const before=storage.getItem(key);
  expect(()=>debriefAndSave({getItem:storage.getItem,setItem:()=>{throw Error('quota');}},s,key)).toThrow('quota');expect(storage.getItem(key)).toBe(before);
  const next=applyMissionDebrief(roster,s);debriefAndSave(storage,s,key);expect(readCampaign(storage,key).record).toEqual(next);
  expect(()=>debriefAndSave(storage,s,key)).toThrow(/already applied/);expect(()=>applyMissionDebrief({...roster,revision:1},s)).toThrow(/revision/);
  const deployed=createMission(candidate,seed+'-redeploy',{}, {mission_instance_id:seed+'-redeploy',roster:next});expect(deployed.roster_snapshot.people).toEqual(next.people);
  expect(s.roster_snapshot).toEqual(record.roster_snapshot);for(const [k,v]of [['platoon-normandy-campaign','M1'],['platoon-normandy-cerisy-standalone','M2'],['platoon-normandy-st-georges-standalone','M3'],['platoon-normandy-hill-192-standalone','M4']])expect(data.get(k)).toBe(v);
  expect(()=>preparePatrol(s,{})).toThrow(/No next patrol/);
 },120000);
 it('retains the real expanded battlefield and immutable starts across both preparations',()=>{
  const record=read('st-germain-short-1-defenders');
  for(const [n,index]of record.operations.map((o,i)=>o.op==='preparePatrol'?i:-1).filter(i=>i>=0).entries()){
   const before=replayMission(candidate,{...record,operations:record.operations.slice(0,index),attempt_records:record.attempt_records.slice(0,n+1)}),immutable=structuredClone(before.attempt_records);
   expect(before.status).toBe('PATROL_COMPLETE');expect(()=>applyMissionDebrief(createCampaignRoster(record.roster_snapshot.company_id,candidate),before)).toThrow();
   const after=preparePatrol(before,record.operations[index].choices).state;
   for(const [target,donors] of Object.entries(record.operations[index].choices.reconstitute??{})){
    for(const donor of donors){for(const step of before.units[donor].steps)expect(after.units[target].steps.some(s=>s.id===step.id)).toBe(true);expect(after.units[donor].removed).toBeTruthy();}
   }
   expect(after.attempt_records.slice(0,n+1)).toEqual(immutable);expect(after.attempt_records[n+1]).toEqual(record.attempt_records[n+1]);
   for(const [id,l]of Object.entries(before.locations)){expect(after.locations[id]).toMatchObject({terrain:l.terrain,covers:l.covers});expect(after.locations[id].mines).toBe(l.mines);}
   for(const [id,spotted]of Object.entries(before.knowledge.spotted)){expect(after.knowledge.spotted[id]).toMatchObject({id:spotted.id,location:spotted.location,kind:spotted.kind});expect(after.knowledge.spotted[id].removed).toBe(after.units[id]?.removed??spotted.removed);}
   expect(after.support_inventory).toEqual(Object.fromEntries(Object.entries(candidate.support_agencies).map(([id,a])=>[id,a.inventory])));
   expect(resumeCheckpoint(candidate,checkpoint(after)).state).toEqual(after);
  }
 },120000);
});
