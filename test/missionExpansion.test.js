import {scoreMission} from '../src/sim/company/missionFeatures.js';
import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission} from '../src/sim/company/engine.js';
import {expandContactRay} from '../src/sim/company/missionExpansion.js';
import {packageAvailable,resolveMissionContact} from '../src/sim/company/missionContacts.js';
import {movementReason} from '../src/sim/company/battlefield.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
const fresh=()=>{const s=createMission({...keepUpTheFire,readiness:{playable:true}},'expansion');for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',elevation:1,borders:borders(DIRECTIONS),covers:[],building:false});return s;};
const open=id=>({id,name:'Open Fields',terrain:'open',borders:borders(DIRECTIONS),protection:0,cover_draw:2,cover_limit:1,burst:0});
describe('Contact terrain expansion, 8.4.5',()=>{
 it('draws and stacks hills without action draws or RNG changes, once per missing card',()=>{
  const s=fresh(),rng=structuredClone(s.rng),draws=s.deck.draws;s.terrain_deck=[open('top'),{id:'hill',terrain:'hill'}];
  expandContactRay(s,s.locations.r4c2,0,1);expect(s.locations.r5c2).toMatchObject({elevation:2,terrain_card:'top',hills:['hill'],outside_boundary:true,known:true});
  expect(s.locations.r5c2.borders.N).toBe('dark');expect(s.rng).toEqual(rng);expect(s.deck.draws).toBe(draws);
  const before=structuredClone(s);expandContactRay(s,s.locations.r4c2,0,1);expect(s).toEqual(before);
 });
 it('does not leave a partial hill stack on deck exhaustion',()=>{
  const s=fresh();s.terrain_deck=[{id:'hill',terrain:'hill'}];const before=structuredClone(s);expandContactRay(s,s.locations.r4c2,0,1);expect(s).toEqual(before);
 });
 it('considers an off-map package without mutating state, then places it at maximum range',()=>{
  const s=fresh(),pc=s.contacts.pc_r4c2;pc.type='A';s.activity='NO_CONTACT';s.units.s11.location=pc.location;
  s.terrain_deck=Array.from({length:20},(_,i)=>open(`extra${i}`));s.mission_contacts.tables.A=Array(10).fill(4);
  s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='lmg1');const before=structuredClone(s);
  expect(packageAvailable(s,pc,s.mission_contacts.packages[4])).toBe(true);expect(s).toEqual(before);
  resolveMissionContact(s,pc);const u=Object.values(s.units).find(u=>u.faction==='enemy');expect(u).toBeDefined();expect(s.locations[u.location].row).toBe(6);
  expect(s.contacts[`pc_${u.location}`]).toBeUndefined();expect(movementReason(s,s.units.s11,'r5c2')).toMatch(/boundaries|adjacent/);
  const again=structuredClone(before);resolveMissionContact(again,again.contacts[pc.id]);expect(s).toEqual(again);
 });
 it('forbids friendly entry beyond the boundary even where terrain exists',()=>{
  const s=fresh();s.terrain_deck=[open('extra')];expandContactRay(s,s.locations.r4c2,0,1);s.units.s11.location='r4c2';
  expect(movementReason(s,s.units.s11,'r5c2')).toContain('Outside');
 });
});

it('keeps higher-HQ advance obligations tied to the original last row',()=>{
 const s=fresh();s.terrain_deck=[open('extra')];expandContactRay(s,s.locations.r4c2,0,1);
 s.phase='CLEANUP';s.hq_events=[{side:'friendly',turn:1,code:'ADVANCE',lead:4,completed:false}];
 s.events.push({type:'UNIT_MOVED',turn:1,actor:'s11',target:'r5c2'});scoreMission(s);
 expect(s.hq_events[0].completed).toBe(false);expect(s.achievements.some(a=>a.key==='event_1_ADVANCE')).toBe(false);
});
