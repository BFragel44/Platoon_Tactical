import { capable, emit, isSpotted, ordered, random, refreshCommands, RULES, setSuppression } from './rules.js';
import { evaluateAutomaticFire, eligibleFireLocations, incomingFire } from './fire.js';
import { resolvePendingContacts } from './contacts.js';
import { observe } from './spotting.js';
import { recoverSuppression, resolveFireEffects } from './suppression.js';
import { seekCover } from './commands.js';

function enemyActivity(state) {
  for (const team of ordered(state.teams_by_id)) {
    if (team.faction_id === state.player_faction_id || !capable(state, team)) continue;
    const hidden = !isSpotted(state, team.id);
    if (team.suppression >= 60) {
      if (random(state) < 0.6) setSuppression(state, team, team.suppression - 25, null, 'enemy rally');
      emit(state, 'ENEMY_ACTIVITY', { team, hidden, text: team.name + ' attempted to rally.' });
    } else if (incomingFire(state, team).length && !team.occupied_cover_id) {
      seekCover(state, team);
    } else {
      const incoming = incomingFire(state, team);
      const flank = incoming.find(r => r.source_location_id !== team.fire_target_location_id);
      const eligible = eligibleFireLocations(state, team);
      if (flank && eligible.includes(flank.source_location_id)) {
        team.fire_target_location_id = flank.source_location_id;
        emit(state, 'ENEMY_ACTIVITY', { team, hidden, text: team.name + ' shifted toward incoming fire.' });
      }
    }
  }
}
function finishMission(state, status, explanation) {
  if (state.status !== 'ACTIVE') return;
  state.status = status;
  emit(state, 'MISSION_ENDED', { result: { status }, text: explanation });
  evaluateAutomaticFire(state);
}
function objectives(state) {
  const friendlies = ordered(state.teams_by_id).filter(t => t.faction_id === state.player_faction_id && capable(state, t));
  if (!friendlies.length) { finishMission(state, 'DEFEAT', 'The platoon has no effective soldiers left.'); return; }
  const locationId = state.objective.location_id;
  const holding = friendlies.some(t => t.location_id === locationId && t.suppression < 30);
  const enemyPresent = ordered(state.teams_by_id).some(t => t.faction_id !== state.player_faction_id && t.location_id === locationId && capable(state, t));
  if (holding && !enemyPresent) {
    if (state.objective.held_since_turn === null) {
      state.objective.held_since_turn = state.turn;
      emit(state, 'OBJECTIVE_OCCUPIED', { locationId, text: 'Stone House occupied. Hold it through the next full turn.' });
    } else if (state.turn > state.objective.held_since_turn) {
      state.objective.secured = true;
      emit(state, 'OBJECTIVE_SECURED', { locationId, text: 'Stone House secured by the platoon.' });
      finishMission(state, 'SUCCESS', 'Mission complete: Stone House is secured.');
    }
  } else if (state.objective.held_since_turn !== null) {
    state.objective.held_since_turn = null;
    emit(state, 'OBJECTIVE_CONTESTED', { locationId, text: 'The position is no longer held by an effective team.' });
  }
  if (state.status === 'ACTIVE' && state.turn >= state.objective.turn_limit) finishMission(state, 'DEFEAT', 'The mission time limit expired before the position was secured.');
}
export function advancePhase(state) {
  if (state.status !== 'ACTIVE') return { state, events: [] };
  const next = structuredClone(state);
  if (next.phase === 'COMMAND') {
    next.phase = 'ENEMY_ACTIVITY';
    enemyActivity(next); evaluateAutomaticFire(next);
  } else if (next.phase === 'ENEMY_ACTIVITY') {
    next.phase = 'CONTACT_OBSERVATION';
    resolvePendingContacts(next); observe(next); evaluateAutomaticFire(next);
  } else if (next.phase === 'CONTACT_OBSERVATION') {
    next.phase = 'RECOVERY';
    recoverSuppression(next);
  } else if (next.phase === 'RECOVERY') {
    next.phase = 'EFFECTS';
    resolveFireEffects(next);
  } else if (next.phase === 'EFFECTS') {
    next.phase = 'CLEANUP';
    for (const team of ordered(next.teams_by_id)) {
      if (team.exposed) emit(next, 'EXPOSURE_ENDED', { team, hidden: team.faction_id !== next.player_faction_id && !isSpotted(next, team.id), text: '' });
      team.exposed = false; team.actions_used = [];
    }
    // Observed losses remove a confirmed position from the firing menu.
    const knowledge = next.knowledge_by_faction[next.player_faction_id];
    for (const info of Object.values(knowledge.known_enemy_teams_by_id)) {
      const enemy = next.teams_by_id[info.team_id];
      if (!capable(next, enemy)) {
        info.status = enemy.withdrawn ? 'WITHDRAWN' : 'INCAPACITATED';
        knowledge.known_fire_origins = knowledge.known_fire_origins.filter(id => id !== enemy.location_id);
      }
    }
    evaluateAutomaticFire(next);
    objectives(next);
    emit(next, 'TURN_ENDED', { result: { status: next.status }, text: 'Turn ' + next.turn + ' complete.' });
    if (next.status === 'ACTIVE') {
      next.command_reserve = Math.min(RULES.reserveMax, next.command_capacity_by_faction[next.player_faction_id]);
      next.turn++; next.phase = 'COMMAND'; next.observation_attempts = [];
      refreshCommands(next);
    }
  }
  return { state: next, events: next.events.slice(state.events.length) };
}
export function endTurn(state) {
  if (state.status !== 'ACTIVE') return { state, events: [] };
  const turn = state.turn;
  let next = state;
  do { next = advancePhase(next).state; } while (next.status === 'ACTIVE' && next.turn === turn);
  return { state: next, events: next.events.slice(state.events.length) };
}
export function abortMission(state) {
  if (state.status !== 'ACTIVE') return { state, events: [] };
  const next = structuredClone(state);
  finishMission(next, 'ABORTED', 'The commander aborted the mission. The position was not secured.');
  return { state: next, events: next.events.slice(state.events.length) };
}
