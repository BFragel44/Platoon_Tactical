# Normandy Mission 7 — Tinchebray Offensive

Status, October 11, 2026: the user accepted the standalone M7 explicit-phase playtest, reporting no issues. M6 was accepted separately on the same date. The user-acceptance gate is complete for both vehicle missions; normal catalog selection and mission-specific recovery routing are now enabled. M7 consumes no M6 company or save. Development URL remains `http://localhost:5173/?tinchebrayDev=1`. Connected campaign progression and broader vehicle usability work remain deferred.

## Current release evidence

Current M7 replay envelope is **version 4**, content 1, shared base rules 33 and common vehicle runtime 15. Prior vehicle records are rejected for resume while original exports remain accessible. The vehicle boundary correction is validated independently; the subsequent UI refinements do not change simulation/replay versions. Earlier dated evidence below is retained as history.

- Complete-run fixtures pass: controlled thirty-turn three-attempt run; combat-bearing ten-turn success; combat-bearing failure → failure → success. All use normal explicit phases and exact replay; outcome checkpoints reload, immutable attempt records persist, and duplicate debrief is rejected. These are deterministic authored battle setups, not autonomous coverage of every possible randomly generated fight.
- Source-focused fixtures cover published package alternatives, nested leader placement, every HQ-event table slot, mine/close/point-blank boundaries, counter exhaustion, finite support and caller draws, battalion choices, Green profiles, unique XP spending, finite M5 entry and preserved M10 losses/wrecks across both reattempts.
- Persistence fixtures cover active/stale/duplicate rejection, failed tactical/roster writes, independent M6/M7 storage, surviving crew redeployment and immutable snapshots. A different mission's checkpoint cannot enter M7 recovery.
- Isolated Chrome QA passes setup/objective rows, four M10s, mounted observer Jeep, five M5 entry choices, both reattempt dialogs, live M10 movement and enemy AT reaction, pending-reaction reload, battalion choice/reload, both observers/all support agencies, keyboard tab and 850px layout, with no page errors. Evidence: `tmp/tinchebray-browser/results.json` and screenshots.
- Six Company Assault and six KUTF scripted runs completed with exact replay; isolated reports are in `tmp/tinchebray-validation/company` and `tmp/tinchebray-validation/kutf`.
- Production build passes with the existing bundle-size advisory. Final full suite: **114 files / 1,694 tests passed** on October 10 (269.60 seconds), including historical-reader and M6 regressions. Earlier intermediate failures were corrected and are not release evidence.

The dated sections below record implementation stages; their earlier pending lists are superseded by this current release evidence and the final checklist.

### Foundation implementation, October 10

Authored `tinchebrayContent.js` and the gated `tinchebray.js` definition: six-row map, separate objective rows, eleven package definitions, printed draw/event tables, Green enemy baseline, isolated roster key, two permitted reattempts and distinct M10 vehicle profile. Setup now accepts explicit mission objective rows while retaining existing missions' defaults. No normal-selection or development-play URL has been enabled for M7 yet.

`test/tinchebrayFoundation.test.js` covers 28 cards, 24 letter-side contacts, objective/attack boundaries, definition immutability, unsupported counter rejection, absence of inherited counterattacks, and the M10's eight initial crew steps. This is content/setup evidence, not complete live execution evidence. The third-attempt transition, live factory and vehicle runtime integration, independent save/replay identity, full mission runs and browser acceptance remain pending. M6 remains gated for user acceptance.

### Deployment and package integration, October 10

Added scenario-driven vehicle deployment behind the unchanged Vire adapter API, plus `tinchebrayDeployment.js`: four M10s, five event-only M5s, independent initial/event crew identities and a fresh M7 company roster. No M6 roster is consumed. Added a validated M7-only additional-minefield branch for package 3; it preserves the accompanying sniper on an already mined card. The branch consumes an explicit recorded R#3 draw. Package 1 uses its own R#9 follow-up distribution and MG4 load.

`test/tinchebrayDeployment.test.js` exercises initial/event placement restrictions, fresh roster separation, all three sniper mine outcomes on fresh and already mined cards, and all nine package-1 follow-ups. Package execution currently uses the common validated harness; this does not establish full M7 phase, recovery or replay compatibility. Keep M7 gated until the live runtime, all packages/events, complete three-attempt validation and browser checks are finished.

### Live runtime and attempt integration, October 10

