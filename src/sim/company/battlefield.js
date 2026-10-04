import {transportReason} from './core.js';
import {commandHub,canCommandCompany,isCompanyCommander} from './commandRoles.js';
import {ammoLoadReason} from './ammunition.js';
import {phoneConnected} from './phoneNetwork.js';
import { whiteBorder as white, direction } from './terrain.js';
import { values, live, good, friendly, visible, emit, pick } from './core.js';
export const distance = (a,b) => Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
export const occupants = (s,id) => values(s.units).filter(u => live(u) && u.location === id);
export const adjacent = (s,id) => values(s.locations).filter(l => l.id !== id && distance(l,s.locations[id]) === 1);
export const coverOf = (s,u) => s.locations[u.location].covers.find(c => c.id === u.cover);
export const enclosedWeaponCover = c => ['Building','Light Building','Strong Building','Upper Story','Church Tower','Bunker','Cave','Pillbox'].includes(c?.type);
export const temporaryMortarFire=s=>values(s.units).filter(u=>u.temporary_pdf).map(u=>({source:u.id,origin:u.temporary_pdf.origin,target:u.temporary_pdf.target,value:null,pdf_only:true,indirect:false,reason:'TEMPORARY_MORTAR_PDF'}));
export const unitElevation = (s,u) => s.locations[u.location].elevation+(coverOf(s,u)?.elevation??0);
export function coverAvailable(s,u,c,location=u.location){
  const others=occupants(s,location).filter(t=>t.id!==u.id&&t.cover===c.id);
  return !others.some(t=>t.faction!==u.faction)&&(!c.capacity||others.reduce((n,t)=>n+t.steps.length,0)+u.steps.length<=c.capacity);
}
const screen = (s,id) => s.locations[id].smoke || s.support.some(f => f.status === 'ACTIVE' && f.location === id);
// Pure geometric trace. Hidden effects are sanitized separately in player projections.
export function explainLos(s, from, to, max = 3, elevations = {}) {
  const a=s.locations[from], b=s.locations[to], path=[];
  const result=(visible,reason,blocking=null)=>({visible,reason,path,blocking});
  if(!a||!b)return result(false,'Unknown terrain.');
  if(a.staging||b.staging)return result(false,'Staging permits communication, not combat or spotting LOS.');
  if(from===to)return result(true,'Same card: point-blank LOS.');
  const dr=b.row-a.row,dc=b.col-a.col,d=distance(a,b);
  if(dr&&dc&&Math.abs(dr)!==Math.abs(dc))return result(false,'LOS follows one of eight straight directions.');
  if(d>Math.min(max,3))return result(false,'Beyond the permitted LOS range.');
  if(screen(s,from))return result(false,'Smoke or active incoming fire blocks outward LOS.',from);
  for(let i=1;i<d;i++) {
    const mid=values(s.locations).find(l=>l.row===a.row+Math.sign(dr)*i&&l.col===a.col+Math.sign(dc)*i);
    if(!mid)return result(false,'The LOS path leaves the map.');
    const entry=direction(-dr,-dc),exit=direction(dr,dc);
    const clear=white(mid,-dr,-dc)&&white(mid,dr,dc);
    // A lower card can be overlooked, except a dark intermediate step between elevations.
    const high=Math.max(elevations.from??a.elevation,elevations.to??b.elevation),low=Math.min(elevations.from??a.elevation,elevations.to??b.elevation);
    const overlooked=mid.elevation<high && !(mid.elevation>low);
    path.push({location:mid.id,entry,exit,entry_border:mid.borders[entry],exit_border:mid.borders[exit],elevation:mid.elevation,overlooked:!clear&&overlooked});
    if(screen(s,mid.id))return result(false,`LOS is blocked at ${mid.name}.`,mid.id);
    if(mid.elevation>high || (!clear&&!overlooked))return result(false,`Blocked by ${mid.name}: intervening elevation or dark LOS border.`,mid.id);
  }
  return result(true,d===1?'Adjacent terrain is visible regardless of border color.':path.some(p=>p.overlooked)?'Clear LOS: higher elevation overlooks lower dark borders.':'Clear LOS through white entry and exit borders.');
}
export const los=(s,from,to,max=3)=>explainLos(s,from,to,max).visible;
export function explainUnitLos(s,u,target,max=3){
  const id=typeof target==='string'?target:target.location;
  return explainLos(s,u.location,id,max,{from:unitElevation(s,u),to:typeof target==='string'?undefined:unitElevation(s,target)});
}
export const unitLos=(s,u,target,max=3)=>explainUnitLos(s,u,target,max).visible;
export function explainUnitCard(s,u,id,max=3){
  const ground=explainUnitLos(s,u,id,max);if(ground.visible)return ground;
  for(const t of occupants(s,id).filter(t=>t.faction===u.faction||!friendly(u)||s.knowledge.spotted[t.id])){
    const trace=explainUnitLos(s,u,t,max);if(trace.visible)return {...trace,reason:`Visible occupied upper story: ${trace.reason}`};
  }
  return ground;
}
export const seesCard=(s,u,id,max=3)=>explainUnitCard(s,u,id,max).visible;
export function communicationLos(s,from,to) {
  const a=s.locations[from],b=s.locations[to];
  if(!a||!b)return false;
  if(a.staging&&b.staging)return true;
  if(a.staging||b.staging)return (a.staging?b:a).row===1&&distance(a,b)===1;
  return los(s,from,to);
}
export function communication(s,issuer,u,rally=false) {
  if (!live(issuer) || !live(u)) return null;
  if (issuer.id === u.id) return 'Self';
  if(s.mission_rules?.communications==='simplified'){
    const hq=v=>['HQ','STAFF'].includes(v.kind)&&v.cohesion==='GOOD'&&!v.pinned;
    return hq(issuer)&&(hq(u)||issuer.location===u.location)?'Mission communications · unpinned HQ/staff':null;
  }
  if (issuer.location === u.location && issuer.cover === u.cover && (rally || (!issuer.pinned && !u.pinned))) return 'Visual / verbal';
  if (issuer.cohesion !== 'GOOD' || u.cohesion !== 'GOOD') return null;
  if(s.mission_rules?.communications==='phones'){
   const hub=commandHub(s);
   const ready=v=>live(v)&&v.radios.includes('CO_PHONE')&&live(hub)&&hub.radios.includes('CO_PHONE')&&phoneConnected(s,v.location,hub.location);
   return ready(issuer)&&ready(u)?'CO field-phone network · intact line':null;
  }
  // Fire-direction networks connect observers to off-map agencies, not command HQs.
  if (!issuer.radios.includes('CO') || !u.radios.includes('CO')) return null;
  const hub=commandHub(s);
  const linked=v=>live(v)&&v.cohesion==='GOOD'&&v.radios.includes('CO')&&!v.cover&&
    live(hub)&&hub.cohesion==='GOOD'&&hub.radios.includes('CO')&&!hub.cover&&communicationLos(s,v.location,hub.location);
  return linked(issuer)&&linked(u) ? 'CO radio via Company HQ · LOS' : null;
}
export function communicationReason(s,issuer,u,rally=false) {
  if(!issuer)return 'No issuing HQ selected.';
  const channel=communication(s,issuer,u,rally);
  if(channel)return channel;
  if(s.mission_rules?.communications==='simplified')return `${issuer.name} must be an unpinned command-side HQ/staff; the recipient must share its card or be another unpinned HQ/staff.`;
  if(s.mission_rules?.communications==='phones')return `${issuer.name} cannot reach ${u.name}. They need matching-cover voice contact or working CO field phones connected through an intact phone line to Company HQ.`;
  return `${issuer.name} at ${s.locations[issuer.location].name}${issuer.cover?' under cover':''} cannot reach ${u.name} at ${s.locations[u.location].name}${u.cover?' under cover':''}. Same-area voice needs matching cover and unpinned units (rally excepted); CO radios need an uncovered, working Company HQ link. Observer radios only reach fire-support agencies.`;
}
export const vofOf = u => u.out_of_ammo&&(u.vof||['F','A'].includes(u.cohesion))?'S':u.mission_weapon&&u.cohesion==='A'?'A':u.cohesion==='F'?(u.fire_team_vof??'S'):u.cohesion==='A'?'S':u.vof_by_steps?.[u.steps.length]??u.vof;
export const rangeOf = u => u.out_of_ammo?1:u.cohesion==='A'?0:u.cohesion==='F'?1:u.range;
export function chain(issuer,u,type) {
  if (issuer.id === u.id || ['SHIFT_FIRE','CEASE_FIRE'].includes(type)) return true;
  if(issuer.command_role==='higher_hq')return true;
  if (canCommandCompany(issuer)) return !isCompanyCommander(u);
  return issuer.kind === 'HQ' && (issuer.platoon === u.platoon || u.kind === 'LAT');
}
export function basicValue(u,range=1) {
  if (!live(u) || ['P','L'].includes(u.cohesion)) return null;
  if (u.cohesion === 'F' || u.cohesion === 'A') return u.pinned ? 2 : vofOf(u)==='A'?-1:0;
  const vof=vofOf(u);if (!vof || vof === 'G') return null;
  if (u.pinned) return 2;
  if(u.out_of_ammo)return 0;
  return ({S:0,'S!':0,'A+':-1,A:-1,H:-3,'A/S':range===0 ? -1 : 0})[vof] ?? null;
}
export function canFire(s,u,id) {
  if(u.hold_fire_until_cleanup)return false;
  if(u.mission_weapon&&u.tripod&&(!u.tripod_good_only||u.cohesion==='GOOD')&&u.exposed)return false;
  if (basicValue(u) === null || !seesCard(s,u,id,rangeOf(u))) return false;
  if (u.cohesion==='GOOD' && u.kind === 'MORTAR' && (u.exposed || u.location===id || enclosedWeaponCover(coverOf(s,u)) || s.locations[u.location].terrain === 'woods')) return false;
  const cover = coverOf(s,u);
  if (['Bunker','Pillbox'].includes(cover?.type)) {
    const a=s.locations[u.location], b=s.locations[id];
    if (a.id === b.id || Math.sign(b.row-a.row) !== cover.arc[0] || Math.sign(b.col-a.col) !== cover.arc[1]) return false;
  }
  return true;
}
export const grazingCapable=u=>u.mission_weapon&&u.tripod&&(!u.tripod_good_only||u.cohesion==='GOOD')&&!u.out_of_ammo&&['GOOD','F'].includes(u.cohesion);
export function overheadAllowed(s,u,target,intervening){
  if(!u.mission_weapon||u.out_of_ammo||(!grazingCapable(u)&&vofOf(u)!=='H'))return false;
  const from=unitElevation(s,u),to=s.locations[target].elevation,mid=s.locations[intervening].elevation;
  return mid<=Math.min(from,to)&&mid<Math.max(from,to);
}
// One weapon/direction can exert VOF on several cards. Overflown cards receive none.
export function basicFireTargets(s,u,target){
  if(!canFire(s,u,target))return [];
  if(!grazingCapable(u)||target===u.location)return [target];
  const a=s.locations[u.location],b=s.locations[target],dr=Math.sign(b.row-a.row),dc=Math.sign(b.col-a.col);
  const aimDistance=distance(a,b),slope=Math.sign(b.elevation-unitElevation(s,u)),targets=[];
  let previous=unitElevation(s,u);
  for(let i=1;i<=rangeOf(u);i++){
    const id=`r${a.row+dr*i}c${a.col+dc*i}`,l=s.locations[id];
    if(!l||l.staging)break;
    if(i<aimDistance&&overheadAllowed(s,u,target,id)){
      if(screen(s,id))break;
      continue;
    }
    if(!canFire(s,u,id))break;
    const change=Math.sign(l.elevation-previous);
    if(change&&change!==slope)break;
    targets.push(id);previous=l.elevation;
    if(screen(s,id))break;
  }
  return targets;
}
// Persistent direction is distinct from the card currently receiving the VOF.
function fireDestination(s,u,target,extended=false) {
  const a=s.locations[u.location],b=s.locations[target];
  if(!b)return null;
  if(screen(s,u.location))return canFire(s,u,u.location)?u.location:null;
  const intent=extended?u.fire_direction:null;
  const dr=intent?.dr??Math.sign(b.row-a.row),dc=intent?.dc??Math.sign(b.col-a.col);
  if(!dr&&!dc)return target;
  const limit=extended?rangeOf(u):distance(a,b);
  for(let i=1;i<=limit;i++) {
    const id=`r${a.row+dr*i}c${a.col+dc*i}`;
    if(!s.locations[id]||!canFire(s,u,id))break;
    if(screen(s,id))return id;
    const units=occupants(s,id).filter(t=>(t.faction===u.faction||!friendly(u)||s.knowledge.spotted[t.id]||grazingCapable(u))&&!(u.kind==='MORTAR'&&u.cohesion==='GOOD'&&t.faction===u.faction));
    const aim=intent?.anchor??target;
    if(units.length&&i<distance(a,s.locations[aim])&&overheadAllowed(s,u,aim,id)&&(extended||units.every(t=>t.faction===u.faction)))continue;
    if(units.length)return id;
  }
  const anchor=intent?.anchor??target;
  return canFire(s,u,target)?target:canFire(s,u,anchor)?anchor:null;
}
function rememberDirection(s,u) {
  if(!u.fire){u.fire_direction=null;u.fire_effect=null;return;}
  if(!u.fire_direction||u.fire_effect!==u.fire||u.fire_direction.origin!==u.location){
    const a=s.locations[u.location],b=s.locations[u.fire];
    u.fire_direction={origin:u.location,anchor:u.fire,dr:Math.sign(b.row-a.row),dc:Math.sign(b.col-a.col)};
  }
}
export function enemyCeaseFire(s) {
  // Apply the boundary order to all enemies before any unit can acquire new fire.
  for(const u of values(s.units).filter(u=>live(u)&&!friendly(u))) {
    if(u.fire&&!occupants(s,u.fire).some(v=>v.faction!==u.faction)){
      u.fire=null;u.fire_direction=null;u.fire_effect=null;
    }
  }
  refresh(s);
}
export function sniperTargetCard(s,u,targets,priorityState=s) {
  const cards=[...new Set(targets.map(t=>t.location))];
  const opposing=id=>occupants(s,id).filter(t=>t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]));
  const command=id=>opposing(id).some(t=>['HQ','STAFF','LEADER'].includes(t.kind)&&t.cohesion==='GOOD');
  const commanders=cards.filter(command);
  let best;
  if(commanders.length){
    const nearest=Math.min(...commanders.map(id=>distance(s.locations[u.location],s.locations[id])));
    best=commanders.filter(id=>distance(s.locations[u.location],s.locations[id])===nearest);
  }else{
    const strength=id=>Math.min(99,...opposing(id).map(t=>priorityState.units[t.id]).filter(t=>t.fire).map(t=>basicValue(t,distance(s.locations[id],s.locations[t.fire]))??99));
    const strongest=Math.min(...cards.map(strength));
    const candidates=cards.filter(id=>strength(id)===strongest);
    const steps=id=>opposing(id).reduce((n,t)=>n+t.steps.length,0);
    const most=Math.max(...candidates.map(steps));best=candidates.filter(id=>steps(id)===most);
  }
  return best.length>1?pick(s,best,'Sniper engagement tie',!visible(s,u)):best[0];
}
// Rank eligible terrain cards against one frozen set of existing fire contributions.
export function automaticTargetCard(s,u,targets,projectedFire=s.fire) {
  let cards=[...new Set(targets.map(t=>t.location))].sort();
  if(!cards.length)return null;
  if(friendly(u)) {
    const nearest=Math.min(...cards.map(id=>distance(s.locations[u.location],s.locations[id])));
    cards=cards.filter(id=>distance(s.locations[u.location],s.locations[id])===nearest);
    const strength=id=>Math.min(99,...projectedFire.filter(f=>f.origin===id&&s.units[f.source]?.faction!==u.faction).map(f=>f.value));
    const strongest=Math.min(...cards.map(strength));cards=cards.filter(id=>strength(id)===strongest);
  } else {
    const steps=id=>occupants(s,id).filter(t=>t.faction!==u.faction).reduce((n,t)=>n+t.steps.length,0);
    const most=Math.max(...cards.map(steps));cards=cards.filter(id=>steps(id)===most);
  }
  return cards.length===1?cards[0]:pick(s,cards,'Automatic engagement tie',!visible(s,u));
}
export function refresh(s) {
  if(s.mission_rules?.enemyActivity==='normandy')for(const u of values(s.units).filter(u=>live(u)&&u.faction==='enemy'&&u.kind==='MORTAR'&&u.steps.length===1&&u.cohesion==='GOOD')){
   const local=occupants(s,u.location);
   if(!local.some(v=>v.id!==u.id&&v.faction===u.faction)&&local.some(v=>v.faction!==u.faction&&vofOf(v))){u.cohesion='F';u.experience='Green';u.fire=null;u.indirect=null;delete u.temporary_pdf;emit(s,'COHESION_CHANGED',`${u.name}: lone mortar confronted at point blank; Fire Team side.`,{actor:u.id,from:'GOOD',to:'F'},!visible(s,u));}
  }
  const old = new Set(s.fire.map(f => `${f.source}:${f.target}:${f.value}`));
  // A spotted unit sharing a card reveals all opposing occupants (8.5).
  for(const u of values(s.units).filter(u=>live(u)&&!friendly(u)&&s.knowledge.spotted[u.id]))spot(s,u);
  const established=new Map();
  const establish=(key,target)=>{if(!established.has(key))established.set(key,new Set());established.get(key).add(target);};
  for(const u of values(s.units).filter(u=>u.temporary_pdf)){
    if(!live(u)||u.location!==u.temporary_pdf.origin)delete u.temporary_pdf;
    else establish(`${u.faction}:${u.location}`,u.temporary_pdf.target);
  }
  for(const u of values(s.units).filter(live)) {
    rememberDirection(s,u);
    if(u.fire)u.fire=fireDestination(s,u,u.fire,true);
    u.fire_effect=u.fire;
    if(u.fire&&!canFire(s,u,u.fire))u.fire=null;
    if(u.fire)establish(`${u.faction}:${u.location}`,u.fire);
  }
  const selectionSnapshot={units:structuredClone(s.units)};
  const indirectUnits=values(s.units).filter(u=>live(u)&&u.indirect&&!u.exposed&&u.steps.length>=2&&u.cohesion==='GOOD'&&!u.pinned&&u.indirect!==u.location&&!['Building','Bunker','Cave','Pillbox'].includes(coverOf(s,u)?.type)&&s.locations[u.location].terrain!=='woods');
  const projectedFire=values(s.units).filter(u=>live(u)&&u.fire&&canFire(s,u,u.fire)&&!indirectUnits.includes(u)).map(u=>({source:u.id,origin:u.location,value:basicValue(u,distance(s.locations[u.location],s.locations[u.fire]))})).filter(f=>f.value!==null).concat(indirectUnits.map(u=>({source:u.id,origin:u.location,value:-3})));
  for (const u of values(s.units).filter(live)) {
    if (occupants(s,u.location).some(t=>t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]))&&canFire(s,u,u.location))u.fire=u.location;
    const key=`${u.faction}:${u.location}`,joined=[...(established.get(key)??[])].filter(id=>canFire(s,u,id));
    if(!u.fire&&joined.length)u.fire=automaticTargetCard(s,u,joined.map(location=>({location})),projectedFire);
    if (!u.fire && !u.indirect && basicValue(u) !== null) {
      const targets = values(s.units).filter(t => live(t) && t.faction !== u.faction &&
        (!friendly(u) || s.knowledge.spotted[t.id]) && canFire(s,u,t.location) && fireDestination(s,u,t.location)===t.location &&
        (!friendly(u) || !occupants(s,t.location).some(v=>friendly(v)) || t.location === u.location));
      if (targets.length)u.fire=fireDestination(s,u,u.mission_weapon&&vofOf(u)==='S!'?sniperTargetCard(s,u,targets,selectionSnapshot):automaticTargetCard(s,u,targets,projectedFire));
    }
    rememberDirection(s,u);u.fire_effect=u.fire;
    if(u.fire)establish(key,u.fire);
  }
  s.fire = values(s.units).filter(u=>live(u)&&u.fire&&canFire(s,u,u.fire)).flatMap(u => basicFireTargets(s,u,u.fire).map(target=>({
    source:u.id, origin:u.location, target, value:basicValue(u,distance(s.locations[u.location],s.locations[target])), indirect:false,
    direction:structuredClone(u.fire_direction),
    reason:target!==u.fire?'GRAZING_FIRE':screen(s,u.location)?'BLOCKED_AT_SOURCE':screen(s,u.fire)?'BLOCKED_BY_SMOKE':u.fire_direction?.anchor!==u.fire?'INTERCEPTED_OR_FOLLOWING':occupants(s,u.fire).some(t=>t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]))?'ENGAGED':'CONTINUING_AT_CLEARED_POSITION',
  })));
  for (const u of indirectUnits) {
    s.fire = s.fire.filter(f=>f.source!==u.id);
    s.fire.push({source:u.id,origin:u.location,target:u.indirect,value:-3,indirect:true});
  }
  s.markers=s.markers.filter(m=>m.type!=='CONCENTRATE'||(live(s.units[m.source])&&s.units[m.source].fire===m.location&&canFire(s,s.units[m.source],m.location)));
  for (const f of s.fire) {
    const u=s.units[f.source], affectsFriendly=occupants(s,f.target).some(friendly);
    if (!friendly(u) && affectsFriendly) s.knowledge.suspected[f.origin]=true;
    if(s.mission_contacts&&!friendly(u)&&!f.indirect&&!old.has(`${f.source}:${f.target}:${f.value}`)){
      const a=s.locations[f.origin],b=s.locations[f.target],d=distance(a,b);
      for(let i=1;i<d;i++){
        const id=`r${a.row+Math.sign(b.row-a.row)*i}c${a.col+Math.sign(b.col-a.col)*i}`;
        if(s.locations[id]?.elevation!==unitElevation(s,u))continue;
        for(const pc of values(s.contacts).filter(pc=>pc.location===id&&!pc.resolved)){
          pc.resolved=true;pc.removal_reason='ENEMY_FIRE_PATH';
          emit(s,'CONTACT_REMOVED','Potential contact removed along an established enemy firing path.',{location:id,reason:'ENEMY_FIRE_PATH'},!visible(s,u)&&!affectsFriendly);
        }
      }
    }
    if (!old.has(`${f.source}:${f.target}:${f.value}`)) emit(s,'FIRE_ESTABLISHED',
      `${visible(s,u) ? u.name : 'Unidentified fire'} ${f.value===2 ? 'fires weakly' : 'opens fire'} from ${s.locations[f.origin].name} toward ${s.locations[f.target].name}.`,
      {actor:visible(s,u)?u.id:null,origin:f.origin,target:f.target,value:f.value,reason:f.reason},!visible(s,u)&&!affectsFriendly);
  }
  for(const u of values(s.units).filter(u=>!friendly(u)&&s.knowledge.spotted[u.id])) s.knowledge.spotted[u.id]=observeRecord(u);
  const under = values(s.locations).filter(l=>occupants(s,l.id).length && hasFire(s,l.id));
  s.activity = under.length >= 2 ? (under.some(l=>new Set(occupants(s,l.id).map(u=>u.faction)).size>1) ? 'HEAVILY_ENGAGED' : 'ENGAGED')
    : values(s.locations).some(l=>hasFire(s,l.id)) || temporaryMortarFire(s).length || s.support.some(f=>f.status==='PENDING') || Object.keys(s.knowledge.spotted).some(id=>live(s.units[id])) ? 'CONTACT' : 'NO_CONTACT';
}
export const observeRecord = u => ({id:u.id,name:u.name,kind:u.kind,location:u.location,cohesion:u.cohesion,pinned:u.pinned,exposed:u.exposed,steps:u.steps.length,cover:u.cover,removed:u.removed});
export function spot(s,u) {
  for(const t of occupants(s,u.location).filter(t=>t.faction===u.faction)) {
    if(s.knowledge.spotted[t.id])continue;
    s.knowledge.spotted[t.id]=observeRecord(t);
    const cover=coverOf(s,t);if(cover){
      cover.known=true;
      if(s.mission_rules?.coverTable)for(const c of s.locations[t.location].covers)if(c.id===(cover.parent??cover.id)||c.parent===(cover.parent??cover.id))c.known=true;
    }
    emit(s,'ENEMY_SPOTTED',`${t.name} spotted at ${s.locations[t.location].name}.`,{actor:t.id,location:t.location});
  }
}
export const spottingLocations = s => Object.keys(s.knowledge.suspected).filter(id=>occupants(s,id).some(u=>!friendly(u)&&!s.knowledge.spotted[u.id]));
export function hasFire(s,id,{includeInactiveMines=true}={}) { return includeInactiveMines&&!!s.locations[id]?.mines || s.fire.some(f=>f.target===id) || s.support.some(f=>f.status==='ACTIVE'&&f.location===id) || s.markers.some(m=>m.location===id&&['GRENADE','GRENADE_MISS','MINES','SNIPER'].includes(m.type)); }
export function incoming(s,u) { return s.fire.filter(f=>f.target===u.location && (f.origin !== u.location || s.units[f.source].faction !== u.faction)); }
export function combatExposure(s,u) {
  const terrain=s.locations[u.location], cover=coverOf(s,u), fire=incoming(s,u);
  const indirect=s.support.filter(f=>f.status==='ACTIVE'&&f.location===u.location);
  const targeted=s.markers.filter(m => m.location===u.location && (m.target===u.id || (u.cover && m.cover===u.cover)));
  const grenades=targeted.filter(m=>['GRENADE','MINES','SNIPER'].includes(m.type));
  const miss=s.markers.some(m=>m.location===u.location&&m.type==='GRENADE_MISS');
  if(!fire.length&&!indirect.length&&!grenades.length&&!miss) return null;
  const directions=[...fire,...temporaryMortarFire(s).filter(f=>f.target===u.location)];
  const cross=new Set(directions.filter(f=>!f.indirect&&f.origin!==u.location).map(f=>{const a=s.locations[f.origin];return `${Math.sign(a.row-terrain.row)}:${Math.sign(a.col-terrain.col)}`;})).size>=2 ? -1 : 0;
  const smoke=Math.max(terrain.smoke ? terrain.smoke_value??2 : 0,indirect.some(f=>f.ammo==='WP')?1:0);
  const combined=s.mission_rules?.grenade?grenades.filter(m=>m.type==='GRENADE'):[];
  const effects=combined.length>1?[...grenades.filter(m=>m.type!=='GRENADE'),{type:'GRENADE',location:u.location,value:combined.reduce((n,m)=>n+m.value,0),label:'Combined grenade effects'}]:grenades;
  const candidates=[...fire.map(f=>({kind:f.indirect?'ON_MAP_INDIRECT':'BASIC_FIRE',source_id:f.source,origin:f.origin,value:f.value+smoke+(f.indirect?terrain.burst:0),vof:f.value,smoke,burst:f.indirect?terrain.burst:0,blast:false})),
    ...indirect.map(f=>({kind:'OFF_MAP_SUPPORT',source_id:null,origin:f.location,value:f.value+terrain.burst,vof:f.value,smoke:0,burst:terrain.burst,blast:true,label:f.agency?`Incoming ${f.agency.includes('mortar')?'mortar':'artillery'} ${f.ammo??'HE'}`:f.value===-3?'Incoming mortar fire':'Incoming artillery'})),
    ...effects.map(m=>({kind:m.type,source_id:m.source??null,origin:m.origin??s.units[m.source]?.location??m.location,value:m.value+(m.type==='SNIPER'?smoke:0),vof:m.value,smoke:m.type==='SNIPER'?smoke:0,burst:0,blast:m.type==='GRENADE',...(m.label?{label:m.label}:{}),...(m.weapon?{label:m.weapon==='WP'?'WP grenade effect':'On-map mortar grenade effect'}:{})}))];
  if(miss&&!fire.length&&!indirect.length&&!grenades.length) candidates.push({value:0+smoke,blast:false});
  const stack=cover ? occupants(s,u.location).filter(t=>t.cover===cover.id).reduce((n,t)=>n+t.steps.length,0) : 0;
  for(const c of candidates){c.overcrowding=c.blast?-Math.max(0,stack-3):0;c.value+=c.overcrowding;}
  candidates.sort((a,b)=>a.value-b.value||String(a.source_id??a.kind).localeCompare(String(b.source_id??b.kind)));
  const strongest=candidates[0];
  const critical=targeted.some(m=>m.critical);
  const borderFire=[...fire,...grenades.filter(m=>m.type!=='MINES').map(m=>({origin:m.origin??s.units[m.source]?.location??m.location}))];
  const terrainValue=terrain.open_protection !== undefined && borderFire.every(f=> {
    const source=s.locations[f.origin];return f.indirect||f.origin===u.location||white(terrain,source.row-terrain.row,source.col-terrain.col);
  }) ? terrain.open_protection : terrain.protection;
  const parts={ fire:strongest.vof??0,smoke:strongest.smoke??smoke,burst:strongest.burst??0,terrain:terrainValue,cover:critical?0:cover?.value??0,
    pinned:u.pinned?1:0,exposed:u.exposed?-2:0,crossfire:cross,concentrated:-targeted.filter(m=>m.type==='CONCENTRATE').reduce((n,m)=>n+(m.value??1),0),
    grenade_miss:miss?-1:0,overcrowding:strongest.overcrowding };
  const total=Object.values(parts).reduce((a,b)=>a+b,0);
  const labels={fire:'Selected fire VOF',smoke:'Applicable smoke protection',burst:'Applicable terrain burst',terrain:terrain.name,cover:cover?.type??'Occupied cover',pinned:'Pinned protection',exposed:'Exposure',crossfire:'Crossfire',concentrated:'Concentrated fire',grenade_miss:'Grenade miss',overcrowding:'Crowded cover'};
  const modifiers=Object.entries(parts).map(([source,value])=>({source:source.toUpperCase(),label:labels[source],value}));
  return {ncm:Math.max(-4,Math.min(6,total)),total,parts,modifiers,sources:candidates,strongest};
}
export const combatModifier=combatExposure;
export function movementReason(s,u,target) {
  const to=s.locations[target],from=s.locations[u.location];
  if(u.mobile===false&&u.cohesion==='GOOD')return 'This gun cannot move on its good-order side.';
  if(!u.pinned&&u.cohesion!=='P'){const load=transportReason(s,u)??ammoLoadReason(s,u);if(load)return load;}
  if(to?.outside_boundary&&friendly(u))return 'Outside the mission boundaries: only enemy placement may expand the battlefield.';
  if(!to || distance(from,to)!==1) return 'Choose an adjacent terrain card.';
  if(u.mine_hit)return 'Mines prevent further movement this turn.';
  if(s.hq_events?.some(e=>e.side==='friendly'&&e.code==='HOLD'&&e.turn===s.turn&&to.row>e.lead)&&friendly(u))return 'Higher HQ ordered the company to hold its current leading row this turn.';
  if(u.exposed) return 'Already exposed: cannot move to another card until cleanup.';
  if((u.pinned||['P','L','F'].includes(u.cohesion)) && !to.staging &&
    (hasFire(s,target)||friendly(u)&&!occupants(s,target).some(v=>v.faction===u.faction))) return 'This unit can only withdraw to staging or a friendly occupied card free of fire.';
  const steps=occupants(s,target).filter(v=>v.faction===u.faction).reduce((n,v)=>n+v.steps.length,0);
  if(!to.staging && steps+u.steps.length>16) return 'The destination would exceed the 16-step stacking limit.';
  if(Math.abs(from.row-to.row)===1 && Math.abs(from.col-to.col)===1) {
    const a=`r${from.row}c${to.col}`,b=`r${to.row}c${from.col}`;
    if(s.fire.some(f=>(f.origin===a&&f.target===b)||(f.origin===b&&f.target===a))) return 'A direction of fire crosses this diagonal route.';
  }
  return null;
}
