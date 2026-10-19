# Casualty and equipment consequence audit

October 19, 2026. Audit only: no gameplay changes. Scope is infantry consequences of combat, final-step losses, equipment/ammunition handoff, carried casualties and basic device/line damage. Vehicle loss and the complete Cleanup sequence are outside this pass.

## Sources and method

Local Fields of Fire third-edition series rules: §4.3.4 p.29 (phone/line damage), §4.3.5 p.30 (radio damage), §5.1.6E p.33 (loads during combat), §6.4.3 p.47 (ordered HIT letters and one-step truncation), and §7.18.1B p.60 (mortar ammunition replication). Normandy breakdown pp.47–48 supplement weapon-specific inheritance.

`scripts/auditCasualtyEquipment.js` constructs isolated states and calls production `applyHit`, `move`, `damagePhoneLines`, `prepareCombat` and pickup eligibility. It reads no player saves. Controlled real Action Card fields force both sides of damage checks. These are procedure fixtures, not complete legal campaign playthroughs. Run `node scripts/auditCasualtyEquipment.js`; it intentionally exits nonzero while open mismatches remain. Output: `output/casualty-equipment-audit.json`.

## Confirmed gaps

### CR-08 — ammunition inheritance is too broad

Section 5.1.6E distinguishes equipment from ammunition: equipment follows the final non-casualty step, but ammunition passes only to the ammo-tracking Fire Teams identified on the breakdown chart. Other carried or weapon ammunition is lost.

A two-step ordinary rifle squad carrying MG 3 and RKT 1 retains all four points after F, A, P, L, FC, CF, PC or CP breaks it down. Its generic teams do not qualify to inherit this stock. A two-step A-rated Grenadier control correctly retains MG 3 in its final A Fire Team but also incorrectly retains unrelated RKT 1.

Root: the `hitBreakdowns` ammunition handoff added in the previous HIT batch transfers every remaining ammo key to the selected recipient. That repair addressed disappearing cargo without applying the chart restriction. This audit narrows the previous claim: ammunition continuity alone was not a sufficient correctness condition. The passing test for single-step LAT cargo conversion does not establish legality of multistep squad inheritance.

Repair boundary: preserve chart MG stock and mortar-section replication, while losing unrelated stock. Preserve radios, equipment and carried casualties. Do not change ammunition remaining with an original operational counter merely because another step became a casualty. Historical replay behavior must remain explicit.

### CR-09 — Company Assault non-casualty equipment handling depends on an unrelated scenario flag

The production handoff chooses a surviving team only when `mission_rules.specialEnemies` is enabled. Normandy has that flag; Company Assault does not.

A one-step Company Assault HQ receiving P has no casualty, but its two devices are dropped instead of following its surviving Paralyzed Team, and its two smoke assets disappear. With PC, only P should apply (§6.4.3); nevertheless the fallback passes `letters.includes('C')` to device-loss handling, causing two damage draws and possible destruction from an ignored letter. The probe forces R#1/2 and reproduces this without a casualty.

Repair boundary: determine loss from actual applied casualty outcomes and recipient survival, not the raw untruncated effect string. Asset transport must not depend on the enemy-content flag. Preserve actual final-casualty damage and existing Normandy final-non-casualty handoff.

## Additional helper-level gap requiring public event-path reproduction

### CR-10 lead — carried casualty cover can become stale

Production `move` updates a carried casualty's card but not its cover. Production final-casualty loss handling clears the carrier but does not normalize the dropped casualty's position. Calling these helpers in sequence leaves the carried casualty on the correct destination card with an invalid cover ID from the previous card.

Normal submitted commands synchronize casualty card/cover at the end of `execute`, so this fixture **does not prove the normal movement command is broken**. Forced/event movement paths should be reproduced through public phase operations before broadening the finding. `dropLoad` already sets both fields correctly. A low-risk repair could normalize location/cover at final carrier loss, but no fix was made in this audit.

## Passing controls

