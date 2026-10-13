import {it,expect} from 'vitest';
import {cerisy} from '../src/scenarios/cerisy.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {initializeVireAdapter,applyVireOperation,exportVireAdapterReplay,importVireAdapterReplay} from '../src/sim/company/vireIntegration.js';
function start(){
 const s=createMission(cerisy,'rider-combat');s.phase='CO_ACTIVATION';s.impulse={hq:'co',commands:3,spent:0};s.units.co.pinned=false;s.units.co.cohesion='GOOD';s.locations.r1c1.protection=0;
 s.units.s11.location='r1c1';s.units.s11.cover=null;s.units.s11.pinned=false;s.units.s11.cohesion='GOOD';
 s.units.rider2={...structuredClone(s.units.s11),id:'rider2',name:'Second rider',kind:'LAT',max_steps:1,steps:[{id:'second-step',personnel:[]}],radios:[],assets:{},ammo:{},named:false};
 let r=initializeVireAdapter(s,[{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',crew:[{id:'crew1',personnel:[]},{id:'crew2',personnel:[]}],ammo:5,radios:['BN']}]);
 r=applyVireOperation(r,{id:'embark',type:'EMBARK_INFANTRY',vehicle:'tank',units:['s11','rider2']});
 r.phase='COMBAT_EFFECTS';r.vire_runtime.phase_complete=true;r.vire_runtime.operations=[];r.vire_runtime.applied=[];r.fire=[];r.support=[];r.markers=[];
 return r;
}
it('includes every tank rider in vehicle-targeted grenade effects without creating rider fire or charging rider ammunition',()=>{
 const s=start();s.markers=[{type:'GRENADE',target:'tank',location:'r1c1',value:-4}];const ammo=structuredClone(s.vire_runtime.embarked_formations.s11.formation.ammo);
 const r=applyVireOperation(s,{id:'prepare',type:'PREPARE_INFANTRY_COMBAT'});
 for(const id of ['s11','rider2']){const row=r.pending_combat.find(row=>row.target_id===id);expect(row).toMatchObject({ncm:-4,status:'PENDING'});expect(row.parts.exposed).toBe(-2);expect(row.sources.some(source=>source.kind==='GRENADE')).toBe(true);expect(r.units[id].removed).toBe('EMBARKED');}
 expect(r.fire.some(f=>['s11','rider2'].includes(f.source))).toBe(false);expect(r.vire_runtime.embarked_formations.s11.formation.ammo).toEqual(ammo);
 expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);expect(()=>applyVireOperation(r,{id:'repeat',type:'PREPARE_INFANTRY_COMBAT'})).toThrow();
});
it('uses ordinary HIT breakdown and retains each surviving step exactly once aboard after replay',()=>{
 const s=start();s.markers=[{type:'GRENADE',target:'tank',location:'r1c1',value:-4}];
 const combat=Object.values(cards).find(c=>c.id!==51&&c.combat[0]==='HIT'),hit=Object.values(cards).find(c=>c.id!==51&&c.hit.Line==='F');
 s.deck.order=[combat.id,hit.id,...s.deck.order];
 const original=s.vire_runtime.vehicles.tank.passengers.filter(step=>step.origin_formation==='s11').map(step=>step.id);
 let r=applyVireOperation(s,{id:'prepare',type:'PREPARE_INFANTRY_COMBAT'});const row=r.pending_combat.find(row=>row.target_id==='s11');
 r=applyVireOperation(r,{id:'resolve',type:'RESOLVE_INFANTRY_COMBAT',resolution:row.id});
 expect(r.pending_combat.find(row=>row.target_id==='s11')).toMatchObject({result:'HIT',hit_effect:'F',status:'RESOLVED'});
 const survivors=r.vire_runtime.vehicles.tank.passengers.filter(step=>original.includes(step.id));expect(survivors.map(step=>step.id).sort()).toEqual(original.sort());expect(new Set(survivors.map(step=>step.origin_formation)).size).toBe(2);
 expect(survivors.every(step=>r.units[step.origin_formation].removed==='EMBARKED')).toBe(true);expect(importVireAdapterReplay(JSON.parse(JSON.stringify(exportVireAdapterReplay(s,r))))).toEqual(r);
 expect(()=>applyVireOperation(r,{id:'duplicate',type:'RESOLVE_INFANTRY_COMBAT',resolution:row.id})).toThrow();
});
it('includes exposed riders in normal sniper selection and applies concentrated fire only to its selected formation',()=>{
 const s=start();for(const u of Object.values(s.units))u.exposed=false;
 const sniper=s.units.s12;sniper.faction='enemy';sniper.pinned=false;sniper.cohesion='GOOD';sniper.vof='S!';sniper.fire='r1c1';sniper.location='r2c1';
 s.markers=[{type:'CONCENTRATE',target:'s11',location:'r1c1',value:1}];s.fire=[{source:sniper.id,origin:'r2c1',target:'r1c1',value:0}];
 const r=applyVireOperation(s,{id:'prepare',type:'PREPARE_INFANTRY_COMBAT'});
 expect(['s11','rider2']).toContain(r.markers.find(m=>m.type==='SNIPER').target);
 expect(r.pending_combat.find(row=>row.target_id==='s11').parts.concentrated).toBe(-1);expect(r.pending_combat.find(row=>row.target_id==='rider2').parts.concentrated).toBeCloseTo(0);
});
