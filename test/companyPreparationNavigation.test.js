import {it,expect} from 'vitest';
import {newCompanyCampaign,beginCompanyPreparation,prepareCompany,saveCompanyPreparation,readCompanyPreparation} from '../src/sim/company/campaignPreparation.js';
import {createMission,abortMission} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {navigateCompanyPreparation} from '../src/ui/preparationChoices.js';
import {deskHeader} from '../src/ui/commandDesk.js';

function pending(){
 const campaign=newCompanyCampaign(trevieres,'navigation-company');
 const mission=abortMission(createMission(trevieres,'navigation',{}, {mission_instance_id:'navigation-run',roster:campaign.roster})).state;
 mission.achievements=[{points:12}];
 return {mission,record:beginCompanyPreparation(campaign,mission)};
}
it('renders keyboard-accessible section buttons only when preparation is editable',()=>{
 const steps=['Reorganize & promote','Replacements','Skills','Ready'];
 expect(deskHeader('Company','',steps,'Ready',true)).toContain('data-desk-step="0"');
 expect(deskHeader('Company','',steps,'Ready',true)).toContain('data-desk-step="3" aria-current="step"');
 expect(deskHeader('Company','',steps,'Ready')).not.toContain('data-desk-step');
});
it('revisits Ready without losing purchases, experience budgets or step-level promotion history',()=>{
 let {record}=pending();const source=structuredClone(record),step=record.roster.formations.s11.step_ids[0];
 record=prepareCompany(record,{type:'PROMOTE',step});
 record=navigateCompanyPreparation(record,'SKILLS');
 record=prepareCompany(record,{type:'SKILL',purchase:{holder:'co',type:'AUTO_SPOT'}});
 const before=structuredClone(record),ready=navigateCompanyPreparation(record,'COMPLETE');
 expect(ready.stage).toBe('PREPARED');expect(ready.preparation.points).toBe(0);
 const reopened=navigateCompanyPreparation(ready,'RECONSTITUTE');
 expect(reopened.preparation.points).toBe(before.preparation.points);expect(reopened.roster.prepared_skills).toEqual(before.roster.prepared_skills);
 expect(reopened.roster.steps).toEqual(before.roster.steps);expect(reopened.preparation.promoted).toContain(step);
 expect(()=>prepareCompany(reopened,{type:'PROMOTE',step})).toThrow(/cannot be promoted/);
 expect(navigateCompanyPreparation(reopened,'COMPLETE').roster.steps).toEqual(ready.roster.steps);
 expect(source.preparation.operations).toEqual([]);
});
it('can reopen existing completed records using their exact recorded debrief and operations',()=>{
 let {record,mission}=pending();const step=record.roster.formations.s11.step_ids[0];
 record=prepareCompany(record,{type:'PROMOTE',step});record=navigateCompanyPreparation(record,'SKILLS');
 const before=structuredClone(record);record=navigateCompanyPreparation(record,'COMPLETE');delete record.preparation.before_completion;
 const reopened=navigateCompanyPreparation(record,'SKILLS',mission);
 expect(reopened.roster.steps).toEqual(before.roster.steps);expect(reopened.preparation.points).toBe(before.preparation.points);
 expect(reopened.history).toHaveLength(record.history.length);
 expect(()=>navigateCompanyPreparation(record,'SKILLS',{...mission,mission_instance_id:'wrong'})).toThrow(/debrief/);
});
it('keeps stale and failed navigation writes atomic',()=>{
 const {record}=pending(),values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 saveCompanyPreparation(storage,record);const skills=navigateCompanyPreparation(record,'SKILLS');saveCompanyPreparation(storage,skills,record.revision);
 expect(()=>saveCompanyPreparation(storage,navigateCompanyPreparation(record,'REPLACEMENTS'),record.revision)).toThrow(/revision/);
 expect(readCompanyPreparation(storage)).toEqual(skills);
 expect(()=>saveCompanyPreparation({...storage,setItem:()=>{throw Error('full');}},navigateCompanyPreparation(skills,'RECONSTITUTE'),skills.revision)).toThrow('full');
 expect(readCompanyPreparation(storage)).toEqual(skills);
});
it('does not turn replacements into promotable veterans by revisiting an earlier section',()=>{
 let {record}=pending();const formation=record.roster.formations.s11,step=formation.step_ids.pop();
 record.roster.steps[step].disposition='CASUALTY_UNRESOLVED';record.preparation.replacement_slots=1;record.preparation.replacements.green=1;
 record=navigateCompanyPreparation(record,'REPLACEMENTS');record=prepareCompany(record,{type:'REPLACE',target:'s11',level:'green'});
 const replacement=record.roster.formations.s11.step_ids.at(-1);record=navigateCompanyPreparation(record,'RECONSTITUTE');
 expect(()=>prepareCompany(record,{type:'PROMOTE',step:replacement})).toThrow(/cannot be promoted/);
 expect(record.preparation.replacements.green).toBe(0);
});
