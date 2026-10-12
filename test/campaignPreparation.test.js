import {readFileSync} from 'node:fs';
import {createRunner,dispatchRunner} from '../src/sim/company/runners.js';
import {stGermain} from '../src/scenarios/stGermain.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {exportScoutedBattlefield} from '../src/sim/company/battlefieldCarryover.js';
import {vire} from '../src/scenarios/vire.js';
import {createVireRoster,createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {hill192} from '../src/scenarios/hill192.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,abortMission,exportReplay,replayMission,advancePhase,submitCommand,selectHQ,eligibleHQs,endTurn,preparePatrol} from '../src/sim/company/engine.js';
import {newCompanyCampaign,beginCompanyPreparation,prepareCompany,saveCompanyPreparation,readCompanyPreparation,preparedCompanyDeployment,commitPreparedCompanyDeployment} from '../src/sim/company/campaignPreparation.js';
const storage=()=>{const data={};return {getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=v};};
function terminal(){const r=newCompanyCampaign(trevieres,'test-company');let s=createMission(trevieres,'prep',{}, {mission_instance_id:'run-1',roster:r.roster});s=abortMission(s).state;return {r,s};}
describe('campaign-wide preparation source audit',()=>{
 it('preserves deliberately unassigned survivors through another deployment and debrief',()=>{
  const {r,s}=terminal();const step=s.units.s11.steps.pop();
  s.units.detached={...structuredClone(s.units.s11),id:'detached',kind:'LAT',named:false,steps:[step]};
  let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
  const committed=commitPreparedCompanyDeployment(p,'unassigned-next',cerisy);
  const mission=abortMission(createMission(cerisy,'unassigned',{},committed.deployment)).state;
  const next=beginCompanyPreparation(committed.record,mission);
  expect(next.preparation.available).toContain(step.id);
  expect(next.roster.steps[step.id].disposition).toBe('ACTIVE');
  expect(next.preparation.replacement_slots).toBe(0);
 });
 for(const dispatched of [false,true])it(`returns surviving ${dispatched?'dispatched':'boxed'} runners as selectable reconstitution steps`,()=>{
  const {r,s}=terminal();createRunner(s,s.units.s11);if(dispatched)dispatchRunner(s,s.units.hq1);
  const step=s.runners[0].step.id;let p=beginCompanyPreparation(r,s);
  expect(p.preparation.available).toContain(step);expect(p.roster.steps[step].experience).toBe('Line');
  expect(Object.values(p.roster.formations).flatMap(f=>f.step_ids)).not.toContain(step);
  p=prepareCompany(p,{type:'TRANSFER',step,target:'s11'});
  expect(p.roster.formations.s11.step_ids).toContain(step);
 });
 for(const scenario of [trevieres,cerisy,stGeorges,hill192,stGermain,vire,tinchebray])it(`${scenario.id}: only patrols retain unused skill counters`,()=>{
  const {r,s}=terminal();s.scenario_id=scenario.id;
  s.skills=[{id:'kept',counter:11,holder:'co',type:'AUTO_SPOT',used:false},{id:'spent',counter:12,holder:'co',type:'AUTO_SPOT',used:true}];
  let p=beginCompanyPreparation(r,s);const patrol=['normandy_3','normandy_5'].includes(scenario.id);
  expect(p.roster.prepared_skills.map(x=>x.id)).toEqual(patrol?['kept']:[]);
  const st=storage();saveCompanyPreparation(st,p);p=readCompanyPreparation(st);
  for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
  expect(preparedCompanyDeployment(p,'audit-next').prepared_skills.map(x=>x.id)).toEqual(patrol?['kept']:[]);
 });
 it('retained patrol skills occupy counters and holder capacity without being charged again',()=>{
  const {r,s}=terminal();s.scenario_id='normandy_5';s.achievements=[{points:3}];
  s.skills=[{id:'kept',counter:11,holder:'co',type:'AUTO_SPOT',used:false}];
  let p=beginCompanyPreparation(r,s);p=prepareCompany(prepareCompany(p,{type:'NEXT'}),{type:'NEXT'});
  p=prepareCompany(p,{type:'SKILL',purchase:{holder:'co',type:'AUTO_SPOT'}});
  expect(p.preparation.points).toBe(2);expect(p.roster.prepared_skills.map(x=>x.counter)).toEqual([11,12]);
  expect(()=>prepareCompany(p,{type:'SKILL',purchase:{holder:'hq1',type:'AUTO_SPOT'}})).toThrow(/counter mix/);
  p=prepareCompany(p,{type:'SKILL',purchase:{holder:'co',type:'EXTRA_DRAW'}});
  expect(p.preparation.points).toBe(1);
  expect(()=>prepareCompany(p,{type:'SKILL',purchase:{holder:'co',type:'EXTRA_DRAW'}})).toThrow(/at most three/);
 });
 it('cannot promote a rebuilt HQ step after transferring it back to a squad',()=>{
  const {r,s}=terminal();s.casualties=[{step:s.units.co.steps.pop()}];s.achievements=[{points:10}];
  let p=beginCompanyPreparation(r,s);const step=p.roster.formations.s11.step_ids[0];
  p=prepareCompany(p,{type:'TRANSFER',step,target:'co'});
  p=prepareCompany(p,{type:'TRANSFER',step,target:'s11'});
  expect(()=>prepareCompany(p,{type:'PROMOTE',step})).toThrow(/cannot be promoted/);
 });
});
describe('campaign company preparation',()=>{
 it('rejects active missions and preserves deployment snapshots',()=>{const {r,s}=terminal();const before=structuredClone(s.roster_snapshot);expect(()=>beginCompanyPreparation(r,{...s,status:'ACTIVE'})).toThrow();const next=beginCompanyPreparation(r,s);expect(s.roster_snapshot).toEqual(before);expect(next.stage).toBe('PREPARATION');expect(()=>beginCompanyPreparation(next,s)).toThrow();});
 it('promotes once, rejects invalid actions without mutation, and discards remaining points',()=>{const {r,s}=terminal();s.achievements=[{points:10}];const p=beginCompanyPreparation(r,s);const step=p.roster.formations.co.step_ids[0];const next=prepareCompany(p,{type:'PROMOTE',step});expect(next.preparation.points).toBe(9);expect(()=>prepareCompany(next,{type:'PROMOTE',step})).toThrow();expect(p.preparation.points).toBe(10);let done=next;for(let i=0;i<3;i++)done=prepareCompany(done,{type:'NEXT'});expect(done.stage).toBe('PREPARED');expect(done.preparation.points).toBe(0);});
 it('round trips and rejects stale writes',()=>{const st=storage(),{r,s}=terminal();saveCompanyPreparation(st,r);const next=beginCompanyPreparation(r,s);saveCompanyPreparation(st,next,0);expect(readCompanyPreparation(st)).toEqual(next);expect(()=>saveCompanyPreparation(st,r,0)).toThrow();});
 it('does not allocate Green replacements after abort',()=>{const {r,s}=terminal();const p=beginCompanyPreparation(r,s);expect(p.preparation.replacements.green).toBe(0);});
});

describe('personnel boundaries',()=>{
 function damaged(count,outcome='SUCCESS'){
  const {r,s}=terminal();s.status=outcome;s.reattempt_declined=true;s.casualties=[];
  const squads=Object.values(s.units).filter(u=>u.kind==='SQUAD'&&u.faction==='friendly');
  for(const u of squads)while(u.steps.length&&s.casualties.length<count){const step=u.steps.pop();s.casualties.push({step,evacuated:s.casualties.length%2===0});}
  return {r,s};
 }
 for(const [n,expected] of [[3,0],[4,1],[7,1],[8,2]])it(`counts ${n} evacuated and unevacuated casualties`,()=>{const {r,s}=damaged(n);expect(beginCompanyPreparation(r,s).preparation.replacements.veteran).toBe(expected);});
 it('allocates new identities and rejects promotion after replacements',()=>{const {r,s}=damaged(4);let p=beginCompanyPreparation(r,s);p=prepareCompany(p,{type:'NEXT'});const target='squad1_1';const f=Object.values(p.roster.formations).find(f=>f.kind==='SQUAD'&&f.step_ids.length<f.capacity);const next=prepareCompany(p,{type:'REPLACE',target:f.id,level:'green'});const id=next.roster.formations[f.id].step_ids.at(-1);expect(r.roster.steps[id]).toBeUndefined();expect(next.roster.steps[id].experience).toBe('Green');expect(()=>prepareCompany(next,{type:'PROMOTE',step:id})).toThrow();});
 it('does not allow rebuilt HQ promotion',()=>{const {r,s}=terminal();const lost=s.units.co.steps.pop();s.casualties=[{step:lost}];s.achievements=[{points:10}];let p=beginCompanyPreparation(r,s);const f=Object.values(p.roster.formations).find(f=>f.kind==='SQUAD'&&f.step_ids.length);const id=f.step_ids[0];p=prepareCompany(p,{type:'TRANSFER',step:id,target:'co'});expect(()=>prepareCompany(p,{type:'PROMOTE',step:id})).toThrow();expect(p.roster.steps[id].experience).toBe('Green');});
 it('records immutable preparation operations and survives failed storage',()=>{const {r,s}=terminal(),st=storage();saveCompanyPreparation(st,r);const p=beginCompanyPreparation(r,s);expect(()=>saveCompanyPreparation({...st,setItem:()=>{throw Error('quota');}},p,0)).toThrow(/quota/);expect(readCompanyPreparation(st)).toEqual(r);let n=p;for(let i=0;i<3;i++)n=prepareCompany(n,{type:'NEXT'});expect(n.history[0].preparation.operations).toHaveLength(3);expect(p.preparation.operations).toHaveLength(0);});
 it('validates physical skills and holder capacity',()=>{const {r,s}=terminal();s.achievements=[{points:20}];let p=beginCompanyPreparation(r,s);p=prepareCompany(prepareCompany(p,{type:'NEXT'}),{type:'NEXT'});for(let i=0;i<3;i++)p=prepareCompany(p,{type:'SKILL',purchase:{type:'EXTRA_DRAW',holder:'co'}});expect(p.preparation.points).toBe(17);expect(()=>prepareCompany(p,{type:'SKILL',purchase:{type:'AUTO_SPOT',holder:'co'}})).toThrow();});
});

it('counts casualties across attempts once and returns guards without reducing experience',()=>{const {r,s}=terminal();const u=s.units.s11,loss=u.steps.pop();s.attempt_history=[{casualties:[{step:loss,evacuated:true}],prisoners:[]}];s.casualties=[{step:loss}];const guard=s.units.s21.steps.pop();s.prisoners=[{guard,prisoners:[]}];const p=beginCompanyPreparation(r,s);expect(p.history[0].casualties).toEqual([loss.id]);expect(p.roster.steps[guard.id].disposition).toBe('ACTIVE');expect(p.roster.steps[guard.id].experience).toBe(r.roster.steps[guard.id].experience);expect(prepareCompany(p,{type:'TRANSFER',step:guard.id,target:'s11'}).roster.formations.s11.step_ids).toContain(guard.id);});
it('restricts patrol promotions to participants',()=>{const {r,s}=terminal();s.patrol={plan:{platoon:1}};s.achievements=[{points:10}];const p=beginCompanyPreparation(r,s);expect(()=>prepareCompany(p,{type:'PROMOTE',step:p.roster.formations.hq2.step_ids[0]})).toThrow();});

it('exposes an immutable prepared deployment and retains unused skills',()=>{const {r,s}=terminal();s.achievements=[{points:5}];let p=beginCompanyPreparation(r,s);p=prepareCompany(prepareCompany(p,{type:'NEXT'}),{type:'NEXT'});p=prepareCompany(p,{type:'SKILL',purchase:{type:'AUTO_SPOT',holder:'co'}});p=prepareCompany(p,{type:'NEXT'});const d=preparedCompanyDeployment(p,'next-run');expect(d.prepared_skills[0].type).toBe('AUTO_SPOT');expect(d.supply_policy).toBe('RESET_FROM_DESTINATION_CONTENT');d.roster.formations.co.experience='Veteran';expect(p.roster.formations.co.experience).toBe('Green');});

it('prevents observer attachments from donating or receiving company promotions',()=>{const {r,s}=terminal();s.achievements=[{points:10}];const fo=Object.values(s.units).find(u=>u.kind==='FO'),loss=s.units.s11.steps.pop();s.casualties=[{step:loss}];const p=beginCompanyPreparation(r,s);expect(()=>prepareCompany(p,{type:'TRANSFER',step:fo.steps[0].id,target:'s11'})).toThrow();expect(()=>prepareCompany(p,{type:'PROMOTE',step:fo.steps[0].id})).toThrow();});


it('expires previous patrol awards without subtracting previous patrol spending twice',()=>{
 const {r,s}=terminal();s.patrol={plan:{platoon:1}};
 s.achievements=[{points:8,platoon:2,spent:true},{points:4,platoon:1}];s.attempt_points_spent=6;
 expect(beginCompanyPreparation(r,s).preparation.points).toBe(4);
});
it('does not let transferring a nonparticipant bypass patrol promotion eligibility',()=>{
 const {r,s}=terminal();s.patrol={plan:{platoon:1}};s.achievements=[{points:10,platoon:1}];
 const lost=s.units.s11.steps.pop();s.casualties=[{step:lost}];
 let p=beginCompanyPreparation(r,s);const step=Object.values(p.roster.formations).find(f=>f.kind==='SQUAD'&&f.platoon===2).step_ids[0];
 p=prepareCompany(p,{type:'TRANSFER',step,target:'s11'});
 expect(()=>prepareCompany(p,{type:'PROMOTE',step})).toThrow(/cannot be promoted/);
});
it('does not award returning Veteran replacements after failure',()=>{
 const {r,s}=terminal();s.status='DEFEAT';s.reattempt_declined=true;
 s.casualties=Object.values(s.units).filter(u=>u.kind==='SQUAD').slice(0,4).map(u=>({step:u.steps.pop()}));
 expect(beginCompanyPreparation(r,s).preparation.replacements).toEqual({green:0,veteran:0});
});
it('preserves surviving support crew membership without making it a company donor',()=>{
 const scenario=structuredClone(trevieres);
 scenario.units.push({id:'support_crew',name:'Support crew',kind:'VEHICLE',steps:1,experience:'Line'});
 const r=newCompanyCampaign(scenario,'crew-company');
 let s=createMission(trevieres,'crew',{}, {mission_instance_id:'crew-run',roster:r.roster});s=abortMission(s).state;
 const p=beginCompanyPreparation(r,s),id=r.roster.formations.support_crew.step_ids[0];
 expect(p.roster.formations.support_crew.step_ids).toEqual([id]);
 expect(p.preparation.attachment_steps).toContain(id);
 expect(()=>prepareCompany(p,{type:'TRANSFER',step:id,target:'co'})).toThrow();
});
it('rejects earlier preparation schemas without changing original bytes',()=>{
 const st=storage(),r=newCompanyCampaign(trevieres,'old-company');r.schema=1;
 const raw=JSON.stringify(r);st.setItem('platoon-normandy-connected-company',raw);
 expect(()=>readCompanyPreparation(st)).toThrow(/Unsupported/);
 expect(st.getItem('platoon-normandy-connected-company')).toBe(raw);
});


it('keeps published patrol HMG attachments outside persistent company preparation',()=>{
 const r=newCompanyCampaign(stGeorges,'patrol-support');
 let s=createMission(stGeorges,'support',{}, {mission_instance_id:'support-run',roster:r.roster});s=abortMission(s).state;
 const p=beginCompanyPreparation(r,s);
 expect(p.preparation.attachments).toContain('hmg1');
 expect(p.preparation.attachment_steps).toContain(r.roster.formations.hmg1.step_ids[0]);
 expect(p.preparation.fieldable).not.toContain('hmg1');
});
it('excludes parent-organization casualties from company Veteran returns',()=>{
 const {r,s}=terminal();s.status='SUCCESS';
 const fo=Object.values(s.units).find(u=>u.kind==='FO'),loss=fo.steps.pop();s.casualties=[{step:loss}];
 for(const u of Object.values(s.units).filter(u=>u.kind==='SQUAD').slice(0,3))s.casualties.push({step:u.steps.pop()});
 const p=beginCompanyPreparation(r,s);expect(p.preparation.replacements.veteran).toBe(0);
 expect(p.history[0].casualties).toHaveLength(4);
});
it('does not turn a supporting crew Fire Team into a company LAT donor',()=>{
 const scenario=structuredClone(trevieres);scenario.units.push({id:'support_crew',name:'Support crew',kind:'VEHICLE',steps:1,experience:'Line'});
 const r=newCompanyCampaign(scenario,'crew-lat');
 let s=createMission(trevieres,'crew',{}, {mission_instance_id:'crew-lat-run',roster:r.roster});s=abortMission(s).state;
 const id=r.roster.formations.support_crew.step_ids[0];
 s.units.crew_lat={id:'crew_lat',kind:'LAT',faction:'friendly',experience:'Line',steps:[{id,experience:'Line'}]};
 const p=beginCompanyPreparation(r,s);
 expect(p.preparation.available).not.toContain(id);
 expect(p.roster.steps[id].disposition).toBe('FORMATION_UNRESOLVED');
 expect(()=>prepareCompany(p,{type:'TRANSFER',step:id,target:'co'})).toThrow();
});


it('expires prior prepared skills even when no new skills are purchased',()=>{
 const {r}=terminal();r.roster.prepared_skills=[{holder:'co',type:'AUTO_SPOT',used:false}];
 let s=createMission(trevieres,'expiry',{}, {mission_instance_id:'expiry-run',roster:r.roster});s=abortMission(s).state;
 let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 expect(preparedCompanyDeployment(p,'next').prepared_skills).toEqual([]);
});
it('counts mortar section/team aliases as one set of personnel',()=>{
 const {r,s}=terminal(),p=beginCompanyPreparation(r,s);
 const members=Object.values(p.roster.formations).flatMap(f=>f.step_ids);
 expect(new Set(members).size).toBe(members.length);
 for(const f of Object.values(p.roster.formations))for(const id of f.step_ids)expect(p.roster.steps[id].formation_id).toBe(f.id);
});


it('retains observers at preparation instead of dropping their live memberships',()=>{
 const {r,s}=terminal(),fo=Object.values(s.units).find(u=>u.kind==='FO');
 const p=beginCompanyPreparation(r,s);
 expect(p.roster.formations[fo.id].step_ids).toEqual(fo.steps.map(t=>t.id));
});
it('does not replace personnel withdrawn aboard a vehicle as casualties',()=>{
 const {r,s}=terminal();s.status='SUCCESS';s.mission_rules.vire=true;
 const u=s.units.s11,step=u.steps.pop();
 s.vire_runtime={vehicles:{jeep:{faction:'friendly',status:'RETREATED',crew:[],passengers:[step]}}};
 s.vire_runtime.initial_state=structuredClone(s);s.vire_runtime.operations=[];
 let p=beginCompanyPreparation(r,s);expect(p.roster.steps[step.id].disposition).toBe('ACTIVE');
 p=prepareCompany(p,{type:'NEXT'});
 expect(p.roster.formations.s11.step_ids).toContain(step.id);expect(()=>prepareCompany(p,{type:'REPLACE',target:'s11',level:'green'})).toThrow(/Replacement unavailable/);
});
it('limits replacements to casualty and prisoner vacancies even after redistribution',()=>{
 const {r,s}=terminal();s.status='SUCCESS';const loss=s.units.s11.steps.pop();s.casualties=[{step:loss}];
 let p=beginCompanyPreparation(r,s);const donor=p.roster.formations.s21.step_ids[0];
 p=prepareCompany(p,{type:'TRANSFER',step:donor,target:'s11'});p=prepareCompany(p,{type:'NEXT'});
 p=prepareCompany(p,{type:'REPLACE',target:'s21',level:'green'});
 expect(p.preparation.replacement_slots).toBe(0);
 expect(()=>prepareCompany(p,{type:'REPLACE',target:'s21',level:'green'})).toThrow();
});


it('refreshes destination observers without changing persistent company people',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const before=structuredClone(p),d=preparedCompanyDeployment(p,'cerisy-run',cerisy);
 expect(d.roster.formations.mtrfo.step_ids).toHaveLength(1);
 const fo=cerisy.units.find(u=>u.kind==='FO'&&u.id!=='mtrfo');
 const old=r.roster.formations[fo.id].step_ids[0],replacement=d.roster.formations[fo.id].step_ids[0];
 expect(replacement).not.toBe(old);expect(d.roster.steps[old].disposition).toBe('RETURNED_TO_PARENT');
 expect(d.roster.formations.s11).toEqual(p.roster.formations.s11);
 expect(d.roster.steps[d.roster.formations.s11.step_ids[0]]).toEqual(p.roster.steps[p.roster.formations.s11.step_ids[0]]);
 expect(p).toEqual(before);
 const next=createMission(cerisy,'destination',{},d);expect(next.units.mtrfo.steps[0].id).toBe(d.roster.formations.mtrfo.step_ids[0]);
});
it('preserves unresolved attachment casualties when parent organization supplies replacements',()=>{
 const {r,s}=terminal(),fo=Object.values(s.units).find(u=>u.kind==='FO'),loss=fo.steps.pop();s.casualties=[{step:loss}];
 let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'parent-return',cerisy);
 expect(d.roster.steps[loss.id].disposition).toBe('CASUALTY_UNRESOLVED');
 expect(d.roster.formations[fo.id].step_ids).toHaveLength(1);
 expect(d.roster.formations[fo.id].step_ids).not.toContain(loss.id);
});
it('classifies Hill 192 HMGs as supporting personnel',()=>{
 const r=newCompanyCampaign(hill192,'hill-support');expect(r.support_formations).toContain('hmg1');expect(r.support_formations).toContain('hmg2');
});
it('rejects reuse of a completed mission identity for deployment',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 expect(()=>preparedCompanyDeployment(p,s.mission_instance_id,cerisy)).toThrow(/unique mission/);
});


