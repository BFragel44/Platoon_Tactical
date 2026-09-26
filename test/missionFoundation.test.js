import {describe,it,expect} from 'vitest';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {normandyTerrain} from '../src/scenarios/normandyTerrain.js';
import {missionCatalog,playableMissionById} from '../src/scenarios/missions.js';
import {createMission,previewMissionSetup,advancePhase,endTurn,abortMission,exportReplay,replayMission,getPlayerView,getAfterActionReport} from '../src/sim/company/engine.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {secureStatus,scoreMission,higherEvent,checkMines,supportRequest} from '../src/sim/company/missionFeatures.js';
import {communication,los,refresh} from '../src/sim/company/battlefield.js';
import {contactQueue,resolveMissionContact} from '../src/sim/company/missionContacts.js';
import {cards} from '../src/sim/company/core.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {setupMarkup} from '../src/ui/missionSetup.js';

// The standalone validation mission is available; Normandy remains gated.
const draft={...keepUpTheFire,readiness:{playable:true}};
const fresh=()=>createMission(draft,'keep-1');
const stack=(s,ids)=>{s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];};
describe('Mission foundation and development gates',()=>{
 it('enables standalone acceptance while keeping unsupported Normandy unavailable',()=>{
  expect(createMission(keepUpTheFire,'x').scenario_id).toBe(keepUpTheFire.id);
  expect(playableMissionById('keep_up_the_fire')).toBe(keepUpTheFire);
  expect(()=>playableMissionById('normandy_1')).toThrow('unavailable');
  expect(playableMissionById(companyAssault.id)).toBe(companyAssault);
  expect(missionCatalog.find(m=>m.id==='normandy_1').scenario).toBeUndefined();
 });
 it('previews 16 terrain cards, staging and the published 25-formation force',()=>{
  const p=previewMissionSetup(keepUpTheFire,'keep-1');
  expect(p.playable).toBe(true);expect(p.locations).toHaveLength(20);expect(p.units).toHaveLength(25);
  expect(p.units.filter(u=>u.kind==='SQUAD')).toHaveLength(9);
  expect(p.units.filter(u=>['AT','MG','MORTAR'].includes(u.kind)).every(u=>u.steps===1)).toBe(true);
  expect(p.units.filter(u=>u.kind==='HQ')).toHaveLength(4);
  expect(p.units.filter(u=>u.kind==='STAFF')).toHaveLength(2);
 });
 it('has 55 distinct source cards and asymmetric printed borders',()=>{
  expect(normandyTerrain).toHaveLength(55);expect(new Set(normandyTerrain.map(c=>c.id)).size).toBe(55);
  const south=normandyTerrain.find(c=>c.id==='normandy_2_1_6');
  expect(south.borders.S).toBe('white');expect(south.borders.N).toBe('dark');
  expect(normandyTerrain.find(c=>c.id==='normandy_1_1_7').open_protection).toBeUndefined();
  expect(normandyTerrain.find(c=>c.id==='normandy_2_2_4').cover_limit).toBe(1);
 });
 it('repeats seeded setup without mutating its definition or another mission',()=>{
  const before=structuredClone(keepUpTheFire),course=createMission(companyAssault,'company-1'),record=structuredClone(course);
  expect(previewMissionSetup(keepUpTheFire,'keep-1')).toEqual(previewMissionSetup(keepUpTheFire,'keep-1'));
  expect(keepUpTheFire).toEqual(before);expect(course).toEqual(record);
  expect(previewMissionSetup(keepUpTheFire,'keep-1').locations).not.toEqual(previewMissionSetup(keepUpTheFire,'keep-2').locations);
 });
 it('records setup choices in strict replay and recovery',()=>{
  const setup={objectives:{primary:'r4c1',secondary:'r4c4',attack:'r3c1',ccp:'r0c4'},assignments:{mg1:{platoon:3}},positions:{mg1:'r0c4'}};
  let s=createMission(draft,'keep-1',setup);s=endTurn(s).state;s=abortMission(s).state;
  expect(exportReplay(s).setup).toEqual(setup);expect(replayMission(draft,exportReplay(s))).toEqual(s);
  expect(resumeCheckpoint(draft,checkpoint(s,{combatStage:'result'}))).toEqual({state:s,presentation:{combatStage:'result'}});
  expect(getAfterActionReport(s)).toMatchObject({scenario:keepUpTheFire.id,scenario_version:11,rules_version:9,setup});
 });
 it('rejects unknown setup data and invalid tactical controls or attachments',()=>{
  for(const setup of [{positions:{ghost:'r0c1'}},{objectives:{primary:'r4c3'}},{objectives:{attack:'r2c1'}},{assignments:{mg1:{platoon:0}}},{positions:{co:'r1c1'}},{assets:{co:{smoke:999}}}])expect(()=>materializeScenario(keepUpTheFire,'x',setup)).toThrow();
 });
 it('does not project unrevealed terrain, printed stats or source identities',()=>{
  const s=fresh(),v=getPlayerView(s),hidden=v.locations.filter(l=>l.known===false);
  expect(hidden.length).toBeGreaterThan(0);
  for(const l of hidden){expect(l.terrain).toBeUndefined();expect(l.terrain_card).toBeUndefined();expect(l.protection).toBeUndefined();expect(l.borders).toBeNull();}
  expect(setupMarkup(previewMissionSetup(keepUpTheFire,'keep-1'),true)).toContain('Start mission with this setup');
 });
 it('reveals staging-visible terrain without allowing staging combat or spotting',()=>{
  const s=fresh();expect(Object.values(s.locations).filter(l=>l.row===1).every(l=>l.known)).toBe(true);
  expect(los(s,'r0c1','r1c1')).toBe(false);expect(getPlayerView(s).units.find(u=>u.id==='co').los).toEqual([]);
 });
 it('applies mission HQ communications without changing the regression course',()=>{
  const s=fresh();s.units.co.location='r0c1';s.units.hq3.location='r4c4';
  expect(communication(s,s.units.co,s.units.hq3)).toBeTruthy();s.units.hq3.pinned=true;
  expect(communication(s,s.units.co,s.units.hq3)).toBeNull();
  s.units.s11.location=s.units.co.location;s.units.s11.pinned=true;s.units.s11.cover='different';
  expect(communication(s,s.units.co,s.units.s11)).toBeTruthy();
 });
 it('distinguishes cleared from secured and ignores residual fire and casualties',()=>{
  const s=fresh(),id='r4c2';s.contacts[`pc_${id}`].resolved=true;
  expect(secureStatus(s,id)).toEqual({cleared:true,secured:false});s.units.s11.location=id;
  s.support.push({location:id,status:'ACTIVE',value:-3});s.casualties.push({location:id,faction:'friendly'});
  expect(secureStatus(s,id)).toEqual({cleared:true,secured:true});
  const e=structuredClone(s.units.s11);e.id='enemy';e.faction='enemy';s.units.enemy=e;
  expect(secureStatus(s,id)).toEqual({cleared:false,secured:false});
 });
 it('orders A before B before C, reproducibly',()=>{
  const a=fresh(),b=structuredClone(a),pcs=Object.values(a.contacts);
  const ids=contactQueue(a,pcs);expect(ids).toEqual(contactQueue(b,pcs));
  expect(ids.map(id=>a.contacts[id].type).join('')).toBe('AAAABBBBBBBBCCCC');
 });
 it('previews the queued contact that progression actually resolves without drawing during inspection',()=>{
  const s=fresh();s.phase='CONTACTS';s.impulse=null;s.segment_progress=null;
  s.units.s11.location='r2c1';s.units.s12.location='r3c2';
  s.contact_queue=['pc_r3c2','pc_r2c1'];
  const before=structuredClone(s);
  expect(getPlayerView(s).contact_review).toMatchObject({location:'r3c2',next_location:'r3c2',resolved:false});
  expect(s).toEqual(before);
  const after=advancePhase(s).state;
  expect(after.contacts.pc_r3c2.resolved).toBe(true);
  expect(after.contacts.pc_r2c1.resolved).toBe(false);
  expect(getPlayerView(after).contact_review).toMatchObject({location:'r3c2',next_location:'r2c1',resolved:true});
 });
 it('has exact published package table sizes and no no-contact shortcut for C',()=>{
  for(const t of Object.values(keepUpTheFire.package_tables))expect(t).toHaveLength(10);
  const s=fresh(),pc=s.contacts.pc_r1c1;s.units.s11.location=pc.location;
  stack(s,Object.values(cards).filter(c=>c.id!==51&&c.word!=='Contact').slice(0,4).map(c=>c.id));
  const before=s.deck.draws;resolveMissionContact(s,pc);
  expect(s.deck.draws-before).toBe(4);expect(s.events.at(-1).contact).toBe(false);
 });
 it('checks mines per moving formation without resolving combat immediately',()=>{
  const s=fresh(),u=s.units.s11;u.location='r1c1';s.locations[u.location].mines=true;
  stack(s,[Object.values(cards).find(c=>c.burst).id]);const before=u.steps.length;
  checkMines(s,u);expect(u.steps.length).toBe(before);expect(u.mine_hit).toBe(true);expect(s.markers.at(-1)).toMatchObject({type:'MINES',target:u.id,value:-4});
 });
 it('places support pending with the agency value and caller draw allowance',()=>{
  const s=fresh(),u=s.units.artyfo;u.location='r1c1';
  const hits=Object.values(cards).filter(c=>c.burst&&!c.short).slice(0,3).map(c=>c.id);stack(s,hits);const before=s.deck.draws;
  supportRequest(s,u,'artillery','WP','r2c1');
  expect(s.deck.draws-before).toBe(3);expect(s.support.at(-1)).toMatchObject({status:'PENDING',agency:'artillery',ammo:'WP',value:-4});
 });
 it('does not draw higher-HQ events in turn one',()=>{const s=fresh(),before=structuredClone(s);higherEvent(s,'friendly');higherEvent(s,'enemy');expect(s).toEqual(before);});
 it('does not duplicate an achievement',()=>{const s=fresh();s.units.s11.location=s.objectives.primary;s.contacts[`pc_${s.objectives.primary}`].resolved=true;scoreMission(s);const count=s.achievements.length;scoreMission(s);expect(s.achievements.length).toBe(count);});
 it('rejects revision-8 executable records without editing them',()=>{const r=exportReplay(createMission(companyAssault,'company-1'));r.rules_version=8;const original=structuredClone(r);expect(()=>replayMission(companyAssault,r)).toThrow('version mismatch');expect(r).toEqual(original);});
});
