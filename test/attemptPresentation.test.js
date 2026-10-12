import {it,expect} from 'vitest';
import {segmentReviews,currentAttemptEvents,previousSegment,segmentResultMarkup} from '../src/ui/segmentResults.js';
import {supportWarning} from '../src/ui/supportPresentation.js';
it.each(['PATROL_PREPARED','MISSION_REATTEMPTED'])('keeps repeated turn numbers separate across %s',type=>{
 const events=[{id:'oldphase',type:'PHASE_ENTERED',turn:3,phase:'FRIENDLY_EVENTS',sequence:1},{id:'rain',type:'HQ_EVENT',text:'Old rain',turn:3,phase:'FRIENDLY_EVENTS',sequence:2},{id:'oldend',type:'SEGMENT_COMPLETED',label:'HQ events',turn:3,phase:'FRIENDLY_EVENTS',sequence:3},{id:'fail',type:'SUPPORT_REQUEST',success:false,text:'Old failed request',turn:3,sequence:4},{id:'new',type,attempt:2,turn:1,sequence:5},{id:'newphase',type:'PHASE_ENTERED',turn:3,phase:'FRIENDLY_EVENTS',sequence:6},{id:'none',type:'HQ_EVENT_NONE',text:'No event this attempt',turn:3,phase:'FRIENDLY_EVENTS',sequence:7},{id:'newend',type:'SEGMENT_COMPLETED',label:'HQ events',turn:3,phase:'FRIENDLY_EVENTS',sequence:8}],before=structuredClone(events);
 const reviews=segmentReviews(events);expect(reviews).toHaveLength(2);expect(reviews[0].events.map(e=>e.id)).toEqual(['rain']);expect(reviews[1].events.map(e=>e.id)).toEqual(['none']);expect(reviews[1].attemptLabel).toBe(`${type==='PATROL_PREPARED'?'Patrol':'Attempt'} 2`);expect(segmentResultMarkup(reviews[1],id=>id)).not.toContain('Old rain');expect(supportWarning({turn:3,units:[],locations:[]},events)).toBeNull();expect(currentAttemptEvents(events)[0].id).toBe('new');expect(events).toEqual(before);
});
it('new attempt cannot inherit the previous phase recap or an old support warning',()=>{
 const events=[{id:'a',type:'PHASE_ENTERED',sequence:1,turn:1,phase:'a'},{id:'b',type:'PHASE_ENTERED',sequence:2,turn:1,phase:'b'},{type:'MISSION_REATTEMPTED',attempt:2,sequence:3},{id:'c',type:'PHASE_ENTERED',sequence:4,turn:1,phase:'a'}];expect(previousSegment(events,[['a','A'],['b','B']])).toBeNull();
 const request={type:'SUPPORT_REQUEST',sequence:5,turn:1,success:false,ammo:'HE',text:'failed'};expect(supportWarning({turn:1,units:[],locations:[]},[...events,request])).toContain('request failed');
});
