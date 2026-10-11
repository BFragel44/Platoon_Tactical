# Normandy 6: Vire Offensive

Status, October 11, 2026: the user accepted the M6 explicit-phase playtest after the vehicle UI refinements and boundary correction. Further vehicle usability/presentation work is deferred to the next project phase and recorded in `docs/FOR_LATER.md`; it is not an outstanding M6 player-acceptance requirement. Current vehicle adapter is 15, base rules 33, content 1. The development URL remains `?vireDev=1`; normal catalog/recovery integration is still separate from this recorded acceptance. Connected campaign progression remains deferred. Earlier dated evidence below is retained as history.

## Authority and source audit

Primary source: `reference/FoF_Deluxe_Normandy_Campaign.pdf`, printed pp.36–40, July 26 to August 7, 1944. All five pages were extracted, rendered and visually inspected October 9, including the map, attachments, support, both HQ-event tables, contact distributions, package branches and both MSRs. General campaign instructions pp.12–15, counter/breakdown charts pp.47–48, supplied third-edition rules and player aids remain the procedural authorities.

Mission and applicable vehicle/procedure source review are complete for the development candidate. The audit includes third-edition §§10.1–10.8, especially §10.8.3, Normandy CSR 7 and the Vehicle and Anti-Tank Weapons Chart as required dependencies. The final source-to-fixture matrix records visual verification and execution coverage. Earlier dated sections retain their historical pending-work statements.

| Source | Published requirement | Implementation / validation gate |

| --- | --- | --- |

| p.36; p.37 diagram | Offensive, ten turns, Daylight +0; four columns × five rows, staging below Row 1 | Fresh twenty-card map; offensive sequence and explicit stepping |

| p.36 | Secure two selectable Row-5 objectives and clear Rows 1–3 | Row 4 is not a clearing requirement; test original-card boundaries |

| p.36 | Row-4 attack position adjacent to either objective | Validate distinct objectives and legal adjacency |

| pp.36–37 | Rows 1–2 C, Row 3 B, Rows 4–5 question-side A/B | Eight C, four B, eight concealed A/B contacts; audit distribution procedure and reveal timing |

| p.36 | Line Delay Defense; six random Fallschirmjäger squad counters | Implement Delay Defense rather than falling through to Deliberate Defense |

| p.38 | Both observers, two one-step HMGs, five Shermans, three-step engineers | Published attachment profiles, stable identities, ammo and command networks |

| p.38; p.39 | Five M5 tanks as a Tank Support event | Pending player-selected Row-1 entry, finite stock and replayable resolution |

| p.38 | M4 and M5 platoons susceptible to AT ambush | §10.8.3 infantry support, range, pin and modifier fixtures |

| p.38 | Seven support entries, including TOT and artillery battalion missions | Agency-specific stock, caller draws and existing explicit battalion choice |

| p.39 | Friendly and enemy early/late events | All forty draw slots; Turn-1 exclusion and Turn-7 switch |

| p.40 | Twelve packages, regular tables and alternate PC-A draws | Every branch, placement, spotting state and finite-counter redraw |

| p.40 MSR 1 | Counterattack on qualifying occupied cards, three inclusive turns | Row 5 condition; alternate table; restore Delay Defense; retain offensive sequence |

| p.40 MSR 2 | Tanks → Jeeps → AT guns / AT-capable infantry | Finish each group before proceeding; Reaction Fire remains possible at any time |

| p.40; CSR 7 | Active AT equipment, one Panzerfaust per squad, one rifle grenade per leader | No inherited inactive-AT policy from earlier infantry candidates |

| p.36; third edition §3.9 | One permitted reattempt | Exact transition, prescribed replenishment and retained battlefield state |

## Scope and battlefield policy

Vire is the first mission in this implementation that requires a functioning vehicle system. The five Shermans are published starting attachments, not an optional cosmetic feature. Do not release an infantry-only substitute as complete Vire, omit Tank Support, disable Panzerfausts, or treat §3.6 as an empty segment. A partial infantry foundation may remain explicitly gated while vehicle work proceeds.

M6 has no Scouted Terrain instruction or M5-map handoff. It uses a fresh four-by-five battlefield, not M5's six-by-four patrol map. Preserve M5 terrain, cover, mines, patrol history and purchased skills in its existing records; do not consume or modify that company to start standalone Vire. Future connected progression may carry eligible company identities and dispositions after a separate implementation, but must not invent battlefield carryover.

Use a fresh immutable standalone company snapshot based on the existing published US baseline plus Vire's attachments. This is a testing baseline, not a claim about the historical company's post-M5 strength. Give M6 its own company identity, roster/debrief slot and export filenames. Keep campaign storage independent of tactical recovery. Connected progression, between-mission replacements/promotions, later missions and 3D/audio presentation remain outside this checklist.

## Mission content

### Setup, objectives and enemy posture

- [x] Visually verify the four-column, five-row map and staging diagram.

- [x] Author Vire content version 1 separately from execution.

- [x] Validate two distinct Row-5 objectives, adjacent Row-4 attack position, LOD below Row 1, LOA above Row 5 and boundaries outside Columns 1/4. Materialization/setup fixtures, diagram audit and live browser setup checks passed.

- [x] Author C/C/B/question-side A–B/question-side A–B contact rows; verify the general campaign selection procedure for A/B rather than inventing a distribution.

- [x] Conceal question-side letters in map, tooltips, queues and diagnostics until evaluation begins; retain actual internal letters and resolution order.

- [x] Require both objectives secured and all original Row-1–3 cards cleared. Test enemies in Row 4, expanded cards and unsecured objectives independently.

- [x] Author Line experience and Delay Defense. Test every applicable hierarchy case, every random outcome, LAT/pinned priority and special sniper/spotter/leader behavior against the player aid.

- [x] Preserve accepted six-counter FJ selection, printed A/A–S breakdowns, two-step A draw and ammunition division; validate Vire's ammunition and equipment overrides.

- [x] Retain existing setup assignments, radios, phones, signals, runners, phase lines and equipment controls where legal; add vehicle-specific setup and eligibility without changing the accepted right-panel layout.

### Attachments

| Attachment | Parent | Experience / strength | Initial resource |

| --- | --- | --- | --- |

| Artillery FO | 15th Field Artillery Battalion | Line, one step | SCR610 artillery FD radio; optional mounting in Arty Jeep under CSR 1 |

| Mortar FO | Battalion 81mm Mortar Platoon | Line, one step | SCR300 mortar FD radio |

| 1/1 HMG and 2/1 HMG | Battalion HMG Platoon | Line, one step each | Six ammo each |

| M4 Sherman platoon | 741st Tank Battalion | Line, five vehicles including Tank HQ | Five ammo per tank |

| Engineer squad | 2nd Engineer Combat Battalion | Line, three steps | CSR 10 mine procedures |

| M5 platoon, event only | 2nd Infantry Division Recon Battalion | Line, five vehicles including Tank HQ | Five ammo per tank |

- [x] Visually audit WWII vehicle profiles, crew steps, capacities, counter sides and baseline Jeep/transport entitlement under CSR 1; do not infer an extra attachment solely from the optional radio-mounting note.

- [x] Engineers are available at setup, independent of prior mission mine discoveries. Preserve two/three-step mine-detection and path-clearing eligibility.

- [x] Tank HQs have explicit command roles and platoon networks. Audit WWII BN-net communication, CO activation, initiative and permitted vehicle orders; voice contact alone must not grant prohibited orders.

### Fire support

Caller draws below are artillery FO / mortar FO / CO HQ. Values are combat modifiers.

| Agency | Ammo | Modifier | Draws | Missions |

| --- | --- | --- | --- | --- |

| 15th Field Artillery Battalion | HE | −5 | 3 / 2 / 2 | 4 |

| 15th Field Artillery Battalion | WP | −4 | 3 / 2 / 2 | 1 |

| 15th Field Artillery Battalion | TOT | −7 | 3 / 2 / 1 | 1 |

| Battalion Mortar Platoon | HE | −3 | 2 / 3 / 2 | 3 |

| Battalion Mortar Platoon | WP | −3 | 2 / 3 / 2 | 1 |

| Regimental Cannon Company | HE | −4 | 3 / 3 / 2 | 3 |

| Regimental Cannon Company | WP | −4 | 3 / 3 / 2 | 1 |

- [x] Preserve registered-target, cross-agency communication and battalion-fire procedures; persist ordinary-vs-adjacent-card choices without another command/draw.

- [x] Verify TOT caller differences, exhaustion, agency-displacement events and reattempt resources. Do not import M5 illumination stock into daylight Vire.

### Contact tables and packages

Each list maps R#1–10 in order; a dash in the printed table is not an available draw.

| Table | Packages by draw |

| --- | --- |

| Regular A | 4, 4, 5, 7, 8, 9, 9, 10, 11, 11 |

| Regular B | 1, 2, 2, 3, 3, 4, 4, 7, 8, 8 |

| Regular C | 1, 1, 1, 2, 2, 3, 4, 4, 4, 6 |

| Counterattack A | 2, 2, 2, 10, 10, 10, 10, 12, 12, 12 |

Directional R#8 placement: 1–4 Front, 5–6 Left Front, 7–8 Right Front.

| # | Package / branches | Fire at placement / spotted | Placement |

| --- | --- | --- | --- |

| 1 | Mines; R#9: 1–3 no extra unit, 4–6 HMG in Foxholes, 7–9 Sniper in Basic +1 | Yes / No | Mines on triggering card; added weapon max LOS/range |

