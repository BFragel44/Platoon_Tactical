import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,submitCommand,advancePhase,getPlayerView,getVisibleEvents,exportReplay,replayMission,compareReplay} from '../src/sim/company/engine.js';
import {basicValue,rangeOf,communication,refresh,spot,movementReason,combatModifier,canFire} from '../src/sim/company/battlefield.js';
import {spotAttempt,move,grenade,rally} from '../src/sim/company/actions.js';
import {enemyActivity,applyHit,resolveCombat} from '../src/sim/company/combat.js';
import {cards} from '../src/sim/company/core.js';
import {combatPlayback} from '../src/ui/combatPlayback.js';

const fresh=seed=>createMission(companyAssault,seed??'clarity');
function impulse(s,hq='general'){s.phase='GENERAL_INITIATIVE';s.impulse={id:'fixture',hq,commands:6,spent:0};return s;}
function enemy(s,id,location,known=false){const e={...structuredClone(s.units.mg1),id,name:`Enemy ${id}`,faction:'enemy',location,fire:null};s.units[id]=e;if(known)spot(s,e);return e;}
function deck(s,ids){s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];}
function openMap(s){for(const l of Object.values(s.locations)){l.elevation=1;l.borders='all';}}

describe('Company rules and tactical clarity regressions',()=>{
 it('command/observer sides cannot fire; named reverse sides lose and recover capability',()=>{
  const s=impulse(fresh());s.units.co.location='r1c1';enemy(s,'e','r1c2',true);
  for(const id of ['co','hq1','hq2','staff','mtrfo','artyfo'])expect(basicValue(s.units[id])).toBeNull();
  s.units.co.pinned=true;expect(basicValue(s.units.co)).toBeNull();s.units.co.pinned=false;
  expect(submitCommand(s,{type:'GRENADE',unit_id:'co',target_id:'e'}).accepted).toBe(false);
  const r=submitCommand(s,{type:'DEPLOY_FIRE_TEAM',unit_id:'co'});expect(r.accepted).toBe(true);
  expect(basicValue(r.state.units.co)).toBe(0);expect(rangeOf(r.state.units.co)).toBe(1);
  r.state.units.e.removed='CAPTURED';refresh(r.state);r.state.units.co.fire=null;refresh(r.state);
  rally(r.state,r.state.units.co,r.state.units.co,true);expect(basicValue(r.state.units.co)).toBeNull();
 });
 it('rejects empty and staging spotting before any state, command, history or deck change',()=>{
  const s=impulse(fresh());s.units.s11.location='r1c1';s.knowledge.suspected.r1c2=true;
  const r=submitCommand(s,{type:'SPOT',unit_id:'s11',target_id:'r1c2'});
  expect(r.accepted).toBe(false);expect(r.state).toBe(s);expect(getPlayerView(s).suspected).toEqual([]);
  enemy(s,'e','r1c2');s.units.s11.location='r0c1';expect(submitCommand(s,{type:'SPOT',unit_id:'s11',target_id:'r1c2'}).accepted).toBe(false);
 });
 it('one successful spotting batch reveals all occupants and clears current suspicion',()=>{
  const s=fresh(),a=enemy(s,'a','r1c2'),b=enemy(s,'b','r1c2');s.units.s11.location='r1c1';s.knowledge.suspected.r1c2=true;
  const ids=Object.values(cards).filter(c=>c.spot).slice(0,3).map(c=>c.id);deck(s,ids);
  const before=s.deck.draws;spotAttempt(s,s.units.s11,'r1c2');
  expect(s.knowledge.spotted[a.id]).toBeTruthy();expect(s.knowledge.spotted[b.id]).toBeTruthy();
  expect(s.deck.draws-before).toBe(3);expect(getPlayerView(s).suspected).toEqual([]);
  expect(getPlayerView(s).historical_reports).toContain('r1c2');
 });
 it('a spotted formation arriving reveals unspotted occupants on its card',()=>{
  const s=fresh(),a=enemy(s,'a','r1c2',true),b=enemy(s,'b','r2c2');a.location=b.location;refresh(s);expect(s.knowledge.spotted.b).toBeTruthy();
 });
 it('FO networks cannot transmit HQ orders and CO network requires the hub',()=>{
  const s=fresh();s.units.co.location='r1c1';s.units.artyfo.location='r1c2';s.units.co.radios.push('ARTY');
  expect(communication(s,s.units.co,s.units.artyfo)).toBeNull();
  s.units.hq1.location='r1c2';s.units.mortar.location='r2c1';expect(communication(s,s.units.hq1,s.units.mortar)).toBeTruthy();
  s.units.co.cover='cover';expect(communication(s,s.units.hq1,s.units.mortar)).toBeNull();
  s.units.co.cover=null;s.units.co.radios=[];expect(communication(s,s.units.hq1,s.units.mortar)).toBeNull();
 });
 it('allows pinned command-side radio activation but not Fire Team-side activation',()=>{
  let s=fresh();s.phase='BN_ACTIVATION';s.units.co.pinned=true;s=advancePhase(s).state;expect(s.activated).toContain('co');
  s.impulse.commands=6;s.units.hq1.pinned=true;
  expect(submitCommand(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq1'}).accepted).toBe(true);
  s.units.hq1.cohesion='F';expect(submitCommand(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq1'}).accepted).toBe(false);
 });
 it('keeps HQ reserves independent, caps expenditure, and limits degraded HQs to self orders',()=>{
  let s=impulse(fresh(),'hq1');s.units.hq2.saved=4;s=advancePhase(s).state;expect(s.units.hq1.saved).toBe(6);expect(s.units.hq2.saved).toBe(4);
  s=impulse(fresh(),'hq1');s.impulse.spent=6;expect(submitCommand(s,{type:'MOVE',issuer_id:'hq1',unit_id:'s11',target_id:'r1c1'}).accepted).toBe(false);
  s.impulse.spent=0;s.units.hq1.cohesion='F';expect(submitCommand(s,{type:'MOVE',issuer_id:'hq1',unit_id:'s11',target_id:'r1c1'}).accepted).toBe(false);
 });
 it('an entering unit joins existing fire even when a closer target is visible',()=>{
  const s=fresh();openMap(s);s.units.s11.location='r1c1';enemy(s,'far','r3c1',true);refresh(s);expect(s.units.s11.fire).toBe('r3c1');
  enemy(s,'near','r1c2',true);move(s,s.units.s12,'r1c1');refresh(s);expect(s.units.s12.fire).toBe('r3c1');
 });
 it('moves VOF back for friendly intervening occupants and smoke, but ignores unspotted opponents',()=>{
  const s=fresh();openMap(s);s.units.s11.location='r1c1';enemy(s,'far','r3c1',true);enemy(s,'hidden','r2c1');refresh(s);
  expect(s.units.s11.fire).toBe('r3c1');s.units.s12.location='r2c1';refresh(s);expect(s.units.s11.fire).toBe('r2c1');
  const t=fresh();openMap(t);t.units.s11.location='r1c1';enemy(t,'far','r3c1',true);refresh(t);t.locations.r2c1.smoke=true;refresh(t);expect(t.units.s11.fire).toBe('r2c1');
 });
 it('stops removed sources but preserves friendly fire at a cleared position',()=>{
  const s=fresh();s.units.s11.location='r1c1';const e=enemy(s,'e','r1c2',true);refresh(s);e.removed='CAPTURED';refresh(s);
  expect(s.fire.some(f=>f.source==='e')).toBe(false);expect(s.units.s11.fire).toBe('r1c2');
 });
 it('counts 16 steps separately by faction and exempts staging',()=>{
  const s=fresh();s.units.s11.location='r1c1';const e=enemy(s,'e','r1c2');e.steps=Array.from({length:16},(_,i)=>({id:`x${i}`,personnel:[]}));
  expect(movementReason(s,s.units.s11,'r1c2')).toBeNull();
  s.units.s12.location='r1c2';s.units.s12.steps=structuredClone(e.steps);expect(movementReason(s,s.units.s11,'r1c2')).toContain('16-step');
  expect(movementReason(s,s.units.s11,'r0c1')).toBeNull();
 });
 it('never checks a moving enemy twice within one activity segment',()=>{
  for(let i=0;i<30;i++){const s=fresh(`enemy-${i}`),a=enemy(s,'a','r2c1'),b=enemy(s,'b','r1c1');a.pinned=true;b.pinned=true;s.units.s11.location='r2c2';refresh(s);enemyActivity(s);
   const ids=s.events.filter(e=>e.type==='ENEMY_ACTIVITY').map(e=>e.actor);expect(new Set(ids).size).toBe(ids.length);
  }
 });
 it('indirect fire does not create crossfire and same-direction PDFs count only once',()=>{
  const s=fresh();s.units.s11.location='r1c1';enemy(s,'a','r2c1');enemy(s,'b','r3c1');
  s.fire=[{source:'a',origin:'r2c1',target:'r1c1',value:-1},{source:'b',origin:'r3c1',target:'r1c1',value:-1}];
  expect(combatModifier(s,s.units.s11).parts.crossfire).toBe(0);s.fire[1].origin='r2c2';s.fire[1].indirect=true;expect(combatModifier(s,s.units.s11).parts.crossfire).toBe(0);
 });
 it('mortar indirect orders require observer LOS, not mortar LOS, and expire at cleanup',()=>{
  let s=impulse(fresh(),'co');s.units.co.location='r2c2';s.units.mortar.location='r1c1';enemy(s,'e','r2c3',true);
  const r=submitCommand(s,{type:'INDIRECT',issuer_id:'co',unit_id:'mortar',target_id:'r2c3'});expect(r.accepted).toBe(true);s=r.state;expect(s.fire.some(f=>f.indirect)).toBe(true);
  expect(canFire(s,s.units.mortar,s.units.mortar.location)).toBe(false);s.impulse=null;s.phase='CLEANUP';s=advancePhase(s).state;expect(s.units.mortar.indirect).toBeNull();
 });
 it('good-order bazookas can respond to point-blank grenades; Fire Team sides lose ranged grenades',()=>{
  const s=impulse(fresh());s.units.at1.location='r1c1';const e=enemy(s,'e','r1c1',true);grenade(s,e,s.units.at1);
  expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT')).toHaveLength(2);
  applyHit(s,s.units.at1,'F');s.units.at1.pinned=false;e.location='r1c2';expect(submitCommand(s,{type:'GRENADE',unit_id:'at1',target_id:'e'}).accepted).toBe(false);
 });
 it('cohesion losses drop radios without a destruction draw; actual casualty loss checks damage',()=>{
  const s=fresh(),before=s.deck.draws;applyHit(s,s.units.co,'P');expect(s.deck.draws).toBe(before);expect(s.assets.every(a=>!a.destroyed)).toBe(true);
  const t=fresh();applyHit(t,t.units.co,'C');expect(t.deck.draws).toBeGreaterThan(0);
 });
 it('combat playback uses visible history only and never changes state or draws',()=>{
  const s=fresh();s.units.s11.location='r1c1';enemy(s,'hidden','r1c2');refresh(s);resolveCombat(s);const before=structuredClone(s);
  const pages=combatPlayback(getVisibleEvents(s),s.turn);expect(pages.length).toBeGreaterThan(0);expect(JSON.stringify(pages)).not.toContain('Enemy hidden');
  combatPlayback(getVisibleEvents(s),s.turn);expect(s).toEqual(before);
 });
 it('rejects old or illegal replays, with explicit comparison results instead of silent skipping',()=>{
  let s=fresh();s=advancePhase(s).state;const record=exportReplay(s);expect(replayMission(companyAssault,record)).toEqual(s);
  const old={...record,version:1};delete old.rules_version;expect(()=>replayMission(companyAssault,old)).toThrow('version mismatch');
  const bad={...record,operations:[{op:'submitCommand',command:{type:'MOVE',unit_id:'s11',target_id:'r1c1'}}]};
  expect(()=>replayMission(companyAssault,bad)).toThrow('operation 1 rejected');expect(compareReplay(companyAssault,bad).rejected).toBe(1);
 });
});
