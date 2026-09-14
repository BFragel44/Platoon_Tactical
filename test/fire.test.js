import { describe, expect, it } from "vitest";

import { m0TestScenario } from "../src/scenarios/m0TestScenario.js";
import {
  advancePhase,
  createMission,
  getPlayerView,
  getVisibleEvents,
  submitCommand,
} from "../src/sim/index.js";

function queueMove(state, locationId) {
  return submitCommand(state, {
    type: "MOVE",
    faction_id: "friendly",
    team_id: "team_alpha",
    target: { location_id: locationId },
  }).state;
}

function resolveEncounter(seed, continueToRidge = false) {
  let state = createMission(m0TestScenario, seed);
  state = queueMove(state, "loc_lane");
  state = queueMove(state, "loc_farmyard");
  state = queueMove(state, "loc_stone_house");
  if (continueToRidge) state = queueMove(state, "loc_ridge");
  state = advancePhase(state).state;
  return advancePhase(state).state;
}

function enterNextCommandPhase(state) {
  let nextState = state;
  for (let count = 0; count < 4; count += 1) {
    nextState = advancePhase(nextState).state;
  }
  return nextState;
}

function activeFire(state) {
  return Object.values(state.fire_relationships_by_id).filter(
    (relationship) => relationship.status === "ACTIVE",
  );
}

function addEnemyTarget(state, id, locationId) {
  state.teams_by_id[id] = {
    id,
    name: "Hidden Test Enemy",
    faction_id: "enemy",
    coarse_type: "RIFLE_TEAM",
    observation_experience: "NORMAL",
    member_ids: [],
    location_id: locationId,
    current_command_id: null,
    suppression: 0,
    tactical_state: "EFFECTIVE",
    occupied_cover_id: null,
    action_state: null,
  };
  state.locations_by_id[locationId].occupant_team_ids.push(id);
  state.knowledge_by_faction.friendly.known_enemy_teams_by_id[id] = {
    status: "SPOTTED",
    team_id: id,
    coarse_type: "RIFLE_TEAM",
    location_id: locationId,
  };
}

function evaluateFirePhase(state) {
  state.phase = "AUTOMATIC_FIRE";
  return advancePhase(state);
}

