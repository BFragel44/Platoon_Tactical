import {it,expect} from 'vitest';
import {vireControls} from '../src/ui/vireControls.js';
it('leaves accepted missions untouched and renders controls only for adapter states',()=>{
 expect(vireControls({})).toBe('');
 const s={knowledge:{spotted:{}},units:{},vire_runtime:{vehicles:{a:{id:'a',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',status:'ACTIVE',ammo:5},secret:{id:'secret',profile:'PAK40',faction:'enemy',location:'r4c4',status:'ACTIVE',ammo:4}},pending_hits:[],quick:{firer:'a',reaction:false},reaction:{actor:'a',eligible:['secret']}}};
 const html=vireControls(s);expect(html).toContain('Continue Quick Shot');expect(html).toContain('Decline Quick Shot');expect(html).toContain('Export vehicle replay');expect(html).not.toContain('secret');expect(html).not.toContain('r4c4');expect(html).not.toContain('PAK40');
});
it('labels the ordered group and offers a friendly reaction decision without exposing enemy candidates',()=>{
 const s={knowledge:{spotted:{}},units:{},vire_runtime:{vehicles:{a:{id:'a',profile:'M4_SHERMAN75',faction:'friendly',location:'r1c1',status:'ACTIVE',ammo:5}},pending_hits:[],coordinator:{entries:[{id:'a',group:'TANK',faction:'friendly',activated:true,moved_fired:false}],groups:['TANK','JEEP','AT'],group:0,next_side:'friendly',pending:null},reaction:{actor:'a',eligible:['a']}}};
 const html=vireControls(s);expect(html).toContain('Current group: TANK');expect(html).toContain('eligible friendly units: a');expect(html).toContain('Decline selected reaction');expect(html).not.toContain('Start vehicle phase');
});
