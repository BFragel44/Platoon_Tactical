import {it,expect} from 'vitest';
import {auditCasualtyEquipment} from '../scripts/auditCasualtyEquipment.js';

const controls=auditCasualtyEquipment().results.filter(r=>[
 'only-step-','casualty-position-','destroyed-device-pickup-',
 'two-casualties-','last-noncasualty-assets-',
 'forced-drop-at-current-cover','casualties-excluded-from-combat','incoming-wire-'
].some(prefix=>r.id.startsWith(prefix)));
it('covers the explicitly selected passing consequence controls',()=>{expect(controls).toHaveLength(26);});
for(const control of controls)it(`${control.id}: ${control.rule}`,()=>{expect(control.observed).toEqual(control.expected);});
