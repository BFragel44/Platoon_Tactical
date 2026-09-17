import { capable, casualty, emit, isSpotted, ordered, random, RULES, setSuppression } from './rules.js';
import { pressureOn, incomingFire } from './fire.js';
export { tacticalStateForSuppression } from './rules.js';

export function recoverSuppression(state) {
  const recoveries = ordered(state.teams_by_id).filter(team => capable(state, team))
    .map(team => ({ id: team.id, pressure: pressureOn(state, team) }));
  for (const { id, pressure } of recoveries) {
    const team = state.teams_by_id[id];
    setSuppression(state, team, team.suppression - (pressure < 5 ? RULES.recovery : RULES.pressuredRecovery),
      null, pressure < 5 ? 'recovering without effective incoming fire' : 'regaining cohesion under fire');
  }
}
export function resolveFireEffects(state) {
  // All pressures and random outcomes are calculated before any effects commit.
  const outcomes = ordered(state.teams_by_id).filter(team => capable(state, team)).map(team => {
    const pressure = pressureOn(state, team);
    const amount = pressure > 0 ? Math.round(pressure * (0.75 + random(state) * 0.5)) : 0;
    const hit = pressure > 18 && random(state) < Math.min(0.18, (pressure - 18) * 0.004);
    return { id: team.id, amount, hit, causeId: incomingFire(state, team)[0]?.caused_by_event_id ?? null };
  });
  for (const outcome of outcomes) {
    const team = state.teams_by_id[outcome.id];
    if (outcome.amount) setSuppression(state, team, team.suppression + outcome.amount, outcome.causeId,
      team.exposed ? 'caught exposed under incoming fire' : 'incoming fire');
    if (outcome.hit) casualty(state, team, outcome.causeId);
  }
}
