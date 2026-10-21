import {it,expect} from 'vitest';
import {createMission,exportReplay,replayMission,repairResupplyAllocations} from '../src/sim/company/engine.js';
import {applyHit} from '../src/sim/company/combat.js';
import {transferEquipmentResupply} from '../src/sim/company/equipmentRecovery.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {projectAttemptPersonnel} from '../src/ui/reattemptDraft.js';
import {attemptSupplyStock} from '../src/ui/attemptSupplies.js';

for(const corrected of [true,false])it(`moves the resupply allocation with the surviving carrier, historical=${!corrected}`,()=>{
 const s=createMission(trevieres,'resupply-owner',{command_network:'phones'},null,{resupply_ownership:corrected}),co=s.units.co;
 const original=structuredClone(co.initial_resources);applyHit(s,co,'P');
 const child=Object.values(s.units).find(u=>u.kind==='LAT'&&u.radios.includes('BN'));
 expect(child).toBeTruthy();expect(child.initial_resources.radios).toEqual(original.radios);
 expect(co.initial_resources.radios).toEqual(corrected?[]:original.radios);
 // The replacement CO recovers the original physical equipment from that team.
 co.steps=[structuredClone(s.units.xo.steps[0])];co.removed=null;co.cohesion='GOOD';
 for(const net of child.radios)transferEquipmentResupply(s,co,{type:'RADIO',net,source_unit:child.id});
 for(const [key,quantity]of Object.entries(child.assets))transferEquipmentResupply(s,co,{type:'EQUIPMENT',key,quantity,source_unit:child.id});
 expect(co.initial_resources.radios.filter(n=>n==='BN')).toHaveLength(corrected?1:2);
 const inventory=attemptSupplyStock(s,projectAttemptPersonnel(s,{}));
 expect(inventory.co.items['RADIO:BN']).toBe(corrected?1:2);
});
it('preserves exact old replay and exports the corrected accounting after safe adoption',()=>{
 const old=createMission(trevieres,'resupply-upgrade',{},null,{resupply_ownership:false}),record=exportReplay(old);
 expect(record.resupply_ownership).toBeUndefined();expect(replayMission(trevieres,record)).toEqual(old);
 const repaired=repairResupplyAllocations(old,trevieres);
 expect(exportReplay(repaired).resupply_ownership).toBe('v1');
 expect(replayMission(trevieres,exportReplay(repaired))).toEqual(repaired);
 expect(old.mission_rules.resupplyOwnership).toBeUndefined();
});
