import {
  ContactResolutionStatus,
  EventType,
  MissionPhase,
  MissionStatus,
  SoldierCondition,
  TeamTacticalState,
} from "./constants.js";
import { createEvent } from "./events.js";
import { createFactionKnowledge } from "./records.js";
import { createRng } from "./rng.js";
import { validateScenario } from "./validateScenario.js";

function indexById(items, createItem) {
  return Object.fromEntries(items.map((item) => [item.id, createItem(item)]));
}

export function createMission(scenario, seed) {
  validateScenario(scenario);
  const rng = createRng(seed);
  const factionIds = scenario.factions.map((faction) => faction.id);

  const locationsById = indexById(scenario.locations, (location) => ({
    id: location.id,
    name: location.name,
    connected_location_ids: [...location.connected_location_ids],
    tactical_tags: [...(location.tactical_tags ?? [])],
    occupant_team_ids: scenario.teams
      .filter((team) => team.location_id === location.id)
      .map((team) => team.id),
    cover_features: [],
  }));

  const soldiersById = indexById(scenario.soldiers, (soldier) => ({
    id: soldier.id,
    name: soldier.name,
    faction_id: soldier.faction_id,
    team_id: soldier.team_id,
    role_tags: [...(soldier.role_tags ?? [])],
    capability_tags: [...(soldier.capability_tags ?? [])],
    weapon_category: soldier.weapon_category,
    condition: SoldierCondition.EFFECTIVE,
  }));

  const teamsById = indexById(scenario.teams, (team) => ({
    id: team.id,
    name: team.name,
    faction_id: team.faction_id,
    coarse_type: team.coarse_type,
    observation_experience: team.observation_experience,
    member_ids: [...team.member_ids],
    location_id: team.location_id,
    current_command_id: null,
    suppression: 0,
    tactical_state: TeamTacticalState.EFFECTIVE,
    occupied_cover_id: null,
    action_state: null,
  }));

  const contactsById = indexById(scenario.contacts, (contact) => ({
    id: contact.id,
    location_id: contact.location_id,
    trigger: structuredClone(contact.trigger),
    resolution_status: ContactResolutionStatus.UNRESOLVED,
    generation_profile_id: contact.generation_profile_id,
    generated_team_ids: [],
    resolved_turn: null,
    resolution_result: null,
  }));

  const generationProfilesById = indexById(
    scenario.contact_generation_profiles,
    (profile) => structuredClone(profile),
  );
  const enemyForcePackagesById = indexById(
    scenario.enemy_force_packages,
    (enemyPackage) => structuredClone(enemyPackage),
  );

  const knowledgeByFaction = Object.fromEntries(
    scenario.factions.map((faction) => [
      faction.id,
      createFactionKnowledge(faction.known_location_ids),
    ]),
  );
  knowledgeByFaction[scenario.player_faction_id].contact_knowledge_by_id = Object.fromEntries(
    scenario.contacts.map((contact) => [
      contact.id,
      {
        location_id: contact.location_id,
        status: ContactResolutionStatus.UNRESOLVED,
      },
    ]),
  );

  const missionStarted = createEvent({
    sequence: 1,
    type: EventType.MISSION_STARTED,
    turn: 1,
    phase: MissionPhase.COMMAND,
    actor: { type: "MISSION", id: `mission_${scenario.id}` },
    result: { status: MissionStatus.ACTIVE },
    metadata: { scenario_id: scenario.id },
    visibility: { faction_ids: factionIds },
  });

  return {
    id: `mission_${scenario.id}`,
    scenario_id: scenario.id,
    player_faction_id: scenario.player_faction_id,
    status: MissionStatus.ACTIVE,
    turn: 1,
    phase: MissionPhase.COMMAND,
    active_faction_id: scenario.player_faction_id,
    command_capacity_by_faction: Object.fromEntries(
      factionIds.map((id) => [id, id === scenario.player_faction_id ? 4 : 0]),
    ),
    rng,
    locations_by_id: locationsById,
    soldiers_by_id: soldiersById,
    teams_by_id: teamsById,
    contacts_by_id: contactsById,
    contact_generation_profiles_by_id: generationProfilesById,
    enemy_force_packages_by_id: enemyForcePackagesById,
    commands_by_id: {},
    command_queue_ids: [],
    fire_relationships_by_id: {},
    knowledge_by_faction: knowledgeByFaction,
    events: [missionStarted],
    next_event_sequence: 2,
    next_runtime_id: 1,
  };
}
