import {it,expect} from 'vitest';
import {createMission,advancePhase,submitCommand,selectHQ,eligibleHQs,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

it('native M3 illumination and screening smoke survive to Cleanup and expire with exact replay/recovery',()=>{
 let s=createMission(stGeorges,'cleanup-public-1');
 for(let i=0;i<4;i++)s=advancePhase(s).state;
 const stock=s.support_inventory.artillery.ILLUM;
 for(const command of [{type:'CALL_ARTILLERY_ILLUM',unit_id:'artyfo',issuer_id:'co',target_id:'r1c2'},{type:'SMOKE',unit_id:'staff',issuer_id:'co'}]){
  const result=submitCommand(s,command);expect(result.accepted,result.reason).toBe(true);s=result.state;
 }
 expect(s.markers.some(m=>m.type==='ILLUMINATION')).toBe(true);expect(s.locations.r1c2.smoke).toBe(true);
 for(let i=0;i<70&&s.phase!=='CLEANUP';i++){
  const hqs=eligibleHQs(s);
  const result=!s.impulse&&hqs.length?selectHQ(s,hqs[0].id??hqs[0]):advancePhase(s);
  expect(result.state,result.reason).not.toBe(s);s=result.state;
 }
 expect(s.phase).toBe('CLEANUP');expect(s.markers.some(m=>m.type==='ILLUMINATION')).toBe(true);expect(s.locations.r1c2.smoke).toBe(true);
 expect(replayMission(stGeorges,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(stGeorges,checkpoint(s)).state).toEqual(s);
 s=advancePhase(s).state;
 expect(s.phase).toBe('FRIENDLY_EVENTS');expect(s.turn).toBe(2);
 expect(s.markers.some(m=>m.type==='ILLUMINATION')).toBe(false);expect(s.locations.r1c2.smoke).toBe(false);
 expect(s.support_inventory.artillery.ILLUM).toBe(stock-1);
 expect(replayMission(stGeorges,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(stGeorges,checkpoint(s)).state).toEqual(s);
});
