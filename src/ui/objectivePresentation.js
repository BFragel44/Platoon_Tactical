const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function objectiveAssessmentMarkup(view){
 if(view.patrol||!view.objective_requirements)return '';
 const {clear_rows,success_timing}=view.objective_requirements,check=view.objective_assessment;
 const rows=clear_rows.length?`<p><b>Required rows ${clear_rows.join(', ')}:</b> ${check?`${check.rows_clear?'Clear':'Not yet clear'} — last assessed at the end of turn ${check.turn}.`:'Not yet assessed this attempt.'}</p>`:'';
 return `${rows}${success_timing==='final_turn'?`<p>Success is assessed at the end of turn ${view.turn_limit}. Meeting the requirements earlier does not end the mission; keep both objectives secured and the required rows clear for the final assessment.</p>`:''}`;
}
export function objectiveStatusMarkup(view,name){
 if(!view.objectives||view.patrol)return '';
 return `<section aria-label="Objective progress">${['primary','secondary','attack'].filter(key=>view.objectives[key]?.location).map(key=>`<p><b>${esc(key[0].toUpperCase()+key.slice(1))}:</b> ${esc(name(view.objectives[key].location))} · ${view.objectives[key].secured?'Secured':'Not secured'}</p>`).join('')}${objectiveAssessmentMarkup(view)}</section>`;
}
