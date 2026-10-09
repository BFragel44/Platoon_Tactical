import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {stGermain} from '../src/scenarios/stGermain.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission,advancePhase,resolveSupportChoice,replayMission} from '../src/sim/company/engine.js';
import {placePackage,contactDirection,resolveMissionContact} from '../src/sim/company/missionContacts.js';
import {supportRequest,discoveredCover} from '../src/sim/company/missionFeatures.js';
import {applyHit,enemyActivity,prepareCombat} from '../src/sim/company/combat.js';
import {orderReason,rally,grenade,concentrate} from '../src/sim/company/actions.js';
import {dropExcessAmmunition,pickUpAmmunition,expendAmmunition} from '../src/sim/company/ammunition.js';
import {coverOf,canFire,vofOf,combatExposure,spot} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
const candidate={...stGermain,readiness:{playable:true}};
const fresh=()=>createMission(candidate,'m5-source-audit');
const flat=()=>{const s=fresh();s.visibility.light=0;for(const l of Object.values(s.locations))Object.assign(l,{terrain:'open',building:false,elevation:1,borders:borders(DIRECTIONS)});for(const u of Object.values(s.units))if(u.id!=='s11')u.removed='RESERVE';s.units.s11.location='r2c2';s.units.s11.cover=null;return s;};
const enemies=s=>Object.values(s.units).filter(u=>u.faction==='enemy'&&u.steps.length&&!u.removed);
const stack=(s,p,n=80)=>s.deck.order.unshift(...Array(n).fill(Object.values(cards).find(c=>c.id!==51&&p(c)).id));
const roll=(s,n,sides)=>stack(s,c=>c.random[sides-2]===n,1);

