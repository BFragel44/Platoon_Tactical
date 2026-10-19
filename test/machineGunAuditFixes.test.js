import {it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {refresh,spot,combatExposure,overheadAllowed} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
function flat(def=trevieres){
 const s=createMission(def,'mg-fixes');s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};
 for(const l of Object.values(s.locations))if(!l.staging)Object.assign(l,{terrain:'fields',elevation:1,borders:borders(DIRECTIONS),covers:[],known:true});
 const parked=Object.values(s.locations).find(l=>l.staging)?.id??'r1c5';for(const u of Object.values(s.units))Object.assign(u,{location:parked,cover:null,fire:null,indirect:null});return s;
}
function target(s,location='r3c2',faction='enemy',id='target'){
 const t={...structuredClone(s.units.s12),id,faction,location,cover:null,vof:null};s.units[id]=t;spot(s,t);return t;
}
function upper(s,u){s.locations[u.location].covers.push({id:`upper-${u.id}`,type:'Upper Story',elevation:1,value:2,known:true});u.cover=`upper-${u.id}`;}
for(const faction of ['friendly','enemy'])for(const weapon of ['tripod','heavy','rifle'])for(const geometry of ['clear lower friend','upper friend blocks','upper enemy permits','mixed friends block']){
 it(`${faction} ${weapon}: ${geometry}`,()=>{
  const s=flat(),u=s.units.hmg50;Object.assign(u,{location:'r1c2',faction,vof:weapon==='heavy'?'H':weapon==='rifle'?'S':'A+',tripod:weapon==='tripod'});spot(s,u);
  const friend=s.units.s11;Object.assign(friend,{location:'r2c2',faction});const t=target(s,'r3c2',faction==='friendly'?'enemy':'friendly');
  if(geometry==='upper enemy permits')upper(s,t);else{s.locations.r1c2.elevation=s.locations.r3c2.elevation=2;if(geometry!=='clear lower friend')upper(s,friend);}
  if(geometry==='mixed friends block'){const other=s.units.s13;Object.assign(other,{location:friend.location,cover:null,faction});}
  refresh(s);const allowed=weapon!=='rifle'&&['clear lower friend','upper enemy permits'].includes(geometry);
  expect(u.fire===t.location).toBe(allowed);
  const fires=s.fire.filter(f=>f.source===u.id);expect(fires.some(f=>f.target===friend.location)).toBe(false);
  if(allowed){expect(fires.some(f=>f.target===t.location)).toBe(true);expect(combatExposure(s,friend)?.sources.some(f=>f.source_id===u.id)??false).toBe(false);}
 });
}
it('does not use an unspotted upper-story enemy to justify firing over a friendly unit',()=>{
 const s=flat(),u=s.units.hmg50;u.location='r1c2';s.units.s11.location='r2c2';const hidden=target(s,'r3c2','enemy','hidden');upper(s,hidden);delete s.knowledge.spotted.hidden;
 expect(overheadAllowed(s,u,hidden.location,'r2c2')).toBe(false);refresh(s);expect(u.fire).toBeNull();expect(s.knowledge.spotted.hidden).toBeUndefined();
});
it('retains closest-enemy priority and permits an explicit shift over lower enemies',()=>{
 const s=flat(),u=s.units.hmg50;u.location='r1c2';s.locations.r1c2.elevation=s.locations.r3c2.elevation=2;
 const near=target(s,'r2c2','enemy','near'),far=target(s,'r3c2','enemy','far');refresh(s);expect(u.fire).toBe(near.location);
 const r=submitCommand(s,{type:'SHIFT_FIRE',unit_id:u.id,target_id:far.location});expect(r.accepted,r.reason).toBe(true);
 const fires=r.state.fire.filter(f=>f.source===u.id);expect(fires.map(f=>f.target)).toEqual([far.location]);
});
it('does not let colocated rifles inherit an HMG upper-story overhead path',()=>{
 const s=flat(),u=s.units.hmg50;u.location='r1c2';s.units.s11.location='r2c2';const t=target(s);upper(s,t);s.units.s13.location=u.location;
 refresh(s);refresh(s);expect(u.fire).toBe(t.location);expect(s.units.s13.fire).toBeNull();
});
it('smoke still blocks a legal upper-story overhead path',()=>{
 const s=flat(),u=s.units.hmg50;u.location='r1c2';s.units.s11.location='r2c2';const t=target(s);upper(s,t);s.locations.r2c2.smoke=true;refresh(s);expect(u.fire).toBeNull();
});
it('aiming at a spotted upper story still places Basic VOF on all occupants of the target card',()=>{
 const s=flat(),u=s.units.hmg50;u.location='r1c2';s.units.s11.location='r2c2';const high=target(s),ground=target(s,'r3c2','enemy','ground');upper(s,high);
 refresh(s);expect(u.fire).toBe(high.location);expect(combatExposure(s,ground).sources.some(f=>f.source_id===u.id)).toBe(true);
});
it('a platoon concentration includes its attached A+ HMG',()=>{
 const s=flat(stGeorges),u=s.units.hmg1;u.location='r1c1';u.platoon=1;Object.assign(s.units.hq1,{location:u.location,cover:null});const t=target(s,'r2c1');u.fire=t.location;
 const hit=Object.values(cards).find(c=>c.spot&&!c.jam&&c.id!==51);s.deck.order=[...Array(3).fill(hit.id),...s.deck.order];
 const r=submitCommand(s,{type:'PLATOON_CONCENTRATE',unit_id:'hq1',issuer_id:'hq1',target_id:t.id});expect(r.accepted,r.reason).toBe(true);
 expect(r.state.events.some(e=>e.type==='CONCENTRATE_ATTEMPT'&&e.actor===u.id)).toBe(true);expect(r.state.units[u.id].ammo.MG).toBe(u.ammo.MG-1);
});
for(const success of [true,false])it(`authored A+ HMG concentration success=${success} gets tripod draw and correct ammo cost`,()=>{
 const s=flat(stGeorges),u=s.units.hmg1;u.location='r1c1';const t=target(s,'r2c1');u.fire=t.location;
 const c=Object.values(cards).find(c=>c.id!==51&&!!c.spot===success&&!c.jam);s.deck.order=[...Array(3).fill(c.id),...s.deck.order];const before=u.ammo.MG;
 const r=submitCommand(s,{type:'CONCENTRATE',unit_id:u.id,target_id:t.id});expect(r.accepted,r.reason).toBe(true);
 expect(r.state.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(3);expect(r.state.units[u.id].ammo.MG).toBe(before-(success?1:0));
 expect(r.state.markers.some(m=>m.type==='CONCENTRATE'&&m.source===u.id)).toBe(success);
});
it('A+ HMG jam negates successful draws and replaces the weapon with a generic Fire Team',()=>{
 const s=flat(stGeorges),u=s.units.hmg1;u.location='r1c1';const t=target(s,'r2c1');u.fire=t.location;
 const hit=Object.values(cards).find(c=>c.spot&&!c.jam&&c.id!==51),jam=Object.values(cards).find(c=>c.jam&&c.id!==51);s.deck.order=[hit.id,hit.id,jam.id,...s.deck.order];
 const r=submitCommand(s,{type:'CONCENTRATE',unit_id:u.id,target_id:t.id});expect(r.accepted,r.reason).toBe(true);expect(r.state.units[u.id].removed).toBe('JAMMED');
 expect(r.state.units[u.id].steps).toHaveLength(0);expect(Object.values(r.state.units).some(v=>v.kind==='LAT'&&v.cohesion==='F'&&v.location===u.location)).toBe(true);
 expect(r.state.markers.some(m=>m.type==='CONCENTRATE'&&m.source===u.id)).toBe(false);
});
it.each(['pinned','exposed','insufficient ammo'])('A+ HMG still rejects concentration when %s',condition=>{
 const s=flat(stGeorges),u=s.units.hmg1;u.location='r1c1';const t=target(s,'r2c1');u.fire=t.location;
 if(condition==='pinned')u.pinned=true;if(condition==='exposed')u.exposed=true;if(condition==='insufficient ammo')u.ammo.MG=1;refresh(s);
 const before=structuredClone(s),r=submitCommand(s,{type:'CONCENTRATE',unit_id:u.id,target_id:t.id});expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
});
