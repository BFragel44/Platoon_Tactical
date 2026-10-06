import {pickUpAmmunition,dropAmmunition} from '../src/sim/company/ammunition.js';
import {applyHit} from '../src/sim/company/combat.js';
import {it,expect} from 'vitest';
import {createMission,submitCommand,prepareReattempt,endTurn,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {dropLoad} from '../src/sim/company/core.js';
import {trevieres} from '../src/scenarios/trevieres.js';
const fresh=()=>createMission({...trevieres,readiness:{playable:true}},'recovered-cargo');
const positions=s=>Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));
it.each(['RADIO','EQUIPMENT'])('reattempt restores recovered %s once on its new carrier',type=>{
 let s=fresh();const source=s.units.co,recipient=s.units.s11;
 recipient.location=source.location;source.radios=['CO','CO'];source.assets={wp:2};source.initial_resources={radios:['CO','CO'],assets:{wp:2},ammo:{}};
 dropLoad(s,source);const asset=s.assets.find(a=>a.type===type);
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'recovery',hq:'general',commands:1,spent:0};
 const r=submitCommand(s,{type:'PICKUP_RADIO',unit_id:recipient.id,issuer_id:'co',target_id:asset.id});expect(r.accepted).toBe(true);s=r.state;
 s.status='DEFEAT';const next=prepareReattempt(s,{positions:positions(s)}).state;
 if(type==='RADIO'){expect(next.units.s11.radios).toEqual(['CO']);expect(next.units.co.radios).toEqual(['CO']);}
 else{expect(next.units.s11.assets.wp).toBe(2);expect(next.units.co.assets.wp).toBeUndefined();}
 expect(next.assets).toEqual([]);expect(s.assets.length).toBeGreaterThan(0);
});
it('dropping and recovering your own equipment leaves its allocation unchanged',()=>{
 let s=fresh(),u=s.units.co;dropLoad(s,u);const asset=s.assets.find(a=>a.type==='RADIO');
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'self-recovery',hq:'general',commands:1,spent:0};
 s=submitCommand(s,{type:'PICKUP_RADIO',unit_id:u.id,issuer_id:'co',target_id:asset.id}).state;
 expect(s.units.co.initial_resources.radios).toEqual(u.initial_resources.radios);
});

it('loses ammunition with a final casualty instead of creating recoverable rounds',()=>{
 const s=fresh(),u=s.units.mg1;u.assets={wp:1};const location=u.location;
 applyHit(s,u,'C');
 expect(s.assets.some(a=>a.type==='AMMO'&&a.location===location)).toBe(false);
 expect(s.assets.some(a=>a.type==='EQUIPMENT'&&a.key==='wp')).toBe(true);
 expect(s.events.some(e=>e.type==='AMMO_LOST'&&e.actor===u.id)).toBe(true);
});

it('keeps partial recovered ammunition allocations finite across reattempt',()=>{
 const s=fresh(),from=s.units.mg1,to=s.units.s11;to.location=from.location;
 const stock=from.initial_resources.ammo.MG;dropAmmunition(s,from);const asset=s.assets.find(a=>a.type==='AMMO');asset.quantity=2;
 pickUpAmmunition(s,to,asset);expect(to.initial_resources.ammo.MG).toBe(2);expect(from.initial_resources.ammo.MG).toBe(stock-2);
 s.status='DEFEAT';const next=prepareReattempt(s,{positions:positions(s)}).state;
 expect(next.units.s11.ammo.MG+next.units.mg1.ammo.MG).toBe(stock);expect(next.assets).toEqual([]);
});
it('redistributes replenished stock once and records the immutable attempt choice',()=>{
 const s=fresh();s.status='DEFEAT';const transfer={from:'mg1',to:'s11',type:'AMMO',key:'MG',quantity:2};
 const next=prepareReattempt(s,{positions:positions(s),redistribute:[transfer]}).state;
 expect(next.units.mg1.ammo.MG).toBe(2);expect(next.units.s11.ammo.MG).toBe(2);
 expect(next.attempt_records[1].choices.redistribute).toEqual([transfer]);expect(next.replay.at(-1).choices.redistribute).toEqual([transfer]);
 expect(s.units.mg1.ammo.MG).toBe(4);
});
it.each([0,-1,1.5,5])('rejects invalid redistribution quantity %s without changing the first attempt',quantity=>{
 const s=fresh();s.status='DEFEAT';const before=structuredClone(s);
 expect(()=>prepareReattempt(s,{positions:positions(s),redistribute:[{from:'mg1',to:'s11',type:'AMMO',key:'MG',quantity}]})).toThrow();expect(s).toEqual(before);
});
it('rejects spending the same replenished stock twice',()=>{
 const s=fresh();s.status='DEFEAT';const move={from:'mg1',to:'s11',type:'AMMO',key:'MG',quantity:3};
 expect(()=>prepareReattempt(s,{positions:positions(s),redistribute:[move,move]})).toThrow('Insufficient stock');
});

it('strictly replays a terminal first attempt and player supply redistribution',()=>{
 let s=fresh();for(let n=0;n<10;n++)s=endTurn(s).state;
 s=prepareReattempt(s,{positions:positions(s),redistribute:[{from:'mg1',to:'s11',type:'AMMO',key:'MG',quantity:2}]}).state;
 expect(replayMission({...trevieres,readiness:{playable:true}},exportReplay(s))).toEqual(s);
},20000);
