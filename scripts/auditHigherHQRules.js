// Read-only higher-HQ audit: event-created visitors, isolated tactical fixtures.
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {communication,chain} from '../src/sim/company/battlefield.js';
import {orderReason,splitTeam} from '../src/sim/company/actions.js';
import {cards} from '../src/sim/company/core.js';
const results=[];
function fresh(){const s=createMission(trevieres,'higher-hq-audit');s.turn=2;s.phase='GENERAL_INITIATIVE';s.impulse={id:'audit',hq:'general',commands:6,spent:0};s.units.co.location='r2c2';s.units.co.cover=null;return s;}
function visitor(s,profile){
 const index=['REGIMENTAL_STAFF','BATTALION_COMMANDER','BATTALION_STAFF'].indexOf(profile);
 const c=Object.values(cards).find(c=>c.id!==51&&c.random[1]===index+1);s.deck.order=[c.id,...s.deck.order];
 s.pending_event={side:'friendly',code:'CHECKING_UP',turn:2};s.hq_events.push({side:'friendly',code:'CHECKING_UP',turn:2});
 resolveNormandyEvent(s,'friendly');const unit=Object.values(s.units).find(u=>u.command_role==='higher_hq');if(unit.higher_hq_profile!==profile)throw new Error('Visitor profile mismatch');return unit;
}
function record(id,rule,description,expected,observed){results.push({id,rule,case:description,expected,observed,passed:Object.entries(expected).every(([k,v])=>observed[k]===v)});}
for(const profile of ['REGIMENTAL_STAFF','BATTALION_STAFF'])for(const net of ['CO','CO_PHONE']){
 let s=fresh();const u=visitor(s,profile);u.location='r2c1';
 if(net==='CO_PHONE'){s.mission_rules.communications='phones';s.units.co.radios=['BN','CO_PHONE'];}
 s.assets.push({id:'recovered',type:'RADIO',net,location:u.location,cover:null,faction:'friendly'});
 const pickup=submitCommand(s,{type:'PICKUP_RADIO',unit_id:u.id,target_id:'recovered'});s=pickup.state;
 record('SF-12','4.3.3 p.28',`${profile} recovers ${net} and uses CO TAC from another card`,
  {pickup:true,commandNet:false},{pickup:pickup.accepted,commandNet:!!communication(s,s.units[u.id],s.units.co)});
}
for(const profile of ['BATTALION_COMMANDER','BATTALION_STAFF']){
 const s=fresh(),u=visitor(s,profile);u.location='r2c1';u.radios=['BN'];s.units.co.radios=['BN'];s.phase='BN_ACTIVATION';s.impulse={id:'bn-audit',hq:u.id,commands:6,spent:0};
 const r=submitCommand(s,{type:'ACTIVATE',unit_id:u.id,issuer_id:u.id,target_id:'co'});
 record('SF-13','4.1.1 p.18; 4.3.3 p.28',`${profile} activates CO over working BN radios from an adjacent card`,
  {communication:true,activated:true},{communication:!!communication(s,u,s.units.co),activated:r.accepted,reason:r.reason});
}
for(const profile of ['REGIMENTAL_STAFF','BATTALION_COMMANDER','BATTALION_STAFF']){
 const s=fresh(),u=visitor(s,profile);s.units.co.steps=[];s.units.co.removed='ELIMINATED';
 for(const id of ['xo','hq1','hq2','hq3','artyfo']){s.units[id].steps=[];s.units[id].removed='ELIMINATED';}
 Object.assign(s.units.staff,{location:u.location,cover:u.cover});
 const r=submitCommand(s,{type:'RECONSTITUTE_HQ',unit_id:u.id,issuer_id:'staff',target_id:'co'});
 record('SF-14','6.5.2B p.49',`${profile} offered as donor to replace eliminated Company HQ`,
  {accepted:false,visitorConsumed:false},{accepted:r.accepted,visitorConsumed:r.state.units[u.id].removed==='RECONSTITUTED',reason:r.reason});
}
{
 const s=fresh(),u=visitor(s,'REGIMENTAL_STAFF');
 record('CONTROL','4.3.1 p.27','Visitor and CO communicate by same-area voice',{communication:true},{communication:!!communication(s,u,s.units.co)});
 s.units.co.steps=[];s.units.co.removed='ELIMINATED';Object.assign(s.units.staff,{location:'r2c2',cover:null});Object.assign(s.units.xo,{location:'r2c2',cover:null});
 const r=submitCommand(s,{type:'RECONSTITUTE_HQ',unit_id:'xo',issuer_id:'staff',target_id:'co'});
 record('CONTROL','6.5.2B p.49','Company XO remains eligible to replace CO',{accepted:true},{accepted:r.accepted,reason:r.reason});
}
for(const [issuer,target,expected]of [['co','hq1',true],['xo','hq1',true],['staff','hq1',true],['staff','xo',false],['xo','co',false],['hq1','s11',true],['hq1','s21',false]]){
 const s=fresh();record('CONTROL','4.0 command reference p.18',`${issuer} command authority over ${target}`,{authority:expected},{authority:chain(s.units[issuer],s.units[target],'MOVE')});
}
{
 const s=fresh(),t=splitTeam(s,s.units.s21,'F',s.units.s21.steps.pop());
 record('CONTROL','4.0 p.18','Platoon HQ can command a LAT from another platoon',{authority:true},{authority:chain(s.units.hq1,t,'MOVE')});
 Object.assign(s.units.hq1,{location:'r2c2',cover:null,cohesion:'F'});Object.assign(s.units.s11,{location:'r2c2',cover:null});s.phase='PLATOON_INITIATIVE';s.impulse.hq='hq1';
 const r=submitCommand(s,{type:'MOVE',unit_id:'s11',issuer_id:'hq1',target_id:'r1c2'});
 record('CONTROL','4.1.4 p.20','HQ Fire Team cannot issue movement orders to a subordinate',{accepted:false},{accepted:r.accepted,reason:r.reason});
}
{
 const s=fresh();s.phase='CO_ACTIVATION';s.impulse.hq='co';s.units.hq1.cohesion='F';
 const reason=orderReason(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq1'});
 record('CONTROL','4.1.4 p.20','CO cannot activate HQ on its Fire Team side',{available:false},{available:!reason,reason});
}
const passed=results.every(r=>r.passed);console.log(JSON.stringify({scope:'Higher HQ/staff communications and succession audit',passed,results},null,2));if(!passed)process.exitCode=1;
