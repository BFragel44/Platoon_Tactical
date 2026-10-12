import {it,expect} from 'vitest';
import {orderConsequences} from '../src/ui/orderPresentation.js';
import {hqEventExplanation} from '../src/ui/hqEventPresentation.js';
it('explains both equipment-transfer recipients without hidden state or mutation',()=>{
 const unit={id:'receiver',name:'Receiver',radios:['CO']},view={units:[unit,{id:'donor',name:'Donor'}]},before=structuredClone(view),option={type:'TRANSFER_EQUIPMENT',available:true};
 const text=orderConsequences(view,unit,option,'transfer:donor:RADIO:CO','normandy').join(' ');expect(text).toContain('Receiver and Donor');expect(text).toContain('exposed until cleanup');expect(view).toEqual(before);expect(orderConsequences(view,unit,option,'transfer:hidden:RADIO:CO','normandy')).toEqual([]);expect(orderConsequences(view,unit,{...option,available:false},'transfer:donor:RADIO:CO','normandy')).toEqual([]);
});
it('warns about Normandy CO radios under cover without claiming all communications fail',()=>{
 const unit={name:'HQ',radios:['CO']},v={units:[unit]},option={type:'ENTER_COVER',available:true,targets:[{id:'cover'}]};
 expect(orderConsequences(v,unit,option,'cover','normandy')[0]).toContain('Same-area voice');expect(orderConsequences(v,unit,option,'open','normandy')).toEqual([]);expect(orderConsequences(v,unit,option,'cover','kutf')).toEqual([]);expect(orderConsequences(v,{...unit,radios:['ARTY']},option,'cover','normandy')).toEqual([]);
});
it('advance prose never directs a unit beyond the final mission row',()=>{
 for(const final of [3,4,5])for(const code of ['ADVANCE','ADVANCE_PC']){
 expect(hqEventExplanation({code,lead:final,final_row:final})).toContain('ignore');expect(hqEventExplanation({code,lead:final,final_row:final})).not.toContain(`Row ${final+1}`);expect(hqEventExplanation({code,lead:final-1,final_row:final})).toContain(`Row ${final}`);
 }
});

it('separates active and historical formation inspection without deleting or disabling selections',async()=>{
 const {formationSelectionOptions}=await import('../src/ui/orderPresentation.js');const units=[{id:'dead',name:'Lost squad',steps:0,removed:'CASUALTY'},{id:'ready',name:'Ready <HQ>',steps:1,tactical_ready:true},{id:'idle',name:'Pinned squad',steps:2},{id:'offmap',name:'Not assigned',steps:1,removed:'NOT_DEPLOYED'}],before=structuredClone(units);
 const html=formationSelectionOptions(units,'dead');expect(html).toContain('Active formations');expect(html).toContain('Off-map or historical formations');expect(html.indexOf('value="ready"')).toBeLessThan(html.indexOf('value="idle"'));expect(html).toContain('value="dead" selected');expect(html).toContain('Ready &lt;HQ&gt;');expect(html).not.toContain('disabled');expect(units).toEqual(before);
});

it('explains excluded LATs, pinning and exposure using friendly player-view data only',async()=>{
 const {groupMovementExclusions}=await import('../src/ui/orderPresentation.js');const h={id:'hq',name:'HQ',faction:'friendly',steps:1,platoon:1,location:'a',cohesion:'GOOD'},v={units:[h,{...h,id:'lat',name:'Assault team',cohesion:'A'},{...h,id:'pin',name:'Pinned squad',pinned:true},{...h,id:'exposed',name:'Exposed squad',exposed:true},{...h,id:'enemy',name:'Secret',faction:'enemy'},{...h,id:'removed',removed:'CASUALTY'}]},o={type:'PLATOON_MOVE',available:true,targets:[{id:'b',moving_unit_ids:['hq']}]},before=structuredClone(v);
 const result=groupMovementExclusions(v,h,o,'b');expect(result).toHaveLength(3);expect(result[0].reason).toContain('individual movement');expect(result[1].reason).toContain('Pinned');expect(result[2].reason).toContain('exposed');expect(JSON.stringify(result)).not.toContain('Secret');expect(v).toEqual(before);expect(groupMovementExclusions(v,h,o,'')).toEqual([]);expect(groupMovementExclusions(v,h,{...o,available:false},'b')).toEqual([]);
});
