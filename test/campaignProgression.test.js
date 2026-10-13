import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {newCompanyCampaign,saveCompanyPreparation,readCompanyPreparation,beginCompanyPreparation,prepareCompany,PREPARATION_KEY} from '../src/sim/company/campaignPreparation.js';
import {decodeRecovery} from '../src/sim/company/recoveryEncoding.js';
import {campaignProgress,commitCampaignMission,resumeCommittedCampaign,campaignCheckpoint,resumeCampaignCheckpoint,NORMANDY_SEQUENCE,campaignReplayCompatible} from '../src/sim/company/campaignProgression.js';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {saveCampaignRecovery,readCampaignRecovery} from '../src/ui/campaignRecovery.js';
const store=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};};
const history=(record,outcomes)=>outcomes.map((outcome,i)=>({outcome,replay:{scenario:NORMANDY_SEQUENCE[i].id},snapshot:{company_id:record.roster.company_id}}));
describe('connected Standard campaign orchestration',()=>{
 it('repeated compact company writes preserve readable backups and roll back a failed latest write',()=>{
  const storage=store(),record=newCompanyCampaign(trevieres,'backup');saveCompanyPreparation(storage,record);
  const one={...record,revision:1};saveCompanyPreparation(storage,one,0);
  const two={...record,revision:2};saveCompanyPreparation(storage,two,1);
  expect(JSON.parse(decodeRecovery(storage.getItem(PREPARATION_KEY+'-previous')))).toEqual(one);
  const backup=storage.getItem(PREPARATION_KEY+'-previous');
  const fail={...storage,setItem:(key,value)=>{if(key===PREPARATION_KEY)throw new Error('quota');storage.setItem(key,value);}};
  expect(()=>saveCompanyPreparation(fail,{...record,revision:3},2)).toThrow(/quota/);
  expect(readCompanyPreparation(storage)).toEqual(two);
  expect(storage.getItem(PREPARATION_KEY+'-previous')).toBe(backup);
 });
 it('synthetic terminal M1 fixture prepares and commits M2 with the same people and exact starting snapshot',()=>{
  const storage=store(),initial=newCompanyCampaign(trevieres,'handoff');saveCompanyPreparation(storage,initial);
  const first=commitCampaignMission(storage,initial,'handoff-m1','handoff-seed');
  // Synthetic transaction fixture, not a claimed successful tactical playthrough.
  first.state.status='SUCCESS';
  let prepared=beginCompanyPreparation(first.record,first.state);
  for(let i=0;i<3;i++)prepared=prepareCompany(prepared,{type:'NEXT'});
  saveCompanyPreparation(storage,prepared,first.record.revision);
  const second=commitCampaignMission(storage,prepared,'handoff-m2','handoff-m2-seed');
  expect(second.state.scenario_id).toBe('normandy_2');
  expect(second.state.roster_snapshot.company_id).toBe(initial.roster.company_id);
  expect(second.state.roster_snapshot.people[Object.keys(initial.roster.people)[0]]).toEqual(initial.roster.people[Object.keys(initial.roster.people)[0]]);
  expect(resumeCommittedCampaign(readCompanyPreparation(storage)).state.roster_snapshot).toEqual(second.state.roster_snapshot);
  expect(prepared.history[0].snapshot).toEqual(first.state.roster_snapshot);
 });
 it('commits a fresh immutable start and recovers it without touching standalone slots',()=>{
  const storage=store(),record=newCompanyCampaign(trevieres,'connected-test');saveCompanyPreparation(storage,record);
  const deployed=commitCampaignMission(storage,record,'connected-m1','connected-seed');
  const reloaded=readCompanyPreparation(storage),restored=resumeCommittedCampaign(reloaded);
  expect(restored.state.roster_snapshot).toEqual(deployed.state.roster_snapshot);
  expect(restored.state.mission_instance_id).toBe('connected-m1');
  saveCampaignRecovery(storage,deployed.state,{selected:'co'},{replace:true});
  expect(resumeCampaignCheckpoint(readCampaignRecovery(storage).bundle.latest).presentation.selected).toBe('co');
  expect(storage.getItem('platoon-company-recovery')).toBeNull();
  expect(()=>commitCampaignMission(storage,reloaded,'another','seed')).toThrow(/resume/);
  expect(()=>commitCampaignMission(storage,record,'stale','seed')).toThrow();
 });
 it('a failed tactical mirror leaves the committed company start recoverable',()=>{
  const storage=store(),record=newCompanyCampaign(trevieres,'mirror-failure');saveCompanyPreparation(storage,record);
  const deployed=commitCampaignMission(storage,record,'mirror-m1','mirror-seed');
  const fail={...storage,setItem:()=>{throw new Error('quota');}};
  expect(()=>saveCampaignRecovery(fail,deployed.state,{}, {replace:true})).toThrow(/quota/);
  expect(resumeCommittedCampaign(readCompanyPreparation(storage)).state.roster_snapshot).toEqual(deployed.state.roster_snapshot);
 });
 it('rejects invalid launch identities before any storage mutation',()=>{
  const storage=store(),record=newCompanyCampaign(trevieres,'invalid');saveCompanyPreparation(storage,record);
  const before=readCompanyPreparation(storage);
  expect(()=>commitCampaignMission(storage,record,'','seed')).toThrow(/identity/);
  expect(readCompanyPreparation(storage)).toEqual(before);
 });
 it('stops offensive failure and abortion, allows patrol defeat, and has no eighth mission',()=>{
  const record=newCompanyCampaign(trevieres,'policy');
  record.history=history(record,['DEFEAT']);expect(campaignProgress(record).ended).toBe(true);
  record.history=history(record,['ABORTED']);expect(campaignProgress(record).ended).toBe(true);
  record.history=history(record,['SUCCESS','SUCCESS','DEFEAT']);expect(campaignProgress(record).destination.id).toBe('normandy_4');
  record.history=history(record,['SUCCESS','SUCCESS','DEFEAT','SUCCESS','DEFEAT']);expect(campaignProgress(record).destination.id).toBe('normandy_6');
  record.history=history(record,Array(7).fill('SUCCESS'));expect(campaignProgress(record)).toMatchObject({ended:true,destination:null,completed:7});
  record.history[2].snapshot.company_id='foreign';expect(()=>campaignProgress(record)).toThrow(/same-company/);
 });
 it('round-trips vehicle checkpoints and rejects adapter version mismatches',()=>{
  const state=createVireDevelopmentMission('connected-vehicle');const checkpoint=campaignCheckpoint(state,{selectedVehicle:'sherman_hq'});
  expect(resumeCampaignCheckpoint(checkpoint).state.mission_instance_id).toBe(state.mission_instance_id);
  const definition=NORMANDY_SEQUENCE[5];expect(campaignReplayCompatible(checkpoint.replay,definition)).toBe(true);
  checkpoint.replay.version++;expect(campaignReplayCompatible(checkpoint.replay,definition)).toBe(false);
  expect(()=>resumeCampaignCheckpoint(checkpoint)).toThrow(/Incompatible/);
 });
});
