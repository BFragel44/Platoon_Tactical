import {it,expect} from 'vitest';
import {formationGrid} from '../src/ui/formationGrid.js';
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
