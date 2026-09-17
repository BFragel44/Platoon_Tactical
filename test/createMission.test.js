import { describe,it,expect } from 'vitest';
import { createMission,getPlayerView } from '../src/sim/index.js';
import { m0TestScenario,knownDefenderScenario } from '../src/scenarios/m0TestScenario.js';
describe('three-team mission',()=>{
  it('has twelve named soldiers and a separate attached platoon leader',()=>{
    const state=createMission(m0TestScenario,'roster');
    expect(Object.keys(state.teams_by_id)).toHaveLength(3);
    expect(Object.keys(state.soldiers_by_id)).toHaveLength(12);
    expect(state.leader.team_id).toBe('team_alpha');
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
  it('creates deterministic state without changing authored data',()=>{
    const before=structuredClone(m0TestScenario);
    expect(createMission(m0TestScenario,'same')).toEqual(createMission(m0TestScenario,'same'));
    expect(m0TestScenario).toEqual(before);
    expect(globalThis.document).toBeUndefined();
  });
  it('offers known and uncertain configurations without leaking generated truth',()=>{
    const known=getPlayerView(createMission(knownDefenderScenario,'a'),'friendly');
    const unknown=getPlayerView(createMission(m0TestScenario,'a'),'friendly');
    expect(known.spotted_enemies).toHaveLength(1);
    expect(unknown.spotted_enemies).toHaveLength(0);
    expect(unknown.potential_contacts[0].status).toBe('UNRESOLVED');
  });
  it.each(['movement','fire','leader','objective','placement'])('rejects invalid %s references',kind=>{
    const scenario=structuredClone(m0TestScenario);
    if(kind==='movement')scenario.locations[0].connected_location_ids.push('missing');
    if(kind==='fire')scenario.locations[0].fire_location_ids.push('missing');
    if(kind==='leader')scenario.leader.team_id='missing';
    if(kind==='objective')scenario.objective.location_id='missing';
    if(kind==='placement')scenario.contacts[0].placement_location_ids=['loc_orchard_edge'];
    expect(()=>createMission(scenario,'bad')).toThrow('Invalid scenario');
  });
});
