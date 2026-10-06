import {describe,it,expect} from 'vitest';
import {signalOrderLabel,turnNoticeMarkup} from '../src/ui/turnNotice.js';
describe('turn briefing presentation',()=>{
 it('counts friendly casualty steps including evacuation, without enemy losses or invented dispositions',()=>{
  const html=turnNoticeMarkup({turn:2,turn_limit:10,objectives:{primary:{location:'p',secured:true},secondary:{location:'s',secured:false},attack:{location:'a',secured:false}},casualties:[{faction:'friendly',evacuated:true},{faction:'friendly',evacuated:false},{faction:'enemy',evacuated:false}]},id=>id==='p'?'<Primary>':id);
  expect(html).toContain('2 casualty steps recorded · 1 evacuated');expect(html).toContain('&lt;Primary&gt; · Secured');expect(html).toContain('s · Not secured');expect(html).not.toMatch(/killed|wounded|enemy/i);
 });
 it('explains each offensive signal order in plain language',()=>{
  for(const code of ['CF','XPL1','XPL2','M2PO','INFAP2PO','M2SO','INFAP2SO','M2S'])expect(signalOrderLabel(code)).not.toBe('No assigned order');
  expect(signalOrderLabel('CF')).toBe('Cease fire');expect(signalOrderLabel('M2S')).toBe('Move to signal card');
 });
});
