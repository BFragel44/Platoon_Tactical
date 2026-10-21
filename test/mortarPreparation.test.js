import {it,expect} from 'vitest';
import {createMission,prepareReattempt} from '../src/sim/company/engine.js';
import {hill192} from '../src/scenarios/hill192.js';
import {applyHit} from '../src/sim/company/combat.js';
import {preparationFormationAllowed} from '../src/sim/company/reconstitution.js';
import {projectAttemptPersonnel} from '../src/ui/reattemptDraft.js';

it('retains living mortar breakdown survivors but never rebuilds an eliminated breakdown weapon',()=>{
 const s=createMission(hill192,'mortar-preparation');
 applyHit(s,s.units.mortar_section,'FF');
 const team=Object.values(s.units).find(u=>/^mortar_\d+$/.test(u.id));
 expect(team.steps).toHaveLength(1);expect(preparationFormationAllowed(s,team)).toBe(false);
 expect(projectAttemptPersonnel(s).units[team.id].steps).toHaveLength(1);
 applyHit(s,team,'C');s.status='DEFEAT';
 for(const contact of Object.values(s.contacts))contact.resolved=true;
 for(const u of Object.values(s.units))if(u.faction==='enemy')u.removed='WITHDRAWN';
 const donor=structuredClone(s.units.s11);Object.assign(donor,{id:'donor',kind:'LAT',steps:donor.steps.slice(0,1),cohesion:'F',removed:null});s.units.donor=donor;
 const choices={original_formations_only:true,reconstitute:{[team.id]:['donor']}};
 expect(()=>projectAttemptPersonnel(s,choices)).toThrow('eligible formation');
 expect(()=>prepareReattempt(s,choices)).toThrow('original mortar section');
 expect(preparationFormationAllowed(s,s.units.mortar_section)).toBe(true);
 expect(team.steps).toHaveLength(0);
});
