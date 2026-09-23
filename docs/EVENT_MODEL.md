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

## Revision 4 combat records

`COMBAT_RESOLUTION_PREPARED` records the frozen target and pre-result stakes without drawing. `COMBAT_RESOLVED` records resolution ID, target, NCM, ordered modifiers, exact distribution, seeded raw roll and MISS/PIN/HIT result. A HIT adds `HIT_EFFECT_RESOLVED` with experience, exact effect distribution, raw roll and effect. `COMBAT_REVIEW` closes the final item while still in 3.7.4. Existing casualty, cohesion, formation and radio-loss events record consequences.

Combat playback and the AAR consume visible events and stored resolution records. Normal presentation omits raw rolls and virtual card IDs. Hidden resolutions preserve anonymous actors and strip hidden IDs and causal references. Combat and hit-effect Action Card draws no longer occur.

## Revision 3 historical model

`COMBAT_RESULT` includes its action-card ID. `COMBAT_FRAME` stores the frozen modifier breakdown, combat/hit card IDs, effect, casualty-step count and resulting formation descriptions. It inherits the target’s historical visibility. Playback consumes only these visible records, never raw state, RNG or a fresh combat calculation. A later spot cannot reveal an earlier hidden frame.

HQ impulses expose the card ID, base allowance, modifier breakdown and reserve used. `historical_reports` remain separate from current `suspected` positions. Replays carry an explicit rules revision; strict replay fails on rejected operations. The diagnostic comparison records every operation and rejection instead of silently skipping them.

`CONTACTS_COMPLETE`, contact review progress and `COMBAT_REVIEW` distinguish resolution from presentation and phase exit. Each accepted progression operation remains in replay history, so a save reconstructed during contact or combat review has the same deck, events and review position. `ASSETS_DROPPED` records pinned/paralyzed withdrawal consequences. Visible enemy projections refresh formation state immediately after combat without recalculating the frozen fire snapshot.

## Revision 5 consequence records

`CASUALTY` adds its location. `FORMATION_LOST` records formation ID, known name, faction, location and `FINAL_CASUALTY` cause only when its final step becomes a casualty. It inherits visibility at the loss; later spotting cannot disclose it. Player historical silhouettes are derived only from these visible events. `CASUALTY_PICKED_UP` and `CASUALTIES_DROPPED` explain transport outcomes. Existing evacuation events remain authoritative for removal from recovery display.

Contact presentation consumes only the current segment's visible event slice, including any visible draws and opening-fire reports. Stored outcome events supply the complete HIT reveal in one step. AARs carry `record_type: AAR`, rules/scenario metadata and seed, while replay exports continue to carry accepted executable operations.

## Revision 6 fire explanation

`FIRE_ESTABLISHED` adds a visibility-safe reason for the affected card (engaged, continuing at a cleared position, moved along the existing direction, or blocked by smoke/incoming). `FIRE_ORDER_RESULT` explains stopped, shifted or immediately reopened fire following Cease/Shift Fire. Existing source anonymization and causal-reference filtering apply. Mission-ending markers are frozen historical display, not new combat events.

## Revision 8 order records

`RECONSTITUTE` commands record `target_id` for the previously removed squad and `contributor_ids` for the chosen teams, including the selected recipient. `FORMATION_RECONSTITUTED` identifies the restored counter, its contributing teams and card. Failed attempts have only the issued order and draw; they do not remove teams. `FIRE_ORDER_RESULT` records the card-wide set of prior firing sources and any sources that reopened or shifted after refresh. UI PDF traces derive only from the existing visibility-filtered fire projection; they create no simulation events.
