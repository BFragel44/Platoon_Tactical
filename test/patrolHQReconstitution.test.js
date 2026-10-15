import {describe,it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {eligibleTargets,commandOptions} from '../src/sim/company/actions.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {stGermain} from '../src/scenarios/stGermain.js';
function fixture(definition,platoon){
 const s=createMission(definition,'patrol-hq-eligibility',{patrol:{...definition.patrol_plan,platoon}});
 s.units.xo.removed=null;s.units.xo.location='r1c2';s.units.xo.cover=null;s.phase='STAFF_INITIATIVE';s.impulse={id:'fixture',hq:'xo',commands:4,spent:0};return s;
}
for(const mission of [stGeorges,stGermain])describe(`${mission.id} patrol HQ reconstitution`,()=>{
 for(const platoon of [1,2,3])it(`rejects intact reserves and eliminated non-patrol HQs for patrol platoon ${platoon}`,()=>{
  const s=fixture(mission,platoon),others=[1,2,3].filter(p=>p!==platoon),command=id=>({type:'RECONSTITUTE_HQ',issuer_id:'xo',unit_id:'xo',target_id:id});
  for(const p of others){const h=s.units[`hq${p}`];h.removed='RESERVE';expect(h.steps.length).toBeGreaterThan(0);expect(eligibleTargets(s,s.units.xo,'RECONSTITUTE_HQ')).not.toContain(h.id);
   let before=structuredClone(s),r=submitCommand(s,command(h.id));expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
   h.steps=[];h.removed='CASUALTY';before=structuredClone(s);r=submitCommand(s,command(h.id));expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
  }
  expect(commandOptions(s,s.units.xo,'xo').find(o=>o.type==='RECONSTITUTE_HQ').available).toBe(false);
 });
 for(const platoon of [1,2,3])it(`allows an actually eliminated patrol ${platoon} HQ with an eligible staff donor`,()=>{
  const s=fixture(mission,platoon),hq=s.units[`hq${platoon}`],donor=s.units.xo.steps[0].id;hq.steps=[];hq.removed='CASUALTY';
  expect(eligibleTargets(s,s.units.xo,'RECONSTITUTE_HQ')).toContain(hq.id);expect(commandOptions(s,s.units.xo,'xo').find(o=>o.type==='RECONSTITUTE_HQ').available).toBe(true);
  const r=submitCommand(s,{type:'RECONSTITUTE_HQ',issuer_id:'xo',unit_id:'xo',target_id:hq.id});expect(r.accepted,r.reason).toBe(true);expect(r.state.units[hq.id]).toMatchObject({removed:null,experience:'Green',location:'r1c2'});expect(r.state.units[hq.id].steps[0].id).toBe(donor);expect(r.state.units.xo.steps).toHaveLength(0);
 });
 it('does not rebuild a surviving HQ on its Fire Team side',()=>{
  const s=fixture(mission,1);s.units.hq1.cohesion='F';expect(eligibleTargets(s,s.units.xo,'RECONSTITUTE_HQ')).not.toContain('hq1');expect(submitCommand(s,{type:'RECONSTITUTE_HQ',issuer_id:'xo',unit_id:'xo',target_id:'hq1'}).accepted).toBe(false);
 });
 for(const reason of ['RESERVE','EMBARKED','GUARD'])it(`does not mistake a zero-step ${reason} HQ for an eliminated patrol HQ`,()=>{
  const s=fixture(mission,1);s.units.hq1.steps=[];s.units.hq1.removed=reason;const before=structuredClone(s);expect(eligibleTargets(s,s.units.xo,'RECONSTITUTE_HQ')).not.toContain('hq1');const r=submitCommand(s,{type:'RECONSTITUTE_HQ',issuer_id:'xo',unit_id:'xo',target_id:'hq1'});expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
 });
});
