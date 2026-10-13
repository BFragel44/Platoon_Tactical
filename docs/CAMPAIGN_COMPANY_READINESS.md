# Normandy company preparation

October 12, 2026: preparation reviewed and accepted. Seven accepted standalone missions remain independent. Connected Standard launch/recovery is a development candidate; normal advancement remains gated pending complete connected validation.

## Source audit

- [x] Normandy pp.12–13: published starting company, experience, six Green replacements, equipment and communications.
- [x] Third-edition pp.80–82, §§12.1–12.7: preparation sequence, promotion restrictions, replacements, combined experience and expendable skills.
- [x] Third-edition p.74, §10.7: vehicle retreat removes passengers for the remainder of the mission; surviving company passengers return between missions without replacement spending. Brewed-up casualties and prisoners remain unresolved.
- [x] M4 special rules: use the same company's preserved M3 terrain, cover and discovered mines; engineers require discovered Row-2/3 mines.
- [x] Campaign-wide preparation source audit and adversarial personnel cases: mission exceptions, patrol skill carryover, rebuilt-HQ transfers, runner-box personnel and deliberately unassigned survivors. This closes the preparation audit, not connected advancement validation.

### Campaign-wide preparation audit — October 11

| Mission | Published preparation exception / handoff | Evidence |
| --- | --- | --- |
| M1 Trévières | Published starting company; one reattempt; ordinary skill expiration and destination supply reset. | Normandy pp.12–19; preparation/roster fixtures. |
| M2 Cerisy | One reattempt; observers replaced through parent organizations; prepared company identities/experience persist. | Normandy pp.20–23; Cerisy deployment/skill fixtures. |
| M3 St. Georges | Three patrols; participant promotions; unused purchased skills carry into the next mission; preserve battlefield for M4. Patrol failure does not end the campaign. | Normandy pp.24–27; real three-patrol replay/handoff fixture. |
| M4 Hill 192 | Same-company M3 cover/mines; remove COP, retain foxholes; Row-2/3 discovered mines enable engineers; omitted units unavailable until next mission. | Normandy pp.28–31; linked battlefield/engineer fixtures. |
| M5 St. Germain | Three patrols; participant promotions and unused purchased skill carryover; no published M5→M6 battlefield reuse requirement. | Normandy pp.32–35; complete patrol replay/preparation fixture. |
| M6 Vire | One reattempt; five initial Shermans/five event Stuarts and engineers are support; replace Jeep automatically; surviving company passengers return. | Normandy pp.36–41 and p.12; actual vehicle factory/passenger fixtures. |
| M7 Tinchebray | Two reattempts; casualties across attempts count once; four initial M10s/five event Stuarts replenish as support. | Normandy pp.42–46; factory/replay and casualty fixtures. |

Cross-cutting source: third-edition §§12.1–12.7 (pp.80–82), §4.3.2 (p.27), §10.7 (p.74), Normandy pp.12–15. No additional Normandy between-mission losses or experience reductions were found under §12.5; do not invent them. Visually checked starting company/assets tables (pp.12–13), patrol MSRs/support tables (pp.26,34), Hill MSRs (p.30), vehicle attachment/support tables (pp.38,44), and preparation sequence (rules p.81). Tactical content remains covered by each mission's readiness guide.

Audit corrections: unused patrol skills retain counters/holder limits without another experience charge; rebuilt-HQ promotion restrictions follow transferred step identities; surviving boxed/dispatched runners return to selectable reconstitution; deliberately unassigned survivors remain available after later deployment/debrief. Used skills, casualties and prisoners are never revived. Offensive skills still expire. Preparation schema 6 rejects earlier candidate records with original-export access; tactical rules remain 34.

## Candidate and storage

File > Campaign company creates a fresh published M1 company. Set up campaign M1 and Resume saved campaign M1 use its separate checkpoint. Terminal debrief guides reconstitution/promotions, replacements and skills. Finishing shows the prepared company; Mission 2 launch is unavailable.

