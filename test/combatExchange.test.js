import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,getPlayerView,exportReplay,replayMission,replayOperation} from '../src/sim/company/engine.js';
import {refresh,spot} from '../src/sim/company/battlefield.js';
import {resolveDisplayedExchange} from '../src/ui/combatExchange.js';
import {combatScreen,reciprocalCombat} from '../src/ui/combatScreen.js';
function fixture({hidden=false,intervening=false}={}){
 let s=createMission(companyAssault,'exchange',{},null,{combat_order:false});const u=s.units.s11;u.location='r1c1';u.fire=u.location;
 s.units.enemy={...structuredClone(s.units.mg1),id:'enemy',name:'German LMG',faction:'enemy',location:u.location,fire:u.location,radios:[]};
 if(intervening)s.units.middle={...structuredClone(s.units.co),id:'middle',location:u.location,fire:null,radios:[]};
 if(!hidden)spot(s,s.units.enemy);refresh(s);s.phase='PINNED_RECOVERY';s=advancePhase(s).state;
 // Hidden items are skipped/resolved by the same normal progression operation.
 if(!getPlayerView(s).combat_resolution)s=advancePhase(s).state;
 return s;
}
it('resolves adjacent mutual fire with exactly the original ordered operations and reproduces both stored results',()=>{
 const s=fixture(),v=getPlayerView(s),c=v.combat_resolution,peer=reciprocalCombat(c,v);expect(peer).toBeTruthy();
 const callback=[];const actual=resolveDisplayedExchange(s,(a,b)=>callback.push([a,b])).state;
 let expected=resolveCombat(s,c.id).state;expected=advancePhase(expected).state;expected=resolveCombat(expected,peer.id).state;
 expect(actual).toEqual(expected);expect(callback).toHaveLength(3);expect(resolveDisplayedExchange(structuredClone(s)).state).toEqual(actual);
 const after=getPlayerView(actual),html=combatScreen(after.combat_resolution,after,id=>id);
 expect(html.match(/class="exchange-result /g)).toHaveLength(2);expect(html).toContain('German LMG');
 expect(resolveDisplayedExchange(actual).accepted).toBe(false);
});
it('does not skip unrelated receiving formations to resolve a reciprocal partner',()=>{
 const s=fixture({intervening:true}),v=getPlayerView(s),c=v.combat_resolution;expect(reciprocalCombat(c,v).visible_position).toBe(3);
 const actual=resolveDisplayedExchange(s).state;expect(actual).toEqual(resolveCombat(s,c.id).state);
 expect(actual.pending_combat.filter(c=>c.status==='RESOLVED')).toHaveLength(1);
});
it('does not project hidden resolutions, identities or outcomes into either panel',()=>{
 const s=fixture({hidden:true}),v=getPlayerView(s),before=structuredClone(s);
 expect(v.combat_resolutions.every(c=>c.target_faction==='friendly')).toBe(true);
 expect(reciprocalCombat(v.combat_resolution,v)).toBeNull();
 const html=combatScreen(v.combat_resolution,v,id=>id);expect(html).not.toContain('German LMG');expect(html).toContain('UNSPOTTED');expect(html).toContain('probabilities hidden');expect(s).toEqual(before);
});

it('advances and resolves the next exchange through exactly the manual operation sequence',async()=>{
 const {resolveNextDisplayedExchange}=await import('../src/ui/combatExchange.js');const s=fixture({intervening:true});expect(resolveNextDisplayedExchange(s).accepted).toBe(false);const first=resolveDisplayedExchange(s).state;
 const next=advancePhase(first).state,expected=resolveDisplayedExchange(next).state,operations=[];const actual=resolveNextDisplayedExchange(first,(a,b)=>operations.push(b)).state;expect(actual).toEqual(expected);expect(operations.length).toBeGreaterThan(1);let replayed=first;for(const op of actual.replay.slice(first.replay.length))replayed=replayOperation(replayed,op).state;expect(replayed).toEqual(actual);
});

it('offers combined next resolution only while another visible pending formation remains',()=>{
 const s=fixture({intervening:true}),first=resolveDisplayedExchange(s).state,v=getPlayerView(first);expect(combatScreen(v.combat_resolution,v,id=>id)).toContain('combat-next-resolve');
 const only=fixture({hidden:true}),resolved=resolveDisplayedExchange(only).state,last=getPlayerView(resolved);expect(combatScreen(last.combat_resolution,last,id=>id)).not.toContain('combat-next-resolve');
});
