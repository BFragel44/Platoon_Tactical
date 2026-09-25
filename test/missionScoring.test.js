import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,abortMission,checkObjective,getAfterActionReport} from '../src/sim/company/engine.js';
import {scoreMission} from '../src/sim/company/missionFeatures.js';
import {capture} from '../src/sim/company/combat.js';
const fresh=()=>createMission({...keepUpTheFire,readiness:{playable:true}},'scoring');
const enemy=(s,id,location,cohesion='P')=>s.units[id]={...structuredClone(s.units.s11),id,name:'Enemy team',faction:'enemy',location,cohesion,steps:[{id:`${id}_step`,personnel:[]}],fire:null};
describe('Keep Up the Fire achievements',()=>{
 it('scores positions at mission end, not when temporarily secured',()=>{
  const s=fresh(),id=s.objectives.primary;s.units.s11.location=id;s.contacts[`pc_${id}`].resolved=true;
  scoreMission(s);expect(s.achievements).toEqual([]);
  s.units.s11.location='r0c1';const ended=abortMission(s).state;
  expect(ended.achievements.some(a=>a.key==='primary')).toBe(false);
  // Objective terrain never receives the ordinary cleared-PC bonus instead.
  expect(ended.achievements.some(a=>a.key===`clear_pc_${id}`)).toBe(false);
 });
 it('finalizes success, positional points and AAR exactly once',()=>{
  const s=fresh();s.turn=10;
  for(const [key,unit]of [['primary','s11'],['secondary','s12'],['attack','s13']]){
   s.units[unit].location=s.objectives[key];s.contacts[`pc_${s.objectives[key]}`].resolved=true;
  }
  checkObjective(s);expect(s.status).toBe('SUCCESS');expect(getAfterActionReport(s).score).toBe(12);
  const n=s.achievements.length;scoreMission(s,{final:true});expect(s.achievements).toHaveLength(n);
 });
 it('a CCP on an ordinary cleared PC remains eligible for its card points',()=>{
  const s=fresh();s.objectives.ccp='r2c1';s.contacts.pc_r2c1.resolved=true;
  expect(abortMission(s).state.achievements).toContainEqual(expect.objectContaining({key:'clear_pc_r2c1',points:1}));
 });
 it('scores captured steps once and never scores merely unoccupied enemy casualties',()=>{
  const s=fresh();s.units.s11.location='r1c1';enemy(s,'prisoner','r1c1');
  s.casualties.push({id:'wounded1',faction:'enemy',location:'r1c1',step:{id:'w1',personnel:[]},evacuated:false},
   {id:'wounded2',faction:'enemy',location:'r2c2',step:{id:'w2',personnel:[]},evacuated:false});
  capture(s);scoreMission(s);capture(s);scoreMission(s);
  expect(s.achievements.map(a=>[a.key,a.points])).toEqual([['prisoner_prisoner_step',2],['enemy_casualty_w1',1]]);
  expect(s.casualties.find(c=>c.id==='wounded2').evacuated).toBe(false);
 });
 it('does not reveal undiscovered fortifications through final score',()=>{
  const s=fresh();s.locations.r2c1.covers.push({id:'hidden_fort',known:false,enemy_original:true,type:'Bunker'});
  const after=abortMission(s).state;expect(after.achievements.some(a=>a.key==='fort_hidden_fort')).toBe(false);
 });
 it('does not credit a full-turn hold obligation when aborting before cleanup',()=>{
  const s=fresh();s.hq_events.push({side:'friendly',code:'HOLD',turn:1,lead:0,completed:false});
  expect(abortMission(s).state.achievements.some(a=>a.key==='event_1_HOLD')).toBe(false);
  s.phase='CLEANUP';scoreMission(s);expect(s.achievements.some(a=>a.key==='event_1_HOLD')).toBe(true);
 });
});
