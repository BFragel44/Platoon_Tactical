# Keep Up the Fire implementation status

## Current release: playable human-acceptance build (content 11)

Keep Up the Fire is enabled for the user to perform the complete human playthrough. This is a validation release, not final rules-fidelity acceptance. Rules revision 9 and Company Assault content 4 are unchanged. Older Keep Up the Fire content replays fail strict version checks; historical exports remain intact. Normandy remains gated.

**Approved assumption:** fortification markers have unlimited supply. Printed cover step capacities, facing restrictions and finite enemy unit counters still apply. This is the user-approved interpretation for this build, not a verified physical counter inventory.

Launch: **File → Keep Up the Fire — human acceptance → Start new mission → Start mission with this setup**. Setup validates and records objectives, platoon assignments and equipment before replacing the active mission. Try seed `kut-1` or `kut-2`; export the replay and AAR after testing.

### Critical placement checks completed

- Snipers and spotters can select maximum-distance upper-story/tower positions using occupied elevation, rather than being prematurely excluded by ground-level LOS (mission p.5; rules §§5.2.2B, 8.4.1–8.4.6).
- The actual building-cover draw must support that LOS. A failed distant position falls back to a nearer legal position without repeatedly drawing for the same site. Rejected package trials leave no fortifications behind.
- A tower holds one step; package cover capacity and available enemy counters remain mandatory even with unlimited markers. Hidden placement/cover remains concealed until observed.
- Focused placement regressions, the full regression suite and production build pass. Two public-mission scripted runs reach turn 10 and reconstruct state, RNG and history exactly: `kut-1/support` defeat, 86 orders, 11 casualty steps, 4 contacts left; `kut-2/recovery` defeat, 84 orders, 13 casualty steps, 7 contacts left. These are scripted checks, not human acceptance or balance evidence. The runner now correctly reads objective location IDs.

Browser launch/recovery check passed on isolated localhost port 4173: selected Keep Up the Fire, changed the primary objective to 4.1, confirmed setup, reloaded and resumed with that objective preserved. Mission naming, hidden terrain statistics and objective badges were corrected during this check. No console errors were observed. This was a launch/recovery smoke test, not a full visual mission playthrough; narrow-layout and complete-play acceptance remain open.

### Human acceptance and remaining audit

Please check contact/fortification placement, tower/upper-story visibility, setup choices after reload, support timing, CCP evacuation and final achievement scoring during the complete playthrough. Remaining detailed rules audits below are retained explicitly; enabling this validation build does not certify every event, breakdown or fortification-response branch. Campaigns, Normandy, concealed PCs and event-driven expansion remain deferred.

## Historical readiness record (content 10 and earlier)

The following entries describe prior gated builds. Their gate statements and old counts are historical; the current release above supersedes them.

## Available now

- File contains a mission selector, explicit unavailable reasons and **Preview setup** for Keep Up the Fire. Preview does not replace the current mission or save. It supports tactical-control choices, staging placement, platoon attachments and asset allocation, with validation. Choices are transient while the mission remains unavailable.
- A local 55-card Normandy dataset records sheet/row/column provenance, asymmetric directional borders, protection, cover potential, burst modifiers and building flags. The three supplied sheets were visually inspected. In particular, several hedgerows have only one white side, and one Orchard has cover potential one.
- Seeded terrain setup, a three-platoon/25-formation roster, equipment allocation and setup validation live outside the course definition. Mission creation accepts a third `setup` argument; setup is part of strict replay and recovery records.
- Terrain knowledge is separate from enemy spotting. The setup projection conceals card identity, terrain statistics and borders until revealed. Staging revelation uses a separate geometric calculation; staging combat/spotting LOS stays prohibited.
- Mission-specific data contains the published A/B/C draw counts, nine package descriptions, package tables, support agencies, objective choices and simplified communication exceptions.
- Internal development hooks exist for mission contacts, HQ events, mines, snipers, spotters, building-cover discovery, support requests, CCP evacuation and achievements. These are **partial implementation**, not a claim of published-mission fidelity. Tests explicitly use an internal development fixture to exercise selected branches without making the published mission startable.

## Required before enabling the mission

