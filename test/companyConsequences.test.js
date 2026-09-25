import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,getPlayerView,getAfterActionReport,abortMission,submitCommand,exportReplay,replayMission,advancePhase,selectHQ} from '../src/sim/company/engine.js';
import {applyHit} from '../src/sim/company/combat.js';
import {eligibleTargets,commandOptions} from '../src/sim/company/actions.js';
import {refresh,spot} from '../src/sim/company/battlefield.js';
import {selectedOrder,combatArt,completeCombatStage,supportContext} from '../src/ui/orderPresentation.js';
import {pdfDirections} from '../src/ui/fireMarkers.js';
const fresh=()=>createMission(companyAssault,'company-1');
const impulse=s=>{s.phase='CO_ACTIVATION';s.impulse={id:'fixture',hq:'co',commands:6,spent:0};return s;};
const order=(s,type,id,target)=>submitCommand(s,{type,unit_id:id,issuer_id:s.impulse.hq,target_id:target});

describe('Trustworthy orders and visible consequences',()=>{
 it('activates both platoons across staging and explains the handoff instead of suggesting a comms failure',()=>{
  let s=fresh();for(let i=0;i<4;i++)s=advancePhase(s).state;
  expect(s.phase).toBe('CO_ACTIVATION');
  for(const id of ['hq1','hq2']){
    const before=s.impulse.commands,r=order(s,'ACTIVATE','co',id);
    expect(r.accepted).toBe(true);s=r.state;expect(s.impulse.commands).toBe(before-1);
    expect(r.events.some(e=>e.type==='HQ_ACTIVATED'&&e.hq===id&&e.text.includes('3.3.1c'))).toBe(true);
    expect(getPlayerView(s).units.find(u=>u.id===id).activated).toBe(true);
    const again=order(s,'ACTIVATE','co',id);expect(again.state).toBe(s);expect(again.reason).toContain('already activated');
  }
  s=advancePhase(s).state;expect(getPlayerView(s).eligible_hqs).toEqual(['hq1','hq2']);
  s=selectHQ(s,'hq1').state;expect(s.impulse.hq).toBe('hq1');expect(s.impulse.commands).toBeGreaterThan(0);
  expect(replayMission(companyAssault,exportReplay(s))).toEqual(s);
 });
 it('never substitutes an available action or a different target for the selected order',()=>{
  const options=[{type:'MOVE',available:true,targeted:true,targets:[{id:'b',reason:null}]},{type:'ACTIVATE',available:false,reason:'Already activated',targets:[]}];
  expect(selectedOrder(options,'ACTIVATE','').option.type).toBe('ACTIVATE');
  expect(selectedOrder(options,'ACTIVATE','').reason).toBe('Already activated');
  expect(selectedOrder(options,'MOVE','a').reason).toBe('Choose a target.');
  expect(selectedOrder(options,'MOVE','b').reason).toBeNull();
 });
 it('names HQ side transitions and restores its command side without draws outside VOF',()=>{
  let s=impulse(fresh());const deck=structuredClone(s.deck);
  expect(commandOptions(s,s.units.co,'co').find(o=>o.type==='DEPLOY_FIRE_TEAM').label).toBe('Deploy HQ Fire Team');
  s=order(s,'DEPLOY_FIRE_TEAM','co').state;
  expect(order(s,'MOVE','s11','r1c1').accepted).toBe(false);
  expect(commandOptions(s,s.units.co,'co').find(o=>o.type==='RECOVER').label).toBe('Restore HQ command side');
  const r=order(s,'RECOVER','co');expect(r.accepted).toBe(true);expect(r.state.units.co.cohesion).toBe('GOOD');expect(r.state.deck).toEqual(deck);
 });
 it('only allows pickup from the same cover area and projects readable casualty provenance',()=>{
  const s=impulse(fresh());s.units.hq1.location=s.units.co.location;s.units.hq1.cover='shelter';applyHit(s,s.units.hq1,'C');
  const c=s.casualties[0];expect(eligibleTargets(s,s.units.co,'PICKUP_CASUALTY')).not.toContain(c.id);
  const rejected=order(s,'PICKUP_CASUALTY','co',c.id);expect(rejected.accepted).toBe(false);expect(rejected.state).toBe(s);
  s.units.co.cover='shelter';const r=order(s,'PICKUP_CASUALTY','co',c.id);expect(r.accepted).toBe(true);
  const visible=getPlayerView(r.state).casualties[0];expect(visible.label).toContain('1 Platoon HQ');expect(visible.carrier_name).toBe('Company HQ');
 });
 it('reconstitutes a platoon HQ from an eligible donor and converts a one-step squad remainder',()=>{
  const s=impulse(fresh());s.units.hq1.steps=[];s.units.hq1.removed='BROKEN';s.units.s11.location=s.units.co.location;s.units.s11.steps.pop();
  const r=order(s,'RECONSTITUTE_HQ','s11','hq1');expect(r.accepted).toBe(true);expect(r.state.units.hq1.experience).toBe('Green');expect(r.state.units.hq1.steps).toHaveLength(1);
  expect(r.state.units.s11.removed).toBe('RECONSTITUTED');expect(Object.values(r.state.units).some(u=>u.kind==='LAT'&&u.cohesion==='F')).toBe(true);
 });
 it('requires company-HQ donor precedence even when the higher-ranked survivor is a Fire Team',()=>{
  const s=impulse(fresh());s.units.co.steps=[];s.units.co.removed='BROKEN';s.impulse.hq='staff';s.units.artyfo.location=s.units.staff.location;s.units.hq1.cohesion='F';s.units.hq2.steps=[];s.units.hq2.removed='BROKEN';
  expect(order(s,'RECONSTITUTE_HQ','artyfo','co').accepted).toBe(false);
  s.units.hq1.cohesion='GOOD';s.units.hq1.location=s.units.staff.location;
  expect(order(s,'RECONSTITUTE_HQ','hq1','co').accepted).toBe(true);
 });
 it('allows a pinned command-side HQ to originate reconstitution over a working radio link',()=>{
  const s=impulse(fresh());s.units.hq1.steps=[];s.units.hq1.removed='BROKEN';s.units.mg1.radios=['CO'];s.units.co.pinned=true;
  expect(order(s,'RECONSTITUTE_HQ','mg1','hq1').accepted).toBe(true);
 });
 it('records visible final casualty losses without making history an occupant or revealing hidden losses',()=>{
  const s=fresh();s.units.hq1.location='r1c1';applyHit(s,s.units.hq1,'C');
  const e={...structuredClone(s.units.at1),id:'secret',name:'Secret enemy',faction:'enemy',location:'r1c2'};s.units.secret=e;applyHit(s,e,'C');
  const before=structuredClone(s),v=getPlayerView(s);expect(v.historical_losses).toHaveLength(1);expect(v.historical_losses[0]).toMatchObject({name:'1 Platoon HQ',location:'r1c1',cause:'FINAL_CASUALTY'});expect(JSON.stringify(v.historical_losses)).not.toContain('Secret');expect(s).toEqual(before);
  const other=fresh();applyHit(other,other.units.at1,'F');expect(getPlayerView(other).historical_losses).toHaveLength(0);
 });
 it('attributes automatic mortar direct fire only to the actual firing formation',()=>{
  const s=fresh();s.units.mortar.location='r1c1';s.units.co.location='r1c1';
  const e={...structuredClone(s.units.at1),id:'enemy',name:'Enemy',faction:'enemy',location:'r2c1'};s.units.enemy=e;spot(s,e);refresh(s);
  const v=getPlayerView(s),arrows=pdfDirections(v,v.locations.find(l=>l.id==='r1c1'));
  expect(arrows.some(d=>d.label.includes('Mortar Section — mortar direct lay'))).toBe(true);expect(arrows.every(d=>!d.sources.some(x=>x.startsWith('Company HQ')))).toBe(true);
 });
 it('uses per-asset orientation and collapses old hit-effect stages without simulation operations',()=>{
  expect(combatArt('GER_COMBAT_UNSPOTTED.png','attacker').flip).toBe(false);expect(combatArt('GER_COMBAT_PRE.png','attacker').flip).toBe(true);expect(combatArt('US_COMBAT_HIT.png','defender').flip).toBe(true);
  expect(completeCombatStage('effect')).toBe('result');expect(supportContext({kind:'OFF_MAP_SUPPORT'})).toBe(true);expect(supportContext({kind:'BASIC_FIRE'})).toBe(false);
 });
 it('exports an identified versioned AAR and rejects earlier rule revisions',()=>{
  const s=abortMission(fresh()).state,a=getAfterActionReport(s);expect(a).toMatchObject({record_type:'AAR',rules_version:9,scenario_version:4,seed:'company-1'});
  const record=exportReplay(s);expect(replayMission(companyAssault,record)).toEqual(s);record.rules_version=4;expect(()=>replayMission(companyAssault,record)).toThrow();
 });
 it('previews one contact and projects only the just-resolved visible result',()=>{
  const s=fresh();s.phase='CONTACTS';s.units.s11.location='r1c1';s.units.s21.location='r1c4';
  expect(getPlayerView(s).contact_review).toMatchObject({location:'r1c1',resolved:false,events:[]});
  const first=advancePhase(s).state,v=getPlayerView(first);expect(v.contact_review.location).toBe('r1c1');expect(v.contact_review.next_location).toBe('r1c4');expect(v.contact_review.resolved).toBe(true);
  expect(v.contact_review.events.filter(e=>e.type==='CONTACT_EVALUATED')).toHaveLength(1);
  const before=structuredClone(first);getPlayerView(first);getPlayerView(first);expect(first).toEqual(before);
  const second=advancePhase(first).state;expect(getPlayerView(second).contact_review.location).toBe('r1c4');expect(getPlayerView(second).contact_review.events.filter(e=>e.type==='CONTACT_EVALUATED')).toHaveLength(1);
 });
});
