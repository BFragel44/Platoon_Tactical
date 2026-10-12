import {it,expect} from 'vitest';
import {newCompanyCampaign,beginCompanyPreparation,prepareCompany,saveCompanyPreparation,readCompanyPreparation,PREPARATION_KEY} from '../src/sim/company/campaignPreparation.js';
import {createMission,abortMission,getPlayerView} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {previewPreparationChoices,commitPreparationChoices,projectedFormationExperience,promotionExplanation} from '../src/ui/preparationChoices.js';
import {commandHeader} from '../src/ui/commandHeader.js';
function pending(){
 const campaign=newCompanyCampaign(trevieres,'batch-company');let mission=abortMission(createMission(trevieres,'batch',{}, {mission_instance_id:'batch-run',roster:campaign.roster})).state;
 const detached=mission.units.s11.steps.splice(0,2);
 detached.forEach((step,i)=>mission.units['team'+i]={...structuredClone(mission.units.s11),id:'team'+i,kind:'LAT',named:false,cohesion:'F',steps:[step]});
 return beginCompanyPreparation(campaign,mission);
}
function store(record){const data=new Map();const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};saveCompanyPreparation(storage,record);return storage;}
it('commits a multi-step transfer once, retains every identity and reloads its preparation operations',()=>{
 const record=pending(),before=structuredClone(record),storage=store(record),steps=record.preparation.available;
 expect(steps).toHaveLength(2);
 const next=commitPreparationChoices(storage,record,steps.map(step=>({type:'TRANSFER',step,target:'s11'})));
 expect(next.roster.formations.s11.step_ids).toHaveLength(3);expect(next.roster.formations.s11.step_ids).toEqual(expect.arrayContaining(steps));expect(next.roster.people).toEqual(record.roster.people);
 expect(next.preparation.available).toEqual([]);expect(next.preparation.operations.slice(-2).map(o=>o.step)).toEqual(steps);
 expect(readCompanyPreparation(storage)).toEqual(next);expect(record).toEqual(before);
});
it('invalid final choice rolls back the whole transfer batch without a storage write',()=>{
 const record=pending(),storage=store(record),before=readCompanyPreparation(storage),steps=record.preparation.available;
 const operations=[...steps,'not-a-company-step'].map(step=>({type:'TRANSFER',step,target:'s11'}));
 expect(previewPreparationChoices(record,operations).reason).toBeTruthy();expect(()=>commitPreparationChoices(storage,record,operations)).toThrow();expect(readCompanyPreparation(storage)).toEqual(before);
 expect(previewPreparationChoices(record,[{type:'TRANSFER',step:steps[0],target:'s11'},{type:'TRANSFER',step:steps[0],target:'s11'}]).reason).toMatch(/only once/);
});
it('stale preparation and quota rejection do not apply any chosen transfers',()=>{
 const record=pending(),storage=store(record),step=record.preparation.available[0],op={type:'TRANSFER',step,target:'s11'};
 const advanced=prepareCompany(record,{type:'NEXT'});saveCompanyPreparation(storage,advanced,record.revision);
 expect(()=>commitPreparationChoices(storage,record,[op])).toThrow(/revision/);expect(readCompanyPreparation(storage)).toEqual(advanced);
 const failed=store(record);expect(()=>commitPreparationChoices({...failed,setItem:()=>{throw Error('quota');}},record,[op])).toThrow('quota');expect(readCompanyPreparation(failed)).toEqual(record);
});
it('preview rejects attachment transfers and skill exhaustion without spending experience',()=>{
 const record=pending(),step=record.preparation.available[0],before=structuredClone(record);
 expect(previewPreparationChoices(record,[{type:'TRANSFER',step,target:'artyfo'}]).reason).toBeTruthy();expect(record).toEqual(before);
 let skills=prepareCompany(prepareCompany(record,{type:'NEXT'}),{type:'NEXT'});skills.preparation.points=0;
 expect(previewPreparationChoices(skills,[{type:'SKILL',purchase:{type:'AUTO_SPOT',holder:'co'}}]).reason).toMatch(/experience/);expect(skills.preparation.points).toBe(0);
});
it('displays actual step-derived experience instead of stale formation experience and explains promotions',()=>{
 const record=pending(),formation=record.roster.formations.co;record.roster.steps[formation.step_ids[0]].experience='Green';formation.experience='Veteran';
 expect(projectedFormationExperience(record,formation)).toBe('Green');record.preparation.new_hq_steps.push(formation.step_ids[0]);expect(promotionExplanation(record,formation.step_ids[0])).toMatch(/remains Green/);
 expect(promotionExplanation(record,null)).toMatch(/exactly one/);
});
it('recap preference is optional presentation and keeps manual recap and explicit phase controls',()=>{
 const mission=createMission(trevieres,'header'),v=getPlayerView(mission),args={v,name:id=>id,seed:'header',recapDialogs:false,recovery:{},phaseIndex:0,progress:null};
 const markup=commandHeader(args);expect(markup).toContain('id="recap-dialogs" >');expect(markup).toContain('id="advance"');expect(markup).toContain('Command guide and terms');
 expect(commandHeader({...args,recapDialogs:true})).toContain('id="recap-dialogs" checked');expect(mission.replay).toEqual([]);
});

it('preserves the older preparation backup when the final batch write fails',()=>{
 const record=pending(),storage=store(record),backup=PREPARATION_KEY+'-previous';storage.setItem(backup,'accepted backup');const write=storage.setItem;
 storage.setItem=(key,value)=>{if(key===PREPARATION_KEY)throw Error('quota');write(key,value);};
 expect(()=>commitPreparationChoices(storage,record,record.preparation.available.map(step=>({type:'TRANSFER',step,target:'s11'})))).toThrow('quota');
 expect(readCompanyPreparation(storage)).toEqual(record);expect(storage.getItem(backup)).toBe('accepted backup');
});
it('skill preview reports physical counter exhaustion and preserves the prepared draft',()=>{
 let record=pending();record=prepareCompany(prepareCompany(record,{type:'NEXT'}),{type:'NEXT'});record.preparation.points=10;
 record=prepareCompany(record,{type:'SKILL',purchase:{type:'AUTO_SPOT',holder:'co'}});
 record=prepareCompany(record,{type:'SKILL',purchase:{type:'AUTO_SPOT',holder:'hq1'}});const before=structuredClone(record);
 expect(previewPreparationChoices(record,[{type:'SKILL',purchase:{type:'AUTO_SPOT',holder:'hq2'}}]).reason).toMatch(/counter mix/);expect(record).toEqual(before);
});