it('retains actual Vire crews and isolates a withdrawn crew from company replacements',()=>{
 const roster=createVireRoster(),r=newCompanyCampaign(vire,roster.company_id);r.roster=roster;
 let s=createVireDevelopmentMission('crew-handoff',{}, {},{mission_instance_id:'vire-handoff',roster});
 const v=Object.values(s.vire_runtime.vehicles)[0],withdrawn=v.crew.map(t=>t.id);v.status='RETREATED';
 s=abortMission(s).state;
 const p=beginCompanyPreparation(r,s);
 for(const id of withdrawn){expect(p.roster.steps[id].disposition).toBe('WITHDRAWN_UNRESOLVED');expect(p.preparation.attachment_steps).toContain(id);}
 const live=Object.values(s.vire_runtime.vehicles).find(v=>v.status==='ACTIVE');
 expect(p.roster.formations[live.id].step_ids).toEqual(live.crew.map(t=>t.id));
 expect(p.preparation.replacement_slots).toBe(0);
});
it('supplies complete destination vehicle crews',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'vehicle-next',vire);
 const next=createVireDevelopmentMission('vehicle-next',{}, {},{mission_instance_id:d.mission_instance_id,roster:d.roster});
 expect(Object.values(next.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.profile==='M4_SHERMAN75')).toHaveLength(5);
 expect(next.vire_runtime.vehicles.sherman_hq.crew.every(t=>t.id.startsWith('vehicle-next_support_'))).toBe(true);
});


