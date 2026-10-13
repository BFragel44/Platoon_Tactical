import {decodeRecovery,writeRecoveryBundle} from './recoveryEncoding.js';
import {exportScoutedBattlefield,validateScoutedBattlefield} from './battlefieldCarryover.js';
import {createCampaignRoster,applyMissionDebrief,rosterSnapshot} from './campaignRoster.js';
import {exportReplay} from './engine.js';
import {combinedExperience} from './reconstitution.js';
import {SKILLS,buySkills} from './skills.js';
import {stGeorgesContent} from '../../scenarios/stGeorgesContent.js';
import {hill192DeploymentDefinition} from './hill192Setup.js';
import {vireContent} from '../../scenarios/vireContent.js';
import {tinchebrayContent} from '../../scenarios/tinchebrayContent.js';
import {missionVehicleDeployments} from './vireDeployment.js';
import {stGermainContent} from '../../scenarios/stGermainContent.js';
export const PREPARATION_KEY='platoon-normandy-connected-company';
export const PREPARATION_SCHEMA=6;
const clone=structuredClone;
function validateRecord(r){
 if(r?.schema!==PREPARATION_SCHEMA||!r.id||!Number.isInteger(r.revision)||r.revision<0||!['DEPLOYMENT','PREPARATION','PREPARED'].includes(r.stage)||!Array.isArray(r.history))throw new Error('Unsupported company preparation record. Export original record.');
 rosterSnapshot(r.roster);
 if(!Array.isArray(r.support_formations))throw new Error('Missing supporting personnel ownership. Export original record.');
 if(r.stage!=='DEPLOYMENT'&&(!r.preparation?.id||!['RECONSTITUTE','REPLACEMENTS','SKILLS','COMPLETE'].includes(r.preparation.phase)||!Array.isArray(r.preparation.new_hq_steps)||!Array.isArray(r.preparation.retained_skills)))throw new Error('Incomplete preparation transaction. Export original record.');return r;
}

