// Repeatable policy comparisons through the same public API used by the UI.
// These are diagnostics, not an assertion that one tactic must always win.
import { createMission, submitCommand, endTurn, getPlayerView, getAfterActionReport } from '../src/sim/index.js';
import { knownDefenderScenario, m0TestScenario } from '../src/scenarios/m0TestScenario.js';

export function playEncounter(scenario, seed, policy) {
  let state = createMission(scenario, seed);
  const commands = [];
  function order(type, teamId, locationId) {
    const option = getPlayerView(state, 'friendly').command_options_by_team[teamId][type];
    if (!option.available) return false;
    const input = { type, team_id: teamId, faction_id: 'friendly', target: locationId ? { location_id: locationId } : null };
    const result = submitCommand(state, input);
    if (!result.accepted) throw new Error(`Policy issued invalid ${type}: ${result.reason}`);
    commands.push({ turn: state.turn, ...input });
    state = result.state;
    return true;
  }
  while (state.status === 'ACTIVE') {
    for (const id of policy === 'support' ? ['team_alpha', 'team_bravo'] : ['team_alpha']) {
      const team = state.teams_by_id[id];
      if (team.suppression >= 30) order('RALLY', id);
      if (team.location_id === 'loc_orchard_edge') order('MOVE', id, 'loc_lane');
      else if (team.location_id === 'loc_lane') order('MOVE', id, policy === 'support' && id === 'team_bravo' ? 'loc_farmyard' : 'loc_crossroads');
      else if (['loc_crossroads', 'loc_farmyard'].includes(team.location_id)) {
        if (policy === 'recovery' && !team.occupied_cover_id) order('SEEK_COVER', id);
        if (policy === 'support' && id === 'team_alpha') {
          const targets = getPlayerView(state, 'friendly').command_options_by_team[id].DIRECT_FIRE.target_ids;
          if (targets.includes('loc_stone_house')) order('DIRECT_FIRE', id, 'loc_stone_house');
        } else if (policy !== 'recovery' || state.teams_by_id[id].occupied_cover_id) {
          const options = getPlayerView(state, 'friendly').command_options_by_team[id];
          if (options.ASSAULT.target_ids.includes('loc_stone_house')) order('ASSAULT', id, 'loc_stone_house');
          else if (options.MOVE.target_ids.includes('loc_stone_house')) order('MOVE', id, 'loc_stone_house');
        }
      }
    }
    state = endTurn(state).state;
  }
  const aar = getAfterActionReport(state);
  return { scenario: scenario.id, seed, policy, outcome: state.status, turns: state.turn,
    friendly_casualties: aar.friendly_casualties.length,
    friendly_pin_events: aar.events.filter(e => e.type === 'UNIT_PINNED' && e.actor?.id.startsWith('team_')).length,
    orders: commands.length };
}

for (const scenario of [knownDefenderScenario, m0TestScenario]) {
  for (const seed of ['spot-3', 'spot-1', 'spot-2', 'maneuver-4', 'maneuver-5']) {
    for (const policy of ['direct', 'support', 'recovery']) console.log(JSON.stringify(playEncounter(scenario, seed, policy)));
  }
}
