import {describe,it,expect} from 'vitest';
import {createMission,prepareReattempt} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {projectAttemptPersonnel,attemptPresentationState} from '../src/ui/reattemptDraft.js';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {embarkInfantry} from '../src/sim/company/vehicleTransport.js';
import {clearAarNavigation,startingFormation,deploymentMapMarkup} from '../src/ui/commandDesk.js';
function fixture(){const s=createMission(trevieres,'desk-fixture');s.status='DEFEAT';s.achievements=[{key:'test',points:10}];
 const step=s.units.s11.steps.pop();s.units.donor={...structuredClone(s.units.s11),id:'donor',name:'Assault team',kind:'LAT',steps:[step],max_steps:1,cohesion:'A',removed:null};return s;}
describe('command desk drafts and public presentation',()=>{
 it('includes embarked tank riders in deployment without disembarking the live mission or drawing cards',()=>{
  const s=createVireDevelopmentMission('desk-riders');s.vire_runtime.vehicles.sherman_hq=embarkInfantry(s,s.vire_runtime.vehicles.sherman_hq,['s11']);s.status='DEFEAT';const before=structuredClone(s);
  const view=attemptPresentationState(s);expect(s).toEqual(before);expect(s.units.s11.steps).toHaveLength(0);expect(view.units.s11.steps).toHaveLength(3);expect(view.units.s11.removed).toBeNull();expect(view.rng).toEqual(s.rng);expect(view.deck).toEqual(s.deck);
 });
 it('updates strength, transferred-step promotion, skills and XP without consuming cards or changing source',()=>{
  const s=fixture(),before=structuredClone(s),id=s.units.donor.steps[0].id;
  const choices={reconstitute:{s11:['donor']},promote:{[id]:'Line'},skills:[{holder:'co',type:'AUTO_SPOT'}]};
  expect(projectAttemptPersonnel(s,{reconstitute:choices.reconstitute}).stepLevels[id]).toBe('Green');
  const projected=projectAttemptPersonnel(s,choices);expect(s).toEqual(before);expect(projected.units.s11.steps).toHaveLength(3);expect(projected.consumed.has('donor')).toBe(true);expect(projected.points).toBe(8);
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
  const next=prepareReattempt(s,{...choices,positions}).state;expect(next.units.s11.steps).toEqual(projected.units.s11.steps);expect(next.skills).toEqual(projected.skills);
 });
 it('rejects duplicate donors, overflow and rebuilt HQ promotion without mutating state',()=>{
  const s=fixture(),before=structuredClone(s),id=s.units.donor.steps[0].id;
  expect(()=>projectAttemptPersonnel(s,{reconstitute:{s11:['donor','donor']}})).toThrow();
  s.units.hq1.steps=[];s.units.hq1.removed='ELIMINATED';
  expect(()=>projectAttemptPersonnel(s,{reconstitute:{hq1:['donor']},promote:{[id]:'Line'}})).toThrow(/cannot be promoted/);
  expect(projectAttemptPersonnel(s,{reconstitute:{hq1:['donor']}}).units.hq1.experience).toBe('Green');expect(s.units.donor).toEqual(before.units.donor);
 });
 it('preserves URL query flags while clearing only obsolete AAR navigation',()=>{
  const calls=[],history={state:{key:1},replaceState:(...args)=>calls.push(args)};
  clearAarNavigation({hash:'#aar',pathname:'/game/',search:'?campaignDev=1'},history);expect(calls).toEqual([[{key:1},'','/game/?campaignDev=1']]);
  clearAarNavigation({hash:'#other'},history);expect(calls).toHaveLength(1);
 });
 it('chooses a surviving HQ and never selects an eliminated command counter',()=>{const s=fixture();s.units.co.removed='ELIMINATED';expect(startingFormation(s)).toBe('hq1');});
 it('does not expose unrevealed terrain names or private contents on the deployment map',()=>{
  const html=deploymentMapMarkup({locations:[{id:'r2c1',row:2,col:1,name:'Secret Orchard',known:false,enemies:['hidden']}],allowed:[]});expect(html).toContain('2.1');expect(html).not.toContain('Unrevealed terrain');expect(html).not.toContain('Secret Orchard');expect(html).not.toContain('hidden');
 });
});
