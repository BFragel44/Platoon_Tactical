import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {trevieresCardPull} from '../src/scenarios/trevieresCardPull.js';
import {createMission,getPlayerView,getVisibleEvents,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {prepareCombat,resolvePreparedCombat} from '../src/sim/company/combat.js';
import {cards} from '../src/sim/company/core.js';
import {missionCatalog} from '../src/scenarios/missions.js';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
for(const {scenario} of missionCatalog)it(`${scenario.id} starts with card-pull combat and exact current replay`,()=>{
 const s=scenario.rules?.vire?createVireDevelopmentMission('normal-cards'):scenario.rules?.tinchebray?createTinchebrayDevelopmentMission('normal-cards'):createMission(scenario,'normal-cards');
 expect(s.mission_rules.combatResolver).toBe('action-deck-v1');
 const record=exportReplay(s);
 expect(s.vire_runtime?importVireAdapterReplay(record):replayMission(scenario,record)).toEqual(s);
});
const prepared=(definition=trevieresCardPull)=>{
 const s=createMission(definition,'card-pull-fixture');s.units.s11.location='r1c1';
 s.units.enemy={...structuredClone(s.units.s11),id:'enemy',name:'Enemy',faction:'enemy',location:'r2c1'};
 s.fire=[{source:'enemy',origin:'r2c1',target:'r1c1',value:0,indirect:false}];prepareCombat(s);
 return {s,r:s.pending_combat.find(r=>r.target_id==='s11')};
};
it('uses the actual next card and a second card only on HIT',()=>{
 for(const outcome of ['MISS','PIN','HIT']){
  const {s,r}=prepared();const card=Object.values(cards).find(c=>c.id!==51&&c.combat[r.ncm+4]===outcome),hit=cards[2];
  s.deck={order:[card.id,hit.id,3],discard:[],draws:0,reshuffles:0};
  resolvePreparedCombat(s,r.id);
  expect(r.result).toBe(outcome);expect(r.combat_card.id).toBe(card.id);
  expect(s.deck.draws).toBe(outcome==='HIT'?2:1);
  expect(r.hit_effect).toBe(outcome==='HIT'?hit.hit[r.target_experience]:null);
 }
});
it('retains shared-deck reshuffling without resolving the reshuffle marker as a combat card',()=>{
 const {s,r}=prepared();s.deck={order:[51,1,2,3],discard:[4,5],draws:0,reshuffles:0};resolvePreparedCombat(s,r.id);
 expect(r.combat_card.id).toBe(1);expect(s.deck.reshuffles).toBeGreaterThan(0);
 expect(s.events.some(e=>e.type==='DECK_SHUFFLED')).toBe(true);
});
it('uses shared Action Deck pulls in ordinary missions without a development flag',()=>{
 const {s,r}=prepared(trevieres),before=s.deck.draws;resolvePreparedCombat(s,r.id);
 expect(s.deck.draws).toBeGreaterThan(before);expect(r.combat_card).toBeDefined();expect(r.roll).toBeNull();
});
it('conceals unspotted enemy draw identities from the public projection and events',()=>{
 const {s,r}=prepared();r.target_id='enemy';r.target_visible=false;s.phase='COMBAT_EFFECTS';s.segment_progress={index:0};
 const before=s.events.length;resolvePreparedCombat(s,r.id);
 expect(getVisibleEvents(s,'friendly',before).some(e=>e.type==='CARDS_DRAWN'||e.type==='COMBAT_RESOLVED')).toBe(false);
 expect(getPlayerView(s).combat_resolutions).toEqual([]);
});
it('pins the resolver in replay identity and does not accept comparison saves as normal M1',()=>{
 const state=createMission(trevieresCardPull,'card-pull-replay'),record=exportReplay(state);
 expect(record.combat_resolver).toBe('action-deck-v1');expect(replayMission(trevieresCardPull,record)).toEqual(state);
 expect(()=>replayMission(trevieres,record)).toThrow(/scenario|version|Different/);
 expect(()=>replayMission(trevieresCardPull,{...record,combat_resolver:undefined})).toThrow(/resolver mismatch/);
});
