import {it,expect} from 'vitest';
import {createMission,exportReplay,replayMission,submitCommand,advancePhase,eligibleHQs,selectHQ} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {commandOptions,arrivalCoverOptions} from '../src/sim/company/actions.js';
function fixture(){
 const s=createMission(companyAssault,'arrival');s.impulse={id:'arrival',hq:'general',commands:4,spent:0};
 const u=s.units.s11;u.location='r0c1';u.cover=null;
 s.locations.r1c1.known=true;s.locations.r1c1.covers=[{id:'cover_a',type:'Cover',known:true,value:1},{id:'cover_b',type:'Bunker',known:true,value:3,capacity:1,arc:[1,0]},{id:'secret',type:'Cover',known:false,value:1}];
 return s;
}
const c=arrival_cover=>({type:'MOVE',unit_id:'s11',issuer_id:'co',target_id:'r1c1',arrival_cover});
it('offers known available cover and supports open arrival in the same command',()=>{
 const s=fixture(),before=structuredClone(s);expect(arrivalCoverOptions(s,s.units.s11,'r1c1').map(c=>c.id)).toEqual(['cover_a']);
 const menu=commandOptions(s,s.units.s11,'co').find(o=>o.type==='MOVE');expect(menu.targets.find(t=>t.id==='r1c1').arrival_covers).toHaveLength(1);
 const n=submitCommand(s,c('open'));expect(n.accepted).toBe(true);expect(n.state.units.s11).toMatchObject({location:'r1c1',cover:null,exposed:true});expect(n.state.impulse.commands).toBe(3);expect(s).toEqual(before);
});
it('enters selected cover without an extra command and rejects hidden/full/unknown cover atomically',()=>{
 const s=fixture();const n=submitCommand(s,c('cover_a'));expect(n.accepted).toBe(true);expect(n.state.units.s11.cover).toBe('cover_a');expect(n.state.impulse.commands).toBe(3);
 for(const id of ['secret','cover_b','missing']){const before=structuredClone(s);expect(submitCommand(s,c(id)).accepted).toBe(false);expect(s).toEqual(before);}
});
it('keeps omitted cover choices deterministic for existing movement records',()=>{
 const s=fixture(),command=c(undefined);delete command.arrival_cover;expect(submitCommand(s,command).state.units.s11.cover).toBe('cover_a');
});
for(const success of [true,false])it(`infiltration ${success?'success':'failure'} preserves the selected arrival area`,()=>{
 const s=fixture();s.fire=[{source:'enemy',origin:'r1c2',target:'r1c1',value:0}];
 const card=Object.values(cards).find(c=>!!c.infiltrate===success);s.deck.order=Array(4).fill(card.id).concat(s.deck.order);
 const n=submitCommand(s,{...c('cover_a'),type:'INFILTRATE'});expect(n.accepted).toBe(true);expect(n.state.units.s11.cover).toBe('cover_a');expect(n.state.units.s11.exposed).toBe(!success);
});
it('checks capacity for the whole platoon before moving any member',()=>{
 const s=fixture(),h=s.units.hq1;h.location='r0c1';h.cover=null;
 s.locations.r1c1.covers[0].capacity=3;
 const cmd={type:'PLATOON_MOVE',unit_id:'hq1',issuer_id:'hq1',target_id:'r1c1',arrival_cover:'cover_a'},before=structuredClone(s);
 expect(submitCommand(s,cmd).accepted).toBe(false);expect(s).toEqual(before);
 delete s.locations.r1c1.covers[0].capacity;const n=submitCommand(s,cmd);expect(n.accepted).toBe(true);expect(n.state.units.hq1.cover).toBe('cover_a');expect(n.state.units.s11.cover).toBe('cover_a');
});
it('replays a real phase-stepped move with explicit open arrival exactly',()=>{
 let s=createMission(companyAssault,'arrival-replay');for(let i=0;i<30&&!s.impulse?.commands;i++){const h=eligibleHQs(s)[0];s=h?selectHQ(s,h).state:advancePhase(s).state;}
 expect(s.impulse.commands).toBeGreaterThan(0);const n=submitCommand(s,{...c('open'),unit_id:s.impulse.hq,issuer_id:s.impulse.hq,target_id:'r1c2'});expect(n.accepted).toBe(true);expect(replayMission(companyAssault,exportReplay(n.state))).toEqual(n.state);
});
