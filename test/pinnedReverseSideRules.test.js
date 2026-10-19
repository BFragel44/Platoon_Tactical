import {it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {splitTeam,grenade,orderReason} from '../src/sim/company/actions.js';
import {spot,canFire} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
function fresh(){const s=createMission(trevieres,'pinned-rules');s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};s.units.s11.location='r1c1';s.units.s11.cover=null;return s;}
function team(s,cohesion,pinned=false){const donor=s.units.s12;donor.location='r1c1';donor.cover=null;const u=splitTeam(s,donor,cohesion,donor.steps.pop());u.pinned=pinned;return u;}
function stack(s,predicate){const c=Object.values(cards).find(predicate);s.deck.order=[...Array(12).fill(c.id),...s.deck.order];}
for(const faction of ['friendly','enemy'])for(const cohesion of ['GOOD','A','F','L','P'])for(const pinned of [false,true])for(const success of [false,true]){
 it(`${faction} ${cohesion}, pinned=${pinned}, attack success=${success}: only armed eligible sides return grenades`,()=>{
  const s=fresh(),defender=team(s,cohesion,pinned),attacker=s.units.s11;defender.faction=faction;attacker.faction=faction==='friendly'?'enemy':'friendly';spot(s,defender);spot(s,attacker);
  stack(s,c=>!!c.grenade===success);grenade(s,attacker,defender);
  expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT'&&e.actor===defender.id)).toHaveLength(!pinned&&(cohesion==='GOOD'||success&&['A','F'].includes(cohesion))?1:0);
  if(['L','P'].includes(cohesion))expect(canFire(s,defender,attacker.location)).toBe(false);
 });
}
it('does not let a friendly team return fire against an unspotted attacker',()=>{
 const s=fresh(),u=team(s,'F');s.units.s11.faction='enemy';stack(s,c=>c.grenade);grenade(s,s.units.s11,u);
 expect(s.events.some(e=>e.type==='GRENADE_ATTEMPT'&&e.actor===u.id)).toBe(false);
});
it.each(['HQ','FO'])('an unarmed %s side does not return grenades, but its named Fire Team side can',kind=>{
 for(const cohesion of ['GOOD','F']){
  const s=fresh(),u=team(s,cohesion);u.kind=kind;u.named=true;u.vof=null;u.fire_team_vof='S';u.faction='enemy';spot(s,u);
  stack(s,c=>c.grenade);grenade(s,s.units.s11,u);
  expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT'&&e.actor===u.id)).toHaveLength(cohesion==='F'?1:0);
 }
});
it('only armed unpinned occupants of an attacked cover stack respond',()=>{
 const s=fresh(),defenders=['GOOD','A','F','L','P'].map(c=>team(s,c));
 s.locations.r1c1.covers=[{id:'stack',type:'Cover',value:1,known:true}];
 for(const u of defenders){u.faction='enemy';u.cover='stack';spot(s,u);}
 stack(s,c=>c.grenade);grenade(s,s.units.s11,defenders[0]);
 expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT'&&defenders.some(u=>u.id===e.actor)).map(e=>e.actor).sort()).toEqual(defenders.slice(0,3).map(u=>u.id).sort());
});
it.each(['SEEK_COVER','ENTER_COVER'])('pinned Paralyzed Team can %s but stays pinned and Paralyzed',type=>{
 const s=fresh(),u=team(s,'P',true);s.locations[u.location].covers=type==='ENTER_COVER'?[{id:'cover',type:'Cover',value:1,known:true,discovered:true}]:[];
 stack(s,c=>c.word.toLowerCase()==='cover');const r=submitCommand(s,{type,unit_id:u.id,...(type==='ENTER_COVER'?{target_id:'cover'}:{})});
 expect(r.accepted,r.reason).toBe(true);expect(r.state.units[u.id]).toMatchObject({pinned:true,cohesion:'P',exposed:true});expect(r.state.units[u.id].cover).toBeTruthy();
 expect(r.state.impulse.commands).toBe(s.impulse.commands-1);
});
it.each(['INFILTRATE','INFILTRATE_WITHIN','SPOT','GRENADE','PICKUP_RADIO','RECOVER'])('pinned Paralyzed Team still cannot %s',type=>{
 const s=fresh(),u=team(s,'P',true);const before=structuredClone(s),r=submitCommand(s,{type,unit_id:u.id,target_id:'r1c2'});
 expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
});
it.each(['SEEK_COVER','ENTER_COVER'])('unpinned Paralyzed Team still cannot %s',type=>{
 const s=fresh(),u=team(s,'P');expect(orderReason(s,{type,unit_id:u.id,target_id:'open'})).toMatch(/paralyzed/);
});
for(const cohesion of ['A','F','L','P'])for(const pinned of [false,true])it(`${cohesion} pinned=${pinned} switches networks once, paying one command`,()=>{
 const s=fresh(),u=team(s,cohesion,pinned);u.radios=['BN'];s.assets.push({id:'lost',type:'RADIO',net:'MTR',destroyed:true,faction:'friendly',location:u.location});
 const r=submitCommand(s,{type:'SWITCH_NETWORK',unit_id:u.id,target_id:'BN → MTR'});expect(r.accepted,r.reason).toBe(true);
 expect(r.state.units[u.id]).toMatchObject({radios:['MTR'],cohesion,pinned});expect(r.state.assets.find(a=>a.id==='lost').net).toBe('BN');expect(r.state.impulse.commands).toBe(5);
 const again=submitCommand(r.state,{type:'SWITCH_NETWORK',unit_id:u.id,target_id:'MTR → BN'});expect(again.accepted).toBe(false);expect(again.state).toEqual(r.state);
});
it.each(['wrong hardware','intact device','no carried radio','no commands','no voice contact'])('network switching still rejects %s without changes',kind=>{
 const s=fresh(),u=team(s,'P',true);u.radios=['BN'];s.assets.push({id:'lost',type:'RADIO',net:kind==='wrong hardware'?'CO':'MTR',destroyed:kind!=='intact device',faction:'friendly',location:u.location});
 if(kind==='no carried radio')u.radios=[];if(kind==='no commands')s.impulse.commands=0;
 const command={type:'SWITCH_NETWORK',unit_id:u.id,target_id:`BN → ${kind==='wrong hardware'?'CO':'MTR'}`};
 if(kind==='no voice contact'){s.impulse.hq='co';command.issuer_id='co';s.units.co.location=u.location;u.cover=null;s.units.co.cover=null;}
 const before=structuredClone(s),r=submitCommand(s,command);expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
});
