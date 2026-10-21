import {it,expect} from 'vitest';
import {deviceLabel,deviceText} from '../src/ui/deviceLabels.js';
import {supplyLabel} from '../src/ui/attemptSupplies.js';
import {inlineInventory} from '../src/ui/unitDetails.js';
it('names the CO phone consistently, including text from historical records',()=>{
 expect(deviceLabel('CO_PHONE')).toBe('EE8 field phone (CO TAC)');
 expect(deviceText('CO_PHONE radio')).toBe('EE8 field phone (CO TAC)');
 expect(deviceText('CO_PHONE → CO_PHONE')).toBe('EE8 field phone (CO TAC) → EE8 field phone (CO TAC)');
 expect(supplyLabel('RADIO','CO_PHONE')).toBe(deviceLabel('CO_PHONE'));
 expect(deviceLabel('BN')).toBe('BN TAC radio');
});
it('renders the readable phone name while preserving the internal key in unload controls',()=>{
 const html=inlineInventory({id:'co',inventory:{equipment:[],radios:['CO_PHONE'],casualties:[]},options:[{type:'DROP_LOAD',label:'Drop all carried items',available:true,cost:0}]});
 expect(html).toContain('EE8 field phone (CO TAC)');
 expect(html).not.toContain('CO_PHONE radio');
 expect(html).toContain('CO_PHONE'); // Control values must still address the saved device.
});