| 2 | Artillery Incoming −4 without spotter, or mortar Incoming −3 with spotter in Foxholes | Yes / No | Incoming on trigger; spotter max LOS |

| 3 | Sniper, Basic +1 | Yes / No | Max LOS/range |

| 4 | LMG, four ammo, Foxholes | Yes / No | R#1–2/10 point blank; 3–10 max LOS/range |

| 5 | HMG, six ammo, Foxholes | Yes / Yes | Max LOS/range |

| 6 | Exposed squad out of cover | No / Yes | Max LOS |

| 7 | 81mm mortar team, three ammo, Foxholes | Yes / No | Max LOS/range |

| 8 | Panzerschreck or 75mm PAK40, four ammo, Foxholes | Yes / No | Max LOS/range |

| 9 | Squad in Foxholes / squad plus optional available leader in Foxholes | Yes / No | R#1–2/10 both Close; 3–10 both max LOS/range |

| 10 | Squad infiltration under CSR 6 | No / Yes | Max LOS |

| 11 | 75mm infantry gun or 88mm FLAK36, four ammo, Foxholes | Yes / Yes | Max LOS/range |

| 12 | LMG out of cover, four ammo | Yes / Yes | Max LOS/range; counterattack table only |

- [x] Validate every profile and branch before execution; reject unsupported vehicle/AT profiles rather than substituting infantry behavior.

- [x] Visually audit counter stock and general alternative-draw rules; redraw unplaceable packages under §8.3. Package 1 leaves added-HMG ammo unspecified; use the same mission HMG counter baseline (MG6, explicitly printed for package 5), with the inference disclosed in the final audit below.

- [x] Mortar spotters have two missions; second caller draws three cards. Verify first-call procedure, replenishment and exhaustion against general rules.

- [x] A-rated squads have four MG ammo; each squad has one vehicle-only Panzerfaust. Leaders have one rifle grenade. Test depletion, inheritance and no duplicate asset creation.

- [x] Apply Normandy cover substitution, sniper/spotter upper-story exceptions, woods mortar prohibition and infiltration exposure rules.

## HQ events and special mission rules

These lists map R#1–10; use Turns 2–6 / Turns 7–10 respectively.

| Side / period | Event slots |

| --- | --- |

| Friendly early | SITREP, SITREP, COMM, TANK_SUPPORT, VISITOR, HOLD, ADVANCE, ADVANCE_PC, NO_CANNON, NO_MORTAR |

| Friendly late | SITREP, COMM, TANK_SUPPORT, VISITOR, HOLD, ADVANCE, ADVANCE_PC, NO_CANNON, NO_MORTAR, RESUPPLY |

| Enemy early | EVAC, DISPLACE_MORTAR, DISPLACE_LEADER, DISPLACE_HMG, RALLY, RALLY, FALL_BACK, FALL_BACK, COUNTER_ATTACK, COUNTER_ATTACK |

| Enemy late | EVAC, EVAC, DISPLACE_MORTAR, DISPLACE_LEADER, DISPLACE_HMG, RALLY, RALLY, FALL_BACK, FALL_BACK, COUNTER_ATTACK |

- [x] SITREP spends first three CO commands; COMM blocks BN activation and spends first two CO commands. Visitor lasts two turns. HOLD/ADVANCE/ADVANCE_PC reference the current lead US row and the printed exceptions.

- [x] Award one XP for completed starred obligations that turn, without invented penalties for insufficient commands.

- [x] Tank Support offers legal Row-1 card choices for all five M5s with five ammo each. Audit repeated event draws and unavailable counters against general event-unit rules; do not duplicate tanks or silently turn the result into another event.

- [x] RESUPPLY places four of one chosen ammo type on a chosen Row-1 card. Persist eligible type/location choices and pending UI.

- [x] Enemy removal requires no US troops on the card; rally/fallback use their printed eligibility. Explain public procedure without revealing hidden affected units or positions.

- [x] MSR 1 places question-side PC A on US-occupied cards adjacent to an unrevealed PC or on Row 5. Audit contact-marker availability, exhaustion and multiple contacts per card.

- [x] Switch to Offensive Assault for the triggering turn and the next two; restore Delay Defense at the following turn start. A Turn-3 trigger lasts through Turn 5 and ends at Turn 6 start. Use alternate A packages without changing phase sequence.

- [x] MSR 2 is an ordered vehicle/AT group sequence, not a new infantry phase order: tanks, then jeeps, then AT guns and AT-capable infantry; complete each group first, retaining legal reaction opportunities throughout. Audit within-group side alternation against §10.5.1.

## Vehicle and AT execution gate

Accepted infantry execution skips §3.6 because it has no vehicle targets. The experimental vehicle phase bridge and shared Delay Defense executor are now implemented (see October 10 evidence below); materialized Vire setup and controlled combat-bearing mission/reattempt validation are complete; unrestricted acceptance remains with the user.

- [x] Visually audit third-edition §§10.1–10.8 and Vehicle/AT player-aid profiles, action sequence, attack modifiers and result tables; relevant command-menu entries and Normandy CSR 1/7. Map each implemented rule to a focused fixture.

- [x] Model vehicle identity, crew, platoon HQ, ammunition, passengers/cargo, activation and moved/fired state distinctly from infantry steps. Preserve crew/casualty dispositions without invented deaths.

- [x] Implement Command-phase activation and restricted vehicle orders; action menus for movement, AT fire, concentration and spotting; enforce pinned-unit restrictions and one-action limits.

- [x] Execute VOF checks, movement and terrain restrictions, legal transport/embark/disembark, reaction fire and Quick Shot timing with deterministic draw records. Avoid recursive reaction loops or duplicate ammunition charges.

- [x] Resolve vehicle AT outcomes using actual AT card values and the published result table. Existing infantry NCM resolution remains unchanged; do not turn this into the deferred global combat-resolution redesign.

- [x] Implement M4/M5 ambush susceptibility: point-blank/close AT gun or rocket attacks without same-card Good Order friendly infantry; pinned and unpinned extra-draw/modifier boundaries under §10.8.3.

- [x] Apply CSR 7 automatic AT activation for PAK40, FLAK88 and Panzerschreck; conditional same-card activation for Panzerfaust squads and infantry guns; retain reaction eligibility. Random target selection is repeated per eligible shot.

- [x] Keep PAK40 close-range small-arms fire distinct from its ranged AT gun. Preserve infantry-gun ranged grenade behavior and share ammunition correctly between infantry and AT attacks.

- [x] Test tank-rider vulnerability, crew/passenger evacuation, mines, incoming fire, ammunition depletion, immobile guns and cleanup reset. Clearly show active unit, group, legal targets and pending reactions without revealing unspotted enemies.

## Persistence, reattempt and interfaces

- [x] Allocate an isolated M6 roster slot, immutable deployment snapshot, unique run/attempt identities, setup seed and content/rules versions in replay exports. October 10 live integration fixtures cover named vehicle crew as well as infantry.

- [x] Extend replay operations for vehicle activation/actions, transport, reaction/Quick Shot decisions and Tank Support entry choices. Persist every pending choice and resume without repeated draws or resource spending. Adapter reaction fixtures plus live entry/recovery and combat-bearing complete runs are recorded below.

- [x] Audit complete §3.9 vehicle/crew/attachment handling before authoring reattempt replenishment. Preserve required terrain, discovered cover, mines, contacts, spotting and unique location rewards; reset only prescribed resources.

- [x] Restore Delay Defense after preparation; allow one reattempt after failure; retain local reconstitution/XP validation and immutable starting records for both attempts. October 10 exact two-attempt replay fixture; remaining source/transport audits are separate gates.

- [x] Reject active, duplicate and stale debrief transactions; persist roster and applied-debrief record atomically. Cover storage failure and reload/redeployment including vehicle/crew identities.

- [x] Preserve strict incompatible-record rejection and original export access for rules 33 and older. Do not rewrite M1–M5 records to a new rules label. Adapter-14 recovery rejects earlier experimental formats and preserves the original JSON for export.

- [x] Extend briefing/Mission-menu SMRs, support availability, event explanations and public grenade/AT source-target clarity. Preserve explicit phase stepping and accepted right-panel layout.

- [x] Recalculate LOS, radio links and transport-dependent command eligibility after movement, losses, equipment mounting and reload.

## Validation and release gates

- [x] Review mission pp.36–40 visually and transcribe mission-specific tables.

- [x] Complete visual procedural/counter audits and resolve recorded source uncertainties before declaring content complete.

- [x] Add focused deterministic fixtures for every contact branch/placement draw, all HQ slots, Delay Defense, concealment, support callers, counter limits, objective boundaries, engineers and counterattack expiry.

- [x] Cover the complete vehicle/AT gate above, including group sequencing interrupted by reaction fire and pending-choice recovery.

- [x] Complete deterministic successful Vire runs and failed first attempt → preparation → second-attempt success, including tanks and AT combat rather than bypassing them.

- [x] Verify exact replay across both attempts, save/reload at pending reactions/entries/support choices and duplicate-debrief rejection.

- [x] Run existing regressions, production build, Company Assault/KUTF scripted checks and accepted M1–M5 historical-reader expectations without modifying accepted exports.

- [x] Browser-check setup, five-row map, vehicle/crew/cargo inspection, both observers, all support agencies, explicit AT stepping, keyboard access, narrow layouts and recovery. Record screenshot limitations separately from functional evidence.

