# Normandy 5: St. Germain d’Elle—La Croix Rouge—Le Soulaire Defensive

Status, October 9, 2026: source audit, package execution, isolated terminal persistence, authentic three-patrol variants and browser validation completed. Mission 5 is available through `?stGermainDev=1`; normal selection remains gated pending explicit-phase user acceptance. Shared rules are 32; M5 content is 2. Company Assault, KUTF and accepted Normandy Missions 1–4 retain their storage and original exports. This guide scopes a standalone development candidate, not connected campaign progression. Earlier dated sections below preserve historical validation evidence.

## Authority and reviewed sources

Primary source: `reference/FoF_Deluxe_Normandy_Campaign.pdf`, printed pp.32–35 (July 13–25, 1944), supplemented by general campaign instructions pp.12–15, breakdown charts pp.47–48, supplied third-edition rules and player aids. Pages 32–35 were extracted, rendered and visually inspected October 8, including the six-column diagram, attachments, support, both HQ tables, all packages, draw tables and MSRs. The remaining counter/procedure pages and aids were visually audited October 9; source-to-fixture mapping follows below. A checked source-review item does not claim user acceptance.

| Source | Published requirement | Implementation / validation gate |
| --- | --- | --- |
| p.32; p.33 diagram | Six columns × four rows; same map for all patrols | Twenty-four original cards; no five-column constants; boundary expansions preserved between patrols |
| p.32 | Three patrols, one with each platoon; ten turns each; randomly selected Moon +2 through +5 each patrol | Distinct platoons, immutable starts, independent visibility draws and exact transition replay |
| p.32 | Begin Row 1; pass through primary and four ordered route points, then finally cross Row 2→1 | Original Row-4 objective; four distinct route cards in Rows 2–4; no clearing/holding requirement |
| pp.32–33 | Two Foxholes per Row-1 card; MLR between Rows 1/2; one Row-2 COP with up to two Foxholes | Readable continuous MLR; labelled COP deployment; no PC on COP |
| p.32 | Row 4 A; Rows 2–3 question-side B/C | Six A and eleven B/C initial contacts after excluding COP; hidden letters concealed until evaluation |
| pp.32–33 | Veteran Deliberate Defense, six random FJ squads, both Line observers and two Line one-step HMG attachments | Printed profiles, finite counter mix, networks and immutable identities |
| p.34 | Eight support resources, caller draws and artillery battalion missions | HE/WP/illumination exhaustion, registered-target bonus, legal battalion pending choice and recovery |
| p.34 | Four early/late HQ tables | All forty slots, Turn-1 exclusion, Turn-7 switch, public explanations and cleanup |
| pp.34–35 MSR 1 | Optional stationary defenders; up to one platoon at COP; omitted units unused | Selected patrol/attachments start Row 1; defenders may act/fire but move only by automatic retreat; reserves receive no impulses |
| p.34 MSR 1 | Halve General Initiative draws, rounding down | Preserve accepted patrol command computation; do not halve twice |
| pp.34–35 MSR 1; third edition §3.9 | Reconstitute/update same map after each patrol; replace removed PCs; purchased skills carry onward | Dedicated inter-patrol preparation, retained terrain/cover/mines, rewards by participating platoon, persistent skill records |
| p.35 MSR 2 | Route points reached and removed in order | Visible checked-off progress; premature/out-of-order entries do not award progress |
| p.35 | Twelve packages, regular A/B/C tables and forward placement distribution | Every package/alternative/placement draw, unsupported-profile rejection and finite-stock redraw |
| pp.13–15, 47–48 | Patrol XP, communications, FJ/mortar breakdowns, Deep Bunkers and infiltration | Source audit and inherited-regression fixtures plus M5-specific integration |

## Scope and carryover

M5 specifies that its three patrols share a map. It has **no instruction to use M4's battlefield**, unlike M4's explicit M3 Scouted Terrain MSR. Start a fresh six-by-four battlefield; do not import Hill 192 terrain, engineers, mines, objectives, concentration, enemy survivors or spotting. The M3→M4 battlefield reader/store remains dedicated to its published handoff.

