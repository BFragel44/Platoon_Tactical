import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission} from '../src/sim/company/engine.js';
import {enemyActivity} from '../src/sim/company/combat.js';
import {cards} from '../src/sim/company/core.js';
function fresh(){
 const s=createMission({...trevieres,readiness:{playable:true}},'delay-execution');
 const u={...structuredClone(s.units.s11),id:'delay_enemy',name:'Delay enemy',faction:'enemy',location:'r3c2',cohesion:'GOOD',exposed:false,pinned:false,fire:null,contact_type:'C'};
 s.units={delay_enemy:u};s.enemy_tactics='delay_defense';
 for(const l of Object.values(s.locations)){l.terrain='open';l.building=false;l.borders={N:'light',S:'light',E:'light',W:'light'};l.elevation=0;l.known=true;l.covers=[];}
 return s;
}
const activity=s=>s.events.findLast(e=>e.type==='ENEMY_ACTIVITY'&&e.actor==='delay_enemy').action;
describe('Delay Defense execution',()=>{
 it('automatically falls back off the last row when an eligible heavy weapon is depleted',()=>{
  const s=fresh(),u=s.units.delay_enemy;u.vof='H';u.ammo={MG:0};u.out_of_ammo=true;u.tripod=true;
  enemyActivity(s);expect(activity(s)).toBe('FALL_BACK');expect(u.removed).toBeTruthy();
  expect(s.events.filter(e=>e.type==='CARDS_DRAWN'&&e.purpose==='Delay enemy: activity')).toHaveLength(0);
 });
 it('automatically hides without LOS and renews the unresolved contact only once',()=>{
  const s=fresh();for(const c of Object.values(s.contacts))c.resolved=true;
  enemyActivity(s);expect(activity(s)).toBe('HIDE');expect(s.units.delay_enemy.removed).toBe('HIDDEN');
  expect(Object.values(s.contacts).filter(c=>c.location==='r3c2'&&!c.resolved)).toHaveLength(1);
  expect(s.events.filter(e=>e.type==='CARDS_DRAWN'&&e.purpose==='Delay enemy: activity')).toHaveLength(0);
  enemyActivity(s);expect(s.events.filter(e=>e.type==='CONTACT_RENEWED')).toHaveLength(1);
 });
 it('uses Delay same-card probabilities rather than the deliberate fallback',()=>{
  const s=fresh(),u=s.units.delay_enemy;
  s.units.friend={...structuredClone(u),id:'friend',faction:'friendly',vof:null};
  const card=Object.values(cards).find(c=>c.random[3]===1);s.deck.order=Array(100).fill(card.id);
  enemyActivity(s);expect(activity(s)).toBe('NONE');expect(u.location).toBe('r3c2');
 });
 it('reproduces hidden activity exactly after JSON recovery',()=>{
  const s=fresh(),copy=JSON.parse(JSON.stringify(s));enemyActivity(s);enemyActivity(copy);expect(copy).toEqual(s);
 });
 it('does not hide from a visible Vire tank when no friendly infantry is on the battlefield',()=>{
  const s=fresh();s.mission_rules.vire=true;s.vire_runtime={vehicles:{tank:{id:'tank',profile:'M4_SHERMAN75',faction:'friendly',status:'ACTIVE',location:'r2c2',crew:[],ammo:5}}};
  enemyActivity(s);expect(activity(s)).not.toBe('HIDE');expect(s.units.delay_enemy.removed).toBeNull();
 });
});
