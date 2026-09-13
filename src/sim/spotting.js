import { EventType, MissionPhase, SpottingStatus } from "./constants.js";
import { createEvent } from "./events.js";
import { drawRandom } from "./rng.js";

const EXPERIENCE_MODIFIERS = Object.freeze({
  GREEN: -15,
  NORMAL: 0,
  EXPERIENCED: 0,
  VETERAN: 15,
});

export function clampSpottingTargetNumber(value) {
  return Math.min(90, Math.max(10, value));
}

export function calculateSpottingTargetNumber(observer, target) {
  const experienceModifier = EXPERIENCE_MODIFIERS[observer.observation_experience];
  const sameLocationModifier = observer.location_id === target.location_id ? 25 : 0;
  const coverModifier = target.occupied_cover_id === null ? 0 : -20;

  return clampSpottingTargetNumber(
    50 + experienceModifier + sameLocationModifier + coverModifier,
  );
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

function isSpotted(state, observerFactionId, targetTeamId) {
  return (
    state.knowledge_by_faction[observerFactionId].known_enemy_teams_by_id[targetTeamId]?.status ===
    SpottingStatus.SPOTTED
  );
}

export function attemptSpotting(state, observerTeamId, targetTeamId, causedByEventId) {
  const observer = state.teams_by_id[observerTeamId];
  const target = state.teams_by_id[targetTeamId];
  if (observer.faction_id === target.faction_id || isSpotted(state, observer.faction_id, target.id)) {
    return [];
  }

  const targetNumber = calculateSpottingTargetNumber(observer, target);
  const draw = drawRandom(state.rng);
  state.rng = draw.rng;
  const roll = Math.floor(draw.value * 100) + 1;
  const succeeded = roll <= targetNumber;

  const attemptedEvent = emit(state, {
    type: EventType.SPOTTING_ATTEMPTED,
    locationId: target.location_id,
    actor: { type: "TEAM", id: observer.id },
    target: { type: "TEAM", id: target.id },
    result: { succeeded },
    metadata: {
      roll,
      target_number: targetNumber,
      observer_experience: observer.observation_experience,
      same_location: observer.location_id === target.location_id,
      target_in_cover: target.occupied_cover_id !== null,
    },
    causedByEventId,
    visibility: { faction_ids: [], simulation_only: true },
  });

  if (!succeeded) {
    return [attemptedEvent];
  }

  state.knowledge_by_faction[observer.faction_id].known_enemy_teams_by_id[target.id] = {
    status: SpottingStatus.SPOTTED,
    team_id: target.id,
    coarse_type: target.coarse_type,
    location_id: target.location_id,
  };

  const spottedEvent = emit(state, {
    type: EventType.UNIT_SPOTTED,
    locationId: target.location_id,
    actor: { type: "TEAM", id: observer.id },
    target: { type: "TEAM", id: target.id },
    result: {
      knowledge_status: SpottingStatus.SPOTTED,
      coarse_type: target.coarse_type,
      location_id: target.location_id,
    },
    causedByEventId: attemptedEvent.id,
    visibility: { faction_ids: [observer.faction_id] },
  });

  return [attemptedEvent, spottedEvent];
}

export function resolveSpottingOnEntry(state, enteringTeamId, causedByEventId) {
  const enteringTeam = state.teams_by_id[enteringTeamId];
  const opposingTeams = state.locations_by_id[enteringTeam.location_id].occupant_team_ids
    .map((teamId) => state.teams_by_id[teamId])
    .filter((team) => team.id !== enteringTeam.id && team.faction_id !== enteringTeam.faction_id)
    .sort((left, right) => left.id.localeCompare(right.id));
  const events = [];

  for (const opposingTeam of opposingTeams) {
    events.push(...attemptSpotting(state, enteringTeam.id, opposingTeam.id, causedByEventId));
    events.push(...attemptSpotting(state, opposingTeam.id, enteringTeam.id, causedByEventId));
  }

  return events;
}