it('deploys prepared skills and reconstructs them exactly through replay',()=>{
 const {r,s}=terminal();s.achievements=[{points:5}];let p=beginCompanyPreparation(r,s);
 p=prepareCompany(prepareCompany(p,{type:'NEXT'}),{type:'NEXT'});
 p=prepareCompany(p,{type:'SKILL',purchase:{holder:'co',type:'AUTO_SPOT'}});p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'skilled-run',cerisy),next=createMission(cerisy,'skills',{},d);
 expect(next.roster_snapshot.prepared_skills).toEqual(d.roster.prepared_skills);expect(next.skills).toHaveLength(1);expect(next.skills[0]).toMatchObject({holder:'co',type:'AUTO_SPOT',used:false});
 expect(replayMission(cerisy,exportReplay(next))).toEqual(next);
 expect(p.roster.prepared_skills[0].used).toBe(false);
});
it('validates prepared skill holders against actual deployed strength',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'bad-skill',cerisy);d.prepared_skills=[{holder:'missing',type:'AUTO_SPOT'}];
 expect(()=>createMission(cerisy,'skills',{},d)).toThrow(/surviving company HQ/);
});


for(const row of [1,2,3,4])it(`deploys engineers only for qualifying discovered Row ${row} mines`,()=>{
 const locations=Object.fromEntries(Array.from({length:20},(_,i)=>{const r=1+Math.floor(i/5),c=1+i%5,id=`r${r}c${c}`;return [id,{id,row:r,col:c,name:'Scouted terrain',terrain:'open',elevation:1,known:true,covers:[],mines:r===row&&c===2}];}));
 const battlefield=exportScoutedBattlefield({scenario_id:'normandy_3',scenario_version:1,rules_version:34,mission_instance_id:'m3-source',seed:'mines',status:'SUCCESS',attempt_number:3,patrol_history:[1,2,3].map(platoon=>({platoon,outcome:'SUCCESS'})),terrain_deck:[],events:[{type:'MINEFIELD_FOUND',location:`r${row}c2`}],locations});
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 p.history.push({mission_id:battlefield.source.mission_instance_id,replay:{scenario:'normandy_3',mission_instance_id:battlefield.source.mission_instance_id},snapshot:{company_id:p.roster.company_id},battlefield});
 const setup={battlefield},before=structuredClone(battlefield),d=preparedCompanyDeployment(p,`hill-${row}`,hill192,setup);
 const next=createMission(hill192,'engineers',setup,d);
 expect(!!next.units.engineers).toBe(row===2||row===3);
 if(next.units.engineers){expect(next.units.engineers.steps).toHaveLength(3);expect(d.support_formations).toContain('engineers');}
 expect(battlefield).toEqual(before);expect(replayMission(hill192,exportReplay(next))).toEqual(next);
});


