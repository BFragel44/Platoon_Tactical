import {describe,it,expect} from 'vitest';
import {createMission,exportReplay,replayMission,advancePhase} from '../src/sim/company/engine.js';
import {applyHit,prepareCombat,resolvePreparedCombat} from '../src/sim/company/combat.js';
import {cards} from '../src/sim/company/core.js';
import {vofOf} from '../src/sim/company/battlefield.js';
import {reconstitutionFirepower,reconstitutionDonors} from '../src/sim/company/reconstitution.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {auditSpecialistBreakdowns} from '../scripts/auditSpecialistBreakdowns.js';

const letters=['C','P','L','F','A'];
const effects=[...letters,...letters.flatMap(a=>letters.map(b=>a+b))];
function fixture(type,count,cohesion='GOOD',seed='hit-chart'){
 const s=createMission(cerisy,seed,{mortar_mode:'teams'});
 const profiles={squad:{kind:'SQUAD',vof:'S',last_step_vof:'S'},engineer:{kind:'SQUAD',vof:'S',last_step_vof:'S',engineer:true},
  grenadier:trevieres.enemy_counters.find(p=>p.id==='gr1'),fjAS:s.mission_contacts.counters.find(p=>p.id==='fj5'),fjA:s.mission_contacts.counters.find(p=>p.id==='fj1'),
  germanMortar:s.mission_contacts.counters.find(p=>p.breakdown==='german_mortar_section'),usMortar:{...s.units.mortar1,kind:'MORTAR',vof:'H',max_steps:3,fire_team_vof:'S',ammo:{MTR:5}},
  gun:trevieres.enemy_counters.find(p=>p.kind==='FLAK88'),hq:s.units.hq1,bazooka:s.units.at1,lat:{kind:'LAT',vof:'S',range:1}};
 const p=profiles[type],u={...structuredClone(s.units.s11),...structuredClone(p),id:'recipient',counter_id:p.id??type,
  name:type,faction:['grenadier','fjAS','fjA','germanMortar','gun'].includes(type)?'enemy':'friendly',
  max_steps:['germanMortar','usMortar','squad','engineer','grenadier','fjAS','fjA'].includes(type)?3:type==='gun'?2:1,
  steps:Array.from({length:count},(_,i)=>({id:`step${i}`,personnel:[`person${i}`]})),named:!['squad','engineer','grenadier','fjAS','fjA','lat'].includes(type),
  location:'r2c2',cover:'cover',exposed:true,pinned:false,cohesion,experience:cohesion==='GOOD'?'Veteran':cohesion==='A'?'Line':'Green',original_experience:'Veteran',
  removed:null,fire:null,radios:[],assets:{},ammo:structuredClone(p.ammo??{}),initial_resources:{radios:[],assets:{},ammo:structuredClone(p.ammo??{})}};
 s.units={[u.id]:u};s.casualties=[];s.assets=[];s.fire=[];s.support=[];s.markers=[];
 s.locations[u.location].covers=[{id:'cover',value:1,known:true}];return {s,u};
}

