import {it,expect} from 'vitest';
import {createMission,getPlayerView,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {refresh,spot} from '../src/sim/company/battlefield.js';
import {spottingBaseDraws} from '../src/sim/company/actions.js';
import {prepareCombat} from '../src/sim/company/combat.js';
import {spottingPreview} from '../src/ui/spottingMenu.js';
import {borders} from '../src/sim/company/terrain.js';
const fresh=()=>createMission(keepUpTheFire,'notes3');
it('pending missions prevent No Contact without creating active fire or combat stakes',()=>{
 const s=fresh();s.support.push({id:'pending',source:'co',location:'r2c2',status:'PENDING',value:-3});refresh(s);
 expect(s.activity).toBe('CONTACT');expect(s.fire).toEqual([]);prepareCombat(s);expect(s.pending_combat).toEqual([]);
});
it('applies the observer spotting penalty to KUTF mortar spotters',()=>{
 const s=fresh(),u=s.units.s11,t={...u,location:'r2c2',kind:'SPOTTER',vof:null};
 expect(spottingBaseDraws(s,u,t)).toBe(spottingBaseDraws(s,u,{...t,kind:'SQUAD'})-1);
 expect(spottingBaseDraws(s,u,t)).toBe(spottingBaseDraws(s,u,{...t,kind:'FO'}));
});
it('joins any eligible existing PDF and chooses nearest instead of the last stored PDF',()=>{
 for(const range of [1,3]){
 const s=createMission(companyAssault,'pdf');for(const l of Object.values(s.locations)){l.borders=borders(['N','NE','E','SE','S','SW','W','NW']);l.elevation=1;}
 const a=s.units.s11,b=s.units.s21;a.location=b.location='r1c2';a.fire='r1c3';b.fire='r3c2';a.range=b.range=3;
 s.units.join={...structuredClone(a),id:'join',fire:null,range};
 const copy=structuredClone(s);refresh(s);refresh(copy);
 expect(s.units.join.fire).toBe('r1c3');expect(s).toEqual(copy);
 }
});
it('freezes known source strength and omits hidden source statistics',()=>{
 for(const known of [false,true]){
 const s=createMission(companyAssault,'frozen-source');s.units.s11.location='r1c1';
 s.units.enemy={...structuredClone(s.units.s21),id:'enemy',name:'Secret',faction:'enemy',location:'r2c1',fire:'r1c1'};
 if(known)spot(s,s.units.enemy);refresh(s);prepareCombat(s);
 const r=s.pending_combat.find(r=>r.target_id==='s11'),source=r.strongest;
 expect(source.steps).toBe(known?3:undefined);s.units.enemy.steps=[];expect(source.steps).toBe(known?3:undefined);
 }
});
it('previews only public spotting factors without changing state or RNG',()=>{
 const s=fresh(),v=getPlayerView(s),before=structuredClone(s),u=v.units.find(u=>u.id==='s11');
 const p=spottingPreview(v,u,'r2c2');expect(p.base).toBe(2);expect(p).not.toHaveProperty('final_draws');expect(s).toEqual(before);
 s.phase='CONTACTS';s.units.s11.location='r1c1';const contact=getPlayerView(s).contact_review;
 expect(contact.eligible_locations).toContain('r1c1');expect(contact.eligible_locations).not.toContain('r2c2');
});
it('rejects revision-12 executable records without migrating them',()=>{
 const record=exportReplay(fresh());record.rules_version=12;const before=structuredClone(record);
 expect(()=>replayMission(keepUpTheFire,record)).toThrow('version mismatch');expect(record).toEqual(before);
});
