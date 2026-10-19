// Isolated production breakdown/rule probes; original saves are never loaded.
import {createMission} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {hill192} from '../src/scenarios/hill192.js';
import {stGermain} from '../src/scenarios/stGermain.js';
import {vire} from '../src/scenarios/vire.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {applyHit} from '../src/sim/company/combat.js';
import {reconstitutionFirepower} from '../src/sim/company/reconstitution.js';
import {vofOf} from '../src/sim/company/battlefield.js';
export function auditSpecialistBreakdowns(){
const results=[];
function fresh(){return createMission(cerisy,'specialist-breakdown-audit');}
function put(s,profile,count=profile.steps){
 const u={...structuredClone(s.units.s11),...structuredClone(profile),id:'audit_unit',counter_id:profile.id,faction:'enemy',location:'r2c2',cover:null,fire:null,steps:Array.from({length:count},(_,i)=>({id:`audit_step${i}`,personnel:[]})),max_steps:profile.steps,named:profile.kind!=='SQUAD',cohesion:'GOOD',pinned:false,removed:null,radios:[],assets:{},used:[],saved:0,initial_resources:{radios:[],assets:{},ammo:structuredClone(profile.ammo??{})}};
 s.units[u.id]=u;return u;
}
function record(id,rule,description,expected,observed){results.push({id,rule,case:description,expected,observed,passed:Object.entries(expected).every(([k,v])=>observed[k]===v)});}
for(const hit of ['F','C','L']){
 const s=fresh(),profile=cerisy.enemy_counters.find(p=>p.breakdown==='german_mortar_section'),u=put(s,profile,2);applyHit(s,u,hit);
 const teams=Object.values(s.units).filter(v=>v.id.startsWith('mortar_')&&v.faction==='enemy'&&v.steps.length&&!v.removed);
 record('SF-17','Normandy breakdown p.48; CSR 4 p.14; series 7.18.1B p.60',`Two-step German 81mm section takes ${hit}: unaffected last mortar retains its operational side`,
  {operationalMortars:1},{operationalMortars:teams.filter(v=>v.cohesion==='GOOD'&&v.vof==='G').length,teams:teams.map(v=>({side:v.cohesion,vof:vofOf(v),ammo:v.ammo.MTR}))});
}
for(const hit of ['F','C','L']){
 const s=fresh(),profile=hill192.enemy_counters.find(p=>p.kind==='FLAK88'),u=put(s,profile);applyHit(s,u,hit);
 record('SF-18','Normandy breakdown p.48 (SF-18 corrected)',`Two-step 88mm gun takes ${hit}: printed chart retains its Good Order one-step gun`,
  {operationalGun:true},{operationalGun:!!u.steps.length&&!u.removed&&u.cohesion==='GOOD',remainingSteps:u.steps.length,vof:vofOf(u),side:u.cohesion});
}
for(const def of [cerisy,stGeorges,hill192,stGermain,vire,tinchebray]){
 const s=createMission({...cerisy,enemy_counters:cerisy.enemy_counters.map(p=>structuredClone(def.enemy_counters.find(v=>v.id===p.id)??p))},'specialist-breakdown-audit'),profile=s.mission_contacts.counters.find(p=>p.id==='fj5'),u=put(s,profile);applyHit(s,u,'F');applyHit(s,u,'F');
 const children=Object.values(s.units).filter(v=>v.parent_counter_id===profile.id&&v.steps.length&&!v.removed);
 record('SF-19','Normandy breakdown p.48',`${def.id}: A/S Fallschirmjager squad retains one A/S Fire Team on breakdown`,
  {asTeams:1},{asTeams:children.filter(v=>vofOf(v)==='A/S').length,ratings:children.map(vofOf)});
}
{
 const s=fresh(),profile=stGermain.enemy_counters.find(p=>p.id==='fj5'),u=put(s,profile);applyHit(s,u,'F');applyHit(s,u,'F');
 const children=Object.values(s.units).filter(v=>v.parent_counter_id===profile.id&&v.steps.length&&!v.removed);
 const donors=[children.find(v=>vofOf(v)==='A/S'),children.find(v=>vofOf(v)==='S')];
 for(const donor of donors)donor.pinned=false;
 record('SF-20','6.5.2 p.49; Normandy breakdown p.48','An A/S Fire Team plus S Fire Team supplies its original two-step A/S squad firepower',
  {eligible:true},{eligible:reconstitutionFirepower(profile,donors),ratings:donors.map(vofOf)});
 record('CONTROL','6.5.2 p.49','Two ordinary S Fire Teams cannot create A/S squad firepower',
  {eligible:false},{eligible:reconstitutionFirepower(profile,donors.map(v=>({...v,vof:'S',fire_team_vof:'S'})))});
}
{
 const s=fresh(),u=s.units.mortar_section;u.steps=u.steps.slice(0,2);applyHit(s,u,'F');
 const teams=Object.values(s.units).filter(v=>v.id.startsWith('mortar_')&&v.steps.length&&!v.removed);
 record('CONTROL','Normandy breakdown p.47','US mortar last pair: one named Fire Team and one operational mortar',
  {operationalMortars:1,fireTeams:1},{operationalMortars:teams.filter(v=>v.cohesion==='GOOD').length,fireTeams:teams.filter(v=>v.cohesion==='F').length});
}
return {scope:'Normandy specialists and formation breakdowns',passed:results.every(r=>r.passed),results};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/auditSpecialistBreakdowns.js')){const report=auditSpecialistBreakdowns();console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;}