Added the explicitly opted-in `createTinchebrayDevelopmentMission` factory, sharing validated vehicle procedures without assigning the Vire mission flag. Its replay envelope is `tinchebray-integration` version 1, content version 1, using base rules 33 and vehicle adapter 14; Vire's replay envelope and adapter version remain unchanged. Added strict Tinchebray replay checks and separate recovery storage at `platoon-tinchebray-integration`. Campaign debrief now recognizes M7's actual vehicle crew steps.

The shared attempt transition now increments the attempt number and supports M7's two permitted reattempts. Surviving vehicle placement and replenishment, preserved terrain/mines/spotting, immutable attempt records and finite M5 availability use the existing vehicle transition. M7 separately tracks cumulative experience spending so location awards cannot fund promotions twice. Focused runtime fixtures cover factory gating, one phase transition with exact replay, isolated recovery, both reattempts and experience-spending rejection. The three-file M7/M6 mission and release regression run passed 90 tests; foundation/normal-phase fixtures passed another 48. Production build passed with the existing bundle-size advisory.

### Execution audit and initial development UI, October 10

`tinchebrayExecution.test.js` passes 53 fixtures: all authored package alternatives and every early/late friendly/enemy HQ slot, Green original experience, printed starting ammunition, no-fire/spotted behavior, pending M5 entry without another draw, resupply and artillery unavailability. Starting loads are checked separately from ammunition spent immediately on execution. Earlier deployment fixtures cover all R#9 mine follow-ups and R#3 sniper-plus-mines branches. Additional close/point-blank boundaries, stock exhaustion and affected-unit event outcomes remain to be audited for M7.

`tinchebrayCompleteRun.test.js` passes a controlled two-failures/third-attempt-success run through thirty turns of explicit phases, exact replay at all outcomes and transitions, checkpoint reload and duplicate terminal debrief rejection. Contacts are deliberately resolved in the fixture, so this is phase/persistence evidence, **not** combat-bearing or natural-contact validation.

The explicit development entry is now `?tinchebrayDev=1`; normal mission selection remains gated. Setup shows four M10s, primary Row 6, secondary Row 5 and attack Row 4. Reattempt UI supports both transitions and accounts for already-spent experience. M10 map counters have their own label. `scripts/tinchebrayBrowserQA.js` uses an isolated Chrome context and passes initial setup/start/reload, separate M7 tactical/roster storage, four M10 counters, designated objective rows, keyboard tab and 850px viewport checks with no page errors. Screenshots/results are in `tmp/tinchebray-browser`. This caught and corrected the missing M7 standalone-slot allowance; M6 slots were untouched. These checks do not yet cover both reattempt dialogs, pending support choices or the complete UI playthrough.

Validation: 54 package/event and complete-run tests passed; another 73 focused runtime/setup/presentation checks passed. Production build and diff whitespace checks passed (existing bundle-size advisory remains).

Still pending: complete combat-bearing successful and failed-first/failed-second/third-attempt runs, remaining package/event outcome audits, stale-debrief/storage-failure/redeployment coverage, expanded browser checks, full regressions and scripted Company Assault/KUTF/historical checks. User acceptance remains the final release gate.

## Source authority

`reference/FoF_Deluxe_Normandy_Campaign.pdf`, printed pp.42–46 (August 8–16, 1944), plus TO&E/CSR pp.12–15 and breakdowns pp.47–48. All five mission pages, including the map and tables, were rendered and visually inspected October 10. The WWII M10 row in the supplied Vehicle and Anti-Tank Weapons Chart was also visually inspected. Third-edition §3.9 and §§10.1–10.8 govern the transition and vehicle procedures.

M7 has **one MSR: ordered vehicle/AT groups**. It has no Counter Attack event, alternate counterattack package chart, Scouted Terrain requirement or battlefield import. Do not inherit M6's counterattack capability or conceal ordinary M7 A/B contacts as question-side markers.

## Mission content

