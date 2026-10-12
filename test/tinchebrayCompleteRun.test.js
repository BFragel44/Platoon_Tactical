import {it,expect} from 'vitest';
import {createTinchebrayDevelopmentMission,createTinchebrayMissionRoster} from '../src/sim/company/tinchebrayMission.js';
import {advancePhase,eligibleHQs,selectHQ,submitCommand,resolveCombat,prepareReattempt,exportReplay} from '../src/sim/company/engine.js';
import {applyVireOperation,importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {saveTinchebrayRecovery,resumeTinchebrayCheckpoint} from '../src/ui/tinchebrayRecovery.js';
import {saveCampaign,debriefAndSave} from '../src/sim/company/campaignRoster.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
import {cards,live} from '../src/sim/company/core.js';
import {placePackage} from '../src/sim/company/missionContacts.js';
import {synchronizeVireATUnits} from '../src/sim/company/vireUnits.js';
const replay=s=>importVireAdapterReplay(JSON.parse(JSON.stringify(exportReplay(s))));
function drive(s,moving,vehicles=false){
 for(let guard=0;s.status==='ACTIVE'&&guard<1800;guard++){
  if(s.impulse){
   const id=s.impulse.hq,u=s.units[id],destination=id==='hq2'?6:id==='hq3'?5:0;
   if(vehicles&&id==='m10_hq'&&s.turn===1&&!s.vire_runtime.vehicles.m10_hq.activated)s=applyVireOperation(s,{id:`run_${s.vire_runtime.operations.length}`,type:'ACTIVATE_VEHICLE',vehicle:'m10_hq'});
   if(moving&&destination&&!u.exposed&&s.locations[u.location].row<destination){
    const row=s.locations[u.location].row+1,col=vehicles&&id==='hq3'?(row===5?1:[3,4].includes(row)?2:3):u.platoon;
    const r=submitCommand(s,{type:'MOVE',unit_id:id,issuer_id:id,target_id:`r${row}c${col}`});expect(r.accepted,r.reason).toBe(true);s=r.state;
   }
   const r=advancePhase(s);expect(r.accepted,r.reason).not.toBe(false);s=r.state;
  }else if(eligibleHQs(s).length)s=selectHQ(s,eligibleHQs(s)[0]).state;
  else if(s.phase==='AT_COMBAT'&&!s.vire_runtime.phase_complete){
   const rt=s.vire_runtime,hit=rt.pending_hits.find(h=>!h.resolved),eligible=rt.coordinator?.entries.filter(e=>e.group===rt.coordinator.groups[rt.coordinator.group]&&e.activated&&!e.moved_fired)??[];
   let op;
   if(hit)op={type:s.units[hit.unit_id]?.faction==='enemy'?'AUTO_ENEMY_HIT':'RESOLVE_CREW_HIT',hit:hit.id};
   else if(rt.quick)op={type:rt.vehicles[rt.quick.firer].faction==='enemy'?'AUTO_ENEMY_REACTION':'DECLINE_QUICK_SHOT'};
   else if(rt.reaction?.eligible.some(id=>rt.vehicles[id].faction==='enemy'))op={type:'AUTO_ENEMY_REACTION'};
   else if(rt.reaction?.eligible.length)op={type:'DECLINE_REACTION',firer:rt.reaction.eligible[0]};
   else if(rt.move&&!rt.move.complete)op={type:'STEP_VEHICLE_MOVE'};
   else if(eligible.some(e=>e.id==='m10_hq'))op={type:'PREPARE_VEHICLE_MOVE',vehicle:'m10_hq',path:s.locations[rt.vehicles.m10_hq.location].staging?['r1c2','r2c3','r3c4']:[rt.vehicles.m10_hq.location==='r3c4'?'r3c3':'r3c4']};
   else if(eligible.some(e=>e.faction==='enemy'))op={type:'AUTO_ENEMY_AT_ACTION'};
   else op={type:rt.end_vof?.length?'STEP_END_VOF':'FINISH_AT_PHASE'};
   s=applyVireOperation(s,{id:`run_${rt.operations.length}`,...op});
  }else if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='awaiting_resolution'&&s.pending_combat?.[s.segment_progress.index]?.target_visible)s=resolveCombat(s,s.pending_combat[s.segment_progress.index].id).state;
  else{const r=advancePhase(s);expect(r.accepted,r.reason).not.toBe(false);s=r.state;}
 }
 expect(s.status).not.toBe('ACTIVE');return s;
}
// Three full attempts plus exact recovery/replay can exceed the shared unit
// timeout under concurrent Windows load; keep the larger bound local to this run.
it('completes two failed ten-turn attempts then success with exact replay, reload and one debrief',()=>{
 let s=createTinchebrayDevelopmentMission('tinchebray-three-attempts',{}, {},{mission_instance_id:'three-attempts'});
 for(const l of Object.values(s.locations)){l.borders=l.staging?null:{N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'};l.elevation=0;l.known=true;l.trafficability='Unmarked';}
 // Controlled phase/replay fixture. Combat-bearing and natural-contact runs remain separate gates.
 for(const pc of Object.values(s.contacts))pc.resolved=true;
 const card=Object.values(cards).find(c=>c.id!==51&&!c.hq&&c.word!=='Contact'&&Number(c.initiative)>=2);s.deck.order=Array(2000).fill(card.id);
 delete s.vire_runtime.initial_state;s.vire_runtime.initial_state=structuredClone(s);
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(let attempt=1;attempt<=3;attempt++){
  s=drive(s,attempt===3);expect(s.turn).toBe(10);expect(s.status).toBe(attempt===3?'SUCCESS':'DEFEAT');expect(s.attempt_number).toBe(attempt);
  expect(replay(s)).toEqual(s);s=resumeTinchebrayCheckpoint(saveTinchebrayRecovery(storage,s).latest).state;
  if(attempt<3){
   const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&live(u)).map(u=>[u.id,u.location]));
   const vehicle_positions=Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&v.profile==='M10_TD76').map(v=>[v.id,v.location]));
   s=prepareReattempt(s,{positions,vehicle_positions}).state;expect(replay(s)).toEqual(s);
  }
 }
 expect(s.attempt_records).toHaveLength(3);
 saveCampaign(storage,createTinchebrayMissionRoster(),tinchebray.rules.rosterKey);
 const record=debriefAndSave(storage,s,tinchebray.rules.rosterKey);expect(record.revision).toBe(1);
 expect(()=>debriefAndSave(storage,replay(s),tinchebray.rules.rosterKey)).toThrow(/already applied/);
},240000);
function combatStart(){
 const s=createTinchebrayDevelopmentMission('tinchebray-combat-run',{objectives:{primary:'r6c2',secondary:'r5c1',attack:'r4c1'}}, {},{mission_instance_id:'tinchebray-combat-run'});
 for(const l of Object.values(s.locations))Object.assign(l,{borders:l.staging?null:{N:'white',S:'white',E:'white',W:'white',NE:'white',NW:'white',SE:'white',SW:'white'},elevation:0,smoke:false,trafficability:'Unmarked',known:true,terrain:'open',building:false});
 s.units.s11.location='r1c2';expect(placePackage(s,s.contacts.pc_r1c2,tinchebray.packages[8].alternatives[1])).toBe(true);s.units.s11.location='r0c1';
 s.units.hq1.location='r3c1';const gun=Object.values(s.units).find(u=>u.kind==='PAK40');gun.location='r6c4';gun.cover=null;gun.fire=null;
 synchronizeVireATUnits(s);for(const pc of Object.values(s.contacts))pc.resolved=true;
 s.deck.order=Array(2000).fill(3);delete s.vire_runtime.initial_state;s.vire_runtime.initial_state=structuredClone(s);return s;
}
it('completes a combat-bearing successful M7 run with M10 movement, AT exchanges and exact replay',()=>{
 const s=drive(combatStart(),true,true);expect(s.status).toBe('SUCCESS');expect(s.turn).toBe(10);
 expect(s.events.some(e=>e.type==='UNIT_MOVED'&&e.actor==='m10_hq')).toBe(true);
 expect(s.events.some(e=>e.type==='AT_SHOT_RESOLVED')).toBe(true);expect(replay(s)).toEqual(s);
});
it('replays combat-bearing failure, failure and third-attempt success with recovery at each outcome',()=>{
 let s=combatStart();const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(let attempt=1;attempt<=3;attempt++){
  s=drive(s,attempt===3,true);expect(s.status).toBe(attempt===3?'SUCCESS':'DEFEAT');expect(s.attempt_number).toBe(attempt);expect(replay(s)).toEqual(s);
  s=resumeTinchebrayCheckpoint(saveTinchebrayRecovery(storage,s).latest).state;
  if(attempt<3){const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&live(u)).map(u=>[u.id,u.location]));const vehicle_positions=Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&v.profile==='M10_TD76').map(v=>[v.id,v.location]));s=prepareReattempt(s,{positions,vehicle_positions}).state;}
 }
 expect(s.events.some(e=>e.type==='AT_SHOT_RESOLVED')).toBe(true);expect(s.attempt_records).toHaveLength(3);
},240000);
