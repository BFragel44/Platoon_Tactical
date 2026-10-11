import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {refresh,combatExposure} from '../src/sim/company/battlefield.js';
import {initializeVireAdapter,applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay,getVirePublicState} from '../src/sim/company/vireIntegration.js';
function start(profile='M4_SHERMAN75'){
 const b=createMission(cerisy,'basic-vehicle-fire');b.phase='AT_COMBAT';b.fire=[];b.markers=[];b.support=[];
 for(const u of Object.values(b.units)){u.location='r5c4';u.vof=null;u.fire=null;u.indirect=null;}
 const t=b.units.s11;Object.assign(t,{faction:'enemy',location:'r1c2',vof:null,cohesion:'GOOD',pinned:false,cover:'test-cover'});b.knowledge.spotted[t.id]={id:t.id};b.locations.r1c2.covers.push({id:'test-cover',type:'Foxholes',value:2,known:true});
 const crew=profile==='M5_LIGHT37'?[{id:'ca',personnel:[]}]:[{id:'ca',personnel:[]},{id:'cb',personnel:[]}];
 const s=initializeVireAdapter(b,[{id:'tank',profile,faction:'friendly',location:'r1c1',crew,ammo:5}]);s.vire_runtime.vehicles.tank.activated=true;return s;
}
const enable={id:'enable',type:'REFRESH_VEHICLE_FIRE'},cf={id:'cf',type:'VEHICLE_CONCENTRATE',vehicle:'tank',target:'s11'};
function stack(s,match,n=5){const c=Object.values(cards).find(match);s.deck.order=Array(n).fill(c.id);return c;}
it('automatically contributes heavy fire with a known source but no infantry crew target',()=>{const s=applyVireOperation(start(),enable);expect(s.fire).toContainEqual(expect.objectContaining({source:'tank',target:'r1c2',value:-3}));expect(s.units.tank).toBeUndefined();expect(combatExposure(s,s.units.s11).parts.fire).toBe(-3);refresh(s);expect(s.fire.some(f=>f.source==='tank')).toBe(true);});
it('uses pinned VOF, excludes loaded/empty tanks and never targets an empty vehicle-only card',()=>{
 const s=applyVireOperation(start(),enable);s.vire_runtime.vehicles.tank.pinned=true;refresh(s);expect(s.fire.find(f=>f.source==='tank').value).toBe(2);
 s.vire_runtime.vehicles.tank.passengers=[{id:'rider'}];refresh(s);expect(s.fire.some(f=>f.source==='tank')).toBe(false);
 s.vire_runtime.vehicles.tank.passengers=[];s.vire_runtime.vehicles.tank.ammo=0;refresh(s);expect(s.fire.some(f=>f.source==='tank')).toBe(false);
 const empty=start();empty.units.s11.removed='BROKEN';expect(applyVireOperation(empty,enable).fire.some(f=>f.source==='tank')).toBe(false);
});
it('Concentrate Fire counts crosshairs, ignores Jam and preserves critical covered-stack semantics',()=>{
 const base=start(),c=stack(base,c=>c.spot);base.vire_runtime.vehicles.tank.experience='Veteran';const s=applyVireOperation(base,enable);const jam=Object.values(cards).find(c=>c.jam);base.deck.order=[c.id,c.id,jam.id];s.deck.order=[c.id,c.id,jam.id];
 const r=applyVireOperation(s,cf);expect(r.markers).toContainEqual(expect.objectContaining({type:'CONCENTRATE',source:'tank',cover:'test-cover',critical:true,value:1}));expect(combatExposure(r,r.units.s11).parts.cover).toBe(0);expect(r.vire_runtime.vehicles.tank.ammo).toBe(4);expect(r.vire_runtime.vehicles.tank.status).toBe('ACTIVE');
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(base,r))))).toEqual(r);
});
it('M5 basic A VOF uses crosshairs rather than its AT grenade prerequisite',()=>{const s=applyVireOperation(start('M5_LIGHT37'),enable);stack(s,c=>!c.spot&&c.word.toLowerCase()!=='spot');const r=applyVireOperation(s,cf);expect(r.vire_runtime.vehicles.tank.ammo).toBe(5);expect(r.markers.some(m=>m.type==='CONCENTRATE'||m.type==='GRENADE')).toBe(false);expect(r.events.at(-1).type).not.toBe('GRENADE');});
it('requires activation, no pin, a known target and the vehicle own established PDF',()=>{
 for(const edit of [s=>s.vire_runtime.vehicles.tank.activated=false,s=>s.vire_runtime.vehicles.tank.pinned=true,s=>delete s.knowledge.spotted.s11,s=>s.fire=[]]){const s=applyVireOperation(start(),enable);edit(s);const before=structuredClone(s);expect(()=>applyVireOperation(s,cf)).toThrow();expect(s).toEqual(before);}
});
it('basic fire spends once at combat preparation, retains its snapshot and withdraws an exhausted tank',()=>{const base=start();base.phase='COMBAT_EFFECTS';base.vire_runtime.phase_complete=true;base.vire_runtime.vehicles.tank.ammo=1;let s=applyVireOperation(base,enable);s=applyVireOperation(s,{id:'combat',type:'PREPARE_INFANTRY_COMBAT'});expect(s.pending_combat.find(r=>r.target_id==='s11').strongest).toMatchObject({source_id:'tank',label:'tank',unit_kind:'VEHICLE',value:-3});expect(s.pending_combat.some(r=>r.target_id==='tank')).toBe(false);expect(s.vire_runtime.vehicles.tank).toMatchObject({ammo:0,status:'RETREATED',removal_reason:'AMMO_EXHAUSTED'});expect(s.fire.some(f=>f.source==='tank')).toBe(false);expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(base,s))))).toEqual(s);expect(()=>applyVireOperation(s,{id:'double',type:'PREPARE_INFANTRY_COMBAT'})).toThrow();});
it('projects only known infantry choices and removes modifiers when LOS disappears',()=>{const s=applyVireOperation(start(),enable);stack(s,c=>c.spot);const r=applyVireOperation(s,cf);expect(getVirePublicState(r).concentrate_targets.map(t=>t.id)).toContain('s11');r.locations.r1c1.smoke=true;refresh(r);expect(r.markers.some(m=>m.type==='CONCENTRATE')).toBe(false);delete r.knowledge.spotted.s11;expect(getVirePublicState(r).concentrate_targets).toEqual([]);});