Use a fresh immutable US company snapshot with the published standalone pp.12–13 strength/experience/equipment baseline and M5 attachments. It is not a claim about the historical company after Hill 192. Keep a separately named M5 roster/debrief slot, company identity and export filename. Never replace or advance accepted M1–M4 companies implicitly. Connected roster transitions, replacements, promotions and unresolved casualty dispositions remain deferred. Keep purchased patrol skills in immutable attempt/roster records so later connected progression can consume them without inventing an M5→M6 transition now.

The p.33 diagram includes a Staging Area in its key and below Row 1. The operative patrol instructions explicitly start on Row 1 and place unused formations either in fixed defenses or outside the mission. Preserve accepted patrol behavior: off-map reserves are unavailable, rather than an active staging pool from which units can enter later. Record this distinction in setup and source notes; do not silently apply offensive staging/deployment rules.

The p.32 text specifies two Row-1 Foxholes; the diagram key says up to two. Use two as the initial default, up to two at COP, and document the distinction. COP and its defenses are mission setup, not the patrolling platoon's starting card. Allow at most one non-patrolling platoon there.

## Authored mission content

Begin `normandy_5` content at version 1 in separately authored `stGermainContent.js` and `stGermain.js`. Reuse proven patrol capabilities, not M3's identity or mutable content objects. Set six columns, four rows, three patrols, ten turns, Moon visibility, Veteran enemies and Deliberate Defense. Combat Patrol uses the offensive phase sequence despite the mission title. There is no timed counterattack event or extra failed-patrol reattempt: prepare the next unused platoon's patrol under MSR 1 / §3.9.

Preserve selectable patrol platoon, attachments, Row-4 primary, four route cards, COP, CCP and concentration. Each patrol can select its route/objective/concentration. Non-selected platoons/staff/weapons default off-map; explicitly deployed defenders remain inspectable and labelled appropriately. Preserve radios, runners created during play, mortar section/team choice, equipment, signals and phase lines. Campaign p.13 prohibits field phones on combat patrols; colored smoke cannot signal at night. Audit and allocate eight handheld illumination devices, rather than inheriting a daylight M4 setup.

### Fire support — p.34

Caller draws below are artillery FO / mortar FO / CO HQ.

| Agency | Ammo | Modifier | Draws | Missions |
| --- | --- | --- | --- | --- |
| 15th Field Artillery Battalion | HE | −5 | 3 / 2 / 2 | 4 |
| 15th Field Artillery Battalion | WP | −4 | 3 / 2 / 2 | 1 |
| 15th Field Artillery Battalion | Illum | N/A | 3 / 2 / 2 | 6 |
| Battalion Mortar Platoon | HE | −3 | 2 / 3 / 2 | 3 |
| Battalion Mortar Platoon | WP | −3 | 2 / 3 / 2 | 1 |
| Battalion Mortar Platoon | Illum | N/A | 2 / 3 / 2 | 4 |
| Regimental Cannon Company | HE | −4 | 3 / 3 / 2 | 3 |
| Regimental Cannon Company | WP | −4 | 3 / 3 / 2 | 1 |

Artillery battalion missions are permitted; no TOT resource or cannon illumination is published. Preserve pending ordinary/two-adjacent-card choices without a second command/draw, illumination strength/expiry, cross-agency communication eligibility and concentration +1 caller draw under §7.16.5. Failed calls retain stock where the rules specify; ammunition expenditure and agency availability remain distinct.

### HQ events — p.34

No Turn-1 event. Early tables apply Turns 2–6; late tables Turns 7–10. No M4 enemy Turn-6 switch.

| Friendly event | Early R#10 | Late R#10 | Procedure |
| --- | --- | --- | --- |
| Comm Trouble* | 1–2 | 1–3 | BN does not activate CO; first two CO commands restore communications |
| Lost in the Dark | 3–4 | 4 | Random patrol unit moves one card in random direction, Exposed; off-map movement adds card and row PC, A for Row 5 |
| Hold up! | 5–6 | 5–6 | No unit moves onto an unoccupied card this turn |
| Rain | 7 | 7 | Visibility +2 for this turn, subject to Limited Visibility; remove at cleanup |
| Mortar Displacing | 8 | 8–9 | Battalion mortar unavailable this turn; inventory is not consumed |
| Screaming for Action* | 9–10 | 10 | Move a unit towards the next waypoint; ignore after all four visited |

