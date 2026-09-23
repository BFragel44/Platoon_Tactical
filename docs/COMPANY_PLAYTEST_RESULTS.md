# Fire paths and continuing fire — 2026-09-22

Rules revision 6, scenario version 3. Implementation and automated verification are complete; human acceptance is open. Earlier results are preserved in [revision 1 validation](archive/company-v1-validation.md) and repository history.

## Automated verification

- 140 tests pass across 16 files, including exact 50-card table derivation, weighted boundaries, seeded RNG consumption, frozen combat ordering, visibility and strict replay.
- Production build passes.
- Six complete public-view scripted policies terminate at turn 10 and replay to identical state and history. They cover direct advance, support and recovery on the same two seeds. These are scripted comparisons, not human runs.
- New regressions cover staging communication versus combat LOS, staging cover prohibition, restricted withdrawal and asset drops, centralized adjacent/within-card/platoon infiltration, fortification exposure, immediate spotted-enemy state, mixed occupancy and continuing fire, sequential contacts, single frozen combat resolution, marker privacy, and strict recovery during contact/combat review.

| Seed | Approach | Outcome | Orders | Friendly casualty steps | PCs remaining |
|---|---|---|---:|---:|---:|
| company-1 | direct | DEFEAT | 40 | 8 | 6 |
| company-1 | support | DEFEAT | 28 | 6 | 5 |
| company-1 | recovery | DEFEAT | 31 | 4 | 6 |
| company-2 | direct | DEFEAT | 40 | 8 | 5 |
| company-2 | support | DEFEAT | 80 | 6 | 1 |
| company-2 | recovery | DEFEAT | 57 | 8 | 5 |

All six simple policies lost. This does not establish optimal tactics or justify changing probabilities. Full orders, draws, phases and outcomes are generated under `output/company-playtests/` by `npm run playtest`.

## Submitted human replay — preserved historical baseline

`reference/playtest_replays/company-company-1-replay.json`: 310 operations, revision-1 SUCCESS at turn 10, with 19 empty spotting attempts (18 Marsh, one Orchard).

SHA-256: `6ea1f62770344619621a8582453daa481b9cf8859fd67748a266e05af26f3251`.

The revision-4 diagnostic comparison first rejects operation 35 because the historical replay has no explicit `resolveCombat` operation and therefore attempts to advance while the new engine is waiting at the first exposure. There are 276 rejected operations in the diagnostic continuation, which remains ACTIVE at turn 1 because later historical selections cannot satisfy the changed segment and command sequence. This is **not** 276 independent rules defects or a new mission outcome. The original export is unchanged and strict replay rejects its older version.

Reproduce with `node scripts/compareCompanyReplay.js`. The report contains every acceptance/rejection and resulting visible events in `output/company-playtests/historical-comparison.json`.

## Revision 3 agent browser walkthrough (historical)

Seed `company-1`, opening through turn-1 mutual combat:

1. Advance all opening segments; activate both platoons. Company HQ saves four commands.
2. First platoon: move 1/1 Rifle Squad to 1.1 Open Fields, then move its HQ there; save two commands. The squad's panel explains lost voice communication while the HQ is still in staging and exposure lasting until cleanup.
3. Second platoon: group move to 1.4 Open Fields; save three commands. Staff saves one initiative command; general initiative is completed without orders.
4. Contact resolution remained in 3.7.2, evaluated one occupied PC, displayed the visible result and refreshed activity before offering the next contact. Two PCs resolved, six remained. Unknown fire originated at 2.2 Orchard; indirect fire affected the other advance.
5. Countersheet VOF and support markers appeared on affected cards. A labelled unidentified PDF appeared at its firing-card edge. Clear selection restored the undimmed terrain view.
6. Mutual combat resolved once and remained in 3.7.4 with Continue to cleanup. Formation PIN/HIT results updated on the board while the frozen fire snapshot remained unchanged. Playback controls navigated recorded frames only.
7. Reload displayed Resume latest, Restore turn start and Start new mission. Resume restored turn 1, phase 3.7.4 and playback step 3/42 exactly. Closing playback retained the combat result summary. No browser console errors were observed during the verified flow.

This is an agent browser walkthrough, not a complete human tactical comparison. Component fixtures cover mission success, defeat and abort; no claim is made that the revised mission has a verified human victory.

## Revision 4 browser smoke check

The production UI loaded the new rules revision against an existing revision-3 local save, presented recovery/start-new choices, and started a clean `company-1` mission without console warnings or errors. Full combat-screen interaction is covered by engine/presentation regressions but still requires the next human acceptance run for visual and comprehension sign-off.

## Human acceptance still required

Replay direct advance, support-and-maneuver and recovery-first on `company-1` and `company-2`, exporting replay/AAR records. Assess whether command range, exposure plus cover, fire directions, last-order results and combat consequences can be explained without diagnostics. Record confusion, inaccessible controls and remaining source-rule discrepancies. Cinematics, sound, custom mission files and campaign expansion remain deferred.

## Revision 5 validation

The six scripted policy summaries above are unchanged from revision 4. Every full run reconstructs identically through strict replay. The corrected cover-area pickup and HQ reconstitution branches are covered by focused fixtures; these simple policies do not exercise them. Exact deck probabilities and force composition are unchanged.