function supportingFormations(scenario){
 const published={normandy_3:stGeorgesContent.attachments,normandy_4:stGeorgesContent.attachments,normandy_5:stGermainContent.attachments};
 const support=new Set((published[scenario.id]??[]).map(u=>u.id));
 for(const u of scenario.units)if(u.attachment||['FO','VEHICLE'].includes(u.kind)||u.capabilities?.engineer)support.add(u.id);
 return [...support];
}
export function newCompanyCampaign(scenario,id){
 return {schema:PREPARATION_SCHEMA,revision:0,id,stage:'DEPLOYMENT',roster:createCampaignRoster(id,scenario),support_formations:supportingFormations(scenario),history:[],preparation:null};
}
export function beginCompanyPreparation(record,mission){
 if(record.stage!=='DEPLOYMENT')throw new Error('Company already has a preparation transaction.');
 if(record.active_deployment&&(record.active_deployment.mission_id!==mission.mission_instance_id||record.active_deployment.scenario!==mission.scenario_id))throw new Error('Mission does not match the committed campaign deployment.');
 const roster=applyMissionDebrief(record.roster,mission),next=clone(record);
 const casualties=[...(mission.attempt_history??[]).flatMap(a=>a.casualties??[]),...(mission.casualties??[])];
 const lost=new Set(casualties.map(c=>c.step?.id).filter(Boolean));
 const units=Object.values(mission.units).filter(u=>u.faction==='friendly'&&!u.attachment&&u.command_role!=='higher_hq');
 const available=[],assignments={};
 // Deployment ownership is stable even when a supporting unit breaks down into
 // generic teams or transfers into another tactical formation.
 const support=new Set([...record.support_formations,...Object.values(record.roster.formations).filter(f=>f.kind==='VEHICLE').map(f=>f.id)]);
 const attachmentSteps=new Set(Object.values(record.roster.steps).filter(t=>support.has(t.formation_id)||t.person_ids.some(id=>support.has(record.roster.people[id]?.origin))).map(t=>t.id));
 const companyLosses=[...lost].filter(id=>record.roster.steps[id]&&!attachmentSteps.has(id));
 const replacementSlots=Object.values(roster.steps).filter(t=>!attachmentSteps.has(t.id)&&['CASUALTY_UNRESOLVED','EVACUATED_UNRESOLVED','PRISONER_UNRESOLVED'].includes(t.disposition)&&
  (lost.has(t.id)||[...(mission.attempt_history??[]).flatMap(a=>a.prisoners??[]),...(mission.prisoners??[])].some(g=>g.prisoners?.some(x=>x.id===t.id)))).length;
 // Retain undeployed reserves and support crews; rebuild only formations represented
 // by tactical infantry counters. Unresolved losses never occupy active strength.
 const represented=new Set(units.filter(u=>u.kind!=='LAT'&&!support.has(u.id)).map(u=>u.id));
 for(const f of Object.values(roster.formations))f.step_ids=represented.has(f.id)?[]:f.step_ids.filter(id=>roster.steps[id]?.disposition==='ACTIVE');
 for(const u of units)for(const step of u.steps){
  if(!roster.steps[step.id]||lost.has(step.id)||['PRISONER_UNRESOLVED','GUARD_UNRESOLVED','WITHDRAWN_UNRESOLVED'].includes(roster.steps[step.id].disposition))continue;
  const t=roster.steps[step.id];if(attachmentSteps.has(t.id))continue;t.disposition='ACTIVE';t.experience=u.kind==='LAT'?'Green':u.cohesion==='F'&&u.named?u.original_experience:step.experience??u.experience;
  if(u.kind==='LAT'){available.push(t.id);continue;}
  if(roster.formations[u.id]){roster.formations[u.id].step_ids.push(t.id);t.formation_id=u.id;}
 }
 // Runner-box personnel are absent from tactical counters. Normandy starts each
 // mission without runners; return surviving detached steps to player reconstitution.
 for(const runner of mission.runners??[]){
  const t=roster.steps[runner.step?.id],unit=mission.units[runner.id];
  if(!t||attachmentSteps.has(t.id)||!['BOX','DISPATCHED'].includes(runner.status)||lost.has(t.id)||t.disposition!=='ACTIVE')continue;
  t.experience=unit?.cohesion==='F'?'Green':unit?.experience??runner.step.experience;
  for(const f of Object.values(roster.formations))f.step_ids=f.step_ids.filter(id=>id!==t.id);
  if(!available.includes(t.id))available.push(t.id);
 }
 for(const group of [...(mission.attempt_history??[]).flatMap(a=>a.prisoners??[]),...(mission.prisoners??[])]){
  const id=group.guard?.id,t=roster.steps[id];if(!t||lost.has(id)||t.disposition!=='GUARD_UNRESOLVED')continue;
  t.disposition='ACTIVE';t.experience=group.guard.experience??group.guard_experience??t.experience;for(const person of t.person_ids)roster.people[person].disposition='ACTIVE';if(!attachmentSteps.has(id))available.push(id);
 }
 const returnedPassengers=[];
 for(const v of Object.values(mission.vire_runtime?.vehicles??{}).filter(v=>v.faction==='friendly'&&['ACTIVE','RETREATED'].includes(v.status)))for(const passenger of v.passengers??[]){
  const t=roster.steps[passenger.id];
  if(!t||attachmentSteps.has(t.id)||!['ACTIVE','WITHDRAWN_UNRESOLVED'].includes(t.disposition))continue;
  const source=mission.units[passenger.origin_formation],formation=roster.formations[passenger.origin_formation??t.formation_id];
  t.disposition='ACTIVE';t.experience=source?.kind==='LAT'?'Green':source?.named&&source.cohesion==='F'?source.original_experience??t.experience:passenger.experience??t.experience;
  for(const id of t.person_ids)roster.people[id].disposition='ACTIVE';
  for(const f of Object.values(roster.formations))f.step_ids=f.step_ids.filter(id=>id!==t.id);
  if(formation&&source?.kind!=='LAT'){
   if(formation.step_ids.length>=formation.capacity)throw new Error('Returned passengers exceed formation capacity.');
   formation.step_ids.push(t.id);t.formation_id=formation.id;
  }else if(!available.includes(t.id))available.push(t.id);
  returnedPassengers.push({step:t.id,vehicle:v.id,reason:v.status==='RETREATED'?'MISSION_WITHDRAWAL':'DISEMBARK_AT_MISSION_END'});
 }
 // Mortar section/team aliases describe the same people, not extra strength.
 for(const f of Object.values(roster.formations))f.step_ids=f.step_ids.filter(id=>roster.steps[id]?.formation_id===f.id&&!available.includes(id));
 // Unassigned survivors deliberately left out of a deployment remain available
 // for later preparation; an off-map step is not a casualty or a replacement.
 const assignedSteps=new Set(Object.values(roster.formations).flatMap(f=>f.step_ids));
 for(const t of Object.values(roster.steps))if(t.disposition==='ACTIVE'&&!attachmentSteps.has(t.id)&&!assignedSteps.has(t.id)&&!available.includes(t.id))available.push(t.id);
 // Patrol MSR 1 overrides ordinary mission-end skill expiration.
 const retainedSkills=['normandy_3','normandy_5'].includes(mission.scenario_id)?clone((mission.skills??[]).filter(s=>!s.used&&roster.formations[s.holder]?.step_ids.length&&!support.has(s.holder))):[];
 roster.prepared_skills=clone(retainedSkills);
 const patrol=mission.patrol?.plan?.platoon??null;
 const points=Math.max(0,(mission.achievements??[]).filter(a=>!patrol||!a.spent&&a.platoon===patrol).reduce((n,a)=>n+a.points,0)-(patrol?0:mission.attempt_points_spent_total??mission.attempt_points_spent??0));
 const eligibleSteps=units.filter(u=>!u.removed&&(!patrol||u.platoon===patrol)).flatMap(u=>u.steps.map(t=>t.id));
 for(const runner of mission.runners??[])if(available.includes(runner.step?.id)&&(!patrol||mission.units[runner.origin]?.platoon===patrol))eligibleSteps.push(runner.step.id);
 for(const group of mission.prisoners??[])if(group.guard?.id&&(!patrol||mission.units[group.guard_origin]?.platoon===patrol))eligibleSteps.push(group.guard.id);
 next.roster=roster;next.stage='PREPARATION';delete next.active_deployment;next.revision++;
 next.preparation={id:mission.mission_instance_id,phase:'RECONSTITUTE',returned_passengers:returnedPassengers,replacement_slots:replacementSlots,points,available,assignments,promoted:[],new_hq:[],new_hq_steps:[],replacements:{green:mission.status==='SUCCESS'?6:0,veteran:mission.status==='SUCCESS'?Math.floor(companyLosses.length/4):0},patrol,eligible_steps:eligibleSteps,fieldable:units.filter(u=>roster.formations[u.id]&&!support.has(u.id)).map(u=>u.id),eligible:units.filter(u=>!u.removed).map(u=>u.id),attachment_steps:[...attachmentSteps],attachments:[...support],retained_skills:retainedSkills,skills:[],operations:[]};
 next.history.push({...((mission.scenario_id==='normandy_3'&&mission.patrol_history?.length===3&&['SUCCESS','DEFEAT'].includes(mission.status))?{battlefield:exportScoutedBattlefield(mission)}:{}),mission_id:mission.mission_instance_id,replay:exportReplay(mission),snapshot:clone(mission.roster_snapshot),outcome:mission.status,casualties:[...lost]});return next;
}
export function prepareCompany(record,operation){
 const next=clone(validateRecord(record)),p=next.preparation,r=next.roster;
 if(next.stage!=='PREPARATION')throw new Error('No pending company preparation.');
 const allowed=['RECONSTITUTE','REPLACEMENTS','SKILLS'];
 if(operation.type==='NEXT'){
  const i=allowed.indexOf(p.phase);if(i<0)throw new Error('Preparation already complete.');
  if(i===2){
   for(const f of Object.values(r.formations)){if(f.step_ids.length){f.experience=combinedExperience(f.step_ids.map(id=>r.steps[id]));for(const id of f.step_ids)r.steps[id].experience=f.experience;}}
   p.points=0;p.replacements={green:0,veteran:0};p.phase='COMPLETE';next.stage='PREPARED';r.supply_policy='RESET_FROM_DESTINATION_CONTENT';r.revision++;
  }else p.phase=allowed[i+1];
 }else if(operation.type==='TRANSFER'){
  if(p.phase!=='RECONSTITUTE')throw new Error('Transfers precede replacements.');
  const t=r.steps[operation.step],f=r.formations[operation.target];
  if(!t||p.attachment_steps.includes(t.id)||t.disposition!=='ACTIVE'||!f||!p.fieldable.includes(f.id)||p.attachments.includes(f.id)||f.kind==='FO'||f.step_ids.length>=f.capacity)throw new Error('Invalid company transfer.');
  const old=Object.values(r.formations).find(x=>x.step_ids.includes(t.id));if(old&&p.attachments.includes(old.id))throw new Error('Attachments cannot donate company steps.');if(old?.id===f.id)throw new Error('Step already belongs to formation.');
  if(['HQ','STAFF'].includes(f.kind)&&!f.step_ids.length){p.new_hq.push(f.id);p.new_hq_steps.push(t.id);t.experience='Green';}
  if(old)old.step_ids=old.step_ids.filter(id=>id!==t.id);p.available=p.available.filter(id=>id!==t.id);f.step_ids.push(t.id);t.formation_id=f.id;
 }else if(operation.type==='PROMOTE'){
  if(p.phase!=='RECONSTITUTE')throw new Error('Promotions precede replacements.');
  const t=r.steps[operation.step],f=Object.values(r.formations).find(x=>x.step_ids.includes(t?.id));
  if(!f||t.disposition!=='ACTIVE'||p.attachment_steps.includes(t.id)||!p.fieldable.includes(f.id)||p.attachments.includes(f.id)||f.kind==='FO'||p.new_hq.includes(f.id)||p.new_hq_steps.includes(t.id)||p.promoted.includes(t.id)||p.patrol&&!p.eligible_steps.includes(t.id))throw new Error('Step cannot be promoted.');
  const cost=t.experience==='Green'?1:t.experience==='Line'?3:Infinity;if(p.points<cost)throw new Error('Insufficient experience.');
  p.points-=cost;t.experience=t.experience==='Green'?'Line':'Veteran';p.promoted.push(t.id);
 }else if(operation.type==='REPLACE'){
  const f=r.formations[operation.target],level=operation.level;
  if(p.phase!=='REPLACEMENTS'||!p.replacement_slots||!['green','veteran'].includes(level)||!p.replacements[level]||!f||!p.fieldable.includes(f.id)||p.attachments.includes(f.id)||f.kind==='FO'||f.step_ids.length>=f.capacity)throw new Error('Replacement unavailable.');
  const id=`${next.id}_replacement_${next.revision+1}`,person=`${id}_person`;
  const active=Object.values(r.steps).filter(t=>t.disposition==='ACTIVE'&&!p.attachment_steps.includes(t.id)).length;const baseline=Object.keys(record.roster.steps).filter(id=>!id.startsWith(`${record.id}_replacement_`)&&!p.attachment_steps.includes(id)).length;if(active>=baseline)throw new Error('Replacements cannot increase company strength above its original establishment.');
  const experience=['HQ','STAFF'].includes(f.kind)?'Green':level==='green'?'Green':'Veteran';
  const people=Array.from({length:f.kind==='SQUAD'?4:2},(_,i)=>`${person}_${i+1}`);for(const personId of people)r.people[personId]={id:personId,name:'Replacement',origin:p.id,disposition:'ACTIVE'};r.steps[id]={id,formation_id:f.id,person_ids:people,experience,disposition:'ACTIVE'};f.step_ids.push(id);p.replacements[level]--;p.replacement_slots--;
 }else if(operation.type==='SKILL'){
  if(p.phase!=='SKILLS')throw new Error('Purchase skills after replacements.');
  if(p.attachments.includes(operation.purchase?.holder)||!p.fieldable.includes(operation.purchase?.holder))throw new Error('Only persistent company HQs and staff may receive skills.');
  const purchases=[...p.skills,operation.purchase],state={units:Object.fromEntries(Object.values(r.formations).map(f=>[f.id,{...f,faction:'friendly',steps:f.step_ids}])),attempt_number:0,skills:clone(p.retained_skills)};
  const spent=p.skills.reduce((n,x)=>n+SKILLS[x.type].cost,0);const points=buySkills(state,purchases.map(({holder,type})=>({holder,type})),p.points+spent,{retain:true});
  p.skills=state.skills.slice(p.retained_skills.length);p.points=points;r.prepared_skills=clone(state.skills);
 }else throw new Error('Unknown preparation operation.');
 p.operations.push(clone(operation));if(next.stage==='PREPARED')next.history.at(-1).preparation=clone(p);next.revision++;return next;
}
export function readCompanyPreparation(storage){const raw=storage.getItem(PREPARATION_KEY);if(!raw)return null;return validateRecord(JSON.parse(decodeRecovery(raw)));}
export function saveCompanyPreparation(storage,record,expected=null){validateRecord(record);const old=readCompanyPreparation(storage);if(expected!==null&&old?.revision!==expected)throw new Error('Company preparation revision changed.');if(old&&record.revision<old.revision)throw new Error('Cannot overwrite newer campaign preparation.');if(old&&record.revision===old.revision&&JSON.stringify(record)!==JSON.stringify(old))throw new Error('Cannot change an existing preparation revision.');if(old&&old.id!==record.id)throw new Error('Another campaign occupies this slot.');writeRecoveryBundle(storage,PREPARATION_KEY,record,old?decodeRecovery(storage.getItem(PREPARATION_KEY)):null);return clone(record);}

