import {it,expect} from 'vitest';
import {createMission,submitCommand} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {resolveNormandyEvent} from '../src/sim/company/normandyEvents.js';
import {communication,communicationChannels} from '../src/sim/company/battlefield.js';
import {successionPriority} from '../src/sim/company/commandRoles.js';
import {cards} from '../src/sim/company/core.js';
function fresh(){const s=createMission(trevieres,'higher-hq-fixes');s.turn=2;s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};s.units.co.location='r2c2';s.units.co.cover=null;return s;}
function visitor(s,profile){
 const index=['REGIMENTAL_STAFF','BATTALION_COMMANDER','BATTALION_STAFF'].indexOf(profile),c=Object.values(cards).find(c=>c.id!==51&&c.random[1]===index+1);
 s.deck.order=[c.id,...s.deck.order];s.pending_event={side:'friendly',code:'CHECKING_UP',turn:2};s.hq_events.push({side:'friendly',code:'CHECKING_UP',turn:2});resolveNormandyEvent(s,'friendly');
 const u=Object.values(s.units).find(u=>u.command_role==='higher_hq');expect(u.higher_hq_profile).toBe(profile);expect(u.radios).toEqual([]);return u;
}
for(const profile of ['REGIMENTAL_STAFF','BATTALION_COMMANDER','BATTALION_STAFF'])for(const net of ['CO','CO_PHONE'])it(`${profile} ${net}: equipment carriage does not override net eligibility`,()=>{
 let s=fresh();const u=visitor(s,profile);u.location='r2c1';
 if(net==='CO_PHONE'){s.mission_rules.communications='phones';s.units.co.radios=['BN','CO_PHONE'];}
 s.assets.push({id:'radio',type:'RADIO',net,faction:'friendly',location:u.location,cover:null});
 let r=submitCommand(s,{type:'PICKUP_RADIO',unit_id:u.id,target_id:'radio'});expect(r.accepted,r.reason).toBe(true);s=r.state;
 expect(s.units[u.id].radios).toContain(net);expect(communication(s,s.units[u.id],s.units.co)).toBeNull();expect(communication(s,s.units.co,s.units[u.id])).toBeNull();
 // Same card but another area: voice is unavailable; phone/CO eligibility matters.
 const v=s.units[u.id];v.location=s.units.co.location;v.pinned=true;
 expect(!!communication(s,v,s.units.co)).toBe(profile!=='REGIMENTAL_STAFF');
 v.pinned=false;v.radios=[];expect(communication(s,v,s.units.co)).toBe('Visual / verbal');
});
for(const profile of ['BATTALION_COMMANDER','BATTALION_STAFF'])it(`${profile} can activate CO over actual BN radios even under cover, without CO LOS`,()=>{
 const s=fresh(),u=visitor(s,profile);u.location='r3c4';u.radios=['BN'];u.pinned=true;u.cover='visitor-cover';s.locations[u.location].covers.push({id:u.cover,type:'Cover',value:1});s.units.co.radios=['BN'];s.units.co.cover='co-cover';s.locations.r2c2.covers.push({id:'co-cover',type:'Cover',value:1});
 expect(communication(s,u,s.units.co)).toContain('BN radio');expect(communication(s,s.units.co,u)).toContain('BN radio');
 s.phase='BN_ACTIVATION';s.impulse.hq=u.id;const r=submitCommand(s,{type:'ACTIVATE',unit_id:u.id,issuer_id:u.id,target_id:'co'});expect(r.accepted,r.reason).toBe(true);expect(r.state.activated).toContain('co');
});
it.each(['regimental staff','company staff','platoon HQ','FO','missing visitor radio','missing CO radio','wrong FD net'])('BN communication rejects %s',kind=>{
 const s=fresh(),u=visitor(s,kind==='regimental staff'?'REGIMENTAL_STAFF':'BATTALION_STAFF');u.location='r2c1';u.radios=['BN'];s.units.co.radios=['BN'];
 if(kind==='company staff'){u.command_role='company_staff';delete u.higher_hq_profile;u.capabilities={};}
 if(kind==='platoon HQ'){u.command_role='platoon_commander';u.kind='HQ';delete u.higher_hq_profile;}
 if(kind==='FO'){u.command_role=undefined;u.kind='FO';delete u.higher_hq_profile;}
 if(kind==='missing visitor radio')u.radios=[];if(kind==='missing CO radio')s.units.co.radios=[];if(kind==='wrong FD net')u.radios=['MTR'];
 expect(communication(s,u,s.units.co)).toBeNull();
});
for(const profile of ['REGIMENTAL_STAFF','BATTALION_COMMANDER','BATTALION_STAFF'])for(const target of ['co','hq1'])it(`${profile} cannot be consumed to reconstitute ${target}`,()=>{
 const s=fresh(),u=visitor(s,profile);s.units[target].steps=[];s.units[target].removed='ELIMINATED';
 for(const id of ['xo','hq1','hq2','hq3','artyfo'])if(id!==target){s.units[id].steps=[];s.units[id].removed='ELIMINATED';}
 Object.assign(s.units.staff,{location:u.location,cover:u.cover});const before=structuredClone(s);
 const r=submitCommand(s,{type:'RECONSTITUTE_HQ',unit_id:u.id,issuer_id:'staff',target_id:target});expect(r.accepted).toBe(false);expect(r.state).toEqual(before);expect(successionPriority(u)).toBe(99);
});
it('preserves legacy visitor identity from stored priority without using the display name',()=>{
 const s=fresh(),u=visitor(s,'REGIMENTAL_STAFF');delete u.higher_hq_profile;u.name='Renamed visitor';u.location='r2c1';u.radios=['CO'];expect(communication(s,u,s.units.co)).toBeNull();
 u.capabilities.higher_priority=2;u.radios=['BN'];expect(communication(s,u,s.units.co)).toContain('BN radio');
});
it('does not let unknown visitors inherit ordinary staff CO-net access or succession',()=>{
 const s=fresh(),u=visitor(s,'BATTALION_STAFF');delete u.higher_hq_profile;u.capabilities={};u.location='r2c1';u.radios=['CO'];expect(communicationChannels(s,u,s.units.co)).toEqual([]);expect(successionPriority(u)).toBe(99);
});
it('a visitor does not block valid company staff succession once earlier company successors are gone',()=>{
 const s=fresh();visitor(s,'REGIMENTAL_STAFF');s.units.co.steps=[];s.units.co.removed='ELIMINATED';
 for(const id of ['xo','hq1','hq2','hq3','artyfo']){s.units[id].steps=[];s.units[id].removed='ELIMINATED';}
 Object.assign(s.units.staff,{location:'r2c2',cover:null});
 const r=submitCommand(s,{type:'RECONSTITUTE_HQ',unit_id:'staff',issuer_id:'staff',target_id:'co'});expect(r.accepted,r.reason).toBe(true);expect(r.state.units.co.cohesion).toBe('GOOD');
});

