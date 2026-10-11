import {vire} from '../src/scenarios/vire.js';
import {createVireRoster,createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {hill192} from '../src/scenarios/hill192.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,abortMission} from '../src/sim/company/engine.js';
import {newCompanyCampaign,beginCompanyPreparation,prepareCompany,saveCompanyPreparation,readCompanyPreparation,preparedCompanyDeployment} from '../src/sim/company/campaignPreparation.js';
const storage=()=>{const data={};return {getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=v};};
function terminal(){const r=newCompanyCampaign(trevieres,'test-company');let s=createMission(trevieres,'prep',{}, {mission_instance_id:'run-1',roster:r.roster});s=abortMission(s).state;return {r,s};}
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
 let p=beginCompanyPreparation(r,s);expect(p.roster.steps[step.id].disposition).toBe('WITHDRAWN_UNRESOLVED');
 p=prepareCompany(p,{type:'NEXT'});
 expect(()=>prepareCompany(p,{type:'REPLACE',target:'s11',level:'green'})).toThrow(/Replacement unavailable/);
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
it('rejects incomplete destination vehicle handoffs explicitly',()=>{
 const {r,s}=terminal();let p=beginCompanyPreparation(r,s);for(let i=0;i<3;i++)p=prepareCompany(p,{type:'NEXT'});
 expect(()=>preparedCompanyDeployment(p,'vehicle-next',vire)).toThrow(/vehicle deployment handoff/);
});
