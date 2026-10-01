import {scoreMission} from './missionFeatures.js';
const definitions=[
 ['primary','Secure the Primary Objective Card','5'],['secondary','Secure the Secondary Objective Card','4'],['attack','Secure the Attack Position Card','3'],
 ['clearA','Clear another PC A card (excluding Objectives or Attack Position)','2 per card'],['clearBC','Clear another PC B or C card (excluding Objectives or Attack Position)','1 per card'],
 ['prisoner','Capture an Enemy Prisoner','2 per step'],['enemyCasualty','Capture an Enemy Casualty','1 per step'],['grenade','Successful Point Blank Grenade Attack','1 per attack'],
 ['event','Complete a Higher Headquarters Event marked with *','1'],['evac','Successfully evacuate a friendly casualty','1 per step'],['bunker','Clear an Enemy Bunker (in addition to the Card)','1 per Bunker'],['pillbox','Clear an Enemy Pillbox (in addition to the Card)','2 per Pillbox']];
function category(a){
 if(['primary','secondary','attack'].includes(a.key))return a.key;
 if(a.key.startsWith('clear_'))return a.points===2?'clearA':'clearBC';
 if(a.key.startsWith('fort_'))return a.points===2?'pillbox':'bunker';
 if(a.key.startsWith('enemy_casualty_'))return 'enemyCasualty';
 return ['prisoner','grenade','event','evac'].find(k=>a.key.startsWith(k+'_'));
}
// Preview scoring on isolated bookkeeping; never emit into the mission or consume RNG.
export function achievementTally(s){
 if(s.scenario_id!=='keep_up_the_fire')return null;
 const preview={...s,achievements:structuredClone(s.achievements),events:[...s.events],hq_events:structuredClone(s.hq_events)};
 scoreMission(preview,{final:true});
 const active=s.status==='ACTIVE';
 const rows=definitions.map(([id,task,rate])=>{
  const entries=preview.achievements.filter(a=>category(a)===id);
  const provisional=active&&['primary','secondary','attack','clearA','clearBC','bunker','pillbox'].includes(id);
  return {id,task,rate,points:entries.reduce((n,a)=>n+a.points,0),provisional};
 });
 return {rows,total:rows.reduce((n,r)=>n+r.points,0),provisional:active};
}
