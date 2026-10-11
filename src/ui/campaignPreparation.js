import {SAVE_KEY} from './localRecovery.js';
import {readCompanyPreparation,startFreshCompanyCampaign,saveCompanyPreparation,newCompanyCampaign,beginCompanyPreparation,prepareCompany,PREPARATION_KEY} from '../sim/company/campaignPreparation.js';
import {SKILLS} from '../sim/company/skills.js';
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function openCompanyPreparation({scenario,mission,start,resume,download}){
 const dialog=document.createElement('dialog');dialog.className='company-preparation';document.body.append(dialog);let error='';
 function render(){
  let r;try{r=readCompanyPreparation(localStorage);}catch(e){error=e.message;}
  const p=r?.preparation,companyFormations=Object.values(r?.roster.formations??{}).filter(f=>!p||p.fieldable.includes(f.id)),formations=companyFormations.filter(f=>!p?true:p.phase==='SKILLS'?['HQ','STAFF'].includes(f.kind)&&f.step_ids.length>0:p.phase==='REPLACEMENTS'?f.step_ids.length<f.capacity:true),steps=Object.values(r?.roster.steps??{}).filter(t=>t.disposition==='ACTIVE'&&(!p||!p.attachment_steps.includes(t.id)));
  dialog.innerHTML=`<h2>Normandy company</h2><p role="status">${esc(error)}</p><p>${esc(r?.stage??'No campaign company')} ${p?` / ${esc(p.phase)} / ${p.points} experience points`:''}</p>
   ${!r||r.stage==='PREPARED'?'<button id="new">Start fresh campaign M1</button>':''}
   ${r?.stage==='DEPLOYMENT'?'<button id="resume">Set up campaign M1</button><button id="restore">Resume saved campaign M1</button><button id="debrief">Debrief current mission</button>':''}
   ${r?.stage==='PREPARATION'?`<p>${p.phase==='RECONSTITUTE'?'Assign surviving steps to company formations, then promote eligible steps: Green to Line costs 1; Line to Veteran costs 3. Newly rebuilt HQs remain Green.':p.phase==='REPLACEMENTS'?'Allocate replacements to understrength formations. These steps cannot be promoted during this preparation.':'Buy single-use skills for surviving company HQs and staff. Unspent experience expires when preparation ends.'}</p>${p.phase==='RECONSTITUTE'?`<label>Company step<select id="step">${steps.map(t=>`<option value="${esc(t.id)}">${esc(r.roster.formations[t.formation_id]?.name??'Unassigned team')} / ${esc(t.experience)} / step ${steps.indexOf(t)+1}</option>`).join('')}</select></label>`:''}<label>${p.phase==='SKILLS'?'Skill holder':'Receiving formation'}<select id="formation">${formations.map(f=>`<option value="${esc(f.id)}">${esc(f.name)} / ${f.step_ids.length}/${f.capacity}</option>`).join('')}</select></label>
   ${p.phase==='RECONSTITUTE'?'<button id="transfer">Transfer selected step</button><button id="promote">Promote selected step</button>':''}
   ${p.phase==='REPLACEMENTS'?`<p>${p.replacements.green} Green / ${p.replacements.veteran} Veteran replacements available; ${p.replacement_slots} casualty/prisoner vacancies</p><button id="green" ${!p.replacements.green||!p.replacement_slots||!formations.length?'disabled':''}>Allocate Green</button><button id="veteran" ${!p.replacements.veteran||!p.replacement_slots||!formations.length?'disabled':''}>Allocate Veteran</button>`:''}
   ${p.phase==='SKILLS'?`<label>Skill<select id="skill">${Object.entries(SKILLS).map(([id,s])=>`<option value="${id}">${esc(s.label)} / ${s.cost} points</option>`).join('')}</select></label><button id="skill-buy">Buy for selected HQ/staff</button>`:''}<button id="next">${p.phase==='SKILLS'?'Finish preparation':'Complete this step'}</button>`:''}
   ${r?.stage==='PREPARED'?'<p>Company prepared. Next mission launch remains gated pending battlefield carryover.</p>':''}
   ${p?`<p>Unassigned surviving steps: ${p.available.length}</p><p>Prepared skills: ${p.skills.map(x=>esc(SKILLS[x.type].label)+' / '+esc(r.roster.formations[x.holder]?.name)).join(', ')||'None'}</p>`:''}<ul>${companyFormations.map(f=>`<li>${esc(f.name)}: ${f.step_ids.length}/${f.capacity} / ${esc(f.experience)}</li>`).join('')}</ul><button id="export">Export campaign record</button><button id="tactical-export">Export campaign mission save</button><button id="close">Close</button>`;
  const bind=(id,fn)=>{const b=dialog.querySelector('#'+id);if(b)b.onclick=()=>{try{fn();error='';}catch(e){error=e.message;}render();};};
  const dispatch=operation=>saveCompanyPreparation(localStorage,prepareCompany(r,operation),r.revision);
  bind('new',()=>startFreshCompanyCampaign(localStorage,newCompanyCampaign(scenario,crypto.randomUUID())));
  bind('restore',()=>{resume();dialog.close();dialog.remove();});
  bind('resume',()=>{dialog.close();dialog.remove();start(r);});
  bind('debrief',()=>saveCompanyPreparation(localStorage,beginCompanyPreparation(r,mission),r.revision));
  bind('transfer',()=>dispatch({type:'TRANSFER',step:dialog.querySelector('#step').value,target:dialog.querySelector('#formation').value}));
  bind('promote',()=>dispatch({type:'PROMOTE',step:dialog.querySelector('#step').value}));
  for(const level of ['green','veteran'])bind(level,()=>dispatch({type:'REPLACE',level,target:dialog.querySelector('#formation').value}));
  bind('skill-buy',()=>dispatch({type:'SKILL',purchase:{type:dialog.querySelector('#skill').value,holder:dialog.querySelector('#formation').value}}));
  bind('tactical-export',()=>download('normandy-campaign-mission-original.json',localStorage.getItem('connected-'+SAVE_KEY)??'null'));
  bind('next',()=>dispatch({type:'NEXT'}));bind('export',()=>download('normandy-connected-company.json',localStorage.getItem(PREPARATION_KEY)??'null'));
  bind('close',()=>{dialog.close();dialog.remove();});
 }
 render();dialog.showModal();
}
