import {effectiveRadios} from './vehicleJeep.js';
import {eligibleEngineer,markEngineerPath,engineerRulesEnabled} from './engineers.js';
import {placeIllumination} from './visibility.js';
import {patrolHoldReason} from './patrolEvents.js';
import {patrolMovementReason} from './patrols.js';
import {visibilityCommandLimits} from './visibility.js';
import {transferEquipmentResupply} from './equipmentRecovery.js';
import {transportReason,dropLoad,dropItemsReason,dropItems} from './core.js';
import {SKILLS,skillOptions} from './skills.js';
import {reconstitutionFirepower,reconstitutionLoads,transferReconstitutionLoads} from './reconstitution.js';
import {ammoLoadReason,pickUpAmmunition,dropExcessAmmunition,expendAmmunition,ammunitionResupplied,basicFireAmmoKey,concentrateAmmoReason} from './ammunition.js';
import {layPhoneLine} from './phoneNetwork.js';
import {availableRunner,createRunner,dispatchRunner,dismissRunner} from './runners.js';
import {companyCommander,isCompanyCommander,canActivateSubordinates,canCommandCompany,successionPriority} from './commandRoles.js';
import {revealTerrain} from './missionKnowledge.js';
import {discoveredCover,checkMines,supportRequest} from './missionFeatures.js';
import { terrainProtection } from './terrain.js';
import { values, live, good, friendly, visible, expMod, emit, draw, attempt, randomNumber, pick, result } from './core.js';
import { adjacent, occupants, distance, los, unitLos, seesCard, unitElevation, coverAvailable, enclosedWeaponCover, communication, mortarCommunication, chain, coverOf, basicValue, canFire, followsExistingPdf, refresh, spot, hasFire, incoming, movementReason, communicationReason, spottingLocations, vofOf, rangeOf, fireSource } from './battlefield.js';
export const ACTIONS = {
  SUPPLEMENT:'Supplement squad', ASSAULT_TO_FIRE:'Convert Assault Team to Fire Team',
  BN_RECONSTITUTE_CO:'BN HQ: reconstitute Company HQ',
  SWITCH_NETWORK:'Switch radio/phone network', DESIGNATE_CCP:'Designate new casualty collection point',
  TRANSFER_EQUIPMENT:'Pick up equipment from another unit',
  PLATOON_CONCENTRATE:'Have platoon concentrate fire', PLATOON_GRENADE:'Have platoon make grenade attacks',
  SKILL_EXTRA_AUTOMATIC:'Assign Extra Draw to next automatic attempt',
  SKILL_GRENADE_RETURN:'Assign Auto Grenade to next return attempt',
  SKILL_GENERAL:'Skill: extra General Initiative command', SKILL_SPAWN_A:'Skill: spawn Assault Team', SKILL_SPAWN_F:'Skill: spawn Fire Team', SKILL_PARALYZED_A:'Skill: Paralyzed to Assault', SKILL_PARALYZED_F:'Skill: Paralyzed to Fire',
  WP_ATTACK:'Attack with WP grenade',
  ACTIVATE:'Activate HQ / staff', MOVE:'Move', PLATOON_MOVE:'Move platoon', INFILTRATE:'Infiltrate', PLATOON_INFILTRATE:'Infiltrate platoon',
  INFILTRATE_WITHIN:'Infiltrate within card', SEEK_COVER_UPPER:'Seek cover — enter upper story if found', SEEK_COVER:'Seek cover', ENTER_COVER:'Move within card', SPOT:'Spot position', SHIFT_FIRE:'Shift fire', CEASE_FIRE:'Cease fire on this card',
  CONCENTRATE:'Concentrate fire', GRENADE:'Grenade / close assault', RALLY:'Remove pin', RECOVER:'Recover cohesion',
  DEPLOY_FIRE_TEAM:'Deploy named Fire Team', RECONSTITUTE:'Reconstitute squad', RECONSTITUTE_HQ:'Reconstitute HQ', DETACH:'Detach assault team', DETACH_FIRE_TEAM:'Detach fire team',
  CLEAR_MINE_PATH:'Mark path through mines', HANDHELD_ILLUM:'Deploy handheld illumination', CALL_MORTAR_ILLUM:'Call mortar illumination', CALL_ARTILLERY_ILLUM:'Call artillery illumination', CALL_CANNON:'Call cannon HE',CALL_CANNON_WP:'Call cannon WP', CALL_MORTAR_WP:'Call mortar WP', CALL_ARTILLERY_WP:'Call artillery WP', WP:'Deploy WP smoke', RIFLE_GRENADE:'Fire rifle grenade', CALL_MORTAR:'Call 81mm fire', CALL_ARTILLERY_TOT:'Call artillery time-on-target', CALL_ARTILLERY:'Call 105mm fire', INDIRECT:'Call on-map mortar indirect fire',
  SMOKE:'Deploy screening smoke', SIGNAL_ADVANCE:'Signal: cross phase line 2', SIGNAL_CEASE:'Signal: cease fire',
  PYRO_RSP:'Signal: red star parachute', PYRO_RSC:'Signal: red star cluster', PYRO_GSP:'Signal: green star parachute', PYRO_GSC:'Signal: green star cluster',
  PYRO_RED_SIGNAL:'Signal: red smoke', PYRO_GREEN_SIGNAL:'Signal: green smoke', PYRO_YELLOW_SIGNAL:'Signal: yellow smoke', PYRO_PURPLE_SIGNAL:'Signal: purple smoke',
  CREATE_RUNNER:'Create runner', DISPATCH_RUNNER:'Dispatch runner', DISMISS_RUNNER:'Dismiss runner', REPAIR_PHONE_LINE:'Repair phone line', DROP_LOAD:'Drop all carried items (free)', PICKUP_RADIO:'Recover equipment', PICKUP_CASUALTY:'Pick up casualty', DROP_CASUALTY:'Drop casualties',
};
export const costOf = type => ['SKILL_GENERAL','SKILL_SPAWN_A','SKILL_SPAWN_F','SKILL_EXTRA_AUTOMATIC','SKILL_GRENADE_RETURN'].includes(type)?0:type.startsWith('PLATOON_') ? 2 : 1;
const hq = u => ['HQ','STAFF'].includes(u.kind);
const canDeployPyrotechnic = u => good(u) || live(u) && !u.pinned && ['A','F'].includes(u.cohesion);
const genericInit = s => s.impulse?.hq === 'general';
const reconstructionTeams=(s,u,issuerId)=>occupants(s,u.location).filter(t=>t.faction===u.faction&&live(t)&&t.steps.length===1&&['A','F'].includes(t.cohesion)&&!t.pinned&&(s.mission_rules?.missionIdentity||t.kind==='LAT')&&(s.mission_rules?.missionIdentity||t.cover===u.cover)&&s.units[issuerId]&&chain(s.units[issuerId],t,'RECONSTITUTE')&&communication(s,s.units[issuerId],t));
const HQ_ORIGIN_ACTIONS=['INDIRECT','ACTIVATE','RECONSTITUTE','RECONSTITUTE_HQ','DETACH','DETACH_FIRE_TEAM','DESIGNATE_CCP','PLATOON_CONCENTRATE','PLATOON_GRENADE','CREATE_RUNNER','DISPATCH_RUNNER','DISMISS_RUNNER','SIGNAL_ADVANCE','SIGNAL_CEASE'];
const skillActor=(s,u,type,issuerId)=>['RECONSTITUTE','RECONSTITUTE_HQ'].includes(type)||!genericInit(s)&&['RALLY','RECOVER'].includes(type)?s.units[issuerId]??u:u;
const actionKey = (u,type,target) => type==='DETACH_FIRE_TEAM'?'DETACH':type==='CLEAR_MINE_PATH'?'INFILTRATE_WITHIN':type==='SEEK_COVER_UPPER'?'SEEK_COVER':type==='WP_ATTACK'?'GRENADE':type.startsWith('CALL_')&&u.mission_weapon?'CALL_FIRE':type === 'ACTIVATE' ? `${type}_${target}` : type === 'RECOVER' ? `${type}_${u.cohesion}` : type;
const areaTargets = (s,u) => values(s.units).filter(t=>live(t)&&t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]));
function targetsAt(s,u,id) { return areaTargets(s,u).filter(t=>t.location===id); }
const radioType=net=>net.endsWith('_PHONE')?'EE8':net==='CO'?'SCR536':'SCR300';
const EXHORT_ACTIONS=['SEEK_COVER','SEEK_COVER_UPPER','INFILTRATE','INFILTRATE_WITHIN','PLATOON_INFILTRATE','RALLY','RECOVER','RECONSTITUTE','SPOT','CONCENTRATE','PLATOON_CONCENTRATE','GRENADE','PLATOON_GRENADE','RIFLE_GRENADE','WP_ATTACK','CLEAR_MINE_PATH'];
export function exhortReason(s,c){
 const issuer=s.units[c.issuer_id],u=s.units[c.unit_id];
 if(!EXHORT_ACTIONS.includes(c.type)&&!c.type.startsWith('CALL_'))return 'This action has no exhortable attempt.';
 if(!s.impulse||!live(issuer)||issuer.cohesion!=='GOOD'||!hq(issuer)||!live(u)||!chain(issuer,u,c.type)||!communication(s,issuer,u,c.type==='RALLY'))return 'Exhort requires an eligible HQ/staff communicating with the recipient.';
 if(issuer.used.includes(`${s.impulse.id}:EXHORT`))return 'This HQ has already exhorted in this impulse.';
 if(s.impulse.hq!=='general'&&s.impulse.hq!==issuer.id)return 'Only the active issuing HQ can exhort.';
 const limit=visibilityCommandLimits(s.visibility).spend;
 const general=s.impulse.hq==='general'&&(s.mission_rules?.reattempts||s.patrol);
 const spent=general?s.impulse.origin_spent?.[issuer.id]??0:s.impulse.spent,base=general&&!HQ_ORIGIN_ACTIONS.includes(c.type)?0:costOf(c.type);
 if(s.impulse.commands<costOf(c.type)+1||spent+base+1>limit)return 'Reserve one additional command within the originator’s impulse limit.';
 return null;
}
export function platoonCombatGroup(s,h,target,type){
 if(!target||!good(h)||h.kind!=='HQ'||!h.platoon)return [];
 const action=type==='PLATOON_CONCENTRATE'?'CONCENTRATE':'GRENADE';
 return occupants(s,h.location).filter(u=>friendly(u)&&u.platoon===h.platoon&&good(u)&&communication(s,h,u)&&!orderReason(s,{type:action,unit_id:u.id,issuer_id:h.id,target_id:target.id}));
}
const restorableHQ=(s,t)=>t&&friendly(t)&&t.kind==='HQ'&&!t.steps.length&&!t.embarked_on&&!['RESERVE','EMBARKED','GUARD'].includes(t.removed)&&(!s.patrol||!t.platoon||t.platoon===s.patrol.plan.platoon);
export function eligibleTargets(s,u,type) {
  if(type==='TRANSFER_EQUIPMENT')return values(s.units).filter(v=>v.id!==u.id&&live(v)&&friendly(v)&&v.location===u.location&&v.cover===u.cover).flatMap(v=>[
   ...[...new Set(v.radios)].map(net=>`transfer:${v.id}:RADIO:${net}`),
   ...Object.entries(v.assets).filter(([,n])=>n>0).map(([key])=>`transfer:${v.id}:EQUIPMENT:${key}`),
   ...Object.entries(v.ammo??{}).filter(([,n])=>n>0).map(([key])=>`transfer:${v.id}:AMMO:${key}`)]);
  if(type==='SUPPLEMENT')return values(s.units).filter(t=>t.id!==u.id&&friendly(t)&&live(t)&&t.steps.length===1&&['A','F'].includes(t.cohesion)&&!t.pinned&&t.location===u.location).map(t=>t.id);
  if(type==='SWITCH_NETWORK')return u.radios.flatMap(from=>[...new Set(s.assets.filter(a=>a.type==='RADIO'&&a.destroyed&&a.faction===u.faction&&a.net!==from&&radioType(a.net)===radioType(from)).map(a=>a.net))].map(to=>`${from} → ${to}`));
  if(['PLATOON_CONCENTRATE','PLATOON_GRENADE'].includes(type))return areaTargets(s,u).filter(t=>platoonCombatGroup(s,u,t,type).length).map(t=>t.id);
  if(type==='WP_ATTACK')return areaTargets(s,u).filter(t=>t.location===u.location).map(t=>t.id);
  if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)) return adjacent(s,u.location).map(l=>l.id);
  if(type==='ACTIVATE') return values(s.units).filter(t=>friendly(t)&&(u.command_role==='higher_hq'||!isCompanyCommander(t))&&hq(t)&&live(t)&&t.command_role!=='higher_hq').map(t=>t.id);
  if(type.startsWith('PYRO_'))return (type.endsWith('_SIGNAL')?[s.locations[u.location]]:[s.locations[u.location],...adjacent(s,u.location)]).filter(Boolean).map(l=>l.id);
  if(type==='CREATE_RUNNER')return values(s.units).filter(v=>friendly(v)&&live(v)&&(good(v)||!v.pinned&&['A','F'].includes(v.cohesion))&&communication(s,companyCommander(s),v)&&chain(companyCommander(s),v,type)).map(v=>v.id);
  if(type==='DISPATCH_RUNNER')return values(s.units).filter(t=>friendly(t)&&live(t)&&['HQ','STAFF'].includes(t.kind)&&!isCompanyCommander(t)&&t.command_role!=='higher_hq').map(t=>t.id);
  if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(type)) return ['open',...s.locations[u.location].covers.filter(c=>(!friendly(u)||c.known)&&coverAvailable(s,u,c)).map(c=>c.id)];
  if(type==='SPOT') return s.locations[u.location]?.staging?[]:spottingLocations(s).filter(id=>occupants(s,id).some(t=>t.faction!==u.faction&&!s.knowledge.spotted[t.id]&&unitLos(s,u,t)));
  if(type==='INDIRECT') return values(s.locations).filter(l=>!l.staging&&distance(s.locations[u.location],l)<=u.range).map(l=>l.id);
  if(type.endsWith('_ILLUM'))return values(s.locations).filter(l=>!l.staging&&(type==='HANDHELD_ILLUM'||l.known!==false)&&(type!=='HANDHELD_ILLUM'||l.id===u.location||adjacent(s,u.location).some(a=>a.id===l.id))).map(l=>l.id);
  if((['SHIFT_FIRE'].includes(type)||type.startsWith('CALL_'))) return values(s.locations).filter(l=>!l.staging&&seesCard(s,u,l.id)).map(l=>l.id);
  if(['GRENADE','RIFLE_GRENADE','CONCENTRATE'].includes(type)) return areaTargets(s,u).filter(t=>unitLos(s,u,t,type==='RIFLE_GRENADE'?1:type==='GRENADE'?(u.grenade_range??(vofOf(u)==='G'?rangeOf(u):0)):rangeOf(u))).map(t=>t.id);
  if(type==='RECONSTITUTE_HQ') return values(s.units).filter(t=>restorableHQ(s,t)).map(t=>t.id);
  if(type==='RECONSTITUTE') return values(s.units).filter(t=>t.faction===u.faction&&t.kind==='SQUAD'&&!live(t)).map(t=>t.id);
  if(type==='PICKUP_RADIO') return s.assets.filter(a=>a.location===u.location&&(!s.mission_rules?.specialEnemies||((a.cover??null)===(u.cover??null)&&a.faction===u.faction))&&['RADIO','EQUIPMENT','AMMO'].includes(a.type)&&!a.destroyed).map(a=>a.id);
  if(type==='PICKUP_CASUALTY') return s.casualties.filter(c=>{const donor=c.carrier&&s.units[c.carrier];return c.faction===u.faction&&!c.evacuated&&(donor?s.mission_rules?.missionIdentity&&donor.id!==u.id&&live(donor)&&donor.location===u.location&&donor.cover===u.cover:c.location===u.location&&c.cover===u.cover);}).map(c=>c.id);
  return [];
}
export function orderReason(s,c) {
  const u=s.units[c.unit_id], issuer=s.units[c.issuer_id],type=c.type==='SEEK_COVER_UPPER'?'SEEK_COVER':c.type,target=c.target_id;
  if(c.type==='SEEK_COVER_UPPER'){
    const l=u&&s.locations[u.location];
    if(!s.mission_rules?.coverTable||!l?.building||!(l.multi_story||l.tower))return 'Upper-story discovery requires multi-story building terrain.';
    if(l.tower&&u.steps.length>1)return 'A church tower can hold only one step.';
  }
  if((type.endsWith('_WP')||['WP','WP_ATTACK','RIFLE_GRENADE'].includes(type))&&!s.support_agencies)return 'This action is not enabled by the mission.';
  if(type==='CLEAR_MINE_PATH'&&u?.exposed)return 'Already exposed: infiltration requires an unexposed formation.';
  if(type==='CLEAR_MINE_PATH'&&(!engineerRulesEnabled(s)||!eligibleEngineer(u)||!s.locations[u?.location]?.mines))return 'Requires a good-order two- or three-step engineer squad on a known minefield.';
  if(!ACTIONS[type]) return 'Unknown order.';
  if(type==='BN_RECONSTITUTE_CO'){
   const co=companyCommander(s),visitors=values(s.units).some(v=>v.command_role==='higher_hq'&&v.removed!=='DEPARTED');
   if(s.status!=='ACTIVE'||!s.mission_rules?.missionIdentity||s.phase!=='BN_ACTIVATION'||s.impulse||s.bn_blocked||visitors||(s.offmap_bn_commands??visibilityCommandLimits(s.visibility).spend)<1)return 'Off-map BN HQ must be available in its BN impulse.';
   if(live(co)||!good(u)||!friendly(u)||!u.radios.includes('BN'))return 'Choose an eligible Good Order successor carrying the working BN TAC radio.';
   const best=Math.min(...values(s.units).filter(v=>friendly(v)&&live(v)&&!isCompanyCommander(v)&&v.command_role!=='higher_hq').map(successionPriority));
   if(best===99||successionPriority(u)!==best)return 'Use the XO first, then a platoon HQ, Artillery Observer, then company staff; a surviving named Fire Team must recover first.';
   return null;
  }
  if(c.exhort){const reason=exhortReason(s,c);if(reason)return reason;}
  if(s.status!=='ACTIVE') return 'The mission has ended.';
  if(s.mission_rules?.specialEnemies&&['DROP_LOAD','DROP_CASUALTY'].includes(type)){
    if(!live(u)||!friendly(u))return 'Select an available friendly formation.';
    if(type==='DROP_LOAD'&&c.drop_items!==undefined)return dropItemsReason(s,u,c.drop_items);
    return (type==='DROP_LOAD'&&(u.radios.length||Object.values(u.assets).some(Boolean)||Object.values(u.ammo??{}).some(Boolean))||s.casualties.some(c=>c.carrier===u.id))?null:'No carried items to drop.';
  }
  if(type==='DROP_LOAD')return 'This action is not enabled by the mission.';
  if(u?.embarked_on&&['MOVE','INFILTRATE','SEEK_COVER','ENTER_COVER','EXIT_COVER','CLIMB'].includes(type))return 'Disembark before maneuvering the passenger independently.';
  if(type==='REPAIR_PHONE_LINE'&&s.mission_rules?.communications!=='phones')return 'Field phones are not in use.';
  if(type.endsWith('_RUNNER')&&!s.mission_rules?.runners)return 'Runners are not available in this mission.';
  if(type.startsWith('PYRO_')&&!s.signal_plan)return 'These signals are not available in this mission.';
  if(s.pending_support)return 'Resolve the pending battalion fire choice first.';
  if(coverOf(s,u)?.type==='Deep Bunker'&&(type==='SPOT'||type.startsWith('PYRO_')||['GRENADE','RIFLE_GRENADE','WP_ATTACK'].includes(type)))return 'Leave the Deep Bunker before spotting, signalling or making grenade attacks.';
  if(!s.impulse) return 'Advance to a command impulse to issue orders.';
  if(!live(u)||!friendly(u)) return 'Select an available friendly formation.';
  if(!genericInit(s) && c.issuer_id!==s.impulse.hq) return 'Only the active HQ can issue orders in this impulse.';
  if(type.startsWith('SKILL_')||c.skill_id){
   const available=skillOptions(s,skillActor(s,u,type,c.issuer_id),type),skill=c.skill_id?available.find(p=>p.id===c.skill_id):available[0];
   if(!skill)return 'No eligible unused skill is available for this formation and action.';
   if(skill.type==='EXTRA_DRAW'&&['RALLY','RECOVER'].includes(type)&&!hasFire(s,u.location))return 'No draw is made for recovery outside fire; retain the Extra Draw skill.';
   if(type==='SKILL_GENERAL'&&!genericInit(s))return 'Use this skill during General Initiative.';
   if(type.startsWith('SKILL_SPAWN')&&(!good(u)||u.kind!=='SQUAD'||u.steps.length<3))return 'Spawn from a good-order three- or four-step squad.';
   if(type.startsWith('SKILL_PARALYZED')&&(u.pinned||u.cohesion!=='P'))return 'Select an unpinned Paralyzed Team.';
  }
  const normandyGeneral=(s.mission_rules?.reattempts||s.patrol)&&genericInit(s);
  const cappedSpent=normandyGeneral?(HQ_ORIGIN_ACTIONS.includes(type)&&!(s.mission_rules?.missionIdentity&&genericInit(s)&&['DETACH','DETACH_FIRE_TEAM'].includes(type))?s.impulse.origin_spent?.[c.issuer_id]??0:null):s.impulse.spent;
  if(s.impulse.commands<costOf(type)||cappedSpent!==null&&cappedSpent+costOf(type)>visibilityCommandLimits(s.visibility).spend) return `Insufficient commands, or the ${visibilityCommandLimits(s.visibility).spend===6?'six':'four'}-command impulse limit has been reached.`;
  if(!genericInit(s)) {
    if(!live(issuer)) return 'The issuing HQ is unavailable.';
    if(issuer.cohesion!=='GOOD'&&issuer.id!==u.id) return 'A degraded HQ can only order itself.';
    if(!(s.mission_rules?.missionIdentity&&type==='RECONSTITUTE_HQ')&&!chain(issuer,u,type)) return 'The unit is outside this HQ’s chain of command.';
    if(!(type==='INDIRECT'?mortarCommunication(s,issuer,u):communication(s,issuer,u,type==='RALLY'))) return communicationReason(s,issuer,u,type==='RALLY');
  }
  if(s.patrol&&['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)){const restriction=patrolMovementReason(s.patrol,u);if(restriction)return restriction;const hold=patrolHoldReason(s,target);if(hold)return hold;}
  if(type==='ACTIVATE'&&s.activated.includes(target)) return `${s.units[target]?.name??'This HQ'} is already activated. Complete Company HQ’s impulse, then select it in 3.3.1c to spend its commands.`;
  if(type==='REPAIR_PHONE_LINE'&&!s.phone_lines?.some(line=>line.location===u.location&&line.cut))return 'No damaged phone line at this location.';
  if(type==='REPAIR_PHONE_LINE'&&(!issuer||!hq(issuer)||!good(issuer)||issuer.location!==u.location||!good(u)))return 'Both repairing unit and ordering HQ/staff must be on the cut line’s card.';
  if(type.startsWith('PYRO_')){
   const key=type.slice(5).toLowerCase();
   if(key.endsWith('_signal')&&(s.visibility?.light??0)>=2)return 'Colored smoke cannot signal during Moon +2 or higher (rules §4.4.1).';
   if(!canDeployPyrotechnic(u)||!u.assets[key])return 'Need a Good Order unit or unpinned Assault/Fire Team carrying this device.';
   if(!s.signal_plan?.[key]||!eligibleTargets(s,u,type).includes(target))return 'Choose the device’s assigned offensive order and an eligible signal card.';
  }
  if(type.endsWith('_RUNNER')){
    const commander=companyCommander(s);
    if(c.issuer_id!==commander.id||!['general',commander.id].includes(s.impulse?.hq)||!good(commander))return 'Only a good-order Company HQ can create, dispatch or dismiss runners in its own impulse or General Initiative.';
    if(type==='CREATE_RUNNER'){
     const donor=target?s.units[target]:isCompanyCommander(u)?null:u;
     if(!donor)return 'Choose the unit donating one step to the runner. Company HQ is the issuer, not an automatic donor.';
     if(!eligibleTargets(s,u,type).includes(donor.id)||(s.runners??[]).filter(r=>['BOX','DISPATCHED'].includes(r.status)).length>=2)return 'Choose a communicating good-order unit or unpinned assault/fire team; no more than two runners may be in play.';
    }
    if(type==='DISPATCH_RUNNER'&&(!isCompanyCommander(u)||!availableRunner(s)||!eligibleTargets(s,u,type).includes(target)))return 'Choose an available runner and a subordinate HQ or staff on the map.';
    if(type==='DISMISS_RUNNER'&&(!availableRunner(s)||!good(u)||u.location!==commander.location||u.cover!==commander.cover||u.steps.length>=u.max_steps))return 'A runner can return only to a good-order unit with capacity in Company HQ’s area.';
  }
  if(u.used.includes(`${s.impulse.id}:${actionKey(u,type,target)}`)&&type!=='ENTER_COVER') return 'This unit already attempted this action in this impulse.';
  const restricted=u.pinned||u.cohesion==='P';
  if(restricted&&!type.startsWith('SKILL_PARALYZED')&&!['ACTIVATE','RALLY','RECOVER','MOVE','SEEK_COVER','ENTER_COVER','DROP_CASUALTY','SWITCH_NETWORK'].includes(type)) return 'Pinned, paralyzed or litter teams cannot perform this action.';
  if(u.cohesion==='L'&&!['RALLY','RECOVER','MOVE','INFILTRATE','INFILTRATE_WITHIN','SEEK_COVER','ENTER_COVER','PICKUP_RADIO','PICKUP_CASUALTY','TRANSFER_EQUIPMENT','DROP_CASUALTY','SWITCH_NETWORK'].includes(type))return 'Litter teams must recover before performing this action.';
  if(!u.pinned&&u.cohesion==='P'&&['SEEK_COVER','ENTER_COVER'].includes(type)) return 'A paralyzed team must recover before moving within its card.';
  if(['ACTIVATE','RECONSTITUTE','RECONSTITUTE_HQ','DETACH','DETACH_FIRE_TEAM','SIGNAL_ADVANCE','SIGNAL_CEASE'].includes(type) && !(s.mission_rules?.missionIdentity&&['DETACH','DETACH_FIRE_TEAM'].includes(type)) && genericInit(s) && (!issuer||!hq(issuer)||(type==='RECONSTITUTE_HQ'?issuer.cohesion!=='GOOD':!good(issuer))||!(s.mission_rules?.missionIdentity&&type==='RECONSTITUTE_HQ')&&!chain(issuer,u,type)||!communication(s,issuer,u))) return 'This action requires an eligible HQ in communication even during general initiative.';
  if(type==='ACTIVATE') {
    const t=s.units[target];
    if(c.issuer_id!==u.id||!(u.command_role==='higher_hq'||canActivateSubordinates(u))||!(u.command_role==='higher_hq'?s.phase==='BN_ACTIVATION':s.phase==='CO_ACTIVATION')) return 'Only the active higher or company HQ can activate subordinates in its activation impulse.';
    if(!t||!hq(t)||(isCompanyCommander(t)&&u.command_role!=='higher_hq')||t.command_role==='higher_hq'||!live(t)||t.cohesion!=='GOOD'||u.cohesion!=='GOOD'||s.activated.includes(t.id)||!communication(s,u,t)) return 'Choose a command-side, unactivated subordinate HQ in communication.';
  }
  if(type.startsWith('PLATOON_') && (u.kind!=='HQ'||!u.platoon||u.id!==c.issuer_id||!good(u))) return 'A good-order platoon HQ must issue its own platoon order.';
  if(['PLATOON_CONCENTRATE','PLATOON_GRENADE'].includes(type)&&(!s.units[target]||!platoonCombatGroup(s,u,s.units[target],type).length))return 'No eligible communicating platoon units can attack this spotted target.';
  if(type==='SUPPLEMENT'){
   const team=s.units[target];
   if(!good(u)||u.kind!=='SQUAD'||![2,3].includes(u.steps.length)||u.steps.length>=(u.max_steps??3))return 'Choose a Good Order two- or three-step squad with room for one step.';
   if(!eligibleTargets(s,u,type).includes(target))return 'Choose an unpinned one-step Assault or Fire Team on this card.';
   if(!(s.mission_rules?.missionIdentity&&genericInit(s))&&(!issuer||!live(issuer)||issuer.cohesion!=='GOOD'||!hq(issuer)||!chain(issuer,u,type)||!communication(s,issuer,u)||!chain(issuer,team,type)||!communication(s,issuer,team)))return 'The ordering HQ must communicate with both the squad and the contributing team.';
   if(coverOf(s,u)?.capacity&&occupants(s,u.location).filter(v=>v.cover===u.cover&&v.faction===u.faction&&v.id!==team.id).reduce((n,v)=>n+v.steps.length,0)+1>coverOf(s,u).capacity)return 'The squad’s cover has no room for the added step.';
  }
  if(type==='ASSAULT_TO_FIRE'&&(!live(u)||u.pinned||u.cohesion!=='A'))return 'Choose an unpinned Assault Team.';
  if(type==='TRANSFER_EQUIPMENT'){
   if(u.pinned||u.cohesion==='P'||!eligibleTargets(s,u,type).includes(target))return 'Choose carried equipment on another friendly unit in the same area.';
   const [,id,category,key]=target.split(':'),donor=s.units[id],quantity=c.quantity??1,available=category==='RADIO'?donor.radios.filter(n=>n===key).length:category==='AMMO'?donor.ammo[key]:donor.assets[key];
   if(!Number.isInteger(quantity)||quantity<1||quantity>available)return 'Choose a positive whole quantity within the donor’s available stock.';
   const load=category==='AMMO'?ammoLoadReason(s,u,{[key]:quantity}):transportReason(s,u,quantity);if(load)return load;
  }
  if(type==='SWITCH_NETWORK'&&!eligibleTargets(s,u,type).includes(target))return 'Choose a carried radio/phone and a removed device on a different network of the same hardware type.';
  if(type==='DESIGNATE_CCP'&&(!s.objectives||c.issuer_id!==u.id||!good(u)||!(canCommandCompany(u)||s.patrol&&u.kind==='HQ'&&u.platoon===s.patrol.plan.platoon)||s.locations[u.location]?.staging))return 'An eligible company HQ/staff (or patrol platoon HQ) must designate the CCP on its own terrain card.';
  if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)) {
    if(movedThisImpulse(s,u))return 'Already moved to an adjacent card in this impulse.';
    const reason=movementReason(s,u,target); if(reason) return reason;
    if(type.includes('INFILTRATE')) {const reason=infiltrationReason(s,u,target);if(reason)return reason;}
    if(c.arrival_cover!==undefined&&c.arrival_cover!=='open'&&!arrivalCoverOptions(s,u,target,type).some(o=>o.id===c.arrival_cover))return 'Choose available known cover at the destination, or arrive outside additional cover.';
  }
  if(['SEEK_COVER','ENTER_COVER','INFILTRATE_WITHIN'].includes(type)){const load=transportReason(s,u);if(load)return load;}
  if(['SEEK_COVER','ENTER_COVER','INFILTRATE_WITHIN'].includes(type)&&s.locations[u.location].staging)return 'Staging is an off-map holding area with no terrain cover.';
  if(type==='INFILTRATE_WITHIN'){const reason=infiltrationReason(s,u,u.location,true);if(reason)return reason;}
  if(type==='SEEK_COVER'&&(u.cover||s.locations[u.location].covers.filter(c=>s.mission_rules?.coverTable?c.discovered&&!c.parent:c.type==='Cover').length>=s.locations[u.location].cover_limit)) return 'Already in cover, or the card has reached its cover potential.';
  if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(type)&&(!eligibleTargets(s,u,type).includes(target)||(target==='open'?u.cover===null:u.cover===target))) return 'Choose a different, accessible area on this card.';
  if(type==='DEPLOY_FIRE_TEAM'&&(!good(u)||(!u.named||u.steps.length!==1)))return 'Only a good-order one-step named formation can deploy its named Fire Team; command/observer capability is lost until recovered.';
  if(type==='RALLY'&&!u.pinned) return 'This unit is not pinned.';
  if(type==='RECOVER'&&(u.pinned||!['P','L','F'].includes(u.cohesion))) return 'Remove the pin first; only paralyzed, litter or fire teams need recovery.';
  if(type==='SPOT'&&(u.pinned||['P','L'].includes(u.cohesion)||!eligibleTargets(s,u,type).includes(target))) return 'Need an unpinned spotting-capable unit and a current unspotted enemy position in LOS. Potential contacts resolve during contact evaluation.';
  if(type==='SHIFT_FIRE'){
    if(!u.fire)return 'This unit is not maintaining fire to shift.';
    const originator=genericInit(s)?u:issuer??u;
    if(!s.locations[target]||!seesCard(s,originator,target))return genericInit(s)?'The firing formation must see the destination during General Initiative.':'The issuing HQ must see the Shift Fire destination.';
    if(!canFire(s,u,target))return 'The destination is outside this formation’s firing range or firing arc.';
    if(s.knowledge.suspected[target]&&!targetsAt(s,u,target).length)return 'Spot the suspected enemy position before shifting fire onto it.';
  }
  if(type==='SHIFT_FIRE'&&(coverOf(s,u)?.type==='Bunker'||s.mission_rules?.specialEnemies&&coverOf(s,u)?.type==='Pillbox')) return 'Fortification occupants cannot shift their firing arc.';
  if(type==='CEASE_FIRE'&&!u.fire&&!u.indirect) return 'This unit is not maintaining fire.';
  if(['CONCENTRATE','GRENADE','WP_ATTACK','RIFLE_GRENADE'].includes(type)) {
    if(type==='GRENADE'&&u.kind==='MORTAR'&&u.steps.length===1&&s.units[target]?.location!==u.location&&u.cohesion==='GOOD'&&u.ammo?.MTR===0)return 'Mortar ammunition is exhausted.';
    if(type!=='RIFLE_GRENADE'&&!vofOf(u))return 'This command/observer side has no weapon VOF. It cannot perform a weapon attack.';
    const t=s.units[target];
    if(!eligibleTargets(s,u,type).includes(target)||!t) return 'Choose a spotted enemy within weapon range and LOS.';
    if(type==='GRENADE'&&t.location!==u.location&&u.cohesion!=='GOOD')return 'Only the Good Order weapon side can make a ranged grenade attack.';
    if(s.mission_rules?.specialEnemies&&['GRENADE','WP_ATTACK'].includes(type)&&t.location===u.location&&['Bunker','Pillbox'].includes(coverOf(s,u)?.type))return 'Leave the fortification before making a point-blank grenade attack.';
    if(s.mission_rules?.specialEnemies&&['GRENADE','RIFLE_GRENADE'].includes(type)&&(['AT','MORTAR'].includes(u.kind)&&u.cohesion==='GOOD'&&t.location!==u.location||type==='RIFLE_GRENADE')&&enclosedWeaponCover(coverOf(s,u)))return 'This weapon cannot fire from building or fortification cover.';
    if(s.mission_rules?.specialEnemies&&type==='GRENADE'&&u.kind==='MORTAR'&&u.cohesion==='GOOD'&&(u.exposed||t.location===u.location||s.locations[u.location].terrain==='woods'))return 'Mortar teams cannot fire exposed, from woods, or at point blank.';
    if(type==='CONCENTRATE'&&concentrateAmmoReason(s,u))return concentrateAmmoReason(s,u);
    if(type==='CONCENTRATE'&&(!u.fire||u.fire!==t.location||!['S','A','A+','A/S','H'].includes(vofOf(u)))) return 'Concentrated fire must follow an existing direction of basic fire.';
    if(['GRENADE','RIFLE_GRENADE'].includes(type)&&t.location!==u.location){
      if(!followsExistingPdf(s,u,t.location))return 'Ranged grenades must follow the existing direction of fire.';
    }
    if(['GRENADE','RIFLE_GRENADE'].includes(type)&&t.location!==u.location&&occupants(s,u.location).some(v=>v.faction!==u.faction)) return 'Resolve point-blank combat before firing grenades elsewhere.';
    if(u.mission_weapon&&['GRENADE','RIFLE_GRENADE'].includes(type)&&t.location!==u.location){
      const a=s.locations[u.location],b=s.locations[t.location],d=distance(a,b);
      for(let i=1;i<d;i++){
        const id=`r${a.row+Math.sign(b.row-a.row)*i}c${a.col+Math.sign(b.col-a.col)*i}`;
        if(occupants(s,id).some(v=>(v.faction===u.faction||!friendly(u)||s.knowledge.spotted[v.id])&&!(u.kind==='MORTAR'&&u.cohesion==='GOOD'&&v.faction===u.faction)))return 'An intervening formation blocks this ranged grenade attack.';
      }
    }
  }
  if(type.startsWith('CALL_')&&s.support_agencies){
    const agency=type.includes('MORTAR')?'mortar':type.includes('CANNON')?'cannon':'artillery',definition=s.support_agencies[agency];
    const role=u.agency_role??u.id,net=definition?.networks?.[role];
    if(!good(u)||!definition?.draws[role])return 'This formation cannot call this firing agency.';
    const ammunition=type.endsWith('_TOT')?'TOT':type.endsWith('_ILLUM')?'ILLUM':type.endsWith('_WP')?'WP':'HE';
    if(ammunition==='TOT'&&!definition?.inventory?.TOT)return 'This agency has no TOT capability.';
    if(ammunition==='ILLUM'&&(!s.visibility||!definition?.inventory?.ILLUM))return 'This agency has no illumination capability.';
    if(s.support_inventory?.[agency]?.[ammunition]===0)return `${definition.name} has no ${ammunition} missions remaining.`;
    if(!net||!effectiveRadios(s,u).includes(net))return `This caller needs its working ${net??'fire-direction'} radio network.`;
    if(s.support_unavailable.includes(agency))return 'Higher HQ reports this agency unavailable this turn.';
    if(type.endsWith('_ILLUM')?(!s.locations[target]||s.locations[target].staging||s.locations[target].known===false):(!s.locations[target]||!seesCard(s,u,target)||(!type.endsWith('_WP')&&!targetsAt(s,u,target).length)))return 'Need a spotted enemy position within the caller’s LOS.';
  }
  else if(type.startsWith('CALL_')) {
    const agency=type==='CALL_MORTAR'?'MTR':'ARTY';
    if(!good(u)||!(isCompanyCommander(u)||u.agency_role===(agency==='MTR'?'mtrfo':'artyfo'))||!effectiveRadios(s,u).includes(isCompanyCommander(u)?'BN':agency)) return 'This observer needs its working fire-direction radio and good order.';
    if(!s.locations[target]||!seesCard(s,u,target)||!targetsAt(s,u,target).length) return 'Call for fire requires a spotted enemy position in the observer’s LOS.';
  }
  if(type==='INDIRECT'&&(u.out_of_ammo||u.ammo?.MTR===0))return 'Mortar ammunition is exhausted; resupply before calling indirect fire.';
  if(type==='INDIRECT'&&(!good(issuer)||!friendly(issuer)||!hq(issuer)||!chain(issuer,u,type)||!mortarCommunication(s,issuer,u)))return 'Indirect mortar fire needs an eligible good-order HQ or staff in communication with the section, including during General Initiative.';
  if(type==='INDIRECT'&&(!good(u)||u.kind!=='MORTAR'||u.steps.length<2||u.exposed||c.target_id===u.location||enclosedWeaponCover(coverOf(s,u))||s.locations[u.location].terrain==='woods'||
    !s.locations[target]||!issuer||!seesCard(s,issuer,target)||distance(s.locations[u.location],s.locations[target])>u.range||!targetsAt(s,u,target).length)) return 'Need an unexposed two-step mortar outside woods and enclosed cover, in communication with an HQ that sees the spotted target.';
  if(type==='HANDHELD_ILLUM'&&(!s.visibility||!canDeployPyrotechnic(u)||!u.assets.illum||coverOf(s,u)?.type==='Deep Bunker'||!s.locations[target]||distance(s.locations[u.location],s.locations[target])>1))return 'Need handheld illumination, an eligible unpinned unit outside a Deep Bunker, and a card here or adjacent.';
  if(type==='RIFLE_GRENADE'&&(!good(u)||!u.assets.rifle_grenade))return 'No rifle-grenade asset on this good-order unit.';
  if(type==='WP_ATTACK'&&!u.assets.wp)return 'No WP grenade asset remains on this formation.';
  if(u.mine_hit&&['MOVE','INFILTRATE','SEEK_COVER','ENTER_COVER','INFILTRATE_WITHIN','CLEAR_MINE_PATH'].includes(type))return 'Mines prevent further movement this turn.';
  if(type==='WP'&&(!canDeployPyrotechnic(u)||!u.assets.wp))return 'Requires WP smoke on a Good Order unit or unpinned Assault/Fire Team.';
  if(type.startsWith('SIGNAL_')&&s.mission_rules?.signals===false)return 'Pyrotechnic signals are not available in this mission.';
  if(type==='SMOKE'&&(!canDeployPyrotechnic(u)||!u.assets.smoke)) return 'Requires screening smoke on a Good Order unit or unpinned Assault/Fire Team.';
  if(type.startsWith('SIGNAL_')&&(!good(u)||!u.assets[type==='SIGNAL_ADVANCE'?'advance':'cease'])) return 'This unit has no remaining asset for that signal.';
  if(['DETACH','DETACH_FIRE_TEAM'].includes(type)&&(!good(u)||!((u.kind==='SQUAD'&&u.steps.length>=3&&u.steps.length<=4)||(['MG','AT','MORTAR'].includes(u.kind)&&u.steps.length===2)))) return 'Detach from a good-order three- or four-step squad or a two-step weapon team.';
  if(['DETACH','DETACH_FIRE_TEAM'].includes(type)){const reason=detachedLoadReason(s,u,c.detached_load);if(reason)return reason;}
  if(type==='RECONSTITUTE') {
    const squad=s.units[target],ids=c.contributor_ids;
    if(!squad||squad.kind!=='SQUAD'||live(squad)||squad.faction!==u.faction) return 'Choose a previously eliminated squad counter to restore.';
    if(!Array.isArray(ids)||ids.length<2||ids.length>4||new Set(ids).size!==ids.length||!ids.includes(u.id)) return 'Choose 2–4 distinct contributing teams, including the selected team.';
    if(ids.length>(squad.max_steps??squad.steps.length)) return `${squad.name} can hold at most ${squad.max_steps??0} steps; choose fewer teams.`;
    if(ids.some(id=>!reconstructionTeams(s,u,c.issuer_id).some(t=>t.id===id))) return s.mission_rules?.missionIdentity?'Every contributor must be an unpinned one-step Fire/Assault Team on the same card and in communication with the ordering HQ.':'Every contributor must be an unpinned one-step Fire/Assault Team in the same area and in communication with the ordering HQ.';
    if(s.mission_rules?.missionIdentity&&!reconstitutionFirepower(squad,ids.map(id=>s.units[id])))return 'The contributing teams cannot supply this squad’s original weapon firepower.';
  }
  if(type==='RECONSTITUTE_HQ') {
    const t=s.units[target];
    if(u.command_role==='higher_hq')return 'Visiting higher HQ officers cannot be used to reconstitute company or platoon HQs.';
    if(!restorableHQ(s,t))return s.patrol&&t?.platoon&&t.platoon!==s.patrol.plan.platoon?'Only the patrolling platoon HQ can be reconstituted during this patrol.':'Choose an eliminated HQ. Reserve, embarked and surviving HQs are not eliminated.';
    if(!issuer||issuer.cohesion!=='GOOD'||!canCommandCompany(issuer)||!good(u)||!t||live(t)||t.kind!=='HQ'||
      (t.platoon ? u.platoon!==t.platoon&&u.kind!=='STAFF' : !['HQ','STAFF','FO'].includes(u.kind))) return 'Company HQ or staff must use an eligible good-order donor to restore an eliminated HQ.';
    if(isCompanyCommander(t)) {
      const candidates=values(s.units).filter(v=>friendly(v)&&live(v)&&!isCompanyCommander(v));
      const rank=successionPriority;
      const best=Math.min(...candidates.map(rank));
      if(issuer.kind!=='STAFF'||rank(u)!==best||best===99)return 'Company staff must restore Company HQ using the XO first, then a surviving platoon HQ, Artillery Observer, then staff. A higher-ranked Fire Team must recover first.';
    }
  }
  if(['PICKUP_RADIO','PICKUP_CASUALTY'].includes(type)&&(!eligibleTargets(s,u,type).includes(target)||u.pinned||u.cohesion==='P')) return 'Choose an available item here; pinned/paralyzed units cannot transport it.';
  if(type==='PICKUP_RADIO'){const a=s.assets.find(a=>a.id===target);const load=a.type==='AMMO'?ammoLoadReason(s,u,{[a.key]:1}):transportReason(s,u,a.type==='RADIO'?1:a.quantity);if(load)return load;}
  if(type==='PICKUP_CASUALTY'&&s.casualties.filter(c=>c.carrier===u.id).length>=u.steps.length) return 'Each step can carry one casualty.';
  if(type==='DROP_CASUALTY'&&!s.casualties.some(c=>c.carrier===u.id)) return 'No casualties are being carried.';
  return null;
}
const movedThisImpulse=(s,u)=>s.impulse&&u.used.some(k=>['MOVE','INFILTRATE'].some(a=>k===`${s.impulse.id}:${a}`));
export function infiltrationReason(s,u,target,within=false) {
  if(u.pinned||u.cohesion==='P')return 'Pinned or paralyzed formations cannot infiltrate.';
  if(u.exposed)return 'Already exposed: infiltration requires an unexposed formation.';
  if(u.cohesion==='GOOD'&&(vofOf(u)==='H'||u.tripod||u.mission_weapon&&u.kind==='MORTAR'))return 'This counter side carries a heavy weapon, mortar or tripod-mounted weapon and cannot infiltrate.';
  if(!within){const reason=movementReason(s,u,target);if(reason)return reason;
    if(['F','L'].includes(u.cohesion)&&(hasFire(s,target)||friendly(u)&&!occupants(s,target).some(v=>v.faction===u.faction)))return 'Fire and litter teams may infiltrate only to a friendly-occupied card without VOF.';
  }
  if(!(engineerRulesEnabled(s)&&eligibleEngineer(u)&&s.locations[target]?.mines)&&!hasFire(s,u.location)&&!hasFire(s,target))return 'Infiltration requires fire on the origin or destination card.';
  return null;
}
const fortification = c => c&&['Trench','Bunker','Pillbox'].includes(c.type);
export function arrivalCoverOptions(s,u,target,type='MOVE'){
 const location=s.locations[target];if(!location)return [];
 const group=type.startsWith('PLATOON_')?platoonMoveGroup(s,u,target,type).filter(friendly):[u];
 const steps=group.reduce((n,v)=>n+v.steps.length,0);
 return location.covers.filter(c=>c.known&&group.every(v=>coverAvailable(s,v,c,target))&&(!c.capacity||occupants(s,target).filter(v=>v.cover===c.id).reduce((n,v)=>n+v.steps.length,0)+steps<=c.capacity)).map(c=>({id:c.id,label:`${c.type} +${c.value??0}`,steps:occupants(s,target).filter(v=>v.cover===c.id).reduce((n,v)=>n+v.steps.length,0),arriving_steps:steps}));
}
export function move(s,u,target,infiltrate=false,arrivalCover) {
  const from=u.location,old=coverOf(s,u),oldExposure=u.exposed;
  layPhoneLine(s,u);
  dropExcessAmmunition(s,u);
  const following=occupants(s,from).filter(v=>v.faction!==u.faction&&v.fire===from&&(!friendly(v)||s.knowledge.spotted[u.id])&&!occupants(s,from).some(t=>t.id!==u.id&&t.faction===u.faction));
  if(u.pinned||u.cohesion==='P')dropLoad(s,u,'withdrawal');
  const success=infiltrate&&attempt(s,u,2,'infiltrate',`${u.name}: infiltration`)>0;
  invalidateTargets(s,u);
  u.location=target;u.cover=null;u.fire=null;u.fire_direction=null;u.fire_effect=null;u.indirect=null;
  for(const v of following)if(canFire(s,v,target)){v.fire=target;v.fire_direction=null;v.fire_effect=null;}
  const cover=arrivalCover==='open'?null:arrivalCover!==undefined?s.locations[target].covers.find(c=>c.id===arrivalCover):s.locations[target].covers.find(c=>(!friendly(u)||c.known)&&coverAvailable(s,u,c,target));
  if(cover)u.cover=cover.id;
  u.exposed=!(success||(s.locations[from].staging&&s.locations[target].staging)||(fortification(old)&&fortification(cover)));
  for(const c of s.casualties.filter(c=>c.carrier===u.id)){c.location=target;c.transported=true;}
  if(infiltrate&&engineerRulesEnabled(s)&&eligibleEngineer(u)&&s.locations[target].mines){u.exposed=oldExposure;markEngineerPath(s,u,success);}else if(s.mission_rules?.specialEnemies)checkMines(s,u);
  emit(s,'UNIT_MOVED',`${u.name} ${success?'infiltrated':'moved'} to ${s.locations[target].name}${u.exposed?'; exposed until cleanup':''}.`,{actor:u.id,from,target,exposed:u.exposed,faction:u.faction},!visible(s,u));
}
export function invalidateTargets(s,u) {
  for(const m of s.markers.filter(m=>m.target===u.id||u.cover&&m.cover===u.cover)) {
    if(m.type==='GRENADE') s.markers.push({type:'GRENADE_MISS',location:u.location});
  }
  s.markers=s.markers.filter(m=>m.target!==u.id&&!(u.cover&&m.cover===u.cover));
}
export function seekCover(s,u,upper=false) {
  const l=s.locations[u.location];
  if(l.staging||u.cover||l.covers.filter(c=>s.mission_rules?.coverTable?c.discovered&&!c.parent:c.type==='Cover').length>=l.cover_limit)return false;
  const success=attempt(s,u,l.cover_draw,'cover',`${u.name}: seek cover`)>0;
  if(success){const c=s.mission_rules?.coverTable?discoveredCover(s,l,!!visible(s,u)): {id:`cover_${l.id}_${l.covers.length+1}`,type:'Cover',value:1,known:friendly(u)};if(!s.mission_rules?.coverTable)l.covers.push(c);const upperCover=upper?l.covers.find(v=>v.parent===c.id&&coverAvailable(s,u,v)):null;u.cover=(upperCover??c).id;u.exposed=true;if(s.mission_rules?.specialEnemies)checkMines(s,u);}
  emit(s,'COVER_ATTEMPT',`${u.name} ${success?'found and occupied additional cover; exposed while moving':'found no additional cover'}.`,{actor:u.id,success,...(s.mission_rules?.coverTable?{location:u.location,cover:success?u.cover:null,upper_story:success&&!!coverOf(s,u)?.parent}:{})},!visible(s,u));
  return success;
}
export function rally(s,u,issuer=u,recover=false) {
  const success=!hasFire(s,u.location)||attempt(s,issuer,2,'rally',`${u.name}: ${recover?'cohesion recovery':'unpin'}`,!visible(s,u))>0;
  if(success) {
    if(!recover)u.pinned=false;
    else {
      const previous=u.cohesion;
      u.cohesion=u.cohesion==='F'&&u.named ? 'GOOD' : ({P:'L',L:'F',F:'A'})[u.cohesion];
      if(!u.named)u.name=u.name.replace(/^(Paralyzed|Litter|Fire|Assault) team/,`${({P:'Paralyzed',L:'Litter',F:'Fire',A:'Assault'})[u.cohesion]} team`);
      if(u.cohesion==='GOOD')u.experience=u.original_experience;
      else {u.experience=u.cohesion==='A'?'Line':'Green';u.range=u.cohesion==='A'?0:1;}
      emit(s,'COHESION_CHANGED',`${u.name}: ${previous} → ${u.cohesion}.`,{actor:u.id,from:previous,to:u.cohesion},!visible(s,u));
    }
  }
  emit(s,'RALLY_ATTEMPT',`${u.name}: ${success ? (recover?'cohesion recovered':'pin removed') : 'rally failed'}.`,{actor:u.id,success},!visible(s,u));
}
export function grenade(s,u,t,response=false,wp=false) {
  if(coverOf(s,u)?.type==='Deep Bunker')return;
  if(response&&s.mission_contacts&&['Bunker','Pillbox'].includes(coverOf(s,u)?.type))return;
  const mortar=!wp&&u.mission_weapon&&u.kind==='MORTAR'&&u.cohesion==='GOOD'&&u.steps.length===1&&u.location!==t.location;
  if(!wp&&u.location!==t.location&&u.grenade_ammo&&!expendAmmunition(s,u,u.grenade_ammo,1,'ranged grenade'))return;
  if(mortar&&!expendAmmunition(s,u,'MTR',1,'direct-lay grenade'))return;
  if(!wp&&u.location!==t.location&&!u.grenade_ammo&&u.ammo?.RKT!==undefined&&!expendAmmunition(s,u,'RKT',1,'ranged grenade'))return;
  if(mortar){u.temporary_pdf={origin:u.location,target:t.location};emit(s,'MORTAR_PDF_PLACED','Mortar direct lay establishes a temporary firing direction; it counts for crossfire even if the attack misses.',{actor:visible(s,u)?u.id:null,origin:u.location,target:t.location},!visible(s,u)&&!visible(s,t));}
  const targets=t.cover?occupants(s,t.location).filter(v=>v.cover===t.cover&&v.faction===t.faction):[t];
  const successes=attempt(s,u,2,'grenade',`${visible(s,u)?u.name:'Unidentified unit'}: grenade attack`,!visible(s,u)&&!friendly(t),batch=>u.location===t.location||!weaponJam(s,u,batch),response||!s.impulse,response);
  if(successes) s.markers.push({type:'GRENADE',source:u.id,origin:u.location,location:t.location,target:t.cover?null:t.id,cover:t.cover,critical:successes>1,
    value:(wp?-4:s.mission_rules?.grenade??(friendly(u)?-4:-3))*(successes>1&&!t.cover?2:1),...(wp?{weapon:'WP'}:mortar?{weapon:'MORTAR'}:{})});
  else if(!s.markers.some(m=>m.type==='GRENADE_MISS'&&m.location===t.location))s.markers.push({type:'GRENADE_MISS',location:t.location});
  if(wp){const l=s.locations[t.location];l.smoke_value=Math.max(l.smoke?(l.smoke_value??2):0,1);l.smoke=true;emit(s,'WP_DEPLOYED','WP grenade deployed; screening applies whether the attack succeeds or misses.',{location:t.location},!visible(s,u)&&!visible(s,t));}
  emit(s,'GRENADE_ATTEMPT',`${visible(s,u)?u.name:'Unidentified attacker'}: ${successes?'grenade attack placed':'grenade miss'} at ${s.locations[t.location].name}${successes>1?' (critical)':''}; effects resolve in mutual combat.`,{actor:visible(s,u)?u.id:null,target:visible(s,t)?t.id:null,success:!!successes,point_blank:u.location===t.location},!visible(s,u)&&!visible(s,t));
  if(!response&&u.location===t.location)for(const v of targets)if(live(v)&&!v.pinned&&['GOOD','A','F'].includes(v.cohesion)&&vofOf(v)&&(v.cohesion==='GOOD'||successes)&&(!friendly(v)||s.knowledge.spotted[u.id]))grenade(s,v,u,true);
}
export function concentrate(s,u,t) {
  if(concentrateAmmoReason(s,u))return false;
  if(!t.cover)t=pick(s,areaTargets(s,u).filter(v=>v.location===t.location&&!v.cover),'Concentrated fire: random out-of-cover target',!friendly(u));
  const n=attempt(s,u,2+(u.mission_weapon&&u.tripod&&(!u.tripod_good_only||u.cohesion==='GOOD')?1:0),'spot',`${u.name}: concentrated fire`,!visible(s,u),batch=>!weaponJam(s,u,batch));
  if(n&&s.mission_rules?.ammo==='tracked'){const key=basicFireAmmoKey(u);if(key&&!expendAmmunition(s,u,key,1,'concentrated fire'))return;}
  if(n)s.markers.push({type:'CONCENTRATE',location:t.location,target:t.cover?null:t.id,cover:t.cover,source:u.id,critical:n>1,value:n>1&&!t.cover?2:1});
  emit(s,'CONCENTRATE_ATTEMPT',`${visible(s,u)?u.name:'Unidentified attacker'}: ${n?'concentrated fire established':'concentrated fire failed'}.`,{actor:visible(s,u)?u.id:null,target:visible(s,t)?t.id:null,success:!!n},!visible(s,u)&&!visible(s,t));
}
export function spottingBaseDraws(s,u,t) {
  const l=s.locations[t.location],protection=terrainProtection(l,s.locations[u.location]);
  return 2+(unitElevation(s,u)>unitElevation(s,t)?1:0)+(u.location===t.location?1:0)+(protection>=3?-1:protection===0?1:0)
    -(t.cover?1:0)+(t.exposed?2:0)+(t.vof==='A'?1:['H','G'].includes(t.vof)?2:0)-expMod(t)-(['FO','SPOTTER','SNIPER'].includes(t.kind)?1:0);
}
export function spotAttempt(s,u,id) {
  const targets=occupants(s,id).filter(t=>t.faction!==u.faction&&!s.knowledge.spotted[t.id]&&unitLos(s,u,t));
  const l=s.locations[id],countFor=t=>spottingBaseDraws(s,u,t);
  // Attempt against the easiest unit to spot; success reveals the whole card.
  const t=targets.sort((a,b)=>countFor(b)-countFor(a)||a.id.localeCompare(b.id))[0];
  // Spotting targets actual unspotted positions, never unresolved potential contacts.
  if(!t)return;
  const count=countFor(t);
  const success=attempt(s,u,count,'spot',`${u.name}: observe ${l.name}`)>0;
  const found=!!t&&success;
  if(found)spot(s,t);
  emit(s,'OBSERVATION',`${u.name}: ${found?'enemy position identified':'no additional enemy identified'}.`,{actor:u.id,location:id,success:found});
}
export function splitTeam(s,u,cohesion,step) {
  const id=`lat_${s.next_id++}`;
  const unit={...structuredClone(u),id,name:`${cohesion==='A'?'Assault':cohesion==='F'?'Fire':cohesion==='L'?'Litter':'Paralyzed'} team ${id.slice(4)}`,
    kind:'LAT',steps:[step],cohesion,named:false,fire_team_vof:null,tripod:false,vof:'S',range:cohesion==='A'?0:1,radios:[],assets:{},ammo:s.mission_rules?.ammo==='tracked'?{}:structuredClone(u.ammo??{}),initial_resources:s.mission_rules?.ammo==='tracked'?{radios:[],assets:{},ammo:{}}:structuredClone(u.initial_resources),fire:null,indirect:null,experience:cohesion==='A'?'Line':'Green',used:[],removed:null};
  if(unit.temporary_pdf)delete unit.temporary_pdf;
  if(s.mission_contacts){unit.parent_counter_id=u.counter_id??u.parent_counter_id;unit.counter_id=null;}
  s.units[id]=unit;return unit;
}
function detachedLoadReason(s,u,load){
 if(!load)return null;
 if(typeof load!=='object'||Array.isArray(load)||!Array.isArray(load.radios??[]))return 'Choose valid detached-team equipment.';
 const radios=load.radios??[],assets=load.assets??{},ammo=load.ammo??{};
 if(radios.some(net=>radios.filter(n=>n===net).length>u.radios.filter(n=>n===net).length))return 'Detached-team radios exceed carried stock.';
 for(const [stock,requested]of [[u.assets,assets],[u.ammo??{},ammo]])if(Object.entries(requested).some(([key,n])=>!Number.isInteger(n)||n<0||n>(stock[key]??0)))return 'Detached-team quantities exceed carried stock.';
 const recipient={...u,id:'detached-load',kind:'LAT',steps:[u.steps.at(-1)],radios,assets,ammo:{}};
 return transportReason(s,recipient)||ammoLoadReason(s,recipient,ammo);
}
function allocateDetachedLoad(s,u,t,load){
 if(!load)return;
 for(const net of load.radios??[]){u.radios.splice(u.radios.indexOf(net),1);t.radios.push(net);transferEquipmentResupply(s,t,{type:'RADIO',net,source_unit:u.id});}
 for(const [key,quantity]of Object.entries(load.assets??{})){u.assets[key]-=quantity;t.assets[key]=quantity;transferEquipmentResupply(s,t,{type:'EQUIPMENT',key,quantity,source_unit:u.id});}
 for(const [key,quantity]of Object.entries(load.ammo??{})){u.ammo[key]-=quantity;t.ammo[key]=quantity;const n=Math.min(u.initial_resources?.ammo?.[key]??0,quantity);if(n){u.initial_resources.ammo[key]-=n;t.initial_resources.ammo[key]=n;}}
 emit(s,'DETACHED_LOAD_ASSIGNED',`${t.name}: selected carried equipment transferred with detachment.`,{actor:t.id,source:u.id,load:structuredClone(load)});
}
function restoreHQ(s,u,t){
 t.steps=[u.steps.pop()];t.location=u.location;t.cover=u.cover;t.removed=null;t.cohesion='GOOD';t.experience=t.original_experience='Green';t.saved=0;t.radios=[];t.pinned=false;
 if(!u.steps.length){dropLoad(s,u,'HQ reconstitution');u.removed='RECONSTITUTED';}
 else if(u.kind==='SQUAD'&&u.steps.length===1){splitTeam(s,u,'F',u.steps.pop());dropLoad(s,u,'HQ reconstitution remainder');u.removed='RECONSTITUTED';}
 emit(s,'HQ_RECONSTITUTED',`${t.name} restored at Green experience; recover a radio to restore its net.`,{actor:t.id,donor:u.id,location:t.location,donor_name:u.name,restored_name:t.name});
}
function weaponJam(s,u,batch){
 if(s.mission_rules?.ammo!=='tracked'||!batch.some(c=>c.jam)||u.cohesion!=='GOOD'||!(u.weapon_jam||['A','A+','H','G'].includes(u.vof)&&u.kind!=='SQUAD'||u.kind==='SQUAD'&&['A','A+'].includes(u.vof)&&u.ammo?.MG!==undefined))return false;
 const steps=u.steps.splice(0);dropLoad(s,u,'weapon jam');u.removed='JAMMED';u.fire=null;u.indirect=null;
 for(const step of steps)splitTeam(s,u,'F',step);
 emit(s,'WEAPON_JAMMED',`${visible(s,u)?u.name:'Enemy weapon'} jammed; surviving steps became Fire Teams.`,{actor:visible(s,u)?u.id:null,location:u.location,steps:steps.length},!visible(s,u));
 return true;
}
// Shared by execution and the preview. Account for arrivals in execution order,
// without moving units, drawing cards, or changing the command state.
export function platoonMoveGroup(s,u,target,type='PLATOON_MOVE') {
  const group=occupants(s,u.location).filter(v=>v.platoon===u.platoon&&good(v)&&!movedThisImpulse(s,v)&&communication(s,u,v)&&!movementReason(s,v,target)&&(!type.includes('INFILTRATE')||!infiltrationReason(s,v,target)));
  let steps=occupants(s,target).filter(v=>v.faction===u.faction).reduce((n,v)=>n+v.steps.length,0);
  return group.filter(v=>{if(!s.locations[target].staging&&steps+v.steps.length>16)return false;steps+=v.steps.length;return true;});
}
export function execute(s,c) {
  const u=s.units[c.unit_id],issuer=s.units[c.issuer_id]??u,type=c.type,t=s.units[c.target_id];
  if(['SKILL_EXTRA_AUTOMATIC','SKILL_GRENADE_RETURN'].includes(type))return;
  if(type==='SKILL_GENERAL')s.impulse.commands++;
  else if(type.startsWith('SKILL_SPAWN'))splitTeam(s,u,type.endsWith('_A')?'A':'F',u.steps.pop());
  else if(type.startsWith('SKILL_PARALYZED')){
   const from=u.cohesion;u.cohesion=type.endsWith('_A')?'A':'F';u.experience=u.cohesion==='A'?'Line':'Green';u.range=u.cohesion==='A'?0:1;
   emit(s,'COHESION_CHANGED',`${u.name}: ${from} → ${u.cohesion}.`,{actor:u.id,from,to:u.cohesion});
  }
  else if(type==='ACTIVATE'){
    s.activated.push(t.id);
    emit(s,'HQ_ACTIVATED',`${t.name} activated. Complete Company HQ’s impulse, then select ${t.name} in 3.3.1c to spend its commands.`,{hq:t.id,issuer:u.id});
  }
  else if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)) {
    const group=type.startsWith('PLATOON_')?platoonMoveGroup(s,u,c.target_id,type):[u];
    for(const v of group) {if(movementReason(s,v,c.target_id))continue;move(s,v,c.target_id,type.includes('INFILTRATE'),c.arrival_cover);v.used.push(`${s.impulse.id}:${type.includes('INFILTRATE')?'INFILTRATE':'MOVE'}`);}
  }
  else if(type==='CLEAR_MINE_PATH')markEngineerPath(s,u,attempt(s,u,2,'infiltrate',`${u.name}: minefield path infiltration`)>0);
  else if(type==='SEEK_COVER'||type==='SEEK_COVER_UPPER')seekCover(s,u,type==='SEEK_COVER_UPPER');
  else if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(type)){
    const old=coverOf(s,u),oldExposure=u.exposed,success=type==='INFILTRATE_WITHIN'&&attempt(s,u,2,'infiltrate',`${u.name}: within-card infiltration`)>0;
    invalidateTargets(s,u);u.cover=c.target_id==='open'?null:c.target_id;
    u.exposed=u.exposed||!(success||(fortification(old)&&fortification(coverOf(s,u))));
    if(type==='INFILTRATE_WITHIN'&&engineerRulesEnabled(s)&&eligibleEngineer(u)&&s.locations[u.location].mines){u.exposed=oldExposure;markEngineerPath(s,u,success);}else if(s.mission_rules?.specialEnemies)checkMines(s,u);
    emit(s,'WITHIN_CARD_MOVED',`${u.name} moved ${u.cover?'under cover':'out of cover'}${success?' by infiltration':u.exposed?'; exposed until cleanup':'; protected by fortifications'}.`,{actor:u.id,exposed:u.exposed});
  }
  else if(type==='DEPLOY_FIRE_TEAM'){u.cohesion='F';u.fire=null;emit(s,'COHESION_CHANGED',`${u.name} deployed its named Fire Team; recover it to restore command/observer capability.`,{actor:u.id,from:'GOOD',to:'F'});}
  else if(type==='ASSAULT_TO_FIRE'){u.cohesion='F';u.experience='Green';u.range=1;u.name=u.name.replace(/^Assault team/,'Fire team');emit(s,'COHESION_CHANGED',`${u.name}: Assault → Fire Team.`,{actor:u.id,from:'A',to:'F'});}
  else if(type==='SUPPLEMENT'){
   const experience=u.experience;
   const own=structuredClone(u);
   u.steps.push(...t.steps);transferReconstitutionLoads(s,u,[own,t]);u.experience=u.original_experience=experience;u.exposed=u.exposed||t.exposed;for(const step of u.steps)step.experience=experience;
   t.steps=[];t.removed='SUPPLEMENTED';t.fire=null;t.indirect=null;
   emit(s,'SQUAD_SUPPLEMENTED',`${u.name} supplemented by ${t.name}; one existing step transferred.`,{actor:u.id,donor:t.id,location:u.location});
  }
  else if(type==='SWITCH_NETWORK'){
   const [from,to]=c.target_id.split(' → '),removed=s.assets.find(a=>a.type==='RADIO'&&a.destroyed&&a.net===to&&a.faction===u.faction);
   u.radios[u.radios.indexOf(from)]=to;removed.net=from;
   const stock=u.initial_resources?.radios,index=stock?.indexOf(from)??-1;if(index>=0)stock[index]=to;
   const previous=s.units[removed.source_unit]?.initial_resources?.radios,oldIndex=previous?.indexOf(to)??-1;if(oldIndex>=0)previous[oldIndex]=from;
   emit(s,'NETWORK_SWITCHED',`${u.name}: ${from} → ${to}; same hardware type.`,{actor:u.id,from,to});
  }
  else if(type==='DESIGNATE_CCP'){s.objectives.ccp=u.location;emit(s,'TACTICAL_CONTROL_DESIGNATED',`CCP relocated to ${s.locations[u.location].name}.`,{actor:u.id,control:'CCP',location:u.location});}
  else if(type==='TRANSFER_EQUIPMENT'){
   const [,id,category,key]=c.target_id.split(':'),donor=s.units[id],quantity=c.quantity??1;
   if(category==='RADIO'){for(let i=0;i<quantity;i++){donor.radios.splice(donor.radios.indexOf(key),1);u.radios.push(key);transferEquipmentResupply(s,u,{type:'RADIO',net:key,source_unit:id});}}
   else if(category==='EQUIPMENT'){donor.assets[key]-=quantity;u.assets[key]=(u.assets[key]??0)+quantity;transferEquipmentResupply(s,u,{type:'EQUIPMENT',key,quantity,source_unit:id});}
   else {donor.ammo[key]-=quantity;u.ammo[key]=(u.ammo[key]??0)+quantity;const stock=Math.min(donor.initial_resources?.ammo?.[key]??0,quantity);if(stock){donor.initial_resources.ammo[key]-=stock;u.initial_resources??={radios:[],assets:{},ammo:{}};u.initial_resources.ammo[key]=(u.initial_resources.ammo[key]??0)+stock;}ammunitionResupplied(s,u,key);if(donor.ammo[key]===0)donor.out_of_ammo=true;}
   u.exposed=true;donor.exposed=true;
   emit(s,'EQUIPMENT_TRANSFERRED',`${donor.name} → ${u.name}: ${quantity} ${key}; both exposed.`,{actor:u.id,donor:id,category,key,quantity,location:u.location});
  }
  else if(type==='RALLY'||type==='RECOVER')rally(s,u,genericInit(s)?u:issuer,type==='RECOVER');
  else if(type==='SPOT')spotAttempt(s,u,c.target_id);
  else if(type==='SHIFT_FIRE'||type==='CEASE_FIRE') {
    for(const v of occupants(s,u.location).filter(v=>v.faction===u.faction)){v.fire=type==='SHIFT_FIRE'?c.target_id:null;v.indirect=null;}
    s.markers=s.markers.filter(m=>m.type!=='CONCENTRATE'||fireSource(s,m.source)?.location!==u.location);
  }
  else if(type==='GRENADE'||type==='RIFLE_GRENADE'){if(type==='RIFLE_GRENADE')u.assets.rifle_grenade--;grenade(s,u,t);}
  else if(type==='WP_ATTACK'){u.assets.wp--;grenade(s,u,t,false,true);}
  else if(type==='CONCENTRATE')concentrate(s,u,t);
  else if(['PLATOON_CONCENTRATE','PLATOON_GRENADE'].includes(type)){
   const action=type==='PLATOON_CONCENTRATE'?'CONCENTRATE':'GRENADE',group=platoonCombatGroup(s,u,t,type);
   for(const member of group){if(action==='CONCENTRATE')concentrate(s,member,t);else grenade(s,member,t);member.used.push(`${s.impulse.id}:${action}`);}
   emit(s,'PLATOON_ATTACK',`${u.name}: ${ACTIONS[type]}, ${group.length} eligible formations.`,{actor:u.id,participants:group.map(v=>v.id),target:t.id});
  }
  else if(type==='HANDHELD_ILLUM'){u.assets.illum--;placeIllumination(s,c.target_id,'handheld',u.id);emit(s,'ILLUMINATION_DEPLOYED',`${u.name} deployed handheld illumination.`,{actor:u.id,location:c.target_id,delivery:'handheld'});}
  else if(type.startsWith('CALL_')&&s.support_agencies)supportRequest(s,u,type.includes('MORTAR')?'mortar':type.includes('CANNON')?'cannon':'artillery',type.endsWith('_TOT')?'TOT':type.endsWith('_ILLUM')?'ILLUM':type.endsWith('_WP')?'WP':'HE',c.target_id);
  else if(type.startsWith('CALL_')) {
    const success=attempt(s,u,isCompanyCommander(u)?1:2,'burst',`${u.name}: call for fire`)>0;
    if(success)s.support.push({id:`support_${s.next_id++}`,location:c.target_id,status:'PENDING',value:type==='CALL_MORTAR'?-3:-5,source:u.id});
    emit(s,'SUPPORT_REQUEST',`${u.name}: ${success?'fire mission pending; activates in Fire Mission Update':'fire request failed'}.`,{actor:u.id,location:c.target_id,success});
  }
  else if(type==='INDIRECT'){u.fire=null;u.indirect=c.target_id;}
  else if(type==='WP'){u.assets.wp--;const l=s.locations[u.location];l.smoke_value=Math.max(l.smoke?(l.smoke_value??2):0,1);l.smoke=true;emit(s,'SMOKE_DEPLOYED',`WP smoke deployed at ${l.name}.`,{actor:u.id,location:u.location});}
  else if(type==='SMOKE'){u.assets.smoke--;s.locations[u.location].smoke=true;s.locations[u.location].smoke_value=2;emit(s,'SMOKE_DEPLOYED',`Screening smoke at ${s.locations[u.location].name}: blocks outgoing and through LOS.`,{actor:u.id});}
  else if(type.startsWith('SIGNAL_')) {
    u.assets[type==='SIGNAL_ADVANCE'?'advance':'cease']--;
    for(const v of values(s.units).filter(v=>friendly(v)&&live(v))) {
      if(type==='SIGNAL_CEASE'){v.fire=null;v.indirect=null;}
      else if(s.locations[v.location].row===s.signal_phase_line-1){const dest=`r${s.signal_phase_line}c${s.locations[v.location].col}`;if(!movementReason(s,v,dest))move(s,v,dest);}
    }
    emit(s,'SIGNAL_DEPLOYED',`${u.name} deployed the ${type==='SIGNAL_ADVANCE'?'cross phase line 2':'cease fire'} signal.`,{actor:u.id});
  }
  else if(type.startsWith('PYRO_')){
    const key=type.slice(5).toLowerCase(),order=s.signal_plan[key],aerial=!key.endsWith('_signal');
    u.assets[key]--;
    const seen=values(s.units).filter(v=>friendly(v)&&live(v)&&(aerial||seesCard(s,v,c.target_id)));
    const moved=[];
    if(order==='CF')for(const v of Object.values(s.vire_runtime?.vehicles??{}).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&(aerial||seesCard(s,{...v,cover:null},c.target_id)))){v.fire=null;v.fire_direction=null;}
    for(const v of seen){
      if(order==='CF'){v.fire=null;v.indirect=null;continue;}
      const line=order.startsWith('XPL')?(s.phase_lines?.[order.at(-1)]??Number(order.at(-1))):null;
      const destination=order==='M2S'?c.target_id:order==='M2PO'||order==='INFAP2PO'?s.objectives.primary:order==='M2SO'||order==='INFAP2SO'?s.objectives.secondary:order.startsWith('XPL')?`r${line}c${s.locations[v.location].col}`:null;
      if(s.patrol&&(patrolMovementReason(s.patrol,v)||patrolHoldReason(s,destination)))continue;
      if(!destination||order.startsWith('INFAP')&&v.location!==s.objectives.attack||order.startsWith('XPL')&&s.locations[v.location].row!==line-1||movementReason(s,v,destination))continue;
      const infiltrate=order.startsWith('INFAP');
      if(infiltrate&&infiltrationReason(s,v,destination))continue;
      move(s,v,destination,infiltrate);moved.push(v.id);
    }
    emit(s,'SIGNAL_DEPLOYED',`${u.name} deployed ${key.replaceAll('_',' ')} for ${order}.`,{actor:u.id,location:c.target_id,device:key,order,seen:seen.map(v=>v.id),moved});
  }
  else if(['DETACH','DETACH_FIRE_TEAM'].includes(type)){const step=u.steps.pop(),detached=splitTeam(s,u,type==='DETACH_FIRE_TEAM'?'F':'A',step);allocateDetachedLoad(s,u,detached,c.detached_load);}
  else if(type==='RECONSTITUTE') {
    const group=c.contributor_ids.map(id=>s.units[id]);
    if(attempt(s,issuer,2,'rally','Reconstitute squad')) {
      const squad=s.units[c.target_id];
      squad.steps=group.flatMap(v=>v.steps);squad.location=u.location;squad.cover=u.cover;squad.cohesion='GOOD';squad.removed=null;squad.pinned=false;squad.exposed=group.some(v=>v.exposed);squad.fire=null;
      squad.experience=group.filter(v=>v.experience==='Line').length>=Math.ceil(group.length/2)?'Line':'Green';
      if(s.mission_rules?.missionIdentity)reconstitutionLoads(s,squad,group);
      for(const v of group){v.steps=[];v.removed='RECONSTITUTED';}
      emit(s,'FORMATION_RECONSTITUTED',`${squad.name} restored with ${group.length} steps from ${group.map(v=>v.name).join(', ')}.`,{actor:squad.id,contributors:group.map(v=>v.id),location:u.location});
    }
  }
  else if(type==='RECONSTITUTE_HQ')restoreHQ(s,u,t);
  else if(type==='PICKUP_RADIO'){const a=s.assets.find(a=>a.id===c.target_id);transferEquipmentResupply(s,u,a);if(a.type==='RADIO')u.radios.push(a.net);else if(a.type==='AMMO')pickUpAmmunition(s,u,a);else u.assets[a.key]=(u.assets[a.key]??0)+a.quantity;if(a.type!=='AMMO')s.assets=s.assets.filter(v=>v.id!==a.id);u.exposed=true;}
  else if(type==='REPAIR_PHONE_LINE'){
    const line=s.phone_lines.find(line=>line.location===u.location&&line.cut);
    line.cut=false;u.exposed=true;
    emit(s,'PHONE_LINE_REPAIRED',`${u.name} repaired the phone line at ${s.locations[u.location].name}.`,{actor:u.id,location:u.location,line_id:line.id});
  }
  else if(type==='CREATE_RUNNER')createRunner(s,c.target_id?s.units[c.target_id]:u);
  else if(type==='DISPATCH_RUNNER')dispatchRunner(s,t);
  else if(type==='DISMISS_RUNNER')dismissRunner(s,u);
  else if(type==='PICKUP_CASUALTY'){
    const casualty=s.casualties.find(v=>v.id===c.target_id),donor=s.units[casualty.carrier];if(donor)donor.exposed=true;casualty.carrier=u.id;casualty.location=u.location;casualty.cover=u.cover;u.exposed=true;
    emit(s,'CASUALTY_PICKED_UP',`${u.name} picked up ${casualty.origin_name??'a friendly formation'} casualty step; exposed while loading.`,{actor:u.id,casualty_id:casualty.id,location:u.location});
  }
  else if(type==='DROP_CASUALTY'){
    for(const v of s.casualties.filter(v=>v.carrier===u.id)){v.carrier=null;v.location=u.location;v.cover=u.cover;}
    emit(s,'CASUALTIES_DROPPED',`${u.name} unloaded carried casualties at ${s.locations[u.location].name}.`,{actor:u.id,location:u.location});
  }
}
export function submitCommand(state,command) {
  const reason=orderReason(state,command);
  if(reason)return {state,events:[],accepted:false,reason};
  const s=structuredClone(state),u=s.units[command.unit_id],key=actionKey(u,command.type,command.target_id);
  if(command.type==='BN_RECONSTITUTE_CO'){
   s.offmap_bn_commands=(s.offmap_bn_commands??visibilityCommandLimits(s.visibility).spend)-1;
   emit(s,'COMMAND_ISSUED',`Off-map BN HQ: reconstitute Company HQ from ${u.name}; one command.`,{command:structuredClone(command)});
   restoreHQ(s,u,companyCommander(s));revealTerrain(s);refresh(s);s.replay.push({op:'submitCommand',command:structuredClone(command)});return result(state,s,{accepted:true});
  }
  if(s.mission_rules?.specialEnemies&&['DROP_LOAD','DROP_CASUALTY'].includes(command.type)){
    if(command.type==='DROP_LOAD'&&command.drop_items!==undefined){
      dropItems(s,u,command.drop_items);if(s.phase!=='COMBAT_EFFECTS')refresh(s);
      s.replay.push({op:'submitCommand',command:structuredClone(command)});return result(state,s,{accepted:true});
    }
    if(command.type==='DROP_LOAD')dropLoad(s,u,'voluntary unload');
    for(const c of s.casualties.filter(c=>c.carrier===u.id)){c.carrier=null;c.location=u.location;c.cover=u.cover;}
    emit(s,'ASSETS_DROPPED',`${u.name}: carried items unloaded without a command or exposure.`,{actor:u.id,location:u.location});
    s.replay.push({op:'submitCommand',command:structuredClone(command)});
    return result(state,s,{accepted:true});
  }
  const beforeFire=command.type==='CEASE_FIRE'||command.type==='SHIFT_FIRE'?occupants(s,u.location).filter(v=>v.faction===u.faction&&(v.fire||v.indirect)).map(v=>v.id):[];
  const contributors=command.type==='RECONSTITUTE'?` using ${command.contributor_ids.map(id=>s.units[id].name).join(', ')}`:'';
  const event=emit(s,'COMMAND_ISSUED',`${s.impulse.hq==='general'?'General initiative':s.units[s.impulse.hq].name}: ${ACTIONS[command.type]} — ${u.name}${command.target_id?' → '+(s.locations[command.target_id]?.name??s.units[command.target_id]?.name??command.target_id):''}${contributors}.`,{command:structuredClone(command)});
  s.impulse.commands-=costOf(command.type);s.impulse.spent+=costOf(command.type);
  if((s.mission_rules?.reattempts||s.patrol)&&genericInit(s)&&HQ_ORIGIN_ACTIONS.includes(command.type)&&!(s.mission_rules?.missionIdentity&&['DETACH','DETACH_FIRE_TEAM'].includes(command.type))){
   s.impulse.origin_spent??={};s.impulse.origin_spent[command.issuer_id]=(s.impulse.origin_spent[command.issuer_id]??0)+costOf(command.type);
  }
  u.used.push(`${s.impulse.id}:${key}`);
  if(['SKILL_EXTRA_AUTOMATIC','SKILL_GRENADE_RETURN'].includes(command.type)){
   const p=skillOptions(s,u,command.type).find(p=>!command.skill_id||p.id===command.skill_id);
   s.automatic_skills??={};s.automatic_skills[u.id]=p.id;
   emit(s,'SKILL_ASSIGNED',`${u.name}: ${SKILLS[p.type].label} assigned to its next ${p.type==='AUTO_GRENADE'?'grenade return':'automatic'} attempt.`,{actor:u.id,holder:p.holder,skill_id:p.id});
  }else if(command.skill_id||command.type.startsWith('SKILL_')){
   const actor=skillActor(s,u,command.type,command.issuer_id),p=skillOptions(s,actor,command.type).find(p=>!command.skill_id||p.id===command.skill_id),definition=SKILLS[p.type];
   s.skills.find(v=>v.id===p.id).used=true;
   for(const [id,skill]of Object.entries(s.automatic_skills??{}))if(skill===p.id)delete s.automatic_skills[id];
   s.active_skill={actor:actor.id,extra:definition.extra,icon:definition.icon,applied:false};
   emit(s,'SKILL_USED',`${u.name}: ${definition.label}.`,{actor:u.id,holder:p.holder,skill_id:p.id,skill:p.type});
  }
  if(command.exhort){const recipients=command.type.startsWith('PLATOON_')?values(s.units).filter(v=>v.platoon===u.platoon&&v.location===u.location&&friendly(v)&&good(v)&&communication(s,u,v)).map(v=>v.id):[u.id];s.active_exhort={issuer:command.issuer_id,actors:['RALLY','RECOVER','RECONSTITUTE'].includes(command.type)?[command.issuer_id]:recipients,used:false};}
  execute(s,command);
  delete s.active_exhort;
  delete s.active_skill;
  for(const casualty of s.casualties.filter(c=>c.carrier)){const carrier=s.units[casualty.carrier];casualty.location=carrier.location;casualty.cover=carrier.cover;}
  revealTerrain(s);refresh(s);
  if(['CEASE_FIRE','SHIFT_FIRE'].includes(command.type)){
    const fires=s.fire.filter(f=>f.origin===u.location&&fireSource(s,f.source).faction===u.faction);
    const stopped=beforeFire.map(id=>s.units[id].name).join(', ')||'No active sources';
    const reopened=[...new Set(fires.map(f=>fireSource(s,f.source).name))].join(', ');
    emit(s,'FIRE_ORDER_RESULT',`${command.type==='CEASE_FIRE'?'Card-wide cease fire':'Card-wide shift fire'} at ${s.locations[u.location].name}. Previous sources: ${stopped}. ${fires.length?`${command.type==='CEASE_FIRE'?'Automatic fire reopened':'Fire now directed'} toward ${[...new Set(fires.map(f=>s.locations[f.target].name))].join(', ')} by ${reopened}.`:'Fire stopped; no eligible target caused automatic reopening.'}`,{actor:u.id,location:u.location,affected:beforeFire,reopened:[...new Set(fires.map(f=>f.source))]});
  }
  emit(s,'COMMAND_RESOLVED','Order resolved; fire relationships updated.',{caused_by_event_id:event.id});
  s.replay.push({op:'submitCommand',command:structuredClone(command)});
  return result(state,s,{accepted:true});
}
export function commandOptions(s,u,issuerId) {
  return Object.entries(ACTIONS).filter(([type])=>(type!=='CLEAR_MINE_PATH'||engineerRulesEnabled(s)&&u.capabilities?.engineer)&&(!type.endsWith('_TOT')||s.support_agencies?.artillery?.inventory?.TOT)&&(!type.endsWith('_ILLUM')||s.visibility&&(type==='HANDHELD_ILLUM'||s.support_agencies?.[type.includes('MORTAR')?'mortar':'artillery']?.inventory?.ILLUM))&&(!type.includes('CANNON')||s.support_agencies?.cannon)&&(!type.startsWith('SKILL_')||s.skills?.length)&&(type!=='DROP_LOAD'||s.mission_rules?.specialEnemies)&&(type!=='SEEK_COVER_UPPER'||s.mission_rules?.coverTable)&&(s.support_agencies||!['CALL_MORTAR_WP','CALL_ARTILLERY_WP','WP','WP_ATTACK','RIFLE_GRENADE'].includes(type))).map(([type,label])=>{
    const targets=eligibleTargets(s,u,type);
    const targeted=type.endsWith('_ILLUM')||type.startsWith('PYRO_')||['SUPPLEMENT','TRANSFER_EQUIPMENT','SWITCH_NETWORK','PLATOON_CONCENTRATE','PLATOON_GRENADE','DISPATCH_RUNNER','CREATE_RUNNER'].includes(type)||['ACTIVATE','MOVE','PLATOON_MOVE','INFILTRATE','PLATOON_INFILTRATE','ENTER_COVER','INFILTRATE_WITHIN','SPOT','SHIFT_FIRE','CONCENTRATE','GRENADE','CALL_MORTAR','CALL_ARTILLERY','CALL_ARTILLERY_TOT','CALL_MORTAR_WP','CALL_ARTILLERY_WP','CALL_CANNON','CALL_CANNON_WP','RIFLE_GRENADE','INDIRECT','RECONSTITUTE','RECONSTITUTE_HQ','PICKUP_RADIO','PICKUP_CASUALTY'].includes(type);
    const checks=((targeted||type==='WP_ATTACK')?targets:[null]).map(target_id=>({id:target_id,reason:orderReason(s,{type,unit_id:u.id,issuer_id:issuerId,target_id,contributor_ids:type==='RECONSTITUTE'?[u.id,...reconstructionTeams(s,u,issuerId).filter(t=>t.id!==u.id).slice(0,Math.max(0,(s.units[target_id]?.max_steps??3)-1)).map(t=>t.id)]:undefined})}));
    if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type))for(const check of checks)check.arrival_covers=check.reason?[]:arrivalCoverOptions(s,u,check.id,type);
    if(['PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type))for(const check of checks)check.moving_unit_ids=check.reason?[]:platoonMoveGroup(s,u,check.id,type).filter(friendly).map(v=>v.id);
    const displayLabel=type==='RECONSTITUTE_HQ'?'Reconstitute eliminated HQ':type==='DEPLOY_FIRE_TEAM'&&['HQ','STAFF'].includes(u.kind)?'Deploy HQ Fire Team':type==='RECOVER'&&u.named&&u.cohesion==='F'?(['HQ','STAFF'].includes(u.kind)?'Restore HQ command side':u.kind==='FO'?'Restore observer side':'Restore weapon side'):label;
    return {type,...(type==='INDIRECT'?{help:'The observing HQ must see the spotted target and communicate with this section, directly or through a radio/phone-equipped HQ or staff in its area. The mortar needs range, not its own line of sight. Heavy Weapons fire replaces its direct fire for this turn, uses mortar ammunition and ends at cleanup. No card draw or firing-direction arrow.'}:{}),contributor_ids:type==='RECONSTITUTE'?reconstructionTeams(s,u,issuerId).map(t=>t.id):undefined,label:displayLabel,exhortable:EXHORT_ACTIONS.includes(type)||type.startsWith('CALL_'),exhort_reason:exhortReason(s,{type,unit_id:u.id,issuer_id:issuerId}),skills:skillOptions(s,skillActor(s,u,type,issuerId),type),cost:s.mission_rules?.specialEnemies&&['DROP_LOAD','DROP_CASUALTY'].includes(type)?0:costOf(type),targeted:targeted||type==='WP_ATTACK',targets:checks,available:checks.some(c=>!c.reason),reason:checks.find(c=>c.reason)?.reason??'No eligible target.'};
  });
}
