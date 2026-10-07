import {describe,it,expect} from 'vitest';
import {stGeorgesContent as content} from '../src/scenarios/stGeorgesContent.js';
import {validatePatrolPlan,createPatrolProgress,recordPatrolMovement,patrolOutcome,patrolMovementReason,nextPatrolPlatoons,patrolMoonLight} from '../src/sim/company/patrols.js';
import {visibilityAt,visibilityLosLimit,visibilityCommandLimits,visibilityFireModifier,illuminationReductionsAt,strongestVisibilityFire,patrolInitiative} from '../src/sim/company/visibility.js';
const locations=Object.fromEntries(Array.from({length:20},(_,i)=>{const row=Math.floor(i/5)+1,col=i%5+1,id=`r${row}c${col}`;return [id,{id,row,col}];}));
const plan={platoon:2,primary:'r4c3',route:['r2c1','r3c2','r4c3','r2c2'],cop:'r2c3',ccp:'r1c3',concentration:'r4c3'};
const unit={id:'squad',faction:'friendly',platoon:2};
describe('St. Georges published content foundation',()=>{
 it('uses three ten-turn patrols, no staging and the offensive sequence',()=>{
  expect(content.map).toEqual({columns:5,rows:4,staging:false});expect(content.patrols).toBe(3);expect(content.turn_limit).toBe(10);
  expect(content.phase_sequence).toBe('offensive');expect(content.enemy_experience).toBe('Veteran');
  expect(content.contact_rows).toEqual({1:null,2:['B','C'],3:['B','C'],4:'A'});expect(content.cop_contact).toBe(false);
 });
 it.each(['A','B','C'])('accounts for all ten %s package draws',type=>{
  const published={A:[3,4,4,5,8,8,9,10,11,12],B:[1,1,2,2,2,3,5,6,6,7],C:[1,1,2,2,2,3,5,5,6,7]};
  expect(content.package_tables[type]).toEqual(published[type]);for(const number of published[type])expect(content.packages[number]).toBeDefined();
 });
 it('has no spotter in either single incoming mission and illuminates packages 6 and 7',()=>{
  expect(content.packages[2].alternatives.map(p=>[p.incoming,p.units])).toEqual([[-4,[]],[-3,[]]]);
  for(const number of [6,7])expect(content.packages[number].illumination).toBe('mortar');
  expect(content.packages[7]).toMatchObject({no_fire:true,spotted:true,exposed:true});
  expect(Object.keys(content.packages)).toHaveLength(12);
 });
 it('has published finite illumination support and two added HMGs',()=>{
  expect(content.support.artillery.inventory).toEqual({HE:4,WP:1,ILLUM:6});expect(content.support.mortar.inventory).toEqual({HE:3,WP:1,ILLUM:4});
  expect(content.support.cannon.inventory).toEqual({HE:3,WP:1});
  expect(content.attachments.filter(u=>u.kind==='HMG').map(u=>[u.steps,u.experience,u.ammo.MG])).toEqual([[1,'Line',6],[1,'Line',6]]);
 });
 it('uses shifting lines instead of a Cerisy counterattack',()=>{
  expect(content.enemy_event_tables.early.slice(8)).toEqual(['SHIFTING_LINES','SHIFTING_LINES']);expect(content.enemy_event_tables.late[9]).toBe('SHIFTING_LINES');
  for(const side of ['friendly','enemy'])for(const table of Object.values(content[`${side}_event_tables`]))expect(table).toHaveLength(10);
 });
});
describe('ordered patrol route foundation',()=>{
 it('requires objective, four points in order, then a Row 2→1 crossing',()=>{
  let p=createPatrolProgress(locations,plan);
  p=recordPatrolMovement(p,unit,'r1c1','r4c3',locations);expect(p.objective_visited).toBe(true);expect(p.visited).toEqual([]);
  p=recordPatrolMovement(p,unit,'r2c2','r1c2',locations);expect(p.returned).toBe(false);
  for(const [from,to]of [['r1c1','r2c1'],['r2c1','r3c2'],['r3c2','r4c3'],['r4c3','r2c2']])p=recordPatrolMovement(p,unit,from,to,locations);
  expect(patrolOutcome(p,9)).toBe(null);p=recordPatrolMovement(p,unit,'r2c2','r1c2',locations);expect(patrolOutcome(p,10)).toBe('SUCCESS');
 });
 it('requires the objective separately when it is outside the route',()=>{
  let p=createPatrolProgress(locations,{...plan,primary:'r4c5'});
  for(const to of plan.route)p=recordPatrolMovement(p,unit,'r1c1',to,locations);
  p=recordPatrolMovement(p,unit,'r2c2','r1c2',locations);expect(p.returned).toBe(false);expect(patrolOutcome(p,10)).toBe('DEFEAT');
 });
 it('ignores fixed defenders, reserve units and repeated same-card moves',()=>{
  const p=createPatrolProgress(locations,plan);
  for(const other of [{...unit,platoon:1},{...unit,removed:'RESERVE'},{...unit,faction:'enemy'},{...unit,steps:[]}])expect(recordPatrolMovement(p,other,'r1c1','r2c1',locations)).toEqual(p);
  expect(recordPatrolMovement(p,unit,'r2c1','r2c1',locations)).toEqual(p);
  expect(patrolMovementReason(p,{...unit,platoon:1})).toMatch(/fixed/);expect(patrolMovementReason(p,{...unit,platoon:1},{automaticRetreat:true})).toBe(null);
 });
 it('copies plans and prior progress instead of rewriting the starting record',()=>{
  const input=structuredClone(plan),p=createPatrolProgress(locations,input);input.route[0]='r4c5';
  const q=recordPatrolMovement(p,unit,'r1c1','r2c1',locations);expect(p.visited).toEqual([]);expect(q.visited).toEqual(['r2c1']);expect(p.plan).toEqual(plan);
 });
 it.each([{route:['r2c1','r2c1','r3c2','r4c3']},{route:['r1c1','r2c2','r3c3','r4c4']},{primary:'r3c1'},{cop:'r1c1'},{platoon:4},{ccp:'r0c1'},{concentration:'unknown'}])('rejects invalid controls %j',invalid=>expect(()=>validatePatrolPlan(locations,{...plan,...invalid})).toThrow());
 it('allows each platoon exactly once, regardless of success',()=>{
  expect(nextPatrolPlatoons([{platoon:2,outcome:'DEFEAT'}])).toEqual([1,3]);expect(nextPatrolPlatoons([3,1,2].map(platoon=>({platoon,outcome:'SUCCESS'})))).toEqual([]);
  expect(()=>nextPatrolPlatoons([{platoon:1,outcome:'SUCCESS'},{platoon:1,outcome:'DEFEAT'}])).toThrow();expect(()=>nextPatrolPlatoons([{platoon:1,outcome:'ACTIVE'}])).toThrow();
  expect(patrolOutcome(createPatrolProgress(locations,plan),2,false)).toBe('DEFEAT');
 });
 it.each([1,2,3,4])('maps R#4 result %i to published moon visibility',draw=>expect(patrolMoonLight(draw)).toBe(draw+1));
});
describe('limited visibility foundation',()=>{
 it('clamps light, selects the strongest illumination and leaves weather intact',()=>{
  expect(visibilityAt({light:5,weather:2},[1,3,4])).toMatchObject({modifier:3,reduction:4,illuminated:false});
  expect(visibilityAt({light:2},[5])).toMatchObject({modifier:0,illuminated:true});
 });
 it('extends LOS to an illuminated target, not from an illuminated origin',()=>{
  expect(visibilityLosLimit({light:4},[])).toBe(1);expect(visibilityLosLimit({light:4},[1])).toBe(3);
  expect(visibilityLosLimit({light:4,weather:2},[5])).toBe(1);expect(visibilityLosLimit({light:0},[],2)).toBe(2);
 });
 it('uses the center and adjacent illumination values without inventing marker strengths',()=>{
  const markers=[{location:'r3c3',center:5,adjacent:3},{location:'r2c2',center:2}];
  expect(illuminationReductionsAt(markers,'r3c3',locations)).toEqual([5]);expect(illuminationReductionsAt(markers,'r2c2',locations)).toEqual([3,2]);
  expect(illuminationReductionsAt(markers,'r1c5',locations)).toEqual([]);expect(()=>illuminationReductionsAt([{location:'r2c2'}],'r2c2',locations)).toThrow();
 });
 it.each([['Green',2,3],['Line',4,6],['Veteran',6,9]])('sets %s command limits independently from target illumination', (experience,night,day)=>{
  expect(visibilityCommandLimits({light:2},experience)).toEqual({spend:4,saved:night});expect(visibilityCommandLimits({light:0},experience)).toEqual({spend:6,saved:day});
 });
 it.each(['grenade','off_map','mine','claymore','booby_trap','air_strike'])('does not apply night penalties to %s',kind=>expect(visibilityFireModifier({light:5,weather:2},[],kind)).toBe(0));
 it.each(['basic','sniper','on_map_indirect'])('applies light and weather to %s',kind=>expect(visibilityFireModifier({light:5,weather:2},[3],kind)).toBe(4));
 it('rejects unsupported effects and invalid modifiers',()=>{
  expect(()=>visibilityFireModifier({light:2},[],'unknown')).toThrow();expect(()=>visibilityAt({light:-1})).toThrow();expect(()=>visibilityAt({},[-2])).toThrow();
  expect(()=>strongestVisibilityFire([{kind:'basic',value:NaN}],{})).toThrow();expect(()=>patrolMoonLight(5)).toThrow();expect(()=>patrolInitiative(1.5)).toThrow();
 });
 it('chooses the strongest fire after visibility, rather than before it',()=>{
  const effects=[{kind:'basic',value:-3},{kind:'grenade',value:-2}];
  expect(strongestVisibilityFire(effects,{light:2}).kind).toBe('grenade');expect(strongestVisibilityFire(effects,{light:2},[2]).kind).toBe('basic');expect(strongestVisibilityFire([],{light:2})).toBe(null);
 });
 it.each([[0,0],[1,0],[2,1],[3,1],[4,2],[5,2]])('halves unmodified General Initiative %i to %i', (commands,expected)=>expect(patrolInitiative(commands)).toBe(expected));
});
