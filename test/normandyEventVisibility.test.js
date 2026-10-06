import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,getPlayerView,getVisibleEvents,advancePhase,selectHQ,submitCommand,resolveCombat,abortMission,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {cards} from '../src/sim/company/core.js';
import {resolveMissionContact} from '../src/sim/company/missionContacts.js';
import {terrainMarkers} from '../src/ui/terrainMarkers.js';
import {hqEventExplanation} from '../src/ui/hqEventPresentation.js';
const candidate={...trevieres,readiness:{playable:true}};
const fresh=()=>{const s=createMission(candidate,'counter-visibility');s.turn=3;for(const c of Object.values(s.contacts))c.resolved=true;s.units.s11.location='r1c1';return s;};
const trigger=s=>{s.deck.order=[Object.values(cards).find(c=>c.hq).id,Object.values(cards).find(c=>c.random[8]===9).id,...s.deck.order];return resolveNormandyEvent(s,'enemy');};
const stock=(s,type,count)=>{for(let i=0;i<count;i++)s.contacts[`${type}${i}`]={id:`${type}${i}`,type,location:'r3c4',resolved:false};};
describe('counterattack markers and player explanations',()=>{
 it('places a question-side marker even after all original contacts have been resolved',()=>{
  const s=fresh();const e=trigger(s);expect(e.placements).toEqual(['r1c1']);
  const pc=Object.values(s.contacts).find(c=>c.counterattack);expect(pc).toBeDefined();expect(pc.type).toMatch(/[ABC]/);
  expect(getPlayerView(s).contacts.find(c=>c.id===pc.id).type).toBe('?');
  expect(getVisibleEvents(s).some(e=>e.type==='RANDOM_SELECTION'&&e.text.includes('remaining PC'))).toBe(false);
  expect(s.counterattack_ends_after).toBe(5);
 });
 it('marks each occupied battlefield card once and excludes staging',()=>{
  const s=fresh();s.units.s21.location='r1c1';s.units.s31.location='r2c2';trigger(s);
  expect(Object.values(s.contacts).filter(c=>c.counterattack).map(c=>c.location)).toEqual(['r1c1','r2c2']);
 });
 it('respects finite stock and makes no extra marker when the pool is exhausted',()=>{
  const s=fresh();for(const t of ['A','B','C'])stock(s,t,16);trigger(s);
  expect(Object.values(s.contacts).filter(c=>c.counterattack)).toHaveLength(0);expect(s.enemy_tactics).toBe('offensive_assault');
 });
 it('reveals overlapping contacts and retains the higher original A against a new C',()=>{
  const s=fresh();stock(s,'A',16);stock(s,'B',16);s.contacts.A0.location='r1c1';trigger(s);
  const unresolved=Object.values(s.contacts).filter(c=>c.location==='r1c1'&&!c.resolved);
  expect(unresolved).toHaveLength(1);expect(unresolved[0]).toMatchObject({type:'A',revealed:true});
  expect(Object.values(s.contacts).find(c=>c.counterattack)).toMatchObject({type:'C',resolved:true,removed_by_event:true});
 });
 it('retains a higher new A and its alternate-package flag against an original B',()=>{
  const s=fresh();stock(s,'B',16);stock(s,'C',16);s.contacts.B0.location='r1c1';trigger(s);
  expect(Object.values(s.contacts).filter(c=>c.location==='r1c1'&&!c.resolved)).toEqual([expect.objectContaining({type:'A',revealed:true,counterattack:true})]);
 });
 it('reveals question-side markers together on entering evaluation, including vacated cards',()=>{
  let s=fresh();trigger(s);const pc=Object.values(s.contacts).find(c=>c.counterattack);s.units.s11.location='r0c1';s.phase='FIRE_MISSIONS';s.impulse=null;
  s=advancePhase(s).state;expect(s.phase).toBe('CONTACTS');expect(getPlayerView(s).contacts.find(c=>c.id===pc.id).type).toBe(pc.type);
 });
 it('ends the three-turn counterattack at the start of turn six without changing the sequence',()=>{
  let s=fresh();trigger(s);for(const turn of [3,4,5]){s.turn=turn;s.phase='CLEANUP';s.impulse=null;s=advancePhase(s).state;expect(s.phase).toBe('FRIENDLY_EVENTS');expect(s.enemy_tactics).toBe(turn===5?'deliberate_defense':'offensive_assault');}
  expect(s.counterattack_ends_after).toBeNull();
 });
 it('uses every alternate A chart branch and leaves the ordinary A chart intact',()=>{
  for(const [roll,kind]of [[1,'SPOTTER'],[2,'SPOTTER'],[3,'SQUAD'],[4,'LMG']]){
   const s=createMission(candidate,`alternate-A-${roll}`);s.units.s11.location='r1c2';s.activity='NO_CONTACT';
   const pc=s.contacts.pc_r1c2;pc.type='A';pc.counterattack=true;
   s.deck.order.unshift(Object.values(cards).find(c=>c.id!==51&&c.random[2]===roll).id);
   for(const l of Object.values(s.locations))if(l.row>0){l.known=true;l.borders={N:'light',S:'light',E:'light',W:'light'};l.elevation=1;}
   resolveMissionContact(s,pc);expect(Object.values(s.units).filter(u=>u.faction==='enemy').map(u=>u.kind)).toEqual([kind]);
   expect(s.mission_contacts.tables.A).toEqual(trevieres.package_tables.A);
  }
 });
 it('strictly replays a real turn-three counterattack, including concealed placement and evaluation',()=>{
  let s=createMission(candidate,'counter-network-1'),guard=0,sawQuestion=false;
  while(s.turn<4&&s.status==='ACTIVE'&&guard++<300){
   const v=getPlayerView(s,'friendly',s.impulse?.hq==='general'?'co':s.impulse?.hq);
   sawQuestion ||= v.contacts.some(c=>c.type==='?');
   if(v.combat_resolution?.status==='PENDING'){s=resolveCombat(s,v.combat_resolution.id).state;continue;}
   if(!v.impulse&&v.eligible_hqs.length){s=selectHQ(s,v.eligible_hqs[0]).state;continue;}
   const u=v.units.find(u=>u.id==='s11'),move=u.options.find(o=>o.type==='MOVE'&&o.available),target=move?.targets.find(t=>!t.reason&&t.id==='r1c1');
   if(v.impulse&&u.location==='r0c1'&&target){s=submitCommand(s,{type:'MOVE',unit_id:u.id,issuer_id:v.impulse.hq==='general'?'co':v.impulse.hq,target_id:target.id}).state;continue;}
   s=advancePhase(s,v.pending_event?{eventChoice:{ammo_type:'MG',location:'r1c1'}}:{}).state;
  }
  expect(sawQuestion).toBe(true);expect(s.events.find(e=>e.code==='COUNTER_ATTACK')).toMatchObject({turn:3,placements:['r1c1'],counterattack_ends_after:5});
  s=abortMission(s).state;expect(replayMission(candidate,exportReplay(s))).toEqual(s);
 });
 it('renders multiple public contact markers on one card',()=>{
  const html=terrainMarkers({id:'r1c1'},[{type:'?'},{type:'B'}]);expect(html.match(/potential-contact-counter/g)).toHaveLength(2);expect(html).toContain('Potential contact unknown letter');
 });
 it('explains every event code with no hidden affected unit or location',()=>{
  const codes=['SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','RESUPPLY','EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','FALL_BACK','COUNTER_ATTACK'];
  for(const code of codes){const text=hqEventExplanation({code,turn:3,lead:1});expect(text.length).toBeGreaterThan(60);expect(text).not.toBe(code);}
  expect(hqEventExplanation({code:'COUNTER_ATTACK',turn:3})).toContain('through turn 5, ending at the start of turn 6');
  expect(hqEventExplanation({code:'RESUPPLY',ammo_type:'MTR',location:'r1c2'},()=>'<Card>')).toContain('Four MTR ammunition');
  expect(hqEventExplanation({type:'HQ_EVENT_NONE',text:'No event on turn one.'})).toBe('No event on turn one.');
 });
});
