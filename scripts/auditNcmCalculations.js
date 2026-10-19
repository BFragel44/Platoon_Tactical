// Rule-authored expected values; isolated production-function fixtures, no player saves.
import {createMission} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {combatExposure} from '../src/sim/company/battlefield.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';

export function auditNcmCalculations(){
 const results=[];
 function fresh(def=cerisy){
  const s=createMission(def,'ncm-audit'),template=structuredClone(s.units.s11);
  s.units={};s.fire=[];s.support=[];s.markers=[];s.visibility={light:0,weather:0};
  const location='r2c2';Object.assign(s.locations[location],{name:'Audit terrain',protection:0,open_protection:0,burst:0,smoke:false,covers:[],borders:borders(DIRECTIONS)});
  const unit=(id,{faction='friendly',steps=1,cover=null,pinned=false}={})=>s.units[id]={...structuredClone(template),id,name:id,faction,location,cover,pinned,exposed:false,removed:null,steps:Array.from({length:steps},(_,i)=>({id:`${id}-${i}`,personnel:[]}))};
  const u=unit('target');return {s,u,unit,l:s.locations[location],location};
 }
 function fire(f,origin,value,{indirect=false,faction='enemy',source=`source-${f.s.fire.length}`}={}){
  f.s.units[source]={...structuredClone(f.u),id:source,name:source,location:origin,faction,cover:null};
  f.s.fire.push({source,origin,target:f.location,value,indirect});return source;
 }
 const cover=(f,id,value)=>{f.l.covers.push({id,type:'Basic cover',value,known:true});return id;};
 const grenade=(f,value=-4,extra={})=>f.s.markers.push({type:'GRENADE',location:f.location,target:f.u.id,value,...extra});
 function check(id,rule,f,expected,u=f.u){
  const e=combatExposure(f.s,u),observed=e?{total:e.total,ncm:e.ncm,...e.parts,selected:e.strongest.kind}:null;
  results.push({id,rule,expected,observed,passed:!!observed&&Object.entries(expected).every(([k,v])=>observed[k]===v)});
 }
 // Printed p.46 example 1: fog, H fire, pinned fire, targeted grenade and crossfire.
 {
  const f=fresh(),{s,u,unit}=f;u.steps=Array.from({length:3},(_,i)=>({id:`squad-${i}`,personnel:[]}));u.pinned=true;
  const c=cover(f,'basic',1),mg=unit('LMG',{cover:c}),assault=unit('Assault',{cover:c});
  s.visibility.weather=2;fire(f,'r2c3',-3);fire(f,'r2c1',2);
  grenade(f,-4,{target:null,cover:c,origin:'r2c3'});
  check('printed-46-1-LMG','6.4 example 1 p.46',f,{total:-4,ncm:-4,fire:-4,visibility:0,crossfire:-1,cover:1},mg);
  check('printed-46-1-Assault','6.4 example 1 p.46',f,{total:-4},assault);
  check('printed-46-1-Squad','6.4 example 1 p.46',f,{total:-1,fire:-3,visibility:2,pinned:1,cover:0},u);
 }
 // Printed p.46 example 2: point blank affects opponents only; misses affect everyone.
 {
  const f=fresh(),{s,u,unit}=f;f.l.protection=f.l.open_protection=1;
  const c=cover(f,'basic',1);u.cover=c;const second=unit('US-second',{cover:c}),mg=unit('US-LMG',{pinned:true});
  const a=unit('German-A',{faction:'enemy'}),b=unit('German-S',{faction:'enemy'});
  for(const [source,value]of [[u.id,0],[second.id,0],[mg.id,2],[a.id,-1],[b.id,0]])s.fire.push({source,origin:f.location,target:f.location,value});
  s.markers.push({type:'GRENADE_MISS',location:f.location},{type:'GRENADE_MISS',location:f.location},
   {type:'CONCENTRATE',location:f.location,target:a.id,value:1},{type:'CONCENTRATE',location:f.location,target:b.id,value:1},
   {type:'GRENADE',location:f.location,target:b.id,value:-4});
  for(const target of [u,second,mg])check(`printed-46-2-${target.id}`,'6.4 example 2 p.46',f,{total:0,crossfire:0,grenade_miss:-1},target);
  check('printed-46-2-German-A','6.4 example 2 p.46',f,{total:-1,fire:0,concentrated:-1},a);
  check('printed-46-2-German-S','6.4 example 2 p.46',f,{total:-5,ncm:-4,fire:-4,concentrated:-1},b);
 }
 {
  const f=fresh();f.l.protection=f.l.open_protection=3;f.u.cover=cover(f,'strong',3);f.u.steps=Array(3).fill({personnel:[]});f.unit('fourth',{cover:f.u.cover});
  fire(f,'r2c3',0);grenade(f,-4,{target:null,cover:f.u.cover});f.s.markers.push({type:'GRENADE_MISS',location:f.location});
  check('printed-55-US-stack','7.10 example 1 p.55',f,{total:0,overcrowding:-1,grenade_miss:-1,cover:3,terrain:3});
 }
 {
  const f=fresh();f.l.protection=f.l.open_protection=2;fire(f,'r2c3',-1);grenade(f);grenade(f);f.s.markers.push({type:'GRENADE_MISS',location:f.location});
  check('printed-56-double-grenade','7.10 example 2 p.56',f,{total:-7,ncm:-4,fire:-8});
  const other=f.unit('untargeted');check('printed-56-untargeted','7.10 example 2 p.56',f,{total:0,fire:-1},other);
 }
 // Mixed VOF selection: modifiers are applied before selecting the strongest effect.
 for(const [id,light,weather,smoke,gr,expected]of [
  ['darkness',3,0,false,-4,-4],['weather',0,2,false,-4,-4],['smoke',0,0,true,-4,-4],['mixed-high-visibility',3,2,true,-3,-3],
 ]){
  const f=fresh();f.s.visibility={light,weather};f.l.smoke=smoke;fire(f,'r2c3',-3);grenade(f,gr);
  check(`mixed-${id}`,'6.4 p.45; 7.10.2 p.55; 9.0 p.69',f,{total:expected,selected:'GRENADE',visibility:0,smoke:0});
 }
 {
  const f=fresh();fire(f,'r2c3',-3);f.l.burst=1;f.s.support=[{status:'ACTIVE',location:f.location,value:-3}];
  check('burst-changes-selection','5.2.3 p.36; 6.4 p.45',f,{total:-3,selected:'BASIC_FIRE',burst:0});
 }
 {
  const f=fresh();f.s.visibility={light:3,weather:1};f.l.smoke=true;fire(f,'r2c3',-3);
  f.s.support=[{status:'ACTIVE',location:f.location,value:-3}];
  check('incoming-visibility-exemption','9.0 p.69',f,{total:-3,selected:'OFF_MAP_SUPPORT',visibility:0,smoke:0});
 }
 for(const burst of [-1,0,1]){
  const f=fresh();f.l.burst=burst;fire(f,'r2c3',-3,{indirect:true});
  check(`on-map-indirect-burst-${burst}`,'7.3.2 p.53',f,{total:-3+burst,burst,crossfire:0});
 }
 {
  const f=fresh();f.s.visibility={light:3,weather:1};f.l.smoke=true;fire(f,'r2c3',-3,{indirect:true});
  check('indirect-normal-H-modifiers','7.3.2 p.53',f,{total:3,smoke:2,visibility:4});
 }
 // Terrain is card-wide: even a weaker dark-border source forces the higher value.
 for(const [id,origins,expected]of [['white-only',['r3c2'],0],['dark-only',['r2c3'],2],['mixed',['r3c2','r2c3'],2]]){
  const f=fresh();f.l.protection=2;f.l.open_protection=0;f.l.borders=borders(['N']);
  for(const origin of origins)fire(f,origin,0);
  check(`terrain-${id}`,'5.2.3 p.36',f,{terrain:expected});
 }
 {
  const f=fresh();f.l.protection=2;f.l.open_protection=0;f.l.borders=borders();fire(f,'r2c3',2);
  f.s.support=[{status:'ACTIVE',location:f.location,value:-5}];
  check('terrain-dark-fire-plus-incoming','5.2.3 p.36',f,{terrain:2,selected:'OFF_MAP_SUPPORT',total:-3});
 }
 for(const indirect of [false,true]){
  const f=fresh();f.l.protection=2;f.l.open_protection=0;f.l.borders=borders();
  if(indirect)fire(f,'r2c3',-3,{indirect:true});else f.s.support=[{status:'ACTIVE',location:f.location,value:-3}];
  check(`terrain-indirect-alone-${indirect}`,'5.2.3 p.36; 7.3.2 p.53',f,{terrain:0,total:-3});
 }
 {
  const f=fresh();f.l.protection=2;f.l.open_protection=0;f.l.borders=borders();fire(f,f.location,0);
  check('terrain-point-blank','5.2.3 p.36',f,{terrain:0,total:0});
 }
 // Criticals remove cover independently of which VOF wins.
 for(const type of ['GRENADE','CONCENTRATE']){
  const f=fresh();f.u.cover=cover(f,'fortification',3);f.s.support=[{status:'ACTIVE',location:f.location,value:-5}];
  f.s.markers.push({type,location:f.location,cover:f.u.cover,value:type==='GRENADE'?-4:1,critical:true});
  check(`critical-${type}`,'7.10.3 p.55; 7.11.4 p.56',f,{cover:0,selected:'OFF_MAP_SUPPORT',total:type==='GRENADE'?-5:-6});
 }
 {
  const f=fresh();f.u.cover=cover(f,'unaffected',3);cover(f,'targeted',1);fire(f,'r2c3',0);
  f.s.markers.push({type:'CONCENTRATE',location:f.location,cover:'targeted',value:1,critical:true});
  check('critical-other-cover-unaffected','7.11.4 p.56',f,{cover:3,concentrated:0,total:3});
 }
 for(const count of [3,4,6])for(const type of ['GRENADE','INCOMING','ON_MAP_INDIRECT']){
  const f=fresh();f.u.cover=cover(f,'crowded',1);f.u.steps=Array(count).fill({personnel:[]});
  if(type==='GRENADE')grenade(f,-4);else if(type==='INCOMING')f.s.support=[{status:'ACTIVE',location:f.location,value:-4}];else fire(f,'r2c3',-3,{indirect:true});
  const penalty=type==='ON_MAP_INDIRECT'?0:-Math.max(0,count-3);
  check(`stack-${type}-${count}`,'5.3 p.37; 7.3.2 p.53',f,{overcrowding:penalty,total:(type==='ON_MAP_INDIRECT'?-3:-4)+1+penalty});
 }
 for(const [id,origins,indirect,expected]of [['same-bearing',['r3c2','r4c2'],false,0],['different-bearing',['r3c2','r2c3'],false,-1],['indirect-excluded',['r3c2','r2c3'],true,0]]){
  const f=fresh();origins.forEach((origin,i)=>fire(f,origin,0,{indirect:i===1&&indirect}));
  check(`crossfire-${id}`,'6.2.4 p.43',f,{crossfire:expected});
 }
 {
  const f=fresh();fire(f,'r2c3',0);f.s.markers.push({type:'CONCENTRATE',location:f.location,target:f.u.id,value:1},{type:'CONCENTRATE',location:f.location,target:f.u.id,value:2});
  check('concentrated-stacks','7.11.2/4 p.56',f,{concentrated:-3,total:-3});
 }
 {
  const f=fresh();f.u.pinned=true;f.u.exposed=true;fire(f,'r2c3',0);
  check('pinned-and-exposed','6.4 p.45; 6.4.2 p.47',f,{pinned:1,exposed:-2,total:-1});
 }
 {
  const f=fresh();f.l.protection=f.l.open_protection=5;f.u.cover=cover(f,'fortification',3);fire(f,'r2c3',2);
  check('upper-clamp','6.4 p.45',f,{total:10,ncm:6});
 }
 // Suspected legacy gates and temporary direct-lay PDF terrain handling.
 for(const def of [companyAssault,cerisy]){
  const f=fresh(def);grenade(f);grenade(f);
  f.l.protection=f.l.open_protection=3;f.u.cover=cover(f,'protected',1);
  check(`cumulative-${def.id}`,'7.10.2 p.55',f,{fire:-8,total:-4,ncm:-4});
 }
 for(const basic of [false,true]){
  const f=fresh();f.l.protection=2;f.l.open_protection=0;f.l.borders=borders(['N']);
  if(basic)fire(f,'r3c2',0);
  const m=f.unit('mortar');m.location='r2c3';m.temporary_pdf={origin:m.location,target:f.location};
  f.s.markers.push({type:'GRENADE_MISS',location:f.location});
  check(`mortar-miss-dark-border-${basic}`,'5.2.3 p.36; 7.3.2 p.53',f,{terrain:2,crossfire:basic?-1:0,total:basic?0:1});
 }
 return {scope:'NCM rulebook worked examples and modifier interactions',passed:results.every(r=>r.passed),observations:results.length,results};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/auditNcmCalculations.js')){
 const report=auditNcmCalculations();console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}
