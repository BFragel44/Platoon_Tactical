import {hill192DeploymentDefinition} from './hill192Setup.js';
import {finishPatrolEvents} from './patrolEvents.js';
import {createPatrolProgress,patrolMoonLight,patrolOutcome,patrolParticipant} from './patrols.js';
import {visibilityCommandLimits,patrolInitiative} from './visibility.js';
import {commandNetwork} from './commandNetwork.js';
import {achievementTally} from './achievementTally.js';
import {recordAttemptStart} from './attemptRecords.js';
import {SKILLS} from './skills.js';
import {rosterSnapshot,createCampaignRoster} from './campaignRoster.js';
import {prepareReattempt,preparePatrol} from './reattempt.js';
import {damagePhoneLines} from './phoneNetwork.js';
import {deliverRunners} from './runners.js';
export {prepareReattempt,preparePatrol};
import {companyCommander,isCompanyCommander,higherCommander} from './commandRoles.js';
import {contactQueue} from './missionContacts.js';
import {materializeScenario} from './missionSetup.js';
import {revealTerrain,terrainProjection} from './missionKnowledge.js';
import {higherEvent,scoreMission,secureStatus,applySupportChoice} from './missionFeatures.js';
import { createRng } from '../rng.js';
import { values, live, good, friendly, expMod, visible, emit, newDeck, draw, result, randomNumber } from './core.js';
import { refresh, hasFire, combatModifier, observeRecord, occupants, incoming, temporaryMortarFire, seesCard, explainUnitCard, communication, communicationReason, spottingLocations } from './battlefield.js';
import { submitCommand as order, commandOptions } from './actions.js';
import { resolveContacts, eligibleContacts, prepareCombat, resolvePreparedCombat, enemyActivity, capture, retreat } from './combat.js';
export const PHASES = [
  ['FRIENDLY_EVENTS','3.1 · Friendly higher HQ events','Skipped: assault courses have no random HQ events.'],
  ['DEFENSIVE_EVENTS','3.2.1 · Defensive enemy HQ events','Skipped: this is an offensive mission.'],
  ['DEFENSIVE_ACTIVITY','3.2.2 · Defensive enemy activity','Skipped: this is an offensive mission.'],
  ['BN_ACTIVATION','3.3.1a · Battalion activation','BN activates Company HQ if its command side and BN radio are available.'],
  ['CO_ACTIVATION','3.3.1b · Company activation impulse','Spend Company HQ commands, activate subordinates, or save unused commands.'],
  ['SUBORDINATE_ACTIVATION','3.3.1c · Platoon / staff activation impulses','Choose activated HQs in any order. Complete one impulse before choosing another.'],
  ['CO_INITIATIVE','3.3.2a · Company initiative','Company HQ receives initiative only if it was not activated.'],
  ['PLATOON_INITIATIVE','3.3.2b · Platoon initiative impulses','Choose each unactivated platoon HQ in any order.'],
  ['STAFF_INITIATIVE','3.3.2c · Staff initiative','Unactivated staff receive one unmodified command.'],
  ['GENERAL_INITIATIVE','3.3.2d · General initiative','Spend the card’s unmodified initiative on any units. These commands cannot be saved.'],
  ['ENEMY_EVENTS','3.4.1 · Enemy higher HQ events','Skipped: assault courses have no random HQ events.'],
  ['ENEMY_ACTIVITY','3.4.2 · Enemy activity checks','Resolve deliberate-defence priorities, in random card order, with degraded units first.'],
  ['CAPTURE','3.5.1 · Mutual capture','Capture isolated paralyzed/litter teams and assign guard steps.'],
  ['RETREAT','3.5.2 · Mutual retreat','Unpinned, unexposed paralyzed teams and litter teams carrying casualties retreat from fire.'],
  ['AT_COMBAT','3.6 · AT combat / vehicle movement','Skipped: no vehicle targets. Bazookas use ranged grenade attacks against infantry.'],
  ['FIRE_MISSIONS','3.7.1 · Fire mission update','Remove previous incoming missions; activate pending missions.'],
  ['CONTACTS','3.7.2 · Potential contact evaluation','Resolve occupied contact cards and update activity after each encounter.'],
  ['PINNED_RECOVERY','3.7.3 · Pinned recovery','Automatically unpin formations free of effective incoming fire.'],
  ['COMBAT_EFFECTS','3.7.4 · Mutual combat effects','Resolve MISS / PIN / HIT from a common fire snapshot; update fire only at cleanup.'],
  ['CLEANUP','3.8 · Cleanup','Remove temporary markers, evacuate staging casualties, update fire and check the objective.'],
];
export const RULES_VERSION = 29;
const phaseInfo = id => PHASES.find(p=>p[0]===id);
function phaseDescription(s){
  if(s.mission_rules.events&&['FRIENDLY_EVENTS','ENEMY_EVENTS'].includes(s.phase))return s.turn===1?'No higher-HQ event check on turn 1.':'Draw for a higher-HQ event; resolve this turn’s mission table and any command obligations.';
  if(s.mission_rules.communications==='simplified'&&s.phase==='BN_ACTIVATION')return 'BN activates an unpinned command-side Company HQ unless this turn’s communications event prevents activation.';
  if(s.objectives&&s.phase==='CLEANUP')return 'Remove temporary markers, evacuate transported and unloaded CCP casualties, update fire and check mission objectives. Position achievements are scored when the mission ends.';
  return phaseInfo(s.phase)[2];
}
const index = a => Object.fromEntries(a.map(v=>[v.id,structuredClone(v)]));
export function createMission(definition,seed,setup={},deployment=null,execution={}) {
  if(definition.readiness?.playable===false)throw new Error(`${definition.name} is not playable yet: ${definition.readiness.missing.join('; ')}.`);
  definition=hill192DeploymentDefinition(definition,setup);
  if(definition.rules?.standaloneRoster&&!deployment)deployment={mission_instance_id:execution.mission_instance_id??globalThis.crypto.randomUUID(),roster:createCampaignRoster(definition.rules.baselineCompanyId??'normandy_cerisy_standalone_company',definition)};
  return initializeMission(definition,seed,setup,deployment,execution);
}
// Read-only pre-mission inspection. Does not bypass the playable-mission gate.
export function previewMissionSetup(definition,seed,setup={}) {
  const s=initializeMission(definition,seed,setup);
  const view=getPlayerView(s);
  return {mission_id:definition.id,mission_version:definition.version,seed:String(seed),setup:structuredClone(setup),map:structuredClone(s.boundaries),
    setup_options:structuredClone(definition.unit_options?{mortar_mode:['section','teams'],command_network:['radio','phones']}:{}),
    playable:definition.readiness?.playable!==false,assumptions:structuredClone(definition.readiness?.assumptions??[]),missing:structuredClone(definition.readiness?.missing??[]),
    ...(s.mission_rules.hill192?{hill192:{forward_defense:s.forward_defense,concentration:s.registered_targets.artillery,source:structuredClone(s.battlefield_source),engineers_available:s.engineers_available}}:{}),...(s.patrol?{patrol:structuredClone(s.patrol.plan)}:{}),locations:view.locations,units:view.units.map(({id,name,kind,platoon,location,steps,experience,assets,radios,capabilities})=>({id,name,kind,platoon,location,steps,experience,assets,radios,capabilities})),objectives:view.objectives,signal_plan:structuredClone(s.signal_plan),phase_lines:structuredClone(s.phase_lines)};
}
function initializeMission(definition,seed,setup={},deployment=null,execution={}) {
  const scenario=materializeScenario(definition,seed,setup);
  if(scenario.ruleset!=='company-v1'||!scenario.units.length||!scenario.locations.length)throw new TypeError('Invalid company scenario');
  let deployedSteps=null;
  if(deployment){
   const snapshot=rosterSnapshot(deployment.roster);
   deployedSteps={};
   scenario.units=scenario.units.filter(unit=>{
    const entry=snapshot.formations[unit.id];
    if(!entry||entry.kind!==unit.kind||(entry.capacity??entry.step_ids.length)!==unit.steps)throw new Error(`Deployment roster cannot field ${unit.id}.`);
    unit.experience=entry.experience;
    deployedSteps[unit.id]=entry.step_ids.filter(id=>snapshot.steps[id]?.disposition==='ACTIVE');
    if(deployedSteps[unit.id].length>(entry.capacity??entry.step_ids.length))throw new Error(`Deployment roster exceeds ${unit.id}'s capacity.`);
    if(deployedSteps[unit.id].length===1)unit.experience=snapshot.steps[deployedSteps[unit.id][0]].experience;
    unit.steps=deployedSteps[unit.id].length;
    return unit.steps>0;
   });
  }
  const s={ruleset:'company-v1',rules_version:RULES_VERSION,scenario_id:scenario.id,scenario_version:scenario.version,id:`mission_${scenario.id}`,seed:String(seed),rng:createRng(seed),
    status:'ACTIVE',turn:1,turn_limit:scenario.turn_limit,phase:PHASES[0][0],briefing:scenario.briefing,locations:index(scenario.locations),units:{},contacts:index(scenario.contacts),
    events:[],replay:[],next_id:1,impulse:null,impulse_number:0,activated:[],completed:[],fire:[],support:[],markers:[],assets:[],casualties:[],prisoners:[],personnel:{},pending_combat:[],
    segment_progress:null,activity:'NO_CONTACT',knowledge:{spotted:{},suspected:{}},enemy_pool:{mg:3,squads:['A/S','A/S','A'],fox:2,trench:2,bunker:1},signal_phase_line:scenario.signal_phase_line};
  s.phone_lines=[];
  s.phase_lines=structuredClone(scenario.phase_lines);
  s.runners=[];
  if(deployment){
   if(!deployment.mission_instance_id||!deployment.roster)throw new Error('Deployment needs a unique mission ID and campaign roster.');
   s.mission_instance_id=deployment.mission_instance_id;
   s.roster_snapshot=rosterSnapshot(deployment.roster);
  }
  s.boundaries=scenario.map?{rows:scenario.map.rows,columns:scenario.map.columns}:null;
  s.terrain_deck=structuredClone(scenario.terrain_deck??[]);s.setup=structuredClone(setup);s.mission_name=scenario.name??'Company Assault';
  s.mission_rules={...structuredClone(scenario.rules??{}),hiddenTerrain:!!scenario.map?.hidden};
  s.enemy_tactics=s.mission_rules.tactics??'deliberate_defense';
  s.attempt_number=1;
  if(scenario.rules?.missionIdentity)s.mission_instance_id??=execution.mission_instance_id??globalThis.crypto.randomUUID();
  s.objectives=structuredClone(scenario.objectives??null);s.achievements=[];s.hq_events=[];s.support_unavailable=[];s.registered_targets={};
  s.mission_contacts=structuredClone(scenario.package_tables?{tables:scenario.package_tables,packages:scenario.packages,draws:scenario.contact_draws,counters:scenario.enemy_counters}:null);
  s.support_agencies=structuredClone(scenario.support_agencies??null);
  s.signal_plan=structuredClone(scenario.signal_plan??null);
  s.mission_rules_text=structuredClone(scenario.special_rules??[]);
  s.support_inventory=Object.fromEntries(Object.entries(s.support_agencies??{}).map(([id,agency])=>[id,structuredClone(agency.inventory??{})]));
  s.deck=newDeck(s);
  const surnames=['Miller','Davis','Wilson','Taylor','Anderson','Thomas','Moore','Martin','Jackson','Thompson','White','Harris','Clark','Lewis','Robinson','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Parker','Collins','Edwards','Stewart','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Ramirez','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster','Gonzales','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Myers','Ford','Hamilton','Graham','Sullivan','Wallace','Woods','Cole','West','Jordan','Owens','Reynolds','Fisher','Ellis'];
  let person=0;
  for(const raw of scenario.units) {
    const u={...structuredClone(raw),mission_weapon:!!scenario.rules,max_steps:s.roster_snapshot?.formations[raw.id].capacity??s.roster_snapshot?.formations[raw.id].step_ids.length??raw.steps,cohesion:'GOOD',original_experience:raw.experience,named:raw.kind!=='SQUAD',pinned:false,exposed:false,cover:null,fire:null,indirect:null,
      saved:0,used:[],removed:raw.reserve?'RESERVE':null,assets:{...structuredClone(scenario.assets[raw.id]??{}),...(scenario.phone_lines?.[raw.id]?{phone_line:scenario.phone_lines[raw.id]}:{})}};
    // Four named people per rifle step; command/weapon steps have two. No extra casualty roll.
    u.steps=Array.from({length:raw.steps},(_,n)=>({id:deployedSteps?.[u.id]?.[n]??`${u.id}_step${n+1}`,...(s.roster_snapshot?{experience:s.roster_snapshot.steps[deployedSteps[u.id][n]].experience}:{}),personnel:s.roster_snapshot?s.roster_snapshot.steps[deployedSteps[u.id][n]].person_ids.map(id=>{s.personnel[id]={...s.roster_snapshot.people[id],status:'ACTIVE'};return id;}):Array.from({length:raw.kind==='SQUAD'?4:2},()=>{
      const id=`person_${++person}`;s.personnel[id]={id,name:`${String.fromCharCode(65+(person%26))}. ${surnames[(person-1)%surnames.length]}`,origin:u.id,status:'ACTIVE'};return id;
    })}));u.initial_resources={radios:structuredClone(u.radios),assets:structuredClone(u.assets),ammo:structuredClone(u.ammo??{})};s.units[u.id]=u;
  }
  for(const l of values(s.locations)){l.covers=scenario.rules?.hill192?structuredClone(l.covers??[]):[];l.smoke=false;}
  if(scenario.rules?.hill192){s.next_id=Math.max(s.next_id,...values(s.locations).flatMap(l=>l.covers.map(c=>Number(/^cover_(\d+)$/.exec(c.id)?.[1]??0)+1)));s.battlefield_source=structuredClone(scenario.battlefield_source??null);s.engineers_available=!!scenario.engineers_available;s.forward_defense=scenario.forward_defense;s.registered_targets.artillery=scenario.concentration;for(const l of values(s.locations).filter(l=>!l.outside_boundary&&(l.row===1||l.id===scenario.forward_defense))){for(let i=l.covers.filter(c=>c.type==='Foxholes').length;i<2;i++)l.covers.push({id:`hill_fox_${l.id}_${i}`,type:'Foxholes',value:1,known:true,discovered:true});}}
  if(scenario.patrol_plan){
   s.patrol=createPatrolProgress(s.locations,scenario.patrol_plan);s.patrol_history=[];s.registered_targets.artillery=scenario.patrol_plan.concentration;
   s.visibility={light:patrolMoonLight(randomNumber(s,4,'Patrol moon visibility')),weather:0};
   for(const l of values(s.locations).filter(l=>l.row===1||l.id===s.patrol.plan.cop))for(let i=0;i<2;i++)l.covers.push({id:`fox_${l.id}_${i}`,type:'Foxholes',value:1,known:true,discovered:true});
   for(const u of values(s.units).filter(u=>friendly(u)&&live(u)&&!patrolParticipant(s.patrol,u)))u.cover=s.locations[u.location].covers[0].id;
  }
  emit(s,'MISSION_STARTED',scenario.briefing,{scenario:scenario.id,version:scenario.version,seed:String(seed)});
  revealTerrain(s,{setup:true});
  if(s.objectives&&!s.locations[s.objectives.ccp].known)throw new Error('Choose a revealed terrain or staging card for the CCP.');
  if(scenario.map)emit(s,'MISSION_SETUP_CONFIRMED','Mission setup confirmed.',{setup:structuredClone(setup)});
  emit(s,'PHASE_ENTERED',phaseInfo(s.phase)[1],{description:phaseDescription(s)});
  if(s.mission_rules?.missionIdentity)recordAttemptStart(s);
  return s;
}
export function eligibleHQs(s) {
  return values(s.units).filter(u=>friendly(u)&&live(u)&&['HQ','STAFF'].includes(u.kind)&&!s.completed.includes(u.id)&&
    (s.phase==='SUBORDINATE_ACTIVATION'?!isCompanyCommander(u)&&s.activated.includes(u.id):
      s.phase==='PLATOON_INITIATIVE'?u.kind==='HQ'&&!isCompanyCommander(u)&&!s.activated.includes(u.id):
      s.phase==='STAFF_INITIATIVE'?u.kind==='STAFF'&&u.command_role!=='higher_hq'&&!s.activated.includes(u.id):false)).map(u=>u.id);
}
function startImpulse(s,id,activation=false) {
  const u=s.units[id];let allowance,cardId=null,base=1,modifiers={};
  if(id==='general'){const card=draw(s,1,'General initiative')[0];cardId=card.id;base=card.initiative;allowance=s.patrol?patrolInitiative(base):base;}
  else if(u.command_role==='higher_hq')allowance=6;
  else if(u.kind==='STAFF'&&!activation)allowance=1;
  else {
    const card=draw(s,1,`${u.name}: ${activation?'activation':'initiative'}`)[0];
    cardId=card.id;base=activation?card.activated:card.initiative;
    const pressure=incoming(s,u).map(f=>f.value);
    if(s.markers.some(m=>m.location===u.location&&m.type==='GRENADE'&&(m.target===u.id||u.cover&&m.cover===u.cover)))pressure.push(-3);
    if(s.fire.some(f=>f.target===u.location&&s.units[f.source]?.vof==='S!'&&!s.units[f.source].pinned))pressure.push(-3);
    if(s.support.some(f=>f.status==='ACTIVE'&&f.location===u.location))pressure.push(-3);
    const worst=pressure.length?Math.min(...pressure):null;
    const fireMod=worst===null||worst===2?0:worst===0?-1:worst===-1?-2:-3;
    modifiers={experience:expMod(u),pinned:u.pinned?-1:0,cover:u.cover?1:0,fire:fireMod,no_contact:s.activity==='NO_CONTACT'?1:0};
    allowance=Math.max(activation?1:0,base+Object.values(modifiers).reduce((a,b)=>a+b,0));
  }
  s.impulse={id:`t${s.turn}_i${++s.impulse_number}`,hq:id,commands:allowance+(u?.saved??0),allowance,spent:0,card_id:cardId,base,modifiers,reserve_used:u?.saved??0};
  if(id==='general'&&(s.mission_rules?.reattempts||s.patrol))s.impulse.hq_limit_only=true;
  if(u)u.saved=0;
  if(isCompanyCommander(u)&&s.command_obligation){const paid=Math.min(s.command_obligation,s.impulse.commands,visibilityCommandLimits(s.visibility).spend);s.command_obligation-=paid;s.impulse.commands-=paid;s.impulse.spent+=paid;emit(s,'HQ_OBLIGATION',`Company HQ spent ${paid} commands on its higher-HQ obligation.`,{paid,remaining:s.command_obligation});if(!s.command_obligation){const event=s.hq_events.findLast(e=>e.turn===s.turn&&['COMM','SITREP'].includes(e.code));if(event)event.completed=true;}}
  emit(s,'IMPULSE_STARTED',`${u?.name??'General initiative'}: ${s.impulse.commands} commands available; ${s.impulse.hq_limit_only?`HQ orders retain their ${visibilityCommandLimits(s.visibility).spend===6?'six':'four'}-command limit`:`maximum ${visibilityCommandLimits(s.visibility).spend===6?'six':'four'} may be spent`}.`,{hq:id,allowance,total:s.impulse.commands});
}
function finishImpulse(s) {
  const i=s.impulse;if(!i)return;
  if(i.hq!=='general') {
    const u=s.units[i.hq];u.saved=u.command_role==='higher_hq'?0:live(u)&&!['P','L'].includes(u.cohesion)?Math.min(visibilityCommandLimits(s.visibility,u.experience).saved,i.commands):0;
    s.completed.push(u.id);emit(s,'IMPULSE_ENDED',`${u.name} saved ${u.saved} commands.`,{hq:u.id,saved:u.saved});
  }else emit(s,'IMPULSE_ENDED','General initiative ended; unused commands discarded.');
  s.impulse=null;
}
function enter(s) {
  s.segment_progress=null;
  emit(s,'PHASE_ENTERED',phaseInfo(s.phase)[1],{description:phaseDescription(s)});
  if(s.phase==='CONTACTS'&&s.mission_contacts){
    for(const pc of values(s.contacts).filter(pc=>!pc.resolved&&!pc.question_side))pc.revealed=true;
    s.contact_queue=contactQueue(s,eligibleContacts(s));
  }
  if(s.phase==='COMBAT_EFFECTS') {
    const start=s.events.length;
    damagePhoneLines(s);
    const resolutions=prepareCombat(s);
    s.segment_progress={phase:s.phase,status:resolutions.length?'awaiting_resolution':'reviewing',index:0,total:resolutions.length,events_after:start};
    if(!resolutions.length)emit(s,'COMBAT_REVIEW','No formations are affected by fire. Continue to cleanup.');
  }
  const commander=companyCommander(s);
  if(s.phase==='BN_ACTIVATION'&&!s.bn_blocked){const visitor=higherCommander(s);if(visitor)startImpulse(s,visitor.id,true);}
  if(s.phase==='CO_ACTIVATION'&&s.activated.includes(commander.id)){deliverRunners(s);startImpulse(s,commander.id,true);}
  if(s.phase==='CO_INITIATIVE'&&!s.activated.includes(commander.id)&&live(commander)){deliverRunners(s);startImpulse(s,commander.id);}
  if(s.phase==='GENERAL_INITIATIVE')startImpulse(s,'general');
}
export function selectHQ(state,id) {
  if(state.pending_support||state.status!=='ACTIVE'||state.impulse||!eligibleHQs(state).includes(id))return {state,events:[],accepted:false,reason:'Choose an eligible HQ after completing the current impulse.'};
  const s=structuredClone(state);startImpulse(s,id,s.phase==='SUBORDINATE_ACTIVATION');s.replay.push({op:'selectHQ',id});return result(state,s,{accepted:true});
}
export function resolveSupportChoice(state,choice){
 try{const s=structuredClone(state);applySupportChoice(s,choice);s.replay.push({op:'resolveSupportChoice',choice:structuredClone(choice)});return result(state,s,{accepted:true});}catch(error){return {state,events:[],accepted:false,reason:error.message};}
}
export function submitCommand(state,c) { return c.type==='SELECT_HQ'?selectHQ(state,c.unit_id):order(state,c); }
export function resolveCombat(state,resolutionId) {
  const progress=state.segment_progress,current=state.pending_combat?.[progress?.index];
  if(state.status!=='ACTIVE'||state.phase!=='COMBAT_EFFECTS')return {state,events:[],accepted:false,reason:'Combat can only resolve during segment 3.7.4.'};
  if(!current||progress.status!=='awaiting_resolution'||current.id!==resolutionId||!current.target_visible)
    return {state,events:[],accepted:false,reason:'Resolve the currently displayed combat exposure once.'};
  const s=structuredClone(state);resolvePreparedCombat(s,resolutionId);s.segment_progress.status='reviewing_result';
  s.replay.push({op:'resolveCombat',id:resolutionId});return result(state,s,{accepted:true});
}
function endMission(s,status,text) { s.status=status;s.impulse=null;scoreMission(s,{final:true});emit(s,'MISSION_ENDED',text,{outcome:status}); }
export function checkObjective(s) {
  if(s.patrol){
   if(s.status!=='ACTIVE')return;
   const outcome=patrolOutcome(s.patrol,s.turn,values(s.units).some(u=>live(u)&&patrolParticipant(s.patrol,u)));
   emit(s,'OBJECTIVE_CHECK',s.patrol.returned?'Patrol route complete; returned across the MLR.':'Visit the route in order, pass through the objective and return across the MLR.',{patrol:true,visited:s.patrol.visited.length,objective_visited:s.patrol.objective_visited,returned:s.patrol.returned});
   if(outcome){scoreMission(s,{final:true});s.patrol_history.push({platoon:s.patrol.plan.platoon,outcome,turns:s.turn});s.status=s.patrol_history.length===3?(s.patrol_history.every(p=>p.outcome==='SUCCESS')?'SUCCESS':'DEFEAT'):'PATROL_COMPLETE';s.impulse=null;emit(s,'PATROL_ENDED',`Patrol ${outcome.toLowerCase()}.`,{outcome,platoon:s.patrol.plan.platoon});if(s.patrol_history.length===3)emit(s,'MISSION_ENDED','All three platoons have completed their patrols.',{outcome:s.status});}
   return;
  }
  const assault=values(s.units).some(u=>friendly(u)&&live(u)&&['SQUAD','LAT','MG','AT'].includes(u.kind));
  if(s.objectives){
    scoreMission(s);const objectivesHeld=['primary','secondary'].every(k=>secureStatus(s,s.objectives[k]).secured);
    const rowsClear=(s.objectives.clear_rows??[]).every(row=>values(s.locations).filter(l=>l.row===row&&(!s.boundaries||l.col>=1&&l.col<=s.boundaries.columns)).every(l=>secureStatus(s,l.id).cleared));
    const complete=objectivesHeld&&rowsClear;
    emit(s,'OBJECTIVE_CHECK',complete?'Mission objectives complete.':`Secure both objectives${s.objectives.clear_rows?.length?' and clear the required rows':''}.`,{secured:complete,objectives_held:objectivesHeld,rows_clear:rowsClear});
    if(!assault)endMission(s,'DEFEAT','Assault force lost.');
    else if(s.turn>=s.turn_limit)endMission(s,complete?'SUCCESS':'DEFEAT',complete?'Primary and secondary objectives secured; required rows cleared.':'Turn limit reached before all objectives were complete.');
    return;
  }
  const unresolved=values(s.contacts).filter(c=>!c.resolved).length;
  const opposition=values(s.units).some(u=>!friendly(u)&&live(u));
  emit(s,'OBJECTIVE_CHECK',`${unresolved} contact markers remain; ${!opposition&&!unresolved?'all positions cleared':'continue the assault'}.`,{contacts_remaining:unresolved});
  if(!assault)endMission(s,'DEFEAT','Assault force lost.');
  else if(s.turn>=s.turn_limit)endMission(s,!opposition&&!unresolved?'SUCCESS':'DEFEAT',!opposition&&!unresolved?'Company assault complete: contacts cleared and defenders eliminated or captured.':'Turn limit reached before all contacts and defenders were cleared.');
}
// Inspection and resolution must follow the same already-seeded queue.
function nextContact(s) {
  const eligible=eligibleContacts(s);
  return s.mission_contacts?s.contact_queue?.map(id=>eligible.find(pc=>pc.id===id)).find(Boolean):eligible[0];
}
export function advancePhase(state,options={}) {
  if(Object.keys(options).some(k=>!['friendlyRemainder','eventChoice'].includes(k))||options.friendlyRemainder&&!['F','A'].includes(options.friendlyRemainder))return {state,events:[],accepted:false,reason:'Invalid segment choice.'};
  if(state.pending_support)return {state,events:[],accepted:false,reason:'Choose ordinary or battalion fire before advancing.'};
  if(state.pending_event&&!options.eventChoice)return {state,events:[],accepted:false,reason:'Choose ammunition and a Row 1 resupply card.'};
  if(state.status!=='ACTIVE')return {state,events:[]};
  const pending=state.phase==='COMBAT_EFFECTS'&&state.pending_combat?.[state.segment_progress?.index];
  if(pending?.status==='PENDING'&&pending.target_visible)
    return {state,events:[],accepted:false,reason:'Resolve the displayed combat exposure before continuing.'};
  const s=structuredClone(state);s.replay.push({op:'advancePhase',...(Object.keys(options).length?{options:structuredClone(options)}: {})});
  if(s.impulse){finishImpulse(s);if(eligibleHQs(s).length)return result(state,s);}
  if(eligibleHQs(s).length)return {state,events:[],reason:'Select each eligible HQ and complete its impulse before advancing.'};
  const phase=s.phase;
  if(s.mission_rules.events&&['FRIENDLY_EVENTS','ENEMY_EVENTS'].includes(phase)){if(s.turn===1)emit(s,'PHASE_SKIPPED','No higher HQ event check on turn one.');else higherEvent(s,phase==='FRIENDLY_EVENTS'?'friendly':'enemy',options.eventChoice);if(s.pending_event)return result(state,s,{accepted:true});}
  else if(['FRIENDLY_EVENTS','DEFENSIVE_EVENTS','DEFENSIVE_ACTIVITY','ENEMY_EVENTS','AT_COMBAT'].includes(phase))emit(s,'PHASE_SKIPPED',phaseInfo(phase)[2]);
  if(phase==='BN_ACTIVATION') {
    const commander=companyCommander(s);
    const visitor=higherCommander(s);
    if(visitor&&!s.bn_blocked){emit(s,'BN_HQ_ON_MAP',`${visitor.name} completed the on-map BN impulse.`,{hq:visitor.id});}
    else if(values(s.units).some(u=>u.command_role==='higher_hq'&&u.removed!=='DEPARTED')){emit(s,'ACTIVATION_UNAVAILABLE','BN HQ is unavailable while its on-map visitor is lost or on the Fire Team side.');}
    else if(!s.bn_blocked&&live(commander)&&commander.cohesion==='GOOD'&&(s.mission_rules.communications==='simplified'?!commander.pinned:commander.radios.includes('BN'))){s.activated.push(commander.id);emit(s,'HQ_ACTIVATED',s.mission_rules.communications==='simplified'?'Off-map Battalion HQ activated Company HQ using mission communications.':'Off-map Battalion HQ activated Company HQ over the BN radio net.',{hq:commander.id});}
    else emit(s,'ACTIVATION_UNAVAILABLE','Company HQ cannot receive BN activation; it must use initiative.');
  }
  if(phase==='ENEMY_ACTIVITY')enemyActivity(s);
  if(phase==='CAPTURE')capture(s,options);
  if(phase==='RETREAT')retreat(s);
  if(phase==='FIRE_MISSIONS') {
    s.support=s.support.filter(f=>f.status==='PENDING');for(const f of s.support){f.status='ACTIVE';emit(s,'SUPPORT_ACTIVE',`Incoming fire active at ${s.locations[f.location].name}.`,{location:f.location,value:f.value});}refresh(s);
  }
  if(phase==='CONTACTS') {
    const next=nextContact(s);
    if(next||!s.segment_progress) {
      const start=s.events.length;
      if(next)resolveContacts(s,next.id);
      else emit(s,'CONTACTS_COMPLETE','No occupied potential contacts remain to evaluate.');
      refresh(s);
      s.segment_progress={phase,status:'reviewing',events_after:start,contact:next?.location??null,
        resolved:[...(s.segment_progress?.resolved??[]),...(next?[next.id]:[])],remaining:eligibleContacts(s).length};
      return result(state,s);
    }
  }
  if(phase==='PINNED_RECOVERY')for(const u of values(s.units).filter(u=>live(u)&&u.pinned&&!hasFire(s,u.location))){u.pinned=false;emit(s,'AUTOMATIC_RECOVERY',`${u.name} is free of fire and unpins.`,{actor:u.id,location:u.location,faction:u.faction},!visible(s,u));}
  if(phase==='COMBAT_EFFECTS'&&s.segment_progress.status!=='reviewing') {
    let index=s.segment_progress.index;
    if(s.pending_combat[index]?.status==='RESOLVED')index++;
    while(index<s.pending_combat.length&&!s.pending_combat[index].target_visible) {
      resolvePreparedCombat(s,s.pending_combat[index].id);index++;
    }
    s.segment_progress.index=index;
    if(index<s.pending_combat.length)s.segment_progress.status='awaiting_resolution';
    else {
      s.segment_progress.status='reviewing';
      for(const id of Object.keys(s.knowledge.spotted))if(s.units[id])s.knowledge.spotted[id]=observeRecord(s.units[id]);
      emit(s,'COMBAT_REVIEW','All combat exposures resolved. Review the results, then continue to cleanup.');
    }
    return result(state,s);
  }
  if(phase==='CLEANUP') {
    finishPatrolEvents(s);
    if(s.mission_rules.events==='normandy'){
      const turnEvents=s.events.filter(e=>e.turn===s.turn&&e.type==='UNIT_MOVED'&&e.faction==='friendly');
      for(const event of s.hq_events.filter(e=>e.side==='friendly'&&e.turn===s.turn)){
       if(event.code==='HOLD')event.completed=!turnEvents.some(e=>s.locations[e.target]?.row>event.lead);
       if(['ADVANCE','ADVANCE_PC'].includes(event.code))event.completed=turnEvents.some(e=>s.locations[e.target]?.row>event.lead&&(event.code==='ADVANCE'||values(s.contacts).some(pc=>pc.location===e.target)));
      }
    }
    for(const u of values(s.units))if(u.temporary_pdf)delete u.temporary_pdf;
    for(const u of values(s.units))if(u.hold_fire_until_cleanup)delete u.hold_fire_until_cleanup;
    s.markers=[];for(const l of values(s.locations))l.smoke=false;
    for(const u of values(s.units)){u.exposed=false;u.mine_hit=false;u.used=[];u.indirect=null;if(!friendly(u)&&u.fire&&!occupants(s,u.fire).some(friendly)){u.fire=null;u.fire_direction=null;u.fire_effect=null;}}
    for(const c of s.casualties.filter(c=>friendly(c)&&(s.objectives?c.location===s.objectives.ccp&&!c.carrier&&c.transported:s.locations[c.location].staging)&&!c.evacuated)){c.evacuated=true;emit(s,'CASUALTY_EVACUATED','A casualty step was evacuated from the designated evacuation area.',{step_id:c.step.id,personnel:c.step.personnel});}
    refresh(s);s.pending_combat=[];checkObjective(s);emit(s,'TURN_ENDED',`Turn ${s.turn} complete.`,{outcome:s.status});
    if(s.status==='ACTIVE'){s.turn++;s.bn_blocked=false;s.command_obligation=0;s.support_unavailable=[];s.forward_row_blocked=null;s.activated=[];s.completed=[];
      if(s.counterattack_ends_after&&s.turn>s.counterattack_ends_after){s.enemy_tactics=s.mission_rules.tactics??'deliberate_defense';s.counterattack_ends_after=null;emit(s,'COUNTER_ATTACK_ENDED',`Enemy tactics returned to ${s.enemy_tactics.replaceAll('_',' ')}.`);}
      for(const u of values(s.units).filter(u=>u.command_role==='higher_hq'&&u.expires_turn<s.turn))u.removed='DEPARTED';
      s.higher_hq_on_map=values(s.units).some(u=>u.command_role==='higher_hq'&&live(u));
      s.phase=PHASES[0][0];enter(s);}
    return result(state,s);
  }
  if(phase!=='COMBAT_EFFECTS')refresh(s);
  if(['FRIENDLY_EVENTS','ENEMY_EVENTS','PINNED_RECOVERY','CAPTURE','RETREAT'].includes(phase))emit(s,'SEGMENT_COMPLETED',phaseInfo(phase)[1],{label:phaseInfo(phase)[1]});
  s.phase=PHASES[PHASES.findIndex(p=>p[0]===phase)+1][0];enter(s);return result(state,s);
}
export function endTurn(state) {
  let s=state,guard=0;const turn=s.turn;
  while(s.status==='ACTIVE'&&s.turn===turn&&guard++<100) {
    if(s.pending_support)s=resolveSupportChoice(s,{locations:[]}).state;
    else if(s.pending_event)s=advancePhase(s,{eventChoice:{ammo_type:'MG',location:'r1c1'}}).state;
    else if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='awaiting_resolution'&&s.pending_combat[s.segment_progress.index]?.target_visible)
      s=resolveCombat(s,s.pending_combat[s.segment_progress.index].id).state;
    else if(!s.impulse&&eligibleHQs(s).length)s=selectHQ(s,eligibleHQs(s)[0]).state;
    else s=advancePhase(s).state;
  }
  return result(state,s);
}
export function abortMission(state) {if(state.status!=='ACTIVE')return {state,events:[]};const s=structuredClone(state);s.replay.push({op:'abortMission'});endMission(s,'ABORTED','Commander aborted the company assault.');return result(state,s);}
export function declineReattempt(state){
 if(!state.mission_rules?.reattempts||state.status!=='DEFEAT'||state.attempt_number!==1||state.reattempt_declined)return {state,events:[],accepted:false,reason:'No reattempt decision is available.'};
 const s=structuredClone(state);s.reattempt_declined=true;s.replay.push({op:'declineReattempt'});emit(s,'REATTEMPT_DECLINED',`Commander ended ${s.mission_name} after the first attempt.`);return result(state,s,{accepted:true});
}
export function getVisibleEvents(s,faction='friendly',after=0) {
  if(faction!=='friendly')throw new TypeError('Only the player perspective is available');
  const events=s.events.filter(e=>!e.hidden),ids=new Set(events.map(e=>e.id));
  return events.filter(e=>e.sequence>after).map(e=>{
    const v=structuredClone(e);delete v.hidden;
    if(v.caused_by_event_id&&!ids.has(v.caused_by_event_id))v.caused_by_event_id=null;
    return v;
  });
}
export function getPlayerView(s,faction='friendly',issuerId=s.impulse?.hq) {
  if(faction!=='friendly')throw new TypeError('Only the player perspective is available');
  const visibleHistory=getVisibleEvents(s);
  // Incoming fire already reported to the player remains known when its card empties.
  const knownSupport=s.support.filter(f=>s.units[f.source]?.faction==='friendly'||occupants(s,f.location).some(friendly)||s.units[f.source]&&s.knowledge.spotted[f.source]||f.status==='ACTIVE'&&visibleHistory.some(e=>['INCOMING_FIRE','SUPPORT_ACTIVE'].includes(e.type)&&e.location===f.location&&e.value===f.value));
  const units=values(s.units).filter(friendly).map(u=>({...structuredClone(u),steps:u.steps.length,
    activated:s.activated.includes(u.id),impulse_completed:s.completed.includes(u.id),
    los_explanations:Object.fromEntries(values(s.locations).map(l=>{const trace=explainUnitCard(s,u,l.id);const publicTrace=explainUnitCard({...s,support:knownSupport},u,l.id);return [l.id,l.known===false?{visible:false,reason:'Terrain not yet revealed.'}:{visible:trace.visible,reason:trace.visible===publicTrace.visible?publicTrace.reason:'No LOS: battlefield conditions block this view.'}];})),
    los:values(s.locations).filter(l=>l.known!==false&&seesCard(s,u,l.id)).map(l=>l.id),
    communication:issuerId==='general'?'General initiative':communication(s,s.units[issuerId],u),
    communication_reason:communicationReason(s,s.units[issuerId],u),
    attempted:[...new Set(u.used.filter(k=>k.startsWith(`${s.impulse?.id}:`)).map(k=>k.slice(s.impulse.id.length+1)))],
    personnel:u.steps.flatMap(v=>v.personnel),incoming:incoming(s,u).map(f=>({origin:f.origin,value:f.value,source:visible(s,s.units[f.source])?f.source:null})),
    combat:(()=>{const c=combatModifier(s,u);return c?{ncm:c.ncm,total:c.total,parts:structuredClone(c.parts),modifiers:structuredClone(c.modifiers)}:null;})(),options:live(u)?commandOptions(s,u,issuerId):[]}));
  for(const u of units) {
    u.skills=(s.skills??[]).filter(p=>p.holder===u.id&&!p.used).map(p=>({id:p.id,label:SKILLS[p.type].label}));
    u.automatic_skill=s.automatic_skills?.[u.id]?(s.skills.find(p=>p.id===s.automatic_skills[u.id])?.type==='AUTO_GRENADE'?'Auto Grenade assigned to next return attempt':'Extra Draw assigned to next automatic attempt'):null;
    u.tactical_ready=u.options.some(o=>o.available&&!(o.cost===0&&['DROP_LOAD','DROP_CASUALTY'].includes(o.type)));
    u.inventory={equipment:[...Object.entries(u.assets).filter(([,n])=>n>0).map(([key,quantity])=>({key,label:key.replaceAll('_',' '),quantity})),...Object.entries(u.ammo??{}).map(([key,quantity])=>({key,label:`${key} ammunition`,quantity}))],radios:[...u.radios],casualties:s.casualties.filter(c=>c.carrier===u.id&&!c.evacuated).map(c=>({id:c.id,label:`${c.origin_name??'Friendly formation'} casualty step`}))};
    const transition=visibleHistory.findLast(e=>e.type==='HQ_RECONSTITUTED'&&e.donor===u.id);
    u.transition_description=u.removed==='RECONSTITUTED'?(transition?`Reconstituted ${transition.restored_name??s.units[transition.actor]?.name??'HQ'}`:'Used in reconstitution'):u.removed==='GUARD'?'Assigned as prisoner guard':u.removed==='CAPTURED'?'Captured':u.removed==='WITHDRAWN'?'Withdrawn':null;
  }
  const knownEnemy=Object.keys(s.knowledge.spotted).filter(id=>s.units[id]).map(id=>observeRecord(s.units[id]));
  const pending=s.phase==='COMBAT_EFFECTS'?s.pending_combat?.[s.segment_progress?.index]:null;
  const projectCombat=pending=>pending?.target_visible?{id:pending.id,status:pending.status,target_id:pending.target_id,target_name:pending.target_name,
    visible_position:s.pending_combat.filter(r=>r.target_visible).findIndex(r=>r.id===pending.id)+1,
    target_location:pending.target_location,target_faction:pending.target_faction,target_experience:pending.target_experience,target_kind:pending.target_kind,
    target_steps:pending.target_steps,target_cohesion:pending.target_cohesion,target_pinned:pending.target_pinned,ncm:pending.ncm,total:pending.total,
    parts:structuredClone(pending.parts),modifiers:structuredClone(pending.modifiers),probabilities:structuredClone(pending.probabilities),
    hit_probabilities:structuredClone(pending.hit_probabilities),result:pending.result,hit_effect:pending.hit_effect,after:structuredClone(pending.after),casualty_steps:pending.casualty_steps,
    strongest:pending.strongest?{...structuredClone(pending.strongest),source_id:pending.strongest.known?pending.strongest.source_id:null}:null,
    sources:pending.sources.map(source=>({...structuredClone(source),source_id:source.known?source.source_id:null}))}:null;
  const combat_resolution=projectCombat(pending);
  const combat_resolutions=s.phase==='COMBAT_EFFECTS'?s.pending_combat.filter(r=>r.target_visible).map(projectCombat):[];
  const segment_progress=s.phase==='COMBAT_EFFECTS'&&s.segment_progress?{phase:s.segment_progress.phase,status:s.segment_progress.status,
    events_after:s.segment_progress.events_after,
    visible_total:s.pending_combat.filter(r=>r.target_visible).length,visible_resolved:s.pending_combat.filter(r=>r.target_visible&&r.status==='RESOLVED').length}:structuredClone(s.segment_progress);
  const contactEvents=s.phase==='CONTACTS'&&s.segment_progress?getVisibleEvents(s,'friendly',s.segment_progress.events_after):[];
  const contact_review=s.phase==='CONTACTS'?{eligible_locations:eligibleContacts(s).map(c=>c.location),location:s.segment_progress?.contact??nextContact(s)?.location??null,next_location:nextContact(s)?.location??null,resolved:!!s.segment_progress,events:contactEvents}:null;
  return {...(s.patrol?{patrol:structuredClone(s.patrol),patrol_history:structuredClone(s.patrol_history),visibility:structuredClone(s.visibility),command_limits:visibilityCommandLimits(s.visibility,companyCommander(s)?.experience??'Line')}:{}),id:s.id,scenario_id:s.scenario_id,status:s.status,seed:s.seed,turn:s.turn,turn_limit:s.turn_limit,phase:s.phase,phase_label:phaseInfo(s.phase)[1],phase_description:phaseDescription(s),combat_resolution,combat_resolutions,contact_review,pending_support:structuredClone(s.pending_support??null),pending_event:structuredClone(s.pending_event??null),enemy_tactics:s.enemy_tactics,counterattack_ends_after:s.counterattack_ends_after??null,
    historical_losses:getVisibleEvents(s).filter(e=>e.type==='FORMATION_LOST'),
    segment_progress,briefing:s.briefing,activity:s.activity,impulse:structuredClone(s.impulse),eligible_hqs:eligibleHQs(s),units,
    locations:values(s.locations).map(terrainProjection),
    command_network:commandNetwork(s),mission_rules_text:structuredClone(s.mission_rules_text??[]),
    hq_events:structuredClone(s.hq_events??[]).map(({side,code,turn,lead,completed,choice,placements,waypoint,ignored})=>({side,code,turn,lead,completed,choice,placements,...(waypoint!==undefined?{waypoint,ignored}:{})})),mission_name:s.mission_name,objectives:s.objectives?Object.fromEntries(['primary','secondary','attack','ccp'].map(k=>[k,{location:s.objectives[k],...secureStatus(s,s.objectives[k])}])):null,achievements:structuredClone(s.achievements),achievement_tally:achievementTally(s),
    contacts:values(s.contacts).filter(c=>!c.returning||s.knowledge.suspected[c.location]).map(c=>({id:c.id,location:c.location,type:(c.counterattack||c.question_side)&&!c.revealed&&!c.resolved?'?':c.type,resolved:c.resolved,counterattack:!!c.counterattack})),
    enemies:knownEnemy,suspected:spottingLocations(s),historical_reports:Object.keys(s.knowledge.suspected),
    fire:[...s.fire,...temporaryMortarFire(s)].filter(f=>friendly(s.units[f.source])||occupants(s,f.target).some(friendly)||s.knowledge.spotted[f.source]).map(f=>({...f,direction:f.direction?{dr:f.direction.dr,dc:f.direction.dc}:null,source:visible(s,s.units[f.source])?f.source:null,friendly:friendly(s.units[f.source])})),
    markers:s.markers.filter(m=>m.type==='ILLUMINATION'||occupants(s,m.location).some(u=>friendly(u)||s.knowledge.spotted[u.id])).map(m=>({type:m.type,location:m.location,value:m.value,critical:!!m.critical,...(m.weapon?{weapon:m.weapon}:{}),...(m.type==='ILLUMINATION'?{center:m.center,adjacent:m.adjacent,delivery:m.delivery}:{})})),phone_lines:structuredClone(s.phone_lines),runners:structuredClone(s.runners),
    support:knownSupport.map(f=>({location:f.location,status:f.status,value:f.value,...(f.agency?{agency:f.agency==='cannon'?'cannon':f.agency.includes('mortar')?'mortar':'artillery',ammo:f.ammo??'HE'}:{})})),support_inventory:structuredClone(s.support_inventory),
    personnel:values(s.personnel),casualties:s.casualties.filter(c=>c.faction==='friendly').map(c=>({...structuredClone(c),label:`${c.origin_name??'Friendly formation'} casualty step`,carrier_name:c.carrier?s.units[c.carrier]?.name:null})),
    assets:s.assets.filter(a=>!a.destroyed&&a.faction==='friendly').map(a=>({...structuredClone(a),label:a.type==='RADIO'?`${a.net} radio`:`${String(a.key??'Equipment').replaceAll('_',' ')}${a.type==='AMMO'?' ammunition':''}${a.quantity>1?` ×${a.quantity}`:''}`,carrier_name:a.carrier?s.units[a.carrier]?.name:null})),
    deck:{draws:getVisibleEvents(s).filter(e=>e.type==='CARDS_DRAWN').reduce((n,e)=>n+e.card_ids.length,0)},
  };
}
export function getAfterActionReport(s) {
  if(s.status==='ACTIVE')return null;const events=getVisibleEvents(s);
  return {record_type:'AAR',ruleset:s.ruleset,rules_version:s.rules_version,scenario:s.scenario_id,scenario_version:s.scenario_version,mission_instance_id:s.mission_instance_id??null,attempts:structuredClone(s.attempt_history??[]),seed:s.seed,setup:structuredClone(s.setup),achievements:structuredClone(s.achievements),score:s.achievements.reduce((n,a)=>n+a.points,0),outcome:s.status,turns:s.turn,events,orders:events.filter(e=>e.type==='COMMAND_ISSUED'),casualties:events.filter(e=>e.type==='CASUALTY'),
    formations:events.filter(e=>['FORMATION_CHANGED','FORMATION_RECONSTITUTED','HQ_RECONSTITUTED','COHESION_CHANGED','UNIT_CAPTURED'].includes(e.type)),objectives:events.filter(e=>['OBJECTIVE_CHECK','MISSION_ENDED'].includes(e.type))};
}
export function exportReplay(s) { return {ruleset:s.ruleset,rules_version:s.rules_version,scenario:s.scenario_id,version:s.scenario_version,seed:s.seed,setup:structuredClone(s.setup),...(s.mission_instance_id?{mission_instance_id:s.mission_instance_id}:{}),...(s.attempt_records?{attempt_records:structuredClone(s.attempt_records)}:{}),...(s.roster_snapshot?{roster_snapshot:structuredClone(s.roster_snapshot)}:{}),operations:structuredClone(s.replay)}; }
function replayOperation(s,op) {
  if(op.op==='resolveSupportChoice')return resolveSupportChoice(s,op.choice);
  if(op.op==='submitCommand')return submitCommand(s,op.command);
  if(op.op==='selectHQ')return selectHQ(s,op.id);
  if(op.op==='advancePhase')return advancePhase(s,op.options);
  if(op.op==='resolveCombat')return resolveCombat(s,op.id);
  if(op.op==='abortMission')return abortMission(s);
  if(op.op==='preparePatrol')return preparePatrol(s,op.choices);
  if(op.op==='reattempt')return prepareReattempt(s,op.choices);
  if(op.op==='declineReattempt')return declineReattempt(s);
  throw new Error('Unknown replay operation');
}
export function replayMission(scenario,record) {
  if(record.scenario!==scenario.id||record.ruleset!==scenario.ruleset||record.version!==scenario.version||record.rules_version!==RULES_VERSION)
    throw new Error('Replay rules/scenario version mismatch. Preserve historical exports; use compareReplay for a diagnostic comparison.');
  if(scenario.rules?.missionIdentity&&!record.mission_instance_id)throw new Error('Normandy replay is missing its mission run identity.');
  let s=createMission(scenario,record.seed,record.setup??{},record.roster_snapshot?{mission_instance_id:record.mission_instance_id,roster:{schema:1,...record.roster_snapshot,applied_missions:{}}}:null,{mission_instance_id:record.mission_instance_id});
  for(const [index,op] of record.operations.entries()) {
    const r=replayOperation(s,op);
    if(r.accepted===false||r.reason||r.state===s)throw new Error(`Replay operation ${index+1} rejected: ${r.reason??'mission already ended'}`);
    s=r.state;
  }
  if(scenario.rules?.missionIdentity&&JSON.stringify(record.attempt_records)!==JSON.stringify(s.attempt_records))throw new Error('Replay attempt starting record mismatch.');
  return s;
}
// Explicitly diagnostic: every rejected historical operation is recorded, never silently omitted.
export function compareReplay(scenario,record) {
  if(record.scenario!==scenario.id||record.ruleset!==scenario.ruleset)throw new Error('Different scenario/ruleset');
  let s=createMission(scenario,record.seed,record.setup??{});const operations=[];
  for(const [index,op] of record.operations.entries()) {
    const before={turn:s.turn,phase:s.phase};
    const r=replayOperation(s,op),rejected=r.accepted===false||!!r.reason||r.state===s;
    operations.push({index:index+1,...before,operation:structuredClone(op),accepted:!rejected,reason:rejected?r.reason??'Mission already ended':null});s=r.state;
  }
  return {diagnostic:true,source_rules_version:record.rules_version??1,target_rules_version:RULES_VERSION,
    outcome:s.status,turn:s.turn,rejected:operations.filter(o=>!o.accepted).length,operations,events:getVisibleEvents(s)};
}
