import {it,expect} from 'vitest';
import {createMission,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {applyPatrolEvent} from '../src/sim/company/patrolEvents.js';
import {applyHit} from '../src/sim/company/combat.js';
import {eligibleTargets} from '../src/sim/company/actions.js';
import {cards} from '../src/sim/company/core.js';
import {auditCasualtyEquipment} from '../scripts/auditCasualtyEquipment.js';

for(const updated of [true,false])it(`Lost in the Dark carrier movement and final casualty position (${updated})`,()=>{
 const s=createMission(stGeorges,'carried-casualty-event',{},null,{casualty_positions:updated}),carrier=s.units.mg1;
 // Isolate one eligible patrol carrier and a casualty it already carries.
 Object.assign(carrier,{platoon:1,location:'r1c1',cover:s.locations.r1c1.covers[0].id,pinned:false,exposed:false,radios:[],assets:{}});
 s.units={[carrier.id]:carrier};const oldCover=carrier.cover;
 s.casualties=[{id:'carried',step:{id:'old-step',personnel:[]},origin_name:'Earlier casualty',faction:'friendly',carrier:carrier.id,location:carrier.location,cover:oldCover,evacuated:false}];
 const card=Object.values(cards).find(c=>c.id!==51&&c.random[6]===1);s.deck.order=[card.id,...s.deck.order];
 applyPatrolEvent(s,'friendly','LOST',{});
 expect(carrier).toMatchObject({location:'r2c1',cover:null,exposed:true});
 expect(s.events.findLast(e=>e.type==='UNIT_MOVED')).toMatchObject({forced:true,target:'r2c1'});
 expect(s.casualties[0]).toMatchObject({location:updated?'r2c1':'r1c1',cover:updated?null:oldCover});
 applyHit(s,carrier,'C');
 expect(s.casualties[0]).toMatchObject({carrier:null,location:updated?'r2c1':'r1c1',cover:updated?null:oldCover});
 const picker={...structuredClone(carrier),id:'picker',steps:[{id:'picker-step',personnel:[]}],removed:null,cohesion:'GOOD'};s.units.picker=picker;
 expect(eligibleTargets(s,picker,'PICKUP_CASUALTY').includes('carried')).toBe(updated);
});
it('closes all 39 casualty/equipment audit observations',()=>{
 const audit=auditCasualtyEquipment();expect(audit.observations).toBe(39);expect(audit.results.filter(r=>!r.passed)).toEqual([]);
});
for(const updated of [true,false])it(`casualty position rules initialize before attempt snapshots (${updated})`,()=>{
 const s=createMission(stGeorges,'carried-casualty-version',{},null,{casualty_positions:updated});
 expect(exportReplay(s).casualty_positions).toBe(updated?'v1':undefined);
 expect(replayMission(stGeorges,exportReplay(s))).toEqual(s);
});
it('rejects an unknown casualty position rule',()=>{
 const s=createMission(stGeorges,'carried-casualty-version');expect(()=>replayMission(stGeorges,{...exportReplay(s),casualty_positions:'future'})).toThrow('Unsupported carried casualty position');
});