it('replenishes M10 and event M5 crews with prepared skills and exact vehicle replay',()=>{
 const {r,s}=terminal();s.achievements=[{points:5}];let p=beginCompanyPreparation(r,s);
 p=prepareCompany(prepareCompany(p,{type:'NEXT'}),{type:'NEXT'});p=prepareCompany(p,{type:'SKILL',purchase:{holder:'co',type:'AUTO_SPOT'}});p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'m7-fresh-support',tinchebray);
 const next=createTinchebrayDevelopmentMission('m7-support',{}, {},{mission_instance_id:d.mission_instance_id,roster:d.roster});
 expect(Object.values(next.vire_runtime.vehicles).filter(v=>v.profile==='M10_TD76'&&v.faction==='friendly')).toHaveLength(4);
 expect(d.roster.formations.m5_hq.step_ids).toHaveLength(1);
 expect(next.skills[0]).toMatchObject({holder:'co',type:'AUTO_SPOT',used:false});
 expect(importVireAdapterReplay(exportReplay(next))).toEqual(next);
 expect(next.vire_runtime.vehicles.m10_hq.ammo).toBe(5);
 expect(next.vire_runtime.vehicles.m10_hq.activated).toBe(false);
});
it('rejects rules-33 replay without modifying its original export',()=>{
 const {s}=terminal(),record=exportReplay(s);record.rules_version=33;const original=JSON.stringify(record);
 expect(()=>replayMission(trevieres,record)).toThrow(/version mismatch/);expect(JSON.stringify(record)).toBe(original);
});


