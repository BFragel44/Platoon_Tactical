import {it,expect} from 'vitest';
import {showVehicleOrders} from '../src/ui/vireControls.js';
it('never replaces mutual combat resolution with a remembered vehicle selection',()=>{
 expect(showVehicleOrders({phase:'COMBAT_EFFECTS'},'jeep')).toBe(false);
 expect(showVehicleOrders({phase:'COMBAT_EFFECTS'},null)).toBe(false);
 expect(showVehicleOrders({phase:'COMBAT_EFFECTS',pending_event:{code:'TANK_SUPPORT'}},'tank')).toBe(false);
});
it('retains vehicle actions during vehicle combat and selected vehicle command impulses',()=>{
 expect(showVehicleOrders({phase:'AT_COMBAT'},null)).toBe(true);
 expect(showVehicleOrders({phase:'CO_ACTIVATION'},'jeep')).toBe(true);
 expect(showVehicleOrders({phase:'CO_ACTIVATION'},null)).toBe(false);
});
