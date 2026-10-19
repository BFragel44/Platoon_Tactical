// Read-only rules probes. All tactical fixtures are isolated in memory.
// Prints observations rather than turning known defects into passing regression tests.
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {spot,refresh,communication} from '../src/sim/company/battlefield.js';
import {orderReason} from '../src/sim/company/actions.js';
import {expendAmmunition} from '../src/sim/company/ammunition.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';

function fresh(setup={}){
 const s=createMission(trevieres,'special-formation-audit',setup);
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'audit',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations)){l.terrain='fields';l.elevation=1;l.borders=borders(DIRECTIONS);}
 s.units.co.location='r2c2';s.units.co.cover=null;return s;
}
function enemy(s,location){
 const u={...structuredClone(s.units.s11),id:'audit_enemy',name:'Audit enemy',faction:'enemy',location,cover:null,fire:null};
 s.units[u.id]=u;spot(s,u);return u;
}
const results=[];
{
 const s=fresh(),u=s.units.hmg50;u.location='r1c1';u.ammo.MG=1;
 expendAmmunition(s,u,'MG');s.assets.push({id:'ammo',type:'AMMO',key:'MG',quantity:2,location:u.location,cover:null,faction:'friendly'});
 const r=submitCommand(s,{type:'PICKUP_RADIO',unit_id:u.id,target_id:'ammo'}),after=r.state.units[u.id];
 results.push({id:'SF-01',rule:'7.18.3',case:'Resupply a named HMG flipped by ammunition exhaustion',expected:{accepted:true,cohesion:'GOOD'},observed:{accepted:r.accepted,cohesion:after.cohesion,ammo:after.ammo.MG,exposed:after.exposed}});
}
{
 const s=fresh({mortar_mode:'teams'}),u=s.units.mortar1;u.location='r1c1';u.ammo.MTR=1;expendAmmunition(s,u,'MTR');const t=enemy(s,u.location);
 const r=submitCommand(s,{type:'GRENADE',unit_id:u.id,target_id:t.id});
 results.push({id:'SF-02',rule:'7.10.1, 7.18.2',case:'Empty mortar on named Fire Team side makes a point-blank hand-grenade attempt',expected:{accepted:true},observed:{accepted:r.accepted,reason:r.reason}});
}
{
 const s=fresh(),u=s.units.at1;u.location='r1c1';u.cover='building';s.locations[u.location].covers.push({id:u.cover,type:'Building',value:2,known:true,discovered:true});const t=enemy(s,u.location);
 const r=submitCommand(s,{type:'GRENADE',unit_id:u.id,target_id:t.id});
 results.push({id:'SF-03',rule:'7.4, 7.5, 7.10.1',case:'Bazooka crew makes a hand-grenade attempt from Building cover',expected:{accepted:true},observed:{accepted:r.accepted,reason:r.reason}});
}
{
 const s=fresh(),u=s.units.hmg50;u.location='r2c2';u.ammo.MG=1;const t=enemy(s,'r2c3');u.fire=t.location;refresh(s);
 const reason=orderReason(s,{type:'CONCENTRATE',unit_id:u.id,target_id:t.id});
 results.push({id:'SF-04',rule:'7.18.4',case:'Concentrate fire with only one MG point remaining for the turn',expected:{available:false},observed:{available:!reason,reason}});
}
{
 const s=fresh(),u=s.units.mortar_section,relay=s.units.hq2;u.location='r1c1';u.radios=[];u.platoon=1;relay.location=u.location;relay.cover=null;relay.radios=['CO'];const t=enemy(s,'r2c3');
 const r=submitCommand(s,{type:'INDIRECT',unit_id:u.id,issuer_id:'co',target_id:t.location});
 results.push({id:'SF-05',rule:'7.3.2',case:'CO observes through a radio-equipped HQ colocated with a radioless mortar',expected:{accepted:true},observed:{accepted:r.accepted,reason:r.reason,observerToRelay:!!communication(s,s.units.co,relay),relaySharesMortarArea:relay.location===u.location&&relay.cover===u.cover}});
}
for(const result of results)result.passed=Object.entries(result.expected).every(([key,value])=>result.observed[key]===value);
const passed=results.every(result=>result.passed);
console.log(JSON.stringify({scope:'Normandy infantry special formations, first-pass audit',passed,results},null,2));
if(!passed)process.exitCode=1;
