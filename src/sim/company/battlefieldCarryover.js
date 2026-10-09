// Normandy M4 MSR 1–2. Battlefield records never advance a company roster.
export const BATTLEFIELD_SCHEMA=1;
export const BATTLEFIELD_KEY='platoon-normandy-battlefields';
const clone=v=>structuredClone(v);
const fields=['id','name','row','col','terrain','terrain_card','elevation','hills','borders','protection','cover_limit','cover_draw','burst','known','building','village','cover_type','covers','mines','trafficability','outside_boundary','mine_path_marked'];
export function validateScoutedBattlefield(record){
 if(record?.schema!==BATTLEFIELD_SCHEMA)throw new Error('Unsupported battlefield schema. Preserve the original export.');
 const source=record.source;
 if(source?.scenario!=='normandy_3'||source.content_version!==1||![27,28,29].includes(source.rules_version))throw new Error('Unsupported M3 battlefield source version. Preserve the original export.');
 if(!source.mission_instance_id||!source.seed||!['SUCCESS','DEFEAT'].includes(source.outcome)||!Number.isInteger(source.attempt)||source.attempt<1)throw new Error('Incomplete terminal M3 provenance.');
 if(!Array.isArray(source.patrols)||source.patrols.length!==3||new Set(source.patrols.map(p=>p.platoon)).size!==3||source.patrols.some(p=>![1,2,3].includes(p.platoon)||!['SUCCESS','DEFEAT'].includes(p.outcome)))throw new Error('Only a completed three-patrol M3 battlefield can be loaded.');
 if(!Array.isArray(record.locations)||record.locations.length<20)throw new Error('Incomplete scouted battlefield.');
 const ids=new Set(),covers=new Set();
 for(const l of record.locations){
  if(l.outside_boundary&&l.row>=1&&l.row<=4&&l.col>=1&&l.col<=5)throw new Error('Original scouted card cannot be outside the mission boundary.');
  if((!l.outside_boundary&&(l.row<1||l.row>4||l.col<1||l.col>5))||!Number.isInteger(l.row)||!Number.isInteger(l.col)||l.id!==`r${l.row}c${l.col}`||ids.has(l.id))throw new Error('Invalid scouted battlefield location.');ids.add(l.id);
  if(typeof l.name!=='string'||typeof l.terrain!=='string'||!Number.isInteger(l.elevation)||l.elevation<1||typeof l.known!=='boolean'||!Array.isArray(l.covers)||Object.keys(l).some(k=>!fields.includes(k)))throw new Error('Incomplete or unsupported scouted terrain.');
  for(const c of l.covers){if(!c.id||covers.has(c.id)||typeof c.type!=='string'||!Number.isFinite(c.value))throw new Error('Invalid or duplicate retained cover identity.');covers.add(c.id);}
  if(l.mines!==undefined&&typeof l.mines!=='boolean')throw new Error('Invalid discovered mine state.');
 }
 for(let row=1;row<=4;row++)for(let col=1;col<=5;col++)if(!ids.has(`r${row}c${col}`))throw new Error('Missing original M3 terrain card.');
 if(!Array.isArray(record.terrain_deck))throw new Error('Missing remaining terrain deck.');
 return clone(record);
}
export function exportScoutedBattlefield(state){
 if(state.scenario_id!=='normandy_3'||!['SUCCESS','DEFEAT'].includes(state.status)||state.patrol_history?.length!==3)throw new Error('Finish all three M3 patrols before exporting the battlefield.');
 const discovered=new Set(state.events.filter(e=>e.type==='MINEFIELD_FOUND'&&!e.hidden).map(e=>e.location));
 const record={schema:BATTLEFIELD_SCHEMA,source:{scenario:state.scenario_id,content_version:state.scenario_version,rules_version:state.rules_version,mission_instance_id:state.mission_instance_id,mission_run_id:state.mission_run_id??state.mission_instance_id,seed:state.seed,outcome:state.status,attempt:state.attempt_number,patrols:clone(state.patrol_history)},
  locations:Object.values(state.locations).map(l=>{const copy=Object.fromEntries(fields.filter(k=>l[k]!==undefined).map(k=>[k,clone(l[k])]));copy.mines=!!l.mines&&discovered.has(l.id);return copy;}),terrain_deck:clone(state.terrain_deck)};
 return validateScoutedBattlefield(record);
}
export function loadScoutedBattlefield(record){
 const checked=validateScoutedBattlefield(record);
 // Retain scouted expansions as outside-boundary terrain; the printed M4 footprint stays 5 × 4.
 return {locations:clone(checked.locations),terrain_deck:clone(checked.terrain_deck),source:clone(checked.source),engineers_available:checked.locations.some(l=>[2,3].includes(l.row)&&l.mines)};
}
export function readBattlefields(storage){
 const raw=storage.getItem(BATTLEFIELD_KEY);if(raw===null)return {raw,record:null,error:null};
 try{const record=JSON.parse(raw);if(record?.schema!==BATTLEFIELD_SCHEMA||!record.entries||typeof record.entries!=='object'||Array.isArray(record.entries))throw new Error('Unsupported battlefield store.');for(const [id,entry]of Object.entries(record.entries))if(validateScoutedBattlefield(entry).source.mission_instance_id!==id)throw new Error('Battlefield source ID mismatch.');return {raw,record,error:null};}
 catch(error){return {raw,record:null,error:error.message};}
}
export function saveBattlefield(storage,battlefield){
 const entry=validateScoutedBattlefield(battlefield),current=readBattlefields(storage);if(current.error)throw new Error(current.error+' Export the original store before replacement.');
 const record=current.record?clone(current.record):{schema:BATTLEFIELD_SCHEMA,entries:{}};const id=entry.source.mission_instance_id;
 if(record.entries[id]){if(JSON.stringify(record.entries[id])!==JSON.stringify(entry))throw new Error('Cannot replace an immutable source battlefield.');return clone(record.entries[id]);}
 record.entries[id]=entry;if(current.raw!==null)storage.setItem(`${BATTLEFIELD_KEY}-previous`,current.raw);storage.setItem(BATTLEFIELD_KEY,JSON.stringify(record));return clone(entry);
}
