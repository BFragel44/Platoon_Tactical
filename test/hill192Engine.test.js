import {describe,it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {hill192Content as content} from '../src/scenarios/hill192Content.js';
import {createMission,exportReplay,replayMission,eligibleHQs,advancePhase,submitCommand,selectHQ} from '../src/sim/company/engine.js';
import {exportScoutedBattlefield} from '../src/sim/company/battlefieldCarryover.js';
import {eligibleEngineer,markEngineerPath} from '../src/sim/company/engineers.js';
import {supportRequest,checkMines} from '../src/sim/company/missionFeatures.js';
import {commandOptions} from '../src/sim/company/actions.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {packageAvailable,placePackage} from '../src/sim/company/missionContacts.js';
import {validateNormandyContent} from '../src/sim/company/normandyContent.js';
import {cards} from '../src/sim/company/core.js';
// Synthetic execution harness: verified Cerisy profiles, not a claim of complete M4 packages.
const fixture={...structuredClone(cerisy),id:'hill192_test',map:{...cerisy.map,columns:5,rows:4,staging:false},units:cerisy.units.map(u=>({...structuredClone(u),location:`r1c${u.platoon??(['HQ','STAFF','FO'].includes(u.kind)?2:4)}`,...(u.id==='s11'?{capabilities:{engineer:true}}:{})})),objectives:{primary:'r4c2',secondary:'r4c3',attack:'r3c2',ccp:'r1c2',clear_rows:[2,3]},contact_rows:content.contact_rows,rules:{...cerisy.rules,hill192:true,tactics:'deliberate_defense',enemy_spotters:content.enemy_spotters,enemy_late_start:6,enemy_event_tables:content.enemy_event_tables,counterattack_table:content.counterattack_table},support_agencies:Object.fromEntries(Object.entries(content.support).map(([id,a])=>[id,{...cerisy.support_agencies[id],...structuredClone(a)}]))};
const source=()=>{const s=createMission(stGeorges,'scouted-fixture');s.status='SUCCESS';s.patrol_history=[1,2,3].map(platoon=>({platoon,outcome:'SUCCESS'}));s.locations.r2c2.mines=true;s.locations.r2c2.covers.push({id:'cover_999',type:'Trench',value:2,known:true,discovered:true,enemy_original:true});s.events.push({type:'MINEFIELD_FOUND',location:'r2c2'});return exportScoutedBattlefield(s);};
const fresh=()=>createMission(fixture,'hill-engine');
const stack=(s,predicate,n=4)=>{const c=Object.values(cards).find(predicate);s.deck.order=Array(n).fill(c.id).concat(s.deck.order);};
describe('Hill 192 special-rule execution integration',()=>{
 it('loads immutable terrain, cover and mines with fresh mission state and exact replay',()=>{const b=source(),before=structuredClone(b),s=createMission(fixture,'imported',{battlefield:b,forward_defense:'r2c3'});expect(s.locations.r2c2.covers.some(c=>c.id==='cover_999')).toBe(true);expect(s.locations.r2c2.mines).toBe(true);expect(s.engineers_available).toBe(true);expect(s.next_id).toBeGreaterThan(999);expect(s.patrol).toBeUndefined();expect(s.visibility).toBeUndefined();expect(s.support_inventory.artillery.TOT).toBe(1);expect(b).toEqual(before);expect(replayMission(fixture,exportReplay(s))).toEqual(s);});
 it('does not duplicate retained Row-1 foxholes',()=>{const s=createMission(fixture,'imported',{battlefield:source()});expect(s.locations.r1c1.covers.filter(c=>c.type==='Foxholes')).toHaveLength(2);});
 it('allows reserves without impulses and contacts on occupied Row 1',()=>{const s=createMission(fixture,'reserve',{positions:{hq2:'RESERVE',s21:'RESERVE',s22:'RESERVE',s23:'RESERVE'}});expect(s.units.hq2.removed).toBe('RESERVE');s.phase='PLATOON_INITIATIVE';expect(eligibleHQs(s)).not.toContain('hq2');expect(s.contacts.pc_r1c1.type).toBe('C');});
 it('accepts only one forward platoon and no forward reserve resurrection',()=>{expect(()=>createMission(fixture,'bad',{forward_defense:'r2c2',positions:{s11:'r2c2',s21:'r2c2'}})).toThrow('one platoon');const s=createMission(fixture,'good',{forward_defense:'r2c2',positions:{s11:'r2c2'}});expect(s.locations.r2c2.covers.filter(c=>c.type==='Foxholes')).toHaveLength(2);});
 it('keeps battlefield controls out of existing missions',()=>expect(()=>createMission(cerisy,'bad',{battlefield:source()})).toThrow('does not accept'));
 it('implements separate TOT stock/modifier and CO caller draw',()=>{const s=fresh(),u=s.units.co;s.registered_targets={};stack(s,c=>c.burst&&!c.short&&!c.multi);supportRequest(s,u,'artillery','TOT','r4c2');expect(s.support_inventory.artillery).toEqual({HE:4,WP:1,TOT:0});expect(s.support.at(-1)).toMatchObject({value:-7,ammo:'TOT',status:'PENDING'});expect(s.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(1);expect(()=>supportRequest(s,u,'artillery','TOT','r4c2')).toThrow('no TOT');});
 it('retains stock on failed TOT calls',()=>{const s=fresh();s.registered_targets={};stack(s,c=>!c.burst&&!c.short);supportRequest(s,s.units.co,'artillery','TOT','r4c2');expect(s.support_inventory.artillery.TOT).toBe(1);expect(s.support).toHaveLength(0);});
 it('places only PC A on qualified occupied cards with inclusive timing',()=>{const s=fresh();s.turn=3;s.contacts={pc:{id:'pc',type:'B',location:'r3c3',resolved:false,revealed:false}};s.units.s11.location='r2c2';s.units.s12.location='r4c1';const check=Object.values(cards).find(c=>c.hq),roll=Object.values(cards).find(c=>c.random[8]===9);s.deck.order=[check.id,roll.id,...s.deck.order];resolveNormandyEvent(s,'enemy');const placed=Object.values(s.contacts).filter(pc=>pc.counterattack);expect(placed.map(pc=>pc.location).sort()).toEqual(['r2c2','r4c1']);expect(placed.every(pc=>pc.type==='A'&&!pc.revealed)).toBe(true);expect(s.enemy_tactics).toBe('offensive_assault');expect(s.counterattack_ends_after).toBe(5);});
 it('redraws a mine package without changing an existing minefield',()=>{const s=fresh();s.locations.r2c2.mines=true;const before=structuredClone(s);expect(packageAvailable(s,{location:'r2c2'},{mines:true,units:[]})).toBe(false);expect(s).toEqual(before);});
 for(const success of [true,false])for(const hit of [true,false])it(`checks engineer path success ${success}/mine hit ${hit}`,()=>{const s=fresh(),u=s.units.s11;u.capabilities={engineer:true};s.locations[u.location].mines=true;stack(s,c=>hit?c.burst:!c.burst&&!c.short);const exposed=u.exposed;expect(markEngineerPath(s,u,success)).toBe(success&&!hit);expect(s.locations[u.location].mines).toBe(!(success&&!hit));expect(s.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(success?1:3);expect(u.exposed).toBe(exposed);});
 it('reduces new-package mine detection only for eligible engineers',()=>{const s=fresh(),u=s.units.s11;u.capabilities={engineer:true};s.locations[u.location].mines=true;stack(s,c=>!c.burst&&!c.short,8);checkMines(s,u,{discovery:true});expect(s.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(1);checkMines(s,u);expect(s.events.findLast(e=>e.type==='CARDS_DRAWN').card_ids).toHaveLength(3);u.steps.splice(1);expect(eligibleEngineer(u)).toBe(false);expect(()=>markEngineerPath(s,u,true)).toThrow('two- or three-step');});
 it('replays a real engineer path order without synthetic phase or card mutations',()=>{let s=createMission(fixture,'engineer-order',{battlefield:source(),forward_defense:'r2c2',positions:{s11:'r2c2',hq1:'r2c2'}});for(let i=0;i<7;i++)s=advancePhase(s).state;s=selectHQ(s,'hq1').state;const r=submitCommand(s,{type:'CLEAR_MINE_PATH',unit_id:'s11',issuer_id:'hq1'});expect(r.accepted,r.reason).toBe(true);expect(r.state.events.some(e=>e.type==='ENGINEER_PATH_ATTEMPT')).toBe(true);expect(replayMission(fixture,exportReplay(r.state))).toEqual(r.state);});
 it('does not offer TOT in accepted missions without stock',()=>{const s=createMission(cerisy,'no-tot');expect(commandOptions(s,s.units.co,'co').some(o=>o.type==='CALL_ARTILLERY_TOT')).toBe(false);});
});

// Package-1 R#9 branches use the actual placement pipeline and finite counter pool.
describe('Hill 192 mine follow-up',()=>{
 for(const [number,kind] of [[1,null],[4,'HMG'],[7,'SNIPER']])it(`resolves R#9 ${number} without changing the authored package`,()=>{
  const s=fresh(),pc={location:'r1c1',type:'C'},p=content.packages[1],before=structuredClone(p);
  s.units.s11.location=pc.location;
  // Keep every ray open so this fixture isolates the printed follow-up draw.
  for(const l of Object.values(s.locations)){l.terrain='field';l.elevation=0;l.hill=false;l.borders={};l.building=false;}
  for(const u of Object.values(s.units))if(u.location!==pc.location)u.removed='RESERVE';
  stack(s,c=>c.random[7]===number,1);
  expect(placePackage(s,pc,p)).toBe(true);
  expect(s.locations[pc.location].mines).toBe(true);
  const enemies=Object.values(s.units).filter(u=>u.faction==='enemy');
  expect(enemies.map(u=>u.kind)).toEqual(kind?[kind]:[]);
  if(kind)expect(s.locations[enemies[0].location].covers.find(c=>c.id===enemies[0].cover).type).toBe(kind==='HMG'?'Foxholes':'Cover');
  expect(p).toEqual(before);
 });
 it('rejects an exhausted drawn follow-up before setting mines or checking occupants',()=>{
  const s=fresh(),pc={location:'r1c1',type:'C'};
  s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.kind!=='HMG');
  const units=structuredClone(s.units);stack(s,c=>c.random[7]===4,1);
  expect(packageAvailable(s,pc,content.packages[1])).toBe(true); // Mines-only remains legal.
  expect(placePackage(s,pc,content.packages[1])).toBe(false);
  expect(s.locations[pc.location].mines).toBeFalsy();expect(s.units).toEqual(units);
  expect(s.events.some(e=>e.type==='MINEFIELD_FOUND')).toBe(false);
 });
});

describe('Hill 192 agency-specific enemy spotter resources',()=>{
 for(const [agency,missions,draws,value] of [['artillery',2,2,-4],['mortar',3,4,-3]])it(`assigns ${agency} limits and spends the incoming first mission`,()=>{
  const s=fresh(),pc={location:'r1c1',type:'C'};
  for(const l of Object.values(s.locations)){l.terrain='field';l.elevation=0;l.hill=false;l.borders={};l.building=false;}
  for(const u of Object.values(s.units))if(u.location!==pc.location)u.removed='RESERVE';
  expect(placePackage(s,pc,{incoming:value,incoming_agency:`enemy_${agency}`,units:[{kind:'SPOTTER',cover:'Trench'}]})).toBe(true);
  const u=Object.values(s.units).find(u=>u.faction==='enemy');
  expect(u).toMatchObject({spotter_agency:`enemy_${agency}`,missions_remaining:missions-1,subsequent_draws:draws,calls_made:1});
  expect(u.initial_resources.missions).toBe(missions);
  expect(s.support.at(-1)).toMatchObject({agency:`enemy_${agency}`,value,status:'ACTIVE'});
 });
});

describe('mine follow-up content validation',()=>{
 const definition=()=>({...structuredClone(fixture),packages:{...structuredClone(fixture.packages),1:structuredClone(content.packages[1])}});
 it('validates every follow-up profile rather than only the empty base package',()=>{const d=definition();expect(()=>validateNormandyContent(d)).not.toThrow();d.packages[1].mine_followup.branches[1].units[0].kind='UNSUPPORTED';expect(()=>validateNormandyContent(d)).toThrow('Unsupported Normandy package 1');});
 it('rejects overlapping or incomplete follow-up draw slots',()=>{const d=definition();d.packages[1].mine_followup.branches[1].numbers=[3,5,6];expect(()=>validateNormandyContent(d)).toThrow('mine follow-up');});
});
