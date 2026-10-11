import {describe,it,expect} from 'vitest';
import {vire} from '../src/scenarios/vire.js';
import {createVireDevelopmentMission,createVireRoster} from '../src/sim/company/vireMission.js';
import {advancePhase,resolveCombat,prepareReattempt,exportReplay,abortMission,eligibleHQs,selectHQ,submitCommand} from '../src/sim/company/engine.js';
import {cards,live} from '../src/sim/company/core.js';
import {placePackage,packageAvailable} from '../src/sim/company/missionContacts.js';
import {eligibleContacts} from '../src/sim/company/combat.js';
import {applyVireOperation,importVireAdapterReplay,getVirePublicState} from '../src/sim/company/vireIntegration.js';
import {synchronizeVireATUnits} from '../src/sim/company/vireUnits.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {vireVehicleDeployments} from '../src/sim/company/vireDeployment.js';
import {embarkInfantry} from '../src/sim/company/vehicleTransport.js';
import {secureStatus} from '../src/sim/company/missionFeatures.js';
import {readVireRecovery,saveVireRecovery,resumeVireCheckpoint,VIRE_SAVE_KEY} from '../src/ui/vireRecovery.js';
import {saveCampaign,debriefAndSave,readCampaign} from '../src/sim/company/campaignRoster.js';
import {vireControls} from '../src/ui/vireControls.js';
const fresh=()=>createVireDevelopmentMission('vire-live',{}, {}, {mission_instance_id:'vire-run-test'});
function flat(){const s=fresh();for(const l of Object.values(s.locations)){l.terrain='open';l.building=false;l.borders={N:'light',S:'light',E:'light',W:'light'};l.elevation=0;l.known=true;l.covers=[];l.trafficability='Unmarked';}s.units.s11.location='r1c2';return s;}
function stack(s,predicate){const c=Object.values(cards).find(c=>c.id!==51&&predicate(c));expect(c).toBeTruthy();s.deck.order=Array(200).fill(c.id);}
const seal=s=>{delete s.vire_runtime.initial_state;s.vire_runtime.initial_state=structuredClone(s);return s;};
const replay=s=>importVireAdapterReplay(JSON.parse(JSON.stringify(exportReplay(s))));
const positions=s=>Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&(live(u)||u.removed==='EMBARKED'&&s.vire_runtime.vehicles[u.embarked_on]?.status==='ACTIVE')).map(u=>[u.id,u.id==='s11'?'r1c2':u.location]));
const vehiclePositions=s=>Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&['M4_SHERMAN75','M5_LIGHT37'].includes(v.profile)).map(v=>[v.id,'r1c2']));
const store=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
describe('live Vire mission integration',()=>{
 it('deploys named crew from a fresh detached roster and starts exact vehicle-aware attempt records',()=>{
  const roster=createVireRoster(),before=structuredClone(roster),s=createVireDevelopmentMission('vire-live',{}, {}, {mission_instance_id:'vire-run-test',roster});
  expect(s.scenario_id).toBe('normandy_6');expect(s.enemy_tactics).toBe('delay_defense');expect(s.vire_runtime.normal_phase_enabled).toBe(true);
  expect(s.vire_runtime.vehicles.sherman_hq.crew[0].personnel).toHaveLength(2);expect(s.attempt_records[0].starting_state.vire_runtime.vehicles.sherman_hq).toBeTruthy();
  expect(s.attempt_records[0].starting_state.vire_runtime.initial_state).toBeUndefined();expect(replay(s)).toEqual(s);expect(roster).toEqual(before);
  expect(()=>importVireAdapterReplay({...exportReplay(s),version:11})).toThrow(/Incompatible/);
 });
 const branches=Object.entries(vire.packages).flatMap(([n,p])=>p.alternatives?p.alternatives.map((a,i)=>[Number(n),i,a]):[[Number(n),0,p]]);
 it.each(branches)('places package %i branch %i with live profile/AT synchronization',(number,branch,p)=>{
  const s=flat(),pc=s.contacts.pc_r1c2,copy=structuredClone(s);expect(packageAvailable(s,pc,p)).toBe(true);
  expect(placePackage(s,pc,p)).toBe(true);expect(placePackage(copy,copy.contacts.pc_r1c2,p)).toBe(true);expect(copy).toEqual(s);
  for(const u of Object.values(s.units).filter(u=>u.faction==='enemy'&&['PAK40','FLAK88','PANZERSCHRECK','INFANTRY_GUN75'].includes(u.kind))){const v=Object.values(s.vire_runtime.vehicles).find(v=>v.source_unit===u.id&&v.source_field==='ammo');expect(v.ammo).toBe(u.ammo[v.source_key]);expect(v.location).toBe(u.location);}
 });
 it('keeps tank-only contacts eligible and places AT packages against their vehicle target',()=>{
  const s=flat();s.units.s11.location='r0c1';s.vire_runtime.vehicles.sherman_hq.location='r1c2';expect(eligibleContacts(s).some(c=>c.id==='pc_r1c2')).toBe(true);
  expect(packageAvailable(s,s.contacts.pc_r1c2,vire.packages[8].alternatives[1])).toBe(true);expect(placePackage(s,s.contacts.pc_r1c2,vire.packages[8].alternatives[1])).toBe(true);
 });
 it('shares AT ammunition, follows carrier movement/removal, and protects hidden source identities',()=>{
  let s=flat();placePackage(s,s.contacts.pc_r1c2,vire.packages[8].alternatives[1]);const u=Object.values(s.units).find(u=>u.kind==='PAK40');u.location='r2c2';u.cover=null;s.vire_runtime.vehicles.sherman_hq.location='r1c2';s.phase='AT_COMBAT';s.impulse=null;synchronizeVireATUnits(s);stack(s,c=>Number(c.at)===9);seal(s);
  s=applyVireOperation(s,{id:'enemy-shot',type:'AUTO_ENEMY_AT_ACTION'});expect(s.units[u.id].ammo.GUN).toBe(3);expect(Object.values(s.vire_runtime.vehicles).find(v=>v.source_unit===u.id).ammo).toBe(3);expect(replay(s)).toEqual(s);
  expect(getVirePublicState(s).vehicles.some(v=>v.id.includes(u.id))).toBe(false);
  s.units[u.id].location='r3c2';synchronizeVireATUnits(s);expect(Object.values(s.vire_runtime.vehicles).find(v=>v.source_unit===u.id).location).toBe('r3c2');s.units[u.id].removed='DISPLACED';synchronizeVireATUnits(s);expect(Object.values(s.vire_runtime.vehicles).find(v=>v.source_unit===u.id).status).toBe('UNAVAILABLE');
 });
 it('persists the M5 pending choice without redrawing or duplicating its finite platoon',()=>{
  let s=flat();s.turn=2;s.phase='FRIENDLY_EVENTS';stack(s,c=>c.hq&&c.random[8]===4);seal(s);
  s=advancePhase(s).state;expect(s.pending_event.code).toBe('TANK_SUPPORT');expect(vireControls(s)).toContain('Confirm Tank Support');expect(replay(s)).toEqual(s);
  const draws=s.deck.draws,entries=Object.fromEntries(vireVehicleDeployments('event').map(v=>[v.id,v.location]));
  expect(()=>advancePhase(s,{eventChoice:{vehicle_positions:{m5_hq:'r2c1'}}})).toThrow(/five/);
  s=advancePhase(s,{eventChoice:{vehicle_positions:entries}}).state;expect(s.deck.draws).toBe(draws);expect(s.vire_runtime.tank_support_used).toBe(true);expect(Object.keys(s.vire_runtime.vehicles).filter(id=>id.startsWith('m5_'))).toHaveLength(5);expect(replay(s)).toEqual(s);
  s.phase='FRIENDLY_EVENTS';s.turn=3;stack(s,c=>c.hq&&c.random[8]===4);resolveNormandyEvent(s,'friendly');expect(s.hq_events.at(-1).ignored).toBe(true);expect(Object.keys(s.vire_runtime.vehicles).filter(id=>id.startsWith('m5_'))).toHaveLength(5);
 });
 it('places only PC A on qualifying US occupied cards and includes vehicle-only positions',()=>{
  const s=flat();for(const c of Object.values(s.contacts))c.resolved=true;s.contacts.pc_r3c2.resolved=false;s.units.s11.location='r1c2';s.vire_runtime.vehicles.sherman_hq.location='r5c1';s.vire_runtime.vehicles.sherman_1.location='r2c2';s.turn=3;stack(s,c=>c.hq&&c.random[8]===9);resolveNormandyEvent(s,'enemy');
  expect(s.hq_events.at(-1).placements.sort()).toEqual(['r2c2','r5c1']);expect(Object.values(s.contacts).filter(c=>c.counterattack).every(c=>c.type==='A')).toBe(true);expect(s.counterattack_ends_after).toBe(5);
 });
 it('rejects illegal or overstacked tank entry atomically, counting tanks already on the card',()=>{
  let s=flat();s.turn=2;s.phase='FRIENDLY_EVENTS';stack(s,c=>c.hq&&c.random[8]===4);seal(s);s=advancePhase(s).state;
  const entries=Object.fromEntries(vireVehicleDeployments('event').map(v=>[v.id,'r1c1'])),before=structuredClone(s);
  expect(()=>advancePhase(s,{eventChoice:{vehicle_positions:entries}})).toThrow(/four-vehicle/);expect(s).toEqual(before);
  entries.m5_4='r1c2';entries.m5_hq='r2c1';expect(()=>advancePhase(s,{eventChoice:{vehicle_positions:entries}})).toThrow(/Row 1/);expect(s).toEqual(before);
  entries.m5_hq='r1c1';s.vire_runtime.vehicles.sherman_hq.location='r1c1';const occupied=structuredClone(s);
  expect(()=>advancePhase(s,{eventChoice:{vehicle_positions:entries}})).toThrow(/four-vehicle/);expect(s).toEqual(occupied);
 });
});
describe('Vire recovery, debrief and reattempt',()=>{
 it('saves exact checkpoints in an isolated slot, preserves presentation and refuses stale formats/write failures',()=>{
  const storage=store(),s=fresh();storage.setItem('platoon-company-recovery','accepted');const bundle=saveVireRecovery(storage,s,{commandLinks:true});expect(resumeVireCheckpoint(bundle.latest)).toEqual({state:s,presentation:{commandLinks:true}});expect(storage.getItem('platoon-company-recovery')).toBe('accepted');
  const previous=storage.getItem(VIRE_SAVE_KEY);const failing={...storage,setItem:()=>{throw new Error('quota');}};expect(()=>saveVireRecovery(failing,s)).toThrow(/quota/);expect(storage.getItem(VIRE_SAVE_KEY)).toBe(previous);
  storage.setItem(VIRE_SAVE_KEY,JSON.stringify({...bundle,schema:99}));expect(readVireRecovery(storage).error).toMatch(/Unsupported/);expect(()=>saveVireRecovery(storage,s)).toThrow();expect(storage.getItem(VIRE_SAVE_KEY)).toContain('99');
 });
 it('reattempts with surviving tanks/riders and keeps wrecks, retreat losses, spotting, terrain and unique rewards',()=>{
  let s=flat();for(const c of Object.values(s.contacts))c.resolved=true;s.contacts.pc_r5c4.resolved=false;s.status='DEFEAT';s.turn=10;s.enemy_tactics='offensive_assault';s.counterattack_ends_after=12;
  s.locations.r1c2.mines=true;s.locations.r1c2.covers=[{id:'old-cover',type:'Foxholes',value:1,known:true,discovered:true}];s.markers=[{id:'wreck-old',type:'BURNING_WRECK',location:'r3c1'}];s.knowledge.spotted.old_enemy={id:'old_enemy'};s.achievements=[{key:'clear_r1c2',points:1}];
  s.vire_runtime.vehicles.sherman_1.status='RETREATED';s.vire_runtime.vehicles.sherman_2.status='KNOCKED_OUT';s.vire_runtime.vehicles.sherman_hq.location='r1c2';s.vire_runtime.vehicles.sherman_hq.ammo=1;s.vire_runtime.vehicles.sherman_hq.saved=2;s.vire_runtime.vehicles.sherman_hq.pinned=true;
  s.units.s11.pinned=false;s.vire_runtime.vehicles.sherman_hq=embarkInfantry(s,s.vire_runtime.vehicles.sherman_hq,['s11']);s.vire_runtime.vehicles.sherman_hq.pinned=true;seal(s);const first=structuredClone(s.attempt_records[0]),terrain=s.locations.r1c2.terrain_card;
  const choices={positions:positions(s),vehicle_positions:vehiclePositions(s)};s=prepareReattempt(s,choices).state;
  expect(s.attempt_number).toBe(2);expect(s.enemy_tactics).toBe('delay_defense');expect(s.vire_runtime.vehicles.sherman_hq).toMatchObject({ammo:5,pinned:false,saved:0,location:'r1c2'});expect(s.units.s11.removed).toBeNull();expect(s.vire_runtime.vehicles.sherman_hq.passengers).toHaveLength(0);
  expect(s.vire_runtime.vehicles.sherman_1.status).toBe('RETREATED');expect(s.vire_runtime.vehicles.sherman_2.status).toBe('KNOCKED_OUT');expect(s.locations.r3c1.covers.some(c=>c.id==='wreck-old'&&c.type==='Wreck')).toBe(true);
  expect(s.locations.r1c2.mines).toBe(true);expect(s.locations.r1c2.terrain_card).toBe(terrain);expect(s.contacts.pc_r5c4.resolved).toBe(false);expect(s.knowledge.spotted.old_enemy).toBeTruthy();expect(s.achievements).toHaveLength(1);expect(s.attempt_records[0]).toEqual(first);expect(s.attempt_records[1].starting_state.vire_runtime.vehicles.sherman_hq.ammo).toBe(5);expect(replay(s)).toEqual(s);expect(()=>prepareReattempt(s,choices)).toThrow();
 });
 it('requires explicit legal surviving-vehicle placements and never restores eliminated crews',()=>{
  const s=flat();for(const c of Object.values(s.contacts))c.resolved=true;s.status='DEFEAT';
  expect(()=>prepareReattempt(s,{positions:positions(s)})).toThrow(/vehicles/);const before=structuredClone(s);expect(()=>prepareReattempt(s,{positions:positions(s),vehicle_positions:{...vehiclePositions(s),sherman_hq:'r5c4'}})).toThrow(/secured/);expect(s).toEqual(before);
 });
 it('atomically applies a terminal debrief once, with actual crew identities and unresolved withdrawal disposition',()=>{
  const storage=store(),roster=createVireRoster();saveCampaign(storage,roster,vire.rules.rosterKey);let s=fresh();const crew=s.vire_runtime.vehicles.sherman_hq.crew[0].id;s.vire_runtime.vehicles.sherman_hq.status='RETREATED';s=abortMission(s).state;
  const r=debriefAndSave(storage,s,vire.rules.rosterKey);expect(r.revision).toBe(1);expect(r.steps[crew].disposition).toBe('WITHDRAWN_UNRESOLVED');expect(r.applied_missions[s.mission_instance_id]).toBeTruthy();expect(()=>debriefAndSave(storage,s,vire.rules.rosterKey)).toThrow(/already applied/);expect(readCampaign(storage,vire.rules.rosterKey).record).toEqual(r);
  const stale=fresh();stale.status='VICTORY';stale.mission_instance_id='stale';expect(()=>debriefAndSave(storage,stale,vire.rules.rosterKey)).toThrow(/revision/);
 });
 it('retains finite M5 stock across reattempt and rejects overstacked vehicle redeployment',()=>{
  let s=flat();s.turn=2;s.phase='FRIENDLY_EVENTS';stack(s,c=>c.hq&&c.random[8]===4);seal(s);s=advancePhase(s).state;
  const entries=Object.fromEntries(vireVehicleDeployments('event').map(v=>[v.id,v.location]));s=advancePhase(s,{eventChoice:{vehicle_positions:entries}}).state;
  s.status='DEFEAT';for(const c of Object.values(s.contacts))c.resolved=true;s.vire_runtime.operations=[];s.vire_runtime.applied=[];seal(s);
  const vehicles=Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&['M4_SHERMAN75','M5_LIGHT37'].includes(v.profile)).map(v=>[v.id,'r1c2']));const before=structuredClone(s);
  expect(()=>prepareReattempt(s,{positions:positions(s),vehicle_positions:vehicles})).toThrow(/four-vehicle/);expect(s).toEqual(before);
  for(const v of Object.values(s.vire_runtime.vehicles).filter(v=>Object.hasOwn(vehicles,v.id)))vehicles[v.id]=v.location;
  s=prepareReattempt(s,{positions:positions(s),vehicle_positions:vehicles}).state;expect(s.vire_runtime.tank_support_used).toBe(true);expect(replay(s)).toEqual(s);
  s.turn=2;s.phase='FRIENDLY_EVENTS';resolveNormandyEvent(s,'friendly');expect(s.hq_events.at(-1).ignored).toBe(true);expect(s.pending_event).toBeNull();
 });
});

