import { describe,it,expect } from 'vitest';
import { fireStrength,casualty } from '../src/sim/rules.js';
import { evaluateAutomaticFire,pressureOn } from '../src/sim/fire.js';
import { resolveFireEffects } from '../src/sim/suppression.js';
import { training,relocate,order } from './missionFlow.js';
describe('location pressure and capability',()=>{
  function fight(){
    const state=training();relocate(state,'team_alpha','loc_crossroads');evaluateAutomaticFire(state);return state;
  }
  it('uses firing connections independently of movement links',()=>{
    const state=training();
    expect(state.locations_by_id.loc_lane.connected_location_ids).toContain('loc_farmyard');
    expect(state.locations_by_id.loc_lane.fire_location_ids).not.toContain('loc_farmyard');
  });
  it('incoming Location fire affects both occupants rather than one selected team',()=>{
    const state=fight();relocate(state,'team_bravo','loc_crossroads');
    expect(pressureOn(state,state.teams_by_id.team_alpha)).toBeGreaterThan(0);
    expect(pressureOn(state,state.teams_by_id.team_bravo)).toBe(pressureOn(state,state.teams_by_id.team_alpha));
  });
  it('terrain and cover reduce pressure while movement exposure increases it',()=>{
    const state=fight();const team=state.teams_by_id.team_alpha;
    const baseline=pressureOn(state,team);team.exposed=true;
    expect(pressureOn(state,team)).toBeGreaterThan(baseline);
    team.occupied_cover_id='cover';expect(pressureOn(state,team)).toBeLessThan(baseline);
  });
  it('suppression weakens outgoing fire and makes movement into its lane safer',()=>{
    const state=fight();const enemy=Object.values(state.teams_by_id).find(t=>t.faction_id==='enemy');
    const danger=pressureOn(state,state.teams_by_id.team_alpha);
    const power=fireStrength(state,enemy);enemy.suppression=65;
    expect(fireStrength(state,enemy)).toBeLessThan(power/2);
    expect(pressureOn(state,state.teams_by_id.team_alpha)).toBeLessThan(danger/2);
  });
  it('two firing directions increase pressure beyond one source',()=>{
    const state=fight();const enemy=Object.values(state.teams_by_id).find(t=>t.faction_id==='enemy');
    const pressure=pressureOn(state,enemy);relocate(state,'team_bravo','loc_farmyard');evaluateAutomaticFire(state);
    expect(pressureOn(state,enemy)).toBeGreaterThan(pressure*2);
  });
  it('fire persists without orders and stops when the source becomes incapable',()=>{
    const state=fight();const initial=Object.values(state.fire_relationships_by_id).filter(r=>r.status==='ACTIVE').length;
    evaluateAutomaticFire(state);
    expect(Object.values(state.fire_relationships_by_id).filter(r=>r.status==='ACTIVE')).toHaveLength(initial);
    state.teams_by_id.team_alpha.member_ids.forEach(id=>state.soldiers_by_id[id].condition='WOUNDED');
    evaluateAutomaticFire(state);
    expect(Object.values(state.fire_relationships_by_id).some(r=>r.status==='ACTIVE'&&r.source_team_id==='team_alpha')).toBe(false);
  });
  it('automatic-weapon casualties remove more fire capability than rifle casualties',()=>{
    const state=fight();const team=state.teams_by_id.team_alpha;
    const base=fireStrength(state,team);
    const automatic=team.member_ids.find(id=>state.soldiers_by_id[id].weapon_category==='LIGHT_AUTOMATIC_WEAPON');
    state.soldiers_by_id[automatic].condition='WOUNDED';
    expect(base-fireStrength(state,team)).toBe(2.5);
  });
  it('effects are deterministic and independent of map insertion order',()=>{
    const first=fight();const second=structuredClone(first);
    second.teams_by_id=Object.fromEntries(Object.entries(second.teams_by_id).reverse());
    second.fire_relationships_by_id=Object.fromEntries(Object.entries(second.fire_relationships_by_id).reverse());
    resolveFireEffects(first);resolveFireEffects(second);
    expect(first.events).toEqual(second.events);
    expect(first.teams_by_id).toEqual(second.teams_by_id);
  });
  it('friendly occupation masks supporting fire into the occupied location',()=>{
    const state=fight();relocate(state,'team_bravo','loc_stone_house');evaluateAutomaticFire(state);
    expect(Object.values(state.fire_relationships_by_id).some(r=>r.status==='ACTIVE'&&r.source_team_id==='team_alpha')).toBe(false);
  });
});
