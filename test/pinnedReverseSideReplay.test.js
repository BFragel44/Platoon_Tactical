import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
it('replays a combat-created pinned Paralyzed Team seeking cover and switching its carried radio',()=>{
 const raw=(id,kind,location,vof,radios,faction='friendly')=>({id,name:id,kind,platoon:kind==='SQUAD'?1:null,location,steps:1,vof,range:vof?3:0,radios,experience:'Line',faction});
 const def={...structuredClone(companyAssault),id:'pinned_replay',contacts:[],rules:{specialEnemies:true},units:[
  raw('co','HQ','r0c2',null,['BN','CO']),raw('recipient','SQUAD','r1c1',null,['BN']),raw('lost_radio','FO','r1c1',null,['MTR']),raw('enemy','MG','r2c1','H',[],'enemy')]};
 // This seed produces a Paralyzed survivor carrying BN and a destroyed MTR
 // device through normal combat. No state, phase or card ordering is injected.
 let s=createMission(def,'pinned-replay-57');
 for(let i=0;i<85&&!(s.turn===2&&s.impulse?.hq==='general');i++){
  const pending=s.pending_combat?.[s.segment_progress?.index];
  const r=s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='awaiting_resolution'&&pending?.target_visible?resolveCombat(s,pending.id):advancePhase(s);
  expect(r.state).not.toBe(s);s=r.state;
 }
 expect(s.turn).toBe(2);expect(s.impulse.hq).toBe('general');
 const u=Object.values(s.units).find(u=>u.cohesion==='P'&&u.pinned&&u.radios.includes('BN'));expect(u).toBeTruthy();
 expect(s.assets.some(a=>a.destroyed&&a.net==='MTR')).toBe(true);
 for(const command of [{type:'SEEK_COVER',unit_id:u.id},{type:'SWITCH_NETWORK',unit_id:u.id,target_id:'BN → MTR'}]){
  const r=submitCommand(s,command);expect(r.accepted,r.reason).toBe(true);s=r.state;
 }
 expect(s.units[u.id]).toMatchObject({cohesion:'P',pinned:true,radios:['MTR']});
 expect(s.events.some(e=>e.type==='COVER_ATTEMPT'&&e.actor===u.id)).toBe(true);
 expect(replayMission(def,exportReplay(s))).toEqual(s);
 expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);
});
