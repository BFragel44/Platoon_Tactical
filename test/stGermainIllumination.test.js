import {describe,it,expect} from 'vitest';
import {stGermain} from '../src/scenarios/stGermain.js';
import {createMission,advancePhase,getPlayerView,checkObjective} from '../src/sim/company/engine.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
import {placeIllumination,illuminationReductionsAt,visibilityAt} from '../src/sim/company/visibility.js';
import {packageAvailable,placePackage} from '../src/sim/company/missionContacts.js';
import {commandOptions,submitCommand} from '../src/sim/company/actions.js';
import {cards} from '../src/sim/company/core.js';
const candidate={...stGermain,readiness:{playable:true}};
const fresh=()=>createMission(candidate,'illumination-validation');
const prime=(s,predicate,n=5)=>{const ids=Object.values(cards).filter(predicate).slice(0,n).map(c=>c.id);s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];};
const impulse=s=>{s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:8,spent:0,hq_limit_only:true,origin_spent:{}};};
describe('source-verified patrol illumination and experience',()=>{
 it('uses printed center/adjacent strengths without stacking light or reducing weather',()=>{
  const s=fresh();placeIllumination(s,'r2c2','artillery');placeIllumination(s,'r2c2','mortar');
  expect(illuminationReductionsAt(s.markers,'r2c2',s.locations)).toEqual([3,2]);
  expect(illuminationReductionsAt(s.markers,'r1c1',s.locations)).toEqual([1,1]);
  expect(visibilityAt({light:2,weather:2},[3,2])).toMatchObject({modifier:2,illuminated:false});
 });
 it.each(['artillery','mortar'])('places %s illumination immediately, spends one mission and never offers battalion expansion',agency=>{
  const s=fresh();prime(s,c=>c.burst&&!c.short);const before=s.support_inventory[agency].ILLUM;
  supportRequest(s,s.units.artyfo,agency,'ILLUM','r1c1');
  expect(s.support).toHaveLength(0);expect(s.pending_support).toBeFalsy();expect(s.support_inventory[agency].ILLUM).toBe(before-1);
  expect(getPlayerView(s).markers).toContainEqual(expect.objectContaining({type:'ILLUMINATION',delivery:agency,location:'r1c1'}));
  expect(s.events.at(-1).text).toContain('illumination active');
 });
 it('failed calls preserve ammunition and create no light',()=>{
  const s=fresh();prime(s,c=>!c.burst&&!c.short);supportRequest(s,s.units.artyfo,'artillery','ILLUM','r1c1');
  expect(s.markers).toHaveLength(0);expect(s.support_inventory.artillery.ILLUM).toBe(6);
 });
 it('exhausted illumination cannot draw or place a marker',()=>{
  const s=fresh();s.support_inventory.mortar.ILLUM=0;const deck=structuredClone(s.deck);
  expect(()=>supportRequest(s,s.units.artyfo,'mortar','ILLUM','r1c1')).toThrow('no ILLUM');expect(s.deck).toEqual(deck);
 });
 it('applies the selected artillery concentration bonus and moves it after successful fire',()=>{
  const s=fresh();prime(s,c=>c.burst&&!c.short);const before=s.deck.draws;
  supportRequest(s,s.units.artyfo,'artillery','ILLUM',s.patrol.plan.concentration);expect(s.deck.draws-before).toBe(4);
  prime(s,c=>c.burst&&!c.short);const next=s.deck.draws;supportRequest(s,s.units.artyfo,'artillery','ILLUM','r1c1');expect(s.deck.draws-next).toBe(3);expect(s.registered_targets.artillery).toBe('r1c1');
 });
 it('allows fire-direction illumination outside LOS only on known terrain',()=>{
  const s=fresh();impulse(s);s.locations.r4c5.known=true;
  const order=commandOptions(s,s.units.artyfo,'co').find(o=>o.type==='CALL_ARTILLERY_ILLUM');
  expect(order.targets.find(t=>t.id==='r4c5')?.reason).toBeNull();
  expect(order.targets.some(t=>t.id==='r4c4')).toBe(false);
  s.support_unavailable=['artillery'];expect(commandOptions(s,s.units.artyfo,'co').find(o=>o.type==='CALL_ARTILLERY_ILLUM').available).toBe(false);
 });
 it('deploys handheld light without a draw and removes it at cleanup',()=>{
  const s=fresh();impulse(s);const draws=s.deck.draws;
  const n=submitCommand(s,{type:'HANDHELD_ILLUM',unit_id:'s11',issuer_id:'co',target_id:'r2c1'}).state;
  expect(n.units.s11.assets.illum).toBe(1);expect(n.deck.draws).toBe(draws);expect(n.markers[0]).toMatchObject({center:1,adjacent:0});
  n.phase='CLEANUP';n.impulse=null;expect(advancePhase(n).state.markers).toHaveLength(0);
 });
 it.each([6,7])('places package %i mortar light before placement and keeps feasibility checks pure',number=>{
  const s=fresh();s.units.s11.location='r2c1';s.units.s11.cover=null;
  for(const l of Object.values(s.locations)){l.terrain='open';l.building=false;l.protection=0;l.elevation=1;l.borders=Object.fromEntries(['N','NE','E','SE','S','SW','W','NW'].map(k=>[k,true]));}
  const pc=s.contacts.pc_r2c1,before=structuredClone(s);expect(packageAvailable(s,pc,s.mission_contacts.packages[number])).toBe(true);expect(s).toEqual(before);
  expect(placePackage(s,pc,s.mission_contacts.packages[number])).toBe(true);
  expect(s.markers).toContainEqual(expect.objectContaining({type:'ILLUMINATION',delivery:'mortar',location:pc.location,center:2,adjacent:1}));
 });
 it('enforces the campaign night equipment and no-phone restrictions',()=>{
  const s=fresh();expect(Object.values(s.units).reduce((n,u)=>n+(u.assets.illum??0),0)).toBe(8);
  expect(()=>createMission(candidate,'phones',{command_network:'phones'})).toThrow('do not permit field phones');
  impulse(s);expect(commandOptions(s,s.units.co,'co').find(o=>o.type==='PYRO_RED_SIGNAL').available).toBe(false);
 });
 it('awards the printed patrol-only points and never the offensive other-card points',()=>{
  const s=fresh();for(const pc of Object.values(s.contacts))pc.resolved=true;
  s.patrol.visited=[...s.patrol.plan.route];s.patrol.objective_visited=true;s.patrol.returned=true;checkObjective(s);
  expect(s.achievements.reduce((n,a)=>n+a.points,0)).toBe(13);expect(s.achievements.find(a=>a.key===`clear_${s.patrol.plan.primary}`).points).toBe(4);
  checkObjective(s);expect(s.achievements.reduce((n,a)=>n+a.points,0)).toBe(13);
 });
});
