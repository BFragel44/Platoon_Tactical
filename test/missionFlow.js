import { createMission, submitCommand, endTurn } from '../src/sim/index.js';
import { knownDefenderScenario, m0TestScenario } from '../src/scenarios/m0TestScenario.js';
export const training = (seed='spot-3') => createMission(knownDefenderScenario,seed);
export const uncertain = (seed='spot-3') => createMission(m0TestScenario,seed);
export function order(state,type,team='team_alpha',target=null) {
  return submitCommand(state,{type,faction_id:'friendly',team_id:team,
    target:target ? type==='TRANSFER_LEADER' ? {team_id:target} : {location_id:target} : null});
}
export function relocate(state,id,location) {
  const team=state.teams_by_id[id];
  state.locations_by_id[team.location_id].occupant_team_ids=state.locations_by_id[team.location_id].occupant_team_ids.filter(t=>t!==id);
  team.location_id=location;
  state.locations_by_id[location].occupant_team_ids.push(id);
}
export function approach(seed='spot-3') {
  let state=training(seed);
  state=order(state,'MOVE','team_alpha','loc_lane').state;
  state=order(state,'MOVE','team_bravo','loc_lane').state;
  state=endTurn(state).state;
  return state;
}
