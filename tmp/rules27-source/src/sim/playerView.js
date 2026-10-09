import { activeMembers, capable, fireStrength, inCommand, ordered } from './rules.js';
import { commandOptions } from './commands.js';
import { incomingFire, pressureOn } from './fire.js';

export function getVisibleEvents(state, factionId, afterSequence = 0) {
  if (!state.knowledge_by_faction[factionId]) throw new TypeError('Unknown faction: ' + factionId);
  const visible = state.events.filter(e => !e.visibility.simulation_only && e.visibility.faction_ids.includes(factionId));
  const ids = new Set(visible.map(e => e.id));
  // Never expose a hidden event through an otherwise visible causal link.
  return visible.filter(e => e.sequence > afterSequence).map(event => ({
    ...structuredClone(event), caused_by_event_id: ids.has(event.caused_by_event_id) ? event.caused_by_event_id : null,
  }));
}
export function getPlayerView(state, factionId) {
  if (factionId !== state.player_faction_id) throw new TypeError('Player view is only available for the player faction');
  const knowledge = state.knowledge_by_faction[factionId];
  const friendlies = ordered(state.teams_by_id).filter(t => t.faction_id === factionId);
  const knownIds = new Set([...friendlies.map(t => t.id), ...Object.keys(knowledge.known_enemy_teams_by_id)]);
  const teams = friendlies.map(team => ({
    id: team.id, name: team.name, location_id: team.location_id, member_ids: [...team.member_ids],
    suppression: team.suppression, tactical_state: capable(state, team) ? team.tactical_state : 'INCAPACITATED',
    effective_personnel: activeMembers(state, team).length, occupied_cover_id: team.occupied_cover_id,
    exposed: team.exposed, in_command: inCommand(state, team), fire_strength: fireStrength(state, team),
    fire_target_location_id: team.fire_target_location_id,
    incoming_fire: incomingFire(state, team).map(r => ({ source_location_id: r.source_location_id })),
    danger: pressureOn(state, team) >= 25 ? 'Heavy' : pressureOn(state, team) >= 5 ? 'Under fire' : 'Protected',
  }));
  const locations = ordered(state.locations_by_id).map(location => ({
    id: location.id, name: location.name, connected_location_ids: [...location.connected_location_ids],
    fire_location_ids: [...location.fire_location_ids], protection: location.protection,
    description: location.description, cover_chance: location.cover_chance,
    cover_features: location.cover_features.filter(c => knowledge.discovered_cover_ids.includes(c.id)).map(c => structuredClone(c)),
    occupant_team_ids: friendlies.filter(t => t.location_id === location.id).map(t => t.id),
  }));
  return {
    mission_id: state.id, status: state.status, turn: state.turn, phase: state.phase, briefing: state.briefing,
    objective: structuredClone(state.objective), leader: structuredClone(state.leader),
    command_capacity: state.command_capacity_by_faction[factionId], command_allowance: state.command_allowance,
    command_reserve: state.command_reserve,
    command_options_by_team: Object.fromEntries(friendlies.map(t => [t.id, commandOptions(state, t)])),
    teams, locations, soldiers: ordered(state.soldiers_by_id).filter(s => s.faction_id === factionId).map(s => structuredClone(s)),
    potential_contacts: Object.entries(knowledge.contact_knowledge_by_id).map(([id, info]) => ({ id, ...structuredClone(info) })),
    spotted_enemies: Object.values(knowledge.known_enemy_teams_by_id).map(info => ({
      id: info.team_id, location_id: info.location_id, coarse_type: info.coarse_type, status: info.status,
      tactical_state: state.teams_by_id[info.team_id].tactical_state,
    })),
    suspected_locations: knowledge.known_fire_origins.filter(id => !Object.values(knowledge.known_enemy_teams_by_id).some(k => k.location_id === id && k.status === 'SPOTTED')),
    fire_relationships: ordered(state.fire_relationships_by_id).filter(r => r.status === 'ACTIVE').map(r => ({
      source_location_id: r.source_location_id, target_location_id: r.target_location_id,
      source_team_id: knownIds.has(r.source_team_id) ? r.source_team_id : null,
      friendly: state.teams_by_id[r.source_team_id].faction_id === factionId,
    })),
  };
}
export function getAfterActionReport(state, factionId = state.player_faction_id) {
  if (state.status === 'ACTIVE') return null;
  const events = getVisibleEvents(state, factionId);
  return { outcome: state.status, turns: state.turn, events,
    orders: events.filter(e => e.type === 'COMMAND_ISSUED'),
    casualties: events.filter(e => ['SOLDIER_WOUNDED','SOLDIER_KILLED'].includes(e.type)),
    friendly_casualties: events.filter(e => ['SOLDIER_WOUNDED','SOLDIER_KILLED'].includes(e.type) &&
      state.teams_by_id[e.actor?.id]?.faction_id === factionId),
    objectives: events.filter(e => e.type.startsWith('OBJECTIVE_') || e.type === 'MISSION_ENDED') };
}
