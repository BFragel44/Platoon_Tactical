import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,getPlayerView,exportReplay,replayMission,endTurn} from '../src/sim/company/engine.js';
import {refresh,spot} from '../src/sim/company/battlefield.js';
import {prepareCombat,resolvePreparedCombat} from '../src/sim/company/combat.js';
import {combatResolutionTable,hitEffectTable,sampleDistribution,resolveCombatOutcome,resolveHitEffect} from '../src/sim/company/combatProbability.js';
import {createRng} from '../src/sim/rng.js';

const fresh=seed=>createMission(companyAssault,seed??'company-1');
function enemy(s,id='enemy',known=true){
 const u={...structuredClone(s.units.mg1),id,name:'German LMG',faction:'enemy',location:'r1c2',fire:null,radios:[]};s.units[id]=u;if(known)spot(s,u);return u;
}
function combatState({known=true}={}){
 const s=fresh();s.units.s11.location='r1c1';const e=enemy(s,'enemy',known);e.fire='r1c1';s.units.s11.fire='r1c2';refresh(s);
 s.phase='PINNED_RECOVERY';return advancePhase(s).state;
}

describe('deck-derived combat probability model',()=>{
 it('derives complete exact distributions from all 50 action cards',()=>{
  expect(combatResolutionTable[-4].counts).toEqual({MISS:1,PIN:9,HIT:40});
  expect(combatResolutionTable[6].counts).toEqual({MISS:39,PIN:10,HIT:1});
  for(const ncm of Array.from({length:11},(_,i)=>i-4)){
   const d=combatResolutionTable[ncm];expect(Object.values(d.counts).reduce((a,b)=>a+b,0)).toBe(50);
   expect(Object.values(d.probabilities).reduce((a,b)=>a+b,0)).toBeCloseTo(1,12);
  }
  for(const experience of ['Green','Line','Veteran']){
   const d=hitEffectTable[experience];expect(Object.values(d.counts).reduce((a,b)=>a+b,0)).toBe(50);
   expect(Object.values(d.probabilities).reduce((a,b)=>a+b,0)).toBeCloseTo(1,12);
  }
 });
 it('uses half-open cumulative probability boundaries',()=>{
  const d=combatResolutionTable[0];
  expect(sampleDistribution(d,0)).toBe('MISS');
  expect(sampleDistribution(d,.2-Number.EPSILON)).toBe('MISS');
  expect(sampleDistribution(d,.2)).toBe('PIN');
  expect(sampleDistribution(d,.6-Number.EPSILON)).toBe('PIN');
  expect(sampleDistribution(d,.6)).toBe('HIT');
  expect(sampleDistribution(d,1-Number.EPSILON)).toBe('HIT');
 });
 it('returns deterministic weighted outcomes and advances one RNG draw per resolver',()=>{
  const rng=createRng('probability');
  expect(resolveCombatOutcome(-2,rng)).toEqual(resolveCombatOutcome(-2,rng));
  expect(resolveCombatOutcome(-2,rng).rng.draw_count).toBe(1);
  expect(resolveHitEffect('Line',rng)).toEqual(resolveHitEffect('Line',rng));
  expect(resolveHitEffect('Line',rng).rng.draw_count).toBe(1);
 });
});

describe('pending probabilistic combat',()=>{
 it('freezes every target and its stakes without consuming RNG or the action deck',()=>{
  const s=fresh();s.units.s11.location='r1c1';enemy(s);refresh(s);const rng=s.rng.draw_count,deck=s.deck.draws;
  prepareCombat(s);expect(s.pending_combat.length).toBeGreaterThan(0);expect(s.rng.draw_count).toBe(rng);expect(s.deck.draws).toBe(deck);
  const r=s.pending_combat.find(r=>r.target_id==='s11');expect(r.probabilities).toEqual(expect.objectContaining({total:50}));expect(r.modifiers.length).toBeGreaterThan(0);
 });
 it('enters 3.7.4 with an unresolved player-visible exposure and rejects phase exit',()=>{
  const s=combatState(),view=getPlayerView(s);expect(s.phase).toBe('COMBAT_EFFECTS');expect(view.combat_resolution.status).toBe('PENDING');
  expect(advancePhase(s).state).toBe(s);expect(advancePhase(s).reason).toContain('Resolve');
  expect(resolveCombat(s,'wrong').accepted).toBe(false);
 });
 it.each([['MISS',6,1],['PIN',2,1],['HIT',-4,2]])('%s applies state and consumes %i direct RNG draw(s)',(expected,ncm,draws)=>{
  const s=fresh(),u=s.units.s11;u.location='r1c1';u.pinned=true;enemy(s);refresh(s);prepareCombat(s);
  const r=s.pending_combat.find(r=>r.target_id===u.id);r.ncm=ncm;r.probabilities={total:50,counts:{...combatResolutionTable[ncm].counts},probabilities:{...combatResolutionTable[ncm].probabilities}};
  s.rng=createRng('company-1');
  const before=s.rng.draw_count,deck=s.deck.draws;resolvePreparedCombat(s,r.id);expect(r.result).toBe(expected);expect(s.rng.draw_count-before).toBe(draws);expect(s.deck.draws).toBe(deck);
  if(expected==='MISS')expect(u.pinned).toBe(false);if(expected==='PIN')expect(u.pinned).toBe(true);if(expected==='HIT')expect(r.hit_effect).toBeTruthy();
 });
 it('retains the frozen later exposure and persistent fire after earlier outcomes',()=>{
  const s=combatState(),before=structuredClone(s.pending_combat.map(r=>({id:r.id,ncm:r.ncm,modifiers:r.modifiers})));
  const current=getPlayerView(s).combat_resolution,first=resolveCombat(s,current.id).state;
  expect(first.fire).toEqual(s.fire);expect(first.pending_combat.map(r=>({id:r.id,ncm:r.ncm,modifiers:r.modifiers}))).toEqual(before);
 });
 it('records Resolve and cannot resolve the same item twice',()=>{
  let s=combatState();const id=getPlayerView(s).combat_resolution.id;s=resolveCombat(s,id).state;
  expect(resolveCombat(s,id).accepted).toBe(false);expect(exportReplay(s).operations.at(-1)).toEqual({op:'resolveCombat',id});
 });
 it('auto-resolves hidden targets without exposing their count or identity',()=>{
  let s=combatState({known:false});s=advancePhase(s).state;let view=getPlayerView(s);expect(JSON.stringify(view)).not.toContain('German LMG');
  expect(view.combat_resolution.strongest).toMatchObject({source_id:null,label:'Unidentified fire',origin:'r1c2'});
  const visibleTotal=view.segment_progress.visible_total;s=endTurn(s).state;expect(visibleTotal).toBeGreaterThan(0);expect(s.turn).toBe(2);
 });
 it('strictly rejects revision-3 replay data',()=>{
  const record=exportReplay(fresh());record.rules_version=3;expect(()=>replayMission(companyAssault,record)).toThrow('version mismatch');
 });
});
