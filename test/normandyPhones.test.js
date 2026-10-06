import {describe,it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {previewMissionSetup} from '../src/sim/company/engine.js';
import {materializeScenario} from '../src/sim/company/missionSetup.js';
import {phoneConnected,layPhoneLine,damagePhoneLines} from '../src/sim/company/phoneNetwork.js';
import {createMission} from '../src/sim/company/engine.js';
import {cards} from '../src/sim/company/core.js';
import {communication,communicationReason} from '../src/sim/company/battlefield.js';

describe('Normandy field-phone network',()=>{
 it('uses an undestroyed dropped field phone as a line junction',()=>{
  const s=createMission({...trevieres,readiness:{playable:true}},'dropped-phone',{command_network:'phones'});
  s.units.hq1.location='r2c2';s.assets.push({id:'phone',type:'RADIO',net:'CO_PHONE',location:'r1c2'});
  expect(phoneConnected(s,s.units.co.location,s.units.hq1.location)).toBe(true);
  s.assets[0].destroyed=true;expect(phoneConnected(s,s.units.co.location,s.units.hq1.location)).toBe(false);
 });
 for(const [denominator,roll,cut]of [[2,1,true],[2,2,false],[3,1,true],[3,2,true],[3,3,false]])it(`uses printed ${denominator}-way phone damage outcome ${roll}`,()=>{
  const s=createMission({...trevieres,readiness:{playable:true}},'phone-damage',{command_network:'phones'});
  s.phone_lines=[{id:'line',location:'r2c2',cut:false}];
  if(denominator===2)s.support=[{status:'ACTIVE',location:'r2c2'}];
  else s.units.enemy={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r2c2'};
  const card=Object.values(cards).find(c=>c.id!==51&&c.random[denominator-2]===roll).id;
  s.deck.order=[card,...s.deck.order];damagePhoneLines(s);
  expect(s.phone_lines[0].cut).toBe(cut);
 });
 it('checks enemy discovery after a line survives incoming damage',()=>{
  const s=createMission({...trevieres,readiness:{playable:true}},'both-phone-threats',{command_network:'phones'});
  s.phone_lines=[{id:'line',location:'r2c2',cut:false}];s.support=[{status:'ACTIVE',location:'r2c2'}];
  s.units.enemy={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r2c2'};
  const survive=Object.values(cards).find(c=>c.id!==51&&c.random[0]===2).id,cut=Object.values(cards).find(c=>c.id!==51&&c.random[1]===1).id;
  s.deck.order=[survive,cut,...s.deck.order];const before=s.deck.draws;damagePhoneLines(s);
  expect(s.deck.draws-before).toBe(2);expect(s.phone_lines[0].cut).toBe(true);
  expect(s.events.findLast(e=>e.type==='PHONE_LINE_CUT').cause).toBe('enemy action');
 });
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
