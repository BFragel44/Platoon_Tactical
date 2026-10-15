import {it,expect} from 'vitest';
import {segmentResultMarkup} from '../src/ui/segmentResults.js';
import {hqEventExplanation,hqEventTitle} from '../src/ui/hqEventPresentation.js';
it('separates the HQ event title, explanation and public result without repeated coordinates',()=>{
 const e={type:'HQ_EVENT',side:'friendly',code:'LOST'};e.text=hqEventExplanation(e);
 const html=segmentResultMarkup({turn:2,attemptLabel:'Patrol 2',events:[{type:'UNIT_MOVED',text:'1/2 Rifle Squad moved to 2.2 Woods.',from:'r1c1',target:'r2c2'},e]},()=> 'DUPLICATE');
 expect(html).toContain('Friendly Higher HQ Events');expect(html).toContain('hq-event-title">Lost in the Dark');expect(html.indexOf('Lost in the Dark')).toBeLessThan(html.indexOf('One randomly'));expect(html.indexOf('One randomly')).toBeLessThan(html.indexOf('1/2 Rifle Squad'));
 expect(html).not.toContain('DUPLICATE');expect(html).toContain('<summary>Event details</summary>');expect(html).toContain('Continue');
});
it('keeps enemy procedures separate from results and escapes public event text',()=>{
 const e={type:'HQ_EVENT',side:'enemy',code:'RALLY',text:hqEventExplanation({code:'RALLY'})};
 const html=segmentResultMarkup({turn:3,events:[e,{type:'HQ_EVENT_FORMATION',text:'<Defender> unpinned.'}]},id=>id);
 expect(html).toContain('Enemy Higher HQ Events');expect(html).toContain('&lt;Defender&gt;');expect(html).not.toContain('<Defender>');
 const hidden=segmentResultMarkup({turn:3,events:[e]},id=>id);expect(hidden).toContain('Concealed enemy results remain hidden');expect(hidden).not.toContain('No enemies');
});
it('gives every currently implemented event a readable heading',()=>{
 for(const code of ['LOST','HOLD_PATROL','RAIN','NO_MORTAR','NO_CANNON','ADVANCE_ROUTE','SHIFTING_LINES','SITREP','COMM','NO_ARTY','CHECKING_UP','HOLD','ADVANCE','ADVANCE_PC','RESUPPLY','TANK_SUPPORT','EVAC','DISPLACE_MORTAR','DISPLACE_LEADER','DISPLACE_HMG','RALLY','FALL_BACK','COUNTER_ATTACK','AMMO','REINFORCE','UNPIN','RECOVER','BREAK','SURRENDER'])expect(hqEventTitle({code})).not.toContain('_');
});
