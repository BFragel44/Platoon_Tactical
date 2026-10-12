import {it,expect} from 'vitest';
import {phaseGuidance,commandRecoveryHint,formationInspectionReason} from '../src/ui/phaseGuidance.js';
import {unavailableTargetReference} from '../src/ui/orderPresentation.js';
import {movementSpace} from '../src/ui/battlefieldPresentation.js';
it('distinguishes reserve and embarked inspection from a lost command counter',()=>{
 const reserve={kind:'HQ',steps:1,removed:'RESERVE'},aboard={kind:'HQ',steps:0,removed:'EMBARKED',transport:{name:'Sherman'}};
 expect(commandRecoveryHint(reserve)).toBe('');expect(commandRecoveryHint(aboard)).toBe('');expect(commandRecoveryHint({kind:'HQ',steps:1,removed:'CAPTURED'})).toBe('');
 expect(formationInspectionReason(reserve,{patrol:{}})).toContain('this patrol');expect(formationInspectionReason(reserve,{})).toContain('next mission');expect(formationInspectionReason(aboard,{})).toContain('transport controls');
});
it('explains blocking choices before ordinary phase stepping without inspecting hidden state',()=>{
 const v={status:'ACTIVE',phase:'CO_ACTIVATION',eligible_hqs:['hq1'],phase_description:'Default',secret:'enemy'};
 expect(phaseGuidance({...v,pending_support:{adjacent:['a','b']}})).toContain('battalion fire');expect(phaseGuidance({...v,pending_event:{code:'RESUPPLY'}})).toContain('delivery card');expect(phaseGuidance(v)).toContain('Select an HQ');
 expect(phaseGuidance({...v,impulse:{hq:'hq1',commands:0}})).toContain('free actions');expect(phaseGuidance({...v,impulse:{hq:'general',commands:2}})).toContain('HQ-only');expect(phaseGuidance({...v,impulse:{hq:'co',commands:2}})).toContain('subordinate HQs');expect(phaseGuidance({...v,status:'SUCCESS'})).toContain('outcome');expect(phaseGuidance({...v,eligible_hqs:[]})).toBe('Default');expect(phaseGuidance(v)).not.toContain('enemy');
});
it('makes movement/cover restrictions readable and escapes labels without exposing other target categories',()=>{
 const option={type:'MOVE',targets:[{id:'a',reason:'Already exposed'},{id:'b',reason:null}]},before=structuredClone(option);
 const text=unavailableTargetReference(option,()=>'<Unrevealed>');expect(text).toContain('Already exposed');expect(text).toContain('&lt;Unrevealed&gt;');expect(text).not.toContain('<Unrevealed>');expect(option).toEqual(before);expect(unavailableTargetReference({...option,type:'GRENADE'})).toBe('');
});
it('movement capacity uses only active friendly steps and actual projected group members',()=>{
 const view={locations:[{id:'a',name:'2.1 Unrevealed terrain'},{id:'staging',name:'Staging 1',staging:true}],units:[{id:'hq',faction:'friendly',location:'origin',steps:1},{id:'squad',faction:'friendly',location:'origin',steps:3},{id:'here',faction:'friendly',location:'a',steps:5},{id:'dead',faction:'friendly',location:'a',steps:3,removed:'CASUALTY'},{id:'enemy',faction:'enemy',location:'a',steps:9}]};
 const option={type:'PLATOON_MOVE',targets:[{id:'a',moving_unit_ids:['hq','squad']}]},before=structuredClone(view);
 expect(movementSpace(view,view.units[0],option,'a')).toEqual({name:'2.1 Unrevealed terrain',occupied:5,incoming:4,total:9,limit:16});expect(view).toEqual(before);
 expect(movementSpace(view,view.units[1],{type:'MOVE'},'staging').limit).toBeNull();expect(movementSpace(view,view.units[0],{type:'SPOT'},'a')).toBeNull();
 expect(movementSpace(view,view.units[0],{...option,reason:'Already exposed'},'a')).toBeNull();expect(movementSpace(view,view.units[0],{...option,targets:[{id:'a',reason:'Stacking limit'}]},'a')).toBeNull();
});

it('labels one explicit next-contact resolution and gives public command recovery hints',async()=>{
 const {contactAdvanceLabel,commandRecoveryHint}=await import('../src/ui/phaseGuidance.js');
 expect(contactAdvanceLabel({resolved:true,next_location:'b'})).toBe('Evaluate next contact →');expect(contactAdvanceLabel({resolved:true})).toContain('pinned recovery');expect(contactAdvanceLabel({resolved:false})).toContain('Resolve contact');
 expect(commandRecoveryHint({kind:'HQ',steps:1,pinned:true})).toContain('Rally');expect(commandRecoveryHint({kind:'HQ',steps:1,cohesion:'F'})).toContain('Fire Team side');expect(commandRecoveryHint({kind:'HQ',steps:0,removed:'BROKEN'})).toContain('donor step');expect(commandRecoveryHint({kind:'SQUAD',steps:0})).toBe('');expect(commandRecoveryHint({kind:'HQ',steps:1,cohesion:'GOOD'})).toBe('');
});

it('shows guard-side choice only for a potentially relevant public capture card',async()=>{
 const {needsGuardRemainderChoice}=await import('../src/ui/phaseGuidance.js');const v={phase:'CAPTURE',scenario_id:'normandy_1',units:[{kind:'SQUAD',steps:2,location:'a'}],enemies:[],suspected:[]};expect(needsGuardRemainderChoice(v)).toBe(false);expect(needsGuardRemainderChoice({...v,enemies:[{location:'b'}]})).toBe(false);expect(needsGuardRemainderChoice({...v,enemies:[{location:'a'}]})).toBe(true);expect(needsGuardRemainderChoice({...v,suspected:['a']})).toBe(true);expect(needsGuardRemainderChoice({...v,suspected:['a'],units:[{...v.units[0],pinned:true}]})).toBe(false);expect(needsGuardRemainderChoice({...v,phase:'CLEANUP',suspected:['a']})).toBe(false);
});
