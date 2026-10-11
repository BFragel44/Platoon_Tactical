import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {vehicleLoadReason} from '../src/sim/company/vehicleCargo.js';
import {initializeVireAdapter,applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay,getVirePublicState} from '../src/sim/company/vireIntegration.js';
function start(){
 const s=createMission(cerisy,'vehicle-cargo');s.phase='CO_ACTIVATION';s.impulse={hq:'co',commands:4,spent:0};s.units.co.cohesion='GOOD';s.units.co.pinned=false;s.locations.r1c1.protection=0;s.locations.r1c1.burst=0;
 s.assets=[{id:'radio',type:'RADIO',net:'CO',faction:'friendly',location:'r1c1'},{id:'ammo',type:'AMMO',key:'MG',quantity:24,location:'r1c1'}];
 s.casualties=[{id:'casualty1',step:{id:'casualty-step',personnel:[]},faction:'friendly',location:'r1c1',carrier:null,evacuated:false,disposition:'UNRESOLVED'}];
 return initializeVireAdapter(s,[{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',crew:[{id:'crew1',personnel:[]},{id:'crew2',personnel:[]}],ammo:5,radios:['BN']}]);
}
it('loads/unloads assets and swaps a casualty for ammunition in one command without duplicating identities',()=>{
 const s=start();let r=applyVireOperation(s,{id:'load',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',load_assets:['radio'],load_casualties:['casualty1']});
 expect(r.impulse.commands).toBe(3);expect(r.assets.find(a=>a.id==='radio')).toBeUndefined();expect(r.casualties[0]).toMatchObject({carrier:'tank',location:null,disposition:'UNRESOLVED'});
 r=applyVireOperation(r,{id:'swap',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',unload_casualties:['casualty1'],load_assets:['ammo']});
 expect(r.impulse.commands).toBe(2);expect(r.casualties).toHaveLength(1);expect(r.casualties[0]).toMatchObject({carrier:null,location:'r1c1'});expect(r.vire_runtime.vehicles.tank.cargo.map(a=>a.id)).toEqual(['radio','ammo']);
 r=applyVireOperation(r,{id:'unload',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',unload_assets:['radio','ammo']});expect(r.assets.map(a=>a.id).sort()).toEqual(['ammo','radio']);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
});
it('enforces printed ammunition boundaries, mutually exclusive payloads and clone-first failures',()=>{
 const s=start(),v=s.vire_runtime.vehicles.tank;
 for(const [key,maximum] of [['MG',24],['MTR',8],['RCL',12],['RKT',12],['FT',4]]){const test=structuredClone(v);test.cargo=[{type:'AMMO',key,quantity:maximum}];expect(vehicleLoadReason(test)).toBeNull();test.cargo[0].quantity++;expect(vehicleLoadReason(test)).toMatch(/capacity/);}
 expect(()=>applyVireOperation(s,{id:'mixed',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',load_assets:['ammo'],load_casualties:['casualty1']})).toThrow(/mixed/);expect(s.assets).toHaveLength(2);expect(s.casualties[0].carrier).toBeNull();expect(s.impulse.commands).toBe(4);
 expect(()=>applyVireOperation(s,{id:'duplicate',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',load_assets:['radio','radio']})).toThrow();
 s.assets[0].location='r2c1';expect(()=>applyVireOperation(s,{id:'distant',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',load_assets:['radio']})).toThrow(/area/);
});
it('knockout drops a loaded casualty once; brewed-up losses preserve its unresolved disposition',()=>{
 for(const [value,status] of [[2,'KNOCKED_OUT'],[0,'BREWED_UP']]){
  let r=applyVireOperation(start(),{id:'load',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',load_assets:['radio'],load_casualties:['casualty1']});
  r.phase='AT_COMBAT';r.vire_runtime.operations=[];r.vire_runtime.applied=[];r.units.s12.faction='enemy';r.fire=[{source:'s12',target:'r1c1',value:-3,indirect:true}];const c=Object.values(cards).find(c=>Number(c.at)===value);r.deck.order=[c.id,...r.deck.order.filter(id=>id!==c.id)];const initial=structuredClone(r);
  r=applyVireOperation(r,{id:'start',type:'START_AT_PHASE'});r=applyVireOperation(r,{id:'end',type:'FINISH_AT_PHASE'});r=applyVireOperation(r,{id:'vof',type:'STEP_END_VOF'});
  expect(r.vire_runtime.vehicles.tank.status).toBe(status);expect(r.casualties.filter(c=>c.id==='casualty1')).toHaveLength(1);const record=r.casualties.find(c=>c.id==='casualty1');expect(record.disposition).toBe('UNRESOLVED');expect(record.carrier).toBeNull();
  if(status==='KNOCKED_OUT'){expect(record.location).toBe('r1c1');expect(r.assets.some(a=>a.id==='radio')).toBe(true);}else{expect(record.unavailable).toBe('LOST_IN_VEHICLE');expect(r.vire_runtime.lost_loads.map(a=>a.id)).toEqual(['radio','casualty1']);}
  expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(initial,r))))).toEqual(r);
 }
});
it('conceals enemy loads and excludes carried casualties from ground selections',()=>{
 const s=start();s.assets.push({id:'hidden-asset',type:'RADIO',faction:'enemy',location:'r5c1'});s.casualties.push({id:'enemy-casualty',faction:'enemy',location:'r5c1'});
 const r=applyVireOperation(s,{id:'load',type:'TRANSFER_VEHICLE_LOAD',vehicle:'tank',load_casualties:['casualty1']});const view=getVirePublicState(r);
 expect(view.ground_loads.casualties).toEqual([]);expect(view.carried_loads[0].casualties).toEqual([{id:'casualty1'}]);expect(JSON.stringify(view)).not.toContain('hidden-asset');expect(JSON.stringify(view)).not.toContain('enemy-casualty');
});
