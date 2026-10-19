import {it,expect} from 'vitest';
import {createMission,exportReplay,replayMission,advancePhase} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {combatExposure} from '../src/sim/company/battlefield.js';
function fixture(){
 const s=createMission(companyAssault,'grenade-visibility'),u=s.units.s11;
 u.location='r1c1';u.cover=null;u.pinned=false;u.exposed=false;
 Object.assign(s.locations[u.location],{protection:0,open_protection:0,burst:0,smoke:false});
 s.fire=[];s.support=[];s.markers=[{type:'GRENADE_MISS',location:u.location}];s.visibility={light:0,weather:0};
 return {s,u};
}
for(const [name,light,weather,smoke,expected] of [['daylight',0,0,false,-1],['night',3,0,false,2],['weather',0,2,false,1],['combined',3,2,false,4],['smoke',0,0,true,1]])it(`lone grenade miss uses standard modifiers: ${name}`,()=>{
 const {s,u}=fixture();s.visibility={light,weather};s.locations[u.location].smoke=smoke;
 expect(combatExposure(s,u).total).toBe(expected);
});
it('illumination reduces the lone-miss light modifier',()=>{
 const {s,u}=fixture();s.visibility={light:3,weather:1};s.markers.push({type:'ILLUMINATION',location:u.location,center:2,adjacent:0});
 expect(combatExposure(s,u).total).toBe(1);
});
it('successful grenades remain exempt and a miss is counted once alongside other fire',()=>{
 const {s,u}=fixture();s.visibility={light:3,weather:2};s.locations[u.location].smoke=true;
 s.markers.push({type:'GRENADE',location:u.location,target:u.id,value:-4});
 expect(combatExposure(s,u).total).toBe(-5);
 s.markers=s.markers.filter(m=>m.type!=='GRENADE');s.fire=[{source:'external',origin:'r2c1',target:u.location,value:-1,indirect:false}];
 expect(combatExposure(s,u).total).toBe(5); // -1 fire +5 visibility +2 smoke -1 miss
});
it('new replays retain the correction and historical replays preserve their original rule',()=>{
 const original=createMission(companyAssault,'grenade-replay'),newRecord=exportReplay(original);
 expect(newRecord.grenade_miss_visibility).toBe(true);expect(replayMission(companyAssault,newRecord)).toEqual(original);
 const oldRecord=structuredClone(newRecord);delete oldRecord.grenade_miss_visibility;
 let historical=replayMission(companyAssault,oldRecord);expect(historical.mission_rules.grenadeMissVisibility).toBeUndefined();
 historical=advancePhase(historical).state;
 expect(exportReplay(historical).grenade_miss_visibility).toBeUndefined();expect(replayMission(companyAssault,exportReplay(historical))).toEqual(historical);
 const {s,u}=fixture();delete s.mission_rules.grenadeMissVisibility;s.visibility.light=3;
 expect(combatExposure(s,u).total).toBe(-1);
 expect(()=>replayMission(companyAssault,{...newRecord,grenade_miss_visibility:2})).toThrow('Unsupported grenade');
});
