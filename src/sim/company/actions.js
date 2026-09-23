import { terrainProtection } from './terrain.js';
import { values, live, good, friendly, visible, expMod, emit, draw, attempt, randomNumber, pick, result } from './core.js';
import { adjacent, occupants, distance, los, communication, chain, coverOf, basicValue, canFire, refresh, spot, hasFire, incoming, movementReason, communicationReason, spottingLocations, vofOf, rangeOf } from './battlefield.js';
export const ACTIONS = {
  ACTIVATE:'Activate HQ / staff', MOVE:'Move', PLATOON_MOVE:'Move platoon', INFILTRATE:'Infiltrate', PLATOON_INFILTRATE:'Infiltrate platoon',
  INFILTRATE_WITHIN:'Infiltrate within card', SEEK_COVER:'Seek cover', ENTER_COVER:'Move within card', SPOT:'Spot position', SHIFT_FIRE:'Shift fire', CEASE_FIRE:'Cease fire on this card',
  CONCENTRATE:'Concentrate fire', GRENADE:'Grenade / close assault', RALLY:'Remove pin', RECOVER:'Recover cohesion',
  DEPLOY_FIRE_TEAM:'Deploy named Fire Team', RECONSTITUTE:'Reconstitute squad', RECONSTITUTE_HQ:'Reconstitute HQ', DETACH:'Detach assault team',
  CALL_MORTAR:'Call 81mm fire', CALL_ARTILLERY:'Call 105mm fire', INDIRECT:'Direct mortar section',
  SMOKE:'Deploy screening smoke', SIGNAL_ADVANCE:'Signal: cross phase line 2', SIGNAL_CEASE:'Signal: cease fire',
  PICKUP_RADIO:'Recover equipment', PICKUP_CASUALTY:'Pick up casualty', DROP_CASUALTY:'Drop casualties',
};
export const costOf = type => type.startsWith('PLATOON_') ? 2 : 1;
const hq = u => ['HQ','STAFF'].includes(u.kind);
const genericInit = s => s.impulse?.hq === 'general';
const actionKey = (u,type,target) => type === 'ACTIVATE' ? `${type}_${target}` : type === 'RECOVER' ? `${type}_${u.cohesion}` : type;
const areaTargets = (s,u) => values(s.units).filter(t=>live(t)&&t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]));
function targetsAt(s,u,id) { return areaTargets(s,u).filter(t=>t.location===id); }
export function eligibleTargets(s,u,type) {
  if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)) return adjacent(s,u.location).map(l=>l.id);
  if(type==='ACTIVATE') return values(s.units).filter(t=>friendly(t)&&t.id!=='co'&&hq(t)&&live(t)).map(t=>t.id);
  if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(type)) return ['open',...s.locations[u.location].covers.filter(c=>(!friendly(u)||c.known)&&!occupants(s,u.location).some(t=>t.faction!==u.faction&&t.cover===c.id)).map(c=>c.id)];
  if(type==='SPOT') return spottingLocations(s).filter(id=>!s.locations[u.location].staging&&los(s,u.location,id));
  if(type==='INDIRECT') return values(s.locations).filter(l=>!l.staging&&distance(s.locations[u.location],l)<=u.range).map(l=>l.id);
  if(['SHIFT_FIRE','CALL_MORTAR','CALL_ARTILLERY'].includes(type)) return values(s.locations).filter(l=>!l.staging&&los(s,u.location,l.id)).map(l=>l.id);
  if(['GRENADE','CONCENTRATE'].includes(type)) return areaTargets(s,u).filter(t=>los(s,u.location,t.location,type==='GRENADE'?(vofOf(u)==='G'?rangeOf(u):0):rangeOf(u))).map(t=>t.id);
  if(type==='RECONSTITUTE_HQ') return values(s.units).filter(t=>friendly(t)&&t.kind==='HQ'&&!live(t)).map(t=>t.id);
  if(type==='RECONSTITUTE') return values(s.units).filter(t=>t.faction===u.faction&&t.kind==='SQUAD'&&!live(t)).map(t=>t.id);
  if(type==='PICKUP_RADIO') return s.assets.filter(a=>a.location===u.location&&['RADIO','EQUIPMENT'].includes(a.type)&&!a.destroyed).map(a=>a.id);
  if(type==='PICKUP_CASUALTY') return s.casualties.filter(c=>c.location===u.location&&c.cover===u.cover&&c.faction===u.faction&&!c.carrier&&!c.evacuated).map(c=>c.id);
  return [];
}
export function orderReason(s,c) {
  const u=s.units[c.unit_id], issuer=s.units[c.issuer_id],type=c.type,target=c.target_id;
  if(!ACTIONS[type]) return 'Unknown order.';
  if(s.status!=='ACTIVE') return 'The mission has ended.';
  if(!s.impulse) return 'Advance to a command impulse to issue orders.';
  if(!live(u)||!friendly(u)) return 'Select an available friendly formation.';
  if(!genericInit(s) && c.issuer_id!==s.impulse.hq) return 'Only the active HQ can issue orders in this impulse.';
  if(s.impulse.commands<costOf(type)||s.impulse.spent+costOf(type)>6) return 'Insufficient commands, or the six-command impulse limit has been reached.';
  if(!genericInit(s)) {
    if(!live(issuer)) return 'The issuing HQ is unavailable.';
    if(issuer.cohesion!=='GOOD'&&issuer.id!==u.id) return 'A degraded HQ can only order itself.';
    if(!chain(issuer,u,type)) return 'The unit is outside this HQ’s chain of command.';
    if(!communication(s,issuer,u,type==='RALLY')) return communicationReason(s,issuer,u,type==='RALLY');
  }
  if(type==='ACTIVATE'&&s.activated.includes(target)) return `${s.units[target]?.name??'This HQ'} is already activated. Complete Company HQ’s impulse, then select it in 3.3.1c to spend its commands.`;
  if(u.used.includes(`${s.impulse.id}:${actionKey(u,type,target)}`)&&type!=='ENTER_COVER') return 'This unit already attempted this action in this impulse.';
  const restricted=u.pinned||u.cohesion==='P';
  if(restricted&&!['ACTIVATE','RALLY','RECOVER','MOVE','SEEK_COVER','ENTER_COVER','DROP_CASUALTY'].includes(type)) return 'Pinned, paralyzed or litter teams cannot perform this action.';
  if(u.cohesion==='L'&&!['RALLY','RECOVER','MOVE','INFILTRATE','INFILTRATE_WITHIN','SEEK_COVER','ENTER_COVER','PICKUP_RADIO','PICKUP_CASUALTY','DROP_CASUALTY'].includes(type))return 'Litter teams must recover before performing this action.';
  if(u.cohesion==='P'&&['SEEK_COVER','ENTER_COVER'].includes(type)) return 'A paralyzed team must recover before moving within its card.';
  if(['ACTIVATE','RECONSTITUTE','RECONSTITUTE_HQ','SIGNAL_ADVANCE','SIGNAL_CEASE'].includes(type) && genericInit(s) && (!issuer||!hq(issuer)||(type==='RECONSTITUTE_HQ'?issuer.cohesion!=='GOOD':!good(issuer))||!chain(issuer,u,type)||!communication(s,issuer,u))) return 'This action requires an eligible HQ in communication even during general initiative.';
  if(type==='ACTIVATE') {
    const t=s.units[target];
    if(c.issuer_id!=='co'||u.id!=='co'||s.phase!=='CO_ACTIVATION') return 'Only Company HQ can activate subordinates in its activation impulse.';
    if(!t||!hq(t)||t.id==='co'||!live(t)||t.cohesion!=='GOOD'||u.cohesion!=='GOOD'||s.activated.includes(t.id)||!communication(s,u,t)) return 'Choose a command-side, unactivated subordinate HQ in communication.';
  }
  if(type.startsWith('PLATOON_') && (u.kind!=='HQ'||!u.platoon||u.id!==c.issuer_id||!good(u))) return 'A good-order platoon HQ must order its own group move.';
  if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)) {
    if(movedThisImpulse(s,u))return 'Already moved to an adjacent card in this impulse.';
    const reason=movementReason(s,u,target); if(reason) return reason;
    if(type.includes('INFILTRATE')) {const reason=infiltrationReason(s,u,target);if(reason)return reason;}
  }
  if(['SEEK_COVER','ENTER_COVER','INFILTRATE_WITHIN'].includes(type)&&s.locations[u.location].staging)return 'Staging is an off-map holding area with no terrain cover.';
  if(type==='INFILTRATE_WITHIN'){const reason=infiltrationReason(s,u,u.location,true);if(reason)return reason;}
  if(type==='SEEK_COVER'&&(u.cover||s.locations[u.location].covers.filter(c=>c.type==='Cover').length>=s.locations[u.location].cover_limit)) return 'Already in cover, or the card has reached its cover potential.';
  if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(type)&&(!eligibleTargets(s,u,type).includes(target)||(target==='open'?u.cover===null:u.cover===target))) return 'Choose a different, accessible area on this card.';
  if(type==='DEPLOY_FIRE_TEAM'&&(!good(u)||(!u.named||u.steps.length!==1)))return 'Only a good-order one-step named formation can deploy its named Fire Team; command/observer capability is lost until recovered.';
  if(type==='RALLY'&&!u.pinned) return 'This unit is not pinned.';
  if(type==='RECOVER'&&(u.pinned||!['P','L','F'].includes(u.cohesion))) return 'Remove the pin first; only paralyzed, litter or fire teams need recovery.';
  if(type==='SPOT'&&(u.pinned||['P','L'].includes(u.cohesion)||!eligibleTargets(s,u,type).includes(target))) return 'Need an unpinned spotting-capable unit on the map with LOS to a current unspotted position.';
  if(type==='SHIFT_FIRE'&&(!u.fire||!s.locations[target]||!los(s,(issuer??u).location,target)||!canFire(s,u,target)||
    (s.knowledge.suspected[target]&&!targetsAt(s,u,target).length))) return 'Need an existing fire direction and an eligible destination visible to the issuer. Spot suspected enemies first.';
  if(type==='SHIFT_FIRE'&&coverOf(s,u)?.type==='Bunker') return 'Bunker occupants cannot shift their firing arc.';
  if(type==='CEASE_FIRE'&&!u.fire&&!u.indirect) return 'This unit is not maintaining fire.';
  if(['CONCENTRATE','GRENADE'].includes(type)) {
    if(!vofOf(u))return 'This command/observer side has no weapon VOF. It cannot perform a weapon attack.';
    const t=s.units[target];
    if(!eligibleTargets(s,u,type).includes(target)||!t) return 'Choose a spotted enemy within weapon range and LOS.';
    if(type==='CONCENTRATE'&&(!u.fire||u.fire!==t.location||!['S','A','A/S','H'].includes(vofOf(u)))) return 'Concentrated fire must follow an existing direction of basic fire.';
    if(type==='GRENADE'&&t.location!==u.location&&occupants(s,u.location).some(v=>v.faction===u.faction&&v.fire&&v.fire!==t.location)) return 'Ranged grenades must follow the existing direction of fire.';
    if(type==='GRENADE'&&t.location!==u.location&&occupants(s,u.location).some(v=>v.faction!==u.faction)) return 'Resolve point-blank combat before firing grenades elsewhere.';
  }
  if(type.startsWith('CALL_')) {
    const agency=type==='CALL_MORTAR'?'MTR':'ARTY';
    if(!good(u)||!['co',agency==='MTR'?'mtrfo':'artyfo'].includes(u.id)||!u.radios.includes(u.id==='co'?'BN':agency)) return 'This observer needs its working fire-direction radio and good order.';
    if(!s.locations[target]||!los(s,u.location,target)||!targetsAt(s,u,target).length) return 'Call for fire requires a spotted enemy position in the observer’s LOS.';
  }
  if(type==='INDIRECT'&&(!good(u)||u.kind!=='MORTAR'||u.steps.length<2||u.exposed||c.target_id===u.location||['Building','Bunker','Cave','Pillbox'].includes(coverOf(s,u)?.type)||s.locations[u.location].terrain==='woods'||
    !s.locations[target]||!issuer||!los(s,issuer.location,target)||distance(s.locations[u.location],s.locations[target])>u.range||!targetsAt(s,u,target).length)) return 'Need an unexposed two-step mortar outside woods, in communication with an HQ that sees the spotted target.';
  if(type==='SMOKE'&&(!good(u)||!u.assets.smoke)) return 'No screening smoke available on this good-order unit.';
  if(type.startsWith('SIGNAL_')&&(!good(u)||!u.assets[type==='SIGNAL_ADVANCE'?'advance':'cease'])) return 'This unit has no remaining asset for that signal.';
  if(type==='DETACH'&&(!good(u)||!((u.kind==='SQUAD'&&u.steps.length>=3)||(u.kind==='MG'&&u.steps.length===2)))) return 'Detach from a good-order squad of at least three steps or a two-step weapon team.';
  if(type==='RECONSTITUTE') {
    const squad=s.units[target],ids=c.contributor_ids;
    if(!squad||squad.kind!=='SQUAD'||live(squad)||squad.faction!==u.faction) return 'Choose a previously eliminated squad counter to restore.';
    if(!Array.isArray(ids)||ids.length<2||ids.length>4||new Set(ids).size!==ids.length||!ids.includes(u.id)) return 'Choose 2–4 distinct contributing teams, including the selected team.';
    if(ids.length>(squad.max_steps??squad.steps.length)) return `${squad.name} can hold at most ${squad.max_steps??0} steps; choose fewer teams.`;
    if(ids.some(id=>{const t=s.units[id];return !live(t)||t.faction!==u.faction||t.kind!=='LAT'||!['A','F'].includes(t.cohesion)||t.pinned||t.location!==u.location||t.cover!==u.cover||t.steps.length!==1;})) return 'Every contributor must be an unpinned one-step Fire/Assault Team in the same area.';
  }
  if(type==='RECONSTITUTE_HQ') {
    const t=s.units[target];
    if(!issuer||issuer.cohesion!=='GOOD'||!['co','staff'].includes(issuer.id)||!good(u)||!t||live(t)||t.kind!=='HQ'||
      (t.platoon ? u.platoon!==t.platoon&&u.kind!=='STAFF' : !['HQ','STAFF','FO'].includes(u.kind))) return 'Company HQ or staff must use an eligible good-order donor to restore an eliminated HQ.';
    if(t.id==='co') {
      const candidates=values(s.units).filter(v=>friendly(v)&&live(v)&&v.id!=='co');
      const rank=v=>v.kind==='HQ'?0:v.id==='artyfo'?1:v.kind==='STAFF'?2:99;
      const best=Math.min(...candidates.map(rank));
      if(issuer.kind!=='STAFF'||rank(u)!==best||best===99)return 'Company staff must restore Company HQ using a surviving platoon HQ first, then Artillery Observer, then staff. A higher-ranked Fire Team must recover first.';
    }
  }
  if(['PICKUP_RADIO','PICKUP_CASUALTY'].includes(type)&&(!eligibleTargets(s,u,type).includes(target)||u.pinned||u.cohesion==='P')) return 'Choose an available item here; pinned/paralyzed units cannot transport it.';
  if(type==='PICKUP_CASUALTY'&&s.casualties.filter(c=>c.carrier===u.id).length>=u.steps.length) return 'Each step can carry one casualty.';
  if(type==='DROP_CASUALTY'&&!s.casualties.some(c=>c.carrier===u.id)) return 'No casualties are being carried.';
  return null;
}
const movedThisImpulse=(s,u)=>s.impulse&&u.used.some(k=>['MOVE','INFILTRATE'].some(a=>k===`${s.impulse.id}:${a}`));
export function infiltrationReason(s,u,target,within=false) {
  if(u.pinned||u.cohesion==='P')return 'Pinned or paralyzed formations cannot infiltrate.';
  if(u.exposed)return 'Already exposed: infiltration requires an unexposed formation.';
  if(u.cohesion==='GOOD'&&(vofOf(u)==='H'||u.tripod))return 'This counter side carries a heavy or tripod-mounted weapon and cannot infiltrate.';
  if(!within){const reason=movementReason(s,u,target);if(reason)return reason;
    if(['F','L'].includes(u.cohesion)&&(hasFire(s,target)||!occupants(s,target).some(v=>v.faction===u.faction)))return 'Fire and litter teams may infiltrate only to a friendly-occupied card without VOF.';
  }
  if(!hasFire(s,u.location)&&!hasFire(s,target))return 'Infiltration requires fire on the origin or destination card.';
  return null;
}
const fortification = c => c&&['Trench','Bunker','Pillbox'].includes(c.type);
export function move(s,u,target,infiltrate=false) {
  const from=u.location,old=coverOf(s,u);
  const following=occupants(s,from).filter(v=>v.faction!==u.faction&&v.fire===from&&(!friendly(v)||s.knowledge.spotted[u.id])&&!occupants(s,from).some(t=>t.id!==u.id&&t.faction===u.faction));
  if(u.pinned||u.cohesion==='P') {
    for(const c of s.casualties.filter(c=>c.carrier===u.id))c.carrier=null;
    for(const net of u.radios)s.assets.push({id:`asset_${s.next_id++}`,type:'RADIO',net,location:from});
    for(const [key,quantity] of Object.entries(u.assets))if(quantity)s.assets.push({id:`asset_${s.next_id++}`,type:'EQUIPMENT',key,quantity,location:from});
    u.radios=[];u.assets={};
    emit(s,'ASSETS_DROPPED',`${u.name} dropped carried equipment and casualties before withdrawing.`,{actor:u.id,location:from},!visible(s,u));
  }
  const success=infiltrate&&attempt(s,u,2,'infiltrate',`${u.name}: infiltration`)>0;
  invalidateTargets(s,u);
  u.location=target;u.cover=null;u.fire=null;u.fire_direction=null;u.fire_effect=null;u.indirect=null;
  for(const v of following)if(canFire(s,v,target)){v.fire=target;v.fire_direction=null;v.fire_effect=null;}
  const cover=s.locations[target].covers.find(c=>(!friendly(u)||c.known)&&!occupants(s,target).some(v=>v.faction!==u.faction&&v.cover===c.id));
  if(cover)u.cover=cover.id;
  u.exposed=!(success||(s.locations[from].staging&&s.locations[target].staging)||(fortification(old)&&fortification(cover)));
  for(const c of s.casualties.filter(c=>c.carrier===u.id)) c.location=target;
  emit(s,'UNIT_MOVED',`${u.name} ${success?'infiltrated':'moved'} to ${s.locations[target].name}${u.exposed?'; exposed until cleanup':''}.`,{actor:u.id,from,target,exposed:u.exposed},!visible(s,u));
}
export function invalidateTargets(s,u) {
  for(const m of s.markers.filter(m=>m.target===u.id||u.cover&&m.cover===u.cover)) {
    if(m.type==='GRENADE') s.markers.push({type:'GRENADE_MISS',location:u.location});
  }
  s.markers=s.markers.filter(m=>m.target!==u.id&&!(u.cover&&m.cover===u.cover));
}
export function seekCover(s,u) {
  const l=s.locations[u.location];
  if(l.staging||u.cover||l.covers.filter(c=>c.type==='Cover').length>=l.cover_limit)return false;
  const success=attempt(s,u,l.cover_draw,'cover',`${u.name}: seek cover`)>0;
  if(success){const c={id:`cover_${l.id}_${l.covers.length+1}`,type:'Cover',value:1,known:friendly(u)};l.covers.push(c);u.cover=c.id;u.exposed=true;}
  emit(s,'COVER_ATTEMPT',`${u.name} ${success?'found and occupied additional cover; exposed while moving':'found no additional cover'}.`,{actor:u.id,success},!visible(s,u));
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
export function grenade(s,u,t,response=false) {
  const targets=t.cover?occupants(s,t.location).filter(v=>v.cover===t.cover&&v.faction===t.faction):[t];
  const successes=attempt(s,u,2,'grenade',`${visible(s,u)?u.name:'Unidentified unit'}: grenade attack`,!visible(s,u)&&!friendly(t));
  if(successes) s.markers.push({type:'GRENADE',source:u.id,location:t.location,target:t.cover?null:t.id,cover:t.cover,critical:successes>1,
    value:(friendly(u)?-4:-3)*(successes>1&&!t.cover?2:1)});
  else if(!s.markers.some(m=>m.type==='GRENADE_MISS'&&m.location===t.location))s.markers.push({type:'GRENADE_MISS',location:t.location});
  emit(s,'GRENADE_ATTEMPT',`${visible(s,u)?u.name:'Unidentified attacker'}: ${successes?'grenade attack placed':'grenade miss'} at ${s.locations[t.location].name}${successes>1?' (critical)':''}; effects resolve in mutual combat.`,{actor:visible(s,u)?u.id:null,target:visible(s,t)?t.id:null,success:!!successes},!visible(s,u)&&!visible(s,t));
  if(!response&&u.location===t.location)for(const v of targets)if(!v.pinned&&vofOf(v)&&(v.cohesion==='GOOD'||successes)&&(!friendly(v)||s.knowledge.spotted[u.id]))grenade(s,v,u,true);
}
export function concentrate(s,u,t) {
  if(!t.cover)t=pick(s,areaTargets(s,u).filter(v=>v.location===t.location&&!v.cover),'Concentrated fire: random out-of-cover target',!friendly(u));
  const n=attempt(s,u,2,'spot',`${u.name}: concentrated fire`);
  if(n)s.markers.push({type:'CONCENTRATE',location:t.location,target:t.cover?null:t.id,cover:t.cover,source:u.id,critical:n>1,value:n>1&&!t.cover?2:1});
  emit(s,'CONCENTRATE_ATTEMPT',`${visible(s,u)?u.name:'Unidentified attacker'}: ${n?'concentrated fire established':'concentrated fire failed'}.`,{actor:visible(s,u)?u.id:null,target:visible(s,t)?t.id:null,success:!!n},!visible(s,u)&&!visible(s,t));
}
export function spottingBaseDraws(s,u,t) {
  const l=s.locations[t.location],protection=terrainProtection(l,s.locations[u.location]);
  return 2+(s.locations[u.location].elevation>l.elevation?1:0)+(u.location===t.location?1:0)+(protection>=3?-1:protection===0?1:0)
    -(t.cover?1:0)+(t.exposed?2:0)+(t.vof==='A'?1:['H','G'].includes(t.vof)?2:0)-expMod(t)-(['FO','SNIPER'].includes(t.kind)?1:0);
}
export function spotAttempt(s,u,id) {
  const targets=occupants(s,id).filter(t=>t.faction!==u.faction&&!s.knowledge.spotted[t.id]);
  const l=s.locations[id],countFor=t=>spottingBaseDraws(s,u,t);
  // Attempt against the easiest unit to spot; success reveals the whole card.
  const t=targets.sort((a,b)=>countFor(b)-countFor(a)||a.id.localeCompare(b.id))[0];
  const found=!!t&&attempt(s,u,countFor(t),'spot',`${u.name}: observe ${l.name}`)>0;
  if(found)spot(s,t);
  emit(s,'OBSERVATION',`${u.name}: ${found?'enemy position identified':'no additional enemy identified'}.`,{actor:u.id,location:id,success:found});
}
export function splitTeam(s,u,cohesion,step) {
  const id=`lat_${s.next_id++}`;
  const unit={...structuredClone(u),id,name:`${cohesion==='A'?'Assault':cohesion==='F'?'Fire':cohesion==='L'?'Litter':'Paralyzed'} team ${id.slice(4)}`,
    kind:'LAT',steps:[step],cohesion,named:false,vof:'S',range:cohesion==='A'?0:1,radios:[],assets:{},fire:null,indirect:null,experience:cohesion==='A'?'Line':'Green',used:[],removed:null};
  s.units[id]=unit;return unit;
}
export function execute(s,c) {
  const u=s.units[c.unit_id],issuer=s.units[c.issuer_id]??u,type=c.type,t=s.units[c.target_id];
  if(type==='ACTIVATE'){
    s.activated.push(t.id);
    emit(s,'HQ_ACTIVATED',`${t.name} activated. Complete Company HQ’s impulse, then select ${t.name} in 3.3.1c to spend its commands.`,{hq:t.id,issuer:u.id});
  }
  else if(['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(type)) {
    const group=type.startsWith('PLATOON_')?occupants(s,u.location).filter(v=>v.platoon===u.platoon&&good(v)&&!movedThisImpulse(s,v)&&communication(s,u,v)&&!movementReason(s,v,c.target_id)&&(!type.includes('INFILTRATE')||!infiltrationReason(s,v,c.target_id))):[u];
    for(const v of group) {if(movementReason(s,v,c.target_id))continue;move(s,v,c.target_id,type.includes('INFILTRATE'));v.used.push(`${s.impulse.id}:${type.includes('INFILTRATE')?'INFILTRATE':'MOVE'}`);}
  }
  else if(type==='SEEK_COVER')seekCover(s,u);
  else if(['ENTER_COVER','INFILTRATE_WITHIN'].includes(type)){
    const old=coverOf(s,u),success=type==='INFILTRATE_WITHIN'&&attempt(s,u,2,'infiltrate',`${u.name}: within-card infiltration`)>0;
    invalidateTargets(s,u);u.cover=c.target_id==='open'?null:c.target_id;
    u.exposed=u.exposed||!(success||(fortification(old)&&fortification(coverOf(s,u))));
    emit(s,'WITHIN_CARD_MOVED',`${u.name} moved ${u.cover?'under cover':'out of cover'}${success?' by infiltration':u.exposed?'; exposed until cleanup':'; protected by fortifications'}.`,{actor:u.id,exposed:u.exposed});
  }
  else if(type==='DEPLOY_FIRE_TEAM'){u.cohesion='F';u.fire=null;emit(s,'COHESION_CHANGED',`${u.name} deployed its named Fire Team; recover it to restore command/observer capability.`,{actor:u.id,from:'GOOD',to:'F'});}
  else if(type==='RALLY'||type==='RECOVER')rally(s,u,genericInit(s)?u:issuer,type==='RECOVER');
  else if(type==='SPOT')spotAttempt(s,u,c.target_id);
  else if(type==='SHIFT_FIRE'||type==='CEASE_FIRE') {
    for(const v of occupants(s,u.location).filter(v=>v.faction===u.faction)){v.fire=type==='SHIFT_FIRE'?c.target_id:null;v.indirect=null;}
    s.markers=s.markers.filter(m=>m.type!=='CONCENTRATE'||s.units[m.source]?.location!==u.location);
  }
  else if(type==='GRENADE')grenade(s,u,t);
  else if(type==='CONCENTRATE')concentrate(s,u,t);
  else if(type.startsWith('CALL_')) {
    const success=attempt(s,u,u.id==='co'?1:2,'burst',`${u.name}: call for fire`)>0;
    if(success)s.support.push({id:`support_${s.next_id++}`,location:c.target_id,status:'PENDING',value:type==='CALL_MORTAR'?-3:-5,source:u.id});
    emit(s,'SUPPORT_REQUEST',`${u.name}: ${success?'fire mission pending; activates in Fire Mission Update':'fire request failed'}.`,{actor:u.id,location:c.target_id,success});
  }
  else if(type==='INDIRECT'){u.fire=null;u.indirect=c.target_id;}
  else if(type==='SMOKE'){u.assets.smoke--;s.locations[u.location].smoke=true;emit(s,'SMOKE_DEPLOYED',`Screening smoke at ${s.locations[u.location].name}: blocks outgoing and through LOS.`,{actor:u.id});}
  else if(type.startsWith('SIGNAL_')) {
    u.assets[type==='SIGNAL_ADVANCE'?'advance':'cease']--;
    for(const v of values(s.units).filter(v=>friendly(v)&&live(v))) {
      if(type==='SIGNAL_CEASE'){v.fire=null;v.indirect=null;}
      else if(s.locations[v.location].row===s.signal_phase_line-1){const dest=`r${s.signal_phase_line}c${s.locations[v.location].col}`;if(!movementReason(s,v,dest))move(s,v,dest);}
    }
    emit(s,'SIGNAL_DEPLOYED',`${u.name} deployed the ${type==='SIGNAL_ADVANCE'?'cross phase line 2':'cease fire'} signal.`,{actor:u.id});
  }
  else if(type==='DETACH'){const step=u.steps.pop();splitTeam(s,u,'A',step);}
  else if(type==='RECONSTITUTE') {
    const group=c.contributor_ids.map(id=>s.units[id]);
    if(attempt(s,issuer,2,'rally','Reconstitute squad')) {
      const squad=s.units[c.target_id];
      squad.steps=group.flatMap(v=>v.steps);squad.location=u.location;squad.cover=u.cover;squad.cohesion='GOOD';squad.removed=null;squad.pinned=false;squad.exposed=group.some(v=>v.exposed);squad.fire=null;
      squad.experience=group.filter(v=>v.experience==='Line').length>=Math.ceil(group.length/2)?'Line':'Green';
      for(const v of group){v.steps=[];v.removed='RECONSTITUTED';}
      emit(s,'FORMATION_RECONSTITUTED',`${squad.name} restored with ${group.length} steps from ${group.map(v=>v.name).join(', ')}.`,{actor:squad.id,contributors:group.map(v=>v.id),location:u.location});
    }
  }
  else if(type==='RECONSTITUTE_HQ') {
    t.steps=[u.steps.pop()];t.location=u.location;t.cover=u.cover;t.removed=null;t.cohesion='GOOD';t.experience='Green';t.original_experience='Green';t.saved=0;t.radios=[];t.pinned=false;
    if(!u.steps.length)u.removed='RECONSTITUTED';
    else if(u.kind==='SQUAD'&&u.steps.length===1){splitTeam(s,u,'F',u.steps.pop());u.removed='RECONSTITUTED';}
    emit(s,'HQ_RECONSTITUTED',`${t.name} restored at Green experience; recover a radio to restore its net.`,{actor:t.id,donor:u.id});
  }
  else if(type==='PICKUP_RADIO'){const a=s.assets.find(a=>a.id===c.target_id);if(a.type==='RADIO')u.radios.push(a.net);else u.assets[a.key]=(u.assets[a.key]??0)+a.quantity;s.assets=s.assets.filter(v=>v.id!==a.id);u.exposed=true;}
  else if(type==='PICKUP_CASUALTY'){
    const casualty=s.casualties.find(v=>v.id===c.target_id);casualty.carrier=u.id;u.exposed=true;
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
  const beforeFire=command.type==='CEASE_FIRE'||command.type==='SHIFT_FIRE'?occupants(s,u.location).filter(v=>v.faction===u.faction&&(v.fire||v.indirect)).map(v=>v.id):[];
  const contributors=command.type==='RECONSTITUTE'?` using ${command.contributor_ids.map(id=>s.units[id].name).join(', ')}`:'';
  const event=emit(s,'COMMAND_ISSUED',`${s.impulse.hq==='general'?'General initiative':s.units[s.impulse.hq].name}: ${ACTIONS[command.type]} — ${u.name}${command.target_id?' → '+(s.locations[command.target_id]?.name??s.units[command.target_id]?.name??command.target_id):''}${contributors}.`,{command:structuredClone(command)});
  s.impulse.commands-=costOf(command.type);s.impulse.spent+=costOf(command.type);
  u.used.push(`${s.impulse.id}:${key}`);
  execute(s,command);
  for(const casualty of s.casualties.filter(c=>c.carrier)){const carrier=s.units[casualty.carrier];casualty.location=carrier.location;casualty.cover=carrier.cover;}
  refresh(s);
  if(['CEASE_FIRE','SHIFT_FIRE'].includes(command.type)){
    const fires=s.fire.filter(f=>f.origin===u.location&&s.units[f.source].faction===u.faction);
    const stopped=beforeFire.map(id=>s.units[id].name).join(', ')||'No active sources';
    const reopened=[...new Set(fires.map(f=>s.units[f.source].name))].join(', ');
    emit(s,'FIRE_ORDER_RESULT',`${command.type==='CEASE_FIRE'?'Card-wide cease fire':'Card-wide shift fire'} at ${s.locations[u.location].name}. Previous sources: ${stopped}. ${fires.length?`${command.type==='CEASE_FIRE'?'Automatic fire reopened':'Fire now directed'} toward ${[...new Set(fires.map(f=>s.locations[f.target].name))].join(', ')} by ${reopened}.`:'Fire stopped; no eligible target caused automatic reopening.'}`,{actor:u.id,location:u.location,affected:beforeFire,reopened:[...new Set(fires.map(f=>f.source))]});
  }
  emit(s,'COMMAND_RESOLVED','Order resolved; fire relationships updated.',{caused_by_event_id:event.id});
  s.replay.push({op:'submitCommand',command:structuredClone(command)});
  return result(state,s,{accepted:true});
}
export function commandOptions(s,u,issuerId) {
  return Object.entries(ACTIONS).map(([type,label])=>{
    const targets=eligibleTargets(s,u,type);
    const targeted=['ACTIVATE','MOVE','PLATOON_MOVE','INFILTRATE','PLATOON_INFILTRATE','ENTER_COVER','INFILTRATE_WITHIN','SPOT','SHIFT_FIRE','CONCENTRATE','GRENADE','CALL_MORTAR','CALL_ARTILLERY','INDIRECT','RECONSTITUTE','RECONSTITUTE_HQ','PICKUP_RADIO','PICKUP_CASUALTY'].includes(type);
    const checks=(targeted?targets:[null]).map(target_id=>({id:target_id,reason:orderReason(s,{type,unit_id:u.id,issuer_id:issuerId,target_id,contributor_ids:type==='RECONSTITUTE'?[u.id,...occupants(s,u.location).filter(t=>t.id!==u.id&&t.faction===u.faction&&t.cover===u.cover&&!t.pinned&&t.kind==='LAT'&&['A','F'].includes(t.cohesion)).slice(0,Math.max(0,(s.units[target_id]?.max_steps??3)-1)).map(t=>t.id)]:undefined})}));
    const displayLabel=type==='RECONSTITUTE_HQ'?'Reconstitute eliminated HQ':type==='DEPLOY_FIRE_TEAM'&&['HQ','STAFF'].includes(u.kind)?'Deploy HQ Fire Team':type==='RECOVER'&&u.named&&u.cohesion==='F'?(['HQ','STAFF'].includes(u.kind)?'Restore HQ command side':u.kind==='FO'?'Restore observer side':'Restore weapon side'):label;
    return {type,label:displayLabel,cost:costOf(type),targeted,targets:checks,available:checks.some(c=>!c.reason),reason:checks.find(c=>c.reason)?.reason??'No eligible target.'};
  });
}
