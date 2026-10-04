import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission} from '../src/sim/company/engine.js';
import {packageAvailable,placePackage} from '../src/sim/company/missionContacts.js';
import {specialActivity} from '../src/sim/company/specialEnemies.js';

const candidate={...trevieres,readiness:{playable:true}};
const fixture=seed=>{
 const s=createMission(candidate,seed);s.units.s11.location='r1c2';
 for(const l of Object.values(s.locations))if(l.row>0){l.terrain='open';l.building=false;l.multi_story=false;l.tower=false;l.borders={N:'light',S:'light',E:'light',W:'light'};l.smoke=false;l.elevation=1;l.known=true;}
 return {s,pc:s.contacts.pc_r1c2};
};
describe('Normandy package placement fixtures',()=>{
 for(let number=1;number<=12;number++)it(`places package ${number} with its authored counters`,()=>{
  const {s,pc}=fixture(`pkg-${number}`),p=s.mission_contacts.packages[number];
  expect(packageAvailable(s,pc,p)).toBe(true);
  expect(placePackage(s,pc,p)).toBe(true);
  expect(Object.values(s.units).filter(u=>u.faction==='enemy').every(u=>trevieres.enemy_counters.some(c=>c.id===u.counter_id))).toBe(true);
 });
 const branches=[
  ['mines with sniper',1,p=>({mines:true,units:p.optional.units})],
  ['artillery spotter',2,p=>({...p,incoming_options:[p.incoming_options[0]]})],
  ['mortar spotter',2,p=>({...p,incoming_options:[p.incoming_options[1]]})],
  ['LMG point blank',5,p=>({...p.alternatives[0],point_blank_chance:undefined,point_blank:true})],
  ['HMG nest',5,p=>p.alternatives[1]],
  ['strongpoint HMG',6,p=>({...p,optional:undefined,units:[...p.units,...p.optional.units]})],
  ['strongpoint close',6,p=>({...p,optional:undefined,close_chance:undefined,close_range:true})],
  ['defensive leader',7,p=>({...p,optional:undefined,units:[...p.units,...p.optional.units]})],
  ['defensive close',7,p=>({...p,optional:undefined,close_chance:undefined,close_range:true})],
 ];
 for(const [name,number,variant] of branches)it(`places ${name} branch`,()=>{
  const {s,pc}=fixture(`branch-${name}`),p=variant(s.mission_contacts.packages[number]);
  expect(packageAvailable(s,pc,p)).toBe(true);
  expect(placePackage(s,pc,p)).toBe(true);
  if(name==='LMG point blank')expect(Object.values(s.units).find(u=>u.faction==='enemy').location).toBe(pc.location);
  if(name==='strongpoint HMG')expect(Object.values(s.units).filter(u=>u.faction==='enemy').map(u=>u.kind)).toContain('HMG');
  if(name==='defensive leader')expect(Object.values(s.units).filter(u=>u.faction==='enemy').map(u=>u.kind)).toContain('LEADER');
  if(name.endsWith('spotter')){
   const u=Object.values(s.units).find(u=>u.kind==='SPOTTER');
   expect(u.missions_remaining).toBe(1);expect(u.calls_made).toBe(1);
   u.missions_remaining=0;s.turn++;
   const draws=s.deck.draws,support=s.support.length;
   specialActivity(s,u,()=>{});
   expect(s.deck.draws).toBe(draws);expect(s.support).toHaveLength(support);
  }
 });
});
