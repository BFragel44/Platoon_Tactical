export const MissionStatus = Object.freeze({
  ACTIVE: "ACTIVE",
});

export const MissionPhase = Object.freeze({
  COMMAND: "COMMAND",
  ACTION: "ACTION",
  CONTACT_OBSERVATION: "CONTACT_OBSERVATION",
  AUTOMATIC_FIRE: "AUTOMATIC_FIRE",
  EFFECTS: "EFFECTS",
  RECOVERY_CLEANUP: "RECOVERY_CLEANUP",
});

export const SoldierCondition = Object.freeze({
  EFFECTIVE: "EFFECTIVE",
});

export const TeamTacticalState = Object.freeze({
  EFFECTIVE: "EFFECTIVE",
});

export const ContactResolutionStatus = Object.freeze({
  UNRESOLVED: "UNRESOLVED",
});

export const CommandStatus = Object.freeze({
  QUEUED: "QUEUED",
  RESOLVED: "RESOLVED",
  UNRESOLVED: "UNRESOLVED",
});

export const CommandFailure = Object.freeze({
  COMMAND_NOT_IMPLEMENTED: "COMMAND_NOT_IMPLEMENTED",
});

export const CommandType = Object.freeze({
  MOVE: "MOVE",
  SEEK_COVER: "SEEK_COVER",
  RALLY: "RALLY",
});

export const CommandCost = Object.freeze({
  MOVE: 1,
  SEEK_COVER: 1,
  RALLY: 1,
});

export const CommandRejection = Object.freeze({
  NOT_COMMAND_PHASE: "NOT_COMMAND_PHASE",
  UNKNOWN_COMMAND_TYPE: "UNKNOWN_COMMAND_TYPE",
  UNKNOWN_TEAM: "UNKNOWN_TEAM",
  NOT_ACTIVE_FACTION: "NOT_ACTIVE_FACTION",
  INVALID_TARGET: "INVALID_TARGET",
  UNKNOWN_LOCATION: "UNKNOWN_LOCATION",
  LOCATION_NOT_CONNECTED: "LOCATION_NOT_CONNECTED",
  INSUFFICIENT_COMMAND_CAPACITY: "INSUFFICIENT_COMMAND_CAPACITY",
});

export const FireRelationshipStatus = Object.freeze({
  ACTIVE: "ACTIVE",
});

export const EventType = Object.freeze({
  MISSION_STARTED: "MISSION_STARTED",
  COMMAND_ISSUED: "COMMAND_ISSUED",
  UNIT_MOVED: "UNIT_MOVED",
});