- [x] Provide an explicit development opt-in only after the candidate is meaningfully playable; keep normal M6 selection gated.

- [x] Obtain the user's explicit-phase acceptance before enabling normal M6 selection. Keep normal Mission 7 selection and connected progression unavailable; gated M7 development may proceed.

## Implementation order

1. Author gated Vire content and validate source tables, map/setup and all required profiles; implement and test Delay Defense.

2. Add the smallest complete WWII vehicle/AT foundation required by Vire, preserving infantry behavior and historical execution readers.

3. Integrate Shermans, optional Jeep/radio mounting, AT packages and M5 event choices; audit both MSRs in real execution.

4. Add isolated roster/debrief persistence and vehicle-aware reattempt transitions, then complete deterministic runs and exact replay/recovery.

5. Perform browser checks, deliver the explicit development candidate and collect user acceptance before normal selection.

This planning change does not alter execution, mission selection, rules versions or existing saves. Existing uncommitted M5 acceptance/presentation work is preserved.

## October 9 authored foundation

Added `src/scenarios/vireContent.js` with the published map/objective specification, twelve package branches, regular and alternate tables, support resources, forty event slots, attachments, initial/event tank platoons and MSRs. `src/scenarios/vire.js` is an unregistered, non-playable foundation descriptor, not an inherited infantry mission. Explicit capability validation rejects missing enemy/vehicle profiles and invalid distributions; supplied profile names in foundation tests assert the content contract, not implemented vehicle support.

Added the pure `delayActivityTable` matching the printed player-aid column, with all Good Order rows and first-match priority tests. It is deliberately not connected to `combat.js`: actual Delay Defense execution, LAT integration and vehicle behavior remain pending. No live simulation or rules-version change is claimed.

Focused validation: three files / 62 tests passed (`vireFoundation`, accepted M5 release and M5 foundation); production build and `git diff --check` passed. Vire fixtures cover execution gating, all regular/counterattack odds, unsupported profile rejection, malformed placement, objective/row boundaries, required vehicles, AT equipment, support caller differences, event timing and all pure Delay Defense rows. Complete-run and browser release gates remain unchecked because Vire is not yet playable. Accepted M5 work and normal mission selection remain intact.

Next: visually audit the complete WWII vehicle/AT profiles and procedures, then implement the gated vehicle state/activation/action foundation and integrate Delay Defense with a new rules version and preserved historical readers.

## October 9 vehicle/AT mathematical and phase foundation

Visually inspected both pages of `FoF Player Aid - Vehicle and Anti-Tank Weapons Chart.pdf`, including WWII profiles, AT modifiers, vehicle actions, ambush and the ground-vehicle result thresholds. Read third-edition pp.71–75 in full for command/transport, action sequencing, reactions, Quick Shot and crew/passenger outcomes; earlier §10.8.3 text review remains applicable. Complete visual rule-page/counter/CSR audits remain pending; do not mark the broader source gate complete on this evidence alone.

Added gated `src/sim/company/vehicleCombat.js`: immutable WWII profiles, integer AT-result lookup, weapon-range/target validation, gun/rocket ambush modifiers and grenade-attempt draw counts. Tank and rifle-grenade profiles do not receive the gun/rocket ambush bonus. The calculation reproduces the published p.75 Sherman moving under Long-range 88mm fire: modifier −2 plus AT card +1 gives −1 / Brewed Up. It calculates required grenade draws but does not yet perform the attempt, spend ammunition or apply the result to crews.

The serializable phase cursor requires tanks on both sides to complete before jeeps and AT infantry/guns, alternates sides with offensive priority, blocks another action during a pending reaction, and rejects duplicate actions/reactions. Unactivated opposing AT units can react; eligible Quick Shot preserves reaction eligibility. AT infantry actions skip vehicle VOF/reaction stages. LOS, movement-per-card VOF windows, crew/passenger effects, legal target selection and actual deck-driven firing are still integration work, not completed behavior.

Validation: three files / 36 tests passed (vehicle foundation, Vire content foundation and accepted M5 release). Fixtures exercise every ground-result threshold, ambush/support/pin boundaries, illegal profiles/ranges/movement, published combat example, group order, pending JSON roundtrip, nonactivated reactions and duplicate/invalid Quick Shot rejection. Production build and `git diff --check` passed. This module is not imported by the live engine: shared rules remain 33, accepted mission execution and historical records are unchanged. Vire remains absent from normal selection and not playable.

Next execution work: deterministic grenade/AT draws and ammunition spending; vehicle state, crew/cargo identities and outcome application; per-card movement/VOF/reaction continuations; then integrate activation, Delay Defense, HQ events and a rules-version increment with preserved historical execution.

## October 9 deterministic AT firing

Added `resolveATFire` to the gated vehicle module. It completes the required grenade-attempt batch through the existing Action deck, draws an AT-result card only on success (or immediately for weapons requiring no grenade attempt), and charges one weapon ammunition for either outcome. Failed attempts do not place Grenade Miss markers. Shot records retain attempt/result card IDs, final modifier/sum, ammunition boundaries and Quick Shot draw/remaining-ammunition eligibility. Clone-first resolution rejects duplicate shot IDs after reload without changing the original state, and structured events retain their own event identity.

Five additional fixtures cover failure/expenditure, complete successful draw batches, H-rated gun firing, exact JSON-reloaded deterministic resolution, duplicate application, invalid/empty-ammunition rejection and final-ammunition Quick Shot boundaries. All three Vire foundation files pass: **38 tests**. Production build and `git diff --check` pass. These helpers remain outside live rules-33 execution; they do not yet update authoritative carrier ammunition or apply crew/vehicle results. Consequently the vehicle release checklist remains open and Vire stays gated.

Next: authoritative vehicle/crew/cargo state and AT-outcome application, followed by movement continuations and integration. Reaction eligibility must use the recorded Quick Shot draw fact while separately enforcing remaining ammunition for each additional shot.

## October 9 crew/outcome and movement continuations

Added gated `vehicleState.js` with explicit vehicle identity, profile-sized crew steps, weapon ammunition, passengers, cargo, transported casualties, activation and applied-result history. Crew/passenger step and personnel identities survive clone/JSON operations. Capacity and duplicate-step validation reject invalid embarkation. Ground AT outcomes preserve distinct consequences: burning wreck/unresolved casualty steps, ordinary wreck/exposed Fire Teams with queued HITs, retreat/unavailable passengers, pinning and misses. Ammunition is lost on destruction; knocked-out non-ammo cargo and transported casualties are placed on the card. Tank riders disembark and queue HITs when a tank is pinned. No wounds/deaths or immediate HIT outcomes are invented. Untouched pins clear at the end of the vehicle phase, while attacked pins remain; activation reset is a separate cleanup operation.

Added gated `vehicleMovement.js` with clone-first, serializable per-card continuations: origin VOF, card entry, destination VOF and reaction window before continuing. It validates adjacency and NO/SLOW trafficability, carries passenger identities/locations and permits stopping after card-entry VOF. Pending JSON recovery and out-of-order/duplicate continuation rejection have fixtures. Its trafficability contract still needs an adapter to the actual terrain projection, and callers must resolve each acknowledged VOF/reaction window and stop movement on destructive outcomes; it is not a live movement order yet.

Five Vire test files now cover **47 tests**, including six crew/outcome fixtures and three movement fixtures. Production build and `git diff --check` pass. These domains remain disconnected from live rules 33. Immediate HIT consumption, tank-rider special handling on other outcomes, transport-area/driver eligibility, cargo carrying limits, authoritative ammunition application, vehicle movement capacity and integrated reaction decisions are still release gates. The whole vehicle checklist remains open; no M6 execution or browser acceptance is claimed.

Next: wire these domains into a gated simulation adapter with authoritative LOS/terrain, actual HIT resolution, activation orders and replay operations; preserve rules-33 historical readers before increasing the live version.

## October 9 experimental integration adapter

Added `vireIntegration.js`, adapter format version 1, explicitly outside the live mission API. It initializes vehicle/crew identities alongside a cloned company state and applies identity-keyed operations for vehicle activation, AT fire, immediate crew HIT resolution and movement preparation. Activation spends the actual impulse command pool, requires an eligible commander and WWII radio link (or General Initiative), and does not use visual/verbal contact as a substitute. Own vehicle-HQ links remain distinct from CO-to-vehicle BN-net links. Full tank-HQ setup and activation-menu integration remain pending.

AT fire derives range, terrain protection, pin states, supporting Good Order infantry and LOS from authoritative simulation state; unknown enemy target identities cannot be selected. It updates actual adapter weapon ammunition and vehicle outcomes. Knocked-out crew steps become ordinary infantry Fire Teams under a Wreck and resolve immediate HITs with shared Action-deck hit-effect draws and `applyHit`; subsequent actions are blocked while immediate HITs remain. Burning Wrecks are markers, not discoverable cover; their smoke/LOS effects still require integration. Known-enemy status is inherited rather than revealing unseen crews automatically.

Movement preparation normalizes the real terrain's `No`/`Slow` strings, closing the domain-contract gap found during integration. Prepared movement remains a continuation requiring real VOF/reaction and capacity handling before any live movement control is exposed. Exact operation replay starts from an immutable cloned state and rejects duplicate operation/HIT resolution after reload. It is an adapter replay contract, not a replacement for the public mission replay/export format.

