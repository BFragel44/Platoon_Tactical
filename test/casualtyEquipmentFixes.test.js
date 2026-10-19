import {it,expect} from 'vitest';
import {auditCasualtyEquipment} from '../scripts/auditCasualtyEquipment.js';
import {createMission,exportReplay,replayMission,advancePhase} from '../src/sim/company/engine.js';
import {applyHit} from '../src/sim/company/combat.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';

const controls=auditCasualtyEquipment().results.filter(r=>r.id!=='carrier-final-casualty-after-helper-movement');
it('covers both repairs and the existing consequence controls',()=>expect(controls).toHaveLength(38));
for(const control of controls)it(control.id,()=>expect(control.observed).toEqual(control.expected));

for(const definition of [companyAssault,cerisy])for(const corrected of [true,false])it(`${definition.id}: new/historical equipment rules preserve replay and attempt initialization (${corrected})`,()=>{
 let s=createMission(definition,'equipment-version',{},null,{casualty_equipment:corrected});
 expect(exportReplay(s).casualty_equipment).toBe(corrected?'v1':undefined);
 expect(replayMission(definition,exportReplay(s))).toEqual(s);
 s=advancePhase(s).state;expect(replayMission(definition,exportReplay(s))).toEqual(s);
});
it('rejects unknown equipment rules',()=>{
 const s=createMission(companyAssault,'equipment-version');
 expect(()=>replayMission(companyAssault,{...exportReplay(s),casualty_equipment:'future'})).toThrow('Unsupported casualty equipment');
});
it('retains cargo in an original operational squad while only one step breaks away',()=>{
 const s=createMission(cerisy,'partial-breakdown'),u=s.units.s11;u.ammo={MG:3,RKT:1};
 applyHit(s,u,'P');expect(u.steps).toHaveLength(2);expect(u.ammo).toEqual({MG:3,RKT:1});
});
for(const effect of ['FF','CF','FC','PP','PC'])it(`mortar breakdown ${effect} preserves only chart MTR stock`,()=>{
 const s=createMission(cerisy,'mortar-cargo'),u=s.units.mortar_section;
 s.units={[u.id]:u};u.steps=u.steps.slice(0,2);u.ammo={MTR:4,RKT:2};u.initial_resources.ammo={MTR:6,RKT:2};
 applyHit(s,u,effect);
 const teams=Object.values(s.units).filter(v=>v.id.startsWith('mortar_')&&v.steps.length&&!v.removed);
 expect(teams.every(v=>v.ammo.MTR===4)).toBe(true);
 expect(Object.values(s.units).filter(v=>v.steps.length&&!v.removed&&v.id!==u.id).reduce((n,v)=>n+(v.ammo?.RKT??0),0)).toBe(0);
});
