import { describe,it,expect } from 'vitest';
import { endTurn,getPlayerView } from '../src/sim/index.js';
import { order,training,relocate } from './missionFlow.js';
describe('immediate commands and leadership',()=>{
  it('moves immediately and records causal completion without mutating input',()=>{
    const state=training();const before=structuredClone(state);
    const result=order(state,'MOVE','team_alpha','loc_lane');
    expect(result.accepted).toBe(true);
    expect(result.state.teams_by_id.team_alpha.location_id).toBe('loc_lane');
    expect(result.state.leader.team_id).toBe('team_alpha');
    expect(result.events.some(e=>e.type==='COMMAND_COMPLETED')).toBe(true);
    expect(result.events.find(e=>e.type==='UNIT_MOVED').caused_by_event_id).toBe(result.events[0].id);
    expect(state).toEqual(before);
  });
  it('rejects a second move without spending capacity or drawing randomness',()=>{
    const state=order(training(),'MOVE','team_alpha','loc_lane').state;
    const result=order(state,'MOVE','team_alpha','loc_farmyard');
    expect(result.reason).toBe('MOVE_LIMIT_REACHED');expect(result.state).toBe(state);expect(result.events).toEqual([]);
  });
  it('rejects invalid targets, unknown orders and foreign faction control',()=>{
    const state=training();
    expect(order(state,'MOVE','team_alpha','loc_ridge').accepted).toBe(false);
    expect(order(state,'HACK').reason).toBe('UNKNOWN_COMMAND_TYPE');
    expect(order(state,'MOVE','enemy_1','loc_crossroads').accepted).toBe(false);
  });
  it('pinned teams can rally and seek cover but cannot move or assault',()=>{
    const state=training();state.teams_by_id.team_alpha.suppression=70;state.teams_by_id.team_alpha.tactical_state='PINNED';
    const view=getPlayerView(state,'friendly');
    expect(view.command_options_by_team.team_alpha.MOVE.unavailable_reason).toBe('TEAM_PINNED');
    expect(view.command_options_by_team.team_alpha.RALLY.available).toBe(true);
    const result=order(state,'RALLY');expect(result.state.teams_by_id.team_alpha.suppression).toBe(30);
    expect(order(result.state,'RALLY').reason).toBe('ACTION_LIMIT_REACHED');
  });
  it('transfers the leader only between co-located teams and changes command cost with distance',()=>{
    const state=training();
    relocate(state,'team_bravo','loc_stone_house');
    expect(order(state,'TRANSFER_LEADER','team_alpha','team_bravo').accepted).toBe(false);
    expect(getPlayerView(state,'friendly').command_options_by_team.team_bravo.OBSERVE.cost).toBe(2);
    relocate(state,'team_bravo','loc_orchard_edge');
    const moved=order(state,'TRANSFER_LEADER','team_alpha','team_bravo');
    expect(moved.state.leader.team_id).toBe('team_bravo');
    expect(order(moved.state,'TRANSFER_LEADER','team_bravo','team_alpha').accepted).toBe(false);
  });
  it('draws 2–4 commands and carries at most two unused commands',()=>{
    let state=training();
    for(let i=0;i<10;i++){
      state=endTurn(state).state;
      expect(state.command_reserve).toBe(2);
      expect(state.command_allowance).toBeGreaterThanOrEqual(2);
      expect(state.command_allowance).toBeLessThanOrEqual(4);
      expect(state.command_capacity_by_faction.friendly).toBe(state.command_allowance+2);
    }
  });
  it('leadership loss reduces allowance and raises remote command costs',()=>{
    let state=training();state.leader.condition='WOUNDED';
    state=endTurn(state).state;
    expect(state.command_allowance).toBeLessThanOrEqual(3);
    expect(getPlayerView(state,'friendly').command_options_by_team.team_alpha.MOVE.cost).toBe(2);
  });
  it('known hostile positions require an assault instead of a normal move',()=>{
    const state=training();relocate(state,'team_alpha','loc_farmyard');
    expect(order(state,'MOVE','team_alpha','loc_stone_house').accepted).toBe(false);
    expect(getPlayerView(state,'friendly').command_options_by_team.team_alpha.ASSAULT.target_ids).toContain('loc_stone_house');
  });
});
