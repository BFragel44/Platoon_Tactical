import { describe, expect, it } from "vitest";

import { m0TestScenario } from "../src/scenarios/m0TestScenario.js";
import { advancePhase, createMission, submitCommand } from "../src/sim/index.js";

function move(state, locationId) {
  return submitCommand(state, {
    type: "MOVE",
    faction_id: "friendly",
    team_id: "team_alpha",
    target: { location_id: locationId },
  });
}

function reachNextCommandPhase(state) {
  let nextState = state;
  for (let count = 0; count < 6; count += 1) {
    nextState = advancePhase(nextState).state;
  }
  return nextState;
}

describe("command submission", () => {
  it("starts each Command phase with 4 CP and does not carry unused CP", () => {
    let state = createMission(m0TestScenario, "capacity");
    expect(state.command_capacity_by_faction.friendly).toBe(4);

    state = move(state, "loc_lane").state;
    expect(state.command_capacity_by_faction.friendly).toBe(3);

    state = reachNextCommandPhase(state);
    expect(state.turn).toBe(2);
    expect(state.phase).toBe("COMMAND");
    expect(state.command_capacity_by_faction.friendly).toBe(4);
  });

  it.each(["MOVE", "SEEK_COVER", "RALLY"])("charges 1 CP for an accepted %s", (type) => {
    const state = createMission(m0TestScenario, `cost-${type}`);
    const result = submitCommand(state, {
      type,
      faction_id: "friendly",
      team_id: "team_alpha",
      target: type === "MOVE" ? { location_id: "loc_lane" } : null,
    });

    expect(result.accepted).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.state.command_capacity_by_faction.friendly).toBe(3);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe("COMMAND_ISSUED");
  });

  it("allows multiple Commands until CP is exhausted", () => {
    let state = createMission(m0TestScenario, "multiple");

    for (const type of ["SEEK_COVER", "RALLY", "SEEK_COVER", "RALLY"]) {
      const result = submitCommand(state, {
        type,
        faction_id: "friendly",
        team_id: "team_alpha",
        target: null,
      });
      expect(result.accepted).toBe(true);
      state = result.state;
    }

    const eventCount = state.events.length;
    const rejected = submitCommand(state, {
      type: "RALLY",
      faction_id: "friendly",
      team_id: "team_alpha",
      target: null,
    });

    expect(state.command_capacity_by_faction.friendly).toBe(0);
    expect(rejected).toMatchObject({
      accepted: false,
      reason: "INSUFFICIENT_COMMAND_CAPACITY",
      events: [],
    });
    expect(rejected.state).toBe(state);
    expect(rejected.state.events).toHaveLength(eventCount);
  });

  it("preserves explicit acceptance order", () => {
    let state = createMission(m0TestScenario, "acceptance-order");
    state = move(state, "loc_lane").state;
    state = submitCommand(state, {
      type: "SEEK_COVER",
      faction_id: "friendly",
      team_id: "team_alpha",
      target: null,
    }).state;
    state = move(state, "loc_crossroads").state;

    expect(state.command_queue_ids).toEqual(["cmd_000001", "cmd_000002", "cmd_000003"]);
    expect(state.events.slice(1).map((event) => event.result.command_id)).toEqual([
      "cmd_000001",
      "cmd_000002",
      "cmd_000003",
    ]);
  });

  it.each([
    ["unknown command", { type: "ATTACK", faction_id: "friendly", team_id: "team_alpha" }, "UNKNOWN_COMMAND_TYPE"],
    ["unknown team", { type: "RALLY", faction_id: "friendly", team_id: "team_missing" }, "UNKNOWN_TEAM"],
    ["wrong faction", { type: "RALLY", faction_id: "enemy", team_id: "team_alpha" }, "NOT_ACTIVE_FACTION"],
  ])("rejects %s without spending CP or emitting an Event", (_label, input, reason) => {
    const state = createMission(m0TestScenario, reason);
    const before = JSON.stringify(state);
    const result = submitCommand(state, input);

    expect(result).toMatchObject({ accepted: false, reason, events: [] });
    expect(JSON.stringify(result.state)).toBe(before);
  });

  it("rejects submission outside the Command phase", () => {
    const state = advancePhase(createMission(m0TestScenario, "phase")).state;
    const result = move(state, "loc_lane");

    expect(result).toMatchObject({
      accepted: false,
      reason: "NOT_COMMAND_PHASE",
      events: [],
    });
  });

  it("rejects a Team belonging to another faction", () => {
    const scenario = structuredClone(m0TestScenario);
    scenario.teams.push({
      id: "team_enemy",
      name: "Enemy Team",
      faction_id: "enemy",
      member_ids: [],
      location_id: "loc_ridge",
    });
    const state = createMission(scenario, "wrong-team-faction");
    const result = submitCommand(state, {
      type: "RALLY",
      faction_id: "friendly",
      team_id: "team_enemy",
      target: null,
    });

    expect(result).toMatchObject({
      accepted: false,
      reason: "NOT_ACTIVE_FACTION",
      events: [],
    });
    expect(result.state.command_capacity_by_faction.friendly).toBe(4);
  });
});

