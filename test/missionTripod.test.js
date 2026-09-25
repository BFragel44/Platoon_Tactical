import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {basicFireTargets,refresh,combatExposure,overheadAllowed} from '../src/sim/company/battlefield.js';
import {contactPlacements} from '../src/sim/company/missionContacts.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {fireExplanation} from '../src/ui/fireMarkers.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'tripod');
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',borders:borders(DIRECTIONS),elevation:1,covers:[],known:true});
 Object.assign(s.units.mg1,{location:'r1c2',tripod:true,range:3,vof:'A',mission_weapon:true});
 const target={...structuredClone(s.units.s11),id:'enemy',location:'r2c2',faction:'enemy'};s.units.enemy=target;s.knowledge.spotted.enemy={id:'enemy'};
 return s;
};
describe('Tripod grazing and overhead fire',()=>{
 it('exerts one source on every card to maximum range, including friendlies beyond the target',()=>{
  const s=fresh(),u=s.units.mg1;s.units.s11.location='r4c2';refresh(s);
  expect(s.fire.filter(f=>f.source===u.id).map(f=>f.target)).toEqual(['r2c2','r3c2','r4c2']);
  expect(combatExposure(s,s.units.s11).parts.crossfire).toBe(0);
  expect(combatExposure(s,s.units.s11).strongest.source_id).toBe(u.id);
 });
 it('does not open new grazing fire through its own side at the same elevation',()=>{
  const s=fresh();s.units.enemy.location='r3c2';s.units.s11.location='r2c2';refresh(s);
  expect(s.fire.some(f=>f.source==='mg1')).toBe(false);
 });
 it('fires over eligible lower intervening units without applying VOF to them',()=>{
  const s=fresh(),u=s.units.mg1;s.locations.r1c2.elevation=2;s.locations.r3c2.elevation=2;s.locations.r4c2.elevation=2;
  s.units.enemy.location='r3c2';s.units.s11.location='r2c2';refresh(s);
  expect(overheadAllowed(s,u,'r3c2','r2c2')).toBe(true);
  expect(s.fire.filter(f=>f.source===u.id).map(f=>f.target)).toEqual(['r3c2','r4c2']);
 });
 it('stops grazing when the slope reverses and at smoke',()=>{
  const s=fresh(),u=s.units.mg1;s.locations.r1c2.elevation=3;s.locations.r2c2.elevation=2;s.locations.r3c2.elevation=1;s.locations.r4c2.elevation=2;
  expect(basicFireTargets(s,u,'r2c2')).toEqual(['r2c2','r3c2']);
  s.locations.r2c2.smoke=true;expect(basicFireTargets(s,u,'r2c2')).toEqual(['r2c2']);
 });
 it('loses tripod fire when exposed and grazing capability when out of ammunition',()=>{
  const s=fresh(),u=s.units.mg1;u.exposed=true;expect(basicFireTargets(s,u,'r2c2')).toEqual([]);
  u.exposed=false;u.out_of_ammo=true;expect(basicFireTargets(s,u,'r2c2')).toEqual(['r2c2']);
 });
 it('permits a contact HMG to graze through U.S. troops but not its own same-level troops',()=>{
  const s=fresh(),pc=s.contacts.pc_r1c2,profile=s.mission_contacts.counters.find(c=>c.kind==='HMG');
  s.units.mg1.location='r0c2';s.units.s11.location=pc.location;s.units.enemy.location='r4c4';s.units.s12.location='r2c2';
  expect(contactPlacements(s,pc,profile).map(l=>l.id)).toContain('r3c2');
  s.units.s12.faction='enemy';expect(contactPlacements(s,pc,profile).map(l=>l.id)).not.toContain('r3c2');
  s.locations.r3c2.elevation=2;expect(contactPlacements(s,pc,profile).map(l=>l.id)).toContain('r3c2');
 });
 it('explains projected grazing fire without disclosing an unspotted source identity',()=>{
  const s=fresh();s.units.mg1.faction='enemy';s.units.enemy.faction='friendly';delete s.knowledge.spotted.enemy;
  s.units.s11.location='r3c2';refresh(s);const v=getPlayerView(s);
  const fire=v.fire.find(f=>f.origin==='r1c2'&&f.target==='r3c2');
  expect(fire.source).toBeNull();expect(fireExplanation(v,fire)).toContain('Tripod grazing fire');
  expect(fireExplanation(v,fire)).not.toContain(s.units.mg1.name);
 });
});
