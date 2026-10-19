# Combat resolution rules audit

Date: 2026-10-18. Initial audit followed by the scoped CR-01 correction. Combat-order and screen changes remain deferred.

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

### CR-02 — Forced resolution order differs from player choice

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
