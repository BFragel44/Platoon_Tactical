import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,advancePhase,getVisibleEvents} from '../src/sim/company/engine.js';
import {availableCounters,contactPlacements,packageAvailable,resolveMissionContact} from '../src/sim/company/missionContacts.js';
import {splitTeam} from '../src/sim/company/actions.js';
import {refresh} from '../src/sim/company/battlefield.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {cards} from '../src/sim/company/core.js';

const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'contact-fixture');
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',building:false,borders:borders(DIRECTIONS),elevation:1,covers:[],known:true});
 s.units.s11.location='r1c2';s.activity='NO_CONTACT';s.phase='CONTACTS';s.impulse=null;
 const pc=s.contacts.pc_r1c2;pc.type='A';return s;
};
const enemy=(s,id,location)=>s.units[id]={...structuredClone(s.units.s11),id,faction:'enemy',location,fire:null,removed:null};
describe('Mission package placement',()=>{
 it('uses the three front rays, excluding lateral and bent paths',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2,profile=s.mission_contacts.counters.find(c=>c.kind==='LMG');
  expect(contactPlacements(s,pc,profile).map(l=>l.id)).toEqual(['r2c1','r2c2','r2c3','r3c2','r3c4']);
 });
 it('excludes occupied enemy positions, enemy PDFs and intervening units',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2,profile=s.mission_contacts.counters.find(c=>c.kind==='LMG');
  enemy(s,'existing','r4c3');s.fire=[{source:'existing',origin:'r4c3',target:'r1c3',value:0}];
  enemy(s,'blocking','r2c2');
  const ids=contactPlacements(s,pc,profile).map(l=>l.id);
  expect(ids).not.toContain('r2c3');expect(ids).not.toContain('r2c2');expect(ids).not.toContain('r3c2');
  s.units.s12.location='r3c4';expect(contactPlacements(s,pc,profile).map(l=>l.id)).not.toContain('r3c4');
 });
 it('uses triggering-unit LOS for maneuvering units and outward LOS for spotters',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2,profile=s.mission_contacts.counters.find(c=>c.kind==='SQUAD');
  s.locations[pc.location].smoke=true;
  expect(contactPlacements(s,pc,profile,[],3,true,true)).toEqual([]);
  expect(contactPlacements(s,pc,profile,[],3,true,false).length).toBeGreaterThan(0);
 });
 it('returns an eliminated original counter to the pool while its LAT survives',()=>{
  const s=fresh(),u=enemy(s,'original','r2c2');u.counter_id='gr1';
  const child=splitTeam(s,u,'F',u.steps.pop());u.steps=[];u.removed='BROKEN';
  expect(child.counter_id).toBeNull();expect(child.parent_counter_id).toBe('gr1');
  expect(availableCounters(s,'SQUAD').map(c=>c.id)).toContain('gr1');
 });
 it('discards an exhausted contact without partial deployment or fabricated enemies',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2;
  s.mission_contacts.tables.A=Array(10).fill(6);s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='gr1');
  const before=structuredClone(s);expect(packageAvailable(s,pc,s.mission_contacts.packages[6])).toBe(false);expect(s).toEqual(before);
  resolveMissionContact(s,pc);
  expect(Object.keys(s.units)).toEqual(Object.keys(before.units));expect(s.deck).toEqual(before.deck);
  expect(pc.resolved).toBe(true);expect(s.events.at(-1).type).toBe('CONTACT_EXHAUSTED');
 });
 it('places a complete strongpoint on distinct cards and reproduces the draws and events',()=>{
  const s=fresh();s.mission_contacts.tables.A=Array(10).fill(6);const copy=structuredClone(s);
  resolveMissionContact(s,s.contacts.pc_r1c2);resolveMissionContact(copy,copy.contacts.pc_r1c2);expect(s).toEqual(copy);
  const enemies=Object.values(s.units).filter(u=>u.faction==='enemy');
  expect(enemies).toHaveLength(2);expect(new Set(enemies.map(u=>u.location)).size).toBe(2);
  expect(s.events.every((e,i)=>e.sequence===i+1&&e.id===`event_${i+1}`)).toBe(true);
  expect(getVisibleEvents(s).some(e=>e.type==='PACKAGE_REJECTED'||e.type==='CONTACT_DIRECTION_REJECTED')).toBe(false);
 });
 it('holds maneuvering-package fire until cleanup despite repeated refreshes',()=>{
  const s=fresh();s.mission_contacts.tables.A=Array(10).fill(7);resolveMissionContact(s,s.contacts.pc_r1c2);
  const u=Object.values(s.units).find(u=>u.faction==='enemy');expect(u).toBeTruthy();
  refresh(s);refresh(s);expect(u.fire).toBeNull();expect(s.fire.some(f=>f.source===u.id)).toBe(false);
  s.phase='CLEANUP';const after=advancePhase(s).state;
  expect(after.units[u.id].hold_fire_until_cleanup).toBeUndefined();
 });
 it('redraws an off-map direction when map expansion is disabled',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c1;s.mission_rules.contactExpansion=false;pc.type='A';s.units.s11.location=pc.location;
  s.mission_contacts.tables.A=Array(10).fill(4);s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='lmg1');
  const invalid=Object.values(cards).find(c=>c.random[3]===1);
  const valid=Object.values(cards).find(c=>c.random[3]===2&&c.id!==invalid.id);
  const packageCard=Object.values(cards).find(c=>c.id!==invalid.id&&c.id!==valid.id);
  const ids=[packageCard.id,invalid.id,valid.id];s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];
  const before=s.deck.draws;resolveMissionContact(s,pc);
  expect(s.deck.draws-before).toBe(3);
  expect(s.events.filter(e=>e.type==='CONTACT_DIRECTION_REJECTED')).toHaveLength(1);
  expect(Object.values(s.units).find(u=>u.faction==='enemy').location).toBe('r3c1');
 });
});