Starred events award one XP when completed that turn; no penalty for inability due to insufficient commands. Use route progress eligibility, not M4's new-row/PC advance obligations. Other events are unstarred.

| Enemy event | Early R#10 | Late R#10 |
| --- | --- | --- |
| Evacuate casualties | 1 | 1–2 |
| Displace mortars | 2 | 3 |
| Displace leaders | 3 | 4 |
| Displace HMGs | 4 | 5 |
| Rally | 5–6 | 6–7 |
| Fall Back | 7–8 | 8–9 |
| Shifting Lines | 9–10 | 10 |

Evacuation/displacement affect cards without US troops. Rally pinned units and upgrade unpinned LATs; Fall Back moves unpinned units straight back one card. Shifting Lines removes every unresolved Row-4 PC, redraws A/B/C randomly and replaces them question-side, subject to contact/counter rules. It does not alter tactics or phase sequence. Public summaries must not reveal affected hidden formations or replacement letters.

### Packages and placement — p.35

R#10 tables, in draw order 1 through 10:

- A: `3, 4, 4, 5, 8, 8, 9, 10, 11, 12`
- B: `1, 1, 2, 2, 2, 5, 6, 6, 7, 7`
- C: `1, 1, 2, 2, 2, 3, 5, 5, 6, 7`

**B differs from accepted M3**: draw 6 is Patrol (5), not LMG Nest (3); draw 7 is Illum & LMG (6), not Patrol (5); draw 9 is Illum & Patrol (7), not Illum & LMG (6). Author these explicitly and fixture every slot.

| # | Force / cover | PDF/VOF | Spotted | Placement |
| --- | --- | --- | --- | --- |
| 1 | Mines | Yes | No | Triggering card |
| 2 | Single incoming artillery −4 or mortar −3; no spotter | Yes | No | Triggering card |
| 3 | LMG, 6 ammo, Foxholes | Yes | No | R#10 1–2 point blank; 3–10 max LOS/range |
| 4 | Squad in Foxholes / HMG, 8 ammo, Foxholes | Yes | Yes | Both max LOS/range |
| 5 | Exposed squad, no cover | No | Yes | Max LOS |
| 6 | Mortar illumination / LMG, 6 ammo, Foxholes | Yes | Yes | Illum on trigger; LMG max LOS/range |
| 7 | Mortar illumination / exposed squad, no cover | No | Yes | Illum on trigger; squad max LOS |
| 8 | Squad in Foxholes / squad plus leader if available, Foxholes | Yes | No | R#10 1–2 both Close; 3–10 both max LOS/range |
| 9 | Squad in Trench / squad in Trench plus HMG, 8 ammo, Bunker | Yes | No | Both max LOS/range |
| 10 | Two-step squad plus leader, Deep Bunker (CSR 5) | No | Yes | R#5 1–3 point blank; 4–5 Close |
| 11 | Squad infiltration (CSR 6) | No | Yes | Max LOS |
| 12 | LMG and three-step 81mm mortar section, 6 ammo each, together in Foxholes | Yes | No | Max LOS/range |

Slash-separated entries retain the published package placement grouping; do not recast them as a mutually exclusive force choice without source justification. Package 2 has the artillery/mortar alternative. Only package 8 explicitly makes its leader optional. Package 10's leader is required: exhausted required counters redraw. Check the two-step FJ squad's printed profile/ammunition treatment rather than creating an unsupported generic squad. Deep Bunker occupants begin without fire, cannot spot/signal/grenade while inside, and leave on the specified enemy actions. M5 has no outflanked-pillbox package.

Placement R#8: 1–4 Front, 5–6 Left Front, 7–8 Right Front. Six FJ squad identities drawn randomly; A-rated squads carry six ammo, leaders two rifle-grenade shots. German 81mm section and named team breakdowns use the printed chart; enforce ammunition inheritance, jams and depletion. Weapons teams transport at most six ammo: extra rounds in eight-ammo nests stay behind when they move. Redraw packages that cannot legally be placed under §8.3, without partially applying mine/illumination/force effects.

