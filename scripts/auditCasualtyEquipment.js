// Rule-authored probes of production functions. Never opens or modifies a player save.
import {createMission} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {applyHit,prepareCombat} from '../src/sim/company/combat.js';
import {eligibleTargets,move} from '../src/sim/company/actions.js';
import {cards,dropLoad} from '../src/sim/company/core.js';
import {damagePhoneLines} from '../src/sim/company/phoneNetwork.js';

export function auditCasualtyEquipment(){
 const results=[];
 function check(id,rule,expected,observed){
  results.push({id,rule,expected,observed,passed:Object.entries(expected).every(([key,value])=>JSON.stringify(observed[key])===JSON.stringify(value))});
 }
 function fresh({definition=cerisy,count=1,kind='HQ',roll=2}={}){
  const s=createMission(definition,'casualty-equipment-audit'),u=s.units.co;
  s.units={co:u};u.kind=kind;u.named=kind!=='SQUAD';u.max_steps=count;u.steps=Array.from({length:count},(_,i)=>({id:`audit_step${i}`,personnel:[]}));
  Object.assign(u,{location:'r1c1',cover:'shelter',cohesion:'GOOD',pinned:false,exposed:false,removed:null,radios:['CO','CO_PHONE'],assets:{smoke:2},ammo:{MG:3,RKT:1}});
  u.initial_resources={radios:[...u.radios],assets:{...u.assets},ammo:{...u.ammo}};
  s.locations[u.location].covers=[{id:'shelter',value:1,known:true}];s.assets=[];s.casualties=[];s.markers=[];s.fire=[];s.support=[];
  const card=Object.values(cards).find(c=>c.id!==51&&c.random[0]===roll);
  s.deck={order:Array(16).fill(card.id),discard:[],draws:0,reshuffles:0};
  s.casualties.push({id:'carried',step:{id:'old_casualty',personnel:[]},faction:'friendly',origin_name:'Earlier casualty',carrier:u.id,location:u.location,cover:u.cover,evacuated:false});
  return {s,u};
 }
 const live=s=>Object.values(s.units).filter(u=>u.steps.length&&!u.removed);
 for(const roll of [1,2])for(const effect of ['C','CC']){
  const {s,u}=fresh({roll});applyHit(s,u,effect);
  check(`only-step-${effect}-roll${roll}`,'4.3.4 p.29; 4.3.5 p.30; 6.4.3 p.47',
   {casualties:1,draws:2,devices:2,destroyed:roll===1?2:0,carriedDropped:true,ammoGround:0},
   {casualties:s.casualties.length-1,draws:s.deck.draws,devices:s.assets.filter(a=>a.type==='RADIO').length,destroyed:s.assets.filter(a=>a.destroyed).length,carriedDropped:s.casualties[0].carrier===null,ammoGround:s.assets.filter(a=>a.type==='AMMO').length});
  check(`casualty-position-${effect}-roll${roll}`,'5.1.6E p.33',
   {equipment:2,location:'r1c1',cover:'shelter'},
   {equipment:s.assets.filter(a=>a.type==='EQUIPMENT').reduce((n,a)=>n+a.quantity,0),location:s.casualties.at(-1).location,cover:s.casualties.at(-1).cover});
  const picker={...structuredClone(u),id:'picker',steps:[{id:'picker_step',personnel:[]}],removed:null,radios:[],assets:{},ammo:{}};s.units.picker=picker;
  check(`destroyed-device-pickup-${effect}-roll${roll}`,'4.3.4/5 pp.29–30',
   {recoverable:roll===1?0:2},
   {recoverable:eligibleTargets(s,picker,'PICKUP_RADIO').filter(id=>s.assets.find(a=>a.id===id)?.type==='RADIO').length});
 }
 for(const count of [2,3]){
  const {s,u}=fresh({count,kind:'SQUAD'});applyHit(s,u,'CC');
  check(`two-casualties-${count}-steps`,'4.3.4/5 pp.29–30; 6.4.3 p.47',
   {casualties:2,draws:count===2?2:0,retainedDevices:count===2?0:2},
   {casualties:s.casualties.length-1,draws:s.deck.draws,retainedDevices:live(s).reduce((n,v)=>n+v.radios.length,0)});
 }
 for(const effect of ['F','A','P','L','FC','CF','PC','CP']){
  const {s,u}=fresh({count:2,kind:'SQUAD'});applyHit(s,u,effect);
  const survivors=live(s),last=survivors.find(v=>v.radios.length);
  check(`last-noncasualty-assets-${effect}`,'5.1.6E p.33',
   {radios:2,equipment:2,carriedRetained:true,damageDraws:0},
   {radios:survivors.reduce((n,v)=>n+v.radios.length,0),equipment:survivors.reduce((n,v)=>n+(v.assets.smoke??0),0),carriedRetained:s.casualties[0].carrier===last?.id,damageDraws:s.deck.draws});
  check(`generic-breakdown-ammo-${effect}`,'5.1.6E p.33: only chart ammo-tracking Fire Teams inherit ammunition',
   {ammo:0}, {ammo:survivors.reduce((n,v)=>n+Object.values(v.ammo??{}).reduce((a,b)=>a+b,0),0)});
 }
 {
  const {s,u}=fresh({count:2,kind:'SQUAD'});u.last_step_vof='A';u.vof='A';applyHit(s,u,'CF');
  check('chart-MG-ammo-versus-cargo','5.1.6E p.33; Normandy p.48',
   {MG:3,RKT:0}, {MG:live(s).reduce((n,v)=>n+(v.ammo.MG??0),0),RKT:live(s).reduce((n,v)=>n+(v.ammo.RKT??0),0)});
 }
 for(const effect of ['P','PC']){
  const {s,u}=fresh({definition:companyAssault,roll:1});applyHit(s,u,effect);
  check(`company-assault-noncasualty-${effect}`,'5.1.6E p.33; 6.4.3 p.47: only first letter applies to a one-step unit',
   {casualties:0,draws:0,retainedDevices:2,equipment:2},
   {casualties:s.casualties.length-1,draws:s.deck.draws,retainedDevices:live(s).reduce((n,v)=>n+v.radios.length,0),equipment:live(s).reduce((n,v)=>n+(v.assets.smoke??0),0)});
 }
 {
  const {s,u}=fresh();u.pinned=true;const before=s.deck.draws;
  check('pinned-load-retained','5.1.6E p.33', {devices:2,carried:true,draws:0}, {devices:u.radios.length,carried:s.casualties[0].carrier===u.id,draws:s.deck.draws-before});
  dropLoad(s,u,'forced withdrawal');
  check('forced-drop-at-current-cover','5.1.6E p.33', {devices:2,cover:'shelter',location:'r1c1',carrier:null,draws:0},
   {devices:s.assets.filter(a=>a.type==='RADIO').length,cover:s.casualties[0].cover,location:s.casualties[0].location,carrier:s.casualties[0].carrier,draws:s.deck.draws-before});
 }
 {
  const {s,u}=fresh();u.radios=[];u.assets={};u.ammo={};s.casualties[0].cover='shelter';
  s.locations.r1c2.covers=[{id:'destination_cover',value:1,known:true}];
  move(s,u,'r1c2',false,'destination_cover');applyHit(s,u,'C');
  check('carrier-final-casualty-after-helper-movement','5.1.6E p.33: carried casualties drop in the carrier’s current area',
   {location:'r1c2',cover:'destination_cover',carrier:null},
   {location:s.casualties[0].location,cover:s.casualties[0].cover,carrier:s.casualties[0].carrier});
 }
 {
  const {s,u}=fresh();applyHit(s,u,'C');s.fire=[{source:'external',origin:'r1c2',target:'r1c1',value:0}];
  check('casualties-excluded-from-combat','6.4.3 p.47', {recipients:0}, {recipients:prepareCombat(s).length});
 }
 for(const roll of [1,2]){
  const {s,u}=fresh({roll});s.mission_rules.communications='phones';s.phone_lines=[{id:'wire',location:u.location,cut:false}];s.support=[{status:'ACTIVE',location:u.location,value:-4}];
  damagePhoneLines(s);
  check(`incoming-wire-roll${roll}`,'4.3.4 p.29', {cut:roll===1,draws:1}, {cut:s.phone_lines[0].cut,draws:s.deck.draws});
 }
 return {scope:'Infantry casualty and equipment consequences; isolated production-function probes',observations:results.length,passed:results.every(r=>r.passed),results};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/auditCasualtyEquipment.js')){
 const report=auditCasualtyEquipment();console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}
