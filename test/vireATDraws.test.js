import {it,expect} from 'vitest';
import {cards,newDeck} from '../src/sim/company/core.js';
import {createRng} from '../src/sim/rng.js';
import {resolveATFire} from '../src/sim/company/vehicleCombat.js';
const state=()=>{const s={rng:createRng('vire-at'),events:[],turn:1,phase:'AT_COMBAT',impulse:null};s.deck=newDeck(s);return s;};
const shot={firer:'M5_LIGHT37',target:'M4_SHERMAN75',range:1};
const ids={ammo:5,shotId:'shot-1',firerId:'m5_1',targetId:'m4_1'};
function rig(s,top){s.deck.order=[...top,...s.deck.order.filter(id=>!top.includes(id))];return s;}
const noGrenade=Object.values(cards).filter(c=>!c.grenade).slice(0,2).map(c=>c.id);
const grenade=Object.values(cards).find(c=>c.grenade).id;
it('a failed grenade attempt spends one ammo, draws no AT result and places no miss marker',()=>{
 const s=rig(state(),noGrenade),r=resolveATFire(s,shot,ids);
 expect(r.ammo).toBe(4);expect(r.shot).toMatchObject({result:'FAILED_ATTEMPT',result_card:null,quick_shot:false});
 expect(r.state.deck.draws).toBe(2);expect(r.state.markers).toBeUndefined();
 expect(s.deck.draws).toBe(0);expect(s.vehicle_at_shots).toBeUndefined();
});
it('a successful attempt completes its whole draw then draws an actual AT result',()=>{
 const s=rig(state(),[grenade,noGrenade[0]]),r=resolveATFire(s,shot,ids);
 expect(r.shot.attempt_cards).toEqual([grenade,noGrenade[0]]);
 expect(r.state.deck.draws).toBe(3);expect(r.shot.result_card).not.toBeNull();
 expect(r.shot.sum).toBe(Number(cards[r.shot.result_card].at));
 expect(r.state.events.at(-1).id).toMatch(/^event_/);
});
it('H-rated guns skip grenade attempts and reject duplicate shots after JSON reload',()=>{
 const s=state(),args={...shot,firer:'FLAK88',range:2};
 const r=resolveATFire(s,args,ids);expect(r.state.deck.draws).toBe(1);expect(r.shot.attempt_cards).toEqual([]);
 const saved=JSON.parse(JSON.stringify(r.state));
 expect(()=>resolveATFire(saved,args,{...ids,ammo:r.ammo})).toThrow(/already resolved/);
 expect(resolveATFire(JSON.parse(JSON.stringify(s)),args,ids)).toEqual(r);
});
it('invalid shots and empty ammunition leave the original deck and events untouched',()=>{
 const s=state(),before=structuredClone(s);
 expect(()=>resolveATFire(s,shot,{...ids,ammo:0})).toThrow(/ammunition/);
 expect(()=>resolveATFire(s,{...shot,range:9},ids)).toThrow(/range/);
 expect(s).toEqual(before);
});
it('a Quick Shot draw at the final ammo preserves its draw fact but cannot offer another shot',()=>{
 const c=Object.values(cards).find(c=>Number(c.at)===4);
 const s=rig(state(),[c.id]),r=resolveATFire(s,{firer:'M4_SHERMAN75',target:'M4_SHERMAN75',range:1},{...ids,ammo:1});
 expect(r.shot).toMatchObject({sum:4,quick_shot_draw:true,quick_shot:false,ammo_after:0});
});
