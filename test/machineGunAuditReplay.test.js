import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {createMission,advancePhase,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
const issue=(s,c)=>{const r=submitCommand(s,c);expect(r.accepted,r.reason).toBe(true);return r.state;};
const exact=(def,s)=>{expect(replayMission(def,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);};
function base(){return {...structuredClone(companyAssault),id:'mg_audit_replay',contacts:[],rules:{specialEnemies:true,ammo:'tracked'},units:[]};}
it('exactly replays and recovers a legal A+ HMG concentration after spotting',()=>{
 const def=base();def.units=trevieres.units.filter(u=>u.id==='co').map(u=>({...structuredClone(u),location:'r2c2'}));
 def.units.push({...structuredClone(stGeorges.units.find(u=>u.id==='hmg1')),location:'r2c2'},
  {...structuredClone(trevieres.units.find(u=>u.id==='s11')),id:'enemy',faction:'enemy',location:'r2c3',vof:null,unspotted_position_public:true});
 let s=createMission(def,'rules-fixes-0');for(let i=0;i<4;i++)s=advancePhase(s).state;
 s=issue(s,{type:'SPOT',unit_id:'co',issuer_id:'co',target_id:'r2c3'});expect(s.knowledge.spotted.enemy).toBeTruthy();
 s=issue(s,{type:'CONCENTRATE',unit_id:'hmg1',issuer_id:'co',target_id:'enemy'});
 expect(s.events.some(e=>e.type==='CONCENTRATE_ATTEMPT'&&e.actor==='hmg1')).toBe(true);exact(def,s);
});
it('replays a friendly unit entering an upper story and intercepting an existing overhead lane',()=>{
 const def=base();def.rules.hill192=true;
 for(const l of def.locations)if(!l.staging)Object.assign(l,{terrain:'fields',elevation:1,borders:borders(DIRECTIONS)});
 def.locations.find(l=>l.id==='r1c2').elevation=2;def.locations.find(l=>l.id==='r3c2').elevation=2;
 def.locations.find(l=>l.id==='r2c2').covers=[{id:'ground',type:'Light Building',value:2,known:true,discovered:true},{id:'upper',parent:'ground',type:'Upper Story',elevation:1,value:2,known:true,discovered:true}];
 def.units=trevieres.units.filter(u=>['co','hmg50','s11'].includes(u.id)).map(u=>({...structuredClone(u),location:u.id==='s11'?'r2c2':'r1c2',experience:'Line'}));
 def.units.push({...structuredClone(trevieres.units.find(u=>u.id==='s12')),id:'enemy',faction:'enemy',location:'r3c2',vof:null,unspotted_position_public:true});
 let s=createMission(def,'rules-fixes-0');for(let i=0;i<4;i++)s=advancePhase(s).state;
 s=issue(s,{type:'SPOT',unit_id:'co',issuer_id:'co',target_id:'r3c2'});expect(s.knowledge.spotted.enemy).toBeTruthy();expect(s.units.hmg50.fire).toBe('r3c2');
 for(let i=0;i<30&&s.impulse?.hq!=='general';i++)s=advancePhase(s).state;
 expect(s.impulse.hq).toBe('general');
 s=issue(s,{type:'ENTER_COVER',unit_id:'s11',target_id:'upper'});
 expect(s.fire.some(f=>f.source==='hmg50'&&f.target==='r3c2')).toBe(false);
 expect(s.fire.some(f=>f.source==='hmg50'&&f.target==='r2c2')).toBe(true);exact(def,s);
});