Preparation storage: `platoon-normandy-connected-company`, schema 6. Tactical checkpoints use the `connected-` prefix. Standalone companies are not imported or changed. Earlier preparation schemas are explicitly rejected; original bytes remain exportable. Tactical rules remain 34, vehicle adapter base 34, with strict historical replay/recovery rejection and export access.

## Implemented handoffs

- [x] Immutable mission snapshots/history, unique mission IDs, revision checks and atomic single-record storage; stale/duplicate/invalid actions reject without changing the saved company.
- [x] Persistent people and steps survive transfers. Replacement identities are new; no named casualty is assigned a fabricated wound/death or Veteran return outcome.
- [x] Green/Veteran replacement allowances require successful completion. Actual company casualty/prisoner vacancies limit allocation; parent-organization and temporary withdrawal losses cannot inflate the company allowance.
- [x] Published support ownership survives breakdown and guards. Attachments cannot donate company steps or receive company promotions. Destination observers, HMGs, engineers and vehicle crews replenish separately with new support identities.
- [x] Prior patrol experience awards expire; unused purchased patrol skills carry forward under MSR 1. Promotion eligibility follows participating step identities, including guards; one promotion per eligible step, with Green→Line costing 1 and Line→Veteran costing 3. Rebuilt HQ/staff and new replacements cannot receive spare-point promotions.
- [x] Surviving company passengers return from active/retreated vehicles with their formation identities and recorded experience. Generic LATs become Green; named HQ/weapon Fire Teams rally at their original experience. Casualties and prisoners do not return through this mechanism.
- [x] Company mortar section/team choices preserve surviving identities and strength. Unassigned LATs are not silently reconstituted. Deployment aliases do not create extra personnel.
- [x] Prepared skills enter immutable roster snapshots, setup and attempt records; live use and replay preserve one-use exhaustion. Physical counter/holder restrictions remain enforced.
- [x] M6/M7 initial and event support crews, ammunition, activation and support availability reset through destination content/factories. Old support casualties remain unresolved.
- [x] A completed three-patrol M3 battlefield is stored in the same company's terminal history. Campaign M4 automatically uses it and rejects foreign, missing or modified sources. Standalone M4 loading remains unchanged.
- [x] `commitPreparedCompanyDeployment` prepares and commits the destination roster before deployment. Reloaded next-mission debrief uses that roster; mismatched mission IDs and stale commits reject. This transaction API does not enable connected launch.

## Validation

- [x] Preparation/roster/historical compatibility/Hill foundation fixtures: identities, guards, support ownership, promotion/replacement boundaries, skills, storage failure, duplicate/stale rejection and immutable exports.
- [x] Legal three-patrol M3 → debrief/preparation → same-company M4 setup, exact M3 replay, save/reload and foreign/modified battlefield rejection.
- [x] Complete M5 patrol replay → preparation with final-patrol experience, HMG ownership and unique active memberships.
- [x] Actual M6/M7 factory handoffs: crew losses/withdrawals, surviving passengers, parent replenishment, prepared skills and exact vehicle replay.
- [x] Normal M6/M7 routing and campaign M1 preparation browser checks: switching, abort/restart, interrupted preparation, recovery and narrow layout.
- [x] M5 browser cases and M6/M7 inline vehicle controls, phase filtering, exports and recovery.
- [x] Previous full regression: 117 files / 1,753 tests; six Company Assault and six KUTF policies with exact replay. Separate regenerated rules-34 M4/M5 runs preserve previous outcomes; original rules-33 files remain unchanged.
- [x] Human preparation acceptance: user reviewed and accepted October 12, 2026.
- [x] Connected Standard campaign sequence/launch/recovery candidate behind ?campaignDev=1; ordered same-company starts, committed-start recovery and independent tactical storage.
- [ ] Complete seven-mission connected advancement validation and later-mission live browser checks; normal connected progression remains gated.

Latest campaign-wide audit follow-up: 96 tests pass across preparation, roster, Hill foundation and historical compatibility. The normal-selection/interrupted-preparation browser script passes under schema 6. Latest preparation work changes no tactical resolution/version. Production build passes with the existing bundle-size warning. Readiness evidence should distinguish these focused follow-up checks from the previous full regression run.