function drive(s,moving,vehicles=false){
 for(let guard=0;s.status==='ACTIVE'&&guard<1600;guard++){
  if(s.impulse){
   const id=s.impulse.hq,u=s.units[id];
   if(vehicles&&id==='sherman_hq'&&s.turn===1&&!s.vire_runtime.vehicles.sherman_hq.activated){s=applyVireOperation(s,{id:`run_${s.vire_runtime.operations.length}`,type:'ACTIVATE_VEHICLE',vehicle:'sherman_hq'});}
   if(moving&&(vehicles?['hq2','hq3']:['co','hq1','hq2','hq3']).includes(id)&&!u.exposed&&s.locations[u.location].row<5){
    const row=s.locations[u.location].row+1,col=vehicles&&id==='hq3'?(row===5?1:[3,4].includes(row)?2:3):id==='co'?4:u.platoon;
    const r=submitCommand(s,{type:'MOVE',unit_id:id,issuer_id:id,target_id:`r${row}c${col}`});expect(r.accepted,r.reason).toBe(true);s=r.state;
   }
   const r=advancePhase(s);expect(r.accepted,r.reason).not.toBe(false);s=r.state;
  }else if(eligibleHQs(s).length){s=selectHQ(s,eligibleHQs(s)[0]).state;}
  else if(s.phase==='AT_COMBAT'&&!s.vire_runtime.phase_complete){
   const rt=s.vire_runtime,enemyReaction=rt.reaction?.eligible.find(id=>rt.vehicles[id].faction==='enemy'),hit=rt.pending_hits.find(h=>!h.resolved),eligible=rt.coordinator?.entries.filter(e=>e.group===rt.coordinator.groups[rt.coordinator.group]&&e.activated&&!e.moved_fired)??[];
   let op;
   if(hit)op={type:s.units[hit.unit_id]?.faction==='enemy'?'AUTO_ENEMY_HIT':'RESOLVE_CREW_HIT',hit:hit.id};
   else if(rt.quick)op={type:rt.vehicles[rt.quick.firer].faction==='enemy'?'AUTO_ENEMY_REACTION':'DECLINE_QUICK_SHOT'};
   else if(enemyReaction)op={type:'AUTO_ENEMY_REACTION'};
   else if(rt.reaction?.eligible.length)op={type:'DECLINE_REACTION',firer:rt.reaction.eligible[0]};
   else if(rt.move&&!rt.move.complete)op={type:'STEP_VEHICLE_MOVE'};
   else if(eligible.some(e=>e.id==='sherman_hq'))op={type:'PREPARE_VEHICLE_MOVE',vehicle:'sherman_hq',path:[s.locations[rt.vehicles.sherman_hq.location].staging?'r1c1':'r2c2']};
   else if(eligible.some(e=>e.faction==='enemy'))op={type:'AUTO_ENEMY_AT_ACTION'};
   else op={type:rt.end_vof?.length?'STEP_END_VOF':'FINISH_AT_PHASE'};
   s=applyVireOperation(s,{id:`run_${s.vire_runtime.operations.length}`,...op});
  }else if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='awaiting_resolution'&&s.pending_combat?.[s.segment_progress.index]?.target_visible){
   const r=resolveCombat(s,s.pending_combat[s.segment_progress.index].id);expect(r.accepted,r.reason).toBe(true);s=r.state;
  }else{const r=advancePhase(s);expect(r.accepted,r.reason).not.toBe(false);s=r.state;}
 }
 expect(s.status).not.toBe('ACTIVE');return s;
}
it('completes a ten-turn failed attempt, exact recovery, then a successful reattempt through normal phases',()=>{
 let s=createVireDevelopmentMission('vire-full-reattempt',{positions:{co:'r0c4'}},{},{mission_instance_id:'complete-vire-run'});
 for(const l of Object.values(s.locations)){l.borders=l.staging?null:{N:'light',S:'light',E:'light',W:'light'};l.elevation=0;l.smoke=false;}
 stack(s,c=>!c.hq&&c.word!=='Contact'&&Number(c.initiative)>=2);seal(s);s=drive(s,false);expect(s.status).toBe('DEFEAT');expect(s.turn).toBe(10);expect(replay(s)).toEqual(s);
 const storage=store();const saved=saveVireRecovery(storage,s);s=resumeVireCheckpoint(saved.latest).state;
 const choices={positions:Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&live(u)).map(u=>[u.id,u.location])),vehicle_positions:Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.profile==='M4_SHERMAN75').map(v=>[v.id,v.location]))};
 s=prepareReattempt(s,choices).state;const records=structuredClone(s.attempt_records);s=drive(s,true);expect(s.status).toBe('SUCCESS');expect(s.attempt_number).toBe(2);expect(s.turn).toBe(10);expect(s.events.some(e=>e.type==='OBJECTIVE_CHECK'&&e.secured&&e.turn===5)).toBe(true);expect(s.attempt_records).toEqual(records);expect(replay(s)).toEqual(s);
 const roster=createVireRoster();saveCampaign(storage,roster,vire.rules.rosterKey);debriefAndSave(storage,s,vire.rules.rosterKey);expect(()=>debriefAndSave(storage,replay(s),vire.rules.rosterKey)).toThrow(/already applied/);
});