// Expectations describe printed step outcomes, independently of applyHit's branches.
for(const [type,counts] of [['squad',[2,3]],['engineer',[2,3]],['grenadier',[2,3]],['fjAS',[2,3]],['fjA',[2,3]],['germanMortar',[2,3]],['usMortar',[2,3]],['gun',[1,2]],['hq',[1]],['bazooka',[1]],['lat',[1]]]){
 describe(`HIT chart ${type}`,()=>{
  for(const count of counts)for(const effect of effects)it(`${count} steps / ${effect}`,()=>{
   const {s,u}=fixture(type,count),steps=structuredClone(u.steps);
   applyHit(s,u,effect);
   const survivors=Object.values(s.units).filter(v=>v.steps.length&&!v.removed);
   const outcomes=steps.map(step=>{
    if(s.casualties.some(c=>c.step.id===step.id))return {side:'C'};
    const v=survivors.find(v=>v.steps.some(t=>t.id===step.id));expect(v,`missing ${step.id}`).toBeTruthy();
    expect(v.pinned).toBe(true);expect(v.location).toBe('r2c2');expect(v.cover).toBe('cover');expect(v.exposed).toBe(true);
    expect(v.experience).toBe(v.cohesion==='GOOD'?'Veteran':v.cohesion==='A'?'Line':'Green');
    return {side:v.cohesion,vof:vofOf(v),named:v.named};
   });
   expect(survivors.flatMap(v=>v.steps).length+s.casualties.length).toBe(count);
   expect([...survivors.flatMap(v=>v.steps.map(t=>t.id)),...s.casualties.map(c=>c.step.id)].sort()).toEqual(steps.map(t=>t.id).sort());
   for(let i=0;i<count;i++){
    const letter=effect.slice(0,Math.min(2,count))[i];let side=letter??'GOOD';
    const mortarNamed=['usMortar','germanMortar'].includes(type)&&['A','F'].includes(letter)&&(type==='usMortar'||count===2);
    if(mortarNamed||u.named&&count===1&&['A','F'].includes(letter))side='F';
    const lastUnhit=i===count-1&&!letter&&count-effect.length===1;
    if(lastUnhit&&['squad','engineer','grenadier','fjAS','fjA'].includes(type))side='F';
    expect(outcomes[i].side).toBe(side);
    if(side==='F'){
     let ratings=['S'];
     if(['grenadier','fjA'].includes(type)&&i===count-1)ratings=['A'];
     if(type==='fjA'&&letter==='F'&&i===count-2)ratings=['S','A'];
     if(type==='fjAS'&&i===count-1)ratings=['A/S'];
     expect(ratings).toContain(outcomes[i].vof);
    }
    if(['usMortar','germanMortar'].includes(type)&&side==='GOOD'&&lastUnhit)expect(outcomes[i].vof).toBe('G');
   }
   if(['usMortar','germanMortar'].includes(type))for(const v of survivors.filter(v=>v.kind==='MORTAR'&&v.steps.length===1))expect(v.ammo.MTR).toBe(u.initial_resources.ammo.MTR);
  });
 });
}
for(const side of ['P','L','F','A'])for(const effect of effects)it(`existing ${side} LAT / ${effect}`,()=>{
 const {s,u}=fixture('lat',1,side),id=u.id;u.assets={smoke:1};
 applyHit(s,u,effect);const live=Object.values(s.units).filter(v=>v.steps.length&&!v.removed);
 expect(live.length).toBe(effect[0]==='C'?0:1);
 if(live.length){expect(live[0].cohesion).toBe(effect[0]);expect(live[0].pinned).toBe(true);expect(live[0].assets).toEqual({smoke:1});}
 if(effect[0]===side){expect(live[0].id).toBe(id);expect(s.assets).toHaveLength(0);}
});
it('all specialist audit controls pass, including the corrected 88mm interpretation',()=>{
 expect(auditSpecialistBreakdowns().results.filter(r=>!r.passed)).toEqual([]);
});
it('A/S donors supply A/S but not belt-fed A; donor selection brings the weapon into the chosen subset',()=>{
 const plain={cohesion:'F',fire_team_vof:'S',range:1},as={...plain,fire_team_vof:'A/S'},mg={...plain,fire_team_vof:'A'};
 const profile={steps:2,vof:'A/S'};
 expect(reconstitutionFirepower(profile,[as,plain])).toBe(true);
 expect(reconstitutionFirepower({...profile,vof:'A'},[as,plain])).toBe(false);
 expect(reconstitutionFirepower(profile,[plain,plain])).toBe(false);
 expect(reconstitutionFirepower(profile,[{...as,cohesion:'A',range:0},plain])).toBe(false);
 expect(reconstitutionFirepower(profile,[mg,plain])).toBe(true);
 expect(reconstitutionDonors(profile,[plain,plain,as])).toEqual([as,plain]);
 expect(reconstitutionFirepower(profile,[as,plain],false)).toBe(false);
});
it('named Fire Teams retain their counter on A/F and use Green for later HIT draws',()=>{
 const {s,u}=fixture('hq',1);applyHit(s,u,'F');
 for(const effect of ['A','F']){applyHit(s,u,effect);expect(s.units[u.id]).toMatchObject({cohesion:'F',experience:'Green',original_experience:'Veteran'});}
 s.fire=[{source:'outside',origin:'r2c3',target:u.location,value:0}];
 expect(prepareCombat(s)[0].target_experience).toBe('Green');
});
it('new rules and historical rules round-trip without rewriting attempt snapshots',()=>{
 for(const corrected of [true,false]){
  let s=createMission(cerisy,'hit-replay',{},null,{hit_breakdowns:corrected});
  expect(exportReplay(s).hit_breakdowns).toBe(corrected?'v1':undefined);
  expect(replayMission(cerisy,exportReplay(s))).toEqual(s);
  s=advancePhase(s).state;expect(replayMission(cerisy,exportReplay(s))).toEqual(s);
 }
 const s=createMission(cerisy,'hit-version');expect(()=>replayMission(cerisy,{...exportReplay(s),hit_breakdowns:'future'})).toThrow('Unsupported HIT');
});
it('LAT conversions preserve carried ammunition, equipment and casualty carriers',()=>{
 for(const before of ['P','L','F','A'])for(const effect of ['P','L','F','A']){
  const {s,u}=fixture('lat',1,before);u.ammo={MG:3,RKT:1};u.assets={smoke:1};u.radios=['CO'];
  s.casualties=[{id:'carried',carrier:u.id}];applyHit(s,u,effect);
  const survivor=Object.values(s.units).find(v=>v.steps.length&&!v.removed);
  expect(survivor.ammo).toEqual({MG:3,RKT:1});expect(survivor.assets).toEqual({smoke:1});
  expect(survivor.radios).toEqual(['CO']);expect(s.casualties[0].carrier).toBe(survivor.id);
 }
});
it('both FJ MG breakdown branches conserve odd ammunition and final affected-step weapons',()=>{
 const branches=new Set();
 for(let seed=0;seed<30;seed++)for(const effect of ['FF','CF']){
  const {s,u}=fixture('fjA',2,'GOOD',`odd-ammo-${seed}`);u.ammo.MG=5;u.initial_resources.ammo.MG=7;
  applyHit(s,u,effect);const teams=Object.values(s.units).filter(v=>v.steps.length&&!v.removed);
  expect(teams.reduce((n,v)=>n+(v.ammo?.MG??0),0)).toBe(5);
  expect(teams.reduce((n,v)=>n+(v.initial_resources.ammo?.MG??0),0)).toBe(7);
  expect(vofOf(teams.find(v=>v.steps.some(t=>t.id==='step1')))).toBe('A');
  if(effect==='FF')branches.add(teams.filter(v=>vofOf(v)==='A').length);
 }
 expect([...branches].sort()).toEqual([1,2]);
});
it('a final ammunition volley freezes weapon fire and experience before depletion and HIT',()=>{
 const {s,u}=fixture('bazooka',1);Object.assign(u,{kind:'HMG',vof:'H',fire_team_vof:'S',ammo:{MG:1},initial_resources:{radios:[],assets:{},ammo:{MG:1}}});
 const enemy={...structuredClone(u),id:'enemy',location:'r2c3',faction:'enemy',steps:[{id:'enemy-step',personnel:[]}],ammo:{},cohesion:'GOOD',pinned:false};
 s.units.enemy=enemy;u.fire=enemy.location;
 s.fire=[{source:u.id,origin:u.location,target:enemy.location,value:-3},{source:enemy.id,origin:enemy.location,target:u.location,value:-3}];
 prepareCombat(s);const own=s.pending_combat.find(r=>r.target_id===u.id),other=s.pending_combat.find(r=>r.target_id===enemy.id),frozen=structuredClone(other);
 expect(own.target_experience).toBe('Veteran');expect(other.sources.some(f=>f.source_id===u.id&&f.vof===-3)).toBe(true);
 expect(u).toMatchObject({ammo:{MG:0},cohesion:'F',experience:'Green',original_experience:'Veteran'});
 const combat=Object.values(cards).find(c=>c.id!==51&&c.combat[own.ncm+4]==='HIT');
 const effect=Object.values(cards).find(c=>c.id!==51&&c.hit.Veteran==='F');
 s.deck={order:[combat.id,effect.id],discard:[],draws:0,reshuffles:0};
 resolvePreparedCombat(s,own.id);
 expect(own.hit_card).toMatchObject({experience:'Veteran',effect:'F'});expect(other).toEqual(frozen);
 expect(u.steps).toHaveLength(1);expect(u.pinned).toBe(true);expect(s.deck.draws).toBe(2);
});