| Source | Requirement |
| --- | --- |
| pp.42–43 | Offensive, ten daylight turns, four columns × six rows, staging below Row 1 |
| p.42 | **Two reattempts**, allowing three attempts total |
| p.42 | Primary on Row 6; secondary on Row 5; attack on Row 4 adjacent to secondary |
| p.42 | Both objectives secured and all original Row-1–5 cards cleared; expanded cards do not enlarge clearing requirements |
| pp.42–43 | Eight C contacts on Rows 1–2, eight B on Rows 3–4, eight A on Rows 5–6, letter side up |
| p.42 | Delay Defense, **Green** enemy experience, six randomly selected FJ counters with printed breakdowns |
| p.44 | Both Line observers, two one-step Line HMGs with MG6 each, three-step Line engineers |
| p.44 | **Four M10 tank destroyers including HQ**, Line, five ammo each; 612th Tank Destroyer Battalion |
| pp.44–45 | Event-only five M5s including HQ, Line, five ammo each, player-selected Row-1 entry |
| p.44 | M10 and M5 platoons susceptible to AT ambush; optional fixed ARTY-radio Jeep under CSR 1 |
| p.46 MSR | Tanks/tank destroyers → Jeeps → AT guns/AT infantry; complete both sides of each group, preserving normal reaction opportunities |

### Vehicle profile

Published M10 TD 76mm: gunnery P/C/L/V = **−5/−3/−1/0**, defensive value **−1**, two crew steps, mobile, Move & Fire **+2**, Quick Shot eligible, target V, H VOF, passenger capacity four. Author a distinct supported profile; do not substitute Sherman statistics. Starting force has eight crew-step identities, distinct from event M5 crews and infantry.

### Fire support

Draws are artillery FO / mortar FO / CO. Artillery battalion missions are available.

| Agency / ammunition | Modifier | Draws | Missions |
| --- | --- | --- | --- |
| Artillery HE | −5 | 3 / 2 / 2 | 4 |
| Artillery WP | −4 | 3 / 2 / 2 | 1 |
| Artillery TOT | −7 | 3 / 2 / 1 | 1 |
| Battalion mortar HE | −3 | 2 / 3 / 2 | 3 |
| Battalion mortar WP | −3 | 2 / 3 / 2 | 1 |
| Regimental cannon HE | −4 | 3 / 3 / 2 | 3 |
| Regimental cannon WP | −4 | 3 / 3 / 2 | 1 |

### Contact charts and packages

R#1–10 arrays:

| Letter | Package numbers |
| --- | --- |
| A | 4, 5, 6, 7, 8, 8, 9, 9, 10, 11 |
| B | 1, 2, 2, 3, 4, 4, 4, 7, 8, 8 |
| C | 1, 1, 2, 2, 3, 3, 4, 4, 6, 6 |

| # | Published force and branches | PDF / spotted | Placement |
| --- | --- | --- | --- |
| 1 | Mines; R#1–2/9 adds HMG MG4 in Foxholes, otherwise no added unit | Yes / No | Mines on trigger; HMG max LOS/range |
| 2 | Mortar Incoming −3 with spotter in Foxholes | Yes / No | Incoming on trigger; spotter max LOS |
| 3 | Sniper in Basic +1; R#1/3 additionally places mines on trigger | Yes / No | Sniper max LOS/range |
| 4 | LMG MG3 in Foxholes | Yes / No | R#1–2/10 point blank; otherwise max LOS/range |
| 5 | HMG MG4 in Foxholes | Yes / Yes | Max LOS/range |
| 6 | Exposed squad out of cover | No / Yes | Max LOS |
| 7 | Individual 81mm mortar team, MTR3, Foxholes | Yes / No | Max LOS/range |
| 8 | Panzerschreck RKT4 or PAK40 GUN4, Foxholes | Yes / No | Max LOS/range |
| 9 | Squad or squad plus available leader, Foxholes | Yes / No | R#1–2/10 close; otherwise max LOS/range; leader shares squad position |
| 10 | Squad infiltration under CSR 6 | No / Yes | Max LOS |
| 11 | 75mm infantry gun GUN4, Foxholes | Yes / Yes | Max LOS/range |

Directions: R#1–4/8 front, 5–6 left front, 7–8 right front. Mortar spotters have two missions, three base draws for the second. A squads have MG4; every squad has one vehicle-only Panzerfaust; leaders have one rifle grenade. Unsupported profiles and stock exhaustion require explicit validation/redraw. Package 3's independent sniper-plus-mines branch must preserve the original sniper placement and perform mine checks for affected infantry/vehicles without duplicate placement or rewards.

### HQ events

Friendly early R#1–10: SITREP, SITREP, COMM, TANK_SUPPORT, CHECKING_UP, HOLD, ADVANCE, ADVANCE_PC, **NO_ARTY**, NO_MORTAR.

