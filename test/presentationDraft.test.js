import {it,expect} from 'vitest';
import {restorePresentationDraft} from '../src/ui/presentationDraft.js';
it('restores pending form choices only for the same tactical context without dispatching actions',()=>{
 const fields={'#guard':{tagName:'SELECT',value:'F'},'#battalion':{tagName:'SELECT',value:'ordinary'},'#passengers':{tagName:'SELECT',options:[{value:'a',selected:false},{value:'b',selected:true}]},'#check':{tagName:'INPUT',checked:false}},root={querySelector:key=>fields[key]},draft={context:'attempt-2:phase-3.6',fields:[{selector:'#guard',value:'A'},{selector:'#battalion',value:'adjacent'},{selector:'#passengers',values:['a']},{selector:'#check',type:'checkbox',checked:true}]};
 restorePresentationDraft(root,draft,'attempt-1:phase-3.6');expect(fields['#guard'].value).toBe('F');
 restorePresentationDraft(root,draft,draft.context);expect(fields['#guard'].value).toBe('A');expect(fields['#battalion'].value).toBe('adjacent');expect(fields['#passengers'].options.map(o=>o.selected)).toEqual([true,false]);expect(fields['#check'].checked).toBe(true);
});
it('ignores missing and malformed optional historical presentation fields',()=>{
 const root={querySelector:key=>{if(key==='[')throw new Error('Invalid selector');return key==='button'?{tagName:'BUTTON',value:'original'}:null;}};
 expect(()=>restorePresentationDraft(root,{context:'same',fields:[null,{selector:'['},{selector:'button',value:'bad'},{selector:'#absent'}]},'same')).not.toThrow();
 expect(()=>restorePresentationDraft(root,{context:'same',fields:{}},'same')).not.toThrow();
});
