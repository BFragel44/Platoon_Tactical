import { describe,it,expect } from 'vitest';
import { recoverSuppression } from '../src/sim/suppression.js';
import { evaluateAutomaticFire } from '../src/sim/fire.js';
import { setSuppression } from '../src/sim/rules.js';
import { endTurn } from '../src/sim/index.js';
import { training,relocate,order } from './missionFlow.js';
describe('recovery and cover',()=>{
  it('an isolated pinned team recovers to effective without commands',()=>{
    const state=training();const team=state.teams_by_id.team_alpha;setSuppression(state,team,90);
    recoverSuppression(state);recoverSuppression(state);recoverSuppression(state);
    expect(team.tactical_state).toBe('EFFECTIVE');
  });
  it('both pinned sources lose pressure, permitting recovery from mutual pinning',()=>{
    const state=training();relocate(state,'team_alpha','loc_crossroads');evaluateAutomaticFire(state);
    const enemy=Object.values(state.teams_by_id).find(t=>t.faction_id==='enemy');
    setSuppression(state,state.teams_by_id.team_alpha,90);setSuppression(state,enemy,90);
    recoverSuppression(state);
    expect(state.teams_by_id.team_alpha.suppression).toBe(65);expect(enemy.suppression).toBe(65);
  });
  it('cover persists and another friendly team can occupy it without another discovery roll',()=>{
    const state=training();state.locations_by_id.loc_orchard_edge.cover_chance=1;
    const first=order(state,'SEEK_COVER').state;
    const before=first.rng.draw_count;
    const second=order(first,'SEEK_COVER','team_bravo').state;
    expect(second.teams_by_id.team_alpha.occupied_cover_id).toBe(second.teams_by_id.team_bravo.occupied_cover_id);
    expect(second.rng.draw_count).toBe(before);
    expect(second.locations_by_id.loc_orchard_edge.cover_features).toHaveLength(1);
  });
  it('failed cover search spends the command, preserves terrain and cannot be spammed',()=>{
    const state=training();state.locations_by_id.loc_orchard_edge.cover_chance=0;
    const result=order(state,'SEEK_COVER');expect(result.accepted).toBe(true);
    expect(result.state.locations_by_id.loc_orchard_edge.protection).toBe(2);
    expect(result.state.command_capacity_by_faction.friendly).toBe(state.command_capacity_by_faction.friendly-1);
    expect(order(result.state,'SEEK_COVER').reason).toBe('ACTION_LIMIT_REACHED');
  });
  it('movement exposure expires at cleanup',()=>{
    let state=order(training(),'MOVE','team_alpha','loc_lane').state;
    expect(state.teams_by_id.team_alpha.exposed).toBe(true);
    state=endTurn(state).state;expect(state.teams_by_id.team_alpha.exposed).toBe(false);
  });
});
