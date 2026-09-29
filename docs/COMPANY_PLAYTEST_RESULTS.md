# Fire paths and continuing fire — 2026-09-22

## KUTF Notes 4 — presentation fixes, rules 13 retained

Reviewed `reference/playtest_replays/Platoon Tactical - Testing Notes KUTF 4.pdf` (two pages). The user reports another mostly smooth rules playthrough; no new executable replay accompanied these notes. Screenshot-specific outcomes were not reconstructed. Targeted fixtures reproduced the marker/projection defects.

- Mines: §7.9.1 (p.54) and §8.7.1 (p.67) require a persistent minefield, reset to Draw 3 at cleanup. The engine already preserves it; rendering incorrectly selected Concentrated Fire artwork and omitted the resting marker. Minefields now use labelled vector markers, with triggered −4 versus Draw 3 states. Other unknown special marker types no longer inherit concentrated-fire artwork.
- Incoming: §7.16.3 and Fire Mission Update segment 3.7.1 keep the active mission on its target until the next update. Friendly departure did not remove simulation support, but could remove it from player projection. Previously reported active Incoming remains projected on an empty card; unobserved pending requests and spotter identities remain concealed. Public LOS explanations use the same known support set.
- Cover: discovered cover targets, command previews and normal order/history text use descriptive names and protection; duplicate cover types have local display numbers and upper stories identify their parent building. Internal IDs and raw historical events are preserved.
- Group movement: §4.2.2b/d (p.23). Green upward indicators preview participating formations only after selecting a legal destination, including platoon infiltration. The shared participant calculation accounts for order/communication restrictions and sequential destination stacking. No new movement rules.

Validation: **330 tests / 41 files and production build pass**. Two archived revision-13 direct-policy runs (`kut-1`, `kut-2`) were replayed before and after changes; SHA-256 hashes of complete states, including RNG/history, are identical (`output/kutf4-replay-baseline.json`). Fixtures cover persistent/triggered mines, observed Incoming on empty cards and removal timing, hidden pending support, descriptive covers, exposed/heavy group exclusions and destination capacity.

Browser at isolated 127.0.0.1:4184: seven eligible course formations receive arrows after selecting the destination; no arrows beforehand or after execution. Move-within-card target reads `Cover · +1 protection`. Narrow viewport DOM bounds keep indicators within terrain cards. Screenshot capture timed out, so no completed screenshot-based visual acceptance is claimed. Mine/mortar persistence was validated with fixtures rather than a new full browser mission. User follow-up remains the human acceptance step. Rules 13 / KUTF 11 / course 4; existing saves/replays remain compatible.

## Revision 13 — Notes KUTF 3 validation (September 28, 2026)

324 tests / 40 files pass; production build passes. Focused checks cover Pending activity without combat effects, mortar spotter penalty, joining a usable earlier PDF when the last one is out of range, nearest-PDF selection, frozen known-source strength, concealed source statistics, public-only spotting preview, eligible contact labels and strict revision-12 rejection. Existing command, seeded targeting, fog-of-war and frozen-combat regressions remain passing.

Six runs in `output/keep-up-the-fire-integration-r13-v11/` verify exact strict replay reconstruction. Outcomes/order counts/casualties/contact counts match revision 12:

| Seed | Strategy | Outcome / turn | Orders | Casualties | PCs left |
| --- | --- | --- | ---: | ---: | ---: |
| kut-1 | direct | Defeat / 10 | 124 | 10 | 5 |
| kut-1 | support | Success / 10 | 102 | 12 | 4 |
| kut-1 | recovery | Defeat / 10 | 71 | 11 | 11 |
| kut-2 | direct | Defeat / 10 | 51 | 12 | 6 |
| kut-2 | support | Defeat / 10 | 54 | 17 | 10 |
| kut-2 | recovery | Defeat / 10 | 54 | 9 | 10 |

Browser: isolated 127.0.0.1:4183 Company Assault run, turns 1–2. Verified seven pooled commands versus six spendable; separate reserve cap labels; unoccupied PC waiting label; one-contact review; anonymous combat context; single `HIT · C` consequence band; spotting Cancel preserves displayed budget; Confirm issues one attempt; narrow dialog fits and Escape closes it. Requested narrow viewport 390×844 (browser zoom yielded a 433 CSS-pixel viewport); screenshot visually inspected. No browser console errors. The user's existing server/save origin was untouched.

Unverified by this short browser run: a naturally occurring multiple-PDF scene and known-source strength after earlier losses; these have simulation fixtures, but still need human visual acceptance. No full new human playthrough is claimed. Historical submitted exports and r12 evidence are preserved.

## September 28 — revision 12 readiness closure

318 tests pass across 39 files; production build and whitespace checks pass. Nine focused closure tests cover replacement PCs, LAT casualties, capture, guard preference/replay, fortification response, enemy counter sides, event loads, sniper identity protection and ammunition priority. Six final-code scripted KUTF runs terminate and reconstruct full state, RNG and events exactly. These are scripted strategies, not human acceptance or balance tuning.

