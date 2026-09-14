import { MissionPhase } from "./constants.js";
import { resolveCommands } from "./commands.js";
import { evaluateAutomaticFire } from "./fire.js";

export function advancePhase(state) {
  if (state.phase === MissionPhase.COMMAND) {
    const nextState = structuredClone(state);
    nextState.phase = MissionPhase.ACTION;
    return { state: nextState, events: [] };
  }

  if (state.phase === MissionPhase.ACTION) {
    const result = resolveCommands(state);
    result.state.phase = MissionPhase.CONTACT_OBSERVATION;
    return result;
  }

  if (state.phase === MissionPhase.AUTOMATIC_FIRE) {
    const nextState = structuredClone(state);
    const events = evaluateAutomaticFire(nextState);
    nextState.phase = MissionPhase.EFFECTS;
    return { state: nextState, events };
  }

  const nextState = structuredClone(state);
  const nextPhase = {
    [MissionPhase.CONTACT_OBSERVATION]: MissionPhase.AUTOMATIC_FIRE,
    [MissionPhase.EFFECTS]: MissionPhase.RECOVERY_CLEANUP,
    [MissionPhase.RECOVERY_CLEANUP]: MissionPhase.COMMAND,
  }[state.phase];

  nextState.phase = nextPhase;
  if (nextPhase === MissionPhase.COMMAND) {
    nextState.turn += 1;
    for (const factionId of Object.keys(nextState.command_capacity_by_faction)) {
      nextState.command_capacity_by_faction[factionId] =
        factionId === nextState.player_faction_id ? 4 : 0;
    }
  }

  return { state: nextState, events: [] };
}
