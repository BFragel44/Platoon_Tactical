import {it,expect} from 'vitest';
import {createMission,getPlayerView,advancePhase,submitCommand} from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {emit} from '../src/sim/company/core.js';
import {move} from '../src/sim/company/actions.js';
import {fireMarkers} from '../src/ui/fireMarkers.js';
import {coverLabel,movingFormationIds,tacticalText} from '../src/ui/battlefieldPresentation.js';
const fresh=()=>createMission(keepUpTheFire,'notes4');
it('shows a minefield before and after cleanup without concentrated-fire artwork',()=>{
 let s=fresh();const u=s.units.s11;u.location='r1c1';u.mine_hit=true;s.locations.r1c1.mines=true;s.markers.push({type:'MINES',location:u.location,target:u.id,value:-4});
 let v=getPlayerView(s),markers=fireMarkers(v,v.locations.find(l=>l.id==='r1c1'));
 expect(markers.find(m=>m.label.includes('MINES'))).toMatchObject({art:null,label:'MINES −4 · triggered'});
 s.phase='CLEANUP';s=advancePhase(s).state;v=getPlayerView(s);markers=fireMarkers(v,v.locations.find(l=>l.id==='r1c1'));
 expect(s.locations.r1c1.mines).toBe(true);expect(s.units.s11.mine_hit).toBe(false);
 expect(markers.find(m=>m.label.includes('MINES'))).toMatchObject({art:null,label:'MINES · Draw 3'});
});
it('keeps observed Incoming fire on an emptied card until fire-mission update, without revealing its spotter',()=>{
 let s=fresh();const u=s.units.s11;u.location='r1c1';s.units.secret={...structuredClone(u),id:'secret',name:'Secret spotter',faction:'enemy',kind:'SPOTTER',location:'r4c4',vof:null};
 s.support.push({id:'incoming',source:'secret',location:'r1c1',value:-3,status:'ACTIVE',agency:'enemy_mortar',ammo:'HE'});
 emit(s,'INCOMING_FIRE','Incoming mortar fire.',{location:'r1c1',value:-3});
 move(s,u,'r1c2');let v=getPlayerView(s);expect(v.support).toHaveLength(1);expect(v.support[0].location).toBe('r1c1');expect(JSON.stringify(v.support)).not.toContain('secret');
 s.support.push({id:'hidden',source:'secret',location:'r4c3',value:-3,status:'PENDING'});expect(getPlayerView(s).support).toHaveLength(1);
 s.support=s.support.filter(f=>f.id!=='hidden');s.phase='FIRE_MISSIONS';s=advancePhase(s).state;expect(getPlayerView(s).support).toEqual([]);
});
it('uses descriptive, distinct discovered-cover labels and conceals unknown covers',()=>{
 const s=fresh();s.locations.r1c1.covers=[{id:'cover_7',type:'Strong Building',value:3,known:true},{id:'cover_8',type:'Upper Story',value:3,parent:'cover_7',known:true},{id:'secret_cover',type:'Pillbox',value:4,known:false}];
 const v=getPlayerView(s);expect(coverLabel(v,'cover_7')).toBe('Strong Building · +3 protection');expect(coverLabel(v,'cover_8')).toContain('Upper Story above Strong Building');expect(coverLabel(v,'secret_cover')).toBeUndefined();expect(tacticalText(v,'Moved to cover_7.')).toBe('Moved to Strong Building · +3 protection.');
});
it.each(['PLATOON_MOVE','PLATOON_INFILTRATE'])('previews the exact %s participants without mutation',type=>{
 const s=fresh();s.phase='SUBORDINATE_ACTIVATION';s.impulse={hq:'hq1',id:'preview',commands:6,spent:0};s.units.s12.exposed=true;s.units.mg1.tripod=true;
 // Minefield VOF permits infiltration; staging remains an otherwise legal origin.
 s.locations.r1c1.mines=true;
 const before=structuredClone(s),v=getPlayerView(s),u=v.units.find(u=>u.id==='hq1'),option=u.options.find(o=>o.type===type);
 const ids=movingFormationIds(option,'r1c1');expect(ids).toContain('hq1');expect(ids).toContain('s11');expect(ids).not.toContain('s12');if(type.includes('INFILTRATE'))expect(ids).not.toContain('mg1');
 expect(s).toEqual(before);expect(movingFormationIds(option,'')).toEqual([]);expect(movingFormationIds(option,'r1c1',false)).toEqual([]);
 const r=submitCommand(s,{type,unit_id:'hq1',issuer_id:'hq1',target_id:'r1c1'});expect(r.accepted).toBe(true);
 expect(r.events.filter(e=>e.type==='UNIT_MOVED').map(e=>e.actor)).toEqual(ids);
});
it('accounts for destination stacking capacity in the group preview',()=>{
 const s=fresh();s.phase='SUBORDINATE_ACTIVATION';s.impulse={hq:'hq1',id:'capacity',commands:6,spent:0};
 s.units.occupant={...structuredClone(s.units.s21),id:'occupant',location:'r1c1',steps:Array.from({length:15},(_,i)=>({id:`step${i}`,personnel:[]}))};
 const option=getPlayerView(s).units.find(u=>u.id==='hq1').options.find(o=>o.type==='PLATOON_MOVE');
 const ids=movingFormationIds(option,'r1c1');expect(ids).toHaveLength(1);
 const r=submitCommand(s,{type:'PLATOON_MOVE',unit_id:'hq1',issuer_id:'hq1',target_id:'r1c1'});
 expect(r.accepted).toBe(true);expect(r.events.filter(e=>e.type==='UNIT_MOVED').map(e=>e.actor)).toEqual(ids);
});
