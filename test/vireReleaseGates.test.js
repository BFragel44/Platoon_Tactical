import {it,expect} from 'vitest';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {applyVireOperation,importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
import {exportReplay,prepareReattempt,advancePhase} from '../src/sim/company/engine.js';
import {effectiveRadios,synchronizeJeepPassengers} from '../src/sim/company/vehicleJeep.js';
import {checkVehicleMines} from '../src/sim/company/vehicleHazards.js';
import {vehicleHQRecord,vehicleCommandAuthority} from '../src/sim/company/vehicleCommand.js';
import {cards} from '../src/sim/company/core.js';
import {refresh,movementReason} from '../src/sim/company/battlefield.js';
import {prepareSpecialTargets} from '../src/sim/company/specialEnemies.js';
import {embarkInfantry} from '../src/sim/company/vehicleTransport.js';
import {placePackage} from '../src/sim/company/missionContacts.js';
import {vire} from '../src/scenarios/vire.js';
import {synchronizeVireATUnits} from '../src/sim/company/vireUnits.js';
const fresh=(jeep={})=>createVireDevelopmentMission('vire-release',{}, {},{jeep,mission_instance_id:'release'});
const seal=s=>{delete s.vire_runtime.initial_state;s.vire_runtime.initial_state=structuredClone(s);return s;};
const replay=s=>importVireAdapterReplay(JSON.parse(JSON.stringify(exportReplay(s))));
function flat(s){for(const l of Object.values(s.locations)){l.borders=Object.fromEntries(['N','S','E','W','NE','NW','SE','SW'].map(k=>[k,'white']));l.elevation=0;l.protection=0;l.burst=0;l.smoke=false;l.known=true;l.trafficability='Unmarked';}return s;}
function at(s){s.phase='AT_COMBAT';s.impulse=null;s.vire_runtime.coordinator=null;return s;}
function card(s,predicate){s.deck.order=Array(200).fill(Object.values(cards).find(predicate).id);}

it('closes a moving vehicle action when reaction fire removes its actor, including exact recovery',()=>{
 let s=at(flat(fresh()));s.units.s11.location='r1c1';expect(placePackage(s,s.contacts.pc_r1c1,vire.packages[8].alternatives[1])).toBe(true);s.units.s11.location='r0c1';
 const gun=Object.values(s.units).find(u=>u.kind==='PAK40');gun.location='r2c1';gun.cover=null;synchronizeVireATUnits(s);
 s.vire_runtime.vehicles.sherman_hq.location='r1c1';s.vire_runtime.vehicles.sherman_hq.activated=true;
 for(const l of Object.values(s.locations))l.revealed=true;
 s.vire_runtime.basic_fire_enabled=false;s.fire=[];card(s,c=>Number(c.at)===0);seal(s);
 s=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:'sherman_hq',path:['r1c2']});
 // No basic VOF: the published gun's AT reaction is the removing attack.
 for(let i=0;i<3;i++)s=applyVireOperation(s,{id:`step${i}`,type:'STEP_VEHICLE_MOVE'});
 s=applyVireOperation(s,{id:'reaction',type:'AUTO_ENEMY_REACTION'});
 expect(s.vire_runtime.vehicles.sherman_hq.status).not.toBe('ACTIVE');expect(s.vire_runtime.move.complete).toBe(true);
 expect(s.events.some(e=>e.type==='VEHICLE_MOVE_INTERRUPTED')).toBe(true);expect(replay(s)).toEqual(s);
});