- C and CC against a one-step carrier create exactly one new casualty; the second C is ignored. Two carried devices cause two damage draws, not one per letter or casualty. R#1 destroys each device; R#2 leaves it recoverable.
- Actual final-casualty devices and equipment drop at the correct card/cover. Destroyed devices remain historical records with `destroyed:true` and are excluded from pickup.
- Two-step CC draws once per carried device; three-step CC leaves a surviving final team holding the devices without destruction checks.
- Normandy breakdowns transfer devices, non-ammunition equipment and carried casualties to the final non-casualty team for all tested mixed effects, without extra damage draws.
- Explicit forced load dropping records the current card and cover. Pinned-state load retention is present in the fixture, but the isolated assignment is not an independent PIN-resolution test.
- Casualty records and removed formations do not enter the next prepared combat list.
- Incoming line checks use one 1-in-2 draw and both outcomes match the rule. Existing phone tests also cover enemy line discovery, successive incoming/discovery checks, connectivity and repair eligibility.

39 observations: 27 pass; 12 disagreements represent CR-08, CR-09 and the narrower CR-10 helper lead. `test/casualtyEquipmentAudit.test.js` protects 26 explicitly selected production controls plus its coverage count. The failing audit expectations remain visible rather than being converted into tests that assert defective behavior is correct.

## Next repair recommendation

Repair CR-08 and CR-09 together with versioned replay handling. Add legal replay/recovery sequences for an affected breakdown and a real final-casualty device loss. Reproduce the carrier-cover lead via an event/forced movement path, then normalize final drop coordinates if confirmed. Recovery, automatic retreat/capture and Cleanup expiry remain subsequent audit areas.

Validation: **780 tests passed across nine focused suites**, including HIT breakdown/recovery, phone damage/connectivity/presentation, selective dropping, ammunition and company consequences. `git diff --check` passes. No production build was needed because gameplay and UI sources were unchanged.


## CR-08 / CR-09 repairs completed — October 19, 2026

New multistep breakdowns preserve chart-assigned MG ammunition and replicated mortar ammunition, but lose unrelated ammunition instead of handing it to arbitrary LATs. Ammunition remaining with an original operational counter is unchanged. Existing single-step LAT cargo conversion behavior is outside the multistep restriction repaired here.

New-mission equipment handoff no longer depends on `specialEnemies`. Company Assault surviving teams retain their devices, equipment and carried casualties. Actual final-casualty drops also preserve equipment and cover metadata in that scenario. Damage eligibility uses actual applied casualties rather than an untruncated HIT string; the ignored C in one-step PC causes no damage draws.

The replay discriminator is `casualty_equipment: "v1"`, retained as `mission_rules.casualtyEquipment`. It is initialized before attempt snapshots. Records without it preserve previous behavior; unknown variants reject. Existing frozen combat or historical replay prefixes are not rewritten. Vehicle adapter records carry the rule in their embedded initial state.

`test/casualtyEquipmentFixes.test.js` covers the 38 observations outside the CR-10 lead, chart MG versus unrelated cargo, US mortar ammunition, operational-squad cargo, replay version rejection and exact Company Assault/Cerisy initialization. `test/casualtyEquipmentReplay.test.js` uses authored initial encounters and only public phase/combat operations afterward: a two-step LC breakdown loses unrelated ammo, and a one-step PC retains equipment without damage. Both corrected and historical branches replay and checkpoint-recover exactly; deck order and HIT results are never injected in these replay sequences.

The audit now passes **38 of 39 observations**; the separate CR-10 carrier-cover helper lead remains open and unchanged. Fixed output is `output/casualty-equipment-fixed.json`; the original audit output is retained. **868 tests pass across 15 focused suites**. Production build passes with the existing bundle-size advisory, and `git diff --check` passes. No player save was opened or modified.


### CR-10 status update — October 19, 2026

CR-10 is now confirmed through the production Lost in the Dark event and repaired for new missions. All 39 casualty/equipment observations pass. See [INTEGRATED_COMBAT_ACCEPTANCE.md](INTEGRATED_COMBAT_ACCEPTANCE.md) for the exact event-fixture scope, replay compatibility and integrated acceptance results. Earlier open-status notes describe the pre-repair audit.