## Inter-patrol preparation, rewards and persistence

Use the proven patrol transition as a replayable operation: one immutable starting record per patrol, same mission run and fresh instance identity for the mission, unused platoon validation, local reconstitution/XP spending, battlefield retention and replaced removed contacts. Audit §3.9 replenishment/reset fields explicitly; do not reset terrain, cover, known mines or unknown remaining contacts indiscriminately. Skills bought during patrol preparation remain recorded. Failed patrols still allow the next unused platoon; no campaign failure penalty is invented. Survivor-mode CO casualty consequences remain outside the default standalone scope and must not be presented as implemented.

Only platoons that actually patrol can gain patrol experience/promotions; deployed non-patrol defenders cannot spend these rewards. Apply published p.13 patrol scoring: primary cleared 4, each ordered route point 1, successful patrol 5, plus eligible general rewards. Visitation alone completes the objective requirement but is not clearing XP. Avoid duplicate location/general rewards and duplicate inter-patrol/debrief application after reload. Terminal debrief requires all three patrols finished; intermediate PATROL_COMPLETE is not a terminal company transaction. Preserve unresolved prisoner/guard/generic-team/casualty identities without inventing wounds or deaths.

## Implementation and release checklist

- [x] Read and visually inspect pp.32–35, including diagram, tables and complete MSRs.
- [x] Identify six-column footprint, different B distribution and Deep Bunker package; distinguish within-M5 map retention from unsupported M4 battlefield import.
- [x] Audit pp.12–15, 47–48, counters and applicable third-edition/player-aid procedures against each implemented M5 rule; add source-to-fixture links.
- [x] Author content-1 M5 scenario, tables, support, finite profiles, attachments and mission-rule text; validate every referenced profile and draw table. See foundation evidence below; this is not full executable package validation.
- [x] Audit shared patrol/map/UI code for five-column assumptions and M3 identity checks; generalize only where required, preserving accepted behavior.
- [x] Implement twenty-four-card setup, continuous MLR, COP exclusion, selected patrol/attachments, optional fixed defenders, unavailable reserves and both observers.
- [x] Implement all packages and placement branches, M5 B draws, mandatory package-10 leader/two-step FJ, Deep Bunker restrictions and finite redraw.
- [x] Verify night LOS/NCM, radios, illumination/expiry, rain, mortar section/teams, inventory/carry limits, ammunition inheritance and leaders.
- [x] Implement/verify all HQ slots, route obligation, Lost-in-the-Dark expansion, concealed Shifting Lines and unchanged offensive sequence.
- [x] Verify finite support, all caller draws, concentration and artillery battalion pending choices; do not inherit M4 TOT.
- [x] Implement three immutable patrol starts, one per platoon, complete replayable preparation, local XP/skills, replenishment and retained battlefield state.
- [x] Add separate M5 company/roster store and export names; source/recovery backups, atomic debrief writes, duplicate/stale/storage-error rejection and no M1–M4 modification.
- [x] Preserve accepted right panel, compact counters, grey non-participant leaders, stable header sizing, route checkmarks and explicit phase stepping; keep hidden information protected.
- [x] Add deterministic fixtures for all thirty package draw slots, every package/alternative/placement boundary, finite exhaustion, all forty HQ slots, six-column geometry, night/support/command rules and route/return/XP boundaries.
- [x] Complete authentic three-patrol success and mixed failure/success runs, including expanded terrain, fixed defenders/reserves, attachments, reconstitution, XP/skills, exact replay/checkpoints and terminal debrief/save/reload/redeployment.
- [x] Run existing regressions/build, Company Assault/KUTF scripted checks and accepted M1–M4 version compatibility/export checks. Increment shared rules only for simulation changes; retain strict historical rejection and original exports.
- [x] Browser-check six-column setup/map, keyboard/narrow layouts, routes/MLR/COP, observers/support/illumination, combat, transitions, recovery and terminal AAR/debrief. Document actual evidence and automation limitations separately.
- [x] Expose explicit development opt-in after source, focused fixtures and complete runs.
- [ ] Enable normal selection after the user's explicit-phase M5 acceptance.

## First implementation increment

