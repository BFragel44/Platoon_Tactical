import {it,expect} from 'vitest';
import {vehicleCounterLabel,vehicleAmmoMarkup} from '../src/ui/virePresentation.js';
it('shows remaining and spent tank ammunition using the infantry square markers',()=>{
 const html=vehicleAmmoMarkup({profile:'M4_SHERMAN75',ammo:4},6);
 expect(html.match(/ammo-square ready/g)).toHaveLength(4);
 expect(html.match(/ammo-square spent/g)).toHaveLength(2);
 expect(html).toContain('4 remaining');
 expect(vehicleAmmoMarkup({profile:'M4_SHERMAN75',ammo:null},6)).toBe('');
 expect(vehicleAmmoMarkup({profile:'JEEP',ammo:0},0)).toBe('');
});
it('uses readable compact labels for Jeeps and tank HQs',()=>{
 expect(vehicleCounterLabel({id:'company_jeep',profile:'JEEP',name:'Artillery Jeep'})).toBe('Jeep');
 expect(vehicleCounterLabel({id:'sherman_hq',profile:'M4_SHERMAN75'})).toBe('M4 HQ');
 expect(vehicleCounterLabel({id:'sherman_2',profile:'M4_SHERMAN75'})).toBe('M4 2');
 expect(vehicleCounterLabel({id:'m5_hq',profile:'M5_LIGHT37'})).toBe('M5 HQ');
});