Latest human baseline: `reference/playtest_replays/company-company-1-aar.json`, SHA-256 `4136eab1d2b19f5bb564bdda2b132dd081c53b3271be66556c3b0f342d61cf6f`. It records 49 combat resolutions, 18 HIT effects, nine visible casualty steps, defeat on turn 10 and one contact remaining. The supplied AAR and PDFs were not modified. An AAR cannot establish attempted/rejected UI orders or reconstruct state as a replay can. Events 661–671 show Deploy named Fire Team, Move, then Recover for Company HQ, not reconstitution.

Agent browser walkthrough on `company-1`: activated both platoons and moved them to 1.1 and 1.4. Confirmed the selected group-move order remained selected and disabled after use. Previewed and resolved each contact individually, showing unknown fire from 2.2 to 1.1 and incoming artillery at 1.4. Reload restored the next-card preview. First combat HIT/CC displayed its full effect immediately; closing/reopening and reloading retained it. Verified the casualty marker and historical Artillery Observer silhouette separately, and loaded unflipped anonymous-source artwork. Tested desktop and narrow viewport DOM geometry without horizontal page overflow. No console errors appeared. Browser screenshot capture repeatedly timed out, so this is interaction/DOM verification, not screenshot visual sign-off.

Human acceptance remains open: explain the selected command and its outcome, actual firing sources, contact source/affected card, HIT consequence, and the difference between recoverable casualty steps and historical silhouettes. No balance change or claim of a verified human victory follows from these scripted results.

Final test run: `npx vitest run --pool=threads` passed all 129 tests. The default fork pool had reported all assertions passing but hit a Windows EPERM during worker shutdown; the thread-pool rerun exited cleanly. Production build and whitespace checks passed.

## Revision 6 validation

The new baseline `reference/playtest_replays/company-company-1-aar_9_22_26.json` remains unchanged: SHA-256 `be337fbe1ea5ef9b44f5fffecf23caa900224e5cf6115b9cca0d1ba0c20fb6ae`. It records revision-5 SUCCESS on turn 10. Event 182 spotted the LMG at 2.4; events 184–185 began fire from 1.3. Event 261 spotted the LMG at 2.1, and event 568 recorded its final casualty on turn 5. Continued friendly fire after these losses is valid under §6.1.2. The AAR is historical evidence, not an executable replay.

140 tests pass with the thread pool; production build passes. Targeted fixtures cover blocked initial engagement versus later friendly interception, farther movement along a PDF, point-blank departure, smoke at source, eliminated targets, cease/reopen feedback, collective enemy cease-fire, marker manifest integrity and warnings that leave state unchanged. Existing deterministic, visibility and frozen-combat suites remain passing.

Browser validation used a targeted fixture importing the actual production marker/warning/final-state components. Both Pending -5 and Incoming -5 rendered as readable badges, with zero image requests and no console errors; screenshot inspection passed. The warning names 2/LMG and the destination, and the mission-ended panel explicitly identifies historical fire positions. This is a component browser check, not another human mission or a claim of full manual acceptance.

Revision-6 scripted comparison: all six policies ended at turn 10 and passed exact replay reconstruction. Company-1 outcomes changed with the corrected paths (direct: 40 orders / 8 casualty steps / 6 contacts left; support: 28 / 6 / 5; recovery: 31 / 4 / 6). Company-2 summaries are unchanged from revision 5. All six remain defeats; no balance changes were applied.

## Revision 7: LOS borders

151 automated tests and production build pass. Added directional entry/exit and diagonal corner tests, reciprocal hill/slope cases, range and smoke restrictions, dual-value combat/spotting checks, projection purity and historical-version rejection. Existing simultaneous-combat and visibility checks remain passing.

All six scripted policies reconstruct exactly through strict replay. Summaries match revision 6 (orders / casualty steps / contacts remaining): company-1 direct 40/8/6, support 28/6/5, recovery 31/4/6; company-2 direct 40/8/5, support 80/6/1, recovery 57/8/5. All end in defeat at turn 10. These are automated strategies, not human acceptance runs. The current map has no level-3 stepped slope; targeted fixtures exercise that correction.

Production-browser desktop screenshot inspection confirmed white Open Fields, dark hills, both gully orientations and their dark corners, and borderless staging. Selection and clearing work. Narrow viewport DOM verification found 12 terrain border SVGs, zero staging SVGs and no page overflow; narrow screenshot capture timed out, so narrow visual sign-off remains open. No browser console errors were recorded. Browser testing used an isolated local origin, preserving the user's existing mission save. No full human mission was played.

## Compact command header validation

The presentation-only compact header retains rules revision 7 and scenario version 4. File, Mission and Settings now open as overlays; recovery opens File automatically, progression remains locked while recovery is pending, and only one menu stays open. Escape closes a menu and returns focus, Arrow Down enters its controls, and outside-click dismissal works. The current segment, next segment, command allowance, expenditure, HQ reserves and progression control remain visible in the sticky header. Command feedback is labelled Last order; phase feedback is labelled Previous segment or Current segment result.

Desktop measurement placed the ordinary header at approximately 172px with the HQ strip included. The battlefield did not move when menus opened. Focused browser fixtures verified long feedback expansion, menu cleanup and that presentation interactions leave simulation state and RNG unchanged. Automated coverage now includes header rendering, progression locks, reserves, feedback labels, recovery metadata and mission content. Human visual acceptance remains open for final styling preferences.