export function preparedCompanyDeployment(record,missionId,destination=null,setup={}){
 validateRecord(record);
 if(record.stage!=='PREPARED'||!missionId||record.history.some(h=>h.mission_id===missionId))throw new Error('A prepared company and unique mission ID are required.');
 if(destination?.rules?.hill192){
  const source=record.history.findLast(h=>h.replay?.scenario==='normandy_3');
  if(!source?.battlefield||source.snapshot?.company_id!==record.roster.company_id||source.mission_id!==source.battlefield.source.mission_instance_id||source.replay.mission_instance_id!==source.mission_id)throw new Error('Campaign Hill 192 requires this company completed M3 battlefield.');
  const battlefield=validateScoutedBattlefield(source.battlefield);
  if(setup.battlefield&&JSON.stringify(setup.battlefield)!==JSON.stringify(battlefield))throw new Error('Campaign battlefield differs from the immutable M3 history.');
  setup={...clone(setup),battlefield};
 }
 if(destination){
  destination=hill192DeploymentDefinition(destination,setup);
  if(destination.rules?.vire||destination.rules?.tinchebray){
   const content=destination.rules.tinchebray?tinchebrayContent:vireContent;
   const vehicles=['initial','event'].flatMap(force=>missionVehicleDeployments(content,force)).map(v=>({id:v.id,name:v.name,kind:'VEHICLE',steps:v.crew.length,experience:v.experience}));
   destination={...destination,units:[...destination.units,...vehicles]};
  }
 }
 const roster=clone(record.roster),support=destination?supportingFormations(destination):record.support_formations;
 const archived=[];
 if(destination){
  const fresh=createCampaignRoster(record.id,destination);
  for(const id of new Set([...record.support_formations,...Object.values(roster.formations).filter(f=>f.kind==='VEHICLE').map(f=>f.id)])){
   const f=roster.formations[id];if(!f)continue;
   archived.push(clone(f));delete roster.formations[id];
   for(const t of Object.values(roster.steps).filter(t=>t.formation_id===id)){
    if(t.disposition==='ACTIVE'){t.disposition='RETURNED_TO_PARENT';for(const person of t.person_ids)roster.people[person].disposition='RETURNED_TO_PARENT';}
   }
  }
  for(const u of destination.units){
   if(!support.includes(u.id)){
    const f=roster.formations[u.id];
    if(!f||f.kind!==u.kind||f.capacity!==u.steps)throw new Error(`Prepared company cannot field destination formation ${u.id}.`);
    continue;
   }
   const f=clone(fresh.formations[u.id]);f.step_ids=[];
   for(const oldId of fresh.formations[u.id].step_ids){
    const t=clone(fresh.steps[oldId]),id=`${missionId}_support_${oldId}`;
    if(roster.steps[id])throw new Error('Supporting deployment identity already exists.');
    t.id=id;t.person_ids=t.person_ids.map((person,n)=>{
     const newId=`${id}_person_${n+1}`;roster.people[newId]={...clone(fresh.people[person]),id:newId};return newId;
    });roster.steps[id]=t;f.step_ids.push(id);
   }
   roster.formations[u.id]=f;
  }
 }
 if(destination?.unit_options?.mortar){
  const choice=destination.unit_options.mortar,ids=new Set([choice.section_id,...choice.teams.map(t=>t.id)]),section=roster.formations[choice.section_id];
  const members=new Set(Object.values(roster.formations).filter(f=>ids.has(f.id)).flatMap(f=>f.step_ids));
  const steps=[...members].map(id=>roster.steps[id]).filter(t=>t?.disposition==='ACTIVE');
  if(!section||steps.length>section.capacity)throw new Error('Invalid prepared mortar strength.');
  section.step_ids=steps.map(t=>t.id);if(steps.length)section.experience=combinedExperience(steps);
  for(const t of steps)t.formation_id=section.id;
  for(const [i,team] of choice.teams.entries()){
   roster.formations[team.id]={id:team.id,name:team.name,kind:team.kind,platoon:null,capacity:1,experience:steps[i]?.experience??team.experience,step_ids:steps[i]?[steps[i].id]:[]};
  }
 }
 return {mission_instance_id:missionId,roster,prepared_skills:clone(roster.prepared_skills??[]),supply_policy:roster.supply_policy,setup:clone(setup),support_formations:clone(support),previous_support:archived,...(destination?{destination_id:destination.id}:{})};
}

// Transaction interface only: connected launch remains gated in the UI.
export function commitPreparedCompanyDeployment(record,missionId,destination,setup={}){
 const deployment=preparedCompanyDeployment(record,missionId,destination,setup),next=clone(record);
 if(!destination?.id)throw new Error('Choose an authored destination mission.');
 next.roster=clone(deployment.roster);next.support_formations=clone(deployment.support_formations);
 next.stage='DEPLOYMENT';next.preparation=null;next.revision++;
 next.active_deployment={mission_id:missionId,scenario:destination.id,setup:clone(deployment.setup),snapshot:rosterSnapshot(deployment.roster)};
 return {record:next,deployment};
}

export function startFreshCompanyCampaign(storage,record){
 validateRecord(record);const old=readCompanyPreparation(storage);
 if(record.stage!=='DEPLOYMENT'||old&&old.stage!=='PREPARED')throw new Error('Finish the current company preparation before starting another campaign.');
 const raw=storage.getItem(PREPARATION_KEY);writeRecoveryBundle(storage,PREPARATION_KEY,record,raw===null?null:decodeRecovery(raw));return clone(record);
}
