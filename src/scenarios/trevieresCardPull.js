import {trevieres} from './trevieres.js';
export const trevieresCardPull={...trevieres,id:'normandy_1_card_pull',version:1,
 name:'Trévières — card-pull comparison',
 briefing:trevieres.briefing+' Experimental standalone comparison: combat and HIT effects draw from the shared Action Deck. Separate company and recovery; does not advance a campaign.',
 rules:{...trevieres.rules,combatResolver:'action-deck-v1',rosterKey:'platoon-trevieres-card-pull-company'},
 readiness:{...trevieres.readiness,playable:true,stage:'experimental comparison'},
};