## Remaining boundaries

Normal connected progression stays unavailable until end-to-end campaign advancement/carryover validation. Preparation acceptance is complete. No automatic conversion of standalone/historical companies. Vehicle presentation redesign and 3D/audio remain separate later work. Preparation never assigns unsupported individual casualty outcomes.

First-player blocker verification (October 11): Jeep Hold operation, compact tactical storage, original exports, historical rejection, failed-write backup rollback and M7 browser reload validated. Command previews and preparation guidance were refined without ungating connected progression. Rules 35 validation and remaining full manual runs are tracked in `CAMPAIGN_FIRST_PLAYER_LOG.md`.

### First-player preparation and recap refinements

Company preparation now supports prevalidated multi-step transfer batches with one revision-checked commit, promotion/skill previews and step-derived combined-experience summaries. Invalid/stale/failed batches leave assignments unchanged and preserve the older backup. Optional recap popups persist as presentation; required choices, manual history and explicit phase stepping remain. Mission command/glossary guidance and terminal-preparation eligibility messages were added. Eight focused preparation-choice cases, existing campaign/recovery/command fixtures and browser checks pass; rules remain 35. See `CAMPAIGN_FIRST_PLAYER_LOG.md` for actual manual coverage.


### Connected launch follow-up — October 12, 2026

User preparation acceptance is recorded above. Connected orchestration now uses the existing preparation APIs for all seven missions, including locked M3→M4 battlefield ownership and destination support replenishment. The normal application remains limited to M1; ?campaignDev=1 explicitly opts into the unfinished connected candidate.

Source follow-up: third-edition p.80 §12.0 and p.83 §12.8 visually checked. Standard campaigns stop after offensive defeat or abort; combat patrol defeat may continue. Survivor/Hardcore choices are not offered. Completing M7 yields a campaign summary without an eighth destination.

Seven focused orchestration fixtures pass: fresh commit/reload, immutable company snapshot, duplicate/stale rejection, failed tactical mirror recovery, compact backup rollback, Standard stop/continuation boundaries, vehicle checkpoint compatibility, and a synthetic successful-M1 preparation→M2 transaction. The synthetic terminal fixture is not a claimed tactical victory or full campaign playthrough. Existing preparation fixtures cover actual patrol carryover and vehicle factory handoffs.

Isolated browser origin 127.0.0.1:5177: Home→Campaign→fresh company→M1 setup→Start→Home→reload→named campaign Resume exercised. Standalone saves remained absent. Committed-start recovery is offered without allowing another overlapping deployment. Browser testing caught and corrected a missing preview import. Screenshot: output/campaign-gates/connected-m1-recovery.png.

Company records now use the shared lossless recovery codec with atomic backup rollback; plain schema-6 records remain readable, and unsupported domain versions still reject. Tactical rules remain 35. Complete connected runs and later-mission browser recovery checks remain open; no standalone company is imported.

Final validation: full regression **127 files / 1,832 tests pass**; final focused orchestration/navigation/preparation checks **3 files / 20 tests pass**. The full run emitted a Windows fork-worker shutdown warning for `missionMortar`; all assertions passed, and its isolated thread-pool rerun passed all five tests. Actual recorded M3 three-patrol and M4 failed-first-attempt→successful-reattempt audits reproduce exact replay/public AAR/save/reload/debrief and duplicate/stale rejection. Production build and diff whitespace checks pass, with the existing bundle-size warning.


October 12 simulation correction: current rules are now 36. Live M1 exposed invalid colocated PDF joining across friendly troops; each joining weapon now validates its own path. Historical rules35 records still reject for live recovery and remain exportable/read-only auditable. Full tactical validation details and regenerated M4/M5 records are in CAMPAIGN_FIRST_PLAYER_LOG.md. This correction does not clear the connected seven-mission launch gate.
October 12 follow-up: shared rules 37 fixes missing non-firing contact positions, keeps their unspotted markers current after movement, and permits command-paid own-card searches. Original rules36 exports remain preserved and strictly rejected for current live recovery. The connected campaign acceptance boundary is unchanged.
