import {it,expect} from 'vitest';
import {createDrawReceipts,cardDrawIdentity,publicDrawGroups} from '../src/ui/cardDraws.js';
const draw=n=>({id:`e${n}`,sequence:n,type:'CARDS_DRAWN',turn:2,card_ids:[17],purpose:'Public draw',draw_context:{field:{kind:'random',sides:4},values:[2]}});
it('does not requeue sixty historical pulls on patrol completion or AAR review',()=>{
 const mission={mission_instance_id:'m3',attempt_number:1,patrol_history:[]},r=createDrawReceipts(),events=Array.from({length:60},(_,i)=>draw(i+1));r.prime(cardDrawIdentity(mission),[]);
 expect(r.collect(cardDrawIdentity(mission),events).groups).toHaveLength(60);mission.patrol_history.push({outcome:'SUCCESS'});mission.status='PATROL_COMPLETE';
 expect(r.collect(cardDrawIdentity(mission),events).groups).toEqual([]);r.prime(cardDrawIdentity(mission),events);expect(r.collect(cardDrawIdentity(mission),events).groups).toEqual([]);expect(publicDrawGroups(events)).toHaveLength(60);
});
it('compares public sequence numbers when recovery includes a hidden tail',()=>{
 const r=createDrawReceipts(),events=[draw(1),{id:'secret',sequence:2,type:'SECRET',hidden:true}];r.prime('same',events);expect(r.collect('same',[events[0]])).toEqual({reset:false,groups:[]});
 expect(r.collect('same',[events[0],draw(3)]).groups).toHaveLength(1);
});
it('seeds history on unknown identity or actual rewind and then reveals only new batches',()=>{
 const r=createDrawReceipts();expect(r.collect('old',[draw(1),draw(2)]).groups).toEqual([]);expect(r.collect('new',[draw(1),draw(2)]).reset).toBe(true);
 expect(r.collect('new',[draw(1)]).reset).toBe(true);expect(r.collect('new',[draw(1),draw(2)]).groups).toHaveLength(1);
});
it('changes identity only for a different mission or a newly prepared attempt/patrol',()=>{
 const m={scenario_id:'normandy_3',seed:'same',attempt_number:1,patrol_history:[]},id=cardDrawIdentity(m);m.turn=9;m.status='PATROL_COMPLETE';m.patrol_history=[{}];expect(cardDrawIdentity(m)).toBe(id);m.attempt_number=2;expect(cardDrawIdentity(m)).not.toBe(id);
});
