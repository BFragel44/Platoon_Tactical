// Expanded lifecycle audit; synthetic starting states, production phase/combat calls.
import {createMission,advancePhase,resolveCombat} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {refresh,combatExposure} from '../src/sim/company/battlefield.js';
import {prepareCombat} from '../src/sim/company/combat.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
import {placeIllumination} from '../src/sim/company/visibility.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';

export function auditCleanupLifecycle(){
 const results=[];
 const check=(id,rule,expected,observed)=>results.push({id,rule,expected,observed,passed:Object.entries(expected).every(([k,v])=>JSON.stringify(observed[k])===JSON.stringify(v))});
 function fresh(){
  const s=createMission(cerisy,'cleanup-lifecycle-audit'),co=structuredClone(s.units.co),template=structuredClone(s.units.mg1);
  s.units={co};s.contacts={};s.objectives=null;s.support=[];s.markers=[];s.fire=[];s.assets=[];s.casualties=[];s.impulse=null;s.visibility={light:0,weather:0};delete s.mission_rules.events;
  for(const l of Object.values(s.locations))Object.assign(l,{known:true,terrain:'fields',elevation:1,protection:3,open_protection:3,burst:0,borders:borders(DIRECTIONS),covers:[],smoke:false,mines:false});
  const unit=(id,patch={})=>s.units[id]={...structuredClone(template),id,name:id,faction:'friendly',kind:'MG',named:true,mission_weapon:true,location:'r1c1',steps:[{id:`${id}_step`,personnel:[]}],cohesion:'GOOD',experience:'Line',original_experience:'Line',max_steps:1,vof:'S',range:3,pinned:false,exposed:false,removed:null,cover:null,fire:null,indirect:null,radios:[],assets:{},ammo:{},initial_resources:{radios:[],assets:{},ammo:{}},used:[],saved:0,...patch};
  const u=unit('receiver');return {s,u,unit};
 }
 function cleanup(s){s.phase='CLEANUP';s.impulse=null;s.segment_progress=null;return advancePhase(s).state;}
 for(const type of ['GRENADE','GRENADE_MISS','CONCENTRATE','ILLUMINATION','SNIPER','MINES','WP_SMOKE','BOOBY_TRAP']){
  const {s,u}=fresh();s.markers=[{type,location:u.location,target:u.id,value:-4,center:1,adjacent:0}];
  s.phase='COMBAT_EFFECTS';s.pending_combat=[];s.segment_progress={status:'reviewing',index:0};
  const entry=advancePhase(s).state;
  check(`review-keeps-${type}`,'3.7.4/3.8 p.17',{phase:'CLEANUP',markers:1},{phase:entry.phase,markers:entry.markers.length});
  const next=advancePhase(entry).state;
  check(`cleanup-removes-${type}`,'3.8 p.17',{markers:0},{markers:next.markers.length});
 }
 for(const weather of [0,1,2]){
  const {s,u,unit}=fresh();s.visibility={light:3,weather};
  const e=unit('enemy',{location:'r3c1',faction:'enemy',vof:null});s.knowledge.spotted[e.id]={id:e.id};
  placeIllumination(s,e.location,'artillery');refresh(s);
  const before=s.fire.some(f=>f.source===u.id&&f.target===e.location);
  const next=cleanup(s);
  check(`illumination-expiry-LOS-weather${weather}`,'9.2/9.2.1 p.70; 3.8 p.17',{before:weather<2,after:false,light:3,weather},
   {before,after:next.fire.some(f=>f.source===u.id&&f.target===e.location),light:next.visibility.light,weather:next.visibility.weather});
 }
 {
  const {s,u,unit}=fresh();s.visibility={light:3,weather:1};
  const e=unit('enemy',{location:'r2c1',faction:'enemy'});s.knowledge.spotted[e.id]={id:e.id};placeIllumination(s,u.location,'artillery');refresh(s);
  const before=combatExposure(s,u).parts.visibility,next=cleanup(s),after=combatExposure(next,next.units[u.id]).parts.visibility;
  check('illumination-expiry-restores-next-turn-modifier','9.2 p.70',{before:1,after:4},{before,after});
 }
 for(const value of [1,2]){
  const {s,u,unit}=fresh();s.locations[u.location].smoke=true;s.locations[u.location].smoke_value=value;
  const e=unit('enemy',{location:'r2c1',faction:'enemy',vof:null});s.knowledge.spotted[e.id]={id:e.id};refresh(s);
  const before=s.fire.some(f=>f.source===u.id),next=cleanup(s);
  check(`smoke-expiry-reopens-fire-${value}`,'3.8 p.17; 5.4 p.38',{before:false,after:true,smoke:false},{before,after:next.fire.some(f=>f.source===u.id),smoke:next.locations[u.location].smoke});
 }
 {
  const {s,u,unit}=fresh();Object.assign(u,{tripod:true,vof:'H',exposed:true,ammo:{MG:3}});
  const e=unit('enemy',{location:'r2c1',faction:'enemy',vof:null});s.knowledge.spotted[e.id]={id:e.id};refresh(s);
  const before=s.fire.some(f=>f.source===u.id),next=cleanup(s);
  check('exposure-expiry-reopens-tripod-without-extra-volley','3.8 p.17; 7.18 p.59',{before:false,after:true,exposed:false,ammo:3},
   {before,after:next.fire.some(f=>f.source===u.id),exposed:next.units[u.id].exposed,ammo:next.units[u.id].ammo.MG});
 }
 {
  const {s,u}=fresh();s.support=[{id:'old',location:u.location,status:'ACTIVE',value:-4},{id:'next',location:'r1c2',status:'PENDING',value:-3}];
  let next=cleanup(s),throughCommands=true;
  for(let i=0;i<35&&next.phase!=='FIRE_MISSIONS';i++){
   throughCommands&&=next.support.some(f=>f.id==='old'&&f.status==='ACTIVE')&&next.support.some(f=>f.id==='next'&&f.status==='PENDING');
   const result=advancePhase(next);if(result.state===next)throw new Error(`Blocked at ${next.phase}: ${result.reason}`);next=result.state;
  }
  check('incoming-persists-through-next-command-and-retreat','3.7.1 p.17',{phase:'FIRE_MISSIONS',preserved:true},{phase:next.phase,preserved:throughCommands});
  next=advancePhase(next).state;
  check('incoming-replaced-before-recovery-and-combat','3.7.1 p.17',{missions:[['next','ACTIVE']]},{missions:next.support.map(f=>[f.id,f.status])});
 }
 {
  const s=createMission(stGeorges,'cleanup-illumination');const caller=s.units.artyfo,target='r1c2',stock=s.support_inventory.artillery.ILLUM;
  const card=Object.values(cards).find(c=>c.id!==51&&c.burst&&!c.short&&!c.multi);s.deck.order=Array(12).fill(card.id);
  supportRequest(s,caller,'artillery','ILLUM',target);
  check('offmap-illumination-is-immediate','7.16.3 p.59; 9.2 p.70',{illumination:1,pending:0,stock:stock-1},{illumination:s.markers.filter(m=>m.type==='ILLUMINATION').length,pending:s.support.length,stock:s.support_inventory.artillery.ILLUM});
  const next=cleanup(s);
  check('offmap-illumination-expires-without-refund','7.16.3 p.59',{illumination:0,stock:stock-1},{illumination:next.markers.filter(m=>m.type==='ILLUMINATION').length,stock:next.support_inventory.artillery.ILLUM});
 }
 {
  const {s,u,unit}=fresh();const e=unit('enemy',{faction:'enemy',location:'r2c1',vof:'H'});s.knowledge.spotted[e.id]={id:e.id};
  refresh(s);s.markers.push({type:'CONCENTRATE',location:u.location,target:u.id,source:e.id,value:1});
  prepareCombat(s);s.phase='COMBAT_EFFECTS';s.segment_progress={index:0,status:'awaiting_resolution'};
  const frozen=structuredClone(s.pending_combat.find(r=>r.target_id===u.id)),fire=structuredClone(s.fire);
  const victim=s.pending_combat.find(r=>r.target_id===e.id),combat=Object.values(cards).find(c=>c.id!==51&&c.combat[victim.ncm+4]==='HIT'),hit=Object.values(cards).find(c=>c.id!==51&&c.hit.Line.startsWith('C'));
  s.deck={order:[combat.id,hit.id,...s.deck.order],discard:[],draws:0,reshuffles:0};
  let next=resolveCombat(s,victim.id).state;
  check('killed-source-does-not-refresh-frozen-fire','3.7.4 p.17; 6.4.1 p.47',{lost:true,sameFire:true,sameExposure:true,concentration:true},
   {lost:!!next.units[e.id].removed,sameFire:JSON.stringify(next.fire)===JSON.stringify(fire),sameExposure:JSON.stringify(next.pending_combat.find(r=>r.target_id===u.id))===JSON.stringify(frozen),concentration:next.markers.some(m=>m.type==='CONCENTRATE')});
  for(const pending of next.pending_combat.filter(r=>r.status==='PENDING')){
   const safe=Object.values(cards).find(c=>c.id!==51&&c.combat[pending.ncm+4]!=='HIT');
   next.deck.order=[safe.id,...next.deck.order];next=resolveCombat(next,pending.id).state;
  }
  if(next.segment_progress.status!=='reviewing')next=advancePhase(next).state;
  next=advancePhase(next).state;
  check('killed-source-fire-persists-until-cleanup-resolves','3.7.4/3.8 p.17',{phase:'CLEANUP',sameFire:true},{phase:next.phase,sameFire:JSON.stringify(next.fire)===JSON.stringify(fire)});
  next=advancePhase(next).state;
  check('cleanup-removes-dead-source-and-concentration','3.8 p.17',{deadSourceFire:false,concentration:false,pending:0},
   {deadSourceFire:next.fire.some(f=>f.source===e.id),concentration:next.markers.some(m=>m.type==='CONCENTRATE'),pending:next.pending_combat.length});
 }
 {
  const {s,u}=fresh();s.assets=[{id:'dropped',type:'EQUIPMENT',key:'smoke',quantity:1,location:u.location}];s.phone_lines=[{id:'wire',location:u.location,cut:true}];s.registered_targets={artillery:'r2c2'};s.locations[u.location].mines=true;s.locations[u.location].covers=[{id:'cover',type:'Cover',value:1,known:true}];
  const next=cleanup(s);check('cleanup-preserves-persistent-battlefield-data','3.8 p.17; 7.16.5 p.59',{gear:1,cut:true,target:'r2c2',mines:true,cover:'cover'},
   {gear:next.assets.length,cut:next.phone_lines[0].cut,target:next.registered_targets.artillery,mines:next.locations[u.location].mines,cover:next.locations[u.location].covers[0].id});
 }
 return {scope:'Expanded infantry Cleanup lifecycle and fire refresh',observations:results.length,passed:results.every(r=>r.passed),results};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/auditCleanupLifecycle.js')){const report=auditCleanupLifecycle();console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;}
