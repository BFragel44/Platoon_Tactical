import {it,expect} from 'vitest';
import {stGermain} from '../src/scenarios/stGermain.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {fireMarkers} from '../src/ui/fireMarkers.js';
import {markerSummary} from '../src/ui/firePresentation.js';
function state(){const s=createMission(stGermain,'marker-privacy');s.units.s11.location='r1c1';s.units.e={...structuredClone(s.units.s12),id:'e',name:'5/Fallschirmjäger',faction:'enemy',location:'r1c1'};return s;}
it('distinguishes visible US and German grenades, including critical attacks and actual values',()=>{
 const s=state();s.knowledge.spotted.e=true;
 s.markers=[{type:'GRENADE',source:'s11',location:'r1c1',target:'e',value:-4},{type:'GRENADE',source:'e',location:'r1c1',target:'s11',value:-8,critical:true}];
 const v=getPlayerView(s),m=fireMarkers(v,v.locations.find(l=>l.id==='r1c1'));
 expect(m[0]).toMatchObject({art:'grenade',side:'US',value:-4});
 expect(m[1]).toMatchObject({art:'german-grenade',side:'GER',value:-8,critical:true});
 const html=markerSummary(m[1]);expect(html).toContain('/markers/german-grenade.png');expect(html).toContain('>-8</span>');expect(html).toContain('CRITICAL');expect(html).toContain('GER');
});
it('uses no faction artwork for hidden attackers and consolidates historical duplicate misses without mutating the view',()=>{
 const s=state();s.markers=[{type:'GRENADE',source:'e',location:'r1c1',target:'s11',value:-4},{type:'GRENADE_MISS',location:'r1c1'},{type:'GRENADE_MISS',location:'r1c1'}];
 const v=getPlayerView(s),before=structuredClone(v),m=fireMarkers(v,v.locations.find(l=>l.id==='r1c1'));
 expect(m).toHaveLength(2);expect(m[0]).toMatchObject({art:null,side:'?'});expect(markerSummary(m[0])).not.toContain('<img');expect(m[1].annotation).toBe('Card-wide miss');expect(v).toEqual(before);
});
it('labels individual visible grenade exchanges rather than a single ambiguous stack',()=>{const s=state();s.knowledge.spotted.e=true;s.markers=[{type:'GRENADE',source:'s11',origin:'r1c1',location:'r1c1',target:'e'},{type:'GRENADE',source:'e',origin:'r1c1',location:'r1c1',target:'s11',critical:true}];const v=getPlayerView(s),markers=fireMarkers(v,v.locations.find(l=>l.id==='r1c1'));expect(markers[0].annotation).toBe('1/1 → 5FJ');expect(markers[1].annotation).toBe('5FJ → 1/1');expect(markers[1].detail).toContain('5/Fallschirmjäger');});
it('redacts hidden source, target and cover identifiers from marker projection',()=>{const s=state();s.markers=[{type:'GRENADE',source:'e',origin:'r3c1',location:'r1c1',target:'s11',cover:'secret-cover'},{type:'GRENADE',source:'s11',location:'r1c1',target:'e'}];const v=getPlayerView(s);expect(v.markers[0].source).toBeUndefined();expect(v.markers[0].origin).toBeUndefined();expect(v.markers[0].cover).toBeUndefined();expect(v.markers[1].target).toBeUndefined();expect(JSON.stringify(fireMarkers(v,v.locations.find(l=>l.id==='r1c1')))).not.toContain('Fallschirm');});
it('shows a cover stack target and distinguishes the card-wide miss penalty',()=>{const s=state();s.locations.r1c1.covers.push({id:'known-cover',known:true,type:'Foxholes',value:1});s.markers=[{type:'GRENADE',source:'s11',location:'r1c1',cover:'known-cover'},{type:'GRENADE_MISS',location:'r1c1'}];const v=getPlayerView(s),m=fireMarkers(v,v.locations.find(l=>l.id==='r1c1'));expect(m[0].annotation).toMatch(/1\/1 → C\d/);expect(m[0].detail).toContain('Foxholes stack');expect(m[1].annotation).toBe('Card-wide miss');});
