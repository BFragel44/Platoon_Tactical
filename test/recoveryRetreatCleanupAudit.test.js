import {it,expect} from 'vitest';
import {auditRecoveryRetreatCleanup} from '../scripts/auditRecoveryRetreatCleanup.js';
const open=new Set(['retreat-empty-rear','retreat-rear-under-fire','retreat-rear-overstacked','retreat-cover-before-opponent-LOS','retreat-trench-exposure']);
const controls=auditRecoveryRetreatCleanup().results.filter(r=>!open.has(r.id));
it('covers the 32 documented passing controls',()=>expect(controls).toHaveLength(32));
for(const control of controls)it(`${control.id}: ${control.rule}`,()=>expect(control.observed).toEqual(control.expected));