describe('Enemy opening-fire contact removal, 8.4.4',()=>{
 it('removes intervening same-elevation PCs without evaluating them',()=>{
  const s=fresh(),u=enemy(s,'source','r3c2');u.range=3;u.fire='r1c2';const before=s.deck.draws;
  refresh(s);expect(s.contacts.pc_r2c2).toMatchObject({resolved:true,removal_reason:'ENEMY_FIRE_PATH'});
  expect(s.contacts.pc_r1c2.resolved).toBe(false);expect(s.deck.draws).toBe(before);
  expect(getVisibleEvents(s).find(e=>e.type==='CONTACT_REMOVED')).not.toHaveProperty('actor');
 });
 it('keeps PCs below an elevated firing source and beyond its affected card',()=>{
  const s=fresh(),u=enemy(s,'source','r3c2');u.range=3;u.fire='r1c2';s.locations.r3c2.elevation=2;
  refresh(s);expect(s.contacts.pc_r2c2.resolved).toBe(false);expect(s.contacts.pc_r4c2.resolved).toBe(false);
 });
});

describe('Fortification contact placement exception',()=>{
 it('allows a firing bunker on a U.S.-occupied card, but rejects an ordinary HMG there',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2,profile=s.mission_contacts.counters.find(c=>c.kind==='HMG');s.units.s12.location='r3c2';const before=structuredClone(s);
  expect(contactPlacements(s,pc,profile,[],profile.range,false,false,'Bunker').map(l=>l.id)).toContain('r3c2');
  expect(contactPlacements(s,pc,profile).map(l=>l.id)).not.toContain('r3c2');expect(s).toEqual(before);
 });
 it('does not waive intervening enemy restrictions for a fortified package',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2,profile=s.mission_contacts.counters.find(c=>c.kind==='HMG');enemy(s,'blocker','r2c2');
  expect(contactPlacements(s,pc,profile,[],profile.range,false,false,'Pillbox').map(l=>l.id)).not.toContain('r3c2');
 });
});