| Seed | Strategy | Outcome | Turn | Orders | Friendly casualty steps | Contacts left |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| kut-1 | direct | DEFEAT | 10 | 124 | 10 | 5 |
| kut-1 | support | SUCCESS | 10 | 102 | 12 | 4 |
| kut-1 | recovery | DEFEAT | 10 | 71 | 11 | 11 |
| kut-2 | direct | DEFEAT | 10 | 51 | 12 | 6 |
| kut-2 | support | DEFEAT | 10 | 54 | 17 | 10 |
| kut-2 | recovery | DEFEAT | 10 | 54 | 9 | 10 |

The kut-1 support policy now succeeds; remaining contacts do not invalidate KUTF success when both objectives are secured. Compared with revision 11, changes arise from corrected activity/capture behavior and consequent seeded draw order, not combat probability changes. Historical exports and prior output directories are preserved. New records: `output/keep-up-the-fire-integration-r12-v11/`.

Browser checks on isolated `127.0.0.1:4182` passed: KUTF setup/start, 25-formation roster, formation inspection, command arithmetic, Escape dismissal, narrow DOM bounds (no page overflow), guard-remainder selection, capture review, and reload/strict resume after capture. No captured console errors. Viewport override was reset, the test tab closed, and the agent's test server stopped; the user's localhost mission was untouched. Screenshot capture timed out. These interaction checks do not certify visual appearance or replace a full human mission, including CCP evacuation and final scoring.

See [KUTF readiness audit](KUTF_READINESS_AUDIT.md) for completed corrections, remaining acceptance and campaign boundaries. Rules 12; KUTF content 11; course content 4. Older executable records reject strictly.


## September 28 — revision 11 validation

Full regression suite: **309 tests passed across 38 files**. Final UI-focused checks: 7 passed. Production build passed. Both KUTF seeds completed all three scripted policies and reconstructed their full state, RNG and history exactly from exported operations. These are scripted checks, not human playthroughs or balance judgments.

| Seed | Policy | Outcome / turn | Orders | Friendly casualty steps | Contacts left |
| --- | --- | --- | ---: | ---: | ---: |
| kut-1 | direct | DEFEAT / 10 | 124 | 11 | 5 |
| kut-1 | support | DEFEAT / 10 | 88 | 7 | 3 |
| kut-1 | recovery | DEFEAT / 10 | 107 | 13 | 0 |
| kut-2 | direct | DEFEAT / 10 | 71 | 12 | 5 |
| kut-2 | support | DEFEAT / 10 | 55 | 17 | 10 |
| kut-2 | recovery | DEFEAT / 10 | 54 | 9 | 10 |

Revision-10 comparable records: kut-1/support changed from 86 orders / 12 casualty steps / 4 contacts to 88 / 7 / 3; kut-2/recovery remains 54 / 9 / 10. Both remain turn-10 defeat. No probability or balance tuning was performed. Zero remaining contacts does not imply victory: KUTF requires securing both objectives.

Artifacts: `output/keep-up-the-fire-integration-r11-v11/`. Historical inputs and revision-10 outputs were preserved. Browser automation failed to initialize; desktop/narrow visual and keyboard sign-off remain open. Read-only readiness fixtures confirmed empty-card casualty capture and isolated-enemy activity gaps; a hidden CCP setup correctly rejects. See [readiness audit](KUTF_READINESS_AUDIT.md) for scope and blockers.


## September 26 validation: rules revision 10

KUTF first human baseline: 557 operations, defeat T10, 27 points; revision-9 reconstruction matched the submitted AAR before implementation. Source files remain unchanged. Revision-10 diagnostic comparison rejects 403 operations beginning at 152 and stalls in T3 combat; it is not a new valid playthrough.

Complete revision-10 scripted checks: kut-1/support = defeat T10, 86 orders / 12 casualty steps / 4 PCs; kut-2/recovery = defeat T10, 54 / 9 / 10. Both strictly reconstruct state, RNG and history. Targeted tests cover card priorities, seeded ties, spatial frozen combat, hidden queue protection, free unloading, actual XO reconstitution and safe recorded reviews. Full regressions and build pass. Browser automation failed to initialize; desktop/narrow and human UI acceptance remain open. See KEEP_UP_THE_FIRE_STATUS.md for commands and artifacts.


## Prior standalone validation update — September 25, 2026

Keep Up the Fire content 11: focused upper-story/fortification checks and full regression/build pass. Public-mission kut-1/support and kut-2/recovery runs both finish at turn 10 and replay exactly. These are scripted validation, not human acceptance; detailed results and remaining audit are in KEEP_UP_THE_FIRE_STATUS.md.


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

## Revision 8: September 23 playtest follow-up

Preserved baseline: `reference/playtest_replays/company-company-2-replay_9_23.json` (SHA-256 `ca28f163e8c560fc9e21d35b42bc7a57b7d1422211fde6374ab7d20e86dc4175`) contains 457 operations; its paired AAR reports success at turn 10. Diagnostic comparison first rejects operation 401, a historical `RECONSTITUTE` without a removed-squad target or contributor list. Subsequent combat IDs and phase operations diverge; 44 rejections and the diagnostic ACTIVE/turn-9 endpoint are not a new human outcome. The source replay/AAR and notes were not edited.