Validation: seven files / **53 tests passed**, covering all Vire foundation suites plus accepted M5 release. New integration fixtures verify command expenditure/authority, actual No/Slow terrain, authoritative LOS and hidden-target rejection, knockout → immediate crew HIT resolution → exact JSON-reloaded replay, duplicate rejection and blocking while HITs remain. Production build and `git diff --check` pass. Rules remain 33; accepted execution and mission catalog remain unchanged.

Remaining live-integration gates include the vehicle group coordinator, enemy AT profiles/automatic activation, Quick Shot/reaction decisions, movement-window VOF resolution, burning-wreck smoke, vehicle capacity, transport/driver commands, tank-HQ initiative, UI and public replay operations. Complete procedural audits and historical execution readers precede a shared rules-version increment and playable Vire opt-in.

## October 9 reaction, movement VOF and conditional controls

Adapter format is now **2**, with strict rejection of prior adapter formats. Shared accepted execution remains rules 33. AT fire offers explicit eligible Quick Shot continuation/decline, then opens opposing reaction eligibility. Unactivated weapons can react, reactions do not open another reaction window, and Quick Shot draw facts preserve reacting weapons' moved/fired eligibility. Enemy response operations choose targets internally, retain draw/replay history and never require the interface to enumerate hidden weapons. Enemy Quick Shot cannot be declined. Immediate crew HITs and pending firing/movement decisions block conflicting operations.

Movement continuations now draw actual AT-result cards for qualifying VOF, use authoritative vehicle defense, terrain/burst, pin and moving-target modifiers, and install the same vehicle/crew outcomes as AT fire. A destructive origin VOF stops movement before card entry. Basic VOF from AT-capable A/H weapons is excluded; ordinary .30-cal HMG fire is not incorrectly treated as AT fire. Remaining VOF audit includes the complete source/marker targeting rules, mines, smoke and nonactivated/end-of-phase vehicles; this is not a claim that the full §10.5.3 gate is closed.

Added strict vehicle-integration replay export/import with immutable starting state and exact operations. The format is explicitly `vire-integration`, not the public campaign mission replay. Public projections conceal unseen vehicle identities/positions, enemy ammunition and hidden reaction candidates. Current operations replay through Quick Shot → reaction and movement interruption after JSON roundtrip.

Conditional vehicle controls are wired into `companyMain.js` for states containing the experimental adapter: activation, AT fire, friendly reaction/Quick Shot choices, automatic enemy responses, crew HITs, movement steps and replay export/import. They use a dialog and floating button; normal accepted states render no vehicle controls and retain their right panel. Adapter saves use `platoon-vire-integration`, separate from accepted mission recovery. A normal M6 setup cannot initialize this adapter yet, and browser validation of the complete candidate remains pending. Existing recovery is not a vehicle save loader; restore currently uses the dedicated integration replay file control.

Focused checks: eight files / **57 tests passed**, including the hidden-information UI projection and accepted M5 release; production build and `git diff --check` pass. Full-regression evidence follows when available. Next gates: connect the ordered group coordinator and enemy AT activation, finish VOF/transport/command audits, create the actual gated Vire scenario/setup and public mission replay integration, then complete mission/reattempt runs and browser checks before user acceptance.

Final regression evidence for this increment: **96 test files / 1,397 tests passed** with thread workers and a 60-second per-test timeout. Follow-up integration tests also passed after tightening base-rule compatibility and covering automatic enemy HIT/response replay. Production build and whitespace checks pass. Adapter replay imports require format 2 and base rules 33; accepted mission replay formats remain untouched. Enemy crew HITs have a generic replayable resolution control to avoid blocking the UI on concealed step IDs. Browser/complete-mission validation is still pending, and normal M6 selection remains unavailable.

## October 9 ordered action integration

Adapter format is now **3**, retaining strict base-rules-33 compatibility and leaving accepted mission replay formats unchanged. Normal firing and movement use the ordered group cursor: both sides' tanks precede jeeps, then AT infantry/guns. Immediate crew HITs, movement continuations, Quick Shot decisions and outstanding reactions hold the current action open. Empty groups are skipped, and the experimental dialog displays the current group and eligible friendly actors without listing hidden enemy candidates.

Phase initialization applies CSR enemy activation: PAK40, FLAK88 and Panzerschreck activate automatically; Panzerfaust and infantry guns activate when an active US vehicle occupies their card. Initialization is replayable and cannot be repeated. Friendly reaction refusal is explicit and replayable, preserving ammunition and later action eligibility; it cannot decline an enemy response.

Focused validation: **eight files / 61 tests passed**, including accepted M5 release, with exact JSON-reloaded replay for phase initialization and group completion after crew HITs. Production build passed. Added fixtures reject premature AT-group actions, repeated initialization and invalid reaction refusals, and verify conditional enemy activation and immediate-HIT blocking.

The cursor is integrated, but the broader vehicle-phase gate remains open. In particular, stationary firing still needs its explicit pre-action VOF procedure; AT weapons with no legal target need the published skip procedure; end-of-phase VOF/pin cleanup, phase reset, full transport/driver restrictions and tank-HQ initiatives remain pending. The adapter is not a playable M6 mission. Actual Vire setup, Delay Defense execution, public mission replay integration, complete mission/reattempt runs and browser acceptance remain required before opt-in or normal selection.

Final regression for ordered action integration: **96 files / 1,401 tests passed** using the direct Vitest CLI with thread workers, four workers and a 60-second per-test timeout. The first npm-invoked run dropped CLI options and encountered fork-worker termination errors/timeouts; the explicit runner completed successfully. Follow-up focused fixtures passed after the final presentation adjustment. Production build and whitespace checks passed. No browser acceptance or complete M6 execution is claimed.

## October 9 stationary VOF and phase completion

Re-read third-edition pp.72–74 (§§10.4–10.7). Adapter format is now **4**, still requiring accepted base rules 33. Stationary vehicle AT actions resolve origin VOF before spending weapon ammunition or drawing the AT shot. Destruction interrupts firing; immediate tank-rider HITs create a persisted pending-fire continuation. Resuming that action after the HITs does not resolve origin VOF again. Movement and stationary actions share the same VOF resolver and authoritative crew/outcome installation. Reaction fire against a vehicle in its movement reaction window includes the moving-target bonus.

Explicit phase completion queues VOF for active vehicles that did not take a vehicle action, including nonactivated vehicles. Each vehicle is resolved separately; immediate crew HITs hold completion open. Pins clear only on vehicles that were not attacked during the phase. Activation/moved-fired markers reset through a separate Cleanup-phase operation, which also permits a new phase cursor next turn. Repeated or out-of-phase continuations are rejected. AT weapons without ammunition or a legal vehicle target wait without consuming their activation/action; their eligibility is recalculated as the battlefield changes.

Experimental controls expose phase-end VOF, pending-fire guidance and Cleanup operations. Hidden enemy VOF draws/events remain hidden, and the phase-end control does not list concealed queued vehicle identities. Strict adapter replay rejects earlier adapter formats; accepted historical mission exports and normal selection are unchanged.

Focused validation: **eight files / 66 tests passed**, including accepted M5 release. New fixtures cover stationary destruction before ammunition expenditure, rider HIT → resume without a second VOF draw, phase-end knockout with exact replay at partial checkpoints, attacked-pin retention on a miss, unattacked pin recovery, and Cleanup/next-phase boundaries. These tests supplement, rather than close, the complete source-audit and release gates.

Still pending: complete VOF source/marker/mines and burning-wreck smoke audits; transport/driver/capacity integration; vehicle Spot, Concentrate Fire and Move then Fire actions; tank-HQ initiatives; automatic enemy action selection; actual Vire scenario/setup and Delay Defense; public mission replay/historical integration; complete mission/reattempt runs and browser acceptance. M6 remains non-playable and absent from normal selection.

Final regression evidence for stationary VOF/phase completion: **96 files / 1,406 tests passed** with thread workers, four workers and a 60-second per-test timeout. Follow-up focused checks passed after the final moving-target and phase-boundary adjustments. Production build and whitespace checks passed. Browser and complete-mission gates remain open.

## October 9 tank riders and Move then AT Fire

Re-read third-edition pp.71 and 75–76 (§§10.2, 10.8.1–10.8.2). This revealed an error in the earlier generic passenger outcomes: **tank riders do not become automatic casualties on Brewed Up or generic Fire Teams under a wreck on Knocked Out**. The §10.8.2 exception disembarks them exposed with their existing cohesion and immediately queues HITs for Brewed Up, Knocked Out and Pinned. Crew still receive the ordinary result. Updated source-backed fixtures supersede the earlier tests that asserted generic destruction for tank riders. Actual integration consumes their HITs through the shared infantry procedure; full embarked formation/fire representation remains pending.

Adapter format is now **5** with strict rules-33 base compatibility. Tanks carrying passengers or casualties cannot fire, including Reaction Fire; carrying only ammunition does not impose this restriction. Loaded tanks are omitted from reaction eligibility. An empty Jeep cannot begin movement without an embarked driver; its complete driver/command and exposed-passenger combat integration remains pending.

Added explicit Move then AT Fire and stop-after-card operations. Move then AT Fire requires a capable profile, destination VOF completion and resolution of outstanding reactions; it ends the remaining movement path. The printed moving-firer penalty also applies to subsequent Quick Shots. A normal movement may instead stop after its current card and finish without firing. Experimental controls expose these choices at the movement reaction stage. Replay preserves path termination, modifiers and ammunition expenditure.

