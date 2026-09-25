import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,submitCommand,getPlayerView} from '../src/sim/company/engine.js';
import {orderReason,commandOptions} from '../src/sim/company/actions.js';
import {combatExposure} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {fireMarkers} from '../src/ui/fireMarkers.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'wp');s.units.s11.location='r1c1';s.units.s11.assets.wp=1;
 s.units.enemy={...structuredClone(s.units.s12),id:'enemy',name:'Defender',faction:'enemy',location:'r1c1',pinned:true};s.knowledge.spotted.enemy={id:'enemy'};
 s.impulse={id:'wp-test',hq:'general',commands:4,spent:0};return s;
};
const command={type:'WP_ATTACK',unit_id:'s11',issuer_id:'general',target_id:'enemy'};
function stack(s,success){
 const all=Object.values(cards),misses=all.filter(c=>!c.grenade).map(c=>c.id),ids=success?[all.find(c=>c.grenade).id,misses[0]]:misses.slice(0,2);
 s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];
}
describe('Offensive WP asset',()=>{
 it('offers a targeted same-card order and consumes one asset for a normal two-card attempt',()=>{
  const s=fresh();stack(s,true);const before=s.deck.draws,copy=structuredClone(s);
  expect(commandOptions(s,s.units.s11,'general').find(c=>c.type==='WP_ATTACK')).toMatchObject({available:true,targeted:true});
  const r=submitCommand(s,command);expect(r.accepted).toBe(true);expect(r.state).toEqual(submitCommand(copy,command).state);
  expect(r.state.deck.draws-before).toBe(2);expect(r.state.units.s11.assets.wp).toBe(0);
  expect(r.state.markers.find(m=>m.weapon==='WP')).toMatchObject({value:-4,target:'enemy'});
  expect(combatExposure(r.state,r.state.units.enemy).strongest.value).toBe(-4);
  expect(r.state.locations.r1c1).toMatchObject({smoke:true,smoke_value:1});
  expect(orderReason(r.state,{...command,type:'GRENADE'})).toContain('already attempted');
 });
 it('creates screening and a miss marker without a damaging WP marker after failure',()=>{
  const s=fresh();stack(s,false);const after=submitCommand(s,command).state;
  expect(after.markers.some(m=>m.type==='GRENADE_MISS')).toBe(true);expect(after.markers.some(m=>m.weapon==='WP')).toBe(false);
  expect(after.locations.r1c1).toMatchObject({smoke:true,smoke_value:1});expect(after.units.s11.assets.wp).toBe(0);
  const v=getPlayerView(after);expect(fireMarkers(v,v.locations.find(l=>l.id==='r1c1')).some(m=>m.label==='SMOKE +1')).toBe(true);
 });
 it('does not replace stronger existing HC screening with weaker WP screening',()=>{
  const s=fresh();s.locations.r1c1.smoke=true;s.locations.r1c1.smoke_value=2;stack(s,false);
  expect(submitCommand(s,command).state.locations.r1c1.smoke_value).toBe(2);
 });
 it('rejects ranged or unavailable WP attacks without consuming a command, asset or draw',()=>{
  const s=fresh();s.units.enemy.location='r2c1';const before=structuredClone(s);
  expect(submitCommand(s,command).accepted).toBe(false);expect(s).toEqual(before);
  s.units.enemy.location='r1c1';s.units.s11.assets.wp=0;expect(orderReason(s,command)).toContain('No WP');
 });
});
