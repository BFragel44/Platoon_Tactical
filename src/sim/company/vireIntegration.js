import {vireContent} from '../../scenarios/vireContent.js';
import {tinchebrayContent} from '../../scenarios/tinchebrayContent.js';
import {issueVehicleOrder} from './vehicleOrders.js';
import {synchronizeJeepPassengers} from './vehicleJeep.js';
import {checkVehicleMines,vehicleSmoke} from './vehicleHazards.js';
import {revealTerrain} from './missionKnowledge.js';
import {synchronizeVireATUnits,commitVireATAmmunition} from './vireUnits.js';
import {replayOperation} from './engine.js';
import {vehicleHQRecord,vehicleCommandAuthority} from './vehicleCommand.js';
// Experimental integration adapter, deliberately outside the live mission API.
// Uses authoritative company terrain, LOS, Action deck and HIT procedures.
import {spotAttempt} from './actions.js';
import {withdrawEmptyTank} from './vehicleFire.js';
import {vehicleConcentrateTargets,vehicleConcentrate} from './vehicleInfantryActions.js';
import {distance,los,unitLos,refresh,fireSource,chain,communication} from './battlefield.js';
import {live,good,draw,emit,randomNumber,pick} from './core.js';
import {applyHit,casualty,prepareCombat,resolvePreparedCombat} from './combat.js';
import {createVehicle,applyVehicleResult,finishVehicleCombatPhase,cleanupVehicleActivation} from './vehicleState.js';
import {atProfile,groundVehicleResult,resolveATFire,startVehiclePhase,vehiclePhaseOptions,beginVehicleAction,finishVehicleAction} from './vehicleCombat.js';
import {beginVehicleMove,stepVehicleMove,stopVehicleMove} from './vehicleMovement.js';
import {embarkInfantry,disembarkInfantry,exposePassengersForCombat,storePassengersAfterCombat} from './vehicleTransport.js';
import {transferVehicleCargo} from './vehicleCargo.js';
export const VIRE_ADAPTER_VERSION=15;
export const TINCHEBRAY_ADAPTER_VERSION=4;
export const VIRE_ADAPTER_BASE_RULES_VERSION=35;
export function initializeVireAdapter(base,deployments){
 if(base.rules_version!==VIRE_ADAPTER_BASE_RULES_VERSION)throw new Error('Incompatible vehicle adapter base rules.');
 const s=structuredClone(base);s.vire_runtime={version:VIRE_ADAPTER_VERSION,vehicles:{},pending_hits:[],operations:[],applied:[]};
 const stepIds=new Set(Object.values(s.units).flatMap(u=>u.steps.map(step=>step.id)));
 for(const deployment of deployments){
  if(s.units[deployment.id]||s.vire_runtime.vehicles[deployment.id]||!s.locations[deployment.location])throw new Error('Invalid Vire vehicle deployment.');
  const p=atProfile(deployment.profile);
  const v=p.target_type==='V'?createVehicle(deployment):{...structuredClone(deployment),crew:[],passengers:[],cargo:[],transported_casualties:[],applied_results:[],status:'ACTIVE',pinned:false,activated:!!deployment.activated,moved_fired:false};
  if(!Number.isInteger(v.ammo)||v.ammo<0||!['friendly','enemy'].includes(v.faction))throw new Error('Invalid AT deployment.');
  v.initial_resources={ammo:v.ammo,radios:structuredClone(deployment.radios??[])};
  v.name=deployment.name??deployment.id;v.command_role=deployment.command_role??null;v.saved=0;v.experience=deployment.experience??'Line';v.command_hq=deployment.command_hq??null;v.radios=deployment.radios??[];
  for(const step of v.crew){if(stepIds.has(step.id))throw new Error('Duplicate deployed step identity.');stepIds.add(step.id);}
  s.vire_runtime.vehicles[v.id]=v;
 }
 synchronizeVireATUnits(s);
 s.vire_runtime.initial_state=structuredClone(s);return s;
}
export function enterVireVehiclePhase(s){s.vire_runtime.basic_fire_enabled=true;refresh(s);synchronizeGroups(s);}
export function prepareVireInfantryCombat(s){
 const rt=s.vire_runtime;
 if(!rt.phase_complete||rt.infantry_combat_prepared)throw new Error('Vehicle phase must complete before preparing infantry combat once.');
 for(const v of Object.values(rt.vehicles).filter(v=>v.status==='ACTIVE'&&s.markers.some(m=>m.type==='MINES'&&m.target===v.id)))resolveVehicleVOF(s,v,`mine_${s.turn}_${v.id}`,{mineOnly:true});
 exposePassengersForCombat(s);if(rt.basic_fire_enabled)refresh(s);const resolutions=prepareCombat(s);
 if(rt.basic_fire_enabled)for(const v of Object.values(rt.vehicles))if(v.status==='ACTIVE'&&s.fire.some(f=>f.source===v.id)){v.ammo--;withdrawEmptyTank(s,v);}
 storePassengersAfterCombat(s);rt.infantry_combat_prepared=true;return resolutions;
}
export function resolveVireInfantryCombat(s,id){exposePassengersForCombat(s);resolvePreparedCombat(s,id);storePassengersAfterCombat(s);}
export function cleanupVireVehicles(s){
 const rt=s.vire_runtime;
 if(!rt.phase_complete||s.pending_combat?.some(r=>r.status==='PENDING'))throw new Error('Complete vehicle and infantry combat before cleanup.');
 for(const v of Object.values(rt.vehicles)){rt.vehicles[v.id]=cleanupVehicleActivation(v);rt.vehicles[v.id].action_taken=false;rt.vehicles[v.id].moved_before_fire=false;}
 rt.coordinator=null;rt.end_vof=null;rt.phase_complete=false;rt.move=null;rt.reaction=null;rt.infantry_combat_prepared=false;
}
function activeVehicle(s,id){const v=s.vire_runtime.vehicles[id];if(!v||v.status!=='ACTIVE')throw new Error('Vehicle unavailable.');return v;}
function legalTargets(s,firer){if(s.locations[firer.location]?.staging)return [];return Object.values(s.vire_runtime.vehicles).filter(t=>t.status==='ACTIVE'&&!s.locations[t.location]?.staging&&atProfile(t.profile).target_type==='V'&&t.faction!==firer.faction&&(t.faction==='friendly'||s.knowledge.spotted[t.id])&&(firer.source_unit?unitLos(s,s.units[firer.source_unit],{...t,steps:t.crew,cohesion:'GOOD',cover:null},3):los(s,firer.location,t.location,3))&&atProfile(firer.profile).gunnery[distance(s.locations[firer.location],s.locations[t.location])]!==null);}
function canVehicleFire(v){return atProfile(v.profile).group!=='TANK'||!v.passengers.length&&!v.transported_casualties.length;}
function openReactions(s,actor){
 const v=s.vire_runtime.vehicles[actor];
 s.vire_runtime.reaction=v?.status==='ACTIVE'&&atProfile(v.profile).target_type==='V'?{actor,eligible:Object.values(s.vire_runtime.vehicles).filter(u=>u.status==='ACTIVE'&&!u.moved_fired&&u.ammo>0&&canVehicleFire(u)&&legalTargets(s,u).some(t=>t.id===actor)).map(u=>u.id)}:null;
}
function synchronizeGroups(s){
 synchronizeJeepPassengers(s);
 synchronizeVireATUnits(s);
 const rt=s.vire_runtime;
 if(!rt.coordinator){
  for(const v of Object.values(rt.vehicles))if(v.faction==='enemy'&&v.status==='ACTIVE'&&(['PAK40','FLAK88','PANZERSCHRECK'].includes(v.profile)||['PANZERFAUST','INFANTRY_GUN75'].includes(v.profile)&&Object.values(rt.vehicles).some(t=>t.faction==='friendly'&&t.status==='ACTIVE'&&!s.locations[t.location]?.staging&&atProfile(t.profile).target_type==='V'&&t.location===v.location)))v.activated=true;
  rt.coordinator=startVehiclePhase(Object.values(rt.vehicles));
 }
 for(const entry of rt.coordinator.entries){const unit=rt.vehicles[entry.id];entry.activated=unit.status==='ACTIVE'&&unit.activated&&(entry.group!=='AT'||unit.ammo>0&&legalTargets(s,unit).length>0);entry.moved_fired=unit.moved_fired;}
 while(!rt.coordinator.pending&&rt.coordinator.group<rt.coordinator.groups.length&&!rt.coordinator.entries.some(e=>e.group===rt.coordinator.groups[rt.coordinator.group]&&e.activated&&!e.moved_fired)){rt.coordinator.group++;rt.coordinator.next_side='friendly';}
 return rt.coordinator;
}
function startOrderedAction(s,id){
 const c=synchronizeGroups(s);
 if(c.pending)throw new Error('Finish the current vehicle action and its reactions first.');
 s.vire_runtime.coordinator=beginVehicleAction(c,id);
}
function finishOrderedAction(s){
 const rt=s.vire_runtime;
 if(rt.disembark&&!rt.vehicles[rt.disembark.vehicle].passengers.some(step=>rt.disembark.units.includes(step.origin_formation)))rt.disembark=null;
 if(!rt.coordinator?.pending||rt.disembark||rt.pending_fire||rt.quick||rt.reaction?.eligible.length||rt.pending_hits.some(h=>!h.resolved)||rt.move&&!rt.move.complete)return;
 rt.vehicles[rt.coordinator.pending.actor].action_taken=true;
 const c=synchronizeGroups(s);c.pending.stage='COMPLETE';rt.coordinator=finishVehicleAction(c);synchronizeGroups(s);
}
function placeStep(s,v,step,{cohesion='F',cover=null}={}){
 const id=`vehicle_team_${s.next_id++}`;
 const u={id,name:`${v.id} crew / passenger`,kind:'LAT',faction:v.faction,location:v.location,cover,steps:[structuredClone(step)],max_steps:1,cohesion,experience:step.experience??'Green',original_experience:step.experience??'Green',vof:'S',range:1,pinned:false,exposed:true,radios:[],assets:{},ammo:{},used:[],saved:0,fire:null,removed:null,named:false};
 s.units[id]=u;if(v.faction==='enemy'&&s.knowledge.spotted[v.id])s.knowledge.spotted[id]={id};return u;
}
function installOutcome(s,target,outcome){
 const rt=s.vire_runtime;
  if(rt.move?.vehicle.id===target.id&&!rt.move.complete&&outcome.vehicle.status!=='ACTIVE'){
   rt.move={...rt.move,vehicle:structuredClone(outcome.vehicle),stage:'COMPLETE',complete:true};
   emit(s,'VEHICLE_MOVE_INTERRUPTED','Vehicle movement ended by AT fire.',{actor:target.id,status:outcome.vehicle.status},target.faction==='enemy'&&!s.knowledge.spotted[target.id]);
  }
 if(target.profile==='JEEP'&&['BREWED_UP','KNOCKED_OUT','RETREATED'].includes(outcome.vehicle.status))for(const u of Object.values(s.units).filter(u=>u.embarked_on===target.id)){u.steps=[];u.removed=outcome.vehicle.status;u.embarked_on=null;u.fire=null;delete rt.embarked_formations[u.id];}
   if(outcome.wreck?.provides_cover)s.locations[target.location].covers.push({...outcome.wreck,value:1,known:true,discovered:true});
   else if(outcome.wreck){s.markers.push({...outcome.wreck,type:'BURNING_WRECK'});s.locations[target.location].smoke=true;}
   for(const step of outcome.casualties){const unit=placeStep(s,target,step);unit.steps=[];casualty(s,unit,step);unit.removed='CASUALTY';}
   for(const team of outcome.fire_teams){const unit=placeStep(s,target,team,{cohesion:team.cohesion??'F',cover:team.cover});for(const hit of outcome.pending_hits.filter(h=>h.step_id===team.id))rt.pending_hits.push({...hit,unit_id:unit.id});}
   s.assets.push(...outcome.dropped_assets.map(a=>({...a,location:target.location,area:target.area??null,cover:null,carrier:null})));
   for(const c of outcome.dropped_casualties){const original=s.casualties.find(v=>v.id===c.id);if(original)Object.assign(original,{location:target.location,area:target.area??null,cover:null,carrier:null});else s.casualties.push({...c,carrier:null});}
   for(const item of outcome.lost_items){rt.lost_loads??=[];rt.lost_loads.push({...structuredClone(item),vehicle:target.id,reason:outcome.vehicle.status});const c=s.casualties.find(c=>c.id===item.id);if(c){c.carrier=null;c.location=null;c.unavailable='LOST_IN_VEHICLE';}}
   if(outcome.vehicle.status==='RETREATED')for(const c of s.casualties.filter(c=>c.carrier===target.id)){c.location=null;c.unavailable='VEHICLE_RETREAT';}
}
function completePhase(s){
 const rt=s.vire_runtime;for(const v of Object.values(rt.vehicles))rt.vehicles[v.id]=finishVehicleCombatPhase(v);rt.phase_complete=true;
}
function resolveVehicleVOF(s,vehicle,id,{moving=false,mineOnly=false}={}){
 const operation={id},hidden=vehicle.faction==='enemy'&&!s.knowledge.spotted[vehicle.id];
   const candidates=[];
   for(const f of s.fire.filter(f=>!mineOnly&&f.target===vehicle.location)){
    const source=fireSource(s,f.source),kind=source?.kind,vof=source?.vof;
    if(source?.faction===vehicle.faction)continue;
    if((kind==='VEHICLE'||kind==='FLAK88'||source?.at_profile)&&['A','H','A+'].includes(vof))continue;
    candidates.push({modifier:(f.indirect?-1+(s.locations[vehicle.location].burst??0):f.value===2?4:f.value<=-3?1:f.value===-1?2:3)+(f.indirect?0:vehicleSmoke(s,vehicle.location))});
   }
   for(const f of s.support.filter(f=>!mineOnly&&f.location===vehicle.location&&f.status==='ACTIVE'))candidates.push({modifier:-1+(s.locations[vehicle.location].burst??0)});
   for(const marker of s.markers.filter(m=>m.target===vehicle.id&&m.location===vehicle.location))if(marker.type==='MINES'||!mineOnly&&marker.type==='SNIPER'&&s.units[marker.source]?.fire===vehicle.location&&!s.units[marker.source]?.pinned)candidates.push({modifier:marker.type==='SNIPER'?1+vehicleSmoke(s,vehicle.location):-2});
   if(candidates.length){
    const c=draw(s,1,'VOF against vehicle',hidden)[0],modifier=Math.min(...candidates.map(c=>c.modifier))+atProfile(vehicle.profile).defense+(s.locations[vehicle.location].protection??0)+(moving?1:0)-(vehicle.pinned?1:0);
    const outcome=applyVehicleResult(vehicle,{id:operation.id,result:groundVehicleResult(Number(c.at)+modifier)});
    installOutcome(s,vehicle,outcome);
    s.vire_runtime.vehicles[vehicle.id]=outcome.vehicle;
    emit(s,'VEHICLE_VOF_RESOLVED','Vehicle VOF resolved.',{actor:vehicle.id,card_id:c.id,modifier,result:groundVehicleResult(Number(c.at)+modifier)},hidden);
    s.markers=s.markers.filter(m=>!(m.target===vehicle.id&&m.location===vehicle.location&&['MINES','SNIPER'].includes(m.type)));
   }
}
export function applyVireOperation(state,operation){
 if(state.vire_runtime?.version!==VIRE_ADAPTER_VERSION)throw new Error('Incompatible Vire adapter record.');
 if(!operation.id||state.vire_runtime.applied.includes(operation.id))throw new Error('Duplicate or missing Vire operation identity.');
 if(operation.type==='AUTO_ENEMY_AT_ACTION'){
  const chosen=structuredClone(state);const c=synchronizeGroups(chosen);
  const eligible=c?vehiclePhaseOptions(c).map(id=>chosen.vire_runtime.vehicles[id]).filter(v=>v.faction==='enemy'&&v.source_unit):[];
  const firer=eligible.length?pick(chosen,eligible,'Enemy AT activation order',true):null;
  if(!firer)throw new Error('No eligible enemy AT action.');
  const targets=legalTargets(chosen,firer),target=targets.length?pick(chosen,targets,'Enemy AT target selection',true):null;
  if(!target)throw new Error('No legal enemy AT target.');
  const result=applyVireOperation(chosen,{...operation,type:'AT_FIRE',firer:firer.id,target:target.id});result.vire_runtime.operations[result.vire_runtime.operations.length-1]=structuredClone(operation);return result;
 }
 if(operation.type==='ENGINE_OPERATION'){
  if(!state.vire_runtime.normal_phase_enabled)throw new Error('Enable normal phase integration first.');
  const r=replayOperation(state,operation.operation);
  if(r.accepted===false||r.reason||r.state===state)throw new Error(r.reason??'Engine operation rejected.');
  const rt=r.state.vire_runtime,record=rt.operations.at(-1);
  if(record?.type!=='ENGINE_OPERATION')throw new Error('Engine operation did not record a transition.');
  rt.applied[rt.applied.length-1]=operation.id;rt.operations[rt.operations.length-1]=structuredClone(operation);return r.state;
 }
 if(state.vire_runtime.normal_phase_enabled&&['PREPARE_INFANTRY_COMBAT','RESOLVE_INFANTRY_COMBAT','AUTO_ENEMY_INFANTRY_COMBAT','CLEANUP_VEHICLES'].includes(operation.type))throw new Error('Use normal phase and Combat Effects controls for this procedure.');
 if(operation.type==='AUTO_ENEMY_INFANTRY_COMBAT'){
  const pending=state.pending_combat?.find(r=>r.status==='PENDING'&&r.target_faction==='enemy');
  if(!pending)throw new Error('No pending enemy infantry combat.');
  const result=applyVireOperation(state,{...operation,type:'RESOLVE_INFANTRY_COMBAT',resolution:pending.id});result.vire_runtime.operations[result.vire_runtime.operations.length-1]=structuredClone(operation);return result;
 }
 if(operation.type==='AUTO_ENEMY_HIT'){
  const pending=state.vire_runtime.pending_hits.find(h=>!h.resolved&&state.units[h.unit_id]?.faction==='enemy');
  if(!pending)throw new Error('No pending enemy crew procedure.');
  const result=applyVireOperation(state,{...operation,type:'RESOLVE_CREW_HIT',hit:pending.id});result.vire_runtime.operations[result.vire_runtime.operations.length-1]=structuredClone(operation);return result;
 }
 if(operation.type==='AUTO_ENEMY_REACTION'){
  const chosen=structuredClone(state),rt=chosen.vire_runtime;
  const firer=rt.quick&&rt.vehicles[rt.quick.firer].faction==='enemy'?rt.vehicles[rt.quick.firer]:rt.vehicles[rt.reaction?.eligible.find(id=>rt.vehicles[id].faction==='enemy')];
  if(!firer||rt.quick&&rt.quick.firer!==firer.id)throw new Error('No pending automatic enemy fire.');
  const targets=rt.quick?legalTargets(chosen,firer):[rt.vehicles[rt.reaction.actor]],target=targets[randomNumber(chosen,targets.length,'Enemy AT target selection',true)-1];
  if(!target)throw new Error('No legal enemy AT target.');
  const result=applyVireOperation(chosen,{...operation,type:rt.quick?'QUICK_SHOT':'REACTION_FIRE',firer:firer.id,target:target.id});result.vire_runtime.operations[result.vire_runtime.operations.length-1]=structuredClone(operation);return result;
 }
 const s=structuredClone(state);synchronizeJeepPassengers(s);synchronizeVireATUnits(s);const runtime=s.vire_runtime;
 if(operation.type!=='RESOLVE_CREW_HIT'&&runtime.pending_hits.some(h=>!h.resolved))throw new Error('Resolve immediate crew HITs before another operation.');
 if(['VEHICLE_RALLY','VEHICLE_CEASE_FIRE','VEHICLE_SHIFT_FIRE'].includes(operation.type)){
  issueVehicleOrder(s,operation);
 }else if(operation.type==='ENABLE_NORMAL_PHASES'){
  if(runtime.normal_phase_enabled||runtime.coordinator||s.pending_combat?.some(r=>r.status==='PENDING')||s.status!=='ACTIVE'||['COMBAT_EFFECTS','CLEANUP'].includes(s.phase))throw new Error('Normal integration must begin before the vehicle phase/combat snapshot.');
  runtime.normal_phase_enabled=true;runtime.basic_fire_enabled=true;
  if(s.phase==='AT_COMBAT')enterVireVehiclePhase(s);
 }else if(operation.type==='ACTIVATE_VEHICLE_HQ'){
  const target=vehicleHQRecord(s,operation.vehicle),i=s.impulse,issuer=s.units[i?.hq];
  if(!runtime.normal_phase_enabled||!['CO_ACTIVATION','CO_INITIATIVE'].includes(s.phase)||!target||target.faction!=='friendly'||s.activated.includes(target.id)||!i||i.commands<1||i.spent>=4||!good(issuer)||!vehicleCommandAuthority(s,issuer,runtime.vehicles[target.id]))throw new Error('Company HQ cannot activate this vehicle platoon HQ.');
  i.commands--;i.spent++;s.activated.push(target.id);emit(s,'HQ_ACTIVATED',`${target.name} activated over the BN radio network.`,{hq:target.id,issuer:issuer.id});
 }else if(operation.type==='REFRESH_VEHICLE_FIRE'){
  if(s.pending_combat?.some(r=>r.status==='PENDING'))throw new Error('Resolve the prepared combat snapshot first.');
  runtime.basic_fire_enabled=true;refresh(s);
 }else if(operation.type==='PREPARE_INFANTRY_COMBAT'){
  if(s.phase!=='COMBAT_EFFECTS'||!runtime.phase_complete||runtime.infantry_combat_prepared||s.pending_combat?.some(r=>r.status==='PENDING'))throw new Error('Infantry combat preparation unavailable.');
  exposePassengersForCombat(s);if(runtime.basic_fire_enabled)refresh(s);prepareCombat(s);
  if(runtime.basic_fire_enabled)for(const v of Object.values(runtime.vehicles))if(v.status==='ACTIVE'&&s.fire.some(f=>f.source===v.id)){v.ammo--;withdrawEmptyTank(s,v);}
  storePassengersAfterCombat(s);runtime.infantry_combat_prepared=true;
 }else if(operation.type==='RESOLVE_INFANTRY_COMBAT'){
  if(s.phase!=='COMBAT_EFFECTS'||!runtime.infantry_combat_prepared)throw new Error('Infantry combat resolution unavailable.');
  exposePassengersForCombat(s);resolvePreparedCombat(s,operation.resolution);storePassengersAfterCombat(s);
 }else if(['EMBARK_INFANTRY','TRANSFER_VEHICLE_LOAD'].includes(operation.type)){
  const v=activeVehicle(s,operation.vehicle),i=s.impulse,u=s.units[i?.hq]??vehicleHQRecord(s,i?.hq);
  if(atProfile(v.profile).target_type!=='V')throw new Error('Select a ground vehicle for loading.');
  const commandPhases=['CO_ACTIVATION','SUBORDINATE_ACTIVATION','CO_INITIATIVE','PLATOON_INITIATIVE','STAFF_INITIATIVE','GENERAL_INITIATIVE'];
  if(runtime.coordinator||!commandPhases.includes(s.phase)||!i||i.commands<1||(i.hq!=='general'&&i.spent>=4)||v.faction!=='friendly')throw new Error('Embark command unavailable.');
  if(i.hq!=='general'&&!(good(u)&&vehicleCommandAuthority(s,u,v)))throw new Error('No authorized vehicle radio command link.');
  let loaded=operation.type==='TRANSFER_VEHICLE_LOAD'?transferVehicleCargo(s,v,operation):v;
  if(operation.type==='EMBARK_INFANTRY'||operation.units?.length)loaded=embarkInfantry(s,loaded,operation.units);
  if(operation.type==='TRANSFER_VEHICLE_LOAD'&&!['load_assets','unload_assets','load_casualties','unload_casualties','units'].some(key=>operation[key]?.length))throw new Error('Select a load to transfer.');
  runtime.vehicles[v.id]=loaded;i.commands--;i.spent++;
  emit(s,operation.type==='EMBARK_INFANTRY'?'INFANTRY_EMBARKED':'VEHICLE_LOAD_TRANSFERRED','Vehicle load order completed.',{actor:v.id,formations:operation.units??[],issuer:i.hq});
 }else if(operation.type==='VEHICLE_CONCENTRATE'){
  const v=activeVehicle(s,operation.vehicle),target=s.units[operation.target];
  if(s.phase!=='AT_COMBAT'||!runtime.basic_fire_enabled||runtime.phase_complete||runtime.end_vof||runtime.quick||runtime.reaction?.eligible.length||runtime.move&&!runtime.move.complete||runtime.disembark||v.faction!=='friendly'||v.pinned||!canVehicleFire(v)||v.ammo<1||!atProfile(v.profile).vof||!vehicleConcentrateTargets(s,v).some(t=>t.id===target?.id))throw new Error('Vehicle concentrated fire requires a known infantry target under its established VOF.');
  startOrderedAction(s,v.id);resolveVehicleVOF(s,v,operation.id);
  const current=runtime.vehicles[v.id];
  if(current.status==='ACTIVE'&&!current.pinned)vehicleConcentrate(s,current,target);
  else emit(s,'VEHICLE_ACTION_INTERRUPTED','Vehicle concentrated fire interrupted by pre-action VOF.',{actor:v.id});
  current.moved_fired=true;openReactions(s,v.id);
 }else if(operation.type==='VEHICLE_SPOT'){
  const v=activeVehicle(s,operation.vehicle),target=s.locations[operation.location];
  if(s.phase!=='AT_COMBAT'||runtime.phase_complete||runtime.end_vof||runtime.quick||runtime.reaction?.eligible.length||runtime.move&&!runtime.move.complete||runtime.disembark||atProfile(v.profile).target_type!=='V'||v.faction!=='friendly'||v.pinned)throw new Error('Vehicle spotting action unavailable.');
  if(!target||!los(s,v.location,target.id,3))throw new Error('Select a card within vehicle LOS.');
  startOrderedAction(s,v.id);resolveVehicleVOF(s,v,operation.id);
  const current=runtime.vehicles[v.id];
  if(current.status==='ACTIVE'&&!current.pinned){
   const impulse=s.impulse;s.impulse=null;
   try{spotAttempt(s,{...current,name:v.name??v.id,kind:'VEHICLE',cover:null,steps:v.crew.length?v.crew:v.passengers},target.id);}finally{s.impulse=impulse;}
  }else emit(s,'VEHICLE_ACTION_INTERRUPTED','Vehicle spotting interrupted by pre-action VOF.',{actor:v.id},v.faction==='enemy');
  current.moved_fired=true;openReactions(s,v.id);
 }else if(operation.type==='PREPARE_DISEMBARK_INFANTRY'){
  const v=activeVehicle(s,operation.vehicle);
  if(s.phase!=='AT_COMBAT'||runtime.phase_complete||runtime.end_vof||runtime.quick||runtime.reaction?.eligible.length||runtime.disembark||runtime.move&&!runtime.move.complete||!Array.isArray(operation.units)||!operation.units.length||new Set(operation.units).size!==operation.units.length||operation.units.some(id=>!v.passengers.some(step=>step.origin_formation===id)))throw new Error('Stationary disembark action unavailable.');
  startOrderedAction(s,v.id);runtime.disembark={vehicle:v.id,units:[...operation.units]};
  resolveVehicleVOF(s,v,operation.id);openReactions(s,v.id);
 }else if(operation.type==='DISEMBARK_INFANTRY'){
  const m=runtime.move,v=activeVehicle(s,operation.vehicle);
  const stationary=runtime.disembark?.vehicle===v.id;
  if(s.phase!=='AT_COMBAT'||!stationary&&(!m||m.complete||m.vehicle.id!==v.id||m.stage!=='REACTION'||m.index!==m.path.length-1)||runtime.quick||runtime.reaction?.eligible.length)throw new Error('Complete movement VOF and reactions before disembarking.');
  if(stationary&&(!Array.isArray(operation.units)||operation.units.length!==runtime.disembark.units.length||operation.units.some(id=>!runtime.disembark.units.includes(id))))throw new Error('Complete the selected stationary disembark action.');
  runtime.vehicles[v.id]=disembarkInfantry(s,v,operation.units,operation.covers);
  if(stationary){runtime.disembark=null;runtime.vehicles[v.id].moved_fired=true;}else m.vehicle=structuredClone(runtime.vehicles[v.id]);
  emit(s,'INFANTRY_DISEMBARKED','Infantry disembarked exposed after movement.',{actor:v.id,formations:[...operation.units]});
 }else if(operation.type==='ACTIVATE_VEHICLE'){
  const v=activeVehicle(s,operation.vehicle),i=s.impulse,u=s.units[i?.hq]??vehicleHQRecord(s,i?.hq);
  if(atProfile(v.profile).target_type==='I'&&v.pinned)throw new Error('Pinned AT infantry cannot activate.');
  if(runtime.normal_phase_enabled&&!['CO_ACTIVATION','SUBORDINATE_ACTIVATION','CO_INITIATIVE','PLATOON_INITIATIVE','STAFF_INITIATIVE','GENERAL_INITIATIVE'].includes(s.phase)||runtime.coordinator||!i||i.commands<1||(i.hq!=='general'&&i.spent>=4)||v.faction!=='friendly'||v.activated||v.moved_fired)throw new Error('Vehicle activation unavailable.');
  const general=i.hq==='general';
  const eligible=u&&good(u)&&(v.source_unit?chain(u,s.units[v.source_unit],'ACTIVATE')&&communication(s,u,s.units[v.source_unit]):vehicleCommandAuthority(s,u,v));
  if(!general&&!eligible)throw new Error('No authorized vehicle radio command link.');
  i.commands--;i.spent++;v.activated=true;
  emit(s,'VEHICLE_ACTIVATED',`${v.id} activated for movement / AT combat.`,{actor:v.id,issuer:i.hq});
 }else if(operation.type==='START_AT_PHASE'){
  if(s.phase!=='AT_COMBAT'||runtime.coordinator)throw new Error('Vehicle phase already started or unavailable.');
  synchronizeGroups(s);
 }else if(['AT_FIRE','MOVE_AT_FIRE','REACTION_FIRE','QUICK_SHOT'].includes(operation.type)){
  if(s.phase!=='AT_COMBAT'||runtime.phase_complete||runtime.end_vof)throw new Error('AT fire requires the active vehicle phase.');
  const firer=activeVehicle(s,operation.firer),target=activeVehicle(s,operation.target);
  if(!canVehicleFire(firer))throw new Error('Tank passengers and casualties must disembark before combat.');
  const reaction=operation.type==='REACTION_FIRE',quick=operation.type==='QUICK_SHOT',moveFire=operation.type==='MOVE_AT_FIRE',rtBefore=s.vire_runtime;
  if(moveFire&&(!rtBefore.move||rtBefore.move.complete||rtBefore.move.stage!=='REACTION'||rtBefore.move.vehicle.id!==firer.id||atProfile(firer.profile).move_fire===null||rtBefore.pending_fire))throw new Error('Move then fire unavailable.');
  if(!reaction&&!quick&&!moveFire&&rtBefore.move&&!rtBefore.move.complete)throw new Error('Finish the pending move first.');
  if(reaction&&(!rtBefore.reaction?.eligible.includes(firer.id)||rtBefore.reaction.actor!==target.id||rtBefore.quick))throw new Error('Reaction unavailable.');
  if(quick&&rtBefore.quick?.firer!==firer.id)throw new Error('Quick Shot unavailable.');
  if(!reaction&&!quick&&(rtBefore.quick||rtBefore.reaction?.eligible.length))throw new Error('Resolve pending fire decisions first.');
  if((!reaction&&!quick&&!firer.activated)||firer.moved_fired||!legalTargets(s,firer).some(t=>t.id===target.id))throw new Error('AT target/activation/LOS unavailable.');
  if(moveFire){rtBefore.move={...rtBefore.move,stage:'COMPLETE',complete:true};firer.moved_before_fire=true;}
  if(!reaction&&!quick&&!moveFire){
   if(rtBefore.pending_fire){if(rtBefore.pending_fire.firer!==firer.id||rtBefore.pending_fire.target!==target.id)throw new Error('Resume the pending vehicle fire first.');rtBefore.pending_fire=null;}
   else{
    startOrderedAction(s,firer.id);
    if(atProfile(firer.profile).target_type==='V'){
     resolveVehicleVOF(s,firer,`${operation.id}:before`);
     if(rtBefore.vehicles[firer.id].status!=='ACTIVE'||rtBefore.pending_hits.some(h=>!h.resolved)){
      if(rtBefore.vehicles[firer.id].status==='ACTIVE')rtBefore.pending_fire={firer:firer.id,target:target.id};
      finishOrderedAction(s);rtBefore.applied.push(operation.id);rtBefore.operations.push(structuredClone(operation));return s;
     }
    }
   }
  }
  const currentFirer=s.vire_runtime.vehicles[firer.id];
  const shot={firer:firer.profile,target:target.profile,range:distance(s.locations[firer.location],s.locations[target.location]),terrain:(s.locations[target.location].protection??0)+vehicleSmoke(s,target.location),moved:!!currentFirer.moved_before_fire,movingTarget:rtBefore.move?.stage==='REACTION'&&rtBefore.move.vehicle.id===target.id,firerPinned:currentFirer.pinned,targetPinned:target.pinned,ambushSusceptible:target.ambush_susceptible,supportedByInfantry:Object.values(s.units).some(u=>good(u)&&u.faction===target.faction&&u.location===target.location&&!['HQ','STAFF','FO'].includes(u.kind)),experience:firer.experience};
  const fired=resolveATFire(s,shot,{ammo:firer.ammo,shotId:operation.id,firerId:firer.id,targetId:target.id,hidden:firer.faction==='enemy'&&!s.knowledge.spotted[firer.source_unit??firer.id]});
  Object.assign(s,fired.state);const rt=s.vire_runtime;rt.vehicles[firer.id].ammo=fired.ammo;commitVireATAmmunition(s,rt.vehicles[firer.id]);withdrawEmptyTank(s,rt.vehicles[firer.id]);
  if(fired.shot.result!=='FAILED_ATTEMPT'){
   const outcome=applyVehicleResult(rt.vehicles[target.id],{id:operation.id,result:fired.shot.result});rt.vehicles[target.id]=outcome.vehicle;
   installOutcome(s,target,outcome);
  }
  const reacting=reaction||quick&&rtBefore.quick.reaction;
  rt.vehicles[firer.id].moved_fired=reacting?!fired.shot.quick_shot_draw:!fired.shot.quick_shot;
  rt.quick=fired.shot.quick_shot&&legalTargets(s,rt.vehicles[firer.id]).length?{firer:firer.id,reaction:!!reacting}:null;
  if(!rt.quick&&!reacting){rt.vehicles[firer.id].moved_fired=true;openReactions(s,firer.id);}
  if(reacting&&!rt.quick)rt.reaction.eligible=rt.reaction.eligible.filter(id=>id!==firer.id);
 }else if(operation.type==='DECLINE_QUICK_SHOT'){
  if(!runtime.quick)throw new Error('No pending Quick Shot.');
  if(runtime.vehicles[runtime.quick.firer].faction==='enemy')throw new Error('Enemy Quick Shot continuation is mandatory.');
  const q=runtime.quick;runtime.quick=null;
  if(q.reaction)runtime.reaction.eligible=runtime.reaction.eligible.filter(id=>id!==q.firer);
  else{runtime.vehicles[q.firer].moved_fired=true;openReactions(s,q.firer);}
 }else if(operation.type==='DECLINE_REACTION'){
  const v=activeVehicle(s,operation.firer);
  if(v.faction!=='friendly'||runtime.quick||!runtime.reaction?.eligible.includes(v.id))throw new Error('Friendly reaction decision unavailable.');
  runtime.reaction.eligible=runtime.reaction.eligible.filter(id=>id!==v.id);
 }else if(operation.type==='RESOLVE_CREW_HIT'){
  const pending=runtime.pending_hits.find(h=>h.id===operation.hit);
  if(!pending||pending.resolved)throw new Error('Crew HIT unavailable.');
  const u=s.units[pending.unit_id];if(!live(u))throw new Error('Crew step unavailable.');
  const c=draw(s,1,'Vehicle crew / passenger HIT',u.faction==='enemy'&&!s.knowledge.spotted[u.id])[0],effect=c.hit[u.experience];
  if(!effect)throw new Error('Unsupported crew HIT effect.');applyHit(s,u,effect);pending.resolved=true;pending.card_id=c.id;pending.effect=effect;
 }else if(operation.type==='HOLD_VEHICLE'){
  if(s.phase!=='AT_COMBAT'||runtime.move&&!runtime.move.complete||runtime.quick||runtime.reaction?.eligible.length||runtime.pending_hits.some(h=>!h.resolved))throw new Error('Resolve pending vehicle procedures before holding.');
  const v=activeVehicle(s,operation.vehicle);
  if(v.faction!=='friendly'||atProfile(v.profile).target_type!=='V')throw new Error('Only a friendly vehicle can hold.');
  startOrderedAction(s,v.id);resolveVehicleVOF(s,v,operation.id);runtime.vehicles[v.id].moved_fired=true;
  emit(s,'VEHICLE_HELD',`${v.name} held position.`,{actor:v.id,location:v.location});
 }else if(operation.type==='PREPARE_VEHICLE_MOVE'){
  if(runtime.disembark||runtime.phase_complete||runtime.end_vof||runtime.pending_fire||runtime.move&&!runtime.move.complete||runtime.quick||runtime.reaction?.eligible.length)throw new Error('Resolve the pending vehicle operation first.');
  if(runtime.pending_hits.some(h=>!h.resolved))throw new Error('Resolve immediate crew HITs before movement.');
  const v=activeVehicle(s,operation.vehicle);
  if(atProfile(v.profile).target_type!=='V')throw new Error('AT infantry and guns use infantry movement orders.');
  if(v.faction==='friendly'&&operation.path.some(id=>s.locations[id]?.outside_boundary))throw new Error('Outside the mission boundaries: only enemy placement may expand the battlefield.');
  if(v.profile==='JEEP'&&!v.passengers.length)throw new Error('Jeep requires an embarked driver.');
  if(s.phase!=='AT_COMBAT')throw new Error('Vehicle movement requires the vehicle phase.');
  const locations=Object.fromEntries(Object.entries(s.locations).map(([id,l])=>[id,{...l,trafficability:String(l.trafficability??'Unmarked').toUpperCase()}]));
  if((s.mission_rules?.vire||s.mission_rules?.tinchebray)&&v.faction==='friendly'&&operation.path.some(id=>s.forward_row_blocked&&s.locations[id]?.row>=s.forward_row_blocked))throw new Error('Higher HQ prohibits advancing into a new lead row this turn.');
  if(operation.path.some(id=>!locations[id]?.staging&&Object.values(runtime.vehicles).filter(other=>other.id!==v.id&&other.faction===v.faction&&other.status==='ACTIVE'&&atProfile(other.profile).target_type==='V'&&other.location===id).length>=4))throw new Error('Movement exceeds the four-vehicle card limit.');
  runtime.move=beginVehicleMove(v,locations,operation.path);
  startOrderedAction(s,v.id);
 }else if(operation.type==='STOP_VEHICLE_MOVE'){
  if(s.phase!=='AT_COMBAT'||runtime.quick||runtime.reaction?.eligible.length)throw new Error('Resolve reactions before stopping movement.');
  runtime.move=stopVehicleMove(runtime.move);
 }else if(operation.type==='STEP_VEHICLE_MOVE'){
  const m=runtime.move;if(s.phase!=='AT_COMBAT'||!m||m.complete||runtime.quick||runtime.reaction?.eligible.length)throw new Error('Movement continuation unavailable.');
  const vehicle=activeVehicle(s,m.vehicle.id);m.vehicle=structuredClone(vehicle);
  if(['VOF_ORIGIN','VOF_DESTINATION'].includes(m.stage)){
   resolveVehicleVOF(s,vehicle,operation.id,{moving:m.stage==='VOF_DESTINATION'});
   const updated=runtime.vehicles[vehicle.id];
   m.vehicle=structuredClone(updated);
   if(updated.status!=='ACTIVE'){runtime.move={...m,stage:'COMPLETE',complete:true};emit(s,'VEHICLE_MOVE_INTERRUPTED','Vehicle movement ended by VOF.',{actor:vehicle.id,status:updated.status},vehicle.faction==='enemy'&&!s.knowledge.spotted[vehicle.id]);finishOrderedAction(s);runtime.applied.push(operation.id);runtime.operations.push(structuredClone(operation));return s;}

  }
  const beforeLocation=vehicle.location;
  runtime.move=stepVehicleMove(m,m.stage);runtime.vehicles[vehicle.id]=structuredClone(runtime.move.vehicle);
  if(beforeLocation!==runtime.move.vehicle.location){checkVehicleMines(s,runtime.vehicles[vehicle.id]);emit(s,'UNIT_MOVED',`${vehicle.name} moved to ${s.locations[runtime.move.vehicle.location].name}.`,{actor:vehicle.id,from:beforeLocation,target:runtime.move.vehicle.location,faction:vehicle.faction},vehicle.faction==='enemy'&&!s.knowledge.spotted[vehicle.id]);revealTerrain(s);}
  if(runtime.move.stage==='REACTION')openReactions(s,vehicle.id);
 }else if(operation.type==='FINISH_AT_PHASE'){
  if(s.phase!=='AT_COMBAT'||!runtime.coordinator||runtime.phase_complete||runtime.end_vof||runtime.coordinator.pending||runtime.quick||runtime.reaction?.eligible.length||vehiclePhaseOptions(synchronizeGroups(s)).length)throw new Error('Vehicle actions are not complete.');
  runtime.end_vof=Object.values(runtime.vehicles).filter(v=>v.status==='ACTIVE'&&atProfile(v.profile).target_type==='V'&&!v.action_taken).map(v=>v.id);
  if(!runtime.end_vof.length)completePhase(s);
 }else if(operation.type==='STEP_END_VOF'){
  if(s.phase!=='AT_COMBAT'||!runtime.end_vof?.length||runtime.phase_complete)throw new Error('No end-of-phase VOF pending.');
  const id=runtime.end_vof.shift();resolveVehicleVOF(s,activeVehicle(s,id),operation.id);
  if(!runtime.end_vof.length&&!runtime.pending_hits.some(h=>!h.resolved))completePhase(s);
 }else if(operation.type==='CLEANUP_VEHICLES'){
  if(s.phase!=='CLEANUP'||!runtime.phase_complete)throw new Error('Vehicle cleanup unavailable.');
  if(Object.values(runtime.vehicles).some(v=>v.status==='ACTIVE'&&v.passengers.length)&&!runtime.infantry_combat_prepared)throw new Error('Prepare passenger infantry combat before Cleanup.');
  for(const v of Object.values(runtime.vehicles)){runtime.vehicles[v.id]=cleanupVehicleActivation(v);runtime.vehicles[v.id].action_taken=false;runtime.vehicles[v.id].moved_before_fire=false;}
  if(s.pending_combat?.some(r=>r.status==='PENDING'))throw new Error('Resolve infantry combat before Cleanup.');
  runtime.coordinator=null;runtime.end_vof=null;runtime.phase_complete=false;runtime.move=null;runtime.reaction=null;runtime.infantry_combat_prepared=false;
 }else throw new Error('Unknown Vire adapter operation.');
 if(runtime.end_vof?.length===0&&!runtime.phase_complete&&!runtime.pending_hits.some(h=>!h.resolved))completePhase(s);
 synchronizeJeepPassengers(s);if(runtime.basic_fire_enabled)refresh(s);
 finishOrderedAction(s);s.vire_runtime.applied.push(operation.id);s.vire_runtime.operations.push(structuredClone(operation));return s;
}
export function replayVireOperations(start,operations){return operations.reduce((s,op)=>applyVireOperation(s,op),structuredClone(start));}
export function exportVireAdapterReplay(start,state){
 const initial=structuredClone(start);initial.vire_runtime.initial_state??=structuredClone(start);
 return {format:start.mission_rules.tinchebray?'tinchebray-integration':'vire-integration',version:start.mission_rules.tinchebray?TINCHEBRAY_ADAPTER_VERSION:VIRE_ADAPTER_VERSION,base_rules_version:start.rules_version,scenario:start.scenario_id,scenario_version:start.scenario_version,mission_instance_id:start.mission_instance_id,attempt_records:structuredClone(state.attempt_records??[]),initial_state:initial,operations:structuredClone(state.vire_runtime.operations)};
}
export function importVireAdapterReplay(record){
 if(record?.format==='tinchebray-integration'){
  if(record.version!==TINCHEBRAY_ADAPTER_VERSION||record.base_rules_version!==VIRE_ADAPTER_BASE_RULES_VERSION||record.initial_state?.rules_version!==record.base_rules_version||record.initial_state?.vire_runtime?.version!==VIRE_ADAPTER_VERSION||record.scenario!=='normandy_7'||record.initial_state.scenario_id!==record.scenario||record.scenario_version!==tinchebrayContent.version||record.initial_state.scenario_version!==record.scenario_version||!record.initial_state.mission_rules?.tinchebray||record.initial_state.mission_rules?.vire||record.mission_instance_id!==record.initial_state.mission_instance_id)throw new Error('Incompatible Tinchebray vehicle replay.');
  const state=replayVireOperations(record.initial_state,record.operations);
  if(JSON.stringify(record.attempt_records)!==JSON.stringify(state.attempt_records??[]))throw new Error('Vehicle replay attempt starting record mismatch.');
  return state;
 }
 if(record.format!=='vire-integration'||record.version!==VIRE_ADAPTER_VERSION||record.initial_state?.vire_runtime?.version!==VIRE_ADAPTER_VERSION||record.base_rules_version!==VIRE_ADAPTER_BASE_RULES_VERSION||record.base_rules_version!==record.initial_state.rules_version||record.scenario!==record.initial_state.scenario_id||record.scenario_version!==record.initial_state.scenario_version||record.mission_instance_id!==record.initial_state.mission_instance_id||record.scenario==='normandy_6'&&(!record.initial_state.mission_rules?.vire||record.scenario_version!==vireContent.version))throw new Error('Incompatible vehicle integration replay.');
 const state=replayVireOperations(record.initial_state,record.operations);
 if(JSON.stringify(record.attempt_records)!==JSON.stringify(state.attempt_records??[]))throw new Error('Vehicle replay attempt starting record mismatch.');
 return state;
}
export function getVirePublicState(s){
 const rt=s.vire_runtime;if(!rt)return null;
 const known=v=>v.faction==='friendly'||!!s.knowledge.spotted[v.source_unit??v.id];
 return {normal_phase_enabled:!!rt.normal_phase_enabled,vehicle_hqs:Object.values(rt.vehicles).filter(v=>v.faction==='friendly'&&vehicleHQRecord(s,v.id)).map(v=>({id:v.id,name:v.name,saved:v.saved,eligible:!s.impulse&&!s.completed.includes(v.id)&&(s.phase==='SUBORDINATE_ACTIVATION'?s.activated.includes(v.id):s.phase==='PLATOON_INITIATIVE'&&!s.activated.includes(v.id))})),concentrate_targets:Object.values(rt.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE').flatMap(v=>vehicleConcentrateTargets(s,v).map(t=>({vehicle:v.id,id:t.id,name:t.name,location:t.location,cover:t.cover}))),basic_fire_enabled:!!rt.basic_fire_enabled,ground_loads:{assets:(s.assets??[]).filter(a=>!a.destroyed&&!a.carrier&&(a.faction==='friendly'||s.units[a.source_unit]?.faction==='friendly')).map(a=>({id:a.id,type:a.type,key:a.key??a.net??'',quantity:a.quantity??1,location:a.location})),casualties:(s.casualties??[]).filter(c=>c.faction==='friendly'&&!c.carrier&&!c.evacuated&&!c.unavailable).map(c=>({id:c.id,location:c.location}))},carried_loads:Object.values(rt.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE').map(v=>({vehicle:v.id,assets:(v.cargo??[]).map(a=>({id:a.id,type:a.type,key:a.key??a.net??'',quantity:a.quantity??1})),casualties:(v.transported_casualties??[]).map(c=>({id:c.id}))})),infantry_combat_prepared:!!rt.infantry_combat_prepared,infantry_combat:(s.pending_combat??[]).filter(r=>r.status==='PENDING'&&r.target_faction==='friendly').map(r=>({id:r.id,name:r.target_name,ncm:r.ncm})),disembark:rt.disembark&&rt.vehicles[rt.disembark.vehicle].faction==='friendly'?structuredClone(rt.disembark):null,passenger_formations:Object.values(s.units).filter(u=>u.faction==='friendly'&&(live(u)||u.removed==='EMBARKED'&&rt.vehicles[u.embarked_on]?.status==='ACTIVE'&&rt.vehicles[u.embarked_on].passengers.some(step=>step.origin_formation===u.id))).map(u=>({id:u.id,name:u.name,location:u.embarked_on?rt.vehicles[u.embarked_on].location:u.location,embarked_on:u.embarked_on??null})),phase_started:!!rt.coordinator,phase_complete:!!rt.phase_complete,phase_finishing:!!rt.end_vof,end_vof_pending:!!rt.end_vof?.length,pending_fire:rt.pending_fire&&rt.vehicles[rt.pending_fire.firer].faction==='friendly'?{...rt.pending_fire}:null,vehicles:Object.values(rt.vehicles).filter(known).map(v=>({id:v.id,profile:v.profile,target_type:atProfile(v.profile).target_type,location:v.location,faction:v.faction,status:v.status,pinned:v.pinned,activated:v.activated,moved_fired:v.moved_fired,fire:v.fire??null,removal_reason:v.removal_reason??null,ammo:v.faction==='friendly'?v.ammo:null,...(v.faction==='friendly'?{name:v.name,crew:(v.crew??[]).map(step=>({id:step.id,names:(step.personnel??[]).map(id=>s.personnel[id]?.name??id)})),passengers:[...new Set((v.passengers??[]).map(step=>step.origin_formation))].map(id=>({id,name:s.units[id]?.name??id,steps:v.passengers.filter(step=>step.origin_formation===id).length})),mounted_arty_radio:!!v.mounted_arty_radio}: {})})),group:rt.coordinator?.groups[rt.coordinator.group]??null,eligible:rt.coordinator?vehiclePhaseOptions(rt.coordinator).filter(id=>rt.vehicles[id].faction==='friendly'):[],pending_hits:rt.pending_hits.filter(h=>!h.resolved&&s.units[h.unit_id]?.faction==='friendly').map(h=>({id:h.id,unit_id:h.unit_id})),quick:rt.quick&&rt.vehicles[rt.quick.firer].faction==='friendly'?{...rt.quick}:null,reaction:rt.reaction?{actor:known(rt.vehicles[rt.reaction.actor])?rt.reaction.actor:null,eligible:rt.reaction.eligible.filter(id=>rt.vehicles[id].faction==='friendly')}:null,move:rt.move?{vehicle:rt.move.vehicle.id,stage:rt.move.stage,complete:rt.move.complete}:null};
}