it('offers one company Jeep without inventing crew, validates passengers and preserves named infantry identities',()=>{
 const s=fresh({use:true,passengers:['co']}),v=s.vire_runtime.vehicles.company_jeep;
 expect(v.crew).toEqual([]);expect(v.passengers.map(p=>p.id)).toEqual(s.units.co.steps.map(p=>p.id));expect(s.units.co.removed).toBeNull();expect(movementReason(s,s.units.co,'r1c2')).toMatch(/Disembark/);
 expect(()=>fresh({use:true,passengers:['s11']})).toThrow();expect(()=>fresh({use:true,arty_radio:true,passengers:['co']})).toThrow(/observer/);
 expect(()=>fresh({use:true,location:'r1c2'})).toThrow(/staging/);
});
it('activates an embarked HQ driver, carries it through normal movement and replays exactly',()=>{
 let s=flat(fresh({use:true,passengers:['co']}));s.phase='CO_INITIATIVE';s.impulse={id:'driver',hq:'co',commands:2,spent:0};seal(s);
 s=applyVireOperation(s,{id:'activate',type:'ACTIVATE_VEHICLE',vehicle:'company_jeep'});expect(s.impulse.commands).toBe(1);
 // Independent phase fixture; a normal mission reaches this through explicit stepping.
 at(s);s.vire_runtime.operations=[];s.vire_runtime.applied=[];seal(s);
 s=applyVireOperation(s,{id:'move',type:'PREPARE_VEHICLE_MOVE',vehicle:'company_jeep',path:['r1c2']});
 for(let i=0;i<4;i++)s=applyVireOperation(s,{id:`step${i}`,type:'STEP_VEHICLE_MOVE'});
 expect(s.units.co).toMatchObject({location:'r1c2',embarked_on:'company_jeep',exposed:true});expect(replay(s)).toEqual(s);
});
it('keeps the mounted artillery radio fixed and usable only while its observer is aboard',()=>{
 let s=flat(fresh({use:true,arty_radio:true,passengers:['artyfo']}));const fo=s.units.artyfo;
 expect(fo.radios).not.toContain('ARTY');expect(effectiveRadios(s,fo)).toContain('ARTY');expect(s.vire_runtime.vehicles.company_jeep.activated).toBe(true);
 at(s);seal(s);s=applyVireOperation(s,{id:'prepare',type:'PREPARE_DISEMBARK_INFANTRY',vehicle:'company_jeep',units:['artyfo']});s=applyVireOperation(s,{id:'out',type:'DISEMBARK_INFANTRY',vehicle:'company_jeep',units:['artyfo']});
 expect(effectiveRadios(s,s.units.artyfo)).not.toContain('ARTY');expect(s.units.artyfo.mounted_radio).toBe('company_jeep');expect(replay(s)).toEqual(s);
});
it('requires voice authority or General Initiative for an ordinary Jeep and enforces attached platoon command',()=>{
 const s=flat(fresh({use:true,platoon:1})),v=s.vire_runtime.vehicles.company_jeep;
 s.units.hq1.location=v.location;s.units.hq2.location=v.location;expect(vehicleCommandAuthority(s,s.units.hq1,v)).toBe(true);expect(vehicleCommandAuthority(s,s.units.hq2,v)).toBe(false);
 s.units.co.location='r1c2';expect(vehicleCommandAuthority(s,s.units.co,v)).toBe(false);
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'general',hq:'general',commands:1,spent:0};expect(applyVireOperation(s,{id:'activate',type:'ACTIVATE_VEHICLE',vehicle:v.id}).vire_runtime.vehicles[v.id].activated).toBe(true);
});
it('losing a tank HQ removes its impulse without inventing a successor; CO and General remain legal',()=>{
 const s=fresh(),v=s.vire_runtime.vehicles.sherman_1;s.vire_runtime.vehicles.sherman_hq.status='KNOCKED_OUT';
 expect(vehicleHQRecord(s,'sherman_hq')).toBeNull();expect(vehicleCommandAuthority(s,s.units.co,s.vire_runtime.vehicles.sherman_hq)).toBe(true);
 s.phase='CO_INITIATIVE';s.impulse={id:'co',hq:'co',commands:1,spent:0};expect(()=>applyVireOperation(s,{id:'dead',type:'ACTIVATE_VEHICLE_HQ',vehicle:'sherman_hq'})).toThrow();
 expect(()=>applyVireOperation(s,{id:'one',type:'ACTIVATE_VEHICLE',vehicle:v.id})).toThrow(/radio/);
 s.impulse.hq='general';s.phase='GENERAL_INITIATIVE';expect(applyVireOperation(s,{id:'one',type:'ACTIVATE_VEHICLE',vehicle:v.id}).vire_runtime.vehicles[v.id].activated).toBe(true);
});
it('uses three mine cards on entry, applies a targeted vehicle attack and preserves exact replay',()=>{
 let s=at(flat(fresh()));const v=s.vire_runtime.vehicles.sherman_hq;v.activated=true;s.locations.r1c1.mines=true;card(s,c=>c.burst&&Number(c.at)>=7);seal(s);
 s=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:v.id,path:['r1c1']});
 for(let i=0;i<3;i++)s=applyVireOperation(s,{id:`step${i}`,type:'STEP_VEHICLE_MOVE'});
 expect(s.events.find(e=>e.type==='VEHICLE_MINE_CHECK').card_ids).toHaveLength(3);expect(s.events.find(e=>e.type==='VEHICLE_VOF_RESOLVED').modifier).toBe(-1);expect(replay(s)).toEqual(s);
});
it('does not trigger mines when leaving the origin and does not turn hand-grenade VOF into an AT attack',()=>{
 let s=at(flat(fresh()));const v=s.vire_runtime.vehicles.sherman_hq;v.activated=true;s.locations[v.location].mines=true;s.markers=[{type:'GRENADE',target:v.id,location:v.location,value:-4}];seal(s);
 s=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:v.id,path:['r1c1']});s=applyVireOperation(s,{id:'step',type:'STEP_VEHICLE_MOVE'});
 expect(s.events.some(e=>['VEHICLE_MINE_CHECK','VEHICLE_VOF_RESOLVED'].includes(e.type))).toBe(false);expect(replay(s)).toEqual(s);
});
it('retains selected sniper vehicle targets across cleanup and uses +1 only for the selected vehicle next turn',()=>{
 let s=flat(fresh());s.units={enemy:{...structuredClone(s.units.s11),id:'enemy',faction:'enemy',kind:'SNIPER',vof:'S!',cohesion:'GOOD',pinned:false,location:'r2c1',fire:'r1c1'}};
 for(const v of Object.values(s.vire_runtime.vehicles))v.location='r0c2';const v=s.vire_runtime.vehicles.sherman_hq;v.location='r1c1';prepareSpecialTargets(s);
 expect(s.markers.find(m=>m.type==='SNIPER').target).toBe(v.id);
 s.phase='CLEANUP';s.vire_runtime.phase_complete=true;seal(s);s=advancePhase(s).state;expect(s.markers.some(m=>m.type==='SNIPER'&&m.target===v.id)).toBe(true);
 at(s);s.vire_runtime.vehicles[v.id].activated=true;card(s,c=>Number(c.at)===9);s.vire_runtime.operations=[];s.vire_runtime.applied=[];seal(s);
 s=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:v.id,path:['r1c2']});s=applyVireOperation(s,{id:'step',type:'STEP_VEHICLE_MOVE'});
 expect(s.events.findLast(e=>e.type==='VEHICLE_VOF_RESOLVED').modifier).toBe(1);expect(replay(s)).toEqual(s);
});
it('retains surviving Jeep identities and fixed radio restrictions through reattempt',()=>{
 const s=fresh({use:true,arty_radio:true,passengers:['artyfo']});s.status='DEFEAT';for(const c of Object.values(s.contacts))c.resolved=true;seal(s);
 const choices={positions:Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length).map(u=>[u.id,u.location])),vehicle_positions:Object.fromEntries(Object.values(s.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&!v.source_unit).map(v=>[v.id,v.location]))};
 const r=prepareReattempt(s,choices).state;expect(r.vire_runtime.vehicles.company_jeep.status).toBe('ACTIVE');expect(r.units.artyfo.embarked_on).toBeNull();expect(effectiveRadios(r,r.units.artyfo)).not.toContain('ARTY');expect(replay(r)).toEqual(r);
});

