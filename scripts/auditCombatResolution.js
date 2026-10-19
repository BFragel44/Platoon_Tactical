// Read-only rule probes: isolated states; never imports or modifies campaign saves.
import {createMission} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {combatExposure} from '../src/sim/company/battlefield.js';
import {prepareCombat,resolvePreparedCombat} from '../src/sim/company/combat.js';
import {cards} from '../src/sim/company/core.js';
const results=[];
function fixture(){
 const s=createMission(cerisy,'combat-resolution-audit'),u=s.units.s11;
 s.units={s11:u};u.location='r1c1';u.cover=null;u.pinned=false;u.exposed=false;
 s.fire=[];s.support=[];s.markers=[];
 Object.assign(s.locations[u.location],{protection:0,open_protection:0,burst:0,smoke:false});
 s.visibility={light:0,weather:0};return {s,u};
}
function check(id,rule,expected,observed){results.push({id,rule,expected,observed,passed:JSON.stringify(expected)===JSON.stringify(observed)});}
for(const visibility of [{light:3,weather:0},{light:0,weather:2}]){
 const {s,u}=fixture();s.visibility=visibility;s.markers=[{type:'GRENADE_MISS',location:u.location}];
 check(`CR-01-${visibility.light?'night':'weather'}`,'7.10.4 p.55: lone missed grenade uses standard VOF modifiers',-1+visibility.light+visibility.weather,combatExposure(s,u).total);
}
{
 const {s,u}=fixture();s.visibility={light:3,weather:2};s.markers=[{type:'GRENADE',target:u.id,location:u.location,value:-4}];
 check('grenade-visibility-exemption','7.10.2 p.55',-4,combatExposure(s,u).total);
 s.markers.push({type:'GRENADE',target:u.id,location:u.location,value:-4});
 check('cumulative-grenades','7.10.2 p.55',-8,combatExposure(s,u).total);
 check('minimum-NCM','6.4 p.45',-4,combatExposure(s,u).ncm);
}
for(const outcome of ['MISS','PIN','HIT']){
 const {s,u}=fixture();u.pinned=true;s.fire=[{source:'external',origin:'r2c1',target:u.location,value:0,indirect:false}];
 prepareCombat(s);const r=s.pending_combat[0];
 const card=Object.values(cards).find(c=>c.id!==51&&c.combat[r.ncm+4]===outcome);
 const hit=Object.values(cards).find(c=>c.id!==51&&c.hit[r.target_experience]==='P');
 s.deck={order:[card.id,hit.id,1],discard:[],draws:0,reshuffles:0};resolvePreparedCombat(s,r.id);
 check(`${outcome}-card-count`,'6.4.1–6.4.3 p.47',outcome==='HIT'?2:1,s.deck.draws);
 check(`${outcome}-pin-state`,'6.4.2 p.47',outcome!=='MISS',r.after.every(v=>v.pinned));
 if(outcome==='HIT')check('experience-column','6.4.3 p.47',hit.hit[r.target_experience],r.hit_effect);
}
{
 const {s,u}=fixture(),v=structuredClone(u);v.id='second';v.steps=v.steps.map((x,i)=>({...x,id:`second-${i}`}));s.units.second=v;
 s.fire=[{source:'external',origin:'r2c1',target:u.location,value:0,indirect:false}];prepareCombat(s);
 const before=JSON.stringify(s.pending_combat[1]);
 const r=s.pending_combat[0],card=Object.values(cards).find(c=>c.id!==51&&c.combat[r.ncm+4]==='HIT'),hit=Object.values(cards).find(c=>c.id!==51&&c.hit[r.target_experience]==='CC');
 s.deck={order:[card.id,hit.id,1],discard:[],draws:0,reshuffles:0};
 resolvePreparedCombat(s,r.id);
 check('frozen-exposures','6.4.1 p.47: resolving a two-casualty HIT leaves subsequent exposure unchanged',true,before===JSON.stringify(s.pending_combat[1]));
 check('new-teams-not-retargeted','6.4.1 p.47',2,s.pending_combat.length);
}
console.log(JSON.stringify({scope:'Infantry combat resolution: focused first pass',passed:results.every(r=>r.passed),results},null,2));
if(results.some(r=>!r.passed))process.exitCode=1;
