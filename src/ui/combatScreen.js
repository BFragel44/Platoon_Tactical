import {resultingFormationText} from './combatPlayback.js';
import {supportContext} from './orderPresentation.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sign=n=>`${n>=0?'+':''}${n}`;
const pct=n=>`${Math.round(n*100)}%`;
const counter=(kind,label)=>`<span class="combat-counter" role="img" aria-label="${esc(label)}">${esc(({SQUAD:'INF',LAT:'TEAM',STAFF:'HQ',MORTAR:'MTR',FO:'OBS'})[kind]??kind??'?')}</span>`;
export function reciprocalCombat(c,v){
 const source=c.strongest;
 if(!source?.known||!source.source_id||supportContext(source))return null;
 return (v.combat_resolutions??[]).find(r=>r.target_id===source.source_id&&r.target_faction!==c.target_faction&&r.sources.some(s=>s.known&&s.source_id===c.target_id))??null;
}
export const resolvesPair=(c,peer)=>!!peer&&peer.status==='PENDING'&&peer.visible_position===c.visible_position+1;
function stakes(r,hidden=false){
 return `<aside class="exchange-stakes"><h4>Incoming fire result</h4>${['MISS','PIN','HIT'].map(k=>`<div class="exchange-prob ${k.toLowerCase()}"><b>${k}</b><span><i style="width:${r?pct(r.probabilities.probabilities[k]):'0%'}"></i><strong>${r?pct(r.probabilities.probabilities[k]):hidden?'?':'—'}</strong></span></div>`).join('')}${r?`<details><summary>If HIT · ${esc(r.target_experience)}</summary><div class="hit-grid">${Object.entries(r.hit_probabilities.probabilities).map(([k,n])=>`<span>${esc(k)} ${pct(n)}</span>`).join('')}</div></details>`:`<small>${hidden?'Unspotted · stakes hidden':'No incoming resolution'}</small>`}</aside>`;
}
function result(r){
 if(!r||r.status!=='RESOLVED')return '';
 const hit=r.result==='HIT';
 return `<div class="exchange-result ${r.result.toLowerCase()}"><h4>${esc(r.result)}${hit?` · ${esc(r.hit_effect)}`:''}</h4><p>${hit?esc(resultingFormationText(r)):r.result==='MISS'?'No hit; pin removed.':'Formation pinned.'}${hit&&r.casualty_steps?` · ${r.casualty_steps} casualty step(s)`:''}</p></div>`;
}
function formation(r,context,name,template){
 const hidden=!r&&!context?.known&&!supportContext(context),support=!r&&supportContext(context);
 const title=r?.target_name??context?.label??'Unidentified fire';
 const loc=r?.target_location??context?.origin;
 const modifiers=r?.modifiers??template.modifiers;
 return `<article class="exchange-formation"><div class="combat-unit-head">${counter(r?.target_kind??(support?'SUP':context?.known?context.unit_kind:'?'),title)}<div><h3>${esc(title)}</h3><p>${esc(loc?name(loc):'Support effect')}${r?` · ${r.target_steps} steps · ${esc(r.target_experience)}`:''}</p></div><span class="combat-state">${hidden?'UNSPOTTED':support?'SUPPORT EFFECT':r?.target_pinned?'PINNED':r?esc(r.target_cohesion==='GOOD'?'EFFECTIVE':r.target_cohesion):'FIRING SOURCE'}</span></div>
 <div class="modifier-card"><h4>NCM MODIFIERS · RECEIVING FIRE</h4>${modifiers.map(m=>`<p class="${r&&m.value===0?'modifier-zero':''}"><span>${esc(!r&&m.source==='TERRAIN'?'Terrain protection':!r&&m.source==='COVER'?'Occupied cover':m.label)}</span><b>${r?sign(m.value):hidden?'?':'—'}</b></p>`).join('')}<p class="ncm-total"><span>NCM${r&&r.total!==r.ncm?` · raw ${sign(r.total)}, bounded`:''}</span><b>${r?sign(r.ncm):hidden?'?':'—'}</b></p></div>
 ${!r?`<p class="exchange-note">${hidden?'Identity, protection and combat consequences remain hidden.':support?'Support effect; no formation receiving fire here.':'This source has no reciprocal incoming-fire resolution.'}</p>`:''}
 ${r?.sources.filter(s=>s.known&&s.source_id!==r.strongest?.source_id).length?`<details class="exchange-contributors"><summary>Additional incoming sources</summary>${r.sources.filter(s=>s.known&&s.source_id!==r.strongest?.source_id).map(s=>`<p>${esc(s.label)}</p>`).join('')}</details>`:''}${result(r)}</article>`;
}
export function combatScreen(c,v,name){
 const peer=reciprocalCombat(c,v),context=c.strongest;
 // Keep Germans on the left and U.S. formations on the right for actual mutual fire.
 const left=peer?(c.target_faction==='enemy'?c:peer):null;
 const right=peer?(c.target_faction==='friendly'?c:peer):c;
 const leftContext=peer?null:context;
 const outgoing=peer?right.sources.find(s=>s.source_id===left.target_id):context;
 const returning=peer?left.sources.find(s=>s.source_id===right.target_id):null;
 const returnCardFire=!peer&&context?.origin&&(v.fire??[]).some(f=>f.source===c.target_id&&f.target===context.origin);
 const arrow=(s,reverse=false)=>`<div class="exchange-arrow ${reverse?'reverse':''} ${s?'active':'quiet'}"><span>${s?`${esc(s.label)} · VOF ${sign(s.vof??0)}`:reverse&&returnCardFire?'Established return fire at card':'No return fire'}</span><b aria-hidden="true">${reverse?'←':'→'}</b></div>`;
 return `<section class="combat-resolution combat-overlay symmetric-combat" role="region" aria-label="Combat resolution"><header><h2>Combat Resolution</h2><p>${esc(name(c.target_location))} · formation ${c.visible_position} of ${v.segment_progress?.visible_total??1} visible · frozen stakes</p></header>
 <div class="combat-exchange">${stakes(left,!peer&&!context?.known&&!supportContext(context))}${formation(left,leftContext,name,c)}<div class="exchange-directions" aria-label="Firing directions">${arrow(outgoing)}${arrow(returning,true)}</div>${formation(right,null,name,c)}${stakes(right)}</div>
 <footer>${c.status==='PENDING'?`<button id="combat-resolve" class="primary">${resolvesPair(c,peer)?'Resolve both formations':'Resolve '+esc(c.target_name)}</button>`:'<button id="combat-next" class="primary">Next combat →</button>'}<button id="combat-close">Close to tactical map</button></footer>
 ${peer&&!resolvesPair(c,peer)&&peer.status==='PENDING'?'<p class="exchange-note">The other formation resolves at its recorded queue position; its frozen stakes stay unchanged.</p>':''}</section>`;
}
