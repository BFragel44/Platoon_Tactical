import { createFactionKnowledge } from './records.js';
import { createRng } from './rng.js';
import { validateScenario } from './validateScenario.js';
import { emit, refreshCommands } from './rules.js';
import { generateEnemy } from './contacts.js';
import { revealTeam } from './spotting.js';

export function createMission(scenario, seed) {
  validateScenario(scenario);
  const index = items => Object.fromEntries(items.map(item => [item.id, structuredClone(item)]));
  const state = {
    id: 'mission_' + scenario.id, scenario_id: scenario.id, scenario_version: 2,
    player_faction_id: scenario.player_faction_id, active_faction_id: scenario.player_faction_id,
    status: 'ACTIVE', turn: 1, phase: 'COMMAND', rng: createRng(seed),
    briefing: scenario.briefing, leader: structuredClone(scenario.leader),
    objective: { ...structuredClone(scenario.objective), held_since_turn: null, secured: false },
    command_capacity_by_faction: Object.fromEntries(scenario.factions.map(f => [f.id, 0])),
    command_allowance: 0, command_reserve: 0,
    locations_by_id: index(scenario.locations), soldiers_by_id: index(scenario.soldiers),
    teams_by_id: index(scenario.teams), contacts_by_id: index(scenario.contacts),
    contact_generation_profiles_by_id: index(scenario.contact_generation_profiles),
    enemy_force_packages_by_id: index(scenario.enemy_force_packages),
    knowledge_by_faction: Object.fromEntries(scenario.factions.map(f => [f.id, createFactionKnowledge(f.known_location_ids)])),
    commands_by_id: {}, pending_observations: [], fire_relationships_by_id: {},
    events: [], next_event_sequence: 1, next_runtime_id: 1, observation_attempts: [],
  };
  for (const location of Object.values(state.locations_by_id)) {
    location.occupant_team_ids = scenario.teams.filter(t => t.location_id === location.id).map(t => t.id);
    location.cover_features = [];
  }
  for (const soldier of Object.values(state.soldiers_by_id)) soldier.condition = 'EFFECTIVE';
  for (const team of Object.values(state.teams_by_id)) Object.assign(team, {
    suppression: 0, tactical_state: 'EFFECTIVE', occupied_cover_id: null,
    actions_used: [], exposed: false, fire_target_location_id: null, directed_turn: null, withdrawn: false,
  });
  const knowledge = state.knowledge_by_faction[state.player_faction_id];
  for (const contact of Object.values(state.contacts_by_id)) {
    Object.assign(contact, { resolution_status: 'UNRESOLVED', generated_team_ids: [], resolved_turn: null });
    knowledge.contact_knowledge_by_id[contact.id] = { location_id: contact.location_id,
      trigger_location_ids: [...contact.trigger_location_ids], status: 'UNRESOLVED' };
  }
  emit(state, 'MISSION_STARTED', { result: { status: 'ACTIVE' }, text: state.briefing });
  if (scenario.known_defender) {
    const contact = Object.values(state.contacts_by_id)[0];
    const enemy = generateEnemy(state, contact, 'AUTOMATIC_WEAPONS_TEAM');
    contact.resolution_status = 'RESOLVED'; contact.resolved_turn = 0;
    knowledge.contact_knowledge_by_id[contact.id].status = 'RESOLVED';
    revealTeam(state, enemy);
  }
  refreshCommands(state);
  return state;
}
