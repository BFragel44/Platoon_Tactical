import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,advancePhase,resolveCombat,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {checkpoint,resumeCheckpoint} from '../src/ui/localRecovery.js';

const raw=(id,kind,location,steps,vof,extra={})=>({id,name:id,kind,location,steps,vof,range:3,platoon:null,experience:'Line',radios:[],...extra});
function scenario(mode){return {...structuredClone(companyAssault),id:`casualty_${mode}_replay`,contacts:[],...(mode==='ammo'?{rules:{specialEnemies:true,ammo:'tracked'}}:{}),assets:{carrier:{smoke:2}},units:[
 raw('co','HQ','r0c2',1,null,{radios:['BN','CO']}),
 raw('carrier',mode==='ammo'?'SQUAD':'FO','r1c1',mode==='ammo'?2:1,null,{radios:['CO','CO_PHONE'],ammo:{MG:3,RKT:1}}),
 raw('enemy','HMG','r2c1',1,'H',{faction:'enemy'}),
]};}
function review(s){
 for(let i=0;i<50;i++){
  const p=s.pending_combat?.find(r=>r.status==='PENDING'&&r.target_visible);
  const result=s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status!=='reviewing'&&p?resolveCombat(s,p.id):advancePhase(s);
  expect(result.state,result.reason).not.toBe(s);s=result.state;
  if(s.phase==='COMBAT_EFFECTS'&&s.segment_progress?.status==='reviewing')return s;
 }
 throw new Error('Combat review not reached');
}
for(const mode of ['equipment','ammo'])for(const corrected of [true,false])it(`${mode} consequence replays and recovers exactly (${corrected})`,()=>{
 const def=scenario(mode),s=review(createMission(def,`casualty-public-${mode==='ammo'?1:7}`,{},null,{casualty_equipment:corrected}));
 const changed=s.events.find(e=>e.type==='FORMATION_CHANGED'&&e.actor==='carrier');
 expect(changed.effect).toBe(mode==='ammo'?'LC':'PC');
 const survivors=changed.formations.map(id=>s.units[id]);
 if(mode==='ammo')expect(survivors.reduce((n,v)=>n+Object.values(v.ammo).reduce((a,b)=>a+b,0),0)).toBe(corrected?0:4);
 else{
  expect(survivors.reduce((n,v)=>n+v.radios.length,0)).toBe(corrected?2:0);
  expect(survivors.reduce((n,v)=>n+(v.assets.smoke??0),0)).toBe(corrected?2:0);
  expect(s.events.filter(e=>e.type==='RADIO_LOST'&&e.actor==='carrier')).toHaveLength(corrected?0:2);
 }
 expect(replayMission(def,exportReplay(s))).toEqual(s);
 expect(resumeCheckpoint(def,checkpoint(s)).state).toEqual(s);
});
