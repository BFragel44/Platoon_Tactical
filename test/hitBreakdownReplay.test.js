import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {vofOf} from '../src/sim/company/battlefield.js';

// Authored encounter; subsequent state changes use only public phase operations.
const raw=(id,kind,location,steps,vof,extra={})=>({id,name:id,kind,location,steps,vof,range:3,platoon:null,experience:'Line',radios:[],...extra});
const def={...structuredClone(companyAssault),id:'hit_breakdown_replay',contacts:[],rules:{specialEnemies:true,ammo:'tracked'},units:[
 raw('co','HQ','r0c2',1,null,{radios:['BN','CO']}),
 raw('mortar_section','MORTAR','r2c1',3,'H',{faction:'enemy',ammo:{MTR:5},fire_team_vof:'S',breakdown:'german_mortar_section'}),
 raw('squad','SQUAD','r2c1',2,'A/S',{faction:'enemy',last_step_vof:'A/S',breakdown:'fallschirmjager_as'}),
 raw('gunner','HMG','r1c1',1,'H',{ammo:{MG:8}}),
]};
function combatReview(s){
 for(let i=0;i<50;i++){
  const pending=s.pending_combat?.find(r=>r.status==='PENDING'&&r.target_visible);
  const result=s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status!=='reviewing'&&pending?resolveCombat(s,pending.id):advancePhase(s);
  expect(result.state,result.reason).not.toBe(s);s=result.state;
  if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='reviewing')return s;
 }
 throw new Error('Combat review was not reached');
}
it('replays and recovers actual German mortar and A/S breakdowns without injected cards or tactical state',()=>{
 const s=combatReview(createMission(def,'hit-public-31'));
 expect(s.events.filter(e=>e.type==='FORMATION_CHANGED'&&['mortar_section','squad'].includes(e.actor)).map(e=>[e.actor,e.effect])).toEqual([['mortar_section','FC'],['squad','P']]);
 const teams=Object.values(s.units).filter(v=>v.steps.length&&!v.removed);
 expect(teams.some(v=>v.kind==='MORTAR'&&v.cohesion==='GOOD'&&vofOf(v)==='G')).toBe(true);
 expect(teams.some(v=>v.cohesion==='F'&&vofOf(v)==='A/S')).toBe(true);
 expect(replayMission(def,exportReplay(s))).toEqual(s);
 expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);
});
it('the same public sequence remains exact under historical breakdown rules',()=>{
 const s=combatReview(createMission(def,'hit-public-31',{},null,{hit_breakdowns:false}));
 expect(exportReplay(s).hit_breakdowns).toBeUndefined();
 expect(replayMission(def,exportReplay(s))).toEqual(s);
 expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);
 expect(Object.values(s.units).some(v=>v.id.startsWith('mortar_')&&v.steps.length&&!v.removed&&v.cohesion==='GOOD')).toBe(false);
});
