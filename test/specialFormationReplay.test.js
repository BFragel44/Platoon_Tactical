import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,advancePhase,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

// Authored initial conditions; every subsequent transition uses public commands.
function scenario(){
 return {...structuredClone(companyAssault),id:'special_formations_replay',version:1,rules:{ammo:'tracked',specialEnemies:true,grenade:-4},contacts:[],units:trevieres.units.filter(u=>['co','hq2','mortar_section','hmg50'].includes(u.id)).map(u=>({...structuredClone(u),location:['co','hmg50'].includes(u.id)?'r2c2':'r1c1',...(u.id==='co'?{ammo:{MG:2}}:{}),...(u.id==='mortar_section'?{radios:[]}: {})}))};
}
function issue(s,command){const r=submitCommand(s,command);expect(r.accepted,r.reason).toBe(true);return r.state;}
function companyImpulse(s){for(let i=0;i<4;i++)s=advancePhase(s).state;expect(s.impulse.hq).toBe('co');return s;}
function exact(def,s){expect(replayMission(def,exportReplay(s))).toEqual(s);expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);}

it('exactly replays and recovers an HQ-relayed mortar order after a legal spotting attempt',()=>{
 const def=scenario();def.units.push({...structuredClone(trevieres.units.find(u=>u.id==='s11')),id:'enemy',name:'Public position target',faction:'enemy',location:'r2c3',vof:null,unspotted_position_public:true});
 let s=companyImpulse(createMission(def,'rules-fixes-0'));
 s=issue(s,{type:'SPOT',issuer_id:'co',unit_id:'co',target_id:'r2c3'});expect(s.knowledge.spotted.enemy).toBeTruthy();
 s=issue(s,{type:'INDIRECT',issuer_id:'co',unit_id:'mortar_section',target_id:'r2c3'});
 expect(s.fire.some(f=>f.source==='mortar_section'&&f.indirect)).toBe(true);exact(def,s);
});
it('exactly replays named weapon-side restoration after dropping and recovering ammunition',()=>{
 const def=scenario();let s=createMission(def,'rules-fixes-0');
 s=issue(s,{type:'DROP_LOAD',unit_id:'co',drop_items:[{type:'AMMO',key:'MG',quantity:1}]});
 const stock=s.assets.find(a=>a.source_unit==='co'&&a.key==='MG').id;
 s=issue(s,{type:'DROP_LOAD',unit_id:'hmg50'});s=companyImpulse(s);
 s=issue(s,{type:'DEPLOY_FIRE_TEAM',issuer_id:'co',unit_id:'hmg50'});expect(s.units.hmg50.cohesion).toBe('F');
 s=issue(s,{type:'PICKUP_RADIO',issuer_id:'co',unit_id:'hmg50',target_id:stock});
 expect(s.units.hmg50.cohesion).toBe('GOOD');expect(s.units.hmg50.ammo.MG).toBe(1);exact(def,s);
});
it('replays recovered FO radio carriage and legal voice support, rejecting the later remote order atomically',()=>{
 const def=scenario();def.support_agencies=structuredClone(trevieres.support_agencies);
 def.units=trevieres.units.filter(u=>['co','artyfo'].includes(u.id)).map(u=>({...structuredClone(u),location:'r1c1',experience:'Line',...(u.id==='co'?{radios:['BN','CO','CO']}: {})}));
 let s=createMission(def,'rules-fixes-0');
 s=issue(s,{type:'DROP_LOAD',unit_id:'co',drop_items:[{type:'RADIO',key:'CO',quantity:1}]});
 const radio=s.assets.find(a=>a.source_unit==='co'&&a.net==='CO').id;
 s=companyImpulse(s);s=issue(s,{type:'PICKUP_RADIO',unit_id:'artyfo',issuer_id:'co',target_id:radio});
 s=issue(s,{type:'CALL_ARTILLERY_WP',unit_id:'artyfo',issuer_id:'co',target_id:'r2c1'});
 s=issue(s,{type:'MOVE',unit_id:'co',issuer_id:'co',target_id:'r1c2',arrival_cover:'open'});
 const before=structuredClone(s),r=submitCommand(s,{type:'SPOT',unit_id:'artyfo',issuer_id:'co',target_id:'r2c1'});
 expect(r.accepted).toBe(false);expect(r.state).toEqual(before);exact(def,s);
});
