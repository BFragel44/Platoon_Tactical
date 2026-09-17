import { capable, canSee, emit, fireStrength, isSpotted, ordered } from './rules.js';

export function eligibleFireLocations(state, source) {
  const knowledge = state.knowledge_by_faction[state.player_faction_id];
  if (source.faction_id === state.player_faction_id) {
    return [...new Set([
      ...Object.values(knowledge.known_enemy_teams_by_id).filter(k => k.status === 'SPOTTED').map(k => k.location_id),
      ...knowledge.known_fire_origins,
    ])].filter(id => canSee(state, source.location_id, id) && id !== source.location_id).sort();
  }
  return [...new Set(ordered(state.teams_by_id).filter(t => t.faction_id !== source.faction_id &&
    capable(state, t) && canSee(state, source.location_id, t.location_id)).map(t => t.location_id))].sort();
}
export function evaluateAutomaticFire(state, causeId = null) {
  for (const source of ordered(state.teams_by_id)) {
    const old = Object.values(state.fire_relationships_by_id).find(r => r.source_team_id === source.id && r.status === 'ACTIVE');
    const eligible = eligibleFireLocations(state, source);
    let target = source.fire_target_location_id;
    if (!eligible.includes(target)) target = eligible[0] ?? null;
    // Friendly troops entering a position mask supporting fire into that position.
    if (target && ordered(state.teams_by_id).some(t => t.faction_id === source.faction_id &&
      t.location_id === target && capable(state, t))) target = null;
    if (!capable(state, source) || state.status !== 'ACTIVE') target = null;
    source.fire_target_location_id = target;
    if (old && (old.target_location_id !== target || old.source_location_id !== source.location_id)) {
      old.status = 'CEASED';
      emit(state, 'FIRE_CEASED', { team: isSpotted(state, source.id) || source.faction_id === state.player_faction_id ? source : null,
        locationId: old.source_location_id, causeId, text: 'Fire from ' + state.locations_by_id[old.source_location_id].name + ' ceased or shifted.' });
    }
    if (!target) continue;
    if (!old || old.status !== 'ACTIVE') {
      const id = 'fire_' + state.next_runtime_id++;
      const event = emit(state, 'FIRE_OPENED', {
        team: source.faction_id === state.player_faction_id || isSpotted(state, source.id) ? source : null,
        locationId: source.location_id, causeId,
        result: { source_location_id: source.location_id, target_location_id: target },
        text: (source.faction_id === state.player_faction_id || isSpotted(state, source.id) ? source.name : 'Unidentified enemy') +
          ' is firing from ' + state.locations_by_id[source.location_id].name + ' into ' + state.locations_by_id[target].name + '.',
      });
      state.fire_relationships_by_id[id] = { id, source_team_id: source.id, source_location_id: source.location_id,
        target_location_id: target, status: 'ACTIVE', started_turn: state.turn, caused_by_event_id: event.id };
    }
    if (source.faction_id !== state.player_faction_id) {
      const knowledge = state.knowledge_by_faction[state.player_faction_id];
      if (!knowledge.known_fire_origins.includes(source.location_id)) {
        knowledge.known_fire_origins.push(source.location_id);
        if (!isSpotted(state, source.id)) emit(state, 'FIRE_ORIGIN_DETECTED', { locationId: source.location_id,
          text: 'Incoming fire reveals a suspected enemy position at ' + state.locations_by_id[source.location_id].name + '.' });
      }
    }
  }
}
export function incomingFire(state, team) {
  return ordered(state.fire_relationships_by_id).filter(r => r.status === 'ACTIVE' &&
    r.target_location_id === team.location_id && state.teams_by_id[r.source_team_id].faction_id !== team.faction_id);
}
export function pressureOn(state, team) {
  const relationships = incomingFire(state, team);
  const strength = relationships.reduce((sum, r) => sum + fireStrength(state, state.teams_by_id[r.source_team_id]), 0);
  if (!strength) return 0;
  const location = state.locations_by_id[team.location_id];
  const cover = team.occupied_cover_id ? location.cover_bonus : 0;
  const directions = new Set(relationships.map(r => r.source_location_id)).size;
  return Math.max(0, strength * 5 + (team.exposed ? 8 : 0) + (directions > 1 ? 8 : 0) -
    (location.protection + cover) * 6);
}
