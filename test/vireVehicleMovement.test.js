import {it,expect} from 'vitest';
import {createVehicle,embarkVehicle} from '../src/sim/company/vehicleState.js';
import {beginVehicleMove,stepVehicleMove,stopVehicleMove} from '../src/sim/company/vehicleMovement.js';
const locations={a:{row:1,col:1},b:{row:2,col:1},c:{row:3,col:1},slow:{row:3,col:2,trafficability:'SLOW'},no:{row:2,col:2,trafficability:'NO'}};
function tank(){const v=createVehicle({id:'tank',profile:'M4_SHERMAN75',faction:'friendly',location:'a',crew:[{id:'crew1'},{id:'crew2'}],ammo:5});v.activated=true;return embarkVehicle(v,[{id:'rider',location:'a'}]);}
it('blocks nonadjacent, NO and through-SLOW paths before changing any state',()=>{
 const v=tank();expect(()=>beginVehicleMove(v,locations,['c'])).toThrow();expect(()=>beginVehicleMove(v,locations,['no'])).toThrow();
 expect(()=>beginVehicleMove(v,locations,['b','slow','c'])).toThrow(/SLOW/);
 expect(beginVehicleMove(v,locations,['b','slow']).path).toEqual(['b','slow']);expect(v.location).toBe('a');
});
it('requires a VOF and reaction window on every entered card and carries passenger identities',()=>{
 let s=beginVehicleMove(tank(),locations,['b','c']);const stages=[];
 while(!s.complete){stages.push(s.stage);s=stepVehicleMove(s,s.stage);}
 expect(stages).toEqual(['VOF_ORIGIN','ENTER','VOF_DESTINATION','REACTION','VOF_ORIGIN','ENTER','VOF_DESTINATION','REACTION']);
 expect(s.entered).toEqual(['b','c']);expect(s.vehicle.passengers[0]).toMatchObject({id:'rider',location:'c'});expect(s.vehicle.moved_fired).toBe(true);
 expect(()=>stepVehicleMove(s,'REACTION')).toThrow();
});
it('resumes exactly from JSON at a reaction window and stops only after card entry',()=>{
 let s=beginVehicleMove(tank(),locations,['b','c']);expect(()=>stopVehicleMove(s)).toThrow();
 for(const stage of ['VOF_ORIGIN','ENTER','VOF_DESTINATION'])s=stepVehicleMove(s,stage);
 const saved=JSON.parse(JSON.stringify(s));expect(stepVehicleMove(saved,'REACTION')).toEqual(stepVehicleMove(s,'REACTION'));
 const stopped=stepVehicleMove(stopVehicleMove(saved),'REACTION');expect(stopped.complete).toBe(true);expect(stopped.vehicle.location).toBe('b');
 expect(()=>stepVehicleMove(saved,'ENTER')).toThrow();
});
