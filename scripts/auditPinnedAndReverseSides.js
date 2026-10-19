// Isolated rules audit. Exit 1 means at least one expected rule is violated.
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {splitTeam,grenade,orderReason} from '../src/sim/company/actions.js';
import {spot,basicValue,canFire} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
const results=[];
function fresh(){
 const s=createMission(trevieres,'pinned-reverse-audit');s.phase='GENERAL_INITIATIVE';s.impulse={id:'audit',hq:'general',commands:6,spent:0};
 s.units.s11.location='r1c1';s.units.s11.cover=null;return s;
}
function team(s,cohesion,pinned=false){
 const donor=s.units.s12;donor.location='r1c1';donor.cover=null;
 const u=splitTeam(s,donor,cohesion,donor.steps.pop());u.pinned=pinned;return u;
}
function record(id,rule,description,expected,observed){results.push({id,rule,case:description,expected,observed,passed:Object.entries(expected).every(([k,v])=>observed[k]===v)});}
for(const cohesion of ['A','F','L','P'])for(const pinned of [false,true])for(const success of [false,true]){
 const s=fresh(),u=team(s,cohesion,pinned);u.faction='enemy';spot(s,u);
 const hit=Object.values(cards).find(c=>!!c.grenade===success);s.deck.order=[...Array(8).fill(hit.id),...s.deck.order];
 grenade(s,s.units.s11,u);
 const attempts=s.events.filter(e=>e.type==='GRENADE_ATTEMPT');
 record('SF-09','4.2.5 pp.26–27; 7.10.5 p.55',`${pinned?'Pinned':'Unpinned'} ${cohesion} team receives ${success?'successful':'failed'} point-blank grenade`,
  {attackerSucceeded:success,returned:success&&!pinned&&['A','F'].includes(cohesion)},
  {attackerSucceeded:attempts.some(e=>e.actor==='s11'&&e.success),returned:attempts.some(e=>e.actor===u.id)});
}
for(const pinned of [false,true])for(const type of ['SEEK_COVER','ENTER_COVER']){
 const s=fresh(),u=team(s,'P',pinned);s.locations[u.location].covers=[{id:'audit-cover',type:'Cover',value:1,known:true,discovered:true}];
 const command={type,unit_id:u.id,...(type==='ENTER_COVER'?{target_id:'audit-cover'}:{})},reason=orderReason(s,command);
 record('SF-10','4.2.5 p.27: pinned restrictions take precedence',`${pinned?'Pinned':'Unpinned'} Paralyzed Team attempts ${type}`,
  {available:pinned},{available:!reason,reason});
}
for(const cohesion of ['A','F','L','P'])for(const pinned of [false,true]){
 const s=fresh(),u=team(s,cohesion,pinned);u.radios=['BN'];
 s.assets.push({id:'destroyed-mtr',type:'RADIO',net:'MTR',destroyed:true,faction:'friendly',location:u.location});
 const r=submitCommand(s,{type:'SWITCH_NETWORK',unit_id:u.id,target_id:'BN → MTR'});
 record('SF-11','4.2.1j p.22; 4.2.5 p.26: command/control exceptions',`${pinned?'Pinned':'Unpinned'} ${cohesion} team switches a carried SCR300 to a destroyed device's net`,
  {accepted:true,switched:true},{accepted:r.accepted,switched:r.state.units[u.id].radios.includes('MTR'),reason:r.reason});
}
for(const cohesion of ['A','F','L','P']){
 const s=fresh(),u=team(s,cohesion);record('CONTROL','4.2.5 pp.26–27',`${cohesion} team basic fire`,
  {canFire:['A','F'].includes(cohesion)},{canFire:canFire(s,u,u.location),basicValue:basicValue(u)});
}
const passed=results.every(r=>r.passed);console.log(JSON.stringify({scope:'Pinned and reverse-side infantry audit',passed,results},null,2));
if(!passed)process.exitCode=1;
