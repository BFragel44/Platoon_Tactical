import {describe,it,expect} from 'vitest';
import {auditNcmCalculations} from '../scripts/auditNcmCalculations.js';

describe('printed rulebook NCM examples',()=>{
 const examples=auditNcmCalculations().results.filter(r=>r.id.startsWith('printed-'));
 it('includes the printed worked examples',()=>{expect(examples.length).toBeGreaterThanOrEqual(8);});
 for(const example of examples)it(`${example.id}: ${example.rule}`,()=>{
  expect(example.observed).toMatchObject(example.expected);
 });
});
