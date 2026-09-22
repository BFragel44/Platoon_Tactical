import {it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {refresh,spot,enemyCeaseFire} from '../src/sim/company/battlefield.js';
import {move,submitCommand} from '../src/sim/company/actions.js';
import {fireMarkers} from '../src/ui/fireMarkers.js';
import manifest from '../src/markers/manifest.json';
import {movementFireWarning,markerSummary,finalFireMessage} from '../src/ui/firePresentation.js';
const fixture=()=>{const s=createMission(companyAssault,'fire-path');s.units.s11.location='r1c1';const e={...structuredClone(s.units.s21),id:'enemy',name:'Enemy',faction:'enemy',location:'r3c1',fire:null};s.units.enemy=e;spot(s,e);return s;};
it('does not open new fire through a friendly intervening unit',()=>{
 const s=fixture();s.units.s12.location='r2c1';refresh(s);expect(s.units.s11.fire).toBeNull();
});
it('intercepts established fire but preserves its direction when the blocker leaves',()=>{
 const s=fixture();refresh(s);expect(s.units.s11.fire).toBe('r3c1');s.units.s12.location='r2c1';refresh(s);expect(s.units.s11.fire).toBe('r2c1');expect(s.units.s11.fire_direction.anchor).toBe('r3c1');s.units.s12.location='r0c1';refresh(s);expect(s.units.s11.fire).toBe('r3c1');
});
it('follows a target moving farther along the same PDF without changing direction',()=>{
 const s=fixture();s.units.enemy.location='r2c1';refresh(s);s.units.enemy.location='r3c1';refresh(s);expect(s.units.s11.fire).toBe('r3c1');s.units.enemy.location='r3c2';refresh(s);expect(s.units.s11.fire_direction.dc).toBe(0);expect(s.units.s11.fire).toBe('r3c1');
});
it('retains point-blank fire when source smoke removes the outward PDF',()=>{
 const s=fixture();refresh(s);s.locations.r1c1.smoke=true;refresh(s);expect(s.units.s11.fire).toBe('r1c1');expect(s.fire.find(f=>f.source==='s11')).toMatchObject({origin:'r1c1',target:'r1c1',reason:'BLOCKED_AT_SOURCE'});
});
it('follows the last spotted point-blank opponent departing to an adjacent card',()=>{
 const s=fixture();s.units.enemy.location='r1c1';refresh(s);move(s,s.units.enemy,'r2c1');refresh(s);expect(s.units.s11.fire).toBe('r2c1');
});
it('continues firing after elimination and only ceases when ordered',()=>{
 let s=fixture();refresh(s);s.units.enemy.steps=[];s.units.enemy.removed='BROKEN';refresh(s);expect(s.units.s11.fire).toBe('r3c1');
 s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};const r=submitCommand(s,{type:'CEASE_FIRE',unit_id:'s11',issuer_id:'s11'});expect(r.accepted).toBe(true);expect(r.state.units.s11.fire).toBeNull();expect(r.events.find(e=>e.type==='FIRE_ORDER_RESULT').text).toContain('Fire stopped');
});
it('reports reopening when cease fire still leaves an eligible enemy',()=>{
 const s=fixture();refresh(s);s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};const r=submitCommand(s,{type:'CEASE_FIRE',unit_id:'s11',issuer_id:'s11'});expect(r.state.units.s11.fire).toBe('r3c1');expect(r.events.find(e=>e.type==='FIRE_ORDER_RESULT').text).toContain('reopen');
});
it('clears all stale enemy PDFs before acquiring new targets at the boundary',()=>{
 const s=fixture();s.units.enemy.fire='r2c4';s.units.enemy2={...structuredClone(s.units.enemy),id:'enemy2'};enemyCeaseFire(s);expect(s.units.enemy.fire).not.toBe('r2c4');expect(s.units.enemy2.fire).not.toBe('r2c4');
});
it('never requests absent support marker assets, including pending and active minus five',()=>{
 for(const entry of Object.values(manifest.markers))expect(existsSync(`public/markers/${entry.file}`)).toBe(true);
 const s=fixture(),v=getPlayerView(s),l=v.locations.find(l=>l.id==='r1c1');
 for(const value of [-3,-4,-5])for(const status of ['PENDING','ACTIVE']){
  const markers=fireMarkers({...v,support:[{location:l.id,status,value}]},l);for(const m of markers)if(m.art)expect(existsSync(`public/markers/${m.art}.png`)).toBe(true);
  if(value===-5)expect(markers[0].art).toBeNull();
 }
});
it('warns about known friendly fire without changing order legality or disclosing enemies',()=>{
 const s=fixture();refresh(s);const v=getPlayerView(s),before=structuredClone(v);
 expect(movementFireWarning(v,'MOVE','r3c1')).toContain('1/1 Rifle Squad');expect(movementFireWarning(v,'SEEK_COVER','r3c1')).toBe('');expect(v).toEqual(before);
 expect(markerSummary({art:null,label:'Pending -5'})).not.toContain('<img');expect(finalFireMessage).toContain('no further combat');
});
