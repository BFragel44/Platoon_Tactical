import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,getPlayerView,advancePhase,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {communication,communicationChannels} from '../src/sim/company/battlefield.js';
import {commandLinkGroups,linkStyle} from '../src/ui/commandPanel.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const candidate={...trevieres,readiness:{playable:true}};
describe('friendly command visibility',()=>{
 it('reports voice and radio independently while preserving execution priority',()=>{
  const s=createMission(companyAssault,'channels');s.units.hq1.location=s.units.co.location;
  expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual(['Visual / verbal','CO radio via Company HQ · LOS']);
  expect(communication(s,s.units.co,s.units.hq1)).toBe('Visual / verbal');
  expect(linkStyle(communicationChannels(s,s.units.co,s.units.hq1))).toBe('both');
  s.units.hq1.location='r0c1';expect(linkStyle(communicationChannels(s,s.units.co,s.units.hq1))).toBe('radio');
  s.units.hq1.radios=[];expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual([]);
  s.units.hq1.location=s.units.co.location;expect(linkStyle(communicationChannels(s,s.units.co,s.units.hq1))).toBe('voice');
  s.units.co.pinned=true;expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual([]);
 });
 it('retains voice for degraded formations, rejects eliminated HQs and uses phone networks',()=>{
  const s=createMission(candidate,'phones-visible',{command_network:'phones'});s.units.hq1.location=s.units.co.location;
  expect(linkStyle(communicationChannels(s,s.units.co,s.units.hq1))).toBe('phone');
  s.units.hq1.cohesion='F';expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual(['Visual / verbal']);
  s.units.co.removed='ELIMINATED';expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual([]);
 });
 it('preserves simplified mission communication',()=>{
  const s=createMission({...keepUpTheFire,readiness:{playable:true}},'simplified-channels');
  expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual(['Mission communications · unpinned HQ/staff']);
  s.units.co.pinned=true;expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual([]);
 });
 it('preserves nominal command relationships when an HQ is eliminated',()=>{
  const s=createMission(candidate,'hierarchy-visible',{assignments:{mg1:{platoon:2}}});
  const v=getPlayerView(s);expect(v.command_network.find(l=>l.unit_id==='s11').parent_id).toBe('hq1');
  expect(v.command_network.find(l=>l.unit_id==='hq1').parent_id).toBe('co');
  expect(v.command_network.find(l=>l.unit_id==='mg1').parent_id).toBe('hq2');
  s.units.hq1.removed='ELIMINATED';const next=getPlayerView(s);
  expect(next.command_network.find(l=>l.unit_id==='s11').parent_id).toBe('hq1');expect(next.command_network.find(l=>l.unit_id==='s11').connected).toBe(false);
 });
 it('aggregates shared-card links without losing their distinct reasons',()=>{
  const s=createMission(companyAssault,'group-links');const v=getPlayerView(s);
  const groups=commandLinkGroups(v,'s11');expect(groups.some(g=>g.labels.length>1)).toBe(true);expect(groups.some(g=>g.selected)).toBe(true);
  expect(groups.reduce((n,g)=>n+g.labels.length,0)).toBe(v.command_network.filter(l=>l.parent_id).length);
 });
 it('emphasizes the selected platoon branch without highlighting sibling platoon links',()=>{
  const s=createMission(companyAssault,'selected-branch');s.units.hq2.location='r1c4';
  const groups=commandLinkGroups(getPlayerView(s),'hq1');
  expect(groups.find(g=>g.to==='r1c4').selected).toBe(false);
  expect(groups.find(g=>g.to===s.units.hq1.location&&g.from===s.units.co.location).selected).toBe(true);
 });
 it('retains overlay preference through an exact checkpoint replay',()=>{
  const s=advancePhase(createMission(candidate,'network-recovery')).state;
  const restored=resumeCheckpoint(candidate,checkpoint(s,{commandLinks:true,selected:'hq1'}));
  expect(restored.state).toEqual(replayMission(candidate,exportReplay(s)));expect(restored.presentation).toMatchObject({commandLinks:true,selected:'hq1'});
 });
});
