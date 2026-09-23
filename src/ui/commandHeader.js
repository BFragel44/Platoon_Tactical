import {PHASES} from '../sim/company/engine.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function commandHeader({v,name,seed,recovery,recoveryPending,locked,combatBlocked,advanceLabel,phaseIndex,progress,feedback,feedbackKind}) {
 const next=progress?.remaining?'Next contact card':PHASES[(phaseIndex+1)%PHASES.length][1];
 return `<div class="command-ribbon compact-header">
 <header class="compact-status">
  <div class="header-navigation"><nav aria-label="Game menus">
   ${['File','Mission','Settings'].map(label=>`<button type="button" id="menu-${label.toLowerCase()}" data-menu="${label.toLowerCase()}" aria-expanded="false" aria-controls="panel-${label.toLowerCase()}">${label}</button>`).join('')}
  </nav><div class="compact-turn">TURN <strong>${v.turn}</strong> / ${v.turn_limit}</div></div>
  <details class="header-result"><summary><b>${esc(feedbackKind)}</b><span role="status">${esc(feedback)}</span></summary><div class="header-popover result-full">${esc(feedback)}</div></details>
  <div class="header-phase"><details><summary><h1>${esc(v.phase_label)}</h1></summary><div class="header-popover phase-full">${esc(progress?'Review resolved results before continuing.':v.phase_description)}</div></details><p>Next: ${esc(next)}</p></div>
  <div class="header-commands"><strong>${v.impulse?.commands??'—'}</strong> commands<small>${v.impulse?esc(name(v.impulse.hq))+' · '+v.impulse.spent+'/6 spent':'No active command impulse'}</small></div>
  <button id="advance" class="primary" ${locked||combatBlocked||(!v.impulse&&v.eligible_hqs.length)?'disabled':''}>${advanceLabel}</button>
 </header>
 <section id="panel-file" class="header-popover menu-panel" aria-labelledby="menu-file" hidden>
 <p>Progress saves automatically after accepted operations.</p>
 <div class="setup"><label>Replay seed<input id="seed" value="${esc(seed)}"></label><button id="restart">Start new mission</button><button id="export">Export current replay</button></div>
      <div class="recovery-controls"><button id="resume" ${!recovery.bundle?'disabled':''}>Resume latest</button><button id="restore" ${!recovery.bundle?'disabled':''}>Restore turn start</button><button id="save-export" ${!recovery.raw?'disabled':''}>Export saved record</button><button id="previous-export">Export prior replacement backup</button></div>
      <p>${recovery.bundle?`Latest: turn ${recovery.bundle.latest.turn} · ${esc(recovery.bundle.latest.phase)} · ${esc(recovery.bundle.latest.timestamp)}. Turn start: ${recovery.bundle.turnStart.turn} · ${esc(recovery.bundle.turnStart.phase)} · ${esc(recovery.bundle.turnStart.timestamp)}.`:'No readable recovery record.'}</p>

 </section>
 <section id="panel-mission" class="header-popover menu-panel" aria-labelledby="menu-mission" hidden>
 <h2>Mission</h2><p>${esc(v.briefing)}</p><p>${v.contacts.filter(c=>!c.resolved).length} contacts remaining · Turn ${v.turn} of ${v.turn_limit} · ${esc(v.status)}</p>
 <details><summary>Sequence of play</summary><ol class="sequence">${PHASES.map(([id,label])=>`<li ${id===v.phase?'aria-current="step"':''}>${esc(label)}</li>`).join('')}</ol></details>
 </section>
 <section id="panel-settings" class="header-popover menu-panel" aria-labelledby="menu-settings" hidden><h2>Settings</h2><p>Game settings coming later.</p></section>
     <section class="command-mat" aria-label="HQ command display">${v.units.filter(u=>['HQ','STAFF'].includes(u.kind)).map(u=>`<div class="${v.impulse?.hq===u.id?'current-hq':''} ${!u.steps||u.removed||u.cohesion!=='GOOD'?'hq-degraded':''}"><b>${esc(u.name)}</b><small class="hq-capability">${!u.steps||u.removed?'Eliminated · no command capability':u.cohesion==='GOOD'?`${u.pinned?'Pinned · ':''}Command side · ${u.steps} step${u.steps===1?'':'s'}`:`${u.cohesion==='F'?'Fire Team side':'Degraded '+u.cohesion} · command side unavailable`}</small><small>${u.radios.length?`${esc(u.radios.join(' / '))} radio${u.radios.length===1?'':'s'}`:'No carried radio'}</small>${u.activated?`<small class="activation-status">${u.impulse_completed?'Activated · impulse completed':v.impulse?.hq===u.id?'Activated · spending commands':'Activated · commands available in 3.3.1c'}</small>`:''}<span>${v.impulse?.hq===u.id?`${v.impulse.commands} available · ${v.impulse.spent}/6 spent`:`${u.saved} saved`}</span><small title="${esc(u.communication_reason)}">${esc(u.communication??(v.impulse?'No communication link':'No active issuer'))}</small>${v.eligible_hqs.includes(u.id)&&!v.impulse?`<button data-hq="${u.id}" ${v.impulse||locked?'disabled':''}>Select HQ</button>`:''}</div>`).join('')}</section>
 </div>`;
}

// Bind presentation interactions only; no simulation or persistence calls.
export function bindCommandHeader(root,{openFile=false}={}) {
 const header=root.querySelector('.compact-header');
 let current=null;
 const buttons=[...header.querySelectorAll('[data-menu]')];
 const close=(focus=false)=>{if(!current)return;const button=header.querySelector(`[data-menu="${current}"]`);header.querySelector(`#panel-${current}`).hidden=true;button.setAttribute('aria-expanded','false');current=null;if(focus)button.focus();};
 const open=id=>{close();header.querySelectorAll('.header-result,.header-phase details').forEach(d=>d.open=false);current=id;header.querySelector(`#panel-${id}`).hidden=false;header.querySelector(`[data-menu="${id}"]`).setAttribute('aria-expanded','true');};
 for(const button of buttons){button.onclick=()=>current===button.dataset.menu?close(true):open(button.dataset.menu);button.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();open(button.dataset.menu);header.querySelector(`#panel-${current} button:not(:disabled),#panel-${current} input,#panel-${current} summary`)?.focus();}};}
 const dismiss=e=>{if(current&&!e.target.closest('.menu-panel,[data-menu]'))close();};
 const keyboard=e=>{if(e.key==='Escape'){if(current){e.preventDefault();close(true);}else for(const d of header.querySelectorAll('details[open]')){d.open=false;d.querySelector('summary')?.focus();}}};
 const focusout=e=>{if(current&&!header.contains(e.relatedTarget))close();};
 document.addEventListener('click',dismiss);document.addEventListener('keydown',keyboard);header.addEventListener('focusout',focusout);
 const measure=()=>root.style.setProperty('--command-header-height',`${Math.ceil(header.getBoundingClientRect().height)}px`);
 const observer=new ResizeObserver(measure);observer.observe(header);measure();if(openFile)open('file');
 return ()=>{observer.disconnect();document.removeEventListener('click',dismiss);document.removeEventListener('keydown',keyboard);header.removeEventListener('focusout',focusout);};
}
