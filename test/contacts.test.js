import { describe,it,expect } from 'vitest';
import { createMission,endTurn,getVisibleEvents,getPlayerView } from '../src/sim/index.js';
import { m0TestScenario } from '../src/scenarios/m0TestScenario.js';
import { order,uncertain,relocate } from './missionFlow.js';
import { resolvePendingContacts } from '../src/sim/contacts.js';
import { evaluateAutomaticFire } from '../src/sim/fire.js';
import { revealTeam } from '../src/sim/spotting.js';
describe('uncertain contact and visibility',()=>{
  function forced(){
    const scenario=structuredClone(m0TestScenario);
    scenario.contact_generation_profiles[0].results=[{result:'AUTOMATIC_WEAPONS_TEAM',package_id:'AUTOMATIC_WEAPONS_TEAM',weight:1}];
    const state=createMission(scenario,'hidden');
    relocate(state,'team_alpha','loc_crossroads');
    state.pending_observations=[{team_id:'team_alpha',location_id:'loc_crossroads',caused_by_event_id:null}];
    resolvePendingContacts(state);return state;
  }
  it('places an enemy overlooking the triggering approach, not on the entering team',()=>{
    const state=forced();const enemy=Object.values(state.teams_by_id).find(t=>t.faction_id==='enemy');
    expect(enemy.location_id).toBe('loc_stone_house');
    expect(state.teams_by_id.team_alpha.location_id).toBe('loc_crossroads');
    expect(state.pending_observations).toEqual([]);
  });
  it('reports hidden incoming fire without identity, soldiers or hidden causal references',()=>{
    const state=forced();evaluateAutomaticFire(state);
    const enemy=Object.values(state.teams_by_id).find(t=>t.faction_id==='enemy');
    const view=getPlayerView(state,'friendly');const events=getVisibleEvents(state,'friendly');
    expect(view.suspected_locations).toContain('loc_stone_house');
    expect(view.fire_relationships.some(r=>r.source_team_id===null)).toBe(true);
    expect(JSON.stringify({view,events})).not.toContain(enemy.id);
    const ids=new Set(events.map(e=>e.id));
    expect(events.every(e=>!e.caused_by_event_id||ids.has(e.caused_by_event_id))).toBe(true);
    revealTeam(state,enemy);
    expect(getVisibleEvents(state,'friendly').some(e=>e.type==='ENEMY_GENERATED')).toBe(false);
  });
  it('allows directing fire toward a suspected source without identifying its composition',()=>{
    const state=forced();evaluateAutomaticFire(state);
    const result=order(state,'DIRECT_FIRE','team_alpha','loc_stone_house');
    expect(result.accepted).toBe(true);
    expect(result.state.teams_by_id.team_alpha.fire_target_location_id).toBe('loc_stone_house');
  });
  it('halts normal movement when an unspotted enemy is discovered at the destination',()=>{
    const state=forced();relocate(state,'team_alpha','loc_farmyard');
    const result=order(state,'MOVE','team_alpha','loc_stone_house');
    expect(result.accepted).toBe(true);
    expect(result.state.teams_by_id.team_alpha.location_id).toBe('loc_farmyard');
    expect(result.events.some(e=>e.type==='MOVEMENT_HALTED')).toBe(true);
    expect(getPlayerView(result.state,'friendly').spotted_enemies).toHaveLength(1);
  });
  it('resolves a no-contact route and permits objective completion',()=>{
    const scenario=structuredClone(m0TestScenario);
    scenario.contact_generation_profiles[0].results=[{result:'NO_CONTACT',package_id:null,weight:1}];
    let state=createMission(scenario,'clear');
    for(const loc of ['loc_lane','loc_farmyard','loc_stone_house']){
      state=order(state,'MOVE','team_alpha',loc).state;state=endTurn(state).state;
    }
    expect(Object.values(state.teams_by_id)).toHaveLength(3);
    expect(state.objective.held_since_turn).toBe(3);
    state=endTurn(state).state;expect(state.status).toBe('SUCCESS');
  });
});
