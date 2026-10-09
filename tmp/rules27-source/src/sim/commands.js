import { activeMembers, capable, casualty, emit, inCommand, isSpotted, leaderActive,
  ordered, random, RULES, setSuppression } from './rules.js';
import { eligibleFireLocations, evaluateAutomaticFire, incomingFire, pressureOn } from './fire.js';
import { observe, revealTeam } from './spotting.js';

export const COMMANDS = ['MOVE', 'OBSERVE', 'DIRECT_FIRE', 'SEEK_COVER', 'RALLY', 'ASSAULT', 'TRANSFER_LEADER'];
export const rejectionText = {
  MISSION_ENDED: 'The mission has ended.', NOT_COMMAND_PHASE: 'Finish turn resolution first.',
  UNKNOWN_COMMAND_TYPE: 'Unknown order.', UNKNOWN_TEAM: 'Select a friendly team.',
  NOT_ACTIVE_FACTION: 'You can only command your own teams.', TEAM_INCAPABLE: 'No effective soldiers remain.',
  TEAM_PINNED: 'Pinned: rally or recover before moving.', ACTION_LIMIT_REACHED: 'Already attempted this order this turn.',
  MOVE_LIMIT_REACHED: 'This team has already moved this turn.', INSUFFICIENT_COMMAND_CAPACITY: 'Not enough commands.',
  INVALID_TARGET: 'Choose an available destination or target.', LOCATION_NOT_CONNECTED: 'No movement connection.',
  NO_NEED_TO_RALLY: 'This team is already effective.', ALREADY_IN_COVER: 'This team already occupies discovered cover.',
  LEADER_UNAVAILABLE: 'The platoon leader is unavailable.', NO_COLOCATED_TEAM: 'The leader can transfer only between teams together.',
  LEADER_NOT_ATTACHED: 'Select the team carrying the platoon leader to transfer them.',
  NO_HOSTILE_POSITION: 'No known hostile position in range. Observe or move to establish contact.',
};
export function commandCost(state, team, type) { return (type === 'ASSAULT' ? 2 : 1) + (inCommand(state, team) ? 0 : 1); }
function basicRejection(state, team, type) {
  if (state.status !== 'ACTIVE') return 'MISSION_ENDED';
  if (state.phase !== 'COMMAND') return 'NOT_COMMAND_PHASE';
  if (!COMMANDS.includes(type)) return 'UNKNOWN_COMMAND_TYPE';
  if (!team || team.faction_id !== state.player_faction_id) return 'UNKNOWN_TEAM';
  if (!capable(state, team)) return 'TEAM_INCAPABLE';
  if (['MOVE', 'ASSAULT'].includes(type) && team.suppression >= 60) return 'TEAM_PINNED';
  if (['MOVE', 'ASSAULT'].includes(type) && team.actions_used.includes('MOVEMENT')) return 'MOVE_LIMIT_REACHED';
  if (team.actions_used.includes(type)) return 'ACTION_LIMIT_REACHED';
  if (type === 'RALLY' && team.suppression === 0) return 'NO_NEED_TO_RALLY';
  if (type === 'SEEK_COVER' && team.occupied_cover_id) return 'ALREADY_IN_COVER';
  if (type === 'TRANSFER_LEADER' && (!leaderActive(state) || state.leader.transferred_turn === state.turn)) return 'LEADER_UNAVAILABLE';
  if (type === 'TRANSFER_LEADER' && state.leader.team_id !== team.id) return 'LEADER_NOT_ATTACHED';
  if (state.command_capacity_by_faction[state.player_faction_id] < commandCost(state, team, type)) return 'INSUFFICIENT_COMMAND_CAPACITY';
  return null;
}
export function commandOptions(state, team) {
  const location = state.locations_by_id[team.location_id];
  const hostile = eligibleFireLocations(state, team);
  return Object.fromEntries(COMMANDS.map(type => {
    let targets = [];
    if (type === 'MOVE') targets = location.connected_location_ids.filter(id => !Object.values(
      state.knowledge_by_faction[state.player_faction_id].known_enemy_teams_by_id).some(k => k.location_id === id && k.status === 'SPOTTED'));
    if (type === 'ASSAULT') targets = location.connected_location_ids.filter(id => hostile.includes(id));
    if (type === 'DIRECT_FIRE') targets = hostile;
    if (type === 'TRANSFER_LEADER') targets = ordered(state.teams_by_id).filter(t =>
      t.id !== team.id && t.faction_id === team.faction_id && t.location_id === team.location_id && capable(state, t)).map(t => t.id);
    let reason = basicRejection(state, team, type);
    if (!reason && ['MOVE','ASSAULT','DIRECT_FIRE','TRANSFER_LEADER'].includes(type) && !targets.length) reason = type === 'TRANSFER_LEADER' ? 'NO_COLOCATED_TEAM' : type === 'MOVE' ? 'INVALID_TARGET' : 'NO_HOSTILE_POSITION';
    return [type, { type, cost: commandCost(state, team, type), available: !reason,
      unavailable_reason: reason, explanation: reason ? rejectionText[reason] : '',
      target_ids: [...targets], target_location_ids: type === 'TRANSFER_LEADER' ? [] : [...targets] }];
  }));
}
export function moveTeam(state, team, destination, causeId, { exposed = true } = {}) {
  const origin = team.location_id;
  state.locations_by_id[origin].occupant_team_ids = state.locations_by_id[origin].occupant_team_ids.filter(id => id !== team.id);
  state.locations_by_id[destination].occupant_team_ids.push(team.id);
  team.location_id = destination; team.occupied_cover_id = null; team.exposed = exposed;
  const event = emit(state, 'UNIT_MOVED', { team, causeId, hidden: team.faction_id !== state.player_faction_id && !isSpotted(state, team.id),
    result: { from_location_id: origin, to_location_id: destination },
    text: team.name + ' moved from ' + state.locations_by_id[origin].name + ' to ' + state.locations_by_id[destination].name + '.' });
  if (exposed) emit(state, 'UNIT_EXPOSED', { team, causeId: event.id, text: team.name + ' is exposed until the end of this turn.' });
  if (team.faction_id === state.player_faction_id) state.pending_observations.push({ team_id: team.id, location_id: destination, caused_by_event_id: event.id });
  if (state.objective.held_since_turn !== null && !ordered(state.teams_by_id).some(t => t.faction_id === state.player_faction_id &&
      capable(state, t) && t.suppression < 30 && t.location_id === state.objective.location_id)) {
    state.objective.held_since_turn = null;
    emit(state, 'OBJECTIVE_CONTESTED', { locationId: state.objective.location_id, causeId: event.id,
      text: 'The last effective team left the objective. Holding progress has been lost.' });
  }
  return event;
}
export function seekCover(state, team, causeId = null) {
  const location = state.locations_by_id[team.location_id];
  let cover = location.cover_features[0];
  const hidden = team.faction_id !== state.player_faction_id && !isSpotted(state, team.id);
  emit(state, 'COVER_SEARCHED', { team, causeId, hidden, text: team.name + ' searched for stronger protection.' });
  if (!cover && random(state) < location.cover_chance) {
    cover = { id: 'cover_' + location.id, name: 'Sheltered position', protection: location.cover_bonus };
    location.cover_features.push(cover);
    emit(state, 'COVER_FOUND', { team, causeId, hidden, result: { cover_id: cover.id }, text: team.name + ' found a sheltered position.' });
  }
  if (cover) {
    team.occupied_cover_id = cover.id;
    if (team.faction_id === state.player_faction_id) {
      const ids = state.knowledge_by_faction[state.player_faction_id].discovered_cover_ids;
      if (!ids.includes(cover.id)) ids.push(cover.id);
    }
    emit(state, 'UNIT_ENTERED_COVER', { team, causeId, hidden, result: { cover_id: cover.id }, text: team.name + ' took additional cover.' });
    return true;
  }
  emit(state, 'COVER_SEARCH_FAILED', { team, causeId, hidden, text: team.name + ' found no additional cover; ordinary terrain still protects them.' });
  return false;
}
function assault(state, team, locationId, causeId) {
  const defenders = ordered(state.teams_by_id).filter(t => t.faction_id !== team.faction_id && t.location_id === locationId && capable(state, t));
  if (!defenders.length) { moveTeam(state, team, locationId, causeId); return true; }
  defenders.forEach(t => revealTeam(state, t, causeId));
  const defender = defenders[0];
  const support = incomingFire(state, defender).filter(r => r.source_team_id !== team.id).length;
  const attack = activeMembers(state, team).length;
  const defense = defenders.reduce((sum, t) => sum + activeMembers(state, t).length, 0);
  const grenadier = activeMembers(state, team).some(s => s.weapon_category === 'RIFLE_GRENADE_LAUNCHER');
  const chance = Math.max(0.1, Math.min(0.9, 0.35 + (attack-defense)*0.06 + defender.suppression*0.006 +
    Math.min(2, support)*0.12 + (grenadier ? 0.08 : 0) - (team.suppression >= 30 ? 0.2 : 0) -
    (defender.occupied_cover_id ? 0.1 : 0)));
  const success = random(state) < chance;
  const event = emit(state, 'ASSAULT_RESOLVED', { team, locationId, causeId, result: { success, supporting_teams: support },
    text: team.name + (success ? ' drove the defenders from ' : ' was repelled at ') + state.locations_by_id[locationId].name + '.' });
  if (success) {
    casualty(state, defender, event.id);
    for (const target of defenders) {
      target.withdrawn = true;
      state.locations_by_id[locationId].occupant_team_ids = state.locations_by_id[locationId].occupant_team_ids.filter(id => id !== target.id);
      state.knowledge_by_faction[state.player_faction_id].known_enemy_teams_by_id[target.id].status = 'WITHDRAWN';
      emit(state, 'UNIT_WITHDREW', { team: target, causeId: event.id, text: target.name + ' withdrew from the encounter.' });
    }
    state.knowledge_by_faction[state.player_faction_id].known_fire_origins =
      state.knowledge_by_faction[state.player_faction_id].known_fire_origins.filter(id => id !== locationId);
    moveTeam(state, team, locationId, event.id);
  } else {
    setSuppression(state, team, team.suppression + 30, event.id, 'assault repelled');
    if (random(state) < 0.3) casualty(state, team, event.id);
  }
  return success;
}
export function submitCommand(state, input) {
  const team = state.teams_by_id[input?.team_id];
  const type = input?.type;
  let reason = basicRejection(state, team, type);
  if (!reason && input.faction_id !== state.player_faction_id) reason = 'NOT_ACTIVE_FACTION';
  const option = !reason ? commandOptions(state, team)[type] : null;
  if (!reason && !option.available) reason = option.unavailable_reason;
  const targetId = input?.target?.location_id ?? input?.target?.team_id;
  if (!reason && ['MOVE','ASSAULT','DIRECT_FIRE','TRANSFER_LEADER'].includes(type) && !option.target_ids.includes(targetId)) reason = 'INVALID_TARGET';
  if (reason) return { state, events: [], accepted: false, reason };
  const next = structuredClone(state);
  const unit = next.teams_by_id[team.id];
  const id = 'cmd_' + next.next_runtime_id++;
  const command = { id, type, team_id: team.id, faction_id: input.faction_id, target: structuredClone(input.target ?? null),
    cost: option.cost, issued_turn: state.turn, status: 'RESOLVED' };
  next.commands_by_id[id] = command;
  next.command_capacity_by_faction[next.player_faction_id] -= option.cost;
  unit.actions_used.push(type);
  if (['MOVE','ASSAULT'].includes(type)) unit.actions_used.push('MOVEMENT');
  const event = emit(next, 'COMMAND_ISSUED', { team: unit, result: { command_id: id, command_type: type, cost: option.cost },
    text: unit.name + ': ' + type.toLowerCase().replaceAll('_', ' ') + ' (' + option.cost + ' command' + (option.cost > 1 ? 's' : '') + ').' });
  let success = true;
  if (type === 'MOVE') {
    const blockers = ordered(next.teams_by_id).filter(t => t.faction_id !== unit.faction_id && t.location_id === targetId && capable(next, t));
    if (blockers.length) {
      blockers.forEach(t => revealTeam(next, t, event.id));
      unit.exposed = true; success = false;
      emit(next, 'MOVEMENT_HALTED', { team: unit, causeId: event.id,
        text: unit.name + ' halted on discovering an occupied enemy position. Suppress it, then assault.' });
    } else moveTeam(next, unit, targetId, event.id);
  }
  if (type === 'OBSERVE') observe(next, unit, true, event.id);
  if (type === 'DIRECT_FIRE') { unit.fire_target_location_id = targetId; unit.directed_turn = next.turn;
    emit(next, 'FIRE_DIRECTED', { team: unit, causeId: event.id, result: { target_location_id: targetId },
      text: unit.name + ' concentrates fire on ' + next.locations_by_id[targetId].name + ' this turn.' }); }
  if (type === 'SEEK_COVER') success = seekCover(next, unit, event.id);
  if (type === 'RALLY') {
    const hasTeamLeader = activeMembers(next, unit).some(s => s.role_tags?.includes('TEAM_LEADER'));
    success = pressureOn(next, unit) < 5 || random(next) < RULES.rallyChance + (inCommand(next, unit) ? RULES.leaderBonus : 0) - (hasTeamLeader ? 0 : 0.2);
    if (success) setSuppression(next, unit, unit.suppression - RULES.rallyReduction, event.id, 'rallied by leadership');
    emit(next, success ? 'UNIT_RALLIED' : 'RALLY_FAILED', { team: unit, causeId: event.id, text: unit.name + (success ? ' rallied.' : ' could not rally under fire.') });
  }
  if (type === 'ASSAULT') success = assault(next, unit, targetId, event.id);
  if (type === 'TRANSFER_LEADER') {
    next.leader.team_id = targetId; next.leader.transferred_turn = next.turn;
    emit(next, 'LEADER_TRANSFERRED', { team: next.teams_by_id[targetId], causeId: event.id,
      result: { from_team_id: unit.id, to_team_id: targetId }, text: next.leader.name + ' joined ' + next.teams_by_id[targetId].name + '.' });
  }
  command.status = success ? 'RESOLVED' : 'FAILED';
  emit(next, success ? 'COMMAND_COMPLETED' : 'COMMAND_FAILED', { team: unit, causeId: event.id,
    result: { command_id: id, success }, text: '' });
  if (type !== 'OBSERVE') observe(next, unit, false, event.id);
  evaluateAutomaticFire(next, event.id);
  return { state: next, events: next.events.slice(state.events.length), accepted: true, reason: null };
}
