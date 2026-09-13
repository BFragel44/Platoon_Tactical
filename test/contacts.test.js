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

function resolveToContact(seed, includeRidge = false) {
  let state = createMission(m0TestScenario, seed);
  state = queueMove(state, "loc_lane");
  state = queueMove(state, "loc_farmyard");
  state = queueMove(state, "loc_stone_house");
  if (includeRidge) {
    state = queueMove(state, "loc_ridge");
  }
  state = advancePhase(state).state;
  return advancePhase(state);
}

describe("Potential Contact resolution", () => {
  it("does not instantiate or roll an unresolved Contact at mission creation", () => {
    const state = createMission(m0TestScenario, "4");

    expect(state.contacts_by_id.contact_stone_house).toMatchObject({
      resolution_status: "UNRESOLVED",
      resolution_result: null,
      generated_team_ids: [],
    });
    expect(state.rng.draw_count).toBe(0);
    expect(Object.keys(state.teams_by_id)).toEqual(["team_alpha"]);
    expect(Object.keys(state.soldiers_by_id)).toHaveLength(4);
  });

  it("resolves to NO_CONTACT without generating an enemy", () => {
    const result = resolveToContact("4");
    const contact = result.state.contacts_by_id.contact_stone_house;

    expect(contact).toMatchObject({
      resolution_status: "RESOLVED",
      resolution_result: "NO_CONTACT",
      generated_team_ids: [],
      resolved_turn: 1,
    });
    expect(result.state.rng.draw_count).toBe(1);
    expect(Object.keys(result.state.teams_by_id)).toEqual(["team_alpha"]);
    expect(result.events.map((event) => event.type)).toEqual([
      "UNIT_MOVED",
      "UNIT_MOVED",
      "UNIT_MOVED",
      "CONTACT_TRIGGERED",
      "CONTACT_RESOLVED",
    ]);
    expect(result.events.some((event) => event.type === "ENEMY_GENERATED")).toBe(false);
  });

  it.each([
    ["no-contact", "RIFLE_TEAM", 2],
    ["automatic", "AUTOMATIC_WEAPONS_TEAM", 2],
    ["rifle", "REINFORCED_RIFLE_TEAM", 3],
  ])("instantiates %s as hidden authoritative entities", (seed, packageId, soldierCount) => {
    const result = resolveToContact(seed);
    const state = result.state;
    const contact = state.contacts_by_id.contact_stone_house;
    const generatedTeamId = contact.generated_team_ids[0];
    const generatedTeam = state.teams_by_id[generatedTeamId];

    expect(contact.resolution_result).toBe(packageId);
    expect(generatedTeamId).toBe("team_000004");
    expect(generatedTeam).toMatchObject({
      faction_id: "enemy",
      location_id: "loc_stone_house",
    });
    expect(generatedTeam.member_ids).toHaveLength(soldierCount);
    expect(state.locations_by_id.loc_stone_house.occupant_team_ids).toEqual([
      "team_alpha",
      generatedTeamId,
    ]);
    expect(result.events.at(-1)).toMatchObject({
      type: "ENEMY_GENERATED",
      result: { package_id: packageId, team_id: generatedTeamId },
      visibility: { faction_ids: [], simulation_only: true },
    });
  });

  it("records deterministic causal Contact Events", () => {
    const result = resolveToContact("automatic");
    const triggered = result.events.find((event) => event.type === "CONTACT_TRIGGERED");
    const resolved = result.events.find((event) => event.type === "CONTACT_RESOLVED");
    const generated = result.events.find((event) => event.type === "ENEMY_GENERATED");
    const enteringMove = result.events.filter((event) => event.type === "UNIT_MOVED").at(-1);

    expect(triggered.caused_by_event_id).toBe(enteringMove.id);
    expect(resolved.caused_by_event_id).toBe(triggered.id);
    expect(generated.caused_by_event_id).toBe(resolved.id);
    expect(triggered.result).toEqual({ resolution_status: "RESOLVED" });
    expect(triggered.result).not.toHaveProperty("generation_result");
  });

  it("keeps generated enemy details out of the friendly view and visible Events", () => {
    const state = resolveToContact("automatic").state;
    const view = getPlayerView(state, "friendly");
    const visibleEvents = getVisibleEvents(state, "friendly");
    const serializedView = JSON.stringify(view);

    expect(view.potential_contacts).toEqual([
      { id: "contact_stone_house", location_id: "loc_stone_house", status: "RESOLVED" },
    ]);
    expect(view.teams.map((team) => team.id)).toEqual(["team_alpha"]);
    expect(view.soldiers).toHaveLength(4);
    expect(serializedView).not.toContain("AUTOMATIC_WEAPONS_TEAM");
    expect(serializedView).not.toContain("team_000004");
    expect(serializedView).not.toContain("Enemy Automatic Rifleman");
    expect(visibleEvents.some((event) => event.type === "CONTACT_TRIGGERED")).toBe(true);
    expect(visibleEvents.some((event) => event.type === "CONTACT_RESOLVED")).toBe(false);
    expect(visibleEvents.some((event) => event.type === "ENEMY_GENERATED")).toBe(false);
    expect(getVisibleEvents(state, "friendly", 7).every((event) => event.sequence > 7)).toBe(true);
  });

  it("resolves during chained movement before a later MOVE continues", () => {
    const result = resolveToContact("4", true);
    const eventTypes = result.events.map((event) => event.type);

    expect(eventTypes).toEqual([
      "UNIT_MOVED",
      "UNIT_MOVED",
      "UNIT_MOVED",
      "CONTACT_TRIGGERED",
      "CONTACT_RESOLVED",
      "UNIT_MOVED",
    ]);
    expect(result.state.teams_by_id.team_alpha.location_id).toBe("loc_ridge");
  });

  it("does not trigger or consume RNG again when a resolved Contact is revisited", () => {
    let state = resolveToContact("automatic").state;
    for (let count = 0; count < 4; count += 1) {
      state = advancePhase(state).state;
    }
    state = queueMove(state, "loc_ridge");
    state = queueMove(state, "loc_stone_house");
    state = advancePhase(state).state;
    const result = advancePhase(state);

    expect(result.state.rng.draw_count).toBe(1);
    expect(result.events.map((event) => event.type)).toEqual(["UNIT_MOVED", "UNIT_MOVED"]);
    expect(
      result.state.events.filter((event) => event.type === "CONTACT_TRIGGERED"),
    ).toHaveLength(1);
  });

  it("is deterministic for the same seed and varies across fixed seeds", () => {
    const first = resolveToContact("automatic").state;
    const second = resolveToContact("automatic").state;
    const noContact = resolveToContact("4").state;

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(noContact.contacts_by_id.contact_stone_house.resolution_result).not.toBe(
      first.contacts_by_id.contact_stone_house.resolution_result,
    );
  });

  it("runs Contact resolution without DOM globals", () => {
    expect(globalThis.document).toBeUndefined();
    expect(globalThis.window).toBeUndefined();
    expect(() => resolveToContact("4")).not.toThrow();
  });
});
