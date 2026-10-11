import {it,expect} from 'vitest';
import {createVehicle,embarkVehicle,disembarkVehicle,applyVehicleResult,finishVehicleCombatPhase,cleanupVehicleActivation} from '../src/sim/company/vehicleState.js';
const crew=[{id:'crew1',personnel:['p1']},{id:'crew2',personnel:['p2']}];
const tank=()=>createVehicle({id:'m4_1',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',crew,ammo:5});
const rider={id:'squad-step',personnel:['p3'],location:'r1c1',cohesion:'GOOD'};
it('preserves immutable crew identities and enforces actual vehicle profiles/capacities',()=>{
 const v=tank();expect(v.crew).toEqual(crew);v.crew[0].personnel.push('changed');expect(crew[0].personnel).toEqual(['p1']);
 expect(()=>createVehicle({id:'bad',profile:'M5_LIGHT37',faction:'friendly',location:'r1c1',crew})).toThrow();
 const full=embarkVehicle(tank(),Array.from({length:4},(_,i)=>({...rider,id:`rider${i}`})));
 expect(()=>embarkVehicle(full,[rider])).toThrow(/capacity/);
 expect(()=>embarkVehicle(tank(),[{...rider,location:'r2c1'}])).toThrow();
});
it('brewed up preserves step identities as unresolved casualties and loses the transported load',()=>{
 const v=embarkVehicle(tank(),[rider]);v.cargo=[{id:'radio',type:'RADIO'}];
 const r=applyVehicleResult(v,{id:'attack1',result:'BREWED_UP'});
 expect(r.casualties.map(s=>s.id)).toEqual(['crew1','crew2']);
 expect(r.pending_hits.map(h=>h.step_id)).toEqual(['squad-step']);expect(r.fire_teams[0]).toMatchObject({id:'squad-step',cohesion:'GOOD',exposed:true,embarked_on:null});
 expect(r.casualties.every(s=>s.disposition==='UNRESOLVED')).toBe(true);
 expect(r.wreck.provides_cover).toBe(false);expect(r.vehicle.ammo).toBe(0);expect(r.lost_items).toEqual(v.cargo);
 expect(v.status).toBe('ACTIVE');
});
it('knocked out queues immediate HITs rather than inventing personnel outcomes; drops non-ammo assets',()=>{
 const v=embarkVehicle(tank(),[rider]);v.cargo=[{id:'radio',type:'RADIO'},{id:'mg',type:'AMMO'}];v.transported_casualties=[{id:'casualty-step'}];
 const r=applyVehicleResult(v,{id:'attack1',result:'KNOCKED_OUT'});
 expect(r.fire_teams.map(s=>s.id)).toEqual(['crew1','crew2','squad-step']);expect(r.pending_hits).toHaveLength(3);
 expect(r.fire_teams.slice(0,2).every(s=>s.cover===r.wreck.id&&s.exposed&&s.cohesion==='F')).toBe(true);expect(r.fire_teams[2]).toMatchObject({cohesion:'GOOD',exposed:true,embarked_on:null});expect(r.fire_teams[2].cover).toBeUndefined();
 expect(r.dropped_assets).toEqual([v.cargo[0]]);expect(r.lost_items).toEqual([v.cargo[1]]);expect(r.dropped_casualties[0].id).toBe('casualty-step');
});
it('retreat removes passengers with the vehicle without turning them into casualties',()=>{
 const r=applyVehicleResult(embarkVehicle(tank(),[rider]),{id:'attack1',result:'RETREAT'});
 expect(r.vehicle.status).toBe('RETREATED');expect(r.removed_steps).toHaveLength(3);expect(r.casualties).toEqual([]);expect(r.vehicle.ammo).toBe(5);
});
it('pinning a tank immediately disembarks and queues HITs for its riders, not its crew',()=>{
 const r=applyVehicleResult(embarkVehicle(tank(),[rider]),{id:'attack1',result:'PINNED'});
 expect(r.vehicle.pinned).toBe(true);expect(r.vehicle.passengers).toEqual([]);expect(r.vehicle.crew).toHaveLength(2);
 expect(r.pending_hits.map(h=>h.step_id)).toEqual(['squad-step']);expect(r.fire_teams[0].cohesion).toBe('GOOD');
});
it('prevents duplicate result application after save/reload and clears pins only after unattacked phases',()=>{
 const r=applyVehicleResult(tank(),{id:'attack1',result:'MISSED'}),saved=JSON.parse(JSON.stringify(r.vehicle));
 expect(()=>applyVehicleResult(saved,{id:'attack1',result:'MISSED'})).toThrow(/already/);
 saved.pinned=true;expect(finishVehicleCombatPhase(saved).pinned).toBe(true);
 expect(finishVehicleCombatPhase(finishVehicleCombatPhase(saved)).pinned).toBe(false);
 saved.activated=true;saved.moved_fired=true;expect(cleanupVehicleActivation(saved)).toMatchObject({activated:false,moved_fired:false});
});
it('requires the same card area and counts transported casualties against passenger capacity',()=>{
 const v=tank();v.area='STREET';
 expect(()=>embarkVehicle(v,[{...rider,area:'BUILDING'}])).toThrow();
 v.transported_casualties=[{id:'casualty1'},{id:'casualty2'},{id:'casualty3'}];
 expect(()=>embarkVehicle(v,[{...rider,area:'STREET'},{...rider,id:'other',area:'STREET'}])).toThrow(/capacity/);
 expect(()=>embarkVehicle(v,[{...rider,area:'STREET'}])).toThrow(/mixed/);
});
it('disembarks selected passengers exposed at the current vehicle location without losing identities or changing others',()=>{
 const v=embarkVehicle(tank(),[rider,{...rider,id:'other'}]);v.location='r2c1';
 const r=disembarkVehicle(JSON.parse(JSON.stringify(v)),[rider.id],{cover:'foxholes'});
 expect(r.steps[0]).toMatchObject({id:rider.id,personnel:['p3'],location:'r2c1',exposed:true,embarked_on:null,cover:'foxholes'});expect(r.vehicle.passengers.map(s=>s.id)).toEqual(['other']);expect(v.passengers).toHaveLength(2);
 expect(()=>disembarkVehicle(r.vehicle,[rider.id])).toThrow();expect(()=>disembarkVehicle(v,[rider.id,rider.id])).toThrow();
});
