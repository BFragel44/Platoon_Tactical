import {it,expect} from 'vitest';
import {previewMissionSetup} from '../src/sim/company/engine.js';
import {keepUpTheFire} from '../src/scenarios/keepUpTheFire.js';
import {equipmentAllocation,equipmentSummaryMarkup} from '../src/ui/setupEquipment.js';
import {setupMarkup} from '../src/ui/missionSetup.js';

it('shows published limits and fully allocated defaults without changing the preview',()=>{
 const p=previewMissionSetup(keepUpTheFire,'kut-1'),before=structuredClone(p),a=equipmentAllocation(p.units);
 expect(a.totals).toEqual({smoke:4,wp:4,rifle_grenade:3});expect(a.remaining).toEqual({smoke:0,wp:0,rifle_grenade:0});expect(a.issues).toEqual([]);
 expect(a.groups.slice(0,3).map(g=>g.rifleRemaining)).toEqual([0,0,0]);expect(setupMarkup(p)).toContain('Equipment allocation summary');expect(p).toEqual(before);
});
it('updates shared supply and platoon-specific availability directly from unsaved form edits',()=>{
 const p=previewMissionSetup(keepUpTheFire,'kut-1');const edits={'asset-s11-smoke':'0','asset-s12-rifle_grenade':'0'};
 const a=equipmentAllocation(p.units,key=>edits[key]);expect(a.remaining.smoke).toBe(1);expect(a.remaining.rifle_grenade).toBe(1);
 for(const g of a.groups)expect(g.available.smoke).toBe(1);
 expect(a.groups.map(g=>g.available.rifle_grenade)).toEqual([1,0,0,0]);expect(a.groups[0].units.find(u=>u.id==='s11').available).toEqual({smoke:1,wp:0,rifle_grenade:1});
 const moved=equipmentAllocation(p.units,key=>({'platoon-mg1':'2','asset-mg1-rifle_grenade':'1','asset-s12-rifle_grenade':'0'})[key]);
 expect(moved.issues).toContain('Platoon 2: only one rifle grenade may be allocated.');expect(moved.groups[0].rifleRemaining).toBe(1);
});
it('includes radios in capacity and reports invalid or excessive quantities without inflating availability',()=>{
 const unit={id:'u',name:'Observer',steps:1,platoon:null,radios:['BN'],assets:{smoke:3,wp:2,rifle_grenade:0}};
 const a=equipmentAllocation([unit]);expect(a.groups[3].units[0].space).toBe(0);expect(a.groups[3].units[0].available).toEqual({smoke:1,wp:2,rifle_grenade:0});
 const over=equipmentAllocation([unit],key=>key==='asset-u-smoke'?'5':undefined);expect(over.remaining.smoke).toBe(-1);expect(equipmentSummaryMarkup(over)).toContain('1 over limit');expect(over.issues.join(' ')).toContain('carrying capacity exceeded');
 const invalid=equipmentAllocation([unit],key=>key==='asset-u-smoke'?'-1':undefined);expect(invalid.remaining.smoke).toBe(4);expect(invalid.issues.join(' ')).toContain('non-negative whole number');
});
