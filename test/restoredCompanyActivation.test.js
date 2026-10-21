import {it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {commandOptions} from '../src/sim/company/actions.js';
import {communicationChannels} from '../src/sim/company/battlefield.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';

function restored(){
 let s=createMission(stGeorges,'restored-company-activation',{patrol:{...stGeorges.patrol_plan,platoon:2}});
 for(const id of ['co','xo','hq2','staff'])Object.assign(s.units[id],{location:'r1c2',cover:null,pinned:false,cohesion:'GOOD',removed:null});
 s.units.co.steps=[];s.units.co.removed='CASUALTY';
 s.phase='STAFF_INITIATIVE';s.impulse={id:'restore',hq:'xo',commands:4,spent:0};
 const r=submitCommand(s,{type:'RECONSTITUTE_HQ',issuer_id:'xo',unit_id:'xo',target_id:'co'});
 expect(r.accepted,r.reason).toBe(true);s=r.state;
 s.phase='CO_ACTIVATION';s.impulse={id:'company-next-turn',hq:'co',commands:4,spent:0};s.activated=['co'];
 return s;
}
it('a reconstituted CO activates same-area HQs without needing a radio',()=>{
 const s=restored();
 expect(communicationChannels(s,s.units.co,s.units.hq2)).toContain('Visual / verbal');
 const menu=commandOptions(s,s.units.co,'co').find(o=>o.type==='ACTIVATE');
 expect(menu.targets.find(t=>t.id==='hq2').reason).toBeNull();
 const r=submitCommand(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq2'});
 expect(r.accepted,r.reason).toBe(true);expect(r.state.activated).toContain('hq2');
});
it('a restored CO can recover a field phone and activate through it across cover areas',()=>{
 let s=restored();s.mission_rules.communications='phones';s.assets.push({id:'recovered-phone',type:'RADIO',net:'CO_PHONE',location:'r1c2',cover:null,faction:'friendly'});
 const pickup=submitCommand(s,{type:'PICKUP_RADIO',unit_id:'co',issuer_id:'co',target_id:'recovered-phone'});
 expect(pickup.accepted,pickup.reason).toBe(true);s=pickup.state;
 s.units.hq2.cover=s.locations.r1c2.covers[0].id;s.units.hq2.radios=['CO_PHONE'];
 expect(communicationChannels(s,s.units.co,s.units.hq2)).toContain('CO field-phone network · intact line');
 const r=submitCommand(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq2'});
 expect(r.accepted,r.reason).toBe(true);
});
it('activation remains restricted to Company activation, even with same-area voice',()=>{
 const s=restored();s.phase='CO_INITIATIVE';
 const r=submitCommand(s,{type:'ACTIVATE',unit_id:'co',issuer_id:'co',target_id:'hq2'});
 expect(r.accepted).toBe(false);expect(r.reason).toContain('activation impulse');
});
