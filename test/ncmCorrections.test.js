import {it,expect} from 'vitest';
import {auditNcmCalculations} from '../scripts/auditNcmCalculations.js';
import {createMission,exportReplay,replayMission,advancePhase} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {combatExposure} from '../src/sim/company/battlefield.js';
import {borders} from '../src/sim/company/terrain.js';

for(const observation of auditNcmCalculations().results)it(`NCM: ${observation.id}`,()=>{
 expect(observation.passed).toBe(true);
});
for(const scenario of [companyAssault,cerisy])it(`NCM rules survive replay and attempt initialization: ${scenario.id}`,()=>{
 const state=createMission(scenario,'ncm-version');
 const record=exportReplay(state);expect(record.ncm_corrections).toBe('v1');
 expect(replayMission(scenario,record)).toEqual(state);
 const old=exportReplay(createMission(scenario,'ncm-version',{},null,{ncm_corrections:false}));
 let historical=replayMission(scenario,old);expect(historical.mission_rules.ncmCorrections).toBeUndefined();
 historical=advancePhase(historical).state;
 expect(exportReplay(historical).ncm_corrections).toBeUndefined();
 expect(replayMission(scenario,exportReplay(historical))).toEqual(historical);
 expect(()=>replayMission(scenario,{...record,ncm_corrections:'future'})).toThrow('Unsupported NCM');
});
it('historical calculations retain both original behaviors',()=>{
 const s=createMission(companyAssault,'old-ncm'),u=s.units.s11;
 delete s.mission_rules.ncmCorrections;
 u.location='r1c1';u.cover=null;u.pinned=false;u.exposed=false;
 s.fire=[];s.support=[];s.visibility={light:0,weather:0};
 const terrain=s.locations[u.location];Object.assign(terrain,{protection:3,open_protection:3,burst:0,smoke:false});
 s.markers=Array.from({length:2},()=>({type:'GRENADE',location:u.location,target:u.id,value:-4}));
 expect(combatExposure(s,u).total).toBe(-1);
 s.mission_rules.ncmCorrections='v1';expect(combatExposure(s,u).total).toBe(-5);
 delete s.mission_rules.ncmCorrections;
 Object.assign(terrain,{protection:2,open_protection:0,borders:borders(['N'])});
 s.units.mortar={...structuredClone(u),id:'mortar',location:'r1c2',temporary_pdf:{origin:'r1c2',target:u.location}};
 s.markers=[{type:'GRENADE_MISS',location:u.location}];
 expect(combatExposure(s,u).total).toBe(-1);
 s.mission_rules.ncmCorrections='v1';expect(combatExposure(s,u).total).toBe(1);
});
