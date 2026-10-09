import {describe,it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {missionCatalog,playableMissionById} from '../src/scenarios/missions.js';
import {createMission,previewMissionSetup,checkObjective,advancePhase,endTurn,submitCommand,resolveSupportChoice,exportReplay,replayMission,abortMission,prepareReattempt} from '../src/sim/company/engine.js';
import {placePackage,packageAvailable} from '../src/sim/company/missionContacts.js';
import {applyHit,enemyActivity} from '../src/sim/company/combat.js';
import {hastyActivityTable} from '../src/sim/company/enemyHierarchy.js';
import {supportRequest,secureStatus} from '../src/sim/company/missionFeatures.js';
import {specialActivity} from '../src/sim/company/specialEnemies.js';
import {canFire,coverOf,refresh} from '../src/sim/company/battlefield.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {cards} from '../src/sim/company/core.js';
import {borders} from '../src/sim/company/terrain.js';
import {rally,orderReason} from '../src/sim/company/actions.js';
import {createCampaignRoster,saveCampaign,readCampaign,applyMissionDebrief,CAMPAIGN_KEY,startStandaloneRoster} from '../src/sim/company/campaignRoster.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const candidate={...cerisy,readiness:{playable:true}};
const fresh=(seed='cerisy-fixture')=>createMission(candidate,seed);
const flat=s=>{for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'open',building:false,borders:borders(),elevation:1,covers:[]});s.units.s11.location='r1c2';return s;};
const stack=(s,n,sides)=>{const card=Object.values(cards).find(c=>c.random[sides-2]===n);s.deck.order=[card.id,...s.deck.order];};
const enemies=s=>Object.values(s.units).filter(u=>u.faction==='enemy'&&!u.removed);
describe('Cerisy source content and standalone isolation',()=>{
 it('previews the five-row source setup and normally selects accepted M1 and M2',()=>{
  const p=previewMissionSetup(cerisy,'preview');expect(p.locations).toHaveLength(24);expect(p.units).toHaveLength(24);
  expect(p.units.filter(u=>u.kind==='FO')).toHaveLength(2);expect(p.objectives.primary.location).toBe('r5c2');
  expect(cerisy.enemy_counters.filter(c=>c.kind==='SQUAD').map(c=>c.vof)).toEqual(['A','A','A','S','A/S','A/S']);
  expect(cerisy.contact_rows).toEqual({1:'C',2:'C',3:'B',4:'B',5:'A'});
  expect(playableMissionById('normandy_2')).toBe(cerisy);expect(playableMissionById('normandy_1')).toBe(trevieres);
  expect(missionCatalog.find(m=>m.id==='normandy_2').scenario).toBe(cerisy);
  expect(()=>previewMissionSetup({...cerisy,packages:{...cerisy.packages,7:{units:[{kind:'LASER'}]}}},'invalid')).toThrow('Unsupported Normandy package 7');
 });
 it('validates objective choices and requires every original row 1–4 card',()=>{
  expect(()=>fresh('invalid',{})).not.toThrow();const s=fresh();s.turn=10;
  for(const c of Object.values(s.contacts))c.resolved=true;s.units.s11.location='r5c2';s.units.s12.location='r5c3';
  const blocked=structuredClone(s);blocked.contacts.pc_r4c4.resolved=false;checkObjective(blocked);expect(blocked.status).toBe('DEFEAT');
  s.locations.r4c5={...structuredClone(s.locations.r4c4),id:'r4c5',col:5};s.contacts.expanded={id:'expanded',type:'A',location:'r4c5',resolved:false};checkObjective(s);expect(s.status).toBe('SUCCESS');
  expect(()=>createMission(candidate,'bad',{objectives:{primary:'r3c2'}})).toThrow('final row');
 });
 it('isolates M2 deployment, debrief and duplicate rejection from the M1 storage slot',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  saveCampaign(storage,createCampaignRoster('m1-preserved',trevieres));const original=data.get(CAMPAIGN_KEY);
  const roster=createCampaignRoster('cerisy-fresh',candidate),key=cerisy.rules.rosterKey;saveCampaign(storage,roster,key);
  const active=createMission(candidate,'isolated',{}, {mission_instance_id:'m2-isolated',roster});const snapshot=structuredClone(active.roster_snapshot);
  const terminal=abortMission(active).state,next=applyMissionDebrief(roster,terminal);saveCampaign(storage,next,key,0);
  expect(data.get(CAMPAIGN_KEY)).toBe(original);expect(readCampaign(storage,key).record.revision).toBe(1);
  expect(active.roster_snapshot).toEqual(snapshot);expect(()=>applyMissionDebrief(next,terminal)).toThrow('already applied');
  expect(resumeCheckpoint(candidate,checkpoint(terminal)).state).toEqual(terminal);
 });
});
describe('Cerisy package placement',()=>{
 for(let number=1;number<=11;number++)it(`places published package ${number} without substituting unsupported counters`,()=>{
  const s=flat(fresh('package-'+number)),pc=s.contacts.pc_r1c2,p=s.mission_contacts.packages[number];expect(packageAvailable(s,pc,p)).toBe(true);expect(placePackage(s,pc,p)).toBe(true);
  expect(enemies(s).every(u=>cerisy.enemy_counters.some(c=>c.id===u.counter_id))).toBe(true);
  if(number===5){expect(enemies(s)).toHaveLength(3);expect(coverOf(s,enemies(s).find(u=>u.kind==='HMG')).type).toBe('Bunker');}
  if(number===7){expect(enemies(s).find(u=>u.kind==='SQUAD').steps).toHaveLength(2);expect(enemies(s).every(u=>coverOf(s,u).type==='Deep Bunker'&&!canFire(s,u,'r1c2'))).toBe(true);}
  if(number===8){const units=enemies(s);expect(units.find(u=>u.kind==='MORTAR').steps).toHaveLength(3);expect(new Set(units.map(u=>u.cover)).size).toBe(1);}
 });
 it('places artillery incoming without a spotter and mortar incoming with one',()=>{
  for(const [index,kind]of [[0,null],[1,'SPOTTER']]){const s=flat(fresh());const p=cerisy.packages[1].alternatives[index];expect(placePackage(s,s.contacts.pc_r1c2,p)).toBe(true);expect(s.support[0].value).toBe(index?-3:-4);expect(enemies(s).length).toBe(index?1:0);if(kind)expect(enemies(s)[0].missions_remaining).toBe(2);}
 });
 it('selects point blank and close command-post branches and both pillbox branches',()=>{
  for(const roll of [1,4]){const s=flat(fresh());stack(s,roll,5);expect(placePackage(s,s.contacts.pc_r1c2,cerisy.packages[7])).toBe(true);expect(enemies(s)[0].location==='r1c2').toBe(roll===1);expect(coverOf(s,enemies(s)[0]).type).toBe('Deep Bunker');}
  for(const roll of [1,10]){const s=flat(fresh());stack(s,roll,10);expect(placePackage(s,s.contacts.pc_r1c2,cerisy.packages[10])).toBe(true);const u=enemies(s)[0];expect(coverOf(s,u).type).toBe('Pillbox');expect(!!s.knowledge.spotted[u.id]).toBe(roll===1);if(roll===1){expect(u.fire).toBeNull();expect(coverOf(s,u).arc).toHaveLength(2);expect(s.events.some(e=>e.type==='CONTACT_FIRE')).toBe(false);}}
 });
 it('retains an inactive Panzerfaust allocation and leader rifle-grenade stocks',()=>{
  const s=flat(fresh());placePackage(s,s.contacts.pc_r1c2,cerisy.packages[6]);expect(enemies(s).filter(u=>u.kind==='SQUAD').every(u=>u.assets.panzerfaust===2)).toBe(true);expect(enemies(s).find(u=>u.kind==='LEADER').assets.rifle_grenade).toBe(2);
 });
});
describe('Cerisy breakdowns and special rules',()=>{
 it('uses both FJ second-step MG branches and conserves current and resupply ammunition',()=>{
  for(const roll of [1,2]){const s=flat(fresh());placePackage(s,s.contacts.pc_r1c2,{units:[{kind:'SQUAD'}],no_fire:true});let u=enemies(s)[0];if(u.vof!=='A'){Object.assign(u,cerisy.enemy_counters.find(c=>c.id==='fj1'),{steps:u.steps,location:u.location,id:u.id,faction:'enemy'});}
   applyHit(s,u,'F');expect(u.steps).toHaveLength(2);u.ammo.MG=5;u.initial_resources.ammo.MG=6;stack(s,roll,2);applyHit(s,u,'F');const teams=enemies(s).filter(v=>v.parent_counter_id===u.counter_id&&v.fire_team_vof==='A');expect(teams).toHaveLength(roll===1?2:1);expect(teams.reduce((n,t)=>n+t.ammo.MG,0)).toBe(5);expect(teams.reduce((n,t)=>n+t.initial_resources.ammo.MG,0)).toBe(6);
  }
 });
 it('breaks the German mortar section into one generic Fire Team and two named mortar Fire Teams',()=>{
  const s=flat(fresh());placePackage(s,s.contacts.pc_r1c2,cerisy.packages[8]);const u=enemies(s).find(v=>v.kind==='MORTAR');applyHit(s,u,'F');expect(u.steps).toHaveLength(2);applyHit(s,u,'F');const teams=enemies(s).filter(v=>v.kind==='MORTAR');expect(teams).toHaveLength(2);expect(teams.every(v=>v.cohesion==='F'&&v.ammo.MTR===6)).toBe(true);
 });
 it('blocks Deep Bunker fire and restricted friendly actions',()=>{
  const s=flat(fresh());s.impulse={id:'test',hq:'co',commands:6,spent:0};const u=s.units.co;u.location='r1c2';s.locations.r1c2.covers.push({id:'deep',type:'Deep Bunker',value:3,capacity:3});u.cover='deep';
  for(const type of ['SPOT','GRENADE','PYRO_RSP'])expect(orderReason(s,{type,unit_id:'co',issuer_id:'co',target_id:'r2c2'})).toContain('Deep Bunker');
  expect(canFire(s,u,'r2c2')).toBe(false);
 });
 it('uses three subsequent spotter cards plus registration, and removes the exhausted observer',()=>{
  const s=flat(fresh());placePackage(s,s.contacts.pc_r1c2,cerisy.packages[1].alternatives[1]);const u=enemies(s)[0];s.turn++;s.support=[];s.fire=[];s.registered_targets={};const burst=Object.values(cards).find(c=>c.burst&&!c.short);s.deck.order=Array(10).fill(burst.id);const before=s.deck.draws;specialActivity(s,u,()=>{});expect(s.deck.draws-before).toBe(3);expect(u.missions_remaining).toBe(1);const next=s.deck.draws;specialActivity(s,u,()=>{});expect(s.deck.draws-next).toBe(4);expect(u.missions_remaining).toBe(0);specialActivity(s,u,()=>{});expect(u.removed).toBe('WITHDRAWN');
 });
});
describe('Hasty Defense and Cerisy HQ tables',()=>{
 const base={same:false,covered:true,outOfAmmo:false,noLOS:false,under:true,validPDF:true,differentDirection:false,heavy:false,stronger:false,trading:true};
 const cases=[[{same:true,covered:false},['NONE','COVER','FALL_BACK','ATTACK']],[{same:true},['NONE','FALL_BACK','ATTACK']],[{outOfAmmo:true},['NONE','FALL_BACK','FALL_BACK']],[{under:false,noLOS:true},['HIDE']],[{under:false},['NONE','ATTACK']],[{covered:false},['NONE','COVER','COVER','FALL_BACK','ATTACK']],[{differentDirection:true},['NONE','ATTACK','SHIFT','SHIFT','FALL_BACK']],[{heavy:true},['NONE','ATTACK','ATTACK']],[{stronger:true},['NONE','ATTACK']],[{},['NONE','NONE','ATTACK','ATTACK','FALL_BACK']]];
 for(const [i,[inputs,expected]]of cases.entries())it(`uses Hasty Defense priority row ${i+1}`,()=>expect(hastyActivityTable({...base,...inputs})).toEqual(expected));
 for(const turn of [2,7])for(let roll=1;roll<=10;roll++)it(`uses enemy event turn ${turn} slot ${roll}`,()=>{const s=fresh();s.turn=turn;const hq=Object.values(cards).find(c=>c.hq);const r=Object.values(cards).find(c=>c.random[8]===roll);s.deck.order=[hq.id,r.id,...s.deck.order];resolveNormandyEvent(s,'enemy');expect(s.hq_events[0].code).toBe(cerisy.rules.enemy_event_tables[turn===2?'early':'late'][roll-1]);});
 it('expires a turn-three counterattack at turn six and restores Hasty Defense',()=>{let s=fresh();s.turn=3;s.units.s11.location='r1c2';const hq=Object.values(cards).find(c=>c.hq),r=Object.values(cards).find(c=>c.random[8]===10);s.deck.order=[hq.id,r.id,...s.deck.order];resolveNormandyEvent(s,'enemy');expect(s.counterattack_ends_after).toBe(5);expect(s.enemy_tactics).toBe('offensive_assault');s.turn=5;s.phase='CLEANUP';s.impulse=null;s=advancePhase(s).state;expect(s.turn).toBe(6);expect(s.enemy_tactics).toBe('hasty_defense');});
});
describe('Cerisy support and replayable choices',()=>{
 for(const agency of ['artillery','mortar','cannon'])for(const role of ['co','artyfo','mtrfo'])it(`uses ${agency} caller ${role} draws and finite inventory`,()=>{const s=fresh();const u=s.units[role];u.experience='Line';const burst=Object.values(cards).find(c=>c.burst&&!c.multi&&!c.short);s.deck.order=Array(10).fill(burst.id);const before=s.deck.draws;supportRequest(s,u,agency,'HE','r1c2');expect(s.deck.draws-before).toBe(cerisy.support_agencies[agency].draws[u.agency_role]);expect(s.support_inventory[agency].HE).toBe(cerisy.support_agencies[agency].inventory.HE-1);s.support_inventory[agency].HE=0;expect(()=>supportRequest(s,u,agency,'HE','r1c2')).toThrow('no HE');});
 it('offers battalion expansion, rejects invalid choices unchanged, and spends no extra resource',()=>{
  const s=fresh(),multi=Object.values(cards).find(c=>c.multi);s.deck.order=Array(4).fill(multi.id);supportRequest(s,s.units.artyfo,'artillery','HE','r1c2');expect(s.pending_support).toBeTruthy();const before=structuredClone(s);expect(advancePhase(s).accepted).toBe(false);expect(resolveSupportChoice(s,{locations:['r1c1','r1c1']}).state).toBe(s);const next=resolveSupportChoice(s,{locations:s.pending_support.adjacent.slice(0,2)}).state;expect(next.support).toHaveLength(3);expect(next.deck).toEqual(before.deck);expect(next.support_inventory).toEqual(before.support_inventory);expect(next.replay.at(-1).op).toBe('resolveSupportChoice');
 });
 it('prepares one attempt-local redeployment with immutable records and exact checkpoint replay',()=>{
  let s=fresh('empty-run');for(let turn=0;turn<10&&s.status==='ACTIVE';turn++)s=endTurn(s).state;
  expect(s.status).toBe('DEFEAT');const original=structuredClone(s.attempt_records[0]);const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,u.location]));s=prepareReattempt(s,{positions}).state;expect(s.enemy_tactics).toBe('hasty_defense');expect(s.attempt_records[0]).toEqual(original);expect(s.support_inventory.cannon).toEqual({HE:3,WP:1});const terminal=abortMission(s).state;expect(resumeCheckpoint(candidate,checkpoint(terminal)).state).toEqual(terminal);expect(()=>prepareReattempt(terminal,{positions})).toThrow('No mission reattempt');
 });
});

 describe('Cerisy authored event slots and fresh storage',()=>{
 for(const turn of [2,7])for(let roll=1;roll<=10;roll++)it(`uses friendly event turn ${turn} slot ${roll}`,()=>{const s=fresh();s.turn=turn;const hq=Object.values(cards).find(c=>c.hq),r=Object.values(cards).find(c=>c.random[8]===roll);s.deck.order=[hq.id,r.id,...s.deck.order];resolveNormandyEvent(s,'friendly',{ammo_type:'MG',location:'r1c1'});expect(s.hq_events[0].code).toBe(cerisy.rules.friendly_event_tables[turn===2?'early':'late'][roll-1]);});
 it('backs up only Cerisy and leaves the previous roster intact on write failure',()=>{const key=cerisy.rules.rosterKey,data=new Map([[CAMPAIGN_KEY,'accepted-M1']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(k===key&&storage.fail)throw new Error('quota');data.set(k,v);}};startStandaloneRoster(storage,createCampaignRoster('first',candidate),key);const original=data.get(key);storage.fail=true;expect(()=>startStandaloneRoster(storage,createCampaignRoster('second',candidate),key)).toThrow('quota');expect(data.get(key)).toBe(original);expect(data.get(key+'-previous')).toBe(original);expect(data.get(CAMPAIGN_KEY)).toBe('accepted-M1');expect(()=>startStandaloneRoster(storage,createCampaignRoster('third',candidate),CAMPAIGN_KEY)).toThrow('supported standalone Normandy slot');});
 });

 it('replays and reloads an actual battalion call before and after the adjacent-card choice',()=>{let s=fresh('cerisy-support-4');for(let n=0;n<4;n++)s=advancePhase(s).state;for(const [type,unit_id]of [['MOVE','artyfo'],['MOVE','co'],['CALL_ARTILLERY_WP','artyfo']]){const r=submitCommand(s,{type,unit_id,issuer_id:'co',target_id:'r1c2'});expect(r.accepted).toBe(true);s=r.state;}expect(s.pending_support).toBeTruthy();expect(resumeCheckpoint(candidate,checkpoint(s)).state).toEqual(s);const stock=structuredClone(s.support_inventory),deck=structuredClone(s.deck),spent=s.impulse.spent;s=resolveSupportChoice(s,{locations:['r1c1','r1c3']}).state;expect(s.support).toHaveLength(3);expect(s.support_inventory).toEqual(stock);expect(s.deck).toEqual(deck);expect(s.impulse.spent).toBe(spent);s=abortMission(s).state;expect(replayMission(candidate,exportReplay(s))).toEqual(s);expect(resolveSupportChoice(s,{locations:[]}).accepted).toBe(false);});

 describe('Cerisy placement boundary branches',()=>{
 for(const roll of [1,3])it(`places LMG nest branch ${roll}`,()=>{const s=flat(fresh());stack(s,roll,10);expect(placePackage(s,s.contacts.pc_r1c2,cerisy.packages[3].alternatives[0])).toBe(true);const u=enemies(s)[0];expect(u.location==='r1c2').toBe(roll===1);expect(u.ammo.MG).toBe(6);});
 it('places the spotted HMG nest with eight rounds',()=>{const s=flat(fresh());expect(placePackage(s,s.contacts.pc_r1c2,cerisy.packages[3].alternatives[1])).toBe(true);const u=enemies(s)[0];expect(s.knowledge.spotted[u.id]).toBeTruthy();expect(u.ammo.MG).toBe(8);});
 for(const number of [4,6])for(const roll of [1,3])it(`places defensive package ${number} at branch ${roll}`,()=>{const s=flat(fresh());stack(s,roll,10);expect(placePackage(s,s.contacts.pc_r1c2,cerisy.packages[number])).toBe(true);expect(enemies(s).filter(u=>u.kind==='SQUAD').every(u=>(roll===1?Math.max(Math.abs(s.locations[u.location].row-1),Math.abs(s.locations[u.location].col-2))===1:Math.max(Math.abs(s.locations[u.location].row-1),Math.abs(s.locations[u.location].col-2))>=1))).toBe(true);});
 it('leaves an unavailable optional leader out instead of substituting another profile',()=>{const s=flat(fresh());for(const c of s.mission_contacts.counters.filter(c=>c.kind==='LEADER'))s.units[c.id]={id:c.id,counter_id:c.id,kind:'LEADER',faction:'enemy',steps:[{}],location:'r0c1',removed:null};expect(placePackage(s,s.contacts.pc_r1c2,cerisy.packages[6])).toBe(true);expect(enemies(s).filter(u=>u.kind==='SQUAD')).toHaveLength(2);expect(enemies(s).filter(u=>u.kind==='LEADER')).toHaveLength(cerisy.enemy_counters.filter(c=>c.kind==='LEADER').length);});
 it('uses the S-rated FJ squad without inventing MG ammunition',()=>{const s=flat(fresh());s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='fj4');expect(placePackage(s,s.contacts.pc_r1c2,{units:[{kind:'SQUAD'}],no_fire:true})).toBe(true);const u=enemies(s)[0];expect(u.vof).toBe('S');applyHit(s,u,'F');applyHit(s,u,'F');expect(enemies(s).every(t=>t.ammo.MG===undefined&&t.fire_team_vof!=='A')).toBe(true);});
 it('leaves Deep Bunker cover before a point-blank attack',()=>{const s=flat(fresh());stack(s,1,5);placePackage(s,s.contacts.pc_r1c2,cerisy.packages[7]);const attack=Object.values(cards).find(c=>c.random[1]===3);s.deck.order=Array(100).fill(attack.id);enemyActivity(s);expect(enemies(s).filter(u=>u.cover===null)).not.toHaveLength(0);});
 });

 describe('Cerisy pillbox facings and equipment limits',()=>{
 const directions=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
 for(let roll=1;roll<=8;roll++)it(`faces an outflanked pillbox in direction ${roll} with no immediate PDF`,()=>{const s=flat(fresh());s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.kind==='HMG').slice(0,1);stack(s,roll,8);expect(placePackage(s,s.contacts.pc_r1c2,{...cerisy.packages[10],point_blank_chance:null,point_blank:true})).toBe(true);const u=enemies(s)[0];expect(coverOf(s,u).arc).toEqual(directions[roll-1]);expect(u.fire).toBe(null);expect(s.knowledge.spotted[u.id]).toBeTruthy();expect(s.events.some(e=>e.type==='CONTACT_FIRE')).toBe(false);});
 it('does not offer artillery battalion choices to mortars or cannon',()=>{for(const agency of ['mortar','cannon']){const s=fresh();s.deck.order=Array(6).fill(Object.values(cards).find(c=>c.multi).id);supportRequest(s,s.units.mtrfo,agency,'WP','r1c2');expect(s.pending_support).toBeFalsy();expect(s.support_inventory[agency].WP).toBe(0);}});
 it('requires the caller’s own fire-direction radio for cross-agency calls',()=>{const s=flat(fresh());s.units.co.location=s.units.mtrfo.location='r1c2';s.impulse={id:'test',hq:'co',commands:6,spent:0};expect(orderReason(s,{type:'CALL_CANNON_WP',unit_id:'mtrfo',issuer_id:'co',target_id:'r1c2'})).toBe(null);s.units.mtrfo.radios=['ARTY'];expect(orderReason(s,{type:'CALL_CANNON_WP',unit_id:'mtrfo',issuer_id:'co',target_id:'r1c2'})).toContain('MTR');});
 });

 it('expends exactly two leader rifle grenades and leaves vehicle-only Panzerfausts inactive',()=>{const s=flat(fresh());placePackage(s,s.contacts.pc_r1c2,{units:[{kind:'SQUAD',cover:'Foxholes'},{kind:'LEADER',cover:'Foxholes',same_as_previous:true}],no_fire:true});const units=enemies(s),leader=units.find(u=>u.kind==='LEADER'),cover=coverOf(s,units[0]);for(const u of units){u.location='r2c2';u.fire='r1c2';u.hold_fire_until_cleanup=false;}s.locations.r2c2.covers=[cover];for(const u of units)u.cover=cover.id;s.units.s11.fire='r2c2';s.knowledge.spotted[leader.id]={id:leader.id};const card=Object.values(cards).find(c=>c.random[0]===2&&c.random[1]===2);s.deck.order=Array(100).fill(card.id);for(let n=0;n<3;n++)enemyActivity(s);expect(leader.assets.rifle_grenade).toBe(0);expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT'&&e.actor===leader.id)).toHaveLength(2);expect(units.find(u=>u.kind==='SQUAD').assets.panzerfaust).toBe(2);});
 it('recovers a named German mortar Fire Team to its weapon side with inherited ammunition',()=>{const s=flat(fresh());placePackage(s,s.contacts.pc_r1c2,cerisy.packages[8]);const u=enemies(s).find(v=>v.kind==='MORTAR');applyHit(s,u,'F');applyHit(s,u,'F');const team=enemies(s).find(v=>v.kind==='MORTAR');team.pinned=false;s.fire=[];for(const v of Object.values(s.units))v.fire=null;rally(s,team,team,true);expect(team.cohesion).toBe('GOOD');expect(team.vof).toBe('G');expect(team.ammo.MTR).toBe(6);});
