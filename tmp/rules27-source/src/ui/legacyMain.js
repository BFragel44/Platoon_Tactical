import '../style.css';
import { advancePhase, createMission, submitCommand, endTurn, abortMission, getPlayerView, getVisibleEvents, getAfterActionReport } from '../sim/index.js';
import { scenarios } from '../scenarios/m0TestScenario.js';
import { formatVisibleEvent, orderLabels, orderHelp, turnSummary } from './viewModel.js';

const app = document.querySelector('#app');
let scenarioKey = 'training';
let seed = 'spot-3';
let mission = createMission(scenarios[scenarioKey], seed);
let selected = 'team_alpha';
let feedback = 'Select a team and give an order. Orders take effect immediately.';
let summaryTurn = null;
const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const titleCase = value => value.toLowerCase().replaceAll('_',' ');
function locationName(view, id) { return view.locations.find(l => l.id === id)?.name ?? 'Unknown'; }

function teamCard(team, view, compact = false) {
  const attached = view.leader.team_id === team.id;
  if (compact) return `<button class="team-chip ${selected === team.id ? 'selected' : ''}" data-team="${team.id}"><b>${esc(team.name)}${attached ? ' · HQ' : ''}</b><span class="state ${team.tactical_state.toLowerCase()}">${titleCase(team.tactical_state)}${team.exposed ? ' · exposed' : ''}</span></button>`;
  return `<button class="team-card ${selected === team.id ? 'selected' : ''}" data-team="${team.id}">
    <span class="team-name">${esc(team.name)} ${attached ? '<span class="leader-mark">HQ</span>' : ''}</span>
    <span>${esc(locationName(view,team.location_id))}</span>
    <span class="state ${team.tactical_state.toLowerCase()}">${titleCase(team.tactical_state)} · ${team.effective_personnel}/4 ready</span>
    <span>${team.exposed ? 'Exposed · ' : ''}${team.occupied_cover_id ? 'Additional cover · ' : ''}${team.in_command ? 'In command' : 'Distant: +1 command'}</span>
  </button>`;
}
function mapCard(location, view) {
  const units = view.teams.filter(t => t.location_id === location.id);
  const enemy = view.spotted_enemies.filter(t => t.location_id === location.id && t.status === 'SPOTTED');
  const incoming = view.fire_relationships.filter(r => r.target_location_id === location.id);
  const suspect = view.suspected_locations.includes(location.id);
  const contact = view.potential_contacts.some(c => c.status === 'UNRESOLVED' && c.trigger_location_ids.includes(location.id));
  return `<article class="location-card ${location.id === view.objective.location_id ? 'objective' : ''} ${incoming.length ? 'under-fire' : ''}">
    <div class="location-heading"><h3>${esc(location.name)}</h3><span class="terrain">${location.protection === 0 ? 'Open' : location.protection === 1 ? 'Light terrain' : 'Strong terrain'}</span></div>
    ${location.id === view.objective.location_id ? '<span class="objective-tag">MISSION OBJECTIVE</span>' : ''}
    <p class="muted">${esc(location.description)}</p>
    <div class="location-units">${units.map(t => teamCard(t,view,true)).join('')}
      ${enemy.map(t => `<div class="enemy-marker">${esc(t.coarse_type)} · ${titleCase(t.tactical_state)}</div>`).join('')}
      ${suspect ? '<div class="suspected">Suspected enemy firing position</div>' : ''}
      ${contact ? '<div class="potential">? Contact risk on this approach</div>' : ''}
    </div>
    ${location.cover_features.length ? '<p class="cover-label">Discovered sheltered position</p>' : ''}
    ${incoming.length ? `<p class="fire-label">Incoming fire from ${[...new Set(incoming.map(r => locationName(view,r.source_location_id)))].map(esc).join(', ')}</p>` : ''}
    <div class="links"><span>Move to</span> ${location.connected_location_ids.map(id => esc(locationName(view,id))).join(' · ')}</div>
    <div class="links"><span>Fire lanes</span> ${location.fire_location_ids.length ? location.fire_location_ids.map(id => esc(locationName(view,id))).join(' · ') : 'None'}</div>
  </article>`;
}
function routeDiagram(view) {
  const positions = { loc_orchard_edge:[70,65], loc_lane:[220,65], loc_crossroads:[380,22], loc_farmyard:[380,108], loc_stone_house:[540,65], loc_ridge:[690,65] };
  const edges = view.locations.flatMap(l => l.connected_location_ids.filter(id => l.id < id).map(id => [l.id,id]));
  const line = (from,to,fire=false) => { const a=positions[from], b=positions[to]; return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${fire?'route-fire':'route-link'}"/>`; };
  return `<svg class="route-diagram" viewBox="0 0 760 140" role="img" aria-label="Movement routes: Orchard Edge to Sunken Lane, branching through Crossroads or Farmyard to Stone House, then Low Ridge. Dashed amber lines indicate active fire.">
    ${edges.map(([a,b])=>line(a,b)).join('')}${view.fire_relationships.map(r=>line(r.source_location_id,r.target_location_id,true)).join('')}
    ${view.locations.map(l=>{const [x,y]=positions[l.id];return `<g><circle cx="${x}" cy="${y}" r="5"/><text x="${x}" y="${y+19}" text-anchor="middle">${esc(l.name)}</text></g>`;}).join('')}</svg>`;
}
function ordersPanel(view) {
  const team = view.teams.find(t => t.id === selected);
  const options = view.command_options_by_team[selected];
  return `<aside class="panel orders"><div class="eyebrow">COMMAND ELEMENT</div><h2>${esc(team.name)}</h2>
    <p class="state ${team.tactical_state.toLowerCase()}">${titleCase(team.tactical_state)} · suppression ${team.suppression}/90</p>
    <div class="meter"><span style="width:${team.suppression/90*100}%"></span></div>
    <p>${team.incoming_fire.length ? `Under fire from ${[...new Set(team.incoming_fire.map(r=>locationName(view,r.source_location_id)))].map(esc).join(', ')}. ${team.exposed ? 'Movement exposure increases danger.' : 'Terrain and cover reduce danger.'}` : 'No incoming fire. Holding costs no commands.'}</p>
    <p class="muted">${team.fire_target_location_id ? 'Maintaining fire toward ' + esc(locationName(view,team.fire_target_location_id)) + '.' : 'Will engage eligible threats automatically.'}</p>
    ${Object.entries(options).map(([type, option]) => {
      const targeted = ['MOVE','DIRECT_FIRE','ASSAULT','TRANSFER_LEADER'].includes(type);
      return `<div class="order-group"><div class="order-heading"><b>${orderLabels[type]}</b><span>${option.cost} CP</span></div>
        <p class="muted">${orderHelp[type]}</p>
        ${targeted ? `<div class="order-targets">${option.target_ids.map(id =>
          `<button data-order="${type}" data-target="${id}" ${option.available ? '' : 'disabled'}>${esc(type === 'TRANSFER_LEADER' ? view.teams.find(t=>t.id === id).name : locationName(view,id))}</button>`).join('')}</div>`
          : `<button data-order="${type}" ${option.available ? '' : 'disabled'}>${orderLabels[type]}</button>`}
        ${!option.available ? `<p class="reason">${esc(option.explanation)}</p>` : ''}
      </div>`;
    }).join('')}
    <details><summary>Personnel and capabilities</summary><ul class="personnel">${view.soldiers.filter(s=>s.team_id===selected).map(s=>
      `<li>${esc(s.name)}<small>${titleCase(s.role_tags[0])} · ${titleCase(s.condition)}</small></li>`).join('')}
      ${view.leader.team_id === selected ? `<li>${esc(view.leader.name)}<small>Platoon leader · ${titleCase(view.leader.condition)}</small></li>` : ''}</ul></details>
  </aside>`;
}
function render() {
  const view = getPlayerView(mission, 'friendly');
  const events = getVisibleEvents(mission, 'friendly');
  const aar = getAfterActionReport(mission);
  const summary = summaryTurn ? turnSummary(events, summaryTurn) : [];
  const meaningful = events.filter(e => formatVisibleEvent(e) && e.type !== 'SUPPRESSION_CHANGED');
  const objectiveText = view.objective.secured ? 'Secured' : view.objective.held_since_turn !== null ?
    'Occupied — hold through turn ' + (view.objective.held_since_turn + 1) : 'Take and hold Stone House';
  const mapOrder = ['loc_orchard_edge','loc_lane','loc_crossroads','loc_farmyard','loc_stone_house','loc_ridge'];
  app.innerHTML = `<header class="topbar">
    <div><div class="eyebrow">M0 / PLATOON COMMAND</div><h1>Platoon Tactical</h1></div>
    <div class="turn-stat">TURN <strong>${view.turn}</strong><small>of ${view.objective.turn_limit}</small></div>
    <div class="command-stat"><strong>${view.command_capacity}</strong> commands available<small>${view.command_allowance} issued + ${view.command_reserve} carried into this turn</small></div>
    <button class="primary" id="end-turn" ${view.status !== 'ACTIVE' ? 'disabled' : ''}>End Turn →</button>
  </header>
  <section class="briefing"><div><span class="eyebrow">MISSION</span><h2>${esc(objectiveText)}</h2><p>${esc(view.briefing)}</p></div>
    <div class="setup"><label>Exercise<select id="scenario"><option value="training" ${scenarioKey==='training'?'selected':''}>Known defender</option><option value="uncertain" ${scenarioKey==='uncertain'?'selected':''}>Uncertain contact</option></select></label>
    <label>Seed<input id="seed" value="${esc(seed)}"></label><button id="restart">Restart exercise</button></div></section>
  <div role="status" class="feedback">${esc(feedback)}</div>
  <section class="roster" aria-label="Platoon teams">${view.teams.map(t=>teamCard(t,view)).join('')}</section>
  <div class="workspace"><main>
    ${aar ? `<section class="panel aar"><div class="eyebrow">AFTER-ACTION REPORT</div><h2>${esc(titleCase(aar.outcome))}</h2>
      <p>${aar.orders.length} orders · ${aar.friendly_casualties.length} friendly casualties · ${aar.turns} turns</p>
      <h3>Outcome</h3><ul>${aar.objectives.map(e=>`<li>${esc(formatVisibleEvent(e))}</li>`).join('')}</ul>
      <h3>Casualties</h3><ul>${aar.casualties.length ? aar.casualties.map(e=>`<li>${esc(formatVisibleEvent(e))}</li>`).join('') : '<li>No recorded casualties.</li>'}</ul>
      <p class="muted">The history below retains what your platoon knew at the time.</p></section>` : ''}
    <section class="panel map-panel"><div class="section-heading"><h2>Command map</h2><span>Connections govern movement and fire.</span></div>
      ${routeDiagram(view)}<div class="battlefield">${mapOrder.map(id=>mapCard(view.locations.find(l=>l.id===id),view)).join('')}</div>
    </section>
    ${summaryTurn ? `<section class="panel turn-summary"><h2>Turn ${summaryTurn} summary</h2>${summary.length ? '<ul>'+summary.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>' : '<p>No major changes. Teams held their positions.</p>'}</section>` : ''}
    <section class="panel history"><h2>${aar ? 'Mission history and orders' : 'Platoon reports'}</h2>
      <ol id="event-log">${meaningful.slice().reverse().map(e=>`<li><span class="event-turn">T${e.turn}</span><span>${esc(formatVisibleEvent(e))}</span></li>`).join('')}</ol>
      <details><summary>Visible diagnostics</summary><p>Phase: ${esc(view.phase)}. Hidden simulation events are excluded.</p>
      <button id="advance" ${view.status !== 'ACTIVE' ? 'disabled' : ''}>Step internal phase</button>
      <pre>${esc(JSON.stringify(events.slice(-12),null,2))}</pre></details>
    </section>
    <div class="abort-row"><button id="abort" ${view.status !== 'ACTIVE' ? 'disabled' : ''}>Abort mission</button><span>The encounter ends immediately and records an aborted outcome.</span></div>
  </main>${ordersPanel(view)}</div>`;
  app.querySelectorAll('[data-team]').forEach(button => button.addEventListener('click', () => { selected=button.dataset.team; render(); }));
  app.querySelectorAll('[data-order]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.order; const target = button.dataset.target;
    const input = { type, team_id: selected, faction_id: 'friendly',
      target: target ? type === 'TRANSFER_LEADER' ? {team_id:target} : {location_id:target} : null };
    const result = submitCommand(mission,input); mission=result.state;
    const report = getVisibleEvents(mission,'friendly').filter(e=>result.events.some(r=>r.id===e.id) && formatVisibleEvent(e));
    const significant = report.filter(e => !['COMMAND_ISSUED', 'FIRE_CEASED', 'UNIT_EXPOSED'].includes(e.type));
    feedback = result.accepted ? (significant.length ? significant : report).map(formatVisibleEvent).slice(0,4).join(' ') : 'Order unavailable: ' + result.reason;
    render();
  }));
  app.querySelector('#end-turn').addEventListener('click',()=> {
    summaryTurn=mission.turn; mission=endTurn(mission).state;
    feedback=mission.status==='ACTIVE' ? 'Turn resolved. Review the reports and choose your next orders.' : 'Encounter complete. Review the after-action report.';
    render();
  });
  app.querySelector('#advance').addEventListener('click',()=> { mission=advancePhase(mission).state; feedback='Diagnostic phase: '+mission.phase; render(); });
  app.querySelector('#abort').addEventListener('click',()=> { mission=abortMission(mission).state; feedback='Mission aborted. The after-action report is ready.'; render(); });
  app.querySelector('#restart').addEventListener('click',()=> {
    scenarioKey=app.querySelector('#scenario').value; seed=app.querySelector('#seed').value.trim() || 'spot-3';
    mission=createMission(scenarios[scenarioKey],seed); selected='team_alpha'; summaryTurn=null;
    feedback='Exercise ready. Orders take effect immediately; End Turn resolves the fight.'; render();
  });
}
render();
