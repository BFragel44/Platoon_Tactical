// Public presentation only. Never infer hidden contact or combat outcomes.
export const contactAdvanceLabel=contact=>contact.resolved?(contact.next_location?'Evaluate next contact →':'Continue to pinned recovery →'):'Resolve contact →';
export function needsGuardRemainderChoice(view){
 if(view.phase!=='CAPTURE'||!view.scenario_id?.startsWith('normandy_'))return false;
 return view.units.some(u=>u.kind==='SQUAD'&&u.steps===2&&!u.removed&&!u.pinned&&(view.enemies.some(e=>e.location===u.location&&!e.removed)||(view.suspected??[]).includes(u.location)));
}
export function commandRecoveryHint(unit){
 if(unit?.transport||unit?.removed==='RESERVE'||unit?.steps&&unit.removed)return '';
 if(!['HQ','STAFF','FO'].includes(unit?.kind))return '';
 if(!unit.steps||unit.removed)return 'This counter cannot issue orders. An eligible HQ or staff may reconstitute an eliminated HQ from a donor step; use the reconstitution preview to check eligibility and consequences.';
 if(unit.pinned)return 'Rally this formation to remove its pin. Then check its command side, communications and available impulse before issuing orders.';
 if(unit.cohesion!=='GOOD')return 'This formation is on its Fire Team side. Use Restore HQ command side (or the observer recovery order) from an eligible communicating issuer; under fire, recovery requires a successful rally attempt.';
 return '';
}
export function formationInspectionReason(unit,view){
 if(unit?.transport)return 'Embarked formation: use its transport controls for boarding and disembarking. Order availability still depends on the current phase.';
 if(unit?.removed==='RESERVE')return view.patrol?'Not deployed for this patrol; it cannot receive orders during this patrol.':'Not deployed for this mission; unavailable until the next mission.';
 return 'No orders available for this formation.';
}
export function phaseGuidance(view){
 if(view.status!=='ACTIVE')return 'Review the outcome, replay exports and company options.';
 if(view.pending_support)return 'Choose ordinary fire or two different adjacent cards for battalion fire before continuing.';
 if(view.pending_event?.code==='RESUPPLY')return 'Choose ammunition and its Row 1 delivery card, then resolve this segment.';
 if(!view.impulse&&view.eligible_hqs?.length)return 'Select an HQ in the command strip below. Finish its impulse before selecting the next HQ.';
 if(view.impulse?.commands===0)return 'No commands remain. Check for available free actions, then complete this impulse.';
 if(view.impulse?.hq==='general')return 'Use General Initiative on eligible formations. HQ-only actions still require an issuing HQ.';
 if(view.phase==='CO_ACTIVATION'&&view.impulse)return 'Activate subordinate HQs or issue company orders. Complete this impulse, then select a subordinate HQ below.';
 if(view.impulse)return 'Issue orders using this HQ’s commands, then complete the impulse. Radio contact alone does not provide commands.';
 return view.phase_description??'Resolve the current segment to continue.';
}
