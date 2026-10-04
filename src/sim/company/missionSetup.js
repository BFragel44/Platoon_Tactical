import {createRng} from '../rng.js';
import {shuffle} from './core.js';
import {borders} from './terrain.js';
import {validateNormandyContent} from './normandyContent.js';
export const SETUP_ASSET_LIMITS=Object.freeze({smoke:4,wp:4,rifle_grenade:3});
export const SIGNAL_KEYS=Object.freeze(['rsp','rsc','gsp','gsc','red_signal','green_signal','yellow_signal','purple_signal']);
export const SIGNAL_ORDERS=Object.freeze(['CF','XPL1','XPL2','M2PO','INFAP2PO','M2SO','INFAP2SO','M2S']);
export function validatePhaseLines(lines,rows){
 if(!lines||Object.keys(lines).some(k=>!['1','2'].includes(k))||[1,2].some(k=>!Number.isInteger(lines[k])||lines[k]<1||lines[k]>rows)||lines[1]>=lines[2])throw new Error('Choose ordered Phase Lines 1 and 2 within the mission rows.');
 return structuredClone(lines);
}
export function materializeScenario(definition,seed,setup={}) {
 validateNormandyContent(definition);
 if(!definition.map){if(Object.keys(setup).length)throw new Error('This authored course has no configurable setup.');return definition;}
 if(Object.keys(setup).some(k=>!['objectives','assignments','positions','assets','mortar_mode','mortar_radio_recipient','command_network','phone_lines','signals','phase_lines'].includes(k)))throw new Error('Unknown setup field.');
 if(setup.phase_lines&&!definition.rules?.signals)throw new Error('This mission has no configurable phase lines.');
 if(setup.mortar_mode&&!definition.unit_options?.mortar)throw new Error('This mission has no mortar setup choice.');
 if(setup.mortar_mode&&!['section','teams'].includes(setup.mortar_mode))throw new Error('Choose the mortar section or individual teams.');
 const eligibleUnits=[...definition.units,...(definition.unit_options?.mortar?.teams??[])];
 for(const field of ['assignments','positions','assets'])if(Object.keys(setup[field]??{}).some(id=>!eligibleUnits.some(u=>u.id===id)))throw new Error('Unknown setup formation.');
 if(Object.keys(setup.objectives??{}).some(k=>!['primary','secondary','attack','ccp'].includes(k)))throw new Error('Unknown tactical control.');
 const scenario=structuredClone(definition),random={rng:createRng(`${seed}:terrain`)},deck=shuffle(random,scenario.map.deck),locations=[];
 if(scenario.rules?.signals)scenario.phase_lines=validatePhaseLines(setup.phase_lines??{1:1,2:2},scenario.map.rows);
 if(setup.mortar_mode==='teams'){
  const choice=scenario.unit_options.mortar;scenario.units=scenario.units.filter(u=>u.id!==choice.section_id).concat(choice.teams);
  const recipient=scenario.units.find(u=>u.id===(setup.mortar_radio_recipient??'staff'));
  if(!recipient)throw new Error('Choose a company unit to receive the mortar section CO TAC radio/phone.');
  recipient.radios.push('CO');
 }else if(setup.mortar_radio_recipient)throw new Error('Mortar radio reassignment requires individual mortar teams.');
 if(setup.command_network){
  if(!definition.unit_options?.command_network||!['radio','phones'].includes(setup.command_network))throw new Error('Invalid command network choice.');
  if(setup.command_network==='radio'&&setup.phone_lines)throw new Error('Phone lines require the field-phone network.');
  if(setup.command_network==='phones'){
   scenario.rules.communications='phones';
   for(const u of scenario.units)u.radios=u.radios.map(net=>net==='CO'?'CO_PHONE':net);
   const lines=setup.phone_lines??{[scenario.units.find(u=>u.command_role==='company_commander')?.id??'co']:4};
   if(Object.entries(lines).some(([id,count])=>!scenario.units.some(u=>u.id===id)||!Number.isInteger(count)||count<0)||Object.values(lines).reduce((n,q)=>n+q,0)!==4)throw new Error('Distribute exactly four phone lines among active company formations.');
   scenario.phone_lines=structuredClone(lines);
  }
 }else if(setup.phone_lines)throw new Error('Phone lines require the field-phone network.');
 for(let row=0;row<=scenario.map.rows;row++)for(let col=1;col<=scenario.map.columns;col++){
  if(!row){locations.push({id:`r0c${col}`,name:`Staging ${col}`,row:0,col,staging:true,terrain:'staging',elevation:1,protection:0,cover_limit:0,cover_draw:0,borders:null,burst:0,known:true});continue;}
  let card=deck.pop(),elevation=1,hills=[];
  while(row===1&&card.terrain==='hill'){hills.push(card.id);elevation++;card=deck.pop();}
  locations.push({...card,id:`r${row}c${col}`,terrain_card:card.id,name:`${row}.${col} ${card.name}${hills.length?' / Hill':''}`,row,col,elevation,hills,borders:hills.length?borders():card.borders,staging:false,known:!scenario.map.hidden||row===1});
 }
 scenario.locations=locations;scenario.terrain_deck=deck;
 scenario.contacts=locations.filter(l=>!l.staging).map(l=>({id:`pc_${l.id}`,location:l.id,type:scenario.contact_rows[l.row],resolved:false}));
 scenario.objectives={...scenario.objectives,...setup.objectives};
 const o=scenario.objectives,get=id=>locations.find(l=>l.id===id);
 if(o.primary===o.secondary||get(o.primary)?.row!==scenario.map.rows||get(o.secondary)?.row!==scenario.map.rows)throw new Error('Choose two different objectives in the final row.');
 if(get(o.attack)?.row!==scenario.map.rows-1||![o.primary,o.secondary].some(id=>Math.abs(get(id).col-get(o.attack).col)<=1))throw new Error('Attack position must be adjacent to an objective in the preceding row.');
 if(!get(o.ccp))throw new Error('Choose a terrain or staging card for the CCP.');
 for(const u of scenario.units){
  const assignment=setup.assignments?.[u.id];
  if(assignment){if(!['MG','HMG','AT','MORTAR','FO'].includes(u.kind)||![0,1,2,3].includes(assignment.platoon)||assignment.platoon===0&&u.kind!=='FO'&&scenario.rules.enemyActivity!=='normandy')throw new Error('Invalid platoon attachment.');u.platoon=assignment.platoon||null;}
  if(setup.positions?.[u.id]){if(!get(setup.positions[u.id])?.staging)throw new Error('Initial units must be in staging.');u.location=setup.positions[u.id];}
 }
 {
  const distributed=setup.assets??scenario.assets;
  const totals=SETUP_ASSET_LIMITS,actual={smoke:0,wp:0,rifle_grenade:0},rifles={};
  for(const [id,assets]of Object.entries(distributed)){const u=scenario.units.find(v=>v.id===id);if(!u&&Object.values(assets).some(Boolean))throw new Error('Unknown equipment recipient.');for(const [key,n]of Object.entries(assets)){if(!(key in actual)||!Number.isInteger(n)||n<0)throw new Error('Invalid equipment quantity.');actual[key]+=n;if(key==='rifle_grenade'&&n){if(!u?.platoon||n!==1||rifles[u.platoon])throw new Error('Assign exactly one rifle grenade per platoon.');rifles[u.platoon]=true;}}}
  if(Object.keys(totals).some(k=>totals[k]!==actual[k]))throw new Error('Distribute all 4 HC, 4 WP and 3 rifle grenades.');
  scenario.assets=structuredClone(distributed);
 }
 if(scenario.signal_assets){
  const choices=setup.signals??scenario.signal_assets;
  if(Object.keys(choices).length!==SIGNAL_KEYS.length||SIGNAL_KEYS.some(key=>!SIGNAL_ORDERS.includes(choices[key]?.order)||!scenario.units.some(u=>u.id===choices[key]?.carrier)))throw new Error('Assign all eight signal devices to valid formations and offensive orders.');
  scenario.signal_plan={};
  for(const key of SIGNAL_KEYS){const {carrier,order}=choices[key];scenario.signal_plan[key]=order;scenario.assets[carrier]??={};scenario.assets[carrier][key]=(scenario.assets[carrier][key]??0)+1;}
 }
 return scenario;
}
