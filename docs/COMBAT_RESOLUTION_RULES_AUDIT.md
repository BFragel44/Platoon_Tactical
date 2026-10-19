# Combat resolution rules audit

Date: 2026-10-18. Initial audit followed by the scoped CR-01 correction. CR-02 now also has a player-choice implementation and battlefield-focused combat view for new missions.

## Scope and source

Active `company-v1` infantry resolution, shared Action Deck, mutual combat queue, NCM calculation, HIT dispatch and combat presentation. Source: local *Fields of Fire Deluxe, Series Rules, Third Edition*, printed pp.10, 37, 45–47, 55–56, plus the existing implementation/acceptance record in `M0_RULES_AND_PLAYTEST.md`.

This is a focused first pass, not certification of all combat, vehicles, card transcriptions or weapon-specific breakdowns. Preserve existing historical replay engines and unrelated working changes.

## Confirmed findings

### CR-01 — Lone Grenade Miss ignores light and weather (fixed for new missions)

Rule 7.10.4, p.55: without another VOF, Grenade Miss acts as −1 VOF subject to standard modifiers. It is explicitly not a Grenade Attack VOF.

`battlefield.js:combatExposure` creates an untyped candidate for a lone miss. The visibility dispatch defaults this candidate to off-map fire, which is exempt from light/weather. The global −1 miss modifier is added afterward.

Reproduction on otherwise neutral terrain:

| Condition | Required NCM | Actual NCM |
|---|---:|---:|
| Light +3 | +2 | −1 |
| Weather +2 | +1 | −1 |

This makes an isolated missed grenade too dangerous. Genuine successful grenades correctly remain exempt from visibility. Fix should give the lone-miss candidate ordinary visibility treatment without changing successful grenade attacks or adding the miss penalty twice.

### CR-02 — Forced resolution order differs from player choice (fixed for new missions)

Rule 6.4.1, p.47 permits choosing combat resolution order because effects are simultaneous. `prepareCombat` sorts receiving formations by map row, column and identifier; the engine accepts only the currently displayed queue entry. The UI may resolve an adjacent reciprocal pair through two ordinary queue operations.

This is a flow restriction rather than sequential damage leakage. However, targets receive successive cards from a finite shared deck, so order is not necessarily outcome-neutral. Strict fidelity requires an explicit decision about selectable eligible recipients, hidden enemy resolution and replay ordering. Do not silently change historical operation ordering.

## Verified active behavior

- Current company missions select `action-deck-v1`. Combat reads the next actual card at NCM −4 through +6; a HIT alone draws a separate card using the receiving formation's frozen experience.
- The old probability-sampling functions have no active production combat callers outside historical compatibility code. Current probability tables supply reference/display metadata, not a replacement combat roll. Legacy prototype simulation remains separately routed by ruleset.
- MISS removes pin; PIN pins; the tested HIT pins resulting survivors and uses the correct experience column.
- Preparation freezes all exposures before individual results. A two-casualty HIT does not change another prepared exposure or add new recipients. No normal fire refresh occurs between individual combat results; cleanup resumes fire updates.
- Successful grenade VOFs accumulate; visibility exemptions and the minimum NCM clamp passed the focused probes.
- Shared-deck reshuffle handling finishes the current draw batch and excludes the reshuffle marker from required result cards, consistent with p.10. Existing tests cover the marker path.
- UI reciprocal exchanges issue the existing individual resolution operations in queue order; they do not combine fire strengths or replace draws with a duel calculation.

## Validation

`node scripts/auditCombatResolution.js` writes a reproducible JSON report when redirected to `output/combat-resolution-audit.json`. All focused controls now pass, including both CR-01 cases. New missions record `grenade_miss_visibility: true` in executable replays. Records without this discriminator preserve the historical calculation when resumed and re-exported; vehicle adapter records preserve it in their initial state. This avoids silently changing finite-deck outcomes inside existing missions.

Six existing suites passed, 112 tests: card-pull combat, combat exchange, combat screen, combat probability data, company consequences and pinned/reverse-side rules. Passing tests establish their existing coverage, not blanket rules compliance.

