import {afterEach,describe,expect,it,vi} from 'vitest';
afterEach(()=>{vi.unstubAllGlobals();vi.resetModules();});
describe('M5 explicit development release',()=>{
 for(const [search,available] of [['',false],['?stGermainDev=0',false],['?stGermainDev=1',true]])it(`${search||'normal selection'}: development gate`,async()=>{
  vi.resetModules();vi.stubGlobal('location',{search});
  const {missionCatalog,playableMissionById}=await import('../src/scenarios/missions.js');
  expect(missionCatalog.some(m=>m.id==='normandy_5')).toBe(available);
  if(available){expect(playableMissionById('normandy_5').readiness.playable).toBe(true);expect(missionCatalog.find(m=>m.id==='normandy_5').name).toContain('development playtest');}
  else expect(()=>playableMissionById('normandy_5')).toThrow('Unknown mission');
  for(const id of ['company_assault','normandy_1','normandy_2','normandy_3','normandy_4'])expect(missionCatalog.some(m=>m.id===id)).toBe(true);
 });
});