it('can deploy surviving individual mortars as either teams or their section',()=>{
 const r=newCompanyCampaign(trevieres,'mortar-handoff');let s=createMission(trevieres,'mortar', {mortar_mode:'teams'}, {mission_instance_id:'mortar-source',roster:r.roster});s=abortMission(s).state;
 let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'mortar-destination',cerisy);
 expect(createMission(cerisy,'section',{},d).units.mortar_section.steps).toHaveLength(3);
 const teams=createMission(cerisy,'teams',{mortar_mode:'teams'},d);
 expect(['mortar1','mortar2','mortar3'].flatMap(id=>teams.units[id].steps)).toHaveLength(3);
 expect(replayMission(cerisy,exportReplay(teams))).toEqual(teams);
});


it('spends a deployed skill once and retains its used state through exact replay',()=>{
 const {r,s}=terminal();s.achievements=[{points:5}];let p=beginCompanyPreparation(r,s);
 p=prepareCompany(prepareCompany(p,{type:'NEXT'}),{type:'NEXT'});p=prepareCompany(p,{type:'SKILL',purchase:{holder:'co',type:'GENERAL_INITIATIVE'}});p=prepareCompany(p,{type:'NEXT'});
 let next=createMission(cerisy,'skill-use',{},preparedCompanyDeployment(p,'skill-use',cerisy));
 for(let n=0;next.phase!=='GENERAL_INITIATIVE'&&n<40;n++)next=!next.impulse&&eligibleHQs(next).length?selectHQ(next,eligibleHQs(next)[0]).state:advancePhase(next).state;
 expect(next.phase).toBe('GENERAL_INITIATIVE');
 const used=submitCommand(next,{type:'SKILL_GENERAL',unit_id:'co',issuer_id:'co'});expect(used.accepted).toBe(true);
 expect(used.state.skills[0].used).toBe(true);expect(submitCommand(used.state,{type:'SKILL_GENERAL',unit_id:'co',issuer_id:'co'}).accepted).toBe(false);
 expect(replayMission(cerisy,exportReplay(used.state))).toEqual(used.state);
 expect(p.roster.prepared_skills[0].used).toBe(false);
});