## Remaining audit work

1. Reproduce the complete printed NCM examples, including mixed incoming/basic fire, directional terrain, critical cover loss, overcrowding and crossfire.
2. Check final-ammunition volleys against simultaneous HIT/breakdown effects, and phone/radio damage timing.
3. Exhaustively check two-letter HIT permutations against faction/counter breakdown charts. Existing specialist findings SF-17–SF-20 remain open in `SPECIAL_FORMATIONS_RULES_AUDIT.md`.
4. Verify casualty/asset distribution, morale-state transitions, support expiry and cleanup through public phase operations and replay.
5. Independently verify all printed combat and HIT fields in the vendored deck. Existing schema/count validation is not a printed-deck transcription audit.

### Correction validation

Nine focused suites passed: 122 tests, three archival rules38 tests skipped. This includes the immutable rules39 M1 failed-attempt/successful-reattempt recording, exact replay export and checkpoint recovery. The combat audit probe passes all 14 observations. Production build passed with the existing bundle-size warning. The broader suite was stopped after exposing the attempt-snapshot compatibility issue; the affected historical fixture and focused suites were rerun successfully after correction.


## Player-choice combat implementation — 2026-10-18

New missions record `combat_order: "player-choice-v1"` in executable replay records and retain that rule in mission state/attempt snapshots. Existing records without the discriminator retain their original fixed queue and historical UI behavior; replay imports reject unknown order variants. Vehicle adapter replays retain the discriminator in their initial mission state.

During 3.7.4, `resolveCombat(state, resolutionId)` accepts any pending visible recipient, records that exact ID in the existing operation format and resolves only that exposure. Presentation selection consumes no cards, creates no replay operation and cannot alter frozen NCMs. Duplicate, hidden, unknown and out-of-phase requests are rejected without mutation. After each draw, the chosen result stays selected until the player selects another recipient.

Unobserved targets remain absent from public recipient lists and progress counts. Once no visible recipients remain, Finish combat resolution resolves pending hidden targets in their original deterministic order, without refreshing fire or exposing hidden draw identities. Continue to cleanup remains a separate phase operation. Empty and entirely hidden combat follow the same finish/review progression.

The right-hand combat desk replaces orders while open, leaving the real map visible. The map frames the selected receiver and nearby sources at readable scale; distant sources have location buttons and a return-to-receiver control. Known source counters are highlighted; unidentified fire ends at a known source card rather than revealing a hidden counter. A gold outline identifies the receiving formation; solid/dashed arrows distinguish selected VOF from additional sources. Same-card fire and support effects do not invent off-card firing units. A bottom strip groups visible recipients by location and retains resolved results for inspection. HIT reveals the combat card and separate experience card immediately below NCM, followed by resulting formations/casualties. Command pools are hidden only while this non-command segment view is open.

Validation includes arbitrary/reversed selection, no reciprocal auto-draw, frozen later exposures, illegal requests, hidden-last completion and public concealment, empty/hidden-only combat, historical fixed-order behavior, exact current replay/checkpoint recovery and the immutable historical multi-attempt M1 recording. Browser acceptance used an isolated origin and replayed authored legal orders into fresh test missions. It verified an enemy-first selection, individual friendly HITs, separate result cards, result review and explicit cleanup. No player save origin was touched.

Final validation for player-choice/UI: 139 tests passed across 17 focused suites, with three archival rules38 cases skipped. Production build passed (existing size advisory). Browser acceptance screenshots are stored under `output/tactical-clarity/player-choice-combat-hit.png`.


### Explicit adoption for an already-started mission

An active record without the new initial discriminator may now append `enablePlayerChoiceCombat`. This changes only subsequent recipient ordering/presentation; it consumes no cards and does not rebuild existing exposures. The `combat_order_upgraded` state marker prevents export from falsely labelling the initial historical prefix as player-choice. Replay starts with the historical rules and adopts at the recorded operation. Original recovery data is backed up and the original turn-start checkpoint remains available. Newly committed campaign starts and their recovery records are explicitly covered by regression tests.


