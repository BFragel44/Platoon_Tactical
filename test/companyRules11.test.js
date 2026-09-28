import {it,expect} from 'vitest';
import {createMission,advancePhase,selectHQ,getPlayerView,exportReplay,replayMission} from '../src/sim/company/engine.js';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {refresh,combatExposure,movementReason,hasFire} from '../src/sim/company/battlefield.js';
import {commandArithmetic,rosterMarkup} from '../src/ui/companyOverview.js';
const fresh=()=>createMission(companyAssault,'rules11');
it('retains Contact for empty established fire and unactivated mines, and prevents minefield unpinning',()=>{
 const s=fresh();s.units.s11.location='r1c1';s.units.s11.fire='r1c2';refresh(s);expect(s.activity).toBe('CONTACT');
 s.units.s11.fire=null;s.locations.r1c1.mines=true;refresh(s);expect(s.activity).toBe('CONTACT');
 expect(hasFire(s,'r1c1',{includeInactiveMines:false})).toBe(false);
 s.units.s11.pinned=true;s.phase='PINNED_RECOVERY';s.impulse=null;expect(advancePhase(s).state.units.s11.pinned).toBe(true);
 s.locations.r1c1.mines=false;refresh(s);expect(s.activity).toBe('NO_CONTACT');expect(advancePhase(s).state.units.s11.pinned).toBe(false);
});
it('applies sniper smoke, restricts crowding by attack type and selects after attack-specific modifiers',()=>{
 const s=fresh(),u=s.units.s11,l=s.locations.r1c1;u.location=l.id;u.cover='cover';s.units.s12.location=l.id;s.units.s12.cover='cover';l.covers=[{id:'cover',value:1,type:'Foxhole'}];l.smoke=true;l.smoke_value=2;
 s.markers=[{type:'SNIPER',location:l.id,target:u.id,value:-3}];expect(combatExposure(s,u).parts).toMatchObject({fire:-3,smoke:2,overcrowding:0});
 s.markers[0].type='MINES';s.markers[0].value=-4;expect(combatExposure(s,u).parts).toMatchObject({fire:-4,smoke:0,overcrowding:0});
 s.markers=[];l.smoke=false;l.burst=1;s.fire=[{source:'mg1',origin:'r1c2',target:l.id,value:-3}];s.support=[{status:'ACTIVE',location:l.id,value:-3}];
 const c=combatExposure(s,u);expect(c.strongest.kind).toBe('OFF_MAP_SUPPORT');expect(c.parts).toMatchObject({fire:-3,burst:1,overcrowding:-3});expect(c.total).toBe(-4);
 s.support=[];s.fire[0].indirect=true;expect(combatExposure(s,u).parts.overcrowding).toBe(0);
});
it('counts grenade pressure for command draws and displays arithmetic without mutation',()=>{
 const s=fresh();s.phase='PLATOON_INITIATIVE';s.impulse=null;s.units.hq1.location='r1c1';s.markers=[{type:'GRENADE',location:'r1c1',target:'hq1',value:-3}];refresh(s);
 const r=selectHQ(s,'hq1');expect(r.state.impulse.modifiers.fire).toBe(-3);expect(r.state.impulse.modifiers.no_contact).toBe(0);
 const before=structuredClone(r.state),v=getPlayerView(r.state);expect(commandArithmetic(v.impulse)).toContain('Incoming fire: -3');expect(rosterMarkup(v)).toContain('data-roster-unit="hq1"');expect(r.state).toEqual(before);
});
it('permits overloaded setup while preventing movement and preserves strict replay/version checks',()=>{
 const assets={hq1:{smoke:4,wp:4,rifle_grenade:1},hq2:{rifle_grenade:1},hq3:{rifle_grenade:1}};
 const s=createMission(keepUpTheFire,'kut-1',{assets});expect(movementReason(s,s.units.hq1,'r1c1')).toContain('capacity');
 expect(replayMission(keepUpTheFire,exportReplay(s))).toEqual(s);
 const old=exportReplay(s);old.rules_version=10;expect(()=>replayMission(keepUpTheFire,old)).toThrow('version mismatch');
});
