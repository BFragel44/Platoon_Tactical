import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {previewMissionSetup} from '../src/sim/company/engine.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {phoneConnected,layPhoneLine} from '../src/sim/company/phoneNetwork.js';
import {communication,communicationReason} from '../src/sim/company/battlefield.js';

describe('Normandy field-phone network',()=>{
 it('validates the four-line allocation and changes only the CO net',()=>{
  expect(()=>materializeScenario(trevieres,'phone',{command_network:'phones',phone_lines:{co:3}})).toThrow('four phone lines');
  expect(()=>materializeScenario(trevieres,'phone',{command_network:'radio',phone_lines:{co:4}})).toThrow('Phone lines require');
  const scenario=materializeScenario(trevieres,'phone',{command_network:'phones'});
  expect(scenario.rules.communications).toBe('phones');
  expect(scenario.units.find(u=>u.id==='co').radios).toContain('CO_PHONE');
  expect(previewMissionSetup(trevieres,'phone',{command_network:'phones'}).units.find(u=>u.id==='co').assets.phone_line).toBe(4);
 });
 it('requires an intact line to connect separated CO phones and can lay a replacement',()=>{
  const locations=Object.fromEntries([0,1,2].map(row=>[`r${row}c1`,{id:`r${row}c1`,row,col:1,staging:row===0,name:`Row ${row}`}]))
  const hub={id:'co',name:'CO',location:'r0c1',cover:null,cohesion:'GOOD',pinned:false,steps:[{}],radios:['CO_PHONE'],assets:{phone_line:1}};
  const platoon={id:'p1',name:'Platoon',location:'r2c1',cover:null,cohesion:'GOOD',pinned:false,steps:[{}],radios:['CO_PHONE'],assets:{}};
  const state={mission_rules:{communications:'phones'},locations,units:{co:hub,p1:platoon},phone_lines:[{id:'line1',location:'r1c1',cut:false}],next_id:2,events:[]};
  expect(communication(state,hub,platoon)).toContain('field-phone');
  state.phone_lines[0].cut=true;
  expect(communication(state,hub,platoon)).toBeNull();
  expect(communicationReason(state,hub,platoon)).toContain('intact phone line');
  hub.location='r1c1';
  layPhoneLine(state,hub);
  expect(hub.assets.phone_line).toBe(0);
  expect(phoneConnected(state,'r0c1','r2c1')).toBe(true);
 });
});
