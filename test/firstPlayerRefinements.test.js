import {it,expect} from 'vitest';
import {encodeRecovery,decodeRecovery,compactRecoverySlots,writeRecoveryBundle} from '../src/ui/recoveryEncoding.js';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {createTinchebrayDevelopmentMission} from '../src/sim/company/tinchebrayMission.js';
import {saveVireRecovery,readVireRecovery,resumeVireCheckpoint} from '../src/ui/vireRecovery.js';
import {saveTinchebrayRecovery,readTinchebrayRecovery,resumeTinchebrayCheckpoint} from '../src/ui/tinchebrayRecovery.js';
import {applyVireOperation,importVireAdapterReplay,exportVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {exportReplay,getPlayerView} from '../src/sim/company/engine.js';
import {vehicleContext} from '../src/ui/vehicleInteraction.js';
import {hill192} from '../src/scenarios/hill192.js';
import {createMission} from '../src/sim/company/engine.js';
const storage=()=>{const m=new Map();return {m,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
it('compacts repeated recovery data losslessly without reinterpreting old replay versions',()=>{
 const state=createVireDevelopmentMission('storage'),st=storage();const bundle=saveVireRecovery(st,state);
 const encoded=st.getItem('platoon-vire-integration');expect(encoded.length).toBeLessThan(JSON.stringify(bundle).length*.7);
 expect(JSON.parse(decodeRecovery(encoded))).toEqual(bundle);expect(resumeVireCheckpoint(readVireRecovery(st).bundle.latest).state).toEqual(state);
 const historical={...bundle,latest:{...bundle.latest,replay:{...bundle.latest.replay,base_rules_version:1}}};
 st.setItem('platoon-vire-integration',JSON.stringify(historical));compactRecoverySlots(st);expect(readVireRecovery(st).error).toMatch(/Incompatible/);expect(JSON.parse(decodeRecovery(st.getItem('platoon-vire-integration')))).toEqual(historical);
});
it('keeps both vehicle mission slots under a bounded multi-mission quota and reloads exactly',()=>{
 const st=storage(),limit=1000000,write=st.setItem;st.setItem=(k,v)=>{const bytes=[...st.m].filter(([key])=>key!==k).reduce((n,[,raw])=>n+raw.length,0)+v.length;if(bytes>limit)throw Error('quota');write(k,v);};
 const a=createVireDevelopmentMission('a'),b=createTinchebrayDevelopmentMission('b');saveVireRecovery(st,a);saveTinchebrayRecovery(st,b);
 expect(resumeVireCheckpoint(readVireRecovery(st).bundle.latest).state).toEqual(a);expect(resumeTinchebrayCheckpoint(readTinchebrayRecovery(st).bundle.latest).state).toEqual(b);
 const before=st.getItem('platoon-tinchebray-integration');expect(()=>saveTinchebrayRecovery({...st,setItem:()=>{throw Error('quota');}},b)).toThrow('quota');expect(st.getItem('platoon-tinchebray-integration')).toBe(before);
});
it('rejects damaged encodings and leaves corrupt source bytes alone',()=>{
 expect(()=>decodeRecovery(JSON.stringify({recovery_encoding:1,root:{$recoveryRef:0},entries:[{$recoveryRef:0}]}))).toThrow(/reference/);
 const st=storage();st.setItem('platoon-company-recovery','broken json');compactRecoverySlots(st);expect(st.getItem('platoon-company-recovery')).toBe('broken json');expect(encodeRecovery('broken json')).toBe('broken json');
});
it('empty activated Jeep can hold, receives normal VOF and releases its ordered group with exact replay',()=>{
 let s=createVireDevelopmentMission('empty-jeep',{},undefined,{jeep:{use:true,location:'r0c2',passengers:[]}});
 s.phase='AT_COMBAT';s.impulse=null;s.vire_runtime.vehicles.company_jeep.activated=true;
 s=applyVireOperation(s,{id:'start',type:'START_AT_PHASE'});
 expect(vehicleContext(s,'company_jeep').view.eligible).toContain('company_jeep');expect(vehicleContext(s,'company_jeep').moveDestinations).toEqual([]);
 s.vire_runtime.operations=[];s.vire_runtime.applied=[];
 const initial=structuredClone(s);s=applyVireOperation(s,{id:'hold',type:'HOLD_VEHICLE',vehicle:'company_jeep'});
 expect(s.vire_runtime.vehicles.company_jeep.moved_fired).toBe(true);expect(s.vire_runtime.coordinator.pending).toBeNull();expect(vehicleContext(s,'company_jeep').view.eligible).not.toContain('company_jeep');expect(importVireAdapterReplay(exportVireAdapterReplay(initial,s))).toEqual(s);expect(initial.vire_runtime.vehicles.company_jeep.moved_fired).toBe(false);
});
it('player terrain labels stay concealed until actual discovery and view reads do not discover cards',()=>{
 const s=createMission(hill192,'labels');for(const l of Object.values(s.locations))if(l.row>1)l.known=false;
 const before=structuredClone(s),view=getPlayerView(s);for(const l of view.locations.filter(l=>l.known===false))expect(l.name).toBe(`${l.row}.${l.col} Unrevealed terrain`);expect(s).toEqual(before);
});
it('round-trips arbitrary presentation keys that resemble encoding markers',()=>{
 const shared={text:'repeated '.repeat(400),payload:{$recoveryRef:0},nested:{$recoveryLiteral:{$recoveryRef:2}}};
 const value={latest:shared,turnStart:structuredClone(shared)};
 expect(JSON.parse(decodeRecovery(encodeRecovery(value)))).toEqual(value);
});

it('rolls back replacement backup if writing the new checkpoint fails',()=>{
 const st=storage();st.setItem('save','old latest');st.setItem('save-previous','older backup');const write=st.setItem;
 st.setItem=(k,v)=>{if(k==='save')throw Error('quota');write(k,v);};
 expect(()=>writeRecoveryBundle(st,'save',{latest:'new'},'old latest')).toThrow('quota');
 expect(st.getItem('save')).toBe('old latest');expect(st.getItem('save-previous')).toBe('older backup');
});
