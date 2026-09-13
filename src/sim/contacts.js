import {
  ContactResolutionStatus,
  EventType,
  MissionPhase,
  SoldierCondition,
  TeamTacticalState,
} from "./constants.js";
import { createEvent } from "./events.js";
import { drawRandom } from "./rng.js";

function nextRuntimeId(state, prefix) {
  const id = `${prefix}_${String(state.next_runtime_id).padStart(6, "0")}`;
  state.next_runtime_id += 1;
  return id;
}

function emit(state, eventInput) {
  const event = createEvent({
    ...eventInput,
    sequence: state.next_event_sequence,
    turn: state.turn,
    phase: MissionPhase.ACTION,
  });
  state.events.push(event);
  state.next_event_sequence += 1;
  return event;
}

function selectResult(state, profile) {
  const draw = drawRandom(state.rng);
  state.rng = draw.rng;
  const totalWeight = profile.results.reduce((total, result) => total + result.weight, 0);
  const selection = draw.value * totalWeight;
  let cumulativeWeight = 0;

  for (const result of profile.results) {
    cumulativeWeight += result.weight;
    if (selection < cumulativeWeight) {
      return result;
    }
  }

  return profile.results.at(-1);
}

function instantiateEnemyPackage(state, enemyPackage, locationId) {
  const teamId = nextRuntimeId(state, "team");
  const soldierIds = enemyPackage.soldiers.map(() => nextRuntimeId(state, "soldier"));

  enemyPackage.soldiers.forEach((template, index) => {
    const soldierId = soldierIds[index];
    state.soldiers_by_id[soldierId] = {
      id: soldierId,
      name: template.name,
      faction_id: enemyPackage.faction_id,
      team_id: teamId,
      role_tags: [...(template.role_tags ?? [])],
      capability_tags: [...(template.capability_tags ?? [])],
      weapon_category: template.weapon_category,
      condition: SoldierCondition.EFFECTIVE,
    };
  });

  state.teams_by_id[teamId] = {
    id: teamId,
    name: enemyPackage.name,
    faction_id: enemyPackage.faction_id,
    coarse_type: enemyPackage.id,
    observation_experience: enemyPackage.observation_experience,
    member_ids: soldierIds,
    location_id: locationId,
    current_command_id: null,
    suppression: 0,
    tactical_state: TeamTacticalState.EFFECTIVE,
    occupied_cover_id: null,
    action_state: null,
  };
  state.locations_by_id[locationId].occupant_team_ids.push(teamId);

  return { teamId, soldierIds };
}

function resolveContact(state, contact, enteringTeam, causedByEventId) {
  const triggeredEvent = emit(state, {
    type: EventType.CONTACT_TRIGGERED,
    locationId: contact.location_id,
    actor: { type: "TEAM", id: enteringTeam.id },
    target: { type: "CONTACT", id: contact.id },
    cause: { type: "LOCATION_ENTERED", caused_by_event_id: causedByEventId },
    result: { resolution_status: ContactResolutionStatus.RESOLVED },
    causedByEventId,
    visibility: { faction_ids: [enteringTeam.faction_id] },
  });

  const profile = state.contact_generation_profiles_by_id[contact.generation_profile_id];
  const selected = selectResult(state, profile);
  contact.resolution_status = ContactResolutionStatus.RESOLVED;
  contact.resolved_turn = state.turn;
  contact.resolution_result = selected.result;
  state.knowledge_by_faction[enteringTeam.faction_id].contact_knowledge_by_id[
    contact.id
  ].status = ContactResolutionStatus.RESOLVED;

  const resolvedEvent = emit(state, {
    type: EventType.CONTACT_RESOLVED,
    locationId: contact.location_id,
    actor: { type: "MISSION", id: state.id },
    target: { type: "CONTACT", id: contact.id },
    result: { generation_result: selected.result },
    causedByEventId: triggeredEvent.id,
    visibility: { faction_ids: [], simulation_only: true },
  });

  const events = [triggeredEvent, resolvedEvent];
  if (selected.result === "NO_CONTACT") {
    return events;
  }

  const enemyPackage = state.enemy_force_packages_by_id[selected.package_id];
  const generated = instantiateEnemyPackage(state, enemyPackage, contact.location_id);
  contact.generated_team_ids.push(generated.teamId);

  events.push(
    emit(state, {
      type: EventType.ENEMY_GENERATED,
      locationId: contact.location_id,
      actor: { type: "MISSION", id: state.id },
      target: { type: "TEAM", id: generated.teamId },
      result: {
        package_id: enemyPackage.id,
        team_id: generated.teamId,
        soldier_ids: generated.soldierIds,
      },
      causedByEventId: resolvedEvent.id,
      visibility: { faction_ids: [], simulation_only: true },
    }),
  );

  return events;
}

export function resolveContactsOnEntry(state, teamId, locationId, causedByEventId) {
  const team = state.teams_by_id[teamId];
  if (team.faction_id !== state.player_faction_id) {
    return [];
  }

  const contacts = Object.values(state.contacts_by_id)
    .filter(
      (contact) =>
        contact.location_id === locationId &&
        contact.resolution_status === ContactResolutionStatus.UNRESOLVED,
    )
    .sort((left, right) => left.id.localeCompare(right.id));

  return contacts.flatMap((contact) =>
    resolveContact(state, contact, team, causedByEventId),
  );
}
