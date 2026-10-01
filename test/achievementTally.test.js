import {it,expect} from 'vitest';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {achievementTally} from '../src/sim/company/achievementTally.js';
import {scoreMission} from '../src/sim/company/missionFeatures.js';
it('previews current achievements without altering state, RNG or final scoring',()=>{
 const s=createMission(keepUpTheFire,'tally');
 s.events.push({id:'grenade_test',type:'GRENADE_ATTEMPT',actor:'s11',success:true,point_blank:true,turn:1});
 s.events.push({id:'capture_test',type:'UNIT_CAPTURED',faction:'enemy',step_ids:['enemy_step','enemy_step'],turn:1});
 const before=structuredClone(s),live=achievementTally(s);
 expect(live.rows).toHaveLength(12);expect(live.rows.find(r=>r.id==='grenade').points).toBe(1);
 expect(live.rows.find(r=>r.id==='prisoner').points).toBe(2);
 expect(live.rows.find(r=>r.id==='primary').provisional).toBe(true);
 expect(getPlayerView(s).achievement_tally).toEqual(live);expect(s).toEqual(before);
 s.status='ABORT';scoreMission(s,{final:true});const final=achievementTally(s);
 expect(final.total).toBe(s.achievements.reduce((n,a)=>n+a.points,0));expect(final.provisional).toBe(false);
});
it('does not show the KUTF table for Company Assault',()=>{
 expect(achievementTally(createMission(companyAssault,'tally'))).toBeNull();
});
