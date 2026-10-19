import {it,expect} from 'vitest';
import {auditRecoveryRetreatCleanup} from '../scripts/auditRecoveryRetreatCleanup.js';
import {createMission,exportReplay,replayMission,advancePhase} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {retreat} from '../src/sim/company/combat.js';
import {move} from '../src/sim/company/actions.js';
import {movementReason} from '../src/sim/company/battlefield.js';

for(const control of auditRecoveryRetreatCleanup().results)it(control.id,()=>expect(control.observed).toEqual(control.expected));
function fixture(side='P',updated=true){
 const s=createMission(cerisy,'automatic-retreat',{},null,{automatic_retreat:updated}),u=s.units.s11;
 s.units={[u.id]:u};Object.assign(u,{kind:'LAT',named:false,cohesion:side,location:'r2c2',cover:null,pinned:false,exposed:false,ammo:{},radios:[],assets:{},steps:u.steps.slice(0,1)});
 s.markers=[{type:'GRENADE_MISS',location:u.location}];s.fire=[];s.support=[];s.casualties=[];
 for(const l of Object.values(s.locations))Object.assign(l,{covers:[],mines:false,protection:0});
 return {s,u};
}
for(const side of ['P','L'])for(const obstacle of ['empty','fire','stacking'])it(`${side}: automatic retreat overrides ${obstacle}`,()=>{
 const {s,u}=fixture(side);
 if(side==='L')s.casualties=[{id:'wounded',location:u.location,cover:null,faction:u.faction,carrier:null,evacuated:false}];
 for(let col=1;col<=3;col++){
  if(obstacle==='fire')s.markers.push({type:'GRENADE_MISS',location:`r1c${col}`});
  if(obstacle==='stacking')s.units[`rear${col}`]={...structuredClone(u),id:`rear${col}`,location:`r1c${col}`,cohesion:'GOOD',steps:Array(16).fill({})};
 }
 retreat(s);expect(s.locations[u.location].row).toBe(1);expect(u.exposed).toBe(true);
 if(side==='L')expect(s.casualties[0].carrier).toBe(u.id);
});
for(const side of ['P','L'])it(`${side}: automatic fortified retreat records exposure while normal fortification movement keeps its exception`,()=>{
 const {s,u}=fixture(side);s.locations.r2c2.covers=[{id:'from',type:'Trench',value:2}];u.cover='from';
 s.locations.r1c2.covers=[{id:'to',type:'Trench',value:2,known:true}];s.locations.r1c2.protection=5;
 if(side==='L')s.casualties=[{id:'wounded',location:u.location,cover:u.cover,faction:u.faction,carrier:null,evacuated:false}];
 retreat(s);expect(u).toMatchObject({location:'r1c2',exposed:true});
 expect(s.events.findLast(e=>e.type==='UNIT_MOVED')).toMatchObject({exposed:true,target:'r1c2'});
 const normal=fixture(side);normal.s.locations.r2c2.covers=[{id:'from',type:'Trench',value:2}];normal.u.cover='from';normal.s.locations.r1c2.covers=[{id:'to',type:'Trench',value:2,known:true}];
 move(normal.s,normal.u,'r1c2',false,'to');expect(normal.u.exposed).toBe(false);
});
it('normal ordered LAT movement remains restricted',()=>{
 const {s,u}=fixture();expect(movementReason(s,u,'r1c2')).toContain('friendly occupied');
 s.units.rear={...structuredClone(u),id:'rear',location:'r1c2'};
 s.markers.push({type:'GRENADE_MISS',location:'r1c2'});expect(movementReason(s,u,'r1c2')).toContain('free of fire');
 s.markers=s.markers.filter(m=>m.location!=='r1c2');s.units.rear.steps=Array(16).fill({});
 expect(movementReason(s,u,'r1c2')).toContain('16-step');
});
it('no-VOF priority wins over a better protected fired-on card',()=>{
 const {s,u}=fixture();s.locations.r1c1.protection=9;s.markers.push({type:'GRENADE_MISS',location:'r1c1'});s.locations.r1c2.protection=2;
 retreat(s);expect(u.location).toBe('r1c2');
});
it('historical automatic retreat retains the original restrictions',()=>{
 const {s,u}=fixture('P',false);retreat(s);expect(u.location).toBe('r2c2');expect(u.exposed).toBe(false);
});
for(const definition of [companyAssault,cerisy])for(const updated of [true,false])it(`${definition.id}: exact new/historical retreat replay (${updated})`,()=>{
 let s=createMission(definition,'retreat-version',{},null,{automatic_retreat:updated});
 expect(exportReplay(s).automatic_retreat).toBe(updated?'v1':undefined);expect(replayMission(definition,exportReplay(s))).toEqual(s);
 s=advancePhase(s).state;expect(replayMission(definition,exportReplay(s))).toEqual(s);
});
it('rejects unknown retreat variants',()=>{
 const s=createMission(companyAssault,'retreat-version');expect(()=>replayMission(companyAssault,{...exportReplay(s),automatic_retreat:'future'})).toThrow('Unsupported automatic retreat');
});