it('routes CO orders through a surviving tank HQ BN net and rejects loss of that bridge',()=>{
 const s=fresh(),v=s.vire_runtime.vehicles.sherman_1;expect(v.radios).toEqual([]);expect(vehicleCommandAuthority(s,s.units.co,v)).toBe(true);
 s.vire_runtime.vehicles.sherman_hq.radios=[];expect(vehicleCommandAuthority(s,s.units.co,v)).toBe(false);
});
it('applies smoke protection to basic vehicle VOF and ignores it for incoming fire',()=>{
 for(const incoming of [false,true]){
  let s=at(flat(fresh()));const v=s.vire_runtime.vehicles.sherman_hq;v.location='r1c1';v.activated=true;s.locations.r1c1.smoke=true;s.locations.r1c1.smoke_value=2;
  const u=s.units.s11;u.faction='enemy';u.location='r1c1';u.vof='S';u.cohesion='GOOD';u.pinned=false;
  s.fire=[{source:u.id,origin:u.location,target:v.location,value:0,indirect:false}];if(incoming)s.support=[{id:'incoming',location:v.location,status:'ACTIVE',value:-3}];card(s,c=>Number(c.at)===9);seal(s);
  s=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:v.id,path:['r1c2']});s=applyVireOperation(s,{id:'step',type:'STEP_VEHICLE_MOVE'});
  expect(s.events.findLast(e=>e.type==='VEHICLE_VOF_RESOLVED').modifier).toBe(incoming?-1:5);expect(replay(s)).toEqual(s);
 }
});
it('Jeep passengers retain normal fire and tank riders remain valid enemy VOF targets',()=>{
 const s=flat(fresh({use:true,location:'r0c2',passengers:['at1']}));s.units.at1.vof='S';s.units.at1.basic_ammo=false;
 s.vire_runtime.vehicles.company_jeep.location='r1c1';synchronizeJeepPassengers(s);
 const enemy={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',kind:'MG',location:'r2c1',cover:null,vof:'A',cohesion:'GOOD',pinned:false};s.units.enemy=enemy;s.knowledge.spotted.enemy={id:'enemy'};refresh(s);
 expect(s.fire.some(f=>f.source==='at1'&&f.target==='r2c1')).toBe(true);
 s.units.at1.removed='BROKEN';s.units.at1.steps=[];s.units.s11.location='r1c1';s.units.s11.cover=null;s.units.s11.pinned=false;s.vire_runtime.vehicles.sherman_hq.location='r1c1';s.vire_runtime.vehicles.sherman_hq=embarkInfantry(s,s.vire_runtime.vehicles.sherman_hq,['s11']);refresh(s);
 expect(s.fire.some(f=>f.source==='enemy'&&f.target==='r1c1')).toBe(true);expect(s.fire.some(f=>f.source==='s11')).toBe(false);
});

for(const [atValue,status] of [[0,'BREWED_UP'],[3,'KNOCKED_OUT'],[5,'RETREATED'],[7,'ACTIVE']])it(`preserves Jeep passenger identity without duplicating steps after ${status} VOF`,()=>{
 let s=at(flat(fresh({use:true,passengers:['co']})));const v=s.vire_runtime.vehicles.company_jeep;v.location='r1c1';v.activated=true;synchronizeJeepPassengers(s);const id=s.units.co.steps[0].id;
 s.support=[{id:'incoming',location:'r1c1',status:'ACTIVE',value:-3}];card(s,c=>Number(c.at)===atValue);seal(s);
 s=applyVireOperation(s,{id:'prepare',type:'PREPARE_VEHICLE_MOVE',vehicle:v.id,path:['r1c2']});s=applyVireOperation(s,{id:'vof',type:'STEP_VEHICLE_MOVE'});
 expect(s.vire_runtime.vehicles[v.id].status).toBe(status);
 const liveCopies=Object.values(s.units).flatMap(u=>u.steps).filter(step=>step.id===id);expect(liveCopies).toHaveLength(status==='BREWED_UP'||status==='RETREATED'?0:1);
 if(status==='KNOCKED_OUT'){expect(s.vire_runtime.pending_hits.map(h=>h.step_id)).toEqual([id]);expect(s.units.co.steps).toHaveLength(0);expect(s.locations.r1c1.covers.some(c=>c.type==='Wreck'&&c.discovered)).toBe(true);}
 if(status==='ACTIVE'){expect(s.units.co.embarked_on).toBe(v.id);expect(s.vire_runtime.vehicles[v.id].pinned).toBe(true);}
 expect(replay(s)).toEqual(s);
});
