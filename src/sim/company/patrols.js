// Normandy pp. 24–27: patrol controls and progress, separate from assault retries.
export function validatePatrolPlan(locations, plan) {
 const get=id=>locations[id]??locations.find?.(l=>l.id===id);
 if(!plan||Object.keys(plan).some(k=>!['platoon','primary','route','cop','ccp','concentration'].includes(k)))throw new Error('Unknown patrol setup field.');
 if(![1,2,3].includes(plan.platoon))throw new Error('Choose one of the three platoons for this patrol.');
 if(get(plan.primary)?.row!==4)throw new Error('Choose a Row 4 patrol objective.');
 if(!Array.isArray(plan.route)||plan.route.length!==4||new Set(plan.route).size!==4||plan.route.some(id=>![2,3,4].includes(get(id)?.row)))throw new Error('Choose four different route cards in Rows 2–4.');
 if(get(plan.cop)?.row!==2)throw new Error('Choose a Row 2 Combat Outpost.');
 if(get(plan.ccp)?.row!==1)throw new Error('Choose a Row 1 casualty collection point.');
 if(!get(plan.concentration)||get(plan.concentration).staging)throw new Error('Choose a battlefield artillery concentration.');
 return structuredClone(plan);
}
export function createPatrolProgress(locations,plan) {
 return {plan:validatePatrolPlan(locations,plan),visited:[],objective_visited:false,returned:false};
}
export const patrolParticipant=(progress,unit)=>unit?.faction==='friendly'&&unit.platoon===progress.plan.platoon&&!unit.removed&&(unit.steps===undefined||unit.steps.length>0);
export function patrolMoonLight(randomFour) {
 if(!Number.isInteger(randomFour)||randomFour<1||randomFour>4)throw new Error('Moon visibility requires an R#4 result.');
 return randomFour+1;
}
export function patrolMovementReason(progress,unit,{automaticRetreat=false}={}) {
 if(unit?.faction!=='friendly'||patrolParticipant(progress,unit)||automaticRetreat)return null;
 return 'This formation holds a fixed defensive position during the patrol; only automatic retreat permits movement.';
}
export function recordPatrolMovement(progress,unit,from,to,locations) {
 const next=structuredClone(progress);
 if(!patrolParticipant(progress,unit)||from===to||progress.returned)return next;
 const get=id=>locations[id]??locations.find?.(l=>l.id===id);
 if(!get(from)||!get(to))throw new Error('Unknown patrol movement card.');
 if(to===progress.plan.primary)next.objective_visited=true;
 if(to===progress.plan.route[progress.visited.length])next.visited.push(to);
 if(next.objective_visited&&next.visited.length===4&&get(from).row===2&&get(to).row===1)next.returned=true;
 return next;
}
// Call at the objective/cleanup boundary, not at the start of turn ten.
export function patrolOutcome(progress,completedTurns,hasPatrolUnits=true) {
 if(progress.returned)return 'SUCCESS';
 if(completedTurns>=10||!hasPatrolUnits)return 'DEFEAT';
 return null;
}
export function nextPatrolPlatoons(completed) {
 if(!Array.isArray(completed)||completed.length>3||completed.some(p=>![1,2,3].includes(p.platoon)||!['SUCCESS','DEFEAT'].includes(p.outcome))||new Set(completed.map(p=>p.platoon)).size!==completed.length)throw new Error('Invalid completed patrol history.');
 return [1,2,3].filter(platoon=>!completed.some(p=>p.platoon===platoon));
}
