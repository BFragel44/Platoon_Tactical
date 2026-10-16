import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {hill192} from '../src/scenarios/hill192.js';
import {createMission,prepareReattempt} from '../src/sim/company/engine.js';
function fixture(){
 const s=createMission(trevieres,'eliminated-cover');s.status='DEFEAT';
 s.units.s23.steps=[];s.units.s23.removed='ELIMINATED';s.units.s23.cover='old_foxhole';
 s.locations.r0c2.covers.push({id:'current_cover',type:'Foxholes',value:1,discovered:true,known:true});
 const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));return {s,positions};
}
it('ignores stale cover for an eliminated zero-step squad without resurrecting it',()=>{
 const {s,positions}=fixture(),before=structuredClone(s);
 const n=prepareReattempt(s,{positions,covers:{s23:'old_foxhole'}}).state;
 expect(n.status).toBe('ACTIVE');expect(n.units.s23.steps).toHaveLength(0);expect(n.units.s23.removed).toBe('ELIMINATED');expect(s).toEqual(before);
});
it('still validates cover for survivors and rejects unknown counters atomically',()=>{
 const {s,positions}=fixture(),before=structuredClone(s);
 expect(()=>prepareReattempt(s,{positions,covers:{s11:'old_foxhole'}})).toThrow('Choose discovered cover');
 expect(()=>prepareReattempt(s,{positions,covers:{missing:'current_cover'}})).toThrow('Choose discovered cover');expect(s).toEqual(before);
 expect(prepareReattempt(s,{positions,covers:{s11:'current_cover'}}).state.units.s11.cover).toBe('current_cover');
});
it('requires valid deployment and cover once a zero-step formation receives a donor',()=>{
 const {s,positions}=fixture(),donor=structuredClone(s.units.s11);Object.assign(donor,{id:'donor',kind:'LAT',cohesion:'F',steps:donor.steps.slice(0,1),max_steps:1,removed:null});s.units.donor=donor;
 const c={positions:{...positions,s23:'r0c2'},reconstitute:{s23:['donor']},covers:{s23:'old_foxhole',donor:'stale_donor_cover'}};
 expect(()=>prepareReattempt(s,c)).toThrow('Choose discovered cover');c.covers.s23='current_cover';const n=prepareReattempt(s,c).state;
 expect(n.units.s23.steps).toHaveLength(1);expect(n.units.s23.cover).toBe('current_cover');expect(n.units.donor.steps).toHaveLength(0);
});
it('starts Hill 192 attempt two with stale cover on eliminated 3/2 Rifle Squad',()=>{
 const s=createMission(hill192,'hill-eliminated-cover');s.status='DEFEAT';
 for(const pc of Object.values(s.contacts))if(s.locations[pc.location].row===1)pc.resolved=true;
 const u=s.units.s23;u.steps=[];u.removed='ELIMINATED';u.cover='old_cover';
 const positions=Object.fromEntries(Object.values(s.units).filter(v=>v.faction==='friendly'&&v.steps.length&&!v.removed).map(v=>[v.id,v.location]));
 const before=structuredClone(s),n=prepareReattempt(s,{positions,covers:{s23:'old_cover'}}).state;
 expect(n.status).toBe('ACTIVE');expect(n.attempt_number).toBe(2);expect(n.units.s23.steps).toHaveLength(0);expect(s).toEqual(before);
});
