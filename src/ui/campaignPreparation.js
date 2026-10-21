import {deskHeader} from './commandDesk.js';
import {campaignProgress,NORMANDY_SEQUENCE} from '../sim/company/campaignProgression.js';
import {previewPreparationChoices,commitPreparationChoices,projectedFormationExperience,promotionExplanation,navigateCompanyPreparation,COMPANY_PREPARATION_PHASES} from './preparationChoices.js';
import {replayMission} from '../sim/company/engine.js';
import {importVireAdapterReplay} from '../sim/company/vireIntegration.js';
import {SAVE_KEY,readRecovery} from './localRecovery.js';
import {campaignResumeReason} from './applicationNavigation.js';
import {readCompanyPreparation,startFreshCompanyCampaign,saveCompanyPreparation,newCompanyCampaign,beginCompanyPreparation,prepareCompany,PREPARATION_KEY} from '../sim/company/campaignPreparation.js';
import {SKILLS} from '../sim/company/skills.js';
const skillHelp={GENERAL_INITIATIVE:'One free General Initiative command.',PARALYZED_ASSAULT:'Convert an eligible paralyzed step to an Assault Team.',PARALYZED_FIRE:'Convert an eligible paralyzed step to a Fire Team.',SPAWN_TEAM:'Create a team using an eligible skill order.',EXTRA_DRAW:'Add a draw to an eligible attempt.',AUTO_SPOT:'Automatically succeed at an eligible spotting attempt.',AUTO_COVER:'Automatically succeed at an eligible cover attempt.',AUTO_CONCENTRATE:'Automatically succeed at an eligible concentrated-fire attempt.',AUTO_INFILTRATE:'Automatically succeed at an eligible infiltration attempt.',AUTO_GRENADE:'Automatically succeed at an eligible grenade attempt, including a return attempt.'};
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function openCompanyPreparation({scenario,mission=null,start,resume,download,onClose=()=>{},resumeStart}){
 const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='company-preparation command-desk';dialog.setAttribute('aria-label','Battalion company preparation');dialog.tabIndex=-1;document.body.append(dialog);
 let error='',selectedSteps=[],selectedSurvivor='',selectedFormation='',selectedSkill='GENERAL_INITIATIVE',expanded=null,lastStage=null;
 const close=(notify=true)=>{dialog.close();dialog.remove();if(previous?.isConnected)previous.focus();if(notify)onClose();};
 function render(){
  const deskScroll=dialog.scrollTop,rosterScroll=dialog.querySelector('.desk-roster-scroll')?.scrollTop??0;
  let r=null,saved={},progress=null;
  try{r=readCompanyPreparation(localStorage);progress=campaignProgress(r);}catch(e){error=e.message;}
  try{saved=readRecovery({getItem:key=>localStorage.getItem('connected-'+key)});}catch(e){saved.error=e.message;}
  const p=r?.preparation,last=r?.history.at(-1),current=NORMANDY_SEQUENCE.find(d=>d.id===(r?.active_deployment?.scenario??last?.replay.scenario));
  const sameMission=mission&&mission.roster_snapshot?.company_id===r?.roster.company_id&&(!r?.active_deployment||r.active_deployment.mission_id===mission.mission_instance_id);
  const terminal=r?.stage==='DEPLOYMENT'&&sameMission&&!['ACTIVE','PATROL_COMPLETE'].includes(mission.status)&&!(mission.status==='DEFEAT'&&mission.attempt_number<=mission.mission_rules.reattempts&&!mission.reattempt_declined);
  const stage=!r?'New company':r.stage==='DEPLOYMENT'?(terminal?'Mission debrief':r.active_deployment?'Mission in progress':'Initial deployment'):({RECONSTITUTE:'Reorganize & promote',REPLACEMENTS:'Replacements',SKILLS:'Skills',COMPLETE:'Ready'})[p.phase];
  let debriefPreview=null;if(terminal)try{debriefPreview=beginCompanyPreparation(r,mission);}catch(e){error=e.message;}
  const displayRoster=debriefPreview?.roster??r?.roster;
  const formations=Object.values(displayRoster?.formations??{}).filter(f=>!p||p.fieldable.includes(f.id));
  const receiving=formations.filter(f=>p?.phase==='SKILLS'?['HQ','STAFF'].includes(f.kind)&&f.step_ids.length:p?.phase==='REPLACEMENTS'?f.step_ids.length<f.capacity:!p?.attachments.includes(f.id)&&f.kind!=='FO');
  if(!receiving.some(f=>f.id===selectedFormation))selectedFormation=receiving[0]?.id??'';
  const steps=Object.values(r?.roster.steps??{}).filter(t=>t.disposition==='ACTIVE'&&(!p||!p.attachment_steps.includes(t.id)));
  selectedSteps=selectedSteps.filter(id=>steps.some(t=>t.id===id));
  if(!p?.available.includes(selectedSurvivor))selectedSurvivor='';
  const stepChoices=(ids,name)=>`<div class="desk-step-list">${ids.filter(id=>steps.some(t=>t.id===id)).map((id,i)=>{const t=r.roster.steps[id];return `<label><input type="checkbox" data-company-step="${esc(id)}" ${selectedSteps.includes(id)?'checked':''}>${esc(name)} … Step ${i+1} · ${esc(t.experience)}</label>`;}).join('')}</div>`;
  const roster=formations.map(f=>`<tr data-roster-row="${esc(f.id)}"><th><button type="button" class="desk-roster-name" data-expand-formation="${esc(f.id)}" aria-expanded="${expanded===f.id}">${esc(f.name)}</button></th><td>${f.step_ids.length}/${f.capacity}<span data-delta="${esc(f.id)}"></span></td><td>${esc(p?projectedFormationExperience(r,f):f.experience)}</td></tr>${expanded===f.id?`<tr><td colspan="3">${p?.phase==='RECONSTITUTE'?stepChoices(f.step_ids,f.name):`<p>${f.step_ids.length} serving step(s). ${(r.roster.prepared_skills??[]).filter(s=>s.holder===f.id).map(s=>esc(SKILLS[s.type].label)).join(' · ')||'No assigned skills'}</p>`}</td></tr>`:''}`).join('');
  const resumeReason=campaignResumeReason(r,saved,NORMANDY_SEQUENCE.find(s=>s.id===saved.bundle?.latest.replay.scenario));
  const subtitle=[current?.name,terminal?mission.status:last?.outcome,r?.stage==='PREPARED'&&!progress.ended?`Next: ${progress.destination.name}`:stage].filter(Boolean).join(' · ');
  let actions='';
  if(!r)actions='<h3>New Normandy company</h3><p>Begin with the published M1 company. Your standalone companies remain separate.</p><button id="new" class="primary">Create new campaign company</button>';
  else if(r.stage==='DEPLOYMENT')actions=terminal?`<h3>${esc(current?.name??mission.mission_name)} … ${esc(mission.status)}</h3><div class="desk-metrics"><span><strong>${mission.achievements.reduce((n,a)=>n+a.points,0)}</strong> earned XP</span><span><strong>${debriefPreview?.history.at(-1)?.casualties.length??(mission.casualties??[]).length}</strong> casualty steps across attempts</span></div><p>${debriefPreview?.preparation.available.length??0} unassigned surviving steps are available for reorganization. Record this mission once, then reorganize your surviving company. Casualties across attempts and replacement eligibility are calculated in preparation.</p><button id="debrief" class="primary">Record debrief & begin preparation</button>`:`<h3>${r.active_deployment?'Return to your mission':'Initial deployment'}</h3>${!r.active_deployment&&!r.history.length?'<button id="resume" class="primary">Set up campaign M1</button>':''}<button id="restore" ${resumeReason?'disabled':''}>Resume saved campaign mission</button>${resumeReason?`<p>${esc(resumeReason)}</p>`:''}${r.active_deployment?'<p>Complete the mission and its reattempt decision before recording the debrief.</p>':''}`;
  else if(r.stage==='PREPARED')actions=`<h3>${progress.ended?'Campaign concluded':'Company ready'}</h3>${progress.ended?`<p>${esc(progress.reason)}</p>`:`<p>Review strength, experience and skills before deployment.</p><button id="launch-next" class="primary">Set up ${esc(progress.destination.name)}</button>`}<p><strong>${p.available.length}</strong> unassigned surviving steps</p><h4>Prepared skills</h4><ul>${(r.roster.prepared_skills??[]).map(s=>`<li>${esc(r.roster.formations[s.holder]?.name)} … ${esc(SKILLS[s.type].label)}</li>`).join('')||'<li>None</li>'}</ul>`;
  else{
   actions=`<h3>${esc(stage)}</h3><div class="desk-metrics"><span><strong>${p.points}</strong> XP remaining</span>${p.phase==='REPLACEMENTS'?`<span>${p.replacements.green} Green · ${p.replacements.veteran} Veteran</span><span>${p.replacement_slots} eligible vacancies</span>`:''}</div>`;
   if(p.phase==='RECONSTITUTE')actions+=`<p>Choose an unassigned survivor below, or expand a formation on the roster to select its steps. Then choose the receiving formation.</p><label>Unassigned survivors (${p.available.length})<select id="unassigned-survivor" aria-label="Unassigned survivors" ${p.available.length?'':'disabled'}><option value="">${p.available.length?'Choose a surviving step':'No unassigned survivors'}</option>${p.available.map((id,i)=>`<option value="${esc(id)}" ${id===selectedSurvivor?'selected':''}>Survivor ${i+1} · ${esc(r.roster.steps[id].experience)}</option>`).join('')}</select></label>`;
   actions+=`<label>${p.phase==='SKILLS'?'Skill holder':'Receiving formation'}<select id="formation" aria-label="${p.phase==='SKILLS'?'Skill holder':'Receiving formation'}">${receiving.map(f=>`<option value="${esc(f.id)}" ${f.id===selectedFormation?'selected':''}>${esc(f.name)} … ${f.step_ids.length}/${f.capacity}</option>`).join('')||'<option value="">No eligible formation</option>'}</select></label>`;
   if(p.phase==='RECONSTITUTE')actions+='<button id="transfer">Apply transfer</button><p id="transfer-preview" role="status"></p><hr><h4>Promotion</h4><p id="selected-step"></p><button id="promote">Promote selected step</button><p id="promotion-preview"></p>';
   if(p.phase==='REPLACEMENTS')actions+=`<p>Only eligible company vacancies may receive replacements. New steps cannot be promoted in this preparation.</p><button id="green">Allocate Green</button><button id="veteran">Allocate Veteran</button><p id="replacement-preview" role="status"></p>`;
   if(p.phase==='SKILLS')actions+=`<label>Skill<select id="skill">${Object.entries(SKILLS).map(([id,s])=>`<option value="${id}" ${selectedSkill===id?'selected':''}>${esc(s.label)} … ${s.cost} XP</option>`).join('')}</select></label><p id="skill-effect"></p><button id="skill-buy">Assign skill</button><p id="skill-preview" role="status"></p>`;
   actions+=`<button id="next" class="primary">${p.phase==='SKILLS'?'Finish preparation':p.phase==='RECONSTITUTE'?'Continue to replacements':'Continue to skills'}</button>`;
  }
  dialog.innerHTML=deskHeader('Company personnel file',subtitle,['Reorganize & promote','Replacements','Skills','Ready'],stage,!!p&&r.stage!=='DEPLOYMENT')+`<p role="alert" class="desk-status">${esc(error)}</p><div class="desk-layout"><section class="desk-sheet"><h3>Company roster</h3><p>Select a formation to inspect its steps.</p><div class="desk-roster-scroll"><table><thead><tr><th>Formation</th><th>Strength</th><th>Experience</th></tr></thead><tbody>${roster}</tbody></table></div></section><section class="desk-sheet desk-actions">${actions}${p?`<details><summary>Preparation rules & support</summary><p>Green to Line costs 1 XP; Line to Veteran costs 3. One level per eligible step. Newly rebuilt HQs remain Green. Unspent experience expires when preparation is finished.</p><p>Supporting attachments replenish from their parent organizations. ${p.returned_passengers?.length??0} surviving passenger steps returned without using replacements.</p><p>Formation experience is finalized on completion; the roster shows the projected combined level.</p></details>`:''}</section></div><footer class="desk-footer"><button id="close">Return</button><details><summary>Records & recovery</summary><button id="export" ${!r?'disabled':''}>Export campaign record</button><button id="tactical-export" ${!saved.raw?'disabled':''}>Export campaign mission save</button>${r?.active_deployment?.start_checkpoint?'<button id="recover-start">Recover committed mission start</button><p>Restarts the committed deployment at its beginning. Export an unreadable tactical save first.</p>':''}${r?.stage==='PREPARED'?'<button id="new">Start another fresh campaign (keeps backup)</button>':''}</details></footer>`;
  const bind=(id,fn)=>{const b=dialog.querySelector('#'+id);if(b)b.onclick=()=>{try{fn();error='';}catch(e){error=e.message;}if(dialog.isConnected)render();};};
  const dispatch=operation=>commitPreparationChoices(localStorage,r,[operation]);
  for(const button of dialog.querySelectorAll('[data-desk-step]'))button.onclick=()=>{
   try{
    const phase=COMPANY_PREPARATION_PHASES[Number(button.dataset.deskStep)];
    if(phase===p.phase)return;
    let source=mission;
    if(r.stage==='PREPARED'&&!p.before_completion&&phase!=='COMPLETE'&&source?.mission_instance_id!==p.id){
     const replay=r.history.at(-1).replay,definition=NORMANDY_SEQUENCE.find(s=>s.id===replay.scenario);
     source=replay.format?importVireAdapterReplay(replay):replayMission(definition,replay);
    }
    saveCompanyPreparation(localStorage,navigateCompanyPreparation(r,phase,source),r.revision);error='';
   }catch(e){error=e.message;}
   render();dialog.querySelector(`[data-desk-step="${button.dataset.deskStep}"]`)?.focus({preventScroll:true});
  };

  bind('new',()=>startFreshCompanyCampaign(localStorage,newCompanyCampaign(scenario,crypto.randomUUID())));
  for(const [id,fn]of [['restore',()=>resume()],['resume',()=>start(r)],['launch-next',()=>start(r)],['recover-start',()=>resumeStart(r)]])bind(id,()=>{fn();close(false);});
  bind('debrief',()=>saveCompanyPreparation(localStorage,beginCompanyPreparation(r,mission),r.revision));
  bind('transfer',()=>{commitPreparationChoices(localStorage,r,selectedSteps.map(step=>({type:'TRANSFER',step,target:selectedFormation})));selectedSteps=[];selectedSurvivor='';});
  bind('promote',()=>{dispatch({type:'PROMOTE',step:selectedSteps[0]});selectedSteps=[];selectedSurvivor='';});
  for(const level of ['green','veteran'])bind(level,()=>dispatch({type:'REPLACE',level,target:selectedFormation}));
  bind('skill-buy',()=>dispatch({type:'SKILL',purchase:{type:selectedSkill,holder:selectedFormation}}));
  bind('next',()=>{dispatch({type:'NEXT'});selectedSteps=[];selectedSurvivor='';});
  bind('export',()=>download('normandy-connected-company.json',localStorage.getItem(PREPARATION_KEY)??'null'));
  bind('tactical-export',()=>download('normandy-campaign-mission-original.json',localStorage.getItem('connected-'+SAVE_KEY)??'null'));
  bind('close',()=>close());
  for(const button of dialog.querySelectorAll('[data-expand-formation]'))button.onclick=()=>{const previousSteps=new Set(r?.roster.formations[expanded]?.step_ids??[]);selectedSteps=selectedSteps.filter(id=>!previousSteps.has(id));expanded=expanded===button.dataset.expandFormation?null:button.dataset.expandFormation;render();dialog.querySelector(`[data-expand-formation="${CSS.escape(button.dataset.expandFormation)}"]`)?.focus({preventScroll:true});};
  function update(){
   selectedSurvivor=dialog.querySelector('#unassigned-survivor')?.value??selectedSurvivor;
   selectedSteps=selectedSurvivor?[selectedSurvivor]:[...dialog.querySelectorAll('[data-company-step]:checked')].map(n=>n.dataset.companyStep);
   selectedFormation=dialog.querySelector('#formation')?.value??selectedFormation;selectedSkill=dialog.querySelector('#skill')?.value??selectedSkill;
   if(p?.phase==='RECONSTITUTE'){
    const transfer=previewPreparationChoices(r,selectedSteps.map(step=>({type:'TRANSFER',step,target:selectedFormation})));
    dialog.querySelector('#transfer').disabled=!!transfer.reason;
    dialog.querySelector('#transfer-preview').innerHTML=transfer.reason?esc(transfer.reason):`<span class="desk-add">+${selectedSteps.length} incoming to ${esc(r.roster.formations[selectedFormation].name)}</span><br><span class="desk-remove">−${selectedSteps.length} from selected donors</span><br>All selected changes commit together.`;
    for(const f of formations){const node=dialog.querySelector(`[data-delta="${CSS.escape(f.id)}"]`),delta=transfer.record?transfer.record.roster.formations[f.id].step_ids.length-f.step_ids.length:0;node.className=delta>0?'desk-add':'desk-remove';node.textContent=delta?` (${delta>0?'+':''}${delta} ${delta>0?'incoming':'outgoing'})`:'';}
    const step=selectedSteps.length===1?r.roster.steps[selectedSteps[0]]:null,owner=step&&r.roster.formations[step.formation_id];
    dialog.querySelector('#selected-step').textContent=step?`${p.available.includes(step.id)?'Unassigned team':owner?.name??'Unassigned team'} … Step ${p.available.includes(step.id)?p.available.indexOf(step.id)+1:Math.max(0,owner?.step_ids.indexOf(step.id)??0)+1} · ${step.experience}`:'Select one survivor or one roster step.';
    const preview=step?previewPreparationChoices(r,[{type:'PROMOTE',step:step.id}]):{reason:'Select one step.'};
    dialog.querySelector('#promote').disabled=!!preview.reason;dialog.querySelector('#promotion-preview').textContent=preview.reason??promotionExplanation(r,step.id);
   }
   if(p?.phase==='REPLACEMENTS'){
    let messages=[];for(const level of ['green','veteran']){const preview=previewPreparationChoices(r,[{type:'REPLACE',level,target:selectedFormation}]);dialog.querySelector('#'+level).disabled=!!preview.reason;if(preview.reason)messages.push(`${level}: ${preview.reason}`);}
    dialog.querySelector('#replacement-preview').textContent=messages.join(' ');
   }
   if(p?.phase==='SKILLS'){
    const preview=previewPreparationChoices(r,[{type:'SKILL',purchase:{type:selectedSkill,holder:selectedFormation}}]);
    dialog.querySelector('#skill-buy').disabled=!!preview.reason;dialog.querySelector('#skill-effect').textContent=skillHelp[selectedSkill];dialog.querySelector('#skill-preview').textContent=preview.reason??`${SKILLS[selectedSkill].cost} XP … ${preview.record.preparation.points} remain after assignment.`;
   }
  }
  dialog.querySelector('#unassigned-survivor')?.addEventListener('change',()=>{for(const input of dialog.querySelectorAll('[data-company-step]'))input.checked=false;update();});
  for(const input of dialog.querySelectorAll('[data-company-step]'))input.addEventListener('change',()=>{selectedSurvivor='';const survivors=dialog.querySelector('#unassigned-survivor');if(survivors)survivors.value='';update();});
  for(const input of dialog.querySelectorAll('#formation,#skill'))input.addEventListener('change',update);update();dialog.scrollTop=lastStage!==stage?0:deskScroll;lastStage=stage;dialog.querySelector('.desk-roster-scroll').scrollTop=rosterScroll;
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});render();dialog.showModal();dialog.focus({preventScroll:true});dialog.scrollTop=0;return {close};
}
