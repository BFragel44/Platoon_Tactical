import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {orderReason,commandOptions} from '../src/sim/company/actions.js';
import {movementReason} from '../src/sim/company/battlefield.js';
const fresh=()=>{const s=createMission({...keepUpTheFire,readiness:{playable:true}},'transport');s.impulse={id:'test',hq:'general',commands:0,spent:6};return s;};
describe('Mission transport and free unloading',()=>{
 it('blocks overloaded movement and permits command-free unloading outside an impulse',()=>{
  const s=fresh(),u=s.units.co;u.assets={wp:6};expect(movementReason(s,u,'r0c3')).toContain('six assets');
  s.impulse=null;u.pinned=true;u.cohesion='P';const rng=structuredClone(s.rng),deck=structuredClone(s.deck);
  const c={type:'DROP_LOAD',unit_id:'co'},r=submitCommand(s,c);expect(r.accepted).toBe(true);
  expect(r.state.units.co.assets).toEqual({});expect(r.state.units.co.radios).toEqual([]);expect(r.state.units.co.exposed).toBe(false);
  expect(r.state.rng).toEqual(rng);expect(r.state.deck).toEqual(deck);expect(r.state.impulse).toBeNull();
  expect(r.state).toEqual(submitCommand(structuredClone(s),c).state);expect(r.state.replay.at(-1)).toEqual({op:'submitCommand',command:c});
 });
 it('retains casualty area on free unloading and charges no command',()=>{
  const s=fresh(),u=s.units.co;u.cover='cover';s.casualties.push({id:'c',carrier:u.id,location:u.location,cover:null});
  expect(commandOptions(s,u,'general').find(o=>o.type==='DROP_CASUALTY').cost).toBe(0);
  const r=submitCommand(s,{type:'DROP_CASUALTY',unit_id:u.id});expect(r.accepted).toBe(true);expect(r.state.impulse).toEqual(s.impulse);
  expect(r.state.casualties[0]).toMatchObject({carrier:null,cover:'cover'});
 });
 it('rejects pickup across cover areas and above six assets per step',()=>{
  const s=fresh(),u=s.units.co;s.impulse.commands=2;s.impulse.spent=0;
  s.assets.push({id:'a',type:'EQUIPMENT',key:'wp',quantity:6,location:u.location,cover:'other',faction:'friendly'});
  const c={type:'PICKUP_RADIO',unit_id:'co',issuer_id:'general',target_id:'a'};
  expect(orderReason(s,c)).toContain('available item');s.assets[0].cover=null;
  expect(orderReason(s,c)).toContain('six assets');s.assets[0].quantity=5;expect(orderReason(s,c)).toBeNull();
 });
 it('blocks overloaded within-card movement and leaves frozen fire unchanged while unloading',()=>{
  const s=fresh(),u=s.units.co;s.impulse.commands=2;s.impulse.spent=0;u.assets={wp:7};
  expect(orderReason(s,{type:'ENTER_COVER',unit_id:u.id,issuer_id:'general',target_id:'open'})).toContain('capacity');
  s.phase='COMBAT_EFFECTS';s.pending_combat=[{id:'frozen',ncm:2}];s.fire=[{source:'co',target:'r1c1'}];
  const r=submitCommand(s,{type:'DROP_LOAD',unit_id:u.id});expect(r.state.pending_combat).toEqual(s.pending_combat);expect(r.state.fire).toEqual(s.fire);
 });
});
