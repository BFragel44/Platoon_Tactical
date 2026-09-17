import { describe,it,expect } from 'vitest';
import { training,relocate } from './missionFlow.js';
import { observe } from '../src/sim/spotting.js';
import { getPlayerView,getVisibleEvents } from '../src/sim/index.js';
describe('observation and projection',()=>{
  it('stationary teams can spot without moving, and passive attempts are limited per turn',()=>{
    const state=training();state.knowledge_by_faction.friendly.known_enemy_teams_by_id={};
    relocate(state,'team_alpha','loc_crossroads');observe(state);
    const after=state.rng.draw_count;observe(state);expect(state.rng.draw_count).toBe(after);
    for(let turn=0;turn<12&&!Object.keys(state.knowledge_by_faction.friendly.known_enemy_teams_by_id).length;turn++){
      state.observation_attempts=[];observe(state);
    }
    expect(getPlayerView(state,'friendly').spotted_enemies).toHaveLength(1);
  });
  it('view and event reads consume no RNG and cannot mutate authoritative state',()=>{
    const state=training();const before=structuredClone(state);
    const view=getPlayerView(state,'friendly');const events=getVisibleEvents(state,'friendly');
    view.teams[0].suppression=999;events[0].metadata.text='tampered';
    expect(state).toEqual(before);
  });
  it('hidden enemy cover is absent from player data',()=>{
    const state=training();state.locations_by_id.loc_stone_house.cover_features=[{id:'hidden_cover',protection:2}];
    expect(JSON.stringify(getPlayerView(state,'friendly'))).not.toContain('hidden_cover');
  });
});
