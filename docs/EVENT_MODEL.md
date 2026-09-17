# Company Assault event model

Each event has a stable ID/sequence, turn, phase, impulse, type, readable text, optional structured payload and a simulation-only `hidden` flag. Events record what happened when it happened; later spotting does not rewrite old reports.

Implemented families:

- Mission start/end, objective checks, turn end.
- Phase entry/skipping, HQ activation, impulse allowance and saved commands.
- Command issued/resolved; accepted commands include issuer, recipient and target.
- Card batches and completed-batch reshuffles.
- Movement/exposure, cover attempts, observation, spotting and persistent fire.
- Contact evaluation, incoming/support fire, enemy activity and signals.
- Combat result with net-modifier breakdown; cohesion changes, formation breakdown/reconstitution, casualty provenance, radio loss, capture, withdrawal and evacuation.

`getVisibleEvents(state, 'friendly', afterSequence)` removes hidden events and references to hidden causes. Unknown sources use anonymous actors. Raw simulation events are for trusted debugging only. The UI filters operation feedback as well as using projected history.

AARs are derived from visible events: orders, casualties, formation changes and objectives. AARs intentionally do not disclose previously unknown enemy losses. Replay files contain accepted public operations; full reconstruction remains a local diagnostic capability.

Previous platoon event specifications are archived and are not the active company contract.
