export const locationLayout = Object.freeze({
  loc_orchard_edge: { column: 1, row: 2 },
  loc_lane: { column: 2, row: 2 },
  loc_crossroads: { column: 3, row: 1 },
  loc_farmyard: { column: 3, row: 3 },
  loc_stone_house: { column: 4, row: 2 },
  loc_ridge: { column: 5, row: 2 },
});
export const orderLabels = {
  MOVE: 'Move', OBSERVE: 'Observe', DIRECT_FIRE: 'Direct fire', SEEK_COVER: 'Seek cover',
  RALLY: 'Rally', ASSAULT: 'Assault', TRANSFER_LEADER: 'Transfer leader',
};
export const orderHelp = {
  MOVE: 'Cross one movement link. Movement exposes the team until turn end.',
  OBSERVE: 'Look for hidden enemies in firing range; useful even while stationary.',
  DIRECT_FIRE: 'Choose a suspected or spotted position. Fire continues automatically; this turn gains concentrated fire.',
  SEEK_COVER: 'Find and occupy additional protection. Ordinary terrain always protects you.',
  RALLY: 'Reduce suppression. Nearby leadership improves the attempt.',
  ASSAULT: 'Close with an adjacent hostile position. Support fire and a suppressed defender improve your chances.',
  TRANSFER_LEADER: 'Move the platoon leader to another team at this Location.',
};
export function getMoveDestinations(view, teamId) {
  return (view.command_options_by_team[teamId]?.MOVE.target_location_ids ?? [])
    .map(id => view.locations.find(location => location.id === id));
}
export function getProjectedTeamLocation(view, teamId) { return view.teams.find(t => t.id === teamId)?.location_id ?? null; }
export function formatVisibleEvent(event) { return event.metadata?.text ?? ''; }
export function turnSummary(events, turn) {
  return events.filter(e => e.turn === turn && ['UNIT_MOVED', 'FIRE_OPENED','UNIT_SPOTTED',
    'UNIT_PINNED','UNIT_RECOVERED','UNIT_RALLIED','SOLDIER_WOUNDED','SOLDIER_KILLED',
    'ASSAULT_RESOLVED','OBJECTIVE_OCCUPIED','OBJECTIVE_SECURED','MISSION_ENDED'].includes(e.type))
    .map(formatVisibleEvent).filter(Boolean);
}