it('restores a participating patrol guard at its recorded experience and permits promotion',()=>{
 const {r,s}=terminal();s.patrol={plan:{platoon:1}};s.achievements=[{points:4,platoon:1}];
 const guard=s.units.s11.steps.pop();guard.experience='Line';s.prisoners=[{guard,guard_origin:'s11',guard_experience:'Line',prisoners:[]}];
 const loss=s.units.s21.steps.pop();s.casualties=[{step:loss}];
 let p=beginCompanyPreparation(r,s);expect(p.roster.steps[guard.id].experience).toBe('Line');
 p=prepareCompany(p,{type:'TRANSFER',step:guard.id,target:'s21'});
 expect(prepareCompany(p,{type:'PROMOTE',step:guard.id}).roster.steps[guard.id].experience).toBe('Veteran');
});


it('replaces destroyed supporting crews for the destination without resolving their casualties',()=>{
 const roster=createVireRoster(),r=newCompanyCampaign(vire,roster.company_id);r.roster=roster;
 let s=createVireDevelopmentMission('destroyed-support',{}, {},{mission_instance_id:'destroyed-support',roster});
 const old=s.vire_runtime.vehicles.sherman_hq,loss=old.crew[0];s.casualties.push({step:loss,evacuated:false});old.crew=[];old.status='BREWED_UP';s=abortMission(s).state;
 let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'new-m10-company',tinchebray),next=createTinchebrayDevelopmentMission('fresh-m10',{}, {},{mission_instance_id:d.mission_instance_id,roster:d.roster});
 expect(d.roster.steps[loss.id].disposition).toBe('CASUALTY_UNRESOLVED');
 expect(d.roster.formations.sherman_hq).toBeUndefined();expect(next.vire_runtime.vehicles.m10_hq.crew).toHaveLength(2);
 expect(next.vire_runtime.tank_support_used).toBe(false);
 expect(next.vire_runtime.vehicles.m10_hq.crew.map(t=>t.id)).not.toContain(loss.id);
 expect(d.roster.formations.co.step_ids).toEqual(p.roster.formations.co.step_ids);
});


