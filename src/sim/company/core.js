import {synchronizeVireATUnits} from './vireUnits.js';
import {recordPatrolMovement} from './patrols.js';
import data from './actionDeckData.json' with { type: 'json' };
import { drawRandom } from '../rng.js';
import {skillOptions} from './skills.js';

export const values = map => Object.values(map).sort((a,b) => a.id.localeCompare(b.id));
export const live = u => u && u.steps.length > 0 && !u.removed;
export const friendly = u => u.faction === 'friendly';
export const good = u => live(u) && !u.pinned && u.cohesion === 'GOOD';
export const expMod = u => ({ Green: -1, Line: 0, Veteran: 1 }[u.experience] ?? 0);
export const visible = (s,u) => friendly(u) || s.knowledge.spotted[u.id];
export function emit(s, type, text, details = {}, hidden = false) {
  const event = { id: `event_${s.events.length+1}`, sequence: s.events.length+1, turn: s.turn,
    ...(type==='UNIT_MOVED'&&s.mission_rules?.hill192?{had_potential_contact:values(s.contacts).some(c=>!c.resolved&&c.location===details.target)}:{}),
    phase: s.phase, impulse: s.impulse?.id ?? null, type, text, ...details, hidden };
  s.events.push(event);
  if(type==='UNIT_MOVED'&&s.patrol&&s.units[details.actor])s.patrol=recordPatrolMovement(s.patrol,s.units[details.actor],details.from,details.target,s.locations);
  return event;
}
export function shuffle(s, items) {
  const result = [...items];
  for (let i = result.length-1; i > 0; i--) {
    const draw = drawRandom(s.rng); s.rng = draw.rng;
    const j = Math.floor(draw.value * (i+1)); [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}
export const cards = Object.fromEntries(data.cards.map(({id, fields:f}) => [id, {
  id, activated:f[0], initiative:f[1], word:f[2], spot:f[3].includes('10683'),
  grenade:f[3].includes('1F4A3'), infiltrate:f[3].includes('1FA96'),
  burst:f[3].includes('1F4A5'), multi:f[3].split('1F4A5').length > 2,
  jam:f[3] === 'Jam!', short:f[3] === 'Short!', hq:!!f[4], at:f[5],
  hit:{ Veteran:f[6], Line:f[7], Green:f[8] }, combat:f.slice(9,20), random:f.slice(20,31),
}]));
export function newDeck(s) { return { order:shuffle(s, data.cards.map(c => c.id)), discard:[], reshuffles:0, draws:0 }; }
// Finish the entire attempt, even after success. Reshuffle marker is not a draw.
export function draw(s, count, purpose, hidden = false, context = {}) {
  const batch = []; let reshuffle = false;
  for (let i = 0; i < count;) {
    if (!s.deck.order.length) {
      s.deck.order = shuffle(s, s.deck.discard); s.deck.discard = []; s.deck.reshuffles++;
      reshuffle = false;
    }
    const id = s.deck.order.shift(); s.deck.discard.push(id); s.deck.draws++;
    if (id === 51) { reshuffle = true; continue; }
    batch.push(cards[id]); i++;
  }
  emit(s,'CARDS_DRAWN',`${purpose}: ${batch.map(c => c.id).join(', ')}.`,
    { purpose, card_ids: batch.map(c=>c.id),draw_context:{actor:context.actor??null,field:context.field??{kind:'card'},allowance:count,details:context.details??[],values:batch.map(c=>drawFieldValue(c,context.field)),combat:context.combat===true,...(context.outcome?{outcome:context.outcome}:{})} }, hidden);
  if (reshuffle) {
    s.deck.order = shuffle(s, [...s.deck.order,...s.deck.discard]); s.deck.discard = []; s.deck.reshuffles++;
    emit(s,'DECK_SHUFFLED','Action deck reshuffled after completing the draw batch.',{},hidden);
  }
  return batch;
}
export function drawFieldValue(c,field={kind:'card'}){
 if(field.kind==='icons')return field.keys.filter(k=>c[k]);
 if(field.kind==='combat')return c.combat[field.ncm+4];
 if(field.kind==='hit')return c.hit[field.experience];
 if(field.kind==='random')return c.random[field.sides-2];
 if(field.kind==='word')return c.word;
 if(field.kind==='card')return c.id;
 return c[field.key]??null;
}
export function randomNumber(s, n, purpose, hidden = false) {
  if (n <= 1) return 1;
  if (n > 12) throw new Error('Action card random range exceeds 12');
  return draw(s,1,purpose,hidden,{field:{kind:'random',sides:n}})[0].random[n-2];
}
export function pick(s, items, purpose, hidden=false) { if(items.length>12){const chosen=shuffle(s,items)[0];emit(s,'RANDOM_SELECTION',`${purpose}: seeded selection from ${items.length} candidates.`,{},hidden);return chosen;}return items[randomNumber(s,items.length,purpose,hidden)-1]; }
export function exhortDraw(s,u,purpose,hidden=false,field={kind:'card'}){
 const exhort=s.active_exhort;
 if(!friendly(u)||!exhort||exhort.used||!exhort.actors.includes(u.id))return [];
 exhort.used=true;s.impulse.commands--;s.impulse.spent++;
 if(s.impulse.hq==='general'&&(s.mission_rules?.reattempts||s.patrol)){s.impulse.origin_spent??={};s.impulse.origin_spent[exhort.issuer]=(s.impulse.origin_spent[exhort.issuer]??0)+1;}
 s.units[exhort.issuer].used.push(`${s.impulse.id}:EXHORT`);
 emit(s,'EXHORT_ISSUED',`${s.units[exhort.issuer].name}: exhort failed ${purpose}; one additional card.`,{actor:exhort.issuer,recipient:u.id,purpose});
 return draw(s,1,`Exhort: ${purpose}`,hidden,{actor:u.id,field,details:['Exhort: one additional command and card.']});
}
export function attempt(s,u, count, icon, purpose, hidden = !visible(s,u),checkCards=null,automatic=!s.impulse,grenadeReturn=false) {
  const leader=s.mission_rules?.leaderBonus&&u.faction==='enemy'&&values(s.units).some(v=>v.kind==='LEADER'&&v.faction==='enemy'&&live(v)&&!v.pinned&&v.cohesion==='GOOD'&&v.location===u.location&&v.cover===u.cover);
  let skill=s.active_skill;
  if(!skill&&automatic&&friendly(u)&&s.automatic_skills?.[u.id]){
   const assigned=s.automatic_skills[u.id],reserved=s.skills.find(p=>p.id===assigned);
   // Auto Grenade waits for this unit's free response (§7.10.5), not other attempts.
   const action=reserved?.type==='AUTO_GRENADE'?'SKILL_GRENADE_RETURN':'SKILL_EXTRA_AUTOMATIC';
   if(action==='SKILL_EXTRA_AUTOMATIC'||grenadeReturn){
    const p=skillOptions(s,u,action).find(p=>p.id===assigned);
    delete s.automatic_skills[u.id];
    if(p){s.skills.find(v=>v.id===p.id).used=true;skill={actor:u.id,extra:action==='SKILL_EXTRA_AUTOMATIC',icon:action==='SKILL_GRENADE_RETURN'?'grenade':undefined,applied:false};emit(s,'SKILL_USED',`${u.name}: ${p.type==='AUTO_GRENADE'?'Auto Grenade on free return':'Extra Draw on automatic attempt'}.`,{actor:u.id,holder:p.holder,skill_id:p.id,skill:p.type,automatic:true});}
   }
  }
  const applies=skill&&!skill.applied&&skill.actor===u.id&&(skill.extra||skill.icon===icon);
 const field=['spot','grenade','infiltrate','burst','hq'].includes(icon)?{kind:'icons',keys:[icon,...(checkCards?['jam']:[])]}:{kind:'word',expected:icon};
  const batch=draw(s,Math.max(1,count+expMod(u)+(leader?1:0))+(applies&&skill.extra?1:0),purpose,hidden,{actor:visible(s,u)?u.id:null,field,details:visible(s,u)?[`Base allowance ${count}`,`Experience ${expMod(u)>=0?'+':''}${expMod(u)}`,...(leader?['Leader +1']:[]),...(applies?['Assigned skill applied']:[])]:['Unidentified formation; private modifiers remain concealed.']});
  const event=s.events.findLast(e=>e.type==='CARDS_DRAWN');
  let successes=batch.filter(c => c[icon] || c.word.toLowerCase() === icon).length;
  if(checkCards?.(batch)===false){if(applies)skill.applied=true;event.draw_context.outcome='Attempt prevented by its card condition.';return 0;}
  if(applies){skill.applied=true;if(!skill.extra)successes=Math.max(1,successes);}
  if(!successes&&!automatic){
   const extra=exhortDraw(s,u,purpose,hidden,field);
   if(checkCards?.(extra)!==false)successes=extra.filter(c=>c[icon]||c.word.toLowerCase()===icon).length;
  }
  event.draw_context.outcome=successes?`Qualifying result found${applies&&!skill.extra?' with assigned skill':''}.`:'No qualifying result found.';
  return successes;
}
export function annotatePublicDraws(before,next) {
 const fresh=next.events.slice(before.events.length),group=`action_${before.events.length+1}`;
 for(const e of fresh)if(e.type==='CARDS_DRAWN'&&!e.action_group){
  e.action_group=group;
  e.draw_outcomes=fresh.filter(v=>!v.hidden&&!['CARDS_DRAWN','DECK_SHUFFLED','PHASE_ENTERED','COMMAND_RESOLVED'].includes(v.type)).map(v=>({id:v.id,type:v.type,text:v.text}));
 }
}
export function result(before,next,extra={}) {
 annotatePublicDraws(before,next);
 synchronizeVireATUnits(next);
 if(next.vire_runtime?.normal_phase_enabled)for(const operation of next.replay.slice(before.replay.length)){
  const id=`core_${next.vire_runtime.operations.length+1}`;
  next.vire_runtime.operations.push({id,type:'ENGINE_OPERATION',operation:structuredClone(operation)});next.vire_runtime.applied.push(id);
 }
 return { state:next, events:next.events.slice(before.events.length), ...extra };
}

// Rule 5.1.6: assets and casualty loads use independent infantry capacities.
export function transportReason(s,u,extraAssets=0) {
  if(!s.mission_rules?.specialEnemies)return null;
  const assets=u.radios.length+Object.values(u.assets).reduce((n,q)=>n+q,0)+extraAssets;
  if(assets>6*u.steps.length)return 'Over transport capacity: each step can carry six assets. Drop equipment before moving.';
  if(s.casualties.filter(c=>c.carrier===u.id).length>u.steps.length)return 'Over transport capacity: each step can carry one casualty. Unload before moving.';
  return null;
}

// Removal without combat does not destroy carried radios or silently delete loads.
export function dropItemsReason(s,u,items){
 if(!Array.isArray(items)||!items.length)return 'Select at least one item and quantity to drop.';
 const seen=new Set();
 for(const item of items){
  if(!item||Object.keys(item).some(k=>!['type','key','quantity'].includes(k))||!['RADIO','EQUIPMENT','AMMO','CASUALTY'].includes(item.type)||typeof item.key!=='string'||['__proto__','constructor','prototype'].includes(item.key)||!Number.isSafeInteger(item.quantity)||item.quantity<1)return 'Choose valid items and positive whole quantities.';
  const id=`${item.type}:${item.key}`;if(seen.has(id))return 'Select each item only once.';seen.add(id);
  const stock=item.type==='RADIO'?u.radios.filter(net=>net===item.key).length:item.type==='CASUALTY'?s.casualties.filter(c=>c.id===item.key&&c.carrier===u.id&&!c.evacuated).length:item.type==='AMMO'?(s.mission_rules?.ammo==='tracked'?u.ammo?.[item.key]:0):u.assets[item.key];
  if(!Number.isSafeInteger(stock)||item.quantity>stock)return 'The selected quantity exceeds the carried stock.';
 }
 return null;
}
export function dropItems(s,u,items){
 const reason=dropItemsReason(s,u,items);if(reason)throw new Error(reason);
 for(const {type,key,quantity} of items){
  if(type==='CASUALTY'){const c=s.casualties.find(c=>c.id===key);c.carrier=null;c.location=u.location;c.cover=u.cover;continue;}
  const asset={id:`asset_${s.next_id++}`,type,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction};
  if(type==='RADIO'){for(let i=0;i<quantity;i++){u.radios.splice(u.radios.indexOf(key),1);s.assets.push({...asset,id:i?`asset_${s.next_id++}`:asset.id,net:key});}}
  else {const field=type==='AMMO'?u.ammo:u.assets;field[key]-=quantity;s.assets.push({...asset,key,quantity});if(type==='AMMO'&&field[key]===0)u.out_of_ammo=true;}
 }
 emit(s,'ASSETS_DROPPED',`${u.name}: selected items dropped without a command or exposure.`,{actor:u.id,location:u.location,items:structuredClone(items),reason:'selective voluntary unload'});
}
export function dropLoad(s,u,reason='removed') {
 for(const net of u.radios)s.assets.push({id:`asset_${s.next_id++}`,type:'RADIO',net,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
 for(const [key,quantity] of Object.entries(u.assets))if(quantity)s.assets.push({id:`asset_${s.next_id++}`,type:'EQUIPMENT',key,quantity,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
 if(s.mission_rules?.ammo==='tracked')for(const [key,quantity] of Object.entries(u.ammo??{}))if(quantity)s.assets.push({id:`asset_${s.next_id++}`,type:'AMMO',key,quantity,source_unit:u.id,location:u.location,cover:u.cover,faction:u.faction});
 for(const c of s.casualties.filter(c=>c.carrier===u.id)){c.carrier=null;c.location=u.location;c.cover=u.cover;}
 u.radios=[];u.assets={};
 if(s.mission_rules?.ammo==='tracked'){u.ammo={};u.out_of_ammo=true;}
 emit(s,'ASSETS_DROPPED',`${visible(s,u)?u.name:'Enemy formation'}: carried load left at its current position (${reason}).`,{actor:visible(s,u)?u.id:null,location:u.location,reason},!visible(s,u));
}
