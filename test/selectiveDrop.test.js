import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,exportReplay,replayMission,getPlayerView} from '../src/sim/company/engine.js';
import {transportReason} from '../src/sim/company/core.js';
import {selectiveDropMarkup} from '../src/ui/unitDetails.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const fresh=()=>createMission(trevieres,'selective-drop',{command_network:'phones'});
const drop=(state,items,unit='co')=>submitCommand(state,{type:'DROP_LOAD',unit_id:unit,drop_items:items});
const lines=quantity=>({type:'EQUIPMENT',key:'phone_line',quantity});
it('drops two phone lines while retaining radios and other equipment, freely and replayably',()=>{
 const s=fresh(),before=structuredClone(s),radios=[...s.units.co.radios],n=drop(s,[lines(2)]);
 expect(n.accepted).toBe(true);expect(n.state.units.co.assets.phone_line).toBe(2);expect(n.state.units.co.radios).toEqual(radios);expect(n.state.units.co.assets.rsp).toBe(s.units.co.assets.rsp);
 expect(n.state.assets).toContainEqual(expect.objectContaining({type:'EQUIPMENT',key:'phone_line',quantity:2,source_unit:'co',location:s.units.co.location,cover:s.units.co.cover}));
 expect(n.state.units.co.exposed).toBe(s.units.co.exposed);expect(n.state.impulse).toEqual(s.impulse);expect(n.state.deck).toEqual(s.deck);expect(s).toEqual(before);
 expect(replayMission(trevieres,exportReplay(n.state))).toEqual(n.state);expect(resumeCheckpoint(trevieres,checkpoint(n.state)).state).toEqual(n.state);
 const view=getPlayerView(n.state),markup=selectiveDropMarkup(view.units.find(u=>u.id==='co'));expect(markup).toContain('Choose items to drop');expect(markup).toContain('data-drop-key="phone_line"');
});
it('can drop one duplicate radio and selected ammo while retaining the other radio and casualty',()=>{
 const s=fresh(),u=s.units.co;u.radios=['CO_PHONE','CO_PHONE','BN'];u.ammo={MG:3};s.casualties.push({id:'carried',carrier:u.id,location:u.location,faction:'friendly'});
 const n=drop(s,[{type:'RADIO',key:'CO_PHONE',quantity:1},{type:'AMMO',key:'MG',quantity:2}]).state;
 expect(n.units.co.radios).toEqual(['CO_PHONE','BN']);expect(n.units.co.ammo.MG).toBe(1);expect(n.casualties[0].carrier).toBe('co');expect(n.assets.filter(a=>a.type==='RADIO')).toHaveLength(1);
 expect(n.assets.find(a=>a.type==='AMMO').quantity).toBe(2);
});
for(const cohesion of ['GOOD','L','P'])it(`permits free selected dropping by ${cohesion} units even pinned with no impulse`,()=>{
 const s=fresh();s.units.co.cohesion=cohesion;s.units.co.pinned=true;s.impulse=null;const n=drop(s,[lines(1)]);expect(n.accepted).toBe(true);expect(n.state.units.co.pinned).toBe(true);expect(n.state.units.co.exposed).toBe(false);
});
it('validates the complete selection before changing anything',()=>{
 const s=fresh();for(const items of [[],[lines(5)],[lines(0)],[lines(1.5)],[lines(1),lines(1)],[lines(1),{type:'RADIO',key:'missing',quantity:1}],[{type:'EQUIPMENT',key:'__proto__',quantity:1}]]){
  const before=structuredClone(s),n=drop(s,items);expect(n.accepted).toBe(false);expect(n.state).toEqual(before);expect(s).toEqual(before);
 }
});
it('drops only the chosen casualty at the carrier location and cover',()=>{
 const s=fresh();s.casualties=[{id:'a',carrier:'co'},{id:'b',carrier:'co'}];const n=drop(s,[{type:'CASUALTY',key:'a',quantity:1}]).state;
 expect(n.casualties[0]).toMatchObject({carrier:null,location:s.units.co.location,cover:s.units.co.cover});expect(n.casualties[1].carrier).toBe('co');
});
it('relieves excess asset load and leaves Drop all behavior available',()=>{
 const s=fresh();s.units.co.assets.phone_line=8;expect(transportReason(s,s.units.co)).toBeTruthy();const n=drop(s,[lines(8)]).state;expect(transportReason(n,n.units.co)).toBeNull();
 const all=submitCommand(s,{type:'DROP_LOAD',unit_id:'co'});expect(all.accepted).toBe(true);expect(all.state.units.co.radios).toEqual([]);expect(all.state.units.co.assets).toEqual({});
});
it('keeps selectively dropped lines recoverable and transfers their resupply allocation once',()=>{
 let s=drop(fresh(),[lines(2)]).state;const asset=s.assets.find(a=>a.key==='phone_line');s.units.hq1.location=s.units.co.location;s.units.hq1.cover=s.units.co.cover;s.impulse={id:'pickup',hq:'general',commands:2,spent:0};
 const n=submitCommand(s,{type:'PICKUP_RADIO',unit_id:'hq1',issuer_id:'co',target_id:asset.id});expect(n.accepted).toBe(true);
 expect(n.state.units.hq1.assets.phone_line).toBe(2);expect(n.state.units.co.initial_resources.assets.phone_line).toBe(2);expect(n.state.units.hq1.initial_resources.assets.phone_line).toBe(2);
 expect(n.state.assets.some(a=>a.id===asset.id)).toBe(false);
});
