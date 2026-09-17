import { describe,it,expect } from 'vitest';
import { getPlayerView } from '../src/sim/index.js';
import { formatVisibleEvent,getMoveDestinations,getProjectedTeamLocation,turnSummary } from '../src/ui/viewModel.js';
import { training,order } from './missionFlow.js';
describe('tactical presentation',()=>{
  it('shows the actual immediate location and explains exhausted movement',()=>{
    const state=order(training(),'MOVE','team_alpha','loc_lane').state;const view=getPlayerView(state,'friendly');
    expect(getProjectedTeamLocation(view,'team_alpha')).toBe('loc_lane');
    expect(getMoveDestinations(view,'team_alpha').map(l=>l.id)).toContain('loc_farmyard');
    expect(view.command_options_by_team.team_alpha.MOVE.available).toBe(false);
    expect(view.command_options_by_team.team_alpha.MOVE.explanation).toContain('already moved');
  });
  it('formats plain-language reports and summaries without raw IDs',()=>{
    const result=order(training(),'MOVE','team_alpha','loc_lane');
    const movement=result.events.find(e=>e.type==='UNIT_MOVED');
    expect(formatVisibleEvent(movement)).toBe('Alpha Team moved from Orchard Edge to Sunken Lane.');
    expect(turnSummary(result.events,1)).toContain(formatVisibleEvent(movement));
  });
});
