import {spottingBaseDraws} from '../src/sim/company/actions.js';
import {describe,it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,getPlayerView,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {los,explainLos,combatExposure} from '../src/sim/company/battlefield.js';
import {borders,DIRECTIONS,terrainProtection} from '../src/sim/company/terrain.js';
import {terrainBorders} from '../src/ui/terrainBorders.js';
const fresh=()=>createMission(companyAssault,'los');
const flat=()=>{const s=fresh();for(const l of Object.values(s.locations)){l.elevation=1;if(!l.staging)l.borders=borders(DIRECTIONS);}return s;};
describe('Printed terrain borders and LOS',()=>{
 it('renders every authored direction without mutating terrain; staging has none',()=>{
  const s=fresh(),before=structuredClone(s);
  for(const l of Object.values(s.locations)){
   const html=terrainBorders(l);
   if(l.staging){expect(html).toBe('');continue;}
   expect(Object.keys(l.borders)).toEqual(DIRECTIONS);
   for(const d of DIRECTIONS)expect(html).toContain(`data-direction="${d}" class="los-edge ${l.borders[d]}"`);
  }expect(s).toEqual(before);
 });
 it('matches gully sides/corners and hill overrides',()=>{
  const s=fresh();expect(s.locations.r2c1.borders).toEqual(borders(['E','W']));
  expect(s.locations.r2c4.borders).toEqual(borders(['N','S']));
  expect(s.locations.r2c3.borders).toEqual(borders());
 });
 it('adjacent dark terrain is visible but both intermediate edges must be white',()=>{
  const s=flat();s.locations.r1c2.borders=borders();expect(los(s,'r1c1','r1c2')).toBe(true);
  expect(los(s,'r1c1','r1c3')).toBe(false);s.locations.r1c2.borders=borders(['W']);
  expect(los(s,'r1c1','r1c3')).toBe(false);s.locations.r1c2.borders=borders(['W','E']);
  expect(los(s,'r1c1','r1c3')).toBe(true);expect(los(s,'r1c3','r1c1')).toBe(true);
 });
 it('uses diagonal corners, not neighboring sides; checks both gully axes',()=>{
  const s=flat();s.locations.r2c2.borders=borders(['N','S','E','W']);
  expect(los(s,'r1c1','r3c3')).toBe(false);s.locations.r2c2.borders=borders(['SW','NE']);
  expect(los(s,'r1c1','r3c3')).toBe(true);
  s.locations.r2c2.borders=borders(['N','S']);expect(los(s,'r1c2','r3c2')).toBe(true);expect(los(s,'r2c1','r2c3')).toBe(false);
  s.locations.r2c2.borders=borders(['E','W']);expect(los(s,'r1c2','r3c2')).toBe(false);expect(los(s,'r2c1','r2c3')).toBe(true);
 });
 it('rejects bent paths and distinguishes weapon range',()=>{
  const s=flat();expect(los(s,'r1c1','r3c2')).toBe(false);expect(los(s,'r1c1','r1c4')).toBe(true);expect(los(s,'r1c1','r1c4',2)).toBe(false);
  s.locations.r1c5={...s.locations.r1c4,id:'r1c5',col:5};expect(los(s,'r1c1','r1c5',5)).toBe(false);
 });
 it('overlooks lower borders but blocks stepped slopes and equal-height intervening terrain reciprocally',()=>{
  const s=flat();s.locations.r1c2.borders=borders();
  for(const [a,m,b,want] of [[2,1,1,true],[2,1,2,true],[3,2,1,false],[2,2,1,false],[1,2,1,false]]){
   s.locations.r1c1.elevation=a;s.locations.r1c2.elevation=m;s.locations.r1c3.elevation=b;
   expect(los(s,'r1c1','r1c3')).toBe(want);expect(los(s,'r1c3','r1c1')).toBe(want);
  }
 });
 it('smoke permits LOS in and point blank, but not out or through',()=>{
  const s=flat();s.locations.r1c2.smoke=true;
  expect(los(s,'r1c1','r1c2')).toBe(true);expect(los(s,'r1c2','r1c1')).toBe(false);
  expect(los(s,'r1c1','r1c3')).toBe(false);expect(los(s,'r1c2','r1c2')).toBe(true);
 });
 it('uses the receiving border for dual terrain protection',()=>{
  const s=fresh(),g=s.locations.r2c1;
  expect(terrainProtection(g,s.locations.r2c2)).toBe(1);expect(terrainProtection(g,s.locations.r1c1)).toBe(2);
  expect(terrainProtection(g,s.locations.r1c2)).toBe(2);expect(terrainProtection(g,g)).toBe(1);
 });
 it('combat uses highest applicable receiving border; spotting uses its own approach',()=>{
  const s=fresh(),u=s.units.s11;u.location='r2c1';s.units.s21.location='r2c2';s.units.s12.location='r1c1';
  s.fire=[{source:'s21',origin:'r2c2',target:u.location,value:0}];
  expect(combatExposure(s,u).parts.terrain).toBe(1);
  s.fire.push({source:'s12',origin:'r1c1',target:u.location,value:0});
  expect(combatExposure(s,u).parts.terrain).toBe(2);
  // A synthetic dual-value terrain isolates the chart's +0 / +3 thresholds.
  s.locations.r2c1.protection=3;s.locations.r2c1.open_protection=0;
  expect(spottingBaseDraws(s,s.units.s21,u)).toBe(3);
  expect(spottingBaseDraws(s,s.units.s12,u)).toBe(1);
 });
 it('explanations identify terrain without leaking concealed support identities',()=>{
  const s=flat();s.units.s11.location='r1c1';s.locations.r1c2.borders=borders();
  expect(explainLos(s,'r1c1','r1c3').blocking).toBe('r1c2');
  const before=structuredClone(s);expect(getPlayerView(s).units.find(u=>u.id==='s11').los_explanations.r1c3.reason).toContain(s.locations.r1c2.name);expect(s).toEqual(before);
  s.support.push({id:'secret-support',source:'enemy',status:'ACTIVE',location:'r2c2',value:-4});
  expect(JSON.stringify(getPlayerView(s).units)).not.toContain('secret-support');
 });
 it('rejects historical versions instead of migrating',()=>{
  const record=exportReplay(fresh());expect(replayMission(companyAssault,record)).toEqual(fresh());
  expect(()=>replayMission(companyAssault,{...record,rules_version:6})).toThrow();
  expect(()=>replayMission(companyAssault,{...record,version:3})).toThrow();
 });
});
