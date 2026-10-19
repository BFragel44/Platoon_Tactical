import {it,expect} from 'vitest';
import {preparationMapControls,deploymentMapMarkup} from '../src/ui/commandDesk.js';

it.each([2,3])('shows current patrol %s controls without stale generic objectives',patrol=>{
 const source={objectives:{primary:{location:'r4c3'},secondary:{location:'r4c3'},attack:{location:'r2c3'},ccp:{location:'r1c2'}},phase_lines:{1:2,2:3},patrol:{platoon:patrol,primary:'r4c4',cop:'r2c3',ccp:'r1c1',concentration:'r4c2',route:['r2c2','r3c2','r4c4','r3c3']}},before=structuredClone(source);
 const controls=preparationMapControls(source);
 expect(controls.phaseLines).toEqual({1:2,2:3});expect(controls.mlr).toEqual([1,2]);
 expect(controls.objectives).toEqual({primary:{location:'r4c4'},cop:{location:'r2c3'},ccp:{location:'r1c1'},concentration:{location:'r4c2'},'Route 1':{location:'r2c2'},'Route 2':{location:'r3c2'},'Route 3':{location:'r4c4'},'Route 4':{location:'r3c3'}});
 const locations=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>({id:`r${i+1}c${j+1}`,row:i+1,col:j+1,known:false,name:'Concealed terrain'}))).flat();
 const html=deploymentMapMarkup({locations,...controls});
 for(const label of ['Phase Line 1','Phase Line 2','MLR','Primary','Outpost','CCP','Concentration','Route 1','Route 2','Route 3','Route 4'])expect(html).toContain(label);
 expect(html).not.toContain('Secondary');expect(html).not.toContain('Attack');expect(html).not.toContain('Concealed terrain');expect(source).toEqual(before);
});
it('keeps normal reattempt objectives and does not invent a patrol MLR',()=>{
 const input={objectives:{primary:{location:'r4c2'},secondary:{location:'r4c3'},attack:{location:'r3c2'}},phase_lines:{1:1,2:2}};
 expect(preparationMapControls(input)).toEqual({objectives:input.objectives,phaseLines:input.phase_lines,mlr:null});
});
