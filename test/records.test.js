import { describe, expect, it } from "vitest";

import {
  createCommandRecord,
  createFactionKnowledge,
  createFireRelationshipRecord,
} from "../src/sim/index.js";

describe("foundational records", () => {
  it("represents Command, FireRelationship, and FactionKnowledge as plain data", () => {
    const records = {
      command: createCommandRecord({
        id: "cmd_000001",
        type: "MOVE",
        factionId: "friendly",
        teamId: "team_alpha",
        target: { location_id: "loc_lane" },
        cost: 1,
        issuedTurn: 1,
        issuedPhase: "COMMAND",
      }),
      fireRelationship: createFireRelationshipRecord({
        id: "fire_000001",
        sourceTeamId: "team_enemy",
        sourceLocationId: "loc_stone_house",
        targetTeamId: "team_alpha",
        targetLocationId: "loc_lane",
        effectCategory: "UNRESOLVED",
        startedTurn: 1,
        causedByEventId: "evt_000003",
      }),
      knowledge: createFactionKnowledge(["loc_orchard_edge"]),
    };

    expect(JSON.parse(JSON.stringify(records))).toEqual(records);
    expect(records.command.status).toBe("QUEUED");
    expect(records.fireRelationship.status).toBe("ACTIVE");
    expect(records.knowledge.contact_knowledge_by_id).toEqual({});
  });
});
