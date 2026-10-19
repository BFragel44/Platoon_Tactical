import {it,expect} from 'vitest';
import {auditCleanupLifecycle} from '../scripts/auditCleanupLifecycle.js';
const audit=auditCleanupLifecycle();
it('covers all 31 expanded lifecycle observations',()=>expect(audit.observations).toBe(31));
for(const control of audit.results)it(`${control.id}: ${control.rule}`,()=>expect(control.observed).toEqual(control.expected));
