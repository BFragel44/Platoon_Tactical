import {it,expect} from 'vitest';
import {trevieres} from '../src/scenarios/trevieres.js';
import {createMission,submitCommand,advancePhase} from '../src/sim/company/engine.js';
import {spot,seesCard,refresh} from '../src/sim/company/battlefield.js';
import {prepareCombat} from '../src/sim/company/combat.js';
import {commandOptions} from '../src/sim/company/actions.js';

function fixture(){
 const s=createMission(trevieres,'mortar-indirect-fix');s.phase='GENERAL_INITIATIVE';s.impulse={id:'test',hq:'general',commands:6,spent:0};
 s.units.co.location='r2c2';s.units.co.cover=null;
 const mortar=s.units.mortar_section;mortar.location='r1c1';mortar.cover=null;mortar.exposed=false;
 s.locations.r1c1.terrain='fields';
 const enemy=structuredClone(s.units.s11);Object.assign(enemy,{id:'enemy',name:'Test enemy',faction:'enemy',location:'r2c3',cover:null,fire:null,removed:null});s.units.enemy=enemy;spot(s,enemy);
 return s;
}
const command={type:'INDIRECT',issuer_id:'co',unit_id:'mortar_section',target_id:'r2c3'};
it.each(['zero ammo','depleted flag','eliminated HQ','empty HQ','pinned HQ','fire-team HQ','non-HQ observer','enemy observer','observer without LOS','one-step mortar','wrong platoon','no communication'])(
 'rejects %s in General Initiative without spending commands, ammunition or random draws',kind=>{
 const s=fixture();let c={...command};
 if(kind==='zero ammo')s.units.mortar_section.ammo.MTR=0;
 if(kind==='depleted flag')s.units.mortar_section.out_of_ammo=true;
 if(kind==='eliminated HQ')s.units.co.removed='ELIMINATED';
 if(kind==='empty HQ')s.units.co.steps=[];
 if(kind==='pinned HQ')s.units.co.pinned=true;
 if(kind==='fire-team HQ')s.units.co.cohesion='F';
 if(kind==='non-HQ observer'){s.units.s11.location='r2c2';c.issuer_id='s11';}
 if(kind==='enemy observer')s.units.co.faction='enemy';
 if(kind==='observer without LOS')s.units.co.location='r1c1';
 if(kind==='one-step mortar')s.units.mortar_section.steps=s.units.mortar_section.steps.slice(0,1);
 if(kind==='wrong platoon'){s.units.hq2.location='r2c2';s.units.mortar_section.platoon=1;c.issuer_id='hq2';}
 if(kind==='no communication')s.units.mortar_section.radios=[];
 const before=structuredClone(s),result=submitCommand(s,c);
 expect(result.accepted).toBe(false);expect(result.state).toEqual(before);expect(s).toEqual(before);
});
it('uses observer LOS without mortar LOS, draws no cards, and expires at cleanup',()=>{
 const s=fixture();expect(seesCard(s,s.units.mortar_section,command.target_id)).toBe(false);
 const result=submitCommand(s,command);expect(result.accepted).toBe(true);
 const next=result.state;expect(next.deck).toEqual(s.deck);expect(next.rng).toEqual(s.rng);
 expect(next.fire.filter(f=>f.source==='mortar_section')).toEqual([{source:'mortar_section',origin:'r1c1',target:'r2c3',value:-3,indirect:true}]);
 expect(next.impulse.commands).toBe(5);expect(next.impulse.origin_spent.co).toBe(1);
 next.impulse=null;next.phase='CLEANUP';expect(advancePhase(next).state.units.mortar_section.indirect).toBeNull();
});
it('allows company staff and the attached platoon HQ to observe',()=>{
 for(const id of ['staff','hq1']){const s=fixture();s.units[id].location='r2c2';s.units[id].cover=null;s.units[id].radios=['CO'];if(id==='hq1')s.units.mortar_section.platoon=1;
 expect(submitCommand(s,{...command,issuer_id:id}).accepted).toBe(true);}
});
it('resolves the last ammunition point once and cannot project a further heavy indirect attack',()=>{
 const s=fixture();s.units.mortar_section.ammo.MTR=1;
 const result=submitCommand(s,command);expect(result.accepted).toBe(true);const next=result.state;
 const prepared=prepareCombat(next);expect(next.units.mortar_section.ammo.MTR).toBe(0);
 expect(prepared.find(r=>r.target_id==='enemy').sources.some(f=>f.source_id==='mortar_section'&&f.kind==='ON_MAP_INDIRECT')).toBe(true);
 refresh(next);expect(next.fire.some(f=>f.source==='mortar_section'&&f.indirect)).toBe(false);
 expect(submitCommand(next,command).accepted).toBe(false);
});
it('explains the renamed command and excludes exhausted ammunition from available options',()=>{
 const s=fixture(),option=commandOptions(s,s.units.mortar_section,'co').find(o=>o.type==='INDIRECT');
 expect(option.label).toBe('Call on-map mortar indirect fire');expect(option.help).toContain('not its own line of sight');expect(option.available).toBe(true);
 s.units.mortar_section.ammo.MTR=0;expect(commandOptions(s,s.units.mortar_section,'co').find(o=>o.type==='INDIRECT').available).toBe(false);
});
