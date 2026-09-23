import {it,expect} from 'vitest';
import {companyAssault} from '../src/scenarios/companyAssault.js';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {submitCommand,orderReason} from '../src/sim/company/actions.js';
import {refresh,incoming} from '../src/sim/company/battlefield.js';
import {cards} from '../src/sim/company/core.js';
import {fireMarkers,pdfPaths} from '../src/ui/fireMarkers.js';

function reconstitutionFixture() {
 const s=createMission(companyAssault,'reconstitution');s.phase='GENERAL_INITIATIVE';s.impulse={id:'general-test',hq:'general',commands:6,spent:0};
 s.units.s11.steps=[];s.units.s11.removed='CASUALTIES';
 for(let i=1;i<=4;i++)s.units[`team${i}`]={...structuredClone(s.units.s13),id:`team${i}`,name:`Assault Team ${i}`,kind:'LAT',cohesion:'A',steps:[{id:`step${i}`,personnel:[]}],location:'r0c1',cover:null,pinned:false,used:[],fire:null,indirect:null};
 return s;
}
const cmd=(ids,target='s11')=>({type:'RECONSTITUTE',issuer_id:'hq1',unit_id:'team1',target_id:target,contributor_ids:ids});
it('requires explicit, co-located teams and an eliminated squad within counter capacity',()=>{
 const s=reconstitutionFixture();
 expect(orderReason(s,cmd(['team1','team2','team3','team4']))).toContain('at most 3 steps');
 expect(orderReason(s,cmd(['team1','team2'],'s13'))).toContain('previously eliminated');
 expect(orderReason(s,cmd(['team1','team1']))).toContain('distinct');
 expect(orderReason(s,{...cmd(['team1','team2']),contributor_ids:undefined})).toContain('Choose 2–4');
 s.units.team2.location='r0c2';expect(orderReason(s,cmd(['team1','team2']))).toContain('same area');
});
it('restores the chosen squad and only consumes chosen teams, reproducibly',()=>{
 const s=reconstitutionFixture(),rally=Object.values(cards).find(c=>c.word.toLowerCase()==='rally'&&c.id!==51);
 s.deck.order=[rally.id,rally.id,...s.deck.order.filter(id=>id!==rally.id)];
 const first=submitCommand(s,cmd(['team1','team2','team3']));const second=submitCommand(structuredClone(s),cmd(['team1','team2','team3']));
 expect(first).toEqual(second);expect(first.accepted).toBe(true);
 expect(first.state.units.s11.steps).toHaveLength(3);expect(first.state.units.s13.steps).toHaveLength(3);
 expect(first.state.units.team4.steps).toHaveLength(1);expect(first.state.units.team1.removed).toBe('RECONSTITUTED');
 expect(first.events.find(e=>e.type==='FORMATION_RECONSTITUTED').text).toContain('Assault Team 3');
});
it('one cease-fire order reaches every friendly firing occupant and records reopening',()=>{
 const s=reconstitutionFixture();s.units.s11.steps=[{id:'restored',personnel:[]}];s.units.s11.removed=null;
 s.units.s11.location='r1c1';s.units.s12.location='r1c1';s.units.s11.fire='r2c1';s.units.s12.fire='r2c1';
 const r=submitCommand(s,{type:'CEASE_FIRE',unit_id:'s11',issuer_id:'s11'});
 expect(r.accepted).toBe(true);expect(r.state.units.s11.fire).toBeNull();expect(r.state.units.s12.fire).toBeNull();
 expect(r.events.find(e=>e.type==='FIRE_ORDER_RESULT').affected).toEqual(['s11','s12']);
});
it('shows multi-card PDF paths, receiving-card all-pinned VOF, and excludes same-card self fire',()=>{
 const s=createMission(companyAssault,'paths');s.units.s11.location='r1c1';s.units.s11.pinned=true;
 const e={...structuredClone(s.units.s21),id:'enemy-test',name:'German test squad',faction:'enemy',location:'r3c1'};s.units[e.id]=e;s.knowledge.spotted[e.id]=true;
 s.units.s11.fire='r3c1';refresh(s);
 const view=getPlayerView(s);const path=pdfPaths(view).find(p=>p.origin==='r1c1'&&p.target==='r3c1');
 expect(path.cards).toEqual(['r1c1','r2c1','r3c1']);
 expect(fireMarkers(view,view.locations.find(l=>l.id==='r3c1'))[0].label).toContain('All Pinned');
 e.location='r1c1';refresh(s);expect(incoming(s,s.units.s11).some(f=>f.source==='s11')).toBe(false);
});
it('does not identify an unspotted PDF source in the player path projection',()=>{
 const s=createMission(companyAssault,'hidden-path');s.units.s11.location='r1c1';
 const e={...structuredClone(s.units.s21),id:'hidden-enemy',name:'Secret enemy',faction:'enemy',location:'r3c1',fire:'r1c1'};s.units[e.id]=e;refresh(s);
 const view=getPlayerView(s),paths=pdfPaths(view);
 expect(JSON.stringify(paths)).not.toContain('Secret enemy');
 expect(paths.filter(p=>p.origin==='r3c1').every(p=>p.side==='unknown')).toBe(true);
});
