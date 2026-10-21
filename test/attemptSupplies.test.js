import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,prepareReattempt} from '../src/sim/company/engine.js';
import {projectAttemptPersonnel} from '../src/ui/reattemptDraft.js';
import {attemptSupplyStock,projectSupplyTransfers,supplyInventoryMarkup} from '../src/ui/attemptSupplies.js';
it('caps sequential transfers to stock, supports onward transfers, and never mutates the stock',()=>{
 const stock={a:{name:'HQ',items:{'EQUIPMENT:smoke':4}},b:{name:'Squad',items:{}},c:{name:'Team',items:{}}},before=structuredClone(stock);
 const result=projectSupplyTransfers(stock,[{from:'a',to:'b',item:'EQUIPMENT:smoke',quantity:3},{from:'a',to:'c',item:'EQUIPMENT:smoke',quantity:180},{from:'b',to:'c',item:'EQUIPMENT:smoke',quantity:2}]);
 expect(result.rows.map(r=>[r.max,r.quantity])).toEqual([[4,3],[1,1],[3,2]]);
 expect(Object.values(result.inventory).map(u=>u.items['EQUIPMENT:smoke'])).toEqual([0,1,3]);expect(stock).toEqual(before);
});
it('blocks invalid carriers, same-carrier moves, missing stock, negative and fractional quantities',()=>{
 const stock={a:{name:'HQ',items:{'RADIO:BN':2}},b:{name:'Squad',items:{}}};
 const rows=projectSupplyTransfers(stock,[{from:'a',to:'a',item:'RADIO:BN',quantity:1},{from:'missing',to:'b',item:'RADIO:BN',quantity:1},{from:'a',to:'b',item:'AMMO:MG',quantity:1},{from:'a',to:'b',item:'RADIO:BN',quantity:-1},{from:'a',to:'b',item:'RADIO:BN',quantity:1.8}]).rows;
 expect(rows.map(r=>r.quantity)).toEqual([0,0,0,0,1]);
});
it('matches actual replenishment after reconstitution, deployed wire, and redistribution',()=>{
 const s=createMission(trevieres,'supply-preview');s.status='DEFEAT';
 const donor=structuredClone(s.units.s11);Object.assign(donor,{id:'donor',kind:'LAT',cohesion:'F',steps:donor.steps.slice(0,1),max_steps:1,removed:null});s.units.donor=donor;
 s.units.s23.steps=[];s.units.s23.removed='ELIMINATED';
 s.units.co.initial_resources.assets.phone_line=4;s.units.co.initial_resources.assets.smoke=3;s.units.co.assets.smoke=0;
 s.phone_lines=[{id:'line1',owner:'co',location:'r0c2',cut:false}];
 donor.initial_resources={radios:['CO'],assets:{smoke:2},ammo:{}};
 const reconstitute={s23:['donor']},projection=projectAttemptPersonnel(s,{reconstitute});
 const stock=attemptSupplyStock(s,projection,reconstitute);
 expect(stock.donor).toBeUndefined();expect(stock.co.items['EQUIPMENT:phone_line']).toBe(3);expect(stock.co.items['EQUIPMENT:smoke']).toBe(3);
 const result=projectSupplyTransfers(stock,[{from:'co',to:'s23',item:'EQUIPMENT:smoke',quantity:180}]);
 const positions=Object.fromEntries(Object.values(projection.units).filter(u=>u.steps.length&&!projection.consumed.has(u.id)).map(u=>[u.id,'r0c2']));
 const actual=prepareReattempt(s,{positions,reconstitute,redistribute:result.rows.map(r=>({from:r.from,to:r.to,type:'EQUIPMENT',key:'smoke',quantity:r.quantity}))}).state;
 for(const [id,u] of Object.entries(result.inventory)){
  expect(u.items['EQUIPMENT:smoke']??0).toBe(actual.units[id].assets.smoke??0);
  expect(u.items['EQUIPMENT:phone_line']??0).toBe(actual.units[id].assets.phone_line??0);
 }
});
it('renders item quantities, decorative artwork and explicit empty inventories safely',()=>{
 const html=supplyInventoryMarkup({a:{name:'HQ <one>',items:{'EQUIPMENT:smoke':2,'RADIO:CO':1}},b:{name:'Empty',items:{}}});
 expect(html).toContain('HQ &lt;one&gt;');expect(html).toContain('×2');expect(html).toContain('/counters/smoke.png');expect(html).toContain('No carried supplies');
});
