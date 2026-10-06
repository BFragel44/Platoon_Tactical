import {values,live,friendly,emit,result,shuffle,pick} from './core.js';
import {combinedExperience,transferReconstitutionLoads} from './reconstitution.js';
import {secureStatus} from './missionFeatures.js';
import {refresh,occupants} from './battlefield.js';
import {recordAttemptStart} from './attemptRecords.js';
import {buySkills} from './skills.js';
import {validatePhaseLines} from './missionSetup.js';

const rank={Green:0,Line:1,Veteran:2};
export function prepareReattempt(state,choices){
 if(!state.mission_rules?.reattempts||state.status!=='DEFEAT'||(state.attempt_number??1)>state.mission_rules.reattempts)throw new Error('No Trévières reattempt is available.');
 if(!choices||Object.keys(choices).some(k=>!['reconstitute','promote','positions','covers','phone_lines','skills','phase_lines','redistribute'].includes(k)))throw new Error('Unknown reattempt preparation choice.');
 const secured=values(state.locations).filter(l=>secureStatus(state,l.id).secured).map(l=>l.id);
 if(!secured.length)throw new Error('No secured card remains for reattempt deployment.');
 const s=structuredClone(state),assignments=choices?.reconstitute??{},promotions=choices?.promote??{},placements=choices?.positions??{},covers=choices?.covers??{};
 const linePlacements=choices?.phone_lines??{};
 if(choices?.phase_lines)s.phase_lines=validatePhaseLines(choices.phase_lines,s.boundaries.rows);
 for(const u of values(s.units))if(u.command_role==='higher_hq')delete s.units[u.id];
 // Runners return to the off-map box before on-map placement is validated.
 for(const runner of s.runners??[])if(runner.status==='DISPATCHED'){
  if(s.units[runner.id]?.steps.length){runner.status='BOX';runner.target=null;}
  else runner.status='LOST';
  delete s.units[runner.id];
 }
 for(const u of values(s.units).filter(u=>friendly(u)&&live(u)&&u.named&&u.cohesion==='F')){
  u.cohesion='GOOD';u.experience=u.original_experience;
  for(const step of u.steps)step.experience??=u.experience;
 }
 if(Object.keys(linePlacements).some(id=>!s.phone_lines?.some(line=>line.id===id)))throw new Error('Unknown reattempt phone line.');
 for(const line of s.phone_lines??[]){
  if(linePlacements[line.id]!==undefined){if(!secured.includes(linePlacements[line.id]))throw new Error('Reposition phone lines only to secured cards.');line.location=linePlacements[line.id];}
  line.cut=false;
 }
 const consumed=new Set(),newHQ=new Set();
 for(const [targetId,donorIds] of Object.entries(assignments)){
  const target=s.units[targetId];
  if(!target||!friendly(target)||target.attachment||!['SQUAD','HQ','STAFF','MG','HMG','AT','MORTAR'].includes(target.kind)||!Array.isArray(donorIds)||!donorIds.length||target.steps.length+donorIds.length>target.max_steps)throw new Error(`Invalid reconstitution for ${targetId}.`);
  const hadSteps=target.steps.length>0;
  for(const id of donorIds){
   const donor=s.units[id];
   if(consumed.has(id)||!donor||!friendly(donor)||donor.kind!=='LAT'||!live(donor)||donor.steps.length!==1||donor.removed)throw new Error(`Ineligible reconstitution donor: ${id}.`);
   consumed.add(id);
   const step=donor.steps.pop();step.experience='Green';target.steps.push(step);donor.removed='RECONSTITUTED';
  }
  transferReconstitutionLoads(s,target,[...(hadSteps?[target]:[]),...donorIds.map(id=>s.units[id])]);
  target.removed=null;target.cohesion='GOOD';target.pinned=false;
  if(['HQ','STAFF'].includes(target.kind)&&target.steps.length===donorIds.length){target.experience='Green';newHQ.add(targetId);}
 }
 let points=s.achievements.reduce((sum,a)=>sum+a.points,0);
 const ownerOf=id=>values(s.units).find(u=>u.steps.some(step=>step.id===id));
 for(const [stepId,to] of Object.entries(promotions)){
  const owner=ownerOf(stepId),step=owner?.steps.find(t=>t.id===stepId);
  if(!owner||!friendly(owner)||['FO','LAT'].includes(owner.kind)||newHQ.has(owner.id)||!['Line','Veteran'].includes(to))throw new Error(`Step ${stepId} cannot be promoted.`);
  const from=step.experience??owner.experience;
  if(rank[to]!==rank[from]+1)throw new Error(`Promotion must raise ${stepId} by one level.`);
  const cost=to==='Line'?1:3;if(points<cost)throw new Error('Not enough attempt experience.');
  points-=cost;step.experience=to;
 }
 for(const u of values(s.units).filter(u=>friendly(u)&&live(u))){
  if(u.kind==='LAT'){u.cohesion='F';u.experience='Green';}
  else if(u.cohesion==='F'&&u.named)u.cohesion='GOOD';
  if(!newHQ.has(u.id)&&u.kind!=='LAT'){
   for(const step of u.steps)step.experience??=u.experience;
   u.experience=combinedExperience(u.steps);
   for(const step of u.steps)step.experience=u.experience;
  }
  if(!secured.includes(placements[u.id]))throw new Error(`Choose a secured reattempt card for ${u.id}.`);
  u.location=placements[u.id];u.cover=null;
 }
 for(const [id,coverId] of Object.entries(covers)){
  const u=s.units[id],cover=u&&s.locations[u.location].covers.find(c=>c.id===coverId&&c.discovered);
  if(!u||!friendly(u)||!live(u)||!cover)throw new Error(`Choose discovered cover on ${u?.name??id}'s reattempt card.`);
  const taken=values(s.units).filter(v=>v.id!==id&&live(v)&&v.location===u.location&&v.cover===cover.id).reduce((n,v)=>n+v.steps.length,0);
  if(taken+u.steps.length>(cover.capacity??16))throw new Error(`No room under ${cover.type} for ${u.name}.`);
  u.cover=cover.id;
 }
 for(const l of values(s.locations))if(!l.staging&&values(s.units).filter(u=>friendly(u)&&live(u)&&u.location===l.id).reduce((n,u)=>n+u.steps.length,0)>16)throw new Error(`Reattempt deployment exceeds the 16-step limit at ${l.name}.`);
 points=buySkills(s,choices?.skills??[],points);
 s.attempt_history??=[];
 s.attempt_history.push({number:s.attempt_number??1,outcome:s.status,turns:s.turn,score:s.achievements.reduce((sum,a)=>sum+a.points,0),event_count:s.events.length,casualties:structuredClone(s.casualties),prisoners:structuredClone(s.prisoners)});
 s.attempt_number=2;s.attempt_points_spent=s.achievements.reduce((sum,a)=>sum+a.points,0)-points;
 s.casualties=[];s.assets=[];s.prisoners=[];s.markers=[];s.fire=[];s.support=[];s.registered_targets={};s.support_inventory=Object.fromEntries(Object.entries(s.support_agencies??{}).map(([id,agency])=>[id,structuredClone(agency.inventory??{})]));
 for(const l of values(s.locations))l.smoke=false;
 // §3.9 step 8: randomly select occupants when they compete for limited cover.
 for(const u of values(s.units))if(!friendly(u)&&['P','L'].includes(u.cohesion))u.removed='REATTEMPT_REMOVED';
 for(const u of shuffle(s,values(s.units).filter(u=>!friendly(u)&&live(u)&&!u.cover))){
  const available=s.locations[u.location].covers.filter(c=>!c.parent&&occupants(s,u.location).filter(v=>v.cover===c.id).reduce((n,v)=>n+v.steps.length,0)+u.steps.length<=(c.capacity??16));
  const best=Math.max(...available.map(c=>c.value));
  const candidates=available.filter(c=>c.value===best);
  u.cover=candidates.length?(candidates.length===1?candidates[0]:pick(s,candidates,'Reattempt enemy cover',true)).id:null;
 }
 for(const u of values(s.units)){
  if(!friendly(u)&&['P','L'].includes(u.cohesion)){u.removed='REATTEMPT_REMOVED';continue;}
  if(!live(u))continue;
  if(!friendly(u)&&u.cohesion==='F'&&u.named&&['MORTAR','HMG','LMG','MG','FLAK88','SNIPER','SPOTTER','HQ','STAFF','LEADER'].includes(u.kind)){u.cohesion='GOOD';u.experience=u.original_experience;}
  u.pinned=false;u.exposed=false;u.saved=0;u.fire=null;u.fire_direction=null;u.fire_effect=null;u.indirect=null;u.used=[];
  const original=u.initial_resources;if(original){u.radios=structuredClone(original.radios);u.assets=structuredClone(original.assets);u.ammo=structuredClone(original.ammo);u.out_of_ammo=false;if(original.missions!==undefined){u.missions_remaining=original.missions;u.calls_made=0;}}
  if(u.assets.phone_line)u.assets.phone_line=Math.max(0,u.assets.phone_line-s.phone_lines.filter(line=>line.owner===u.id).length);
 }
 // Player-selected redistribution conserves the replenished inventories.
 if(choices.redistribute!==undefined&&!Array.isArray(choices.redistribute))throw new Error('Redistribution must be a list.');
 for(const transfer of choices.redistribute??[]){
  if(!transfer||Object.keys(transfer).some(k=>!['from','to','type','key','quantity'].includes(k)))throw new Error('Invalid redistribution choice.');
  const from=s.units[transfer.from],to=s.units[transfer.to],{type,key,quantity}=transfer;
  if(!from||!to||from===to||!friendly(from)||!friendly(to)||!live(from)||!live(to)||!Number.isSafeInteger(quantity)||quantity<1||!['RADIO','EQUIPMENT','AMMO'].includes(type))throw new Error('Choose surviving friendly carriers and a positive whole quantity.');
  if(type==='RADIO'){
   if(from.radios.filter(net=>net===key).length<quantity)throw new Error('Insufficient radios for redistribution.');
   for(let n=0;n<quantity;n++){from.radios.splice(from.radios.indexOf(key),1);to.radios.push(key);}
  }else{
   const field=type==='AMMO'?'ammo':'assets';
   if(typeof key!=='string'||!Object.hasOwn(from[field],key)||!Number.isSafeInteger(from[field][key])||from[field][key]<quantity||['__proto__','constructor','prototype'].includes(key))throw new Error('Insufficient stock for redistribution.');
   from[field][key]-=quantity;to[field][key]=(to[field][key]??0)+quantity;
  }
  for(const u of [from,to]){
   u.initial_resources.radios=structuredClone(u.radios);u.initial_resources.assets=structuredClone(u.assets);u.initial_resources.ammo=structuredClone(u.ammo);
   u.out_of_ammo=u.ammo.MG===0||u.ammo.MTR===0||u.ammo.GUN===0||u.ammo.RKT===0;
  }
  emit(s,'REATTEMPT_EQUIPMENT_ASSIGNED',`${from.name} transferred ${quantity} ${key} to ${to.name}.`,{from:from.id,to:to.id,asset_type:type,key,quantity});
 }
 s.turn=1;s.phase='FRIENDLY_EVENTS';s.status='ACTIVE';s.impulse=null;s.segment_progress=null;s.pending_combat=[];s.activated=[];s.completed=[];s.command_obligation=0;s.bn_blocked=false;s.support_unavailable=[];s.enemy_tactics='deliberate_defense';s.counterattack_ends_after=null;
 s.hq_events=[];s.pending_event=null;s.forward_row_blocked=null;s.higher_hq_on_map=false;
 s.replay.push({op:'reattempt',choices:structuredClone(choices)});
 emit(s,'MISSION_REATTEMPTED','Trévières reattempt begins with retained terrain, contacts and experience awards.',{attempt:2,points_spent:s.attempt_points_spent});
 refresh(s);recordAttemptStart(s,choices);return result(state,s,{accepted:true});
}
