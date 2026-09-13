export function getVisibleEvents(state, factionId, afterSequence = 0) {
  return state.events.filter(
    (event) =>
      event.sequence > afterSequence &&
      event.visibility?.simulation_only !== true &&
      event.visibility?.faction_ids?.includes(factionId),
  );
}

export function getPlayerView(state, factionId) {
  const knowledge = state.knowledge_by_faction[factionId];
  if (!knowledge) {
    throw new TypeError(`Unknown faction: ${factionId}`);
  }

  const friendlyTeams = Object.values(state.teams_by_id).filter(
    (team) => team.faction_id === factionId,
  );
  const friendlyTeamIds = new Set(friendlyTeams.map((team) => team.id));

  return {
    mission_id: state.id,
    status: state.status,
    turn: state.turn,
    phase: state.phase,
    command_capacity: state.command_capacity_by_faction[factionId],
    locations: Object.values(state.locations_by_id).map((location) => ({
      id: location.id,
      name: location.name,
      connected_location_ids: [...location.connected_location_ids],
      occupant_team_ids: location.occupant_team_ids.filter((teamId) =>
        friendlyTeamIds.has(teamId),
      ),
    })),
    teams: friendlyTeams.map((team) => structuredClone(team)),
    soldiers: Object.values(state.soldiers_by_id)
      .filter((soldier) => soldier.faction_id === factionId)
      .map((soldier) => structuredClone(soldier)),
    potential_contacts: Object.entries(knowledge.contact_knowledge_by_id).map(
      ([contactId, contact]) => ({
        id: contactId,
        location_id: contact.location_id,
        status: contact.status,
      }),
    ),
  };
}
