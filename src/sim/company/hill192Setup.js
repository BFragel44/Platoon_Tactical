import {loadScoutedBattlefield} from './battlefieldCarryover.js';
// M4 MSR 3 permits reserves, not an off-map staging area.
export function validateHill192Deployment(locations,units,forwardCard=null){
 const get=id=>locations[id]??locations.find?.(l=>l.id===id);
 if(forwardCard&&(get(forwardCard)?.row!==2||get(forwardCard)?.outside_boundary))throw new Error('Choose a Row-2 forward defense card.');
 const forward=new Set(),cards=new Set();
 for(const u of units){if(u.reserve||u.removed==='RESERVE')continue;const l=get(u.location);
  if(!l||l.staging||l.outside_boundary||![1,2].includes(l.row))throw new Error('All deployed M4 units must start on Row 1 or the chosen Row-2 defense.');
  if(l.row===2){if(l.id!==forwardCard)throw new Error('Only the chosen Row-2 defense may contain starting units.');if(![1,2,3].includes(u.platoon))throw new Error('Forward defenders must belong to the chosen platoon.');forward.add(u.platoon);cards.add(l.id);}
 }
 if(forward.size>1||cards.size>1)throw new Error('Only one platoon may start in the forward defense.');
 for(const l of Object.values(locations))if(units.filter(u=>!u.reserve&&u.removed!=='RESERVE'&&u.location===l.id).reduce((n,u)=>n+(Array.isArray(u.steps)?u.steps.length:u.steps),0)>16)throw new Error('M4 deployment exceeds sixteen steps on a card.');
 return true;
}
export function hill192CounterattackLocations(state){
 const occupied=new Set(Object.values(state.units).filter(u=>u.faction==='friendly'&&!u.removed&&(Array.isArray(u.steps)?u.steps.length:u.steps)>0).map(u=>u.location));
 const unrevealed=Object.values(state.contacts).filter(pc=>!pc.resolved&&!pc.revealed).map(pc=>state.locations[pc.location]);
 return Object.values(state.locations).filter(l=>!l.staging&&occupied.has(l.id)&&(l.row===4||unrevealed.some(other=>other&&Math.max(Math.abs(l.row-other.row),Math.abs(l.col-other.col))===1))).map(l=>l.id);
}

// Expand the authored deployment before taking its immutable roster snapshot.
export function hill192DeploymentDefinition(definition,setup={}){
 if(!definition.rules?.hill192||!setup.battlefield||!definition.engineer_attachment)return definition;
 const imported=loadScoutedBattlefield(setup.battlefield);
 if(!imported.engineers_available)return definition;
 if(definition.units.some(u=>u.id===definition.engineer_attachment.id))return definition;
 const next=structuredClone(definition);next.units.push(structuredClone(next.engineer_attachment));return next;
}