1. **Contact placement and pool accounting.** Implemented and tested: front-only straight rays, directional redraws, existing enemy/PDF exclusions, source-versus-observer LOS, original counter reuse while LATs survive, atomic multi-unit placement, and discarding a PC when no package is legal. Maneuvering packages wait until cleanup to open fire. HMG placement now uses grazing/overhead exceptions, permitting fire through opposing troops and over eligible lower friendly troops. Still required: verify fortification quantities and certify building/upper-story placement, including the ordering of cover discovery and maximum-distance placement. Ordinary enemy-placement map expansion (§8.4.5) is implemented in development content v10: seeded terrain draws, hill stacking, original friendly boundaries and expanded-map positioning. Integrated visual/placement acceptance remains required. Concealed `?` PCs and event-driven expansion remain separate future features.
2. **Buildings and fire.** Implemented: occupied upper-story/tower elevation for reciprocal unit LOS, spotting modifiers, support/order eligibility, safe projections and terrain revelation; cover capacity for player movement and automatic cover entry; bunker/pillbox arcs, no point-blank fire, and enemy Shift Fire redraws. Tripod grazing fire projects one source onto each eligible card, stops at smoke or slope reversal, and omits overflown cards; it does not manufacture crossfire. Fixtures cover ammunition/exposure loss of capability and hidden-source explanations. Still required: validate delayed hill draws and terrain-revelation order against the worked setup example, fortified grenade-response details, and integrated building/placement acceptance. Course regression outcomes remain unchanged.
3. **Formation capabilities and assets.** One-step mortar temporary PDFs are implemented and tested: misses retain the direction for crossfire without basic VOF; cleanup removes it. Mortars can fire over friendly troops but cannot fire through spotted opponents, exposed, from woods or at point blank. Offensive WP is implemented: same-card targeted grenade order, one-use asset, normal grenade draw/response, printed −4 combat value, screening on hit or miss, and preservation of stronger HC screening. WP and ordinary grenades share an attempt allowance. Breakdown regressions now cover U.S. named HQ/staff/observer/weapon Fire Team transitions and both Grenadier final-step fire ratings. Carried equipment and casualties transfer to the final surviving LAT; equipment drops for recovery when every step becomes a casualty. Still required: complete enemy named-counter breakdown certification, remaining rifle-grenade restrictions, integrated transport acceptance and enemy named-counter asset behavior. Infantry asset/casualty capacity, free unloading, pickup-area restrictions and event-driven MG ammunition depletion/resupply now have focused fixtures. Verify HQ replacement precedence with the XO present. No generic rifle-squad substitutions are allowed.
4. **Events and scoring.** All event-table entries and turn-band boundaries are checked against p.8. Focused fixtures cover command obligations, outage expiry, rallied-enemy activity exclusion and surrender without guards. Position scoring now occurs at mission end; prisoner/enemy-casualty steps score once, and an empty card does not capture casualties by itself. Abort cannot earn an unfinished full-turn hold obligation. Still required: complete effects/asset-drop tests for every event branch, certify fortification credit and CCP transport/unload eligibility, and integrated scoring acceptance.
5. **Support and information safety.** Implemented/tested: caller-specific fire-direction networks, cross-agency draw allowances, HE versus WP target eligibility, experience/registration modifiers, short-round precedence and self-target displacement, pending/active/expiry timing, WP screening, and enemy spotter follow-up/removal. Enemy mortar registration is shared by package type rather than stored independently on each spotter. Visible support records identify mortar/artillery and HE/WP without exposing hidden source IDs. Still required: complete sniper movement/hidden-causality audit, mission-specific objective/AAR presentation, setup confirmation into a live mission and integrated support acceptance.
6. **Acceptance.** Complete focused fixtures and full deterministic Keep Up the Fire runs, browser-test the complete mission, then obtain a human playthrough. Only afterward begin Normandy Mission 1 implementation. Six internal scripted Keep Up the Fire runs now reach mission end and strictly replay; complete human/browser acceptance remains outstanding.

## Source-to-mechanic checklist

