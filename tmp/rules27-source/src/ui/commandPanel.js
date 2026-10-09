const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function linkStyle(channels){
 const voice=channels.includes('Visual / verbal'),radio=channels.some(c=>c.includes('radio'));
 return voice&&radio?'both':channels.some(c=>c.includes('phone'))?'phone':radio?'radio':voice?'voice':channels.length?'mission':'unavailable';
}
export function commandLinkGroups(view,selected){
 const links=view.command_network??[],units=new Map(view.units.map(u=>[u.id,u])),selectedParent=links.find(l=>l.unit_id===selected)?.parent_id;
 const selectedUnit=units.get(selected),branchRoot=selectedUnit?.kind==='HQ'?selected:selectedParent;
 const ancestors=new Set();let cursor=selected;
 while(cursor&&!ancestors.has(cursor)){ancestors.add(cursor);cursor=links.find(l=>l.unit_id===cursor)?.parent_id;}
 const groups=new Map();
 for(const link of links){
  const from=units.get(link.parent_id),to=units.get(link.unit_id);if(!from||!to||!from.steps||from.removed||!to.steps||to.removed)continue;
  const style=linkStyle(link.channels),key=`${from.location}|${to.location}|${style}`;
  if(!groups.has(key))groups.set(key,{from:from.location,to:to.location,style,labels:[],selected:false});
  const group=groups.get(key);group.labels.push(`${from.name} → ${to.name}: ${link.channels.join(' + ')||link.reason}`);
  group.selected ||= selectedUnit?.command_role==='company_commander'||ancestors.has(to.id)||from.id===branchRoot;
 }
 return [...groups.values()];
}
export function drawCommandLinks(root,view,{enabled,selected,zoom,mapPoint}){
 const svg=root.querySelector('#command-link-overlay'),layer=root.querySelector('.map-layer');if(!svg||!layer)return;
 svg.innerHTML='';svg.toggleAttribute('hidden',!enabled);if(!enabled)return;
 svg.setAttribute('width',layer.offsetWidth);svg.setAttribute('height',layer.offsetHeight);svg.setAttribute('viewBox',`0 0 ${layer.offsetWidth} ${layer.offsetHeight}`);
 const frame=layer.getBoundingClientRect(),labels={voice:'Sight / sound',radio:'Radio',both:'Sight / sound + radio',phone:'Field phone',mission:'Mission link',unavailable:'No contact'},slots=new Map();
 svg.innerHTML=commandLinkGroups(view,selected).map(g=>{
  const a=root.querySelector(`[data-location="${g.from}"]`),b=root.querySelector(`[data-location="${g.to}"]`);if(!a||!b)return '';
  const [x,y]=mapPoint(a.getBoundingClientRect(),frame,zoom),[tx,ty]=mapPoint(b.getBoundingClientRect(),frame,zoom);
  const key=`${g.from}|${g.to}`,slot=slots.get(key)??0;slots.set(key,slot+1);
  const same=g.from===g.to,offset=slot*22,midX=(x+tx)/2,midY=(y+ty)/2-offset;
  const path=same?`M ${x-32} ${y-20-offset} Q ${x} ${y-72-offset} ${x+32} ${y-20-offset}`:`M ${x} ${y} Q ${midX} ${midY-20} ${tx} ${ty}`;
  return `<g class="command-link ${g.style} ${g.selected?'emphasized':''}" tabindex="0" role="img" aria-label="${esc(g.labels.join('; '))}"><title>${esc(g.labels.join('\n'))}</title><path d="${path}"/><text x="${midX}" y="${same?y-52-offset:midY-12}" text-anchor="middle">${esc(labels[g.style])}${g.labels.length>1?` ×${g.labels.length}`:''}</text></g>`;
 }).join('');
}
export const commandLegend='<div class="command-link-legend"><span class="voice">Sight / sound</span><span class="radio">Radio</span><span class="both">Both</span><span class="phone">Field phone</span><span class="unavailable">No contact</span><span>Mission link = scenario communications</span></div>';
