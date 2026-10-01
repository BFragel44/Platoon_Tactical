import manifest from './coverManifest.json';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const signed=n=>`${n>=0?'+':''}${n}`;
const visibleCovers=l=>(l.covers??[]).filter(c=>c.known!==false);
const position=(l,c)=>`C${visibleCovers(l).findIndex(x=>x.id===c.id)+1}`;
function icon(c){
 const entry=manifest.counters[`${c.type}:${c.value}`];
 if(!entry)return '<span class="cover-symbol" aria-hidden="true">▰</span>';
 const sheet=manifest.sheets[entry.sheet], [x,y,w,h]=entry.rect, scale=36/Math.max(w,h);
 return `<span class="cover-art" aria-hidden="true" style="width:${w*scale}px;height:${h*scale}px;background-image:url('${sheet.file}');background-size:${sheet.width*scale}px ${sheet.height*scale}px;background-position:-${x*scale}px -${y*scale}px"></span>`;
}
export function formationCover(l,u){
 if(l.known===false)return '';
 if(l.staging)return '<span class="unit-cover terrain-only">Staging · no terrain cover</span>';
 const c=visibleCovers(l).find(c=>c.id===u.cover);
 if(!c)return `<span class="unit-cover terrain-only">Terrain only · level ${l.elevation}</span>`;
 return `<span class="unit-cover">${icon(c)}<span><b>${position(l,c)} · ${esc(c.type)}</b><small>Cover ${signed(c.value)} · level ${l.elevation+(c.elevation??0)}${u.exposed?' · still exposed':''}</small></span></span>`;
}
function fullTerrainInformation(l){
 if(l.known===false)return ''; 
 if(l.staging)return '<p class="terrain-meta">Safe staging / casualty evacuation</p>';
 const hills=l.hills?.length??Math.max(0,l.elevation-1);
 const covers=visibleCovers(l),used=covers.filter(c=>!c.parent&&(c.discovered===true||c.discovered===undefined&&c.type==='Cover')).length;
 const dual=l.open_protection!==undefined&&l.open_protection!==l.protection;
 const white=Object.entries(l.borders??{}).filter(([,v])=>v==='white').map(([d])=>d);
 return `<section class="terrain-facts" aria-label="Terrain information">
 <span title="Terrain protection always applies; occupied cover is additional."><b>C&amp;C</b> ${signed(l.protection)}${dual?` dark / ${signed(l.open_protection)} white`:''}</span>
 <span><b>Elevation</b> ${l.elevation}${hills?` · ${hills} hill${hills===1?'':'s'}`:''}</span>
 <span title="Base draw allowance, before experience and other modifiers."><b>Seek cover</b> ${l.cover_draw} draws</span>
 <span title="Upper stories and enemy fortifications do not use discovery slots."><b>Discovered</b> ${used}/${l.cover_limit}</span>
 <span title="Applies to Incoming fire and on-map mortar indirect lay, not ordinary direct fire."><b>Burst</b> ${signed(l.burst??0)}</span>
 <span><b>Cover type</b> ${l.building?'Building / rubble':'Basic +1'}</span>
 ${l.multi_story?'<span class="terrain-feature">Multi-story · upper level +1</span>':''}${l.tower?'<span class="terrain-feature">Church tower · +1 level · 1 step</span>':''}
 <span class="terrain-border-key"><b>LOS</b> ${white.length===8?'All white':white.length?`White ${white.join(', ')}; other edges dark`:'All dark'} · adjacent cards visible unless screened</span>
 ${l.trafficability?`<span class="terrain-rule-note">Vehicle icon: ${esc(l.trafficability)} · reference only; vehicles deferred.</span>`:''}
 ${dual?'<span class="terrain-rule-note">Any fire across a dark border uses higher C&amp;C; same-card and indirect fire use lower.</span>':''}
 ${l.smoke?`<span class="terrain-screen">Smoke ${signed(l.smoke_value??2)} · LOS into this card only; point blank remains.</span>`:''}
 </section>`;
}
export function coverPositions(l){
 if(l.known===false||l.staging)return '';
 const covers=visibleCovers(l);
 if(!covers.length)return ''; 
 return `<div class="cover-positions" aria-label="Known cover positions">${covers.map(c=>`<div class="cover-position">${icon(c)}<span><b>${position(l,c)} · ${esc(c.type)} ${signed(c.value)}</b><small>Level ${l.elevation+(c.elevation??0)} · ${c.capacity?`${c.capacity}-step capacity`:'no step limit'}${c.parent?` · above ${position(l,covers.find(p=>p.id===c.parent)??c)}`:''}${c.arc?` · fires ${esc(({ '1,0':'N','-1,0':'S','0,1':'E','0,-1':'W','1,1':'NE','1,-1':'NW','-1,1':'SE','-1,-1':'SW'})[c.arc.join(',')]??c.arc.join(','))} only; no point-blank fire`:''}</small></span></div>`).join('')}<small class="cover-rule-note">Cover adds to terrain protection. Seeking cover does not remove exposure.</small></div>`;
}

export function terrainInformation(l,explanation=''){
 if(l.known===false)return '';
 if(l.staging)return '<p class="terrain-meta">Safe staging / casualty evacuation</p>';
 const used=visibleCovers(l).filter(c=>!c.parent&&(c.discovered===true||c.discovered===undefined&&c.type==='Cover')).length;
 return `<section class="terrain-quick" aria-label="Terrain information"><span title="Base draw allowance, before experience modifiers."><b>Seek cover</b> ${l.cover_draw} draws</span><span title="Upper stories and fortifications do not use discovery slots."><b>Discovered</b> ${used}/${l.cover_limit}</span><span><b>Cover type</b> ${l.building?'Building / rubble':'Basic +1'}</span></section><div class="terrain-features">${l.multi_story?'<span title="Upper stories add one elevation level.">Multi-story</span>':''}${l.tower?'<span title="Church tower: one step; one level higher.">Tower</span>':''}${l.smoke?`<span>Smoke ${signed(l.smoke_value??2)}</span>`:''}</div><details class="terrain-inspector"><summary>Terrain details</summary>${fullTerrainInformation(l)}${explanation?`<p class="los-explanation">${esc(explanation)}</p>`:''}</details>`;
}
export function terrainFooter(l){
 if(l.known===false||l.staging)return '';
 const vehicle=({Slow:'SLOW',No:'NO',slow:'SLOW',no:'NO'})[l.trafficability];
 return `<footer class="terrain-footer"><span title="Applies to Incoming and on-map mortar indirect fire.">Burst ${signed(l.burst??0)}</span>${vehicle?`<b title="Vehicle trafficability reference; vehicles remain deferred.">${vehicle}</b>`:''}</footer>`;
}
export function hillStack(l){
 if(l.known===false||l.staging)return '';
 const count=l.hills?.length??Math.max(0,l.elevation-1);
 return count?`<div class="hill-stack" aria-label="${count} hill overlays; total elevation ${l.elevation}">${Array.from({length:count},(_,i)=>`<div class="hill-strip"><b>Hill +1</b><span aria-hidden="true"></span><small>Level ${i+2}</small></div>`).join('')}</div>`:'';
}
