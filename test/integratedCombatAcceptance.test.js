import {it,expect} from 'vitest';
import {createMission,advancePhase,resolveCombat,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';
import {hasFire} from '../src/sim/company/battlefield.js';

const raw=(id,kind,location,steps,vof,extra={})=>({id,name:id,kind,location,steps,vof,range:3,platoon:null,experience:'Line',faction:'friendly',radios:[],...extra});
const definition={...structuredClone(companyAssault),id:'integrated_combat_acceptance',contacts:[],rules:{specialEnemies:true,ammo:'tracked'},support_agencies:structuredClone(trevieres.support_agencies),units:[
 raw('co','HQ','r1c2',1,null,{radios:['BN','CO']}),
 raw('artyfo','FO','r1c2',1,null,{radios:['ARTY'],agency_role:'artillery_observer'}),
 raw('recipient','SQUAD','r2c2',3,null),
 raw('enemy','HMG','r3c2',1,'H',{faction:'enemy',ammo:{MG:8}}),
]};
it('integrates support, HIT, Rally, retreat, recovery, frozen combat and Cleanup with exact recovery',()=>{
 let s=createMission(definition,'integration-10'),called=false,rallied=false,moved=false,completed=false;
 const boundaries=new Set();let activeSupportId;
 function exact(label){expect(replayMission(definition,exportReplay(s)),label).toEqual(s);expect(resumeCheckpoint(definition,checkpoint(s)).state,label).toEqual(s);boundaries.add(label);}
 for(let i=0;i<120&&s.status==='ACTIVE'&&s.turn<3;i++){
  if(s.turn===1&&s.impulse?.hq==='co'&&!called){
   const stock=s.support_inventory.artillery.WP,result=submitCommand(s,{type:'CALL_ARTILLERY_WP',issuer_id:'co',unit_id:'artyfo',target_id:'r2c2'});
   expect(result.accepted,result.reason).toBe(true);s=result.state;called=true;
   expect(s.support).toHaveLength(1);expect(s.support[0].status).toBe('PENDING');activeSupportId=s.support[0].id;
   expect(s.support_inventory.artillery.WP).toBe(stock-1);exact('support-pending');
  }
  if(s.turn===2&&s.impulse?.hq==='general'&&!rallied){
   expect(s.support.some(f=>f.id===activeSupportId&&f.status==='ACTIVE')).toBe(true);
   const u=Object.values(s.units).find(u=>u.faction==='friendly'&&u.kind==='LAT'&&u.cohesion==='P'&&u.pinned);expect(u).toBeTruthy();
   const result=submitCommand(s,{type:'RALLY',unit_id:u.id});expect(result.accepted,result.reason).toBe(true);s=result.state;
   expect(s.units[u.id].pinned).toBe(false);rallied=true;exact('rally-before-retreat');
  }
  moved ||= s.events.some(e=>e.type==='UNIT_MOVED'&&e.turn===2&&e.from==='r2c2');
  if(s.phase==='AT_COMBAT'&&moved){expect(s.events.findLast(e=>e.type==='UNIT_MOVED')).toMatchObject({exposed:true});exact('after-retreat');}
  if(s.phase==='CONTACTS'&&s.turn===1){expect(s.support[0].status).toBe('ACTIVE');exact('support-active');}
  if(s.phase==='CONTACTS'&&s.turn===2){expect(s.support.some(f=>f.id===activeSupportId)).toBe(false);exact('support-expired');}
  if(s.phase==='PINNED_RECOVERY')exact(`before-pinned-recovery-${s.turn}`);
  if(s.phase==='CLEANUP'){exact(`before-cleanup-${s.turn}`);if(s.turn===2){s=advancePhase(s).state;completed=true;exact('after-cleanup-2');break;}}
  const pending=s.pending_combat?.find(r=>r.status==='PENDING'&&r.target_visible);
  if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status!=='reviewing'&&pending){
   const other=s.pending_combat.filter(r=>r.id!==pending.id).map(r=>structuredClone(r)),fire=structuredClone(s.fire);
   const result=resolveCombat(s,pending.id);expect(result.accepted,result.reason).toBe(true);s=result.state;
   expect(s.pending_combat.filter(r=>r.id!==pending.id)).toEqual(other);expect(s.fire).toEqual(fire);
   exact(`combat-${s.turn}-${pending.id}`);
  }else{
   const recovery=s.phase==='PINNED_RECOVERY'?Object.values(s.units).filter(u=>u.steps.length&&!u.removed&&u.pinned).map(u=>({id:u.id,underFire:hasFire(s,u.location)})):null;
   const result=advancePhase(s);expect(result.state,result.reason).not.toBe(s);s=result.state;
   if(recovery)for(const u of recovery)expect(s.units[u.id].pinned).toBe(u.underFire);
  }
 }
 expect(called&&rallied&&moved&&completed).toBe(true);
 expect(boundaries.has('support-active')&&boundaries.has('support-expired')&&boundaries.has('after-retreat')).toBe(true);
 expect(boundaries.has('before-pinned-recovery-1')&&boundaries.has('before-pinned-recovery-2')).toBe(true);
 expect(s.turn).toBe(3);expect(s.phase).toBe('FRIENDLY_EVENTS');expect(s.pending_combat).toEqual([]);
 expect(Object.values(s.units).some(u=>u.exposed)).toBe(false);
});
