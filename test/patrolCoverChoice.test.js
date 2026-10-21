import {it,expect} from 'vitest';
import {createMission,preparePatrol,endTurn,exportReplay,replayMission,previewMissionSetup} from '../src/sim/company/engine.js';
import {setupMarkup} from '../src/ui/missionSetup.js';
import {stGeorges} from '../src/scenarios/stGeorges.js';
import {stGermain} from '../src/scenarios/stGermain.js';
const positions=(units,platoon)=>Object.fromEntries(Object.values(units).filter(u=>u.faction==='friendly'&&u.steps.length).map(u=>[u.id,u.id==='co'||u.platoon===platoon?'r1c2':'RESERVE']));
for(const definition of [stGeorges,stGermain]){
 it(`${definition.id}: honors initial Open and explicit foxholes, retaining historical defaults`,()=>{
  const initial=createMission(definition,'initial-cover-choice'),setup={positions:positions(initial.units,1)};
  const legacy=createMission(definition,'initial-cover-choice',setup);expect(legacy.units.co.cover).toBe('fox_r1c2_0');expect(replayMission(definition,exportReplay(legacy))).toEqual(legacy);
  for(const choice of [null,'fox_r1c2_1']){
   const s=createMission(definition,'initial-cover-choice',{...setup,covers:{co:choice}});
   expect(s.units.co.cover).toBe(choice);expect(replayMission(definition,exportReplay(s))).toEqual(s);
  }
 });
 it(`${definition.id}: preserves Open through patrols two and three and exact replay`,()=>{
  const initial=createMission(definition,'next-cover-choice');let s=createMission(definition,'next-cover-choice',{positions:positions(initial.units,1),covers:{co:null}});
  for(const platoon of [2,3]){
   for(let i=0;i<12&&s.status==='ACTIVE';i++)s=endTurn(s).state;
   expect(s.status).toBe('PATROL_COMPLETE');
   const choices={patrol:{...s.patrol.plan,platoon},positions:positions(s.units,platoon),covers:{co:null}},before=structuredClone(s);
   const next=preparePatrol(s,choices).state;expect(s).toEqual(before);expect(next.units.co.cover).toBeNull();expect(next.units.co.location).toBe('r1c2');
   expect(replayMission(definition,exportReplay(next))).toEqual(next);s=next;
  }
 });
 it(`${definition.id}: rejects cover on another card and keeps explicit cover on the chosen card`,()=>{
  const initial=createMission(definition,'invalid-cover'),setup={positions:positions(initial.units,1)};
  expect(()=>createMission(definition,'invalid-cover',{...setup,covers:{co:'fox_r1c1_0'}})).toThrow('Choose discovered cover');
  const preview=previewMissionSetup(definition,'invalid-cover',{...setup,covers:{co:null}});
  expect(preview.units.find(u=>u.id==='co').cover).toBeNull();expect(setupMarkup(preview,true)).toContain('name="cover-co"');
 });
}
