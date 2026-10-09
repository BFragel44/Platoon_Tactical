import {patrolControlsMarkup,patrolControlsData,patrolDeploymentDefault,bindPatrolDeployment} from './missionSetup.js';
import {nextPatrolPlatoons} from '../sim/company/patrols.js';
import {prepareReattempt,preparePatrol,getPlayerView} from '../sim/company/engine.js';
import {secureStatus} from '../sim/company/missionFeatures.js';
import {SKILLS} from '../sim/company/skills.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function openPatrolSetup(root,state,onStart){return openReattemptSetup(root,state,onStart,true);}
export function openReattemptSetup(root,state,onStart,patrol=false){
 const plan=patrol?{...state.patrol.plan,platoon:nextPatrolPlatoons(state.patrol_history)[0]}:null;
 const publicLocations=patrol?getPlayerView(state).locations:null;
 const eligible=u=>!patrol||u.platoon===state.patrol.plan.platoon;
 const title=patrol?`patrol ${state.patrol_history.length+1} preparation`:'second attempt';
 const secured=Object.values(state.locations).map(l=>patrol?{...l,name:publicLocations.find(v=>v.id===l.id)?.name??l.id}:l).filter(l=>patrol?l.row===1||l.id===plan.cop:secureStatus(state,l.id).secured);
 const active=Object.values(state.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||patrol&&u.removed==='RESERVE')&&u.kind!=='RUNNER'&&u.command_role!=='higher_hq');
 const donors=active.filter(u=>eligible(u)&&u.kind==='LAT'&&u.steps.length===1),targets=Object.values(state.units).filter(u=>u.faction==='friendly'&&eligible(u)&&['SQUAD','HQ','STAFF','MG','HMG','AT','MORTAR'].includes(u.kind)&&u.steps.length<u.max_steps);
 const deployable=[...active,...targets.filter(u=>!active.includes(u))];
 const cargo=[...new Set(Object.values(state.units).filter(u=>u.faction==='friendly').flatMap(u=>[...(u.initial_resources?.radios??[]).map(key=>`RADIO:${key}`),...Object.keys(u.initial_resources?.assets??{}).map(key=>`EQUIPMENT:${key}`),...Object.keys(u.initial_resources?.ammo??{}).map(key=>`AMMO:${key}`)]))];
 const points=state.achievements.reduce((total,a)=>total+(patrol?(a.platoon===state.patrol.plan.platoon&&!a.spent?a.points:0):a.points),0);
 const options=(entries,selected)=>entries.map(([id,name])=>`<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(name)}</option>`).join('');
 root.insertAdjacentHTML('beforeend',`<section class="mission-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="reattempt-title"><form id="reattempt-form"><h2 id="reattempt-title">${esc(state.mission_name)} · ${esc(title)}</h2><p>${patrol?'Deploy in Row 1, the retained COP or reserve. Only the platoon that just patrolled may reconstitute or spend its experience.':'Place surviving and reconstituted formations on secured cards.'} ${points} eligible experience points may be spent on one-level promotions.</p>
 ${patrol?patrolControlsMarkup(plan,publicLocations,nextPatrolPlatoons(state.patrol_history),false):''}<details open><summary>Deployment</summary><p>${patrol?'The selected platoon starts on Row 1; other platoons and unattached weapons/staff default to off-map reserve. Assign attachments to the patrol to deploy them. Fixed defenders on Row 1 or the COP remain optional; only one platoon may occupy the COP.':'Choose a secured card.'} Select discovered cover on the chosen card.</p>${deployable.map(u=>`<label>${esc(u.name)} <select name="position-${esc(u.id)}" aria-label="${esc(u.name)} deployment">${options([...secured.map(l=>[l.id,l.name+(patrol&&l.id===plan.cop?' - OUTPOST':'')]),...(patrol?[['RESERVE','Reserve · unavailable this patrol']]:[])],patrol?patrolDeploymentDefault(u,plan.platoon):secured.some(l=>l.id===u.location)?u.location:secured[0]?.id)}</select> <select name="cover-${esc(u.id)}" aria-label="${esc(u.name)} cover">${options([['','Open'],...secured.flatMap(l=>l.covers.filter(c=>c.discovered).map(c=>[c.id,`${l.name} · ${c.type}`]))],patrol&&patrolDeploymentDefault(u,plan.platoon)!==u.location?'':u.cover??'')}</select>${patrol&&['MG','HMG','AT','MORTAR','FO','STAFF'].includes(u.kind)?` <span>Attachment <select name="assignment-${esc(u.id)}" aria-label="${esc(u.name)} attachment">${options([[0,'Company'],[1,'Platoon 1'],[2,'Platoon 2'],[3,'Platoon 3']],u.platoon??0)}</select></span>`:''}</label>`).join('')}</details>
 <details><summary>Reconstitution</summary><p>Assign each surviving limited-action team to one company formation with capacity, or leave it as a Fire Team.</p>${donors.map(u=>`<label>${esc(u.name)} <select name="donor-${esc(u.id)}">${options([['','Remain a Fire Team'],...targets.map(t=>[t.id,`${t.name} (${t.steps.length}/${t.max_steps})`])],'')}</select></label>`).join('')||'<p>No eligible teams.</p>'}</details>
 <details><summary>Promotions</summary><p>Green → Line costs 1 point; Line → Veteran costs 3. A donated LAT step can be promoted after assignment, except when restoring an HQ or staff unit. Newly restored HQ and staff cannot be promoted.</p>${active.filter(u=>eligible(u)&&u.kind!=='FO').flatMap(u=>u.steps.filter(step=>u.kind==='LAT'||(step.experience??u.experience)!=='Veteran').map(step=>{const green=u.kind==='LAT'||(step.experience??u.experience)==='Green';return `<label>${esc(u.name)} · ${esc(step.id)} <select name="promote-${esc(step.id)}">${options([['','No promotion'],[green?'Line':'Veteran',green?'Line (1 point)':'Veteran (3 points)']],'')}</select></label>`;})).join('')}</details>
 ${(state.phone_lines?.length??0)?`<details><summary>Phone-line positions</summary><p>Move each existing line to a secured card or leave it in place.</p>${state.phone_lines.map(line=>`<label>${esc(line.id)} <select name="line-${esc(line.id)}">${options([['','Keep current card'],...secured.map(l=>[l.id,l.name+(patrol&&l.id===plan.cop?' - OUTPOST':'')])],'')}</select></label>`).join('')}</details>`:''}
 <details><summary>Redistribute replenished supplies</summary><p>Optional transfers after reconstitution and resupply. Choose surviving carriers; stock is validated when the attempt begins. Equipment and ammunition above carrying limits must be dropped before moving.</p>${Array.from({length:6},(_,i)=>`<fieldset><legend>Transfer ${i+1}</legend><label>From <select name="cargo-from-${i}">${options(deployable.map(u=>[u.id,u.name]),'')}</select></label><label>To <select name="cargo-to-${i}">${options(deployable.map(u=>[u.id,u.name]),'')}</select></label><label>Item <select name="cargo-item-${i}">${options(cargo.map(key=>[key,key.replace(':',' · ')]),'')}</select></label><label>Quantity <input name="cargo-quantity-${i}" type="number" min="0" step="1" value="0"></label></fieldset>`).join('')}</details>
 <details><summary>Skills</summary>${patrol?`<p>Existing skills remain with their holders and retain their used status: ${(state.skills??[]).map(skill=>`${esc(state.units[skill.holder]?.name??skill.holder)} · ${esc(SKILLS[skill.type]?.label??skill.type)}${skill.used?' (used)':''}`).join('; ')||'none'}.</p>`:''}<p>Spend remaining points on one-use skills. At most three per HQ or staff; both sides of each physical marker share the same supply. Unused points are lost.</p>${deployable.filter(u=>eligible(u)&&['HQ','STAFF'].includes(u.kind)).map(u=>`<fieldset><legend>${esc(u.name)}</legend>${[0,1,2].map(i=>`<label>Skill ${i+1}<select name="skill-${esc(u.id)}-${i}">${options([['','None'],...Object.entries(SKILLS).map(([id,skill])=>[id,`${skill.label} (${skill.cost} points)`])],'')}</select></label>`).join('')}</fieldset>`).join('')}</details>
 ${state.phase_lines?`<details><summary>Adjust phase lines</summary>${[1,2].map(k=>`<label>PL ${k}<select name="phase-line-${k}">${options(Array.from({length:state.boundaries.rows},(_,i)=>[String(i+1),`Row ${i+1}`]),String(state.phase_lines[k]))}</select></label>`).join('')}</details>`:''}
 <p id="reattempt-error" role="alert"></p><button type="submit">${patrol?'Begin next patrol':'Begin second attempt'}</button><button type="button" id="reattempt-close">Close</button></form></section>`);
 const previous=document.activeElement,panel=root.querySelector('.mission-setup-dialog');
 const close=()=>{panel.remove();document.removeEventListener('keydown',keyboard);if(previous?.isConnected)previous.focus();};
 const keyboard=e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button,select,input,summary')].filter(n=>n.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0]?.focus();}}};
 document.addEventListener('keydown',keyboard);
 panel.querySelector('#reattempt-close').onclick=close;
 if(patrol)bindPatrolDeployment(panel.querySelector('#reattempt-form'),deployable,'assignment');

 // A changed deployment card must not retain a cover choice from the old card.
 for(const u of deployable){
  const position=panel.querySelector(`[name="position-${u.id}"]`),cover=panel.querySelector(`[name="cover-${u.id}"]`);
  const update=()=>{const previous=cover.value,card=secured.find(l=>l.id===position.value);
   const entries=[['','Open'],...(card?.covers??[]).filter(c=>c.discovered).map(c=>[c.id,`${card.name} · ${c.type}`])];
   cover.innerHTML=options(entries,entries.some(([id])=>id===previous)?previous:'');};
  position.addEventListener('change',update);update();
 }
 panel.querySelector('#reattempt-form').onsubmit=e=>{
  e.preventDefault();const data=new FormData(e.currentTarget),positions={},covers={},reconstitute={},promote={},phone_lines={},skills=[],redistribute=[];
  for(const u of deployable){positions[u.id]=data.get(`position-${u.id}`);const cover=data.get(`cover-${u.id}`);if(cover&&positions[u.id]!=='RESERVE')covers[u.id]=cover;}
  for(const donor of donors){const id=data.get(`donor-${donor.id}`);if(id)(reconstitute[id]??=[]).push(donor.id);}
  for(const ids of Object.values(reconstitute))for(const id of ids)delete covers[id];
  for(const u of active)for(const step of u.steps){const to=data.get(`promote-${step.id}`);if(to)promote[step.id]=to;}
  for(const line of state.phone_lines??[]){const to=data.get(`line-${line.id}`);if(to)phone_lines[line.id]=to;}
  for(const u of deployable)for(let i=0;i<3;i++){const type=data.get(`skill-${u.id}-${i}`);if(type)skills.push({holder:u.id,type});}
  for(let i=0;i<6;i++){
   const quantity=Number(data.get(`cargo-quantity-${i}`));if(!quantity)continue;
   const [type,key]=String(data.get(`cargo-item-${i}`)).split(':');
   redistribute.push({from:data.get(`cargo-from-${i}`),to:data.get(`cargo-to-${i}`),type,key,quantity});
  }
  const phase_lines=state.phase_lines?Object.fromEntries([1,2].map(k=>[k,Number(data.get(`phase-line-${k}`))])):undefined;
  try{const result=(patrol?preparePatrol:prepareReattempt)(state,{...(patrol?{patrol:patrolControlsData(data,plan),assignments:Object.fromEntries(deployable.filter(u=>data.has(`assignment-${u.id}`)).map(u=>[u.id,Number(data.get(`assignment-${u.id}`))]))}:{}),positions,covers,reconstitute,promote,phone_lines,skills,redistribute,...(phase_lines?{phase_lines}:{})});onStart(result.state);close();}
  catch(error){panel.querySelector('#reattempt-error').textContent=error.message;}
 };
 panel.querySelector('select,button')?.focus();return {close};
}
