import {prepareCompany,saveCompanyPreparation,PREPARATION_KEY} from '../sim/company/campaignPreparation.js';
import {combinedExperience} from '../sim/company/reconstitution.js';

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
