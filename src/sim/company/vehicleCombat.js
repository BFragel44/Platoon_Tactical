// WWII rows and ground-vehicle result table visually verified against the
// supplied Vehicle and Anti-Tank Weapons player aid. Not wired to live rules 33.
import {draw,emit} from './core.js';
const profile=(gunnery,extra)=>Object.freeze({gunnery:Object.freeze(gunnery),...extra});
export const VEHICLE_AT_PROFILES=Object.freeze({
 M10_TD76:profile([-5,-3,-1,0],{group:'TANK',target_type:'V',defense:-1,crew_steps:2,mobile:true,move_fire:2,quick_shot:true,vof:'H',capacity:4,grenade_check:false}),
 M4_SHERMAN75:profile([-3,0,1,2],{group:'TANK',target_type:'V',defense:0,crew_steps:2,mobile:true,move_fire:2,quick_shot:true,vof:'H',capacity:4,grenade_check:false}),
 M5_LIGHT37:profile([-1,0,1,3],{group:'TANK',target_type:'V',defense:-1,crew_steps:1,mobile:true,move_fire:2,quick_shot:true,vof:'A',capacity:0,grenade_check:true}),
 JEEP:profile([null,null,null,null],{group:'JEEP',target_type:'V',defense:-2,crew_steps:0,mobile:true,move_fire:null,quick_shot:false,vof:null,capacity:2,grenade_check:false}),
 BAZOOKA:profile([-2,-1,null,null],{group:'AT',target_type:'I',mobile:true,move_fire:null,quick_shot:false,grenade_check:true}),
 INFANTRY_GUN75:profile([-3,-1,1,3],{group:'AT',target_type:'I',mobile:false,move_fire:null,quick_shot:false,grenade_check:true}),
 PAK40:profile([-4,-3,-1,0],{group:'AT',target_type:'I',mobile:false,move_fire:null,quick_shot:true,grenade_check:false}),
 FLAK88:profile([-6,-5,-3,-2],{group:'AT',target_type:'I',mobile:false,move_fire:null,quick_shot:true,grenade_check:false}),
 PANZERFAUST:profile([-3,null,null,null],{group:'AT',target_type:'I',mobile:true,move_fire:null,quick_shot:false,grenade_check:true}),
 PANZERSCHRECK:profile([-4,-2,null,null],{group:'AT',target_type:'I',mobile:true,move_fire:null,quick_shot:false,grenade_check:true}),
 RIFLE_GRENADE:profile([0,1,null,null],{group:'AT',target_type:'I',mobile:true,move_fire:null,quick_shot:false,grenade_check:true}),
});
export function atProfile(id){const p=VEHICLE_AT_PROFILES[id];if(!p)throw new Error(`Unsupported vehicle/AT profile: ${id}.`);return p;}
export function groundVehicleResult(sum){
 if(!Number.isInteger(sum))throw new Error('AT result must be an integer.');
 return sum<=-1?'BREWED_UP':sum<=1?'KNOCKED_OUT':sum<=3?'RETREAT':sum<=5?'PINNED':'MISSED';
}
// Caller supplies public/authoritative LOS, range and same-card infantry facts.
// No hit-point model or infantry NCM substitution belongs in this calculation.
export function calculateATShot({firer,target,range,terrain=0,card,moved=false,movingTarget=false,firerPinned=false,targetPinned=false,ambushSusceptible=false,supportedByInfantry=false,experience='Line'}){
 const a=atProfile(firer),b=atProfile(target);
 if(b.target_type!=='V')throw new Error('AT target must be a ground vehicle.');
 if(!Number.isInteger(range)||range<0||range>3||a.gunnery[range]===null||a.gunnery[range]===undefined)throw new Error('AT target outside weapon range.');
 if(moved&&a.move_fire===null)throw new Error('Weapon cannot move then AT fire.');
 if(!Number.isInteger(card)||!Number.isInteger(terrain))throw new Error('AT card and terrain values must be integers.');
 // §10.8.3 applies to guns and rocket launchers, not rifle grenades/tank guns.
 const ambushed=ambushSusceptible&&!supportedByInfantry&&range<=1&&['BAZOOKA','INFANTRY_GUN75','PAK40','FLAK88','PANZERFAUST','PANZERSCHRECK'].includes(firer);
 const modifier=a.gunnery[range]+b.defense+terrain+(moved?a.move_fire:0)+(movingTarget?1:0)+(firerPinned?1:0)-(targetPinned?1:0)+(ambushed?(targetPinned?-4:-3):0);
 const sum=modifier+card;
 return {modifier,sum,result:groundVehicleResult(sum),ambushed,grenade_draws:a.grenade_check?Math.max(0,2+({Green:-1,Line:0,Veteran:1}[experience]??0)+(ambushed?1:0)+(ambushed&&targetPinned?1:0)):0,quick_shot:a.quick_shot&&[-4,-2,0,2,4].includes(sum)};
}

