import {it,expect} from 'vitest';
import {mkdirSync,writeFileSync} from 'node:fs';
import {trevieres} from '../src/scenarios/trevieres.js';
import {newCompanyCampaign,saveCompanyPreparation,readCompanyPreparation,beginCompanyPreparation,prepareCompany} from '../src/sim/company/campaignPreparation.js';
import {commitCampaignMission,resumeCommittedCampaign,campaignProgress,NORMANDY_SEQUENCE} from '../src/sim/company/campaignProgression.js';
import {endTurn,preparePatrol} from '../src/sim/company/engine.js';

it('controlled seven-mission transaction fixture preserves company history, M3 terrain and independent support crews',()=>{
 const values=new Map([['platoon-company-recovery','infantry original'],['platoon-vire-recovery','vire original'],['platoon-tinchebray-recovery','tinchebray original']]);
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 let record=newCompanyCampaign(trevieres,'sequence-fixture');saveCompanyPreparation(storage,record);
 const companyId=record.roster.company_id,history=[];
 for(const [index,definition] of NORMANDY_SEQUENCE.entries()){
  // Opt-in, disposable browser inputs. Synthetic offensive completion remains
  // explicitly labelled; these do not represent successful tactical campaigns.
  if(process.env.CAMPAIGN_EXPORT_HANDOFFS==='1'){
   mkdirSync('output/connected-campaign/handoffs',{recursive:true});
   writeFileSync(`output/connected-campaign/handoffs/m${index+1}.json`,JSON.stringify({fixture:'Controlled transaction record; offensive outcomes synthetic',record},null,2));
  }
  const committed=commitCampaignMission(storage,record,`sequence-m${index+1}`,`sequence-${index+1}`);
  let state=committed.state;
  expect(state.scenario_id).toBe(definition.id);
  expect(state.roster_snapshot.company_id).toBe(companyId);
  expect(resumeCommittedCampaign(readCompanyPreparation(storage)).state).toEqual(state);
  expect(committed.record.history).toEqual(history);
  if(index===3){
   expect(state.battlefield_source.mission_instance_id).toBe('sequence-m3');
   const battlefield=record.history[2].battlefield;
   for(const source of battlefield.locations){const card=state.locations[source.id];expect(card.name).toBe(source.name);expect(card.covers).toEqual(source.covers);}
  }
  if(index>=5){
   const vehicles=Object.values(state.vire_runtime.vehicles).filter(v=>v.faction==='friendly');
   expect(vehicles.length).toBeGreaterThan(0);
   expect(vehicles.every(v=>v.crew.every(t=>t.id.startsWith(`sequence-m${index+1}_support_`)))).toBe(true);
  }
  if([2,4].includes(index)){
   // Real phase stepping and three patrol preparations, without a tactical
   // success claim: these stationary patrols are allowed to end in defeat.
   for(let platoon=1;platoon<=3;platoon++){
    for(let turn=0;state.status==='ACTIVE'&&turn<10;turn++)state=endTurn(state).state;
    if(platoon<3){
     const positions={},load=[0,0,0,0,0];
     for(const u of Object.values(state.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||u.removed==='RESERVE'))){
      const col=load.findIndex(n=>n+u.steps.length<=16);expect(col).toBeGreaterThanOrEqual(0);positions[u.id]=`r1c${col+1}`;load[col]+=u.steps.length;
     }
     const next=preparePatrol(state,{patrol:{...state.patrol.plan,platoon:platoon+1},positions});expect(next.accepted).not.toBe(false);state=next.state;
    }
   }
   expect(state.patrol_history).toHaveLength(3);
  }else{
   // Deliberately synthetic offensive completion: transaction coverage only.
   state.status='SUCCESS';
  }
  record=beginCompanyPreparation(committed.record,state);
  for(let step=0;step<3;step++)record=prepareCompany(record,{type:'NEXT'});
  saveCompanyPreparation(storage,record,committed.record.revision);record=readCompanyPreparation(storage);
  history.splice(0,history.length,...structuredClone(record.history));
  expect(record.history).toHaveLength(index+1);
 }
 expect(campaignProgress(record)).toMatchObject({completed:7,ended:true,destination:null});
 if(process.env.CAMPAIGN_EXPORT_HANDOFFS==='1')writeFileSync('output/connected-campaign/handoffs/mcomplete.json',JSON.stringify({fixture:'Controlled terminal transaction record; offensive outcomes synthetic',record},null,2));
 expect(()=>commitCampaignMission(storage,record,'eighth','seed')).toThrow(/complete/);
 expect(storage.getItem('platoon-company-recovery')).toBe('infantry original');
 expect(storage.getItem('platoon-vire-recovery')).toBe('vire original');
 expect(storage.getItem('platoon-tinchebray-recovery')).toBe('tinchebray original');
},120000);