Transport domain validation now requires passengers to be in the vehicle's card area and counts transported casualty steps against capacity. A clone-first selected-passenger disembark helper preserves step/personnel identities, places them exposed at the vehicle's current location, supports a supplied cover destination, and rejects duplicate/missing passengers. This helper is not a live embark/disembark order: command spending/eligibility, legal cover capacity, infantry formation restoration and reaction timing still require adapter integration before controls are exposed.

Remaining gates include live transport orders and passenger fire/effects; vehicle Spot/Concentrate Fire; tank-HQ initiatives and automatic enemy actions; complete VOF/smoke/capacity audit; actual Vire setup/Delay Defense; public mission replay/historical integration; complete runs, reattempt and browser acceptance. Normal M6 selection stays unavailable.

Validation for this increment: **eight focused files / 70 tests passed**, **96 regression files / 1,410 tests passed**, production build and whitespace checks passed. Exact JSON-reloaded adapter replay covers Move then Fire with Quick Shot and stopping a movement path. Domain fixtures verify the corrected rider outcomes, area/casualty capacity and immutable selected disembarkation. Browser and complete M6 release gates remain open.

## October 9 experimental infantry transport orders

Adapter format is now **6**, still isolated from accepted base rules 33 and public mission replay. Added tank embark operations during eligible command impulses. One vehicle command can embark multiple unpinned friendly formations up to capacity, with same-card-area validation, eligible vehicle HQ/CO radio authority or General Initiative, and duplicate/phase/command-pool rejection. Embarked formation records are copied before their steps move into the vehicle; voluntary disembark restores the original formation, step and personnel identities at the vehicle's current card, exposed and outside cover. Embarkation removes that formation's previous fire relationship.

Disembark after movement requires completion of the intended path's destination VOF and outstanding reactions (a shortened path via Stop is also eligible). Stationary disembark is a separate activated vehicle action: origin VOF, reactions, then passenger restoration and Moved/Fired. Persisted pending disembark selections survive replay and are selected in the experimental dialog. If VOF or a reaction destroys the vehicle or automatically disembarks riders, the selected voluntary action clears; immediate rider HITs still hold the current action open. No additional command is charged for the AT-phase disembark action.

`vehicleTransport.js` is an experimental tank infantry adapter, not complete transport support. Embarked originals currently remain unavailable to ordinary infantry procedures while their steps are in the vehicle. Consequently the required tank-rider Combat Effects/Sniper/Concentrated Fire exposure while aboard **is not implemented yet** and must be resolved before any playable M6 candidate. Open-vehicle passengers are rejected rather than treated as armored passengers. Jeep driver communications, casualties/equipment loading and unloading, carrying limits, direct-to-cover disembark and complete asset consequences remain pending. Passenger transport does not close the vehicle release gate.

New focused fixtures verify command expenditure and immutable embarkation; wrong-phase/disconnected/pinned/distant/duplicate/capacity rejection; exact movement/disembark replay; General Initiative and friendly-only projections; stationary reaction blocking; and vehicle destruction → rider HITs → action completion. M6 remains non-playable and absent from normal selection.

Validation: **nine focused files / 75 tests passed**, **97 regression files / 1,415 tests passed**, production build and whitespace checks passed. The initial broad run used the incomplete synthetic crew record in the new destruction fixture; after supplying its explicit personnel arrays, the focused check and fresh complete run passed. Exact replay covers embarkation, voluntary movement/stationary disembark and destruction with pending rider HITs. Browser and complete mission gates remain open.

## October 9 embarked infantry Combat Effects

Adapter format is now **7**, with accepted base rules 33 unchanged. The earlier tank-rider Combat Effects gap now has an experimental adapter procedure: prepare one common infantry combat snapshot with riders temporarily represented as exposed infantry at the vehicle's current card, with no cover, fire or indirect-fire action of their own. Existing `prepareCombat` and `resolvePreparedCombat` perform targeting, NCM probabilities, HIT effects, breakdown, ammunition inheritance and asset handling. Their defaults and accepted mission execution are unchanged; the core NCM resolution remains probabilistic rather than changing to Action-card pulls.

Vehicle-targeted Grenade VOF is projected to every aboard formation. Ordinary sniper selection includes exposed riders. Concentrated Fire retains its individual formation target. After each prepared resolution, surviving originals/child formations and their stable step/personnel identities are recorded back aboard. Casualties use the existing core casualty procedure without inventing wound/death dispositions. An original that breaks down is not also retained aboard with the same steps. Voluntary disembark can subsequently restore the resulting aboard formations.

Explicit adapter operations prepare and resolve the common infantry snapshot, including a generic automatic enemy-resolution operation. Public controls show friendly resolution IDs/names/NCMs without enumerating hidden enemy targets or source identities. Duplicate preparation/resolution is rejected, and Cleanup cannot skip passenger combat or leave a pending infantry resolution. Exact JSON-reloaded replay covers preparation and rider HIT/breakdown.

Focused evidence: **ten files / 78 tests passed**. New fixtures cover all-rider grenade projection, exposure and no rider fire/ammunition expenditure, ordinary HIT → split formations → unique surviving identities aboard, duplicate rejection, sniper eligibility, individual Concentrated Fire and replay.

This supersedes the prior note that tank riders had no Combat Effects representation, but does not close the full transport gate. Actual mission-phase wiring must invoke this shared snapshot exactly once rather than separately preparing combat through the normal engine. Casualties/equipment loading and unloading, complete cargo consequences and carrying limits, open-vehicle passenger fire/driver rules, direct-to-cover disembark and complete browser presentation remain pending. Vehicle Spot/Concentrate Fire, tank HQs, enemy actions, Vire setup/Delay Defense, historical/public replay integration, complete runs and reattempt validation also remain open. M6 stays non-playable and unavailable in normal selection.

Final regression evidence for embarked infantry combat: **98 files / 1,418 tests passed**, production build and whitespace checks passed. Complete M6 runs, public phase/replay wiring and browser acceptance remain pending.

## October 9 vehicle equipment and casualty loads

Read third-edition §§5.1.6 and 10.2 and **visually verified the p.33 transport-capacity table**. Corrected the earlier mixed passenger/casualty allowance: in addition to assets, a vehicle carries passengers, casualties, or one ammunition type. Passenger-carried ammunition does not count as a separate vehicle ammunition payload. Assets/demolition charges have no vehicle quantity limit; transported MG/MTR/RCL-RKT ammunition uses 6/2/3 per capacity point, and each flamethrower fuel unit represents a two-shot bundle. Unsupported ammunition keys fail validation rather than inheriting a guessed capacity. Movement rejects invalid/mixed or overloaded payloads.

Adapter format is now **8**, with accepted rules-33 execution/public replay unchanged. Added command-phase vehicle load/unload transactions with the same vehicle HQ/CO radio authority or General Initiative as embarkation. One command can unload selected loads, load different assets/casualties and embark selected infantry. Whole asset records are selected; partial ammunition-pile splitting is not provided yet. Wrong location/area, repeated identities, incompatible payloads and insufficient command authority reject atomically through clone-first adapter application.

Loaded assets move out of the ground inventory and retain their IDs aboard. Loaded casualties retain one canonical casualty record with the vehicle carrier; they have no ground location while aboard, preventing ordinary ground pickup from treating them as available. Unloading places the same IDs at the vehicle's current card. Knockout drops non-ammo assets and releases the existing casualty record once; transported/in-use ammunition is lost. Brewed-up loads are retained in an identity-bearing loss ledger, and an existing carried casualty becomes unavailable without assigning a new wound/death disposition. Retreat leaves carried casualties unavailable with the removed vehicle.

Experimental controls expose friendly ground/carried load selections and a single combined load order. Public projections exclude hidden enemy loads and omit carried casualties from ground choices. New fixtures cover each printed ammo boundary, mixed-payload rejection, atomic failure, one-command load swaps, exact replay, knockout versus brewed-up loads, casualty identity/disposition preservation and concealment. The previous test accepting passengers alongside casualties was corrected against the source.

Remaining transport gates: direct infantry-to-vehicle pickup/loading, carried-equipment consequences for destroyed rider formations, vehicle casualty evacuation/CCP integration, partial ammo quantities, direct-to-cover disembark, Jeep driver/open-passenger procedures, and browser validation. Source checks here do not complete the broader vehicle/counter audit. Remaining vehicle actions, HQ initiatives, enemy actions, Vire setup/Delay Defense, public/historical replay, complete runs and reattempts still precede M6 release.

Final validation for equipment/casualty loads: **99 files / 1,422 tests passed**, production build and whitespace checks passed. Focused cargo, transport, rider-combat and accepted M5 checks passed. Complete M6 execution, source audits and browser gates remain open.

## October 9 experimental vehicle Spot action

Adapter format is now **9**, retaining strict accepted base-rules-33 compatibility. Added an explicit friendly vehicle Spot action under §§10.5.2E and 8.5. It uses the existing normal spotting procedure for terrain, elevation, exposure, target type and experience. The player selects a card rather than a hidden unit. An empty card remains a legal observation destination, so validation does not disclose concealed occupancy. Spotting spends no additional infantry command or weapon ammunition and does not invoke command-impulse Exhort.

The action requires an activated, unpinned ground vehicle in the current ordered group/side. Origin VOF resolves before observation. A resulting pin or destruction interrupts observation without a spotting draw, but consumes the selected action; immediate HITs and opposing reactions continue to hold the action cursor open. The experimental dialog exposes an observation-card selector without changing the accepted right panel. Replay records the selected card and reproduces the shared deck draws and discoveries exactly. Earlier experimental adapter formats are rejected; accepted mission replay versions are unchanged.

