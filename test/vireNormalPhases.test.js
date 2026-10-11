import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission,advancePhase,selectHQ,eligibleHQs,resolveCombat,getPlayerView,exportReplay} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {embarkInfantry} from '../src/sim/company/vehicleTransport.js';
import {initializeVireAdapter,applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
function base(phase='RETREAT'){
 const s=createMission(cerisy,'vehicle-normal-phases');s.phase=phase;s.impulse=null;s.fire=[];s.markers=[];s.support=[];s.pending_combat=[];s.segment_progress=null;s.activated=[];s.completed=[];
 for(const c of Object.values(s.contacts))c.resolved=true;
 for(const u of Object.values(s.units)){u.vof=null;u.fire=null;u.indirect=null;u.pinned=false;}
 return initializeVireAdapter(s,[{id:'tankhq',name:'Tank Platoon HQ',command_role:'vehicle_platoon_hq',command_hq:'tankhq',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',radios:['BN'],ammo:5,crew:[{id:'hc1',personnel:[]},{id:'hc2',personnel:[]}]},{id:'tank',command_hq:'tankhq',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c2',radios:[],ammo:5,crew:[{id:'tc1',personnel:[]},{id:'tc2',personnel:[]}]}]);
}
const enable=s=>applyVireOperation(s,{id:'enable',type:'ENABLE_NORMAL_PHASES'});
const replay=(initial,s)=>importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(initial,s))));
it('normal phase stepping enters the vehicle cursor and cannot skip unfinished end-of-phase VOF',()=>{
 const initial=base();let s=enable(initial);s=advancePhase(s).state;expect(s.phase).toBe('AT_COMBAT');expect(s.vire_runtime.coordinator).toBeTruthy();expect(advancePhase(s).accepted).toBe(false);
 s=applyVireOperation(s,{id:'finish',type:'FINISH_AT_PHASE'});expect(s.vire_runtime.end_vof).toHaveLength(2);expect(advancePhase(s).accepted).toBe(false);
 s=applyVireOperation(s,{id:'end1',type:'STEP_END_VOF'});s=applyVireOperation(s,{id:'end2',type:'STEP_END_VOF'});s=advancePhase(s).state;expect(s.phase).toBe('FIRE_MISSIONS');expect(s.events.some(e=>e.phase==='AT_COMBAT'&&e.type==='PHASE_SKIPPED')).toBe(false);expect(replay(initial,s)).toEqual(s);expect(exportReplay(s).format).toBe('vire-integration');
});
it('normal stepping owns exactly one shared infantry snapshot and resets vehicle markers at cleanup',()=>{
 const initial=base();let s=enable(initial);s=advancePhase(s).state;s=applyVireOperation(s,{id:'finish',type:'FINISH_AT_PHASE'});for(let i=0;i<2;i++)s=applyVireOperation(s,{id:`end${i}`,type:'STEP_END_VOF'});
 for(let i=0;s.phase!=='COMBAT_EFFECTS'&&i<12;i++)s=advancePhase(s).state;
 expect(s.phase).toBe('COMBAT_EFFECTS');expect(s.vire_runtime.infantry_combat_prepared).toBe(true);expect(()=>applyVireOperation(s,{id:'double',type:'PREPARE_INFANTRY_COMBAT'})).toThrow(/normal phase/);
 for(let i=0;s.turn===1&&i<12;i++)s=advancePhase(s).state;
 expect(s.turn).toBe(2);expect(s.vire_runtime).toMatchObject({coordinator:null,phase_complete:false,infantry_combat_prepared:false});expect(s.vire_runtime.vehicles.tank.activated).toBe(false);expect(replay(initial,s)).toEqual(s);
});
it('vehicle HQ initiative uses the shared draw and reserve procedure without creating an infantry HQ target',()=>{
 const initial=base('PLATOON_INITIATIVE');let s=enable(initial);expect(eligibleHQs(s)).toContain('tankhq');const selected=selectHQ(s,'tankhq');expect(selected.accepted).toBe(true);s=selected.state;expect(s.impulse.hq).toBe('tankhq');expect(s.impulse.card_id).toBeTruthy();expect(s.units.tankhq).toBeUndefined();expect(()=>getPlayerView(s)).not.toThrow();
 s=applyVireOperation(s,{id:'activate',type:'ACTIVATE_VEHICLE',vehicle:'tank'});expect(s.vire_runtime.vehicles.tank.activated).toBe(true);s=advancePhase(s).state;expect(s.completed).toContain('tankhq');expect(s.vire_runtime.vehicles.tankhq.saved).toBeGreaterThanOrEqual(0);expect(eligibleHQs(s)).not.toContain('tankhq');expect(replay(initial,s)).toEqual(s);
});
it('CO activates the tank HQ over BN radio, then its activated impulse commands its assigned tanks',()=>{
 const initial=base('CO_ACTIVATION');initial.impulse={id:'test',hq:'co',commands:4,spent:0};let s=enable(initial);s=applyVireOperation(s,{id:'hqactivate',type:'ACTIVATE_VEHICLE_HQ',vehicle:'tankhq'});expect(s.impulse.commands).toBe(3);s=advancePhase(s).state;expect(s.phase).toBe('SUBORDINATE_ACTIVATION');expect(eligibleHQs(s)).toContain('tankhq');s=selectHQ(s,'tankhq').state;expect(s.impulse.allowance).toBeGreaterThanOrEqual(1);s=applyVireOperation(s,{id:'tankactivate',type:'ACTIVATE_VEHICLE',vehicle:'tank'});expect(s.impulse.spent).toBe(1);expect(replay(initial,s)).toEqual(s);
});
it('rejects disconnected CO activation, duplicate HQ activation and an unrelated vehicle HQ atomically',()=>{
 const initial=base('CO_ACTIVATION');initial.impulse={id:'test',hq:'co',commands:4,spent:0};let s=enable(initial);s.units.co.radios=[];expect(()=>applyVireOperation(s,{id:'bad',type:'ACTIVATE_VEHICLE_HQ',vehicle:'tankhq'})).toThrow();s.units.co.radios=['BN'];s=applyVireOperation(s,{id:'good',type:'ACTIVATE_VEHICLE_HQ',vehicle:'tankhq'});expect(()=>applyVireOperation(s,{id:'again',type:'ACTIVATE_VEHICLE_HQ',vehicle:'tankhq'})).toThrow();
 s.phase='PLATOON_INITIATIVE';s.impulse=null;s.activated=[];s=selectHQ(s,'tankhq').state;s.vire_runtime.vehicles.tank.command_hq='other';const before=structuredClone(s);expect(()=>applyVireOperation(s,{id:'wrong',type:'ACTIVATE_VEHICLE',vehicle:'tank'})).toThrow(/radio/);expect(s).toEqual(before);
});
it('accepted missions keep the ordinary no-vehicle phase flow',()=>{const s=createMission(cerisy,'accepted');s.phase='AT_COMBAT';s.impulse=null;const r=advancePhase(s).state;expect(r.phase).toBe('FIRE_MISSIONS');expect(r.vire_runtime).toBeUndefined();expect(r.events.some(e=>e.type==='PHASE_SKIPPED'&&e.phase==='AT_COMBAT')).toBe(true);});

