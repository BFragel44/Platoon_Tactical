# Normandy 4: Hill 192 Offensive

Status, October 8, 2026: accepted standalone after the user reported no issues in the explicit-phase playtest. Hill 192 is enabled in normal mission selection. Current Hill content is 2 / shared rules 29. Source audit, historical reader, complete runs and functional browser recovery checks pass. Automated screenshot/native file-picker evidence remains unavailable as documented below; user playtest acceptance is separate evidence. St. Georges, Cerisy and Trévières remain accepted standalone missions. Preserve their storage, historical exports, recovery access and accepted UI.

## Source review

Authority: `reference/FoF_Deluxe_Normandy_Campaign.pdf`, printed pp.28–31 (July 11 and 12, 1944), general campaign instructions pp.12–15, and counter/breakdown charts pp.47–48. Mission tables, diagram, counters/breakdowns and applicable procedures were visually audited October 7–8. Implementation-specific evidence and corrections are recorded below. Visual source review is not executable validation.

| Source | Published requirement | Implementation / verification gate |
| --- | --- | --- |
| p.28; p.29 diagram | Daylight +0, offensive, ten turns, five columns × four rows, no staging | New authored content and no-staging execution; retain offensive phase stepping |
| p.28 | Secure two selectable Row-4 objectives and clear Rows 2–3 | Do not inherit Cerisy's Rows 1–4 clearing or patrol route objectives; test original-card boundaries |
| p.28 | Two Foxholes per Row-1 card; optional two on one Row-2 card, occupied by some units from one chosen platoon; all others start Row 1 | Validate one forward platoon, carrying/counter limits, explicit reserves and no staging |
| pp.28–29 | Attack position on Row 3 adjacent to either objective; LOA above Row 4, side boundaries outside Columns 1/5, concentration on any card | Setup, map controls, caller registration and readable FLOT boundary |
| p.28; p.29 diagram | Contacts: Rows 4/3 A, Row 2 B, Row 1 C, including US-occupied cards | Initial occupied-card contact processing must not silently skip Row 1 |
| p.28 | Veteran Deliberate Defense; six randomly selected FJ groups 1–6 with printed breakdowns | Preserve finite counter identity and verified Cerisy/M3 breakdown behavior |
| p.28 | Line artillery FO, mortar FO, two Line one-step .30 cal HMG teams, six ammo each | Both observers/networks and authored attachment identity |
| p.29 | Artillery/mortar/cannon HE/WP, one TOT; artillery battalion missions permitted | Agency-specific draws/stock, TOT implementation and pending battalion choice |
| p.30 | Distinct friendly early/late and enemy early/late HQ tables | Every slot, timing, obligations, unavailable agencies and visible explanations |
| p.30 MSR 1 | Campaign uses M3 map, retaining all friendly/enemy cover and discovered mines; redraw mine packages where mines already exist; remove COP, retain its Foxholes | Immutable battlefield handoff and mine-package redraw fixtures |
| p.30 MSR 2; p.15 CSR 10 | Conditional three-step S-rated engineer attachment if M3 discovered mines in Rows 2/3 | Source-bound eligibility and engineer detection/path clearing |
| p.30 MSR 3 | Units not deployed remain unavailable until the next mission | Reserves retain identities and cannot receive impulses; determine interaction with §3.9 rather than auto-deploying reserves |
| p.30 MSR 4 | PC-A counterattack on qualifying US-occupied cards; three inclusive turns of Offensive Assault; alternate table; unchanged offensive sequence | Placement, multiple contacts, concealment, exhaustion and expiration fixtures |
| p.31 | Twelve packages; regular A/B/C and alternate A draws; placement directions | All branches, finite profiles, ammunition and spotting states |
| p.28; rules §3.9 | One permitted reattempt | Battlefield retention, local preparation, exact replay, unique rewards/debrief |

The p.28 text specifies two Row-1 Foxholes per card; the diagram key says up to two. Keep the distinction explicit and use the text's two as the fresh-map default. In a carried map, audit setup additions against retained cover; do not duplicate existing Foxholes blindly.

## Authored mission tables

### Fire support

Values are combat modifiers. Caller draws are artillery FO / mortar FO / CO HQ.

| Agency | Ammunition | Modifier | Caller draws | Missions |
| --- | --- | --- | --- | --- |
| 15th Field Artillery Battalion | HE | −5 | 3 / 2 / 2 | 4 |
| 15th Field Artillery Battalion | WP | −4 | 3 / 2 / 2 | 1 |
| 15th Field Artillery Battalion | TOT | −7 | 3 / 2 / 1 | 1 |
| Battalion Mortar Platoon | HE | −3 | 2 / 3 / 2 | 3 |
| Battalion Mortar Platoon | WP | −3 | 2 / 3 / 2 | 1 |
| Regimental Cannon Company | HE | −4 | 3 / 3 / 2 | 3 |
| Regimental Cannon Company | WP | −4 | 3 / 3 / 2 | 1 |

Artillery battalion missions are available. Audit TOT timing, draw interpretation, pending fire, battalion eligibility, restrictions and expenditure against third-edition rules/player aids before implementation; the support table alone does not establish those procedures. Do not carry M3 illumination stock or Moon restrictions into daylight M4. Concentration uses §7.16.5.

### HQ events

Friendly early table applies Turns 2–6; late applies Turns 7–10. No Turn-1 HQ event.

