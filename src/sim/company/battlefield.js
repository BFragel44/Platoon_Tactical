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
  if (from === to) return true;
  if (a.staging || b.staging) return a.staging && b.staging;
  const dr = b.row-a.row, dc = b.col-a.col, d = distance(a,b);
  if (d > max || (dr && dc && Math.abs(dr) !== Math.abs(dc)) || screen(s,from)) return false;
  for (let i=1; i<d; i++) {
    const mid = s.locations[`r${a.row+Math.sign(dr)*i}c${a.col+Math.sign(dc)*i}`];
    if (!mid || screen(s,mid.id)) return false;
    if (mid.elevation >= Math.max(a.elevation,b.elevation) && !white(mid,dr,dc)) return false;
  }
  return true;
}
export function communication(s,issuer,u,rally=false) {
  if (!live(issuer) || !live(u)) return null;
  if (issuer.id === u.id) return 'Self';
  if (issuer.location === u.location && issuer.cover === u.cover && (rally || (!issuer.pinned && !u.pinned))) return 'Visual / verbal';
  if (issuer.cohesion !== 'GOOD' || u.cohesion !== 'GOOD') return null;
  const net = issuer.radios.find(r => u.radios.includes(r));
  if (!net) return null;
  if (net !== 'CO') return `${net} radio`;
  if (!issuer.cover && !u.cover && los(s,issuer.location,u.location)) return 'CO radio · LOS';
  return null;
}
export function chain(issuer,u,type) {
  if (issuer.id === u.id || ['SHIFT_FIRE','CEASE_FIRE'].includes(type)) return true;
  if (issuer.id === 'co' || issuer.kind === 'STAFF') return u.id !== 'co';
  return issuer.kind === 'HQ' && (issuer.platoon === u.platoon || u.kind === 'LAT');
}
export function basicValue(u,range=1) {
  if (!live(u) || ['P','L'].includes(u.cohesion)) return null;
  if (u.cohesion === 'F' || u.cohesion === 'A') return u.pinned ? 2 : 0;
  if (u.vof === 'G') return null;
  if (u.pinned) return 2;
  return ({S:0,A:-1,H:-3,'A/S':range===0 ? -1 : 0})[u.vof] ?? null;
}
export function canFire(s,u,id) {
  if (basicValue(u) === null || !los(s,u.location,id,u.range)) return false;
  if (u.cohesion==='GOOD' && u.kind === 'MORTAR' && (u.exposed || s.locations[u.location].terrain === 'woods')) return false;
  const cover = coverOf(s,u);
  if (cover?.type === 'Bunker') {
    const a=s.locations[u.location], b=s.locations[id];
    if (a.id === b.id || Math.sign(b.row-a.row) !== cover.arc[0] || Math.sign(b.col-a.col) !== cover.arc[1]) return false;
  }
  // Small-arms and bipod guns cannot fire through occupied intermediate cards.
  if (u.vof !== 'H') {
    const a=s.locations[u.location],b=s.locations[id],d=distance(a,b);
    for(let i=1;i<d;i++) if(occupants(s,`r${a.row+Math.sign(b.row-a.row)*i}c${a.col+Math.sign(b.col-a.col)*i}`).length) return false;
  }
  return true;
}
export function refresh(s) {
  const old = new Set(s.fire.map(f => `${f.source}:${f.target}:${f.value}`));
  for (const u of values(s.units).filter(live)) {
    if (occupants(s,u.location).some(t=>t.faction!==u.faction&&(!friendly(u)||s.knowledge.spotted[t.id]))&&canFire(s,u,u.location))u.fire=u.location;
    if (u.fire && !canFire(s,u,u.fire)) u.fire = null;
    if (!u.fire && basicValue(u) !== null) {
      const targets = values(s.units).filter(t => live(t) && t.faction !== u.faction &&
        (!friendly(u) || s.knowledge.spotted[t.id]) && canFire(s,u,t.location) &&
        (!friendly(u) || !occupants(s,t.location).some(v=>friendly(v)) || t.location === u.location));
      targets.sort((a,b) => friendly(u)
        ? distance(s.locations[u.location],s.locations[a.location])-distance(s.locations[u.location],s.locations[b.location]) || (basicValue(a)??9)-(basicValue(b)??9) || a.id.localeCompare(b.id)
        : occupants(s,b.location).filter(friendly).reduce((n,v)=>n+v.steps.length,0)-occupants(s,a.location).filter(friendly).reduce((n,v)=>n+v.steps.length,0) || a.id.localeCompare(b.id));
      if (targets.length) u.fire=targets[0].location;
    }
  }
  s.fire = values(s.units).filter(u=>live(u)&&u.fire&&canFire(s,u,u.fire)).map(u => ({
    source:u.id, origin:u.location, target:u.fire, value:basicValue(u,distance(s.locations[u.location],s.locations[u.fire])), indirect:false,
  }));
  for (const u of values(s.units).filter(u=>live(u)&&u.indirect&&!u.exposed&&u.steps.length>=2&&u.cohesion==='GOOD'&&!u.pinned&&s.locations[u.location].terrain!=='woods')) {
    s.fire = s.fire.filter(f=>f.source!==u.id);
    s.fire.push({source:u.id,origin:u.location,target:u.indirect,value:-3,indirect:true});
  }
  for (const f of s.fire) {
    const u=s.units[f.source], affectsFriendly=occupants(s,f.target).some(friendly);
    if (!friendly(u) && affectsFriendly) s.knowledge.suspected[f.origin]=true;
    if (!old.has(`${f.source}:${f.target}:${f.value}`)) emit(s,'FIRE_ESTABLISHED',
      `${visible(s,u) ? u.name : 'Unidentified fire'} ${f.value===2 ? 'fires weakly' : 'opens fire'} from ${s.locations[f.origin].name} toward ${s.locations[f.target].name}.`,
      {actor:visible(s,u)?u.id:null,origin:f.origin,target:f.target,value:f.value},!visible(s,u)&&!affectsFriendly);
  }
  for(const u of values(s.units).filter(u=>!friendly(u)&&s.knowledge.spotted[u.id])) s.knowledge.spotted[u.id]=observeRecord(u);
  const under = values(s.locations).filter(l=>occupants(s,l.id).length && hasFire(s,l.id));
  s.activity = under.length >= 2 ? (under.some(l=>new Set(occupants(s,l.id).map(u=>u.faction)).size>1) ? 'HEAVILY_ENGAGED' : 'ENGAGED')
    : under.length || Object.keys(s.knowledge.spotted).some(id=>live(s.units[id])) ? 'CONTACT' : 'NO_CONTACT';
}
export const observeRecord = u => ({id:u.id,name:u.name,kind:u.kind,location:u.location,cohesion:u.cohesion,pinned:u.pinned,steps:u.steps.length,cover:u.cover,removed:u.removed});
export function spot(s,u) {
  if (s.knowledge.spotted[u.id]) return;
  s.knowledge.spotted[u.id]=observeRecord(u);
  const cover=coverOf(s,u);if(cover)cover.known=true;
  emit(s,'ENEMY_SPOTTED',`${u.name} spotted at ${s.locations[u.location].name}.`,{actor:u.id,location:u.location});
}
export function hasFire(s,id) { return s.fire.some(f=>f.target===id) || s.support.some(f=>f.status==='ACTIVE'&&f.location===id) || s.markers.some(m=>m.location===id&&m.type==='GRENADE_MISS'); }
export function incoming(s,u) { return s.fire.filter(f=>f.target===u.location && (f.origin !== u.location || s.units[f.source].faction !== u.faction)); }
export function combatModifier(s,u) {
  const terrain=s.locations[u.location], cover=coverOf(s,u), fire=incoming(s,u);
  const indirect=s.support.filter(f=>f.status==='ACTIVE'&&f.location===u.location);
  const targeted=s.markers.filter(m => m.location===u.location && (m.target===u.id || (u.cover && m.cover===u.cover)));
  const grenades=targeted.filter(m=>m.type==='GRENADE');
  const miss=s.markers.some(m=>m.location===u.location&&m.type==='GRENADE_MISS');
  if(!fire.length&&!indirect.length&&!grenades.length&&!miss) return null;
  const cross=new Set(fire.filter(f=>f.origin!==u.location).map(f=>f.origin)).size>=2 ? -1 : 0;
  const smoke=terrain.smoke ? 2 : 0;
  const grenadeValue=grenades.length ? grenades.reduce((n,m)=>n+m.value,0) : Infinity;
  const candidates=[...fire.map(f=>({value:f.value+smoke+(f.indirect?terrain.burst:0),blast:f.indirect})),
    ...indirect.map(f=>({value:f.value+terrain.burst,blast:true})),{value:grenadeValue,blast:true}];
  if(miss&&!fire.length&&!indirect.length&&!grenades.length) candidates.push({value:0+smoke,blast:false});
  candidates.sort((a,b)=>a.value-b.value);
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
  return {ncm:Math.max(-4,Math.min(6,total)),total,parts};
}
export function movementReason(s,u,target) {
  const to=s.locations[target],from=s.locations[u.location];
  if(!to || distance(from,to)!==1) return 'Choose an adjacent terrain card.';
  if(u.exposed) return 'Already exposed: cannot move to another card until cleanup.';
  if((u.pinned||['P','L','F'].includes(u.cohesion)) && !to.staging &&
    (hasFire(s,target)||!occupants(s,target).some(v=>v.faction===u.faction))) return 'This unit can only withdraw to staging or a friendly occupied card free of fire.';
  const steps=occupants(s,target).reduce((n,v)=>n+v.steps.length,0);
  if(!to.staging && steps+u.steps.length>16) return 'The destination would exceed the 16-step stacking limit.';
  if(Math.abs(from.row-to.row)===1 && Math.abs(from.col-to.col)===1) {
    const a=`r${from.row}c${to.col}`,b=`r${to.row}c${from.col}`;
    if(s.fire.some(f=>(f.origin===a&&f.target===b)||(f.origin===b&&f.target===a))) return 'A direction of fire crosses this diagonal route.';
  }
  return null;
}
