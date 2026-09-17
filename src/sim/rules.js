import { drawRandom } from './rng.js';
import { createEvent } from './events.js';

export const RULES = Object.freeze({
  commandMin: 2, commandRange: 3, reserveMax: 2, turnLimit: 24,
  suppressed: 30, pinned: 60, suppressionMax: 90,
  recovery: 25, pressuredRecovery: 10, rallyReduction: 40,
  coverChance: 0.7, rallyChance: 0.65, leaderBonus: 0.2,
});
export const ordered = (items) => Object.values(items).sort((a, b) => a.id.localeCompare(b.id));
export function random(state) {
  const draw = drawRandom(state.rng); state.rng = draw.rng; return draw.value;
}
export function emit(state, type, { team = null, locationId = team?.location_id ?? null,
  result = null, causeId = null, hidden = false, text = '', metadata = {} } = {}) {
  const event = createEvent({ sequence: state.next_event_sequence++, type,
    turn: state.turn, phase: state.phase, locationId,
    actor: team ? { type: 'TEAM', id: team.id } : null,
    result, causedByEventId: causeId, metadata: { ...metadata, text },
    visibility: { faction_ids: hidden ? [] : [state.player_faction_id], simulation_only: hidden },
  });
  state.events.push(event); return event;
}
export const activeMembers = (state, team) => team.member_ids.map(id => state.soldiers_by_id[id])
  .filter(soldier => soldier?.condition === 'EFFECTIVE');
export const capable = (state, team) => activeMembers(state, team).length > 0 && !team.withdrawn;
export const tacticalStateForSuppression = value => value >= RULES.pinned ? 'PINNED' : value >= RULES.suppressed ? 'SUPPRESSED' : 'EFFECTIVE';
export function setSuppression(state, team, value, causeId = null, description = '') {
  const previous = team.suppression;
  const priorState = team.tactical_state;
  team.suppression = Math.max(0, Math.min(RULES.suppressionMax, Math.round(value)));
  team.tactical_state = tacticalStateForSuppression(team.suppression);
  if (previous === team.suppression) return;
  const visible = team.faction_id === state.player_faction_id || isSpotted(state, team.id);
  const event = emit(state, 'SUPPRESSION_CHANGED', { team, causeId, hidden: !visible,
    result: { previous_suppression: previous, new_suppression: team.suppression },
    text: `${team.name}: ${team.tactical_state.toLowerCase()}${description ? ` — ${description}` : ''}.`,
  });
  if (priorState !== team.tactical_state) emit(state,
    team.tactical_state === 'PINNED' ? 'UNIT_PINNED' : team.tactical_state === 'SUPPRESSED' ? 'UNIT_SUPPRESSED' : 'UNIT_RECOVERED',
    { team, causeId: event.id, hidden: !visible, result: { previous_state: priorState, new_state: team.tactical_state },
      text: `${team.name} is now ${team.tactical_state.toLowerCase()}.` });
}
export const canSee = (state, from, to) => from === to || state.locations_by_id[from].fire_location_ids.includes(to);
export const isSpotted = (state, id) => Boolean(state.knowledge_by_faction[state.player_faction_id].known_enemy_teams_by_id[id]);
export const leaderActive = state => state.leader.condition === 'EFFECTIVE' && capable(state, state.teams_by_id[state.leader.team_id]);
export function inCommand(state, team) {
  if (!leaderActive(state)) return false;
  const location = state.teams_by_id[state.leader.team_id].location_id;
  return location === team.location_id || state.locations_by_id[location].connected_location_ids.includes(team.location_id);
}
export function fireStrength(state, team) {
  if (!capable(state, team)) return 0;
  const base = activeMembers(state, team).reduce((sum, soldier) => sum +
    (soldier.weapon_category === 'LIGHT_AUTOMATIC_WEAPON' ? 2.5 : soldier.weapon_category === 'RIFLE_GRENADE_LAUNCHER' ? 1.5 : 1), 0);
  const factor = team.suppression >= 60 ? 0.1 : team.suppression >= 30 ? 0.45 : 1;
  return base * factor * (team.directed_turn === state.turn ? 1.3 : 1);
}
export function casualty(state, team, causeId, force = false) {
  const members = activeMembers(state, team);
  const leaderHere = team.faction_id === state.player_faction_id && state.leader.team_id === team.id && state.leader.condition === 'EFFECTIVE';
  const candidates = leaderHere ? [...members, state.leader] : members;
  if (!candidates.length) return;
  const victim = candidates[Math.floor(random(state) * candidates.length)];
  victim.condition = force || random(state) < 0.3 ? 'KILLED' : 'WOUNDED';
  const visible = team.faction_id === state.player_faction_id || isSpotted(state, team.id);
  emit(state, `SOLDIER_${victim.condition}`, { team, causeId, hidden: !visible,
    result: { soldier_id: victim.id, name: victim.name, condition: victim.condition, role: victim.role_tags?.[0] ?? 'PLATOON_LEADER' },
    text: `${victim.name} (${team.name}) was ${victim.condition.toLowerCase()}.` });
}
export function refreshCommands(state) {
  state.command_allowance = RULES.commandMin + Math.floor(random(state) * RULES.commandRange);
  if (!leaderActive(state)) state.command_allowance = Math.max(1, state.command_allowance - 1);
  state.command_capacity_by_faction[state.player_faction_id] = state.command_allowance + state.command_reserve;
  emit(state, 'COMMAND_CAPACITY_REFRESHED', { result: { allowance: state.command_allowance, reserve: state.command_reserve },
    text: `Turn ${state.turn}: ${state.command_allowance} new commands, ${state.command_reserve} held in reserve.` });
}