it('completes a successful Vire run with live tank movement, enemy AT exchanges and exact replay',()=>{
 let s=createVireDevelopmentMission('vire-combat-run',{positions:{co:'r0c4'},objectives:{primary:'r5c2',secondary:'r5c1'}},{},{mission_instance_id:'vire-combat-run'});
 for(const l of Object.values(s.locations)){l.borders=l.staging?null:{N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'};l.elevation=0;l.smoke=false;l.trafficability='Unmarked';l.known=true;l.terrain='open';l.building=false;}
 s.units.s11.location='r1c2';expect(placePackage(s,s.contacts.pc_r1c2,vire.packages[8].alternatives[1])).toBe(true);s.units.s11.location='r0c1';
 s.units.hq1.location='r1c1';const gun=Object.values(s.units).find(u=>u.kind==='PAK40');gun.location='r4c4';gun.cover=null;gun.fire=null;for(const l of Object.values(s.locations)){l.borders=l.staging?null:{N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'};l.known=true;l.elevation=0;}synchronizeVireATUnits(s);for(const pc of Object.values(s.contacts))pc.resolved=true;
 s.deck.order=Array(1000).fill(3);seal(s);s=drive(s,true,true);
 expect(s.status).toBe('SUCCESS');expect(s.turn).toBe(10);expect(s.events.some(e=>e.type==='UNIT_MOVED'&&e.actor==='sherman_hq')).toBe(true);
 expect(s.events.some(e=>e.type==='AT_SHOT_RESOLVED')).toBe(true);expect(replay(s)).toEqual(s);
 const storage=store(),saved=saveVireRecovery(storage,s);expect(resumeVireCheckpoint(saved.latest).state).toEqual(s);
});

it('replays a combat-bearing failure, surviving tank redeployment and second-attempt success',()=>{
 let s=createVireDevelopmentMission('vire-combat-reattempt',{positions:{co:'r0c4'},objectives:{primary:'r5c2',secondary:'r5c1'}},{},{mission_instance_id:'vire-combat-reattempt'});
 for(const l of Object.values(s.locations)){l.borders=l.staging?null:{N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'};l.elevation=0;l.smoke=false;l.trafficability='Unmarked';l.known=true;l.terrain='open';l.building=false;}
 s.units.s11.location='r1c2';expect(placePackage(s,s.contacts.pc_r1c2,vire.packages[8].alternatives[1])).toBe(true);s.units.s11.location='r0c1';
 s.units.hq1.location='r1c1';const gun=Object.values(s.units).find(u=>u.kind==='PAK40');gun.location='r4c4';gun.cover=null;gun.fire=null;for(const l of Object.values(s.locations)){l.borders=l.staging?null:{N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'};l.known=true;l.elevation=0;}synchronizeVireATUnits(s);for(const pc of Object.values(s.contacts))pc.resolved=true;s.deck.order=Array(2000).fill(3);seal(s);
 s=drive(s,false,true);expect(s.status).toBe('DEFEAT');expect(s.events.some(e=>e.type==='AT_SHOT_RESOLVED')).toBe(true);expect(replay(s)).toEqual(s);
 const storage=store();s=resumeVireCheckpoint(saveVireRecovery(storage,s).latest).state;
 const choices={positions:Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&live(u)).map(u=>[u.id,u.location])),vehicle_positions:Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&v.profile==='M4_SHERMAN75').map(v=>[v.id,v.location]))};
 s=prepareReattempt(s,choices).state;s=drive(s,true,true);expect(s.status).toBe('SUCCESS');expect(s.attempt_number).toBe(2);expect(s.events.filter(e=>e.type==='UNIT_MOVED'&&e.actor==='sherman_hq')).toHaveLength(2);expect(replay(s)).toEqual(s);
 expect(resumeVireCheckpoint(saveVireRecovery(storage,s).latest).state).toEqual(s);
});

for(const side of ['friendly','enemy'])for(const period of ['early','late'])it.each(vire.rules[`${side}_event_tables`][period].map((code,i)=>[i+1,code]))(`executes Vire ${side} ${period} HQ slot %i (%s)`,(slot,code)=>{
 const s=flat();s.turn=period==='early'?2:7;s.phase=side==='friendly'?'FRIENDLY_EVENTS':'ENEMY_EVENTS';const first=Object.values(cards).find(c=>c.hq&&c.id!==51),number=Object.values(cards).find(c=>c.random[8]===slot&&c.id!==51);s.deck.order=[first.id,number.id,...Array(100).fill(number.id)];resolveNormandyEvent(s,side);expect(s.hq_events.at(-1).code).toBe(code);
});
