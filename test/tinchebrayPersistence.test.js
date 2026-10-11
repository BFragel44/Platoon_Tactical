import {it,expect} from 'vitest';
import {createTinchebrayDevelopmentMission,createTinchebrayMissionRoster} from '../src/sim/company/tinchebrayMission.js';
import {createVireDevelopmentMission} from '../src/sim/company/vireMission.js';
import {exportReplay} from '../src/sim/company/engine.js';
import {saveCampaign,debriefAndSave,readCampaign} from '../src/sim/company/campaignRoster.js';
import {saveTinchebrayRecovery,resumeTinchebrayCheckpoint} from '../src/ui/tinchebrayRecovery.js';
import {tinchebray} from '../src/scenarios/tinchebray.js';
const store=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
it('rejects M6 checkpoint import into M7 recovery',()=>{
 expect(()=>resumeTinchebrayCheckpoint({replay:exportReplay(createVireDevelopmentMission('separate'))})).toThrow(/Tinchebray/);
});
it('rejects active/stale debrief and preserves the roster when the terminal write fails',()=>{
 const storage=store(),key=tinchebray.rules.rosterKey,roster=createTinchebrayMissionRoster();saveCampaign(storage,roster,key);
 const s=createTinchebrayDevelopmentMission('persistence',{}, {},{mission_instance_id:'persistence'});
 expect(()=>debriefAndSave(storage,s,key)).toThrow(/terminal/);s.status='SUCCESS';
 const old=storage.data.get(key),write=storage.setItem;storage.setItem=(k,v)=>{if(k===key)throw Error('quota fixture');write(k,v);};
 expect(()=>debriefAndSave(storage,s,key)).toThrow(/quota/);expect(storage.data.get(key)).toBe(old);
 storage.setItem=write;const next=debriefAndSave(storage,s,key);expect(readCampaign(storage,key).record).toEqual(next);
 const stale=createTinchebrayDevelopmentMission('stale',{}, {},{mission_instance_id:'stale'});stale.status='SUCCESS';expect(()=>debriefAndSave(storage,stale,key)).toThrow(/revision/);
 const redeployed=createTinchebrayDevelopmentMission('redeploy',{}, {},{roster:next,mission_instance_id:'redeploy'});
 expect(redeployed.vire_runtime.vehicles.m10_hq.crew.map(c=>c.id)).toEqual(s.vire_runtime.vehicles.m10_hq.crew.map(c=>c.id));
 const snap=JSON.stringify(redeployed.roster_snapshot);next.steps.m10_hq_step1.experience='Veteran';expect(JSON.stringify(redeployed.roster_snapshot)).toBe(snap);
});
it('surfaces tactical storage failure without modifying another mission slot',()=>{
 const storage=store();storage.data.set('platoon-vire-integration','M6');storage.setItem=()=>{throw Error('quota fixture');};
 expect(()=>saveTinchebrayRecovery(storage,createTinchebrayDevelopmentMission('quota'))).toThrow(/quota/);expect(storage.data.get('platoon-vire-integration')).toBe('M6');
});
