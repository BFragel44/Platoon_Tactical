const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function terrainMarkers(location,contact,objectives={}){
 const contacts=Array.isArray(contact)?contact:contact?[contact]:[];
 const goals=Object.entries(objectives??{}).filter(([,o])=>o.location===location.id);
 if(!contacts.length&&!goals.length)return '';
 return `<div class="terrain-mission-markers" aria-label="Contacts and mission objectives">${contacts.length?contacts.map(contact=>`<div class="potential-contact-counter ${contact.type==='?'?'question-side':''}" role="img" aria-label="Potential contact ${contact.type==='?'?'unknown letter':esc(contact.type)}"><span>Potential<br>Contact</span><strong>${esc(contact.type)}</strong></div>`).join(''):'<div class="contact-marker-space" aria-hidden="true"></div>'}<div class="objective-counters">${goals.map(([key,o])=>{
 const kind=['primary','secondary','attack','ccp','concentration','cop'].includes(key)?key:/^route [1-4]$/.test(key)?'route':'other';
 if(kind==='route'&&o.completed)return `<span class="route-completed" role="img" aria-label="${esc(key)} reached in sequence">✓ ${esc(key.replace('route','Route'))} reached</span>`;
 const title=({primary:'Primary objective',secondary:'Secondary objective',attack:'Attack position',ccp:'Casualty collection point',cop:'Combat Outpost'})[kind]??key;
 return `<div class="objective-marker ${kind}" role="img" aria-label="${esc(title)}${o.secured?' · secured':o.cleared?' · cleared':''}"><div class="objective-face">${kind==='primary'||kind==='secondary'?`<span>${kind==='primary'?'Primary':'Secondary'}</span><strong>OBJ</strong>`:`<strong>${kind==='attack'?'ATTACK':kind==='ccp'?'CCP':kind==='cop'?'Combat<br>Outpost':kind==='route'?`ROUTE<br>${esc(key.split(' ')[1])}`:esc(key.toUpperCase())}</strong>`}</div>${o.secured||o.cleared?`<small>${o.secured?'Secured':'Cleared'}</small>`:''}</div>`;
 }).join('')}</div></div>`;
}