it('does not silently return an unassigned mortar LAT to its old section',()=>{
 const {r,s}=terminal(),step=s.units.mortar_section.steps.pop();s.units.mortar_lat={id:'mortar_lat',kind:'LAT',faction:'friendly',experience:'Green',steps:[step]};
 let p=beginCompanyPreparation(r,s);expect(p.preparation.available).toContain(step.id);
 for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const d=preparedCompanyDeployment(p,'understrength-mortars',cerisy),next=createMission(cerisy,'understrength',{},d);
 expect(next.units.mortar_section.steps).toHaveLength(2);expect(next.units.mortar_section.steps.map(t=>t.id)).not.toContain(step.id);
});


it('rejects campaign Hill 192 without the same company completed M3 history',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 expect(()=>preparedCompanyDeployment(p,'unlinked-hill',hill192)).toThrow(/completed M3 battlefield/);
});


for(const status of ['ACTIVE','RETREATED'])it(`returns surviving company passengers from ${status} vehicles without replacements`,()=>{
 const roster=createVireRoster(),r=newCompanyCampaign(vire,roster.company_id);r.roster=roster;
 let s=createVireDevelopmentMission('passengers',{}, {},{mission_instance_id:`passengers-${status}`,roster});
 const u=s.units.s11,steps=structuredClone(u.steps),v=s.vire_runtime.vehicles.sherman_hq;
 v.status=status;v.passengers=steps.map(t=>({...t,origin_formation:u.id,experience:'Line'}));u.steps=[];u.removed='EMBARKED';
 s=abortMission(s).state;const p=beginCompanyPreparation(r,s);
 expect(p.roster.formations.s11.step_ids).toEqual(steps.map(t=>t.id));expect(p.preparation.returned_passengers).toHaveLength(3);
 expect(p.preparation.replacement_slots).toBe(0);
 for(const t of steps){expect(p.roster.steps[t.id].disposition).toBe('ACTIVE');expect(p.roster.steps[t.id].experience).toBe('Line');}
 expect(s.units.s11.steps).toEqual([]);
});


