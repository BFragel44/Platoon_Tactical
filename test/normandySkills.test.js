import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,prepareReattempt,endTurn,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {buySkills,skillOptions} from '../src/sim/company/skills.js';
import {attempt,cards} from '../src/sim/company/core.js';
import {concentrate} from '../src/sim/company/actions.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
const candidate={...trevieres,readiness:{playable:true}};
const fresh=()=>createMission(candidate,'skills');
const enemy=s=>{const u={...structuredClone(s.units.s11),id:'enemy_fixture',faction:'enemy',location:'r1c1'};s.units[u.id]=u;s.knowledge.spotted[u.id]=true;return u;};
describe('attempt-local skills',()=>{
 it('adds a skill draw to the published artillery caller draw and retains it after an invalid no-draw order',()=>{
  const s=fresh(),u=s.units.artyfo;s.active_skill={actor:u.id,extra:true};
  const before=s.deck.draws;supportRequest(s,u,'artillery','HE','r1c2');
  expect(s.deck.draws-before).toBe(3);expect(s.active_skill.applied).toBe(true);
  s.active_skill={actor:s.units.co.id,extra:true};const low=s.deck.draws;
  supportRequest(s,s.units.co,'artillery','HE','r1c3');expect(s.deck.draws-low).toBe(2);
  delete s.active_skill;buySkills(s,[{holder:'co',type:'EXTRA_DRAW'}],1);
  s.units.co.cohesion='F';s.phase='GENERAL_INITIATIVE';s.impulse={id:'fixture',hq:'general',commands:1,spent:0};
  const r=submitCommand(s,{type:'RECOVER',unit_id:'co',issuer_id:'co',skill_id:s.skills[0].id});
  expect(r.accepted).toBe(false);expect(s.skills[0].used).toBe(false);expect(r.reason).toContain('No draw');
 });
 it('enforces costs, holders, per-holder capacity, and shared physical marker faces',()=>{
  const s=fresh();
  expect(buySkills(s,[{holder:'co',type:'GENERAL_INITIATIVE'}],3)).toBe(1);
  expect(()=>buySkills(s,[{holder:'co',type:'GENERAL_INITIATIVE'}],1)).toThrow('experience');
  expect(()=>buySkills(s,[{holder:'s11',type:'AUTO_SPOT'}],2)).toThrow('HQ or staff');
  expect(()=>buySkills(s,Array(4).fill({holder:'co',type:'AUTO_COVER'}),9)).toThrow('three skills');
  const purchases=['co','xo','staff'].flatMap(holder=>Array(3).fill({holder,type:'SPAWN_TEAM'}));
  expect(()=>buySkills(s,purchases,20)).toThrow('counter mix');
  const shared=Array.from({length:4},()=>({holder:'hq1',type:'SPAWN_TEAM'}));
  shared[3].holder='hq2';shared.push({holder:'hq2',type:'AUTO_COVER'});
  expect(()=>buySkills(s,shared,10)).toThrow('counter mix');
 });
 it('shares platoon skills within that platoon, while company/staff skills remain personal',()=>{
  const s=fresh();buySkills(s,[{holder:'hq1',type:'AUTO_COVER'},{holder:'co',type:'AUTO_COVER'}],2);
  expect(skillOptions(s,s.units.s11,'SEEK_COVER')).toHaveLength(1);
  expect(skillOptions(s,s.units.s21,'SEEK_COVER')).toHaveLength(0);
  expect(skillOptions(s,s.units.co,'SEEK_COVER')).toHaveLength(1);
 });
 it('still draws all cards and preserves actual critical successes on automatic attempts',()=>{
  const s=fresh(),u=s.units.s11;
  const hit=Object.values(cards).find(c=>c.grenade).id;
  s.deck.order=[hit,hit,...s.deck.order];s.active_skill={actor:u.id,icon:'grenade'};
  const before=s.deck.draws;expect(attempt(s,u,2,'grenade','skill test')).toBe(2);
  expect(s.deck.draws-before).toBe(2);expect(s.active_skill.applied).toBe(true);
  const miss=Object.values(cards).find(c=>c.id!==51&&!c.grenade).id;
  s.deck.order=[miss,miss,...s.deck.order];s.active_skill={actor:u.id,icon:'grenade'};
  expect(attempt(s,u,2,'grenade','automatic miss')).toBe(1);
 });
 it('adds exactly one draw and cannot apply to a second or other formation attempt',()=>{
  const s=fresh(),u=s.units.s11;s.active_skill={actor:u.id,extra:true};
  let before=s.deck.draws;attempt(s,u,2,'spot','extra');expect(s.deck.draws-before).toBe(3);
  before=s.deck.draws;attempt(s,u,2,'spot','again');expect(s.deck.draws-before).toBe(2);
 });
 it('a jam overrides an automatic success and preserves steps as Fire Teams',()=>{
  const s=fresh(),u=s.units.mg1,target=enemy(s);
  const jam=Object.values(cards).find(c=>c.jam).id;
  const hit=Object.values(cards).find(c=>c.spot).id;
  s.deck.order=[hit,jam,...s.deck.order];s.active_skill={actor:u.id,icon:'spot'};
  const identity=u.steps[0].id;concentrate(s,u,target);
  expect(u.removed).toBe('JAMMED');expect(u.steps).toHaveLength(0);
  expect(Object.values(s.units).find(v=>v.kind==='LAT').steps[0].id).toBe(identity);
  expect(s.markers.some(m=>m.type==='CONCENTRATE')).toBe(false);
  expect(s.events.some(e=>e.type==='WEAPON_JAMMED')).toBe(true);
 });
 it('spends one extra ammunition point only on successful concentrated fire',()=>{
  const s=fresh(),u=s.units.mg1,target=enemy(s);
  const hit=Object.values(cards).find(c=>c.spot&&!c.jam).id;
  s.deck.order=[hit,hit,...s.deck.order];concentrate(s,u,target);
  expect(u.ammo.MG).toBe(3);
  const miss=Object.values(cards).find(c=>c.id!==51&&!c.spot&&!c.jam).id;
  s.deck.order=[miss,miss,...s.deck.order];concentrate(s,u,target);
  expect(u.ammo.MG).toBe(3);
 });
 for(const [type,cohesion,experience] of [['SKILL_PARALYZED_A','A','Line'],['SKILL_PARALYZED_F','F','Green']])it(`uses ${type} for one command`,()=>{
  const s=fresh();buySkills(s,[{holder:'hq1',type:type.endsWith('_A')?'PARALYZED_ASSAULT':'PARALYZED_FIRE'}],2);
  s.units.s11.kind='LAT';s.units.s11.cohesion='P';
  s.phase='GENERAL_INITIATIVE';s.impulse={id:'skill_fixture',hq:'general',commands:1,spent:0};
  const r=submitCommand(s,{type,unit_id:'s11',issuer_id:'co'});
  expect(r.accepted).toBe(true);expect(r.state.units.s11).toMatchObject({cohesion,experience});
  expect(r.state.impulse.commands).toBe(0);expect(r.state.skills[0].used).toBe(true);
 });
 it('grants one extra general command for free',()=>{
  const s=fresh();buySkills(s,[{holder:'co',type:'GENERAL_INITIATIVE'}],2);
  s.phase='GENERAL_INITIATIVE';s.impulse={id:'skill_fixture',hq:'general',commands:0,spent:0};
  const r=submitCommand(s,{type:'SKILL_GENERAL',unit_id:'co',issuer_id:'co'});
  expect(r.accepted).toBe(true);expect(r.state.impulse.commands).toBe(1);expect(r.state.impulse.spent).toBe(0);
 });
 it('can spend the extra general command after six ordinary commands',()=>{
  const s=fresh();buySkills(s,[{holder:'co',type:'GENERAL_INITIATIVE'}],2);
  s.phase='GENERAL_INITIATIVE';s.impulse={id:'skill_fixture',hq:'general',commands:0,spent:6};
  const granted=submitCommand(s,{type:'SKILL_GENERAL',unit_id:'co',issuer_id:'co'});
  expect(granted.accepted).toBe(true);
  const moved=submitCommand(granted.state,{type:'MOVE',unit_id:'s11',issuer_id:'co',target_id:'r1c2'});
  expect(moved.accepted).toBe(true);expect(moved.state.impulse.spent).toBe(7);
 });
 it('spawns a team without spending commands, preserves its step, and consumes the skill once',()=>{
  let s=fresh();buySkills(s,[{holder:'hq1',type:'SPAWN_TEAM'}],1);
  s.phase='GENERAL_INITIATIVE';s.impulse={id:'skill_fixture',hq:'general',commands:0,spent:0};
  const step=s.units.s11.steps.at(-1).id;
  const r=submitCommand(s,{type:'SKILL_SPAWN_F',unit_id:'s11',issuer_id:'co'});
  expect(r.accepted).toBe(true);s=r.state;
  expect(s.impulse.commands).toBe(0);expect(s.units.s11.steps).toHaveLength(2);
  expect(Object.values(s.units).find(u=>u.kind==='LAT').steps[0].id).toBe(step);
  expect(s.skills[0].used).toBe(true);
  expect(submitCommand(s,{type:'SKILL_SPAWN_F',unit_id:'s11',issuer_id:'co'}).accepted).toBe(false);
 });
 it('replays paid preparation and keeps purchases confined to the new attempt',()=>{
  let s=fresh();for(let n=0;n<10;n++)s=endTurn(s).state;
  // Secured staging cards award no XP in this no-order run; buy an empty list.
  const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
  s=prepareReattempt(s,{positions,skills:[]}).state;
  expect(replayMission(candidate,exportReplay(s))).toEqual(s);
  expect(s.attempt_records[0].starting_state.skills).toBeUndefined();
  expect(s.attempt_records[1].starting_state.skills).toEqual([]);
 },20000);
});
