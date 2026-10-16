import {deskHeader,deploymentMapMarkup,bindDeskKeyboard} from './commandDesk.js';
import {projectAttemptPersonnel,attemptPresentationState} from './reattemptDraft.js';
import {patrolControlsMarkup,patrolControlsData,patrolDeploymentDefault,bindPatrolDeployment} from './missionSetup.js';
import {nextPatrolPlatoons} from '../sim/company/patrols.js';
import {prepareReattempt,preparePatrol,getPlayerView} from '../sim/company/engine.js';
import {secureStatus} from '../sim/company/missionFeatures.js';
import {SKILLS} from '../sim/company/skills.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function openPatrolSetup(root,state,onStart,options={}){return openReattemptSetup(root,state,onStart,true,options);}
export function openReattemptSetup(root,state,onStart,patrol=false,{page=false,onClose=()=>{}}={}){
 const originalState=state;state=attemptPresentationState(state,patrol);
 const plan=patrol?{...state.patrol.plan,platoon:nextPatrolPlatoons(state.patrol_history)[0]}:null;
 const publicLocations=patrol?getPlayerView(state).locations:null;
 const eligible=u=>!patrol||u.platoon===state.patrol.plan.platoon;
 const title=patrol?`patrol ${state.patrol_history.length+1} preparation`:`attempt ${state.attempt_number+1}`;
 const secured=Object.values(state.locations).map(l=>patrol?{...l,name:publicLocations.find(v=>v.id===l.id)?.name??l.id}:l).filter(l=>patrol?l.row===1||l.id===plan.cop:secureStatus(state,l.id).secured);
 const active=Object.values(state.units).filter(u=>u.faction==='friendly'&&u.steps.length&&(!u.removed||patrol&&u.removed==='RESERVE'||(state.mission_rules?.vire||state.mission_rules?.tinchebray)&&u.removed==='EMBARKED'&&state.vire_runtime.vehicles[u.embarked_on]?.status==='ACTIVE')&&u.kind!=='RUNNER'&&u.command_role!=='higher_hq');
 const vehicles=(state.mission_rules?.vire||state.mission_rules?.tinchebray)?Object.values(state.vire_runtime.vehicles).filter(v=>v.faction==='friendly'&&v.status==='ACTIVE'&&['M4_SHERMAN75','M10_TD76','M5_LIGHT37','JEEP'].includes(v.profile)):[];
 const donors=active.filter(u=>eligible(u)&&u.kind==='LAT'&&u.steps.length===1),targets=Object.values(state.units).filter(u=>u.faction==='friendly'&&eligible(u)&&['SQUAD','HQ','STAFF','MG','HMG','AT','MORTAR'].includes(u.kind)&&!u.attachment&&u.steps.length<u.max_steps);
 const deployable=[...active,...targets.filter(u=>!active.includes(u))];
 const cargo=[...new Set(Object.values(state.units).filter(u=>u.faction==='friendly').flatMap(u=>[...(u.initial_resources?.radios??[]).map(key=>`RADIO:${key}`),...Object.keys(u.initial_resources?.assets??{}).map(key=>`EQUIPMENT:${key}`),...Object.keys(u.initial_resources?.ammo??{}).map(key=>`AMMO:${key}`)]))];
 const points=state.achievements.reduce((total,a)=>total+(patrol?(a.platoon===state.patrol.plan.platoon&&!a.spent?a.points:0):a.points),0)-(state.mission_rules.tinchebray?(state.attempt_points_spent_total??0):0);
 const options=(entries,selected)=>entries.map(([id,name])=>`<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(name)}</option>`).join('');
 root.insertAdjacentHTML('beforeend',`<section class="mission-setup-dialog command-desk attempt-desk" role="dialog" aria-modal="true" aria-labelledby="reattempt-title"><form id="reattempt-form"><h2 id="reattempt-title">${esc(state.mission_name)} · ${esc(title)}</h2><p>${patrol?'Deploy in Row 1, the retained COP or reserve. Only the platoon that just patrolled may reconstitute or spend its experience.':'Place surviving and reconstituted formations on secured cards.'} ${points} eligible experience points may be spent on one-level promotions.</p>
 ${patrol?patrolControlsMarkup(plan,publicLocations,nextPatrolPlatoons(state.patrol_history),false):''}<details open><summary>Deployment</summary><p>${patrol?'The selected platoon starts on Row 1; other platoons and unattached weapons/staff default to off-map reserve. Assign attachments to the patrol to deploy them. Fixed defenders on Row 1 or the COP remain optional; only one platoon may occupy the COP.':'Choose a secured card.'} Select discovered cover on the chosen card.</p>${deployable.map(u=>`<label>${esc(u.name)} <select name="position-${esc(u.id)}" aria-label="${esc(u.name)} deployment">${options([...secured.map(l=>[l.id,l.name+(patrol&&l.id===plan.cop?' - OUTPOST':'')]),...(patrol?[['RESERVE','Reserve · unavailable this patrol']]:[])],patrol?patrolDeploymentDefault(u,plan.platoon):secured.some(l=>l.id===u.location)?u.location:secured[0]?.id)}</select> <select name="cover-${esc(u.id)}" aria-label="${esc(u.name)} cover">${options([['','Open'],...secured.flatMap(l=>l.covers.filter(c=>c.discovered).map(c=>[c.id,`${l.name} · ${c.type}`]))],patrol&&patrolDeploymentDefault(u,plan.platoon)!==u.location?'':u.cover??'')}</select>${patrol&&['MG','HMG','AT','MORTAR','FO','STAFF'].includes(u.kind)?` <span>Attachment <select name="assignment-${esc(u.id)}" aria-label="${esc(u.name)} attachment">${options([[0,'Company'],[1,'Platoon 1'],[2,'Platoon 2'],[3,'Platoon 3']],u.platoon??0)}</select></span>`:''}</label>`).join('')}</details>
 ${vehicles.length?`<details open><summary>Surviving vehicles</summary><p>Retreated and destroyed vehicles remain unavailable. Surviving vehicles replenish ammunition; riders deploy dismounted.</p>${vehicles.map(v=>`<label>${esc(v.name)}<select name="vehicle-position-${esc(v.id)}">${options(secured.map(l=>[l.id,l.name]),secured.some(l=>l.id===v.location)?v.location:secured[0]?.id)}</select></label>`).join('')}</details>`:''}
 <details><summary>Reconstitution</summary><p>Assign each surviving limited-action team to one company formation with capacity, or leave it as a Fire Team.</p>${donors.map(u=>`<label>${esc(u.name)} <select aria-label="${esc(u.name)} assignment" name="donor-${esc(u.id)}">${options([['','Remain a Fire Team'],...targets.map(t=>[t.id,`${t.name} (${t.steps.length}/${t.max_steps})`])],'')}</select></label>`).join('')||'<p>No eligible teams.</p>'}</details>
 <details><summary>Promotions</summary><p>Green → Line costs 1 point; Line → Veteran costs 3. A donated LAT step can be promoted after assignment, except when restoring an HQ or staff unit. Newly restored HQ and staff cannot be promoted.</p>${active.filter(u=>eligible(u)&&u.kind!=='FO').flatMap(u=>u.steps.filter(step=>u.kind==='LAT'||(step.experience??u.experience)!=='Veteran').map(step=>{const green=u.kind==='LAT'||(step.experience??u.experience)==='Green';return `<label>${esc(u.name)} … Step ${u.steps.indexOf(step)+1} <select aria-label="${esc(u.name)} step ${u.steps.indexOf(step)+1} promotion" name="promote-${esc(step.id)}">${options([['','No promotion'],[green?'Line':'Veteran',green?'Line (1 point)':'Veteran (3 points)']],'')}</select></label>`;})).join('')}</details>
 ${(state.phone_lines?.length??0)?`<details><summary>Phone-line positions</summary><p>Move each existing line to a secured card or leave it in place.</p>${state.phone_lines.map(line=>`<label>${esc(line.id)} <select name="line-${esc(line.id)}">${options([['','Keep current card'],...secured.map(l=>[l.id,l.name+(patrol&&l.id===plan.cop?' - OUTPOST':'')])],'')}</select></label>`).join('')}</details>`:''}
 <details><summary>Redistribute replenished supplies</summary><p>Optional transfers after reconstitution and resupply. Choose surviving carriers; stock is validated when the attempt begins. Equipment and ammunition above carrying limits must be dropped before moving.</p>${Array.from({length:6},(_,i)=>`<fieldset><legend>Transfer ${i+1}</legend><label>From <select name="cargo-from-${i}">${options(deployable.map(u=>[u.id,u.name]),'')}</select></label><label>To <select name="cargo-to-${i}">${options(deployable.map(u=>[u.id,u.name]),'')}</select></label><label>Item <select name="cargo-item-${i}">${options(cargo.map(key=>[key,key.replace(':',' · ')]),'')}</select></label><label>Quantity <input name="cargo-quantity-${i}" type="number" min="0" step="1" value="0"></label></fieldset>`).join('')}</details>
 <details><summary>Skills</summary>${patrol?`<p>Existing skills remain with their holders and retain their used status: ${(state.skills??[]).map(skill=>`${esc(state.units[skill.holder]?.name??skill.holder)} · ${esc(SKILLS[skill.type]?.label??skill.type)}${skill.used?' (used)':''}`).join('; ')||'none'}.</p>`:''}<p>Spend remaining points on one-use skills for any surviving Company HQ, Platoon HQ or company staff. At most three per holder; both sides of each marker share the same supply. Reserve holders retain skills but cannot use them off map. Points are spent only when preparation is committed.</p>${deployable.filter(u=>['HQ','STAFF'].includes(u.kind)&&(!patrol||(state.skills??[]).filter(s=>s.holder===u.id).length<3)).map(u=>`<fieldset><legend>${esc(u.name)}</legend>${[0,1,2].slice(0,Math.max(0,3-(patrol?(state.skills??[]).filter(s=>s.holder===u.id).length:0))).map(i=>`<label>Skill ${i+1}<select name="skill-${esc(u.id)}-${i}">${options([['','None'],...Object.entries(SKILLS).map(([id,skill])=>[id,`${skill.label} (${skill.cost} points)`])],'')}</select></label>`).join('')}</fieldset>`).join('')}</details>
 ${state.phase_lines?`<details><summary>Adjust phase lines</summary>${[1,2].map(k=>`<label>PL ${k}<select name="phase-line-${k}">${options(Array.from({length:state.boundaries.rows},(_,i)=>[String(i+1),`Row ${i+1}`]),String(state.phase_lines[k]))}</select></label>`).join('')}</details>`:''}
 <p id="reattempt-error" role="alert"></p><button type="submit">${patrol?'Begin next patrol':`Begin attempt ${state.attempt_number+1}`}</button><button type="button" id="reattempt-close">Close</button></form></section>`);
 const previous=document.activeElement,panel=root.querySelector('.mission-setup-dialog'),form=panel.querySelector('form');
 let removeKeyboard=()=>{},stage=0,selectedUnit=(patrol?active.find(u=>u.platoon===plan.platoon):null)?.id??active[0]?.id,projection=null,draftError='';
 if(page){panel.classList.add('preparation-page');panel.setAttribute('role','region');panel.removeAttribute('aria-modal');document.documentElement.classList.add('preparation-screen');panel.querySelector('#reattempt-close').textContent='Return to battlefield';}
 const close=(started=false)=>{removeKeyboard();panel.remove();if(page)document.documentElement.classList.remove('preparation-screen');onClose(started===true);};removeKeyboard=bindDeskKeyboard(panel,close,previous);
 panel.querySelector('#reattempt-close').onclick=close;
 const stages=['Reorganize','Promotions & skills','Supplies','Deployment','Review'];
 const sections=[...form.querySelectorAll(':scope > details')];
 const heading=form.querySelector('h2'),intro=heading.nextElementSibling;
 heading.insertAdjacentHTML('beforebegin',deskHeader(patrol?'Patrol preparation':'Mission reattempt',`${state.mission_name} · ${title}`).replace('<h2>','<h2 id="reattempt-title">'));heading.remove();intro.remove();
 const layout=document.createElement('div');layout.className='desk-layout';layout.innerHTML='<section class="desk-sheet"><h3>Projected roster</h3><div id="attempt-roster" class="desk-roster-scroll"></div></section><section class="desk-sheet"><div id="attempt-map"></div><div id="attempt-fields"></div><div id="attempt-review"></div></section>';
 const anchor=form.querySelector('fieldset,details');form.insertBefore(layout,anchor??form.querySelector('#reattempt-error'));
 const fields=layout.querySelector('#attempt-fields');
 for(const section of sections){
  const name=section.querySelector('summary').textContent;
  section.dataset.stage=String(name==='Reconstitution'?0:['Promotions','Skills'].includes(name)?1:name==='Redistribute replenished supplies'?2:3);section.open=true;section.classList.add('attempt-'+name.toLowerCase().replaceAll(' ','-'));fields.append(section);if(['Promotions','Redistribute replenished supplies','Deployment','Surviving vehicles'].includes(name)){const notes=[...section.children].filter(e=>e.tagName==='P');const help=document.createElement('details');help.className='attempt-help';help.innerHTML='<summary>Rules & details</summary>';notes.forEach(e=>help.append(e));section.append(help);}
 }
 for(const section of fields.children){if(['attempt-promotions','attempt-reconstitution','attempt-redistribute-replenished-supplies','attempt-adjust-phase-lines','attempt-surviving-vehicles'].some(c=>section.classList.contains(c))){const grid=document.createElement('div');grid.className='attempt-choice-grid';[...section.children].filter(e=>e.tagName==='LABEL'||e.tagName==='FIELDSET').forEach(e=>grid.append(e));section.querySelector('summary').after(grid);}}
 const skillSection=fields.querySelector('.attempt-skills');
 const skillNotes=[...skillSection.children].filter(e=>e.tagName==='P'),skillExplanation=skillNotes.at(-1);skillNotes.slice(0,-1).forEach(p=>p.remove());
 if(patrol&&state.skills?.length){
  const holders=[...new Set(state.skills.map(s=>s.holder))];
  (skillExplanation??skillSection.querySelector('summary')).insertAdjacentHTML('afterend',`<div class="attempt-retained-skills"><strong>Retained skills</strong><ul>${holders.map(id=>`<li><b>${esc(state.units[id]?.name??id)}</b> · ${state.skills.filter(s=>s.holder===id).map(s=>`${esc(SKILLS[s.type]?.label??s.type)}${s.used?' (used)':''}`).join(', ')}</li>`).join('')}</ul></div>`);
 }
 // Patrol controls belong to deployment, including attachment assignment.
 const patrolControls=form.querySelector(':scope > fieldset');if(patrolControls){patrolControls.dataset.stage='3';const notes=[...patrolControls.children].filter(e=>e.tagName==='P');if(notes.length){const help=document.createElement('details');help.className='attempt-help';help.innerHTML='<summary>Patrol deployment rules</summary>';notes.forEach(p=>help.append(p));patrolControls.append(help);}fields.append(patrolControls);}
 const tools=document.createElement('div');tools.className='attempt-header-tools';tools.innerHTML='<div id="attempt-metrics" class="desk-metrics"></div><nav class="desk-panel-tabs" aria-label="Preparation sections"></nav>';form.querySelector('.desk-header').append(tools);const nav=tools.querySelector('nav');nav.innerHTML=stages.map((name,i)=>`<button type="button" data-attempt-stage="${i}">${esc(name)}</button>`).join('');
 const footer=document.createElement('footer');footer.className='desk-footer';footer.innerHTML='<button type="button" id="attempt-back">Previous section</button><button type="button" id="attempt-next">Continue</button>';
 form.append(footer);footer.append(form.querySelector('button[type="submit"]')??form.querySelector('button:not([type])'),form.querySelector('#reattempt-close'));
 const begin=footer.querySelector('button[type="submit"]')??footer.querySelector('button:not([type])');
 function paintStage(){panel.dataset.preparationStage=String(stage);
  for(const section of fields.children)section.hidden=Number(section.dataset.stage)!==stage;
  for(const button of nav.querySelectorAll('button')){if(Number(button.dataset.attemptStage)===stage)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}
  layout.querySelector('#attempt-map').hidden=stage!==3;layout.querySelector('#attempt-review').hidden=stage!==4;
  panel.querySelector('#attempt-back').disabled=stage===0;panel.querySelector('#attempt-next').hidden=stage===4;begin.hidden=stage!==4;
 }
 for(const button of nav.querySelectorAll('button'))button.onclick=()=>{stage=Number(button.dataset.attemptStage);paintStage();updateDraft();};
 panel.querySelector('#attempt-back').onclick=()=>{stage=Math.max(0,stage-1);paintStage();updateDraft();};panel.querySelector('#attempt-next').onclick=()=>{stage=Math.min(4,stage+1);paintStage();updateDraft();};
 function personnelChoices(includePromotions=true){
  const data=new FormData(form),reconstitute={},promote={},skills=[];
  for(const donor of donors){const id=data.get(`donor-${donor.id}`);if(id)(reconstitute[id]??=[]).push(donor.id);}
  if(includePromotions)for(const u of active)for(const step of u.steps){const to=data.get(`promote-${step.id}`);if(to)promote[step.id]=to;}
  for(const u of deployable)for(let i=0;i<3;i++){const type=data.get(`skill-${u.id}-${i}`);if(type)skills.push({holder:u.id,type});}
  return {reconstitute,promote,skills};
 }
 const publicView=getPlayerView(state),publicMap=publicView.locations;
 function updateDraft(){
  try{
   const base=projectAttemptPersonnel(state,{...personnelChoices(false),skills:[]},patrol);
   // Promote the transferred step in its receiving formation, never a consumed LAT.
   for(const u of active)for(const step of u.steps){
    const control=panel.querySelector(`[name="promote-${step.id}"]`);if(!control)continue;
    const owner=Object.values(base.units).find(x=>x.steps.some(t=>t.id===step.id)),level=base.stepLevels[step.id]??owner?.experience;
    const permitted=owner&&!base.newHQ.has(owner.id)&&!['LAT','FO'].includes(owner.kind)&&eligible(owner)&&level!=='Veteran'&&!(state.mission_rules.hill192&&owner.removed==='RESERVE');
    const old=control.value;control.innerHTML=options([['','No promotion'],...(permitted?[[level==='Green'?'Line':'Veteran',level==='Green'?'Line (1 XP)':'Veteran (3 XP)']]:[])],old);control.disabled=!permitted;
    const label=control.parentElement;label.hidden=owner?.kind==='LAT';control.setAttribute('aria-label',`${owner?.name??u.name} step ${Math.max(0,owner?.steps.findIndex(t=>t.id===step.id)??0)+1} promotion`);label.firstChild.textContent=`${owner?.name??u.name} … Step ${Math.max(0,owner?.steps.findIndex(t=>t.id===step.id)??0)+1} · ${level??u.experience} `;
   }
   projection=projectAttemptPersonnel(state,personnelChoices(),patrol);draftError='';
   for(const donor of donors){const control=panel.querySelector(`[name="donor-${donor.id}"]`);for(const opt of control.options){const target=projection.units[opt.value];if(!target)continue;opt.textContent=`${target.name} (${target.steps.length}/${target.max_steps})`;opt.disabled=opt.value!==control.value&&target.steps.length>=target.max_steps;}}
   for(const u of deployable){const position=panel.querySelector(`[name="position-${u.id}"]`),cover=panel.querySelector(`[name="cover-${u.id}"]`),absent=projection.consumed.has(u.id)||!projection.units[u.id]?.steps.length;const label=position?.parentElement;if(label)label.hidden=absent||stage===3&&u.id!==selectedUnit;if(position)position.disabled=absent;if(cover)cover.disabled=absent||position?.value==='RESERVE';}
   for(const u of deployable.filter(u=>['HQ','STAFF'].includes(u.kind)))for(let i=0;i<3;i++){const skill=panel.querySelector(`[name="skill-${u.id}-${i}"]`);if(skill){skill.disabled=!projection.units[u.id]?.steps.length;skill.closest('fieldset').hidden=skill.disabled;}}
  }catch(error){draftError=error.message;}
  const rows=projection?Object.values(projection.units).filter(u=>deployable.some(v=>v.id===u.id)&&!projection.consumed.has(u.id)&&(u.steps.length||targets.some(t=>t.id===u.id))):active;
  tools.querySelector('#attempt-metrics').innerHTML=`<span><strong>${projection?.points??points}</strong> XP remaining${patrol?` · Platoon ${state.patrol.plan.platoon}`:''}</span><span>${projection?.consumed.size??0} teams assigned</span>`;
  const positions=Object.fromEntries(deployable.filter(u=>!projection||projection.units[u.id]?.steps.length&&!projection.consumed.has(u.id)).map(u=>[u.id,panel.querySelector(`[name="position-${u.id}"]`)?.value]));
  const locationText=id=>id==='RESERVE'?'Reserve':id==='TRANSFERRED'?'Transferred':publicMap.find(l=>l.id===id)?.name??'Not deployed';
  layout.querySelector('#attempt-roster').innerHTML=`<table><thead><tr><th>Formation</th><th title="Strength">Str.</th><th title="Experience">Exp.</th>${stage===3?'<th>Location</th>':''}</tr></thead><tbody>${rows.map(u=>{const before=state.units[u.id].steps.length,delta=u.steps.length-before;return `<tr class="${u.id===selectedUnit?'desk-selected':''}"><th><button type="button" class="desk-roster-name" data-attempt-unit="${esc(u.id)}">${esc(u.name.replace('Company Executive Officer','Company XO').replace('Company First Sergeant','Company 1SG'))}</button></th><td>${u.steps.length}/${u.kind==='LAT'?1:u.max_steps}${delta?`<small class="desk-add">+${delta} incoming</small>`:''}</td><td>${esc(u.experience)}</td>${stage===3?`<td class="attempt-location">${esc(u.steps.length?locationText(positions[u.id]):'Not deployed')}${u.steps.length&&positions[u.id]===(form.querySelector('[name="patrol-cop"]')?.value??plan?.cop)?' · OUTPOST':''}</td>`:''}</tr>`;}).join('')}</tbody></table>${projection?.consumed.size?`<p class="desk-remove">${projection.consumed.size} donor teams transferred into company formations.</p>`:''}`;
  const selectedPosition=panel.querySelector(`[name="position-${selectedUnit}"]`),selectedControl=selectedPosition?.disabled?null:selectedPosition;
  const mapObjectives=structuredClone(publicView.objectives??{});if(patrol)for(const key of ['primary','ccp','cop']){const value=form.querySelector(`[name="patrol-${key}"]`)?.value;if(value)mapObjectives[key]={location:value};}
  if(stage===3)layout.querySelector('#attempt-map').innerHTML=deploymentMapMarkup({locations:publicMap,objectives:mapObjectives,placements:positions,selected:selectedUnit,selectedLabel:projection?.units[selectedUnit]?.name,allowed:selectedControl?[...selectedControl.options].map(o=>o.value):[]});
  for(const button of layout.querySelectorAll('[data-attempt-unit]'))button.onclick=()=>{selectedUnit=button.dataset.attemptUnit;if(stage!==1)stage=3;paintStage();updateDraft();layout.querySelector(`[data-attempt-unit="${CSS.escape(selectedUnit)}"]`)?.focus({preventScroll:true});};
  for(const button of layout.querySelectorAll('[data-deploy-card]'))button.onclick=()=>{if(selectedControl){selectedControl.value=button.dataset.deployCard;selectedControl.dispatchEvent(new Event('change',{bubbles:true}));selectedControl.focus({preventScroll:true});}};
  layout.querySelector('#attempt-review').innerHTML=`<h3>Ready for ${patrol?'the next patrol':`attempt ${state.attempt_number+1}`}?</h3><p>${patrol?'The next platoon patrols the retained battlefield.':'Terrain, discovered cover, mines, contacts and enemy positions are retained. Friendly formations may reposition to secured cards.'}</p><p>Pins, fire markers, commands and supplies reset under the preparation rules. Fire may resume immediately where opponents remain in LOS.</p><p>${rows.filter(u=>u.steps.length).length} formations · ${projection?.points??points} XP available after selected purchases.</p><p>Clearance/objective XP is assessed at the end of an attempt; event awards retain their actual timing.</p><p>Begin validates all choices. No tactical changes occur until validation succeeds.</p>`;
  for(const select of form.querySelectorAll('select'))select.title=select.selectedOptions[0]?.textContent??'';
  panel.querySelector('#reattempt-error').textContent=draftError;begin.disabled=!!draftError;
 }
 form.addEventListener('change',updateDraft);form.addEventListener('input',e=>{if(e.target.tagName==='INPUT')updateDraft();});
 paintStage();
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
  e.preventDefault();updateDraft();if(draftError)return;const data=new FormData(e.currentTarget),positions={},covers={},reconstitute={},promote={},phone_lines={},skills=[],redistribute=[];
  for(const u of deployable){if(projection?.consumed.has(u.id)||!projection?.units[u.id]?.steps.length)continue;positions[u.id]=data.get(`position-${u.id}`);const cover=data.get(`cover-${u.id}`);if(cover&&positions[u.id]!=='RESERVE')covers[u.id]=cover;}
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
  try{const vehicle_positions=Object.fromEntries(vehicles.map(v=>[v.id,data.get(`vehicle-position-${v.id}`)]));
   const result=(patrol?preparePatrol:prepareReattempt)(originalState,{...((state.mission_rules?.vire||state.mission_rules?.tinchebray)?{vehicle_positions}:{}),...(patrol?{patrol:patrolControlsData(data,plan),assignments:Object.fromEntries(deployable.filter(u=>data.has(`assignment-${u.id}`)).map(u=>[u.id,Number(data.get(`assignment-${u.id}`))]))}:{}),positions,covers,reconstitute,promote,phone_lines,skills,redistribute,...(phase_lines?{phase_lines}:{})});close(true);onStart(result.state);}
  catch(error){panel.querySelector('#reattempt-error').textContent=error.message;}
 };
 updateDraft();panel.querySelector('button')?.focus();return {close};
}
