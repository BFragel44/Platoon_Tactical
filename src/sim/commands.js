import {
  CommandCost,
  CommandFailure,
  CommandRejection,
  CommandStatus,
  CommandType,
  EventType,
  MissionPhase,
} from "./constants.js";
import { createEvent } from "./events.js";
import { createCommandRecord } from "./records.js";
import { resolveContactsOnEntry } from "./contacts.js";
import { resolveSpottingOnEntry } from "./spotting.js";
import { evaluateAutomaticFire } from "./fire.js";

function rejected(state, reason) {
  return { state, events: [], accepted: false, reason };
}

function projectedLocation(state, teamId) {
  let locationId = state.teams_by_id[teamId].location_id;

  for (const commandId of state.command_queue_ids) {
    const command = state.commands_by_id[commandId];
    if (command.team_id === teamId && command.type === CommandType.MOVE) {
      locationId = command.target.location_id;
    }
  }

  return locationId;
}

function validateMove(state, teamId, target) {
  if (!target || typeof target.location_id !== "string") {
    return CommandRejection.INVALID_TARGET;
  }
  if (!state.locations_by_id[target.location_id]) {
    return CommandRejection.UNKNOWN_LOCATION;
  }

  const origin = state.locations_by_id[projectedLocation(state, teamId)];
  if (!origin.connected_location_ids.includes(target.location_id)) {
    return CommandRejection.LOCATION_NOT_CONNECTED;
  }

  return null;
}

export function submitCommand(state, commandInput) {
  if (state.phase !== MissionPhase.COMMAND) {
    return rejected(state, CommandRejection.NOT_COMMAND_PHASE);
  }

  const cost = CommandCost[commandInput?.type];
  if (cost === undefined) {
    return rejected(state, CommandRejection.UNKNOWN_COMMAND_TYPE);
  }

  const team = state.teams_by_id[commandInput.team_id];
  if (!team) {
    return rejected(state, CommandRejection.UNKNOWN_TEAM);
  }
  if (
    commandInput.faction_id !== state.active_faction_id ||
    team.faction_id !== state.active_faction_id
  ) {
    return rejected(state, CommandRejection.NOT_ACTIVE_FACTION);
  }
  if (state.command_capacity_by_faction[state.active_faction_id] < cost) {
    return rejected(state, CommandRejection.INSUFFICIENT_COMMAND_CAPACITY);
  }

  if (commandInput.type === CommandType.MOVE) {
    const moveRejection = validateMove(state, team.id, commandInput.target);
    if (moveRejection) {
      return rejected(state, moveRejection);
    }
  }

  const nextState = structuredClone(state);
  const commandId = `cmd_${String(nextState.next_runtime_id).padStart(6, "0")}`;
  const command = createCommandRecord({
    id: commandId,
    type: commandInput.type,
    factionId: commandInput.faction_id,
    teamId: commandInput.team_id,
    target: commandInput.target ?? null,
    cost,
    issuedTurn: nextState.turn,
    issuedPhase: nextState.phase,
  });

  nextState.commands_by_id[commandId] = command;
  nextState.command_queue_ids.push(commandId);
  nextState.next_runtime_id += 1;
  nextState.command_capacity_by_faction[nextState.active_faction_id] -= cost;

  const event = createEvent({
    sequence: nextState.next_event_sequence,
    type: EventType.COMMAND_ISSUED,
    turn: nextState.turn,
    phase: nextState.phase,
    locationId: team.location_id,
    actor: { type: "FACTION", id: commandInput.faction_id },
    target: { type: "TEAM", id: team.id },
    result: { command_id: commandId, command_type: command.type },
    metadata: { cost, target: structuredClone(command.target) },
    visibility: { faction_ids: [commandInput.faction_id] },
  });

  nextState.events.push(event);
  nextState.next_event_sequence += 1;

  return { state: nextState, events: [event], accepted: true, reason: null };
}

export function resolveCommands(state) {
  const nextState = structuredClone(state);
  const emittedEvents = [];

  for (const commandId of nextState.command_queue_ids) {
    const command = nextState.commands_by_id[commandId];
    if (command.type !== CommandType.MOVE) {
      command.status = CommandStatus.UNRESOLVED;
      command.failure_reason = CommandFailure.COMMAND_NOT_IMPLEMENTED;
      continue;
    }

    const team = nextState.teams_by_id[command.team_id];
    const originId = team.location_id;
    const destinationId = command.target.location_id;
    team.current_command_id = command.id;

    nextState.locations_by_id[originId].occupant_team_ids = nextState.locations_by_id[
      originId
    ].occupant_team_ids.filter((teamId) => teamId !== team.id);
    nextState.locations_by_id[destinationId].occupant_team_ids.push(team.id);
    team.location_id = destinationId;
    team.current_command_id = null;
    command.status = CommandStatus.RESOLVED;

    const event = createEvent({
      sequence: nextState.next_event_sequence,
      type: EventType.UNIT_MOVED,
      turn: nextState.turn,
      phase: MissionPhase.ACTION,
      locationId: destinationId,
      actor: { type: "TEAM", id: team.id },
      result: { from_location_id: originId, to_location_id: destinationId },
      metadata: { command_id: command.id },
      causedByEventId: nextState.events.find(
        (candidate) => candidate.result?.command_id === command.id,
      )?.id,
      visibility: { faction_ids: [team.faction_id] },
    });

    nextState.events.push(event);
    emittedEvents.push(event);
    nextState.next_event_sequence += 1;
    const contactEvents = resolveContactsOnEntry(nextState, team.id, destinationId, event.id);
    emittedEvents.push(...contactEvents);
    const spottingCauseId =
      contactEvents.findLast((candidate) => candidate.type === EventType.ENEMY_GENERATED)?.id ??
      event.id;
    emittedEvents.push(...resolveSpottingOnEntry(nextState, team.id, spottingCauseId));
    emittedEvents.push(...evaluateAutomaticFire(nextState));
  }

  nextState.command_queue_ids = [];

  return { state: nextState, events: emittedEvents };
}
