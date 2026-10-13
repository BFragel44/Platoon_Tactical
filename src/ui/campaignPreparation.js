import {campaignProgress,NORMANDY_SEQUENCE} from '../sim/company/campaignProgression.js';
import {previewPreparationChoices,commitPreparationChoices,projectedFormationExperience,promotionExplanation} from './preparationChoices.js';
import {SAVE_KEY,readRecovery} from './localRecovery.js';
import {campaignResumeReason} from './applicationNavigation.js';
import {readCompanyPreparation,startFreshCompanyCampaign,saveCompanyPreparation,newCompanyCampaign,beginCompanyPreparation,prepareCompany,PREPARATION_KEY} from '../sim/company/campaignPreparation.js';
import {SKILLS} from '../sim/company/skills.js';
const skillHelp={GENERAL_INITIATIVE:'One free General Initiative command.',PARALYZED_ASSAULT:'Convert an eligible paralyzed step to an Assault Team.',PARALYZED_FIRE:'Convert an eligible paralyzed step to a Fire Team.',SPAWN_TEAM:'Create a team using an eligible skill order.',EXTRA_DRAW:'Add a draw to an eligible attempt.',AUTO_SPOT:'Automatically succeed at an eligible spotting attempt.',AUTO_COVER:'Automatically succeed at an eligible cover attempt.',AUTO_CONCENTRATE:'Automatically succeed at an eligible concentrated-fire attempt.',AUTO_INFILTRATE:'Automatically succeed at an eligible infiltration attempt.',AUTO_GRENADE:'Automatically succeed at an eligible grenade attempt, including a return attempt.'};
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function openCompanyPreparation({scenario,mission=null,start,resume,download,onClose=()=>{},connectedCandidate=false,resumeStart}){
 const dialog=document.createElement('dialog');dialog.className='company-preparation';dialog.setAttribute('aria-labelledby','campaign-preparation-title');document.body.append(dialog);let error='',selectedSteps=[],selectedFormation='',selectedSkill='';
 function render(){
  let r;try{r=readCompanyPreparation(localStorage);}catch(e){error=e.message;}
  let saved={};try{saved=readRecovery({getItem:key=>localStorage.getItem('connected-'+key)});}catch(e){saved.error=e.message;}
  let progress;try{progress=campaignProgress(r);}catch(e){error=e.message;}
  const resumeReason=campaignResumeReason(r,saved,NORMANDY_SEQUENCE.find(s=>s.id===saved.bundle?.latest.replay.scenario));
  const p=r?.preparation,companyFormations=Object.values(r?.roster.formations??{}).filter(f=>!p||p.fieldable.includes(f.id)),formations=companyFormations.filter(f=>!p?true:p.phase==='SKILLS'?['HQ','STAFF'].includes(f.kind)&&f.step_ids.length>0:p.phase==='REPLACEMENTS'?f.step_ids.length<f.capacity:true),steps=Object.values(r?.roster.steps??{}).filter(t=>t.disposition==='ACTIVE'&&(!p||!p.attachment_steps.includes(t.id)));
  dialog.innerHTML=`<h2 id="campaign-preparation-title">Normandy campaign</h2><p>Start with a fresh published M1 company. Existing standalone companies are separate. ${connectedCandidate?'Standard campaign candidate: complete each offensive mission within its allowed attempts; patrol defeat does not end the campaign. Survivor and Hardcore modes are not offered.':'After M1, debrief and prepare your company; connected mission launch beyond M1 remains gated pending battlefield carryover.'}</p><p role="status">${esc(error)}</p><p>${esc(r?.stage??'No campaign company')} ${p?` / ${esc(({RECONSTITUTE:'Reconstitute and promote',REPLACEMENTS:'Allocate replacements',SKILLS:'Purchase skills',COMPLETE:'Prepared'})[p.phase]??p.phase)} / ${p.points} experience points`:''}</p>
   ${!r?'<button id="new">Create new campaign company</button>':''}
   ${r?.stage==='DEPLOYMENT'?`${!r.active_deployment&&!r.history.length&&resumeReason?'<button id="resume">Set up campaign M1</button>':''}<button id="restore" ${resumeReason?'disabled':''}>Resume saved campaign mission</button>${resumeReason?`<p>${esc(resumeReason)}</p>`:''}<button id="debrief" ${!mission||['ACTIVE','PATROL_COMPLETE'].includes(mission.status)||mission.status==='DEFEAT'&&mission.attempt_number<=mission.mission_rules.reattempts&&!mission.reattempt_declined||mission.roster_snapshot?.company_id!==r.roster.company_id?'disabled':''}>Debrief current mission</button><p>Finish the campaign mission and resolve its reattempt decision before debriefing. Standalone missions cannot be applied to this company.</p>`:''}
   ${r?.stage==='PREPARATION'?`<p>${p.phase==='RECONSTITUTE'?'Assign surviving steps to company formations, then promote eligible steps: Green to Line costs 1; Line to Veteran costs 3. Newly rebuilt HQs remain Green.':p.phase==='REPLACEMENTS'?'Allocate replacements to understrength formations. These steps cannot be promoted during this preparation.':'Buy single-use skills for surviving company HQs and staff (at most three per holder). The printed shared counter mix limits purchases; a counter used on one side is unavailable on its other side. Unspent experience expires when preparation ends.'}</p>${p.phase==='RECONSTITUTE'?`<label>Company step<select id="step" aria-label="Company step" multiple size="5">${steps.map(t=>`<option value="${esc(t.id)}" ${selectedSteps.includes(t.id)?'selected':''}>${esc(p.available.includes(t.id)?'Unassigned team':r.roster.formations[t.formation_id]?.name??'Unassigned team')} / ${esc(t.experience)} / step ${steps.indexOf(t)+1}</option>`).join('')}</select></label>`:''}<label>${p.phase==='SKILLS'?'Skill holder':'Receiving formation'}<select id="formation">${!formations.length?'<option value="" disabled selected>No eligible formation</option>':''}${formations.map(f=>`<option value="${esc(f.id)}" ${selectedFormation===f.id?'selected':''}>${esc(f.name)} / ${f.step_ids.length}/${f.capacity}</option>`).join('')}</select></label>
   ${p.phase==='RECONSTITUTE'?'<p>Select multiple steps with Ctrl/Cmd-click or Shift-click to transfer them together. Select exactly one step for promotion.</p><button id="transfer">Transfer selected steps</button><p id="transfer-preview" role="status"></p><button id="promote">Promote selected step</button><p id="promotion-preview" role="status"></p>':''}
   ${p.phase==='REPLACEMENTS'?`<p>${p.replacements.green} Green / ${p.replacements.veteran} Veteran replacements available; ${p.replacement_slots} casualty/prisoner vacancies</p><p>${r.history.at(-1)?.outcome==='SUCCESS'?'Successful completion permits up to six Green replacements and eligible Veteran returns; formation capacity and casualty vacancies still limit allocation.':'No between-mission replacements are awarded after an unsuccessful mission. Surviving steps can still be reconstituted.'}</p><button id="green" ${!p.replacements.green||!p.replacement_slots||!formations.length?'disabled':''}>Allocate Green</button><button id="veteran" ${!p.replacements.veteran||!p.replacement_slots||!formations.length?'disabled':''}>Allocate Veteran</button>`:''}
   ${p.phase==='SKILLS'?`<label>Skill<select id="skill">${Object.entries(SKILLS).map(([id,s])=>`<option value="${id}" ${selectedSkill===id?'selected':''}>${esc(s.label)} / ${s.cost} points</option>`).join('')}</select></label><button id="skill-buy">Buy for selected HQ/staff</button><p id="skill-effect"></p><p id="skill-preview" role="status"></p>`:''}<button id="next">${p.phase==='SKILLS'?'Finish preparation':'Complete this step'}</button>`:''}
   ${r?.stage==='PREPARED'?`<p>Company prepared.</p>${progress?.ended?`<p>${esc(progress.reason)}</p>`:connectedCandidate&&progress?.destination?`<button id="launch-next">Set up ${esc(progress.destination.name)}</button>`:'<p>Next mission launch remains gated pending complete connected validation.</p>'}`:''}
   ${r?.active_deployment?.start_checkpoint?'<button id="recover-start">Recover committed mission start</button><p>This restarts the committed deployment at its beginning; export any unreadable tactical save first. It never imports a standalone company.</p>':''}
   ${r?.stage==='PREPARED'?'<button id="new">Start another fresh campaign (keeps backup)</button>':''}${p?`<p>Returned company passenger steps: ${(p.returned_passengers??[]).length}. These retain their identities and do not use replacements.</p><p>Supporting attachments are replenished by their parent organizations for the destination mission.</p><p>Formation experience is finalized when preparation ends. Step experience in the selector reflects current choices.</p><p>Unassigned surviving steps: ${p.available.length}</p><p>Prepared skills: ${(r.roster.prepared_skills??[]).map(x=>esc(SKILLS[x.type].label)+' / '+esc(r.roster.formations[x.holder]?.name)).join(', ')||'None'}</p>`:''}<ul>${companyFormations.map(f=>`<li>${esc(f.name)}: ${f.step_ids.length}/${f.capacity} / ${esc(p?projectedFormationExperience(r,f):f.experience)}${r.stage==='PREPARATION'?' (on completion)':''}</li>`).join('')}</ul><button id="export" ${!r&&!error?'disabled':''}>Export campaign record</button><button id="tactical-export" ${!saved.raw?'disabled':''}>Export campaign mission save</button><button id="close">Close</button>`;
  const bind=(id,fn)=>{const b=dialog.querySelector('#'+id);if(b)b.onclick=()=>{try{fn();error='';}catch(e){error=e.message;}render();};};
  const dispatch=operation=>commitPreparationChoices(localStorage,r,[operation]);
  bind('new',()=>startFreshCompanyCampaign(localStorage,newCompanyCampaign(scenario,crypto.randomUUID())));
  bind('restore',()=>{resume();dialog.close();dialog.remove();});
  bind('resume',()=>{start(r);dialog.close();dialog.remove();});
  bind('launch-next',()=>{start(r);dialog.close();dialog.remove();});
  bind('recover-start',()=>{resumeStart(r);dialog.close();dialog.remove();});
  bind('debrief',()=>saveCompanyPreparation(localStorage,beginCompanyPreparation(r,mission),r.revision));
  bind('transfer',()=>{commitPreparationChoices(localStorage,r,selectedSteps.map(step=>({type:'TRANSFER',step,target:dialog.querySelector('#formation').value})));selectedSteps=[];});
  bind('promote',()=>dispatch({type:'PROMOTE',step:selectedSteps.length===1?selectedSteps[0]:null}));
  for(const level of ['green','veteran'])bind(level,()=>dispatch({type:'REPLACE',level,target:dialog.querySelector('#formation').value}));
  bind('skill-buy',()=>dispatch({type:'SKILL',purchase:{type:dialog.querySelector('#skill').value,holder:dialog.querySelector('#formation').value}}));
  bind('tactical-export',()=>download('normandy-campaign-mission-original.json',localStorage.getItem('connected-'+SAVE_KEY)??'null'));
  bind('next',()=>dispatch({type:'NEXT'}));bind('export',()=>download('normandy-connected-company.json',localStorage.getItem(PREPARATION_KEY)??'null'));
  bind('close',()=>{dialog.close();dialog.remove();onClose();});
  const updateChoices=()=>{
   selectedSteps=[...(dialog.querySelector('#step')?.selectedOptions??[])].map(o=>o.value);
   selectedFormation=dialog.querySelector('#formation')?.value??'';selectedSkill=dialog.querySelector('#skill')?.value??'';
   if(p?.phase==='RECONSTITUTE'){
    const transfer=previewPreparationChoices(r,selectedSteps.map(step=>({type:'TRANSFER',step,target:selectedFormation})));
    dialog.querySelector('#transfer').disabled=!!transfer.reason;
    const destination=r.roster.formations[selectedFormation],room=destination?destination.capacity-destination.step_ids.length:0;
    dialog.querySelector('#transfer-preview').textContent=transfer.reason?(selectedSteps.length&&destination&&selectedSteps.length>room?`${destination.name} has ${room} open step place(s); the selection contains ${selectedSteps.length} steps.`:transfer.reason):`${selectedSteps.length} step(s) to ${r.roster.formations[selectedFormation].name}. All choices commit together.`;
    const promote=selectedSteps.length===1?previewPreparationChoices(r,[{type:'PROMOTE',step:selectedSteps[0]}]):{reason:'Select exactly one company step to promote.'};
    dialog.querySelector('#promote').disabled=!!promote.reason;
    const explanation=promotionExplanation(r,selectedSteps.length===1?selectedSteps[0]:null);
    dialog.querySelector('#promotion-preview').textContent=explanation+(promote.reason&&promote.reason!==explanation?' '+promote.reason:'');
   }
   if(p?.phase==='SKILLS'){
    dialog.querySelector('#skill-effect').textContent=skillHelp[selectedSkill]??'';
    const skill=previewPreparationChoices(r,[{type:'SKILL',purchase:{type:selectedSkill,holder:selectedFormation}}]);
    dialog.querySelector('#skill-buy').disabled=!!skill.reason;
    dialog.querySelector('#skill-preview').textContent=skill.reason??`${SKILLS[selectedSkill].cost} experience point(s); one use. ${p.points-SKILLS[selectedSkill].cost} points remain after purchase.`;
   }
  };
  for(const id of ['step','formation','skill'])dialog.querySelector('#'+id)?.addEventListener('change',updateChoices);
  updateChoices();

 }
 dialog.addEventListener('cancel',()=>{dialog.remove();onClose();});
 render();dialog.showModal();
}
