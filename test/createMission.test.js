import { describe, expect, it } from "vitest";

import { m0TestScenario } from "../src/scenarios/m0TestScenario.js";
import { createMission } from "../src/sim/index.js";

describe("createMission", () => {
  it("creates JSON-serializable foundational M0 state", () => {
    const mission = createMission(m0TestScenario, "contact-seed-1");
    const serialized = JSON.stringify(mission);
    const restored = JSON.parse(serialized);

    expect(restored).toEqual(mission);
    expect(restored.contacts_by_id.contact_stone_house.resolution_status).toBe("UNRESOLVED");
    expect(restored.commands_by_id).toEqual({});
    expect(restored.fire_relationships_by_id).toEqual({});
    expect(restored.knowledge_by_faction.friendly.contact_knowledge_by_id).toEqual({});
  });

  it("produces identical initial state for an identical scenario and seed", () => {
    const first = createMission(m0TestScenario, 184);
    const second = createMission(structuredClone(m0TestScenario), 184);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("assigns deterministic event IDs and sequences", () => {
    const mission = createMission(m0TestScenario, "events");

    expect(mission.events).toHaveLength(1);
    expect(mission.events[0]).toMatchObject({
      id: "evt_000001",
      type: "MISSION_STARTED",
      sequence: 1,
      turn: 1,
      phase: "COMMAND",
    });
    expect(mission.next_event_sequence).toBe(2);
    expect(mission.next_runtime_id).toBe(1);
  });

  it("initializes without a browser or DOM", () => {
    expect(globalThis.document).toBeUndefined();
    expect(globalThis.window).toBeUndefined();
    expect(() => createMission(m0TestScenario, "node-only")).not.toThrow();
  });

  it("does not mutate authored scenario data", () => {
    const before = structuredClone(m0TestScenario);

    createMission(m0TestScenario, "immutable-input");

    expect(m0TestScenario).toEqual(before);
  });

  it("rejects invalid graph and entity references", () => {
    const invalid = structuredClone(m0TestScenario);
    invalid.locations[0].connected_location_ids.push("loc_missing");

    expect(() => createMission(invalid, "invalid")).toThrow(
      "loc_orchard_edge references unknown location loc_missing",
    );
  });
});
