import { values, live, good, friendly, visible, emit } from './core.js';
export const distance = (a,b) => Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col));
export const occupants = (s,id) => values(s.units).filter(u => live(u) && u.location === id);
export const adjacent = (s,id) => values(s.locations).filter(l => l.id !== id && distance(l,s.locations[id]) === 1);
export const coverOf = (s,u) => s.locations[u.location].covers.find(c => c.id === u.cover);
const screen = (s,id) => s.locations[id].smoke || s.support.some(f => f.status === 'ACTIVE' && f.location === id);
function white(l,dr,dc) {
  return l.borders === 'all' || (l.borders === 'EW' && dr === 0) || (l.borders === 'NS' && dc === 0);
}
export function los(s, from, to, max = 3) {
  const a = s.locations[from], b = s.locations[to];
  if (!a || !b) return false;
  if (a.staging || b.staging) return false;
  if (from === to) return true;
  const dr = b.row-a.row, dc = b.col-a.col, d = distance(a,b);
  if (d > max || (dr && dc && Math.abs(dr) !== Math.abs(dc)) || screen(s,from)) return false;
  for (let i=1; i<d; i++) {
    const mid = s.locations[`r${a.row+Math.sign(dr)*i}c${a.col+Math.sign(dc)*i}`];
    if (!mid || screen(s,mid.id)) return false;
    if (mid.elevation >= Math.max(a.elevation,b.elevation) && !white(mid,dr,dc)) return false;
  }
  return true;
}
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
  if (issuer.location === u.location && issuer.cover === u.cover && (rally || (!issuer.pinned && !u.pinned))) return 'Visual / verbal';
  if (issuer.cohesion !== 'GOOD' || u.cohesion !== 'GOOD') return null;
  // Fire-direction networks connect observers to off-map agencies, not command HQs.
  if (!issuer.radios.includes('CO') || !u.radios.includes('CO')) return null;
  const hub=s.units.co;
  const linked=v=>live(v)&&v.cohesion==='GOOD'&&v.radios.includes('CO')&&!v.cover&&
    live(hub)&&hub.cohesion==='GOOD'&&hub.radios.includes('CO')&&!hub.cover&&communicationLos(s,v.location,hub.location);
  return linked(issuer)&&linked(u) ? 'CO radio via Company HQ · LOS' : null;
}
export function communicationReason(s,issuer,u,rally=false) {
  if(!issuer)return 'No issuing HQ selected.';
  const channel=communication(s,issuer,u,rally);
  if(channel)return channel;
  return `${issuer.name} at ${s.locations[issuer.location].name}${issuer.cover?' under cover':''} cannot reach ${u.name} at ${s.locations[u.location].name}${u.cover?' under cover':''}. Same-area voice needs matching cover and unpinned units (rally excepted); CO radios need an uncovered, working Company HQ link. Observer radios only reach fire-support agencies.`;
}
export const vofOf = u => ['F','A'].includes(u.cohesion) ? 'S' : u.vof;
export const rangeOf = u => u.cohesion==='A'?0:u.cohesion==='F'?1:u.range;
export function chain(issuer,u,type) {
  if (issuer.id === u.id || ['SHIFT_FIRE','CEASE_FIRE'].includes(type)) return true;
  if (issuer.id === 'co' || issuer.kind === 'STAFF') return u.id !== 'co';
  return issuer.kind === 'HQ' && (issuer.platoon === u.platoon || u.kind === 'LAT');
}
export function basicValue(u,range=1) {
  if (!live(u) || ['P','L'].includes(u.cohesion)) return null;
  if (u.cohesion === 'F' || u.cohesion === 'A') return u.pinned ? 2 : 0;
  if (!u.vof || u.vof === 'G') return null;
  if (u.pinned) return 2;
  return ({S:0,A:-1,H:-3,'A/S':range===0 ? -1 : 0})[u.vof] ?? null;
}
export function canFire(s,u,id) {
  if (basicValue(u) === null || !los(s,u.location,id,rangeOf(u))) return false;
  if (u.cohesion==='GOOD' && u.kind === 'MORTAR' && (u.exposed || u.location===id || ['Building','Bunker','Cave','Pillbox'].includes(coverOf(s,u)?.type) || s.locations[u.location].terrain === 'woods')) return false;
  const cover = coverOf(s,u);
  if (cover?.type === 'Bunker') {
    const a=s.locations[u.location], b=s.locations[id];
    if (a.id === b.id || Math.sign(b.row-a.row) !== cover.arc[0] || Math.sign(b.col-a.col) !== cover.arc[1]) return false;
  }
  return true;
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
    if(occupants(s,id).some(t=>(t.faction===u.faction||!friendly(u)||s.knowledge.spotted[t.id])&&!(u.kind==='MORTAR'&&u.cohesion==='GOOD'&&t.faction===u.faction)))return id;
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
export function refresh(s) {
  const old = new Set(s.fire.map(f => `${f.source}:${f.target}:${f.value}`));
  // A spotted unit sharing a card reveals all opposing occupants (8.5).
  for(const u of values(s.units).filter(u=>live(u)&&!friendly(u)&&s.knowledge.spotted[u.id]))spot(s,u);
  const established=new Map();
  for(const u of values(s.units).filter(live)) {
    rememberDirection(s,u);
    if(u.fire)u.fire=fireDestination(s,u,u.fire,true);
    u.fire_effect=u.fire;
    if(u.fire&&!canFire(s,u,u.fire))u.fire=null;
    if(u.fire)established.set(`${u.faction}:${u.location}`,u.fire);
  }
  for (const u of values(s.units).filter(live)) {
    if (occupants(s,u.location).some(t=>t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]))&&canFire(s,u,u.location))u.fire=u.location;
    const key=`${u.faction}:${u.location}`,joined=established.get(key);
    if(!u.fire&&joined&&canFire(s,u,joined))u.fire=joined;
    if (!u.fire && !u.indirect && basicValue(u) !== null) {
      const targets = values(s.units).filter(t => live(t) && t.faction !== u.faction &&
        (!friendly(u) || s.knowledge.spotted[t.id]) && canFire(s,u,t.location) && fireDestination(s,u,t.location)===t.location &&
        (!friendly(u) || !occupants(s,t.location).some(v=>friendly(v)) || t.location === u.location));
      targets.sort((a,b) => friendly(u)
        ? distance(s.locations[u.location],s.locations[a.location])-distance(s.locations[u.location],s.locations[b.location]) || (basicValue(a)??9)-(basicValue(b)??9) || a.id.localeCompare(b.id)
        : occupants(s,b.location).filter(friendly).reduce((n,v)=>n+v.steps.length,0)-occupants(s,a.location).filter(friendly).reduce((n,v)=>n+v.steps.length,0) || a.id.localeCompare(b.id));
      if (targets.length)u.fire=fireDestination(s,u,targets[0].location);
    }
    rememberDirection(s,u);u.fire_effect=u.fire;
    if(u.fire)established.set(key,u.fire);
  }
  s.fire = values(s.units).filter(u=>live(u)&&u.fire&&canFire(s,u,u.fire)).map(u => ({
    source:u.id, origin:u.location, target:u.fire, value:basicValue(u,distance(s.locations[u.location],s.locations[u.fire])), indirect:false,
    direction:structuredClone(u.fire_direction),
    reason:screen(s,u.location)?'BLOCKED_AT_SOURCE':screen(s,u.fire)?'BLOCKED_BY_SMOKE':u.fire_direction?.anchor!==u.fire?'INTERCEPTED_OR_FOLLOWING':occupants(s,u.fire).some(t=>t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]))?'ENGAGED':'CONTINUING_AT_CLEARED_POSITION',
  }));
  for (const u of values(s.units).filter(u=>live(u)&&u.indirect&&!u.exposed&&u.steps.length>=2&&u.cohesion==='GOOD'&&!u.pinned&&u.indirect!==u.location&&!['Building','Bunker','Cave','Pillbox'].includes(coverOf(s,u)?.type)&&s.locations[u.location].terrain!=='woods')) {
    s.fire = s.fire.filter(f=>f.source!==u.id);
    s.fire.push({source:u.id,origin:u.location,target:u.indirect,value:-3,indirect:true});
  }
  s.markers=s.markers.filter(m=>m.type!=='CONCENTRATE'||(live(s.units[m.source])&&s.units[m.source].fire===m.location&&canFire(s,s.units[m.source],m.location)));
  for (const f of s.fire) {
    const u=s.units[f.source], affectsFriendly=occupants(s,f.target).some(friendly);
    if (!friendly(u) && affectsFriendly) s.knowledge.suspected[f.origin]=true;
    if (!old.has(`${f.source}:${f.target}:${f.value}`)) emit(s,'FIRE_ESTABLISHED',
      `${visible(s,u) ? u.name : 'Unidentified fire'} ${f.value===2 ? 'fires weakly' : 'opens fire'} from ${s.locations[f.origin].name} toward ${s.locations[f.target].name}.`,
      {actor:visible(s,u)?u.id:null,origin:f.origin,target:f.target,value:f.value,reason:f.reason},!visible(s,u)&&!affectsFriendly);
  }
  for(const u of values(s.units).filter(u=>!friendly(u)&&s.knowledge.spotted[u.id])) s.knowledge.spotted[u.id]=observeRecord(u);
  const under = values(s.locations).filter(l=>occupants(s,l.id).length && hasFire(s,l.id));
  s.activity = under.length >= 2 ? (under.some(l=>new Set(occupants(s,l.id).map(u=>u.faction)).size>1) ? 'HEAVILY_ENGAGED' : 'ENGAGED')
    : under.length || Object.keys(s.knowledge.spotted).some(id=>live(s.units[id])) ? 'CONTACT' : 'NO_CONTACT';
}
export const observeRecord = u => ({id:u.id,name:u.name,kind:u.kind,location:u.location,cohesion:u.cohesion,pinned:u.pinned,exposed:u.exposed,steps:u.steps.length,cover:u.cover,removed:u.removed});
export function spot(s,u) {
  for(const t of occupants(s,u.location).filter(t=>t.faction===u.faction)) {
    if(s.knowledge.spotted[t.id])continue;
    s.knowledge.spotted[t.id]=observeRecord(t);
    const cover=coverOf(s,t);if(cover)cover.known=true;
    emit(s,'ENEMY_SPOTTED',`${t.name} spotted at ${s.locations[t.location].name}.`,{actor:t.id,location:t.location});
  }
}
export const spottingLocations = s => Object.keys(s.knowledge.suspected).filter(id=>occupants(s,id).some(u=>!friendly(u)&&!s.knowledge.spotted[u.id]));
export function hasFire(s,id) { return s.fire.some(f=>f.target===id) || s.support.some(f=>f.status==='ACTIVE'&&f.location===id) || s.markers.some(m=>m.location===id&&['GRENADE','GRENADE_MISS'].includes(m.type)); }
export function incoming(s,u) { return s.fire.filter(f=>f.target===u.location && (f.origin !== u.location || s.units[f.source].faction !== u.faction)); }
export function combatExposure(s,u) {
  const terrain=s.locations[u.location], cover=coverOf(s,u), fire=incoming(s,u);
  const indirect=s.support.filter(f=>f.status==='ACTIVE'&&f.location===u.location);
  const targeted=s.markers.filter(m => m.location===u.location && (m.target===u.id || (u.cover && m.cover===u.cover)));
  const grenades=targeted.filter(m=>m.type==='GRENADE');
  const miss=s.markers.some(m=>m.location===u.location&&m.type==='GRENADE_MISS');
  if(!fire.length&&!indirect.length&&!grenades.length&&!miss) return null;
  const cross=new Set(fire.filter(f=>!f.indirect&&f.origin!==u.location).map(f=>{const a=s.locations[f.origin];return `${Math.sign(a.row-terrain.row)}:${Math.sign(a.col-terrain.col)}`;})).size>=2 ? -1 : 0;
  const smoke=terrain.smoke ? 2 : 0;
  const grenadeValue=grenades.length ? grenades.reduce((n,m)=>n+m.value,0) : Infinity;
  const candidates=[...fire.map(f=>({kind:f.indirect?'ON_MAP_INDIRECT':'BASIC_FIRE',source_id:f.source,origin:f.origin,value:f.value+smoke+(f.indirect?terrain.burst:0),vof:f.value,blast:f.indirect})),
    ...indirect.map(f=>({kind:'OFF_MAP_SUPPORT',source_id:null,origin:f.location,value:f.value+terrain.burst,vof:f.value,blast:true,label:f.value===-3?'Incoming mortar fire':'Incoming artillery'})),
    ...grenades.map(m=>({kind:'GRENADE',source_id:m.source??null,origin:s.units[m.source]?.location??m.location,value:m.value,vof:m.value,blast:true}))];
  if(miss&&!fire.length&&!indirect.length&&!grenades.length) candidates.push({value:0+smoke,blast:false});
  candidates.sort((a,b)=>a.value-b.value);
  candidates.sort((a,b)=>a.value-b.value||String(a.source_id??a.kind).localeCompare(String(b.source_id??b.kind)));
  const strongest=candidates[0];
  const critical=targeted.some(m=>m.critical);
  const stack=cover ? occupants(s,u.location).filter(t=>t.cover===cover.id).reduce((n,t)=>n+t.steps.length,0) : 0;
  const terrainValue=terrain.open_protection !== undefined && fire.every(f=> {
    const source=s.locations[f.origin];return f.indirect||f.origin===u.location||white(terrain,source.row-terrain.row,source.col-terrain.col);
  }) ? terrain.open_protection : terrain.protection;
  const parts={ fire:strongest.value,terrain:terrainValue,cover:critical?0:cover?.value??0,
    pinned:u.pinned?1:0,exposed:u.exposed?-2:0,crossfire:cross,concentrated:-targeted.filter(m=>m.type==='CONCENTRATE').reduce((n,m)=>n+(m.value??1),0),
    grenade_miss:miss?-1:0,overcrowding:strongest.blast?-Math.max(0,stack-3):0 };
  const total=Object.values(parts).reduce((a,b)=>a+b,0);
  const labels={fire:'Strongest applicable fire',terrain:terrain.name,cover:cover?.type??'Occupied cover',pinned:'Pinned protection',exposed:'Exposure',crossfire:'Crossfire',concentrated:'Concentrated fire',grenade_miss:'Grenade miss',overcrowding:'Crowded cover'};
  const modifiers=Object.entries(parts).map(([source,value])=>({source:source.toUpperCase(),label:labels[source],value}));
  return {ncm:Math.max(-4,Math.min(6,total)),total,parts,modifiers,sources:candidates,strongest};
}
export const combatModifier=combatExposure;
export function movementReason(s,u,target) {
  const to=s.locations[target],from=s.locations[u.location];
  if(!to || distance(from,to)!==1) return 'Choose an adjacent terrain card.';
  if(u.exposed) return 'Already exposed: cannot move to another card until cleanup.';
  if((u.pinned||['P','L','F'].includes(u.cohesion)) && !to.staging &&
    (hasFire(s,target)||!occupants(s,target).some(v=>v.faction===u.faction))) return 'This unit can only withdraw to staging or a friendly occupied card free of fire.';
  const steps=occupants(s,target).filter(v=>v.faction===u.faction).reduce((n,v)=>n+v.steps.length,0);
  if(!to.staging && steps+u.steps.length>16) return 'The destination would exceed the 16-step stacking limit.';
  if(Math.abs(from.row-to.row)===1 && Math.abs(from.col-to.col)===1) {
    const a=`r${from.row}c${to.col}`,b=`r${to.row}c${from.col}`;
    if(s.fire.some(f=>(f.origin===a&&f.target===b)||(f.origin===b&&f.target===a))) return 'A direction of fire crosses this diagonal route.';
  }
  return null;
}