Friendly late: SITREP, COMM, TANK_SUPPORT, CHECKING_UP, HOLD, ADVANCE, ADVANCE_PC, **NO_ARTY**, NO_MORTAR, RESUPPLY.

Enemy early: EVAC, DISPLACE_MORTAR, DISPLACE_LEADER, DISPLACE_HMG, RALLY, RALLY, FALL_BACK, FALL_BACK, FALL_BACK, FALL_BACK.

Enemy late: EVAC, EVAC, DISPLACE_LEADER, DISPLACE_HMG, RALLY, RALLY, FALL_BACK, FALL_BACK, FALL_BACK, FALL_BACK. **No late mortar displacement and no counterattacks.** No events on Turn 1; late tables start Turn 7.

SITREP uses first three CO commands; COMM blocks BN activation and uses first two. Visitor remains two turns. HOLD/ADVANCE reference the current lead US row, including actual vehicles. ADVANCE obligations are ignored at Row 6 or, for ADVANCE_PC, if no PC is reachable. Completed starred obligations earn one XP that turn with no invented failure penalty. RESUPPLY places four of one chosen infantry ammunition type on a Row-1 card; tanks cannot reload in-mission (§7.18.1G).

## Implementation and persistence gates

- [x] Visually review mission diagram, attachments, support, packages, events and M10 chart row.
- [x] Author separate Tinchebray content version 1 and gated scenario; validate every table, profile and objective boundary.
- [x] Generalize vehicle execution/setup/deployment/event entry by scenario capabilities; preserve M6's adapter-14 records and strict historical rejection/export access.
- [x] Add actual M10 profile, deployment, counters, command net, crew identities and finite event M5 force; no Sherman substitution.
- [x] Execute sniper-plus-mines package branch and all printed nested draws, stock limits and Green experience modifiers.
- [x] Exclude M6 counterattack/late-mortar-displacement behavior; use Tinchebray's NO_ARTY event instead of Vire's NO_CANNON.
- [x] Default fresh standalone roster and separate tactical/roster slots; never import, overwrite or advance M1–M6 records.
- [x] Generalize reattempt limit to two, with three immutable starting records linked to one mission run; permit only after failure and reject attempt four.
- [x] Retain terrain, discovered cover, mines, remaining contacts, spotting and unique location rewards across both transitions. Replenish only surviving prescribed resources, restore Delay Defense, retain finite M5 stock and actual vehicle/crew losses.
- [x] Preserve local reconstitution/XP choices and identity validation; terminal debrief applies once across all three attempts and rejects active, duplicate or stale application.
- [x] Retain accepted right panel, explicit phases, optional Jeep, phones, runners, inventory, command links and hidden information protection. Show M7's six-row briefing/rules and actual support resources.

## Validation and release

- [x] Focused deterministic fixtures for every package branch, R# slot, event, Green experience case, objective boundary and M10 profile/action/outcome.
- [x] Test ordered groups with reactions/Quick Shot, depletion, tank riders, mines, smoke, Jeep mounted-radio calls, HQ loss and pending-choice recovery.
- [x] Complete successful ten-turn combat-bearing M7 run with exact replay.
- [x] Complete failure → reattempt → failure → second reattempt → success, exact replay/checkpoint recovery across all three attempts, unique rewards, finite M5 force and duplicate-debrief rejection.
- [x] Full regressions, production build, Company Assault/KUTF checks and accepted historical-reader tests; preserve source exports.
- [x] Isolated browser checks: setup, six-row map, four M10s, five event M5 entries, all support agencies, both reattempts, pending choices, keyboard access, narrow layouts and reload.
- [x] Provide explicit development opt-in; leave normal selection gated for user acceptance.
- [x] Obtain the user's explicit-phase acceptance before normal M7 selection.

Connected campaign progression, between-mission replacements/promotions and the planned 3D/audio presentation remain deferred. Standalone fresh-company defaults make no claim about historical post-Vire casualties or strength.

### Integrated vehicle controls (2026-10-10)

Vehicle map selection now opens inline orders in the existing right pane. Vehicle HQ impulses are selectable in the command strip; command activation and phase 3.6 controls are separated by phase. Vehicle selection persists through recovery. Replay, original-save export and development setup are in File → Vehicle replay and recovery. Simulation operations and replay versions are unchanged.