The notes' four-step `1/1 Rifle Squad` came from implicit selection of the first removed squad and four nearby teams, even though the submitted selected formation was `3/1 Rifle Squad`. Revision 8 requires explicit teams and a previously removed counter within its authored capacity. The noted Cease Fire concern is a presentation issue: a single order already affected all friendly occupants on the card and could immediately reopen eligible fire. The +2 All Pinned VOF belongs on the receiving card; its pinned source is now named when visible. Same-card basic fire excludes its own source.

161 automated tests and the production build pass. All six scripted company-1/company-2 policies reconstruct exactly and retain revision-7 summaries: company-1 direct 40/8/6, support 28/6/5, recovery 31/4/6; company-2 direct 40/8/5, support 80/6/1, recovery 57/8/5 (orders/casualty steps/contacts left). All are turn-10 defeats. An isolated clean-origin desktop browser load showed the revised map legend and no startup error; long PDF and reconstitution visual interactions remain to be checked in a human run with eligible battlefield state. Existing saved missions on other browser origins were left untouched. Human tactical acceptance is still open.

## Revision 8: Testing Notes 6 presentation follow-up

The submitted `company-company-2-replay9_23_2.json` remains unchanged. Strict replay still reconstructs all 499 operations, 1291 raw events, 104 orders and 75 visible combat resolutions, ending in DEFEAT on turn 10. Its AAR is a report, not an executable replay.

The turn-1 German Litter Team did not generate basic fire; U.S. formations on its card fired. Under third-edition §§6.1.1–6.1.2, established fire may remain after capture or departure and can affect later friendly entrants. The apparent turn-9 same-card friendly fire was a held point-blank direction with no opposing recipient; basic fire does not attack its own faction. Turn-7 movement changed an affected PDF card, while the turn-8 Incoming removal reopened an established path. No combat legality or probabilities were changed.

The player projection now names friendly dropped radios/equipment, retains the combat review event boundary, and supplies an explicit PDF source/path/recipient explanation. The combat panel remains full-width above the map after the cramped side layout was reverted; the page uses the full viewport width without outer margins. HQ side and radio capability and pinned-recovery results are more visible. Rules revision 8 and scenario version 4 remain. All 166 tests pass with the thread pool; production build passes. Browser walkthrough and another human comprehension run remain open.

## Revision 9: mission foundation wrap-up

183 tests and production build pass. All six Company Assault policy outcomes and order/casualty/contact counts remain identical to revision 8, with exact revision-9 replay reconstruction. Historical files were not modified. Setup preview, mission gating and desktop/narrow browser evidence are recorded in [KEEP_UP_THE_FIRE_STATUS.md](KEEP_UP_THE_FIRE_STATUS.md).

### September 24 continuation: mission contact, event and scoring corrections

214 tests and production build pass. New fixtures cover contact rays, invalid-direction redraws, enemy/PDF exclusions, counter reuse with surviving LATs, atomic strongpoints, package exhaustion, delayed maneuvering fire, final-position scoring, capture scoring, and every higher-HQ table entry at turn-band boundaries. Behavioral event checks cover command obligations, outage expiry, rally activity exclusion and unguarded surrender. Keep Up the Fire content is now v2; course content remains v4 and rules remain v9.

All six Company Assault policies were rerun with exact replay reconstruction: company-1 direct/support/recovery remain 40/8/6, 28/6/5, 31/4/6; company-2 remain 40/8/5, 80/6/1, 57/8/5 (orders/casualty steps/contacts remaining). All end in turn-10 defeat, unchanged from the prior checkpoint. This continuation changes no playable UI layout; no new browser or human playthrough was performed. Keep Up the Fire remains gated pending the substantive checklist and integrated acceptance.

### September 24 continuation: buildings and tripod fire

227 tests and production build pass. Content-v3 fixtures cover occupied elevation and reciprocal LOS, safe unknown-source projection, tower capacity, bunker firing/observation separation, rifle-grenade building restrictions, grazing and overhead fire, smoke/slope limits, exposure/ammunition effects and HMG contact exceptions. The six course runs again retain the counts above and reconstruct exactly. No balance changes or historical-export edits. New browser and human validation remains open; the standalone mission is still gated.

### September 25 continuation: support and offensive WP

241 tests and production build pass. New checks cover all six caller/agency draw allowances, required caller networks, HE/WP target eligibility, experience and registration, short-round precedence/self-target displacement, failed requests, support timing/expiry, WP screening, shared enemy mortar registration, spotter withdrawal and source secrecy. Offensive WP tests cover success/miss, asset consumption, attempt limits, deterministic results, stronger-HC preservation and invalid-order rejection. All six Company Assault policies retain the prior summaries and exact replay reconstruction. Content is v4 for the gated standalone mission; rules remain v9 and course content v4. New browser and complete human-mission validation remain open.

**Keep Up the Fire is not a complete playable mission yet.** New mechanics remain developmental; browser validation covers setup preview only. Full rules validation, complete scripted mission runs and a human playthrough are still required. Normandy remains locked.