describe("M0 Automatic Fire", () => {
  it("opens one eligible relationship without CP or RNG cost", () => {
    const state = resolveEncounter("spot-0");
    const relationship = activeFire(state)[0];

    expect(activeFire(state)).toHaveLength(1);
    expect(relationship).toMatchObject({
      source_team_id: "team_alpha",
      target_team_id: "team_000004",
      source_location_id: "loc_stone_house",
      target_location_id: "loc_stone_house",
      status: "ACTIVE",
      effect_category: "BASIC_FIRE",
      started_turn: 1,
    });
    expect(state.command_capacity_by_faction.friendly).toBe(1);
    expect(state.rng.draw_count).toBe(3);
    expect(state.events.filter((event) => event.type === "FIRE_OPENED")).toHaveLength(1);
  });

  it.each([
    ["spot-3", ["enemy", "friendly"]],
    ["spot-0", ["friendly"]],
    ["spot-5", ["enemy"]],
    ["spot-11", []],
  ])("keeps fire direction independent for %s", (seed, expectedSourceFactions) => {
    const state = resolveEncounter(seed);

    expect(activeFire(state).map((relationship) => state.teams_by_id[relationship.source_team_id].faction_id).sort()).toEqual(
      [...expectedSourceFactions].sort(),
    );
  });

  it("does not fire at an unspotted enemy", () => {
    const state = resolveEncounter("spot-11");

    expect(activeFire(state)).toEqual([]);
    expect(state.events.some((event) => event.type === "FIRE_OPENED")).toBe(false);
  });

  it("continues valid fire across phases and turns without duplicates or RNG", () => {
    let state = resolveEncounter("spot-0");
    const relationshipId = activeFire(state)[0].id;
    const rngBefore = structuredClone(state.rng);
    const openedBefore = state.events.filter((event) => event.type === "FIRE_OPENED").length;

    state = enterNextCommandPhase(state);

    expect(state.turn).toBe(2);
    expect(activeFire(state).map((relationship) => relationship.id)).toEqual([relationshipId]);
    expect(state.events.filter((event) => event.type === "FIRE_OPENED")).toHaveLength(openedBefore);
    expect(state.rng).toEqual(rngBefore);
  });

  it("allows fire in the same or directly connected Location, but not beyond", () => {
    const same = createMission(m0TestScenario, "same-range");
    addEnemyTarget(same, "team_enemy", "loc_orchard_edge");
    expect(activeFire(evaluateFirePhase(same).state)).toHaveLength(1);

    const adjacent = createMission(m0TestScenario, "adjacent-range");
    addEnemyTarget(adjacent, "team_enemy", "loc_lane");
    expect(activeFire(evaluateFirePhase(adjacent).state)).toHaveLength(1);

    const distant = createMission(m0TestScenario, "distant-range");
    addEnemyTarget(distant, "team_enemy", "loc_stone_house");
    expect(activeFire(evaluateFirePhase(distant).state)).toEqual([]);
  });

  it("ceases once when movement takes the source beyond adjacency", () => {
    let state = enterNextCommandPhase(resolveEncounter("spot-3", true));
    const alphaRelationship = activeFire(state).find(
      (relationship) => relationship.source_team_id === "team_alpha",
    );
    state = queueMove(state, "loc_stone_house");
    state = queueMove(state, "loc_farmyard");
    state = queueMove(state, "loc_lane");
    state = advancePhase(state).state;
    state = advancePhase(state).state;

    expect(state.fire_relationships_by_id[alphaRelationship.id].status).toBe("CEASED");
    const ceased = state.events.filter(
      (event) =>
        event.type === "FIRE_CEASED" &&
        event.result.fire_relationship_id === alphaRelationship.id,
    );
    expect(ceased).toHaveLength(1);
    expect(ceased[0].result.reason).toBe("OUT_OF_RANGE");

    state = advancePhase(state).state;
    state = advancePhase(state).state;
    expect(
      state.events.filter(
        (event) =>
          event.type === "FIRE_CEASED" &&
          event.result.fire_relationship_id === alphaRelationship.id,
      ),
    ).toHaveLength(1);
  });

  it("ceases when the source faction loses Spotting knowledge", () => {
    const state = resolveEncounter("spot-0");
    const relationship = activeFire(state)[0];
    delete state.knowledge_by_faction.friendly.known_enemy_teams_by_id[relationship.target_team_id];
    const result = evaluateFirePhase(state);

    expect(result.state.fire_relationships_by_id[relationship.id].status).toBe("CEASED");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].result.reason).toBe("TARGET_UNSPOTTED");
  });

  it("gives same-Location targets priority and permits one outgoing relationship", () => {
    const state = createMission(m0TestScenario, "same-priority");
    addEnemyTarget(state, "team_a_adjacent", "loc_lane");
    addEnemyTarget(state, "team_z_same", "loc_orchard_edge");
    const result = evaluateFirePhase(state).state;
    const outgoing = activeFire(result).filter(
      (relationship) => relationship.source_team_id === "team_alpha",
    );

    expect(outgoing).toHaveLength(1);
    expect(outgoing[0].target_team_id).toBe("team_z_same");
  });

  it("uses lowest stable Team ID when eligible targets have equal priority", () => {
    const state = createMission(m0TestScenario, "id-priority");
    addEnemyTarget(state, "team_z", "loc_lane");
    addEnemyTarget(state, "team_a", "loc_lane");
    const result = evaluateFirePhase(state).state;

    expect(
      activeFire(result).find((relationship) => relationship.source_team_id === "team_alpha")
        .target_team_id,
    ).toBe("team_a");
  });

  it("uses no RNG for target selection", () => {
    const state = createMission(m0TestScenario, "selection-rng");
    addEnemyTarget(state, "team_z", "loc_lane");
    addEnemyTarget(state, "team_a", "loc_lane");
    const rngBefore = structuredClone(state.rng);
    const result = evaluateFirePhase(state);

    expect(result.state.rng).toEqual(rngBefore);
  });

  it("shows fire only to factions that know both Teams", () => {
    const friendlyOnly = resolveEncounter("spot-0");
    const friendlyEvents = getVisibleEvents(friendlyOnly, "friendly");
    const enemyEvents = getVisibleEvents(friendlyOnly, "enemy");

    expect(friendlyEvents.some((event) => event.type === "FIRE_OPENED")).toBe(true);
    expect(enemyEvents.some((event) => event.type === "FIRE_OPENED")).toBe(false);
    expect(JSON.stringify(enemyEvents)).not.toContain("team_alpha");
    expect(getPlayerView(friendlyOnly, "friendly").fire_relationships).toHaveLength(1);

    const enemyOnly = resolveEncounter("spot-5");
    expect(getVisibleEvents(enemyOnly, "friendly").some((event) => event.type === "FIRE_OPENED")).toBe(false);
    expect(getPlayerView(enemyOnly, "friendly").fire_relationships).toEqual([]);
  });

  it("remains deterministic and DOM-independent", () => {
    expect(globalThis.document).toBeUndefined();
    expect(globalThis.window).toBeUndefined();
    expect(JSON.stringify(resolveEncounter("spot-3"))).toBe(
      JSON.stringify(resolveEncounter("spot-3")),
    );
  });
});
