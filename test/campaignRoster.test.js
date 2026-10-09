import {describe,it,expect} from 'vitest';
import {createCampaignRoster,rosterSnapshot,applyMissionDebrief,saveCampaign,readCampaign,debriefAndSave,CAMPAIGN_KEY} from '../src/sim/company/campaignRoster.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,exportReplay,replayMission,endTurn} from '../src/sim/company/engine.js';

const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};
describe('separate campaign roster',()=>{
 it.each(['guard','generic'])('keeps %s steps unresolved when another step fills their HQ',kind=>{
  const roster=createCampaignRoster('generic-transfer',keepUpTheFire),s=createMission(keepUpTheFire,'generic-transfer',{}, {mission_instance_id:'generic-run',roster});
  s.status='DEFEAT';const original=s.units.co.steps.pop(),replacement=s.units.s11.steps.pop();
  if(kind==='guard')s.prisoners=[{guard:original,prisoners:[]}];else s.units.generic={id:'generic',kind:'LAT',faction:'friendly',steps:[original],experience:'Green'};
  s.units.co.steps.push(replacement);
  const next=applyMissionDebrief(roster,s);
  expect(next.steps[original.id].disposition).toBe(kind==='guard'?'GUARD_UNRESOLVED':'FORMATION_UNRESOLVED');
  for(const id of next.steps[original.id].person_ids)expect(next.people[id].disposition).toBe('ACTIVE');
  const redeployed=createMission(keepUpTheFire,'generic-next',{}, {mission_instance_id:'generic-next',roster:next});
  expect(redeployed.units.co.steps.map(step=>step.id)).toEqual([replacement.id]);
  expect(next.steps[original.id].person_ids).toEqual(roster.steps[original.id].person_ids);
 });

 it('retains a transferred step in its reconstituted formation after save and redeployment',()=>{
  const roster=createCampaignRoster('transfer',keepUpTheFire);
  const s=createMission(keepUpTheFire,'transfer',{}, {mission_instance_id:'run-transfer',roster});
  s.status='DEFEAT';const lost=s.units.s11.steps.pop(),donor=s.units.s12.steps.pop();
  s.casualties=[{step:lost,evacuated:false}];s.units.s11.steps.push(donor);
  const next=applyMissionDebrief(roster,s),disk=storage();saveCampaign(disk,next);
  const redeployed=createMission(keepUpTheFire,'transfer-redeploy',{}, {mission_instance_id:'run-redeploy',roster:readCampaign(disk).record});
  expect(redeployed.units.s11.steps.map(step=>step.id)).toContain(donor.id);
  expect(redeployed.units.s12.steps.map(step=>step.id)).not.toContain(donor.id);
  expect(redeployed.units.s11.max_steps).toBe(3);
  expect(next.steps[donor.id].formation_id).toBe('s11');
  expect(next.steps[lost.id].disposition).toBe('CASUALTY_UNRESOLVED');
  expect(next.steps[donor.id].person_ids).toEqual(roster.steps[donor.id].person_ids);
  expect(s.roster_snapshot).toEqual(rosterSnapshot(roster));
 });
 it('deploys and replays the exact stable identities',()=>{
  const roster=createCampaignRoster('able',keepUpTheFire);
  const mission=createMission(keepUpTheFire,'normandy-roster-fixture',{}, {mission_instance_id:'run-1',roster});
  const replay=exportReplay(mission),again=replayMission(keepUpTheFire,replay);
  expect(replay.mission_instance_id).toBe('run-1');
  expect(replay.roster_snapshot).toEqual(rosterSnapshot(roster));
  expect(again.personnel).toEqual(mission.personnel);
  expect(again.units.s11.steps).toEqual(mission.units.s11.steps);
  roster.people[Object.keys(roster.people)[0]].name='Changed later';
  expect(replay.roster_snapshot).toEqual(mission.roster_snapshot);
  expect(again.personnel).toEqual(mission.personnel);
 });
 it('applies a terminal debrief once and refuses stale or active results',()=>{
  const roster=createCampaignRoster('able',keepUpTheFire);
  const mission=createMission(keepUpTheFire,'debrief',{}, {mission_instance_id:'run-2',roster});
  expect(()=>applyMissionDebrief(roster,mission)).toThrow('terminal');
  const terminal={...mission,status:'DEFEAT',casualties:[{step:mission.units.s11.steps[0],evacuated:false}]};
  const next=applyMissionDebrief(roster,terminal);
  expect(next.revision).toBe(1);
  expect(next.steps.s11_step1.disposition).toBe('CASUALTY_UNRESOLVED');
  expect(roster.steps.s11_step1.disposition).toBe('ACTIVE');
  const redeployed=createMission(keepUpTheFire,'next',{}, {mission_instance_id:'run-3',roster:next});
  expect(redeployed.units.s11.steps.map(step=>step.id)).toEqual(['s11_step2','s11_step3']);
  expect(()=>applyMissionDebrief(next,terminal)).toThrow('already applied');
  expect(()=>applyMissionDebrief({...next,applied_missions:{}},terminal)).toThrow('revision');
  expect(()=>applyMissionDebrief({...roster,people:{...roster.people,[Object.keys(roster.people)[0]]:{...Object.values(roster.people)[0],name:'Altered'}}},terminal)).toThrow('contents changed');
  const disk=storage();saveCampaign(disk,roster);saveCampaign(disk,next);
  expect(readCampaign(disk).record).toEqual(next);
  expect(disk.getItem(`${CAMPAIGN_KEY}-previous`)).toBe(JSON.stringify(roster));
  expect(()=>debriefAndSave(disk,terminal)).toThrow('already applied');
  const fresh=storage();saveCampaign(fresh,roster);
  expect(debriefAndSave(fresh,terminal)).toEqual(next);
  expect(()=>saveCampaign(fresh,{...next,people:{}})).toThrow('different data');
 });
 it('keeps corrupt and newer records intact',()=>{
  const disk=storage(),roster=createCampaignRoster('able',keepUpTheFire);
  disk.setItem(CAMPAIGN_KEY,'{broken');
  expect(readCampaign(disk).error).toMatch(/Cannot read campaign/);
  expect(()=>saveCampaign(disk,roster)).toThrow('Export');
  expect(disk.getItem(CAMPAIGN_KEY)).toBe('{broken');
 });
 it('does not commit a debrief or applied-mission ledger when primary storage fails',()=>{
  const data=new Map(),base=storage(),roster=createCampaignRoster('able',keepUpTheFire);
  saveCampaign(base,roster);
  data.set(CAMPAIGN_KEY,base.getItem(CAMPAIGN_KEY));
  const failing={getItem:key=>data.get(key)??null,setItem:(key,value)=>{if(key===CAMPAIGN_KEY)throw new Error('storage full');data.set(key,value);}};
  const mission=createMission(keepUpTheFire,'storage-failure',{}, {mission_instance_id:'run-storage',roster});
  mission.status='DEFEAT';
  expect(()=>debriefAndSave(failing,mission)).toThrow('storage full');
  expect(readCampaign(failing).record).toEqual(roster);
  expect(readCampaign(failing).record.applied_missions).toEqual({});
 });
});
