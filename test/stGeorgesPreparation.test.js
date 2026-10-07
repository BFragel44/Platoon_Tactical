import {describe,it,expect} from 'vitest';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {createMission,preparePatrol,checkObjective,endTurn,exportReplay,replayMission,getPlayerView} from '../src/sim/company/engine.js';
import {createCampaignRoster,applyMissionDebrief,saveCampaign,readCampaign} from '../src/sim/company/campaignRoster.js';
import {applyHit} from '../src/sim/company/combat.js';
const candidate={...stGeorges,readiness:{playable:true}};
const fresh=()=>createMission(candidate,'patrol-preparation',{},null,{mission_instance_id:'patrol-preparation-instance'});
function completed(){const s=fresh();s.turn=10;checkObjective(s);return s;}
function choices(s,platoon=2){return {patrol:{...s.patrol.plan,platoon},positions:Object.fromEntries(Object.values(s.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||u.removed==='RESERVE')).map(u=>[u.id,`r1c${u.platoon??(['HQ','STAFF','FO'].includes(u.kind)?2:4)}`]))};}
describe('three-patrol preparation, persistence and XP',()=>{
 it('starts each previously unused platoon once with detached starting records',()=>{
  const s=completed(),first=structuredClone(s.attempt_records[0]);let next=preparePatrol(s,choices(s)).state;
  expect(next.attempt_number).toBe(2);expect(next.attempt_records).toHaveLength(2);expect(next.attempt_records[0]).toEqual(first);expect(s.attempt_number).toBe(1);
  next.turn=10;checkObjective(next);const third=preparePatrol(next,choices(next,3)).state;expect(third.attempt_number).toBe(3);expect(third.attempt_records).toHaveLength(3);
  third.turn=10;checkObjective(third);expect(third.status).toBe('DEFEAT');expect(third.patrol_history.map(p=>p.platoon)).toEqual([1,2,3]);
  expect(()=>preparePatrol(third,choices(third,1))).toThrow('No next patrol');
 });
 it('preserves terrain, mines, enemy spotting and remaining contacts while restoring expended resources',()=>{
  const s=completed();s.locations.r3c3.mines=true;s.units.mortar_section.ammo.MTR=0;s.support_inventory.artillery.HE=0;s.contacts.pc_r2c1.resolved=true;
  s.knowledge.spotted.fixture={id:'fixture'};const terrain=structuredClone(s.locations),contacts=Object.values(s.contacts).filter(pc=>!pc.resolved).map(pc=>pc.id);
  const n=preparePatrol(s,choices(s)).state;expect(n.locations).toEqual(terrain);expect(n.knowledge.spotted).toEqual(s.knowledge.spotted);
  expect(n.units.mortar_section.ammo.MTR).toBe(4);expect(n.support_inventory.artillery).toEqual(stGeorges.support_agencies.artillery.inventory);
  for(const id of contacts)expect(n.contacts[id]).toEqual(s.contacts[id]);expect(getPlayerView(n).contacts.find(pc=>pc.location==='r2c1'&&!pc.resolved).type).toBe('?');
 });
 it('resupplies reserve units and makes them available for later deployment',()=>{
  const s=completed();s.units.mortar_section.ammo.MTR=0;const c=choices(s);c.positions.mortar_section='RESERVE';let n=preparePatrol(s,c).state;
  expect(n.units.mortar_section.removed).toBe('RESERVE');expect(n.units.mortar_section.ammo.MTR).toBe(4);n.turn=10;checkObjective(n);
  const third=preparePatrol(n,choices(n,3)).state;expect(third.units.mortar_section.removed).toBe(null);
 });
 it('rejects active missions, repeated platoons, moved COPs and out-of-area deployment without mutation',()=>{
  expect(()=>preparePatrol(fresh(),choices(fresh()))).toThrow('No next patrol');const s=completed(),before=structuredClone(s);
  const reused=choices(s,1);expect(()=>preparePatrol(s,reused)).toThrow('unused');const moved=choices(s);moved.patrol.cop='r2c4';expect(()=>preparePatrol(s,moved)).toThrow('retain');
  const invalid=choices(s);invalid.positions.s21='r3c3';expect(()=>preparePatrol(s,invalid)).toThrow();expect(s).toEqual(before);
 });
 it('spends only the completed patrol’s unspent XP and cannot promote fixed defenders',()=>{
  const s=completed();s.achievements.push({key:'xp',points:4,platoon:1});const c=choices(s);c.promote={[s.units.hq1.steps[0].id]:'Line'};c.skills=[{holder:'hq1',type:'AUTO_COVER'}];
  const n=preparePatrol(s,c).state;expect(n.units.hq1.experience).toBe('Line');expect(n.attempt_points_spent).toBe(2);expect(n.skills).toHaveLength(1);expect(n.achievements[0].spent).toBe(true);
  const bad=choices(s);bad.promote={[s.units.hq2.steps[0].id]:'Line'};expect(()=>preparePatrol(s,bad)).toThrow('completed patrol');
 });
 it('does not let attachment reassignment bypass previous-patrol eligibility',()=>{
  const s=completed();s.achievements.push({key:'xp',points:8,platoon:1});const c=choices(s);c.assignments={hmg1:1};c.promote={[s.units.hmg1.steps[0].id]:'Veteran'};
  expect(()=>preparePatrol(s,c)).toThrow('completed patrol');
 });
 it('retains bought skills and physical counter identity without charging for them again',()=>{
  const s=completed();s.achievements.push({key:'xp1',points:2,platoon:1});const c=choices(s);c.skills=[{holder:'hq1',type:'AUTO_COVER'}];let n=preparePatrol(s,c).state;
  n.skills[0].used=true;const original=structuredClone(n.skills[0]);n.turn=10;checkObjective(n);n.achievements.push({key:'xp2',points:1,platoon:2});
  const thirdChoices=choices(n,3);thirdChoices.skills=[{holder:'hq2',type:'AUTO_SPOT'}];const third=preparePatrol(n,thirdChoices).state;
  expect(third.skills[0]).toEqual(original);expect(third.skills[1].counter).not.toBe(original.counter);expect(third.attempt_points_spent).toBe(1);
 });
 it('does not award location points again when contacts are replenished',()=>{
  const s=completed();for(const pc of Object.values(s.contacts))pc.resolved=true;s.patrol.plan.primary='r4c1';s.status='ACTIVE';s.patrol_history=[];checkObjective(s);
  const keys=s.achievements.map(a=>a.key);let n=preparePatrol(s,choices(s)).state;for(const pc of Object.values(n.contacts))pc.resolved=true;n.turn=10;checkObjective(n);
  for(const key of keys)expect(n.achievements.filter(a=>a.key===key)).toHaveLength(1);
 });
 it('reconstitutes with stable step identity and conserves inherited ammunition',()=>{
  const s=fresh(),u=s.units.s11;applyHit(s,u,'F');const donor=Object.values(s.units).find(v=>v.kind==='LAT'&&v.platoon===1),id=donor.steps[0].id;
  s.turn=10;checkObjective(s);const c=choices(s);c.reconstitute={s11:[donor.id]};const n=preparePatrol(s,c).state;
  expect(n.units.s11.steps.map(t=>t.id)).toContain(id);expect(n.units[donor.id].removed).toBe('RECONSTITUTED');expect(n.attempt_history[0].casualties).toEqual(s.casualties);
 });
 it('replays and reloads all three completed patrols exactly through terminal debrief and redeployment',()=>{
  const noEvents={...candidate,rules:{...candidate.rules,events:null}},roster=createCampaignRoster('three-patrol-company',noEvents);
  let s=createMission(noEvents,'three-patrol-replay',{}, {mission_instance_id:'three-patrol-instance',roster});
  for(const platoon of [1,2,3]){while(s.status==='ACTIVE')s=endTurn(s).state;if(platoon<3)s=preparePatrol(s,choices(s,platoon+1)).state;}
  expect(s.status).toBe('DEFEAT');const record=JSON.parse(JSON.stringify(exportReplay(s)));expect(replayMission(noEvents,record)).toEqual(s);
  const updated=applyMissionDebrief(roster,s),data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};saveCampaign(storage,updated,stGeorges.rules.rosterKey);
  const loaded=readCampaign(storage,stGeorges.rules.rosterKey).record;expect(loaded).toEqual(updated);expect(()=>applyMissionDebrief(loaded,s)).toThrow('already applied');
  const deployed=createMission(noEvents,'redeploy',{}, {mission_instance_id:'new-instance',roster:loaded});expect(deployed.roster_snapshot.people).toEqual(loaded.people);
 });
});

it('retains next-patrol Row 1 starts and permits explicitly attached staff',()=>{
 const s=completed(),c=choices(s);c.assignments={staff:2};const n=preparePatrol(s,c).state;expect(n.units.staff.platoon).toBe(2);
 const invalid=choices(s);invalid.positions.s21=s.patrol.plan.cop;expect(()=>preparePatrol(s,invalid)).toThrow('Start the patrolling platoon');
});
