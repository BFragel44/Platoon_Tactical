import { canSee, emit, ordered, random } from './rules.js';

export function generateEnemy(state, contact, packageId, causeId = null, triggeringLocation = null) {
  const template = state.enemy_force_packages_by_id[packageId];
  const placements = contact.placement_location_ids.filter(id => !triggeringLocation || canSee(state, id, triggeringLocation));
  if (!placements.length) throw new Error('Contact has no firing position overlooking its trigger');
  const locationId = placements.length === 1 ? placements[0] : placements[Math.floor(random(state) * placements.length)];
  const id = 'enemy_' + state.next_runtime_id++;
  const soldiers = template.soldiers.map((soldier, i) => ({ ...structuredClone(soldier),
    id: id + '_soldier_' + i, faction_id: template.faction_id, team_id: id, condition: 'EFFECTIVE' }));
  const team = { id, name: template.name, faction_id: template.faction_id,
    coarse_type: template.name, observation_experience: template.observation_experience,
    member_ids: soldiers.map(s => s.id), location_id: locationId, suppression: 0,
    tactical_state: 'EFFECTIVE', occupied_cover_id: null, actions_used: [], exposed: false,
    fire_target_location_id: triggeringLocation, directed_turn: null, withdrawn: false };
  state.teams_by_id[id] = team;
  soldiers.forEach(s => { state.soldiers_by_id[s.id] = s; });
  state.locations_by_id[locationId].occupant_team_ids.push(id);
  contact.generated_team_ids.push(id);
  emit(state, 'ENEMY_GENERATED', { team, hidden: true, causeId, result: { package_id: packageId } });
  return team;
}
export function resolvePendingContacts(state) {
  for (const contact of ordered(state.contacts_by_id)) {
    if (contact.resolution_status !== 'UNRESOLVED') continue;
    const entry = state.pending_observations.find(o => contact.trigger_location_ids.includes(o.location_id));
    if (!entry) continue;
    const event = emit(state, 'CONTACT_TRIGGERED', { locationId: entry.location_id, causeId: entry.caused_by_event_id,
      text: 'Checking reported enemy activity near ' + state.locations_by_id[entry.location_id].name + '.' });
    const profile = state.contact_generation_profiles_by_id[contact.generation_profile_id];
    let value = random(state) * profile.results.reduce((sum, r) => sum + r.weight, 0);
    const result = profile.results.find(r => (value -= r.weight) < 0) ?? profile.results.at(-1);
    if (result.package_id) generateEnemy(state, contact, result.package_id, event.id, entry.location_id);
    contact.resolution_status = 'RESOLVED'; contact.resolved_turn = state.turn;
    contact.resolution_result = result.result;
    state.knowledge_by_faction[state.player_faction_id].contact_knowledge_by_id[contact.id].status = 'RESOLVED';
    emit(state, 'CONTACT_RESOLVED', { locationId: entry.location_id, causeId: event.id,
      text: 'The contact check is complete. Continue observing; an enemy may remain unspotted.' });
  }
  state.pending_observations = [];
}