Focused fixtures cover successful discovery, empty-card observation, activation/phase/pin/LOS rejection and immutable failure, pre-action pin/destruction, reaction blocking, unchanged ammunition/command pools and exact JSON-reloaded replay. This is not complete live M6 phase integration or browser acceptance.

Vehicle Concentrate Fire remains pending: its legal target must already be under that vehicle's established VOF. The sidecar does not yet establish automatic basic vehicle VOF/PDF in the live infantry fire pipeline. Do not substitute arbitrary LOS targeting or represent tank crews as ordinary live infantry to bypass this requirement. Complete that integration before Concentrate Fire, its critical/Jam exceptions and the remaining vehicle fire/source audits are marked complete. Vire setup/Delay Defense, HQ initiatives, enemy actions, public/historical replay, complete runs and reattempt/browser gates remain open. M6 remains unavailable in normal selection.

Validation: **100 regression files / 1,428 tests passed**, including the six new Spot fixtures. Production build and whitespace checks passed. Browser and complete mission acceptance remain pending.

## October 9 automatic vehicle VOF and Concentrate Fire

Re-read third-edition §§10.3, 10.5.2B, 10.5.3, 10.7, 10.8.2, 7.11 and 7.18.1G; visually inspected printed pp.72–73. The experimental adapter is now **10**, with strict accepted base rules 33 unchanged. Existing missions have no vehicle runtime and retain their ordinary fire/target roster. Earlier experimental formats are rejected rather than migrated implicitly.

An explicit experimental operation enables automatic vehicle basic fire. Vehicle fire-only records participate in the shared PDF acquisition, existing-direction interception, LOS, target priority and basic-VOF pipeline; they are never inserted into the infantry unit roster or Combat Effects target list. Sherman H and M5 A VOF become Pinned fire when appropriate. Loaded tanks and tanks without ammunition contribute no basic fire. Eligible small-arms infantry can fire at a vehicle alone, while A/H AT-capable sources, including tanks, cannot acquire or join a new PDF aimed at vehicles alone. On-map tank A/H VOF is excluded from VOF-against-vehicles resolution because those weapons use AT fire instead. Same-card infantry exposure now resolves a vehicle source safely.

Added activated, unpinned vehicle Concentrate Fire with known infantry choices under that vehicle's established VOF. Origin VOF precedes the attempt, and the ordered action/reaction cursor remains authoritative. Draws are two adjusted for experience; out-of-cover targets use the existing seeded random selection. Covered critical hits remove cover benefit, and out-of-cover critical hits apply two modifiers. Jam has no effect. M5's AT grenade prerequisite does not replace the crosshairs draw for its basic-A Concentrate Fire. Successful attempts use one additional ammunition point; failures do not. Unsupported G!-only profiles remain rejected by existing content/profile validation and are not exposed as working actions.

Common infantry combat preparation snapshots vehicle fire before spending its once-per-turn basic-fire ammunition. Its source identity/name/faction survive in the snapshot, and no vehicle crew receives an ordinary infantry NCM resolution. Tank ammunition exhaustion after basic fire, successful concentrated fire or AT fire withdraws the vehicle without creating casualties. Subsequent refresh removes its fire and invalid modifiers. The normal shared Combat Effects snapshot retains fire already applied before expenditure. No tank reload command is introduced.

Public fire-source lookups, contact placement and same-card exposure accept the isolated vehicle source records without placing crews in the infantry roster. The experimental dialog shows established basic-VOF destinations, withdrawal due to ammunition exhaustion and known infantry selections. Hidden vehicle identities and enemy ammunition remain protected. This is an experimental control flow, not a live Vire setup or release candidate.

Twelve focused fixtures cover automatic H/Pinned fire, loaded/empty sources, vehicle-only acquisition and PDF joins, same-card exposure, Jam/critical effects, experience draws, random out-of-cover targeting, source-bearing snapshots, ammunition expenditure/exhaustion, hidden projections, LOS marker removal, atomic rejection and exact JSON-reloaded Concentrate Fire replay. Existing Spot, transport, crew and accepted M5 fixtures also pass.

Still pending before release: normal engine phase/setup wiring (including exactly-once shared combat preparation), tank HQ initiatives and enemy vehicle action selection; complete Cease/Shift Fire, rally and recovery orders; full tank-rider targeting during the command/vehicle phases and Jeep/open-passenger procedures; VOF/mines/smoke/source audits and remaining transport work; materialized Vire map/roster/Delay Defense; public/historical replay integration; complete mission and reattempt runs; browser acceptance. The explicit fire opt-in is not normal mission selection. M6 remains gated.

Final validation for automatic vehicle VOF/Concentrate Fire: **101 files / 1,440 tests passed**, production build and whitespace checks passed. A follow-up focused check also verifies exact reload/replay of the prepared combat snapshot after tank-ammunition exhaustion. Complete M6 execution and browser acceptance remain pending.

## October 10 vehicle-HQ impulses and normal phase integration

Re-read and visually inspected third-edition p.71 (§10.1): WWII tank-platoon HQs use BN TAC to Company HQ and always communicate with their assigned vehicle platoon. Adapter format is now **11**, strictly requiring accepted base rules 33. The vehicle HQ is a command projection of its tank/crew identity; it is never inserted as a second infantry formation or Combat Effects target.

Added explicit tank-platoon HQ roles and command assignments. An eligible CO impulse can activate the tank HQ over BN radio; the HQ then participates in normal Subordinate Activation. Without that activation, it participates in Platoon Initiative. Both use the existing shared command draw, experience/fire/pin/no-contact modifiers, four-command spending limit and saved-command procedure. Completed HQs cannot draw another impulse that turn. HQs activate their assigned tanks through the platoon network without requiring voice LOS or each tank's own BN radio. An unrelated vehicle HQ, disconnected CO, duplicate activation and out-of-phase activation are rejected atomically. Lost/withdrawn HQ tanks are unavailable. This does not implement vehicle HQ replacement/succession or all individual-vehicle/Jeep command exceptions.

An explicit **Enable normal phase integration** operation begins before the vehicle/combat snapshot. Normal engine entry into AT Combat starts the ordered vehicle cursor and automatic basic fire. The normal phase button refuses to skip unresolved vehicle actions, reactions, immediate HITs or queued end-of-phase VOF. Completed AT Combat advances through the existing offensive sequence without the former no-vehicle skip event. Ordinary accepted missions retain that skip and their existing flow.

Normal Combat Effects now owns one shared snapshot, including exposed tank riders. Friendly resolution uses the existing explicit normal combat controls; hidden resolutions follow the same seeded queue. Rider formations are projected aboard again after each resolution. Normal Cleanup resets vehicle activation/action markers and the cursor for the next turn. Manual adapter prepare/resolve/Cleanup operations are rejected in this mode, preventing a second snapshot or duplicate ammunition expenditure. The experimental dialog shows vehicle-HQ impulse selections, CO activation and the ownership of normal Combat Effects/Cleanup.

Core engine transitions and adapter operations are interleaved in one strict, ordered adapter replay log. The existing replay-export API routes vehicle states to the adapter format, so normal File/outcome exports include the vehicle operations rather than silently omitting them. Vehicle recovery remains in its separate storage slot. Tests reproduce direct normal phase/HQ/combat calls, adapter decisions and save/reload exactly. Accepted mission exports remain in their original format; this is not a general historical M6 reader or a campaign save migration.

Eight new fixtures cover CO activation versus initiative, reserve persistence, assigned/unrelated HQ command links, wrong-phase/duplicate rejection, AT-phase boundaries and end VOF, exactly-once shared combat, embarked rider exposure/resolution, normal Cleanup/next-turn reset, mixed replay/export and unchanged no-vehicle stepping. Focused integration, cargo, rider, basic-fire and accepted M5 checks passed; production build and whitespace checks passed.

Remaining release gates: materialized Vire map/roster and Delay Defense; enemy vehicle action selection and tank-support event setup; remaining rally/Cease/Shift Fire and command exceptions; vehicle HQ loss/succession, riders during command/vehicle targeting and Jeep rules; mines/burning-wreck smoke and complete VOF/transport audits; public M6 identity/reattempt/historical compatibility; complete mission/reattempt runs and browser acceptance. The phase integration is an experimental opt-in and does not enable normal M6 selection.

Final validation for vehicle-HQ/normal phases: **102 files / 1,448 tests passed**, production build and whitespace checks passed. Browser validation and complete playable Vire mission/reattempt runs remain pending.



## October 10 Delay Defense execution

Visually verified the supplied Enemy Activity Check Hierarchy player aid, page 1, including all ten Delay Defense rows. The shared enemy activity executor now explicitly selects that column for `delay_defense`, rather than falling through to Deliberate Defense. Existing Hasty Defense, Offensive Assault and LAT/pinned selection remain unchanged. Existing activity legality filtering, fallback, hiding/contact renewal, attack and fortification procedures are reused. Single-outcome automatic rows consume no activity card because the shared random-number helper already skips draws for a range of one.

The authored table fixtures cover every printed row and first-match precedence. Four new execution fixtures cover depleted heavy-weapon automatic fallback, automatic hiding with a single renewed contact, same-card Delay probabilities and exact hidden-state behavior after JSON recovery. Focused source/execution and accepted Normandy hierarchy checks passed (140 tests). This is engine execution coverage on synthetic infantry states, not a complete Vire playthrough or mission replay.

