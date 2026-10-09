import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {hill192} from '../src/scenarios/hill192.js';
import {stGermain} from '../src/scenarios/stGermain.js';
import {createMission,submitCommand,exportReplay,replayMission,advancePhase,selectHQ} from '../src/sim/company/engine.js';
import {orderReason,ACTIONS} from '../src/sim/company/actions.js';
function ready(scenario=companyAssault){const s=createMission({...scenario,readiness:{playable:true}},'detach');s.phase='GENERAL_INITIATIVE';s.impulse={id:'detach',hq:'general',commands:4,spent:0};const u=s.units.s11,h=s.units.hq1;u.location=h.location='r1c1';u.cover=h.cover=null;u.removed=h.removed=null;return s;}
const command=(type='DETACH_FIRE_TEAM')=>({type,unit_id:'s11',issuer_id:'hq1'});
describe('core Detach Team — §4.2.3g',()=>{
 for(const scenario of [companyAssault,keepUpTheFire,trevieres,cerisy,stGeorges,hill192,stGermain])it(`${scenario.id}: both types use the shared command`,()=>{
  for(const [type,cohesion] of [['DETACH','A'],['DETACH_FIRE_TEAM','F']]){const s=ready(scenario),step=structuredClone(s.units.s11.steps.at(-1)),deck=structuredClone(s.deck),r=submitCommand(s,command(type));expect(r.accepted).toBe(true);expect(r.state.units.s11.steps).toHaveLength(2);const child=Object.values(r.state.units).find(u=>u.kind==='LAT');expect(child).toMatchObject({cohesion,location:'r1c1',cover:null});expect(child.steps).toEqual([step]);expect(r.state.deck).toEqual(deck);expect(r.state.impulse.commands).toBe(3);expect(r.state.impulse.spent).toBe(1);}
 });
 it('rejects two-step squads, pinned and degraded formations without expenditure',()=>{for(const change of [u=>u.steps.pop(),u=>u.pinned=true,u=>u.cohesion='F']){const s=ready();change(s.units.s11);const r=submitCommand(s,command());expect(r.accepted).toBe(false);expect(r.state).toBe(s);}});
 it('requires a communicating HQ during General Initiative',()=>{const s=ready();expect(orderReason(s,{...command(),issuer_id:'s11'})).toContain('eligible HQ');s.units.hq1.location='r4c4';expect(submitCommand(s,command()).accepted).toBe(false);});
 it('allows a two-step weapons team but rejects a one-step team and insufficient commands',()=>{const s=ready(),u=s.units.mg1;u.location='r1c1';u.cover=null;u.platoon=1;const c={...command(),unit_id:u.id};expect(u.steps).toHaveLength(2);const r=submitCommand(s,c);expect(r.accepted).toBe(true);expect(r.state.units.mg1.steps).toHaveLength(1);expect(submitCommand(r.state,c).accepted).toBe(false);s.impulse.commands=0;expect(submitCommand(s,c).accepted).toBe(false);});
 for(const kind of ['AT','MORTAR'])it(`two-step ${kind} uses the weapons-team eligibility`,()=>{const s=ready();Object.assign(s.units.mg1,{kind,location:'r1c1',cover:null,platoon:1});expect(submitCommand(s,{...command(),unit_id:'mg1'}).accepted).toBe(true);});
 it('uses one detach allowance for both choices in an impulse',()=>{const s=ready();s.units.s11.steps.push(structuredClone(s.units.s11.steps[0]));const r=submitCommand(s,command());expect(r.accepted).toBe(true);expect(submitCommand(r.state,command('DETACH')).accepted).toBe(false);});
 it('offers the new label and replays an authentic accepted command exactly',()=>{let s=createMission(companyAssault,'company-1');for(let i=0;i<4;i++)s=advancePhase(s).state;s=submitCommand(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq1'}).state;s=advancePhase(s).state;s=selectHQ(s,'hq1').state;const r=submitCommand(s,{type:'DETACH_FIRE_TEAM',unit_id:'s11',issuer_id:'hq1'});expect(r.accepted).toBe(true);expect(ACTIONS.DETACH_FIRE_TEAM).toBe('Detach fire team');expect(replayMission(companyAssault,exportReplay(r.state))).toEqual(r.state);});
});