Author M5 content and separately gated scenario, with pure validation for the six-column map, draw distributions and package-10 counter requirements. Add focused source-backed fixtures before touching patrol persistence. Then integrate existing patrol execution and isolated storage, complete deterministic runs, and browser-check the real candidate. This planning change itself does not alter simulation, rules versions, mission selection or accepted storage.

## October 8 gated content/scenario foundation

Implemented `src/scenarios/stGermainContent.js` and `stGermain.js`: `normandy_5`, content 1, six-by-four map, three ten-turn night patrols, Veteran Deliberate Defense, all twelve packages, explicit M5 A/B/C tables, both HQ tables, published support/illumination, observers and HMG attachments. The scene uses detached accepted baseline profiles; it does not mutate M3/M4 content. Package 10 authors the two-step FJ squad and required leader together in a Deep Bunker, with the published R#5 placement split and no initial fire. It has no pillbox alternative, TOT or engineer attachment.

Read-only setup materializes 24 original cards, six initial A contacts, eleven question-side B/C contacts, twelve Row-1 Foxholes and up to two COP Foxholes. Column-six route/objective/CCP choices validate. Initial setup uses the accepted patrol interpretation of off-map reserves rather than active staging. The separate baseline company ID and intended M5 roster key are authored; storage allowlisting, start/export UI and complete terminal persistence are deliberately still pending. Normal creation rejects the gated scenario, and it is absent from the catalog. Test-only initial-state creation is not a playable development release.

`validateStGermainContent` combines shared Normandy profile/table checks with local checks for supported step overrides and complete, nonoverlapping placement draws. These checks leave shared execution and rules version **29** unchanged. M5 does not accept Hill 192 battlefield setup. Accepted companies and historical records remain untouched.

`test/stGermainFoundation.test.js` has **42 fixtures**, including all thirty package draw slots; content/version/gate/isolated identity; six-column geometry and COP exclusion; printed support/callers/attachments; exact HQ table content; Deep Bunker/mandatory leader specification; unsupported profile, cover, step override, draw and placement rejection; read-only preview and accepted-scenario immutability. These are authored foundation and initial-state fixtures, not demonstrations of every package executing or complete patrol transitions. Initial focused validation of M3/M4/M5 foundations passed 108 tests before the additional local validator fixture; final regression evidence follows.

Remaining first execution work: M5-specific package/placement/contact/HQ fixtures, six-column patrol integration audit and isolated roster persistence, followed by authentic three-patrol runs and actual browser candidate checks. No user playtest acceptance is claimed.

Final foundation validation: **78 files / 1,036 tests pass** with `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=30000`; production build passes (100 modules), and `git diff --check` passes. The first broad run found a stale Hill 192 weapon fixture expecting its old gated status; the fixture now verifies accepted playability, with no M4 simulation change. The focused M5/Hill weapon rerun passes 58 tests. No browser or complete M5 patrol-run evidence is claimed.

## October 9 execution, persistence and browser validation

This section records the earlier rules-30/content-1 increment. The completed rules-31/content-2 release evidence follows at the end.

Added 128 M5 execution fixtures across `stGermainPackages`, `stGermainEvents`, `stGermainIllumination`, `stGermainEngine` and `stGermainPreparation`, plus three saved complete-run fixtures in `stGermainCompleteRuns.test.js`. The earlier 42 foundation fixtures remain. Published p.35 packages execute with finite Veteran counters; both incoming agencies, point-blank/max and Close/max branches, all four package-10 R#5 boundaries, shared Deep Bunker, two-step squad, required/optional leader exhaustion and ammunition are covered. P.34 early/late friendly/enemy tables execute every slot; night fixtures verify illumination, exhaustion, concentration, night equipment, weather, LOS and patrol XP. Preparation fixtures cover reconstitution identity/ammunition, defender eligibility, purchased skills, immutable starts, replaced contacts and retained terrain/mines/spotting.

