import { capable, canSee, emit, isSpotted, ordered, random } from './rules.js';

export function revealTeam(state, target, causeId = null) {
  const knowledge = state.knowledge_by_faction[state.player_faction_id];
  if (isSpotted(state, target.id)) return;
  knowledge.known_enemy_teams_by_id[target.id] = { team_id: target.id, location_id: target.location_id,
    coarse_type: target.coarse_type, status: 'SPOTTED' };
  emit(state, 'UNIT_SPOTTED', { team: target, causeId, result: { status: 'SPOTTED' },
    text: target.name + ' spotted at ' + state.locations_by_id[target.location_id].name + '.' });
}
export function observe(state, observer = null, deliberate = false, causeId = null) {
  const friendlies = observer ? [observer] : ordered(state.teams_by_id).filter(t => t.faction_id === state.player_faction_id);
  for (const team of friendlies) {
    if (!capable(state, team)) continue;
    for (const target of ordered(state.teams_by_id)) {
      if (target.faction_id === team.faction_id || !capable(state, target) || isSpotted(state, target.id) || !canSee(state, team.location_id, target.location_id)) continue;
      const key = team.id + ':' + target.id;
      if (!deliberate && state.observation_attempts.includes(key)) continue;
      if (!deliberate) state.observation_attempts.push(key);
      const succeeds = random(state) < (deliberate ? 0.8 : 0.3);
      emit(state, 'SPOTTING_ATTEMPTED', { team, hidden: true, causeId, result: { target_id: target.id, succeeds, deliberate } });
      if (succeeds) revealTeam(state, target, causeId);
    }
  }
}
