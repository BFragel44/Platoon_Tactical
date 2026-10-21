import {it,expect} from 'vitest';
import {createMission,getPlayerView} from '../src/sim/company/engine.js';
import {applyHit,capture} from '../src/sim/company/combat.js';
import {spot} from '../src/sim/company/battlefield.js';
import {trevieres} from '../src/scenarios/trevieres.js';
import {enemyCasualtyMarkers} from '../src/ui/casualtyPresentation.js';
function fixture(observed=true){
 const s=createMission(trevieres,'enemy-casualty-visibility');
 const enemy={...structuredClone(s.units.s11),id:'enemy-test',name:'Spotted German squad',faction:'enemy',location:'r1c1',cover:null,steps:[{id:'enemy-step',personnel:[]}],removed:null};s.units[enemy.id]=enemy;
 if(observed)spot(s,enemy);applyHit(s,enemy,'C');return s;
}
it('shows observed enemy casualty steps separately from friendly losses without exposing personnel',()=>{
 const s=fixture(),before=structuredClone(s),view=getPlayerView(s),enemy=view.enemy_casualties[0];
 expect(view.enemy_casualties).toHaveLength(1);expect(enemy).toMatchObject({location:'r1c1',faction:'enemy',last_known:false,evacuated:false});
 expect(enemy).not.toHaveProperty('step');expect(enemy).not.toHaveProperty('personnel');expect(view.casualties).toEqual([]);
 const html=enemyCasualtyMarkers(view,view.locations.find(l=>l.id==='r1c1'));expect(html).toContain('Spotted German squad casualty step');expect(html).toContain('Uncaptured');expect(html).toContain('Mutual capture');expect(s).toEqual(before);
});
it('does not reveal casualty losses from an unspotted enemy formation',()=>{
 const view=getPlayerView(fixture(false));expect(view.enemy_casualties).toEqual([]);expect(enemyCasualtyMarkers(view,view.locations.find(l=>l.id==='r1c1'))).toBe('');
});
it('does not leak hidden enemy casualty transport or carrier identity',()=>{
 const s=fixture(),c=s.casualties[0];s.units.hiddenCarrier={...structuredClone(s.units.s12),id:'hiddenCarrier',name:'Secret enemy litter team',faction:'enemy',location:'r3c3'};
 c.carrier='hiddenCarrier';c.location='r3c3';c.cover='secret-cover';
 const enemy=getPlayerView(s).enemy_casualties[0];expect(enemy).toMatchObject({location:'r1c1',cover:null,last_known:true,carrier_name:null});
 expect(JSON.stringify(enemy)).not.toMatch(/secret-cover|hiddenCarrier|Secret enemy|r3c3/);
});
it('removes the map marker when the existing capture procedure captures the casualty',()=>{
 const s=fixture();s.units.s12.location='r1c1';s.units.s12.cover=null;capture(s);
 const view=getPlayerView(s);expect(s.events.some(e=>e.type==='ENEMY_CASUALTY_CAPTURED')).toBe(true);expect(view.enemy_casualties[0].evacuated).toBe(true);
 expect(enemyCasualtyMarkers(view,view.locations.find(l=>l.id==='r1c1'))).toBe('');
});
