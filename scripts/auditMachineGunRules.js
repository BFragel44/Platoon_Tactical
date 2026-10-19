// Isolated machine-gun rules probes; no player saves or gameplay source changes.
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {refresh,spot,unitElevation} from '../src/sim/company/battlefield.js';
import {concentrate} from '../src/sim/company/actions.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {cards} from '../src/sim/company/core.js';
import {prepareCombat} from '../src/sim/company/combat.js';
const results=[];
function record(id,rule,description,expected,observed){results.push({id,rule,case:description,expected,observed,passed:Object.entries(expected).every(([k,v])=>observed[k]===v)});}
function flat(def=trevieres){
 const s=createMission(def,'mg-audit');s.phase='GENERAL_INITIATIVE';s.impulse={id:'audit',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'fields',elevation:1,borders:borders(DIRECTIONS),covers:[],known:true});
 const parked=Object.values(s.locations).find(l=>l.staging)?.id??'r1c5';
 for(const u of Object.values(s.units)){u.location=parked;u.cover=null;u.fire=null;u.indirect=null;}
 return s;
}
function target(s,location){const t={...structuredClone(s.units.s12),id:'audit_enemy',faction:'enemy',location,vof:null,cover:null};s.units[t.id]=t;spot(s,t);return t;}
for(const upper of [false,true]){
 const s=flat(),u=s.units.hmg50,friend=s.units.s11;u.location='r1c2';friend.location='r2c2';target(s,'r3c2');s.locations.r1c2.elevation=s.locations.r3c2.elevation=2;
 if(upper){s.locations.r2c2.covers.push({id:'upper',type:'Upper Story',elevation:1,value:2,known:true});friend.cover='upper';}
 refresh(s);
 record('SF-15','5.2.2 pp.35–36; 7.2.3 p.51',`Friendly intervening unit ${upper?'in upper story at level 2':'on ground at level 1'}; gun and enemy at level 2`,
  {engaged:!upper},{engaged:u.fire==='r3c2',interveningLevel:unitElevation(s,friend),fireTargets:s.fire.filter(f=>f.source===u.id).map(f=>f.target)});
}
for(const upper of [false,true]){
 const s=flat(),u=s.units.hmg50,friend=s.units.s11;u.location='r1c2';friend.location='r2c2';const t=target(s,'r3c2');
 if(upper){s.locations.r3c2.covers.push({id:'upper',type:'Upper Story',elevation:1,value:2,known:true});t.cover='upper';}
 refresh(s);
 record('SF-15','5.2.2 pp.35–36; 7.2.3 p.51',`Enemy ${upper?'in upper story at level 2':'on ground at level 1'}; gun and intervening friendly at level 1`,
  {engaged:upper},{engaged:u.fire===t.location,targetLevel:unitElevation(s,t),fireTargets:s.fire.filter(f=>f.source===u.id).map(f=>f.target)});
}
for(const vof of ['A+','A']){
 const s=flat(stGeorges),u=s.units.hmg1;u.location='r1c1';u.vof=vof;const t=target(s,'r2c1');u.fire=t.location;
 const r=submitCommand(s,{type:'CONCENTRATE',unit_id:u.id,target_id:t.id});
 record('SF-16','7.2.1 p.51; 7.11.1 p.56',`${vof} tripod HMG with ample MG ammo attempts Concentrate Fire`,{accepted:true},{accepted:r.accepted,reason:r.reason});
}
for(const vof of ['A+','A']){
 const s=flat(stGeorges),u=s.units.hmg1;u.location='r1c1';u.vof=vof;const t=target(s,'r2c1');u.fire=t.location;
 const c=Object.values(cards).find(c=>c.id!==51&&c.jam);s.deck.order=[...Array(3).fill(c.id),...s.deck.order];
 // Direct procedure probe: A+ command acceptance is separately blocked above.
 concentrate(s,u,t);
 record('SF-16','7.12 p.56',`${vof} tripod HMG: jam-card handling in the concentration procedure`,{jammed:true},{jammed:u.removed==='JAMMED',remainingSteps:u.steps.length});
}
{
 const s=flat(),u=s.units.hmg50;u.location='r2c1';target(s,'r2c2');refresh(s);
 const contributions=s.fire.filter(f=>f.source===u.id).length,before=u.ammo.MG;prepareCombat(s);
 record('CONTROL','7.2.2 p.51; 7.18.4 p.61','Three-card grazing fire expends one normal MG ammunition point',
  {contributions:3,ammoSpent:1},{contributions,ammoSpent:before-u.ammo.MG});
}
for(const condition of ['exposed','pinned','out of ammo']){
 const s=flat(),u=s.units.hmg50;u.location='r2c1';target(s,'r2c2');
 if(condition==='exposed')u.exposed=true;if(condition==='pinned')u.pinned=true;if(condition==='out of ammo')u.out_of_ammo=true;refresh(s);
 const fires=s.fire.filter(f=>f.source===u.id);
 record('CONTROL','4.2.5 p.27; 7.2.1 p.51; 7.18.2 p.61',`${condition} HMG: fire footprint`,
  {contributions:condition==='exposed'?0:condition==='pinned'?3:1},
  {contributions:fires.length,values:fires.map(f=>f.value)});
}
const passed=results.every(r=>r.passed);console.log(JSON.stringify({scope:'Normandy tripod/overhead audit; FPL mission eligibility reviewed separately',passed,results},null,2));if(!passed)process.exitCode=1;