describe("ordered MOVE resolution", () => {
  it("moves through directly connected Locations in acceptance order", () => {
    let state = createMission(m0TestScenario, "ordered-moves");
    state = move(state, "loc_lane").state;
    state = move(state, "loc_farmyard").state;
    state = move(state, "loc_stone_house").state;

    const commandIds = [...state.command_queue_ids];
    state = advancePhase(state).state;
    const result = advancePhase(state);
    const movementEvents = result.events.filter((event) => event.type === "UNIT_MOVED");

    expect(movementEvents.map((event) => event.result)).toEqual([
      { from_location_id: "loc_orchard_edge", to_location_id: "loc_lane" },
      { from_location_id: "loc_lane", to_location_id: "loc_farmyard" },
      { from_location_id: "loc_farmyard", to_location_id: "loc_stone_house" },
    ]);
    expect(movementEvents.map((event) => event.sequence)).toEqual([5, 6, 7]);
    expect(result.state.teams_by_id.team_alpha.location_id).toBe("loc_stone_house");
    expect(result.state.locations_by_id.loc_orchard_edge.occupant_team_ids).toEqual([]);
    expect(result.state.locations_by_id.loc_stone_house.occupant_team_ids).toEqual(["team_alpha"]);
    expect(commandIds.map((id) => result.state.commands_by_id[id].status)).toEqual([
      "RESOLVED",
      "RESOLVED",
      "RESOLVED",
    ]);
    expect(result.state.command_queue_ids).toEqual([]);
  });

  it("rejects movement to a nonadjacent or unknown Location", () => {
    const state = createMission(m0TestScenario, "illegal-moves");
    const nonadjacent = move(state, "loc_stone_house");
    const unknown = move(state, "loc_missing");

    expect(nonadjacent).toMatchObject({
      accepted: false,
      reason: "LOCATION_NOT_CONNECTED",
      events: [],
    });
    expect(unknown).toMatchObject({
      accepted: false,
      reason: "UNKNOWN_LOCATION",
      events: [],
    });
    expect(nonadjacent.state.command_capacity_by_faction.friendly).toBe(4);
    expect(nonadjacent.state.events).toHaveLength(1);
  });

  it("produces deterministic command and movement Events", () => {
    function run() {
      let state = createMission(m0TestScenario, "deterministic-commands");
      state = move(state, "loc_lane").state;
      state = move(state, "loc_crossroads").state;
      state = advancePhase(state).state;
      return advancePhase(state).state;
    }

    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
    expect(run().events.map((event) => event.id)).toEqual([
      "evt_000001",
      "evt_000002",
      "evt_000003",
      "evt_000004",
      "evt_000005",
    ]);
  });

  it("marks unimplemented accepted Commands unresolved without inventing effects", () => {
    let state = createMission(m0TestScenario, "unimplemented-resolution");
    state = submitCommand(state, {
      type: "SEEK_COVER",
      faction_id: "friendly",
      team_id: "team_alpha",
      target: null,
    }).state;
    state = submitCommand(state, {
      type: "RALLY",
      faction_id: "friendly",
      team_id: "team_alpha",
      target: null,
    }).state;

    state = advancePhase(state).state;
    const result = advancePhase(state);

    expect(result.events).toEqual([]);
    expect(result.state.command_queue_ids).toEqual([]);
    expect(result.state.commands_by_id.cmd_000001).toMatchObject({
      status: "UNRESOLVED",
      failure_reason: "COMMAND_NOT_IMPLEMENTED",
    });
    expect(result.state.commands_by_id.cmd_000002).toMatchObject({
      status: "UNRESOLVED",
      failure_reason: "COMMAND_NOT_IMPLEMENTED",
    });
    expect(result.state.teams_by_id.team_alpha).toMatchObject({
      location_id: "loc_orchard_edge",
      suppression: 0,
      occupied_cover_id: null,
    });
  });
});
