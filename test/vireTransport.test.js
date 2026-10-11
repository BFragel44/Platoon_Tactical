import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {initializeVireAdapter,applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay,getVirePublicState} from '../src/sim/company/vireIntegration.js';
function start(){
 const s=createMission(cerisy,'transport');s.phase='CO_ACTIVATION';s.impulse={hq:'co',commands:3,spent:0};s.units.co.pinned=false;s.units.co.cohesion='GOOD';
 s.units.s11.location='r1c1';s.units.s11.cover=null;s.units.s11.pinned=false;s.units.s11.cohesion='GOOD';s.locations.r2c1.trafficability='Unmarked';
 return initializeVireAdapter(s,[{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',crew:[{id:'crew1',personnel:[]},{id:'crew2',personnel:[]}],ammo:5,radios:['BN']}]);
}
it('charges one vehicle command for a whole formation and preserves immutable identities through movement and disembarkation',()=>{
 const s=start(),original=structuredClone(s.units.s11);let r=applyVireOperation(s,{id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 expect(r.impulse.commands).toBe(2);expect(r.units.s11.steps).toEqual([]);expect(r.units.s11.removed).toBe('EMBARKED');expect(s.units.s11).toEqual(original);
 expect(r.vire_runtime.vehicles.tank.passengers.map(step=>step.id)).toEqual(original.steps.map(step=>step.id));
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
 r.phase='AT_COMBAT';r.vire_runtime.vehicles.tank.activated=true;
 const movementStart=structuredClone(r);movementStart.vire_runtime.operations=[];movementStart.vire_runtime.applied=[];
 r=applyVireOperation(movementStart,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank',path:['r2c1']});
 expect(()=>applyVireOperation(r,{id:'early',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']})).toThrow();
 for(let i=0;i<3;i++)r=applyVireOperation(r,{id:`step-${i}`,type:'STEP_VEHICLE_MOVE'});
 r=applyVireOperation(r,{id:'disembark',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 expect(r.units.s11.id).toBe(original.id);expect(r.units.s11.steps.map(step=>step.id)).toEqual(original.steps.map(step=>step.id));expect(r.units.s11.steps.map(step=>step.personnel)).toEqual(original.steps.map(step=>step.personnel));
 expect(r.units.s11).toMatchObject({location:'r2c1',cohesion:original.cohesion,experience:original.experience,exposed:true,removed:null});expect(r.vire_runtime.vehicles.tank.passengers).toEqual([]);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(movementStart,r))))).toEqual(r);
 expect(()=>applyVireOperation(r,{id:'repeat',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']})).toThrow();
});
it('rejects wrong phase, disconnected command, pinned/distant/duplicate passengers and over-capacity loads atomically',()=>{
 const s=start(),op={id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11']};
 for(const change of [s=>s.phase='AT_COMBAT',s=>s.units.co.radios=[],s=>s.units.s11.pinned=true,s=>s.units.s11.location='r2c1',s=>s.impulse.commands=0]){const changed=structuredClone(s);change(changed);expect(()=>applyVireOperation(changed,op)).toThrow();expect(changed.vire_runtime.vehicles.tank.passengers).toEqual([]);}
 expect(()=>applyVireOperation(s,{...op,units:['s11','s11']})).toThrow();
 s.units.s12.location='r1c1';s.units.s12.pinned=false;expect(()=>applyVireOperation(s,{...op,units:['s11','s12']})).toThrow(/capacity/);
});
it('allows a General Initiative embark order but projects only friendly passenger identities',()=>{
 const s=start();s.phase='GENERAL_INITIATIVE';s.impulse.hq='general';s.units.co.radios=[];
 const r=applyVireOperation(s,{id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 expect(r.impulse.commands).toBe(2);expect(getVirePublicState(r).passenger_formations.find(u=>u.id==='s11').embarked_on).toBe('tank');
 expect(getVirePublicState(r).passenger_formations.every(u=>r.units[u.id].faction==='friendly')).toBe(true);
});
it('stationary disembark consumes a vehicle action and waits for the opposing reaction decision',()=>{
 const s=start();let r=applyVireOperation(s,{id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 r.phase='AT_COMBAT';r.vire_runtime.vehicles.tank.activated=true;r.vire_runtime.operations=[];r.vire_runtime.applied=[];const initial=structuredClone(r);
 r=applyVireOperation(r,{id:'prepare',type:'PREPARE_DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 expect(r.vire_runtime.coordinator.pending.actor).toBe('tank');expect(r.units.s11.removed).toBe('EMBARKED');
 const waiting=structuredClone(r);waiting.vire_runtime.reaction={actor:'tank',eligible:['opponent']};
 expect(()=>applyVireOperation(waiting,{id:'early',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']})).toThrow(/reactions/);
 r=applyVireOperation(r,{id:'disembark',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 expect(r.vire_runtime.vehicles.tank.moved_fired).toBe(true);expect(r.vire_runtime.coordinator.pending).toBeNull();expect(r.units.s11).toMatchObject({location:'r1c1',removed:null,exposed:true});
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(initial,r))))).toEqual(r);
});
it('disembarks into discovered cover with capacity validation and exact replay',()=>{
 let s=applyVireOperation(start(),{id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank.activated=true;s.vire_runtime.operations=[];s.vire_runtime.applied=[];
 s.locations.r1c1.covers=[{id:'fox',type:'Foxholes',value:1,discovered:true,capacity:2}];
 s=applyVireOperation(s,{id:'prepare',type:'PREPARE_DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 const before=structuredClone(s);expect(()=>applyVireOperation(s,{id:'out',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11'],covers:{s11:'fox'}})).toThrow(/room/);expect(s).toEqual(before);
 s.locations.r1c1.covers[0].capacity=3;const initial=structuredClone(s);initial.vire_runtime.operations=[];initial.vire_runtime.applied=[];
 const r=applyVireOperation(initial,{id:'out',type:'DISEMBARK_INFANTRY',vehicle:'tank',units:['s11'],covers:{s11:'fox'}});
 expect(r.units.s11).toMatchObject({cover:'fox',exposed:true,removed:null});expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(initial,r))))).toEqual(r);
});
it('vehicle destruction during a disembark action releases riders to immediate HITs and holds the action until they resolve',()=>{
 const s=start();let r=applyVireOperation(s,{id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 r.phase='AT_COMBAT';r.vire_runtime.vehicles.tank.activated=true;r.vire_runtime.operations=[];r.vire_runtime.applied=[];
 r.locations.r1c1.protection=0;r.locations.r1c1.burst=0;r.units.s12.faction='enemy';r.fire=[{source:'s12',target:'r1c1',value:-3,indirect:true}];
 const c=Object.values(cards).find(c=>Number(c.at)===0);r.deck.order=[c.id,...r.deck.order.filter(id=>id!==c.id)];const initial=structuredClone(r);
 r=applyVireOperation(r,{id:'prepare',type:'PREPARE_DISEMBARK_INFANTRY',vehicle:'tank',units:['s11']});
 expect(r.vire_runtime.vehicles.tank.status).toBe('BREWED_UP');expect(r.vire_runtime.pending_hits).toHaveLength(3);expect(r.vire_runtime.disembark).toBeNull();expect(r.vire_runtime.coordinator.pending.actor).toBe('tank');
 const originalIds=s.units.s11.steps.map(step=>step.id);expect(r.vire_runtime.pending_hits.map(h=>h.step_id)).toEqual(originalIds);
 for(const h of r.vire_runtime.pending_hits)r=applyVireOperation(r,{id:`resolve-${h.id}`,type:'RESOLVE_CREW_HIT',hit:h.id});
 expect(r.vire_runtime.coordinator.pending).toBeNull();expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(initial,r))))).toEqual(r);
});
