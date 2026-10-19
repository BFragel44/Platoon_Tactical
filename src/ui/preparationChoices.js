import {beginCompanyPreparation,prepareCompany,saveCompanyPreparation,PREPARATION_KEY} from '../sim/company/campaignPreparation.js';
import {combinedExperience} from '../sim/company/reconstitution.js';

export const COMPANY_PREPARATION_PHASES=['RECONSTITUTE','REPLACEMENTS','SKILLS','COMPLETE'];
// Older Ready records have no pre-finalization snapshot. Rebuild that snapshot
// from the recorded debrief and accepted operations, never from tactical RNG.
export function navigateCompanyPreparation(record,phase,mission=null){
 const phases=COMPANY_PREPARATION_PHASES,target=phases.indexOf(phase),current=phases.indexOf(record.preparation?.phase);
 if(target<0||current<0||!['PREPARATION','PREPARED'].includes(record.stage))throw new Error('No editable company preparation section.');
 if(target===current)return record;
 let next=record;
 if(target<current){
  if(record.stage==='PREPARED'&&!record.preparation.before_completion){
   const last=record.history.at(-1),operations=record.preparation.operations;
   if(!mission||mission.mission_instance_id!==last?.mission_id||mission.roster_snapshot?.company_id!==record.roster.company_id||operations.at(-1)?.type!=='NEXT')throw new Error('The recorded mission debrief is needed to reopen this preparation.');
   const applied=structuredClone(record.roster.applied_missions);delete applied[last.mission_id];
   const base={...structuredClone(record),stage:'DEPLOYMENT',preparation:null,revision:record.revision-operations.length-1,history:structuredClone(record.history.slice(0,-1)),roster:{schema:record.roster.schema,...structuredClone(last.snapshot),applied_missions:applied}};
   delete base.active_deployment;
   const restored=operations.slice(0,-1).reduce((r,op)=>prepareCompany(r,op),beginCompanyPreparation(base,mission));
   next=structuredClone(record);next.preparation.before_completion={roster:restored.roster,points:restored.preparation.points,replacements:restored.preparation.replacements};
  }
  return prepareCompany(next,{type:'REVISIT',phase});
 }
 while(next.preparation.phase!==phase)next=prepareCompany(next,{type:'NEXT'});
 return next;
}

// Evaluate all choices against immutable drafts before making a single write.
// Keep the published preparation reducer as the sole authority for eligibility.
export function previewPreparationChoices(record,operations){
 try{
  if(!Array.isArray(operations)||!operations.length)throw new Error('Select a company step and receiving formation.');
  if(operations.every(o=>o.type==='TRANSFER')&&new Set(operations.map(o=>o.step)).size!==operations.length)throw new Error('Select each company step only once.');
  return {record:operations.reduce((draft,operation)=>prepareCompany(draft,operation),record),reason:null};
 }catch(error){return {record:null,reason:error.message.replace('Not enough attempt experience for skills.','Not enough preparation experience for this skill.')};}
}
export function commitPreparationChoices(storage,record,operations){
 const preview=previewPreparationChoices(record,operations);
 if(preview.reason)throw new Error(preview.reason);
 const key=PREPARATION_KEY+'-previous',backup=storage.getItem(key);
 try{return saveCompanyPreparation(storage,preview.record,record.revision);}catch(error){
  if(backup!==null)storage.setItem(key,backup);else storage.removeItem?.(key);
  throw error;
 }
}
export function projectedFormationExperience(record,formation){
 return formation.step_ids.length?combinedExperience(formation.step_ids.map(id=>record.roster.steps[id])):'Empty';
}
export function promotionExplanation(record,stepId){
 const p=record.preparation,t=record.roster.steps[stepId];
 if(!t)return 'Select exactly one company step to promote.';
 if(p.new_hq_steps.includes(t.id))return 'A newly reconstituted HQ or staff step remains Green during this preparation.';
 if(!p.eligible_steps.includes(t.id))return 'This step did not earn promotion eligibility in the completed mission.';
 if(p.promoted.includes(t.id))return 'This step has already gained its one permitted experience level.';
 if(t.experience==='Veteran')return 'This step is already Veteran.';
 return `${t.experience} to ${t.experience==='Green'?'Line':'Veteran'} costs ${t.experience==='Green'?1:3} experience point(s).`;
}
