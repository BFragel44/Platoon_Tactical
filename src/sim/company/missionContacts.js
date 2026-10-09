import {rangedWeaponTarget} from './rangedWeapons.js';
import {placeIllumination} from './visibility.js';
import {expandContactRay} from './missionExpansion.js';
import {values,live,friendly,emit,draw,pick,randomNumber,attempt} from './core.js';
import {occupants,los,distance,refresh,spot,basicFireTargets,overheadAllowed,unitLos} from './battlefield.js';
import {checkMines,discoveredCover} from './missionFeatures.js';
import {grenade} from './actions.js';

export function contactDirection(s,origin){
 if(s.mission_rules?.enemyActivity==='normandy'){
  const number=randomNumber(s,8,'Enemy contact direction',true);
  return number<=4?0:number<=6?-1:1;
 }
 const choices=origin.col===1?[-1,0,0,1,1]:origin.col===4?[-1,-1,0,0,1]:[-1,0,1];
 return pick(s,choices,'Enemy contact direction',true);
}
export function contactQueue(s,contacts){
 const ordered=[];
 for(const type of ['A','B','C','?']){
  const group=contacts.filter(c=>c.type===type);
  while(group.length){const pc=pick(s,group,'Potential contact evaluation order');ordered.push(pc.id);group.splice(group.indexOf(pc),1);}
 }
 return ordered;
}
export function availableCounters(s,kind){return s.mission_contacts.counters.filter(c=>c.kind===kind&&!values(s.units).some(u=>live(u)&&u.counter_id===c.id));}
function packageVariants(p){
 const {alternatives,optional,mine_followup,...rest}=p,core={...rest,units:p.units??[]};
 if(mine_followup)return mine_followup.branches.map(branch=>({...core,units:[...core.units,...branch.units]}));
 if(p.alternatives)return p.alternatives.map(option=>({...core,...option,units:option.units??[]}));
 if(p.optional)return [core,{...core,units:[...core.units,...p.optional.units]}];
 return [core];
}
function chosenVariant(s,p){
 if(p.mine_followup){const n=randomNumber(s,p.mine_followup.sides,'Mine package follow-up',true),branch=p.mine_followup.branches.find(b=>b.numbers.includes(n));
  if(!branch)throw new Error(`Missing mine follow-up branch ${n}.`);
  const {mine_followup,...rest}=p;return {...rest,units:[...(p.units??[]),...branch.units]};}
 if(p.alternatives)return {...p,...p.alternatives[randomNumber(s,p.alternatives.length,'Enemy package variant',true)-1]};
 if(p.optional){const include=p.optional.if_available? p.optional.units.every(spec=>availableCounters(s,spec.kind).length>0):randomNumber(s,2,'Enemy package optional force',true)===1;
  return {...p,units:[...(p.units??[]),...(include?p.optional.units:[])]};}
 return p;
}
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
  else if(['Bunker','Pillbox','Deep Bunker'].includes(coverType))cover={id:'placement_fort',type:coverType,arc:[Math.sign(b.row-l.row),Math.sign(b.col-l.col)]};
 }
 if(cover){u.cover=cover.id;s={...s,locations:{...s.locations,[location]:{...l,covers:[...l.covers.filter(c=>c.id!==cover.id),cover]}}};}
 return {state:s,unit:u,cover};
}
function canPlaceFire(s,profile,location,target,coverType=null,actualCover=undefined){
 const probe=placementProbe(s,profile,location,target,coverType,actualCover),u=probe.unit;s=probe.state;
 if(occupants(s,location).some(friendly)&&!['Bunker','Pillbox','Deep Bunker'].includes(probe.cover?.type))return false;
 const blockers=values(s.units).filter(t=>live(t)&&t.location!==target&&along(s,location,target,t.location));
 if(blockers.some(t=>!friendly(t)&&!overheadAllowed(s,u,target,t.location)))return false;
 if(blockers.some(t=>friendly(t)&&!overheadAllowed(s,u,target,t.location)&&!profile.tripod))return false;
 if(profile.kind==='MORTAR'&&profile.vof==='G')return location!==target&&s.locations[location].terrain!=='woods'&&placementLos(s,profile,location,target,profile.range,false,coverType,actualCover);
 return basicFireTargets(s,u,target).includes(target)||occupants(s,target).some(t=>rangedWeaponTarget(s,u,t));
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
 if(!allocated.length&&p.illumination&&!s.markers.some(m=>m.type==='ILLUMINATION'&&m.location===pc.location&&m.delivery===p.illumination)){s=structuredClone(s);placeIllumination(s,pc.location,p.illumination);}
 if(!allocated.length&&(p.alternatives||p.optional||p.mine_followup))return packageVariants(p).some(v=>packageAvailable(s,pc,v,allocated));
 if(p.mines&&s.locations[pc.location].mines)return false;
 if(!allocated.length&&p.placement_draw?.point_blank?.length&&p.units?.every(spec=>availableCounters(s,spec.kind).length)&&occupants(s,pc.location).some(friendly))return true;
 if(!allocated.length&&p.point_blank_chance&&p.units?.length===1&&availableCounters(s,p.units[0].kind).length&&occupants(s,pc.location).some(friendly))return true;
 if(allocated.length===(p.units?.length??0))return true;
 const spec=p.units[allocated.length],noFire=!!p.no_fire||(spec.kind==='SPOTTER'||spec.kind==='LEADER');
 if(spec.same_as_previous||spec.same_as_any){const last=allocated.at(-1);return !!last&&availableCounters(s,spec.kind).filter(profile=>!allocated.some(a=>a.profile===profile.id)).some(profile=>(noFire||canPlaceFire(s,profile,last.location,pc.location,spec.cover))&&packageAvailable(s,pc,p,[...allocated,{profile:profile.id,location:last.location}]));}
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
export function placePackage(s,pc,p){
 const mineFollowup=!!p.mine_followup;
 p=chosenVariant(s,p);
 // Reject the selected follow-up before publishing mines or creating a partial force.
 if(mineFollowup&&!packageAvailable(s,pc,p))return false;
 if(p.illumination){placeIllumination(s,pc.location,p.illumination);emit(s,'ILLUMINATION_DEPLOYED','Incoming mortar illumination at the contact card.',{location:pc.location,delivery:p.illumination});}
 if(p.placement_draw){const d=p.placement_draw;let n;do{n=randomNumber(s,d.sides,'Enemy placement branch',true);}while(![...(d.point_blank??[]),...(d.close??[]),...(d.max??[])].includes(n));p={...p,point_blank:d.point_blank?.includes(n),close_range:d.close?.includes(n)};}
 if(p.close_chance)p={...p,close_range:randomNumber(s,10,'Enemy close-range placement',true)<=2};
 if(p.point_blank_chance)p={...p,point_blank:randomNumber(s,10,'Enemy point-blank placement',true)<=2};
 if(p.mines){if(s.locations[pc.location].mines)return false;s.locations[pc.location].mines=true;emit(s,'MINEFIELD_FOUND',`Mines discovered at ${s.locations[pc.location].name}.`,{location:pc.location});for(const u of occupants(s,pc.location))checkMines(s,u,{discovery:true});}
 if(p.incoming_options){const incoming=pick(s,p.incoming_options,'Enemy incoming agency',true);p={...p,incoming:incoming.value,incoming_agency:incoming.agency};}
 const used=[];
 for(const spec of p.units??[]){
  const pool=availableCounters(s,spec.kind);if(!pool.length)return false;
  const profile=pick(s,pool,'Enemy counter selection',true),noFire=!!p.no_fire||(spec.kind==='SPOTTER'||spec.kind==='LEADER'),range=p.close_range?1:noFire?3:profile.range;
  const origin=s.locations[pc.location];
  const rejected=new Set(),actualCovers=new Map();let location,cover;
  if(p.point_blank){
   location=origin;
   const type=spec.cover??'Foxholes';cover=origin.covers.find(c=>c.type===type&&c.enemy_original);
   if(!cover){cover={id:`fort_${s.next_id++}`,type,value:{Cover:1,Foxholes:1,Trench:2,Bunker:3,'Deep Bunker':3,Pillbox:4}[type],known:false,enemy_original:true,capacity:['Bunker','Deep Bunker'].includes(type)?3:type==='Pillbox'?2:null};origin.covers.push(cover);}
  }
  if(spec.same_as_previous||spec.same_as_any){location=s.locations[spec.same_as_any?pick(s,used,'Strongpoint supporting position',true):used.at(-1)];if(!location)return false;
   cover=['Trench','Foxholes','Deep Bunker'].includes(spec.cover)?location.covers.find(c=>c.type===spec.cover):{id:`fort_${s.next_id++}`,type:spec.cover,value:spec.cover==='Bunker'?3:1,known:false,enemy_original:true,capacity:['Bunker','Deep Bunker'].includes(spec.cover)?3:null};
   if(!cover)return false;if(!location.covers.includes(cover))location.covers.push(cover);
   if(spec.cover==='Bunker')cover.arc=[Math.sign(origin.row-location.row),Math.sign(origin.col-location.col)];}
  const candidates=state=>contactPlacements(state,pc,profile,used,range,noFire,!!p.no_fire,spec.cover,actualCovers).filter(l=>!rejected.has(l.id));
  while(!location){
   if(![-1,0,1].some(direction=>{const probe=structuredClone(s);expandContactRay(probe,origin,direction,range);return candidates(probe).some(l=>Math.sign(l.col-origin.col)===direction);}))return false;
   const dc=contactDirection(s,origin);expandContactRay(s,origin,dc,range);
   let ray=candidates(s).filter(l=>Math.sign(l.col-origin.col)===dc);
   if(!ray.length){emit(s,'CONTACT_DIRECTION_REJECTED','Invalid contact direction; redraw direction.',{direction:dc},true);continue;}
   while(ray.length&&!location){
    const far=Math.max(...ray.map(l=>distance(l,origin))),l=pick(s,ray.filter(l=>distance(l,origin)===far),'Enemy contact position',true);
    const before=new Set(l.covers.map(c=>c.id));cover=null;
    if(spec.cover){
     const value={Cover:1,Foxholes:1,Trench:2,Bunker:3,'Deep Bunker':3,Pillbox:4}[spec.cover];
     if(l.building&&spec.cover!=='Deep Bunker'){const building=discoveredCover(s,l,false,true);if(building.value>=value)cover=building;else l.covers=l.covers.filter(c=>c.id!==building.id&&c.parent!==building.id);}
     if(!cover){cover={id:`fort_${s.next_id++}`,type:spec.cover,value,known:false,enemy_original:true,capacity:spec.cover==='Pillbox'?2:['Bunker','Deep Bunker'].includes(spec.cover)?3:null};l.covers.push(cover);}
     if(['Bunker','Pillbox','Deep Bunker'].includes(cover.type))cover.arc=[Math.sign(origin.row-l.row),Math.sign(origin.col-l.col)];
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
  const l=location;if((spec.same_as_previous||spec.same_as_any)&&!noFire&&!canPlaceFire(s,profile,l.id,pc.location,spec.cover,cover))return false;used.push(l.id);
  const spotterAgency=p.incoming_agency??'enemy_mortar',spotterRules=profile.kind==='SPOTTER'?s.mission_rules?.enemy_spotters?.[spotterAgency.replace('enemy_','')]:null;
  const id=`enemy_${s.next_id++}`,u={...structuredClone(profile),id,counter_id:profile.id,contact_type:pc.type,max_steps:profile.steps,platoon:null,faction:'enemy',location:l.id,cohesion:'GOOD',experience:s.mission_rules?.enemyExperience??'Line',original_experience:s.mission_rules?.enemyExperience??'Line',ammo:spec.ammo!==undefined?{[profile.ammo_key??(profile.kind==='MORTAR'?'MTR':profile.kind==='FLAK88'?'GUN':'MG')]:spec.ammo}:structuredClone(profile.ammo??{}),spotter_agency:spotterAgency,missions_remaining:spotterRules?.missions??profile.missions??null,subsequent_draws:spotterRules?.subsequent_draws??profile.subsequent_draws,calls_made:0,
   steps:Array.from({length:spec.steps??profile.steps},(_,i)=>({id:`${id}_step${i+1}`,personnel:[]})),named:profile.kind!=='SQUAD',pinned:false,exposed:!!p.exposed,cover:cover?.id??null,
   fire:p.no_fire||profile.kind==='SPOTTER'?null:pc.location,hold_fire_until_cleanup:!!p.no_fire,indirect:null,radios:[],assets:structuredClone(profile.assets??{}),used:[],saved:0,removed:null,mission_weapon:true,placed_turn:s.turn};
  u.initial_resources={radios:[],assets:structuredClone(u.assets),ammo:structuredClone(u.ammo??{}),missions:u.missions_remaining};s.units[id]=u;
  if(p.outflanked&&p.point_blank){const directions=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];cover.arc=directions[randomNumber(s,8,'Outflanked pillbox facing',true)-1];u.fire=null;u.hold_fire_until_cleanup=true;spot(s,u);}
  if(profile.grenade_ammo&&!p.no_fire){const target=occupants(s,pc.location).find(t=>rangedWeaponTarget(s,u,t));if(target)grenade(s,u,target);}
  if(profile.kind==='MORTAR'&&profile.vof==='G'&&!p.no_fire){const target=occupants(s,pc.location).find(friendly);if(target)grenade(s,u,target);}
  if(p.infiltration){const success=attempt(s,u,2,'infiltrate',`${u.name}: patrol placement`,true)>0;u.exposed=!success;if(success){const candidate=l.covers.filter(c=>!c.parent&&!occupants(s,l.id).some(v=>v.id!==u.id&&v.cover===c.id&&v.faction==='friendly')).sort((a,b)=>b.value-a.value)[0];u.cover=candidate?.id??u.cover;}}
  if(p.spotted)spot(s,u);
  if(!p.no_fire&&!(p.outflanked&&p.point_blank)&&profile.kind!=='SPOTTER'){s.knowledge.suspected[l.id]=true;emit(s,'CONTACT_FIRE',`Fire from ${l.name}; ${p.spotted?'enemy identified':'source not yet spotted'}.`,{location:l.id,target:pc.location});}
  if(p.incoming){const agency=p.incoming_agency??'enemy_mortar';s.support.push({id:`support_${s.next_id++}`,source:id,agency,ammo:'HE',location:pc.location,status:'ACTIVE',value:p.incoming});s.registered_targets[agency]=pc.location;if(u.missions_remaining!==null)u.missions_remaining--;u.calls_made++;emit(s,'INCOMING_FIRE',`Incoming fire at ${s.locations[pc.location].name}.`,{location:pc.location,value:p.incoming,agency});}
 }
 if(p.incoming&&!(p.units?.length)){const agency=p.incoming_agency??'enemy_artillery';s.support.push({id:`support_${s.next_id++}`,source:null,agency,ammo:'HE',location:pc.location,status:'ACTIVE',value:p.incoming});s.registered_targets[agency]=pc.location;emit(s,'INCOMING_FIRE',`Incoming fire at ${s.locations[pc.location].name}.`,{location:pc.location,value:p.incoming,agency});}
 refresh(s);return true;
}
export function resolveMissionContact(s,pc){
 const count=s.mission_contacts.draws[s.activity]?.[pc.type];
 if(count===undefined)throw new Error(`Missing ${s.activity}/${pc.type} contact table.`);
 const contact=count===0||draw(s,count,`Evaluate contact ${pc.type} at ${s.locations[pc.location].name}`).some(c=>c.word==='Contact');
 pc.resolved=true;
 pc.revealed=true;
 emit(s,'CONTACT_EVALUATED',`${s.locations[pc.location].name}: ${contact?'enemy activity detected':'no contact'}.`,{location:pc.location,contact});
 if(!contact)return;
 // Placement is atomic: an unavailable multi-card package creates no partial force.
 const table=pc.counterattack&&pc.type==='A'?s.mission_rules.counterattack_table:s.mission_contacts.tables[pc.type];
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