// Serializable ordered phase cursor. Units carry AT activation independently of
// infantry command activation. Mutations are clone-first and reject duplicates.
export function startVehiclePhase(units){
 const ids=new Set();
 const entries=units.map(u=>{
  if(!u.id||ids.has(u.id)||!['friendly','enemy'].includes(u.faction))throw new Error('Invalid vehicle phase identity.');ids.add(u.id);
  return {id:u.id,profile:u.profile,faction:u.faction,group:atProfile(u.profile).group,activated:!!u.activated,moved_fired:!!u.moved_fired};
 });
 return {entries,groups:['TANK','JEEP','AT'],group:0,next_side:'friendly',pending:null};
}
export function vehiclePhaseOptions(state){
 if(state.pending)return [];
 for(let i=state.group;i<state.groups.length;i++){
  const eligible=state.entries.filter(u=>u.group===state.groups[i]&&u.activated&&!u.moved_fired);
  if(eligible.length){const own=eligible.filter(u=>u.faction===state.next_side);return (own.length?own:eligible).map(u=>u.id);}
 }
 return [];
}
export function beginVehicleAction(state,id){
 if(!vehiclePhaseOptions(state).includes(id))throw new Error('Unit cannot act in the current vehicle group/side.');
 const s=structuredClone(state),u=s.entries.find(u=>u.id===id);s.group=s.groups.indexOf(u.group);s.pending={actor:id,stage:u.group==='AT'?'ACTION':'VOF_BEFORE'};return s;
}
export function advanceVehicleAction(state,stage){
 const next={VOF_BEFORE:'ACTION',ACTION:'REACTION',REACTION:'COMPLETE'};
 if(!state.pending||state.pending.stage!==stage||!next[stage])throw new Error('Invalid vehicle action stage.');
 const s=structuredClone(state),actor=s.entries.find(u=>u.id===s.pending.actor);s.pending.stage=stage==='ACTION'&&actor.group==='AT'?'COMPLETE':next[stage];return s;
}
export function finishVehicleAction(state){
 if(state.pending?.stage!=='COMPLETE')throw new Error('Resolve the vehicle action before completion.');
 const s=structuredClone(state),u=s.entries.find(u=>u.id===s.pending.actor);u.moved_fired=true;s.next_side=u.faction==='friendly'?'enemy':'friendly';s.pending=null;
 // New groups begin with the offensive side, regardless of the preceding group.
 if(!s.entries.some(u=>u.group===s.groups[s.group]&&u.activated&&!u.moved_fired)){s.group++;s.next_side='friendly';}
 return s;
}
export function recordVehicleReaction(state,id,{quickShot=false}={}){
 if(state.pending?.stage!=='REACTION')throw new Error('Not a reaction window.');
 const s=structuredClone(state),u=s.entries.find(u=>u.id===id),actor=s.entries.find(u=>u.id===s.pending.actor);
 if(!u||u.moved_fired||u.faction===actor.faction||actor.group==='AT')throw new Error('Ineligible vehicle reaction.');
 if(quickShot&&!atProfile(u.profile).quick_shot)throw new Error('Weapon has no Quick Shot capability.');
 u.moved_fired=!quickShot;return s;
}

// One replayable shot, using the shared Action deck, never infantry NCM.
// Ammo belongs to this firing weapon; integration must apply the returned stock
// to its authoritative carrier and resolve crew outcomes separately.
export function resolveATFire(state,shot,{ammo,shotId,firerId,targetId,hidden=false}){
 if(!shotId||!firerId||!targetId||firerId===targetId)throw new Error('Invalid AT shot identity.');
 if(state.vehicle_at_shots?.some(s=>s.id===shotId))throw new Error('AT shot already resolved.');
 if(!Number.isInteger(ammo)||ammo<1)throw new Error('No AT ammunition available.');
 const eligibility=calculateATShot({...shot,card:0});
 const s=structuredClone(state),p=atProfile(shot.firer);
 const attempt=p.grenade_check?draw(s,eligibility.grenade_draws,'AT grenade attempt',hidden):[];
 const success=!p.grenade_check||attempt.some(c=>c.grenade);
 const card=success?draw(s,1,'AT combat result',hidden)[0]:null;
 const result=card?calculateATShot({...shot,card:Number(card.at)}):null;
 const record={id:shotId,firer:firerId,target:targetId,ammo_before:ammo,ammo_after:ammo-1,attempt_cards:attempt.map(c=>c.id),result_card:card?.id??null,result:result?.result??'FAILED_ATTEMPT',sum:result?.sum??null,modifier:eligibility.modifier,quick_shot:!!result?.quick_shot&&ammo>1,quick_shot_draw:!!result?.quick_shot};
 s.vehicle_at_shots??=[];s.vehicle_at_shots.push(record);
 emit(s,'AT_SHOT_RESOLVED',success?`AT fire: ${record.result}.`:'AT grenade attempt failed; ammunition expended.',{actor:firerId,target:targetId,shot_id:shotId,shot:record},hidden);
 return {state:s,ammo:ammo-1,shot:record};
}