## NCM follow-up audit — 2026-10-18

The printed examples and modifier-interaction pass is recorded in [NCM_CALCULATIONS_RULES_AUDIT.md](NCM_CALCULATIONS_RULES_AUDIT.md). It found two additional gaps (CR-03 cumulative Company Assault grenades; CR-04 temporary mortar PDF terrain direction), with 47 of 50 observations passing. The earlier statement that grenade accumulation passed was limited to the scenario used in that probe; it did not cover Company Assault’s missing scenario setting. No gameplay fix is included in this audit.


### NCM corrections — 2026-10-19

CR-03 and CR-04 are implemented for new missions with an explicit `ncm_corrections: "v1"` replay discriminator. Historical records preserve their calculations. All 50 NCM observations pass; see the NCM audit for reproduction details and validation.


## HIT breakdown follow-up — October 19, 2026

[HIT_BREAKDOWN_RULES_AUDIT.md](HIT_BREAKDOWN_RULES_AUDIT.md) records the ordered HIT matrix and repairs CR-05–CR-07, plus SF-17/SF-19/SF-20. SF-18 was withdrawn after visual chart reinspection: the one-step operational 88mm is legal. New missions use explicit `hit_breakdowns: "v1"`; historical records retain their original procedures.


## Casualty and equipment follow-up — October 19, 2026

[CASUALTY_EQUIPMENT_RULES_AUDIT.md](CASUALTY_EQUIPMENT_RULES_AUDIT.md) records CR-08 (overbroad ammunition inheritance), CR-09 (Company Assault non-casualty equipment and ignored-letter damage), and a narrower carried-casualty cover lead. Audit only; no gameplay changes.


CR-08 and CR-09 are repaired for new missions with `casualty_equipment: "v1"`; 868 focused tests and production build pass. The CR-10 helper-level cover lead remains separate and open. Details and replay acceptance are in the casualty/equipment audit.


## Recovery, retreat and Cleanup follow-up — October 19, 2026

[RECOVERY_RETREAT_CLEANUP_RULES_AUDIT.md](RECOVERY_RETREAT_CLEANUP_RULES_AUDIT.md) records 37 probes: 32 pass and five failures represent CR-11 (automatic retreat blocked by normal movement restrictions), CR-12 (LOS ranked ahead of C&C) and CR-13 (fortification retreat omits exposure). Tested recovery and shared Cleanup timing have no confirmed gaps. Audit only; gameplay unchanged.


CR-11–CR-13 are now repaired for new missions with `automatic_retreat: "v1"`. All 37 recovery/retreat/Cleanup probes pass, 217 focused tests pass and the production build passes. Historical replay behavior remains explicit. See the recovery/retreat audit for scope and legal replay acceptance.


## Expanded Cleanup lifecycle — October 19, 2026

[CLEANUP_LIFECYCLE_RULES_AUDIT.md](CLEANUP_LIFECYCLE_RULES_AUDIT.md) extends the earlier boundary checks with 31 passing observations, killed-source frozen fire/concentration, illumination LOS/NCM expiry, smoke/exposure fire reopening, Incoming through next-turn command phases and persistent battlefield data. Native M3 illumination/smoke replay and checkpoint recovery pass before and after Cleanup. No new gap; 148 focused tests pass. Audit only, gameplay unchanged.


## Infantry acceptance gates completed — October 19, 2026

CR-10 carried-casualty position handling is repaired with `casualty_positions: "v1"`, including the reproduced Lost event path and final drop. The authored integrated two-turn support/Rally/retreat/recovery/combat/Cleanup sequence passes exact replay and checkpoint recovery at its boundaries. 948 focused tests and production build pass. See [INTEGRATED_COMBAT_ACCEPTANCE.md](INTEGRATED_COMBAT_ACCEPTANCE.md). These agreed infantry gates are complete; the next UI improvements can proceed without claiming full vehicle/campaign certification.
