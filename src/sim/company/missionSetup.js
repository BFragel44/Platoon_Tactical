import {createRng} from '../rng.js';
import {shuffle} from './core.js';
import {borders} from './terrain.js';
export function materializeScenario(definition,seed,setup={}) {
 if(!definition.map){if(Object.keys(setup).length)throw new Error('This authored course has no configurable setup.');return definition;}
 if(Object.keys(setup).some(k=>!['objectives','assignments','positions','assets'].includes(k)))throw new Error('Unknown setup field.');
 for(const field of ['assignments','positions','assets'])if(Object.keys(setup[field]??{}).some(id=>!definition.units.some(u=>u.id===id)))throw new Error('Unknown setup formation.');
 if(Object.keys(setup.objectives??{}).some(k=>!['primary','secondary','attack','ccp'].includes(k)))throw new Error('Unknown tactical control.');
 const scenario=structuredClone(definition),random={rng:createRng(`${seed}:terrain`)},deck=shuffle(random,scenario.map.deck),locations=[];
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
  if(assignment){if(!['MG','AT','MORTAR','FO'].includes(u.kind)||![0,1,2,3].includes(assignment.platoon)||assignment.platoon===0&&u.kind!=='FO')throw new Error('Invalid platoon attachment.');u.platoon=assignment.platoon||null;}
  if(setup.positions?.[u.id]){if(!get(setup.positions[u.id])?.staging)throw new Error('Initial units must be in staging.');u.location=setup.positions[u.id];}
 }
 {
  const distributed=setup.assets??scenario.assets;
  const totals={smoke:4,wp:4,rifle_grenade:3},actual={smoke:0,wp:0,rifle_grenade:0},rifles={};
  for(const [id,assets]of Object.entries(distributed)){const u=scenario.units.find(v=>v.id===id);if(!u)throw new Error('Unknown equipment recipient.');for(const [key,n]of Object.entries(assets)){if(!(key in actual)||!Number.isInteger(n)||n<0)throw new Error('Invalid equipment quantity.');actual[key]+=n;if(key==='rifle_grenade'&&n){if(!u.platoon||n!==1||rifles[u.platoon])throw new Error('Assign exactly one rifle grenade per platoon.');rifles[u.platoon]=true;}}}
  if(Object.keys(totals).some(k=>totals[k]!==actual[k]))throw new Error('Distribute all 4 HC, 4 WP and 3 rifle grenades.');
  for(const u of scenario.units)if(Object.values(distributed[u.id]??{}).reduce((n,v)=>n+v,0)+(u.radios?.length??0)>u.steps*6)throw new Error('A formation is assigned more assets than it can carry.');
  scenario.assets=structuredClone(distributed);
 }
 return scenario;
}
