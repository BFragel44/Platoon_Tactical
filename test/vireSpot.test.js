import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {initializeVireAdapter,applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
function start(){const base=createMission(cerisy,'vehicle-spot');base.phase='AT_COMBAT';base.fire=[];base.markers=[];
 const s=initializeVireAdapter(base,[{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',activated:true,ammo:5,crew:[{id:'ca',personnel:[]},{id:'cb',personnel:[]}]}]);s.vire_runtime.vehicles.tank.activated=true;return s;}
const op={id:'spot',type:'VEHICLE_SPOT',vehicle:'tank',location:'r1c1'};
it('spots an unknown infantry card, preserves command pool and ammunition, and replays exactly',()=>{
 const s=start(),t=s.units.s11;t.faction='enemy';t.location='r1c1';delete s.knowledge.spotted[t.id];
 const c=Object.values(cards).find(c=>c.spot||c.word.toLowerCase()==='spot');s.deck.order=Array(20).fill(c.id);s.impulse={hq:'co',commands:3,spent:0};
 const r=applyVireOperation(s,op);expect(r.knowledge.spotted[t.id]).toBeTruthy();expect(r.impulse).toEqual(s.impulse);expect(r.vire_runtime.vehicles.tank.ammo).toBe(5);expect(r.vire_runtime.vehicles.tank.moved_fired).toBe(true);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);expect(s.knowledge.spotted[t.id]).toBeUndefined();
});
it('accepts an empty card without leaking whether hidden occupants exist',()=>{const s=start();for(const u of Object.values(s.units))if(u.faction==='enemy')u.location='r5c4';expect(applyVireOperation(s,op).events.at(-1).hidden).not.toBe(true);});
it('rejects pinned, inactive, distant and wrong-phase attempts atomically',()=>{
 for(const change of [s=>s.vire_runtime.vehicles.tank.pinned=true,s=>s.vire_runtime.vehicles.tank.activated=false,s=>s.phase='CLEANUP']){const s=start();change(s);const copy=structuredClone(s);expect(()=>applyVireOperation(s,op)).toThrow();expect(s).toEqual(copy);}
 expect(()=>applyVireOperation(start(),{...op,location:'r5c4'})).toThrow(/LOS/);
});
it('pre-action VOF interrupts spotting without an observation draw',()=>{const s=start();s.units.s12.faction='enemy';s.fire=[{target:'r1c1',source:'s12',value:-3,origin:'r1c2',indirect:true}];s.locations.r1c1.protection=0;
 const c=Object.values(cards).find(c=>Number(c.at)===0);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];const r=applyVireOperation(s,op);expect(r.vire_runtime.vehicles.tank.status).toBe('BREWED_UP');expect(r.events.slice(s.events.length).some(e=>e.type==='OBSERVATION')).toBe(false);
});

it('a pin from origin VOF consumes the action but does not attempt spotting',()=>{const s=start();s.units.s12.faction='enemy';s.fire=[{target:'r1c1',source:'s12',value:-3,origin:'r1c2',indirect:true}];s.locations.r1c1.protection=0;
 const c=Object.values(cards).find(c=>Number(c.at)===7);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];const r=applyVireOperation(s,op);expect(r.vire_runtime.vehicles.tank.pinned).toBe(true);expect(r.vire_runtime.vehicles.tank.moved_fired).toBe(true);expect(r.events.slice(s.events.length).some(e=>e.type==='OBSERVATION')).toBe(false);
});

it('holds the spotting action open for opposing reactions',()=>{const s=start();const enemy=structuredClone(s.vire_runtime.vehicles.tank);Object.assign(enemy,{id:'enemy',faction:'enemy',activated:false,crew:[{id:'ea',personnel:[]},{id:'eb',personnel:[]}]});s.vire_runtime.vehicles.enemy=enemy;s.knowledge.spotted.enemy={id:'enemy'};
 const r=applyVireOperation(s,op);expect(r.vire_runtime.reaction.eligible).toContain('enemy');expect(r.vire_runtime.coordinator.pending.actor).toBe('tank');expect(()=>applyVireOperation(r,{...op,id:'again'})).toThrow();
});
