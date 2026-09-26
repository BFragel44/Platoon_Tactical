# Company Assault event model

## Current standalone validation update — September 25, 2026

Content 11 adds hidden CONTACT_POSITION_REJECTED records when the actual building-cover draw cannot support contact placement. A nearer legal position is attempted; no rejected cover leaks into committed terrain. These internal records must not reveal hidden enemy identities or terrain through visible history.


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

## Revision 9 mission foundation

Executable records add `setup` alongside scenario identity, content version, rules version and seed. `MISSION_SETUP_CONFIRMED` records confirmed input choices; `TERRAIN_REVEALED` records newly visible terrain. Previewing setup creates no events in the active mission and writes no save.

Development-only mission events include `HQ_EVENT`, `HQ_EVENT_NONE`, `HQ_OBLIGATION`, `MINEFIELD_FOUND`, `MINE_CHECK`, `SNIPER_TARGET`, `PACKAGE_REJECTED` and `ACHIEVEMENT`. Package rejection and hidden enemy draw details remain private. Their full semantics and visibility matrix are not certified yet; Keep Up the Fire is unavailable until the outstanding checklist is complete. AAR metadata includes mission identity, setup and draft achievement records. An AAR remains a report, not an executable replay.

Keep Up the Fire content v2 adds private `CONTACT_DIRECTION_REJECTED` records for off-map/illegal direction redraws, and visible `CONTACT_EXHAUSTED` when no package can be legally deployed. Failed atomic placements retain draw history with contiguous event IDs; they retain no partial deployment events. Mission `UNIT_CAPTURED` records include faction, location and captured step IDs; observable captures expose the captured formation. `ENEMY_CASUALTY_CAPTURED` identifies a captured casualty step and location. Achievement keys deduplicate these steps. Positional `ACHIEVEMENT` events are emitted on mission termination, before `MISSION_ENDED`, rather than on temporary control. Course event payloads remain unchanged.

Content v3 fire relationships may contain several affected cards for the same tripod source and direction. Additional affected-card records use `GRAZING_FIRE`; each has the same source identity and its own target. Visibility filtering still applies per affected card. These relationships feed the existing frozen combat snapshot. `ENEMY_ACTIVITY_REDRAW` records a rejected fortification Shift Fire result and is hidden when the formation is unspotted. Unit LOS projections include occupied elevation only for friendly or known enemy formations; terrain elevations themselves remain unchanged.

Content v4 support projections optionally include sanitized `agency` (`artillery`/`mortar`) and `ammo` (`HE`/`WP`), never source formation IDs. WP grenade markers retain type `GRENADE` with `weapon: WP`; `WP_DEPLOYED` records screening regardless of hit or miss, followed by the normal grenade-attempt/result history. `WP_ATTACK` is a recorded command and strict replay reconstructs its asset consumption and draws. Registration belongs to each firing agency (one shared enemy-mortar entry), with no per-spotter duplicate registration. Earlier development content versions fail strict loading.

### Keep Up the Fire temporary mortar directions

`MORTAR_PDF_PLACED` records an ordered one-step mortar direct-lay direction before its grenade attempt, with visible actor (or null), origin and target card. Hidden-only attempts remain hidden. This event is distinct from successful grenade VOF: a miss still supplies a temporary PDF for crossfire. Player fire projections mark these relationships `pdf_only: true`, `value: null`; they must not render as basic VOF or movement-danger warnings. Cleanup removes them. Keep Up the Fire development content version is 5; Company Assault remains content 4 under rules revision 9.

### Keep Up the Fire content v6: transported items after combat

`ASSETS_TRANSFERRED` records the removed original formation (`actor`), final surviving team (`recipient`) and card (`location`). Equipment drops use `ASSETS_DROPPED` with `actor`, `location`, equipment `key` and `quantity`. Both events use the original formation's visibility: unseen enemy breakdowns do not become player reports. Transfers preserve physical items and carried casualty ownership; they do not grant commands or restore cohesion.

Keep Up the Fire content v7 free unloading uses replay `submitCommand` operations (`DROP_LOAD` / `DROP_CASUALTY`) and an `ASSETS_DROPPED` event. These operations consume no command, action-attempt allowance, draw or RNG and need no active impulse. They deliberately do not recalculate fire during frozen combat review. Ground equipment records preserve `cover` for pickup-area eligibility.

Content v8 mission `COVER_ATTEMPT` adds `location`, occupied `cover` (null on failure), and `upper_story`. `SEEK_COVER_UPPER` is an explicit replay command sharing the normal seek-cover allowance. Combined grenade source context is labelled **Combined grenade effects**, with no source identity assigned to the aggregate; underlying visible attempt events retain individual attribution. Frozen combat records store the cumulative grenade value.

Content v9 `CONTACT_REMOVED` records `location` and `reason: ENEMY_FIRE_PATH` when opening enemy fire removes an intervening same-level PC. No package or contact draws occur. No attacker identity or causal reference is exposed. Hidden-only fire produces a hidden event. The contact stores `removal_reason` alongside its resolved flag, distinguishing removal from evaluated contact.

Content v10 `MAP_EXPANDED` records `location` and `terrain_card` for new face-up terrain drawn during contact placement. These records contain terrain only, never a hidden counter identity. Rejected package attempts retain expansion events and terrain draws. `boundaries` stores the original map rows/columns independently from expanded locations; `outside_boundary` identifies cards friendly units cannot enter.
