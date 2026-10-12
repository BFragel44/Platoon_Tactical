// Form drafts are presentation only. Restoring them never dispatches an order.
export function capturePresentationDraft(root,context){
 const fields=[];
 for(const e of root.querySelectorAll('input,select')){
  if(['unit','action','target','issuer','recap-dialogs','show-historical','command-links'].includes(e.id))continue;
  const data=['data-detach-radio','data-detach-asset','data-detach-ammo','data-contributor'].find(key=>e.hasAttribute(key));
  const selector=e.id?`#${CSS.escape(e.id)}`:data?`[${data}="${CSS.escape(e.getAttribute(data))}"]`:null;
  if(selector)fields.push({selector,type:e.type,values:e.multiple?[...e.selectedOptions].map(o=>o.value):null,value:e.value,checked:e.checked});
 }
 return {context,fields};
}
export function restorePresentationDraft(root,draft,context){
 if(!draft||draft.context!==context)return;
 if(!Array.isArray(draft.fields))return;
 for(const f of draft.fields){
  if(!f||typeof f.selector!=='string')continue;
  let e;try{e=root.querySelector(f.selector);}catch{continue;}
  if(!e||!['INPUT','SELECT'].includes(e.tagName))continue;
  if(Array.isArray(f.values)&&e.options)for(const o of e.options)o.selected=f.values.includes(o.value);
  else if(f.type==='checkbox')e.checked=!!f.checked;
  else if(typeof f.value==='string')e.value=f.value;
 }
}
