import {describe,it,expect} from 'vitest';
import {createMission,endTurn,preparePatrol,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {buySkills,skillOptions} from '../src/sim/company/skills.js';
import {projectAttemptPersonnel} from '../src/ui/reattemptDraft.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {stGermain} from '../src/scenarios/stGermain.js';
function terminal(definition){let s=createMission(definition,'desk-patrol');for(let i=0;i<10&&s.status==='ACTIVE';i++)s=endTurn(s).state;return s;}
function choices(s,holder){return {patrol:{...s.patrol.plan,platoon:2},positions:Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||u.removed==='RESERVE')).map(u=>[u.id,u.id==='co'||u.platoon===2?'r1c2':'RESERVE'])),skills:[{holder,type:'AUTO_SPOT'}]};}
for(const definition of [stGeorges,stGermain])describe(`${definition.id} patrol skill holders`,()=>{
 for(const holder of ['co','xo','staff','hq1','hq2','hq3'])it(`can allocate the completed patrol's spare XP to ${holder}, including a reserve`,()=>{
  const s=terminal(definition);s.achievements=[{key:'fixture',points:9,platoon:1,turn:10,text:'Controlled experience allowance'}];const before=structuredClone(s),c=choices(s,holder),preview=projectAttemptPersonnel(s,{skills:c.skills},true),n=preparePatrol(s,c).state;
  expect(preview.points).toBe(8);expect(n.skills).toHaveLength(1);expect(n.skills[0]).toMatchObject({holder,type:'AUTO_SPOT',used:false});expect(s).toEqual(before);
  if(c.positions[holder]==='RESERVE'){expect(n.units[holder].removed).toBe('RESERVE');expect(skillOptions(n,n.units[holder],'SPOT')).toEqual([]);}
 });
 it('retains holder/counter limits and rejects a lost holder without changing the mission',()=>{
  const s=terminal(definition);s.achievements=[{points:9,platoon:1}];buySkills(s,[{holder:'staff',type:'AUTO_SPOT'},{holder:'staff',type:'AUTO_COVER'},{holder:'staff',type:'AUTO_INFILTRATE'}],9,{allowReserve:true});const before=structuredClone(s);
  expect(()=>preparePatrol(s,choices(s,'staff'))).toThrow('three skills');expect(s).toEqual(before);
  s.units.hq1.steps=[];s.units.hq1.removed='BROKEN';expect(()=>preparePatrol(s,choices(s,'hq1'))).toThrow('surviving company HQ');
 });
 it('does not extend promotion eligibility to another platoon',()=>{
  const s=terminal(definition);s.achievements=[{points:9,platoon:1}];const c=choices(s,'co');c.promote={[s.units.hq2.steps[0].id]:'Line'};expect(()=>preparePatrol(s,c)).toThrow(/patrol/i);expect(()=>projectAttemptPersonnel(s,{promote:c.promote},true)).toThrow('cannot be promoted');
 });
});
it('replays and recovers a real phase-stepped M3 patrol with a new skill on the resting HQ',()=>{
 const s=terminal(stGeorges);expect(s.achievements.filter(a=>a.platoon===1).reduce((n,a)=>n+a.points,0)).toBeGreaterThanOrEqual(1);const n=preparePatrol(s,choices(s,'hq1')).state;
 expect(n.units.hq1.removed).toBe('RESERVE');expect(replayMission(stGeorges,exportReplay(n))).toEqual(n);expect(resumeCheckpoint(stGeorges,checkpoint(n)).state).toEqual(n);
});
it('keeps a newly purchased future-platoon skill dormant until that platoon patrols',()=>{
 const first=terminal(stGeorges);let second=preparePatrol(first,choices(first,'hq3')).state;const skill=structuredClone(second.skills[0]);expect(skillOptions(second,second.units.hq3,'SPOT')).toEqual([]);
 for(let i=0;i<10&&second.status==='ACTIVE';i++)second=endTurn(second).state;
 const c=choices(second,'hq3');c.patrol.platoon=3;c.skills=[];for(const id of Object.keys(c.positions))c.positions[id]=id==='co'||second.units[id].platoon===3?'r1c2':'RESERVE';
 const third=preparePatrol(second,c).state;expect(third.skills[0]).toEqual(skill);expect(skillOptions(third,third.units.hq3,'SPOT').map(s=>s.id)).toContain(skill.id);expect(replayMission(stGeorges,exportReplay(third))).toEqual(third);
});
