import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {eligibleTargets,commandOptions,submitCommand} from '../src/sim/company/actions.js';
function fixture(corrected=true){
 const s=createMission(trevieres,'casualty-ownership',{},null,{casualty_pickup:corrected});
 const carrier=s.units.s11,picker=s.units.s12;
 for(const u of [carrier,picker])Object.assign(u,{location:'r1c1',cover:null,pinned:false,exposed:false,used:[]});
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'ownership',hq:'general',commands:4,spent:0};
 s.casualties=[{id:'casualty',origin_name:'1/1 Rifle Squad',faction:'friendly',location:'r1c1',cover:null,carrier:carrier.id,evacuated:false}];
 return {s,carrier,picker};
}
it('excludes a carried casualty and rejects stale pickup commands without spending commands',()=>{
 const {s,carrier,picker}=fixture(),before=structuredClone(s);
 expect(eligibleTargets(s,picker,'PICKUP_CASUALTY')).not.toContain('casualty');
 expect(commandOptions(s,picker,'general').find(o=>o.type==='PICKUP_CASUALTY').targets).toEqual([]);
 const result=submitCommand(s,{type:'PICKUP_CASUALTY',unit_id:picker.id,issuer_id:'general',target_id:'casualty'});
 expect(result.accepted).toBe(false);expect(s).toEqual(before);expect(result.state.casualties[0].carrier).toBe(carrier.id);expect(result.state.impulse.spent).toBe(0);
});
it('permits pickup after the first carrier drops the casualty and preserves single ownership',()=>{
 const {s,carrier,picker}=fixture();
 const dropped=submitCommand(s,{type:'DROP_CASUALTY',unit_id:carrier.id,issuer_id:'general'});
 expect(dropped.accepted).toBe(true);expect(dropped.state.casualties[0].carrier).toBeNull();
 expect(eligibleTargets(dropped.state,picker,'PICKUP_CASUALTY')).toContain('casualty');
 const picked=submitCommand(dropped.state,{type:'PICKUP_CASUALTY',unit_id:picker.id,issuer_id:'general',target_id:'casualty'});
 expect(picked.accepted).toBe(true);expect(picked.state.casualties).toHaveLength(1);expect(picked.state.casualties[0].carrier).toBe(picker.id);expect(picked.state.units[picker.id].exposed).toBe(true);
 expect(eligibleTargets(picked.state,picked.state.units[carrier.id],'PICKUP_CASUALTY')).toEqual([]);
});
it('keeps historical handoffs replayable while hiding them from new order choices',()=>{
 const {s,picker}=fixture(false);expect(eligibleTargets(s,picker,'PICKUP_CASUALTY')).toContain('casualty');
 expect(commandOptions(s,picker,'general').find(o=>o.type==='PICKUP_CASUALTY').targets).toEqual([]);
});
for(const corrected of [true,false])it(`round-trips pickup rules for new and historical missions (${corrected})`,()=>{
 const s=createMission(trevieres,'pickup-replay',{},null,{casualty_pickup:corrected}),record=exportReplay(s);
 expect(record.casualty_pickup).toBe(corrected?'v1':undefined);expect(replayMission(trevieres,record)).toEqual(s);
});
it('rejects unknown pickup rules',()=>{const s=createMission(trevieres,'pickup-replay');expect(()=>replayMission(trevieres,{...exportReplay(s),casualty_pickup:'future'})).toThrow('Unsupported casualty pickup');});
