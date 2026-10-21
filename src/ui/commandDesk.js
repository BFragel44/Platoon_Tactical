import {mapBoundaryLayout} from './mapBoundaries.js';
import './commandDesk.css';
export const deskEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function preparationMapLocations(locations,bounds){
 return bounds?locations.filter(l=>l.staging||l.row>=1&&l.row<=bounds.rows&&l.col>=1&&l.col<=bounds.columns):locations;
}
// Both first setup and later patrols use public controls from the current draft.
export function preparationMapControls({objectives={},phase_lines={},patrol=null}){
 const goals=structuredClone(objectives);
 if(patrol){
  delete goals.secondary;delete goals.attack;
  for(const key of ['primary','ccp','cop','concentration'])if(patrol[key])goals[key]={location:patrol[key]};
  for(const [index,location] of (patrol.route??[]).entries())goals[`Route ${index+1}`]={location};
 }
 return {objectives:goals,phaseLines:structuredClone(phase_lines??{}),mlr:patrol?[1,2]:null};
}
export function deskHeader(title,subtitle,steps=[],current='',interactive=false){
 return `<header class="desk-header"><div><p class="desk-kicker">Battalion command … Normandy</p><h2>${deskEscape(title)}</h2><p>${deskEscape(subtitle)}</p></div>${steps.length?`<ol class="desk-sequence" aria-label="Preparation sections">${steps.map((s,i)=>interactive?`<li><button type="button" data-desk-step="${i}" ${s===current?'aria-current="step"':''}>${deskEscape(s)}</button></li>`:`<li ${s===current?'aria-current="step"':''}>${deskEscape(s)}</li>`).join('')}</ol>`:''}</header>`;
}
export function deploymentMapMarkup({locations,objectives={},placements={},selected=null,selectedLabel='',allowed=[],phaseLines={},mlr=null}){
 if(!locations.length)return '';
 const layout=mapBoundaryLayout({locations,phase_lines:phaseLines,patrol:mlr?.length?{}:null});
 const min=Math.min(...locations.map(l=>l.col)),max=Math.max(...locations.map(l=>l.col));
 return `<section class="desk-map" aria-label="Public deployment map"><h3>Deployment map</h3>${selectedLabel?`<p><b>Selected … ${deskEscape(selectedLabel)}</b></p>`:''}<p>Choose a formation, then a permitted card. Unknown terrain remains concealed.</p><div class="desk-map-grid" style="--map-columns:${max-min+1}">${locations.map(l=>{
  const name=l.staging?l.name:l.known===false?`${l.row}.${l.col}`:l.name;
  const goals=Object.entries(objectives).filter(([,o])=>(o?.location??o)===l.id).map(([key])=>({primary:'Primary',secondary:'Secondary',attack:'Attack',ccp:'CCP',cop:'Outpost',concentration:'Concentration'})[key]??key);
  const occupants=Object.entries(placements).filter(([,id])=>id===l.id).map(([id])=>id);
  const mines=l.known!==false&&l.mines;
  return `<button type="button" class="desk-map-card ${l.known===false?'unknown':''} ${placements[selected]===l.id?'selected':''} ${mines?'known-minefield':''}" data-deploy-card="${deskEscape(l.id)}" ${allowed.includes(l.id)?'':'disabled'} style="${layout.cardStyle(l)}" aria-label="Deploy selected formation to ${deskEscape(name)}${mines?' — confirmed minefield':''}"><b>${deskEscape(name)}</b>${goals.length?`<strong>${goals.map(deskEscape).join(' · ')}</strong>`:''}${mines?'<span class="desk-mine-warning">⚠ Confirmed mines</span>':l.known!==false&&l.mine_path_marked?'<small>Mine path marked</small>':''}${occupants.length?`<small>${occupants.length} formation${occupants.length===1?'':'s'}</small>`:''}</button>`;
 }).join('')}${layout.boundaries.map(line=>`<div class="desk-map-line" style="grid-column:1/-1;grid-row:${line.gridRow}"><span>${deskEscape(line.label.replace(/MLR .*/, 'MLR'))}</span></div>`).join('')}</div><p>Only public terrain and friendly deployment choices are shown.</p></section>`;
}
export function bindDeskKeyboard(panel,close,previous=document.activeElement){
 const keyboard=e=>{
  if(e.key==='Escape'){e.preventDefault();close();}
  if(e.key==='Tab'){
   const focus=[...panel.querySelectorAll('button,input,select,summary,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length);
   if(!focus.length)return;
   if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1).focus();}
   else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0].focus();}
  }
 };
 panel.addEventListener('keydown',keyboard);
 return ()=>{panel.removeEventListener('keydown',keyboard);if(previous?.isConnected)previous.focus();};
}
export function clearAarNavigation(location=globalThis.location,history=globalThis.history){
 if(location?.hash==='#aar')history.replaceState(history.state,'',location.pathname+location.search);
}
export function startingFormation(state){
 const live=Object.values(state.units).filter(u=>u.faction==='friendly'&&u.steps?.length&&!u.removed&&u.command_role!=='higher_hq');
 return live.find(u=>u.id==='co')?.id??live.find(u=>u.kind==='HQ')?.id??live[0]?.id??null;
}
