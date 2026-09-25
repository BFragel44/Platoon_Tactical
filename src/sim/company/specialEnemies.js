import {values,live,good,friendly,visible,draw,pick,emit} from './core.js';
import {occupants,unitLos,seesCard,distance,coverOf,refresh} from './battlefield.js';
import {shortRoundDestination} from './missionFeatures.js';

export function prepareSpecialTargets(s){
 if(!s.mission_rules?.specialEnemies)return;
 s.markers=s.markers.filter(m=>m.type!=='SNIPER');
 for(const u of values(s.units).filter(u=>good(u)&&u.vof==='S!'&&u.fire)){
  let targets=occupants(s,u.fire).filter(t=>u.location!==u.fire||t.faction!==u.faction);
  if(targets.some(t=>t.exposed))targets=targets.filter(t=>t.exposed);
  if(!targets.length)continue;
  const t=pick(s,targets,'Sniper target selection',!targets.some(t=>visible(s,t)));
  s.markers.push({type:'SNIPER',source:u.id,location:t.location,target:t.id,value:-3});
  emit(s,'SNIPER_TARGET','Sniper fire singles out a formation.',{actor:visible(s,t)?t.id:null,location:t.location},!visible(s,t));
 }
}
export function specialActivity(s,u,fallBack){
 if(!s.mission_rules?.specialEnemies||!good(u))return false;
 if(u.kind==='SNIPER'){
  if(s.knowledge.spotted[u.id]&&!['Foxholes','Trench','Bunker','Pillbox'].includes(coverOf(s,u)?.type)){
   fallBack(s,u);
   if(live(u)&&!values(s.units).some(t=>friendly(t)&&live(t)&&unitLos(s,t,u))){delete s.knowledge.spotted[u.id];emit(s,'ENEMY_LOST_SIGHT','The sniper moved out of sight.',{location:u.location});}
  }
  return true;
 }
 if(u.kind!=='SPOTTER')return false;
 if(u.placed_turn===s.turn)return true;
 const candidates=values(s.locations).filter(l=>!l.staging&&seesCard(s,u,l.id)&&occupants(s,l.id).some(friendly));
 if(!candidates.length)return true;
 const registered=s.registered_targets.enemy_mortar;
 const steps=l=>occupants(s,l.id).filter(friendly).reduce((n,t)=>n+t.steps.length,0),range=l=>distance(s.locations[u.location],l);
 candidates.sort((a,b)=>Number(b.id===registered)-Number(a.id===registered)||steps(b)-steps(a)||range(a)-range(b));
 const best=candidates[0],equals=candidates.filter(l=>(l.id===registered)===(best.id===registered)&&steps(l)===steps(best)&&range(l)===range(best));
 let target=pick(s,equals,'Enemy spotter target',true).id;
 const cards=draw(s,2+Number(target===registered),'Enemy spotter call for mortar fire',true),short=cards.some(c=>c.short);
 if(short||cards.some(c=>c.burst)){
  if(short)target=shortRoundDestination(s,u,target,true);
  s.support.push({id:`support_${s.next_id++}`,source:u.id,agency:'enemy_mortar',ammo:'HE',location:target,status:'PENDING',value:-3});s.registered_targets.enemy_mortar=target;
  emit(s,'SUPPORT_REQUEST','Enemy mortar fire is pending.',{location:target,success:true},!occupants(s,target).some(friendly));
 }else{u.removed='WITHDRAWN';emit(s,'UNIT_WITHDREW','Enemy spotter withdrew after a failed fire request.',{actor:u.id,location:u.location},!visible(s,u));}
 refresh(s);return true;
}