it('handles same-card fire and keeps hidden vehicle identities out of the player projection',()=>{
 const s=start();s.vire_runtime.vehicles.tank.location='r1c2';let r=applyVireOperation(s,enable);expect(combatExposure(r,r.units.s11).parts.fire).toBe(-3);expect(getPlayerView(r).fire.some(f=>f.source==='tank')).toBe(true);
 const enemy=structuredClone(r.vire_runtime.vehicles.tank);Object.assign(enemy,{id:'hidden-tank',faction:'enemy',location:'r5c4',fire:null,fire_direction:null});r.vire_runtime.vehicles[enemy.id]=enemy;refresh(r);const view=getPlayerView(r);expect(JSON.stringify(view.fire)).not.toContain('hidden-tank');expect(getVirePublicState(r).vehicles.some(v=>v.id==='hidden-tank')).toBe(false);
});
it('adjusts only for vehicle experience and gives a random out-of-cover critical target two modifiers',()=>{
 for(const [experience,count] of [['Green',1],['Line',2],['Veteran',3]]){const base=start();base.vire_runtime.vehicles.tank.experience=experience;stack(base,c=>c.spot,10);const s=applyVireOperation(base,enable),before=s.deck.draws;const r=applyVireOperation(s,cf);expect(r.deck.draws-before).toBe(count);}
 const s=applyVireOperation(start(),enable);s.units.s11.cover=null;stack(s,c=>c.spot,10);const r=applyVireOperation(s,cf);expect(r.markers.find(m=>m.type==='CONCENTRATE')).toMatchObject({target:'s11',critical:true,value:2});
});
it('successful last-ammo concentrate fire withdraws the tank without inventing crew casualties',()=>{const s=applyVireOperation(start(),enable);s.vire_runtime.vehicles.tank.ammo=1;stack(s,c=>c.spot);const before=s.casualties.length;const r=applyVireOperation(s,cf);expect(r.vire_runtime.vehicles.tank.status).toBe('RETREATED');expect(r.casualties.length).toBe(before);expect(r.fire.some(f=>f.source==='tank')).toBe(false);});

it('S infantry can fire at a vehicle alone while A/H AT-capable sources do not establish basic VOF on it',()=>{
 const s=start();s.vire_runtime.vehicles.tank.faction='enemy';s.units.s11.faction='friendly';s.units.s11.vof='S';s.units.s11.cover=null;s.knowledge.spotted.tank={id:'tank'};const r=applyVireOperation(s,enable);expect(r.fire).toContainEqual(expect.objectContaining({source:'s11',target:'r1c1'}));r.units.s11.vof='H';r.units.s11.at_profile='FLAK88';r.units.s11.fire=null;refresh(r);expect(r.fire.some(f=>f.source==='s11')).toBe(false);
});

it('an A/H tank does not join an S infantry PDF aimed at vehicles alone',()=>{const s=start();Object.assign(s.units.s11,{faction:'friendly',location:'r1c1',cover:null,vof:'S'});const enemy=structuredClone(s.vire_runtime.vehicles.tank);Object.assign(enemy,{id:'enemy-tank',faction:'enemy',location:'r1c2',fire:null,fire_direction:null});s.vire_runtime.vehicles[enemy.id]=enemy;s.knowledge.spotted[enemy.id]={id:enemy.id};const r=applyVireOperation(s,enable);expect(r.fire.some(f=>f.source==='s11')).toBe(true);expect(r.fire.some(f=>f.source==='tank')).toBe(false);});
