import {preparationFormationAllowed,combinedExperience} from '../sim/company/reconstitution.js';
import {buySkills} from '../sim/company/skills.js';
import {prepareVireReattemptInput} from '../sim/company/vireReattempt.js';
import {secureStatus} from '../sim/company/missionFeatures.js';
export function attemptPresentationState(state,patrol=false){
 if(patrol||!state.vire_runtime)return state;
 const secured=Object.keys(state.locations).filter(id=>secureStatus(state,id).secured);
 const vehicle_positions=Object.fromEntries(Object.values(state.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&['M4_SHERMAN75','M10_TD76','M5_LIGHT37','JEEP'].includes(v.profile)).map(v=>[v.id,secured.includes(v.location)?v.location:secured[0]]));
 return prepareVireReattemptInput(state,{vehicle_positions});
}
// Friendly personnel projection only: no deck, enemy procedures, events or RNG.
// The full simulation reducer remains the final authority at Begin.
export function projectAttemptPersonnel(state,{reconstitute={},promote={},skills=[]}={},patrol=false){
 const units=structuredClone(Object.fromEntries(Object.entries(state.units).filter(([,u])=>u.faction==='friendly'))),consumed=new Set(),newHQ=new Set();
 const eligible=u=>!patrol||u.platoon===state.patrol.plan.platoon;
 let points=state.achievements.filter(a=>!patrol||a.platoon===state.patrol.plan.platoon&&!a.spent).reduce((n,a)=>n+a.points,0)-(state.mission_rules.tinchebray?(state.attempt_points_spent_total??0):0);
 for(const u of Object.values(units))if(u.steps.length&&u.named&&u.cohesion==='F'){u.cohesion='GOOD';u.experience=u.original_experience;for(const step of u.steps)step.experience??=u.experience;}
 for(const [targetId,ids] of Object.entries(reconstitute)){
  const target=units[targetId];
  if(!target||!preparationFormationAllowed(state,target)||!eligible(target)||target.attachment||!['SQUAD','HQ','STAFF','MG','HMG','AT','MORTAR'].includes(target.kind)||!ids.length||target.steps.length+ids.length>target.max_steps||state.mission_rules.hill192&&target.removed==='RESERVE')throw new Error('Choose an eligible formation with enough room.');
  const rebuilt=!target.steps.length&&['HQ','STAFF'].includes(target.kind);
  for(const id of ids){const donor=units[id];if(consumed.has(id)||!donor||!eligible(donor)||donor.kind!=='LAT'||donor.steps.length!==1||donor.removed)throw new Error('A surviving eligible team can be assigned only once.');consumed.add(id);const step=donor.steps.pop();step.experience='Green';target.steps.push(step);donor.removed='RECONSTITUTED';}
  target.removed=null;target.cohesion='GOOD';if(rebuilt){newHQ.add(targetId);target.experience='Green';}
 }
 for(const [id,to]of Object.entries(promote)){
  const owner=Object.values(units).find(u=>u.steps.some(t=>t.id===id)),step=owner?.steps.find(t=>t.id===id);
  if(!owner||!eligible(owner)||['FO','LAT'].includes(owner.kind)||newHQ.has(owner.id)||state.mission_rules.hill192&&owner.removed==='RESERVE')throw new Error('This step cannot be promoted during this preparation.');
  const from=step.experience??owner.experience;if(to!==({Green:'Line',Line:'Veteran'})[from])throw new Error('A step may gain only one experience level.');
  const cost=to==='Line'?1:3;if(points<cost)throw new Error('Not enough experience points.');points-=cost;step.experience=to;
 }
 const stepLevels=Object.fromEntries(Object.values(units).flatMap(u=>u.steps.map(t=>[t.id,t.experience??u.experience])));
 for(const u of Object.values(units).filter(u=>u.steps.length)){
  if(u.kind==='LAT'){u.cohesion='F';u.experience='Green';}
  else if(!newHQ.has(u.id)){for(const step of u.steps)step.experience??=u.experience;u.experience=combinedExperience(u.steps);for(const step of u.steps)step.experience=u.experience;}
 }
 const skillState={units,attempt_number:state.attempt_number,skills:structuredClone(state.skills??[])};
 points=buySkills(skillState,skills,points,{retain:patrol,allowReserve:patrol});
 return {units,consumed,newHQ,points,skills:skillState.skills,stepLevels};
}
