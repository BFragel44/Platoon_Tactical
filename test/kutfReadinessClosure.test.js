import {it,expect} from 'vitest';
import {createMission,advancePhase,selectHQ,getPlayerView,getVisibleEvents,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {enemyActivity,capture,applyHit} from '../src/sim/company/combat.js';
import {grenade} from '../src/sim/company/actions.js';
import {higherEvent,scoreMission} from '../src/sim/company/missionFeatures.js';
import {basicValue} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
const fresh=()=>createMission(keepUpTheFire,'closure');
const enemy=(s,extra={})=>s.units.secret={...structuredClone(s.units.s11),id:'secret',name:'Secret enemy',faction:'enemy',location:'r2c2',steps:[{id:'secret_step',personnel:[]}],assets:{},radios:[],contact_type:'B',named:false,...extra};
const force=(s,n,result)=>{const card=Object.values(cards).find(c=>c.random[n-2]===result);s.deck.order=[card.id,...s.deck.order.filter(id=>id!==card.id)];};
it('replaces isolated units with their original contact letter once without leaking identities',()=>{
 const s=fresh();s.contacts.pc_r2c2.resolved=true;enemy(s);const copy=structuredClone(s);enemyActivity(s);enemyActivity(copy);expect(s).toEqual(copy);
 expect(s.units.secret.removed).toBe('HIDDEN');expect(Object.values(s.contacts).filter(c=>c.location==='r2c2'&&!c.resolved).map(c=>c.type)).toEqual(['B']);
 expect(JSON.stringify(getVisibleEvents(s))).not.toContain('Secret enemy');expect(getPlayerView(s).enemies?.some(u=>u.id==='secret')??false).toBe(false);
 enemy(s,{id:'another'});enemyActivity(s);expect(Object.values(s.contacts).filter(c=>c.location==='r2c2'&&!c.resolved)).toHaveLength(1);
});
it('Litter Teams take local casualties when falling back and seek casualties before rallying',()=>{
 for(const adjacent of [false,true]){const s=fresh(),u=enemy(s,{kind:'LAT',cohesion:'L',location:'r1c2'});
 s.casualties=[{id:'w',step:{id:'w_step',personnel:[]},faction:'enemy',location:adjacent?'r2c2':u.location,cover:null,carrier:null,evacuated:false}];
 force(s,3,2);enemyActivity(s);expect(u.cohesion).toBe('L');expect(s.events.find(e=>e.type==='ENEMY_ACTIVITY'&&e.actor===u.id).action).toBe(adjacent?'SEEK_CASUALTY':'EVACUATE');
 expect(u.location).not.toBe('r1c2');if(!adjacent)expect(s.casualties[0]).toMatchObject({carrier:u.id,location:u.location,transported:true});}
});
it('captures casualties on empty cleared cards once while PCs and live enemies block capture',()=>{
 const s=fresh();s.casualties=['r1c1','r1c2','r2c2'].map((location,i)=>({id:`w${i}`,step:{id:`hidden_step_${i}`,personnel:[]},location,faction:'enemy',evacuated:false}));s.contacts.pc_r1c1.resolved=true;s.contacts.pc_r2c2.resolved=true;enemy(s);
 capture(s);scoreMission(s);capture(s);scoreMission(s);expect(s.casualties.map(c=>c.evacuated)).toEqual([true,false,false]);expect(s.achievements.filter(a=>a.key.startsWith('enemy_casualty'))).toHaveLength(1);expect(JSON.stringify(getVisibleEvents(s))).not.toContain('hidden_step');
});
it('records the selected guard remainder and preserves its load and returning guard experience',()=>{
 const s=fresh();s.phase='CAPTURE';s.units.s11.location='r2c2';s.units.s11.steps.length=2;s.units.s11.assets={wp:1};enemy(s,{cohesion:'P'});
 const r=advancePhase(s,{friendlyRemainder:'A'});expect(r.state.replay.at(-1)).toEqual({op:'advancePhase',options:{friendlyRemainder:'A'}});
 const child=Object.values(r.state.units).find(u=>u.kind==='LAT'&&u.faction==='friendly');expect(child).toMatchObject({cohesion:'A',assets:{wp:1}});expect(r.state.prisoners[0]).toMatchObject({guard_origin:'s11',guard_experience:'Line'});
 expect(advancePhase(s,{friendlyRemainder:'INVALID'}).state).toBe(s);
 let valid=fresh();for(let i=0;i<100&&valid.phase!=='CAPTURE';i++){const v=getPlayerView(valid);valid=!valid.impulse&&v.eligible_hqs.length?selectHQ(valid,v.eligible_hqs[0]).state:advancePhase(valid).state;}expect(valid.phase).toBe('CAPTURE');valid=advancePhase(valid,{friendlyRemainder:'A'}).state;expect(replayMission(keepUpTheFire,exportReplay(valid))).toEqual(valid);
});
it('bunker occupants cannot make a point-blank free grenade response from inside cover',()=>{
 const s=fresh(),u=s.units.s11;u.location='r2c2';const e=enemy(s,{cover:'b',kind:'HMG',named:true});s.locations.r2c2.covers.push({id:'b',type:'Bunker',value:3,capacity:2,arc:[-1,0]});
 grenade(s,u,e);expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT')).toHaveLength(1);expect(e.cover).toBe('b');expect(e.exposed).toBe(false);
});
it('enemy named weapon counters retain their correct Fire Team side and dropped loads on total loss',()=>{
 for(const kind of ['HMG','SNIPER','SPOTTER']){const profile=keepUpTheFire.enemy_counters.find(c=>c.kind===kind);const s=fresh(),u=enemy(s,{...profile,id:'secret',steps:[{id:'secret_step',personnel:[]}],named:true,assets:{wp:1}});applyHit(s,u,'A');expect(u.cohesion).toBe('F');expect(basicValue(u)).toBe(2);u.pinned=false;expect(basicValue(u)).toBe(kind==='HMG'?-1:0);applyHit(s,u,'C');expect(s.assets.some(a=>a.key==='wp')).toBe(true);expect(JSON.stringify(getVisibleEvents(s))).not.toContain('secret_step');}
});
it('higher-HQ withdrawal drops equipment and casualties without exposing the hidden actor',()=>{
 const s=fresh();s.turn=2;const u=enemy(s,{cohesion:'P',assets:{wp:1},radios:['ENEMY']});s.casualties=[{id:'w',step:{id:'wstep',personnel:[]},faction:'enemy',carrier:u.id,location:u.location,cover:null}];
 const roll=Object.values(cards).find(c=>c.random[8]===10),check=Object.values(cards).find(c=>c.hq&&c.id!==roll.id);s.deck.order=[check.id,roll.id,...s.deck.order.filter(id=>id!==check.id&&id!==roll.id)];higherEvent(s,'enemy');
 expect(u.removed).toBe('WITHDRAWN');expect(s.casualties[0].carrier).toBeNull();expect(s.assets.map(a=>a.type)).toEqual(['RADIO','EQUIPMENT']);expect(JSON.stringify(getVisibleEvents(s))).not.toContain('Secret enemy');
});
import {prepareCombat,resolvePreparedCombat} from '../src/sim/company/combat.js';
it('keeps sniper identity out of prepared combat, visible resolution events and player projections',()=>{
 const s=fresh();s.units.s11.location='r1c1';const u=enemy(s,{kind:'SNIPER',named:true,vof:'S!',location:'r1c2',fire:'r1c1'});
 s.fire=[{source:u.id,origin:u.location,target:'r1c1',value:0}];prepareCombat(s);s.phase='COMBAT_EFFECTS';s.segment_progress={phase:s.phase,index:0,status:'pending'};
 const publicBefore=JSON.stringify(getPlayerView(s));expect(publicBefore).not.toContain('Secret enemy');expect(publicBefore).not.toContain('"secret"');
 resolvePreparedCombat(s,s.pending_combat[0].id);expect(JSON.stringify(getVisibleEvents(s))).not.toContain('Secret enemy');expect(JSON.stringify(getVisibleEvents(s))).not.toContain('"secret"');
});
it('uses the out-of-ammo fallback row before the isolated-unit removal row',()=>{
 const s=fresh(),u=enemy(s,{kind:'HMG',vof:'A',tripod:true,named:true,out_of_ammo:true});force(s,2,2);enemyActivity(s);
 expect(s.events.find(e=>e.type==='ENEMY_ACTIVITY'&&e.actor===u.id).action).toBe('FALL_BACK');expect(u.removed).toBeNull();expect(u.location).not.toBe('r2c2');
});
