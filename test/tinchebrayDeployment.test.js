import {it,expect} from 'vitest';
import {tinchebrayVehicleDeployments,createTinchebrayRoster} from '../src/sim/company/tinchebrayDeployment.js';
import {createVireDevelopmentMission,createVireRoster} from '../src/sim/company/vireMission.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {cards} from '../src/sim/company/core.js';
import {placePackage} from '../src/sim/company/missionContacts.js';
import {validateNormandyContent} from '../src/sim/company/normandyContent.js';
it('deploys four named M10s with unique crew identities and finite ammunition',()=>{
 const force=tinchebrayVehicleDeployments();expect(force).toHaveLength(4);
 expect(force[0].name).toBe('M10 Platoon HQ');expect(force.every(v=>v.profile==='M10_TD76'&&v.ammo===5&&v.ambushSusceptible)).toBe(true);
 expect(new Set(force.flatMap(v=>v.crew.map(step=>step.id))).size).toBe(8);
 expect(()=>tinchebrayVehicleDeployments('initial',{m10_hq:'r1c1'})).toThrow(/staging/);
 expect(()=>tinchebrayVehicleDeployments('event',{m5_hq:'r0c1'})).toThrow(/Row 1/);
});
it('creates an independent fresh company with both initial and event vehicle crews',()=>{
 const roster=createTinchebrayRoster(),vire=createVireRoster();
 expect(roster.company_id).not.toBe(vire.company_id);
 expect(roster.formations.m10_hq.step_ids).toHaveLength(2);
 expect(roster.formations.m5_hq.step_ids).toHaveLength(1);
 expect(roster.formations.sherman_hq).toBeUndefined();
});
for(const n of [1,2,3])for(const mined of [false,true])it(`executes sniper additional mines R3=${n}, existing=${mined}`,()=>{
 // Use the validated common execution harness; no M7 gate bypass is exposed.
 const s=createVireDevelopmentMission('m7-package-fixture',{}, {},{mission_instance_id:`sniper-${n}-${mined}`});
 s.mission_rules.tinchebray=true;
 for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,known:true,elevation:0,protection:0,burst:0,covers:[],borders:Object.fromEntries(['N','S','E','W','NE','NW','SE','SW'].map(k=>[k,'white']))});
 s.units.s11.location='r1c2';s.locations.r1c2.mines=mined;
 const first=Object.values(cards).find(c=>c.id!==51&&c.random[1]===n),rest=Object.values(cards).find(c=>c.id!==51&&c.random[6]<=4&&!c.short);
 s.deck.order=[first.id,...Array(250).fill(rest.id)];
 expect(placePackage(s,s.contacts.pc_r1c2,tinchebray.packages[3])).toBe(true);
 expect(s.locations.r1c2.mines).toBe(mined||n===1);
 expect(Object.values(s.units).filter(u=>u.faction==='enemy'&&u.kind==='SNIPER')).toHaveLength(1);
});
it('rejects malformed additional-mines branches before deployment',()=>{
 const invalid=structuredClone(tinchebray);invalid.packages[3].additional_mines.numbers=[1,1];
 expect(()=>validateNormandyContent(invalid)).toThrow(/additional mines/);
});
for(let n=1;n<=9;n++)it(`executes Tinchebray mine-package follow-up R9=${n}`,()=>{
 const s=createVireDevelopmentMission('m7-mines-fixture',{}, {},{mission_instance_id:`mines-${n}`});
 for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,known:true,elevation:0,protection:0,burst:0,covers:[],borders:Object.fromEntries(['N','S','E','W','NE','NW','SE','SW'].map(k=>[k,'white']))});
 s.units.s11.location='r1c2';
 const first=Object.values(cards).find(c=>c.id!==51&&c.random[7]===n),rest=Object.values(cards).find(c=>c.id!==51&&c.random[6]<=4&&!c.short);
 s.deck.order=[first.id,...Array(250).fill(rest.id)];
 expect(placePackage(s,s.contacts.pc_r1c2,tinchebray.packages[1])).toBe(true);
 const enemies=Object.values(s.units).filter(u=>u.faction==='enemy');
 expect(enemies.map(u=>u.kind)).toEqual(n<=2?['HMG']:[]);
 if(n<=2)expect(enemies[0].ammo.MG).toBe(4);
 expect(s.locations.r1c2.mines).toBe(true);
});
