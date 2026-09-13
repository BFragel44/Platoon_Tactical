import { CommandStatus, FireRelationshipStatus } from "./constants.js";

export function createFactionKnowledge(knownLocationIds = []) {
  return {
    known_location_ids: [...knownLocationIds],
    contact_knowledge_by_id: {},
    known_enemy_teams_by_id: {},
    discovered_cover_ids: [],
    known_fire_origins: [],
  };
}

export function createCommandRecord({
  id,
  type,
  factionId,
  teamId,
  target,
  cost,
  issuedTurn,
  issuedPhase,
}) {
  return {
    id,
    type,
    faction_id: factionId,
    team_id: teamId,
    target: structuredClone(target),
    cost,
    issued_turn: issuedTurn,
    issued_phase: issuedPhase,
    status: CommandStatus.QUEUED,
    failure_reason: null,
  };
}

export function createFireRelationshipRecord({
  id,
  sourceTeamId,
  sourceLocationId,
  targetTeamId = null,
  targetLocationId,
  effectCategory,
  startedTurn,
  causedByEventId,
}) {
  return {
    id,
    source_team_id: sourceTeamId,
    source_location_id: sourceLocationId,
    target_team_id: targetTeamId,
    target_location_id: targetLocationId,
    status: FireRelationshipStatus.ACTIVE,
    effect_category: effectCategory,
    started_turn: startedTurn,
    caused_by_event_id: causedByEventId,
  };
}