**Rules 30 correction:** package 8 could fail after placing its squad if building cover replaced the requested Foxholes: its accompanying leader searched for literal Foxholes instead of the actual cover just assigned to the squad. Package execution now carries the actual placed cover forward for accompanying formations. A focused fixture reproduces that case. This is a simulation correction, so rules 29 and earlier tactical records remain strictly rejected without changing their original export data. M3 battlefield data compatibility includes rules 30; the frozen rules-27 historical reader is unchanged. Current Hill 192 success and both failure→reattempt→success fixtures were regenerated separately in `output/hill192-playtests-v2-r30/`; all older output directories remain intact.

M5 now uses its own allowlisted `platoon-normandy-st-germain-standalone` slot and `st-germain-standalone-company-roster.json` export name. The successful/mixed authentic runs assert failed writes preserve the roster, stale revisions and duplicates are rejected, debrief and applied-mission records reload together, redeployment preserves person identities and immutable snapshots, and sentinel M1–M4 slots remain unchanged. Intermediate patrol completion rejects terminal debrief. The browser also verifies the final transaction and duplicate rejection after reload.

### Authentic public-order runs

`scripts/stGermainAcceptanceRun.js` uses player-visible legal command options, explicit phase/combat stepping and public `preparePatrol`; it never sets victory or manufactures battlefield state. It records every command and preparation in the replay. Each completed script run checks exact replay, checkpoint recovery and isolated roster transactions/redeployment.

| Saved rules-30 replay | Patrol 1 | Patrol 2 | Patrol 3 | Orders / contacts / illumination |
| --- | --- | --- | --- | --- |
| `output/st-germain-playtests-r30/st-germain-short-1.json` | Success T8 | Success T9 | Success T9 | 107 / 14 / 56 |
| `output/st-germain-playtests-r30/st-germain-short-2.json` | Failure T10 | Success T4 | Success T7 | 86 / 16 / 29 |
| `output/st-germain-playtests-r30/st-germain-short-5.json` | Success T9 | Success T8 | Failure T10 | 118 / 15 / 36 |
| `output/st-germain-playtests-r30/st-germain-short-6.json` | Success T3 | Failure T10 | Success T8 | 90 / 12 / 41 |

The first two are automated immutable export/replay fixtures. Both preparations of the all-success run also replay separately and verify retained expanded cards, cover, mines, spotting locations, updated removed-team knowledge and replenished support. Removed P/L teams correctly change disposition under §3.9; knowledge is not expected to preserve their obsolete live status. Synthetic focused tests cover reconstitution and fixed defenders; the authentic runs do not yet demonstrate every such optional preparation choice. The combined complete-run release checklist therefore remains open for those additional run variants and the pending source audits.

### Actual browser evidence

Used the real application renderer on a separate QA origin (`127.0.0.1:5177`), with `scripts/stGermainBrowserQA.js` producing replay-derived combat/preparation/terminal cases and an authentic legal artillery call awaiting its battalion choice. The production catalog and accepted companies were not changed.

- Setup: six original Row-4 primary choices, selectable column-six COP/route/CCP, both observer assignments, `2.6 … - OUTPOST` non-patrol location label, reserves, successful actual Start mission and night briefing.
- Map/presentation: twenty-four original cards, concealed B/C question-side labels, readable compact Route/Concentration counters, two-line Combat Outpost and a continuous labelled MLR between Rows 1/2. Six columns fit at 70% zoom; wider map content scrolls inside the map viewport. The existing right panel is retained.
- Recovery: checked Command links and changed zoom survive reload/Resume; next-patrol preparation lists only unused platoons and retains the COP. Begin next patrol and reload restores Patrol 2/platoon 2, new Moon draw, terrain and contacts. Intermediate results offer preparation without terminal company application.
- Combat: actual frozen combat stakes and explicit Resolve control advance the recorded queue; no hidden enemy fields were displayed in the observed interface.
- Support: all three agencies/illumination stocks appear in Mission information. A three-burst WP call restores its pending ordinary/two-adjacent-card choice after reload. `Add both cards` records the decision, removes the pending choice and keeps the command expenditure at 1/4.
- Terminal: final AAR and company application work; reload/Resume followed by repeat application visibly reports `This mission was already applied.`
- Responsive/keyboard: setup Tab navigation, labelled native controls and focusable keyboard-scrolling map checked. At the narrow override the document width equals the viewport (844 CSS px); the panel stacks and map/HQ strips retain their own scrolling. Reset the temporary viewport afterward.

