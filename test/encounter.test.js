import { describe,it,expect } from 'vitest';
import { createMission,advancePhase,endTurn,abortMission,getAfterActionReport,getVisibleEvents } from '../src/sim/index.js';
import { training,relocate,order } from './missionFlow.js';
import { evaluateAutomaticFire } from '../src/sim/fire.js';
import { m0TestScenario } from '../src/scenarios/m0TestScenario.js';
describe('complete encounter',()=>{
  it('diagnostic steps match End Turn exactly',()=>{
    const state=training();let stepped=state;
    do{stepped=advancePhase(stepped).state;}while(stepped.turn===state.turn&&stepped.status==='ACTIVE');
    expect(stepped).toEqual(endTurn(state).state);
  });
  it('same seed and orders reproduce state and ordered events',()=>{
    function run(){let state=training('replay');for(let t=0;t<5;t++){
      if(t===0)state=order(state,'MOVE','team_alpha','loc_lane').state;
      if(t===1)state=order(state,'MOVE','team_alpha','loc_crossroads').state;
      state=endTurn(state).state;}return state;}
    expect(run()).toEqual(run());
  });
  it('requires occupation through a full subsequent turn',()=>{
    const scenario=structuredClone(m0TestScenario);scenario.contacts=[];
    let state=createMission(scenario,'hold');relocate(state,'team_alpha','loc_stone_house');
    state=endTurn(state).state;expect(state.status).toBe('ACTIVE');expect(state.objective.held_since_turn).toBe(1);
    state=endTurn(state).state;expect(state.status).toBe('SUCCESS');
    expect(endTurn(state).state).toBe(state);
  });
  it('moving the last holder out interrupts holding progress',()=>{
    const scenario=structuredClone(m0TestScenario);scenario.contacts=[];
    let state=createMission(scenario,'hold');relocate(state,'team_alpha','loc_stone_house');
    state=endTurn(state).state;state=order(state,'MOVE','team_alpha','loc_farmyard').state;
    expect(state.objective.held_since_turn).toBe(null);
  });
  it('abort yields an event-derived historical report and stops commands',()=>{
    const state=abortMission(training()).state;const report=getAfterActionReport(state);
    expect(state.status).toBe('ABORTED');expect(report.events).toEqual(getVisibleEvents(state,'friendly'));
    expect(report.objectives.at(-1).type).toBe('MISSION_ENDED');
    expect(order(state,'MOVE','team_alpha','loc_lane').reason).toBe('MISSION_ENDED');
  });
  it('incapacitated platoon and time limit produce defeat',()=>{
    let state=training();Object.values(state.soldiers_by_id).filter(s=>s.faction_id==='friendly').forEach(s=>s.condition='WOUNDED');
    expect(endTurn(state).state.status).toBe('DEFEAT');
    state=training();state.turn=24;expect(endTurn(state).state.status).toBe('DEFEAT');
  });
  it('support and suppression improve assault outcomes across fixed seeds',()=>{
    let unsupported=0,supported=0;
    for(let i=0;i<60;i++){
      for(const support of [false,true]){
        const state=training('assault-'+i);state.command_capacity_by_faction.friendly=6;
        relocate(state,'team_alpha','loc_farmyard');
        if(support){relocate(state,'team_bravo','loc_crossroads');const enemy=Object.values(state.teams_by_id).find(t=>t.faction_id==='enemy');enemy.suppression=65;}
        evaluateAutomaticFire(state);
        const result=order(state,'ASSAULT','team_alpha','loc_stone_house');
        expect(result.accepted).toBe(true);
        const won=result.events.find(e=>e.type==='ASSAULT_RESOLVED').result.success;
        if(won){if(support)supported++;else unsupported++;}
      }
    }
    expect(supported).toBeGreaterThan(unsupported+10);
  });
});