| Event | Early R#10 | Late R#10 | Practical effect |
| --- | --- | --- | --- |
| Situation report | 1–2 | 1 | First three CO commands report to battalion |
| Comm trouble | 3 | 2 | BN does not activate CO; first two CO commands restore communications |
| Artillery displacing | 4 | 3 | Artillery unavailable this turn |
| Checking up | 5 | 4 | Random higher-HQ staff visits CO card for two turns; BN considered on map |
| Trouble on flank | 6 | 5 | No advance to a row beyond the current leading US unit this turn |
| Flank company ahead | 7 | 6 | Advance at least one unit to a new row; ignore if already Row 4 |
| Screaming for action | 8 | 7 | Advance to a new-row card with PC; ignore at Row 4 or if no reachable PC |
| Cannon displacing | 9 | 8 | Cannon unavailable this turn |
| Mortar displacing | 10 | 9 | Battalion mortar unavailable this turn |
| Ammo resupply | — | 10 | Four of one chosen ammo type on a chosen Row-1 card |

Report, communications restoration and the two advance obligations each earn one XP if completed that turn. There is no penalty for inability due to insufficient commands. Preserve unique event award keys and source-defined eligibility; do not reuse M3's route-point advance obligation.

Enemy early table applies Turns 2–5; late applies Turns 6–10:

- Evacuate casualties: early 1, late 1–2; cards without US troops.
- Displace mortars: early 2 only; cards without US troops.
- Displace leaders: early/late 3; cards without US troops.
- Displace HMGs: early/late 4; cards without US troops.
- Rally: early/late 5–6; rally pinned units, upgrade unpinned LATs.
- Fall back: early/late 7–8; all unpinned units straight back one card.
- Counterattack: early/late 9–10.

Counterattack places PC A on US-occupied cards either adjacent to a card with an unrevealed PC or on Row 4. It changes tactics for three turns including the trigger, then restores Deliberate Defense. A Turn-3 trigger applies through Turn 5 and expires at the start of Turn 6. Regular offensive phase order remains unchanged. Audit repeated triggers, marker supply and contact ordering rather than borrowing Cerisy's placement assumptions.

### Enemy packages

All branches use printed finite counters; redraw unplaceable packages (§8.3). Direction draw R#8: 1–4 front, 5–6 left front, 7–8 right front. Slashes below denote the printed alternatives; audit their selection procedure against campaign general instructions/player aids.

| # | Package and placement | Fire / spotted |
| --- | --- | --- |
| 1 | Mines on triggering card; R#9 1–3 mines only, 4–6 add HMG in Foxholes, 7–9 add sniper in Basic +1 cover at max LOS/range | Yes / no |
| 2 | Incoming artillery −4 or mortar −3 on trigger; spotter in Trenches at max LOS | Yes / no |
| 3 | Sniper in Basic +1 cover at max LOS/range | Yes / no |
| 4 | LMG six ammo or HMG eight ammo in Foxholes; HMG max LOS/range; LMG R#10 1–2 point blank, 3–10 max | Yes / HMG yes, LMG no |
| 5 | Squad infiltration at max LOS under CSR 6 | No / yes |
| 6 | Panzerschreck four ammo or 75mm PAK40 six ammo in Foxholes at max LOS/range | Yes / no |
| 7 | Two squads in Foxholes, optional leader with second; R#10 1–2 close, 3–10 max LOS/range | Yes / no |
| 8 | Two squads in Trenches, HMG eight ammo in Bunker with a squad, at max LOS/range | Yes / no |
| 9 | Two-step squad and leader in Deep Bunker; R#5 1–3 point blank, 4–5 close | No / yes |
| 10 | 75mm Infantry Gun or 88mm FLAK36, six ammo in Foxholes at max LOS/range | Yes / yes |
| 11 | LMG six ammo and 81mm mortar section six ammo together in Foxholes at max LOS/range | Yes / no |
| 12 | LMG six ammo out of cover at max LOS/range | Yes / yes |

