const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const finalFireMessage='Mission ended · final fire positions. These markers show historical state; no further combat is resolving.';
export function movementFireWarning(view,action,target) {
  if(!['MOVE','INFILTRATE','PLATOON_MOVE','PLATOON_INFILTRATE'].includes(action))return '';
  const fire=view.fire.filter(f=>!f.pdf_only&&f.friendly&&f.target===target&&f.origin!==target);
  if(!fire.length)return '';
  const names=[...new Set(fire.map(f=>view.units.find(u=>u.id===f.source)?.name??'Friendly source'))];
  return `Friendly fire danger: ${names.join(', ')} are firing into ${view.locations.find(l=>l.id===target)?.name??target}. Moving there does not make them cease fire.`;
}
export function markerSummary(marker) {
  if(marker.grenade)return `<span class="grenade-counter" role="img" aria-label="${esc(marker.label)}">${marker.art?`<img src="/markers/${marker.art}.png" alt="">`:''}<span class="grenade-value">${Number.isFinite(marker.value)?esc(marker.value):'?'}</span><span class="grenade-side">${esc(marker.side)}</span>${marker.critical?'<span class="grenade-critical">CRITICAL</span>':''}</span>`;
  return marker.art?`<img src="/markers/${marker.art}.png" alt="${esc(marker.label)}">`:`<span class="status-badge">${esc(marker.label)}</span>`;
}
