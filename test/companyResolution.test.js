import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat as resolveCurrentCombat,selectHQ,submitCommand,getPlayerView,getVisibleEvents,exportReplay,replayMission,endTurn} from '../src/sim/company/engine.js';
import {communication,communicationLos,los,refresh,spot,combatModifier} from '../src/sim/company/battlefield.js';
import {infiltrationReason,move,execute} from '../src/sim/company/actions.js';
import {resolveContacts,applyHit} from '../src/sim/company/combat.js';
import {cards} from '../src/sim/company/core.js';
import {checkpoint,readRecovery,saveRecovery,resumeCheckpoint,SAVE_KEY} from '../src/ui/localRecovery.js';
import {fireMarkers,pdfDirections} from '../src/ui/fireMarkers.js';
import {combatPlayback} from '../src/ui/combatPlayback.js';

const fresh=()=>createMission(companyAssault,'company-1');
const impulse=s=>{s.phase='GENERAL_INITIATIVE';s.impulse={id:'fixture',hq:'general',commands:6,spent:0};return s;};
const order=(s,type,id,target)=>submitCommand(s,{type,unit_id:id,issuer_id:id,target_id:target});
function enemy(s,id='e',known=true){const u={...structuredClone(s.units.mg1),id,name:'German LMG',location:'r1c2',faction:'enemy',radios:[]};s.units[id]=u;if(known)spot(s,u);return u;}
function fixDeck(s,success){const ids=Object.values(cards).filter(c=>c.infiltrate===success).slice(0,2).map(c=>c.id);s.deck.order=[...ids,...s.deck.order.filter(id=>!ids.includes(id))];}
function memory(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
function legalCombatReview(phase='COMBAT_EFFECTS'){
  let s=fresh(),guard=0,moved=false;
  while(s.phase!==phase&&guard++<100){
    const v=getPlayerView(s),moveOption=v.units.find(u=>u.id==='s11').options.find(o=>o.type==='MOVE');
    if(!moved&&moveOption.targets.some(t=>t.id==='r1c1'&&!t.reason)){
      const r=submitCommand(s,{type:'MOVE',unit_id:'s11',issuer_id:s.impulse.hq,target_id:'r1c1'});expect(r.accepted).toBe(true);s=r.state;moved=true;
    }else if(!s.impulse&&v.eligible_hqs.length)s=selectHQ(s,v.eligible_hqs[0]).state;
    else s=advancePhase(s).state;
  }
  expect(moved).toBe(true);expect(s.phase).toBe(phase);
  if(phase==='COMBAT_EFFECTS'){const current=getPlayerView(s).combat_resolution;return resolveCurrentCombat(s,current.id).state;}
  return advancePhase(s).state;
}

describe('Readable resolution rules',()=>{
 it('separates staging radio LOS from firing and spotting, retaining the hub restrictions',()=>{
  const s=fresh();expect(communicationLos(s,'r0c1','r0c4')).toBe(true);
  expect(los(s,'r0c1','r0c1')).toBe(false);expect(los(s,'r0c1','r0c4')).toBe(false);
  s.units.hq1.location='r1c1';expect(communication(s,s.units.co,s.units.hq1)).toContain('CO radio');
  expect(communicationLos(s,'r0c2','r1c4')).toBe(false);expect(los(s,'r0c2','r1c1')).toBe(false);
  s.units.co.cover='cover';expect(communication(s,s.units.co,s.units.hq1)).toBeNull();
 });
 it('rejects staging cover without spending or drawing, and permits unexposed staging movement once per impulse',()=>{
  let s=impulse(fresh());let r=order(s,'SEEK_COVER','s11');expect(r.accepted).toBe(false);expect(r.state).toBe(s);
  expect(r.reason).toContain('Staging');r=order(s,'MOVE','s11','r0c2');expect(r.accepted).toBe(true);s=r.state;expect(s.units.s11.exposed).toBe(false);
  expect(order(s,'MOVE','s11','r0c3').accepted).toBe(false);
 });
 it('general initiative respects pinned withdrawal and drops radios, equipment and casualties at origin',()=>{
  const s=impulse(fresh()),u=s.units.hq1;u.location='r1c1';u.pinned=true;s.casualties.push({id:'c',location:u.location,carrier:u.id});
  expect(order(s,'MOVE',u.id,'r1c2').accepted).toBe(false);
  const r=order(s,'MOVE',u.id,'r0c1');expect(r.accepted).toBe(true);
  expect(r.state.units.hq1.radios).toEqual([]);expect(r.state.units.hq1.assets).toEqual({});
  expect(r.state.assets.map(a=>a.type)).toEqual(['RADIO','EQUIPMENT']);expect(r.state.assets.every(a=>a.location==='r1c1')).toBe(true);
  expect(r.state.casualties[0]).toMatchObject({carrier:null,location:'r1c1'});
 });
 it('centralizes current-side, pin, heavy, tripod, exposure and LAT infiltration restrictions',()=>{
  const s=impulse(fresh()),u=s.units.mortar;u.location='r1c1';s.markers.push({type:'GRENADE_MISS',location:u.location});
  expect(infiltrationReason(s,u,'r1c2')).toContain('heavy');u.cohesion='F';s.units.s11.location='r1c2';expect(infiltrationReason(s,u,'r1c2')).toBeNull();
  u.cohesion='GOOD';u.vof='S';u.tripod=true;expect(infiltrationReason(s,u,'r1c2')).toContain('tripod');
  u.tripod=false;u.pinned=true;expect(infiltrationReason(s,u,'r1c2')).toContain('Pinned');u.pinned=false;u.exposed=true;expect(infiltrationReason(s,u,'r1c2')).toContain('exposed');
  u.exposed=false;u.cohesion='L';expect(infiltrationReason(s,u,'r0c4')).not.toBeNull();
  // Empty staging is legal withdrawal, but is not a legal F/L infiltration destination.
  expect(infiltrationReason(s,u,'r0c2')).toBeNull();s.units.co.location='r0c3';s.units.staff.location='r0c3';expect(infiltrationReason(s,u,'r0c2')).not.toBeNull();
 });
 it.each([true,false])('infiltration success=%s moves with the corresponding exposure and cannot allow a second adjacent move',success=>{
  const s=impulse(fresh()),u=s.units.s11;u.location='r1c1';s.markers.push({type:'GRENADE_MISS',location:u.location});fixDeck(s,success);
  const r=order(s,'INFILTRATE',u.id,'r1c2');expect(r.accepted).toBe(true);expect(r.state.units.s11.location).toBe('r1c2');expect(r.state.units.s11.exposed).toBe(!success);
  expect(order(r.state,'MOVE',u.id,'r1c3').accepted).toBe(false);
 });
 it('platoon infiltration leaves heavy weapons and exposed members in place',()=>{
  const s=impulse(fresh());s.impulse.hq='hq1';for(const id of ['hq1','s11','s12','mg1'])s.units[id].location='r1c1';
  s.units.mg1.tripod=true;s.units.s12.exposed=true;s.markers.push({type:'GRENADE_MISS',location:'r1c1'});
  const r=order(s,'PLATOON_INFILTRATE','hq1','r1c2');expect(r.accepted).toBe(true);expect(r.state.units.s11.location).toBe('r1c2');expect(r.state.units.mg1.location).toBe('r1c1');expect(r.state.units.s12.location).toBe('r1c1');
 });
 it.each([true,false])('within-card infiltration success=%s shares eligibility and exposure rules',success=>{
  const s=impulse(fresh()),u=s.units.s11;u.location='r1c1';s.locations[u.location].covers.push({id:'cover',type:'Cover',value:1,known:true});s.markers.push({type:'GRENADE_MISS',location:u.location});fixDeck(s,success);
  const r=order(s,'INFILTRATE_WITHIN',u.id,'cover');expect(r.accepted).toBe(true);expect(r.state.units.s11.cover).toBe('cover');expect(r.state.units.s11.exposed).toBe(!success);
 });
 it('keeps trench/bunker/pillbox transfers unexposed without erasing prior exposure',()=>{
  const s=impulse(fresh()),u=s.units.s11;u.location='r1c1';u.cover='a';s.locations.r1c1.covers=[{id:'a',type:'Trench',known:true},{id:'b',type:'Pillbox',known:true}];
  let r=order(s,'ENTER_COVER',u.id,'b');expect(r.accepted).toBe(true);expect(r.state.units.s11.exposed).toBe(false);
  r.state.units.s11.exposed=true;r=order(r.state,'ENTER_COVER',u.id,'a');expect(r.state.units.s11.exposed).toBe(true);
  s.locations.r1c2.covers=[{id:'c',type:'Bunker',known:true}];move(s,u,'r1c2');expect(u.exposed).toBe(false);
 });
 it('updates spotted pins and child formations independently of frozen fire, keeping hidden units hidden',()=>{
  const s=fresh(),e=enemy(s);s.units.s11.location='r1c1';refresh(s);const fire=structuredClone(s.fire);applyHit(s,e,'L');
  enemy(s,'secret',false);const v=getPlayerView(s);expect(v.enemies.some(u=>u.cohesion==='L'&&u.pinned)).toBe(true);expect(v.enemies.find(u=>u.id==='e').steps).toBe(1);
  expect(v.enemies.some(u=>u.id==='secret')).toBe(false);expect(s.fire).toEqual(fire);
 });
 it('does not automatically fire into mixed occupancy, but preserves established fire after a kill',()=>{
  const s=fresh(),e=enemy(s);s.units.s11.location='r1c1';s.units.s12.location=e.location;refresh(s);expect(s.units.s11.fire).toBeNull();
  s.units.s12.location='r0c1';refresh(s);expect(s.units.s11.fire).toBe(e.location);e.removed='BROKEN';refresh(s);expect(s.units.s11.fire).toBe(e.location);
 });
 it('resolves one contact per operation using the refreshed activity for the next card',()=>{
  let s=fresh();s.phase='CONTACTS';s.units.s11.location='r1c1';s.units.s21.location='r1c3';
  const batch=structuredClone(s);resolveContacts(batch);s=advancePhase(s).state;expect(s.phase).toBe('CONTACTS');expect(s.segment_progress.remaining).toBe(1);
  expect(s.events.filter(e=>e.type==='CONTACT_EVALUATED')).toHaveLength(1);expect(s.activity).not.toBe('NO_CONTACT');
  s=advancePhase(s).state;expect(s.phase).toBe('CONTACTS');expect(s.segment_progress.remaining).toBe(0);expect(s.deck).toEqual(batch.deck);expect(s.units).toEqual(batch.units);
  s=advancePhase(s).state;expect(s.phase).toBe('PINNED_RECOVERY');
 });
 it('resolves a frozen combat once, reviews in 3.7.4, and preserves fire relationships',()=>{
  const s=legalCombatReview(),before=structuredClone(s);expect(s.phase).toBe('COMBAT_EFFECTS');expect(s.segment_progress.status).toBe('reviewing_result');
  const frames=combatPlayback(getVisibleEvents(s),s.turn);expect(frames.length).toBeGreaterThan(0);expect(s).toEqual(before);
  expect(resolveCurrentCombat(s,s.pending_combat[s.segment_progress.index].id).accepted).toBe(false);
  const next=advancePhase(s).state;expect(next.phase).toBe('COMBAT_EFFECTS');expect(next.fire).toEqual(s.fire);
  expect(replayMission(companyAssault,exportReplay(s))).toEqual(s);expect(endTurn(s).state.turn).toBe(2);
 });
 it('projects marker explanations without attacker identities and gives same-card fire no PDF',()=>{
  const s=fresh(),e=enemy(s,'hidden',false);s.units.s11.location='r1c1';e.fire='r1c1';refresh(s);const v=getPlayerView(s),l=v.locations.find(l=>l.id==='r1c1');
  const markers=fireMarkers(v,l);expect(markers[0].detail).toContain('Unidentified attacker');expect(JSON.stringify(markers)).not.toContain('German');
  v.fire=[{origin:l.id,target:l.id,value:0,friendly:true,source:'s11'}];expect(pdfDirections(v,l)).toEqual([]);expect(fireMarkers(v,l)).toHaveLength(1);
 });
});

describe('Strict local recovery',()=>{
 it('restores identical mid-review state, deck, history and presentation, preserving a separate turn checkpoint',()=>{
  const storage=memory(),s=legalCombatReview(),start=checkpoint(fresh()),presentation={combatId:s.pending_combat[s.segment_progress.index].id,combatStage:'result',selected:null};
  saveRecovery(storage,s,presentation,{turnStart:start});const saved=readRecovery(storage).bundle;
  const restored=resumeCheckpoint(companyAssault,saved.latest);expect(restored.state).toEqual(s);expect(restored.presentation).toEqual(presentation);expect(resumeCheckpoint(companyAssault,saved.turnStart).state).toEqual(fresh());
  const later=endTurn(s).state;saveRecovery(storage,later,{}, {turnStart:checkpoint(later)});expect(resumeCheckpoint(companyAssault,readRecovery(storage).bundle.turnStart).state).toEqual(later);
 });
 it('resumes a contact review without redrawing or evaluating another card',()=>{
  const s=legalCombatReview('CONTACTS'),storage=memory();saveRecovery(storage,s,{}, {turnStart:checkpoint(fresh())});
  const restored=resumeCheckpoint(companyAssault,readRecovery(storage).bundle.latest).state;
  expect(restored).toEqual(s);expect(restored.phase).toBe('CONTACTS');expect(restored.segment_progress.status).toBe('reviewing');
 });
 it('preserves the old save on storage failure and keeps corrupt/incompatible data exportable',()=>{
  const storage=memory();saveRecovery(storage,fresh());const original=storage.getItem(SAVE_KEY);
  expect(()=>saveRecovery({...storage,setItem(){throw new Error('Quota exceeded');}},legalCombatReview())).toThrow('Quota');expect(storage.getItem(SAVE_KEY)).toBe(original);
  const old=JSON.parse(original);old.latest.replay.rules_version=2;expect(()=>resumeCheckpoint(companyAssault,old.latest)).toThrow('version mismatch');
  storage.setItem(SAVE_KEY,'corrupt');expect(readRecovery(storage).raw).toBe('corrupt');expect(()=>saveRecovery(storage,fresh())).toThrow('Cannot read');
  saveRecovery(storage,fresh(),{}, {replace:true});expect(storage.getItem(`${SAVE_KEY}-previous`)).toBe('corrupt');
 });
});