Regular draw arrays (R#10 order):

- A: `[4,6,6,7,7,8,9,10,10,11]`.
- B: `[1,1,1,2,2,2,4,4,6,6]`.
- C: `[1,1,1,2,2,3,4,4,4,5]`.
- Counterattack A: `[2,2,2,5,5,5,5,12,12,12]`.

Mortar spotters: three missions; four caller draws for missions two and three. Artillery spotters: two missions; two draws for the second. Audit the first-call procedures against general rules. A squads have six ammo, each squad has two Panzerfaust shots (CSR 7), leaders two rifle-grenade shots. Weapon teams can carry six ammo; an eight-ammo team leaves excess behind when moving. Vehicles remain deferred, but PAK40/Panzerschreck/infantry-gun infantry interactions must be audited against CSR 7 and the AT/vehicle aid; do not omit required package 6 or invent basic infantry fire to make it placeable.

### Engineers

Campaign eligibility requires a minefield discovered in M3 on Row 2 or 3, not merely hidden mine state, a Row-4 mine or a fresh M4 mine. Use the printed three-step S squad and audit experience/carrying/counter identity.

CSR 10: a good-order two-/three-step engineer resolving a new Mines package draws one mine-check card instead of three. To mark a path through a known minefield, infiltrate to/within the card; successful infiltration then draws one mine check. Avoiding attack removes the Mine VOF; hitting a mine leaves it. Failed infiltration causes no exposure but requires three mine-check cards. Repeat attempts are allowed while a good-order two-/three-step engineer survives. In-card attempts need no specific destination. Verify path-marker persistence, casualties/degradation, pinning, command expenditure and exact replay.

## Preserved M3 battlefield loading

This handoff transfers battlefield information; it does not authorize automatic company promotions, replacements, casualty resolution or roster progression.

- [x] Complete battlefield import UI and M4 integration. Schema-1 immutable battlefield records and a terminal M3 File-menu save/export control are implemented; Keep it separate from tactical recovery and roster/debrief storage. Include source mission/run/instance IDs, terminal attempt identity, seed, source content/rules versions and original export provenance.
- [x] Accept a completed three-patrol M3 run (terminal success or defeat), not an active/intermediate patrol or arbitrary player-view screenshot. Validate source identity, dimensions, stable location/cover IDs, completeness and compatibility before loading.
- [x] Extract via a compatible M3 executable replay or a validated battlefield export. Current rules-27 exports reconstruct the terminal map; `exportScoutedBattlefield` now produces a dedicated schema-1 record. If future rules reject the replay, retain original export access and implement an explicit source-version reader if supported; never silently relabel rules versions or use diagnostic comparison as migration.
- [x] Preserve terrain arrangement/elevation/borders, source-defined discoveries and all friendly/enemy cover markers, including former COP Foxholes and discovered minefields. Preserve concealment for any unrevealed terrain; a handoff must not publish hidden enemy units or private source diagnostics.
- [x] Remove COP/MLR/route/primary/concentration patrol controls and replace with M4 controls. Reconcile retained defenses with M4 setup instructions without duplicating cover IDs. M4 removes the COP control, not its Foxholes.
- [x] Initialize M4's own contacts, Veteran enemy counter stock, daylight visibility, support, objectives, event tables and new mission/attempt identity. Do not copy M3 active enemy units, spotting, casualties, expended ammo, temporary illumination, pending fire or patrol XP unless a separate published carryover instruction establishes it.
- [x] Check engineers from discovered Row-2/3 mines before M4 setup; redraw mine packages on already-mined cards without modifying existing mines or consuming optional counter branches prematurely.
- [x] Resolve the boundary case of M3 Lost-in-the-Dark expansions outside the original five-by-four footprint against campaign rules. Neither silently crop retained battlefield discoveries nor expand M4 objectives/required rows without a documented source decision.
- [x] Deploy a fresh immutable M4 roster snapshot for standalone testing, independently of the imported battlefield. Clearly label battlefield import as scouted-terrain testing; it does not advance or alter the accepted M3 company.
- [x] Store source and destination records independently, with atomic writes, replacement backup, failure preservation and unique lineage. Loading M4 cannot overwrite M3 recovery/export or consume/delete the source battlefield.
- [x] Standalone fresh-map mode uses its own seed and normal M4 defenses, with no assertion of campaign carryover. Conditional campaign engineer eligibility must not be fabricated from that fresh map; any test override must be explicit development-only.

Implemented isolated M4 roster slot: `platoon-normandy-hill-192-standalone`; battlefield handoff store: `platoon-normandy-battlefields` with its own schema. Replacement/collision and failure preservation are fixture-tested. Existing accepted M1/M2/M3 slots stay unchanged. The shared tactical recovery slot needs explicit source preservation/backup before a new mission replaces it; a battlefield store alone does not protect that recovery slot.

## Implementation and release checklist

- [x] Read and visually verify pp.28–31 mission diagram/tables and p.15 CSR 10.
- [x] Document fresh-map versus M3-scouted-map setup, separate roster scope and compatibility gates.
- [x] Visually verify relevant printed counters/breakdowns, third-edition TOT/engineer/mine/reattempt procedures and applicable player aids; maintain source-to-fixture links.
- [x] Author a separately versioned Hill 192 scenario/content module; unsupported profiles fail validation. Content 2 / shared rules 29; execution and release gates remain separate.
- [x] Implement five-by-four daylight map, no staging, reserves, two objectives, Row-3 attack position, concentration and correct Rows 2–3 victory boundaries.
- [x] Implement initial occupied-card contacts, every package/alternative, finite counters, Deep Bunker and required infantry/AT profiles without enabling vehicles.
- [x] Implement TOT, all support agencies/caller draws/stock, concentration, eligible battalion choices and required enemy spotter limits.
- [x] Implement conditional engineers, mine-package redraws and CSR 10 path marking.
- [x] Implement all HQ-event slots and three-turn inclusive counterattack/alternate package table, preserving offensive sequencing and hidden contacts.
- [x] Implement immutable battlefield export/import and source-preserving M4 initialization as specified above; no connected roster progression.
- [x] Generalize one-reattempt preparation to M4's no-staging deployment, support, tactics, retained mines/cover and unique location rewards. Reject intermediate/duplicate/stale debriefs.
- [x] Extend setup/briefing/Mission rules/support/event explanations/AAR and recovery without changing accepted panel layout or phase stepping.
- [x] Add deterministic fixtures for every package branch/draw slot/HQ slot; occupied Row-1 contacts; engineer eligibility/checks/failure/path persistence; existing-mine redraw; TOT; support exhaustion; counterattack concealment, exhaustion, timing and restored tactics.
- [x] Test M3 terminal replay → battlefield export → save/reload → immutable M4 import. Include source failures, incompatible versions, missing/tampered records, hidden terrain, cover/mine identity retention, source recovery preservation and independent roster slots.
- [x] Complete authentic successful fresh-map and imported-map M4 runs, failure → permitted reattempt → success, exact replay across attempts, terminal debrief/redeployment and duplicate/stale/storage-failure rejection. See the historical-reader / complete-run evidence below.
- [ ] Run existing regressions/build and Company Assault/KUTF/M1/M2/M3 compatibility checks. Keep strict rejection and original historical export access.
- [ ] Browser-check fresh/import setup, changed objectives, defenders/reserves, support/TOT/engineers, counterattack, preparation, zoom, narrow layouts and actual reload.
- [ ] Expose an explicit development opt-in only after focused validation and complete runs. Normal selection requires the user's subsequent explicit-phase acceptance.

## Source decisions and scope

1. Expanded-terrain carryover policy is implemented below: retain all cards while preserving printed M4 boundaries. Initial fortification additions are covered by retained-cover/setup fixtures.
2. Resolved: TOT eligibility and infantry-only Panzerschreck/PAK40/75mm behavior are audited and fixture-tested below.
3. Resolved: reserves remain unavailable on reattempt; engineers use the printed Line profile and immutable standalone attachment identities. Connected company custody remains deferred.
4. Resolved: frozen accepted rules-27 reader provides historical M3 battlefield extraction; original replay export remains immutable.

Mission implementation, connected roster progression, between-mission casualty dispositions/replacements/promotions, vehicles and Mission 5 remain outside this planning change. Unresolved casualties stay unresolved. No checklist item is complete merely because a previous mission has a similar mechanic.


## October 7 first implementation evidence

Implemented `src/scenarios/hill192Content.js`: published regular/alternate contact arrays, all twelve package definitions/required profiles, early/late HQ tables (enemy late begins Turn 6), daylight/no-staging boundaries, support including TOT's separate CO caller draw, retained-map/engineer requirements and inclusive counterattack metadata. This content does not pretend that currently unsupported Panzerschreck/PAK40/75mm infantry-gun behavior is playable; executable scenario/profile validation and TOT remain open.

Implemented `src/sim/company/battlefieldCarryover.js`: schema-1 immutable terminal M3 records, source rules/content/run/attempt provenance, detached retained terrain/cover/discovered mine state, conditional Row-2/3 engineer eligibility and a separate `platoon-normandy-battlefields` store. It rejects active/intermediate runs, unsupported source versions, duplicate cover/location identities, missing original cards, corrupt stores and conflicting source replacement. Atomic final store writes preserve old records on failure; replacements retain a raw backup. No roster or tactical-recovery key is written. Source enemies, spotting and patrol controls are absent from the handoff. File → Save / export scouted battlefield is enabled only after all three M3 patrols reach a terminal mission outcome. No M4 import UI/catalog entry is exposed yet.

Real-source check: exact replay of `output/st-georges-playtests/st-georges-attached-1.json` exports three patrols, **26 terrain cards, 15 cover markers and discovered mines on r2c1/r3c1**. Lost-in-the-Dark expansion is therefore a demonstrated case, not hypothetical. Export/store preserve those extra cards. M4 loading explicitly rejects expanded footprints pending a source-bound boundary policy; it never crops scouting discoveries. The original twenty-card load path is fixture-tested. The record retains the original source version even if future current rules change; support for reading other versions requires an explicit reader, not a version-field rewrite.

Implemented pure `hill192Setup.js` guards: Row-1 deployment or one selected Row-2 defense, only one platoon forward, sixteen steps/card, explicit reserves and no staging; counterattack candidate cards must be US-occupied and either Row 4 or adjacent to an unresolved, unrevealed PC. These are tested foundations, not yet engine event integration. Existing M1/M2/M3 execution, replay versions and roster slots remain unchanged.

`test/hill192Foundation.test.js` adds 21 fixtures covering content boundaries, draw distributions, carryover immutability/identity, discovered-mine-only engineer eligibility, terminal failure acceptance, expanded-map rejection on load, storage isolation/failures and SMR deployment/counterattack placement. Production build passes (92 modules); broad regression results recorded below when complete. No playable M4 candidate is claimed.

Final regression check for this foundation: **71 files / 831 tests pass**, including all accepted mission fixtures; production build and `git diff --check` pass. Shared rules remain 27. Browser validation of the new terminal battlefield-export control remains pending; no browser evidence is implied by the engine/store checks.


## October 7 special-rule engine / TOT / engineer increment

Shared rules are now **28** for simulation changes. Historical executable replay/recovery remains strictly rejected rather than migrated; original exports remain available. Battlefield schema 1 explicitly accepts M3 records authored under rules 27 or 28 / content 1; this is a validated battlefield-data reader, not executable replay-version rewriting. Exporting a new current M3 terminal run retains rules 28 provenance. Reading an original rules-27 M3 *replay* into a new battlefield export still needs an explicit compatible executable reader; do not treat this data import as that reader.

The materializer now accepts Hill-192-capability-only `battlefield`, `forward_defense` and `concentration` controls. It imports detached locations and the remaining terrain deck, initializes fresh M4 contacts/support, validates original objectives/deployment and rejects these controls on existing missions. The engine retains imported covers/mines, adds missing Row-1/selected-forward Foxholes up to two without duplicating retained ones, records battlefield lineage and engineer eligibility, removes staging through authored map configuration and keeps reserves unavailable. Its generated cover-ID counter advances beyond imported numeric cover IDs to avoid identity collisions. Expanded-map import remains explicitly rejected; export still preserves expanded records.

M4-capability counterattack events now select only qualified US-occupied cards (Row 4 or adjacent to an unrevealed unresolved PC), use finite **A** stock, switch tactics for three inclusive turns, and retain the existing offensive sequence. The mission-authored enemy late table can start at Turn 6; other missions retain their prior Turn-7 switch. Cannon/mortar displacing events retain stocks while disabling the agency for the turn. Source-specific event presentation and exhaustive timing/exhaustion fixtures remain release work.

TOT procedures were read and visually verified in supplied third-edition pp.58–59 (§§7.16.1–7.16.5). `CALL_ARTILLERY_TOT` appears only for agencies with authored TOT stock. It uses the normal target/net/LOS/command restrictions, ammunition-specific caller draws, registered-target bonus, pending fire/short-round/battalion-choice procedures, a separate one-mission stock and −7 modifier. Failures retain stock; exhaustion rejects further calls. Accepted missions without TOT stock do not offer the order.

CSR 10 is integrated for capability-tagged engineer squads: eligible good-order two-/three-step squads draw one card on new mine-package discovery; ordinary movement checks retain three. Infiltration into/within known mines uses one check after success or three after failure, preserves exposure on failure, and marks the path/removes the ongoing minefield only when both infiltration and mine avoidance succeed. A destination-free `Mark path through mines` order permits local attempts. It shares the in-card infiltration action key; one-step/degraded/pinned/exposed squads cannot use it, and mine hits prevent further movement attempts that turn. Pending mine attacks already triggered against formations are not erased by clearing a path. Conditional attachment creation and the printed engineer counter/profile still need integration into the actual M4 scenario.

`test/hill192Engine.test.js` has 16 focused fixtures using a clearly labelled synthetic harness with verified Cerisy profiles; these are not complete M4 force packages or a playable candidate. Coverage includes imported-map exact replay, cover identity preservation, reserves/occupied Row-1 contacts, forward defenses, existing-mine redraw, qualified PC-A counterattack, TOT caller/stock/failure, engineer outcomes/check counts and a real engineer path command stepped through normal phases with exact replay. The broad suite after engine/engineer changes passed **72 files / 846 tests**; the final additional command-replay fixture passes in the 16-test focused rerun. Production build passes (94 modules) and diff checks pass.

Remaining: actual Hill 192 scenario and required AT/75mm profiles, conditional engineer roster/attachments, comprehensive event/support/exhaustion fixtures, source-compatible historical M3 replay reader and expanded-map policy, setup/import/support UI, no-staging reattempt, complete deterministic M4 runs, regression playtests, browser checks and explicit-phase acceptance. Normal M4 selection remains absent/gated.


## October 7 package follow-up and spotter increment

Rechecked the rendered p.31 package table. Package 1 now executes its private R#9 follow-up: 1–3 mines alone, 4–6 HMG in Foxholes, 7–9 sniper in Basic +1 cover, at maximum legal LOS/range. Pure availability considers every branch without spending cards; the actual selected follow-up is checked before publishing mines or checking occupants. Exhausted selected counters reject the package for redraw, rather than leaving partial mine/force state. Existing minefields still reject the complete package. HMG ammunition here uses the counter profile baseline: p.31 does not specify the eight-ammo override printed for packages 4/8. Four focused fixtures cover the three branches, authored-content immutability and exhausted selected HMG rejection.

Spotter creation now reads mission-authored `enemy_spotters` per incoming agency, falling back to the existing profile policy for accepted missions. M4 artillery receives two missions / two subsequent caller draws; mortar receives three / four. The initial incoming fire consumes one mission and records the first call; immutable initial resources retain the full published allowance for reattempt replenishment. Two focused placement fixtures verify these limits, initial expenditure and agency/modifier assignment.

The actual counter-sheet fronts were visually inspected: Panzerschreck SG! / one step / Close; PAK40 S / two steps / Close; 75mm infantry gun SG! / two steps / Very Long; 88mm H / two steps / Very Long; engineer S / three steps / Line. This inspection establishes profile inputs only. Their required infantry behavior, breakdowns and executable M4 profiles remain open.

Focused Hill 192 validation: **43 tests pass** across the foundation/engine files. Production build (94 modules) and diff checks pass. Broad regression verification is pending the timeout follow-up below; ordinary full-suite execution hit the existing five-second replay-test limit. No catalog or playable-candidate gate has been released.

Content validation now checks every mine follow-up profile/cover and requires a complete, nonoverlapping R#9 table. Two fixtures reject unsupported branch profiles and overlapping draw slots. Focused Hill 192 coverage is now **45 tests**.

Final regression verification for this increment: `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=30000` passes **72 files / 855 tests**, with clean exit and no worker-shutdown errors. The ordinary five-second limit timed out on existing multi-attempt replay tests; the longer timeout did not change assertions or simulation behavior. Production build and `git diff --check` pass after the final validation changes. Actual Hill 192 profiles/scenario, conditional attachment, setup/import UI, no-staging reattempt, complete mission runs and browser acceptance remain required before development-candidate exposure.


## October 7 authored scenario, weapons and conditional attachment increment

`src/scenarios/hill192.js` now authors the actual content-1 scenario: five columns/four rows, daylight, no staging, Row-4 objectives/Row-3 attack position, original Rows 2–3 clearing, all twelve packages, published support and HQ tables, Veteran Deliberate Defense, observers and two Line one-step .30 HMG attachments. It has its own baseline company ID and `platoon-normandy-hill-192-standalone` roster-key metadata. It remains explicitly **not playable** and is absent from the catalog; test-only readiness overrides are not development release or acceptance. Actual roster storage/UI wiring remains open. The default units are a fresh company, not the accepted M3 company.

Visually inspected counter fronts/back of supplied sheets and the Vehicle/Anti-Tank Weapons player aid. The new finite profiles provide two Panzerschreck, two PAK40 and two 75mm infantry-gun counters; M4 has two 88mm counters independently of M1's accepted mix. PAK40 and infantry guns have two steps; Panzerschreck one. Both 75mm guns and the 88mm are immobile on the good-order weapon side. The printed backs supply Small Arms / Close fire-team sides. Remaining full breakdown/counter-mix audit is still a source gate; these additions do not enable vehicle combat.

CSR 7, visually verified third-edition p.55 (§7.10.1), and read third-edition p.56 (§7.12), p.60 (§7.18.1D) and p.63 (§8.4.3) drive separate basic and ranged capabilities. PAK40 Small Arms reaches Close Range without consuming GUN ammo, including concentrated fire. Infantry-gun Small Arms also reaches Close Range; its grenade capability reaches Very Long Range and spends one GUN ammo on a ranged attempt, including a miss. Panzerschreck ranged attempts spend one RKT ammo. Package opening fire includes the required grenade attempt, with legal LOS/range, existing PDF, point-blank engagement, intervening-unit and rocket enclosed-cover checks. Enemy activity can select the infantry gun's eligible ranged target without fabricating a Long/Very-Long Basic Small Arms PDF, including during Offensive Assault. Point-blank hand grenades consume no ranged ammo. Depleted SG! profiles retain good order and their Small Arms capability while losing ranged attacks; liable weapon Jam draws negate success and replace the weapon with generic Fire Teams. Existing profiles without these explicit properties retain their prior policy.

Conditional engineer deployment expands the authored force **before** creating the immutable roster snapshot, using the validated imported battlefield's discovered Row-2/3 mines. It provides a Line three-step S squad and stable roster person/step/formation identities. Preview, setup validation and exact replay use the same expansion. Fresh maps and sources with only Row-4 mines receive no engineers. Source records and authored baseline definitions remain immutable. A supplied deployment roster that cannot field the eligible engineer is rejected through normal roster validation; no soldier identities are invented into an existing snapshot.

No-staging reattempt guards now reject explicit deployment, reconstitution and attempt-XP spending for M4's undeployed reserves. Reserves retain their identities/state and are never resurrected by the transition. Named new enemy weapon types join the existing reattempt recovery policy. Focused transition evidence retains cover/mines and unavailable reserve identity, restores Deliberate Defense, clears counterattack timing and replenishes M4's TOT/support inventory. This synthetic terminal-state fixture does not replace the required authentic failure → reattempt → success replay.

`test/hill192Weapons.test.js`: **16 fixtures**, including actual authored setup preview and initial exact replay, gun/rocket opening-fire expenditure, basic-fire ammunition isolation, depletion, point-blank ammunition, enclosed/intervening/PDF restrictions, finite weapon mix/exhaustion, ranged enemy activity, Jam, conditional snapshot/replay and reserve reattempt eligibility. Combined Hill 192 coverage: **61 focused fixtures**. Final broad validation: **73 files / 871 tests pass** with `--pool=threads --maxWorkers=2 --testTimeout=30000`; production build (95 modules) and diff checks pass. Shared rules remain 28. No browser or complete playable-run evidence is claimed.

Remaining gates: full source-to-package/counter-breakdown and event/support fixtures; original objective boundary outcomes; source-compatible historical M3 executable reader and expanded-map policy; source-preserving setup/import UI and isolated storage integration; complete no-staging reattempt/reconstitution/XP replay runs; fresh/imported successful M4 runs, debrief/redeployment and browser checks. Only after these checks may the explicit development opt-in be exposed; normal selection still requires the user's explicit-phase acceptance.


## October 7 gated setup/import and expanded-map increment

`previewMissionSetup` now provides public Hill 192 setup metadata, printed map dimensions and friendly engineer capabilities. The setup renderer offers Row-1 deployment, the selected Row-2 forward defense and off-map reserves; it no longer assumes a staging area for M4. Forward defense and artillery concentration have labelled controls. Engineers/staff may be explicitly attached to a platoon; the engine validates the one-forward-platoon/one-card limit. Changing the forward defense refreshes location choices and returns formations whose old forward card is no longer legal to Row 1. Formation deployment/platoon selects have readable accessibility labels. Hill 192 focuses the first setup control rather than scrolling down to the Close button; accepted missions retain their existing initial-focus behavior. The right panel is unchanged.

Battlefield sources can be read from the separate saved-source store or an imported schema-1 JSON file. Validation occurs before replacing the current preview. The dialog explains fresh-map versus scouted-terrain testing, original source seed/content/rules provenance, conditional engineers and independent company scope. Changing source resets preparation choices explicitly. Import/preview never writes the battlefield store, roster or tactical recovery. Corrupt/incompatible source errors retain original data and the current preview; async file completion cannot reopen a closed dialog. The actual file record is carried into submitted setup/replay, rather than retaining only a mutable store lookup. Original executable replay files are not accepted as battlefield files.

The UI start path now expands the conditional force before taking its fresh immutable company snapshot, avoiding the former missing-engineer roster error. The separate M4 roster slot is explicitly permitted by standalone storage; M1/M2/M3 slots remain intact. M4 roster export has its own filename. Fixtures demonstrate M3 source roster/battlefield-store preservation, raw M3 tactical-recovery backup before explicit replacement, isolated M4 persistence, and prior-record preservation on storage write failure. This is separate storage per record, not a cross-store atomic transaction. No M4 catalog entry or development opt-in has been exposed.

**Expanded-map boundary interpretation:** MSR 1 says to use and retain the M3 map; the M4 diagram still defines a five-column/four-row mission with its printed LOA/boundaries. Therefore retain every scouted expansion card, cover identity and discovered minefield as outside-boundary terrain available for enemy placement, LOS and fire. Do not silently crop the demonstrated expanded maps or enlarge the US deployment area, objectives, required clearing rows or initial contact footprint. This is an explicit implementation interpretation combining the carryover instruction with the printed M4 boundary, not a claim that the source separately spells out expanded-map import. The loader now accepts complete validated expanded records. Original cards may not be falsely marked outside-boundary. Initial M4 contacts are created only on the twenty original cards; setup fortification additions also exclude expansions. Tactical controls/forward defenses/deployment reject outside cards. Public unrevealed-card projection includes the outside-boundary flag, revealing geometry without revealing hidden terrain. The setup uses the authored Row-4 objective limit even if an imported record contains Row-5+ terrain.

`test/hill192SetupUI.test.js`: **8 fixtures**, covering gated no-staging markup, source/engineer provenance, submitted source immutability and forward attachment replay, file rejection, accepted-mission setup separation, isolated storage/recovery backups and write failures, plus expanded geometry/cover/mine retention without additional contacts or objectives and exact replay. The prior foundation fixture now verifies expansion retention instead of the temporary load rejection. Total Hill 192 focused coverage: **69 fixtures**.

Browser evidence: isolated read-only synthetic QA page `tmp/hill192-setup-qa.html`, Edge on the existing local dev server. Verified stored M3 source selection, engineer availability, forward-platoon/Row-2 assignment and successful preview validation; readable dialog at 760 × 900; keyboard Tab wrapping from Close to the first control, Escape close and viewport restoration. QA uses an in-memory source store and never modifies user storage or the accepted active mission. Browser file-picker `setFiles` is blocked by the extension's file-URL access permission; browser upload remains pending, while pure parser/rejection fixtures pass. Browser evidence here is setup-only and does not cover full M4 map/combat/recovery. The temporary QA tab was closed.

Validation: **74 files / 879 tests pass** using `--pool=threads --maxWorkers=2 --testTimeout=30000`; focused setup/weapon rerun **24 tests passes** after text-encoding normalization. Production build and diff checks pass. Shared rules remain 28/content 1. Remaining: compatible historical rules-27 M3 executable-to-battlefield reader, full source/counter/package/event/support audits and fixtures, authentic fresh/imported success and failure→reattempt→success runs, debrief/redeployment and full mission/browser reload checks. Normal and development mission selection remain gated until the guide's complete-run/release requirements are satisfied.


## October 7 historical-reader and complete mission validation

The explicit read-only historical reader executes the accepted M3 **rules 27 / content 1** engine frozen from Git commit `7d8984a8b2be46f71b17a786648fd9652f7a9b56`. `src/sim/company/compat/stGeorgesRules27.js` is reproducibly generated by `node scripts/buildHistoricalReader.js`, which archives that exact commit rather than current dirty sources. `historicalM3Battlefield` validates the original version, executes every original operation with the original strict rejection and immutable attempt-record checks, and exports only a terminal three-patrol battlefield. It never rewrites versions, uses diagnostic comparison or makes historical tactical recovery playable. The setup file parser now accepts an original raw M3 rules-27 replay as well as schema-1 battlefield JSON. Unsupported versions, active/incomplete runs and tampered attempt starts reject without changing the source. `scripts/exportHistoricalM3Battlefield.js` provides an exclusive-create CLI export, refuses the source path and supports acceptance-fixture envelopes. The accepted `st-georges-attached-1` replay reconstructs **26 cards**, retaining its rules-27 provenance and expanded terrain. Original files remain unchanged.

`node scripts/hill192AcceptanceRun.js <seed>` drives authored Hill 192 through public legal orders, explicit segments, support choices and combat resolution. No terminal-state mutation or manufactured victory is used. Set `HILL_SCOUTED` to an original M3 fixture/replay path for imported terrain; `HILL_FORWARD=1` chooses the legal one-platoon Row-2 defense. These are headless validation controls, not a catalog release. Output replays and public-event evidence are in `output/hill192-playtests`:

| Seed | Preparation | First attempt | Final outcome | Orders | Evaluated contacts |
| --- | --- | --- | --- | --- | --- |
| `hill-route-1` | Fresh map | Success | Success, attempt 1 | 65 | 17 |
| `hill-scouted-2` | Original rules-27 M3, 26 cards, engineers | Defeat | Success, attempt 2 | 95 | 17 |
| `hill-forward-3` | Fresh map / one forward platoon | Success | Success, attempt 1 | 45 | 16 |
| `hill-forward-4` | Fresh map / one forward platoon | Defeat | Success, attempt 2 | 102 | 19 |

All four runs finish with both objectives secured and required rows clear, exact replay, checkpoint recovery and duplicate debrief rejection. Both successful reattempts use legitimate generic-team reconstitution and spend **three local experience points**. Fixtures replay the fresh success, imported reattempt success and fresh reattempt success; test roster persistence/redeployment, stale revision and failed storage writes, preserved source slot, immutable first starting record, retained terrain/cover/mines/contacts, refreshed authored support, restored Deliberate Defense and unique reward keys. The imported first-attempt failure is reconstructed independently from its operation prefix and recovered before the transition. Other completed defeat/defeat runs remain diagnostic evidence, not successful-run claims.

The complete-run redeployment fixture demonstrated a debrief defect: a step assigned to prisoner guard duty was left ACTIVE in its original staff slot after another step reconstituted that staff formation. It could overfill the slot on later deployment. Guards now retain `GUARD_UNRESOLVED` step disposition; surviving generic teams retain `FORMATION_UNRESOLVED` until their disposition is explicitly resolved. Their person identities remain preserved and no wound/death is invented. Existing casualty/prisoner handling takes precedence. This is a terminal roster persistence correction; tactical rules remain 28 and original replay execution is unchanged. A focused roster regression and full-run redeployment validate the correction.

The historical reader and complete mission/reattempt run gates are complete. Remaining release work is the full counter/breakdown/package/event/support source audit and exhaustive fixtures, full mission browser/reload checks, then explicit development-candidate exposure and user acceptance. No normal or development catalog entry is enabled by these headless runs. Connected company progression and Mission 5 remain deferred.

Validation for this increment: full regression suite **76 files / 887 tests pass** (`--pool=threads --maxWorkers=2 --testTimeout=30000`), production build **97 modules passes**, and `git diff --check` passes. The subsequent additional guard/generic and first-failure checkpoint assertions are verified in the focused rerun below. No browser acceptance is claimed.

Final focused rerun: **11 tests pass** in `hill192CompleteRuns.test.js` and `campaignRoster.test.js`, including both unresolved guard/generic cases and checkpoint recovery of the genuine first-attempt failure.

## October 8 source audit and functional browser checks

Source review is complete for the implemented infantry-only scope. Campaign pp.12–15, 28–31 and 47–48, supplied counter-sheet fronts/backs, the Vehicle/Anti-Tank player aid, and third-edition reattempt/TOT procedures were visually checked. Vehicles, connected progression and later missions remain deferred. Expanded-map boundary handling remains the documented interpretation above.

| Source | Implementation evidence |
| --- | --- |
| pp.12–13 company, equipment and experience | Normandy baseline/foundation fixtures; Hill source-audit event eligibility fixtures |
| pp.14, 47–48 FJ/mortar breakdowns and Deep Bunkers | Inherited Cerisy breakdown/Deep Bunker fixtures plus Hill authored finite profile/weapon fixtures |
| p.15 CSR 10 and printed engineer counter | Hill engine mine/path fixtures; engineer Close-range assertion in source audit |
| pp.28–29 map, setup, support and concentration | Foundation/setup/complete-run fixtures; all seven support resources × three callers, registered-target bonus and depletion in source audit |
| p.30 all four HQ tables and MSRs | All 40 event slots, command obligations, displacement, visitor duration, resupply and XP in source audit; counterattack qualification/concealment/timing in Hill engine fixtures |
| p.31 all twelve packages | Source-audit fixtures for all packages, alternatives 2/4/6/10, boundary placement draws, all eight direction draws, leader omission and Veteran infiltration; mine follow-ups/finite stock/spotter limits in Hill engine/weapon fixtures |
| Third edition §3.9, pp.17–18 | Exact complete-run reattempts, retained battlefield and registered targets, immutable starts, local XP/reconstitution, restored tactics/support and unique rewards |
| Third edition §§7.16.1–7.16.5, pp.58–59; supplied AT aid | TOT/support and pending battalion fixtures; distinct AT/infantry ammunition, range, enclosed/PDF and Jam restrictions in Hill weapon fixtures |

Corrections: the engineer attachment is Close Range (1), not Long Range (2); unstarred Trouble on Flank earns no HQ-event XP; Screaming for Action requires movement onto a new-row card that actually had an unresolved PC when entered. Hill movement events record that fact for deterministic scoring. Hill reattempts retain concentration/registered-target controls while clearing only the transient fire states specified by §3.9. Accepted missions retain their existing mission-specific behavior. Shared rules advance to **29**, Hill content to **2**; executable historical rejection stays strict, original exports remain unchanged, and the frozen M3 reader still executes original rules 27/content 1. Battlefield data explicitly accepts source rules 27/28/29 with M3 content 1.

`test/hill192SourceAudit.test.js` adds **106 focused fixtures**. These use isolated synthetic placement/caller harnesses and do not substitute for complete runs. Current evidence is in `output/hill192-playtests-v2-r29-final`: fresh success (`hill-route-1`), imported 26-card/engineer defeat→reattempt→success (`hill-scouted-2`), and forward-defense defeat→reattempt→success (`hill-forward-4`). Exact replay, checkpoints, immutable identities, local spending, debrief/redeployment, duplicate/stale rejection and storage failures pass. Earlier output directories retain their original versions rather than being rewritten.

Browser checks used `scripts/hill192BrowserQA.js`, test-only renderer/catalog copies and a dedicated local origin on port 5176. They did not expose M4 in the production catalog or touch the user's accepted-game origin. Verified actual map/briefing, command links/zoom and recovery, explicit mine-combat stepping and result recovery, first-failure preparation and legal reconstitution into Turn 1, both observers, pending artillery battalion choice across reload and two adjacent cards without another command, terminal SUCCESS/AAR recovery, and duplicate debrief rejection after reload. The Mission status now includes TOT stock; Hill counterattack explanations state the qualified placement locations.

Browser preparation found stale cover selections after changing a reattempt deployment card. Cover options now follow that card's discovered covers and clear an invalid old selection; actual legal submission was retested successfully. The accepted right-panel layout is preserved. Responsive checks requested 760×900 (actual CSS viewport 844×1000 at existing browser zoom): DOM geometry showed no page-width overflow and the combat controls remained within the viewport. Earlier setup checks covered keyboard focus wrapping and Escape.

**Remaining browser evidence:** screenshot capture repeatedly times out, so DOM/layout checks are not claimed as visual screenshot QA. Native file-picker automation is blocked by the extension's disabled file-URL access; permissions were not changed. Parser/import rejection fixtures and stored-source UI checks pass, but native upload and final visual checks remain pending. These limitations keep the full browser/release gate open; explicit development exposure and the user's Hill 192 acceptance are still required.

Validation: **77 files / 994 tests pass** with `npx vitest run --pool=threads --maxWorkers=2 --testTimeout=30000`; production build **97 modules passes** and `git diff --check` passes. Existing Vite large-bundle advisory remains. No normal/development selection or user acceptance is claimed.

## October 8 user acceptance and normal selection

The user reported the candidate looked good and, after the explicit-phase acceptance requirement was stated, confirmed: 'No issues found.' This records Hill 192 standalone playtest acceptance and enables its normal catalog entry. The earlier automation limitations remain documented rather than reclassified as passing checks. No simulation/content version changes are needed for this catalog release. Connected progression, vehicles and Mission 5 remain deferred. Focused setup/foundation validation and production build were rerun for the release.
