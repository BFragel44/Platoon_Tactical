import {describe,it,expect} from 'vitest';
import {activeHQMarkup,afterActionMarkup} from '../src/ui/tacticalClarity.js';
import {formationGrid} from '../src/ui/formationGrid.js';
describe('tactical clarity uses public records',()=>{
 it('keeps multi-turn public effects visible only while active',()=>{
  const v={turn:5,locations:[],units:[{command_role:'higher_hq',steps:1}],counterattack_ends_after:6,hq_events:[{turn:4,side:'friendly',code:'CHECKING_UP'},{turn:4,side:'enemy',code:'COUNTER_ATTACK'}]};
  expect(activeHQMarkup(v)).toContain('Higher HQ visit');expect(activeHQMarkup(v)).toContain('Enemy counterattack');v.turn=7;expect(activeHQMarkup(v)).toBe('');
 });
 it('shows only current friendly obligations and recorded completion',()=>{
  const v={turn:3,locations:[],hq_events:[{turn:2,side:'friendly',code:'NO_ARTY'},{turn:3,side:'enemy',code:'FALL_BACK'},{turn:3,side:'friendly',code:'SITREP',completed:false}]},before=structuredClone(v);
  let html=activeHQMarkup(v);expect(html).toContain('Due this turn');expect(html).not.toContain('FALL BACK');expect(html).not.toContain('NO ARTY');expect(v).toEqual(before);
  v.hq_events[2].completed=true;expect(activeHQMarkup(v)).toContain('Completed');v.hq_events[2].ignored=true;expect(activeHQMarkup(v)).toContain('No action required');
 });
 it('labels carriers on friendly counters without exposing enemy inventory',()=>{
  const u={id:'s11',name:'1/1 Rifle Squad',kind:'SQUAD',steps:2,cohesion:'GOOD',experience:'Line',inventory:{casualties:[{id:'c1'}]}},l={id:'r1c1',name:'Farm',elevation:0,covers:[]};
  expect(formationGrid(l,[u],[],{})).toContain('✚ CARRYING 1');expect(formationGrid(l,[],[u],{})).not.toContain('✚ CARRYING');
 });
 it('separates factual AAR sections and escapes recorded text without changing exports',()=>{
  const a={outcome:'SUCCESS',orders:[],casualties:[],formations:[],objectives:[{turn:10,text:'Objective <secured>'}],achievements:[{turn:2,text:'Clear card',points:2}],score:2},before=structuredClone(a),html=afterActionMarkup(a);
  for(const label of ['Objective assessments','Losses','Formation changes','Experience awards','Orders issued','+2 XP','Objective &lt;secured&gt;'])expect(html).toContain(label);expect(a).toEqual(before);expect(afterActionMarkup(null)).toBe('');
 });
 it('distinguishes repeated turn numbers across attempts in the factual report',()=>{
  const e1={id:'first',turn:1,text:'First order'},boundary={id:'boundary',turn:1,type:'MISSION_REATTEMPTED',attempt:2},e2={id:'second',turn:1,text:'Second order'};
  const html=afterActionMarkup({outcome:'DEFEAT',events:[e1,boundary,e2],orders:[e1,e2],casualties:[],formations:[],objectives:[],achievements:[]});expect(html).toContain('Attempt 1 · Turn 1');expect(html).toContain('Attempt 2 · Turn 1');
 });
});