Accepted rules remain 33 and experimental adapter format remains 11: no existing mission selects Delay Defense and no existing vehicle operation format changed. Vire remains absent from normal selection and `playable:false`. Materialized scenario setup, full package execution, vehicle-aware reattempts, complete runs and browser acceptance remain outstanding.

Final validation for Delay Defense execution: **103 files / 1,452 tests passed**, production build and whitespace checks passed. The existing build chunk-size advisory remains. No browser check or complete Vire mission/reattempt run is claimed.



## October 10 materialized setup foundation

Re-rendered and visually inspected Normandy pp.37–38 and p.40: map/contact diagram, published attachments and all seven support entries, package equipment and both MSRs. `vire.js` now materializes a fresh four-column/five-row terrain map with four staging cards using the existing seeded Normandy setup. It has selectable distinct Row-5 objectives, adjacent Row-4 attack position, original Row-1–3 clearing requirements, C/C/B/question-side A–B/question-side A–B contacts, Line Delay Defense and the authored Vire event/package tables. It inherits the accepted company baseline and equipment choices without Hill 192 forward defenses, patrol restrictions or M5 battlefield import.

The infantry force includes the published artillery/mortar observers, two one-step HMGs with six ammo and unconditional three-step Line engineers. The artillery observer keeps its stable baseline `artyfo` identity. Engineers may receive a platoon assignment through an explicit scenario capability; existing mission assignment eligibility is unchanged. Enemy profiles retain the six accepted FJ counters and breakdown metadata, with Vire-specific A-squad MG4, one Panzerfaust per squad, one leader rifle grenade, two mortar-spotter missions with three subsequent caller draws, and individual one-step 81mm mortar teams with MTR3. AT/gun package profiles have four ammo. These profiles pass the strict Normandy content validator; live AT attachment/synchronization is still pending.

Added `previewVireSetup` and a validated vehicle-deployment authoring helper, separate from live creation. Initial deployment has exactly five Line Shermans, one explicit platoon HQ with BN radio, all assigned to that HQ, five ammo each, ten unique crew-step identities and AT-ambush susceptibility. Initial vehicle placement is restricted to staging. The five M5s are authored separately with five distinct crew identities and Row-1-only entry; they are never included in the starting force. This does not execute the Tank Support event. Optional artillery-radio Jeep mounting remains explicitly deferred until CSR 1 vehicle/radio behavior is validated; the preview does not invent a Jeep attachment.

Six setup fixtures cover seeded card/contact counts and concealment, objective boundaries, both observers/attachments, default and individual mortar teams, radio/phone choices, engineer assignment, tank staging, event-force separation, unique crew identities, invalid setup rejection and isolation from source definitions/previous previews. This is a read-only setup foundation, not an immutable deployed vehicle roster or playable M6 initialization. Complete finite-counter/source execution, AT synchronization, isolated persistence and vehicle-aware reattempts remain required. No normal catalog entry or right-panel change was added; `createMission(vire)` still rejects the gated definition. Shared rules remain 33 and adapter format remains 11 because accepted execution/replay formats are unchanged.

Final validation for materialized setup: **104 files / 1,458 tests passed**, production build and whitespace checks passed. Existing build chunk-size advisory remains. Complete playable Vire setup/browser acceptance, mission runs and reattempts remain pending.

## October 10 live packages, Tank Support, recovery and reattempts

`createVireDevelopmentMission` now deploys a fresh standalone immutable company snapshot with named Sherman crew and reserved, distinct M5 crew identities. The initial five Shermans join normal explicit phases. AT-capable infantry/guns and carried Panzerfaust/rifle-grenade assets project into the ordered AT group; they remain the original infantry formations and spend the original ammunition rather than a second inventory. Projection follows movement, displacement, degradation and depletion. Enemy AT actions select eligible sources/targets using the shared seeded randomness and retain hidden identity protection. Tanks trigger contacts on their finishing card; their presence supports terrain discovery, package placement and objective occupancy. PAK40 AT range is distinct from its Close Range basic small-arms fire. Vire engineers use the existing detection/path-clearing procedures.

Live fixtures place every authored top-level package alternative twice and compare deterministic state, including gun/rocket projections. This does **not** close every nested placement/follow-up draw or counter-stock source audit. Vehicle-only contact/PAK placement and actual gun ammunition expenditure have focused execution coverage. Vire spotters can select vehicle-only cards, with the printed vehicle preference; complete sniper/vehicle and smoke/mines targeting audits remain pending.

Tank Support pauses the original HQ event for five explicit Row-1 entries. The five M5s use reserved named crews and five ammo each. Entry rejects unknown/missing placements, other rows and more than four friendly vehicles on a non-staging card, including tanks already there. It spends no new command or event draw. One finite M5 platoon is shared by both attempts; a later event cannot duplicate it. Vire counterattacks place concealed PC A on qualifying US-occupied Row-5/adjacent-contact cards, including vehicle-only occupation, within marker limits. Timing remains three inclusive turns and the offensive phase sequence remains intact.

Recovery uses the separate `platoon-vire-integration` bundle for latest/turn-start replay plus presentation. Company/debrief persistence uses `platoon-normandy-vire-standalone`. Accepted tactical/roster slots are not imported or advanced. Quota failures, malformed/older saves and another run in the slot are explicit errors; original save export remains available. Adapter 12 includes mission/content identity and both immutable attempt records, validates them after exact mixed core/vehicle replay, and strictly rejects earlier adapters. Accepted public rules remain 33.

Re-read and visually inspected third-edition pp.17–18 (§3.9), and cross-checked vehicle retreat and stacking on pp.32, 74–75. A failed first attempt can redeploy surviving vehicles on secured cards, with a separate four-vehicle limit. Surviving tank riders deploy dismounted using their original formation/step identities. Surviving vehicles replenish their initial ammunition/equipment and reset action state; AT projections inherit replenished real carrier stocks. Retreat/knockout/brewed-up removal persists, with no replacement tanks or restored retreated passengers. Burning wrecks become retained discovered wreck cover. Terrain, cover, mines, contacts, spotting and unique location rewards remain. Delay Defense returns. Existing reconstitution/experience choices remain available locally. Terminal debrief uses actual crew identities, preserves unresolved withdrawal disposition, and rejects duplicate/stale application after reload.

The controlled full fixture completes ten turns of first-attempt failure, saves/reloads, prepares attempt two, then secures both objectives and clears Rows 1–3 through normal explicit phases for ten-turn success. Both attempts replay exactly and keep detached starting records; duplicate debrief is rejected. **The fixture suppresses contacts through controlled cards and leaves tanks in staging: it is a phase/persistence/objective run, not full combat acceptance.** Real contact/AT exchanges are covered separately by focused fixtures. Complete combat mission runs remain required.

`scripts/vireBrowserQA.js` runs the actual renderer in an isolated headless Chrome profile. Functional checks cover developer startup, initial tanks, reload, all five pending M5 entries, support reload, surviving-vehicle reattempt dropdowns/submission, attempt-two reload and an 850px dialog. Screenshots were inspected in `tmp/vire-browser/`: controls remain in the experimental scrollable dialog; the accepted right panel is unchanged. Full vehicle counter/map presentation, premission deployment UI, all support agencies, keyboard workflow and complete live AT combat browser checks remain open. The integration opt-in is `http://localhost:5173/?vireDev=1` when running the usual development server.

Validation: full existing suite **105 files / 1,484 tests passed** before two added tank-entry/reattempt boundary fixtures; their final focused result is recorded below. Production build and whitespace checks pass, with the existing large-bundle advisory. Still required before normal selection: remaining command/rally/Cease/Shift Fire and HQ succession, Jeep/transport exceptions, full source/counter/VOF/mines/smoke audits, combat runs, complete setup/map/browser presentation and user explicit-phase acceptance. Mission 7 and connected progression remain deferred.

Final focused integration validation: **28 Vire mission tests passed**, including both added stacking/finite-stock boundaries. Browser QA passed again after startup identity validation and mission-specific export naming; the final production build and whitespace check also passed. Six scripted Company Assault runs terminated and reproduced exact replays; their outputs are isolated in `tmp/vire-browser/company-regression/` rather than replacing accepted historical artifacts.

Six scripted KUTF runs also terminated with exact replay. Outputs are isolated in `tmp/vire-browser/kutf-regression/`; the playtest script now accepts the same optional `PLAYTEST_OUTPUT` override as Company Assault, with its default unchanged. No accepted historical playtest exports were overwritten.



## October 10 vehicle orders, setup UI and combat validation

Adapter 13 adds command-phase vehicle rally, Cease Fire and Shift Fire with authorized radio command links, command expenditure, duplicate-order rejection and strict exact replay. Rally is automatic outside VOF and otherwise uses the originator's experience-adjusted rally draw. A pinned tank may activate; pinned AT infantry may not. Normal Pinned Recovery now removes vehicle pins outside VOF. Sniper VOF uses the printed +1 AT modifier. Disembarking riders may select discovered cover on their finishing card, subject to opposing occupants and shared step capacity; formation and personnel identities remain intact.

Visually inspected third-edition printed pp.71–75 and both pages of the supplied Vehicle and Anti-Tank Weapons Chart: command menu, activation, movement/AT actions, VOF, reactions, Quick Shot, vehicle results and transport exceptions. This expands the source audit; it does not certify unimplemented Jeep/radio exceptions, HQ succession, mines/wreck smoke or every transport/targeting case. The Delay Defense no-LOS check now includes actual friendly Vire vehicles, preventing a unit from hiding merely because its only visible opponent is a tank. Accepted missions have no Vire flag and retain their original predicate.

