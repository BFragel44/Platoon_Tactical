import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,submitCommand,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

const raw=(id,kind,location,steps,vof,extra={})=>({id,name:id,kind,location,steps,vof,range:3,platoon:null,experience:'Line',faction:'friendly',radios:[],...extra});
const definition={...structuredClone(companyAssault),id:'automatic_retreat_replay',contacts:[],rules:{specialEnemies:true},units:[
 raw('co','HQ','r0c2',1,null,{radios:['BN','CO']}),
 raw('recipient','SQUAD','r2c2',3,null),
 raw('enemy','HMG','r3c2',1,'H',{faction:'enemy'}),
]};
for(const updated of [true,false])it(`legal combat-created Paralyzed Team, Rally and automatic retreat replay exactly (${updated})`,()=>{
 let s=createMission(definition,'retreat-public-3',{},null,{automatic_retreat:updated}),rallied=false;
 for(let i=0;i<110;i++){
  if(s.turn===2&&s.impulse?.hq==='general'&&!rallied){
   expect(s.units.lat_1).toMatchObject({faction:'friendly',cohesion:'P',pinned:true});
   const result=submitCommand(s,{type:'RALLY',unit_id:'lat_1'});expect(result.accepted,result.reason).toBe(true);s=result.state;
   expect(s.units.lat_1.pinned).toBe(false);rallied=true;
  }
  if(rallied&&s.phase==='AT_COMBAT')break;
  const pending=s.pending_combat?.find(r=>r.status==='PENDING'&&r.target_visible);
  const result=s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status!=='reviewing'&&pending?resolveCombat(s,pending.id):advancePhase(s);
  expect(result.state,result.reason).not.toBe(s);s=result.state;
 }
 expect(rallied).toBe(true);expect(s.turn).toBe(2);expect(s.phase).toBe('AT_COMBAT');
 expect(s.units.lat_1.exposed).toBe(updated);
 expect(s.locations[s.units.lat_1.location].row).toBe(updated?1:2);
 expect(s.events.filter(e=>e.type==='UNIT_MOVED'&&e.actor==='lat_1')).toHaveLength(updated?1:0);
 expect(replayMission(definition,exportReplay(s))).toEqual(s);
 expect(resumeCheckpoint(definition,checkpoint(s)).state).toEqual(s);
});
