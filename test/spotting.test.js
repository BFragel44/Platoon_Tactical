import { describe, expect, it } from "vitest";

import { m0TestScenario } from "../src/scenarios/m0TestScenario.js";
import {
  advancePhase,
  calculateSpottingTargetNumber,
  clampSpottingTargetNumber,
  createMission,
  getPlayerView,
  getVisibleEvents,
  submitCommand,
} from "../src/sim/index.js";

function team(overrides = {}) {
  return {
    location_id: "loc_a",
    observation_experience: "NORMAL",
    occupied_cover_id: null,
    ...overrides,
  };
}

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
  if (continueToRidge) {
    state = queueMove(state, "loc_ridge");
  }
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

describe("M0 Spotting target number", () => {
  it("uses base 50 with the specified experience modifiers", () => {
    const target = team({ location_id: "loc_b" });

    expect(calculateSpottingTargetNumber(team({ observation_experience: "GREEN" }), target)).toBe(35);
    expect(calculateSpottingTargetNumber(team({ observation_experience: "NORMAL" }), target)).toBe(50);
    expect(calculateSpottingTargetNumber(team({ observation_experience: "EXPERIENCED" }), target)).toBe(50);
    expect(calculateSpottingTargetNumber(team({ observation_experience: "VETERAN" }), target)).toBe(65);
  });

  it("applies same-Location and occupied-cover modifiers", () => {
    expect(calculateSpottingTargetNumber(team(), team())).toBe(75);
    expect(calculateSpottingTargetNumber(team(), team({ occupied_cover_id: "cover_test" }))).toBe(55);
  });

  it("clamps target numbers to 10–90", () => {
    expect(clampSpottingTargetNumber(0)).toBe(10);
    expect(clampSpottingTargetNumber(55)).toBe(55);
    expect(clampSpottingTargetNumber(100)).toBe(90);
    expect(calculateSpottingTargetNumber(team({ observation_experience: "VETERAN" }), team())).toBe(90);
  });
});

describe("automatic faction-specific Spotting", () => {
  it.each([
    ["spot-3", true, true],
    ["spot-0", true, false],
    ["spot-5", false, true],
    ["spot-11", false, false],
  ])(
    "resolves independent friendly/enemy outcomes for %s",
    (seed, friendlySucceeds, enemySucceeds) => {
      const state = resolveEncounter(seed);
      const enemyTeamId = state.contacts_by_id.contact_stone_house.generated_team_ids[0];
      const friendlyKnowledge = state.knowledge_by_faction.friendly.known_enemy_teams_by_id;
      const enemyKnowledge = state.knowledge_by_faction.enemy.known_enemy_teams_by_id;

      expect(Boolean(friendlyKnowledge[enemyTeamId])).toBe(friendlySucceeds);
      expect(Boolean(enemyKnowledge.team_alpha)).toBe(enemySucceeds);
      expect(state.rng.draw_count).toBe(3);
      expect(state.events.filter((event) => event.type === "SPOTTING_ATTEMPTED")).toHaveLength(2);
      expect(state.events.filter((event) => event.type === "UNIT_SPOTTED")).toHaveLength(
        Number(friendlySucceeds) + Number(enemySucceeds),
      );
    },
  );

  it("keeps an unsuccessfully spotted generated Team absent from friendly knowledge", () => {
    const state = resolveEncounter("spot-11");
    const enemyTeamId = state.contacts_by_id.contact_stone_house.generated_team_ids[0];

    expect(state.teams_by_id[enemyTeamId]).toBeDefined();
    expect(state.knowledge_by_faction.friendly.known_enemy_teams_by_id).toEqual({});
    expect(getPlayerView(state, "friendly").spotted_enemies).toEqual([]);
  });

  it("exposes only a successfully spotted Team's ID, coarse type, and Location", () => {
    const state = resolveEncounter("spot-0");
    const enemyTeamId = state.contacts_by_id.contact_stone_house.generated_team_ids[0];
    const view = getPlayerView(state, "friendly");

    expect(view.spotted_enemies).toEqual([
      {
        id: enemyTeamId,
        coarse_type: "RIFLE_TEAM",
        location_id: "loc_stone_house",
        status: "SPOTTED",
      },
    ]);
    expect(JSON.stringify(view)).not.toContain("Enemy Team Leader");
    expect(JSON.stringify(view)).not.toContain("soldier_000005");
  });

  it("keeps failed attempt identity and rolls out of visible Events", () => {
    const state = resolveEncounter("spot-11");
    const visible = getVisibleEvents(state, "friendly");

    expect(visible.some((event) => event.type === "SPOTTING_ATTEMPTED")).toBe(false);
    expect(visible.some((event) => event.type === "UNIT_SPOTTED")).toBe(false);
    expect(JSON.stringify(visible)).not.toContain("team_000004");
    expect(JSON.stringify(visible)).not.toContain("target_number");
    expect(JSON.stringify(visible)).not.toContain("roll");
  });

  it("uses Contact generation draw before two independent d100 rolls", () => {
    const state = resolveEncounter("spot-0");
    const attempts = state.events.filter((event) => event.type === "SPOTTING_ATTEMPTED");

    expect(state.rng.draw_count).toBe(3);
    expect(state.contacts_by_id.contact_stone_house.resolution_result).toBe("RIFLE_TEAM");
    expect(attempts.map((event) => event.metadata.roll)).toEqual([36, 93]);
    expect(attempts.map((event) => event.metadata.target_number)).toEqual([75, 75]);
  });

  it("does not retry merely because a new turn begins", () => {
    const state = enterNextCommandPhase(resolveEncounter("spot-11"));

    expect(state.turn).toBe(2);
    expect(state.rng.draw_count).toBe(3);
    expect(state.events.filter((event) => event.type === "SPOTTING_ATTEMPTED")).toHaveLength(2);
  });

  it("retries each still-unspotted direction when a Team re-enters the shared Location", () => {
    let state = enterNextCommandPhase(resolveEncounter("spot-11", true));
    state = queueMove(state, "loc_stone_house");
    state = advancePhase(state).state;
    state = advancePhase(state).state;

    expect(state.rng.draw_count).toBe(5);
    expect(state.events.filter((event) => event.type === "SPOTTING_ATTEMPTED")).toHaveLength(4);
  });

  it("does not duplicate Spotting attempts or knowledge Events for already spotted Teams", () => {
    let state = enterNextCommandPhase(resolveEncounter("spot-3", true));
    const attemptsBefore = state.events.filter((event) => event.type === "SPOTTING_ATTEMPTED").length;
    const spottedBefore = state.events.filter((event) => event.type === "UNIT_SPOTTED").length;
    state = queueMove(state, "loc_stone_house");
    state = advancePhase(state).state;
    state = advancePhase(state).state;

    expect(state.rng.draw_count).toBe(3);
    expect(state.events.filter((event) => event.type === "SPOTTING_ATTEMPTED")).toHaveLength(
      attemptsBefore,
    );
    expect(state.events.filter((event) => event.type === "UNIT_SPOTTED")).toHaveLength(
      spottedBefore,
    );
  });

  it("produces identical Spotting state and Events for identical inputs", () => {
    expect(JSON.stringify(resolveEncounter("spot-5"))).toBe(
      JSON.stringify(resolveEncounter("spot-5")),
    );
  });

  it("remains independent from DOM globals", () => {
    expect(globalThis.document).toBeUndefined();
    expect(globalThis.window).toBeUndefined();
    expect(() => resolveEncounter("spot-3")).not.toThrow();
  });
});
