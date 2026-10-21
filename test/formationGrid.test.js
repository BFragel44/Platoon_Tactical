import {it,expect} from 'vitest';
import {formationGrid,counterReadiness} from '../src/ui/formationGrid.js';
it('shows only the detached LAT step rather than its inherited parent capacity',()=>{
 const team=counterReadiness({kind:'LAT',cohesion:'A',steps:1,max_steps:3});
 expect(team.dots.match(/step-dot ready/g)).toHaveLength(1);expect(team.dots).not.toContain('step-dot lost');
 const parent=counterReadiness({kind:'SQUAD',steps:2,max_steps:3});
 expect(parent.dots.match(/step-dot ready/g)).toHaveLength(2);expect(parent.dots.match(/step-dot lost/g)).toHaveLength(1);
});
it('shows surviving/lost steps and remaining/spent ammunition without changing the formation',()=>{
 const u={steps:2,max_steps:3,ammo:{MTR:3},initial_resources:{ammo:{MTR:4}}},before=structuredClone(u),result=counterReadiness(u);
 expect(result.dots.match(/step-dot ready/g)).toHaveLength(2);expect(result.dots.match(/step-dot lost/g)).toHaveLength(1);
 expect(result.ammo.match(/ammo-square ready/g)).toHaveLength(3);expect(result.ammo.match(/ammo-square spent/g)).toHaveLength(1);expect(result.ammo).toContain('MTR: 3 remaining');expect(u).toEqual(before);
});
it('omits unknown ammunition rather than inventing stock, and keeps large loads compact',()=>{
 expect(counterReadiness({steps:1}).ammo).toBe('');
 expect(counterReadiness({steps:1,ammo:{MG:0},initial_resources:{ammo:{MG:4}}}).ammo.match(/ammo-square spent/g)).toHaveLength(4);
 const large=counterReadiness({steps:1,ammo:{MG:40}}).ammo;expect(large).toContain('<b>40</b>');expect(large.match(/ammo-square/g)).toHaveLength(1);
});
it('groups formations by visible cover once without changing units or losing inspection details',()=>{
 const l={id:'l',name:'Village',elevation:2,known:true,covers:[{id:'c',known:true,type:'Cover',value:1},{id:'upper',known:true,type:'Upper Story',value:2,parent:'c',elevation:1}]};
 const units=[{id:'staff',name:'First Sergeant',kind:'STAFF',steps:1,cohesion:'GOOD',experience:'Line',cover:'c',exposed:true,tactical_ready:true,attempted:['MOVE'],radios:[]},{id:'a',name:'Assault team 2',kind:'LAT',steps:1,cohesion:'A',cover:null,attempted:[]}];
 const before=structuredClone({l,units});const html=formationGrid(l,units,[],{selected:'staff'});
 expect(html.match(/data-unit="staff"/g)).toHaveLength(1);expect(html).toContain('A2');expect(html).toContain('1SG');
 expect(html).toContain('level 3');expect(html).toContain('above C1');expect(html).toContain('1 attempted this impulse');expect(html).toContain('EXPOSED');
 expect(html.indexOf('data-unit="a"')).toBeLessThan(html.indexOf('class="occupied-cover"'));expect(html.indexOf('data-unit="staff"')).toBeGreaterThan(html.indexOf('class="occupied-cover"'));
 expect({l,units}).toEqual(before);
});
it('omits unknown cover information and makes spotted enemy details inspectable without order targets',()=>{
 const l={name:'Woods',known:true,elevation:1,covers:[{id:'secret',known:false,type:'Secret bunker',value:4}]};
 const html=formationGrid(l,[],[{id:'enemy',name:'Spotted LMG',kind:'LMG',steps:1,cohesion:'GOOD',cover:'secret'}]);
 expect(html).not.toContain('Secret bunker');expect(html).not.toContain('data-unit="enemy"');expect(html).toContain('tabindex="0"');expect(html).toContain('Spotted LMG');
});

it('abbreviates the Fallschirmjäger counter face while keeping its full inspection name',()=>{const html=formationGrid({id:'l',name:'Village',elevation:0,covers:[]},[],[{id:'e',name:'5/Fallschirmjäger',kind:'SQUAD',cohesion:'GOOD',steps:2}]);expect(html).toContain('<strong>5FJ</strong>');expect(html).toContain('5/Fallschirmjäger');});
