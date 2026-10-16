import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {emit} from '../src/sim/company/core.js';
import {cards} from '../src/sim/company/core.js';
import {damagePhoneLines} from '../src/sim/company/phoneNetwork.js';
import {phoneWireMarkup,phoneConnectionLosses} from '../src/ui/phonePresentation.js';
function fixture(){const s=createMission(trevieres,'wire-display',{command_network:'phones'});for(const u of Object.values(s.units))if(!['co','hq1'].includes(u.id))u.removed='RESERVE';s.units.co.location='r1c1';s.units.hq1.location='r3c1';s.phone_lines=[{id:'line',location:'r2c1',owner:'co',cut:false}];emit(s,'PHONE_LINE_LAID','Line laid.',{location:'r2c1'});return s;}
it('renders laid wire and a clear known cut without requiring contact/objective markers',()=>{
 const s=fixture();expect(phoneWireMarkup(getPlayerView(s).phone_lines,'r2c1')).toContain('Phone wire · Intact');
 s.phone_lines[0].cut=true;emit(s,'PHONE_LINE_CUT','Wire cut.',{location:'r2c1'});
 const html=phoneWireMarkup(getPlayerView(s).phone_lines,'r2c1');expect(html).toContain('Phone wire · Cut');expect(html).toContain('wire-break');expect(phoneWireMarkup(getPlayerView(s).phone_lines,'r1c2')).toBe('');
});
it('does not reveal a hidden cut location or cause in the wire projection',()=>{
 const s=fixture(),before=getPlayerView(s);s.phone_lines[0].cut=true;emit(s,'PHONE_LINE_CUT','Secret enemy action.',{location:'r2c1',cause:'enemy action'},true);
 const after=getPlayerView(s);expect(after.phone_lines).toEqual(before.phone_lines);expect(phoneConnectionLosses(before,after)).toEqual([{id:'hq1',name:'1 Platoon HQ',voice:false}]);expect(JSON.stringify(after.phone_lines)).not.toContain('enemy');
});
it('reports established connection loss once per before/after transition and never initial disconnection',()=>{
 const s=fixture(),before=getPlayerView(s);s.phone_lines[0].cut=true;const after=getPlayerView(s);
 expect(phoneConnectionLosses(before,after)).toHaveLength(1);expect(phoneConnectionLosses(after,after)).toEqual([]);expect(phoneConnectionLosses(null,after)).toEqual([]);
 expect(phoneConnectionLosses(before,{...after,attempt_number:2})).toEqual([]);expect(phoneConnectionLosses(before,{...after,mission_instance_id:'different'})).toEqual([]);
});
it('does not report loss when another phone still bridges the cut card',()=>{
 const s=fixture();s.units.hq2.removed=null;s.units.hq2.location='r2c1';const before=getPlayerView(s);s.phone_lines[0].cut=true;expect(phoneConnectionLosses(before,getPlayerView(s))).toEqual([]);
});
it('confirms a cut locally without revealing the event cause or hidden enemy',()=>{
 const s=fixture();s.phone_lines[0].cut=true;s.units.s11.removed=null;s.units.s11.location='r2c1';expect(getPlayerView(s).phone_lines[0]).toMatchObject({cut:true,condition:'observed'});
});
it('repaired and new-attempt line conditions do not retain old cut markers',()=>{
 const s=fixture();s.phone_lines[0].cut=true;emit(s,'PHONE_LINE_CUT','Cut.',{location:'r2c1'});s.phone_lines[0].cut=false;emit(s,'PHONE_LINE_REPAIRED','Repaired.',{location:'r2c1',line_id:'line'});expect(getPlayerView(s).phone_lines[0].cut).toBe(false);
 emit(s,'PHONE_LINE_CUT','Old cut.',{location:'r2c1'});emit(s,'MISSION_REATTEMPTED','New attempt.',{attempt:2});expect(getPlayerView(s).phone_lines[0].cut).toBe(false);
});
it('turns a public combat-damage cut into a map cut and affected-HQ notification',()=>{
 const s=fixture();s.units.s11.removed=null;s.units.s11.location='r2c1';s.support=[{status:'ACTIVE',location:'r2c1'}];
 const before=getPlayerView(s),card=Object.values(cards).find(c=>c.id!==51&&c.random[0]===1);s.deck.order=[card.id,...s.deck.order];damagePhoneLines(s);
 const after=getPlayerView(s);expect(after.phone_lines[0].cut).toBe(true);expect(phoneConnectionLosses(before,after).map(l=>l.id)).toEqual(['hq1']);
});