it('records a complete legal three-patrol M3 battlefield and binds M4 to that company',()=>{
 const r=newCompanyCampaign(stGeorges,'linked-company');let s=createMission(stGeorges,'linked-patrols',{}, {mission_instance_id:'linked-m3',roster:r.roster});
 for(let platoon=1;platoon<=3;platoon++){
  for(let turn=0;s.status==='ACTIVE'&&turn<10;turn++)s=endTurn(s).state;
  if(platoon<3){
   const positions={},load=[0,0,0,0,0];
   for(const u of Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||u.removed==='RESERVE'))){const col=load.findIndex(n=>n+u.steps.length<=16);expect(col).toBeGreaterThanOrEqual(0);positions[u.id]=`r1c${col+1}`;load[col]+=u.steps.length;}
   s=preparePatrol(s,{patrol:{...s.patrol.plan,platoon:platoon+1},positions}).state;
  }
 }
 expect(s.patrol_history).toHaveLength(3);expect(replayMission(stGeorges,exportReplay(s))).toEqual(s);
 let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const before=structuredClone(p),d=preparedCompanyDeployment(p,'linked-m4',hill192);
 expect(d.setup.battlefield.source.mission_instance_id).toBe('linked-m3');
 const next=createMission(hill192,'linked-map',d.setup,d);expect(next.battlefield_source.mission_instance_id).toBe('linked-m3');
 expect(p).toEqual(before);
 const tampered=structuredClone(d.setup.battlefield);tampered.locations[0].name='Unrelated terrain';
 expect(()=>preparedCompanyDeployment(p,'bad-m4',hill192,{battlefield:tampered})).toThrow(/differs from/);
 const foreign=structuredClone(p);foreign.history[0].snapshot.company_id='another-company';
 expect(()=>preparedCompanyDeployment(foreign,'foreign-m4',hill192)).toThrow(/completed M3 battlefield/);
 const st=storage();saveCompanyPreparation(st,p);expect(preparedCompanyDeployment(readCompanyPreparation(st),'reloaded-m4',hill192).setup.battlefield).toEqual(d.setup.battlefield);
},60000);


it('atomically commits the destination roster before deployment and subsequent debrief',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 const before=structuredClone(p),committed=commitPreparedCompanyDeployment(p,'committed-m2',cerisy);
 expect(committed.record.stage).toBe('DEPLOYMENT');expect(p).toEqual(before);
 const st=storage();saveCompanyPreparation(st,p);saveCompanyPreparation(st,committed.record,p.revision);
 const next=abortMission(createMission(cerisy,'commit',committed.deployment.setup,committed.deployment)).state;
 const debrief=beginCompanyPreparation(readCompanyPreparation(st),next);
 expect(debrief.history).toHaveLength(2);expect(debrief.roster.formations.mtrfo.step_ids).toHaveLength(1);
 expect(()=>commitPreparedCompanyDeployment(committed.record,'duplicate-start',cerisy)).toThrow();
 expect(()=>beginCompanyPreparation(committed.record,{...next,mission_instance_id:'wrong-run'})).toThrow(/committed/);
 expect(()=>saveCompanyPreparation(st,committed.record,p.revision)).toThrow(/revision changed/);
});


it('debriefs a complete real M5 patrol run with final-patrol experience and attachment ownership',()=>{
 const replay=JSON.parse(readFileSync('output/st-germain-playtests-v2-r35/st-germain-short-1-defenders.json','utf8')).replay;
 const s=replayMission(stGermain,replay),r=newCompanyCampaign(stGermain,replay.roster_snapshot.company_id);
 r.roster={schema:1,...structuredClone(replay.roster_snapshot),applied_missions:{}};
 const immutable=structuredClone(s.roster_snapshot),p=beginCompanyPreparation(r,s);
 expect(p.preparation.points).toBe(s.achievements.filter(a=>!a.spent&&a.platoon===3).reduce((n,a)=>n+a.points,0));
 expect(p.preparation.attachments).toContain('hmg1');expect(p.preparation.fieldable).not.toContain('hmg1');
 expect(s.roster_snapshot).toEqual(immutable);
 const members=Object.values(p.roster.formations).flatMap(f=>f.step_ids);expect(new Set(members).size).toBe(members.length);
},120000);


it('rallies a returned named HQ Fire Team without reducing its original experience',()=>{
 const roster=createVireRoster(),r=newCompanyCampaign(vire,roster.company_id);r.roster=roster;
 let s=createVireDevelopmentMission('named-return',{}, {},{mission_instance_id:'named-return',roster});
 const u=s.units.hq1,steps=structuredClone(u.steps),v=s.vire_runtime.vehicles.sherman_hq;
 u.cohesion='F';u.original_experience='Line';u.steps=[];u.removed='EMBARKED';
 v.passengers=steps.map(t=>({...t,origin_formation:u.id,experience:'Green'}));v.status='RETREATED';s=abortMission(s).state;
 const p=beginCompanyPreparation(r,s);expect(p.roster.steps[steps[0].id].experience).toBe('Line');
});