describe('M5 visually audited campaign pp.12–15,32–35,47–48 and player aids',()=>{
 it('matches the standalone infantry strength, experience and equipment baseline',()=>{
  const s=fresh();for(const p of [1,2,3]){expect(s.units[`hq${p}`]).toMatchObject({experience:'Green',radios:['CO']});for(const n of [1,2,3]){const u=s.units[`s${p}${n}`];expect(u.steps).toHaveLength(3);expect(u.experience).toBe('Line');}}
  expect(s.units.co).toMatchObject({experience:'Green',radios:['BN','CO']});expect(s.units.staff.experience).toBe('Veteran');expect(s.units.xo.experience).toBe('Green');
  expect(s.units.mortar_section.steps).toHaveLength(3);expect(s.units.mortar_section.ammo.MTR).toBe(4);
  expect(s.units.artyfo.radios).toEqual(['ARTY']);expect(s.units.mtrfo.radios).toEqual(['MTR']);
  expect(Object.values(s.units).reduce((n,u)=>n+(u.assets.illum??0),0)).toBe(8);expect(s.runners).toHaveLength(0);
 });
 for(let n=1;n<=8;n++)it(`R#8 placement direction ${n}`,()=>{const s=flat();roll(s,n,8);expect(contactDirection(s,s.locations.r2c2)).toBe(n<=4?0:n<=6?-1:1);});
 for(const [number,sides,values]of [[3,10,[1,2,3,10]],[8,10,[1,2,3,10]],[10,5,[1,2,3,4,5]]])for(const n of values)it(`package ${number} placement boundary ${n}/${sides}`,()=>{
  const s=flat();roll(s,n,sides);expect(placePackage(s,s.contacts.pc_r2c2,candidate.packages[number])).toBe(true);
  for(const u of enemies(s).filter(u=>u.kind!=='LEADER')){const l=s.locations[u.location],d=Math.max(Math.abs(l.row-2),Math.abs(l.col-2));if(number===8){if(n<=2)expect(d).toBe(1);else expect(d).toBeGreaterThanOrEqual(1);}else expect(d===0).toBe(n<=(number===10?3:2));}
  if(number===8&&n>2)expect(enemies(s).some(u=>Math.max(Math.abs(s.locations[u.location].row-2),Math.abs(s.locations[u.location].col-2))>1)).toBe(true);
 });
 for(const success of [true,false])it(`Veteran package 11 infiltration ${success?'success':'failure'}`,()=>{const s=flat();stack(s,c=>c.infiltrate===success);expect(placePackage(s,s.contacts.pc_r2c2,candidate.packages[11])).toBe(true);expect(enemies(s)[0].exposed).toBe(!success);expect(s.events.findLast(e=>e.type==='CARDS_DRAWN'&&e.purpose.includes('patrol placement')).card_ids).toHaveLength(3);});
 it('redraws a required-leader package atomically without leaving its squad or Deep Bunker',()=>{
  const s=flat();s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.kind!=='LEADER');s.mission_contacts.tables.A=[10,5];s.mission_contacts.draws[s.activity].A=0;
  const pc={...s.contacts.pc_r2c2,type:'A'},first=Object.values(cards).find(c=>c.random[0]===1),second=Object.values(cards).find(c=>c.random[0]===2);s.deck.order=[first.id,second.id,...s.deck.order];
  resolveMissionContact(s,pc);expect(s.events.some(e=>e.type==='PACKAGE_REJECTED'&&e.package===10)).toBe(true);expect(enemies(s)).toHaveLength(1);expect(enemies(s)[0].steps).toHaveLength(3);expect(Object.values(s.locations).flatMap(l=>l.covers).some(c=>c.type==='Deep Bunker')).toBe(false);
 });
 for(const id of ['fj1','fj2','fj3','fj4','fj5','fj6'])it(`${id} published first/last-step breakdown`,()=>{
  const s=flat();s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id===id);expect(placePackage(s,s.contacts.pc_r2c2,{units:[{kind:'SQUAD'}],no_fire:true})).toBe(true);const u=enemies(s)[0];
  expect(u.steps).toHaveLength(3);expect(u.vof).toBe(id==='fj4'?'S':['fj5','fj6'].includes(id)?'A/S':'A');applyHit(s,u,'F');expect(u.steps).toHaveLength(2);expect(enemies(s).filter(v=>v.kind==='LAT')[0].fire_team_vof).toBeNull();
  roll(s,2,2);applyHit(s,u,'F');const teams=enemies(s).filter(v=>v.kind==='LAT');expect(teams).toHaveLength(3);expect(teams.at(-1).fire_team_vof).toBe(u.vof);if(u.vof!=='A')expect(teams.every(t=>t.ammo.MG===undefined)).toBe(true);
 });
 for(const n of [1,2])it(`A-squad second-step R#2 ${n} divides odd MG stock and resupply entitlement`,()=>{
  const s=flat();s.mission_contacts.counters=s.mission_contacts.counters.filter(c=>c.id==='fj1');placePackage(s,s.contacts.pc_r2c2,{units:[{kind:'SQUAD'}],no_fire:true});const u=enemies(s)[0];applyHit(s,u,'F');u.ammo.MG=5;u.initial_resources.ammo.MG=6;roll(s,n,2);applyHit(s,u,'F');const teams=enemies(s).filter(t=>t.fire_team_vof==='A');expect(teams).toHaveLength(n===1?2:1);expect(teams.reduce((a,t)=>a+t.ammo.MG,0)).toBe(5);expect(teams.reduce((a,t)=>a+t.initial_resources.ammo.MG,0)).toBe(6);
 });
 for(const faction of ['friendly','enemy'])it(`${faction} mortar section breakdown preserves team ammunition`,()=>{
  const s=flat();let u;if(faction==='enemy'){placePackage(s,s.contacts.pc_r2c2,candidate.packages[12]);u=enemies(s).find(u=>u.kind==='MORTAR');}else{u=s.units.mortar_section;u.removed=null;}
  const ammo=u.ammo.MTR;applyHit(s,u,'F');expect(u.steps).toHaveLength(2);applyHit(s,u,'F');const teams=Object.values(s.units).filter(t=>t.kind==='MORTAR'&&t.faction===faction&&t.steps.length===1&&!t.removed);expect(teams).toHaveLength(faction==='enemy'?2:3);expect(teams.every(t=>t.ammo.MTR===ammo)).toBe(true);
  if(faction==='enemy'){expect(teams.every(t=>t.fire_team_vof==='A/S')).toBe(true);const team=teams[0];team.pinned=false;s.fire=[];for(const v of Object.values(s.units))v.fire=null;rally(s,team,team,true);expect(team.cohesion).toBe('GOOD');expect(team.vof).toBe('G');}
 });
 it('enforces Deep Bunker fire, spotting, signals and grenade restrictions',()=>{const s=flat();roll(s,1,5);placePackage(s,s.contacts.pc_r2c2,candidate.packages[10]);for(const u of enemies(s))expect(canFire(s,u,'r2c2')).toBe(false);const u=s.units.co;u.removed=null;u.location='r2c2';u.cover=enemies(s)[0].cover;s.impulse={id:'test',hq:'co',commands:4,spent:0};for(const type of ['SPOT','PYRO_RSP','GRENADE','RIFLE_GRENADE'])expect(orderReason(s,{type,unit_id:'co',issuer_id:'co',target_id:'r2c2'})).toContain('Deep Bunker');});
 it('exits Deep Bunker cover when an enemy point-blank grenade action is drawn',()=>{const s=flat();roll(s,1,5);placePackage(s,s.contacts.pc_r2c2,candidate.packages[10]);stack(s,c=>c.random[1]===3);enemyActivity(s);expect(enemies(s).some(u=>u.cover===null&&u.exposed)).toBe(true);});
 for(const number of [9,10])it(`package ${number} uses the printed +5 bunker protection`,()=>{const s=flat();if(number===10)roll(s,1,5);expect(placePackage(s,s.contacts.pc_r2c2,candidate.packages[number])).toBe(true);const u=enemies(s).find(u=>['Bunker','Deep Bunker'].includes(coverOf(s,u)?.type));expect(coverOf(s,u).value).toBe(5);s.support=[{location:u.location,status:'ACTIVE',value:-4,agency:'enemy_artillery'}];expect(combatExposure(s,u).parts.cover).toBe(5);});
 it('jamming a machine gun removes its weapon capability and preserves surviving steps',()=>{const s=flat();placePackage(s,s.contacts.pc_r2c2,candidate.packages[3]);const u=enemies(s)[0];stack(s,c=>c.jam);concentrate(s,u,s.units.s11);expect(u.removed).toBe('JAMMED');expect(enemies(s).filter(t=>t.kind==='LAT')).toHaveLength(1);});
 it('leaves excess eight-ammo nest rounds behind and limits pickup to six',()=>{const s=flat();placePackage(s,s.contacts.pc_r2c2,candidate.packages[4]);const u=enemies(s).find(u=>u.kind==='HMG');dropExcessAmmunition(s,u);expect(u.ammo.MG).toBe(6);const asset=s.assets.find(a=>a.source_unit===u.id);expect(asset.quantity).toBe(2);expect(()=>pickUpAmmunition(s,u,asset)).toThrow(/capacity/);u.ammo.MG=5;pickUpAmmunition(s,u,asset);expect(u.ammo.MG).toBe(6);expect(asset.quantity).toBe(1);});
 it('depletes finite MG stock without creating a negative balance',()=>{const s=flat();placePackage(s,s.contacts.pc_r2c2,candidate.packages[3]);const u=enemies(s)[0];u.ammo.MG=1;expect(expendAmmunition(s,u,'MG')).toBe(true);expect(u.ammo.MG).toBe(0);expect(u.out_of_ammo).toBe(true);expect(expendAmmunition(s,u,'MG')).toBe(false);expect(u.ammo.MG).toBe(0);});
 for(const terrain of ['village','farm','cemetery','church'])for(let n=1;n<=8;n++)it(`${terrain} cover R#8 ${n} matches CSR 8`,()=>{
  const table={village:[3,3,3,3,2,2,1,1],farm:[3,3,2,2,1,1,1,1],cemetery:[3,2,2,1,1,1,1,1],church:[3,3,3,3,3,3,1,1]};const s=fresh(),l=s.locations.r3c2;l.terrain=terrain;l.building=true;roll(s,n,8);expect(discoveredCover(s,l).value).toBe(table[terrain][n-1]);
 });
 it('expends only the two printed leader rifle-grenade shots',()=>{
  const s=flat();placePackage(s,s.contacts.pc_r2c2,{units:[{kind:'SQUAD',cover:'Foxholes'},{kind:'LEADER',cover:'Foxholes',same_as_previous:true}],no_fire:true});const group=enemies(s),leader=group.find(u=>u.kind==='LEADER'),cover=coverOf(s,group[0]);for(const u of group){u.location='r3c2';u.fire='r2c2';u.hold_fire_until_cleanup=false;u.cover=cover.id;}s.locations.r3c2.covers=[cover];s.units.s11.fire='r3c2';spot(s,leader);stack(s,c=>c.random[0]===2&&c.random[1]===2);for(let i=0;i<3;i++)enemyActivity(s);expect(leader.assets.rifle_grenade).toBe(0);expect(s.events.filter(e=>e.type==='GRENADE_ATTEMPT'&&e.actor===leader.id)).toHaveLength(2);
 });
 for(const steps of [1,3])it(`${steps}-step mortar cannot fire from Woods`,()=>{const s=flat();const u=s.units.mortar_section;u.removed=null;u.location='r1c2';u.cover=null;if(steps===1){u.steps=u.steps.slice(0,1);u.vof='G';}s.locations.r1c2.terrain='woods';expect(canFire(s,u,'r2c2')).toBe(false);});
 for(const agency of ['artillery','mortar','cannon'])for(const ammo of agency==='cannon'?['HE','WP']:['HE','WP','ILLUM'])for(const caller of ['co','artyfo','mtrfo'])it(`${agency} ${ammo} / ${caller}: caller draws, concentration and exhaustion`,()=>{
  const s=fresh(),u=s.units[caller],a=candidate.support_agencies[agency];u.experience='Line';s.registered_targets={};stack(s,c=>c.burst&&!c.multi&&!c.short,120);const draws=a.draws[u.agency_role],before=s.deck.draws;supportRequest(s,u,agency,ammo,'r2c2');expect(s.deck.draws-before).toBe(draws);expect(s.support_inventory[agency][ammo]).toBe(a.inventory[ammo]-1);
  const registered=fresh();registered.units[caller].experience='Line';registered.registered_targets={[agency]:'r2c2'};stack(registered,c=>c.burst&&!c.multi&&!c.short);const next=registered.deck.draws;supportRequest(registered,registered.units[caller],agency,ammo,'r2c2');expect(registered.deck.draws-next).toBe(draws+1);
 });
 for(const agency of ['artillery','mortar','cannon'])for(const ammo of agency==='cannon'?['HE','WP']:['HE','WP','ILLUM'])it(`${agency} ${ammo} exhausted stock cannot draw`,()=>{const s=fresh();s.support_inventory[agency][ammo]=0;const before=structuredClone(s);expect(()=>supportRequest(s,s.units.artyfo,agency,ammo,'r2c2')).toThrow(/no .* missions/);expect(s).toEqual(before);});
 it('restricts three-burst expansion to artillery and spends no extra command/card/mission',()=>{for(const agency of ['artillery','mortar','cannon']){const s=fresh();stack(s,c=>c.multi);supportRequest(s,s.units.artyfo,agency,'HE','r2c2');if(agency!=='artillery'){expect(s.pending_support).toBeFalsy();continue;}const before=structuredClone(s);expect(advancePhase(s).accepted).toBe(false);expect(resolveSupportChoice(s,{locations:['r2c1','r2c1']}).accepted).toBe(false);const next=resolveSupportChoice(s,{locations:s.pending_support.adjacent.slice(0,2)}).state;expect(next.support).toHaveLength(3);expect(next.deck).toEqual(before.deck);expect(next.support_inventory).toEqual(before.support_inventory);expect(next.impulse).toEqual(before.impulse);}});
 it('cross-agency calls require the observer’s own printed radio network',()=>{const s=fresh();s.units.co.location=s.units.mtrfo.location='r1c2';s.units.co.cover=s.units.mtrfo.cover=null;s.impulse={id:'test',hq:'co',commands:4,spent:0};expect(orderReason(s,{type:'CALL_CANNON_WP',unit_id:'mtrfo',issuer_id:'co',target_id:'r1c2'})).toBeNull();s.units.mtrfo.radios=['ARTY'];expect(orderReason(s,{type:'CALL_CANNON_WP',unit_id:'mtrfo',issuer_id:'co',target_id:'r1c2'})).toContain('MTR');});
 it('rejects original M5 content-1 replay unchanged without altering accepted Cerisy profiles',()=>{const record=JSON.parse(readFileSync('output/st-germain-playtests-r30/st-germain-short-1.json','utf8')).replay,original=structuredClone(record);expect(()=>replayMission(candidate,record)).toThrow(/version mismatch/);expect(record).toEqual(original);expect(cerisy.enemy_counters.find(c=>c.id==='fj5').last_step_vof).toBe('S');expect(candidate.enemy_counters.find(c=>c.id==='fj5').last_step_vof).toBe('A/S');});
});
