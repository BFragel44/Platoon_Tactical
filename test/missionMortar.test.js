import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {createMission,submitCommand,getPlayerView,advancePhase} from '../src/sim/company/engine.js';
import {orderReason} from '../src/sim/company/actions.js';
import {combatExposure,refresh} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {fireMarkers,fireExplanation} from '../src/ui/fireMarkers.js';
const fresh=()=>{
 const s=createMission({...keepUpTheFire,readiness:{playable:true}},'mortar');
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',building:false,borders:borders(DIRECTIONS),elevation:1,covers:[],known:true});
 s.units.mortar1.location='r1c2';
 s.units.enemy={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r3c2',pinned:true};s.knowledge.spotted.enemy={id:'enemy'};
 s.impulse={id:'mortar-test',hq:'general',commands:6,spent:0};
 const ids=Object.values(cards).filter(c=>!c.grenade).slice(0,2).map(c=>c.id);s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];return s;
};
const command={type:'GRENADE',unit_id:'mortar1',issuer_id:'general',target_id:'enemy'};
describe('One-step mortar temporary PDF',()=>{
 it('a failed attempt places a visible direction without basic VOF and replays deterministically',()=>{
  const s=fresh(),r=submitCommand(s,command);expect(r.accepted).toBe(true);expect(r.state).toEqual(submitCommand(structuredClone(s),command).state);
  expect(r.state.units.mortar1.temporary_pdf).toEqual({origin:'r1c2',target:'r3c2'});
  expect(r.state.fire.some(f=>f.source==='mortar1')).toBe(false);
  const v=getPlayerView(r.state),pdf=v.fire.find(f=>f.source==='mortar1');expect(pdf.pdf_only).toBe(true);
  expect(fireExplanation(v,pdf)).toContain('temporary');
  expect(fireMarkers(v,v.locations.find(l=>l.id==='r3c2')).some(m=>m.label==='S')).toBe(false);
 });
 it('adds crossfire to another direction, without adding a VOF value',()=>{
  const s=submitCommand(fresh(),command).state;s.units.s11.location='r3c1';refresh(s);
  const e=combatExposure(s,s.units.enemy);expect(e.parts.crossfire).toBe(-1);expect(e.strongest.source_id).toBe('s11');
  delete s.units.mortar1.temporary_pdf;expect(combatExposure(s,s.units.enemy).parts.crossfire).toBe(0);
 });
 it('removes temporary directions at cleanup and when the firing formation leaves',()=>{
  const s=submitCommand(fresh(),command).state;s.phase='CLEANUP';
  expect(advancePhase(s).state.units.mortar1.temporary_pdf).toBeUndefined();
  s.units.mortar1.location='r1c1';refresh(s);expect(s.units.mortar1.temporary_pdf).toBeUndefined();
 });
 it('fires over friendly troops, but not spotted intervening opponents',()=>{
  const s=fresh();s.units.s11.location='r2c2';expect(orderReason(s,command)).toBeFalsy();
  s.units.s11.faction='enemy';s.knowledge.spotted.s11={id:'s11'};expect(orderReason(s,command)).toContain('intervening');
 });
 it('rejects exposed fire, woods, point blank and departure from an established PDF',()=>{
  const s=fresh();s.units.mortar1.exposed=true;expect(orderReason(s,command)).toContain('Mortar teams');
  s.units.mortar1.exposed=false;s.locations.r1c2.terrain='woods';expect(orderReason(s,command)).toContain('Mortar teams');
  s.locations.r1c2.terrain='open';s.units.enemy.location='r1c2';expect(orderReason(s,command)).toContain('Mortar teams');
  s.units.enemy.location='r3c2';s.units.s11.location='r1c2';s.units.s11.fire='r1c3';expect(orderReason(s,command)).toContain('existing direction');
 });
});
