# CR-10 closure and integrated combat acceptance

October 19, 2026.

## CR-10 — carried casualty position: closed for the reproduced paths

The earlier stale-cover helper lead is confirmed through the production **Lost in the Dark** event. That event changes a carrier's card and clears its cover directly, bypassing normal command-end casualty synchronization. The carried casualty could therefore remain attached to the carrier while still recorded on the old card and under its old cover. Final carrier loss cleared the carrier reference without correcting those coordinates, making subsequent pickup fail at the actual drop position.

New missions synchronize carried casualty card/cover after normal movement, automatic retreat's final cover choice, Lost in the Dark and the enemy FALL_BACK event. Final carrier loss normalizes casualty coordinates before dropping the load. Movement also marks the casualty transported. The fix changes position bookkeeping, not casualty counts, combat outcomes, retreat priorities or equipment capacities.

`test/carriedCasualtyPositions.test.js` isolates one existing casualty and eligible carrier in a native M3 state, invokes the actual Lost event with a controlled real direction field, then applies a final carrier casualty. It verifies destination card, out-of-cover state, final drop and pickup eligibility. The historical branch reproduces the stale old card/cover. This is an event-procedure fixture, not a claim that a full native campaign event sequence was played end to end.

New executable replays record `casualty_positions: "v1"`; state retains `mission_rules.casualtyPositions: "v1"`. Missing discriminators preserve historical behavior; unknown variants reject. Initialization precedes immutable attempt snapshots. No player saves are loaded, rewritten or migrated automatically. All **39 casualty/equipment audit observations now pass**, including the original helper reproduction.

## Integrated acceptance pass

`test/integratedCombatAcceptance.test.js` runs an authored Company Assault encounter with explicit factions, three friendly rifle steps, company command, an Artillery FO and an opposing HMG. Trévières support data supplies the artillery agency. After mission creation, every transition uses public commands and phase/combat operations; no phase, deck, HIT, pin or tactical state is injected.

The seeded two-turn sequence verifies:

1. A legal Company HQ order to the FO successfully calls WP support. The mission is pending and inventory is spent immediately.
2. Fire Mission Update activates that mission before contact evaluation, recovery and combat.
3. Individual card-pull combat creates a pinned friendly Paralyzed Team. Other prepared exposures and current fire remain frozen during every individual resolution.
4. The next command phase still has the old active support. A legal General Initiative Rally removes the team's pin.
5. Automatic Retreat moves it toward the friendly edge onto an empty rear card and records Exposed.
6. The next Fire Mission Update removes the old support before recovery/combat. Pinned Recovery unpins eligible recipients only when no VOF remains.
7. The second combat completes, followed by explicit Cleanup. Exposure clears, the prepared queue empties and turn three begins.

Executable replay and checkpoint recovery reproduce the entire state at support pending/active/expired, post-Rally, post-retreat, before both Pinned Recovery steps, after each visible combat resolution, before both Cleanup steps and after the second Cleanup.

This is an integrated rules-engine acceptance sequence, not a complete Normandy campaign victory or browser/UI acceptance. Existing native M3 illumination/smoke replay acceptance and the printed-example/individual-rule suites supplement it. Printed-deck transcription, vehicle-specific auditing and long campaign playthroughs remain separate work.

## Validation and readiness

**948 tests pass across 18 focused suites**, including the two new suites, native M3 Cleanup replay, recovery/retreat, casualty/equipment, HITs, historical Normandy compatibility, card-pull combat and patrol engine checks. Production build passes with the existing bundle-size advisory. `git diff --check` passes.

The two agreed gates before UI improvements are satisfied within this infantry scope: CR-10 is repaired and the integrated combat sequence passes. Remaining larger audits need not block the next UI pass.
