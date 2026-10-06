import {prepareSpecialTargets,specialActivity} from './specialEnemies.js';
import {latActivityTable} from './enemyHierarchy.js';
import {availableCounters} from './missionContacts.js';
import {expendAmmunition} from './ammunition.js';
import {resolveMissionContact} from './missionContacts.js';
import {reconstitutionFirepower,reconstitutionLoads,reconstitutionDonors} from './reconstitution.js';
import { values, live, good, friendly, visible, emit, draw, attempt, randomNumber, pick, shuffle, dropLoad } from './core.js';
import { adjacent, occupants, los, unitLos, coverAvailable, distance, basicValue, canFire, refresh, spot, hasFire, incoming, combatExposure, coverOf, enemyCeaseFire, movementReason,vofOf } from './battlefield.js';
import { seekCover, rally, grenade, concentrate, move, splitTeam, infiltrationReason } from './actions.js';
import { combatResolutionTable, hitEffectTable, resolveCombatOutcome, resolveHitEffect } from './combatProbability.js';

export function casualty(s,u,step) {
  const id=`casualty_${s.next_id++}`;
  s.casualties.push({id,step,origin_name:u.name,location:u.location,cover:u.cover,faction:u.faction,carrier:null,evacuated:false});
  const names=step.personnel.map(id=>s.personnel[id]?.name).filter(Boolean);
  for(const id of step.personnel)if(s.personnel[id])s.personnel[id].status='CASUALTY';
  emit(s,'CASUALTY',`${visible(s,u)?u.name:'Enemy formation'} lost a step${friendly(u)?`: ${names.join(', ')}`:''}.`,{actor:visible(s,u)?u.id:null,personnel:friendly(u)?step.personnel:[],step_id:visible(s,u)?step.id:null,location:u.location},!visible(s,u));
  if(!u.steps.length)emit(s,'FORMATION_LOST',`${u.name}: final step became a casualty.`,{actor:u.id,name:u.name,location:u.location,faction:u.faction,cause:'FINAL_CASUALTY'},!visible(s,u));
}
function loseAssets(s,u,casualtyLoss=true) {
  for(const net of u.radios) {
    const phone=net.endsWith('_PHONE'),destroyed=casualtyLoss&&randomNumber(s,2,`${u.name}: ${phone?'phone':'radio'} damage`,!visible(s,u))===1;
    s.assets.push({id:`asset_${s.next_id++}`,type:'RADIO',net,source_unit:u.id,location:u.location,...(s.mission_rules?.specialEnemies?{cover:u.cover}:{}),destroyed,faction:u.faction});
    emit(s,'RADIO_LOST',`${u.name}: ${net} ${phone?'phone':'radio'} ${destroyed?'destroyed':'dropped for recovery'}.`,{actor:u.id,net,destroyed},!visible(s,u));
  }
  if(s.mission_rules?.specialEnemies)for(const [key,quantity] of Object.entries(u.assets))if(quantity){
    s.assets.push({id:`asset_${s.next_id++}`,type:'EQUIPMENT',key,quantity,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
    emit(s,'ASSETS_DROPPED',`${u.name}: carried equipment dropped for recovery.`,{actor:u.id,location:u.location,key,quantity},!visible(s,u));
  }
  if(s.mission_rules?.ammo==='tracked')for(const [key,quantity] of Object.entries(u.ammo??{}))if(quantity){
    if(casualtyLoss)emit(s,'AMMO_LOST',`${visible(s,u)?u.name:'Enemy formation'}: carried ammunition lost with the final casualty.`,{actor:visible(s,u)?u.id:null,location:u.location,key,quantity:visible(s,u)?quantity:null},!visible(s,u));
    else s.assets.push({id:`asset_${s.next_id++}`,type:'AMMO',key,quantity,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
  }
  u.radios=[];u.assets={};if(s.mission_rules?.ammo==='tracked')u.ammo={};u.saved=0;
  for(const c of s.casualties.filter(c=>c.carrier===u.id))c.carrier=null;
}
function mortarBreakdownTeam(s,u,step,cohesion){
 const id=`mortar_${s.next_id++}`,ammo={MTR:u.ammo?.MTR??0};
 const child={...structuredClone(u),id,name:`${u.name} surviving mortar team`,kind:'MORTAR',named:true,steps:[step],max_steps:1,vof:'G',fire_team_vof:'S',ammo,cohesion,experience:cohesion==='F'?'Green':u.original_experience,pinned:true,removed:null,fire:null,indirect:null,radios:[],assets:{},used:[],saved:0,initial_resources:{radios:[],assets:{},ammo:{MTR:u.initial_resources?.ammo?.MTR??ammo.MTR}}};
 delete child.temporary_pdf;s.units[id]=child;
 if(!friendly(u)&&s.knowledge.spotted[u.id])s.knowledge.spotted[id]={id};
 return child;
}
export function applyHit(s,u,letters) {
  const originalCount=u.steps.length,affected=[];
  for(const letter of letters.slice(0,Math.min(2,originalCount))) {
    const step=u.steps.shift();if(!step)break;
    if(letter==='C')casualty(s,u,step);
    else if(s.mission_rules?.ammo==='tracked'&&u.kind==='MORTAR'&&u.max_steps===3&&['A','F'].includes(letter)&&(friendly(u)||originalCount===2))affected.push(mortarBreakdownTeam(s,u,step,'F'));
    else if(originalCount===1&&u.named&&['A','F'].includes(letter)) {
      u.steps.push(step);u.cohesion='F';u.pinned=true;affected.push(u);break;
    } else {
      const child=splitTeam(s,u,letter,step);child.pinned=true;affected.push(child);
      if(!friendly(u)&&s.knowledge.spotted[u.id])s.knowledge.spotted[child.id]={id:child.id};
    }
  }
  if(u.steps.length===1&&u.kind==='SQUAD'){const child=splitTeam(s,u,'F',u.steps.pop());if(s.mission_rules?.specialEnemies&&u.last_step_vof)child.fire_team_vof=u.last_step_vof;
    if(s.mission_rules?.ammo==='tracked'&&child.fire_team_vof==='A'&&u.ammo?.MG!==undefined){child.ammo={MG:u.ammo.MG};child.initial_resources.ammo={MG:u.initial_resources?.ammo?.MG??u.ammo.MG};u.ammo.MG=0;}
    child.pinned=true;affected.push(child);if(!friendly(u)&&s.knowledge.spotted[u.id])s.knowledge.spotted[child.id]={id:child.id};}
  if(s.mission_rules?.ammo==='tracked'&&u.kind==='MORTAR'&&u.max_steps===3&&u.steps.length===1){
    const child=mortarBreakdownTeam(s,u,u.steps.pop(),'GOOD');u.ammo={};affected.push(child);
  }
  if(u.steps.length){u.pinned=true;if(!affected.includes(u))affected.push(u);}else{
    u.removed='BROKEN';
    const recipient=s.mission_rules?.specialEnemies?affected.at(-1):null;
    if(recipient){
      recipient.radios=[...u.radios];recipient.assets={...u.assets};
      if(s.mission_rules?.ammo==='tracked'){
       recipient.initial_resources??={radios:[],assets:{},ammo:{}};
       recipient.initial_resources.radios=structuredClone(u.initial_resources?.radios??u.radios);
       recipient.initial_resources.assets=structuredClone(u.initial_resources?.assets??u.assets);
      }
      if(s.mission_rules?.ammo==='tracked'&&recipient.fire_team_vof==='A'&&recipient.ammo?.MG===undefined&&u.ammo?.MG!==undefined){recipient.ammo={MG:u.ammo.MG};u.ammo.MG=0;}
      for(const c of s.casualties.filter(c=>c.carrier===u.id))c.carrier=recipient.id;
      u.radios=[];u.assets={};u.saved=0;
      emit(s,'ASSETS_TRANSFERRED',`${u.name}: carried items remain with the final surviving team.`,{actor:u.id,recipient:recipient.id,location:u.location},!visible(s,u));
    }else loseAssets(s,u,letters.includes('C'));
  }
  if(['P','L'].includes(u.cohesion))u.saved=0;
  emit(s,'FORMATION_CHANGED',`${u.name}: ${letters} hit; ${u.steps.length} step(s) remain in the original formation.`,
    {actor:u.id,effect:letters,formations:affected.map(v=>v.id)},!visible(s,u));
}
const distributionRecord=d=>({total:d.total,counts:{...d.counts},probabilities:{...d.probabilities}});
const sourceRecord=(s,source,target)=>{
  const unit=s.units[source?.source_id],known=unit&&visible(s,unit);
  return source?{kind:source.kind,source_id:source.source_id??null,origin:source.origin,value:source.value,vof:source.vof,
    ...(known?{steps:unit.steps.length,experience:unit.experience,unit_kind:unit.kind,range:distance(s.locations[unit.location],s.locations[target.location])}:{}),
    faction:unit?.faction??(source.kind==='OFF_MAP_SUPPORT'?'enemy':null),known:!!known,
    label:source.kind==='OFF_MAP_SUPPORT'?source.label:source.kind==='ON_MAP_INDIRECT'?'On-map mortar fire':source.kind==='MINES'?'Mine explosion':source.kind==='SNIPER'?'Sniper fire':source.kind==='GRENADE'?(source.label??'Grenade effect'):known?unit.name:'Unidentified fire'}:null;
};
export function prepareCombat(s) {
  prepareSpecialTargets(s);
  const resolutions=[];
  for(const u of values(s.units).filter(live).sort((a,b)=>s.locations[b.location].row-s.locations[a.location].row||s.locations[a.location].col-s.locations[b.location].col||a.id.localeCompare(b.id))) {
    const exposure=combatExposure(s,u);if(!exposure)continue;
    const id=`combat_t${s.turn}_${u.id}`;
    const resolution={id,target_id:u.id,target_name:u.name,target_location:u.location,target_faction:u.faction,target_visible:!!visible(s,u),
      target_experience:u.experience,target_kind:u.kind,target_steps:u.steps.length,target_cohesion:u.cohesion,target_pinned:u.pinned,
      ncm:exposure.ncm,total:exposure.total,parts:structuredClone(exposure.parts),modifiers:structuredClone(exposure.modifiers),
      sources:exposure.sources.map(source=>sourceRecord(s,source,u)),strongest:sourceRecord(s,exposure.strongest,u),
      probabilities:distributionRecord(combatResolutionTable[exposure.ncm]),hit_probabilities:distributionRecord(hitEffectTable[u.experience]),
      status:'PENDING',result:null,roll:null,hit_effect:null,hit_roll:null,after:null,casualty_steps:0};
    resolutions.push(resolution);
    emit(s,'COMBAT_RESOLUTION_PREPARED',`${visible(s,u)?u.name:'Enemy formation'} faces incoming fire at NCM ${exposure.ncm>=0?'+':''}${exposure.ncm}.`,
      {resolution_id:id,actor:visible(s,u)?u.id:null,location:u.location,ncm:exposure.ncm,modifiers:structuredClone(exposure.modifiers),probabilities:resolution.probabilities},!visible(s,u));
  }
  s.pending_combat=resolutions;
  if(s.mission_rules?.ammo==='tracked'){
   const firing=new Set(s.fire.map(f=>f.source));
   for(const u of values(s.units).filter(live)){
    if(u.ammo?.MG!==undefined&&firing.has(u.id))expendAmmunition(s,u,'MG');
    if(u.ammo?.MTR!==undefined&&(u.indirect||firing.has(u.id)))expendAmmunition(s,u,'MTR');
    if(u.ammo?.GUN!==undefined&&firing.has(u.id))expendAmmunition(s,u,'GUN');
   }
  }
  return resolutions;
}
export function resolvePreparedCombat(s,resolutionId) {
  const resolution=s.pending_combat?.find(r=>r.id===resolutionId);
  if(!resolution||resolution.status!=='PENDING')throw new Error('Combat resolution is unavailable or already resolved.');
  const u=s.units[resolution.target_id],hidden=!resolution.target_visible;
  const combat=resolveCombatOutcome(resolution.ncm,s.rng);s.rng=combat.rng;
  resolution.roll=combat.roll;resolution.result=combat.result;
  emit(s,'COMBAT_RESOLVED',`${visible(s,u)?u.name:'Enemy formation'}: ${combat.result.toLowerCase()} (NCM ${resolution.ncm>=0?'+':''}${resolution.ncm}).`,
    {resolution_id:resolution.id,actor:visible(s,u)?u.id:null,location:resolution.target_location,ncm:resolution.ncm,
      modifiers:structuredClone(resolution.modifiers),probabilities:resolution.probabilities,roll:combat.roll,result:combat.result},hidden);
  if(combat.result==='MISS')u.pinned=false;
  if(combat.result==='PIN')u.pinned=true;
  const beforeCasualties=s.casualties.length,beforeEvents=s.events.length;
  if(combat.result==='HIT') {
    const hit=resolveHitEffect(resolution.target_experience,s.rng);s.rng=hit.rng;resolution.hit_roll=hit.roll;resolution.hit_effect=hit.effect;
    emit(s,'HIT_EFFECT_RESOLVED',`${visible(s,u)?u.name:'Enemy formation'}: ${hit.effect} hit effect (${resolution.target_experience}).`,
      {resolution_id:resolution.id,actor:visible(s,u)?u.id:null,experience:resolution.target_experience,
        probabilities:resolution.hit_probabilities,roll:hit.roll,effect:hit.effect},hidden);
    applyHit(s,u,hit.effect);
  }
  const changed=s.events.slice(beforeEvents).find(e=>e.type==='FORMATION_CHANGED');
  resolution.after=(changed?.formations??[u.id]).map(id=>s.units[id]).filter(Boolean).map(v=>({id:v.id,name:v.name,cohesion:v.cohesion,steps:v.steps.length,pinned:v.pinned,removed:v.removed}));
  resolution.casualty_steps=s.casualties.length-beforeCasualties;resolution.status='RESOLVED';
  return resolution;
}
// Fixture/diagnostic batch helper. Normal play prepares and resolves one visible item at a time through engine.js.
export function resolveCombat(s) {
  if(!s.pending_combat?.length)prepareCombat(s);
  for(const resolution of s.pending_combat)if(resolution.status==='PENDING')resolvePreparedCombat(s,resolution.id);
}
function newEnemy(s,kind,location,cover,trigger,spotted) {
  const id=`enemy_${s.next_id++}`;
  const squad=kind==='SQUAD',vof=squad ? pick(s,s.enemy_pool.squads,'Enemy squad counter',true) : 'A';
  if(squad)s.enemy_pool.squads.splice(s.enemy_pool.squads.indexOf(vof),1);else s.enemy_pool.mg--;
  const count=squad?3:2;
  const u={id,name:squad?'German rifle squad':'German LMG',kind,platoon:null,faction:'enemy',location,vof,range:2,
    steps:Array.from({length:count},(_,i)=>({id:`${id}_step${i+1}`,personnel:[]})),cohesion:'GOOD',experience:'Line',original_experience:'Line',
    named:!squad,pinned:false,exposed:false,cover:cover?.id??null,fire:trigger,indirect:null,radios:[],assets:{},used:[],saved:0,removed:null};
  s.units[id]=u;if(spotted)spot(s,u);return u;
}
const packages={
  1:{incoming:true},2:{mg:1,fox:1,row:2},3:{mg:1,spotted:true,trigger:true},4:{squad:1,fox:1,row:2},
  5:{squad:1,trench:1,row:3},6:{mg:1,bunker:1,row:3,spotted:true},7:{squad:1,mg:1,trench:1,bunker:1,row:3},
};
function placementCandidates(s,p,trigger) {
  if(p.incoming)return [s.locations[trigger]];
  return values(s.locations).filter(l=>!l.staging&&(p.trigger?l.id===trigger:l.row===p.row)&&!occupants(s,l.id).some(u=>!friendly(u))&&
    los(s,l.id,trigger,2)&&(!p.bunker||l.id!==trigger));
}
function available(s,p,trigger) {
  return (!p.mg||s.enemy_pool.mg>=p.mg)&&(!p.squad||s.enemy_pool.squads.length>=p.squad)&&(!p.fox||s.enemy_pool.fox>=p.fox)&&
    (!p.trench||s.enemy_pool.trench>=p.trench)&&(!p.bunker||s.enemy_pool.bunker>=p.bunker)&&
    (!p.incoming||!s.support.some(f=>f.source==='enemy'))&&placementCandidates(s,p,trigger).length>0;
}
export const eligibleContacts = s => values(s.contacts).filter(pc=>!pc.resolved&&occupants(s,pc.location).some(friendly));
export function resolveContacts(s,contactId=null) {
  if(s.mission_contacts){for(const pc of eligibleContacts(s).filter(pc=>contactId===null||pc.id===contactId))resolveMissionContact(s,pc);return;}
  const counts={NO_CONTACT:{A:0,B:0},CONTACT:{A:7,B:5},ENGAGED:{A:5,B:3},HEAVILY_ENGAGED:{A:3,B:2}};
  for(const pc of eligibleContacts(s).filter(pc=>contactId===null||pc.id===contactId)) {
    const count=counts[s.activity][pc.type];
    const contact=count===0||draw(s,count,`Evaluate contact ${pc.type} at ${s.locations[pc.location].name}`).some(c=>c.word==='Contact');
    pc.resolved=true;
    emit(s,'CONTACT_EVALUATED',`${s.locations[pc.location].name}: contact marker cleared${contact?'; enemy activity detected':'; no contact'}.`,{location:pc.location,contact});
    if(!contact)continue;
    const table=pc.type==='A'?[1,2,2,2,3,4]:[1,3,5,5,6,7,7];
    const eligible=table.filter(n=>available(s,packages[n],pc.location));
    if(!eligible.length){emit(s,'CONTACT_EMPTY','No additional enemy activity developed.',{location:pc.location});continue;}
    const number=pick(s,eligible,'Enemy package selection',true),p=packages[number];
    const l=pick(s,placementCandidates(s,p,pc.location),'Enemy placement',true);
    if(p.incoming){s.support.push({id:`incoming_${s.next_id++}`,location:pc.location,status:'ACTIVE',value:-4,source:'enemy'});emit(s,'INCOMING_FIRE',`Incoming artillery at ${s.locations[pc.location].name}.`,{location:pc.location});}
    else {
      let fox,trench,bunker;
      const fort=(type,value)=>{const c={id:`fort_${s.next_id++}`,type,value,known:!!p.spotted};l.covers.push(c);return c;};
      if(p.fox){s.enemy_pool.fox--;fox=fort('Foxholes',1);}
      if(p.trench){s.enemy_pool.trench--;trench=fort('Trench',2);}
      if(p.bunker){s.enemy_pool.bunker--;bunker=fort('Bunker',3);const target=s.locations[pc.location];bunker.arc=[Math.sign(target.row-l.row),Math.sign(target.col-l.col)];}
      if(p.squad)newEnemy(s,'SQUAD',l.id,trench??fox,pc.location,p.spotted);
      if(p.mg)newEnemy(s,'MG',l.id,bunker??fox,pc.location,p.spotted);
      s.knowledge.suspected[l.id]=true;
      emit(s,'CONTACT_FIRE',`Fire is coming from ${l.name}${p.spotted?'; enemy identified':'; source not yet spotted'}.`,{location:l.id,target:pc.location});
    }
    refresh(s);
  }
}
export function selectEnemyCover(s,u,location=u.location,advancing=false){
 const candidates=s.locations[location].covers.filter(c=>coverAvailable(s,u,c,location));
 const score=c=>{
  const probe={...u,location,cover:c.id,exposed:false},state={...s,units:{...s.units,[u.id]:probe}};
  if(advancing)return values(state.units).some(v=>friendly(v)&&live(v)&&canFire(state,probe,v.location))?c.value:-Infinity;
  return combatExposure(state,probe)?.total??c.value;
 };
 const best=Math.max(...candidates.map(score));
 const choices=candidates.filter(c=>score(c)===best&&best!==-Infinity);
 return choices.length?pick(s,choices,'Enemy cover priority',!visible(s,u)):null;
}
function fallBack(s,u) {
  if(u.exposed||u.mine_hit)return;
  const from=s.locations[u.location];
  if(!friendly(u)&&(s.boundaries?(from.row>=s.boundaries.rows||from.col<1||from.col>s.boundaries.columns):from.row===Math.max(...values(s.locations).map(l=>l.row)))){if(u.pinned||u.cohesion==='P')dropLoad(s,u,'withdrawal');else for(const c of s.casualties.filter(c=>c.carrier===u.id)){c.evacuated=true;c.carrier=null;}u.removed='WITHDRAWN';emit(s,'UNIT_WITHDREW',`${u.name} withdrew from the battlefield.`,{actor:u.id,location:u.location,faction:u.faction},!visible(s,u));return;}
  const possible=adjacent(s,u.location).filter(l=>(friendly(u)?l.row<from.row:l.row>from.row)&&!movementReason(s,u,l.id));
  if(!possible.length)return;
  const seen=l=>values(s.units).some(v=>v.faction!==u.faction&&live(v)&&unitLos(s,v,l.id));
  const protection=l=>l.protection+Math.max(0,...l.covers.filter(c=>coverAvailable(s,u,c,l.id)).map(c=>c.value));
  possible.sort((a,b)=>Number(seen(a))-Number(seen(b))||protection(b)-protection(a));
  const best=possible.filter(l=>seen(l)===seen(possible[0])&&protection(l)===protection(possible[0]));
  move(s,u,pick(s,best,'Retreat destination',!visible(s,u)).id);
  if(s.mission_rules?.enemyActivity==='normandy')u.cover=selectEnemyCover(s,u)?.id??null;
}
function enemyCover(s,u) {
  const cover=s.mission_rules?.enemyActivity==='normandy'?selectEnemyCover(s,u):s.locations[u.location].covers.filter(c=>coverAvailable(s,u,c)).sort((a,b)=>b.value-a.value)[0];
  if(cover){u.cover=cover.id;u.exposed=true;}else seekCover(s,u);
}
function attack(s,u) {
  const opponents=occupants(s,u.location).filter(v=>v.faction!==u.faction);
  const size=v=>v.cover?opponents.filter(t=>t.cover===v.cover).reduce((n,t)=>n+t.steps.length,0):v.steps.length;
  const areas=opponents.filter((v,i,a)=>!v.cover||a.findIndex(t=>t.cover===v.cover)===i);
  const largest=Math.max(0,...areas.map(size));
  const close=areas.length?pick(s,areas.filter(v=>size(v)===largest),'Enemy point-blank target',!visible(s,u)):null;
  if(close){if(['Bunker','Pillbox'].includes(coverOf(s,u)?.type)){u.cover=null;u.exposed=true;}grenade(s,u,close);}
  else if(u.fire){const targets=occupants(s,u.fire).filter(v=>v.faction!==u.faction);const target=targets.length?pick(s,targets,'Enemy fire target',!visible(s,u)):null;if(target){if(u.kind==='MORTAR'&&u.steps.length===1&&u.cohesion==='GOOD')grenade(s,u,target);else concentrate(s,u,target);}}
}
// First matching row of Deliberate Defence / No Leader LAT hierarchy.
export function enemyActivity(s) {
  enemyCeaseFire(s);
  const locations=[...new Set(values(s.units).filter(u=>live(u)&&!friendly(u)).map(u=>u.location))];
  const processed=new Set();
  for(const loc of shuffle(s,locations)) {
    const normandy=s.mission_rules?.enemyActivity==='normandy';
    const units=occupants(s,loc).filter(u=>!friendly(u)).sort((a,b)=> (normandy?(a.kind==='LEADER'?2:!good(a)?0:1)-(b.kind==='LEADER'?2:!good(b)?0:1):Number(good(a))-Number(good(b)))||a.id.localeCompare(b.id));
    for(const u of units) {
      if(!live(u)||processed.has(u.id)||u.event_acted===s.turn)continue;
      processed.add(u.id);
      if(normandy&&good(u)&&u.kind==='LEADER'){
       if(!occupants(s,u.location).some(v=>v.id!==u.id&&v.faction===u.faction)){u.cohesion='F';u.experience='Green';emit(s,'COHESION_CHANGED',`${u.name}: alone; flipped to Fire Team.`,{actor:u.id,from:'GOOD',to:'F'},!visible(s,u));}
       else continue;
      }
      if(specialActivity(s,u,fallBack)){refresh(s);continue;}
      refresh(s);
      const same=occupants(s,u.location).some(friendly),under=hasFire(s,u.location,{includeInactiveMines:false}),covered=!!u.cover;
      const casualties=s.casualties.filter(c=>!c.evacuated&&c.faction===u.faction&&(!c.carrier||c.carrier===u.id));
      const localCasualty=casualties.find(c=>c.location===u.location&&c.cover===u.cover);
      const seenCasualties=casualties.filter(c=>unitLos(s,u,c.location));
      const leader=normandy&&occupants(s,u.location).some(v=>v.kind==='LEADER'&&good(v)&&v.cover===u.cover);
      const teams=occupants(s,u.location).filter(v=>v.faction===u.faction&&!v.pinned&&(normandy?v.steps.length===1:v.kind==='LAT')&&['A','F'].includes(v.cohesion)&&v.cover===u.cover);
      const roll=n=>randomNumber(s,n,`${u.name}: activity`,!visible(s,u));
      const canFallBack=!u.exposed&&!u.mine_hit&&(s.locations[u.location].row>=(s.boundaries?.rows??3)||s.locations[u.location].col<1||s.locations[u.location].col>(s.boundaries?.columns??4)||adjacent(s,u.location).some(l=>l.row>s.locations[u.location].row&&!movementReason(s,u,l.id)));
      const choices=list=>{
        const legal=!s.mission_contacts?list:list.filter(a=>{
          if(['FALL_BACK','EVACUATE'].includes(a))return canFallBack;
          if(a==='COVER')return (s.locations[u.location].covers.some(c=>coverAvailable(s,u,c))||!u.cover&&s.locations[u.location].covers.filter(c=>c.discovered&&!c.parent).length<s.locations[u.location].cover_limit);
          if(a==='SHIFT')return !['Bunker','Pillbox'].includes(coverOf(s,u)?.type)&&incoming(s,u).some(f=>canFire(s,u,f.origin));
          if(a==='ADVANCE')return adjacent(s,u.location).some(l=>!l.staging&&!movementReason(s,u,l.id));
          if(a==='RECONSTITUTE')return availableCounters(s,'SQUAD').some(p=>!normandy||reconstitutionFirepower(p,reconstitutionDonors(p,teams)));
          if(a==='SEEK_CASUALTY')return !u.mine_hit&&seenCasualties.some(c=>c.location===u.location?(!c.cover||coverAvailable(s,u,s.locations[u.location].covers.find(v=>v.id===c.cover))):adjacent(s,u.location).some(l=>!movementReason(s,u,l.id)&&distance(l,s.locations[c.location])<distance(s.locations[u.location],s.locations[c.location])));
          if(a==='ATTACK')return same||!!u.fire&&occupants(s,u.fire).some(v=>v.faction!==u.faction);
          return true;
        });
        return legal.length?legal[roll(legal.length)-1]:'NONE';
      };
      let action='NONE';
      if(normandy&&(u.pinned||u.cohesion!=='GOOD'))action=choices(latActivityTable({pinned:u.pinned,same,covered,leader,cohesion:u.cohesion,named:u.named,kind:u.kind,teams:teams.length,localCasualty:!!localCasualty,seenCasualties:seenCasualties.length}));
      else if(u.pinned) {
        if(same&&!covered)action=choices(['NONE','COVER','RALLY','FALL_BACK','FALL_BACK']);
        else if(same&&covered)action=choices(['NONE','NONE','RALLY','FALL_BACK','FALL_BACK']);
        else if(!covered)action=choices(['NONE','NONE','COVER','RALLY','FALL_BACK']);
        else action=choices(['NONE','NONE','RALLY','FALL_BACK']);
      }else if(u.cohesion!=='GOOD') {
        if(u.named&&u.cohesion==='F'&&!same)action=choices(['NONE','RECOVER']);
        else if(u.cohesion==='A')action=choices(['NONE',same?'ATTACK':'ADVANCE']);
        else if(u.cohesion==='F'&&same)action=choices(covered?['NONE','NONE','ATTACK','FALL_BACK','FALL_BACK']:['NONE','COVER','FALL_BACK','FALL_BACK','FALL_BACK']);
        else if(u.cohesion==='L')action=s.mission_contacts&&localCasualty?choices(['NONE','EVACUATE','EVACUATE']):s.mission_contacts&&seenCasualties.length?choices(['NONE','SEEK_CASUALTY','SEEK_CASUALTY']):roll(3)===3?'RECOVER':'NONE';
      }else if(s.enemy_tactics==='offensive_assault'){
        if(same&&!covered)action=choices(['NONE','COVER','COVER','FALL_BACK','ATTACK']);
        else if(same&&covered)action=choices(['NONE','FALL_BACK','ATTACK','ATTACK','ATTACK']);
        else if(u.out_of_ammo)action=choices(['NONE','NONE','FALL_BACK']);
        else if((normandy?(u.tripod||['G','H'].includes(vofOf(u))):['A','G','H'].includes(u.vof))&&u.fire&&occupants(s,u.fire).some(friendly))action='ATTACK';
        else action=choices(['NONE','INFILTRATE','INFILTRATE','ADVANCE']);
      }
      else if(same&&!covered)action=choices(['COVER','FALL_BACK','ATTACK']);
      else if(same&&covered)action=choices(['NONE','ATTACK','ATTACK']);
      else if(s.mission_contacts&&u.out_of_ammo&&(u.tripod||['G','H'].includes(u.vof)))action=choices(['NONE','FALL_BACK']);
      else if(!under&&!values(s.units).some(v=>friendly(v)&&live(v)&&unitLos(s,u,v)))action=s.mission_contacts?'HIDE':'NONE';
      else if(!under&&u.fire)action='ATTACK';
      else if(under&&!covered)action=choices(['COVER','COVER','ATTACK']);
      else if(incoming(s,u).some(f=>{const here=s.locations[u.location],aim=s.locations[u.fire],origin=s.locations[f.origin];return !aim||Math.sign(aim.row-here.row)!==Math.sign(origin.row-here.row)||Math.sign(aim.col-here.col)!==Math.sign(origin.col-here.col);})){
        do{
          action=choices(['NONE','ATTACK','SHIFT','SHIFT']);
          if(action==='SHIFT'&&s.mission_rules?.specialEnemies&&['Bunker','Pillbox'].includes(coverOf(s,u)?.type))emit(s,'ENEMY_ACTIVITY_REDRAW','Fortification firing arc cannot shift; redraw enemy activity.',{actor:u.id,location:u.location,faction:u.faction},!visible(s,u));
          else break;
        }while(true);
      }
      else if((s.mission_contacts?(u.tripod||u.vof==='H'):['A','H'].includes(u.vof))&&u.fire)action='ATTACK';
      else if(u.fire){const opposing=incoming(s,u).map(f=>f.value);const stronger=opposing.length&&basicValue(u)<Math.min(...opposing);action=roll(s.mission_contacts&&stronger?3:2)>1?'ATTACK':'NONE';}
      if(action==='COVER')enemyCover(s,u);
      if(action==='RALLY')rally(s,u);
      if(action==='RECOVER')rally(s,u,u,true);
      if(action==='RECONSTITUTE'){
       const profiles=availableCounters(s,'SQUAD').filter(p=>!normandy? p.vof==='S'||teams.some(v=>v.cohesion==='A'||v.fire_team_vof==='A'):reconstitutionFirepower(p,reconstitutionDonors(p,teams)));
       const profile=profiles.length?pick(s,profiles,'Enemy reconstitution counter',!visible(s,u)):null;
       if(profile&&attempt(s,u,2,'rally','Enemy squad reconstitution',!visible(s,u))){
        const donors=normandy?reconstitutionDonors(profile,teams):teams.slice(0,profile.steps),id=`enemy_${s.next_id++}`,steps=donors.flatMap(v=>v.steps);
        s.units[id]={...structuredClone(profile),id,counter_id:profile.id,max_steps:profile.steps,faction:'enemy',platoon:null,location:u.location,cover:u.cover,steps,cohesion:'GOOD',experience:'Green',original_experience:'Green',pinned:false,exposed:false,radios:[],assets:{},ammo:donors.reduce((all,v)=>{for(const [key,n]of Object.entries(v.ammo??{}))all[key]=(all[key]??0)+n;return all;},{}),initial_resources:{radios:[],assets:{},ammo:structuredClone(profile.ammo??{})},saved:0,used:[],fire:null,indirect:null,removed:null,named:false,mission_weapon:true,contact_type:u.contact_type};
        if(normandy)reconstitutionLoads(s,s.units[id],donors);
        for(const v of donors){v.steps=[];v.removed='RECONSTITUTED';processed.add(v.id);if(s.knowledge.spotted[v.id])s.knowledge.spotted[id]={id};}
        processed.add(id);emit(s,'FORMATION_RECONSTITUTED','Enemy squad reconstituted from limited-action teams.',{actor:id,contributors:donors.map(v=>v.id)},!visible(s,s.units[id]));
       }
      }
      if(action==='EVACUATE'){localCasualty.carrier=u.id;fallBack(s,u);}
      if(action==='SEEK_CASUALTY'){
        const nearest=Math.min(...seenCasualties.map(c=>distance(s.locations[u.location],s.locations[c.location])));
        const target=pick(s,seenCasualties.filter(c=>distance(s.locations[u.location],s.locations[c.location])===nearest),'Litter team casualty destination',!visible(s,u));
        if(target.location===u.location){u.cover=target.cover;u.exposed=true;}else{const choices=adjacent(s,u.location).filter(l=>!l.staging&&!hasFire(s,l.id)&&!movementReason(s,u,l.id)&&distance(l,s.locations[target.location])<nearest);if(choices.length)move(s,u,pick(s,choices,'Litter team approach',!visible(s,u)).id);}
      }
      if(action==='FALL_BACK')fallBack(s,u);
      if(action==='ATTACK')attack(s,u);
      if(action==='SHIFT'){const f=incoming(s,u).find(f=>canFire(s,u,f.origin));if(f)u.fire=f.origin;}
      if(action==='ADVANCE'||action==='INFILTRATE') {
        const legal=adjacent(s,u.location).filter(l=>!l.staging&&!movementReason(s,u,l.id));
        const foes=values(s.units).filter(v=>friendly(v)&&live(v)),near=l=>Math.min(...foes.map(v=>distance(l,s.locations[v.location])));
        let candidates=legal;
        if(normandy&&action==='ADVANCE'&&s.locations[u.location].row>1)candidates=legal.filter(l=>l.row===s.locations[u.location].row-1&&l.col===s.locations[u.location].col);
        else if(normandy)candidates=legal.filter(l=>near(l)<near(s.locations[u.location]));
        const closest=Math.min(...candidates.map(near));
        let dest=normandy?(candidates.length?pick(s,candidates.filter(l=>near(l)===closest),'Enemy advance destination',!visible(s,u)):null):legal.sort((a,b)=>near(a)-near(b))[0];
        let infiltrate=action==='INFILTRATE';
        if(normandy&&infiltrate&&(!dest||infiltrationReason(s,u,dest.id))){
         infiltrate=false;
         const forward=s.locations[u.location].row>1?legal.filter(l=>l.row===s.locations[u.location].row-1&&l.col===s.locations[u.location].col):legal.filter(l=>near(l)<near(s.locations[u.location]));
         const minimum=Math.min(...forward.map(near));dest=forward.length?pick(s,forward.filter(l=>near(l)===minimum),'Enemy infiltration fallback',!visible(s,u)):null;
        }
        if(dest){move(s,u,dest.id,infiltrate);if(normandy)u.cover=selectEnemyCover(s,u,u.location,true)?.id??null;}
      }
      if(action==='HIDE') {
        u.removed='HIDDEN';u.fire=null;
        if(!values(s.contacts).some(c=>c.location===u.location&&!c.resolved)){const id=`pc_return_${s.next_id++}`;s.contacts[id]={id,location:u.location,type:u.contact_type??pick(s,['A','B','C'],'Replacement contact letter',true),resolved:false};}
        emit(s,'CONTACT_RENEWED',`A previously engaged position at ${s.locations[u.location].name} must be cleared again.`,{location:u.location},!visible(s,u));
      }
      emit(s,'ENEMY_ACTIVITY',`${u.name}: ${action.toLowerCase().replaceAll('_',' ')}${action==='NONE'?'; existing fire continues':''}.`,{actor:u.id,action},!visible(s,u));
      refresh(s);
    }
  }
}
export function capture(s,{friendlyRemainder='F'}={}) {
  for(const l of values(s.locations)) {
    for(const side of ['friendly','enemy']) {
      const units=occupants(s,l.id),victims=units.filter(u=>u.faction===side&&['P','L'].includes(u.cohesion));
      if(!victims.length||units.some(u=>u.faction===side&&!['P','L'].includes(u.cohesion)))continue;
      const guard=units.find(u=>u.faction!==side&&!u.pinned&&basicValue(u)!==null);
      if(!guard)continue;
      const step=guard.steps.pop();s.prisoners.push({guard:step,guard_origin:guard.id,guard_experience:guard.experience,prisoners:victims.flatMap(u=>u.steps)});
      if(s.mission_contacts&&guard.kind==='SQUAD'&&guard.steps.length===1){
        const child=splitTeam(s,guard,friendly(guard)?friendlyRemainder:pick(s,['F','A'],'Guard remainder side',!visible(s,guard)),guard.steps.pop());
        child.radios=guard.radios;child.assets=guard.assets;guard.radios=[];guard.assets={};
        for(const c of s.casualties.filter(c=>c.carrier===guard.id))c.carrier=child.id;
        guard.removed='BROKEN';if(!friendly(guard)&&s.knowledge.spotted[guard.id])s.knowledge.spotted[child.id]={id:child.id};
        emit(s,'FORMATION_CHANGED',`${guard.name}: remaining step becomes ${child.cohesion==='A'?'Assault':'Fire'} Team after guard assignment.`,{actor:guard.id,location:l.id,formations:[child.id],cause:'GUARD_ASSIGNMENT'},!visible(s,guard));
      }
      if(!guard.steps.length&&!guard.removed){loseAssets(s,guard,false);guard.removed='GUARD';}
      for(const u of victims){
        if(s.objectives&&side==='enemy')spot(s,u);
        if(s.mission_contacts)dropLoad(s,u,'capture');u.removed='CAPTURED';emit(s,'UNIT_CAPTURED',`${u.name} captured; one opposing step assigned as guard.`,{actor:u.id,faction:u.faction,location:l.id,...(s.objectives?{step_ids:u.steps.map(step=>step.id)}:{})},!visible(s,u));
      }
    }
    if(s.objectives){
      if(!occupants(s,l.id).some(u=>!friendly(u))&&(occupants(s,l.id).some(friendly)||!values(s.contacts).some(c=>c.location===l.id&&!c.resolved)))for(const c of s.casualties.filter(c=>c.location===l.id&&c.faction==='enemy'&&!c.evacuated)){
        c.evacuated=true;emit(s,'ENEMY_CASUALTY_CAPTURED','An enemy casualty step was captured.',{location:l.id,step_id:s.events.some(e=>e.type==='CASUALTY'&&!e.hidden&&e.step_id===c.step.id)?c.step.id:c.id});
      }
    }else if(!occupants(s,l.id).some(u=>!friendly(u)))for(const c of s.casualties.filter(c=>c.location===l.id&&c.faction==='enemy'))c.evacuated=true;
  }
}
export function retreat(s) {
  for(const u of values(s.units).filter(u=>live(u)&&!u.pinned&&!u.exposed&&['P','L'].includes(u.cohesion)&&hasFire(s,u.location))) {
    if(u.cohesion==='L') {
      const c=s.casualties.find(c=>c.location===u.location&&c.cover===u.cover&&!c.evacuated&&c.faction===u.faction);
      if(!c)continue;c.carrier=u.id;
    }
    fallBack(s,u);
  }
}
