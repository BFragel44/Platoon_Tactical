import {describe,it,expect} from 'vitest';
import {stGermain} from '../src/scenarios/stGermain.js';
import {createMission,previewMissionSetup} from '../src/sim/company/engine.js';
import {placePackage,packageAvailable} from '../src/sim/company/missionContacts.js';
import {coverOf,distance} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {borders} from '../src/sim/company/terrain.js';
const candidate={...stGermain,readiness:{playable:true}};
const fresh=()=>{const s=createMission(candidate,'package-validation');s.visibility.light=0;for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,borders:borders(),elevation:1});s.units.s11.location='r2c1';s.units.s11.cover=null;return s;};
const enemies=s=>Object.values(s.units).filter(u=>u.faction==='enemy'&&!u.removed);
const stack=(s,n,sides)=>{const card=Object.values(cards).find(c=>c.random[sides-2]===n);s.deck.order=[card.id,...s.deck.order];};
describe('St. Germain published package placement',()=>{
 // Placement-only harness uses daylight/flat original cards; night integration
 // is covered separately by the illumination and complete-run fixtures.
 for(const roll of [1,3,4,5])it(`places command-post R#5 boundary ${roll} with a shared Deep Bunker`,()=>{
  const s=fresh(),pc=s.contacts.pc_r2c1;stack(s,roll,5);
  expect(placePackage(s,pc,stGermain.packages[10])).toBe(true);
  const squad=enemies(s).find(u=>u.kind==='SQUAD'),leader=enemies(s).find(u=>u.kind==='LEADER');
  expect(squad.steps).toHaveLength(2);expect(leader.location).toBe(squad.location);expect(leader.cover).toBe(squad.cover);
  expect(coverOf(s,squad).type).toBe('Deep Bunker');expect(squad.fire).toBeNull();expect(leader.fire).toBeNull();
  expect(s.knowledge.spotted[squad.id]).toBeTruthy();expect(s.knowledge.spotted[leader.id]).toBeTruthy();
  expect(distance(s.locations[squad.location],s.locations[pc.location])).toBe(roll<=3?0:1);
 });
 it('rejects a mandatory command-post leader when all leader counters are exhausted',()=>{
  const s=fresh();s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.kind!=='LEADER');
  const before=structuredClone(s);expect(packageAvailable(s,s.contacts.pc_r2c1,stGermain.packages[10])).toBe(false);expect(s).toEqual(before);
 });
 it('keeps an accompanying leader in the actual building cover substituted for Foxholes',()=>{
  const s=fresh();expect(placePackage(s,s.contacts.pc_r2c1,stGermain.packages[8])).toBe(true);
  const leader=enemies(s).find(u=>u.kind==='LEADER'),squad=enemies(s).find(u=>u.kind==='SQUAD'&&u.location===leader.location);
  expect(leader.cover).toBe(squad.cover);expect(coverOf(s,leader).type).toMatch(/Building/);
 });
 for(let number=1;number<=12;number++)it(`places package ${number} using finite Veteran profiles`,()=>{
  const s=fresh(),pc=s.contacts.pc_r2c1,p=s.mission_contacts.packages[number];expect(packageAvailable(s,pc,p)).toBe(true);expect(placePackage(s,pc,p)).toBe(true);
  expect(enemies(s).every(u=>u.experience==='Veteran')).toBe(true);expect(new Set(enemies(s).map(u=>u.counter_id)).size).toBe(enemies(s).length);
  if(number===1)expect(s.locations[pc.location].mines).toBe(true);
  if([5,7,11].includes(number))expect(enemies(s).every(u=>!u.fire)).toBe(true);
  if([4,5,6,7,11].includes(number))expect(enemies(s).every(u=>s.knowledge.spotted[u.id])).toBe(true);
  if(number===12){expect(enemies(s)).toHaveLength(2);expect(new Set(enemies(s).map(u=>u.location)).size).toBe(1);expect(enemies(s).find(u=>u.kind==='MORTAR').ammo.MTR).toBe(6);}
 });
 for(const [index,value]of [[0,-4],[1,-3]])it(`uses incoming branch ${index} without an enemy observer`,()=>{const s=fresh();expect(placePackage(s,s.contacts.pc_r2c1,stGermain.packages[2].alternatives[index])).toBe(true);expect(s.support[0].value).toBe(value);expect(enemies(s)).toHaveLength(0);});
 for(const number of [3])for(const roll of [1,3])it(`uses package ${number} point-blank/max branch ${roll}`,()=>{
  const s=fresh(),pc=s.contacts.pc_r2c1;stack(s,roll,10);expect(placePackage(s,pc,stGermain.packages[number])).toBe(true);const u=enemies(s)[0];expect(u.location===pc.location).toBe(roll===1);expect(u.ammo.MG).toBe(number===3?6:8);

 });
 for(const roll of [1,3])it(`uses command-post close/max branch ${roll}`,()=>{const s=fresh();stack(s,roll,10);expect(placePackage(s,s.contacts.pc_r2c1,stGermain.packages[8])).toBe(true);const squads=enemies(s).filter(u=>u.kind==='SQUAD');expect(squads).toHaveLength(2);if(roll===1)expect(squads.every(u=>distance(s.locations[u.location],s.locations.r2c1)===1)).toBe(true);const leader=enemies(s).find(u=>u.kind==='LEADER');expect(leader.assets.rifle_grenade).toBe(2);expect(squads.some(u=>u.location===leader.location)).toBe(true);});
 it('omits only the optional leader when its finite counter is already in play',()=>{const s=fresh(),profiles=stGermain.enemy_counters.filter(u=>u.kind==='LEADER');for(const profile of profiles)s.units[profile.id]={...profile,id:profile.id,counter_id:profile.id,steps:[{}],faction:'enemy',location:'r1c5',cohesion:'GOOD'};expect(placePackage(s,s.contacts.pc_r2c1,stGermain.packages[8])).toBe(true);expect(enemies(s).filter(u=>u.kind==='LEADER')).toHaveLength(profiles.length);});
 it('rejects unsupported illumination delivery during source validation',()=>{expect(()=>previewMissionSetup({...stGermain,packages:{...stGermain.packages,6:{...stGermain.packages[6],illumination:'searchlight'}}},'invalid')).toThrow('Unsupported Normandy package 6 illumination');});
});
