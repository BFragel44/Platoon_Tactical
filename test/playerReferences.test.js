import {it,expect} from 'vitest';
import {playerReferences} from '../src/sim/company/playerReferences.js';
import {createMission,getPlayerView,getVisibleEvents,exportReplay,replayMission,checkObjective,advancePhase,submitCommand,endTurn,prepareReattempt} from '../src/sim/company/engine.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {signalReferenceMarkup,signalEffectLabel,signalDeviceLabel} from '../src/ui/signalPresentation.js';
import {objectiveAssessmentMarkup} from '../src/ui/objectivePresentation.js';
import {formationSelectionOptions} from '../src/ui/orderPresentation.js';
import {saveRecovery,resumeCheckpoint} from '../src/ui/localRecovery.js';
it('projects assigned signals without changing deployment, events or replay',()=>{
 const s=createMission(trevieres,'signal-reference'),before=structuredClone(s),replay=exportReplay(s),v=getPlayerView(s);
 expect(v.signal_plan).toEqual(s.signal_plan);expect(v.signal_stock.length).toBeGreaterThan(0);
 expect(v.objective_assessment).toBeNull();expect(objectiveAssessmentMarkup(v)).toContain('Not yet assessed this attempt');
 expect(signalReferenceMarkup(v,id=>id)).toContain('Red star parachute');
 v.signal_plan.rsp='CF';v.phase_lines[1]=99;expect(s).toEqual(before);expect(exportReplay(s)).toEqual(replay);
});
it('uses only public, current-attempt objective assessments, including repeated turn numbers',()=>{
 const s=createMission(trevieres,'assessment');checkObjective(s);let v=getPlayerView(s);
 expect(v.objective_assessment).toMatchObject({turn:1,rows_clear:false});expect(objectiveAssessmentMarkup(v)).toContain('end of turn 1');
 const events=getVisibleEvents(s),seq=events.at(-1).sequence+1;
 for(const type of ['MISSION_REATTEMPTED','PATROL_PREPARED']){
  expect(playerReferences(s,[...events,{type,sequence:seq,turn:1}]).objective_assessment).toBeNull();
  expect(playerReferences(s,[...events,{type,sequence:seq,turn:1},{type:'OBJECTIVE_CHECK',sequence:seq+1,turn:1,rows_clear:true,objectives_held:true}]).objective_assessment).toMatchObject({turn:1,rows_clear:true});
 }
 expect(JSON.stringify(v.objective_assessment)).not.toMatch(/enemy|location|contact/);
 expect(objectiveAssessmentMarkup({...v,patrol:{}})).toBe('');
});
it('recounts transfers, drops, unavailable stock, use and replenishment without guessing losses',()=>{
 const s=createMission(trevieres,'stock');s.signal_plan={rsp:'M2PO'};
 for(const u of Object.values(s.units))u.assets.rsp=0;
 s.units.co.assets.rsp=2;s.units.hq1.assets.rsp=1;
 const stock=()=>playerReferences(s,[]).signal_stock;
 expect(stock().reduce((n,x)=>n+x.quantity,0)).toBe(3);
 s.units.co.assets.rsp--;s.units.hq1.assets.rsp++;expect(stock().find(x=>x.carrier_id==='hq1').quantity).toBe(2);
 s.units.co.assets.rsp=0;s.assets.push({faction:'friendly',type:'EQUIPMENT',key:'rsp',quantity:1,location:'r1c1'});
 expect(stock().find(x=>x.status==='GROUND')).toMatchObject({quantity:1,location:'r1c1'});
 s.units.hq1.removed='CAPTURED';s.assets.at(-1).destroyed=true;
 expect(signalReferenceMarkup(playerReferences(s,[]),id=>id)).toContain('no confirmed expenditure');
 expect(signalReferenceMarkup(playerReferences(s,[{type:'SIGNAL_DEPLOYED',device:'rsp',sequence:1,turn:1}]),id=>id)).toContain('Expended this attempt');
 s.units.co.assets.rsp=1;expect(stock().reduce((n,x)=>n+x.quantity,0)).toBe(1);
 s.units.enemy={...structuredClone(s.units.co),id:'enemy',faction:'enemy',assets:{rsp:100}};expect(stock().reduce((n,x)=>n+x.quantity,0)).toBe(1);
});
it('includes transported carriers and friendly cargo once, excluding destroyed and enemy vehicles',()=>{
 const s=createMission(trevieres,'transport');s.signal_plan={rsp:'CF'};for(const u of Object.values(s.units))u.assets.rsp=0;
 s.units.co.assets.rsp=1;s.units.co.embarked_on='jeep';s.units.co.removed='EMBARKED';s.units.co.steps=[];
 s.vire_runtime={vehicles:{jeep:{id:'jeep',name:'Jeep',faction:'friendly',status:'ACTIVE',location:'r2c2',passengers:[{origin_formation:'co'}],cargo:[{type:'EQUIPMENT',key:'rsp',quantity:2}]},enemy:{faction:'enemy',status:'ACTIVE',cargo:[{type:'EQUIPMENT',key:'rsp',quantity:99}]}}};
 expect(playerReferences(s,[]).signal_stock).toMatchObject([{carrier_id:'co',status:'EMBARKED',location:'r2c2',quantity:1},{carrier_id:'jeep',status:'CARGO',quantity:2}]);
 const view=getPlayerView(s);expect(view.units.find(u=>u.id==='co').transport).toEqual({id:'jeep',name:'Jeep',location:'r2c2',steps:1});expect(formationSelectionOptions(view.units,null)).toContain('Company HQ');
 s.vire_runtime.vehicles.jeep.status='DESTROYED';expect(playerReferences(s,[]).signal_stock).toEqual([]);expect(getPlayerView(s).units.find(u=>u.id==='co').transport).toBeNull();
});
it('reconstructs actual signal expenditure and reattempt replenishment through replay and recovery',()=>{
 let s=createMission(trevieres,'reference-reattempt');for(let i=0;i<4;i++)s=advancePhase(s).state;
 const result=submitCommand(s,{type:'PYRO_RSP',unit_id:'co',issuer_id:'co',target_id:s.units.co.location});expect(result.accepted).toBe(true);s=result.state;
 const used=getPlayerView(s);expect(used.signal_stock.some(x=>x.device==='rsp')).toBe(false);expect(signalReferenceMarkup(used,id=>id)).toContain('Expended this attempt');
 for(let i=0;i<10&&s.status==='ACTIVE';i++)s=endTurn(s).state;
 expect(s.status).toBe('DEFEAT');expect(getPlayerView(s).objective_assessment.turn).toBe(10);
 const positions=Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed).map(u=>[u.id,'r0c2']));s=prepareReattempt(s,{positions}).state;
 const second=getPlayerView(s);expect(second.objective_assessment).toBeNull();expect(second.signal_deployments).toEqual([]);expect(second.signal_stock.find(x=>x.device==='rsp')).toMatchObject({carrier_id:'co',quantity:1});
 expect(getPlayerView(replayMission(trevieres,exportReplay(s)))).toEqual(second);
 const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,v)=>data.set(key,v)};const restored=resumeCheckpoint(trevieres,saveRecovery(storage,s,{showHistorical:true}).latest);expect(getPlayerView(restored.state)).toEqual(second);expect(restored.presentation.showHistorical).toBe(true);
});
it('uses readable device and mission-assigned destination names',()=>{
 const v={phase_lines:{1:2},objectives:{primary:{location:'p'},secondary:{location:'s'}}},name=id=>({p:'3.2 Church',s:'3.3 Woods'})[id];
 expect(signalEffectLabel('XPL1',v,name)).toContain('Row 2');expect(signalEffectLabel('M2PO',v,name)).toContain('3.2 Church');expect(signalEffectLabel('INFAP2SO',v,name)).toContain('3.3 Woods');
 for(const key of ['rsp','rsc','gsp','gsc','red_signal','green_signal','yellow_signal','purple_signal'])expect(signalDeviceLabel(key)).not.toBe(key);
 const night={...v,visibility:{light:2},signal_plan:{red_signal:'CF'},signal_stock:[{device:'red_signal',quantity:1,carrier_name:'HQ',location:'p'}]};expect(signalReferenceMarkup(night,name)).toContain('unavailable at night');expect(night.signal_stock[0].quantity).toBe(1);
});
it('keeps pinned and degraded live formations visible and hides reserves/history until requested or selected',()=>{
 const units=[{id:'pin',name:'Pinned',steps:1,pinned:true},{id:'degraded',name:'Degraded HQ',steps:1,cohesion:'F'},{id:'reserve',name:'Reserve',steps:1,removed:'RESERVE'},{id:'aboard',name:'Embarked',steps:0,removed:'EMBARKED',transport:{name:'Sherman',steps:1}},{id:'lost',name:'Lost',steps:0}];
 const normal=formationSelectionOptions(units,null);expect(normal).toContain('Pinned');expect(normal).toContain('Degraded HQ');expect(normal).toContain('Embarked');expect(normal).not.toContain('Reserve');expect(normal).not.toContain('Lost');
 expect(formationSelectionOptions(units,'lost')).toContain('value="lost" selected');expect(formationSelectionOptions(units,null,true)).toContain('Embarked');
});
