import {it,expect} from 'vitest';
import {trevieresCardPull} from '../src/scenarios/trevieresCardPull.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {eligibleTargets,submitCommand} from '../src/sim/company/actions.js';
import {cards} from '../src/sim/company/core.js';
import {secureStatus} from '../src/sim/company/missionFeatures.js';
import {casualtyEvacuationStatus} from '../src/ui/casualtyPresentation.js';
import {placePackage} from '../src/sim/company/missionContacts.js';
const fixture=()=>{const s=createMission(trevieresCardPull,'search');s.units.s11.location=s.objectives.secondary;Object.values(s.contacts).forEach(c=>c.resolved=true);s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:4,spent:0};return s;};
it('publishes an unspotted position for non-firing contact packages without identifying their units',()=>{
 const s=createMission(trevieresCardPull,'position');
 for(const l of Object.values(s.locations)){l.elevation=0;l.los_block=false;l.building=false;l.covers=[];}
 const pc=s.contacts.pc_r1c2;
 expect(placePackage(s,pc,{units:[{kind:'SPOTTER'}],no_fire:true,point_blank:true})).toBe(true);
 const v=getPlayerView(s);expect(v.suspected).toContain(pc.location);expect(v.enemies).toEqual([]);
 const enemy=Object.values(s.units).find(u=>u.faction==='enemy');
 enemy.location='r2c2';expect(getPlayerView(s).suspected).toContain('r2c2');
 expect(getPlayerView(s).suspected).not.toContain(pc.location);
 s.knowledge.spotted[enemy.id]={...enemy};expect(getPlayerView(s).suspected).not.toContain('r2c2');
});
it('offers own-card spotting without an occupancy oracle or a firing report',()=>{
 const empty=fixture(),hidden=structuredClone(empty);
 hidden.units.secret={...structuredClone(hidden.units.s11),id:'secret',name:'Concealed unit',faction:'enemy',kind:'SPOTTER',vof:null,fire:null};
 expect(eligibleTargets(empty,empty.units.s11,'SPOT')).toEqual(eligibleTargets(hidden,hidden.units.s11,'SPOT'));
 expect(eligibleTargets(hidden,hidden.units.s11,'SPOT')).toContain(hidden.units.s11.location);
 expect(getPlayerView(hidden).enemies).toEqual([]);expect(secureStatus(hidden,hidden.objectives.secondary).secured).toBe(false);
 const goodCard=Object.values(cards).find(c=>c.spot);hidden.deck.order=[goodCard.id,goodCard.id,goodCard.id,...hidden.deck.order];
 const result=submitCommand(hidden,{type:'SPOT',unit_id:'s11',issuer_id:'s11',target_id:hidden.units.s11.location});
 expect(result.accepted).toBe(true);expect(result.state.knowledge.spotted.secret).toBeTruthy();
 expect(secureStatus(result.state,result.state.objectives.secondary).secured).toBe(false);
 result.state.units.secret.removed='BROKEN';result.state.units.secret.steps=[];
 expect(secureStatus(result.state,result.state.objectives.secondary).secured).toBe(true);
});
it('empty searches consume a command and draw without declaring the card clear',()=>{
 const s=fixture(),before=s.deck.draws,r=submitCommand(s,{type:'SPOT',unit_id:'s11',issuer_id:'s11',target_id:s.units.s11.location});
 expect(r.accepted).toBe(true);expect(r.state.impulse.commands).toBe(3);expect(r.state.deck.draws).toBeGreaterThan(before);
 expect(r.events.find(e=>e.type==='OBSERVATION').text).toContain('no additional enemy identified');
});
it('explains casualties already on a relocated CCP versus delivered casualties',()=>{
 const v={objectives:{ccp:'r1c4'}};
 expect(casualtyEvacuationStatus(v,{location:'r1c4'})).toContain('transport and drop-off still required');
 expect(casualtyEvacuationStatus(v,{location:'r1c4',transported:true})).toContain('awaiting cleanup');
 expect(casualtyEvacuationStatus(v,{evacuated:true})).toBe('Evacuated');
});
