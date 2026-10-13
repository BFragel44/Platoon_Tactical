import {it,expect} from 'vitest';
import {createMission,getVisibleEvents,exportReplay,replayMission,advancePhase,endTurn} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {cards,attempt,draw,randomNumber,annotatePublicDraws} from '../src/sim/company/core.js';
import {supportRequest} from '../src/sim/company/missionFeatures.js';
import {publicDrawGroups,drawGroupMarkup,recentDrawMarkup,actionCardMarkup} from '../src/ui/cardDraws.js';
const fresh=()=>createMission(trevieres,'visible-draws');
const card=(key,value=true)=>Object.values(cards).find(c=>c.id!==51&&c[key]===value);
it('records and presents every spotting draw, including draws after early success, without consuming presentation randomness',()=>{
 const s=fresh(),u=s.units.s11,before=structuredClone(s),success=card('spot'),miss=card('spot',false);
 s.deck.order=[success.id,miss.id,success.id,...s.deck.order];
 expect(attempt(s,u,3,'spot','Squad spotting',false)).toBe(2);annotatePublicDraws(before,s);
 const event=s.events.findLast(e=>e.type==='CARDS_DRAWN');expect(event.draw_context).toMatchObject({actor:u.id,allowance:3,field:{kind:'icons',keys:['spot']},values:[['spot'],[],['spot']]});
 const frozen=structuredClone(s),groups=publicDrawGroups(getVisibleEvents(s));
 expect(groups.at(-1).batches[0].cards).toHaveLength(3);expect(drawGroupMarkup(groups.at(-1))).toContain('No qualifying symbol');expect(s).toEqual(frozen);
});
it('groups Exhort with its original attempt and explains a skill success without inventing a matching icon',()=>{
 const s=fresh(),u=s.units.s11,miss=card('spot',false),hit=card('spot'),before=structuredClone(s);
 s.impulse={id:'test',hq:'co',commands:4,spent:0};s.active_exhort={issuer:'co',actors:[u.id],used:false};s.deck.order=[miss.id,hit.id,...s.deck.order];
 expect(attempt(s,u,1,'spot','Spot position',false)).toBe(1);annotatePublicDraws(before,s);
 const group=publicDrawGroups(getVisibleEvents(s)).at(-1);expect(group.batches).toHaveLength(2);expect(group.batches[1].field.keys).toEqual(['spot']);expect(s.impulse.commands).toBe(3);
 const skill=fresh();skill.active_skill={actor:'s11',icon:'spot',extra:false,applied:false};skill.deck.order=[miss.id,...skill.deck.order];
 expect(attempt(skill,skill.units.s11,1,'spot','Skilled spotting',false)).toBe(1);
 expect(skill.events.at(-1).draw_context.values).toEqual([[]]);expect(skill.events.at(-1).draw_context.outcome).toContain('assigned skill');
});
it('reveals support burst/short fields and public mission expenditure, without showing unrelated card fields',()=>{
 const s=fresh(),u=s.units.artyfo,before=structuredClone(s),short=card('short');
 s.deck.order=Array(8).fill(short.id).concat(s.deck.order);supportRequest(s,u,'artillery','HE','r1c1');annotatePublicDraws(before,s);
 const group=publicDrawGroups(getVisibleEvents(s)).at(-1),html=drawGroupMarkup(group);
 expect(group.batches[0].field.keys).toEqual(['burst','multi','short']);expect(html).toContain('Short round');expect(html).toContain('One fire mission expended');expect(html).toContain('missions remaining');
 expect(html).not.toContain('Veteran');expect(group.outcomes.some(e=>e.type==='SUPPORT_REQUEST')).toBe(true);
});
it('conceals hidden batches, identities and results even when passed an unfiltered event stream',()=>{
 const s=fresh(),before=structuredClone(s);draw(s,1,'Secret enemy package',true,{actor:'secret',field:{kind:'random',sides:6}});
 draw(s,1,'Public contact check',false,{field:{kind:'word',expected:'Contact'}});annotatePublicDraws(before,s);
 const html=recentDrawMarkup(s.events,s.turn);expect(html).not.toContain('Secret');expect(html).not.toContain('secret');expect(html).toContain('Public contact check');
 expect(publicDrawGroups(s.events).flatMap(g=>g.batches).every(b=>b.purpose!=='Secret enemy package')).toBe(true);
});
it('does not disclose an unidentified attacker or its private modifiers in a public attempt',()=>{
 const s=fresh(),u={...s.units.s11,id:'secret',faction:'enemy',experience:'Veteran'};
 attempt(s,u,1,'grenade','Unidentified attacker: grenade attack',false);
 const context=s.events.findLast(e=>e.type==='CARDS_DRAWN').draw_context;
 expect(context.actor).toBeNull();expect(context.details.join(' ')).not.toContain('Experience');expect(context.details.join(' ')).not.toContain('Leader');
});
it('records random columns, HQ symbols and shared-deck reshuffles while preserving all outcomes',()=>{
 const s=fresh();s.deck={order:[51,1,2,3],discard:[4,5],draws:0,reshuffles:0};
 const n=randomNumber(s,4,'Public random choice');expect(n).toBe(cards[1].random[2]);
 expect(s.events.find(e=>e.type==='CARDS_DRAWN').draw_context).toMatchObject({field:{kind:'random',sides:4},values:[n]});
 expect(s.events.some(e=>e.type==='DECK_SHUFFLED')).toBe(true);
 draw(s,1,'HQ check',false,{field:{kind:'icons',keys:['hq']}});expect(publicDrawGroups(s.events).at(-1).batches[0].field.keys).toEqual(['hq']);
});
it('scopes history to the current turn and attempt, retaining preparation draws and escaping public text',()=>{
 const events=[{id:'old',type:'CARDS_DRAWN',turn:1,card_ids:[1],purpose:'Old attempt'},
 {id:'moon',type:'CARDS_DRAWN',turn:1,card_ids:[2],purpose:'Moon',draw_outcomes:[{id:'boundary',type:'PATROL_PREPARED',text:'New patrol'}]},
 {id:'boundary',type:'PATROL_PREPARED',turn:1},{id:'new',type:'CARDS_DRAWN',turn:2,card_ids:[3],purpose:'<script>new</script>'}];
 expect(recentDrawMarkup(events,1)).not.toContain('Old attempt');expect(recentDrawMarkup(events,1)).toContain('Moon');expect(recentDrawMarkup(events,1)).not.toContain('new</script>');
 expect(recentDrawMarkup(events,2)).toContain('&lt;script&gt;');expect(actionCardMarkup({id:1,field:{kind:'hit',experience:'Line'},value:'LC'})).toContain('Line HIT');
});
it('keeps end-turn batching and explicit stepping exactly replayable with additive presentation metadata',()=>{
 let s=fresh();s=endTurn(s).state;expect(replayMission(trevieres,exportReplay(s))).toEqual(s);
 const checkpoint=structuredClone(s);publicDrawGroups(getVisibleEvents(s)).forEach(g=>drawGroupMarkup(g));expect(s).toEqual(checkpoint);
 const next=advancePhase(s).state;expect(replayMission(trevieres,exportReplay(next))).toEqual(next);
});