Initial screenshot calls through the wrapper timed out; direct supported tab screenshots succeeded later. Narrow and desktop views were visually inspected, including the 70%-zoom MLR/six-column view. Resume clicks sometimes timed out while the long replay nevertheless completed; fresh DOM observations confirmed completion before further actions. No browser security/permission settings were changed. These checks do not constitute user acceptance.

Remaining release work: finish the counter/breakdown and applicable third-edition/player-aid source audit; fill any uncovered direction/caller/breakdown boundary fixtures identified by that audit; add authentic optional fixed-defender/reconstitution variants. Normal selection and the development opt-in remain gated until those required source checks are complete. No M4 battlefield import or connected M5→M6 progression is implemented.

Final validation: **84 files / 1,167 tests pass** (`npx vitest run --pool=threads --maxWorkers=2 --testTimeout=120000`). Production build passes (100 modules; existing bundle-size warning). Six Company Assault and six KUTF legal-order scripted runs terminate and replay exactly; current outputs are separate in `output/company-playtests-r30/` and `output/keep-up-the-fire-integration-r30-v12/`. Three current Hill 192 runs also pass exact replay, including imported/fresh reattempts. Strict historical compatibility/export and frozen-reader fixtures pass in the full suite. `git diff --check` passes. Initial new complete-run assertions were corrected to check only the intended accepted storage keys and to permit the published removed-team disposition updates; no simulation was changed to satisfy those assertions.

## October 9 completed source audit and development release

Source-audit increment: **M5 content 2 / shared rules 31**. The core detachment increment below advances shared rules to 32. Visual review covered campaign pp.12–15 and 47–48, the supplied front/back counter sheets, third-edition reattempt pages 17–18, support/ammunition pages 58–59 and 64–65, experience page 81, both player aids, enemy activity hierarchy and sequence aid. Rendered audit evidence is under `tmp/pdfs/` (`m5-source-*` and the earlier `hill-audit-*` pages).

| Audited source | Executable evidence |
| --- | --- |
| Campaign pp.12–15; communications/equipment and command aid | `stGermainFoundation`, `stGermainIllumination`, `stGermainSourceAudit`: published strength/experience, eight illumination devices, radios, cross-agency eligibility |
| Campaign pp.32–35 diagram, MSRs, packages and HQ tables | `stGermainFoundation`, `stGermainPackages`, `stGermainEvents`, `stGermainEngine`: all draw slots, objective/route boundaries, six-column setup and hidden contacts |
| Campaign pp.47–48; counter faces; breakdown and weapons aids | `stGermainSourceAudit`: all six FJ breakdowns, both A-squad branches, odd ammunition division, named US/German mortar teams, leader ammunition, depletion/jam/carry limits, Deep Bunker restrictions and +5 cover |
| CSR 6/8; contact and enemy activity procedures | `stGermainSourceAudit`, `stGermainPackages`: infiltration, all eight direction draws, placement endpoints, required leader atomic redraw and all 32 building-cover draw slots; existing enemy-tactics regressions retain Deliberate Defense |
| Third edition §7.16–7.18; support/ammunition aid | `stGermainSourceAudit`, `stGermainIllumination`: every published caller/resource combination, concentration bonus, exhaustion and legal artillery-only battalion choices |
| Third edition §3.9 and §12.3; patrol MSR 1 | `stGermainPreparation`, `stGermainCompleteRuns`: immutable starts, retained terrain/cover/mines/spotting, replenishment, real reconstitution identities, purchased skills and participant eligibility |
| Offensive sequence aid and patrol/map presentation | `stGermainEngine`, complete runs and actual browser checks: explicit stepping and unchanged offensive sequence; no extra failed-patrol reattempt |

The audit corrected M5's FJ counters 5–6 and German mortar-team Fire Team sides to **A/S**, and Bunker/Deep Bunker protection to **+5**. Shared execution reads the authored profile/cover values; accepted scenarios keep their existing values. Rules 31 requires strict rejection of older tactical recovery; original exports remain accessible and untouched. Content-1 M5 records are also rejected. The frozen rules-27 M3 reader remains unchanged; its battlefield-data compatibility list additionally permits current rules 31. Current M4 success and fresh/imported reattempt evidence is separately saved in `output/hill192-playtests-v2-r31/`.

