import {describe,it,expect} from 'vitest';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {createMission,getPlayerView,advancePhase,endTurn,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {applyPatrolEvent,finishPatrolEvents,patrolHoldReason,expandPatrolCard} from '../src/sim/company/patrolEvents.js';
import {cards,emit} from '../src/sim/company/core.js';
import {hqEventExplanation} from '../src/ui/hqEventPresentation.js';
import {createCampaignRoster,startStandaloneRoster,applyMissionDebrief} from '../src/sim/company/campaignRoster.js';
const candidate={...stGeorges,readiness:{playable:true}};
const fresh=()=>createMission(candidate,'m3-events',{},null,{mission_instance_id:'m3-events-instance'});
const card=(sides,result)=>Object.values(cards).find(c=>c.random[sides-2]===result).id;
function eventStack(s,roll){s.deck.order=[Object.values(cards).find(c=>c.hq).id,card(10,roll),...s.deck.order];}
describe('St. Georges authored HQ event tables',()=>{
 for(const side of ['friendly','enemy'])for(const [period,turn]of [['early',2],['late',7]])for(let roll=1;roll<=10;roll++)it(`${side} ${period} slot ${roll}`,()=>{
  const s=fresh();s.turn=turn;eventStack(s,roll);const e=resolveNormandyEvent(s,side);
  expect(e.code).toBe(stGeorges.rules[`${side}_event_tables`][period][roll-1]);expect(hqEventExplanation(e)).not.toMatch(/No higher headquarters event/);
  expect(s.enemy_tactics).toBe('deliberate_defense');expect(s.counterattack_ends_after).toBeFalsy();
 });
 it('skips events on turn one without drawing',()=>{const s=fresh(),count=s.deck.draws;resolveNormandyEvent(s,'friendly');expect(s.deck.draws).toBe(count);expect(s.hq_events).toHaveLength(0);});
 it('leaves the state of events unchanged after a no-event check',()=>{const s=fresh();s.turn=2;s.deck.order=[Object.values(cards).find(c=>!c.hq&&c.id!==51).id];resolveNormandyEvent(s,'friendly');expect(s.hq_events).toHaveLength(0);expect(s.events.at(-1).type).toBe('HQ_EVENT_NONE');});
});
describe('St. Georges patrol event effects',()=>{
 it('uses a separate M3 roster slot, preserves accepted slots and rejects intermediate debriefs',()=>{
  const key=stGeorges.rules.rosterKey,data=new Map([['platoon-normandy-campaign','accepted-M1'],['platoon-normandy-cerisy-standalone','accepted-M2']]);
  const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(storage.fail&&k===key)throw new Error('quota');data.set(k,v);}};
  startStandaloneRoster(storage,createCampaignRoster('M3-company',stGeorges),key);const original=data.get(key);storage.fail=true;
  expect(()=>startStandaloneRoster(storage,createCampaignRoster('another-M3',stGeorges),key)).toThrow('quota');expect(data.get(key)).toBe(original);
  expect(data.get('platoon-normandy-campaign')).toBe('accepted-M1');expect(data.get('platoon-normandy-cerisy-standalone')).toBe('accepted-M2');
  const s=fresh();s.status='PATROL_COMPLETE';expect(()=>applyMissionDebrief(JSON.parse(original),s)).toThrow('terminal');
 });
 it.each([1,2,3,4,5,6,7,8])('moves the lost formation in direction %i without consuming a command',roll=>{
  const s=fresh();s.turn=2;for(const u of Object.values(s.units))if(u.platoon===1&&u.id!=='s11')u.removed='fixture';
  const u=s.units.s11;u.location='r3c3';u.cover=null;s.deck.order=[card(8,roll),...s.deck.order];
  const expected=[[4,3],[4,4],[3,4],[2,4],[2,3],[2,2],[3,2],[4,2]][roll-1];applyPatrolEvent(s,'friendly','LOST',{});
  expect(u.location).toBe(`r${expected[0]}c${expected[1]}`);expect(u.exposed).toBe(true);expect(s.impulse).toBe(null);
 });
 it('expands through Row 5 with an A contact, retaining the original boundaries',()=>{
  const s=fresh(),boundaries=structuredClone(s.boundaries);const l=expandPatrolCard(s,5,1);expect(l.outside_boundary).toBe(true);
  expect(Object.values(s.contacts).find(pc=>pc.location===l.id)).toMatchObject({type:'A',resolved:false});expect(s.boundaries).toEqual(boundaries);
 });
 it('does not add a contact behind Row 1 and safely handles exhausted terrain',()=>{
  const s=fresh(),l=expandPatrolCard(s,0,1);expect(Object.values(s.contacts).some(pc=>pc.location===l.id)).toBe(false);
  s.terrain_deck=[];expect(expandPatrolCard(s,5,99)).toBe(null);expect(s.locations.r5c99).toBeUndefined();
 });
 it('allows contact cards and friendly-occupied cards during Hold up',()=>{
  const s=fresh();applyPatrolEvent(s,'friendly','HOLD_PATROL',{});
  expect(patrolHoldReason(s,'r2c1')).toBe(null);expect(patrolHoldReason(s,'r1c1')).toBe(null);
  expect(patrolHoldReason(s,'r2c3')).toMatch(/Hold up/);expect(patrolHoldReason(s,'r1c5')).toBe(null);
 });
 it('does not expose an unspotted enemy through Hold up previews',()=>{
  const s=fresh();s.patrol_hold=true;s.units.hidden={id:'hidden',faction:'enemy',location:'r2c3',steps:[{}],removed:null};
  const reason=patrolHoldReason(s,'r2c3');delete s.units.hidden;expect(patrolHoldReason(s,'r2c3')).toBe(reason);
 });
 it('adds only temporary rain and does not expend mortar missions',()=>{
  const s=fresh();s.visibility.weather=1;const inventory=structuredClone(s.support_inventory);
  applyPatrolEvent(s,'friendly','RAIN',{});applyPatrolEvent(s,'friendly','NO_MORTAR',{});
  expect(s.visibility.weather).toBe(3);expect(s.support_unavailable).toContain('mortar');expect(s.support_inventory).toEqual(inventory);
  finishPatrolEvents(s);expect(s.visibility.weather).toBe(1);expect(s.patrol_hold).toBe(false);
 });
 it('awards an Advance Route obligation once when a patrol unit moves closer',()=>{
  const s=fresh();s.turn=2;const e={side:'friendly',code:'ADVANCE_ROUTE',turn:2};s.hq_events=[e];applyPatrolEvent(s,'friendly',e.code,e);
  const u=s.units.s11;u.location='r2c1';emit(s,'UNIT_MOVED','advance',{actor:u.id,from:'r1c1',target:u.location,faction:'friendly'});
  finishPatrolEvents(s);finishPatrolEvents(s);expect(e.completed).toBe(true);expect(s.achievements).toHaveLength(1);expect(s.achievements[0]).toMatchObject({points:1,platoon:1});
 });
 it('ignores completed routes, sideways moves and fixed defenders for advance XP',()=>{
  const s=fresh();s.turn=2;const e={side:'friendly',code:'ADVANCE_ROUTE',turn:2};s.hq_events=[e];applyPatrolEvent(s,'friendly',e.code,e);
  emit(s,'UNIT_MOVED','fixed retreat',{actor:'s21',from:'r1c2',target:'r2c1',faction:'friendly'});finishPatrolEvents(s);expect(e.completed).toBeFalsy();expect(s.achievements).toEqual([]);
  s.patrol.visited=[...s.patrol.plan.route];const done={};applyPatrolEvent(s,'friendly','ADVANCE_ROUTE',done);expect(done).toMatchObject({ignored:true,waypoint:null});
 });
 it('replaces only unresolved Row 4 PCs without exposing their letters',()=>{
  const s=fresh();s.contacts.pc_r4c1.resolved=true;const original=structuredClone(s.contacts.pc_r3c1),old=s.contacts.pc_r4c2;
  applyPatrolEvent(s,'enemy','SHIFTING_LINES',{});expect(old.resolved).toBe(true);expect(s.contacts.pc_r3c1).toEqual(original);
  const view=getPlayerView(s);expect(view.contacts.filter(pc=>!pc.resolved&&s.locations[pc.location].row===4)).toHaveLength(4);
  expect(view.contacts.filter(pc=>!pc.resolved&&s.locations[pc.location].row===4).every(pc=>pc.type==='?')).toBe(true);
  for(const type of ['A','B','C'])expect(Object.values(s.contacts).filter(pc=>!pc.resolved&&pc.type===type).length).toBeLessThanOrEqual(16);
  expect(s.enemy_tactics).toBe('deliberate_defense');
 });
 it('never includes a concealed enemy position in an event explanation',()=>{
  const s=fresh();s.turn=2;eventStack(s,10);resolveNormandyEvent(s,'enemy');const event=s.events.findLast(e=>e.type==='HQ_EVENT');
  expect(Object.keys(event)).not.toContain('actor');expect(Object.keys(event)).not.toContain('location');expect(hqEventExplanation(event)).toMatch(/concealed/);
 });
 it('replays actual HQ-event phase stepping exactly from an unmodified starting record',()=>{
  let s=endTurn(fresh()).state;expect(s.turn).toBe(2);s=advancePhase(s).state;
  expect(replayMission(candidate,exportReplay(s))).toEqual(s);
 });
});
