import {it,expect} from 'vitest';
import {combatScreen} from '../src/ui/combatScreen.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,getPlayerView} from '../src/sim/company/engine.js';
import {refresh} from '../src/sim/company/battlefield.js';
it('renders every frozen receiving modifier and exact stakes without exposing the hidden source or mutating the projection',()=>{
 let s=createMission(companyAssault,'overlay');s.units.s11.location='r1c1';
 s.units.secret={...structuredClone(s.units.mg1),id:'secret',name:'Secret German LMG',faction:'enemy',location:'r1c2',fire:'r1c1',radios:[]};refresh(s);s.phase='PINNED_RECOVERY';s=advancePhase(s).state;
 const v=getPlayerView(s),c=v.combat_resolution,before=structuredClone(v),html=combatScreen(c,v,id=>id);
 expect(html).toContain('combat-overlay');expect(html).not.toContain('Secret German LMG');expect(html).toContain('UNSPOTTED');
 for(const m of c.modifiers)expect(html).toContain(m.label);
 for(const result of ['MISS','PIN','HIT'])expect(html).toContain(`${Math.round(c.probabilities.probabilities[result]*100)}%`);
 expect(html).toContain('If HIT');expect(html).toContain('Unspotted · stakes hidden');expect(v).toEqual(before);
});
