// Campaign records are deliberately independent of the tactical autosave.
export const CAMPAIGN_SCHEMA=1;
export const CAMPAIGN_KEY='platoon-normandy-campaign';

const copy=value=>structuredClone(value);
function assertRecord(record){
 if(record?.schema!==CAMPAIGN_SCHEMA)throw new Error(`Unsupported campaign schema ${record?.schema??'missing'}. Export the original save; no migration was applied.`);
 if(!record.company_id||!Number.isInteger(record.revision)||!record.formations||!record.people||!record.steps||!record.applied_missions)throw new Error('Incomplete campaign roster.');
 return record;
}
export function createCampaignRoster(companyId,scenario){
 if(!companyId||!scenario?.units?.length)throw new Error('A company ID and authored roster are required.');
 const formations={},steps={},people={};let number=0;
 for(const unit of scenario.units){
  formations[unit.id]={id:unit.id,name:unit.name,kind:unit.kind,platoon:unit.platoon??null,capacity:unit.steps,experience:unit.experience,step_ids:[]};
  for(let i=0;i<unit.steps;i++){
   const stepId=`${unit.id}_step${i+1}`;formations[unit.id].step_ids.push(stepId);
   const personIds=[];
   for(let n=0;n<(unit.kind==='SQUAD'?4:2);n++){
    const id=`${companyId}_person_${++number}`;personIds.push(id);
    people[id]={id,name:`Soldier ${number}`,origin:unit.id,disposition:'ACTIVE'};
   }
   steps[stepId]={id:stepId,formation_id:unit.id,person_ids:personIds,experience:unit.experience,disposition:'ACTIVE'};
  }
 }
 if(scenario.unit_options?.mortar){
  const section=formations[scenario.unit_options.mortar.section_id];
  for(const [i,team] of scenario.unit_options.mortar.teams.entries())formations[team.id]={id:team.id,name:team.name,kind:team.kind,platoon:null,capacity:1,experience:team.experience,step_ids:[section.step_ids[i]]};
 }
 return {schema:CAMPAIGN_SCHEMA,company_id:companyId,revision:0,formations,steps,people,applied_missions:{}};
}
export function rosterSnapshot(record){const source=assertRecord(record);return copy({company_id:source.company_id,revision:source.revision,formations:source.formations,steps:source.steps,people:source.people});}
export function applyMissionDebrief(record,mission){
 const next=copy(assertRecord(record));
 if(['ACTIVE','PATROL_COMPLETE'].includes(mission.status)||!mission.status)throw new Error('Only a terminal mission can be debriefed.');
 if(mission.mission_rules?.reattempts&&mission.status==='DEFEAT'&&(mission.attempt_number??1)<=mission.mission_rules.reattempts&&!mission.reattempt_declined)throw new Error('Finish or explicitly decline the permitted reattempt before debrief.');
 if(!mission.mission_instance_id||!mission.roster_snapshot)throw new Error('Mission lacks its deployment roster.');
 if(next.applied_missions[mission.mission_instance_id])throw new Error('This mission was already applied.');
 const snapshot=mission.roster_snapshot;
 if(snapshot.company_id!==next.company_id||snapshot.revision!==next.revision)throw new Error('Campaign roster revision does not match deployment.');
 if(JSON.stringify(snapshot)!==JSON.stringify(rosterSnapshot(next)))throw new Error('Campaign roster contents changed since deployment.');
 for(const [id,step] of Object.entries(snapshot.steps)){
  if(!next.steps[id]||next.steps[id].formation_id!==step.formation_id)throw new Error(`Roster identity mismatch: ${id}.`);
  const casualty=[...(mission.attempt_history??[]).flatMap(a=>a.casualties??[]),...(mission.casualties??[])].find(c=>c.step?.id===id);
  const prisoner=[...(mission.attempt_history??[]).flatMap(a=>a.prisoners??[]),...(mission.prisoners??[])].some(group=>group.prisoners?.some(step=>step.id===id));
  if(casualty){next.steps[id].disposition=casualty.evacuated?'EVACUATED_UNRESOLVED':'CASUALTY_UNRESOLVED';
   for(const personId of step.person_ids)next.people[personId].disposition=next.steps[id].disposition;}
  else if(prisoner){next.steps[id].disposition='PRISONER_UNRESOLVED';for(const personId of step.person_ids)next.people[personId].disposition='PRISONER_UNRESOLVED';}
  const deployed=Object.values(mission.units??{}).find(unit=>unit.faction==='friendly'&&unit.steps?.some(current=>current.id===id));
  const current=deployed?.steps.find(current=>current.id===id);
  if(current?.experience)next.steps[id].experience=current.experience;
  if(current&&next.steps[id].disposition==='ACTIVE'&&next.formations[deployed.id]&&deployed.kind===next.formations[deployed.id].kind&&!next.formations[deployed.id].step_ids.includes(id)){
   for(const formation of Object.values(next.formations))formation.step_ids=formation.step_ids.filter(member=>member!==id);
   next.formations[deployed.id].step_ids.push(id);next.steps[id].formation_id=deployed.id;
  }
 }
 for(const [id,formation] of Object.entries(next.formations))if(mission.units?.[id]?.steps?.length&&mission.units[id].kind===formation.kind)formation.experience=mission.units[id].experience;
 next.applied_missions[mission.mission_instance_id]={scenario:mission.scenario_id,outcome:mission.status,roster_revision:next.revision};
 next.revision++;
 return next;
}
export function readCampaign(storage,key=CAMPAIGN_KEY){
 const raw=storage.getItem(key);if(raw===null)return {raw:null,record:null,error:null};
 try{return {raw,record:assertRecord(JSON.parse(raw)),error:null};}
 catch(error){return {raw,record:null,error:`Cannot read campaign: ${error.message}`};}
}
export function saveCampaign(storage,record,key=CAMPAIGN_KEY,expectedRevision=null){
 const value=JSON.stringify(assertRecord(record));
 const current=readCampaign(storage,key);
 if(current.error)throw new Error(current.error+' Export the original record before replacement.');
 if(current.record&&current.record.company_id!==record.company_id)throw new Error('A different company occupies this campaign slot.');
  if(expectedRevision!==null&&current.record?.revision!==expectedRevision)throw new Error('Campaign roster revision changed before save.');
 if(current.record&&record.revision<current.record.revision)throw new Error('Cannot overwrite a newer campaign revision.');
  if(current.record&&record.revision===current.record.revision&&value!==current.raw)throw new Error('Cannot overwrite an existing campaign revision with different data.');
 if(current.raw!==null)storage.setItem(`${key}-previous`,current.raw);
 storage.setItem(key,value);return copy(record);
}
export function debriefAndSave(storage,mission,key=CAMPAIGN_KEY){
 const current=readCampaign(storage,key);
 if(current.error)throw new Error(current.error);
 if(!current.record)throw new Error('No campaign roster to debrief.');
 const next=applyMissionDebrief(current.record,mission);
 return saveCampaign(storage,next,key,current.record.revision);
}

// Explicit standalone runs replace only their own slot, retaining a backup.
export function startStandaloneRoster(storage,record,key){
 if(!['platoon-normandy-cerisy-standalone','platoon-normandy-st-georges-standalone'].includes(key))throw new Error('Standalone replacement requires the Cerisy slot or St. Georges slot.');
 const value=JSON.stringify(assertRecord(record)),previous=storage.getItem(key);
 if(previous!==null)storage.setItem(`${key}-previous`,previous);
 storage.setItem(key,value);return copy(record);
}