| Source | Use | Status |
| --- | --- | --- |
| Keep Up the Fire pp. 4–7 | Force, setup, simplified communications, assets, support | Data transcribed; setup preview and selected hooks tested |
| Keep Up the Fire p. 8 | Both higher-HQ tables | All table entries tested; selected effects/durations tested; remaining effects outstanding |
| Keep Up the Fire p. 9; rules pp. 63–64 | Packages, placement and redraw | Core placement/pool fixtures pass; tripod and fortification exceptions outstanding |
| Keep Up the Fire p. 24 | U.S./Grenadier breakdowns | Partially represented; complete regression matrix outstanding |
| Third-edition §§1.2.6, 2.2–2.5, 5.1.7 | Cleared/secured, terrain setup, CCP | Separate status/setup implemented; final scoring/evacuation acceptance outstanding |
| Third-edition §§5.2–5.4, 7.2–7.3 | Buildings, terrain, HMG/mortar fire | Building elevation/capacity and tripod fire implemented with fixtures; setup/placement integration and mortar extensions outstanding |
| Third-edition §§7.9, 7.15–7.18, 8.7–8.11 | Mines, snipers, spotters, support/ammunition | Development hooks only |

Local sources are in `reference/`. Terrain sources are `reference/terrain_cards/FoF_Normandy_Terrain_Cards_1.png` through `_3.png`.

The supplied counter sheets are the Deluxe **update kit**, not the whole original counter set. Additional verification used the publisher's [Deluxe Counter Update Guide](https://gmtwebsiteassets.s3.us-west-2.amazonaws.com/FoF_Deluxe/FoF_Deluxe_Update_Kit_Counter_Guide_1016.pdf), p. 5, and the [official GMT VASSAL module](https://vassalengine.org/library/projects/Fields_of_Fire), version 5.0.2 (publisher-linked). The module was inspected as data only; it was not installed or executed. Its German images identify five LMGs, four HMGs, three snipers and three mortar spotters. HMGs are one-step Automatic VOF/tripod/Very Long range; snipers are Long range. Fortification marker supply is now unlimited by user-approved assumption; finite enemy unit counter limits remain enforced. These sources are not bundled into the game.

## Validation, updated September 25, 2026

- 289 automated tests passed using `vitest run --pool=threads`; production build passed.
- Resumption check corrected contact inspection to use the same seeded queue as resolution. A regression verifies the previewed card resolves next, the following card is shown correctly, and inspection does not mutate state or draw cards.
- New tests cover readiness gates, 55-card identity/border samples, published force size, deterministic setup, strict replay/recovery with setup choices, setup rejection, hidden terrain projection, staging separation, mission communications, cleared/secured distinction, contact order and PC C draws, selected mine/support branches, turn-one event exclusion, duplicate-score protection and revision rejection.
- Six Company Assault scripted runs reconstruct exactly. All retain revision-8 summaries and end in defeat at turn 10: company-1 direct/support/recovery = 40/8/6, 28/6/5, 31/4/6; company-2 = 40/8/5, 80/6/1, 57/8/5 (orders/casualty steps/contacts left). These are regression policies, not human playtests.
- Production browser checked on isolated `127.0.0.1:4173`, preserving the user's `localhost:5173` save: mission selector, disabled mission start, preview, hidden terrain, invalid duplicate objectives, corrected setup, desktop screenshot, Escape and console errors. Narrow viewport DOM bounds showed no internal horizontal overflow. Narrow screenshot timed out, so narrow visual sign-off remains open.

Remaining work above is substantive implementation, not just final human acceptance.

### Content v3 continuation

Added building/fortification and tripod suites, including reciprocal upper-story LOS, no hidden-unit elevation leakage, elevated terrain revelation, tower capacity, rifle-grenade building restrictions, grazing/overhead fire, slope/smoke limits, HMG placement exceptions and anonymous-source explanations. Both seeds and all three Company Assault policies were rerun; summaries and exact replay reconstruction remain unchanged. No new complete mission or browser playthrough occurred in this continuation. The release gate stays closed until the remaining systems and integrated validation are finished.

### Content v4 continuation, September 25

Support and offensive-WP fixtures now cover the corrections listed in items 3 and 5. Authority: mission pp.4,7; rulebook §§4.4.3, 7.16.1–7.16.5 and 8.10. The publisher module's `Marker - WP.png` was inspected as reference data to verify −4 attack / +1 screening; no new artwork was imported. All six Company Assault policies retain the prior results and exact replay reconstruction. Browser/human validation of the new orders and the complete standalone mission remains outstanding.

