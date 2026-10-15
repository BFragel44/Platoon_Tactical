export function hqEventTitle(e){
 const titles={LOST:'Lost in the Dark',HOLD_PATROL:'Hold up!',RAIN:'It’s Raining',NO_MORTAR:'Mortar Platoon Displacing',NO_CANNON:'Cannon Company Displacing',ADVANCE_ROUTE:'CO HQ is Screaming for Action',SHIFTING_LINES:'Shifting Lines',SITREP:'Situation Report',COMM:'Comm Trouble',NO_ARTY:'Artillery Displacing',CHECKING_UP:'Checking Up',HOLD:'Hold Position',ADVANCE:'Advance',ADVANCE_PC:'Advance into Contact',RESUPPLY:'Resupply',TANK_SUPPORT:'Tank Support',EVAC:'Casualty Evacuation',DISPLACE_MORTAR:'Mortars Displacing',DISPLACE_LEADER:'Leaders Displacing',DISPLACE_HMG:'Heavy Machine Guns Displacing',RALLY:'Rally',FALL_BACK:'Fall Back',COUNTER_ATTACK:'Counterattack',AMMO:'Machine-Gun Ammunition',REINFORCE:'Reinforcements',UNPIN:'Remove Pins',RECOVER:'Recover Cohesion',BREAK:'Breaking Morale',SURRENDER:'Surrender'};
 return titles[e.code]??(e.code?e.code.toLowerCase().replaceAll('_',' ').replace(/^./,c=>c.toUpperCase()):'No Higher HQ Event');
}
export function hqEventExplanation(e,name=id=>id){
 const through=e.counterattack_ends_after??e.turn+2;
 const next=(e.lead??0)+1;
 const final=e.final_row??3,atBoundary=(e.lead??0)>=final;
 const descriptions={
 TANK_SUPPORT:e.ignored?'The single M5 support platoon has already entered this mission; no additional tanks are available.':e.vehicle_positions?`Five M5 tanks entered Row 1 with five ammo each. Entry cards: ${Object.entries(e.vehicle_positions).map(([id,l])=>`${id}: ${name(l)}`).join(', ')}.`:'Choose a Row 1 entry card for each of the five M5 tanks, including its HQ. Each has five ammo and is susceptible to AT ambush. Confirming uses the original event draw.',
 LOST:'One randomly selected active-patrol formation moves one card in a random direction and becomes exposed. Leaving the map reveals a new terrain card and the row’s contact marker; Row 5 uses A.',
 HOLD_PATROL:'No unit may move onto an unoccupied card this turn. A card with a unit or unresolved contact marker is not unoccupied. Fixed defenders still cannot move by orders.',
 RAIN:'Rain adds +2 weather visibility for this turn, then is removed at cleanup. Illumination does not reduce weather or permit long-range LOS while weather is +2 or higher.',
 NO_CANNON:'The regimental cannon company is displacing and unavailable this turn. Remaining cannon fire missions are retained.',
 NO_MORTAR:'The battalion mortar platoon is displacing and unavailable this turn. Remaining mortar fire missions are retained; the company’s on-map 60mm mortars are unaffected.',
 ADVANCE_ROUTE:e.ignored?'All four route points have been visited; the advance obligation is ignored.':`Move at least one patrol formation closer to the next route point${e.waypoint?` at ${name(e.waypoint)}`:''} this turn. Completion earns one experience point for the patrol platoon; there is no penalty for insufficient commands.`,
 SHIFTING_LINES:'All unresolved Row 4 contacts are returned to stock and redrawn from remaining A/B/C markers on their question sides. Letters remain concealed until evaluation. Enemy tactics and the offensive phase sequence stay unchanged.',
 SITREP:'Company HQ must spend its first three commands on a battalion situation report this turn. Completion earns one experience point; insufficient commands cause no penalty.',
 COMM:'Battalion HQ cannot activate Company HQ this turn. Company HQ must spend its first two commands restoring communications. Completion earns one experience point; insufficient commands cause no penalty.',
 NO_ARTY:'The 15th Field Artillery Battalion is displacing: artillery is unavailable this turn. Remaining missions are not expended.',
 CHECKING_UP:'A randomly selected higher HQ staff officer joins Company HQ for this turn and the next. Battalion HQ is considered on the map; the visitor participates in the higher HQ activation sequence.',
 HOLD:`No unit may advance into a new lead row (Row ${next}) this turn. Movement within the existing advance remains subject to ordinary order restrictions.`,
 ADVANCE:atBoundary?`The lead has reached the final mission row (Row ${final}); ignore this advance obligation. No movement beyond the mission boundary is required.`:`Advance at least one unit into the next lead row (Row ${next}) this turn to close the flank gap. Ignore if already on Row ${final}. Completion earns one experience point; insufficient commands cause no penalty.`,
 ADVANCE_PC:atBoundary?`The lead has reached the final mission row (Row ${final}); ignore this contact-advance obligation. No movement beyond the mission boundary is required.`:`Advance at least one unit into the next lead row (Row ${next}) onto a potential-contact card this turn. Ignore if already on Row ${final} or no such contact is reachable. Completion earns one experience point; insufficient commands cause no penalty.`,
 RESUPPLY:e.location?`Four ${e.ammo_type??'selected'} ammunition are available for pickup at ${name(e.location)}. Ordinary carrying and pickup rules apply.`:'Choose four ammunition of one type (MG, mortar or rocket) and a Row 1 destination. Confirm the choice to finish this event.',
 EVAC:'Enemy casualty markers on cards without US troops are removed. Hidden casualty locations and totals are not reported.',
 DISPLACE_MORTAR:'Enemy mortars on cards without US troops leave the map. Hidden affected units and locations are not reported.',
 DISPLACE_LEADER:'Enemy leaders on cards without US troops leave the map. Hidden affected units and locations are not reported.',
 DISPLACE_HMG:'Enemy HMG teams on cards without US troops leave the map. Hidden affected units and locations are not reported.',
 RALLY:'Enemy pinned units attempt to rally; unpinned Limited Action Teams attempt recovery. Success is determined separately for each unit; hidden results remain concealed.',
 FALL_BACK:'Unpinned enemy units move straight back one card, or leave the map if no destination exists. Hidden movements remain concealed.',
 COUNTER_ATTACK:`${e.vire?'PC A contacts are placed on US-occupied Row 5 cards or US-occupied cards adjacent to an unrevealed contact':e.hill192?'PC A contacts are placed on US-occupied Row 4 cards or US-occupied cards adjacent to an unrevealed contact':'Random remaining contacts are placed on US-occupied battlefield cards'} on their “?” sides; overlaps are revealed and only the highest letter remains. Enemy tactics change to Offensive Assault through turn ${through}, ending at the start of turn ${through+1}. The offensive sequence stays unchanged. Counterattack PC A uses the alternate package chart.${Array.isArray(e.placements)?e.placements.length?` Placement cards: ${e.placements.map(name).join(', ')}.`:' No markers could be placed from the remaining stock.':''}`,
 };
 return descriptions[e.code]??e.text??'No higher headquarters event.';
}
