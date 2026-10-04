import {prepareReattempt} from '../sim/company/engine.js';
import {secureStatus} from '../sim/company/missionFeatures.js';
import {SKILLS} from '../sim/company/skills.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function openReattemptSetup(root,state,onStart){
 const secured=Object.values(state.locations).filter(l=>secureStatus(state,l.id).secured);
 const active=Object.values(state.units).filter(u=>u.faction==='friendly'&&u.steps.length&&!u.removed&&u.kind!=='RUNNER'&&u.command_role!=='higher_hq');
 const donors=active.filter(u=>u.kind==='LAT'&&u.steps.length===1),targets=Object.values(state.units).filter(u=>u.faction==='friendly'&&['SQUAD','HQ','STAFF','MG','HMG','AT','MORTAR'].includes(u.kind)&&u.steps.length<u.max_steps);
 const deployable=[...active,...targets.filter(u=>!active.includes(u))];
 const points=state.achievements.reduce((total,a)=>total+a.points,0);
 const options=(entries,selected)=>entries.map(([id,name])=>`<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(name)}</option>`).join('');
 root.insertAdjacentHTML('beforeend',`<section class="mission-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="reattempt-title"><form id="reattempt-form"><h2 id="reattempt-title">Trévières · second attempt</h2><p>Place surviving and reconstituted formations on secured cards. ${points} earned experience points may be spent on one-level promotions.</p>
 <details open><summary>Deployment</summary><p>Choose a secured card and, optionally, discovered cover on that card.</p>${deployable.map(u=>`<label>${esc(u.name)} <select name="position-${esc(u.id)}">${options(secured.map(l=>[l.id,l.name]),secured.some(l=>l.id===u.location)?u.location:secured[0]?.id)}</select> <select name="cover-${esc(u.id)}">${options([['','Open'],...secured.flatMap(l=>l.covers.filter(c=>c.discovered).map(c=>[c.id,`${l.name} · ${c.type}`]))],u.cover??'')}</select></label>`).join('')}</details>
 <details><summary>Reconstitution</summary><p>Assign each surviving limited-action team to one company formation with capacity, or leave it as a Fire Team.</p>${donors.map(u=>`<label>${esc(u.name)} <select name="donor-${esc(u.id)}">${options([['','Remain a Fire Team'],...targets.map(t=>[t.id,`${t.name} (${t.steps.length}/${t.max_steps})`])],'')}</select></label>`).join('')||'<p>No eligible teams.</p>'}</details>
 <details><summary>Promotions</summary><p>Green → Line costs 1 point; Line → Veteran costs 3. A donated LAT step can be promoted after assignment, except when restoring an HQ or staff unit. Newly restored HQ and staff cannot be promoted.</p>${active.filter(u=>u.kind!=='FO').flatMap(u=>u.steps.filter(step=>u.kind==='LAT'||(step.experience??u.experience)!=='Veteran').map(step=>{const green=u.kind==='LAT'||(step.experience??u.experience)==='Green';return `<label>${esc(u.name)} · ${esc(step.id)} <select name="promote-${esc(step.id)}">${options([['','No promotion'],[green?'Line':'Veteran',green?'Line (1 point)':'Veteran (3 points)']],'')}</select></label>`;})).join('')}</details>
 ${(state.phone_lines?.length??0)?`<details><summary>Phone-line positions</summary><p>Move each existing line to a secured card or leave it in place.</p>${state.phone_lines.map(line=>`<label>${esc(line.id)} <select name="line-${esc(line.id)}">${options([['','Keep current card'],...secured.map(l=>[l.id,l.name])],'')}</select></label>`).join('')}</details>`:''}
 <details><summary>Skills</summary><p>Spend remaining points on one-use skills. At most three per HQ or staff; both sides of each physical marker share the same supply. Unused points are lost.</p>${deployable.filter(u=>['HQ','STAFF'].includes(u.kind)).map(u=>`<fieldset><legend>${esc(u.name)}</legend>${[0,1,2].map(i=>`<label>Skill ${i+1}<select name="skill-${esc(u.id)}-${i}">${options([['','None'],...Object.entries(SKILLS).map(([id,skill])=>[id,`${skill.label} (${skill.cost} points)`])],'')}</select></label>`).join('')}</fieldset>`).join('')}</details>
 ${state.phase_lines?`<details><summary>Adjust phase lines</summary>${[1,2].map(k=>`<label>PL ${k}<select name="phase-line-${k}">${options(Array.from({length:state.boundaries.rows},(_,i)=>[String(i+1),`Row ${i+1}`]),String(state.phase_lines[k]))}</select></label>`).join('')}</details>`:''}
 <p id="reattempt-error" role="alert"></p><button type="submit">Begin second attempt</button><button type="button" id="reattempt-close">Close</button></form></section>`);
 const panel=root.querySelector('.mission-setup-dialog'),close=()=>panel.remove();
 panel.querySelector('#reattempt-close').onclick=close;
 panel.querySelector('#reattempt-form').onsubmit=e=>{
  e.preventDefault();const data=new FormData(e.currentTarget),positions={},covers={},reconstitute={},promote={},phone_lines={},skills=[];
  for(const u of deployable){positions[u.id]=data.get(`position-${u.id}`);const cover=data.get(`cover-${u.id}`);if(cover)covers[u.id]=cover;}
  for(const donor of donors){const id=data.get(`donor-${donor.id}`);if(id)(reconstitute[id]??=[]).push(donor.id);}
  for(const ids of Object.values(reconstitute))for(const id of ids)delete covers[id];
  for(const u of active)for(const step of u.steps){const to=data.get(`promote-${step.id}`);if(to)promote[step.id]=to;}
  for(const line of state.phone_lines??[]){const to=data.get(`line-${line.id}`);if(to)phone_lines[line.id]=to;}
  for(const u of deployable)for(let i=0;i<3;i++){const type=data.get(`skill-${u.id}-${i}`);if(type)skills.push({holder:u.id,type});}
  const phase_lines=state.phase_lines?Object.fromEntries([1,2].map(k=>[k,Number(data.get(`phase-line-${k}`))])):undefined;
  try{const result=prepareReattempt(state,{positions,covers,reconstitute,promote,phone_lines,skills,...(phase_lines?{phase_lines}:{})});onStart(result.state);close();}
  catch(error){panel.querySelector('#reattempt-error').textContent=error.message;}
 };
 panel.querySelector('select,button')?.focus();return {close};
}
