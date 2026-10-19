# Recovery, retreat and Cleanup timing audit

October 19, 2026. The original audit was read-only; CR-11–CR-13 repairs are recorded below. Scope is infantry automatic recovery, command rally controls, automatic retreat/capture and the shared phase/Cleanup lifecycle. Vehicle-specific recovery, full defensive mission support and campaign reattempt preparation are not certified by this pass.

## Sources and procedure

Fields of Fire third-edition series rules: §§3.5.1–3.5.2 p.16 (capture and retreat), §§3.7.1–3.8 p.17 (support update, pinned recovery, combat and Cleanup), §5.1.6E p.33 (carried loads), §6.5.1 pp.48–49 (rally), §8.15 p.69 (prisoners). Text is from the local supplied PDF. No online rule summary substitutes for it.

`scripts/auditRecoveryRetreatCleanup.js` uses isolated in-memory fixtures with production `retreat`, `capture`, `rally` and `advancePhase`. Phase fixtures are deliberately placed at segment boundaries; these are not full legal campaign playthroughs. Forced Action Card fields test successful/failed rally attempts. Original player saves are never opened.

Run `node scripts/auditRecoveryRetreatCleanup.js`; JSON output is retained in `output/recovery-retreat-cleanup-audit.json`. Exit 1 is intentional while any expectation fails. 37 observations: 32 pass, five disagreements across the three findings below.

## Confirmed findings

### CR-11 — automatic retreat wrongly inherits normal movement restrictions

Section 3.5.2 explicitly overrides LAT movement restrictions and permits temporary overstacking. Automatic retreat still moves a team toward its own edge when no safe destination exists; no-VOF is a destination priority, not an absolute requirement.

`fallBack` filters all destinations through ordinary `movementReason`. Reproductions with an eligible, unpinned, non-Exposed Paralyzed Team under fire fail to move when:

- The three rear cards are empty (ordinary friendly LAT movement requires friendly occupation).
- All rear cards are occupied by friendlies but under VOF.
- All rear cards are occupied by 16 friendly steps.

Each should retreat one card and become Exposed. Each remains on its original card.

Repair boundary: automatic 3.5.2 retreat needs its own eligibility/options, separate from ordinary ordered movement and enemy Activity fallbacks that share the helper. Preserve direction toward the home edge, proper load dropping, off-map enemy withdrawal, pin/exposure eligibility and applicable non-LAT restrictions. Do not globally disable movement validation.

### CR-12 — retreat destination priority uses enemy LOS before cover

The printed priority is: first a card without VOF, then the best Cover & Concealment value. It does not prioritize avoiding enemy LOS before protection.

Reproduction: all three rear cards are fire-free and friendly-occupied. Card 1.1 has protection +3, while 1.2 has protection 0. A non-firing opposing observer sees 1.1 but cannot see 1.2. The team retreats to 1.2 instead of 1.1.

Root: `fallBack` sorts by `seen()` before its protection score. Current no-fire filtering cannot substitute for the printed no-VOF preference, because it also forbids retreat when all rear cards are fired upon (CR-11).

Repair boundary: use VOF status as the first ranking key and the rule's C&C preference second; randomize true ties. This probe varies printed terrain protection only and does not settle every directional-border/additional-cover tie interpretation.

### CR-13 — fortified retreat can omit mandatory exposure

Section 3.5.2 says to mark retreating Paralyzed and Litter Teams Exposed. A Paralyzed Team retreating from a Trench into a rear Trench moves but remains unexposed because generic `move` applies its normal connected-fortification exemption.

Repair boundary: explicitly mark automatic retreat Exposed after its movement. Preserve normal non-retreat fortification movement exceptions. The probe reproduces the Paralyzed case; Litter Teams use the same helper and need their own repair regression.

## Passing controls

### Recovery

- Automatic unpinning occurs only without a card-wide VOF. Basic fire, Incoming, grenades, grenade misses, Sniper VOF elsewhere on the card and inactive mines all prevent it.
- Without VOF, P→L, L→F and F→A recovery needs no card draw; a named Fire Team returns to Good Order at original experience.
- Under VOF, the tested Green self-recovery draws one card; success advances one state and failure leaves it unchanged.

### Retreat and capture

- Pinned, already Exposed and no-VOF teams do not automatically retreat. Litter Teams without a casualty stay.
- An eligible Litter Team picks up a same-area casualty and retreats with it in the tested ordinary rear destination.
- An enemy at its rear edge withdraws off-map and leaves prohibited loads behind.
- Isolated P/L teams are captured by an eligible unpinned opposing guard; another same-side Fire Team prevents capture even when Pinned. A Pinned opposing guard cannot capture. One guard step is removed for the tested prisoner group.

