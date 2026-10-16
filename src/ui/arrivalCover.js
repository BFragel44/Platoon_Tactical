const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function arrivalCoverMarkup(covers,label,platoon=false){
 if(!covers.length)return '';
 return `<label class="field">Arrive at destination<select id="arrival-cover" aria-label="Arrive at destination"><option value="open">Outside additional cover</option>${covers.map(c=>`<option value="${esc(c.id)}">${esc(label(c.id)??c.label)} - ${c.steps} steps already here</option>`).join('')}</select><small>Included in this movement order. More than three steps together are more vulnerable to grenades and incoming fire.${platoon?' Applies to every formation moving with this order.':''}</small></label>`;
}
