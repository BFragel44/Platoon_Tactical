// Frozen M3 rules-27 reader. Source Git commit 7d8984a; regenerate with scripts/buildHistoricalReader.js.

// tmp/rules27-source/src/sim/company/patrols.js
function validatePatrolPlan(locations, plan) {
  const get = (id) => locations[id] ?? locations.find?.((l) => l.id === id);
  if (!plan || Object.keys(plan).some((k) => !["platoon", "primary", "route", "cop", "ccp", "concentration"].includes(k))) throw new Error("Unknown patrol setup field.");
  if (![1, 2, 3].includes(plan.platoon)) throw new Error("Choose one of the three platoons for this patrol.");
  if (get(plan.primary)?.row !== 4) throw new Error("Choose a Row 4 patrol objective.");
  if (!Array.isArray(plan.route) || plan.route.length !== 4 || new Set(plan.route).size !== 4 || plan.route.some((id) => ![2, 3, 4].includes(get(id)?.row))) throw new Error("Choose four different route cards in Rows 2\u20134.");
  if (get(plan.cop)?.row !== 2) throw new Error("Choose a Row 2 Combat Outpost.");
  if (get(plan.ccp)?.row !== 1) throw new Error("Choose a Row 1 casualty collection point.");
  if (!get(plan.concentration) || get(plan.concentration).staging) throw new Error("Choose a battlefield artillery concentration.");
  return structuredClone(plan);
}
function createPatrolProgress(locations, plan) {
  return { plan: validatePatrolPlan(locations, plan), visited: [], objective_visited: false, returned: false };
}
var patrolParticipant = (progress, unit) => unit?.faction === "friendly" && unit.platoon === progress.plan.platoon && !unit.removed && (unit.steps === void 0 || unit.steps.length > 0);
function patrolMoonLight(randomFour) {
  if (!Number.isInteger(randomFour) || randomFour < 1 || randomFour > 4) throw new Error("Moon visibility requires an R#4 result.");
  return randomFour + 1;
}
function patrolMovementReason(progress, unit, { automaticRetreat = false } = {}) {
  if (unit?.faction !== "friendly" || patrolParticipant(progress, unit) || automaticRetreat) return null;
  return "This formation holds a fixed defensive position during the patrol; only automatic retreat permits movement.";
}
function recordPatrolMovement(progress, unit, from, to, locations) {
  const next = structuredClone(progress);
  if (!patrolParticipant(progress, unit) || from === to || progress.returned) return next;
  const get = (id) => locations[id] ?? locations.find?.((l) => l.id === id);
  if (!get(from) || !get(to)) throw new Error("Unknown patrol movement card.");
  if (to === progress.plan.primary) next.objective_visited = true;
  if (to === progress.plan.route[progress.visited.length]) next.visited.push(to);
  if (next.objective_visited && next.visited.length === 4 && get(from).row === 2 && get(to).row === 1) next.returned = true;
  return next;
}
function patrolOutcome(progress, completedTurns, hasPatrolUnits = true) {
  if (progress.returned) return "SUCCESS";
  if (completedTurns >= 10 || !hasPatrolUnits) return "DEFEAT";
  return null;
}
function nextPatrolPlatoons(completed) {
  if (!Array.isArray(completed) || completed.length > 3 || completed.some((p) => ![1, 2, 3].includes(p.platoon) || !["SUCCESS", "DEFEAT"].includes(p.outcome)) || new Set(completed.map((p) => p.platoon)).size !== completed.length) throw new Error("Invalid completed patrol history.");
  return [1, 2, 3].filter((platoon) => !completed.some((p) => p.platoon === platoon));
}

// tmp/rules27-source/src/sim/company/actionDeckData.json
var actionDeckData_default = {
  source: "https://www.gmtgames.com/fof/FoF_Action_Deck.html",
  retrieved: "2026-09-15",
  source_sha256: "64bddda51db2d33c837952f24f1badb6f4d107c24596fe348497b5547813776f",
  schema_version: 1,
  fields: [
    "activated",
    "initiative",
    "word",
    "icons",
    "hq",
    "at",
    "veteran",
    "line",
    "green",
    "ncm-4",
    "ncm-3",
    "ncm-2",
    "ncm-1",
    "ncm0",
    "ncm1",
    "ncm2",
    "ncm3",
    "ncm4",
    "ncm5",
    "ncm6",
    "random2",
    "random3",
    "random4",
    "random5",
    "random6",
    "random7",
    "random8",
    "random9",
    "random10",
    "random11",
    "random12"
  ],
  cards: [
    {
      id: 1,
      fields: [
        6,
        4,
        "Cover",
        "&#10683;",
        "&#x1F4DE",
        9,
        "CC",
        "CC",
        "CC",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    },
    {
      id: 2,
      fields: [
        6,
        4,
        "Contact",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        9,
        "CP",
        "CP",
        "CC",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    },
    {
      id: 3,
      fields: [
        5,
        4,
        "Rally",
        "&#x1F4A3;",
        "",
        9,
        "CP",
        "CP",
        "CP",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    },
    {
      id: 4,
      fields: [
        5,
        4,
        "",
        "&#x1F4A5;",
        "",
        9,
        "CL",
        "CL",
        "CP",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    },
    {
      id: 5,
      fields: [
        5,
        3,
        "",
        "&#10683;",
        "&#x1F4DE",
        9,
        "CL",
        "CL",
        "CP",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        2
      ]
    },
    {
      id: 6,
      fields: [
        5,
        3,
        "Rally",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        8,
        "CF",
        "CL",
        "CL",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        2
      ]
    },
    {
      id: 7,
      fields: [
        5,
        3,
        "Cover",
        "&#x1F4A3;",
        "",
        8,
        "CF",
        "CF",
        "CL",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2
      ]
    },
    {
      id: 8,
      fields: [
        5,
        3,
        "",
        "&#x1F4A5;",
        "",
        8,
        "CF",
        "CF",
        "CF",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2,
        2
      ]
    },
    {
      id: 9,
      fields: [
        5,
        3,
        "Rally",
        "&#10683;",
        "",
        8,
        "PC",
        "PC",
        "CF",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2,
        3
      ]
    },
    {
      id: 10,
      fields: [
        5,
        3,
        "Cover",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "&#x1F4DE",
        8,
        "PC",
        "PC",
        "PC",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2,
        3,
        3
      ]
    },
    {
      id: 11,
      fields: [
        4,
        3,
        "Contact",
        "&#x1F4A3;",
        "",
        7,
        "PC",
        "PC",
        "PC",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        2,
        3,
        3,
        3
      ]
    },
    {
      id: 12,
      fields: [
        4,
        3,
        "Rally",
        "&#x1F4A5;",
        "",
        7,
        "LC",
        "LC",
        "PC",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3
      ]
    },
    {
      id: 13,
      fields: [
        4,
        3,
        "Cover",
        "&#10683;",
        "",
        7,
        "LC",
        "LC",
        "PC",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        4
      ]
    },
    {
      id: 14,
      fields: [
        4,
        3,
        "",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        7,
        "LC",
        "LC",
        "PC",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        4,
        4
      ]
    },
    {
      id: 15,
      fields: [
        4,
        3,
        "Rally",
        "&#x1F4A3;",
        "&#x1F4DE",
        7,
        "FC",
        "LC",
        "LC",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        2,
        2,
        2,
        3,
        3,
        3,
        3,
        4,
        4
      ]
    },
    {
      id: 16,
      fields: [
        4,
        3,
        "",
        "&#x1F4A5;",
        "",
        6,
        "FC",
        "FC",
        "LC",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        1,
        2,
        2,
        2,
        3,
        3,
        3,
        4,
        4,
        4
      ]
    },
    {
      id: 17,
      fields: [
        4,
        2,
        "Contact",
        "&#10683;",
        "",
        6,
        "FC",
        "FC",
        "LC",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        4,
        4,
        4,
        5
      ]
    },
    {
      id: 18,
      fields: [
        4,
        2,
        "Rally",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        6,
        "FC",
        "FC",
        "FC",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        2,
        3,
        3,
        3,
        4,
        4,
        4,
        5
      ]
    },
    {
      id: 19,
      fields: [
        4,
        2,
        "Cover",
        "&#x1F4A3;",
        "",
        6,
        "PP",
        "PP",
        "FC",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        2,
        3,
        3,
        3,
        4,
        4,
        5,
        5
      ]
    },
    {
      id: 20,
      fields: [
        4,
        2,
        "",
        "&#x1F4A5;",
        "&#x1F4DE",
        6,
        "PP",
        "PP",
        "FC",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        2,
        3,
        3,
        4,
        4,
        4,
        5,
        5
      ]
    },
    {
      id: 21,
      fields: [
        4,
        2,
        "Rally",
        "&#10683;",
        "",
        5,
        "PP",
        "PP",
        "PP",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        3,
        3,
        3,
        4,
        4,
        5,
        5,
        6
      ]
    },
    {
      id: 22,
      fields: [
        4,
        2,
        "",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "&#x1F4DE",
        5,
        "PL",
        "PL",
        "PP",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        5,
        6
      ]
    },
    {
      id: 23,
      fields: [
        4,
        2,
        "Cover",
        "&#x1F4A3;",
        "",
        5,
        "PL",
        "PL",
        "PP",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6
      ]
    },
    {
      id: 24,
      fields: [
        4,
        2,
        "Rally",
        "&#x1F4A5;",
        "",
        5,
        "PL",
        "PL",
        "PP",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6
      ]
    },
    {
      id: 25,
      fields: [
        3,
        2,
        "",
        "&#10683;",
        "&#x1F4DE",
        5,
        "PF",
        "PF",
        "PP",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        "MISS",
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        7
      ]
    },
    {
      id: 26,
      fields: [
        3,
        2,
        "Contact",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        4,
        "PF",
        "PF",
        "PL",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        7
      ]
    },
    {
      id: 27,
      fields: [
        3,
        2,
        "Rally",
        "&#x1F4A3;",
        "",
        4,
        "PF",
        "PF",
        "PL",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        6,
        6,
        7,
        7
      ]
    },
    {
      id: 28,
      fields: [
        3,
        2,
        "Cover",
        "&#x1F4A5;",
        "",
        4,
        "PF",
        "PF",
        "PL",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        6,
        6,
        7,
        7
      ]
    },
    {
      id: 29,
      fields: [
        3,
        2,
        "",
        "&#10683;",
        "",
        4,
        "C",
        "C",
        "PL",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        2,
        2,
        3,
        3,
        4,
        5,
        5,
        6,
        6,
        7,
        8
      ]
    },
    {
      id: 30,
      fields: [
        3,
        2,
        "Rally",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        4,
        "C",
        "C",
        "PF",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        "MISS",
        2,
        2,
        3,
        3,
        4,
        5,
        5,
        6,
        6,
        7,
        8
      ]
    },
    {
      id: 31,
      fields: [
        3,
        2,
        "Cover",
        "&#x1F4A3;",
        "",
        3,
        "C",
        "C",
        "PF",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        2,
        2,
        3,
        4,
        4,
        5,
        5,
        6,
        7,
        8,
        8
      ]
    },
    {
      id: 32,
      fields: [
        3,
        2,
        "",
        "&#x1F4A5;",
        "&#x1F4DE",
        3,
        "C",
        "C",
        "PF",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        2,
        2,
        3,
        4,
        4,
        5,
        6,
        7,
        7,
        8,
        8
      ]
    },
    {
      id: 33,
      fields: [
        3,
        2,
        "Rally",
        "&#10683;",
        "",
        3,
        "C",
        "C",
        "C",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        2,
        2,
        3,
        4,
        5,
        5,
        6,
        7,
        7,
        8,
        9
      ]
    },
    {
      id: 34,
      fields: [
        3,
        2,
        "Cover",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "",
        3,
        "P",
        "C",
        "C",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        2,
        3,
        3,
        4,
        5,
        5,
        6,
        7,
        7,
        8,
        9
      ]
    },
    {
      id: 35,
      fields: [
        3,
        1,
        "Cover",
        "&#x1F4A3;",
        "&#x1F4DE",
        3,
        "P",
        "P",
        "C",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        "MISS",
        2,
        3,
        3,
        4,
        5,
        5,
        6,
        7,
        7,
        9,
        9
      ]
    },
    {
      id: 36,
      fields: [
        3,
        1,
        "Rally",
        "&#x1F4A5;",
        "",
        2,
        "P",
        "P",
        "C",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        2,
        3,
        3,
        4,
        5,
        6,
        6,
        7,
        8,
        9,
        9
      ]
    },
    {
      id: 37,
      fields: [
        2,
        1,
        "Cover",
        "&#10683;",
        "",
        2,
        "P",
        "P",
        "C",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        2,
        3,
        3,
        4,
        5,
        6,
        6,
        7,
        8,
        9,
        10
      ]
    },
    {
      id: 38,
      fields: [
        2,
        1,
        "Rally",
        "&#x1F4A3;",
        "",
        2,
        "L",
        "P",
        "P",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        2,
        3,
        4,
        4,
        5,
        6,
        7,
        8,
        8,
        9,
        10
      ]
    },
    {
      id: 39,
      fields: [
        2,
        1,
        "",
        "&#x1FA96;&#x1FA96;&#x1FA96;&#x1FA96;",
        "&#x1F4DE",
        2,
        "P",
        "P",
        "C",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "MISS",
        2,
        3,
        4,
        4,
        5,
        6,
        7,
        8,
        8,
        9,
        10
      ]
    },
    {
      id: 40,
      fields: [
        2,
        1,
        "Contact",
        "&#x1F4A5;",
        "",
        2,
        "L",
        "P",
        "P",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        4,
        5,
        6,
        7,
        8,
        8,
        9,
        10
      ]
    },
    {
      id: 41,
      fields: [
        2,
        1,
        "Contact",
        "&#10683;",
        "",
        1,
        "L",
        "L",
        "P",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        5,
        6,
        7,
        8,
        9,
        10,
        11
      ]
    },
    {
      id: 42,
      fields: [
        2,
        1,
        "Rally",
        "&#x1F4A5;&#x1F4A5;&#x1F4A5;",
        "",
        1,
        "L",
        "L",
        "P",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        6,
        7,
        8,
        9,
        10,
        11
      ]
    },
    {
      id: 43,
      fields: [
        2,
        1,
        "Cover",
        "&#10683;",
        "&#x1F4DE",
        1,
        "F",
        "L",
        "P",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        7,
        8,
        9,
        10,
        11
      ]
    },
    {
      id: 44,
      fields: [
        2,
        1,
        "",
        "&#x1F4A5;&#x1F4A5;&#x1F4A5;",
        "",
        1,
        "F",
        "L",
        "P",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        7,
        9,
        9,
        10,
        11
      ]
    },
    {
      id: 45,
      fields: [
        2,
        1,
        "Rally",
        "&#10683;",
        "",
        1,
        "F",
        "F",
        "L",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        9,
        10,
        11
      ]
    },
    {
      id: 46,
      fields: [
        2,
        1,
        "",
        "&#x1F4A5;&#x1F4A5;&#x1F4A5;",
        "",
        0,
        "F",
        "F",
        "L",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ]
    },
    {
      id: 47,
      fields: [
        1,
        0,
        "Contact",
        "&#10683;",
        "&#x1F4DE",
        0,
        "F",
        "F",
        "L",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ]
    },
    {
      id: 48,
      fields: [
        1,
        0,
        "",
        "&#x1F4A5;&#x1F4A5;&#x1F4A5;",
        "",
        0,
        "A",
        "F",
        "F",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ]
    },
    {
      id: 49,
      fields: [
        1,
        0,
        "",
        "Jam!",
        "",
        0,
        "A",
        "A",
        "F",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "PIN",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ]
    },
    {
      id: 50,
      fields: [
        1,
        0,
        "",
        "Short!",
        "",
        0,
        "A",
        "A",
        "A",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        "HIT",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ]
    },
    {
      id: 51,
      fields: [
        0,
        0,
        "Reshuffle",
        "",
        "",
        0,
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    }
  ]
};

// tmp/rules27-source/src/sim/rng.js
function hashSeed(seed) {
  const text = String(seed);
  let hash = 2166136261;
  for (let index2 = 0; index2 < text.length; index2 += 1) {
    hash ^= text.charCodeAt(index2);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function createRng(seed) {
  if (seed === void 0 || seed === null || String(seed).length === 0) {
    throw new TypeError("seed must be a non-empty string or number");
  }
  const normalizedSeed = String(seed);
  return {
    seed: normalizedSeed,
    state: hashSeed(normalizedSeed),
    draw_count: 0
  };
}
function drawRandom(rng) {
  let state = rng.state + 1831565813 >>> 0;
  let value = state;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  value = ((value ^ value >>> 14) >>> 0) / 4294967296;
  return {
    rng: {
      ...rng,
      state,
      draw_count: rng.draw_count + 1
    },
    value
  };
}

// tmp/rules27-source/src/sim/company/skills.js
var SKILLS = {
  GENERAL_INITIATIVE: { label: "General Initiative", cost: 2, actions: ["SKILL_GENERAL"], free: true },
  PARALYZED_ASSAULT: { label: "Paralyzed to Assault", cost: 2, actions: ["SKILL_PARALYZED_A"] },
  PARALYZED_FIRE: { label: "Paralyzed to Fire", cost: 1, actions: ["SKILL_PARALYZED_F"] },
  SPAWN_TEAM: { label: "Spawn Team", cost: 1, actions: ["SKILL_SPAWN_A", "SKILL_SPAWN_F"], free: true },
  EXTRA_DRAW: { label: "Extra Draw", cost: 1, actions: ["SKILL_EXTRA_AUTOMATIC", "SPOT", "SEEK_COVER", "SEEK_COVER_UPPER", "CONCENTRATE", "INFILTRATE", "INFILTRATE_WITHIN", "GRENADE", "RIFLE_GRENADE", "WP_ATTACK", "RALLY", "RECOVER", "RECONSTITUTE", "CALL_ARTILLERY", "CALL_ARTILLERY_WP"], extra: true },
  AUTO_SPOT: { label: "Auto Spot", cost: 1, actions: ["SPOT"], icon: "spot" },
  AUTO_COVER: { label: "Auto Cover", cost: 1, actions: ["SEEK_COVER", "SEEK_COVER_UPPER"], icon: "cover" },
  AUTO_CONCENTRATE: { label: "Auto Concentrate Fire", cost: 1, actions: ["CONCENTRATE"], icon: "spot" },
  AUTO_INFILTRATE: { label: "Auto Infiltrate", cost: 1, actions: ["INFILTRATE", "INFILTRATE_WITHIN"], icon: "infiltrate" },
  AUTO_GRENADE: { label: "Auto Grenade", cost: 1, actions: ["GRENADE", "SKILL_GRENADE_RETURN"], icon: "grenade" }
};
var counters = [["SPAWN_TEAM", "AUTO_COVER"], ["SPAWN_TEAM", "AUTO_CONCENTRATE"], ["SPAWN_TEAM", "AUTO_GRENADE"], ["GENERAL_INITIATIVE", "EXTRA_DRAW"], ["SPAWN_TEAM", "AUTO_COVER"], ["GENERAL_INITIATIVE", "EXTRA_DRAW"], ["GENERAL_INITIATIVE", "EXTRA_DRAW"], ["AUTO_INFILTRATE"], ["AUTO_INFILTRATE", "AUTO_GRENADE"], ["PARALYZED_FIRE", "AUTO_CONCENTRATE"], ["PARALYZED_ASSAULT", "AUTO_SPOT"], ["PARALYZED_ASSAULT", "AUTO_SPOT"]];
function buySkills(s, purchases, points, { retain = false } = {}) {
  const existing = retain ? structuredClone(s.skills ?? []) : [];
  if (!Array.isArray(purchases)) throw new Error("Skill purchases must be a list.");
  if (purchases.length + existing.length > counters.length) throw new Error("Skill purchases exceed the printed counter mix.");
  const counts = {};
  for (const p of existing) counts[p.holder] = (counts[p.holder] ?? 0) + 1;
  for (const p of purchases) {
    const u = s.units[p.holder], skill = SKILLS[p.type];
    if (!skill || !u || u.faction !== "friendly" || u.removed || !u.steps.length || !["HQ", "STAFF"].includes(u.kind) || u.command_role === "higher_hq") throw new Error("Assign a published skill to a surviving company HQ or staff.");
    if ((counts[u.id] = (counts[u.id] ?? 0) + 1) > 3) throw new Error("An HQ or staff can hold at most three skills.");
    points -= skill.cost;
    if (points < 0) throw new Error("Not enough attempt experience for skills.");
  }
  const assigned = [], used = new Set(existing.map((p) => p.counter - 1));
  function match(n) {
    if (n === purchases.length) return true;
    for (let i = 0; i < counters.length; i++) if (!used.has(i) && counters[i].includes(purchases[n].type)) {
      used.add(i);
      assigned[n] = i;
      if (match(n + 1)) return true;
      used.delete(i);
    }
    return false;
  }
  if (!match(0)) throw new Error("Skill purchases exceed the printed counter mix.");
  s.skills = [...existing, ...purchases.map((p, i) => ({ ...p, id: `skill_${s.attempt_number + 1}_${assigned[i] + 1}`, counter: assigned[i] + 1, used: false }))];
  s.automatic_skills = {};
  return points;
}
function skillOptions(s, u, type) {
  return (s.skills ?? []).filter((p) => !p.used && SKILLS[p.type].actions.includes(type) && !Object.entries(s.automatic_skills ?? {}).some(([id, skill]) => skill === p.id && id !== u.id)).filter((p) => {
    const holder = s.units[p.holder];
    return holder && !holder.removed && holder.steps.length && (holder.id === u.id || holder.kind === "HQ" && holder.platoon !== null && holder.platoon === u.platoon);
  }).map((p) => ({ ...p, label: SKILLS[p.type].label }));
}

// tmp/rules27-source/src/sim/company/core.js
var values = (map) => Object.values(map).sort((a, b) => a.id.localeCompare(b.id));
var live = (u) => u && u.steps.length > 0 && !u.removed;
var friendly = (u) => u.faction === "friendly";
var good = (u) => live(u) && !u.pinned && u.cohesion === "GOOD";
var expMod = (u) => ({ Green: -1, Line: 0, Veteran: 1 })[u.experience] ?? 0;
var visible = (s, u) => friendly(u) || s.knowledge.spotted[u.id];
function emit(s, type, text, details = {}, hidden = false) {
  const event = {
    id: `event_${s.events.length + 1}`,
    sequence: s.events.length + 1,
    turn: s.turn,
    phase: s.phase,
    impulse: s.impulse?.id ?? null,
    type,
    text,
    ...details,
    hidden
  };
  s.events.push(event);
  if (type === "UNIT_MOVED" && s.patrol && s.units[details.actor]) s.patrol = recordPatrolMovement(s.patrol, s.units[details.actor], details.from, details.target, s.locations);
  return event;
}
function shuffle(s, items) {
  const result2 = [...items];
  for (let i = result2.length - 1; i > 0; i--) {
    const draw2 = drawRandom(s.rng);
    s.rng = draw2.rng;
    const j = Math.floor(draw2.value * (i + 1));
    [result2[i], result2[j]] = [result2[j], result2[i]];
  }
  return result2;
}
var cards = Object.fromEntries(actionDeckData_default.cards.map(({ id, fields: f }) => [id, {
  id,
  activated: f[0],
  initiative: f[1],
  word: f[2],
  spot: f[3].includes("10683"),
  grenade: f[3].includes("1F4A3"),
  infiltrate: f[3].includes("1FA96"),
  burst: f[3].includes("1F4A5"),
  multi: f[3].split("1F4A5").length > 2,
  jam: f[3] === "Jam!",
  short: f[3] === "Short!",
  hq: !!f[4],
  at: f[5],
  hit: { Veteran: f[6], Line: f[7], Green: f[8] },
  combat: f.slice(9, 20),
  random: f.slice(20, 31)
}]));
function newDeck(s) {
  return { order: shuffle(s, actionDeckData_default.cards.map((c) => c.id)), discard: [], reshuffles: 0, draws: 0 };
}
function draw(s, count, purpose, hidden = false) {
  const batch = [];
  let reshuffle = false;
  for (let i = 0; i < count; ) {
    if (!s.deck.order.length) {
      s.deck.order = shuffle(s, s.deck.discard);
      s.deck.discard = [];
      s.deck.reshuffles++;
      reshuffle = false;
    }
    const id = s.deck.order.shift();
    s.deck.discard.push(id);
    s.deck.draws++;
    if (id === 51) {
      reshuffle = true;
      continue;
    }
    batch.push(cards[id]);
    i++;
  }
  emit(
    s,
    "CARDS_DRAWN",
    `${purpose}: ${batch.map((c) => c.id).join(", ")}.`,
    { purpose, card_ids: batch.map((c) => c.id) },
    hidden
  );
  if (reshuffle) {
    s.deck.order = shuffle(s, [...s.deck.order, ...s.deck.discard]);
    s.deck.discard = [];
    s.deck.reshuffles++;
    emit(s, "DECK_SHUFFLED", "Action deck reshuffled after completing the draw batch.", {}, hidden);
  }
  return batch;
}
function randomNumber(s, n, purpose, hidden = false) {
  if (n <= 1) return 1;
  if (n > 12) throw new Error("Action card random range exceeds 12");
  return draw(s, 1, purpose, hidden)[0].random[n - 2];
}
function pick(s, items, purpose, hidden = false) {
  if (items.length > 12) {
    const chosen = shuffle(s, items)[0];
    emit(s, "RANDOM_SELECTION", `${purpose}: seeded selection from ${items.length} candidates.`, {}, hidden);
    return chosen;
  }
  return items[randomNumber(s, items.length, purpose, hidden) - 1];
}
function attempt(s, u, count, icon, purpose, hidden = !visible(s, u), checkCards = null, automatic = !s.impulse, grenadeReturn = false) {
  const leader = s.mission_rules?.leaderBonus && u.faction === "enemy" && values(s.units).some((v) => v.kind === "LEADER" && v.faction === "enemy" && live(v) && !v.pinned && v.cohesion === "GOOD" && v.location === u.location && v.cover === u.cover);
  let skill = s.active_skill;
  if (!skill && automatic && friendly(u) && s.automatic_skills?.[u.id]) {
    const assigned = s.automatic_skills[u.id], reserved = s.skills.find((p) => p.id === assigned);
    const action = reserved?.type === "AUTO_GRENADE" ? "SKILL_GRENADE_RETURN" : "SKILL_EXTRA_AUTOMATIC";
    if (action === "SKILL_EXTRA_AUTOMATIC" || grenadeReturn) {
      const p = skillOptions(s, u, action).find((p2) => p2.id === assigned);
      delete s.automatic_skills[u.id];
      if (p) {
        s.skills.find((v) => v.id === p.id).used = true;
        skill = { actor: u.id, extra: action === "SKILL_EXTRA_AUTOMATIC", icon: action === "SKILL_GRENADE_RETURN" ? "grenade" : void 0, applied: false };
        emit(s, "SKILL_USED", `${u.name}: ${p.type === "AUTO_GRENADE" ? "Auto Grenade on free return" : "Extra Draw on automatic attempt"}.`, { actor: u.id, holder: p.holder, skill_id: p.id, skill: p.type, automatic: true });
      }
    }
  }
  const applies = skill && !skill.applied && skill.actor === u.id && (skill.extra || skill.icon === icon);
  const batch = draw(s, Math.max(1, count + expMod(u) + (leader ? 1 : 0)) + (applies && skill.extra ? 1 : 0), purpose, hidden);
  const successes = batch.filter((c) => c[icon] || c.word.toLowerCase() === icon).length;
  if (checkCards?.(batch) === false) {
    if (applies) skill.applied = true;
    return 0;
  }
  if (applies) {
    skill.applied = true;
    return skill.extra ? successes : Math.max(1, successes);
  }
  return successes;
}
function result(before, next, extra = {}) {
  return { state: next, events: next.events.slice(before.events.length), ...extra };
}
function transportReason(s, u, extraAssets = 0) {
  if (!s.mission_rules?.specialEnemies) return null;
  const assets = u.radios.length + Object.values(u.assets).reduce((n, q) => n + q, 0) + extraAssets;
  if (assets > 6 * u.steps.length) return "Over transport capacity: each step can carry six assets. Drop equipment before moving.";
  if (s.casualties.filter((c) => c.carrier === u.id).length > u.steps.length) return "Over transport capacity: each step can carry one casualty. Unload before moving.";
  return null;
}
function dropLoad(s, u, reason = "removed") {
  for (const net of u.radios) s.assets.push({ id: `asset_${s.next_id++}`, type: "RADIO", net, source_unit: u.id, location: u.location, cover: u.cover, faction: u.faction });
  for (const [key, quantity] of Object.entries(u.assets)) if (quantity) s.assets.push({ id: `asset_${s.next_id++}`, type: "EQUIPMENT", key, quantity, source_unit: u.id, location: u.location, cover: u.cover, faction: u.faction });
  if (s.mission_rules?.ammo === "tracked") {
    for (const [key, quantity] of Object.entries(u.ammo ?? {})) if (quantity) s.assets.push({ id: `asset_${s.next_id++}`, type: "AMMO", key, quantity, source_unit: u.id, location: u.location, cover: u.cover, faction: u.faction });
  }
  for (const c of s.casualties.filter((c2) => c2.carrier === u.id)) {
    c.carrier = null;
    c.location = u.location;
    c.cover = u.cover;
  }
  u.radios = [];
  u.assets = {};
  if (s.mission_rules?.ammo === "tracked") {
    u.ammo = {};
    u.out_of_ammo = true;
  }
  emit(s, "ASSETS_DROPPED", `${visible(s, u) ? u.name : "Enemy formation"}: carried load left at its current position (${reason}).`, { actor: visible(s, u) ? u.id : null, location: u.location, reason }, !visible(s, u));
}

// tmp/rules27-source/src/sim/company/terrain.js
var DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
var borders = (open = []) => Object.fromEntries(DIRECTIONS.map((d) => [d, open.includes(d) ? "white" : "dark"]));
var direction = (dr, dc) => dr > 0 ? dc > 0 ? "NE" : dc < 0 ? "NW" : "N" : dr < 0 ? dc > 0 ? "SE" : dc < 0 ? "SW" : "S" : dc > 0 ? "E" : "W";
var whiteBorder = (l, dr, dc) => l.borders?.[direction(dr, dc)] === "white";
var terrainProtection = (target, origin) => target.open_protection !== void 0 && (target.id === origin.id || whiteBorder(target, origin.row - target.row, origin.col - target.col)) ? target.open_protection : target.protection;

// tmp/rules27-source/src/sim/company/patrolEvents.js
var directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
var distance = (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
var stock = (s, letters) => letters.flatMap((type) => Array(Math.max(0, 16 - values(s.contacts).filter((pc) => !pc.resolved && pc.type === type).length)).fill(type));
function addPatrolContact(s, location, { questionSide = false, letters } = {}) {
  const available2 = stock(s, letters ?? (location.row >= 4 ? ["A"] : location.row >= 2 ? ["B", "C"] : []));
  if (!available2.length) return null;
  const type = pick(s, available2, "Patrol remaining contact marker", true), id = `pc_patrol_${s.next_id++}`;
  const contact = { id, location: location.id, type, resolved: false, question_side: questionSide || location.row === 2 || location.row === 3, revealed: false };
  s.contacts[id] = contact;
  return contact;
}
function expandPatrolCard(s, row, col) {
  const id = `r${row}c${col}`;
  if (s.locations[id]) return s.locations[id];
  const drawn = [];
  let card, elevation = 1;
  do {
    card = s.terrain_deck.pop();
    if (!card) {
      s.terrain_deck.push(...drawn.reverse());
      return null;
    }
    drawn.push(card);
    if (card.terrain === "hill") elevation++;
  } while (card.terrain === "hill");
  const l = { ...structuredClone(card), id, row, col, name: `${row}.${col} ${card.name}${elevation > 1 ? " / Hill" : ""}`, terrain_card: card.id, hills: drawn.slice(0, -1).map((c) => c.id), elevation, borders: elevation > 1 ? borders() : structuredClone(card.borders), staging: false, known: true, outside_boundary: true, covers: [], smoke: false };
  s.locations[id] = l;
  addPatrolContact(s, l);
  emit(s, "MAP_EXPANDED", `Lost patrol revealed terrain beyond the boundary: ${l.name}.`, { location: id, terrain_card: card.id });
  return l;
}
function patrolHoldReason(s, target) {
  if (!s.patrol_hold) return null;
  const knownUnit = values(s.units).some((u) => live(u) && u.location === target && (friendly(u) || s.knowledge.spotted[u.id]));
  const contact = values(s.contacts).some((pc) => pc.location === target && !pc.resolved);
  return knownUnit || contact ? null : "Hold up!: choose a card containing a known unit or an unresolved contact marker this turn.";
}
function applyPatrolEvent(s, side, code, event) {
  if (!s.patrol) return;
  if (side === "friendly") {
    if (code === "LOST") {
      const eligible = values(s.units).filter((u) => live(u) && patrolParticipant(s.patrol, u));
      if (eligible.length) {
        const u = pick(s, eligible, "Lost patrol formation"), from = u.location, origin = s.locations[from], [dr, dc] = directions[randomNumber(s, 8, "Lost patrol direction") - 1];
        const target = s.locations[`r${origin.row + dr}c${origin.col + dc}`] ?? expandPatrolCard(s, origin.row + dr, origin.col + dc);
        if (target) {
          u.location = target.id;
          u.cover = null;
          u.fire = null;
          u.fire_direction = null;
          u.fire_effect = null;
          u.indirect = null;
          u.exposed = true;
          emit(s, "UNIT_MOVED", `${u.name} lost its way and moved to ${target.name}; exposed until cleanup.`, { actor: u.id, from, target: target.id, exposed: true, faction: "friendly", forced: true });
        } else emit(s, "PATROL_EVENT_UNAVAILABLE", "Lost in the Dark: no terrain card remains for expansion.");
      } else emit(s, "PATROL_EVENT_UNAVAILABLE", "Lost in the Dark: no patrol formation remains.");
    }
    if (code === "HOLD_PATROL") s.patrol_hold = true;
    if (code === "RAIN") {
      s.visibility.weather += 2;
      s.patrol_rain = (s.patrol_rain ?? 0) + 2;
    }
    if (code === "NO_MORTAR") s.support_unavailable.push("mortar");
    if (code === "ADVANCE_ROUTE") {
      event.waypoint = s.patrol.plan.route[s.patrol.visited.length] ?? null;
      event.ignored = !event.waypoint;
    }
  } else if (code === "SHIFTING_LINES") {
    const previous = values(s.contacts).filter((pc) => !pc.resolved && s.locations[pc.location].row === 4);
    for (const pc of previous) {
      pc.resolved = true;
      pc.removed_by_event = true;
    }
    for (const pc of previous) addPatrolContact(s, s.locations[pc.location], { questionSide: true, letters: ["A", "B", "C"] });
  }
}
function finishPatrolEvents(s) {
  if (!s.patrol) return;
  for (const event of s.hq_events.filter((e) => e.side === "friendly" && e.turn === s.turn)) {
    if (event.code === "ADVANCE_ROUTE" && event.waypoint) event.completed = s.events.some((e) => e.turn === s.turn && e.type === "UNIT_MOVED" && patrolParticipant(s.patrol, s.units[e.actor]) && s.locations[e.from] && s.locations[e.target] && distance(s.locations[e.target], s.locations[event.waypoint]) < distance(s.locations[e.from], s.locations[event.waypoint]));
    if (event.completed && ["ADVANCE_ROUTE", "COMM"].includes(event.code)) {
      const key = `patrol_${s.attempt_number}_${s.turn}_${event.code}`;
      if (!s.achievements.some((a) => a.key === key)) {
        s.achievements.push({ key, points: 1, text: "Patrol higher HQ obligation completed", turn: s.turn, platoon: s.patrol.plan.platoon });
        emit(s, "ACHIEVEMENT", "Patrol higher HQ obligation completed: +1 point.", { key, points: 1, platoon: s.patrol.plan.platoon });
      }
    }
  }
  if (s.patrol_rain) s.visibility.weather = Math.max(0, s.visibility.weather - s.patrol_rain);
  s.patrol_rain = 0;
  s.patrol_hold = false;
}

// tmp/rules27-source/src/sim/company/visibility.js
function visibilityAt(visibility = {}, reductions = []) {
  const light = visibility.light ?? 0, weather = visibility.weather ?? 0;
  if (!Number.isInteger(light) || light < 0 || !Number.isInteger(weather) || weather < 0 || reductions.some((n) => !Number.isInteger(n) || n < 0)) throw new Error("Invalid visibility or illumination value.");
  const reduction = Math.max(0, ...reductions), effectiveLight = Math.max(0, light - reduction);
  return {
    light,
    weather,
    reduction,
    effective_light: effectiveLight,
    modifier: effectiveLight + weather,
    limited: light + weather >= 2,
    illuminated: reduction > 0 && weather < 2
  };
}
function visibilityLosLimit(visibility, targetReductions = [], normalLimit = 3) {
  const target = visibilityAt(visibility, targetReductions);
  return target.limited && !target.illuminated ? Math.min(1, normalLimit) : normalLimit;
}
function visibilityCommandLimits(visibility = {}, experience = "Line") {
  const limited = visibilityAt(visibility).limited;
  const saved = (limited ? { Green: 2, Line: 4, Veteran: 6 } : { Green: 3, Line: 6, Veteran: 9 })[experience];
  if (saved === void 0) throw new Error("Unknown command experience.");
  return { spend: limited ? 4 : 6, saved };
}
function visibilityFireModifier(visibility, reductions, kind) {
  const affected = ["basic", "sniper", "on_map_indirect"].includes(kind);
  if (!affected && !["grenade", "off_map", "mine", "claymore", "booby_trap", "air_strike"].includes(kind)) throw new Error("Unknown fire effect for visibility.");
  return affected ? visibilityAt(visibility, reductions).modifier : 0;
}
function illuminationReductionsAt(markers, target, locations) {
  const destination = locations[target];
  if (!destination) throw new Error("Unknown illumination target.");
  const reductions = [];
  for (const marker of markers) {
    const origin = locations[marker.location];
    if (!origin || !Number.isInteger(marker.center) || marker.center < 0 || marker.adjacent !== void 0 && (!Number.isInteger(marker.adjacent) || marker.adjacent < 0)) throw new Error("Invalid illumination marker.");
    const distance3 = Math.max(Math.abs(origin.row - destination.row), Math.abs(origin.col - destination.col));
    if (distance3 === 0) reductions.push(marker.center);
    else if (distance3 === 1 && marker.adjacent) reductions.push(marker.adjacent);
  }
  return reductions;
}
var patrolInitiative = (commands) => {
  if (!Number.isInteger(commands) || commands < 0) throw new Error("Invalid General Initiative allowance.");
  return Math.floor(commands / 2);
};
var ILLUMINATION_PROFILES = Object.freeze({ artillery: { center: 3, adjacent: 1 }, mortar: { center: 2, adjacent: 1 }, handheld: { center: 1, adjacent: 0 } });
function placeIllumination(state, location, delivery, source = null) {
  const profile = ILLUMINATION_PROFILES[delivery];
  if (!profile || !state.visibility || !state.locations[location]) throw new Error("Unsupported illumination delivery.");
  const marker = { type: "ILLUMINATION", location, delivery, source, ...profile };
  state.markers.push(marker);
  return marker;
}

// tmp/rules27-source/src/sim/company/commandRoles.js
var companyCommander = (s) => Object.values(s.units).find((u) => u.command_role === "company_commander") ?? s.units.co;
var isCompanyCommander = (u) => u?.command_role ? u.command_role === "company_commander" : u?.id === "co";
var canActivateSubordinates = (u) => u?.capabilities?.activate_subordinates ?? isCompanyCommander(u);
var canCommandCompany = (u) => u?.capabilities?.company_orders ?? (isCompanyCommander(u) || u?.kind === "STAFF");
var commandHub = (s) => Object.values(s.units).find((u) => u.command_role === "company_commander") ?? s.units.co;
var higherCommander = (s) => Object.values(s.units).filter((u) => u.command_role === "higher_hq" && u.steps.length && !u.removed && u.cohesion === "GOOD").sort((a, b) => (a.capabilities?.higher_priority ?? 99) - (b.capabilities?.higher_priority ?? 99) || a.id.localeCompare(b.id))[0];
var successionPriority = (u) => u?.capabilities?.succession_priority ?? (u?.id === "xo" ? -1 : u?.kind === "HQ" ? 0 : u?.id === "artyfo" ? 1 : u?.kind === "STAFF" ? 2 : 99);

// tmp/rules27-source/src/sim/company/ammunition.js
var AMMO_CAPACITY = { MG: 6, MTR: 2, RKT: 3, GUN: 3 };
function ammoLoadReason(s, u, extra = {}) {
  if (s.mission_rules?.ammo !== "tracked" || !u.ammo) return null;
  if (u.kind === "MORTAR" && u.steps.length > 1) return null;
  for (const [type, quantity] of Object.entries(u.ammo)) {
    const maximum = (AMMO_CAPACITY[type] ?? 3) * u.steps.length;
    if (!Object.values(extra).some(Boolean) && quantity > maximum) continue;
    if (quantity + (extra[type] ?? 0) > maximum) return `Over ${type} ammunition capacity (${maximum}); drop or transfer ammunition before moving.`;
  }
  return null;
}
function dropExcessAmmunition(s, u) {
  if (s.mission_rules?.ammo !== "tracked" || u.kind === "MORTAR" && u.steps.length > 1) return;
  for (const [key, quantity] of Object.entries(u.ammo ?? {})) {
    const maximum = (AMMO_CAPACITY[key] ?? 3) * u.steps.length, excess = Math.max(0, quantity - maximum);
    if (!excess) continue;
    s.assets.push({ id: `asset_${s.next_id++}`, type: "AMMO", key, quantity: excess, source_unit: u.id, location: u.location, cover: u.cover, faction: u.faction });
    u.ammo[key] -= excess;
    emit(s, "AMMO_DROPPED", `${visible(s, u) ? u.name : "Enemy formation"} left ${excess} excess ${key} ammunition before moving.`, { actor: visible(s, u) ? u.id : null, location: u.location, key, quantity: excess }, !visible(s, u));
  }
}
function expendAmmunition(s, u, key, quantity = 1, reason = "fire") {
  if (s.mission_rules?.ammo !== "tracked" || u.ammo?.[key] === void 0) return true;
  if (u.ammo[key] < quantity) return false;
  u.ammo[key] -= quantity;
  emit(s, "AMMO_EXPENDED", `${visible(s, u) ? u.name : "Enemy formation"} expended ${quantity} ${key} ammunition.`, { actor: visible(s, u) ? u.id : null, location: u.location, key, quantity, remaining: visible(s, u) ? u.ammo[key] : null, reason }, !visible(s, u));
  if (u.ammo[key] === 0) {
    u.out_of_ammo = true;
    if (u.steps.length === 1 && ["S", "A/S"].includes(u.fire_team_vof)) {
      u.cohesion = "F";
      u.fire = null;
    }
    emit(s, "OUT_OF_AMMO", `${visible(s, u) ? u.name : "Enemy formation"} is out of ${key} ammunition.`, { actor: visible(s, u) ? u.id : null, location: u.location, key }, !visible(s, u));
  }
  return true;
}
function pickUpAmmunition(s, u, asset) {
  const capacity = u.kind === "MORTAR" && u.steps.length > 1 ? Infinity : (AMMO_CAPACITY[asset.key] ?? 3) * u.steps.length;
  const available2 = Math.max(0, capacity - (u.ammo?.[asset.key] ?? 0));
  const quantity = Math.min(asset.quantity, available2);
  if (!quantity) throw new Error(`No ${asset.key} ammunition carrying capacity remains.`);
  u.ammo ??= {};
  u.ammo[asset.key] = (u.ammo[asset.key] ?? 0) + quantity;
  if (s.mission_rules?.reattempts) {
    const source = s.units[asset.source_unit];
    u.initial_resources ??= { radios: [], assets: {}, ammo: {} };
    if (source?.initial_resources && source.id !== u.id) {
      const stock2 = source.initial_resources.ammo, transferred = Math.min(stock2[asset.key] ?? 0, quantity);
      stock2[asset.key] = (stock2[asset.key] ?? 0) - transferred;
      u.initial_resources.ammo[asset.key] = (u.initial_resources.ammo[asset.key] ?? 0) + transferred;
    } else if (!source) u.initial_resources.ammo[asset.key] = Math.max(u.initial_resources.ammo[asset.key] ?? 0, u.ammo[asset.key]);
  }
  u.out_of_ammo = false;
  asset.quantity -= quantity;
  if (!asset.quantity) s.assets = s.assets.filter((a) => a.id !== asset.id);
  emit(s, "AMMO_RESUPPLIED", `${u.name} picked up ${quantity} ${asset.key} ammunition.`, { actor: u.id, location: u.location, key: asset.key, quantity });
}

// tmp/rules27-source/src/sim/company/phoneNetwork.js
function phoneConnected(s, from, to) {
  if (from === to) return true;
  const nodes = new Set(values(s.locations).filter((l) => l.staging).map((l) => l.id));
  for (const line of s.phone_lines ?? []) if (!line.cut) nodes.add(line.location);
  for (const unit of values(s.units).filter((u) => live(u) && u.radios?.includes("CO_PHONE"))) nodes.add(unit.location);
  for (const asset of s.assets ?? []) if (asset.type === "RADIO" && asset.net === "CO_PHONE" && !asset.destroyed) nodes.add(asset.location);
  if (!nodes.has(from) || !nodes.has(to)) return false;
  const queue = [from], seen = new Set(queue);
  while (queue.length) {
    const id = queue.shift(), a = s.locations[id];
    for (const next of nodes) {
      if (seen.has(next)) continue;
      const b = s.locations[next];
      if (a.staging && b.staging || Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col)) === 1) {
        if (next === to) return true;
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}
function layPhoneLine(s, u) {
  if (s.mission_rules?.communications !== "phones" || !u.assets?.phone_line || s.locations[u.location].staging || s.phone_lines.some((line) => line.location === u.location && !line.cut)) return;
  u.assets.phone_line--;
  s.phone_lines.push({ id: `phone_line_${s.next_id++}`, location: u.location, owner: u.id, cut: false });
  emit(s, "PHONE_LINE_LAID", `${u.name} laid a phone line at ${s.locations[u.location].name}.`, { actor: u.id, location: u.location });
}
function damagePhoneLines(s) {
  if (s.mission_rules?.communications !== "phones") return;
  for (const line of s.phone_lines.filter((line2) => !line2.cut)) {
    const support = s.support.some((f) => f.status === "ACTIVE" && f.location === line.location);
    const enemies = values(s.units).some((u) => u.faction === "enemy" && good(u) && u.location === line.location);
    const friendlies = values(s.units).some((u) => u.faction === "friendly" && good(u) && u.location === line.location);
    const cut = (cause) => {
      line.cut = true;
      emit(s, "PHONE_LINE_CUT", `Phone line cut at ${s.locations[line.location].name}.`, { location: line.location, cause }, !friendlies);
    };
    if (support && randomNumber(s, 2, "Phone line incoming damage check", !friendlies) === 1) cut("incoming fire");
    if (!line.cut && enemies && !friendlies && randomNumber(s, 3, "Phone line enemy discovery check", true) <= 2) cut("enemy action");
  }
}

// tmp/rules27-source/src/sim/company/battlefield.js
var distance2 = (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
var occupants = (s, id) => values(s.units).filter((u) => live(u) && u.location === id);
var adjacent = (s, id) => values(s.locations).filter((l) => l.id !== id && distance2(l, s.locations[id]) === 1);
var coverOf = (s, u) => s.locations[u.location].covers.find((c) => c.id === u.cover);
var enclosedWeaponCover = (c) => ["Building", "Light Building", "Strong Building", "Upper Story", "Church Tower", "Bunker", "Deep Bunker", "Cave", "Pillbox"].includes(c?.type);
var temporaryMortarFire = (s) => values(s.units).filter((u) => u.temporary_pdf).map((u) => ({ source: u.id, origin: u.temporary_pdf.origin, target: u.temporary_pdf.target, value: null, pdf_only: true, indirect: false, reason: "TEMPORARY_MORTAR_PDF" }));
var unitElevation = (s, u) => s.locations[u.location].elevation + (coverOf(s, u)?.elevation ?? 0);
function coverAvailable(s, u, c, location = u.location) {
  const others = occupants(s, location).filter((t) => t.id !== u.id && t.cover === c.id);
  return !others.some((t) => t.faction !== u.faction) && (!c.capacity || others.reduce((n, t) => n + t.steps.length, 0) + u.steps.length <= c.capacity);
}
var screen = (s, id) => s.locations[id].smoke || s.support.some((f) => f.status === "ACTIVE" && f.location === id);
function explainLos(s, from, to, max = 3, elevations = {}) {
  const a = s.locations[from], b = s.locations[to], path = [];
  const result2 = (visible2, reason, blocking = null) => ({ visible: visible2, reason, path, blocking });
  if (!a || !b) return result2(false, "Unknown terrain.");
  if (a.staging || b.staging) return result2(false, "Staging permits communication, not combat or spotting LOS.");
  if (from === to) return result2(true, "Same card: point-blank LOS.");
  const dr = b.row - a.row, dc = b.col - a.col, d = distance2(a, b);
  if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return result2(false, "LOS follows one of eight straight directions.");
  const limit = s.visibility && !elevations.ignoreVisibility ? visibilityLosLimit(s.visibility, illuminationReductionsAt(s.markers.filter((m) => m.type === "ILLUMINATION"), to, s.locations), Math.min(max, 3)) : Math.min(max, 3);
  if (d > limit) return result2(false, "Beyond the permitted LOS range.");
  if (!elevations.ignoreSmoke && screen(s, from)) return result2(false, "Smoke or active incoming fire blocks outward LOS.", from);
  for (let i = 1; i < d; i++) {
    const mid = values(s.locations).find((l) => l.row === a.row + Math.sign(dr) * i && l.col === a.col + Math.sign(dc) * i);
    if (!mid) return result2(false, "The LOS path leaves the map.");
    const entry = direction(-dr, -dc), exit = direction(dr, dc);
    const clear = whiteBorder(mid, -dr, -dc) && whiteBorder(mid, dr, dc);
    const high = Math.max(elevations.from ?? a.elevation, elevations.to ?? b.elevation), low = Math.min(elevations.from ?? a.elevation, elevations.to ?? b.elevation);
    const overlooked = mid.elevation < high && !(mid.elevation > low);
    path.push({ location: mid.id, entry, exit, entry_border: mid.borders[entry], exit_border: mid.borders[exit], elevation: mid.elevation, overlooked: !clear && overlooked });
    if (!elevations.ignoreSmoke && screen(s, mid.id)) return result2(false, `LOS is blocked at ${mid.name}.`, mid.id);
    if (mid.elevation > high || !clear && !overlooked) return result2(false, `Blocked by ${mid.name}: intervening elevation or dark LOS border.`, mid.id);
  }
  return result2(true, d === 1 ? "Adjacent terrain is visible regardless of border color." : path.some((p) => p.overlooked) ? "Clear LOS: higher elevation overlooks lower dark borders." : "Clear LOS through white entry and exit borders.");
}
var los = (s, from, to, max = 3) => explainLos(s, from, to, max).visible;
function explainUnitLos(s, u, target, max = 3) {
  const id = typeof target === "string" ? target : target.location;
  return explainLos(s, u.location, id, max, { from: unitElevation(s, u), to: typeof target === "string" ? void 0 : unitElevation(s, target) });
}
var unitLos = (s, u, target, max = 3) => explainUnitLos(s, u, target, max).visible;
function explainUnitCard(s, u, id, max = 3) {
  const ground = explainUnitLos(s, u, id, max);
  if (ground.visible) return ground;
  for (const t of occupants(s, id).filter((t2) => t2.faction === u.faction || !friendly(u) || s.knowledge.spotted[t2.id])) {
    const trace = explainUnitLos(s, u, t, max);
    if (trace.visible) return { ...trace, reason: `Visible occupied upper story: ${trace.reason}` };
  }
  return ground;
}
var seesCard = (s, u, id, max = 3) => explainUnitCard(s, u, id, max).visible;
function communicationLos(s, from, to) {
  const a = s.locations[from], b = s.locations[to];
  if (!a || !b) return false;
  if (a.staging && b.staging) return true;
  if (a.staging || b.staging) return (a.staging ? b : a).row === 1 && distance2(a, b) === 1;
  return explainLos(s, from, to, 3, { ignoreVisibility: true, ignoreSmoke: !!s.visibility }).visible;
}
function communicationChannels(s, issuer, u, rally2 = false) {
  if (!issuer || !u || !live(issuer) || !live(u)) return [];
  if (issuer.id === u.id) return ["Self"];
  if (s.mission_rules?.communications === "simplified") {
    const hq2 = (v) => ["HQ", "STAFF"].includes(v.kind) && v.cohesion === "GOOD" && !v.pinned;
    return hq2(issuer) && (hq2(u) || issuer.location === u.location) ? ["Mission communications \xB7 unpinned HQ/staff"] : [];
  }
  const channels = [];
  if (issuer.location === u.location && issuer.cover === u.cover && (rally2 || !issuer.pinned && !u.pinned)) channels.push("Visual / verbal");
  if (issuer.cohesion !== "GOOD" || u.cohesion !== "GOOD") return channels;
  if (s.mission_rules?.communications === "phones") {
    const hub2 = commandHub(s);
    const ready = (v) => live(v) && v.radios.includes("CO_PHONE") && live(hub2) && hub2.radios.includes("CO_PHONE") && phoneConnected(s, v.location, hub2.location);
    if (ready(issuer) && ready(u)) channels.push("CO field-phone network \xB7 intact line");
    return channels;
  }
  if (!issuer.radios.includes("CO") || !u.radios.includes("CO")) return channels;
  const hub = commandHub(s);
  const linked = (v) => live(v) && v.cohesion === "GOOD" && v.radios.includes("CO") && !v.cover && live(hub) && hub.cohesion === "GOOD" && hub.radios.includes("CO") && !hub.cover && communicationLos(s, v.location, hub.location);
  if (linked(issuer) && linked(u)) channels.push("CO radio via Company HQ \xB7 LOS");
  return channels;
}
var communication = (s, issuer, u, rally2 = false) => communicationChannels(s, issuer, u, rally2)[0] ?? null;
function communicationReason(s, issuer, u, rally2 = false) {
  if (!issuer) return "No issuing HQ selected.";
  const channel = communication(s, issuer, u, rally2);
  if (channel) return channel;
  if (s.mission_rules?.communications === "simplified") return `${issuer.name} must be an unpinned command-side HQ/staff; the recipient must share its card or be another unpinned HQ/staff.`;
  if (s.mission_rules?.communications === "phones") return `${issuer.name} cannot reach ${u.name}. They need matching-cover voice contact or working CO field phones connected through an intact phone line to Company HQ.`;
  return `${issuer.name} at ${s.locations[issuer.location].name}${issuer.cover ? " under cover" : ""} cannot reach ${u.name} at ${s.locations[u.location].name}${u.cover ? " under cover" : ""}. Same-area voice needs matching cover and unpinned units (rally excepted); CO radios need an uncovered, working Company HQ link. Observer radios only reach fire-support agencies.`;
}
var vofOf = (u) => u.out_of_ammo && (u.vof || ["F", "A"].includes(u.cohesion)) ? "S" : u.mission_weapon && u.cohesion === "A" ? "A" : u.cohesion === "F" ? u.fire_team_vof ?? "S" : u.cohesion === "A" ? "S" : u.vof_by_steps?.[u.steps.length] ?? u.vof;
var rangeOf = (u) => u.out_of_ammo ? 1 : u.cohesion === "A" ? 0 : u.cohesion === "F" ? 1 : u.range;
function chain(issuer, u, type) {
  if (issuer.id === u.id || ["SHIFT_FIRE", "CEASE_FIRE"].includes(type)) return true;
  if (issuer.command_role === "higher_hq") return true;
  if (canCommandCompany(issuer)) return !isCompanyCommander(u) && u.command_role !== "higher_hq" && !issuer.capabilities?.cannot_order_roles?.includes(u.command_role);
  return issuer.kind === "HQ" && (issuer.platoon === u.platoon || u.kind === "LAT");
}
function basicValue(u, range = 1) {
  if (!live(u) || ["P", "L"].includes(u.cohesion)) return null;
  if (u.cohesion === "F" || u.cohesion === "A") return u.pinned ? 2 : vofOf(u) === "A" ? -1 : 0;
  const vof = vofOf(u);
  if (!vof || vof === "G") return null;
  if (u.pinned) return 2;
  if (u.out_of_ammo) return 0;
  return { S: 0, "S!": 0, "A+": -1, A: -1, H: -3, "A/S": range === 0 ? -1 : 0 }[vof] ?? null;
}
function canFire(s, u, id) {
  if (u.hold_fire_until_cleanup || coverOf(s, u)?.type === "Deep Bunker") return false;
  if (u.mission_weapon && u.tripod && (!u.tripod_good_only || u.cohesion === "GOOD") && u.exposed) return false;
  if (basicValue(u) === null || !seesCard(s, u, id, rangeOf(u))) return false;
  if (u.cohesion === "GOOD" && u.kind === "MORTAR" && (u.exposed || u.location === id || enclosedWeaponCover(coverOf(s, u)) || s.locations[u.location].terrain === "woods")) return false;
  const cover = coverOf(s, u);
  if (["Bunker", "Pillbox"].includes(cover?.type)) {
    const a = s.locations[u.location], b = s.locations[id];
    if (a.id === b.id || Math.sign(b.row - a.row) !== cover.arc[0] || Math.sign(b.col - a.col) !== cover.arc[1]) return false;
  }
  return true;
}
var grazingCapable = (u) => u.mission_weapon && u.tripod && (!u.tripod_good_only || u.cohesion === "GOOD") && !u.out_of_ammo && ["GOOD", "F"].includes(u.cohesion);
function overheadAllowed(s, u, target, intervening) {
  if (!u.mission_weapon || u.out_of_ammo || !grazingCapable(u) && vofOf(u) !== "H") return false;
  const from = unitElevation(s, u), to = s.locations[target].elevation, mid = s.locations[intervening].elevation;
  return mid <= Math.min(from, to) && mid < Math.max(from, to);
}
function basicFireTargets(s, u, target) {
  if (!canFire(s, u, target)) return [];
  if (!grazingCapable(u) || target === u.location) return [target];
  const a = s.locations[u.location], b = s.locations[target], dr = Math.sign(b.row - a.row), dc = Math.sign(b.col - a.col);
  const aimDistance = distance2(a, b), slope = Math.sign(b.elevation - unitElevation(s, u)), targets = [];
  let previous = unitElevation(s, u);
  for (let i = 1; i <= rangeOf(u); i++) {
    const id = `r${a.row + dr * i}c${a.col + dc * i}`, l = s.locations[id];
    if (!l || l.staging) break;
    if (i < aimDistance && overheadAllowed(s, u, target, id)) {
      if (screen(s, id)) break;
      continue;
    }
    if (!canFire(s, u, id)) break;
    const change = Math.sign(l.elevation - previous);
    if (change && change !== slope) break;
    targets.push(id);
    previous = l.elevation;
    if (screen(s, id)) break;
  }
  return targets;
}
function fireDestination(s, u, target, extended = false) {
  const a = s.locations[u.location], b = s.locations[target];
  if (!b) return null;
  if (screen(s, u.location)) return canFire(s, u, u.location) ? u.location : null;
  const intent = extended ? u.fire_direction : null;
  const dr = intent?.dr ?? Math.sign(b.row - a.row), dc = intent?.dc ?? Math.sign(b.col - a.col);
  if (!dr && !dc) return target;
  const limit = extended ? rangeOf(u) : distance2(a, b);
  for (let i = 1; i <= limit; i++) {
    const id = `r${a.row + dr * i}c${a.col + dc * i}`;
    if (!s.locations[id] || !canFire(s, u, id)) break;
    if (screen(s, id)) return id;
    const units5 = occupants(s, id).filter((t) => (t.faction === u.faction || !friendly(u) || s.knowledge.spotted[t.id] || grazingCapable(u)) && !(u.kind === "MORTAR" && u.cohesion === "GOOD" && t.faction === u.faction));
    const aim = intent?.anchor ?? target;
    if (units5.length && i < distance2(a, s.locations[aim]) && overheadAllowed(s, u, aim, id) && (extended || units5.every((t) => t.faction === u.faction))) continue;
    if (units5.length) return id;
  }
  const anchor = intent?.anchor ?? target;
  return canFire(s, u, target) ? target : canFire(s, u, anchor) ? anchor : null;
}
function rememberDirection(s, u) {
  if (!u.fire) {
    u.fire_direction = null;
    u.fire_effect = null;
    return;
  }
  if (!u.fire_direction || u.fire_effect !== u.fire || u.fire_direction.origin !== u.location) {
    const a = s.locations[u.location], b = s.locations[u.fire];
    u.fire_direction = { origin: u.location, anchor: u.fire, dr: Math.sign(b.row - a.row), dc: Math.sign(b.col - a.col) };
  }
}
function enemyCeaseFire(s) {
  for (const u of values(s.units).filter((u2) => live(u2) && !friendly(u2))) {
    if (u.fire && !occupants(s, u.fire).some((v) => v.faction !== u.faction)) {
      u.fire = null;
      u.fire_direction = null;
      u.fire_effect = null;
    }
  }
  refresh(s);
}
function sniperTargetCard(s, u, targets, priorityState = s) {
  const cards2 = [...new Set(targets.map((t) => t.location))];
  const opposing = (id) => occupants(s, id).filter((t) => t.faction !== u.faction && (!friendly(u) || s.knowledge.spotted[t.id]));
  const command = (id) => opposing(id).some((t) => ["HQ", "STAFF", "LEADER"].includes(t.kind) && t.cohesion === "GOOD");
  const commanders = cards2.filter(command);
  let best;
  if (commanders.length) {
    const nearest = Math.min(...commanders.map((id) => distance2(s.locations[u.location], s.locations[id])));
    best = commanders.filter((id) => distance2(s.locations[u.location], s.locations[id]) === nearest);
  } else {
    const strength = (id) => Math.min(99, ...opposing(id).map((t) => priorityState.units[t.id]).filter((t) => t.fire).map((t) => basicValue(t, distance2(s.locations[id], s.locations[t.fire])) ?? 99));
    const strongest = Math.min(...cards2.map(strength));
    const candidates = cards2.filter((id) => strength(id) === strongest);
    const steps = (id) => opposing(id).reduce((n, t) => n + t.steps.length, 0);
    const most = Math.max(...candidates.map(steps));
    best = candidates.filter((id) => steps(id) === most);
  }
  return best.length > 1 ? pick(s, best, "Sniper engagement tie", !visible(s, u)) : best[0];
}
function automaticTargetCard(s, u, targets, projectedFire = s.fire) {
  let cards2 = [...new Set(targets.map((t) => t.location))].sort();
  if (!cards2.length) return null;
  if (friendly(u)) {
    const nearest = Math.min(...cards2.map((id) => distance2(s.locations[u.location], s.locations[id])));
    cards2 = cards2.filter((id) => distance2(s.locations[u.location], s.locations[id]) === nearest);
    const strength = (id) => Math.min(99, ...projectedFire.filter((f) => f.origin === id && s.units[f.source]?.faction !== u.faction).map((f) => f.value));
    const strongest = Math.min(...cards2.map(strength));
    cards2 = cards2.filter((id) => strength(id) === strongest);
  } else {
    const steps = (id) => occupants(s, id).filter((t) => t.faction !== u.faction).reduce((n, t) => n + t.steps.length, 0);
    const most = Math.max(...cards2.map(steps));
    cards2 = cards2.filter((id) => steps(id) === most);
  }
  return cards2.length === 1 ? cards2[0] : pick(s, cards2, "Automatic engagement tie", !visible(s, u));
}
function refresh(s) {
  if (s.mission_rules?.enemyActivity === "normandy") for (const u of values(s.units).filter((u2) => live(u2) && u2.faction === "enemy" && u2.kind === "MORTAR" && u2.steps.length === 1 && u2.cohesion === "GOOD")) {
    const local = occupants(s, u.location);
    if (!local.some((v) => v.id !== u.id && v.faction === u.faction) && local.some((v) => v.faction !== u.faction && vofOf(v))) {
      u.cohesion = "F";
      u.experience = "Green";
      u.fire = null;
      u.indirect = null;
      delete u.temporary_pdf;
      emit(s, "COHESION_CHANGED", `${u.name}: lone mortar confronted at point blank; Fire Team side.`, { actor: u.id, from: "GOOD", to: "F" }, !visible(s, u));
    }
  }
  const old = new Set(s.fire.map((f) => `${f.source}:${f.target}:${f.value}`));
  for (const u of values(s.units).filter((u2) => live(u2) && !friendly(u2) && s.knowledge.spotted[u2.id])) spot(s, u);
  const established = /* @__PURE__ */ new Map();
  const establish = (key, target) => {
    if (!established.has(key)) established.set(key, /* @__PURE__ */ new Set());
    established.get(key).add(target);
  };
  for (const u of values(s.units).filter((u2) => u2.temporary_pdf)) {
    if (!live(u) || u.location !== u.temporary_pdf.origin) delete u.temporary_pdf;
    else establish(`${u.faction}:${u.location}`, u.temporary_pdf.target);
  }
  for (const u of values(s.units).filter(live)) {
    rememberDirection(s, u);
    if (u.fire) u.fire = fireDestination(s, u, u.fire, true);
    u.fire_effect = u.fire;
    if (u.fire && !canFire(s, u, u.fire)) u.fire = null;
    if (u.fire) establish(`${u.faction}:${u.location}`, u.fire);
  }
  const selectionSnapshot = { units: structuredClone(s.units) };
  const indirectUnits = values(s.units).filter((u) => live(u) && u.indirect && !u.exposed && u.steps.length >= 2 && u.cohesion === "GOOD" && !u.pinned && u.indirect !== u.location && !["Building", "Bunker", "Deep Bunker", "Cave", "Pillbox"].includes(coverOf(s, u)?.type) && s.locations[u.location].terrain !== "woods");
  const projectedFire = values(s.units).filter((u) => live(u) && u.fire && canFire(s, u, u.fire) && !indirectUnits.includes(u)).map((u) => ({ source: u.id, origin: u.location, value: basicValue(u, distance2(s.locations[u.location], s.locations[u.fire])) })).filter((f) => f.value !== null).concat(indirectUnits.map((u) => ({ source: u.id, origin: u.location, value: -3 })));
  for (const u of values(s.units).filter(live)) {
    if (occupants(s, u.location).some((t) => t.faction !== u.faction && (!friendly(u) || s.knowledge.spotted[t.id])) && canFire(s, u, u.location)) u.fire = u.location;
    const key = `${u.faction}:${u.location}`, joined = [...established.get(key) ?? []].filter((id) => canFire(s, u, id));
    if (!u.fire && joined.length) u.fire = automaticTargetCard(s, u, joined.map((location) => ({ location })), projectedFire);
    if (!u.fire && !u.indirect && basicValue(u) !== null) {
      const targets = values(s.units).filter((t) => live(t) && t.faction !== u.faction && (!friendly(u) || s.knowledge.spotted[t.id]) && canFire(s, u, t.location) && fireDestination(s, u, t.location) === t.location && (!friendly(u) || !occupants(s, t.location).some((v) => friendly(v)) || t.location === u.location));
      if (targets.length) u.fire = fireDestination(s, u, u.mission_weapon && vofOf(u) === "S!" ? sniperTargetCard(s, u, targets, selectionSnapshot) : automaticTargetCard(s, u, targets, projectedFire));
    }
    rememberDirection(s, u);
    u.fire_effect = u.fire;
    if (u.fire) establish(key, u.fire);
  }
  s.fire = values(s.units).filter((u) => live(u) && u.fire && canFire(s, u, u.fire)).flatMap((u) => basicFireTargets(s, u, u.fire).map((target) => ({
    source: u.id,
    origin: u.location,
    target,
    value: basicValue(u, distance2(s.locations[u.location], s.locations[target])),
    indirect: false,
    direction: structuredClone(u.fire_direction),
    reason: target !== u.fire ? "GRAZING_FIRE" : screen(s, u.location) ? "BLOCKED_AT_SOURCE" : screen(s, u.fire) ? "BLOCKED_BY_SMOKE" : u.fire_direction?.anchor !== u.fire ? "INTERCEPTED_OR_FOLLOWING" : occupants(s, u.fire).some((t) => t.faction !== u.faction && (!friendly(u) || s.knowledge.spotted[t.id])) ? "ENGAGED" : "CONTINUING_AT_CLEARED_POSITION"
  })));
  for (const u of indirectUnits) {
    s.fire = s.fire.filter((f) => f.source !== u.id);
    s.fire.push({ source: u.id, origin: u.location, target: u.indirect, value: -3, indirect: true });
  }
  s.markers = s.markers.filter((m) => m.type !== "CONCENTRATE" || live(s.units[m.source]) && s.units[m.source].fire === m.location && canFire(s, s.units[m.source], m.location));
  for (const f of s.fire) {
    const u = s.units[f.source], affectsFriendly = occupants(s, f.target).some(friendly);
    if (!friendly(u) && affectsFriendly) s.knowledge.suspected[f.origin] = true;
    if (s.mission_contacts && !friendly(u) && !f.indirect && !old.has(`${f.source}:${f.target}:${f.value}`)) {
      const a = s.locations[f.origin], b = s.locations[f.target], d = distance2(a, b);
      for (let i = 1; i < d; i++) {
        const id = `r${a.row + Math.sign(b.row - a.row) * i}c${a.col + Math.sign(b.col - a.col) * i}`;
        if (s.locations[id]?.elevation !== unitElevation(s, u)) continue;
        for (const pc of values(s.contacts).filter((pc2) => pc2.location === id && !pc2.resolved)) {
          pc.resolved = true;
          pc.removal_reason = "ENEMY_FIRE_PATH";
          emit(s, "CONTACT_REMOVED", "Potential contact removed along an established enemy firing path.", { location: id, reason: "ENEMY_FIRE_PATH" }, !visible(s, u) && !affectsFriendly);
        }
      }
    }
    if (!old.has(`${f.source}:${f.target}:${f.value}`)) emit(
      s,
      "FIRE_ESTABLISHED",
      `${visible(s, u) ? u.name : "Unidentified fire"} ${f.value === 2 ? "fires weakly" : "opens fire"} from ${s.locations[f.origin].name} toward ${s.locations[f.target].name}.`,
      { actor: visible(s, u) ? u.id : null, origin: f.origin, target: f.target, value: f.value, reason: f.reason },
      !visible(s, u) && !affectsFriendly
    );
  }
  for (const u of values(s.units).filter((u2) => !friendly(u2) && s.knowledge.spotted[u2.id])) s.knowledge.spotted[u.id] = observeRecord(u);
  const under = values(s.locations).filter((l) => occupants(s, l.id).length && hasFire(s, l.id));
  s.activity = under.length >= 2 ? under.some((l) => new Set(occupants(s, l.id).map((u) => u.faction)).size > 1) ? "HEAVILY_ENGAGED" : "ENGAGED" : values(s.locations).some((l) => hasFire(s, l.id)) || temporaryMortarFire(s).length || s.support.some((f) => f.status === "PENDING") || Object.keys(s.knowledge.spotted).some((id) => live(s.units[id])) ? "CONTACT" : "NO_CONTACT";
}
var observeRecord = (u) => ({ id: u.id, name: u.name, kind: u.kind, location: u.location, cohesion: u.cohesion, pinned: u.pinned, exposed: u.exposed, steps: u.steps.length, cover: u.cover, removed: u.removed });
function spot(s, u) {
  for (const t of occupants(s, u.location).filter((t2) => t2.faction === u.faction)) {
    if (s.knowledge.spotted[t.id]) continue;
    s.knowledge.spotted[t.id] = observeRecord(t);
    const cover = coverOf(s, t);
    if (cover) {
      cover.known = true;
      if (s.mission_rules?.coverTable) {
        for (const c of s.locations[t.location].covers) if (c.id === (cover.parent ?? cover.id) || c.parent === (cover.parent ?? cover.id)) c.known = true;
      }
    }
    emit(s, "ENEMY_SPOTTED", `${t.name} spotted at ${s.locations[t.location].name}.`, { actor: t.id, location: t.location });
  }
}
var spottingLocations = (s) => Object.keys(s.knowledge.suspected).filter((id) => occupants(s, id).some((u) => !friendly(u) && !s.knowledge.spotted[u.id]));
function hasFire(s, id, { includeInactiveMines = true } = {}) {
  return includeInactiveMines && !!s.locations[id]?.mines || s.fire.some((f) => f.target === id) || s.support.some((f) => f.status === "ACTIVE" && f.location === id) || s.markers.some((m) => m.location === id && ["GRENADE", "GRENADE_MISS", "MINES", "SNIPER"].includes(m.type));
}
function incoming(s, u) {
  return s.fire.filter((f) => f.target === u.location && (f.origin !== u.location || s.units[f.source].faction !== u.faction));
}
function combatExposure(s, u) {
  const terrain = s.locations[u.location], cover = coverOf(s, u), fire = incoming(s, u);
  const indirect = s.support.filter((f) => f.status === "ACTIVE" && f.location === u.location);
  const targeted = s.markers.filter((m) => m.location === u.location && (m.target === u.id || u.cover && m.cover === u.cover));
  const grenades = targeted.filter((m) => ["GRENADE", "MINES", "SNIPER"].includes(m.type));
  const miss = s.markers.some((m) => m.location === u.location && m.type === "GRENADE_MISS");
  if (!fire.length && !indirect.length && !grenades.length && !miss) return null;
  const directions2 = [...fire, ...temporaryMortarFire(s).filter((f) => f.target === u.location)];
  const cross = new Set(directions2.filter((f) => !f.indirect && f.origin !== u.location).map((f) => {
    const a = s.locations[f.origin];
    return `${Math.sign(a.row - terrain.row)}:${Math.sign(a.col - terrain.col)}`;
  })).size >= 2 ? -1 : 0;
  const smoke = Math.max(terrain.smoke ? terrain.smoke_value ?? 2 : 0, indirect.some((f) => f.ammo === "WP") ? 1 : 0);
  const combined = s.mission_rules?.grenade ? grenades.filter((m) => m.type === "GRENADE") : [];
  const effects = combined.length > 1 ? [...grenades.filter((m) => m.type !== "GRENADE"), { type: "GRENADE", location: u.location, value: combined.reduce((n, m) => n + m.value, 0), label: "Combined grenade effects" }] : grenades;
  const candidates = [
    ...fire.map((f) => ({ kind: f.indirect ? "ON_MAP_INDIRECT" : "BASIC_FIRE", source_id: f.source, origin: f.origin, value: f.value + smoke + (f.indirect ? terrain.burst : 0), vof: f.value, smoke, burst: f.indirect ? terrain.burst : 0, blast: false })),
    ...indirect.map((f) => ({ kind: "OFF_MAP_SUPPORT", source_id: null, origin: f.location, value: f.value + terrain.burst, vof: f.value, smoke: 0, burst: terrain.burst, blast: true, label: f.agency ? `Incoming ${f.agency.includes("mortar") ? "mortar" : "artillery"} ${f.ammo ?? "HE"}` : f.value === -3 ? "Incoming mortar fire" : "Incoming artillery" })),
    ...effects.map((m) => ({ kind: m.type, source_id: m.source ?? null, origin: m.origin ?? s.units[m.source]?.location ?? m.location, value: m.value + (m.type === "SNIPER" ? smoke : 0), vof: m.value, smoke: m.type === "SNIPER" ? smoke : 0, burst: 0, blast: m.type === "GRENADE", ...m.label ? { label: m.label } : {}, ...m.weapon ? { label: m.weapon === "WP" ? "WP grenade effect" : "On-map mortar grenade effect" } : {} }))
  ];
  if (miss && !fire.length && !indirect.length && !grenades.length) candidates.push({ value: 0 + smoke, blast: false });
  const stack = cover ? occupants(s, u.location).filter((t) => t.cover === cover.id).reduce((n, t) => n + t.steps.length, 0) : 0;
  for (const c of candidates) {
    if (s.visibility) {
      const kind = { BASIC_FIRE: "basic", ON_MAP_INDIRECT: "on_map_indirect", SNIPER: "sniper" }[c.kind] ?? "off_map";
      c.visibility = visibilityFireModifier(s.visibility, illuminationReductionsAt(s.markers.filter((m) => m.type === "ILLUMINATION"), u.location, s.locations), kind);
      c.value += c.visibility;
    }
    c.overcrowding = c.blast ? -Math.max(0, stack - 3) : 0;
    c.value += c.overcrowding;
  }
  candidates.sort((a, b) => a.value - b.value || String(a.source_id ?? a.kind).localeCompare(String(b.source_id ?? b.kind)));
  const strongest = candidates[0];
  const critical = targeted.some((m) => m.critical);
  const borderFire = [...fire, ...grenades.filter((m) => m.type !== "MINES").map((m) => ({ origin: m.origin ?? s.units[m.source]?.location ?? m.location }))];
  const terrainValue = terrain.open_protection !== void 0 && borderFire.every((f) => {
    const source = s.locations[f.origin];
    return f.indirect || f.origin === u.location || whiteBorder(terrain, source.row - terrain.row, source.col - terrain.col);
  }) ? terrain.open_protection : terrain.protection;
  const parts = {
    fire: strongest.vof ?? 0,
    smoke: strongest.smoke ?? smoke,
    burst: strongest.burst ?? 0,
    terrain: terrainValue,
    cover: critical ? 0 : cover?.value ?? 0,
    pinned: u.pinned ? 1 : 0,
    exposed: u.exposed ? -2 : 0,
    crossfire: cross,
    concentrated: -targeted.filter((m) => m.type === "CONCENTRATE").reduce((n, m) => n + (m.value ?? 1), 0),
    grenade_miss: miss ? -1 : 0,
    overcrowding: strongest.overcrowding
  };
  if (s.visibility) parts.visibility = strongest.visibility ?? 0;
  const total = Object.values(parts).reduce((a, b) => a + b, 0);
  const labels = { visibility: "Light and weather", fire: "Selected fire VOF", smoke: "Applicable smoke protection", burst: "Applicable terrain burst", terrain: terrain.name, cover: cover?.type ?? "Occupied cover", pinned: "Pinned protection", exposed: "Exposure", crossfire: "Crossfire", concentrated: "Concentrated fire", grenade_miss: "Grenade miss", overcrowding: "Crowded cover" };
  const modifiers = Object.entries(parts).map(([source, value]) => ({ source: source.toUpperCase(), label: labels[source], value }));
  return { ncm: Math.max(-4, Math.min(6, total)), total, parts, modifiers, sources: candidates, strongest };
}
function movementReason(s, u, target) {
  const to = s.locations[target], from = s.locations[u.location];
  if (u.mobile === false && u.cohesion === "GOOD") return "This gun cannot move on its good-order side.";
  if (!u.pinned && u.cohesion !== "P") {
    const load = transportReason(s, u) ?? ammoLoadReason(s, u);
    if (load) return load;
  }
  if (to?.outside_boundary && friendly(u)) return "Outside the mission boundaries: only enemy placement may expand the battlefield.";
  if (!to || distance2(from, to) !== 1) return "Choose an adjacent terrain card.";
  if (u.mine_hit) return "Mines prevent further movement this turn.";
  if (s.hq_events?.some((e) => e.side === "friendly" && e.code === "HOLD" && e.turn === s.turn && to.row > e.lead) && friendly(u)) return "Higher HQ ordered the company to hold its current leading row this turn.";
  if (u.exposed) return "Already exposed: cannot move to another card until cleanup.";
  if ((u.pinned || ["P", "L", "F"].includes(u.cohesion)) && !to.staging && (hasFire(s, target) || friendly(u) && !occupants(s, target).some((v) => v.faction === u.faction))) return "This unit can only withdraw to staging or a friendly occupied card free of fire.";
  const steps = occupants(s, target).filter((v) => v.faction === u.faction).reduce((n, v) => n + v.steps.length, 0);
  if (!to.staging && steps + u.steps.length > 16) return "The destination would exceed the 16-step stacking limit.";
  if (Math.abs(from.row - to.row) === 1 && Math.abs(from.col - to.col) === 1) {
    const a = `r${from.row}c${to.col}`, b = `r${to.row}c${from.col}`;
    if (s.fire.some((f) => f.origin === a && f.target === b || f.origin === b && f.target === a)) return "A direction of fire crosses this diagonal route.";
  }
  return null;
}

// tmp/rules27-source/src/sim/company/equipmentRecovery.js
function transferEquipmentResupply(s, recipient, asset) {
  if (!s.mission_rules?.reattempts || !["RADIO", "EQUIPMENT"].includes(asset.type)) return;
  const source = s.units[asset.source_unit];
  if (!source?.initial_resources || source.id === recipient.id) return;
  recipient.initial_resources ??= { radios: [], assets: {}, ammo: {} };
  const from = source.initial_resources, to = recipient.initial_resources;
  if (asset.type === "RADIO") {
    const index2 = from.radios.indexOf(asset.net);
    if (index2 < 0) return;
    from.radios.splice(index2, 1);
    to.radios.push(asset.net);
  } else {
    const quantity = Math.min(from.assets[asset.key] ?? 0, asset.quantity);
    from.assets[asset.key] = (from.assets[asset.key] ?? 0) - quantity;
    if (!from.assets[asset.key]) delete from.assets[asset.key];
    if (quantity) to.assets[asset.key] = (to.assets[asset.key] ?? 0) + quantity;
  }
}

// tmp/rules27-source/src/sim/company/reconstitution.js
function combinedExperience(steps) {
  const rank2 = { Green: 0, Line: 1, Veteran: 2 };
  const sorted = steps.map((step) => rank2[step.experience ?? "Green"]).sort((a, b) => b - a);
  if (sorted.length === 1) return ["Green", "Line", "Veteran"][sorted[0]];
  if (sorted.length === 2) return sorted[0] === 2 && sorted[1] === 2 ? "Veteran" : sorted[0] === 2 || sorted[1] === 1 ? "Line" : "Green";
  if (sorted.length === 3) {
    if (sorted[0] === 2 && sorted[1] === 2 && sorted[2] >= 1) return "Veteran";
    return sorted[0] === 2 || sorted[1] >= 1 ? "Line" : "Green";
  }
  return sorted.filter((n) => n === 2).length >= 3 ? "Veteran" : sorted.filter((n) => n === 2).length >= 2 || sorted.filter((n) => n >= 1).length >= 3 ? "Line" : "Green";
}
function reconstitutionFirepower(profile, donors) {
  const rating = profile.vof_by_steps?.[donors.length] ?? profile.vof;
  if (rating === "S") return true;
  return ["A", "A/S"].includes(rating) && donors.some((u) => u.cohesion === "F" && (u.fire_team_vof ?? u.vof) === "A" && u.range > 0);
}
function reconstitutionDonors(profile, teams) {
  const rating = profile.vof_by_steps?.[Math.min(teams.length, profile.steps)] ?? profile.vof;
  const weapon = ["A", "A/S"].includes(rating) ? teams.find((u) => u.cohesion === "F" && (u.fire_team_vof ?? u.vof) === "A" && u.range > 0) : null;
  return (weapon ? [weapon, ...teams.filter((u) => u !== weapon)] : teams).slice(0, profile.steps);
}
function transferReconstitutionLoads(s, unit, donors) {
  const loads = donors.map((u) => structuredClone(u)), weaponStock = structuredClone(unit.initial_resources?.ammo ?? {});
  for (const donor of donors) {
    donor.radios = [];
    donor.assets = {};
    donor.ammo = {};
    donor.initial_resources = { radios: [], assets: {}, ammo: {} };
  }
  const restored = { radios: [], assets: {}, ammo: {} };
  unit.radios = loads.flatMap((u) => u.radios ?? []);
  unit.assets = {};
  unit.ammo = {};
  for (const donor of loads) {
    const stock2 = donor.initial_resources ?? { radios: donor.radios ?? [], assets: donor.assets ?? {}, ammo: donor.ammo ?? {} };
    restored.radios.push(...stock2.radios);
    for (const key of ["assets", "ammo"]) for (const [item, n] of Object.entries(stock2[key] ?? {})) restored[key][item] = (restored[key][item] ?? 0) + n;
    for (const [key, n] of Object.entries(donor.assets ?? {})) unit.assets[key] = (unit.assets[key] ?? 0) + n;
    for (const [key, n] of Object.entries(donor.ammo ?? {})) unit.ammo[key] = (unit.ammo[key] ?? 0) + n;
    for (const casualty2 of s.casualties.filter((c) => c.carrier === donor.id)) casualty2.carrier = unit.id;
  }
  for (const [key, n] of Object.entries(weaponStock)) restored.ammo[key] = Math.max(restored.ammo[key] ?? 0, n);
  unit.initial_resources = restored;
  unit.out_of_ammo = unit.ammo.MG === 0 && ["A", "A/S"].includes(unit.vof);
}
function reconstitutionLoads(s, unit, donors) {
  transferReconstitutionLoads(s, unit, donors);
  unit.experience = combinedExperience(donors.map((u) => ({ experience: u.cohesion === "A" ? "Line" : "Green" })));
  unit.original_experience = unit.experience;
  for (const step of unit.steps) step.experience = unit.experience;
}

// tmp/rules27-source/src/sim/company/runners.js
var availableRunner = (s) => (s.runners ?? []).find((r) => r.status === "BOX");
function createRunner(s, donor) {
  const step = donor.steps.pop();
  step.experience = "Line";
  if (!donor.steps.length) {
    dropLoad(s, donor, "runner creation");
    donor.removed = "RUNNER_CREATED";
  }
  const id = `runner_${s.next_id++}`;
  s.runners.push({ id, step, status: "BOX", origin: donor.id });
  emit(s, "RUNNER_CREATED", `${donor.name} provided a step for a Line-rated runner waiting in the CO HQ runner box; dispatch it separately.`, { actor: donor.id, runner: id, step_id: step.id });
}
function dispatchRunner(s, target) {
  const runner = availableRunner(s), id = runner.id;
  runner.status = "DISPATCHED";
  runner.target = target.id;
  runner.turn = s.turn;
  s.units[id] = { id, name: `Runner to ${target.name}`, kind: "RUNNER", named: true, faction: "friendly", location: target.location, platoon: null, cohesion: "GOOD", experience: "Line", original_experience: "Line", steps: [runner.step], max_steps: 1, radios: [], assets: {}, ammo: {}, saved: 0, used: [], removed: null, pinned: false, exposed: true, cover: null, vof: null, range: 0, fire: null, indirect: null, mission_weapon: true };
  emit(s, "RUNNER_DISPATCHED", `Runner dispatched to ${target.name}; delivery is checked next turn.`, { runner: id, target: target.id, location: target.location });
}
function dismissRunner(s, recipient) {
  const runner = availableRunner(s);
  runner.status = "DISMISSED";
  recipient.steps.push(runner.step);
  emit(s, "RUNNER_DISMISSED", `Runner returned to ${recipient.name} as one step.`, { runner: runner.id, actor: recipient.id, step_id: runner.step.id });
}
function deliverRunners(s) {
  for (const runner of s.runners ?? []) {
    if (runner.status !== "DISPATCHED" || runner.turn >= s.turn) continue;
    const unit = s.units[runner.id], target = s.units[runner.target];
    if (!live(unit)) {
      runner.status = "LOST";
      delete s.units[runner.id];
      continue;
    }
    if (!good(unit)) continue;
    if (live(target) && target.cohesion === "GOOD" && target.location === unit.location && ["HQ", "STAFF"].includes(target.kind) && !s.activated.includes(target.id)) {
      s.activated.push(target.id);
      emit(s, "HQ_ACTIVATED", `${target.name} activated by runner.`, { hq: target.id, runner: runner.id });
    } else emit(s, "RUNNER_UNDELIVERED", `Runner returned without delivering orders to ${target?.name ?? "its target"}.`, { runner: runner.id, target: runner.target });
    runner.status = "BOX";
    runner.target = null;
    delete s.units[runner.id];
  }
}

// tmp/rules27-source/src/sim/company/missionKnowledge.js
function revealTerrain(s, { setup = false } = {}) {
  if (!s.mission_rules?.hiddenTerrain) return;
  const origins = setup ? values(s.locations).filter((l) => l.staging).map((l) => l.id) : values(s.units).filter((u) => friendly(u) && live(u) && !s.locations[u.location].staging);
  const locations = setup ? Object.fromEntries(values(s.locations).map((l) => [l.id, { ...l, staging: false }])) : s.locations;
  const geometry = { ...s, locations };
  for (const l of values(s.locations)) if (!l.known && (setup && l.row === 1 || origins.some((origin) => setup ? explainLos(geometry, origin, l.id).visible : unitLos(s, origin, l.id)))) {
    while (l.terrain === "hill") {
      const card = s.terrain_deck.pop();
      if (!card) throw new Error("Terrain deck exhausted while resolving a hill.");
      const { id, row, col, name, hills = [], elevation } = l;
      Object.assign(l, card, { id, row, col, terrain_card: card.id, hills: [...hills, l.terrain_card], elevation: elevation + 1, borders: borders(), name: `${row}.${col} ${card.name} / Hill`, covers: [], smoke: false });
    }
    if (setup) geometry.locations[l.id] = { ...l, staging: false };
    l.known = true;
    emit(s, "TERRAIN_REVEALED", `${l.name} revealed.`, { location: l.id, terrain_card: l.terrain_card });
  }
}

// tmp/rules27-source/src/sim/company/actions.js
var ACTIONS = {
  SKILL_EXTRA_AUTOMATIC: "Assign Extra Draw to next automatic attempt",
  SKILL_GRENADE_RETURN: "Assign Auto Grenade to next return attempt",
  SKILL_GENERAL: "Skill: extra General Initiative command",
  SKILL_SPAWN_A: "Skill: spawn Assault Team",
  SKILL_SPAWN_F: "Skill: spawn Fire Team",
  SKILL_PARALYZED_A: "Skill: Paralyzed to Assault",
  SKILL_PARALYZED_F: "Skill: Paralyzed to Fire",
  WP_ATTACK: "Attack with WP grenade",
  ACTIVATE: "Activate HQ / staff",
  MOVE: "Move",
  PLATOON_MOVE: "Move platoon",
  INFILTRATE: "Infiltrate",
  PLATOON_INFILTRATE: "Infiltrate platoon",
  INFILTRATE_WITHIN: "Infiltrate within card",
  SEEK_COVER_UPPER: "Seek cover \u2014 enter upper story if found",
  SEEK_COVER: "Seek cover",
  ENTER_COVER: "Move within card",
  SPOT: "Spot position",
  SHIFT_FIRE: "Shift fire",
  CEASE_FIRE: "Cease fire on this card",
  CONCENTRATE: "Concentrate fire",
  GRENADE: "Grenade / close assault",
  RALLY: "Remove pin",
  RECOVER: "Recover cohesion",
  DEPLOY_FIRE_TEAM: "Deploy named Fire Team",
  RECONSTITUTE: "Reconstitute squad",
  RECONSTITUTE_HQ: "Reconstitute HQ",
  DETACH: "Detach assault team",
  HANDHELD_ILLUM: "Deploy handheld illumination",
  CALL_MORTAR_ILLUM: "Call mortar illumination",
  CALL_ARTILLERY_ILLUM: "Call artillery illumination",
  CALL_CANNON: "Call cannon HE",
  CALL_CANNON_WP: "Call cannon WP",
  CALL_MORTAR_WP: "Call mortar WP",
  CALL_ARTILLERY_WP: "Call artillery WP",
  WP: "Deploy WP smoke",
  RIFLE_GRENADE: "Fire rifle grenade",
  CALL_MORTAR: "Call 81mm fire",
  CALL_ARTILLERY: "Call 105mm fire",
  INDIRECT: "Direct mortar section",
  SMOKE: "Deploy screening smoke",
  SIGNAL_ADVANCE: "Signal: cross phase line 2",
  SIGNAL_CEASE: "Signal: cease fire",
  PYRO_RSP: "Signal: red star parachute",
  PYRO_RSC: "Signal: red star cluster",
  PYRO_GSP: "Signal: green star parachute",
  PYRO_GSC: "Signal: green star cluster",
  PYRO_RED_SIGNAL: "Signal: red smoke",
  PYRO_GREEN_SIGNAL: "Signal: green smoke",
  PYRO_YELLOW_SIGNAL: "Signal: yellow smoke",
  PYRO_PURPLE_SIGNAL: "Signal: purple smoke",
  CREATE_RUNNER: "Create runner",
  DISPATCH_RUNNER: "Dispatch runner",
  DISMISS_RUNNER: "Dismiss runner",
  REPAIR_PHONE_LINE: "Repair phone line",
  DROP_LOAD: "Drop all carried items (free)",
  PICKUP_RADIO: "Recover equipment",
  PICKUP_CASUALTY: "Pick up casualty",
  DROP_CASUALTY: "Drop casualties"
};
var costOf = (type) => ["SKILL_GENERAL", "SKILL_SPAWN_A", "SKILL_SPAWN_F", "SKILL_EXTRA_AUTOMATIC", "SKILL_GRENADE_RETURN"].includes(type) ? 0 : type.startsWith("PLATOON_") ? 2 : 1;
var hq = (u) => ["HQ", "STAFF"].includes(u.kind);
var genericInit = (s) => s.impulse?.hq === "general";
var HQ_ORIGIN_ACTIONS = ["ACTIVATE", "RECONSTITUTE", "RECONSTITUTE_HQ", "CREATE_RUNNER", "DISPATCH_RUNNER", "DISMISS_RUNNER", "SIGNAL_ADVANCE", "SIGNAL_CEASE"];
var skillActor = (s, u, type, issuerId) => ["RECONSTITUTE", "RECONSTITUTE_HQ"].includes(type) || !genericInit(s) && ["RALLY", "RECOVER"].includes(type) ? s.units[issuerId] ?? u : u;
var actionKey = (u, type, target) => type === "SEEK_COVER_UPPER" ? "SEEK_COVER" : type === "WP_ATTACK" ? "GRENADE" : type.startsWith("CALL_") && u.mission_weapon ? "CALL_FIRE" : type === "ACTIVATE" ? `${type}_${target}` : type === "RECOVER" ? `${type}_${u.cohesion}` : type;
var areaTargets = (s, u) => values(s.units).filter((t) => live(t) && t.faction !== u.faction && (!friendly(u) || s.knowledge.spotted[t.id]));
function targetsAt(s, u, id) {
  return areaTargets(s, u).filter((t) => t.location === id);
}
function eligibleTargets(s, u, type) {
  if (type === "WP_ATTACK") return areaTargets(s, u).filter((t) => t.location === u.location).map((t) => t.id);
  if (["MOVE", "INFILTRATE", "PLATOON_MOVE", "PLATOON_INFILTRATE"].includes(type)) return adjacent(s, u.location).map((l) => l.id);
  if (type === "ACTIVATE") return values(s.units).filter((t) => friendly(t) && (u.command_role === "higher_hq" || !isCompanyCommander(t)) && hq(t) && live(t) && t.command_role !== "higher_hq").map((t) => t.id);
  if (type.startsWith("PYRO_")) return (type.endsWith("_SIGNAL") ? [s.locations[u.location]] : [s.locations[u.location], ...adjacent(s, u.location)]).filter(Boolean).map((l) => l.id);
  if (type === "CREATE_RUNNER") return values(s.units).filter((v) => friendly(v) && live(v) && (good(v) || !v.pinned && ["A", "F"].includes(v.cohesion)) && communication(s, companyCommander(s), v) && chain(companyCommander(s), v, type)).map((v) => v.id);
  if (type === "DISPATCH_RUNNER") return values(s.units).filter((t) => friendly(t) && live(t) && ["HQ", "STAFF"].includes(t.kind) && !isCompanyCommander(t) && t.command_role !== "higher_hq").map((t) => t.id);
  if (["ENTER_COVER", "INFILTRATE_WITHIN"].includes(type)) return ["open", ...s.locations[u.location].covers.filter((c) => (!friendly(u) || c.known) && coverAvailable(s, u, c)).map((c) => c.id)];
  if (type === "SPOT") return spottingLocations(s).filter((id) => occupants(s, id).some((t) => t.faction !== u.faction && !s.knowledge.spotted[t.id] && unitLos(s, u, t)));
  if (type === "INDIRECT") return values(s.locations).filter((l) => !l.staging && distance2(s.locations[u.location], l) <= u.range).map((l) => l.id);
  if (type.endsWith("_ILLUM")) return values(s.locations).filter((l) => !l.staging && (type === "HANDHELD_ILLUM" || l.known !== false) && (type !== "HANDHELD_ILLUM" || l.id === u.location || adjacent(s, u.location).some((a) => a.id === l.id))).map((l) => l.id);
  if (["SHIFT_FIRE"].includes(type) || type.startsWith("CALL_")) return values(s.locations).filter((l) => !l.staging && seesCard(s, u, l.id)).map((l) => l.id);
  if (["GRENADE", "RIFLE_GRENADE", "CONCENTRATE"].includes(type)) return areaTargets(s, u).filter((t) => unitLos(s, u, t, type === "RIFLE_GRENADE" ? 1 : type === "GRENADE" ? u.grenade_range ?? (vofOf(u) === "G" ? rangeOf(u) : 0) : rangeOf(u))).map((t) => t.id);
  if (type === "RECONSTITUTE_HQ") return values(s.units).filter((t) => friendly(t) && t.kind === "HQ" && !live(t)).map((t) => t.id);
  if (type === "RECONSTITUTE") return values(s.units).filter((t) => t.faction === u.faction && t.kind === "SQUAD" && !live(t)).map((t) => t.id);
  if (type === "PICKUP_RADIO") return s.assets.filter((a) => a.location === u.location && (!s.mission_rules?.specialEnemies || (a.cover ?? null) === (u.cover ?? null) && a.faction === u.faction) && ["RADIO", "EQUIPMENT", "AMMO"].includes(a.type) && !a.destroyed).map((a) => a.id);
  if (type === "PICKUP_CASUALTY") return s.casualties.filter((c) => c.location === u.location && c.cover === u.cover && c.faction === u.faction && !c.carrier && !c.evacuated).map((c) => c.id);
  return [];
}
function orderReason(s, c) {
  const u = s.units[c.unit_id], issuer = s.units[c.issuer_id], type = c.type === "SEEK_COVER_UPPER" ? "SEEK_COVER" : c.type, target = c.target_id;
  if (c.type === "SEEK_COVER_UPPER") {
    const l = u && s.locations[u.location];
    if (!s.mission_rules?.coverTable || !l?.building || !(l.multi_story || l.tower)) return "Upper-story discovery requires multi-story building terrain.";
    if (l.tower && u.steps.length > 1) return "A church tower can hold only one step.";
  }
  if ((type.endsWith("_WP") || ["WP", "WP_ATTACK", "RIFLE_GRENADE"].includes(type)) && !s.support_agencies) return "This action is not enabled by the mission.";
  if (!ACTIONS[type]) return "Unknown order.";
  if (s.status !== "ACTIVE") return "The mission has ended.";
  if (s.mission_rules?.specialEnemies && ["DROP_LOAD", "DROP_CASUALTY"].includes(type)) {
    if (!live(u) || !friendly(u)) return "Select an available friendly formation.";
    return type === "DROP_LOAD" && (u.radios.length || Object.values(u.assets).some(Boolean) || Object.values(u.ammo ?? {}).some(Boolean)) || s.casualties.some((c2) => c2.carrier === u.id) ? null : "No carried items to drop.";
  }
  if (type === "DROP_LOAD") return "This action is not enabled by the mission.";
  if (type === "REPAIR_PHONE_LINE" && s.mission_rules?.communications !== "phones") return "Field phones are not in use.";
  if (type.endsWith("_RUNNER") && !s.mission_rules?.runners) return "Runners are not available in this mission.";
  if (type.startsWith("PYRO_") && !s.signal_plan) return "These signals are not available in this mission.";
  if (s.pending_support) return "Resolve the pending battalion fire choice first.";
  if (coverOf(s, u)?.type === "Deep Bunker" && (type === "SPOT" || type.startsWith("PYRO_") || ["GRENADE", "RIFLE_GRENADE", "WP_ATTACK"].includes(type))) return "Leave the Deep Bunker before spotting, signalling or making grenade attacks.";
  if (!s.impulse) return "Advance to a command impulse to issue orders.";
  if (!live(u) || !friendly(u)) return "Select an available friendly formation.";
  if (!genericInit(s) && c.issuer_id !== s.impulse.hq) return "Only the active HQ can issue orders in this impulse.";
  if (type.startsWith("SKILL_") || c.skill_id) {
    const available2 = skillOptions(s, skillActor(s, u, type, c.issuer_id), type), skill = c.skill_id ? available2.find((p) => p.id === c.skill_id) : available2[0];
    if (!skill) return "No eligible unused skill is available for this formation and action.";
    if (skill.type === "EXTRA_DRAW" && ["RALLY", "RECOVER"].includes(type) && !hasFire(s, u.location)) return "No draw is made for recovery outside fire; retain the Extra Draw skill.";
    if (type === "SKILL_GENERAL" && !genericInit(s)) return "Use this skill during General Initiative.";
    if (type.startsWith("SKILL_SPAWN") && (!good(u) || u.kind !== "SQUAD" || u.steps.length < 3)) return "Spawn from a good-order three- or four-step squad.";
    if (type.startsWith("SKILL_PARALYZED") && (u.pinned || u.cohesion !== "P")) return "Select an unpinned Paralyzed Team.";
  }
  const normandyGeneral = (s.mission_rules?.reattempts || s.patrol) && genericInit(s);
  const cappedSpent = normandyGeneral ? HQ_ORIGIN_ACTIONS.includes(type) ? s.impulse.origin_spent?.[c.issuer_id] ?? 0 : null : s.impulse.spent;
  if (s.impulse.commands < costOf(type) || cappedSpent !== null && cappedSpent + costOf(type) > visibilityCommandLimits(s.visibility).spend) return `Insufficient commands, or the ${visibilityCommandLimits(s.visibility).spend === 6 ? "six" : "four"}-command impulse limit has been reached.`;
  if (!genericInit(s)) {
    if (!live(issuer)) return "The issuing HQ is unavailable.";
    if (issuer.cohesion !== "GOOD" && issuer.id !== u.id) return "A degraded HQ can only order itself.";
    if (!chain(issuer, u, type)) return "The unit is outside this HQ\u2019s chain of command.";
    if (!communication(s, issuer, u, type === "RALLY")) return communicationReason(s, issuer, u, type === "RALLY");
  }
  if (s.patrol && ["MOVE", "INFILTRATE", "PLATOON_MOVE", "PLATOON_INFILTRATE"].includes(type)) {
    const restriction = patrolMovementReason(s.patrol, u);
    if (restriction) return restriction;
    const hold = patrolHoldReason(s, target);
    if (hold) return hold;
  }
  if (type === "ACTIVATE" && s.activated.includes(target)) return `${s.units[target]?.name ?? "This HQ"} is already activated. Complete Company HQ\u2019s impulse, then select it in 3.3.1c to spend its commands.`;
  if (type === "REPAIR_PHONE_LINE" && !s.phone_lines?.some((line) => line.location === u.location && line.cut)) return "No damaged phone line at this location.";
  if (type.startsWith("PYRO_")) {
    const key = type.slice(5).toLowerCase();
    if (key.endsWith("_signal") && (s.visibility?.light ?? 0) >= 2) return "Colored smoke cannot signal during Moon +2 or higher (rules \xA74.4.1).";
    if (!good(u) || !u.assets[key]) return "This good-order unit has no remaining device of that type.";
    if (!s.signal_plan?.[key] || !eligibleTargets(s, u, type).includes(target)) return "Choose the device\u2019s assigned offensive order and an eligible signal card.";
  }
  if (type.endsWith("_RUNNER")) {
    const commander = companyCommander(s);
    if (c.issuer_id !== commander.id || s.impulse?.hq !== commander.id || !good(commander)) return "Only a good-order Company HQ can create, dispatch or dismiss runners in its impulse.";
    if (type === "CREATE_RUNNER") {
      const donor = target ? s.units[target] : isCompanyCommander(u) ? null : u;
      if (!donor) return "Choose the unit donating one step to the runner. Company HQ is the issuer, not an automatic donor.";
      if (!eligibleTargets(s, u, type).includes(donor.id) || (s.runners ?? []).filter((r) => ["BOX", "DISPATCHED"].includes(r.status)).length >= 2) return "Choose a communicating good-order unit or unpinned assault/fire team; no more than two runners may be in play.";
    }
    if (type === "DISPATCH_RUNNER" && (!isCompanyCommander(u) || !availableRunner(s) || !eligibleTargets(s, u, type).includes(target))) return "Choose an available runner and a subordinate HQ or staff on the map.";
    if (type === "DISMISS_RUNNER" && (!availableRunner(s) || !good(u) || u.location !== commander.location || u.cover !== commander.cover || u.steps.length >= u.max_steps)) return "A runner can return only to a good-order unit with capacity in Company HQ\u2019s area.";
  }
  if (u.used.includes(`${s.impulse.id}:${actionKey(u, type, target)}`) && type !== "ENTER_COVER") return "This unit already attempted this action in this impulse.";
  const restricted = u.pinned || u.cohesion === "P";
  if (restricted && !type.startsWith("SKILL_PARALYZED") && !["ACTIVATE", "RALLY", "RECOVER", "MOVE", "SEEK_COVER", "ENTER_COVER", "DROP_CASUALTY"].includes(type)) return "Pinned, paralyzed or litter teams cannot perform this action.";
  if (u.cohesion === "L" && !["RALLY", "RECOVER", "MOVE", "INFILTRATE", "INFILTRATE_WITHIN", "SEEK_COVER", "ENTER_COVER", "PICKUP_RADIO", "PICKUP_CASUALTY", "DROP_CASUALTY"].includes(type)) return "Litter teams must recover before performing this action.";
  if (u.cohesion === "P" && ["SEEK_COVER", "ENTER_COVER"].includes(type)) return "A paralyzed team must recover before moving within its card.";
  if (["ACTIVATE", "RECONSTITUTE", "RECONSTITUTE_HQ", "SIGNAL_ADVANCE", "SIGNAL_CEASE"].includes(type) && genericInit(s) && (!issuer || !hq(issuer) || (type === "RECONSTITUTE_HQ" ? issuer.cohesion !== "GOOD" : !good(issuer)) || !chain(issuer, u, type) || !communication(s, issuer, u))) return "This action requires an eligible HQ in communication even during general initiative.";
  if (type === "ACTIVATE") {
    const t = s.units[target];
    if (c.issuer_id !== u.id || !(u.command_role === "higher_hq" || canActivateSubordinates(u)) || !(u.command_role === "higher_hq" ? s.phase === "BN_ACTIVATION" : s.phase === "CO_ACTIVATION")) return "Only the active higher or company HQ can activate subordinates in its activation impulse.";
    if (!t || !hq(t) || isCompanyCommander(t) && u.command_role !== "higher_hq" || t.command_role === "higher_hq" || !live(t) || t.cohesion !== "GOOD" || u.cohesion !== "GOOD" || s.activated.includes(t.id) || !communication(s, u, t)) return "Choose a command-side, unactivated subordinate HQ in communication.";
  }
  if (type.startsWith("PLATOON_") && (u.kind !== "HQ" || !u.platoon || u.id !== c.issuer_id || !good(u))) return "A good-order platoon HQ must order its own group move.";
  if (["MOVE", "INFILTRATE", "PLATOON_MOVE", "PLATOON_INFILTRATE"].includes(type)) {
    if (movedThisImpulse(s, u)) return "Already moved to an adjacent card in this impulse.";
    const reason = movementReason(s, u, target);
    if (reason) return reason;
    if (type.includes("INFILTRATE")) {
      const reason2 = infiltrationReason(s, u, target);
      if (reason2) return reason2;
    }
  }
  if (["SEEK_COVER", "ENTER_COVER", "INFILTRATE_WITHIN"].includes(type)) {
    const load = transportReason(s, u);
    if (load) return load;
  }
  if (["SEEK_COVER", "ENTER_COVER", "INFILTRATE_WITHIN"].includes(type) && s.locations[u.location].staging) return "Staging is an off-map holding area with no terrain cover.";
  if (type === "INFILTRATE_WITHIN") {
    const reason = infiltrationReason(s, u, u.location, true);
    if (reason) return reason;
  }
  if (type === "SEEK_COVER" && (u.cover || s.locations[u.location].covers.filter((c2) => s.mission_rules?.coverTable ? c2.discovered && !c2.parent : c2.type === "Cover").length >= s.locations[u.location].cover_limit)) return "Already in cover, or the card has reached its cover potential.";
  if (["ENTER_COVER", "INFILTRATE_WITHIN"].includes(type) && (!eligibleTargets(s, u, type).includes(target) || (target === "open" ? u.cover === null : u.cover === target))) return "Choose a different, accessible area on this card.";
  if (type === "DEPLOY_FIRE_TEAM" && (!good(u) || (!u.named || u.steps.length !== 1))) return "Only a good-order one-step named formation can deploy its named Fire Team; command/observer capability is lost until recovered.";
  if (type === "RALLY" && !u.pinned) return "This unit is not pinned.";
  if (type === "RECOVER" && (u.pinned || !["P", "L", "F"].includes(u.cohesion))) return "Remove the pin first; only paralyzed, litter or fire teams need recovery.";
  if (type === "SPOT" && (u.pinned || ["P", "L"].includes(u.cohesion) || !eligibleTargets(s, u, type).includes(target))) return "Need an unpinned spotting-capable unit on the map with LOS to a current unspotted position.";
  if (type === "SHIFT_FIRE" && (!u.fire || !s.locations[target] || !seesCard(s, issuer ?? u, target) || !canFire(s, u, target) || s.knowledge.suspected[target] && !targetsAt(s, u, target).length)) return "Need an existing fire direction and an eligible destination visible to the issuer. Spot suspected enemies first.";
  if (type === "SHIFT_FIRE" && (coverOf(s, u)?.type === "Bunker" || s.mission_rules?.specialEnemies && coverOf(s, u)?.type === "Pillbox")) return "Fortification occupants cannot shift their firing arc.";
  if (type === "CEASE_FIRE" && !u.fire && !u.indirect) return "This unit is not maintaining fire.";
  if (["CONCENTRATE", "GRENADE", "WP_ATTACK", "RIFLE_GRENADE"].includes(type)) {
    if (type === "GRENADE" && u.kind === "MORTAR" && u.steps.length === 1 && u.ammo?.MTR === 0) return "Mortar ammunition is exhausted.";
    if (type !== "RIFLE_GRENADE" && !vofOf(u)) return "This command/observer side has no weapon VOF. It cannot perform a weapon attack.";
    const t = s.units[target];
    if (!eligibleTargets(s, u, type).includes(target) || !t) return "Choose a spotted enemy within weapon range and LOS.";
    if (s.mission_rules?.specialEnemies && ["GRENADE", "WP_ATTACK"].includes(type) && t.location === u.location && ["Bunker", "Pillbox"].includes(coverOf(s, u)?.type)) return "Leave the fortification before making a point-blank grenade attack.";
    if (s.mission_rules?.specialEnemies && ["GRENADE", "RIFLE_GRENADE"].includes(type) && (["AT", "MORTAR"].includes(u.kind) && u.cohesion === "GOOD" || type === "RIFLE_GRENADE") && enclosedWeaponCover(coverOf(s, u))) return "This weapon cannot fire from building or fortification cover.";
    if (s.mission_rules?.specialEnemies && type === "GRENADE" && u.kind === "MORTAR" && u.cohesion === "GOOD" && (u.exposed || t.location === u.location || s.locations[u.location].terrain === "woods")) return "Mortar teams cannot fire exposed, from woods, or at point blank.";
    if (type === "CONCENTRATE" && (!u.fire || u.fire !== t.location || !["S", "A", "A/S", "H"].includes(vofOf(u)))) return "Concentrated fire must follow an existing direction of basic fire.";
    if (["GRENADE", "RIFLE_GRENADE"].includes(type) && t.location !== u.location && occupants(s, u.location).some((v) => v.faction === u.faction && (v.fire || v.temporary_pdf?.target) && (v.fire ?? v.temporary_pdf.target) !== t.location)) return "Ranged grenades must follow the existing direction of fire.";
    if (["GRENADE", "RIFLE_GRENADE"].includes(type) && t.location !== u.location && occupants(s, u.location).some((v) => v.faction !== u.faction)) return "Resolve point-blank combat before firing grenades elsewhere.";
    if (u.mission_weapon && ["GRENADE", "RIFLE_GRENADE"].includes(type) && t.location !== u.location) {
      const a = s.locations[u.location], b = s.locations[t.location], d = distance2(a, b);
      for (let i = 1; i < d; i++) {
        const id = `r${a.row + Math.sign(b.row - a.row) * i}c${a.col + Math.sign(b.col - a.col) * i}`;
        if (occupants(s, id).some((v) => (v.faction === u.faction || !friendly(u) || s.knowledge.spotted[v.id]) && !(u.kind === "MORTAR" && u.cohesion === "GOOD" && v.faction === u.faction))) return "An intervening formation blocks this ranged grenade attack.";
      }
    }
  }
  if (type.startsWith("CALL_") && s.support_agencies) {
    const agency2 = type.includes("MORTAR") ? "mortar" : type.includes("CANNON") ? "cannon" : "artillery", definition = s.support_agencies[agency2];
    const role = u.agency_role ?? u.id, net = definition?.networks?.[role];
    if (!good(u) || !definition?.draws[role]) return "This formation cannot call this firing agency.";
    const ammunition = type.endsWith("_ILLUM") ? "ILLUM" : type.endsWith("_WP") ? "WP" : "HE";
    if (ammunition === "ILLUM" && (!s.visibility || !definition?.inventory?.ILLUM)) return "This agency has no illumination capability.";
    if (s.support_inventory?.[agency2]?.[ammunition] === 0) return `${definition.name} has no ${ammunition} missions remaining.`;
    if (!net || !u.radios.includes(net)) return `This caller needs its working ${net ?? "fire-direction"} radio network.`;
    if (s.support_unavailable.includes(agency2)) return "Higher HQ reports this agency unavailable this turn.";
    if (type.endsWith("_ILLUM") ? !s.locations[target] || s.locations[target].staging || s.locations[target].known === false : !s.locations[target] || !seesCard(s, u, target) || !type.endsWith("_WP") && !targetsAt(s, u, target).length) return "Need a spotted enemy position within the caller\u2019s LOS.";
  } else if (type.startsWith("CALL_")) {
    const agency2 = type === "CALL_MORTAR" ? "MTR" : "ARTY";
    if (!good(u) || !(isCompanyCommander(u) || u.agency_role === (agency2 === "MTR" ? "mtrfo" : "artyfo")) || !u.radios.includes(isCompanyCommander(u) ? "BN" : agency2)) return "This observer needs its working fire-direction radio and good order.";
    if (!s.locations[target] || !seesCard(s, u, target) || !targetsAt(s, u, target).length) return "Call for fire requires a spotted enemy position in the observer\u2019s LOS.";
  }
  if (type === "INDIRECT" && (!good(u) || u.kind !== "MORTAR" || u.steps.length < 2 || u.exposed || c.target_id === u.location || enclosedWeaponCover(coverOf(s, u)) || s.locations[u.location].terrain === "woods" || !s.locations[target] || !issuer || !seesCard(s, issuer, target) || distance2(s.locations[u.location], s.locations[target]) > u.range || !targetsAt(s, u, target).length)) return "Need an unexposed two-step mortar outside woods and enclosed cover, in communication with an HQ that sees the spotted target.";
  if (type === "HANDHELD_ILLUM" && (!s.visibility || !good(u) || !u.assets.illum || coverOf(s, u)?.type === "Deep Bunker" || !s.locations[target] || distance2(s.locations[u.location], s.locations[target]) > 1)) return "Need handheld illumination, good order outside a Deep Bunker, and a card here or adjacent.";
  if (type === "RIFLE_GRENADE" && (!good(u) || !u.assets.rifle_grenade)) return "No rifle-grenade asset on this good-order unit.";
  if (type === "WP_ATTACK" && !u.assets.wp) return "No WP grenade asset remains on this formation.";
  if (u.mine_hit && ["MOVE", "INFILTRATE", "SEEK_COVER", "ENTER_COVER", "INFILTRATE_WITHIN"].includes(type)) return "Mines prevent further movement this turn.";
  if (type === "WP" && (!good(u) || !u.assets.wp)) return "No WP smoke available on this good-order unit.";
  if (type.startsWith("SIGNAL_") && s.mission_rules?.signals === false) return "Pyrotechnic signals are not available in this mission.";
  if (type === "SMOKE" && (!good(u) || !u.assets.smoke)) return "No screening smoke available on this good-order unit.";
  if (type.startsWith("SIGNAL_") && (!good(u) || !u.assets[type === "SIGNAL_ADVANCE" ? "advance" : "cease"])) return "This unit has no remaining asset for that signal.";
  if (type === "DETACH" && (!good(u) || !(u.kind === "SQUAD" && u.steps.length >= 3 || u.kind === "MG" && u.steps.length === 2))) return "Detach from a good-order squad of at least three steps or a two-step weapon team.";
  if (type === "RECONSTITUTE") {
    const squad = s.units[target], ids = c.contributor_ids;
    if (!squad || squad.kind !== "SQUAD" || live(squad) || squad.faction !== u.faction) return "Choose a previously eliminated squad counter to restore.";
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 4 || new Set(ids).size !== ids.length || !ids.includes(u.id)) return "Choose 2\u20134 distinct contributing teams, including the selected team.";
    if (ids.length > (squad.max_steps ?? squad.steps.length)) return `${squad.name} can hold at most ${squad.max_steps ?? 0} steps; choose fewer teams.`;
    if (ids.some((id) => {
      const t = s.units[id];
      return !live(t) || t.faction !== u.faction || !s.mission_rules?.reattempts && t.kind !== "LAT" || !["A", "F"].includes(t.cohesion) || t.pinned || t.location !== u.location || t.cover !== u.cover || t.steps.length !== 1;
    })) return "Every contributor must be an unpinned one-step Fire/Assault Team in the same area.";
    if (s.mission_rules?.reattempts && !reconstitutionFirepower(squad, ids.map((id) => s.units[id]))) return "The contributing teams cannot supply this squad\u2019s original weapon firepower.";
  }
  if (type === "RECONSTITUTE_HQ") {
    const t = s.units[target];
    if (!issuer || issuer.cohesion !== "GOOD" || !canCommandCompany(issuer) || !good(u) || !t || live(t) || t.kind !== "HQ" || (t.platoon ? u.platoon !== t.platoon && u.kind !== "STAFF" : !["HQ", "STAFF", "FO"].includes(u.kind))) return "Company HQ or staff must use an eligible good-order donor to restore an eliminated HQ.";
    if (isCompanyCommander(t)) {
      const candidates = values(s.units).filter((v) => friendly(v) && live(v) && !isCompanyCommander(v));
      const rank2 = successionPriority;
      const best = Math.min(...candidates.map(rank2));
      if (issuer.kind !== "STAFF" || rank2(u) !== best || best === 99) return "Company staff must restore Company HQ using a surviving platoon HQ first, then Artillery Observer, then staff. A higher-ranked Fire Team must recover first.";
    }
  }
  if (["PICKUP_RADIO", "PICKUP_CASUALTY"].includes(type) && (!eligibleTargets(s, u, type).includes(target) || u.pinned || u.cohesion === "P")) return "Choose an available item here; pinned/paralyzed units cannot transport it.";
  if (type === "PICKUP_RADIO") {
    const a = s.assets.find((a2) => a2.id === target);
    const load = a.type === "AMMO" ? ammoLoadReason(s, u, { [a.key]: 1 }) : transportReason(s, u, a.type === "RADIO" ? 1 : a.quantity);
    if (load) return load;
  }
  if (type === "PICKUP_CASUALTY" && s.casualties.filter((c2) => c2.carrier === u.id).length >= u.steps.length) return "Each step can carry one casualty.";
  if (type === "DROP_CASUALTY" && !s.casualties.some((c2) => c2.carrier === u.id)) return "No casualties are being carried.";
  return null;
}
var movedThisImpulse = (s, u) => s.impulse && u.used.some((k) => ["MOVE", "INFILTRATE"].some((a) => k === `${s.impulse.id}:${a}`));
function infiltrationReason(s, u, target, within = false) {
  if (u.pinned || u.cohesion === "P") return "Pinned or paralyzed formations cannot infiltrate.";
  if (u.exposed) return "Already exposed: infiltration requires an unexposed formation.";
  if (u.cohesion === "GOOD" && (vofOf(u) === "H" || u.tripod || u.mission_weapon && u.kind === "MORTAR")) return "This counter side carries a heavy weapon, mortar or tripod-mounted weapon and cannot infiltrate.";
  if (!within) {
    const reason = movementReason(s, u, target);
    if (reason) return reason;
    if (["F", "L"].includes(u.cohesion) && (hasFire(s, target) || friendly(u) && !occupants(s, target).some((v) => v.faction === u.faction))) return "Fire and litter teams may infiltrate only to a friendly-occupied card without VOF.";
  }
  if (!hasFire(s, u.location) && !hasFire(s, target)) return "Infiltration requires fire on the origin or destination card.";
  return null;
}
var fortification = (c) => c && ["Trench", "Bunker", "Pillbox"].includes(c.type);
function move(s, u, target, infiltrate = false) {
  const from = u.location, old = coverOf(s, u);
  layPhoneLine(s, u);
  dropExcessAmmunition(s, u);
  const following = occupants(s, from).filter((v) => v.faction !== u.faction && v.fire === from && (!friendly(v) || s.knowledge.spotted[u.id]) && !occupants(s, from).some((t) => t.id !== u.id && t.faction === u.faction));
  if (u.pinned || u.cohesion === "P") dropLoad(s, u, "withdrawal");
  const success = infiltrate && attempt(s, u, 2, "infiltrate", `${u.name}: infiltration`) > 0;
  invalidateTargets(s, u);
  u.location = target;
  u.cover = null;
  u.fire = null;
  u.fire_direction = null;
  u.fire_effect = null;
  u.indirect = null;
  for (const v of following) if (canFire(s, v, target)) {
    v.fire = target;
    v.fire_direction = null;
    v.fire_effect = null;
  }
  const cover = s.locations[target].covers.find((c) => (!friendly(u) || c.known) && coverAvailable(s, u, c, target));
  if (cover) u.cover = cover.id;
  u.exposed = !(success || s.locations[from].staging && s.locations[target].staging || fortification(old) && fortification(cover));
  for (const c of s.casualties.filter((c2) => c2.carrier === u.id)) {
    c.location = target;
    c.transported = true;
  }
  if (s.mission_rules?.specialEnemies) checkMines(s, u);
  emit(s, "UNIT_MOVED", `${u.name} ${success ? "infiltrated" : "moved"} to ${s.locations[target].name}${u.exposed ? "; exposed until cleanup" : ""}.`, { actor: u.id, from, target, exposed: u.exposed, faction: u.faction }, !visible(s, u));
}
function invalidateTargets(s, u) {
  for (const m of s.markers.filter((m2) => m2.target === u.id || u.cover && m2.cover === u.cover)) {
    if (m.type === "GRENADE") s.markers.push({ type: "GRENADE_MISS", location: u.location });
  }
  s.markers = s.markers.filter((m) => m.target !== u.id && !(u.cover && m.cover === u.cover));
}
function seekCover(s, u, upper = false) {
  const l = s.locations[u.location];
  if (l.staging || u.cover || l.covers.filter((c) => s.mission_rules?.coverTable ? c.discovered && !c.parent : c.type === "Cover").length >= l.cover_limit) return false;
  const success = attempt(s, u, l.cover_draw, "cover", `${u.name}: seek cover`) > 0;
  if (success) {
    const c = s.mission_rules?.coverTable ? discoveredCover(s, l, !!visible(s, u)) : { id: `cover_${l.id}_${l.covers.length + 1}`, type: "Cover", value: 1, known: friendly(u) };
    if (!s.mission_rules?.coverTable) l.covers.push(c);
    const upperCover = upper ? l.covers.find((v) => v.parent === c.id && coverAvailable(s, u, v)) : null;
    u.cover = (upperCover ?? c).id;
    u.exposed = true;
    if (s.mission_rules?.specialEnemies) checkMines(s, u);
  }
  emit(s, "COVER_ATTEMPT", `${u.name} ${success ? "found and occupied additional cover; exposed while moving" : "found no additional cover"}.`, { actor: u.id, success, ...s.mission_rules?.coverTable ? { location: u.location, cover: success ? u.cover : null, upper_story: success && !!coverOf(s, u)?.parent } : {} }, !visible(s, u));
  return success;
}
function rally(s, u, issuer = u, recover = false) {
  const success = !hasFire(s, u.location) || attempt(s, issuer, 2, "rally", `${u.name}: ${recover ? "cohesion recovery" : "unpin"}`, !visible(s, u)) > 0;
  if (success) {
    if (!recover) u.pinned = false;
    else {
      const previous = u.cohesion;
      u.cohesion = u.cohesion === "F" && u.named ? "GOOD" : { P: "L", L: "F", F: "A" }[u.cohesion];
      if (!u.named) u.name = u.name.replace(/^(Paralyzed|Litter|Fire|Assault) team/, `${{ P: "Paralyzed", L: "Litter", F: "Fire", A: "Assault" }[u.cohesion]} team`);
      if (u.cohesion === "GOOD") u.experience = u.original_experience;
      else {
        u.experience = u.cohesion === "A" ? "Line" : "Green";
        u.range = u.cohesion === "A" ? 0 : 1;
      }
      emit(s, "COHESION_CHANGED", `${u.name}: ${previous} \u2192 ${u.cohesion}.`, { actor: u.id, from: previous, to: u.cohesion }, !visible(s, u));
    }
  }
  emit(s, "RALLY_ATTEMPT", `${u.name}: ${success ? recover ? "cohesion recovered" : "pin removed" : "rally failed"}.`, { actor: u.id, success }, !visible(s, u));
}
function grenade(s, u, t, response = false, wp = false) {
  if (coverOf(s, u)?.type === "Deep Bunker") return;
  if (response && s.mission_contacts && ["Bunker", "Pillbox"].includes(coverOf(s, u)?.type)) return;
  const mortar2 = !wp && u.mission_weapon && u.kind === "MORTAR" && u.cohesion === "GOOD" && u.steps.length === 1 && u.location !== t.location;
  if (mortar2 && !expendAmmunition(s, u, "MTR", 1, "direct-lay grenade")) return;
  if (!wp && u.location !== t.location && u.ammo?.RKT !== void 0 && !expendAmmunition(s, u, "RKT", 1, "ranged grenade")) return;
  if (mortar2) {
    u.temporary_pdf = { origin: u.location, target: t.location };
    emit(s, "MORTAR_PDF_PLACED", "Mortar direct lay establishes a temporary firing direction; it counts for crossfire even if the attack misses.", { actor: visible(s, u) ? u.id : null, origin: u.location, target: t.location }, !visible(s, u) && !visible(s, t));
  }
  const targets = t.cover ? occupants(s, t.location).filter((v) => v.cover === t.cover && v.faction === t.faction) : [t];
  const successes = attempt(s, u, 2, "grenade", `${visible(s, u) ? u.name : "Unidentified unit"}: grenade attack`, !visible(s, u) && !friendly(t), (batch) => u.location === t.location || !weaponJam(s, u, batch), response || !s.impulse, response);
  if (successes) s.markers.push({
    type: "GRENADE",
    source: u.id,
    origin: u.location,
    location: t.location,
    target: t.cover ? null : t.id,
    cover: t.cover,
    critical: successes > 1,
    value: (wp ? -4 : s.mission_rules?.grenade ?? (friendly(u) ? -4 : -3)) * (successes > 1 && !t.cover ? 2 : 1),
    ...wp ? { weapon: "WP" } : mortar2 ? { weapon: "MORTAR" } : {}
  });
  else if (!s.markers.some((m) => m.type === "GRENADE_MISS" && m.location === t.location)) s.markers.push({ type: "GRENADE_MISS", location: t.location });
  if (wp) {
    const l = s.locations[t.location];
    l.smoke_value = Math.max(l.smoke ? l.smoke_value ?? 2 : 0, 1);
    l.smoke = true;
    emit(s, "WP_DEPLOYED", "WP grenade deployed; screening applies whether the attack succeeds or misses.", { location: t.location }, !visible(s, u) && !visible(s, t));
  }
  emit(s, "GRENADE_ATTEMPT", `${visible(s, u) ? u.name : "Unidentified attacker"}: ${successes ? "grenade attack placed" : "grenade miss"} at ${s.locations[t.location].name}${successes > 1 ? " (critical)" : ""}; effects resolve in mutual combat.`, { actor: visible(s, u) ? u.id : null, target: visible(s, t) ? t.id : null, success: !!successes, point_blank: u.location === t.location }, !visible(s, u) && !visible(s, t));
  if (!response && u.location === t.location) {
    for (const v of targets) if (!v.pinned && vofOf(v) && (v.cohesion === "GOOD" || successes) && (!friendly(v) || s.knowledge.spotted[u.id])) grenade(s, v, u, true);
  }
}
function concentrate(s, u, t) {
  if (!t.cover) t = pick(s, areaTargets(s, u).filter((v) => v.location === t.location && !v.cover), "Concentrated fire: random out-of-cover target", !friendly(u));
  const n = attempt(s, u, 2 + (u.mission_weapon && u.tripod && (!u.tripod_good_only || u.cohesion === "GOOD") ? 1 : 0), "spot", `${u.name}: concentrated fire`, !visible(s, u), (batch) => !weaponJam(s, u, batch));
  if (n && s.mission_rules?.ammo === "tracked") {
    const key = u.ammo?.MG !== void 0 ? "MG" : u.ammo?.GUN !== void 0 ? "GUN" : null;
    if (key && !expendAmmunition(s, u, key, 1, "concentrated fire")) return;
  }
  if (n) s.markers.push({ type: "CONCENTRATE", location: t.location, target: t.cover ? null : t.id, cover: t.cover, source: u.id, critical: n > 1, value: n > 1 && !t.cover ? 2 : 1 });
  emit(s, "CONCENTRATE_ATTEMPT", `${visible(s, u) ? u.name : "Unidentified attacker"}: ${n ? "concentrated fire established" : "concentrated fire failed"}.`, { actor: visible(s, u) ? u.id : null, target: visible(s, t) ? t.id : null, success: !!n }, !visible(s, u) && !visible(s, t));
}
function spottingBaseDraws(s, u, t) {
  const l = s.locations[t.location], protection = terrainProtection(l, s.locations[u.location]);
  return 2 + (unitElevation(s, u) > unitElevation(s, t) ? 1 : 0) + (u.location === t.location ? 1 : 0) + (protection >= 3 ? -1 : protection === 0 ? 1 : 0) - (t.cover ? 1 : 0) + (t.exposed ? 2 : 0) + (t.vof === "A" ? 1 : ["H", "G"].includes(t.vof) ? 2 : 0) - expMod(t) - (["FO", "SPOTTER", "SNIPER"].includes(t.kind) ? 1 : 0);
}
function spotAttempt(s, u, id) {
  const targets = occupants(s, id).filter((t2) => t2.faction !== u.faction && !s.knowledge.spotted[t2.id] && unitLos(s, u, t2));
  const l = s.locations[id], countFor = (t2) => spottingBaseDraws(s, u, t2);
  const t = targets.sort((a, b) => countFor(b) - countFor(a) || a.id.localeCompare(b.id))[0];
  const found = !!t && attempt(s, u, countFor(t), "spot", `${u.name}: observe ${l.name}`) > 0;
  if (found) spot(s, t);
  emit(s, "OBSERVATION", `${u.name}: ${found ? "enemy position identified" : "no additional enemy identified"}.`, { actor: u.id, location: id, success: found });
}
function splitTeam(s, u, cohesion, step) {
  const id = `lat_${s.next_id++}`;
  const unit = {
    ...structuredClone(u),
    id,
    name: `${cohesion === "A" ? "Assault" : cohesion === "F" ? "Fire" : cohesion === "L" ? "Litter" : "Paralyzed"} team ${id.slice(4)}`,
    kind: "LAT",
    steps: [step],
    cohesion,
    named: false,
    fire_team_vof: null,
    tripod: false,
    vof: "S",
    range: cohesion === "A" ? 0 : 1,
    radios: [],
    assets: {},
    ammo: s.mission_rules?.ammo === "tracked" ? {} : structuredClone(u.ammo ?? {}),
    initial_resources: s.mission_rules?.ammo === "tracked" ? { radios: [], assets: {}, ammo: {} } : structuredClone(u.initial_resources),
    fire: null,
    indirect: null,
    experience: cohesion === "A" ? "Line" : "Green",
    used: [],
    removed: null
  };
  if (unit.temporary_pdf) delete unit.temporary_pdf;
  if (s.mission_contacts) {
    unit.parent_counter_id = u.counter_id ?? u.parent_counter_id;
    unit.counter_id = null;
  }
  s.units[id] = unit;
  return unit;
}
function weaponJam(s, u, batch) {
  if (s.mission_rules?.ammo !== "tracked" || !batch.some((c) => c.jam) || u.cohesion !== "GOOD" || !(["A", "H", "G"].includes(u.vof) && u.kind !== "SQUAD" || u.kind === "SQUAD" && u.vof === "A" && u.ammo?.MG !== void 0)) return false;
  const steps = u.steps.splice(0);
  dropLoad(s, u, "weapon jam");
  u.removed = "JAMMED";
  u.fire = null;
  u.indirect = null;
  for (const step of steps) splitTeam(s, u, "F", step);
  emit(s, "WEAPON_JAMMED", `${visible(s, u) ? u.name : "Enemy weapon"} jammed; surviving steps became Fire Teams.`, { actor: visible(s, u) ? u.id : null, location: u.location, steps: steps.length }, !visible(s, u));
  return true;
}
function platoonMoveGroup(s, u, target, type = "PLATOON_MOVE") {
  const group = occupants(s, u.location).filter((v) => v.platoon === u.platoon && good(v) && !movedThisImpulse(s, v) && communication(s, u, v) && !movementReason(s, v, target) && (!type.includes("INFILTRATE") || !infiltrationReason(s, v, target)));
  let steps = occupants(s, target).filter((v) => v.faction === u.faction).reduce((n, v) => n + v.steps.length, 0);
  return group.filter((v) => {
    if (!s.locations[target].staging && steps + v.steps.length > 16) return false;
    steps += v.steps.length;
    return true;
  });
}
function execute(s, c) {
  const u = s.units[c.unit_id], issuer = s.units[c.issuer_id] ?? u, type = c.type, t = s.units[c.target_id];
  if (["SKILL_EXTRA_AUTOMATIC", "SKILL_GRENADE_RETURN"].includes(type)) return;
  if (type === "SKILL_GENERAL") s.impulse.commands++;
  else if (type.startsWith("SKILL_SPAWN")) splitTeam(s, u, type.endsWith("_A") ? "A" : "F", u.steps.pop());
  else if (type.startsWith("SKILL_PARALYZED")) {
    const from = u.cohesion;
    u.cohesion = type.endsWith("_A") ? "A" : "F";
    u.experience = u.cohesion === "A" ? "Line" : "Green";
    u.range = u.cohesion === "A" ? 0 : 1;
    emit(s, "COHESION_CHANGED", `${u.name}: ${from} \u2192 ${u.cohesion}.`, { actor: u.id, from, to: u.cohesion });
  } else if (type === "ACTIVATE") {
    s.activated.push(t.id);
    emit(s, "HQ_ACTIVATED", `${t.name} activated. Complete Company HQ\u2019s impulse, then select ${t.name} in 3.3.1c to spend its commands.`, { hq: t.id, issuer: u.id });
  } else if (["MOVE", "INFILTRATE", "PLATOON_MOVE", "PLATOON_INFILTRATE"].includes(type)) {
    const group = type.startsWith("PLATOON_") ? platoonMoveGroup(s, u, c.target_id, type) : [u];
    for (const v of group) {
      if (movementReason(s, v, c.target_id)) continue;
      move(s, v, c.target_id, type.includes("INFILTRATE"));
      v.used.push(`${s.impulse.id}:${type.includes("INFILTRATE") ? "INFILTRATE" : "MOVE"}`);
    }
  } else if (type === "SEEK_COVER" || type === "SEEK_COVER_UPPER") seekCover(s, u, type === "SEEK_COVER_UPPER");
  else if (["ENTER_COVER", "INFILTRATE_WITHIN"].includes(type)) {
    const old = coverOf(s, u), success = type === "INFILTRATE_WITHIN" && attempt(s, u, 2, "infiltrate", `${u.name}: within-card infiltration`) > 0;
    invalidateTargets(s, u);
    u.cover = c.target_id === "open" ? null : c.target_id;
    u.exposed = u.exposed || !(success || fortification(old) && fortification(coverOf(s, u)));
    if (s.mission_rules?.specialEnemies) checkMines(s, u);
    emit(s, "WITHIN_CARD_MOVED", `${u.name} moved ${u.cover ? "under cover" : "out of cover"}${success ? " by infiltration" : u.exposed ? "; exposed until cleanup" : "; protected by fortifications"}.`, { actor: u.id, exposed: u.exposed });
  } else if (type === "DEPLOY_FIRE_TEAM") {
    u.cohesion = "F";
    u.fire = null;
    emit(s, "COHESION_CHANGED", `${u.name} deployed its named Fire Team; recover it to restore command/observer capability.`, { actor: u.id, from: "GOOD", to: "F" });
  } else if (type === "RALLY" || type === "RECOVER") rally(s, u, genericInit(s) ? u : issuer, type === "RECOVER");
  else if (type === "SPOT") spotAttempt(s, u, c.target_id);
  else if (type === "SHIFT_FIRE" || type === "CEASE_FIRE") {
    for (const v of occupants(s, u.location).filter((v2) => v2.faction === u.faction)) {
      v.fire = type === "SHIFT_FIRE" ? c.target_id : null;
      v.indirect = null;
    }
    s.markers = s.markers.filter((m) => m.type !== "CONCENTRATE" || s.units[m.source]?.location !== u.location);
  } else if (type === "GRENADE" || type === "RIFLE_GRENADE") {
    if (type === "RIFLE_GRENADE") u.assets.rifle_grenade--;
    grenade(s, u, t);
  } else if (type === "WP_ATTACK") {
    u.assets.wp--;
    grenade(s, u, t, false, true);
  } else if (type === "CONCENTRATE") concentrate(s, u, t);
  else if (type === "HANDHELD_ILLUM") {
    u.assets.illum--;
    placeIllumination(s, c.target_id, "handheld", u.id);
    emit(s, "ILLUMINATION_DEPLOYED", `${u.name} deployed handheld illumination.`, { actor: u.id, location: c.target_id, delivery: "handheld" });
  } else if (type.startsWith("CALL_") && s.support_agencies) supportRequest(s, u, type.includes("MORTAR") ? "mortar" : type.includes("CANNON") ? "cannon" : "artillery", type.endsWith("_ILLUM") ? "ILLUM" : type.endsWith("_WP") ? "WP" : "HE", c.target_id);
  else if (type.startsWith("CALL_")) {
    const success = attempt(s, u, isCompanyCommander(u) ? 1 : 2, "burst", `${u.name}: call for fire`) > 0;
    if (success) s.support.push({ id: `support_${s.next_id++}`, location: c.target_id, status: "PENDING", value: type === "CALL_MORTAR" ? -3 : -5, source: u.id });
    emit(s, "SUPPORT_REQUEST", `${u.name}: ${success ? "fire mission pending; activates in Fire Mission Update" : "fire request failed"}.`, { actor: u.id, location: c.target_id, success });
  } else if (type === "INDIRECT") {
    u.fire = null;
    u.indirect = c.target_id;
  } else if (type === "WP") {
    u.assets.wp--;
    const l = s.locations[u.location];
    l.smoke_value = Math.max(l.smoke ? l.smoke_value ?? 2 : 0, 1);
    l.smoke = true;
    emit(s, "SMOKE_DEPLOYED", `WP smoke deployed at ${l.name}.`, { actor: u.id, location: u.location });
  } else if (type === "SMOKE") {
    u.assets.smoke--;
    s.locations[u.location].smoke = true;
    s.locations[u.location].smoke_value = 2;
    emit(s, "SMOKE_DEPLOYED", `Screening smoke at ${s.locations[u.location].name}: blocks outgoing and through LOS.`, { actor: u.id });
  } else if (type.startsWith("SIGNAL_")) {
    u.assets[type === "SIGNAL_ADVANCE" ? "advance" : "cease"]--;
    for (const v of values(s.units).filter((v2) => friendly(v2) && live(v2))) {
      if (type === "SIGNAL_CEASE") {
        v.fire = null;
        v.indirect = null;
      } else if (s.locations[v.location].row === s.signal_phase_line - 1) {
        const dest = `r${s.signal_phase_line}c${s.locations[v.location].col}`;
        if (!movementReason(s, v, dest)) move(s, v, dest);
      }
    }
    emit(s, "SIGNAL_DEPLOYED", `${u.name} deployed the ${type === "SIGNAL_ADVANCE" ? "cross phase line 2" : "cease fire"} signal.`, { actor: u.id });
  } else if (type.startsWith("PYRO_")) {
    const key = type.slice(5).toLowerCase(), order = s.signal_plan[key], aerial = !key.endsWith("_signal");
    u.assets[key]--;
    const seen = values(s.units).filter((v) => friendly(v) && live(v) && (aerial || seesCard(s, v, c.target_id)));
    const moved = [];
    for (const v of seen) {
      if (order === "CF") {
        v.fire = null;
        v.indirect = null;
        continue;
      }
      const line = order.startsWith("XPL") ? s.phase_lines?.[order.at(-1)] ?? Number(order.at(-1)) : null;
      const destination = order === "M2S" ? c.target_id : order === "M2PO" || order === "INFAP2PO" ? s.objectives.primary : order === "M2SO" || order === "INFAP2SO" ? s.objectives.secondary : order.startsWith("XPL") ? `r${line}c${s.locations[v.location].col}` : null;
      if (s.patrol && (patrolMovementReason(s.patrol, v) || patrolHoldReason(s, destination))) continue;
      if (!destination || order.startsWith("INFAP") && v.location !== s.objectives.attack || order.startsWith("XPL") && s.locations[v.location].row !== line - 1 || movementReason(s, v, destination)) continue;
      const infiltrate = order.startsWith("INFAP");
      if (infiltrate && infiltrationReason(s, v, destination)) continue;
      move(s, v, destination, infiltrate);
      moved.push(v.id);
    }
    emit(s, "SIGNAL_DEPLOYED", `${u.name} deployed ${key.replaceAll("_", " ")} for ${order}.`, { actor: u.id, location: c.target_id, device: key, order, seen: seen.map((v) => v.id), moved });
  } else if (type === "DETACH") {
    const step = u.steps.pop();
    splitTeam(s, u, "A", step);
  } else if (type === "RECONSTITUTE") {
    const group = c.contributor_ids.map((id) => s.units[id]);
    if (attempt(s, issuer, 2, "rally", "Reconstitute squad")) {
      const squad = s.units[c.target_id];
      squad.steps = group.flatMap((v) => v.steps);
      squad.location = u.location;
      squad.cover = u.cover;
      squad.cohesion = "GOOD";
      squad.removed = null;
      squad.pinned = false;
      squad.exposed = group.some((v) => v.exposed);
      squad.fire = null;
      squad.experience = group.filter((v) => v.experience === "Line").length >= Math.ceil(group.length / 2) ? "Line" : "Green";
      if (s.mission_rules?.reattempts) reconstitutionLoads(s, squad, group);
      for (const v of group) {
        v.steps = [];
        v.removed = "RECONSTITUTED";
      }
      emit(s, "FORMATION_RECONSTITUTED", `${squad.name} restored with ${group.length} steps from ${group.map((v) => v.name).join(", ")}.`, { actor: squad.id, contributors: group.map((v) => v.id), location: u.location });
    }
  } else if (type === "RECONSTITUTE_HQ") {
    t.steps = [u.steps.pop()];
    t.location = u.location;
    t.cover = u.cover;
    t.removed = null;
    t.cohesion = "GOOD";
    t.experience = "Green";
    t.original_experience = "Green";
    t.saved = 0;
    t.radios = [];
    t.pinned = false;
    if (!u.steps.length) u.removed = "RECONSTITUTED";
    else if (u.kind === "SQUAD" && u.steps.length === 1) {
      splitTeam(s, u, "F", u.steps.pop());
      u.removed = "RECONSTITUTED";
    }
    emit(s, "HQ_RECONSTITUTED", `${t.name} restored at Green experience; recover a radio to restore its net.`, { actor: t.id, donor: u.id, location: t.location, donor_name: u.name, restored_name: t.name });
  } else if (type === "PICKUP_RADIO") {
    const a = s.assets.find((a2) => a2.id === c.target_id);
    transferEquipmentResupply(s, u, a);
    if (a.type === "RADIO") u.radios.push(a.net);
    else if (a.type === "AMMO") pickUpAmmunition(s, u, a);
    else u.assets[a.key] = (u.assets[a.key] ?? 0) + a.quantity;
    if (a.type !== "AMMO") s.assets = s.assets.filter((v) => v.id !== a.id);
    u.exposed = true;
  } else if (type === "REPAIR_PHONE_LINE") {
    const line = s.phone_lines.find((line2) => line2.location === u.location && line2.cut);
    line.cut = false;
    u.exposed = true;
    emit(s, "PHONE_LINE_REPAIRED", `${u.name} repaired the phone line at ${s.locations[u.location].name}.`, { actor: u.id, location: u.location, line_id: line.id });
  } else if (type === "CREATE_RUNNER") createRunner(s, c.target_id ? s.units[c.target_id] : u);
  else if (type === "DISPATCH_RUNNER") dispatchRunner(s, t);
  else if (type === "DISMISS_RUNNER") dismissRunner(s, u);
  else if (type === "PICKUP_CASUALTY") {
    const casualty2 = s.casualties.find((v) => v.id === c.target_id);
    casualty2.carrier = u.id;
    u.exposed = true;
    emit(s, "CASUALTY_PICKED_UP", `${u.name} picked up ${casualty2.origin_name ?? "a friendly formation"} casualty step; exposed while loading.`, { actor: u.id, casualty_id: casualty2.id, location: u.location });
  } else if (type === "DROP_CASUALTY") {
    for (const v of s.casualties.filter((v2) => v2.carrier === u.id)) {
      v.carrier = null;
      v.location = u.location;
      v.cover = u.cover;
    }
    emit(s, "CASUALTIES_DROPPED", `${u.name} unloaded carried casualties at ${s.locations[u.location].name}.`, { actor: u.id, location: u.location });
  }
}
function submitCommand(state, command) {
  const reason = orderReason(state, command);
  if (reason) return { state, events: [], accepted: false, reason };
  const s = structuredClone(state), u = s.units[command.unit_id], key = actionKey(u, command.type, command.target_id);
  if (s.mission_rules?.specialEnemies && ["DROP_LOAD", "DROP_CASUALTY"].includes(command.type)) {
    if (command.type === "DROP_LOAD") dropLoad(s, u, "voluntary unload");
    for (const c of s.casualties.filter((c2) => c2.carrier === u.id)) {
      c.carrier = null;
      c.location = u.location;
      c.cover = u.cover;
    }
    emit(s, "ASSETS_DROPPED", `${u.name}: carried items unloaded without a command or exposure.`, { actor: u.id, location: u.location });
    s.replay.push({ op: "submitCommand", command: structuredClone(command) });
    return result(state, s, { accepted: true });
  }
  const beforeFire = command.type === "CEASE_FIRE" || command.type === "SHIFT_FIRE" ? occupants(s, u.location).filter((v) => v.faction === u.faction && (v.fire || v.indirect)).map((v) => v.id) : [];
  const contributors = command.type === "RECONSTITUTE" ? ` using ${command.contributor_ids.map((id) => s.units[id].name).join(", ")}` : "";
  const event = emit(s, "COMMAND_ISSUED", `${s.impulse.hq === "general" ? "General initiative" : s.units[s.impulse.hq].name}: ${ACTIONS[command.type]} \u2014 ${u.name}${command.target_id ? " \u2192 " + (s.locations[command.target_id]?.name ?? s.units[command.target_id]?.name ?? command.target_id) : ""}${contributors}.`, { command: structuredClone(command) });
  s.impulse.commands -= costOf(command.type);
  s.impulse.spent += costOf(command.type);
  if ((s.mission_rules?.reattempts || s.patrol) && genericInit(s) && HQ_ORIGIN_ACTIONS.includes(command.type)) {
    s.impulse.origin_spent ??= {};
    s.impulse.origin_spent[command.issuer_id] = (s.impulse.origin_spent[command.issuer_id] ?? 0) + costOf(command.type);
  }
  u.used.push(`${s.impulse.id}:${key}`);
  if (["SKILL_EXTRA_AUTOMATIC", "SKILL_GRENADE_RETURN"].includes(command.type)) {
    const p = skillOptions(s, u, command.type).find((p2) => !command.skill_id || p2.id === command.skill_id);
    s.automatic_skills ??= {};
    s.automatic_skills[u.id] = p.id;
    emit(s, "SKILL_ASSIGNED", `${u.name}: ${SKILLS[p.type].label} assigned to its next ${p.type === "AUTO_GRENADE" ? "grenade return" : "automatic"} attempt.`, { actor: u.id, holder: p.holder, skill_id: p.id });
  } else if (command.skill_id || command.type.startsWith("SKILL_")) {
    const actor = skillActor(s, u, command.type, command.issuer_id), p = skillOptions(s, actor, command.type).find((p2) => !command.skill_id || p2.id === command.skill_id), definition = SKILLS[p.type];
    s.skills.find((v) => v.id === p.id).used = true;
    for (const [id, skill] of Object.entries(s.automatic_skills ?? {})) if (skill === p.id) delete s.automatic_skills[id];
    s.active_skill = { actor: actor.id, extra: definition.extra, icon: definition.icon, applied: false };
    emit(s, "SKILL_USED", `${u.name}: ${definition.label}.`, { actor: u.id, holder: p.holder, skill_id: p.id, skill: p.type });
  }
  execute(s, command);
  delete s.active_skill;
  for (const casualty2 of s.casualties.filter((c) => c.carrier)) {
    const carrier = s.units[casualty2.carrier];
    casualty2.location = carrier.location;
    casualty2.cover = carrier.cover;
  }
  revealTerrain(s);
  refresh(s);
  if (["CEASE_FIRE", "SHIFT_FIRE"].includes(command.type)) {
    const fires = s.fire.filter((f) => f.origin === u.location && s.units[f.source].faction === u.faction);
    const stopped = beforeFire.map((id) => s.units[id].name).join(", ") || "No active sources";
    const reopened = [...new Set(fires.map((f) => s.units[f.source].name))].join(", ");
    emit(s, "FIRE_ORDER_RESULT", `${command.type === "CEASE_FIRE" ? "Card-wide cease fire" : "Card-wide shift fire"} at ${s.locations[u.location].name}. Previous sources: ${stopped}. ${fires.length ? `${command.type === "CEASE_FIRE" ? "Automatic fire reopened" : "Fire now directed"} toward ${[...new Set(fires.map((f) => s.locations[f.target].name))].join(", ")} by ${reopened}.` : "Fire stopped; no eligible target caused automatic reopening."}`, { actor: u.id, location: u.location, affected: beforeFire, reopened: [...new Set(fires.map((f) => f.source))] });
  }
  emit(s, "COMMAND_RESOLVED", "Order resolved; fire relationships updated.", { caused_by_event_id: event.id });
  s.replay.push({ op: "submitCommand", command: structuredClone(command) });
  return result(state, s, { accepted: true });
}

// tmp/rules27-source/src/sim/company/normandyEvents.js
var FRIENDLY_EARLY = ["SITREP", "COMM", "NO_ARTY", "CHECKING_UP", "HOLD", "ADVANCE", "ADVANCE_PC", "ADVANCE_PC", "RESUPPLY", "RESUPPLY"];
var FRIENDLY_LATE = ["SITREP", "COMM", "NO_ARTY", "CHECKING_UP", "HOLD", "ADVANCE", "ADVANCE_PC", "RESUPPLY", "RESUPPLY", "RESUPPLY"];
var ENEMY = ["EVAC", "DISPLACE_MORTAR", "DISPLACE_LEADER", "DISPLACE_HMG", "RALLY", "RALLY", "FALL_BACK", "FALL_BACK", "COUNTER_ATTACK", "COUNTER_ATTACK"];
var leadRow = (s) => Math.max(0, ...values(s.units).filter((u) => friendly(u) && live(u)).map((u) => s.locations[u.location].row));
function resolveNormandyEvent(s, side, choice = {}) {
  let code, event;
  if (s.pending_event) {
    if (s.pending_event.side !== side) throw new Error("Resolve the pending higher HQ event first.");
    code = s.pending_event.code;
    event = s.hq_events.findLast((e) => e.turn === s.turn && e.side === side && e.code === code);
    if (!choice.ammo_type || !choice.location) throw new Error("Choose ammunition type and Row 1 destination.");
    s.pending_event = null;
  } else {
    if (s.turn === 1) return emit(s, "HQ_EVENT_NONE", `${side}: no higher HQ event on turn 1.`);
    if (!draw(s, 1, `${side} higher HQ event check`)[0].hq) return emit(s, "HQ_EVENT_NONE", `${side}: no higher HQ event.`);
    const table = side === "friendly" ? (s.turn <= 6 ? s.mission_rules.friendly_event_tables?.early : s.mission_rules.friendly_event_tables?.late) ?? (s.turn <= 6 ? FRIENDLY_EARLY : FRIENDLY_LATE) : (s.turn <= 6 ? s.mission_rules.enemy_event_tables?.early : s.mission_rules.enemy_event_tables?.late) ?? ENEMY;
    code = table[randomNumber(s, 10, `${side} higher HQ event`) - 1];
    event = { side, code, turn: s.turn, lead: leadRow(s), completed: false };
    s.hq_events.push(event);
    if (code === "RESUPPLY" && !choice.ammo_type) {
      s.pending_event = { side, code, turn: s.turn };
      emit(s, "HQ_EVENT_CHOICE_REQUIRED", "Choose one ammunition type and a Row 1 resupply card.", { side, code });
      return event;
    }
  }
  if (side === "friendly") {
    if (code === "SITREP") s.command_obligation = 3;
    if (code === "COMM") {
      s.bn_blocked = true;
      s.command_obligation = 2;
    }
    if (code === "NO_ARTY") s.support_unavailable.push("artillery");
    if (code === "HOLD") s.forward_row_blocked = event.lead + 1;
    if (code === "CHECKING_UP") {
      const officers = ["REGIMENTAL_STAFF", "BATTALION_COMMANDER", "BATTALION_STAFF"];
      const profile = pick(s, officers, "Higher HQ visitor");
      const commander = companyCommander(s);
      const id = `higher_${s.next_id++}`;
      s.units[id] = { id, name: profile.replaceAll("_", " "), kind: "STAFF", command_role: "higher_hq", capabilities: { higher_priority: officers.indexOf(profile) }, faction: "friendly", location: commander.location, platoon: null, cohesion: "GOOD", experience: "Line", steps: [{ id: `${id}_step1`, personnel: [] }], radios: [], assets: {}, saved: 0, used: [], removed: null, pinned: false, exposed: false, cover: commander.cover, vof: null, range: 0, expires_turn: s.turn + 1 };
      s.higher_hq_on_map = true;
    }
    if (code === "RESUPPLY") {
      const key = choice.ammo_type, location = choice.location;
      if (!["MG", "MTR", "RKT"].includes(key) || s.locations[location]?.row !== 1) throw new Error("Choose an ammunition type and a Row 1 destination.");
      s.assets.push({ id: `asset_${s.next_id++}`, type: "AMMO", key, quantity: 4, location, cover: null, faction: "friendly" });
      event.choice = { ammo_type: key, location };
    }
  } else {
    const enemies = values(s.units).filter((u) => !friendly(u) && live(u));
    if (code === "EVAC") s.casualties = s.casualties.filter((c) => c.faction !== "enemy" || occupants(s, c.location).some(friendly));
    if (code.startsWith("DISPLACE_")) {
      const kind = code.slice(9);
      for (const u of enemies.filter((u2) => u2.kind === kind && !occupants(s, u2.location).some(friendly))) {
        u.removed = "DISPLACED";
        u.fire = null;
        u.event_acted = s.turn;
        emit(s, "HQ_EVENT_FORMATION", `${u.name} displaced.`, { actor: u.id, location: u.location, faction: "enemy" }, true);
      }
    }
    if (code === "RALLY") for (const u of enemies) {
      const pinned = u.pinned;
      if (pinned) rally(s, u);
      else if (["P", "L", "F"].includes(u.cohesion)) rally(s, u, u, true);
      if (pinned || ["P", "L", "F", "A"].includes(u.cohesion)) u.event_acted = s.turn;
    }
    if (code === "FALL_BACK") for (const u of enemies.filter((u2) => !u2.pinned)) {
      const l = s.locations[u.location], to = s.locations[`r${l.row + 1}c${l.col}`];
      if (to && !to.staging) {
        u.location = to.id;
        u.cover = null;
        u.fire = null;
        u.event_acted = s.turn;
        u.exposed = true;
      } else {
        u.removed = "WITHDRAWN";
        u.event_acted = s.turn;
      }
    }
    if (code === "COUNTER_ATTACK") {
      const occupied = values(s.locations).filter((l) => !l.staging && occupants(s, l.id).some(friendly));
      const letters = ["A", "B", "C"].flatMap((type) => Array(Math.max(0, 16 - values(s.contacts).filter((pc) => !pc.resolved && pc.type === type).length)).fill(type));
      event.placements = [];
      for (const l of occupied) {
        if (!letters.length) break;
        const type = pick(s, letters, "Counterattack remaining PC letter", true), index2 = letters.indexOf(type);
        letters.splice(index2, 1);
        const id = `pc_counter_${s.next_id++}`, pc = { id, location: l.id, type, resolved: false, counterattack: true, revealed: false };
        s.contacts[id] = pc;
        const overlaps = values(s.contacts).filter((c) => c.location === l.id && !c.resolved);
        if (overlaps.length > 1) {
          for (const c of overlaps) c.revealed = true;
          const keep = overlaps.sort((a, b) => a.type.localeCompare(b.type) || Number(b.counterattack) - Number(a.counterattack))[0];
          for (const c of overlaps) if (c !== keep) {
            c.resolved = true;
            c.removed_by_event = true;
            letters.push(c.type);
          }
        }
        event.placements.push(l.id);
      }
      s.enemy_tactics = "offensive_assault";
      s.counterattack_ends_after = s.turn + 2;
    }
  }
  applyPatrolEvent(s, side, code, event);
  emit(s, "HQ_EVENT", `${side} higher HQ: ${code.replaceAll("_", " ").toLowerCase()}.`, { side, code, turn: s.turn, ...event.choice ?? {}, lead: event.lead, ...event.waypoint !== void 0 ? { waypoint: event.waypoint, ignored: event.ignored } : {}, ...event.placements ? { placements: event.placements } : {}, counterattack_ends_after: s.counterattack_ends_after ?? null });
  refresh(s);
  return event;
}

// tmp/rules27-source/src/sim/company/missionFeatures.js
function discoveredCover(s, l, known = true, enemy = false) {
  let type = "Cover", value = 1, upper = false;
  if (s.mission_rules?.coverTable === "normandy" && l.building) {
    const roll = randomNumber(s, 8, `${l.name}: Normandy building cover`, !known);
    const table = { village: [[3, 0], [3, 0], [3, 0], [3, 1], [2, 0], [2, 1], [1, 0], [1, 0]], farm: [[3, 0], [3, 1], [2, 0], [2, 1], [1, 0], [1, 0], [1, 0], [1, 0]], cemetery: [[3, 0], [2, 0], [2, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0]], church: [[3, 0], [3, 0], [3, 0], [3, 0], [3, 1], [3, 1], [1, 0], [1, 0]] };
    [value, upper] = table[l.terrain][roll - 1];
    type = value === 3 ? "Strong Building" : value === 2 ? "Light Building" : "Cover";
  } else if (s.mission_rules?.coverTable && l.building) {
    const roll = randomNumber(s, 4, `${l.name}: building cover`, !known);
    value = { village: [3, 3, 2, 1], farm: [3, 2, 1, 1], church: [3, 3, 3, 1], cemetery: [3, 2, 1, 1] }[l.terrain][roll - 1];
    type = value === 3 ? "Strong Building" : value === 2 ? "Light Building" : "Cover";
  }
  const c = { id: `cover_${s.next_id++}`, type, value, known, discovered: !enemy };
  l.covers.push(c);
  if (value > 1 && (s.mission_rules?.coverTable === "normandy" ? upper : l.multi_story || l.tower)) l.covers.push({ id: `cover_${s.next_id++}`, type: l.tower ? "Church Tower" : "Upper Story", value, known, parent: c.id, elevation: 1, capacity: l.tower ? 1 : null });
  return c;
}
function checkMines(s, u) {
  if (!s.locations[u.location].mines || !live(u)) return;
  const hit = draw(s, 3, `${visible(s, u) ? u.name : "Enemy"}: mine check`, !visible(s, u)).some((c) => c.burst || c.short);
  if (hit) {
    u.mine_hit = true;
    s.markers.push({ type: "MINES", location: u.location, target: u.id, value: -4 });
  }
  emit(s, "MINE_CHECK", `${visible(s, u) ? u.name : "Enemy"} ${hit ? "triggered mines; cannot move again this turn" : "avoided the mines"}.`, { actor: visible(s, u) ? u.id : null, location: u.location, hit }, !visible(s, u));
}
function secureStatus(s, id) {
  const units5 = occupants(s, id), cleared = !values(s.contacts).some((c) => c.location === id && !c.resolved) && !units5.some((u) => !friendly(u));
  return { cleared, secured: cleared && units5.some(friendly) };
}
function scoreMission(s, { final = false } = {}) {
  if (!s.objectives) return;
  if (s.patrol) {
    scorePatrol(s, { final });
    return;
  }
  const add3 = (key, points, text) => {
    if (!s.achievements.some((a) => a.key === key)) {
      s.achievements.push({ key, points, text, turn: s.turn });
      emit(s, "ACHIEVEMENT", `${text}: +${points} points.`, { key, points });
    }
  };
  for (const e of s.hq_events.filter((e2) => e2.side === "friendly" && e2.turn === s.turn)) {
    if (s.phase === "CLEANUP") {
      const advanced = s.events.some((v) => v.turn === s.turn && v.type === "UNIT_MOVED" && s.units[v.actor]?.faction === "friendly" && s.locations[v.target]?.row > e.lead);
      if (["ADVANCE", "ADVANCE_PC"].includes(e.code) && e.lead < (s.boundaries?.rows ?? Math.max(...values(s.locations).map((l) => l.row)))) e.completed = advanced;
      if (e.code === "HOLD") e.completed = !advanced;
    }
    if (e.completed) add3(s.mission_rules?.reattempts ? `event_${s.attempt_number ?? 1}_${e.turn}_${e.code}` : `event_${e.turn}_${e.code}`, 1, "Higher HQ obligation completed");
  }
  if (final) {
    for (const [key, points] of [["primary", 5], ["secondary", 4], ["attack", 3]]) if (secureStatus(s, s.objectives[key]).secured) add3(key, points, `${key} objective secured`);
    const positions = ["primary", "secondary", "attack"].map((key) => s.objectives[key]);
    for (const pc of values(s.contacts)) if (!positions.includes(pc.location) && pc.resolved && secureStatus(s, pc.location).cleared) {
      const original = s.mission_rules?.reattempts ? s.contacts[`pc_${pc.location}`] ?? pc : pc;
      add3(s.mission_rules?.reattempts ? `clear_${pc.location}` : `clear_${pc.id}`, original.type === "A" ? 2 : 1, `${s.locations[pc.location].name} cleared`);
    }
  }
  for (const e of s.events) {
    if (e.type === "CASUALTY_EVACUATED") add3(`evac_${e.step_id}`, 1, "Friendly casualty evacuated");
    if (e.type === "GRENADE_ATTEMPT" && e.success && e.point_blank && s.units[e.actor]?.faction === "friendly") add3(`grenade_${e.id}`, 1, "Successful point-blank grenade attack");
    if (e.type === "UNIT_CAPTURED" && e.faction === "enemy") for (const id of e.step_ids ?? []) add3(`prisoner_${id}`, 2, "Enemy prisoner captured");
    if (e.type === "ENEMY_CASUALTY_CAPTURED") add3(`enemy_casualty_${e.step_id}`, 1, "Enemy casualty captured");
  }
  if (final) {
    for (const l of values(s.locations)) for (const c of l.covers.filter((c2) => c2.known && c2.enemy_original && ["Bunker", "Pillbox"].includes(c2.type))) if (!occupants(s, l.id).some((u) => !friendly(u) && u.cover === c.id)) add3(`fort_${c.id}`, c.type === "Pillbox" ? 2 : 1, `${c.type} cleared`);
  }
}
var FRIENDLY = [["COMM", "COMM", "COMM", "ADVANCE", "ADVANCE", "ADVANCE", "HOLD", "NO_MORTAR", "NO_MORTAR", "NO_ARTY"], ["SITREP", "SITREP", "COMM", "ADVANCE", "ADVANCE", "HOLD", "AMMO", "NO_MORTAR", "NO_ARTY", "NO_ARTY"], ["SITREP", "SITREP", "COMM", "ADVANCE", "HOLD", "AMMO", "AMMO", "AMMO", "NO_MORTAR", "NO_ARTY"]];
var ENEMY2 = [["REINFORCE", "UNPIN", "UNPIN", "UNPIN", "UNPIN", "UNPIN", "RECOVER", "RECOVER", "RECOVER", "BREAK"], ["EVAC", "EVAC", "REINFORCE", "REINFORCE", "UNPIN", "UNPIN", "RECOVER", "AMMO", "AMMO", "BREAK"], ["EVAC", "EVAC", "REINFORCE", "REINFORCE", "UNPIN", "RECOVER", "AMMO", "AMMO", "BREAK", "SURRENDER"]];
function higherEvent(s, side, choice) {
  if (s.mission_rules?.events === "normandy") return resolveNormandyEvent(s, side, choice);
  if (!s.mission_rules?.events || s.turn === 1) return;
  if (!draw(s, 1, `${side} higher HQ event check`)[0].hq) {
    emit(s, "HQ_EVENT_NONE", `${side}: no higher HQ event.`);
    return;
  }
  const table = (side === "friendly" ? FRIENDLY : ENEMY2)[s.turn < 5 ? 0 : s.turn < 8 ? 1 : 2], code = table[randomNumber(s, 10, `${side} higher HQ event`) - 1];
  const effect = { side, code, turn: s.turn, lead: Math.max(0, ...values(s.units).filter((u) => friendly(u) && live(u)).map((u) => s.locations[u.location].row)), completed: false };
  s.hq_events.push(effect);
  const units5 = values(s.units).filter((u) => live(u) && u.faction === side);
  if (code === "COMM") s.bn_blocked = true;
  if (["COMM", "SITREP"].includes(code)) s.command_obligation = 3;
  if (code === "NO_MORTAR") s.support_unavailable.push("mortar");
  if (code === "NO_ARTY") s.support_unavailable.push("artillery");
  if (code === "AMMO") for (const u of units5.filter((u2) => ["MG", "LMG", "HMG"].includes(u2.kind))) {
    u.out_of_ammo = !u.out_of_ammo;
    if (side === "enemy") u.event_acted = s.turn;
    emit(s, "HQ_EVENT_FORMATION", `${u.name}: ${u.out_of_ammo ? "Out of ammo; reduced fire capability" : "ammunition restored"}.`, { actor: u.id, location: u.location, faction: u.faction, code }, !visible(s, u));
  }
  if (code === "REINFORCE") for (const pc of values(s.contacts).filter((c) => !c.resolved)) pc.type = "A";
  for (const u of units5) {
    const before = { pinned: u.pinned, cohesion: u.cohesion, removed: u.removed };
    if (code === "UNPIN" && u.pinned) {
      u.pinned = false;
      u.event_acted = s.turn;
    }
    if (code === "RECOVER" && ["P", "L"].includes(u.cohesion)) {
      u.cohesion = "F";
      u.experience = "Green";
      u.event_acted = s.turn;
    }
    if (code === "BREAK" && u.cohesion === "P") {
      dropLoad(s, u, "withdrawal");
      u.removed = "WITHDRAWN";
      u.event_acted = s.turn;
    } else if (code === "BREAK" && u.cohesion === "L") {
      u.cohesion = "P";
      u.event_acted = s.turn;
    }
    if (code === "SURRENDER" && occupants(s, u.location).some(friendly)) {
      spot(s, u);
      dropLoad(s, u, "surrender");
      s.prisoners.push({ guard: null, prisoners: structuredClone(u.steps) });
      u.removed = "CAPTURED";
      u.event_acted = s.turn;
      emit(s, "UNIT_CAPTURED", "Enemy formation surrendered without requiring guards.", { actor: u.id, location: u.location, faction: "enemy", step_ids: u.steps.map((step) => step.id) });
    }
    if (before.pinned !== u.pinned || before.cohesion !== u.cohesion || before.removed !== u.removed) emit(s, "HQ_EVENT_FORMATION", `${u.name}: ${u.removed === "CAPTURED" ? "captured" : u.removed ? "withdrawn" : before.pinned && !u.pinned ? "unpinned" : `${before.cohesion} \u2192 ${u.cohesion}`}.`, { actor: u.id, location: u.location, faction: u.faction, code }, !visible(s, u));
  }
  if (code === "EVAC") s.casualties = s.casualties.filter((c) => occupants(s, c.location).some(friendly));
  const descriptions = { COMM: "Communications trouble: no BN activation; first 3 Company HQ commands restore communications.", SITREP: "SITREP: Company HQ must spend its first 3 commands reporting.", ADVANCE: "Advance a unit beyond the leading row this turn for an achievement.", HOLD: "Do not advance beyond the leading row this turn.", AMMO: "Machine-gun ammunition status toggled.", NO_MORTAR: "Battalion mortar support unavailable this turn.", NO_ARTY: "Artillery support unavailable this turn.", REINFORCE: "Remaining B/C contacts upgraded to A.", UNPIN: "Enemy pins removed.", RECOVER: "Enemy Paralyzed/Litter Teams become Fire Teams.", BREAK: "Enemy Paralyzed Teams withdraw; Litter Teams become Paralyzed.", EVAC: "Casualties on cards without U.S. troops evacuated.", SURRENDER: "Enemies sharing U.S. cards surrender." };
  emit(s, "HQ_EVENT", `${side} HQ: ${descriptions[code]}`, { side, code, expires: ["COMM", "SITREP", "ADVANCE", "HOLD", "NO_MORTAR", "NO_ARTY"].includes(code) ? "End of this turn" : null, condition: ["COMM", "SITREP"].includes(code) ? "Spend the first 3 Company HQ commands." : code === "ADVANCE" ? `Advance beyond row ${effect.lead} this turn.` : code === "HOLD" ? `Stay at or behind row ${effect.lead} through this turn.` : code === "AMMO" ? "Status persists until the next ammunition event." : null });
  refresh(s);
}
function shortRoundDestination(s, u, target, hidden = false) {
  const a = s.locations[u.location], b = s.locations[target];
  if (a.id === b.id) return pick(s, values(s.locations).filter((l) => !l.staging && distance2(l, a) === 1), "Short round destination", hidden).id;
  return `r${b.row - Math.sign(b.row - a.row)}c${b.col - Math.sign(b.col - a.col)}`;
}
function supportRequest(s, u, agencyId, ammo, target) {
  const agency2 = s.support_agencies[agencyId], base = agency2.draws[u.agency_role ?? u.id], registered = s.registered_targets[agencyId] === target ? 1 : 0;
  if (s.support_inventory?.[agencyId]?.[ammo] === 0) throw new Error(`${agency2.name} has no ${ammo} missions remaining.`);
  const extra = s.active_skill?.actor === u.id && s.active_skill.extra && !s.active_skill.applied;
  const batch = draw(s, Math.max(1, base + registered + { Green: -1, Line: 0, Veteran: 1 }[u.experience]) + (extra ? 1 : 0), `${u.name}: ${agency2.name} ${ammo}`);
  if (extra) s.active_skill.applied = true;
  let destination = target;
  const short = batch.some((c) => c.short), success = short || batch.some((c) => c.burst);
  if (short) destination = shortRoundDestination(s, u, target);
  if (success && ammo === "ILLUM") {
    placeIllumination(s, destination, agencyId, u.id);
    s.support_inventory[agencyId][ammo]--;
    s.registered_targets[agencyId] = destination;
  } else if (success) {
    const mission = { id: `support_${s.next_id++}`, location: destination, status: "PENDING", value: agency2[ammo], source: u.id, agency: agencyId, ammo };
    s.support.push(mission);
    if (agency2.battalion && !short && batch.some((c) => c.multi)) {
      const choices = adjacent(s, destination).filter((l) => !l.staging).map((l) => l.id);
      if (choices.length >= 2) s.pending_support = { support_id: mission.id, location: destination, adjacent: choices };
    }
    s.registered_targets[agencyId] = destination;
    if (s.support_inventory?.[agencyId]?.[ammo] !== void 0) s.support_inventory[agencyId][ammo]--;
  }
  emit(s, "SUPPORT_REQUEST", `${agency2.name} ${ammo}: ${success ? `${short ? "short round; " : ""}${ammo === "ILLUM" ? "illumination active" : "pending"} at ${s.locations[destination].name}` : "request failed"}.`, { actor: u.id, location: destination, success, agency: agencyId, ammo });
}
function applySupportChoice(s, choice) {
  if (s.status !== "ACTIVE") throw new Error("No active support choice is available.");
  const pending = s.pending_support;
  if (!pending) throw new Error("No battalion fire choice is pending.");
  if (!choice || !Array.isArray(choice.locations) || ![0, 2].includes(choice.locations.length) || new Set(choice.locations).size !== choice.locations.length || choice.locations.some((id) => !pending.adjacent.includes(id))) throw new Error("Choose ordinary fire or two different adjacent battlefield cards.");
  const original = s.support.find((m) => m.id === pending.support_id);
  for (const location of choice.locations) s.support.push({ ...structuredClone(original), id: `support_${s.next_id++}`, location });
  emit(s, "BATTALION_FIRE_SELECTED", choice.locations.length ? "Battalion fire added two adjacent cards." : "Ordinary fire selected.", { location: pending.location, locations: [...choice.locations] });
  s.pending_support = null;
}
function scorePatrol(s, { final }) {
  const add3 = (key, points, text) => {
    if (!s.achievements.some((a) => a.key === key)) {
      s.achievements.push({ key, points, text, turn: s.turn, platoon: s.patrol.plan.platoon });
      emit(s, "ACHIEVEMENT", `${text}: +${points} points.`, { key, points, platoon: s.patrol.plan.platoon });
    }
  };
  if (final) {
    if (secureStatus(s, s.patrol.plan.primary).cleared) add3(`clear_${s.patrol.plan.primary}`, 4, "Primary patrol objective cleared");
    for (let i = 0; i < s.patrol.visited.length; i++) add3(`route_${s.attempt_number}_${i + 1}`, 1, "Patrol route point visited");
    if (s.patrol.returned) add3(`patrol_${s.attempt_number}`, 5, "Patrol completed successfully");
  }
  for (const e of s.events.slice(s.attempt_history?.at(-1)?.event_count ?? 0)) {
    const actor = s.units[e.actor];
    if (e.type === "GRENADE_ATTEMPT" && e.success && e.point_blank && actor?.faction === "friendly" && actor.platoon === s.patrol.plan.platoon) add3(`grenade_${e.id}`, 1, "Successful patrol grenade attack");
    if (e.type === "UNIT_CAPTURED" && e.faction === "enemy") for (const id of e.step_ids ?? []) add3(`prisoner_${id}`, 2, "Enemy prisoner captured");
    if (e.type === "ENEMY_CASUALTY_CAPTURED") add3(`enemy_casualty_${e.step_id}`, 1, "Enemy casualty captured");
    if (e.type === "CASUALTY_EVACUATED") {
      const formationId = s.roster_snapshot?.steps[e.step_id]?.formation_id;
      const owner = s.units[formationId] ?? values(s.units).find((u) => u.steps.some((t) => t.id === e.step_id));
      if (owner?.platoon === s.patrol.plan.platoon) add3(`evac_${e.step_id}`, 1, "Patrol casualty evacuated");
    }
  }
}

// tmp/rules27-source/src/sim/company/attemptRecords.js
function recordAttemptStart(state, choices = null) {
  const { events, replay, attempt_records, attempt_history, ...start } = state;
  const record = {
    schema: 1,
    mission_run_id: state.mission_instance_id,
    attempt_id: `${state.mission_instance_id}:attempt:${state.attempt_number}`,
    number: state.attempt_number,
    choices: structuredClone(choices),
    starting_state: structuredClone(start)
  };
  state.attempt_records ??= [];
  state.attempt_records.push(record);
}

// tmp/rules27-source/src/sim/company/campaignRoster.js
var CAMPAIGN_SCHEMA = 1;
var copy = (value) => structuredClone(value);
function assertRecord(record) {
  if (record?.schema !== CAMPAIGN_SCHEMA) throw new Error(`Unsupported campaign schema ${record?.schema ?? "missing"}. Export the original save; no migration was applied.`);
  if (!record.company_id || !Number.isInteger(record.revision) || !record.formations || !record.people || !record.steps || !record.applied_missions) throw new Error("Incomplete campaign roster.");
  return record;
}
function createCampaignRoster(companyId, scenario) {
  if (!companyId || !scenario?.units?.length) throw new Error("A company ID and authored roster are required.");
  const formations = {}, steps = {}, people = {};
  let number = 0;
  for (const unit of scenario.units) {
    formations[unit.id] = { id: unit.id, name: unit.name, kind: unit.kind, platoon: unit.platoon ?? null, capacity: unit.steps, experience: unit.experience, step_ids: [] };
    for (let i = 0; i < unit.steps; i++) {
      const stepId = `${unit.id}_step${i + 1}`;
      formations[unit.id].step_ids.push(stepId);
      const personIds = [];
      for (let n = 0; n < (unit.kind === "SQUAD" ? 4 : 2); n++) {
        const id = `${companyId}_person_${++number}`;
        personIds.push(id);
        people[id] = { id, name: `Soldier ${number}`, origin: unit.id, disposition: "ACTIVE" };
      }
      steps[stepId] = { id: stepId, formation_id: unit.id, person_ids: personIds, experience: unit.experience, disposition: "ACTIVE" };
    }
  }
  if (scenario.unit_options?.mortar) {
    const section = formations[scenario.unit_options.mortar.section_id];
    for (const [i, team] of scenario.unit_options.mortar.teams.entries()) formations[team.id] = { id: team.id, name: team.name, kind: team.kind, platoon: null, capacity: 1, experience: team.experience, step_ids: [section.step_ids[i]] };
  }
  return { schema: CAMPAIGN_SCHEMA, company_id: companyId, revision: 0, formations, steps, people, applied_missions: {} };
}
function rosterSnapshot(record) {
  const source = assertRecord(record);
  return copy({ company_id: source.company_id, revision: source.revision, formations: source.formations, steps: source.steps, people: source.people });
}

// tmp/rules27-source/src/sim/company/normandyContent.js
var REQUIRED_KINDS = ["SQUAD", "LMG", "HMG", "SNIPER", "SPOTTER", "LEADER", "MORTAR", "FLAK88"];
var COVERS = /* @__PURE__ */ new Set([null, "Cover", "Foxholes", "Trench", "Bunker", "Pillbox", "Deep Bunker"]);
var VOFS = /* @__PURE__ */ new Set([null, "S", "A", "A/S", "H", "G", "S!"]);
function validateNormandyContent(definition) {
  if (definition.rules?.enemyActivity !== "normandy") return;
  const kinds = definition.rules.required_enemy_kinds ?? REQUIRED_KINDS;
  const counters2 = definition.enemy_counters ?? [], packages3 = definition.packages ?? {};
  if (new Set(counters2.map((c) => c.id)).size !== counters2.length) throw new Error("Duplicate Normandy enemy counter ID.");
  for (const kind of kinds) if (!counters2.some((c) => c.kind === kind)) throw new Error(`Missing Normandy enemy profile: ${kind}.`);
  for (const c of counters2) if (!kinds.includes(c.kind) || !Number.isInteger(c.steps) || c.steps < 1 || c.steps > 3 || !Number.isInteger(c.range) || c.range < 0 || c.range > 3 || !VOFS.has(c.vof) || !c.id || Object.entries(c.ammo ?? {}).some(([key, n]) => !["MG", "MTR", "GUN"].includes(key) || !Number.isInteger(n) || n < 0) || Object.entries(c.vof_by_steps ?? {}).some(([steps, vof]) => !["1", "2", "3"].includes(steps) || !VOFS.has(vof))) throw new Error(`Unsupported Normandy enemy profile: ${c.id ?? c.kind}.`);
  for (let number = 1; number <= (definition.rules.package_count ?? 12); number++) {
    const entry = packages3[number];
    if (entry?.illumination && (!definition.rules.patrols || !ILLUMINATION_PROFILES[entry.illumination])) throw new Error(`Unsupported Normandy package ${number} illumination.`);
    if (!entry) throw new Error(`Missing Normandy package ${number}.`);
    const variants = entry.alternatives ?? [entry];
    for (const variant of variants) {
      for (const spec of [...variant.units ?? [], ...variant.optional?.units ?? []]) if (!kinds.includes(spec.kind) || !counters2.some((c) => c.kind === spec.kind) || !COVERS.has(spec.cover ?? null)) throw new Error(`Unsupported Normandy package ${number} profile or cover: ${spec.kind}.`);
    }
  }
  for (const row of ["A", "B", "C"]) if (definition.package_tables?.[row]?.length !== 10 || definition.package_tables[row].some((number) => !packages3[number])) throw new Error(`Invalid Normandy ${row} contact table.`);
}

// tmp/rules27-source/src/sim/company/missionSetup.js
var SETUP_ASSET_LIMITS = Object.freeze({ smoke: 4, wp: 4, rifle_grenade: 3 });
var SIGNAL_KEYS = Object.freeze(["rsp", "rsc", "gsp", "gsc", "red_signal", "green_signal", "yellow_signal", "purple_signal"]);
var SIGNAL_ORDERS = Object.freeze(["CF", "XPL1", "XPL2", "M2PO", "INFAP2PO", "M2SO", "INFAP2SO", "M2S"]);
function validatePhaseLines(lines, rows) {
  if (!lines || Object.keys(lines).some((k) => !["1", "2"].includes(k)) || [1, 2].some((k) => !Number.isInteger(lines[k]) || lines[k] < 1 || lines[k] > rows) || lines[1] >= lines[2]) throw new Error("Choose ordered Phase Lines 1 and 2 within the mission rows.");
  return structuredClone(lines);
}
function materializeScenario(definition, seed, setup = {}) {
  validateNormandyContent(definition);
  if (!definition.map) {
    if (Object.keys(setup).length) throw new Error("This authored course has no configurable setup.");
    return definition;
  }
  if (Object.keys(setup).some((k) => !["objectives", "assignments", "positions", "assets", "mortar_mode", "mortar_radio_recipient", "command_network", "phone_lines", "signals", "phase_lines", "patrol"].includes(k))) throw new Error("Unknown setup field.");
  if (setup.phase_lines && !definition.rules?.signals) throw new Error("This mission has no configurable phase lines.");
  if (setup.mortar_mode && !definition.unit_options?.mortar) throw new Error("This mission has no mortar setup choice.");
  if (setup.mortar_mode && !["section", "teams"].includes(setup.mortar_mode)) throw new Error("Choose the mortar section or individual teams.");
  if (setup.patrol && !definition.rules?.patrols) throw new Error("This mission has no patrol setup.");
  const eligibleUnits = [...definition.units, ...definition.unit_options?.mortar?.teams ?? []];
  for (const field of ["assignments", "positions", "assets"]) if (Object.keys(setup[field] ?? {}).some((id) => !eligibleUnits.some((u) => u.id === id))) throw new Error("Unknown setup formation.");
  if (Object.keys(setup.objectives ?? {}).some((k) => !["primary", "secondary", "attack", "ccp"].includes(k))) throw new Error("Unknown tactical control.");
  const scenario = structuredClone(definition), random = { rng: createRng(`${seed}:terrain`) }, deck2 = shuffle(random, scenario.map.deck), locations = [];
  if (scenario.rules?.signals) scenario.phase_lines = validatePhaseLines(setup.phase_lines ?? { 1: 1, 2: 2 }, scenario.map.rows);
  if (setup.mortar_mode === "teams") {
    const choice = scenario.unit_options.mortar;
    scenario.units = scenario.units.filter((u) => u.id !== choice.section_id).concat(choice.teams.map((u) => ({ ...u, ...scenario.map.staging === false ? { location: "r1c4" } : {} })));
    const recipient = scenario.units.find((u) => u.id === (setup.mortar_radio_recipient ?? "staff"));
    if (!recipient) throw new Error("Choose a company unit to receive the mortar section CO TAC radio/phone.");
    recipient.radios.push("CO");
  } else if (setup.mortar_radio_recipient) throw new Error("Mortar radio reassignment requires individual mortar teams.");
  if (setup.command_network) {
    if (!definition.unit_options?.command_network || !["radio", "phones"].includes(setup.command_network)) throw new Error("Invalid command network choice.");
    if (setup.command_network === "radio" && setup.phone_lines) throw new Error("Phone lines require the field-phone network.");
    if (setup.command_network === "phones") {
      if (scenario.rules?.patrols) throw new Error("Normandy combat patrols do not permit field phones (campaign p.13).");
      scenario.rules.communications = "phones";
      for (const u of scenario.units) u.radios = u.radios.map((net) => net === "CO" ? "CO_PHONE" : net);
      const lines = setup.phone_lines ?? { [scenario.units.find((u) => u.command_role === "company_commander")?.id ?? "co"]: 4 };
      if (Object.entries(lines).some(([id, count]) => !scenario.units.some((u) => u.id === id) || !Number.isInteger(count) || count < 0) || Object.values(lines).reduce((n, q) => n + q, 0) !== 4) throw new Error("Distribute exactly four phone lines among active company formations.");
      scenario.phone_lines = structuredClone(lines);
    }
  } else if (setup.phone_lines) throw new Error("Phone lines require the field-phone network.");
  for (let row = scenario.map.staging === false ? 1 : 0; row <= scenario.map.rows; row++) for (let col = 1; col <= scenario.map.columns; col++) {
    if (!row) {
      locations.push({ id: `r0c${col}`, name: `Staging ${col}`, row: 0, col, staging: true, terrain: "staging", elevation: 1, protection: 0, cover_limit: 0, cover_draw: 0, borders: null, burst: 0, known: true });
      continue;
    }
    let card = deck2.pop(), elevation = 1, hills = [];
    while (row === 1 && card.terrain === "hill") {
      hills.push(card.id);
      elevation++;
      card = deck2.pop();
    }
    locations.push({ ...card, id: `r${row}c${col}`, terrain_card: card.id, name: `${row}.${col} ${card.name}${hills.length ? " / Hill" : ""}`, row, col, elevation, hills, borders: hills.length ? borders() : card.borders, staging: false, known: !scenario.map.hidden || row === 1 });
  }
  scenario.locations = locations;
  scenario.terrain_deck = deck2;
  if (scenario.rules?.patrols) {
    scenario.patrol_plan = validatePatrolPlan(locations, { ...scenario.patrol_plan, ...setup.patrol });
    scenario.objectives = { ...scenario.objectives, primary: scenario.patrol_plan.primary, secondary: scenario.patrol_plan.primary, attack: scenario.patrol_plan.cop, ccp: scenario.patrol_plan.ccp };
  }
  scenario.contacts = locations.filter((l) => !l.staging && scenario.contact_rows[l.row] && l.id !== scenario.patrol_plan?.cop).map((l) => {
    const type = scenario.contact_rows[l.row];
    return { id: `pc_${l.id}`, location: l.id, type: Array.isArray(type) ? shuffle(random, type)[0] : type, question_side: Array.isArray(type), resolved: false };
  });
  scenario.objectives = { ...scenario.objectives, ...setup.objectives };
  const o = scenario.objectives, get = (id) => locations.find((l) => l.id === id);
  if (!scenario.rules?.patrols && (o.primary === o.secondary || get(o.primary)?.row !== scenario.map.rows || get(o.secondary)?.row !== scenario.map.rows)) throw new Error("Choose two different objectives in the final row.");
  if (!scenario.rules?.patrols && (get(o.attack)?.row !== scenario.map.rows - 1 || ![o.primary, o.secondary].some((id) => Math.abs(get(id).col - get(o.attack).col) <= 1))) throw new Error("Attack position must be adjacent to an objective in the preceding row.");
  if (!get(o.ccp)) throw new Error("Choose a terrain or staging card for the CCP.");
  for (const u of scenario.units) {
    const assignment = setup.assignments?.[u.id];
    if (assignment) {
      if (!(["MG", "HMG", "AT", "MORTAR", "FO"].includes(u.kind) || scenario.rules.patrols && u.kind === "STAFF") || ![0, 1, 2, 3].includes(assignment.platoon) || assignment.platoon === 0 && u.kind !== "FO" && scenario.rules.enemyActivity !== "normandy") throw new Error("Invalid platoon attachment.");
      u.platoon = assignment.platoon || null;
    }
    if (setup.positions?.[u.id]) {
      if (scenario.rules?.patrols) {
        if (setup.positions[u.id] === "RESERVE") {
          u.reserve = true;
        } else {
          if (!get(setup.positions[u.id])) throw new Error("Unknown patrol deployment card.");
          u.location = setup.positions[u.id];
        }
      } else {
        if (!get(setup.positions[u.id])?.staging) throw new Error("Initial units must be in staging.");
        u.location = setup.positions[u.id];
      }
    }
  }
  if (scenario.rules?.patrols) {
    if (setup.objectives) throw new Error("Use patrol controls for this mission.");
    const copPlatoons = /* @__PURE__ */ new Set();
    for (const u of scenario.units.filter((u2) => !u2.reserve)) {
      const card = get(u.location);
      if (card?.row !== 1 && u.location !== scenario.patrol_plan.cop) throw new Error("Deploy patrol formations on Row 1 or the Combat Outpost.");
      if (u.location === scenario.patrol_plan.cop && u.platoon === scenario.patrol_plan.platoon) throw new Error("Start the patrolling platoon and its attachments on Row 1.");
      if (u.location === scenario.patrol_plan.cop && u.platoon) copPlatoons.add(u.platoon);
    }
    for (const card of locations) if (scenario.units.filter((u) => !u.reserve && u.location === card.id).reduce((n, u) => n + u.steps, 0) > 16) throw new Error("Patrol deployment exceeds the sixteen-step card limit.");
    if (copPlatoons.size > 1) throw new Error("Only one platoon may occupy the Combat Outpost.");
    if (!scenario.units.some((u) => !u.reserve && u.platoon === scenario.patrol_plan.platoon && u.kind === "SQUAD")) throw new Error("Deploy at least one squad from the selected patrol platoon.");
  }
  {
    const distributed = setup.assets ?? scenario.assets;
    const totals = { ...SETUP_ASSET_LIMITS, ...scenario.rules.handheldIllumination ? { illum: scenario.rules.handheldIllumination } : {} }, actual = Object.fromEntries(Object.keys(totals).map((k) => [k, 0])), rifles = {};
    for (const [id, assets] of Object.entries(distributed)) {
      const u = scenario.units.find((v) => v.id === id);
      if (!u && Object.values(assets).some(Boolean)) throw new Error("Unknown equipment recipient.");
      for (const [key, n] of Object.entries(assets)) {
        if (!(key in actual) || !Number.isInteger(n) || n < 0) throw new Error("Invalid equipment quantity.");
        actual[key] += n;
        if (key === "rifle_grenade" && n) {
          if (!u?.platoon || n !== 1 || rifles[u.platoon]) throw new Error("Assign exactly one rifle grenade per platoon.");
          rifles[u.platoon] = true;
        }
      }
    }
    if (Object.keys(totals).some((k) => totals[k] !== actual[k])) throw new Error(`Distribute all 4 HC, 4 WP and 3 rifle grenades${scenario.rules.handheldIllumination ? " and 8 handheld illumination devices" : ""}.`);
    scenario.assets = structuredClone(distributed);
  }
  if (scenario.signal_assets) {
    const choices = setup.signals ?? scenario.signal_assets;
    if (Object.keys(choices).length !== SIGNAL_KEYS.length || SIGNAL_KEYS.some((key) => !SIGNAL_ORDERS.includes(choices[key]?.order) || !scenario.units.some((u) => u.id === choices[key]?.carrier))) throw new Error("Assign all eight signal devices to valid formations and offensive orders.");
    scenario.signal_plan = {};
    for (const key of SIGNAL_KEYS) {
      const { carrier, order } = choices[key];
      scenario.signal_plan[key] = order;
      scenario.assets[carrier] ??= {};
      scenario.assets[carrier][key] = (scenario.assets[carrier][key] ?? 0) + 1;
    }
  }
  return scenario;
}

// tmp/rules27-source/src/sim/company/reattempt.js
var rank = { Green: 0, Line: 1, Veteran: 2 };
function prepareReattempt(state, choices) {
  return prepareAttempt(state, choices, false);
}
function preparePatrol(state, choices) {
  return prepareAttempt(state, choices, true);
}
function prepareAttempt(state, choices, patrol) {
  if (patrol) {
    if (!state.patrol || state.status !== "PATROL_COMPLETE" || state.patrol_history.length >= 3) throw new Error("No next patrol is available.");
  } else if (!state.mission_rules?.reattempts || state.status !== "DEFEAT" || (state.attempt_number ?? 1) > state.mission_rules.reattempts) throw new Error("No mission reattempt is available.");
  if (!choices || Object.keys(choices).some((k) => !["reconstitute", "promote", "positions", "covers", "phone_lines", "skills", "phase_lines", "redistribute", ...patrol ? ["patrol", "assignments"] : []].includes(k))) throw new Error("Unknown reattempt preparation choice.");
  const plan = patrol ? validatePatrolPlan(state.locations, choices.patrol) : null;
  if (patrol && (!nextPatrolPlatoons(state.patrol_history).includes(plan.platoon) || plan.cop !== state.patrol.plan.cop)) throw new Error("Choose an unused platoon and retain the mission Combat Outpost.");
  const secured = patrol ? values(state.locations).filter((l) => l.row === 1 || l.id === plan.cop).map((l) => l.id) : values(state.locations).filter((l) => secureStatus(state, l.id).secured).map((l) => l.id);
  if (!secured.length) throw new Error("No secured card remains for reattempt deployment.");
  const s = structuredClone(state), assignments = choices?.reconstitute ?? {}, promotions = choices?.promote ?? {}, placements = choices?.positions ?? {}, covers = choices?.covers ?? {};
  const patrolPoints = patrol ? state.achievements.filter((a) => a.platoon === state.patrol.plan.platoon && !a.spent).reduce((sum, a) => sum + a.points, 0) : null;
  if (patrol) {
    for (const u of values(s.units)) if (friendly(u) && u.removed === "RESERVE" && u.steps.length) u.removed = null;
    for (const [id, p] of Object.entries(choices.assignments ?? {})) {
      const u = s.units[id];
      if (!u || !friendly(u) || !["MG", "HMG", "AT", "MORTAR", "FO", "STAFF"].includes(u.kind) || ![0, 1, 2, 3].includes(p)) throw new Error("Invalid patrol attachment.");
      u.platoon = p || null;
    }
  }
  const linePlacements = choices?.phone_lines ?? {};
  if (choices?.phase_lines) s.phase_lines = validatePhaseLines(choices.phase_lines, s.boundaries.rows);
  for (const u of values(s.units)) if (u.command_role === "higher_hq") delete s.units[u.id];
  for (const runner of s.runners ?? []) if (runner.status === "DISPATCHED") {
    if (s.units[runner.id]?.steps.length) {
      runner.status = "BOX";
      runner.target = null;
    } else runner.status = "LOST";
    delete s.units[runner.id];
  }
  for (const u of values(s.units).filter((u2) => friendly(u2) && live(u2) && u2.named && u2.cohesion === "F")) {
    u.cohesion = "GOOD";
    u.experience = u.original_experience;
    for (const step of u.steps) step.experience ??= u.experience;
  }
  if (Object.keys(linePlacements).some((id) => !s.phone_lines?.some((line) => line.id === id))) throw new Error("Unknown reattempt phone line.");
  for (const line of s.phone_lines ?? []) {
    if (linePlacements[line.id] !== void 0) {
      if (!secured.includes(linePlacements[line.id])) throw new Error("Reposition phone lines only to secured cards.");
      line.location = linePlacements[line.id];
    }
    line.cut = false;
  }
  const consumed = /* @__PURE__ */ new Set(), newHQ = /* @__PURE__ */ new Set();
  for (const [targetId, donorIds] of Object.entries(assignments)) {
    const target = s.units[targetId];
    if (!target || !friendly(target) || target.attachment || !["SQUAD", "HQ", "STAFF", "MG", "HMG", "AT", "MORTAR"].includes(target.kind) || !Array.isArray(donorIds) || !donorIds.length || target.steps.length + donorIds.length > target.max_steps) throw new Error(`Invalid reconstitution for ${targetId}.`);
    if (patrol && state.units[targetId]?.platoon !== state.patrol.plan.platoon) throw new Error("Reconstitute only the completed patrol platoon.");
    const hadSteps = target.steps.length > 0;
    for (const id of donorIds) {
      const donor = s.units[id];
      if (consumed.has(id) || !donor || !friendly(donor) || donor.kind !== "LAT" || !live(donor) || donor.steps.length !== 1 || donor.removed) throw new Error(`Ineligible reconstitution donor: ${id}.`);
      if (patrol && state.units[id]?.platoon !== state.patrol.plan.platoon) throw new Error("Use donors from the completed patrol platoon.");
      consumed.add(id);
      const step = donor.steps.pop();
      step.experience = "Green";
      target.steps.push(step);
      donor.removed = "RECONSTITUTED";
    }
    transferReconstitutionLoads(s, target, [...hadSteps ? [target] : [], ...donorIds.map((id) => s.units[id])]);
    target.removed = null;
    target.cohesion = "GOOD";
    target.pinned = false;
    if (["HQ", "STAFF"].includes(target.kind) && target.steps.length === donorIds.length) {
      target.experience = "Green";
      newHQ.add(targetId);
    }
  }
  let points = patrol ? patrolPoints : s.achievements.reduce((sum, a) => sum + a.points, 0);
  const ownerOf = (id) => values(s.units).find((u) => u.steps.some((step) => step.id === id));
  for (const [stepId, to] of Object.entries(promotions)) {
    const owner = ownerOf(stepId), step = owner?.steps.find((t) => t.id === stepId);
    if (!owner || !friendly(owner) || ["FO", "LAT"].includes(owner.kind) || newHQ.has(owner.id) || !["Line", "Veteran"].includes(to)) throw new Error(`Step ${stepId} cannot be promoted.`);
    if (patrol && state.units[owner.id]?.platoon !== state.patrol.plan.platoon) throw new Error("Only the completed patrol platoon is eligible for promotion.");
    const from = step.experience ?? owner.experience;
    if (rank[to] !== rank[from] + 1) throw new Error(`Promotion must raise ${stepId} by one level.`);
    const cost = to === "Line" ? 1 : 3;
    if (points < cost) throw new Error("Not enough attempt experience.");
    points -= cost;
    step.experience = to;
  }
  for (const u of values(s.units).filter((u2) => friendly(u2) && live(u2))) {
    if (u.kind === "LAT") {
      u.cohesion = "F";
      u.experience = "Green";
    } else if (u.cohesion === "F" && u.named) u.cohesion = "GOOD";
    if (!newHQ.has(u.id) && u.kind !== "LAT") {
      for (const step of u.steps) step.experience ??= u.experience;
      u.experience = combinedExperience(u.steps);
      for (const step of u.steps) step.experience = u.experience;
    }
    if (patrol && placements[u.id] === "RESERVE") {
      u.removed = "RESERVE";
      u.cover = null;
      continue;
    }
    if (!secured.includes(placements[u.id])) throw new Error(`Choose a secured reattempt card for ${u.id}.`);
    u.location = placements[u.id];
    u.cover = null;
  }
  for (const [id, coverId] of Object.entries(covers)) {
    const u = s.units[id], cover = u && s.locations[u.location].covers.find((c) => c.id === coverId && c.discovered);
    if (!u || !friendly(u) || !live(u) || !cover) throw new Error(`Choose discovered cover on ${u?.name ?? id}'s reattempt card.`);
    const taken = values(s.units).filter((v) => v.id !== id && live(v) && v.location === u.location && v.cover === cover.id).reduce((n, v) => n + v.steps.length, 0);
    if (taken + u.steps.length > (cover.capacity ?? 16)) throw new Error(`No room under ${cover.type} for ${u.name}.`);
    u.cover = cover.id;
  }
  for (const l of values(s.locations)) if (!l.staging && values(s.units).filter((u) => friendly(u) && live(u) && u.location === l.id).reduce((n, u) => n + u.steps.length, 0) > 16) throw new Error(`Reattempt deployment exceeds the 16-step limit at ${l.name}.`);
  if (patrol) {
    if ((choices.skills ?? []).some((p) => state.units[p.holder]?.platoon !== state.patrol.plan.platoon)) throw new Error("Assign patrol skills to its eligible platoon HQ.");
    if (!values(s.units).some((u) => friendly(u) && live(u) && u.platoon === plan.platoon && u.kind === "SQUAD")) throw new Error("Deploy a squad from the selected patrol platoon.");
    if (values(s.units).some((u) => friendly(u) && live(u) && u.platoon === plan.platoon && u.location === plan.cop)) throw new Error("Start the patrolling platoon and its attachments on Row 1.");
    const copPlatoons = new Set(values(s.units).filter((u) => friendly(u) && live(u) && u.location === plan.cop && u.platoon).map((u) => u.platoon));
    if (copPlatoons.size > 1) throw new Error("Only one platoon may occupy the Combat Outpost.");
  }
  points = buySkills(s, choices?.skills ?? [], points, { retain: patrol });
  s.attempt_history ??= [];
  s.attempt_history.push({ number: s.attempt_number ?? 1, outcome: patrol ? s.patrol_history.at(-1).outcome : s.status, turns: s.turn, score: s.achievements.reduce((sum, a) => sum + a.points, 0), event_count: s.events.length, casualties: structuredClone(s.casualties), prisoners: structuredClone(s.prisoners) });
  s.attempt_number = patrol ? state.attempt_number + 1 : 2;
  s.attempt_points_spent = (patrol ? patrolPoints : s.achievements.reduce((sum, a) => sum + a.points, 0)) - points;
  if (patrol) for (const a of s.achievements.filter((a2) => a2.platoon === state.patrol.plan.platoon)) a.spent = true;
  s.casualties = [];
  s.assets = [];
  s.prisoners = [];
  s.markers = [];
  s.fire = [];
  s.support = [];
  s.pending_support = null;
  s.registered_targets = patrol ? { artillery: plan.concentration } : {};
  s.support_inventory = Object.fromEntries(Object.entries(s.support_agencies ?? {}).map(([id, agency2]) => [id, structuredClone(agency2.inventory ?? {})]));
  for (const l of values(s.locations)) l.smoke = false;
  for (const u of values(s.units)) if (!friendly(u) && ["P", "L"].includes(u.cohesion)) u.removed = "REATTEMPT_REMOVED";
  for (const u of shuffle(s, values(s.units).filter((u2) => !friendly(u2) && live(u2) && !u2.cover))) {
    const available2 = s.locations[u.location].covers.filter((c) => !c.parent && occupants(s, u.location).filter((v) => v.cover === c.id).reduce((n, v) => n + v.steps.length, 0) + u.steps.length <= (c.capacity ?? 16));
    const best = Math.max(...available2.map((c) => c.value));
    const candidates = available2.filter((c) => c.value === best);
    u.cover = candidates.length ? (candidates.length === 1 ? candidates[0] : pick(s, candidates, "Reattempt enemy cover", true)).id : null;
  }
  for (const u of values(s.units)) {
    if (!friendly(u) && ["P", "L"].includes(u.cohesion)) {
      u.removed = "REATTEMPT_REMOVED";
      continue;
    }
    if (!live(u) && !(patrol && u.removed === "RESERVE" && u.steps.length)) continue;
    if (!friendly(u) && u.cohesion === "F" && u.named && ["MORTAR", "HMG", "LMG", "MG", "FLAK88", "SNIPER", "SPOTTER", "HQ", "STAFF", "LEADER"].includes(u.kind)) {
      u.cohesion = "GOOD";
      u.experience = u.original_experience;
    }
    u.pinned = false;
    u.exposed = false;
    u.saved = 0;
    u.fire = null;
    u.fire_direction = null;
    u.fire_effect = null;
    u.indirect = null;
    u.used = [];
    const original = u.initial_resources;
    if (original) {
      u.radios = structuredClone(original.radios);
      u.assets = structuredClone(original.assets);
      u.ammo = structuredClone(original.ammo);
      u.out_of_ammo = false;
      if (original.missions !== void 0) {
        u.missions_remaining = original.missions;
        u.calls_made = 0;
      }
    }
    if (u.assets.phone_line) u.assets.phone_line = Math.max(0, u.assets.phone_line - s.phone_lines.filter((line) => line.owner === u.id).length);
  }
  if (choices.redistribute !== void 0 && !Array.isArray(choices.redistribute)) throw new Error("Redistribution must be a list.");
  for (const transfer of choices.redistribute ?? []) {
    if (!transfer || Object.keys(transfer).some((k) => !["from", "to", "type", "key", "quantity"].includes(k))) throw new Error("Invalid redistribution choice.");
    const from = s.units[transfer.from], to = s.units[transfer.to], { type, key, quantity } = transfer;
    if (!from || !to || from === to || !friendly(from) || !friendly(to) || !live(from) || !live(to) || !Number.isSafeInteger(quantity) || quantity < 1 || !["RADIO", "EQUIPMENT", "AMMO"].includes(type)) throw new Error("Choose surviving friendly carriers and a positive whole quantity.");
    if (type === "RADIO") {
      if (from.radios.filter((net) => net === key).length < quantity) throw new Error("Insufficient radios for redistribution.");
      for (let n = 0; n < quantity; n++) {
        from.radios.splice(from.radios.indexOf(key), 1);
        to.radios.push(key);
      }
    } else {
      const field = type === "AMMO" ? "ammo" : "assets";
      if (typeof key !== "string" || !Object.hasOwn(from[field], key) || !Number.isSafeInteger(from[field][key]) || from[field][key] < quantity || ["__proto__", "constructor", "prototype"].includes(key)) throw new Error("Insufficient stock for redistribution.");
      from[field][key] -= quantity;
      to[field][key] = (to[field][key] ?? 0) + quantity;
    }
    for (const u of [from, to]) {
      u.initial_resources.radios = structuredClone(u.radios);
      u.initial_resources.assets = structuredClone(u.assets);
      u.initial_resources.ammo = structuredClone(u.ammo);
      u.out_of_ammo = u.ammo.MG === 0 || u.ammo.MTR === 0 || u.ammo.GUN === 0 || u.ammo.RKT === 0;
    }
    emit(s, "REATTEMPT_EQUIPMENT_ASSIGNED", `${from.name} transferred ${quantity} ${key} to ${to.name}.`, { from: from.id, to: to.id, asset_type: type, key, quantity });
  }
  s.turn = 1;
  s.phase = "FRIENDLY_EVENTS";
  s.status = "ACTIVE";
  s.impulse = null;
  s.segment_progress = null;
  s.pending_combat = [];
  s.activated = [];
  s.completed = [];
  s.command_obligation = 0;
  s.bn_blocked = false;
  s.support_unavailable = [];
  s.enemy_tactics = s.mission_rules.tactics ?? "deliberate_defense";
  s.counterattack_ends_after = null;
  s.hq_events = [];
  s.pending_event = null;
  s.forward_row_blocked = null;
  s.higher_hq_on_map = false;
  if (patrol) {
    s.patrol = createPatrolProgress(s.locations, plan);
    s.objectives = { ...s.objectives, primary: plan.primary, secondary: plan.primary, attack: plan.cop, ccp: plan.ccp };
    s.visibility = { light: patrolMoonLight(randomNumber(s, 4, "Patrol moon visibility")), weather: 0 };
    s.patrol_hold = false;
    s.patrol_rain = 0;
    s.registered_targets = {};
    for (const l of values(s.locations).filter((l2) => l2.row >= 2 && l2.row <= 4 && l2.id !== plan.cop)) if (!values(s.contacts).some((pc) => pc.location === l.id && !pc.resolved)) addPatrolContact(s, l);
    for (const u of values(s.units).filter((u2) => friendly(u2) && live(u2))) {
      u.original_experience = u.experience;
      if (u.platoon !== plan.platoon && !u.cover) u.cover = s.locations[u.location].covers.find((c) => c.type === "Foxholes")?.id ?? null;
    }
  }
  s.replay.push({ op: patrol ? "preparePatrol" : "reattempt", choices: structuredClone(choices) });
  if (patrol) emit(s, "PATROL_PREPARED", `Patrol ${s.attempt_number} begins with platoon ${plan.platoon}.`, { attempt: s.attempt_number, platoon: plan.platoon, points_spent: s.attempt_points_spent });
  else emit(s, "MISSION_REATTEMPTED", `${s.mission_name} reattempt begins with retained terrain, contacts and experience awards.`, { attempt: 2, points_spent: s.attempt_points_spent });
  refresh(s);
  recordAttemptStart(s, choices);
  return result(state, s, { accepted: true });
}

// tmp/rules27-source/src/sim/company/missionExpansion.js
function expandContactRay(s, origin, dc, range) {
  if (!s.mission_rules?.contactExpansion) return;
  for (let step = 1; step <= range; step++) {
    const row = origin.row + step, col = origin.col + dc * step, id = `r${row}c${col}`;
    if (s.locations[id]) continue;
    const drawn = [];
    let card, elevation = 1;
    do {
      card = s.terrain_deck.pop();
      if (!card) {
        s.terrain_deck.push(...drawn.reverse());
        return;
      }
      drawn.push(card);
      if (card.terrain === "hill") elevation++;
    } while (card.terrain === "hill");
    s.locations[id] = {
      ...structuredClone(card),
      id,
      row,
      col,
      name: `${row}.${col} ${card.name}${elevation > 1 ? " / Hill" : ""}`,
      terrain_card: card.id,
      hills: drawn.slice(0, -1).map((c) => c.id),
      elevation,
      borders: elevation > 1 ? borders() : structuredClone(card.borders),
      staging: false,
      known: true,
      outside_boundary: true,
      covers: [],
      smoke: false
    };
    emit(s, "MAP_EXPANDED", `Terrain revealed beyond the mission boundary: ${s.locations[id].name}.`, { location: id, terrain_card: card.id });
  }
}

// tmp/rules27-source/src/sim/company/missionContacts.js
function contactDirection(s, origin) {
  if (s.mission_rules?.enemyActivity === "normandy") {
    const number = randomNumber(s, 8, "Enemy contact direction", true);
    return number <= 4 ? 0 : number <= 6 ? -1 : 1;
  }
  const choices = origin.col === 1 ? [-1, 0, 0, 1, 1] : origin.col === 4 ? [-1, -1, 0, 0, 1] : [-1, 0, 1];
  return pick(s, choices, "Enemy contact direction", true);
}
function contactQueue(s, contacts) {
  const ordered = [];
  for (const type of ["A", "B", "C", "?"]) {
    const group = contacts.filter((c) => c.type === type);
    while (group.length) {
      const pc = pick(s, group, "Potential contact evaluation order");
      ordered.push(pc.id);
      group.splice(group.indexOf(pc), 1);
    }
  }
  return ordered;
}
function availableCounters(s, kind) {
  return s.mission_contacts.counters.filter((c) => c.kind === kind && !values(s.units).some((u) => live(u) && u.counter_id === c.id));
}
function packageVariants(p) {
  const { alternatives, optional, ...rest } = p, core = { ...rest, units: p.units ?? [] };
  if (p.alternatives) return p.alternatives.map((option) => ({ ...core, ...option, units: option.units ?? [] }));
  if (p.optional) return [core, { ...core, units: [...core.units, ...p.optional.units] }];
  return [core];
}
function chosenVariant(s, p) {
  if (p.alternatives) return { ...p, ...p.alternatives[randomNumber(s, p.alternatives.length, "Enemy package variant", true) - 1] };
  if (p.optional) {
    const include = p.optional.if_available ? p.optional.units.every((spec) => availableCounters(s, spec.kind).length > 0) : randomNumber(s, 2, "Enemy package optional force", true) === 1;
    return { ...p, units: [...p.units ?? [], ...include ? p.optional.units : []] };
  }
  return p;
}
function along(s, from, to, id) {
  const a = s.locations[from], b = s.locations[to], l = s.locations[id];
  const n = distance2(a, l), d = distance2(a, b);
  return n > 0 && n <= d && l.row === a.row + Math.sign(b.row - a.row) * n && l.col === a.col + Math.sign(b.col - a.col) * n;
}
function placementProbe(s, profile, location, target, coverType = null, actualCover = void 0) {
  const u = { ...profile, id: "placement_probe", location, faction: "enemy", cohesion: "GOOD", mission_weapon: true, cover: null, steps: Array(profile.steps).fill({}), pinned: false, exposed: false };
  const l = s.locations[location], b = s.locations[target];
  let cover = actualCover;
  if (cover === void 0) {
    if (l.building && (l.multi_story || l.tower) && ["SNIPER", "SPOTTER"].includes(profile.kind) && coverType)
      cover = { id: "placement_upper", type: l.tower ? "Church Tower" : "Upper Story", elevation: 1, value: 3 };
    else if (["Bunker", "Pillbox", "Deep Bunker"].includes(coverType)) cover = { id: "placement_fort", type: coverType, arc: [Math.sign(b.row - l.row), Math.sign(b.col - l.col)] };
  }
  if (cover) {
    u.cover = cover.id;
    s = { ...s, locations: { ...s.locations, [location]: { ...l, covers: [...l.covers.filter((c) => c.id !== cover.id), cover] } } };
  }
  return { state: s, unit: u, cover };
}
function canPlaceFire(s, profile, location, target, coverType = null, actualCover = void 0) {
  const probe = placementProbe(s, profile, location, target, coverType, actualCover), u = probe.unit;
  s = probe.state;
  if (occupants(s, location).some(friendly) && !["Bunker", "Pillbox", "Deep Bunker"].includes(probe.cover?.type)) return false;
  const blockers = values(s.units).filter((t) => live(t) && t.location !== target && along(s, location, target, t.location));
  if (blockers.some((t) => !friendly(t) && !overheadAllowed(s, u, target, t.location))) return false;
  if (blockers.some((t) => friendly(t) && !overheadAllowed(s, u, target, t.location) && !profile.tripod)) return false;
  if (profile.kind === "MORTAR" && profile.vof === "G") return location !== target && s.locations[location].terrain !== "woods" && placementLos(s, profile, location, target, profile.range, false, coverType, actualCover);
  return basicFireTargets(s, u, target).includes(target);
}
function placementLos(s, profile, location, target, range, observed, coverType, actualCover) {
  if (observed) return occupants(s, target).filter(friendly).some((u) => unitLos(s, u, location, range));
  const probe = placementProbe(s, profile, location, target, coverType, actualCover);
  return occupants(s, target).filter(friendly).some((t) => unitLos(probe.state, probe.unit, t, range));
}
function contactPlacements(s, pc, profile, used = [], range = profile.range, noFire = false, observed = false, coverType = null, actualCovers = null) {
  const origin = s.locations[pc.location];
  return values(s.locations).filter((l) => !l.staging && l.row > origin.row && !used.includes(l.id) && !used.some((id) => along(s, id, pc.location, l.id) || along(s, l.id, pc.location, id)) && placementLos(s, profile, l.id, pc.location, range, observed, coverType, actualCovers?.get(l.id)) && !occupants(s, l.id).some((u) => !friendly(u)) && !s.fire.some((f) => !friendly(s.units[f.source]) && (f.target === l.id || along(s, f.origin, f.target, l.id))) && !s.support.some((f) => f.status === "ACTIVE" && f.location === l.id && s.units[f.source] && !friendly(s.units[f.source])) && (noFire || canPlaceFire(s, profile, l.id, pc.location, coverType, actualCovers?.get(l.id))));
}
function packageAvailable(s, pc, p, allocated = []) {
  if (!allocated.length && p.illumination && !s.markers.some((m) => m.type === "ILLUMINATION" && m.location === pc.location && m.delivery === p.illumination)) {
    s = structuredClone(s);
    placeIllumination(s, pc.location, p.illumination);
  }
  if (!allocated.length && (p.alternatives || p.optional)) return packageVariants(p).some((v) => packageAvailable(s, pc, v, allocated));
  if (p.mines && s.locations[pc.location].mines) return false;
  if (!allocated.length && p.placement_draw?.point_blank?.length && p.units?.every((spec2) => availableCounters(s, spec2.kind).length) && occupants(s, pc.location).some(friendly)) return true;
  if (!allocated.length && p.point_blank_chance && p.units?.length === 1 && availableCounters(s, p.units[0].kind).length && occupants(s, pc.location).some(friendly)) return true;
  if (allocated.length === (p.units?.length ?? 0)) return true;
  const spec = p.units[allocated.length], noFire = !!p.no_fire || (spec.kind === "SPOTTER" || spec.kind === "LEADER");
  if (spec.same_as_previous || spec.same_as_any) {
    const last = allocated.at(-1);
    return !!last && availableCounters(s, spec.kind).filter((profile) => !allocated.some((a) => a.profile === profile.id)).some((profile) => (noFire || canPlaceFire(s, profile, last.location, pc.location, spec.cover)) && packageAvailable(s, pc, p, [...allocated, { profile: profile.id, location: last.location }]));
  }
  for (const profile of availableCounters(s, spec.kind).filter((c) => !allocated.some((a) => a.profile === c.id))) {
    for (const dc of [-1, 0, 1]) {
      const probe = structuredClone(s);
      expandContactRay(probe, probe.locations[pc.location], dc, noFire ? 3 : profile.range);
      const locations = contactPlacements(probe, pc, profile, allocated.map((a) => a.location), noFire ? 3 : profile.range, noFire, !!p.no_fire, spec.cover);
      const ray = locations.filter((l) => Math.sign(l.col - s.locations[pc.location].col) === dc);
      const far = Math.max(...ray.map((l) => distance2(l, s.locations[pc.location])));
      for (const l of ray.filter((l2) => distance2(l2, s.locations[pc.location]) === far))
        if (packageAvailable(probe, pc, p, [...allocated, { profile: profile.id, location: l.id }])) return true;
    }
  }
  return false;
}
function placePackage(s, pc, p) {
  p = chosenVariant(s, p);
  if (p.illumination) {
    placeIllumination(s, pc.location, p.illumination);
    emit(s, "ILLUMINATION_DEPLOYED", "Incoming mortar illumination at the contact card.", { location: pc.location, delivery: p.illumination });
  }
  if (p.placement_draw) {
    const d = p.placement_draw;
    let n;
    do {
      n = randomNumber(s, d.sides, "Enemy placement branch", true);
    } while (![...d.point_blank ?? [], ...d.close ?? [], ...d.max ?? []].includes(n));
    p = { ...p, point_blank: d.point_blank?.includes(n), close_range: d.close?.includes(n) };
  }
  if (p.close_chance) p = { ...p, close_range: randomNumber(s, 10, "Enemy close-range placement", true) <= 2 };
  if (p.point_blank_chance) p = { ...p, point_blank: randomNumber(s, 10, "Enemy point-blank placement", true) <= 2 };
  if (p.mines) {
    if (s.locations[pc.location].mines) return false;
    s.locations[pc.location].mines = true;
    emit(s, "MINEFIELD_FOUND", `Mines discovered at ${s.locations[pc.location].name}.`, { location: pc.location });
    for (const u of occupants(s, pc.location)) checkMines(s, u);
  }
  if (p.incoming_options) {
    const incoming2 = pick(s, p.incoming_options, "Enemy incoming agency", true);
    p = { ...p, incoming: incoming2.value, incoming_agency: incoming2.agency };
  }
  const used = [];
  for (const spec of p.units ?? []) {
    const pool = availableCounters(s, spec.kind);
    if (!pool.length) return false;
    const profile = pick(s, pool, "Enemy counter selection", true), noFire = !!p.no_fire || (spec.kind === "SPOTTER" || spec.kind === "LEADER"), range = p.close_range ? 1 : noFire ? 3 : profile.range;
    const origin = s.locations[pc.location];
    const rejected = /* @__PURE__ */ new Set(), actualCovers = /* @__PURE__ */ new Map();
    let location, cover;
    if (p.point_blank) {
      location = origin;
      const type = spec.cover ?? "Foxholes";
      cover = origin.covers.find((c) => c.type === type && c.enemy_original);
      if (!cover) {
        cover = { id: `fort_${s.next_id++}`, type, value: { Cover: 1, Foxholes: 1, Trench: 2, Bunker: 3, "Deep Bunker": 3, Pillbox: 4 }[type], known: false, enemy_original: true, capacity: ["Bunker", "Deep Bunker"].includes(type) ? 3 : type === "Pillbox" ? 2 : null };
        origin.covers.push(cover);
      }
    }
    if (spec.same_as_previous || spec.same_as_any) {
      location = s.locations[spec.same_as_any ? pick(s, used, "Strongpoint supporting position", true) : used.at(-1)];
      if (!location) return false;
      cover = ["Trench", "Foxholes", "Deep Bunker"].includes(spec.cover) ? location.covers.find((c) => c.type === spec.cover) : { id: `fort_${s.next_id++}`, type: spec.cover, value: spec.cover === "Bunker" ? 3 : 1, known: false, enemy_original: true, capacity: ["Bunker", "Deep Bunker"].includes(spec.cover) ? 3 : null };
      if (!cover) return false;
      if (!location.covers.includes(cover)) location.covers.push(cover);
      if (spec.cover === "Bunker") cover.arc = [Math.sign(origin.row - location.row), Math.sign(origin.col - location.col)];
    }
    const candidates = (state) => contactPlacements(state, pc, profile, used, range, noFire, !!p.no_fire, spec.cover, actualCovers).filter((l2) => !rejected.has(l2.id));
    while (!location) {
      if (![-1, 0, 1].some((direction2) => {
        const probe = structuredClone(s);
        expandContactRay(probe, origin, direction2, range);
        return candidates(probe).some((l2) => Math.sign(l2.col - origin.col) === direction2);
      })) return false;
      const dc = contactDirection(s, origin);
      expandContactRay(s, origin, dc, range);
      let ray = candidates(s).filter((l2) => Math.sign(l2.col - origin.col) === dc);
      if (!ray.length) {
        emit(s, "CONTACT_DIRECTION_REJECTED", "Invalid contact direction; redraw direction.", { direction: dc }, true);
        continue;
      }
      while (ray.length && !location) {
        const far = Math.max(...ray.map((l3) => distance2(l3, origin))), l2 = pick(s, ray.filter((l3) => distance2(l3, origin) === far), "Enemy contact position", true);
        const before = new Set(l2.covers.map((c) => c.id));
        cover = null;
        if (spec.cover) {
          const value = { Cover: 1, Foxholes: 1, Trench: 2, Bunker: 3, "Deep Bunker": 3, Pillbox: 4 }[spec.cover];
          if (l2.building && spec.cover !== "Deep Bunker") {
            const building = discoveredCover(s, l2, false, true);
            if (building.value >= value) cover = building;
            else l2.covers = l2.covers.filter((c) => c.id !== building.id && c.parent !== building.id);
          }
          if (!cover) {
            cover = { id: `fort_${s.next_id++}`, type: spec.cover, value, known: false, enemy_original: true, capacity: spec.cover === "Pillbox" ? 2 : ["Bunker", "Deep Bunker"].includes(spec.cover) ? 3 : null };
            l2.covers.push(cover);
          }
          if (["Bunker", "Pillbox", "Deep Bunker"].includes(cover.type)) cover.arc = [Math.sign(origin.row - l2.row), Math.sign(origin.col - l2.col)];
          if (["SPOTTER", "SNIPER"].includes(profile.kind)) cover = l2.covers.find((c) => c.parent === cover.id) ?? cover;
        }
        actualCovers.set(l2.id, cover);
        if (placementLos(s, profile, l2.id, pc.location, range, !!p.no_fire, spec.cover, cover) && (noFire || canPlaceFire(s, profile, l2.id, pc.location, spec.cover, cover))) location = l2;
        else {
          l2.covers = l2.covers.filter((c) => before.has(c.id));
          rejected.add(l2.id);
          emit(s, "CONTACT_POSITION_REJECTED", "Actual cover cannot support this firing position; check the next eligible position.", { location: l2.id }, true);
          ray = candidates(s).filter((l3) => Math.sign(l3.col - origin.col) === dc);
        }
      }
    }
    const l = location;
    if ((spec.same_as_previous || spec.same_as_any) && !noFire && !canPlaceFire(s, profile, l.id, pc.location, spec.cover, cover)) return false;
    used.push(l.id);
    const id = `enemy_${s.next_id++}`, u = {
      ...structuredClone(profile),
      id,
      counter_id: profile.id,
      contact_type: pc.type,
      max_steps: profile.steps,
      platoon: null,
      faction: "enemy",
      location: l.id,
      cohesion: "GOOD",
      experience: s.mission_rules?.enemyExperience ?? "Line",
      original_experience: s.mission_rules?.enemyExperience ?? "Line",
      ammo: spec.ammo !== void 0 ? { [profile.kind === "MORTAR" ? "MTR" : profile.kind === "FLAK88" ? "GUN" : "MG"]: spec.ammo } : structuredClone(profile.ammo ?? {}),
      spotter_agency: p.incoming_agency ?? "enemy_mortar",
      missions_remaining: profile.missions ?? null,
      calls_made: 0,
      steps: Array.from({ length: spec.steps ?? profile.steps }, (_, i) => ({ id: `${id}_step${i + 1}`, personnel: [] })),
      named: profile.kind !== "SQUAD",
      pinned: false,
      exposed: !!p.exposed,
      cover: cover?.id ?? null,
      fire: p.no_fire || profile.kind === "SPOTTER" ? null : pc.location,
      hold_fire_until_cleanup: !!p.no_fire,
      indirect: null,
      radios: [],
      assets: structuredClone(profile.assets ?? {}),
      used: [],
      saved: 0,
      removed: null,
      mission_weapon: true,
      placed_turn: s.turn
    };
    u.initial_resources = { radios: [], assets: structuredClone(u.assets), ammo: structuredClone(u.ammo ?? {}), missions: profile.missions ?? null };
    s.units[id] = u;
    if (p.outflanked && p.point_blank) {
      const directions2 = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
      cover.arc = directions2[randomNumber(s, 8, "Outflanked pillbox facing", true) - 1];
      u.fire = null;
      u.hold_fire_until_cleanup = true;
      spot(s, u);
    }
    if (profile.kind === "MORTAR" && profile.vof === "G" && !p.no_fire) {
      const target = occupants(s, pc.location).find(friendly);
      if (target) grenade(s, u, target);
    }
    if (p.infiltration) {
      const success = attempt(s, u, 2, "infiltrate", `${u.name}: patrol placement`, true) > 0;
      u.exposed = !success;
      if (success) {
        const candidate = l.covers.filter((c) => !c.parent && !occupants(s, l.id).some((v) => v.id !== u.id && v.cover === c.id && v.faction === "friendly")).sort((a, b) => b.value - a.value)[0];
        u.cover = candidate?.id ?? u.cover;
      }
    }
    if (p.spotted) spot(s, u);
    if (!p.no_fire && !(p.outflanked && p.point_blank) && profile.kind !== "SPOTTER") {
      s.knowledge.suspected[l.id] = true;
      emit(s, "CONTACT_FIRE", `Fire from ${l.name}; ${p.spotted ? "enemy identified" : "source not yet spotted"}.`, { location: l.id, target: pc.location });
    }
    if (p.incoming) {
      const agency2 = p.incoming_agency ?? "enemy_mortar";
      s.support.push({ id: `support_${s.next_id++}`, source: id, agency: agency2, ammo: "HE", location: pc.location, status: "ACTIVE", value: p.incoming });
      s.registered_targets[agency2] = pc.location;
      if (u.missions_remaining !== null) u.missions_remaining--;
      u.calls_made++;
      emit(s, "INCOMING_FIRE", `Incoming fire at ${s.locations[pc.location].name}.`, { location: pc.location, value: p.incoming, agency: agency2 });
    }
  }
  if (p.incoming && !p.units?.length) {
    const agency2 = p.incoming_agency ?? "enemy_artillery";
    s.support.push({ id: `support_${s.next_id++}`, source: null, agency: agency2, ammo: "HE", location: pc.location, status: "ACTIVE", value: p.incoming });
    s.registered_targets[agency2] = pc.location;
    emit(s, "INCOMING_FIRE", `Incoming fire at ${s.locations[pc.location].name}.`, { location: pc.location, value: p.incoming, agency: agency2 });
  }
  refresh(s);
  return true;
}
function resolveMissionContact(s, pc) {
  const count = s.mission_contacts.draws[s.activity]?.[pc.type];
  if (count === void 0) throw new Error(`Missing ${s.activity}/${pc.type} contact table.`);
  const contact = count === 0 || draw(s, count, `Evaluate contact ${pc.type} at ${s.locations[pc.location].name}`).some((c) => c.word === "Contact");
  pc.resolved = true;
  pc.revealed = true;
  emit(s, "CONTACT_EVALUATED", `${s.locations[pc.location].name}: ${contact ? "enemy activity detected" : "no contact"}.`, { location: pc.location, contact });
  if (!contact) return;
  const table = pc.counterattack && pc.type === "A" ? s.mission_rules.counterattack_table : s.mission_contacts.tables[pc.type];
  if (![...new Set(table)].some((number) => packageAvailable(s, pc, s.mission_contacts.packages[number]))) {
    emit(s, "CONTACT_EXHAUSTED", "Contact evaluation complete; no legal enemy package can be placed.", { location: pc.location });
    return;
  }
  for (; ; ) {
    const number = table[randomNumber(s, table.length, "Enemy package selection", true) - 1], trial = structuredClone(s);
    if (!packageAvailable(s, pc, trial.mission_contacts.packages[number])) {
      emit(s, "PACKAGE_REJECTED", "Enemy package could not be placed; redraw.", { package: number }, true);
      continue;
    }
    const placed = placePackage(trial, pc, trial.mission_contacts.packages[number]);
    if (placed) {
      Object.assign(s, trial);
      return;
    }
    s.rng = trial.rng;
    s.deck = trial.deck;
    s.terrain_deck = trial.terrain_deck;
    for (const [id, l] of Object.entries(trial.locations)) if (!s.locations[id]) s.locations[id] = { ...l, covers: [] };
    for (const e of trial.events.slice(s.events.length).filter((e2) => ["CARDS_DRAWN", "DECK_SHUFFLED", "CONTACT_DIRECTION_REJECTED", "CONTACT_POSITION_REJECTED", "MAP_EXPANDED"].includes(e2.type))) {
      const { id, sequence, ...record } = e;
      s.events.push({ ...record, id: `event_${s.events.length + 1}`, sequence: s.events.length + 1 });
    }
    emit(s, "PACKAGE_REJECTED", "Enemy package could not be placed; redraw.", { package: number }, true);
  }
}

// tmp/rules27-source/src/sim/company/specialEnemies.js
function prepareSpecialTargets(s) {
  if (!s.mission_rules?.specialEnemies) return;
  s.markers = s.markers.filter((m) => m.type !== "SNIPER");
  for (const u of values(s.units).filter((u2) => good(u2) && u2.vof === "S!" && u2.fire)) {
    let targets = occupants(s, u.fire).filter((t2) => u.location !== u.fire || t2.faction !== u.faction);
    if (targets.some((t2) => t2.exposed)) targets = targets.filter((t2) => t2.exposed);
    if (!targets.length) continue;
    const t = pick(s, targets, "Sniper target selection", !targets.some((t2) => visible(s, t2)));
    s.markers.push({ type: "SNIPER", source: u.id, location: t.location, target: t.id, value: -3 });
    emit(s, "SNIPER_TARGET", "Sniper fire singles out a formation.", { actor: visible(s, t) ? t.id : null, location: t.location }, !visible(s, t));
  }
}
function specialActivity(s, u, fallBack2) {
  if (!s.mission_rules?.specialEnemies || !good(u)) return false;
  if (u.kind === "SNIPER") {
    if (s.knowledge.spotted[u.id] && !["Foxholes", "Trench", "Bunker", "Pillbox"].includes(coverOf(s, u)?.type)) {
      fallBack2(s, u);
      if (live(u) && !values(s.units).some((t) => friendly(t) && live(t) && unitLos(s, t, u))) {
        delete s.knowledge.spotted[u.id];
        emit(s, "ENEMY_LOST_SIGHT", "The sniper moved out of sight.", { location: u.location });
      }
    }
    return true;
  }
  if (u.kind !== "SPOTTER") return false;
  if (u.placed_turn === s.turn) return true;
  if (u.missions_remaining === 0) {
    if (u.subsequent_draws) {
      u.removed = "WITHDRAWN";
      emit(s, "UNIT_WITHDREW", "Enemy spotter exhausted its fire missions.", { actor: u.id, location: u.location }, !visible(s, u));
    }
    return true;
  }
  const candidates = values(s.locations).filter((l) => !l.staging && seesCard(s, u, l.id) && occupants(s, l.id).some(friendly));
  if (!candidates.length) return true;
  const agency2 = u.spotter_agency ?? "enemy_mortar", registered = s.registered_targets[agency2];
  const steps = (l) => occupants(s, l.id).filter(friendly).reduce((n, t) => n + t.steps.length, 0), range = (l) => distance2(s.locations[u.location], l);
  candidates.sort((a, b) => Number(b.id === registered) - Number(a.id === registered) || steps(b) - steps(a) || range(a) - range(b));
  const best = candidates[0], equals = candidates.filter((l) => l.id === registered === (best.id === registered) && steps(l) === steps(best) && range(l) === range(best));
  let target = pick(s, equals, "Enemy spotter target", true).id;
  const count = s.mission_rules?.ammo === "tracked" && u.calls_made > 0 ? u.subsequent_draws ?? (agency2 === "enemy_artillery" ? 3 : 4) : 2 + Number(target === registered);
  const cards2 = draw(s, count + (u.subsequent_draws ? Number(target === registered) : 0), "Enemy spotter call for fire", true), short = cards2.some((c) => c.short);
  if (short || cards2.some((c) => c.burst)) {
    if (short) target = shortRoundDestination(s, u, target, true);
    s.support.push({ id: `support_${s.next_id++}`, source: u.id, agency: agency2, ammo: "HE", location: target, status: "PENDING", value: agency2 === "enemy_artillery" ? -4 : -3 });
    s.registered_targets[agency2] = target;
    if (u.missions_remaining !== null && u.missions_remaining !== void 0) u.missions_remaining--;
    u.calls_made = (u.calls_made ?? 0) + 1;
    emit(s, "SUPPORT_REQUEST", "Enemy indirect fire is pending.", { location: target, success: true }, !occupants(s, target).some(friendly));
  } else {
    u.removed = "WITHDRAWN";
    emit(s, "UNIT_WITHDREW", "Enemy spotter withdrew after a failed fire request.", { actor: u.id, location: u.location }, !visible(s, u));
  }
  refresh(s);
  return true;
}

// tmp/rules27-source/src/sim/company/enemyHierarchy.js
function latActivityTable({ pinned, same, covered, leader, cohesion, named, kind, teams, localCasualty, seenCasualties }) {
  if (pinned) {
    if (same && !covered) return leader ? ["COVER", "COVER", "RALLY", "FALL_BACK"] : ["NONE", "COVER", "RALLY", "FALL_BACK", "FALL_BACK"];
    if (same && covered) return leader ? ["NONE", "RALLY", "RALLY"] : ["NONE", "NONE", "RALLY", "FALL_BACK", "FALL_BACK"];
    if (!covered) return leader ? ["NONE", "COVER", "RALLY"] : ["NONE", "NONE", "COVER", "RALLY", "FALL_BACK"];
    return leader ? ["RALLY"] : ["NONE", "NONE", "RALLY", "FALL_BACK"];
  }
  if (leader && !same && teams >= 2 && ["A", "F"].includes(cohesion)) return ["RECONSTITUTE"];
  if (cohesion === "A") return same ? leader ? ["ATTACK"] : ["NONE", "ATTACK"] : leader ? ["NONE", "INFILTRATE", "INFILTRATE"] : ["NONE", "INFILTRATE"];
  if (cohesion === "F" && same) return covered ? leader ? ["NONE", "ATTACK", "FALL_BACK"] : ["NONE", "NONE", "ATTACK", "FALL_BACK", "FALL_BACK"] : leader ? ["NONE", "COVER", "COVER", "FALL_BACK"] : ["NONE", "COVER", "FALL_BACK", "FALL_BACK", "FALL_BACK"];
  if (cohesion === "F" && kind === "LEADER") return leader ? ["RECOVER"] : ["NONE", "RECOVER", "RECOVER"];
  if (cohesion === "F" && named) return leader ? ["RECOVER"] : ["NONE", "RECOVER"];
  if (cohesion === "L") {
    if (localCasualty) return leader ? ["EVACUATE"] : ["NONE", "EVACUATE", "EVACUATE"];
    if (seenCasualties) return leader ? ["NONE", "SEEK_CASUALTY"] : ["NONE", "SEEK_CASUALTY", "SEEK_CASUALTY"];
    return leader ? ["NONE", "RECOVER"] : ["NONE", "NONE", "RECOVER"];
  }
  if (cohesion === "P" && !same) return leader ? ["NONE", "RECOVER"] : ["NONE"];
  return ["NONE"];
}
function hastyActivityTable({ same, covered, outOfAmmo, noLOS, under, validPDF, differentDirection, heavy, stronger, trading }) {
  if (same) return covered ? ["NONE", "FALL_BACK", "ATTACK"] : ["NONE", "COVER", "FALL_BACK", "ATTACK"];
  if (outOfAmmo) return ["NONE", "FALL_BACK", "FALL_BACK"];
  if (!under && noLOS) return ["HIDE"];
  if (!under && validPDF) return ["NONE", "ATTACK"];
  if (under && !covered) return ["NONE", "COVER", "COVER", "FALL_BACK", "ATTACK"];
  if (differentDirection) return ["NONE", "ATTACK", "SHIFT", "SHIFT", "FALL_BACK"];
  if (heavy && validPDF) return ["NONE", "ATTACK", "ATTACK"];
  if (trading) return stronger ? ["NONE", "ATTACK"] : ["NONE", "NONE", "ATTACK", "ATTACK", "FALL_BACK"];
  return ["NONE"];
}

// tmp/rules27-source/src/sim/company/combatProbability.js
var COMBAT_RESULTS = ["MISS", "PIN", "HIT"];
var EXPERIENCES = ["Green", "Line", "Veteran"];
var deck = Object.values(cards).filter((card) => card.id !== 51).sort((a, b) => a.id - b.id);
var freezeDistribution = (order, values2) => {
  const counts = Object.fromEntries(order.map((value) => [value, values2.filter((item) => item === value).length]));
  const total = values2.length;
  return Object.freeze({
    total,
    order: Object.freeze([...order]),
    counts: Object.freeze(counts),
    probabilities: Object.freeze(Object.fromEntries(order.map((value) => [value, counts[value] / total])))
  });
};
var combatResolutionTable = Object.freeze(Object.fromEntries(
  Array.from({ length: 11 }, (_, index2) => [index2 - 4, freezeDistribution(COMBAT_RESULTS, deck.map((card) => card.combat[index2]))])
));
var hitEffectTable = Object.freeze(Object.fromEntries(EXPERIENCES.map((experience) => {
  const values2 = deck.map((card) => card.hit[experience]);
  return [experience, freezeDistribution([...new Set(values2)].sort(), values2)];
})));
function sampleDistribution(distribution, roll) {
  if (!(roll >= 0 && roll < 1)) throw new RangeError("Probability roll must be in [0, 1).");
  const position = roll * distribution.total;
  let cumulative = 0;
  for (const value of distribution.order) {
    cumulative += distribution.counts[value];
    if (position < cumulative) return value;
  }
  return distribution.order.at(-1);
}
function resolveDistribution(distribution, rng) {
  const draw2 = drawRandom(rng), value = sampleDistribution(distribution, draw2.value);
  return { rng: draw2.rng, roll: draw2.value, result: value, distribution };
}
function resolveCombatOutcome(ncm, rng) {
  const distribution = combatResolutionTable[ncm];
  if (!distribution) throw new RangeError(`Unsupported NCM ${ncm}.`);
  return resolveDistribution(distribution, rng);
}
function resolveHitEffect(experience, rng) {
  const distribution = hitEffectTable[experience];
  if (!distribution) throw new RangeError(`Unsupported experience ${experience}.`);
  const resolved = resolveDistribution(distribution, rng);
  return { ...resolved, effect: resolved.result };
}

// tmp/rules27-source/src/sim/company/combat.js
function casualty(s, u, step) {
  const id = `casualty_${s.next_id++}`;
  s.casualties.push({ id, step, origin_name: u.name, location: u.location, cover: u.cover, faction: u.faction, carrier: null, evacuated: false });
  const names = step.personnel.map((id2) => s.personnel[id2]?.name).filter(Boolean);
  for (const id2 of step.personnel) if (s.personnel[id2]) s.personnel[id2].status = "CASUALTY";
  emit(s, "CASUALTY", `${visible(s, u) ? u.name : "Enemy formation"} lost a step${friendly(u) ? `: ${names.join(", ")}` : ""}.`, { actor: visible(s, u) ? u.id : null, personnel: friendly(u) ? step.personnel : [], step_id: visible(s, u) ? step.id : null, location: u.location }, !visible(s, u));
  if (!u.steps.length) emit(s, "FORMATION_LOST", `${u.name}: final step became a casualty.`, { actor: u.id, name: u.name, location: u.location, faction: u.faction, cause: "FINAL_CASUALTY" }, !visible(s, u));
}
function loseAssets(s, u, casualtyLoss = true) {
  for (const net of u.radios) {
    const phone = net.endsWith("_PHONE"), destroyed = casualtyLoss && randomNumber(s, 2, `${u.name}: ${phone ? "phone" : "radio"} damage`, !visible(s, u)) === 1;
    s.assets.push({ id: `asset_${s.next_id++}`, type: "RADIO", net, source_unit: u.id, location: u.location, ...s.mission_rules?.specialEnemies ? { cover: u.cover } : {}, destroyed, faction: u.faction });
    emit(s, "RADIO_LOST", `${u.name}: ${net} ${phone ? "phone" : "radio"} ${destroyed ? "destroyed" : "dropped for recovery"}.`, { actor: u.id, net, destroyed }, !visible(s, u));
  }
  if (s.mission_rules?.specialEnemies) {
    for (const [key, quantity] of Object.entries(u.assets)) if (quantity) {
      s.assets.push({ id: `asset_${s.next_id++}`, type: "EQUIPMENT", key, quantity, source_unit: u.id, location: u.location, cover: u.cover, faction: u.faction });
      emit(s, "ASSETS_DROPPED", `${u.name}: carried equipment dropped for recovery.`, { actor: u.id, location: u.location, key, quantity }, !visible(s, u));
    }
  }
  if (s.mission_rules?.ammo === "tracked") {
    for (const [key, quantity] of Object.entries(u.ammo ?? {})) if (quantity) {
      if (casualtyLoss) emit(s, "AMMO_LOST", `${visible(s, u) ? u.name : "Enemy formation"}: carried ammunition lost with the final casualty.`, { actor: visible(s, u) ? u.id : null, location: u.location, key, quantity: visible(s, u) ? quantity : null }, !visible(s, u));
      else s.assets.push({ id: `asset_${s.next_id++}`, type: "AMMO", key, quantity, source_unit: u.id, location: u.location, cover: u.cover, faction: u.faction });
    }
  }
  u.radios = [];
  u.assets = {};
  if (s.mission_rules?.ammo === "tracked") u.ammo = {};
  u.saved = 0;
  for (const c of s.casualties.filter((c2) => c2.carrier === u.id)) c.carrier = null;
}
function mortarBreakdownTeam(s, u, step, cohesion) {
  const id = `mortar_${s.next_id++}`, ammo = { MTR: u.ammo?.MTR ?? 0 };
  const child = { ...structuredClone(u), id, name: `${u.name} surviving mortar team`, kind: "MORTAR", named: true, steps: [step], max_steps: 1, vof: "G", fire_team_vof: "S", ammo, cohesion, experience: cohesion === "F" ? "Green" : u.original_experience, pinned: true, removed: null, fire: null, indirect: null, radios: [], assets: {}, used: [], saved: 0, initial_resources: { radios: [], assets: {}, ammo: { MTR: u.initial_resources?.ammo?.MTR ?? ammo.MTR } } };
  delete child.temporary_pdf;
  s.units[id] = child;
  if (!friendly(u) && s.knowledge.spotted[u.id]) s.knowledge.spotted[id] = { id };
  return child;
}
function applyHit(s, u, letters) {
  const originalCount = u.steps.length, affected = [];
  const twoMG = u.breakdown === "fallschirmjager_a" && originalCount === 2 && letters.includes("F") && randomNumber(s, 2, "Fallschirmj\xE4ger second-step MG breakdown", !visible(s, u)) === 1;
  const mgBefore = u.ammo?.MG ?? 0, mgInitial = u.initial_resources?.ammo?.MG ?? mgBefore;
  for (const letter of letters.slice(0, Math.min(2, originalCount))) {
    const step = u.steps.shift();
    if (!step) break;
    if (letter === "C") casualty(s, u, step);
    else if (s.mission_rules?.ammo === "tracked" && u.kind === "MORTAR" && u.max_steps === 3 && ["A", "F"].includes(letter) && (friendly(u) || originalCount === 2)) affected.push(mortarBreakdownTeam(s, u, step, "F"));
    else if (originalCount === 1 && u.named && ["A", "F"].includes(letter)) {
      u.steps.push(step);
      u.cohesion = "F";
      u.pinned = true;
      affected.push(u);
      break;
    } else {
      const child = splitTeam(s, u, letter, step);
      if (twoMG && letter === "F") {
        child.fire_team_vof = "A";
        child.range = 2;
        child.ammo = { MG: Math.floor(mgBefore / 2) };
        child.initial_resources.ammo = { MG: Math.floor(mgInitial / 2) };
        u.ammo.MG -= child.ammo.MG;
        if (u.initial_resources?.ammo) u.initial_resources.ammo.MG -= child.initial_resources.ammo.MG;
      }
      child.pinned = true;
      affected.push(child);
      if (!friendly(u) && s.knowledge.spotted[u.id]) s.knowledge.spotted[child.id] = { id: child.id };
    }
  }
  if (u.steps.length === 1 && u.kind === "SQUAD") {
    const child = splitTeam(s, u, "F", u.steps.pop());
    if (s.mission_rules?.specialEnemies && u.last_step_vof) {
      child.fire_team_vof = u.last_step_vof;
      if (u.breakdown?.startsWith("fallschirmjager") && child.fire_team_vof === "A") child.range = 2;
    }
    if (s.mission_rules?.ammo === "tracked" && child.fire_team_vof === "A" && u.ammo?.MG !== void 0) {
      child.ammo = { MG: u.ammo.MG };
      child.initial_resources.ammo = { MG: u.initial_resources?.ammo?.MG ?? u.ammo.MG };
      u.ammo.MG = 0;
    }
    child.pinned = true;
    affected.push(child);
    if (!friendly(u) && s.knowledge.spotted[u.id]) s.knowledge.spotted[child.id] = { id: child.id };
  }
  if (s.mission_rules?.ammo === "tracked" && u.kind === "MORTAR" && u.max_steps === 3 && u.steps.length === 1) {
    const child = mortarBreakdownTeam(s, u, u.steps.pop(), u.breakdown === "german_mortar_section" ? "F" : "GOOD");
    u.ammo = {};
    affected.push(child);
  }
  if (u.steps.length) {
    u.pinned = true;
    if (!affected.includes(u)) affected.push(u);
  } else {
    u.removed = "BROKEN";
    const recipient = s.mission_rules?.specialEnemies ? affected.at(-1) : null;
    if (recipient) {
      recipient.radios = [...u.radios];
      recipient.assets = { ...u.assets };
      if (s.mission_rules?.ammo === "tracked") {
        recipient.initial_resources ??= { radios: [], assets: {}, ammo: {} };
        recipient.initial_resources.radios = structuredClone(u.initial_resources?.radios ?? u.radios);
        recipient.initial_resources.assets = structuredClone(u.initial_resources?.assets ?? u.assets);
      }
      if (s.mission_rules?.ammo === "tracked" && recipient.fire_team_vof === "A" && recipient.ammo?.MG === void 0 && u.ammo?.MG !== void 0) {
        recipient.ammo = { MG: u.ammo.MG };
        u.ammo.MG = 0;
      }
      for (const c of s.casualties.filter((c2) => c2.carrier === u.id)) c.carrier = recipient.id;
      u.radios = [];
      u.assets = {};
      u.saved = 0;
      emit(s, "ASSETS_TRANSFERRED", `${u.name}: carried items remain with the final surviving team.`, { actor: u.id, recipient: recipient.id, location: u.location }, !visible(s, u));
    } else loseAssets(s, u, letters.includes("C"));
  }
  if (["P", "L"].includes(u.cohesion)) u.saved = 0;
  emit(
    s,
    "FORMATION_CHANGED",
    `${u.name}: ${letters} hit; ${u.steps.length} step(s) remain in the original formation.`,
    { actor: u.id, effect: letters, formations: affected.map((v) => v.id) },
    !visible(s, u)
  );
}
var distributionRecord = (d) => ({ total: d.total, counts: { ...d.counts }, probabilities: { ...d.probabilities } });
var sourceRecord = (s, source, target) => {
  const unit = s.units[source?.source_id], known = unit && visible(s, unit);
  return source ? {
    kind: source.kind,
    source_id: source.source_id ?? null,
    origin: source.origin,
    value: source.value,
    vof: source.vof,
    ...known ? { steps: unit.steps.length, experience: unit.experience, unit_kind: unit.kind, range: distance2(s.locations[unit.location], s.locations[target.location]) } : {},
    faction: unit?.faction ?? (source.kind === "OFF_MAP_SUPPORT" ? "enemy" : null),
    known: !!known,
    label: source.kind === "OFF_MAP_SUPPORT" ? source.label : source.kind === "ON_MAP_INDIRECT" ? "On-map mortar fire" : source.kind === "MINES" ? "Mine explosion" : source.kind === "SNIPER" ? "Sniper fire" : source.kind === "GRENADE" ? source.label ?? "Grenade effect" : known ? unit.name : "Unidentified fire"
  } : null;
};
function prepareCombat(s) {
  prepareSpecialTargets(s);
  const resolutions = [];
  for (const u of values(s.units).filter(live).sort((a, b) => s.locations[b.location].row - s.locations[a.location].row || s.locations[a.location].col - s.locations[b.location].col || a.id.localeCompare(b.id))) {
    const exposure = combatExposure(s, u);
    if (!exposure) continue;
    const id = `combat_t${s.turn}_${u.id}`;
    const resolution = {
      id,
      target_id: u.id,
      target_name: u.name,
      target_location: u.location,
      target_faction: u.faction,
      target_visible: !!visible(s, u),
      target_experience: u.experience,
      target_kind: u.kind,
      target_steps: u.steps.length,
      target_cohesion: u.cohesion,
      target_pinned: u.pinned,
      ncm: exposure.ncm,
      total: exposure.total,
      parts: structuredClone(exposure.parts),
      modifiers: structuredClone(exposure.modifiers),
      sources: exposure.sources.map((source) => sourceRecord(s, source, u)),
      strongest: sourceRecord(s, exposure.strongest, u),
      probabilities: distributionRecord(combatResolutionTable[exposure.ncm]),
      hit_probabilities: distributionRecord(hitEffectTable[u.experience]),
      status: "PENDING",
      result: null,
      roll: null,
      hit_effect: null,
      hit_roll: null,
      after: null,
      casualty_steps: 0
    };
    resolutions.push(resolution);
    emit(
      s,
      "COMBAT_RESOLUTION_PREPARED",
      `${visible(s, u) ? u.name : "Enemy formation"} faces incoming fire at NCM ${exposure.ncm >= 0 ? "+" : ""}${exposure.ncm}.`,
      { resolution_id: id, actor: visible(s, u) ? u.id : null, location: u.location, ncm: exposure.ncm, modifiers: structuredClone(exposure.modifiers), probabilities: resolution.probabilities },
      !visible(s, u)
    );
  }
  s.pending_combat = resolutions;
  if (s.mission_rules?.ammo === "tracked") {
    const firing = new Set(s.fire.map((f) => f.source));
    for (const u of values(s.units).filter(live)) {
      if (u.ammo?.MG !== void 0 && firing.has(u.id)) expendAmmunition(s, u, "MG");
      if (u.ammo?.MTR !== void 0 && (u.indirect || firing.has(u.id))) expendAmmunition(s, u, "MTR");
      if (u.ammo?.GUN !== void 0 && firing.has(u.id)) expendAmmunition(s, u, "GUN");
    }
  }
  return resolutions;
}
function resolvePreparedCombat(s, resolutionId) {
  const resolution = s.pending_combat?.find((r) => r.id === resolutionId);
  if (!resolution || resolution.status !== "PENDING") throw new Error("Combat resolution is unavailable or already resolved.");
  const u = s.units[resolution.target_id], hidden = !resolution.target_visible;
  const combat = resolveCombatOutcome(resolution.ncm, s.rng);
  s.rng = combat.rng;
  resolution.roll = combat.roll;
  resolution.result = combat.result;
  emit(
    s,
    "COMBAT_RESOLVED",
    `${visible(s, u) ? u.name : "Enemy formation"}: ${combat.result.toLowerCase()} (NCM ${resolution.ncm >= 0 ? "+" : ""}${resolution.ncm}).`,
    {
      resolution_id: resolution.id,
      actor: visible(s, u) ? u.id : null,
      location: resolution.target_location,
      ncm: resolution.ncm,
      modifiers: structuredClone(resolution.modifiers),
      probabilities: resolution.probabilities,
      roll: combat.roll,
      result: combat.result
    },
    hidden
  );
  if (combat.result === "MISS") u.pinned = false;
  if (combat.result === "PIN") u.pinned = true;
  const beforeCasualties = s.casualties.length, beforeEvents = s.events.length;
  if (combat.result === "HIT") {
    const hit = resolveHitEffect(resolution.target_experience, s.rng);
    s.rng = hit.rng;
    resolution.hit_roll = hit.roll;
    resolution.hit_effect = hit.effect;
    emit(
      s,
      "HIT_EFFECT_RESOLVED",
      `${visible(s, u) ? u.name : "Enemy formation"}: ${hit.effect} hit effect (${resolution.target_experience}).`,
      {
        resolution_id: resolution.id,
        actor: visible(s, u) ? u.id : null,
        experience: resolution.target_experience,
        probabilities: resolution.hit_probabilities,
        roll: hit.roll,
        effect: hit.effect
      },
      hidden
    );
    applyHit(s, u, hit.effect);
  }
  const changed = s.events.slice(beforeEvents).find((e) => e.type === "FORMATION_CHANGED");
  resolution.after = (changed?.formations ?? [u.id]).map((id) => s.units[id]).filter(Boolean).map((v) => ({ id: v.id, name: v.name, cohesion: v.cohesion, steps: v.steps.length, pinned: v.pinned, removed: v.removed }));
  resolution.casualty_steps = s.casualties.length - beforeCasualties;
  resolution.status = "RESOLVED";
  return resolution;
}
function newEnemy(s, kind, location, cover, trigger, spotted) {
  const id = `enemy_${s.next_id++}`;
  const squad = kind === "SQUAD", vof = squad ? pick(s, s.enemy_pool.squads, "Enemy squad counter", true) : "A";
  if (squad) s.enemy_pool.squads.splice(s.enemy_pool.squads.indexOf(vof), 1);
  else s.enemy_pool.mg--;
  const count = squad ? 3 : 2;
  const u = {
    id,
    name: squad ? "German rifle squad" : "German LMG",
    kind,
    platoon: null,
    faction: "enemy",
    location,
    vof,
    range: 2,
    steps: Array.from({ length: count }, (_, i) => ({ id: `${id}_step${i + 1}`, personnel: [] })),
    cohesion: "GOOD",
    experience: "Line",
    original_experience: "Line",
    named: !squad,
    pinned: false,
    exposed: false,
    cover: cover?.id ?? null,
    fire: trigger,
    indirect: null,
    radios: [],
    assets: {},
    used: [],
    saved: 0,
    removed: null
  };
  s.units[id] = u;
  if (spotted) spot(s, u);
  return u;
}
var packages = {
  1: { incoming: true },
  2: { mg: 1, fox: 1, row: 2 },
  3: { mg: 1, spotted: true, trigger: true },
  4: { squad: 1, fox: 1, row: 2 },
  5: { squad: 1, trench: 1, row: 3 },
  6: { mg: 1, bunker: 1, row: 3, spotted: true },
  7: { squad: 1, mg: 1, trench: 1, bunker: 1, row: 3 }
};
function placementCandidates(s, p, trigger) {
  if (p.incoming) return [s.locations[trigger]];
  return values(s.locations).filter((l) => !l.staging && (p.trigger ? l.id === trigger : l.row === p.row) && !occupants(s, l.id).some((u) => !friendly(u)) && los(s, l.id, trigger, 2) && (!p.bunker || l.id !== trigger));
}
function available(s, p, trigger) {
  return (!p.mg || s.enemy_pool.mg >= p.mg) && (!p.squad || s.enemy_pool.squads.length >= p.squad) && (!p.fox || s.enemy_pool.fox >= p.fox) && (!p.trench || s.enemy_pool.trench >= p.trench) && (!p.bunker || s.enemy_pool.bunker >= p.bunker) && (!p.incoming || !s.support.some((f) => f.source === "enemy")) && placementCandidates(s, p, trigger).length > 0;
}
var eligibleContacts = (s) => values(s.contacts).filter((pc) => !pc.resolved && occupants(s, pc.location).some(friendly));
function resolveContacts(s, contactId = null) {
  if (s.mission_contacts) {
    for (const pc of eligibleContacts(s).filter((pc2) => contactId === null || pc2.id === contactId)) resolveMissionContact(s, pc);
    return;
  }
  const counts = { NO_CONTACT: { A: 0, B: 0 }, CONTACT: { A: 7, B: 5 }, ENGAGED: { A: 5, B: 3 }, HEAVILY_ENGAGED: { A: 3, B: 2 } };
  for (const pc of eligibleContacts(s).filter((pc2) => contactId === null || pc2.id === contactId)) {
    const count = counts[s.activity][pc.type];
    const contact = count === 0 || draw(s, count, `Evaluate contact ${pc.type} at ${s.locations[pc.location].name}`).some((c) => c.word === "Contact");
    pc.resolved = true;
    emit(s, "CONTACT_EVALUATED", `${s.locations[pc.location].name}: contact marker cleared${contact ? "; enemy activity detected" : "; no contact"}.`, { location: pc.location, contact });
    if (!contact) continue;
    const table = pc.type === "A" ? [1, 2, 2, 2, 3, 4] : [1, 3, 5, 5, 6, 7, 7];
    const eligible = table.filter((n) => available(s, packages[n], pc.location));
    if (!eligible.length) {
      emit(s, "CONTACT_EMPTY", "No additional enemy activity developed.", { location: pc.location });
      continue;
    }
    const number = pick(s, eligible, "Enemy package selection", true), p = packages[number];
    const l = pick(s, placementCandidates(s, p, pc.location), "Enemy placement", true);
    if (p.incoming) {
      s.support.push({ id: `incoming_${s.next_id++}`, location: pc.location, status: "ACTIVE", value: -4, source: "enemy" });
      emit(s, "INCOMING_FIRE", `Incoming artillery at ${s.locations[pc.location].name}.`, { location: pc.location });
    } else {
      let fox, trench, bunker;
      const fort = (type, value) => {
        const c = { id: `fort_${s.next_id++}`, type, value, known: !!p.spotted };
        l.covers.push(c);
        return c;
      };
      if (p.fox) {
        s.enemy_pool.fox--;
        fox = fort("Foxholes", 1);
      }
      if (p.trench) {
        s.enemy_pool.trench--;
        trench = fort("Trench", 2);
      }
      if (p.bunker) {
        s.enemy_pool.bunker--;
        bunker = fort("Bunker", 3);
        const target = s.locations[pc.location];
        bunker.arc = [Math.sign(target.row - l.row), Math.sign(target.col - l.col)];
      }
      if (p.squad) newEnemy(s, "SQUAD", l.id, trench ?? fox, pc.location, p.spotted);
      if (p.mg) newEnemy(s, "MG", l.id, bunker ?? fox, pc.location, p.spotted);
      s.knowledge.suspected[l.id] = true;
      emit(s, "CONTACT_FIRE", `Fire is coming from ${l.name}${p.spotted ? "; enemy identified" : "; source not yet spotted"}.`, { location: l.id, target: pc.location });
    }
    refresh(s);
  }
}
function selectEnemyCover(s, u, location = u.location, advancing = false) {
  const candidates = s.locations[location].covers.filter((c) => coverAvailable(s, u, c, location));
  const score = (c) => {
    const probe = { ...u, location, cover: c.id, exposed: false }, state = { ...s, units: { ...s.units, [u.id]: probe } };
    if (advancing) return values(state.units).some((v) => friendly(v) && live(v) && canFire(state, probe, v.location)) ? c.value : -Infinity;
    return combatExposure(state, probe)?.total ?? c.value;
  };
  const best = Math.max(...candidates.map(score));
  const choices = candidates.filter((c) => score(c) === best && best !== -Infinity);
  return choices.length ? pick(s, choices, "Enemy cover priority", !visible(s, u)) : null;
}
function fallBack(s, u) {
  if (u.exposed || u.mine_hit) return;
  const from = s.locations[u.location];
  if (!friendly(u) && (s.boundaries ? from.row >= s.boundaries.rows || from.col < 1 || from.col > s.boundaries.columns : from.row === Math.max(...values(s.locations).map((l) => l.row)))) {
    if (u.pinned || u.cohesion === "P") dropLoad(s, u, "withdrawal");
    else for (const c of s.casualties.filter((c2) => c2.carrier === u.id)) {
      c.evacuated = true;
      c.carrier = null;
    }
    u.removed = "WITHDRAWN";
    emit(s, "UNIT_WITHDREW", `${u.name} withdrew from the battlefield.`, { actor: u.id, location: u.location, faction: u.faction }, !visible(s, u));
    return;
  }
  const possible = adjacent(s, u.location).filter((l) => (friendly(u) ? l.row < from.row : l.row > from.row) && !movementReason(s, u, l.id));
  if (!possible.length) return;
  const seen = (l) => values(s.units).some((v) => v.faction !== u.faction && live(v) && unitLos(s, v, l.id));
  const protection = (l) => l.protection + Math.max(0, ...l.covers.filter((c) => coverAvailable(s, u, c, l.id)).map((c) => c.value));
  possible.sort((a, b) => Number(seen(a)) - Number(seen(b)) || protection(b) - protection(a));
  const best = possible.filter((l) => seen(l) === seen(possible[0]) && protection(l) === protection(possible[0]));
  move(s, u, pick(s, best, "Retreat destination", !visible(s, u)).id);
  if (s.mission_rules?.enemyActivity === "normandy") u.cover = selectEnemyCover(s, u)?.id ?? null;
}
function enemyCover(s, u) {
  const cover = s.mission_rules?.enemyActivity === "normandy" ? selectEnemyCover(s, u) : s.locations[u.location].covers.filter((c) => coverAvailable(s, u, c)).sort((a, b) => b.value - a.value)[0];
  if (cover) {
    u.cover = cover.id;
    u.exposed = true;
  } else seekCover(s, u);
}
function attack(s, u) {
  const opponents = occupants(s, u.location).filter((v) => v.faction !== u.faction);
  const size = (v) => v.cover ? opponents.filter((t) => t.cover === v.cover).reduce((n, t) => n + t.steps.length, 0) : v.steps.length;
  const areas = opponents.filter((v, i, a) => !v.cover || a.findIndex((t) => t.cover === v.cover) === i);
  const largest = Math.max(0, ...areas.map(size));
  const close = areas.length ? pick(s, areas.filter((v) => size(v) === largest), "Enemy point-blank target", !visible(s, u)) : null;
  if (close) {
    if (["Bunker", "Pillbox", "Deep Bunker"].includes(coverOf(s, u)?.type)) {
      u.cover = null;
      u.exposed = true;
    }
    grenade(s, u, close);
  } else if (u.fire) {
    if (coverOf(s, u)?.type === "Deep Bunker") {
      u.cover = null;
      u.exposed = true;
    }
    const targets = occupants(s, u.fire).filter((v) => v.faction !== u.faction);
    const target = targets.length ? pick(s, targets, "Enemy fire target", !visible(s, u)) : null;
    if (target) {
      if (u.kind === "MORTAR" && u.steps.length === 1 && u.cohesion === "GOOD") grenade(s, u, target);
      else if (u.kind === "LEADER" && u.assets.rifle_grenade && distance2(s.locations[u.location], s.locations[target.location]) <= 1) {
        u.assets.rifle_grenade--;
        grenade(s, u, target);
      } else if (u.kind !== "LEADER") concentrate(s, u, target);
    }
  }
}
function enemyActivity(s) {
  enemyCeaseFire(s);
  const locations = [...new Set(values(s.units).filter((u) => live(u) && !friendly(u)).map((u) => u.location))];
  const processed = /* @__PURE__ */ new Set();
  for (const loc of shuffle(s, locations)) {
    const normandy = s.mission_rules?.enemyActivity === "normandy";
    const units5 = occupants(s, loc).filter((u) => !friendly(u)).sort((a, b) => (normandy ? (a.kind === "LEADER" ? 2 : !good(a) ? 0 : 1) - (b.kind === "LEADER" ? 2 : !good(b) ? 0 : 1) : Number(good(a)) - Number(good(b))) || a.id.localeCompare(b.id));
    for (const u of units5) {
      if (!live(u) || processed.has(u.id) || u.event_acted === s.turn) continue;
      processed.add(u.id);
      if (normandy && good(u) && u.kind === "LEADER") {
        if (!occupants(s, u.location).some((v) => v.id !== u.id && v.faction === u.faction)) {
          u.cohesion = "F";
          u.experience = "Green";
          emit(s, "COHESION_CHANGED", `${u.name}: alone; flipped to Fire Team.`, { actor: u.id, from: "GOOD", to: "F" }, !visible(s, u));
        } else if (!u.assets.rifle_grenade) continue;
      }
      if (specialActivity(s, u, fallBack)) {
        refresh(s);
        continue;
      }
      refresh(s);
      if (normandy && good(u) && u.kind === "LEADER" && u.assets.rifle_grenade) u.fire = occupants(s, u.location).find((v) => v.id !== u.id && v.faction === u.faction && v.fire)?.fire ?? null;
      const same = occupants(s, u.location).some(friendly), under = hasFire(s, u.location, { includeInactiveMines: false }), covered = !!u.cover;
      const casualties = s.casualties.filter((c) => !c.evacuated && c.faction === u.faction && (!c.carrier || c.carrier === u.id));
      const localCasualty = casualties.find((c) => c.location === u.location && c.cover === u.cover);
      const seenCasualties = casualties.filter((c) => unitLos(s, u, c.location));
      const leader = normandy && occupants(s, u.location).some((v) => v.kind === "LEADER" && good(v) && v.cover === u.cover);
      const teams = occupants(s, u.location).filter((v) => v.faction === u.faction && !v.pinned && (normandy ? v.steps.length === 1 : v.kind === "LAT") && ["A", "F"].includes(v.cohesion) && v.cover === u.cover);
      const roll = (n) => randomNumber(s, n, `${u.name}: activity`, !visible(s, u));
      const canFallBack = !u.exposed && !u.mine_hit && (s.locations[u.location].row >= (s.boundaries?.rows ?? 3) || s.locations[u.location].col < 1 || s.locations[u.location].col > (s.boundaries?.columns ?? 4) || adjacent(s, u.location).some((l) => l.row > s.locations[u.location].row && !movementReason(s, u, l.id)));
      const choices = (list) => {
        const legal = !s.mission_contacts ? list : list.filter((a) => {
          if (["FALL_BACK", "EVACUATE"].includes(a)) return canFallBack;
          if (a === "COVER") return s.locations[u.location].covers.some((c) => coverAvailable(s, u, c)) || !u.cover && s.locations[u.location].covers.filter((c) => c.discovered && !c.parent).length < s.locations[u.location].cover_limit;
          if (a === "SHIFT") return !["Bunker", "Pillbox"].includes(coverOf(s, u)?.type) && incoming(s, u).some((f) => canFire(s, u, f.origin));
          if (a === "ADVANCE") return adjacent(s, u.location).some((l) => !l.staging && !movementReason(s, u, l.id));
          if (a === "RECONSTITUTE") return availableCounters(s, "SQUAD").some((p) => !normandy || reconstitutionFirepower(p, reconstitutionDonors(p, teams)));
          if (a === "SEEK_CASUALTY") return !u.mine_hit && seenCasualties.some((c) => c.location === u.location ? !c.cover || coverAvailable(s, u, s.locations[u.location].covers.find((v) => v.id === c.cover)) : adjacent(s, u.location).some((l) => !movementReason(s, u, l.id) && distance2(l, s.locations[c.location]) < distance2(s.locations[u.location], s.locations[c.location])));
          if (a === "ATTACK") return same || !!u.fire && occupants(s, u.fire).some((v) => v.faction !== u.faction);
          return true;
        });
        return legal.length ? legal[roll(legal.length) - 1] : "NONE";
      };
      let action = "NONE";
      if (normandy && (u.pinned || u.cohesion !== "GOOD")) action = choices(latActivityTable({ pinned: u.pinned, same, covered, leader, cohesion: u.cohesion, named: u.named, kind: u.kind, teams: teams.length, localCasualty: !!localCasualty, seenCasualties: seenCasualties.length }));
      else if (u.pinned) {
        if (same && !covered) action = choices(["NONE", "COVER", "RALLY", "FALL_BACK", "FALL_BACK"]);
        else if (same && covered) action = choices(["NONE", "NONE", "RALLY", "FALL_BACK", "FALL_BACK"]);
        else if (!covered) action = choices(["NONE", "NONE", "COVER", "RALLY", "FALL_BACK"]);
        else action = choices(["NONE", "NONE", "RALLY", "FALL_BACK"]);
      } else if (u.cohesion !== "GOOD") {
        if (u.named && u.cohesion === "F" && !same) action = choices(["NONE", "RECOVER"]);
        else if (u.cohesion === "A") action = choices(["NONE", same ? "ATTACK" : "ADVANCE"]);
        else if (u.cohesion === "F" && same) action = choices(covered ? ["NONE", "NONE", "ATTACK", "FALL_BACK", "FALL_BACK"] : ["NONE", "COVER", "FALL_BACK", "FALL_BACK", "FALL_BACK"]);
        else if (u.cohesion === "L") action = s.mission_contacts && localCasualty ? choices(["NONE", "EVACUATE", "EVACUATE"]) : s.mission_contacts && seenCasualties.length ? choices(["NONE", "SEEK_CASUALTY", "SEEK_CASUALTY"]) : roll(3) === 3 ? "RECOVER" : "NONE";
      } else if (s.enemy_tactics === "offensive_assault") {
        if (same && !covered) action = choices(["NONE", "COVER", "COVER", "FALL_BACK", "ATTACK"]);
        else if (same && covered) action = choices(["NONE", "FALL_BACK", "ATTACK", "ATTACK", "ATTACK"]);
        else if (u.out_of_ammo) action = choices(["NONE", "NONE", "FALL_BACK"]);
        else if ((normandy ? u.tripod || ["G", "H"].includes(vofOf(u)) : ["A", "G", "H"].includes(u.vof)) && u.fire && occupants(s, u.fire).some(friendly)) action = "ATTACK";
        else action = choices(["NONE", "INFILTRATE", "INFILTRATE", "ADVANCE"]);
      } else if (s.enemy_tactics === "hasty_defense") {
        const different = incoming(s, u).some((f) => {
          const here = s.locations[u.location], aim = s.locations[u.fire], origin = s.locations[f.origin];
          return !aim || Math.sign(aim.row - here.row) !== Math.sign(origin.row - here.row) || Math.sign(aim.col - here.col) !== Math.sign(origin.col - here.col);
        });
        const opposing = incoming(s, u).map((f) => f.value), valid = !!u.fire && occupants(s, u.fire).some(friendly);
        do {
          action = choices(hastyActivityTable({ same, covered, outOfAmmo: u.out_of_ammo && (u.tripod || ["G", "H"].includes(u.vof)), noLOS: !values(s.units).some((v) => friendly(v) && live(v) && unitLos(s, u, v)), under, validPDF: valid, differentDirection: different, heavy: u.tripod || ["G", "H"].includes(vofOf(u)) || u.kind === "LEADER" && u.assets.rifle_grenade > 0, stronger: opposing.length && basicValue(u) < Math.min(...opposing), trading: !!u.fire }));
          if (action === "SHIFT" && ["Bunker", "Pillbox", "Deep Bunker"].includes(coverOf(s, u)?.type)) emit(s, "ENEMY_ACTIVITY_REDRAW", "Fortification firing arc cannot shift; redraw enemy activity.", { actor: u.id }, !visible(s, u));
          else break;
        } while (true);
      } else if (same && !covered) action = choices(["COVER", "FALL_BACK", "ATTACK"]);
      else if (same && covered) action = choices(["NONE", "ATTACK", "ATTACK"]);
      else if (s.mission_contacts && u.out_of_ammo && (u.tripod || ["G", "H"].includes(u.vof))) action = choices(["NONE", "FALL_BACK"]);
      else if (!under && !values(s.units).some((v) => friendly(v) && live(v) && unitLos(s, u, v))) action = s.mission_contacts ? "HIDE" : "NONE";
      else if (!under && u.fire) action = "ATTACK";
      else if (under && !covered) action = choices(["COVER", "COVER", "ATTACK"]);
      else if (incoming(s, u).some((f) => {
        const here = s.locations[u.location], aim = s.locations[u.fire], origin = s.locations[f.origin];
        return !aim || Math.sign(aim.row - here.row) !== Math.sign(origin.row - here.row) || Math.sign(aim.col - here.col) !== Math.sign(origin.col - here.col);
      })) {
        do {
          action = choices(["NONE", "ATTACK", "SHIFT", "SHIFT"]);
          if (action === "SHIFT" && s.mission_rules?.specialEnemies && ["Bunker", "Pillbox"].includes(coverOf(s, u)?.type)) emit(s, "ENEMY_ACTIVITY_REDRAW", "Fortification firing arc cannot shift; redraw enemy activity.", { actor: u.id, location: u.location, faction: u.faction }, !visible(s, u));
          else break;
        } while (true);
      } else if ((s.mission_contacts ? u.tripod || u.vof === "H" : ["A", "H"].includes(u.vof)) && u.fire) action = "ATTACK";
      else if (u.fire) {
        const opposing = incoming(s, u).map((f) => f.value);
        const stronger = opposing.length && basicValue(u) < Math.min(...opposing);
        action = roll(s.mission_contacts && stronger ? 3 : 2) > 1 ? "ATTACK" : "NONE";
      }
      if (action === "COVER") enemyCover(s, u);
      if (action === "RALLY") rally(s, u);
      if (action === "RECOVER") rally(s, u, u, true);
      if (action === "RECONSTITUTE") {
        const profiles = availableCounters(s, "SQUAD").filter((p) => !normandy ? p.vof === "S" || teams.some((v) => v.cohesion === "A" || v.fire_team_vof === "A") : reconstitutionFirepower(p, reconstitutionDonors(p, teams)));
        const profile = profiles.length ? pick(s, profiles, "Enemy reconstitution counter", !visible(s, u)) : null;
        if (profile && attempt(s, u, 2, "rally", "Enemy squad reconstitution", !visible(s, u))) {
          const donors = normandy ? reconstitutionDonors(profile, teams) : teams.slice(0, profile.steps), id = `enemy_${s.next_id++}`, steps = donors.flatMap((v) => v.steps);
          s.units[id] = { ...structuredClone(profile), id, counter_id: profile.id, max_steps: profile.steps, faction: "enemy", platoon: null, location: u.location, cover: u.cover, steps, cohesion: "GOOD", experience: "Green", original_experience: "Green", pinned: false, exposed: false, radios: [], assets: {}, ammo: donors.reduce((all, v) => {
            for (const [key, n] of Object.entries(v.ammo ?? {})) all[key] = (all[key] ?? 0) + n;
            return all;
          }, {}), initial_resources: { radios: [], assets: {}, ammo: structuredClone(profile.ammo ?? {}) }, saved: 0, used: [], fire: null, indirect: null, removed: null, named: false, mission_weapon: true, contact_type: u.contact_type };
          if (normandy) reconstitutionLoads(s, s.units[id], donors);
          for (const v of donors) {
            v.steps = [];
            v.removed = "RECONSTITUTED";
            processed.add(v.id);
            if (s.knowledge.spotted[v.id]) s.knowledge.spotted[id] = { id };
          }
          processed.add(id);
          emit(s, "FORMATION_RECONSTITUTED", "Enemy squad reconstituted from limited-action teams.", { actor: id, contributors: donors.map((v) => v.id) }, !visible(s, s.units[id]));
        }
      }
      if (action === "EVACUATE") {
        localCasualty.carrier = u.id;
        fallBack(s, u);
      }
      if (action === "SEEK_CASUALTY") {
        const nearest = Math.min(...seenCasualties.map((c) => distance2(s.locations[u.location], s.locations[c.location])));
        const target = pick(s, seenCasualties.filter((c) => distance2(s.locations[u.location], s.locations[c.location]) === nearest), "Litter team casualty destination", !visible(s, u));
        if (target.location === u.location) {
          u.cover = target.cover;
          u.exposed = true;
        } else {
          const choices2 = adjacent(s, u.location).filter((l) => !l.staging && !hasFire(s, l.id) && !movementReason(s, u, l.id) && distance2(l, s.locations[target.location]) < nearest);
          if (choices2.length) move(s, u, pick(s, choices2, "Litter team approach", !visible(s, u)).id);
        }
      }
      if (action === "FALL_BACK") fallBack(s, u);
      if (action === "ATTACK") attack(s, u);
      if (action === "SHIFT") {
        const f = incoming(s, u).find((f2) => canFire(s, u, f2.origin));
        if (f) u.fire = f.origin;
      }
      if (action === "ADVANCE" || action === "INFILTRATE") {
        const legal = adjacent(s, u.location).filter((l) => !l.staging && !movementReason(s, u, l.id));
        const foes = values(s.units).filter((v) => friendly(v) && live(v)), near = (l) => Math.min(...foes.map((v) => distance2(l, s.locations[v.location])));
        let candidates = legal;
        if (normandy && action === "ADVANCE" && s.locations[u.location].row > 1) candidates = legal.filter((l) => l.row === s.locations[u.location].row - 1 && l.col === s.locations[u.location].col);
        else if (normandy) candidates = legal.filter((l) => near(l) < near(s.locations[u.location]));
        const closest = Math.min(...candidates.map(near));
        let dest = normandy ? candidates.length ? pick(s, candidates.filter((l) => near(l) === closest), "Enemy advance destination", !visible(s, u)) : null : legal.sort((a, b) => near(a) - near(b))[0];
        let infiltrate = action === "INFILTRATE";
        if (normandy && infiltrate && (!dest || infiltrationReason(s, u, dest.id))) {
          infiltrate = false;
          const forward = s.locations[u.location].row > 1 ? legal.filter((l) => l.row === s.locations[u.location].row - 1 && l.col === s.locations[u.location].col) : legal.filter((l) => near(l) < near(s.locations[u.location]));
          const minimum = Math.min(...forward.map(near));
          dest = forward.length ? pick(s, forward.filter((l) => near(l) === minimum), "Enemy infiltration fallback", !visible(s, u)) : null;
        }
        if (dest) {
          move(s, u, dest.id, infiltrate);
          if (normandy) u.cover = selectEnemyCover(s, u, u.location, true)?.id ?? null;
        }
      }
      if (action === "HIDE") {
        u.removed = "HIDDEN";
        u.fire = null;
        if (!values(s.contacts).some((c) => c.location === u.location && !c.resolved)) {
          const id = `pc_return_${s.next_id++}`;
          s.contacts[id] = { id, location: u.location, type: u.contact_type ?? pick(s, ["A", "B", "C"], "Replacement contact letter", true), resolved: false };
        }
        emit(s, "CONTACT_RENEWED", `A previously engaged position at ${s.locations[u.location].name} must be cleared again.`, { location: u.location }, !visible(s, u));
      }
      emit(s, "ENEMY_ACTIVITY", `${u.name}: ${action.toLowerCase().replaceAll("_", " ")}${action === "NONE" ? "; existing fire continues" : ""}.`, { actor: u.id, action }, !visible(s, u));
      refresh(s);
    }
  }
}
function capture(s, { friendlyRemainder = "F" } = {}) {
  for (const l of values(s.locations)) {
    for (const side of ["friendly", "enemy"]) {
      const units5 = occupants(s, l.id), victims = units5.filter((u) => u.faction === side && ["P", "L"].includes(u.cohesion));
      if (!victims.length || units5.some((u) => u.faction === side && !["P", "L"].includes(u.cohesion))) continue;
      const guard = units5.find((u) => u.faction !== side && !u.pinned && basicValue(u) !== null);
      if (!guard) continue;
      const step = guard.steps.pop();
      s.prisoners.push({ guard: step, guard_origin: guard.id, guard_experience: guard.experience, prisoners: victims.flatMap((u) => u.steps) });
      if (s.mission_contacts && guard.kind === "SQUAD" && guard.steps.length === 1) {
        const child = splitTeam(s, guard, friendly(guard) ? friendlyRemainder : pick(s, ["F", "A"], "Guard remainder side", !visible(s, guard)), guard.steps.pop());
        child.radios = guard.radios;
        child.assets = guard.assets;
        guard.radios = [];
        guard.assets = {};
        for (const c of s.casualties.filter((c2) => c2.carrier === guard.id)) c.carrier = child.id;
        guard.removed = "BROKEN";
        if (!friendly(guard) && s.knowledge.spotted[guard.id]) s.knowledge.spotted[child.id] = { id: child.id };
        emit(s, "FORMATION_CHANGED", `${guard.name}: remaining step becomes ${child.cohesion === "A" ? "Assault" : "Fire"} Team after guard assignment.`, { actor: guard.id, location: l.id, formations: [child.id], cause: "GUARD_ASSIGNMENT" }, !visible(s, guard));
      }
      if (!guard.steps.length && !guard.removed) {
        loseAssets(s, guard, false);
        guard.removed = "GUARD";
      }
      for (const u of victims) {
        if (s.objectives && side === "enemy") spot(s, u);
        if (s.mission_contacts) dropLoad(s, u, "capture");
        u.removed = "CAPTURED";
        emit(s, "UNIT_CAPTURED", `${u.name} captured; one opposing step assigned as guard.`, { actor: u.id, faction: u.faction, location: l.id, ...s.objectives ? { step_ids: u.steps.map((step2) => step2.id) } : {} }, !visible(s, u));
      }
    }
    if (s.objectives) {
      if (!occupants(s, l.id).some((u) => !friendly(u)) && (occupants(s, l.id).some(friendly) || !values(s.contacts).some((c) => c.location === l.id && !c.resolved))) for (const c of s.casualties.filter((c2) => c2.location === l.id && c2.faction === "enemy" && !c2.evacuated)) {
        c.evacuated = true;
        emit(s, "ENEMY_CASUALTY_CAPTURED", "An enemy casualty step was captured.", { location: l.id, step_id: s.events.some((e) => e.type === "CASUALTY" && !e.hidden && e.step_id === c.step.id) ? c.step.id : c.id });
      }
    } else if (!occupants(s, l.id).some((u) => !friendly(u))) for (const c of s.casualties.filter((c2) => c2.location === l.id && c2.faction === "enemy")) c.evacuated = true;
  }
}
function retreat(s) {
  for (const u of values(s.units).filter((u2) => live(u2) && !u2.pinned && !u2.exposed && ["P", "L"].includes(u2.cohesion) && hasFire(s, u2.location))) {
    if (u.cohesion === "L") {
      const c = s.casualties.find((c2) => c2.location === u.location && c2.cover === u.cover && !c2.evacuated && c2.faction === u.faction);
      if (!c) continue;
      c.carrier = u.id;
    }
    fallBack(s, u);
  }
}

// tmp/rules27-source/src/sim/company/engine.js
var PHASES = [
  ["FRIENDLY_EVENTS", "3.1 \xB7 Friendly higher HQ events", "Skipped: assault courses have no random HQ events."],
  ["DEFENSIVE_EVENTS", "3.2.1 \xB7 Defensive enemy HQ events", "Skipped: this is an offensive mission."],
  ["DEFENSIVE_ACTIVITY", "3.2.2 \xB7 Defensive enemy activity", "Skipped: this is an offensive mission."],
  ["BN_ACTIVATION", "3.3.1a \xB7 Battalion activation", "BN activates Company HQ if its command side and BN radio are available."],
  ["CO_ACTIVATION", "3.3.1b \xB7 Company activation impulse", "Spend Company HQ commands, activate subordinates, or save unused commands."],
  ["SUBORDINATE_ACTIVATION", "3.3.1c \xB7 Platoon / staff activation impulses", "Choose activated HQs in any order. Complete one impulse before choosing another."],
  ["CO_INITIATIVE", "3.3.2a \xB7 Company initiative", "Company HQ receives initiative only if it was not activated."],
  ["PLATOON_INITIATIVE", "3.3.2b \xB7 Platoon initiative impulses", "Choose each unactivated platoon HQ in any order."],
  ["STAFF_INITIATIVE", "3.3.2c \xB7 Staff initiative", "Unactivated staff receive one unmodified command."],
  ["GENERAL_INITIATIVE", "3.3.2d \xB7 General initiative", "Spend the card\u2019s unmodified initiative on any units. These commands cannot be saved."],
  ["ENEMY_EVENTS", "3.4.1 \xB7 Enemy higher HQ events", "Skipped: assault courses have no random HQ events."],
  ["ENEMY_ACTIVITY", "3.4.2 \xB7 Enemy activity checks", "Resolve deliberate-defence priorities, in random card order, with degraded units first."],
  ["CAPTURE", "3.5.1 \xB7 Mutual capture", "Capture isolated paralyzed/litter teams and assign guard steps."],
  ["RETREAT", "3.5.2 \xB7 Mutual retreat", "Unpinned, unexposed paralyzed teams and litter teams carrying casualties retreat from fire."],
  ["AT_COMBAT", "3.6 \xB7 AT combat / vehicle movement", "Skipped: no vehicle targets. Bazookas use ranged grenade attacks against infantry."],
  ["FIRE_MISSIONS", "3.7.1 \xB7 Fire mission update", "Remove previous incoming missions; activate pending missions."],
  ["CONTACTS", "3.7.2 \xB7 Potential contact evaluation", "Resolve occupied contact cards and update activity after each encounter."],
  ["PINNED_RECOVERY", "3.7.3 \xB7 Pinned recovery", "Automatically unpin formations free of effective incoming fire."],
  ["COMBAT_EFFECTS", "3.7.4 \xB7 Mutual combat effects", "Resolve MISS / PIN / HIT from a common fire snapshot; update fire only at cleanup."],
  ["CLEANUP", "3.8 \xB7 Cleanup", "Remove temporary markers, evacuate staging casualties, update fire and check the objective."]
];
var RULES_VERSION = 27;
var phaseInfo = (id) => PHASES.find((p) => p[0] === id);
function phaseDescription(s) {
  if (s.mission_rules.events && ["FRIENDLY_EVENTS", "ENEMY_EVENTS"].includes(s.phase)) return s.turn === 1 ? "No higher-HQ event check on turn 1." : "Draw for a higher-HQ event; resolve this turn\u2019s mission table and any command obligations.";
  if (s.mission_rules.communications === "simplified" && s.phase === "BN_ACTIVATION") return "BN activates an unpinned command-side Company HQ unless this turn\u2019s communications event prevents activation.";
  if (s.objectives && s.phase === "CLEANUP") return "Remove temporary markers, evacuate transported and unloaded CCP casualties, update fire and check mission objectives. Position achievements are scored when the mission ends.";
  return phaseInfo(s.phase)[2];
}
var index = (a) => Object.fromEntries(a.map((v) => [v.id, structuredClone(v)]));
function createMission(definition, seed, setup = {}, deployment = null, execution = {}) {
  if (definition.readiness?.playable === false) throw new Error(`${definition.name} is not playable yet: ${definition.readiness.missing.join("; ")}.`);
  if (definition.rules?.standaloneRoster && !deployment) deployment = { mission_instance_id: execution.mission_instance_id ?? globalThis.crypto.randomUUID(), roster: createCampaignRoster(definition.rules.baselineCompanyId ?? "normandy_cerisy_standalone_company", definition) };
  return initializeMission(definition, seed, setup, deployment, execution);
}
function initializeMission(definition, seed, setup = {}, deployment = null, execution = {}) {
  const scenario = materializeScenario(definition, seed, setup);
  if (scenario.ruleset !== "company-v1" || !scenario.units.length || !scenario.locations.length) throw new TypeError("Invalid company scenario");
  let deployedSteps = null;
  if (deployment) {
    const snapshot = rosterSnapshot(deployment.roster);
    deployedSteps = {};
    scenario.units = scenario.units.filter((unit) => {
      const entry = snapshot.formations[unit.id];
      if (!entry || entry.kind !== unit.kind || (entry.capacity ?? entry.step_ids.length) !== unit.steps) throw new Error(`Deployment roster cannot field ${unit.id}.`);
      unit.experience = entry.experience;
      deployedSteps[unit.id] = entry.step_ids.filter((id) => snapshot.steps[id]?.disposition === "ACTIVE");
      if (deployedSteps[unit.id].length > (entry.capacity ?? entry.step_ids.length)) throw new Error(`Deployment roster exceeds ${unit.id}'s capacity.`);
      if (deployedSteps[unit.id].length === 1) unit.experience = snapshot.steps[deployedSteps[unit.id][0]].experience;
      unit.steps = deployedSteps[unit.id].length;
      return unit.steps > 0;
    });
  }
  const s = {
    ruleset: "company-v1",
    rules_version: RULES_VERSION,
    scenario_id: scenario.id,
    scenario_version: scenario.version,
    id: `mission_${scenario.id}`,
    seed: String(seed),
    rng: createRng(seed),
    status: "ACTIVE",
    turn: 1,
    turn_limit: scenario.turn_limit,
    phase: PHASES[0][0],
    briefing: scenario.briefing,
    locations: index(scenario.locations),
    units: {},
    contacts: index(scenario.contacts),
    events: [],
    replay: [],
    next_id: 1,
    impulse: null,
    impulse_number: 0,
    activated: [],
    completed: [],
    fire: [],
    support: [],
    markers: [],
    assets: [],
    casualties: [],
    prisoners: [],
    personnel: {},
    pending_combat: [],
    segment_progress: null,
    activity: "NO_CONTACT",
    knowledge: { spotted: {}, suspected: {} },
    enemy_pool: { mg: 3, squads: ["A/S", "A/S", "A"], fox: 2, trench: 2, bunker: 1 },
    signal_phase_line: scenario.signal_phase_line
  };
  s.phone_lines = [];
  s.phase_lines = structuredClone(scenario.phase_lines);
  s.runners = [];
  if (deployment) {
    if (!deployment.mission_instance_id || !deployment.roster) throw new Error("Deployment needs a unique mission ID and campaign roster.");
    s.mission_instance_id = deployment.mission_instance_id;
    s.roster_snapshot = rosterSnapshot(deployment.roster);
  }
  s.boundaries = scenario.map ? { rows: scenario.map.rows, columns: scenario.map.columns } : null;
  s.terrain_deck = structuredClone(scenario.terrain_deck ?? []);
  s.setup = structuredClone(setup);
  s.mission_name = scenario.name ?? "Company Assault";
  s.mission_rules = { ...structuredClone(scenario.rules ?? {}), hiddenTerrain: !!scenario.map?.hidden };
  s.enemy_tactics = s.mission_rules.tactics ?? "deliberate_defense";
  s.attempt_number = 1;
  if (scenario.rules?.missionIdentity) s.mission_instance_id ??= execution.mission_instance_id ?? globalThis.crypto.randomUUID();
  s.objectives = structuredClone(scenario.objectives ?? null);
  s.achievements = [];
  s.hq_events = [];
  s.support_unavailable = [];
  s.registered_targets = {};
  s.mission_contacts = structuredClone(scenario.package_tables ? { tables: scenario.package_tables, packages: scenario.packages, draws: scenario.contact_draws, counters: scenario.enemy_counters } : null);
  s.support_agencies = structuredClone(scenario.support_agencies ?? null);
  s.signal_plan = structuredClone(scenario.signal_plan ?? null);
  s.mission_rules_text = structuredClone(scenario.special_rules ?? []);
  s.support_inventory = Object.fromEntries(Object.entries(s.support_agencies ?? {}).map(([id, agency2]) => [id, structuredClone(agency2.inventory ?? {})]));
  s.deck = newDeck(s);
  const surnames = ["Miller", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Moore", "Martin", "Jackson", "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Parker", "Collins", "Edwards", "Stewart", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes", "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole", "West", "Jordan", "Owens", "Reynolds", "Fisher", "Ellis"];
  let person = 0;
  for (const raw of scenario.units) {
    const u = {
      ...structuredClone(raw),
      mission_weapon: !!scenario.rules,
      max_steps: s.roster_snapshot?.formations[raw.id].capacity ?? s.roster_snapshot?.formations[raw.id].step_ids.length ?? raw.steps,
      cohesion: "GOOD",
      original_experience: raw.experience,
      named: raw.kind !== "SQUAD",
      pinned: false,
      exposed: false,
      cover: null,
      fire: null,
      indirect: null,
      saved: 0,
      used: [],
      removed: raw.reserve ? "RESERVE" : null,
      assets: { ...structuredClone(scenario.assets[raw.id] ?? {}), ...scenario.phone_lines?.[raw.id] ? { phone_line: scenario.phone_lines[raw.id] } : {} }
    };
    u.steps = Array.from({ length: raw.steps }, (_, n) => ({ id: deployedSteps?.[u.id]?.[n] ?? `${u.id}_step${n + 1}`, ...s.roster_snapshot ? { experience: s.roster_snapshot.steps[deployedSteps[u.id][n]].experience } : {}, personnel: s.roster_snapshot ? s.roster_snapshot.steps[deployedSteps[u.id][n]].person_ids.map((id) => {
      s.personnel[id] = { ...s.roster_snapshot.people[id], status: "ACTIVE" };
      return id;
    }) : Array.from({ length: raw.kind === "SQUAD" ? 4 : 2 }, () => {
      const id = `person_${++person}`;
      s.personnel[id] = { id, name: `${String.fromCharCode(65 + person % 26)}. ${surnames[(person - 1) % surnames.length]}`, origin: u.id, status: "ACTIVE" };
      return id;
    }) }));
    u.initial_resources = { radios: structuredClone(u.radios), assets: structuredClone(u.assets), ammo: structuredClone(u.ammo ?? {}) };
    s.units[u.id] = u;
  }
  for (const l of values(s.locations)) {
    l.covers = [];
    l.smoke = false;
  }
  if (scenario.patrol_plan) {
    s.patrol = createPatrolProgress(s.locations, scenario.patrol_plan);
    s.patrol_history = [];
    s.registered_targets.artillery = scenario.patrol_plan.concentration;
    s.visibility = { light: patrolMoonLight(randomNumber(s, 4, "Patrol moon visibility")), weather: 0 };
    for (const l of values(s.locations).filter((l2) => l2.row === 1 || l2.id === s.patrol.plan.cop)) for (let i = 0; i < 2; i++) l.covers.push({ id: `fox_${l.id}_${i}`, type: "Foxholes", value: 1, known: true, discovered: true });
    for (const u of values(s.units).filter((u2) => friendly(u2) && live(u2) && !patrolParticipant(s.patrol, u2))) u.cover = s.locations[u.location].covers[0].id;
  }
  emit(s, "MISSION_STARTED", scenario.briefing, { scenario: scenario.id, version: scenario.version, seed: String(seed) });
  revealTerrain(s, { setup: true });
  if (s.objectives && !s.locations[s.objectives.ccp].known) throw new Error("Choose a revealed terrain or staging card for the CCP.");
  if (scenario.map) emit(s, "MISSION_SETUP_CONFIRMED", "Mission setup confirmed.", { setup: structuredClone(setup) });
  emit(s, "PHASE_ENTERED", phaseInfo(s.phase)[1], { description: phaseDescription(s) });
  if (s.mission_rules?.missionIdentity) recordAttemptStart(s);
  return s;
}
function eligibleHQs(s) {
  return values(s.units).filter((u) => friendly(u) && live(u) && ["HQ", "STAFF"].includes(u.kind) && !s.completed.includes(u.id) && (s.phase === "SUBORDINATE_ACTIVATION" ? !isCompanyCommander(u) && s.activated.includes(u.id) : s.phase === "PLATOON_INITIATIVE" ? u.kind === "HQ" && !isCompanyCommander(u) && !s.activated.includes(u.id) : s.phase === "STAFF_INITIATIVE" ? u.kind === "STAFF" && u.command_role !== "higher_hq" && !s.activated.includes(u.id) : false)).map((u) => u.id);
}
function startImpulse(s, id, activation = false) {
  const u = s.units[id];
  let allowance, cardId = null, base = 1, modifiers = {};
  if (id === "general") {
    const card = draw(s, 1, "General initiative")[0];
    cardId = card.id;
    base = card.initiative;
    allowance = s.patrol ? patrolInitiative(base) : base;
  } else if (u.command_role === "higher_hq") allowance = 6;
  else if (u.kind === "STAFF" && !activation) allowance = 1;
  else {
    const card = draw(s, 1, `${u.name}: ${activation ? "activation" : "initiative"}`)[0];
    cardId = card.id;
    base = activation ? card.activated : card.initiative;
    const pressure = incoming(s, u).map((f) => f.value);
    if (s.markers.some((m) => m.location === u.location && m.type === "GRENADE" && (m.target === u.id || u.cover && m.cover === u.cover))) pressure.push(-3);
    if (s.fire.some((f) => f.target === u.location && s.units[f.source]?.vof === "S!" && !s.units[f.source].pinned)) pressure.push(-3);
    if (s.support.some((f) => f.status === "ACTIVE" && f.location === u.location)) pressure.push(-3);
    const worst = pressure.length ? Math.min(...pressure) : null;
    const fireMod = worst === null || worst === 2 ? 0 : worst === 0 ? -1 : worst === -1 ? -2 : -3;
    modifiers = { experience: expMod(u), pinned: u.pinned ? -1 : 0, cover: u.cover ? 1 : 0, fire: fireMod, no_contact: s.activity === "NO_CONTACT" ? 1 : 0 };
    allowance = Math.max(activation ? 1 : 0, base + Object.values(modifiers).reduce((a, b) => a + b, 0));
  }
  s.impulse = { id: `t${s.turn}_i${++s.impulse_number}`, hq: id, commands: allowance + (u?.saved ?? 0), allowance, spent: 0, card_id: cardId, base, modifiers, reserve_used: u?.saved ?? 0 };
  if (id === "general" && (s.mission_rules?.reattempts || s.patrol)) s.impulse.hq_limit_only = true;
  if (u) u.saved = 0;
  if (isCompanyCommander(u) && s.command_obligation) {
    const paid = Math.min(s.command_obligation, s.impulse.commands, visibilityCommandLimits(s.visibility).spend);
    s.command_obligation -= paid;
    s.impulse.commands -= paid;
    s.impulse.spent += paid;
    emit(s, "HQ_OBLIGATION", `Company HQ spent ${paid} commands on its higher-HQ obligation.`, { paid, remaining: s.command_obligation });
    if (!s.command_obligation) {
      const event = s.hq_events.findLast((e) => e.turn === s.turn && ["COMM", "SITREP"].includes(e.code));
      if (event) event.completed = true;
    }
  }
  emit(s, "IMPULSE_STARTED", `${u?.name ?? "General initiative"}: ${s.impulse.commands} commands available; ${s.impulse.hq_limit_only ? `HQ orders retain their ${visibilityCommandLimits(s.visibility).spend === 6 ? "six" : "four"}-command limit` : `maximum ${visibilityCommandLimits(s.visibility).spend === 6 ? "six" : "four"} may be spent`}.`, { hq: id, allowance, total: s.impulse.commands });
}
function finishImpulse(s) {
  const i = s.impulse;
  if (!i) return;
  if (i.hq !== "general") {
    const u = s.units[i.hq];
    u.saved = u.command_role === "higher_hq" ? 0 : live(u) && !["P", "L"].includes(u.cohesion) ? Math.min(visibilityCommandLimits(s.visibility, u.experience).saved, i.commands) : 0;
    s.completed.push(u.id);
    emit(s, "IMPULSE_ENDED", `${u.name} saved ${u.saved} commands.`, { hq: u.id, saved: u.saved });
  } else emit(s, "IMPULSE_ENDED", "General initiative ended; unused commands discarded.");
  s.impulse = null;
}
function enter(s) {
  s.segment_progress = null;
  emit(s, "PHASE_ENTERED", phaseInfo(s.phase)[1], { description: phaseDescription(s) });
  if (s.phase === "CONTACTS" && s.mission_contacts) {
    for (const pc of values(s.contacts).filter((pc2) => !pc2.resolved && !pc2.question_side)) pc.revealed = true;
    s.contact_queue = contactQueue(s, eligibleContacts(s));
  }
  if (s.phase === "COMBAT_EFFECTS") {
    const start = s.events.length;
    damagePhoneLines(s);
    const resolutions = prepareCombat(s);
    s.segment_progress = { phase: s.phase, status: resolutions.length ? "awaiting_resolution" : "reviewing", index: 0, total: resolutions.length, events_after: start };
    if (!resolutions.length) emit(s, "COMBAT_REVIEW", "No formations are affected by fire. Continue to cleanup.");
  }
  const commander = companyCommander(s);
  if (s.phase === "BN_ACTIVATION" && !s.bn_blocked) {
    const visitor = higherCommander(s);
    if (visitor) startImpulse(s, visitor.id, true);
  }
  if (s.phase === "CO_ACTIVATION" && s.activated.includes(commander.id)) {
    deliverRunners(s);
    startImpulse(s, commander.id, true);
  }
  if (s.phase === "CO_INITIATIVE" && !s.activated.includes(commander.id) && live(commander)) {
    deliverRunners(s);
    startImpulse(s, commander.id);
  }
  if (s.phase === "GENERAL_INITIATIVE") startImpulse(s, "general");
}
function selectHQ(state, id) {
  if (state.pending_support || state.status !== "ACTIVE" || state.impulse || !eligibleHQs(state).includes(id)) return { state, events: [], accepted: false, reason: "Choose an eligible HQ after completing the current impulse." };
  const s = structuredClone(state);
  startImpulse(s, id, s.phase === "SUBORDINATE_ACTIVATION");
  s.replay.push({ op: "selectHQ", id });
  return result(state, s, { accepted: true });
}
function resolveSupportChoice(state, choice) {
  try {
    const s = structuredClone(state);
    applySupportChoice(s, choice);
    s.replay.push({ op: "resolveSupportChoice", choice: structuredClone(choice) });
    return result(state, s, { accepted: true });
  } catch (error) {
    return { state, events: [], accepted: false, reason: error.message };
  }
}
function submitCommand2(state, c) {
  return c.type === "SELECT_HQ" ? selectHQ(state, c.unit_id) : submitCommand(state, c);
}
function resolveCombat(state, resolutionId) {
  const progress = state.segment_progress, current = state.pending_combat?.[progress?.index];
  if (state.status !== "ACTIVE" || state.phase !== "COMBAT_EFFECTS") return { state, events: [], accepted: false, reason: "Combat can only resolve during segment 3.7.4." };
  if (!current || progress.status !== "awaiting_resolution" || current.id !== resolutionId || !current.target_visible)
    return { state, events: [], accepted: false, reason: "Resolve the currently displayed combat exposure once." };
  const s = structuredClone(state);
  resolvePreparedCombat(s, resolutionId);
  s.segment_progress.status = "reviewing_result";
  s.replay.push({ op: "resolveCombat", id: resolutionId });
  return result(state, s, { accepted: true });
}
function endMission(s, status, text) {
  s.status = status;
  s.impulse = null;
  scoreMission(s, { final: true });
  emit(s, "MISSION_ENDED", text, { outcome: status });
}
function checkObjective(s) {
  if (s.patrol) {
    if (s.status !== "ACTIVE") return;
    const outcome = patrolOutcome(s.patrol, s.turn, values(s.units).some((u) => live(u) && patrolParticipant(s.patrol, u)));
    emit(s, "OBJECTIVE_CHECK", s.patrol.returned ? "Patrol route complete; returned across the MLR." : "Visit the route in order, pass through the objective and return across the MLR.", { patrol: true, visited: s.patrol.visited.length, objective_visited: s.patrol.objective_visited, returned: s.patrol.returned });
    if (outcome) {
      scoreMission(s, { final: true });
      s.patrol_history.push({ platoon: s.patrol.plan.platoon, outcome, turns: s.turn });
      s.status = s.patrol_history.length === 3 ? s.patrol_history.every((p) => p.outcome === "SUCCESS") ? "SUCCESS" : "DEFEAT" : "PATROL_COMPLETE";
      s.impulse = null;
      emit(s, "PATROL_ENDED", `Patrol ${outcome.toLowerCase()}.`, { outcome, platoon: s.patrol.plan.platoon });
      if (s.patrol_history.length === 3) emit(s, "MISSION_ENDED", "All three platoons have completed their patrols.", { outcome: s.status });
    }
    return;
  }
  const assault = values(s.units).some((u) => friendly(u) && live(u) && ["SQUAD", "LAT", "MG", "AT"].includes(u.kind));
  if (s.objectives) {
    scoreMission(s);
    const objectivesHeld = ["primary", "secondary"].every((k) => secureStatus(s, s.objectives[k]).secured);
    const rowsClear = (s.objectives.clear_rows ?? []).every((row) => values(s.locations).filter((l) => l.row === row && (!s.boundaries || l.col >= 1 && l.col <= s.boundaries.columns)).every((l) => secureStatus(s, l.id).cleared));
    const complete = objectivesHeld && rowsClear;
    emit(s, "OBJECTIVE_CHECK", complete ? "Mission objectives complete." : `Secure both objectives${s.objectives.clear_rows?.length ? " and clear the required rows" : ""}.`, { secured: complete, objectives_held: objectivesHeld, rows_clear: rowsClear });
    if (!assault) endMission(s, "DEFEAT", "Assault force lost.");
    else if (s.turn >= s.turn_limit) endMission(s, complete ? "SUCCESS" : "DEFEAT", complete ? "Primary and secondary objectives secured; required rows cleared." : "Turn limit reached before all objectives were complete.");
    return;
  }
  const unresolved = values(s.contacts).filter((c) => !c.resolved).length;
  const opposition = values(s.units).some((u) => !friendly(u) && live(u));
  emit(s, "OBJECTIVE_CHECK", `${unresolved} contact markers remain; ${!opposition && !unresolved ? "all positions cleared" : "continue the assault"}.`, { contacts_remaining: unresolved });
  if (!assault) endMission(s, "DEFEAT", "Assault force lost.");
  else if (s.turn >= s.turn_limit) endMission(s, !opposition && !unresolved ? "SUCCESS" : "DEFEAT", !opposition && !unresolved ? "Company assault complete: contacts cleared and defenders eliminated or captured." : "Turn limit reached before all contacts and defenders were cleared.");
}
function nextContact(s) {
  const eligible = eligibleContacts(s);
  return s.mission_contacts ? s.contact_queue?.map((id) => eligible.find((pc) => pc.id === id)).find(Boolean) : eligible[0];
}
function advancePhase(state, options = {}) {
  if (Object.keys(options).some((k) => !["friendlyRemainder", "eventChoice"].includes(k)) || options.friendlyRemainder && !["F", "A"].includes(options.friendlyRemainder)) return { state, events: [], accepted: false, reason: "Invalid segment choice." };
  if (state.pending_support) return { state, events: [], accepted: false, reason: "Choose ordinary or battalion fire before advancing." };
  if (state.pending_event && !options.eventChoice) return { state, events: [], accepted: false, reason: "Choose ammunition and a Row 1 resupply card." };
  if (state.status !== "ACTIVE") return { state, events: [] };
  const pending = state.phase === "COMBAT_EFFECTS" && state.pending_combat?.[state.segment_progress?.index];
  if (pending?.status === "PENDING" && pending.target_visible)
    return { state, events: [], accepted: false, reason: "Resolve the displayed combat exposure before continuing." };
  const s = structuredClone(state);
  s.replay.push({ op: "advancePhase", ...Object.keys(options).length ? { options: structuredClone(options) } : {} });
  if (s.impulse) {
    finishImpulse(s);
    if (eligibleHQs(s).length) return result(state, s);
  }
  if (eligibleHQs(s).length) return { state, events: [], reason: "Select each eligible HQ and complete its impulse before advancing." };
  const phase = s.phase;
  if (s.mission_rules.events && ["FRIENDLY_EVENTS", "ENEMY_EVENTS"].includes(phase)) {
    if (s.turn === 1) emit(s, "PHASE_SKIPPED", "No higher HQ event check on turn one.");
    else higherEvent(s, phase === "FRIENDLY_EVENTS" ? "friendly" : "enemy", options.eventChoice);
    if (s.pending_event) return result(state, s, { accepted: true });
  } else if (["FRIENDLY_EVENTS", "DEFENSIVE_EVENTS", "DEFENSIVE_ACTIVITY", "ENEMY_EVENTS", "AT_COMBAT"].includes(phase)) emit(s, "PHASE_SKIPPED", phaseInfo(phase)[2]);
  if (phase === "BN_ACTIVATION") {
    const commander = companyCommander(s);
    const visitor = higherCommander(s);
    if (visitor && !s.bn_blocked) {
      emit(s, "BN_HQ_ON_MAP", `${visitor.name} completed the on-map BN impulse.`, { hq: visitor.id });
    } else if (values(s.units).some((u) => u.command_role === "higher_hq" && u.removed !== "DEPARTED")) {
      emit(s, "ACTIVATION_UNAVAILABLE", "BN HQ is unavailable while its on-map visitor is lost or on the Fire Team side.");
    } else if (!s.bn_blocked && live(commander) && commander.cohesion === "GOOD" && (s.mission_rules.communications === "simplified" ? !commander.pinned : commander.radios.includes("BN"))) {
      s.activated.push(commander.id);
      emit(s, "HQ_ACTIVATED", s.mission_rules.communications === "simplified" ? "Off-map Battalion HQ activated Company HQ using mission communications." : "Off-map Battalion HQ activated Company HQ over the BN radio net.", { hq: commander.id });
    } else emit(s, "ACTIVATION_UNAVAILABLE", "Company HQ cannot receive BN activation; it must use initiative.");
  }
  if (phase === "ENEMY_ACTIVITY") enemyActivity(s);
  if (phase === "CAPTURE") capture(s, options);
  if (phase === "RETREAT") retreat(s);
  if (phase === "FIRE_MISSIONS") {
    s.support = s.support.filter((f) => f.status === "PENDING");
    for (const f of s.support) {
      f.status = "ACTIVE";
      emit(s, "SUPPORT_ACTIVE", `Incoming fire active at ${s.locations[f.location].name}.`, { location: f.location, value: f.value });
    }
    refresh(s);
  }
  if (phase === "CONTACTS") {
    const next = nextContact(s);
    if (next || !s.segment_progress) {
      const start = s.events.length;
      if (next) resolveContacts(s, next.id);
      else emit(s, "CONTACTS_COMPLETE", "No occupied potential contacts remain to evaluate.");
      refresh(s);
      s.segment_progress = {
        phase,
        status: "reviewing",
        events_after: start,
        contact: next?.location ?? null,
        resolved: [...s.segment_progress?.resolved ?? [], ...next ? [next.id] : []],
        remaining: eligibleContacts(s).length
      };
      return result(state, s);
    }
  }
  if (phase === "PINNED_RECOVERY") for (const u of values(s.units).filter((u2) => live(u2) && u2.pinned && !hasFire(s, u2.location))) {
    u.pinned = false;
    emit(s, "AUTOMATIC_RECOVERY", `${u.name} is free of fire and unpins.`, { actor: u.id, location: u.location, faction: u.faction }, !visible(s, u));
  }
  if (phase === "COMBAT_EFFECTS" && s.segment_progress.status !== "reviewing") {
    let index2 = s.segment_progress.index;
    if (s.pending_combat[index2]?.status === "RESOLVED") index2++;
    while (index2 < s.pending_combat.length && !s.pending_combat[index2].target_visible) {
      resolvePreparedCombat(s, s.pending_combat[index2].id);
      index2++;
    }
    s.segment_progress.index = index2;
    if (index2 < s.pending_combat.length) s.segment_progress.status = "awaiting_resolution";
    else {
      s.segment_progress.status = "reviewing";
      for (const id of Object.keys(s.knowledge.spotted)) if (s.units[id]) s.knowledge.spotted[id] = observeRecord(s.units[id]);
      emit(s, "COMBAT_REVIEW", "All combat exposures resolved. Review the results, then continue to cleanup.");
    }
    return result(state, s);
  }
  if (phase === "CLEANUP") {
    finishPatrolEvents(s);
    if (s.mission_rules.events === "normandy") {
      const turnEvents = s.events.filter((e) => e.turn === s.turn && e.type === "UNIT_MOVED" && e.faction === "friendly");
      for (const event of s.hq_events.filter((e) => e.side === "friendly" && e.turn === s.turn)) {
        if (event.code === "HOLD") event.completed = !turnEvents.some((e) => s.locations[e.target]?.row > event.lead);
        if (["ADVANCE", "ADVANCE_PC"].includes(event.code)) event.completed = turnEvents.some((e) => s.locations[e.target]?.row > event.lead && (event.code === "ADVANCE" || values(s.contacts).some((pc) => pc.location === e.target)));
      }
    }
    for (const u of values(s.units)) if (u.temporary_pdf) delete u.temporary_pdf;
    for (const u of values(s.units)) if (u.hold_fire_until_cleanup) delete u.hold_fire_until_cleanup;
    s.markers = [];
    for (const l of values(s.locations)) l.smoke = false;
    for (const u of values(s.units)) {
      u.exposed = false;
      u.mine_hit = false;
      u.used = [];
      u.indirect = null;
      if (!friendly(u) && u.fire && !occupants(s, u.fire).some(friendly)) {
        u.fire = null;
        u.fire_direction = null;
        u.fire_effect = null;
      }
    }
    for (const c of s.casualties.filter((c2) => friendly(c2) && (s.objectives ? c2.location === s.objectives.ccp && !c2.carrier && c2.transported : s.locations[c2.location].staging) && !c2.evacuated)) {
      c.evacuated = true;
      emit(s, "CASUALTY_EVACUATED", "A casualty step was evacuated from the designated evacuation area.", { step_id: c.step.id, personnel: c.step.personnel });
    }
    refresh(s);
    s.pending_combat = [];
    checkObjective(s);
    emit(s, "TURN_ENDED", `Turn ${s.turn} complete.`, { outcome: s.status });
    if (s.status === "ACTIVE") {
      s.turn++;
      s.bn_blocked = false;
      s.command_obligation = 0;
      s.support_unavailable = [];
      s.forward_row_blocked = null;
      s.activated = [];
      s.completed = [];
      if (s.counterattack_ends_after && s.turn > s.counterattack_ends_after) {
        s.enemy_tactics = s.mission_rules.tactics ?? "deliberate_defense";
        s.counterattack_ends_after = null;
        emit(s, "COUNTER_ATTACK_ENDED", `Enemy tactics returned to ${s.enemy_tactics.replaceAll("_", " ")}.`);
      }
      for (const u of values(s.units).filter((u2) => u2.command_role === "higher_hq" && u2.expires_turn < s.turn)) u.removed = "DEPARTED";
      s.higher_hq_on_map = values(s.units).some((u) => u.command_role === "higher_hq" && live(u));
      s.phase = PHASES[0][0];
      enter(s);
    }
    return result(state, s);
  }
  if (phase !== "COMBAT_EFFECTS") refresh(s);
  if (["FRIENDLY_EVENTS", "ENEMY_EVENTS", "PINNED_RECOVERY", "CAPTURE", "RETREAT"].includes(phase)) emit(s, "SEGMENT_COMPLETED", phaseInfo(phase)[1], { label: phaseInfo(phase)[1] });
  s.phase = PHASES[PHASES.findIndex((p) => p[0] === phase) + 1][0];
  enter(s);
  return result(state, s);
}
function abortMission(state) {
  if (state.status !== "ACTIVE") return { state, events: [] };
  const s = structuredClone(state);
  s.replay.push({ op: "abortMission" });
  endMission(s, "ABORTED", "Commander aborted the company assault.");
  return result(state, s);
}
function declineReattempt(state) {
  if (!state.mission_rules?.reattempts || state.status !== "DEFEAT" || state.attempt_number !== 1 || state.reattempt_declined) return { state, events: [], accepted: false, reason: "No reattempt decision is available." };
  const s = structuredClone(state);
  s.reattempt_declined = true;
  s.replay.push({ op: "declineReattempt" });
  emit(s, "REATTEMPT_DECLINED", `Commander ended ${s.mission_name} after the first attempt.`);
  return result(state, s, { accepted: true });
}
function replayOperation(s, op) {
  if (op.op === "resolveSupportChoice") return resolveSupportChoice(s, op.choice);
  if (op.op === "submitCommand") return submitCommand2(s, op.command);
  if (op.op === "selectHQ") return selectHQ(s, op.id);
  if (op.op === "advancePhase") return advancePhase(s, op.options);
  if (op.op === "resolveCombat") return resolveCombat(s, op.id);
  if (op.op === "abortMission") return abortMission(s);
  if (op.op === "preparePatrol") return preparePatrol(s, op.choices);
  if (op.op === "reattempt") return prepareReattempt(s, op.choices);
  if (op.op === "declineReattempt") return declineReattempt(s);
  throw new Error("Unknown replay operation");
}
function replayMission(scenario, record) {
  if (record.scenario !== scenario.id || record.ruleset !== scenario.ruleset || record.version !== scenario.version || record.rules_version !== RULES_VERSION)
    throw new Error("Replay rules/scenario version mismatch. Preserve historical exports; use compareReplay for a diagnostic comparison.");
  if (scenario.rules?.missionIdentity && !record.mission_instance_id) throw new Error("Normandy replay is missing its mission run identity.");
  let s = createMission(scenario, record.seed, record.setup ?? {}, record.roster_snapshot ? { mission_instance_id: record.mission_instance_id, roster: { schema: 1, ...record.roster_snapshot, applied_missions: {} } } : null, { mission_instance_id: record.mission_instance_id });
  for (const [index2, op] of record.operations.entries()) {
    const r = replayOperation(s, op);
    if (r.accepted === false || r.reason || r.state === s) throw new Error(`Replay operation ${index2 + 1} rejected: ${r.reason ?? "mission already ended"}`);
    s = r.state;
  }
  if (scenario.rules?.missionIdentity && JSON.stringify(record.attempt_records) !== JSON.stringify(s.attempt_records)) throw new Error("Replay attempt starting record mismatch.");
  return s;
}

// tmp/rules27-source/src/scenarios/normandyTerrain.js
var types = {
  O: ["Open Fields", 0, 1, 2, DIRECTIONS, 0],
  W: ["Woods", 2, 3, 4, [], -1],
  R: ["Orchard", 1, 2, 3, [], -1],
  M: ["Marsh", 1, 1, 2, [], 1],
  F: ["Farm", 2, 1, 3, [], 0],
  V: ["Village", 3, 3, 4, [], 0],
  C: ["Cemetery", 1, 1, 3, DIRECTIONS, 0],
  T: ["Church", 3, 1, 3, [], 0],
  GE: ["Gully / Draw", 2, 1, 3, ["E", "W"], 0],
  GN: ["Gully / Draw", 2, 1, 3, ["N", "S"], 0],
  HN: ["Hedgerow / Bocage", 2, 2, 4, ["N", "S"], 0],
  HE: ["Hedgerow / Bocage", 2, 2, 4, ["E", "W"], 0],
  HS: ["Hedgerow / Bocage", 2, 2, 4, ["S"], 0],
  HW: ["Hedgerow / Bocage", 2, 2, 4, ["W"], 0],
  HR: ["Hedgerow / Bocage", 2, 2, 4, ["E"], 0],
  HES: ["Hedgerow / Bocage", 2, 2, 4, ["E", "S"], 0],
  HD: ["Hedgerow / Bocage", 2, 2, 4, [], 0],
  HD1: ["Hedgerow / Bocage", 2, 2, 4, [], 0],
  H: ["Hill", 0, 0, 0, [], 0]
};
var sheets = [
  [["O", "H", "W", "HN", "GE", "O", "HD1", "F"], ["H", "R", "W", "R", "F*", "O", "R", "F"], ["R", "V*", "W", "V", "HD", "M", "GN", "M"]],
  [["C", "F", "W", "W", "GN", "HS", "W", "H"], ["HN", "V*", "R", "R", "O", "R", "HS", "T"], ["R", "W", "F", "GE", "HES", "H", "HD", "H"]],
  [["W", "HW", "HR", "HW", "HR", "H", "V"]]
];
var normandyTerrain = sheets.flatMap((rows, sheet) => rows.flatMap((row, r) => row.map((code, c) => {
  const key = code.replace("*", ""), [name, protection, cover_limit, cover_draw, open, burst] = types[key];
  return {
    id: `normandy_${sheet + 1}_${r + 1}_${c + 1}`,
    terrain: key === "H" ? "hill" : { O: "open", W: "woods", R: "orchard", M: "marsh", F: "farm", V: "village", C: "cemetery", T: "church" }[key] ?? (key.startsWith("G") ? "gully" : "hedgerow"),
    name,
    protection,
    cover_limit,
    cover_draw,
    borders: borders(open),
    burst,
    ...key.startsWith("G") || key.startsWith("H") && !["H", "HD"].includes(key) ? { open_protection: 1 } : {},
    trafficability: ["W", "M", "GE", "GN"].includes(key) ? "No" : ["F", "V", "C", "T"].includes(key) || key.startsWith("H") && key !== "H" ? "Slow" : "Unmarked",
    multi_story: code.includes("*"),
    tower: key === "T",
    building: ["F", "V", "C", "T"].includes(key),
    terrain_source: { sheet: sheet + 1, row: r + 1, column: c + 1 }
  };
})));

// tmp/rules27-source/src/scenarios/keepUpTheFire.js
var units = [];
var add = (id, name, kind, platoon, steps, vof, range, extra = {}) => units.push({ id, name, kind, platoon, steps, vof, range, location: `r0c${platoon ?? 2}`, faction: "friendly", experience: "Line", radios: [], ...extra });
add("co", "Company HQ", "HQ", null, 1, null, 0, { radios: ["BN"] });
add("xo", "Executive Officer", "STAFF", null, 1, null, 0);
add("staff", "First Sergeant", "STAFF", null, 1, null, 0);
for (let p = 1; p <= 3; p++) {
  add(`hq${p}`, `${p} Platoon HQ`, "HQ", p, 1, null, 0);
  for (let q = 1; q <= 3; q++) add(`s${p}${q}`, `${q}/${p} Rifle Squad`, "SQUAD", p, 3, "S", 2);
  add(`at${p}`, `${p}/Bazooka`, "AT", p, 1, "S", 1, { grenade_range: 1, fire_team_vof: "S" });
  add(`mortar${p}`, `${p}/60mm Mortar`, "MORTAR", p, 1, "G", 2);
}
for (let p = 1; p <= 2; p++) add(`mg${p}`, `${p}/LMG`, "MG", p, 1, "A", 2, { fire_team_vof: "A" });
add("artyfo", "Artillery Observer", "FO", null, 1, null, 0, { agency_role: "artyfo", radios: ["ARTY"] });
add("mtrfo", "Mortar Observer", "FO", null, 1, null, 0, { agency_role: "mtrfo", radios: ["MTR"] });
var force = (kind, cover = null) => ({ kind, cover });
var keepUpTheFire = {
  id: "keep_up_the_fire",
  name: "Keep Up the Fire",
  ruleset: "company-v1",
  version: 12,
  turn_limit: 10,
  readiness: { playable: true, stage: "standalone_validated", missing: [], assumptions: ["Fortification markers are unlimited; printed step capacities and enemy unit counters remain limited."] },
  briefing: "Human-acceptance build. Fortification markers are unlimited; printed capacities and enemy unit limits apply. Secure the Primary and Secondary Objectives on row 4 by turn 10. Achievement points also reward cleared positions, prisoners and casualty evacuation. This standalone mission uses simplified communications and event-driven ammunition; there are no vehicles or pyrotechnic signals.",
  map: { columns: 4, rows: 4, hidden: true, deck: normandyTerrain },
  locations: [],
  units,
  contacts: [],
  rules: { fortificationSupply: "unlimited_markers", contactExpansion: true, communications: "simplified", events: true, grenade: -4, contactOrder: true, coverTable: true, specialEnemies: true, signals: false, ammo: "events" },
  objectives: { type: "secure", primary: "r4c2", secondary: "r4c3", attack: "r3c2", ccp: "r0c2", clear_rows: [] },
  contact_rows: { 1: "C", 2: "B", 3: "A", 4: "B" },
  contact_draws: { NO_CONTACT: { A: 0, B: 0, C: 4 }, CONTACT: { A: 7, B: 5, C: 3 }, ENGAGED: { A: 5, B: 3, C: 2 }, HEAVILY_ENGAGED: { A: 3, B: 2, C: 1 } },
  package_tables: { A: [2, 3, 3, 5, 6, 7, 8, 9, 9, 9], B: [1, 2, 3, 3, 4, 4, 6, 7, 8, 9], C: [1, 1, 2, 2, 3, 3, 4, 4, 5, 7] },
  packages: { 1: { mines: true }, 2: { units: [force("SNIPER", "Cover")] }, 3: { incoming: -3, units: [force("SPOTTER", "Cover")] }, 4: { units: [force("LMG", "Foxholes")] }, 5: { units: [force("HMG", "Bunker")] }, 6: { units: [force("SQUAD", "Trench"), force("SQUAD", "Trench")] }, 7: { spotted: true, no_fire: true, exposed: true, units: [force("SQUAD")] }, 8: { units: [force("HMG", "Pillbox")] }, 9: { units: [force("HMG", "Bunker"), force("SQUAD", "Trench"), force("SQUAD", "Trench")] } },
  enemy_counters: [...Array.from({ length: 4 }, (_, i) => ({ id: `gr${i + 1}`, kind: "SQUAD", name: `${i + 1}/Gp Grenadier`, steps: 3, vof: i < 3 ? "A" : "S", range: 2, last_step_vof: i < 3 ? "A" : "S" })), ...Object.entries({ LMG: 5, HMG: 4, SNIPER: 3, SPOTTER: 3 }).flatMap(([kind, count]) => Array.from({ length: count }, (_, i) => ({ id: `${kind.toLowerCase()}${i + 1}`, kind, name: `${i + 1}/German ${kind === "SPOTTER" ? "Mortar Spotter" : kind}`, steps: 1, vof: { LMG: "A", HMG: "A", SNIPER: "S!", SPOTTER: null }[kind], range: kind === "HMG" ? 3 : 2, tripod: kind === "HMG", fire_team_vof: ["LMG", "HMG"].includes(kind) ? "A" : "S" })))],
  support_agencies: { artillery: { name: "15th Field Artillery Battalion", HE: -5, WP: -4, draws: { co: 2, artyfo: 3, mtrfo: 1 }, networks: { co: "BN", artyfo: "ARTY", mtrfo: "MTR" } }, mortar: { name: "Battalion Mortar Platoon", HE: -3, WP: -3, draws: { co: 2, artyfo: 2, mtrfo: 3 }, networks: { co: "BN", artyfo: "ARTY", mtrfo: "MTR" } } },
  assets: { s12: { rifle_grenade: 1 }, s22: { rifle_grenade: 1 }, s32: { rifle_grenade: 1 }, s11: { smoke: 1 }, s21: { smoke: 1 }, s31: { smoke: 1 }, staff: { smoke: 1, wp: 1 }, s13: { wp: 1 }, s23: { wp: 1 }, s33: { wp: 1 } }
};

// tmp/rules27-source/src/scenarios/trevieres.js
var units2 = [];
var add2 = (id, name, kind, platoon, steps, vof, range, experience, radios = [], extra = {}) => units2.push({ id, name, kind, platoon, steps, vof, range, experience, radios, location: `r0c${platoon ?? 2}`, faction: "friendly", ...extra });
add2("co", "Company HQ", "HQ", null, 1, null, 0, "Green", ["BN", "CO"], { command_role: "company_commander", agency_role: "company_commander", capabilities: { activate_subordinates: true, company_orders: true } });
add2("xo", "Company Executive Officer", "STAFF", null, 1, null, 0, "Green", ["CO"], { command_role: "company_executive", capabilities: { company_orders: true, succession_priority: -1 } });
add2("staff", "Company First Sergeant", "STAFF", null, 1, null, 0, "Veteran", [], { command_role: "company_staff", capabilities: { company_orders: true, succession_priority: 2, cannot_order_roles: ["company_executive"] } });
for (let p = 1; p <= 3; p++) {
  add2(`hq${p}`, `${p} Platoon HQ`, "HQ", p, 1, null, 0, "Green", ["CO"], { command_role: "platoon_commander", capabilities: { succession_priority: 0 } });
  for (let q = 1; q <= 3; q++) add2(`s${p}${q}`, `${q}/${p} Rifle Squad`, "SQUAD", p, 3, "S", 2, "Line");
}
add2("mortar_section", "60mm Mortar Section", "MORTAR", null, 3, "H", 2, "Line", ["CO"], { ammo: { MTR: 4 } });
add2("hmg50", ".50 cal HMG", "HMG", null, 1, "H", 3, "Line", [], { ammo: { MG: 4 }, tripod: true, tripod_good_only: true, fire_team_vof: "S" });
for (let p = 1; p <= 2; p++) add2(`mg${p}`, `${p}/LMG`, "MG", null, 1, "A", 2, "Line", [], { ammo: { MG: 4 }, fire_team_vof: "A" });
for (let p = 1; p <= 3; p++) add2(`at${p}`, `${p}/Bazooka`, "AT", null, 1, "S", 1, "Line", [], { ammo: { RKT: 3 }, grenade_range: 1, fire_team_vof: "S" });
add2("artyfo", "Artillery Forward Observer", "FO", null, 1, null, 0, "Line", ["ARTY"], { agency_role: "artillery_observer", capabilities: { succession_priority: 1 } });
var mortarTeams = Array.from({ length: 3 }, (_, i) => ({ id: `mortar${i + 1}`, name: `${i + 1}/60mm Mortar`, kind: "MORTAR", platoon: null, steps: 1, vof: "G", range: 2, experience: "Line", radios: [], location: "r0c2", faction: "friendly", ammo: { MTR: 4 }, fire_team_vof: "S" }));
var force2 = (kind, cover = null, extra = {}) => ({ kind, cover, ...extra });
var packages2 = {
  1: { mines: true, optional: { chance: "1/2", units: [force2("SNIPER", "Cover")] } },
  2: { incoming_options: [{ agency: "enemy_artillery", value: -4 }, { agency: "enemy_mortar", value: -3 }], units: [force2("SPOTTER", "Trench")] },
  3: { units: [force2("SNIPER", "Cover")] },
  4: { mines: true, units: [force2("HMG", "Foxholes", { ammo: 8 })], spotted: true },
  5: { alternatives: [{ units: [force2("LMG", "Foxholes", { ammo: 6 })], point_blank_chance: "2/10" }, { units: [force2("HMG", "Foxholes", { ammo: 8 })], spotted: true }] },
  6: { units: [force2("SQUAD", "Trench"), force2("SQUAD", "Trench")], close_chance: "2/10", optional: { chance: "1/2", units: [force2("HMG", "Bunker", { ammo: 8, same_as_any: true })] } },
  7: { units: [force2("SQUAD", "Trench"), force2("SQUAD", "Trench")], close_chance: "2/10", optional: { if_available: true, units: [force2("LEADER", "Trench", { same_as_previous: true })] } },
  8: { units: [force2("HMG", "Pillbox", { ammo: 8 })] },
  9: { units: [force2("MORTAR", "Foxholes", { ammo: 6 })] },
  10: { units: [force2("FLAK88", "Trench", { ammo: 6 })], spotted: true },
  11: { units: [force2("SQUAD", null)], no_fire: true, spotted: true, infiltration: true },
  12: { units: [force2("LMG", null, { ammo: 6 })], spotted: true }
};
var enemy_counters = [
  ...Array.from({ length: 4 }, (_, i) => ({ id: `gr${i + 1}`, kind: "SQUAD", name: `${i + 1}/Grenadier`, steps: 3, vof: i < 3 ? "A" : "S", vof_by_steps: i < 3 ? { 3: "A", 2: "A" } : { 3: "S", 2: "S" }, range: 2, ammo: i < 3 ? { MG: 6 } : {}, last_step_vof: i < 3 ? "A" : "S" })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: `lmg${i + 1}`, kind: "LMG", name: `${i + 1}/German LMG`, steps: 1, vof: "A", range: 2, ammo: { MG: 6 }, fire_team_vof: "A" })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `hmg${i + 1}`, kind: "HMG", name: `${i + 1}/German HMG`, steps: 1, vof: "H", range: 3, ammo: { MG: 8 }, tripod: true, tripod_good_only: true, fire_team_vof: "S" })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `sniper${i + 1}`, kind: "SNIPER", name: `${i + 1}/German Sniper`, steps: 1, vof: "S!", range: 3 })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `spotter${i + 1}`, kind: "SPOTTER", name: `${i + 1}/German Spotter`, steps: 1, vof: null, range: 3, missions: 2 })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `leader${i + 1}`, kind: "LEADER", name: `${i + 1}/German Leader`, steps: 1, vof: null, fire_team_vof: "S", range: 1 })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `mortar${i + 1}`, kind: "MORTAR", name: `${i + 1}/81mm Mortar`, steps: 1, vof: "G", range: 3, ammo: { MTR: 6 }, fire_team_vof: "S" })),
  { id: "flak88", kind: "FLAK88", name: "FLAK 36 88mm Gun", steps: 2, vof: "H", range: 3, ammo: { GUN: 6 }, mobile: false, fire_team_vof: "S" }
];
var trevieres = {
  id: "normandy_1",
  name: "Normandy 1 \u2014 Tr\xE9vi\xE8res Offensive",
  ruleset: "company-v1",
  version: 5,
  turn_limit: 10,
  readiness: { playable: true, stage: "standalone_validated", missing: [] },
  special_rules: [
    "Secure both Row 3 objectives and clear every original card in Rows 1\u20132 within ten daylight turns.",
    "Artillery: four HE and one WP missions. Artillery observer draws two cards; Company HQ draws one. No battalion fire missions.",
    "After first-attempt failure, one reattempt is available under \xA73.9. No Mission 2 progression is offered.",
    "Counterattack: place random remaining PC markers on their question side on every US-occupied battlefield card. Staging areas remain outside combat. Reveal overlapping markers and retain the highest letter (A, then B, then C).",
    "Offensive Assault lasts three turns including the triggering turn; the offensive sequence of play stays unchanged. Counterattack PC A uses packages 2 (2/4), 11 (1/4), or 12 (1/4). Question-side markers are revealed when the contact-evaluation segment begins."
  ],
  briefing: "Cross the Aure on foot. Secure both Row 3 objectives and clear Rows 1 and 2 within ten turns. One reattempt is permitted after failure.",
  map: { columns: 4, rows: 3, hidden: true, deck: normandyTerrain },
  locations: [],
  units: units2,
  contacts: [],
  unit_options: { mortar: { default: "section", section_id: "mortar_section", teams: mortarTeams }, command_network: { default: "radio", choices: ["radio", "phones"] } },
  rules: { missionIdentity: true, rosterKey: "platoon-normandy-campaign", enemyActivity: "normandy", contactExpansion: true, communications: "normandy", events: "normandy", grenade: -4, contactOrder: true, coverTable: "normandy", specialEnemies: true, signals: true, runners: true, ammo: "tracked", leaderBonus: true, tactics: "deliberate_defense", reattempts: 1, counterattack_table: [2, 2, 11, 12] },
  objectives: { type: "secure_and_clear", primary: "r3c2", secondary: "r3c3", attack: "r2c2", ccp: "r0c2", clear_rows: [1, 2] },
  contact_rows: { 1: "C", 2: "A", 3: "B" },
  contact_draws: keepUpTheFire.contact_draws,
  package_tables: { A: [3, 5, 5, 6, 7, 7, 8, 10, 11, 11], B: [2, 2, 4, 5, 5, 5, 6, 6, 9, 10], C: [1, 1, 2, 2, 2, 2, 3, 4, 5, 5] },
  packages: packages2,
  enemy_counters,
  support_agencies: { artillery: { name: "15th Field Artillery Battalion", HE: -5, WP: -4, draws: { company_commander: 1, artillery_observer: 2 }, networks: { company_commander: "BN", artillery_observer: "ARTY" }, inventory: { HE: 4, WP: 1 } } },
  assets: { s11: { smoke: 1, rifle_grenade: 1 }, s21: { smoke: 1, rifle_grenade: 1 }, s31: { smoke: 1, rifle_grenade: 1 }, staff: { smoke: 1 }, xo: { wp: 4 } },
  signal_assets: { rsp: { carrier: "co", order: "CF" }, rsc: { carrier: "co", order: "CF" }, gsp: { carrier: "hq1", order: "CF" }, gsc: { carrier: "hq1", order: "CF" }, red_signal: { carrier: "hq2", order: "CF" }, green_signal: { carrier: "hq2", order: "CF" }, yellow_signal: { carrier: "hq3", order: "CF" }, purple_signal: { carrier: "hq3", order: "CF" } },
  mission_content: { source: "FoF Deluxe Normandy Campaign pp. 12\u201319", reattempts: 1, phase_lines: ["LOD", "LOA"], counterattack_table: [2, 2, 11, 12] }
};

// tmp/rules27-source/src/scenarios/cerisy.js
var force3 = (kind, cover = null, extra = {}) => ({ kind, cover, ...extra });
var units3 = structuredClone(trevieres.units);
units3.push({ id: "mtrfo", name: "81mm Mortar Forward Observer", kind: "FO", platoon: null, steps: 1, vof: null, range: 0, experience: "Line", radios: ["MTR"], location: "r0c2", faction: "friendly", agency_role: "mortar_observer", capabilities: { succession_priority: 1 } });
var common = trevieres.enemy_counters.filter((c) => ["LMG", "HMG", "SNIPER", "SPOTTER", "LEADER"].includes(c.kind)).map((c) => ({ ...structuredClone(c), ...c.kind === "SPOTTER" ? { missions: 3, subsequent_draws: 3 } : {}, ...c.kind === "LEADER" ? { assets: { rifle_grenade: 2 } } : {} }));
var squads = Array.from({ length: 6 }, (_, i) => ({ id: `fj${i + 1}`, kind: "SQUAD", name: `${i + 1}/Fallschirmj\xE4ger`, steps: 3, vof: i < 3 ? "A" : i === 3 ? "S" : "A/S", vof_by_steps: i < 3 ? { 3: "A", 2: "A" } : i === 3 ? { 3: "S", 2: "S" } : { 3: "A/S", 2: "A/S" }, range: 2, ammo: i < 3 ? { MG: 6 } : {}, last_step_vof: i < 3 ? "A" : "S", breakdown: i < 3 ? "fallschirmjager_a" : i === 3 ? "fallschirmjager_s" : "fallschirmjager_as", assets: { panzerfaust: 2 } }));
var mortar = { id: "mortar_section81", kind: "MORTAR", name: "81mm Mortar Section", steps: 3, vof: "H", range: 3, ammo: { MTR: 6 }, fire_team_vof: "S", breakdown: "german_mortar_section" };
var early = ["EVAC", "DISPLACE_MORTAR", "DISPLACE_LEADER", "DISPLACE_HMG", "RALLY", "RALLY", "FALL_BACK", "FALL_BACK", "COUNTER_ATTACK", "COUNTER_ATTACK"];
var late = ["EVAC", "EVAC", "DISPLACE_MORTAR", "DISPLACE_LEADER", "DISPLACE_HMG", "RALLY", "RALLY", "FALL_BACK", "FALL_BACK", "COUNTER_ATTACK"];
var agency = (name, HE, WP, draws, inventory, battalion = false) => ({ name, HE, WP, draws, inventory, battalion, networks: { company_commander: "BN", artillery_observer: "ARTY", mortar_observer: "MTR" } });
var cerisy = {
  ...structuredClone(trevieres),
  id: "normandy_2",
  name: "Normandy 2 \u2014 Cerisy Offensive",
  version: 1,
  readiness: { playable: true, stage: "accepted standalone", missing: [] },
  map: { ...structuredClone(trevieres.map), rows: 5 },
  units: units3,
  objectives: { type: "secure_and_clear", primary: "r5c2", secondary: "r5c3", attack: "r4c2", ccp: "r0c2", clear_rows: [1, 2, 3, 4] },
  contact_rows: { 1: "C", 2: "C", 3: "B", 4: "B", 5: "A" },
  rules: { ...structuredClone(trevieres.rules), tactics: "hasty_defense", counterattack_table: [1, 1, 1, 9, 9, 9, 9, 11, 11, 11], enemy_event_tables: { early, late }, friendly_event_tables: { early: ["SITREP", "COMM", "NO_ARTY", "CHECKING_UP", "HOLD", "ADVANCE", "ADVANCE_PC", "ADVANCE_PC", "RESUPPLY", "RESUPPLY"], late: ["SITREP", "COMM", "NO_ARTY", "CHECKING_UP", "HOLD", "ADVANCE", "ADVANCE_PC", "RESUPPLY", "RESUPPLY", "RESUPPLY"] }, required_enemy_kinds: ["SQUAD", "LMG", "HMG", "SNIPER", "SPOTTER", "LEADER", "MORTAR"], package_count: 11, missionIdentity: true, standaloneRoster: true, rosterKey: "platoon-normandy-cerisy-standalone" },
  package_tables: { A: [3, 3, 3, 4, 5, 6, 7, 8, 9, 10], B: [1, 1, 1, 2, 3, 3, 3, 3, 9, 9], C: [1, 1, 1, 2, 2, 3, 3, 3, 9, 9] },
  packages: {
    1: { alternatives: [{ incoming: -4, incoming_agency: "enemy_artillery", units: [] }, { incoming: -3, incoming_agency: "enemy_mortar", units: [force3("SPOTTER", "Foxholes")] }] },
    2: { units: [force3("SNIPER", "Cover")] },
    3: { alternatives: [{ units: [force3("LMG", "Foxholes", { ammo: 6 })], placement_draw: { sides: 10, point_blank: [1, 2], max: [3, 4, 5, 6, 7, 8] } }, { units: [force3("HMG", "Foxholes", { ammo: 8 })], spotted: true }] },
    4: { units: [force3("SQUAD", "Foxholes"), force3("SQUAD", "Foxholes")], close_chance: "2/10" },
    5: { units: [force3("SQUAD", "Trench"), force3("SQUAD", "Trench"), force3("HMG", "Bunker", { ammo: 8, same_as_any: true })] },
    6: { units: [force3("SQUAD", "Foxholes"), force3("SQUAD", "Foxholes")], close_chance: "2/10", optional: { if_available: true, units: [force3("LEADER", "Foxholes", { same_as_previous: true })] } },
    7: { units: [force3("SQUAD", "Deep Bunker", { steps: 2 }), force3("LEADER", "Deep Bunker", { same_as_previous: true })], no_fire: true, spotted: true, placement_draw: { sides: 5, point_blank: [1, 2, 3], close: [4, 5] } },
    8: { units: [force3("LMG", "Foxholes", { ammo: 6 }), force3("MORTAR", "Foxholes", { ammo: 6, same_as_previous: true })] },
    9: { units: [force3("SQUAD", null)], no_fire: true, spotted: true, infiltration: true },
    10: { units: [force3("HMG", "Pillbox", { ammo: 8 })], point_blank_chance: "2/10", outflanked: true },
    11: { units: [force3("LMG", null, { ammo: 6 })], spotted: true }
  },
  enemy_counters: [...squads, ...common, mortar],
  support_agencies: { artillery: agency("15th Field Artillery Battalion", -5, -4, { artillery_observer: 3, mortar_observer: 2, company_commander: 2 }, { HE: 4, WP: 1 }, true), mortar: agency("Battalion Mortar Platoon", -3, -3, { artillery_observer: 2, mortar_observer: 3, company_commander: 2 }, { HE: 3, WP: 1 }), cannon: agency("Regimental Cannon Company", -4, -4, { artillery_observer: 3, mortar_observer: 3, company_commander: 2 }, { HE: 3, WP: 1 }) },
  briefing: "Clear the Cerisy forest and maintain contact. Secure both Row 5 objectives and clear original Rows 1\u20134 within ten daylight turns. One reattempt is permitted.",
  special_rules: [
    "Secure both Row 5 objectives and clear original Rows 1\u20134 within ten daylight turns. One reattempt is permitted after first-attempt failure.",
    "Fresh standalone company: no carryover from Mission 1. Radios and the mortar section are the defaults; field phones and individual mortar teams remain selectable.",
    "Artillery: four HE / one WP; battalion mortar and regimental cannon: three HE / one WP each. Caller draws follow the Mission 2 support table. Artillery may expand a successful three-burst call into a battalion mission.",
    "Enemy tactics begin at Hasty Defense. Counterattacks place question-side contacts on US-occupied battlefield cards and apply Offensive Assault for three turns including the trigger, then restore Hasty Defense. The offensive phase sequence stays unchanged.",
    "Counterattack PC A uses packages 1 (3/10), 9 (4/10), or 11 (3/10). Overlapping markers reveal and retain the highest letter (A, then B, then C).",
    "Deep Bunker occupants exert no VOF and cannot spot, deploy signals or make grenade attacks until they leave. Point-blank pillboxes are spotted, face randomly, and do not fire immediately.",
    "Fallschirmj\xE4ger squads use their own breakdown chart. Leaders have two rifle grenades. Panzerfausts are vehicle-only equipment and remain inactive in this infantry mission."
  ],
  mission_content: { source: "FoF Deluxe Normandy Campaign pp. 12\u201315, 20\u201323, 47\u201348", reattempts: 1, standalone: true }
};

// tmp/rules27-source/src/scenarios/stGeorgesContent.js
var force4 = (kind, cover = null, extra = {}) => ({ kind, cover, ...extra });
var stGeorgesContent = {
  id: "normandy_3",
  name: "Normandy 3 \u2014 St. Georges d\u2019Elle\u2014Le Parc Defensive",
  version: 1,
  source: "FoF Deluxe Normandy Campaign pp. 24\u201327",
  map: { columns: 5, rows: 4, staging: false },
  turn_limit: 10,
  patrols: 3,
  phase_sequence: "offensive",
  enemy_tactics: "deliberate_defense",
  enemy_experience: "Veteran",
  visibility: { type: "moon", random_light: [2, 3, 4, 5] },
  objectives: { primary_row: 4, route_rows: [2, 3, 4], route_points: 4, return_crossing: [2, 1], clear_required: false },
  contact_rows: { 1: null, 2: ["B", "C"], 3: ["B", "C"], 4: "A" },
  question_side_rows: [2, 3],
  cop_contact: false,
  defenses: { row1_foxholes_per_card: 2, cop_foxholes_max: 2, mlr_between: [1, 2] },
  attachments: [
    { id: "fo", role: "artillery_observer", experience: "Line", steps: 1, radios: ["ARTY"] },
    { id: "mtrfo", role: "mortar_observer", experience: "Line", steps: 1, radios: ["MTR"] },
    { id: "hmg1", name: "1/1 HMG", kind: "HMG", experience: "Line", steps: 1, ammo: { MG: 6 } },
    { id: "hmg2", name: "2/1 HMG", kind: "HMG", experience: "Line", steps: 1, ammo: { MG: 6 } }
  ],
  package_tables: { A: [3, 4, 4, 5, 8, 8, 9, 10, 11, 12], B: [1, 1, 2, 2, 2, 3, 5, 6, 6, 7], C: [1, 1, 2, 2, 2, 3, 5, 5, 6, 7] },
  packages: {
    1: { mines: true, units: [] },
    2: { alternatives: [{ incoming: -4, incoming_agency: "enemy_artillery", units: [] }, { incoming: -3, incoming_agency: "enemy_mortar", units: [] }] },
    3: { units: [force4("LMG", "Foxholes", { ammo: 6 })], point_blank_chance: "2/10" },
    4: { units: [force4("SQUAD", "Foxholes"), force4("HMG", "Foxholes", { ammo: 8 })], spotted: true },
    5: { units: [force4("SQUAD", null)], exposed: true, no_fire: true, spotted: true },
    6: { illumination: "mortar", units: [force4("LMG", "Foxholes", { ammo: 6 })], spotted: true },
    7: { illumination: "mortar", units: [force4("SQUAD", null)], exposed: true, no_fire: true, spotted: true },
    8: { units: [force4("SQUAD", "Foxholes"), force4("SQUAD", "Foxholes")], close_chance: "2/10", optional: { if_available: true, units: [force4("LEADER", "Foxholes", { same_as_previous: true })] } },
    9: { units: [force4("SQUAD", "Trench"), force4("SQUAD", "Trench"), force4("HMG", "Bunker", { ammo: 8, same_as_any: true })] },
    10: { units: [force4("HMG", "Pillbox", { ammo: 8 })], point_blank_chance: "2/10", outflanked: true },
    11: { units: [force4("SQUAD", null)], no_fire: true, spotted: true, infiltration: true },
    12: { units: [force4("LMG", "Foxholes", { ammo: 6 }), force4("MORTAR", "Foxholes", { ammo: 6, same_as_previous: true })] }
  },
  friendly_event_tables: { early: ["COMM", "COMM", "LOST", "LOST", "HOLD_PATROL", "HOLD_PATROL", "RAIN", "NO_MORTAR", "ADVANCE_ROUTE", "ADVANCE_ROUTE"], late: ["COMM", "COMM", "COMM", "LOST", "HOLD_PATROL", "HOLD_PATROL", "RAIN", "NO_MORTAR", "NO_MORTAR", "ADVANCE_ROUTE"] },
  enemy_event_tables: { early: ["EVAC", "DISPLACE_MORTAR", "DISPLACE_LEADER", "DISPLACE_HMG", "RALLY", "RALLY", "FALL_BACK", "FALL_BACK", "SHIFTING_LINES", "SHIFTING_LINES"], late: ["EVAC", "EVAC", "DISPLACE_MORTAR", "DISPLACE_LEADER", "DISPLACE_HMG", "RALLY", "RALLY", "FALL_BACK", "FALL_BACK", "SHIFTING_LINES"] },
  support: {
    artillery: { HE: -5, WP: -4, draws: { artillery_observer: 3, mortar_observer: 2, company_commander: 2 }, inventory: { HE: 4, WP: 1, ILLUM: 6 }, battalion: true },
    mortar: { HE: -3, WP: -3, draws: { artillery_observer: 2, mortar_observer: 3, company_commander: 2 }, inventory: { HE: 3, WP: 1, ILLUM: 4 } },
    cannon: { HE: -4, WP: -4, draws: { artillery_observer: 3, mortar_observer: 3, company_commander: 2 }, inventory: { HE: 3, WP: 1 } }
  }
};

// tmp/rules27-source/src/scenarios/stGeorges.js
var units4 = structuredClone(cerisy.units).map((u) => ({ ...u, location: `r1c${u.platoon ?? (["HQ", "STAFF", "FO"].includes(u.kind) ? 2 : 4)}` }));
for (const attachment of stGeorgesContent.attachments.filter((u) => u.kind === "HMG")) units4.push({ ...structuredClone(attachment), faction: "friendly", platoon: null, location: "r1c5", vof: "A+", range: 3, radios: [], tripod: true, fire_team_vof: "A" });
var stGeorges = {
  ...structuredClone(cerisy),
  id: stGeorgesContent.id,
  name: stGeorgesContent.name,
  version: 1,
  units: units4,
  readiness: { playable: true, stage: "standalone_validated", development_validated: true, accepted: "2026-10-07", missing: [] },
  assets: { ...structuredClone(cerisy.assets), s12: { illum: 2 }, ...Object.fromEntries(Object.entries(cerisy.assets).map(([id, a]) => [id, { ...a, ...["s11", "s12", "s21", "s31"].includes(id) ? { illum: 2 } : {} }])) },
  map: { ...structuredClone(cerisy.map), ...stGeorgesContent.map },
  patrol_plan: { platoon: 1, primary: "r4c3", route: ["r2c1", "r3c2", "r4c3", "r2c2"], cop: "r2c3", ccp: "r1c2", concentration: "r4c3" },
  objectives: { type: "patrol", primary: "r4c3", secondary: "r4c3", attack: "r2c3", ccp: "r1c2", clear_rows: [] },
  contact_rows: structuredClone(stGeorgesContent.contact_rows),
  packages: structuredClone(stGeorgesContent.packages),
  package_tables: structuredClone(stGeorgesContent.package_tables),
  enemy_counters: cerisy.enemy_counters.filter((u) => !["SNIPER", "SPOTTER"].includes(u.kind)).map((u) => {
    const counter = structuredClone(u);
    if (counter.assets) delete counter.assets.panzerfaust;
    return counter;
  }),
  rules: {
    ...structuredClone(cerisy.rules),
    patrols: 3,
    reattempts: 0,
    handheldIllumination: 8,
    tactics: stGeorgesContent.enemy_tactics,
    enemyExperience: stGeorgesContent.enemy_experience,
    required_enemy_kinds: ["SQUAD", "LMG", "HMG", "LEADER", "MORTAR"],
    package_count: 12,
    baselineCompanyId: "normandy_st_georges_standalone_company",
    rosterKey: "platoon-normandy-st-georges-standalone",
    friendly_event_tables: structuredClone(stGeorgesContent.friendly_event_tables),
    enemy_event_tables: structuredClone(stGeorgesContent.enemy_event_tables)
  },
  support_agencies: Object.fromEntries(Object.entries(stGeorgesContent.support).map(([id, agency2]) => [id, { ...structuredClone(cerisy.support_agencies[id]), ...structuredClone(agency2) }])),
  briefing: "Patrol from Row 1 through four route points in order and the Row 4 objective, then return across the MLR. Each platoon carries out one ten-turn night patrol on the same map.",
  special_rules: ["Combat patrols retain the offensive phase sequence. Non-patrolling units hold fixed positions, except for automatic retreat.", "Visit all four route points in order, pass through the primary objective and finally cross from Row 2 to Row 1. Clearing and holding cards is not required for patrol success.", "Artillery has four HE, one WP and six illumination missions; battalion mortars have three HE, one WP and four illumination missions; cannon has three HE and one WP. Illumination is immediate and expires at cleanup. The selected artillery concentration adds one caller draw until moved by successful fire.", "Combat patrols use radios; field phones are not permitted. Colored smoke cannot signal at night. Eight handheld illumination devices are available.", "Each platoon patrols once. Moon visibility is randomly selected from +2 through +5 for each patrol. General Initiative commands are halved, rounding down."],
  mission_content: { source: stGeorgesContent.source, standalone: true, patrols: 3 }
};
export {
  replayMission,
  stGeorges
};
