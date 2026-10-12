import {it,expect} from 'vitest';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {cerisy} from '../src/scenarios/cerisy.js';
import {supportCallPreview,friendlyTargetLabel,supportWarning,battalionChoiceReason} from '../src/ui/supportPresentation.js';
it('projects friendly agency tables without sharing state or revealing enemy definitions',()=>{
 const s=createMission(cerisy,'profile'),before=structuredClone(s),v=getPlayerView(s);expect(v.support_callers.artillery.name).toBe(s.support_agencies.artillery.name);v.support_callers.artillery.draws.company_commander=99;expect(s).toEqual(before);expect(v.support_callers.enemy_artillery).toBeUndefined();
});
it.each(['Green','Line','Veteran'])('matches the caller floor, experience and registration for %s',experience=>{
 const s=createMission(cerisy,'draws');s.units.artyfo.experience=experience;s.registered_targets.artillery='r1c2';const v=getPlayerView(s),u=v.units.find(u=>u.id==='artyfo'),base=s.support_agencies.artillery.draws[u.agency_role];
 const profile=supportCallPreview(v,u,'CALL_ARTILLERY','r1c2');expect(profile.draws).toBe(Math.max(1,base+1+({Green:-1,Line:0,Veteran:1}[experience])));expect(profile.registered).toBe(true);expect(profile.remaining).toBe(4);expect(profile.network).toBe('ARTY');expect(supportCallPreview(v,u,'CALL_ARTILLERY','r1c3').registered).toBe(false);
});
it('uses ammunition-specific caller tables and does not invent unsupported callers',()=>{
 const v={support_callers:{artillery:{name:'Agency',draws:{fo:2},ammo_draws:{TOT:{fo:1}},networks:{fo:'ARTY'}}},support_inventory:{artillery:{TOT:1}}};
 expect(supportCallPreview(v,{id:'fo',experience:'Line'},'CALL_ARTILLERY_TOT','card')).toMatchObject({draws:1,ammo:'TOT',remaining:1});expect(supportCallPreview(v,{id:'unknown'},'CALL_ARTILLERY','card')).toBeNull();expect(supportCallPreview(v,{id:'fo'},'MOVE','card')).toBeNull();
});
it('labels only public terrain and friendly occupancy and retains no hidden text in short-round warning',()=>{
 const v={turn:2,locations:[{id:'a',name:'2.1 Unrevealed terrain'}],units:[{id:'rifles',steps:3,location:'a'},{steps:0,location:'a'},{steps:1,removed:'RESERVE',location:'a'}],support_callers:{artillery:{name:'Friendly artillery'}}};
 expect(friendlyTargetLabel(v,'a')).toBe('2.1 Unrevealed terrain · 1 friendly formation(s) present');
 const e={type:'SUPPORT_REQUEST',turn:2,success:true,agency:'artillery',ammo:'HE',location:'a',text:'short round; secret terrain and hidden enemy name'};
 const result=supportWarning(v,[e]);expect(result).toContain('short round at 2.1 Unrevealed terrain');expect(result).toContain('1 friendly');expect(result).not.toContain('secret');expect(supportWarning(v,[{...e,hidden:true}])).toBeNull();
 expect(supportWarning(v,[e,{...e,text:'request failed',success:false}])).toContain('request failed');expect(supportWarning(v,[{...e,text:'pending at a'}])).toBeNull();expect(supportWarning({...v,turn:3},[e])).toBeNull();
});
it('rejects duplicate or unlisted battalion choices without touching the pending mission',()=>{
 const v={pending_support:{adjacent:['a','b','c']}},before=structuredClone(v);expect(battalionChoiceReason(v,'a','a')).toMatch(/different/);expect(battalionChoiceReason(v,'a','hidden')).toMatch(/available/);expect(battalionChoiceReason(v,'a','b')).toBeNull();expect(v).toEqual(before);
});
import {retainedGeneralIssuer} from '../src/ui/orderPresentation.js';
it('clears eliminated General Initiative issuers without silently selecting another HQ',()=>{
 const units=[{id:'co',kind:'HQ',steps:0,removed:'CASUALTY'},{id:'hq1',kind:'HQ',steps:1},{id:'squad',kind:'SQUAD',steps:3}];
 expect(retainedGeneralIssuer(units,'co')).toBe('');expect(retainedGeneralIssuer(units,'hq1')).toBe('hq1');expect(retainedGeneralIssuer(units,'squad')).toBe('');expect(retainedGeneralIssuer(units,'')).toBe('');
});
