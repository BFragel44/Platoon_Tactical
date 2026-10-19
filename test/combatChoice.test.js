import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,getPlayerView,exportReplay,replayMission,selectHQ,getVisibleEvents} from '../src/sim/company/engine.js';
import {refresh,spot} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {combatScreen,combatRecipients,selectedCombat} from '../src/ui/combatScreen.js';
import {resolveSelectedCombat} from '../src/ui/combatExchange.js';
import {combatCamera} from '../src/ui/combatMap.js';
import {formationGrid} from '../src/ui/formationGrid.js';

function fixture({hidden=false}={}){
 let s=createMission(companyAssault,'combat-choice');
 for(const id of ['s11','s12']){s.units[id].location='r1c1';s.units[id].fire='r1c2';}
 s.units.secret={...structuredClone(s.units.mg1),id:'secret',name:'Secret enemy',faction:'enemy',location:'r1c2',fire:'r1c1',radios:[]};
 if(!hidden)spot(s,s.units.secret);refresh(s);s.phase='PINNED_RECOVERY';return advancePhase(s).state;
}
it('allows any pending visible recipient exactly once without advancing or resolving a peer',()=>{
 const s=fixture(),v=getPlayerView(s),chosen=v.combat_resolutions.at(-1),before=structuredClone(s);
 const card=Object.values(cards).find(c=>c.id!==51&&c.combat[chosen.ncm+4]==='MISS');s.deck={order:[card.id,1,2],discard:[],draws:0,reshuffles:0};
 const frozen=s.pending_combat.filter(r=>r.id!==chosen.id).map(r=>structuredClone(r)),r=resolveSelectedCombat(s,chosen.id);
 expect(r.accepted).toBe(true);expect(r.state.pending_combat.filter(c=>c.status==='RESOLVED')).toHaveLength(1);
 expect(r.state.pending_combat.filter(c=>c.id!==chosen.id)).toEqual(frozen);expect(r.state.deck.draws).toBe(1);
 expect(r.state.replay.at(-1)).toEqual({op:'resolveCombat',id:chosen.id});
 expect(resolveCombat(r.state,chosen.id)).toMatchObject({accepted:false,state:r.state});
 expect(resolveCombat(s,'nonexistent')).toMatchObject({accepted:false,state:s});
 expect(s.events).toEqual(before.events);
});
it('keeps hidden recipients unselectable and unresolved until visible combat is finished',()=>{
 const s=fixture({hidden:true});
 // Add a frozen unobserved recipient to the isolated exposure fixture.
 const sample=structuredClone(s.pending_combat[0]);sample.id='hidden-exposure';sample.target_id='secret';sample.target_visible=false;sample.status='PENDING';s.pending_combat.unshift(sample);s.segment_progress.index++;
 const before=structuredClone(s),hiddenId=sample.id;
 expect(resolveCombat(s,hiddenId)).toMatchObject({accepted:false,state:s});expect(s).toEqual(before);
 let state=s;const visible=getPlayerView(s).combat_resolutions;
 expect(visible.every(r=>r.target_id!=='secret')).toBe(true);
 expect(advancePhase(s).accepted).toBe(false);
 for(const r of [...visible].reverse()){
  state=resolveCombat(state,r.id).state;
  expect(state.pending_combat.find(r=>r.id===hiddenId).status).toBe('PENDING');
 }
 const after=advancePhase(state).state;expect(after.segment_progress.status).toBe('reviewing');
 expect(after.pending_combat.every(r=>r.status==='RESOLVED')).toBe(true);
 expect(getVisibleEvents(after).filter(e=>e.type==='COMBAT_RESOLVED').every(e=>e.actor!=='secret')).toBe(true);
 expect(advancePhase(after).state.phase).toBe('CLEANUP');
});
it('preserves public-command replay and recovery after a reversed recipient order',()=>{
 const raw=(id,faction,location,vof)=>({id,name:id,kind:'SQUAD',faction,platoon:1,location,steps:3,vof,range:2,experience:'Line',radios:[]});
 const def={...structuredClone(companyAssault),id:'choice-replay',contacts:[],rules:{},units:[{id:'co',name:'Company HQ',kind:'HQ',location:'r0c2',steps:1,experience:'Line',radios:['BN','CO']},raw('a','friendly','r1c1','S'),raw('b','friendly','r1c1','S'),raw('enemy','enemy','r1c2','A')]};
 let s=createMission(def,'choice-replay');
 for(let i=0;i<50&&s.phase!=='COMBAT_EFFECTS';i++){
  const v=getPlayerView(s);const r=!s.impulse&&v.eligible_hqs.length?selectHQ(s,v.eligible_hqs[0]):advancePhase(s);expect(r.state).not.toBe(s);s=r.state;
 }
 const recipients=getPlayerView(s).combat_resolutions;expect(recipients.length).toBeGreaterThanOrEqual(2);
 for(const r of [...recipients].reverse()){const result=resolveCombat(s,r.id);expect(result.accepted).toBe(true);s=result.state;}
 s=advancePhase(s).state;
 expect(exportReplay(s).combat_order).toBe('player-choice-v1');expect(replayMission(def,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);
 const old=createMission(def,'historical',{},null,{combat_order:false});const record=exportReplay(old);expect(record.combat_order).toBeUndefined();expect(replayMission(def,record)).toEqual(old);
 expect(()=>replayMission(def,{...record,combat_order:'unknown'})).toThrow('Unsupported combat order');
});
it('selection and rendering are read-only, expose only recipients, and draw no automatic reciprocal result',()=>{
 const s=fixture({hidden:true}),v=getPlayerView(s),before=structuredClone(v),chosen=v.combat_resolutions.at(-1),html=combatScreen(chosen,v,id=>id),strip=combatRecipients(v,chosen,id=>id);
 expect(selectedCombat(v,chosen.id)).toEqual(chosen);expect(html).toContain('Draw combat card');expect(html).toContain('NET COMBAT MODIFIER');
 expect(html).not.toContain('Resolve both');expect(html+strip).not.toContain('Secret enemy');expect(strip).toContain(chosen.id);expect(v).toEqual(before);
 expect(html).not.toContain('class="combat-exchange"');
});
it('makes spotted enemy counters selectable while retaining their real map location',()=>{
 const s=fixture(),v=getPlayerView(s),enemy=v.combat_resolutions.find(r=>r.target_faction==='enemy'),location=v.locations.find(l=>l.id===enemy.target_location);
 const html=formationGrid(location,[],v.enemies,{combat:{current:enemy,recipients:v.combat_resolutions}});
 expect(html).toContain(`data-combat-select="${enemy.id}"`);expect(html).toContain('combat-receiver');expect(html).toContain('aria-pressed="true"');
 expect(html).not.toContain('role="group"');
});
it('shows the result cards before the condition and source lists',()=>{
 let s=fixture();const current=getPlayerView(s).combat_resolution;
 const card=Object.values(cards).find(c=>c.id!==51&&c.combat[current.ncm+4]==='HIT'),hit=Object.values(cards).find(c=>c.id!==51&&c.hit[current.target_experience]==='C');
 s.deck={order:[card.id,hit.id,1],discard:[],draws:0,reshuffles:0};s=resolveCombat(s,current.id).state;
 const v=getPlayerView(s),html=combatScreen(v.combat_resolution,v,id=>id);
 expect(html.indexOf('combat-outcome')).toBeLessThan(html.indexOf('combat-modifiers'));expect(html).toContain(`ACTION CARD ${hit.id}`);expect(html).not.toContain('id="combat-resolve"');
});
it('handles entirely hidden and empty combat without publishing recipient counts',()=>{
 const s=fixture({hidden:true});s.pending_combat=s.pending_combat.map(r=>({...r,target_visible:false}));s.segment_progress.index=0;
 const v=getPlayerView(s);expect(v.combat_resolutions).toEqual([]);expect(v.segment_progress.visible_total).toBe(0);
 const finished=advancePhase(s).state;expect(finished.segment_progress.status).toBe('reviewing');expect(finished.pending_combat.every(r=>r.status==='RESOLVED')).toBe(true);
 expect(getPlayerView(finished).combat_resolutions).toEqual([]);expect(combatScreen(null,getPlayerView(finished),id=>id)).toContain('Continue to cleanup');
});
it('keeps a distant receiver readable and fits nearby combat when possible',()=>{
 const view={width:1000,height:600},receiver={left:400,top:200,width:90,height:100};
 expect(combatCamera(view,receiver,[{left:2000,top:2000,width:90,height:100}]).zoom).toBe(1);
 const near=combatCamera(view,receiver,[{left:100,top:200,width:90,height:100}]);expect(near.zoom).toBeGreaterThanOrEqual(.7);expect(near.left).toBeGreaterThanOrEqual(0);
});
