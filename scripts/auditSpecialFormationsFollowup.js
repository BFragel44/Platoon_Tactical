// Read-only follow-up probes. Expected rule outcomes intentionally expose defects.
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {communication,spot} from '../src/sim/company/battlefield.js';
import {orderReason,move} from '../src/sim/company/actions.js';
import {cards} from '../src/sim/company/core.js';
import {rangedWeaponTarget} from '../src/sim/company/rangedWeapons.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';

function fresh(){
 const s=createMission(trevieres,'special-formations-followup');
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'audit',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations)){l.terrain='fields';l.elevation=1;l.borders=borders(DIRECTIONS);}
 s.units.co.location='r2c2';s.units.co.cover=null;return s;
}
const results=[];
{
 const s=fresh(),fo=s.units.artyfo;fo.location='r2c1';fo.cover=null;
 s.assets.push({id:'recovered_co_radio',type:'RADIO',net:'CO',location:fo.location,cover:null,faction:'friendly'});
 const pickup=submitCommand(s,{type:'PICKUP_RADIO',unit_id:fo.id,target_id:'recovered_co_radio'});
 const after=pickup.state;after.impulse={id:'co-audit',hq:'co',commands:6,spent:0};
 const command={type:'CALL_ARTILLERY_WP',unit_id:fo.id,issuer_id:'co',target_id:'r3c1'};
 results.push({id:'SF-06',rule:'4.3.3, 7.16.1',case:'Observer recovers CO radio and receives a remote company order',
  expected:{pickupAccepted:true,commandNet:false,remoteOrderAvailable:false},
  observed:{pickupAccepted:pickup.accepted,commandNet:!!communication(after,after.units.co,after.units.artyfo),
   remoteOrderAvailable:!orderReason(after,command),reason:orderReason(after,command)}});
}
{
 const s=fresh(),u=structuredClone(s.units.at1);Object.assign(u,{id:'audit_gun',faction:'enemy',location:'r2c1',cover:null,fire:'r2c3',grenade_range:3,grenade_ammo:'GUN',ammo:{GUN:6},rocket:false});
 s.units[u.id]=u;const t=s.units.s11;t.location='r2c2';t.cover=null;spot(s,t);
 // A colocated long-range weapon supplies a valid PDF; the gun's own stale
 // farther target must not constrain it after losing basic-fire range.
 const ally={...structuredClone(u),id:'audit_pdf_weapon',kind:'MG',range:3,basic_range:3,grenade_ammo:null};s.units[ally.id]=ally;
 // Empty farther card and nearer target share the same unobstructed PDF bearing.
 const withoutPdf=structuredClone(s);withoutPdf.units[u.id].fire=null;withoutPdf.units[ally.id].fire=null;
 results.push({id:'SF-07',rule:'7.10.1; Normandy CSR 7',case:'Enemy ranged grenade targets a nearer card along its existing PDF direction',
  expected:{withoutPdf:true,withSameDirectionPdf:true},observed:{withoutPdf:rangedWeaponTarget(withoutPdf,withoutPdf.units[u.id],withoutPdf.units[t.id]),withSameDirectionPdf:rangedWeaponTarget(s,u,t)}});
}
for(const mission of ['hill192','vire','tinchebray'])for(const success of [true,false]){
 const s=fresh(),u=s.units.s11;u.location='r2c1';u.cover=null;u.exposed=false;u.capabilities={engineer:true};
 for(const key of ['hill192','vire','tinchebray'])s.mission_rules[key]=key===mission;
 s.locations.r2c2.mines=true;
 const infiltration=Object.values(cards).find(c=>!!c.infiltrate===success&&!c.burst&&!c.short);
 const safe=Object.values(cards).find(c=>!c.burst&&!c.short);
 s.deck.order=[...Array(4).fill(infiltration.id),...Array(8).fill(safe.id),...s.deck.order];
 move(s,u,'r2c2',true,'open');
 const attempted=s.events.findLast(e=>e.type==='ENGINEER_PATH_ATTEMPT');
 results.push({id:'SF-08',rule:'Normandy CSR 10, p.15',case:`${mission}: engineer infiltrates a known mined card; infiltration ${success?'succeeds':'fails'}`,
  expected:{pathProcedure:true,minesRemain:!success,exposed:false},observed:{pathProcedure:!!attempted,minesRemain:s.locations.r2c2.mines,exposed:u.exposed,actualInfiltrationSuccess:s.events.findLast(e=>e.type==='UNIT_MOVED')?.text,engineerResult:attempted??null}});
}
for(const result of results)result.passed=Object.entries(result.expected).every(([key,value])=>result.observed[key]===value);
const passed=results.every(r=>r.passed);
console.log(JSON.stringify({scope:'Special formations follow-up audit',passed,results},null,2));
if(!passed)process.exitCode=1;
