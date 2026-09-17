import { createRng } from '../rng.js';
import { values, live, good, friendly, expMod, visible, emit, newDeck, draw, result } from './core.js';
import { refresh, hasFire, combatModifier, observeRecord, occupants, incoming } from './battlefield.js';
import { submitCommand as order, commandOptions } from './actions.js';
import { resolveContacts, resolveCombat, enemyActivity, capture, retreat } from './combat.js';

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
const phaseInfo = id => PHASES.find(p=>p[0]===id);
const index = a => Object.fromEntries(a.map(v=>[v.id,structuredClone(v)]));
export function createMission(scenario,seed) {
  if(scenario.ruleset!=='company-v1'||!scenario.units.length||!scenario.locations.length)throw new TypeError('Invalid company scenario');
  const s={ruleset:'company-v1',scenario_id:scenario.id,scenario_version:scenario.version,id:`mission_${scenario.id}`,seed:String(seed),rng:createRng(seed),
    status:'ACTIVE',turn:1,turn_limit:scenario.turn_limit,phase:PHASES[0][0],briefing:scenario.briefing,locations:index(scenario.locations),units:{},contacts:index(scenario.contacts),
    events:[],replay:[],next_id:1,impulse:null,impulse_number:0,activated:[],completed:[],fire:[],support:[],markers:[],assets:[],casualties:[],prisoners:[],personnel:{},
    activity:'NO_CONTACT',knowledge:{spotted:{},suspected:{}},enemy_pool:{mg:3,squads:['A/S','A/S','A'],fox:2,trench:2,bunker:1},signal_phase_line:scenario.signal_phase_line};
  s.deck=newDeck(s);
  const surnames=['Miller','Davis','Wilson','Taylor','Anderson','Thomas','Moore','Martin','Jackson','Thompson','White','Harris','Clark','Lewis','Robinson','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Parker','Collins','Edwards','Stewart','Morris','Rogers','Reed','Cook','Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','Ramirez','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster','Gonzales','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Myers','Ford','Hamilton','Graham','Sullivan','Wallace','Woods','Cole','West','Jordan','Owens','Reynolds','Fisher','Ellis'];
  let person=0;
  for(const raw of scenario.units) {
    const u={...structuredClone(raw),cohesion:'GOOD',original_experience:raw.experience,named:raw.kind!=='SQUAD',pinned:false,exposed:false,cover:null,fire:null,indirect:null,
      saved:0,used:[],removed:null,assets:structuredClone(scenario.assets[raw.id]??{})};
    // Four named people per rifle step; command/weapon steps have two. No extra casualty roll.
    u.steps=Array.from({length:raw.steps},(_,n)=>({id:`${u.id}_step${n+1}`,personnel:Array.from({length:raw.kind==='SQUAD'?4:2},()=>{
      const id=`person_${++person}`;s.personnel[id]={id,name:`${String.fromCharCode(65+(person%26))}. ${surnames[(person-1)%surnames.length]}`,origin:u.id,status:'ACTIVE'};return id;
    })}));s.units[u.id]=u;
  }
  for(const l of values(s.locations)){l.covers=[];l.smoke=false;}
  emit(s,'MISSION_STARTED',scenario.briefing,{scenario:scenario.id,version:scenario.version,seed:String(seed)});
  emit(s,'PHASE_ENTERED',phaseInfo(s.phase)[1],{description:phaseInfo(s.phase)[2]});
  return s;
}
export function eligibleHQs(s) {
  return values(s.units).filter(u=>friendly(u)&&live(u)&&['HQ','STAFF'].includes(u.kind)&&!s.completed.includes(u.id)&&
    (s.phase==='SUBORDINATE_ACTIVATION'?u.id!=='co'&&s.activated.includes(u.id):
      s.phase==='PLATOON_INITIATIVE'?u.kind==='HQ'&&u.id!=='co'&&!s.activated.includes(u.id):
      s.phase==='STAFF_INITIATIVE'?u.kind==='STAFF'&&!s.activated.includes(u.id):false)).map(u=>u.id);
}
function startImpulse(s,id,activation=false) {
  const u=s.units[id];let allowance;
  if(id==='general')allowance=draw(s,1,'General initiative')[0].initiative;
  else if(u.kind==='STAFF'&&!activation)allowance=1;
  else {
    const card=draw(s,1,`${u.name}: ${activation?'activation':'initiative'}`)[0];
    const pressure=incoming(s,u).map(f=>f.value);
    if(s.support.some(f=>f.status==='ACTIVE'&&f.location===u.location))pressure.push(-3);
    const worst=pressure.length?Math.min(...pressure):null;
    const fireMod=worst===null||worst===2?0:worst===0?-1:worst===-1?-2:-3;
    allowance=Math.max(activation?1:0,(activation?card.activated:card.initiative)+expMod(u)+(u.pinned?-1:0)+(u.cover?1:0)+fireMod+(s.activity==='NO_CONTACT'?1:0));
  }
  s.impulse={id:`t${s.turn}_i${++s.impulse_number}`,hq:id,commands:allowance+(u?.saved??0),allowance,spent:0};
  if(u)u.saved=0;
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
  emit(s,'PHASE_ENTERED',phaseInfo(s.phase)[1],{description:phaseInfo(s.phase)[2]});
  if(s.phase==='CO_ACTIVATION'&&s.activated.includes('co'))startImpulse(s,'co',true);
  if(s.phase==='CO_INITIATIVE'&&!s.activated.includes('co')&&live(s.units.co))startImpulse(s,'co');
  if(s.phase==='GENERAL_INITIATIVE')startImpulse(s,'general');
}
export function selectHQ(state,id) {
  if(state.status!=='ACTIVE'||state.impulse||!eligibleHQs(state).includes(id))return {state,events:[],accepted:false,reason:'Choose an eligible HQ after completing the current impulse.'};
  const s=structuredClone(state);startImpulse(s,id,s.phase==='SUBORDINATE_ACTIVATION');s.replay.push({op:'selectHQ',id});return result(state,s,{accepted:true});
}
export function submitCommand(state,c) { return c.type==='SELECT_HQ'?selectHQ(state,c.unit_id):order(state,c); }
function endMission(s,status,text) { s.status=status;s.impulse=null;emit(s,'MISSION_ENDED',text,{outcome:status}); }
export function checkObjective(s) {
  const assault=values(s.units).some(u=>friendly(u)&&live(u)&&['SQUAD','LAT','MG','AT'].includes(u.kind));
  const unresolved=values(s.contacts).filter(c=>!c.resolved).length;
  const opposition=values(s.units).some(u=>!friendly(u)&&live(u));
  emit(s,'OBJECTIVE_CHECK',`${unresolved} contact markers remain; ${!opposition&&!unresolved?'all positions cleared':'continue the assault'}.`,{contacts_remaining:unresolved});
  if(!assault)endMission(s,'DEFEAT','Assault force lost.');
  else if(s.turn>=s.turn_limit)endMission(s,!opposition&&!unresolved?'SUCCESS':'DEFEAT',!opposition&&!unresolved?'Company assault complete: contacts cleared and defenders eliminated or captured.':'Turn limit reached before all contacts and defenders were cleared.');
}
export function advancePhase(state) {
  if(state.status!=='ACTIVE')return {state,events:[]};
  const s=structuredClone(state);s.replay.push({op:'advancePhase'});
  if(s.impulse){finishImpulse(s);if(eligibleHQs(s).length)return result(state,s);}
  if(eligibleHQs(s).length)return {state,events:[],reason:'Select each eligible HQ and complete its impulse before advancing.'};
  const phase=s.phase;
  if(['FRIENDLY_EVENTS','DEFENSIVE_EVENTS','DEFENSIVE_ACTIVITY','ENEMY_EVENTS','AT_COMBAT'].includes(phase))emit(s,'PHASE_SKIPPED',phaseInfo(phase)[2]);
  if(phase==='BN_ACTIVATION') {
    if(good(s.units.co)&&s.units.co.radios.includes('BN')){s.activated.push('co');emit(s,'HQ_ACTIVATED','Off-map Battalion HQ activated Company HQ over the BN radio net.',{hq:'co'});}
    else emit(s,'ACTIVATION_UNAVAILABLE','Company HQ cannot receive BN activation; it must use initiative.');
  }
  if(phase==='ENEMY_ACTIVITY')enemyActivity(s);
  if(phase==='CAPTURE')capture(s);
  if(phase==='RETREAT')retreat(s);
  if(phase==='FIRE_MISSIONS') {
    s.support=s.support.filter(f=>f.status==='PENDING');for(const f of s.support){f.status='ACTIVE';emit(s,'SUPPORT_ACTIVE',`Incoming fire active at ${s.locations[f.location].name}.`,{location:f.location,value:f.value});}refresh(s);
  }
  if(phase==='CONTACTS')resolveContacts(s);
  if(phase==='PINNED_RECOVERY')for(const u of values(s.units).filter(u=>live(u)&&u.pinned&&combatModifier(s,u)===null)){u.pinned=false;emit(s,'AUTOMATIC_RECOVERY',`${u.name} is free of fire and unpins.`,{actor:u.id},!visible(s,u));}
  if(phase==='COMBAT_EFFECTS')resolveCombat(s);
  if(phase==='CLEANUP') {
    s.markers=[];for(const l of values(s.locations))l.smoke=false;
    for(const u of values(s.units)){u.exposed=false;u.used=[];if(!friendly(u)&&u.fire&&!occupants(s,u.fire).some(friendly))u.fire=null;}
    for(const c of s.casualties.filter(c=>friendly(c)&&s.locations[c.location].staging&&!c.evacuated)){c.evacuated=true;emit(s,'CASUALTY_EVACUATED','A casualty step was evacuated from staging.',{step_id:c.step.id,personnel:c.step.personnel});}
    refresh(s);checkObjective(s);emit(s,'TURN_ENDED',`Turn ${s.turn} complete.`,{outcome:s.status});
    if(s.status==='ACTIVE'){s.turn++;s.activated=[];s.completed=[];s.phase=PHASES[0][0];enter(s);}
    return result(state,s);
  }
  if(phase!=='COMBAT_EFFECTS')refresh(s);
  s.phase=PHASES[PHASES.findIndex(p=>p[0]===phase)+1][0];enter(s);return result(state,s);
}
export function endTurn(state) {
  let s=state,guard=0;const turn=s.turn;
  while(s.status==='ACTIVE'&&s.turn===turn&&guard++<100) {
    if(!s.impulse&&eligibleHQs(s).length)s=selectHQ(s,eligibleHQs(s)[0]).state;
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
    personnel:u.steps.flatMap(v=>v.personnel),incoming:incoming(s,u).map(f=>({origin:f.origin,value:f.value,source:visible(s,s.units[f.source])?f.source:null})),
    combat:combatModifier(s,u),options:live(u)?commandOptions(s,u,issuerId):[]}));
  const knownEnemy=Object.values(s.knowledge.spotted).map(record=>structuredClone(record));
  return {id:s.id,status:s.status,seed:s.seed,turn:s.turn,turn_limit:s.turn_limit,phase:s.phase,phase_label:phaseInfo(s.phase)[1],phase_description:phaseInfo(s.phase)[2],
    briefing:s.briefing,activity:s.activity,impulse:structuredClone(s.impulse),eligible_hqs:eligibleHQs(s),units,
    locations:values(s.locations).map(l=>({...structuredClone(l),covers:l.covers.filter(c=>c.known).map(c=>structuredClone(c))})),
    contacts:values(s.contacts).filter(c=>!c.returning||s.knowledge.suspected[c.location]).map(c=>({id:c.id,location:c.location,type:c.type,resolved:c.resolved})),
    enemies:knownEnemy,suspected:Object.keys(s.knowledge.suspected),
    fire:s.fire.filter(f=>friendly(s.units[f.source])||occupants(s,f.target).some(friendly)||s.knowledge.spotted[f.source]).map(f=>({...f,source:visible(s,s.units[f.source])?f.source:null,friendly:friendly(s.units[f.source])})),
    support:s.support.map(f=>({location:f.location,status:f.status,value:f.value})),
    personnel:values(s.personnel),casualties:s.casualties.filter(c=>c.faction==='friendly').map(c=>structuredClone(c)),
    deck:{draws:getVisibleEvents(s).filter(e=>e.type==='CARDS_DRAWN').reduce((n,e)=>n+e.card_ids.length,0)},
  };
}
export function getAfterActionReport(s) {
  if(s.status==='ACTIVE')return null;const events=getVisibleEvents(s);
  return {outcome:s.status,turns:s.turn,events,orders:events.filter(e=>e.type==='COMMAND_ISSUED'),casualties:events.filter(e=>e.type==='CASUALTY'),
    formations:events.filter(e=>['FORMATION_CHANGED','FORMATION_RECONSTITUTED','HQ_RECONSTITUTED','COHESION_CHANGED','UNIT_CAPTURED'].includes(e.type)),objectives:events.filter(e=>['OBJECTIVE_CHECK','MISSION_ENDED'].includes(e.type))};
}
export function exportReplay(s) { return {ruleset:s.ruleset,scenario:s.scenario_id,version:s.scenario_version,seed:s.seed,operations:structuredClone(s.replay)}; }
export function replayMission(scenario,record) {
  if(record.scenario!==scenario.id||record.ruleset!==scenario.ruleset||record.version!==scenario.version)throw new Error('Replay rules/scenario version mismatch');
  let s=createMission(scenario,record.seed);
  for(const op of record.operations) {
    if(op.op==='submitCommand')s=submitCommand(s,op.command).state;
    else if(op.op==='selectHQ')s=selectHQ(s,op.id).state;
    else if(op.op==='advancePhase')s=advancePhase(s).state;
    else if(op.op==='abortMission')s=abortMission(s).state;
    else throw new Error('Unknown replay operation');
  }return s;
}
