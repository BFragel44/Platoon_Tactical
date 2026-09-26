import {expandContactRay} from './missionExpansion.js';
import {values,live,friendly,emit,draw,pick,randomNumber} from './core.js';
import {occupants,los,distance,refresh,spot,basicFireTargets,overheadAllowed,unitLos} from './battlefield.js';
import {checkMines,discoveredCover} from './missionFeatures.js';

export function contactQueue(s,contacts){
 const ordered=[];
 for(const type of ['A','B','C','?']){
  const group=contacts.filter(c=>c.type===type);
  while(group.length){const pc=pick(s,group,'Potential contact evaluation order');ordered.push(pc.id);group.splice(group.indexOf(pc),1);}
 }
 return ordered;
}
export function availableCounters(s,kind){return s.mission_contacts.counters.filter(c=>c.kind===kind&&!values(s.units).some(u=>live(u)&&u.counter_id===c.id));}
function along(s,from,to,id){
 const a=s.locations[from],b=s.locations[to],l=s.locations[id];
 const n=distance(a,l),d=distance(a,b);
 return n>0&&n<=d&&l.row===a.row+Math.sign(b.row-a.row)*n&&l.col===a.col+Math.sign(b.col-a.col)*n;
}
function placementProbe(s,profile,location,target,coverType=null,actualCover=undefined){
 const u={...profile,id:'placement_probe',location,faction:'enemy',cohesion:'GOOD',mission_weapon:true,cover:null,steps:Array(profile.steps).fill({}),pinned:false,exposed:false};
 const l=s.locations[location],b=s.locations[target];
 let cover=actualCover;
 if(cover===undefined){
  if(l.building&&(l.multi_story||l.tower)&&['SNIPER','SPOTTER'].includes(profile.kind)&&coverType)
   cover={id:'placement_upper',type:l.tower?'Church Tower':'Upper Story',elevation:1,value:3};
  else if(['Bunker','Pillbox'].includes(coverType))cover={id:'placement_fort',type:coverType,arc:[Math.sign(b.row-l.row),Math.sign(b.col-l.col)]};
 }
 if(cover){u.cover=cover.id;s={...s,locations:{...s.locations,[location]:{...l,covers:[...l.covers.filter(c=>c.id!==cover.id),cover]}}};}
 return {state:s,unit:u,cover};
}
function canPlaceFire(s,profile,location,target,coverType=null,actualCover=undefined){
 const probe=placementProbe(s,profile,location,target,coverType,actualCover),u=probe.unit;s=probe.state;
 if(occupants(s,location).some(friendly)&&!['Bunker','Pillbox'].includes(probe.cover?.type))return false;
 const blockers=values(s.units).filter(t=>live(t)&&t.location!==target&&along(s,location,target,t.location));
 if(blockers.some(t=>!friendly(t)&&!overheadAllowed(s,u,target,t.location)))return false;
 if(blockers.some(t=>friendly(t)&&!overheadAllowed(s,u,target,t.location)&&!profile.tripod))return false;
 return basicFireTargets(s,u,target).includes(target);
}
function placementLos(s,profile,location,target,range,observed,coverType,actualCover){
 if(observed)return occupants(s,target).filter(friendly).some(u=>unitLos(s,u,location,range));
 const probe=placementProbe(s,profile,location,target,coverType,actualCover);
 return occupants(s,target).filter(friendly).some(t=>unitLos(probe.state,probe.unit,t,range));
}
export function contactPlacements(s,pc,profile,used=[],range=profile.range,noFire=false,observed=false,coverType=null,actualCovers=null){
 const origin=s.locations[pc.location];
 return values(s.locations).filter(l=>!l.staging&&l.row>origin.row&&!used.includes(l.id)&&
  !used.some(id=>along(s,id,pc.location,l.id)||along(s,l.id,pc.location,id))&&
  placementLos(s,profile,l.id,pc.location,range,observed,coverType,actualCovers?.get(l.id))&&
  !occupants(s,l.id).some(u=>!friendly(u))&&
  !s.fire.some(f=>!friendly(s.units[f.source])&&(f.target===l.id||along(s,f.origin,f.target,l.id)))&&
  !s.support.some(f=>f.status==='ACTIVE'&&f.location===l.id&&s.units[f.source]&&!friendly(s.units[f.source]))&&
  (noFire||canPlaceFire(s,profile,l.id,pc.location,coverType,actualCovers?.get(l.id))));
}
// Pure feasibility search: checking exhaustion must not spend cards or create enemies.
export function packageAvailable(s,pc,p,allocated=[]){
 if(p.mines)return !s.locations[pc.location].mines;
 if(allocated.length===p.units.length)return true;
 const spec=p.units[allocated.length],noFire=!!p.no_fire||spec.kind==='SPOTTER';
 for(const profile of availableCounters(s,spec.kind).filter(c=>!allocated.some(a=>a.profile===c.id))){
  for(const dc of [-1,0,1]){
   const probe=structuredClone(s);expandContactRay(probe,probe.locations[pc.location],dc,noFire?3:profile.range);
   const locations=contactPlacements(probe,pc,profile,allocated.map(a=>a.location),noFire?3:profile.range,noFire,!!p.no_fire,spec.cover);
   const ray=locations.filter(l=>Math.sign(l.col-s.locations[pc.location].col)===dc);
   const far=Math.max(...ray.map(l=>distance(l,s.locations[pc.location])));
   for(const l of ray.filter(l=>distance(l,s.locations[pc.location])===far))
    if(packageAvailable(probe,pc,p,[...allocated,{profile:profile.id,location:l.id}]))return true;
  }
 }
 return false;
}
function placePackage(s,pc,p){
 if(p.mines){if(s.locations[pc.location].mines)return false;s.locations[pc.location].mines=true;emit(s,'MINEFIELD_FOUND',`Mines discovered at ${s.locations[pc.location].name}.`,{location:pc.location});for(const u of occupants(s,pc.location))checkMines(s,u);return true;}
 const used=[];
 for(const spec of p.units){
  const pool=availableCounters(s,spec.kind);if(!pool.length)return false;
  const profile=pick(s,pool,'Enemy counter selection',true),noFire=!!p.no_fire||spec.kind==='SPOTTER',range=noFire?3:profile.range;
  const origin=s.locations[pc.location],directions=origin.col===1?[-1,0,0,1,1]:origin.col===4?[-1,-1,0,0,1]:[-1,0,1];
  const rejected=new Set(),actualCovers=new Map();let location,cover;
  const candidates=state=>contactPlacements(state,pc,profile,used,range,noFire,!!p.no_fire,spec.cover,actualCovers).filter(l=>!rejected.has(l.id));
  while(!location){
   if(![-1,0,1].some(direction=>{const probe=structuredClone(s);expandContactRay(probe,origin,direction,range);return candidates(probe).some(l=>Math.sign(l.col-origin.col)===direction);}))return false;
   const dc=pick(s,directions,'Enemy contact direction',true);expandContactRay(s,origin,dc,range);
   let ray=candidates(s).filter(l=>Math.sign(l.col-origin.col)===dc);
   if(!ray.length){emit(s,'CONTACT_DIRECTION_REJECTED','Invalid contact direction; redraw direction.',{direction:dc},true);continue;}
   while(ray.length&&!location){
    const far=Math.max(...ray.map(l=>distance(l,origin))),l=pick(s,ray.filter(l=>distance(l,origin)===far),'Enemy contact position',true);
    const before=new Set(l.covers.map(c=>c.id));cover=null;
    if(spec.cover){
     const value={Cover:1,Foxholes:1,Trench:2,Bunker:3,Pillbox:4}[spec.cover];
     if(l.building){const building=discoveredCover(s,l,false,true);if(building.value>=value)cover=building;else l.covers=l.covers.filter(c=>c.id!==building.id&&c.parent!==building.id);}
     if(!cover){cover={id:`fort_${s.next_id++}`,type:spec.cover,value,known:false,enemy_original:true,capacity:spec.cover==='Pillbox'?2:spec.cover==='Bunker'?3:null};l.covers.push(cover);}
     if(['Bunker','Pillbox'].includes(cover.type))cover.arc=[Math.sign(origin.row-l.row),Math.sign(origin.col-l.col)];
     if(['SPOTTER','SNIPER'].includes(profile.kind))cover=l.covers.find(c=>c.parent===cover.id)??cover;
    }
    actualCovers.set(l.id,cover);
    if(placementLos(s,profile,l.id,pc.location,range,!!p.no_fire,spec.cover,cover)&&(noFire||canPlaceFire(s,profile,l.id,pc.location,spec.cover,cover)))location=l;
    else{
     l.covers=l.covers.filter(c=>before.has(c.id));rejected.add(l.id);
     emit(s,'CONTACT_POSITION_REJECTED','Actual cover cannot support this firing position; check the next eligible position.',{location:l.id},true);
     ray=candidates(s).filter(l=>Math.sign(l.col-origin.col)===dc);
    }
   }
  }
  const l=location;used.push(l.id);
  const id=`enemy_${s.next_id++}`,u={...structuredClone(profile),id,counter_id:profile.id,max_steps:profile.steps,platoon:null,faction:'enemy',location:l.id,cohesion:'GOOD',experience:'Line',original_experience:'Line',
   steps:Array.from({length:profile.steps},(_,i)=>({id:`${id}_step${i+1}`,personnel:[]})),named:profile.kind!=='SQUAD',pinned:false,exposed:!!p.exposed,cover:cover?.id??null,
   fire:p.no_fire||profile.kind==='SPOTTER'?null:pc.location,hold_fire_until_cleanup:!!p.no_fire,indirect:null,radios:[],assets:{},used:[],saved:0,removed:null,mission_weapon:true,placed_turn:s.turn};
  s.units[id]=u;
  if(p.spotted)spot(s,u);
  if(!p.no_fire&&profile.kind!=='SPOTTER'){s.knowledge.suspected[l.id]=true;emit(s,'CONTACT_FIRE',`Fire from ${l.name}; ${p.spotted?'enemy identified':'source not yet spotted'}.`,{location:l.id,target:pc.location});}
  if(p.incoming){s.support.push({id:`support_${s.next_id++}`,source:id,agency:'enemy_mortar',ammo:'HE',location:pc.location,status:'ACTIVE',value:p.incoming});s.registered_targets.enemy_mortar=pc.location;emit(s,'INCOMING_FIRE',`Incoming mortar fire at ${s.locations[pc.location].name}.`,{location:pc.location,value:p.incoming});}
 }
 refresh(s);return true;
}
export function resolveMissionContact(s,pc){
 const count=s.mission_contacts.draws[s.activity]?.[pc.type];
 if(count===undefined)throw new Error(`Missing ${s.activity}/${pc.type} contact table.`);
 const contact=count===0||draw(s,count,`Evaluate contact ${pc.type} at ${s.locations[pc.location].name}`).some(c=>c.word==='Contact');
 pc.resolved=true;
 emit(s,'CONTACT_EVALUATED',`${s.locations[pc.location].name}: ${contact?'enemy activity detected':'no contact'}.`,{location:pc.location,contact});
 if(!contact)return;
 // Placement is atomic: an unavailable multi-card package creates no partial force.
 const table=s.mission_contacts.tables[pc.type];
 if(![...new Set(table)].some(number=>packageAvailable(s,pc,s.mission_contacts.packages[number]))){
  emit(s,'CONTACT_EXHAUSTED','Contact evaluation complete; no legal enemy package can be placed.',{location:pc.location});return;
 }
 for(;;){
  const number=table[randomNumber(s,table.length,'Enemy package selection',true)-1],trial=structuredClone(s);
  if(!packageAvailable(s,pc,trial.mission_contacts.packages[number])){emit(s,'PACKAGE_REJECTED','Enemy package could not be placed; redraw.',{package:number},true);continue;}
  const placed=placePackage(trial,pc,trial.mission_contacts.packages[number]);
  if(placed){Object.assign(s,trial);return;}
  s.rng=trial.rng;s.deck=trial.deck;s.terrain_deck=trial.terrain_deck;
  for(const [id,l]of Object.entries(trial.locations))if(!s.locations[id])s.locations[id]={...l,covers:[]};
  // Retain private draw history even when the full package cannot be placed.
  for(const e of trial.events.slice(s.events.length).filter(e=>['CARDS_DRAWN','DECK_SHUFFLED','CONTACT_DIRECTION_REJECTED','CONTACT_POSITION_REJECTED','MAP_EXPANDED'].includes(e.type))){
   const {id,sequence,...record}=e;s.events.push({...record,id:`event_${s.events.length+1}`,sequence:s.events.length+1});
  }
  emit(s,'PACKAGE_REJECTED','Enemy package could not be placed; redraw.',{package:number},true);
 }
}
