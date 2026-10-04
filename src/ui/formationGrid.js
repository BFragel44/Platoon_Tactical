import {formationLabel} from './unitDetails.js';
import {coverIcon} from './terrainPresentation.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const side=u=>u.cohesion==='GOOD'?(['HQ','STAFF'].includes(u.kind)?'Command':u.kind==='FO'?'Observer':'Good order'):({F:'Fire team',A:'Assault team',L:'Litter team',P:'Paralyzed'})[u.cohesion]??u.cohesion;
function label(u){
 if(u.kind==='LAT')return `${({A:'A',F:'F',L:'L',P:'P'})[u.cohesion]??'T'}${u.name.match(/\d+/)?.[0]??''}`;
 return formationLabel(u);
}
export function formationGrid(l,friendly,enemies,{selected,movingIds=new Set(),infiltrating=false}={}){
 const covers=l.known===false?[]:(l.covers??[]).filter(c=>c.known!==false);
 const units=[...friendly.map(u=>({...u,uiFriendly:true})),...enemies.map(u=>({...u,uiFriendly:false}))];
 const counter=u=>{
  const c=covers.find(c=>c.id===u.cover),pos=c?`C${covers.indexOf(c)+1}`:null;
  const details=[u.name,`${u.steps} step${u.steps===1?'':'s'} · ${side(u)} · ${u.experience??'Unknown'} experience`,u.pinned?'Pinned':null,u.exposed?'Exposed; seeking cover does not remove exposure':null,l.name,c?`${pos} · ${c.type} +${c.value} · level ${l.elevation+(c.elevation??0)}`:l.staging?'Staging; no terrain cover':`Terrain only · level ${l.elevation}`,u.uiFriendly?(u.tactical_ready?'Orders available':'Inspect; no available orders'):null,u.attempted?.length?`${u.attempted.length} attempted this impulse`:null,u.radios?.length?`${u.radios.join(' / ')} radio`:null,u.cohesion==='GOOD'&&['HQ','STAFF','FO'].includes(u.kind)?'No basic fire':u.cohesion==='F'&&['HQ','STAFF'].includes(u.kind)?'Command side unavailable':null,...(u.inventory?.equipment??[]).map(e=>`${e.label} × ${e.quantity}`),u.inventory?.casualties?.length?`${u.inventory.casualties.length} carried casualties`:null,u.transition_description,movingIds.has(u.id)?infiltrating?'Will attempt infiltration':'Will move with platoon':null].filter(Boolean).join('\n');
  const tag=u.uiFriendly?'button':'div';
  return `<${tag} ${u.uiFriendly?`type="button" data-unit="${esc(u.id)}"`:'tabindex="0" role="group"'} class="compact-unit ${u.uiFriendly?'friendly':'enemy'} ${u.id===selected?'selected':''} ${u.pinned?'pinned':''} ${u.uiFriendly?(u.tactical_ready?'order-ready':'inspect-only'):''}" data-unit-tooltip="${esc(details)}" aria-label="${esc(details)}"><span class="compact-unit-name">${esc(u.name)}</span><small>${u.steps} step${u.steps===1?'':'s'}${['HQ','STAFF','FO'].includes(u.kind)?` · ${side(u)}`:''}</small><strong>${esc(label(u))}</strong><span class="compact-unit-status">${u.pinned?'<span class="status-badge pin">PIN</span>':''}${u.exposed?'<span class="status-badge exposure">EXPOSED</span>':''}${movingIds.has(u.id)?'<span class="status-badge">↑ MOVE</span>':''}</span></${tag}>`;
 };
 const inTerrain=units.filter(u=>!covers.some(c=>c.id===u.cover));
 return `<div class="formation-groups">${inTerrain.length?`<div class="compact-unit-grid" aria-label="Formations outside additional cover">${inTerrain.map(counter).join('')}</div>`:''}${covers.map((c,i)=>`<section class="occupied-cover" aria-label="C${i+1} ${esc(c.type)}"><header tabindex="0" data-unit-tooltip="${esc(`${c.type} +${c.value} · level ${l.elevation+(c.elevation??0)}\n${c.capacity?`${c.capacity}-step capacity`:'No step limit'}${c.parent?` · above C${covers.findIndex(p=>p.id===c.parent)+1}`:''}${c.arc?`\nFiring arc ${c.arc.join(',')}; no point-blank fire`:''}\nCover adds to terrain protection; seeking cover does not remove exposure.`)}"><b>C${i+1} · ${esc(c.type)} +${c.value}</b>${coverIcon(c)}</header><div class="compact-unit-grid">${units.filter(u=>u.cover===c.id).map(counter).join('')}</div></section>`).join('')}</div>`;
}
export function bindUnitTooltips(root){
 const tip=document.createElement('div');tip.className='unit-hover-details';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip);
 const show=e=>{const target=e.target.closest('[data-unit-tooltip]');if(!target)return;tip.textContent=target.dataset.unitTooltip;tip.hidden=false;const r=target.getBoundingClientRect(),w=tip.getBoundingClientRect();tip.style.left=`${Math.max(8,Math.min(r.right+8,innerWidth-w.width-8))}px`;tip.style.top=`${Math.max(8,Math.min(r.top,innerHeight-w.height-8))}px`;};
 const hide=e=>{if(e.relatedTarget?.closest?.('[data-unit-tooltip]')===e.target.closest('[data-unit-tooltip]'))return;tip.hidden=true;};
 const escape=e=>{if(e.key==='Escape')tip.hidden=true;};
 root.addEventListener('pointerover',show);root.addEventListener('focusin',show);root.addEventListener('pointerout',hide);root.addEventListener('focusout',hide);document.addEventListener('keydown',escape);
 return ()=>{tip.remove();root.removeEventListener('pointerover',show);root.removeEventListener('focusin',show);root.removeEventListener('pointerout',hide);root.removeEventListener('focusout',hide);document.removeEventListener('keydown',escape);};
}