### Content v5 continuation, September 25

One-step mortar direct-lay orders now place a temporary PDF on success or failure (rulebook §§7.3.1–7.3.2). It contributes to crossfire but never supplies basic VOF; the normal grenade marker supplies any attack effect. Same-card sources respect its established direction. Cleanup removes the PDF, and movement off the firing card cancels it. Projection and inspection distinguish this direction from sustained fire and movement warnings exclude PDF-only relationships. Ranged grenade eligibility checks intervening formations, including the mortar exception for friendly troops. Named weapon Fire Team sides use their current side for building restrictions. Five focused regressions pass; full suite: 246 tests across 29 files, production build passed. Complete weapon-breakdown certification and integrated mission acceptance remain open.

All six Company Assault policy runs were repeated for content v5; each replay reconstructed exactly and retained the previously recorded outcome, orders, casualty steps and remaining contacts. No browser or human acceptance run was performed for this increment.

### Content v6 continuation, September 25

Verified rulebook §5.1.6E (p.33) and §§6.4.3–6.5.1 (pp.47–48): a breakdown transfers carried items to the final non-casualty step; total casualty loss drops assets and transported casualties. Corrected Keep Up the Fire's previous equipment deletion and premature dropping from surviving breakdown teams. Existing course behavior is unchanged. The content-version bump rejects older development replays rather than changing their results silently.

Eighteen new checks cover mixed F/C/P/L outcomes, total casualties, surviving original squads, hidden enemy losses, Grenadier S/A final-step profiles, and named U.S. HQ/staff/observer/weapon transitions. Full suite: 264 tests across 30 files; production build passed. Current work does not certify all transport rules: carrying capacity, voluntary drop operations and pickup-area eligibility remain outstanding. No new browser or complete mission playthrough was performed; standalone readiness remains false.


### Content v7 continuation, September 25

Implemented mission transport capacity under §5.1.6A–B: six assets (including radios) and one casualty per step. An overloaded unit cannot move to another card or area; pinned/paralyzed withdrawal still drops its load first. Equipment pickup requires a friendly item in the same card area and sufficient capacity. Ground items retain cover when dropped by withdrawal or combat.

**Drop all carried items (free)** and mission casualty unloading work without commands, including outside an impulse, without exposure or RNG use. These operations are recorded for replay and do not refresh frozen combat/fire data. Partial equipment selection is not offered: the player can unload the whole load and recover items individually. Asset quantities stored as a bundle are recovered together. Tracked ammunition transport remains outside this mission's unrestricted-ammunition scope.

Verified mission p.8 ammunition events with behavioral tests: friendly/enemy MG capability decreases when Out of Ammo and restores on the next toggle; affected enemies skip their activity check. Source: rulebook §7.18.2. Full suite: 274 tests across 32 files; production build passed. Readiness remains false pending the building/contact, special-enemy, scoring/setup and integrated acceptance items above. No full mission or browser acceptance claimed.

The same continuation corrected sniper card selection (§6.1.1, p.39): unengaged snipers prioritize command cards by range, otherwise strongest projected fire then steps, with seeded random ties. Existing fire remains persistent. Four fixtures verify these priorities, deterministic ties, exposed individual targeting and suppression of the special shot while pinned (§7.15, p.57). The course contains no snipers. All six course policy runs completed exact replay reconstruction with unchanged summaries after transport changes. Final build and 274 tests pass. Sniper fallback and full hidden-causality integration still require acceptance.

### Content v8 continuation, September 25

Added **Seek cover — enter upper story if found** for eligible multi-story terrain (§5.2.2B, pp.35–36). It shares the ordinary seek-cover attempt allowance and command cost, preserves exposure, and occupies ordinary cover if the discovery roll produces no building. Church-tower selection rejects formations above one step before spending commands or drawing. Cover-attempt events identify the occupied cover and upper-story choice.

Corrected a confirmed grenade defect (§7.10.2, p.55): simultaneous grenade values against the same formation/cover now add before strongest-fire selection. Mines and sniper effects remain separate; smoke does not protect against grenade effects, and a critical grenade still negates occupied cover. This change is limited to Keep Up the Fire development content; Company Assault behavior remains unchanged.

