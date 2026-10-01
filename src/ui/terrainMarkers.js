const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function terrainMarkers(location,contact,objectives={}){
 const goals=Object.entries(objectives??{}).filter(([,o])=>o.location===location.id);
 if(!contact&&!goals.length)return '';
 return `<div class="terrain-mission-markers" aria-label="Contacts and mission objectives">${contact?`<div class="potential-contact-counter" role="img" aria-label="Potential contact ${esc(contact.type)}"><span>Potential<br>Contact</span><strong>${esc(contact.type)}</strong></div>`:'<div class="contact-marker-space" aria-hidden="true"></div>'}<div class="objective-counters">${goals.map(([key,o])=>{
 const kind=['primary','secondary','attack','ccp'].includes(key)?key:'other';
 const title=({primary:'Primary objective',secondary:'Secondary objective',attack:'Attack position',ccp:'Casualty collection point'})[kind]??key;
 return `<div class="objective-marker ${kind}" role="img" aria-label="${esc(title)}${o.secured?' · secured':o.cleared?' · cleared':''}"><div class="objective-face">${kind==='primary'||kind==='secondary'?`<span>${kind==='primary'?'Primary':'Secondary'}</span><strong>OBJ</strong>`:`<strong>${kind==='attack'?'ATTACK':kind==='ccp'?'CCP':esc(key.toUpperCase())}</strong>`}</div>${o.secured||o.cleared?`<small>${o.secured?'Secured':'Cleared'}</small>`:''}</div>`;
 }).join('')}</div></div>`;
}
