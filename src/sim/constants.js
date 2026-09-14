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

export const ObservationExperience = Object.freeze({
  GREEN: "GREEN",
  NORMAL: "NORMAL",
  EXPERIENCED: "EXPERIENCED",
  VETERAN: "VETERAN",
});

export const SpottingStatus = Object.freeze({
  UNSPOTTED: "UNSPOTTED",
  SPOTTED: "SPOTTED",
});

export const ContactResolutionStatus = Object.freeze({
  UNRESOLVED: "UNRESOLVED",
  RESOLVED: "RESOLVED",
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
  CEASED: "CEASED",
});

export const FireCategory = Object.freeze({
  BASIC_FIRE: "BASIC_FIRE",
});

export const FireCeaseReason = Object.freeze({
  MISSION_INACTIVE: "MISSION_INACTIVE",
  SOURCE_MISSING: "SOURCE_MISSING",
  SOURCE_INCAPABLE: "SOURCE_INCAPABLE",
  TARGET_MISSING: "TARGET_MISSING",
  TARGET_UNSPOTTED: "TARGET_UNSPOTTED",
  OUT_OF_RANGE: "OUT_OF_RANGE",
});

export const EventType = Object.freeze({
  MISSION_STARTED: "MISSION_STARTED",
  COMMAND_ISSUED: "COMMAND_ISSUED",
  UNIT_MOVED: "UNIT_MOVED",
  CONTACT_TRIGGERED: "CONTACT_TRIGGERED",
  CONTACT_RESOLVED: "CONTACT_RESOLVED",
  ENEMY_GENERATED: "ENEMY_GENERATED",
  SPOTTING_ATTEMPTED: "SPOTTING_ATTEMPTED",
  UNIT_SPOTTED: "UNIT_SPOTTED",
  FIRE_OPENED: "FIRE_OPENED",
  FIRE_CEASED: "FIRE_CEASED",
});
