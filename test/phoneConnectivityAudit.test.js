import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {dropLoad} from '../src/sim/company/core.js';
import {eligibleTargets,commandOptions} from '../src/sim/company/actions.js';
import {equipmentAreaLabel} from '../src/ui/casualtyPresentation.js';
import {communication,communicationChannels} from '../src/sim/company/battlefield.js';
import {phoneConnected} from '../src/sim/company/phoneNetwork.js';
import {move,orderReason} from '../src/sim/company/actions.js';
function base(){
 const s=createMission(trevieres,'phone-audit',{command_network:'phones'});
 for(const u of Object.values(s.units))if(!['co','hq1'].includes(u.id))u.removed='RESERVE';
 Object.assign(s.units.co,{location:'r1c1',cover:null});Object.assign(s.units.hq1,{location:'r3c1',cover:null});return s;
}
it('does not grant wireless contact across an unwired empty card, including HQ activation',()=>{
 const s=base();expect(s.phone_lines).toEqual([]);expect(communication(s,s.units.co,s.units.hq1)).toBeNull();
 s.phase='CO_ACTIVATION';s.impulse={id:'check',hq:'co',commands:4,spent:0};
 expect(orderReason(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq1'})).toBeTruthy();
});
it('allows adjacent phones and a chain of phone-equipped formations with no line markers',()=>{
 const s=base();s.units.hq1.location='r2c1';expect(communication(s,s.units.co,s.units.hq1)).toContain('field-phone');
 s.units.hq1.location='r3c1';Object.assign(s.units.hq2,{removed:null,location:'r2c1'});expect(communication(s,s.units.co,s.units.hq1)).toContain('field-phone');
 s.units.hq2.removed='RESERVE';expect(communication(s,s.units.co,s.units.hq1)).toBeNull();
});
it('requires the Company HQ hub, rather than just a connection between two platoon phones',()=>{
 const s=base();s.units.co.location='r1c4';s.units.hq1.location='r3c1';Object.assign(s.units.hq2,{removed:null,location:'r3c2'});
 expect(phoneConnected(s,'r3c1','r3c2')).toBe(true);expect(communication(s,s.units.hq1,s.units.hq2)).toBeNull();
});
it('intact wire restores the gap and a cut removes it without a radio fallback',()=>{
 const s=base();s.phone_lines=[{id:'line',location:'r2c1',cut:false}];expect(communication(s,s.units.co,s.units.hq1)).toContain('field-phone');
 s.phone_lines[0].cut=true;expect(communication(s,s.units.co,s.units.hq1)).toBeNull();
 s.assets.push({id:'spool',type:'EQUIPMENT',key:'phone_line',quantity:2,location:'r2c1'});expect(communication(s,s.units.co,s.units.hq1)).toBeNull();
});
it('retains local voice contact even without a phone path',()=>{
 const s=base();s.units.hq1.location=s.units.co.location;s.units.hq1.radios=[];
 expect(communicationChannels(s,s.units.co,s.units.hq1)).toEqual(['Visual / verbal']);
});
it('uses field phones while pinned and across different cover areas',()=>{
 const s=base();s.units.hq1.location='r2c1';s.units.hq1.pinned=true;s.units.co.cover='different-cover';
 expect(communication(s,s.units.co,s.units.hq1)).toContain('field-phone');
});
it('lays a line automatically on the card being left and spends a carried line asset',()=>{
 const s=base(),u=s.units.co;u.location='r0c1';s.units.hq1.location='r0c2';
 const initial=u.assets.phone_line;move(s,u,'r1c1',false,'open');expect(u.assets.phone_line).toBe(initial);expect(s.phone_lines).toEqual([]);
 move(s,u,'r2c1',false,'open');expect(u.assets.phone_line).toBe(initial-1);expect(s.phone_lines).toContainEqual(expect.objectContaining({location:'r1c1',owner:'co',cut:false}));
 expect(communication(s,u,s.units.hq1)).toContain('field-phone');
});
it('recovers dropped unused phone-line supplies through Recover equipment',()=>{
 const s=base(),u=s.units.co;const quantity=u.assets.phone_line;
 expect(quantity).toBeGreaterThan(0);dropLoad(s,u,'test drop');
 const supply=s.assets.find(a=>a.key==='phone_line');
 expect(eligibleTargets(s,u,'PICKUP_RADIO')).toContain(supply.id);
 s.phase='CO_INITIATIVE';s.impulse={id:'recover-spare-wire',hq:'co',commands:4,spent:0};
 const r=submitCommand(s,{type:'PICKUP_RADIO',unit_id:'co',issuer_id:'co',target_id:supply.id});
 expect(r.accepted,r.reason).toBe(true);expect(r.state.units.co.assets.phone_line).toBe(quantity);
 expect(r.state.assets.some(a=>a.id===supply.id)).toBe(false);
});
it('keeps laid network wire separate from recoverable spare supplies',()=>{
 const s=base(),u=s.units.co;move(s,u,'r2c1',false,'open');
 const line=s.phone_lines.find(l=>l.location==='r1c1');expect(line).toBeTruthy();
 expect(eligibleTargets(s,u,'PICKUP_RADIO')).not.toContain(line.id);
});
it('explains wire in another cover area and recovers all four after entering that area',()=>{
 const s=base(),u=s.units.co,cover={id:'test-foxholes',type:'Foxholes',value:1,known:true};s.locations[u.location].covers.push(cover);
 u.radios=['CO_PHONE','BN'];u.assets={};
 s.assets.push({id:'four-lines',type:'EQUIPMENT',key:'phone_line',quantity:4,location:u.location,cover:cover.id,faction:'friendly'});
 s.phase='CO_ACTIVATION';s.impulse={id:'recover-four-lines',hq:'co',commands:4,spent:0};
 const option=commandOptions(s,u,'co').find(o=>o.type==='PICKUP_RADIO');
 expect(option.targets.find(t=>t.id==='four-lines').reason).toContain('different cover area');
 expect(equipmentAreaLabel({locations:Object.values(s.locations)},s.assets.at(-1))).toBe('C1 - Foxholes');
 expect(submitCommand(s,{type:'PICKUP_RADIO',unit_id:'co',issuer_id:'co',target_id:'four-lines'}).accepted).toBe(false);
 u.cover=cover.id;
 const r=submitCommand(s,{type:'PICKUP_RADIO',unit_id:'co',issuer_id:'co',target_id:'four-lines'});
 expect(r.accepted,r.reason).toBe(true);expect(r.state.units.co.assets.phone_line).toBe(4);
});
