import {describe,it,expect} from 'vitest';
import {createMission,getPlayerView,getVisibleEvents,advancePhase,selectHQ,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {automaticTargetCard,refresh} from '../src/sim/company/battlefield.js';
import {prepareCombat,resolvePreparedCombat} from '../src/sim/company/combat.js';
import {emit} from '../src/sim/company/core.js';
import {segmentReviews,segmentResultMarkup,inventoryMarkup} from '../src/ui/segmentResults.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const fresh=()=>createMission(keepUpTheFire,'kut-1');
function enemy(s,id,location){const u={...structuredClone(s.units.s11),id,name:id,faction:'enemy',location,fire:null};s.units[id]=u;return u;}
describe('KUTF clear orders and segment consequences',()=>{
 it('ranks cards by actual projected fire, not individual counter ratings or duplicate occupants',()=>{
  const s=fresh(),u=s.units.s11;u.location='r1c2';const a=enemy(s,'a','r2c1'),b=enemy(s,'b','r2c3'),c=enemy(s,'c','r2c1');
  const fire=[{source:a.id,origin:a.location,value:2},{source:b.id,origin:b.location,value:0}];
  expect(automaticTargetCard(s,u,[a,b,c],fire)).toBe('r2c3');
  b.location='r3c4';expect(automaticTargetCard(s,u,[a,b,c],fire)).toBe('r2c1');
 });
 it('uses reproducible random card ties and enemy step priorities',()=>{
  const s=fresh(),u=s.units.s11;u.location='r1c2';const a=enemy(s,'a','r2c1'),b=enemy(s,'b','r2c3'),copy=structuredClone(s);
  expect(automaticTargetCard(s,u,[a,b],[])).toBe(automaticTargetCard(copy,copy.units.s11,[copy.units.a,copy.units.b],[]));
  expect(s.deck).toEqual(copy.deck);expect(s.events.at(-1).purpose).toContain('tie');
  s.units.s12.location=u.location;s.units.s13.location='r1c3';expect(automaticTargetCard(s,a,[u,s.units.s13],[])).toBe('r1c2');
 });
 it('ranks existing indirect VOF and uses the same snapshot regardless of unit insertion order',()=>{
  const s=createMission(companyAssault,'indirect-priority');s.units.s11.location='r1c2';
  const mortar={...structuredClone(s.units.mortar),id:'enemy_mortar',faction:'enemy',location:'r2c1',indirect:'r1c1',fire:null};
  const mg={...structuredClone(s.units.mg1),id:'enemy_mg',faction:'enemy',location:'r2c3',fire:'r1c2'};
  s.units[mortar.id]=mortar;s.units[mg.id]=mg;s.knowledge.spotted[mortar.id]={id:mortar.id};s.knowledge.spotted[mg.id]={id:mg.id};
  const reversed=structuredClone(s);reversed.units=Object.fromEntries(Object.entries(reversed.units).reverse());
  refresh(s);refresh(reversed);expect(s.units.s11.fire).toBe('r2c1');expect(reversed.fire).toEqual(s.fire);expect(reversed.rng).toEqual(s.rng);
 });
 it('groups frozen combat by descending row, ascending column and ID, without hidden queue totals',()=>{
  const s=createMission(companyAssault,'order');s.units.s11.location='r1c1';s.units.s12.location='r2c3';s.units.s13.location='r2c1';
  const e=enemy(s,'enemy_hidden','r2c3');
  s.support=[{status:'ACTIVE',location:'r1c1',value:-3,source:'enemy'},{status:'ACTIVE',location:'r2c3',value:-3,source:'enemy'},{status:'ACTIVE',location:'r2c1',value:-3,source:'enemy'}];
  prepareCombat(s);expect(s.pending_combat.map(r=>r.target_id)).toEqual(['s13',e.id,'s12','s11']);
  const stakes=s.pending_combat.slice(1).map(r=>[r.ncm,r.modifiers,r.probabilities]);resolvePreparedCombat(s,s.pending_combat[0].id);
  expect(s.pending_combat.slice(1).map(r=>[r.ncm,r.modifiers,r.probabilities])).toEqual(stakes);
  s.phase='COMBAT_EFFECTS';s.segment_progress={phase:s.phase,index:0,total:4,status:'reviewing_result'};
  const v=getPlayerView(s);expect(v.segment_progress.visible_total).toBe(3);expect(v.segment_progress).not.toHaveProperty('total');expect(v.segment_progress).not.toHaveProperty('index');
 });
 it('separates free inventory unloading from tactical readiness and preserves RNG',()=>{
  const s=fresh(),v=getPlayerView(s),u=v.units.find(u=>u.inventory.equipment.length);expect(u.tactical_ready).toBe(false);expect(u.options.find(o=>o.type==='DROP_LOAD').available).toBe(true);
  expect(inventoryMarkup(u)).toContain('Free action');expect(inventoryMarkup(u)).toContain(u.inventory.equipment[0].label);
  const r=submitCommand(s,{type:'DROP_LOAD',unit_id:u.id});expect(r.accepted).toBe(true);expect(r.state.rng).toEqual(s.rng);expect(r.state.deck).toEqual(s.deck);expect(r.state.impulse).toEqual(s.impulse);
 });
 it('labels an actual XO reconstitution by its destination HQ',()=>{
  const s=fresh();s.units.hq3.steps=[];s.units.hq3.removed='BROKEN';s.units.hq3.location=s.units.xo.location;
  s.phase='STAFF_INITIATIVE';s.impulse={id:'test',hq:'xo',commands:5,spent:0};
  const r=submitCommand(s,{type:'RECONSTITUTE_HQ',unit_id:'xo',issuer_id:'xo',target_id:'hq3'});expect(r.accepted,r.reason).toBe(true);
  expect(getPlayerView(r.state).units.find(u=>u.id==='xo').transition_description).toBe('Reconstituted 3 Platoon HQ');
 });
 it('derives safe historical summaries, omits skipped checks and restores an open review exactly',()=>{
  let s=fresh();s=advancePhase(s).state;expect(segmentReviews(getVisibleEvents(s))).toEqual([]);
  const original=structuredClone(s);const p={reviewId:'review',inventoryId:'s11',contactAcknowledged:'1:42'};
  expect(resumeCheckpoint(keepUpTheFire,checkpoint(s,p))).toEqual({state:s,presentation:p});expect(s).toEqual(original);
  emit(s,'AUTOMATIC_RECOVERY','Secret formation unpinned',{actor:'secret',location:'r3c3'},true);
  emit(s,'SEGMENT_COMPLETED','Recovery',{label:'Recovery'});
  // This synthetic segment has a different phase than the skipped first-turn segment.
  s.events.at(-1).phase='PINNED_RECOVERY';s.events.at(-2).phase='PINNED_RECOVERY';
  const review=segmentReviews(getVisibleEvents(s)).at(-1);expect(segmentResultMarkup(review,x=>x)).toContain('No visible changes');expect(JSON.stringify(review)).not.toContain('secret');
 });
 it('restores a real completed segment review and reopening/dismissal leaves its simulation untouched',()=>{
  let s=fresh();
  for(let guard=0;s.phase!=='RETREAT'&&guard<60;guard++){
    const v=getPlayerView(s);s=!s.impulse&&v.eligible_hqs.length?selectHQ(s,v.eligible_hqs[0]).state:advancePhase(s).state;
  }
  expect(s.phase).toBe('RETREAT');const review=segmentReviews(getVisibleEvents(s)).at(-1),before=structuredClone(s);
  expect(review.phase).toBe('CAPTURE');
  for(const reviewId of [review.id,null,review.id]){
    const restored=resumeCheckpoint(keepUpTheFire,checkpoint(s,{reviewId}));expect(restored.state).toEqual(before);expect(restored.presentation.reviewId).toBe(reviewId);
    expect(segmentReviews(getVisibleEvents(restored.state)).find(r=>r.id===review.id)).toEqual(review);
  }
 });
 it('preserves established fire after an opposing unit departs and rejects revision 9 strictly',()=>{
  const s=createMission(companyAssault,'continuing');s.units.s11.location='r1c1';s.units.s11.fire='r1c2';refresh(s);expect(s.units.s11.fire).toBe('r1c2');
  const record=exportReplay(fresh());record.rules_version=9;expect(()=>replayMission(keepUpTheFire,record)).toThrow('version mismatch');
 });
});
