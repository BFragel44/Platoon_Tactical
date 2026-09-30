import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {normalizeCamera,zoomCamera,mapPoint} from '../src/ui/mapViewport.js';
import {formationCounter,inlineInventory,formationLabel} from '../src/ui/unitDetails.js';
import {previousSegment} from '../src/ui/segmentResults.js';
import {createMission,getPlayerView,getVisibleEvents,advancePhase,PHASES,replayMission,exportReplay} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

describe('Battlefield presentation',()=>{
 it('labels map formations without an inventory action',()=>{expect(formationLabel({id:'s31',kind:'SQUAD',name:'3/1 Rifle Squad'})).toBe('3/1');expect(formationLabel({id:'mortar1',kind:'MORTAR',name:'1/60mm Mortar'})).toBe('1MTR');expect(formationLabel({id:'xo',kind:'STAFF',name:'Executive Officer'})).toBe('XO');});
 it('bounds camera values and keeps the same map center when zooming',()=>{
  expect(normalizeCamera({zoom:Infinity,left:-20,top:NaN})).toEqual({zoom:1,left:0,top:0});
  expect(normalizeCamera({zoom:10}).zoom).toBe(1.5);
  const camera={zoom:1,left:200,top:300},next=zoomCamera(camera,1.2,800,600);
  expect((next.left+400)/next.zoom).toBe(600);expect((next.top+300)/next.zoom).toBe(600);
  expect(camera).toEqual({zoom:1,left:200,top:300});
 });
 it('keeps fire path endpoints in map coordinates at every supported zoom',()=>{
  for(const zoom of [.5,.9,1,1.5])expect(mapPoint({left:30+220*zoom,top:70+100*zoom,width:200*zoom,height:150*zoom},{left:30,top:70},zoom)).toEqual([320,175]);
 });
 it('resumes camera and recap without changing executable state, RNG or events',()=>{
  const original=createMission(companyAssault,'workspace'),state=advancePhase(original).state;
  const presentation={camera:{zoom:.7,left:123,top:456},reviewId:'recap:event_1'};
  const resumed=resumeCheckpoint(companyAssault,checkpoint(state,presentation));
  expect(resumed.presentation).toEqual(presentation);expect(resumed.state).toEqual(state);
  expect(replayMission(companyAssault,exportReplay(state))).toEqual(state);
 });
 it('recaps the completed phase from visible history, not the currently entered phase',()=>{
  const state=advancePhase(createMission(companyAssault,'recap')).state,events=getVisibleEvents(state),before=structuredClone(events);
  const recap=previousSegment(events,PHASES);
  expect(recap.phase).toBe('FRIENDLY_EVENTS');expect(recap.label).toContain('3.1');
  expect(recap.events.some(e=>e.type==='PHASE_SKIPPED')).toBe(true);
  expect(recap.events.every(e=>e.phase===recap.phase)).toBe(true);expect(events).toEqual(before);
 });
 it('shows live formation side and quantities, and retains unloading legality',()=>{
  const u=getPlayerView(createMission(companyAssault,'inventory')).units.find(u=>u.id==='co');
  u.inventory={equipment:[{label:'HC SMOKE',quantity:3},{label:'RIFLE GRENADE',quantity:1}],radios:['CO'],casualties:[]};
  u.options=[{type:'DROP_LOAD',label:'Drop all carried items',available:true,cost:0}];
  const before=structuredClone(u),html=inlineInventory(u,{locked:true});
  expect(html).toContain('× 3');expect(html).toContain('× 1');expect(html).toContain('CO radio');
  expect(html).toMatch(/data-inline-unload="DROP_LOAD" disabled/);expect(html).not.toContain('2 Shots');expect(u).toEqual(before);
  expect(formationCounter({...u,cohesion:'F'})).toContain('FIRE');expect(formationCounter({...u,cohesion:'F'})).not.toContain('/hq.png');
 });
 it('ships every referenced counter crop with auditable source bounds',()=>{
  const manifest=JSON.parse(readFileSync('src/ui/counterManifest.json','utf8'));
  expect(existsSync(manifest.source)).toBe(true);
  for(const asset of Object.values(manifest.counters)){expect(existsSync(`public${asset.file}`)).toBe(true);expect(asset.bounds).toHaveLength(4);expect(asset.bounds[2]).toBeGreaterThan(asset.bounds[0]);}
 });
});
