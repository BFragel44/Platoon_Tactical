import {it,expect} from 'vitest';
import {missionBriefingMarkup} from '../src/ui/missionBriefing.js';
it('prioritizes mission objectives and keeps reference sections collapsed',()=>{
 const html=missionBriefingMarkup({mission_name:'Test mission',briefing:'Take the hill.',turn:5,turn_limit:10,objectives:{primary:{location:'hill',secured:true}},objective_requirements:{clear_rows:[1],success_timing:'final_turn'},objective_row_status:[{row:1,cleared:false}],mission_rules_text:['Special restriction'],hq_events:[{code:'SECRET'}],support_inventory:{mortar:{HE:3}}},id=>id);
 expect(html).toContain('Primary objective');expect(html).toContain('Secured');expect(html).toContain('Row 1 · Not clear');expect(html).toContain('end of turn 10');expect(html).toContain('Special restriction');
 expect(html).not.toContain('<details open');expect(html).not.toContain('SECRET');
});
it('shows the ordered patrol route and return condition without offensive victory requirements',()=>{
 const html=missionBriefingMarkup({mission_name:'Patrol',turn:2,turn_limit:10,patrol_history:[],status:'ACTIVE',patrol:{plan:{primary:'objective',platoon:2,route:['a','b','c','d']},visited:['a'],objective_visited:false,returned:false}},id=>id);
 expect(html).toContain('Patrol 1 of 3');expect(html).toContain('Route 4');expect(html).toContain('Return across MLR');expect(html).toContain('Next');expect(html).not.toContain('Required rows');
});
