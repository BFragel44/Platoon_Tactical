import {describe,it,expect} from 'vitest';
import {signalOrderLabel,turnNoticeMarkup} from '../src/ui/turnNotice.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
describe('turn briefing presentation',()=>{
 it('uses authoritative row clearance without exposing a hidden blocking formation',()=>{
  const s=createMission(trevieres,'turn-report-rows'),row=s.objectives.clear_rows[0],location=Object.values(s.locations).find(l=>l.row===row&&l.col===1);
  for(const c of Object.values(s.contacts))c.resolved=true;
  expect(getPlayerView(s).objective_row_status.find(r=>r.row===row).cleared).toBe(true);
  s.units.hidden_blocker={...structuredClone(s.units.s11),id:'hidden_blocker',name:'Secret blocker',faction:'enemy',location:location.id,cover:null};
  const view=getPlayerView(s);expect(view.objective_row_status.find(r=>r.row===row).cleared).toBe(false);
  expect(JSON.stringify(view.objective_row_status)).not.toContain('hidden_blocker');expect(turnNoticeMarkup(view,id=>id)).not.toContain('Secret blocker');
 });
 it('retains patrol waypoint and return progress in the compact report',()=>{
  const html=turnNoticeMarkup({turn:3,turn_limit:10,patrol_history:[],patrol:{plan:{platoon:1,primary:'p',route:['a','b','c','d']},visited:['a'],objective_visited:false,returned:false},casualties:[]},id=>id);
  expect(html).toContain('Patrol 1 of 3');expect(html).toContain('Visited');expect(html).toContain('Return across MLR');expect(html).not.toContain('Required rows');
 });
 it('distinguishes final turn, secured/cleared objectives and individual required rows',()=>{
  const view={turn:10,turn_limit:10,casualties:[],objectives:{primary:{location:'p',secured:true},secondary:{location:'s',cleared:true},attack:{location:'a'}},objective_requirements:{clear_rows:[1,2],success_timing:'final_turn'},objective_row_status:[{row:1,cleared:true},{row:2,cleared:false}]},before=structuredClone(view),html=turnNoticeMarkup(view,id=>id);
  expect(html).toContain('Final turn');expect(html).toContain('turn-status cleared');expect(html).toContain('Row 1: Clear');expect(html).toContain('Row 2: Not clear');expect(html).toContain('<details class="turn-guidance">');expect(html).not.toContain('turn-guidance" open');expect(view).toEqual(before);
 });
 it('does not fabricate individual row results from a failed aggregate assessment',()=>{
  const html=turnNoticeMarkup({turn:2,turn_limit:10,casualties:[],objective_requirements:{clear_rows:[1,2]},objective_assessment:{turn:1,rows_clear:false}},id=>id);
  expect(html).toContain('Row 1: Not assessed');expect(html).toContain('Row 2: Not assessed');expect(html).not.toContain('Final turn');
 });
 it('counts friendly casualty steps including evacuation, without enemy losses or invented dispositions',()=>{
  const html=turnNoticeMarkup({turn:2,turn_limit:10,objectives:{primary:{location:'p',secured:true},secondary:{location:'s',secured:false},attack:{location:'a',secured:false}},casualties:[{faction:'friendly',evacuated:true},{faction:'friendly',evacuated:false},{faction:'enemy',evacuated:false}]},id=>id==='p'?'<Primary>':id);
  expect(html).toContain('<b>2</b> casualty steps');expect(html).toContain('<b>1</b> evacuated');expect(html).toContain('&lt;Primary&gt;');expect(html).toContain('turn-status secured');expect(html).toContain('Not complete');expect(html).not.toMatch(/killed|wounded|enemy/i);
 });
 it('explains each offensive signal order in plain language',()=>{
  for(const code of ['CF','XPL1','XPL2','M2PO','INFAP2PO','M2SO','INFAP2SO','M2S'])expect(signalOrderLabel(code)).not.toBe('No assigned order');
  expect(signalOrderLabel('CF')).toBe('Cease fire');expect(signalOrderLabel('M2S')).toBe('Move to signal card');
 });
});