Six new regressions cover direct upper-story occupation, ordinary-cover fallback, tower capacity/shared attempt allowance, cumulative grenades, critical cover loss and smoke exclusion. Full suite: 280 tests across 33 files; production build passed. Building/contact placement ordering, fortification quantities, fortification response integration and complete mission acceptance remain open. No browser or full mission playthrough was performed in this continuation; readiness remains false.

### Content v9: contact/fortification integration, September 25

- Corrected §8.4.4: newly opened enemy fire removes intervening same-elevation PCs without evaluating them. Lower PCs and PCs beyond the affected card remain. Removal events omit hidden source identities.
- Corrected §8.4.3: bunker/pillbox packages can occupy a U.S.-occupied placement card because their occupants cannot fire point blank. Ordinary weapon placements still cannot. Intervening enemy troops and PDFs remain exclusions.
- Revalidate firing eligibility after the mission's building substitution roll (mission p.5). A building replacing a bunker loses the point-blank exception, so an invalid full package is rejected atomically.
- Added `scripts/keepUpTheFirePlaytest.js`: two seeds and direct/support/recovery policies use player projections, run to a terminal outcome, export versioned records and require exact state replay. This is an internal fixture, not a bypass in the public selector.

The initial content-v8 integration baseline completed all six runs at turn 10: kut-1 direct/support/recovery = DEFEAT/DEFEAT/SUCCESS with 100/124/116 orders; kut-2 = DEFEAT/DEFEAT/DEFEAT with 94/66/84 orders. These outcomes do not establish fidelity: fixed-map placement can discard packages incorrectly. Raw baseline files remain in ignored `output/keep-up-the-fire-integration`; corrected runs use content-versioned output directories.

**Remaining placement blockers, in execution order:** implement terrain-deck expansion for maximum-distance placement (§8.4.5), including boundary-safe friendly movement; certify hill/upper-story discovery versus maximum-distance search; verify physical fortification counter quantities and enforce exhaustion; run package-by-package integration and full mission/browser acceptance. The old checklist understated ordinary map expansion. Do not ungate while these rules are absent.

Corrected content-v9 integration: all six runs reach turn-10 defeat and reconstruct exactly. Orders/casualty steps/contacts remaining: kut-1 direct 100/12/5, support 124/10/0, recovery 100/17/4; kut-2 direct 103/11/1, support 66/12/6, recovery 84/13/7. Compared with the initial baseline, several outcomes/counts change from legal placement and PC-removal corrections. No probabilities or force composition were tuned. Validation: 284 tests pass and production build passes. Human/browser acceptance remains open.

### Content v10: contact-map expansion, September 25

Implemented `missionExpansion.js` and integrated it with contact feasibility/placement (§8.4.5). Feasibility operates on private state copies; actual direction draws expand the corresponding ray toward maximum range. New terrain uses the remaining seeded Normandy deck, stacks hills, has no new PC and remains outside the original mission movement boundary. Rejected packages retain terrain already drawn. Incomplete hill stacks roll back on deck exhaustion. Enemy fallback uses the original mission edge rather than the expanded map's furthest row.

The map renderer positions expanded terrain by row/column, including negative/zero columns, without changing the normal course layout. Friendly movement into expanded cards is rejected with a boundary explanation. The public readiness gate remains closed; this is implementation progress rather than full acceptance.

Four fixtures cover deterministic expansion/hills, deck exhaustion, read-only feasibility followed by off-map placement, and friendly boundary restrictions. The previous invalid-direction fixture now explicitly disables expansion. Full suite: 289 tests; build passed. Still outstanding: browser inspection of an expanded mission, hill/upper-story maximum-distance placement certification, physical fortification limits and the other release checks above.

Content-v10 integration finished: all six runs reach turn-10 defeat and reproduce exact state/history under strict replay. Orders/casualty steps/contacts remaining: kut-1 direct 83/14/5, support 96/12/4, recovery 75/14/3; kut-2 direct 109/9/2, support 68/11/6, recovery 84/13/7. Changes from v9 are recorded without balance tuning. A fifth regression ensures expansion cannot extend Higher HQ advance obligations beyond the original last row. Final validation: 289 tests and production build pass. Expanded-map browser acceptance remains unperformed.
