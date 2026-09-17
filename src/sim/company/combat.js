import { values, live, good, friendly, visible, emit, draw, randomNumber, pick, shuffle } from './core.js';
import { adjacent, occupants, los, distance, basicValue, canFire, refresh, spot, hasFire, incoming, combatModifier, coverOf } from './battlefield.js';
import { seekCover, rally, grenade, concentrate, move, splitTeam } from './actions.js';

export function casualty(s,u,step) {
  const id=`casualty_${s.next_id++}`;
  s.casualties.push({id,step,location:u.location,cover:u.cover,faction:u.faction,carrier:null,evacuated:false});
  const names=step.personnel.map(id=>s.personnel[id]?.name).filter(Boolean);
  for(const id of step.personnel)if(s.personnel[id])s.personnel[id].status='CASUALTY';
  emit(s,'CASUALTY',`${visible(s,u)?u.name:'Enemy formation'} lost a step${friendly(u)?`: ${names.join(', ')}`:''}.`,{actor:visible(s,u)?u.id:null,personnel:friendly(u)?step.personnel:[],step_id:visible(s,u)?step.id:null},!visible(s,u));
}
function loseAssets(s,u) {
  for(const net of u.radios) {
    const destroyed=randomNumber(s,2,`${u.name}: radio damage`,!visible(s,u))===1;
    s.assets.push({id:`asset_${s.next_id++}`,type:'RADIO',net,location:u.location,destroyed});
    emit(s,'RADIO_LOST',`${u.name}: ${net} radio ${destroyed?'destroyed':'dropped for recovery'}.`,{actor:u.id,net,destroyed},!visible(s,u));
  }
  u.radios=[];u.assets={};u.saved=0;
  for(const c of s.casualties.filter(c=>c.carrier===u.id))c.carrier=null;
}
export function applyHit(s,u,letters) {
  const originalCount=u.steps.length,affected=[];
  for(const letter of letters.slice(0,Math.min(2,originalCount))) {
    const step=u.steps.shift();if(!step)break;
    if(letter==='C')casualty(s,u,step);
    else if(originalCount===1&&u.named&&['A','F'].includes(letter)) {
      u.steps.push(step);u.cohesion='F';u.pinned=true;affected.push(u);break;
    } else {
      const child=splitTeam(s,u,letter,step);child.pinned=true;affected.push(child);
      if(!friendly(u)&&s.knowledge.spotted[u.id])s.knowledge.spotted[child.id]={id:child.id};
    }
  }
  if(u.steps.length===1&&u.kind==='SQUAD'){const child=splitTeam(s,u,'F',u.steps.pop());child.pinned=true;affected.push(child);if(!friendly(u)&&s.knowledge.spotted[u.id])s.knowledge.spotted[child.id]={id:child.id};}
  if(u.steps.length){u.pinned=true;affected.push(u);}else{u.removed='BROKEN';loseAssets(s,u);}
  if(['P','L'].includes(u.cohesion))u.saved=0;
  emit(s,'FORMATION_CHANGED',`${u.name}: ${letters} hit; ${u.steps.length} step(s) remain in the original formation.`,
    {actor:u.id,effect:letters,formations:affected.map(v=>v.id)},!visible(s,u));
}
export function resolveCombat(s) {
  // Fix all target modifiers before any losses. Stable IDs also make object insertion order irrelevant.
  const targets=values(s.units).filter(live).map(u=>({id:u.id,modifier:combatModifier(s,u)})).filter(t=>t.modifier);
  for(const {id,modifier} of targets) {
    const u=s.units[id],hidden=!visible(s,u);
    const card=draw(s,1,`${u.name}: combat effect`,hidden)[0];
    const outcome=card.combat[modifier.ncm+4];
    emit(s,'COMBAT_RESULT',`${u.name}: ${outcome.toLowerCase()} (net modifier ${modifier.ncm>=0?'+':''}${modifier.ncm}).`,{actor:u.id,outcome,...modifier},hidden);
    if(outcome==='MISS')u.pinned=false;
    if(outcome==='PIN')u.pinned=true;
    if(outcome==='HIT')applyHit(s,u,draw(s,1,`${u.name}: hit effect`,hidden)[0].hit[u.experience]);
  }
  // Deliberately do not refresh until cleanup (3.7.4).
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
export function resolveContacts(s) {
  const counts={NO_CONTACT:{A:0,B:0},CONTACT:{A:7,B:5},ENGAGED:{A:5,B:3},HEAVILY_ENGAGED:{A:3,B:2}};
  for(const pc of values(s.contacts).filter(pc=>!pc.resolved&&occupants(s,pc.location).some(friendly))) {
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
function fallBack(s,u) {
  const from=s.locations[u.location];
  if(!friendly(u)&&from.row===3){u.removed='WITHDRAWN';emit(s,'UNIT_WITHDREW',`${u.name} withdrew from the battlefield.`,{actor:u.id},!visible(s,u));return;}
  const possible=adjacent(s,u.location).filter(l=>(friendly(u)?l.row<from.row:l.row>from.row)&&!occupants(s,l.id).some(v=>v.faction!==u.faction));
  if(!possible.length)return;
  possible.sort((a,b)=>Number(hasFire(s,a.id))-Number(hasFire(s,b.id))||b.protection-a.protection);
  const best=possible.filter(l=>hasFire(s,l.id)===hasFire(s,possible[0].id)&&l.protection===possible[0].protection);
  move(s,u,pick(s,best,'Retreat destination',!visible(s,u)).id);
}
function enemyCover(s,u) {
  const cover=s.locations[u.location].covers.filter(c=>!occupants(s,u.location).some(v=>friendly(v)&&v.cover===c.id)).sort((a,b)=>b.value-a.value)[0];
  if(cover){u.cover=cover.id;u.exposed=true;}else seekCover(s,u);
}
function attack(s,u) {
  const close=occupants(s,u.location).find(v=>v.faction!==u.faction);
  if(close){if(coverOf(s,u)?.type==='Bunker'){u.cover=null;u.exposed=true;}grenade(s,u,close);}
  else if(u.fire){const target=occupants(s,u.fire).find(v=>v.faction!==u.faction);if(target)concentrate(s,u,target);}
}
// First matching row of Deliberate Defence / No Leader LAT hierarchy.
export function enemyActivity(s) {
  const locations=[...new Set(values(s.units).filter(u=>live(u)&&!friendly(u)).map(u=>u.location))];
  for(const loc of shuffle(s,locations)) {
    const units=occupants(s,loc).filter(u=>!friendly(u)).sort((a,b)=>Number(good(a))-Number(good(b))||a.id.localeCompare(b.id));
    for(const u of units) {
      if(!live(u))continue;
      if(u.fire&&!occupants(s,u.fire).some(v=>v.faction!==u.faction))u.fire=null;
      refresh(s);
      const same=occupants(s,u.location).some(friendly),under=hasFire(s,u.location),covered=!!u.cover;
      const roll=n=>randomNumber(s,n,`${u.name}: activity`,!visible(s,u));
      let action='NONE';
      if(u.pinned) {
        if(same&&!covered)action=['NONE','COVER','RALLY','FALL_BACK','FALL_BACK'][roll(5)-1];
        else if(same&&covered)action=['NONE','NONE','RALLY','FALL_BACK','FALL_BACK'][roll(5)-1];
        else if(!covered)action=['NONE','NONE','COVER','RALLY','FALL_BACK'][roll(5)-1];
        else action=['NONE','NONE','RALLY','FALL_BACK'][roll(4)-1];
      }else if(u.cohesion!=='GOOD') {
        if(u.named&&u.cohesion==='F')action=roll(2)===2?'RECOVER':'NONE';
        else if(u.cohesion==='A')action=roll(2)===2?(same?'ATTACK':'ADVANCE'):'NONE';
        else if(u.cohesion==='F'&&same)action=(covered?['NONE','NONE','ATTACK','FALL_BACK','FALL_BACK']:['NONE','COVER','FALL_BACK','FALL_BACK','FALL_BACK'])[roll(5)-1];
        else if(u.cohesion==='L')action=roll(3)===3?'RECOVER':'NONE';
      }else if(same&&!covered)action=['COVER','FALL_BACK','ATTACK'][roll(3)-1];
      else if(same&&covered)action=['NONE','ATTACK','ATTACK'][roll(3)-1];
      else if(!under&&!values(s.units).some(v=>friendly(v)&&live(v)&&los(s,u.location,v.location)))action='NONE';
      else if(!under&&u.fire)action='ATTACK';
      else if(under&&!covered)action=['COVER','COVER','ATTACK'][roll(3)-1];
      else if(incoming(s,u).some(f=>f.origin!==u.fire))action=['NONE','ATTACK','SHIFT','SHIFT'][roll(4)-1];
      else if(['A','H'].includes(u.vof)&&u.fire)action='ATTACK';
      else if(u.fire)action=roll(2)===2?'ATTACK':'NONE';
      if(action==='COVER')enemyCover(s,u);
      if(action==='RALLY')rally(s,u);
      if(action==='RECOVER')rally(s,u,u,true);
      if(action==='FALL_BACK')fallBack(s,u);
      if(action==='ATTACK')attack(s,u);
      if(action==='SHIFT'){const f=incoming(s,u).find(f=>canFire(s,u,f.origin));if(f)u.fire=f.origin;}
      if(action==='ADVANCE') {
        const dest=adjacent(s,u.location).filter(l=>!l.staging).sort((a,b)=>Math.min(...values(s.units).filter(v=>friendly(v)&&live(v)).map(v=>distance(a,s.locations[v.location])))-Math.min(...values(s.units).filter(v=>friendly(v)&&live(v)).map(v=>distance(b,s.locations[v.location]))))[0];
        if(dest&&!u.exposed)move(s,u,dest.id,under);
      }
      if(action==='HIDE') {
        u.removed='HIDDEN';u.fire=null;
        const id=`pc_return_${s.next_id++}`;s.contacts[id]={id,location:u.location,type:'A',resolved:false,returning:[u.id]};
        emit(s,'CONTACT_RENEWED',`A previously engaged position at ${s.locations[u.location].name} must be cleared again.`,{location:u.location},!visible(s,u));
      }
      emit(s,'ENEMY_ACTIVITY',`${u.name}: ${action.toLowerCase().replaceAll('_',' ')}${action==='NONE'?'; existing fire continues':''}.`,{actor:u.id,action},!visible(s,u));
      refresh(s);
    }
  }
}
export function capture(s) {
  for(const l of values(s.locations)) {
    for(const side of ['friendly','enemy']) {
      const units=occupants(s,l.id),victims=units.filter(u=>u.faction===side&&['P','L'].includes(u.cohesion));
      if(!victims.length||units.some(u=>u.faction===side&&!['P','L'].includes(u.cohesion)))continue;
      const guard=units.find(u=>u.faction!==side&&!u.pinned&&basicValue(u)!==null);
      if(!guard)continue;
      const step=guard.steps.pop();s.prisoners.push({guard:step,prisoners:victims.flatMap(u=>u.steps)});
      if(!guard.steps.length)guard.removed='GUARD';
      for(const u of victims){u.removed='CAPTURED';emit(s,'UNIT_CAPTURED',`${u.name} captured; one opposing step assigned as guard.`,{actor:u.id},!visible(s,u));}
    }
    if(!occupants(s,l.id).some(u=>!friendly(u)))for(const c of s.casualties.filter(c=>c.location===l.id&&c.faction==='enemy'))c.evacuated=true;
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