### Cleanup and phase timing

- Order is Capture → Retreat → AT Combat → Fire Mission Update → Contact Evaluation → Pinned Recovery → Combat Effects → Cleanup.
- Old ACTIVE Incoming remains through Cleanup; the next Fire Mission Update removes it and activates pending missions. Removing Incoming during Cleanup would be an incorrect repair.
- Smoke, illumination, grenade/miss, concentrated fire, infantry Sniper and active mine attack markers clear during Cleanup. Permanent minefields remain; per-unit mine-hit flags reset.
- Exposed, used-action and indirect-order state clears; temporary direct-lay mortar PDFs clear.
- Cleanup does not automatically unpin teams. The next proper Pinned Recovery segment handles that condition.
- Enemy fire at a card with no valid friendly units ceases and can reopen on an eligible target during Cleanup refresh.
- Pending visible combat blocks progression without removing markers. After combat review, entering Cleanup preserves markers until the Cleanup step is actually resolved, consistent with explicit phase stepping.

## Limits and next repair

The tested shared Cleanup timing produced no confirmed mismatch. This is not an exhaustive audit of every mission-specific event expiry, vehicle wreck/Sniper persistence, defensive unresolved-PC removal, or defensive casualty capture across an MLR. Normandy patrol missions use combat-patrol casualty capture rules, even when their scenario titles describe a defensive operation (§8.15.1).

Recommended repair: CR-11–CR-13 together, with isolated P/L regressions and an authored public replay/recovery sequence. Keep ordinary movement and normal fortification exceptions intact. The earlier CR-10 carried-casualty cover helper lead remains separately open; this pass does not reproduce or close its forced-event path.

Validation: **107 tests pass across eight focused suites**, including the 32 selected audit controls, company consequences, combat choice/card pulls, pinned recovery replay, patrol engine, reattempt and equipment recovery. `git diff --check` passes. No build was needed for this audit-only change.


## CR-11–CR-13 repairs completed — October 19, 2026

Automatic 3.5.2 retreat now bypasses ordinary LAT destination and stacking restrictions. It ranks eligible rear destinations by no VOF first, then protection, with random selection among equal priorities. Retreat always sets Exposed, including Trench-to-Trench movement, and the UNIT_MOVED event records that exposure. Ordinary commanded movement, normal fortification exposure exceptions and enemy Activity fallback selection retain their original validation/behavior. Mine-hit, already-exposed, pin and other applicable eligibility checks remain.

New missions record `automatic_retreat: "v1"` in executable replays and `mission_rules.automaticRetreat: "v1"` in state. Missing discriminators retain historical restrictions, ranking and exposure behavior. Unknown variants reject. Initialization precedes attempt snapshots; vehicle adapter initial states retain the same choice. Existing saved missions/frozen combat are not automatically migrated.

All **37 audit observations pass**. The earlier Litter Team passing-control fixture now gives its intended rear card uniquely better protection, because empty rear cards are also legal after CR-11; its expectation no longer relies on the original invalid destination filter. Original audit output remains at `output/recovery-retreat-cleanup-audit.json`; corrected output is `output/recovery-retreat-cleanup-fixed.json`.

`test/automaticRetreatFixes.test.js` checks every audit observation, both P and L retreat through empty/fired/overstacked rear cards, forced exposure in unit state and events, preserved normal movement/fortification rules, no-VOF priority, historical behavior, exact replay/attempt initialization and unknown rule rejection.

`test/automaticRetreatReplay.test.js` uses an authored encounter with explicit friendly/enemy factions. Normal combat creates a pinned friendly Paralyzed Team. A legal turn-two General Initiative Rally unpins it; the subsequent Retreat segment moves it onto an empty rear card and marks it Exposed. No phase, deck, HIT or tactical state is injected after creation. Corrected and historical versions both replay and checkpoint-recover exactly; the historical team remains on its original card.

Validation: **217 tests pass across 13 focused suites**, including historical Normandy compatibility, recovery/retreat controls, combat/card pulls, patrol/reattempt, consequences and the prior equipment fixes. The final two retreat suites pass 55 tests. Production build passes with the existing bundle-size advisory; `git diff --check` passes. No player save was loaded or modified. The separate CR-10 carried-casualty cover lead remains open.


### CR-10 status update — October 19, 2026

CR-10 is now confirmed through the production Lost in the Dark event and repaired for new missions. All 39 casualty/equipment observations pass. See [INTEGRATED_COMBAT_ACCEPTANCE.md](INTEGRATED_COMBAT_ACCEPTANCE.md) for the exact event-fixture scope, replay compatibility and integrated acceptance results. Earlier open-status notes describe the pre-repair audit.