The shared patrol/map/UI audit found no remaining five-column restriction or M3 identity dependency in execution. Row-4 objective boundaries are intentional M5 requirements; expansions are retained across preparations. Mission-specific export filename branches preserve existing standalone names.

### Current authentic complete runs

All files below are in `output/st-germain-playtests-v2-r31/`; older evidence remains intact. Each script checks exact replay, save/reload, atomic terminal persistence, duplicate/stale rejection and redeployment without changing M1–M4 slots.

| Replay | Patrol outcomes and finish turns | Orders / contacts / illumination | Reconstituted formations |
| --- | --- | --- | --- |
| `st-germain-short-2.json` | Success 5 / Success 10 / Success 4 | 77 / 15 / 34 | 0 |
| `st-germain-short-1.json` | Success 4 / Success 6 / Failure 10 | 82 / 12 / 44 | 0 |
| `st-germain-short-1-defenders.json` | Success 5 / Success 7 / Success 4 | 58 / 12 / 16 | 3 |
| `st-germain-short-3-defenders.json` | Success 7 / Success 5 / Success 5 | 75 / 16 / 25 | 1 |
| `st-germain-short-4-defenders.json` | Failure 10 / Failure 10 / Failure 10 | 79 / 10 / 20 | 2 |

Defender variants begin platoon 3 at COP, platoon 2 in reserve and staff/XO/LMG attached to the patrol. Later preparations retain completed platoons in fixed Row-1 defenses, reconstitute actual damaged squads from surviving LATs and redeploy unused platoons. The first defender run purchases General Initiative for the staff. Four saved-run fixtures include exact terminal replay and both defender preparations, retained expanded battlefield and donor step identities.

Release checks: **85 files / 1,280 tests pass**, plus **three development-gate fixtures pass** added afterward. The 112 new source-audit fixtures pass. Production build passes (102 modules; existing bundle-size warning). Six Company Assault and six KUTF scripts pass exact replay in `output/company-playtests-r31/` and `output/keep-up-the-fire-integration-r31-v12/`. `git diff --check` passes.

Actual production opt-in was checked on isolated origin `127.0.0.1:5177`: M5 appears only with `?stGermainDev=1`, setup starts successfully, briefing shows Patrol 1/3 and Moon +2, the six-column battlefield and unused-leader labels render, zoom responds, and the segment control remains explicit. Normal selection was checked separately and excludes M5. Previously documented desktop/narrow and preparation/support/recovery browser checks remain applicable. New screenshot capture timed out twice; this final entry-point check is DOM evidence, not a new visual screenshot claim. Accepted user-origin saves were not touched.

Open `http://127.0.0.1:5176/?stGermainDev=1` on the existing development server (or append `?stGermainDev=1` to another running local app URL), select Normandy 5 and start a fresh mission. **Only explicit-phase user acceptance remains for normal release.** Connected progression, vehicles and default standalone casualty resolution remain deferred.

## Core Detach Team increment — rules 32

The shared command now exposes both Assault and Fire Team choices under third-edition §4.2.3g in all missions, including M5. Eligibility is Good Order 3–4-step squads or two-step weapons teams; two-step squads cannot split. An eligible HQ/staff must originate the command, including during General Initiative. One command, no draw, same position and preserved step identity; both choices share the same per-impulse action allowance. M5 content stays 2 and its release gate is unchanged. Start a fresh rules-32 mission; rules-31 tactical saves remain exportable but cannot resume under the new shared rules.

Current complete-run fixtures use separately generated rules-32 records: three M5 runs (success, mixed result, fixed defenders/reconstitution/skills), and three M4 runs (fresh success and both fresh/imported failure→reattempt→success). All scripts verify exact replay, recovery and isolated persistence. Original rules-31 files remain unchanged. Fourteen focused detachment fixtures and production build pass. The full regression run passed 1,296 tests; its one failure was a missing M4 output file still being generated, not a gameplay mismatch. All four complete M4 fixtures pass on the post-generation rerun, resolving that validation ordering issue: all 1,297 tests are now validated.
