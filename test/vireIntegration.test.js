import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {initializeVireAdapter,applyVireOperation,replayVireOperations,exportVireAdapterReplay,importVireAdapterReplay,getVirePublicState} from '../src/sim/company/vireIntegration.js';
function start(){const s=createMission(cerisy,'vire-adapter');s.units.co.pinned=false;s.units.co.cohesion='GOOD';s.impulse={hq:'co',commands:3,spent:0};s.locations.r1c1.protection=0;
 s.knowledge.spotted.tank1={id:'tank1'};return initializeVireAdapter(s,['friendly','enemy'].map((f,i)=>({id:`tank${i}`,profile:'M4_SHERMAN75',faction:f,location:'r1c1',crew:[{id:`crew${i}a`,personnel:[]},{id:`crew${i}b`,personnel:[]}],ammo:5,radios:['BN']})));}
it('activation charges the current command pool and requires legal radio authority rather than voice contact',()=>{
 const s=start(),op={id:'activate1',type:'ACTIVATE_VEHICLE',vehicle:'tank0'};
 const r=applyVireOperation(s,op);expect(r.impulse.commands).toBe(2);expect(r.vire_runtime.vehicles.tank0.activated).toBe(true);
 expect(s.impulse.commands).toBe(3);expect(()=>applyVireOperation(r,op)).toThrow(/Duplicate/);
 s.units.co.radios=[];expect(()=>applyVireOperation(s,op)).toThrow(/radio/);
 s.impulse.hq='general';expect(applyVireOperation(s,op).vire_runtime.vehicles.tank0.activated).toBe(true);
});
it('coordinates a Quick Shot decision, then an unactivated enemy reaction without reaction loops',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;
 const pin=Object.values(cards).find(c=>Number(c.at)===7),miss=Object.values(cards).find(c=>Number(c.at)===9);
 s.deck.order=[pin.id,miss.id,...s.deck.order.filter(id=>![pin.id,miss.id].includes(id))];
 let r=applyVireOperation(s,{id:'fire',type:'AT_FIRE',firer:'tank0',target:'tank1'});
 expect(r.vire_runtime.quick).toMatchObject({firer:'tank0',reaction:false});expect(r.vire_runtime.vehicles.tank0.moved_fired).toBe(false);
 expect(()=>applyVireOperation(r,{id:'early-reaction',type:'REACTION_FIRE',firer:'tank1',target:'tank0'})).toThrow();
 r=applyVireOperation(r,{id:'decline',type:'DECLINE_QUICK_SHOT'});expect(r.vire_runtime.reaction.eligible).toContain('tank1');
 r=applyVireOperation(r,{id:'react',type:'AUTO_ENEMY_REACTION'});
 expect(r.vire_runtime.reaction.eligible).toEqual([]);expect(r.vire_runtime.vehicles.tank1.ammo).toBe(4);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
 const invalid=exportVireAdapterReplay(s,r);invalid.version=99;expect(()=>importVireAdapterReplay(invalid)).toThrow(/Incompatible/);
});
it('movement VOF consumes an AT result card and interrupts a destroyed vehicle before card entry',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;s.vire_runtime.vehicles.tank1.status='RETREATED';
 s.fire=[{target:'r1c1',source:'s12',value:-3,origin:'r1c2',indirect:true}];s.units.s12.faction='enemy';
 s.locations.r2c1.trafficability='Unmarked';
 const c=Object.values(cards).find(c=>Number(c.at)===0);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];
 let r=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1']});
 r=applyVireOperation(r,{id:'vof',type:'STEP_VEHICLE_MOVE'});
 expect(r.vire_runtime.vehicles.tank0.status).toBe('BREWED_UP');expect(r.vire_runtime.move.complete).toBe(true);expect(r.vire_runtime.vehicles.tank0.location).toBe('r1c1');
 expect(r.casualties.filter(c=>c.origin_name.includes('tank0'))).toHaveLength(2);
});
it('public integration projection conceals unspotted vehicles, enemy ammo and pending enemy reactions',()=>{
 const s=start();delete s.knowledge.spotted.tank1;s.vire_runtime.reaction={actor:'tank0',eligible:['tank1']};
 expect(getVirePublicState(s).vehicles.map(v=>v.id)).toEqual(['tank0']);expect(getVirePublicState(s).reaction.eligible).toEqual([]);
 s.knowledge.spotted.tank1={id:'tank1'};expect(getVirePublicState(s).vehicles.find(v=>v.id==='tank1').ammo).toBeNull();
});
it('uses authoritative terrain/LOS and rejects movement through actual No/Slow terrain',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;
 s.locations.r2c1.trafficability='No';
 expect(()=>applyVireOperation(s,{id:'move',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1']})).toThrow(/Illegal/);
 s.locations.r2c1.trafficability='Slow';
 expect(()=>applyVireOperation(s,{id:'move',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1','r3c1']})).toThrow(/SLOW/);
 expect(applyVireOperation(s,{id:'move',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1']}).vire_runtime.move.path).toEqual(['r2c1']);
 s.vire_runtime.vehicles.tank1.location='r5c4';
 expect(()=>applyVireOperation(s,{id:'fire',type:'AT_FIRE',firer:'tank0',target:'tank1'})).toThrow(/LOS/);
 s.vire_runtime.vehicles.tank1.location='r1c1';delete s.knowledge.spotted.tank1;
 expect(()=>applyVireOperation(s,{id:'hidden-fire',type:'AT_FIRE',firer:'tank0',target:'tank1'})).toThrow(/LOS/);
});
it('applies knockout, resolves actual crew HIT cards and replays the entire operation sequence exactly',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;
 const card=Object.values(cards).find(c=>Number(c.at)===3);s.deck.order=[card.id,...s.deck.order.filter(id=>id!==card.id)];
 const fire={id:'fire1',type:'AT_FIRE',firer:'tank0',target:'tank1'};let r=applyVireOperation(s,fire);
 expect(r.vire_runtime.vehicles.tank0.ammo).toBe(4);expect(r.vire_runtime.vehicles.tank1.status).toBe('KNOCKED_OUT');
 expect(r.vire_runtime.pending_hits).toHaveLength(2);
 expect(()=>applyVireOperation(r,{id:'move1',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1']})).toThrow(/immediate/);
 const ops=[fire,...r.vire_runtime.pending_hits.map(h=>({id:`resolve:${h.id}`,type:'AUTO_ENEMY_HIT'}))];
 for(const op of ops.slice(1))r=applyVireOperation(r,op);
 expect(r.vire_runtime.pending_hits.every(h=>h.resolved&&Number.isInteger(h.card_id))).toBe(true);
 expect(replayVireOperations(JSON.parse(JSON.stringify(s)),ops)).toEqual(r);
 expect(()=>applyVireOperation(r,{id:'repeat',type:'RESOLVE_CREW_HIT',hit:r.vire_runtime.pending_hits[0].id})).toThrow(/unavailable/);
});
it('starts enemy CSR activation once, including conditional same-card infantry AT weapons',()=>{
 const s=start();s.phase='AT_COMBAT';
 for(const [id,profile,location] of [['gun','PAK40','r2c1'],['faust','PANZERFAUST','r1c1'],['distant','INFANTRY_GUN75','r2c1']])s.vire_runtime.vehicles[id]={id,profile,location,faction:'enemy',status:'ACTIVE',activated:false,moved_fired:false,ammo:2};
 const r=applyVireOperation(s,{id:'start',type:'START_AT_PHASE'});
 expect(r.vire_runtime.vehicles.gun.activated).toBe(true);expect(r.vire_runtime.vehicles.faust.activated).toBe(true);expect(r.vire_runtime.vehicles.distant.activated).toBe(false);
 expect(()=>applyVireOperation(r,{id:'restart',type:'START_AT_PHASE'})).toThrow(/already/);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
it('blocks AT-group actions while a tank remains eligible and holds the tank action through crew HITs',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;
 s.vire_runtime.vehicles.gun={id:'gun',profile:'BAZOOKA',faction:'friendly',location:'r1c1',status:'ACTIVE',activated:true,moved_fired:false,ammo:2};
 expect(()=>applyVireOperation(s,{id:'early-gun',type:'AT_FIRE',firer:'gun',target:'tank1'})).toThrow(/group/);
 const c=Object.values(cards).find(c=>Number(c.at)===3);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];
 let r=applyVireOperation(s,{id:'tank-fire',type:'AT_FIRE',firer:'tank0',target:'tank1'});
 expect(r.vire_runtime.coordinator.pending.actor).toBe('tank0');expect(getVirePublicState(r).eligible).toEqual([]);
 r=applyVireOperation(r,{id:'hit-a',type:'AUTO_ENEMY_HIT'});expect(r.vire_runtime.coordinator.pending.actor).toBe('tank0');
 r=applyVireOperation(r,{id:'hit-b',type:'AUTO_ENEMY_HIT'});expect(r.vire_runtime.coordinator.pending).toBeNull();expect(getVirePublicState(r).eligible).toEqual([]);expect(r.vire_runtime.vehicles.gun.activated).toBe(true);expect(r.vire_runtime.vehicles.gun.moved_fired).toBe(false);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
it('allows friendly reaction refusal without spending ammunition or consuming the later activation',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.reaction={actor:'tank1',eligible:['tank0']};
 const r=applyVireOperation(s,{id:'decline-reaction',type:'DECLINE_REACTION',firer:'tank0'});
 expect(r.vire_runtime.reaction.eligible).toEqual([]);expect(r.vire_runtime.vehicles.tank0.ammo).toBe(5);expect(r.vire_runtime.vehicles.tank0.moved_fired).toBe(false);
 expect(()=>applyVireOperation(r,{id:'duplicate-decision',type:'DECLINE_REACTION',firer:'tank0'})).toThrow(/unavailable/);
 s.vire_runtime.reaction={actor:'tank0',eligible:['tank1']};expect(()=>applyVireOperation(s,{id:'enemy-decline',type:'DECLINE_REACTION',firer:'tank1'})).toThrow(/unavailable/);
});
it('resolves stationary origin VOF before firing and preserves a destroyed firer without spending AT ammo',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;
 s.fire=[{target:'r1c1',source:'s12',value:-3,indirect:true}];s.units.s12.faction='enemy';
 const c=Object.values(cards).find(c=>Number(c.at)===0);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];
 const r=applyVireOperation(s,{id:'fire-under-vof',type:'AT_FIRE',firer:'tank0',target:'tank1'});
 expect(r.vire_runtime.vehicles.tank0.status).toBe('BREWED_UP');expect(r.vehicle_at_shots).toBeUndefined();expect(r.vire_runtime.coordinator.pending).toBeNull();
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
it('rejects normal and reaction tank fire with passengers or casualties aboard without spending ammunition',()=>{
 const s=start();s.phase='AT_COMBAT';const v=s.vire_runtime.vehicles.tank0;v.activated=true;v.passengers=[{id:'rider',personnel:[],experience:'Line'}];
 expect(()=>applyVireOperation(s,{id:'laden-fire',type:'AT_FIRE',firer:'tank0',target:'tank1'})).toThrow(/disembark/);
 s.vire_runtime.reaction={actor:'tank1',eligible:['tank0']};expect(()=>applyVireOperation(s,{id:'laden-reaction',type:'REACTION_FIRE',firer:'tank0',target:'tank1'})).toThrow(/disembark/);
 v.passengers=[];v.transported_casualties=[{id:'casualty'}];expect(()=>applyVireOperation(s,{id:'casualty-fire',type:'AT_FIRE',firer:'tank0',target:'tank1'})).toThrow(/disembark/);
 expect(v.ammo).toBe(5);expect(s.vire_runtime.operations).toEqual([]);
});
it('resolves nonacting vehicle VOF at phase end, clears only unattacked pins, and resets activation only in Cleanup',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.pinned=true;s.vire_runtime.vehicles.tank1.pinned=true;
 let r=applyVireOperation(s,{id:'begin',type:'START_AT_PHASE'});
 r=applyVireOperation(r,{id:'finish',type:'FINISH_AT_PHASE'});expect(r.vire_runtime.end_vof).toEqual(['tank0','tank1']);
 expect(()=>applyVireOperation(r,{id:'early-cleanup',type:'CLEANUP_VEHICLES'})).toThrow();
 r=applyVireOperation(r,{id:'end-a',type:'STEP_END_VOF'});expect(r.vire_runtime.phase_complete).toBeFalsy();
 r=applyVireOperation(r,{id:'end-b',type:'STEP_END_VOF'});expect(r.vire_runtime.phase_complete).toBe(true);expect(r.vire_runtime.vehicles.tank0.pinned).toBe(false);
 expect(()=>applyVireOperation(r,{id:'again',type:'STEP_END_VOF'})).toThrow();
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
 r.phase='CLEANUP';r=applyVireOperation(r,{id:'cleanup',type:'CLEANUP_VEHICLES'});expect(r.vire_runtime.coordinator).toBeNull();expect(r.vire_runtime.phase_complete).toBe(false);
 r.phase='AT_COMBAT';expect(applyVireOperation(r,{id:'next-phase',type:'START_AT_PHASE'}).vire_runtime.coordinator).toBeTruthy();
});
it('holds phase completion through end-of-phase knockout HITs and replays each partial checkpoint',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank1.status='RETREATED';s.locations.r1c1.burst=0;
 s.fire=[{target:'r1c1',source:'s12',value:-3,indirect:true}];s.units.s12.faction='enemy';
 const c=Object.values(cards).find(c=>Number(c.at)===2);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];
 let r=s;
 for(const op of [{id:'start',type:'START_AT_PHASE'},{id:'end',type:'FINISH_AT_PHASE'},{id:'vof',type:'STEP_END_VOF'}]){r=applyVireOperation(r,op);expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);}
 expect(r.vire_runtime.vehicles.tank0.status).toBe('KNOCKED_OUT');expect(r.vire_runtime.phase_complete).toBeFalsy();
 for(const h of r.vire_runtime.pending_hits)r=applyVireOperation(r,{id:`hit-${h.id}`,type:'RESOLVE_CREW_HIT',hit:h.id});
 expect(r.vire_runtime.phase_complete).toBe(true);expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
it('retains an attacked vehicle pin even when end-of-phase VOF misses',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank1.status='RETREATED';s.vire_runtime.vehicles.tank0.pinned=true;s.locations.r1c1.burst=0;
 s.fire=[{target:'r1c1',source:'s12',value:-3,indirect:true}];s.units.s12.faction='enemy';
 const c=Object.values(cards).find(c=>Number(c.at)===9);s.deck.order=[c.id,...s.deck.order.filter(id=>id!==c.id)];
 let r=applyVireOperation(s,{id:'start',type:'START_AT_PHASE'});r=applyVireOperation(r,{id:'finish',type:'FINISH_AT_PHASE'});r=applyVireOperation(r,{id:'vof',type:'STEP_END_VOF'});
 expect(r.vire_runtime.phase_complete).toBe(true);expect(r.vire_runtime.vehicles.tank0.pinned).toBe(true);expect(r.vire_runtime.vehicles.tank0.attacked).toBe(false);
});
it('moves then fires with its printed penalty, retaining that penalty for Quick Shot and stopping the remaining path',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;s.vire_runtime.vehicles.tank1.location='r2c1';s.vire_runtime.vehicles.tank1.ammo=0;
 s.locations.r2c1.trafficability='Unmarked';s.locations.r3c1.trafficability='Unmarked';s.locations.r2c1.protection=0;
 const pin=Object.values(cards).find(c=>Number(c.at)===5),miss=Object.values(cards).find(c=>Number(c.at)===9);s.deck.order=[pin.id,miss.id,...s.deck.order.filter(id=>![pin.id,miss.id].includes(id))];
 let r=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1','r3c1']});
 expect(()=>applyVireOperation(r,{id:'premature',type:'MOVE_AT_FIRE',firer:'tank0',target:'tank1'})).toThrow();
 for(let i=0;i<3;i++)r=applyVireOperation(r,{id:`step-${i}`,type:'STEP_VEHICLE_MOVE'});
 r=applyVireOperation(r,{id:'move-fire',type:'MOVE_AT_FIRE',firer:'tank0',target:'tank1'});
 expect(r.vehicle_at_shots[0]).toMatchObject({modifier:-1,sum:4,result:'PINNED'});expect(r.vire_runtime.move.complete).toBe(true);
 r=applyVireOperation(r,{id:'quick',type:'QUICK_SHOT',firer:'tank0',target:'tank1'});expect(r.vehicle_at_shots[1]).toMatchObject({modifier:-2,sum:7,result:'MISSED'});
 expect(r.vire_runtime.vehicles.tank0.location).toBe('r2c1');expect(()=>applyVireOperation(r,{id:'continue',type:'STEP_VEHICLE_MOVE'})).toThrow();
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
it('can stop a movement path after reactions without moving to the next card',()=>{
 const s=start();s.phase='AT_COMBAT';s.vire_runtime.vehicles.tank0.activated=true;s.vire_runtime.vehicles.tank1.status='RETREATED';s.locations.r2c1.trafficability='Unmarked';s.locations.r3c1.trafficability='Unmarked';
 let r=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:'tank0',path:['r2c1','r3c1']});
 for(let i=0;i<3;i++)r=applyVireOperation(r,{id:`step-${i}`,type:'STEP_VEHICLE_MOVE'});
 r=applyVireOperation(r,{id:'stop',type:'STOP_VEHICLE_MOVE'});r=applyVireOperation(r,{id:'complete',type:'STEP_VEHICLE_MOVE'});
 expect(r.vire_runtime.vehicles.tank0.location).toBe('r2c1');expect(r.vire_runtime.vehicles.tank0.moved_fired).toBe(true);expect(r.vire_runtime.coordinator.pending).toBeNull();
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
