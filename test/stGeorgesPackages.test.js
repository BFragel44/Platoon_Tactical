import {describe,it,expect} from 'vitest';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {createMission,previewMissionSetup} from '../src/sim/company/engine.js';
import {placePackage,packageAvailable} from '../src/sim/company/missionContacts.js';
import {coverOf,distance} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {borders} from '../src/sim/company/terrain.js';
const candidate={...stGeorges,readiness:{playable:true}};
const fresh=()=>{const s=createMission(candidate,'package-validation');for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,borders:borders(),elevation:1});s.units.s11.location='r2c1';s.units.s11.cover=null;return s;};
const enemies=s=>Object.values(s.units).filter(u=>u.faction==='enemy'&&!u.removed);
const stack=(s,n,sides)=>{const card=Object.values(cards).find(c=>c.random[sides-2]===n);s.deck.order=[card.id,...s.deck.order];};
describe('St. Georges published package placement',()=>{
 for(let number=1;number<=12;number++)it(`places package ${number} using finite Veteran profiles`,()=>{
  const s=fresh(),pc=s.contacts.pc_r2c1,p=s.mission_contacts.packages[number];expect(packageAvailable(s,pc,p)).toBe(true);expect(placePackage(s,pc,p)).toBe(true);
  expect(enemies(s).every(u=>u.experience==='Veteran')).toBe(true);expect(new Set(enemies(s).map(u=>u.counter_id)).size).toBe(enemies(s).length);
  if(number===1)expect(s.locations[pc.location].mines).toBe(true);
  if([5,7,11].includes(number))expect(enemies(s).every(u=>!u.fire)).toBe(true);
  if([4,5,6,7,11].includes(number))expect(enemies(s).every(u=>s.knowledge.spotted[u.id])).toBe(true);
  if(number===12){expect(enemies(s)).toHaveLength(2);expect(new Set(enemies(s).map(u=>u.location)).size).toBe(1);expect(enemies(s).find(u=>u.kind==='MORTAR').ammo.MTR).toBe(6);}
 });
 for(const [index,value]of [[0,-4],[1,-3]])it(`uses incoming branch ${index} without an enemy observer`,()=>{const s=fresh();expect(placePackage(s,s.contacts.pc_r2c1,stGeorges.packages[2].alternatives[index])).toBe(true);expect(s.support[0].value).toBe(value);expect(enemies(s)).toHaveLength(0);});
 for(const number of [3,10])for(const roll of [1,3])it(`uses package ${number} point-blank/max branch ${roll}`,()=>{
  const s=fresh(),pc=s.contacts.pc_r2c1;stack(s,roll,10);expect(placePackage(s,pc,stGeorges.packages[number])).toBe(true);const u=enemies(s)[0];expect(u.location===pc.location).toBe(roll===1);expect(u.ammo.MG).toBe(number===3?6:8);
  if(number===10&&roll===1){expect(s.knowledge.spotted[u.id]).toBeTruthy();expect(u.fire).toBeNull();expect(coverOf(s,u).arc).toHaveLength(2);}
 });
 for(const roll of [1,3])it(`uses command-post close/max branch ${roll}`,()=>{const s=fresh();stack(s,roll,10);expect(placePackage(s,s.contacts.pc_r2c1,stGeorges.packages[8])).toBe(true);const squads=enemies(s).filter(u=>u.kind==='SQUAD');expect(squads).toHaveLength(2);if(roll===1)expect(squads.every(u=>distance(s.locations[u.location],s.locations.r2c1)===1)).toBe(true);const leader=enemies(s).find(u=>u.kind==='LEADER');expect(leader.assets.rifle_grenade).toBe(2);expect(squads.some(u=>u.location===leader.location)).toBe(true);});
 it('omits only the optional leader when its finite counter is already in play',()=>{const s=fresh(),profiles=stGeorges.enemy_counters.filter(u=>u.kind==='LEADER');for(const profile of profiles)s.units[profile.id]={...profile,id:profile.id,counter_id:profile.id,steps:[{}],faction:'enemy',location:'r1c5',cohesion:'GOOD'};expect(placePackage(s,s.contacts.pc_r2c1,stGeorges.packages[8])).toBe(true);expect(enemies(s).filter(u=>u.kind==='LEADER')).toHaveLength(profiles.length);});
 it('rejects unsupported illumination delivery during source validation',()=>{expect(()=>previewMissionSetup({...stGeorges,packages:{...stGeorges.packages,6:{...stGeorges.packages[6],illumination:'searchlight'}}},'invalid')).toThrow('Unsupported Normandy package 6 illumination');});
});
