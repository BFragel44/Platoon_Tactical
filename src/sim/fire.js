import {
  EventType,
  FireCategory,
  FireCeaseReason,
  FireRelationshipStatus,
  MissionStatus,
  SoldierCondition,
  SpottingStatus,
} from "./constants.js";
import { createEvent } from "./events.js";
import { createFireRelationshipRecord } from "./records.js";

function nextRuntimeId(state) {
  const id = `fire_${String(state.next_runtime_id).padStart(6, "0")}`;
  state.next_runtime_id += 1;
  return id;
}

function emit(state, eventInput) {
  const event = createEvent({
    ...eventInput,
    sequence: state.next_event_sequence,
    turn: state.turn,
    phase: state.phase,
  });
  state.events.push(event);
  state.next_event_sequence += 1;
  return event;
}

function factionHasSpotted(state, factionId, teamId) {
  return (
    state.knowledge_by_faction[factionId]?.known_enemy_teams_by_id[teamId]?.status ===
    SpottingStatus.SPOTTED
  );
}

function teamCanAct(state, team) {
  return team.member_ids.some(
    (soldierId) => state.soldiers_by_id[soldierId]?.condition === SoldierCondition.EFFECTIVE,
  );
}

function locationsAllowDirectFire(state, sourceLocationId, targetLocationId) {
  return (
    sourceLocationId === targetLocationId ||
    state.locations_by_id[sourceLocationId].connected_location_ids.includes(targetLocationId)
  );
}

function visibleFactions(state, sourceTeam, targetTeam) {
  return Object.keys(state.knowledge_by_faction).filter(
    (factionId) =>
      (sourceTeam.faction_id === factionId || factionHasSpotted(state, factionId, sourceTeam.id)) &&
      (targetTeam.faction_id === factionId || factionHasSpotted(state, factionId, targetTeam.id)),
  );
}

function invalidReason(state, relationship) {
  if (state.status !== MissionStatus.ACTIVE) return FireCeaseReason.MISSION_INACTIVE;

  const source = state.teams_by_id[relationship.source_team_id];
  if (!source) return FireCeaseReason.SOURCE_MISSING;
  if (!teamCanAct(state, source)) return FireCeaseReason.SOURCE_INCAPABLE;

  const target = state.teams_by_id[relationship.target_team_id];
  if (!target) return FireCeaseReason.TARGET_MISSING;
  if (!factionHasSpotted(state, source.faction_id, target.id)) {
    return FireCeaseReason.TARGET_UNSPOTTED;
  }
  if (!locationsAllowDirectFire(state, source.location_id, target.location_id)) {
    return FireCeaseReason.OUT_OF_RANGE;
  }

  return null;
}

function ceaseInvalidRelationships(state) {
  const events = [];
  const relationships = Object.values(state.fire_relationships_by_id)
    .filter((relationship) => relationship.status === FireRelationshipStatus.ACTIVE)
    .sort((left, right) => left.id.localeCompare(right.id));

  for (const relationship of relationships) {
    const reason = invalidReason(state, relationship);
    if (!reason) {
      const source = state.teams_by_id[relationship.source_team_id];
      const target = state.teams_by_id[relationship.target_team_id];
      relationship.source_location_id = source.location_id;
      relationship.target_location_id = target.location_id;
      continue;
    }

    const source = state.teams_by_id[relationship.source_team_id];
    const target = state.teams_by_id[relationship.target_team_id];
    relationship.status = FireRelationshipStatus.CEASED;
    events.push(
      emit(state, {
        type: EventType.FIRE_CEASED,
        locationId: source?.location_id ?? relationship.source_location_id,
        actor: { type: "TEAM", id: relationship.source_team_id },
        target: { type: "TEAM", id: relationship.target_team_id },
        result: { fire_relationship_id: relationship.id, reason },
        metadata: {
          source_location_id: source?.location_id ?? relationship.source_location_id,
          target_location_id: target?.location_id ?? relationship.target_location_id,
        },
        visibility:
          source && target
            ? { faction_ids: visibleFactions(state, source, target) }
            : { faction_ids: [], simulation_only: true },
      }),
    );
  }

  return events;
}

function eligibleTargets(state, source) {
  return Object.values(state.teams_by_id)
    .filter(
      (target) =>
        target.faction_id !== source.faction_id &&
        factionHasSpotted(state, source.faction_id, target.id) &&
        locationsAllowDirectFire(state, source.location_id, target.location_id),
    )
    .sort((left, right) => {
      const leftSameLocation = left.location_id === source.location_id ? 0 : 1;
      const rightSameLocation = right.location_id === source.location_id ? 0 : 1;
      return leftSameLocation - rightSameLocation || left.id.localeCompare(right.id);
    });
}

function latestSpottingEventId(state, sourceTeamId, targetTeamId) {
  return state.events.findLast(
    (event) =>
      event.type === EventType.UNIT_SPOTTED &&
      event.actor?.id === sourceTeamId &&
      event.target?.id === targetTeamId,
  )?.id;
}

function openEligibleRelationships(state) {
  const events = [];
  const sources = Object.values(state.teams_by_id).sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  for (const source of sources) {
    if (!teamCanAct(state, source)) continue;

    const hasActiveRelationship = Object.values(state.fire_relationships_by_id).some(
      (relationship) =>
        relationship.source_team_id === source.id &&
        relationship.status === FireRelationshipStatus.ACTIVE,
    );
    if (hasActiveRelationship) continue;

    const target = eligibleTargets(state, source)[0];
    if (!target) continue;

    const causedByEventId = latestSpottingEventId(state, source.id, target.id) ?? null;
    const relationship = createFireRelationshipRecord({
      id: nextRuntimeId(state),
      sourceTeamId: source.id,
      sourceLocationId: source.location_id,
      targetTeamId: target.id,
      targetLocationId: target.location_id,
      effectCategory: FireCategory.BASIC_FIRE,
      startedTurn: state.turn,
      causedByEventId,
    });
    state.fire_relationships_by_id[relationship.id] = relationship;

    events.push(
      emit(state, {
        type: EventType.FIRE_OPENED,
        locationId: source.location_id,
        actor: { type: "TEAM", id: source.id },
        target: { type: "TEAM", id: target.id },
        result: { fire_relationship_id: relationship.id, status: relationship.status },
        metadata: {
          source_location_id: source.location_id,
          target_location_id: target.location_id,
          fire_category: relationship.effect_category,
        },
        causedByEventId,
        visibility: { faction_ids: visibleFactions(state, source, target) },
      }),
    );
  }

  return events;
}

export function evaluateAutomaticFire(state) {
  if (state.status !== MissionStatus.ACTIVE) {
    return ceaseInvalidRelationships(state);
  }

  return [...ceaseInvalidRelationships(state), ...openEligibleRelationships(state)];
}