The development UI now offers a fresh premission setup with infantry equipment/assignments, objectives and five Sherman staging choices. Known tanks appear as accessible map counters with ammunition, pin, activation and removal status; unknown enemy vehicles remain concealed. Selecting a friendly tank opens the experimental vehicle controls. The controls dialog uses the game's dark palette and stays scrollable; the accepted right panel remains unchanged. Starting a new development setup resets prior selection/combat presentation. Functional browser checks passed for setup submission, five tank counters, reload, Tank Support, reattempt/reload and an 850px layout; setup and dialog screenshots were visually inspected. This is not yet full keyboard/live-combat browser acceptance.

Focused fixtures cover vehicle command/rally behavior and replay, pin activation restrictions, recovery, hidden counter protection, tank-only Delay Defense LOS, dismount cover capacity and replay. Every friendly/enemy early/late HQ table slot now executes in a deterministic fixture. Complete combat runs use a deliberately flattened battlefield, resolved contact markers and one published PAK40 package, with controlled Action cards. Their scope is normal phase execution, actual tank movement/AT exchanges, outcomes and exact mixed replay; they do not substitute for all nested package draws or unrestricted player acceptance.

Still open before normal M6 selection: optional Jeep/mounted-radio behavior and entitlement, vehicle HQ loss/succession, remaining rider/transport/targeting exceptions, full mines/smoke/wreck and package/counter audits, complete live-combat/keyboard browser validation, and user explicit-phase acceptance. Normal mission selection remains gated; M7 and connected campaign progression remain deferred.

Final validation for adapter 13: **106 files / 1,537 tests passed**, production build and whitespace checks passed. Existing bundle-size advisory remains. Browser QA passed after the dialog styling and fresh-setup presentation reset. Both added combat-bearing fixtures passed: ten-turn success, and first-attempt defeat followed by redeployment and second-attempt success, including actual Sherman movement, enemy AT shots, save/reload and exact replay across attempts. These controlled fixtures begin with resolved contacts and a published PAK40 placement; unrestricted package-heavy combat acceptance remains open.

## October 10 final adapter-14 playtest candidate

This section supersedes the pending implementation statements in earlier dated entries. Normal selection remains disabled. The user has authorized leaving M6 gated for a later explicit-phase playtest while M7 development proceeds.

One company Jeep is supplied by the printed TO&E on p.12, with no separate crew. Setup now permits its optional deployment and platoon assignment, an ordinary two-step passenger load, or the fixed ARTY radio with only the artillery observer aboard. Preview and start reject illegal passenger/location choices. Ordinary passengers retain their original formation/step/person identities and normal infantry fire; moving the Jeep cannot create a second infantry movement order. The mounted radio is usable only aboard the surviving Jeep, remains fixed through the reattempt, and automatically activates the Jeep while the observer is aboard. Actual artillery order eligibility uses this effective radio, including cross-agency calls. Losses preserve unresolved dispositions rather than inventing deaths.

Tank HQ loss removes its impulse; there is no invented automatic HQ succession in the reviewed vehicle rules. CO orders may reach an individual tank through the surviving platoon HQ's BN link; loss of that link leaves the applicable individual/General Initiative alternatives. Jeep authority uses its printed voice/driver exceptions. Pyrotechnic Cease Fire affects vehicles; other signals do not invent vehicle movement.

Vehicle mine checks draw three cards on entry, never solely for leaving. Newly discovered mines can affect vehicles after the vehicle phase. Basic small-arms VOF uses +3; only the selected sniper vehicle receives +1, with its marker retained into the next vehicle phase. Smoke protects applicable basic/AT fire, while Incoming and mine modifiers follow their own chart entries. Hand-grenade VOF is not an AT attack. Tank riders remain valid infantry targets. Wreck cover is discovered, and Jeep destruction/retreat cannot duplicate the original passenger steps. Reaction fire that removes a moving vehicle now closes the pending movement/action instead of trapping the phase. Enemy evacuation/displacement respects US vehicle-only occupation.

### Final source-to-fixture evidence

Visual checks include Normandy pp.12–15, 36–40, 47–48; third-edition pp.17–18, 54, 57–58, 60, 62–65, 70–75; both Vehicle/AT Chart pages and the applicable Enemy Activity/Action Menu player aids. Rendered images are retained under `tmp/pdfs/`. This records inspected source pages, not merely text extraction.

| Source / requirement | Focused execution evidence |
| --- | --- |
| Mission diagram, objectives, original clearing rows, concealed A/B selection (§8.2.1) | `vireFoundation`, `vireSetup`, `vireMission`; shared Normandy knowledge/contact fixtures |
| All package alternatives and real AT projections | `vireMission` parametrized branch fixtures; `vireSourceAudit` R#9 mine branches, all R#10 close/point-blank boundaries and all eight direction draws |
| Counter limits, removed-counter return, optional leaders and illegal placement redraw (§8.3) | `vireSourceAudit`, `normandyPackages`, `cerisy`, `hill192` shared placement fixtures |
| FJ counters/breakdowns, MG inheritance, mortar/leader/rocket restrictions, cover and engineers | `cerisy`, `normandyAmmo`, `normandyEnemyHierarchy`, `hill192`, `vireSetup`, `vireMission` |
| All Delay Defense rows and first-match priority | `vireFoundation`, `vireDelayDefense`; shared LAT/pinned/special-enemy fixtures |
| Forty HQ slots, obligations, visitors, resupply, counterattack limits/timing | `vireMission`, `normandyEvents`, `normandyEventVisibility`; `vireSourceAudit` vehicle-only occupation cases |
| Every support agency/ammunition/caller count, registration bonus, exhaustion and spotter second call | `vireSourceAudit`; shared support and battalion-choice fixtures |
| Vehicle profiles, printed worked example, outcomes and AT draws | `vireVehicleCombat`, `vireATDraws`, `vireVehicleState`, `vireIntegration` |
| Commands, HQ initiatives, transport, terrain, group alternation, reactions, Quick Shot and pin restrictions | `vireOrders`, `vireNormalPhases`, `vireVehicleMovement`, `vireTransport`, `virePassengerCombat`, `vireReleaseGates` |
| Jeep, mounted radio, actual support eligibility, HQ loss, mines, sniper timing, smoke and passenger outcomes | `vireReleaseGates`, `vireSourceAudit` |
| Cargo, basic fire, concentration/spotting and finite ammo | `vireCargo`, `vireBasicFire`, `vireSpot`, shared ammo fixtures |
| Isolated storage, immutable named crew snapshots, duplicate/stale debrief, failures and two attempts | `vireMission`, `vireReleaseGates`, shared campaign-roster/recovery fixtures |
| Complete combat-bearing success and failure → reattempt → success, exact replay/reload | `vireMission` controlled complete-run fixtures; contacts resolved and one published PAK40 preplaced, as disclosed in the adapter-13 evidence |
| Browser setup, five-row map/counters, mounted Jeep, pending M5 entry, crew/cargo controls, explicit reactions/AT actions, keyboard, both observers/all agencies, battalion choice and reload | `scripts/vireBrowserQA.js`; isolated Chrome results/screenshots in `tmp/vire-browser/` |

**Printed omission / disclosed interpretation:** p.40 package 1 does not give its added HMG a separate ammunition quantity. It uses the mission's HMG counter baseline, MG6, matching the explicitly printed package-5 HMG load. §7.18.1 gives carrying/expenditure rules, not a new initial allowance. Six is therefore a disclosed same-counter inference, not a claimed printed package-1 value. A later authoritative correction would require an execution-version change.

The browser audit includes recovery at a pending reaction, enemy Quick Shot follow-ups/removal, an independent enemy AT action, a pending artillery battalion choice before/after reload with unchanged draws/commands, both observer order menus and all agency availability. Desktop and 850px screenshots were visually inspected. This is functional/layout evidence; unrestricted player usability and package-heavy combat acceptance remain the user's playtest.

Adapter 14 strictly rejects older experimental execution records while retaining original export access. Shared rules stay 33, content stays 1; accepted M1–M5/Company Assault/KUTF histories are not migrated. `npm test` now bounds Windows workers and grants complete multi-attempt replay fixtures an appropriate timeout; the earlier five-second failures were timeout failures, not relaxed assertions.

The development URL is `http://localhost:5173/?vireDev=1` with the usual dev server. New development setup preserves export access before replacement. Normal M6 selection can be enabled only after the user's acceptance. M7 planning is tracked separately in `TINCHEBRAY_READINESS.md`; connected progression remains deferred.

Final adapter-14 validation: **108 files / 1,591 tests passed** using the normal `npm test` command. Production build and whitespace checks passed; the existing bundle-size advisory remains. Six Company Assault and six KUTF scripted runs terminated with exact replay, with new outputs isolated under `tmp/vire-browser/` and accepted exports preserved. Browser QA passed with no page errors. The only remaining release gate is the user's explicit-phase acceptance.

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

The user reported that the playtest passes and was substantially complete before the boundary-version change required a fresh run. Acceptance applies to M6; M7 acceptance is not implied. The boundary correction was covered by 39 focused movement/integration/persistence tests and a production build, rather than a new complete user playthrough. Continue fixing demonstrated gameplay defects; defer broader vehicle interaction/presentation refinement until the next project phase.
