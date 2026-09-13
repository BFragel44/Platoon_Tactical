import { describe, expect, it } from "vitest";

import { createRng, drawRandom } from "../src/sim/index.js";

describe("seeded RNG", () => {
  it("produces a repeatable sequence with serializable state", () => {
    let first = createRng("alpha");
    let second = createRng("alpha");
    const firstValues = [];
    const secondValues = [];

    for (let index = 0; index < 4; index += 1) {
      const firstDraw = drawRandom(first);
      const secondDraw = drawRandom(second);
      first = firstDraw.rng;
      second = secondDraw.rng;
      firstValues.push(firstDraw.value);
      secondValues.push(secondDraw.value);
    }

    expect(secondValues).toEqual(firstValues);
    expect(second).toEqual(first);
    expect(first.draw_count).toBe(4);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  });

  it("does not mutate the previous RNG state", () => {
    const initial = createRng("alpha");
    const snapshot = { ...initial };

    drawRandom(initial);

    expect(initial).toEqual(snapshot);
  });
});
