import {describe,it,expect} from 'vitest';
import {combinedExperience,reconstitutionFirepower,reconstitutionLoads,reconstitutionDonors} from '../src/sim/company/reconstitution.js';
import {createMission,prepareReattempt,submitCommand} from '../src/sim/company/engine.js';
import {availableCounters} from '../src/sim/company/missionContacts.js';
import {applyHit} from '../src/sim/company/combat.js';
import {chain} from '../src/sim/company/battlefield.js';
import {trevieres} from '../src/scenarios/trevieres.js';
const fresh=seed=>createMission({...trevieres,readiness:{playable:true}},seed);
const positions=s=>Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
describe('Normandy reconstitution source boundaries',()=>{
 it('counts HQ-originated General Initiative separately from ordinary orders',()=>{
  const s=fresh('general-origins');s.phase='GENERAL_INITIATIVE';
  s.impulse={id:'general-fixture',hq:'general',commands:2,spent:7,origin_spent:{}};
  s.units.s11.location=s.units.co.location;s.units.hq1.steps=[];s.units.hq1.removed='LOST';
  const command={type:'RECONSTITUTE_HQ',issuer_id:'co',unit_id:'s11',target_id:'hq1'};
  const r=submitCommand(s,command);expect(r.accepted).toBe(true);
  expect(r.state.impulse.origin_spent.co).toBe(1);
  s.impulse.origin_spent.co=6;expect(submitCommand(s,command).reason).toContain('six-command');
 });
 it('enforces staff rank and denies company orders to visiting higher HQ',()=>{
  const s=fresh('staff-rank');
  expect(chain(s.units.staff,s.units.xo,'MOVE')).toBe(false);
  expect(chain(s.units.xo,s.units.staff,'MOVE')).toBe(true);
  expect(chain(s.units.co,{command_role:'higher_hq',id:'visitor'},'MOVE')).toBe(false);
 });
 for(const [levels,expected]of [
  [['Line','Green'],'Green'],[['Veteran','Green'],'Line'],[['Veteran','Veteran'],'Veteran'],
  [['Line','Line','Green'],'Line'],[['Line','Green','Green'],'Green'],[['Veteran','Green','Green'],'Line'],
  [['Veteran','Veteran','Line'],'Veteran'],[['Veteran','Veteran','Green'],'Line'],
  [['Line','Line','Green','Green'],'Green'],[['Line','Line','Line','Green'],'Line'],
  [['Veteran','Veteran','Green','Green'],'Line'],[['Veteran','Veteran','Veteran','Green'],'Veteran'],
 ])it(`combines ${levels.join('/')} as ${expected}`,()=>expect(combinedExperience(levels.map(experience=>({experience})))).toBe(expected));
 it('does not rebuild a machine-gun squad from point-blank Assault Teams',()=>{
  const profile=trevieres.enemy_counters.find(p=>p.id==='gr1');
  const assault={cohesion:'A',vof:'A',range:0};
  expect(reconstitutionFirepower(profile,[assault,assault])).toBe(false);
  const fire={cohesion:'F',vof:'A',fire_team_vof:'A',range:2};
  expect(reconstitutionFirepower(profile,[fire,assault])).toBe(true);
  expect(reconstitutionFirepower(trevieres.enemy_counters.find(p=>p.id==='gr4'),[assault,assault])).toBe(true);
  const selected=reconstitutionDonors(profile,[assault,assault,assault,fire]);
  expect(selected).toHaveLength(3);expect(selected).toContain(fire);
  expect(reconstitutionFirepower(profile,selected)).toBe(true);
 });
 it('retains carried items and ammunition without cloning the donor inventory',()=>{
  const s={casualties:[{carrier:'fire'}]},unit={id:'rebuilt',steps:[{id:'a'},{id:'f'}],vof:'S'};
  const donors=[{id:'assault',cohesion:'A',radios:['CO'],assets:{wp:1},ammo:{MG:2}},{id:'fire',cohesion:'F',radios:['CO'],assets:{},ammo:{MG:1}}];
  reconstitutionLoads(s,unit,donors);
  expect(unit).toMatchObject({experience:'Green',original_experience:'Green',radios:['CO','CO'],assets:{wp:1},ammo:{MG:3}});
  expect(unit.initial_resources).toEqual({radios:['CO','CO'],assets:{wp:1},ammo:{MG:3}});
  expect(donors.every(u=>!u.initial_resources.radios.length&&!Object.keys(u.initial_resources.assets).length)).toBe(true);
  expect(s.casualties[0].carrier).toBe('rebuilt');
  expect(donors.every(u=>!u.radios.length&&!Object.keys(u.ammo).length)).toBe(true);
  expect(unit.steps.every(t=>t.experience==='Green')).toBe(true);
 });
 it('restocks inherited cargo on the rebuilt counter without restoring obsolete equipment',()=>{
  const s=fresh('cargo-restock'),target=s.units.s12;
  const donors=['cargo_a','cargo_b'].map((id,i)=>s.units[id]={...structuredClone(s.units.s11),id,kind:'LAT',named:false,cohesion:'F',steps:[s.units.s11.steps[i]],radios:['CO'],assets:{wp:1},ammo:{MG:0},initial_resources:{radios:['CO'],assets:{wp:2},ammo:{MG:3}}});
  target.steps=donors.flatMap(u=>u.steps);target.initial_resources={radios:['BN'],assets:{obsolete:1},ammo:{}};
  reconstitutionLoads(s,target,donors);for(const donor of donors){donor.steps=[];donor.removed='RECONSTITUTED';}
  expect(target.assets.wp).toBe(2);expect(target.ammo.MG).toBe(0);
  s.status='DEFEAT';const next=prepareReattempt(s,{positions:positions(s)}).state;
  expect(next.units.s12.radios).toEqual(['CO','CO']);expect(next.units.s12.assets).toEqual({wp:4});expect(next.units.s12.ammo).toEqual({MG:6});
  expect(s.units.s12.ammo.MG).toBe(0);
 });
 it('frees a broken squad counter but retains a named LMG counter on its Fire Team side',()=>{
  const s=fresh('finite-counters');
  for(const profile of [trevieres.enemy_counters[0],trevieres.enemy_counters.find(p=>p.kind==='LMG')]){
   const u={...structuredClone(s.units.s11),...structuredClone(profile),id:profile.id,counter_id:profile.id,faction:'enemy',location:'r2c2',steps:structuredClone(s.units.s11.steps.slice(0,profile.steps)),max_steps:profile.steps,named:profile.kind!=='SQUAD'};s.units[u.id]=u;
   expect(availableCounters(s,profile.kind).some(p=>p.id===profile.id)).toBe(false);
   applyHit(s,u,'F');if(profile.kind==='SQUAD')applyHit(s,u,'F');
   expect(availableCounters(s,profile.kind).some(p=>p.id===profile.id)).toBe(profile.kind==='SQUAD');
   if(profile.kind==='LMG'){expect(u.cohesion).toBe('F');applyHit(s,u,'C');expect(availableCounters(s,profile.kind).some(p=>p.id===profile.id)).toBe(true);}
  }
 });
 it.each(['MORTAR','HMG','LMG','FLAK88','SNIPER','SPOTTER','LEADER'])('restores a surviving named %s Fire Team while preserving its identity',kind=>{
  const s=fresh(`named-${kind}`),profile=trevieres.enemy_counters.find(p=>p.kind===kind);
  s.units.named_enemy={...structuredClone(s.units.s11),...structuredClone(profile),id:'named_enemy',counter_id:profile.id,named:true,faction:'enemy',location:'r2c2',steps:[{id:'enemy-survivor',experience:'Green',personnel:[]}],cohesion:'F',original_experience:'Line',experience:'Green',initial_resources:{radios:[],assets:{},ammo:structuredClone(profile.ammo??{}),...(profile.missions?{missions:profile.missions}:{})}};
  s.status='DEFEAT';const next=prepareReattempt(s,{positions:positions(s)}).state,u=next.units.named_enemy;
  expect(u.cohesion).toBe('GOOD');expect(u.experience).toBe('Line');expect(u.steps[0].id).toBe('enemy-survivor');expect(u.counter_id).toBe(profile.id);
 });
 it('transfers reattempt donors cargo without cloning the eliminated original counter load',()=>{
  const s=fresh('preparation-cargo'),target=s.units.s12;
  const step=s.units.s11.steps.pop();s.units.cargo={...structuredClone(s.units.s11),id:'cargo',kind:'LAT',named:false,cohesion:'A',steps:[step],radios:['CO'],assets:{wp:0},ammo:{},initial_resources:{radios:['CO'],assets:{wp:2},ammo:{}}};
  target.steps=[];target.removed='LOST';target.radios=[];target.assets={};target.initial_resources={radios:['BN'],assets:{wp:2},ammo:{}};s.status='DEFEAT';
  const placement=positions(s);placement.s12='r0c2';delete placement.cargo;
  const next=prepareReattempt(s,{positions:placement,reconstitute:{s12:['cargo']}}).state;
  expect(next.units.s12.radios).toEqual(['CO']);expect(next.units.s12.assets).toEqual({wp:2});expect(next.units.s12.experience).toBe('Green');
  expect(next.units.cargo.initial_resources.assets).toEqual({});expect(s.units.cargo.steps).toHaveLength(1);
 });
 it('rejects attachment restoration and unknown preparation fields',()=>{
  const s=fresh('attachment');s.status='DEFEAT';s.units.mg1.attachment=true;
  const step=s.units.s11.steps.pop();s.units.donor={...structuredClone(s.units.s11),id:'donor',kind:'LAT',steps:[step],cohesion:'F'};
  s.units.mg1.steps=[];s.units.mg1.removed='LOST';
  expect(()=>prepareReattempt(s,{positions:positions(s),reconstitute:{mg1:['donor']}})).toThrow('Invalid reconstitution');
  expect(()=>prepareReattempt(s,{positions:positions(s),unknown:true})).toThrow('Unknown reattempt');
 });
 it('randomizes competition for scarce cover while preserving occupied enemy cover',()=>{
  const chosen=new Set();
  for(let n=0;n<12;n++){
   const s=fresh(`cover-${n}`);s.status='DEFEAT';
   s.locations.r2c2.covers=[{id:'best',type:'Cover',value:3,capacity:1},{id:'occupied',type:'Cover',value:2,capacity:1}];
   for(const id of ['a','b','c'])s.units[id]={...structuredClone(s.units.s11),id,faction:'enemy',location:'r2c2',steps:[s.units.s11.steps[0]],cover:id==='c'?'occupied':null};
   const next=prepareReattempt(s,{positions:positions(s)}).state;
   expect(next.units.c.cover).toBe('occupied');
   chosen.add(['a','b'].find(id=>next.units[id].cover==='best'));
  }
  expect(chosen).toEqual(new Set(['a','b']));
 });
});
