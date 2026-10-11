import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {initializeVireAdapter,importVireAdapterReplay,exportVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {vehicleOperationAvailable,vehicleMoveDestinations,submitVehicleInteraction,vehicleContext,withVehicleHQActivationTargets,companyVehicleActivationOperation,vehicleSpotLocations,vehicleTransportChoices} from '../src/ui/vehicleInteraction.js';
function start(enemy=false){
 const s=createMission(cerisy,'vehicle-interaction');s.phase='AT_COMBAT';s.impulse=null;s.fire=[];s.markers=[];s.support=[];
 for(const l of Object.values(s.locations))l.trafficability='Unmarked';
 let r=initializeVireAdapter(s,[{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',crew:[{id:'crew1',personnel:[]},{id:'crew2',personnel:[]}],ammo:5},...(enemy?[{id:'enemy',profile:'M4_SHERMAN75',faction:'enemy',location:'r2c2',crew:[{id:'ec1',personnel:[]},{id:'ec2',personnel:[]}],ammo:5}]:[])]);
 r.vire_runtime.vehicles.tank.activated=true;return r;
}
it('availability checks do not mutate state, deck, operation history or reveal hidden targets',()=>{
 const s=start(true),before=structuredClone(s);expect(vehicleOperationAvailable(s,{type:'ACTIVATE_VEHICLE',vehicle:'tank'})).toBe(false);
 expect(vehicleMoveDestinations(s,'tank')).toContain('r2c1');expect(vehicleContext(s,'tank').fireTargets).toEqual([]);expect(s).toEqual(before);
});
it('one movement confirmation acknowledges one card and preserves exact replay and stop choices',()=>{
 const initial=start();let s=submitVehicleInteraction(initial,{type:'PREPARE_VEHICLE_MOVE',vehicle:'tank',path:['r2c1','r3c1']});
 expect(s.vire_runtime.move.stage).toBe('REACTION');expect(s.vire_runtime.vehicles.tank.location).toBe('r2c1');expect(s.vire_runtime.move.complete).toBe(false);
 expect(s.vire_runtime.operations.map(o=>o.type)).toEqual(['PREPARE_VEHICLE_MOVE','STEP_VEHICLE_MOVE','STEP_VEHICLE_MOVE','STEP_VEHICLE_MOVE']);
 expect(importVireAdapterReplay(exportVireAdapterReplay(initial,s))).toEqual(s);
 s=submitVehicleInteraction(s,{type:'STEP_VEHICLE_MOVE'});expect(s.vire_runtime.vehicles.tank.location).toBe('r3c1');expect(s.vire_runtime.move.stage).toBe('REACTION');
 s=submitVehicleInteraction(s,{type:'STEP_VEHICLE_MOVE'});expect(s.vire_runtime.move.complete).toBe(true);expect(vehicleMoveDestinations(s,'tank')).toEqual([]);
 expect(importVireAdapterReplay(exportVireAdapterReplay(initial,s))).toEqual(s);
});
it('interrupts automatic movement continuation for an enemy reaction',()=>{
 const initial=start(true);initial.knowledge.spotted.enemy={id:'enemy'};
 const s=submitVehicleInteraction(initial,{type:'PREPARE_VEHICLE_MOVE',vehicle:'tank',path:['r2c1','r3c1']});
 expect(s.vire_runtime.move.stage).toBe('REACTION');expect(s.vire_runtime.reaction.eligible).toContain('enemy');expect(s.vire_runtime.vehicles.tank.location).toBe('r2c1');
 expect(()=>submitVehicleInteraction(s,{type:'STEP_VEHICLE_MOVE'})).toThrow(/unavailable/);
});
it('stops immediately when origin VOF destroys a vehicle before card entry',()=>{
 const initial=start();initial.fire=[{target:'r1c1',source:'s12',value:-3,origin:'r1c2',indirect:true}];initial.units.s12.faction='enemy';
 const c=Object.values(cards).find(c=>Number(c.at)===0);initial.deck.order=[c.id,...initial.deck.order.filter(id=>id!==c.id)];
 const s=submitVehicleInteraction(initial,{type:'PREPARE_VEHICLE_MOVE',vehicle:'tank',path:['r2c1']});
 expect(s.vire_runtime.vehicles.tank.status).toBe('KNOCKED_OUT');expect(s.vire_runtime.pending_hits.filter(h=>!h.resolved)).toHaveLength(2);expect(s.vire_runtime.move.complete).toBe(true);expect(s.vire_runtime.vehicles.tank.location).toBe('r1c1');expect(s.vire_runtime.operations).toHaveLength(2);
});
it('route suggestions enforce adjacency, NO, SLOW and command restrictions',()=>{
 const s=start();s.locations.r2c1.trafficability='No';expect(vehicleMoveDestinations(s,'tank')).not.toContain('r2c1');
 s.locations.r2c1.trafficability='Slow';expect(vehicleMoveDestinations(s,'tank')).toContain('r2c1');expect(vehicleMoveDestinations(s,'tank',['r2c1'])).toEqual([]);
});

it('extends the normal CO Activate HQ menu, rejects duplicate/disconnected targets and records the existing vehicle operation',()=>{
 const s=start();s.vire_runtime.normal_phase_enabled=true;s.phase='CO_ACTIVATION';s.units.co.radios=['BN'];s.impulse={hq:'co',commands:4,spent:0};
 const tank=s.vire_runtime.vehicles.tank;Object.assign(tank,{activated:false,command_role:'vehicle_platoon_hq',command_hq:'tank',radios:['BN'],name:'Sherman Platoon HQ'});
 const options=[{type:'ACTIVATE',targets:[{id:'hq1',reason:null}],available:true}];
 const projected=withVehicleHQActivationTargets(s,{id:'co'},'co',options);expect(projected[0].targets).toContainEqual({id:'tank',reason:null});expect(options[0].targets).toHaveLength(1);
 const op=companyVehicleActivationOperation(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'tank'});expect(op).toEqual({type:'ACTIVATE_VEHICLE_HQ',vehicle:'tank'});
 const next=submitVehicleInteraction(s,op);expect(next.activated).toContain('tank');expect(next.impulse.commands).toBe(3);expect(next.vire_runtime.vehicles.tank.activated).toBe(false);
 expect(importVireAdapterReplay(exportVireAdapterReplay(s,next))).toEqual(next);
 expect(withVehicleHQActivationTargets(next,{id:'co'},'co',options)[0].targets.find(t=>t.id==='tank').reason).toMatch(/Already activated/);
 s.units.co.radios=[];expect(withVehicleHQActivationTargets(s,{id:'co'},'co',options)[0].targets.find(t=>t.id==='tank').reason).toBeTruthy();
 expect(companyVehicleActivationOperation(s,{type:'ACTIVATE',unit_id:'hq1',issuer_id:'co',target_id:'tank'})).toBeNull();
 expect(withVehicleHQActivationTargets(s,{id:'hq1'},'co',options)).toBe(options);
});

it('offers vehicle Spot only for current suspected, unspotted positions in vehicle LOS',()=>{
 const s=start(),target=s.units.s11;Object.assign(target,{faction:'enemy',location:'r1c1'});delete s.knowledge.spotted[target.id];
 expect(vehicleSpotLocations(s,'tank')).toEqual([]); // Hidden occupants alone are not player knowledge.
 s.knowledge.suspected.r1c1=true;const before=structuredClone(s);expect(vehicleSpotLocations(s,'tank')).toEqual(['r1c1']);expect(s).toEqual(before);
 s.knowledge.spotted[target.id]={id:target.id};expect(vehicleSpotLocations(s,'tank')).toEqual([]);
 delete s.knowledge.spotted[target.id];target.location='r5c4';s.knowledge.suspected.r5c4=true;expect(vehicleSpotLocations(s,'tank')).toEqual([]);
 target.location='r1c1';s.vire_runtime.vehicles.tank.pinned=true;expect(vehicleSpotLocations(s,'tank')).toEqual([]);
 s.vire_runtime.vehicles.tank.pinned=false;s.vire_runtime.vehicles.tank.moved_fired=true;expect(vehicleSpotLocations(s,'tank')).toEqual([]);
});

it('transport choices exclude other cards and areas and other vehicles carried loads',()=>{
 const s=start(true);s.assets=[{id:'here',type:'AMMO',key:'MG',quantity:1,location:'r1c1',faction:'friendly'},{id:'elsewhere',type:'AMMO',key:'MG',quantity:1,location:'r2c1',faction:'friendly'},{id:'other_area',type:'AMMO',key:'MG',quantity:1,location:'r1c1',area:'upper',faction:'friendly'}];
 s.casualties=[{id:'local',faction:'friendly',location:'r1c1'},{id:'remote',faction:'friendly',location:'r3c3'}];
 s.vire_runtime.vehicles.enemy.cargo=[{id:'other_load',type:'AMMO',key:'MG',quantity:1}];
 const before=structuredClone(s),choices=vehicleTransportChoices(s,'tank');expect(choices.loadAssets.map(a=>a.id)).toEqual(['here']);expect(choices.loadCasualties.map(c=>c.id)).toEqual(['local']);expect(choices.unloadAssets).toEqual([]);expect(choices.unloadCasualties).toEqual([]);expect(s).toEqual(before);
 s.assets=[];s.casualties=[];expect(vehicleTransportChoices(s,'tank').loadAssets).toEqual([]);
 s.vire_runtime.vehicles.tank.cargo=[{id:'own',type:'AMMO',key:'MG',quantity:1}];expect(vehicleTransportChoices(s,'tank').unloadAssets.map(a=>a.id)).toEqual(['own']);
});

it('rejects outside-boundary vehicle routes atomically and omits those destinations from UI choices',()=>{
 const s=start();s.locations.r2c1.outside_boundary=true;const before=structuredClone(s);
 expect(vehicleMoveDestinations(s,'tank')).not.toContain('r2c1');
 expect(()=>submitVehicleInteraction(s,{type:'PREPARE_VEHICLE_MOVE',vehicle:'tank',path:['r2c1']})).toThrow(/Outside the mission boundaries/);
 expect(()=>submitVehicleInteraction(s,{type:'PREPARE_VEHICLE_MOVE',vehicle:'tank',path:['r1c2','r2c1']})).toThrow(/Outside the mission boundaries/);
 expect(s).toEqual(before);expect(vehicleMoveDestinations(s,'tank')).toContain('r1c2');
});
