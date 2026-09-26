# Company Assault architecture

## Current standalone validation update — September 25, 2026

Keep Up the Fire content 11 starts through validated setup confirmation. Public createMission records setup for strict replay. Contact placement probes possible upper-story elevation without mutation, then verifies actual cover and LOS in the atomic package trial. Failed expanded positions retain terrain without tentative covers.


## Boundary

`src/sim/company/` is DOM-independent. `src/scenarios/companyAssault.js` authors the course. `src/ui/companyMain.js` renders only player projections and visible event text. The old platoon modules remain regression fixtures; the public simulation index dispatches by `ruleset`.

Public operations retain immutable input semantics:

- `createMission(scenario, seed)` constructs `company-v1` state.
- `submitCommand(state, {type, issuer_id, unit_id, target_id})` validates and immediately resolves an order. Rejection preserves state and RNG.
- `selectHQ(state, id)` starts a chosen eligible subordinate impulse; `SELECT_HQ` is also accepted by submitCommand.
- `advancePhase(state)` progresses the displayed segment, or completes the active impulse. Contacts use one reviewable result per call. Combat resolves once and remains in 3.7.4 until a later call continues to cleanup. Remaining eligible subordinate HQs must be selected before leaving their segment.
- `resolveCombat(state, resolutionId)` resolves only the current pending combat item, records the replay operation and consumes one seeded outcome roll plus one hit-effect roll only on HIT.
- `endTurn(state)` is diagnostic fast-forward only; unused commands are saved/discarded according to impulse rules.
- `abortMission`, `getPlayerView`, `getVisibleEvents`, `getAfterActionReport` support mission ending and historical player views.
- `exportReplay` records scenario/rules version, seed and accepted operations. `replayMission` reconstructs state/history and rejects mismatched versions.

## State and resolution

Core state contains formations with step/personnel provenance, HQ reserves and impulses, locations/cover, PCs and enemy counter pool, knowledge, fire relationships, support missions, combat markers, casualties, radio assets, action deck order/discard, RNG, events and reviewable segment progress.

`core.js` handles the normalized GMT deck, seeded shuffle and event creation. Full attempt batches are drawn before reshuffling. `combatProbability.js` derives immutable 50-card outcome tables and provides pure seeded weighted resolvers without changing the deck. `battlefield.js` owns the authoritative combat-exposure calculation as well as communications, LOS and automatic fire. `actions.js` handles eligibility and immediate orders. `combat.js` prepares and resolves frozen combat items alongside contacts and enemy activity. `engine.js` coordinates phases, replay operations and sanitized projections.

Ordinary map changes refresh fire immediately. Combat effects freeze all target modifiers before applying any results and delay fire updates until cleanup. Stable unit ordering ensures dictionary insertion order cannot alter results.

Rules revision 4 stores pending combat resolution IDs, sanitized source context, incoming relationships, exact distributions, NCM modifiers, result and review status. `advancePhase` cannot leave 3.7.4 until all visible items are resolved and reviewed. Diagnostic `endTurn` resolves pending items automatically. Presentation stage is local recovery data and cannot mutate simulation state.

## Visibility and diagnostics

Simulation events may contain hidden information. Never render raw operation `events` without filtering their `hidden` flag. The normal history and AAR use `getVisibleEvents`, which also strips hidden causal references. Unspotted fire sources are anonymous; their location and friendly consequences may be reported. Deck order, counter pools and unknown enemy records are absent from the player view.

Replay exports are reproducibility artifacts, not secure multiplayer saves: a seed plus rules can reconstruct hidden information. No save migration is required; old in-memory missions are not loaded into this ruleset.

## Rules revision 3 recovery foundation

The dispatch key remains `company-v1`; `rules_version: 3` and scenario version 3 identify the resolution/recovery contract. Old exports and local saves are not migrated. `compareReplay(scenario, record)` is a diagnostic API returning source/target rules revisions, operation acceptance/reasons, resulting outcome and visible events. It does not certify historical orders as a legal new playthrough.

Player projections include formation LOS, communication explanations, current-impulse attempts and separate current/historical firing reports. Combat playback is a pure visible-event projection in `src/ui/combatPlayback.js`. UI navigation has no simulation calls. Enemy activity tracks processed IDs across card movement. Ordinary fire updates reconcile card PDFs; combat still freezes effects until cleanup.

Communication LOS is separate from combat/spotting LOS so staging radio links do not create staging fire. `segment_progress` records contact/combat review state. `src/ui/localRecovery.js` stores a versioned strict replay, presentation position and start-of-turn checkpoint in one local-storage bundle. Reconstruction always passes through `replayMission`; incompatible records fail visibly. Marker presentation is a pure projection in `src/ui/fireMarkers.js`, with crop provenance in `src/markers/manifest.json`.

## Revision 5 consequences and presentation

`getPlayerView` adds `contact_review` (current/next location and only visible events for the last resolution) and event-derived `historical_losses`. Casualties include readable provenance and carrier labels. Neither history nor UI focus participates in occupancy or combat. The normal order preview uses a pure selected-order resolver that never substitutes another action or target. Artwork orientation is per asset in the source manifest.

Contact acknowledgement is local presentation state, saved alongside combat position. It changes no engine operation; the following Resolve uses the existing one-card `advancePhase`. Old presentation stages `effect` and `result` both display the complete stored HIT result. Rules revision 5 still rejects older strict replays; this presentation normalization is not a simulation migration. AAR metadata now carries record type, rules revision, scenario version and seed.

## Revision 6 fire direction

A formation's `fire_direction` stores origin, anchor and directional components separately from `fire`, the current affected card; `fire_effect` tracks the last reconciled effect so explicit orders replace intent. Refresh reconciles occupants and smoke along the persistent direction, and validates initial target placement separately. Movement handles the last point-blank opponent's departure. Public fire projections expose only directional components, affected location and explanation, not internal anchors. Mutual combat still resolves its frozen snapshot without refreshing fire between results.

Enemy stale-fire orders apply collectively before enemy activity; cleanup also clears stale enemy fire before rebuilding relationships. Marker lookup uses the asset manifest with a text/vector fallback. Pure fire-presentation helpers supply movement warnings and the final-state label without changing legal commands or RNG.

## Terrain LOS contract (revision 7)

`src/sim/company/terrain.js` owns eight-direction border definitions, printed-sheet references and receiving-border protection. Scenario 4 supplies explicit border objects (null for staging); hill overlays are applied during scenario construction. `explainLos` returns visibility, reason, crossed entry/exit borders, elevations and blocker without mutation; `los` retains its boolean interface. Player unit projections add sanitized `los_explanations` keyed by location. The SVG renderer consumes the same location borders and has no tactical state of its own. Selection/contact outlines and PDF markers use separate layers. No combat event or RNG operation is introduced by inspecting LOS.

## Mission foundation, revision 9

`src/scenarios/missions.js` owns the catalog and availability explanations. `createMission` rejects definitions explicitly marked unplayable. `previewMissionSetup` returns a safe, read-only setup projection, never an active mission. `materializeScenario` creates seeded terrain and validates tactical controls, equipment, attachments and staging positions. `missionKnowledge` separates terrain discovery from combat/spotting LOS. Replay creation/loading carries the original setup choices and checks both rules and mission-content versions.

Mission-specific contacts, events and special-enemy modules are development implementations behind the Keep Up the Fire availability gate. They do not replace the playable course's authored tables. See KEEP_UP_THE_FIRE_STATUS.md before treating any draft subsystem as complete. The new setup preview is separate from the full-width combat screen.
