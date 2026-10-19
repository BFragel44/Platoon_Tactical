import {it,expect} from 'vitest';
import {createMission,submitCommand,advancePhase,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

function fresh(mission,within=false){
 const s=createMission(trevieres,'engineer-movement');
 for(const flag of ['hill192','vire','tinchebray'])s.mission_rules[flag]=flag===mission;
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'engineer-test',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations))Object.assign(l,{terrain:'fields',elevation:1,borders:borders(DIRECTIONS)});
 const u=s.units.s11;Object.assign(u,{location:'r2c1',cover:null,exposed:false,capabilities:{engineer:true}});
 const target=within?u.location:'r2c2';s.locations[target].mines=true;
 s.locations[target].covers=[{id:'safe-cover',type:'Cover',value:1,known:true,discovered:true}];
 return {s,u,command:within?{type:'INFILTRATE_WITHIN',unit_id:u.id,target_id:'safe-cover'}:{type:'INFILTRATE',unit_id:u.id,target_id:target,arrival_cover:'open'}};
}
function stack(s,success,hit){
 const infiltration=Object.values(cards).find(c=>!!c.infiltrate===success);
 const mine=Object.values(cards).find(c=>hit?c.burst:!c.burst&&!c.short);
 // The Line engineer draws two infiltration cards, then one or three mine cards.
 s.deck.order=[infiltration.id,infiltration.id,...Array(3).fill(mine.id),...s.deck.order];
}
for(const mission of ['hill192','vire','tinchebray'])for(const within of [false,true])for(const success of [false,true])for(const hit of [false,true]){
 it(`${mission}: ${within?'within-card':'adjacent'} engineer infiltration success=${success}, mine hit=${hit}`,()=>{
  const {s,u,command}=fresh(mission,within);stack(s,success,hit);
  const r=submitCommand(s,command);expect(r.accepted,r.reason).toBe(true);
  const after=r.state,v=after.units[u.id],attempt=after.events.findLast(e=>e.type==='ENGINEER_PATH_ATTEMPT');
  expect(attempt).toMatchObject({infiltration_success:success,hit,cleared:success&&!hit});
  expect(after.locations[v.location].mines).toBe(!(success&&!hit));expect(v.exposed).toBe(false);
  expect(!!v.mine_hit).toBe(hit);
  expect(after.events.filter(e=>e.type==='MINE_CHECK')).toHaveLength(1);
  expect(after.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(success?1:3);
 });
}
it.each(['ordinary squad','one step','pinned','Fire Team'])('does not grant engineer path clearing to %s',kind=>{
 const {s,u,command}=fresh('vire');
 if(kind==='ordinary squad')u.capabilities={};if(kind==='one step')u.steps.splice(1);
 if(kind==='pinned')u.pinned=true;if(kind==='Fire Team')u.cohesion='F';
 stack(s,true,false);const r=submitCommand(s,command);
 expect(r.state.events.some(e=>e.type==='ENGINEER_PATH_ATTEMPT')).toBe(false);
 expect(r.state.locations.r2c2.mines).toBe(true);
});
it('keeps ordinary engineer movement at three mine cards without clearing a path',()=>{
 const {s,command}=fresh('tinchebray');command.type='MOVE';stack(s,false,false);
 const r=submitCommand(s,command);expect(r.accepted,r.reason).toBe(true);
 expect(r.state.units.s11.exposed).toBe(true);expect(r.state.locations.r2c2.mines).toBe(true);
 expect(r.state.events.some(e=>e.type==='ENGINEER_PATH_ATTEMPT')).toBe(false);
 expect(r.state.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(3);
});
for(const within of [false,true])it(`replays and recovers a legal ${within?'within-card':'adjacent'} engineer infiltration`,()=>{
 // Authored initial minefield; no phase, RNG or tactical mutations after creation.
 const def={...structuredClone(companyAssault),id:'engineer_replay',rules:{hill192:true,specialEnemies:true},contacts:[],
  units:trevieres.units.filter(u=>['co','s11'].includes(u.id)).map(u=>({...structuredClone(u),location:'r1c1',experience:'Line',...(u.id==='s11'?{capabilities:{engineer:true}}:{})}))};
 const target=within?'r1c1':'r1c2';Object.assign(def.locations.find(l=>l.id===target),{mines:true,covers:[{id:'authored-cover',type:'Cover',value:1,known:true,discovered:true}]});
 let s=createMission(def,'engineer-replay');for(let i=0;i<4;i++)s=advancePhase(s).state;
 const r=submitCommand(s,{unit_id:'s11',issuer_id:'co',...(within?{type:'INFILTRATE_WITHIN',target_id:'authored-cover'}:{type:'INFILTRATE',target_id:target,arrival_cover:'open'})});
 expect(r.accepted,r.reason).toBe(true);s=r.state;expect(s.events.some(e=>e.type==='ENGINEER_PATH_ATTEMPT')).toBe(true);
 expect(replayMission(def,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);
});
