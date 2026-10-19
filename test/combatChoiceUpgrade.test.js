import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,advancePhase,exportReplay,replayMission,enablePlayerChoiceCombat,getPlayerView} from '../src/sim/company/engine.js';
import {newCompanyCampaign,saveCompanyPreparation} from '../src/sim/company/campaignPreparation.js';
import {commitCampaignMission,resumeCommittedCampaign,campaignCheckpoint,resumeCampaignCheckpoint} from '../src/sim/company/campaignProgression.js';
import {saveCampaignRecovery,readCampaignRecovery,CAMPAIGN_SAVE_KEY} from '../src/ui/campaignRecovery.js';
import {decodeRecovery} from '../src/ui/recoveryEncoding.js';
import {refresh,spot} from '../src/sim/company/battlefield.js';

const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
it('new connected campaigns retain player choice through commit, save and committed-start recovery',()=>{
 const store=storage(),record=newCompanyCampaign(trevieres,'combat-campaign-default');saveCompanyPreparation(store,record);
 const {state,record:committed}=commitCampaignMission(store,record,'combat-campaign-m1','campaign-default');
 expect(state.mission_rules.combatOrder).toBe('player-choice-v1');
 expect(committed.active_deployment.start_checkpoint.replay.combat_order).toBe('player-choice-v1');
 expect(resumeCommittedCampaign(committed).state).toEqual(state);
 saveCampaignRecovery(store,state,{}, {replace:true});
 expect(resumeCampaignCheckpoint(readCampaignRecovery(store).bundle.latest).state).toEqual(state);
});
it('adopts the new order after the historical prefix without changing prior cards or tactical state',()=>{
 let original=createMission(companyAssault,'upgrade',{},null,{combat_order:false});
 for(let i=0;i<4;i++)original=advancePhase(original).state;
 const before=structuredClone(original),record=exportReplay(original),r=enablePlayerChoiceCombat(original);
 expect(r.accepted).toBe(true);expect(original).toEqual(before);
 expect(r.state.rng).toEqual(before.rng);expect(r.state.deck).toEqual(before.deck);expect(r.state.units).toEqual(before.units);
 expect(r.state.events.slice(0,before.events.length)).toEqual(before.events);
 expect(r.state.replay.slice(0,-1)).toEqual(record.operations);
 const upgraded=exportReplay(r.state);expect(upgraded.combat_order).toBeUndefined();expect(upgraded.operations.at(-1)).toEqual({op:'enablePlayerChoiceCombat'});
 expect(replayMission(companyAssault,upgraded)).toEqual(r.state);
 expect(enablePlayerChoiceCombat(r.state)).toMatchObject({state:r.state,accepted:false});
});
it('adopts a connected save with an original backup and its original turn-start checkpoint intact',()=>{
 const store=storage(),record=newCompanyCampaign(trevieres,'upgrade-campaign');
 const state=createMission(trevieres,'upgrade-campaign',{}, {mission_instance_id:'upgrade-m1',roster:record.roster},{combat_order:false});
 const first=saveCampaignRecovery(store,state,{}, {replace:true}),raw=readCampaignRecovery(store).raw;
 const next=enablePlayerChoiceCombat(state).state;
 const bundle=saveCampaignRecovery(store,next,{}, {replace:true,turnStart:first.turnStart});
 expect(bundle.turnStart).toEqual(first.turnStart);
 expect(decodeRecovery(store.getItem(CAMPAIGN_SAVE_KEY+'-previous'))).toBe(raw);
 expect(resumeCampaignCheckpoint(bundle.latest).state).toEqual(next);
 expect(resumeCampaignCheckpoint(bundle.turnStart).state).toEqual(state);
});
it('preserves already frozen exposures when adopting during combat',()=>{
 let s=createMission(companyAssault,'mid-combat-upgrade',{},null,{combat_order:false});s.units.s11.location='r1c1';
 s.units.enemy={...structuredClone(s.units.mg1),id:'enemy',faction:'enemy',location:'r1c2',fire:'r1c1'};spot(s,s.units.enemy);refresh(s);s.phase='PINNED_RECOVERY';s=advancePhase(s).state;
 const before=structuredClone(s.pending_combat),next=enablePlayerChoiceCombat(s).state;
 expect(next.pending_combat).toEqual(before);expect(getPlayerView(next).combat_order).toBe('player-choice-v1');expect(next.phase).toBe(s.phase);
});