it('normal Combat Effects exposes embarked infantry once and replay preserves its masked aboard state',()=>{
 const initial=base();for(const u of Object.values(initial.units))u.location='r5c4';initial.units.s11.location='r1c2';initial.vire_runtime.vehicles.tank=embarkInfantry(initial,initial.vire_runtime.vehicles.tank,['s11']);
 Object.assign(initial.units.s12,{faction:'enemy',location:'r1c3',vof:'S',range:1,fire:'r1c2'});const miss=Object.values(cards).find(c=>Number(c.at)===9);initial.deck.order=Array(20).fill(miss.id);
 let s=enable(initial);s=advancePhase(s).state;s=applyVireOperation(s,{id:'finish',type:'FINISH_AT_PHASE'});for(let i=0;i<2;i++)s=applyVireOperation(s,{id:`end${i}`,type:'STEP_END_VOF'});
 for(let i=0;s.phase!=='COMBAT_EFFECTS'&&i<12;i++)s=advancePhase(s).state;
 expect(s.pending_combat.filter(r=>r.target_id==='s11')).toHaveLength(1);expect(s.units.s11.removed).toBe('EMBARKED');expect(s.pending_combat.find(r=>r.target_id==='s11').modifiers).toContainEqual(expect.objectContaining({source:'EXPOSED',value:-2}));
 for(let i=0;s.phase==='COMBAT_EFFECTS'&&i<30;i++){const r=s.pending_combat[s.segment_progress.index];if(r?.status==='PENDING'&&r.target_visible)s=resolveCombat(s,r.id).state;else s=advancePhase(s).state;}
 expect(s.phase).toBe('CLEANUP');expect(replay(initial,s)).toEqual(s);expect(new Set(s.vire_runtime.vehicles.tank.passengers.map(p=>p.id)).size).toBe(s.vire_runtime.vehicles.tank.passengers.length);
});
it('normal phase mode rejects activation outside command impulses and disallows manual cleanup bypass',()=>{const initial=base();initial.impulse={id:'stale',hq:'general',commands:4,spent:0};const s=enable(initial);expect(()=>applyVireOperation(s,{id:'wrongphase',type:'ACTIVATE_VEHICLE',vehicle:'tank'})).toThrow();expect(()=>applyVireOperation(s,{id:'bypass',type:'CLEANUP_VEHICLES'})).toThrow(/normal phase/);});
