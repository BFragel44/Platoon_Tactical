import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,advancePhase,submitCommand,resolveCombat,eligibleHQs,selectHQ,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {communication} from '../src/sim/company/battlefield.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
const issue=(s,c)=>{const r=submitCommand(s,c);expect(r.accepted,r.reason).toBe(true);return r.state;};
function generalTurn2(s){
 for(let i=0;i<100&&!(s.turn===2&&s.impulse?.hq==='general');i++){
  const pending=s.pending_combat?.[s.segment_progress?.index],hq=!s.impulse&&eligibleHQs(s)[0];
  const r=hq?selectHQ(s,hq):s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='awaiting_resolution'&&pending?.target_visible?resolveCombat(s,pending.id):advancePhase(s);
  expect(r.state).not.toBe(s);s=r.state;
 }
 expect(s.turn).toBe(2);expect(s.impulse.hq).toBe('general');return s;
}
function exact(def,s){expect(replayMission(def,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);}
it('replays an actual Checking Up visitor recovering a CO radio without gaining remote access when CO moves away',()=>{
 const def={...structuredClone(companyAssault),id:'visitor_replay',contacts:[],rules:{specialEnemies:true,events:'normandy',friendly_event_tables:{early:Array(10).fill('CHECKING_UP'),late:Array(10).fill('CHECKING_UP')}},units:trevieres.units.filter(u=>['co','s11'].includes(u.id)).map(u=>({...structuredClone(u),location:'r1c1',experience:'Line',...(u.id==='co'?{radios:['BN','CO','CO']}: {})}))};
 let s=createMission(def,'visitor-replay-20');s=issue(s,{type:'DROP_LOAD',unit_id:'co',drop_items:[{type:'RADIO',key:'CO',quantity:1}]});
 const radio=s.assets.find(a=>a.net==='CO').id;s=generalTurn2(s);
 const u=Object.values(s.units).find(u=>u.command_role==='higher_hq');expect(u.higher_hq_profile).toBe('REGIMENTAL_STAFF');expect(u.radios).toEqual([]);
 s=issue(s,{type:'PICKUP_RADIO',unit_id:u.id,target_id:radio});s=issue(s,{type:'MOVE',unit_id:'co',target_id:'r1c2',arrival_cover:'open'});
 expect(communication(s,s.units[u.id],s.units.co)).toBeNull();exact(def,s);
});
it('replays legal company staff succession following combat losses without consuming a higher visitor',()=>{
 const def={...structuredClone(companyAssault),id:'visitor_succession_replay',contacts:[],rules:{specialEnemies:true},units:trevieres.units.filter(u=>['co','staff','s11'].includes(u.id)).map(u=>({...structuredClone(u),location:u.id==='co'?'r1c1':'r0c1',experience:'Line'}))};
 def.units.push({id:'visitor',name:'Regimental staff',kind:'STAFF',command_role:'higher_hq',higher_hq_profile:'REGIMENTAL_STAFF',capabilities:{higher_priority:0},faction:'friendly',location:'r0c1',platoon:null,experience:'Line',steps:1,radios:[],vof:null,range:0},{id:'enemy',name:'Enemy MG',kind:'MG',steps:1,location:'r2c1',vof:'H',range:3,radios:[],experience:'Line',faction:'enemy'});
 let s=generalTurn2(createMission(def,'visitor-succession-0'));expect(s.units.co.steps).toHaveLength(0);
 const before=structuredClone(s),r=submitCommand(s,{type:'RECONSTITUTE_HQ',unit_id:'visitor',issuer_id:'staff',target_id:'co'});expect(r.accepted).toBe(false);expect(r.state).toEqual(before);
 s=issue(s,{type:'RECONSTITUTE_HQ',unit_id:'staff',issuer_id:'staff',target_id:'co'});expect(s.units.co.cohesion).toBe('GOOD');expect(s.units.visitor.steps).toHaveLength(1);exact(def,s);
});
it('replays conditional on-map BN activation with authored BN equipment at both eligible endpoints',()=>{
 const def={...structuredClone(companyAssault),id:'bn_radio_replay',contacts:[],rules:{specialEnemies:true},units:trevieres.units.filter(u=>['co','s11'].includes(u.id)).map(u=>({...structuredClone(u),location:'r1c1',experience:'Line'}))};
 // An explicit radio-equipped fixture, not a change to visitor event inventory.
 def.units.push({id:'visitor',name:'Battalion staff',kind:'STAFF',command_role:'higher_hq',higher_hq_profile:'BATTALION_STAFF',capabilities:{higher_priority:2},faction:'friendly',location:'r2c2',platoon:null,experience:'Line',steps:1,radios:['BN'],vof:null,range:0});
 let s=createMission(def,'bn-radio');for(let i=0;i<3;i++)s=advancePhase(s).state;
 expect(s.phase).toBe('BN_ACTIVATION');s=issue(s,{type:'ACTIVATE',unit_id:'visitor',issuer_id:'visitor',target_id:'co'});expect(s.activated).toContain('co');exact(def,s);
});
