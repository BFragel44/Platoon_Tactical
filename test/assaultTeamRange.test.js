import {it,expect} from 'vitest';
import {createMission} from '../src/sim/company/engine.js';
import {hill192} from '../src/scenarios/hill192.js';
import {rangeOf,canFire,refresh} from '../src/sim/company/battlefield.js';
for(const depleted of [false,true])it(`keeps Assault Teams at point blank with out_of_ammo=${depleted}`,()=>{
 const s=createMission(hill192,'assault-range'),u=s.units.s11;
 Object.assign(u,{kind:'LAT',cohesion:'A',named:false,steps:u.steps.slice(0,1),location:'r3c4',cover:null,range:0,basic_range:2,out_of_ammo:depleted,fire:'r4c3',fire_direction:{origin:'r3c4',anchor:'r4c3',dr:1,dc:-1}});
 s.units.enemy={...structuredClone(s.units.s12),id:'enemy',name:'Defender',faction:'enemy',location:'r4c3',cover:null,removed:null};s.knowledge.spotted.enemy={id:'enemy'};
 expect(rangeOf(u)).toBe(0);expect(canFire(s,u,'r4c3')).toBe(false);expect(canFire(s,u,'r3c4')).toBe(true);
 refresh(s);expect(s.fire.filter(f=>f.source===u.id)).toEqual([]);expect(u.fire).toBeNull();
 s.units.enemy.location='r3c4';refresh(s);expect(u.fire).toBe('r3c4');expect(s.fire.some(f=>f.source===u.id&&f.target==='r3c4')).toBe(true);
});
it('retains Close-range fire for generic Fire Teams and depleted good-order weapons',()=>{
 expect(rangeOf({cohesion:'F',out_of_ammo:true})).toBe(1);expect(rangeOf({cohesion:'GOOD',out_of_ammo:true,range:3})).toBe(1);
});
