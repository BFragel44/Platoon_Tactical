function hashSeed(seed) {
  const text = String(seed);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createRng(seed) {
  if (seed === undefined || seed === null || String(seed).length === 0) {
    throw new TypeError("seed must be a non-empty string or number");
  }

  const normalizedSeed = String(seed);

  return {
    seed: normalizedSeed,
    state: hashSeed(normalizedSeed),
    draw_count: 0,
  };
}

export function drawRandom(rng) {
  let state = (rng.state + 0x6d2b79f5) >>> 0;
  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  value = ((value ^ (value >>> 14)) >>> 0) / 4294967296;

  return {
    rng: {
      ...rng,
      state,
      draw_count: rng.draw_count + 1,
    },
    value,
  };
}
