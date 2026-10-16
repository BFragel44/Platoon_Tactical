import {it,expect} from 'vitest';
import {createMission} from '../src/sim/company/engine.js';
import {hill192} from '../src/scenarios/hill192.js';
import {orderReason,submitCommand,commandOptions} from '../src/sim/company/actions.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
function fixture(col=0){
 const s=createMission(hill192,'general-shift'),u=s.units.s13;
 for(const l of Object.values(s.locations))Object.assign(l,{elevation:1,borders:borders(DIRECTIONS)});
 const id=`r4c${col}`;s.locations[id]={...structuredClone(s.locations.r4c1),id,row:4,col,name:`4.${col} Hedgerow / Bocage`,outside_boundary:true,covers:[]};
 Object.assign(u,{location:'r3c1',cover:null,fire:'r3c0'});Object.assign(s.units.co,{location:'r3c2',cover:null});
 s.impulse={id:'shift',hq:'general',commands:2,spent:0};return {s,u,id};
}
for(const col of [0,2])it(`General Initiative uses the firing formation's LOS at column ${col}`,()=>{
 const {s,u,id}=fixture(col),before=structuredClone(s),c={type:'SHIFT_FIRE',unit_id:u.id,issuer_id:'co',target_id:id};
 // 4.0 is diagonal to the firer but not on a straight LOS from Company HQ.
 expect(orderReason(s,c)).toBeNull();expect(commandOptions(s,u,'co').find(o=>o.type==='SHIFT_FIRE').targets.find(t=>t.id===id).reason).toBeNull();
 const n=submitCommand(s,c);expect(n.accepted).toBe(true);expect(n.state.units[u.id].fire).toBe(id);expect(s).toEqual(before);
});
it('still requires issuing HQ LOS outside General Initiative',()=>{
 const {s,u,id}=fixture();s.impulse.hq='co';u.radios=['CO'];s.units.co.radios=['CO'];
 expect(orderReason(s,{type:'SHIFT_FIRE',unit_id:u.id,issuer_id:'co',target_id:id})).toContain('issuing HQ');
});
it('does not extend weapon range or allow targeting a concealed position',()=>{
 const {s,u,id}=fixture();u.cohesion='A';expect(orderReason(s,{type:'SHIFT_FIRE',unit_id:u.id,issuer_id:'co',target_id:id})).toContain('range');
 u.cohesion='GOOD';s.knowledge.suspected[id]=true;expect(orderReason(s,{type:'SHIFT_FIRE',unit_id:u.id,issuer_id:'co',target_id:id})).toContain('Spot');
});