Validation: `scripts/vehicleInlineBrowserQA.js` covers M6/M7 inline selection, HQ strip, phase filtering, selection reload, export access and 850px layout, plus CO activation → vehicle HQ impulse → individual tank activation and phase 3.6 availability with exact adapter replay. Focused controls/normal-phase/integration fixtures: 26 passing; production build passing. This UI revision awaits player feedback; normal mission release gates remain unchanged.

### Vehicle interaction refinement (2026-10-10)

Replaced typed movement paths with adjacent-card route controls on the map and a named-card dropdown; route planning survives reload. Vehicle controls now validate proposed operations against disposable state and show usable actions/targets only. Empty target menus and irrelevant response/disembark controls are concealed; transport/cargo is collapsed. Vehicle HQ activation is available directly in the command strip. HQ selection distinguishes infantry and vehicle impulses.

The orders pane scrolls independently on desktop, preventing a tall panel from shifting the map. Movement acknowledgements run the recorded origin/entry/destination checks through one card, then stop for crew HITs, reactions, Quick Shots and the per-card stop/fire/continue choice. No combat decisions or phase advances are automated. The map can locate vehicles and focuses the moving vehicle after movement acknowledgements.

Evidence: `test/vehicleInteraction.test.js` covers immutable availability checks, hidden targets, adjacency/No/Slow terrain, per-card movement with exact replay, enemy reaction interruption and origin-VOF knockout/crew HIT interruption. `scripts/vehicleInlineBrowserQA.js` covers map route selection/reload, actual movement and replay restoration, completed-action filtering, command-strip activation and independent panel scrolling, in addition to both mission restart flows. Simulation rules and replay versions are unchanged; player playtest gates remain in place.

### Common platoon HQ activation flow (2026-10-10)

Vehicle platoon HQs now appear in the selected Company HQ's normal Activate HQ / staff target list. Issuing that order dispatches the existing `ACTIVATE_VEHICLE_HQ` adapter operation with its original command cost, radio authority and duplicate checks; rules and replay versions are unchanged. The separate vehicle-pane and command-square activation buttons have been removed. Vehicle HQ command squares retain status and eligible subordinate/initiative impulse selection. HQ impulse activation remains distinct from activating the HQ tank itself for movement/combat.

Browser evidence: `scripts/vehicleInlineBrowserQA.js` now issues the normal Company HQ order, selects the subordinate vehicle HQ impulse, activates its tank and executes map-planned movement with exact replay restoration. Focused interaction fixtures cover duplicate/radio rejection, command debit, target projection immutability and replay.

### Vehicle mission-boundary correction (2026-10-11)

Friendly vehicle movement now rejects every outside-boundary card in the full proposed route before modifying state. UI route suggestions use that validation, so generated enemy-placement cards no longer offer Move here. In-boundary movement is unchanged. Focused interaction fixtures verify direct and intermediate outside-card rejection, immutable failure and allowed adjacent in-boundary destinations.

Simulation compatibility: shared vehicle adapter is now 15 and Tinchebray replay envelope 4 (base infantry rules remain 33). Prior vehicle records are incompatible for resume and remain available through original-save export; start a fresh development run under the corrected version.

### User playtest acceptance (2026-10-11)

The user reported that M7 showed nothing amiss and is good to go. This completes standalone M7 explicit-phase user acceptance. All seven Normandy standalone missions now have recorded user acceptance; this is not validation or implementation of connected campaign progression. Vehicle presentation/usability refinement remains in `docs/FOR_LATER.md` for the next project phase. Continue correcting demonstrated gameplay bugs.

## Normal selection release - October 11, 2026

Accepted standalone mission is now available without a development URL. Setup/recovery dispatch by mission identity; vehicle saves remain isolated. Development URLs remain supported. Normal switching/reload/abort/restart and inline vehicle browser checks pass. Company preparation is a separate candidate; see [company readiness](CAMPAIGN_COMPANY_READINESS.md).

## October 11 normal vehicle release and company preparation

All seven standalone missions are normally selectable. M6/M7 setup and recovery now dispatch by selected mission, with separate saves and compatible development URLs. File > Campaign company provides a fresh M1 company with separate preparation/tactical storage and no automatic imports. [Company readiness](CAMPAIGN_COMPANY_READINESS.md) records evidence and remaining audits. Connected advancement remains gated.
