import {contactQueue} from './missionContacts.js';
import {materializeScenario} from './missionSetup.js';
import {revealTerrain,terrainProjection} from './missionKnowledge.js';
import {higherEvent,scoreMission,secureStatus} from './missionFeatures.js';
import { createRng } from '../rng.js';
import { values, live, good, friendly, expMod, visible, emit, newDeck, draw, result } from './core.js';
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
export const RULES_VERSION = 9;
const phaseInfo = id => PHASES.find(p=>p[0]===id);
function phaseDescription(s){
  if(s.mission_rules.events&&['FRIENDLY_EVENTS','ENEMY_EVENTS'].includes(s.phase))return s.turn===1?'No higher-HQ event check on turn 1.':'Draw for a higher-HQ event; resolve this turn’s mission table and any command obligations.';
  if(s.mission_rules.communications==='simplified'&&s.phase==='BN_ACTIVATION')return 'BN activates an unpinned command-side Company HQ unless this turn’s communications event prevents activation.';
  if(s.objectives&&s.phase==='CLEANUP')return 'Remove temporary markers, evacuate transported and unloaded CCP casualties, update fire and check mission objectives. Position achievements are scored when the mission ends.';
  return phaseInfo(s.phase)[2];
}
const index = a => Object.fromEntries(a.map(v=>[v.id,structuredClone(v)]));
export function createMission(definition,seed,setup={}) {
  if(definition.readiness?.playable===false)throw new Error(`${definition.name} is not playable yet: ${definition.readiness.missing.join('; ')}.`);
  return initializeMission(definition,seed,setup);
}
// Read-only pre-mission inspection. Does not bypass the playable-mission gate.
export function previewMissionSetup(definition,seed,setup={}) {
  const s=initializeMission(definition,seed,setup);
  const view=getPlayerView(s);
  return {mission_id:definition.id,mission_version:definition.version,seed:String(seed),setup:structuredClone(setup),
    playable:definition.readiness?.playable!==false,assumptions:structuredClone(definition.readiness?.assumptions??[]),missing:structuredClone(definition.readiness?.missing??[]),
    locations:view.locations,units:view.units.map(({id,name,kind,platoon,location,steps,experience,assets})=>({id,name,kind,platoon,location,steps,experience,assets})),objectives:view.objectives};
}
function initializeMission(definition,seed,setup={}) {
  const scenario=materializeScenario(definition,seed,setup);
  if(scenario.ruleset!=='company-v1'||!scenario.units.length||!scenario.locations.length)throw new TypeError('Invalid company scenario');
  const s={ruleset:'company-v1',rules_version:RULES_VERSION,scenario_id:scenario.id,scenario_version:scenario.version,id:`mission_${scenario.id}`,seed:String(seed),rng:createRng(seed),
    status:'ACTIVE',turn:1,turn_limit:scenario.turn_limit,phase:PHASES[0][0],briefing:scenario.briefing,locations:index(scenario.locations),units:{},contacts:index(scenario.contacts),
    events:[],replay:[],next_id:1,impulse:null,impulse_number:0,activated:[],completed:[],fire:[],support:[],markers:[],assets:[],casualties:[],prisoners:[],personnel:{},pending_combat:[],
    segment_progress:null,activity:'NO_CONTACT',knowledge:{spotted:{},suspected:{}},enemy_pool:{mg:3,squads:['A/S','A/S','A'],fox:2,trench:2,bunker:1},signal_phase_line:scenario.signal_phase_line};
  s.boundaries=scenario.map?{rows:scenario.map.rows,columns:scenario.map.columns}:null;
  s.terrain_deck=structuredClone(scenario.terrain_deck??[]);s.setup=structuredClone(setup);s.mission_name=scenario.name??'Company Assault';
  s.mission_rules={...structuredClone(scenario.rules??{}),hiddenTerrain:!!scenario.map?.hidden};
  s.objectives=structuredClone(scenario.objectives??null);s.achievements=[];s.hq_events=[];s.support_unavailable=[];s.registered_targets={};
  s.mission_contacts=structuredClone(scenario.package_tables?{tables:scenario.package_tables,packages:scenario.packages,draws:scenario.contact_draws,counters:scenario.enemy_counters}:null);
  s.support_agencies=structuredClone(scenario.support_agencies??null);
  s.deck=newDeck(s);
  const surnames=['Miller','Davis','Wilson','Taylor','Anderson','Thomas','Moore','Martin','Jackson','Thompson','White','Harris','Clark','Lewis','Robinson','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Parker','Collins','Edwards','Stewart','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Ramirez','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster','Gonzales','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Myers','Ford','Hamilton','Graham','Sullivan','Wallace','Woods','Cole','West','Jordan','Owens','Reynolds','Fisher','Ellis'];
  let person=0;
  for(const raw of scenario.units) {
    const u={...structuredClone(raw),mission_weapon:!!scenario.rules,max_steps:raw.steps,cohesion:'GOOD',original_experience:raw.experience,named:raw.kind!=='SQUAD',pinned:false,exposed:false,cover:null,fire:null,indirect:null,
      saved:0,used:[],removed:null,assets:structuredClone(scenario.assets[raw.id]??{})};
    // Four named people per rifle step; command/weapon steps have two. No extra casualty roll.
    u.steps=Array.from({length:raw.steps},(_,n)=>({id:`${u.id}_step${n+1}`,personnel:Array.from({length:raw.kind==='SQUAD'?4:2},()=>{
      const id=`person_${++person}`;s.personnel[id]={id,name:`${String.fromCharCode(65+(person%26))}. ${surnames[(person-1)%surnames.length]}`,origin:u.id,status:'ACTIVE'};return id;
    })}));s.units[u.id]=u;
  }
  for(const l of values(s.locations)){l.covers=[];l.smoke=false;}
  emit(s,'MISSION_STARTED',scenario.briefing,{scenario:scenario.id,version:scenario.version,seed:String(seed)});
  revealTerrain(s,{setup:true});
  if(s.objectives&&!s.locations[s.objectives.ccp].known)throw new Error('Choose a revealed terrain or staging card for the CCP.');
  if(scenario.map)emit(s,'MISSION_SETUP_CONFIRMED','Mission setup confirmed.',{setup:structuredClone(setup)});
  emit(s,'PHASE_ENTERED',phaseInfo(s.phase)[1],{description:phaseDescription(s)});
  return s;
}
export function eligibleHQs(s) {
  return values(s.units).filter(u=>friendly(u)&&live(u)&&['HQ','STAFF'].includes(u.kind)&&!s.completed.includes(u.id)&&
    (s.phase==='SUBORDINATE_ACTIVATION'?u.id!=='co'&&s.activated.includes(u.id):
      s.phase==='PLATOON_INITIATIVE'?u.kind==='HQ'&&u.id!=='co'&&!s.activated.includes(u.id):
      s.phase==='STAFF_INITIATIVE'?u.kind==='STAFF'&&!s.activated.includes(u.id):false)).map(u=>u.id);
}
function startImpulse(s,id,activation=false) {
  const u=s.units[id];let allowance,cardId=null,base=1,modifiers={};
  if(id==='general'){const card=draw(s,1,'General initiative')[0];cardId=card.id;base=card.initiative;allowance=base;}
  else if(u.kind==='STAFF'&&!activation)allowance=1;
  else {
    const card=draw(s,1,`${u.name}: ${activation?'activation':'initiative'}`)[0];
    cardId=card.id;base=activation?card.activated:card.initiative;
    const pressure=incoming(s,u).map(f=>f.value);
    if(s.fire.some(f=>f.target===u.location&&s.units[f.source]?.vof==='S!'&&!s.units[f.source].pinned))pressure.push(-3);
    if(s.support.some(f=>f.status==='ACTIVE'&&f.location===u.location))pressure.push(-3);
    const worst=pressure.length?Math.min(...pressure):null;
    const fireMod=worst===null||worst===2?0:worst===0?-1:worst===-1?-2:-3;
    modifiers={experience:expMod(u),pinned:u.pinned?-1:0,cover:u.cover?1:0,fire:fireMod,no_contact:s.activity==='NO_CONTACT'?1:0};
    allowance=Math.max(activation?1:0,base+Object.values(modifiers).reduce((a,b)=>a+b,0));
  }
  s.impulse={id:`t${s.turn}_i${++s.impulse_number}`,hq:id,commands:allowance+(u?.saved??0),allowance,spent:0,card_id:cardId,base,modifiers,reserve_used:u?.saved??0};
  if(u)u.saved=0;
  if(id==='co'&&s.command_obligation){const paid=Math.min(s.command_obligation,s.impulse.commands,6);s.command_obligation-=paid;s.impulse.commands-=paid;s.impulse.spent+=paid;emit(s,'HQ_OBLIGATION',`Company HQ spent ${paid} commands on its higher-HQ obligation.`,{paid,remaining:s.command_obligation});if(!s.command_obligation){const event=s.hq_events.findLast(e=>e.turn===s.turn&&['COMM','SITREP'].includes(e.code));if(event)event.completed=true;}}
  emit(s,'IMPULSE_STARTED',`${u?.name??'General initiative'}: ${s.impulse.commands} commands available; maximum six may be spent.`,{hq:id,allowance,total:s.impulse.commands});
}
function finishImpulse(s) {
  const i=s.impulse;if(!i)return;
  if(i.hq!=='general') {
    const u=s.units[i.hq];u.saved=live(u)&&!['P','L'].includes(u.cohesion)?Math.min(({Green:3,Line:6,Veteran:9})[u.experience],i.commands):0;
    s.completed.push(u.id);emit(s,'IMPULSE_ENDED',`${u.name} saved ${u.saved} commands.`,{hq:u.id,saved:u.saved});
  }else emit(s,'IMPULSE_ENDED','General initiative ended; unused commands discarded.');
  s.impulse=null;
}
function enter(s) {
  s.segment_progress=null;
  emit(s,'PHASE_ENTERED',phaseInfo(s.phase)[1],{description:phaseDescription(s)});
  if(s.phase==='CONTACTS'&&s.mission_contacts)s.contact_queue=contactQueue(s,eligibleContacts(s));
  if(s.phase==='COMBAT_EFFECTS') {
    const start=s.events.length;
    const resolutions=prepareCombat(s);
    s.segment_progress={phase:s.phase,status:resolutions.length?'awaiting_resolution':'reviewing',index:0,total:resolutions.length,events_after:start};
    if(!resolutions.length)emit(s,'COMBAT_REVIEW','No formations are affected by fire. Continue to cleanup.');
  }
  if(s.phase==='CO_ACTIVATION'&&s.activated.includes('co'))startImpulse(s,'co',true);
  if(s.phase==='CO_INITIATIVE'&&!s.activated.includes('co')&&live(s.units.co))startImpulse(s,'co');
  if(s.phase==='GENERAL_INITIATIVE')startImpulse(s,'general');
}
export function selectHQ(state,id) {
  if(state.status!=='ACTIVE'||state.impulse||!eligibleHQs(state).includes(id))return {state,events:[],accepted:false,reason:'Choose an eligible HQ after completing the current impulse.'};
  const s=structuredClone(state);startImpulse(s,id,s.phase==='SUBORDINATE_ACTIVATION');s.replay.push({op:'selectHQ',id});return result(state,s,{accepted:true});
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
  const assault=values(s.units).some(u=>friendly(u)&&live(u)&&['SQUAD','LAT','MG','AT'].includes(u.kind));
  if(s.objectives){
    scoreMission(s);const complete=['primary','secondary'].every(k=>secureStatus(s,s.objectives[k]).secured);
    emit(s,'OBJECTIVE_CHECK',complete?'Both objectives secured.':'Secure and hold both designated objectives.',{secured:complete});
    if(!assault)endMission(s,'DEFEAT','Assault force lost.');
    else if(s.turn>=s.turn_limit)endMission(s,complete?'SUCCESS':'DEFEAT',complete?'Primary and secondary objectives secured.':'Turn limit reached without both objectives secured.');
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
export function advancePhase(state) {
  if(state.status!=='ACTIVE')return {state,events:[]};
  const pending=state.phase==='COMBAT_EFFECTS'&&state.pending_combat?.[state.segment_progress?.index];
  if(pending?.status==='PENDING'&&pending.target_visible)
    return {state,events:[],accepted:false,reason:'Resolve the displayed combat exposure before continuing.'};
  const s=structuredClone(state);s.replay.push({op:'advancePhase'});
  if(s.impulse){finishImpulse(s);if(eligibleHQs(s).length)return result(state,s);}
  if(eligibleHQs(s).length)return {state,events:[],reason:'Select each eligible HQ and complete its impulse before advancing.'};
  const phase=s.phase;
  if(s.mission_rules.events&&['FRIENDLY_EVENTS','ENEMY_EVENTS'].includes(phase))higherEvent(s,phase==='FRIENDLY_EVENTS'?'friendly':'enemy');
  else if(['FRIENDLY_EVENTS','DEFENSIVE_EVENTS','DEFENSIVE_ACTIVITY','ENEMY_EVENTS','AT_COMBAT'].includes(phase))emit(s,'PHASE_SKIPPED',phaseInfo(phase)[2]);
  if(phase==='BN_ACTIVATION') {
    if(!s.bn_blocked&&live(s.units.co)&&s.units.co.cohesion==='GOOD'&&(s.mission_rules.communications==='simplified'?!s.units.co.pinned:s.units.co.radios.includes('BN'))){s.activated.push('co');emit(s,'HQ_ACTIVATED',s.mission_rules.communications==='simplified'?'Off-map Battalion HQ activated Company HQ using mission communications.':'Off-map Battalion HQ activated Company HQ over the BN radio net.',{hq:'co'});}
    else emit(s,'ACTIVATION_UNAVAILABLE','Company HQ cannot receive BN activation; it must use initiative.');
  }
  if(phase==='ENEMY_ACTIVITY')enemyActivity(s);
  if(phase==='CAPTURE')capture(s);
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
  if(phase==='PINNED_RECOVERY')for(const u of values(s.units).filter(u=>live(u)&&u.pinned&&combatModifier(s,u)===null)){u.pinned=false;emit(s,'AUTOMATIC_RECOVERY',`${u.name} is free of fire and unpins.`,{actor:u.id},!visible(s,u));}
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
    for(const u of values(s.units))if(u.temporary_pdf)delete u.temporary_pdf;
    for(const u of values(s.units))if(u.hold_fire_until_cleanup)delete u.hold_fire_until_cleanup;
    s.markers=[];for(const l of values(s.locations))l.smoke=false;
    for(const u of values(s.units)){u.exposed=false;u.mine_hit=false;u.used=[];u.indirect=null;if(!friendly(u)&&u.fire&&!occupants(s,u.fire).some(friendly)){u.fire=null;u.fire_direction=null;u.fire_effect=null;}}
    for(const c of s.casualties.filter(c=>friendly(c)&&(s.objectives?c.location===s.objectives.ccp&&!c.carrier&&c.transported:s.locations[c.location].staging)&&!c.evacuated)){c.evacuated=true;emit(s,'CASUALTY_EVACUATED','A casualty step was evacuated from the designated evacuation area.',{step_id:c.step.id,personnel:c.step.personnel});}
    refresh(s);s.pending_combat=[];checkObjective(s);emit(s,'TURN_ENDED',`Turn ${s.turn} complete.`,{outcome:s.status});
    if(s.status==='ACTIVE'){s.turn++;s.bn_blocked=false;s.command_obligation=0;s.support_unavailable=[];s.activated=[];s.completed=[];s.phase=PHASES[0][0];enter(s);}
    return result(state,s);
  }
  if(phase!=='COMBAT_EFFECTS')refresh(s);
  s.phase=PHASES[PHASES.findIndex(p=>p[0]===phase)+1][0];enter(s);return result(state,s);
}
export function endTurn(state) {
  let s=state,guard=0;const turn=s.turn;
  while(s.status==='ACTIVE'&&s.turn===turn&&guard++<100) {
    if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='awaiting_resolution'&&s.pending_combat[s.segment_progress.index]?.target_visible)
      s=resolveCombat(s,s.pending_combat[s.segment_progress.index].id).state;
    else if(!s.impulse&&eligibleHQs(s).length)s=selectHQ(s,eligibleHQs(s)[0]).state;
    else s=advancePhase(s).state;
  }
  return result(state,s);
}
export function abortMission(state) {if(state.status!=='ACTIVE')return {state,events:[]};const s=structuredClone(state);s.replay.push({op:'abortMission'});endMission(s,'ABORTED','Commander aborted the company assault.');return result(state,s);}
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
  const units=values(s.units).filter(friendly).map(u=>({...structuredClone(u),steps:u.steps.length,
    activated:s.activated.includes(u.id),impulse_completed:s.completed.includes(u.id),
    los_explanations:Object.fromEntries(values(s.locations).map(l=>{const trace=explainUnitCard(s,u,l.id);const publicTrace=explainUnitCard({...s,support:s.support.filter(f=>friendly(s.units[f.source]??{})||occupants(s,f.location).some(v=>friendly(v)||s.knowledge.spotted[v.id]))},u,l.id);return [l.id,l.known===false?{visible:false,reason:'Terrain not yet revealed.'}:{visible:trace.visible,reason:trace.visible===publicTrace.visible?publicTrace.reason:'No LOS: battlefield conditions block this view.'}];})),
    los:values(s.locations).filter(l=>l.known!==false&&seesCard(s,u,l.id)).map(l=>l.id),
    communication:issuerId==='general'?'General initiative':communication(s,s.units[issuerId],u),
    communication_reason:communicationReason(s,s.units[issuerId],u),
    attempted:[...new Set(u.used.filter(k=>k.startsWith(`${s.impulse?.id}:`)).map(k=>k.slice(s.impulse.id.length+1)))],
    personnel:u.steps.flatMap(v=>v.personnel),incoming:incoming(s,u).map(f=>({origin:f.origin,value:f.value,source:visible(s,s.units[f.source])?f.source:null})),
    combat:(()=>{const c=combatModifier(s,u);return c?{ncm:c.ncm,total:c.total,parts:structuredClone(c.parts),modifiers:structuredClone(c.modifiers)}:null;})(),options:live(u)?commandOptions(s,u,issuerId):[]}));
  const knownEnemy=Object.keys(s.knowledge.spotted).filter(id=>s.units[id]).map(id=>observeRecord(s.units[id]));
  const pending=s.phase==='COMBAT_EFFECTS'?s.pending_combat?.[s.segment_progress?.index]:null;
  const combat_resolution=pending?.target_visible?{id:pending.id,status:pending.status,target_id:pending.target_id,target_name:pending.target_name,
    target_location:pending.target_location,target_faction:pending.target_faction,target_experience:pending.target_experience,target_kind:pending.target_kind,
    target_steps:pending.target_steps,target_cohesion:pending.target_cohesion,target_pinned:pending.target_pinned,ncm:pending.ncm,total:pending.total,
    parts:structuredClone(pending.parts),modifiers:structuredClone(pending.modifiers),probabilities:structuredClone(pending.probabilities),
    hit_probabilities:structuredClone(pending.hit_probabilities),result:pending.result,hit_effect:pending.hit_effect,after:structuredClone(pending.after),casualty_steps:pending.casualty_steps,
    strongest:pending.strongest?{...structuredClone(pending.strongest),source_id:pending.strongest.known?pending.strongest.source_id:null}:null,
    sources:pending.sources.map(source=>({...structuredClone(source),source_id:source.known?source.source_id:null}))}:null;
  const segment_progress=s.phase==='COMBAT_EFFECTS'&&s.segment_progress?{phase:s.segment_progress.phase,status:s.segment_progress.status,
    events_after:s.segment_progress.events_after,index:s.segment_progress.index,total:s.segment_progress.total,
    visible_total:s.pending_combat.filter(r=>r.target_visible).length,visible_resolved:s.pending_combat.filter(r=>r.target_visible&&r.status==='RESOLVED').length}:structuredClone(s.segment_progress);
  const contactEvents=s.phase==='CONTACTS'&&s.segment_progress?getVisibleEvents(s,'friendly',s.segment_progress.events_after):[];
  const contact_review=s.phase==='CONTACTS'?{location:s.segment_progress?.contact??nextContact(s)?.location??null,next_location:nextContact(s)?.location??null,resolved:!!s.segment_progress,events:contactEvents}:null;
  return {id:s.id,scenario_id:s.scenario_id,status:s.status,seed:s.seed,turn:s.turn,turn_limit:s.turn_limit,phase:s.phase,phase_label:phaseInfo(s.phase)[1],phase_description:phaseDescription(s),combat_resolution,contact_review,
    historical_losses:getVisibleEvents(s).filter(e=>e.type==='FORMATION_LOST'),
    segment_progress,briefing:s.briefing,activity:s.activity,impulse:structuredClone(s.impulse),eligible_hqs:eligibleHQs(s),units,
    locations:values(s.locations).map(terrainProjection),
    mission_name:s.mission_name,objectives:s.objectives?Object.fromEntries(['primary','secondary','attack','ccp'].map(k=>[k,{location:s.objectives[k],...secureStatus(s,s.objectives[k])}])):null,achievements:structuredClone(s.achievements),
    contacts:values(s.contacts).filter(c=>!c.returning||s.knowledge.suspected[c.location]).map(c=>({id:c.id,location:c.location,type:c.type,resolved:c.resolved})),
    enemies:knownEnemy,suspected:spottingLocations(s),historical_reports:Object.keys(s.knowledge.suspected),
    fire:[...s.fire,...temporaryMortarFire(s)].filter(f=>friendly(s.units[f.source])||occupants(s,f.target).some(friendly)||s.knowledge.spotted[f.source]).map(f=>({...f,direction:f.direction?{dr:f.direction.dr,dc:f.direction.dc}:null,source:visible(s,s.units[f.source])?f.source:null,friendly:friendly(s.units[f.source])})),
    markers:s.markers.filter(m=>occupants(s,m.location).some(u=>friendly(u)||s.knowledge.spotted[u.id])).map(m=>({type:m.type,location:m.location,value:m.value,critical:!!m.critical,...(m.weapon?{weapon:m.weapon}:{})})),
    support:s.support.filter(f=>s.units[f.source]?.faction==='friendly'||occupants(s,f.location).some(friendly)||s.units[f.source]&&s.knowledge.spotted[f.source]).map(f=>({location:f.location,status:f.status,value:f.value,...(f.agency?{agency:f.agency.includes('mortar')?'mortar':'artillery',ammo:f.ammo??'HE'}:{})})),
    personnel:values(s.personnel),casualties:s.casualties.filter(c=>c.faction==='friendly').map(c=>({...structuredClone(c),label:`${c.origin_name??'Friendly formation'} casualty step`,carrier_name:c.carrier?s.units[c.carrier]?.name:null})),
    assets:s.assets.filter(a=>!a.destroyed&&a.faction==='friendly').map(a=>({...structuredClone(a),label:a.type==='RADIO'?`${a.net} radio`:`${String(a.key??'Equipment').replaceAll('_',' ')}${a.quantity>1?` ×${a.quantity}`:''}`,carrier_name:a.carrier?s.units[a.carrier]?.name:null})),
    deck:{draws:getVisibleEvents(s).filter(e=>e.type==='CARDS_DRAWN').reduce((n,e)=>n+e.card_ids.length,0)},
  };
}
export function getAfterActionReport(s) {
  if(s.status==='ACTIVE')return null;const events=getVisibleEvents(s);
  return {record_type:'AAR',ruleset:s.ruleset,rules_version:s.rules_version,scenario:s.scenario_id,scenario_version:s.scenario_version,seed:s.seed,setup:structuredClone(s.setup),achievements:structuredClone(s.achievements),score:s.achievements.reduce((n,a)=>n+a.points,0),outcome:s.status,turns:s.turn,events,orders:events.filter(e=>e.type==='COMMAND_ISSUED'),casualties:events.filter(e=>e.type==='CASUALTY'),
    formations:events.filter(e=>['FORMATION_CHANGED','FORMATION_RECONSTITUTED','HQ_RECONSTITUTED','COHESION_CHANGED','UNIT_CAPTURED'].includes(e.type)),objectives:events.filter(e=>['OBJECTIVE_CHECK','MISSION_ENDED'].includes(e.type))};
}
export function exportReplay(s) { return {ruleset:s.ruleset,rules_version:s.rules_version,scenario:s.scenario_id,version:s.scenario_version,seed:s.seed,setup:structuredClone(s.setup),operations:structuredClone(s.replay)}; }
function replayOperation(s,op) {
  if(op.op==='submitCommand')return submitCommand(s,op.command);
  if(op.op==='selectHQ')return selectHQ(s,op.id);
  if(op.op==='advancePhase')return advancePhase(s);
  if(op.op==='resolveCombat')return resolveCombat(s,op.id);
  if(op.op==='abortMission')return abortMission(s);
  throw new Error('Unknown replay operation');
}
export function replayMission(scenario,record) {
  if(record.scenario!==scenario.id||record.ruleset!==scenario.ruleset||record.version!==scenario.version||record.rules_version!==RULES_VERSION)
    throw new Error('Replay rules/scenario version mismatch. Preserve historical exports; use compareReplay for a diagnostic comparison.');
  let s=createMission(scenario,record.seed,record.setup??{});
  for(const [index,op] of record.operations.entries()) {
    const r=replayOperation(s,op);
    if(r.accepted===false||r.reason||r.state===s)throw new Error(`Replay operation ${index+1} rejected: ${r.reason??'mission already ended'}`);
    s=r.state;
  }return s;
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
