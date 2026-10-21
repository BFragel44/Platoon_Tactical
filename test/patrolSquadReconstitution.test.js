import {it,expect} from 'vitest';
import {createMission,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {eligibleTargets,commandOptions} from '../src/sim/company/actions.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {stGermain} from '../src/scenarios/stGermain.js';
function fixture(definition,platoon,phase='SUBORDINATE_ACTIVATION',corrected=true){
 const s=createMission(definition,'patrol-squad',{patrol:{...definition.patrol_plan,platoon}},null,{patrol_reconstitution:corrected});
 Object.assign(s.units.staff,{removed:null,location:'r1c2',cover:null,pinned:false});
 s.phase=phase;s.impulse={id:'patrol-squad',hq:'staff',commands:4,spent:0};s.activated=['staff'];s.completed=[];
 const target=Object.values(s.units).find(u=>u.kind==='SQUAD'&&u.platoon===platoon);
 for(let i=0;i<2;i++)s.units[`donor${i}`]={...structuredClone(target),id:`donor${i}`,name:`Assault team ${i}`,kind:'LAT',cohesion:'A',named:false,steps:[structuredClone(target.steps[i])],vof:'S',range:0,pinned:false,removed:null,location:'r1c2',cover:null,used:[],radios:[],assets:{},ammo:{}};
 target.steps=[];target.removed='ELIMINATED';
 return {s,target,command:id=>({type:'RECONSTITUTE',unit_id:'donor0',issuer_id:'staff',target_id:id,contributor_ids:['donor0','donor1']})};
}
for(const definition of [stGeorges,stGermain])for(const platoon of [1,2,3])it(`${definition.id} patrol ${platoon}: excludes other platoons and permits the active squad`,()=>{
 const {s,target,command}=fixture(definition,platoon);
 for(const other of Object.values(s.units).filter(u=>u.kind==='SQUAD'&&u.platoon!==platoon)){
  other.steps=[];other.removed='ELIMINATED';
  expect(eligibleTargets(s,s.units.donor0,'RECONSTITUTE')).not.toContain(other.id);
  const before=structuredClone(s),result=submitCommand(s,command(other.id));expect(result.accepted).toBe(false);expect(result.state).toEqual(before);
 }
 const option=commandOptions(s,s.units.donor0,'staff').find(o=>o.type==='RECONSTITUTE');
 expect(option.targets.map(t=>t.id)).toEqual([target.id]);expect(option.available).toBe(true);
 expect(submitCommand(s,command(target.id)).accepted).toBe(true);
});
for(const phase of ['COMPANY_ACTIVATION','SUBORDINATE_ACTIVATION','COMPANY_INITIATIVE','STAFF_INITIATIVE','GENERAL_INITIATIVE'])it(`validates the patrol restriction during ${phase}`,()=>{
 const {s,command}=fixture(stGeorges,2,phase),other=Object.values(s.units).find(u=>u.kind==='SQUAD'&&u.platoon===1);other.steps=[];other.removed='ELIMINATED';
 if(phase==='GENERAL_INITIATIVE')s.impulse.hq='general';else s.impulse.hq='staff';
 const before=structuredClone(s),result=submitCommand(s,command(other.id));expect(result.accepted).toBe(false);expect(result.state).toEqual(before);
});
for(const removed of ['RESERVE','EMBARKED','GUARD'])it(`does not restore a ${removed} squad as an eliminated counter`,()=>{
 const {s,target,command}=fixture(stGeorges,2);target.removed=removed;
 expect(eligibleTargets(s,s.units.donor0,'RECONSTITUTE')).not.toContain(target.id);expect(submitCommand(s,command(target.id)).accepted).toBe(false);
});
it('hides historical non-patrol options without invalidating the historical reducer',()=>{
 const {s,command}=fixture(stGeorges,2,'SUBORDINATE_ACTIVATION',false),other=Object.values(s.units).find(u=>u.kind==='SQUAD'&&u.platoon===1);other.steps=[];other.removed='ELIMINATED';
 expect(eligibleTargets(s,s.units.donor0,'RECONSTITUTE')).toContain(other.id);
 expect(commandOptions(s,s.units.donor0,'staff').find(o=>o.type==='RECONSTITUTE').targets.map(t=>t.id)).not.toContain(other.id);
 expect(submitCommand(s,command(other.id)).accepted).toBe(true);
});
for(const corrected of [true,false])it(`initializes and replays patrol reconstitution rules (${corrected})`,()=>{
 const s=createMission(stGeorges,'patrol-replay',{},null,{patrol_reconstitution:corrected}),record=exportReplay(s);
 expect(record.patrol_reconstitution).toBe(corrected?'v1':undefined);expect(replayMission(stGeorges,record)).toEqual(s);
});
