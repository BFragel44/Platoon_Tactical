// Isolated rule-authored procedure/phase fixtures. Does not read player saves.
import {createMission,advancePhase,PHASES} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {retreat,capture} from '../src/sim/company/combat.js';
import {rally} from '../src/sim/company/actions.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';

export function auditRecoveryRetreatCleanup(){
 const results=[];
 const check=(id,rule,expected,observed)=>results.push({id,rule,expected,observed,passed:Object.entries(expected).every(([k,v])=>JSON.stringify(observed[k])===JSON.stringify(v))});
 function fresh(){
  const s=createMission(cerisy,'recovery-retreat-cleanup-audit'),template=structuredClone(s.units.s11);
  s.units={};s.contacts={};s.objectives=null;s.fire=[];s.support=[];s.markers=[];s.assets=[];s.casualties=[];s.prisoners=[];s.impulse=null;s.visibility={light:0,weather:0};
  for(const l of Object.values(s.locations))Object.assign(l,{known:true,terrain:'fields',elevation:1,protection:0,open_protection:0,burst:0,borders:borders(DIRECTIONS),covers:[],smoke:false,mines:false});
  const unit=(id,patch={})=>s.units[id]={...structuredClone(template),id,name:id,kind:'LAT',named:false,location:'r2c2',steps:[{id:`${id}_step`,personnel:[]}],max_steps:1,cohesion:'F',experience:'Green',original_experience:'Veteran',vof:'S',fire_team_vof:'S',range:1,pinned:false,exposed:false,cover:null,fire:null,indirect:null,removed:null,radios:[],assets:{},ammo:{},used:[],saved:0,...patch};
  const u=unit('subject');return {s,u,unit};
 }
 function phase(s,id){s.phase=id;s.impulse=null;s.segment_progress=null;return advancePhase(s).state;}
 function fire(s,id){s.markers.push({type:'GRENADE_MISS',location:id});}
 // Card-wide VOF, including inactive mines, controls automatic pinned recovery.
 for(const type of ['none','basic','incoming','grenade','miss','sniper','inactive-mines']){
  const {s,u}=fresh();u.pinned=true;
  if(type==='basic')s.fire=[{source:'outside',origin:'r2c3',target:u.location,value:0}];
  if(type==='incoming')s.support=[{status:'ACTIVE',location:u.location,value:-4}];
  if(['grenade','miss','sniper'].includes(type))s.markers=[{type:({grenade:'GRENADE',miss:'GRENADE_MISS',sniper:'SNIPER'})[type],location:u.location,target:'another-unit',value:-4}];
  if(type==='inactive-mines')s.locations[u.location].mines=true;
  const next=phase(s,'PINNED_RECOVERY');
  check(`automatic-unpin-${type}`,'3.7.3 p.17', {pinned:type!=='none'}, {pinned:next.units[u.id].pinned});
 }
 for(const [before,after,named,experience] of [['P','L',false,'Green'],['L','F',false,'Green'],['F','A',false,'Line'],['F','GOOD',true,'Veteran']]){
  const {s,u}=fresh();u.cohesion=before;u.named=named;const draws=s.deck.draws;
  rally(s,u,u,true);
  check(`rally-without-fire-${before}-${named}`,'6.5.1 pp.48–49', {side:after,experience,draws:0}, {side:u.cohesion,experience:u.experience,draws:s.deck.draws-draws});
 }
 for(const success of [false,true]){
  const {s,u}=fresh();u.cohesion='P';fire(s,u.location);const card=Object.values(cards).find(c=>c.id!==51&&(c.word==='Rally')===success);
  s.deck.order=Array(12).fill(card.id);const draws=s.deck.draws;rally(s,u,u,true);
  check(`rally-under-fire-${success}`,'6.5.1 pp.48–49; Green draw modifier', {side:success?'L':'P',draws:1}, {side:u.cohesion,draws:s.deck.draws-draws});
 }
 // Normal LAT movement restrictions do not govern automatic retreat.
 for(const scenario of ['empty-rear','rear-under-fire','rear-overstacked']){
  const {s,u,unit}=fresh();u.cohesion='P';fire(s,u.location);
  for(let col=1;col<=3;col++){
   if(scenario!=='empty-rear')unit(`rear${col}`,{location:`r1c${col}`,steps:Array.from({length:scenario==='rear-overstacked'?16:1},(_,i)=>({id:`rear${col}_${i}`,personnel:[]}))});
   if(scenario==='rear-under-fire')fire(s,`r1c${col}`);
  }
  retreat(s);
  check(`retreat-${scenario}`,'3.5.2 p.16: override LAT movement restrictions and stacking', {retreated:true,exposed:true}, {retreated:s.locations[u.location].row===1,exposed:u.exposed});
 }
 {
  const {s,u,unit}=fresh();u.cohesion='P';fire(s,u.location);
  for(let col=1;col<=3;col++)unit(`rear${col}`,{location:`r1c${col}`});
  s.locations.r1c1.protection=3;
  unit('observer',{location:'r3c3',faction:'enemy',kind:'FO',cohesion:'GOOD',vof:null,range:0});
  retreat(s);
  check('retreat-cover-before-opponent-LOS','3.5.2 p.16: among no-VOF cards choose best C&C', {location:'r1c1'}, {location:u.location});
 }
 {
  const {s,u,unit}=fresh();u.cohesion='P';fire(s,u.location);
  unit('rear',{location:'r1c2'});s.locations[u.location].covers=[{id:'origin-trench',type:'Trench',value:2}];u.cover='origin-trench';
  s.locations.r1c2.covers=[{id:'rear-trench',type:'Trench',value:2,known:true}];
  retreat(s);
  check('retreat-trench-exposure','3.5.2 p.16: mark retreating teams Exposed', {location:'r1c2',exposed:true}, {location:u.location,exposed:u.exposed});
 }
 for(const blocked of ['pinned','exposed','no-fire','litter-without-casualty']){
  const {s,u,unit}=fresh();u.cohesion=blocked==='litter-without-casualty'?'L':'P';unit('rear',{location:'r1c2'});
  if(blocked!=='no-fire')fire(s,u.location);if(blocked==='pinned')u.pinned=true;if(blocked==='exposed')u.exposed=true;
  retreat(s);check(`retreat-not-eligible-${blocked}`,'3.5.2 p.16',{location:'r2c2'},{location:u.location});
 }
 {
  const {s,u,unit}=fresh();u.cohesion='L';fire(s,u.location);unit('rear',{location:'r1c2'});s.locations.r1c2.protection=1;
  s.casualties=[{id:'wounded',location:u.location,cover:null,faction:'friendly',carrier:null,evacuated:false}];
  retreat(s);check('litter-carries-casualty-back','3.5.2 p.16',{location:'r1c2',carrier:u.id,exposed:true},{location:u.location,carrier:s.casualties[0].carrier,exposed:u.exposed});
 }
 {
  const {s,u}=fresh();Object.assign(u,{faction:'enemy',location:`r${s.boundaries.rows}c2`,cohesion:'P',assets:{smoke:1}});fire(s,u.location);
  retreat(s);check('enemy-retreat-off-home-edge','3.5.2 p.16',{removed:'WITHDRAWN',dropped:true},{removed:u.removed,dropped:s.assets.some(a=>a.key==='smoke')});
 }
 for(const guarded of [false,true]){
  const {s,u,unit}=fresh();u.faction='enemy';u.cohesion='P';
  const guard=unit('guard',{steps:[{id:'g1',personnel:[]},{id:'g2',personnel:[]},{id:'g3',personnel:[]}],kind:'SQUAD',cohesion:'GOOD',experience:'Veteran'});
  if(guarded)unit('support',{faction:'enemy',pinned:true});
  capture(s);check(`capture-isolated-${guarded}`,'3.5.1 p.16; 8.15 p.69',{captured:!guarded,guardSteps:guarded?3:2},{captured:u.removed==='CAPTURED',guardSteps:guard.steps.length});
 }
 for(const pinned of [true,false]){
  const {s,u,unit}=fresh();u.faction='enemy';u.cohesion='L';const guard=unit('guard',{pinned});
  capture(s);check(`capture-guard-pinned-${pinned}`,'3.5.1 p.16; 8.15 p.69',{captured:!pinned,prisoners:pinned?0:1},{captured:u.removed==='CAPTURED',prisoners:s.prisoners.length});
 }
 // Phase order and support lifetime: ACTIVE support survives Cleanup and command phases.
 {
  const {s}=fresh();s.support=[{id:'old',status:'ACTIVE',location:'r1c1',value:-4},{id:'new',status:'PENDING',location:'r1c2',value:-3}];
  const cleaned=phase(s,'CLEANUP');
  check('incoming-not-removed-at-cleanup','3.7.1 / 3.8 p.17',{active:['old'],pending:['new']},{active:cleaned.support.filter(f=>f.status==='ACTIVE').map(f=>f.id),pending:cleaned.support.filter(f=>f.status==='PENDING').map(f=>f.id)});
  const updated=phase(cleaned,'FIRE_MISSIONS');
  check('incoming-expires-at-fire-mission-update','3.7.1 p.17',{support:[['new','ACTIVE']]},{support:updated.support.map(f=>[f.id,f.status])});
 }
 {
  const {s,u}=fresh();const temporary=['ILLUMINATION','GRENADE','GRENADE_MISS','CONCENTRATE','SNIPER','MINES','WP_SMOKE'];
  s.markers=temporary.map(type=>({type,location:u.location,target:u.id,value:-4}));s.locations[u.location].smoke=true;s.locations[u.location].mines=true;
  Object.assign(u,{exposed:true,mine_hit:true,used:['test'],indirect:'r1c1',temporary_pdf:{origin:u.location,target:'r1c1'}});
  const next=phase(s,'CLEANUP');
  check('cleanup-temporary-markers-and-unit-flags','3.8 p.17',{markers:[],smoke:false,mines:true,exposed:false,mineHit:false,used:[],indirect:null,temporaryPDF:false},
   {markers:next.markers.map(m=>m.type),smoke:next.locations[u.location].smoke,mines:next.locations[u.location].mines,exposed:next.units[u.id].exposed,mineHit:next.units[u.id].mine_hit,used:next.units[u.id].used,indirect:next.units[u.id].indirect,temporaryPDF:!!next.units[u.id].temporary_pdf});
 }
 {
  const {s,u}=fresh();u.pinned=true;s.markers=[{type:'GRENADE_MISS',location:u.location}];
  const next=phase(s,'CLEANUP');check('cleanup-does-not-unpin','3.7.3 / 3.8 p.17',{pinned:true,phase:'FRIENDLY_EVENTS',turn:2},{pinned:next.units[u.id].pinned,phase:next.phase,turn:next.turn});
 }
 {
  const {s,u,unit}=fresh();u.location='r1c3';const e=unit('enemy',{location:'r3c3',faction:'enemy',kind:'MG',cohesion:'GOOD',fire:'r1c1',range:3});
  s.fire=[{source:e.id,origin:e.location,target:'r1c1',value:0}];
  const next=phase(s,'CLEANUP');check('cleanup-enemy-cease-and-reengage','3.8 p.17',{target:'r1c3'},{target:next.units[e.id].fire});
 }
 {
  const {s,u}=fresh();s.phase='COMBAT_EFFECTS';s.markers=[{type:'GRENADE_MISS',location:u.location}];
  s.pending_combat=[{id:'pending',target_id:u.id,target_visible:true,status:'PENDING'}];s.segment_progress={index:0,status:'awaiting_resolution'};
  const blocked=advancePhase(s);
  check('cleanup-blocked-by-pending-combat','3.7.4 / 3.8 p.17',{accepted:false,sameState:true,markers:1},{accepted:blocked.accepted,sameState:blocked.state===s,markers:blocked.state.markers.length});
  s.pending_combat[0].status='RESOLVED';s.segment_progress.status='reviewing';
  const entered=advancePhase(s).state;
  check('cleanup-entry-keeps-markers-until-resolve','Explicit phase stepping; 3.8 p.17',{phase:'CLEANUP',markers:1},{phase:entered.phase,markers:entered.markers.length});
  const cleaned=advancePhase(entered).state;
  check('cleanup-resolution-clears-markers','3.8 p.17',{markers:0},{markers:cleaned.markers.length});
 }
 {
  const keys=PHASES.map(p=>p[0]);
  check('capture-retreat-combat-cleanup-order','3.5–3.8 pp.16–17',{ordered:true},{ordered:['CAPTURE','RETREAT','AT_COMBAT','FIRE_MISSIONS','CONTACTS','PINNED_RECOVERY','COMBAT_EFFECTS','CLEANUP'].every((p,i,a)=>!i||keys.indexOf(a[i-1])<keys.indexOf(p))});
 }
 return {scope:'Infantry recovery, automatic retreat/capture and Cleanup timing',observations:results.length,passed:results.every(r=>r.passed),results};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/auditRecoveryRetreatCleanup.js')){
 const report=auditRecoveryRetreatCleanup();console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}
