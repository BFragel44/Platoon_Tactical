import {it,expect} from 'vitest';
import {hill192} from '../src/scenarios/hill192.js';
import {createMission} from '../src/sim/company/engine.js';
import {orderReason,submitCommand} from '../src/sim/company/actions.js';
import {borders,DIRECTIONS} from '../src/sim/company/terrain.js';
const command={type:'RIFLE_GRENADE',unit_id:'s13',issuer_id:'general',target_id:'enemy'};
function fixture(){
 const s=createMission(hill192,'rifle-pdf');for(const l of Object.values(s.locations))Object.assign(l,{elevation:1,borders:borders(DIRECTIONS)});
 for(const u of Object.values(s.units))u.removed='RESERVE';const u=s.units.s13;Object.assign(u,{location:'r3c2',cover:null,removed:null,fire:'r3c1'});u.assets.rifle_grenade=1;
 s.units.enemy={...structuredClone(s.units.s11),id:'enemy',faction:'enemy',location:'r3c1',removed:null,cover:null,fire:null};s.knowledge.spotted.enemy={id:'enemy'};
 s.impulse={id:'test',hq:'general',commands:2,spent:0};return s;
}
it('does not treat a friendly same-card weapon target as a conflicting PDF',()=>{
 const s=fixture();Object.assign(s.units.at2,{removed:null,location:'r3c2',cover:null,fire:'r3c2'});
 expect(orderReason(s,command)).toBeNull();const n=submitCommand(s,command);expect(n.accepted).toBe(true);expect(n.state.units.s13.assets.rifle_grenade).toBe(0);expect(s.units.s13.assets.rifle_grenade).toBe(1);
});
it('allows any established direction when the card has multiple PDFs',()=>{
 const s=fixture();Object.assign(s.units.s12,{removed:null,location:'r3c2',cover:null,fire:'r4c2'});expect(orderReason(s,command)).toBeNull();
});
it('rejects attacks outside all existing directions',()=>{
 const s=fixture();s.units.s13.fire='r4c2';expect(orderReason(s,command)).toContain('existing direction');
});
it('compares directions rather than requiring the same target distance',()=>{
 const s=fixture();s.units.s13.fire=null;Object.assign(s.units.mg1,{removed:null,location:'r3c2',cover:null,fire:'r3c0',range:3,basic_range:3});
 expect(orderReason(s,command)).toBeNull();
});
